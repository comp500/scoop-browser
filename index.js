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
	console.log("Indexing...");
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
										fileContents = fileContents.toString().replace(/"\w+":\s*"(?:\\"|[^"])*\n(?:\\"|[^"])+",?/g, "");
										//fileContents = fileContents.replace(/\\/g, "\\\\");
										resolve(JSON.parse(fileContents));
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
	}));
};

/*
	Express stuff
*/

try {
	fs.mkdirSync(gitReposPath);
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

fetchRepositories().then(indexRepositories);