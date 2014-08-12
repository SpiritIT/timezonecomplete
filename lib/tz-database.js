/**
* Copyright(c) 2014 Spirit IT BV
*
* Olsen Timezone Database container
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var duration = require("duration");

/* tslint:disable:no-var-requires */
var data = require("./timezone-data.json");

/* tslint:enable:no-var-requires */
var Duration = duration.Duration;

var TzDatabase = (function () {
    function TzDatabase() {
    }
    TzDatabase.prototype.offsetForUtc = function (timeZone, a) {
        return Duration.hours(1);
    };
    return TzDatabase;
})();
