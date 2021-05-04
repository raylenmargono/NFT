import {useEffect, useState} from 'react'
import {ethers} from 'ethers'

import Head from 'next/head'
import Link from 'next/link'

import styles from '../styles/Home.module.scss'
import {Bundlr} from '../../tokens/typechain/Bundlr'
import {RayCoin} from "../../tokens/typechain/RayCoin";
const BundlrABI = require( '../../tokens/artifacts/contracts/Bundlr.sol/Bundlr.json').abi
const RayCoinABI = require( '../../tokens/artifacts/contracts/RayCoin.sol/RayCoin.json').abi

type NFTMetaDataWithId = {
  tokenId: number;
  name: string;
  description: string;
  image: string;
}

export default function Home() {

  const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(false)
  const [addressConnected, setAddressConnected] = useState<string>('')
  const [nfts, setNfts] = useState<Array<NFTMetaDataWithId>>([])


  useEffect(async () => {
    window.ethereum.addListener('connect', async (response) => {
      console.log(response)
      setMetaMaskConnected(true)
    })

    window.ethereum.on('accountsChanged', async (accounts) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setAddressConnected(await provider.getSigner().getAddress())
    })

    setMetaMaskConnected(window.ethereum.isConnected())
  }, [])

  useEffect(async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setAddressConnected(await provider.getSigner().getAddress())
  }, [])

  const connectMetaMask = async () => {
    const response = window.ethereum.request({method: 'eth_requestAccounts'})
    console.log(response)
  }

  useEffect(async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const userAddress = await provider.getSigner().getAddress()
    const rayCoinContract = new ethers.Contract(
        '0x5834205675fA41213e456d5d01B39394A934Ed42',
        RayCoinABI,
        provider,
    ) as RayCoin;
    const tokenBalance = await rayCoinContract.balanceOf(userAddress)

    const nftRetrieved = []
    for(const n of Array(tokenBalance.toNumber()).keys()) {
      // TODO: can use these numbers to get tokenURIs and then display image
      const tokenId = await rayCoinContract.tokenOfOwnerByIndex(userAddress, n)
      const url = await rayCoinContract.tokenURI(tokenId)
      const res = await fetch(url)
      const nftData = await res.json()
      nftRetrieved.push({...nftData, tokenId: tokenId.toNumber()})
    }

    setNfts(nftRetrieved)

  }, [addressConnected])

  return (
    <div className={styles.container}>
      <Head>
        <title>NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <button onClick={connectMetaMask}>
          {metaMaskConnected ?
              `Connected! ${addressConnected}` :
              'Connect to metamask'}
        </button>
        {metaMaskConnected && (
          <>
            <Link href={`/mint/`}>
                <a>
                    Mint tokens
                </a>
            </Link>
            <h1>RayCoin NFTs</h1>
            {nfts.map(({image, tokenId}) => (
                <div className={styles.card}>
                    <Link href={`/token/${tokenId}`}>
                        <a>
                            <img width="600" height="auto" src={image} />
                        </a>
                    </Link>
                </div>
        ))}
          </>
        )}

      </main>
    </div>
  )
}
