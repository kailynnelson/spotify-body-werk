// https://www.freecodecamp.org/news/how-to-deploy-your-site-using-express-and-heroku/

// create an express app
const express = require('express');
const app = express();

// use the express-static middleware. serves static files (html, css, js) from the '/public' directory
app.use(express.static('public'));

// define the first URL route. responds to any URL requests to 'root'
app.get('/', function (request, response) {
	response.send('<h1>Hello World!</h1>');
});

// start the server listening for requests. either looks for port or defaults to 3000 when running locally
app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));
