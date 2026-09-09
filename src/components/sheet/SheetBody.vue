<script setup lang="ts">
// SheetBody — the scrollable middle row of a SheetPanel. Counterpart to
// DialogBody, minus the scroll-gutter hack: DialogBody has to pull the
// scrollbar out of DialogContent's own p-6 (`-mr-3 pr-3`), whereas the sheet's
// padding lives HERE, so the scrollbar already lands on the panel edge and the
// content keeps its full gutter. Nothing left for a caller to transcribe.
//
// The vertical rhythm of the fields inside is NOT this component's business —
// stacking Fields is FieldGroup's job (gap-5). One owner per concern.
import type { HTMLAttributes } from 'vue'
import { cn } from '#/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="sheet-body"
    :class="cn('overflow-y-auto p-4', props.class)"
  >
    <slot />
  </div>
</template>
