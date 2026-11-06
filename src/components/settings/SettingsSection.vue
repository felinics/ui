<script setup lang="ts">
// SettingsSection — a titled group of settings rows: a small muted title over
// a rounded bg-card shell. Lifted from the host app's settings owner
// vocabulary (formerly apps/web/components/settings/section.vue) so the
// section card has exactly one implementation.
//
// The card owns two things for everything placed in it: the horizontal
// content inset (--settings-inset) and, being a settings list, the row rhythm
// (see the "Settings list rhythm" block in style.css). Children therefore never
// inset themselves; content that must reach the card's edges (a whole-row
// click target, a table, a chart canvas) wraps itself in SettingsBleed.
import { surfaceEdgeClass } from '#/lib/surface'

withDefaults(defineProps<{
  title?: string
  /** Keep a boundary when nested inside another card-colored surface. */
  bordered?: boolean
}>(), {
  title: '',
  bordered: false,
})
</script>

<template>
  <section class="space-y-2.5">
    <div
      v-if="title || $slots.actions"
      class="flex min-h-7 items-center justify-between gap-4 px-2"
    >
      <h2
        v-if="title"
        class="text-label font-medium text-muted-foreground"
      >
        {{ title }}
      </h2>
      <!-- The toolbar is one right-aligned group whatever the caller puts in
           it: left bare, several buttons would be spread across the header by
           justify-between, and a lone action in an untitled section would sit
           on the left. -->
      <div
        v-if="$slots.actions"
        class="ml-auto flex items-center gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
    <!-- When a footer is present its hairline becomes the card's visual last
         divider, so the row above it loses its :last-child border-b-0 escape
         and would stack its own hairline against the footer's — two lines
         fighting. The nth-last-child(3) rule hands the "I'm last" treatment to
         whatever content element sits directly above the footer's hairline. -->
    <div
      data-settings-section-card
      data-settings-list
      class="overflow-hidden rounded-menu-shell bg-section-card px-(--settings-inset)"
      :class="[surfaceEdgeClass(bordered), $slots.footer && '[&>:nth-last-child(3)]:border-b-0']"
    >
      <slot />
      <!-- Footer: a right-aligned action bar (Save/Cancel) or a pagination strip.
           Lives INSIDE the card, after the rows. Its divider sits inside the
           card's inset like a row divider, so it never touches the card's
           edges. Only rendered when a caller fills it, so a plain section is
           untouched. -->
      <template v-if="$slots.footer">
        <div
          aria-hidden="true"
          class="border-t border-border"
        />
        <div
          data-settings-section-footer
          class="flex items-center justify-end gap-2 py-3"
        >
          <slot name="footer" />
        </div>
      </template>
    </div>
  </section>
</template>
