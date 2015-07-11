
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
		$fonts = document.querySelector('#fonts');

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
			html += '<td class="font-name" data-value="' + _html(font.name.toLowerCase()) + '">' + _html(font.name) + '</td>';
			html += '<td class="font-host" data-value="' + _html(font.host) + '">' + _html(font.host) + '</td>';
			html += '<td class="font-delete"><a class="remove-font" href="#">x</a></td>';
			html += '<td class="font-added" data-value="' + font.added + '">' + date + '</td>';
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

		// Listen for sorting
		document.addEventListener('click', function(e) {
			if ( e.target.matches('th.sorter > a') ) {
				e.preventDefault();
				var sorter = e.target.parentNode;

				// New sort
				var column = sorter.dataset.sort;

				// Current sorting state
				var sorting = document.querySelector('th.sorting');
				var isCurrentSort = sorting.matches('th.' + column);

				var defaultOrder = sorter.dataset.order == 'desc' ? 'desc' : 'asc';
				var asc = defaultOrder == 'asc' ? 1 : -1;
				var currentOrder = sorter.dataset.currentOrder || defaultOrder;
				if ( isCurrentSort && currentOrder == defaultOrder ) {
					asc *= -1;
				}

				// Sort TRs
				var trs = [].slice.call($fonts.rows);
				trs.sort(function(a, b) {
					var aValue = a.querySelector('td.' + column).dataset.value;
					var bValue = b.querySelector('td.' + column).dataset.value;
					return aValue > bValue ? asc : (bValue > aValue ? -asc : 0);
				});

				// Re-append TRs in new order
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					$fonts.appendChild(tr);
				}

				// Change sort focus
				if ( !isCurrentSort ) {
					sorting.classList.remove('sorting');
					delete sorting.dataset.currentOrder;

					sorting = document.querySelector('th.' + column);
					sorting.classList.add('sorting');
				}
				sorting.dataset.currentOrder = asc == 1 ? 'asc' : 'desc';
			}
		});

		ready();
	});

}
