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
var maxVolume = "";
var chemName = "";
var expDate = "";
var badgeID = "";


//JSON OBJECT THAT IS TO BE PUSHED
var closetJSON = {
	Company:"UGA Capstone Team 48",
	Location:"145 Heatherwood Ln. Athens,Ga 30601",
	Items:  []
}

var chemicalNameJSON = {
	"0001":"SA5W-20 OIL",
	"0002":"CRYSTAL SPRINGS WATER",
	"0003":"FROSTED FLAKES",
	"0004":"WHITE PAINT",
	"0005":"MINWAX POLYURETHANE",
	"0006":"LOCTICE SILICONE"
}

// HOME PAGE
app.get('/', function(req, res){
	authenticated = false;
	res.sendFile(CONFIG.userFilePath + 'HAZMAT/public/scanin.html');

});

// SPANISH HOME PAGE
app.get('/es/', function(req, res){
	authenticated = false;
	res.sendFile(CONFIG.userFilePath + 'HAZMAT/public/es/scaninES.html');

});

// GERMAN HOME PAGE
app.get('/de/', function(req, res){
	authenticated = false;
	res.sendFile(CONFIG.userFilePath + 'HAZMAT/public/de/scaninDE.html');

});

app.get('/scanBadge', function(req, res) {

	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline');
	const port = new SerialPort('/dev/ttyACM0');
	const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
	parser.on('data', data => {
                badgeID = data.split();
		if (badgeID[0] == "E") {
                  res.send("http://localhost:3000/transaction");
		  port.close(function () {console.log('Serial Connection Port: Closed (After badge scan)');});
		}
  	})
});

// SIGN IN WITH USER AND PASSWORD PAGE
app.get('/signin', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/signin.html');

});

// THE TRANSACTION TYPE PAGE
app.get('/transaction', (req, res) => {
	authenticated = true;
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/transaction.html');

});

// REMOVING A CHEMICAL PAGE
app.get('/removeItem', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/removeItem.html');
	} else {
		res.redirect('/scanBadge');
	}
});

//SCAN THE ITEM PAGE
app.get('/returnScan', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnScan.html');
	} else {
		res.redirect('/scanBadge');
	}
});

app.get('/newItem', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/addItem.html');
	} else {
		res.redirect('/');
	}
});

app.get('/scanReturnChemical', (req, res) => {
	//INITIALISE THE SERIAL CONNECTION
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const port = new SerialPort('/dev/ttyACM0');
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', data => {
	 dataStore = data;
         dataArray = dataStore.split(": ");
         rfidTag = dataArray[0];
         weight = dataArray[1];
	 chemName = chemicalNameJSON[dataArray[2]];
	 maxVolume = dataArray[3];
	 expDate = dataArray[4];
	 port.close(function () {console.log('Serial Connection Port: Closed (After return scan)');});
	 var percentLeft = (parseFloat(weight)/parseFloat(maxVolume) * 100).toFixed(2);

	if (percentLeft >= 100.00) {
		percentLeft = 100.00;
	}

	if (percentLeft > 3.0) {
	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	  var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName: chemName,
                            ChemicalExpDate: expDate,
                            MaxVolume: maxVolume,
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"RETURN",
                            UserID:"test",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: percentLeft.toString() + "%",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);

					let jsonData = fs.readFileSync('closetJSONFile.json');
			    let closetJSONFileData = JSON.parse(jsonData);
					closetJSONFileData.Items.push(jsonUpdate);
				  // put file write here
				  let writeData = closetJSONFileData;
				  fs.writeFileSync('closetJSONFile.json', JSON.stringify(writeData));

          Chemicals.storeJSONString(JSON.stringify(jsonUpdate));
	console.log("Serial Data: " + dataArray);
        console.log("Recent Transaction: " + JSON.stringify(jsonUpdate));
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
        parser.on('data', data => {
          dataStore = data;
          dataArray = dataStore.split(": ");
          rfidTag = dataArray[0];
          weight = dataArray[1];
	  chemName = chemicalNameJSON[dataArray[2]];
	  maxVolume = dataArray[3];
	  expDate = dataArray[4];
	  port.close(function () {console.log('Serial Connection Port: Closed (After removal scan)');});
	  var percentLeft = (parseFloat(weight)/parseFloat(maxVolume) * 100).toFixed(2);

          if (percentLeft >= 100.00) {
                  percentLeft = 100.00;
          }
	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	        var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName:chemName,
                            ChemicalExpDate: expDate,
                            MaxVolume: maxVolume,
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"REMOVE",
                            UserID:"from array",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: percentLeft.toString() + "%",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);

	  let jsonData = fs.readFileSync('closetJSONFile.json');
    let closetJSONFileData = JSON.parse(jsonData);
		closetJSONFileData.Items.push(jsonUpdate);
	  // put file write here
	  let writeData = closetJSONFileData;
	  fs.writeFileSync('closetJSONFile.json', JSON.stringify(writeData));

	  Chemicals.storeJSONString(JSON.stringify(jsonUpdate));
	console.log("Serial Data: " + dataArray);
        console.log("Recent Transaction: " + JSON.stringify(jsonUpdate));
	  res.send("http://localhost:3000/logout");

	});

});

app.get('/scanNewChemical', (req, res) => {
	//INITIALISE THE SERIAL CONNECTION
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const port = new SerialPort('/dev/ttyACM0');
        const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', data => {
          dataStore = data;
          dataArray = dataStore.split(": ");
          rfidTag = dataArray[0];
          weight = dataArray[1];
	  chemName = chemicalNameJSON[dataArray[2]];
          maxVolume = dataArray[3];
 	  expDate = dataArray[4];
          port.close(function () {console.log('Serial Connection Port: Closed (After removal scan)');});
	  var percentLeft = (parseFloat(weight)/parseFloat(maxVolume) * 100).toFixed(2);

          if (percentLeft >= 100.00) {
                  percentLeft = 100.00;
          }
	  // STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
          web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
          var eth = web3.eth;
          web3.eth.defaultAccount = web3.eth.accounts[0];
	  var abi = [ { "constant": false, "inputs": [ { "name": "_jsonObject", "type": "string" } ], "name": "storeJSONString", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0xaa245386" } ];
          var chemicalsContract = web3.eth.contract(abi);
          var Chemicals = chemicalsContract.at("0x3446c90511d16931Ff125851D2E8261110CB6E97");
          var jsonUpdate = {ChemicalName: chemName,
                            ChemicalExpDate: expDate,
                            MaxVolume: maxVolume,
                            RFIDTagNumber: rfidTag,
                            ChemicalVolume: weight,
                            TransactionType:"INIT",
                            UserID:"test",
                            IsEmpty:"FALSE",
                            ChemicalPercentLeft: percentLeft.toString() + "%",
                            Date: new Date(Date.now()).toLocaleString()}
          closetJSON["Items"].push(jsonUpdate);

					let jsonData = fs.readFileSync('closetJSONFile.json');
			    let closetJSONFileData = JSON.parse(jsonData);
					closetJSONFileData.Items.push(jsonUpdate);
				  // put file write here
				  let writeData = closetJSONFileData;
				  fs.writeFileSync('closetJSONFile.json', JSON.stringify(writeData));

          Chemicals.storeJSONString(JSON.stringify(jsonUpdate));
	  console.log("Serial Data: " + dataArray);
          console.log("Recent Transaction: " + JSON.stringify(jsonUpdate));
	  res.send("http://localhost:3000/transaction");

	});

});

app.get('/return', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/return.html');
	} else {
		res.redirect('/scanBadge');
        }
});

app.get('/returnDispose', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnDispose.html');
	} else {
		res.redirect('/scanBadge');
	}
});

app.get('/logout', (req, res) => {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html');
	} else {
		res.redirect('/scanBadge');
	}
});

app.get('/dataSheets', function (req, res) {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/dataSheets.html');
})

app.get('/closetOverview', function (req, res) {
	if (authenticated == true) {
		res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/closetOverview.html');
	} else {
		res.redirect('/scanBadge');
	}
})

app.get('/getClosetJSON', function (req, res) {
	let data = fs.readFileSync('closetJSONFile.json');
	let closetJSONFileData = JSON.parse(data);
	res.json(closetJSONFileData);
})

app.get('/favicon.ico', (req, res) => {res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/favicon.ico')})

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
