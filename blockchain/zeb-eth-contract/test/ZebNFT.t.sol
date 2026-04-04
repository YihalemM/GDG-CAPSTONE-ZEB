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

    function setUp() public {
        nft = new ZebNFT(creator);
        marketplace = new ZebMarketplace(nft);

        vm.prank(creator);
        nft.registerArtwork(
            "Masterpiece",
            "ipfs://masterpiece",
            keccak256("masterpiece")
        );

        vm.prank(creator);
        nft.setApprovalForAll(address(marketplace), true);
    }

    function testCancelListing() public {
        vm.prank(creator);
        marketplace.listForSale(0, 1 ether);

        vm.prank(creator);
        marketplace.cancelListing(0);
    }

    function testListAndBuy() public {
        vm.prank(creator);
        marketplace.listForSale(0, 1 ether);

        vm.deal(alice, 2 ether);
        vm.prank(alice);
        marketplace.buyNow{value: 1 ether}(0);

        assertEq(nft.ownerOf(0), alice);
    }

    function testAuctionFlow() public {
        vm.prank(creator);
        marketplace.createAuction(
            0,
            block.timestamp,
            block.timestamp + 1 hours
        );

        vm.deal(alice, 1 ether);
        vm.prank(alice);
        marketplace.placeBid{value: 1 ether}(0);

        vm.warp(block.timestamp + 2 hours);
        vm.prank(creator);
        marketplace.closeAuction(0);

        assertEq(nft.ownerOf(0), alice);
    }
}
