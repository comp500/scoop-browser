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

			favicons = favicons.map((favicon) => {
				const f = {
					href: favicon.href || favicon.content,
					name: favicon.name || favicon.rel || favicon.property,
					size: Math.min.apply(null, (favicon.sizes || '').split(/[^0-9\.]+/g)) || undefined
				};

				if (!f.size) {
					delete f.size;
				}

				return f;
			})

			//markActiveFavicon(favicons, size)
			return resolve(favicons)
		})
	});
};

let count = 0;

module.exports = (faviconPath) => {
	return (array) => {
		return Promise.all(array.map((package) => {
			if (package.homepage) {
				return getFavicon(package.homepage).then((favicons) => {
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