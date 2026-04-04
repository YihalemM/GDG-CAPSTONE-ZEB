'use client'

import React from 'react'
import { 
  Plus, Minus, ArrowUpRight, ArrowDownLeft, 
  RefreshCcw, ShieldCheck, Activity 
} from 'lucide-react'

export default function WalletView() {
  const transactions = [
    { type: 'Received Ethereum', hash: '0x8f23...a3f2', status: 'Completed', val: '+ 2.400 ETH', usd: '$6,240.12', date: 'Oct 24, 2024', icon: ArrowDownLeft, color: 'text-green-500' },
    { type: 'Sent to Wallet', hash: '0x1623...0b19', status: 'Completed', val: '- 0.150 ETH', usd: '$382.45', date: 'Oct 21, 2024', icon: ArrowUpRight, color: 'text-red-500' },
    { type: 'Swap ETH/USDC', hash: 'DEX Protocol', status: 'Pending', val: '1.000 ETH', usd: '$2,400.00', date: 'Oct 20, 2024', icon: RefreshCcw, color: 'text-cyan-600' },
  ]

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-4">
         <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Wallet Overview</h2>
            <p className="text-sm text-slate-400 font-bold max-w-lg leading-relaxed">
               Manage your digital equity and track cross-chain liquidity in real-time.
            </p>
         </div>
         <div className="px-4 py-2 bg-white rounded-full border border-slate-100 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main ... 9212</span>
            <ShieldCheck size={14} className="text-slate-300" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-[#0A1628] p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Total Available Balance</p>
              <div className="mb-12">
                 <h3 className="text-6xl font-black text-white tracking-tighter mb-2">12.450 ETH</h3>
                 <p className="text-xl font-bold text-white/40 tracking-tight">$32,145.20 USD</p>
              </div>
              
              <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-8 py-4 bg-cyan-400 text-slate-900 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-cyan-500 transition-all">
                    Add Funds
                 </button>
                 <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Withdraw
                 </button>
              </div>
           </div>
           
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Side Cards */}
        <div className="flex flex-col gap-6">
           <div className="flex-1 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-6">Portfolio Change</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <span className="text-4xl font-black text-slate-900">+12.4%</span>
                 <Activity size={18} className="text-cyan-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past 24 Hours</p>
           </div>
           
           <div className="flex-1 bg-slate-50 p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-6">Security Status</p>
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck size={24} className="text-cyan-600" />
                 <span className="text-lg font-black text-slate-900">Fully Encrypted</span>
              </div>
              <button className="text-[9px] font-black text-cyan-600 uppercase tracking-widest hover:underline">Run Diagnostic</button>
           </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12 uppercase tracking-tight">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
            <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 flex items-center gap-1.5">
               View Ledger <ArrowUpRight size={14} />
            </button>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${tx.color}`}>
                              <tx.icon size={18} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{tx.type}</p>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{tx.hash}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           {tx.status}
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900 tracking-tight">{tx.val}</p>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{tx.usd}</p>
                     </td>
                     <td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                        {tx.date}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
      
      <div className="flex justify-center pb-8 border-t border-slate-50 pt-12">
         <button className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors">
            <Minus size={14} /> Disconnect Wallet
         </button>
      </div>
    </div>
  )
}
