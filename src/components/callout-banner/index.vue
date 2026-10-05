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
      size === 'sm' ? 'gap-2' : 'gap-3',
      bare ? '' : [frameClass, toneClass],
      clickable ? [interactiveClass, 'flex-row items-center'] : 'flex-col sm:flex-row sm:items-center',
    ]"
  >
    <!-- Two sizes, two designs — not one geometry scaled:
         - sm: the dense notice (chat transcript, composer, dialogs). Hairline
           tone border + faint wash, 14px glyph, 13px first line.
         - default: the page-level banner. No border — one solid tone fill,
           like a borderless dark card — one step up from sm on every rung
           (16px glyph, 14px title, 13px body) so it reads as a section of the
           page without outgrowing the 13–14px type the rest of the UI runs on. -->
    <div
      class="flex min-w-0 flex-1 items-start"
      :class="size === 'sm' ? 'gap-2' : 'gap-2.5'"
    >
      <!-- Optical drop, only when the body runs past one line (title +
           description). The glyph is centered on the first line box; with one
           line that already reads centered. Under a second line the eye reads
           the block's center line as tilting down from the icon toward the
           text, so the icon is nudged ~0.4px to meet it. A transform, so the
           line box and row height are untouched. Wrapping of a lone
           description is not detected — that case stays geometric. -->
      <span
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
          :class="title ? ['mt-0.5 text-muted-foreground', size === 'sm' ? 'text-body' : 'text-label'] : [firstLineRung, 'text-foreground']"
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
import { computed } from 'vue'
import { Button } from '#/components/button'

const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'warning' | 'destructive'
  title?: string
  description?: string
  size?: 'default' | 'sm'
  bare?: boolean
  clickable?: boolean
  dismissLabel?: string
}>(), {
  tone: 'warning',
  title: '',
  description: '',
  size: 'default',
  bare: false,
  clickable: false,
  dismissLabel: '',
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const toneIcon = computed(() => ({
  neutral: Info,
  warning: TriangleAlert,
  destructive: ErrorIcon,
})[props.tone])

// The first line is the title if present, otherwise the promoted description;
// the icon box borrows the same rung so `h-lh` resolves to that line box.
const firstLineRung = computed(() => props.size === 'sm' ? 'text-label' : 'text-control')

const frameClass = computed(() => props.size === 'sm'
  ? 'rounded-menu-shell border px-3 py-2'
  : 'rounded-xl px-4 py-3')

// Full literal class strings per tone — Tailwind scans source text, so a runtime
// concat would never be generated. Clickable hover uses the *-soft-hover tokens
// (utilities layer) so the wash is visible and stays in the same tone family.
// sm: hairline border + faint wash. default: no border, one solid fill that
// must read without an edge. Destructive/neutral step one rung deeper
// (*-soft-hover / muted) because their soft rung is a near-invisible 5–40%
// mix; warning's soft rung is already an opaque-ish tint and its hover rung
// reads as a saturated block, so it stays on warning-soft. Clickable
// destructive/neutral deepen by brightness since there is no rung above.
const toneClass = computed(() => {
  const sm = props.size === 'sm'
  if (props.tone === 'destructive') {
    if (!sm) return props.clickable ? 'bg-destructive-soft-hover transition-[filter] hover:brightness-125' : 'bg-destructive-soft-hover'
    const rest = 'border-destructive-border bg-destructive-soft'
    return props.clickable
      ? `${rest} transition-colors hover:bg-destructive-soft-hover hover:border-destructive-border-hover`
      : rest
  }
  if (props.tone === 'neutral') {
    if (!sm) return props.clickable ? 'bg-muted transition-[filter] hover:brightness-125' : 'bg-muted'
    const rest = 'border-border bg-muted-soft'
    return props.clickable ? `${rest} transition-colors hover:bg-muted` : rest
  }
  if (!sm) return props.clickable ? 'bg-warning-soft transition-colors hover:bg-warning-soft-hover' : 'bg-warning-soft'
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
