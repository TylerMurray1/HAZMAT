//DO NOT MOVE THIS FROM THE ROOT DIRECTORY WITHOUT CONSULTING SAM
const express = require('express');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const CONFIG = require('./public/config.json');
const app = express();
const gVars = require('./public/scripts/globalVars');
var fs = require('fs')

//TODO: I'd like to make this a dictionary that associates IDs with user names - Sam

var authenticated = false;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
    authenticated = false;
    res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/index.html')
  }
)
app.get('/logout', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/logout.html'))
app.get('/newUser', (req, res) => res.sendFile(CONFIG.userFilePath+'/HAZMAT/public/newUser.html'))
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
  if (gVars.idArray.includes(req.body.id_value)) {
    authenticated = true;
    res.redirect('http://localhost:3000/sensor_calculation');
  }
  else {
	  //retry login
	  res.redirect('http://localhost:3000/');
  }

})

app.post('/saveJSON', (req, res) => {

  console.log(typeof req.body);
  // TODO: save req.body as users.json
  res.json({ ok: true });
  fs.writeFile('./public/users.json', JSON.stringify(req.body), function(err, data){
    if (err) console.log(err);
    console.log("Successfully Written to File.");
});
});

app.listen(CONFIG.port, () => console.log(`Example app listening on port ${CONFIG.port}!`));
