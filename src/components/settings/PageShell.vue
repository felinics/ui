<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from './PageHeader.vue'

// PageShell — the page frame: one owner for the title block, the right-side
// actions, and the body, so every surface lands on the same left and right
// edges. Lifted from the host app (apps/web/components/page-shell, now a
// re-export shim); the title block itself is the shared PageHeader.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  // 'page' is a standalone surface that owns the full gutter. 'tab' lives
  // inside the bot-detail tab container (which already adds the horizontal
  // gutter — px-4, stepping to px-6 at md — plus pt-4 pb-4), so it only adds
  // the remainder to reach the same vertical rhythm.
  variant?: 'page' | 'tab'
  // The measure (content column width). 'md' is the reading column every host
  // page uses (max-w-3xl). 'lg'/'xl' exist for board-style pages whose content
  // is a grid of specimens, not prose (the showcase's foundations/Overview
  // pages). 'wall' is the full specimen wall: side-by-side columns compared
  // against each other (the Markdown body page's 2 × chat-width columns:
  // 49.5rem frame each + gap + gutter ≈ 103rem), so it caps at 104rem instead
  // of squeezing the columns into a prose measure. Never hand-set max-w on a
  // page — if none of the four fits, that is a new tier to legislate here,
  // not a class to write at the call site.
  width?: 'md' | 'lg' | 'xl' | 'wall'
}>(), {
  title: '',
  description: '',
  variant: 'page',
  width: 'md',
})

const MAX_W = { md: 'max-w-3xl', lg: 'max-w-4xl', xl: 'max-w-5xl', wall: 'max-w-[104rem]' } as const

const rootClass = computed(() =>
  props.variant === 'tab'
    ? `mx-auto ${MAX_W[props.width]} pt-6 pb-8`
    // The <md gutter step mirrors SettingsShell/DetailPane (px-4 md:px-6):
    // a phone keeps a 16px margin instead of the desktop 24px, and the
    // airier vertical rhythm only starts where the width can afford it.
    : `mx-auto ${MAX_W[props.width]} px-4 pt-6 pb-8 md:px-6 md:pt-10 md:pb-12`,
)
</script>

<template>
  <div :class="rootClass">
    <PageHeader
      :title="title"
      :description="description"
      :level="1"
      framed
    >
      <template
        v-if="$slots.actions"
        #actions
      >
        <slot name="actions" />
      </template>
    </PageHeader>
    <slot />
  </div>
</template>
