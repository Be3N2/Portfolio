require('dotenv').config();

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const coreFunctions = require("./functions");
var fs = require('fs');
const readFile = require('fs').readFile;
var csvtojson = require("csvtojson");

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://"+ process.env.DB_USER + ":"+ process.env.DB_PASS +"@cluster0-fxflw.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
var db;

client.connect(err => {
	if(err) return console.error(err);

	db = client.db("simulatorData");

	const server = app.listen(8080, () => {
		const host = "localhost";
		const port = 8080;

		console.log(`Example app listening at http://localhost:8080`);
	});
});

app.use(express.static('public'));

app.get('/', (request, response) => {
 	response.sendFile('public/index.html');
});

app.post('/file-upload', upload.single('fileUpload'), (request, response) => {
	//response.send("Data upload disabled at this time");
	var fileupload = request.file;
	var id = request.body.idNum;
	var extension = fileupload.originalname.substr(fileupload.originalname.length - 4);
	if (fileupload.encoding === "7bit" && fileupload.mimetype === "application/octet-stream" && extension === ".csv") {
		csvtojson()
			.fromFile(request.file.path)
			.then((jsonObj)=>{
				//in a row format, needs combined to arrays...
				jsonObj = combine(jsonObj);
				
				var separatedData = coreFunctions.processData(jsonObj);
				
				for (var i = 0; i < separatedData.length; i++) {
					separatedData[i]["DecelData"] = coreFunctions.calcDecel(separatedData[i]["Speed"], separatedData[i]["Player PositionX"], separatedData[i]["Player PositionZ"]);
					separatedData[i]["SteeringData"] = coreFunctions.genCurvesAndError(separatedData[i]["Steering"]);
					separatedData[i]["LateralData"] = coreFunctions.lateralPosition(separatedData[i]["Player PositionX"],separatedData[i]["Player PositionZ"],separatedData[i]["CurrentNodeX"],separatedData[i]["CurrentNodeZ"],separatedData[i]["SteeringData"].start.length,separatedData[i]["Intersection"]);
					separatedData[i]["Participant ID"] = parseInt(id);
				}
				//response.send(separatedData);
				
				var collection = db.collection("data");
				var promise = collection.insertMany(separatedData);

				promise.then((result) => {
					console.log(`Successfully n items inserted: ${result.insertedCount}`)
					response.send("Success to view the results go to /display and look up ID");	
				})
				.catch((err) => {
					console.error(`Failed to insert item: ${err}`)
					response.send("Failed");
				});
				
			})

	}
});

app.get('/upload', (request, response) => {
	response.sendFile('public/upload.html', { root: __dirname});
});

app.get('/display', (request, response) => {
 	response.sendFile('public/display.html', { root: __dirname });
});

app.get('/lookup/',  (request, response) => {
	//jquery get requests send data in query

	const participantID = parseInt(request.query.ParticipantID);
	var collection = db.collection("data");
	collection.find({"Participant ID": participantID}).toArray(function(err, result) {
		if (err) throw err;
		response.send(result);
	});

});

function combine(json) {
	var returnObj = {
		"Fail Time": [],
		"Speed": [],
		"Brake": [],
		"Steering": [],
		"Player PositionX": [],
		"Player PositionZ": [],
		"Intersection": [],
		"Priority At Intersection": [],
		"Angle": [],
		"CurrentNodeX": [],
		"CurrentNodeZ": []
	}
	for (var i = 0; i < json.length; i++) {
		returnObj["Fail Time"].push(json[i]["Fail Time"]);
		returnObj["Speed"].push(json[i]["Speed"]);
		returnObj["Brake"].push(json[i]["Brake"]);
		returnObj["Steering"].push(json[i]["Steering"]);
		returnObj["Player PositionX"].push(json[i]["Player PositionX"]);
		returnObj["Player PositionZ"].push(json[i]["Player PositionZ"]);
		returnObj["Intersection"].push(json[i]["Intersection"]);
		returnObj["Priority At Intersection"].push(json[i]["Priority At Intersection"]);
		returnObj["Angle"].push(json[i]["Angle"]);
		returnObj["CurrentNodeX"].push(json[i]["CurrentNodeX"]);
		returnObj["CurrentNodeZ"].push(json[i]["CurrentNodeZ"]);
	}
	return returnObj;
}
