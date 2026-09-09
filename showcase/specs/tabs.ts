import type { ComponentSpec, SpecState } from '../lib/spec'
import { h } from 'vue'
import { Bell, KeyRound, User } from 'lucide-vue-next'
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariantKeys } from '#/components/tabs'

// One tab table shared by the canvas, matrix, examples, and code() — the
// snippet must mirror the stage exactly, so both read from here.
const TABS = [
  { value: 'account', label: 'Account', content: 'Profile, identity, and sign-in settings.' },
  { value: 'password', label: 'Password', content: 'Change the password and manage credentials.' },
  { value: 'notifications', label: 'Notifications', content: 'Choose which events reach you.' },
] as const

// Icon names are stored explicitly — the code() snippet prints them, so they
// must not rely on runtime component.name.
const TAB_ICONS = {
  account: { icon: User, name: 'User' },
  password: { icon: KeyRound, name: 'KeyRound' },
  notifications: { icon: Bell, name: 'Bell' },
} as const

// The Disabled knob strikes ONE trigger (the last), not the root — reka has no
// root-level disabled, and per-item disabled is the real-world case.
const DISABLED_VALUE = 'notifications'

function renderTabs(state: SpecState, withIcons = false) {
  return h(Tabs, {
    modelValue: String(state.value),
    'onUpdate:modelValue': (v: unknown) => (state.value = String(v)),
    class: 'w-96',
  }, () => [
    // `label` names the inner element that actually carries role="tablist" —
    // the outer wrapper only hosts the sliding indicator, so an aria-label
    // parked there would be invisible to a screen reader.
    h(TabsList, { variant: state.variant as never, label: 'Account settings sections' }, () =>
      TABS.map(t =>
        h(TabsTrigger, {
          value: t.value,
          disabled: t.value === DISABLED_VALUE && Boolean(state.disabled),
        }, () => (withIcons ? [h(TAB_ICONS[t.value].icon), t.label] : t.label)),
      )),
    TABS.map(t =>
      h(TabsContent, { value: t.value }, () =>
        h('p', { class: 'text-body text-muted-foreground' }, t.content))),
  ])
}

export const tabsSpec: ComponentSpec = {
  id: 'tabs',
  name: 'Tabs',
  description:
    'Panel switcher with a sliding indicator measured off the active trigger. underline is the full-width section rail (default); pill is the enclosed chrome for surfaces where a rail would clash.',
  descriptionZh:
    '面板切换器,指示器按激活项实测滑动。underline 是通栏区块导航栏(默认);pill 是内嵌于卡片等表面、不适合底部轨道的封闭铬。',
  controls: [
    { kind: 'enum', key: 'variant', label: 'Variant', options: tabsListVariantKeys, default: 'underline', display: 'segmented' },
    { kind: 'enum', key: 'value', label: 'Active tab', options: TABS.map(t => t.value), default: 'account', display: 'segmented' },
    { kind: 'boolean', key: 'disabled', label: 'Disabled tab', default: false },
  ],
  matrix: { rows: 'variant', cols: 'disabled' },
  examples: [
    {
      name: 'Pill chrome',
      nameZh: '药丸铬',
      state: { variant: 'pill', value: 'password' },
    },
    {
      name: 'With a disabled tab',
      nameZh: '含禁用项',
      state: { disabled: true },
    },
    {
      name: 'Icon triggers',
      nameZh: '图标触发器',
      state: { value: 'account' },
      render: state => renderTabs(state, true),
    },
  ],
  render: state => renderTabs(state),
  usage: `Tabs switch PANELS and own the tab a11y contract (tablist / tab / tabpanel, arrow-key roving focus). Picking ONE value from a row — Day/Week/Month, List/Board — is SegmentedControl: it returns a value and owns no content.

- underline (default) is the section-nav rail: full-width bottom border with a sliding bar. The default for page- or dialog-level sections.
- pill is the enclosed chrome for tabs embedded inside a surface where a bottom rail would clash (cards, toolbars). Same Tabs semantics — never reach for it as a value picker just because it wears the picker skin.
- Name the tab row with TabsList's \`label\` prop whenever a visible heading doesn't already name it. It forwards to the inner element that carries role="tablist"; the outer element is only the indicator host, so an aria-label written there reaches no screen reader (aria-* attributes passed as raw attrs are forwarded for you).
- Pair with TabsContent panels: they wire role="tabpanel" + aria linkage and mount only the active panel. Use v-if / conditional rendering only when the panel must live outside the Tabs root — then the aria wiring is on you.
- The indicator is measured off the active trigger — any label width just works; don't force equal widths.`,
  usageZh: `Tabs 切换面板,并携带 tab 无障碍契约(tablist / tab / tabpanel、方向键漫游焦点)。从一行里选一个值——日/周/月、列表/看板——用 SegmentedControl:它返回一个值,不拥有内容。

- underline(默认)是区块导航栏:通栏底边加滑动指示条。页面级、弹窗级分区的默认选择。
- pill 是封闭铬,用于内嵌在卡片、工具栏等表面里、底栏轨道会打架的场景。语义不变——别因为它穿着选择器的皮就拿它当取值器用。
- 只要没有可见标题为这排 tab 命名,就用 TabsList 的 label prop 给它取名。它会转发到真正带 role="tablist" 的内层元素;外层只是指示条的宿主,写在那里的 aria-label 读屏读不到(以原始 attr 形式传入的 aria-* 也会被自动转发)。
- 面板配 TabsContent:它接好 role="tabpanel" 和 aria 关联,且只挂载激活面板。只有当面板必须长在 Tabs 根节点之外时才用 v-if 条件渲染——那时 aria 关联要自己补。
- 指示器按激活触发器实测定位——任意 label 宽度都自然对齐,不要强行等宽。`,
}
