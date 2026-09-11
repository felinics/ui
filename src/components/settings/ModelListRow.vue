<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

// ModelListRow — the dense model-list navigation row: the whole row is the
// click target. Lifted from the host (apps/web/components/settings/
// model-list-row.vue, now a re-export shim) so the shape has exactly one
// implementation. Token adaptation only: text-sm→text-control,
// text-xs→text-body.
withDefaults(defineProps<{
  label: string
  meta?: string
  last?: boolean
  disabled?: boolean
  readonly?: boolean
}>(), {
  meta: '',
  last: false,
  disabled: false,
  readonly: false,
})

// Multi-root template (button + sibling divider) disables Vue's automatic
// attrs/listener fallthrough, so a plain @click on the component would be
// silently dropped — the row emits its own 'click' explicitly instead.
const emit = defineEmits<{ click: [] }>()

// The whole row is the clickable affordance, so it gets the same neutral
// overlay hover every other clickable surface in this vocabulary uses
// (BackendCard, CalloutBanner's clickable variant) — the row's own chrome,
// not a page injection.
const rowClass = 'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-foreground transition-colors disabled:pointer-events-none' /* ui-allow-style */
const interactiveRowClass = 'cursor-pointer hover:bg-accent disabled:opacity-40' /* ui-allow-style */
// ui-allow-alpha: pinned owner value, lifted verbatim with the row.
const trailingIconClass = 'size-4 shrink-0 text-muted-foreground/60' /* ui-allow-alpha */
</script>

<template>
  <!-- Whole row is the click target (native <button>), same contract as
       BackendCard — not a passive row with a separate trailing action. -->
  <button
    type="button"
    :class="[rowClass, !readonly && interactiveRowClass]"
    :disabled="disabled || readonly"
    @click="emit('click')"
  >
    <span class="min-w-0 truncate">
      <span class="text-control font-medium">{{ label }}</span>
      <span
        v-if="meta"
        class="ml-2 text-body text-muted-foreground"
      >{{ meta }}</span>
    </span>
    <slot name="trailing">
      <Settings
        v-if="!readonly"
        :class="trailingIconClass"
      />
    </slot>
  </button>
  <!-- Divider is a sibling, not a border on the row itself: callers already
       know the last-item index from their v-for, so `last` is a plain prop
       rather than a CSS :last-child trick — this keeps the component a
       single click target with no inset-margin/full-bleed conflict (the
       button stays edge-to-edge for a full-width hit area; only the hairline
       itself insets by mx-4, matching the row content's px-4). -->
  <div
    v-if="!last"
    class="mx-4 border-b border-border"
  />
</template>
