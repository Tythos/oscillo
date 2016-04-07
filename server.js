var http = require("http");
var fs = require("fs");

var hostIp = "127.0.0.1";
var portNumber = 1337;

http.createServer(function(req, res) {
	var filePath = __dirname + "/" + req.url;
	if (req.url == '/' || !fs.existsSync(filePath)) {
		filePath = __dirname + "/" + "main.html";
	}
	return fs.createReadStream(filePath).pipe(res);
}).listen(portNumber, hostIp);
console.log("Server running at " + hostIp + ":" + portNumber);
