<script setup lang="ts">
// SettingsSection — a titled group of settings rows: a small muted title over
// a rounded bg-card shell. Lifted from the host app's settings owner
// vocabulary (apps/web/components/settings/section.vue, now a re-export
// shim) so the section card has exactly one implementation.
withDefaults(defineProps<{
  title?: string
}>(), {
  title: '',
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
      <slot name="actions" />
    </div>
    <!-- When a footer is present its hairline becomes the card's visual last
         divider, so the row above it loses its :last-child border-b-0 escape
         and would stack its own hairline against the footer's — two lines
         fighting. The nth-last-child(3) rule hands the "I'm last" treatment to
         whatever content element sits directly above the footer's hairline. -->
    <div
      data-settings-section-card
      class="overflow-hidden rounded-menu-shell border border-border bg-card"
      :class="$slots.footer ? '[&>:nth-last-child(3)]:border-b-0' : ''"
    >
      <slot />
      <!-- Footer: a right-aligned action bar (Save/Cancel) or a pagination strip.
           Lives INSIDE the card, after the rows. Its divider is an INSET
           hairline — same inset logic as a row divider, aligned to the content
           padding rather than touching the card's edges. Only rendered when a
           caller fills it, so a plain section is untouched. -->
      <template v-if="$slots.footer">
        <div
          aria-hidden="true"
          class="mx-4 border-t border-border"
        />
        <div
          data-settings-section-footer
          class="flex items-center justify-end gap-2 px-4 py-3"
        >
          <slot name="footer" />
        </div>
      </template>
    </div>
  </section>
</template>
