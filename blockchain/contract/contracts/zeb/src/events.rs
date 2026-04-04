use soroban_sdk::{Env, Symbol, Address, BytesN, Vec};
use soroban_sdk::String;

pub fn artwork_registered(
    e: &Env,
    title: String, 
    hash: BytesN<32>,
    creator: Address,
    timestamp: u128
) {
    let topics = (Symbol::short("art_reg"), title, hash);

    e.events().publish(topics, (creator, timestamp));
}

pub fn ownership_transferred(
    e: &Env,
    hash: BytesN<32>,
    old_owner: Address,
    new_owner: Address
) {
    let topics = (Symbol::short("own_tr"), hash);

    e.events().publish(topics, (old_owner, new_owner));
}

pub fn offer_made(
    e: &Env,
    hash: BytesN<32>,
    buyer: Address,
    amount: u128
) {
    let topics = (Symbol::short("offer"), hash);

    e.events().publish(topics, (buyer, amount));
}

pub fn offer_accepted(
    e: &Env,
    hash: BytesN<32>,
    buyer: Address,
    amount: u128
) {
    let topics = (Symbol::short("offer_acc"), hash);

    e.events().publish(topics, (buyer, amount));
}


pub fn auction_ended(
    e: &Env,
    hash: BytesN<32>,
    winner: Address,
    amount: u128,
){
    let topics = (Symbol::short("auc_end"), hash);
    e.events().publish(topics, (winner, amount));
}

pub fn auction_created(
    e: &Env,
    hash: BytesN<32>,
    owener: Address,
    statedAt: u128
){
    let topics = (Symbol::short("auc_crt"), hash);
    e.events().publish(topics, (owener, statedAt));
}

pub fn auction_opened(
    e: &Env,
    hash: BytesN<32>,
    owener: Address,
    startedAt: u128,
    endsAt: u128
){
    let topics = (Symbol::short("auc_open"), hash);
    e.events().publish(topics, (owener, startedAt, endsAt));
}

pub fn auction_bid(
    e: &Env,
    hash: BytesN<32>,
    bidder: Address,
    amount: u128
){
     let topics = (Symbol::short("auc_bid"), hash);
    e.events().publish(topics, (bidder, amount));
}

pub fn artwork_listed(
    e: &Env,
    hash: BytesN<32>,
    seller: Address,
    price: u128
) {
    let topics = (Symbol::short("art_list"), hash);
    e.events().publish(topics, (seller, price));
}

pub fn listing_cancelled(
    e: &Env,
    hash: BytesN<32>,
    seller: Address
) {
    let topics = (Symbol::short("list_can"), hash);
    e.events().publish(topics, seller);
}

pub fn artwork_bought(
    e: &Env,
    hash: BytesN<32>,
    buyer: Address,
    price: u128
) {
    let topics = (Symbol::short("art_buy"), hash);
    e.events().publish(topics, (buyer, price));
}
