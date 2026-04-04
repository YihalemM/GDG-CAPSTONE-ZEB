'use client'
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getArts } from '@/lib/api';

export default function MarketplacePreview() {
  const { data: artsRes, isLoading, error } = useQuery({
    queryKey: ['featured-arts'],
    queryFn: () => getArts({ sort: 'minPrice', order: 'desc', limit: 3 })
  });

  const featuredArts = artsRes?.data || [];
  return (
    <section id="marketplace" className="py-24 bg-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Featured Collections</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Curated assets from leading digital architects.</p>
          </div>
          
          <Link href="/marketplace" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-primary transition-colors group">
            View Marketplace
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with ZEB Engine...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-sm text-red-500 font-bold">Failed to load collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {featuredArts.map((art) => (
                <Link key={art._id} href={`/artwork/${art.contentHash}`} className="group cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-slate-100 mb-6">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '')}/${art.filePath}`} 
                      alt={art.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex items-start justify-between px-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{art.title}</h3>
                      <p className="text-sm font-bold text-slate-400">by <span className="text-slate-500">@{art.creatorBy.slice(0, 8)}...</span></p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 rounded-full">
                      <span className="text-xs font-black text-primary tracking-tight">{art.minPrice} XLM</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
