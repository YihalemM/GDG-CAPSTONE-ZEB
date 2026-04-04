// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/ZebNFT.sol";
import "../src/ZebMarketplace.sol";

contract DeployScript is Script {
    function run() external {
        // 1️⃣ Load deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // 2️⃣ Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // 👇 Get deployer address
        address deployer = vm.addr(deployerPrivateKey);

        // 3️⃣ Deploy NFT contract
        ZebNFT nft = new ZebNFT(deployer);
        console.log("NFT deployed at:", address(nft));

        // 4️⃣ Deploy Marketplace contract (ETH-only)
        ZebMarketplace marketplace = new ZebMarketplace(nft);
        console.log("Marketplace deployed at:", address(marketplace));

        // 5️⃣ Approve marketplace to manage all NFTs for deployer
        nft.setApprovalForAll(address(marketplace), true);
        console.log("Marketplace approved to manage NFTs");

        // 6️⃣ Stop broadcasting
        vm.stopBroadcast();

        // ✅ After deployment, save these addresses in .env:
        // NFT_ADDRESS=...
        // MARKETPLACE_ADDRESS=...
    }
}
