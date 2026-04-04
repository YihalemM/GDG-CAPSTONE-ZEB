import { Art, Activity, Auction, AuctionWithArt } from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zeb-1.onrender.com/api';

export async function uploadArt(formData: FormData) {
  const res = await fetch(`${API_BASE}/arts`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Upload failed');
  }
  return data;
}

export async function getArts(params?: { sort?: string; order?: 'asc' | 'desc'; limit?: number }): Promise<{ data: Art[] }> {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.limit) query.set('limit', params.limit.toString());
  
  const res = await fetch(`${API_BASE}/arts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch arts');
  return res.json();
}

export async function getUserArts(address: string): Promise<{ data: Art[] }> {
  const res = await fetch(`${API_BASE}/arts/creator/${address}`);
  if (!res.ok) throw new Error('Failed to fetch user arts');
  return res.json();
}

export async function getActivities(address: string): Promise<{ data: Activity[] }> {
  const res = await fetch(`${API_BASE}/activity/user/${address}`);
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

export async function createAuction(data: { art_hash: string; seller: string; end_time: number }) {
  const res = await fetch(`${API_BASE}/auctions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create auction');
  }
  return res.json();
}

// Backend TODO: /api/listings, /api/auctions/seller/:addr
export async function getListings() {
  // Placeholder - backend needed
  return { data: [] as Art[] };
}

export async function getAuctions(): Promise<{ data: AuctionWithArt[] }> {
  const res = await fetch(`${API_BASE}/auctions`);
  if (!res.ok) throw new Error('Failed to fetch auctions');
  return res.json();
}

export async function getAuctionByArtHash(hash: string): Promise<{ data: Auction }> {
  const res = await fetch(`${API_BASE}/auctions/art/${hash}`);
  if (!res.ok) throw new Error('Failed to fetch auction details');
  return res.json();
}

export async function getSellerAuctions(seller: string): Promise<{ data: AuctionWithArt[] }> {
  // Placeholder - could be implemented in backend if needed
  return { data: [] };
}

// Fixed price listing TODO
// export async function createFixedListing(...) { }
export async function getArtById(id: string): Promise<{ data: Art }> {
  const res = await fetch(`${API_BASE}/arts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch art detail');
  return res.json();
}

export async function getArtActivity(artId: string): Promise<{ data: Activity[] }> {
  const res = await fetch(`${API_BASE}/activity/art/${artId}`);
  if (!res.ok) throw new Error('Failed to fetch art activity');
  return res.json();
}

export async function recordActivity(data: Partial<Activity>) {
  const res = await fetch(`${API_BASE}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
