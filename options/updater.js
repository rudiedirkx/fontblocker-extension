
localStorage.version || (localStorage.version = updates.length);
var version = parseFloat(localStorage.version || 0);

if ( version < updates.length ) {
	var queue = updates.slice(version);
	var todo = queue.length, done = 0;

	var next;
	next = function() {
		localStorage.version = version + done;
		done++;

		var update = queue.shift();
		if ( update ) {
			update(next);
		}
		else {
			// Defined in options.js
			init();
		}
	};

	// Let's get started
	next();
}
else {
	init();
}
