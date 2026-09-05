<template>
  <!-- THE back affordance for in-page detail surfaces (DetailPane and the
       bot-detail tabs that can't use DetailPane). One component so the
       geometry below is tuned in exactly one place — this used to be
       copy-pasted into every caller and drifted.

       The button surface shares the detail body's left rail, so its hover /
       pressed fill aligns with the card edge below instead of hanging into
       the outer gutter. px-4 keeps the chevron and label comfortably inset. -->
  <Button
    data-settings-detail-back
    variant="ghost"
    :class="buttonClass"
    @click="emit('click')"
  >
    <ChevronLeft class="size-4 shrink-0" />
    <span class="min-w-0 truncate">{{ label }}</span>
  </Button>
</template>

<script setup lang="ts">
// Lifted from the host app's settings owner vocabulary
// (apps/web/components/settings/back-button.vue, now a re-export shim) so the
// back affordance has exactly one implementation. Library-boundary adaptations
// vs the host original:
// - import { Button } from '../button' (was '@felinic/ui').
// Everything else is byte-identical to the host original.
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '../button'

defineProps<{
  label: string
}>()

const emit = defineEmits<{ click: [] }>()

// Geometry rationale in the template comment above. The /85 dim is tuned for
// this sole owner — one consumer doesn't earn a global -soft token.
const buttonClass = 'max-w-full px-4 text-foreground/85' /* ui-allow-alpha: sole owner, see comment above */
</script>
