require("dotenv").config();

// setup 
const data = {
    labels: [],
    datasets: [{
      label: 'Base Fee (wei)',
       data: [],
      backgroundColor: [
        'rgba(255, 26, 104, 0.2)',
      ],
      borderColor: [
        'rgba(255, 26, 104, 1)',
      ],
      borderWidth: 1
    }]
  };

  // config 
  const config = {
    type: 'line',
    data,
    options: {
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            beginAtZero: true
          },
        }
      }
    }
  };

  // render init block
  const baseFeeChart = new Chart(
    document.getElementById('baseFeeChart'),
    config
  );

// Setup: npm install alchemy-sdk
const { Network, Alchemy } = require('alchemy-sdk');

let baseFeePerBlock = {};
let labels = [];
let dataset = [];

// Optional config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.apiKey,  // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

// handle appending to dict for incoming blocks
const handleBlocks = (block) => {
    // current block
    const blockNumber = block.number;
    const baseFeeWei = (block.baseFeePerGas).toString();

    // Append basefee to dict
    //baseFeePerBlock[blockNumber] = baseFeeWei;
    if (labels.length != 10) {
        labels.push(blockNumber);
        dataset.push(baseFeeWei);
    } else {
        labels.shift()
        dataset.shift()

        labels.push(blockNumber);
        dataset.push(baseFeeWei);
    }
    // push to dynamic chart
    updateChart();
    console.log(labels, dataset);
}

function updateChart() {
  data.labels = labels;
  data.datasets[0].data = dataset;

  baseFeeChart.update();
}

// run previous 10 block basefee catcher
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
