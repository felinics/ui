import { mount } from '@vue/test-utils'
import { Primitive } from 'reka-ui'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { Button } from '..'
import { TextButton } from '../../text-button'

// Why this file exists at all (see vitest.config.ts): every other enforcement
// layer in this library reads source text. `<Button as-child><a/></Button>`
// type-checked, and every class string involved was legal — the defect was that
// they all landed on an internal `display:contents` wrapper instead of on the
// caller's element, which only the rendered DOM can show. So these assertions
// are deliberately about WHICH ELEMENT carries the contract; they never inspect
// what the class list says.

// [data-button] is the chrome anchor every hover/press/focus rule in style.css
// keys off (see the comment in Button.vue), so "the button" means "the one node
// wearing it". Exactly one may exist — a second would mean a wrapper is also
// claiming to be the button.
function theButton(wrapper: ReturnType<typeof mount>) {
  const anchored = wrapper.findAll('[data-button]')
  expect(anchored).toHaveLength(1)
  const el = anchored[0]!.element
  // Box-generating layout classes are the tell: on a `display:contents` wrapper
  // these compute to nothing, which is exactly how the bug stayed invisible.
  // Only size-invariant base classes belong here — a size rung can legitimately
  // merge away e.g. rounded-md (size="text" swaps in rounded-sm).
  expect(el.className).toContain('inline-flex')
  expect(el.className).toContain('items-center')
  return el
}

describe('<Button as-child>', () => {
  it('puts the button contract on the CALLER\'s element, not on a wrapper', () => {
    const wrapper = mount(Button, {
      props: { asChild: true, variant: 'ghost' },
      slots: { default: () => h('a', { 'href': '/settings', 'data-probe': '' }, 'Settings') },
    })

    const el = theButton(wrapper)
    // The identity check is the whole point: same NODE as the caller's element.
    expect(el).toBe(wrapper.get('[data-probe]').element)
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('data-variant')).toBe('ghost')
    expect(el.className).toContain('h-9')
    expect(el.className).toContain('rounded-md')
  })

  it('renders NO internal wrapper that could intercept the Slot merge', () => {
    // reka's Slot merges into the first non-comment child it receives. Any node
    // this component emitted alongside the slot would swallow the merge, so the
    // as-child branch must be the slot and nothing else.
    const wrapper = mount(Button, {
      props: { asChild: true },
      slots: { default: () => h('a', { href: '/x' }, 'Go') },
    })

    expect(wrapper.find('[data-button-content]').exists()).toBe(false)
    expect(wrapper.find('[data-button-leading-spinner]').exists()).toBe(false)
    expect(theButton(wrapper).children).toHaveLength(0)
  })

  it('degrades loading to `manual` — busy chrome, no injected spinner', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Button, {
      props: { asChild: true, loading: true, loadingMode: 'overlay' },
      slots: { default: () => h('a', { href: '/x' }, 'Go') },
    })

    const el = theButton(wrapper)
    expect(el.getAttribute('data-loading')).toBe('')
    expect(el.getAttribute('aria-busy')).toBe('true')
    // Honest in the DOM: no spinner exists, so the mode must not claim one.
    expect(el.getAttribute('data-loading-mode')).toBe('manual')
    expect(wrapper.find('[data-button-spinner]').exists()).toBe(false)
    // …and it must say so out loud rather than silently dropping the spinner.
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('reaches the caller\'s element through TextButton (the RouterLink path)', () => {
    // TextButton / BreadcrumbLink both document as-child as the way to wrap a
    // RouterLink; they forward straight into Button, so they broke with it.
    const wrapper = mount(TextButton, {
      props: { asChild: true },
      slots: { default: () => h('a', { href: '/bots' }, 'Bots') },
    })

    expect(theButton(wrapper).tagName).toBe('A')
  })
})

describe('<Button> without as-child', () => {
  it('keeps the content wrapper that the loading affordances are built on', () => {
    const wrapper = mount(Button, { slots: { default: () => 'Save' } })

    expect(theButton(wrapper).tagName).toBe('BUTTON')
    // style.css hides THIS node in place during overlay loading; losing it
    // would silently break the zero-layout-shift spinner.
    expect(wrapper.find('[data-button-content]').exists()).toBe(true)
  })

  it('still receives a wrapping reka trigger\'s props (the Pagination direction)', () => {
    // The other as-child direction — <PaginationItem as-child><Button/> — was
    // never broken, and the contract (AGENTS.md § Breadcrumb & Pagination)
    // depends on it: the trigger's data-slot overrides data-slot="button" while
    // data-button survives, which is why the chrome keys off data-button.
    const wrapper = mount({
      components: { Primitive, Button },
      template: '<Primitive as-child data-slot="pagination-item"><Button variant="ghost">1</Button></Primitive>',
    })

    const el = theButton(wrapper)
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('pagination-item')
  })
})
