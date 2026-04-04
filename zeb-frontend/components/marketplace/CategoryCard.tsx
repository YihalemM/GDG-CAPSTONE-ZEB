/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  slug: string;
  image?: string;
  count?: number;
}

export default function CategoryCard({
  title,
  slug,
  image = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
  count = 142
}: CategoryCardProps) {
  return (
    <Link href={`/marketplace/${slug}`} className="block group">
      <div className="relative h-80 rounded-2xl overflow-hidden border border-surface hover:border-primary/30 transition-all duration-500">
        {/* Background Image Wrapper */}
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
          />
        </div>
        
        {/* Solid Overlay */}
        <div className="absolute inset-0 z-10 bg-slate-900/60 transition-colors duration-500 group-hover:bg-slate-900/40" />
        
        {/* Content */}
        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
          <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
            <h3 className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-primary transition-colors uppercase">
              {title}
            </h3>
            <p className="text-white/70 font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {count} Curated Pieces
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
