'use client'

import React, { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Sidebar, { TabType } from '../../components/dashboard/Sidebar'
import Overview from '../../components/dashboard/Overview'
import WalletView from '../../components/dashboard/WalletView'
import ProfileHeader from '../../components/dashboard/ProfileHeader'
import ArtGrid from '../../components/dashboard/ArtGrid'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'my-works': return (
        <ArtGrid 
          filter="created" 
          title="My Works" 
          emptyMessage="No artworks yet. Connect your wallet and start collecting from the marketplace!" 
        />
      )
      case 'earnings': return <WalletView />
      case 'settings': return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <ProfileHeader />
          <div className="mt-12 pt-12 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Security</h3>
              <p className="text-slate-400 font-bold">Your account is secured by Freighter Wallet. Connect your wallet to manage your profile and digital assets.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Platform Settings</h3>
              <p className="text-slate-400 font-bold">Manage your notification preferences, display settings, and marketplace configurations.</p>
            </div>
          </div>
        </div>
      )
      default: return <Overview />
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <Navbar />
      
      <div className="flex pt-20">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 lg:ml-72 p-6 md:p-12 transition-all">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}

