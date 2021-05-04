//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// 0x51c839BBDcd13577c34B5Fb6D29Fd4B0F20eB005
contract Bundlr is ERC721, IERC721Receiver, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // TODO: clean up storage
    mapping(uint256 => mapping(address => uint256[])) bundlrIdToNFTAddressIdMap;
    mapping(uint256 => address[]) bundlrIdToNFTAddresses;
    mapping(uint256 => uint256) bundlrIdToSize;

    constructor() public ERC721("Bundlr", "BUNDLR") {}

    function mintNFT(address recipient)
        external onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        return newItemId;
    }

    function getNFTAddresses(uint256 _nftId)
        external
        view
        returns (string[]memory)
    {
        return bundlrIdToNFTAddresses[_nftId];
    }

    function viewAllTokenURIs(uint256 _nftId)
        external
        view
        returns (string[] memory)
    {
        require(msg.sender == ownerOf(_nftId));

        string[] memory result = new string[](bundlrIdToSize[_nftId]);
        address[] memory nftAddresses = bundlrIdToNFTAddresses[_nftId];

        uint idx = 0;
        for(uint i=0; i < nftAddresses.length; i++) {
            address tokenAddress = nftAddresses[i];

            uint256[] memory tokensInStorage = bundlrIdToNFTAddressIdMap[_nftId][tokenAddress];

            for(uint j=0; j < tokensInStorage.length; j++) {
                ERC721 nftContract = ERC721(tokenAddress);
                string memory tokenURI = nftContract.tokenURI(tokensInStorage[j]);
                result[idx] = tokenURI;
                idx = idx + 1;
            }
        }
        return result;
    }

    function liquidate(uint256 _nftId) external {
        require(msg.sender == ownerOf(_nftId));

        address[] memory nftAddresses = bundlrIdToNFTAddresses[_nftId];

        for(uint i=0; i < nftAddresses.length; i++) {
            address tokenAddress = nftAddresses[i];

            uint256[] memory tokensInStorage = bundlrIdToNFTAddressIdMap[_nftId][tokenAddress];

            for(uint j=0; j < tokensInStorage.length; j++) {
                ERC721 nftContract = ERC721(tokenAddress);
                nftContract.safeTransferFrom(address(this), msg.sender, tokensInStorage[j]);
            }
        }

        _burn(_nftId);
    }

    // Deposit an asset and start an auction
    function onERC721Received(
        address,
        address _from,  // the sender
        uint256 _tokenId, // the token id that was transferred over
        bytes calldata _nftId  // the nft you want to send it to
    )
        external
        override
        returns(bytes4)
    {
        (uint8 bundlrNFTId) = abi.decode(_nftId, (uint8));
        // check if you are the owner of this ID
        require(_from == ownerOf(bundlrNFTId));

        bundlrIdToNFTAddressIdMap[bundlrNFTId][msg.sender].push(_tokenId);
        bundlrIdToNFTAddresses[bundlrNFTId].push(msg.sender);
        bundlrIdToSize[bundlrNFTId] = bundlrIdToSize[bundlrNFTId] + 1;
        return this.onERC721Received.selector;
    }
}
