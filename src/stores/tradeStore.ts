import { create } from 'zustand';
type TradeSide = 'buy' | 'sell';
interface TradeState {
  side: TradeSide;
  outcomeId: string | null;
  amount: number;
  setSide: (side: TradeSide) => void;
  selectOutcome: (id: string) => void;
  setAmount: (amount: number) => void;
  reset: () => void;
}
const initial = { side: 'buy' as const, outcomeId: null, amount: 25 };
export const useTradeStore = create<TradeState>((set) => ({
  ...initial,
  setSide: (side) => set({ side }),
  selectOutcome: (outcomeId) => set({ outcomeId }),
  setAmount: (amount) => set({ amount: Number.isFinite(amount) ? Math.max(0, amount) : 0 }),
  reset: () => set(initial),
}));
