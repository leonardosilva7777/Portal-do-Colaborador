var http = require('http');
var fs   = require('fs');
var path = require('path');

var DIR  = __dirname;
var PORT = 3000;

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.pdf':  'application/pdf'
};

http.createServer(function(req, res) {
  var raw = req.url.split('?')[0];
  var urlPath;
  try { urlPath = decodeURIComponent(raw); } catch(e) { urlPath = raw; }
  if (urlPath === '/') urlPath = '/index.html';

  var filePath = path.join(DIR, urlPath);
  // Security: ensure the resolved path stays inside DIR
  if (filePath.indexOf(DIR) !== 0) { res.writeHead(403); res.end('Forbidden'); return; }

  var ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, function(err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, function() {
  console.log('Portal Renova Be → http://localhost:' + PORT);
});
