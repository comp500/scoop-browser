const path = require("path");
const fs = require("fs");
const NodeGit = require("nodegit");

const gitReposPath = path.join(__dirname, "tmp/");
const gitReposList = {
	"main": {
		cloneURL: "https://github.com/lukesampson/scoop.git",
		directory: "bucket"
	}, 
	"extras": {
		cloneURL: "https://github.com/lukesampson/scoop-extras.git"
	}
}

try {
	fs.mkdirSync(gitReposPath);
} catch (e) {
	if (e.code != "EEXIST") {
		throw e;
	}
}

let fetchRepositories = () => {
	Promise.all(Object.keys(gitReposList).map((key) => {
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
}

const express = require("express");
const app = express();

app.get("/list.json", (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log("Listening on port 3000!")
});

fetchRepositories();