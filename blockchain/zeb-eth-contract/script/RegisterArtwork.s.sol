// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/ZebNFT.sol";

contract RegisterArtworkScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        address nftAddress = vm.envAddress("NFT_ADDRESS");
        ZebNFT nft = ZebNFT(nftAddress);

        string memory title = "My First Artwork";
        string memory uri = "ipfs://QmExampleHash";

        bytes32 hash = keccak256(abi.encodePacked(title, uri));

        uint256 tokenId = nft.registerArtwork(title, uri, hash);
        console.log("Token ID:", tokenId);

        address marketplace = vm.envAddress("MARKETPLACE");
        nft.setApprovalForAll(marketplace, true);

        console.log("Marketplace approved");

        vm.stopBroadcast();
    }
}