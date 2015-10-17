var http = require('http');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var secret = require('./config').secret;
var log = require('util').log;

var app = express();
var port = 9002;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(serveStatic('public/articles', {'index': ['index.html', 'index.htm']}));
app.post('/release-new-version', function(req, res) {
  var body = req.body;
  if (typeof body.hook !== "object") {
    try {
      body.hook = JSON.parse(body.hook)
    } catch(e) {
      log(e);
      res.statusCode = 403;
      res.json({code: 1000, msg: 'forbidden'});
    }

  }
  log('body', body);
  if (body && body.hook && body.hook.config && body.hook.config.secret === secret) {
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
