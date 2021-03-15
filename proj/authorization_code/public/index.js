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
	}

	var playlistId = ''; // user input
	var playlist = null; // a basic object returned by the GET playlist function

	// TIL to prefer event listeners over onclick: https://stackoverflow.com/a/17378538/5996491 & https://stackoverflow.com/a/12627478/5996491
	document
		.getElementById('get-playlist')
		.addEventListener('click', function () {
			playlistId = document.getElementById('userPlaylistIdInput').value;

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
	document
		.getElementById('create-tracks')
		.addEventListener('click', function () {
			playlistTracks = []; // clear any previously filled tracks
			playlistTracks = playlist.tracks.items;

			for (i = 0; i < playlistTracks.length; i++) {
				let item = playlistTracks[i];

				// create a 'Track' object from my custom class
				let myTrack = new Track(
					i,
					item.track.id,
					item.track.uri,
					item.track.name
				);

				// push the 'Track' object to my 'myPlaylistTracks' array
				myPlaylistTracks.push(myTrack);
			}
			console.log('updated myPlaylistTracks: ', myPlaylistTracks);
		});

	var playlistDanceabilityScores = [];

	document
		.getElementById('get-danceability-scores')
		.addEventListener('click', function () {
			// TODO: disable buttons until the info is available to make the interaction successful (preventing errors, e.g. if the user clicks the buttons out of order)
			playlistDanceabilityScores = getPlaylistTrackDanceabilityScores(
				myPlaylistTracks
			);
		});

	// get a list of playlist tracks, with their track IDs' danceability scores
	// declare oath token: https://developer.spotify.com/console/get-audio-features-several-tracks/
	// tell it which audio features to get...
	// and then once it gets the audio features, to add just the danceability score
	// of that one track to an array of playlist-track-danceability socres
	function getPlaylistTrackDanceabilityScores(tracks) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		let trackIds = tracks.map((track) => track.id);

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
		trackIds = trackIds.join(',');

		// https://api.jquery.com/jquery.ajax/
		$.ajax({
			// max 100 IDs
			url: 'https://api.spotify.com/v1/audio-features?ids=' + trackIds,
			headers: {
				Authorization: 'Bearer ' + access_token,
			},
			json: true,
		}).done(function (data) {
			// extract danceability scores from audio features
			playlistDanceabilityScores = data.audio_features.map(
				(data) => data.danceability
			);

			// https://gomakethings.com/the-array.shift-method-in-vanilla-js/
			let loopLength = playlistDanceabilityScores.length;
			for (i = 0; i < loopLength; i++) {
				myPlaylistTracks[
					i
				].danceabilityScore = playlistDanceabilityScores.shift();
			}

			console.log(
				'updated myPlaylistTracks with danceability scores! (✿◡‿◡)',
				myPlaylistTracks
			);
		});
	}

	// get danceability sine
	document
		.getElementById('get-danceability-sine')
		.addEventListener('click', function () {
			// https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
			let myTracksCopy = myPlaylistTracks.map((track) => track);

			// give '2' for number of arcs in the ideal sine wave
			let danceabilitySine = getDanceabilitySine(myTracksCopy, 2);

			// TODO: simplify (～￣(OO)￣)ブ should pass back reordered INDICES not reordered scores
			// so i don't have to deal with duplicate dance scores...

			// fill in new indices into myPlaylistTracks
			for (i = 0; i < danceabilitySine.length; i++) {
				// find the location of this dance value in amongst my array of track objects
				// https://www.digitalocean.com/community/tutorials/js-array-search-methods#bonus-filter
				let locations = myPlaylistTracks.filter(
					(track) => track.danceabilityScore == danceabilitySine[i]
				);

				for (j = 0; j < locations.length; j++) {
					let location = locations[j].originalIndex;

					// only update the newIndex if the track doesn't already have one
					// allows tracks with duplicate danceability scores to distribute properly across the best-fit sine
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
					if (
						myPlaylistTracks[location].newIndex == null &&
						myPlaylistTracks.find((track) => track.newIndex == i) ==
							undefined
					) {
						myPlaylistTracks[location].newIndex = i;
					}
				}
			}

			// sort myPlaylistTracks by newIndex, ascending
			// https://stackoverflow.com/a/1129270/5996491
			myPlaylistTracks.sort((a, b) =>
				a.newIndex > b.newIndex ? 1 : b.newIndex > a.newIndex ? -1 : 0
			);

			console.log(
				"sorted tracks by danceability scores' sine wave-best fit ~(≧▽≦)/~ ",
				myPlaylistTracks
			);
		});

	// order the given danceability scores to a sine wave,
	// where the sine wave has the given number of arcs
	function getDanceabilitySine(tracks, arcs) {
		let steps = tracks.length;

		// 'Functions that return multiple values' => https://www.javascripttutorial.net/es6/destructuring/
		let [sineInputs, idealSine] = getIdealSine(steps, arcs);

		// TODO: plot points on a graph for the user to see best fit

		let scoresByNewPlaylistOrder = getNewPlaylistOrderByIdealSine(
			idealSine,
			tracks
		);

		return scoresByNewPlaylistOrder;
	}

	// thanks to ARB for help with this bit!
	function getIdealSine(steps, arcs) {
		let start = (3 / 2) * Math.PI; // start here to start from 0
		let end = start + 2 * Math.PI * arcs; // end back at 0 after number of cycles

		sineInputs = linspace(start, end, steps); // steps-sized array from start to end

		let sineValue = sineWave(sineInputs); // sine wave (+1 for no negative values)
		let sineValueScaled = scaleSineWave(sineValue); // ensure all values are 0-1, to match spotify 0-1 danceability rating scale

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

	// thanks again to ARB for help with this one
	function getNewPlaylistOrderByIdealSine(idealPoints, tracks) {
		let errors = [];
		let reorderedScores = [];

		for (i = 0; i < idealPoints.length; i++) {
			for (j = 0; j < tracks.length; j++) {
				let difference = idealPoints[i] - tracks[j].danceabilityScore;

				let error = Math.abs(difference);
				error = roundToPlaces(error, 3);

				errors.push(error); // store error values
			}

			let closestFit = Math.min(...errors); // the best fit for the next point is the one with the lowest error value from the next plot point
			let closestFitErrorIndex = errors.indexOf(closestFit);
			let bestFitValue = tracks[closestFitErrorIndex].danceabilityScore;

			errors = []; // clear array of errors; choose only from remaining ideal points and scores
			reorderedScores.push(bestFitValue);
			tracks.splice(closestFitErrorIndex, 1); // remove track from options so there are no repeats
			// console.log('remaining tracks: ', tracks);
		}

		return reorderedScores;
	}

	// round to given number of decimal places
	// https://stackoverflow.com/a/48764436/5996491
	function roundToPlaces(num, places) {
		// prevent NaNs from smallllll numbers
		// https://stackoverflow.com/a/18719937/5996491
		let numFixed = num.toFixed(20);
		let numRounded = Math.round(numFixed + 'e' + places);
		let returnNum = Number(numRounded + 'e' + -places);
		return returnNum;
	}

	// get reordered playlist, based on sine wave-best fit

	document
		.getElementById('get-replaced-playlist')
		.addEventListener('click', function () {
			reorderPlaylistBySineWaveBestFit(myPlaylistTracks, 2);
		});

	// REPLACE (not REORDER, because we're giving URIs) given playlist with sine wave-best fit-ordered tracks
	// https://developer.spotify.com/documentation/web-api/reference/#endpoint-reorder-or-replace-playlists-tracks
	function reorderPlaylistBySineWaveBestFit(orderedScores) {
		let trackUrisCsv = trackUrisToCsv(orderedScores); // track URIs as a CSV list
		console.log(
			'ready to rumble with the REPLACE situation...',
			trackUrisCsv
		);

		$.ajax({
			// max 100 IDs
			// TODO: if more than 100 given, loop through/recall?
			url: 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks',
			headers: {
				Authorization: 'Bearer ' + access_token,
			},
			// https://stackoverflow.com/a/49598763/5996491
			type: 'PUT',
			contentType: 'application/json',
			// QUESTION: do I want to track the snapshot_id?
			// https://github.com/spotify/web-api/issues/360#issuecomment-262523889
			data: JSON.stringify({
				uris: trackUrisCsv,
				range_start: 0,
				insert_before: orderedScores.length,
				range_length: orderedScores.length,
			}),
			json: true,
		})
			.done(function () {
				// TODO: enable user-person to view the songs in the reordered playlist in the app (w/o having to open spotify)
				console.log('done reordering! check spootify.');
			})
			.fail(function (message) {
				console.log(
					"oops, that didn't work :/ you tried, though. here's the error: ",
					message
				);
			});
		return;
	}

	// returns given tracks as their uris in an array of strings
	function trackUrisToCsv(tracks) {
		let tracksCsv = [];

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
		for (track of tracks) {
			tracksCsv.push(track.uri);
		}

		return tracksCsv;
	}

	// TODO: what if we auto-DJ'd tracks, giving specific start/end times and blending them?

	// TODO: what if I added sensor data, like from an Apple Watch? could get biometrics like heart beat and intentionally hype / calm user-people
})();
