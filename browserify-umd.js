"use strict;"

var browserify  = require("browserify");
var fs = require("fs");
var glob = require("glob");
var mkdirp = require("mkdirp");
var Umd = require("browserify-umdify");
var util = require("util");

mkdirp.sync("./temp");

var exampleOutFile = "./examples/browser-amd-requirejs/timezonecomplete.js";
var exampleOut = fs.createWriteStream(exampleOutFile, { encoding: "utf-8", flags: "w"})

var packageJson = require("./package.json");
var distOutFileVersioned = util.format("./dist/timezonecomplete.%s.js", packageJson.version);
var distOutVersioned = fs.createWriteStream(distOutFileVersioned, { encoding: "utf-8", flags: "w"})
var distOutFileUnversioned = "./dist/timezonecomplete.js";
var distOutUnversioned = fs.createWriteStream(distOutFileUnversioned, { encoding: "utf-8", flags: "w"})

var bundled = browserify({
		extensions: [".js", ".json"],
		debug: true
	})
	.require("./dist/lib/index.js", { expose: "timezonecomplete" })
	.bundle()
	.pipe(new Umd());

bundled.pipe(exampleOut);
bundled.pipe(distOutVersioned);
bundled.pipe(distOutUnversioned);


