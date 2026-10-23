import type { ComponentSpec } from '../lib/spec'
import { h } from 'vue'
import { Textarea, textareaEngageKeys, textareaSurfaceKeys } from '#/components/textarea'

const SIZES = ['default', 'sm', 'lg'] as const

export const textareaSpec: ComponentSpec = {
  id: 'textarea',
  name: 'Textarea',
  description:
    'Multi-line text field sharing the Input field-edge contract: one inset hairline, swapped in place on focus.',
  descriptionZh:
    '多行文本输入，与 Input 共享 field-edge 契约：一条内嵌发丝线，聚焦时原位换色。',
  controls: [
    { kind: 'enum', key: 'size', label: 'Size', options: SIZES, default: 'default' },
    {
      kind: 'enum',
      key: 'engage',
      label: 'Engage on',
      options: textareaEngageKeys,
      default: 'focus',
      display: 'segmented',
    },
    {
      kind: 'enum',
      key: 'surface',
      label: 'Surface',
      options: textareaSurfaceKeys,
      default: 'plain',
      display: 'segmented',
    },
    { kind: 'string', key: 'placeholder', label: 'Placeholder', default: 'Tell the bot what to do…' },
    { kind: 'number', key: 'rows', label: 'Rows', default: 3, min: 2, max: 10 },
    { kind: 'boolean', key: 'disabled', label: 'Disabled', default: false },
  ],
  render: (state) => {
    const field = h(Textarea, {
      size: state.size as never,
      engage: state.engage as never,
      surface: state.surface as never,
      placeholder: String(state.placeholder),
      rows: Number(state.rows),
      disabled: Boolean(state.disabled),
      class: 'w-80',
    })
    // surface only picks the edge; the tint is the caller's, so paint one here
    // to judge that edge against.
    return state.surface === 'brand-tint'
      ? h('div', { class: 'rounded-lg bg-brand-soft p-3' }, [field])
      : field
  },
  usage: `Like every field, a Textarea engages on FOCUS only.

- engage="hover" is the single exception: it also engages under the pointer, with the same edge as focus. Use it only for an in-place editor that looks exactly like the content it replaced (a chat prompt edited inside its own bubble), where the edge is the only sign of a field.
- Forms, dialogs and composers keep the default "focus".
- surface="brand-tint" declares that the field is painted on a brand-tinted fill. The solid edge then comes from --field-edge-brand-tint: near-black in light, the brand in dark. The fill stays the caller's.`,
  usageZh: `和所有输入框一样，Textarea 只在聚焦时激活。

- engage="hover" 是唯一的例外：鼠标悬停时也激活，边框与聚焦时相同。只用于和被替换内容长得一模一样的原位编辑框（例如在聊天气泡里直接编辑提问），这时边框是它唯一的输入框信号。
- 表单、对话框和输入框组件保持默认的 "focus"。
- surface="brand-tint" 表示输入框画在品牌色底上。此时激活边框取 --field-edge-brand-tint：浅色下是近黑，深色下是品牌色。底色仍由调用方负责。`,
}
