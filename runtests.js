
var exec = require("child_process").exec;
var path = require("path");
var env = process.env;

var istanbulPath = path.join(path.dirname(require.resolve("istanbul")), "..", ".bin", "istanbul");
var mochaPath = path.join(path.dirname(require.resolve("mocha")), "bin", "_mocha");

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

env["TZ"] = "";
exec("mocha ./test/*.js", { env: env }, logItAll.bind(null, "TZ=\"\""));

env["TZ"] = "America/Anchorage";
exec("mocha ./test/*.js", { env: env }, logItAll.bind(null, "TZ=\"America/Anchorage\""));

env["TZ"] = "Europe/Amsterdam";
exec("mocha ./test/*.js", { env: env }, logItAll.bind(null, "TZ=\"Europe/Amsterdam\""));

env["TZ"] = "";
exec(istanbulPath + " cover " + mochaPath + " -- ./test/*.js", { env: env }, logItAll.bind(null, "CODE COVERAGE"));
