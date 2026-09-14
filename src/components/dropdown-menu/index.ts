export { default as DropdownMenu } from './DropdownMenu.vue'

export { default as DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem.vue'
export { default as DropdownMenuContent } from './DropdownMenuContent.vue'
export { default as DropdownMenuGroup } from './DropdownMenuGroup.vue'
export { default as DropdownMenuItem } from './DropdownMenuItem.vue'
export { default as DropdownMenuSummary } from './DropdownMenuSummary.vue'
export { default as DropdownMenuLabel } from './DropdownMenuLabel.vue'
export { default as DropdownMenuRadioGroup } from './DropdownMenuRadioGroup.vue'
export { default as DropdownMenuRadioItem } from './DropdownMenuRadioItem.vue'
export { default as DropdownMenuSeparator } from './DropdownMenuSeparator.vue'
export { default as DropdownMenuShortcut } from './DropdownMenuShortcut.vue'
export { default as DropdownMenuSub } from './DropdownMenuSub.vue'
export { default as DropdownMenuSubContent } from './DropdownMenuSubContent.vue'
export { default as DropdownMenuSubTrigger } from './DropdownMenuSubTrigger.vue'
export { default as DropdownMenuTrigger } from './DropdownMenuTrigger.vue'
export { DropdownMenuPortal } from 'reka-ui'

// Single source of truth for the item variant axis, consumed by the showcase
// spec so its controls panel never hand-maintains a list. Unlike badge/button,
// DropdownMenuItem declares `variant` as a plain prop union (not a cva config),
// so the keys are mirrored here — keep in sync with the withDefaults() in
// DropdownMenuItem.vue.
export type DropdownMenuItemVariant = 'default' | 'destructive'
export const dropdownMenuItemVariantKeys = [
  'default',
  'destructive',
] as const satisfies readonly DropdownMenuItemVariant[]
