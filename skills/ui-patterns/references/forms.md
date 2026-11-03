# 表单、字段与校验规范

涵盖页面表单、弹窗表单（`MEMOH-126` 标准）、提交时校验、焦点跟随、同行等高与按钮/触发器尺寸规范。

## 目录

- [标准表单结构（以“新建任务”弹窗为基准）](#标准表单结构以新建任务弹窗为基准), L:13
- [弹窗表单尺寸与排布规则（MEMOH-126）](#弹窗表单尺寸与排布规则memoh-126), L:70
- [校验时机：提交时报错，失焦不闪红](#校验时机提交时报错失焦不闪红), L:82
- [焦点跟随任务（多步流与视图切换）](#焦点跟随任务多步流与视图切换), L:90
- [同行等高、按钮尺寸阶梯与选择器触发器](#同行等高按钮尺寸阶梯与选择器触发器), L:99

## 标准表单结构（以“新建任务”弹窗为基准）

全站只有一套标准表单结构（样板为 `pages/bots/components/bot-schedule.vue` 的新建/编辑弹窗），不要逐页发明新的表单排布：

- **标题**：使用简洁的 `DialogTitle` 直接点明动作（如“新建任务”），下方不加重复复述标题的副标题。
- **字段列**：外层包裹 `<FormStack>`（`space-y-4`），每个垂直字段使用 `<FieldStack>`（内部使用 `FieldLabel`，标签字号 `text-label` 13px，比输入值 `text-control` 14px 小一档；标签到控件间距固定为 `card` 档 6px）。如需自定义标签行（例如左侧标签、右侧带字符计数或清除按钮），在 `#label` 插槽内依然组合 `<FieldLabel>`，绝不用裸 `<Label>`。
- **同行关联控件**：强关联的“主输入 + 启用开关”（如任务名称与启用状态）放在同一对齐行（`flex items-end gap-3`），开关包在 `flex h-9 shrink-0 items-center gap-2` 中以对齐输入框高度。
- **次要项折叠**：低频或高阶参数（如原始 cron 表达式、高级模式）默认收在“更多选项（More options）”旋转箭头之后（详见 `progressive-disclosure.md`）。
- **底栏按钮**：右侧放幽灵样式“取消” + 默认高度（`h-9`）实心主按钮（创建/保存）；编辑态若包含危险“删除”按钮，单独贴最左侧放置（`sm:justify-between`）。

```vue
<Dialog v-model:open="open">
  <DialogPanel width="md" footer>
    <DialogHeader>
      <DialogTitle>{{ $t('feature.create') }}</DialogTitle>
    </DialogHeader>
    <DialogBody>
      <form id="feature-form" @submit.prevent="onSubmit">
        <FormStack>
          <div class="flex items-end gap-3">
            <FieldStack class="min-w-0 flex-1" :label="$t('feature.name')" for="f-name">
              <Input id="f-name" v-model="form.name" :placeholder="$t('feature.namePlaceholder')" />
            </FieldStack>
            <div class="flex h-9 shrink-0 items-center gap-2">
              <Label class="cursor-pointer text-muted-foreground" @click="form.enabled = !form.enabled">
                {{ $t('feature.enabled') }}
              </Label>
              <Switch v-model="form.enabled" />
            </div>
          </div>

          <FieldStack :label="$t('feature.description')" for="f-desc">
            <template #label>
              <FieldLabel for="f-desc">
                {{ $t('feature.description') }}
                <span class="ml-1 font-normal text-muted-foreground">({{ $t('common.optional') }})</span>
              </FieldLabel>
            </template>
            <Input id="f-desc" v-model="form.description" :placeholder="$t('feature.descPlaceholder')" />
          </FieldStack>
        </FormStack>
      </form>
    </DialogBody>
    <DialogFooter class="gap-2 sm:justify-between">
      <div class="flex gap-2">
        <DialogClose as-child>
          <Button type="button" variant="ghost">{{ $t('common.cancel') }}</Button>
        </DialogClose>
        <Button type="submit" form="feature-form" :disabled="!canSubmit || isSaving">
          {{ $t('common.create') }}
        </Button>
      </div>
    </DialogFooter>
  </DialogPanel>
</Dialog>
```

## 弹窗表单尺寸与排布规则（MEMOH-126）

弹窗内的表单统一遵守以下定量规则，调用方不得自行指定像素宽度或标签字号：

1. **所有表单弹窗统一使用 `md`（448px）宽度档**：无论是几个短字段（重命名、添加设备）、8 个字段的长表单，还是带多行自由文本的表单（如问题反馈），一律使用 `DialogPanel width="md"`（448px）；`FormDialogShell` 默认同样对齐到 `sm:max-w-md`（448px）。在 448px 宽度下，`Textarea` 每行仍可容纳约 28 个汉字，而 512px（`lg`）与周围其他表单并排时会显得松散拉长。
2. **`maxWidthClass` 仅作有明确理由的逃生口**：使用逃生口时必须说明原因，且只准使用宽度档位 Token（`sm:max-w-*`），严禁传任意像素值。
3. **弹窗宽度绝不随运行期内容动态变化**：打开弹窗后异步加载数据（如工单历史列表）不得触发弹窗宽度跳变（否则打开瞬间会从中间向两侧抽动）；若宽度取决于是否有历史数据，需提前预取列表或固定初始宽度档。
4. **输入控件撑满所在列**：表单内的输入框和选择器默认填满表单列宽，不为单个字段按预期字数手写窄宽度。
5. **默认不标必填星号（`*`），选填项在标签后标 `(选填)`**：
   - 用户打开登录、注册、反馈或新建弹窗时，天然清楚哪些核心项必填，提交时校验也会明确指出漏填项。因此 `FieldStack` 的 `required` 默认关闭（`false`），且页面顶部绝不写“标 `*` 的为必填项”图例。
   - 仅当同一个表单内必填项与选填项大量混排、用户单看外观无法区分时，才显式开启 `FieldStack required`；少量选填项则在标签文字旁加静音的 `({{ $t('common.optional') }})`（写在 Label 上，绝不塞进 Placeholder）。

## 校验时机：提交时报错，失焦不闪红

用户仅仅点击进入某个必填框、还没填就切去别处时，**严禁立刻把输入框闪成红框或弹出“此项必填”**。在一个只有两三个输入框的弹窗或登录页上，用户一眼就能看见框是空的，失焦即报错属于过度打扰。

- 真实结构校验一律使用 `vee-validate` + Zod schema，在**提交（submit）**时触发并把错误展示在对应字段下方（`FieldStack` 会自动接管 `<FormField>` 的错误渲染，报错文案必须配齐 `en`/`zh`/`ja` 三语）。
- 主提交按钮通过 `canSubmit` 控制启用，在用户尝试提交或输入明显非法格式时才给出具体提示。
- 推而广之：所有外部组件信号都应保持克制，不要让组件在用户尚未操作完毕时大声报错。

## 焦点跟随任务（多步流与视图切换）

当界面因用户点击“下一步 / 继续 / 编辑 / 返回”或弹窗视图切换而进入新一步，且新一步的核心任务是输入文字时，**必须把键盘焦点直接落在该步的首个输入控件上**，不能留在刚才点击的按钮上，也不能悬空丢失。用户已经决定往下走，不应再逼他伸手点一下输入框才能打字。

- **进入新输入步骤时主动 `focus()`**：原生 HTML `autofocus` 只在首次文档加载时生效，对 `v-if` 切换或步骤组件挂载无效。必须在步骤切换处（如 `onContinue`、弹窗 `view-swap` 进入表单态）配合 `nextTick` 调用编程式 `focus()`。
- **点“返回 / 修改”退回上一步时同样聚焦原输入框**：例如从密码步点“修改邮箱”退回账号步，直接聚焦邮箱输入框，方便用户立即修改。
- **穿透包装组件聚焦真实 `<input>`**：若控件是复合封装（如 `PasswordInput`、`InputGroup`），给内部真实 `<input>` 挂稳定的 `id` 再聚焦，对最外层包装 `<div>` 调 `focus()` 没有任何效果。
- **不搞全局焦点管理器，也不在后台重绘时抢焦点**：只在明确的路径跳转函数里做局部聚焦；没有多步切换的普通页面只需合理设置初始焦点，且流式更新或后台刷新绝不能打断用户正在输入的焦点。

## 同行等高、按钮尺寸阶梯与选择器触发器

1. **同一视觉行上的所有控件必须等高**：搜索框配“新增”按钮、下拉框配操作按钮时，高度必须严丝合缝对齐（用同尺寸档位的 `InputGroup` 配 `Button`）。列表不足 8 条时可隐藏搜索框（4 条数据配搜索框纯属噪音）。
2. **同行描述切换不得撑跳行高**：`SettingsRow` 的 `:description` 若随右侧 `SegmentedControl` 的选中值动态切换文案，长文案折成两行会导致整行连同右侧控件在点击瞬间上下跳动。遇到这种情况直接精简各状态文案使其保持单行，不要去拆行或锁死双行高度。静态长文案自然折行则不受此限。
3. **不摆互相打架的双重控件**：同一个过滤维度不能同时放一个“时间范围预设下拉”和一个关系不明的“自定义日期选择器”；要么合二为一，要么显式联动。
4. **按钮与控件尺寸按场景选档（默认 `h-9` 是常态）**：

   | 所处场景 | 应选尺寸档位 |
   |---|---|
   | 表单底栏、弹窗操作按钮、任何主操作（Primary CTA） | **默认档（`h-9`，36px）**——底栏严禁用半高扁平的 `sm` 按钮 |
   | 页面级独立操作（标题栏“新建…”、分组右上角操作） | **默认档（`h-9`，36px）** |
   | 空间确实局促**且**属于次要操作（密集工具栏、输入框内按钮、长列表行内操作） | `sm`（`h-8`，32px） |
   | 纯图标操作 | 工具栏/独立操作用 `icon`（36px）；密集行内用 `icon-sm`（32px） |
   | 极少数刻意突出的主视觉转化按钮 | `lg`（`h-10`，40px） |

5. **选择器触发器（Select Trigger）绝不是 `<Button>`**：使用共享的 `selectTriggerClass` 或 `Select` / `Combobox` / `SearchableSelectPopover` 自带的默认触发器，**严禁往触发器插槽里塞 `<Button variant="outline">`**。按钮带有按压缩放（press-scale），在全宽或较宽的下拉框上按下会导致整个框左右抽动，破坏输入字段类的平静语言。
