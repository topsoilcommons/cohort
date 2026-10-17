# Landscape: the Model Context Protocol and agent native workspaces, late 2026

A short scan run on 2026-10-14 to ground this project's roadmap. Sources are
linked; the projection at the end is labeled as projection.

## Where the field is

**MCP became the default agent interface.** Introduced by Anthropic in
November 2024, the protocol was donated to the Linux Foundation's Agentic AI
Foundation in December 2025 and is now the cross-vendor standard, supported
across Anthropic, OpenAI, Google, Microsoft, and the major editors. By
mid 2026 there were over 10,000 public MCP servers and roughly 97 million
monthly SDK downloads.

- https://andrew.ooo/answers/mcp-model-context-protocol-enterprise-adoption-july-2026/
- https://forkast.news/glossary/model-context-protocol-mcp/

**The protocol itself is moving toward stateless, typed, and governed.**
The July 2026 spec revision removed the session handshake so remote servers
can sit behind ordinary load balancers, with servers passing explicit
handles in tool arguments instead. Typed tool outputs (outputSchema and
structuredContent) moved from good practice into the spec's orbit
(SEP-2106), and a Tasks extension (SEP-1686) covers long running agent work.
Design guidance has converged on the same points: small sharp tool
surfaces, structured and composable outputs, pagination and server side
filtering so agents do not pay tokens for rows they do not need, and
machine readable errors rather than stack traces.

- https://dev.to/monuminu/model-context-protocol-mcp-the-complete-developer-guide-to-building-production-grade-ai-agents-ah3
- https://dev.to/harsh0026/model-context-protocol-mcp-the-new-standard-for-ai-tool-integration-1b83

**Security and authorization are the open problem.** A September 2026 OX
Security analysis of 15,465 published MCP servers found agents reaching
ungoverned infrastructure, and enterprise authorization (identity aware,
scoped, auditable) is the active frontier: an enterprise authorization
layer and identity assertion work are in preview, precisely because the
protocol deliberately leaves where a server runs and who may call it to the
operator.

- https://www.morningstar.com/news/pr-newswire/20260924ny55298/new-research-mcp-servers-connect-ai-agents-to-china-russia-home-networks-and-abandoned-domains

## Projection (projection, not a claim)

Over the next 12 to 24 months, workspaces built for humans will plausibly
be expected to offer an agent interface as a matter of course, and the
differentiator will shift from "has MCP" to the quality of the agent's
working conditions: typed room state an agent can plan over, scoped
identities for agents distinct from human users, and an auditable history
of what the agent did. Collaboration tools that treat agents as invisible
API callers will look dated next to tools that treat them as accountable
participants in the room.

## How Cohort is positioned

Shipped now: an MCP server (`mcp-server.js`) that is a real client of the
workspace rather than a backdoor. It joins rooms over WebSocket under its
own handle, so everything it does is visible to the humans present. All
seven tools declare output schemas and return structured content;
`get_room_state` returns the whole planning surface (project, document,
recent chat, presence) in one call; errors are structured with machine
readable codes. A recorded session transcript lives at
`test/evidence/mcp-session.json`, and the protocol behavior is covered by
the automated test suite (`npm test`, 7 tests passing as of 2026-10-14).

Next along this trajectory, in order: agent task history in room state (so
an agent can see what it and other agents already did), then the
authorization question the whole field is working on: scoped agent
identities tied to the workspace's own auth model, once Cohort has one.

## Evening scan, October 17, 2026: MCP authorization and agent identity

A focused micro scan run because Cohort's next queue item, scoped agent
identities, is gated on Joshua's answers to the open questions in
docs/AUTH.md (written October 16, 2026). This scan changes no decision in
that document; it flags what Joshua may want to revisit when he answers.
One timing note, stated plainly: the largest item below, the 2026-07-28
specification, was published before AUTH.md was written but its
authorization package was not reflected in AUTH.md or in the scan above,
so for this project it is newly surfaced, not newly published.

**The 2026-07-28 specification firmed up the authorization hardening
package.** The official release post lists six authorization changes in
that revision, of which four matter here: authorization servers should
return the `iss` parameter per RFC 9207 and clients must validate it
before redeeming a code (SEP-2468, closing an authorization server mix-up
hole); client credentials are bound to the issuer that minted them, with
no reuse across authorization servers (SEP-2352); clients set
`application_type` during Dynamic Client Registration (SEP-837); and
Dynamic Client Registration is formally deprecated in favor of Client ID
Metadata Documents (CIMD), kept only for backward compatibility. The
current draft authorization page carries the same deprecation note and
adds that a future revision is expected to upgrade including `iss` from
SHOULD to MUST. In the 2025-11-25 text, by contrast, CIMD was a SHOULD
and DCR a MAY retained for compatibility.

- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
- https://modelcontextprotocol.io/specification/draft/basic/authorization

What it means for this project: AUTH.md rejected a full account system
and OAuth until there is a hosted instance, and nothing here overturns
that. It does change what "OAuth later" would mean in practice. If the
hosted instance ever adopts the spec's OAuth path, the work should plan
on CIMD or pre-registration, not on building new flows around DCR, and on
issuer validation from the start. Flag for Joshua's AUTH.md answers, not
a change to the decision.

**The resource server pattern is settled, and it matches Cohort's scope
shape.** In the 2025-11-25 authorization text, a protected MCP server
acts as an OAuth 2.1 resource server, not as its own authorization
server. MCP servers MUST implement OAuth 2.0 Protected Resource Metadata
(RFC 9728) and clients MUST use it for authorization server discovery;
clients MUST send the RFC 8707 `resource` parameter in authorization and
token requests; servers MUST validate that a token was issued
specifically for them as the intended audience, and MUST NOT accept or
transit any other tokens, which is the spec's ban on token passthrough.
Authorization is optional, and for STDIO transports the same page says
implementations SHOULD NOT follow this specification and should instead
retrieve credentials from the environment. Scope handling is also
specified: a 403 with `error="insufficient_scope"` and the required
scopes in the `WWW-Authenticate` header is the step-up path, and
authorization servers SHOULD issue short-lived access tokens.

- https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization

What it means for this project: this strengthens AUTH.md. Cohort's five
minimum scopes (`room:read`, `room:chat`, `room:doc`, `project:create`,
`project:upvote`) are the same per-action shape the spec assumes in
`scopes_supported` and in scope challenges, and the audience and no
passthrough rules support a token that names one Cohort instance and
nothing else. It also sharpens open question 4 in AUTH.md: Cohort's MCP
server today is a local client of the workspace API, which is the STDIO
and environment credential world the spec describes; the OAuth resource
server pattern would only enter with a hosted HTTP instance, so the
token lifetime and storage answer depends on which of those Joshua is
deciding for.

**Enterprise-Managed Authorization is stable, and it authenticates the
human, not the agent.** The official extension page describes
`io.modelcontextprotocol/enterprise-managed-authorization` as central
control through an organization's identity provider: the client exchanges
an employee's identity assertion for an Identity Assertion JWT
Authorization Grant (ID-JAG), then exchanges that grant for an access
token, so policy, granting, and revocation all happen in one admin
console with an auditable trail, and no per-server consent screens.

- https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization

What it means for this project: the pattern validates two parts of
AUTH.md, a named human behind agent activity and human controlled
revocation, and it does so from the enterprise side. It is not a fit for
Cohort's open demo: there is no organization, no IdP, and no employee to
sign in, and the extension does not claim to identify an unattended
agent. No revisit needed; it is evidence for the operator rule, not a
replacement for the scoped token model.

**MCP still does not define an identity for the agent itself.** An
independent check of the spec repositories on September 28, 2026 found
the auth extensions surface was one stable specification
(Enterprise-Managed Authorization, above) and one draft (OAuth client
credentials, which requires pre-registered credentials established out of
band), with the two proposals that would give an agent its own verifiable
identity, DPoP (SEP-1932, sender-constrained tokens) and Workload
Identity Federation (SEP-1933), still open pull requests at that date.

- https://webofmike.com/mcp-agent-identity-gap/

What it means for this project: Cohort cannot wait for, or claim, a spec
agent identity; there is none to build against yet. AUTH.md's local
design, a scoped token issued to an agent with a named human operator,
remains the necessary project level answer, and its human only issuance
matches how the draft client credentials flow also assumes credentials
are established out of band by an administrator. Flag, not a change:
when SEP-1932 or SEP-1933 eventually lands, the token format in the
implementation should be rechecked against it. That is a projection
about future spec work, not a claim about its timing.

**Current practice is converging on delegation that records both
principals, never token inheritance.** An October 2, 2026 analysis of
deploy-from-chat identity separates three principals in every agent call
(the human who consented, the agent runtime that executes, and the tenant
that bounds the blast radius) and describes the converging pattern as
RFC 8693 token exchange minting a derived, narrower token with `sub`
naming the human and `act` naming the agent, scoped per tool and per
resource, with short lifetimes, immediate revocation, and an audit log
that records the human principal behind every agent action.

- https://bex.co/blog/2026/10/02/mcp-oauth2-agent-identity-problem

What it means for this project: this is the strongest outside support in
this scan for AUTH.md as written. Cohort's activity log already records
the actor, and AUTH.md's one optional `operator` field on agent entries
is the same two-principal record in this repo's smaller shape. It adds
one concrete consideration for Joshua's answer on token lifetimes
(AUTH.md open question 4): the direction of travel in current practice
is short lived, per task tokens rather than long lived standing tokens,
because the lifetime is the blast radius if a token leaks.

## Verdict of this scan

AUTH.md's decision looks strengthened, not challenged: scoped tokens,
agents first, a named human operator on every agent token, and human only
issuance and revocation all match where the spec and current practice
have firmed up. Two flags for Joshua when he answers the open questions,
neither of which changes the decision on its own: (1) any future hosted
OAuth work should assume the resource server and Protected Resource
Metadata pattern with CIMD or pre-registration, not DCR; and (2) token
lifetime defaults should lean short and, for a hosted HTTP instance,
audience bound to that one instance. Direction stays human; the
implementation queue item remains gated as recorded in CHECKLIST.md.
