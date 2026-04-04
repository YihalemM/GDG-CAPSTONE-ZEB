'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuction } from '../lib/api';

export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['arts'] });
    },
    onError: (error: any) => {
      alert('Auction creation failed: ' + error.message);
    },
  });
}
