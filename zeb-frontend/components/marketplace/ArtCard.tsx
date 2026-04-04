import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Plus, ShoppingCart, User } from 'lucide-react';

export interface ArtCardProps {
  image?: string;
  title: string;
  creator: string;
  price: string;
  timer?: string;
  hash?: string;
  createdAt?: string;
  description?:string;
  saleType?: 'sale' | 'bid';
  bidders?: number;
}

export default function ArtCard({
  image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  title,
  creator,
  price,
  timer,
  hash = "0x123abc",
  saleType = "sale",
  bidders = 0
}: ArtCardProps) {
  const detailRoute = saleType === 'bid' ? `/auction/${hash}` : `/artwork/${hash}`;

  return (
    <Link 
      href={detailRoute}
      className="bg-white rounded-[32px] overflow-hidden border border-slate-100 transition-all duration-500 hover:border-primary group shadow-sm hover:shadow-xl flex flex-col w-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden p-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {saleType === 'bid' && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Auction</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-md font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors uppercase">{title}</h3>
          <div className="text-[10px] font-black text-slate-900 tracking-tight uppercase">{price} <span className="text-slate-400">XLM</span></div>
        </div>
        
        <div className="flex justify-between items-end mt-1">
           <p className="text-[11px] text-slate-400 font-bold uppercase">by <span className="text-slate-500 font-black">{creator}</span></p>
           
           <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-slate-900 transition-all shadow-sm">
             <ArrowRight size={14} />
           </div>
        </div>
        
        {saleType === 'bid' && (
           <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Ends In: <span className="text-slate-900 ml-1">{timer || '24:00:00'}</span></p>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                 <User size={10} className="text-slate-400" />
                 <span className="text-[9px] font-black text-slate-900">{bidders}</span>
              </div>
           </div>
        )}
      </div>
    </Link>
  );
}
