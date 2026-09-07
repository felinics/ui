import { ref, watchPostEffect, type Ref } from 'vue'

/** Align the first row with its trigger, leaving collision handling to Reka. */
export function useSubmenuAlignment(content: Readonly<Ref<HTMLElement | undefined>>) {
  const alignOffset = ref(0)
  const ready = ref(false)
  watchPostEffect((cleanup) => {
    const element = content.value
    ready.value = false
    if (!element) return
    const trigger = document.getElementById(element.getAttribute('aria-labelledby') ?? '')
    if (!trigger) { ready.value = true; return }
    const measure = () => {
      const first = element.querySelector<HTMLElement>('[role^="menuitem"]')
      if (first && element.offsetWidth) {
        const bounds = element.getBoundingClientRect()
        // Opening scale animation must not influence layout measurements.
        const scale = bounds.width / element.offsetWidth
        if (scale > 0) {
          alignOffset.value = trigger.offsetHeight / 2
            - (first.getBoundingClientRect().top - bounds.top) / scale - first.offsetHeight / 2
        }
      }
      ready.value = true
    }
    const resize = new ResizeObserver(measure)
    resize.observe(element)
    resize.observe(trigger)
    const mutation = new MutationObserver(measure)
    mutation.observe(element, { childList: true, subtree: true })
    measure()
    cleanup(() => { resize.disconnect(); mutation.disconnect() })
  })
  return { alignOffset, ready }
}
