---
name: ui-owners
description: 在编写或修改任何设置页、Bot 详情页 Tab、弹窗/气泡/抽屉表单、配置面板、列表行、卡片、统计数值块、警告提示框、加载态、空状态或删除确认框之前必读。本 skill 是 @felinic/ui 的组件与布局原语字典（Components & Primitives），定义了每个重复出现的空间结构由哪个唯一原语组件负责，防止用裸 `<div>` 手搓出“同形异码”导致间距与样式漂移。与 `packages/ui/AGENTS.md`（基础 Token 契约）和 `packages/ui/skills/ui-patterns/SKILL.md`（跨组件交互与场景规范）配套使用。
---

# UI 组件与布局原语字典（ui-owners）

本文件连接底层的视觉 Token 契约（`packages/ui/AGENTS.md`）与上层的跨组件交互规范（`../ui-patterns/SKILL.md`）：当页面需要一行设置、一个表单字段、一张分组卡片、一块统计指标、一条警告横幅或一个弹窗外壳时，直接组合下方的原语组件，绝不用裸 `<div>` 手写相似结构。

## 核心目的：消灭“同形异码”

前端最难靠文本搜索清理的债是“同形异码”：同一种设置行或表单字段，在不同页面各自手写 Tailwind 类名，一处写 `py-3`，另一处写 `py-2.5`，第三处又加 `min-h-[3.75rem]`，界面逐渐松散走样。

解决办法是给每一种重复出现的空间关系指定**唯一一个原语组件（Owner）**。动笔写 `<div class="flex ... border-b ...">` 或 `<div class="space-y-1.5"><Label />...` 之前先停下查表；所有核心原语均已收敛入 `@felinic/ui`，新代码一律直接从 `@felinic/ui` 导入（宿主 `apps/web/src/components/` 下残留的同名文件仅为兼容老代码的转发薄壳，不再引用）。宿主应用私有的页面局部原语（如聊天输入坞、引导页步骤框等）见主仓 `memoh-frontend-rules` 的 `references/architecture.md`。

每个原语名称后标注当前成熟状态（`[稳定]` 或 `[弃用中]`）：标为 `[稳定]` 的直接复用，标为 `[弃用中]` 的禁止新增调用。

---

## 一、常用交互原子选型

外观相近但职责不同的原子控件严禁混用：

- **`SegmentedControl` vs `Tabs` `[稳定]`**
  - `SegmentedControl`：封闭底槽配带微阴影滑块，本质是单值/模式/筛选选择器（`role="radiogroup"`），只返回值，不接管面板内容（适用于日/周/月、列表/看板等视图开关）。
  - `Tabs`：底线式分区导航（激活项带 `border-foreground` 底边），拥有完整的 `tabpanel` 无障碍契约（方向键游走焦点、`aria-controls`、面板显隐）。需要切换内容面板用 `Tabs`；只选一个值用 `SegmentedControl`，绝不把 `Tabs` 重新改回胶囊外观。
- **`Button` vs `TextButton` vs `variant="link"` `[稳定]`**
  - `Button`：标准控件高度的操作按钮（主操作默认炭黑，`variant="brand"` 仅限极少数品牌转化动作，`variant="destructive"` 为实心红）。纯工具栏图标用 `variant="ghost" size="icon"`；独立带框图标操作用 `variant="outline" size="icon"`。
  - `TextButton`：紧凑型低强调可点击文字（等价于 `variant="ghost" size="text"`：`h-auto`、`rounded-sm` 6px、`text-control` 14px、内嵌图标 `size-3` 12px，水平 `px-1.5` / 垂直 `py-[5px]` 留出呼吸热区），复用完整的 `[data-button]` 幽灵悬停与按压契约。适用于面包屑节点、行内下拉触发器与紧凑次要动作，严禁用 `<span @click>` 手写悬停底色。
  - `Button variant="link"`：正文段落内部带下划线反馈的文字链接。
- **`InfoHint` `[稳定]`**
  - 只负责解释说明、不触发任何业务动作的 14px 弱化 `ⓘ` 图标（比 12px 文字档高一档以抵消细线圆圈的视觉缩小感；内置 `Tooltip`，支持鼠标悬停、键盘聚焦与触屏轻点切换，触控热区扩至 26px，`text` 同时作为无障碍名称，支持 `side` 与 `align` 避让高控件）。严禁把它做成带悬停底块或手型光标的图标 `<Button>`。与所有 Tooltip 一样，仅放辅助说明。
- **`ActionCard` `[稳定]`**
  - 把用户带向下一层界面（聚焦弹窗、推拉详情页或外部链接 `as="a"`）的整卡操作入口，绝不用普通展示卡硬绑 `@click` 或拉宽 `<Button>` 代替。
  - 三个固定特征：必传的前导图标插槽 `#icon`（与标题同用 `text-foreground`，防悬停冲淡）、必有的尾部静音方向箭头（默认 `ChevronRight`，外链可通过 `#trailing` 换 `ArrowUpRight`）、整张卡片响应指针（通过 `z-index: -1` 的 `::before` 伪元素叠加专有微差遮罩 `--action-card-hover` / `--action-card-active`，15ms 瞬时响应，不污染 `bg-card` 白底，且不产生大卡片按压缩放）。圆角为 `--radius-menu-shell`（12px），与相邻的 `SettingsSection` 和 `BackendCard` 保持一致。
- **`Select` vs `Combobox` vs `NativeSelect` `[稳定]`**
  - 单选菜单用 `Select`；带搜索的单选或多选用 `Combobox`；`DropdownMenu` 与 `ContextMenu` 用于命令与右键菜单（严禁在 `Popover` 里手塞原生 `<button>` 列表和 `<hr>` 分割线）。
  - `NativeSelect`（操作系统原生下拉框）仅用于无任何自定义样式控件相邻的紧凑纯表单；一旦旁边已有 `Select` 或重构后的卡片界面，统一用自定义样式的 `Select`。
- **`Pagination` 与 `Breadcrumb` `[稳定]`**
  - 分页按钮通过 Reka `as-child` 渲染真实 `<Button>` 以继承 `[data-button]` 交互（当前页为 `outline` + `aria-current="page"`，首尾翻页为纯图标 `ghost`；仅传 `buttonVariants()` 类名给裸节点会丢失 `style.css` 中的悬停与按压效果）。面包屑分隔符使用斜杠 `/`，每个节点为 `<TextButton>`。
- **`Badge` 与 `BadgeCount` `[稳定]`**
  - `Badge` 提供带边界的状态标签（方便与区块标题对齐，优于悬空的裸圆点加文字）。
  - `BadgeCount` 用于计数与未读提示，按紧急程度选色调（优先级从高到低）：`destructive` 为钉在图标右上角（`absolute -right-1.5 -top-1.5`）的红色告警点（代表失败或需要修复的问题）；`warning`（黄底深字）统计等待用户处理的事项；`brand` 统计普通新增未读（如新回复），醒目但不至于像报错告警；`default` 为跟随标签/筛选器的中性计数胶囊（默认超过 99 显示 `99+`）。汇总混合事项时取其中最紧急一项的色调（`destructive` > `warning` > `brand`）；平铺列表行内的数量直接用静音等宽数字（`text-caption tabular-nums text-muted-foreground`），不套气泡。
- **`AutoHeight` 与 `LabelSwap` `[稳定]`**
  - `AutoHeight`：内容原地切换（如弹窗内列表↔表单切换、折叠项展开）时的高度弹簧过渡容器（220ms `cubic-bezier(0.32, 0.72, 0, 1)`，首帧直出不跳动，遵守减少动态效果设置）。**它只做裁剪与高度测量，绝不能兼任滚动容器**——必须把 `overflow-y-auto`（如 `DialogBody`）放在外层，将 `AutoHeight` 嵌在里面。
  - `LabelSwap`：状态按钮平滑换字原语（如“连接 ↔ 取消”），按具名插槽与 `active` 切换，外壳宽度弹簧过渡、文字交叉淡入淡出，彻底替代手写 `min-w` 魔法数或网格叠字。

---

## 二、页面结构与导航原语

- **`PageShell`（含 `PageHeader`）`[稳定]`**
  - 带标题栏的居中单列页面外壳（`max-w-3xl`）。Props：`title`、`description`、`variant: 'page' | 'tab'`（独立路由用 `'page'`，Bot 详情内嵌 Tab 用 `'tab'`）。插槽：`#actions`（右上角操作区）与默认插槽。`PageShell` 在同一套边缘上对齐左侧内缩 `pl-2` 的标题与右侧贴齐卡片边缘的 `#actions`，任何带标题的设置页一律从它开始，绝不手写 `<header>`。无标题时不渲染头部空块。
- **`SettingsShell` `[稳定]`**
  - 自带内部结构的列表/主从设置页宽度外壳，提供统一宽度阶梯（`narrow` `max-w-3xl` · `standard` `max-w-4xl` · `wide` `max-w-6xl` · `full`）与页面左右留白（`px-4 md:px-6`），与 `DetailPane` 共用 `settingsWidthClass`。
- **`DetailPane`、`BackButton` 与 `SwapTransition` `[稳定]`**
  - `DetailPane`：页内详情视图容器，自带与正文同宽对齐的顶部返回行（`BackButton`）及与真实表单同形的加载骨架屏（防止数据到达时页面跳动）。Props：`backLabel`、`width`、`loading`；事件：`back`。
  - `BackButton`：页内详情的唯一返回按钮（幽灵样式，左箭头 + 单行截断标题），无法使用 `DetailPane` 的 Tab 子页也直接复用它。
  - `SwapTransition`：列表↔详情的左右推拉过渡容器（`direction: 'forward' | 'back'`，首屏无入场动画，返回时自动恢复列表此前的精确滚动位置）。
- **`SettingsSection` `[稳定]`**
  - 顶部静音灰字小标题 + 带边框白底圆角卡片（`bg-card` + `border-border` + 12px 圆角）。Props：`title`（可省略渲染无标题卡片）；插槽：`#actions`（标题右侧工具栏：组件自带靠右的按钮组和 `gap-2` 间距，多个按钮直接放入，不再自包一层）、默认插槽（行列表）、`#footer`（卡片底部的顶边细线操作带，右对齐，供详情表单放取消/保存按钮）。绝不手写 `rounded-... border bg-card`。
  - 卡片同时是外壳和列表：左右内缩由卡片统一提供（`px-(--settings-inset)`，16px），卡片内任意层级的 `SettingsRow` 等行都获得列表的行节奏（规则按后代匹配，中间隔着包裹元素或组件也生效；末行去分隔线按行所在的父元素判断）。卡片内的任何块都不再写 `mx-4` / `px-4`，非列表块只写上下内边距（如 `py-4`）。
- **`SectionGroup` `[稳定]`**
  - 带标题的**无外框**内容组，用于内部子项本身已带边框的布局（如 `BackendCard` 网格），避免产生“卡套卡”。仅在一个页面上下堆叠**多个**此类分组时使用（如语音页的 TTS / STT）；整页只有一个网格时直接把标题和描述交给 `PageShell`。Props：`tone: 'foreground' | 'muted'`（默认前景深色；与 `SettingsSection` 同级混排时设为 `'muted'`，同页同级标题严禁混用两种色调）；`bare`（当内部内容完全无边框时开启，取消标题的 `px-2` 内缩并加大标题与正文的间距）。
- **`StatusDot` `[稳定]`**
  - 状态色点原子组件（状态映射颜色，由 `BackendCard` 和 `MetricReadout` 内部组合），禁止手画彩色小圆点。

---

## 三、卡片内行原语

- **`SettingsRow` `[稳定]`**
  - 设置列表里的标准水平设置行，只管行内布局（左标签描述、右控件、对齐与堆叠）。行高、上下内边距和行间细线（`min-h-15 py-3 border-b`，末行与 `:divider="false"` 无细线）由所在列表提供，左右内缩由卡片外壳提供；行本身不带任何外边距。放在列表外（例如弹窗里单独一行）时就是一行纯内容，不再自带缩进。
  - Props：`label`、`description`、`align: 'center' | 'start'`（带头像或多行内容的高行用 `'start'` 顶对齐）、`stack: 'never' | 'sm' | 'always'`（默认单行；`'sm'` 在窄屏下折为上下排布防挤压；`'always'` 永久上下排布，用于标签下方放全宽 `Textarea` 或代码块）。
  - 插槽：`#leading`（头像/图标/骨架）、`#content`（自定义左侧正文，如需要 `<Label :for>` 绑定焦点或插入状态徽标时替换默认标题描述）、默认插槽（右侧控件）。
- **`ExpandableSettingsRow` `[稳定]`**
  - 整行头部可点击展开/收起下属面板的设置行。Props：`label`、`description`、`v-model:open`；插槽：`#leading`、`#content`、`#trailing`（默认带旋转 90° 的箭头）、`#expanded`（展开内容区，通常内放 `FormStack`）。仅用于“该行自身拥有展开内容”的场景。
- **`SettingsList` `[稳定]`**
  - 卡片之外的一组设置行（例如弹窗正文里按小标题分组的行），只提供列表的行节奏，不加内缩、不加底色：所在表面（`DialogBody` 等）已经有自己的内边距。`SettingsSection` 卡片本身就是列表，卡片内不要再套它。
- **`SettingsBleed` `[稳定]`**
  - 让卡片内的一块内容贴到卡片左右边缘：以同一个 `--settings-inset` 反向拉出（`-mx-(--settings-inset)`），内缩与它的例外共用一个值。用于悬停底色需要横跨整卡的整行点击目标（`ModelListRow` 内部即用它）、表格、图表或图谱画布、带满宽细线的分页条；内部需要与上下行文字对齐时自行补回 `px-(--settings-inset)`。
- **`BackendCard` `[稳定]`**
  - 根节点为真实 `<button>` 的水平对象入口卡片。Props：`name`、`subtitle`、`enabled`（绘制状态点）；插槽：`#leading`（图标）、`#trailing`（默认右箭头）。用于提供商、存储后端等对象条目选择。
- **`ModelListRow` `[稳定]`**
  - 卡片内紧凑型整行可点击导航行（整行是一个 `<button>`，经 `SettingsBleed` 贴到卡片两侧边缘，因此只能放在 `SettingsSection` 卡片里；放进弹窗里的 `SettingsList` 会横向溢出 16px。左侧名称与可选次要 `meta` ID，右侧装饰图标默认齿轮，通过 `last` 控制末尾分割线，显式派发 `click` 事件）。专用于“点击整行打开编辑弹窗”的紧凑模型列表；若一行内包含独立的启用开关、测试、删除等多个行内操作按钮（如 `providers/model-item.vue`），交互关系不同，保留独立实现，不强套此原语。

---

## 四、表单字段原语

- **`FieldStack` `[稳定]`**
  - 垂直堆叠的“上方标签 + 下方控件”表单字段唯一原语（标签采用 `FieldLabel` `text-label` 13px，标签到控件间距为 6px，区别于标签在左的 `SettingsRow`）。
  - Props：`label`、`for`（绑定控件 `id`）、`help`（控件下方的静音辅助说明）、`required`（默认 `false` 不显示星号，仅在必填与选填混排且肉眼难辨时显式开启）。插槽：`#label`（自定义标签行，如右侧附带计数或清除按钮时，内部仍组合 `FieldLabel`）、默认插槽（输入控件）。
  - **内置 `vee-validate` 校验接管**：放在 `<FormField>` 内时自动提供表单项 ID 并渲染行内错误文字：
    ```vue
    <FormField v-slot="{ componentField }" name="x">
      <FieldStack :label="t('...')" for="x-id">
        <FormControl><Input id="x-id" v-bind="componentField" /></FormControl>
      </FieldStack>
    </FormField>
    ```
    注意：由于 `FieldStack` 会直接把 Zod schema 的校验消息渲染到界面上，所有自定义校验文案必须接入 `en`/`zh`/`ja` 三语翻译，不得暴露英文默认报错。
- **`FormStack` `[稳定]`**
  - 包裹一组连续 `FieldStack` 的垂直间距容器（`space-y-4`），用于弹窗表单正文或展开面板。
- **`FormItem` `[弃用中]`**
  - 早期遗留的 `grid gap-2` 表单项包装组件，已被 `FieldStack` 完全取代，新代码禁止使用。

---

## 五、数值、提示与设备码面板

- **`MetricReadout` `[稳定]`**
  - 单个统计数值块：上方小字标签 + 下方等宽数字（`tabular-nums`）或状态点。Props：`label`、`value`、`sub`、`framed`（默认 `true` 带边框白卡，在已有表面上裸放时设 `false`）、`status: 'ok' | 'warn' | 'error'`；插槽：`#value`（自定义相对时间或等宽文本）。网格列数由调用方外层容器控制。
- **`PersonaTile` `[稳定]`**
  - 垂直居中的实体/新增磁贴卡片（`w-52 flex-col items-center`，`variant: 'entity' | 'add'`），是水平 `BackendCard` 的纵向对应物。
- **`CalloutBanner` `[稳定]`**
  - 带框警告与错误提示横幅（唯一提示面）。Props：`tone: 'warning' | 'destructive'`、`title`、`description`、`clickable`（整条变为带箭头的按钮）；插槽：`#icon` 与默认插槽（尾部操作按钮）。
- **`DeviceCodePanel` `[稳定]`**
  - RFC 8628 设备码授权面板：指引提示（含防钓鱼提醒）→ 大号等宽授权码（`text-3xl mono select-all`，非输入框）→ “复制并打开”主按钮（内部严格趁当前页拥有焦点时先同步发起 `clipboard.writeText`、再同步调用 `window.open`，两步均不 `await`，规避失焦导致 Chromium 复制失败或先开空白页的陷阱）→ 带页面可见性守卫的 `mm:ss` 倒计时。所有文案均通过必填 props 由调用方传入 i18n 字符串，派发 `retry` 事件。

---

## 六、加载与空状态原语（四级加载阶梯）

加载态严格按所处空间四选一，互斥不混用：

1. **仅需旋转图标、无伴随文字**（极少见，如窄侧栏局部指示）→ `<Spinner>` 原子；
2. **点击触发异步请求的按钮自身** → 新代码用宿主封装的 `<LoadingButton>`（带 200ms 延迟与最短停留防闪），底层为 `<Button :loading>`；
3. **文档流内左对齐的“旋转图标 + 静音文字”单行占位** → `<InlineLoadingRow>` `[稳定]`（通过 `surface="card-row"` 渲染设置列表——`SettingsSection` 卡片或 `SettingsList`——里的行形态，或通过 `surface="tab"` 渲染无外卡的整页 Tab 形态，严禁手抄类名混用两套边距）；
4. **整块面板尚无任何其他内容时的居中填充** → `<PanePlaceholder>` `[稳定]`（无边框，支持 `loading`、默认空状态与双行强调 `title` 三种模式；父容器需提供高度）。

**`Empty` `[稳定]`**：页面或卡片内的结构化空状态组件（`EmptyHeader` / `EmptyTitle` / `EmptyDescription` / `EmptyContent`）。在 `SettingsSection` 内部时严禁加边框或图标底块；作为独立列表最外层时使用实线 `border`（详见 `../ui-patterns/references/loading-and-empty-states.md`）。

---

## 七、弹窗外壳原语

- **`DialogPanel` `[稳定]`**
  - 限高聚焦弹窗的唯一外壳（封装 `max-h-[80dvh]`、网格行分配与右上角关闭按钮联动，严禁在 `DialogContent` 上手抄 `max-h-[80dvh] grid-rows-[auto_minmax(0,1fr)]`）。
  - Props：`width: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'`（表单弹窗统一用 `'md'` 448px；多视图切换列表默认 `'xl'` 576px；工作台默认 `'2xl'` 672px；重型编辑器 `'3xl'` 768px；带左侧历史栏双栏弹窗 `'4xl'` 896px）、`grow`（无固有高度的编辑器固定撑满 `80dvh`）、`view-swap`（配合 `DialogViewHeader` 自动禁用默认角落关闭钮，防偏离标题中线）、`footer`（启用第三行放置 `DialogFooter`）。
- **`DialogBody` `[稳定]`**
  - `DialogPanel` 内部的可滚动正文行：自带滚动条留白补偿（`-mr-3 pr-3`）以及带状态的 16px 上下滚动边缘渐隐遮罩（仅在该方向仍有未滚完内容时才渐显 200ms 遮罩，滚到顶/底或内容不足一屏时无遮罩，严禁手写静态 `mask-image` 切掉首尾行）。与 `AutoHeight` 组合时，`AutoHeight` 必须放在 `DialogBody` **里面**。
- **`DialogViewHeader` `[稳定]`**
  - 列表↔子视图切换弹窗的专用单中线头部（`grid-cols-[2rem_1fr_2rem]`，将返回箭头、标题、关闭按钮严格锁在同一水平中线上；内联关闭按钮必须保持 `relative` 定位以约束幽灵悬停伪元素，严禁改成 `static`）。Props：`centered`、`showBack`、`backLabel`；事件：`back`。
- **`FormDialogShell` `[稳定]`**
  - 短表单新建/编辑弹窗快捷骨架（`Dialog` + `form` + 底部按钮带，默认宽度与 `DialogPanel width="md"` 对齐为 448px）。
- **`ConfirmPopover` 与 `ConfirmDeleteDialog` `[稳定]`**
  - `ConfirmPopover`：锚定在触发按钮旁的气泡确认框（非全屏模态），包含标题级提问、可选补充说明、幽灵取消与确认按钮（`cancelText` / `confirmText` 必填无回退）。
  - `ConfirmDeleteDialog`：重型删除模态确认框（`sm:max-w-sm` 384px，描边取消 + 实心红确认，`loading` 时自动禁用取消防中途关闭，`cancelLabel` / `confirmLabel` 必填由调用方传三语翻译，派发 `confirm` 由调用方执行删除并在成功后关闭）。

---

## 八、选型速查表

| 你需要的结构 | 选用的原语 |
|---|---|
| 带标题的边框白卡（承载行列表） | `SettingsSection` |
| 卡片内单行“左标签描述 + 右控件” | `SettingsRow` |
| 点击行头原地展开下属表单的设置行 | `ExpandableSettingsRow` |
| 卡片之外（如弹窗正文）的一组设置行 | `SettingsList` |
| 卡片内需要贴边的表格 / 画布 / 整行点击目标 | `SettingsBleed` |
| 点击选择某个提供商/后端的对象卡片行 | `BackendCard` |
| 卡片内整行点击打开编辑器的紧凑列表行 | `ModelListRow`（若行内含多个独立开关/操作按钮则保留本地组件） |
| 同页堆叠多组自带边框的网格（如多组卡片） | `SectionGroup` |
| 标签在上的垂直表单字段（含校验报错） | `FieldStack`（连续多个外包 `FormStack`） |
| 单个统计数字/状态磁贴 | `MetricReadout`（外层网格由调用方排布） |
| 垂直居中的角色/新增磁贴 | `PersonaTile` |
| 警告或错误提示横幅 | `CalloutBanner` |
| 设备码输入与一键复制跳转面板 | `DeviceCodePanel` |
| 只读代码块 / 带复制按钮的命令块 | `CodePanel` / `CopyButton` |
| 按钮内平滑切换不同长度的文字 | `LabelSwap` |
| 旁侧只负责解释说明的 `ⓘ` 提示图标 | `InfoHint` |
| 打开二级界面/弹窗的功能入口卡片 | `ActionCard` |
| 带标题与右上角操作区的设置页外壳 | `PageShell` |
| 列表↔详情推拉切换与详情骨架外壳 | `SettingsShell` + `SwapTransition` + `DetailPane`（内含 `BackButton`） |
| 限高聚焦弹窗 / 列表管理切换弹窗 | `DialogPanel` + `DialogBody`（切换视图配 `DialogViewHeader` + `AutoHeight`） |
| 轻量气泡确认 / 重型删除模态确认 | `ConfirmPopover` / `ConfirmDeleteDialog` |
| 四级加载反馈 | `<Spinner>` / `<LoadingButton>` / `<InlineLoadingRow>` / `<PanePlaceholder>` |
| 页面或卡片内的空状态 | `Empty` |

---

## 九、何时保留手写（不强套原语的七种情况）

统一的前提是**空间关系确实相同**；遇到以下关系确实不同的结构时保留页面本地实现，不硬塞进原语：

1. **刻意不同的密度与几何尺寸**：更紧凑的列表项（如 `min-h-[3.25rem] py-2.5`）不同于 `3.75rem` 的标准 `SettingsRow`；紧凑行内小表单不同于标准 `FieldStack`。
2. **非设置/表单类的专属表面**：主侧栏会话列表、文件树节点、聊天消息流各有独立的视觉体系，不套用设置行原语。
3. **真正只出现一次的复合区块**：拖拽上传区、Monaco 编辑器、快照输入块、唯一的数据大表等保留本地组合；直到同一形状在第三处重复出现时再提炼升级（如 `DeviceCodePanel` 的演进路径）。
4. **与带框空状态成对出现的带框居中加载块**：如某个卡片槽位在加载与空状态都带同等 `min-h` 边框盒配对切换时，改用无框的 `PanePlaceholder` 会破坏配对，保持成对本地结构。
5. **多元素复合进度块**：同时包含旋转图标、阶段说明和进度条的创建进度区属于复合编排，不用单行 `InlineLoadingRow`。
6. **仅有一句静音文字的极简“无搜索匹配”提示**：直接用静音 `<p>`，不套完整 `Empty` 块。
7. **“上行（左标签 | 右控件）+ 下方横跨整卡全宽的预览区”三段式行**：`SettingsRow` 只建模左右两栏，把全宽预览塞进 `#content` 会导致预览被挤在左栏偏离卡片中轴线；在第二个实例出现并值得扩展 `#below` 插槽前保持本地手写。

---

## 十、常见陷阱与机械守卫棘轮

- **Tailwind 只扫描完整字面量字符串**：动态拼接如 `` `sm:${align}` `` 或 `` `min-h-[${x}]` `` 永远不会生成样式，条件分支必须写出完整的类名字符串。
- **严禁 `<button>` 嵌套 `<button>`**：`BackendCard` 的根节点与 `ModelListRow` 的整行点击目标都是 `<button>`，尾部插槽内绝不能再放 `Switch` 或下拉按钮；既要整行点击又要行内独立开关的行需采用拉伸遮罩层写法保留在本地。
- **控制兄弟区块显隐的开关不用 `ExpandableSettingsRow`**：该组件只管理自己内部的 `#expanded`；若按钮控制的是下方另一个带独立分割线的兄弟区块，使用普通 `SettingsRow` 放按钮。
- **`SettingsSection #footer` 固定右对齐**：适合放“取消 + 保存”；左统计文字、右分页器的 `justify-between` 底栏暂保持本地写法。
- **守卫棘轮标记必须附带同行理由**：`scripts/check-ui-contract.mjs` 对卡片外手抄 `min-h-[3.75rem]` / `min-h-15` 发出警告（防手抄 `SettingsRow`），确属不同形状需豁免时必须在同一行写明原因（`/* ui-allow-shape: 具体原因 */`，空标记本身报错）；对宿主页面新增裸 `animate-spin` 直接硬性报错（存量锁定在 `scripts/ui-spin-baseline.json`，新增必须走四级加载阶梯）。
- **多 Agent 并行迁移页面的共享 i18n 文件冲突**：多个子代理同时修改不同页面时，若各自往 `apps/web/src/i18n/locales/{zh,en,ja}.json` 同一个命名空间下写入新校验 key，会产生 JSON 语法合法但静默后盖前的重复键。批量并行任务建议由主代理汇总新 key 后一次性写入，或提交前对三个 JSON 运行同级对象重复键扫描。
