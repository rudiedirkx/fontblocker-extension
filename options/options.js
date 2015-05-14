chrome.storage.local.get(['fonts'], function(items) {
	var fonts = items.fonts || [];
	document.querySelector('#fonts').textContent = fonts.join("\n");
});
