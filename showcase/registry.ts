import type { Component } from 'vue'
import type { ComponentSpec } from './lib/spec'
import { componentSpecs } from './specs'
import ColorsPage from './pages/foundations/ColorsPage.vue'
import ElevationPage from './pages/foundations/ElevationPage.vue'
import IconsPage from './pages/foundations/IconsPage.vue'
import LayersPage from './pages/foundations/LayersPage.vue'
import MarkdownPage from './pages/foundations/MarkdownPage.vue'
import MotionPage from './pages/foundations/MotionPage.vue'
import RadiusPage from './pages/foundations/RadiusPage.vue'
import SpacingPage from './pages/foundations/SpacingPage.vue'
import TypographyPage from './pages/foundations/TypographyPage.vue'
import OverviewPage from './pages/OverviewPage.vue'

// Single manifest: drives the sidebar groups, the hash routes, AND prev/next
// order — one list, three consumers, so they can never drift.
// Titles are English (the canonical component/page names); titleZh is the
// localized twin rendered by the zh locale — component pages stay English-only
// on purpose (they're API names, not prose).
export type PageEntry =
  | { kind: 'static', id: string, title: string, titleZh?: string, component: Component }
  | { kind: 'component', id: string, title: string, titleZh?: string, spec: ComponentSpec }

export interface NavGroup {
  id: string
  label: string
  labelZh: string
  pages: PageEntry[]
}

function foundation(id: string, title: string, titleZh: string, component: Component): PageEntry {
  return { kind: 'static', id: `foundations/${id}`, title, titleZh, component }
}

export const navGroups: NavGroup[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    labelZh: '基础',
    pages: [
      { kind: 'static', id: 'overview', title: 'Overview', titleZh: '概览', component: OverviewPage },
      foundation('colors', 'Colors', '颜色', ColorsPage),
      foundation('typography', 'Typography', '字体', TypographyPage),
      foundation('markdown', 'Markdown body', '正文渲染', MarkdownPage),
      foundation('spacing', 'Spacing', '间距', SpacingPage),
      foundation('radius', 'Radius', '圆角', RadiusPage),
      foundation('elevation', 'Elevation', '阴影', ElevationPage),
      foundation('motion', 'Motion', '动效', MotionPage),
      foundation('layers', 'Layers', '层级', LayersPage),
      foundation('icons', 'Icons', '图标', IconsPage),
    ],
  },
  {
    id: 'components',
    label: 'Components',
    labelZh: '组件',
    pages: componentSpecs.map(spec => ({
      kind: 'component',
      id: `components/${spec.id}`,
      title: spec.name,
      spec,
    })),
  },
]

export const flatPages: PageEntry[] = navGroups.flatMap(g => g.pages)

export function pageById(id: string): PageEntry | undefined {
  return flatPages.find(p => p.id === id)
}
