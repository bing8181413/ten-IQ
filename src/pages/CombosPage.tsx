import { useMemo, useState } from 'react';
import { Check, Layers3, Minus, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { FreshnessNotice } from '@/components/ui/FreshnessNotice';
import { useComboLegs } from '@/hooks/useProductData';
import { useProductPreview } from '@/hooks/useProductPreview';
import { cn } from '@/lib/cn';

export function CombosPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['esp', 'atl']);
  const [amount, setAmount] = useState('10');
  const previewMutation = useProductPreview();
  const comboQuery = useComboLegs();
  const comboLegs = comboQuery.data?.data ?? [];
  const selected = comboLegs.filter((leg) => selectedIds.includes(leg.id));
  const combinedProbability = useMemo(
    () => selected.reduce((value, leg) => value * (leg.probability / 100), 1) * 100,
    [selected],
  );
  const multiplier = combinedProbability > 0 ? 100 / combinedProbability : 0;
  const amountValue = Number(amount) || 0;

  function toggle(id: string) {
    previewMutation.reset();
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 4
          ? current
          : [...current, id],
    );
  }

  return (
    <div className="pm-shell py-5 pb-24 md:pb-10">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand">
          <Layers3 aria-hidden="true" size={16} /> 组合
        </div>
        <h1 className="mt-1 text-2xl font-bold text-foreground">将多个体育观点合并为一个组合</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          每一项都判断正确时组合才成立。当前仅提供可计算的演示预览，不会提交资金或真实订单。
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0" aria-labelledby="combo-options-title">
          {comboQuery.data?.meta ? (
            <FreshnessNotice
              stale={comboQuery.data.meta.stale}
              updatedAt={comboQuery.data.meta.updatedAt}
              onRefresh={() => void comboQuery.refetch()}
            />
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <h2 id="combo-options-title" className="text-lg font-bold text-foreground">
              选择组合项
            </h2>
            <span className="text-xs font-semibold text-muted">已选择 {selected.length} / 4</span>
          </div>
          {comboQuery.isLoading ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2" aria-busy="true">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-36" />
              ))}
            </div>
          ) : comboQuery.isError ? (
            <ErrorState onRetry={() => void comboQuery.refetch()} />
          ) : comboLegs.length === 0 ? (
            <EmptyState title="暂无可组合项目" description="稍后重试或返回体育盘口。" />
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {comboLegs.map((leg) => {
                const active = selectedIds.includes(leg.id);
                const disabled = !active && selectedIds.length >= 4;
                return (
                  <Card key={leg.id} className={cn('p-4', active && 'border-brand')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-muted">{leg.league}</span>
                        <h3 className="mt-1 text-sm font-semibold text-foreground">{leg.title}</h3>
                      </div>
                      <span className="text-xl font-bold text-foreground tabular-nums">
                        {leg.probability}%
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-pressed={active}
                      disabled={disabled}
                      onClick={() => toggle(leg.id)}
                      className={cn(
                        'mt-4 flex h-10 w-full items-center justify-between rounded-control px-3 text-sm font-semibold',
                        active
                          ? 'bg-brand-soft text-brand'
                          : 'bg-surface-muted text-foreground disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    >
                      <span>{leg.outcome}</span>
                      {active ? (
                        <Check aria-hidden="true" size={16} />
                      ) : (
                        <Plus aria-hidden="true" size={16} />
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
          <Card className="mt-5 border-warning bg-warning-soft p-4">
            <div className="flex gap-3">
              <ShieldAlert aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-warning" />
              <p className="text-sm leading-6 text-warning">
                组合风险高于单项预测，任一结果不成立会使整个组合失败。显示概率按各项独立估算，未建模事件相关性，也不构成收益承诺。
              </p>
            </div>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-36 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">组合预览</h2>
              <span className="rounded-control bg-surface-muted px-2 py-1 text-xs font-semibold text-muted">
                {selected.length} 项
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {selected.map((leg) => (
                <div
                  key={leg.id}
                  className="flex items-center gap-3 rounded-control bg-surface-muted p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs text-muted">{leg.title}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{leg.outcome}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(leg.id)}
                    aria-label={`移除 ${leg.outcome}`}
                    className="text-subtle hover:text-negative"
                  >
                    <Minus aria-hidden="true" size={16} />
                  </button>
                </div>
              ))}
              {!selected.length ? (
                <p className="py-5 text-center text-sm text-muted">至少选择两项。</p>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-4">
              <ComboStat label="独立概率估算" value={`${combinedProbability.toFixed(1)}%`} />
              <ComboStat label="预估倍数" value={`${multiplier.toFixed(2)}x`} />
            </div>
            <label className="mt-4 block text-xs font-semibold text-muted" htmlFor="combo-amount">
              演示金额
            </label>
            <Input
              id="combo-amount"
              className="mt-2 text-lg font-bold tabular-nums"
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                previewMutation.reset();
              }}
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">可能返回</span>
              <span className="font-bold text-foreground tabular-nums">
                ${(amountValue * multiplier).toFixed(2)}
              </span>
            </div>
            <Button
              className="mt-4"
              fullWidth
              disabled={selected.length < 2 || amountValue <= 0 || previewMutation.isPending}
              onClick={() =>
                previewMutation.mutate({ kind: 'combo', legIds: selectedIds, amount: amountValue })
              }
            >
              {previewMutation.isPending ? '正在生成预览…' : '预览组合'}
            </Button>
            {previewMutation.data ? (
              <p
                role="status"
                className="mt-3 rounded-control bg-positive-soft p-3 text-sm font-semibold text-positive"
              >
                {previewMutation.data.data.summary}；预计演示返回 $
                {previewMutation.data.data.estimatedReturn.toFixed(2)}。不会提交真实订单。
              </p>
            ) : null}
            {previewMutation.isError ? (
              <p role="alert" className="mt-3 text-sm text-negative">
                {previewMutation.error.message}
              </p>
            ) : null}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ComboStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
