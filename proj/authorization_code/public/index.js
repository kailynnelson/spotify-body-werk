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

					getPlaylistTrackDanceabilityScores(playlist_tracks);

					playlistPlaceholder.innerHTML = playlistTemplate({
						playlist_id: playlist_id,
						playlist_name: data.name,
					});
				});
			});
	}

	// var playlist_tracks_danceability = [];

	function getPlaylistTrackDanceabilityScores(tracks) {
		console.log(
			'got tracks! starting dance score method... (´▽`ʃ♡ƪ) ',
			tracks
		);

		// TODO: get track features! https://developer.spotify.com/documentation/web-api/reference/#category-tracks

		return;
	}
})();
