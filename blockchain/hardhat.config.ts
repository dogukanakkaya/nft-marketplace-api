import { HardhatUserConfig, task } from "hardhat/config";
import * as dotenv from 'dotenv';
dotenv.config();
import "@nomicfoundation/hardhat-toolbox";
import { MUMBAI_RPC_URL, PRIVATE_KEY } from "./config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

task('deploy', 'Deploy a contract', async (_, hre) => {
  const Spacer = await hre.ethers.getContractFactory('Spacer');
  const spacer = await Spacer.deploy();
  await spacer.deployed();

  console.log(spacer.address);
});

export default config;
