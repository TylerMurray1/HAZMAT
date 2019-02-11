//DO NOT MOVE THIS FROM THE ROOT DIRECTORY WITHOUT CONSULTING SAM
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

//TODO: I'd like to make this a dictionary that associates IDs with user names - Sam

var authenticated = false;
var timeleft = 5;

var dataStore = "";
var rfidTag = "";
var weight = "";


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "static")));

app.get('/', function(req, res){
    authenticated = false;
    res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/index.html')
  }
)
app.get('/logout', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html'))


app.get('/transaction', (req, res) => {
  res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/transaction.html')
})

app.get('/removeItem', (req, res) => {
  const SerialPort = require('serialport')
  const Readline = require('@serialport/parser-readline')
  const port = new SerialPort('/dev/cu.usbmodem14201')

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
	parser.on('data', function() {
    dataStore = parser.buffer.toString('utf8');
    dataArray = dataStore.split(": ");
    rfidTag = dataArray[0];
    weight = dataArray[1];
  });
  res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/removeItem.html')
})

app.get('/returnItem', (req, res) => {
  const SerialPort = require('serialport')
  const Readline = require('@serialport/parser-readline')
  const port = new SerialPort('/dev/cu.usbmodem14201')

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

  //////// ETHEREUM SECTION ////////
  //Temporary for blockchain connection trial
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    var eth = web3.eth;
    web3.eth.defaultAccount = web3.eth.accounts[0];
  }
  else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    var eth = web3.eth;
    web3.eth.defaultAccount = web3.eth.accounts[0];
    var abi = [ { "constant": true, "inputs": [], "name": "getBlock", "outputs": [ { "name": "", "type": "string", "value": "Hello" }, { "name": "", "type": "string", "value": "Hello" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0x2e97766d" }, { "constant": false, "inputs": [ { "name": "_weight", "type": "string" }, { "name": "_tagNum", "type": "string" } ], "name": "setBlock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0x63618964" } ];

    var chemicalsContract = web3.eth.contract(abi);

    var Chemicals = chemicalsContract.at('0x6619C8Fd8693C68FA268b7E6D38e1C9d263783f4');

    //example on how to call a smart contract function to push to the blockchain
    Chemicals.setBlock("Hello2", "Hello2");
    console.log(Chemicals.getBlock());


  }
  ///////////////////////////

	parser.on('data', function() {
    dataStore = parser.buffer.toString('utf8');
    dataArray = dataStore.split(": ");
    rfidTag = dataArray[0];
    weight = dataArray[1];
  });
  res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnItem.html')
})

app.get('/admin', (req, res) => {
  res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/admin.html')

});

app.get('/transaction', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/transaction.html'))
app.get('/removeItem', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/removeItem.html'))
app.get('/returnItem', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/returnItem.html'))
app.get('/admin', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/admin.html'))

app.get('/weigh', function (req, res) {

	var downloadTimer = setInterval(function() {
		var tmpl = jsrender.templates('./public/weigh.html');
		var html = tmpl.render({wait_time: (timeleft)});
		timeleft = timeleft - 1;
		res.redirect('http://localhost:3000/weigh');

		if(timeleft < 1) {
			res.redirect('http://localhost:3000/sensor_calculation');
			clearInterval(downloadTimer);
		}
	},1000);

})

app.get('/sensor_calculation', function (req, res) {
  if(!authenticated){
    res.redirect('http://localhost:3000/');
  }
  else{
  	var tmpl = jsrender.templates('./public/sensor_calculation.html');
  	var html = tmpl.render({weight: weight, rfid_tag: rfidTag});
  	res.send(html);


	// var tmpl = jsrender.templates('./public/sensor_calculation.html');
	// var html = tmpl.render({weight: "15", rfid_tag: "1234567"});
	// res.send(html);
  }
})

app.post('/', function (req, res) {
  //console.log(Object.values(userObj).indexOf(req.body.id_value))
  if((Object.values(userObj).indexOf(req.body.id_value) > -1 && Object.keys(userObj).indexOf(req.body.id_value) > -1 )
  || (Object.values(adminObj).indexOf(req.body.id_value) > -1 && Object.keys(adminObj).indexOf(req.body.id_value) > -1)){
    authenticated = true;
    if(Object.values(adminObj).indexOf(req.body.id_value) > -1){
      res.redirect('http://localhost:3000/admin');
    }
    else{
      res.redirect('http://localhost:3000/transaction');
    }
  }
  else {
	  //retry login
	  res.redirect('http://localhost:3000/');
  }

})

app.post('/saveJSON', (req, res) => {
  res.json({ ok: true });
  //
  fs.readFile('./public/users.json', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data);
    obj[Object.keys(req.body)[0]] = Object.values(req.body)[0]
    var json = JSON.stringify(obj);
    fs.writeFile('./public/users.json', json);
  }});
});

app.post('/deleteUserData', (req, res) => {
  res.json({ ok: true });

  fs.readFile('./public/users.json', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data);
    console.log(obj)
    delete obj[Object.keys(req.body)[0]]
    console.log(obj)
    var json = JSON.stringify(obj);
    fs.writeFile('./public/users.json', json);
  }
  });
});

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
