<script setup lang="ts">
import type { ContextMenuSubContentEmits, ContextMenuSubContentProps } from 'reka-ui'
import { computed, ref, type HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  ContextMenuSubContent,
  ContextMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { menuWidthClass, menuContentClass, menuAnchoredMotionClass } from '#/lib/menu'
import MenuScrollArea from '../menu-scroll-area/MenuScrollArea.vue'
import { useSubmenuAlignment } from '../../lib/useSubmenuAlignment'
import { cn } from '#/lib/utils'

const props = defineProps<ContextMenuSubContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<ContextMenuSubContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const menuArea = ref<InstanceType<typeof MenuScrollArea>>()
const currentElement = computed(() => menuArea.value?.viewportElement?.closest<HTMLElement>('[data-slot="context-menu-sub-content"]') ?? undefined)
const { alignOffset, ready } = useSubmenuAlignment(currentElement)
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuSubContent
      data-slot="context-menu-sub-content"
      v-bind="forwarded"
      :align-offset="props.alignOffset ?? alignOffset"
      :style="{ visibility: ready ? undefined : 'hidden' }"
      :class="
        cn(
          menuWidthClass,
          menuContentClass,
          menuAnchoredMotionClass,
          'flex min-h-0 flex-col overflow-hidden max-h-(--reka-context-menu-content-available-height) origin-(--reka-context-menu-content-transform-origin)',
          props.class,
        )
      "
    >
      <MenuScrollArea ref="menuArea">
        <slot />
      </MenuScrollArea>
    </ContextMenuSubContent>
  </ContextMenuPortal>
</template>
