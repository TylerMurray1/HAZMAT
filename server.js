//DO NOT MOVE THIS FROM THE ROOT DIRECTORY WITHOUT CONSULTING SAM
const express = require('express');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const CONFIG = require('./public/config.json');
const app = express();
var userObj = require('./public/users.json');
var fs = require('fs')
var path = require('path');
var SerialPort = require('serialport');

//TODO: I'd like to make this a dictionary that associates IDs with user names - Sam

var authenticated = false;
var timeleft = 5;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "static")));

app.get('/', function(req, res){
    authenticated = false;
    res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/index.html')
  }
)
app.get('/logout', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html'))

app.get('/newUser', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/newUser.html'))

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
  }
})

app.post('/', function (req, res) {
  console.log(Object.values(userObj).indexOf(req.body.id_value))
  if(Object.values(userObj).indexOf(req.body.id_value) > -1){
    authenticated = true;
    res.redirect('http://localhost:3000/weigh');
  }
  else {
	  //retry login
	  res.redirect('http://localhost:3000/');
  }

})

app.post('/saveJSON', (req, res) => {
  res.json({ ok: true });
  fs.writeFile('./public/users.json', JSON.stringify(req.body), function(err, data){
    if (err) console.log(err);
  });
});

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
