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
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 transition-all',
        surfaceEdgeClass(props.bordered),
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
