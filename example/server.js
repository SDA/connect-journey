var connect = require('connect');
var journey = require('journey');
var routetojourney = require('../lib/connect-journey.js');
var http = require('http');

var router = new(journey.Router)();
router.map(function() {
	this.get('/about').bind(function(req, res, data) {
		res.send(200, {}, { name: 'connect-journey' });
	});
});

var app = connect()
	.use(routetojourney(router, {log: true}))
	.use(function(req, res) {
		res.end('Hello World!');
	});

http.createServer(app).listen(8080);
