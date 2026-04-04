# 🛡️ ZEB – Decentralized NFT Protection & Marketplace

ZEB (ዘብ🫡) is a blockchain-based platform designed to **protect digital creators** by providing proof of ownership, secure storage, and a decentralized marketplace for trading digital artworks.

---

## 🚀 Features

### 🔐 Proof of Ownership

- Register digital artwork on-chain
- Unique **hash-based verification** prevents duplicates
- Immutable timestamp stored on blockchain

### 🖼️ NFT Minting

- Each artwork is minted as an **ERC-721 NFT**
- Metadata stored using `tokenURI`
- Tracks:
  - Creator
  - Current Owner
  - Creation Time

### 💰 Fixed Price Marketplace

- List NFTs for sale
- Buy instantly using ETH
- Cancel listings anytime

### 🔥 Auction System

- Create time-based auctions
- Competitive bidding
- Automatic winner selection
- Secure ETH handling with refund logic

---

## 🏗️ Smart Contracts Architecture

### 1. ZebNFT.sol

Handles:

- NFT minting
- Artwork registration
- Ownership tracking
- Duplicate prevention (via hash)

### 2. ZebMarketplace.sol

Handles:

- Fixed-price sales
- Auctions
- Bidding system
- Secure ETH transfers

### 3. ZebStorage.sol

Contains:

- Shared structs:
  - `Artwork`
  - `Listing`
  - `Auction`

- Custom errors for gas efficiency

---

## ⚙️ Tech Stack

- **Solidity ^0.8.20**
- **OpenZeppelin**
  - ERC721URIStorage
  - Ownable
  - ReentrancyGuard

- **Foundry** (for testing & deployment)

---

## 📦 Installation & Setup

```bash
# Clone repo
git clone https://github.com/YihalemM/GDG-CAPSTONE-ZEB.git

cd GDG-CAPSTONE-ZEB/blockchain/zeb-eth-contract

# Install dependencies
forge install
```

---

## 🔨 Build

```bash
forge build
```

---

## 🧪 Test

```bash
forge test -vv
```

---

## 🚀 Deploy

```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

---

## 📊 Contract Flow

### Register Artwork

1. User uploads artwork
2. Hash is generated
3. NFT is minted
4. Stored on-chain

### Sell Artwork

1. Owner lists NFT
2. Buyer pays ETH
3. NFT transferred automatically

### Auction

1. Seller creates auction
2. Users place bids
3. Highest bidder wins
4. Seller receives ETH

---

## 🔒 Security Features

- ✅ Reentrancy protection (`ReentrancyGuard`)
- ✅ Safe ETH transfers using `.call`
- ✅ Refund logic for outbid users
- ✅ Ownership validation checks
- ✅ Duplicate artwork prevention

---

## ⚠️ Future Improvements

- Royalty system for creators
- Frontend integration (Next.js)
- IPFS/Arweave storage
- ERC-2981 royalties
- Gas optimization

---

---

## 📜 License

MIT License
