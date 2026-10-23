import type { tooltipSideKeys } from '../tooltip'

export { default as InfoHint } from './InfoHint.vue'

// The hint opens through Tooltip, so its sides are Tooltip's.
export type InfoHintSide = typeof tooltipSideKeys[number]
