(function() {

	var url = require('url');

	function handler(router, opt) {
		// Default options.
		var defaults = {
			log: false
		}

		// Merge given options with defaults.
		var options = opt || defaults;
		for (prop in defaults) { 
			if (prop in options) { continue; }
			options[prop] = defaults[prop];
		}

		return function(req, res, next) {
			var body = "";

			// If we don't have a valid journey router then pass control to the next connect handler.
			if (options.log) console.log('\nIncoming request: ' + req.method + ' ' + req.url);
			if (!router || !router.resolve || !router.handle) {
				if (options.log) console.log('No router');
				if (options.log) console.log('Passing request to next handler in the connect chain');
				next();
				return;
			}

			// Convert URL string into object. Journey requires this.
			req.url = url.parse(req.url);

			// Resolve the request.
			router.resolve(req, body, function(err, resolved) {
				// Journey router gets first attempt at processing this request.
				if (!err && resolved) {
					req.addListener('data', function(chunk) {
						body += chunk;
					});
					req.addListener('end', function() {
						// Dispatch the request to the journey router.
						router.handle(req, body, function (result) {
							res.writeHead(result.status, result.headers);
							res.end(result.body);
							if (options.log) console.log('Response sent');
						});
					});

					// Request will be processed by the journey router on 'end' event.
					if (options.log) console.log('Will be processed by journey');
				}
				else {
					// Convert URL object back into a string. The next handler in the chain will require this.
					req.url = url.format(req.url);

					// Pass control to the next connect handler.
					if (options.log) console.log('Will NOT be processed by journey');
					if (options.log) console.log('Passing request to next handler in the connect chain');
					next();
				}
			});
		}
	}

	module.exports = handler;

})();
