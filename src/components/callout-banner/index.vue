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
       - `#details` = raw diagnostic text (error string, IDs) in mono caption.
         pre-line, not pre-wrap: callers write the slot on its own line, so
         Vue's whitespace condensing hands it a leading space that pre-wrap
         rendered as a one-character indent; pre-line keeps the error's line
         breaks but drops spaces at line edges;
       - default slot = trailing action(s).
       `dismissLabel` (the caller's localized "Dismiss") adds a close button
       and the `dismiss` event; the host decides what dismissing means.
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
      size === 'sm' ? 'gap-2' : 'gap-3 sm:gap-5',
      bare ? '' : [frameClass, toneClass],
      clickable ? [interactiveClass, 'flex-row items-center'] : 'flex-col sm:flex-row sm:items-center',
    ]"
  >
    <!-- Two sizes, two designs — not one geometry scaled:
         - sm: the dense notice (chat transcript, composer, dialogs). Hairline
           tone border + faint wash, 14px glyph, 13px first line.
         - default: the page-level banner (Memoh 2.0 Direction A). Opaque bg-card
           surface (hairline border in light mode, borderless in dark mode to
           match PlanCard / SurfaceCard), optional inline `r=6` semantic tag next
           to the title instead of a leading icon, 14px title, 13px body. Legacy
           callers that have not supplied `tag` keep the leading icon fallback so
           tone never disappears silently. -->
    <div
      class="flex min-w-0 flex-1 items-start"
      :class="size === 'sm' ? 'gap-2' : 'gap-2.5'"
    >
      <span
        v-if="showLeadingIcon"
        class="flex h-lh shrink-0 items-center"
        :class="[firstLineRung, iconClass, title && description ? 'translate-y-[0.025rem]' : '']"
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
        <div
          v-if="title || tag"
          class="flex flex-wrap items-center gap-2"
        >
          <p
            v-if="title"
            class="break-words font-medium text-foreground"
            :class="firstLineRung"
          >
            {{ title }}
          </p>
          <span
            v-if="tag"
            data-slot="callout-banner-tag"
            class="inline-flex shrink-0 items-center rounded-sm px-[0.4375rem] py-0.5 text-caption font-medium"
            :class="tagClass"
          >
            {{ tag }}
          </span>
        </div>
        <p
          v-if="description"
          class="whitespace-pre-wrap break-words"
          :class="title || tag ? ['mt-1 text-muted-foreground', size === 'sm' ? 'text-body' : 'text-label'] : [firstLineRung, 'text-foreground']"
        >
          {{ description }}
        </p>
        <div
          v-if="$slots.details"
          class="mt-1 whitespace-pre-line break-all font-mono text-caption text-muted-foreground"
        >
          <slot name="details" />
        </div>
      </div>
      <!-- Dismiss lives on the first-line row, not in the trailing slot: the
           trailing slot stacks under the text below the sm breakpoint, which
           would strand the X. One line tall on the first-line rung, so it
           centers on line one and never stretches the row; size-6 overflows
           that box by ~3px each way, inside the frame's py-2. -->
      <span
        v-if="dismissLabel"
        class="flex h-lh shrink-0 items-center"
        :class="firstLineRung"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="size-6"
          :aria-label="dismissLabel"
          @click.stop="emit('dismiss')"
        >
          <X class="size-3.5" />
        </Button>
      </span>
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
import { ErrorIcon } from '@memohai/icon/ui'
import { ChevronRight, Info, TriangleAlert, X } from 'lucide-vue-next'
import { computed, useSlots } from 'vue'
import { Button } from '#/components/button'

const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'warning' | 'destructive'
  title?: string
  tag?: string
  description?: string
  size?: 'default' | 'sm'
  bare?: boolean
  clickable?: boolean
  dismissLabel?: string
}>(), {
  tone: 'warning',
  title: '',
  tag: '',
  description: '',
  size: 'default',
  bare: false,
  clickable: false,
  dismissLabel: '',
})

const slots = useSlots()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const toneIcon = computed(() => ({
  neutral: Info,
  warning: TriangleAlert,
  destructive: ErrorIcon,
})[props.tone])

// Direction A removes the leading icon whenever the semantic tag carries the
// tone (unless a caller explicitly supplies a custom `#icon` slot).
const showLeadingIcon = computed(() => Boolean(slots.icon) || !props.tag)

// The first line is the title if present, otherwise the promoted description;
// the icon box borrows the same rung so `h-lh` resolves to that line box.
const firstLineRung = computed(() => props.size === 'sm' ? 'text-label' : 'text-control')

const frameClass = computed(() => props.size === 'sm'
  ? 'rounded-menu-shell border px-3 py-2'
  : 'rounded-menu-shell border border-border bg-card px-5 py-4 dark:border-0')

// Full literal class strings per tone — Tailwind scans source text, so a runtime
// concat would never be generated.
// - sm: hairline tone border + faint wash.
// - default: neutral opaque card surface (`bg-card`, border in light, borderless
//   in dark) so dot-matrix / page backdrops never bleed through a translucent wash.
const toneClass = computed(() => {
  const sm = props.size === 'sm'
  if (!sm) {
    return props.clickable ? 'transition-colors hover:bg-muted' : ''
  }
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

const tagClass = computed(() => ({
  neutral: 'bg-secondary text-muted-foreground',
  warning: 'bg-accent-yellow-soft-hover text-accent-yellow',
  destructive: 'bg-accent-red-soft-hover text-accent-red',
})[props.tone])

const iconClass = computed(() => ({
  neutral: 'text-muted-foreground',
  warning: 'text-warning-foreground',
  destructive: 'text-destructive',
})[props.tone])

const interactiveClass = 'w-full cursor-pointer'
</script>
