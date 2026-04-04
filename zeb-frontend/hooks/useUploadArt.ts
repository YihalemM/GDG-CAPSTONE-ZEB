import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadArt } from '../lib/api';

import { useWallet } from '../providers/WalletProvider';
import { useCallback } from 'react';

export type UploadResult = 
  | { status: 'ok'; hash: string; artId: string; onchainTx?: string }
  | { status: 'flagged'; hash: string; artId: string; onchainTx?: string }
  | { status: 'error'; message: string };

export function useUploadArt() {
  const queryClient = useQueryClient();
  const { wallet } = useWallet();

  const mutationFn = useCallback(async (formData: FormData): Promise<UploadResult> => {
    // 1. Upload to backend/DB
    const uploadRes = await uploadArt(formData);
    
    // The backend returns { status: 'ok'|'flagged', data: { artId, hash } }
    if (uploadRes.status === 'error') {
      return { status: 'error', message: uploadRes.message || 'Upload failed' };
    }

    // 2. Extract data safely using optional chaining / fallback
    const title = (formData.get('title') as string) || '';
    const hash = uploadRes.data?.hash || uploadRes.contentHash || uploadRes.hash || uploadRes.art_hash;
    const artId = uploadRes.data?.artId || uploadRes.artId || uploadRes._id;

    if (!hash || !artId) {
      throw new Error('Incomplete data received from backend');
    }
    
    // 3. Optional: Register onchain (if wallet connected)
    let onchainTx: string | undefined;
    if (wallet?.isConnected && wallet.address) {
      const { registerArtworkOnChain } = await import('../lib/stellar');
      onchainTx = await registerArtworkOnChain(title, hash, wallet.address);
    }
    
    return {
      status: uploadRes.status as 'ok' | 'flagged',
      hash,
      artId,
      onchainTx
    };
  }, [wallet]);

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      console.error('✅ Full upload+onchain success:', data);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['arts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-arts'] });
    },
    onError: (error: any) => {
      console.error('❌ Upload+onchain failed:', error);
      // Removed alerts here to allow the Modal UI to handle specific states 
      // (e.g., Duplicates/Flagged messages).
    },
  });
}
