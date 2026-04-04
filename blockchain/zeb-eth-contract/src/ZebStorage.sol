// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ----------------------
// STRUCTS
// ----------------------
struct Artwork {
    string title;
    string uri;
    bytes32 hash;
    address creator;
    address currentOwner;
    uint256 timestamp;
}

struct Listing {
    address seller;
    uint256 price;
    uint256 timestamp;
}

struct Auction {
    address seller;
    uint256 startTime;
    uint256 endTime;
    uint256 highestBid;
    address highestBidder;
    bool active;
}

// ----------------------
// ERRORS
// ----------------------
error ArtworkAlreadyExists();
error ArtworkNotFound();
error ListingNotFound();
error InvalidOffer();
error NotOwner();
error InvalidTime();
error InvalidAuction();
error AuctionNotFound();
