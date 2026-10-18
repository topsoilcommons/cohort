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

## Evening scan, October 18, 2026: token lifetime, revocation, and agent identity registries

A second focused micro scan, on a fresh angle the October 17 evening
scan did not cover: it said lifetimes should lean short, but gave no
numbers, no revocation mechanism, and no look at identity registries.
This scan covers those three. It changes no decision in docs/AUTH.md,
implements nothing, and leaves scoped agent identities gated on
Joshua's answers to the four open questions in that document.

**Token lifetimes now have concrete, converging numbers.** A
vendor-neutral February 23, 2026 comparison of credential options for
agents and other non-human identities puts typical lifetimes at: OAuth
JWT access tokens 5 to 15 minutes (revocation often implicit, meaning
wait for expiry), opaque access tokens checked by introspection 1 to
10 minutes (revocation can be immediate if the API introspects),
refresh tokens hours to weeks (with the note that they should be
shorter for non-human identities, and rotation recommended), workload
identity federation credentials 5 to 60 minutes, SPIFFE/SPIRE SVIDs
minutes to hours (rotated automatically), static API keys months to
never (labeled bad), and mTLS client certificates days to months
(revocation via CRL or OCSP, with operational overhead). Its workable
defaults are access tokens at 5 to 10 minutes, no refresh token for
non-human identities if possible (or 1 to 24 hours with rotation if
required), and SVID certificates rotating every 1 to 4 hours.

- https://learn-iam.com/blog/token-security-for-ai-agents-and-non-human-identities

What it means for this project: AUTH.md open question 4 (token
lifetime and storage) now has a concrete range to decide against,
rather than just a direction. If Cohort's scoped tokens are ever
issued for a hosted instance, the practice above points to minutes,
not days, and to avoiding a long lived refresh style token for agents.
For the local demo, where tokens are not yet implemented at all, this
changes nothing.

**Revocation is a separate mechanism from expiry, and self-contained
tokens do not get it for free.** The same comparison notes that a JWT
cannot be revoked before expiry without an added layer. Two IETF
drafts, both work in progress and neither an RFC, describe that layer.
The OAuth Status List draft defines a compressed bit array in which
each referenced token has an index and a status (VALID, INVALID,
meaning revoked and irreversible, or SUSPENDED, meaning temporarily
invalid and reversible); a list can carry the statuses of 100,000 or
more tokens while staying small, and grouping many tokens in one list
gives what the draft calls herd privacy, because a checker does not
reveal which single token it is checking. The Global Token Revocation
draft (February 2026, expires August 29, 2026) defines an endpoint by
which an identity provider or incident tool can ask an authorization
server to revoke all of one subject's tokens: the server MUST revoke
all active refresh tokens, SHOULD invalidate access tokens (the draft
states plainly that this may not be technically feasible for
self-contained tokens, and points to the Status List as one remedy),
and MUST require re-authentication before issuing new tokens; success
is a 204, and revocation may complete asynchronously after it.

- https://www.ietf.org/archive/id/draft-ietf-oauth-status-list-00.xml
- https://www.ietf.org/archive/id/draft-parecki-oauth-global-token-revocation-06.html

What it means for this project: this is quietly favorable to Cohort's
current shape. A token checked against a server side record, as a
single instance checking its own store would, is the reference token
case the revocation draft describes as revocable by removing it from
storage. The hard revocation problem only arrives if tokens become
self-contained and are checked offline. Flag for Joshua's question 4
answer, not a change: keep tokens server checked while Cohort is a
single instance, and do not adopt self-contained tokens without also
adopting a status or introspection check.

**Workload identity replaces revocation with automatic rotation.**
A September 2, 2026 end to end SPIFFE demo for AI agents issues
five-minute X.509 SVIDs, renews at roughly half the lifetime, and swaps
the certificate in place with no restart and no secret ever written to
a file: identity is attested from properties of the workload, not from
a secret it holds. The demo also keeps identity and authorization
separate: a second agent with a valid SVID from the same trust domain
still received HTTP 403, because policy allowed only the first agent's
SPIFFE ID.

- https://dev.to/webofmike/spiffe-workload-identity-for-ai-agents-end-to-end-8ag
- https://www.hashicorp.com/en/blog/spiffe-securing-the-identity-of-agentic-ai-and-non-human-actors

What it means for this project: SPIFFE is the working form of the
workload federation idea the October 17 scan flagged as still a draft
inside MCP (SEP-1933), but it is infrastructure for deployed
workloads, not a fit for Cohort's local MCP demo, which has no SPIRE
server, no attested workload, and no host yet. No revisit needed. The
transferable lesson is narrower: short lifetimes only stop being
operational pain when renewal is automatic, and Cohort's design has
no automatic renewal, which is another reason any first token
lifetime Joshua picks should be a deliberate trade, not a copied
default.

**Agent identity registries exist now, but they are public and
permanent by design, the opposite of Cohort's room record.** ERC-8004,
proposed in August 2025 and live on Ethereum mainnet in January 2026,
defines three on-chain registries: Identity (each agent gets a
permanent on-chain ID as an ERC-721 token), Reputation (feedback from
users and other agents), and Validation (third party verification of
agent actions). A May 2026 research proposal from the Ethereum
Foundation's Privacy and Scaling Explorations team, Anonymous
Credentials for Trustless Agents (ACTA), exists precisely because
that design creates a permanent, public interaction graph between
agents and their clients, and proposes zero-knowledge proofs so an
agent can prove it meets a policy, including operating under a
verified human's authorization, without exposing that identity. ACTA
is a research draft with its own open questions (anonymity set size,
issuer centralization, proof cost), not a shipped fix.

- https://www.cryptopolitan.com/pse-proposes-acta-privacy-layer-for-erc-8004/

What it means for this project: a public registry is not a missing
piece Cohort should adopt. Cohort's record of an agent is its room
activity log: local, operator bound under AUTH.md, and visible to the
people in the room, which serves belonging (Layer 3) without putting a
permanent public graph under every agent and operator. The registry
landscape is evidence that agent identity is being built in several
incompatible places at once (spec drafts, workload identity, on-chain
registries), which reinforces AUTH.md's choice to keep Cohort's
identity local and its format recheckable later, rather than binding
rooms to any one external registry now.

## Verdict of this scan

AUTH.md is strengthened again, and open question 4 is sharper:
lifetimes in current practice are minutes (5 to 15 for JWT access
tokens, 1 to 10 for introspected opaque tokens), revocation is easy
only while tokens stay server checked, and automatic rotation is what
makes minute scale lifetimes livable in the workload world. Two flags
for Joshua, neither changing the decision: (1) if hosted tokens are
issued, pick a minute scale lifetime and no long lived agent refresh
token, per the ranges above; and (2) do not move to self-contained
tokens, or to any external agent registry, without a revocation and
privacy answer to go with it. Scoped agent identities remain gated on
Joshua's answers, exactly as recorded in CHECKLIST.md, and the uptime
demo still needs Joshua's own signup; neither was attempted here.
