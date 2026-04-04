// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";
import "forge-std/Script.sol";
import "../src/ZebMarketplace.sol";
import "../src/ZebNFT.sol";

contract MarketplaceScript is Script {
    function run() external {
        // Load contracts from .env
        ZebMarketplace marketplace = ZebMarketplace(
            vm.envAddress("MARKETPLACE")
        );
        ZebNFT nft = ZebNFT(vm.envAddress("NFT_CONTRACT"));

        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // 👇 Ensure deployer can manage NFTs
        nft.setApprovalForAll(address(marketplace), true);
        console.log("Marketplace approved for NFT management");

        // Example token id and price
        uint256 tokenId = vm.envUint("TOKEN_ID");
        uint256 price = 1 ether;

        // 1️⃣ List artwork for sale
        marketplace.listForSale(tokenId, price);
        console.log("Artwork listed for sale:", tokenId, "Price:", price);

        // 2️⃣ Auction flow
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + 1 days;

        marketplace.createAuction(tokenId, startTime, endTime);
        console.log("Auction created for token:", tokenId, "Ends at:", endTime);

        // Fund deployer for bidding (optional, if same account bids)
        vm.deal(msg.sender, 5 ether);

        uint256 bidAmount = 2 ether;
        marketplace.placeBid{value: bidAmount}(tokenId);
        console.log("Bid placed for token", tokenId, "Amount:", bidAmount);

        // Close auction after endTime
        vm.warp(endTime + 1); // move time forward
        marketplace.closeAuction(tokenId);
        console.log("Auction closed for token:", tokenId);

        vm.stopBroadcast();
    }
}
