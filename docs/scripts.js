window.addEventListener("load", function(event) {
	fetch("/list.json").then(function(response) {
		return response.json();
	}).then(function(data) {
		let test = "";
		Object.keys(data).forEach(key => {
			test += "<div class=\"package\">"
			if (data[key].icon) {
				test += "<img src=\"" + data[key].icon + "\" width=\"32\">"
			}
			test += "<strong>";
			test += key;
			test += "</strong> ";
			test += data[key].friendlyName;
			test += "</div>";
		});
		document.getElementById("packages").innerHTML = test;
	});
});