import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getTokenIdFromReceipt } from "../helper";
import { NFT_METADATA_SECRET } from "../config";

describe("Spacer", function () {
  const name = 'test';
  const validId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name + NFT_METADATA_SECRET));
  const invalidId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('none' + NFT_METADATA_SECRET));

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

      const uri = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
      const tx = await spacer.mint(uri, name, validId);
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);

      expect(await spacer.tokenURI(tokenId)).to.equal(uri);
      expect(await spacer.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("should increment the token ID counter", async function () {
      const { spacer } = await loadFixture(deploySpacerFixture);

      const uri1 = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
      const tx1 = await spacer.mint(uri1, name, validId);
      await tx1.wait();

      const uri2 = "ipfs://QmRv6jFMbiRdGK59BZXWds9f2Y1AfjGqdn3nsg8Wpt1NyF";
      const tx2 = await spacer.mint(uri2, name, validId);
      const r = await tx2.wait();

      expect(getTokenIdFromReceipt(r)).to.equal(2);
    });

    it("should fail with invalid id", async function () {
      const { spacer, owner } = await loadFixture(deploySpacerFixture);

      const uri = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
      await expect(spacer.mint(uri, name, invalidId)).to.be.revertedWith('Invalid Hash');
    });
  });

  describe("burning", function () {
    it("should burn an existing token", async function () {
      const { spacer } = await loadFixture(deploySpacerFixture);

      const uri = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
      const tx = await spacer.mint(uri, name, validId);
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);
      await spacer.burn(tokenId);

      await expect(spacer.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("ownership", function () {
    it("should transfer ownership to another address", async function () {
      const { spacer, owner, otherAccount } = await loadFixture(deploySpacerFixture);

      const uri = "ipfs://QmS26tT33BkTjJt8sMPtG4f4Jmfq3qMzZphYMsX9LdZRVH";
      const tx = await spacer.mint(uri, name, validId);
      const r = await tx.wait();
      const tokenId = getTokenIdFromReceipt(r);
      await spacer.transferFrom(owner.address, otherAccount.address, tokenId);

      expect(await spacer.ownerOf(tokenId)).to.equal(otherAccount.address);
    });
  });
});
