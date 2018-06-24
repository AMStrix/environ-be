var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var persist = require('./persist.js');

var currentTemperature;
var currentHumidity;
var currentFanState;
var error;
var FAN_ON = 'a';
var FAN_OFF = 'b';

function turnFanOn(isOn) {
	var cmd = isOn ? FAN_ON : FAN_OFF;
	if (sp.isOpen) {
		console.log('turnFanOn', isOn, cmd);
		sp.write(cmd);
	}
}
//test
setTimeout(function() { turnFanOn(true); }, 2000);
setTimeout(function() { turnFanOn(false); }, 5 * 60 * 1000);

function cToF(c) {
	return Number((c * (9/5) + 32).toFixed(2));
}

var sp = new SerialPort('/dev/ttyACM0', {
	baudRate: 115200,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false
});

var parser = new Readline();

sp.pipe(parser);

sp.on('error', function(err) {
	console.log('sensor.js serial error: ', err.message);
	error = err.message;
});

parser.on('data', function(d) { 
	//console.log('data -->', d);
	try {
		var obj = JSON.parse(d);
		obj.t = cToF(obj.t);
		//console.log(obj);
		persist.save(obj);
		currentTemperature = obj.t;
		currentHumidity = obj.h;
		currentFanState = obj.f;
	} catch(err) {
		console.log('sensors.js error parsing serial data', err);
	}
});

module.exports = {
	getCurrentTemperature: function() { return currentTemperature; },
	getCurrentHumidity: function() { return currentHumidity; },
	getCurrentFanState: function() { return currentFanState; },
	getHistory: persist.getHistory
};
