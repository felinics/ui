// Shared "menu surface" recipe — the single source for every floating list/menu
// (Select, DropdownMenu, ContextMenu, Combobox, …). Centralising the chrome and
// the row interaction here is what prevents the per-component drift that left the
// old DropdownMenu on rounded-lg / shadow-md / border-border / bg-accent while
// Select had already moved to the tokenised menu language. Component-specific bits
// (reka size/origin vars, indicator padding, inset) stay inline in each component.

// Floating panel chrome and base fade. Cursor-positioned context menus keep this
// fade; trigger-anchored panels add menuAnchoredMotionClass below.
// Keyframes own motion, so geometry updates must never inherit a CSS transition.
export const menuContentClass
  = 'bg-popover text-popover-foreground border border-[color:var(--border-menu)] rounded-menu-shell shadow-[var(--shadow-dropdown)] z-(--z-overlay) overflow-x-hidden overflow-y-auto '
    + 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 '
    + 'duration-75 transition-none'

// Shared trigger-anchored motion. Content wrappers supply their Reka transform
// origin; Presence keeps the closed panel mounted through its exit animation.
export const menuAnchoredMotionClass
  = 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-100 data-[state=closed]:duration-120 transition-none motion-reduce:animate-none'

// Opt-in directional slide: a 1-unit drift in *from the trigger side*. Add it to
// trigger-anchored surfaces (Dropdown/Select content, every sub-content) so the
// panel reads as growing out of its trigger. Do NOT add it to a root ContextMenu —
// that opens at the pointer with no side to anchor to, so a sideways slide is wrong.
export const menuSlideClass
  = 'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1'

// Inner padding/gap for a menu panel: 4px frame, gap-0.5 rows. Select puts
// this on its SelectViewport;
// flatter menus put it straight on the content box.
export const menuViewportClass = 'menu-viewport flex flex-col gap-(--menu-row-gap) p-(--menu-frame-spacing)'

// Chrome-only subset of menuContentClass, for the inner panel div of a menu host
// (Popover with `menu`). The host carries the overlay-tier z-index (--z-overlay)
// / overflow / animation on its own
// box; this carries only the hairline + shadow + radius + surface tokens that the
// inner div also needs, so the chrome quartet isn't hand-copied at every call site.
export const menuChromeClass
  = 'flex flex-col overflow-hidden rounded-menu-shell border border-[color:var(--border-menu)] bg-popover text-popover-foreground shadow-[var(--shadow-dropdown)]'

// Virtualized listbox viewport: the scroll container for a searchable list whose
// rows are absolutely positioned (so it can't take menuViewportClass's
// `flex flex-col gap-0.5`). Inter-row spacing comes from the virtualizer's `gap`
// option, not a wrapper. `scroll-my-1` keeps keyboard-scrolled rows off the edge.
/** @deprecated Use MenuScrollArea with layout="virtual" and its viewportElement. */
export const virtualListboxClass = 'max-h-64 scroll-my-1 overflow-y-auto p-(--menu-frame-spacing)'

// How far to shift a menu left (negative alignOffset) so its first row's TEXT
// lands under the trigger's TEXT — not the menu box edge under the trigger edge.
// This is a geometric consequence of the shared insets, not a magic number:
//   menu text from its edge = border(1) + menuViewportClass frame(4) + menuItemClass px-3(12) = 17
//   trigger text from its edge = selectTriggerClass px-3 = 12
//   delta = 17 - 12 = 5 → shift the menu left by 5px so the two text columns line up.
// Applied by any menu host anchored to a selectTrigger (SelectContent, and the
// searchable-select-popover family). Long-content selects that widen the panel
// past the trigger (model-select) opt out and align the box edge instead.
export const menuAlignOffset = -5

// Search field header inside a menu host (SearchableSelectPopover, ModelOptions):
// a 40px row with a bottom hairline. The input's px-4 (16) lines its text up with
// the row text (border(1) + viewport frame(4) + item px-3(12) = 17 — the 1px is
// the chrome border the search row sits inside, so both land at 17 from the panel
// edge). Shared so the two searchable surfaces don't each hand-write the header.
export const menuSearchHeaderClass = 'flex h-10 shrink-0 items-center gap-2 border-b border-border/40 px-4'
// Coarse-pointer devices use the tokenized 16px title size: iOS Safari
// auto-zooms a focused field below 16px in portrait or landscape, and that zoom
// can strand the viewport after the keyboard closes. Fine-pointer desktop keeps
// the 14px menu rhythm regardless of viewport width.
export const menuSearchInputClass = 'flex h-full w-full bg-transparent text-control [@media(pointer:coarse)]:text-title outline-hidden placeholder:text-muted-foreground'

// One menu row: layout + roving-focus highlight. Geometry is pinned to the
// shared row contract: px-3 / py-2 / text-control (14px) / rounded-menu
// (8px) — so every menu shares the exact same row height, text size and inset.
// The highlight is reka's [data-highlighted] (the reka/Radix equivalent of shadcn's
// focus:bg-accent), so it simply follows the pointer/keyboard. The selected value is
// shown by an indicator (check / dot), never by the row background. Components only
// override the right gutter for an indicator (pr-8) or the left for an inset (pl-8).
export const menuItemClass
  = 'menu-item relative flex w-full cursor-default items-center gap-2 rounded-menu px-3 py-2 text-control leading-(--text-label--line-height) outline-hidden select-none transition-colors duration-[60ms] data-[highlighted]:bg-[color:var(--ui-selected)] data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg:not([class*=text-])]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4'

// Quiet hairline divider; the shared menu viewport owns its inset and gap clearance.
export const menuSeparatorClass = 'bg-(--menu-separator-color) pointer-events-none my-1 h-px'

// Section heading inside a menu — a quiet, muted group marker. One notch
// smaller/dimmer than rows (text-body, medium) and short (py-1) so it reads as a
// header, not the heavy full-height band the old menus had.
// cursor-default + select-none: a heading is NOT interactive, so it must show the
// arrow (not the I-beam that `cursor: auto` paints over selectable text) and not be
// selectable — same as every menu row.
// pl-2 (not the rows' px-2.5): optical-alignment compensation. The heading is a
// smaller type size than the rows, so matching the box padding makes it read as
// sitting slightly RIGHT of the row text; trimming 2px pulls its left edge back so
// the heading and the row labels line up to the eye.
export const menuLabelClass = 'text-muted-foreground cursor-default pr-2.5 pl-2 py-1 text-body font-medium select-none'

// Short labels retain a comfortable menu width; narrow screens may shrink it.
export const menuWidthClass = 'min-w-[min(var(--menu-min-width),calc(100vw-1rem))]'

// Shared stroke for submenu direction hints.
export const menuIndicatorStrokeWidth = 1.75
