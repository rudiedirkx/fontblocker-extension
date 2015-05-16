
console.time('Options init');

function ready() {
	document.body.classList.remove('loading');
	console.timeEnd('Options init');
}

function init() {

	function _html(text) {
		return text.replace(/</g, '&lt;');
	}

	chrome.storage.local.get('fonts', function(items) {
		var fonts = items.fonts || {};
		var $fonts = document.querySelector('#fonts');

		// Show fonts
		var html = '';
		for ( var name in fonts ) {
			var font = fonts[name];
			html += '<tr>';
			html += '<td class="font-name">' + _html(font.name) + '</td>';
			html += '<td><a class="remove-font" href="#">x</a></td>';
			html += '<td>' + _html(font.website) + '</td>';
			html += '<td>' + (new Date(font.added)) + '</td>';
			html += '</tr>';
		}
		$fonts.innerHTML = html;

		// Listen for unblock click
		$fonts.addEventListener('click', function(e) {
			if ( e.target.matches('a.remove-font') ) {
				e.preventDefault();

				var li = e.target.parentNode.parentNode;
				var font = li.querySelector('.font-name').textContent;
				if ( confirm("Do you want to unblock\n\n" + font + "\n\n?") ) {
					chrome.storage.local.get('fonts', function(items) {
						delete items.fonts[font];
						chrome.storage.local.set(items, function() {
							location.reload();
						});
					});
				}
			}
		});

		ready();
	});

}
