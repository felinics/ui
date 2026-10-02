import type { ComponentSpec } from '../lib/spec'
import { h } from 'vue'
import { Button } from '#/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/card'

// Sample copy shared by render()/code() so the snippet mirrors the canvas
// exactly (the single-source rule for specs — never two hand-kept copies).
const DESCRIPTION = 'Files uploaded to this workspace count toward the limit.'
const CONTENT = 'You have used 3.2 GB of 5 GB.'

// Card has no variant axes — it is a plain composition container. The knobs
// here toggle the optional composition parts (description / header action /
// footer) instead, so no matrix: there is no axis grid a reviewer would scan.
export const cardSpec: ComponentSpec = {
  id: 'card',
  name: 'Card',
  description:
    'A static surface that groups related content: bg-card fill, one border-border hairline in light mode (dropped in dark unless `bordered`), card radius, deliberately no shadow. Composed from Header/Title/Description/Action/Content/Footer.',
  descriptionZh:
    '分组相关内容的静态表面:bg-card 填充、浅色下一道 border-border 发丝描边(深色下去掉,`bordered` 时保留)、卡片圆角,刻意无阴影。由 Header/Title/Description/Action/Content/Footer 组合。',
  controls: [
    { kind: 'string', key: 'title', label: 'Title', default: 'Storage usage' },
    { kind: 'boolean', key: 'withDescription', label: 'Description', default: true },
    { kind: 'boolean', key: 'withAction', label: 'Header action', default: false },
    { kind: 'boolean', key: 'withFooter', label: 'Footer actions', default: false },
  ],
  examples: [
    {
      name: 'Content only',
      nameZh: '纯内容',
      state: { withDescription: false, withAction: false, withFooter: false },
    },
    {
      name: 'Header action',
      nameZh: '头部操作',
      state: { withAction: true, withFooter: false },
    },
    {
      name: 'Footer actions',
      nameZh: '底部操作',
      state: { withDescription: true, withAction: false, withFooter: true },
    },
  ],
  // Children that can be null (toggled parts) are wrapped in arrays — Vue
  // skips null entries, and h() only accepts null directly at the top level.
  render: state =>
    h(Card, { class: 'w-96' }, () => [
      h(CardHeader, null, () => [
        h(CardTitle, null, () => String(state.title)),
        state.withDescription ? h(CardDescription, null, () => DESCRIPTION) : null,
        state.withAction
          ? h(CardAction, null, () => h(Button, { variant: 'outline', size: 'sm' }, () => 'Edit'))
          : null,
      ]),
      h(CardContent, null, () => CONTENT),
      state.withFooter
        ? h(CardFooter, { class: 'gap-2' }, () => [
            h(Button, { variant: 'outline' }, () => 'Cancel'),
            h(Button, null, () => 'Save'),
          ])
        : null,
    ]),
  usage: `Card is a STATIC container — it groups related content on a page and is never interactive. The flat look is a contract: bg-card fill, one hairline, no shadow.

- If the whole card is a door to a next surface, that is ActionCard — do not bolt a click onto Card.
- Compose from CardHeader (CardTitle / CardDescription / CardAction) + CardContent + CardFooter; every part is optional except the content itself.
- CardAction puts ONE header-level control (an outline or icon Button) at the top-right — not a per-item action menu, not a second title.
- Footer actions follow the dialog convention: quiet/cancel first, primary last.
- Do not nest cards inside cards; one bordered surface per group.`,
  usageZh: `Card 是静态容器——把页面上相关的内容归为一组,本身绝不交互。扁平外观是契约:bg-card 填充、一道发丝描边、无阴影。

- 整张卡片若是通往下一层表面的入口,那是 ActionCard——不要给 Card 硬接 click。
- 由 CardHeader(CardTitle / CardDescription / CardAction)+ CardContent + CardFooter 组合;除内容外每个部分都可省。
- CardAction 在头部右上角放唯一一个头部级控件(outline 或 icon Button)——不是逐项操作菜单,也不是第二个标题。
- 底部操作沿用 dialog 约定:安静/取消在前,主操作在后。
- 不要把卡片嵌进卡片;一组内容一个带描边的表面。`,
}
