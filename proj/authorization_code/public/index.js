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
		var playlist_tracks = [];

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

					playlist_tracks = data.tracks.items;
					// console.log('got playlist tracks? ', playlist_tracks);

					// TODO: this shouldn't be triggered with a button called 'Get playlist'; should add a button or clarify button text for interaction effect
					let playlistDanceabilityScores = getPlaylistTrackDanceabilityScores(
						playlist_tracks
					);

					getDanceabilityOrderedAsBimodalSine(playlistDanceabilityScores);

					playlistPlaceholder.innerHTML = playlistTemplate({
						playlist_id: playlist_id,
						playlist_name: data.name,
					});
				});
			});
	}

	// get a list of playlist tracks, with their track IDs' danceability scores
	var playlist_tracks_danceability = [];

	function getPlaylistTrackDanceabilityScores(tracks) {
		console.log(
			'got tracks! starting dance score method... (´▽`ʃ♡ƪ) ',
			tracks
		);

		var trackIds = getPlaylistTracksIds(tracks);
		console.log("got tracks' IDs (｡･∀･)ﾉﾞ ", trackIds);
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
			// extract danceability scores from audio features
			console.log("got tracks' audio features ...(*￣０￣)ノ ", data);
			playlist_tracks_danceability = data.audio_features.map(
				(data) => data.danceability
			);
			console.log(
				"got tracks' danceability scores! (✿◡‿◡)",
				playlist_tracks_danceability
			);
			// playlist_tracks = data.tracks.items;
			// console.log('got playlist tracks? ', playlist_tracks);
			// getPlaylistTrackDanceabilityScores(playlist_tracks);
			// playlistPlaceholder.innerHTML = playlistTemplate({
			// 	playlist_id: playlist_id,
			// 	playlist_name: data.name,
			// });
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

	var danceabilityOrderedAsBimodalSin = [];

	function getDanceabilityOrderedAsBimodalSine(danceabilityScores) {
		// create a movement that goes from 0 to 1 smoothly
		// https://www.smashingmagazine.com/2011/10/quick-look-math-animations-javascript/
		let counter = 0;
		let increase = (Math.PI * 2) / 100;
		for (i = 0; i <= 1; i += 0.01) {
			// TODO: fill x and y into array to compare and order the danceability scsores to match
			// https://stackoverflow.com/a/13304870/5996491
			x = i;
			console.log(x);
			y = Math.abs(Math.sin(counter));
			console.log(y);
			counter = +increase;
		}
		console.log('done with w/y bimodal 2pi function');
		// TODO: order danceability scores as bimodal sine
		danceabilityOrderedAsBimodalSine = danceabilityScores;
		console.log(
			'got danceability scores ordered as a bimodal sine wave (((o(*ﾟ▽ﾟ*)o)))',
			danceabilityOrderedAsBimodalSine
		);
		return danceabilityOrderedAsBimodalSine;
	}
})();
