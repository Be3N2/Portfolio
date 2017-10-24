const express = require('express');
const app = express();
app.get('/', function (request, response) {
  res.send('WORKING')l
});

app.listen(3000, function() {
  console.log("server running on port 3000");
});
