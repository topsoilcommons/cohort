// API and MCP protocol tests for Cohort.
//
// Boots the real server once (it listens on port 3000 and writes its
// runtime data.json next to server.js, which is gitignored), runs the
// REST suite, then drives the MCP server over stdio exactly as an agent
// client would. Run with: npm test
//
// Note: test isolation for the runtime data file. The server loads
// data.json at boot and persists every change to it, so a suite that
// starts from whatever a previous run left behind is not repeatable:
// the upvote test, for example, votes with the fixed handle test_voter,
// and that vote stays in data.json after the first run, so a second
// run gets a 409 on its first vote instead of a 200. To give each run
// a known fixture state, the before hook moves any existing data.json
// aside before the server starts, so the server seeds a fresh file,
// and the after hook deletes the test run file and restores the
// original data.json untouched. Tests create one project through the
// public API; it persists only in that throwaway test run file.

'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://localhost:3000';
const DATA_FILE = path.join(ROOT, 'data.json');
const BACKUP_FILE = path.join(ROOT, 'data.json.test-backup');

let server;
let serverExit;
let movedDataAside = false;

function moveDataFileAside() {
  // A backup left behind means a previous run stopped before its
  // after hook could restore it. Recover the original file first.
  if (fs.existsSync(BACKUP_FILE)) {
    fs.rmSync(DATA_FILE, { force: true });
    fs.renameSync(BACKUP_FILE, DATA_FILE);
  }
  if (fs.existsSync(DATA_FILE)) {
    fs.renameSync(DATA_FILE, BACKUP_FILE);
    movedDataAside = true;
  }
}

function restoreDataFile() {
  fs.rmSync(DATA_FILE, { force: true });
  if (movedDataAside && fs.existsSync(BACKUP_FILE)) {
    fs.renameSync(BACKUP_FILE, DATA_FILE);
  }
  movedDataAside = false;
}

async function waitForServer(tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}/api/projects`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Server did not come up on port 3000');
}

before(async () => {
  moveDataFileAside();
  server = spawn('node', ['server.js'], { cwd: ROOT, stdio: 'pipe' });
  serverExit = new Promise((resolve) => server.once('exit', resolve));
  await waitForServer();
});

after(async () => {
  if (server) {
    server.kill('SIGTERM');
    // Wait for the server to exit before touching data.json: it
    // flushes its state to that file as it shuts down, and restoring
    // any earlier would let that flush overwrite the restored file.
    const exited = await Promise.race([
      serverExit.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
    if (!exited) {
      server.kill('SIGKILL');
      await serverExit;
    }
  }
  restoreDataFile();
});

// --- REST API ---------------------------------------------------------------

test('GET /api/projects returns the seeded board without room internals', async () => {
  const res = await fetch(`${BASE}/api/projects`);
  assert.equal(res.status, 200);
  const projects = await res.json();
  assert.ok(Array.isArray(projects) && projects.length >= 3, 'seed projects present');
  const seeded = projects.filter((proj) => proj.id.startsWith('seed-'));
  assert.ok(seeded.length >= 3 && seeded.every((proj) => proj.demo === true), 'seeded projects are flagged as demo data');
  const p = projects[0];
  for (const field of ['id', 'name', 'pitch', 'founder', 'tags', 'upvotes']) {
    assert.ok(field in p, `public project has ${field}`);
  }
  assert.ok(!('doc' in p) && !('chat' in p) && !('upvoters' in p), 'no room internals leak into the board view');
});

test('GET /api/projects/:id returns one project and 404s on a bad id', async () => {
  const res = await fetch(`${BASE}/api/projects/seed-verdant`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).name, 'VerdantQuery');
  const missing = await fetch(`${BASE}/api/projects/does-not-exist`);
  assert.equal(missing.status, 404);
});

test('POST /api/projects validates required fields', async () => {
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Only a name' }),
  });
  assert.equal(res.status, 400);
});

test('POST /api/projects creates a project that can be fetched', async () => {
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test Project', pitch: 'Created by the automated test suite.', founder: 'test_runner', tags: ['tests'] }),
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.ok(created.id);
  assert.equal(created.demo, false, 'a project created by a user is not flagged as demo data');
  const check = await fetch(`${BASE}/api/projects/${created.id}`);
  assert.equal(check.status, 200);
  assert.equal((await check.json()).name, 'Test Project');
});

test('upvote works once per handle, then conflicts', async () => {
  const url = `${BASE}/api/projects/seed-tutorloop/upvote`;
  const opts = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: 'test_voter' }) };
  const first = await fetch(url, opts);
  assert.equal(first.status, 200);
  const body = await first.json();
  assert.equal(body.ok, true);
  const second = await fetch(url, opts);
  assert.equal(second.status, 409);
});

// Why this test exists: the activity log is the room's task history. An
// agent returning to a room plans from it, so creation and upvote must be
// recorded in order, with the actor named, on the single-project read
// (the board list stays free of room internals, per the first test).
test('room activity log records creation and upvote in order', async () => {
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Activity Project', pitch: 'Created by the automated test suite to check the activity log.', founder: 'test_runner', tags: ['tests'] }),
  });
  assert.equal(res.status, 201);
  const created = await res.json();

  const vote = await fetch(`${BASE}/api/projects/${created.id}/upvote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ handle: 'activity_voter' }),
  });
  assert.equal(vote.status, 200);

  const check = await fetch(`${BASE}/api/projects/${created.id}`);
  assert.equal(check.status, 200);
  const project = await check.json();
  assert.ok(Array.isArray(project.activity), 'single project read carries the activity log');
  assert.deepEqual(project.activity.map(a => a.kind), ['created', 'upvote']);
  assert.equal(project.activity[0].actor, 'test_runner');
  assert.equal(project.activity[1].actor, 'activity_voter');
  assert.ok(project.activity.every(a => typeof a.ts === 'number' && a.detail.length > 0));
});

test('POST /api/projects/adopt rejects a non-GitHub repo URL', async () => {
  const res = await fetch(`${BASE}/api/projects/adopt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ repo: 'https://example.com/not/github', handle: 'someone' }),
  });
  assert.equal(res.status, 400);
});

// Why: the adopt success path and its duplicate guard had no coverage; only
// the non-GitHub rejection was tested, so a regression that double-lists a
// repo or drops the adopted activity entry would pass the suite silently.
test('POST /api/projects/adopt creates a squad for a GitHub repo, then returns the same one', async () => {
  const repo = 'https://github.com/example/adopt-me';
  const first = await fetch(`${BASE}/api/projects/adopt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ repo, handle: 'adopter_test' }),
  });
  assert.equal(first.status, 201);
  const created = await first.json();
  assert.equal(created.repo, repo);
  assert.equal(created.founder, 'adopter_test');
  assert.equal(created.demo, false);

  const fetchedRes = await fetch(`${BASE}/api/projects/${created.id}`);
  const fetched = await fetchedRes.json();
  assert.equal(fetched.activity.at(-1).kind, 'adopted');

  const boardBefore = await (await fetch(`${BASE}/api/projects`)).json();
  const second = await fetch(`${BASE}/api/projects/adopt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ repo: `${repo}/`, handle: 'someone_else' }),
  });
  assert.equal(second.status, 200);
  const again = await second.json();
  assert.equal(again.existing, true);
  assert.equal(again.id, created.id);
  const boardAfter = await (await fetch(`${BASE}/api/projects`)).json();
  assert.equal(boardAfter.length, boardBefore.length);
});

// --- MCP server over stdio ----------------------------------------------------

function mcpClient() {
  const proc = spawn('node', ['mcp-server.js'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
  const rl = readline.createInterface({ input: proc.stdout });
  const pending = new Map();
  let nextId = 1;
  rl.on('line', (line) => {
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  const call = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, resolve);
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => reject(new Error(`MCP call ${method} timed out`)), 15000);
  });
  const notify = (method) => proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n');
  return { proc, call, notify };
}

test('MCP server: handshake, tool list with output schemas, and real tool calls', async () => {
  const { proc, call, notify } = mcpClient();
  try {
    const init = await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cohort-tests', version: '1.0.0' } });
    assert.equal(init.result.serverInfo.name, 'cohort-mcp');
    notify('notifications/initialized');

    const list = await call('tools/list', {});
    const names = list.result.tools.map(t => t.name).sort();
    assert.deepEqual(names, ['create_project', 'get_project', 'get_room_state', 'get_task_history', 'list_projects', 'post_chat', 'update_doc', 'upvote_project']);
    for (const tool of list.result.tools) {
      assert.ok(tool.outputSchema, `${tool.name} declares an outputSchema`);
    }

    const projects = await call('tools/call', { name: 'list_projects', arguments: {} });
    assert.equal(projects.result.isError, false);
    assert.ok(projects.result.structuredContent.projects.length >= 3);
    assert.ok(
      projects.result.structuredContent.projects.filter((proj) => proj.id.startsWith('seed-')).every((proj) => proj.demo === true),
      'seeded projects carry the demo flag through the MCP tools'
    );

    const state = await call('tools/call', { name: 'get_room_state', arguments: { project_id: 'seed-verdant' } });
    assert.equal(state.result.isError, false);
    assert.match(state.result.structuredContent.doc, /VerdantQuery/);
    assert.ok(Array.isArray(state.result.structuredContent.chat));

    const posted = await call('tools/call', { name: 'post_chat', arguments: { project_id: 'seed-verdant', text: 'Automated MCP test message.' } });
    assert.equal(posted.result.structuredContent.posted, true);
    const tail = posted.result.structuredContent.chatTail;
    assert.ok(tail.some(m => m.text === 'Automated MCP test message.'), 'the agent message is in the room history');

    const history = await call('tools/call', { name: 'get_task_history', arguments: { project_id: 'seed-verdant' } });
    assert.equal(history.result.isError, false);
    assert.ok(
      history.result.structuredContent.activity.some(a => a.kind === 'chat' && a.actor === 'agent'),
      'the agent chat post is recorded in the room task history'
    );
    const stateAfter = await call('tools/call', { name: 'get_room_state', arguments: { project_id: 'seed-verdant' } });
    assert.ok(Array.isArray(stateAfter.result.structuredContent.activity), 'room state carries the activity log');

    const missing = await call('tools/call', { name: 'get_project', arguments: { project_id: 'nope' } });
    assert.equal(missing.result.isError, true);
    assert.equal(missing.result.structuredContent.error, 'not_found');
  } finally {
    proc.kill('SIGTERM');
  }
});

// Why: update_doc had no coverage at all; a regression that dropped the edit or its activity entry would pass silently, and agents plan from the shared doc.
test('MCP server: update_doc replaces the shared document and records it in the task history', async () => {
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Doc Project', pitch: 'Created by the automated test suite to check the MCP doc tool.', founder: 'test_runner', tags: ['tests'] }),
  });
  assert.equal(res.status, 201);
  const created = await res.json();

  const { proc, call, notify } = mcpClient();
  try {
    const init = await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cohort-tests', version: '1.0.0' } });
    assert.equal(init.result.serverInfo.name, 'cohort-mcp');
    notify('notifications/initialized');

    const docText = '# Doc Project notes\n\nUpdated by the automated MCP test.';
    const updated = await call('tools/call', { name: 'update_doc', arguments: { project_id: created.id, text: docText } });
    assert.equal(updated.result.isError, false);
    assert.equal(updated.result.structuredContent.updated, true);
    assert.equal(updated.result.structuredContent.doc, docText);

    const state = await call('tools/call', { name: 'get_room_state', arguments: { project_id: created.id } });
    assert.equal(state.result.isError, false);
    assert.equal(state.result.structuredContent.doc, docText);

    const history = await call('tools/call', { name: 'get_task_history', arguments: { project_id: created.id } });
    assert.equal(history.result.isError, false);
    const last = history.result.structuredContent.activity.at(-1);
    assert.equal(last.kind, 'doc');
    assert.equal(last.actor, 'agent');
    assert.match(last.detail, /Document updated by agent/);
  } finally {
    proc.kill('SIGTERM');
  }
});

// Why: create_project and upvote_project were the last two of the 8 MCP tools the
// suite listed but never called; a regression in either would pass silently, and
// creating and backing projects is the board's core agent workflow.
test('MCP server: create_project and upvote_project work end to end', async () => {
  const { proc, call, notify } = mcpClient();
  try {
    const init = await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cohort-tests', version: '1.0.0' } });
    assert.equal(init.result.serverInfo.name, 'cohort-mcp');
    notify('notifications/initialized');

    const created = await call('tools/call', { name: 'create_project', arguments: { name: 'MCP Created Project', pitch: 'Created by the automated MCP test to check the create and upvote tools.', founder: 'test_runner', tags: ['tests'] } });
    assert.equal(created.result.isError, false);
    const project = created.result.structuredContent;
    assert.ok(project.id, 'the created project carries an id');
    assert.equal(project.name, 'MCP Created Project');
    assert.equal(project.founder, 'test_runner');
    assert.equal(project.upvotes, 0);

    const fetched = await call('tools/call', { name: 'get_project', arguments: { project_id: project.id } });
    assert.equal(fetched.result.isError, false);
    assert.equal(fetched.result.structuredContent.id, project.id);
    assert.equal(fetched.result.structuredContent.name, 'MCP Created Project');

    const upvoted = await call('tools/call', { name: 'upvote_project', arguments: { project_id: project.id, handle: 'test_runner' } });
    assert.equal(upvoted.result.isError, false);
    assert.equal(upvoted.result.structuredContent.ok, true);
    assert.equal(upvoted.result.structuredContent.upvotes, 1);

    const repeat = await call('tools/call', { name: 'upvote_project', arguments: { project_id: project.id, handle: 'test_runner' } });
    assert.equal(repeat.result.isError, true);
    assert.equal(repeat.result.structuredContent.error, 'conflict');

    const history = await call('tools/call', { name: 'get_task_history', arguments: { project_id: project.id } });
    assert.equal(history.result.isError, false);
    const kinds = history.result.structuredContent.activity.map(a => a.kind);
    assert.deepEqual(kinds, ['created', 'upvote']);
    assert.equal(history.result.structuredContent.activity[0].actor, 'test_runner');
    assert.equal(history.result.structuredContent.activity[1].actor, 'test_runner');
  } finally {
    proc.kill('SIGTERM');
  }
});
