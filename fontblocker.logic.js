const fb = {

	REPLACEMENT: 'Arial',
	REPLACEMENTS: ['Arial', 'Verdana', 'Courier New', 'Consolas', 'Times New Roman', 'Georgia'],

	UNBLOCKABLE: [
		'Arial', // REPLACEMENT
		'monospace', 'serif', 'sans-serif', 'fantasy', 'cursive', // Generics
		'initial', 'inherit', 'unset', // CSS keywords
	],

	CHUNK_BYTES: 7168,

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
		fb.storage.get(null, function(items) {
			var list = fb.unchunk(items);
			list.sort(function(a, b) {
				return b.added - a.added;
			});
			callback(list);
		});
	},

	save: function(fonts, callback) {
		var items = fb.chunk(fonts);
		fb.storage.set(items, function() {
			var error = chrome.runtime.lastError ? chrome.runtime.lastError.message : null;
			if (error) {
				callback && callback(error);
				return;
			}

			fb.removeStale(items.fontsChunks, function() {
				callback && callback(null);
			});
		});
	},

	chunk: function(fonts) {
		var encoder = new TextEncoder();
		var items = {fontsChunks: 0};
		var chunk = null;
		var bytes = 0;
		for (var i = 0; i < fonts.length; i++) {
			var json = JSON.stringify(fonts[i]);
			var fontBytes = encoder.encode(json).length + 1;
			if (!chunk || bytes + fontBytes > fb.CHUNK_BYTES) {
				var key = 'fonts' + items.fontsChunks;
				chunk = [];
				items[key] = chunk;
				items.fontsChunks++;
				bytes = key.length + 1;
			}
			chunk.push(fonts[i]);
			bytes += fontBytes;
		}

		return items;
	},

	unchunk: function(items) {
		if (items.fontsChunks == null) {
			return items.fonts || [];
		}

		var list = [];
		for (var i = 0; i < items.fontsChunks; i++) {
			var chunk = items['fonts' + i] || [];
			list = list.concat(chunk);
		}

		return list;
	},

	removeStale: function(chunks, callback) {
		fb.storage.get(null, function(items) {
			var stale = [];
			for (var key in items) {
				var match = key.match(/^fonts(\d*)$/);
				if (match && (match[1] === '' || Number(match[1]) >= chunks)) {
					stale.push(key);
				}
			}

			if (!stale.length) {
				callback();
				return;
			}

			fb.storage.remove(stale, callback);
		});
	},

	add: function(font, callback) {
		font.added || (font.added = Date.now());

		fb.get(function(fonts) {
			fonts.unshift(font);
			fb.save(fonts, callback);
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

			fb.save(keep, callback);
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
