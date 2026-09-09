<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Primitive } from 'reka-ui'
import { computed, watchEffect } from 'vue'
import { Spinner } from '#/components/spinner'
import { cn } from '#/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  /** Corner shape, orthogonal to size. `circle` forces rounded-full over the
   *  size's rounded-md — use with size="icon"/"icon-sm" for a round icon button
   *  instead of hand-writing `class="rounded-full"` at the call site. */
  shape?: ButtonVariants['shape']
  /** Stretch to the full width of the parent. Full-width buttons (primary AND
   *  ghost) swap the press-scale for a color-press — a uniform scale on a wide
   *  button lurches sideways. */
  block?: boolean
  /** Busy state: shows a centered spinner, blocks clicks, stays FULL color
   *  (busy ≠ disabled). Layout never shifts — the label is hidden in place and
   *  the spinner overlays it, so it works for any width without a glyph swap. */
  loading?: boolean
  /** Loading behavior copied from the contract bench:
   *  - overlay: hide label in place and center a spinner (text-only buttons)
   *  - icon: keep content visible and spin the leading icon (no glyph swap)
   *  - leading: animate a spinner slot before the label (full-width CTAs)
   *  - manual: only the busy chrome (full color, blocked clicks) — the caller
   *    renders its own loading glyph in the slot (e.g. an icon↔spinner↔result
   *    swap that must stay in place). The button draws no spinner of its own.
   */
  loadingMode?: 'overlay' | 'icon' | 'leading' | 'manual'
  /** Inert + faded. Declared as a prop (not just a fallthrough attr) so we can
   *  OR it with `loading` without one clobbering the other. */
  disabled?: boolean
  class?: HTMLAttributes['class']
  /** Render the CALLER's element as the button (reka Slot) instead of `as`.
   *  Inherited from PrimitiveProps; redeclared only for this note.
   *
   *  Under `as-child` the caller owns the element, so the button cannot inject
   *  the wrapper/spinner nodes its `loading` affordances are built from — see
   *  `effectiveLoadingMode`. Everything else (classes, `data-button` chrome,
   *  `data-variant`/`data-size`) lands directly on the caller's element. */
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loadingMode: 'overlay',
})

// Only stamp native `disabled` on real <button>s (an <a as="a"> can't be
// disabled). Loading also disables to swallow double-clicks; busy ≠ disabled
// visually is handled in style.css ([data-loading]:disabled stays full color).
const isNativeButton = computed(() => !props.asChild && props.as === 'button')
const isDisabled = computed(() =>
  isNativeButton.value && (props.disabled || props.loading) ? true : undefined,
)
const resolvedVariant = computed<ButtonVariants['variant']>(() => props.variant ?? 'default')
const buttonClass = computed(() =>
  cn(
    buttonVariants({ variant: resolvedVariant.value, size: props.size, shape: props.shape }),
    props.block && 'w-full',
    props.class,
  ),
)

// as-child hands the ELEMENT to the caller, which costs the button its inner
// scaffolding — and the loss is not optional. reka's Slot merges the button's
// props into the FIRST NON-COMMENT CHILD it is given, so ANY node this
// component renders alongside the slot (a leading-spinner span, the
// data-button-content wrapper) intercepts the merge and the caller's element
// gets nothing. That is precisely the defect the template's asChild branch
// exists to fix; re-adding a wrapper "just for loading" would reintroduce it.
//
// So under as-child, loading degrades to `manual`: the busy chrome still
// applies in full (data-loading holds the engaged color, clicks are swallowed),
// but the button draws no spinner — the caller renders its own indicator inside
// its own element, which is exactly what `manual` already means. Reported in
// the DOM rather than silently ignored, so a reader of the markup can see it.
const effectiveLoadingMode = computed<Props['loadingMode']>(() =>
  props.asChild ? 'manual' : props.loadingMode,
)

if (import.meta.env.DEV) {
  watchEffect(() => {
    if (props.asChild && props.loading && props.loadingMode !== 'manual') {
      console.warn(
        `[@felinic/ui] <Button as-child loading loading-mode="${props.loadingMode}">: as-child gives the element to the caller, so the button cannot inject a spinner — falling back to loading-mode="manual". Render your own indicator inside the child element, or drop as-child and use \`as\`.`,
      )
    }
  })
}
</script>

<template>
  <!-- data-button is a STABLE chrome anchor: when this Button is the child of a
       reka `as-child` trigger (DialogTrigger, DropdownMenuTrigger, …) the trigger's
       own data-slot ("dialog-trigger", …) overrides data-slot="button", which would
       otherwise strip every fill/ring/press rule (all keyed off [data-slot=button]).
       The trigger never sets data-button, so it survives the merge and the button
       chrome in style.css keys off [data-button] instead. -->
  <Primitive
    data-slot="button"
    data-button=""
    :as="as"
    :as-child="asChild"
    :data-variant="resolvedVariant"
    :data-size="size || undefined"
    :data-block="block ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-loading-mode="effectiveLoadingMode"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :class="buttonClass"
  >
    <!-- as-child: the CALLER's element is the button, so this branch must emit
         the slot and NOTHING else. reka's Slot merges the button's props into
         the first non-comment child it receives — with a wrapper here, that
         child is the wrapper, and every button class (inline-flex / h-9 / px-4
         / rounded-md) plus the [data-button] chrome anchor lands on a
         `display:contents` span that generates no box. Net effect: the caller's
         <a>/<RouterLink> renders as bare text, and the ::before fill loses its
         positioning ancestor. That was this component's behaviour from the day
         the wrapper was introduced (it predates the LabelSwap [gap:inherit]
         change, which only added a property to an already-wrapping span), which
         is why `<TextButton as-child>` / `<BreadcrumbLink as-child>` — both
         documented as the way to wrap a RouterLink — never actually looked like
         buttons.

         The wrapper's two jobs are simply not needed here: the button classes
         (gap-2 / gap-1.5 included) are now ON the caller's element, so a nested
         LabelSwap's [gap:inherit] reads the real gap from its actual parent;
         and the loading affordances degrade to `manual` (see
         effectiveLoadingMode) because a spinner node is exactly the injected
         sibling that would break the merge. -->
    <slot v-if="asChild" />
    <template v-else>
      <span
        v-if="loadingMode === 'leading'"
        data-button-leading-spinner
      >
        <Spinner />
      </span>
      <!-- [gap:inherit]:display:contents 在布局上消失,但在 CSS 继承链上仍是 slot
           内容的父元素 —— gap 不是继承属性,不显式转发的话,slot 里做组合的包装组件
           (如 LabelSwap)想 [gap:inherit] 拿到的是这层的 normal(0),不是按钮的
           gap-2/gap-1.5。这里转发一次,按钮的间距契约就能穿透到嵌套组合。 -->
      <span
        data-button-content
        class="contents [gap:inherit]"
      >
        <slot />
      </span>
      <span
        v-if="loading && loadingMode === 'overlay'"
        data-button-spinner
        class="absolute inset-0 grid place-items-center"
      >
        <Spinner />
      </span>
    </template>
  </Primitive>
</template>
