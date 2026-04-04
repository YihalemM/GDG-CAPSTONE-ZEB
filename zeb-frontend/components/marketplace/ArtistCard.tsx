/* eslint-disable @next/next/no-img-element */
import React from 'react';

export interface ArtistCardProps {
  avatar?: string;
  name: string;
  artworksCount: number;
}

export default function ArtistCard({
  avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
  name,
  artworksCount
}: ArtistCardProps) {
  return (
    <div className="bg-surface rounded-xl p-6 border border-surface hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(218,65,103,0.15)] flex flex-col items-center text-center group">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-secondary transition-colors duration-300">
        <img 
          src={avatar} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-foreground/60 font-mono mb-6">{artworksCount} Artworks</p>
      
      <button className="w-full bg-transparent border border-secondary text-secondary px-4 py-2 rounded-lg font-medium hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(218,65,103,0.3)] transition-all duration-300">
        View Profile
      </button>
    </div>
  );
}
