var http = require('http');
var fs = require('fs');
var xmldom = require('xmldom');
var csv = require('csv-parse');
var opn = require('opn');

const csvdata = fs.readFileSync('./201830-Subject_Course Timetables - ttbl0010.csv');

// asks user for input and returns it.
function getInput(question) {
	return new Promise (resolve => {
		const readline = require('readline').createInterface({
	  		input: process.stdin,
	  		output: process.stdout
		});
		readline.question(question, (input) => {
	  		readline.close()
	  		resolve(input)
		});
	})
}

// checks the working directory for the filename and returns it
function checkFileExists(filename) {
    return new Promise (resolve => {
        // './'+filename --- put this in instead of hardcoded on next line
        fs.access('./201830-Subject_Course Timetables - ttbl0010.csv', err => {
            if (err) {
                console.log('Could not find the file');
                process.exit()
            } else {
                resolve('201830-Subject_Course Timetables - ttbl0010.csv');
            }
        });
    });
}

async function createXML(dataArr) {
    var xmlFile = fs.readFileSync('./data/test.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(xmlFile.toString(), 'text/xml');
    xmldoc.getElementsByTagName('Schedule')[0].setAttribute('BLOCK', blockInput);
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
    console.log();
    fs.writeFileSync('./data/' + fileDate + '-' + blockInput + '.xml',root);
}

function formatData(){
    var data = fs.readFileSync('./data/' + fileDate + '-'+ blockInput +'.xml')
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
    fs.writeFileSync('./data/' + fileDate + '-' + blockInput + '.html',classesType);
}

async function readData() {
    return new Promise ((resolve, reject) => {
         csv(csvdata, {trim: true, skip_empty_lines: false, from_line: 1})
        .on('readable', function() {
            let data;
            let rawData = []

            // cleans each line of data before saving it
            while (data = this.read()) {
                for (i=0; i < data.length; i++) {
                    data[i] = data[i].replace('*', '');
                    data[i] = data[i].trimLeft();
                }
                rawData.push(data);
            } 

            if (rawData.length <= 0) {
                console.log('No results found for "' + blockInput + '"');
                process.exit();
            } else {
                resolve(rawData)
            }
        }).on('end', function() {
        })
    })
}

function getStudentData(rawData) {
    return new Promise (resolve => {
        var parsedData = []
        for (i=0; i<rawData.length; i++) {
            if (rawData[i][1].split(" ")[0] === blockInput && rawData[i][0] === "Active") {
                if (["Mon","Tue","Wed","Thu","Fri"].includes(rawData[i][5])) {
                    // console.log(rawData[i]);
                    parsedData.push(rawData[i]);
                }
            }
        }

        if (parsedData.length <= 0) {
            console.log('No Daytime classes found for "' + blockInput + '"');
            process.exit();
        } else {
            resolve(parsedData)
        }
    });
}

function getTeacherData() {
    readData()
    .then((rawData) => {
        teacherList = []
        for (i=0; i<rawData.length; i++) {
             if (rawData[i][1].split(" ")[0] === blockInput && rawData[i][0] === "Active") {
                if (!teacherList.includes(rawData[i][8]) && rawData[i][8] != ',') {
                    teacherList.push(rawData[i][8]);
                }
            }
        }

        teacherClasses = []
        for (i=0; i<rawData.length; i++) {
             if (teacherList.includes(rawData[i][8])) {
                teacherClasses.push(rawData[i]);
            }
        }
        console.log(teacherClasses);
    })
}

var fileName = ''
var fileDate = ''
var blockInput = ''

getInput('Enter the name of the file you want to use.\n')
    .then(filenameInput => {
        fileName = checkFileExists(filenameInput)
        fileDate = filenameInput.split("-")[0]
        return getInput('Enter the block you want to know ex(ACIT)\n')
    })
    .then((input) => {
        blockInput = input.toUpperCase()
        return readData()
    })
    .then((rawData) => {
        return getStudentData(rawData);
    })
    .then(studentData => {return createXML(studentData)})
    .then(() => {formatData()})
    .then(() => {getTeacherData()})