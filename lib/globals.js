/**
* Copyright(c) 2014 Spirit IT BV
*
* Global functions depending on DateTime/Duration etc
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var datetime = require("./datetime");
var DateTime = datetime.DateTime;

var duration = require("./duration");
var Duration = duration.Duration;



/**
* Returns the minimum of two DateTimes or Durations
*/
function min(d1, d2) {
    assert(d1, "first argument is null");
    assert(d2, "first argument is null");

    /* istanbul ignore next */
    assert((d1 instanceof DateTime && d2 instanceof DateTime) || (d1 instanceof Duration && d2 instanceof Duration), "Either two datetimes or two durations expected");
    return d1.min(d2);
}
exports.min = min;



/**
* Returns the maximum of two DateTimes or Durations
*/
function max(d1, d2) {
    assert(d1, "first argument is null");
    assert(d2, "first argument is null");

    /* istanbul ignore next */
    assert((d1 instanceof DateTime && d2 instanceof DateTime) || (d1 instanceof Duration && d2 instanceof Duration), "Either two datetimes or two durations expected");
    return d1.max(d2);
}
exports.max = max;
//# sourceMappingURL=globals.js.map
