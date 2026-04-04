// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ZebNFT.sol";
import "../src/ZebMarketplace.sol";

contract ZebMarketplaceTest is Test {
    ZebNFT nft;
    ZebMarketplace marketplace;

    address creator = address(1);
    address alice = address(2);
    address bob = address(3);

    function setUp() public {
        // Deploy NFT
        nft = new ZebNFT(creator);

        // Deploy marketplace
        marketplace = new ZebMarketplace(nft);

        // Register an NFT as creator
        vm.prank(creator);
        nft.registerArtwork(
            "Masterpiece",
            "ipfs://masterpiece",
            keccak256("masterpiece")
        );

        // Approve marketplace to manage all creator NFTs
        vm.prank(creator);
        nft.setApprovalForAll(address(marketplace), true);

        // Confirm ownership
        assertEq(nft.ownerOf(0), creator);
    }

    function testListAndBuy() public {
        uint256 tokenId = 0;

        // Creator lists NFT for 1 ether
        vm.prank(creator);
        marketplace.listForSale(tokenId, 1 ether);

        // Alice buys the NFT
        vm.deal(alice, 2 ether); // fund alice
        vm.prank(alice);
        marketplace.buyNow{value: 1 ether}(tokenId);

        // Check NFT ownership
        assertEq(nft.ownerOf(tokenId), alice);
    }

    function testCancelListing() public {
        uint256 tokenId = 0;

        // Creator lists NFT
        vm.prank(creator);
        marketplace.listForSale(tokenId, 1 ether);

        // Cancel listing
        vm.prank(creator);
        marketplace.cancelListing(tokenId);

        // Check listing deleted
        (, , uint256 timestamp) = marketplace.listings(tokenId);
        assertEq(timestamp, 0); // timestamp should reset
    }

    function testAuctionFlow() public {
        uint256 tokenId = 0;
        uint256 startTime = block.timestamp + 1;
        uint256 endTime = block.timestamp + 100;

        // Create auction
        vm.prank(creator);
        marketplace.createAuction(tokenId, startTime, endTime);

        // Move time forward
        vm.warp(startTime + 1);

        // Alice places bid
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        marketplace.placeBid{value: 0.5 ether}(tokenId);

        // Bob places higher bid
        vm.deal(bob, 1 ether);
        vm.prank(bob);
        marketplace.placeBid{value: 0.8 ether}(tokenId);

        // Move time to end
        vm.warp(endTime + 1);

        // Close auction
        vm.prank(creator);
        marketplace.closeAuction(tokenId);

        // Bob should be the winner
        assertEq(nft.ownerOf(tokenId), bob);
    }
}
