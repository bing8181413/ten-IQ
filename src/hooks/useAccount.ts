import { useQuery } from '@tanstack/react-query';
import { getAccount } from '@/services/account';

export function useAccount() {
  return useQuery({
    queryKey: ['account', 'detail'],
    queryFn: ({ signal }) => getAccount(signal),
    staleTime: 30_000,
  });
}
