<template>
  <!-- The ONE notice surface: leading tone icon + title/description body +
       optional details + trailing action(s). Every framed warning / error /
       neutral notice composes this instead of hand-writing a tinted box.

       Anatomy (fixed; callers fill content, never restyle it):
       - icon slot sized to the FIRST line's line box (`h-lh` on the same type
         rung as that line), so the glyph is optically centered on line one at
         any font scale and any wrap count — no `mt-*` nudges;
       - title carries the weight, description the explanation; with no title
         the description is promoted to the first-line rung (a one-sentence
         error reads as the message, not as muted fine print);
       - tone lives ONLY in the icon and the surface wash — text stays
         foreground/muted so long messages stay readable;
       - `#details` = raw diagnostic text (error string, IDs) in mono caption;
       - default slot = trailing action(s).
       `bare` drops the frame for hosts that already own a surface (a composer
       capsule section); `size="sm"` steps the type/icon rung down one notch
       for dense hosts. `clickable` makes the whole surface the affordance. -->
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    :role="clickable ? undefined : (tone === 'destructive' ? 'alert' : 'status')"
    data-slot="callout-banner"
    :data-tone="tone"
    :data-size="size"
    :data-bare="bare ? '' : undefined"
    :data-clickable="clickable ? '' : undefined"
    class="flex text-left"
    :class="[
      size === 'sm' ? 'gap-2' : 'gap-3',
      bare ? '' : ['rounded-menu-shell border', size === 'sm' ? 'px-3 py-2' : 'px-4 py-3', toneClass],
      clickable ? [interactiveClass, 'flex-row items-center'] : 'flex-col sm:flex-row sm:items-center',
    ]"
  >
    <div
      class="flex min-w-0 flex-1 items-start"
      :class="size === 'sm' ? 'gap-2' : 'gap-3'"
    >
      <span
        class="flex h-lh shrink-0 items-center"
        :class="[firstLineRung, iconClass]"
        aria-hidden="true"
      >
        <slot name="icon">
          <component
            :is="toneIcon"
            :class="size === 'sm' ? 'size-3.5' : 'size-4'"
          />
        </slot>
      </span>
      <div class="min-w-0 flex-1">
        <p
          v-if="title"
          class="break-words font-medium text-foreground"
          :class="firstLineRung"
        >
          {{ title }}
        </p>
        <p
          v-if="description"
          class="whitespace-pre-wrap break-words"
          :class="title ? 'mt-0.5 text-body text-muted-foreground' : [firstLineRung, 'text-foreground']"
        >
          {{ description }}
        </p>
        <div
          v-if="$slots.details"
          class="mt-1 whitespace-pre-wrap break-all font-mono text-caption text-muted-foreground"
        >
          <slot name="details" />
        </div>
      </div>
    </div>

    <!-- Trailing: a caller's action button(s) when not clickable, or a lead-in
         chevron when the whole banner is the affordance. -->
    <div
      v-if="$slots.default || clickable"
      class="flex shrink-0 items-center gap-2 sm:self-auto"
    >
      <slot />
      <ChevronRight
        v-if="clickable"
        class="size-4 text-muted-foreground"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
// Lifted from the host app (apps/web/components/callout-banner/index.vue) so
// the notice surface has exactly one implementation. It absorbed the legacy
// shadcn `Alert` role (neutral tone + description-only + details), so hosts
// have one notice owner instead of two with different edges and icon math.
import { ChevronRight, CircleAlert, Info, TriangleAlert } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'warning' | 'destructive'
  title?: string
  description?: string
  size?: 'default' | 'sm'
  bare?: boolean
  clickable?: boolean
}>(), {
  tone: 'warning',
  title: '',
  description: '',
  size: 'default',
  bare: false,
  clickable: false,
})

const toneIcon = computed(() => ({
  neutral: Info,
  warning: TriangleAlert,
  destructive: CircleAlert,
})[props.tone])

// The first line is the title if present, otherwise the promoted description;
// the icon box borrows the same rung so `h-lh` resolves to that line box.
const firstLineRung = computed(() => props.size === 'sm' ? 'text-label' : 'text-control')

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
  if (props.tone === 'neutral') {
    const rest = 'border-border bg-muted-soft'
    return props.clickable ? `${rest} transition-colors hover:bg-muted` : rest
  }
  const rest = 'border-warning-border bg-warning-soft'
  return props.clickable
    ? `${rest} transition-colors hover:bg-warning-soft-hover hover:border-warning-border-hover`
    : rest
})

const iconClass = computed(() => ({
  neutral: 'text-muted-foreground',
  warning: 'text-warning-foreground',
  destructive: 'text-destructive',
})[props.tone])

const interactiveClass = 'w-full cursor-pointer'
</script>
