# ZEB Frontend: The Digital Authorship Nexus

ZEB is a premium, high-fidelity NFT marketplace and digital provenance platform built on the **Stellar Network**. This frontend provides a seamless "Web2.5" experience, bridging traditional user authentication with decentralized blockchain power.

## 🚀 Key Features

### 🔐 Dual-Core Authentication
- **Stellar Wallet Integration**: Native support for **Freighter**, enabling one-click blockchain identity.
- **Credential Fallback**: Support for username/password login for users transitioning from traditional platforms.
- **Session Protection**: Secure `AuthProvider` handles profile persistence and route shielding.

### 🎨 Authorship Engine
- **Multi-Media Support**: First-class support for Images, Motion Videos, and Sonic Audio.
- **Integrity First**: Implements a two-stage "Pending-to-Active" flow that ensures database records only go live after successful on-chain registration.
- **Plagiarism Guard**: Integrated UI for similarity flagging, alerting users if an uploaded work is too similar to an existing masterpiece.

### ⚖️ Marketplace & Auctions
- **Live Bidding**: High-stakes auction system with real-time "Highest Bid" tracking and time-left timers.
- **Explore Nexus**: Filterable marketplace to discover the latest verified digital assets.
- **Detailed Origin Tracking**: Comprehensive on-chain activity logs for Every asset (Minted, Listed, Bid, Sold).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: Vanilla CSS with modern Design Tokens (Glassmorphism, Sleek Dark Mode)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (Robust caching & mutations)
- **Blockchain**: [Stellar / Soroban](https://stellar.org/) (via `@stellar/freighter-api`)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- A Stellar Wallet (Freighter recommended)

### 2. Installation
```bash
cd zeb-frontend
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root of the frontend directory:
```env
NEXT_PUBLIC_BACKEND_URL=(https://zeb-1.onrender.com/api)
```

### 4. Launch Development Server
```bash
npm run dev
```

## 🛡️ Robust Architecture
This project prioritizes stability and type-safety:
- **Discriminated Unions**: All API results use strict union types to prevent runtime errors during complex upload flows.
- **Sanitized States**: Premium UI states for "Empty Database" and "Service Maintenance" scenarios to maintain professional optics at all times.

---

**Built for the Future of Authorship. Powered by Stellar.**
