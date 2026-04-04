use soroban_sdk::{Env, Map, Symbol, BytesN, Address};
use crate::types::{Artwork, Auction, Listing};

pub struct StorageKeys;

impl StorageKeys {
    pub const ARTWORKS: Symbol = Symbol::short("artworks");
    pub const OFFERS: Symbol = Symbol::short("offers");
    pub const AUCTIONS: Symbol = Symbol::short("auctions");
    pub const LISTINGS: Symbol = Symbol::short("listings");
    pub const FEE_TOKEN: Symbol = Symbol::short("fee_tok");
    pub const FEE_AMOUNT: Symbol = Symbol::short("fee_amt");
    pub const ZEB_RECEIVER: Symbol = Symbol::short("zeb_rec");
}

pub fn get_fee_token(e: &Env) -> Address {
    e.storage().persistent().get(&StorageKeys::FEE_TOKEN).expect("Fee token not set")
}

pub fn get_fee_amount(e: &Env) -> u128 {
    e.storage().persistent().get(&StorageKeys::FEE_AMOUNT).unwrap_or(0)
}

pub fn get_zeb_receiver(e: &Env) -> Address {
    e.storage().persistent().get(&StorageKeys::ZEB_RECEIVER).expect("ZEB Receiver not set")
}

pub fn set_config(e: &Env, token: Address, amount: u128, receiver: Address) {
    e.storage().persistent().set(&StorageKeys::FEE_TOKEN, &token);
    e.storage().persistent().set(&StorageKeys::FEE_AMOUNT, &amount);
    e.storage().persistent().set(&StorageKeys::ZEB_RECEIVER, &receiver);
}

pub fn artworks_map(e: &Env) -> Map<BytesN<32>, Artwork> {
    e.storage()
        .persistent()
        .get(&StorageKeys::ARTWORKS)
        .unwrap_or(Map::new(e))
}

pub fn save_artwork(e: &Env, map: &Map<BytesN<32>, Artwork>) {
    e.storage().persistent().set(&StorageKeys::ARTWORKS, map);
}

pub fn offers_map(e: &Env) -> Map<BytesN<32>, Map<Address, u128>> {
    e.storage()
        .persistent()
        .get(&StorageKeys::OFFERS)
        .unwrap_or(Map::new(e))
}

pub fn save_offer(e: &Env, map: &Map<BytesN<32>, Map<Address, u128>>) {
    e.storage().persistent().set(&StorageKeys::OFFERS, map);
}

pub fn auctions_map(e: &Env) -> Map<BytesN<32>, Auction> {
    e.storage()
        .persistent()
        .get(&StorageKeys::AUCTIONS)
        .unwrap_or(Map::new(e))
}

pub fn save_auction(e: &Env, map: &Map<BytesN<32>, Auction>) {
    e.storage().persistent().set(&StorageKeys::AUCTIONS, map);
}

pub fn listings_map(e: &Env) -> Map<BytesN<32>, Listing> {
    e.storage()
        .persistent()
        .get(&StorageKeys::LISTINGS)
        .unwrap_or(Map::new(e))
}

pub fn save_listing(e: &Env, map: &Map<BytesN<32>, Listing>) {
    e.storage().persistent().set(&StorageKeys::LISTINGS, map);
}
