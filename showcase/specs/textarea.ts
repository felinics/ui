import type { ComponentSpec } from '../lib/spec'
import { h } from 'vue'
import { Textarea, textareaSizeKeys, textareaVariantKeys } from '#/components/textarea'

const JSON_SAMPLE = `{
  "model": "gpt-4o-mini",
  "temperature": 0.2,
  "tools": ["search", "sql"]
}`

export const textareaSpec: ComponentSpec = {
  id: 'textarea',
  name: 'Textarea',
  description:
    'Multi-line text field sharing the Input field-edge contract: one inset hairline, swapped in place on focus.',
  descriptionZh:
    '多行文本输入，与 Input 共享 field-edge 契约：一条内嵌发丝线，聚焦时原位换色。',
  controls: [
    { kind: 'enum', key: 'size', label: 'Size', options: textareaSizeKeys, default: 'default' },
    { kind: 'enum', key: 'variant', label: 'Variant', options: textareaVariantKeys, default: 'default', display: 'segmented' },
    { kind: 'string', key: 'placeholder', label: 'Placeholder', default: 'Tell the bot what to do…' },
    { kind: 'number', key: 'rows', label: 'Rows', default: 3, min: 2, max: 10 },
    { kind: 'boolean', key: 'disabled', label: 'Disabled', default: false },
  ],
  examples: [
    {
      name: 'Code',
      nameZh: '代码',
      note: 'A field holding machine text — JSON, a config blob, a prompt template — says so with variant="code". Never class="font-mono".',
      noteZh: '装机器文本的字段——JSON、配置块、提示词模板——用 variant="code" 声明,而不是 class="font-mono"。',
      state: { variant: 'code', rows: 5 },
      render: state =>
        h(Textarea, {
          size: state.size as never,
          variant: 'code',
          modelValue: JSON_SAMPLE,
          rows: Number(state.rows),
          class: 'w-80',
        }),
    },
  ],
  render: state =>
    h(Textarea, {
      size: state.size as never,
      variant: state.variant as never,
      placeholder: String(state.placeholder),
      rows: Number(state.rows),
      disabled: Boolean(state.disabled),
      class: 'w-80',
    }),
  usage: `Textarea is the multi-line Input — same field-edge contract, same size ladder.

- variant is a CONTENT ROLE, not a skin: code marks a field that holds machine text (JSON, YAML, a config blob, a prompt template) and owns the monospace family plus its tracking reset. Injecting class="font-mono" is the className red line.
- variant and size are orthogonal: a code field is still sm / default / lg.
- The field engages on FOCUS only — no hover darkening, no outer ring, no border growth.`,
  usageZh: `Textarea 就是多行版的 Input——同一套 field-edge 契约,同一条尺寸阶梯。

- variant 是内容角色,不是皮肤:code 标记这个字段装的是机器文本(JSON、YAML、配置块、提示词模板),等宽字体族和随之而来的字距重置都归它管。注入 class="font-mono" 是 className 红线。
- variant 与 size 正交:code 字段照样有 sm / default / lg。
- 字段只在聚焦时反应——不做 hover 变深,不加外环,不在聚焦时加粗边框。`,
}
