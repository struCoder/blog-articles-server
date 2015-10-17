var http = require('http');
var serveStatic = require('serve-static');
var express = require('express');
var crypto = require('crypto');
var secret = require('./config').secret;
var log = require('util').log;

var app = express();
var port = 9002;


app.use(serveStatic('public/articles', {
  'index': ['index.html', 'index.htm']
}));


app.post('/release-new-version', function(req, res) {
  var bufferArr = [];
  var bufferLen = 0;
  req.on('data', function(chunk) {
    bufferArr.push(chunk);
    bufferLen += chunk.length;
  });

  req.on('end', function(chunk) {
    if (chunk) {
      bufferArr.push(chunk);
      bufferLen += chunk.length;
    }
    var data = Buffer.concat(bufferArr, bufferLen).toString();
    var sig = 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
    if (req.headers['x-hub-signature'] && sig === req.headers['x-hub-signature']) {
      log('github webhooks');
      var exec = require('child_process').exec
      exec('sh gen.sh', function(err, stdout, stderr) {
        if (err) {
          log('error:', err)
        } else {
          log('stdout: ', stdout);
          res.json({
            code: 0,
            msg: 'success update'
          });
        }
      });
    } else {
      res.statusCode = 403;
      res.json({
        code: 1000,
        msg: 'forbidden'
      });
    }
  })
});

// Create server
var server = http.createServer(app);

// Listen
server.listen(port, function() {
  console.log('server was running at: ', port);
});
