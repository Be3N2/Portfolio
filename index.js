const express = require('express');
const app = express();

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile('public/index.html');
});

app.get("/data", function (request, response) {
  response.send({"data": 10});
});

app.listen(3000, function() {
  console.log("server running on port 3000");
});


