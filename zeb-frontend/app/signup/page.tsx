'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, User, Lock, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

interface FormData {
  username: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWalletConnect = async () => {
    try {
      const { isConnected, requestAccess, getAddress } = await import('@stellar/freighter-api');
      
      const connectedStatus = await isConnected();
      if (connectedStatus && connectedStatus.isConnected) {
        const access = await requestAccess();
        if (access && access.error) {
          alert(`Access denied: ${access.error}`);
          return;
        }

        const publicKeyResult = await getAddress();
        if (publicKeyResult && publicKeyResult.address) {
          setPublicKey(publicKeyResult.address);
          setWalletConnected(true);
        } else {
          alert('Failed to get wallet address.');
        }
      } else {
        alert('Freighter wallet not found or not connected. Please install the extension.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Error connecting to Freighter wallet.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          publickey: publicKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Persist session locally
        localStorage.setItem('zeb_user_address', publicKey);
        localStorage.setItem('zeb_username', formData.username);
        
        alert('Signup successful! Redirecting to login...');
        router.push('/login');
      } else {
        alert(`Signup failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-100/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/30 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-[480px] relative z-10">
        <div className="text-center mb-10">
           <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Create Account</h1>
           <p className="text-sm font-bold text-slate-400">Enter the Digital Atelier. Curate your legacy.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-12">
          <button 
            onClick={handleWalletConnect}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest ${walletConnected ? 'bg-slate-50 text-slate-300 border border-slate-100' : 'bg-cyan-400 text-slate-900 hover:bg-cyan-500 shadow-lg shadow-cyan-400/20'}`}
          >
             <Wallet size={18} />
             {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </button>

          <div className="my-10 flex items-center gap-4">
             <div className="h-px bg-slate-100 flex-1" />
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or use credentials</span>
             <div className="h-px bg-slate-100 flex-1" />
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                     name="username"
                     type="text" 
                     placeholder="e.g. curator_01" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-200"
                     value={formData.username}
                     onChange={handleChange}
                     required
                   />
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                     name="password"
                     type="password" 
                     placeholder="••••••••••••" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-200"
                     value={formData.password}
                     onChange={handleChange}
                     required
                   />
                </div>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
             >
                {loading ? 'Creating...' : 'Sign Up'}
             </button>
          </form>

          <div className="mt-10 text-center">
             <p className="text-xs font-bold text-slate-400">
                Already part of the atelier? <Link href="/login" className="text-cyan-500 hover:text-cyan-600 transition-colors">Log In</Link>
             </p>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
           By creating an account, you agree to Aetheris' <br/>
           <span className="text-slate-400 hover:text-slate-900 cursor-pointer">Terms of Service</span> and <span className="text-slate-400 hover:text-slate-900 cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </main>
  );
}
