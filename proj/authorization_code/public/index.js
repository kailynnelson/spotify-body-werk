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

		document
			.getElementById('get-playlist')
			.addEventListener('click', function () {
				// give it the id of my 'body werk set u free' playlist
				var playlist_id = '3PoDunH7BeHQxWmRhDCOfC';
				// declare oath token: https://developer.spotify.com/console/get-playlist/
				var bearer_token =
					'BQBKkLdMWQa84Md6ds_QKYRjpErG1OOwxh1V73souKzQZlJxefKxPZBMyj_jV_q37NOx2rE35ldQ4EVbjnAk6C-xaNCdthIA-90A-vGws-3VhUWvsTJH40ZjNeO7F-PBzKORhAlt6i94kVJbddKQ7bWdKVIVGAX0';
				$.ajax({
					url: 'https://api.spotify.com/v1/playlists/' + playlist_id,
					headers: {
						Authorization: 'Bearer ' + bearer_token,
					},
					json: true,
				}).done(function (data) {
					console.log('got playlist ╰(*°▽°*)╯ ', data);
					playlistPlaceholder.innerHTML = playlistTemplate({
						playlist_id: playlist_id,
					});
				});
			});
	}
})();
