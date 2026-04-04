'use client'

import { UploadArtModalTrigger } from '../../../components/dashboard/UploadArtModalTrigger';
import { useWallet } from '../../../providers/WalletProvider';
import Link from 'next/link';

export default function UploadPage() {
  const { wallet } = useWallet();

  if (!wallet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">Wallet Required</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Connect your Freighter wallet to register masterpiece.</p>
          <Link href="/dashboard" className="inline-block py-5 px-10 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-secondary/10 uppercase text-xs tracking-widest">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
            Upload Artwork
          </h1>
          <p className="text-lg font-bold text-slate-400 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed">
            Register your creative work on ZEB. Files are verified for uniqueness and secured on-chain.
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-12">
          <UploadArtModalTrigger />
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

