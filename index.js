require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = requre('body-parser');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.DB_USER + ":" process.env.DB_PASS + "@cluster0-fxflw.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true });

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile('public/index.html');
});

var urlencodedParser = bodyParser.urlencoded({extended: true});
app.post('/form', urlencodedParser, (request, response) => {
	if (request.body) {
		//console.log(request.body);
		for (var prop in request.body) {
			console.log(request.body[prop]);
		}
	}
	response.sendStatus(200);
});

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
