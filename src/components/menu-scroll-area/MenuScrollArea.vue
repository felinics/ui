<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { computed, ref } from 'vue'
import { Primitive, ScrollAreaRoot, ScrollAreaViewport } from 'reka-ui'
import { ScrollBar } from '../scroll-area'
import { useScrollFade } from '../../lib/useScrollFade'
import { menuViewportClass } from '../../lib/menu'
import { cn } from '../../lib/utils'

const props = withDefaults(defineProps<{
  /** Reka viewport adapter; as-child keeps one physical scroll element. */
  viewportAs?: Component
  viewportAttrs?: HTMLAttributes & Record<string, unknown>
  /** Virtualizers own their spacer and row positioning, but share this viewport. */
  layout?: 'list' | 'virtual'
}>(), { viewportAs: () => Primitive, layout: 'list' })

const viewport = ref<InstanceType<typeof ScrollAreaViewport> | null>(null)
const element = computed(() => viewport.value?.viewportElement)
defineExpose({ viewportElement: element })
const { fadeTop, fadeBottom } = useScrollFade(element)
</script>

<template>
  <ScrollAreaRoot
    type="hover"
    :scroll-hide-delay="300"
    class="relative m-(--menu-frame-spacing) flex min-h-0 flex-col"
  >
    <component
      :is="props.viewportAs"
      as-child
      v-bind="props.viewportAttrs"
    >
      <ScrollAreaViewport
        ref="viewport"
        data-slot="menu-scroll-viewport"
        class="scroll-fade min-h-0 max-h-(--menu-viewport-max-height)"
        :style="{
          '--scroll-fade-top': fadeTop ? '16px' : '0px',
          '--scroll-fade-bottom': fadeBottom ? '16px' : '0px',
        }"
        :tabindex="props.viewportAttrs?.tabindex ?? -1"
      >
        <div :class="props.layout === 'virtual' ? '' : cn(menuViewportClass, 'p-0')">
          <slot />
        </div>
      </ScrollAreaViewport>
    </component>
    <ScrollBar />
  </ScrollAreaRoot>
</template>
