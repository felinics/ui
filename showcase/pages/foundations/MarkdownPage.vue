<script setup lang="ts">
// Markdown body specimens — the tuning surface for src/markdown.css. Renders
// the REAL pipeline (MarkdownRender + the library's shared node components +
// the same wrapper classes the host's chat message uses, inside
// data-chat-content) against fixtures covering the four body shapes bots
// actually emit, so the markdown tokens are tuned against every shape at
// once instead of one live host message at a time. When a real message
// renders badly, add its shape here BEFORE touching tokens.
//
// The four shapes:
//   1. structured-report — heading hierarchy + continuous lists (audit style)
//   2. flat-fragments    — one logical list emitted as separate 1-item <ol>s
//                          and sibling <ul>s (the most common bot shape)
//   3. cjk-prose         — pure CJK/Latin mixed paragraphs, parens + inline
//                          code + fullwidth punctuation
//   4. code-and-table    — fences, inline paths, table, hr, blockquote
// Plus one file-preview-density specimen (the host's dockview preview
// wrapper) since chat and preview share the same tokens but not the chrome.
//
// Fences render markstream's default code block here: the chat code-block
// chrome (white card + copy button) is host app chrome, not library layer —
// fence TYPOGRAPHY (font/size/leading) comes from markdown.css either way.
import { computed } from 'vue'
import MarkdownRender from 'markstream-vue'
import { PageShell, SectionGroup } from '#/components/settings'
import { registerSharedMarkdownComponents } from '#/components/markdown'
import { themeState } from '../../theme'
import { tt } from '../../lib/i18n'
import { STAGE_FRAME_CLASS } from '../../lib/frame'

registerSharedMarkdownComponents('chat-msg')
registerSharedMarkdownComponents('file-preview-md')

const isDark = computed(() => themeState.theme === 'dark')

// Exact wrapper from the host's chat message. `prose-sm` / `dark:prose-invert`
// are inert hooks (no typography plugin is installed) kept so the two wrappers
// can't drift; block rhythm is owned by markdown.css slot rules, li tightening
// + edge trims are the only utilities.
const CHAT_WRAPPER = 'prose prose-sm dark:prose-invert max-w-none [&_li]:my-0.5! [&>*:first-child]:mt-0! [&>*:last-child]:mb-0!'
// Wrapper from the host's dockview file preview.
const PREVIEW_WRAPPER = 'prose prose-sm dark:prose-invert max-w-none px-6 py-4 *:first:mt-0'

interface Fixture {
  id: string
  title: string
  titleZh: string
  note: string
  noteZh: string
  content: string
}

const fixtures: Fixture[] = [
  {
    id: 'structured-report',
    title: 'Structured report',
    titleZh: '结构化报告',
    note: 'Heading hierarchy + continuous lists: headings form groups, body→heading breathes, continuous ol/ul item gaps.',
    noteZh: '标题层级 + 连续列表（审查报告型）：标题成组、段落到标题的呼吸、连续 ol/ul 项距。',
    content: `# 消息列表渲染审查报告

先说结论：消息列表的卡顿主要来自**每 delta 全量克隆**，而不是 Markdown 解析本身。下面按优先级列出发现。

## 渲染链路

消息从 WebSocket 进入 store 之后，会经过 \`normalizeBlocks\`、\`applyDelta\` 和 \`projectTimeline\` 三步，其中前两步都会克隆整个 run：

1. **全量克隆**：每个 delta 都 structuredClone 整条消息，长消息下成本随长度平方增长。
2. **splice 搅动**：插入 block 时触发后续所有节点的响应式依赖重算。
3. **approvals 新数组**：每次重建引用，导致 god component 按 token 重渲染。

### 次要发现

- 死代码：\`legacyOverride\` 与 \`overrideV2\` 双份并存，只有后者被读取。
- 滚动层逻辑独立，本次不需要改动。

修复顺序建议按上面 1→3 执行，先验证克隆消除的收益。`,
  },
  {
    id: 'flat-fragments',
    title: 'Flat list fragments',
    titleZh: '扁平碎片列表',
    note: 'One logical list as separate 1-item ols + sibling uls (the most common bot shape): numbers and bullets must read as one group.',
    noteZh: '一个逻辑列表拆成多个 1 项 ol + 兄弟 ul（最常见 bot 输出）：序号与子弹头必须粘合成组。',
    content: `磁盘画像跑完了，整体健康，重点如下：

1. **系统盘**：使用率 78%，处于安全区间。
   - 系统占用约 42 GB
   - 用户目录约 96 GB
2. **数据盘**：使用率 91%，建议关注。
   - 镜像层占用 210 GB，可清理
   - 日志滚动正常
3. **外置盘**：未挂载，已跳过。

结论：短期无需扩容，清理数据盘镜像即可释放约 80 GB。`,
  },
  {
    id: 'cjk-prose',
    title: 'CJK/Latin prose',
    titleZh: 'CJK 混排长文',
    note: 'Pure paragraphs: per-script weights in mixed runs, fullwidth parens vs inline code alignment, paragraph gaps.',
    noteZh: '纯正文段落：中英混排字重、全角括号与行内代码对齐、段落间距。',
    content: `记忆系统的写入路径最近做了一次调整。现在每条消息进入之后，会先经过一轮轻量抽取（基于 \`extractFacts\`），把值得长期保留的事实挑出来，再决定写入向量库还是只留在关系库里。这样做的目的是减少无效 embedding，同时让检索端的噪声更低。

需要注意的是，抽取本身是有成本的。如果一条消息只是日常寒暄，比如"今天天气怎么样"，它大概率不会产生任何值得记住的事实；这种情况下系统会直接跳过写入，而不是像之前那样先把整段文本嵌进去再说。这个行为可以通过 \`memory.skipSmallTalk\` 配置关闭。

另外一个变化是检索端的融合策略。向量召回和 BM25 召回现在会分别归一化之后再做加权求和（权重比大约是 7:3），而不是之前简单的分数相加。实测下来，中文长 query 的命中率提升了约 12%，英文基本不变。`,
  },
  {
    id: 'code-and-table',
    title: 'Code & table',
    titleZh: '代码与表格',
    note: 'Fences, inline paths, table, hr, blockquote: block-level elements against the body rhythm.',
    noteZh: '代码块、行内路径、表格、分割线、引用块：块级元素与正文的间距节奏。',
    content: `问题定位在 \`apps/web/src/store/chat/runtime-layer.ts\`，修复只需要几行：

\`\`\`ts
export function applyDelta(run: Run, delta: Delta) {
  // 不再克隆整条 run，只对目标 block 做原位更新
  const block = run.blocks[delta.index]
  if (!block || block.id !== delta.blockId) return
  block.content += delta.text
}
\`\`\`

改动前后的对比如下：

| 指标 | 改动前 | 改动后 |
| --- | --- | --- |
| 每 delta 克隆次数 | 1 次全量 | 0 |
| 长消息渲染耗时 | ~180ms | ~12ms |
| 内存峰值 | 3.2× | 1.1× |

---

> 注意：原位更新依赖 block id 稳定，fork 场景下需要额外校验，详见审查报告第三节。

验证方式：跑 \`pnpm vitest runtime-layer\`，全部用例应保持绿色。`,
  },
]

const previewContent = fixtures[0]!.content
</script>

<template>
  <PageShell
    width="wall"
    :title="tt('Markdown body', '正文渲染')"
    :description="tt(
      'Every body shape through the real markstream pipeline, side by side. Tune src/markdown.css tokens (--ms-slot-*, --ms-text-*, --chat-*) here — never against a single live message.',
      '全部正文形态走真实 markstream 管线，并排对照。在这里调 src/markdown.css 的 token（--ms-slot-*、--ms-text-*、--chat-*），不要对着单条消息调。',
    )"
  >
    <div class="flex flex-col gap-8">
      <SectionGroup
        heading
        bare
        :title="tt('Chat density — body shapes', '聊天密度 · 正文形态')"
        :description="tt(
          'The exact wrapper the host chat message uses. Columns scroll horizontally; each column is one shape.',
          '宿主聊天消息的原样 wrapper。列横向排布、可横滚，每列一种形态。',
        )"
      >
        <!-- Column sub-labels are specimen labels (one pane per shape), not
             section titles — the section title above is the only SectionGroup.
             Column width mirrors the real chat column: chat-pane is
             max-w-[840px] with 2×40px gutters at lg → 760px (47.5rem) of
             content; frame px-4 adds 2rem back → 49.5rem, so wraps land
             exactly where they do in the host. -->
        <div class="flex items-start gap-5 overflow-x-auto pb-2">
          <div
            v-for="fixture in fixtures"
            :key="fixture.id"
            class="w-[49.5rem] shrink-0"
          >
            <div class="mb-2">
              <div class="text-control font-medium text-foreground">
                {{ tt(fixture.title, fixture.titleZh) }}
              </div>
              <div class="mt-0.5 text-body text-muted-foreground">
                {{ tt(fixture.note, fixture.noteZh) }}
              </div>
            </div>
            <div :class="[STAGE_FRAME_CLASS, 'bg-background px-4 py-3']">
              <div data-chat-content>
                <div
                  lang="zh"
                  :class="CHAT_WRAPPER"
                >
                  <MarkdownRender
                    :content="fixture.content"
                    :is-dark="isDark"
                    mode="chat"
                    :smooth-streaming="false"
                    :typewriter="false"
                    :fade="false"
                    :batch-rendering="false"
                    :show-tooltips="false"
                    :mermaid-props="{ showTooltips: false }"
                    custom-id="chat-msg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup
        heading
        bare
        :title="tt('File preview density', '文件预览密度')"
        :description="tt(
          'The dockview preview panel wrapper (px-6 py-4) — same tokens, different chrome.',
          'dockview 预览面板的 wrapper（px-6 py-4）——同一套 token，不同容器。',
        )"
      >
        <div :class="[STAGE_FRAME_CLASS, 'bg-background']">
          <div :class="PREVIEW_WRAPPER">
            <MarkdownRender
              :content="previewContent"
              :is-dark="isDark"
              :typewriter="false"
              :fade="false"
              :show-tooltips="false"
              :mermaid-props="{ showTooltips: false }"
              custom-id="file-preview-md"
            />
          </div>
        </div>
      </SectionGroup>
    </div>
  </PageShell>
</template>
