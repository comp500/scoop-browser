/*
	Parts of this code copied from @meltwater/fetch-favicon
	Copyright (c) 2016 geneconnolly <gene.connolly@meltwater.com>
*/

const faviconsSchema = require("./faviconsSchema.js");
const xray = require("x-ray")();
const resolveUrl = require("url").resolve;

let downloadPage = (url) => {
	return xray(url, faviconsSchema.selectors.join(), [{
		href: '@href',
		content: '@content',
		property: '@property',
		rel: '@rel',
		name: '@name',
		sizes: '@sizes',
		title: 'title'
	}]);
};

let getFavicon = (url) => {
	return new Promise(function (resolve, reject) {
		downloadPage(url)((err, favicons) => {
			if (err) {
				return reject(err);
			}

			favicons.push({
				href: resolveUrl(url, 'favicon.ico'),
				name: 'favicon.ico'
			});

			favicons.sort((faviconA, faviconB) => {
				let sizeA = Math.min.apply(null, (favicon.sizes || '').split(/[^0-9\.]+/g)) || undefined;
				let sizeB = Math.min.apply(null, (favicon.sizes || '').split(/[^0-9\.]+/g)) || undefined;
				if (sizeA) {
					if (sizeB) {
						// Size comparison
						return sizeA - sizeB;
					} else {
						// A has size, but B does not, so move A up
						return 1;
					}
				} else {
					if (!sizeB) {
						if (sizeA.name == "favicon.ico") {
							// Move A down as it is the fallback
							return -1;
						} else if (sizeB.name == "favicon.ico") {
							// Move B down as it is the fallback
							return 1;
						} else {
							// Neither have size, don't move them
							return 0;
						}
					} else {
						// B has size, but A does not, so move B up
						return -1;
					}
				}
			});

			// Return last sorted, highest in ranking
			return resolve(favicons[favicons.length - 1]);
		})
	});
};

let count = 0;

module.exports = (faviconPath) => {
	return (array) => {
		return Promise.all(array.map((package) => {
			if (package.homepage) {
				return getFavicon(package.homepage).then((favicon) => {
					package.favicon = favicon;
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