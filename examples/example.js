/// <reference path="../typings/lib.d.ts" />
var tc = require("../lib/index");

var d = tc.Duration.milliseconds(3600);
var tz = tc.TimeZone.zone("Europe/Amsterdam");
var dt = new tc.DateTime();
var p = new tc.Period(dt, 1, 3 /* Day */, 1 /* RegularLocalTime */);

console.log(d);
console.log(tz);
console.log(dt);
console.log(p);

var now = tc.DateTime.nowLocal();
console.log("");
console.log("Formatting " + now.toString());
console.log("format(\"dd/MM/yyyy HH:mm:ss\")                => " + now.format("dd/MM/yyyy HH:mm:ss"));
console.log("format(\"MM-dd-yy hh:mm:ss a\")                => " + now.format("MM-dd-yy hh:mm:ss a"));
console.log("format(\"yyyy/MM/DD HH:mm:ss OOOO\")           => " + now.format("yyyy/MM/DD HH:mm:ss OOOO"));
console.log("format(\"EEEE, MMMM d y G 'at' hh''mm''ss a\") => " + now.format("EEEE, MMMM d y G 'at' h''mm''ss a"));
//# sourceMappingURL=example.js.map
