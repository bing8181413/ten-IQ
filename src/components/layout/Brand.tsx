import { Link } from 'react-router-dom';
export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 translate-x-2.5 items-center gap-2 rounded-control text-[22px] leading-7 font-bold text-foreground"
      aria-label="ten-IQ 首页"
    >
      <span className="pm-brand-mark" aria-hidden="true" />
      <span>ten-IQ</span>
    </Link>
  );
}
