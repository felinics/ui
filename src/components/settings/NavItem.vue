<script setup lang="ts">
import { Button } from '../button'

// NavItem — the settings-nav row: a left-aligned ghost Button, the row the
// host's settings/bot-detail sidebars navigate with. Lifted from the host
// (apps/web/components/settings-sidebar/nav-item.vue, now a re-export shim)
// so every settings sidebar — host pages, the showcase's own nav — composes
// the same row instead of transcribing it.
//
// The weight (font-[430]), tracking (-0.1px), and ink (text-foreground/85)
// are PINNED owner values, lifted verbatim with the host's waivers: they are
// this shape's law, not call-site free-styling. (Off-ladder values are legal
// ONLY inside an owner that pins them — see AGENTS.md § Typography.)
withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: false,
})

// ui-allow-alpha: pinned owner value, lifted verbatim from the host's
// settings nav (grandfathered in its baseline there) — NavItem is now the
// single home for this ink. (Marker repeated inline: the guard ratchets
// alpha per raw line.)
const rowClass = 'w-full justify-start gap-2.5 pl-3.5! pr-3! tracking-[-0.1px] text-foreground/85 [--btn-ghost-hover:var(--sidebar-hover)]' /* ui-allow-alpha */
</script>

<template>
  <Button
    data-settings-nav-item
    variant="ghost"
    :class="[rowClass, active ? 'bg-sidebar-accent font-medium text-foreground!' : 'font-[430]']"
  >
    <slot />
  </Button>
</template>
