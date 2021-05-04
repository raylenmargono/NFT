# Intro

An example of creating NFTs using solidity on the ropstein test network.
This is a toy application that I used to experiment building and viewing
NFT smart contracts on ethereum. 

## app
The dapp to view NFTs creating using RayCoin. To mint NFTs go to the
/tokens directory and execute the command

yarn hardhat run scripts/mintNFT.js --network ropsten

## token
Folder where solidity contracts live. Add your wallet's
secret and public key in the .env file as well as the ropstein network API
route.

To mint

1. Run yarn hardhat run scripts/deploy.js --network ropsten
2. Change contractAddress in scripts/mintNFT.js
3. Add the url of the NFT in the mintNFT function
4. run yarn hardhat run scripts/mintNFT.js --network ropsten


I've also created another contract called Bundlr designed to 
store arbitrary NFTs for users and allows them to liquidate all
holdings into their wallet.

All tests are passing - see /test 
 
