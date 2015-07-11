
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
		var list = items.fonts || [];
		var $fonts = document.querySelector('#fonts');

		// Show fonts
		var aFontNameReplaced = false;
		var html = '';
		for ( var i=0; i<list.length; i++ ) {
			var font = list[i];

			// Replace font name in description text, just for funsies
			if ( !aFontNameReplaced && Math.random() < 3/list.length ) {
				document.querySelector('#a-font-name').textContent = font.name;
			}

			var date = new Date(font.added);
			date = date.getDate() + ' ' + date.toLocaleDateString(undefined, {month: 'long'}) + ' ' + date.getFullYear();

			html += '<tr data-index="' + i + '">';
			html += '<td class="font-name" data-sort="' + _html(font.name.toLowerCase()) + '">' + _html(font.name) + '</td>';
			html += '<td class="font-host" data-sort="' + _html(font.host) + '">' + _html(font.host) + '</td>';
			html += '<td class="font-delete"><a class="remove-font" href="#">x</a></td>';
			html += '<td class="font-added" data-sort="' + font.added + '">' + date + '</td>';
			html += '</tr>';
		}
		$fonts.innerHTML = html;

		// Listen for unblock click
		$fonts.addEventListener('click', function(e) {
			if ( e.target.matches('a.remove-font') ) {
				e.preventDefault();

				var tr = e.target.parentNode.parentNode;
				var index = Number(tr.dataset.index);
				var font = list[index];
				if ( confirm("Do you want to unblock\n\n" + font.name + "\n\non\n\n" + font.host + "\n\n?") ) {
					chrome.storage.local.get('fonts', function(items) {
						var list = items.fonts;
						list.splice(index, 1);
						chrome.storage.local.set({fonts: list}, function() {
							location.reload();
						});
					});
				}
			}
		});

		ready();
	});

}
