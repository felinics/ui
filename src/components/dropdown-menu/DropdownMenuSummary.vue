<script setup lang="ts">
// Non-interactive menu information uses the same inset and title size as rows.
// Keep the value beside the title and the description beneath it; callers supply
// content rather than rebuilding this hierarchy with a group label.
defineProps<{
  title: string
  value?: string
  description?: string
}>()
</script>

<template>
  <div
    data-slot="dropdown-menu-summary"
    class="cursor-default select-none px-3 py-2"
  >
    <div class="flex items-baseline justify-between gap-4 text-control font-normal text-popover-foreground">
      <span class="min-w-0">{{ title }}</span>
      <span
        v-if="value"
        class="shrink-0"
      >{{ value }}</span>
    </div>
    <p
      v-if="description"
      class="mt-0.5 text-body text-muted-foreground"
    >
      {{ description }}
    </p>
  </div>
</template>
