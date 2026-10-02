// Structural edge of a card-colored surface (settings section, framed tile,
// table container, object card). Light mode draws the `--border` hairline; in
// dark mode the bg-card fill already separates from the page background, so the
// hairline is dropped — a white line on a dark card reads as stacked chrome.
// `bordered` keeps the edge for a surface nested inside another card-colored
// surface (a dialog body, a card within a card), where fill contrast is gone.
//
// This is the only home of that rule: every card owner composes it instead of
// writing its own `dark:border-0`, so a new card cannot silently miss it.
//
// Only the edge WIDTH is set here. The color is `--border` from the base layer
// (`* { @apply border-border }`), and ActionCard animates that color in
// style.css — a `border-border` utility here would outrank and freeze it.
export function surfaceEdgeClass(bordered = false): string {
  return bordered ? 'border' : 'border dark:border-0'
}
