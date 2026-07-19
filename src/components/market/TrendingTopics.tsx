import { Link } from 'react-router-dom';

export function TrendingTopics() {
  return (
    <div>
      <div className="pm-combo-card relative p-4">
        <div className="pm-combo-beta absolute top-5 right-6 text-xs font-semibold">测试版</div>
        <div className="pm-combo-content">
          <div className="pm-stack-icon" aria-hidden="true">
            <span />
          </div>
          <div className="pm-combo-copy text-center">
            <h2 className="pm-combo-title text-foreground">创建体育组合</h2>
            <p className="pm-combo-description">将多项预测合并成一个组合，赢取更高收益</p>
          </div>
          <Link
            to="/?category=体育"
            className="pm-purple-button mt-1.5 flex h-10 w-full items-center justify-center text-sm font-semibold"
          >
            开始
          </Link>
        </div>
      </div>

      <div className="pm-perps-card mt-4 p-5">
        <div className="text-center">
          <h2 className="text-[24px] leading-7 font-semibold text-foreground">永续合约上线了</h2>
          <p className="mt-1 text-sm font-medium text-muted">使用杠杆做多或做空资产</p>
        </div>
        <div className="mt-5 space-y-4">
          <PerpsRow label="SPCX-USD" value="0.28%" tone="negative" muted />
          <PerpsRow label="SOL-USD" value="8.91%" tone="positive" active />
          <PerpsRow label="ETH-USD" value="0.59%" tone="positive" muted />
        </div>
        <Link
          to="/account"
          className="mt-6 flex h-10 w-full items-center justify-center rounded-full bg-foreground px-8 text-sm font-semibold text-white hover:bg-muted"
        >
          开始交易
        </Link>
      </div>
    </div>
  );
}

function PerpsRow({
  label,
  value,
  tone,
  muted,
  active,
}: {
  label: string;
  value: string;
  tone: 'positive' | 'negative';
  muted?: boolean;
  active?: boolean;
}) {
  return (
    <div className={muted ? 'flex items-center gap-3 opacity-35' : 'flex items-center gap-3'}>
      <span
        className={
          active
            ? 'pm-perps-icon pm-perps-icon-sol'
            : tone === 'positive'
              ? 'pm-perps-icon pm-perps-icon-eth'
              : 'pm-perps-icon pm-perps-icon-spcx'
        }
        aria-hidden="true"
      />
      <span className="flex-1 text-sm font-bold text-foreground">{label}</span>
      <span
        className={
          tone === 'positive'
            ? 'text-sm font-bold text-positive tabular-nums'
            : 'text-sm font-bold text-negative tabular-nums'
        }
      >
        ▲ {value}
      </span>
    </div>
  );
}
