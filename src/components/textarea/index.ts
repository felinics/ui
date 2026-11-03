export { default as Textarea } from './Textarea.vue'

// Single sources of truth for the rest and surface axes (see Textarea.vue);
// consumed by the showcase spec so its controls never hand-maintain the lists.
export const textareaRestKeys = ['edge', 'bare'] as const
export type TextareaRest = typeof textareaRestKeys[number]
export const textareaSurfaceKeys = ['plain', 'brand-tint'] as const
export type TextareaSurface = typeof textareaSurfaceKeys[number]
