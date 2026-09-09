<script setup lang="ts">
import type { SelectContentEmits, SelectContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  injectSelectRootContext,
  SelectContent,
  SelectPortal,
  SelectViewport,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { menuWidthClass, menuContentClass, menuAnchoredMotionClass, menuAlignOffset } from '#/lib/menu'
import { cn } from '#/lib/utils'
import MenuScrollArea from '../menu-scroll-area/MenuScrollArea.vue'

defineOptions({
  inheritAttrs: false,
})

// "Highlight the selected row on OPEN — once." reka focuses the selected item on
// open, but the highlight is cleared a frame later (the classic flash), so we hold it
// ourselves via [data-open-hint] (style.css) until the user actually interacts. The
// flag is reset on the REAL open state — NOT onMounted: this wrapper mounts once and
// reka toggles the panel internally, which is exactly why a second open used to flash.
// The handoff happens on a GENUINE pointer move (changed coords) or a key press; the
// open itself fires a spurious pointermove with UNCHANGED coords (popper re-positions /
// the selected row scrolls into view) which we ignore. After handoff the pointer owns
// the highlight and it never snaps back to the selected row when the cursor leaves.
const rootContext = injectSelectRootContext()
const openHint = ref(false)
let originX = Number.NaN
let originY = Number.NaN
function clearHint(): void {
  openHint.value = false
}
function onMenuPointerMove(e: PointerEvent): void {
  if (!openHint.value) return
  if (Number.isNaN(originX)) {
    originX = e.clientX
    originY = e.clientY
    return
  }
  if (e.clientX !== originX || e.clientY !== originY) clearHint()
}
onBeforeUnmount(() => document.removeEventListener('keydown', clearHint, true))

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes['class'], size?: 'sm' | 'default' }>(),
  {
    size: 'default',
    position: 'popper',
    // Keep the page SCROLLABLE while the menu is open. The scroll freeze is caused
    // solely by reka's bodyLock (it sets overflow:hidden on <body>), so we turn
    // ONLY that off. We deliberately LEAVE disableOutsidePointerEvents at reka's
    // default (true): it sets pointer-events:none on <body>, which does NOT block
    // wheel scrolling but keeps the rest of the page inert so an outside click
    // still dismisses. Turning it fully off (page-wide live) made reka's focus
    // dance with the trigger and flickered the row highlight. We instead re-enable
    // pointer-events on the TRIGGER ALONE in style.css (so its hover tracks the
    // pointer), leaving everything else inert. The popper still follows the trigger.
    bodyLock: false,
    // Shift the menu left by menuAlignOffset so the first row's TEXT lands under
    // the trigger's TEXT (not the box edges). The offset is the geometric delta
    // between the menu's text inset (border+viewport+item) and the trigger's
    // (selectTriggerClass px-3); see menu.ts → menuAlignOffset. Long-content
    // selects that widen the panel past the trigger override this to 0.
    alignOffset: menuAlignOffset,
  },
)
watch(() => rootContext.open.value, (open) => {
  if (open) {
    openHint.value = true
    originX = Number.NaN
    originY = Number.NaN
    document.addEventListener('keydown', clearHint, true)
  }
  else {
    openHint.value = false
    document.removeEventListener('keydown', clearHint, true)
  }
}, { immediate: true })

const emits = defineEmits<SelectContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'size')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const scrollViewport = ref<InstanceType<typeof MenuScrollArea> | null>(null)
const viewportElement = computed(() => scrollViewport.value?.viewportElement)
const measurementReady = ref(false)

watch(viewportElement, async (element, _previous, onCleanup) => {
  measurementReady.value = false
  if (!element?.isConnected)
    return
  let cancelled = false
  onCleanup(() => { cancelled = true })
  // Measuring mounted text starts any lazily loaded font subsets. Keep the
  // panel measurable but invisible until their final metrics reach Floating UI.
  element.getBoundingClientRect()
  if (document.fonts.status === 'loading') {
    await document.fonts.ready
    // ResizeObserver schedules Floating UI's update after the font relayout;
    // the following frame paints with that updated position.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  }
  if (!cancelled) {
    measurementReady.value = true
    await nextTick()
    // Reka may attempt initial focus while font measurement keeps the menu
    // invisible. Restore it after reveal, without moving an existing item focus.
    if (!cancelled && rootContext.open.value && !element.contains(document.activeElement)) {
      const selected = element.querySelector<HTMLElement>('[data-slot="select-item"][data-state="checked"]:not([data-disabled])')
      const first = element.querySelector<HTMLElement>('[data-slot="select-item"]:not([data-disabled])')
      ;(selected ?? first)?.focus({ preventScroll: true })
    }
  }
}, { flush: 'post' })
</script>

<template>
  <SelectPortal>
    <SelectContent
      data-slot="select-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn(
        menuWidthClass,
        menuContentClass,
        !measurementReady && 'invisible animate-none!',
        'relative flex flex-col overflow-hidden max-h-(--reka-select-content-available-height)',
        position === 'popper'
          && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        position === 'popper' && menuAnchoredMotionClass,
        'origin-(--reka-select-content-transform-origin)',
        // Increase label size without growing the established row height.
        size === 'sm'
          ? '[&_[data-slot=select-item]]:text-label'
          : '[&_[data-slot=select-item]]:text-control',
        props.class,
      )
      "
    >
      <MenuScrollArea
        ref="scrollViewport"
        :viewport-as="SelectViewport"
        :viewport-attrs="{
          'data-slot': 'select-viewport',
          class: position === 'popper' ? 'min-w-(--reka-select-trigger-width) scroll-my-1' : undefined,
          'data-open-hint': openHint ? '' : undefined,
          onPointermove: onMenuPointerMove,
        }"
      >
        <slot />
      </MenuScrollArea>
    </SelectContent>
  </SelectPortal>
</template>
