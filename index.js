console.log('Hello World, index.js initialized');

var express = require('express');
var app = express();

app.get('/', function (req, res) {
  //res.set('Content-Type', 'text/plain');
  res.send('Hello <strong>World</strong>!');
});

app.get('/article', function(req, res)  {
  console.log('Goodbye World');
  res.send('Added article thingy');
});

// GET /static/style.css etc.
app.use('/static', express.static(__dirname + '/public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
