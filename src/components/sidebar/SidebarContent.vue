<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { onBeforeUnmount } from 'vue'
import { cn } from '#/lib/utils'
import { createScrollHover } from '#/lib/scroll-hover'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const scrollHover = createScrollHover()

onBeforeUnmount(scrollHover.dispose)
</script>

<template>
  <div
    data-slot="sidebar-content"
    data-sidebar="content"
    :class="cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', props.class)"
    @pointermove="scrollHover.pointerMove"
    @pointerleave="scrollHover.pointerLeave"
    @scroll.capture.passive="scrollHover.scroll"
  >
    <slot />
  </div>
</template>
