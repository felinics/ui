<script setup lang="ts">
// SettingsList — a run of settings rows outside a settings card. It supplies
// the list rhythm (row height, vertical padding, hairline between rows; see the
// "Settings list rhythm" block in style.css) and nothing else: no inset, no
// surface, because the surface it sits on — a dialog body, a sheet — already
// pads its content. Inside a SettingsSection the card is already the list, so
// rows go straight into it.
</script>

<template>
  <div data-settings-list>
    <slot />
  </div>
</template>
