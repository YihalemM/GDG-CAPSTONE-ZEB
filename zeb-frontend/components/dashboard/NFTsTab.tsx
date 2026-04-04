'use client'

import React, { useState, useMemo } from 'react'
import { UploadArtModalTrigger } from './UploadArtModalTrigger'
import { Search, Filter, BookOpen, Music, Palette, UploadCloud } from 'lucide-react'
import NFTCard from './NFTCard'
import NFTDetailModal from './NFTDetailModal'
import ListAuctionModal from './ListAuctionModal'
import { useDashboardArts } from '@/hooks/useDashboardArts'
import { useQuery } from '@tanstack/react-query'
import { getSellerAuctions } from '@/lib/api'
import { useWallet } from '@/providers/WalletProvider'
import type { NFTCardProps, Status } from './NFTCard'
import type { Art } from '@/lib/types'


interface NFT {
  id: number
  title: string
  description: string
  creator: string
  owner?: string
  price: string
  img: string
  type: 'book' | 'literary work' | 'digital art' | 'music'
  genre: 'hip hop' | 'classic' | 'rock' | 'pop' | 'jazz' | 'other'
  status?: 'auction' | 'direct'
}

type TabType = 'owned' | 'created' | 'listings'

const rawOwnedNFTs: NFT[] = [
  { id: 1, title: 'Cosmic Rift by NovaCollect', description: 'A mesmerizing cosmic landscape that captures the birth of stars in vibrant neon colors.', creator: 'NovaC...K7P2', owner: 'You', price: '450 XLM', img: '/file.svg', type: 'digital art', genre: 'rock' },
  { id: 2, title: 'Digital Lotus #44', description: 'Limited edition generative lotus flower rendered with mathematical precision and symmetry.', creator: 'ArtByZ...4M9Q', owner: 'You', price: '890 XLM', img: '/file.svg', type: 'book', genre: 'classic' },
  { id: 3, title: 'Aurora Code Rain', description: 'Matrix-style code rain meets northern lights in a hypnotic generative animation.', creator: 'CodeR...H8J5', owner: 'You', price: '320 XLM', img: '/file.svg', type: 'digital art', genre: 'hip hop' },
  { id: 4, title: 'Pixel Nebula Drift', description: 'Retro pixel art nebula with smooth drifting particles and 8-bit color palette.', creator: 'PixelN...2L6R', owner: 'You', price: '560 XLM', img: '/file.svg', type: 'music', genre: 'jazz' },
  { id: 5, title: 'Synthwave Horizon', description: '80s synthwave sunset with palm trees, chrome cars, and glowing grid horizon.', creator: 'Synth...9F3V', owner: 'You', price: '420 XLM', img: '/file.svg', type: 'digital art', genre: 'pop' },
  { id: 6, title: 'Glitch Archive #12', description: 'Datamoshed VHS glitches archived as permanent digital artifacts.', creator: 'Glitch...M5T1', owner: 'You', price: '290 XLM', img: '/file.svg', type: 'literary work', genre: 'other' },
]

const rawCreatedNFTs: NFT[] = [
  { id: 1, title: 'Neon Syntax #001', description: 'First in generative syntax series - code as poetry rendered in pure neon glow.', creator: 'GCF2A...3X9Y', price: '450 XLM', img: '/file.svg', type: 'digital art', genre: 'hip hop' },
  { id: 2, title: 'Cyber Bloom Genesis', description: 'Organic cyberpunk flowers blooming from corrupted data streams.', creator: 'GCF2A...3X9Y', price: '320 XLM', img: '/file.svg', type: 'digital art', genre: 'pop' },
  { id: 4, title: 'Stellar Orbit Drift', description: 'Planetary orbits visualized with particle drift and gravitational lensing effects.', creator: 'GCF2A...3X9Y', price: '240 XLM', img: '/file.svg', type: 'music', genre: 'classic' },
  { id: 5, title: 'Magenta Pulse Matrix', description: 'Pulsating matrix rain in pure magenta with rhythmic frequency modulation.', creator: 'GCF2A...3X9Y', price: '590 XLM', img: '/file.svg', type: 'digital art', genre: 'jazz' },
  { id: 6, title: 'Ethereum Echo', description: 'Echoes of blockchain transactions visualized as haunting digital poetry.', creator: 'GCF2A...3X9Y', price: '180 XLM', img: '/file.svg', type: 'literary work', genre: 'other' },
]

const rawSellingNFTs: NFT[] = [
  { id: 7, title: 'Neon Syntax #001', description: 'First in generative syntax series - code as poetry rendered in pure neon glow.', creator: 'You (GCF2A...3X9Y)', price: '300 XLM', img: '/file.svg', type: 'digital art', genre: 'hip hop', status: 'auction' as const },
  { id: 8, title: 'Cyber Bloom Genesis', description: 'Organic cyberpunk flowers blooming from corrupted data streams.', creator: 'You (GCF2A...3X9Y)', price: '650 XLM', img: '/file.svg', type: 'digital art', genre: 'pop', status: 'auction' as const },
  { id: 9, title: 'Stellar Orbit Drift', description: 'Planetary orbits visualized with particle drift and gravitational lensing effects.', creator: 'You (GCF2A...3X9Y)', price: '180 XLM', img: '/file.svg', type: 'music', genre: 'classic', status: 'auction' as const },
  { id: 10, title: 'Magenta Pulse Matrix', description: 'Pulsating matrix rain in pure magenta with rhythmic frequency modulation.', creator: 'You (GCF2A...3X9Y)', price: '420 XLM', img: '/file.svg', type: 'digital art', genre: 'jazz', status: 'auction' as const },
]

export default function NFTsTab() {
  const [activeTab, setActiveTab] = useState<TabType>('owned')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'book' | 'literary work' | 'digital art' | 'music' | 'all'>('all')
  const [selectedGenre, setSelectedGenre] = useState<'hip hop' | 'classic' | 'rock' | 'pop' | 'jazz' | 'other' | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'auction'>('all')
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedForListing, setSelectedForListing] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { wallet } = useWallet()
  const creatorArts = useDashboardArts('creator');
  const ownedArts = useDashboardArts('owner');
  const sellerAuctions = useQuery({
    queryKey: ['auctions', wallet?.address],
    queryFn: () => getSellerAuctions(wallet?.address || ''),
    enabled: !!wallet?.address,
  });

  React.useEffect(() => {
    if (creatorArts.data || ownedArts.data) {
      setIsLoading(false);
    }
  }, [creatorArts.data, ownedArts.data]);

  const getCurrentNfts = () => {
    if (activeTab === 'owned') return ownedArts.data?.data || [];
    if (activeTab === 'created') return creatorArts.data?.data || [];
    if (activeTab === 'listings') return sellerAuctions.data?.data || [];
    return [];
  };

  const nfts = getCurrentNfts() as Art[];

  const filteredNFTs = useMemo(() => {
    return (nfts as any[]).filter((nft: any) => {
      const matchesSearch = nft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            nft.creatorBy?.toLowerCase().includes(searchQuery.toLowerCase())
      // Skip type/genre for listings/real data (mock fields)
      const matchesStatus = selectedStatus === 'all'
      return matchesSearch && matchesStatus
    })
  }, [nfts, searchQuery, selectedStatus])

  const emptyMessage = activeTab === 'owned' 
    ? 'No NFTs in your collection yet → Browse marketplace to start collecting!'
    : activeTab === 'created' 
    ? 'No artworks registered yet → Connect wallet and browse marketplace!'
    : 'No items selling → List your first item for sale!'

  return (
    <section className=" w-full ">
      <div className=" px-1">
        {/* Tab Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
          <div className="flex bg-surface/80 backdrop-blur-xl rounded-2xl shadow-xl border border-surface/50  w-full">
            <button
              onClick={() => setActiveTab('owned')}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg transition-all duration-500 ${
                activeTab === 'owned'
                  ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              My NFTs
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-base transition-all duration-500 ${
                activeTab === 'created'
                  ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-base transition-all duration-500 ${
                activeTab === 'listings'
                  ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Listings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-surface/60 backdrop-blur-2xl border border-surface shadow-2xl p-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-surface/80 backdrop-blur-xl rounded-2xl p-2 border border-surface/50">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-surface/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-3 flex-1 lg:flex-none">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-surface/50 border border-surface/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Types</option>
                <option value="book">Books</option>
                <option value="literary work">Literary</option>
                <option value="digital art">Digital Art</option>
                <option value="music">Music</option>
              </select>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-surface/50 border border-surface/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Genres</option>
                <option value="hip hop">Hip Hop</option>
                <option value="classic">Classic</option>
                <option value="rock">Rock</option>
                <option value="pop">Pop</option>
                <option value="jazz">Jazz</option>
                <option value="other">Other</option>
              </select>
{activeTab === 'listings' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="flex-1 px-3 py-2 bg-surface/50 border border-surface/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="all">All Listings</option>
                  <option value="auction">Auction</option>
                  <option value="selling">Selling</option>
                </select>
              )}
            </div>
            <UploadArtModalTrigger />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNFTs.map((nft) => {
              const key = nft.id.toString();
              const id = nft.id.toString();
              const commonProps = {
                id,
                title: nft.title,
                image: nft.img,
                isOwner: activeTab === 'owned',
                isCreator: activeTab === 'created' || activeTab === 'owned',
              };

              if (activeTab === 'owned') {
                return <NFTCard key={nft._id} {...commonProps} id={nft._id} title={nft.title || 'Untitled'} image={nft.filePath || '/file.svg'} status="NOT_LISTED" price={nft.minPrice || 0} onSell={() => setSelectedForListing(nft._id || nft.contentHash || '')} onCardClick={() => {
                  setSelectedNFT({ id: 1, title: nft.title, price: nft.minPrice?.toString() || '0', img: nft.filePath, creator: nft.creatorBy, type: 'digital art' as const, genre: 'other' as const } as any)
                  setIsModalOpen(true)
                }} />;
              }

              if (activeTab === 'created') {
                const status = nft.status === 'auction' ? "AUCTION" : "FIXED_PRICE" as const;
                return <NFTCard key={key} {...commonProps} status={status} price={parseFloat(nft.price)} onView={() => console.log('View created NFT', nft.id)} onCardClick={() => {
                  setSelectedNFT(nft)
                  setIsModalOpen(true)
                }} />;
              }

              // Listings tab customization - mix auction and selling (fixed price)
              const isAuction = nft.status === 'auction';
              const listingsStatus = isAuction ? "AUCTION" : "FIXED_PRICE" as const;
              const price = parseFloat(nft.price);
              const auctionEndTime = Date.now() + (Math.random() * 24 + 1) * 60 * 60 * 1000; // 1-25h mock
              return <NFTCard 
                key={key}
                {...commonProps} 
                status={listingsStatus}
                price={price}
                currentBid={isAuction ? price + Math.floor(Math.random() * 200) : undefined}
                endTime={isAuction ? auctionEndTime : undefined}
                onUpdatePrice={() => console.log('Update price Listings', nft.id)}
                onViewAuction={() => console.log('View auction Listings', nft.id)}
                onCardClick={() => {
                  setSelectedNFT(nft)
                  setIsModalOpen(true)
                }}
              />;
            })}
            {filteredNFTs.length === 0 && (
              <div className="col-span-full text-center py-32 text-foreground/50 bg-surface/30 rounded-2xl p-12">
                <Palette size={64} className="mx-auto mb-6 text-primary opacity-50" />
                <h3 className="text-2xl font-black mb-4 text-foreground/70">{activeTab === 'owned' ? 'Empty Collection' : activeTab === 'created' ? 'Nothing Created' : 'Nothing Selling'}</h3>
                <p className="text-xl mb-8 max-w-md mx-auto leading-relaxed">{emptyMessage}</p>
                <Link 
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 hover:shadow-xl transition-all shadow-lg"
                >
                  {activeTab === 'owned' ? 'Browse Marketplace' : activeTab === 'created' ? 'Browse Marketplace' : 'Register Artwork'}
                </Link>
              </div>
            )}
            <NFTDetailModal
              nft={selectedNFT}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              currentUserAddress={wallet?.address || 'GCF2A...3X9Y'}
              onSale={(nftId) => {
                console.log('Open sale for NFT', nftId)
                setIsModalOpen(false)
              }}
              onEdit={(nftId) => {
                console.log('Edit NFT', nftId)
                setIsModalOpen(false)
              }}
            />
            <ListAuctionModal artId={selectedForListing} isOpen={!!selectedForListing} onClose={() => setSelectedForListing(null)} />
          </div>
        </div>
      </div>
    </section>
  )
}
import Link from 'next/link'


