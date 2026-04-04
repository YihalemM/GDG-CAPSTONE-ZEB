'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletProvider';

interface UserProfile {
  _id: string;
  username: string;
  publickey: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet, disconnectWallet } = useWallet();

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zeb_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Logout if wallet changes or disconnects
  useEffect(() => {
    if (user && (!wallet || wallet.address !== user.publickey)) {
      logout();
    }
  }, [wallet, user]);

  const login = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('zeb_user', JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zeb_user');
    disconnectWallet();
  };

  const refreshProfile = async () => {
    if (!wallet?.address) return;
    try {
      const res = await fetch(`https://zeb-1.onrender.com/api/users/profile/${wallet.address}`);
      const data = await res.json();
      if (data.status === 'ok') {
        login(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
