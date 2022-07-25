// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");

  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  // console.log("Lock with 1 ETH deployed to:", lock.address);

  // We get the contract to deploy
  // const Box = await ethers.getContractFactory('Box')
  // console.log('Deploying Box...')
  // const box = await Box.deploy()
  // await box.deployed()
  // console.log('Box deployed to:', box.address)

  const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace')
  const nftMarketplace = await NFTMarketplace.deploy()
  await nftMarketplace.deployed()
  console.log('nftMarketplace deployed to:', nftMarketplace.address)

  fs.writeFileSync(
    './config.js',
    `
  export const marketplaceAddress = "${nftMarketplace.address}"
  `
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  // .then(() => {
  //   process.exitCode = 0
  // })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
