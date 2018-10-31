const express = require('express');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const CONFIG = require('../config.json')
const app = express();


var idArray = ['123','321','111','222'];
var authenticated = false;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
    authenticated = false;
    res.sendFile(CONFIG.userFilePath+'/HAZMAT/index.html')
  }
)
app.get('/logout', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/logout.html'))
app.get('/sensor_calculation', function (req, res) {
  if(!authenticated){
    res.redirect('http://localhost:3000/');
  }
  else{
    var tmpl = jsrender.templates('./sensor_calculation.html');
    var html = tmpl.render({weight: "11", rfid_tag: "1234567"});
    res.send(html);
  }
})

app.post('/', function (req, res) {
  if (idArray.includes(req.body.id_value)) {
    authenticated = true;
    res.redirect('http://localhost:3000/sensor_calculation');
  }
  else {
	  //retry login
	  res.redirect('http://localhost:3000/');
  }

})

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
