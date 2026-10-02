import type { ComponentSpec } from '../lib/spec'
import { accordionSpec } from './accordion'
import { actionCardSpec } from './action-card'
import { alertSpec } from './alert'
import { badgeSpec } from './badge'
import { buttonSpec } from './button'
import { cardSpec } from './card'
import { checkboxSpec } from './checkbox'
import { dialogSpec } from './dialog'
import { dropdownMenuSpec } from './dropdown-menu'
import { emptySpec } from './empty'
import { fieldSpec } from './field'
import { inputSpec } from './input'
import { inputGroupSpec } from './input-group'
import { nativeSelectSpec } from './native-select'
import { numberFieldSpec } from './number-field'
import { popoverSpec } from './popover'
import { segmentedSpec } from './segmented'
import { selectSpec } from './select'
import { sheetSpec } from './sheet'
import { skeletonSpec } from './skeleton'
import { sonnerSpec } from './sonner'
import { switchSpec } from './switch'
import { tabsSpec } from './tabs'
import { textareaSpec } from './textarea'
import { toggleSpec } from './toggle'
import { tooltipSpec } from './tooltip'

// Component specs are registered here as they land. Order = sidebar order =
// prev/next order. Single manifest drives nav + routes so the two never drift
// (same pattern as the dev wall's registry.ts). The 13 Reference components
// from AGENTS.md come first; the second batch groups display surfaces, then
// overlays. In-progress and legacy components follow.
export const componentSpecs: ComponentSpec[] = [
  buttonSpec,
  inputSpec,
  textareaSpec,
  selectSpec,
  nativeSelectSpec,
  checkboxSpec,
  switchSpec,
  numberFieldSpec,
  inputGroupSpec,
  fieldSpec,
  segmentedSpec,
  toggleSpec,
  actionCardSpec,
  badgeSpec,
  cardSpec,
  tabsSpec,
  accordionSpec,
  skeletonSpec,
  emptySpec,
  dialogSpec,
  sheetSpec,
  popoverSpec,
  dropdownMenuSpec,
  tooltipSpec,
  sonnerSpec,
  alertSpec,
]
