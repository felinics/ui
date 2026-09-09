<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TextareaVariant } from '.'
import { useVModel } from '@vueuse/core'
import { computed } from 'vue'
import { cn } from '#/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  size?: 'sm' | 'default' | 'lg'
  /** Content role. `code` is the machine-text rung — a JSON body, a prompt
   *  template, a config blob. See the note on codeClass below. */
  variant?: TextareaVariant
}>(), {
  size: 'default',
  variant: 'default',
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

// `code` is a content ROLE, not a free-form skin: the caller says "this field
// holds machine text" and the component decides what that looks like. Without
// it, the only way to get a JSON/config editor was injecting class="font-mono"
// — the className red line (§ Compose, don't style). The guard happens not to
// catch `font-*` yet, but the rule already banned it.
//
// It resets tracking as well as swapping family: the base +0.01em is prose
// tracking tuned for the sans stack, and stacking it on a monospace's already
// wide advance makes columns drift. Orthogonal to `size` (that owns the type
// rung) — a code textarea is still sm/default/lg. Vocabulary note: Badge's
// `font: mono` axis is a pure family switch on a chip; this is the role hook a
// code SURFACE hangs off, so future editor affordances (tab-size, no-wrap)
// land here instead of being re-derived per page.
const codeClass = computed(() => props.variant === 'code' ? 'font-mono tracking-normal' : '')
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :data-size="props.size"
    :data-variant="props.variant"
    :class="cn(
      'flex field-sizing-content w-full rounded-md tracking-[0.01em] text-foreground',
      sizeClass,
      codeClass,
      'outline-none resize-none',
      'disabled:cursor-not-allowed disabled:opacity-40',
      props.class
    )"
  />
</template>
