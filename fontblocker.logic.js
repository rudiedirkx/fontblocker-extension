fb = {

	REPLACEMENT: 'Arial',

	UNBLOCKABLE: [
		'Arial', // REPLACEMENT
		'monospace', 'serif', 'sans-serif', 'fantasy', 'cursive', // Generics
		'initial', 'inherit', 'unset', // CSS keywords
	],

	host: function(host, m) {
		if ( m = host.match(/\/\/([^/]+)\//) ) {
			host = m[1];
		}

		return host.replace(/^www\./, '');
	},

	fontNamesForHost: function(host, callback) {
		chrome.storage.local.get('fonts', function(items) {
			var fonts = [];
			for (var i=0; i<items.fonts.length; i++) {
				var font = items.fonts[i];
				if (font.host == host) {
					fonts.push(font.name);
				}
			}
			callback(fonts);
		});
	}

};
