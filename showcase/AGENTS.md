# 组件展示站（showcase/）开发规范

本文件仅约束 `packages/ui/showcase/` 内部的页面、spec 与外壳代码；上层 `../AGENTS.md` 的全部基础契约（纯 Token、单层交互、文字关联属性用 `rem`、五级 z 梯）在此同样生效。仅修改组件库 `src/` 或宿主业务应用时无需阅读本文件。

**展示站是全团队照抄代码的最高样板面**。任何出现在 `showcase/` 中的写法都会被当成官方标准复制，因此每个页面上的每一个类名都必须归属于某个原语组件（Owner）或已登记的样式档位；重复出现的结构必须提炼为原语、prop 或共享常量（如 `lib/frame.ts`）；确属页面局部一次性的演示容器必须附注释说明为何不进共享层。

`pnpm dev` 启动这套基于 spec 驱动的展示站（包含 `Foundations` 基础页、`Patterns` 跨组件规范页、`Components` 单组件交互页与 `Examples` 整页样板，支持深浅色 × 5 套配色实时切换，已彻底取代 Storybook）。

## 新增或修改单组件页（Components）

- **每个组件对应一个 spec 文件**：位于 `showcase/specs/<name>.ts`，并在 `showcase/specs/index.ts` 中注册（注册顺序即侧栏顺序）。每个 spec 声明 `controls`、可选 `examples`、`render(state)` 与可选 `usage`。
- **控件可选项直接复用组件导出的常量数组**：如 `buttonVariantKeys`、`toggleVariantKeys`，绝不在 spec 中手抄一份数组；若组件尚未导出对应 `*Keys` 数组，在组件 `cva` 定义旁补齐导出后再引用。
- **页面不展示代码片段折叠块**：早期逐节生成 `code()` 代码框的机制因视觉噪音大且与真实渲染重复已被移除，不要重新引入。

## 组件页的文档脊柱结构（Doc Spine）

组件页外框统一使用 `<PageShell>`（与宿主设置页像素级同构），内部单列纵向排布：**Playground（交互试验台）→ 各个 Example 章节 → All variants（全变体矩阵，仅在声明 `matrix` 时渲染）→ Usage（用法说明，仅在声明 `usage` 时渲染）**。

- **章节标题层级严禁混用**：
  - **Playground** 属于功能区，使用设置分组标签层级（`SectionGroup tone="muted"`，13px 静音灰字）；
  - **文档章节**（Example、All variants、Usage）使用 `SectionGroup` 的 `heading` 模式（内部复用与 `PageShell` 同源的 `PageHeader`）。
- **Playground 的控制面板必须由 `SettingsSection` + `SettingsRow` 组合**（右侧控件使用默认尺寸），严禁手搓网格或缩小成 `sm` 控件。
- **水平对齐与内缩规则**：下方有带框面板的章节（Playground 控制卡、包在 `STAGE_FRAME_CLASS` 里的示例）标题带 `px-2` 内缩；下方为无边框纯文本或表格的章节（如 Usage）设置 `bare`，使标题、提示与正文左边缘齐平。正文说明字号使用 `text-control`（14px），不用 12px 的 `text-body`。
- **双滚动容器均固定声明 `scrollbar-gutter: stable`**：保证短页面与长页面的居中列位置完全一致，切换时不发生横向跳动。
- **静态页（Overview、Foundations）同样遵守原语规范**：外框用 `PageShell`（阅读列用 `width="md"`，展板页用 `'lg'`/`'xl'`），章节用 `SectionGroup heading`，细线 Token 表统一使用 `SpecimenTable` / `SpecimenRow`（`showcase/components/`）。Foundations 的色板数据通过运行时读取真实计算样式获得，其余静态表维护在 `showcase/lib/foundations-data.ts` 中。

## 跨组件规范页（Patterns）与整页样板（Examples）

- **`Patterns`（`pages/patterns/`）與 `skills/ui-patterns/` 一一对应**：用于展示跨组件场景规则（如对话框表单 `DialogForms`、保存模型、空状态、渐进披露）的真实正反样本与定稿默认值。
- **`Examples`（`pages/examples/`）本身就是完整页面**：
  1. **不套文档外框**：页面自己的 `<PageShell>` 直接填满内容区，外面绝不包裹 `STAGE_FRAME_CLASS` 或 `CanvasStage`；
  2. **100% 纯原语组合**：只准由 `PageShell`、`SettingsSection`、`SettingsRow`、`FieldStack`、`DialogPanel` 等原语拼装，任何手写布局类都代表原语缺口，应回库补齐原语；
  3. **不锁死宽度、不预塞假数据**：控件保持组件库默认宽度（如 `Select` 默认 `w-fit`、`Input` 默认 `w-full`），暴露真实默认表现；
  4. **中英双语文案走 `tt()`**：文案采用通用产品表述，不写业务专有名词。

在 `showcase/registry.ts` 的 `navGroups` 中对应注册到 `patterns` 或 `examples` 分组。

## 浮层组件铁律（曾三次导致整页死锁，严禁违背）

1. **所有浮层组件必须以非受控（Uncontrolled）方式渲染（`interactive: true`，严禁绑定受控 `open` 控制项）**：
   - `Select`、`Dialog`、`DropdownMenu`、`Tooltip`、`Popover` 由各自的 Reka 触发器自行管理开关。在 spec 的 `render(state)` 中每次调用都会生成全新临时状态对象，一旦传入受控 `open`，`onUpdate:open` 写入的临时对象立即被丢弃，浮层永远无法关闭，其底层的 `DismissableLayer` 会把整页 `pointer-events` 彻底锁死。
   - 唯一默认展开的例外是 `Tooltip`，通过 Reka 的非受控 `defaultOpen` 实现（无背景遮罩不会锁页面），但在 `state.__preview`（Overview 缩略图）下必须关闭。
2. **深浅色左右同屏对比仅限非浮层组件（`:can-split="!isOverlay"`）**：
   - Reka 的 `DismissableLayer` 是文档级单例，无法同时打开左右两个浮层；浮层组件的深色效果通过切换整个页面主题查看。非浮层组件的深色分栏子树必须显式携带 `text-foreground` 与 `color-scheme: dark`。
3. **`matrix` 全变体矩阵仅限非浮层组件**：`interactive: true` 的浮层组件不声明 `matrix`。

## 展示站外壳自举（Dogfooding）

展示站自身的侧栏、控制栏、主题切换器全部使用 `@felinic/ui` 组件搭建，遵守父级契约（纯 Token、文字关联尺寸用 `rem`、五级 z 梯、选中行用 `[data-ui-selected]`），并同样接受 `scripts/check-ui-contract.mjs` 的扫描检查。
