<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
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
    class="relative w-full overflow-auto rounded-lg border border-border bg-card"
    :class="!bordered && 'dark:border-0'"
  >
    <table
      data-slot="table"
      :class="cn('w-full caption-top text-label', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
