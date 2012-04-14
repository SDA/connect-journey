// Start a server.

// Server configuration.
var ip = process.env.IP || '127.0.0.1';
var port = process.env.PORT || 8080;

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
	.use(routetojourney(router))
	.use(function(req, res) {
		res.end('Hello World!');
	});

var server = http.createServer(app);
server.listen(port, ip);

// Test the server.

var assert = require('assert');
var request = require('request');
var seq = require('seq');

seq()
	.seq(function() {
		request({ uri: 'http://' + ip + ':' + port + '/', method: 'GET' }, this);
	})
	.seq(function(error, response) {
		if (!response) { response = error; error = null; }
		try {
			assert(response === 'Hello World!');
		}
		catch (e) {
			console.log(e);
		}

		request({ uri: 'http://' + ip + ':' + port + '/about', method: 'GET' }, this);
	})
	.seq(function(error, response, body) {
		if (!body) { body = response; response = error; error = null; }
		try {
			assert(response.statusCode === 200);
			assert(response.body === '{"name":"connect-journey"}');
		}
		catch (e) {
			console.log(e);
		}

		server.close();
	});
