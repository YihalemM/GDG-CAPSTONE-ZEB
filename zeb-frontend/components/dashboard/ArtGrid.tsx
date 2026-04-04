'use client'

import React, { useState, useEffect } from 'react'
import NFTCard from './NFTCard'
import { Search, Loader2, Filter, UploadCloud } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ArtGridProps {
  filter: 'created' | 'owned' | 'all'
  title: string
  emptyMessage: string
  showMarketActions?: boolean
}

export default function ArtGrid({ filter, title, emptyMessage, showMarketActions }: ArtGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { getAddress } = await import('@stellar/freighter-api')
        const { address } = await getAddress()
        setUserAddress(address)

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api'
        let url = `${baseUrl}/arts`
        if (filter === 'created') url = `${baseUrl}/arts/creator/${address}`
        else if (filter === 'owned') url = `${baseUrl}/arts/owner/${address}`

        const res = await fetch(url)
        const data = await res.json()
        if (data.status === 'ok') {
          setItems(data.data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filter])

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.creatorBy.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface/30 backdrop-blur-xl p-6 rounded-[32px] border border-surface/50 shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
          <input 
            type="text" 
            placeholder="Search artworks, creators..." 
            className="w-full bg-surface/50 border border-surface/50 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface/50 border border-surface/50 rounded-2xl font-bold hover:bg-surface transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="font-black text-foreground/40 uppercase tracking-widest">Loading Masterpieces...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NFTCard
                id={item._id}
                title={item.title}
                image={item.filePath.includes('uploads/') 
                  ? `${(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api').replace('/api', '')}/${item.filePath}` 
                  : item.filePath}
                status={item.listingStatus || 'NOT_LISTED'}
                price={item.minPrice}
                isOwner={item.ownedBy === userAddress}
                isCreator={item.creatorBy === userAddress}
                onBuy={showMarketActions && item.ownedBy !== userAddress ? () => console.log('Buy', item._id) : undefined}
                onBid={showMarketActions && item.ownedBy !== userAddress && item.listingStatus === 'AUCTION' ? () => console.log('Bid', item._id) : undefined}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-surface/30 backdrop-blur-xl p-20 rounded-[40px] border border-surface/50 text-center space-y-6">
          <UploadCloud size={64} className="mx-auto text-primary/40" />
          <h3 className="text-3xl font-black">{title} Empty</h3>
          <p className="text-xl text-foreground/50 max-w-md mx-auto leading-relaxed">{emptyMessage}</p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-primary text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-primary/80 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Upload Artwork
          </Link>
        </div>
      )}
    </div>
  )
}
