import type { ComponentSpec, SpecState } from '../lib/spec'
import { h } from 'vue'
import { Button } from '#/components/button'
import { Field, FieldControl, FieldDescription, FieldGroup, FieldLabel } from '#/components/field'
import { Input } from '#/components/input'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
  sheetPanelWidthKeys,
} from '#/components/sheet'
import { Textarea } from '#/components/textarea'

const SIDES = ['right', 'left'] as const

// Enough rows that the body actually scrolls at every width rung — a form
// drawer that fits on one screen never proves the row grid caps the body.
const FIELDS = [
  { label: 'Name', placeholder: 'Production relay', description: 'Shown in the provider list.' },
  { label: 'Base URL', placeholder: 'https://api.example.com/v1', description: '' },
  { label: 'API key', placeholder: 'sk-…', description: 'Stored encrypted; shown once on creation.' },
  { label: 'Organization', placeholder: 'org_…', description: '' },
] as const

// Overlay specs render UNCONTROLLED (interactive: true): a closed, live trigger
// you click. NO `open` control — pinning a controlled overlay open writes into
// a per-render throwaway state and its scrim freezes the page.
function renderSheet(state: SpecState) {
  const withFooter = Boolean(state.footer)
  return h(Sheet, null, () => [
    h(SheetTrigger, { asChild: true }, () => h(Button, { variant: 'outline' }, () => 'Add provider')),
    h(SheetPanel, {
      width: state.width as never,
      side: state.side as never,
      footer: withFooter,
    }, () => [
      h(SheetHeader, null, () => [
        h(SheetTitle, null, () => 'Add provider'),
        h(SheetDescription, null, () => 'Connect an OpenAI-compatible upstream to this workspace.'),
      ]),
      h(SheetBody, null, () => h(FieldGroup, null, () => [
        ...FIELDS.map(f =>
          h(Field, null, () => [
            h(FieldLabel, null, () => f.label),
            h(FieldControl, null, () => h(Input, { placeholder: f.placeholder })),
            f.description ? h(FieldDescription, null, () => f.description) : null,
          ])),
        h(Field, null, () => [
          h(FieldLabel, null, () => 'Extra headers'),
          h(FieldControl, null, () => h(Textarea, { variant: 'code', placeholder: '{\n  "X-Tenant": "acme"\n}' })),
        ]),
      ])),
      withFooter
        ? h(SheetFooter, null, () => [
            h(SheetClose, { asChild: true }, () => h(Button, { variant: 'outline' }, () => 'Cancel')),
            h(Button, null, () => 'Add provider'),
          ])
        : null,
    ]),
  ])
}

export const sheetSpec: ComponentSpec = {
  id: 'sheet',
  name: 'Sheet',
  interactive: true,
  description:
    'An edge-anchored secondary surface. SheetPanel is its capped three-row shell — header / scrolling body / footer — so a form drawer needs no layout classes at the call site.',
  descriptionZh:
    '贴边滑出的次级表面。SheetPanel 是它的三行定高外壳——头部 / 可滚动主体 / 底部——因此表单抽屉在调用处不需要写任何布局类。',
  controls: [
    { kind: 'enum', key: 'width', label: 'Width', options: sheetPanelWidthKeys, default: 'md', display: 'segmented' },
    { kind: 'enum', key: 'side', label: 'Side', options: SIDES, default: 'right', display: 'segmented' },
    { kind: 'boolean', key: 'footer', label: 'Footer', default: true },
  ],
  examples: [
    {
      name: 'Form drawer',
      nameZh: '表单抽屉',
      note: 'The body scrolls between two fixed hairlines; header and footer never move. That cap is the row grid, and it is the component\'s, not the page\'s.',
      noteZh: '主体在两道固定发丝线之间滚动,头尾不动。这个上限由行栅格给出,归组件所有,不归页面。',
      state: { width: 'lg', footer: true },
    },
    {
      name: 'No footer',
      nameZh: '无底部',
      note: 'Read-only detail: without `footer` the panel is two rows and draws no bottom divider — a declared-but-empty row would still show one.',
      noteZh: '只读详情:不传 footer 时面板只有两行,也不画底部分隔线——声明了却空着的行仍会画出来。',
      state: { width: 'md', footer: false },
    },
    {
      name: 'Left side',
      nameZh: '左侧',
      state: { side: 'left', width: 'sm' },
    },
  ],
  render: state => renderSheet(state),
  usage: `Use a Sheet sparingly: a surface flying in over the whole app is a heavy transition. Prefer an in-page push panel for "show more detail". A Sheet earns its weight for a real secondary context — a create/edit form, a deep filter drawer, mobile nav.

- Compose SheetPanel + SheetHeader + SheetBody + SheetFooter. The panel owns the row grid, the width rungs, the narrow-screen width, the header/footer hairlines, and the footer's action row — a caller writes content only.
- Width is an enumerated rung (sm/md/lg/xl). If none fits, add a rung to SheetPanel; never pass sm:max-w-[…] from a page.
- \`footer\` is a prop, not slot detection: it adds the third row AND its divider, so an empty declared row can't leave a stray line at the bottom.
- Stack fields with FieldGroup inside SheetBody — the body is a scroll container, the rhythm of the fields is FieldGroup's job.
- A bare SheetContent is still right for a single flowing surface (mobile nav) that has nothing to divide.`,
  usageZh: `Sheet 要省着用:一个盖住整个应用飞入的表面是很重的转场。"看更多细节"优先用页内推开的面板。真正的次级上下文——新建/编辑表单、深度筛选抽屉、移动端导航——才配得上它的重量。

- 用 SheetPanel + SheetHeader + SheetBody + SheetFooter 组合。行栅格、宽度档位、窄屏宽度、头尾发丝线、底部动作行都归面板所有——调用方只写内容。
- 宽度是枚举档位(sm/md/lg/xl)。没有合适的档就去 SheetPanel 加一档,绝不从页面传 sm:max-w-[…]。
- footer 是 prop,不是槽探测:它同时加上第三行和那道分隔线,所以不会出现"声明了却空着的行"在底部留一道多余的线。
- 在 SheetBody 里用 FieldGroup 堆字段——主体是滚动容器,字段的节奏归 FieldGroup 管。
- 对于没什么可分隔的单一连续表面(移动端导航),裸用 SheetContent 依然是对的。`,
}
