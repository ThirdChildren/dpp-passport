// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Digital Product Passport NFT
/// @notice NFT che accompagna un prodotto fisico con metadata su IPFS
contract ProductPassport is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct ProductInfo {
        string gtin;   // codice GS1 del prodotto
        string batch;  // lotto o seriale
    }

    mapping(uint256 => ProductInfo) public passportInfo;

    constructor()
        ERC721("DigitalProductPassport", "DPP")
        Ownable(msg.sender)  // passiamo l'owner al costruttore di OpenZeppelin
    {}

    /// @dev mint eseguito dal produttore/owner; l'NFT è trasferibile
    function mintPassport(
        address to,
        string calldata uri,   // CID IPFS con JSON ESPR-compliant
        string calldata gtin,
        string calldata batch
    ) external onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newId = _tokenIds;
        _safeMint(to, newId);
        _setTokenURI(newId, uri);
        passportInfo[newId] = ProductInfo(gtin, batch);
        return newId;
    }

    /// @notice possibilità di aggiornare il metadata URI (es. nuovo LCA)
    function updateURI(uint256 tokenId, string calldata newUri)
        external
        onlyOwner
    {
        _setTokenURI(tokenId, newUri);
    }
}
