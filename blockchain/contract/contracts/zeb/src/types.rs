use soroban_sdk::{contracttype, contracterror, Address, BytesN, String};

#[contracttype]
#[derive(Clone)]
pub struct Artwork {
    pub title: String,          // Artwork title
    pub hash: BytesN<32>,       // SHA256 hash of the digital content
    pub creator: Address,       // Wallet address of original creator
    pub current_owner: Address, // Current owner
    pub timestamp: u128,        // Blockchain registration time
}

#[contracttype]
#[derive(Clone)]
pub struct Auction {
    pub artwork_hash: BytesN<32>,
    pub seller: Address,
    pub start_time: u128,
    pub end_time: u128,
    pub highest_bid: u128,
    pub highest_bidder: Option<Address>,
}

#[contracttype]
#[derive(Clone)]
pub struct Offer {
    pub amount: u128,     // Offer amount in stroops / smallest unit
    pub buyer: Address,   // Buyer wallet address
}

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub artwork_hash: BytesN<32>,
    pub seller: Address,
    pub price: u128,
    pub timestamp: u128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ZebError {
    ArtworkAlreadyExists = 1,
    ArtworkNotFound = 2,
    NotOwner = 3,
    InvalidOffer = 4,
    AuctionNotFound = 5,
    InvalidAuction = 6 ,
    InvalidTime = 7, 
    ArtworkAlreadyListed = 8,
    ListingNotFound = 9,
}
