chrome.storage.local.get(['fonts'], function(items) {

	var fonts = items.fonts || [];
	var $fonts = document.querySelector('#fonts');

	// Show fonts
	var html = fonts.map(function(font) {
		return '<li><span class="font-name">' + font.replace(/</g, '&lt;') + '</span> (<a class="remove-font" href="#">x</a>)</li>';
	});
	$fonts.innerHTML = html.join("\n");

	// Listen for unblock click
	$fonts.addEventListener('click', function(e) {
		if (e.target.matches('a.remove-font')) {
			e.preventDefault();

			var li = e.target.parentNode;
			var font = li.querySelector('.font-name').textContent;
			if (confirm("Do you want to unblock\n\n" + font + "\n\n?")) {
				chrome.storage.local.get(['fonts'], function(items) {
					var fonts = items.fonts || [];
					var index = fonts.indexOf(font);
					if (index >= 0) {
						fonts.splice(index, 1);
					}
					chrome.storage.local.set({fonts: fonts}, function(items) {
						location.reload();
					});
				});
			}
		}
	});
});
