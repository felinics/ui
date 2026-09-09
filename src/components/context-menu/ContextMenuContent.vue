<script setup lang="ts">
import type { ContextMenuContentEmits, ContextMenuContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  ContextMenuContent,
  ContextMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { menuWidthClass, menuContentClass, menuAnchoredMotionClass } from '#/lib/menu'
import MenuScrollArea from '../menu-scroll-area/MenuScrollArea.vue'
import { cn } from '#/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ContextMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<ContextMenuContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuContent
      data-slot="context-menu-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn(
        menuWidthClass,
        menuContentClass,
        menuAnchoredMotionClass,
        'origin-(--reka-context-menu-content-transform-origin)',
        'flex min-h-0 flex-col overflow-hidden max-h-(--reka-context-menu-content-available-height)',
        props.class,
      )"
    >
      <MenuScrollArea><slot /></MenuScrollArea>
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
