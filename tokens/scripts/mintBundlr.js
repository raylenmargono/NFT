require('dotenv').config();
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const contract = require('../artifacts/contracts/Bundlr.sol/Bundlr.json');

const {PUBLIC_KEY, API_URL, PRIVATE_KEY} = process.env;

const web3 = createAlchemyWeb3(API_URL);

const contractAddress = "0x9FeCb1eC70b89F08F4D6f311C9c758e4Ba6c52A5";
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function mintNFT() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce

  //the transaction
  const tx = {
    'from': PUBLIC_KEY,
    'to': contractAddress,
    'nonce': nonce,
    'gas': 500000,
    'data': nftContract.methods.mintNFT(PUBLIC_KEY).encodeABI()
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

mintNFT();
