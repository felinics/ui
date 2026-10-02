import type { ComponentSpec } from '../lib/spec'
import { h } from 'vue'
import { ArrowRight, Plus, RefreshCw } from 'lucide-vue-next'
import { Button, buttonSizeKeys, buttonVariantKeys } from '#/components/button'

const LOADING_MODES = ['overlay', 'icon', 'leading'] as const

function isLink(variant: unknown): boolean {
  return String(variant).startsWith('link')
}

// Link variants are inline text affordances — they render as <a>, never a
// button box (same split as the dev wall and the old stories).
function linkAttrs(variant: unknown): Record<string, string> {
  return isLink(variant) ? { as: 'a', href: '#' } : {}
}

export const buttonSpec: ComponentSpec = {
  id: 'button',
  name: 'Button',
  description:
    'Triggers an action. The charcoal default is the high-emphasis CTA; brand purple is scarce and reserved for rare moments.',
  descriptionZh:
    '触发一个动作。深炭色 default 是高强调 CTA;brand 紫色稀缺，只留给极少数时刻。',
  controls: [
    {
      kind: 'enum',
      key: 'variant',
      label: 'Variant',
      options: buttonVariantKeys,
      default: 'default',
    },
    { kind: 'enum', key: 'size', label: 'Size', options: buttonSizeKeys, default: 'default' },
    { kind: 'string', key: 'label', label: 'Label', default: 'Save changes' },
    { kind: 'boolean', key: 'loading', label: 'Loading', default: false },
    {
      kind: 'enum',
      key: 'loadingMode',
      label: 'Loading mode',
      options: LOADING_MODES,
      default: 'overlay',
      when: state => state.loading === true,
    },
    { kind: 'boolean', key: 'disabled', label: 'Disabled', default: false },
    { kind: 'boolean', key: 'block', label: 'Block', default: false },
  ],
  // The canonical review grid: every variant in every size.
  matrix: { rows: 'variant', cols: 'size' },
  examples: [
    {
      name: 'With icons',
      nameZh: '带图标',
      note: 'An icon sharpens scanning and never replaces the label — except the icon-only button, which must carry an aria-label instead.',
      noteZh: '图标帮助扫读，但不替代文字——纯图标按钮例外，它必须带 aria-label。',
      render: () => [
        h(Button, () => [h(Plus), 'New']),
        h(Button, { variant: 'secondary' }, () => ['Continue', h(ArrowRight)]),
        h(Button, { variant: 'ghost', size: 'icon', 'aria-label': 'Refresh' }, () => h(RefreshCw)),
      ],
    },
    {
      name: 'Loading modes',
      nameZh: '加载模式',
      note: 'overlay hides the label and centers the spinner — width never shifts; leading grows the spinner in before the label, the full-width CTA pattern. The loading glyph is always the arrow-less Spinner, never a spinning action icon. loading blocks clicks — busy is not disabled.',
      noteZh: 'overlay 隐藏标签并把 spinner 居中,宽度不抖;leading 让 spinner 在标签前长出来,是全宽 CTA 的形态。loading 的图形永远是不带箭头的 Spinner,绝不是一个旋转起来的动作图标。loading 会屏蔽点击——忙 ≠ 禁用。',
      render: () => [
        h(Button, { loading: true }, () => 'Save changes'),
        h(Button, { loading: true, loadingMode: 'leading' }, () => 'Continue'),
      ],
    },
    {
      name: 'as-child — the link IS the button',
      nameZh: 'as-child——链接本身就是按钮',
      note: 'as-child hands the ELEMENT to the caller: the classes and the [data-button] chrome land on the <a> / <RouterLink> itself, so one element both navigates and looks like a button. The built-in loading spinner is unavailable here (the caller owns the element) — pass loading-mode="manual" and render your own.',
      noteZh: 'as-child 把元素交给调用方:类和 [data-button] 铬件直接落在 <a> / <RouterLink> 上,于是同一个元素既能跳转又长得像按钮。内建 loading spinner 在这里用不了(元素归调用方所有)——传 loading-mode="manual" 自己渲染。',
      render: () => [
        h(Button, { asChild: true }, () => h('a', { href: '#' }, ['Open docs', h(ArrowRight)])),
        h(Button, { asChild: true, variant: 'outline' }, () => h('a', { href: '#' }, 'Back')),
        h(Button, { asChild: true, variant: 'ghost', size: 'icon' }, () =>
          h('a', { 'href': '#', 'aria-label': 'Refresh' }, h(RefreshCw))),
      ],
    },
    {
      name: 'Icon buttons',
      nameZh: '图标按钮',
      note: 'Three square sizes for toolbars and chrome. No visible label, so the aria-label is the contract.',
      noteZh: '三个方形尺寸，用于工具栏和界面铬件。没有可见文字，aria-label 就是契约。',
      render: () => [
        h(Button, { size: 'icon-lg', 'aria-label': 'Add' }, () => h(Plus)),
        h(Button, { size: 'icon', 'aria-label': 'Add' }, () => h(Plus)),
        h(Button, { size: 'icon-sm', 'aria-label': 'Add' }, () => h(Plus)),
      ],
    },
  ],
  render: (state) => {
    // Icon sizes take an icon child + aria-label, never a text label — a
    // label inside a square button overflows the box (the All variants grid
    // crosses every variant with the icon sizes, so this must hold there too).
    const iconOnly = String(state.size).startsWith('icon')
    return h(
      Button,
      {
        variant: state.variant as never,
        size: state.size as never,
        loading: Boolean(state.loading),
        loadingMode: state.loadingMode as never,
        disabled: Boolean(state.disabled),
        block: Boolean(state.block),
        ...(iconOnly ? { 'aria-label': String(state.label) } : {}),
        ...linkAttrs(state.variant),
      },
      iconOnly ? () => h(Plus) : () => String(state.label),
    )
  },
  usage: `Reach for variant + size, never hand-written classes.

- default/primary is the charcoal high-emphasis CTA — one per surface.
- brand purple is scarce: rare moments like the chat Send button, never a default fill.
- destructive is a filled red CTA, not a ghost button with red text.
- "Clickable text with a hover chip" is TextButton (ghost @ size="text"), not a hand-rolled hover on a span.
- Icon-only buttons must carry an aria-label.
- loading holds full color and blocks clicks; disabled fades to opacity-40. Busy ≠ disabled.
- Wrapping a router link: as-child makes the caller's element the button (one element, both jobs). Its one limit is the built-in spinner — under as-child, loading degrades to loading-mode="manual".`,
  usageZh: `用 variant + size 表达意图,永远别手写 class。

- default/primary 是深炭色高强调 CTA——一个界面最多一个。
- brand 紫是稀缺色:只留给聊天发送键这类极少数时刻,绝不做默认填充。
- destructive 是实心红 CTA,不是红字 ghost。
- "可点击、带 hover 衬底的文字"是 TextButton(ghost @ size="text"),不是给 span 手写 hover。
- 纯图标按钮必须带 aria-label。
- loading 保持全色并屏蔽点击;disabled 降到 opacity-40。忙 ≠ 禁用。
- 要包路由链接就用 as-child:调用方的元素直接成为按钮(一个元素兼两职)。唯一的限制是内建 spinner——as-child 下 loading 降级为 loading-mode="manual"。`,
}
