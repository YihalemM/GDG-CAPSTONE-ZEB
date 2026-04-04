'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Gavel, Eye } from 'lucide-react'

interface ArtListingCardProps {
  id: number
  title: string
  img: string
  currentBid: string
  creatorAddress?: string
  ownerAddress?: string
  isOwned?: boolean
  isOnAuction?: boolean
  auctionHref?: string
}

export default function ArtListingCard({
  id,
  title,
  img,
  currentBid,
  creatorAddress,
  ownerAddress,
  isOwned = false,
  isOnAuction = false,
  auctionHref = `/auction/${id}`
}: ArtListingCardProps) {
  return (
    <div className="group relative bg-white rounded-[32px] border border-slate-100 p-6 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden h-full flex flex-col">
      {/* IMAGE */}
      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-50 group-hover:scale-[1.02] transition-transform duration-700 border border-slate-50">
        <Image 
          src={img} 
          alt={title}
          fill 
          unoptimized
          className="object-cover group-hover:brightness-110 transition-all duration-700"
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
      </div>
      
      {/* [ Owned ]   [ On Auction ] */}
      <div className="flex gap-2 mb-4">
        {isOwned && (
          <div className="inline-flex items-center gap-1.5 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            <ShieldCheck size={12} />
            <span>Owned</span>
          </div>
        )}
        {isOnAuction && (
          <div className="inline-flex items-center gap-1.5 bg-primary text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            <Gavel size={12} />
            <span>Auction</span>
          </div>
        )}
      </div>
      
      {/* Digital Sunset */}
      <h3 className="font-black text-xl mb-4 text-slate-900 uppercase tracking-tight">{title}</h3>
      
      {/* Created by / Current owner */}
      <div className="flex flex-row sm:flex-col gap-4 mb-4 text-sm text-foreground/70">
        {creatorAddress && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground/80">Created by:</span>
            <span>{creatorAddress}</span>
          </div>
        )}
        {ownerAddress && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground/80">Current owner:</span>
            <span className="text-primary font-semibold">{ownerAddress}</span>
          </div>
        )}
      </div>
      
      {/* Current Bid: 300
      <div className="mb-6 text-foreground/80 font-semibold text-lg">
        Current Bid: {currentBid}
      </div> */}
      
      {/* [ View Auction ] */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <Link 
          href={auctionHref}
          className="inline-flex items-center justify-center w-full gap-2 px-6 py-4 bg-primary text-slate-900 font-black rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/10 uppercase text-xs tracking-widest"
        >
          View Artwork
        </Link>
      </div>
      
    </div>
  )
}
