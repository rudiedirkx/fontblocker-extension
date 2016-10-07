function setPageActionIcon(tabId, disabled) {
	var icon = disabled ? '128x128-disabled' : '128x128';
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: chrome.runtime.getURL('images/' + icon + '.png'),
	});
}

// Context menu: BLOCK ALWAYS
chrome.contextMenus.create({
	"title": 'Block custom font',
	"contexts": ["page", "frame", "selection", "link", "editable"],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {getLastElementFont: true}, function(data) {
			// Not as response, bc async, so instead as new message
			// blockFont(data);
		});
	}
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg && msg.blockFont ) {
		blockFont(msg.blockFont);
	}
});

function blockFont(data) {
	if ( !data || !data.name || !data.host ) return;
	console.debug('Saving font', data);

	fb.storage.get('fonts', function(items) {
		var fonts = items.fonts || [];
		for (var i=0; i<fonts.length; i++) {
			var font = fonts[i];
			if (font.host == data.host && font.name == data.name) {
				// Already exists, cancel
				return;
			}
		}

		data.added = Date.now();
		fonts.unshift(data);
		fb.storage.set({fonts: fonts}, function() {
			// Saved!
		});
	});
}

// Show page action
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg && msg.fontsBlocked ) {
		setPageActionIcon(sender.tab.id);
		chrome.pageAction.show(sender.tab.id);
	}
});

// Click on page action
chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id, {glimpseFonts: true}, function(data) {
		setPageActionIcon(tab.id, data.disabled);
	});
});
