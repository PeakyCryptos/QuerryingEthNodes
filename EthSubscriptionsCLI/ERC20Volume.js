require("dotenv").config();

// log transfers of specified ERC20 token
// dict for storing blockNumber => # of transfers
let transactionVolume = {};
let labels = [];
let data = Array(10).fill(0); // initalize 10 datapoints with 0 

// npm install @alchemy-sdk
const { Network, Alchemy } = require('alchemy-sdk');

const settings = {
  apiKey: process.env.apiKey, // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

// This is the "transfer event" topic we want to watch.
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// This is the NFT contract we want to watch.
const tokenContractAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";

// Create the log options object
const chainlinkTransferEvents = {
  address: tokenContractAddress,
  topics: [transferTopic],
};

const update = (block) => {
    console.log('block:', block);
    // update arrays
    index = labels.indexOf(block);
    console.log('index', index);
    if (labels.length == 10) {
        if (index != -1) {
            data[index] += 1;
        } else {
            // index doesn't exist make space for new block
            labels.shift();
            data.shift();

            // push new block
            labels.push(block);
            data.push(1);
        }
    } else {
        // add 10 elements
        // if already existing block increment
        if (index != -1) {
            data[index]++;
        } else {
            // if new block increment
            labels.push(block);
            // get new index of curr block
            index = labels.indexOf(block);
            data[index] +=1; 
        }
    }    
}

// precatch all transfer events from up to 10 blocks behind
const prependTenBlocks = (transactions) => {
    // x axis blockNumber, y axis 
    //console.log(transactions);

    for (const transaction of transactions){
        // block of transaction
        const block = transaction.blockNumber; 

        // increment volume per block, if new block initalize as 0
        //transactionVolume[block] = (transactionVolume[block] || 0) + 1;  
        // update labels and data 
        update(block);
    }

    // push to dynamic chart
    //console.log(transactionVolume);
    console.log(labels, data);

}

// handle appending to dict for incoming blocks
const newBlocks = (transaction) => {
    // current block
    const block = transaction.blockNumber;

    // increment volume per block, if new block initalize as 0
    //transactionVolume[block] = (transactionVolume[block] || 0) + 1; 

    // push to dynamic chart
    //console.log(transactionVolume);

    // update labels and data 
    update(block);

    //
    console.log(labels, data);

}

function updateChart(chart) {
    data.labels = labels;
    data.datasets.data = data;

    chart.update();
}

// run previous 10 block transfer catcher
(async  () => {
    // get current block
    const latestBlock = await alchemy.core.getBlockNumber();
    // 10 blocks back
    const startingBlock = latestBlock - 10;

    // autofill with transaction from 10 blocks ago
    alchemy.core
    .getLogs({
        address: tokenContractAddress,
        topics: [ transferTopic, ],
        fromBlock:
            startingBlock,
        toBlock:
            latestBlock,
    })
    .then(prependTenBlocks);
})();

// Open the websocket and listen for events!
alchemy.ws.on(chainlinkTransferEvents, newBlocks);