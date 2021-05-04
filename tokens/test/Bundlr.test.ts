import { expect } from 'chai'
import { ethers } from 'hardhat'

import {RayCoin} from '../tokens/typechain/RayCoin'
import {Bundlr} from '../tokens/typechain/Bundlr'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';


describe('Bundlr contract', function() {

  let bundlrContract: Bundlr
  let rayCoin: RayCoin
  let owner: SignerWithAddress
  let addr1: SignerWithAddress

  before(async function() {

    [owner, addr1] = await ethers.getSigners()

    const b = await ethers.getContractFactory('Bundlr')
    bundlrContract = await b.deploy() as Bundlr

    const rc = await ethers.getContractFactory('RayCoin')
    rayCoin = await rc.deploy() as RayCoin;
  })

  describe('can mint bundlr', function () {

    before(async function() {
      const txResponse1 = await rayCoin.mintNFT(owner.address, 'https://test1.com')
      await txResponse1.wait()

      const txResponse2 = await rayCoin.mintNFT(owner.address, 'https://test2.com')
      await txResponse2.wait()

      expect(await rayCoin.balanceOf(owner.address)).to.equal(2);
    })

    it('should mint NFT', async function() {
      const txResponse = await bundlrContract.mintNFT(owner.address)
      const txResult = await txResponse.wait()
      expect(txResult).to.not.be.null;
    })

    it ('owner should have the coin', async function () {
      expect(await bundlrContract.balanceOf(owner.address)).to.equal(1);
    })
  })


  describe('should be able to send nft to bundlr',  function () {


    before(async function () {
      const approveResponse = await rayCoin.approve(bundlrContract.address, 1)
      await approveResponse.wait()

      const nftEncoded = ethers.utils.defaultAbiCoder.encode(['uint8'], [1])
      const sendResponse = await rayCoin['safeTransferFrom(address,address,uint256,bytes)'](
        owner.address,
        bundlrContract.address,
        1,
        nftEncoded,
      )
      await sendResponse.wait()
    })

    it ('nft ownership should transfer to bundlr', async function() {
      expect(await rayCoin.ownerOf(1)).to.equal(bundlrContract.address);
    })

    it ('bundlr should have balance of 1 for nft', async function() {
      expect(await rayCoin.balanceOf(bundlrContract.address)).to.equal(1);
    })

    it ('balance of owner should reduce by 1', async function() {
      expect(await rayCoin.balanceOf(owner.address)).to.equal(1);
    })

    it ('should not be able to send nft again', async function () {
      await expect(rayCoin.approve(bundlrContract.address, 1)).to.be.reverted;
    })

    it('should be able to view all tokenURIs in bundlr NFT', async function() {
      expect(await bundlrContract.viewAllTokenURIs(1)).to.deep.equal([
          'https://test1.com',
      ])
    })

    it('should be able to retrieve token addresses in bundlr', async function() {
      expect(await bundlrContract.getNFTAddresses(1)).to.equal(rayCoin.address)
    })

  })

  describe('owner of bundlr NFT shoudl be able to liquidate holdings', function () {
    it('bundlr should have new ownership to user', async function () {

      const approveResponse = await bundlrContract.approve(addr1.address, 1)
      await approveResponse.wait()

      const sendResponse = await bundlrContract['safeTransferFrom(address,address,uint256)'](owner.address, addr1.address, 1)
      await sendResponse.wait()
      expect(await bundlrContract.balanceOf(addr1.address)).to.equal(1);
      expect(await bundlrContract.balanceOf(owner.address)).to.equal(0);
      expect(await bundlrContract.ownerOf(1)).to.equal(addr1.address);
    })

    it('rayCoin ownership should be removed from owner', async function () {
      expect(await rayCoin.balanceOf(bundlrContract.address)).to.equal(1);
      expect(await rayCoin.balanceOf(addr1.address)).to.equal(0);
      expect(await rayCoin.balanceOf(owner.address)).to.equal(1);
    })

    it('new owner should be able to liquidate NFTs', async function () {

      await expect(bundlrContract.liquidate(1)).to.be.reverted;

      const contract = bundlrContract.connect(addr1)
      const approveResponse = await contract.liquidate(1)
      await approveResponse.wait()

      expect(await rayCoin.balanceOf(addr1.address)).to.equal(1);
      expect(await contract.balanceOf(addr1.address)).to.equal(0);

      await expect(contract.liquidate(1)).to.be.reverted;
    })
  })

})
