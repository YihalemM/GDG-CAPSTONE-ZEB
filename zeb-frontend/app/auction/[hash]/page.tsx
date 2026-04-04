'use client';

import React, { useState, use, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Clock, ShieldCheck, User, Loader2, AlertCircle, Gavel } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getArtById, getArtActivity, getAuctionByArtHash } from '@/lib/api';
import { placeBidOnChain, closeAuctionOnChain } from '@/lib/stellar';
import { useWallet } from '@/providers/WalletProvider';
import { formatDistanceToNow, formatTimeLeft } from '@/lib/utils';

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash: artId } = use(params);
  const { wallet } = useWallet();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Art Details
  const { data: artRes, isLoading: artLoading, error: artError } = useQuery({
    queryKey: ['art', artId],
    queryFn: () => getArtById(artId),
  });

  // 2. Fetch Auction Specifics (Highest bid, end time)
  const { data: auctionRes, isLoading: auctionLoading } = useQuery({
    queryKey: ['auction', artId],
    queryFn: () => getAuctionByArtHash(artId),
    enabled: !!artRes,
  });

  // 3. Fetch Bidding History (Filtered from Activities)
  const { data: activityRes, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', artId],
    queryFn: () => getArtActivity(artId),
    enabled: !!artRes,
  });

  const art = artRes?.data;
  const auction = auctionRes?.data;
  const bids = (activityRes?.data || []).filter(a => a.type === 'bid');
  
  // Use auction model for values, fallback to art minPrice
  const highestBid = auction ? auction.highest_bid : (art?.minPrice || 0);
  const highestBidder = auction?.highest_bidder || null;
  const endTime = auction?.end_time ? new Date(auction.end_time) : null;

  // 3. Bid Logic
  const handleBid = async () => {
    if (!wallet?.isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= highestBid) {
      alert(`Min bid must be higher than ${highestBid} XLM`);
      return;
    }

    try {
      setIsProcessing(true);
      await placeBidOnChain(art!.contentHash, wallet.address, amount);
      alert("Bid placed successfully!");
      setBidAmount('');
      queryClient.invalidateQueries({ queryKey: ['art', artId] });
      queryClient.invalidateQueries({ queryKey: ['auction', artId] });
      queryClient.invalidateQueries({ queryKey: ['activity', artId] });
    } catch (err: any) {
      alert(err.message || "Bidding failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (artLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (artError || !art) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-black text-slate-900">Auction not found</h1>
      </div>
    );
  }

  const isSeller = wallet?.address === art.ownedBy;
  const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '')}/${art.filePath}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-12">
           <span className="hover:text-slate-900 cursor-pointer">Marketplace</span>
           <span>/</span>
           <span className="hover:text-slate-900 cursor-pointer">Live Auctions</span>
           <span>/</span>
           <span className="text-slate-900 uppercase tracking-tight">{art.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Artwork (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            <div className="relative aspect-square w-full bg-white rounded-[48px] p-6 shadow-2xl shadow-slate-200 border border-white">
               <img 
                 src={imageUrl} 
                 alt={art.title} 
                 className="w-full h-full object-cover rounded-[32px]"
               />
               <div className="absolute top-12 left-12 z-20 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Auction</span>
               </div>
            </div>

            <div className="space-y-6 max-w-2xl">
               <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">{art.title}</h1>
               <p className="text-sm text-slate-400 font-bold leading-relaxed">
                  {art.description}
               </p>

               <div className="flex gap-12 pt-4">
                  <div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Creator</p>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900" />
                        <span className="text-xs font-black text-slate-900">{art.creatorBy.slice(0, 8)}...</span>
                     </div>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Category</p>
                     <span className="text-xs font-black text-slate-900 uppercase">{art.category}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Bidding Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex justify-between items-start mb-12">
                  <div>
                     <p className="text-[10px] items-center font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Current Highest Bid</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{highestBid} XLM</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Ends In</p>
                     <div className="flex items-center gap-1.5 text-slate-900 justify-end">
                        <Clock size={16} />
                        <span className="text-xl font-black">
                           {endTime ? formatTimeLeft(endTime) : 'N/A'}
                        </span>
                     </div>
                  </div>
               </div>

               {highestBidder && (
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-900" />
                       <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Highest Bidder</p>
                          <p className="text-xs font-black text-slate-900">{highestBidder.slice(0, 8)}...</p>
                       </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-white">
                       <ShieldCheck size={12} />
                    </div>
                 </div>
               )}

               <div className="space-y-6">
                  {isSeller ? (
                    <button 
                      onClick={async () => {
                        try {
                          setIsProcessing(true);
                          await closeAuctionOnChain(art.contentHash, wallet!.address);
                          alert("Auction closed!");
                          queryClient.invalidateQueries({ queryKey: ['art', artId] });
                        } catch (err: any) { alert(err.message); }
                        finally { setIsProcessing(false); }
                      }}
                      className="w-full py-5 bg-secondary text-white font-black rounded-3xl text-sm hover:bg-slate-800 transition-all tracking-tight flex justify-center items-center"
                    >
                      {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : "Close Auction"}
                    </button>
                  ) : (
                    <>
                      <div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-3">Your Bid</p>
                         <div className="relative">
                            <input 
                               type="text" 
                               placeholder="Enter amount in XLM"
                               className="w-full p-6 bg-white border border-slate-200 rounded-3xl text-sm font-black focus:outline-none focus:border-cyan-400 shadow-sm"
                               value={bidAmount}
                               onChange={(e) => setBidAmount(e.target.value)}
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">XLM</span>
                         </div>
                      </div>

                      <button 
                        onClick={handleBid}
                        disabled={isProcessing}
                        className="w-full py-5 bg-primary text-slate-900 font-black rounded-3xl text-sm hover:bg-primary/80 transition-all tracking-tight flex justify-center items-center"
                      >
                         {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : "Place Bid"}
                      </button>
                    </>
                  )}
               </div>
            </div>

            {/* Bidding History */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Bidding History</h3>
               <div className="space-y-6">
                  {bids.length > 0 ? bids.map((bid, i) => (
                     <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                              <User size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-900">{(bid.from || 'Unknown').slice(0, 8)}...</p>
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}</p>
                           </div>
                        </div>
                        <span className="text-sm font-black text-slate-900">{bid.amount} XLM</span>
                     </div>
                  )) : (
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center py-4">No bids yet</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer hideCTA={true} />
    </div>
  );
}
