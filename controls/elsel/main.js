module.exports = function(symbol) {
	// Based on a CSS-style element selector (symbol), returns a DOM object (if
	// '#' is used) or array of DOM objects (if '#' is not used). Similar to 
	// jQuery's $() and Prototype.js's $$(), but without all the overhead.
	var elements = document.querySelectorAll(symbol);
	if (symbol[0] == "#") {
		return elements[0];
	} else {
		return elements;
	}
}
