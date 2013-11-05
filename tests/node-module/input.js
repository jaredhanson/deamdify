var http = require('http');
var server = http.createServer(function (req, res) {
  // respond to the request
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

module.exports = server;
