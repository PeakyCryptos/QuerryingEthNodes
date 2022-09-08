require("dotenv").config();

// setup 
const data = {
    labels: [],
    datasets: [{
      label: 'Transfer Volume',
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
    type: 'bar',
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
  const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

  // initalize
  let labels = [];
  let dataset = Array(10).fill(0); // initalize 10 datapoints with 0 
  let tokenMetaData = null;
  let tokenName = null;
  let tokenSymbol = null;

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
  let tokenContractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

  // get token metadata
  const setMetaData = async () => {
    tokenMetaData = await alchemy.core.getTokenMetadata(tokenContractAddress);
    console.log(tokenMetaData);
    tokenName = tokenMetaData.name;
    tokenSymbol = tokenMetaData.symbol;

    document.getElementById('tokenName').innerHTML = tokenName;
    document.getElementById('tokenSymbol').innerHTML = tokenSymbol;
    document.getElementById('tokenAddress').innerHTML = tokenContractAddress;
  }
  
  // Create the log options object
  let chainlinkTransferEvents = {
  address: tokenContractAddress,
  topics: [transferTopic],
  };

  const updateTokenContractAddress = () => {
    console.log("entered");
    // set address
    tokenContractAddress = document.getElementById('newContract').value;

    // reset
    labels = [];
    dataset = Array(10).fill(0); // initalize 10 datapoints with 0 

    // set token metadata
    setMetaData();

    // set listener
    chainlinkTransferEvents = {
      address: tokenContractAddress,
      topics: [transferTopic],
    };

    //re-run main
    main();
    console.log(tokenContractAddress);
  }

  let btn = document.getElementById("btn");
  btn.addEventListener('click', event => {
      updateTokenContractAddress(); 
  });

  const update = (block) => {
      console.log('block:', block);
      // update arrays
      index = labels.indexOf(block);
      console.log('index', index);
      if (labels.length == 10) {
          if (index != -1) {
              dataset[index] += 1;
          } else {
              // index doesn't exist make space for new block
              labels.shift();
              dataset.shift();

              // push new block
              labels.push(block);
              dataset.push(1);
          }
      } else {
          // add 10 elements
          // if already existing block increment
          if (index != -1) {
              dataset[index]++;
          } else {
              // if new block increment
              labels.push(block);
              // get new index of curr block
              index = labels.indexOf(block);
              dataset[index] +=1; 
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
      updateChart();

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
      updateChart();

  }

  function updateChart() {
      data.labels = labels;
      data.datasets[0].data = dataset;

      myChart.update();
  }

function main() {
    //set
    setMetaData();

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
}

main();