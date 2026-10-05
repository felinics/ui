<template>
  <!-- Vertical Label-over-control field. Distinct from SettingsRow, whose label
       sits BESIDE the control; a FieldStack stacks them so a run of them reads as
       a form column. The label→control→help rhythm has two rungs (GAP_CLASS):
       'card' for fields inside SettingsSection chrome (the card carries the
       grouping), 'bare' for fields sitting directly on the page (onboarding
       wizard), where the group needs more internal air to hold together. -->
  <div :class="GAP_CLASS[gap]">
    <!-- The label line. A plain #label slot lets a caller pair the label text
         with an inline toggle/meta on the same row (a name field + its enable
         switch); when it's filled it replaces the bound Label entirely, so the
         caller owns both the copy and the `for` wiring in that case. Otherwise
         the Label binds to the control via `for` so a click focuses it. -->
    <slot name="label">
      <Label
        v-if="label"
        :for="labelFor"
        :data-error="hasError"
        class="data-[error=true]:text-destructive"
      >
        {{ label }}
      </Label>
    </slot>

    <slot />

    <p
      v-if="help"
      :id="helpId"
      class="text-body text-muted-foreground"
    >
      {{ help }}
    </p>

    <!-- Validation state. When the FieldStack sits inside a vee-validate
         <FormField>, it takes over FormItem's job: it provides the form-item id
         (so a FormControl wrapping the control resolves ids and aria-invalid/
         aria-describedby) and renders the field's error inline. Standalone
         FieldStacks provide an id nobody consumes and render none of this.
         `reserveError` keeps a fixed-height slot drawn even with no error, so
         a validation message appearing doesn't shift the content below (the
         add-platform dialog reserved this pre-migration); the wrapper div only
         exists in that mode — an always-present empty div would eat a space-y
         rung of its own. -->
    <div
      v-if="fieldContext && reserveError"
      class="min-h-5"
    >
      <ErrorMessage
        :id="`${id}-form-item-message`"
        v-slot="{ message }"
        as="p"
        :name="fieldName"
        class="text-destructive flex items-center gap-1.5 text-label leading-snug"
      >
        <ErrorIcon class="size-3.5 shrink-0" />
        <span>{{ message }}</span>
      </ErrorMessage>
    </div>
    <ErrorMessage
      v-else-if="fieldContext"
      :id="`${id}-form-item-message`"
      v-slot="{ message }"
      as="p"
      :name="fieldName"
      class="text-destructive flex items-center gap-1.5 text-label leading-snug"
    >
      <ErrorIcon class="size-3.5 shrink-0" />
      <span>{{ message }}</span>
    </ErrorMessage>
  </div>
</template>

<script setup lang="ts">
// Lifted from the host app's settings owner vocabulary
// (apps/web/components/settings/field-stack.vue, now a re-export shim) so the
// stacked field has exactly one implementation. Library-boundary adaptations
// vs the host original:
// - '@felinic/ui' import split into relative '../label' (Label) and '../form'
//   (FORM_ITEM_INJECTION_KEY);
// - token rename: help text text-xs → text-body.
// Everything else is byte-identical to the host original.
import { ErrorIcon } from '@memohai/icon/ui'
import { ErrorMessage, FieldContextKey } from 'vee-validate'
import { computed, inject, provide, toValue, useId } from 'vue'
import { FORM_ITEM_INJECTION_KEY } from '../form'
import { Label } from '../label'

// The two spacing rungs are the ONLY sanctioned values — add a rung here,
// deliberately, never per-page via class injection (an injected space-y-*
// silently loses to whichever utility the stylesheet happens to emit last).
// Declared before defineProps: the SFC compiler resolves prop types statically
// and cannot see through `keyof typeof` on a later local const.
const GAP_CLASS: Record<'card' | 'bare', string> = {
  card: 'space-y-1.5',
  bare: 'space-y-2.5',
}

const props = withDefaults(defineProps<{
  label?: string
  // Bound to the control's id so clicking the label focuses it. Left to the
  // caller because only the caller knows the control's id; inside a FormField
  // it defaults to the FormControl-assigned form-item id.
  for?: string
  help?: string
  // Draw a fixed-height error slot even when valid, so the message appearing
  // doesn't push content down (dialogs whose footer would jump).
  reserveError?: boolean
  // Spacing rung by surface, not by taste (2026-08): 'card' keeps the 6px house
  // rhythm inside SettingsSection cards; 'bare' opens to 10px where fields sit
  // directly on the page with no card chrome (the onboarding wizard is the
  // first such surface). Note the Label's own line-height eats ~4px of whatever
  // rung is chosen — the perceived gap is smaller than the box gap.
  gap?: 'card' | 'bare'
}>(), {
  label: '',
  for: undefined,
  help: '',
  reserveError: false,
  gap: 'card',
})

const id = useId()
provide(FORM_ITEM_INJECTION_KEY, id)

const fieldContext = inject(FieldContextKey, null)
const hasError = computed(() => !!fieldContext && !!toValue(fieldContext.errorMessage))
const fieldName = computed(() => (fieldContext ? toValue(fieldContext.name) : ''))
const labelFor = computed(() => props.for ?? (fieldContext ? `${id}-form-item` : undefined))
const helpId = computed(() => (fieldContext ? `${id}-form-item-description` : undefined))
</script>
