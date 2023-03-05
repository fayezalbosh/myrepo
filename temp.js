var http = require('http');
var url = require('url');
var fs = require('fs');
 //var mode='Normal';
//var mode='active';
var dt = require('./exported');
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  switch (q.pathname)
  {
    case '/':
            {

                res.writeHead(200, {'Content-Type': 'text/html'});  
                dt.send_home(res,dt.mode);
                return res.end();
            }
            //);
    break;
    case '/Idle':
                 res.write('Idle mode selected');
                 dt.mode='Permanent open'
                return res.end();           
    break;
    case '/active':
                 res.write('Active mode selected');
                 dt.mode='Normal';
                return res.end();           
    break;

    case '/task': 
                 res.write('Task mode selected');
                 dt.mode='task';
                return res.end();           
    break;
  }

}).listen(8081);