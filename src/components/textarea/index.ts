export { default as Textarea } from './Textarea.vue'

// Single sources of truth for the engage and surface axes (see Textarea.vue);
// consumed by the showcase spec so its controls never hand-maintain the lists.
export const textareaEngageKeys = ['focus', 'hover'] as const
export type TextareaEngage = typeof textareaEngageKeys[number]
export const textareaSurfaceKeys = ['plain', 'brand-tint'] as const
export type TextareaSurface = typeof textareaSurfaceKeys[number]
