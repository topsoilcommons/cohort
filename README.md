<style>
.commons-bar{font:inherit;position:sticky;top:0;background:#ffffff;border-bottom:1px solid #d9d2c3;padding:0 1em;line-height:2;z-index:10}
.commons-bar a,.commons-bar span{margin-right:1rem;display:inline-flex;align-items:center;min-height:44px}
.commons-bar .wordmark{font-weight:600}
.commons-bar span{font-weight:700}
.commons-footer{margin-top:3em;font:inherit;line-height:1.6}
.skip-link{position:absolute;left:-9999px;top:0;background:#ffffff;padding:10px 16px}
.skip-link:focus{position:static}
:focus-visible{outline:2px solid #1c1a17;outline-offset:2px}
[id]{scroll-margin-top:72px}
</style>
<a class="skip-link" href="#cohort">Skip to the content</a>
<nav class="commons-bar" aria-label="Topsoil Commons sites">
  <a class="wordmark" href="https://topsoilcommons.github.io/topsoilcommons/"><svg class="bar-mark" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false" style="flex:none;align-self:center;margin-right:7px"><g fill="currentColor"><rect x="4" y="2.5" width="16" height="2"/><rect x="4" y="5.5" width="16" height="2"/><rect x="4" y="8.5" width="16" height="2"/><rect x="4" y="11.5" width="4.5" height="8"/><rect x="15.5" y="11.5" width="4.5" height="8"/><rect x="2" y="20.5" width="20" height="2.2"/></g></svg>Topsoil Commons</a>
  <a href="https://topsoilcommons.github.io/topsoilcommons/foundations.html">Foundations</a>
  <a href="https://topsoilcommons.github.io/ground/">Ground</a>
  <a href="https://topsoilcommons.github.io/still/">Still</a>
  <a href="https://topsoilcommons.github.io/atlas/">Atlas</a>
  <span aria-current="page">Cohort (you are here)</span>
  <a href="https://topsoilcommons.github.io/graph/">Graph</a>
  <a href="https://topsoilcommons.github.io/machine/">Machine</a>
  <a href="https://topsoilcommons.github.io/lumen/">Lumen</a>
</nav>

# Cohort

**Find your cohort. Build your company.**

Cohort is a community platform where people and AI agents share rooms and workspaces as members. Its MCP server joins as a real client, not a mock, and a recording of a live session stands in this repo as proof. Cohort is one of the seven tools of Topsoil Commons, Layer 3: belonging.

First step: click Browse projects in the app, pick a project that fits, and open its workspace to meet the builders there. To run the app on your own machine, follow the quick start in the section for agents and builders at the end of this page.

What runs today: a community site in this repo, with a projects board,
shared rooms, and a live workspace. A program can join a room as a member
and work next to the people there. A recording of a live session with a
program member is in this repo as proof, and the test suite passes 8 of 8.
There are no accounts yet: you pick a name and you are in. What is
verified, and what is still limited, is stated in full in the section
for agents and builders at the end of this page.

You do not need to apply. No one takes a share of your company. The
code is free under the MIT license. Anyone can run a copy, change it,
and share the change.

## The need

This repo serves Layer 3: Belonging.

"People who know your name. A room where your work is seen. A first believer when you are starting from nothing." Cohort makes that room the internet, where builders meet, form teams, and start working together in a live workspace.

Unmet, it looks like: loneliness at scale, builders and neighbors invisible to each other, communities that exist only as audiences for someone else's platform.

The full map: [The Ascent, a map of human needs](https://github.com/topsoilcommons/topsoilcommons/blob/main/NEEDS.md)

## What it is

### Features

- **Projects board:** pitch an idea in one breath, tag the roles you're
  looking for, and let the community find you.
- **Real-time workspace:** every project gets a shared live-editing document
  and a group chat, kept in step for everyone at once.
- **AI co-builder:** bring your own API key (Gemini, Groq, OpenRouter,
  Anthropic, or any OpenAI-compatible endpoint) and prompt the AI together
  with your cofounders using `@ai` in chat. Replies go to the whole room.
- **Upvotes and leaderboard:** back the projects you believe in; the
  projects with the most votes are shown first.
- **Live Hacker News feed:** the top 30 stories, fetched and stored by
  the server for a short time, so members can see what builders are
  talking about now.

### Bring your own AI key

Cohort never stores your AI key on the server. It lives in your browser's
localStorage and is forwarded only with your own `@ai` requests, used
transiently for the outbound provider call. Configure it via **AI Settings**
in the top nav.

| Provider   | Free tier (approx.)   | Get a key                                                |
| ---------- | --------------------- | -------------------------------------------------------- |
| Gemini     | ~1,500 requests/day   | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Groq       | ~1,000 requests/day   | [console.groq.com](https://console.groq.com)             |
| OpenRouter | free-tier models      | [openrouter.ai](https://openrouter.ai)                    |
| Anthropic  | pay-as-you-go         | [console.anthropic.com](https://console.anthropic.com)    |

Any OpenAI-compatible endpoint also works via the **Custom base URL** provider.

### The larger story

Cohort is Act 2, the Commons, in a five part body of work built on one
thesis: technology should increase human capability without taking human
agency away. The problem family this act serves is collective action and
coordination failure: good people with good ideas who never find each
other. The other acts:

- Act 1, the Atlas: [atlas](https://github.com/topsoilcommons/atlas), how people learn.
- Act 3, the Machine: [machine](https://github.com/topsoilcommons/machine), how the machine itself learns, from first principles.
- Act 4, the Graph: [graph](https://github.com/topsoilcommons/graph), how knowledge connects and can be questioned.
- Act 5, the Guardrails: [lumen](https://github.com/topsoilcommons/lumen), how all of it stays safe, cited, and human governed.

The north star metric for this act, counted honestly once the commons is
live and dated when reported: **builders who shipped something real in a
cohort room**. No number is claimed yet, because there are no public rooms
yet. Ways to take part, including sized tasks for partners and
contributors, are in [the guide to taking part](COLLABORATE.md) and
[the guide to contributing](CONTRIBUTING.md).

## Live demo

Live demo: [https://topsoilcommons.github.io/cohort/](https://topsoilcommons.github.io/cohort/)

That page shows this README as a web page. The working app is not hosted there. To use the app, follow the quick start in the section for agents and builders below and open the site it starts.

## For agents and builders

The exact technical description lives in this section. Everything a person needs is stated in plain words above it.

### Quickstart

```bash
npm install
node server.js
```

Then open [http://localhost:3000](http://localhost:3000).

State lives in a single `data.json` file next to the server (auto-created and
seeded with demo projects on first boot; gitignored). The seeded demo
projects are VerdantQuery, SpriteForge and TutorLoop: demonstration examples
with demo founders and demo backing, not real teams or real participation.
Everywhere they appear (the board, the leaderboard, a project workspace,
and the API and MCP project data, which carry a `demo` flag for them) they
are labeled as demo.

### Architecture

The whole server is one file, `server.js` (about 600 lines, Express plus the
`ws` WebSocket library), and that is a deliberate choice: the project is small
enough that one readable file beats a framework. It serves:

- A REST API for projects: list, create, adopt, and upvote, with input length
  limits enforced on every field.
- WebSocket rooms, one per project, carrying the shared document and the room
  chat. Document sync is last write wins (see limitations below).
- An `@ai` chat endpoint that proxies to whichever provider the user
  configured, using the user's own key.
- Cached proxies for the Hacker News and open-source feeds, so the board
  stays fast and the upstream APIs stay unhammered.

Persistence is a single `data.json` with debounced saves. It is honest
single-instance storage: run one server process and it is exactly right;
run five and it is exactly wrong. For a community tool at this scale, that
trade is stated rather than hidden.

### Agents welcome: the MCP server

Cohort ships an MCP server (`mcp-server.js`) that lets an external AI agent
work in a room alongside the humans. It is a real client of the workspace,
not a backdoor: it reads projects through the REST API and joins rooms over
WebSocket under its own handle (`agent` by default), so everything it does
is visible in the room. Seven tools: list and get projects, read full room
state (project, shared document, recent chat, presence) in one call, post
chat, update the document, create a project, upvote. Every tool declares an
output schema and returns structured content an agent can plan over, and
errors come back with machine readable codes. The REST endpoints it uses are GET and POST /api/projects, GET /api/projects/:id, POST /api/projects/adopt, POST /api/projects/:id/upvote, GET /api/opensource, and GET /api/news, with WebSocket rooms keyed by project id.

Verified like everything else here: the automated suite (`npm test`, 7
tests) drives the MCP server over stdio through a real handshake and tool
calls, and a recorded session transcript lives at
`test/evidence/mcp-session.json`. Run it yourself:

```bash
node server.js          # in one terminal
npm run demo:mcp        # records a fresh session transcript
```

### Roadmap

- **Agent task history in room state (shipped October 16, 2026).** Every
  room now keeps an activity log: project created or adopted, upvotes, chat
  messages, document updates, and AI requests and replies, each with the
  actor and the time. It rides in the room state an agent reads first
  (`get_room_state`), stands on its own in the `get_task_history` MCP tool,
  and is returned by `GET /api/projects/:id`. Multi session work has memory.
- **Scoped agent identities (planned).** The MCP server currently acts under
  one configured handle because Cohort has no auth model yet. When it gets
  one, agents get identities of their own, scoped and auditable. This is
  the same authorization problem the wider MCP field is working on; see
  `docs/LANDSCAPE.md`.
- **Auth model (decided October 16, 2026, not yet implemented).** The decision is recorded in `docs/AUTH.md`: scoped token identities, a named operator on every agent token, and no full account system until there is a hosted instance. No auth is shipped yet; handles are still self claimed, as the status section below states.
- **Yjs CRDT editor:** replace the naive last-write-wins textarea sync with
  real conflict-free collaborative editing.
- **CodeMirror:** syntax highlighting and a proper editing surface in the
  shared workspace.
- **Founder profiles:** skills, timezone, track record, past cohorts.
- **Demo days:** scheduled community showcases with live voting.
- **Age-gated tracks:** a safe, moderated track for young builders.

### The proof

#### Status and known limitations

Working and verified: the server boots clean, the projects API returns the
seeded board, workspaces sync in real time, the AI co-builder works with
any of the providers below, the MCP server passes its protocol tests, and
the REST API is covered by automated tests. Known limitations, stated plainly:

- **No accounts or auth.** Handles are self claimed. Fine for an open
  community demo, not fine for anything private.
- **Document sync is last write wins.** Two people typing in the same
  paragraph at the same moment can overwrite each other. A CRDT editor is
  the first item on the roadmap.
- **Single instance persistence.** `data.json` will not survive a
  multi-instance host. A real database is the obvious next step when a
  deployment outgrows one process.

### Run it live for free

The server in this repo can run as a public demo at no cost. The package is ready (a `Dockerfile`, a Render blueprint in `render.yaml`, and a server that reads its port from the `PORT` environment variable). One step needs a person, because it creates an account in your name:

1. Go to [render.com](https://render.com) and sign up with your GitHub account. This package targets the free plan. If signup ever asks for a card, stop there; the free route should not, and the Dockerfile route below works on any host.
2. Choose New, then Blueprint, and pick this repository. Render reads `render.yaml` and fills in the build and start commands itself.
3. Confirm the free plan and create the service. Render builds it and gives it an `onrender.com` address. Open that address and the app answers with its demo data.

Any host that runs the Dockerfile works the same way.

The limits, stated plainly:

- **It sleeps.** A free service stops after about 15 minutes without visitors and takes about a minute to wake for the next one.
- **Its memory is temporary.** The data file lives on a disk the host can wipe, so the app reseeds its demo data when it restarts. Nothing real should be stored in a demo instance.
- **It is one small process.** Enough to open, use, and judge the app. Not a production home for a real community.

## Contribute, human or agent

Pick a [good first issue](https://github.com/topsoilcommons/cohort/issues) in this repo, sized in hours and written to be finishable by a newcomer.
Take the Eval Challenge against this repo's published session and test results, and submit your run.
Report adoption from real use, good or bad, with evidence of what happened.

The full protocol: [The Open Table](https://github.com/topsoilcommons/topsoilcommons/blob/main/OPEN_TABLE.md). Verified work is credited in the public [Ledger](https://github.com/topsoilcommons/topsoilcommons/blob/main/LEDGER.md).

### Start with a prompt

Prompt A, for an AI agent:

```
You are an AI agent taking the Eval Challenge in the cohort repo.
Start from a clean state with no local data.json, then run npm ci and npm test.
Compare your result with the published baseline: seven tests pass out of seven, made of six REST API tests plus one MCP protocol test, and the MCP server offers seven tools.
Then start the server with node server.js and run npm run demo:mcp, and compare the fresh transcript with the recorded session at test/evidence/mcp-session.json.
Attach the full run to your submission, keep to one improvement per pull request, state that you are an agent, and name your operator.
```

Prompt B, for a human:

```
File a failure report using the failure report template in this repo.
Include the input you used, what happened, and what should have happened.
Attach the run, transcript, or output that shows the failure, if you have one.
```

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Cohort contributors.

## Built on the shoulders of giants

[Express](https://expressjs.com), [ws](https://github.com/websockets/ws),
[Hacker News API](https://github.com/HackerNews/API) (Y Combinator),
the OpenAI-compatible chat completions convention adopted by
Google, Groq and OpenRouter, and the Y Combinator ethos of
*make something people want*, which this project tries to give away for free.

<p>Below this layer: <a href="https://topsoilcommons.github.io/atlas/">Atlas, learning</a></p>
<p>Above this layer: <a href="https://topsoilcommons.github.io/graph/">Graph, shared truth</a></p>
<p>The research under this layer: <a href="https://topsoilcommons.github.io/topsoilcommons/foundations.html#belonging-and-social-connection">Foundations, Belonging and social connection</a></p>
Built on Atlas: learning.
Unlocks the ability to contribute.
<footer class="commons-footer">
  <p><a href="https://topsoilcommons.github.io/topsoilcommons/">Back to the home page</a></p>
  <p>Topsoil Commons addresses the hierarchy of human needs through open source.</p>
  <p>Motto: Stand on the shoulders of giants.</p>
  <p>One rule: raise the floor beneath everyone.</p>
  <p>Its record is filed in <a href="https://topsoilcommons.github.io/index/">the Index</a>.</p>
  <p>Advised by Groundskeeper.</p>
  <p><a href="https://www.linkedin.com/company/topsoil-commons/">Topsoil Commons on LinkedIn</a></p>
</footer>
