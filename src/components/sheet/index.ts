export { default as Sheet } from './Sheet.vue'
export { default as SheetBody } from './SheetBody.vue'
export { default as SheetClose } from './SheetClose.vue'
export { default as SheetContent } from './SheetContent.vue'
export { default as SheetDescription } from './SheetDescription.vue'
export { default as SheetFooter } from './SheetFooter.vue'
export { default as SheetHeader } from './SheetHeader.vue'
export { default as SheetPanel } from './SheetPanel.vue'
export { default as SheetTitle } from './SheetTitle.vue'
export { default as SheetTrigger } from './SheetTrigger.vue'

// SheetPanel.width is a plain string-literal prop in SheetPanel.vue (no cva —
// each rung is one `sm:max-w-*`), so the axis keys live here next to the
// re-exports as the single source the showcase spec consumes
// (tabsListVariantKeys precedent).
export type SheetPanelWidth = 'sm' | 'md' | 'lg' | 'xl'

export const sheetPanelWidthKeys = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly SheetPanelWidth[]
