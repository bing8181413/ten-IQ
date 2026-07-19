import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, getComments, getOrderBook } from '@/services/marketExtras';
import { createActionId } from '@/lib/requestId';

export function useOrderBook(marketId: string, outcomeId: string) {
  return useQuery({
    queryKey: ['markets', marketId, 'order-book', outcomeId],
    queryFn: ({ signal }) => getOrderBook(marketId, outcomeId, signal),
  });
}

export function useComments(marketId: string) {
  return useQuery({
    queryKey: ['markets', marketId, 'comments'],
    queryFn: ({ signal }) => getComments(marketId, signal),
  });
}

export function useCommentMutation(marketId: string) {
  const queryClient = useQueryClient();
  const failedAction = useRef<{ text: string; id: string } | null>(null);
  return useMutation({
    mutationFn: async (text: string) => {
      const actionId =
        failedAction.current?.text === text
          ? failedAction.current.id
          : createActionId('demo-comment');
      try {
        const response = await createComment(marketId, text, actionId);
        failedAction.current = null;
        return response;
      } catch (error) {
        failedAction.current = { text, id: actionId };
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['markets', marketId, 'comments'] }),
  });
}
