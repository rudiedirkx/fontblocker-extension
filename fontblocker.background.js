
var blockId = chrome.contextMenus.create({
	"title": 'Block custom font',
	"contexts": ['all'],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {"getLastElementFont": true}, function(font) {
			if (!font) return;

			chrome.storage.local.get(['fonts'], function(items) {
				var fonts = items.fonts || [];
				if (fonts.indexOf(font) == -1) {
					fonts.push(font);

					chrome.storage.local.set({fonts: fonts}, function() {
						// Saved!
					});
				}
			});

			// chrome.tabs.create({
			// 	"url": chrome.extension.getURL('options/options.html') + '#' + font,
			// 	"active": true,
			// 	"index": tab.index + 1,
			// });
		});
	}
});
