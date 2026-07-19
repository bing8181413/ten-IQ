import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-bold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-sm leading-6 text-muted">链接已经失效，或者该功能尚未接入。</p>
      <Link to="/" className={buttonVariants({ variant: 'outline', className: 'mt-6' })}>
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>
    </div>
  );
}
