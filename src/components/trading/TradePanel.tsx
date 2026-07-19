import { CheckCircle2, Info, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MarketAvatar } from '@/components/market/MarketAvatar';
import { cn } from '@/lib/cn';
import { useTradePreview } from '@/hooks/useTradePreview';
import { track } from '@/lib/analytics';
import { useTradeStore } from '@/stores/tradeStore';
import type { Market } from '@/types/market';
export function TradePanel({ market }: { market: Market }) {
  const { side, outcomeId, amount, setSide, selectOutcome, setAmount } = useTradeStore();
  const previewMutation = useTradePreview();
  const selected =
    market.outcomes.find((outcome) => outcome.id === outcomeId) ?? market.outcomes[0];
  const preview = previewMutation.data?.data;
  function resetPreview() {
    previewMutation.reset();
  }
  return (
    <Card className="sticky top-[132px] overflow-hidden rounded-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <MarketAvatar icon={market.icon} className="size-10" />
        <div className="min-w-0">
          <div className="truncate text-xs text-muted">{market.title}</div>
          <div className="mt-0.5 text-sm font-bold text-foreground">{selected?.label}</div>
        </div>
      </div>
      <div
        className="grid grid-cols-2 border-b border-border bg-surface px-4"
        role="group"
        aria-label="交易方向"
      >
        {(['buy', 'sell'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={side === value}
            onClick={() => {
              setSide(value);
              resetPreview();
            }}
            className={cn(
              'border-b-2 py-3 text-sm font-semibold',
              side === value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted',
            )}
          >
            {value === 'buy' ? '买入' : '卖出'}
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">选择结果</p>
          <span className="text-xs text-muted">市场价格</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {market.outcomes.slice(0, 2).map((outcome) => (
            <button
              key={outcome.id}
              type="button"
              aria-pressed={selected?.id === outcome.id}
              onClick={() => {
                selectOutcome(outcome.id);
                resetPreview();
              }}
              className={cn(
                'flex min-h-12 w-full items-center justify-center gap-1 rounded-control border px-3 text-sm font-semibold transition-colors',
                selected?.id === outcome.id
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border bg-surface text-foreground hover:border-border-strong',
              )}
            >
              <span>{outcome.label}</span>
              <strong className="tabular-nums">{outcome.probability.toFixed(1)}%</strong>
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm font-semibold" htmlFor="trade-amount">
          {side === 'buy' ? '演示金额' : '卖出份额（演示持仓最多 250）'}
        </label>
        <div className="relative mt-2">
          {side === 'buy' ? (
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
              $
            </span>
          ) : null}
          <Input
            id="trade-amount"
            aria-label={side === 'buy' ? '演示金额' : '卖出份额'}
            inputMode="decimal"
            value={amount ? String(amount) : ''}
            placeholder={side === 'buy' ? '0.00' : '0'}
            onChange={(event) => {
              resetPreview();
              setAmount(Number(event.target.value));
            }}
            className={cn(
              'h-16 border-0 pr-16 text-right text-3xl font-semibold tabular-nums shadow-none',
              side === 'buy' ? 'pl-7' : 'pl-3',
            )}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-muted">
            {side === 'buy' ? 'USDC' : '份'}
          </span>
        </div>
        <div className="mt-2 flex justify-end gap-1.5">
          {[1, 5, 10, 100].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                resetPreview();
                setAmount(amount + value);
              }}
              className="min-h-8 rounded-control border border-border px-2.5 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-foreground"
            >
              +{side === 'buy' ? `$${value}` : `${value}份`}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-control bg-surface-muted p-3 text-xs">
          <div className="flex justify-between text-muted">
            <span>{side === 'buy' ? '预计份额' : '卖出份额'}</span>
            <strong className="text-foreground tabular-nums">
              {preview ? preview.estimatedShares.toFixed(2) : '由模拟服务计算'}
            </strong>
          </div>
          <div className="mt-2 flex justify-between text-muted">
            <span>{side === 'buy' ? '最高演示回报' : '预计演示到账'}</span>
            <strong className="text-foreground tabular-nums">
              {preview ? `$${preview.maxPayout.toFixed(2)}` : '—'}
            </strong>
          </div>
        </div>
        <Button
          fullWidth
          className="mt-4"
          disabled={!selected || amount <= 0 || previewMutation.isPending}
          onClick={() => {
            if (!selected || amount <= 0) return;
            track({ name: 'trade_previewed', marketId: market.id, outcomeId: selected.id, amount });
            previewMutation.mutate({
              marketId: market.id,
              outcomeId: selected.id,
              side,
              amount,
            });
          }}
        >
          <LockKeyhole aria-hidden="true" size={16} />
          {previewMutation.isPending ? '正在生成演示预览…' : '预览交易'}
        </Button>
        {preview ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-control bg-positive-soft p-3 text-xs leading-5 text-positive"
          >
            <CheckCircle2 aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
            演示预览 {preview.id} 已生成：{side === 'buy' ? '买入' : '卖出'} {selected?.label}，
            {side === 'buy' ? '金额' : '份额'} {preview.amount.toFixed(2)}
            {side === 'buy' ? ' USDC' : ' 份'}。不会提交资金或真实订单。
          </div>
        ) : null}
        {previewMutation.isError ? (
          <p
            role="alert"
            className="mt-3 rounded-control bg-negative-soft p-3 text-xs text-negative"
          >
            {previewMutation.error.message || '演示预览失败，请重试。'}
          </p>
        ) : null}
        <p className="mt-3 flex gap-2 text-xs leading-5 text-muted">
          <Info aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          此仓库只演示交互和接口边界，不包含钱包签名、资金托管或真实下单。
        </p>
      </div>
    </Card>
  );
}
