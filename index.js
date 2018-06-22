var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;

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
	console.log('Error: ', err.message);
});

parser.on('data', console.log);
parser.on('data', function(d) {
	var obj = JSON.parse(d);
	console.log('T: ', obj.t);
});
