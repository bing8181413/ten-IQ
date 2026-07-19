import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createActionId } from '@/lib/requestId';

export function useActionMutation<TVariables, TData>(
  prefix: string,
  operation: (variables: TVariables, actionId: string) => Promise<TData>,
) {
  const failedAction = useRef<{ fingerprint: string; id: string } | null>(null);
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const fingerprint = JSON.stringify(variables);
      const actionId =
        failedAction.current?.fingerprint === fingerprint
          ? failedAction.current.id
          : createActionId(prefix);
      try {
        const result = await operation(variables, actionId);
        failedAction.current = null;
        return result;
      } catch (error) {
        failedAction.current = { fingerprint, id: actionId };
        throw error;
      }
    },
  });
}
