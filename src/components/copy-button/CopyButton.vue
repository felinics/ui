<!-- Icon button that copies `text` and confirms with a drawn check. Motion follows
     Arkloop's CopyIconButton (c9ca6979e): the glyph shrinks out (60ms), the next
     one stays hidden for 75ms and then grows in (75ms scale / 50ms fade); the
     return to the copy glyph is the same swap. The check is held while the
     pointer rests on the button and returns only after it leaves; clicks are
     ignored until the copy glyph is back.
     `busy` (v-model) covers that whole span, so a caller that wraps the button
     in a tooltip can keep it closed while the check is the confirmation. The
     root is the Button itself, so it can sit under a TooltipTrigger as-child.
     Lifted from the host (apps/web/src/pages/home/components/copy-action-button.vue,
     now an i18n adapter over this). Library adaptations: copy comes in through
     `label` / `copiedLabel` / `failedMessage` props (the library holds no i18n),
     imports are relative, and the default icon size is the size-4.5 scale step
     instead of size-[18px]. -->
<template>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    :aria-label="copied ? copiedLabel : label"
    @click="handleCopy"
    @pointerenter="hovered = true"
    @pointerleave="handlePointerLeave"
  >
    <!-- Two layers: a caller may scale this outer span (e.g. a press), while
         the inner keyed span owns the swap transition, so neither overrides
         the other's `transition`. -->
    <span class="flex items-center justify-center">
      <Transition
        name="copy-glyph"
        mode="out-in"
        @after-enter="handleGlyphEntered"
      >
        <span
          :key="copied ? 'check' : 'copy'"
          class="flex items-center justify-center"
        >
          <CopyAnimatedCheckIcon
            v-if="copied"
            :class="iconClass"
          />
          <!-- Mirrored so the stacked squares read top-left over bottom-right. -->
          <CopyConnectedIcon
            v-else
            :class="[iconClass, '-scale-x-100']"
          />
        </span>
      </Transition>
    </span>
  </Button>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '../button'
import { CopyConnectedIcon } from '../copy-connected-icon'
import { toast } from '../sonner'
import { useClipboard } from '../../lib/clipboard'
import CopyAnimatedCheckIcon from './CopyAnimatedCheckIcon.vue'

const props = withDefaults(defineProps<{
  text: string
  /** Accessible name at rest (caller i18n). */
  label: string
  /** Accessible name while the check is shown (caller i18n). */
  copiedLabel: string
  /** Toast shown when the clipboard write fails (caller i18n). */
  failedMessage: string
  iconClass?: string
}>(), { iconClass: 'size-4.5' })

// From the click until the copy glyph has fully re-entered.
const busy = defineModel<boolean>('busy', { default: false })

const { copyText } = useClipboard()

const copied = ref(false)
const hovered = ref(false)
// The hold ran out while the pointer was still on the button.
let returnPending = false
let holdTimer: ReturnType<typeof setTimeout> | null = null

async function handleCopy() {
  if (busy.value) return
  busy.value = true
  if (!await copyText(props.text)) {
    busy.value = false
    toast.error(props.failedMessage)
    return
  }
  copied.value = true
}

function handleGlyphEntered() {
  if (!copied.value) {
    busy.value = false
    return
  }
  // The 1.5s hold counts from the moment the check is fully in.
  holdTimer = setTimeout(() => {
    holdTimer = null
    if (hovered.value) returnPending = true
    else copied.value = false
  }, 1500)
}

function handlePointerLeave() {
  hovered.value = false
  if (!returnPending) return
  returnPending = false
  copied.value = false
}

onBeforeUnmount(() => {
  if (holdTimer) clearTimeout(holdTimer)
})
</script>

<style scoped>
.copy-glyph-leave-active {
  transition:
    scale 60ms ease-in,
    opacity 60ms ease-in;
}

/* The 75ms delay is the hidden gap before the incoming glyph grows in; the
   check's stroke is already drawing during it. */
.copy-glyph-enter-active {
  transition:
    scale 75ms ease-out 75ms,
    opacity 50ms ease-out 75ms;
}

.copy-glyph-enter-from,
.copy-glyph-leave-to {
  scale: 0.5;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .copy-glyph-enter-active,
  .copy-glyph-leave-active {
    transition: none;
  }
}
</style>
