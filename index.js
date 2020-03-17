require('dotenv').config();

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();
const coreFunctions = require("./functions");

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

//going to be the fileupload 
app.get('/test', (request, response) => {
	//response.send("Route Currently Deactivatd");
	
	var separatedData = coreFunctions.processData(test);
	//response.send(separatedData);
	for (var i = 0; i < separatedData.length; i++) {
		separatedData[i]["DecelData"] = coreFunctions.calcDecel(separatedData[i]["Speed"], separatedData[i]["Player PositionX"], separatedData[i]["Player PositionZ"]);
		separatedData[i]["SteeringData"] = coreFunctions.genCurvesAndError(separatedData[i]["Steering"]);
		separatedData[i]["LateralData"] = coreFunctions.lateralPosition(separatedData[i]["Player PositionX"],separatedData[i]["Player PositionZ"],separatedData[i]["Current/Next-Node-Pos-X"],separatedData[i]["Current/Next-Node-Pos-Z"],separatedData[i]["SteeringData"].start.length,separatedData[i]["Intersection"]);
		separatedData[i]["Participant ID"] = 1;
	}

	//response.send(separatedData);

	
	var collection = db.collection("data");
	var promise = collection.insertMany(separatedData);

	promise.then((result) => {
		console.log(`Successfully n items inserted: ${result.insertedCount}`)
		response.send("Success");	
	})
	.catch((err) => {
		console.error(`Failed to insert item: ${err}`)
		response.send("Failed");
	});
	
});

app.post('/file-upload', upload.single('fileUpload'), (request, response) => {
  console.log(request.file.encoding);
  var sizeObj = {"name": request.file.originalname, "size": request.file.size};
  response.send(sizeObj);
  // req.body will hold the text fields, if there were any 
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

function validate(fileupload) {
	console.log(fileupload.encoding);

}