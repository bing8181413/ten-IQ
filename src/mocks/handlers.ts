import { delay, http, HttpResponse } from 'msw';
import { mockMarkets } from '@/data/mockMarkets';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const handlers = [
  http.get(`${API_BASE_URL}/markets`, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.trim().toLocaleLowerCase('zh-CN');
    const sort = url.searchParams.get('sort') ?? 'trending';
    let data = mockMarkets.filter((market) => {
      const matchesCategory =
        !category || (category === '热门' ? market.trending : market.category === category);
      const matchesSearch =
        !search ||
        market.title.toLocaleLowerCase('zh-CN').includes(search) ||
        market.tags.some((tag) => tag.toLocaleLowerCase('zh-CN').includes(search));
      return matchesCategory && matchesSearch;
    });
    data = [...data].sort((a, b) =>
      sort === 'volume'
        ? b.volume - a.volume
        : sort === 'newest'
          ? b.endDate.localeCompare(a.endDate)
          : Number(b.trending) - Number(a.trending) || b.volume - a.volume,
    );
    return HttpResponse.json({
      data,
      meta: { total: data.length, updatedAt: new Date().toISOString() },
    });
  }),
  http.get(`${API_BASE_URL}/markets/:slug`, async ({ params }) => {
    await delay(90);
    const market = mockMarkets.find((item) => item.slug === params.slug);
    if (!market) return HttpResponse.json({ message: 'Market not found' }, { status: 404 });
    return HttpResponse.json({ data: market });
  }),
];
