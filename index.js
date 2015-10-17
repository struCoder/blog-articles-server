var http = require('http');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var crypto = require('crypto');
var secret = require('./config').secret;
var log = require('util').log;

var app = express();
var port = 9002;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(serveStatic('public/articles', {'index': ['index.html', 'index.htm']}));
app.post('/release-new-version', function(req, res) {
  var body = req.body.payload;
  var sig = 'sha1=' + crypto.createHmac('sha1', secret).update(JSON.stringify(body)).digest('hex');
  if (req.headers['x-hub-signature'] && sig === req.headers['x-hub-signature']) {
    log('github webhooks', body);
    var exec = require('child_process').exec
    exec('sh gen.sh', function(err, stdout,stderr) {
      if (err) {
        log('error:', err)
      } else {
        log('stdout: ', stdout);
        res.json({code: 0, msg: 'success update'});
      }
    });
  } else {
    res.statusCode = 403;
    res.json({code: 1000, msg: 'forbidden'});
  }
});

// Create server
var server = http.createServer(app);

// Listen
server.listen(port, function() {
  console.log('server was running at: ', port);
});
