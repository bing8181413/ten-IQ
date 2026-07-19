import { Link } from 'react-router-dom';
import { Brand } from './Brand';

const footerGroups = [
  {
    title: '浏览市场',
    links: [
      ['全部预测', '/zh/predictions'],
      ['体育盘口', '/zh/sports/live'],
      ['组合', '/zh/predictions/combine'],
      ['永续合约', '/zh/asset/sp500'],
    ],
  },
  {
    title: 'ten-IQ',
    links: [
      ['玩法介绍', '/zh/how-it-works'],
      ['排行榜', '/zh/leaderboard'],
      ['准确率', '/zh/accuracy'],
      ['市场动态', '/zh/activity'],
    ],
  },
  {
    title: '账户',
    links: [
      ['个人中心', '/account'],
      ['我的持仓', '/account#positions'],
      ['关注市场', '/account#watchlist'],
      ['安全设置', '/account#security'],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-surface" aria-label="站点页脚">
      <div className="pm-shell grid gap-8 py-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            用市场概率观察世界。当前版本使用确定性演示数据，不处理真实资金、钱包或订单。
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
            <div className="mt-3 grid gap-2">
              {group.links.map(([label, to]) => (
                <Link key={label} to={to} className="text-sm text-muted hover:text-foreground">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="pm-shell py-4 text-xs leading-5 text-subtle">
          ten-IQ 演示版 · 概率不是保证，任何资金类功能上线前均需独立安全与合规评审。
        </div>
      </div>
    </footer>
  );
}
