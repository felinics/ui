<script setup lang="ts">
import type { InfoHintSide } from '.'
import { Info } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'

const props = withDefaults(defineProps<{
  // The explanation itself: shown in the tooltip and read as the glyph's
  // accessible name.
  text: string
  side?: InfoHintSide
}>(), {
  side: 'top',
})
</script>

<template>
  <!-- An ⓘ that only explains — not an action, so not a <Button>: no hover
       chip, no pointer cursor. The glyph takes the icon ladder's text rung
       (12px) because it sits beside text-scale labels, and stays muted. It is
       still a tab stop so keyboard users can open the hint; its focus ring is
       the standard --ring recipe. The tooltip opens without delay: showing the
       hint is the glyph's whole job. -->
  <TooltipProvider :delay-duration="0">
    <Tooltip>
      <TooltipTrigger as-child>
        <span
          data-slot="info-hint"
          tabindex="0"
          role="img"
          :aria-label="props.text"
          class="inline-flex shrink-0 cursor-default rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <Info
            class="size-3"
            aria-hidden="true"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent :side="props.side">
        {{ props.text }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
