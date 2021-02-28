(function () {
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

	var userProfileSource = document.getElementById('user-profile-template')
			.innerHTML,
		userProfileTemplate = Handlebars.compile(userProfileSource),
		userProfilePlaceholder = document.getElementById('user-profile');

	// var oauthSource = document.getElementById('oauth-template').innerHTML,
	// 	oauthTemplate = Handlebars.compile(oauthSource),
	// 	oauthPlaceholder = document.getElementById('oauth');

	var playlistSource = document.getElementById('playlist-template').innerHTML,
		playlistTemplate = Handlebars.compile(playlistSource),
		playlistPlaceholder = document.getElementById('playlist-profile');

	var params = getHashParams();

	var access_token = params.access_token,
		refresh_token = params.refresh_token,
		error = params.error;

	if (error) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {
			// render oauth info
			// oauthPlaceholder.innerHTML = oauthTemplate({
			// 	access_token: access_token,
			// 	refresh_token: refresh_token,
			// });

			$.ajax({
				url: 'https://api.spotify.com/v1/me',
				headers: {
					Authorization: 'Bearer ' + access_token,
				},
				success: function (response) {
					userProfilePlaceholder.innerHTML = userProfileTemplate(response);

					$('#login').hide();
					$('#loggedin').show();
				},
			});
		} else {
			// render initial screen
			$('#login').show();
			$('#loggedin').hide();
		}

		// document.getElementById('obtain-new-token').addEventListener(
		// 	'click',
		// 	function () {
		// 		$.ajax({
		// 			url: '/refresh_token',
		// 			data: {
		// 				refresh_token: refresh_token,
		// 			},
		// 		}).done(function (data) {
		// 			access_token = data.access_token;
		// 			oauthPlaceholder.innerHTML = oauthTemplate({
		// 				access_token: access_token,
		// 				refresh_token: refresh_token,
		// 			});
		// 		});
		// 	},
		// 	false
		// );

		// TODO: allow user to input any playlist ID
		var playlistId = '3PoDunH7BeHQxWmRhDCOfC'; // my 'body werk set u free' playlist

		// a basic object returned by the GET playlist function
		var playlist = null;

		// prettier-ignore
		document.getElementById('get-playlist').addEventListener('click', function () {
				// declare oath token: https://developer.spotify.com/console/get-playlist/
				$.ajax({
					url: 'https://api.spotify.com/v1/playlists/' + playlistId,
					headers: {
						Authorization: 'Bearer ' + access_token,
					},
					json: true,
				}).done(function (data) {
					console.log('got playlist ╰(*°▽°*)╯ ', data);
					playlist = data;

					playlistPlaceholder.innerHTML = playlistTemplate({
						playlist_id: playlistId,
						playlist_name: playlist.name,
					});
				});
			});
	}

	// get a list of tracks from a given playlist ID
	var playlistTracks = [];

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
	class Track {
		constructor(originalIndex, id, uri, name) {
			this.originalIndex = originalIndex;
			this.id = id;
			this.uri = uri;
			this.name = name;
		}
		danceabilityScore = null;
		newIndex = null;
	}

	// new list of playlist tracks with my custom Track objects
	var myPlaylistTracks = [];

	// create 'Track' objects (with my 'Track' class)
	// then fill a 'playlist' array with my 'Track' objects
	// prettier-ignore
	document.getElementById('create-tracks').addEventListener('click', function() {

		playlistTracks = playlist.tracks.items;
		// console.log('got playlistTracks: ', playlistTracks);

		for (i = 0; i < playlistTracks.length; i++) {
			let item = playlistTracks[i];

			// create a 'Track' object from my custom class 
			let myTrack = new Track(i, item.track.id, item.track.uri, item.track.name);
			// console.log('created myTrack: ', myTrack.name);

			// push the 'Track' object to my 'myPlaylistTracks' array 
			myPlaylistTracks.push(myTrack);
		}
		console.log('updated myPlaylistTracks: ', myPlaylistTracks);
	})

	// TODO: add function for getting dance scores
	var playlistDanceabilityScores = [];

	// prettier-ignore
	document.getElementById('get-danceability-scores').addEventListener('click', function() {
		// TODO: add error messages if the user clicks the buttons out of order 
		// TODO: or, even better: disable the buttons until the info is available to make the interaction successful! 
		playlistDanceabilityScores = getPlaylistTrackDanceabilityScores(playlistTracks);
	})

	// get a list of playlist tracks, with their track IDs' danceability scores
	// declare oath token: https://developer.spotify.com/console/get-audio-features-several-tracks/
	// tell it which audio features to get...
	// and then once it gets the audio features, to add just the danceability score
	// of that one track to an array of playlist-track-danceability socres
	function getPlaylistTrackDanceabilityScores(tracks) {
		// console.log(
		// 	'got tracks! starting dance score method... (´▽`ʃ♡ƪ) ',
		// 	tracks
		// );

		// TODO: fill myPlaylistTracks' danceability scores with getPlaylistTrackDanceabilityScores

		let trackIds = tracks.map((tracks) => tracks.track.id);
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
		trackIds = trackIds.join(',');

		console.log('got trackIds: ', trackIds);
		// console.log("got tracks' IDs (｡･∀･)ﾉﾞ ", trackIds);

		// https://api.jquery.com/jquery.ajax/
		$.ajax({
			// max 100 IDs
			url: 'https://api.spotify.com/v1/audio-features?ids=' + trackIds,
			headers: {
				Authorization: 'Bearer ' + access_token,
			},
			json: true,
		}).done(function (data) {
			// console.log("got tracks' audio features ...(*￣０￣)ノ ", data);
			// extract danceability scores from audio features
			playlistDanceabilityScores = data.audio_features.map(
				(data) => data.danceability
			);
			// prettier-ignore
			// console.log("got tracks' danceability scores! (✿◡‿◡)", playlistDanceabilityScores);
		});

		return;
	}

	// get danceability sine
	// prettier-ignore
	document.getElementById('get-danceability-sine').addEventListener('click', 
		function () {
			// give '2' for number of arcs in the ideal sine wave
			getDanceabilitySine(playlistDanceabilityScores, 2);
		}
	);

	var sineInputs;
	var sineValue;
	var sineValueScaled;
	var idealSine = [];
	var danceabilitySine = [];
	var newPlaylist = [];

	// order the given danceability scores to a sine wave,
	// where the sine wave has the given number of arcs
	function getDanceabilitySine(scores, arcs) {
		let steps = scores.length;

		// 'Functions that return multiple values' => https://www.javascripttutorial.net/es6/destructuring/
		let [sineInputs, idealSine] = getIdealSine(steps, arcs);
		// console.log('got sineInputs: ', sineInputs);
		// console.log('got idealSine: ', idealSine);

		// prettier-ignore
		let danceabilitySine = generateNewPlaylistByIdealSine(idealSine,playlistDanceabilityScores);
		// prettier-ignore
		console.log('got danceability scores by sine wave-best fit ~\(≧▽≦)/~ ', danceabilitySine);

		// TODO: realized some tracks came back with 'undefined' after making some changes to the playlist; should diagnose + repair

		// TODO: plot points on a graph? create a new playlist with the reorganized songs? the world is our oyster
		// return [steps, idealSine, danceabilitySine];
		return;
	}

	// thanks to ARB for help with this bit!
	function getIdealSine(steps, arcs) {
		let start = (3 / 2) * Math.PI; // start here to start from 0
		let end = start + 2 * Math.PI * arcs; // end back at 0 after number of cycles

		sineInputs = linspace(start, end, steps); // steps-sized array from start to end
		// console.log('got sineInputs: ', sineInputs);

		sineValue = sineWave(sineInputs); // sine wave (+1 for no negative values)
		// console.log('got sineValue: ', sineValue);

		sineValueScaled = scaleSineWave(sineValue); // ensure all values are 0-1, to match spotify 0-1 danceability rating scale
		// console.log('got sineValueScaled: ', sineValueScaled);

		return [sineInputs, sineValueScaled];
	}

	// replacement for numpy.linspace
	// https://stackoverflow.com/questions/40475155/does-javascript-have-a-method-that-returns-an-array-of-numbers-based-on-start-s
	function linspace(start, stop, steps) {
		// console.log('start linspace function with steps: ', steps);
		let arr = [];
		let step = (stop - start) / (steps - 1);
		for (i = 0; i < steps; i++) {
			arr.push(start + step * i);
		}
		return arr;
	}

	// calculate sine value for each point in the given array
	function sineWave(points) {
		let arr = [];
		for (i = 0; i < points.length; i++) {
			arr.push(Math.sin(points[i]) + 1);
		}
		return arr;
	}

	// calculate scaled sine value for each point in the given array,
	// to bring all values between 0-1
	function scaleSineWave(points) {
		let arr = [];
		for (i = 0; i < points.length; i++) {
			arr.push(points[i] / 2);
		}
		return arr;
	}

	// thanks again to arb for help with this one
	function generateNewPlaylistByIdealSine(idealPoints, scores) {
		let errors = [];
		let playlist = [];
		let copyScores = scores;

		for (i = 0; i < idealPoints.length; i++) {
			for (j = 0; j < copyScores.length; j++) {
				let difference = idealPoints[i] - copyScores[j];
				// prettier-ignore
				// console.log('got difference: ', idealPoints[i], ' - ', copyScores[i], ' = ', difference);
				let error = Math.abs(difference);
				error = roundToPlaces(error, 3);
				// console.log('got error: ', error);
				errors.push(error); // store error values
			}
			// console.log('got errors: ', errors);
			let closestFit = Math.min(...errors); // the best fit for the next point is the one with the lowest error value from the next plot point

			let closestFitErrorIndex = errors.indexOf(closestFit);
			let bestFitValue = copyScores[closestFitErrorIndex];

			// console.log('closestFit: ', closestFit);
			// console.log('closestFitErrorIndex: ', closestFitErrorIndex);
			// console.log('bestFitValue: ', bestFitValue);

			errors = []; // clear array of errors; choose only from remaining ideal points and scores
			playlist.push(bestFitValue);
			// console.log('playlist (so far): ', playlist);
			copyScores.splice(closestFitErrorIndex, 1); // remove song from options so there are no repeats
			// console.log('remaining copyScores: ', copyScores);
		}

		return playlist;
	}

	// round to given number of decimal places
	// https://stackoverflow.com/a/48764436/5996491
	function roundToPlaces(num, places) {
		let numRounded = Math.round(num + 'e' + places);
		return Number(numRounded + 'e' + -places);
	}

	// get reordered playlist, based on sine wave-best fit
	// prettier-ignore
	document.getElementById('get-replaced-playlist').addEventListener('click', 
		function () {
			reorderPlaylistBySineWaveBestFit(playlistDanceabilityScores, 2);
		}
	);

	// REPLACE (not REORDER, because we're giving URIs) given playlist with sine wave-best fit-ordered tracks
	// https://developer.spotify.com/documentation/web-api/reference/#endpoint-reorder-or-replace-playlists-tracks
	function reorderPlaylistBySineWaveBestFit(orderedScores) {
		let trackUrisCsv = trackUrisToCsv(orderedScores); // track URIs as a CSV list
		console.log('ready to rumble with the REPLACE situation...');

		// $.ajax({
		// 	// max 100 IDs
		// 	// TODO: if more than 100 given, loop through/recall?
		// 	url: 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks',
		// 	headers: {
		// 		Authorization: 'Bearer ' + access_token,
		// 	},
		// 	// https://stackoverflow.com/a/49598763/5996491
		// 	type: 'PUT',
		// 	contentType: 'application/json',
		// 	request: {
		// 		// QUESTION: do I want to track the snapshot_id?
		// 		uris: trackUrisCsv,
		// 		range_start: 0,
		// 		insert_before: orderedScores.length,
		// 		range_length: orderedScores.length,
		// 	},
		// 	json: true,
		// })
		// 	.done(function () {
		// 		// TODO: enable user-person to view the songs in the reordered playlist in the app (w/o having to open spotify)
		// 		console.log('done reordering! check spootify.');
		// 	})
		// 	.fail(function (message) {
		// 		console.log(
		// 			"oops, that didn't work :/ you tried, though. here's the error: ",
		// 			message
		// 		);
		// 	});
		return;
	}

	function trackUrisToCsv(tracks) {
		let tracksCsv = [];
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
		for (Track in tracks) {
			console.log('STARTING trackUrisToCsv, whoopee! ...');
			// TODO: compile track URIs to CSV
		}
		return tracksCsv;
	}

	// TODO: now we're gettin' crazy. WHAT IF we auto-DJ'd tracks, giving specific start/end times and blending them? would be tough, but SICK
	// TODO: ...what if I added sensor data, like from an Apple Watch? could get biometrics like heart beat and intentionally hype / calm user-people
})();
