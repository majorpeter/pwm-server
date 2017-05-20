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
var brightness = 100;
var last_update_time = 0;

setColor(0, 0, 0, true);

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
		var r = req.body.red;
		var g = req.body.green;
		var b = req.body.blue;
		console.log('Set color (' + r + ', ' + g + ', ' + b + ')');
		setColor(r, g, b);
		res.send({});
	} else if (req.body.cmd == 'setbrightness') {
		var b = req.body.b;
		console.log('Set brightness: ' + b);
		brightness = b;
		setColor(current_r, current_g, current_b, true);
		res.send({});
	} else if (req.body.cmd == 'status') {
		console.log('Status request');
		var status = 'off';
		if (current_r != 0 || current_g != 0 || current_b != 0) {
			status = 'on';
		}
		res.send({
			status: status,
			red: current_r,
			green: current_g,
			blue: current_b,
			brightness: brightness
		});
	} else if (req.body.cmd == 'default') {
		console.log('Default settings');
		setColor(255, 255, 255, true);
		res.send({});
	} else if (req.body.cmd == 'off') {
		console.log('Off called');
		setColor(0, 0, 0, true);
		res.send({});
	} else {
		console.log('Unsupported command: ' + req.body.cmd);
	}
});


var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("PWM server app listening at http://%s:%s", host, port);
});

function writePwmControllerCmd(command) {
	pwm_device.write(command + '\n');
}

function setColor(r, g, b, force = false) {
	var update_time = new Date().getTime();
	var delta = update_time - last_update_time;
	if (delta < 100) {
		return;	// avoid buffer overflow
	}
	last_update_time = update_time;

	if ((r != current_r) || force) {
		writePwmControllerCmd('SET /PWM.R=' + Math.floor(r * brightness / 100));
		current_r = r;
	}
	if ((g != current_g) || force) {
		writePwmControllerCmd('SET /PWM.G=' + Math.floor(g * brightness / 100));
		current_g = g;
	}
	if ((b != current_b) || force) {
		writePwmControllerCmd('SET /PWM.B=' + Math.floor(b * brightness / 100));
		current_b = b;
	}
}
