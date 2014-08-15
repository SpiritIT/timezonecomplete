/**
* Copyright(c) 2014 Spirit IT BV
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";

/**
* Default time source, returns actual time
*/
var RealTimeSource = (function () {
    function RealTimeSource() {
    }
    RealTimeSource.prototype.now = function () {
        /* istanbul ignore next */
        return new Date();
    };
    return RealTimeSource;
})();
exports.RealTimeSource = RealTimeSource;
