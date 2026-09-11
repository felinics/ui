import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useScrollFade(el: Ref<HTMLElement | null | undefined>) {
  const fadeTop = ref(false)
  const fadeBottom = ref(false)

  function update() {
    const node = el.value
    if (!node)
      return
    // 1px slack: fractional scroll positions (zoom, dvh rounding) never quite
    // reach scrollHeight - clientHeight exactly.
    const remaining = node.scrollHeight - node.clientHeight - node.scrollTop
    fadeTop.value = node.scrollTop > 1
    fadeBottom.value = remaining > 1
  }

  watchEffect((onCleanup) => {
    update()
    // Watch BOTH boxes: the scroller (dialog cap / viewport changes) and the
    // content (AutoHeight tween, rows added/removed). Observing only the
    // scroller misses scrollHeight changes — its own box doesn't resize when
    // content grows inside a capped row.
    const observer = new ResizeObserver(update)
    if (el.value) {
      observer.observe(el.value)
      for (const child of Array.from(el.value.children)) observer.observe(child)
    }
    onCleanup(() => observer.disconnect())
  })

  useEventListener(el, 'scroll', update, { passive: true })
  return { fadeTop, fadeBottom }
}
