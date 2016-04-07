window.addEventListener('load', function() {
	require = function(packName) {
		// Define rudimentary synchronous (A)JAX fetch routine
		var fetch = function(path) {
			var xhr = new XMLHttpRequest();
			var response = "";
			xhr.addEventListener("load", function() {
				response = this.responseText;
			});
			xhr.open("GET", path, false);
			xhr.send();
			return response;
		};
		
		// Grab package definition and package entry point
		var packDef = JSON.parse(fetch("controls/" + packName + "/package.json"));
		var mainContent = fetch("controls/" + packName + "/" + packDef.main);

		// Append new script tags
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.appendChild(document.createTextNode(mainContent));
		
		// Retrieve and return module.exports symbol
		module = {};
		document.body.appendChild(s);
		return module.exports;
	};
});
