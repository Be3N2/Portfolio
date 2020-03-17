const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile('public/index.html');
});

app.post('/test', (request, response) => {
	console.log('request body', request.body);
	response.sendStatus(200);
});
var urlencodedParser = bodyParser.urlencoded({ extended: true })

// POST /login gets urlencoded bodies
app.post('/form', urlencodedParser, function (request, response) {
 if(request.body) { 
	console.log(request.body);
	for (var prop in request.body) {
 	 console.log(request.body[prop]);
	}
}
 if(request.query) console.log('request query' + request.query);
  response.sendStatus(200);
});


app.post('/formData', upload.none(),(request, response)=> {
	const formData = request.body;
	if (formData.book1) {
		console.log("book1", book1);
	} else {
		console.log("Empty formdata obj no book1");
	}
	console.log('form data', formData);
	response.sendStatus(200);
});

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
