use soroban_sdk::{Env,Symbol, Address, String ,BytesN, Map };
use crate::types::{Artwork, ZebError, Auction, Listing};
use crate::storage::{artworks_map, auctions_map,save_auction,save_artwork, listings_map, save_listing};
use crate::events;
use core::clone::Clone;


pub fn artwork_exists(e: Env, hash: BytesN<32>) -> bool {
    let artworks = artworks_map(&e);
    artworks.contains_key(hash)
}

pub fn get_highest_bidder(
    e: Env,
    hash: BytesN<32>,
) -> Result<Option<Address>, ZebError> {
    let auctions = auctions_map(&e);

    let auction = auctions
        .get(hash)
        .ok_or(ZebError::InvalidAuction)?;

    Ok(auction.highest_bidder)
}

pub fn get_highest_bid(
    e: Env,
    hash: BytesN<32>,
) -> Result<u128, ZebError> {
    let auctions = auctions_map(&e);

    let auction = auctions
        .get(hash)
        .ok_or(ZebError::InvalidAuction)?;

    Ok(auction.highest_bid)
}

pub fn auction_exists(
    e: Env,
    hash: BytesN<32>,
) -> bool {
    let auctions = auctions_map(&e);
    auctions.contains_key(hash)
}

pub fn get_auctions(
    e: Env,
) -> Map<BytesN<32>, Auction> {
    auctions_map(&e)
}


pub fn register_artwork(
    e: Env,
    title: String,
    hash: BytesN<32>,
    creator: Address,
    timestamp: u128,
) -> Result<(), ZebError> {

    creator.require_auth();

    // 1. Deduct Fee
    let fee_token = crate::storage::get_fee_token(&e);
    let fee_amount = crate::storage::get_fee_amount(&e);
    let zeb_receiver = crate::storage::get_zeb_receiver(&e);

    if fee_amount > 0 {
        let client = soroban_sdk::token::Client::new(&e, &fee_token);
        client.transfer(&creator, &zeb_receiver, &(fee_amount as i128));
    }

    let mut artworks = artworks_map(&e);

    if artworks.contains_key(hash.clone()) {
        return Err(ZebError::ArtworkAlreadyExists);
    }

    let artwork = Artwork {
        title: title.clone(),
        hash: hash.clone(),
        creator: creator.clone(),
        current_owner: creator.clone(),
        timestamp,
    };

    artworks.set(hash.clone(), artwork);
    save_artwork(&e, &artworks);

    events::artwork_registered(&e, title, hash, creator, timestamp);

    Ok(())
}


pub fn get_creator(e: Env, hash: BytesN<32>) -> Result<Address, ZebError> {
    let artworks = artworks_map(&e);

    artworks
        .get(hash)
        .map(|art| art.creator)
        .ok_or(ZebError::ArtworkNotFound)
}


pub fn get_owner(e: Env, hash: BytesN<32>) -> Result<Address, ZebError> {
    let artworks = artworks_map(&e);

    artworks
        .get(hash)
        .map(|art| art.current_owner)
        .ok_or(ZebError::ArtworkNotFound)
}


pub fn transfer_ownership(
    e: Env,
    hash: BytesN<32>,
    new_owner: Address,
) -> Result<(), ZebError> {

    let mut artworks = artworks_map(&e);

    let mut artwork = artworks
        .get(hash.clone())
        .ok_or(ZebError::ArtworkNotFound)?;

    let owner = artwork.current_owner.clone();
    owner.require_auth();

    artwork.current_owner = new_owner.clone();

    artworks.set(hash.clone(), artwork);
    save_artwork(&e, &artworks);

    events::ownership_transferred(&e, hash, owner, new_owner);

    Ok(())
}

pub fn create_auction(
    e: Env,
    hash: BytesN<32>,
    seller: Address,
    start_time: u128,
    end_time: u128,
) -> Result<(), ZebError> {

    seller.require_auth();

    let artworks = artworks_map(&e);
    let art = artworks
        .get(hash.clone())
        .ok_or(ZebError::ArtworkNotFound)?;

    if art.current_owner != seller {
        return Err(ZebError::NotOwner);
    }

    let mut auctions = auctions_map(&e);

    if auctions.contains_key(hash.clone()) {
        return Err(ZebError::InvalidAuction);
    }

    // Ensure not listed for fixed price
    let listings = listings_map(&e);
    if listings.contains_key(hash.clone()) {
        return Err(ZebError::ArtworkAlreadyListed);
    }

    let auction = Auction {
        artwork_hash: hash.clone(),
        seller: seller.clone(),
        start_time,
        end_time,
        highest_bid: 0,
        highest_bidder: None,
    };

    auctions.set(hash.clone(), auction);
    save_auction(&e, &auctions);

    events::auction_created(&e, hash, seller, start_time);

    Ok(())
}


pub fn place_bid(
    e: Env,
    hash: BytesN<32>,
    bidder: Address,
    amount: u128,
    timestamp: u128,
) -> Result<(), ZebError> {
    bidder.require_auth();

    if amount == 0 {
        return Err(ZebError::InvalidOffer);
    }

    let fee_token = crate::storage::get_fee_token(&e);
    let fee_amount = crate::storage::get_fee_amount(&e);
    let zeb_receiver = crate::storage::get_zeb_receiver(&e);

    let token = soroban_sdk::token::Client::new(&e, &fee_token);

    let mut auctions = auctions_map(&e);
    let mut auction = auctions
        .get(hash.clone())
        .ok_or(ZebError::AuctionNotFound)?;

    // if timestamp < auction.start_time || timestamp > auction.end_time {
    //     return Err(ZebError::InvalidTime);
    // }

    if amount <= auction.highest_bid {
        return Err(ZebError::InvalidOffer);
    }

    // Transfer bid amount from bidder → seller (escrow via seller)
    token.transfer(&bidder, &auction.seller, &(amount as i128));

    // Collect service fees
    if fee_amount > 0 {
        token.transfer(&bidder, &zeb_receiver, &(fee_amount as i128));
    }

    // Refund previous highest bidder
    if let Some(prev_bidder) = auction.highest_bidder.clone() {
        token.transfer(&auction.seller, &prev_bidder, &(auction.highest_bid as i128));
    }

    auction.highest_bid = amount;
    auction.highest_bidder = Some(bidder.clone());

    auctions.set(hash.clone(), auction);
    save_auction(&e, &auctions);

    events::auction_bid(&e, hash, bidder, amount);

    Ok(())
}

// pub fn place_bid(
//     e: Env,
//     hash: BytesN<32>,
//     bidder: Address,
//     amount: u128,
//     timestamp: u128,
// ) -> Result<(), ZebError> {
//
//     bidder.require_auth();
//
//     if amount <= 0 {
//         return Err(ZebError::InvalidOffer);
//     }
//
//     let mut auctions = auctions_map(&e);
//
//     let mut auction = auctions
//         .get(hash.clone())
//         .ok_or(ZebError::InvalidAuction)?;
//
//     if timestamp < auction.start_time || timestamp > auction.end_time {
//         return Err(ZebError::InvalidAuction);
//     }
//
//     if amount <= auction.highest_bid {
//         return Err(ZebError::InvalidOffer);
//     }
//
//     auction.highest_bid = amount;
//     auction.highest_bidder = Some(bidder.clone());
//
//     auctions.set(hash.clone(), auction);
//     save_auction(&e, &auctions);
//
//     events::auction_bid(&e, hash, bidder, amount);
//
//     Ok(())
// }


pub fn close_auction(
    e: Env,
    hash: BytesN<32>,
    caller: Address,
    current_time: u128,
) -> Result<(), ZebError> {

    caller.require_auth();

    let mut auctions = auctions_map(&e);

    let auction = auctions
        .get(hash.clone())
        .ok_or(ZebError::InvalidAuction)?;

    if caller != auction.seller {
        return Err(ZebError::NotOwner);
    }

    if current_time < auction.end_time {
        return Err(ZebError::InvalidAuction);
    }

    let mut artworks = artworks_map(&e);
    let mut art = artworks
        .get(hash.clone())
        .ok_or(ZebError::ArtworkNotFound)?;

    if let Some(winner) = auction.highest_bidder.clone() {
        art.current_owner = winner.clone();
        artworks.set(hash.clone(), art);
        save_artwork(&e, &artworks);

        events::auction_ended(&e, hash.clone(), winner, auction.highest_bid);
    }

    auctions.remove(hash.clone());
    save_auction(&e, &auctions);

    Ok(())
}

pub fn list_for_sale(
    e: Env,
    hash: BytesN<32>,
    seller: Address,
    price: u128,
    timestamp: u128,
) -> Result<(), ZebError> {
    seller.require_auth();

    let artworks = artworks_map(&e);
    let art = artworks.get(hash.clone()).ok_or(ZebError::ArtworkNotFound)?;

    if art.current_owner != seller {
        return Err(ZebError::NotOwner);
    }

    let mut listings = listings_map(&e);
    if listings.contains_key(hash.clone()) {
        return Err(ZebError::ArtworkAlreadyListed);
    }

    let auctions = auctions_map(&e);
    if auctions.contains_key(hash.clone()) {
        return Err(ZebError::InvalidAuction);
    }

    let listing = Listing {
        artwork_hash: hash.clone(),
        seller: seller.clone(),
        price,
        timestamp,
    };

    listings.set(hash.clone(), listing);
    save_listing(&e, &listings);

    events::artwork_listed(&e, hash, seller, price);

    Ok(())
}

pub fn cancel_listing(
    e: Env,
    hash: BytesN<32>,
    caller: Address,
) -> Result<(), ZebError> {
    caller.require_auth();

    let mut listings = listings_map(&e);
    let listing = listings.get(hash.clone()).ok_or(ZebError::ListingNotFound)?;

    if listing.seller != caller {
        return Err(ZebError::NotOwner);
    }

    listings.remove(hash.clone());
    save_listing(&e, &listings);

    events::listing_cancelled(&e, hash, caller);

    Ok(())
}


pub fn buy_now(
    e: Env,
    hash: BytesN<32>,
    buyer: Address,
) -> Result<(), ZebError> {
    buyer.require_auth();

    let fee_token = crate::storage::get_fee_token(&e);
    let fee_amount = crate::storage::get_fee_amount(&e);
    let zeb_receiver = crate::storage::get_zeb_receiver(&e);

    let token = soroban_sdk::token::Client::new(&e, &fee_token);

    let mut listings = listings_map(&e);
    let listing = listings
        .get(hash.clone())
        .ok_or(ZebError::ListingNotFound)?;

    let seller = listing.seller.clone();
    let price = listing.price;

    // Transfer price from buyer → seller
    token.transfer(&buyer, &seller, &(price as i128));

    // Service fee from buyer
    if fee_amount > 0 {
        token.transfer(&buyer, &zeb_receiver, &(fee_amount as i128));
    }

    // Transfer ownership
    let mut artworks = artworks_map(&e);
    let mut art = artworks
        .get(hash.clone())
        .ok_or(ZebError::ArtworkNotFound)?;

    art.current_owner = buyer.clone();
    artworks.set(hash.clone(), art);
    save_artwork(&e, &artworks);

    listings.remove(hash.clone());
    save_listing(&e, &listings);

    events::artwork_bought(&e, hash, buyer, price);

    Ok(())
}



pub fn get_listings(
    e: Env,
) -> Map<BytesN<32>, Listing> {
    listings_map(&e)
}
