<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { surfaceEdgeClass } from '#/lib/surface'
import { cn } from '#/lib/utils'

const props = defineProps<{
  /** Keep a boundary when nested inside another card-colored surface. */
  bordered?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="table-container"
    class="relative w-full overflow-auto rounded-lg bg-card"
    :class="surfaceEdgeClass(bordered)"
  >
    <table
      data-slot="table"
      :class="cn('w-full caption-top text-label', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
