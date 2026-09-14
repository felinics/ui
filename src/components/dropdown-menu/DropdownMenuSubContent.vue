<script setup lang="ts">
import type { DropdownMenuSubContentEmits, DropdownMenuSubContentProps } from 'reka-ui'
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  DropdownMenuSubContent,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { menuWidthClass, menuContentClass, menuAnchoredMotionClass } from '#/lib/menu'
import MenuScrollArea from '../menu-scroll-area/MenuScrollArea.vue'
import { useSubmenuAlignment } from '../../lib/useSubmenuAlignment'
import { cn } from '#/lib/utils'

const props = withDefaults(defineProps<DropdownMenuSubContentProps & {
  class?: HTMLAttributes['class']
  /** Information panels can align their top edge with the parent menu. */
  alignment?: 'first-item' | 'parent-start'
  /** Searchable/virtualized content owns its own scroll viewport and frame. */
  scrollable?: boolean
}>(), { scrollable: true })
const emits = defineEmits<DropdownMenuSubContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'scrollable', 'alignment')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const menuArea = ref<InstanceType<typeof MenuScrollArea>>()
const customBody = ref<HTMLElement>()
const currentElement = computed(() => (menuArea.value?.viewportElement ?? customBody.value)
  ?.closest<HTMLElement>('[data-slot="dropdown-menu-sub-content"]') ?? undefined)
const { alignOffset, ready } = useSubmenuAlignment(currentElement, () => props.alignment ?? 'first-item')
// Start the entrance on a fresh frame after mounting and placement have settled.
// Otherwise a long list can consume the animation before its first visible paint.
const motionReady = ref(false)
watch(ready, (value, _, cleanup) => {
  motionReady.value = false
  if (!value) return
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => { motionReady.value = true })
  })
  cleanup(() => cancelAnimationFrame(frame))
}, { flush: 'post' })
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuSubContent
      data-slot="dropdown-menu-sub-content"
      v-bind="forwarded"
      :align-offset="props.alignOffset ?? alignOffset"
      :style="{ visibility: ready ? undefined : 'hidden' }"
      :class="cn(menuWidthClass, menuContentClass, menuAnchoredMotionClass, 'flex min-h-0 flex-col overflow-hidden max-h-(--reka-dropdown-menu-content-available-height) origin-(--reka-dropdown-menu-content-transform-origin)', props.class, !motionReady && 'animate-none! opacity-0')"
    >
      <MenuScrollArea
        v-if="scrollable"
        ref="menuArea"
      >
        <slot />
      </MenuScrollArea>
      <div
        v-else
        ref="customBody"
        class="contents"
      >
        <slot />
      </div>
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
