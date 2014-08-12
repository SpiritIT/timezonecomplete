/// <reference path="../typings/lib.d.ts" />


import tc = require("../lib/index");

var d = tc.Duration.milliseconds(3600);
var tz = tc.TimeZone.zone("Europe/Amsterdam");
var dt = new tc.DateTime();
var p = new tc.Period(dt, 1, tc.TimeUnit.Day, tc.PeriodDst.RegularLocalTime);


console.log(d);
console.log(tz);
console.log(dt);
console.log(p);
