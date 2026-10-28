<script setup lang="ts">
import type { InfoHintAlign, InfoHintSide } from '.'
import { Info } from 'lucide-vue-next'
import { ref } from 'vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'

const props = withDefaults(defineProps<{
  // The explanation itself: shown in the tooltip and read as the glyph's
  // accessible name.
  text: string
  side?: InfoHintSide
  // Where the tooltip sits along that side. A glyph beside taller controls
  // passes the edge that points away from them ('end' when they are to its
  // right), so the tooltip never lands on them.
  align?: InfoHintAlign
}>(), {
  side: 'top',
  align: 'center',
})

const open = ref(false)
// The Tooltip opens on hover and keyboard focus but ignores touch (it skips
// touch pointermove and closes on every trigger press), so a tap toggles it
// here. pointerdown records how the following click was made; a mouse click
// leaves the hover-driven state alone.
let pointerType = ''
function onPointerDown(event: PointerEvent) {
  pointerType = event.pointerType
}
function onClick() {
  if (pointerType === 'touch' || pointerType === 'pen') open.value = !open.value
}
</script>

<template>
  <!-- An ⓘ that only explains — not an action, so not a <Button>: no hover
       chip, no pointer cursor. The glyph takes the icon ladder's 14px rung:
       a thin, muted outline circle reads smaller than solid text of the same
       height, so it sits one notch above the label's cap height to look level
       with it. It is still a tab stop so keyboard users can open the hint; its
       focus ring is the standard --ring recipe. The tooltip opens without
       delay: showing the hint is the glyph's whole job. The trigger keeps the
       tooltip open on press (disable-closing-trigger) so the tap toggle above
       is the only thing a tap does; a tap elsewhere, blur or scroll closes it.
       The ::after widens the hit area by 6px each side, to 26px — past the
       24px minimum target — without moving the glyph; 6px is also the
       action-row gap, so it never reaches into a neighbouring button.
       The tooltip is narrower than the generic 320px and balances its lines:
       the hint is one full sentence, and at full width it wraps a lone last
       character on a phone. collision-padding keeps it off the screen edge. -->
  <TooltipProvider :delay-duration="0">
    <Tooltip
      v-model:open="open"
      disable-closing-trigger
    >
      <TooltipTrigger as-child>
        <span
          data-slot="info-hint"
          tabindex="0"
          role="img"
          :aria-label="props.text"
          class="relative inline-flex shrink-0 cursor-default rounded-full text-muted-foreground outline-none after:absolute after:-inset-1.5 after:content-[''] focus-visible:ring-2 focus-visible:ring-ring/30"
          @pointerdown="onPointerDown"
          @click="onClick"
        >
          <Info
            class="size-3.5"
            aria-hidden="true"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent
        :side="props.side"
        :align="props.align"
        :collision-padding="8"
        class="max-w-60 text-balance"
      >
        {{ props.text }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
