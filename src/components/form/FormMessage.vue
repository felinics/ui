<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { ErrorIcon } from '@memohai/icon/ui'
import { ErrorMessage } from 'vee-validate'
import { toValue } from 'vue'
import { cn } from '#/lib/utils'
import { useFormField } from './useFormField'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { name, formMessageId } = useFormField()
</script>

<template>
  <ErrorMessage
    :id="formMessageId"
    v-slot="{ message }"
    data-slot="form-message"
    as="p"
    :name="toValue(name)"
    :class="cn(
      'text-destructive flex items-center gap-1.5 text-label leading-snug',
      props.class,
    )"
  >
    <ErrorIcon class="size-3.5 shrink-0" />
    <span>{{ message }}</span>
  </ErrorMessage>
</template>
