/**
* Copyright(c) 2014 Spirit IT BV
*
* Olsen Timezone Database container
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

/**
* @return True iff the given year is a leap year.
*/
function isLeapYear(year) {
    // from Wikipedia:
    // if year is not divisible by 4 then common year
    // else if year is not divisible by 100 then leap year
    // else if year is not divisible by 400 then common year
    // else leap year
    if (year % 4 !== 0) {
        return false;
    } else if (year % 100 !== 0) {
        return true;
    } else if (year % 400 !== 0) {
        return false;
    } else {
        return true;
    }
}
exports.isLeapYear = isLeapYear;

/**
* The days in a given year
*/
function daysInYear(year) {
    return (exports.isLeapYear(year) ? 366 : 365);
}
exports.daysInYear = daysInYear;

/**
* @param year	The full year
* @param month	The month 1-12
* @return The number of days in the given month
*/
function daysInMonth(year, month) {
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 2:
            return (exports.isLeapYear(year) ? 29 : 28);
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        default:
            assert(false, "Invalid month: " + month);

            /* istanbul ignore next */
            return 0;
    }
}
exports.daysInMonth = daysInMonth;

function isInt(n) {
    if (typeof (n) !== "number") {
        return false;
    }
    if (isNaN(n)) {
        return false;
    }
    return (Math.floor(n) === n);
}
exports.isInt = isInt;

/**
* Basic representation of a date and time
*/
var TimeStruct = (function () {
    function TimeStruct(/**
    * Year, 1970-...
    */
    year, /**
    * Month 1-12
    */
    month, /**
    * Day of month, 1-31
    */
    day, /**
    * Hour 0-23
    */
    hour, /**
    * Minute 0-59
    */
    minute, /**
    * Seconds, 0-61 (60, 61 for leap seconds)
    */
    second, /**
    * Milliseconds 0-999
    */
    milli) {
        if (typeof year === "undefined") { year = 1970; }
        if (typeof month === "undefined") { month = 1; }
        if (typeof day === "undefined") { day = 1; }
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof milli === "undefined") { milli = 0; }
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.milli = milli;
        assert(this.validate(), "Invalid arguments");
    }
    /**
    * Validate a TimeStruct, returns false if invalid.
    */
    TimeStruct.prototype.validate = function () {
        return (typeof (this.year) === "number" && !isNaN(this.year) && exports.isInt(this.year) && this.year >= 1970 && typeof (this.month) === "number" && !isNaN(this.month) && exports.isInt(this.month) && this.month >= 1 && this.month <= 12 && typeof (this.day) === "number" && !isNaN(this.day) && exports.isInt(this.day) && this.day >= 1 && this.day <= exports.daysInMonth(this.year, this.month) && typeof (this.hour) === "number" && !isNaN(this.hour) && exports.isInt(this.hour) && this.hour >= 0 && this.hour <= 23 && typeof (this.minute) === "number" && !isNaN(this.minute) && exports.isInt(this.minute) && this.minute >= 0 && this.minute <= 59 && typeof (this.second) === "number" && !isNaN(this.second) && exports.isInt(this.second) && this.second >= 0 && this.second <= 61 && typeof (this.milli) === "number" && !isNaN(this.milli) && exports.isInt(this.milli) && this.milli >= 0 && this.milli <= 999);
    };

    /**
    * The day-of-year 0-365
    */
    TimeStruct.prototype.yearDay = function () {
        assert(this.validate(), "Invalid TimeStruct value");
        var yearDay = 0;
        for (var i = 1; i < this.month; i++) {
            yearDay += exports.daysInMonth(this.year, i);
        }
        yearDay += (this.day - 1);
        return yearDay;
    };
    return TimeStruct;
})();
exports.TimeStruct = TimeStruct;

function assertUnixTimestamp(unixMillis) {
    assert(typeof (unixMillis) === "number", "number input expected");
    assert(!isNaN(unixMillis), "NaN not expected as input");
    assert(exports.isInt(unixMillis), "integer number expected");
    assert(unixMillis >= 0, "Unix timestamps before 1970 cannot be converted.");
}

/**
* Convert a unix milli timestamp into a TimeT structure.
* This does NOT take leap seconds into account.
*/
function unixToTimeNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);

    var temp = unixMillis;
    var result = new TimeStruct();

    result.milli = temp % 1000;
    temp = Math.floor(temp / 1000);
    result.second = temp % 60;
    temp = Math.floor(temp / 60);
    result.minute = temp % 60;
    temp = Math.floor(temp / 60);
    result.hour = temp % 24;
    temp = Math.floor(temp / 24);

    var year = 1970;
    while (temp >= exports.daysInYear(year)) {
        temp -= exports.daysInYear(year);
        year++;
    }
    result.year = year;

    var month = 1;
    while (temp >= exports.daysInMonth(year, month)) {
        temp -= exports.daysInMonth(year, month);
        month++;
    }
    result.month = month;
    result.day = temp + 1;

    return result;
}
exports.unixToTimeNoLeapSecs = unixToTimeNoLeapSecs;

/**
* Convert a TimeT structure into a unix milli timestamp.
* This does NOT take leap seconds into account.
*/
function timeToUnixNoLeapSecs(tm) {
    assert(tm.validate(), "tm invalid");
    return tm.milli + 1000 * (tm.second + tm.minute * 60 + tm.hour * 3600 + tm.yearDay() * 86400 + (tm.year - 1970) * 31536000 + Math.floor((tm.year - 1969) / 4) * 86400 - Math.floor((tm.year - 1901) / 100) * 86400 + Math.floor((tm.year - 1900 + 299) / 400) * 86400);
}
exports.timeToUnixNoLeapSecs = timeToUnixNoLeapSecs;

/**
* Day-of-week. Note the enum values correspond to JavaScript day-of-week:
* Sunday = 0, Monday = 1 etc
*/
(function (WeekDay) {
    WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
    WeekDay[WeekDay["Monday"] = 1] = "Monday";
    WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
    WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
    WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
    WeekDay[WeekDay["Friday"] = 5] = "Friday";
})(exports.WeekDay || (exports.WeekDay = {}));
var WeekDay = exports.WeekDay;

/**
* Time units
*/
(function (TimeUnit) {
    TimeUnit[TimeUnit["Second"] = 0] = "Second";
    TimeUnit[TimeUnit["Minute"] = 1] = "Minute";
    TimeUnit[TimeUnit["Hour"] = 2] = "Hour";
    TimeUnit[TimeUnit["Day"] = 3] = "Day";
    TimeUnit[TimeUnit["Week"] = 4] = "Week";
    TimeUnit[TimeUnit["Month"] = 5] = "Month";
    TimeUnit[TimeUnit["Year"] = 6] = "Year";
})(exports.TimeUnit || (exports.TimeUnit = {}));
var TimeUnit = exports.TimeUnit;

/**
* Return the day-of-week.
* This does NOT take leap seconds into account.
*/
function weekDayNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);

    var epochDay = 4 /* Thursday */;
    var days = Math.floor(unixMillis / 1000 / 86400);
    return (epochDay + days) % 7;
}
exports.weekDayNoLeapSecs = weekDayNoLeapSecs;
