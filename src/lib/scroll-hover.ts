function isNonHoverPointer(event: PointerEvent): boolean {
  return Boolean(event.pointerType) && event.pointerType !== 'mouse' && event.pointerType !== 'pen'
}

export function createScrollHover() {
  let pointer: { x: number, y: number } | undefined
  let hovered: HTMLElement | undefined
  let activeScope: HTMLElement | undefined
  let frame: number | undefined
  let cleanupListeners: (() => void) | undefined

  function detachListeners(): void {
    cleanupListeners?.()
    cleanupListeners = undefined
  }

  function clearAll(): void {
    pointer = undefined
    setHovered(undefined)
  }

  function attachListeners(scope: HTMLElement): void {
    if (cleanupListeners)
      return
    const doc = scope.ownerDocument
    const win = doc.defaultView

    const onDocumentPointerMove = (event: PointerEvent) => {
      if (isNonHoverPointer(event)) {
        clearAll()
        return
      }
      pointer = { x: event.clientX, y: event.clientY }
      if (activeScope && !activeScope.contains(event.target as Node | null))
        sync(activeScope)
    }

    const onDocumentPointerDown = (event: PointerEvent) => {
      if (isNonHoverPointer(event)) {
        clearAll()
        return
      }
      if (activeScope && !activeScope.contains(event.target as Node | null))
        setHovered(undefined)
    }

    const onDocumentFocusIn = (event: FocusEvent) => {
      if (activeScope && event.target instanceof Node && !activeScope.contains(event.target))
        sync(activeScope)
    }

    const onVisibilityChange = () => {
      if (doc.hidden)
        clearAll()
    }

    doc.addEventListener('pointermove', onDocumentPointerMove, { capture: true, passive: true })
    doc.addEventListener('pointerdown', onDocumentPointerDown, { capture: true, passive: true })
    doc.addEventListener('focusin', onDocumentFocusIn, { capture: true })
    doc.addEventListener('visibilitychange', onVisibilityChange)
    win?.addEventListener('blur', clearAll)

    const bodyObserver = doc.body && typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => {
          if (doc.body.style.pointerEvents === 'none') {
            setHovered(undefined)
            return
          }
          if (activeScope)
            sync(activeScope)
        })
      : undefined
    bodyObserver?.observe(doc.body, { attributes: true, attributeFilter: ['style'] })

    cleanupListeners = () => {
      doc.removeEventListener('pointermove', onDocumentPointerMove, { capture: true })
      doc.removeEventListener('pointerdown', onDocumentPointerDown, { capture: true })
      doc.removeEventListener('focusin', onDocumentFocusIn, { capture: true })
      doc.removeEventListener('visibilitychange', onVisibilityChange)
      win?.removeEventListener('blur', clearAll)
      bodyObserver?.disconnect()
    }
  }

  function setHovered(next: HTMLElement | undefined): void {
    if (hovered === next)
      return
    hovered?.removeAttribute('data-pointer-hover')
    next?.setAttribute('data-pointer-hover', '')
    hovered = next
    if (next && activeScope) {
      attachListeners(activeScope)
    }
    else if (!next) {
      detachListeners()
    }
  }

  function sync(scope: HTMLElement): void {
    if (!pointer || scope.ownerDocument.body?.style.pointerEvents === 'none')
      return setHovered(undefined)
    const hit = scope.ownerDocument.elementFromPoint(pointer.x, pointer.y)
    const target = hit?.closest<HTMLElement>('[data-settings-nav-item]')
    setHovered(target && scope.contains(target) ? target : undefined)
  }

  function scheduleSync(scope: HTMLElement): void {
    activeScope = scope
    if (frame !== undefined)
      return
    frame = requestAnimationFrame(() => {
      frame = undefined
      if (activeScope)
        sync(activeScope)
    })
  }

  function pointerMove(event: PointerEvent): void {
    if (isNonHoverPointer(event)) {
      clearAll()
      return
    }
    activeScope = event.currentTarget as HTMLElement
    pointer = { x: event.clientX, y: event.clientY }
    sync(activeScope)
  }

  function pointerLeave(): void {
    clearAll()
  }

  function scroll(event: Event): void {
    scheduleSync(event.currentTarget as HTMLElement)
  }

  function dispose(): void {
    if (frame !== undefined)
      cancelAnimationFrame(frame)
    frame = undefined
    activeScope = undefined
    clearAll()
    detachListeners()
  }

  return { pointerMove, pointerLeave, scroll, dispose }
}
