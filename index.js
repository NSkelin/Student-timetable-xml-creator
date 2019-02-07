var http = require('http');
var fs = require('fs');
var xmldom = require('xmldom');
var csv = require('csv-parse');

data = fs.readFileSync('./data/test.xml');
csvdata = fs.readFileSync('./data/201830-Subject_Course Timetables - ttbl0010.csv');

// asks user for input and returns it.
function getInput() {
	return new Promise (resolve => {
		const readline = require('readline').createInterface({
	  		input: process.stdin,
	  		output: process.stdout
		});
		readline.question(`Enter the block you want to know\n`, (block) => {
	  		console.log(`You entered ${block}!`)
	  		readline.close()
	  		resolve(block)
		});
	})
}

function verifyInput(input) {
	if (input === 'hello') {
		return false
	} else {
		return true
	}
}

// reads a hardcoded file and saves the data that matches input
function readData(input) {
	return new Promise ((resolve, reject) => {
		// file should be typed instead of hardcoded?
		// should say file cant be find in data folder (if not found)
		csv(csvdata, {trim: true, skip_empty_lines: true, from_line: 2})
		.on('readable', function() {
			let data;
			let parsedData = []
			while (data = this.read()) {
				// should be case insensitive
				if (data[1] === input) {
					parsedData.push(data)
				}
			}
			//if parsedData is empty, send error message
			resolve(parsedData)
		}).on('end', function() {
		})
	})
}

getInput().then(input => {
	return readData(input)
}).then(data => {
	console.log(data.length);
})

// http.createServer(function (req, res) {
// 	res.write(result)
// 	res.end();
// }).listen(8080); //the server object listens on port 8080 

// Should check for valid input
// if the input isnt valid re-ask the question
// should ask again if input incorrect
// t = true
// while (t === true) {
// 	var input = getInput()
// 	if (verifyInput()) {
// 		t = false
// 	}
// }