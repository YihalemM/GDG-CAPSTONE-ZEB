'use client'

import React from 'react'
import Image from 'next/image'
import { X, Tag, User, Shield, DollarSign, Edit2, ExternalLink } from 'lucide-react'

interface NFT {
  id: number
  title: string
  description: string
  creator: string
  owner?: string
  price: string
  img: string
  type: string
  genre: string
}

interface NFTDetailModalProps {
  nft: NFT | null
  isOpen: boolean
  onClose: () => void
  currentUserAddress: string
  onSale: (nftId: number) => void
  onEdit: (nftId: number) => void
}

export default function NFTDetailModal({
  nft,
  isOpen,
  onClose,
  currentUserAddress,
  onSale,
  onEdit
}: NFTDetailModalProps) {
  if (!isOpen || !nft) return null

  const isOwnedByMe = nft.owner === 'You' || (nft.owner && nft.owner.includes(currentUserAddress))
  const isCreatedByMe = nft.creator.includes(currentUserAddress)

  const tags = [nft.type, nft.genre].filter(Boolean)

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-surface/95 backdrop-blur-2xl border border-surface/50 rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface/100 backdrop-blur-xl border-b border-surface/50 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {nft.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface/50 rounded-2xl transition-all group"
            >
              <X className="w-6 h-6 text-foreground/70 group-hover:text-foreground" />
            </button>
          </div>
        </div>

        <div className="p-8 grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-50 shadow-2xl border border-slate-100">
            <Image
              src={nft.img}
              alt={nft.title}
              width={600}
              height={400}
              className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ExternalLink size={20} className="text-primary/70" />
                Description
              </h3>
              <p className="text-foreground/80 leading-relaxed text-lg">{nft.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary/70" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-xl text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Creator & Owner */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-surface/50 backdrop-blur-xl rounded-2xl border border-surface/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground/90">Created by</h4>
                    <p className="text-primary font-mono text-sm bg-surface/70 px-2 py-1 rounded-lg">
                      {nft.creator}
                    </p>
                  </div>
                </div>
              </div>

              {nft.owner && (
                <div className="space-y-2 p-4 bg-surface/50 backdrop-blur-xl rounded-2xl border border-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-xl">
                      <Shield size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground/90">Current Owner</h4>
                      <p className="text-secondary font-mono font-semibold text-sm bg-surface/70 px-2 py-1 rounded-lg">
                        {nft.owner}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            {nft.price && (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <span className="font-black text-primary text-xs">XLM</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Asset Value</p>
                    <p className="text-3xl font-black text-slate-900">{nft.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              {isCreatedByMe && (
                <button
                  onClick={() => onEdit(nft.id)}
                  className="flex-1 bg-slate-100 text-slate-900 font-black py-4 px-6 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={20} />
                  Edit Artwork
                </button>
              )}
              {isOwnedByMe && (
                <button
                  onClick={() => onSale(nft.id)}
                  className="flex-1 bg-primary text-slate-900 font-black py-4 px-6 rounded-2xl hover:bg-primary/80 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <Tag size={20} />
                  List for Sale
                </button>
              )}
              {!isOwnedByMe && (
                <button className="flex-1 bg-slate-200 text-slate-400 font-black py-4 px-6 rounded-2xl cursor-not-allowed">
                  Collect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

