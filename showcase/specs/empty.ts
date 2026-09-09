import type { ComponentSpec, SpecState } from '../lib/spec'
import { h } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '#/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  emptyVariantKeys,
} from '#/components/empty'

const TITLE = 'No API keys yet'
const DESCRIPTION = 'Keys let a service call this workspace on your behalf.'

function renderEmpty(state: SpecState) {
  return h(Empty, { variant: state.variant as never }, () => [
    h(EmptyHeader, null, () => [
      h(EmptyTitle, null, () => TITLE),
      h(EmptyDescription, null, () => DESCRIPTION),
    ]),
    state.withAction
      ? h(EmptyContent, null, () =>
          h(Button, { variant: 'outline' }, () => [h(Plus), 'New key']))
      : null,
  ])
}

export const emptySpec: ComponentSpec = {
  id: 'empty',
  name: 'Empty',
  description:
    'The "no rows yet" surface. It is the same page with nothing in it, so it keeps the frame the populated state has — a solid hairline when it stands alone, none when a card already frames it.',
  descriptionZh:
    '"还没有数据"的表面。它就是同一个页面的空版本,因此保留有数据时的那个框——独立摆放时是一道实线发丝边,已被卡片包住时则不再自带边。',
  controls: [
    { kind: 'enum', key: 'variant', label: 'Variant', options: emptyVariantKeys, default: 'framed', display: 'segmented' },
    { kind: 'boolean', key: 'withAction', label: 'Guiding action', default: true },
  ],
  examples: [
    {
      name: 'Standalone',
      nameZh: '独立摆放',
      note: 'The frame is SOLID. border-dashed reads "drop zone / add here" and is reserved for the "+ Add another" tile beside real items.',
      noteZh: '框是实线。border-dashed 读作"拖放区 / 在此新增",只留给已有内容旁边的"+ 再加一个"格子。',
      state: { variant: 'framed' },
    },
    {
      name: 'Inside a card',
      nameZh: '卡片内',
      note: 'bare drops the hairline — a card already frames it, and two strokes on one unit is card-in-card.',
      noteZh: 'bare 去掉发丝边——卡片已经框住它了,一个视觉单元上两道描边就是卡中卡。',
      state: { variant: 'bare', withAction: true },
      render: state => h(Card, { class: 'w-96' }, () => [
        h(CardHeader, null, () => h(CardTitle, null, () => 'API keys')),
        h(CardContent, null, () => renderEmpty(state)),
      ]),
    },
    {
      name: 'Message only',
      nameZh: '仅消息',
      note: 'Drop the action when the user cannot create the thing from here.',
      noteZh: '当用户无法在此处创建该对象时,就不要放动作按钮。',
      state: { variant: 'framed', withAction: false },
    },
  ],
  render: state => renderEmpty(state),
  usage: `An empty state keeps the populated skeleton — entering an empty page and a full one must not jolt the layout. Compose EmptyHeader (EmptyTitle + EmptyDescription) plus, when the user can act, one EmptyContent action.

- framed (default) stands in for the card or grid that will be there once data exists: one SOLID border-border hairline at the card radius. Never dashed — dashed is the "+ Add another" tile beside real items, not "nothing yet".
- bare is for an Empty nested in a surface that already draws the hairline (a Card, a SettingsSection). A second stroke there is card-in-card.
- No decorative icon. EmptyMedia variant="icon" is a bordered tile — inside a card it is card-in-card, and a big glyph above the title is the icon abuse this page type attracts. Title + description + one action.
- One guiding action, and it is the same action the populated page offers ("New key"), not a special empty-only affordance.
- A CONDITIONAL section vanishes when it is empty instead of drawing an empty frame; only always-present content earns an Empty.`,
  usageZh: `空态保留有数据时的骨架——进入空页面和进入满页面不应让布局跳一下。组合 EmptyHeader(EmptyTitle + EmptyDescription),以及在用户确实能动手时加一个 EmptyContent 动作。

- framed(默认)顶替有数据后会出现的卡片或网格:一道实线 border-border 发丝边,取卡片圆角。绝不用虚线——虚线是已有内容旁边那个"+ 再加一个"格子,不是"还没有"。
- bare 用于嵌在已经画了发丝边的表面里(Card、SettingsSection)。在那里再加一道描边就是卡中卡。
- 不要装饰性图标。EmptyMedia variant="icon" 自带描边,放进卡片就是卡中卡;标题上方压一个大字形则是这类页面最容易招来的图标滥用。标题 + 描述 + 一个动作,就够了。
- 只放一个引导动作,而且就是有数据时页面提供的那个动作("新建密钥"),不要为空态另造一个。
- 条件性区块在为空时应整块消失,而不是画一个空框;只有始终存在的内容才配一个 Empty。`,
}
