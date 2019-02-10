var http = require('http');
var fs = require('fs');
var xmldom = require('xmldom');
var csv = require('csv-parse');
var opn = require('opn');

const data = fs.readFileSync('./data/test.xml');
const csvdata = fs.readFileSync('./data/201830-Subject_Course Timetables - ttbl0010.csv');

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
async function readData(input) {
	return new Promise ((resolve, reject) => {
		// file should be typed instead of hardcoded?
		// should say file cant be find in data folder (if not found)
		 csv(csvdata, {trim: true, skip_empty_lines: false, from_line: 1})
		.on('readable', function() {
			let data;
			let parsedData = []
			while (data = this.read()) {
				// should be case insensitive

				if (data[1].split(" ")[0] == input && data[0] =="Active") {
					 parsedData.push(data)
				}
				else{
					// console.log(data[1].split(" ")[0])
				}
			}
			//if parsedData is empty, send error message
			resolve(parsedData)
		}).on('end', function() {
		})
	})
}

async function createXML(dataArr) {
    var xmlFile = fs.readFileSync('./data/test.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(xmlFile.toString(), 'text/xml');
    var root = xmldoc.documentElement;
    for(var z = 0; z < root.childNodes.length; z++){
        root.removeChild(root.childNodes[z].nodeName)
    }
    for(var i = 0; i <dataArr.length; i++){
    	var block = xmldoc.createElement("CLASS");
        var crn   = xmldoc.createElement("CRN");
        var course =  xmldoc.createElement("COURSE")
        var type = xmldoc.createElement("TYPE");
        var day = xmldoc.createElement("DAY");
        var beginTime = xmldoc.createElement("BEGIN_TIME");
        var endTime = xmldoc.createElement("END_TIME");
        var instructor = xmldoc.createElement("INSTRUCTOR");
        var bldRoom = xmldoc.createElement("BLDG_ROOM");
        var startDate = xmldoc.createElement("START_DATE");
        var endDate = xmldoc.createElement("END_DATE");
        var max = xmldoc.createElement("MAX.");
        var act = xmldoc.createElement("ACT.");
        var hrs = xmldoc.createElement("HRS");
        var spacer =  xmldoc.createTextNode("\n")

        block.setAttribute("BLOCK",dataArr[i][1]);
        crn.textContent = dataArr[i][2];
        course.textContent = dataArr[i][3];
        type.textContent = dataArr[i][4];
        day.textContent = dataArr[i][5];
        beginTime.textContent = dataArr[i][6];
        endTime.textContent = dataArr[i][7];
        instructor.textContent = dataArr[i][8];
        bldRoom.textContent = dataArr[i][9];
        startDate.textContent = dataArr[i][10];
        endDate.textContent = dataArr[i][11];
        max.textContent = dataArr[i][12];
        act.textContent = dataArr[i][13];
        hrs.textContent = dataArr[i][14];

        block.appendChild(crn);
        block.appendChild(course);
        block.appendChild(type);
        block.appendChild(day);
        block.appendChild(beginTime);
        block.appendChild(endTime);
        block.appendChild(instructor);
        block.appendChild(bldRoom);
        block.appendChild(startDate);
        block.appendChild(endDate);
        block.appendChild(max);
        block.appendChild(act);
        block.appendChild(hrs);

		root.appendChild(block);
        root.appendChild(spacer);

	}
    fs.writeFileSync('./data/test.xml',root);
}

function formatData(){
    var data = fs.readFileSync('./data/test.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(data.toString(), 'text/xml');
    var root = xmldoc.documentElement;

    var classesType ='<h1>'+ root.getAttribute("BLOCK") +'</h1>';
    var x = root.childNodes;
    var classDates = [];
    for(var i = 0;  i < x.length; i++){
        if(x[i].nodeName=="CLASS"){
            classDates.indexOf(x[i].getAttribute("BLOCK")) === -1?  classDates.push(x[i].getAttribute("BLOCK")):""
        }
    }

    for(var a = 0; a < classDates.length; a++) {
        classesType+= '<h2>'+ classDates[a]+"</h2>";
        classesType+='<ul>'
        for (var z = 0; z < x.length; z++) {
            if (x[z].nodeName == "CLASS") {
                if(x[z].getAttribute("BLOCK") == classDates[a]){

                    var kidNodes = x[z].childNodes;
                    classesType+=' <li>'
                    for(var p = 0;  p < kidNodes.length;p++){
                        classesType += kidNodes[p].nodeName + ": " + kidNodes[p].textContent+ ""
                    }
                    classesType+= "</li> ";
                }
            }
        classesType+='</ul>';

        }
    }
    return classesType

}
//
// getInput()
//     .then(input => {return readData(input)})
//     .then(data => {return createXML(data)})
//     .then(formatData())

http.createServer(function (req, res) {
    if (req.url != '/favicon.ico') {
        getInput()
            .then(input => {return readData(input)})
            .then(data => {return createXML(data)})
            .then(() => {
                formatData()
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(formatData());
                res.end();
            })
    }
}).listen(8080); //the server object listens on port 8080

