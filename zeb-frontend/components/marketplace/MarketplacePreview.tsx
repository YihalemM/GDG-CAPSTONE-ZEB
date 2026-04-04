/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ShoppingCart } from 'lucide-react';

const artworks = [
  { id: 1, title: 'Neon Syntax #044', creator: 'GCF2A...3X9Y', price: '450 XLM', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop' },
  { id: 2, title: 'Quantum Drift', creator: 'GBS8K...11VQ', price: '1,200 XLM', img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=400&fit=crop' },
  { id: 3, title: 'Soroban Architecture', creator: 'GDY4P...M92Q', price: '850 XLM', img: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=400&fit=crop' },
  { id: 4, title: 'Stellar Horizon', creator: 'GAV1B...LL82', price: '3,000 XLM', img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=400&fit=crop' },
  { id: 5, title: 'Cybernetic Flora', creator: 'GCN9X...ZR5T', price: '275 XLM', img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=400&fit=crop' },
  { id: 6, title: 'Immutable Echo', creator: 'GZQR5...T4LK', price: '600 XLM', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop' },
];

export default function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-24 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Trending Edits</h2>
            <p className="text-foreground/70 text-lg">Acquire permanent digital artifacts direct from creators.</p>
          </div>
          <button className="hidden sm:block text-primary hover:text-primary/70 font-semibold transition-colors">
            View All Artwork →
          </button>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((art) => (
            <div 
              key={art.id} 
              className="bg-surface rounded-2xl overflow-hidden border border-surface/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(51,255,235,0.15)] hover:border-primary/50 group"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  src={art.img} 
                  alt={art.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 truncate">{art.title}</h3>
                    <p className="text-sm font-mono text-foreground/50">Creator: {art.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary">{art.price}</p>
                  </div>
                </div>

                <button className="w-full mt-2 py-3 bg-surface/80 border border-primary/30 rounded-lg flex items-center justify-center gap-2 font-semibold text-primary group-hover:bg-primary group-hover:text-background group-hover:shadow-[0_0_15px_rgba(51,255,235,0.4)] transition-all duration-300">
                  <ShoppingCart size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full sm:hidden mt-10 py-4 border border-primary text-primary rounded-lg font-bold">
          View All Artwork
        </button>
      </div>
    </section>
  );
}
