<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { SegmentedControl } from '#/components/segmented'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '#/components/select'
import { PageShell, SettingsRow, SettingsSection } from '#/components/settings'
import { Switch } from '#/components/switch'
import { tt } from '../../lib/i18n'

// Examples / Settings — a whole-page specimen of the classic product settings
// surface, composed ONLY from the library's owner vocabulary (PageShell /
// SettingsSection / SettingsRow + the controls themselves). This page is the
// shared testbed for the library-wide cursor / motion / width passes: those
// rounds are judged on a real surface, not on single-component playgrounds.
//
// Two deliberate rules, do not "fix" them:
// 1. NO width is pinned on any control. The page renders every control at its
//    library default (Select trigger is w-fit, Input is w-full, …) on purpose —
//    exposing the current defaults in a real row layout is the point of the
//    width pass. If a row looks wrong, the fix belongs in the library, not in
//    a class on this page.
// 2. Overlays are uncontrolled (each Select owns its open state) and all state
//    is local refs — this is an interaction specimen, not a data demo.
//
// Copy is bilingual via tt() and deliberately generic: the page must read as
// "any product's settings", so strings name no concrete product.

const language = ref('default')
const themeItems = computed(() => [
  { value: 'system', label: tt('System', '跟随系统') },
  { value: 'light', label: tt('Light', '浅色') },
  { value: 'dark', label: tt('Dark', '深色') },
])
const theme = ref('system')
const notifications = ref(true)
const autosuggest = ref(true)
const model = ref('auto')
const imageGeneration = ref(false)
const displayName = ref('Felinic')
const inlineDisplayName = ref('Felinic')
</script>

<template>
  <PageShell
    :title="tt('Settings', '设置')"
    width="md"
  >
    <div class="flex flex-col gap-8">
      <SettingsSection :title="tt('Preferences', '偏好')">
        <SettingsRow
          :label="tt('Language', '语言')"
          :description="tt('The language the interface displays in', '界面显示的语言')"
        >
          <Select v-model="language">
            <SelectTrigger
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="end"
              :align-offset="0"
            >
              <SelectItem value="default">
                <SelectItemText>Default</SelectItemText>
              </SelectItem>
              <SelectItem value="en">
                <SelectItemText>English</SelectItemText>
              </SelectItem>
              <SelectItem value="zh">
                <SelectItemText>中文</SelectItemText>
              </SelectItem>
              <SelectItem value="ja">
                <SelectItemText>日本語</SelectItemText>
              </SelectItem>
              <!-- Long fake languages: stress data so the menu widens far past
                   the trigger and the align="end" trial is actually visible. -->
              <SelectItem value="ro">
                <SelectItemText>română (România)</SelectItemText>
              </SelectItem>
              <SelectItem value="sk">
                <SelectItemText>slovenčina (Slovensko)</SelectItemText>
              </SelectItem>
              <SelectItem value="sr-cyrl">
                <SelectItemText>српски (ћирилица, Црна Гора)</SelectItemText>
              </SelectItem>
              <SelectItem value="sv">
                <SelectItemText>svenska (Sverige)</SelectItemText>
              </SelectItem>
              <SelectItem value="ta">
                <SelectItemText>தமிழ் (இந்தியா)</SelectItemText>
              </SelectItem>
              <!-- Short-value stress set: extreme narrow values against the
                   long ones above, so the width/animation pass can be judged
                   across the full text-length range in one menu. -->
              <SelectItem value="el">
                <SelectItemText>ελ</SelectItemText>
              </SelectItem>
              <SelectItem value="id">
                <SelectItemText>ID</SelectItemText>
              </SelectItem>
              <SelectItem value="ms">
                <SelectItemText>ms</SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow :label="tt('Theme', '主题')">
          <SegmentedControl
            v-model="theme"
            :items="themeItems"
            :aria-label="tt('Theme', '主题')"
          />
        </SettingsRow>
        <SettingsRow
          :label="tt('Notifications', '通知')"
          :description="tt('Get notified when a task finishes or needs your input', '任务完成或需要你处理时收到通知')"
        >
          <Switch v-model="notifications" />
        </SettingsRow>
        <SettingsRow
          :label="tt('Autosuggest', '输入建议')"
          :description="tt('Show suggestions while you type', '输入时显示建议')"
        >
          <Switch v-model="autosuggest" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection :title="tt('Model', '模型')">
        <SettingsRow
          :label="tt('Default model', '默认模型')"
          :description="tt('The model used for new conversations', '新对话使用的模型')"
        >
          <Select v-model="model">
            <SelectTrigger
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="end"
              :align-offset="0"
            >
              <SelectItem value="auto">
                <SelectItemText>Auto</SelectItemText>
              </SelectItem>
              <SelectItem value="fast">
                <SelectItemText>Fast</SelectItemText>
              </SelectItem>
              <SelectItem value="thinking">
                <SelectItemText>Thinking</SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow
          :label="tt('Image generation', '图像生成')"
          :description="tt('Allow the model to generate images', '允许模型生成图像')"
        >
          <Switch v-model="imageGeneration" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection :title="tt('Account', '账户')">
        <SettingsRow
          :label="tt('Display name', '显示名称')"
          stack="sm"
        >
          <Input v-model="displayName" />
        </SettingsRow>
        <SettingsRow :label="tt('Password', '密码')">
          <Button
            variant="outline"
            size="sm"
          >
            {{ tt('Change', '修改') }}
          </Button>
        </SettingsRow>
        <SettingsRow
          :label="tt('Delete account', '删除账户')"
          :description="tt('This action is irreversible', '此操作不可撤销')"
        >
          <Button
            variant="destructive"
            size="sm"
          >
            {{ tt('Delete', '删除') }}
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection :title="tt('Inline controls', '同行控件')">
        <SettingsRow
          :label="tt('Display name', '显示名称')"
          stack="sm"
        >
          <div class="flex min-w-0 items-center gap-2">
            <Input
              v-model="inlineDisplayName"
              size="sm"
              :aria-label="tt('Inline display name', '同行显示名称')"
            />
            <Button
              size="sm"
              variant="outline"
            >
              {{ tt('Save', '保存') }}
            </Button>
          </div>
        </SettingsRow>
      </SettingsSection>
    </div>
  </PageShell>
</template>
