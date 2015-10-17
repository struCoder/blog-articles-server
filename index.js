var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
var port = 9002;
// Serve up public/ftp folder
var serve = serveStatic('public/articles', {'index': ['index.html', 'index.htm']})

// Create server
var server = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})

// Listen
server.listen(port, function() {
  console.log('server was running at: ', port);
});
