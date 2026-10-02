import type { ComponentSpec, SpecState } from '../lib/spec'
import { h } from 'vue'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle, alertVariantKeys } from '#/components/alert'

// One copy table per variant so the canvas, the examples, and the matrix all
// read the same strings — the single-source rule for specs.
const COPY = {
  default: {
    icon: Info,
    title: 'Connectivity check queued',
    description: 'The upstream probe runs on the next scheduler tick.',
  },
  success: {
    icon: CircleCheck,
    title: 'Upstream reachable',
    description: 'All three endpoints answered within the timeout.',
  },
  warning: {
    icon: TriangleAlert,
    title: 'Upstream degraded',
    description: 'One endpoint answered slowly. Requests still succeed.',
  },
  destructive: {
    icon: CircleAlert,
    title: 'Upstream unreachable',
    description: 'The probe timed out. Check the base URL and the credential.',
  },
} as const

function renderAlert(state: SpecState) {
  const copy = COPY[state.variant as keyof typeof COPY]
  return h(Alert, { variant: state.variant as never, class: 'w-96' }, () => [
    // The icon must be a DIRECT svg child: the base cva switches its grid
    // columns on has-[>svg], so an icon inside a wrapper silently loses the
    // leading column.
    state.withIcon ? h(copy.icon) : null,
    h(AlertTitle, null, () => copy.title),
    state.withDescription ? h(AlertDescription, null, () => copy.description) : null,
  ])
}

export const alertSpec: ComponentSpec = {
  id: 'alert',
  name: 'Alert',
  description:
    'A framed message that states the outcome of something the page just did. The frame is neutral in every variant — the semantic reads through the title and icon color.',
  descriptionZh:
    '陈述页面刚刚做完某件事之结果的带框消息。四档变体共用同一套中性外框——语义靠标题与图标的颜色表达。',
  controls: [
    { kind: 'enum', key: 'variant', label: 'Variant', options: alertVariantKeys, default: 'default', display: 'segmented' },
    { kind: 'boolean', key: 'withIcon', label: 'Leading icon', default: true },
    { kind: 'boolean', key: 'withDescription', label: 'Description', default: true },
  ],
  matrix: { rows: 'variant', cols: 'withIcon' },
  examples: [
    {
      name: 'Check passed',
      nameZh: '检测通过',
      note: 'success and destructive must be distinguishable WITHOUT reading the copy — that is the whole job of the variant.',
      noteZh: 'success 与 destructive 必须在不读文案的前提下就能分辨——这正是变体存在的意义。',
      state: { variant: 'success' },
    },
    {
      name: 'Check failed',
      nameZh: '检测失败',
      state: { variant: 'destructive' },
    },
    {
      name: 'Title only',
      nameZh: '仅标题',
      note: 'A one-line result needs no second sentence; an empty description row is filler.',
      noteZh: '一行就说得完的结果不需要第二句;空描述行只是填充。',
      state: { variant: 'warning', withDescription: false },
    },
  ],
  render: state => renderAlert(state),
  usage: `Alert reports the RESULT of an operation in place, on the surface that ran it. It is not a toast (transient, global) and not a CalloutBanner (a tinted, interruptive lifecycle notice with its own action).

- Pick the variant by outcome, never by emphasis: success / warning / destructive must be readable at a glance, before the copy is. A result rendered as \`default\` is an unlabelled result.
- The frame stays neutral in all four — only the title and icon take the hue. The tinted-surface look belongs to CalloutBanner; do not rebuild it here by injecting bg-*/border-* classes.
- The icon is optional but must be a DIRECT child of Alert (the grid switches on has-[>svg]). One lucide component, never a typed glyph.
- Title states the outcome, description states the consequence or the next step. Drop the description when there isn't one.`,
  usageZh: `Alert 就地报告一次操作的结果,出现在执行它的那个表面上。它不是 toast(短暂、全局),也不是 CalloutBanner(带色底、打断式的生命周期通告,自带动作)。

- 按结果选变体,不要按强调程度选:success / warning / destructive 必须在读文案之前就能一眼分辨。用 \`default\` 渲染一个结果,等于没给它贴标签。
- 四档共用中性外框——只有标题和图标取色。带色底的观感属于 CalloutBanner,不要在这里用注入 bg-*/border-* 的方式重建它。
- 图标可选,但必须是 Alert 的直接子节点(网格靠 has-[>svg] 切换)。用 lucide 组件,不要用打出来的字符。
- 标题写结果,描述写后果或下一步。没有下一步就不要写描述。`,
}
