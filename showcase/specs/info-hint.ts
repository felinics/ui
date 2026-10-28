import type { ComponentSpec } from '../lib/spec'
import { h } from 'vue'
import { Button } from '#/components/button'
import { InfoHint } from '#/components/info-hint'
import { tooltipAlignKeys, tooltipSideKeys } from '#/components/tooltip'

export const infoHintSpec: ComponentSpec = {
  id: 'info-hint',
  name: 'InfoHint',
  interactive: true,
  description:
    'A muted ⓘ glyph that only explains: hover, keyboard focus or a tap opens a short Tooltip. Not an action, so not a button.',
  descriptionZh:
    '只负责解释的灰色 ⓘ 图标：悬停、键盘聚焦或轻点时弹出简短的 Tooltip。它不是操作，所以不是按钮。',
  controls: [
    { kind: 'enum', key: 'side', label: 'Side', options: tooltipSideKeys, default: 'top', display: 'segmented' },
    { kind: 'enum', key: 'align', label: 'Align', options: tooltipAlignKeys, default: 'center', display: 'segmented' },
    {
      kind: 'string',
      key: 'text',
      label: 'Text',
      default: 'Saving replaces this message and the reply after it.',
    },
  ],
  examples: [
    {
      name: 'Beside an action row',
      nameZh: '放在操作行旁边',
      // Real placement: it explains what the buttons next to it will do,
      // sitting at the text scale of their labels.
      render: state => h('div', { class: 'flex items-center gap-1.5' }, [
        h(InfoHint, { text: String(state.text), side: state.side as never, align: 'end' }),
        h(Button, { variant: 'ghost', tone: 'muted', size: 'sm' }, () => 'Cancel'),
        h(Button, { variant: 'primary', size: 'sm' }, () => 'Save'),
      ]),
    },
  ],
  render: state => h(InfoHint, { text: String(state.text), side: state.side as never, align: state.align as never }),
  usage: `InfoHint carries supplementary explanation only — a reader has to go looking for it, so nothing essential may live only inside it.

- Use it when a glyph's whole job is to explain. If clicking should DO something, that is a Button.
- The glyph is 14px and muted — one rung above the text rung, because a thin outline circle looks smaller than text of the same height. Do not resize or recolor it per call site.
- The text is also the accessible name — write it as a full sentence.
- Beside taller controls, set align to the edge pointing away from them (align="end" when they sit to its right) so the tooltip does not land on them.`,
  usageZh: `InfoHint 只放补充说明——读者得主动去看才能看到，所以关键信息绝不能只放在里面。

- 图标的唯一作用是解释时用它；点了要执行操作的，应该用 Button。
- 图标固定 14px、灰色——比文字档高一档，因为细线圆圈在同样高度下看起来比文字小。不要在调用处改尺寸或颜色。
- 提示文字同时是无障碍名称，写成完整的一句话。
- 旁边有更高的控件时，把 align 设为背向它们的一侧（控件在右边就用 align="end"），避免提示压在控件上。`,
}
