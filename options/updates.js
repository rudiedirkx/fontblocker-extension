
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

];
