<script setup lang="ts">
import type { DropdownMenuSubContentEmits, DropdownMenuSubContentProps } from 'reka-ui'
import { computed, ref, type HTMLAttributes } from 'vue'
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

const props = defineProps<DropdownMenuSubContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuSubContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const menuArea = ref<InstanceType<typeof MenuScrollArea>>()
const currentElement = computed(() => menuArea.value?.viewportElement?.closest<HTMLElement>('[data-slot="dropdown-menu-sub-content"]') ?? undefined)
const { alignOffset, ready } = useSubmenuAlignment(currentElement)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuSubContent
      data-slot="dropdown-menu-sub-content"
      v-bind="forwarded"
      :align-offset="props.alignOffset ?? alignOffset"
      :style="{ visibility: ready ? undefined : 'hidden' }"
      :class="cn(menuWidthClass, menuContentClass, menuAnchoredMotionClass, 'flex min-h-0 flex-col overflow-hidden max-h-(--reka-dropdown-menu-content-available-height) origin-(--reka-dropdown-menu-content-transform-origin)', props.class)"
    >
      <MenuScrollArea ref="menuArea">
        <slot />
      </MenuScrollArea>
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
