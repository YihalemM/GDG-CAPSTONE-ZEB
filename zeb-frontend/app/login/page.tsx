'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useWallet } from '../../providers/WalletProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Wallet, LogIn, Loader2, ArrowRightCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { wallet, connectWallet, isConnecting } = useWallet();
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://zeb-1.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status === 'ok') {
        login(data.data);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection to auth server failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!wallet) {
      await connectWallet();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://zeb-1.onrender.com/api/users/login-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publickey: wallet.address }),
      });

      const data = await res.json();
      if (data.status === 'ok') {
        login(data.data);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed. Are you registered?');
      }
    } catch (err) {
      setError('Connection to auth server failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50">
            {/* Brand Header */}
            <div className="text-center mb-10">
              
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-slate-900">Welcome</h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">Access ZEB Ecosystem</p>
            </div>

            <div className="space-y-8">
              {/* Credential Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Username</label>
                   <input 
                      type="text" 
                      placeholder="Enter username" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</label>
                   <input 
                      type="password" 
                      placeholder="••••••••••••" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                   />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 text-xs"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <LogIn size={18} />}
                  Sign In
                </button>
              </form>

              <div className="relative py-2 flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Or use wallet</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              {/* Wallet Button */}
              <button 
                onClick={handleWalletLogin}
                disabled={loading || isConnecting}
                className="group w-full py-5 bg-primary text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-lg shadow-primary/20 border border-primary/50 text-xs"
              >
                {loading || isConnecting ? <Loader2 className="animate-spin" /> : <Wallet size={18} className="transition-transform group-hover:rotate-12" />}
                Connect & Log In
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <p className="text-slate-400 text-[10px] font-black text-center uppercase tracking-widest mt-8">
                Not a member yet? 
                <a href="/signup" className="text-primary hover:text-slate-900 ml-2 transition-colors border-b-2 border-primary/30">
                  Register Craft
                </a>
              </p>
            </div>
          </div>
          
          <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Secure Blockchain Authentication
          </p>
        </div>
      </main>
    </div>
  );
}
