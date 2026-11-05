# 渐进披露、聚焦弹窗与原地折叠规范

涵盖首屏 99/1 法则、单一任务聚焦弹窗两种标准骨架（工作台形态 A 与列表切换形态 B）及页内折叠两种固定皮肤。

## 目录

- [首屏 99/1 法则：首屏只答“是否正常”，深层操作收进具名门户](#首屏-991-法则首屏只答是否正常深层操作收进具名门户), L:13
- [单一任务聚焦弹窗的两种标准骨架](#单一任务聚焦弹窗的两种标准骨架), L:22
  - [形态 A：工作台弹窗（Workbench，单一表单或设置面板）](#形态-a工作台弹窗workbench单一表单或设置面板), L:28
  - [形态 B：列表管理切换弹窗（List-management，列表 ↔ 新增/编辑子视图）](#形态-b列表管理切换弹窗list-management列表--新增编辑子视图), L:52
- [页内折叠（More options / Advanced）：两种固定皮肤与关注点边界](#页内折叠more-options--advanced两种固定皮肤与关注点边界), L:83

## 首屏 99/1 法则：首屏只答“是否正常”，深层操作收进具名门户

设计任何设置页或状态页的第一屏时，同时兼顾 99% 与 1% 两类用户的需求：**绝不让 99% 只想看一眼状态的用户背负 1% 低频操作的视觉负担，也绝不为讨好 99% 而砍掉 1% 用户的操作路径**。

- **99% 的用户进来只是扫一眼**：首屏的主体内容只回答一个问题——“它现在运行正常吗？用了多少资源？”（一个状态徽标 + 一排统计磁贴）。严禁在首屏直接摆满资源配额输入框、快照历史表格或一排维护按钮。
- **1% 的用户带着明确目的而来**：需要修改配额、创建/恢复快照、查看底层诊断或删除实例的人，进来就会找对应的按钮。做法是为每项深层任务提供一个**具名入口（Named Entry Point）**——一张 `<ActionCard>` 或一行安静的入口行（左侧写清楚任务名称，右侧按钮打开专属的**单一任务聚焦弹窗**）。
- **每扇门直接以它背后的任务命名**：分别命名为“资源限制”“快照与恢复”“运行详情”“删除”，每项打开各自独立的聚焦弹窗。**严禁在首屏卡片里搞一个名叫“高级（Advanced）”或“显示详情”的折叠抽屉把输入框、快照列表、备份恢复和删除全塞在里面**——那种大杂烩抽屉只是把视觉负担推迟了一步，还把只读诊断和高危操作混在同一块表面上。
- **入口行不写充数的预览摘要**：如果入口行下方的描述只是写“暂无快照”或把弹窗里的第一个字段（如镜像名、`CPU 2 核`）抄出来充数，既对 99% 的人是噪音，1% 的人点进去也会看到，直接删掉描述，只保留“标题 + 入口”；只有当这行摘要能直接回答用户原本必须点开弹窗才能确认的问题时才保留。

## 单一任务聚焦弹窗的两种标准骨架

聚焦弹窗由 `@felinic/ui` 的 `DialogPanel`、`DialogBody`、`DialogViewHeader`、`AutoHeight` 组合而成（`ActionCard` 只是常见的触发入口之一，弹窗家族本身可由任何按钮、菜单或快捷键唤起）。严禁手写 `max-h-[80dvh]`、`grid-rows-[...]` 或静态渐隐遮罩。

弹窗头部严格分为以下两种形态，**二选一，绝不混搭**：

### 形态 A：工作台弹窗（Workbench，单一表单或设置面板）

标题居左、右上角关闭按钮（`DialogHeader` + `DialogTitle` 的默认形态）。适用于打开后直接就是一个聚焦配置面板或表单的场景：

```vue
<section class="space-y-2.5">
  <h2 class="px-2 text-label font-medium text-muted-foreground">{{ t('feature.sectionLabel') }}</h2>
  <ActionCard :title="t('feature.entryTitle')" @click="open = true">
    <template #icon><SlidersHorizontal /></template>
  </ActionCard>
</section>

<Dialog v-model:open="open">
  <DialogPanel> <!-- 按需传 width="md" / "3xl" / grow / footer -->
    <DialogHeader>
      <DialogTitle>{{ t('feature.entryTitle') }}</DialogTitle>
    </DialogHeader>
    <DialogBody class="space-y-6">
      <!-- 表单字段或配置分组 -->
    </DialogBody>
  </DialogPanel>
</Dialog>
```

### 形态 B：列表管理切换弹窗（List-management，列表 ↔ 新增/编辑子视图）

当弹窗内部包含一个条目列表，且点击“新增/编辑”会在**同一个弹窗内**切换到表单视图时（如访问控制规则弹窗），使用 `DialogPanel view-swap` + `DialogViewHeader` + `DialogBody` + `AutoHeight`：

```vue
<Dialog v-model:open="open">
  <DialogPanel view-swap>
    <!-- 仅在“展示非空列表”时居中标题；进入表单态或列表为空时自动左对齐 -->
    <DialogViewHeader :centered="!formVisible && items.length > 0">
      {{ formVisible ? actionTitle : listTitle }}
    </DialogViewHeader>
    <DialogBody>
      <AutoHeight>
        <!-- 列表视图（工具栏 + 行 + 空状态），每个分支都必须同时判断 !formVisible -->
        <!-- 表单视图（v-else） -->
      </AutoHeight>
    </DialogBody>
  </DialogPanel>
</Dialog>
```

形态 B 必须遵守五条硬性细节：

1. **整个弹窗只有一个 Header**：进入子表单时直接更新 `DialogViewHeader` 的标题文字，**严禁在表单视图内部再画一个 `<h3>` 标题栏或关闭按钮**（否则会形成双头卡套卡），也不要给独占弹窗正文的表单再加外层 `border-b` 或底栏 `border-t`。
2. **标题居中必须由下方列表重量支撑（动态切换对齐）**：
   - 当处于**非空列表视图**（`!formVisible && items.length > 0`）时，下方整齐的列表行撑起了视觉重心，标题居中（`:centered="true"`）；
   - 当切入**新增/编辑表单视图**或处于**空列表状态**时，标题自动切回居左（`:centered="false"`）。切入普通新增/编辑子表单时**不放左上角返回箭头**，直接用表单底部的“取消”按钮退回列表（多级目录浏览除外）。
3. **列表工具栏左右平衡，搜索框撑满剩余宽度**：当列表有数据时，上方放一行工具栏——左侧为 `min-w-0 flex-1` 撑满的搜索 `InputGroup`，右侧为 `+ 新增` 描边按钮，中间绝不留空白死区，工具栏下方不画分割线。搜索无匹配时只显示一句静音文字（“无匹配结果”），不显示误导性的“暂无条目”空状态；列表真正为 0 条时不渲染工具栏，新建按钮直接放在 `<Empty>` 内部。
4. **列表与表单分支严格互斥**：列表视图下的每一个分支（工具栏、数据行、无匹配、空状态）都必须同时带上 `!formVisible` 条件，防止切入表单时上方残留列表行和多余的底边细线。
5. **高度变化用 `AutoHeight` 平滑过渡**：`AutoHeight` 嵌在 `DialogBody` 内部包裹切换区，使列表↔表单的高度差以 220ms 弹簧过渡，不发生生硬跳帧。

## 页内折叠（More options / Advanced）：两种固定皮肤与关注点边界

把当前表单或当前卡片内的次要/高阶字段收在折叠开关后时，全站只准使用**前置 `ChevronRight`（展开时顺时针旋转 90°）**这一种机制，并按所处容器固定为两种外观皮肤，禁止自创第三种（如后置向下箭头或满宽幽灵灰条）：

1. **在弹窗表单内部 → 低强调文字按钮 + CSS `grid-rows` 折叠**：
   ```vue
   <div>
     <button
       type="button"
       class="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
       @click="showMore = !showMore"
     >
       <ChevronRight class="size-3.5 transition-transform" :class="showMore ? 'rotate-90' : ''" />
       {{ $t('feature.moreOptions') }}
     </button>
     <div
       class="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out"
       :class="showMore ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
     >
       <div class="min-h-0"><!-- 次要表单字段 --></div>
     </div>
   </div>
   ```
2. **在 `SettingsSection` 白卡内部 → 细线行 + 右侧 `outline` `sm` 按钮**：
   ```vue
   <SettingsRow :label="$t('feature.advancedTitle')">
     <Button variant="outline" size="sm" @click="open = !open">
       <ChevronRight class="size-4 transition-transform" :class="open ? 'rotate-90' : ''" />
       {{ open ? $t('feature.collapse') : $t('feature.expand') }}
     </Button>
   </SettingsRow>
   <template v-if="open"><!-- 展开的设置行 --></template>
   ```
   收起时折叠行是卡片最后一行，列表规则会去掉它的底边细线，不与卡片底框叠成双线；展开后下方出现新行，它的底边自然成为分隔线（单行自包含展开也可直接使用 `<ExpandableSettingsRow>`）。

**关键边界：决定“原地折叠”还是“弹独立窗口”的唯一标准是“是否为同一个关注点（Concern）”，而不是字段数量**。
- 如果这些高级选项属于**用户当前正在填写的同一个配置任务**（例如配置网络或渠道提供商时的鉴权、网络、环境变量等分组选填项），哪怕字段很多、分了几个小标题，也必须**留在当前卡片内用上面的原地折叠展开**——因为用户正在配这件事，把同一个表单的后半截拆进另一个弹窗会人为割裂操作流。
- 只有当它属于**另一件独立任务**（如查看快照历史、调整容器配额、执行删除），才按首屏 99/1 法则放进 `ActionCard` → 独立聚焦弹窗。
