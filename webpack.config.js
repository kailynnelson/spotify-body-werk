// https://webpack.js.org/guides/getting-started/

const path = require('path');

module.exports = {
	entry: './script.js',
	mode: 'development',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
	},
	target: 'node',
};
