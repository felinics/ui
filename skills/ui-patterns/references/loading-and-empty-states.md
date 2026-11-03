# 加载阶梯、空状态与统计磁贴规范

涵盖四级加载反馈阶梯、`isPending` 与 `isLoading` 区分、卡片内与独立容器空状态、主次区块显隐及统计数值块排布。

## 目录

- [加载反馈阶梯与稳定性（加载完成不跳动）](#加载反馈阶梯与稳定性加载完成不跳动), L:12
- [空状态（Empty States）：撑住外框，严禁虚线框与卡套卡](#空状态empty-states撑住外框严禁虚线框与卡套卡), L:28
- [常驻主区块 vs 条件性次要区块](#常驻主区块-vs-条件性次要区块), L:55
- [统计数值块（Stat Tiles）排布规范](#统计数值块stat-tiles排布规范), L:63

## 加载反馈阶梯与稳定性（加载完成不跳动）

加载状态不仅要告诉用户“正在读取”，还必须保证**数据到达的那一帧页面布局不发生跳动**。

- **按所处空间四选一（四级加载阶梯）**：
  1. 局部纯图标（如侧栏微指示）：`<Spinner>`；
  2. 触发异步请求的按钮自身：新代码使用带 200ms 延迟与最短停留时间的 `<LoadingButton>`（存量 `<Button :loading>` 保持现状）；
  3. 卡片或面板内的单行左对齐加载：`<InlineLoadingRow>`（在 `SettingsSection` 卡片内传 `surface="card-row"`，在无外框 Tab 页内传 `surface="tab"`）；
  4. 整块空面板居中填充：`<PanePlaceholder loading>`。
- **区分首次无数据（`isPending`）与后台刷新（`isLoading`）**：
  - 阻塞式骨架屏或加载占位只准绑定 Pinia Colada 的 `isPending`（代表缓存中尚无任何数据）。
  - `isLoading` 在每次后台静默重验证时都会变为 `true`，若绑在骨架屏上会导致用户每次切回页面或聚焦窗口时整个列表闪回加载态。已有缓存数据时的后台刷新应保持原内容可见。
- **骨架屏与真实内容同形，提前预留高度**：
  - 骨架屏的卡片和行高必须与最终渲染的真实行一致（如 `profile/index.vue` 与 `DetailPane` 的 4 行表单骨架），每行设置 `min-h-[3.75rem]`，防止冷加载结束时区块突然变高或变矮。
  - 尚未采样或后端未返回的指标数值统一显示长横线 `—`，**绝不伪造 `0`**（`0` 代表真实采样值为零）。

## 空状态（Empty States）：撑住外框，严禁虚线框与卡套卡

在交付任何列表、卡片或表格前，必须强制触发一次空数据状态，检查页面在没有行数据时是否依然结构完整：

1. **在 `SettingsSection` 白卡内部 → 无边框、无图标底块**
   - 外层的白色 `SettingsSection` 卡片本身已经是边框容器，内部的 `<Empty>` 只放居中的文字和引导按钮（`class="py-12"`）。
   - **严禁在白卡内部再给 `<Empty>` 加 `border` / `border-dashed` 或灰底图标框（`EmptyMedia variant="icon"`）**——那会在白盒子里再套一个灰盒子（卡套卡）。
   ```vue
   <SettingsSection :title="$t('feature.title')">
     <InlineLoadingRow v-if="isPending" surface="card-row">{{ $t('common.loading') }}</InlineLoadingRow>
     <Empty v-else-if="!items.length" class="py-12">
       <EmptyHeader>
         <EmptyTitle>{{ $t('feature.emptyTitle') }}</EmptyTitle>
         <EmptyDescription>{{ $t('feature.emptyDescription') }}</EmptyDescription>
       </EmptyHeader>
       <EmptyContent><Button variant="outline" size="sm">{{ $t('feature.add') }}</Button></EmptyContent>
     </Empty>
     <!-- 正常数据行 -->
   </SettingsSection>
   ```
2. **作为独立列表/网格的最外层容器（外层没有父卡片）→ 实线边框（Solid Border）**
   - 没有父卡片包裹时，`<Empty>` 自身承担外框，使用与常规卡片一致的**实线边框**和圆角（`rounded-[var(--radius-menu-shell)] border border-border py-16`），使空状态与有数据时的外框轮廓保持一致。
   - **虚线边框（`border-dashed`）绝不是空状态的外观**：虚线只用于“已有真实条目的网格末尾追加的那张 `+ 新增` 磁贴”或文件拖拽上传区，绝不拿来画空状态外框。
3. **表格内的空状态 → 保持表头与表格外框，在满宽单元格内居中提示**
   - 不要在没数据时把整张 `<Table>` 拆掉换成一句裸 `<p>`；保留表格外框，渲染一行 `<TableCell :colspan="N">` 居中展示空提示。
4. **默认不放装饰性大图标**：`EmptyMedia variant="icon"` 会额外增加一层视觉盒子与阴影噪音，除非经维护者明确同意，空状态默认不加顶部装饰图标。

## 常驻主区块 vs 条件性次要区块

并非所有空列表都要画一个空状态框，取决于该区块是不是页面的核心骨架：

- **常驻主区块（保留外框 + 空状态提示）**：用户进入该页面就是为了看这项核心内容（如“定时任务”页的任务列表、“用量”页的统计表），哪怕当前为 0 条，也必须画出外框并在内部给出空状态说明或创建入口。
- **条件性次要区块（为空时整块隐藏）**：仅在“有东西需要处理”时才成立的区块（如“当前活跃桌面会话”“待办配置提醒”“异常告警横幅”），当列表为空或状态健康时**直接整块不渲染（`v-if` 隐藏）**，绝不画一个空的边框盒写“暂无活跃会话”占用首屏空间。
- **判断方法**：问一句“刚注册、什么都没配的新用户进这一页，预期看到这个区块吗？”只有出问题或激活后才关心的内容，空置时一律消失。

## 统计数值块（Stat Tiles）排布规范

展示一组统计指标（如概览页与容器页的资源读数）时，遵守以下排布规则，严禁自造带彩色底或大号渐变字的“仪表盘卡片”：

1. **绝不把统计磁贴网格再包进 `SettingsSection` 卡片里**：统计磁贴本身已有边框，外面再套一层 `SettingsSection` 会形成“大白框里套一排小框”的卡套卡；同理，也绝不在 `SettingsSection` 卡片内部手搓多列 `grid-cols-2` 数值格（卡片内展示键值只用左标签右数值的 `SettingsRow`）。统计磁贴应直接放在分组小标题下方，作为顶层兄弟节点。
2. **少量指标（约 3 项）优先用带间距的独立兄弟卡片（`gap-3`）**：
   ```vue
   <section class="space-y-2.5">
     <h2 class="px-2 text-label font-medium text-muted-foreground">{{ $t('feature.overview') }}</h2>
     <div class="grid grid-cols-3 gap-3">
       <MetricReadout :label="label" :value="value" :sub="ceilingText" />
     </div>
   </section>
   ```
3. **禁止在并排多列网格中使用 `gap-px bg-border` 画纵向分割细线**：我们的视觉体系目前没有设计纵向列分割线；在多列网格上用 `gap-px bg-border` 会同时画出横线和竖线，不仅接缝局促，一旦最后一行不满列还会留下一格带灰线的空白死区。并排分列一律用 `gap-3` 独立卡片（`<MetricReadout>`）。
4. **每个用量读数都必须标明上限（Ceiling）**：展示资源占用（CPU、内存、磁盘）时，副标题必须写出上限（有限制写 `已用 / 上限`，无限制写统一的 `无限制 / No limit`），不能一个磁贴有分母、相邻磁贴空着，也绝不能把挂载路径（如裸 `/`）当成容量副标题塞在数值块里（诊断路径归属“详情”弹窗）。
