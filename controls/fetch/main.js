module.exports = function(path) {
	var xhr = new XMLHttpRequest();
	var response = "";
	xhr.addEventListener("load", function() {
		response = this.responseText;
	});
	xhr.open("GET", path, false);
	xhr.send();
	return response;
};
