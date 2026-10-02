export { default as Textarea } from './Textarea.vue'

// Textarea.size / .variant are plain string-literal props in Textarea.vue (no
// cva — each rung is one entry of a class map), so the axis keys live here next
// to the re-export as the single source the showcase spec consumes
// (tabsListVariantKeys precedent).
export type TextareaVariant = 'default' | 'code'
export type TextareaSize = 'sm' | 'default' | 'lg'

export const textareaVariantKeys = ['default', 'code'] as const satisfies readonly TextareaVariant[]
export const textareaSizeKeys = ['default', 'sm', 'lg'] as const satisfies readonly TextareaSize[]
