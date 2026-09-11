<script setup lang="ts">
// DialogBody — the scrollable body row of a capped dialog
// (DialogContent class="max-h-[80dvh] grid-rows-[auto_minmax(0,1fr)]").
// Two jobs, both previously hand-written per page:
//
// 1. Scroll gutter: `-mr-3 pr-3` pushes the scrollbar out of the content
//    column toward the DialogContent edge so text keeps the full p-6 width.
// 2. Scroll-edge fade: content that continues past the visible box fades out
//    over the last ~16px instead of being hard-clipped by the row boundary.
//    The fade is STATEFUL, not decorative — each edge only fades while there
//    is actually more content in that direction (at the top the top fade is
//    off; at the bottom the bottom fade is off; content shorter than the box
//    shows no fade at all). Driven by two @property-registered <length> vars
//    so the fade itself eases in/out (a fade that pops on at scroll start
//    would be the same hard cut one level up).
//
// The mask necessarily covers the scrollbar's first/last few px too — at 16px
// on a hairline scrollbar this is imperceptible, accepted trade-off.
//
// This is a plain div, NOT the AutoHeight primitive: AutoHeight's root is
// overflow-hidden (it clips its height tween) so it can never be the
// scroller. Nest it: <DialogBody><AutoHeight>…</AutoHeight></DialogBody>.
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { useScrollFade } from '#/lib/useScrollFade'
import { cn } from '#/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const el = ref<HTMLElement | null>(null)
const { fadeTop, fadeBottom } = useScrollFade(el)
</script>

<template>
  <div
    ref="el"
    data-slot="dialog-body"
    class="scroll-fade -mr-3 overflow-y-auto pr-3"
    :class="cn(props.class)"
    :style="{
      '--scroll-fade-top': fadeTop ? '16px' : '0px',
      '--scroll-fade-bottom': fadeBottom ? '16px' : '0px',
    }"
  >
    <slot />
  </div>
</template>
