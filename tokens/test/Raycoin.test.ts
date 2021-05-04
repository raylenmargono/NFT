import { expect } from 'chai'
import { ethers } from 'hardhat'

import {RayCoin} from '../tokens/typechain/RayCoin'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'


describe('RayCoin contract', function() {

  let rayCoin: RayCoin
  let owner: SignerWithAddress
  let addr1: SignerWithAddress

  before(async function() {

    [owner, addr1] = await ethers.getSigners()

    const rc = await ethers.getContractFactory('RayCoin')
    rayCoin = await rc.deploy() as RayCoin
  })

  it('should mint NFT', async function() {
    const txResponse = await rayCoin.mintNFT(owner.address, 'https://test.com')
    const txResult = await txResponse.wait()
    expect(txResult).to.not.be.null;
  })

  it ('owner should have the coin', async function () {
    expect(await rayCoin.balanceOf(owner.address)).to.equal(1)
  })

  it ('owner of the NFT should be owner', async function () {
    expect(await rayCoin.ownerOf(1)).to.equal(owner.address)
  })

  it ('tokenURI should be set', async function () {
    expect(await rayCoin.tokenURI(1)).to.equal('https://test.com')
  })

  it('should transfer to another owner', async function() {
    const approveResponse = await rayCoin.approve(addr1.address, 1)
    await approveResponse.wait()

    const sendResponse = await rayCoin['safeTransferFrom(address,address,uint256)'](owner.address, addr1.address, 1)
    await sendResponse.wait()

    expect(await rayCoin.balanceOf(addr1.address)).to.equal(1)
    expect(await rayCoin.balanceOf(owner.address)).to.equal(0)
    expect(await rayCoin.ownerOf(1)).to.equal(addr1.address)

  })

});
