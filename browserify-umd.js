"use strict;"

var browserify  = require("browserify");
var fs = require("fs");
var mkdirp = require("mkdirp");
var util = require("util");

mkdirp.sync("./temp");

var packageJson = require("./package.json");
var distOutFileVersioned = util.format("./temp/timezonecomplete.%s.js", packageJson.version);
var distOutVersioned = fs.createWriteStream(distOutFileVersioned, { encoding: "utf-8", flags: "w"})
var distOutFileUnversioned = "./dist/timezonecomplete.js";
var distOutUnversioned = fs.createWriteStream(distOutFileUnversioned, { encoding: "utf-8", flags: "w"})

var bundled = browserify({
		extensions: [".js", ".json"],
		debug: true,
		standalone: "tc"
	})
	.require("./dist/lib/index.js", { expose: "timezonecomplete" })
	.bundle();

bundled.pipe(distOutVersioned);
bundled.pipe(distOutUnversioned);


