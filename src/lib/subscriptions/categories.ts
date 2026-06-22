import { SUBSCRIPTION_CATEGORIES, type SubscriptionCategory } from "@/config/app";

/**
 * Stable color per category, mapped to the themed `--chart-*` CSS variables so
 * the donut and badges stay consistent in light and dark mode. Returns an
 * `hsl(var(--chart-N))` string the browser resolves against the active theme.
 */
export function categoryColorVar(category: SubscriptionCategory): string {
  const index = SUBSCRIPTION_CATEGORIES.indexOf(category);
  const slot = (index < 0 ? 0 : index) % 7;
  return `hsl(var(--chart-${slot + 1}))`;
}
