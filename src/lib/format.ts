const compactCurrency = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const compactNumber = new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const dateTime = new Intl.DateTimeFormat('zh-CN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
export const formatCurrency = (value: number) => compactCurrency.format(value);
export const formatCount = (value: number) => compactNumber.format(value);
export const formatProbability = (value: number) => `${Math.round(value)}%`;
export const formatDate = (value: string) => dateTime.format(new Date(value));
export const formatSignedPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
