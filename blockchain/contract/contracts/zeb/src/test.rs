#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, BytesN, String};

#[test]
fn test_register_and_list() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, ZebContract);
    let client = ZebContractClient::new(&e, &contract_id);

    let creator = Address::generate(&e);
    let title = String::from_str(&e, "Test Art");
    let hash = BytesN::from_array(&e, &[1; 32]);
    let timestamp = 1000u128;

    client.register_artwork(&title, &hash, &creator, &timestamp);

    assert!(client.artwork_exists(&hash));
    assert_eq!(client.get_owner(&hash), creator);

    let price = 500u128;
    client.list_for_sale(&hash, &creator, &price, &timestamp);

    let listings = client.get_listings();
    assert!(listings.contains_key(hash.clone()));
    let listing = listings.get(hash.clone()).unwrap();
    assert_eq!(listing.price, price);
    assert_eq!(listing.seller, creator);
}

#[test]
fn test_buy_now() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, ZebContract);
    let client = ZebContractClient::new(&e, &contract_id);

    let creator = Address::generate(&e);
    let buyer = Address::generate(&e);
    let title = String::from_str(&e, "Test Art");
    let hash = BytesN::from_array(&e, &[1; 32]);
    let timestamp = 1000u128;

    client.register_artwork(&title, &hash, &creator, &timestamp);

    let price = 500u128;
    client.list_for_sale(&hash, &creator, &price, &timestamp);

    client.buy_now(&hash, &buyer);

    assert_eq!(client.get_owner(&hash), buyer);
    let listings = client.get_listings();
    assert!(!listings.contains_key(hash.clone()));
}

#[test]
fn test_cancel_listing() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, ZebContract);
    let client = ZebContractClient::new(&e, &contract_id);

    let creator = Address::generate(&e);
    let title = String::from_str(&e, "Test Art");
    let hash = BytesN::from_array(&e, &[1; 32]);
    let timestamp = 1000u128;

    client.register_artwork(&title, &hash, &creator, &timestamp);

    let price = 500u128;
    client.list_for_sale(&hash, &creator, &price, &timestamp);

    client.cancel_listing(&hash, &creator);

    let listings = client.get_listings();
    assert!(!listings.contains_key(hash.clone()));
}

#[test]
#[should_panic] 
fn test_conflict_auction_after_listing() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, ZebContract);
    let client = ZebContractClient::new(&e, &contract_id);

    let creator = Address::generate(&e);
    let title = String::from_str(&e, "Test Art");
    let hash = BytesN::from_array(&e, &[1; 32]);

    client.register_artwork(&title, &hash, &creator, &0);
    client.list_for_sale(&hash, &creator, &500, &0);
    
    // Should panic because it's already listed
    client.create_auction(&hash, &creator, &0, &1000);
}

#[test]
#[should_panic]
fn test_conflict_listing_after_auction() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, ZebContract);
    let client = ZebContractClient::new(&e, &contract_id);

    let creator = Address::generate(&e);
    let title = String::from_str(&e, "Test Art");
    let hash = BytesN::from_array(&e, &[1; 32]);

    client.register_artwork(&title, &hash, &creator, &0);
    client.create_auction(&hash, &creator, &100, &1000);
    
    // Should panic because it's in auction
    client.list_for_sale(&hash, &creator, &500, &0);
}
