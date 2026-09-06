<template>
  <!-- A framed warning/alert callout: leading icon + title/description body +
       trailing action(s). Two tones, both a soft-token triplet (bg/border/
       foreground) — warning uses the codebase's existing lifecycle-notice
       tokens, destructive uses `--destructive-soft`/`--destructive-border`
       (packages/ui/AGENTS.md § Alpha policy) — one look, not two.
       Action banners stack on narrow screens; clickable banners keep their
       chevron beside the text. When `clickable`, the whole surface
       is a button that opens something (a diagnostics dialog); the trailing slot
       is then usually empty and a chevron leads the user in. -->
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    data-slot="callout-banner"
    :data-tone="tone"
    :data-clickable="clickable ? '' : undefined"
    class="flex gap-3 rounded-menu-shell border px-4 py-3 text-left"
    :class="[toneClass, clickable ? [interactiveClass, 'flex-row items-center'] : 'flex-col sm:flex-row sm:items-center']"
  >
    <div class="flex min-w-0 flex-1 items-start gap-3">
      <slot name="icon">
        <AlertCircle
          class="mt-0.5 size-4 shrink-0"
          :class="iconClass"
        />
      </slot>
      <div class="min-w-0">
        <p class="text-control font-medium text-foreground">
          {{ title }}
        </p>
        <p
          v-if="description"
          class="mt-0.5 text-body text-muted-foreground"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Trailing: a caller's action button(s) when not clickable, or a lead-in
         chevron when the whole banner is the affordance. -->
    <div class="flex shrink-0 items-center gap-2 sm:self-auto">
      <slot />
      <ChevronRight
        v-if="clickable"
        class="size-4 text-muted-foreground"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
// Lifted from the host app (apps/web/components/callout-banner/index.vue, now
// a re-export shim) so the callout banner has exactly one implementation.
// Library-boundary adaptations vs the host original:
// - token renames: frame radius rounded-[var(--radius-menu-shell)] →
//   rounded-menu-shell, title text-sm → text-control, description text-xs →
//   text-body.
// Everything else is byte-identical to the host original.
import { AlertCircle, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  tone?: 'warning' | 'destructive'
  title: string
  description?: string
  clickable?: boolean
}>(), {
  tone: 'warning',
  description: '',
  clickable: false,
})

// Full literal class strings per tone — Tailwind scans source text, so a runtime
// concat would never be generated. Clickable hover uses the *-soft-hover tokens
// (utilities layer) so the wash is visible and stays in the same tone family.
const toneClass = computed(() => {
  if (props.tone === 'destructive') {
    const rest = 'border-destructive-border bg-destructive-soft'
    return props.clickable
      ? `${rest} transition-colors hover:bg-destructive-soft-hover hover:border-destructive-border-hover`
      : rest
  }
  const rest = 'border-warning-border bg-warning-soft'
  return props.clickable
    ? `${rest} transition-colors hover:bg-warning-soft-hover hover:border-warning-border-hover`
    : rest
})

const iconClass = computed(() =>
  props.tone === 'destructive' ? 'text-destructive' : 'text-warning-foreground',
)

// When the whole banner is the affordance, hover stays in the same tone family
// (see [data-slot="callout-banner"] rules in style.css) — not hover:bg-accent,
// which replaced destructive/warning fills with neutral gray.
const interactiveClass = 'w-full cursor-pointer'
</script>
