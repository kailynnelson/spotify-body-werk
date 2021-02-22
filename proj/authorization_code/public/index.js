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

	var oauthSource = document.getElementById('oauth-template').innerHTML,
		oauthTemplate = Handlebars.compile(oauthSource),
		oauthPlaceholder = document.getElementById('oauth');

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
			oauthPlaceholder.innerHTML = oauthTemplate({
				access_token: access_token,
				refresh_token: refresh_token,
			});

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

		document.getElementById('obtain-new-token').addEventListener(
			'click',
			function () {
				$.ajax({
					url: '/refresh_token',
					data: {
						refresh_token: refresh_token,
					},
				}).done(function (data) {
					access_token = data.access_token;
					oauthPlaceholder.innerHTML = oauthTemplate({
						access_token: access_token,
						refresh_token: refresh_token,
					});
				});
			},
			false
		);

		// get a list of tracks, with their playlist ID
		var playlistTracks = [];
		var playlistDanceabilityScores = [];

		document
			.getElementById('get-playlist')
			.addEventListener('click', function () {
				// give it the id of my 'body werk set u free' playlist
				var playlist_id = '3PoDunH7BeHQxWmRhDCOfC';
				// declare oath token: https://developer.spotify.com/console/get-playlist/
				$.ajax({
					url: 'https://api.spotify.com/v1/playlists/' + playlist_id,
					headers: {
						Authorization: 'Bearer ' + access_token,
					},
					json: true,
				}).done(function (data) {
					console.log('got playlist ╰(*°▽°*)╯ ', data);

					playlistTracks = data.tracks.items;
					// console.log('got playlist tracks? ', playlist_tracks);

					// TODO: this shouldn't be triggered with a button called 'Get playlist'; should add a button or clarify button text for interaction effect
					// prettier-ignore
					playlistDanceabilityScores = getPlaylistTrackDanceabilityScores(playlistTracks);

					playlistPlaceholder.innerHTML = playlistTemplate({
						playlist_id: playlist_id,
						playlist_name: data.name,
					});
				});
			});
	}

	// get danceability sine
	document
		.getElementById('get-danceability-sine')
		.addEventListener('click', function () {
			getDanceabilitySine(playlistDanceabilityScores, 2);
		});

	// get a list of playlist tracks, with their track IDs' danceability scores
	var playlist_tracks_danceability = [];

	function getPlaylistTrackDanceabilityScores(tracks) {
		// console.log(
		// 	'got tracks! starting dance score method... (´▽`ʃ♡ƪ) ',
		// 	tracks
		// );

		var trackIds = getPlaylistTracksIds(tracks);
		// console.log("got tracks' IDs (｡･∀･)ﾉﾞ ", trackIds);
		// https://api.jquery.com/jquery.ajax/
		// declare oath token: https://developer.spotify.com/console/get-audio-features-several-tracks/

		// tell it which audio features to get...
		// and then once it gets the audio features, to add just the danceability score
		// of that one track to an array of playlist-track-danceability socres

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
			console.log("got tracks' danceability scores! (✿◡‿◡)", playlistDanceabilityScores);
		});

		return;
	}

	function getPlaylistTracksIds(tracks) {
		// https://stackoverflow.com/a/46694321/5996491
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		// QUESTION: what's the difference between 'let' and 'var'?
		let trackIds = tracks.map((tracks) => tracks.track.id);
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
		trackIds = trackIds.join(',');
		return trackIds;
	}

	var sineInputs;
	var sineValue;
	var sineValueScaled;
	var idealSine = [];
	var danceabilitySine = [];

	// order the given danceability scores to a sine wave,
	// where the sine wave has the given number of arcs
	function getDanceabilitySine(scores, arcs) {
		let steps = scores.length;
		let [sineInputs, idealSine] = getIdealSine(steps, arcs);
		console.log('got sineInputs: ', sineInputs);
		console.log('got idealSine: ', idealSine);

		return danceabilitySine;
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
})();
