# The 110 percent checklist: Cohort

Ascent alignment: this repo serves Layer 3: Belonging in the Ascent needs map, aligned October 15, 2026.

State as of October 15, 2026. Every line carries its evidence; a line without evidence does not count as done. This file is maintained by the daily evolution pass.

## 100 percent: completeness
- [x] Every file of the verified local publish tree present on GitHub, proven by tree diff: 19 of 19 publish tree files present (October 15, 2026), plus AGENTS.md and .github/workflows/ci.yml added since the publish tree snapshot, for 21 tracked files total
- [x] README accurate against the code, including the MCP server claim (7 tools with output schemas, verified by the test suite below)
- [x] LICENSE present
- [x] COLLABORATE.md present
- [x] CONTRIBUTING.md present
- [x] CI workflow present (.github/workflows/ci.yml: API tests, then the server is started and the MCP live session demo runs)

## The extra 10 percent
- [x] CI green on GitHub runners (latest runs at f3e1c3d successful, including the MCP demo step that was fixed in the open after its first run failed without a running server)
- [x] Repo description and topics set (description states the MCP room claim; topics: ai-agents, collaboration, education, mcp, model-context-protocol, verified by API read back October 15, 2026)
- [x] Good first issues open: #1 add a REST API test, #2 record a demo session and write the walkthrough (both labeled good first issue, sized in hours)
- [x] Tagged release: v0.1.0, first verified baseline (published, marked Latest)
- [x] Live demo: https://topsoilcommons.github.io/cohort/ (HTTP 200 verified October 15, 2026; the Pages landing renders the project README until a dedicated demo page is pushed, as recorded in the portfolio tracker)

## Verification baseline (October 15, 2026)
- `npm test` from a clean state (no local data.json, the same state CI starts from): 7 of 7 tests pass locally (6 REST API tests plus 1 MCP protocol test: handshake, tool list with output schemas, and real tool calls)
- Repeat run defect, fixed October 15, 2026: reproduced first, a clean run passed 7 of 7 and a second `npm test` on the same local data.json failed 1 of 7, the upvote test getting 409 where it expected 200. Root cause in plain words: the server loads data.json at boot and saves every change to it, the upvote test votes with the fixed handle test_voter, and the suite never reset that file, so the vote from the first run was still recorded when the second run started and its first vote correctly conflicted. The application code was not at fault. What changed: the fix is in test/api.test.js only, plus this checklist record. Its before hook now moves any existing data.json aside before the server starts, so the server seeds a fresh fixture file, and its after hook waits for the server to exit, deletes the test run file, and restores the original data.json untouched (its hash was unchanged after each proof run). No assertion was weakened and the upvote test still expects 200 on the first vote and 409 on the second. Evidence: two consecutive `npm test` runs on the same working tree both passed 7 of 7, and a further run from a clean state (no data.json) also passed 7 of 7.
- Recorded agent session: test/evidence/mcp-session.json (agent message verified landed in the room)

## Upgrade queue (from the evolution strategy, in order)
Each item needs a short spec with a verify by line before a daily pass picks it up. Ranking follows the weakest measured area first.
- [x] Make the test suite repeatable on a dirty local data.json (isolated test state, not a unique voter handle), so `npm test` passes on repeat runs, not only from clean state. Found and fixed October 15, 2026, see verification baseline above for the root cause and the two consecutive passing runs as evidence.
- [x] Agent task history in room state: shipped October 16, 2026. Every room keeps an activity log (created, adopted, upvote, chat, doc, ai_request, ai_reply; actor, timestamp, short detail capped at 120 characters, log capped at 200 entries), recorded in server.js at each mutation point, migrated in for rooms that predate it, exposed in the WebSocket init state, in GET /api/projects/:id (last 50), in the MCP get_room_state tool, and in a new MCP get_task_history tool. Evidence: npm test 8 of 8, twice in a row on the same working tree (new REST test records creation and upvote in order; the MCP protocol test now pins 8 tools and asserts the agent's own chat post lands in the task history).
- [x] Auth model decision documented: October 16, 2026, in docs/AUTH.md. Decision, not an implementation: scoped token identities next (agents first, through the MCP server), a named operator on every agent token, minimum scopes room:read, room:chat, room:doc, project:create, project:upvote, token issuance and revocation human only, full account system and OAuth rejected until there is a hosted instance, and the AI key rule restated as absolute (no provider key is ever stored server side). The migration path keeps the shipped task history format unchanged: same actor strings, one optional operator field on agent entries, no history rewrite. Open questions left for Joshua are listed at the end of docs/AUTH.md, including whether the hosted demo waits for auth and how outside agents get tokens. Evidence: docs/AUTH.md itself, written against the server.js and mcp-server.js read the same pass, and npm test 8 of 8 after the change (docs only, no code touched).
- [ ] Scoped agent identities for the MCP server, implemented to docs/AUTH.md (the next item; this is the implementation half of the original queue line above)
- [ ] Uptime demo instance, so the workspace itself (not only the Pages landing) is reachable without running a local server. Deployment package prepared October 15, 2026 (see the live deployment package note below); one account signup step remains, and only Joshua can take it, so the instance is not live yet
- [x] Session recordings beyond the committed MCP transcript: refreshed October 17, 2026. The evidence runner (scripts/run-mcp-session.cjs) now also reads the room's task history back through get_task_history after posting, and the committed transcript (test/evidence/mcp-session.json, recorded 2026-10-17T13:24:32Z, 15 messages) shows the agent's chat entry in that history (agentMessageLanded and taskHistoryIncludesAgentPost both true). One finding recorded in the runner: the activity log stores a short summary by design, never message text, so the history check pins the session's chat entry by kind and actor. Evidence: npm test 8 of 8 after the change.
- Gate note, October 17, 2026, scoped agent identities: still gated on Joshua's answers to the open questions in docs/AUTH.md (token issuance route, agents only or humans too, token lifetimes). The October 17, 2026 pass logged the gate and took this recording item instead, per the skip rule.
- Landscape pointer, October 17, 2026 (evening): an MCP authorization and agent identity micro scan ran and is recorded in docs/LANDSCAPE.md (evening scan section); the gated items above remain gated and unchanged.

## Live deployment package (prepared October 15, 2026, not yet live)
- What was tried first: running the server on the build VM and exposing it. The VM has no public address of its own. The Tailscale client on the VM is outbound only and cannot host or funnel. Cloudflared is installed, but its account free quick tunnel could not be created from this network: two attempts (default transport and http2) failed at the tunnel request with a TLS handshake error, because this network forces all traffic through an HTTP proxy that cloudflared does not use. No existing Cloudflare, Deno, Fly, Render, Railway, Vercel, or Replit sign in or CLI exists on the VM to deploy with, and no new account may be created in Joshua's name by an agent.
- What the package contains: a Dockerfile (node:22-alpine, npm ci, node server.js), a .dockerignore, a render.yaml blueprint for a free tier web service (health check at /api/projects), one server change (the port now reads the PORT environment variable, default 3000, so free hosts that assign a port work unchanged), and a README section, "Run it live for free", with the exact steps and limits.
- Proof the package did not break anything: npm test passes 7 of 7 from a clean state after the port change, and the server was booted on an assigned port (PORT=3107) and answered GET /api/projects with the seeded demo projects.
- The one remaining step, Joshua's alone: sign up at render.com with the GitHub account (no card on the free route), choose New then Blueprint, pick this repo, and confirm the free plan. Render then builds it and issues the public address.
- Limits of the free tier, as recorded in the README: the service sleeps after about 15 minutes idle and takes about a minute to wake; the disk is temporary, so the app reseeds its demo data on restart; one small process, a demonstration, not a production home.

## Working agreements
- AGENTS.md in this repo governs how changes are made and proven here.
- Known limits, stated in the README and not hidden here: no accounts or auth yet, document sync is last write wins, and persistence is a single data.json file for one server process.
