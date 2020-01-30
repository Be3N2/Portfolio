const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile('public/index.html');
});

app.post('/postData', bodyParser.json(), (request, response) => {
	console.log("Received");
	response.send("Success");
});

app.post('/formData', upload.none(),(request, response)=> {
	const formData = request.body;
	console.log('form data', formData);
	response.sendStatus(200);
})

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
