// https://www.freecodecamp.org/news/how-to-deploy-your-site-using-express-and-heroku/
// https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow

// create an express app
var express = require('express');
var cookieParser = require('cookie-parser');
// var cors = require('cors');
var handlebars = require('handlebars');
var querystring = require('querystring');
var request = require('request'); // "Request" library

var app = express();

// use the express-static middleware. serves static files (html, css, js) from the '/public' directory
app.use(express.static(__dirname + '/public')).use(cookieParser()); // parse cookies in request object https://www.tutorialspoint.com/expressjs/expressjs_cookies.htm
// .use(cors()) // allow http requests https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

// define the first URL route. responds to any URL requests to 'root'
app.get('/', function (req, res) {
	res.send('<h1>Hello World!</h1>');
});

var client_id = '1234';
var client_secret = '1234';
var redirect_uri = 'http://localhost:3000/callback';

var stateKey = 'spotify_auth_state';

app.get('/login', function (req, res) {
	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// request authorization
	var scopes =
		'user-read-private user-read-email playlist-read-collaborative playlist-modify-public';

	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scopes,
				redirect_uri: redirect_uri,
				state: state,
			})
	);
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
	var text = '';
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

// request refresh and access tokens after checking the state parameter
app.get('/callback', function (req, res) {
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect(
			'/#' +
				querystring.stringify({
					error: 'state_mismatch',
				})
		);
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(client_id + ':' + client_secret).toString('base64'),
			},
			json: true,
		};

		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: {Authorization: 'Bearer ' + access_token},
					json: true,
				};

				// use the access token to access the Spotify Web API
				request.get(options, function (error, response, body) {
					console.log('printing request body', body);
				});

				// we can also pass the token to the browser to make requests from there
				res.redirect(
					'/#' +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token,
						})
				);
			} else {
				res.redirect(
					'/#' +
						querystring.stringify({
							error: 'invalid_token',
						})
				);
			}
		});
	}
});

// start the server listening for requests. either looks for port or defaults to 3000 when running locally
app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));
