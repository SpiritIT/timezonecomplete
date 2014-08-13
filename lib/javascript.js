/**
* Copyright(c) 2014 Spirit IT BV
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/**
* Indicates how a Date object should be interpreted.
* Either we can take getYear(), getMonth() etc for our field
* values, or we can take getUTCYear(), getUtcMonth() etc to do that.
*/
(function (DateFunctions) {
    /**
    * Use the Date.getFullYear(), Date.getMonth(), ... functions.
    */
    DateFunctions[DateFunctions["Get"] = 0] = "Get";

    /**
    * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
    */
    DateFunctions[DateFunctions["GetUTC"] = 1] = "GetUTC";
})(exports.DateFunctions || (exports.DateFunctions = {}));
var DateFunctions = exports.DateFunctions;
