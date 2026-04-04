'use client'

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { User, Wallet, Camera, Edit, Check, X, Upload, ShieldCheck, Gavel, TrendingUp, BarChart3 } from "lucide-react"
import ProfileHeader from "../../../components/dashboard/ProfileHeader"

interface UserProfile {
  avatar: string
  username: string
  wallet: string
}

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    avatar: "/file.svg",
    username: "Mr. X",
    wallet: "GBBN5OTUVHD5DLYXHLDCSLDS64ZWYTL7RMEWJ25VDLFDE3KVI6ZB6ICD"
  })
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("userProfile")
    if (saved) {
      const parsed = JSON.parse(saved)
      setProfile(parsed)
      setTempProfile(parsed)
    }
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewAvatar(url)
      setTempProfile(prev => ({ ...prev, avatar: url }))
    }
  }

  const validateWallet = (address: string) => {
    return address.startsWith("G") && address.length === 56
  }

  const handleSave = async () => {
    if (!validateWallet(tempProfile.wallet)) {
      alert("Invalid Stellar wallet address")
      return
    }

    setIsSaving(true)
    // Simulate save
    setTimeout(() => {
      setProfile(tempProfile)
      localStorage.setItem("userProfile", JSON.stringify(tempProfile))
      setEditMode(false)
      setPreviewAvatar(null)
      setIsSaving(false)
    }, 1000)
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setPreviewAvatar(null)
    if (fileRef.current) fileRef.current.value = ""
    setEditMode(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto p-8 space-y-12">
        {/* Profile Hero */}
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-4 border-slate-100 shadow-2xl mx-auto bg-slate-50 relative group">
              <Image
                src={previewAvatar || profile.avatar}
                alt="Profile Avatar"
                width={160}
                height={160}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {editMode && (
                <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center cursor-pointer transition-opacity duration-300">
                  <Camera size={32} className="text-white" />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
            {editMode ? (
              <input
                type="text"
                value={tempProfile.username}
                onChange={(e) => setTempProfile(prev => ({ ...prev, username: e.target.value }))}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full text-center font-black text-slate-900 focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Username"
              />
            ) : (
              profile.username
            )}
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-8 p-6 bg-white rounded-[32px] border border-slate-100 max-w-xl mx-auto shadow-sm">
            <Wallet size={24} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <span className="font-mono text-sm text-slate-500 truncate w-full sm:w-auto">{tempProfile.wallet || "Not connected"}</span>
                    <button
                      onClick={() => {
                        const newWallet = "GC" + Math.random().toString(36).substring(2, 58).toUpperCase()
                        setTempProfile(prev => ({ ...prev, wallet: newWallet }))
                      }}
                      className="px-6 py-2 bg-primary text-slate-900 font-black rounded-xl hover:bg-primary/80 transition-all text-[10px] uppercase tracking-widest whitespace-nowrap flex items-center gap-1 shadow-lg shadow-primary/10"
                    >
                      <Upload size={14} />
                      Connect
                    </button>
                  </div>
                ) : (
                  <span className="font-mono text-md text-slate-900 break-all">{profile.wallet}</span>
                )}
              </div>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 px-10 py-5 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-secondary/10 uppercase text-xs tracking-widest"
            >
              <Edit size={18} />
              Customize Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-64 bg-primary text-slate-900 font-black py-5 px-8 rounded-2xl hover:bg-primary/80 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Commit Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="w-full sm:w-64 bg-slate-100 text-slate-600 font-black py-5 px-8 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                <X size={18} />
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          <div className="group p-8 bg-white rounded-[32px] border border-slate-100 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center">
            <ShieldCheck size={40} className="mx-auto mb-6 text-primary group-hover:scale-110 transition-all" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              12
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Masterpieces</p>
          </div>
          
          <div className="group p-8 bg-white rounded-[32px] border border-slate-100 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center">
            <Gavel size={40} className="mx-auto mb-6 text-primary group-hover:scale-110 transition-all" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              3
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Auctions</p>
          </div>
          
          <div className="group p-8 bg-white rounded-[32px] border border-slate-100 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center">
            <TrendingUp size={40} className="mx-auto mb-6 text-primary group-hover:scale-110 transition-all" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              +24<span className="text-lg text-slate-400">%</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Portfolio Growth</p>
          </div>
          
          <div className="group p-8 bg-white rounded-[32px] border border-slate-100 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center">
            <BarChart3 size={40} className="mx-auto mb-6 text-primary group-hover:scale-110 transition-all" />
            <div className="text-4xl font-black text-slate-900 mb-2">
              2
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Winning Bids</p>
          </div>
        </div>
      </main>
    </div>
  )
}

