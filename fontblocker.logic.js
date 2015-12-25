fb = {

	REPLACEMENT: 'Arial',

	UNBLOCKABLE: [
		'Arial', // REPLACEMENT
		'monospace', 'serif', 'sans-serif', 'fantasy', 'cursive', // Generics
		'initial', 'inherit', 'unset', // CSS keywords
	],

	host: function(host, m) {
		if (m = host.match(/\/\/([^/]+)\//)) {
			host = m[1];
		}
		return host.replace(/^www\./, '');
	},

	equals: function(a, b) {
		return a.host == b.host && a.name == b.name;
	},

	fontNamesForHost: function(host, callback) {
		chrome.storage.sync.get('fonts', function(items) {
			if (!items.fonts) return callback([]);

			var fonts = [];
			for (var i=0; i<items.fonts.length; i++) {
				var font = items.fonts[i];
				if (font.host == '*' || font.host == host) {
					fonts.push(font.name);
				}
			}
			callback(fonts);
		});
	}

};
