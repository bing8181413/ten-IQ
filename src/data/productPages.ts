export interface SportsMatch {
  id: string;
  league: string;
  status: string;
  volume: string;
  home: { name: string; short: string; score: string; price: number };
  away: { name: string; short: string; score: string; price: number };
  spread: [string, string];
  total: [string, string];
}

export const sportsLeagues = ['全部', '世界杯', 'MLB', '网球', 'WNBA', '电竞'];

export const sportsMatches: SportsMatch[] = [
  {
    id: 'spain-argentina',
    league: '世界杯',
    status: '下半场 · 72′',
    volume: '$4.2M',
    home: { name: '西班牙', short: 'ESP', score: '1', price: 60 },
    away: { name: '阿根廷', short: 'ARG', score: '1', price: 41 },
    spread: ['ESP -1.5 44¢', 'ARG +1.5 65¢'],
    total: ['大 2.5 53¢', '小 2.5 50¢'],
  },
  {
    id: 'braves-white-sox',
    league: 'MLB',
    status: '5局上',
    volume: '$784K',
    home: { name: 'Braves', short: 'ATL', score: '0', price: 54 },
    away: { name: 'White Sox', short: 'CWS', score: '0', price: 48 },
    spread: ['ATL +1.5 70¢', 'CWS -1.5 44¢'],
    total: ['大 8.5 53¢', '小 8.5 50¢'],
  },
  {
    id: 'galan-piros',
    league: '网球',
    status: '第2盘',
    volume: '$119K',
    home: { name: 'D. Galan', short: 'GAL', score: '6 3', price: 55 },
    away: { name: 'Z. Piros', short: 'PIR', score: '2 4', price: 46 },
    spread: ['GAL +1.5 55¢', 'PIR -1.5 87¢'],
    total: ['大 23.5 98¢', '小 23.5 99¢'],
  },
  {
    id: 'liberty-aces',
    league: 'WNBA',
    status: '今晚 8:00',
    volume: '$326K',
    home: { name: 'Liberty', short: 'NYL', score: '-', price: 57 },
    away: { name: 'Aces', short: 'LVA', score: '-', price: 45 },
    spread: ['NYL -2.5 51¢', 'LVA +2.5 52¢'],
    total: ['大 168.5 48¢', '小 168.5 55¢'],
  },
];

export const perpsAssets = [
  {
    symbol: 'sp500',
    name: 'SP500-USD',
    icon: 'SPX',
    price: 7475.9,
    change: 0.42,
    high: '7,502.2',
    low: '7,421.6',
    volume: '$186.4M',
    values: [7410, 7428, 7418, 7442, 7436, 7460, 7449, 7472, 7464, 7475.9],
  },
  {
    symbol: 'btc',
    name: 'BTC-USD',
    icon: '₿',
    price: 65842.7,
    change: 1.28,
    high: '66,214.0',
    low: '64,780.4',
    volume: '$432.8M',
    values: [64200, 64780, 64520, 65110, 64940, 65480, 65220, 65910, 65620, 65842.7],
  },
  {
    symbol: 'eth',
    name: 'ETH-USD',
    icon: '◆',
    price: 1894.2,
    change: 0.59,
    high: '1,912.8',
    low: '1,861.3',
    volume: '$118.2M',
    values: [1854, 1862, 1858, 1874, 1868, 1882, 1878, 1897, 1888, 1894.2],
  },
  {
    symbol: 'sol',
    name: 'SOL-USD',
    icon: 'S',
    price: 82.16,
    change: -0.31,
    high: '83.40',
    low: '80.72',
    volume: '$46.7M',
    values: [81.2, 82.1, 81.8, 82.6, 83.1, 82.8, 82.3, 82.7, 81.9, 82.16],
  },
];

export const comboLegs = [
  { id: 'esp', league: '世界杯', title: '西班牙 vs 阿根廷', outcome: '西班牙', probability: 60 },
  { id: 'atl', league: 'MLB', title: 'Braves vs White Sox', outcome: 'Braves', probability: 54 },
  {
    id: 'gal',
    league: '网球',
    title: 'D. Galan vs Z. Piros',
    outcome: 'D. Galan',
    probability: 55,
  },
  { id: 'nyl', league: 'WNBA', title: 'Liberty vs Aces', outcome: 'Liberty', probability: 57 },
];
