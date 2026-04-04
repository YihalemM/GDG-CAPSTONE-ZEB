import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArtCard from '@/components/marketplace/ArtCard';
import { Search } from 'lucide-react';

const CATEGORY_FILTERS: Record<string, string[]> = {
  'digital-art': ['All', '2D Art', '3D Art', 'Pixel Art', 'Photography'],
  'music': ['All', 'Electronic', 'Hip-Hop', 'Acoustic', 'Ambient'],
  'writing': ['All', 'Fiction', 'Poetry', 'Essays', 'Research'],
};

const CATEGORY_TITLES: Record<string, string> = {
  'digital-art': 'Digital Art',
  'music': 'Music',
  'writing': 'Writing',
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params;
  
  // Normalize category or fallback
  const normalizedCategory = category.toLowerCase();
  const title = CATEGORY_TITLES[normalizedCategory] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  const filters = CATEGORY_FILTERS[normalizedCategory] || ['All', 'Trending', 'New', 'Top Rated'];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-grow pb-24">
        {/* Header & Search */}
        <section className="pt-16 pb-8 px-6 max-w-7xl mx-auto border-b border-surface/50">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-slate-900 uppercase">
                {title}
              </h1>
              <p className="text-lg text-foreground/70">
                Explore the latest and greatest in {title.toLowerCase()}.
              </p>
            </div>
            
            {/* Category Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-foreground/50 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder={`Search ${title.toLowerCase()}...`} 
                className="w-full bg-surface/40 backdrop-blur-md border border-surface text-foreground rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary shadow-[0_4px_30px_rgba(0,0,0,0.1)] focus:shadow-[0_0_15px_rgba(51,255,235,0.15)] transition-all duration-300 placeholder:text-foreground/40"
              />
            </div>
          </div>
        </section>

        {/* Sub-genre Filter Bar */}
        <section className="py-6 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-3 snap-x w-full md:w-auto">
            {filters.map((filter, index) => (
              <button 
                key={filter}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 snap-center
                  ${index === 0 
                    ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 hover:bg-primary/80' 
                    : 'bg-white border border-slate-100 text-slate-400 hover:border-primary/50 hover:text-primary'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex bg-white p-1 rounded-full border border-slate-100 flex-shrink-0 shadow-sm">
            <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-white shadow-md">All</button>
            <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">For Sale</button>
            <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">For Bid</button>
          </div>
        </section>

        {/* Category Artworks Grid */}
        <section className="py-8 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Popular {title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Generating 6 dummy cards for the grid */}
            {[1, 2, 3, 4, 5, 6].map((i) => {
              const isBid = i % 2 === 0;
              return (
              <ArtCard 
                key={i}
                hash={`0x${Math.floor(1234567 + i * 890123).toString(16)}`}
                saleType={isBid ? 'bid' : 'sale'}
                image={`https://images.unsplash.com/photo-${1600000000000 + i * 123456}?q=80&w=2670&auto=format&fit=crop`}
                title={`${title} Item #${1000 + i}`}
                creator={`0x${Math.floor(1234567 + i * 890123).toString(16)}...${Math.floor(9876543 + i * 210987).toString(16).slice(0,4)}`}
                createdAt={`${i * 2}h ago`}
                description={`An exceptional piece of ${title.toLowerCase()} that pushes the boundaries of the medium.`}
                price={`${((i * 1.5) % 5 + 0.1).toFixed(2)} XLM`}
              />
            )})}
          </div>
        </section>
      </main>
      
      <Footer hideCTA={true} />
    </div>
  );
}
