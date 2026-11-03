<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TextareaRest, TextareaSurface } from '.'
import { useVModel } from '@vueuse/core'
import { computed } from 'vue'
import { cn } from '#/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  size?: 'sm' | 'default' | 'lg'
  // The edge while the field is not focused:
  //  - 'edge' (default): the resting hairline every form field wears
  //  - 'bare': no edge, so an in-place editor renders exactly like the content
  //    it replaced until it is focused; focus and invalid still draw the edge
  rest?: TextareaRest
  // The surface the field is painted on, which picks the solid edge that reads
  // against it: 'plain' (default) or 'brand-tint' (--field-edge-brand-tint).
  // The fill itself stays the caller's.
  surface?: TextareaSurface
}>(), {
  size: 'default',
  rest: 'edge',
  surface: 'plain',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const sizeClass = computed(() => ({
  sm: 'min-h-14 px-2.5 py-1.5 text-body',
  default: 'min-h-16 px-3 py-2 text-label',
  lg: 'min-h-20 px-3.5 py-2.5 text-control',
}[props.size]))
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :data-size="props.size"
    :data-rest="props.rest === 'bare' ? 'bare' : undefined"
    :data-surface="props.surface === 'brand-tint' ? 'brand-tint' : undefined"
    :class="cn(
      'flex field-sizing-content w-full rounded-md tracking-[0.01em] text-foreground',
      sizeClass,
      'outline-none resize-none',
      'disabled:cursor-not-allowed disabled:opacity-40',
      props.class
    )"
  />
</template>
