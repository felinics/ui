---
name: ui-patterns
description: 在设计、编写、重构或审查任何包含表单、弹窗表单、自动/手动保存、Toast 提示、加载骨架与空状态、统计数值块、首屏 99/1 渐进披露、ActionCard 二级弹窗、列表与详情切换、页面外壳与分割线、窄屏缩放与滚动容器、实时状态自刷新或危险删除确认的前端界面时必读。本 skill 是 @felinic/ui 的跨组件交互与场景规范库（UI Patterns），按主题拆分为 6 篇独立参考文件，按需读取对应篇章。
---

# UI Patterns — 跨组件交互与场景规范

## 定位与职责边界

前端基建分为四个正交维度，各管一层，不重复说明：

| 维度 | 所在位置 | 解决的问题 |
|---|---|---|
| **工程总纲与宿主架构** | 主仓 `.agents/skills/memoh-frontend-rules/` | 22 条工程与体验承诺（U1–U10 / M1–M8 / D1–D4）、`apps/web` 路由/Store/流式架构与重构流程 |
| **Foundations（基础 Token）** | `packages/ui/AGENTS.md` | 颜色、交互叠色梯、圆角、三类边框、阴影、z 梯、字号与图标阶梯、rem 缩放定律 |
| **Components（组件与原语）** | `packages/ui/skills/ui-owners/SKILL.md` | 单个原子组件与布局原语字典：有哪些组件、各自管什么间距、怎么选型 |
| **UI Patterns（本库）** | `packages/ui/skills/ui-patterns/` | **多个组件组合完成一个用户场景时的交互、布局与文案规则**（对应 `showcase` 侧栏的 `Patterns` 板块） |

当遇到“对话框该用多宽、必填项标不标星号、什么时候用自动保存什么时候放保存按钮、空状态该画实线还是无框、高级设置该原地展开还是弹新窗口”这类跨组件问题时，查本库对应的 Pattern 文件。

## 场景路由索引（按任务按需读取）

不要一次性读取全部参考文件；根据当前任务涉及的界面场景，只读取对应的那几篇：

| Pattern 文件 | 覆盖的场景与规则 | 何时读取 |
|---|---|---|
| [`references/forms.md`](references/forms.md) | **表单与弹窗表单**：新建任务标准表单解剖、弹窗表单统一 `md`（448px / `MEMOH-126`）、13px 标签与 6px 间距、必填与选填标记策略、提交时校验（失焦不闪红）、多步流与视图切换的焦点自动落位、按钮尺寸阶梯与 `Select` 触发器禁套 `Button` | 编写或修改任何页面表单、弹窗表单、登录/引导多步输入流或选择控件 |
| [`references/saving-and-notifications.md`](references/saving-and-notifications.md) | **保存模型、通知反馈与界面文案**：静默自动保存 vs 标题栏/卡片底栏手动保存（防放错位置产生多余分割线）、禁止常驻“已保存”游离碎片、4s 默认 Toast vs 带 Action 长驻 Toast、Label ≠ Placeholder 三语防重、嵌套层级不复读、写用户结果不写底层术语、报错三要素公式 | 涉及设置保存、表单提交反馈、Toast 提示、错误横幅或新增/修改任何 `en`/`zh`/`ja` 界面文案 |
| [`references/loading-and-empty-states.md`](references/loading-and-empty-states.md) | **加载、空状态与统计数值块**：四级加载阶梯、加载骨架与真实内容同形防跳动、`isPending` vs `isLoading`、200ms 延迟防闪、未采样值显 `—` 不伪造 `0`、卡片内无框空状态 vs 独立列表实线空状态（禁虚线空状态）、常驻区块留框 vs 条件区块隐藏、统计磁贴排布（禁纵向细线与卡内塞网格） | 编写任何异步数据加载、列表/表格空状态、概览统计数字块或占位符 |
| [`references/progressive-disclosure.md`](references/progressive-disclosure.md) | **渐进披露与多视图弹窗**：首屏 99/1 法则（首屏只答运行是否正常，1% 深层操作收进具名入口）、`ActionCard` → 单一任务弹窗骨架、弹窗头部两种形态（居左工作台 vs `DialogViewHeader` 列表管理动态居中）、弹窗内列表↔表单切换与 `AutoHeight`、页内折叠（More options / Advanced）的两种固定皮肤与“按关注点而非字段数划分”边界 | 设计设置页首屏层级、添加“高级设置/更多选项”、编写带二级入口的页面或包含列表↔表单切换的弹窗 |
| [`references/layout-and-navigation.md`](references/layout-and-navigation.md) | **页面外壳、分割线、导航与缩放**：`PageShell` 对齐契约与间距阶梯表、单层卡片原则（禁卡套卡与双描边图标块）、卡片内缩细线 vs 容器满宽分割线（禁 wrapper `div` 带底边叠双线）、列表↔详情推拉切换与进出步数对称、窄屏重排与 `@container` 容器查询、随文图标 `em` 缩放与单行 `truncate`、滚动归属与 `[scrollbar-gutter:stable]` 防抖、深色模式零裸色自检 | 搭建新页面或 Tab 外壳、放置分割线、实现列表进详情导航、处理窄屏/字号放大/滚动条抖动或检查深色模式 |
| [`references/degraded-and-destructive.md`](references/degraded-and-destructive.md) | **实时状态、异常降级、危险操作与全局诊断表**：可见性守卫静默自刷新（不甩手动刷新按钮）、相对时间更新提示、同一状态单处渲染、媒体表面不透明遮罩、穷举全部中间态并以真实首帧（`@playing`）门控、数据库缓存与运行时 404 对账、危险与生命周期操作沉底确认、无限列表虚拟化、AI 默认审美陷阱与脏→净全局诊断表 | 编写实时监控/远程桌面/容器状态页、处理网络异常或资源丢失、放置停止/重置/删除等高风险操作，或在重构前做页面全面诊断 |
