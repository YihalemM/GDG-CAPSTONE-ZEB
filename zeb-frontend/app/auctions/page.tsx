'use client'

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArtCard from '@/components/marketplace/ArtCard';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuctions } from '@/lib/api';
import { formatTimeLeft } from '@/lib/utils';

export default function AuctionsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: auctionsRes, isLoading, error } = useQuery({
    queryKey: ['auctions'],
    queryFn: getAuctions
  });

  const auctions = auctionsRes?.data || [];
  const categories = ['all', 'image', 'video', 'text', 'music'];

  const filteredAuctions = useMemo(() => {
    return auctions.filter(auction => {
      const art = auction.artwork;
      if (!art) return false;
      const matchesSearch = art.creatorBy.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [auctions, search, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar showSearch={false} />
      
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 text-center">Live Auctions</h1>
          <p className="text-md text-slate-500 font-bold max-w-xl mx-auto text-center font-bold">
            Participate in high-stakes bidding for the world's most exclusive digital masterpieces.
          </p>
        </div>

        {/* Status Row */}
        <div className="flex flex-col gap-8 mb-12">
           <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{filteredAuctions.length} Active Auctions</span>
                 </div>
              </div>

              <div className="flex-1 max-w-md mx-12 relative">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                   type="text" 
                   placeholder="Search by creator name..." 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-black text-slate-900 focus:outline-none focus:border-cyan-400/30 transition-all placeholder:text-slate-300"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              
              <div className="flex items-center gap-4">
                 <button className="flex items-center gap-8 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                    Filter By Price
                    <ChevronDown size={14} />
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                 <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-cyan-400 hover:text-slate-900'}`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* Grid or Status States */}
        {isLoading ? (
           <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading live auctions...</p>
           </div>
        ) : error ? (
           <div className="py-32 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                 <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Service Temporarily Unavailable</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto">We're fine-tuning the auction engine. Please check back in a few minutes.</p>
           </div>
        ) : filteredAuctions.length === 0 ? (
           <div className="py-32 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                 <Search size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Active Auctions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto">
                 {search || activeCategory !== 'all' 
                   ? "Try adjusting your filters or search terms to find what you're looking for." 
                   : "The digital atelier is currently quiet. Check back soon for new masterpieces."}
              </p>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {filteredAuctions.map((auction) => (
               <ArtCard 
                  key={auction._id}
                  title={auction.artwork.title}
                  creator={`@${auction.artwork.creatorBy.slice(0, 8)}...`}
                  price={`${auction.highest_bid || auction.artwork.minPrice} XLM`}
                  timer={formatTimeLeft(new Date(auction.end_time))}
                  saleType="bid"
                  image={`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '')}/${auction.artwork.filePath}`}
                  hash={auction.art_hash}
                  bidders={auction.bidders.length}
               />
             ))}
           </div>
        )}

        {/* Pagination placeholder */}
        {filteredAuctions.length > 0 && (
          <div className="mt-20 flex items-center justify-center gap-8">
             <button className="text-slate-300 hover:text-slate-900 transition-colors">
                <ChevronLeft size={24} />
             </button>
             <span className="text-xs font-black text-slate-900 tracking-widest">Page 1 of 1</span>
             <button className="text-slate-300 hover:text-slate-900 transition-colors">
                <ChevronRight size={24} />
             </button>
          </div>
        )}
      </main>
      
      <Footer hideCTA={true} />
    </div>
  );
}
