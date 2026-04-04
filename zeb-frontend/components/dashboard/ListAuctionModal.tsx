'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Tag, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useCreateAuction } from '../../hooks/useCreateAuction'
import { Art } from '../../lib/types'
import { useWallet } from '../../providers/WalletProvider'

// Custom simple modal (shadcn/ui not available)
const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
  open ? <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">{children}</div> : null
)
const DialogContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-surface rounded-3xl p-0 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface/50 ${className}`}>
    {children}
  </div>
)
const DialogHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`p-6 pb-4 ${className}`}>{children}</div>
const DialogTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <h2 className={`text-2xl font-black ${className}`}>{children}</h2>
const DialogDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <p className={`text-foreground/70 ${className}`}>{children}</p>
const Button = ({ children, onClick, variant = 'default', className = '', disabled }: { children: React.ReactNode; onClick: () => void; variant?: 'default' | 'outline'; className?: string; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'outline' ? 'border border-surface text-foreground hover:bg-surface/50' : 'bg-primary text-slate-900 hover:shadow-lg shadow-primary/25'} ${className}`}
  >
    {children}
  </button>
)
const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <label className={`block text-sm font-black uppercase tracking-wider mb-2 ${className}`}>{children}</label>
const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <button className="w-full p-3 border border-surface/30 rounded-xl bg-surface/50 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left font-bold" onClick={() => setOpen(!open)}>
        {value || 'Select...'}
      </button>
      {open && <div className="absolute top-full left-0 right-0 bg-surface border border-surface/50 rounded-xl shadow-2xl mt-1 z-10">{children}</div>}
    </div>
  )
}
const SelectTrigger = Select as any
const SelectValue = ({ children }: any) => children
const SelectContent = ({ children }: any) => children
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <button 
    className="w-full text-left px-4 py-3 hover:bg-primary/10 first:rounded-t-xl last:rounded-b-xl" 
  >
    {children}
  </button>
)



interface ListAuctionModalProps {
  artId: string | null
  isOpen: boolean
  onClose: () => void
  art?: Art // Pass full art data
}

export default function ListAuctionModal({ artId, isOpen, onClose, art }: ListAuctionModalProps) {
  const [durationDays, setDurationDays] = useState(3)
  const { mutateAsync: createAuction, isPending } = useCreateAuction()
  const { wallet } = useWallet()

  useEffect(() => {
    if (isOpen && artId) {
      // Fetch art details if not passed
      console.log('Fetch art for listing:', artId)
    }
  }, [artId, isOpen])

  const handleList = async () => {
    if (!artId || !wallet?.address || !art?.contentHash) return
    try {
      const end_time = Date.now() + durationDays * 86400000;
      await createAuction({ art_hash: art.contentHash, seller: wallet.address, end_time })
      
      const { createAuctionOnChain } = await import('../../lib/stellar');
      await createAuctionOnChain(art.contentHash, wallet.address, Date.now() ,Math.floor(end_time / 1000));
      
      onClose()
      // Optional: setActiveTab('listings') via context/parent
    } catch (error) {
      console.error('Listing failed', error)
    }
  }

  if (!isOpen || !art) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-secondary" />
            List for Auction
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-bold text-sm">
            List your masterpiece for auction with a <span className="text-secondary font-black">{art.minPrice} XLM</span> reserve price.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Art Preview */}
          <div className="relative aspect-video bg-surface rounded-2xl overflow-hidden border">
            <Image
              src={art.filePath.includes('uploads/') 
                ? `https://zeb-1.onrender.com/${art.filePath}`
                : art.filePath}
              alt={art.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/40" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-black text-xl">{art.title}</h3>
              <p className="text-sm opacity-90">Reserve: {art.minPrice} XLM</p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-sm font-black uppercase tracking-wider mb-2 block">
              Auction Duration
            </Label>
            <Select value={durationDays.toString()} onValueChange={(v) => setDurationDays(parseInt(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day (Fast)</SelectItem>
                <SelectItem value="3">3 Days (Recommended)</SelectItem>
                <SelectItem value="7">7 Days (Max Exposure)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-foreground/60 mt-1">
              Ends {new Date(Date.now() + durationDays * 86400000).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-slate-900 font-black shadow-lg shadow-primary/10"
              onClick={handleList}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-2" />
                  List Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

