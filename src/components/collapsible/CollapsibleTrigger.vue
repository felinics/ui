<script setup lang="ts">
import type { CollapsibleTriggerProps } from 'reka-ui'
import { CollapsibleTrigger } from 'reka-ui'

const props = defineProps<CollapsibleTriggerProps>()
</script>

<template>
  <!-- A trigger is a button: cursor-pointer is the contract's Pointer Cursor
       rule. Everything else stays a transparent passthrough on purpose. -->
  <CollapsibleTrigger
    data-slot="collapsible-trigger"
    class="cursor-pointer"
    v-bind="props"
  >
    <slot />
  </CollapsibleTrigger>
</template>
