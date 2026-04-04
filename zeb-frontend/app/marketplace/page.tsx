'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ArtCard from '../../components/marketplace/ArtCard';

export default function MarketplacePage() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const categories = ['All', 'image', 'music', 'video', 'text'];

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/arts`);
      const data = await res.json();
      if (res.ok) {
        setArtworks(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching artworks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      const titleMatch = (art.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'All' || (art.category || "").toLowerCase() === selectedCategory.toLowerCase();
      
      let typeMatch = true;
      if (selectedType === 'sale') {
        typeMatch = art.listingType === 'fixed';
      } else if (selectedType === 'bid') {
        typeMatch = art.listingType === 'auction';
      }

      return titleMatch && categoryMatch && typeMatch;
    });
  }, [artworks, searchTerm, selectedCategory, selectedType]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 mt-24">
        {/* Header & Search */}
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="relative flex-1 max-w-xl group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-400 transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search assets by name..." 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-black text-slate-900 focus:outline-none focus:border-cyan-400/30 transition-all placeholder:text-slate-300"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                       <X size={14} />
                    </button>
                 )}
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                 <button 
                  onClick={() => setSelectedType('All')}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === 'All' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-300 hover:text-slate-500'}`}
                 >All</button>
                 <button 
                  onClick={() => setSelectedType('sale')}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === 'sale' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-300 hover:text-slate-500'}`}
                 >Fixed Price</button>
                 <button 
                  onClick={() => setSelectedType('bid')}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === 'bid' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-300 hover:text-slate-500'}`}
                 >Auction</button>
              </div>
           </div>

           {/* Categories */}
           <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
              {categories.map(cat => (
                 <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-cyan-400 hover:text-slate-900'}`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2 max-w-7xl mx-auto w-full">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Showing <span className="text-slate-900">{filteredArtworks.length}</span> Results</p>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sort By:</span>
              <button className="flex items-center gap-1 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                 Latest <ChevronDown size={14} />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
           {loading ? (
              <div className="py-32 flex justify-center">
                 <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
           ) : filteredArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredArtworks.map((art) => (
                  <ArtCard 
                    key={art._id}
                    hash={art._id}
                    title={art.title}
                    creator={art.creatorBy}
                    price={`${parseFloat(art.minPrice) >= 1000000 ? (parseFloat(art.minPrice) / 10000000).toFixed(2) : parseFloat(art.minPrice).toFixed(2)} XLM`}
                    image={art.filePath ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '')}/${art.filePath}` : "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=800"}
                    saleType={art.listingType === 'auction' ? 'bid' : 'sale'}
                    timer={art.listingType === 'auction' ? "24:00:00" : undefined}
                  />
                ))}
              </div>
           ) : (
              <div className="py-32 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                    <Search size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">No items found</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Try adjusting your filters or search terms.</p>
              </div>
           )}

           {/* Pagination placeholder */}
           {filteredArtworks.length > 0 && (
             <div className="mt-20 flex items-center justify-center gap-8">
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                   <ChevronLeft size={24} />
                </button>
                <span className="text-xs font-black text-slate-900 tracking-widest">Page 1 of 1</span>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                   <ChevronRight size={24} />
                </button>
             </div>
           )}
        </div>
      </main>

      <Footer hideCTA={true} />
    </div>
  );
}
