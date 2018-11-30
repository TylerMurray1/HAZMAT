//DO NOT MOVE THIS FROM THE ROOT DIRECTORY WITHOUT CONSULTING SAM
const express = require('express');
const Blockchain = require('./blockchain/blockchain');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const CONFIG = require('./public/config.json');
const app = express();
var userObj = require('./public/users.json');
var adminObj = require('./public/admins.json');
var fs = require('fs')
var path = require('path');

//TODO: I'd like to make this a dictionary that associates IDs with user names - Sam

var authenticated = false;
var timeleft = 5;

var dataStore = "";
var rfidTag = "";
var weight = "";

const myChain = new Blockchain();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "static")));

app.get('/', function(req, res){
    authenticated = false;
    res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/index.html')
  }
)
app.get('/logout', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html'))

<<<<<<< HEAD
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
=======
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

>>>>>>> b0569a97d3d5c30f65fc9d5e9aef64c72c7b6002
})

app.get('/sensor_calculation', function (req, res) {
  if(!authenticated){
    res.redirect('http://localhost:3000/');
  }
  else{
<<<<<<< HEAD
    myChain.addBlock(dataStore);
    var fileContent = JSON.stringify(myChain);
    fs.appendFile("./blockchain/store.json", fileContent, (err) => {
      if (err) {
          console.error(err);
          return;
      };
    });
  	var tmpl = jsrender.templates('./public/sensor_calculation.html');
  	var html = tmpl.render({weight: weight, rfid_tag: rfidTag});
  	res.send(html);
=======

	//var Readline = SerialPort.parsers.Readline;
	//var parser = new Readline();
	//var port = new SerialPort('/dev/ttyAMA0', {
		//baudRate: 9600,
		//parser: parser,
	//});
	//port.on('readable', function () {
		//res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/sensor_calculation.html')
		//var tmpl = jsrender.templates('./public/sensor_calculation.html');
		//var html = tmpl.render({weight: port.read().decode(), rfid_tag: "1234567"});
		//res.send(html);
	//});
	var tmpl = jsrender.templates('./public/sensor_calculation.html');
	var html = tmpl.render({weight: "15", rfid_tag: "1234567"});
	res.send(html);
>>>>>>> b0569a97d3d5c30f65fc9d5e9aef64c72c7b6002
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
  //
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
  }});
});

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
