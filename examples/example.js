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
