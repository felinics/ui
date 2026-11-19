<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#/lib/utils'

interface SkeletonProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<SkeletonProps>()
</script>

<template>
  <!-- bg-skeleton is the zero-chroma translucent resting fill (also the reduced-motion
       fallback); the sliding translucent shimmer seam is driven by [data-slot=skeleton]
       in style.css so both layers composite cleanly over neutral or tinted surfaces. -->
  <div
    data-slot="skeleton"
    :class="cn('rounded-lg bg-skeleton', props.class)"
  />
</template>
