'use client'

import React from 'react'
import { 
  LayoutDashboard, Palette, Briefcase, 
  ShoppingBag, User, PlusCircle, LogOut 
} from 'lucide-react'
import { UploadArtModalTrigger } from './UploadArtModalTrigger';
import Link from 'next/link';

export type TabType = 'overview' | 'my-works' | 'earnings' | 'settings'

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-works', label: 'My Collections', icon: Palette },
    { id: 'earnings', label: 'Earnings', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: ShoppingBag },
  ] as const

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-72 bg-white border-r border-slate-100 p-8 hidden lg:flex flex-col z-40">
      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100">
         <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-xs">AV</div>
         <div>
            <p className="text-sm font-black text-slate-900">Creator Panel</p>
            <p className="text-[10px] font-bold text-slate-400">Manage assets</p>
         </div>
      </div>

<UploadArtModalTrigger />

      <div className="space-y-3 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as TabType)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black transition-all text-xs uppercase tracking-widest
              ${activeTab === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-primary' : 'text-slate-300'} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-slate-50">
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Verification Status</p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               <span className="text-[10px] font-black text-slate-900">Artist Verified</span>
            </div>
         </div>
      </div>
    </aside>
  )
}
