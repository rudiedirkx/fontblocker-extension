
// Context menu: BLOCK ALWAYS
chrome.contextMenus.create({
	"title": 'Block custom font',
	"contexts": ["page", "frame", "selection", "link", "editable"],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {getLastElementFont: true}, function(data) {
			if ( !data || !data.name || !data.host ) return;

			chrome.storage.sync.get('fonts', function(items) {
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
				chrome.storage.sync.set({fonts: fonts}, function() {
					// Saved!
				});
			});
		});
	}
});

// Context menu: (UN)GLIMPSE ON PAGE
chrome.contextMenus.create({
	"title": '(Un)glimpse blocked fonts',
	"contexts": ["page_action"],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {glimpseFonts: true}, function(data) {
			// Whatever
		});
	}
});

// Show page action
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg && msg.fontsBlocked ) {
		chrome.pageAction.show(sender.tab.id);
	}
});

// Click on page action
chrome.pageAction.onClicked.addListener(function(tab) {
	var url = chrome.runtime.getURL('options/options.html');
	chrome.tabs.create({
		url: url + '#' + fb.host(tab.url),
	});
});
