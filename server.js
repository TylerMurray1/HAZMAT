const express = require('express');
var bodyParser = require("body-parser");
var jsrender = require('jsrender');
const app = express();
const port = 3000;

var idArray = ['123','321','111','222'];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile('/Users/TylerGentile/Documents/GitHub/HAZMAT/index.html'))

app.get('/sensor_calculation', function (req, res) {
  var tmpl = jsrender.templates('./sensor_calculation.html');
  var html = tmpl.render({weight: "11", rfid_tag: "1234567"});
  res.send(html);
})

app.post('/', function (req, res) {
  if (idArray.includes(req.body.id_value)) {
    res.redirect('http://localhost:3000/sensor_calculation');
  }
  else {
	  //retry login
	  res.sendFile('/Users/TylerGentile/Documents/GitHub/HAZMAT/index2.html');
  }

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
