
var exec = require("child_process").exec;
var path = require("path");
var env = process.env;
var util = require("util");

function logItAll(name, error, stdout, stderr) {
	console.log("");
	console.log(name);
	console.log("stdout: " + stdout);
	console.log("stderr: " + stderr);
	if (error !== null) {
		console.log("exec error: " + error);
		process.exit(1);
	}
	console.log("");
}

var mochaPath = path.join(path.dirname(require.resolve("mocha")), "..", ".bin", "mocha");
var mochaCmd = util.format("%s ./dist/test/*.js", mochaPath);

env["TZ"] = "";
exec(mochaCmd, { env: env }, logItAll.bind(null, "TZ=\"\""));

env["TZ"] = "America/Anchorage";
exec(mochaCmd, { env: env }, logItAll.bind(null, "TZ=\"America/Anchorage\""));

env["TZ"] = "Europe/Amsterdam";
exec(mochaCmd, { env: env }, logItAll.bind(null, "TZ=\"Europe/Amsterdam\""));
