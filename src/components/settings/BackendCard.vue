<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import StatusDot from './StatusDot.vue'

// BackendCard — the whole-card-is-the-click-target provider/backend tile.
// Lifted from the host (apps/web/components/settings/backend-card.vue, now a
// re-export shim). Token adaptations: rounded-[var(--radius-menu-shell)]→
// rounded-menu-shell, text-sm→text-control, text-xs→text-body; the two alpha
// values travel as pinned owner values (markers below).
withDefaults(defineProps<{
  /** Keep a boundary when nested inside another card-colored surface. */
  bordered?: boolean
  name: string
  subtitle?: string
  enabled?: boolean
}>(), {
  subtitle: '',
  enabled: false,
})

/* ui-allow-alpha: hover:bg-accent/30 — pinned owner value, lifted verbatim. */
const cardClass = 'group/card flex cursor-pointer items-center gap-3 rounded-menu-shell border border-border bg-card p-3.5 text-left transition-colors hover:bg-accent/30 dark:hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' /* ui-allow-alpha */
const trailingIconClass = 'size-4 shrink-0 text-muted-foreground/60' /* ui-allow-alpha: pinned owner value, lifted verbatim. */
</script>

<template>
  <button
    type="button"
    :class="[cardClass, !bordered && 'dark:border-0']"
  >
    <span class="relative shrink-0">
      <slot name="leading" />
      <StatusDot
        v-if="enabled"
        status="success"
        class="absolute -bottom-0.5 -right-0.5 size-2.5! ring-2 ring-card"
      />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-control font-medium text-foreground">
        {{ name }}
      </span>
      <span
        v-if="subtitle"
        class="mt-0.5 block truncate text-body text-muted-foreground"
      >
        {{ subtitle }}
      </span>
    </span>

    <slot name="trailing">
      <ChevronRight :class="trailingIconClass" />
    </slot>
  </button>
</template>
