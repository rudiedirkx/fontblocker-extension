
var blockId = chrome.contextMenus.create({
	"title": 'Block custom font',
	"contexts": ['all'],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {"getLastElementFont": true}, function(data) {
			if ( !data || !data.name || !data.website ) return;

			chrome.storage.local.get('fonts', function(items) {
				var fonts = items.fonts || {};
				if ( !fonts[data.name] ) {
					data.added = Date.now();
					fonts[data.name] = data;

					chrome.storage.local.set({fonts: fonts}, function() {
						// Saved!
					});
				}
			});
		});
	}
});
