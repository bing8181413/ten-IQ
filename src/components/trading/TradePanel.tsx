import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { CheckCircle2, Info, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import { useTradeStore } from '@/stores/tradeStore';
import type { Market } from '@/types/market';
export function TradePanel({ market }: { market: Market }) {
  const { side, outcomeId, amount, setSide, selectOutcome, setAmount } = useTradeStore();
  const [previewed, setPreviewed] = useState(false);
  const selected =
    market.outcomes.find((outcome) => outcome.id === outcomeId) ?? market.outcomes[0];
  const price = Math.max((selected?.probability ?? 1) / 100, 0.01);
  const estimated = amount / price;
  return (
    <Card className="sticky top-[132px] overflow-hidden rounded-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <span className="inline-flex size-10 items-center justify-center rounded-control bg-brand-soft text-sm font-bold text-brand">
          {market.icon}
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs text-muted">{market.title}</div>
          <div className="mt-0.5 text-sm font-bold text-foreground">{selected?.label}</div>
        </div>
      </div>
      <Tabs.Root value={side} onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
        <Tabs.List
          className="grid grid-cols-2 border-b border-border bg-surface px-4"
          aria-label="交易方向"
        >
          <Tabs.Trigger
            value="buy"
            className="border-b-2 border-transparent py-3 text-sm font-semibold text-muted data-[state=active]:border-foreground data-[state=active]:text-foreground"
          >
            买入
          </Tabs.Trigger>
          <Tabs.Trigger
            value="sell"
            className="border-b-2 border-transparent py-3 text-sm font-semibold text-muted data-[state=active]:border-foreground data-[state=active]:text-foreground"
          >
            卖出
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">选择结果</p>
          <span className="text-xs text-muted">市场价格</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {market.outcomes.slice(0, 2).map((outcome, index) => (
            <button
              key={outcome.id}
              type="button"
              aria-pressed={selected?.id === outcome.id}
              onClick={() => selectOutcome(outcome.id)}
              className={cn(
                'flex min-h-12 w-full items-center justify-center gap-1 rounded-control border px-3 text-sm font-semibold transition-colors',
                selected?.id === outcome.id
                  ? index === 0
                    ? 'border-positive bg-positive text-white'
                    : 'border-negative bg-negative-soft text-negative'
                  : 'border-border bg-surface text-foreground hover:border-border-strong',
              )}
            >
              <span>{outcome.label}</span>
              <strong className="tabular-nums">{outcome.probability.toFixed(1)}%</strong>
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm font-semibold" htmlFor="trade-amount">
          金额
        </label>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
            $
          </span>
          <Input
            id="trade-amount"
            aria-label="金额"
            inputMode="decimal"
            value={amount ? String(amount) : ''}
            placeholder="0"
            onChange={(event) => {
              setPreviewed(false);
              setAmount(Number(event.target.value));
            }}
            className="h-16 border-0 pr-16 pl-7 text-right text-3xl font-semibold tabular-nums shadow-none"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-muted">
            USDC
          </span>
        </div>
        <div className="mt-2 flex justify-end gap-1.5">
          {[1, 5, 10, 100].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPreviewed(false);
                setAmount(amount + value);
              }}
              className="min-h-8 rounded-control border border-border px-2.5 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-foreground"
            >
              +${value}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-control bg-surface-muted p-3 text-xs">
          <div className="flex justify-between text-muted">
            <span>预计份额</span>
            <strong className="text-foreground tabular-nums">{estimated.toFixed(2)}</strong>
          </div>
          <div className="mt-2 flex justify-between text-muted">
            <span>最高回报</span>
            <strong className="text-foreground tabular-nums">${estimated.toFixed(2)}</strong>
          </div>
        </div>
        <Button
          fullWidth
          className="mt-4"
          disabled={!selected || amount <= 0}
          onClick={() => {
            if (!selected || amount <= 0) return;
            track({ name: 'trade_previewed', marketId: market.id, outcomeId: selected.id, amount });
            setPreviewed(true);
          }}
        >
          <LockKeyhole aria-hidden="true" size={16} />
          预览交易
        </Button>
        {previewed ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-control bg-positive-soft p-3 text-xs leading-5 text-positive"
          >
            <CheckCircle2 aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
            演示订单已生成，不会提交资金或真实订单。
          </div>
        ) : null}
        <p className="mt-3 flex gap-2 text-xs leading-5 text-muted">
          <Info aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          此仓库只演示交互和接口边界，不包含钱包签名、资金托管或真实下单。
        </p>
      </div>
    </Card>
  );
}
