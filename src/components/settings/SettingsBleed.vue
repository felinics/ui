<script setup lang="ts">
// SettingsBleed — lets one block inside a settings card reach the card's edges.
// The card pads its content by --settings-inset; this pulls the block back out
// by the same token, so the inset and its escape share one value. Use it for
// content whose surface must span the card: a whole-row click target whose
// hover fill runs edge to edge, a table, a chart or graph canvas, a strip with
// a full-width rule. The content inside re-applies its own inner padding where
// it needs text to line up with the rows around it.
</script>

<template>
  <div class="-mx-(--settings-inset)">
    <slot />
  </div>
</template>
