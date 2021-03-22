// import {  } from 'bootstrap'; // import Bootstrap's bundle (all of Bootstrap's JS + Popper.js dependency)
// import 'handlebars'; // import Handlebars for templating
// import 'jquery'; // import jQuery for writing quicker JS

const Handlebars = require('handlebars');

var params = getHashParams();
/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
	var hashParams = {};
	var e,
		r = /([^&;=]+)=?([^&;]*)/g,
		q = window.location.hash.substring(1);
	while ((e = r.exec(q))) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}

var userProfileSource = document.getElementById('userProfileTemplate')
		.innerHTML,
	userProfileTemplate = Handlebars.compile(userProfileSource),
	userProfileContainer = document.getElementById('userProfile');

// TODO: bring back refresh token
var access_token = params.access_token,
	refresh_token = params.refresh_token,
	error = params.error;

if (error) {
	alert('There was an error during the authentication');
} else {
	if (access_token) {
		console.log('gettin jiggy widdit');

		$.ajax({
			url: 'https://api.spotify.com/v1/me',
			headers: {
				Authorization: 'Bearer ' + access_token,
			},
			success: function (response) {
				console.log('got user');
				userProfileContainer.innerHTML = userProfileTemplate(response);
				$('.loggedOut').hide();
				$('.loggedIn').show();
			},
		});
	} else {
		// render initial login screen
		$('.loggedOut').show();
		$('.loggedIn').hide();
	}
}
