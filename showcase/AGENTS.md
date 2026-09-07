# The showcase — local doctrine

This file governs work INSIDE `showcase/` (pages, specs, shell chrome). The
parent contract (`../AGENTS.md`) still applies in full — tokens only, the
clean/dirty rule, rem on text-coupled sizes, the z ladder. If you are working
on the library itself (`src/`) or on the host app, you do NOT need this file.

**The showcase is the copy-precedent surface.** Everyone who builds a Memoh
interface will treat whatever they find here as the sanctioned way to write
it — a hand-written pattern in the showcase reads as "official, feel free to
copy". So: every class on every page must trace to an owner component or a
documented tier. If a shape recurs, it becomes vocabulary (an owner, a prop,
or one shared home like `lib/frame.ts`). If a shape is genuinely one-off
(page-local demo staging), it may stay hand-written ONLY with a comment
stating why it is not shared vocabulary. A component library that cannot
build its own showcase out of itself has no authority to teach anyone.

`pnpm dev` serves the module's living reference: a custom, spec-driven
showcase (foundations pages + one page per component with live controls and
light/dark × 5-scheme switching). It replaced Storybook (removed — 3 stale
stories, zero remaining value over the dev wall).

## Adding or changing a component page

- **One spec per component** in `showcase/specs/<name>.ts`, registered in
  `showcase/specs/index.ts` (order = sidebar order). The spec declares
  `controls`, optional `examples`, `render(state)`, and optional `usage` —
  the page's sections and the controls board all derive from it.
- **Control options come from the component's exported key arrays**
  (`buttonVariantKeys`, `toggleVariantKeys`, …) — never a hand-copied list.
  If a component doesn't export its keys, add the export next to its cva call
  (the `*Keys` pattern) rather than duplicating the list in the spec.
- **The page carries NO code snippets.** Live snippet generation (a per-spec
  `code()`) shipped and was removed: a snippet row under every section read
  as noise, and the snippet duplicated what `render()` already shows. Do not
  reintroduce per-spec snippet fields — if a copy-paste story is ever needed
  it comes back as ONE well-designed surface, not per-section disclosures.

## The component page is a doc spine, not a mode-switched stage

The page frame is **PageShell itself** (`src/components/settings`) — the same
component the host's settings/plugins pages use, so the title block, gutter,
and header→body rhythm are pixel-identical by construction. Inside it, one
vertical scroll: **Playground** → **one section per example** → **All
variants** (the `matrix` wall, only when declared) → **Usage** (only when the
spec has `usage`).

- **Section headings follow the tier law, and the two tiers never mix.** The
  **Playground** is a FUNCTIONAL section, not a doc chapter — it takes the
  settings-section label tier (SectionGroup `tone="muted"`, the 13px muted
  label, same as "Server Workspace" on the host's tool-approval page). **Doc
  chapters** (every example, All variants, Usage) are SectionGroups in
  `heading` mode — their title/hint is the shared PageHeader (the same
  component PageShell's title block composes), so a chapter heading can never
  drift from the page header it mirrors — "looks alike" is not reuse.
- **The Playground's controls** are a SettingsSection of SettingsRows
  (widgets in the trailing slot at DEFAULT size). NEVER invent a
  control-board layout (a label-over-widget grid, a transcribed settings row,
  sm-size widgets) — the owner components are the one shape, and hand-writing
  their look is the 同形异码 failure the owner vocabulary exists to prevent.
- **The horizontal grid is the owners'.** The px-2 title inset exists
  RELATIVE TO A surface beneath — Playground (controls card) and examples
  (each stages its instances in a MINI PLAYGROUND: a plain rounded border
  frame — `showcase/lib/frame.ts`'s STAGE_FRAME_CLASS, never re-typed — with
  left-aligned content, no viewport/theme chrome) inset their titles px-2;
  sections with a truly bare body (Usage — no card at all) set `bare` and
  keep title, hint, and body on one flush edge with a roomier title→body gap.
  Never hand-align a title with its card, and never hand-write a section
  title at a stronger weight (text-title/semibold is NOT the section-title
  tier).
- **Prose sits at the description rung.** Usage/body copy is `text-control` —
  `text-body` (12px) is a caption rung and is never long-form copy.
- **All example sections render at once down the scroll** — that density is
  the point; there is no "stage mode" switcher and no right rail. Vertical
  rhythm: gap-8 between page-level sections (the host's settings-page
  rhythm). Page geometry must be identical regardless of content height —
  both scroll containers carry `scrollbar-gutter: stable`, so a page too
  short to scroll (Textarea) doesn't shift the column sideways.
- **Every visual decision must trace to an owner — or extend the
  vocabulary.** Layout, color, type rung, and inset alike: if a shape on the
  page is not covered by an owner component or a documented tier, the ONLY
  legal moves are (1) add a prop to the owner (e.g. SectionGroup's `tone`,
  PageShell's `width`) or (2) add a new owner. Approximating the shape by
  hand — "close enough" classes that merely look right — is reward hacking:
  it passes self-review until someone does a same-level comparison against
  the real page type. When in doubt, diff against the host surface that IS
  the same level (a settings page, a provider grid) before writing a single
  class. And if the host has a real counterpart component, MOVE the file
  (verbatim, token-adapted, host becomes a re-export shim) — never
  transcribe it.
- **Static pages (Overview, foundations) follow the same law.** Frame:
  PageShell with the legislated `width` rung ('md' reading column, 'lg'/'xl'
  specimen boards) — never a hand-set max-w/p-8. Chapters: SectionGroup
  `heading`, `bare` decided by the body (bordered cards/frames → inset;
  hairline tables, prose, borderless grids → bare). Hairline token-ladder
  lists are **SpecimenTable/SpecimenRow** (`showcase/components/`), the
  single home for that shape. Explanatory notes become the SectionGroup
  `description` (under the title), never a loose paragraph beside the
  content.
- **Example `note` is one line of when/why, never a restated title.** Optional
  per example — a section with nothing to teach renders no note line rather
  than filler. Same copy discipline as the rest of the library.
- **A spec opts into the matrix** by declaring `matrix: { rows, cols }` with
  control keys — only axes a reviewer actually scans (Button: variant × size).

## Examples pages — the example IS the page

`pages/examples/` holds whole-page specimens of classic product surfaces
(a settings page, …) — the surfaces every product has, where library-wide
passes (cursor, motion, width) are judged on a real interface instead of
single-component playgrounds. They are a third page kind beside component
pages and foundation pages, with their own law:

- **No doc frame.** The example fills the content area directly — its own
  `PageShell` IS the page. Never wrap it in a documentation spine, a
  `STAGE_FRAME_CLASS` frame, or a `CanvasStage`: the point is to feel the
  components in a real surface, and a stage would turn them back into
  boxed specimens.
- **Owners only, stricter than anywhere else.** An example page is the
  strongest copy-precedent surface in the repo — compose it exclusively
  from owner vocabulary (`PageShell` / `SettingsSection` / `SettingsRow` /
  the controls themselves). If a shape the page needs has no owner, that
  is a vocabulary gap to legislate, not a class to hand-write.
- **No width pinning, no state seeding beyond defaults.** Controls render
  at their library defaults (`Select` at `w-fit`, `Input` at `w-full`, …)
  so the page exposes true default behavior in real rows. If a row looks
  wrong, the fix belongs in the library, not in a class on the page.
- **Overlays uncontrolled, state local** (per the overlay invariants
  below): each `Select`/`Dialog` owns its open state; page state is plain
  refs. No fake backends, no demo data plumbing.
- **Bilingual, generic copy.** All strings go through `tt()` and read as
  "any product's" copy — an example names no concrete product and teaches
  no Memoh-specific business wording.

Register each page in `registry.ts` under the `examples` nav group via the
`example()` helper (id prefix `examples/`).

## Overlay invariants (dead-locked three times — do not re-try)

- **Overlay specs render UNCONTROLLED — `interactive: true`, NO `open`
  control.** Select/Dialog/DropdownMenu/Tooltip/Popover own their own
  open/close via their reka trigger (click opens, Esc/outside-click closes).
  The showcase renders exactly that: a closed, live trigger you click — like
  the real component, and the honest copy-pasteable demo. It must NOT thread
  a controlled `open`: `render()` rebuilds a fresh throwaway state each call,
  so `onUpdate:open` writes into an object that's immediately discarded — the
  overlay can NEVER be closed, and its DismissableLayer freezes the whole
  page's `pointer-events`. That is the exact dead-lock that shipped three
  times (Overview auto-Delete, Dialog auto-open, Select Examples wedged);
  mark the spec `interactive` and render uncontrolled instead. Tooltip is the
  one resting-open exception, via reka's UNCONTROLLED `defaultOpen` (a hint
  has no scrim/DismissableLayer, so it can't wedge the page); suppress it
  under `state.__preview` (Overview thumbnails) so the landing page never
  sprouts a floating pill.
- **Light/dark side-by-side is NON-overlay only.** A stage toggle renders the
  view twice, the dark column being a scoped `.dark` subtree that MUST carry
  `text-foreground` + `color-scheme: dark` itself (`color` is inherited with
  its computed value locked at `<body>`, so without the explicit restart a
  component relying on inheritance renders dark text on the dark column).
  `interactive` (overlay) specs DON'T get the toggle (`ComponentPage` passes
  `:can-split="!isOverlay"`, keyed off `spec.interactive`): reka's
  DismissableLayer is a document-level singleton, so two open overlays can't
  coexist. To view an overlay in dark, flip the whole page theme (shell
  toggle). Do NOT reintroduce per-column state or portal redirection to force
  overlay compare — tried and reverted, it only papered over the singleton.
- **Matrix is non-overlay only** — an uncontrolled trigger can't be frozen
  open per cell, so `interactive` specs never declare `matrix`.

## The shell dogfoods the library

Sidebar/controls/chrome are built from `@felinic/ui` components and follow
the parent contract (tokens only, rem on text-coupled sizes, the z ladder,
`[data-ui-selected]` for selected rows, the library's own Tooltip/Select/
ScrollArea — never a hand-rolled bubble or native popup). The host guard
scans `showcase/` the same as `src/`.

## Foundation page data

Either **live** (Colors measures each swatch bar's own computed background
from the cascade — never transcribe values) or **static constants**
(`showcase/lib/foundations-data.ts`, transcribed from `style.css` / the
parent contract — update it when the source changes).
