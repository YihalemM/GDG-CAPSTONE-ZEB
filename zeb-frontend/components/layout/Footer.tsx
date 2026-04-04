import React from 'react';
import Link from 'next/link';
import { Twitter, Github, DiscIcon as Discord } from 'lucide-react';

export default function Footer({ hideCTA = false }: { hideCTA?: boolean }) {
  return (
    <>
    <footer className="bg-white py-24 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-3xl font-black text-slate-900 tracking-tighter block mb-8">ZEB</Link>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs text-sm">
              The premier standard for digital authorship, provenance, and decentralized vaulting services.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-900">Marketplace</h4>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Explore</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Collections</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Artworks</Link>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-900">Resources</h4>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Creator Resources</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Platform Status</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Help Center</Link>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-900">Company</h4>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">About</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Privacy</Link>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">© 2024 ZEB. PERMANENT PROOF OF DIGITAL AUTHORSHIP.</p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Status: Stable</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
