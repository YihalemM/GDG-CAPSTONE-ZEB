'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Wallet, ShieldCheck, TrendingUp, Gavel, BarChart3, Edit } from 'lucide-react'

export default function ProfileHeader() {
  const [userData, setUserData] = React.useState<any>(null)
  const [address, setAddress] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { getAddress } = await import('@stellar/freighter-api');
        const { address: userAddr } = await getAddress();
        setAddress(userAddr);

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api';
        const response = await fetch(`${baseUrl}/users/${userAddr}`);
        const result = await response.json();

        if (result.status === 'ok') {
          setUserData(result.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const displayUser = {
    username: userData?.username || 'User',
    wallet: address ? `${address.slice(0, 8)}...${address.slice(-3)}` : 'Not Connected',
    totalNFTs: userData?.totalNFTs || 0, // In a real app, we'd fetch this from another endpoint or aggregate
    activeAuctions: 0,
    winningBids: 0,
    portfolioGrowth: '0%'
  }

  return (
    <section className="py-6 mx-6 text-center">
      {/* Profile Top */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 bg-surface/50 backdrop-blur-xl rounded-3xl px-4 py-2 border border-surface/30 shadow-2xl">
        <div className="relative">
          <div className="w-[60px] h-[60px] bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20 shadow-xl shadow-primary/5">
             <User size={30} className="text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-2xl shadow-lg border border-white/20">
            <User size={10} className="text-white" />
          </div>
        </div>
        <div className="flex-1 text-left md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-black text-secondary tracking-tight">
              {isLoading ? 'Loading...' : displayUser.username}
            </h1>
            <Link href="/dashboard/profile" className="ml-2 p-1.5 bg-primary/20 rounded-xl hover:bg-primary/40 transition-all group">
              <Edit size={16} className="text-primary group-hover:text-background transition-colors" />
            </Link>
          </div>
          <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-foreground/80 ">
            <Wallet size={24} className="text-primary shrink-0" />
            <span className="font-mono bg-surface/50 px-2 py-2 rounded-xl border border-surface/50 backdrop-blur-sm">
              {displayUser.wallet}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-18">
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <BarChart3 size={28} className="text-primary group-hover:scale-110 transition-transform mb-2" />
          <div className="text-xl font-black text-secondary ">{displayUser.totalNFTs}</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total NFTs</p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <ShieldCheck size={28} className="text-secondary group-hover:scale-110 transition-transform mb-2" />
          <div className="text-xl font-black text-secondary ">{displayUser.activeAuctions}</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Auctions</p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <Gavel size={28} className="text-primary group-hover:scale-110 transition-transform mb-2" />
          <div className="text-xl font-black text-secondary ">{displayUser.winningBids}</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Winning Bids</p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <TrendingUp size={28} className="text-primary group-hover:scale-110 transition-transform mb-2" />
          <div className="text-xl font-black text-secondary ">{displayUser.portfolioGrowth}</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portfolio Growth</p>
        </div>
      </div>
    </section>
  )
}

