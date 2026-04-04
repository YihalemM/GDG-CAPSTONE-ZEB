// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ZebNFT.sol";
import "./ZebStorage.sol";

contract ZebMarketplace is ReentrancyGuard {
    ZebNFT public nft;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;

    event ArtworkListed(uint256 tokenId, address seller, uint256 price);
    event ListingCancelled(uint256 tokenId, address seller);
    event ArtworkBought(uint256 tokenId, address buyer, uint256 price);
    event AuctionCreated(
        uint256 tokenId,
        address seller,
        uint256 startTime,
        uint256 endTime
    );
    event AuctionBid(uint256 tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 amount);

    constructor(ZebNFT _nft) {
        nft = _nft;
    }

    // ----------------------
    // FIXED-PRICE SALE (ETH)
    // ----------------------
    function listForSale(uint256 tokenId, uint256 price) external {
        if (nft.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (listings[tokenId].seller != address(0)) revert ListingNotFound();

        listings[tokenId] = Listing(msg.sender, price, block.timestamp);
        emit ArtworkListed(tokenId, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory list = listings[tokenId];
        if (list.seller != msg.sender) revert NotOwner();

        delete listings[tokenId];
        emit ListingCancelled(tokenId, msg.sender);
    }

    function buyNow(uint256 tokenId) external payable nonReentrant {
        Listing memory list = listings[tokenId];
        if (list.seller == address(0)) revert ListingNotFound();
        if (msg.value < list.price) revert InvalidOffer();

        (bool sent, ) = payable(list.seller).call{value: list.price}("");
        require(sent, "ETH transfer failed");

        nft.transferNFT(tokenId, msg.sender);
        delete listings[tokenId];

        emit ArtworkBought(tokenId, msg.sender, list.price);
    }

    // ----------------------
    // AUCTIONS
    // ----------------------
    function createAuction(
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime
    ) external {
        if (nft.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (endTime <= startTime) revert InvalidTime();
        if (auctions[tokenId].active) revert InvalidAuction();

        auctions[tokenId] = Auction(
            msg.sender,
            startTime,
            endTime,
            0,
            address(0),
            true
        );
        emit AuctionCreated(tokenId, msg.sender, startTime, endTime);
    }

    function placeBid(uint256 tokenId) external payable nonReentrant {
        Auction storage auc = auctions[tokenId];
        if (!auc.active) revert AuctionNotFound();
        if (block.timestamp < auc.startTime || block.timestamp > auc.endTime)
            revert InvalidTime();
        if (msg.value <= auc.highestBid) revert InvalidOffer();

        if (auc.highestBidder != address(0)) {
            (bool refunded, ) = payable(auc.highestBidder).call{
                value: auc.highestBid
            }("");
            require(refunded, "Refund failed");
        }

        auc.highestBid = msg.value;
        auc.highestBidder = msg.sender;
        emit AuctionBid(tokenId, msg.sender, msg.value);
    }

    function closeAuction(uint256 tokenId) external nonReentrant {
        Auction storage auc = auctions[tokenId];
        if (!auc.active) revert AuctionNotFound();
        if (block.timestamp < auc.endTime) revert InvalidTime();

        auc.active = false;

        if (auc.highestBidder != address(0)) {
            nft.transferNFT(tokenId, auc.highestBidder);
            (bool sent, ) = payable(auc.seller).call{value: auc.highestBid}("");
            require(sent, "ETH transfer failed");
            emit AuctionEnded(tokenId, auc.highestBidder, auc.highestBid);
        } else {
            emit AuctionEnded(tokenId, address(0), 0);
        }
    }
}
