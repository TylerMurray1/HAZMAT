// IMPORTS AND VARIABLES
const express = require('express');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const CONFIG = require('./public/config.json');
const app = express();
var userObj = require('./public/users.json');
var adminObj = require('./public/admins.json');
var fs = require('fs');
var path = require('path');
var Web3 = require('web3');
var date = new Date();
var authenticated = false;
var timeleft = 5;
var fs = require('fs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/public")));

// VARIABLES FOR RFID SCANS
var dataStore = "";
var rfidTag = "";
var weight = "";
var badgeID = "";


//JSON OBJECT THAT IS TO BE PUSHED
var closetJSON = {
	Company:"UGA Capstone Team 48",
	Location:"145 Heatherwood Ln. Athens,Ga 30601",
	Items:  []
}

// HOME PAGE
app.get('/', function(req, res){
	authenticated = false;
	res.sendFile(CONFIG.userFilePath + 'HAZMAT/public/scanin.html');

});

app.get('/scanBadge', function(req, res) {

	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline');
	const port = new SerialPort('/dev/ttyACM0');
	const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

	parser.on('data', function() {
                badgeID = parser.buffer.toString('utf8');
                res.send("http://localhost:3000/transaction");
		port.close(function () {console.log('Serial Connection Port: Closed (After badge scan)');});

  	})
});

// SIGN IN WITH USER AND PASSWORD PAGE
app.get('/signin', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/signin.html');

});

// THE TRANSACTION TYPE PAGE
app.get('/transaction', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/transaction.html');

});

// REMOVING A CHEMICAL PAGE
app.get('/removeItem', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/removeItem.html');

});

//SCAN THE ITEM PAGE
app.get('/returnScan', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnScan.html');

});

app.get('/newItem', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/addItem.html');
});

// WEIGH THE ITEM PAGE
//app.get('/returnWeigh', (req, res) => {
//	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnWeigh.html');

//});

app.get('/scanReturnChemical', (req, res) => {
	//INITIALISE THE SERIAL CONNECTION
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const port = new SerialPort('/dev/ttyACM0');
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', function() {
	 dataStore = parser.buffer.toString('utf8');
         dataArray = dataStore.split(": ");
         rfidTag = dataArray[0];
         weight = dataArray[1];
	 port.close(function () {console.log('Serial Connection Port: Closed (After return scan)');});
	if (parseFloat(weight) != 0.0) {
	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	  var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName:"from datasheet",
                            ChemicalExpDate:"from datasheet",
                            MaxVolume:"from datasheet",
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"RETURN",
                            UserID:"from array",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: "do some division",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);
          Chemicals.storeJSONString(JSON.stringify(closetJSON));
	  console.log(JSON.stringify(closetJSON));

	  res.send("http://localhost:3000/return");

	} else {
	  res.send("http://localhost:3000/returnDispose");
	}

	});

});

app.get('/scanRemoveChemical', (req, res) => {
	//INITIALISE THE SERIAL CONNECTION
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const port = new SerialPort('/dev/ttyACM0');
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', function() {
          dataStore = parser.buffer.toString('utf8');
          dataArray = dataStore.split(": ");
          rfidTag = dataArray[0];
          weight = dataArray[1];
	  port.close(function () {console.log('Serial Connection Port: Closed (After removal scan)');});

	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	        var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName:"from datasheet",
                            ChemicalExpDate:"from datasheet",
                            MaxVolume:"from datasheet",
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"REMOVE",
                            UserID:"from array",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: "do some division",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);
          Chemicals.storeJSONString(JSON.stringify(closetJSON));
	  console.log(JSON.stringify(closetJSON));

	  res.send("http://localhost:3000/logout");

	});

});

app.post('/scanNewChemical', (req, res) => {
	//INITIALISE THE SERIAL CONNECTION
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const port = new SerialPort('/dev/ttyACM0');
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', function() {
          dataStore = parser.buffer.toString('utf8');
          dataArray = dataStore.split(": ");
          rfidTag = dataArray[0];
          weight = dataArray[1];
	        port.close(function () {console.log('Serial Connection Port: Closed (After removal scan)');});

	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	        var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName: req.body.name,
                            ChemicalExpDate:req.body.date,
                            MaxVolume:req.body.volume,
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"INIT",
                            UserID:"test",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: "100%",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);
          Chemicals.storeJSONString(JSON.stringify(closetJSON));
	  console.log(JSON.stringify(closetJSON));

	  res.send("http://localhost:3000/transaction");

	});

});

app.get('/return', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/return.html')
});

app.get('/returnDispose', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnDispose.html')

});

app.get('/logout', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html');
});

app.get('/dataSheets', function (req, res) {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/dataSheets.html');
})

app.get('/favicon.ico', (req, res) => {res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/favicon.ico')})

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
