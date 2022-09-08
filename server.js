// create an express app
const express = require('express')
const app = express()

app.get('/', function (req, res) {
  app.use(express.static('./public/tokenTransferVolume'))
  res.sendFile(__dirname + '/public/' + 'tokenTransferVolume/tokenTransferVolume.html')
})

app.get('/gas', function (req, res) {
  app.use(express.static('./public/Gas'))
  res.sendFile(__dirname + '/public/' + 'Gas/Gas.html')
})

/*
app.get('/1', function (req, res) {
  app.use(express.static('./public/baseFee'))
  res.sendFile( __dirname + "/public/" + "base/baseFee.html");
})

app.get('/2', function (req, res) {
  app.use(express.static('./public/ratioGas'))
  res.sendFile( __dirname + "/public/" + "ratioGas/ratioGas.html");
})

app.get("/9", function (req, res) {
  app.use(express.static("./public/Gas"));
  res.sendFile(__dirname + "/public/" + "Gas/Gas.html");
});
*/

// start the server listening for requests
app.listen(process.env.PORT || 5000)
