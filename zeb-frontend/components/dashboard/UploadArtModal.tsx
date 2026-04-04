'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadArt } from '../../hooks/useUploadArt';
import { useCreateAuction } from '../../hooks/useCreateAuction';
import { useWallet } from '../../providers/WalletProvider';

interface FormDataType {
  title: string;
  file: File | null;
  listingType: 'sell' | 'auction';
  minPrice: string;
  category: 'image' | 'video' | 'audio';
  auctionEndTime: string;
}

export function UploadArtModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { wallet } = useWallet();
  const uploadMutation = useUploadArt();
  const createAuctionMutation = useCreateAuction();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    file: null,
    listingType: 'sell',
    minPrice: '',
    category: 'image',
    auctionEndTime: '',
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'onchain' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-detect category
    let category: FormDataType['category'] = 'image';
    if (file.type.startsWith('video/')) category = 'video';
    else if (file.type.startsWith('audio/')) category = 'audio';

    setFormData((prev) => ({ ...prev, file, category } as FormDataType));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      file: null,
      listingType: 'sell',
      minPrice: '',
      category: 'image',
      auctionEndTime: '',
    });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !wallet?.address) {
      alert('File and wallet are required');
      return;
    }

    try {
      // Upload file to backend
      const fd = new FormData();
      fd.append('file', formData.file);
      fd.append('title', formData.title);
      fd.append('saleType', formData.listingType);
      fd.append('description', formData.title);
      fd.append('creatorBy', wallet.address);
      fd.append('ownedBy', wallet.address);
      fd.append('category', formData.category);
      fd.append('minPrice', formData.minPrice);
      fd.append('auctionEndTime', formData.auctionEndTime);

      const result = await uploadMutation.mutateAsync(fd);
      
      if (result.status === "error") {
        throw new Error(result.message);
      }

      if (result.status === "flagged") {
        setUploadStatus('success');
        setShowFlaggedModal(true);
        return;
      }

      const hash = result.hash;
      
      setUploadStatus('onchain');
      // Register artwork on-chain
       await new Promise(resolve => setTimeout(resolve, 5000));
      // Fixed-price sale
      if (formData.listingType === 'sell') {
        const { listForSaleOnChain } = await import('../../lib/stellar');
        await listForSaleOnChain(hash, wallet.address, parseFloat(formData.minPrice));
      }

      // Auction
      if (formData.listingType === 'auction' && formData.auctionEndTime) {
        const { createAuctionOnChain } = await import('../../lib/stellar');
        const auctionEndSec = Math.floor(new Date(formData.auctionEndTime).getTime() / 1000);
        await createAuctionOnChain(hash, wallet.address, Date.now(), auctionEndSec);

        // Optional: backend mutation for auctions
        await createAuctionMutation.mutateAsync({
          art_hash: hash,
          seller: wallet.address, 
          end_time: auctionEndSec * 1000,
        });
      }

      // CONFIRM ON BACKEND (Activate the record)
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/arts/confirm/${hash}`, {
        method: 'PUT',
      });

      setUploadStatus('success');
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Duplicate") || err.response?.status === 409) {
        setShowDuplicateModal(true);
      } else if (err.message?.includes("registered on the ZEB blockchain")) {
        // Specific handling for the mapped contract error
        alert(err.message);
      } else {
        alert(err.message || 'An error occurred during deployment');
      }
    } finally {
      setUploadStatus('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Upload Artwork</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 group transition-colors">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              required
              className="w-full p-4 border border-slate-100 rounded-2xl file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all"
            />
            <AnimatePresence>
              {preview && (
                <motion.img
                  src={preview}
                  alt="Preview"
                  className="mt-3 h-40 w-full object-cover rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Masterpiece Title *"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold placeholder:text-slate-300"
            required
          />

          {/* Category */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Asset Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as FormDataType['category'] }))
              }
              className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold appearance-none bg-white"
            >
              <option value="image">Digital Image</option>
              <option value="video">Motion Video</option>
              <option value="audio">Sonic Audio</option>
            </select>
          </div>

          {/* Creator Address */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Creator Origin</label>
            <input
              type="text"
              value={wallet?.address || ''}
              readOnly
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 tracking-tight cursor-not-allowed"
            />
          </div>

          {/* Listing Type */}
          <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <label className="flex-1 flex items-center justify-center gap-3 cursor-pointer p-4 rounded-xl transition-all border border-transparent hover:bg-white">
              <input
                type="radio"
                className="w-5 h-5 accent-primary"
                checked={formData.listingType === 'sell'}
                onChange={() => setFormData((prev) => ({ ...prev, listingType: 'sell' }))}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Direct Sale</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-3 cursor-pointer p-4 rounded-xl transition-all border border-transparent hover:bg-white">
              <input
                type="radio"
                className="w-5 h-5 accent-primary"
                checked={formData.listingType === 'auction'}
                onChange={() => setFormData((prev) => ({ ...prev, listingType: 'auction' }))}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Auction</span>
            </label>
          </div>

          {/* Price */}
          {formData.listingType === 'sell' && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Asset Value (XLM) *</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0.00"
                value={formData.minPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-black text-2xl"
                required
              />
            </div>
          )}

          {/* Auction fields */}
          {formData.listingType === 'auction' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Reserve Price (XLM) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  value={formData.minPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-black text-2xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Auction Expiry *</label>
                <input
                  type="datetime-local"
                  value={formData.auctionEndTime}
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, auctionEndTime: e.target.value }))}
                  className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold"
                  required
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-400 font-black py-5 rounded-2xl border border-transparent hover:bg-slate-200 hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest"
            >
              Cancel Mission
            </button>

            <button
              type="submit"
              disabled={uploadMutation.isPending || createAuctionMutation.isPending}
              className="flex-1 bg-primary text-slate-900 font-black py-5 rounded-2xl hover:bg-primary/80 hover:shadow-2xl hover:shadow-primary/10 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest disabled:opacity-50"
            >
              {uploadMutation.isPending || createAuctionMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Deploy Artwork
                </>
              )}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {uploadMutation.isError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3"
              >
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-800">{(uploadMutation.error as Error)?.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* MODALS */}
        <AnimatePresence>
          {showDuplicateModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-[40px] p-10 max-w-md w-full border border-red-100 shadow-2xl text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Duplicate Detected</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">
                  This exact masterpiece is already registered in the ZEB authorship engine by another creator.
                </p>
                <button 
                  onClick={() => setShowDuplicateModal(false)}
                  className="w-full py-4 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          )}

          {showFlaggedModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-[40px] p-10 max-w-md w-full border border-primary/20 shadow-2xl text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                   <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Similarity Flagged</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                  Your work shows high similarity to an existing record. To protect authorship, it has been flagged for review.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Status: Pending Review</p>
                   <p className="text-xs font-bold text-slate-400">Please wait 12-24 hours for our admins to verify authenticity.</p>
                </div>
                <button 
                  onClick={() => { setShowFlaggedModal(false); onClose(); }}
                  className="w-full py-4 bg-primary text-slate-900 font-black rounded-2xl hover:bg-primary/80 transition-all"
                >
                  Close & Wait
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
