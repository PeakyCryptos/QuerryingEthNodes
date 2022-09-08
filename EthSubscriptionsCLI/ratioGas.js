require("dotenv").config();

// Setup: npm install alchemy-sdk
const { Network, Alchemy } = require('alchemy-sdk');

let ratioGas = {};
let labels = [];
let dataset = [];

// Optional config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.apiKey, // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

// handle appending to dict for incoming blocks
const handleBlocks = (block) => {
    // current block
    const blockNumber = block.number;
    const gasLimit = (block.gasLimit).toString();
    const gasUsed = (block.gasUsed).toString();

    // Append basefee to dict
    //ratioGas[blockNumber] = gasUsed/gasLimit;
    
    if (labels.length != 10) {
        labels.push(blockNumber);
        dataset.push(gasUsed/gasLimit);
    } else {
        labels.shift()
        dataset.shift()

        labels.push(blockNumber);
        dataset.push(gasUsed/gasLimit);
    }

    // push to dynamic chart
    console.log(labels, dataset);
}

// run previous 10 blocks 
(async  () => {
    // get current block
    const latestBlock = await alchemy.core.getBlockNumber();
    // 10 blocks back
    const startingBlock = latestBlock - 10;

    // autofill with basefee from 10 blocks ago
    for (let i = startingBlock; i <= latestBlock; i++) {
        alchemy.core
        .getBlock(
            i,
            true
        ).then(handleBlocks);
    }     
})();

// Subscription for new blocks
alchemy.ws.on("block", async function (blockNumber) {
    // for every new block call newBlocks function
    alchemy.core
        .getBlock(
            blockNumber,
            true
    ).then(handleBlocks);
}
);
