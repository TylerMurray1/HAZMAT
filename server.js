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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "static")));

// VARIABLES FOR RFID SCANS
var dataStore = "";
var rfidTag = "";
var weight = "";
var badgeID = "";


//JSON OBJECT THAT IS TO BE PUSHED
var closetJSON = {
	Company:"UGA Capstone Team 48",
	Location:"145 Heatherwood Ln. Athens,Ga 30601",
	Items:  [{ChemicalName:"",
              ChemicalExpDate:"",
              MaxVolume:"",
              RFIDTagNumber:"",
              ChemicalVolume:"",
              TransactionType:"",
              UserID:"",
              IsEmpty:"",
              ChemicalPercentLeft:"",
              Date:""}
          ]
}

// HOME PAGE
app.get('/', function(req, res){
	authenticated = false;
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/scanin.html');

	const SerialPort = require('serialport');
  const Readline = require('@serialport/parser-readline');
  const port = new SerialPort('/dev/cu.usbmodem14201');
  const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
	parser.on('data', function() {
    badgeID = parser.buffer.toString('utf8');

		//TO-DO: CHECK BADGE ID ACCROSS A DATA STRUCTURE TO SEE IF IT IS VALID.
		if (badgeID == "VALID") {
			res.redirect('http://localhost:3000/transaction');
		}

  });

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

	//INITIALISE THE SERIAL CONNECTION
	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline');
	const port = new SerialPort('/dev/cu.usbmodem14201');
	const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
	parser.on('data', function() {
    dataStore = parser.buffer.toString('utf8');
    dataArray = dataStore.split(": ");
    rfidTag = dataArray[0];
    weight = dataArray[1];

		// STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
		if (typeof web3 !== 'undefined') {
	    web3 = new Web3(web3.currentProvider);
	    var eth = web3.eth;
	    web3.eth.defaultAccount = web3.eth.accounts[0];
	  }
	  else {
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

			closetJSON["Items"].append(jsonUpdate);
	    Chemicals.storeJSONString(closetJSON.stringify());

			res.redirect('http://localhost:3000/logout');

		}

	});

});

//SCAN THE ITEM PAGE
app.get('/returnScan', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnScan.html');

	//INITIALISE THE SERIAL CONNECTION
	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline');
	const port = new SerialPort('/dev/cu.usbmodem14201');
	const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
	parser.on('data', function() {
    dataStore = parser.buffer.toString('utf8');
    dataArray = dataStore.split(": ");
    rfidTag = dataArray[0];
    weight = dataArray[1];

		res.redirect('http://localhost:3000/returnWeigh');
	});

});

// WEIGH THE ITEM PAGE
app.get('/returnWeigh', (req, res) => {
	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnWeigh.html');

	//INITIALISE THE SERIAL CONNECTION
	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline');
	const port = new SerialPort('/dev/cu.usbmodem14201');
	const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
	parser.on('data', function() {
    dataStore = parser.buffer.toString('utf8');
    dataArray = dataStore.split(": ");
    rfidTag = dataArray[0];
    weight = dataArray[1];
		if (parseInt(weight) != 0) {

			// STARTING THE BLOCKCHIAIN CONNECTION VIA WEB3.JS
			if (typeof web3 !== 'undefined') {
		    web3 = new Web3(web3.currentProvider);
		    var eth = web3.eth;
		    web3.eth.defaultAccount = web3.eth.accounts[0];
		  }
		  else {
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

				closetJSON["Items"].append(jsonUpdate);
		    Chemicals.storeJSONString(closetJSON.stringify());

				res.redirect('http://localhost:3000/return');

			}

		}
		else {
			//TO-DO: REMOVE THE ELEMENT FROM THE JSON OBJECT
			res.redirect('http:localhost:3000/returnDispose');
		}

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

app.get('/datasheet_table', function (req, res) {
  if(!authenticated){
    res.redirect('http://localhost:3000/');
  }
  else{
  	var tmpl = jsrender.templates('./public/sensor_calculation.html');
  	var html = tmpl.render({weight: weight, rfid_tag: rfidTag});
  	res.send(html);

  }
})

// WE PROBABLY DON"T NEED WHAT IS COMMENTED BELOW
//////////////////////////////////////////
// app.post('/', function (req, res) {
//   var loginTag = null;
// 	parser.on('data', function() {
//     dataStore = parser.buffer.toString('utf8');
//     dataArray = dataStore.split(": ");
//     loginTag = dataArray[0];
//   });
//   //console.log(Object.values(userObj).indexOf(req.body.id_value))
//   if(loginTag != null){
//     authenticated = true;
//     if(Object.values(adminObj).indexOf(req.body.id_value) > -1){
//       res.redirect('http://localhost:3000/admin');
//     }
//     else{
//       res.redirect('http://localhost:3000/transaction');
//     }
//   }
//   else{
//     if((Object.values(userObj).indexOf(req.body.id_value) > -1 && Object.keys(userObj).indexOf(req.body.id_value) > -1 )
//     || (Object.values(adminObj).indexOf(req.body.id_value) > -1 && Object.keys(adminObj).indexOf(req.body.id_value) > -1)){
//       authenticated = true;
//       if(Object.values(adminObj).indexOf(req.body.id_value) > -1){
//         res.redirect('http://localhost:3000/admin');
//       }
//       else{
//         res.redirect('http://localhost:3000/transaction');
//       }
//     }
//     else {
//       //retry login
//       res.redirect('http://localhost:3000/');
//     }
//   }
// })
//
// app.post('/saveJSON', (req, res) => {
//   res.json({ ok: true });
//   //
//   fs.readFile('./public/users.json', function readFileCallback(err, data){
//     if (err){
//         console.log(err);
//     } else {
//     obj = JSON.parse(data);
//     obj[Object.keys(req.body)[0]] = Object.values(req.body)[0]
//     var json = JSON.stringify(obj);
//     fs.writeFile('./public/users.json', json);
//   }});
// });
//
// app.post('/deleteUserData', (req, res) => {
//   res.json({ ok: true });
//
//   fs.readFile('./public/users.json', function readFileCallback(err, data){
//     if (err){
//         console.log(err);
//     } else {
//     obj = JSON.parse(data);
//     console.log(obj)
//     delete obj[Object.keys(req.body)[0]]
//     console.log(obj)
//     var json = JSON.stringify(obj);
//     fs.writeFile('./public/users.json', json);
//   }
//   });
// });
//
// app.get('/admin', (req, res) => {
// 	res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/admin.html');
//
// });

app.get('/favicon.ico', (req, res) => {res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/favicon.ico')})

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
