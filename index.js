require('dotenv').config();

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.DB_USER + ":" process.env.DB_PASS + "@cluster0-fxflw.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true });

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile('public/index.html');
});

app.post('/formData', upload.any(),(request, response)=> {
	const formData = request.body;
	console.log('form data', formData);
	client.connect(err => {
	  const collection = client.db("test").collection("devices");
	  // perform actions on the collection object
	  client.close();
	});
	response.sendStatus(200);
});

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
