import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

// Alert = a NEUTRAL framed message whose semantic reads through the TEXT layer:
// every variant keeps the same `bg-background` + `border-border` frame and only
// the title/icon color changes in place (§ The one rule — one layer changing,
// nothing stacked). The tinted-surface sibling is `CalloutBanner`, which owns
// the soft fill + matching border triplet (`--*-soft` / `--*-border`) for an
// interruptive lifecycle notice; keeping the two distinct is what stops "status
// message" from having two competing looks.
//
// Token rung, and why it differs per hue: `--destructive` is dark enough
// (L≈0.58) to be body text on the page surface, but `--success` (L≈0.62) and
// `--warning` (L≈0.72) are not — they are icon/fill hues. Their readable-text
// rung is `--*-foreground` (L≈0.33 / 0.43 light, ~0.82 dark), which is exactly
// the role that token was minted for (CalloutBanner uses the same one). Do NOT
// swap in the base hue to "match destructive" — that trades legibility for a
// symmetry the palette does not have. `--*-solid-foreground` is the other
// direction (text ON a filled chip) and never applies here.
//
// New rungs deliberately do NOT copy destructive's
// `*:data-[slot=alert-description]:text-destructive/90` description tint: a
// hand-written `/NN` alpha on a semantic color is § Alpha policy debt (that one
// line is grandfathered, not a pattern). The description stays
// `text-muted-foreground` from AlertDescription — the hue signals once, in the
// title/icon, and the body copy stays maximally readable.
export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-body grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        success: 'text-success-foreground bg-background border-border',
        warning: 'text-warning-foreground bg-background border-border',
        destructive:
          'text-destructive bg-background border-border [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type AlertVariants = VariantProps<typeof alertVariants>

// Single source of truth for the variant axis. cva 0.7.1 does not expose its
// `.config` at runtime, so the keys are mirrored here next to the cva call
// (keep them in sync) — consumed by the showcase spec so its controls panel
// never hand-maintains its own list (badgeVariantKeys precedent).
export const alertVariantKeys = [
  'default',
  'success',
  'warning',
  'destructive',
] as const satisfies readonly NonNullable<AlertVariants['variant']>[]
