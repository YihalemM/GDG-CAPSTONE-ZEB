'use client'

import React, { useState, useEffect } from 'react'
import {
  User, DollarSign, Image as ImageIcon, Briefcase, Activity, Plus
} from 'lucide-react'
import { useWallet } from '../../providers/WalletProvider'
import { useDashboardArts } from '../../hooks/useDashboardArts'
import { UploadArtModalTrigger } from './UploadArtModalTrigger'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Helper component for displaying stats
const StatCard = ({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend?: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default function Overview() {
  const creatorArtsQuery = useDashboardArts('creator');
  const ownerArtsQuery = useDashboardArts('owner');
  const { wallet } = useWallet();
  const [username, setUsername] = useState('Creator');

  const stats = {
    owned: ownerArtsQuery.data?.data.length || 0,
    bought: 0, 
    totalEarnings: 0, 
  };

  React.useEffect(() => {
    if (wallet?.address) {
      const stored = localStorage.getItem('zeb_username');
      setUsername(stored || 'Creator');
    }
  }, [wallet]);

  // Mock chart data
  const chartData = [30, 45, 35, 60, 55, 80, 75]
  const maxValue = Math.max(...chartData)
  const chartWidth = 600
  const chartHeight = 200

  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth
    const y = chartHeight - (val / maxValue) * chartHeight
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-4">
         <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back, {username}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your creative empire is growing every day</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} icon={<DollarSign size={18} className="text-emerald-500" />} trend="+12.5%" />
        <StatCard label="Items Created" value={creatorArtsQuery.data?.data.length?.toString() || '0'} icon={<ImageIcon size={18} className="text-purple-500" />} />
        <StatCard label="Items Owned" value={stats.owned.toString()} icon={<User size={18} className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Portfolio Analytics</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Growth performance over the last 30 days</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               Last 30 Days
            </div>
          </div>
          
          <div className="relative h-[200px] w-full px-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                 </linearGradient>
              </defs>
              <path
                d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`}
                fill="url(#chartGradient)"
              />
              <polyline
                fill="none"
                stroke="#22D3EE"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
            <div className="flex justify-between mt-8 border-t border-slate-50 pt-6">
               {['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'].map(w => (
                  <span key={w} className="text-[9px] font-black text-slate-300 tracking-widest">{w}</span>
               ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0F172A] p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col">
          <h3 className="text-xl font-black text-white mb-8 relative z-10">Asset Insights</h3>
          <div className="space-y-6 flex-1 relative z-10">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Top Selling Category</p>
                <p className="text-sm font-black text-white">Digital Fine Art</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Market Engagement</p>
                <p className="text-sm font-black text-white">+24.5% Higher</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Platform Rank</p>
                <p className="text-sm font-black text-white">#12 Creator</p>
             </div>
          </div>
          <UploadArtModalTrigger />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-400/10 blur-[80px] rounded-full" />
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12 uppercase tracking-tight">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
            <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900">View History</button>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Action</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Asset</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Date</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {[
                  { action: 'Listed', name: 'Prism Core v1', price: '4.50 ETH', date: '2 Hours Ago' },
                  { action: 'Bought', name: 'Desert Solitude', price: '2.15 ETH', date: '1 Day Ago' },
                  { action: 'Minted', name: 'Golden Ratio', price: '-', date: '3 Days Ago' },
               ].map((sale, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest`}>
                           {sale.action}
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900">{sale.name}</span>
                     </td>
                     <td className="px-8 py-6 font-black text-slate-900 text-sm">{sale.price}</td>
                     <td className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">{sale.date}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}
