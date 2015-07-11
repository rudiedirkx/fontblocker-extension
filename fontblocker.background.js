
var blockId = chrome.contextMenus.create({
	"title": 'Block custom font',
	"contexts": ['all'],
	"onclick": function(info, tab) {
		chrome.tabs.sendMessage(tab.id, {"getLastElementFont": true}, function(data) {
			if ( !data || !data.name || !data.host ) return;

			chrome.storage.local.get('fonts', function(items) {
				var fonts = items.fonts || [];
				for (var i=0; i<fonts.length; i++) {
					var font = fonts[i];
					if (font.host == data.host && font.name == data.name) {
						// Already exists, cancel
						return;
					}
				}

				data.added = Date.now();
				fonts.push(data);
				chrome.storage.local.set({fonts: fonts}, function() {
					// Saved!
				});
			});
		});
	}
});
