<script setup lang="ts">
import { computed } from 'vue'
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from 'reka-ui'
import { surfaceEdgeClass } from '#/lib/surface'

// SurfaceCard — a standalone card surface with free-form content: a plan
// summary, a page identity header, a list container. It owns the same shell as
// the SettingsSection card (menu-shell radius, bg-card, structural edge that
// drops in dark mode) so pages stop hand-writing `rounded-… border bg-card`
// and missing the dark-mode edge rule. Use SettingsSection when the content is
// settings rows under a title; use this when the body is not rows.
//
// The caller arranges its own content (flex / grid / gap) through `class`;
// shell appearance — radius, fill, edge, padding — stays here, with padding as
// an enumerated rung so a new size is added here deliberately.
const props = withDefaults(defineProps<PrimitiveProps & {
  /** Keep a boundary when nested inside another card-colored surface. */
  bordered?: boolean
  /**
   * Inner padding: `none` for a container whose rows carry their own inset
   * (a list), `row` for a single header-like row (px-4 py-3, the SettingsRow
   * rhythm), `lg` for a summary card with a headline figure (p-5).
   */
  padding?: 'none' | 'row' | 'lg'
}>(), {
  as: 'div',
  padding: 'lg',
})

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none': return 'overflow-hidden'
    case 'row': return 'px-4 py-3'
    default: return 'p-5'
  }
})
</script>

<template>
  <Primitive
    data-slot="surface-card"
    :as="as"
    :as-child="asChild"
    class="rounded-menu-shell bg-card"
    :class="[surfaceEdgeClass(bordered), paddingClass]"
  >
    <slot />
  </Primitive>
</template>
