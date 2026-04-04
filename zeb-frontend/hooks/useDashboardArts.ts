import { useQuery } from '@tanstack/react-query';
import { getUserArts } from '../lib/api';
import { Art } from '../lib/types';
import { useWallet } from '../providers/WalletProvider';

export function useDashboardArts(role: 'creator' | 'owner' = 'creator') {
  const { wallet } = useWallet();

  return useQuery({
    queryKey: ['arts', wallet?.address, role],
    queryFn: async () => {
      if (!wallet?.address) throw new Error('No wallet');
      return getUserArts(wallet.address);
    },
    enabled: !!wallet?.address,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

