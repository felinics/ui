import type { ComponentSpec, SpecState } from '../lib/spec'
import { h } from 'vue'
import { Skeleton } from '#/components/skeleton'

// Skeleton has no variant axes and no exported key arrays — its only prop is
// `class`, because shaping is the caller's job (mirror the layout being
// loaded). The knobs here parameterize the two things a caller actually
// picks: which SHAPE the placeholder mirrors (text line / avatar circle /
// media block) and how BIG it is. The class map lives here, next to the
// render, so the canvas and the snippet can never drift (single-source rule).
const SHAPE_SIZE_CLASS: Record<string, Record<string, string>> = {
  line: {
    sm: 'h-2 w-24',
    default: 'h-3 w-40',
    lg: 'h-4 w-64',
  },
  circle: {
    sm: 'size-6 rounded-full',
    default: 'size-8 rounded-full',
    lg: 'size-12 rounded-full',
  },
  block: {
    sm: 'h-16 w-32',
    default: 'h-24 w-48',
    lg: 'h-32 w-64',
  },
}

// Index access goes through ?. + a literal fallback: the Record types admit
// undefined under noUncheckedIndexedAccess, and the fallback keeps a stray
// control state from rendering an empty 0×0 block.
function shapeSizeClass(state: SpecState): string {
  return SHAPE_SIZE_CLASS[String(state.shape)]?.[String(state.size)] ?? 'h-3 w-40'
}

export const skeletonSpec: ComponentSpec = {
  id: 'skeleton',
  name: 'Skeleton',
  description:
    'A placeholder block for content whose layout is already known: zero-chroma translucent fill that inherits any underlying surface, crossed by one shimmer synchronized across every block of a cluster. Shape it with class — line for text, circle for avatar, block for media.',
  descriptionZh:
    '已知布局内容的加载占位块：纯中性半透明底色自动融入任意表面（含非黑白灰底色与配色主题），同一簇内所有块共享一道同步微光。用 class 塑形——文本用行、头像用圆、媒体用块。',
  controls: [
    { kind: 'enum', key: 'shape', label: 'Shape', options: ['line', 'circle', 'block'], default: 'line', display: 'segmented' },
    { kind: 'enum', key: 'size', label: 'Size', options: ['sm', 'default', 'lg'], default: 'default', display: 'segmented' },
  ],
  // shape × size is a grid a reviewer actually scans: does each shape read as
  // its content at every size, and does the circle stay square.
  matrix: { rows: 'shape', cols: 'size' },
  examples: [
    {
      name: 'Text lines',
      nameZh: '文本行',
      render: () =>
        h('div', { class: 'space-y-2' }, [
          h(Skeleton, { class: 'h-3 w-64' }),
          h(Skeleton, { class: 'h-3 w-64' }),
          // The last line of a paragraph runs short — a full-width third line
          // would lie about the layout it is standing in for.
          h(Skeleton, { class: 'h-3 w-48' }),
        ]),
    },
    {
      name: 'Card: avatar + two lines',
      nameZh: '卡片：头像+两行',
      render: () =>
        h('div', { class: 'flex items-center gap-3' }, [
          h(Skeleton, { class: 'size-10 rounded-full' }),
          h('div', { class: 'space-y-2' }, [
            h(Skeleton, { class: 'h-3 w-32' }),
            h(Skeleton, { class: 'h-3 w-24' }),
          ]),
        ]),
    },
    {
      name: 'List rows',
      nameZh: '列表',
      render: () =>
        h('div', { class: 'w-64 space-y-4' }, [
          h('div', { class: 'flex items-center gap-3' }, [
            h(Skeleton, { class: 'size-8 rounded-full' }),
            h(Skeleton, { class: 'h-3 flex-1' }),
          ]),
          h('div', { class: 'flex items-center gap-3' }, [
            h(Skeleton, { class: 'size-8 rounded-full' }),
            h(Skeleton, { class: 'h-3 flex-1' }),
          ]),
          h('div', { class: 'flex items-center gap-3' }, [
            h(Skeleton, { class: 'size-8 rounded-full' }),
            h(Skeleton, { class: 'h-3 flex-1' }),
          ]),
        ]),
    },
    {
      name: 'On tinted surfaces',
      nameZh: '有色底面',
      render: () =>
        // One-off demo strips exercising translucent compositing across non-gray semantic surfaces.
        h('div', { class: 'grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3' }, [
          h('div', { class: 'rounded-xl bg-brand-soft p-3 space-y-2' }, [
            h(Skeleton, { class: 'h-3 w-16' }),
            h(Skeleton, { class: 'h-5 w-24' }),
            h(Skeleton, { class: 'h-3 w-20' }),
          ]),
          h('div', { class: 'rounded-xl bg-info-soft p-3 space-y-2' }, [
            h(Skeleton, { class: 'h-3 w-16' }),
            h(Skeleton, { class: 'h-5 w-24' }),
            h(Skeleton, { class: 'h-3 w-20' }),
          ]),
          h('div', { class: 'rounded-xl bg-warning-soft p-3 space-y-2' }, [
            h(Skeleton, { class: 'h-3 w-16' }),
            h(Skeleton, { class: 'h-5 w-24' }),
            h(Skeleton, { class: 'h-3 w-20' }),
          ]),
        ]),
    },
  ],
  render: state => h(Skeleton, { class: shapeSizeClass(state) }),
  // class is always shown — it IS the component's API; there is no default to
  // omit (unlike variant attrs, a bare <Skeleton /> is an empty 0×0 block).
  usage: `Skeleton is the placeholder for content whose layout you ALREADY know. It mirrors the shape of what is coming so nothing jumps when data arrives.

- Shape the block to the real content: text lines at their real line height, avatar as rounded-full, media as a block. The last line of a paragraph runs short — a full-width final line lies about the layout.
- Compose clusters with plain flex/space-y wrappers; every block in a cluster shares ONE synchronized shimmer (the viewport-anchored sheet on [data-slot="skeleton"] in style.css) — never give a single block its own animation.
- Both the resting fill (bg-skeleton) and the drifting shimmer are zero-chroma translucent overlays, so Skeleton blends naturally over tinted surfaces and non-default color schemes without passing custom colors.
- Not for unknown durations or no-layout-yet waits: a bare glyph is Spinner, work a button triggered is Button :loading. Skeleton answers "what will appear here"; a spinner answers "something is working".
- Reduced motion freezes every block to flat bg-skeleton automatically — nothing to wire per call site.`,
  usageZh: `Skeleton 是已知布局内容的加载占位。它镜像即将到来的内容的形状，让数据到达时布局不跳动。

- 块的形状要对齐真实内容：文本行用真实行高、头像用 rounded-full、媒体用整块。段落末行要短一截——末行拉满是在谎报布局。
- 用普通的 flex/space-y 容器组合成簇；同一簇里所有块共享一道同步微光(style.css 中 [data-slot="skeleton"] 的视口锚定渐变)——绝不给单个块配独立动画。
- 静止底色（bg-skeleton）与流动微光均为零色度半透明叠层，放在有色底面或任意配色主题上会自动融入表面，无需按场景手写底色。
- 时长未知或布局未定的等待不用它：裸字形用 Spinner，按钮触发的等待用 Button :loading。Skeleton 回答"这里将出现什么",spinner 回答"正在处理"。
- 减弱动态效果时所有块自动冻结为静止的 bg-skeleton——调用点无需任何处理。`,
}
