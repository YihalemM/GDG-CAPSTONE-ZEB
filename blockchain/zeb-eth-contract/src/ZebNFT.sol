// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ZebStorage.sol";

contract ZebNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => Artwork) public artworks;
    mapping(bytes32 => bool) private hashExists; // prevent duplicates

    event ArtworkRegistered(
        uint256 indexed tokenId,
        string title,
        string uri,
        bytes32 hash,
        address indexed creator,
        uint256 timestamp
    );

    constructor(
        address initialOwner
    ) ERC721("ZebNFT", "ZEB") Ownable(initialOwner) {}

    function registerArtwork(
        string memory title,
        string memory uri,
        bytes32 hash
    ) external returns (uint256) {
        if (hashExists[hash]) revert ArtworkAlreadyExists();

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        artworks[tokenId] = Artwork({
            title: title,
            uri: uri,
            hash: hash,
            creator: msg.sender,
            currentOwner: msg.sender,
            timestamp: block.timestamp
        });

        hashExists[hash] = true;

        emit ArtworkRegistered(
            tokenId,
            title,
            uri,
            hash,
            msg.sender,
            block.timestamp
        );
        return tokenId;
    }

    function transferNFT(uint256 tokenId, address newOwner) external {
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "Not owner or approved"
        );
        _transfer(owner, newOwner, tokenId);
        artworks[tokenId].currentOwner = newOwner;
    }

    function getCreator(uint256 tokenId) external view returns (address) {
        if (artworks[tokenId].creator == address(0)) revert ArtworkNotFound();
        return artworks[tokenId].creator;
    }

    function getOwner(uint256 tokenId) external view returns (address) {
        if (artworks[tokenId].currentOwner == address(0))
            revert ArtworkNotFound();
        return artworks[tokenId].currentOwner;
    }
}
