
function showPageAction() {
	var htmlData = document.documentElement.dataset;
	var blocked = htmlData.blockedFonts ? htmlData.blockedFonts.toLowerCase().split('|') : [];

	// See if any fonts were actually blocked
	var found = [].slice.call(document.querySelectorAll('body :first-of-type')).some(function(el) {
		var families = getComputedStyle(el).fontFamily;
		return families.split(',').some(function(family) {
			family = family.replace(/(^[ '"]+|[ '"]+$)/g, '').toLowerCase();
			if ( blocked.indexOf(family) != -1 ) {
				return true;
			}
		});
	});

	// Show page action?
	chrome.runtime.sendMessage({fontsBlocked: found});
}



/**
 * Add CSS to override @font-face
 */

function addFonts(fonts, replacements, type, manual) {
	if (!fonts.length) return;

	if (type != 'preview') {
		var htmlData = document.documentElement.dataset;
		var blocked = htmlData.blockedFonts ? htmlData.blockedFonts.split('|') : [];
		blocked = blocked.concat(fonts);
		document.documentElement.dataset.blockedFonts = blocked.join('|').toLowerCase();
	}

	// Compile CSS
	var css = [];
	for (var i=0; i<fonts.length; i++) {
		var font = fonts[i];
		var replacementFont = replacements[i] || fb.REPLACEMENT;

		css.push('@font-face { font-family: "' + font + '"; src: local("' + replacementFont + '"); }');
	}

	// Insert into DOM
	var style = document.createElement('style');
	style.className = 'fontblocker';
	style.dataset.origin = 'fontblocker';
	style.dataset.type = type;
	style.dataset.count = fonts.length;
	style.innerHTML = css.join("\n");
	(document.head || document.documentElement).appendChild(style);

	// Make sure it keeps being last
	var move = function() {
		if ( style.nextElementSibling && !style.nextElementSibling.classList.contains('fontblocker') ) {
			(document.head || document.documentElement).appendChild(style);
		}

	};
	var mover = function() {
		move();
		requestAnimationFrame(mover);
	};
	requestAnimationFrame(mover);

	// Trigger font paint!?
	if (manual) {
		setTimeout(function() {
			style.disabled = true;
			setTimeout(function() {
				style.disabled = false;
			}, 1);
		}, 1);
	}

	// Show page action?
	manual && showPageAction();
}

// Fetch blocked fonts from storage.sync
if ( document.documentElement && document.documentElement.nodeName == 'HTML' && location.protocol != 'chrome-extension:' ) {
	var host = fb.host(location.hostname);
	fb.fontNamesForHost(host, function(fonts, replacements) {
		addFonts(fonts, replacements, 'persistent', false);
	});

	// Show page action?
	document.readyState == 'complete' ? showPageAction() : window.addEventListener('load', function(e) {
		setTimeout(showPageAction, 1);
	});
}



/**
 * Context menu item (background page)
 */

var lastElement, lastContext = {x: 0, y: 0};
document.addEventListener('contextmenu', function(e) {
	lastElement = e.target;
	lastContext.x = e.x;
	lastContext.y = e.y;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.getLastElementFont && lastElement) {
		// Currently blocked fonts
		var htmlData = document.documentElement.dataset;
		var blocked = htmlData.blockedFonts ? htmlData.blockedFonts.split('|') : [];

		// Extract used font
		var fontFamily = getComputedStyle(lastElement).fontFamily;
		var rawFonts = fontFamily.split(',');
		var font;
		for (var i=0; i<rawFonts.length; i++) {
			var blockFont = rawFonts[i];
			blockFont = blockFont.trim().replace(/^['"\s]+|['"\s]$/g, '').trim();
			var checkFont = blockFont.toLowerCase();
			if (blockFont && blocked.indexOf(checkFont) == -1 && fb.UNBLOCKABLE.indexOf(checkFont) == -1) {
				font = blockFont;
				break;
			}
		}

		// No blockable font found
		if (!font) {
			console.warn('No font detected, or all blockable fonts blocked: ' + fontFamily);
			return;
		}

		// Preview before confirming
		addFonts([font], [], 'preview', false);

		// Block and persist
		var host = fb.host(location.hostname);
		setTimeout(function() {
			if (confirm("Do you want to block\n\n    " + font + "\n\non\n\n    " + host + "\n\n?")) {
				removeFonts('preview');
				addFonts([font], [], 'persistent', true);

				// Save in storage.sync
				var data = {
					name: font,
					host: host,
				};
				console.debug('Saving font', data);
				// sendResponse(data);
				chrome.runtime.sendMessage({blockFont: data}, function(response) {
					// Don't care if that worked
				});
			}
			else {
				removeFonts('preview');
			}
		}, 100);
	}
});

function removeFonts(type) {
	console.debug('Removing fonts', type);
	var style = document.querySelector('style[data-origin="fontblocker"][data-type="' + type + '"]');
	style && style.remove();
}



/**
 * (Un)glimpse blocked fonts, from page action
 */

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.glimpseFonts) {
		var styles = document.querySelectorAll('style[data-origin="fontblocker"]');
		var enabled = null;
		[].forEach.call(styles, function(style) {
			if (enabled == null) {
				enabled = !style.disabled;
			}
			style.disabled = enabled;
		});
		sendResponse({disabled: enabled});
	}
});
