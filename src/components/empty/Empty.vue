<script setup lang="ts">
// Empty — the "no rows yet" surface. It is the SAME page with nothing in it,
// so it keeps the populated skeleton instead of collapsing into loose text
// (web SKILL § "An empty state keeps the populated skeleton").
//
// Two documented placements want OPPOSITE frames, so the frame is an
// enumerated prop rather than a class each page hand-writes:
//
// - `framed` (default) — the standalone empty. It stands IN FOR the card/grid
//   that will be there once data exists, so it draws that card's frame: one
//   SOLID --border hairline at the Card radius. Solid is the point —
//   `border-dashed` reads "drop zone / add here" and is reserved for the
//   "+ Add another" tile that sits BESIDE real items in an already-populated
//   list (skills/web/reference.md § Dirty → clean). It is not an empty look.
// - `bare` — the empty nested INSIDE a surface that already frames it (a
//   SettingsSection / Card). A second hairline there is card-in-card: two
//   strokes on one visual unit, the stacked-chrome violation (AGENTS.md
//   § The one rule).
//
// History: this shipped as `rounded-lg border-dashed`. `border-dashed` sets
// border-STYLE only — with no width the edge never rendered at all, so every
// standalone empty read as centered gray text floating in whitespace. Adding
// a bare `border` would have shipped the dashed look the contract bans; the
// frame that was missing is the solid one.
import type { HTMLAttributes } from 'vue'
import type { EmptyVariant } from '.'
import { computed } from 'vue'
import { cn } from '#/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  /** Frame rung. `framed` stands alone; `bare` nests inside a card that
   *  already carries the hairline. */
  variant?: EmptyVariant
}>(), {
  variant: 'framed',
})

// Card radius (--radius-xl, 14px), not the control rung the dead `rounded-lg`
// used: a framed empty is the stand-in for the Card/grid it replaces, so it
// must share that corner or a half-loaded page shows two different rounds side
// by side (§ Radius role map).
const frameClass = computed(() => props.variant === 'framed'
  ? 'rounded-xl border border-border'
  : '')
</script>

<template>
  <div
    data-slot="empty"
    :data-variant="props.variant"
    :class="cn(
      'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance p-6 text-center md:p-12',
      frameClass,
      props.class,
    )"
  >
    <slot />
  </div>
</template>
