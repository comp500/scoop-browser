/*
	Parts of this code copied from @meltwater/fetch-favicon
	Copyright (c) 2016 geneconnolly <gene.connolly@meltwater.com>
*/

const faviconsSchema = require("./faviconsSchema.js");
const xray = require("x-ray")();
const resolveUrl = require("url").resolve;

let downloadPage = (url) => {
	return xray(url, {
		title: "title",
		favicons: xray(faviconsSchema.selectors.join(), [{
			href: '@href',
			content: '@content',
			property: '@property',
			rel: '@rel',
			name: '@name',
			sizes: '@sizes',
			title: 'title'
		}])
	});
};

let getFavicon = (url) => {
	return new Promise(function (resolve, reject) {
		downloadPage(url)((err, page) => {
			if (err) {
				return reject(err);
			}
			let favicons = page.favicons;

			favicons.push({
				href: resolveUrl(url, 'favicon.ico'),
				name: 'favicon.ico'
			});

			favicons.sort((faviconA, faviconB) => {
				let sizeA = Math.min.apply(null, (faviconA.sizes || '').split(/[^0-9\.]+/g)) || undefined;
				let sizeB = Math.min.apply(null, (faviconB.sizes || '').split(/[^0-9\.]+/g)) || undefined;
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
						if (faviconA.name == "favicon.ico") {
							// Move A down as it is the fallback
							return -1;
						} else if (faviconB.name == "favicon.ico") {
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
			return resolve({
				favicon: favicons[favicons.length - 1],
				title: page.title
			});
		})
	});
};

let count = 0;

module.exports = (faviconPath) => {
	return (array) => {
		return Promise.all(array.map((package) => {
			if (package.homepage) {
				return getFavicon(package.homepage).then((page) => {
					package.favicon = page.favicon;
					console.log(count++);
					if (!package.shortcutName) {
						if (page.title) {
							let title = page.title;
							title = title.replace("GitHub - ", ""); // Remove github from title
							title = title.replace(" | SourceForge.net", ""); // Remove all the forged sources
							title = title.replace(/(?: - | \| )?Home(?: - | \| )?|Home\s?page/gi, ""); // Remove "Home" or "Homepage" or "Home Page" etc.
							package.shortcutName = title;
						} else {
							package.shortcutName = package.name;
						}
					}
					return package;
				}).catch((e) => {
					console.error(e);
					console.error(package.homepage);
					count++;
					return package;
				});
			} else {
				count++;
				return package;
			}
		}));
	};
};