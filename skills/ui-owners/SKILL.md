---
name: ui-owners
description: Read this BEFORE writing or editing any apps/web settings page, bot-detail tab, dialog/popover/sheet form, config panel, list row, or detail surface — i.e. almost any Vue markup that is not pure chat — and BEFORE adding or editing the chat composer dock (composer-dock / composer-panel / composer-capsule and their approval, command-result, error, and ask_user members), which is chat but still owned here. The host app has a core owner vocabulary (SettingsRow, SettingsSection, FieldStack, PageShell, MetricReadout, PersonaTile, CalloutBanner, ExpandableSettingsRow, BackendCard, ModelListRow, FormStack, PanePlaceholder, InlineLoadingRow, ConfirmDeleteDialog, SectionGroup) that owns all recurring spacing. Use this skill whenever you are about to build a settings row, a form field (label + input), a section card, a Save/Cancel footer, a stat tile, a warning banner, an "Advanced" disclosure, an empty state, a loading state, a delete confirm, or a whole page frame — even if the user just says "add a settings page", "make a dialog", "add a toggle row", "build this form", or "add a field", without mentioning spacing or components. Hand-writing a row/field/card/tile out of raw `<div class="flex … border-b …">` is the #1 recurring mistake in this codebase (同形异码); compose an owner instead so spacing can never drift. The skill also says when a shape must STAY hand-written (a genuinely different spatial relationship, e.g. a denser list row). Pairs with web (page-level) and packages/ui/AGENTS.md (atom-level).
---

# UI — Spacing Owner Vocabulary

This skill is the **composition layer** between the page-level rules in
`../web/SKILL.md` and the atom-level token law in `packages/ui/AGENTS.md`.

`web` tells you *how a page reads*. `packages/ui/AGENTS.md` tells you *how one
control looks*. This file tells you the piece in between: **when you need a row, a
field, a section, a tile, a disclosure, an object card, or a warning — you compose one
of the owner components below instead of hand-writing it from `<div>`s.**

## Why this exists (the one idea)

The debt this vocabulary kills is **same-shape-different-code** (同形异码): the same
visual shape — a settings row, a form field — written out by hand in slightly different
Tailwind classes on every page. It is invisible to grep (the classes differ) and it
drifts: one row is `py-3`, its twin is `py-2.5`, a third adds `min-h-[3.75rem]`, and the
surface slowly stops looking like one system.

The fix is **not** "tokenize every `gap-4`." The fix is: **give each recurring spatial
shape ONE owner component, and compose that.** A shape with an owner cannot drift,
because there is only one copy of its spacing.

> Before you write `<div class="... flex ... border-b ...">` for a row, or
> `<div class="space-y-1.5"><Label/>…` for a field — **stop.** That shape has an owner.
> Compose the owner.

## The core owners

Import paths are exact. **As of the 2026-07 owner lift, every core owner below
lives in `@felinic/ui`** (mostly `src/components/settings/`; a few in their own
component dirs) — the `apps/web/src/components/` paths left in the entries are
re-export shims that keep old imports working. Import new call sites from
`@felinic/ui` directly; the shims die in the migration follow-up.

### Structure

**SettingsShell** · `settings-shell/index.vue` — shim (impl in `@felinic/ui`).
The settings page width shell: centered column with the page-width LADDER
(`narrow` max-w-3xl · `standard` max-w-4xl · `wide` max-w-6xl · `full`) and the
page gutter (`px-4 md:px-6`). The ladder's single source is
`settingsWidthClass` (`@felinic/ui`, `src/components/settings/width.ts`) —
DetailPane consumes the same helper so its back row shares the content's
rails. PageShell is the OTHER page frame (title block + actions + doc gutter):
PageShell for titled settings pages, SettingsShell for master-detail panes
that carry their own inner structure.

**DetailPane** · `settings/detail-pane.vue` — shim (impl in `@felinic/ui`).
The in-page detail surface (list ↔ detail navigation): a back row
(**BackButton**) width-matched to the body, a loading skeleton mirroring the
real body (header card + 4-row form card, so the frame doesn't jump when
content swaps in), and the detail slot. Props: `backLabel`, `width`
(SettingsWidth ladder), `loading`. Emits `back`.

**BackButton** · `settings/back-button.vue` — shim (impl in `@felinic/ui`).
THE back affordance for in-page detail surfaces (DetailPane + bot-detail tabs
that can't use DetailPane). Ghost button, `px-4`, chevron + truncated label,
`/85` ink. Props: `label`. Emits `click`.

**SwapTransition** · `settings/swap-transition.vue` — shim (impl in
`@felinic/ui`; its `swap-forward/*` / `swap-back/*` classes live in the
library's style.css). The directional push-pop for list ↔ detail swaps:
forward opens the next pane at the top, back restores the exact scroll offset
(an internal stack handles any nesting depth). Props: `direction:
'forward' | 'back'`. No `appear` — the first paint is a plain cut.

**StatusDot** · `settings/status-dot/index.vue` — shim (impl in
`@felinic/ui`). The tiny status dot atom (status → color), composed by
BackendCard (`enabled` badge) and MetricReadout — never hand-paint a colored
dot.

**PageShell** · `page-shell/index.vue` — a re-export shim; the implementation
lives in `@felinic/ui` (`src/components/settings`), shared with the component
showcase. Import new call sites from `@felinic/ui`. Its title block is the
shared **PageHeader** (same directory) — the ONE title + subtitle pair, also
composed by SectionGroup's `heading` mode.
The page header + centered `max-w-3xl` column. Props: `title`, `description`,
`variant: 'page' | 'tab'` (`tab` for a bot-detail settings tab, `page` for a standalone
route). Slot: `#actions` (header-right toolbar). Every settings surface starts here.

**SettingsSection** · `settings/section.vue` — a re-export shim; the
implementation lives in `@felinic/ui` (`src/components/settings`), shared
with the component showcase. Import new call sites from `@felinic/ui`.
A grey section label above a bordered white card. Props: `title`. Slots: `#actions`
(header toolbar, right of the title), default (the rows), `#footer` (an action band —
Save/Cancel or pagination — rendered *inside* the card with a top hairline). A card is a
`SettingsSection`; you never hand-roll `rounded-… border bg-card`.

**SurfaceCard** · `@felinic/ui` (`src/components/settings`) — the same card shell
as SettingsSection, for a body that is NOT settings rows: a plan / quota summary,
a page identity header (icon + name + enable switch), a list container whose rows
carry their own inset. Props: `padding: 'none' | 'row' | 'lg'` (default `lg` = p-5;
`row` = px-4 py-3; `none` clips content to the radius), `bordered`, `as` / `asChild`.
The caller only arranges its content (`class="flex items-center gap-3"`); radius,
fill, edge and padding are the owner's. Hand-writing `rounded-… border border-border
bg-card` instead is how pages miss the dark-mode edge rule (§ Borders in
`packages/ui/AGENTS.md`).

**Dark-mode card edge.** Every card owner (SettingsSection, SurfaceCard, Table,
BackendCard, framed MetricReadout, ActionCard, Card, entity PersonaTile) drops its structural edge in
dark mode — the bg-card fill already separates from the page. Pass `bordered`
when the card sits inside another card-colored surface (a dialog body, a card
within a card) so the boundary stays visible there.

**SectionGroup** · `section-group/index.vue` — a re-export shim; the
implementation lives in `@felinic/ui` (`src/components/settings`), shared
with the component showcase. Import new call sites from `@felinic/ui`.
A titled content group: a **foreground** section label (+ optional hint, `#actions`
toolbar) heading a BARE body — typically a BackendCard grid. Deliberately NOT
SettingsSection (muted label + bordered card): SectionGroup is the page-content tier,
its body already carries its own borders, so it adds no card and there is no
card-in-card. Use ONLY on pages stacking SEVERAL such groups (voice TTS/STT,
web-search search/fetch); a single-group gallery page lets PageShell own the
title/hint/action directly — wrapping its one group here would duplicate the page
title at a second tier. **`tone: 'foreground' | 'muted'`** (default `foreground`):
`muted` is the SettingsSection title's tier — use it when the group's level on the
page is a settings-style section (e.g. the showcase's doc spine), never mix tones
between same-level sections on one page. **`bare`**: set it when the body carries NO
bordered surface of its own (plain text, a row of buttons, a matrix) — the px-2
title inset exists relative to a CARD beneath, so a bare body drops the inset
(title/hint/body share one flush edge) and the title→body gap grows to give the
section the air the card would have provided.

### Rows (things inside a section card)

**SettingsRow** · `settings/row.vue` — *the workhorse.* (Re-export shim; the
implementation lives in `@felinic/ui` (`src/components/settings`), shared
with the component showcase. Import new call sites from `@felinic/ui`.)
One horizontal row inside a section card. The canonical geometry
(`min-h-[3.75rem] py-3 mx-4 border-b`, inset hairline, `last:border-b-0`) lives here and
nowhere else. Props:
- `label`, `description` — the default body.
- `align: 'center' | 'start'` — `start` top-aligns a tall row (leading avatar + a
  multi-line body).
- `stack: 'never' | 'sm' | 'always'` — `never` (default) is one line; `sm` drops to a
  column below the `sm` breakpoint so a label + control don't cramp; **`always`** is a
  permanent column: a full-width control (Textarea, a schema field) under its label.

Slots: `#leading` (media — icon / avatar / channel mark / load skeleton), `#content`
(a fully custom body replacing label/description — use it when you need a `<Label :for>`
for focus-wiring, badges, or a status line), default (the **trailing control**).

**ExpandableSettingsRow** · `settings/expandable-row.vue`
A settings row whose whole header toggles a collapsible body. Props: `label`,
`description`, `v-model:open`. Slots: `#leading`, `#content`, `#trailing` (default: a
chevron that rotates on open), `#expanded` (the disclosed body — put a `FormStack` here).
Use for "Advanced" disclosures and per-item inline editors where the row **owns** what it
reveals. (If the toggle controls a *sibling* block it doesn't own, see the anti-pattern
below.)

**BackendCard** · `settings/backend-card.vue`
A clickable **horizontal** object-entry card (its root is a real `<button>`). Props:
`name`, `subtitle`, `enabled` (draws a status dot). Slots: `#leading` (icon), `#trailing`
(default: a chevron). For "pick a provider / backend / storage" object rows.

**ModelListRow** · `settings/model-list-row.vue`
A dense **clickable navigation** row inside a bordered card: name (+ optional secondary
id text when a custom display name hides it) on the left, a decorative trailing glyph
(default: gear) on the right, whole row is a real `<button>` (same root contract as
BackendCard). Props: `label`, `meta?`, `last?` (own its own trailing hairline instead of
`:last-child`, since the divider is a sibling element, not a border on the row — see the
component's head comment for why), `disabled?`. Slot: `#trailing`. Emits `click` (a
multi-root template disables Vue's attrs/listener fallthrough, so it can't rely on a bare
`@click` passthrough). Built to close the transcription/speech/video provider-setting.vue
"dense model-list navigation row" gap recorded in the owner-vocabulary-census (those three
hand-synced the exact shape; two were byte-identical, the third only differed by nesting
the click handler on a trailing ghost Button instead of the row itself — a trivial, not
deliberate, divergence). **Do NOT reach for it for `providers/model-item.vue`** — that row
carries inline enable/test/delete actions, a capability badge, and a status line, a
materially richer interaction contract than "click to open the edit dialog"; it stays its
own hand-built component.

### Fields (vertical form controls)

**FieldStack** · `settings/field-stack.vue`
ONE vertical Label-over-control form field (`space-y-1.5`). Props: `label`, `for` (wires
label→control focus), `help` (a muted `<p>` under the control). Slot: `#label` (custom
label row — e.g. a label with an inline "clear" button), default (the control). This is
**distinct from SettingsRow**: SettingsRow puts the label *beside* the control; FieldStack
stacks it *above*.

> **FieldStack is the single owner for vertical form fields — including validated ones.**
> When a FieldStack sits inside a vee-validate `<FormField>`, it takes over `FormItem`'s
> job: it provides the form-item id (so a `<FormControl>` wrapping the control resolves
> aria-invalid / aria-describedby) and renders the field's error inline. So the pattern for
> a validated field is:
> ```
> <FormField v-slot="{ componentField }" name="x">
>   <FieldStack :label="…" for="x-id">
>     <FormControl><Input id="x-id" v-bind="componentField" /></FormControl>
>   </FieldStack>
> </FormField>
> ```
> Keep the outer `<FormField>` and the `<FormControl>`; drop the old `<FormItem>` + bare
> `<Label>`. A plain field with no validation is just `<FieldStack :label>` around the
> control. **One caveat:** because FieldStack now renders errors inline, any hardcoded
> validation message in the zod schema becomes visible — translate it (zh/en/ja) instead
> of shipping the English default. The older `@felinic/ui` `<FormItem>` (`grid gap-2`) is
> superseded; new code uses FieldStack.


**FormStack** · `settings/form-stack.vue`
A `space-y-4` wrapper for a run of `FieldStack`s. Use it around a contiguous form column
(a dialog body, an `#expanded` panel).

### Readouts & notices

**DeviceCodePanel** · `device-code-panel/index.vue` — shim (impl in
`@felinic/ui`).
设备码授权(RFC 8628)的"输码时刻":一句指引(caller i18n,防钓鱼警示写在 hint 里)→
英雄码(text-3xl mono,select-all,不是输入框)→ 唯一动作"复制并打开"(【先发起复制、
再同步打开,两行都不 await】——趁当前页聚焦先发起 writeText,失焦会让 Chromium 复制
失败;绝不能先开空白 tab 占位再 await 剪贴板,那是已否决的错误方向)→
可见性守卫的 mm:ss 倒计时(面板唯一活性信号;授权轮询是 caller 的事,静默)。
Props: `code`, `verificationUri`, `expiresAt?`, `hint`, `retryLoading?`,以及入库后
全部文案 props(`copyAndOpenLabel` / `retryLabel` / `expiredLabel` / `expiresInLabel`
/ `copyFailedMessage`,均 caller i18n,无 fallback);emit `retry`
(过期后重新签发)。"取消整个流程"属于 caller 的入口控件,与面板的 retry 语义不同,
不要合并。已知同形状旧写法:bots ACP 面板、onboarding Step4 —— 迁移前先做各自的
行为盘点(ACP 有真 cancel API 和错误态)。

**LabelSwap**(`@felinic/ui` 原语,非 apps/web owner,顺带登记防重造)
会"换字"的内容槽:每个候选 label 一个具名 slot,`active` 指名当前项;各 label 保持
自然宽度,切换时外壳宽度按 house spring 平滑过渡、label 交叉淡出。给 Connect↔Cancel
式的状态开关按钮用 —— 不要再用 min-w 魔法数定宽或手写叠格量宽(grid 轨道按最宽
label 定尺寸、靠左锚定会单侧裁字,这些坑都已收进组件,见其头注)。

**MetricReadout** · `settings/metric-readout.vue`
One metric tile: caption label + tabular value (or a status dot + label). Props: `label`,
`value`, `sub`, `framed` (default `true` — draws the tile box; `false` for a bare stat on
a surface), `status: 'ok' | 'warn' | 'error'`. Slot: `#value` (custom markup — relative
time, mono). **The caller owns the grid**; MetricReadout is a single cell.

**PersonaTile** · `persona-tile/index.vue`
A **vertical, centered** entity/add tile (`w-52 flex-col items-center`). Props: `name`,
`variant: 'entity' | 'add'`. Slots: `#media`, `#status`, `#name`. This is the vertical
counterpart to the horizontal BackendCard — do not confuse them.

**CalloutBanner** · `callout-banner/index.vue`
A framed warning / destructive notice. Props: `tone: 'warning' | 'destructive'`, `title`,
`description`, `clickable` (whole surface becomes a button with a lead-in chevron). Slots:
`#icon`, default (trailing action).

### Loading & placeholder (the four-rung ladder)

Loading states have exactly four homes; pick by *where* the loading lives, and the
choices are mutually exclusive — no two rungs ever fit the same call site:

```
Just the glyph, no text (rare, e.g. sidebar)       → <Spinner> atom, keep local
Inside a button that triggered the work            → Button :loading (+ loading-mode)
An in-flow row: spinner + muted text, left-aligned → InlineLoadingRow
A whole pane/panel with nothing else to show       → PanePlaceholder (centered fill)
```

**PanePlaceholder** · `pane-placeholder/index.vue`
The centered fill for a pane's content area, three states: `loading` (horizontal
spinner + text), default empty (vertical `#icon` + text + `#action`), `title` (emphasized
two-line block, e.g. "Select a bot"). Deliberately **not** the `@felinic/ui` `Empty`
(that's the dashed/solid framed card for in-page empties); PanePlaceholder is for the
frameless center of a panel that has nothing else. Parent must give it height.

**InlineLoadingRow** · `inline-loading-row/index.vue`
A left-aligned, in-flow "spinner + muted text" row that occupies one line where content
will appear (list head, settings row content, panel top). Props: `size: 'sm' | 'md'`
(text-xs/3.5 vs text-sm/4), `bordered` (the rounded-md framed variant used by backup /
import read-states), `surface: 'card-row' | 'tab'`. Not for centered fills — that's
PanePlaceholder.
**Use `surface` to pick the positioning family — never hand-write it as a class again:**
`surface="card-row"` for a loading list INSIDE a SettingsSection card (bordered row form,
reads as "a list row, loading"); `surface="tab"` for the whole-TAB loading form (no card
around it, e.g. bot-container). A real 2026-07-06 regression mixed these up by hand
(caller literally copied the wrong family's class string) — the card read as a half-empty
box until re-aligned. The two named forms now live in the component so a caller cannot
copy the wrong one; a genuinely different, unnamed positioning need still passes plain
class (single root node, merges with the component's base class).

### Dialogs

**FormDialogShell** · `form-dialog-shell/index.vue` — shim (impl in
`@felinic/ui`). The Dialog-with-a-form skeleton: Dialog + form + footer band
(default `sm:max-w-106.25`). Compose it for any create/edit dialog whose body
is a form — never hand-roll the dialog+form+footer assembly.

**ConfirmPopover** · `confirm-popover/index.vue` — shim (impl in
`@felinic/ui`). The anchored confirm bubble (NOT a modal): shared popover
chrome, a title-grade question (`title`, or `message` alone), optional
supporting line, ghost cancel + action confirm. Props: `title`, `message`,
`cancelText` / `confirmText` (**required** — caller i18n, no fallback),
`loading`, `variant`. Emits `confirm`.

**ConfirmDeleteDialog** · `confirm-delete-dialog/index.vue` — shim (impl in
`@felinic/ui`).
The delete-confirmation dialog: `sm:max-w-sm`, title + optional `DialogDescription`,
outline cancel + destructive confirm. Props: `open` (v-model), `title`, `description`,
`cancelLabel` / `confirmLabel` (**required** — caller i18n; the old
`common.confirm` fallback is gone), `loading` (confirm shows spinner, cancel
disables so the dialog can't close mid-request). Emits `confirm` — the **caller** owns
the actual delete call and closes on success. Copy is caller i18n; the component owns
only skeleton + behavior. Do not hand-roll a Dialog+two-buttons confirm again; if a
confirm needs a form or extra body content it is not this owner.

### Surface-scoped owners (live next to their surface, not in components/)

Same discipline, narrower home — compose these when working on their surface:

- **onboarding** (`pages/onboarding/components/`): `step-exit-shell.vue` (the
  wizard exit animation wrapper — the ONLY owner of the scale+opacity exit
  transition; every Step*.vue template root wraps in it. It sits above
  StepFrame because Step3's three frame variants share one shell),
  `step-frame.vue` (35rem body + title structure; each step's title mb is
  deliberately hand-tuned per page and passed via `titleClass` — do NOT
  flatten it; `bodyClass` is currently Step3-only for its mode-switch
  transition), `footer-nav.vue` (prev/next pair, min-w next button so long
  labels grow; `#next` escape hatch only for CTAs that need a keyed
  Transition label swap), `choice-tile.vue` (h-16 icon+label grid tile,
  solid/dashed), `hint-box.vue` (single-line text-xs form hint,
  muted/warning tones, optional #icon — NOT CalloutBanner, which is the
  page-level title+description+action banner; forcing hints into it was
  adjudicated as over-merging).
- **app sidebar** (`components/sidebar/`): `panel-header.vue` (panel group
  header row — owns the label type `text-xs font-[550] tracking-tight
  muted/80` that files-pane/schedule/sessions each hand-synced; container
  geometry (mt/h/min-h) and indent (`pl-[11px]` label column vs container
  `mx-1 pl-[11px]` chevron column) stay with callers; recents' header is an
  interactive DropdownMenu TextButton — different relationship, local),
  `nav-button.vue` (the h-9 icon-column action row — was byte-identical ×3
  in index/panel-sessions; `active` prop for the settings-row highlight;
  icon passed by caller as `size-[18px]` stroke 1.75). Deliberately NOT
  built: a ListRow owner for session-item/bot-switcher/search-dialog rows —
  the three keep different heights, radii, and hover tokens on purpose
  (sidebar-hover vs bot-row-tint vs ui-hover are distinct design tokens)
  and bot-switcher must stay a bare div for sortablejs; a class-only util
  owning just "flex row + rounded" would not earn its keep.
- **supermarket** (`pages/supermarket/components/`): `market-item-card.vue`
  (list card: leading icon box + title + homepage link + `#actions`),
  `market-detail-header.vue` (detail-page header: back/install action row +
  `#icon` box + title + tag badges; copy is deliberately baked in — read its
  head comment for the fork rule if a third detail-page kind ever appears),
  `info-item.vue` (the label-over-value entry in the detail Information
  section — was a byte-identical inline `h()` component in both detail pages).
- **editor / file compare** (`components/diff-title-bar/index.vue`):
  `DiffTitleBar` — the title strip above a Monaco diff. Owns ONLY the
  container (layout, hairline, padding, type, muted ink); content comes via
  the default slot + optional `#actions`. 2 callers (file-viewer compare,
  monaco diff); per its head comment, a third caller needing a different
  container should inline or fork, not grow props here.
- **dockview** (`pages/home/components/dockview/`): `panel-frame.vue`
  (DockPanelFrame — the host shell every `panel-*.vue` root wraps in:
  `relative flex h-full w-full flex-col` + a `min-h-0 flex-1` content layer
  so panes never re-derive the flex-overflow incantation. `editorSurface`
  prop for the `bg-surface-editor` panels (file/preview/asset); `#header`
  for a top strip like PanelBreadcrumb. New dock panels compose it — never
  hand-write the shell).
- **chat composer dock** (`pages/home/components/`): everything anchored above
  the chat input box is owned here — `composer-dock.vue` (ComposerDock, the
  orchestrator: owns the box-slot mutex — composer by default, the ask_user
  capsule while the agent is asking — plus backdrop-mask geometry and all
  visibility/height logic; the composer is the ONE special member, injected
  via slot because it owns its radius/height morph), `composer-panel.vue`
  (ComposerPanel, the stack tier: approvals / command results / composer
  errors as hairline-separated sections of ONE capsule), and
  `composer-capsule.vue` (ComposerCapsule, the ONLY dock shell — the
  input-group edge + surface-composer + its radius live nowhere else).
  Adding a new STACK-tier member (a decision surface that hugs the box —
  approvals, command results, errors, and their peers) = write a
  `composer-panel-*.vue` section component (content only, like
  `composer-panel-error.vue`'s 17 lines) + register one branch in the panel's
  `sections` computed. A new BOX-tier member (a mutually exclusive occupant of
  the input slot, like the ask_user capsule) does NOT go in `sections` — it
  extends ComposerDock's box-slot mutex and height logic instead, so it
  REPLACES the composer rather than stacking above it. Never hand-write the
  capsule chrome, the mask measurement, or ad-hoc `v-if` stacking above the
  composer again — that is how the four hand-shelled cards this replaced
  drifted.
- **chat tool-call** (`pages/home/components/tool-detail/`): `empty-row.vue`,
  `preview-box.vue` (max-h-48), `header-row.vue` (collapsible row, tone axis,
  `nested` for button-in-button), `expand-chevron.vue`, `capsule.vue`
  (compact/detail density). Read each file's head comment for its stay-local
  exceptions before adding new tool detail panels.

### Plus one atom you already have

**Empty** (`@felinic/ui`) — the framed in-page empty state card. Fold `py-12`/`py-16` as
needed. Loading and empty states must still draw their frame so nothing reflows.

## Which owner? — a decision map

```
Need a bordered card holding rows?              → SettingsSection
  a row: label + a control on one line?         → SettingsRow
  a row whose header expands a body it owns?    → ExpandableSettingsRow
  a clickable "pick this object" row?           → BackendCard
  a dense clickable "open the editor" row?      → ModelListRow (whole row is a <button>;
                                                    if it needs several INLINE actions
                                                    instead of one navigate-away click,
                                                    that's a different relationship —
                                                    see providers/model-item.vue)
Several titled groups of bare (self-bordered)
  content on one page (provider grids)?         → SectionGroup
A stacked form field (label above control)?     → FieldStack (wrap a run in FormStack)
A stat / number tile?                           → MetricReadout (you own the grid)
A vertical, centered entity/add tile?           → PersonaTile
A warning / destructive framed notice?          → CalloutBanner
A device-code "enter this code" moment?         → DeviceCodePanel
A label that swaps with state (Connect↔Cancel)? → LabelSwap (@felinic/ui)
The page frame itself?                          → PageShell
A pane with nothing to show (loading/empty)?    → PanePlaceholder (centered fill)
An in-flow loading row (spinner + text)?        → InlineLoadingRow
Loading inside the triggering button?           → Button :loading
A delete confirmation dialog?                   → ConfirmDeleteDialog
An in-page framed empty state?                  → Empty (draw the frame)
```

## When to STAY hand-written (do not force an owner)

Unification is the goal — but only for shapes that are **the same spatial relationship**.
Keep a shape local when its relationship genuinely differs. The tells:

- **Different geometry for a reason.** A denser list item (`min-h-[3.25rem] py-2.5`, a
  compact model/provider list) is *not* a `3.75rem` settings row. A dialog-body field with
  `text-xs` muted labels + `h-8` inputs is a *tighter inline-form language* than a
  settings-page FieldStack. Same code ≠ same relationship.
- **A different surface.** Sidebar rows, file-tree rows, chat message rows live in
  non-settings surfaces with their own row systems. Owners are for the settings/form/list
  surface, not everywhere a `border-b` appears.
- **A genuinely one-off compound block.** A drag-drop upload target, a
  Monaco/JSON editor, a snapshot input, a link-code countdown, the single real data table
  — no owner covers these; hand-write them. (OAuth device-flow used to sit in this list;
  it graduated to **DeviceCodePanel** once the same shape hit three call sites — the same
  ratchet applies to the rest of this list.)
- **A centered framed placeholder paired with a sibling state** — e.g. a `min-h` framed
  loading block whose twin is a framed empty state in the same slot (bot-container's
  workspace card). The frame + pairing is the relationship; PanePlaceholder (frameless
  pane fill) would break the pair. Keep both local.
- **A compound progress block** (spinner + phase text + progress bar, e.g.
  container-create-progress) — that's a composition, not a loading row.
- **A trivial muted `<p>`** no-results line.
- **A three-piece row: (label | control) line + a full-ROW-width block below** (the
  appearance mermaid row: label|Select with the diagram preview spanning the whole row
  underneath). SettingsRow models TWO pieces — body and trailing control. Stuffing the
  third piece into `#content` bounds it to the content column (left of the control) and
  a centered preview drifts left of the card's axis. Learned from a real 2026-07-06
  visual regression: migrated, caught in review, reverted. Keep such rows local until a
  second instance earns a `#below` slot.

If you're unsure whether two shapes share a relationship, judge by **geometry + context**,
not by class-string similarity. When the answer is "same shape, same size, same surface" →
it's a MISS, give it its owner. When it's "looks similar, but denser / different surface /
one-off" → keep it local and say why.

## Traps (learned the hard way)

- **Tailwind scans literal source text.** A runtime `` `sm:${align}` `` or
  `` `min-h-[${x}]` `` class is **never generated**. Any conditional class must enumerate
  the *full literal strings* (see `SettingsRow`'s `rootClass` computed — every combination
  spelled out). Never build a class by string concatenation.
- **Don't nest a `<button>` in a `<button>`.** `BackendCard`'s root is a real button, so
  you cannot drop an interactive `Switch`/menu into its trailing slot. If a row needs a
  trailing interactive control *and* a whole-row click, that's a hand-rolled
  stretched-overlay pattern — keep it local (this is why `bot-acp` stayed local).
- **A toggle that reveals a *sibling* block is not an ExpandableSettingsRow.**
  ExpandableSettingsRow owns its `#expanded` body. If your button toggles a separate
  block below it (e.g. a run of grouped rows with their own dividers), keep the toggle as a
  plain `SettingsRow` with the button in its default slot, and leave the revealed block
  outside.
- **`#footer` is `justify-end`.** It fits Save/Cancel. A `justify-between` pagination strip
  (summary span on the left, pager on the right) does not fit the current `#footer` — keep
  that footer local until the owner grows a variant.
- **App pages don't lint raw colors.** Tokens only (`bg-card` / `text-foreground` /
  `border-border`); for hover/selected use the overlay ladder (`--ui-hover` / `bg-accent`),
  never a gray or a `/10` alpha. The `check-ui-contract.mjs` guard flags app-scope
  `hover:*`/`bg-*` injections — component chrome belongs in the component (mark a sanctioned
  line with a `/* ui-allow-style */` same-line comment inside the owner, never on a page).
- **The guard warns on a hand-rolled SettingsRow.** `check-ui-contract.mjs` rule 11 (WARN)
  flags `min-h-[3.75rem]` — and its bare-scale twin `min-h-15` — anywhere outside
  `settings/row.vue` and `expandable-row.vue`, because that height only appears when a row
  was copied out of `SettingsRow` as raw divs. It's a WARN (advisory, doesn't block CI), not
  a HARD fail, because a genuinely denser/different row *could* land on that number: if a
  flagged line is a real settings row, compose `<SettingsRow>`; if it's a deliberate
  different shape or a loading placeholder borrowing the height, silence it with
  `ui-allow-shape` on the line — **and the marker must carry its reason on the same line**
  (`ui-allow-shape: <what this is and why no owner fits>`); a bare marker is itself flagged.
- **The guard ratchets hand-spun loaders.** Rule 12 treats a literal `animate-spin` in
  apps/web as a loader that skipped the four-rung ladder (every rung renders through
  `Spinner` / `Button :loading` / `InlineLoadingRow` / `PanePlaceholder`, none of which
  emit that literal from app code). Existing long-tail sites are grandfathered in
  `scripts/ui-spin-baseline.json`; a NEW bare `animate-spin` hard-fails — pick a rung, or
  mark a sanctioned exception with `ui-allow-spin` on the line. Together these are a
  **backstop against regression**, not a debt finder — they catch the SettingsRow and
  loader slices (the rare literals); FieldStack / MetricReadout duplication has no such
  fingerprint and stays a judgment call.

## Migration discipline (when converting a hand-rolled surface)

1. **Read `../web/SKILL.md` first**, then this file, then the page.
2. **Inventory every behavior before editing** — every `v-model`, click handler,
   loading/empty branch, validation, i18n key — and re-wire each after. A refactor must not
   regress.
3. **Migrate only genuine owner-shapes.** Judge each shape against the "stay hand-written"
   tells above. Don't blind-unify; don't force a different-relationship shape into an owner
   to look thorough.
4. **Don't change color, type, radius, shadow, or copy** while migrating spacing. Remove
   now-unused imports.
5. **Verify:** `eslint` (0), `vue-tsc` (0 errors), `node scripts/check-ui-contract.mjs`
   (0 *new* violations — pre-existing debt in other files is not yours to fix here), then a
   **human** confirms the rendered page (dark + narrow + `zh` + walk every old interaction).
   The agent's "it should work" is not verification.

### Batch migrations: the shared-file hazard

When many agents migrate different pages **in parallel**, each `.vue` is safely isolated —
but a migration that adds a validation message writes to the **shared** locale files
(`apps/web/src/i18n/locales/{zh,en,ja}.json`). Parallel writers to the same JSON don't see
each other, so two agents adding a `nameRequired` under the same section produce a **silently
duplicated key** — the JSON still parses, but the later value wins and the earlier one is
lost. This actually happened: five web-search agents each inserted `webSearch.nameRequired`.

So when you fan out a batch:
- Treat the locale files as a **contended resource**. Have each agent add only its own new
  keys under its own file's namespace, never touch existing keys.
- **After** the batch, before committing, run a path-aware duplicate-key check on all three
  locales (parse with a hook that flags a key appearing twice in the *same* object — note a
  key legitimately repeats across *different* objects, e.g. `status`, so scope the check to
  same-parent siblings). Collapse any true in-object duplicates, keeping one reconciled
  value. Do not trust "the JSON parses" — a dup parses fine.
- The cleaner alternative when a batch shares keys: collect the new i18n keys from each
  agent's report and write them yourself in one pass, rather than letting N agents each edit
  the same three files.

## Owner reference

The owner sources are the source of truth — read the component before composing it if a
prop is unclear. The full morphology census and the record of what shipped (and what was
confirmed stays-local) live in `docs/design/spacing/owner-vocabulary-census.md`.
