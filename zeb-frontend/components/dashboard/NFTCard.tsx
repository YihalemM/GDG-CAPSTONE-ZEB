'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, ShieldCheck, ShoppingBag, TrendingUp } from 'lucide-react'
const { buynow, placeBidOnChain } = await import('../../lib/stellar');

export type Status = 'auction' | 'direct' | 'not_listed' | 'AUCTION' | 'FIXED_PRICE' | 'NOT_LISTED'

export interface NFTCardProps {
  id: string
  title: string
  image: string
  status: Status
  price: number
  currentBid?: number
  endTime?: number
  isOwner?: boolean
  isCreator?: boolean
  onSell?: () => void
  onUpdatePrice?: () => void
  onViewAuction?: () => void
  onView?: () => void
  onCardClick?: () => void
  onBuy?: () => void
  onBid?: () => void
}

export default function NFTCard({
  title,
  image,
  status,
  price,
  currentBid,
  endTime,
  isOwner,
  isCreator,
  onSell,
  onUpdatePrice,
  onViewAuction,
  onView,
  onCardClick,
  onBuy,
  onBid
}: NFTCardProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if ((status === 'AUCTION' || status === 'auction') && endTime) {
      const timer = setInterval(() => {
        const now = Date.now()
        const diff = endTime - now
        if (diff <= 0) {
          setTimeLeft('Ended')
          clearInterval(timer)
        } else {
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setTimeLeft(`${h}h ${m}m ${s}s`)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [status, endTime])

  const normalizedStatus = status.toUpperCase()

  const getPrimaryAction = () => {
    if (onBuy) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onBuy(); }}
          className="w-full py-3 bg-primary text-slate-900 font-black rounded-xl hover:bg-primary/80 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          BUY NOW
        </button>
      )
    }
    if (onBid) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onBid(); }}
          className="w-full py-3 bg-secondary text-white font-black rounded-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <TrendingUp size={18} />
          PLACE BID
        </button>
      )
    }

    if (isOwner) {
      if (normalizedStatus === 'NOT_LISTED') {
        return (
          <button 
            onClick={(e) => { e.stopPropagation(); onSell?.(); }}
            className="w-full py-3 bg-secondary text-white font-black rounded-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            LIST FOR SALE
          </button>
        )
      }
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onUpdatePrice?.(); }}
          className="w-full py-3 border border-surface text-foreground font-black rounded-xl hover:bg-surface/50 transition-all active:scale-95"
        >
          MANAGE LISTING
        </button>
      )
    }

    if (normalizedStatus === 'AUCTION') {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onViewAuction?.(); }}
          className="w-full py-3 bg-secondary text-white font-black rounded-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          VIEW AUCTION
        </button>
      )
    }

    return (
      <button 
        onClick={(e) => { e.stopPropagation(); onView?.(); }}
        className="w-full py-3 border border-surface text-foreground font-black rounded-xl hover:bg-surface/50 transition-all active:scale-95"
      >
        VIEW DETAILS
      </button>
    )
  }

  return (
    <div 
      onClick={onCardClick}
      className="group relative bg-surface/30 backdrop-blur-xl rounded-[32px] p-6 border border-surface/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-surface">
        <Image 
          src={image} 
          alt={title}
          fill 
          unoptimized
          className="object-cover transition-all duration-700"
        />
        
        {normalizedStatus === 'AUCTION' && (
          <div className="absolute top-4 right-4 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-xl">
            <Clock size={14} className="text-secondary animate-pulse" />
            <span className="text-xs font-black text-white">{timeLeft}</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
          {isCreator && (
            <div className="bg-primary/20 text-slate-900 p-1 rounded-lg" title="You are the creator">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>

        <div className="flex justify-between items-end bg-surface/50 rounded-2xl p-4 border border-surface/50">
          <div>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-wider mb-1">
              {normalizedStatus === 'AUCTION' ? 'Current Bid' : 'Price'}
            </p>
            <p className="text-lg font-black text-slate-900">
              {normalizedStatus === 'AUCTION' ? (currentBid || price) : price} <span className="text-xs text-slate-400">XLM</span>
            </p>
          </div>
          {normalizedStatus === 'AUCTION' && (
            <div className="text-right">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                LIVE
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-surface/30">
        {getPrimaryAction()}
      </div>
    </div>
  )
}
