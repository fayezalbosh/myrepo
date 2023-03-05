var http = require('http');
var url = require('url');
var fs = require('fs');
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  switch (q.pathname)
  {
    case '/':
            fs.readFile("C:\\airshower\\index.html", function(err, data) {
                if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                return res.end("404 Not Found");
                } 
                res.writeHead(200, {'Content-Type': 'text/html'});
                // res.writeHead(200, {'Content-Type': 'text/html'});    
                res.write(data);
                return res.end();
            });
    break;
    case '/Idle':
                //res.writeHead(200, {'Content-Type': 'text/html'});
                //res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'}); 
                 res.write('Idle mode selected');
                return res.end();           
    break;
    case '/active':
                //res.writeHead(200, {'Content-Type': 'text/html'});
                //res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'}); 
                 res.write('Active mode selected');
                return res.end();      
    case '/task':
                //res.writeHead(200, {'Content-Type': 'text/html'});
                //res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'}); 
                 res.write('Task mode selected');
                return res.end();                   
    break;
  }

}).listen(8081); 