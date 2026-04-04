#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Address, BytesN,Map, String};

#[cfg(test)]
mod test;

mod types;
mod storage;
mod artwork;
mod events;

use crate::types::ZebError;
use crate::types::Auction;
use crate::artwork as artwork_logic;

#[contract]
pub struct ZebContract;

#[contractimpl]
impl ZebContract {

    pub fn artwork_exists(e: Env, hash: BytesN<32>) -> bool {
        artwork_logic::artwork_exists(e, hash)
    }

    pub fn set_config(
        e: Env,
        caller: Address,
        token: Address,
        amount: u128,
        receiver: Address,
    ) -> Result<(), ZebError> {
        caller.require_auth();
        crate::storage::set_config(&e, token, amount, receiver);
        Ok(())
    }

    pub fn get_highest_bid(
        e: Env,
        hash: BytesN<32>,
    ) -> Result<u128, ZebError> {
        artwork_logic::get_highest_bid(e, hash)
    }

    pub fn get_highest_bidder(
        e: Env,
        hash: BytesN<32>,
    ) -> Result<Option<Address>, ZebError> {
        artwork_logic::get_highest_bidder(e, hash)
    }

    pub fn auction_exists(
        e: Env,
        hash: BytesN<32>,
    ) -> bool {
        artwork_logic::auction_exists(e, hash)
    }

    pub fn get_auctions(
        e: Env,
    ) -> Map<BytesN<32>, Auction> {
        artwork_logic::get_auctions(e)
    }

    pub fn register_artwork(
        e: Env,
        title: String,
        hash: BytesN<32>,
        creator: Address,
        timestamp: u128,
    ) -> Result<(), ZebError> {
        artwork_logic::register_artwork(e, title, hash, creator, timestamp)
    }

    pub fn get_creator(
        e: Env,
        hash: BytesN<32>,
    ) -> Result<Address, ZebError> {
        artwork_logic::get_creator(e, hash)
    }

    pub fn get_owner(
        e: Env,
        hash: BytesN<32>,
    ) -> Result<Address, ZebError> {
        artwork_logic::get_owner(e, hash)
    }

    pub fn transfer_ownership(
        e: Env,
        hash: BytesN<32>,
        caller: Address,
        new_owner: Address,
    ) -> Result<(), ZebError> {

        caller.require_auth();
        artwork_logic::transfer_ownership(e, hash, new_owner)
    }


    // pub fn make_offer(
    //     e: Env,
    //     hash: BytesN<32>,
    //     buyer: Address,
    //     amount: u128,
    // ) -> Result<(), ZebError> {
    //     artwork_logic::make_offer(e, hash, buyer, amount)
    // }

    // pub fn accept_offer(
    //     e: Env,
    //     hash: BytesN<32>,
    //     owner: Address,
    //     buyer: Address,
    // ) -> Result<u128, ZebError> {
    //
    //     owner.require_auth();
    //     artwork_logic::accept_offer(e, hash, owner, buyer)
    // }


     pub fn create_auction(
        e: Env,
        hash: BytesN<32>,
        seller: Address,
        start_time: u128,
        end_time: u128,
    ) -> Result<(), ZebError> {
        artwork_logic::create_auction(e, hash, seller, start_time, end_time)
    }

    pub fn place_bid(
        e: Env,
        hash: BytesN<32>,
        bidder: Address,
        amount: u128,
        timestamp: u128,
    ) -> Result<(), ZebError> {
        artwork_logic::place_bid(e, hash, bidder, amount, timestamp)
    }

    pub fn close_auction(
        e: Env,
        hash: BytesN<32>,
        caller: Address,
        current_time: u128,
    ) -> Result<(), ZebError> {
        artwork_logic::close_auction(e, hash, caller, current_time)
    }

    pub fn list_for_sale(
        e: Env,
        hash: BytesN<32>,
        seller: Address,
        price: u128,
        timestamp: u128,
    ) -> Result<(), ZebError> {
        artwork_logic::list_for_sale(e, hash, seller, price, timestamp)
    }

    pub fn cancel_listing(
        e: Env,
        hash: BytesN<32>,
        caller: Address,
    ) -> Result<(), ZebError> {
        artwork_logic::cancel_listing(e, hash, caller)
    }

    pub fn buy_now(
        e: Env,
        hash: BytesN<32>,
        buyer: Address,
    ) -> Result<(), ZebError> {
        artwork_logic::buy_now(e, hash, buyer)
    }

    pub fn get_listings(
        e: Env,
    ) -> Map<BytesN<32>, crate::types::Listing> {
        artwork_logic::get_listings(e)
    }
}
