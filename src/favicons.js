const faviconsSchema = require("./faviconsSchema.js");

let count = 0;

module.exports = (faviconPath) => {
	return (array) => {
		return Promise.all(array.map((package) => {
			if (package.homepage) {
				return fetchFavicons(package.homepage).then((favicons) => {
					package.favicons = favicons;
					console.log(count++);
					return package;
				}).catch((e) => {
					console.error(e);
					console.error(package.homepage);
				});
			} else {
				return package;
			}
		}));
	};
};