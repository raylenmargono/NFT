/**
* @type import('hardhat/config').HardhatUserConfig
*/
import {config} from 'dotenv'
import '@nomiclabs/hardhat-waffle'
import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-typechain';

config()

const { API_URL, PRIVATE_KEY } = process.env;

const hardHatConfig: HardhatUserConfig = {
   solidity: '0.7.3',
   defaultNetwork: 'hardhat',
   networks: {
      hardhat: {},
      ropsten: {
         url: API_URL,
         accounts: [
           `0x${PRIVATE_KEY}`,
         ]
      }
   },
   mocha: {
    timeout: 1000000
  }
}

export default hardHatConfig;

