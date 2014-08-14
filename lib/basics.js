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

var math = require("./math");
var strings = require("./strings");

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

/**
* Returns the day of the year of the given date [0..365]. January first is 0.
*
* @param year	The year e.g. 1986
* @param month Month 1-12
* @param day Day of month 1-31
*/
function dayOfYear(year, month, day) {
    assert(month >= 1 && month <= 12, "Month out of range");
    assert(day >= 1 && day <= exports.daysInMonth(year, month), "day out of range");
    var yearDay = 0;
    for (var i = 1; i < month; i++) {
        yearDay += exports.daysInMonth(year, i);
    }
    yearDay += (day - 1);
    return yearDay;
}
exports.dayOfYear = dayOfYear;

/**
* Returns the last instance of the given weekday in the given month
*
* @param year	The year
* @param month	the month 1-12
* @param weekDay	the desired week day
*
* @return the last occurrence of the week day in the month
*/
function lastWeekDayOfMonth(year, month, weekDay) {
    var endOfMonth = new TimeStruct(year, month, exports.daysInMonth(year, month));
    var endOfMonthMillis = exports.timeToUnixNoLeapSecs(endOfMonth);
    var endOfMonthWeekDay = exports.weekDayNoLeapSecs(endOfMonthMillis);
    var diff = weekDay - endOfMonthWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    return endOfMonth.day + diff;
}
exports.lastWeekDayOfMonth = lastWeekDayOfMonth;

/**
* Returns the day-of-month that is on the given weekday and which is >= the given day.
* Throws if the month has no such day.
*/
function weekDayOnOrAfter(year, month, day, weekDay) {
    var start = new TimeStruct(year, month, day);
    var startMillis = exports.timeToUnixNoLeapSecs(start);
    var startWeekDay = exports.weekDayNoLeapSecs(startMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    assert(start.day + diff <= exports.daysInMonth(year, month), "The given month has no such weekday");
    return start.day + diff;
}
exports.weekDayOnOrAfter = weekDayOnOrAfter;

/**
* Returns the day-of-month that is on the given weekday and which is <= the given day.
* Throws if the month has no such day.
*/
function weekDayOnOrBefore(year, month, day, weekDay) {
    var start = new TimeStruct(year, month, day);
    var startMillis = exports.timeToUnixNoLeapSecs(start);
    var startWeekDay = exports.weekDayNoLeapSecs(startMillis);
    var diff = weekDay - startWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    assert(start.day + diff >= 1, "The given month has no such weekday");
    return start.day + diff;
}
exports.weekDayOnOrBefore = weekDayOnOrBefore;

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
        return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000 && typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12 && typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1 && this.day <= exports.daysInMonth(this.year, this.month) && typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23 && typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59 && typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 61 && typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0 && this.milli <= 999);
    };

    /**
    * The day-of-year 0-365
    */
    TimeStruct.prototype.yearDay = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return exports.dayOfYear(this.year, this.month, this.day);
    };

    /**
    * Returns this time as a unix millisecond timestamp
    * Does NOT take leap seconds into account.
    */
    TimeStruct.prototype.toUnixNoLeapSecs = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return exports.timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };

    /**
    * Deep equals
    */
    TimeStruct.prototype.equals = function (other) {
        return (this.year === other.year && this.month === other.month && this.day === other.day && this.hour === other.hour && this.minute === other.minute && this.second === other.second && this.milli === other.milli);
    };

    /**
    * < operator
    */
    TimeStruct.prototype.lessThan = function (other) {
        return (this.toUnixNoLeapSecs() < other.toUnixNoLeapSecs());
    };

    TimeStruct.prototype.clone = function () {
        return new TimeStruct(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };

    TimeStruct.prototype.toString = function () {
        return strings.isoString(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };

    TimeStruct.prototype.inspect = function () {
        return "[TimeStruct: " + this.toString() + "]";
    };
    return TimeStruct;
})();
exports.TimeStruct = TimeStruct;

function assertUnixTimestamp(unixMillis) {
    assert(typeof (unixMillis) === "number", "number input expected");
    assert(!isNaN(unixMillis), "NaN not expected as input");
    assert(math.isInt(unixMillis), "integer number expected");
}

/**
* Convert a unix milli timestamp into a TimeT structure.
* This does NOT take leap seconds into account.
*/
function unixToTimeNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);

    var temp = unixMillis;
    var result = new TimeStruct();
    var year;
    var month;

    if (unixMillis >= 0) {
        result.milli = temp % 1000;
        temp = Math.floor(temp / 1000);
        result.second = temp % 60;
        temp = Math.floor(temp / 60);
        result.minute = temp % 60;
        temp = Math.floor(temp / 60);
        result.hour = temp % 24;
        temp = Math.floor(temp / 24);

        year = 1970;
        while (temp >= exports.daysInYear(year)) {
            temp -= exports.daysInYear(year);
            year++;
        }
        result.year = year;

        month = 1;
        while (temp >= exports.daysInMonth(year, month)) {
            temp -= exports.daysInMonth(year, month);
            month++;
        }
        result.month = month;
        result.day = temp + 1;
    } else {
        // Note that a negative number modulo something yields a negative number.
        // We make it positive by adding the modulo.
        result.milli = ((temp % 1000) + 1000) % 1000;
        temp = Math.floor(temp / 1000);
        result.second = ((temp % 60) + 60) % 60;
        temp = Math.floor(temp / 60);
        result.minute = ((temp % 60) + 60) % 60;
        temp = Math.floor(temp / 60);
        result.hour = ((temp % 24) + 24) % 24;
        temp = Math.floor(temp / 24);

        year = 1969;
        while (temp <= -exports.daysInYear(year)) {
            temp += exports.daysInYear(year);
            year--;
        }
        result.year = year;

        month = 12;
        while (temp <= -exports.daysInMonth(year, month)) {
            temp += exports.daysInMonth(year, month);
            month--;
        }
        result.month = month;
        result.day = temp + 1 + exports.daysInMonth(year, month);
    }

    return result;
}
exports.unixToTimeNoLeapSecs = unixToTimeNoLeapSecs;



function timeToUnixNoLeapSecs(a, month, day, hour, minute, second, milli) {
    if (typeof a === "undefined") { a = 0; }
    if (typeof month === "undefined") { month = 1; }
    if (typeof day === "undefined") { day = 1; }
    if (typeof hour === "undefined") { hour = 0; }
    if (typeof minute === "undefined") { minute = 0; }
    if (typeof second === "undefined") { second = 0; }
    if (typeof milli === "undefined") { milli = 0; }
    assert(typeof (a) === "object" || typeof (a) === "number", "Please give either a TimeStruct or a number as first argument.");

    if (typeof (a) === "object") {
        var tm = a;
        assert(tm.validate(), "tm invalid");
        return exports.timeToUnixNoLeapSecs(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli);
    } else {
        var year = a;
        assert(month >= 1 && month <= 12, "Month out of range");
        assert(day >= 1 && day <= exports.daysInMonth(year, month), "day out of range");
        assert(hour >= 0 && hour <= 23, "hour out of range");
        assert(minute >= 0 && minute <= 59, "minute out of range");
        assert(second >= 0 && second <= 59, "second out of range");
        assert(milli >= 0 && milli <= 999, "milli out of range");
        return milli + 1000 * (second + minute * 60 + hour * 3600 + exports.dayOfYear(year, month, day) * 86400 + (year - 1970) * 31536000 + Math.floor((year - 1969) / 4) * 86400 - Math.floor((year - 1901) / 100) * 86400 + Math.floor((year - 1900 + 299) / 400) * 86400);
    }
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
    WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
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
//# sourceMappingURL=basics.js.map
