export interface Art {
  _id: string;
  title: string;
  description: string;
  contentHash: string;
  saleType: string
  similarityHash?: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  creatorBy: string;
  ownedBy: string;
  category: string;
  minPrice: number;
  listingStatus?: 'NOT_LISTED' | 'AUCTION' | 'FIXED_PRICE';
  listingType?: 'sell' | 'auction';
  fixedPrice?: number;
  startingPrice?: number;
  auctionEndTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Auction {
  _id: string;
  art_hash: string;
  seller: string;
  highest_bidder: string;
  highest_bid: number;
  start_time: string;
  end_time: string;
  bidders: string[];
}

export interface AuctionWithArt extends Auction {
  artwork: Art;
}

export interface Listing {
  artworkHash: string;
  seller: string;
  price: number;
  timestamp: number;
}

export interface Activity {
  _id: string;
  type: 'minted' | 'listing' | 'sale' | 'bid' | 'cancelled';
  artId: string;
  from?: string;
  to?: string;
  amount?: number;
  transactionHash?: string;
  timestamp: string;
}

export interface Wallet {
  address: string;
  isConnected: boolean;
}
