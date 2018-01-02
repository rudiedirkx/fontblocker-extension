fb = {

	REPLACEMENT: 'Arial',
	REPLACEMENTS: ['Arial', 'Verdana', 'Courier New', 'Consolas', 'Times New Roman', 'Georgia'],

	UNBLOCKABLE: [
		'Arial', // REPLACEMENT
		'monospace', 'serif', 'sans-serif', 'fantasy', 'cursive', // Generics
		'initial', 'inherit', 'unset', // CSS keywords
	],

	FONTS_PER_ITEM: 100,

	storage: chrome.storage.sync || chrome.storage.local,

	existsIn: function(font, list) {
		for (var i=0; i<list.length; i++) {
			if (fb.equals(font, list[i])) {
				return list[i];
			}
		}

		return false;
	},

	exists: function(font, callback) {
		fb.get(function(list) {
			callback(fb.existsIn(font, list), list);
		});
	},

	get: function(callback) {
		fb.storage.get('fonts', function(items) {
			var list = items.fonts || [];
			list.sort(function(a, b) {
				return b.added - a.added;
			});
			callback(list);
		});
	},

	add: function(font, callback) {
		font.added || (font.added = Date.now());

		fb.get(function(fonts) {
			fonts.unshift(font);
			fb.storage.set({fonts: fonts}, function() {
				callback && callback();
			});
		});
	},

	remove: function(font, callback) {
		fb.get(function(list) {
			var keep = [];
			for (var i = 0; i < list.length; i++) {
				if (!fb.equals(font, list[i])) {
					keep.push(list[i]);
				}
			}

			fb.storage.set({fonts: keep}, function() {
				callback && callback();
			});
		});
	},

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
		fb.get(function(list) {
			var fonts = [];
			var replacements = [];
			for (var i=0; i<list.length; i++) {
				var font = list[i];
				if (font.host == '*' || font.host == host) {
					fonts.push(font.name);
					replacements.push(font.replacement);
				}
			}
			callback(fonts, replacements);
		});
	}

};
