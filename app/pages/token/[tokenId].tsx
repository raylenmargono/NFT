import {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import styles from '../../styles/Home.module.scss'
import {ethers} from "ethers";
import {RayCoin} from "../../../tokens/typechain/RayCoin";
import Link from "next/link";

const RayCoinABI = require( '../../../tokens/artifacts/contracts/RayCoin.sol/RayCoin.json').abi

type NFTMetaDataWithId = {
  tokenId: number;
  name: string;
  description: string;
  image: string;
}

export default function TokenId(args) {

  const router = useRouter()
  const { tokenId } = router.query

  const [nft, setNft] = useState<NFTMetaDataWithId>({})

  useEffect(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const rayCoinContract = new ethers.Contract(
        '0x5834205675fA41213e456d5d01B39394A934Ed42',
        RayCoinABI,
        provider,
    ) as RayCoin;
    const url = await rayCoinContract.tokenURI(parseInt(tokenId))
    const res = await fetch(url)
    const nftData = await res.json()
    setNft(nftData)
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Link href="/">
          <a>
            Home
          </a>
        </Link>
        <h1>RayCoin NFT</h1>
        <div>
          <h3>RayCoin Token ID: {tokenId}</h3>
          <p>{nft.name}</p>
          <p>{nft.description}</p>
          <img width="600" height="auto" src={nft.image} />
        </div>

      </main>
    </div>
  )
}
