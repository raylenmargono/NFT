import {useCallback, useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import styles from '../styles/Home.module.scss'
import {ethers} from "ethers";
import {RayCoin} from "../../tokens/typechain/RayCoin";
import Link from "next/link";

const RayCoinABI = require( '../../tokens/artifacts/contracts/RayCoin.sol/RayCoin.json').abi


export default function Mint() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [uploadStatus, setUploadStatus] = useState('')

  const createNFT = useCallback( async (e) => {
    e.preventDefault()
    const formData = new FormData();
    formData.append('name', name)
    formData.append('description', description)
    formData.append('image', selectedFile)

    const response =  await fetch('/api/mint', {
        'body': formData,
        'method': 'post',
    })

    console.log(response)
    setUploadStatus('success')

  }, [name, description, selectedFile])

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
          <h1>Mint RayCoin</h1>
        <form onSubmit={createNFT}>
            <label htmlFor="name">Name</label>
            <input
                placeholder="Name"
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
            />

            <label htmlFor="description">Description</label>
            <input
                placeholder="Description"
                type="textarea"
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
            />

            <label htmlFor="firstName">Image</label>
            <input
                type="file"
                name="image"
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button type="submit">Create</button>
        </form>
          <h3>{uploadStatus}</h3>
      </main>
    </div>
  )
}
