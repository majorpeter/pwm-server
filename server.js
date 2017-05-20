var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var fs = require("fs");
var tty = require("tty");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/static'));

const DEV_FILE = '/dev/ttyACM0';

var pwm_device = new tty.WriteStream(fs.openSync(DEV_FILE, "w"));
var current_r = 0;
var current_g = 0;
var current_b = 0;
var last_update_time = new Date().getTime();

app.get('/', function (req, res) {
   fs.readFile( __dirname + "/" + "index.html", 'utf8', function (err, data) {
       res.end( data );
   });
});

app.get('/index.html', function (req, res) {
   fs.readFile( __dirname + "/" + "index.html", 'utf8', function (err, data) {
       res.end( data );
   });
});

app.post('/rpc', function (req, res) {
	if (req.body.cmd == 'setcolor') {
		r = req.body.red;
		g = req.body.green;
		b = req.body.blue;
		console.log('Set color (' + r + ', ' + g + ', ' + b + ')');
		setColor(r, g, b);
	}
	res.send();
});


var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("PWM server app listening at http://%s:%s", host, port);
});

function writePwmControllerCmd(command) {
	pwm_device.write(command + '\n');
}

function setColor(r, g, b) {
	var update_time = new Date().getTime();
	var delta = update_time - last_update_time;
	if (delta < 100) {
		return;	// avoid buffer overflow
	}
	last_update_time = update_time;

	if (r != current_r) {
		writePwmControllerCmd('SET /PWM.R=' + r);
		current_r = r;
	}
	if (g != current_g) {
		writePwmControllerCmd('SET /PWM.G=' + g);
		current_g = g;
	}
	if (b != current_b) {
		writePwmControllerCmd('SET /PWM.B=' + b);
		current_b = b;
	}
}
