const path = require("path");
const fs = require("fs");
const NodeGit = require("nodegit");
const express = require("express");
const app = express();

const gitReposPath = path.join(__dirname, "tmp/");
const gitReposList = {
	"main": {
		cloneURL: "https://github.com/lukesampson/scoop.git",
		directory: "bucket"
	}, 
	"extras": {
		cloneURL: "https://github.com/lukesampson/scoop-extras.git"
	}
};
const currentError = "Error: Website API not initialised yet, please refresh.";
const faviconPath = path.join(__dirname, "tmp/favicon/");

const getFavicons = require("./src/favicons.js")(faviconPath);

let packageIndex = [];

/*
	Main functions
*/

let fetchRepositories = () => {
	return Promise.all(Object.keys(gitReposList).map((key) => {
		let clonePath = path.join(gitReposPath, key);
		fs.access(clonePath, (err) => {
			if (err) { // check if repo exists
				return NodeGit.Clone(gitReposList[key].cloneURL, clonePath);
			} else {
				return NodeGit.Repository.open(clonePath).then((repo) => {
					return repo.fetchAll().then(() => {
						return repo.mergeBranches("master", "origin/master");
					});
				});
			}
		});
	})).then(() => {
		console.log("Git repositories fetched!");
	});
};

let indexRepositories = () => {
	return Promise.all(Object.keys(gitReposList).map((key) => {
		let repoDirectory = path.join(gitReposPath, key);
		if (gitReposList[key].directory) {
			repoDirectory = path.join(repoDirectory, gitReposList[key].directory);
		}
		return new Promise((resolve, reject) => {
			fs.readdir(repoDirectory, (err, directoryContents) => {
				if (err) {
					console.error("Error reading directory: " + key);
					reject(err);
				} else {
					let jsonFiles = directoryContents.filter((fileName) => fileName.endsWith(".json"));
					resolve(Promise.all(jsonFiles.map((fileName) => {
						return new Promise((resolve, reject) => {
							fs.readFile(path.join(repoDirectory, fileName), (err, fileContents) => {
								if (err) {
									console.error("Error reading file: " + fileName);
									reject(err);
								} else {
									try {
										// Ugly hack to remove multiline stuff because js JSON doesn't support it.
										// Remove object keys with multiline strings
										fileContents = fileContents.toString().replace(/(?:,[\s\n]+)"\w+":\s*"(?:\\"|[^"])*\n(?:\\"|[^"])+"|"\w+":\s*"(?:\\"|[^"])*\n(?:\\"|[^"])+",?/g, "");
										// Remove arrays with multiline strings, stupid miniconda3
										fileContents = fileContents.replace(/"\w+":\s*\[\s*"(?:\\"|[^"])*\n(?:\\"|[^"])+"\s*\],|(?:,[\s\n]+)"\w+":\s*\[\s*"(?:\\"|[^"])*\n(?:\\"|[^"])+"\s*\]/g, "");
										let parsed = JSON.parse(fileContents);

										let shortcutName = parsed.shortcuts ? parsed.shortcuts[0][1] : undefined;

										// Reduces memory usage by only passing certain values back
										resolve({
											name: fileName.slice(0, -5),
											version: parsed.version,
											homepage: parsed.homepage,
											license: parsed.license,
											bucket: key,
											shortcutName
										});
									} catch (e) {
										console.error("Error parsing file: " + fileName);
										reject(e);
									}
								}
							});
						});
					})));
				}
			});
		});
	})).then((passthrough) => {
		console.log("Files parsed!");
		return passthrough;
	});
};

let mergeBuckets = (arrays) => {
	return [].concat(...arrays);
};

/*
	Express stuff
*/

try {
	fs.mkdirSync(gitReposPath);
	fs.mkdirSync(faviconPath);
} catch (e) {
	if (e.code != "EEXIST") {
		throw e;
	}
}

app.get("/list.json", (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log("Listening on port 3000!");
});

fetchRepositories().then(indexRepositories).then(mergeBuckets).then(getFavicons).then((array) => {
	console.log(array);
	console.log(array.length);
	fs.writeFileSync("output.json", JSON.stringify(array));
});