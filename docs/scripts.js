fetch("/list.json").then(function(response) {
	return response.json();
}).then(function(data) {
	let test = "";
	Object.keys(data).forEach(key => {
		test += "<strong>";
		test += key;
		test += "</strong> ";
		test += data[key].friendlyName;
		test += "<br>";
	});
	document.getElementById("packages").innerHTML = test;
});