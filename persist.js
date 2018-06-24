const path = require('path');
const fs = require('fs');

const DATA_PATH = './data/';
const DATA_SAVE_INTERVAL = 1 * 30 * 1000;
var lastDataSave = null;

if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, 0744);
}

function filenameForTime(time) {
    return time.toISOString().substring(0, 10) + '.dat';
}

function formatDataForFile(data, time) {
    return [time.toISOString(), data.t, data.h, data.f].join(',') + '\n';
}

function saveDataToFile(name, dataString, cb) {
	fs.open(DATA_PATH + name, 'a', (err, fd) => {
		if (err) throw err;
		fs.write(fd, dataString, (err) => {
			fs.close(fd, (err) => { 
				if (err) throw err; 
				cb && cb();
			});
			if (err) throw err;
		});
	});
}

function saveData(data) {
    var now = new Date();
    var elapsed = now.getTime() - lastDataSave;
    var isIntervalPassed = lastDataSave && elapsed >= DATA_SAVE_INTERVAL;
    if (isIntervalPassed || lastDataSave === null) {
        saveDataToFile(
			filenameForTime(now), 
			formatDataForFile(data, now), 
			() => lastDataSave = now.getTime()
		);
    }
}

function processHistoryData(from, to, data) {
	// time, temp, humidity, fan
	var out = [];
	if (data) {
		data.split('\n').forEach( x => {
			var row = x.split(',');
			// fan state is a string, '1' or '0', convert it to bool
			if (row[3]) { row[3] = {'0': false, '1': true}[row[3]]; }
			if (row.length >= 3) {
				if (new Date(row[0]) > from) {
					out.push(row);
				}
			}
		});
	}
	return out;
}

function getHistory(from, to) {
	var duration = to - from;
	var numDays = Math.floor(duration / ((1000*60*60*24)));
	if (duration === 0 || duration < 0) {
		throw new Error('persist.js - getHistory duration must be greater than 0');
	}
	if (numDays > 1) { 
		throw new Error('persist.js - getHistory duration must be less than 1 day'); 
	}
	var fromData = getHistoryFileForDay(from);
	var fromProcessed = processHistoryData(from, to, fromData);
	if (numDays === 1) {
		var toData = getHistoryFileForDay(to);
		var toProcessed = processHistoryData(from, to, toData);
		fromProcessed = fromProcessed.concat(toProcessed);
	}
	return fromProcessed;
}

function getHistoryFileForDay(day) {
	var file = DATA_PATH + filenameForTime(day);
    if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8');
    }
    return null;
}

module.exports = {
    save: saveData,
    getHistory: getHistory
}
