/**
 * Add CSS to override @font-face
 */

function addFonts(fonts) {
	var weights = ['normal', 'bold', /*'100', '200',*/ '300', '500', '600', '800', '900'];
	var styles = ['normal', 'italic'];

	// Compile CSS
	var css = [];
	for ( var name in fonts ) {
		var font = fonts[name];
		weights.forEach(function(weight) {
			styles.forEach(function(style) {
				css.push('@font-face { font-family: "' + font.name + '"; font-weight: ' + weight + '; font-style: ' + style + '; src: local("Arial"); }');
			});
		});
	}

	// Insert into DOM
	var style = document.createElement('style');
	style.dataset.origin = 'fontblocker';
	style.innerHTML = css.join("\n");
	if (document.head) {
		document.head.appendChild(style);
	}
}

// Fetch configured fonts
chrome.storage.local.get('fonts', function(items) {
	var fonts = items.fonts || {};
	if (!Object.keys(fonts).length) return;

	addFonts(fonts);
});



/**
 * Context menu item (background page)
 */

var lastElement, lastContext = {x: 0, y: 0};
document.addEventListener('contextmenu', function(e) {
	lastElement = e.target;
	lastContext.x = e.x;
	lastContext.y = e.y;
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	if (lastElement) {
		if (message.getLastElementFont) {
			var fonts = getComputedStyle(lastElement).fontFamily.split(',');
			fonts = fonts.filter(function(font) {
				return font.trim() != '';
			});

			var font = fonts[0].replace(/^['"\s]+|['"\s]$/g, '');
			if (confirm('Do you want to block\n\n' + font + '\n\n?')) {
				var add = {};
				add[font] = {name: font};
				addFonts(add);

				var data = {
					name: font,
					website: location.hostname,
				};
				sendResponse(data);
			}
		}
	}
});
