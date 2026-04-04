'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Clock, Info, ShoppingCart, Gavel, Sparkles, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { buynow, placeBidOnChain } from '../../../lib/stellar'

interface ArtCardData {
  image?: string
  title: string
  creator: string
  price: string
  timer?: string
  hash?: string
  createdAt?: string
  description?: string
  saleType?: 'sell' | 'auction'
  bidders?: number
  fileType?: string
  filePath?: string
  minPrice?: string
  contentHash?: string
  creatorBy?: string
  auctionEndTime?: string
}

export default function ArtworkDetailPage() {
  const params = useParams()
  const hash = params.hash as string
  const [art, setArt] = useState<ArtCardData | null>(null)
  const [buyer, setBuyer] = useState('')
  const [message, setMessage] = useState('')
  const [bidAmount, setBidAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const handleBid = async () => {
    try {
      if (!buyer) {
        alert('Connect wallet first')
        return
      }

      if (!bidAmount || bidAmount <= 0) {
        alert('Enter valid bid amount')
        return
      }

      setActionLoading(true)
      setMessage('Placing bid...')

      // Note: placeBidOnChain is the correct function name from lib/stellar
      const tx = await placeBidOnChain(art?.contentHash || '', buyer, bidAmount)

      setMessage('Bid placed successfully!')
      console.log(tx)
    } catch (err: any) {
      console.error(err)
      alert(`Bid failed: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBuy = async () => {
    try {
      if (!buyer) {
        alert('Connect wallet first')
        return
      }

      if (!art?.contentHash) {
        alert('Invalid artwork')
        return
      }

      setActionLoading(true)
      console.log('Buying:', art.contentHash, buyer)

      const tx = await buynow(art.contentHash, buyer)

      console.log('Transaction success:', tx)
      alert("Purchase successful!")
if (art.creatorBy && art.minPrice) {
  updateEarnings(art.creatorBy, Number(art.minPrice));
}
    } catch (err: any) {
      console.error('Buy failed:', err)
      alert(`Buy failed: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const updateEarnings = async (pkey: string, amount: number) => {
    try {
      const response = await fetch(`https://zeb-1.onrender.com/api/users/update-earning/${pkey}`, {
        method: 'PUT', // or POST depending on your route definition
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();
      if (result.status === 'ok') {
        console.log("Earnings updated in database");
      }
    } catch (err) {
      console.error("Failed to update database earnings:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { getAddress } = await import('@stellar/freighter-api')
        const { address: buyerAddress } = await getAddress()
        setBuyer(buyerAddress)

        const artres = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api'}/arts/${hash}`)
        const data = await artres.json()

        if (data.status === 'ok') {
          setArt(data.data) 
        }
        console.log(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hash])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  )
  
  if (!art) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <h2 className="text-2xl font-black text-slate-900">Artwork Not Found</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The requested masterpiece doesn't exist.</p>
    </div>
  )

  const imageUrl = art.fileType === "image" ? `${(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api').replace('/api', '')}/${art.filePath}` : ""

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar showSearch={true} />

      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          
          {/* LEFT IMAGE */}
          <div className="relative aspect-square w-full bg-white rounded-[48px] p-6 shadow-2xl border border-white">
            <img
              src={imageUrl || '/placeholder.png'}
              alt={art.title}
              className="w-full h-full object-cover rounded-[32px] shadow-lg"
            />

            <div className="absolute top-12 left-12 z-20 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Verified Asset
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col pt-4">
            <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">
              {art.title}
            </h1>

            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm font-bold text-slate-400">By</span>
              <span className="text-sm font-black text-primary">
                @{art.creatorBy?.slice(0, 8)}...
              </span>
            </div>

            {/* PRICE BOX */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl mb-8">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                    {art.saleType === 'auction' ? 'MINIMUM BID' : 'FIXED PRICE'}
                  </p>
                  <span className="text-5xl font-black text-slate-900">
                    {art.minPrice} <span className="text-lg text-slate-400">XLM</span>
                  </span>
                </div>

                {art.saleType === 'auction' && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                      Bidders
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {art.bidders || 0}
                    </p>
                  </div>
                )}
              </div>

              {art.saleType === 'auction' && (
                <div className="flex items-center gap-2 mb-10 text-slate-400">
                  <Clock size={16} />
                  <span className="text-xs font-bold">
                    Ends In:{' '}

                    <span className="text-slate-900">
                      {art.auctionEndTime || 'N/A'}
                    </span>
                  </span>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col gap-4">
                {art.saleType === 'sell' && (
                  <button
                    disabled={actionLoading}
                    onClick={handleBuy}
                    className="w-full py-5 bg-primary text-slate-900 font-black rounded-2xl text-sm hover:bg-primary/80 transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <ShoppingCart size={18} />}
                    {actionLoading ? 'Processing...' : 'Buy Now'}
                  </button>
                )}

                {art.saleType === 'auction' && (
                  <>
                    <div className="relative mb-2">
                       <input
                        type="number"
                        placeholder="Enter bid amount..."
                        value={bidAmount || ''}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-primary/50 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">XLM</span>
                    </div>

                    <button
                      disabled={actionLoading}
                      onClick={handleBid}
                      className="w-full py-5 bg-secondary text-white font-black rounded-2xl text-sm hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Gavel size={18} />}
                      {actionLoading ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            {art.description && (
              <div className="flex items-start gap-4 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                <Info size={20} className="text-primary" />
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Verification Description</p>
                   <p className="text-sm font-bold text-slate-500 leading-relaxed">
                     {art.description}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
