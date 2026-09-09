<script setup lang="ts">
// SheetPanel — the header/body/footer sheet shell, as a COMPONENT instead of a
// recipe. Sibling of DialogPanel (§ Motion): same reasoning, other surface.
//
// Before this existed, every form drawer had to reassemble the shell by hand on
// the call site, and the shape it converged on is the tell:
//
//   <SheetContent class="w-[calc(100%-1rem)] sm:max-w-lg gap-0">
//     <div class="contents"><SheetHeader class="border-b border-border">…
//     …<SheetFooter class="border-t border-border flex-row justify-end">
//
// Every fragment of that is a contract failing the acceptance test in
// § Compose, don't style: a width the caller had to invent, `gap-0` undoing the
// component's own gap, structural borders injected onto components (dirty
// pattern 2), and `class="contents"` wrappers whose only job was to flatten the
// author's markup back into the flex/grid flow the shell should have owned. The
// component now owns all four, so a caller writes content only.
//
// Anatomy — three children, no classes:
//   <SheetPanel width="lg" footer>
//     <SheetHeader> <SheetTitle/> <SheetDescription/> </SheetHeader>
//     <SheetBody>   …fields (compose a FieldGroup)…   </SheetBody>
//     <SheetFooter> …actions…                        </SheetFooter>
//   </SheetPanel>
//
// Props are the ONLY knobs a caller should need:
// - width:   panel width rung, enumerated so the next rung is added HERE,
//   deliberately, instead of a per-page `sm:max-w-[…]`. Narrow screens are NOT
//   a rung: the panel is always viewport-minus-a-sliver there, so the scrim
//   stays visible (and tappable) without the caller doing the calc.
// - side:    left | right only. A sheet's row grid is a vertical stack, which a
//   top/bottom sheet doesn't want; those stay on plain SheetContent.
// - footer:  adds the third auto row AND the footer's top hairline. Deliberately
//   a prop, not slot-sniffing — same reason as DialogPanel: the rows must be a
//   static class for the CSS to exist, and a declared-but-empty row would still
//   draw a stray divider at the panel bottom.
//
// The structural hairlines live here, on the panel, as child-scoped variants —
// NOT on SheetHeader/SheetFooter themselves. A bare Sheet (mobile nav, a filter
// drawer) is a single flowing surface with nothing to divide; the dividers are
// a property of the THREE-ROW composition, so the composition owns them. That
// also keeps them out of reach of the page, which is the whole point.
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { SheetPanelWidth } from '.'
import { reactiveOmit } from '@vueuse/core'
import { useForwardPropsEmits } from 'reka-ui'
import { cn } from '#/lib/utils'
import SheetContent from './SheetContent.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DialogContentProps & {
  class?: HTMLAttributes['class']
  /** Panel width rung. Add rungs here deliberately — not per-page. */
  width?: SheetPanelWidth
  /** Edge the panel is anchored to. */
  side?: 'left' | 'right'
  /** Reserve the third grid row (and its top hairline) for a SheetFooter. */
  footer?: boolean
}>(), {
  width: 'md',
  side: 'right',
  footer: false,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'width', 'footer')
const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Full literal strings (not interpolation) so Tailwind's scanner sees them.
// The rungs are the Dialog family's, one notch tighter: a side drawer reads
// narrower than a centered dialog at the same nominal width.
const WIDTH = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
} as const
</script>

<template>
  <SheetContent
    v-bind="{ ...$attrs, ...forwarded }"
    :class="cn(
      // Rows, not the base flex column: minmax(0,1fr) is what caps the body so
      // it scrolls INSIDE the panel instead of pushing the footer off-screen
      // (same fragment DialogPanel exists to stop people mis-copying).
      'grid gap-0',
      footer ? 'grid-rows-[auto_minmax(0,1fr)_auto]' : 'grid-rows-[auto_minmax(0,1fr)]',
      // Below the sm cap the panel is the viewport minus a 1rem sliver, so the
      // scrim stays visible and tappable. The caller never computes this.
      'w-[calc(100%-1rem)]',
      WIDTH[width],
      // Structural edges (§ Borders — the solid neutral --border family, which
      // is exactly what a container divider is for). Scoped to direct children
      // so they can never leak into nested content.
      '*:data-[slot=sheet-header]:border-b *:data-[slot=sheet-header]:border-border',
      footer && '*:data-[slot=sheet-footer]:border-t *:data-[slot=sheet-footer]:border-border',
      // …and the footer's action row. SheetFooter's own base is the STACKED
      // mobile-nav shape (full-width buttons in a column); a form drawer wants
      // the Dialog footer convention — quiet action first, primary last,
      // right-aligned, stacking (primary on top) only when the panel is
      // narrower than sm. Same ownership call as the dividers: it belongs to
      // the three-row composition, not to SheetFooter, and never to the page.
      footer && '*:data-[slot=sheet-footer]:flex-col-reverse sm:*:data-[slot=sheet-footer]:flex-row sm:*:data-[slot=sheet-footer]:justify-end',
      props.class,
    )"
  >
    <slot />
  </SheetContent>
</template>
