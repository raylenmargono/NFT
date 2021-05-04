
// to 0xd2a4ba60b3976ac823ba6e6ebe6e1914e53f45bb

require('dotenv').config();
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const rayContract = require('../artifacts/contracts/RayCoin.sol/RayCoin.json');
const bundlrContract = require('../artifacts/contracts/Bundlr.sol/Bundlr.json');


const {PUBLIC_KEY, API_URL, PRIVATE_KEY} = process.env;

const web3 = createAlchemyWeb3(API_URL);

const bundlrContractAddress = "0x51c839bbdcd13577c34b5fb6d29fd4b0f20eb005";
const rayCoinContractAddress = "0x7d316747945fddd8c1de085e83e5db83f313fe31"
const nftRayContract = new web3.eth.Contract(rayContract.abi, rayCoinContractAddress);
const nftBundlrContract = new web3.eth.Contract(bundlrContract.abi, bundlrContractAddress);


async function transfer() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce

  // this is so that the contract sends to the bundlr contract
  // const tx = {
  //   'from': PUBLIC_KEY,
  //   'to': rayCoinContractAddress,
  //   'nonce': nonce,
  //   'gas': 500000,
  //   'data': nftRayContract.methods.safeTransferFrom(PUBLIC_KEY, bundlrContractAddress, 1).encodeABI(),
  // };

  // this is so that the contract approves the bundlr contract to receive
  // const tx = {
  //   'from': PUBLIC_KEY,
  //   'to': rayCoinContractAddress,
  //   'nonce': nonce,
  //   'gas': 500000,
  //   'data': nftRayContract.methods.approve(bundlrContractAddress, 1).encodeABI(),
  // };

  const tx = {
    'from': PUBLIC_KEY,
    'to': bundlrContractAddress,
    'nonce': nonce,
    'gas': 500000,
    'data': nftBundlrContract.methods.liquidate().encodeABI(),
  };

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise.then((signedTx) => {

    web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
      if (!err) {
        console.log("The hash of your transaction is: ", hash, "\nCheck Alchemy's Mempool to view the status of your transaction!");
      } else {
        console.log("Something went wrong when submitting your transaction:", err)
      }
    });
  }).catch((err) => {
    console.log(" Promise failed:", err);
  });
}

transfer();
