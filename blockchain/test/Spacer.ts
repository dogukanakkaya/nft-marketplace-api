import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getTokenIdFromReceipt } from "../helper";
import { NFT_METADATA_SECRET } from "../config";

describe("Spacer", function () {
  const uri = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
  const name = 'test';
  const validId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uri + name + NFT_METADATA_SECRET));
  const invalidId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uri + 'none' + NFT_METADATA_SECRET));
  const value = ethers.utils.parseEther('0.01');

  async function deploySpacerFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Spacer = await ethers.getContractFactory('Spacer');
    const spacer = await Spacer.deploy(NFT_METADATA_SECRET);
    await spacer.deployed();

    return { spacer, owner, otherAccount };
  }

  describe("minting", function () {
    it("should mint a new token with the given URI", async function () {
      const { spacer, owner } = await loadFixture(deploySpacerFixture);

      const tx = await spacer.mint(uri, name, validId, { from: owner.address, value });
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);

      expect(await spacer.tokenURI(tokenId)).to.equal(uri);
      expect(await spacer.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("should increment the token ID counter", async function () {
      const { spacer, owner } = await loadFixture(deploySpacerFixture);

      const tx1 = await spacer.mint(uri, name, validId, { from: owner.address, value });
      await tx1.wait();

      const tx2 = await spacer.mint(uri, name, validId, { from: owner.address, value });
      const r = await tx2.wait();

      expect(getTokenIdFromReceipt(r)).to.equal(2);
    });

    it("should fail with invalid id", async function () {
      const { spacer, owner } = await loadFixture(deploySpacerFixture);

      await expect(spacer.mint(uri, name, invalidId, { from: owner.address, value })).to.be.revertedWith('Invalid Hash');
    });

    it("should fail with insufficient funds", async function () {
      const { spacer } = await loadFixture(deploySpacerFixture);

      await expect(spacer.mint(uri, name, validId)).to.be.revertedWith('0.01 ether is required');
    });
  });

  describe("burning", function () {
    it("should burn an existing token", async function () {
      const { spacer, owner } = await loadFixture(deploySpacerFixture);

      const tx = await spacer.mint(uri, name, validId, { from: owner.address, value });
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);
      await spacer.burn(tokenId);

      await expect(spacer.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("ownership", function () {
    it("should transfer ownership to another address", async function () {
      const { spacer, owner, otherAccount } = await loadFixture(deploySpacerFixture);

      const tx = await spacer.mint(uri, name, validId, { from: owner.address, value });
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);
      await spacer.transferFrom(owner.address, otherAccount.address, tokenId);

      expect(await spacer.ownerOf(tokenId)).to.equal(otherAccount.address);
    });
  });
});
