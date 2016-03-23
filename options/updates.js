
updates = [

	/**
	 * Stubb
	 */

	function(next) {
		next();
	},

	/**
	 * Convert from ['Font name'] to {"Font name": {...}}
	 */

	function(next) {
		chrome.storage.local.get('fonts', function(items) {
			var fonts = items.fonts || [];
			var newFonts = {};
			fonts.forEach(function(font) {
				newFonts[font] = {
					name: font,
					added: 0,
					website: '',
				};
			});

			chrome.storage.local.set({fonts: newFonts}, function() {
				next();
			});
		});
	},

	/**
	 * Convert from {"Font name": {...}} to [{"name": "Font name"}]
	 */

	function(next) {
		chrome.storage.local.get('fonts', function(items) {
			var fonts = items.fonts || {};
			var list = [];
			for ( var name in fonts ) {
				var font = fonts[name];
				if ( font.website ) {
					var host = fb.host(font.website);
					if ( host ) {
						list.push({
							name: name,
							host: host,
							added: font.added || 0,
						});
					}
				}
			}

			chrome.storage.local.set({fonts: list}, function() {
				next();
			});
		});
	},

	/**
	 * Order by `Blocked on` DESC, which is default
	 */

	function(next) {
		chrome.storage.local.get('fonts', function(items) {
			var fonts = items.fonts || [];
			fonts.sort(function(a, b) {
				return (b.added || 0) - (a.added || 0);
			});

			chrome.storage.local.set({fonts: fonts}, function() {
				next();
			});
		});
	},

	/**
	 * Move to sync storage
	 */

	function(next) {
		chrome.storage.local.get('fonts', function(items) {
			var local = items.fonts || [];
			chrome.storage.sync.get('fonts', function(items) {
				var sync = items.fonts || [];
				var save = sync.concat(local);
				chrome.storage.sync.set({fonts: save}, function() {
					chrome.storage.local.remove('fonts');
					next();
				});
			});
		});
	}

];
