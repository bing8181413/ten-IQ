export type AnalyticsEvent =
  | { name: 'market_opened'; marketId: string }
  | { name: 'outcome_selected'; marketId: string; outcomeId: string }
  | { name: 'trade_previewed'; marketId: string; outcomeId: string; amount: number }
  | { name: 'search_submitted'; query: string }
  | { name: 'filter_changed'; filter: string; value: string };
export function track(event: AnalyticsEvent) {
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') return;
  console.info('[analytics]', event);
}
