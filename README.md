# @felinic/ui

A design system for AI agent management interfaces, shipped as a single
distributable unit: the Vue 3 component library, the design-token scales,
**and the AI agent skills that teach an agent to use them correctly**.

Host repos consume it as a **git submodule mounted at `packages/ui`** — not
as an npm package — so Tailwind scans the sources directly and the pnpm
workspace resolves it by path with zero build/publish step.

## What's inside

| Path | What it is |
|---|---|
| `src/` | Components + `style.css` (interaction contracts, radius/text/z/alpha token scales) |
| `AGENTS.md` | The atom-level design-token law. Read it before touching any component. |
| `skills/web/` | Page-level design-language skill (AI agent skill) |
| `skills/ui-owners/` | Spacing-owner vocabulary skill (AI agent skill) |
| `showcase/` | The module's own living reference — a custom spec-driven component showcase (`pnpm dev`) |

## Consuming as a submodule

```bash
git submodule add https://github.com/felinics/ui packages/ui
```

The mount point **must** be `packages/ui`: all internal path references
(in `AGENTS.md`, the skills, and the host-side contract guard) are written
from the host repo root and assume this location. A host's `AGENTS.md` should
direct Web/UI work to `packages/ui/AGENTS.md`; that contract routes agents to
the adjacent skills without host-side copies, forwarders, or symlinks.

Version pinning is the host's job: hosts pin a commit, bump via a one-line
PR. Framework versions are the host's job too — this package declares
`vue` as a peer dependency; the host lockfile decides the exact version.

## Developing

```bash
pnpm install
pnpm type-check
pnpm build
pnpm dev        # the showcase: http://localhost:5173
```

`pnpm dev` serves the showcase (`showcase/` + root `index.html`) — a custom,
spec-driven living reference: foundations (tokens) pages and one page per
component with live controls and theme/scheme switching. Each component page
is a single spec in `showcase/specs/`; see `showcase/AGENTS.md` for how to
add one.

Day-to-day development happens inside a host checkout (`packages/ui/` is a
full git repo there — branch, commit, and push from within it), so changes
are validated against a real consumer. Coupled changes land as two PRs:
the ui PR merges first, then the host PR bumps the submodule pointer and
adapts call sites.

## Known gaps

- **Contract guard runs host-side.** The host repo's
  `scripts/check-ui-contract.mjs` enforces the token law over these sources;
  PRs here are only guard-checked when a host bumps its pointer. Parameterizing
  the guard and moving it into this repo's CI is a planned follow-up.
- **Owner components still live in the host** (`apps/web/src/components/`):
  SettingsRow, FieldStack, PageShell, etc. The `ui-owners` skill
  documents them, so a brand-new host that doesn't share the same page
  structure won't get them from this repo yet. Promoting them into `src/` is
  a planned follow-up.
- **`skills/web/reference.md`** is a host-specific page map — host
  knowledge that travels here for now; splitting portable design language
  from host-specific references is a planned follow-up.
