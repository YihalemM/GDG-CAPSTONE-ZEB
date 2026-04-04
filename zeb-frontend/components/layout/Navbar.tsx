'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, LogIn, UserPlus, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useWallet } from '../../providers/WalletProvider';
import { useAuth } from '../../providers/AuthProvider';

export default function Navbar({ showSearch = false }: { showSearch?: boolean }) {
  const { wallet, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
            ZEB
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center items-center gap-12">
          <Link href="/marketplace" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">Explore</Link>
          <Link href="/auctions" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">Auctions</Link>
          <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">Dashboard</Link>
        </div>

        <div className="flex-1 flex items-center justify-end gap-6">
          {showSearch && (
            <div className="relative hidden lg:block group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-300 group-focus-within:text-cyan-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-cyan-400/30 transition-all w-48"
              />
            </div>
          )}


          {/* New Auth Links */}
          <div className="flex items-center gap-5">
            {!isAuthenticated ? (
              <div className="flex items-center gap-4 border-r border-slate-100 pr-4">
                
                <Link href="/signup" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                  <UserPlus size={14} />
                  Signup
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-r border-slate-100 pr-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {wallet ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                  <UserCircle size={14} className="text-slate-500" />
                  <span className="text-[10px] font-mono font-black text-slate-600 truncate max-w-[80px]">
                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="ml-1 text-slate-300 hover:text-red-500 transition-colors"
                    title="Disconnect"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-2.5 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
