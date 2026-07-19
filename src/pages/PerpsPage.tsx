import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, BarChart3, Info } from 'lucide-react';
import { PerpsPriceChart } from '@/components/trading/PerpsPriceChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { perpsAssets } from '@/data/productPages';
import { cn } from '@/lib/cn';

export function PerpsPage() {
  const { symbol = 'sp500' } = useParams();
  const asset = perpsAssets.find((item) => item.symbol === symbol);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [amount, setAmount] = useState('');
  const [range, setRange] = useState('1天');
  const [previewed, setPreviewed] = useState(false);
  const estimated = useMemo(() => (Number(amount) || 0) / (asset?.price ?? 1), [amount, asset]);
  if (!asset) return <Navigate to="/zh/asset/sp500" replace />;

  return (
    <div className="pm-shell py-5 pb-24 md:pb-10">
      <div
        className="flex scrollbar-none gap-2 overflow-x-auto border-b border-border pb-4"
        aria-label="永续资产"
      >
        {perpsAssets.map((item) => (
          <Link
            key={item.symbol}
            to={`/zh/asset/${item.symbol}`}
            className={cn(
              'flex min-w-36 items-center gap-3 rounded-control border px-3 py-2',
              item.symbol === asset.symbol ? 'border-brand bg-brand-softer' : 'border-border',
            )}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-control bg-surface-muted text-xs font-bold">
              {item.icon}
            </span>
            <span>
              <span className="block text-xs font-semibold text-foreground">{item.name}</span>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  item.change >= 0 ? 'text-positive' : 'text-negative',
                )}
              >
                {item.change >= 0 ? '+' : ''}
                {item.change}%
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0" aria-label={`${asset.name} 市场数据`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-control bg-surface-muted text-sm font-bold">
                {asset.icon}
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground">{asset.name}</h1>
                <span className="text-xs text-muted">ten-IQ 永续价格演示</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                ${asset.price.toLocaleString('en-US')}
              </div>
              <div
                className={cn(
                  'mt-1 text-sm font-semibold tabular-nums',
                  asset.change >= 0 ? 'text-positive' : 'text-negative',
                )}
              >
                {asset.change >= 0 ? '+' : ''}
                {asset.change}% 24小时
              </div>
            </div>
          </div>
          <Card className="mt-5 overflow-hidden p-0">
            <PerpsPriceChart values={asset.values} />
            <div className="flex scrollbar-none gap-1 overflow-x-auto border-t border-border p-2">
              {['1小时', '4小时', '1天', '1周', '1月'].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={range === item}
                  onClick={() => setRange(item)}
                  className={cn(
                    'h-8 rounded-control px-3 text-xs font-semibold',
                    range === item
                      ? 'bg-brand-soft text-brand'
                      : 'text-muted hover:bg-surface-muted',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border">
            <AssetStat label="24小时最高" value={asset.high} />
            <AssetStat label="24小时最低" value={asset.low} />
            <AssetStat label="24小时成交量" value={asset.volume} />
          </div>
          <Card className="mt-4 p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <BarChart3 aria-hidden="true" size={17} /> 市场深度
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <DepthSide
                tone="positive"
                title="买盘"
                rows={['7,474.8 · 12.4K', '7,472.1 · 8.7K', '7,469.4 · 6.2K']}
              />
              <DepthSide
                tone="negative"
                title="卖盘"
                rows={['7,477.2 · 10.8K', '7,480.6 · 7.1K', '7,484.3 · 5.4K']}
              />
            </div>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-36 p-4">
            <h2 className="text-base font-bold text-foreground">交易 {asset.name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={side === 'long'}
                onClick={() => {
                  setSide('long');
                  setPreviewed(false);
                }}
                className={cn(
                  'h-10 rounded-control text-sm font-semibold',
                  side === 'long'
                    ? 'bg-positive-soft text-positive'
                    : 'bg-surface-muted text-muted',
                )}
              >
                <ArrowUp aria-hidden="true" className="mr-1 inline" size={15} />
                做多
              </button>
              <button
                type="button"
                aria-pressed={side === 'short'}
                onClick={() => {
                  setSide('short');
                  setPreviewed(false);
                }}
                className={cn(
                  'h-10 rounded-control text-sm font-semibold',
                  side === 'short'
                    ? 'bg-negative-soft text-negative'
                    : 'bg-surface-muted text-muted',
                )}
              >
                <ArrowDown aria-hidden="true" className="mr-1 inline" size={15} />
                做空
              </button>
            </div>
            <label htmlFor="perps-amount" className="mt-4 block text-xs font-semibold text-muted">
              演示金额
            </label>
            <Input
              id="perps-amount"
              className="mt-2 text-lg font-bold"
              inputMode="decimal"
              placeholder="$0"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setPreviewed(false);
              }}
            />
            <div className="mt-4 space-y-2 border-y border-border py-4 text-sm">
              <TradeRow label="参考价格" value={`$${asset.price.toLocaleString('en-US')}`} />
              <TradeRow label="预计数量" value={estimated.toFixed(5)} />
              <TradeRow label="演示杠杆" value="1x" />
            </div>
            <Button
              className="mt-4"
              fullWidth
              disabled={(Number(amount) || 0) <= 0}
              onClick={() => setPreviewed(true)}
            >
              预览{side === 'long' ? '做多' : '做空'}
            </Button>
            {previewed ? (
              <p
                role="status"
                className="mt-3 rounded-control bg-positive-soft p-3 text-sm font-semibold text-positive"
              >
                演示永续意图已生成，不会提交资金或订单。
              </p>
            ) : null}
            <p className="mt-4 flex gap-2 text-xs leading-5 text-muted">
              <Info aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
              不连接钱包，不提供真实杠杆、清算或托管功能。
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AssetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
function TradeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}
function DepthSide({
  tone,
  title,
  rows,
}: {
  tone: 'positive' | 'negative';
  title: string;
  rows: string[];
}) {
  return (
    <div>
      <div
        className={cn(
          'text-xs font-semibold',
          tone === 'positive' ? 'text-positive' : 'text-negative',
        )}
      >
        {title}
      </div>
      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <div
            key={row}
            className="rounded-control bg-surface-muted px-3 py-2 text-right text-xs font-semibold text-foreground tabular-nums"
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
