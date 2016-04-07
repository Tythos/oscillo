window.addEventListener("load", function() {
	// Load dependencies
	var f = require("fetch");
	var e = require("elsel");
	var hb = require("handlebars");
	
	// Grab model data, compile template, render content to page
	var data = JSON.parse(f("models/carriers.json"));
	var template = hb.compile(f("visuals/supercarrier.html"));
	e("#content").innerHTML = template(data);
});
