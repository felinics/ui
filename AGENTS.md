# @felinic/ui — 设计语言与基础 Token 契约

本文件是 `@felinic/ui` 组件库跨组件视觉与交互底线的唯一出处，用来防止两类反复出现的问题：自行添加边框或阴影装饰，以及绕过 Token 直接手写颜色、像素和透明度。开发或重构 `packages/ui` 中的组件时以本文件为准；新增全局视觉决定时同步写回本文件。

## 关联指南分工

组件库同时维护供宿主前端（如 `apps/web`）查阅的组合与交互规范。编写或修改宿主页面时，按职责查阅：

1. `packages/ui/AGENTS.md`（本文件）：全局 Token、颜色、交互、边框、阴影、z 轴与样式层叠规则（Foundations）。
2. `packages/ui/skills/ui-owners/SKILL.md`：原子组件与布局原语字典（需要卡片、行、字段、弹窗外壳时选哪个组件）。
3. `packages/ui/skills/ui-patterns/SKILL.md`：跨组件的场景与交互规范（表单、保存与 Toast、加载与空状态、渐进披露、导航与布局、实时降级与危险操作）。
4. `packages/ui/showcase/AGENTS.md`：组件展示站（`showcase/`）的本地开发约定；仅在修改展示站页面或 spec 时阅读。

宿主仓库只需在入口文档指向上述路径，无需复制或软链到 `.agents/skills`。

## 三层保障机制

| 层级 | 位置 | 作用 |
|---|---|---|
| **Token 定义** | `src/style.css`（`@theme inline` / `:root` / `.dark`） | 原始颜色、圆角、阴影、层级的唯一存放位置 |
| **文字契约** | `packages/ui/AGENTS.md` | 视觉与物理规则及原因说明 |
| **机械守卫** | `scripts/check-ui-contract.mjs`（接入 `mise run lint`） | 自动拦截裸颜色、任意圆角、手写阴影、文字关联 px、裸 z-index 与语义色手写透明度 |

## 核心原则：只组合，不手写样式（局部性）

样式在系统中只有唯一归属，上层调用方只通过组件 API 表达意图（如 `variant="destructive"`），绝不在调用处手写视觉样式（如 `bg-red-500 hover:bg-red-600`）。在业务页面上注入样式类属于逃生口；一旦需要覆盖组件外观，说明组件缺少对应的 `variant`、插槽、Token 或共享原语，应在组件层补齐契约，禁止在调用处硬盖。

| 关注点 | 唯一归属位置 | 禁止触碰的层级 |
|---|---|---|
| 原始数值（颜色 / 阴影 / 圆角 / 尺寸） | `src/style.css` 的 `:root` / `.dark` / `@theme` | 任何 `.vue` 文件与宿主业务页面 |
| 交互外观（hover / press / focus / open） | `src/style.css` 的 `@layer components`（挂载于 `data-*` 属性） | 任何 `.vue` 文件与宿主业务页面 |
| 静止布局与底色（高度 / 内边距 / 圆角 / 静止文字色） | 组件 `.vue` 文件与 `cva` 定义 | 宿主业务页面不得重写 |
| 设置列表的行节奏（行高 / 上下内边距 / 行间细线） | `src/style.css` 的 `@layer components`（挂载于 `data-settings-list` 下的 `data-settings-row`） | 行组件与宿主业务页面 |
| 页面排布与组合 | 宿主页面与共享布局原语 | — |
| 业务逻辑与状态编排 | 宿主页面与业务层 | 组件库内不植入业务假设 |

设置列表的行节奏是上表“静止布局”的唯一例外：一行长什么样取决于它放在哪种列表里，行组件自己无法知道，所以规则按“列表 → 行”的后代关系写在 `style.css`。横向内缩同理由外壳决定：`SettingsSection` 卡片以 `--settings-inset`（16px）统一留白，行和卡片内的块都不再写 `mx-4` / `px-4`；弹窗等本身已有内边距的表面用 `SettingsList` 只提供行节奏。确需贴到卡片边缘的内容（整行点击目标、表格、图表画布、满宽分隔带）包进 `SettingsBleed`。

新建组件的验收标准：从未读过组件源码的调用方只需填入内容，不需要传任何布局或外观 CSS。可调参数一律设计为枚举型 prop（如 `width="md" | "lg" | "2xl"`），不用自由拼接的 class 字符串，迫使新档位在组件库内集中增补。遇到现有组件必须靠复制一串 class 才能正常工作时，直接向维护者报告并收敛进原语。

## CSS 层叠的四个覆盖平面

修改样式前必须理解以下四个同时生效的覆盖机制，避免写出无效样式或静默吃掉组件既有交互：

```
5  宿主业务页面（apps/web）        只组合组件，仅传入枚举 variant/size 与布局宽度（如 w-full）
4  组件 .vue + cva（index.ts）    只管几何尺寸与静止态颜色（高度 / 内边距 / 圆角 / 静止文字）
3  style.css @layer components    所有交互态外观（hover / press / focus / open），按 data-* 选择器挂载
2  reka-ui 底层原语               注入 data-state / aria-expanded；菜单打开时将页面设为 pointer-events: none
1  Tailwind v4 + Token            @theme / :root / .dark 变量与 @layer utilities 工具类
```

1. **层顺序（`@layer utilities` 永远高于 `@layer components`）**：传给组件 `class` 的任何 Tailwind 工具类（如 `bg-*`、`hover:bg-*`、`transition-colors`）都会覆盖 `style.css` 中的组件交互规则。
2. **`cn()`（`clsx` + `tailwind-merge`）会静默丢弃冲突类**：`tailwind-merge` 判定两个工具类冲突时只保留后者（如自定义字号与文字色类名前缀碰撞，见 `lib/utils.ts` 补丁）。任意选择器中切勿使用转义引号（如 `[class*=\'size-\']` 不会被 Tailwind JIT 提取，应写成无引号的 `[&_svg:not([class*=size-])]`）。
3. **Reka UI 打开浮层时会锁死页面指针事件**：菜单展开期间页面被设为 `pointer-events: none`，触发器上的 `:hover` 不会触发，组件必须显式通过 `pointer-events: auto`（如 `SelectTrigger`）或 `[data-state=open]`（如幽灵按钮保持高亮）统一处理打开态。全系统的浮层触发器必须保持一致的打开态表现。
4. **`@layer components` 内部的特异性与源码顺序**：同特异性下后声明的规则生效（如 `ButtonGroup` 覆盖独立 `Button`）。

业务页面绝不向 `<Button>`、`<Select>`、`<TextButton>` 注入 `bg-*`、`hover:bg-*`、`border-border` 或 `shadow-none!`，否则会与组件 `::before` 伪元素交互层及边框契约正面冲突。

## 三条铁律与“干净”标准

1. **一切皆 Token**：组件 `.vue` 和 `style.css` 的 `@layer components` 中均不得出现 `#hex`、`rgb()`、`oklch()`、`color-mix()` 或 `[Npx]` 任意圆角。缺少合适取值时先在 Token 区新增变量再引用。
2. **绝不自造装饰层（Chrome）**：控件靠填充色与单根边线区分状态，不得为“好看一点”擅自添加 `box-shadow` 或外层 `border`。
3. **只参照已重构的标杆组件**：严禁照抄未重构的历史遗留组件样式。

**干净与脏的唯一判据**：控件静止时背景透明、继承所在容器表面，仅由单根 1px 细边勾勒轮廓；发生交互时，只有**同一层**原位变色（细边换色，或单层半透明遮罩加深），绝不在同一控件上叠涂底色、结构粗边框、彩色外环、阴影和手写透明度。

统一设计语言允许组件保留符合自身职责的特征（如 `SegmentedControl` 带微弱阴影的滑动块），前提是所有特征都通过 Token 表达。

## 组件参考状态（标杆与遗留边界）

动笔参考现有组件源码前先核对下表，未列入“已重构标杆”的组件一律先确认再参考：

- **已重构标杆（可放心参照）**：`Button`、`TextButton`、`InfoHint`、`Input`、`Textarea`、`Select` / `SelectTrigger`、`NativeSelect`、`Checkbox`、`Switch`、`NumberField`、`InputGroup`、`Field`、`SegmentedControl`、`Tabs`、`Toggle`、`ActionCard`、`CalloutBanner`、`SurfaceCard`、`DialogPanel` / `DialogBody` / `DialogViewHeader`、`AutoHeight`、`PageShell` / `SettingsSection` / `SettingsRow` / `FieldStack`。
- **重构推进中（勿抄过渡态代码）**：`Slider`、`RadioGroup`、`Select` 弹层表面、`Combobox`、`PinInput`、`InputOTP`、`TagsInput`。
- **历史遗留（严禁照抄样式）**：旧版 `Badge` 与 `Alert` 语义底色写法，以及 **`src/components/sidebar/` 整个目录（23 个文件）**——该目录是早期从 `shadcn-vue` 直接拷入的未迁移代码，内部手写了独立的按钮外观和焦点环，仅限宿主设置侧栏过渡使用，任何新组件都不得模仿其写法。

## 颜色体系

- **黑白灰占约 90% 骨架；主按钮用炭黑；蓝色代表选中；品牌紫稀缺配给**：
  - 高强调主操作按钮（`variant="default"` / `"primary"`）使用炭黑阶梯（`--btn-primary` → `-hover` → `-active`）。
  - 品牌紫（`--brand`）仅用于 `<Button variant="brand">`（如聊天发送按钮等极少数核心转化动作）及少量保留 Token（`--sidebar-primary`、能力/事件点缀色、深色模式 `--field-edge-brand-tint`），严禁将大面积背景或普通按钮涂成紫色。
  - 危险操作按钮（`variant="destructive"`）使用实心红底白字（`bg-destructive text-destructive-foreground`），严禁用 `variant="ghost"` 加手写 `text-destructive hover:bg-destructive/10` 冒充；页脚确需低强调危险操作时，使用 `variant="outline"` 作为显式例外。
  - 布尔与范围选中态（`Checkbox`、`Switch`、`Radio` 选中边、`Slider` 轨道）统一使用单一蓝色填充 `--accent-blue-fill`（`#2383e2`，配 `-hover` 与 `-active` 色阶）。
- **零色度交互叠色梯（Interaction Overlay Ladder）**：所有悬停与按压高亮均采用色度为 0 的纯中性半透明叠色（浅色叠黑、深色叠白），自动继承底层表面的冷暖色调，跨深浅色与多主题无需任何 `dark:` 覆写：
  - `--overlay-hover-light`（浅 `4.5%` 黑 / 深 `5.5%` 白）：宽侧栏行、菜单高亮；
  - `--overlay-hover`（`7.2%` / `9%`）：标准控件（`Toggle`、`Select`、`Checkbox`）；
  - `--overlay-hover-strong`（`11%` / `13%`）：小型纯图标幽灵按钮、`Toggle` 开启态；
  - `--overlay-active`（`13.5%` / `15.5%`）：标准控件按下态；
  - `--overlay-active-strong`（`17%` / `19%`）：小型图标按下态、开启并按下态。
  - 语义别名（`--ui-hover`、`--ui-selected`、`--ui-on`、`--ui-pressed`、`--ui-selected-pressed`、`--btn-ghost-hover`、`--sidebar-hover`）均指向此阶梯。
- **11 色强调色板（Accent Palette）**：每种色相包含 6 个角色（`--accent-{hue}` 文字/图标色、`-soft` 静止底、`-soft-hover`、`-soft-active`、`-border`、`-deep`）。带色元素的文字和图标颜色在悬停与选中时保持恒定，仅背景沿 `soft → soft-hover → soft-active` 加深。

## 交互模型（悬停 / 按下 / 焦点）

- **按压缩放（Press-scale）只作用在 `::before` 伪元素外壳上**：缩放只改变背景层，按钮内的文字和图标绝不发生位移或模糊（`primary` 按下缩放 `0.96`，`secondary`/`outline`/`ghost` 缩放 `0.974`）。全宽块级按钮（`data-block`，如侧栏宽行按钮）与大面积内容卡片（如 `ActionCard`）禁用缩放，以免宽元素左右边缘大幅抽动，改用原位加深填充色（`--btn-primary-active` 或 `--ui-pressed`，`40ms`）表达按压。
- **输入框只在获得焦点（Focus）时响应，悬停不变色**：文本输入控件通过单根内嵌 1px 细边原位换色表达状态（`--field-edge-rest` → 聚焦 `--field-edge-solid` / 弱激活 `--field-edge-engaged` / 校验失败 `--destructive`）。仅有两个显式受控例外：
  1. `<Textarea rest="bare">`：在未聚焦时隐藏静止细边，专用于外观必须与被替换正文气泡完全一致的原位编辑器（如聊天气泡内原位编辑提示词），聚焦与校验失败时仍绘制边线，普通表单保持默认的 `rest="edge"`；
  2. `<Textarea surface="brand-tint">`：用于品牌色浅底气泡表面，聚焦边自动切换为 `--field-edge-brand-tint`（浅色下近黑、深色下品牌紫），调用处不手写边线颜色。
- **键盘焦点环（`--ring`）**：通过 `focus-visible:ring-2 ring-ring/<alpha>` 仅对键盘导航显示。`--ring` 刻意设定为柔和中灰（亮度约 `0.575L`），避免刺眼黑框；鼠标点击后仍停留在 DOM 焦点上的控件（`Select` 触发器、原生 `select`、`Slider` 滑块）不显示残余焦点环。

## 菜单高亮、指示器选中与无指示器持久选中

这三种状态语义不同，严禁混用 Token 或属性名：

1. **游标高亮（Highlight）**：指针或键盘上下键在菜单/列表行上的临时停留。由 `lib/menu.ts` 的 `menuItemClass` 统一绑定 `data-[highlighted]:bg-[color:var(--ui-selected)]`，`Select`、`DropdownMenu`、`ContextMenu`、`Command` 共用同一来源。
2. **带指示器的选中（Selection）**：菜单或列表已选中的值。统一用勾选图标或圆点（Indicator）表达，**绝不给选中行涂持久背景色**（无指示器槽位的 `Table` 行除外，`<Item>` 仅在作为真实 `<a>`/`<button>` 时才启用交互底色）。
3. **无指示器的持久选中（Selected State，`[data-ui-selected]`）**：控件本身就是持久选项且没有独立指示器槽位（如主题切换按钮、侧栏当前会话行），靠自身外观表达“当前选中”。
   - 统一挂载 `[data-ui-selected]` 属性（**必须保留 `ui-` 前缀**：裸 `data-selected` 是 Reka UI 在日历、分页、树节点上原生派发的属性，全局写规则会误伤；而 `--ui-selected` 变量名已被上面的菜单游标高亮占用）。
   - 使用 `--selected-bg`（映射到 `--overlay-hover-strong`，比普通悬停深一档，确保静止的选中项始终比仅悬停的未选中项更醒目）与 `--selected-border`（`--foreground`，仅按钮外壳使用）。在 `[data-button]` 上该状态直接作用于同一个 `::before` 伪元素层，由层叠顺序自动处理“既选中又悬停/按下”的组合，严禁从页面向按钮注入 `border-foreground bg-accent`。
   - 侧栏路由导航激活态（`nav-button.vue` 的 `active` 与视图切换 tab，使用 `--sidebar-accent`）与“当前所在会话行”（使用更深一档的 `--selected-bg`）保持有意区分，不私自合并。

## 圆角档位

只允许使用圆角阶梯 `--radius-*`（`rounded-2xs` 3px · `xs` 4px · `sm` 6px · `md` 8px · `lg` 10px · `xl` 14px；基准 `--radius` = 10px）及菜单专用对 `--radius-menu`（8px）/ `--radius-menu-shell`（12px）：

- `Badge` / 标签 / `Tooltip` / `Kbd` / `TextButton` → `rounded-sm`（6px）
- 标准控件（`Button` / 输入框 / `Select` / `Toggle`）与菜单项行 → `rounded-md` / `rounded-menu`（8px）
- 带外壳 `Popover`、菜单面板、`ActionCard`、`SettingsSection`、Toast → `rounded-menu-shell`（12px）
- 独立 `Card` / `Dialog` / `Sheet` → `rounded-xl`（14px）
- `Avatar` / 胶囊徽标计数 → `rounded-full`
- 输入框内部紧贴边缘的小型附属按钮（`InputGroup` 清除/显隐按钮、`NumberField` 步进器）统一使用 `rounded-[calc(var(--radius)-5px)]`（5px）——这是守卫脚本白名单中唯一允许的计算圆角，防止 24px 小方块因 8px 圆角变成胶囊。

## 三类边框与输入框边线

三类边框各司其职，严禁跨类混用（把结构边框加到输入控件上是造成界面显“脏”的首要原因）：

1. **控件边线（Control Edge）**：融入底色的 1px 半透明细线，包括输入类的 `--field-edge-*` 与按钮/选框类的 `--border-hairline`（在次要按钮上以 `--shadow-hairline` 内阴影形式实现以便平滑过渡）。聚焦或报错时**原位换色**，严禁加粗边框（`focus:border-2`）或外叠光环。
2. **结构边线（Structural Edge）**：实色中性线 `--border`，仅用于容器与分割线（卡片、折叠面板、表格行、分割线），严禁放到输入控件或按钮本体上。
3. **浮层边线（Floating Edge）**：下拉菜单与气泡面板用 `--border-menu`；模态遮罩上的弹窗用 `--border-menu-elevated`（浅色模式下为无边框，因为白面板+深色遮罩+阴影已足够分离，加暗边反而浑浊；深色模式下为白色细边）。`Tooltip` 靠实色背景自身成型，不加边框。

**近黑聚焦边线（`--field-edge-solid`，约 0.78 不透明度）属于稀缺配给**：它只用于“文本或选择字段进入输入焦点”这一种语义（`Input`、`Textarea`、`SelectTrigger`、`InputGroup`、`NumberField`、`PinInput`、`TagsInput`）。其他任何组件需要强调或悬停反馈时，使用柔和的 `--field-edge-engaged`、`--ui-*` 叠色梯或中灰 `--ring`，不得借用近黑边线。

## 层级阴影（Elevation）

默认全平：工具层已将 `.shadow-sm` 强制归零（`box-shadow: none`），普通控件和平面卡片不带任何阴影。浮层只准使用以下 4 个阴影 Token，禁止手写 `box-shadow` 或 `shadow-xs/md/lg`：

- `--shadow-hairline`：次要/描边按钮的 1px 内嵌边线（非投影）；
- `--shadow-thumb`：`SegmentedControl` 滑块的微弱浮起；
- `--shadow-dropdown`：下拉菜单、`Select`、带框 `Popover`（采用大负值 spread，使阴影收在面板正下方而不向两侧外溢）；
- `--shadow-modal`：`Dialog`、`Sheet`、`CommandDialog` 模态层。

## 层叠高度（z 梯）

全局浮层只准使用 `style.css` `@theme inline` 定义的五级语义 Token，写作 `z-(--z-overlay)` 或 `z-index: var(--z-overlay)`，两个层级之间不设中间值：

| Token | 数值 | 职责范围 |
|---|---|---|
| `--z-raised` | 10 | 局部抬升：吸顶渐隐遮罩、拖拽分隔条、叠角徽标 |
| `--z-sticky` | 20 | 面板内部的吸顶栏、局部停靠条 |
| `--z-panel` | 30 | 面板级浮层：聊天输入坞（composer）、缩略导航图、应用级视图切换层 |
| `--z-overlay` | 50 | 所有 Reka 浮层：Dialog / Sheet / Popover / Tooltip / Menu |
| `--z-top` | 100 | 全屏灯箱（Lightbox）与最高全屏遮罩层 |

- **唯一全局例外**：`.memoh-toaster` 保留 `z-index: 9999`，确保同为 Teleport 挂载时 Toast 始终能压过 `--z-top` 灯箱。
- **组件内局部排序不上全局梯**：仅在单一组件自身层叠上下文内部排布兄弟节点的 `0` / `1` / `2`（如 `SegmentedControl` 滑块、按钮组焦点抬升、dockview 内部标签顺序），使用局部值并在同行注明 `ui-allow-z` 及原因，不谎报全局层级。守卫脚本对 `packages/ui` 与 `apps/web` 中的裸 `z-10..50` 和 `z-[N]` 直接报错拦截（零基线豁免）。

## 字体排印、控件尺寸与图标阶梯

- **字号阶梯（自带行高与字距）**：只用 `--text-*`（`text-caption` 11px · `text-body` 12px · `text-label` 13px · `text-control` 14px · `text-title` 16px · `text-heading` 18px · `text-display` 24px）。
- **字重按角色映射**：区块与表面标题用 `font-semibold`；表单标签、按钮文字、徽标与强调用 `font-medium`；正文、说明、输入框内容与占位符用 `font-normal`。
- **控件高度阶梯**：`sm` 为 `h-8`（32px）· 默认 `h-9`（36px）· `lg` 为 `h-10`（40px）；纯图标按钮对应 `icon-sm`（32px）/ `icon`（36px）/ `icon-lg`（40px）。
- **图标尺寸阶梯与组件化要求**：
  - 标准控件内图标 **16px**（`[&_svg]:size-4`）；输入框内小型控件图标 **14px**（`size-3.5`）；紧凑文字按钮（`TextButton`、面包屑）与徽标内图标 **12px**（`size-3`）。
  - 图标一律使用 `lucide-vue-next`（或品牌图标库）的真实 SVG 组件（如 `<Plus />`、`<X />`、`<ChevronDown />`），严禁用文本字符 `"+"`、`"×"`、`"▾"`、`"✓"` 充当图标（纯字符吃不到 SVG 尺寸与 2px 描边规则，视觉会缩小且无语义；键盘快捷键符号 `⌘`、`/` 等真实文本除外）。
  - 无可见文字的纯图标按钮必须提供准确的 `aria-label`。状态与装饰图标使用 `--accent-{hue}`，悬停或选中时颜色保持恒定。

## 随根字号缩放（rem 规则）

根节点设置了 `font-size: var(--memoh-ui-font-size, 1rem)`，界面字号调节与浏览器缩放均通过 `rem` 生效：

- **凡是包裹或约束文字的属性一律用 `rem` 或 Token**：字号用 `--text-*`（禁 `text-[Npx]`），行高用无单位或 `rem`（禁 `leading-[Npx]`），控件高度、内边距、文字间距用 Tailwind `rem` 档位（如 `h-9`、`p-4`、`gap-2`，禁 `≥ 5px` 的 `h-[Npx]` / `p-[Npx]` / `gap-[Npx]`）。
- **`px` 仅限与文字无关的几何细节**：1–4px 细线与指示条、边框与焦点环宽度、位移微调、图标 `size-*` 与模糊半径。
- **JS 布局计算同步跟随根字号**：虚拟列表的 `estimateSize`、行步长或滚动锚点偏移不得写死像素常量，需从根字号换算或调用 `measureElement` 实测。
- 守卫脚本在两个包中拦截文字关联 `px`（存量记录在 `scripts/ui-px-baseline.json`，新增直接失败；确属固定画布尺寸的例外在同行加 `ui-allow-px` 说明）。

## 禁用态与鼠标指针

- **禁用态**：全系统统一 `opacity-40`，不涂灰底、不换颜色；处于加载中的按钮保持完整原色（由旋转图标表达忙碌）。
- **鼠标指针（Tailwind v4 必设项）**：Tailwind v4 移除了按钮默认的 `cursor: pointer`，所有可点击控件必须在基础类中显式写入 `cursor-pointer`，禁用时切换为 `cursor-not-allowed`。以下非手型指针属于刻意设计，切勿改成 `cursor-pointer`：
  - 下拉菜单、右键菜单、`Select` 弹层内的菜单项与滚动按钮（`lib/menu.ts`）使用 `cursor-default`（遵循桌面菜单惯例）；
  - `InputGroup` 内的静态前缀文字与图标使用 `cursor-text`；
  - 侧栏拖拽分隔条使用缩放光标，滚动条滑块保持默认光标。

## 八条脏模式红线与透明度（Alpha）契约

以下八种写法一旦出现即属违规（通常源于照搬了未重构的旧组件）：

1. 在控件本体上烤死背景色（如 `bg-background`、`bg-input`、`dark:bg-*/30`，导致放进 `bg-card` 时内外灰白不一）；
2. 在控件本体上使用结构边框（`border-input`、`border-border`）；
3. 聚焦时加粗边框或外叠焦点环（`focus:border-2`、`focus-within:ring-2`）；
4. 报错时用外环代替原位换红边（`aria-invalid:ring-destructive/20`）；
5. 自造阴影（`shadow-xs/md/lg`）或写 `shadow-none` 对抗继承阴影；
6. 对语义色手写 `/NN` 透明度后缀；
7. 用 `ring-offset-*` 表达选中态；
8. 偏离角色映射表混用圆角（如给标准控件用 `rounded-lg`，或写裸 `rounded`）。

**透明度同样必须走 Token**：需要语义色的浅底或弱边时，使用 `style.css` 中基于 `color-mix(in oklab, ...)` 定义的软色阶 Token（自动跟随深色模式与多主题），禁止手写 `bg-muted/40`、`border-border/60`、`bg-destructive/5` 等百分比后缀：

| Token（工具类） | 计算公式 | 替代的旧写法 | 用途 |
|---|---|---|---|
| `--muted-soft`（`bg-muted-soft`） | `color-mix(in oklab, var(--muted) 40%, transparent)` | `bg-muted/40` | 中性提示块背景 |
| `--border-soft`（`border-border-soft`） | `color-mix(in oklab, var(--border) 60%, transparent)` | `border-border/60` | 弱化分割线或次级卡片边线 |
| `--destructive-soft`（`bg-destructive-soft`） | `color-mix(in oklab, var(--destructive) 5%, transparent)` | `bg-destructive/5` | 危险警告横幅浅底 |
| `--destructive-border`（`border-destructive-border`） | `color-mix(in oklab, var(--destructive) 30%, transparent)` | `border-destructive/30` | 危险警告横幅与状态描边 |

仅三处允许保留透明度写法：键盘焦点环 `ring-ring/<alpha>`、模态框与灯箱的全屏遮罩（如 `bg-black/50`）、以及已封装为 Token 的中性交互叠色梯。守卫脚本通过 `scripts/ui-alpha-baseline.json` 棘轮拦截一切新增语义色 `/NN` 后缀。

## 动效、菜单对齐与框架版本注意项

- **Tailwind v4 独立变换属性**：Tailwind v4 将 `translate-*`、`scale-*`、`rotate-*` 编译为独立的 CSS 属性 `translate` / `scale` / `rotate`，写 `transition: transform` 不会产生过渡动画（会直接跳帧），必须过渡实际属性（如 `transition: translate`）。
- **动效时长档位**：输入框边线约 `70ms` · 开关滑块 `110ms`（轨道变色与滑块位移必须同速）· 按钮变色 `150ms` · 切换按钮按下 `40ms` / 松开 `160ms` · 手风琴展开 `180ms` · `AutoHeight` 高度过渡与滚动边缘渐隐 `200–220ms` · 分段滑块 `250ms` · 按钮按压弹簧回弹 `255ms`。
- **嵌套子菜单对齐与菜单前导图标**：
  - `DropdownMenuSubContent` 与 `ContextMenuSubContent` 通过 `useSubmenuAlignment` 默认将子菜单首项的垂直中心对齐父触发项中心（适应字号缩放，空间不足时仍由 Reka 处理翻转防溢出），调用方不加偏移修正。
  - 菜单项前导图标的尺寸与间距由菜单组件统一接管，调用方直接传入图标组件，不加 `mr-*`、`ml-*` 或尺寸修正类。根级 `ContextMenu` 在光标处采用淡入缩放动画，不用方向滑入。
  - 普通操作菜单与 `Select` 共用 `--menu-min-width`（`10rem`）基础最小宽度（窄屏允许收缩，`Select` 不窄于触发器），不为短文案逐页压窄菜单或降低行高。
- **技术栈版本约束**：Tailwind CSS v4（无 `tailwind.config.js`）、Vite 8、Vue 3 `<script setup>`、Reka UI（使用 `as-child`、`data-state`）、`vee-validate`。`@layer components` 中确需压过工具类的规则才显式加 `!important`（如链接变体），切勿在组件上叠加多余的 `transition-colors` 冲掉 `style.css` 设定的精确时长。
- **未结演进项（非阻塞）**：`Toggle` 的 `tint` 激活态仍引用 `--brand`；深色模式下的 11 色强调色板与阴影暂继承浅色定义；`SegmentedControl` 禁用态当前为 `opacity: 0.5`，待后续评估是否统一收至 `0.4`。
