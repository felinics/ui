<script setup lang="ts">
import type { Component } from 'vue'
import type { SidebarMenuButtonProps } from './SidebarMenuButtonChild.vue'
import { reactiveOmit } from '@vueuse/core'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/tooltip'
import SidebarMenuButtonChild from './SidebarMenuButtonChild.vue'
import { useSidebar } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SidebarMenuButtonProps & {
  /**
   * Label shown when the rail is collapsed to icons.
   *
   * ONLY EFFECTIVE UNDER `<Sidebar collapsible="icon">`. The tooltip is gated
   * on `state === 'collapsed'` (see TooltipContent's `:hidden` below), and
   * under `collapsible="offcanvas"` — the default — a collapsed sidebar is
   * slid off the viewport entirely, so there is no visible trigger to hover:
   * the tooltip can never render. Passing one there is dead copy that reads as
   * shipped a11y text but reaches nobody. It is also suppressed on mobile,
   * where the sidebar is a Sheet and hover does not exist.
   */
  tooltip?: string | Component
}>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})

const { isMobile, state } = useSidebar()

const delegatedProps = reactiveOmit(props, 'tooltip')
</script>

<template>
  <SidebarMenuButtonChild
    v-if="!tooltip"
    v-bind="{ ...delegatedProps, ...$attrs }"
  >
    <slot />
  </SidebarMenuButtonChild>

  <Tooltip v-else>
    <TooltipTrigger as-child>
      <SidebarMenuButtonChild v-bind="{ ...delegatedProps, ...$attrs }">
        <slot />
      </SidebarMenuButtonChild>
    </TooltipTrigger>
    <TooltipContent
      side="right"
      align="center"
      :hidden="state !== 'collapsed' || isMobile"
    >
      <template v-if="typeof tooltip === 'string'">
        {{ tooltip }}
      </template>
      <component
        :is="tooltip"
        v-else
      />
    </TooltipContent>
  </Tooltip>
</template>
