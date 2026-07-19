import * as Tabs from '@radix-ui/react-tabs';
import { Card } from '@/components/ui/Card';
import type { Market } from '@/types/market';
export function MarketTabs({ market }: { market: Market }) {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="市场详情" className="flex gap-1 border-b border-border">
        <Tab value="overview">概览</Tab>
        <Tab value="rules">规则</Tab>
        <Tab value="activity">动态</Tab>
      </Tabs.List>
      <Tabs.Content value="overview" className="pt-3">
        <Card className="p-5">
          <h2 className="text-base font-semibold">市场说明</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{market.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info title="结算来源" value={market.resolutionSource} />
            <Info title="异常处理" value="遵循发布前确认的市场规则与争议流程" />
          </div>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="rules" className="pt-3">
        <Card className="p-5">
          <h2 className="text-base font-semibold">结算规则</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
            <li>截止时间以市场详情中展示的时间为准。</li>
            <li>结果由“{market.resolutionSource}”确认。</li>
            <li>真实产品必须补充争议、延期、数据中断和退款规则。</li>
          </ol>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="activity" className="pt-3">
        <Card className="p-5">
          <h2 className="text-base font-semibold">市场动态</h2>
          <p className="mt-3 text-sm text-muted">暂无公开动态。接入后端后从 Activity API 加载。</p>
        </Card>
      </Tabs.Content>
    </Tabs.Root>
  );
}
function Tab({ value, children }: { value: string; children: string }) {
  return (
    <Tabs.Trigger
      value={value}
      className="border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground data-[state=active]:border-brand data-[state=active]:text-foreground"
    >
      {children}
    </Tabs.Trigger>
  );
}
function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-control bg-surface-muted p-3">
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
