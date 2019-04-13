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

// checks the working directory for the filename and returns it.
function checkFileExists(filename) {
    return new Promise (resolve => {
        fs.access('./'+filename, err => {
            if (err) {
                console.log('Could not find the file');
                process.exit()
            } else {
                resolve(filename);
            }
        });
    });
}

// creates the students xml file.
async function createStudentXML(dataArr) {
    var xmlFile = fs.readFileSync('./data/test.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(xmlFile.toString(), 'text/xml');
    xmldoc.getElementsByTagName('Schedule')[0].setAttribute('program', blockInput);
    var rootxml = xmldoc.documentElement;
    for(var z = 0; z < rootxml.childNodes.length; z++){
        rootxml.removeChild(rootxml.childNodes[z].nodeName)
    }
    for(var i = 0; i <dataArr.length; i++){
        // creates xml elements
        var course =  xmldoc.createElement("class")
        var day = xmldoc.createElement("day");
        var beginTime = xmldoc.createElement("start_time");
        var endTime = xmldoc.createElement("end_time");
        var bldRoom = xmldoc.createElement("bldg_room");
        var instructor = xmldoc.createElement("instructor");

        // populates xml elements
        course.setAttribute('course',dataArr[i][3]);
        day.textContent = dataArr[i][5];
        beginTime.textContent = dataArr[i][6];
        endTime.textContent = dataArr[i][7];
        bldRoom.textContent = dataArr[i][9];
        instructor.textContent = dataArr[i][8];

        // adds xml elements under course
        course.appendChild(day);
        course.appendChild(beginTime);
        course.appendChild(endTime);
        course.appendChild(instructor);
        course.appendChild(bldRoom);

        // creates a section if it doesnt already exist (ex acit 1 a)
        section = rootxml.getElementsByTagName('section')
        var block;
        if(!section[0]) {
            block = xmldoc.createElement("section");
            block.setAttribute("block",dataArr[i][1]);
        }
        for (n=0; n<section.length; n++) {
            if(section[n].getAttribute('block') === dataArr[i][1]) {
                block = section[n];
            } else {
                block = xmldoc.createElement("section");
                block.setAttribute("block",dataArr[i][1]);
            }
        }

        block.appendChild(course);
		rootxml.appendChild(block);
	}
    fs.writeFileSync('./data/' + fileDate + '-' + blockInput + '-students' + '.xml',rootxml);
}

// creates the teachers xml file.
function createTeacherXML(dataArr) {
    return new Promise (resolve => {
        var xmlFile = fs.readFileSync('./data/test.xml')
        var parser = new xmldom.DOMParser();
        var xmldoc = parser.parseFromString(xmlFile.toString(), 'text/xml');
        xmldoc.getElementsByTagName('Schedule')[0].setAttribute('BLOCK', blockInput);
        var rootxml = xmldoc.documentElement;
        for(var z = 0; z < rootxml.childNodes.length; z++){
            rootxml.removeChild(rootxml.childNodes[z].nodeName)
        }

        for(var i = 0; i <dataArr.length; i++){
            var instructor = xmldoc.createElement("instrctor");
            var course =  xmldoc.createElement("class")
            var day = xmldoc.createElement("day");
            var beginTime = xmldoc.createElement("start_time");
            var endTime = xmldoc.createElement("end_time");
            var bldgRoom = xmldoc.createElement("bldg_room");

            instructor.setAttribute("name", dataArr[i][8]);
            course.setAttribute("course", dataArr[i][3]);
            day.textContent = dataArr[i][5];
            beginTime.textContent = dataArr[i][6];
            endTime.textContent = dataArr[i][7];
            bldgRoom.textContent = dataArr[i][9];

            course.appendChild(day);
            course.appendChild(beginTime);
            course.appendChild(endTime);
            course.appendChild(bldgRoom);

            // creates a instructor if it doesnt already exist
            // course = rootxml.getElementsByTagName('course')
            // var instructor;
            // if(!course[0]) {
            //     instructor = xmldoc.createElement("course");
            //     instructor.setAttribute("instructor",dataArr[i][1]);
            // }
            // for (n=0; n<course.length; n++) {
            //     if(course[n].getAttribute('instructor') === dataArr[i][1]) {
            //         instructor = course[n];
            //     } else {
            //         instructor = xmldoc.createElement("course");
            //         instructor.setAttribute("instructor",dataArr[i][1]);
            //     }
            // }

            instructor.appendChild(course);
            rootxml.appendChild(instructor);

        }
        fs.writeFileSync('./data/' + fileDate + '-' + blockInput + '-instructors' + '.xml',rootxml);
        resolve();
    })
}

// creates the students html file.
function createStudentHTML() {
    // loads the xml
    var data = fs.readFileSync('./data/' + fileDate + '-'+ blockInput + '-students' + '.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(data.toString(), 'text/xml');
    var rootxml = xmldoc.documentElement;

    var HTMLcode ='<h1>'+ rootxml.getAttribute("program") +'</h1>';
    var sections = rootxml.getElementsByTagName('section');

    for(i=0; i<sections.length; i++) {
        section = sections[i].getAttribute('block');
        HTMLcode += '<h2>' + section + '</h2>';

        var courses = sections[i].getElementsByTagName('class')
        for(n=0; n<courses.length; n++) {
            var course = courses[n].getAttribute('course');
            var day = courses[i].getElementsByTagName('day')
            var start_time = courses[i].getElementsByTagName('start_time')
            var end_time = courses[i].getElementsByTagName('end_time')
            var instructor = courses[i].getElementsByTagName('instructor')
            var bldg_room = courses[i].getElementsByTagName('bldg_room')

            HTMLcode += course + ' start: ' + start_time + ' end: ' + end_time + 
            ' instructor: ' + instructor + ' building room: ' + bldg_room + '<br>';
        }
    }
    fs.writeFileSync('./data/' + fileDate + '-' + blockInput + '-students' + '.html', HTMLcode);
}

// creates the teachers html file.
function createTeacherHTML(){
    var data = fs.readFileSync('./data/' + fileDate + '-'+ blockInput + '-instructors' + '.xml')
    var parser = new xmldom.DOMParser();
    var xmldoc = parser.parseFromString(data.toString(), 'text/xml');
    var root = xmldoc.documentElement;

    var classesType ='<h1>'+ root.getAttribute("BLOCK") +'</h1>';
    var x = root.childNodes;
    var classDates = [];

    for(var i = 0;  i < x.length; i++){
        // going through all of the class objects
        if(x[i].childNodes != null) {
            for (var z = 0; z < x[i].childNodes.length; z++) {
                if (x[i].childNodes[z].nodeName == "INSTRUCTOR") {
                    classDates.indexOf(x[i].childNodes[z].getAttribute("teacher")) === -1 ? classDates.push(x[i].childNodes[z].getAttribute("teacher")) : ""
                }
            }
        }


    }
    for(var a = 0; a < classDates.length; a++) {
        classesType+= '<h2>'+ classDates[a]+"</h2>";
        classesType+='<ul>'
        for (var z = 0; z < x.length; z++) {
            if(x[z].childNodes != null) {
                for (var f = 0; f < x[z].childNodes.length; f++) {
                    // console.log(x[z].childNodes[f].nodeName);
                    if (x[z].childNodes[f].nodeName == "INSTRUCTOR") {
                        if(x[z].childNodes[f].getAttribute("teacher") == classDates[a]){

                            var kidNodes = x[z].childNodes;
                            classesType+=' <li>'
                            for(var p = 0;  p < kidNodes.length;p++){
                                classesType += kidNodes[p].nodeName + ": " + kidNodes[p].textContent+ ""
                            }
                            classesType+= "</li> ";
                        }
                    }
                }
                classesType+='</ul>';
            }
        }
    }
    fs.writeFileSync('./data/' + fileDate + '-' + blockInput + "-instructors" +'.html',classesType);
}

// Reads a file and cleans it before returning it as an array.
async function readData() {
    return new Promise ((resolve, reject) => {
        let rawData = []
         csv(csvdata, {trim: true, skip_empty_lines: false, from_line: 1})
        .on('readable', function() {
            let data;


            while (data = this.read()) {
                for (i=0; i < data.length; i++) {
                    data[i] = data[i].replace('*', '');
                    data[i] = data[i].trimLeft();

                }
                rawData.push(data);
            } 
        }).on('end', function() {
            if (rawData.length <= 0) {
                console.log('No results found for "' + blockInput + '"');
                process.exit();
            } else {
                resolve(rawData)
            }
         })
    })
}

// returns the data that matches the inputed block (ex acit), whether its active,
// and if its mon - fri. if none match it stops the program.
function getStudentData(rawData) {
    return new Promise (resolve => {
        var checkedData = []
        for (i=0; i<rawData.length; i++) {
            if (rawData[i][1].split(" ")[0] === blockInput && rawData[i][0] === "Active") {
                if (["Mon","Tue","Wed","Thu","Fri"].includes(rawData[i][5])) {
                    checkedData.push(rawData[i]);
                }
            }
        }

        if (checkedData.length <= 0) {
            console.log('No Daytime classes found for "' + blockInput + '"');
            process.exit();
        } else {
            resolve(checkedData)
        }
    });
}

// loops through an array to find the teachers for a program then returns all courses those teachers teach.
function getTeacherData(rawData) {
    return new Promise (resolve => {
        let teacherList = []
        for (let i=0; i<rawData.length; i++) {
             if (rawData[i][1].split(" ")[0] === blockInput && rawData[i][0] === "Active") {
                if (!teacherList.includes(rawData[i][8]) && rawData[i][8] != ',') {
                    teacherList.push(rawData[i][8]);
                }
            }
        }

        let teacherClasses = []
        for (let i=0; i<rawData.length; i++) {
             if (teacherList.includes(rawData[i][8])) {
                teacherClasses.push(rawData[i]);
            }
        }
        resolve(teacherClasses)
    })
}

var fileName = '';
var fileDate = '201830';
var blockInput = '';

// remove comments on the lines labeled "<--this" to have the program
// ask for filename instead of being hardcoded.

// getInput('Enter the name of the file you want to use.\n')    <--this
//     .then(filenameInput => {                                 <--this
//         fileName = checkFileExists(filenameInput)            <--this
//         fileDate = filenameInput.split("-")[0]               <--this
//     })                                                       <--this
    // .then(() => {                                            <--this
        blockInput = process.argv[2];
        blockInput = blockInput.toUpperCase();
        return readData()
    // })                                                       <--this
    .then((rawData) => {
        return getStudentData(rawData);
    })
    .then(studentData => {
        return createStudentXML(studentData)
    })
    .then(() => {
        createStudentHTML()
    })
    .then(() =>{
        return readData()
    })
    .then((rawData) => {
        return getTeacherData(rawData)
    })
    .then((teacherData) =>{createTeacherXML(teacherData)})
    .then(() =>{
        createTeacherHTML()
    })