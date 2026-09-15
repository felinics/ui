<script lang="ts" setup>
import type { Component } from 'vue'
import { CheckIcon, CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { Button } from '#/components/button'
import { TextButton } from '#/components/text-button'
import { cn } from '#/lib/utils'
import { dismiss, pauseAll, resumeAll, toast as toastApi, toasts, type ToastRecord, type ToastTextAction, type ToastVariant } from './toast'

export type ToasterPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToasterProps {
  /** Screen corner the column docks to. We default to top-right: out of the
   *  centre of vision, so a card can carry more text without blocking work. */
  position?: ToasterPosition
  /** Localized labels for the synthesized variant heading shown when a long,
   *  titleless blob is auto-shaped into heading + description. The library is
   *  i18n-agnostic, so the app passes these (e.g. from vue-i18n); when absent we
   *  fall back to the English `title` baked on the record. */
  headings?: Partial<Record<ToastVariant, string>>
  class?: string
}

const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'top-right',
})

/** Display heading for a toast: a localized variant label for auto-shaped
 *  toasts, otherwise the caller's own title verbatim. */
function headingFor(t: ToastRecord): string {
  if (t.autoHeading && props.headings?.[t.variant]) return props.headings[t.variant]!
  return t.title
}

// Re-expose the imperative API on the component instance for the rare template
// ref consumer; the canonical entry stays the `toast` export from the package.
defineExpose({ toast: toastApi, dismiss })

const semanticIcon: Partial<Record<ToastVariant, Component>> = {
  success: CircleCheckIcon,
  error: CircleXIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
}

const isTop = computed(() => props.position.startsWith('top'))

// Newest sits closest to the screen edge: on top of the list for a top dock, at
// the bottom for a bottom dock. The store is chronological; we only flip the view.
const ordered = computed(() => (isTop.value ? [...toasts].reverse() : toasts))

const actionStates = reactive(new Map<string, { action: ToastTextAction; phase: 'pending' | 'success' | 'failure' }>())
const feedbackTimers = new Map<string, ReturnType<typeof setTimeout>>()
let disposed = false

function clearActionState(id: string) {
  clearTimeout(feedbackTimers.get(id))
  feedbackTimers.delete(id)
  actionStates.delete(id)
}

function actionPhase(t: ToastRecord) {
  const state = actionStates.get(t.id)
  return state && state.action === t.textAction ? state.phase : undefined
}

async function runTextAction(t: ToastRecord) {
  const action = t.textAction
  if (!action || actionPhase(t) === 'pending') return
  clearActionState(t.id)
  actionStates.set(t.id, { action, phase: 'pending' })
  let succeeded = false
  try { succeeded = await action.onClick() } catch { /* The local failure label remains available for retry. */ }
  if (disposed || toasts.find(current => current.id === t.id)?.textAction !== action) return
  actionStates.set(t.id, { action, phase: succeeded ? 'success' : 'failure' })
  if (succeeded) feedbackTimers.set(t.id, setTimeout(() => clearActionState(t.id), 1500))
}

watch(() => toasts.map(t => [t.id, t.textAction] as const), (current) => {
  for (const [id, state] of actionStates) {
    if (!current.some(([key, action]) => key === id && action === state.action)) clearActionState(id)
  }
})

function onVisibilityChange() {
  if (document.hidden) pauseAll()
  else resumeAll()
}

onMounted(() => document.addEventListener('visibilitychange', onVisibilityChange))
onBeforeUnmount(() => {
  disposed = true
  document.removeEventListener('visibilitychange', onVisibilityChange)
  for (const id of actionStates.keys()) clearActionState(id)
})
</script>

<template>
  <Teleport to="body">
    <ol
      :class="cn('memoh-toaster', `memoh-toaster--${props.position}`, props.class)"
      role="region"
      aria-label="Notifications"
      tabindex="-1"
    >
      <TransitionGroup name="memoh-toast">
        <!--
          Two layout variants — selected purely from data, no CSS hacks needed:

          single  : no description/text action      → flat row, everything center-aligned
          rich    : description or text action      → icon+× pin to first line (flex-start);
                                                       body is a column: title → desc? → text action? → action?
        -->
        <li
          v-for="t in ordered"
          :key="t.id"
          :class="cn('memoh-toast', t.description || t.textAction ? 'memoh-toast--rich' : 'memoh-toast--single')"
          :data-variant="t.variant"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          @mouseenter="pauseAll"
          @mouseleave="resumeAll"
          @focusin="pauseAll"
          @focusout="resumeAll"
        >
          <!-- ── SINGLE LINE ─────────────────────────────────────────────────────
               Everything in one flat row, vertically centered.
               icon · title · (action) · ×
          ──────────────────────────────────────────────────────────────────────── -->
          <template v-if="!t.description && !t.textAction">
            <component
              :is="semanticIcon[t.variant]"
              v-if="semanticIcon[t.variant]"
              class="memoh-toast__icon size-4"
              aria-hidden="true"
            />
            <span class="memoh-toast__title memoh-toast__title--grow">{{ headingFor(t) }}</span>
            <Button
              v-if="t.action"
              variant="outline"
              size="sm"
              class="memoh-toast__action"
              @click="() => { t.action!.onClick(); dismiss(t.id) }"
            >
              {{ t.action.label }}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="memoh-toast__close"
              aria-label="Dismiss notification"
              @click="dismiss(t.id)"
            >
              <XIcon class="size-4" />
            </Button>
          </template>

          <!-- ── RICH (has description) ─────────────────────────────────────────
               icon and × pin to the top (first-line height).
               Action always goes BELOW the desc — never inline with the title.
               icon · title               · ×
                       desc
                       (action)
          ──────────────────────────────────────────────────────────────────────── -->
          <template v-else>
            <component
              :is="semanticIcon[t.variant]"
              v-if="semanticIcon[t.variant]"
              class="memoh-toast__icon size-4 memoh-toast__icon--rich"
              aria-hidden="true"
            />
            <div class="memoh-toast__body">
              <span class="memoh-toast__title">{{ headingFor(t) }}</span>
              <p
                v-if="t.description"
                class="memoh-toast__desc"
              >
                {{ t.description }}
              </p>
              <div
                v-if="t.textAction"
                class="flex min-w-0 flex-wrap items-center gap-1"
              >
                <TextButton
                  type="button"
                  class="min-w-0 max-w-full text-caption"
                  :aria-label="t.textAction.ariaLabel"
                  :aria-busy="actionPhase(t) === 'pending' || undefined"
                  @click="runTextAction(t)"
                >
                  <span class="min-w-0 break-all whitespace-normal text-left">{{ t.textAction.label }}</span>
                  <CheckIcon
                    v-if="actionPhase(t) === 'success'"
                    aria-hidden="true"
                  />
                </TextButton>
                <span
                  v-if="actionPhase(t) === 'success'"
                  role="status"
                  class="sr-only"
                >{{ t.textAction.successLabel }}</span>
                <span
                  v-else-if="actionPhase(t) === 'failure'"
                  role="status"
                  class="text-caption"
                >{{ t.textAction.failureLabel }}</span>
              </div>
              <Button
                v-if="t.action"
                variant="outline"
                size="sm"
                class="memoh-toast__action"
                @click="() => { t.action!.onClick(); dismiss(t.id) }"
              >
                {{ t.action.label }}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              class="memoh-toast__close memoh-toast__close--rich"
              aria-label="Dismiss notification"
              @click="dismiss(t.id)"
            >
              <XIcon class="size-4" />
            </Button>
          </template>
        </li>
      </TransitionGroup>
    </ol>
  </Teleport>
</template>
