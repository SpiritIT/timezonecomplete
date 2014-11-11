
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.timezonecomplete = factory();
  }
}(this, function() {
var require = function(name) {
	return {}[name];
};

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
sourcemapsupport.install({ handleUncaughtExceptions: false });

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

var math = require("./math");
var strings = require("./strings");

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
* Approximate number of milliseconds for a time unit.
* A day is assumed to have 24 hours, a month is assumed to equal 30 days
* and a year is set to 365 days.
*
* @param unit	Time unit e.g. TimeUnit.Month
* @returns	The number of milliseconds.
*/
function timeUnitToMilliseconds(unit) {
    switch (unit) {
        case 0 /* Second */:
            return 1000;
        case 1 /* Minute */:
            return 60000;
        case 2 /* Hour */:
            return 3600000;
        case 3 /* Day */:
            return 86400000;
        case 4 /* Week */:
            return 604800000;
        case 5 /* Month */:
            return 2592000000;
        case 6 /* Year */:
            return 31536000000;

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unknown time unit");
            }
    }
}
exports.timeUnitToMilliseconds = timeUnitToMilliseconds;

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
            throw new Error("Invalid month: " + month);
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
* Returns the first instance of the given weekday in the given month
*
* @param year	The year
* @param month	the month 1-12
* @param weekDay	the desired week day
*
* @return the first occurrence of the week day in the month
*/
function firstWeekDayOfMonth(year, month, weekDay) {
    var beginOfMonth = new TimeStruct(year, month, 1);
    var beginOfMonthMillis = exports.timeToUnixNoLeapSecs(beginOfMonth);
    var beginOfMonthWeekDay = exports.weekDayNoLeapSecs(beginOfMonthMillis);
    var diff = weekDay - beginOfMonthWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    return beginOfMonth.day + diff;
}
exports.firstWeekDayOfMonth = firstWeekDayOfMonth;

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
* The week of this month. There is no official standard for this,
* but we assume the same rules for the weekNumber (i.e.
* week 1 is the week that has the 4th day of the month in it)
*
* @param year The year
* @param month The month [1-12]
* @param day The day [1-31]
* @return Week number [1-5]
*/
function weekOfMonth(year, month, day) {
    var firstThursday = exports.firstWeekDayOfMonth(year, month, 4 /* Thursday */);
    var firstMonday = exports.firstWeekDayOfMonth(year, month, 1 /* Monday */);

    // Corner case: check if we are in week 1 or last week of previous month
    if (day < firstMonday) {
        if (firstThursday < firstMonday) {
            // Week 1
            return 1;
        } else {
            // Last week of previous month
            if (month > 1) {
                // Default case
                return exports.weekOfMonth(year, month - 1, 31);
            } else {
                // January
                return exports.weekOfMonth(year - 1, 12, 31);
            }
        }
    }

    var lastMonday = exports.lastWeekDayOfMonth(year, month, 1 /* Monday */);
    var lastThursday = exports.lastWeekDayOfMonth(year, month, 4 /* Thursday */);

    // Corner case: check if we are in last week or week 1 of previous month
    if (day >= lastMonday) {
        if (lastMonday > lastThursday) {
            // Week 1 of next month
            return 1;
        }
    }

    // Normal case
    var result = Math.floor((day - firstMonday) / 7) + 1;
    if (firstThursday < 4) {
        result += 1;
    }

    return result;
}
exports.weekOfMonth = weekOfMonth;

/**
* Returns the day-of-year of the Monday of week 1 in the given year.
* Note that the result may lie in the previous year, in which case it
* will be (much) greater than 4
*/
function getWeekOneDayOfYear(year) {
    // first monday of January, minus one because we want day-of-year
    var result = exports.weekDayOnOrAfter(year, 1, 1, 1 /* Monday */) - 1;
    if (result > 3) {
        result -= 7;
        if (result < 0) {
            result += exports.daysInYear(year - 1);
        }
    }
    return result;
}

/**
* The ISO 8601 week number for the given date. Week 1 is the week
* that has January 4th in it, and it starts on Monday.
* See https://en.wikipedia.org/wiki/ISO_week_date
*
* @param year	Year e.g. 1988
* @param month	Month 1-12
* @param day	Day of month 1-31
*
* @return Week number 1-53
*/
function weekNumber(year, month, day) {
    var doy = exports.dayOfYear(year, month, day);

    // check end-of-year corner case: may be week 1 of next year
    if (doy >= exports.dayOfYear(year, 12, 29)) {
        var nextYearWeekOne = getWeekOneDayOfYear(year + 1);
        if (nextYearWeekOne > 4 && nextYearWeekOne <= doy) {
            return 1;
        }
    }

    // check beginning-of-year corner case
    var thisYearWeekOne = getWeekOneDayOfYear(year);
    if (thisYearWeekOne > 4) {
        // week 1 is at end of last year
        var weekTwo = thisYearWeekOne + 7 - exports.daysInYear(year - 1);
        if (doy < weekTwo) {
            return 1;
        } else {
            return Math.floor((doy - weekTwo) / 7) + 2;
        }
    }

    // Week 1 is entirely inside this year.
    if (doy < thisYearWeekOne) {
        // The date is part of the last week of prev year.
        return exports.weekNumber(year - 1, 12, 31);
    }

    // normal cases; note that week numbers start from 1 so +1
    return Math.floor((doy - thisYearWeekOne) / 7) + 1;
}
exports.weekNumber = weekNumber;

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
        result.milli = math.positiveModulo(temp, 1000);
        temp = Math.floor(temp / 1000);
        result.second = math.positiveModulo(temp, 60);
        temp = Math.floor(temp / 60);
        result.minute = math.positiveModulo(temp, 60);
        temp = Math.floor(temp / 60);
        result.hour = math.positiveModulo(temp, 24);
        temp = Math.floor(temp / 24);

        year = 1969;
        while (temp < -exports.daysInYear(year)) {
            temp += exports.daysInYear(year);
            year--;
        }
        result.year = year;

        month = 12;
        while (temp < -exports.daysInMonth(year, month)) {
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
    if (typeof a === "undefined") { a = 1970; }
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

/**
* N-th second in the day, counting from 0
*/
function secondOfDay(hour, minute, second) {
    return (((hour * 60) + minute) * 60) + second;
}
exports.secondOfDay = secondOfDay;

/**
* Basic representation of a date and time
*/
var TimeStruct = (function () {
    /**
    * Constructor
    *
    * @param year	Year e.g. 1970
    * @param month	Month 1-12
    * @param day	Day 1-31
    * @param hour	Hour 0-23
    * @param minute	Minute 0-59
    * @param second	Second 0-59 (no leap seconds)
    * @param milli	Millisecond 0-999
    */
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
    * Seconds, 0-59
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
        assert(this.validate(), "Invalid arguments: " + this.toString());
    }
    /**
    * Create a TimeStruct from a number of unix milliseconds
    */
    TimeStruct.fromUnix = function (unixMillis) {
        return exports.unixToTimeNoLeapSecs(unixMillis);
    };

    /**
    * Create a TimeStruct from a JavaScript date
    *
    * @param d	The date
    * @param df	Which functions to take (getX() or getUTCX())
    */
    TimeStruct.fromDate = function (d, df) {
        if (df === 0 /* Get */) {
            return new TimeStruct(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
        } else {
            return new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        }
    };

    /**
    * Returns a TimeStruct from an ISO 8601 string WITHOUT time zone
    */
    TimeStruct.fromString = function (s) {
        try  {
            var year = 1970;
            var month = 1;
            var day = 1;
            var hour = 0;
            var minute = 0;
            var second = 0;
            var fractionMillis = 0;
            var lastUnit = 6 /* Year */;

            // separate any fractional part
            var split = s.trim().split(".");
            assert(split.length >= 1 && split.length <= 2, "Empty string or multiple dots.");

            // parse main part
            var isBasicFormat = (s.indexOf("-") === -1);
            if (isBasicFormat) {
                assert(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "ISO string in basic notation may only contain numbers before the fractional part");

                // remove any "T" separator
                split[0] = split[0].replace("T", "");

                assert([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");

                if (split[0].length >= 4) {
                    year = parseInt(split[0].substr(0, 4), 10);
                    lastUnit = 6 /* Year */;
                }
                if (split[0].length >= 8) {
                    month = parseInt(split[0].substr(4, 2), 10);
                    day = parseInt(split[0].substr(6, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 3 /* Day */;
                }
                if (split[0].length >= 10) {
                    hour = parseInt(split[0].substr(8, 2), 10);
                    lastUnit = 2 /* Hour */;
                }
                if (split[0].length >= 12) {
                    minute = parseInt(split[0].substr(10, 2), 10);
                    lastUnit = 1 /* Minute */;
                }
                if (split[0].length >= 14) {
                    second = parseInt(split[0].substr(12, 2), 10);
                    lastUnit = 0 /* Second */;
                }
            } else {
                assert(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Invalid ISO string");
                var dateAndTime = [];
                if (s.indexOf("T") !== -1) {
                    dateAndTime = split[0].split("T");
                } else if (s.length > 10) {
                    dateAndTime = [split[0].substr(0, 10), split[0].substr(10)];
                } else {
                    dateAndTime = [split[0], ""];
                }
                assert([4, 10].indexOf(dateAndTime[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");

                if (dateAndTime[0].length >= 4) {
                    year = parseInt(dateAndTime[0].substr(0, 4), 10);
                    lastUnit = 6 /* Year */;
                }
                if (dateAndTime[0].length >= 10) {
                    month = parseInt(dateAndTime[0].substr(5, 2), 10);
                    day = parseInt(dateAndTime[0].substr(8, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 3 /* Day */;
                }
                if (dateAndTime[1].length >= 2) {
                    hour = parseInt(dateAndTime[1].substr(0, 2), 10);
                    lastUnit = 2 /* Hour */;
                }
                if (dateAndTime[1].length >= 5) {
                    minute = parseInt(dateAndTime[1].substr(3, 2), 10);
                    lastUnit = 1 /* Minute */;
                }
                if (dateAndTime[1].length >= 8) {
                    second = parseInt(dateAndTime[1].substr(6, 2), 10);
                    lastUnit = 0 /* Second */;
                }
            }

            // parse fractional part
            if (split.length > 1 && split[1].length > 0) {
                var fraction = parseFloat("0." + split[1]);
                switch (lastUnit) {
                    case 6 /* Year */:
                         {
                            fractionMillis = exports.daysInYear(year) * 86400000 * fraction;
                        }
                        break;
                    case 3 /* Day */:
                         {
                            fractionMillis = 86400000 * fraction;
                        }
                        break;
                    case 2 /* Hour */:
                         {
                            fractionMillis = 3600000 * fraction;
                        }
                        break;
                    case 1 /* Minute */:
                         {
                            fractionMillis = 60000 * fraction;
                        }
                        break;
                    case 0 /* Second */:
                         {
                            fractionMillis = 1000 * fraction;
                        }
                        break;
                }
            }

            // combine main and fractional part
            var unixMillis = exports.timeToUnixNoLeapSecs(year, month, day, hour, minute, second);
            unixMillis = Math.floor(unixMillis + fractionMillis);
            return exports.unixToTimeNoLeapSecs(unixMillis);
        } catch (e) {
            throw new Error("Invalid ISO 8601 string: \"" + s + "\": " + e.message);
        }
    };

    /**
    * Validate a TimeStruct, returns false if invalid.
    */
    TimeStruct.prototype.validate = function () {
        return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000 && typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12 && typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1 && this.day <= exports.daysInMonth(this.year, this.month) && typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23 && typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59 && typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 59 && typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0 && this.milli <= 999);
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

    TimeStruct.prototype.valueOf = function () {
        return exports.timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };

    /**
    * ISO 8601 string YYYY-MM-DDThh:mm:ss.nnn
    */
    TimeStruct.prototype.toString = function () {
        return strings.padLeft(this.year.toString(10), 4, "0") + "-" + strings.padLeft(this.month.toString(10), 2, "0") + "-" + strings.padLeft(this.day.toString(10), 2, "0") + "T" + strings.padLeft(this.hour.toString(10), 2, "0") + ":" + strings.padLeft(this.minute.toString(10), 2, "0") + ":" + strings.padLeft(this.second.toString(10), 2, "0") + "." + strings.padLeft(this.milli.toString(10), 3, "0");
    };

    TimeStruct.prototype.inspect = function () {
        return "[TimeStruct: " + this.toString() + "]";
    };
    return TimeStruct;
})();
exports.TimeStruct = TimeStruct;
//# sourceMappingURL=basics.js.map

},{"./javascript":9,"./math":10,"./strings":12,"assert":19,"source-map-support":38}],2:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Date+time+timezone representation
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var basics = require("./basics");

var TimeStruct = basics.TimeStruct;
var TimeUnit = basics.TimeUnit;

var duration = require("./duration");
var Duration = duration.Duration;

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

var timesource = require("./timesource");

var RealTimeSource = timesource.RealTimeSource;

var timezone = require("./timezone");
var NormalizeOption = timezone.NormalizeOption;
var TimeZone = timezone.TimeZone;
var TimeZoneKind = timezone.TimeZoneKind;

var format = require("./format");

/**
* DateTime class which is time zone-aware
* and which can be mocked for testing purposes.
*/
var DateTime = (function () {
    /**
    * Constructor implementation, do not call
    */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
        /**
        * Cached value for unixUtcMillis(). This is useful because valueOf() uses it and it is
        * likely to be called multiple times.
        */
        this._unixUtcMillisCache = null;
        switch (typeof (a1)) {
            case "number":
                 {
                    if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
                        // unix timestamp constructor
                        assert(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
                        this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? a2 : null);
                        var normalizedUnixTimestamp;
                        if (this._zone) {
                            normalizedUnixTimestamp = this._zone.normalizeZoneTime(a1);
                        } else {
                            normalizedUnixTimestamp = a1;
                        }
                        this._zoneDate = TimeStruct.fromUnix(normalizedUnixTimestamp);
                        this._zoneDateToUtcDate();
                    } else {
                        // year month day constructor
                        assert(typeof (a1) === "number", "DateTime.DateTime(): Expect year to be a number.");
                        assert(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
                        assert(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
                        var year = a1;
                        var month = a2;
                        var day = a3;
                        var hour = (typeof (h) === "number" ? h : 0);
                        var minute = (typeof (m) === "number" ? m : 0);
                        var second = (typeof (s) === "number" ? s : 0);
                        var millisecond = (typeof (ms) === "number" ? ms : 0);
                        assert(month > 0 && month < 13, "DateTime.DateTime(): month out of range.");
                        assert(day > 0 && day < 32, "DateTime.DateTime(): day out of range.");
                        assert(hour >= 0 && hour < 24, "DateTime.DateTime(): hour out of range.");
                        assert(minute >= 0 && minute < 60, "DateTime.DateTime(): minute out of range.");
                        assert(second >= 0 && second < 60, "DateTime.DateTime(): second out of range.");
                        assert(millisecond >= 0 && millisecond < 1000, "DateTime.DateTime(): millisecond out of range.");

                        this._zone = (typeof (timeZone) === "object" && timeZone instanceof TimeZone ? timeZone : null);

                        // normalize local time (remove non-existing local time)
                        if (this._zone) {
                            var localMillis = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
                            this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(localMillis));
                        } else {
                            this._zoneDate = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                        }
                        this._zoneDateToUtcDate();
                    }
                }
                break;
            case "string":
                 {
                    var givenString = a1.trim();
                    var ss = DateTime._splitDateFromTimeZone(givenString);
                    assert(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                    if (a2 instanceof TimeZone) {
                        this._zone = (a2);
                    } else {
                        this._zone = TimeZone.zone(ss[1]);
                    }

                    // use our own ISO parsing because that it platform independent
                    // (free of Date quirks)
                    this._zoneDate = TimeStruct.fromString(ss[0]);
                    if (this._zone) {
                        this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
                    }
                    this._zoneDateToUtcDate();
                }
                break;
            case "object":
                 {
                    assert(a1 instanceof Date, "DateTime.DateTime(): non-Date object passed as first argument");
                    assert(typeof (a2) === "number", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                    assert(!a3 || a3 instanceof TimeZone, "DateTime.DateTime(): timeZone should be a TimeZone object.");
                    var d = (a1);
                    var dk = (a2);
                    this._zone = (a3 ? a3 : null);
                    this._zoneDate = TimeStruct.fromDate(d, dk);
                    if (this._zone) {
                        this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
                    }
                    this._zoneDateToUtcDate();
                }
                break;
            case "undefined":
                 {
                    // nothing given, make local datetime
                    this._zone = TimeZone.local();
                    this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), 1 /* GetUTC */);
                    this._utcDateToZoneDate();
                }
                break;

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("DateTime.DateTime(): unexpected first argument type.");
                }
        }
    }
    /**
    * Current date+time in local time (derived from DateTime.timeSource.now()).
    */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, 0 /* Get */, TimeZone.local());
    };

    /**
    * Current date+time in UTC time (derived from DateTime.timeSource.now()).
    */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc());
    };

    /**
    * Current date+time in the given time zone (derived from DateTime.timeSource.now()).
    * @param timeZone	The desired time zone.
    */
    DateTime.now = function (timeZone) {
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc()).toZone(timeZone);
    };

    /**
    * @return a copy of this object
    */
    DateTime.prototype.clone = function () {
        var result = new DateTime();
        result._utcDate = this._utcDate.clone();
        result._zoneDate = this._zoneDate.clone();
        result._unixUtcMillisCache = this._unixUtcMillisCache;
        result._zone = this._zone;
        return result;
    };

    /**
    * @return The time zone that the date is in. May be null for unaware dates.
    */
    DateTime.prototype.zone = function () {
        return this._zone;
    };

    /**
    * Zone name abbreviation at this time
    * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
    * @return The abbreviation
    */
    DateTime.prototype.zoneAbbreviation = function (dstDependent) {
        if (typeof dstDependent === "undefined") { dstDependent = true; }
        if (this.zone()) {
            return this.zone().abbreviationForUtc(this.utcYear(), this.utcMonth(), this.utcDay(), this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond(), dstDependent);
        } else {
            return "";
        }
    };

    /**
    * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
    */
    DateTime.prototype.offset = function () {
        return Math.round((this._zoneDate.toUnixNoLeapSecs() - this._utcDate.toUnixNoLeapSecs()) / 60000);
    };

    /**
    * @return The full year e.g. 2014
    */
    DateTime.prototype.year = function () {
        return this._zoneDate.year;
    };

    /**
    * @return The month 1-12 (note this deviates from JavaScript Date)
    */
    DateTime.prototype.month = function () {
        return this._zoneDate.month;
    };

    /**
    * @return The day of the month 1-31
    */
    DateTime.prototype.day = function () {
        return this._zoneDate.day;
    };

    /**
    * @return The hour 0-23
    */
    DateTime.prototype.hour = function () {
        return this._zoneDate.hour;
    };

    /**
    * @return the minutes 0-59
    */
    DateTime.prototype.minute = function () {
        return this._zoneDate.minute;
    };

    /**
    * @return the seconds 0-59
    */
    DateTime.prototype.second = function () {
        return this._zoneDate.second;
    };

    /**
    * @return the milliseconds 0-999
    */
    DateTime.prototype.millisecond = function () {
        return this._zoneDate.milli;
    };

    /**
    * @return the day-of-week (the enum values correspond to JavaScript
    * week day numbers)
    */
    DateTime.prototype.weekDay = function () {
        return basics.weekDayNoLeapSecs(this._zoneDate.toUnixNoLeapSecs());
    };

    /**
    * Returns the day number within the year: Jan 1st has number 0,
    * Jan 2nd has number 1 etc.
    *
    * @return the day-of-year [0-366]
    */
    DateTime.prototype.dayOfYear = function () {
        return basics.dayOfYear(this.year(), this.month(), this.day());
    };

    /**
    * The ISO 8601 week number. Week 1 is the week
    * that has January 4th in it, and it starts on Monday.
    * See https://en.wikipedia.org/wiki/ISO_week_date
    *
    * @return Week number [1-53]
    */
    DateTime.prototype.weekNumber = function () {
        return basics.weekNumber(this.year(), this.month(), this.day());
    };

    /**
    * The week of this month. There is no official standard for this,
    * but we assume the same rules for the weekNumber (i.e.
    * week 1 is the week that has the 4th day of the month in it)
    *
    * @return Week number [1-5]
    */
    DateTime.prototype.weekOfMonth = function () {
        return basics.weekOfMonth(this.year(), this.month(), this.day());
    };

    /**
    * Returns the number of seconds that have passed on the current day
    * Does not consider leap seconds
    *
    * @return seconds [0-86399]
    */
    DateTime.prototype.secondOfDay = function () {
        return basics.secondOfDay(this.hour(), this.minute(), this.second());
    };

    /**
    * @return Milliseconds since 1970-01-01T00:00:00.000Z
    */
    DateTime.prototype.unixUtcMillis = function () {
        if (this._unixUtcMillisCache === null) {
            this._unixUtcMillisCache = this._utcDate.toUnixNoLeapSecs();
        }
        return this._unixUtcMillisCache;
    };

    /**
    * @return The full year e.g. 2014
    */
    DateTime.prototype.utcYear = function () {
        return this._utcDate.year;
    };

    /**
    * @return The UTC month 1-12 (note this deviates from JavaScript Date)
    */
    DateTime.prototype.utcMonth = function () {
        return this._utcDate.month;
    };

    /**
    * @return The UTC day of the month 1-31
    */
    DateTime.prototype.utcDay = function () {
        return this._utcDate.day;
    };

    /**
    * @return The UTC hour 0-23
    */
    DateTime.prototype.utcHour = function () {
        return this._utcDate.hour;
    };

    /**
    * @return The UTC minutes 0-59
    */
    DateTime.prototype.utcMinute = function () {
        return this._utcDate.minute;
    };

    /**
    * @return The UTC seconds 0-59
    */
    DateTime.prototype.utcSecond = function () {
        return this._utcDate.second;
    };

    /**
    * Returns the UTC day number within the year: Jan 1st has number 0,
    * Jan 2nd has number 1 etc.
    *
    * @return the day-of-year [0-366]
    */
    DateTime.prototype.utcDayOfYear = function () {
        return basics.dayOfYear(this.utcYear(), this.utcMonth(), this.utcDay());
    };

    /**
    * @return The UTC milliseconds 0-999
    */
    DateTime.prototype.utcMillisecond = function () {
        return this._utcDate.milli;
    };

    /**
    * @return the UTC day-of-week (the enum values correspond to JavaScript
    * week day numbers)
    */
    DateTime.prototype.utcWeekDay = function () {
        return basics.weekDayNoLeapSecs(this._utcDate.toUnixNoLeapSecs());
    };

    /**
    * The ISO 8601 UTC week number. Week 1 is the week
    * that has January 4th in it, and it starts on Monday.
    * See https://en.wikipedia.org/wiki/ISO_week_date
    *
    * @return Week number [1-53]
    */
    DateTime.prototype.utcWeekNumber = function () {
        return basics.weekNumber(this.utcYear(), this.utcMonth(), this.utcDay());
    };

    /**
    * The week of this month. There is no official standard for this,
    * but we assume the same rules for the weekNumber (i.e.
    * week 1 is the week that has the 4th day of the month in it)
    *
    * @return Week number [1-5]
    */
    DateTime.prototype.utcWeekOfMonth = function () {
        return basics.weekOfMonth(this.utcYear(), this.utcMonth(), this.utcDay());
    };

    /**
    * Returns the number of seconds that have passed on the current day
    * Does not consider leap seconds
    *
    * @return seconds [0-86399]
    */
    DateTime.prototype.utcSecondOfDay = function () {
        return basics.secondOfDay(this.utcHour(), this.utcMinute(), this.utcSecond());
    };

    /**
    * Convert this date to the given time zone (in-place).
    * Throws if this date does not have a time zone.
    * @return this (for chaining)
    */
    DateTime.prototype.convert = function (zone) {
        if (zone) {
            assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            if (this._zone.equals(zone)) {
                this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
            } else {
                this._zone = zone;
                this._utcDateToZoneDate();
            }
        } else {
            this._zone = null;
            this._utcDate = this._zoneDate.clone();
            this._unixUtcMillisCache = null;
        }
        return this;
    };

    /**
    * Returns this date converted to the given time zone.
    * Unaware dates can only be converted to unaware dates (clone)
    * Converting an unaware date to an aware date throws an exception. Use the constructor
    * if you really need to do that.
    *
    * @param zone	The new time zone. This may be null to create unaware date.
    * @return The converted date
    */
    DateTime.prototype.toZone = function (zone) {
        if (zone) {
            assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");

            // go from utc date to preserve it in the presence of DST
            var result = this.clone();
            result._zone = zone;
            if (!result._zone.equals(this._zone)) {
                result._utcDateToZoneDate();
            }
            return result;
        } else {
            return new DateTime(this._zoneDate.toUnixNoLeapSecs(), null);
        }
    };

    /**
    * Convert to JavaScript date with the zone time in the getX() methods.
    * Unless the timezone is local, the Date.getUTCX() methods will NOT be correct.
    * This is because Date calculates getUTCX() from getX() applying local time zone.
    */
    DateTime.prototype.toDate = function () {
        return new Date(this.year(), this.month() - 1, this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
    };

    /**
    * Implementation.
    */
    DateTime.prototype.add = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            var newMillis = this._utcDate.toUnixNoLeapSecs() + duration.milliseconds();
            if (this._zone) {
                var tm = TimeStruct.fromUnix(newMillis);
                newMillis += this._zone.offsetForUtc(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli) * 60000;
            }
            return new DateTime(newMillis, this.zone());
        } else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            var utcTm = this._addToTimeStruct(this._utcDate, amount, unit);
            return new DateTime(utcTm.toUnixNoLeapSecs(), TimeZone.utc()).toZone(this._zone);
        }
    };

    /**
    * Add an amount of time to the zone time, as regularly as possible.
    *
    * Adding e.g. 1 hour will increment the hour() field of the zone
    * date by one. In case of DST changes, the time fields may additionally
    * increase by the DST offset, if a non-existing local time would
    * be reached otherwise.
    *
    * Adding a unit of time will leave lower-unit fields intact, unless the result
    * would be a non-existing time. Then an extra DST offset is added.
    *
    * Note adding Months or Years will clamp the date to the end-of-month if
    * the start date was at the end of a month, i.e. contrary to JavaScript
    * Date#setUTCMonth() it will not overflow into the next month
    */
    DateTime.prototype.addLocal = function (amount, unit) {
        var localTm = this._addToTimeStruct(this._zoneDate, amount, unit);
        if (this._zone) {
            var direction = (amount >= 0 ? 0 /* Up */ : 1 /* Down */);
            var normalized = this._zone.normalizeZoneTime(localTm.toUnixNoLeapSecs(), direction);
            return new DateTime(normalized, this._zone);
        } else {
            return new DateTime(localTm.toUnixNoLeapSecs(), null);
        }
    };

    /**
    * Add an amount of time to the given time struct. Note: does not normalize.
    * Keeps lower unit fields the same where possible, clamps day to end-of-month if
    * necessary.
    */
    DateTime.prototype._addToTimeStruct = function (tm, amount, unit) {
        var targetYear;
        var targetMonth;
        var targetDay;
        var targetHours;
        var targetMinutes;
        var targetSeconds;
        var targetMilliseconds;

        switch (unit) {
            case 0 /* Second */: {
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 1000);
            }
            case 1 /* Minute */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 60000);
            }
            case 2 /* Hour */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 3600000);
            }
            case 3 /* Day */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 86400000);
            }
            case 4 /* Week */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 7 * 86400000);
            }
            case 5 /* Month */: {
                // keep the day-of-month the same (clamp to end-of-month)
                targetYear = amount >= 0 ? (tm.year + Math.floor((tm.month - 1 + amount) / 12)) : (tm.year + Math.ceil((tm.month - 1 + amount) / 12));
                targetMonth = 1 + (amount >= 0 ? Math.floor((tm.month - 1 + amount) % 12) : Math.ceil((tm.month - 1 + amount) % 12));
                targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
                targetHours = tm.hour;
                targetMinutes = tm.minute;
                targetSeconds = tm.second;
                targetMilliseconds = tm.milli;
                return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
            }
            case 6 /* Year */: {
                targetYear = tm.year + amount;
                targetMonth = tm.month;
                targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
                targetHours = tm.hour;
                targetMinutes = tm.minute;
                targetSeconds = tm.second;
                targetMilliseconds = tm.milli;
                return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };

    DateTime.prototype.sub = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            return this.add(duration.multiply(-1));
        } else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            return this.add(-1 * amount, unit);
        }
    };

    /**
    * Same as addLocal(-1*amount, unit);
    */
    DateTime.prototype.subLocal = function (amount, unit) {
        return this.addLocal(-1 * amount, unit);
    };

    /**
    * Time difference between two DateTimes
    * @return this - other
    */
    DateTime.prototype.diff = function (other) {
        return new Duration(this._utcDate.toUnixNoLeapSecs() - other._utcDate.toUnixNoLeapSecs());
    };

    /**
    * @return True iff (this < other)
    */
    DateTime.prototype.lessThan = function (other) {
        return this._utcDate.toUnixNoLeapSecs() < other._utcDate.toUnixNoLeapSecs();
    };

    /**
    * @return True iff (this <= other)
    */
    DateTime.prototype.lessEqual = function (other) {
        return this._utcDate.toUnixNoLeapSecs() <= other._utcDate.toUnixNoLeapSecs();
    };

    /**
    * @return True iff this and other represent the same time in UTC
    */
    DateTime.prototype.equals = function (other) {
        return this._utcDate.equals(other._utcDate);
    };

    /**
    * @return True iff this and other represent the same time and
    * have the same zone
    */
    DateTime.prototype.identical = function (other) {
        return (this._zoneDate.equals(other._zoneDate) && (this._zone === null) === (other._zone === null) && (this._zone === null || this._zone.equals(other._zone)));
    };

    /**
    * @return True iff this > other
    */
    DateTime.prototype.greaterThan = function (other) {
        return this._utcDate.toUnixNoLeapSecs() > other._utcDate.toUnixNoLeapSecs();
    };

    /**
    * @return True iff this >= other
    */
    DateTime.prototype.greaterEqual = function (other) {
        return this._utcDate.toUnixNoLeapSecs() >= other._utcDate.toUnixNoLeapSecs();
    };

    /**
    * @return The minimum of this and other
    */
    DateTime.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };

    /**
    * @return The maximum of this and other
    */
    DateTime.prototype.max = function (other) {
        if (this.greaterThan(other)) {
            return this.clone();
        }
        return other.clone();
    };

    /**
    * Proper ISO 8601 format string with any IANA zone converted to ISO offset
    * E.g. "2014-01-01T23:15:33+01:00" for Europe/Amsterdam
    */
    DateTime.prototype.toIsoString = function () {
        var s = this._zoneDate.toString();
        if (this._zone) {
            return s + TimeZone.offsetToString(this.offset());
        } else {
            return s;
        }
    };

    /**
    * Return a string representation of the DateTime according to the
    * specified format. The format is implemented as the LDML standard
    * (http://unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns)
    *
    * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
    * @return The string representation of this DateTime
    */
    DateTime.prototype.format = function (formatString) {
        return format.format(this._zoneDate, this._utcDate, this.zone(), formatString);
    };

    /**
    * Modified ISO 8601 format string with IANA name if applicable.
    * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
    */
    DateTime.prototype.toString = function () {
        var s = this._zoneDate.toString();
        if (this._zone) {
            if (this._zone.kind() !== 1 /* Offset */) {
                return s + " " + this._zone.toString();
            } else {
                return s + this._zone.toString();
            }
        } else {
            return s;
        }
    };

    /**
    * Used by util.inspect()
    */
    DateTime.prototype.inspect = function () {
        return "[DateTime: " + this.toString() + "]";
    };

    /**
    * The valueOf() method returns the primitive value of the specified object.
    */
    DateTime.prototype.valueOf = function () {
        return this.unixUtcMillis();
    };

    /**
    * Modified ISO 8601 format string in UTC without time zone info
    */
    DateTime.prototype.toUtcString = function () {
        return this._utcDate.toString();
    };

    /**
    * Calculate this._zoneDate from this._utcDate
    */
    DateTime.prototype._utcDateToZoneDate = function () {
        this._unixUtcMillisCache = null;

        /* istanbul ignore else */
        if (this._zone) {
            var offset = this._zone.offsetForUtc(this._utcDate.year, this._utcDate.month, this._utcDate.day, this._utcDate.hour, this._utcDate.minute, this._utcDate.second, this._utcDate.milli);
            this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._utcDate.toUnixNoLeapSecs() + offset * 60000));
        } else {
            this._zoneDate = this._utcDate.clone();
        }
    };

    /**
    * Calculate this._utcDate from this._zoneDate
    */
    DateTime.prototype._zoneDateToUtcDate = function () {
        this._unixUtcMillisCache = null;
        if (this._zone) {
            var offset = this._zone.offsetForZone(this._zoneDate.year, this._zoneDate.month, this._zoneDate.day, this._zoneDate.hour, this._zoneDate.minute, this._zoneDate.second, this._zoneDate.milli);
            this._utcDate = TimeStruct.fromUnix(this._zoneDate.toUnixNoLeapSecs() - offset * 60000);
        } else {
            this._utcDate = this._zoneDate.clone();
        }
    };

    /**
    * Split a combined ISO datetime and timezone into datetime and timezone
    */
    DateTime._splitDateFromTimeZone = function (s) {
        var trimmed = s.trim();
        var result = ["", ""];
        var index = trimmed.lastIndexOf(" ");
        if (index > -1) {
            result[0] = trimmed.substr(0, index);
            result[1] = trimmed.substr(index + 1);
            return result;
        }
        index = trimmed.lastIndexOf("Z");
        if (index > -1) {
            result[0] = trimmed.substr(0, index);
            result[1] = trimmed.substr(index, 1);
            return result;
        }
        index = trimmed.lastIndexOf("+");
        if (index > -1) {
            result[0] = trimmed.substr(0, index);
            result[1] = trimmed.substr(index);
            return result;
        }
        index = trimmed.lastIndexOf("-");
        if (index < 8) {
            index = -1; // any "-" we found was a date separator
        }
        if (index > -1) {
            result[0] = trimmed.substr(0, index);
            result[1] = trimmed.substr(index);
            return result;
        }
        result[0] = trimmed;
        return result;
    };
    DateTime.timeSource = new RealTimeSource();
    return DateTime;
})();
exports.DateTime = DateTime;
//# sourceMappingURL=datetime.js.map

},{"./basics":1,"./duration":3,"./format":5,"./javascript":9,"./timesource":13,"./timezone":15,"assert":19,"source-map-support":38}],3:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Time duration
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var basics = require("./basics");

var strings = require("./strings");

/**
* Time duration. Create one e.g. like this: var d = Duration.hours(1).
* Note that time durations do not take leap seconds etc. into account:
* one hour is simply represented as 3600000 milliseconds.
*/
var Duration = (function () {
    /**
    * Constructor implementation
    */
    function Duration(i1, unit) {
        if (typeof (i1) === "number") {
            if (typeof (unit) === "number") {
                this._milliseconds = Math.round(Math.abs(basics.timeUnitToMilliseconds(unit) * i1));
                this._sign = (i1 < 0 ? -1 : 1);
            } else {
                this._milliseconds = Math.round(Math.abs(i1));
                this._sign = (i1 < 0 ? -1 : 1);
            }
        } else {
            if (typeof (i1) === "string") {
                this._fromString(i1);
            } else {
                this._milliseconds = 0;
                this._sign = 1;
            }
        }
    }
    /**
    * Construct a time duration
    * @param n	Number of hours
    * @return A duration of n hours
    */
    Duration.hours = function (n) {
        return new Duration(n * 3600000);
    };

    /**
    * Construct a time duration
    * @param n	Number of minutes
    * @return A duration of n minutes
    */
    Duration.minutes = function (n) {
        return new Duration(n * 60000);
    };

    /**
    * Construct a time duration
    * @param n	Number of seconds
    * @return A duration of n seconds
    */
    Duration.seconds = function (n) {
        return new Duration(n * 1000);
    };

    /**
    * Construct a time duration
    * @param n	Number of milliseconds
    * @return A duration of n milliseconds
    */
    Duration.milliseconds = function (n) {
        return new Duration(n);
    };

    /**
    * @return another instance of Duration with the same value.
    */
    Duration.prototype.clone = function () {
        return Duration.milliseconds(this.milliseconds());
    };

    /**
    * The entire duration in milliseconds (negative or positive)
    */
    Duration.prototype.milliseconds = function () {
        return this._sign * this._milliseconds;
    };

    /**
    * The millisecond part of the duration (always positive)
    * @return e.g. 400 for a -01:02:03.400 duration
    */
    Duration.prototype.millisecond = function () {
        return this._milliseconds % 1000;
    };

    /**
    * The entire duration in seconds (negative or positive, fractional)
    * @return e.g. 1.5 for a 1500 milliseconds duration
    */
    Duration.prototype.seconds = function () {
        return this._sign * this._milliseconds / 1000;
    };

    /**
    * The second part of the duration (always positive)
    * @return e.g. 3 for a -01:02:03.400 duration
    */
    Duration.prototype.second = function () {
        return Math.floor(this._milliseconds / 1000) % 60;
    };

    /**
    * The entire duration in minutes (negative or positive, fractional)
    * @return e.g. 1.5 for a 90000 milliseconds duration
    */
    Duration.prototype.minutes = function () {
        return this._sign * this._milliseconds / 60000;
    };

    /**
    * The minute part of the duration (always positive)
    * @return e.g. 2 for a -01:02:03.400 duration
    */
    Duration.prototype.minute = function () {
        return Math.floor(this._milliseconds / 60000) % 60;
    };

    /**
    * The entire duration in hours (negative or positive, fractional)
    * @return e.g. 1.5 for a 5400000 milliseconds duration
    */
    Duration.prototype.hours = function () {
        return this._sign * this._milliseconds / 3600000;
    };

    /**
    * The hour part of the duration (always positive).
    * Note that this part can exceed 23 hours, because for
    * now, we do not have a days() function
    * @return e.g. 25 for a -25:02:03.400 duration
    */
    Duration.prototype.wholeHours = function () {
        return Math.floor(this._milliseconds / 3600000);
    };

    // note there is no hour() method as that would only make sense if we
    // also had a days() method.
    /**
    * Sign
    * @return "-" if the duration is negative
    */
    Duration.prototype.sign = function () {
        return (this._sign < 0 ? "-" : "");
    };

    /**
    * @return True iff (this < other)
    */
    Duration.prototype.lessThan = function (other) {
        return this.milliseconds() < other.milliseconds();
    };

    /**
    * @return True iff (this <= other)
    */
    Duration.prototype.lessEqual = function (other) {
        return this.milliseconds() <= other.milliseconds();
    };

    /**
    * @return True iff this and other represent the same time duration
    */
    Duration.prototype.equals = function (other) {
        return this.milliseconds() === other.milliseconds();
    };

    /**
    * @return True iff this > other
    */
    Duration.prototype.greaterThan = function (other) {
        return this.milliseconds() > other.milliseconds();
    };

    /**
    * @return True iff this >= other
    */
    Duration.prototype.greaterEqual = function (other) {
        return this.milliseconds() >= other.milliseconds();
    };

    /**
    * @return The minimum (most negative) of this and other
    */
    Duration.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };

    /**
    * @return The maximum (most positive) of this and other
    */
    Duration.prototype.max = function (other) {
        if (this.greaterThan(other)) {
            return this.clone();
        }
        return other.clone();
    };

    /**
    * Multiply with a fixed number.
    * @return a new Duration of (this * value)
    */
    Duration.prototype.multiply = function (value) {
        return new Duration(this.milliseconds() * value);
    };

    /**
    * Divide by a fixed number.
    * @return a new Duration of (this / value)
    */
    Duration.prototype.divide = function (value) {
        if (value === 0) {
            throw new Error("Duration.divide(): Divide by zero");
        }
        return new Duration(this.milliseconds() / value);
    };

    /**
    * Add a duration.
    * @return a new Duration of (this + value)
    */
    Duration.prototype.add = function (value) {
        return new Duration(this.milliseconds() + value.milliseconds());
    };

    /**
    * Subtract a duration.
    * @return a new Duration of (this - value)
    */
    Duration.prototype.sub = function (value) {
        return new Duration(this.milliseconds() - value.milliseconds());
    };

    /**
    * String in [-]hh:mm:ss.nnn notation. All fields are
    * always present except the sign.
    */
    Duration.prototype.toFullString = function () {
        return this._toString(true);
    };

    /**
    * String in [-]hh[:mm[:ss[.nnn]]] notation. Fields are
    * added as necessary
    */
    Duration.prototype.toString = function () {
        return this._toString(false);
    };

    /**
    * Used by util.inspect()
    */
    Duration.prototype.inspect = function () {
        return "[Duration: " + this.toString() + "]";
    };

    /**
    * The valueOf() method returns the primitive value of the specified object.
    */
    Duration.prototype.valueOf = function () {
        return this.milliseconds();
    };

    Duration.prototype._toString = function (full) {
        var result = "";
        if (full || this.millisecond() > 0) {
            result = "." + strings.padLeft(this.millisecond().toString(10), 3, "0");
        }
        if (full || result.length > 0 || this.second() > 0) {
            result = ":" + strings.padLeft(this.second().toString(10), 2, "0") + result;
        }
        if (full || result.length > 0 || this.minute() > 0) {
            result = ":" + strings.padLeft(this.minute().toString(10), 2, "0") + result;
        }
        return this.sign() + strings.padLeft(this.wholeHours().toString(10), 2, "0") + result;
    };

    Duration.prototype._fromString = function (s) {
        var trimmed = s.trim();
        assert(trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/), "Not a proper time duration string: \"" + trimmed + "\"");
        var sign = 1;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var milliseconds = 0;
        var parts = trimmed.split(":");
        assert(parts.length > 0 && parts.length < 4, "Not a proper time duration string: \"" + trimmed + "\"");
        if (trimmed.charAt(0) === "-") {
            sign = -1;
            parts[0] = parts[0].substr(1);
        }
        if (parts.length > 0) {
            hours = +parts[0];
        }
        if (parts.length > 1) {
            minutes = +parts[1];
        }
        if (parts.length > 2) {
            var secondParts = parts[2].split(".");
            seconds = +secondParts[0];
            if (secondParts.length > 1) {
                milliseconds = +strings.padRight(secondParts[1], 3, "0");
            }
        }
        this._milliseconds = Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
        this._sign = sign;
    };
    return Duration;
})();
exports.Duration = Duration;
;
//# sourceMappingURL=duration.js.map

},{"./basics":1,"./strings":12,"assert":19}],4:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Date and Time utility functions - main index
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/* tslint:disable:no-unused-expression */
var basics = require("./basics");
basics;
var TimeUnit = basics.TimeUnit;
exports.TimeUnit = TimeUnit;
var WeekDay = basics.WeekDay;
exports.WeekDay = WeekDay;

var timeUnitToMilliseconds = basics.timeUnitToMilliseconds;
exports.timeUnitToMilliseconds = timeUnitToMilliseconds;
var isLeapYear = basics.isLeapYear;
exports.isLeapYear = isLeapYear;
var daysInMonth = basics.daysInMonth;
exports.daysInMonth = daysInMonth;
var daysInYear = basics.daysInYear;
exports.daysInYear = daysInYear;
var firstWeekDayOfMonth = basics.firstWeekDayOfMonth;
exports.firstWeekDayOfMonth = firstWeekDayOfMonth;
var lastWeekDayOfMonth = basics.lastWeekDayOfMonth;
exports.lastWeekDayOfMonth = lastWeekDayOfMonth;
var weekDayOnOrAfter = basics.weekDayOnOrAfter;
exports.weekDayOnOrAfter = weekDayOnOrAfter;
var weekDayOnOrBefore = basics.weekDayOnOrBefore;
exports.weekDayOnOrBefore = weekDayOnOrBefore;
var weekNumber = basics.weekNumber;
exports.weekNumber = weekNumber;
var weekOfMonth = basics.weekOfMonth;
exports.weekOfMonth = weekOfMonth;
var dayOfYear = basics.dayOfYear;
exports.dayOfYear = dayOfYear;
var secondOfDay = basics.secondOfDay;
exports.secondOfDay = secondOfDay;

var datetime = require("./datetime");
datetime;
var DateTime = datetime.DateTime;
exports.DateTime = DateTime;

var duration = require("./duration");
duration;
var Duration = duration.Duration;
exports.Duration = Duration;

var javascript = require("./javascript");
javascript;
var DateFunctions = javascript.DateFunctions;
exports.DateFunctions = DateFunctions;

var period = require("./period");
period;
var Period = period.Period;
exports.Period = Period;
var PeriodDst = period.PeriodDst;
exports.PeriodDst = PeriodDst;
var periodDstToString = period.periodDstToString;
exports.periodDstToString = periodDstToString;

var timesource = require("./timesource");
timesource;

var RealTimeSource = timesource.RealTimeSource;
exports.RealTimeSource = RealTimeSource;

var timezone = require("./timezone");
timezone;
var NormalizeOption = timezone.NormalizeOption;
exports.NormalizeOption = NormalizeOption;
var TimeZoneKind = timezone.TimeZoneKind;
exports.TimeZoneKind = TimeZoneKind;
var TimeZone = timezone.TimeZone;
exports.TimeZone = TimeZone;

var globals = require("./globals");
globals;
var min = globals.min;
exports.min = min;
var max = globals.max;
exports.max = max;
//# sourceMappingURL=index.js.map

},{"./basics":1,"./datetime":2,"./duration":3,"./globals":6,"./javascript":9,"./period":11,"./timesource":13,"./timezone":15}],5:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Functionality to parse a DateTime object to a string
*/
/// <reference path="../typings/lib.d.ts"/>
var basics = require("./basics");

var token = require("./token");
var Tokenizer = token.Tokenizer;

var TokenType = token.DateTimeTokenType;

var strings = require("./strings");

/**
* Format the supplied dateTime with the formatting string.
*
* @param dateTime The current time to format
* @param utcTime The time in UTC
* @param localZone The zone that currentTime is in
* @param formatString The formatting string to be applied
* @return string
*/
function format(dateTime, utcTime, localZone, formatString) {
    var tokenizer = new Tokenizer(formatString);
    var tokens = tokenizer.parseTokens();
    var result = "";
    tokens.forEach(function (token) {
        var tokenResult;
        switch (token.type) {
            case 1 /* ERA */:
                tokenResult = _formatEra(dateTime, token);
                break;
            case 2 /* YEAR */:
                tokenResult = _formatYear(dateTime, token);
                break;
            case 3 /* QUARTER */:
                tokenResult = _formatQuarter(dateTime, token);
                break;
            case 4 /* MONTH */:
                tokenResult = _formatMonth(dateTime, token);
                break;
            case 6 /* DAY */:
                tokenResult = _formatDay(dateTime, token);
                break;
            case 7 /* WEEKDAY */:
                tokenResult = _formatWeekday(dateTime, token);
                break;
            case 8 /* DAYPERIOD */:
                tokenResult = _formatDayPeriod(dateTime, token);
                break;
            case 9 /* HOUR */:
                tokenResult = _formatHour(dateTime, token);
                break;
            case 10 /* MINUTE */:
                tokenResult = _formatMinute(dateTime, token);
                break;
            case 11 /* SECOND */:
                tokenResult = _formatSecond(dateTime, token);
                break;
            case 12 /* ZONE */:
                tokenResult = _formatZone(dateTime, utcTime, localZone, token);
                break;
            case 5 /* WEEK */:
                tokenResult = _formatWeek(dateTime, token);
                break;
            default:
            case 0 /* IDENTITY */:
                tokenResult = token.raw;
                break;
        }
        result += tokenResult;
    });

    return result;
}
exports.format = format;

/**
* Format the era (BC or AD)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatEra(dateTime, token) {
    var AD = dateTime.year > 0;
    switch (token.length) {
        case 1:
        case 2:
        case 3:
            return (AD ? "AD" : "BC");
        case 4:
            return (AD ? "Anno Domini" : "Before Christ");
        case 5:
            return (AD ? "A" : "B");
        default:
            throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
    }
}

/**
* Format the year
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatYear(dateTime, token) {
    switch (token.symbol) {
        case "y":
        case "Y":
        case "r":
            var yearValue = strings.padLeft(dateTime.year.toString(), token.length, "0");
            if (token.length === 2) {
                yearValue = yearValue.slice(-2);
            }
            return yearValue;

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the quarter
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatQuarter(dateTime, token) {
    var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
    var quarter = Math.ceil(dateTime.month / 3);
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(quarter.toString(), 2, "0");
        case 3:
            return "Q" + quarter;
        case 4:
            return quarterAbbr[quarter - 1] + " quarter";
        case 5:
            return quarter.toString();

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the month
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatMonth(dateTime, token) {
    var monthStrings = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"];
    var monthString = monthStrings[dateTime.month - 1];
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(dateTime.month.toString(), token.length, "0");
        case 3:
            return monthString.slice(0, 3);
        case 4:
            return monthString;
        case 5:
            return monthString.slice(0, 1);

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the week number
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatWeek(dateTime, token) {
    if (token.symbol === "w") {
        return strings.padLeft(basics.weekNumber(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    } else {
        return strings.padLeft(basics.weekOfMonth(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    }
}

/**
* Format the day of the month (or year)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatDay(dateTime, token) {
    switch (token.symbol) {
        case "d":
            return strings.padLeft(dateTime.day.toString(), token.length, "0");
        case "D":
            var dayOfYear = basics.dayOfYear(dateTime.year, dateTime.month, dateTime.day) + 1;
            return strings.padLeft(dayOfYear.toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the day of the week
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatWeekday(dateTime, token) {
    var weekDay = basics.WeekDay[basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs())];

    switch (token.length) {
        case 1:
        case 2:
            if (token.symbol === "e") {
                return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs()).toString(), token.length, "0");
            }
        case 3:
            return weekDay.slice(0, 3);
        case 4:
            return weekDay;
        case 5:
            return weekDay.slice(0, 1);
        case 6:
            return weekDay.slice(0, 2);

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the Day Period (AM or PM)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatDayPeriod(dateTime, token) {
    return (dateTime.hour < 12 ? "AM" : "PM");
}

/**
* Format the Hour
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatHour(dateTime, token) {
    var hour = dateTime.hour;
    switch (token.symbol) {
        case "h":
            hour = hour % 12;
            if (hour === 0) {
                hour = 12;
            }
            ;
            return strings.padLeft(hour.toString(), token.length, "0");
        case "H":
            return strings.padLeft(hour.toString(), token.length, "0");
        case "K":
            hour = hour % 12;
            return strings.padLeft(hour.toString(), token.length, "0");
        case "k":
            if (hour === 0) {
                hour = 24;
            }
            ;
            return strings.padLeft(hour.toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the minute
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatMinute(dateTime, token) {
    return strings.padLeft(dateTime.minute.toString(), token.length, "0");
}

/**
* Format the seconds (or fraction of a second)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatSecond(dateTime, token) {
    switch (token.symbol) {
        case "s":
            return strings.padLeft(dateTime.second.toString(), token.length, "0");
        case "S":
            var fraction = dateTime.milli;
            var fractionString = strings.padLeft(fraction.toString(), 3, "0");
            fractionString = strings.padRight(fractionString, token.length, "0");
            return fractionString.slice(0, token.length);
        case "A":
            return strings.padLeft(basics.secondOfDay(dateTime.hour, dateTime.minute, dateTime.second).toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the time zone. For this, we need the current time, the time in UTC and the time zone
* @param currentTime The time to format
* @param utcTime The time in UTC
* @param zone The timezone currentTime is in
* @param token The token passed
* @return string
*/
function _formatZone(currentTime, utcTime, zone, token) {
    var offset = Math.round((currentTime.toUnixNoLeapSecs() - utcTime.toUnixNoLeapSecs()) / 60000);

    var offsetHours = Math.floor(Math.abs(offset) / 60);
    var offsetHoursString = strings.padLeft(offsetHours.toString(), 2, "0");
    offsetHoursString = (offset >= 0 ? "+" + offsetHoursString : "-" + offsetHoursString);
    var offsetMinutes = Math.abs(offset % 60);
    var offsetMinutesString = strings.padLeft(offsetMinutes.toString(), 2, "0");
    var result;

    switch (token.symbol) {
        case "O":
            result = "UTC";
            if (offset >= 0) {
                result += "+";
            } else {
                result += "-";
            }
            result += offsetHours.toString();
            if (token.length >= 4 || offsetMinutes !== 0) {
                result += ":" + offsetMinutesString;
            }
            return result;
        case "Z":
            switch (token.length) {
                case 1:
                case 2:
                case 3:
                    return offsetHoursString + offsetMinutesString;
                case 4:
                    var newToken = {
                        length: 4,
                        raw: "OOOO",
                        symbol: "O",
                        type: 12 /* ZONE */
                    };
                    return _formatZone(currentTime, utcTime, zone, newToken);
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "z":
            switch (token.length) {
                case 1:
                case 2:
                case 3:
                    return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day, currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, true);
                case 4:
                    return zone.toString();

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "v":
            if (token.length === 1) {
                return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day, currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, false);
            } else {
                return zone.toString();
            }
        case "V":
            switch (token.length) {
                case 1:
                    // Not implemented
                    return "unk";
                case 2:
                    return zone.name();
                case 3:
                case 4:
                    return "Unknown";

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "X":
            if (offset === 0) {
                return "Z";
            }
        case "x":
            switch (token.length) {
                case 1:
                    result = offsetHoursString;
                    if (offsetMinutes !== 0) {
                        result += offsetMinutesString;
                    }
                    return result;
                case 2:
                case 4:
                    return offsetHoursString + offsetMinutesString;
                case 3:
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}
//# sourceMappingURL=format.js.map

},{"./basics":1,"./strings":12,"./token":16}],6:[function(require,module,exports){
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

},{"./datetime":2,"./duration":3,"assert":19}],"Focm2+":[function(require,module,exports){
module.exports=require(4)
},{"./basics":1,"./datetime":2,"./duration":3,"./globals":6,"./javascript":9,"./period":11,"./timesource":13,"./timezone":15}],"timezonecomplete":[function(require,module,exports){
module.exports=require('Focm2+');
},{}],9:[function(require,module,exports){
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
//# sourceMappingURL=javascript.js.map

},{}],10:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Math utility functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

/**
* @return true iff given argument is an integer number
*/
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
* Stricter variant of parseFloat().
* @param value	Input string
* @return the float if the string is a valid float, NaN otherwise
*/
function filterFloat(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
        return Number(value);
    }
    return NaN;
}
exports.filterFloat = filterFloat;

function positiveModulo(value, modulo) {
    assert(modulo >= 1, "modulo should be >= 1");
    if (value < 0) {
        return ((value % modulo) + modulo) % modulo;
    } else {
        return value % modulo;
    }
}
exports.positiveModulo = positiveModulo;
//# sourceMappingURL=math.js.map

},{"assert":19}],11:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Periodic interval functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var basics = require("./basics");
var TimeUnit = basics.TimeUnit;

var duration = require("./duration");
var Duration = duration.Duration;

var datetime = require("./datetime");
var DateTime = datetime.DateTime;

var timezone = require("./timezone");
var TimeZone = timezone.TimeZone;
var TimeZoneKind = timezone.TimeZoneKind;

/**
* Specifies how the period should repeat across the day
* during DST changes.
*/
(function (PeriodDst) {
    /**
    * Keep repeating in similar intervals measured in UTC,
    * unaffected by Daylight Saving Time.
    * E.g. a repetition of one hour will take one real hour
    * every time, even in a time zone with DST.
    * Leap seconds, leap days and month length
    * differences will still make the intervals different.
    */
    PeriodDst[PeriodDst["RegularIntervals"] = 0] = "RegularIntervals";

    /**
    * Ensure that the time at which the intervals occur stay
    * at the same place in the day, local time. So e.g.
    * a period of one day, starting at 8:05AM Europe/Amsterdam time
    * will always start at 8:05 Europe/Amsterdam. This means that
    * in UTC time, some intervals will be 25 hours and some
    * 23 hours during DST changes.
    * Another example: an hourly interval will be hourly in local time,
    * skipping an hour in UTC for a DST backward change.
    */
    PeriodDst[PeriodDst["RegularLocalTime"] = 1] = "RegularLocalTime";
})(exports.PeriodDst || (exports.PeriodDst = {}));
var PeriodDst = exports.PeriodDst;

/**
* Convert a PeriodDst to a string: "regular intervals" or "regular local time"
*/
function periodDstToString(p) {
    switch (p) {
        case 0 /* RegularIntervals */:
            return "regular intervals";
        case 1 /* RegularLocalTime */:
            return "regular local time";

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unknown PeriodDst");
            }
    }
}
exports.periodDstToString = periodDstToString;

/**
* Repeating time period: consists of a starting point and
* a time length. This class accounts for leap seconds and leap days.
*/
var Period = (function () {
    /**
    * Constructor
    * LIMITATION: if dst equals RegularLocalTime, and unit is Second, Minute or Hour,
    * then the amount must be a factor of 24. So 120 seconds is allowed while 121 seconds is not.
    * This is due to the enormous processing power required by these cases. They are not
    * implemented and you will get an assert.
    *
    * @param start The start of the period. If the period is in Months or Years, and
    *				the day is 29 or 30 or 31, the results are maximised to end-of-month.
    * @param amount	The amount of units.
    * @param unit	The unit.
    * @param dst	Specifies how to handle Daylight Saving Time. Not relevant
    *				if the time zone of the start datetime does not have DST.
    */
    function Period(start, amount, unit, dst) {
        assert(start !== null, "Start time may not be null");
        assert(amount > 0, "Amount must be positive non-zero.");
        assert(Math.floor(amount) === amount, "Amount must be a whole number");

        this._start = start;
        this._amount = amount;
        this._unit = unit;
        this._dst = dst;
        this._calcInternalValues();

        // regular local time keeping is only supported if we can reset each day
        // Note we use internal amounts to decide this because actually it is supported if
        // the input is a multiple of one day.
        if (this._dstRelevant() && dst === 1 /* RegularLocalTime */) {
            switch (this._intUnit) {
                case 0 /* Second */:
                    assert(this._intAmount < 86400, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 1 /* Minute */:
                    assert(this._intAmount < 1440, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 2 /* Hour */:
                    assert(this._intAmount < 24, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
            }
        }
    }
    /**
    * The start date
    */
    Period.prototype.start = function () {
        return this._start;
    };

    /**
    * The amount of units
    */
    Period.prototype.amount = function () {
        return this._amount;
    };

    /**
    * The unit
    */
    Period.prototype.unit = function () {
        return this._unit;
    };

    /**
    * The dst handling mode
    */
    Period.prototype.dst = function () {
        return this._dst;
    };

    /**
    * The first occurrence of the period greater than
    * the given date. The given date need not be at a period boundary.
    * Pre: the fromdate and startdate must either both have timezones or not
    * @param fromDate: the date after which to return the next date
    * @return the first date matching the period after fromDate, given
    *			in the same zone as the fromDate.
    */
    Period.prototype.findFirst = function (fromDate) {
        assert((this._intStart.zone() === null) === (fromDate.zone() === null), "The fromDate and startDate must both be aware or unaware");
        var approx;
        var periods;
        var diff;
        var newYear;
        var newMonth;
        var remainder;

        var normalFrom = this._normalizeDay(fromDate.toZone(this._intStart.zone()));

        // Simple case: period has not started yet.
        if (normalFrom.lessThan(this._intStart)) {
            // use toZone because we don't want to return a reference to our internal member
            return this._correctDay(this._intStart).toZone(fromDate.zone());
        }

        if (this._intAmount === 1) {
            // simple cases: amount equals 1 (eliminates need for searching for starting point)
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 1 /* Minute */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 3 /* Day */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 5 /* Month */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), this._intStart.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 6 /* Year */:
                        approx = new DateTime(normalFrom.utcYear(), this._intStart.utcMonth(), this._intStart.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;

                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            } else {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 1 /* Minute */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 3 /* Day */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 5 /* Month */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 6 /* Year */:
                        approx = new DateTime(normalFrom.year(), this._intStart.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;

                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intAmount, this._intUnit);
                }
            }
        } else {
            // Amount is not 1,
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        diff = normalFrom.diff(this._intStart).seconds();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 1 /* Minute */:
                        // only 25 leap seconds have ever been added so this should still be OK.
                        diff = normalFrom.diff(this._intStart).minutes();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 2 /* Hour */:
                        diff = normalFrom.diff(this._intStart).hours();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 3 /* Day */:
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 5 /* Month */:
                        diff = (normalFrom.utcYear() - this._intStart.utcYear()) * 12 + (normalFrom.utcMonth() - this._intStart.utcMonth()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 6 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        approx = this._intStart.add(periods * this._intAmount, 6 /* Year */);
                        break;

                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            } else {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
                            // optimization: same second each minute, so just take the fromDate minus one minute with the this._intStart seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 1 /* Minute */);
                        } else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 3600) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 0 /* Second */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            } else {
                                if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 0 /* Second */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 3 /* Day */);
                                }
                            }

                            // optimization: binary search
                            var imax = Math.floor((24 * 3600) / this._intAmount);
                            var imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                var imid = Math.floor((imin + imax) / 2);
                                var approx2 = approx.addLocal(imid * this._intAmount, 0 /* Second */);
                                var approxMin = approx2.subLocal(this._intAmount, 0 /* Second */);
                                if (approx2.greaterThan(normalFrom) && approxMin.lessEqual(normalFrom)) {
                                    approx = approx2;
                                    break;
                                } else if (approx2.lessEqual(normalFrom)) {
                                    // change min index to search upper subarray
                                    imin = imid + 1;
                                } else {
                                    // change max index to search lower subarray
                                    imax = imid - 1;
                                }
                            }
                        }
                        break;
                    case 1 /* Minute */:
                        if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
                            // optimization: same hour this._intStartary each time, so just take the fromDate minus one hour
                            // with the this._intStart minutes, seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 2 /* Hour */);
                        } else {
                            // per constructor assert, the seconds fit in a day, so just go the fromDate previous day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 60) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 1 /* Minute */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            } else {
                                if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 1 /* Minute */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 3 /* Day */);
                                }
                            }
                        }
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                        // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                        remainder = Math.floor(24 % this._intAmount);
                        if (approx.greaterThan(normalFrom)) {
                            if (approx.subLocal(remainder, 2 /* Hour */).greaterThan(normalFrom)) {
                                // normalFrom lies outside the boundary period before the start date
                                approx = approx.subLocal(1, 3 /* Day */);
                            }
                        } else {
                            if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 2 /* Hour */).lessEqual(normalFrom)) {
                                // normalFrom lies in the boundary period, move to the next day
                                approx = approx.addLocal(1, 3 /* Day */);
                            }
                        }
                        break;
                    case 3 /* Day */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.addLocal(periods * this._intAmount, this._intUnit);
                        break;
                    case 5 /* Month */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = (normalFrom.year() - this._intStart.year()) * 12 + (normalFrom.month() - this._intStart.month()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        newYear = this._intStart.year() + Math.floor(periods * this._intAmount / 12);
                        newMonth = ((this._intStart.month() - 1 + Math.floor(periods * this._intAmount)) % 12) + 1;

                        // note that newYear-newMonth-this._intStart.day() is a valid date due to our start day normalization
                        approx = new DateTime(newYear, newMonth, this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 6 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        newYear = this._intStart.year() + periods * this._intAmount;
                        approx = new DateTime(newYear, this._intStart.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;

                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intAmount, this._intUnit);
                }
            }
        }
        return this._correctDay(approx).convert(fromDate.zone());
    };

    /**
    * Returns the next timestamp in the period. The given timestamp must
    * be at a period boundary, otherwise the answer is incorrect.
    * This function has MUCH better performance than findFirst.
    * Returns the datetime "count" times away from the given datetime.
    * @param prev	Boundary date. Must have a time zone (any time zone) iff the period start date has one.
    * @param count	Optional, must be >= 1 and whole.
    * @return (prev + count * period), in the same timezone as prev.
    */
    Period.prototype.findNext = function (prev, count) {
        if (typeof count === "undefined") { count = 1; }
        assert(prev !== null, "Prev must be non-null");
        assert((this._intStart.zone() === null) === (prev.zone() === null), "The fromDate and startDate must both be aware or unaware");
        assert(typeof (count) === "number", "Count must be a number");
        assert(count >= 1 && Math.floor(count) === count, "Count must be an integer >= 1");

        var normalizedPrev = this._normalizeDay(prev.toZone(this._start.zone()));
        if (this._intDst === 0 /* RegularIntervals */) {
            return this._correctDay(normalizedPrev.add(this._intAmount * count, this._intUnit)).convert(prev.zone());
        } else {
            return this._correctDay(normalizedPrev.addLocal(this._intAmount * count, this._intUnit)).convert(prev.zone());
        }
    };

    /**
    * Checks whether the given date is on a period boundary
    * (expensive!)
    */
    Period.prototype.isBoundary = function (occurrence) {
        if (!occurrence) {
            return false;
        }
        assert((this._intStart.zone() === null) === (occurrence.zone() === null), "The occurrence and startDate must both be aware or unaware");
        return (this.findFirst(occurrence.sub(Duration.milliseconds(1))).equals(occurrence));
    };

    Period.prototype._periodIsoString = function () {
        switch (this._unit) {
            case 0 /* Second */: {
                return "P" + this._amount.toString(10) + "S";
            }
            case 1 /* Minute */: {
                return "PT" + this._amount.toString(10) + "M";
            }
            case 2 /* Hour */: {
                return "P" + this._amount.toString(10) + "H";
            }
            case 3 /* Day */: {
                return "P" + this._amount.toString(10) + "D";
            }
            case 4 /* Week */: {
                return "P" + this._amount.toString(10) + "W";
            }
            case 5 /* Month */: {
                return "P" + this._amount.toString(10) + "M";
            }
            case 6 /* Year */: {
                return "P" + this._amount.toString(10) + "Y";
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };

    /**
    * Returns an ISO duration string e.g.
    * 2014-01-01T12:00:00.000+01:00/P1H
    * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
    * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
    */
    Period.prototype.toIsoString = function () {
        return this.start().toIsoString() + "/" + this._periodIsoString();
    };

    /**
    * A string representation e.g.
    * "10 years, starting at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
    */
    Period.prototype.toString = function () {
        var result = this._amount.toString(10) + " " + TimeUnit[this._unit].toLowerCase() + (this._amount > 1 ? "s" : "") + ", starting at " + this._start.toString();

        // only add the DST handling if it is relevant
        if (this._dstRelevant()) {
            result += ", keeping " + exports.periodDstToString(this._dst);
        }
        return result;
    };

    /**
    * Used by util.inspect()
    */
    Period.prototype.inspect = function () {
        return "[Period: " + this.toString() + "]";
    };

    /**
    * Corrects the difference between _start and _intStart.
    */
    Period.prototype._correctDay = function (d) {
        if (this._start !== this._intStart) {
            return new DateTime(d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._start.day()), d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        } else {
            return d;
        }
    };

    /**
    * If this._internalUnit in [Month, Year], normalizes the day-of-month
    * to <= 28.
    * @return a new date if different, otherwise the exact same object (no clone!)
    */
    Period.prototype._normalizeDay = function (d, anymonth) {
        if (typeof anymonth === "undefined") { anymonth = true; }
        if ((this._intUnit === 5 /* Month */ && d.day() > 28) || (this._intUnit === 6 /* Year */ && (d.month() === 2 || anymonth) && d.day() > 28)) {
            return new DateTime(d.year(), d.month(), 28, d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        } else {
            return d;
        }
    };

    /**
    * Returns true if DST handling is relevant for us.
    * (i.e. if the start time zone has DST)
    */
    Period.prototype._dstRelevant = function () {
        return (this._start.zone() != null && this._start.zone().kind() === 2 /* Proper */ && this._start.zone().hasDst());
    };

    /**
    * Normalize the values where possible - not all values
    * are convertible into one another. Weeks are converted to days.
    * E.g. more than 60 minutes is transferred to hours,
    * but seconds cannot be transferred to minutes due to leap seconds.
    * Weeks are converted back to days.
    */
    Period.prototype._calcInternalValues = function () {
        // normalize any above-unit values
        this._intAmount = this._amount;
        this._intUnit = this._unit;

        if (this._intUnit === 0 /* Second */ && this._intAmount >= 60 && this._intAmount % 60 === 0 && this._dstRelevant() && this._dst === 1 /* RegularLocalTime */) {
            // cannot convert seconds to minutes if regular intervals are required due to
            // leap seconds, but for regular local time it does not matter
            this._intAmount = this._intAmount / 60;
            this._intUnit = 1 /* Minute */;
        }
        if (this._intUnit === 1 /* Minute */ && this._intAmount >= 60 && this._intAmount % 60 === 0) {
            this._intAmount = this._intAmount / 60;
            this._intUnit = 2 /* Hour */;
        }
        if (this._intUnit === 2 /* Hour */ && this._intAmount >= 24 && this._intAmount % 24 === 0) {
            this._intAmount = this._intAmount / 24;
            this._intUnit = 3 /* Day */;
        }

        // now remove weeks as they are not a concept in datetime
        if (this._intUnit === 4 /* Week */) {
            this._intAmount = this._intAmount * 7;
            this._intUnit = 3 /* Day */;
        }
        if (this._intUnit === 5 /* Month */ && this._intAmount >= 12 && this._intAmount % 12 === 0) {
            this._intAmount = this._intAmount / 12;
            this._intUnit = 6 /* Year */;
        }

        // normalize dst handling
        if (this._dstRelevant()) {
            this._intDst = this._dst;
        } else {
            this._intDst = 0 /* RegularIntervals */;
        }

        // normalize start day
        this._intStart = this._normalizeDay(this._start, false);
    };
    return Period;
})();
exports.Period = Period;
//# sourceMappingURL=period.js.map

},{"./basics":1,"./datetime":2,"./duration":3,"./timezone":15,"assert":19,"source-map-support":38}],12:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* String utility functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

/**
* Pad a string by adding characters to the beginning.
* @param s	the string to pad
* @param width	the desired minimum string width
* @param char	the single character to pad with
* @return	the padded string
*/
function padLeft(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return padding + s;
}
exports.padLeft = padLeft;

/**
* Pad a string by adding characters to the end.
* @param s	the string to pad
* @param width	the desired minimum string width
* @param char	the single character to pad with
* @return	the padded string
*/
function padRight(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return s + padding;
}
exports.padRight = padRight;
//# sourceMappingURL=strings.js.map

},{"assert":19}],13:[function(require,module,exports){
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
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            return new Date();
        }
    };
    return RealTimeSource;
})();
exports.RealTimeSource = RealTimeSource;
//# sourceMappingURL=timesource.js.map

},{}],14:[function(require,module,exports){
module.exports={"zones":{"Africa/Algiers":[["-12.2","-","LMT","-2486678340000"],["-9.35","-","PMT","-1855958400000"],["0","Algeria","WE%sT","-942012000000"],["-60","Algeria","CE%sT","-733276800000"],["0","-","WET","-439430400000"],["-60","-","CET","-212025600000"],["0","Algeria","WE%sT","246240000000"],["-60","Algeria","CE%sT","309744000000"],["0","Algeria","WE%sT","357523200000"],["-60","-","CET",null]],"Atlantic/Cape_Verde":[["94.06666666666668","-","LMT","-1956700800000"],["120","-","CVT","-862617600000"],["120","1:00","CVST","-764121600000"],["120","-","CVT","186112800000"],["60","-","CVT",null]],"Africa/Ndjamena":[["-60.2","-","LMT","-1798848000000"],["-60","-","WAT","308707200000"],["-60","1:00","WAST","321321600000"],["-60","-","WAT",null]],"Africa/Abidjan":[["16.133333333333333","-","LMT","-1798848000000"],["0","-","GMT",null]],"Africa/Bamako":"Africa/Abidjan","Africa/Banjul":"Africa/Abidjan","Africa/Conakry":"Africa/Abidjan","Africa/Dakar":"Africa/Abidjan","Africa/Freetown":"Africa/Abidjan","Africa/Lome":"Africa/Abidjan","Africa/Nouakchott":"Africa/Abidjan","Africa/Ouagadougou":"Africa/Abidjan","Africa/Sao_Tome":"Africa/Abidjan","Atlantic/St_Helena":"Africa/Abidjan","Africa/Cairo":[["-125.15","-","LMT","-2185401600000"],["-120","Egypt","EE%sT",null]],"Africa/Accra":[["0.8666666666666666","-","LMT","-1609545600000"],["0","Ghana","%s",null]],"Africa/Bissau":[["62.333333333333336","-","LMT","-1830384000000"],["60","-","WAT","189216000000"],["0","-","GMT",null]],"Africa/Nairobi":[["-147.26666666666665","-","LMT","-1309737600000"],["-180","-","EAT","-1230854400000"],["-150","-","BEAT","-915235200000"],["-165","-","BEAUT","-284083200000"],["-180","-","EAT",null]],"Africa/Addis_Ababa":"Africa/Nairobi","Africa/Asmara":"Africa/Nairobi","Africa/Dar_es_Salaam":"Africa/Nairobi","Africa/Djibouti":"Africa/Nairobi","Africa/Kampala":"Africa/Nairobi","Africa/Mogadishu":"Africa/Nairobi","Indian/Antananarivo":"Africa/Nairobi","Indian/Comoro":"Africa/Nairobi","Indian/Mayotte":"Africa/Nairobi","Africa/Monrovia":[["43.13333333333333","-","LMT","-2745532800000"],["43.13333333333333","-","MMT","-1604361600000"],["44.5","-","LRT","73526400000"],["0","-","GMT",null]],"Africa/Tripoli":[["-52.733333333333334","-","LMT","-1546387200000"],["-60","Libya","CE%sT","-315705600000"],["-120","-","EET","410140800000"],["-60","Libya","CE%sT","641779200000"],["-120","-","EET","844041600000"],["-60","Libya","CE%sT","875923200000"],["-120","-","EET","1352512800000"],["-60","Libya","CE%sT","1382666400000"],["-120","-","EET",null]],"Indian/Mauritius":[["-230","-","LMT","-1956700800000"],["-240","Mauritius","MU%sT",null]],"Africa/Casablanca":[["30.333333333333332","-","LMT","-1773014400000"],["0","Morocco","WE%sT","448243200000"],["-60","-","CET","536371200000"],["0","Morocco","WE%sT",null]],"Africa/El_Aaiun":[["52.8","-","LMT","-1136073600000"],["60","-","WAT","198288000000"],["0","Morocco","WE%sT",null]],"Africa/Maputo":[["-130.33333333333331","-","LMT","-2109283200000"],["-120","-","CAT",null]],"Africa/Blantyre":"Africa/Maputo","Africa/Bujumbura":"Africa/Maputo","Africa/Gaborone":"Africa/Maputo","Africa/Harare":"Africa/Maputo","Africa/Kigali":"Africa/Maputo","Africa/Lubumbashi":"Africa/Maputo","Africa/Lusaka":"Africa/Maputo","Africa/Windhoek":[["-68.4","-","LMT","-2458166400000"],["-90","-","SWAT","-2109283200000"],["-120","-","SAST","-860968800000"],["-120","1:00","SAST","-845244000000"],["-120","-","SAST","637977600000"],["-120","-","CAT","765331200000"],["-60","Namibia","WA%sT",null]],"Africa/Lagos":[["-13.6","-","LMT","-1588464000000"],["-60","-","WAT",null]],"Africa/Bangui":"Africa/Lagos","Africa/Brazzaville":"Africa/Lagos","Africa/Douala":"Africa/Lagos","Africa/Kinshasa":"Africa/Lagos","Africa/Libreville":"Africa/Lagos","Africa/Luanda":"Africa/Lagos","Africa/Malabo":"Africa/Lagos","Africa/Niamey":"Africa/Lagos","Africa/Porto-Novo":"Africa/Lagos","Indian/Reunion":[["-221.86666666666665","-","LMT","-1848873600000"],["-240","-","RET",null]],"Indian/Mahe":[["-221.8","-","LMT","-2006640000000"],["-240","-","SCT",null]],"Africa/Johannesburg":[["-112","-","LMT","-2458166400000"],["-90","-","SAST","-2109283200000"],["-120","SA","SAST",null]],"Africa/Maseru":"Africa/Johannesburg","Africa/Mbabane":"Africa/Johannesburg","Africa/Khartoum":[["-130.13333333333333","-","LMT","-1199318400000"],["-120","Sudan","CA%sT","947937600000"],["-180","-","EAT",null]],"Africa/Juba":"Africa/Khartoum","Africa/Tunis":[["-40.733333333333334","-","LMT","-2797200000000"],["-9.35","-","PMT","-1855958400000"],["-60","Tunisia","CE%sT",null]],"Antarctica/Casey":[["0","-","zzz","-86400000"],["-480","-","AWST","1255831200000"],["-660","-","CAST","1267754400000"],["-480","-","AWST","1319767200000"],["-660","-","CAST","1329843600000"],["-480","-","AWST",null]],"Antarctica/Davis":[["0","-","zzz","-409190400000"],["-420","-","DAVT","-163036800000"],["0","-","zzz","-28857600000"],["-420","-","DAVT","1255831200000"],["-300","-","DAVT","1268251200000"],["-420","-","DAVT","1319767200000"],["-300","-","DAVT","1329854400000"],["-420","-","DAVT",null]],"Antarctica/Mawson":[["0","-","zzz","-501206400000"],["-360","-","MAWT","1255831200000"],["-300","-","MAWT",null]],"Indian/Kerguelen":[["0","-","zzz","-599702400000"],["-300","-","TFT",null]],"Antarctica/DumontDUrville":[["0","-","zzz","-694396800000"],["-600","-","PMT","-566956800000"],["0","-","zzz","-415497600000"],["-600","-","DDUT",null]],"Antarctica/Syowa":[["0","-","zzz","-407808000000"],["-180","-","SYOT",null]],"Antarctica/Troll":[["0","-","zzz","1108166400000"],["0","Troll","%s",null]],"Antarctica/Vostok":[["0","-","zzz","-380073600000"],["-360","-","VOST",null]],"Antarctica/Rothera":[["0","-","zzz","218246400000"],["180","-","ROTT",null]],"Antarctica/Palmer":[["0","-","zzz","-126316800000"],["240","ArgAQ","AR%sT","-7603200000"],["180","ArgAQ","AR%sT","389059200000"],["240","ChileAQ","CL%sT",null]],"Asia/Kabul":[["-276.8","-","LMT","-2493072000000"],["-240","-","AFT","-757468800000"],["-270","-","AFT",null]],"Asia/Yerevan":[["-178","-","LMT","-1441152000000"],["-180","-","YERT","-405129600000"],["-240","RussiaAsia","YER%sT","670384800000"],["-180","1:00","YERST","685584000000"],["-180","RussiaAsia","AM%sT","811908000000"],["-240","-","AMT","883526400000"],["-240","RussiaAsia","AM%sT","1332640800000"],["-240","-","AMT",null]],"Asia/Baku":[["-199.4","-","LMT","-1441152000000"],["-180","-","BAKT","-405129600000"],["-240","RussiaAsia","BAK%sT","670384800000"],["-180","1:00","BAKST","683510400000"],["-180","RussiaAsia","AZ%sT","715388400000"],["-240","-","AZT","851990400000"],["-240","EUAsia","AZ%sT","883526400000"],["-240","Azer","AZ%sT",null]],"Asia/Bahrain":[["-202.33333333333334","-","LMT","-1546387200000"],["-240","-","GST","76204800000"],["-180","-","AST",null]],"Asia/Dhaka":[["-361.6666666666667","-","LMT","-2493072000000"],["-353.3333333333333","-","HMT","-891561600000"],["-390","-","BURT","-872035200000"],["-330","-","IST","-862617600000"],["-390","-","BURT","-576115200000"],["-360","-","DACT","38793600000"],["-360","-","BDT","1262217600000"],["-360","Dhaka","BD%sT",null]],"Asia/Thimphu":[["-358.6","-","LMT","-706320000000"],["-330","-","IST","560044800000"],["-360","-","BTT",null]],"Indian/Chagos":[["-289.6666666666667","-","LMT","-1956700800000"],["-300","-","IOT","851990400000"],["-360","-","IOT",null]],"Asia/Brunei":[["-459.6666666666667","-","LMT","-1383436800000"],["-450","-","BNT","-1136160000000"],["-480","-","BNT",null]],"Asia/Rangoon":[["-384.6666666666667","-","LMT","-2808604800000"],["-384.6666666666667","-","RMT","-1546387200000"],["-390","-","BURT","-873244800000"],["-540","-","JST","-778377600000"],["-390","-","MMT",null]],"Asia/Shanghai":[["-485.7166666666667","-","LMT","-2146003200000"],["-480","Shang","C%sT","-631238400000"],["-480","PRC","C%sT",null]],"Asia/Urumqi":[["-350.3333333333333","-","LMT","-1293926400000"],["-360","-","XJT",null]],"Asia/Hong_Kong":[["-456.7","-","LMT","-2056665600000"],["-480","HK","HK%sT","-884217600000"],["-540","-","JST","-766713600000"],["-480","HK","HK%sT",null]],"Asia/Taipei":[["-486","-","LMT","-2335219200000"],["-480","-","JWST","-1017792000000"],["-540","-","JST","-766191600000"],["-480","Taiwan","C%sT",null]],"Asia/Macau":[["-454.3333333333333","-","LMT","-1830384000000"],["-480","Macau","MO%sT","945648000000"],["-480","PRC","C%sT",null]],"Asia/Nicosia":[["-133.46666666666667","-","LMT","-1518912000000"],["-120","Cyprus","EE%sT","904608000000"],["-120","EUAsia","EE%sT",null]],"Europe/Nicosia":"Asia/Nicosia","Asia/Tbilisi":[["-179.18333333333334","-","LMT","-2808604800000"],["-179.18333333333334","-","TBMT","-1441152000000"],["-180","-","TBIT","-405129600000"],["-240","RussiaAsia","TBI%sT","670384800000"],["-180","1:00","TBIST","671155200000"],["-180","RussiaAsia","GE%sT","725760000000"],["-180","E-EurAsia","GE%sT","778377600000"],["-240","E-EurAsia","GE%sT","844128000000"],["-240","1:00","GEST","857174400000"],["-240","E-EurAsia","GE%sT","1088294400000"],["-180","RussiaAsia","GE%sT","1109642400000"],["-240","-","GET",null]],"Asia/Dili":[["-502.3333333333333","-","LMT","-1830384000000"],["-480","-","TLT","-879123600000"],["-540","-","JST","-766022400000"],["-540","-","TLT","199929600000"],["-480","-","WITA","969148800000"],["-540","-","TLT",null]],"Asia/Kolkata":[["-353.4666666666667","-","LMT","-2808604800000"],["-353.3333333333333","-","HMT","-891561600000"],["-390","-","BURT","-872035200000"],["-330","-","IST","-862617600000"],["-330","1:00","IST","-764121600000"],["-330","-","IST",null]],"Asia/Jakarta":[["-427.2","-","LMT","-3231273600000"],["-427.2","-","BMT","-1451693568000"],["-440","-","JAVT","-1172880000000"],["-450","-","WIB","-876614400000"],["-540","-","JST","-766022400000"],["-450","-","WIB","-683856000000"],["-480","-","WIB","-620784000000"],["-450","-","WIB","-157852800000"],["-420","-","WIB",null]],"Asia/Pontianak":[["-437.3333333333333","-","LMT","-1946160000000"],["-437.3333333333333","-","PMT","-1172880000000"],["-450","-","WIB","-881193600000"],["-540","-","JST","-766022400000"],["-450","-","WIB","-683856000000"],["-480","-","WIB","-620784000000"],["-450","-","WIB","-157852800000"],["-480","-","WITA","567993600000"],["-420","-","WIB",null]],"Asia/Makassar":[["-477.6","-","LMT","-1546387200000"],["-477.6","-","MMT","-1172880000000"],["-480","-","WITA","-880243200000"],["-540","-","JST","-766022400000"],["-480","-","WITA",null]],"Asia/Jayapura":[["-562.8","-","LMT","-1172880000000"],["-540","-","WIT","-799459200000"],["-570","-","ACST","-157852800000"],["-540","-","WIT",null]],"Asia/Tehran":[["-205.73333333333335","-","LMT","-1672617600000"],["-205.73333333333335","-","TMT","-725932800000"],["-210","-","IRST","247190400000"],["-240","Iran","IR%sT","315446400000"],["-210","Iran","IR%sT",null]],"Asia/Baghdad":[["-177.66666666666666","-","LMT","-2493072000000"],["-177.6","-","BMT","-1609545600000"],["-180","-","AST","389059200000"],["-180","Iraq","A%sT",null]],"Asia/Jerusalem":[["-140.9","-","LMT","-2808604800000"],["-140.66666666666666","-","JMT","-1609545600000"],["-120","Zion","I%sT",null]],"Asia/Tokyo":[["-558.9833333333333","-","LMT","-2587712400000"],["-540","-","JST","-2335219200000"],["-540","-","JCST","-1017792000000"],["-540","Japan","J%sT",null]],"Asia/Amman":[["-143.73333333333335","-","LMT","-1199318400000"],["-120","Jordan","EE%sT",null]],"Asia/Almaty":[["-307.8","-","LMT","-1441152000000"],["-300","-","ALMT","-1247529600000"],["-360","RussiaAsia","ALM%sT","694137600000"],["-360","-","ALMT","725760000000"],["-360","RussiaAsia","ALM%sT","1110844800000"],["-360","-","ALMT",null]],"Asia/Qyzylorda":[["-261.8666666666667","-","LMT","-1441152000000"],["-240","-","KIZT","-1247529600000"],["-300","-","KIZT","354931200000"],["-300","1:00","KIZST","370742400000"],["-360","-","KIZT","386467200000"],["-300","RussiaAsia","KIZ%sT","694137600000"],["-300","-","KIZT","692841600000"],["-300","-","QYZT","695786400000"],["-360","RussiaAsia","QYZ%sT","1110844800000"],["-360","-","QYZT",null]],"Asia/Aqtobe":[["-228.66666666666666","-","LMT","-1441152000000"],["-240","-","AKTT","-1247529600000"],["-300","-","AKTT","354931200000"],["-300","1:00","AKTST","370742400000"],["-360","-","AKTT","386467200000"],["-300","RussiaAsia","AKT%sT","694137600000"],["-300","-","AKTT","692841600000"],["-300","RussiaAsia","AQT%sT","1110844800000"],["-300","-","AQTT",null]],"Asia/Aqtau":[["-201.06666666666666","-","LMT","-1441152000000"],["-240","-","FORT","-1247529600000"],["-300","-","FORT","-189475200000"],["-300","-","SHET","370742400000"],["-360","-","SHET","386467200000"],["-300","RussiaAsia","SHE%sT","694137600000"],["-300","-","SHET","692841600000"],["-300","RussiaAsia","AQT%sT","794023200000"],["-240","RussiaAsia","AQT%sT","1110844800000"],["-300","-","AQTT",null]],"Asia/Oral":[["-205.4","-","LMT","-1441152000000"],["-240","-","URAT","-1247529600000"],["-300","-","URAT","354931200000"],["-300","1:00","URAST","370742400000"],["-360","-","URAT","386467200000"],["-300","RussiaAsia","URA%sT","606880800000"],["-240","RussiaAsia","URA%sT","694137600000"],["-240","-","URAT","692841600000"],["-240","RussiaAsia","ORA%sT","1110844800000"],["-300","-","ORAT",null]],"Asia/Bishkek":[["-298.4","-","LMT","-1441152000000"],["-300","-","FRUT","-1247529600000"],["-360","RussiaAsia","FRU%sT","670384800000"],["-300","1:00","FRUST","683604000000"],["-300","Kyrgyz","KG%sT","1123804800000"],["-360","-","KGT",null]],"Asia/Seoul":[["-507.8666666666667","-","LMT","-1948752000000"],["-510","-","KST","-1830384000000"],["-540","-","JCST","-1017792000000"],["-540","-","JST","-767318400000"],["-540","-","KST","-498096000000"],["-510","ROK","K%sT","-264902400000"],["-540","ROK","K%sT",null]],"Asia/Pyongyang":[["-503","-","LMT","-1948752000000"],["-510","-","KST","-1830384000000"],["-540","-","JCST","-1017792000000"],["-540","-","JST","-768614400000"],["-540","-","KST",null]],"Asia/Kuwait":[["-191.93333333333334","-","LMT","-599702400000"],["-180","-","AST",null]],"Asia/Beirut":[["-142","-","LMT","-2808604800000"],["-120","Lebanon","EE%sT",null]],"Asia/Kuala_Lumpur":[["-406.7666666666667","-","LMT","-2177452800000"],["-415.4166666666667","-","SMT","-2038176000000"],["-420","-","MALT","-1167609600000"],["-420","0:20","MALST","-1073001600000"],["-440","-","MALT","-894153600000"],["-450","-","MALT","-879638400000"],["-540","-","JST","-766972800000"],["-450","-","MALT","378691200000"],["-480","-","MYT",null]],"Asia/Kuching":[["-441.3333333333333","-","LMT","-1383436800000"],["-450","-","BORT","-1136160000000"],["-480","NBorneo","BOR%sT","-879638400000"],["-540","-","JST","-766972800000"],["-480","-","BORT","378691200000"],["-480","-","MYT",null]],"Indian/Maldives":[["-294","-","LMT","-2808604800000"],["-294","-","MMT","-284083200000"],["-300","-","MVT",null]],"Asia/Hovd":[["-366.6","-","LMT","-2032905600000"],["-360","-","HOVT","283910400000"],["-420","Mongol","HOV%sT",null]],"Asia/Ulaanbaatar":[["-427.5333333333333","-","LMT","-2032905600000"],["-420","-","ULAT","283910400000"],["-480","Mongol","ULA%sT",null]],"Asia/Choibalsan":[["-458","-","LMT","-2032905600000"],["-420","-","ULAT","283910400000"],["-480","-","ULAT","418003200000"],["-540","Mongol","CHO%sT","1206921600000"],["-480","Mongol","CHO%sT",null]],"Asia/Kathmandu":[["-341.2666666666667","-","LMT","-1546387200000"],["-330","-","IST","536371200000"],["-345","-","NPT",null]],"Asia/Muscat":[["-234.4","-","LMT","-1546387200000"],["-240","-","GST",null]],"Asia/Karachi":[["-268.2","-","LMT","-1956700800000"],["-330","-","IST","-862617600000"],["-330","1:00","IST","-764121600000"],["-330","-","IST","-576115200000"],["-300","-","KART","38793600000"],["-300","Pakistan","PK%sT",null]],"Asia/Gaza":[["-137.86666666666665","-","LMT","-2185401600000"],["-120","Zion","EET","-682646400000"],["-120","EgyptAsia","EE%sT","-81302400000"],["-120","Zion","I%sT","851990400000"],["-120","Jordan","EE%sT","946598400000"],["-120","Palestine","EE%sT","1219968000000"],["-120","-","EET","1220227200000"],["-120","Palestine","EE%sT","1293753600000"],["-120","-","EET","1269648060000"],["-120","Palestine","EE%sT","1312156800000"],["-120","-","EET","1356912000000"],["-120","Palestine","EE%sT",null]],"Asia/Hebron":[["-140.38333333333335","-","LMT","-2185401600000"],["-120","Zion","EET","-682646400000"],["-120","EgyptAsia","EE%sT","-81302400000"],["-120","Zion","I%sT","851990400000"],["-120","Jordan","EE%sT","946598400000"],["-120","Palestine","EE%sT",null]],"Asia/Manila":[["956","-","LMT","-3944678400000"],["-484","-","LMT","-2229292800000"],["-480","Phil","PH%sT","-873244800000"],["-540","-","JST","-794188800000"],["-480","Phil","PH%sT",null]],"Asia/Qatar":[["-206.13333333333335","-","LMT","-1546387200000"],["-240","-","GST","76204800000"],["-180","-","AST",null]],"Asia/Riyadh":[["-186.86666666666665","-","LMT","-719625600000"],["-180","-","AST",null]],"Asia/Singapore":[["-415.4166666666667","-","LMT","-2177452800000"],["-415.4166666666667","-","SMT","-2038176000000"],["-420","-","MALT","-1167609600000"],["-420","0:20","MALST","-1073001600000"],["-440","-","MALT","-894153600000"],["-450","-","MALT","-879638400000"],["-540","-","JST","-766972800000"],["-450","-","MALT","-138758400000"],["-450","-","SGT","378691200000"],["-480","-","SGT",null]],"Asia/Colombo":[["-319.4","-","LMT","-2808604800000"],["-319.5333333333333","-","MMT","-1988236800000"],["-330","-","IST","-883267200000"],["-330","0:30","IHST","-862617600000"],["-330","1:00","IST","-764028000000"],["-330","-","IST","832982400000"],["-390","-","LKT","846289800000"],["-360","-","LKT","1145061000000"],["-330","-","IST",null]],"Asia/Damascus":[["-145.2","-","LMT","-1546387200000"],["-120","Syria","EE%sT",null]],"Asia/Dushanbe":[["-275.2","-","LMT","-1441152000000"],["-300","-","DUST","-1247529600000"],["-360","RussiaAsia","DUS%sT","670384800000"],["-300","1:00","DUSST","684381600000"],["-300","-","TJT",null]],"Asia/Bangkok":[["-402.06666666666666","-","LMT","-2808604800000"],["-402.06666666666666","-","BMT","-1570060800000"],["-420","-","ICT",null]],"Asia/Phnom_Penh":"Asia/Bangkok","Asia/Vientiane":"Asia/Bangkok","Asia/Ashgabat":[["-233.53333333333333","-","LMT","-1441152000000"],["-240","-","ASHT","-1247529600000"],["-300","RussiaAsia","ASH%sT","670384800000"],["-240","RussiaAsia","ASH%sT","688521600000"],["-240","RussiaAsia","TM%sT","695786400000"],["-300","-","TMT",null]],"Asia/Dubai":[["-221.2","-","LMT","-1546387200000"],["-240","-","GST",null]],"Asia/Samarkand":[["-267.8833333333333","-","LMT","-1441152000000"],["-240","-","SAMT","-1247529600000"],["-300","-","SAMT","354931200000"],["-300","1:00","SAMST","370742400000"],["-360","-","TAST","386467200000"],["-300","RussiaAsia","SAM%sT","683683200000"],["-300","RussiaAsia","UZ%sT","725760000000"],["-300","-","UZT",null]],"Asia/Tashkent":[["-277.18333333333334","-","LMT","-1441152000000"],["-300","-","TAST","-1247529600000"],["-360","RussiaAsia","TAS%sT","670384800000"],["-300","RussiaAsia","TAS%sT","683683200000"],["-300","RussiaAsia","UZ%sT","725760000000"],["-300","-","UZT",null]],"Asia/Ho_Chi_Minh":[["-426.6666666666667","-","LMT","-2004048000000"],["-426.5","-","PLMT","-1851552000000"],["-420","-","ICT","-852080400000"],["-480","-","IDT","-782614800000"],["-540","-","JST","-767836800000"],["-420","-","ICT","-718070400000"],["-480","-","IDT","-457747200000"],["-420","-","ICT","-315622800000"],["-480","-","IDT","171849600000"],["-420","-","ICT",null]],"Asia/Aden":[["-179.9","-","LMT","-599702400000"],["-180","-","AST",null]],"Australia/Darwin":[["-523.3333333333333","-","LMT","-2364076800000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT",null]],"Australia/Perth":[["-463.4","-","LMT","-2337897600000"],["-480","Aus","AW%sT","-836438400000"],["-480","AW","AW%sT",null]],"Australia/Eucla":[["-515.4666666666667","-","LMT","-2337897600000"],["-525","Aus","ACW%sT","-836438400000"],["-525","AW","ACW%sT",null]],"Australia/Brisbane":[["-612.1333333333333","-","LMT","-2335305600000"],["-600","Aus","AE%sT","62985600000"],["-600","AQ","AE%sT",null]],"Australia/Lindeman":[["-595.9333333333334","-","LMT","-2335305600000"],["-600","Aus","AE%sT","62985600000"],["-600","AQ","AE%sT","709948800000"],["-600","Holiday","AE%sT",null]],"Australia/Adelaide":[["-554.3333333333334","-","LMT","-2364076800000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT","62985600000"],["-570","AS","AC%sT",null]],"Australia/Hobart":[["-589.2666666666667","-","LMT","-2345760000000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","-63244800000"],["-600","AT","AE%sT",null]],"Australia/Currie":[["-575.4666666666666","-","LMT","-2345760000000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","47174400000"],["-600","AT","AE%sT",null]],"Australia/Melbourne":[["-579.8666666666667","-","LMT","-2364076800000"],["-600","Aus","AE%sT","62985600000"],["-600","AV","AE%sT",null]],"Australia/Sydney":[["-604.8666666666667","-","LMT","-2364076800000"],["-600","Aus","AE%sT","62985600000"],["-600","AN","AE%sT",null]],"Australia/Broken_Hill":[["-565.8","-","LMT","-2364076800000"],["-600","-","AEST","-2314915200000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT","62985600000"],["-570","AN","AC%sT","978220800000"],["-570","AS","AC%sT",null]],"Australia/Lord_Howe":[["-636.3333333333334","-","LMT","-2364076800000"],["-600","-","AEST","352252800000"],["-630","LH","LH%sT",null]],"Antarctica/Macquarie":[["0","-","zzz","-2214259200000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","-1601683200000"],["0","-","zzz","-687052800000"],["-600","Aus","AE%sT","-63244800000"],["-600","AT","AE%sT","1270350000000"],["-660","-","MIST",null]],"Indian/Christmas":[["-422.8666666666667","-","LMT","-2364076800000"],["-420","-","CXT",null]],"Indian/Cocos":[["-387.6666666666667","-","LMT","-2177539200000"],["-390","-","CCT",null]],"Pacific/Fiji":[["-715.7333333333333","-","LMT","-1709942400000"],["-720","Fiji","FJ%sT",null]],"Pacific/Gambier":[["539.8","-","LMT","-1806710400000"],["540","-","GAMT",null]],"Pacific/Marquesas":[["558","-","LMT","-1806710400000"],["570","-","MART",null]],"Pacific/Tahiti":[["598.2666666666667","-","LMT","-1806710400000"],["600","-","TAHT",null]],"Pacific/Guam":[["861","-","LMT","-3944678400000"],["-579","-","LMT","-2146003200000"],["-600","-","GST","977529600000"],["-600","-","ChST",null]],"Pacific/Tarawa":[["-692.0666666666666","-","LMT","-2146003200000"],["-720","-","GILT",null]],"Pacific/Enderbury":[["684.3333333333334","-","LMT","-2146003200000"],["720","-","PHOT","307584000000"],["660","-","PHOT","820368000000"],["-780","-","PHOT",null]],"Pacific/Kiritimati":[["629.3333333333334","-","LMT","-2146003200000"],["640","-","LINT","307584000000"],["600","-","LINT","820368000000"],["-840","-","LINT",null]],"Pacific/Saipan":[["857","-","LMT","-3944678400000"],["-583","-","LMT","-2146003200000"],["-540","-","MPT","-7948800000"],["-600","-","MPT","977529600000"],["-600","-","ChST",null]],"Pacific/Majuro":[["-684.8","-","LMT","-2146003200000"],["-660","-","MHT","-7948800000"],["-720","-","MHT",null]],"Pacific/Kwajalein":[["-669.3333333333334","-","LMT","-2146003200000"],["-660","-","MHT","-7948800000"],["720","-","KWAT","745804800000"],["-720","-","MHT",null]],"Pacific/Chuuk":[["-607.1333333333333","-","LMT","-2146003200000"],["-600","-","CHUT",null]],"Pacific/Pohnpei":[["-632.8666666666667","-","LMT","-2146003200000"],["-660","-","PONT",null]],"Pacific/Kosrae":[["-651.9333333333334","-","LMT","-2146003200000"],["-660","-","KOST","-7948800000"],["-720","-","KOST","946598400000"],["-660","-","KOST",null]],"Pacific/Nauru":[["-667.6666666666666","-","LMT","-1545091200000"],["-690","-","NRT","-877305600000"],["-540","-","JST","-800928000000"],["-690","-","NRT","294364800000"],["-720","-","NRT",null]],"Pacific/Noumea":[["-665.8","-","LMT","-1829347200000"],["-660","NC","NC%sT",null]],"Pacific/Auckland":[["-699.0666666666666","-","LMT","-3192393600000"],["-690","NZ","NZ%sT","-757382400000"],["-720","NZ","NZ%sT",null]],"Pacific/Chatham":[["-733.8","-","LMT","-3192393600000"],["-735","-","CHAST","-757382400000"],["-765","Chatham","CHA%sT",null]],"Antarctica/McMurdo":"Pacific/Auckland","Pacific/Rarotonga":[["639.0666666666666","-","LMT","-2146003200000"],["630","-","CKT","279676800000"],["600","Cook","CK%sT",null]],"Pacific/Niue":[["679.6666666666666","-","LMT","-2146003200000"],["680","-","NUT","-568166400000"],["690","-","NUT","276048000000"],["660","-","NUT",null]],"Pacific/Norfolk":[["-671.8666666666667","-","LMT","-2146003200000"],["-672","-","NMT","-568166400000"],["-690","-","NFT",null]],"Pacific/Palau":[["-537.9333333333334","-","LMT","-2146003200000"],["-540","-","PWT",null]],"Pacific/Port_Moresby":[["-588.6666666666666","-","LMT","-2808604800000"],["-588.5333333333334","-","PMMT","-2335305600000"],["-600","-","PGT",null]],"Pacific/Bougainville":[["-622.2666666666667","-","LMT","-2808604800000"],["-588.5333333333334","-","PMMT","-2335305600000"],["-600","-","PGT","-867974400000"],["-540","-","JST","-768873600000"],["-600","-","PGT","1419732000000"],["-660","-","BST",null]],"Pacific/Pitcairn":[["520.3333333333333","-","LMT","-2146003200000"],["510","-","PNT","893635200000"],["480","-","PST",null]],"Pacific/Pago_Pago":[["-757.2","-","LMT","-2855692800000"],["682.8","-","LMT","-1830470400000"],["660","-","NST","-86918400000"],["660","-","BST","438998400000"],["660","-","SST",null]],"Pacific/Apia":[["-753.0666666666666","-","LMT","-2855692800000"],["686.9333333333334","-","LMT","-1830470400000"],["690","-","WSST","-599702400000"],["660","WS","S%sT","1325203200000"],["-780","WS","WS%sT",null]],"Pacific/Guadalcanal":[["-639.8","-","LMT","-1806710400000"],["-660","-","SBT",null]],"Pacific/Fakaofo":[["684.9333333333334","-","LMT","-2146003200000"],["660","-","TKT","1325203200000"],["-780","-","TKT",null]],"Pacific/Tongatapu":[["-739.3333333333334","-","LMT","-2146003200000"],["-740","-","TOT","-883699200000"],["-780","-","TOT","946598400000"],["-780","Tonga","TO%sT",null]],"Pacific/Funafuti":[["-716.8666666666667","-","LMT","-2146003200000"],["-720","-","TVT",null]],"Pacific/Midway":[["709.4666666666666","-","LMT","-2146003200000"],["660","-","NST","-428544000000"],["660","1:00","NDT","-420681600000"],["660","-","NST","-86918400000"],["660","-","BST","438998400000"],["660","-","SST",null]],"Pacific/Wake":[["-666.4666666666666","-","LMT","-2146003200000"],["-720","-","WAKT",null]],"Pacific/Efate":[["-673.2666666666667","-","LMT","-1829347200000"],["-660","Vanuatu","VU%sT",null]],"Pacific/Wallis":[["-735.3333333333334","-","LMT","-2146003200000"],["-720","-","WFT",null]],"Africa/Asmera":"Africa/Asmara","Africa/Timbuktu":"Africa/Abidjan","America/Argentina/ComodRivadavia":"America/Argentina/Catamarca","America/Atka":"America/Adak","America/Buenos_Aires":"America/Argentina/Buenos_Aires","America/Catamarca":"America/Argentina/Catamarca","America/Coral_Harbour":"America/Atikokan","America/Cordoba":"America/Argentina/Cordoba","America/Ensenada":"America/Tijuana","America/Fort_Wayne":"America/Indiana/Indianapolis","America/Indianapolis":"America/Indiana/Indianapolis","America/Jujuy":"America/Argentina/Jujuy","America/Knox_IN":"America/Indiana/Knox","America/Louisville":"America/Kentucky/Louisville","America/Mendoza":"America/Argentina/Mendoza","America/Porto_Acre":"America/Rio_Branco","America/Rosario":"America/Argentina/Cordoba","America/Shiprock":"America/Denver","America/Virgin":"America/Port_of_Spain","Antarctica/South_Pole":"Pacific/Auckland","Asia/Ashkhabad":"Asia/Ashgabat","Asia/Calcutta":"Asia/Kolkata","Asia/Chongqing":"Asia/Shanghai","Asia/Chungking":"Asia/Shanghai","Asia/Dacca":"Asia/Dhaka","Asia/Harbin":"Asia/Shanghai","Asia/Kashgar":"Asia/Urumqi","Asia/Katmandu":"Asia/Kathmandu","Asia/Macao":"Asia/Macau","Asia/Saigon":"Asia/Ho_Chi_Minh","Asia/Tel_Aviv":"Asia/Jerusalem","Asia/Thimbu":"Asia/Thimphu","Asia/Ujung_Pandang":"Asia/Makassar","Asia/Ulan_Bator":"Asia/Ulaanbaatar","Atlantic/Faeroe":"Atlantic/Faroe","Atlantic/Jan_Mayen":"Europe/Oslo","Australia/ACT":"Australia/Sydney","Australia/Canberra":"Australia/Sydney","Australia/LHI":"Australia/Lord_Howe","Australia/NSW":"Australia/Sydney","Australia/North":"Australia/Darwin","Australia/Queensland":"Australia/Brisbane","Australia/South":"Australia/Adelaide","Australia/Tasmania":"Australia/Hobart","Australia/Victoria":"Australia/Melbourne","Australia/West":"Australia/Perth","Australia/Yancowinna":"Australia/Broken_Hill","Brazil/Acre":"America/Rio_Branco","Brazil/DeNoronha":"America/Noronha","Brazil/East":"America/Sao_Paulo","Brazil/West":"America/Manaus","Canada/Atlantic":"America/Halifax","Canada/Central":"America/Winnipeg","Canada/East-Saskatchewan":"America/Regina","Canada/Eastern":"America/Toronto","Canada/Mountain":"America/Edmonton","Canada/Newfoundland":"America/St_Johns","Canada/Pacific":"America/Vancouver","Canada/Saskatchewan":"America/Regina","Canada/Yukon":"America/Whitehorse","Chile/Continental":"America/Santiago","Chile/EasterIsland":"Pacific/Easter","Cuba":"America/Havana","Egypt":"Africa/Cairo","Eire":"Europe/Dublin","Europe/Belfast":"Europe/London","Europe/Tiraspol":"Europe/Chisinau","GB":"Europe/London","GB-Eire":"Europe/London","GMT+0":"Etc/GMT","GMT-0":"Etc/GMT","GMT0":"Etc/GMT","Greenwich":"Etc/GMT","Hongkong":"Asia/Hong_Kong","Iceland":"Atlantic/Reykjavik","Iran":"Asia/Tehran","Israel":"Asia/Jerusalem","Jamaica":"America/Jamaica","Japan":"Asia/Tokyo","Kwajalein":"Pacific/Kwajalein","Libya":"Africa/Tripoli","Mexico/BajaNorte":"America/Tijuana","Mexico/BajaSur":"America/Mazatlan","Mexico/General":"America/Mexico_City","NZ":"Pacific/Auckland","NZ-CHAT":"Pacific/Chatham","Navajo":"America/Denver","PRC":"Asia/Shanghai","Pacific/Ponape":"Pacific/Pohnpei","Pacific/Samoa":"Pacific/Pago_Pago","Pacific/Truk":"Pacific/Chuuk","Pacific/Yap":"Pacific/Chuuk","Poland":"Europe/Warsaw","Portugal":"Europe/Lisbon","ROC":"Asia/Taipei","ROK":"Asia/Seoul","Singapore":"Asia/Singapore","Turkey":"Europe/Istanbul","UCT":"Etc/UCT","US/Alaska":"America/Anchorage","US/Aleutian":"America/Adak","US/Arizona":"America/Phoenix","US/Central":"America/Chicago","US/East-Indiana":"America/Indiana/Indianapolis","US/Eastern":"America/New_York","US/Hawaii":"Pacific/Honolulu","US/Indiana-Starke":"America/Indiana/Knox","US/Michigan":"America/Detroit","US/Mountain":"America/Denver","US/Pacific":"America/Los_Angeles","US/Samoa":"Pacific/Pago_Pago","UTC":"Etc/UTC","Universal":"Etc/UTC","W-SU":"Europe/Moscow","Zulu":"Etc/UTC","Etc/GMT":[["0","-","GMT",null]],"Etc/UTC":[["0","-","UTC",null]],"Etc/UCT":[["0","-","UCT",null]],"GMT":"Etc/GMT","Etc/Universal":"Etc/UTC","Etc/Zulu":"Etc/UTC","Etc/Greenwich":"Etc/GMT","Etc/GMT-0":"Etc/GMT","Etc/GMT+0":"Etc/GMT","Etc/GMT0":"Etc/GMT","Etc/GMT-14":[["-840","-","GMT-14",null]],"Etc/GMT-13":[["-780","-","GMT-13",null]],"Etc/GMT-12":[["-720","-","GMT-12",null]],"Etc/GMT-11":[["-660","-","GMT-11",null]],"Etc/GMT-10":[["-600","-","GMT-10",null]],"Etc/GMT-9":[["-540","-","GMT-9",null]],"Etc/GMT-8":[["-480","-","GMT-8",null]],"Etc/GMT-7":[["-420","-","GMT-7",null]],"Etc/GMT-6":[["-360","-","GMT-6",null]],"Etc/GMT-5":[["-300","-","GMT-5",null]],"Etc/GMT-4":[["-240","-","GMT-4",null]],"Etc/GMT-3":[["-180","-","GMT-3",null]],"Etc/GMT-2":[["-120","-","GMT-2",null]],"Etc/GMT-1":[["-60","-","GMT-1",null]],"Etc/GMT+1":[["60","-","GMT+1",null]],"Etc/GMT+2":[["120","-","GMT+2",null]],"Etc/GMT+3":[["180","-","GMT+3",null]],"Etc/GMT+4":[["240","-","GMT+4",null]],"Etc/GMT+5":[["300","-","GMT+5",null]],"Etc/GMT+6":[["360","-","GMT+6",null]],"Etc/GMT+7":[["420","-","GMT+7",null]],"Etc/GMT+8":[["480","-","GMT+8",null]],"Etc/GMT+9":[["540","-","GMT+9",null]],"Etc/GMT+10":[["600","-","GMT+10",null]],"Etc/GMT+11":[["660","-","GMT+11",null]],"Etc/GMT+12":[["720","-","GMT+12",null]],"Europe/London":[["1.25","-","LMT","-3852662400000"],["0","GB-Eire","%s","-37238400000"],["-60","-","BST","57722400000"],["0","GB-Eire","%s","851990400000"],["0","EU","GMT/BST",null]],"Europe/Jersey":"Europe/London","Europe/Guernsey":"Europe/London","Europe/Isle_of_Man":"Europe/London","Europe/Dublin":[["25","-","LMT","-2821651200000"],["25.35","-","DMT","-1691964000000"],["25.35","1:00","IST","-1680472800000"],["0","GB-Eire","%s","-1517011200000"],["0","GB-Eire","GMT/IST","-942012000000"],["0","1:00","IST","-733356000000"],["0","-","GMT","-719445600000"],["0","1:00","IST","-699487200000"],["0","-","GMT","-684972000000"],["0","GB-Eire","GMT/IST","-37238400000"],["-60","-","IST","57722400000"],["0","GB-Eire","GMT/IST","851990400000"],["0","EU","GMT/IST",null]],"WET":[["0","EU","WE%sT",null]],"CET":[["-60","C-Eur","CE%sT",null]],"MET":[["-60","C-Eur","ME%sT",null]],"EET":[["-120","EU","EE%sT",null]],"Europe/Tirane":[["-79.33333333333333","-","LMT","-1735776000000"],["-60","-","CET","-932342400000"],["-60","Albania","CE%sT","457488000000"],["-60","EU","CE%sT",null]],"Europe/Andorra":[["-6.066666666666667","-","LMT","-2146003200000"],["0","-","WET","-733881600000"],["-60","-","CET","481082400000"],["-60","EU","CE%sT",null]],"Europe/Vienna":[["-65.35","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-1546387200000"],["-60","Austria","CE%sT","-938901600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","1:00","CEST","-780184800000"],["-60","-","CET","-725932800000"],["-60","Austria","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Minsk":[["-110.26666666666667","-","LMT","-2808604800000"],["-110","-","MMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-899769600000"],["-60","C-Eur","CE%sT","-804643200000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","670384800000"],["-120","1:00","EEST","686109600000"],["-120","-","EET","701827200000"],["-120","1:00","EEST","717552000000"],["-120","Russia","EE%sT","1301191200000"],["-180","-","FET","1414285200000"],["-180","-","MSK",null]],"Europe/Brussels":[["-17.5","-","LMT","-2808604800000"],["-17.5","-","BMT","-2450952000000"],["0","-","WET","-1740355200000"],["-60","-","CET","-1693699200000"],["-60","C-Eur","CE%sT","-1613826000000"],["0","Belgium","WE%sT","-934668000000"],["-60","C-Eur","CE%sT","-799286400000"],["-60","Belgium","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Sofia":[["-93.26666666666667","-","LMT","-2808604800000"],["-116.93333333333332","-","IMT","-2369520000000"],["-120","-","EET","-857250000000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","-","CET","-781045200000"],["-120","-","EET","291769200000"],["-120","Bulg","EE%sT","401853600000"],["-120","C-Eur","EE%sT","694137600000"],["-120","E-Eur","EE%sT","883526400000"],["-120","EU","EE%sT",null]],"Europe/Prague":[["-57.733333333333334","-","LMT","-3755376000000"],["-57.733333333333334","-","PMT","-2469398400000"],["-60","C-Eur","CE%sT","-798069600000"],["-60","Czech","CE%sT","315446400000"],["-60","EU","CE%sT",null]],"Europe/Copenhagen":[["-50.333333333333336","-","LMT","-2493072000000"],["-50.333333333333336","-","CMT","-2398291200000"],["-60","Denmark","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Denmark","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Atlantic/Faroe":[["27.066666666666666","-","LMT","-1955750400000"],["0","-","WET","378604800000"],["0","EU","WE%sT",null]],"America/Danmarkshavn":[["74.66666666666667","-","LMT","-1686096000000"],["180","-","WGT","323834400000"],["180","EU","WG%sT","851990400000"],["0","-","GMT",null]],"America/Scoresbysund":[["87.86666666666667","-","LMT","-1686096000000"],["120","-","CGT","323834400000"],["120","C-Eur","CG%sT","354672000000"],["60","EU","EG%sT",null]],"America/Godthab":[["206.93333333333334","-","LMT","-1686096000000"],["180","-","WGT","323834400000"],["180","EU","WG%sT",null]],"America/Thule":[["275.1333333333333","-","LMT","-1686096000000"],["240","Thule","A%sT",null]],"Europe/Tallinn":[["-99","-","LMT","-2808604800000"],["-99","-","TMT","-1638316800000"],["-60","C-Eur","CE%sT","-1593820800000"],["-99","-","TMT","-1535932800000"],["-120","-","EET","-927936000000"],["-180","-","MSK","-892944000000"],["-60","C-Eur","CE%sT","-797644800000"],["-180","Russia","MSK/MSD","606880800000"],["-120","1:00","EEST","622605600000"],["-120","C-Eur","EE%sT","906422400000"],["-120","EU","EE%sT","941414400000"],["-120","-","EET","1014249600000"],["-120","EU","EE%sT",null]],"Europe/Helsinki":[["-99.81666666666668","-","LMT","-2890252800000"],["-99.81666666666668","-","HMT","-1535932800000"],["-120","Finland","EE%sT","441676800000"],["-120","EU","EE%sT",null]],"Europe/Mariehamn":"Europe/Helsinki","Europe/Paris":[["-9.35","-","LMT","-2486678340000"],["-9.35","-","PMT","-1855958340000"],["0","France","WE%sT","-932432400000"],["-60","C-Eur","CE%sT","-800064000000"],["0","France","WE%sT","-766616400000"],["-60","France","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Berlin":[["-53.46666666666666","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-776556000000"],["-60","SovietZone","CE%sT","-725932800000"],["-60","Germany","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Europe/Busingen":"Europe/Zurich","Europe/Gibraltar":[["21.4","-","LMT","-2821651200000"],["0","GB-Eire","%s","-401320800000"],["-60","-","CET","410140800000"],["-60","EU","CE%sT",null]],"Europe/Athens":[["-94.86666666666667","-","LMT","-2344636800000"],["-94.86666666666667","-","AMT","-1686095940000"],["-120","Greece","EE%sT","-904867200000"],["-60","Greece","CE%sT","-812419200000"],["-120","Greece","EE%sT","378604800000"],["-120","EU","EE%sT",null]],"Europe/Budapest":[["-76.33333333333333","-","LMT","-2500934400000"],["-60","C-Eur","CE%sT","-1609545600000"],["-60","Hungary","CE%sT","-906768000000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","Hungary","CE%sT","338954400000"],["-60","EU","CE%sT",null]],"Atlantic/Reykjavik":[["87.4","-","LMT","-4165603200000"],["87.8","-","RMT","-1925078400000"],["60","Iceland","IS%sT","-54774000000"],["0","-","GMT",null]],"Europe/Rome":[["-49.93333333333334","-","LMT","-3259094400000"],["-49.93333333333334","-","RMT","-2403561600000"],["-60","Italy","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-804816000000"],["-60","Italy","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Europe/Vatican":"Europe/Rome","Europe/San_Marino":"Europe/Rome","Europe/Riga":[["-96.56666666666668","-","LMT","-2808604800000"],["-96.56666666666668","-","RMT","-1632002400000"],["-96.56666666666668","1:00","LST","-1618693200000"],["-96.56666666666668","-","RMT","-1601676000000"],["-96.56666666666668","1:00","LST","-1597266000000"],["-96.56666666666668","-","RMT","-1377302400000"],["-120","-","EET","-928022400000"],["-180","-","MSK","-899510400000"],["-60","C-Eur","CE%sT","-795830400000"],["-180","Russia","MSK/MSD","604720800000"],["-120","1:00","EEST","620618400000"],["-120","Latvia","EE%sT","853804800000"],["-120","EU","EE%sT","951782400000"],["-120","-","EET","978393600000"],["-120","EU","EE%sT",null]],"Europe/Vaduz":"Europe/Zurich","Europe/Vilnius":[["-101.26666666666667","-","LMT","-2808604800000"],["-84","-","WMT","-1641081600000"],["-95.6","-","KMT","-1585094400000"],["-60","-","CET","-1561248000000"],["-120","-","EET","-1553558400000"],["-60","-","CET","-928195200000"],["-180","-","MSK","-900115200000"],["-60","C-Eur","CE%sT","-802137600000"],["-180","Russia","MSK/MSD","670384800000"],["-120","1:00","EEST","686109600000"],["-120","C-Eur","EE%sT","915062400000"],["-120","-","EET","891133200000"],["-60","EU","CE%sT","941331600000"],["-120","-","EET","1041379200000"],["-120","EU","EE%sT",null]],"Europe/Luxembourg":[["-24.6","-","LMT","-2069712000000"],["-60","Lux","CE%sT","-1612656000000"],["0","Lux","WE%sT","-1269813600000"],["0","Belgium","WE%sT","-935182800000"],["-60","C-Eur","WE%sT","-797979600000"],["-60","Belgium","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Malta":[["-58.06666666666666","-","LMT","-2403475200000"],["-60","Italy","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Italy","CE%sT","102384000000"],["-60","Malta","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Chisinau":[["-115.33333333333333","-","LMT","-2808604800000"],["-115","-","CMT","-1637107200000"],["-104.4","-","BMT","-1213142400000"],["-120","Romania","EE%sT","-927158400000"],["-120","1:00","EEST","-898128000000"],["-60","C-Eur","CE%sT","-800150400000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","641952000000"],["-120","-","EET","694137600000"],["-120","Russia","EE%sT","725760000000"],["-120","E-Eur","EE%sT","883526400000"],["-120","EU","EE%sT",null]],"Europe/Monaco":[["-29.53333333333333","-","LMT","-2486678400000"],["-9.35","-","PMT","-1855958400000"],["0","France","WE%sT","-766616400000"],["-60","France","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Amsterdam":[["-19.53333333333333","-","LMT","-4228761600000"],["-19.53333333333333","Neth","%s","-1025740800000"],["-20","Neth","NE%sT","-935020800000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Neth","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Oslo":[["-43","-","LMT","-2366755200000"],["-60","Norway","CE%sT","-927507600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Norway","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Arctic/Longyearbyen":"Europe/Oslo","Europe/Warsaw":[["-84","-","LMT","-2808604800000"],["-84","-","WMT","-1717027200000"],["-60","C-Eur","CE%sT","-1618693200000"],["-120","Poland","EE%sT","-1501718400000"],["-60","Poland","CE%sT","-931730400000"],["-60","C-Eur","CE%sT","-796867200000"],["-60","Poland","CE%sT","252374400000"],["-60","W-Eur","CE%sT","599529600000"],["-60","EU","CE%sT",null]],"Europe/Lisbon":[["36.75","-","LMT","-2682374400000"],["36.75","-","LMT","-1830384000000"],["0","Port","WE%sT","-118274400000"],["-60","-","CET","212547600000"],["0","Port","WE%sT","433299600000"],["0","W-Eur","WE%sT","717555600000"],["-60","EU","CE%sT","828234000000"],["0","EU","WE%sT",null]],"Atlantic/Azores":[["102.66666666666667","-","LMT","-2682374400000"],["114.53333333333333","-","HMT","-1830384000000"],["120","Port","AZO%sT","-118274400000"],["60","Port","AZO%sT","433299600000"],["60","W-Eur","AZO%sT","717555600000"],["0","EU","WE%sT","733280400000"],["60","EU","AZO%sT",null]],"Atlantic/Madeira":[["67.6","-","LMT","-2682374400000"],["67.6","-","FMT","-1830384000000"],["60","Port","MAD%sT","-118274400000"],["0","Port","WE%sT","433299600000"],["0","EU","WE%sT",null]],"Europe/Bucharest":[["-104.4","-","LMT","-2469398400000"],["-104.4","-","BMT","-1213142400000"],["-120","Romania","EE%sT","354679200000"],["-120","C-Eur","EE%sT","694137600000"],["-120","Romania","EE%sT","788832000000"],["-120","E-Eur","EE%sT","883526400000"],["-120","EU","EE%sT",null]],"Europe/Kaliningrad":[["-82","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-757468800000"],["-120","Poland","CE%sT","-725932800000"],["-180","Russia","MSK/MSD","670384800000"],["-120","Russia","EE%sT","1301191200000"],["-180","-","FET","1414288800000"],["-120","-","EET",null]],"Europe/Moscow":[["-150.28333333333333","-","LMT","-2808604800000"],["-150.28333333333333","-","MMT","-1688256000000"],["-151.31666666666666","Russia","%s","-1593813600000"],["-180","Russia","%s","-1522713600000"],["-180","Russia","MSK/MSD","-1491177600000"],["-120","-","EET","-1247529600000"],["-180","Russia","MSK/MSD","670384800000"],["-120","Russia","EE%sT","695786400000"],["-180","Russia","MSK/MSD","1301191200000"],["-240","-","MSK","1414288800000"],["-180","-","MSK",null]],"Europe/Simferopol":[["-136.4","-","LMT","-2808604800000"],["-136","-","SMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-888883200000"],["-60","C-Eur","CE%sT","-811641600000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","646797600000"],["-120","-","EET","725760000000"],["-120","E-Eur","EE%sT","767750400000"],["-180","E-Eur","MSK/MSD","828241200000"],["-180","1:00","MSD","846385200000"],["-180","Russia","MSK/MSD","883526400000"],["-180","-","MSK","857178000000"],["-120","EU","EE%sT","1396144800000"],["-240","-","MSK","1414288800000"],["-180","-","MSK",null]],"Europe/Volgograd":[["-177.66666666666666","-","LMT","-1577750400000"],["-180","-","TSAT","-1411862400000"],["-180","-","STAT","-1247529600000"],["-240","-","STAT","-256867200000"],["-240","Russia","VOL%sT","606880800000"],["-180","Russia","VOL%sT","670384800000"],["-240","-","VOLT","701834400000"],["-180","Russia","MSK","1301191200000"],["-240","-","MSK","1414288800000"],["-180","-","MSK",null]],"Europe/Samara":[["-200.33333333333334","-","LMT","-1593813600000"],["-180","-","SAMT","-1247529600000"],["-240","-","SAMT","-1102291200000"],["-240","Russia","KUY%sT","606880800000"],["-180","Russia","MSK/MSD","670384800000"],["-120","Russia","EE%sT","686109600000"],["-180","-","KUYT","687927600000"],["-240","Russia","SAM%sT","1269741600000"],["-180","Russia","SAM%sT","1301191200000"],["-240","-","SAMT",null]],"Asia/Yekaterinburg":[["-242.55","-","LMT","-1688256000000"],["-225.08333333333334","-","PMT","-1592596800000"],["-240","-","SVET","-1247529600000"],["-300","Russia","SVE%sT","670384800000"],["-240","Russia","SVE%sT","695786400000"],["-300","Russia","YEK%sT","1301191200000"],["-360","-","YEKT","1414288800000"],["-300","-","YEKT",null]],"Asia/Omsk":[["-293.5","-","LMT","-1582070400000"],["-300","-","OMST","-1247529600000"],["-360","Russia","OMS%sT","670384800000"],["-300","Russia","OMS%sT","695786400000"],["-360","Russia","OMS%sT","1301191200000"],["-420","-","OMST","1414288800000"],["-360","-","OMST",null]],"Asia/Novosibirsk":[["-331.6666666666667","-","LMT","-1579456800000"],["-360","-","NOVT","-1247529600000"],["-420","Russia","NOV%sT","670384800000"],["-360","Russia","NOV%sT","695786400000"],["-420","Russia","NOV%sT","738115200000"],["-360","Russia","NOV%sT","1301191200000"],["-420","-","NOVT","1414288800000"],["-360","-","NOVT",null]],"Asia/Novokuznetsk":[["-348.8","-","LMT","-1441238400000"],["-360","-","KRAT","-1247529600000"],["-420","Russia","KRA%sT","670384800000"],["-360","Russia","KRA%sT","695786400000"],["-420","Russia","KRA%sT","1269741600000"],["-360","Russia","NOV%sT","1301191200000"],["-420","-","NOVT","1414288800000"],["-420","-","KRAT",null]],"Asia/Krasnoyarsk":[["-371.43333333333334","-","LMT","-1577491200000"],["-360","-","KRAT","-1247529600000"],["-420","Russia","KRA%sT","670384800000"],["-360","Russia","KRA%sT","695786400000"],["-420","Russia","KRA%sT","1301191200000"],["-480","-","KRAT","1414288800000"],["-420","-","KRAT",null]],"Asia/Irkutsk":[["-417.0833333333333","-","LMT","-2808604800000"],["-417.0833333333333","-","IMT","-1575849600000"],["-420","-","IRKT","-1247529600000"],["-480","Russia","IRK%sT","670384800000"],["-420","Russia","IRK%sT","695786400000"],["-480","Russia","IRK%sT","1301191200000"],["-540","-","IRKT","1414288800000"],["-480","-","IRKT",null]],"Asia/Chita":[["-453.8666666666667","-","LMT","-1579392000000"],["-480","-","YAKT","-1247529600000"],["-540","Russia","YAK%sT","670384800000"],["-480","Russia","YAK%sT","695786400000"],["-540","Russia","YAK%sT","1301191200000"],["-600","-","YAKT","1414288800000"],["-480","-","IRKT",null]],"Asia/Yakutsk":[["-518.9666666666667","-","LMT","-1579392000000"],["-480","-","YAKT","-1247529600000"],["-540","Russia","YAK%sT","670384800000"],["-480","Russia","YAK%sT","695786400000"],["-540","Russia","YAK%sT","1301191200000"],["-600","-","YAKT","1414288800000"],["-540","-","YAKT",null]],"Asia/Vladivostok":[["-527.5166666666667","-","LMT","-1487289600000"],["-540","-","VLAT","-1247529600000"],["-600","Russia","VLA%sT","670384800000"],["-540","Russia","VLA%sT","695786400000"],["-600","Russia","VLA%sT","1301191200000"],["-660","-","VLAT","1414288800000"],["-600","-","VLAT",null]],"Asia/Khandyga":[["-542.2166666666666","-","LMT","-1579392000000"],["-480","-","YAKT","-1247529600000"],["-540","Russia","YAK%sT","670384800000"],["-480","Russia","YAK%sT","695786400000"],["-540","Russia","YAK%sT","1104451200000"],["-600","Russia","VLA%sT","1301191200000"],["-660","-","VLAT","1315872000000"],["-600","-","YAKT","1414288800000"],["-540","-","YAKT",null]],"Asia/Sakhalin":[["-570.8","-","LMT","-2031004800000"],["-540","-","JCST","-1017792000000"],["-540","-","JST","-768528000000"],["-660","Russia","SAK%sT","670384800000"],["-600","Russia","SAK%sT","695786400000"],["-660","Russia","SAK%sT","857181600000"],["-600","Russia","SAK%sT","1301191200000"],["-660","-","SAKT","1414288800000"],["-600","-","SAKT",null]],"Asia/Magadan":[["-603.2","-","LMT","-1441152000000"],["-600","-","MAGT","-1247529600000"],["-660","Russia","MAG%sT","670384800000"],["-600","Russia","MAG%sT","695786400000"],["-660","Russia","MAG%sT","1301191200000"],["-720","-","MAGT","1414288800000"],["-600","-","MAGT",null]],"Asia/Srednekolymsk":[["-614.8666666666667","-","LMT","-1441152000000"],["-600","-","MAGT","-1247529600000"],["-660","Russia","MAG%sT","670384800000"],["-600","Russia","MAG%sT","695786400000"],["-660","Russia","MAG%sT","1301191200000"],["-720","-","MAGT","1414288800000"],["-660","-","SRET",null]],"Asia/Ust-Nera":[["-572.9","-","LMT","-1579392000000"],["-480","-","YAKT","-1247529600000"],["-540","Russia","YAKT","354931200000"],["-660","Russia","MAG%sT","670384800000"],["-600","Russia","MAG%sT","695786400000"],["-660","Russia","MAG%sT","1301191200000"],["-720","-","MAGT","1315872000000"],["-660","-","VLAT","1414288800000"],["-600","-","VLAT",null]],"Asia/Kamchatka":[["-634.6","-","LMT","-1487721600000"],["-660","-","PETT","-1247529600000"],["-720","Russia","PET%sT","670384800000"],["-660","Russia","PET%sT","695786400000"],["-720","Russia","PET%sT","1269741600000"],["-660","Russia","PET%sT","1301191200000"],["-720","-","PETT",null]],"Asia/Anadyr":[["-709.9333333333334","-","LMT","-1441152000000"],["-720","-","ANAT","-1247529600000"],["-780","Russia","ANA%sT","386467200000"],["-720","Russia","ANA%sT","670384800000"],["-660","Russia","ANA%sT","695786400000"],["-720","Russia","ANA%sT","1269741600000"],["-660","Russia","ANA%sT","1301191200000"],["-720","-","ANAT",null]],"Europe/Belgrade":[["-82","-","LMT","-2682374400000"],["-60","-","CET","-905821200000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","-","CET","-777938400000"],["-60","1:00","CEST","-766620000000"],["-60","-","CET","407203200000"],["-60","EU","CE%sT",null]],"Europe/Ljubljana":"Europe/Belgrade","Europe/Podgorica":"Europe/Belgrade","Europe/Sarajevo":"Europe/Belgrade","Europe/Skopje":"Europe/Belgrade","Europe/Zagreb":"Europe/Belgrade","Europe/Bratislava":"Europe/Prague","Europe/Madrid":[["14.733333333333334","-","LMT","-2177452800000"],["0","Spain","WE%sT","-733881600000"],["-60","Spain","CE%sT","315446400000"],["-60","EU","CE%sT",null]],"Africa/Ceuta":[["21.26666666666667","-","LMT","-2146003200000"],["0","-","WET","-1630112400000"],["0","1:00","WEST","-1616806800000"],["0","-","WET","-1420156800000"],["0","Spain","WE%sT","-1262390400000"],["0","SpainAfrica","WE%sT","448243200000"],["-60","-","CET","536371200000"],["-60","EU","CE%sT",null]],"Atlantic/Canary":[["61.6","-","LMT","-1509667200000"],["60","-","CANT","-733878000000"],["0","-","WET","323827200000"],["0","1:00","WEST","338947200000"],["0","EU","WE%sT",null]],"Europe/Stockholm":[["-72.2","-","LMT","-2871676800000"],["-60.233333333333334","-","SET","-2208988800000"],["-60","-","CET","-1692493200000"],["-60","1:00","CEST","-1680476400000"],["-60","-","CET","347068800000"],["-60","EU","CE%sT",null]],"Europe/Zurich":[["-34.13333333333333","-","LMT","-3675196800000"],["-29.76666666666667","-","BMT","-2385244800000"],["-60","Swiss","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Istanbul":[["-115.86666666666667","-","LMT","-2808604800000"],["-116.93333333333332","-","IMT","-1869868800000"],["-120","Turkey","EE%sT","277257600000"],["-180","Turkey","TR%sT","482803200000"],["-120","Turkey","EE%sT","1199059200000"],["-120","EU","EE%sT","1301187600000"],["-120","-","EET","1301274000000"],["-120","EU","EE%sT","1396141200000"],["-120","-","EET","1396227600000"],["-120","EU","EE%sT",null]],"Asia/Istanbul":"Europe/Istanbul","Europe/Kiev":[["-122.06666666666668","-","LMT","-2808604800000"],["-122.06666666666668","-","KMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-892512000000"],["-60","C-Eur","CE%sT","-825379200000"],["-180","Russia","MSK/MSD","646797600000"],["-120","1:00","EEST","686113200000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"Europe/Uzhgorod":[["-89.2","-","LMT","-2500934400000"],["-60","-","CET","-915235200000"],["-60","C-Eur","CE%sT","-796867200000"],["-60","1:00","CEST","-794707200000"],["-60","-","CET","-773452800000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","646797600000"],["-60","-","CET","670388400000"],["-120","-","EET","725760000000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"Europe/Zaporozhye":[["-140.66666666666666","-","LMT","-2808604800000"],["-140","-","CUT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-894758400000"],["-60","C-Eur","CE%sT","-826416000000"],["-180","Russia","MSK/MSD","670384800000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"EST":[["300","-","EST",null]],"MST":[["420","-","MST",null]],"HST":[["600","-","HST",null]],"EST5EDT":[["300","US","E%sT",null]],"CST6CDT":[["360","US","C%sT",null]],"MST7MDT":[["420","US","M%sT",null]],"PST8PDT":[["480","US","P%sT",null]],"America/New_York":[["296.0333333333333","-","LMT","-2717668562000"],["300","US","E%sT","-1546387200000"],["300","NYC","E%sT","-852163200000"],["300","US","E%sT","-725932800000"],["300","NYC","E%sT","-63244800000"],["300","US","E%sT",null]],"America/Chicago":[["350.6","-","LMT","-2717668236000"],["360","US","C%sT","-1546387200000"],["360","Chicago","C%sT","-1067810400000"],["300","-","EST","-1045432800000"],["360","Chicago","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Chicago","C%sT","-63244800000"],["360","US","C%sT",null]],"America/North_Dakota/Center":[["405.2","-","LMT","-2717667912000"],["420","US","M%sT","719978400000"],["360","US","C%sT",null]],"America/North_Dakota/New_Salem":[["405.65","-","LMT","-2717667939000"],["420","US","M%sT","1067133600000"],["360","US","C%sT",null]],"America/North_Dakota/Beulah":[["407.1166666666667","-","LMT","-2717668027000"],["420","US","M%sT","1289095200000"],["360","US","C%sT",null]],"America/Denver":[["419.93333333333334","-","LMT","-2717668796000"],["420","US","M%sT","-1546387200000"],["420","Denver","M%sT","-852163200000"],["420","US","M%sT","-725932800000"],["420","Denver","M%sT","-63244800000"],["420","US","M%sT",null]],"America/Los_Angeles":[["472.9666666666667","-","LMT","-2717668378000"],["480","US","P%sT","-725932800000"],["480","CA","P%sT","-63244800000"],["480","US","P%sT",null]],"America/Juneau":[["-902.3166666666666","-","LMT","-3225312000000"],["537.6833333333334","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","325648800000"],["540","US","Y%sT","341373600000"],["480","US","P%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Sitka":[["-898.7833333333334","-","LMT","-3225312000000"],["541.2166666666666","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Metlakatla":[["-913.7","-","LMT","-3225312000000"],["526.3","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","436327200000"],["480","-","PST",null]],"America/Yakutat":[["-881.0833333333334","-","LMT","-3225312000000"],["558.9166666666666","-","LMT","-2188987200000"],["540","-","YST","-852163200000"],["540","US","Y%sT","-725932800000"],["540","-","YST","-86400000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Anchorage":[["-840.4","-","LMT","-3225312000000"],["599.6","-","LMT","-2188987200000"],["600","-","CAT","-852163200000"],["600","US","CAT/CAWT","-769395600000"],["600","US","CAT/CAPT","-725932800000"],["600","-","CAT","-86918400000"],["600","-","AHST","-86400000"],["600","US","AH%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Nome":[["-778.35","-","LMT","-3225312000000"],["661.6333333333333","-","LMT","-2188987200000"],["660","-","NST","-852163200000"],["660","US","N%sT","-725932800000"],["660","-","NST","-86918400000"],["660","-","BST","-86400000"],["660","US","B%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Adak":[["-733.35","-","LMT","-3225312000000"],["706.6333333333333","-","LMT","-2188987200000"],["660","-","NST","-852163200000"],["660","US","N%sT","-725932800000"],["660","-","NST","-86918400000"],["660","-","BST","-86400000"],["660","US","B%sT","436327200000"],["600","US","AH%sT","438998400000"],["600","US","HA%sT",null]],"Pacific/Honolulu":[["631.4333333333334","-","LMT","-2334139200000"],["630","-","HST","-1157320800000"],["630","1:00","HDT","-1155470400000"],["630","-","HST","-880236000000"],["630","1:00","HDT","-765410400000"],["630","-","HST","-712188000000"],["600","-","HST",null]],"Pacific/Johnston":"Pacific/Honolulu","America/Phoenix":[["448.3","-","LMT","-2717670498000"],["420","US","M%sT","-820540740000"],["420","-","MST","-812678340000"],["420","US","M%sT","-796867140000"],["420","-","MST","-63244800000"],["420","US","M%sT","-56246400000"],["420","-","MST",null]],"America/Boise":[["464.81666666666666","-","LMT","-2717667889000"],["480","US","P%sT","-1471816800000"],["420","US","M%sT","157680000000"],["420","-","MST","129088800000"],["420","US","M%sT",null]],"America/Indiana/Indianapolis":[["344.6333333333333","-","LMT","-2717667878000"],["360","US","C%sT","-1546387200000"],["360","Indianapolis","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Indianapolis","C%sT","-463615200000"],["300","-","EST","-386805600000"],["360","-","CST","-368661600000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Indiana/Marengo":[["345.3833333333333","-","LMT","-2717667923000"],["360","US","C%sT","-568166400000"],["360","Marengo","C%sT","-273708000000"],["300","-","EST","-86400000"],["300","US","E%sT","126669600000"],["360","1:00","CDT","152071200000"],["300","US","E%sT","220838400000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Indiana/Vincennes":[["350.1166666666667","-","LMT","-2717668207000"],["360","US","C%sT","-725932800000"],["360","Vincennes","C%sT","-179359200000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT","1194141600000"],["300","US","E%sT",null]],"America/Indiana/Tell_City":[["347.05","-","LMT","-2717668023000"],["360","US","C%sT","-725932800000"],["360","Perry","C%sT","-179359200000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT",null]],"America/Indiana/Petersburg":[["349.1166666666667","-","LMT","-2717668147000"],["360","US","C%sT","-441936000000"],["360","Pike","C%sT","-147909600000"],["300","-","EST","-100130400000"],["360","US","C%sT","247024800000"],["300","-","EST","1143943200000"],["360","US","C%sT","1194141600000"],["300","US","E%sT",null]],"America/Indiana/Knox":[["346.5","-","LMT","-2717667990000"],["360","US","C%sT","-694396800000"],["360","Starke","C%sT","-242258400000"],["300","-","EST","-195084000000"],["360","US","C%sT","688528800000"],["300","-","EST","1143943200000"],["360","US","C%sT",null]],"America/Indiana/Winamac":[["346.4166666666667","-","LMT","-2717667985000"],["360","US","C%sT","-725932800000"],["360","Pulaski","C%sT","-273708000000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT","1173578400000"],["300","US","E%sT",null]],"America/Indiana/Vevay":[["340.2666666666667","-","LMT","-2717667616000"],["360","US","C%sT","-495064800000"],["300","-","EST","-86400000"],["300","US","E%sT","126144000000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Kentucky/Louisville":[["343.0333333333333","-","LMT","-2717667782000"],["360","US","C%sT","-1514851200000"],["360","Louisville","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Louisville","C%sT","-266450400000"],["300","-","EST","-31622400000"],["300","US","E%sT","126669600000"],["360","1:00","CDT","152071200000"],["300","US","E%sT",null]],"America/Kentucky/Monticello":[["339.4","-","LMT","-2717667564000"],["360","US","C%sT","-725932800000"],["360","-","CST","-31622400000"],["360","US","C%sT","972784800000"],["300","US","E%sT",null]],"America/Detroit":[["332.18333333333334","-","LMT","-2019772800000"],["360","-","CST","-1724104800000"],["300","-","EST","-852163200000"],["300","US","E%sT","-725932800000"],["300","Detroit","E%sT","126144000000"],["300","US","E%sT","189216000000"],["300","-","EST","167796000000"],["300","US","E%sT",null]],"America/Menominee":[["350.45","-","LMT","-2659780800000"],["360","US","C%sT","-725932800000"],["360","Menominee","C%sT","-21506400000"],["300","-","EST","104896800000"],["360","US","C%sT",null]],"America/St_Johns":[["210.86666666666665","-","LMT","-2682374400000"],["210.86666666666665","StJohns","N%sT","-1609545600000"],["210.86666666666665","Canada","N%sT","-1578009600000"],["210.86666666666665","StJohns","N%sT","-1096934400000"],["210","StJohns","N%sT","-872380800000"],["210","Canada","N%sT","-725932800000"],["210","StJohns","N%sT","1320105600000"],["210","Canada","N%sT",null]],"America/Goose_Bay":[["241.66666666666666","-","LMT","-2682374400000"],["210.86666666666665","-","NST","-1609545600000"],["210.86666666666665","Canada","N%sT","-1578009600000"],["210.86666666666665","-","NST","-1096934400000"],["210","-","NST","-1041465600000"],["210","StJohns","N%sT","-872380800000"],["210","Canada","N%sT","-725932800000"],["210","StJohns","N%sT","-119916000000"],["240","StJohns","A%sT","1320105600000"],["240","Canada","A%sT",null]],"America/Halifax":[["254.4","-","LMT","-2131660800000"],["240","Halifax","A%sT","-1609545600000"],["240","Canada","A%sT","-1578009600000"],["240","Halifax","A%sT","-880236000000"],["240","Canada","A%sT","-725932800000"],["240","Halifax","A%sT","157680000000"],["240","Canada","A%sT",null]],"America/Glace_Bay":[["239.8","-","LMT","-2131660800000"],["240","Canada","A%sT","-505008000000"],["240","Halifax","A%sT","-473472000000"],["240","-","AST","94608000000"],["240","Halifax","A%sT","157680000000"],["240","Canada","A%sT",null]],"America/Moncton":[["259.1333333333333","-","LMT","-2715897600000"],["300","-","EST","-2131660800000"],["240","Canada","A%sT","-1136160000000"],["240","Moncton","A%sT","-852163200000"],["240","Canada","A%sT","-725932800000"],["240","Moncton","A%sT","126144000000"],["240","Canada","A%sT","757296000000"],["240","Moncton","A%sT","1199059200000"],["240","Canada","A%sT",null]],"America/Blanc-Sablon":[["228.46666666666667","-","LMT","-2682374400000"],["240","Canada","A%sT","31449600000"],["240","-","AST",null]],"America/Montreal":[["294.2666666666667","-","LMT","-2682374400000"],["300","Mont","E%sT","-1609545600000"],["300","Canada","E%sT","-1578009600000"],["300","Mont","E%sT","-880236000000"],["300","Canada","E%sT","-725932800000"],["300","Mont","E%sT","157680000000"],["300","Canada","E%sT",null]],"America/Toronto":[["317.5333333333333","-","LMT","-2335305600000"],["300","Canada","E%sT","-1578009600000"],["300","Toronto","E%sT","-880236000000"],["300","Canada","E%sT","-725932800000"],["300","Toronto","E%sT","157680000000"],["300","Canada","E%sT",null]],"America/Thunder_Bay":[["357","-","LMT","-2335305600000"],["360","-","CST","-1862006400000"],["300","-","EST","-852163200000"],["300","Canada","E%sT","31449600000"],["300","Toronto","E%sT","126144000000"],["300","-","EST","157680000000"],["300","Canada","E%sT",null]],"America/Nipigon":[["353.06666666666666","-","LMT","-2335305600000"],["300","Canada","E%sT","-923270400000"],["300","1:00","EDT","-880236000000"],["300","Canada","E%sT",null]],"America/Rainy_River":[["378.2666666666667","-","LMT","-2335305600000"],["360","Canada","C%sT","-923270400000"],["360","1:00","CDT","-880236000000"],["360","Canada","C%sT",null]],"America/Atikokan":[["366.4666666666667","-","LMT","-2335305600000"],["360","Canada","C%sT","-923270400000"],["360","1:00","CDT","-880236000000"],["360","Canada","C%sT","-765410400000"],["300","-","EST",null]],"America/Winnipeg":[["388.6","-","LMT","-2602281600000"],["360","Winn","C%sT","1167523200000"],["360","Canada","C%sT",null]],"America/Regina":[["418.6","-","LMT","-2030227200000"],["420","Regina","M%sT","-307749600000"],["360","-","CST",null]],"America/Swift_Current":[["431.3333333333333","-","LMT","-2030227200000"],["420","Canada","M%sT","-749599200000"],["420","Regina","M%sT","-599702400000"],["420","Swift","M%sT","70941600000"],["360","-","CST",null]],"America/Edmonton":[["453.8666666666667","-","LMT","-1998691200000"],["420","Edm","M%sT","567907200000"],["420","Canada","M%sT",null]],"America/Vancouver":[["492.4666666666667","-","LMT","-2682374400000"],["480","Vanc","P%sT","567907200000"],["480","Canada","P%sT",null]],"America/Dawson_Creek":[["480.93333333333334","-","LMT","-2682374400000"],["480","Canada","P%sT","-694396800000"],["480","Vanc","P%sT","83988000000"],["420","-","MST",null]],"America/Creston":[["466.06666666666666","-","LMT","-2682374400000"],["420","-","MST","-1680480000000"],["480","-","PST","-1627862400000"],["420","-","MST",null]],"America/Pangnirtung":[["0","-","zzz","-1514851200000"],["240","NT_YK","A%sT","796701600000"],["300","Canada","E%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","Canada","E%sT",null]],"America/Iqaluit":[["0","-","zzz","-865296000000"],["300","NT_YK","E%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","Canada","E%sT",null]],"America/Resolute":[["0","-","zzz","-704937600000"],["360","NT_YK","C%sT","972784800000"],["300","-","EST","986094000000"],["360","Canada","C%sT","1162087200000"],["300","-","EST","1173582000000"],["360","Canada","C%sT",null]],"America/Rankin_Inlet":[["0","-","zzz","-378777600000"],["360","NT_YK","C%sT","972784800000"],["300","-","EST","986094000000"],["360","Canada","C%sT",null]],"America/Cambridge_Bay":[["0","-","zzz","-1546387200000"],["420","NT_YK","M%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","-","EST","973382400000"],["360","-","CST","986094000000"],["420","Canada","M%sT",null]],"America/Yellowknife":[["0","-","zzz","-1073088000000"],["420","NT_YK","M%sT","347068800000"],["420","Canada","M%sT",null]],"America/Inuvik":[["0","-","zzz","-505008000000"],["480","NT_YK","P%sT","291780000000"],["420","NT_YK","M%sT","347068800000"],["420","Canada","M%sT",null]],"America/Whitehorse":[["540.2","-","LMT","-2189030400000"],["540","NT_YK","Y%sT","-110584800000"],["480","NT_YK","P%sT","347068800000"],["480","Canada","P%sT",null]],"America/Dawson":[["557.6666666666666","-","LMT","-2189030400000"],["540","NT_YK","Y%sT","120614400000"],["480","NT_YK","P%sT","347068800000"],["480","Canada","P%sT",null]],"America/Cancun":[["347.06666666666666","-","LMT","-1514764024000"],["360","-","CST","377913600000"],["300","Mexico","E%sT","902023200000"],["360","Mexico","C%sT",null]],"America/Merida":[["358.4666666666667","-","LMT","-1514764708000"],["360","-","CST","377913600000"],["300","-","EST","407635200000"],["360","Mexico","C%sT",null]],"America/Matamoros":[["400","-","LMT","-1514767200000"],["360","-","CST","599529600000"],["360","US","C%sT","631065600000"],["360","Mexico","C%sT","1293753600000"],["360","US","C%sT",null]],"America/Monterrey":[["401.2666666666667","-","LMT","-1514767276000"],["360","-","CST","599529600000"],["360","US","C%sT","631065600000"],["360","Mexico","C%sT",null]],"America/Mexico_City":[["396.6","-","LMT","-1514763396000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","Mexico","C%sT","1001815200000"],["360","-","CST","1014163200000"],["360","Mexico","C%sT",null]],"America/Ojinaga":[["417.6666666666667","-","LMT","-1514764660000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","851990400000"],["360","Mexico","C%sT","915062400000"],["360","-","CST","891399600000"],["420","Mexico","M%sT","1293753600000"],["420","US","M%sT",null]],"America/Chihuahua":[["424.3333333333333","-","LMT","-1514765060000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","851990400000"],["360","Mexico","C%sT","915062400000"],["360","-","CST","891399600000"],["420","Mexico","M%sT",null]],"America/Hermosillo":[["443.8666666666667","-","LMT","-1514766232000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT","946598400000"],["420","-","MST",null]],"America/Mazatlan":[["425.6666666666667","-","LMT","-1514765140000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT",null]],"America/Bahia_Banderas":[["421","-","LMT","-1514764860000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT","1270346400000"],["360","Mexico","C%sT",null]],"America/Tijuana":[["468.06666666666666","-","LMT","-1514764084000"],["420","-","MST","-1420156800000"],["480","-","PST","-1343091600000"],["420","-","MST","-1234828800000"],["480","-","PST","-1222992000000"],["480","1:00","PDT","-1207267200000"],["480","-","PST","-873849600000"],["480","1:00","PWT","-769395600000"],["480","1:00","PPT","-761702400000"],["480","-","PST","-686102400000"],["480","1:00","PDT","-661564800000"],["480","-","PST","-473472000000"],["480","CA","P%sT","-252547200000"],["480","-","PST","220838400000"],["480","US","P%sT","851990400000"],["480","Mexico","P%sT","1009756800000"],["480","US","P%sT","1014163200000"],["480","Mexico","P%sT","1293753600000"],["480","US","P%sT",null]],"America/Santa_Isabel":[["459.4666666666667","-","LMT","-1514763568000"],["420","-","MST","-1420156800000"],["480","-","PST","-1343091600000"],["420","-","MST","-1234828800000"],["480","-","PST","-1222992000000"],["480","1:00","PDT","-1207267200000"],["480","-","PST","-873849600000"],["480","1:00","PWT","-769395600000"],["480","1:00","PPT","-761702400000"],["480","-","PST","-686102400000"],["480","1:00","PDT","-661564800000"],["480","-","PST","-473472000000"],["480","CA","P%sT","-252547200000"],["480","-","PST","220838400000"],["480","US","P%sT","851990400000"],["480","Mexico","P%sT","1009756800000"],["480","US","P%sT","1014163200000"],["480","Mexico","P%sT",null]],"America/Antigua":[["247.2","-","LMT","-1825113600000"],["300","-","EST","-568166400000"],["240","-","AST",null]],"America/Nassau":[["309.5","-","LMT","-1825113600000"],["300","Bahamas","E%sT","220838400000"],["300","US","E%sT",null]],"America/Barbados":[["238.48333333333335","-","LMT","-1420156800000"],["238.48333333333335","-","BMT","-1167696000000"],["240","Barb","A%sT",null]],"America/Belize":[["352.8","-","LMT","-1822521600000"],["360","Belize","C%sT",null]],"Atlantic/Bermuda":[["259.3","-","LMT","-1262296800000"],["240","-","AST","136346400000"],["240","Canada","A%sT","220838400000"],["240","US","A%sT",null]],"America/Cayman":[["325.5333333333333","-","LMT","-2493072000000"],["307.18333333333334","-","KMT","-1827705600000"],["300","-","EST",null]],"America/Costa_Rica":[["336.2166666666667","-","LMT","-2493072000000"],["336.2166666666667","-","SJMT","-1545091200000"],["360","CR","C%sT",null]],"America/Havana":[["329.4666666666667","-","LMT","-2493072000000"],["329.6","-","HMT","-1402833600000"],["300","Cuba","C%sT",null]],"America/Santo_Domingo":[["279.6","-","LMT","-2493072000000"],["280","-","SDMT","-1159790400000"],["300","DR","E%sT","152064000000"],["240","-","AST","972784800000"],["300","US","E%sT","975805200000"],["240","-","AST",null]],"America/El_Salvador":[["356.8","-","LMT","-1514851200000"],["360","Salv","C%sT",null]],"America/Guatemala":[["362.06666666666666","-","LMT","-1617062400000"],["360","Guat","C%sT",null]],"America/Port-au-Prince":[["289.3333333333333","-","LMT","-2493072000000"],["289","-","PPMT","-1670500800000"],["300","Haiti","E%sT",null]],"America/Tegucigalpa":[["348.8666666666667","-","LMT","-1538524800000"],["360","Hond","C%sT",null]],"America/Jamaica":[["307.18333333333334","-","LMT","-2493072000000"],["307.18333333333334","-","KMT","-1827705600000"],["300","-","EST","157680000000"],["300","US","E%sT","473299200000"],["300","-","EST",null]],"America/Martinique":[["244.33333333333334","-","LMT","-2493072000000"],["244.33333333333334","-","FFMT","-1851552000000"],["240","-","AST","323827200000"],["240","1:00","ADT","338947200000"],["240","-","AST",null]],"America/Managua":[["345.1333333333333","-","LMT","-2493072000000"],["345.2","-","MMT","-1121126400000"],["360","-","CST","105062400000"],["300","-","EST","161740800000"],["360","Nic","C%sT","694238400000"],["300","-","EST","717292800000"],["360","-","CST","757296000000"],["300","-","EST","883526400000"],["360","Nic","C%sT",null]],"America/Panama":[["318.1333333333333","-","LMT","-2493072000000"],["319.6","-","CMT","-1946937600000"],["300","-","EST",null]],"America/Puerto_Rico":[["264.4166666666667","-","LMT","-2233051200000"],["240","-","AST","-873072000000"],["240","US","A%sT","-725932800000"],["240","-","AST",null]],"America/Miquelon":[["224.66666666666666","-","LMT","-1850342400000"],["240","-","AST","325987200000"],["180","-","PMST","567907200000"],["180","Canada","PM%sT",null]],"America/Grand_Turk":[["284.5333333333333","-","LMT","-2493072000000"],["307.18333333333334","-","KMT","-1827705600000"],["300","-","EST","315446400000"],["300","US","E%sT","1446343200000"],["240","-","AST",null]],"US/Pacific-New":"America/Los_Angeles","America/Argentina/Buenos_Aires":[["233.8","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT",null]],"America/Argentina/Cordoba":[["256.8","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT",null]],"America/Argentina/Salta":[["261.66666666666663","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Tucuman":[["260.8666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087084800000"],["180","Arg","AR%sT",null]],"America/Argentina/La_Rioja":[["267.4","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667785600000"],["240","-","WART","673574400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/San_Juan":[["274.06666666666666","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667785600000"],["240","-","WART","673574400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085961600000"],["240","-","WART","1090713600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Jujuy":[["261.2","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","636508800000"],["240","-","WART","657072000000"],["240","1:00","WARST","669168000000"],["240","-","WART","686707200000"],["180","1:00","ARST","725760000000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Catamarca":[["263.1333333333333","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Mendoza":[["275.2666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","636508800000"],["240","-","WART","655948800000"],["240","1:00","WARST","667785600000"],["240","-","WART","687484800000"],["240","1:00","WARST","699408000000"],["240","-","WART","719366400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085270400000"],["240","-","WART","1096156800000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/San_Luis":[["265.4","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","662601600000"],["180","1:00","ARST","637372800000"],["240","-","WART","655948800000"],["240","1:00","WARST","667785600000"],["240","-","WART","675734400000"],["180","-","ART","938908800000"],["240","1:00","WARST","952041600000"],["180","-","ART","1085961600000"],["240","-","WART","1090713600000"],["180","Arg","AR%sT","1200873600000"],["240","SanLuis","WAR%sT","1255219200000"],["180","-","ART",null]],"America/Argentina/Rio_Gallegos":[["276.8666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Ushuaia":[["273.2","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085875200000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Aruba":"America/Curacao","America/La_Paz":[["272.6","-","LMT","-2493072000000"],["272.6","-","CMT","-1205971200000"],["272.6","1:00","BOST","-1192320000000"],["240","-","BOT",null]],"America/Noronha":[["129.66666666666669","-","LMT","-1735776000000"],["120","Brazil","FN%sT","653529600000"],["120","-","FNT","938649600000"],["120","Brazil","FN%sT","971568000000"],["120","-","FNT","1000339200000"],["120","Brazil","FN%sT","1033430400000"],["120","-","FNT",null]],"America/Belem":[["193.93333333333334","-","LMT","-1735776000000"],["180","Brazil","BR%sT","590025600000"],["180","-","BRT",null]],"America/Santarem":[["218.8","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","1214265600000"],["180","-","BRT",null]],"America/Fortaleza":[["154","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","972172800000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Recife":[["139.6","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","971568000000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Araguaina":[["192.8","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","811036800000"],["180","Brazil","BR%sT","1064361600000"],["180","-","BRT","1350777600000"],["180","Brazil","BR%sT","1377993600000"],["180","-","BRT",null]],"America/Maceio":[["142.86666666666665","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","813542400000"],["180","Brazil","BR%sT","841795200000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","972172800000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Bahia":[["154.06666666666666","-","LMT","-1735776000000"],["180","Brazil","BR%sT","1064361600000"],["180","-","BRT","1318723200000"],["180","Brazil","BR%sT","1350777600000"],["180","-","BRT",null]],"America/Sao_Paulo":[["186.46666666666667","-","LMT","-1735776000000"],["180","Brazil","BR%sT","-195436800000"],["180","1:00","BRST","-157852800000"],["180","Brazil","BR%sT",null]],"America/Campo_Grande":[["218.46666666666667","-","LMT","-1735776000000"],["240","Brazil","AM%sT",null]],"America/Cuiaba":[["224.33333333333334","-","LMT","-1735776000000"],["240","Brazil","AM%sT","1064361600000"],["240","-","AMT","1096588800000"],["240","Brazil","AM%sT",null]],"America/Porto_Velho":[["255.6","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT",null]],"America/Boa_Vista":[["242.66666666666666","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","938649600000"],["240","Brazil","AM%sT","971568000000"],["240","-","AMT",null]],"America/Manaus":[["240.06666666666666","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","749174400000"],["240","Brazil","AM%sT","780192000000"],["240","-","AMT",null]],"America/Eirunepe":[["279.4666666666667","-","LMT","-1735776000000"],["300","Brazil","AC%sT","590025600000"],["300","-","ACT","749174400000"],["300","Brazil","AC%sT","780192000000"],["300","-","ACT","1214265600000"],["240","-","AMT","1384041600000"],["300","-","ACT",null]],"America/Rio_Branco":[["271.2","-","LMT","-1735776000000"],["300","Brazil","AC%sT","590025600000"],["300","-","ACT","1214265600000"],["240","-","AMT","1384041600000"],["300","-","ACT",null]],"America/Santiago":[["282.7666666666667","-","LMT","-2493072000000"],["282.7666666666667","-","SMT","-1862006400000"],["300","-","CLT","-1688428800000"],["282.7666666666667","-","SMT","-1620000000000"],["240","-","CLT","-1593820800000"],["282.7666666666667","-","SMT","-1336003200000"],["300","Chile","CL%sT","-713664000000"],["240","Chile","CL%sT",null]],"Pacific/Easter":[["437.7333333333333","-","LMT","-2493072000000"],["437.4666666666667","-","EMT","-1178150400000"],["420","Chile","EAS%sT","384901200000"],["360","Chile","EAS%sT",null]],"America/Bogota":[["296.2666666666667","-","LMT","-2707689600000"],["296.2666666666667","-","BMT","-1739059200000"],["300","CO","CO%sT",null]],"America/Curacao":[["275.7833333333333","-","LMT","-1826755200000"],["270","-","ANT","-126316800000"],["240","-","AST",null]],"America/Lower_Princes":"America/Curacao","America/Kralendijk":"America/Curacao","America/Guayaquil":[["319.3333333333333","-","LMT","-2493072000000"],["314","-","QMT","-1199318400000"],["300","-","ECT",null]],"Pacific/Galapagos":[["358.4","-","LMT","-1199318400000"],["300","-","ECT","536371200000"],["360","-","GALT",null]],"Atlantic/Stanley":[["231.4","-","LMT","-2493072000000"],["231.4","-","SMT","-1824249600000"],["240","Falk","FK%sT","420595200000"],["180","Falk","FK%sT","495590400000"],["240","Falk","FK%sT","1283652000000"],["180","-","FKST",null]],"America/Cayenne":[["209.33333333333334","-","LMT","-1846281600000"],["240","-","GFT","-71107200000"],["180","-","GFT",null]],"America/Guyana":[["232.66666666666666","-","LMT","-1730592000000"],["225","-","GBGT","-113702400000"],["225","-","GYT","175996800000"],["180","-","GYT","694137600000"],["240","-","GYT",null]],"America/Asuncion":[["230.66666666666666","-","LMT","-2493072000000"],["230.66666666666666","-","AMT","-1206403200000"],["240","-","PYT","86745600000"],["180","-","PYT","134006400000"],["240","Para","PY%sT",null]],"America/Lima":[["308.2","-","LMT","-2493072000000"],["308.6","-","LMT","-1938556800000"],["300","Peru","PE%sT",null]],"Atlantic/South_Georgia":[["146.13333333333335","-","LMT","-2493072000000"],["120","-","GST",null]],"America/Paramaribo":[["220.66666666666666","-","LMT","-1830470400000"],["220.86666666666665","-","PMT","-1073088000000"],["220.6","-","PMT","-765331200000"],["210","-","NEGT","185673600000"],["210","-","SRT","465436800000"],["180","-","SRT",null]],"America/Port_of_Spain":[["246.06666666666666","-","LMT","-1825113600000"],["240","-","AST",null]],"America/Anguilla":"America/Port_of_Spain","America/Dominica":"America/Port_of_Spain","America/Grenada":"America/Port_of_Spain","America/Guadeloupe":"America/Port_of_Spain","America/Marigot":"America/Port_of_Spain","America/Montserrat":"America/Port_of_Spain","America/St_Barthelemy":"America/Port_of_Spain","America/St_Kitts":"America/Port_of_Spain","America/St_Lucia":"America/Port_of_Spain","America/St_Thomas":"America/Port_of_Spain","America/St_Vincent":"America/Port_of_Spain","America/Tortola":"America/Port_of_Spain","America/Montevideo":[["224.73333333333335","-","LMT","-2256681600000"],["224.73333333333335","-","MMT","-1567468800000"],["210","Uruguay","UY%sT","-853632000000"],["180","Uruguay","UY%sT",null]],"America/Caracas":[["267.7333333333333","-","LMT","-2493072000000"],["267.6666666666667","-","CMT","-1826755200000"],["270","-","VET","-126316800000"],["240","-","VET","1197169200000"],["270","-","VET",null]]},"rules":{"Algeria":[["1916","only","-","Jun","14",["23","0","0","s"],"60","S"],["1916","1919","-","Oct","Sun>=1",["23","0","0","s"],"0","-"],["1917","only","-","Mar","24",["23","0","0","s"],"60","S"],["1918","only","-","Mar","9",["23","0","0","s"],"60","S"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Jun","21",["23","0","0","s"],"0","-"],["1939","only","-","Sep","11",["23","0","0","s"],"60","S"],["1939","only","-","Nov","19",["1","0","0",null],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0",null],"60","S"],["1944","only","-","Oct","8",["2","0","0",null],"0","-"],["1945","only","-","Sep","16",["1","0","0",null],"0","-"],["1971","only","-","Apr","25",["23","0","0","s"],"60","S"],["1971","only","-","Sep","26",["23","0","0","s"],"0","-"],["1977","only","-","May","6",["0","0","0",null],"60","S"],["1977","only","-","Oct","21",["0","0","0",null],"0","-"],["1978","only","-","Mar","24",["1","0","0",null],"60","S"],["1978","only","-","Sep","22",["3","0","0",null],"0","-"],["1980","only","-","Apr","25",["0","0","0",null],"60","S"],["1980","only","-","Oct","31",["2","0","0",null],"0","-"]],"Egypt":[["1940","only","-","Jul","15",["0","0","0",null],"60","S"],["1940","only","-","Oct","1",["0","0","0",null],"0","-"],["1941","only","-","Apr","15",["0","0","0",null],"60","S"],["1941","only","-","Sep","16",["0","0","0",null],"0","-"],["1942","1944","-","Apr","1",["0","0","0",null],"60","S"],["1942","only","-","Oct","27",["0","0","0",null],"0","-"],["1943","1945","-","Nov","1",["0","0","0",null],"0","-"],["1945","only","-","Apr","16",["0","0","0",null],"60","S"],["1957","only","-","May","10",["0","0","0",null],"60","S"],["1957","1958","-","Oct","1",["0","0","0",null],"0","-"],["1958","only","-","May","1",["0","0","0",null],"60","S"],["1959","1981","-","May","1",["1","0","0",null],"60","S"],["1959","1965","-","Sep","30",["3","0","0",null],"0","-"],["1966","1994","-","Oct","1",["3","0","0",null],"0","-"],["1982","only","-","Jul","25",["1","0","0",null],"60","S"],["1983","only","-","Jul","12",["1","0","0",null],"60","S"],["1984","1988","-","May","1",["1","0","0",null],"60","S"],["1989","only","-","May","6",["1","0","0",null],"60","S"],["1990","1994","-","May","1",["1","0","0",null],"60","S"],["1995","2010","-","Apr","lastFri",["0","0","0","s"],"60","S"],["1995","2005","-","Sep","lastThu",["24","0","0",null],"0","-"],["2006","only","-","Sep","21",["24","0","0",null],"0","-"],["2007","only","-","Sep","Thu>=1",["24","0","0",null],"0","-"],["2008","only","-","Aug","lastThu",["24","0","0",null],"0","-"],["2009","only","-","Aug","20",["24","0","0",null],"0","-"],["2010","only","-","Aug","10",["24","0","0",null],"0","-"],["2010","only","-","Sep","9",["24","0","0",null],"60","S"],["2010","only","-","Sep","lastThu",["24","0","0",null],"0","-"],["2014","only","-","May","15",["24","0","0",null],"60","S"],["2014","only","-","Jun","26",["24","0","0",null],"0","-"],["2014","only","-","Jul","31",["24","0","0",null],"60","S"],["2014","max","-","Sep","lastThu",["24","0","0",null],"0","-"],["2015","2019","-","Apr","lastFri",["0","0","0","s"],"60","S"],["2015","only","-","Jun","11",["24","0","0",null],"0","-"],["2015","only","-","Jul","23",["24","0","0",null],"60","S"],["2016","only","-","Jun","2",["24","0","0",null],"0","-"],["2016","only","-","Jul","7",["24","0","0",null],"60","S"],["2017","only","-","May","25",["24","0","0",null],"0","-"],["2017","only","-","Jun","29",["24","0","0",null],"60","S"],["2018","only","-","May","10",["24","0","0",null],"0","-"],["2018","only","-","Jun","14",["24","0","0",null],"60","S"],["2019","only","-","May","2",["24","0","0",null],"0","-"],["2019","only","-","Jun","6",["24","0","0",null],"60","S"],["2020","only","-","May","28",["24","0","0",null],"60","S"],["2021","only","-","May","13",["24","0","0",null],"60","S"],["2022","only","-","May","5",["24","0","0",null],"60","S"],["2023","max","-","Apr","lastFri",["0","0","0","s"],"60","S"]],"Ghana":[["1920","1942","-","Sep","1",["0","0","0",null],"20","GHST"],["1920","1942","-","Dec","31",["0","0","0",null],"0","GMT"]],"Libya":[["1951","only","-","Oct","14",["2","0","0",null],"60","S"],["1952","only","-","Jan","1",["0","0","0",null],"0","-"],["1953","only","-","Oct","9",["2","0","0",null],"60","S"],["1954","only","-","Jan","1",["0","0","0",null],"0","-"],["1955","only","-","Sep","30",["0","0","0",null],"60","S"],["1956","only","-","Jan","1",["0","0","0",null],"0","-"],["1982","1984","-","Apr","1",["0","0","0",null],"60","S"],["1982","1985","-","Oct","1",["0","0","0",null],"0","-"],["1985","only","-","Apr","6",["0","0","0",null],"60","S"],["1986","only","-","Apr","4",["0","0","0",null],"60","S"],["1986","only","-","Oct","3",["0","0","0",null],"0","-"],["1987","1989","-","Apr","1",["0","0","0",null],"60","S"],["1987","1989","-","Oct","1",["0","0","0",null],"0","-"],["1997","only","-","Apr","4",["0","0","0",null],"60","S"],["1997","only","-","Oct","4",["0","0","0",null],"0","-"],["2013","only","-","Mar","lastFri",["1","0","0",null],"60","S"],["2013","only","-","Oct","lastFri",["2","0","0",null],"0","-"]],"Mauritius":[["1982","only","-","Oct","10",["0","0","0",null],"60","S"],["1983","only","-","Mar","21",["0","0","0",null],"0","-"],["2008","only","-","Oct","lastSun",["2","0","0",null],"60","S"],["2009","only","-","Mar","lastSun",["2","0","0",null],"0","-"]],"Morocco":[["1939","only","-","Sep","12",["0","0","0",null],"60","S"],["1939","only","-","Nov","19",["0","0","0",null],"0","-"],["1940","only","-","Feb","25",["0","0","0",null],"60","S"],["1945","only","-","Nov","18",["0","0","0",null],"0","-"],["1950","only","-","Jun","11",["0","0","0",null],"60","S"],["1950","only","-","Oct","29",["0","0","0",null],"0","-"],["1967","only","-","Jun","3",["12","0","0",null],"60","S"],["1967","only","-","Oct","1",["0","0","0",null],"0","-"],["1974","only","-","Jun","24",["0","0","0",null],"60","S"],["1974","only","-","Sep","1",["0","0","0",null],"0","-"],["1976","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Aug","1",["0","0","0",null],"0","-"],["1977","only","-","Sep","28",["0","0","0",null],"0","-"],["1978","only","-","Jun","1",["0","0","0",null],"60","S"],["1978","only","-","Aug","4",["0","0","0",null],"0","-"],["2008","only","-","Jun","1",["0","0","0",null],"60","S"],["2008","only","-","Sep","1",["0","0","0",null],"0","-"],["2009","only","-","Jun","1",["0","0","0",null],"60","S"],["2009","only","-","Aug","21",["0","0","0",null],"0","-"],["2010","only","-","May","2",["0","0","0",null],"60","S"],["2010","only","-","Aug","8",["0","0","0",null],"0","-"],["2011","only","-","Apr","3",["0","0","0",null],"60","S"],["2011","only","-","Jul","31",["0","0","0",null],"0","-"],["2012","2013","-","Apr","lastSun",["2","0","0",null],"60","S"],["2012","only","-","Sep","30",["3","0","0",null],"0","-"],["2012","only","-","Jul","20",["3","0","0",null],"0","-"],["2012","only","-","Aug","20",["2","0","0",null],"60","S"],["2013","only","-","Jul","7",["3","0","0",null],"0","-"],["2013","only","-","Aug","10",["2","0","0",null],"60","S"],["2013","max","-","Oct","lastSun",["3","0","0",null],"0","-"],["2014","2022","-","Mar","lastSun",["2","0","0",null],"60","S"],["2014","only","-","Jun","28",["3","0","0",null],"0","-"],["2014","only","-","Aug","2",["2","0","0",null],"60","S"],["2015","only","-","Jun","13",["3","0","0",null],"0","-"],["2015","only","-","Jul","18",["2","0","0",null],"60","S"],["2016","only","-","Jun","4",["3","0","0",null],"0","-"],["2016","only","-","Jul","9",["2","0","0",null],"60","S"],["2017","only","-","May","20",["3","0","0",null],"0","-"],["2017","only","-","Jul","1",["2","0","0",null],"60","S"],["2018","only","-","May","12",["3","0","0",null],"0","-"],["2018","only","-","Jun","16",["2","0","0",null],"60","S"],["2019","only","-","May","4",["3","0","0",null],"0","-"],["2019","only","-","Jun","8",["2","0","0",null],"60","S"],["2020","only","-","Apr","18",["3","0","0",null],"0","-"],["2020","only","-","May","30",["2","0","0",null],"60","S"],["2021","only","-","Apr","10",["3","0","0",null],"0","-"],["2021","only","-","May","15",["2","0","0",null],"60","S"],["2022","only","-","Apr","2",["3","0","0",null],"0","-"],["2022","only","-","May","7",["2","0","0",null],"60","S"],["2023","only","-","Apr","22",["2","0","0",null],"60","S"],["2024","only","-","Apr","13",["2","0","0",null],"60","S"],["2025","only","-","Apr","5",["2","0","0",null],"60","S"],["2026","max","-","Mar","lastSun",["2","0","0",null],"60","S"],["2035","only","-","Oct","27",["3","0","0",null],"0","-"],["2036","only","-","Oct","18",["3","0","0",null],"0","-"],["2037","only","-","Oct","10",["3","0","0",null],"0","-"]],"Namibia":[["1994","max","-","Sep","Sun>=1",["2","0","0",null],"60","S"],["1995","max","-","Apr","Sun>=1",["2","0","0",null],"0","-"]],"SA":[["1942","1943","-","Sep","Sun>=15",["2","0","0",null],"60","-"],["1943","1944","-","Mar","Sun>=15",["2","0","0",null],"0","-"]],"Sudan":[["1970","only","-","May","1",["0","0","0",null],"60","S"],["1970","1985","-","Oct","15",["0","0","0",null],"0","-"],["1971","only","-","Apr","30",["0","0","0",null],"60","S"],["1972","1985","-","Apr","lastSun",["0","0","0",null],"60","S"]],"Tunisia":[["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","25",["23","0","0","s"],"60","S"],["1941","only","-","Oct","6",["0","0","0",null],"0","-"],["1942","only","-","Mar","9",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","29",["2","0","0",null],"60","S"],["1943","only","-","Apr","17",["2","0","0",null],"0","-"],["1943","only","-","Apr","25",["2","0","0",null],"60","S"],["1943","only","-","Oct","4",["2","0","0",null],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0",null],"60","S"],["1944","only","-","Oct","8",["0","0","0",null],"0","-"],["1945","only","-","Sep","16",["0","0","0",null],"0","-"],["1977","only","-","Apr","30",["0","0","0","s"],"60","S"],["1977","only","-","Sep","24",["0","0","0","s"],"0","-"],["1978","only","-","May","1",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1988","only","-","Jun","1",["0","0","0","s"],"60","S"],["1988","1990","-","Sep","lastSun",["0","0","0","s"],"0","-"],["1989","only","-","Mar","26",["0","0","0","s"],"60","S"],["1990","only","-","May","1",["0","0","0","s"],"60","S"],["2005","only","-","May","1",["0","0","0","s"],"60","S"],["2005","only","-","Sep","30",["1","0","0","s"],"0","-"],["2006","2008","-","Mar","lastSun",["2","0","0","s"],"60","S"],["2006","2008","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"ArgAQ":[["1964","1966","-","Mar","1",["0","0","0",null],"0","-"],["1964","1966","-","Oct","15",["0","0","0",null],"60","S"],["1967","only","-","Apr","2",["0","0","0",null],"0","-"],["1967","1968","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["1968","1969","-","Apr","Sun>=1",["0","0","0",null],"0","-"],["1974","only","-","Jan","23",["0","0","0",null],"60","S"],["1974","only","-","May","1",["0","0","0",null],"0","-"]],"ChileAQ":[["1972","1986","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1974","1987","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1987","only","-","Apr","12",["3","0","0","u"],"0","-"],["1988","1989","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1988","only","-","Oct","Sun>=1",["4","0","0","u"],"60","S"],["1989","only","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1990","only","-","Mar","18",["3","0","0","u"],"0","-"],["1990","only","-","Sep","16",["4","0","0","u"],"60","S"],["1991","1996","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1991","1997","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1997","only","-","Mar","30",["3","0","0","u"],"0","-"],["1998","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1998","only","-","Sep","27",["4","0","0","u"],"60","S"],["1999","only","-","Apr","4",["3","0","0","u"],"0","-"],["1999","2010","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["2000","2007","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2008","only","-","Mar","30",["3","0","0","u"],"0","-"],["2009","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2010","only","-","Apr","Sun>=1",["3","0","0","u"],"0","-"],["2011","only","-","May","Sun>=2",["3","0","0","u"],"0","-"],["2011","only","-","Aug","Sun>=16",["4","0","0","u"],"60","S"],["2012","max","-","Apr","Sun>=23",["3","0","0","u"],"0","-"],["2012","max","-","Sep","Sun>=2",["4","0","0","u"],"60","S"]],"Troll":[["2005","max","-","Mar","lastSun",["1","0","0","u"],"120","CEST"],["2004","max","-","Oct","lastSun",["1","0","0","u"],"0","UTC"]],"EUAsia":[["1981","max","-","Mar","lastSun",["1","0","0","u"],"60","S"],["1979","1995","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1996","max","-","Oct","lastSun",["1","0","0","u"],"0","-"]],"E-EurAsia":[["1981","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1979","1995","-","Sep","lastSun",["0","0","0",null],"0","-"],["1996","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"RussiaAsia":[["1981","1984","-","Apr","1",["0","0","0",null],"60","S"],["1981","1983","-","Oct","1",["0","0","0",null],"0","-"],["1984","1991","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1985","1991","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1992","only","-","Mar","lastSat",["23","0","0",null],"60","S"],["1992","only","-","Sep","lastSat",["23","0","0",null],"0","-"],["1993","max","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1993","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1996","max","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"Azer":[["1997","max","-","Mar","lastSun",["4","0","0",null],"60","S"],["1997","max","-","Oct","lastSun",["5","0","0",null],"0","-"]],"Dhaka":[["2009","only","-","Jun","19",["23","0","0",null],"60","S"],["2009","only","-","Dec","31",["24","0","0",null],"0","-"]],"Shang":[["1940","only","-","Jun","3",["0","0","0",null],"60","D"],["1940","1941","-","Oct","1",["0","0","0",null],"0","S"],["1941","only","-","Mar","16",["0","0","0",null],"60","D"]],"PRC":[["1986","only","-","May","4",["0","0","0",null],"60","D"],["1986","1991","-","Sep","Sun>=11",["0","0","0",null],"0","S"],["1987","1991","-","Apr","Sun>=10",["0","0","0",null],"60","D"]],"HK":[["1941","only","-","Apr","1",["3","30","0",null],"60","S"],["1941","only","-","Sep","30",["3","30","0",null],"0","-"],["1946","only","-","Apr","20",["3","30","0",null],"60","S"],["1946","only","-","Dec","1",["3","30","0",null],"0","-"],["1947","only","-","Apr","13",["3","30","0",null],"60","S"],["1947","only","-","Dec","30",["3","30","0",null],"0","-"],["1948","only","-","May","2",["3","30","0",null],"60","S"],["1948","1951","-","Oct","lastSun",["3","30","0",null],"0","-"],["1952","only","-","Oct","25",["3","30","0",null],"0","-"],["1949","1953","-","Apr","Sun>=1",["3","30","0",null],"60","S"],["1953","only","-","Nov","1",["3","30","0",null],"0","-"],["1954","1964","-","Mar","Sun>=18",["3","30","0",null],"60","S"],["1954","only","-","Oct","31",["3","30","0",null],"0","-"],["1955","1964","-","Nov","Sun>=1",["3","30","0",null],"0","-"],["1965","1976","-","Apr","Sun>=16",["3","30","0",null],"60","S"],["1965","1976","-","Oct","Sun>=16",["3","30","0",null],"0","-"],["1973","only","-","Dec","30",["3","30","0",null],"60","S"],["1979","only","-","May","Sun>=8",["3","30","0",null],"60","S"],["1979","only","-","Oct","Sun>=16",["3","30","0",null],"0","-"]],"Taiwan":[["1946","only","-","May","15",["0","0","0",null],"60","D"],["1946","only","-","Oct","1",["0","0","0",null],"0","S"],["1947","only","-","Apr","15",["0","0","0",null],"60","D"],["1947","only","-","Nov","1",["0","0","0",null],"0","S"],["1948","1951","-","May","1",["0","0","0",null],"60","D"],["1948","1951","-","Oct","1",["0","0","0",null],"0","S"],["1952","only","-","Mar","1",["0","0","0",null],"60","D"],["1952","1954","-","Nov","1",["0","0","0",null],"0","S"],["1953","1959","-","Apr","1",["0","0","0",null],"60","D"],["1955","1961","-","Oct","1",["0","0","0",null],"0","S"],["1960","1961","-","Jun","1",["0","0","0",null],"60","D"],["1974","1975","-","Apr","1",["0","0","0",null],"60","D"],["1974","1975","-","Oct","1",["0","0","0",null],"0","S"],["1979","only","-","Jul","1",["0","0","0",null],"60","D"],["1979","only","-","Oct","1",["0","0","0",null],"0","S"]],"Macau":[["1961","1962","-","Mar","Sun>=16",["3","30","0",null],"60","S"],["1961","1964","-","Nov","Sun>=1",["3","30","0",null],"0","-"],["1963","only","-","Mar","Sun>=16",["0","0","0",null],"60","S"],["1964","only","-","Mar","Sun>=16",["3","30","0",null],"60","S"],["1965","only","-","Mar","Sun>=16",["0","0","0",null],"60","S"],["1965","only","-","Oct","31",["0","0","0",null],"0","-"],["1966","1971","-","Apr","Sun>=16",["3","30","0",null],"60","S"],["1966","1971","-","Oct","Sun>=16",["3","30","0",null],"0","-"],["1972","1974","-","Apr","Sun>=15",["0","0","0",null],"60","S"],["1972","1973","-","Oct","Sun>=15",["0","0","0",null],"0","-"],["1974","1977","-","Oct","Sun>=15",["3","30","0",null],"0","-"],["1975","1977","-","Apr","Sun>=15",["3","30","0",null],"60","S"],["1978","1980","-","Apr","Sun>=15",["0","0","0",null],"60","S"],["1978","1980","-","Oct","Sun>=15",["0","0","0",null],"0","-"]],"Cyprus":[["1975","only","-","Apr","13",["0","0","0",null],"60","S"],["1975","only","-","Oct","12",["0","0","0",null],"0","-"],["1976","only","-","May","15",["0","0","0",null],"60","S"],["1976","only","-","Oct","11",["0","0","0",null],"0","-"],["1977","1980","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Sep","25",["0","0","0",null],"0","-"],["1978","only","-","Oct","2",["0","0","0",null],"0","-"],["1979","1997","-","Sep","lastSun",["0","0","0",null],"0","-"],["1981","1998","-","Mar","lastSun",["0","0","0",null],"60","S"]],"Iran":[["1978","1980","-","Mar","21",["0","0","0",null],"60","D"],["1978","only","-","Oct","21",["0","0","0",null],"0","S"],["1979","only","-","Sep","19",["0","0","0",null],"0","S"],["1980","only","-","Sep","23",["0","0","0",null],"0","S"],["1991","only","-","May","3",["0","0","0",null],"60","D"],["1992","1995","-","Mar","22",["0","0","0",null],"60","D"],["1991","1995","-","Sep","22",["0","0","0",null],"0","S"],["1996","only","-","Mar","21",["0","0","0",null],"60","D"],["1996","only","-","Sep","21",["0","0","0",null],"0","S"],["1997","1999","-","Mar","22",["0","0","0",null],"60","D"],["1997","1999","-","Sep","22",["0","0","0",null],"0","S"],["2000","only","-","Mar","21",["0","0","0",null],"60","D"],["2000","only","-","Sep","21",["0","0","0",null],"0","S"],["2001","2003","-","Mar","22",["0","0","0",null],"60","D"],["2001","2003","-","Sep","22",["0","0","0",null],"0","S"],["2004","only","-","Mar","21",["0","0","0",null],"60","D"],["2004","only","-","Sep","21",["0","0","0",null],"0","S"],["2005","only","-","Mar","22",["0","0","0",null],"60","D"],["2005","only","-","Sep","22",["0","0","0",null],"0","S"],["2008","only","-","Mar","21",["0","0","0",null],"60","D"],["2008","only","-","Sep","21",["0","0","0",null],"0","S"],["2009","2011","-","Mar","22",["0","0","0",null],"60","D"],["2009","2011","-","Sep","22",["0","0","0",null],"0","S"],["2012","only","-","Mar","21",["0","0","0",null],"60","D"],["2012","only","-","Sep","21",["0","0","0",null],"0","S"],["2013","2015","-","Mar","22",["0","0","0",null],"60","D"],["2013","2015","-","Sep","22",["0","0","0",null],"0","S"],["2016","only","-","Mar","21",["0","0","0",null],"60","D"],["2016","only","-","Sep","21",["0","0","0",null],"0","S"],["2017","2019","-","Mar","22",["0","0","0",null],"60","D"],["2017","2019","-","Sep","22",["0","0","0",null],"0","S"],["2020","only","-","Mar","21",["0","0","0",null],"60","D"],["2020","only","-","Sep","21",["0","0","0",null],"0","S"],["2021","2023","-","Mar","22",["0","0","0",null],"60","D"],["2021","2023","-","Sep","22",["0","0","0",null],"0","S"],["2024","only","-","Mar","21",["0","0","0",null],"60","D"],["2024","only","-","Sep","21",["0","0","0",null],"0","S"],["2025","2027","-","Mar","22",["0","0","0",null],"60","D"],["2025","2027","-","Sep","22",["0","0","0",null],"0","S"],["2028","2029","-","Mar","21",["0","0","0",null],"60","D"],["2028","2029","-","Sep","21",["0","0","0",null],"0","S"],["2030","2031","-","Mar","22",["0","0","0",null],"60","D"],["2030","2031","-","Sep","22",["0","0","0",null],"0","S"],["2032","2033","-","Mar","21",["0","0","0",null],"60","D"],["2032","2033","-","Sep","21",["0","0","0",null],"0","S"],["2034","2035","-","Mar","22",["0","0","0",null],"60","D"],["2034","2035","-","Sep","22",["0","0","0",null],"0","S"],["2036","2037","-","Mar","21",["0","0","0",null],"60","D"],["2036","2037","-","Sep","21",["0","0","0",null],"0","S"]],"Iraq":[["1982","only","-","May","1",["0","0","0",null],"60","D"],["1982","1984","-","Oct","1",["0","0","0",null],"0","S"],["1983","only","-","Mar","31",["0","0","0",null],"60","D"],["1984","1985","-","Apr","1",["0","0","0",null],"60","D"],["1985","1990","-","Sep","lastSun",["1","0","0","s"],"0","S"],["1986","1990","-","Mar","lastSun",["1","0","0","s"],"60","D"],["1991","2007","-","Apr","1",["3","0","0","s"],"60","D"],["1991","2007","-","Oct","1",["3","0","0","s"],"0","S"]],"Zion":[["1940","only","-","Jun","1",["0","0","0",null],"60","D"],["1942","1944","-","Nov","1",["0","0","0",null],"0","S"],["1943","only","-","Apr","1",["2","0","0",null],"60","D"],["1944","only","-","Apr","1",["0","0","0",null],"60","D"],["1945","only","-","Apr","16",["0","0","0",null],"60","D"],["1945","only","-","Nov","1",["2","0","0",null],"0","S"],["1946","only","-","Apr","16",["2","0","0",null],"60","D"],["1946","only","-","Nov","1",["0","0","0",null],"0","S"],["1948","only","-","May","23",["0","0","0",null],"120","DD"],["1948","only","-","Sep","1",["0","0","0",null],"60","D"],["1948","1949","-","Nov","1",["2","0","0",null],"0","S"],["1949","only","-","May","1",["0","0","0",null],"60","D"],["1950","only","-","Apr","16",["0","0","0",null],"60","D"],["1950","only","-","Sep","15",["3","0","0",null],"0","S"],["1951","only","-","Apr","1",["0","0","0",null],"60","D"],["1951","only","-","Nov","11",["3","0","0",null],"0","S"],["1952","only","-","Apr","20",["2","0","0",null],"60","D"],["1952","only","-","Oct","19",["3","0","0",null],"0","S"],["1953","only","-","Apr","12",["2","0","0",null],"60","D"],["1953","only","-","Sep","13",["3","0","0",null],"0","S"],["1954","only","-","Jun","13",["0","0","0",null],"60","D"],["1954","only","-","Sep","12",["0","0","0",null],"0","S"],["1955","only","-","Jun","11",["2","0","0",null],"60","D"],["1955","only","-","Sep","11",["0","0","0",null],"0","S"],["1956","only","-","Jun","3",["0","0","0",null],"60","D"],["1956","only","-","Sep","30",["3","0","0",null],"0","S"],["1957","only","-","Apr","29",["2","0","0",null],"60","D"],["1957","only","-","Sep","22",["0","0","0",null],"0","S"],["1974","only","-","Jul","7",["0","0","0",null],"60","D"],["1974","only","-","Oct","13",["0","0","0",null],"0","S"],["1975","only","-","Apr","20",["0","0","0",null],"60","D"],["1975","only","-","Aug","31",["0","0","0",null],"0","S"],["1985","only","-","Apr","14",["0","0","0",null],"60","D"],["1985","only","-","Sep","15",["0","0","0",null],"0","S"],["1986","only","-","May","18",["0","0","0",null],"60","D"],["1986","only","-","Sep","7",["0","0","0",null],"0","S"],["1987","only","-","Apr","15",["0","0","0",null],"60","D"],["1987","only","-","Sep","13",["0","0","0",null],"0","S"],["1988","only","-","Apr","10",["0","0","0",null],"60","D"],["1988","only","-","Sep","4",["0","0","0",null],"0","S"],["1989","only","-","Apr","30",["0","0","0",null],"60","D"],["1989","only","-","Sep","3",["0","0","0",null],"0","S"],["1990","only","-","Mar","25",["0","0","0",null],"60","D"],["1990","only","-","Aug","26",["0","0","0",null],"0","S"],["1991","only","-","Mar","24",["0","0","0",null],"60","D"],["1991","only","-","Sep","1",["0","0","0",null],"0","S"],["1992","only","-","Mar","29",["0","0","0",null],"60","D"],["1992","only","-","Sep","6",["0","0","0",null],"0","S"],["1993","only","-","Apr","2",["0","0","0",null],"60","D"],["1993","only","-","Sep","5",["0","0","0",null],"0","S"],["1994","only","-","Apr","1",["0","0","0",null],"60","D"],["1994","only","-","Aug","28",["0","0","0",null],"0","S"],["1995","only","-","Mar","31",["0","0","0",null],"60","D"],["1995","only","-","Sep","3",["0","0","0",null],"0","S"],["1996","only","-","Mar","15",["0","0","0",null],"60","D"],["1996","only","-","Sep","16",["0","0","0",null],"0","S"],["1997","only","-","Mar","21",["0","0","0",null],"60","D"],["1997","only","-","Sep","14",["0","0","0",null],"0","S"],["1998","only","-","Mar","20",["0","0","0",null],"60","D"],["1998","only","-","Sep","6",["0","0","0",null],"0","S"],["1999","only","-","Apr","2",["2","0","0",null],"60","D"],["1999","only","-","Sep","3",["2","0","0",null],"0","S"],["2000","only","-","Apr","14",["2","0","0",null],"60","D"],["2000","only","-","Oct","6",["1","0","0",null],"0","S"],["2001","only","-","Apr","9",["1","0","0",null],"60","D"],["2001","only","-","Sep","24",["1","0","0",null],"0","S"],["2002","only","-","Mar","29",["1","0","0",null],"60","D"],["2002","only","-","Oct","7",["1","0","0",null],"0","S"],["2003","only","-","Mar","28",["1","0","0",null],"60","D"],["2003","only","-","Oct","3",["1","0","0",null],"0","S"],["2004","only","-","Apr","7",["1","0","0",null],"60","D"],["2004","only","-","Sep","22",["1","0","0",null],"0","S"],["2005","only","-","Apr","1",["2","0","0",null],"60","D"],["2005","only","-","Oct","9",["2","0","0",null],"0","S"],["2006","2010","-","Mar","Fri>=26",["2","0","0",null],"60","D"],["2006","only","-","Oct","1",["2","0","0",null],"0","S"],["2007","only","-","Sep","16",["2","0","0",null],"0","S"],["2008","only","-","Oct","5",["2","0","0",null],"0","S"],["2009","only","-","Sep","27",["2","0","0",null],"0","S"],["2010","only","-","Sep","12",["2","0","0",null],"0","S"],["2011","only","-","Apr","1",["2","0","0",null],"60","D"],["2011","only","-","Oct","2",["2","0","0",null],"0","S"],["2012","only","-","Mar","Fri>=26",["2","0","0",null],"60","D"],["2012","only","-","Sep","23",["2","0","0",null],"0","S"],["2013","max","-","Mar","Fri>=23",["2","0","0",null],"60","D"],["2013","max","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Japan":[["1948","only","-","May","Sun>=1",["2","0","0",null],"60","D"],["1948","1951","-","Sep","Sat>=8",["2","0","0",null],"0","S"],["1949","only","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1950","1951","-","May","Sun>=1",["2","0","0",null],"60","D"]],"Jordan":[["1973","only","-","Jun","6",["0","0","0",null],"60","S"],["1973","1975","-","Oct","1",["0","0","0",null],"0","-"],["1974","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Nov","1",["0","0","0",null],"0","-"],["1977","only","-","Oct","1",["0","0","0",null],"0","-"],["1978","only","-","Apr","30",["0","0","0",null],"60","S"],["1978","only","-","Sep","30",["0","0","0",null],"0","-"],["1985","only","-","Apr","1",["0","0","0",null],"60","S"],["1985","only","-","Oct","1",["0","0","0",null],"0","-"],["1986","1988","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["1986","1990","-","Oct","Fri>=1",["0","0","0",null],"0","-"],["1989","only","-","May","8",["0","0","0",null],"60","S"],["1990","only","-","Apr","27",["0","0","0",null],"60","S"],["1991","only","-","Apr","17",["0","0","0",null],"60","S"],["1991","only","-","Sep","27",["0","0","0",null],"0","-"],["1992","only","-","Apr","10",["0","0","0",null],"60","S"],["1992","1993","-","Oct","Fri>=1",["0","0","0",null],"0","-"],["1993","1998","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["1994","only","-","Sep","Fri>=15",["0","0","0",null],"0","-"],["1995","1998","-","Sep","Fri>=15",["0","0","0","s"],"0","-"],["1999","only","-","Jul","1",["0","0","0","s"],"60","S"],["1999","2002","-","Sep","lastFri",["0","0","0","s"],"0","-"],["2000","2001","-","Mar","lastThu",["0","0","0","s"],"60","S"],["2002","2012","-","Mar","lastThu",["24","0","0",null],"60","S"],["2003","only","-","Oct","24",["0","0","0","s"],"0","-"],["2004","only","-","Oct","15",["0","0","0","s"],"0","-"],["2005","only","-","Sep","lastFri",["0","0","0","s"],"0","-"],["2006","2011","-","Oct","lastFri",["0","0","0","s"],"0","-"],["2013","only","-","Dec","20",["0","0","0",null],"0","-"],["2014","max","-","Mar","lastThu",["24","0","0",null],"60","S"],["2014","max","-","Oct","lastFri",["0","0","0","s"],"0","-"]],"Kyrgyz":[["1992","1996","-","Apr","Sun>=7",["0","0","0","s"],"60","S"],["1992","1996","-","Sep","lastSun",["0","0","0",null],"0","-"],["1997","2005","-","Mar","lastSun",["2","30","0",null],"60","S"],["1997","2004","-","Oct","lastSun",["2","30","0",null],"0","-"]],"ROK":[["1948","only","-","Jun","1",["0","0","0",null],"60","D"],["1948","only","-","Sep","13",["0","0","0",null],"0","S"],["1949","only","-","Apr","3",["0","0","0",null],"60","D"],["1949","1951","-","Sep","Sun>=8",["0","0","0",null],"0","S"],["1950","only","-","Apr","1",["0","0","0",null],"60","D"],["1951","only","-","May","6",["0","0","0",null],"60","D"],["1955","only","-","May","5",["0","0","0",null],"60","D"],["1955","only","-","Sep","9",["0","0","0",null],"0","S"],["1956","only","-","May","20",["0","0","0",null],"60","D"],["1956","only","-","Sep","30",["0","0","0",null],"0","S"],["1957","1960","-","May","Sun>=1",["0","0","0",null],"60","D"],["1957","1960","-","Sep","Sun>=18",["0","0","0",null],"0","S"],["1987","1988","-","May","Sun>=8",["2","0","0",null],"60","D"],["1987","1988","-","Oct","Sun>=8",["3","0","0",null],"0","S"]],"Lebanon":[["1920","only","-","Mar","28",["0","0","0",null],"60","S"],["1920","only","-","Oct","25",["0","0","0",null],"0","-"],["1921","only","-","Apr","3",["0","0","0",null],"60","S"],["1921","only","-","Oct","3",["0","0","0",null],"0","-"],["1922","only","-","Mar","26",["0","0","0",null],"60","S"],["1922","only","-","Oct","8",["0","0","0",null],"0","-"],["1923","only","-","Apr","22",["0","0","0",null],"60","S"],["1923","only","-","Sep","16",["0","0","0",null],"0","-"],["1957","1961","-","May","1",["0","0","0",null],"60","S"],["1957","1961","-","Oct","1",["0","0","0",null],"0","-"],["1972","only","-","Jun","22",["0","0","0",null],"60","S"],["1972","1977","-","Oct","1",["0","0","0",null],"0","-"],["1973","1977","-","May","1",["0","0","0",null],"60","S"],["1978","only","-","Apr","30",["0","0","0",null],"60","S"],["1978","only","-","Sep","30",["0","0","0",null],"0","-"],["1984","1987","-","May","1",["0","0","0",null],"60","S"],["1984","1991","-","Oct","16",["0","0","0",null],"0","-"],["1988","only","-","Jun","1",["0","0","0",null],"60","S"],["1989","only","-","May","10",["0","0","0",null],"60","S"],["1990","1992","-","May","1",["0","0","0",null],"60","S"],["1992","only","-","Oct","4",["0","0","0",null],"0","-"],["1993","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1993","1998","-","Sep","lastSun",["0","0","0",null],"0","-"],["1999","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"NBorneo":[["1935","1941","-","Sep","14",["0","0","0",null],"20","TS",""],["1935","1941","-","Dec","14",["0","0","0",null],"0","-"]],"Mongol":[["1983","1984","-","Apr","1",["0","0","0",null],"60","S"],["1983","only","-","Oct","1",["0","0","0",null],"0","-"],["1985","1998","-","Mar","lastSun",["0","0","0",null],"60","S"],["1984","1998","-","Sep","lastSun",["0","0","0",null],"0","-"],["2001","only","-","Apr","lastSat",["2","0","0",null],"60","S"],["2001","2006","-","Sep","lastSat",["2","0","0",null],"0","-"],["2002","2006","-","Mar","lastSat",["2","0","0",null],"60","S"]],"Pakistan":[["2002","only","-","Apr","Sun>=2",["0","1","0",null],"60","S"],["2002","only","-","Oct","Sun>=2",["0","1","0",null],"0","-"],["2008","only","-","Jun","1",["0","0","0",null],"60","S"],["2008","2009","-","Nov","1",["0","0","0",null],"0","-"],["2009","only","-","Apr","15",["0","0","0",null],"60","S"]],"EgyptAsia":[["1957","only","-","May","10",["0","0","0",null],"60","S"],["1957","1958","-","Oct","1",["0","0","0",null],"0","-"],["1958","only","-","May","1",["0","0","0",null],"60","S"],["1959","1967","-","May","1",["1","0","0",null],"60","S"],["1959","1965","-","Sep","30",["3","0","0",null],"0","-"],["1966","only","-","Oct","1",["3","0","0",null],"0","-"]],"Palestine":[["1999","2005","-","Apr","Fri>=15",["0","0","0",null],"60","S"],["1999","2003","-","Oct","Fri>=15",["0","0","0",null],"0","-"],["2004","only","-","Oct","1",["1","0","0",null],"0","-"],["2005","only","-","Oct","4",["2","0","0",null],"0","-"],["2006","2007","-","Apr","1",["0","0","0",null],"60","S"],["2006","only","-","Sep","22",["0","0","0",null],"0","-"],["2007","only","-","Sep","Thu>=8",["2","0","0",null],"0","-"],["2008","2009","-","Mar","lastFri",["0","0","0",null],"60","S"],["2008","only","-","Sep","1",["0","0","0",null],"0","-"],["2009","only","-","Sep","Fri>=1",["1","0","0",null],"0","-"],["2010","only","-","Mar","26",["0","0","0",null],"60","S"],["2010","only","-","Aug","11",["0","0","0",null],"0","-"],["2011","only","-","Apr","1",["0","1","0",null],"60","S"],["2011","only","-","Aug","1",["0","0","0",null],"0","-"],["2011","only","-","Aug","30",["0","0","0",null],"60","S"],["2011","only","-","Sep","30",["0","0","0",null],"0","-"],["2012","max","-","Mar","lastThu",["24","0","0",null],"60","S"],["2012","only","-","Sep","21",["1","0","0",null],"0","-"],["2013","max","-","Sep","Fri>=21",["0","0","0",null],"0","-"]],"Phil":[["1936","only","-","Nov","1",["0","0","0",null],"60","S"],["1937","only","-","Feb","1",["0","0","0",null],"0","-"],["1954","only","-","Apr","12",["0","0","0",null],"60","S"],["1954","only","-","Jul","1",["0","0","0",null],"0","-"],["1978","only","-","Mar","22",["0","0","0",null],"60","S"],["1978","only","-","Sep","21",["0","0","0",null],"0","-"]],"Syria":[["1920","1923","-","Apr","Sun>=15",["2","0","0",null],"60","S"],["1920","1923","-","Oct","Sun>=1",["2","0","0",null],"0","-"],["1962","only","-","Apr","29",["2","0","0",null],"60","S"],["1962","only","-","Oct","1",["2","0","0",null],"0","-"],["1963","1965","-","May","1",["2","0","0",null],"60","S"],["1963","only","-","Sep","30",["2","0","0",null],"0","-"],["1964","only","-","Oct","1",["2","0","0",null],"0","-"],["1965","only","-","Sep","30",["2","0","0",null],"0","-"],["1966","only","-","Apr","24",["2","0","0",null],"60","S"],["1966","1976","-","Oct","1",["2","0","0",null],"0","-"],["1967","1978","-","May","1",["2","0","0",null],"60","S"],["1977","1978","-","Sep","1",["2","0","0",null],"0","-"],["1983","1984","-","Apr","9",["2","0","0",null],"60","S"],["1983","1984","-","Oct","1",["2","0","0",null],"0","-"],["1986","only","-","Feb","16",["2","0","0",null],"60","S"],["1986","only","-","Oct","9",["2","0","0",null],"0","-"],["1987","only","-","Mar","1",["2","0","0",null],"60","S"],["1987","1988","-","Oct","31",["2","0","0",null],"0","-"],["1988","only","-","Mar","15",["2","0","0",null],"60","S"],["1989","only","-","Mar","31",["2","0","0",null],"60","S"],["1989","only","-","Oct","1",["2","0","0",null],"0","-"],["1990","only","-","Apr","1",["2","0","0",null],"60","S"],["1990","only","-","Sep","30",["2","0","0",null],"0","-"],["1991","only","-","Apr","1",["0","0","0",null],"60","S"],["1991","1992","-","Oct","1",["0","0","0",null],"0","-"],["1992","only","-","Apr","8",["0","0","0",null],"60","S"],["1993","only","-","Mar","26",["0","0","0",null],"60","S"],["1993","only","-","Sep","25",["0","0","0",null],"0","-"],["1994","1996","-","Apr","1",["0","0","0",null],"60","S"],["1994","2005","-","Oct","1",["0","0","0",null],"0","-"],["1997","1998","-","Mar","lastMon",["0","0","0",null],"60","S"],["1999","2006","-","Apr","1",["0","0","0",null],"60","S"],["2006","only","-","Sep","22",["0","0","0",null],"0","-"],["2007","only","-","Mar","lastFri",["0","0","0",null],"60","S"],["2007","only","-","Nov","Fri>=1",["0","0","0",null],"0","-"],["2008","only","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["2008","only","-","Nov","1",["0","0","0",null],"0","-"],["2009","only","-","Mar","lastFri",["0","0","0",null],"60","S"],["2010","2011","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["2012","max","-","Mar","lastFri",["0","0","0",null],"60","S"],["2009","max","-","Oct","lastFri",["0","0","0",null],"0","-"]],"Aus":[["1917","only","-","Jan","1",["0","1","0",null],"60","D"],["1917","only","-","Mar","25",["2","0","0",null],"0","S"],["1942","only","-","Jan","1",["2","0","0",null],"60","D"],["1942","only","-","Mar","29",["2","0","0",null],"0","S"],["1942","only","-","Sep","27",["2","0","0",null],"60","D"],["1943","1944","-","Mar","lastSun",["2","0","0",null],"0","S"],["1943","only","-","Oct","3",["2","0","0",null],"60","D"]],"AW":[["1974","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1975","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1983","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1984","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1991","only","-","Nov","17",["2","0","0","s"],"60","D"],["1992","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["2006","only","-","Dec","3",["2","0","0","s"],"60","D"],["2007","2009","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2007","2008","-","Oct","lastSun",["2","0","0","s"],"60","D"]],"AQ":[["1971","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1989","1991","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1990","1992","-","Mar","Sun>=1",["2","0","0","s"],"0","S"]],"Holiday":[["1992","1993","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1993","1994","-","Mar","Sun>=1",["2","0","0","s"],"0","S"]],"AS":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1986","only","-","Oct","19",["2","0","0","s"],"60","D"],["1987","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","27",["2","0","0","s"],"0","S"],["1973","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1991","only","-","Mar","3",["2","0","0","s"],"0","S"],["1992","only","-","Mar","22",["2","0","0","s"],"0","S"],["1993","only","-","Mar","7",["2","0","0","s"],"0","S"],["1994","only","-","Mar","20",["2","0","0","s"],"0","S"],["1995","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2006","only","-","Apr","2",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"AT":[["1967","only","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1968","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["1968","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1969","1971","-","Mar","Sun>=8",["2","0","0","s"],"0","S"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1973","1981","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1982","1983","-","Mar","lastSun",["2","0","0","s"],"0","S"],["1984","1986","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","only","-","Oct","Sun>=15",["2","0","0","s"],"60","D"],["1987","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1987","only","-","Oct","Sun>=22",["2","0","0","s"],"60","D"],["1988","1990","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1991","1999","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1991","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"]],"AV":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1973","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1986","1987","-","Oct","Sun>=15",["2","0","0","s"],"60","D"],["1988","1999","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1991","1994","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1995","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"AN":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","27",["2","0","0","s"],"0","S"],["1973","1981","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1982","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["1983","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1989","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1986","only","-","Oct","19",["2","0","0","s"],"60","D"],["1987","1999","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1990","1995","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1996","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"LH":[["1981","1984","-","Oct","lastSun",["2","0","0",null],"60","D"],["1982","1985","-","Mar","Sun>=1",["2","0","0",null],"0","S"],["1985","only","-","Oct","lastSun",["2","0","0",null],"30","D"],["1986","1989","-","Mar","Sun>=15",["2","0","0",null],"0","S"],["1986","only","-","Oct","19",["2","0","0",null],"30","D"],["1987","1999","-","Oct","lastSun",["2","0","0",null],"30","D"],["1990","1995","-","Mar","Sun>=1",["2","0","0",null],"0","S"],["1996","2005","-","Mar","lastSun",["2","0","0",null],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0",null],"30","D"],["2001","2007","-","Oct","lastSun",["2","0","0",null],"30","D"],["2006","only","-","Apr","Sun>=1",["2","0","0",null],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0",null],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0",null],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0",null],"30","D"]],"Fiji":[["1998","1999","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["1999","2000","-","Feb","lastSun",["3","0","0",null],"0","-"],["2009","only","-","Nov","29",["2","0","0",null],"60","S"],["2010","only","-","Mar","lastSun",["3","0","0",null],"0","-"],["2010","2013","-","Oct","Sun>=21",["2","0","0",null],"60","S"],["2011","only","-","Mar","Sun>=1",["3","0","0",null],"0","-"],["2012","2013","-","Jan","Sun>=18",["3","0","0",null],"0","-"],["2014","only","-","Jan","Sun>=18",["2","0","0",null],"0","-"],["2014","max","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["2015","max","-","Jan","Sun>=18",["3","0","0",null],"0","-"]],"NC":[["1977","1978","-","Dec","Sun>=1",["0","0","0",null],"60","S"],["1978","1979","-","Feb","27",["0","0","0",null],"0","-"],["1996","only","-","Dec","1",["2","0","0","s"],"60","S"],["1997","only","-","Mar","2",["2","0","0","s"],"0","-"]],"NZ":[["1927","only","-","Nov","6",["2","0","0",null],"60","S"],["1928","only","-","Mar","4",["2","0","0",null],"0","M"],["1928","1933","-","Oct","Sun>=8",["2","0","0",null],"30","S"],["1929","1933","-","Mar","Sun>=15",["2","0","0",null],"0","M"],["1934","1940","-","Apr","lastSun",["2","0","0",null],"0","M"],["1934","1940","-","Sep","lastSun",["2","0","0",null],"30","S"],["1946","only","-","Jan","1",["0","0","0",null],"0","S"],["1974","only","-","Nov","Sun>=1",["2","0","0","s"],"60","D"],["1975","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1975","1988","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1976","1989","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1989","only","-","Oct","Sun>=8",["2","0","0","s"],"60","D"],["1990","2006","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1990","2007","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["2007","max","-","Sep","lastSun",["2","0","0","s"],"60","D"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"]],"Chatham":[["1974","only","-","Nov","Sun>=1",["2","45","0","s"],"60","D"],["1975","only","-","Feb","lastSun",["2","45","0","s"],"0","S"],["1975","1988","-","Oct","lastSun",["2","45","0","s"],"60","D"],["1976","1989","-","Mar","Sun>=1",["2","45","0","s"],"0","S"],["1989","only","-","Oct","Sun>=8",["2","45","0","s"],"60","D"],["1990","2006","-","Oct","Sun>=1",["2","45","0","s"],"60","D"],["1990","2007","-","Mar","Sun>=15",["2","45","0","s"],"0","S"],["2007","max","-","Sep","lastSun",["2","45","0","s"],"60","D"],["2008","max","-","Apr","Sun>=1",["2","45","0","s"],"0","S"]],"Cook":[["1978","only","-","Nov","12",["0","0","0",null],"30","HS"],["1979","1991","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1979","1990","-","Oct","lastSun",["0","0","0",null],"30","HS"]],"WS":[["2010","only","-","Sep","lastSun",["0","0","0",null],"60","D"],["2011","only","-","Apr","Sat>=1",["4","0","0",null],"0","S"],["2011","only","-","Sep","lastSat",["3","0","0",null],"60","D"],["2012","max","-","Apr","Sun>=1",["4","0","0",null],"0","S"],["2012","max","-","Sep","lastSun",["3","0","0",null],"60","D"]],"Tonga":[["1999","only","-","Oct","7",["2","0","0","s"],"60","S"],["2000","only","-","Mar","19",["2","0","0","s"],"0","-"],["2000","2001","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["2001","2002","-","Jan","lastSun",["2","0","0",null],"0","-"]],"Vanuatu":[["1983","only","-","Sep","25",["0","0","0",null],"60","S"],["1984","1991","-","Mar","Sun>=23",["0","0","0",null],"0","-"],["1984","only","-","Oct","23",["0","0","0",null],"60","S"],["1985","1991","-","Sep","Sun>=23",["0","0","0",null],"60","S"],["1992","1993","-","Jan","Sun>=23",["0","0","0",null],"0","-"],["1992","only","-","Oct","Sun>=23",["0","0","0",null],"60","S"]],"GB-Eire":[["1916","only","-","May","21",["2","0","0","s"],"60","BST"],["1916","only","-","Oct","1",["2","0","0","s"],"0","GMT"],["1917","only","-","Apr","8",["2","0","0","s"],"60","BST"],["1917","only","-","Sep","17",["2","0","0","s"],"0","GMT"],["1918","only","-","Mar","24",["2","0","0","s"],"60","BST"],["1918","only","-","Sep","30",["2","0","0","s"],"0","GMT"],["1919","only","-","Mar","30",["2","0","0","s"],"60","BST"],["1919","only","-","Sep","29",["2","0","0","s"],"0","GMT"],["1920","only","-","Mar","28",["2","0","0","s"],"60","BST"],["1920","only","-","Oct","25",["2","0","0","s"],"0","GMT"],["1921","only","-","Apr","3",["2","0","0","s"],"60","BST"],["1921","only","-","Oct","3",["2","0","0","s"],"0","GMT"],["1922","only","-","Mar","26",["2","0","0","s"],"60","BST"],["1922","only","-","Oct","8",["2","0","0","s"],"0","GMT"],["1923","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1923","1924","-","Sep","Sun>=16",["2","0","0","s"],"0","GMT"],["1924","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1925","1926","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1925","1938","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1927","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1928","1929","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1930","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1931","1932","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1933","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1934","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1935","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1936","1937","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1938","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1939","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1939","only","-","Nov","Sun>=16",["2","0","0","s"],"0","GMT"],["1940","only","-","Feb","Sun>=23",["2","0","0","s"],"60","BST"],["1941","only","-","May","Sun>=2",["1","0","0","s"],"120","BDST"],["1941","1943","-","Aug","Sun>=9",["1","0","0","s"],"60","BST"],["1942","1944","-","Apr","Sun>=2",["1","0","0","s"],"120","BDST"],["1944","only","-","Sep","Sun>=16",["1","0","0","s"],"60","BST"],["1945","only","-","Apr","Mon>=2",["1","0","0","s"],"120","BDST"],["1945","only","-","Jul","Sun>=9",["1","0","0","s"],"60","BST"],["1945","1946","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1946","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1947","only","-","Mar","16",["2","0","0","s"],"60","BST"],["1947","only","-","Apr","13",["1","0","0","s"],"120","BDST"],["1947","only","-","Aug","10",["1","0","0","s"],"60","BST"],["1947","only","-","Nov","2",["2","0","0","s"],"0","GMT"],["1948","only","-","Mar","14",["2","0","0","s"],"60","BST"],["1948","only","-","Oct","31",["2","0","0","s"],"0","GMT"],["1949","only","-","Apr","3",["2","0","0","s"],"60","BST"],["1949","only","-","Oct","30",["2","0","0","s"],"0","GMT"],["1950","1952","-","Apr","Sun>=14",["2","0","0","s"],"60","BST"],["1950","1952","-","Oct","Sun>=21",["2","0","0","s"],"0","GMT"],["1953","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1953","1960","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1954","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1955","1956","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1957","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1958","1959","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1960","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1961","1963","-","Mar","lastSun",["2","0","0","s"],"60","BST"],["1961","1968","-","Oct","Sun>=23",["2","0","0","s"],"0","GMT"],["1964","1967","-","Mar","Sun>=19",["2","0","0","s"],"60","BST"],["1968","only","-","Feb","18",["2","0","0","s"],"60","BST"],["1972","1980","-","Mar","Sun>=16",["2","0","0","s"],"60","BST"],["1972","1980","-","Oct","Sun>=23",["2","0","0","s"],"0","GMT"],["1981","1995","-","Mar","lastSun",["1","0","0","u"],"60","BST"],["1981","1989","-","Oct","Sun>=23",["1","0","0","u"],"0","GMT"],["1990","1995","-","Oct","Sun>=22",["1","0","0","u"],"0","GMT"]],"EU":[["1977","1980","-","Apr","Sun>=1",["1","0","0","u"],"60","S"],["1977","only","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1978","only","-","Oct","1",["1","0","0","u"],"0","-"],["1979","1995","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1981","max","-","Mar","lastSun",["1","0","0","u"],"60","S"],["1996","max","-","Oct","lastSun",["1","0","0","u"],"0","-"]],"W-Eur":[["1977","1980","-","Apr","Sun>=1",["1","0","0","s"],"60","S"],["1977","only","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1978","only","-","Oct","1",["1","0","0","s"],"0","-"],["1979","1995","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1981","max","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1996","max","-","Oct","lastSun",["1","0","0","s"],"0","-"]],"C-Eur":[["1916","only","-","Apr","30",["23","0","0",null],"60","S"],["1916","only","-","Oct","1",["1","0","0",null],"0","-"],["1917","1918","-","Apr","Mon>=15",["2","0","0","s"],"60","S"],["1917","1918","-","Sep","Mon>=15",["2","0","0","s"],"0","-"],["1940","only","-","Apr","1",["2","0","0","s"],"60","S"],["1942","only","-","Nov","2",["2","0","0","s"],"0","-"],["1943","only","-","Mar","29",["2","0","0","s"],"60","S"],["1943","only","-","Oct","4",["2","0","0","s"],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0","s"],"60","S"],["1944","only","-","Oct","2",["2","0","0","s"],"0","-"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"],["1977","1980","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1977","only","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1978","only","-","Oct","1",["2","0","0","s"],"0","-"],["1979","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1981","max","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1996","max","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"E-Eur":[["1977","1980","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1978","only","-","Oct","1",["0","0","0",null],"0","-"],["1979","1995","-","Sep","lastSun",["0","0","0",null],"0","-"],["1981","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1996","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"Russia":[["1917","only","-","Jul","1",["23","0","0",null],"60","MST",""],["1917","only","-","Dec","28",["0","0","0",null],"0","MMT",""],["1918","only","-","May","31",["22","0","0",null],"120","MDST",""],["1918","only","-","Sep","16",["1","0","0",null],"60","MST"],["1919","only","-","May","31",["23","0","0",null],"120","MDST"],["1919","only","-","Jul","1",["2","0","0",null],"60","MSD"],["1919","only","-","Aug","16",["0","0","0",null],"0","MSK"],["1921","only","-","Feb","14",["23","0","0",null],"60","MSD"],["1921","only","-","Mar","20",["23","0","0",null],"120","MSM",""],["1921","only","-","Sep","1",["0","0","0",null],"60","MSD"],["1921","only","-","Oct","1",["0","0","0",null],"0","-"],["1981","1984","-","Apr","1",["0","0","0",null],"60","S"],["1981","1983","-","Oct","1",["0","0","0",null],"0","-"],["1984","1991","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1985","1991","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1992","only","-","Mar","lastSat",["23","0","0",null],"60","S"],["1992","only","-","Sep","lastSat",["23","0","0",null],"0","-"],["1993","2010","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1993","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1996","2010","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"Albania":[["1940","only","-","Jun","16",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","29",["2","0","0",null],"60","S"],["1943","only","-","Apr","10",["3","0","0",null],"0","-"],["1974","only","-","May","4",["0","0","0",null],"60","S"],["1974","only","-","Oct","2",["0","0","0",null],"0","-"],["1975","only","-","May","1",["0","0","0",null],"60","S"],["1975","only","-","Oct","2",["0","0","0",null],"0","-"],["1976","only","-","May","2",["0","0","0",null],"60","S"],["1976","only","-","Oct","3",["0","0","0",null],"0","-"],["1977","only","-","May","8",["0","0","0",null],"60","S"],["1977","only","-","Oct","2",["0","0","0",null],"0","-"],["1978","only","-","May","6",["0","0","0",null],"60","S"],["1978","only","-","Oct","1",["0","0","0",null],"0","-"],["1979","only","-","May","5",["0","0","0",null],"60","S"],["1979","only","-","Sep","30",["0","0","0",null],"0","-"],["1980","only","-","May","3",["0","0","0",null],"60","S"],["1980","only","-","Oct","4",["0","0","0",null],"0","-"],["1981","only","-","Apr","26",["0","0","0",null],"60","S"],["1981","only","-","Sep","27",["0","0","0",null],"0","-"],["1982","only","-","May","2",["0","0","0",null],"60","S"],["1982","only","-","Oct","3",["0","0","0",null],"0","-"],["1983","only","-","Apr","18",["0","0","0",null],"60","S"],["1983","only","-","Oct","1",["0","0","0",null],"0","-"],["1984","only","-","Apr","1",["0","0","0",null],"60","S"]],"Austria":[["1920","only","-","Apr","5",["2","0","0","s"],"60","S"],["1920","only","-","Sep","13",["2","0","0","s"],"0","-"],["1946","only","-","Apr","14",["2","0","0","s"],"60","S"],["1946","1948","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","6",["2","0","0","s"],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1980","only","-","Apr","6",["0","0","0",null],"60","S"],["1980","only","-","Sep","28",["0","0","0",null],"0","-"]],"Belgium":[["1918","only","-","Mar","9",["0","0","0","s"],"60","S"],["1918","1919","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Oct","25",["23","0","0","s"],"0","-"],["1922","only","-","Mar","25",["23","0","0","s"],"60","S"],["1922","1927","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1923","only","-","Apr","21",["23","0","0","s"],"60","S"],["1924","only","-","Mar","29",["23","0","0","s"],"60","S"],["1925","only","-","Apr","4",["23","0","0","s"],"60","S"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1928","1938","-","Oct","Sun>=2",["2","0","0","s"],"0","-"],["1929","only","-","Apr","21",["2","0","0","s"],"60","S"],["1930","only","-","Apr","13",["2","0","0","s"],"60","S"],["1931","only","-","Apr","19",["2","0","0","s"],"60","S"],["1932","only","-","Apr","3",["2","0","0","s"],"60","S"],["1933","only","-","Mar","26",["2","0","0","s"],"60","S"],["1934","only","-","Apr","8",["2","0","0","s"],"60","S"],["1935","only","-","Mar","31",["2","0","0","s"],"60","S"],["1936","only","-","Apr","19",["2","0","0","s"],"60","S"],["1937","only","-","Apr","4",["2","0","0","s"],"60","S"],["1938","only","-","Mar","27",["2","0","0","s"],"60","S"],["1939","only","-","Apr","16",["2","0","0","s"],"60","S"],["1939","only","-","Nov","19",["2","0","0","s"],"0","-"],["1940","only","-","Feb","25",["2","0","0","s"],"60","S"],["1944","only","-","Sep","17",["2","0","0","s"],"0","-"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"],["1946","only","-","May","19",["2","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"]],"Bulg":[["1979","only","-","Mar","31",["23","0","0",null],"60","S"],["1979","only","-","Oct","1",["1","0","0",null],"0","-"],["1980","1982","-","Apr","Sat>=1",["23","0","0",null],"60","S"],["1980","only","-","Sep","29",["1","0","0",null],"0","-"],["1981","only","-","Sep","27",["2","0","0",null],"0","-"]],"Czech":[["1945","only","-","Apr","8",["2","0","0","s"],"60","S"],["1945","only","-","Nov","18",["2","0","0","s"],"0","-"],["1946","only","-","May","6",["2","0","0","s"],"60","S"],["1946","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","20",["2","0","0","s"],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","9",["2","0","0","s"],"60","S"]],"Denmark":[["1916","only","-","May","14",["23","0","0",null],"60","S"],["1916","only","-","Sep","30",["23","0","0",null],"0","-"],["1940","only","-","May","15",["0","0","0",null],"60","S"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Aug","15",["2","0","0","s"],"0","-"],["1946","only","-","May","1",["2","0","0","s"],"60","S"],["1946","only","-","Sep","1",["2","0","0","s"],"0","-"],["1947","only","-","May","4",["2","0","0","s"],"60","S"],["1947","only","-","Aug","10",["2","0","0","s"],"0","-"],["1948","only","-","May","9",["2","0","0","s"],"60","S"],["1948","only","-","Aug","8",["2","0","0","s"],"0","-"]],"Thule":[["1991","1992","-","Mar","lastSun",["2","0","0",null],"60","D"],["1991","1992","-","Sep","lastSun",["2","0","0",null],"0","S"],["1993","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1993","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"Finland":[["1942","only","-","Apr","2",["24","0","0",null],"60","S"],["1942","only","-","Oct","4",["1","0","0",null],"0","-"],["1981","1982","-","Mar","lastSun",["2","0","0",null],"60","S"],["1981","1982","-","Sep","lastSun",["3","0","0",null],"0","-"]],"France":[["1916","only","-","Jun","14",["23","0","0","s"],"60","S"],["1916","1919","-","Oct","Sun>=1",["23","0","0","s"],"0","-"],["1917","only","-","Mar","24",["23","0","0","s"],"60","S"],["1918","only","-","Mar","9",["23","0","0","s"],"60","S"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Oct","25",["23","0","0","s"],"0","-"],["1922","only","-","Mar","25",["23","0","0","s"],"60","S"],["1922","1938","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1923","only","-","May","26",["23","0","0","s"],"60","S"],["1924","only","-","Mar","29",["23","0","0","s"],"60","S"],["1925","only","-","Apr","4",["23","0","0","s"],"60","S"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1930","only","-","Apr","12",["23","0","0","s"],"60","S"],["1931","only","-","Apr","18",["23","0","0","s"],"60","S"],["1932","only","-","Apr","2",["23","0","0","s"],"60","S"],["1933","only","-","Mar","25",["23","0","0","s"],"60","S"],["1934","only","-","Apr","7",["23","0","0","s"],"60","S"],["1935","only","-","Mar","30",["23","0","0","s"],"60","S"],["1936","only","-","Apr","18",["23","0","0","s"],"60","S"],["1937","only","-","Apr","3",["23","0","0","s"],"60","S"],["1938","only","-","Mar","26",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","25",["2","0","0",null],"60","S"],["1941","only","-","May","5",["0","0","0",null],"120","M",""],["1941","only","-","Oct","6",["0","0","0",null],"60","S"],["1942","only","-","Mar","9",["0","0","0",null],"120","M"],["1942","only","-","Nov","2",["3","0","0",null],"60","S"],["1943","only","-","Mar","29",["2","0","0",null],"120","M"],["1943","only","-","Oct","4",["3","0","0",null],"60","S"],["1944","only","-","Apr","3",["2","0","0",null],"120","M"],["1944","only","-","Oct","8",["1","0","0",null],"60","S"],["1945","only","-","Apr","2",["2","0","0",null],"120","M"],["1945","only","-","Sep","16",["3","0","0",null],"0","-"],["1976","only","-","Mar","28",["1","0","0",null],"60","S"],["1976","only","-","Sep","26",["1","0","0",null],"0","-"]],"Germany":[["1946","only","-","Apr","14",["2","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","6",["3","0","0","s"],"60","S"],["1947","only","-","May","11",["2","0","0","s"],"120","M"],["1947","only","-","Jun","29",["3","0","0",null],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","10",["2","0","0","s"],"60","S"]],"SovietZone":[["1945","only","-","May","24",["2","0","0",null],"120","M",""],["1945","only","-","Sep","24",["3","0","0",null],"60","S"],["1945","only","-","Nov","18",["2","0","0","s"],"0","-"]],"Greece":[["1932","only","-","Jul","7",["0","0","0",null],"60","S"],["1932","only","-","Sep","1",["0","0","0",null],"0","-"],["1941","only","-","Apr","7",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","30",["0","0","0",null],"60","S"],["1943","only","-","Oct","4",["0","0","0",null],"0","-"],["1952","only","-","Jul","1",["0","0","0",null],"60","S"],["1952","only","-","Nov","2",["0","0","0",null],"0","-"],["1975","only","-","Apr","12",["0","0","0","s"],"60","S"],["1975","only","-","Nov","26",["0","0","0","s"],"0","-"],["1976","only","-","Apr","11",["2","0","0","s"],"60","S"],["1976","only","-","Oct","10",["2","0","0","s"],"0","-"],["1977","1978","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1977","only","-","Sep","26",["2","0","0","s"],"0","-"],["1978","only","-","Sep","24",["4","0","0",null],"0","-"],["1979","only","-","Apr","1",["9","0","0",null],"60","S"],["1979","only","-","Sep","29",["2","0","0",null],"0","-"],["1980","only","-","Apr","1",["0","0","0",null],"60","S"],["1980","only","-","Sep","28",["0","0","0",null],"0","-"]],"Hungary":[["1918","only","-","Apr","1",["3","0","0",null],"60","S"],["1918","only","-","Sep","16",["3","0","0",null],"0","-"],["1919","only","-","Apr","15",["3","0","0",null],"60","S"],["1919","only","-","Nov","24",["3","0","0",null],"0","-"],["1945","only","-","May","1",["23","0","0",null],"60","S"],["1945","only","-","Nov","1",["0","0","0",null],"0","-"],["1946","only","-","Mar","31",["2","0","0","s"],"60","S"],["1946","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","1949","-","Apr","Sun>=4",["2","0","0","s"],"60","S"],["1950","only","-","Apr","17",["2","0","0","s"],"60","S"],["1950","only","-","Oct","23",["2","0","0","s"],"0","-"],["1954","1955","-","May","23",["0","0","0",null],"60","S"],["1954","1955","-","Oct","3",["0","0","0",null],"0","-"],["1956","only","-","Jun","Sun>=1",["0","0","0",null],"60","S"],["1956","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1957","only","-","Jun","Sun>=1",["1","0","0",null],"60","S"],["1957","only","-","Sep","lastSun",["3","0","0",null],"0","-"],["1980","only","-","Apr","6",["1","0","0",null],"60","S"]],"Iceland":[["1917","1918","-","Feb","19",["23","0","0",null],"60","S"],["1917","only","-","Oct","21",["1","0","0",null],"0","-"],["1918","only","-","Nov","16",["1","0","0",null],"0","-"],["1939","only","-","Apr","29",["23","0","0",null],"60","S"],["1939","only","-","Nov","29",["2","0","0",null],"0","-"],["1940","only","-","Feb","25",["2","0","0",null],"60","S"],["1940","only","-","Nov","3",["2","0","0",null],"0","-"],["1941","only","-","Mar","2",["1","0","0","s"],"60","S"],["1941","only","-","Nov","2",["1","0","0","s"],"0","-"],["1942","only","-","Mar","8",["1","0","0","s"],"60","S"],["1942","only","-","Oct","25",["1","0","0","s"],"0","-"],["1943","1946","-","Mar","Sun>=1",["1","0","0","s"],"60","S"],["1943","1948","-","Oct","Sun>=22",["1","0","0","s"],"0","-"],["1947","1967","-","Apr","Sun>=1",["1","0","0","s"],"60","S"],["1949","only","-","Oct","30",["1","0","0","s"],"0","-"],["1950","1966","-","Oct","Sun>=22",["1","0","0","s"],"0","-"],["1967","only","-","Oct","29",["1","0","0","s"],"0","-"]],"Italy":[["1916","only","-","Jun","3",["0","0","0","s"],"60","S"],["1916","only","-","Oct","1",["0","0","0","s"],"0","-"],["1917","only","-","Apr","1",["0","0","0","s"],"60","S"],["1917","only","-","Sep","30",["0","0","0","s"],"0","-"],["1918","only","-","Mar","10",["0","0","0","s"],"60","S"],["1918","1919","-","Oct","Sun>=1",["0","0","0","s"],"0","-"],["1919","only","-","Mar","2",["0","0","0","s"],"60","S"],["1920","only","-","Mar","21",["0","0","0","s"],"60","S"],["1920","only","-","Sep","19",["0","0","0","s"],"0","-"],["1940","only","-","Jun","15",["0","0","0","s"],"60","S"],["1944","only","-","Sep","17",["0","0","0","s"],"0","-"],["1945","only","-","Apr","2",["2","0","0",null],"60","S"],["1945","only","-","Sep","15",["0","0","0","s"],"0","-"],["1946","only","-","Mar","17",["2","0","0","s"],"60","S"],["1946","only","-","Oct","6",["2","0","0","s"],"0","-"],["1947","only","-","Mar","16",["0","0","0","s"],"60","S"],["1947","only","-","Oct","5",["0","0","0","s"],"0","-"],["1948","only","-","Feb","29",["2","0","0","s"],"60","S"],["1948","only","-","Oct","3",["2","0","0","s"],"0","-"],["1966","1968","-","May","Sun>=22",["0","0","0",null],"60","S"],["1966","1969","-","Sep","Sun>=22",["0","0","0",null],"0","-"],["1969","only","-","Jun","1",["0","0","0",null],"60","S"],["1970","only","-","May","31",["0","0","0",null],"60","S"],["1970","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1971","1972","-","May","Sun>=22",["0","0","0",null],"60","S"],["1971","only","-","Sep","lastSun",["1","0","0",null],"0","-"],["1972","only","-","Oct","1",["0","0","0",null],"0","-"],["1973","only","-","Jun","3",["0","0","0",null],"60","S"],["1973","1974","-","Sep","lastSun",["0","0","0",null],"0","-"],["1974","only","-","May","26",["0","0","0",null],"60","S"],["1975","only","-","Jun","1",["0","0","0","s"],"60","S"],["1975","1977","-","Sep","lastSun",["0","0","0","s"],"0","-"],["1976","only","-","May","30",["0","0","0","s"],"60","S"],["1977","1979","-","May","Sun>=22",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1979","only","-","Sep","30",["0","0","0","s"],"0","-"]],"Latvia":[["1989","1996","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1989","1996","-","Sep","lastSun",["2","0","0","s"],"0","-"]],"Lux":[["1916","only","-","May","14",["23","0","0",null],"60","S"],["1916","only","-","Oct","1",["1","0","0",null],"0","-"],["1917","only","-","Apr","28",["23","0","0",null],"60","S"],["1917","only","-","Sep","17",["1","0","0",null],"0","-"],["1918","only","-","Apr","Mon>=15",["2","0","0","s"],"60","S"],["1918","only","-","Sep","Mon>=15",["2","0","0","s"],"0","-"],["1919","only","-","Mar","1",["23","0","0",null],"60","S"],["1919","only","-","Oct","5",["3","0","0",null],"0","-"],["1920","only","-","Feb","14",["23","0","0",null],"60","S"],["1920","only","-","Oct","24",["2","0","0",null],"0","-"],["1921","only","-","Mar","14",["23","0","0",null],"60","S"],["1921","only","-","Oct","26",["2","0","0",null],"0","-"],["1922","only","-","Mar","25",["23","0","0",null],"60","S"],["1922","only","-","Oct","Sun>=2",["1","0","0",null],"0","-"],["1923","only","-","Apr","21",["23","0","0",null],"60","S"],["1923","only","-","Oct","Sun>=2",["2","0","0",null],"0","-"],["1924","only","-","Mar","29",["23","0","0",null],"60","S"],["1924","1928","-","Oct","Sun>=2",["1","0","0",null],"0","-"],["1925","only","-","Apr","5",["23","0","0",null],"60","S"],["1926","only","-","Apr","17",["23","0","0",null],"60","S"],["1927","only","-","Apr","9",["23","0","0",null],"60","S"],["1928","only","-","Apr","14",["23","0","0",null],"60","S"],["1929","only","-","Apr","20",["23","0","0",null],"60","S"]],"Malta":[["1973","only","-","Mar","31",["0","0","0","s"],"60","S"],["1973","only","-","Sep","29",["0","0","0","s"],"0","-"],["1974","only","-","Apr","21",["0","0","0","s"],"60","S"],["1974","only","-","Sep","16",["0","0","0","s"],"0","-"],["1975","1979","-","Apr","Sun>=15",["2","0","0",null],"60","S"],["1975","1980","-","Sep","Sun>=15",["2","0","0",null],"0","-"],["1980","only","-","Mar","31",["2","0","0",null],"60","S"]],"Neth":[["1916","only","-","May","1",["0","0","0",null],"60","NST",""],["1916","only","-","Oct","1",["0","0","0",null],"0","AMT",""],["1917","only","-","Apr","16",["2","0","0","s"],"60","NST"],["1917","only","-","Sep","17",["2","0","0","s"],"0","AMT"],["1918","1921","-","Apr","Mon>=1",["2","0","0","s"],"60","NST"],["1918","1921","-","Sep","lastMon",["2","0","0","s"],"0","AMT"],["1922","only","-","Mar","lastSun",["2","0","0","s"],"60","NST"],["1922","1936","-","Oct","Sun>=2",["2","0","0","s"],"0","AMT"],["1923","only","-","Jun","Fri>=1",["2","0","0","s"],"60","NST"],["1924","only","-","Mar","lastSun",["2","0","0","s"],"60","NST"],["1925","only","-","Jun","Fri>=1",["2","0","0","s"],"60","NST"],["1926","1931","-","May","15",["2","0","0","s"],"60","NST"],["1932","only","-","May","22",["2","0","0","s"],"60","NST"],["1933","1936","-","May","15",["2","0","0","s"],"60","NST"],["1937","only","-","May","22",["2","0","0","s"],"60","NST"],["1937","only","-","Jul","1",["0","0","0",null],"60","S"],["1937","1939","-","Oct","Sun>=2",["2","0","0","s"],"0","-"],["1938","1939","-","May","15",["2","0","0","s"],"60","S"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"]],"Norway":[["1916","only","-","May","22",["1","0","0",null],"60","S"],["1916","only","-","Sep","30",["0","0","0",null],"0","-"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Oct","1",["2","0","0","s"],"0","-"],["1959","1964","-","Mar","Sun>=15",["2","0","0","s"],"60","S"],["1959","1965","-","Sep","Sun>=15",["2","0","0","s"],"0","-"],["1965","only","-","Apr","25",["2","0","0","s"],"60","S"]],"Poland":[["1918","1919","-","Sep","16",["2","0","0","s"],"0","-"],["1919","only","-","Apr","15",["2","0","0","s"],"60","S"],["1944","only","-","Apr","3",["2","0","0","s"],"60","S"],["1944","only","-","Oct","4",["2","0","0",null],"0","-"],["1945","only","-","Apr","29",["0","0","0",null],"60","S"],["1945","only","-","Nov","1",["0","0","0",null],"0","-"],["1946","only","-","Apr","14",["0","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"],["1947","only","-","May","4",["2","0","0","s"],"60","S"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","10",["2","0","0","s"],"60","S"],["1957","only","-","Jun","2",["1","0","0","s"],"60","S"],["1957","1958","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1958","only","-","Mar","30",["1","0","0","s"],"60","S"],["1959","only","-","May","31",["1","0","0","s"],"60","S"],["1959","1961","-","Oct","Sun>=1",["1","0","0","s"],"0","-"],["1960","only","-","Apr","3",["1","0","0","s"],"60","S"],["1961","1964","-","May","lastSun",["1","0","0","s"],"60","S"],["1962","1964","-","Sep","lastSun",["1","0","0","s"],"0","-"]],"Port":[["1916","only","-","Jun","17",["23","0","0",null],"60","S"],["1916","only","-","Nov","1",["1","0","0",null],"0","-"],["1917","only","-","Feb","28",["23","0","0","s"],"60","S"],["1917","1921","-","Oct","14",["23","0","0","s"],"0","-"],["1918","only","-","Mar","1",["23","0","0","s"],"60","S"],["1919","only","-","Feb","28",["23","0","0","s"],"60","S"],["1920","only","-","Feb","29",["23","0","0","s"],"60","S"],["1921","only","-","Feb","28",["23","0","0","s"],"60","S"],["1924","only","-","Apr","16",["23","0","0","s"],"60","S"],["1924","only","-","Oct","14",["23","0","0","s"],"0","-"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1926","1929","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1931","only","-","Apr","18",["23","0","0","s"],"60","S"],["1931","1932","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1932","only","-","Apr","2",["23","0","0","s"],"60","S"],["1934","only","-","Apr","7",["23","0","0","s"],"60","S"],["1934","1938","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1935","only","-","Mar","30",["23","0","0","s"],"60","S"],["1936","only","-","Apr","18",["23","0","0","s"],"60","S"],["1937","only","-","Apr","3",["23","0","0","s"],"60","S"],["1938","only","-","Mar","26",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","24",["23","0","0","s"],"60","S"],["1940","1941","-","Oct","5",["23","0","0","s"],"0","-"],["1941","only","-","Apr","5",["23","0","0","s"],"60","S"],["1942","1945","-","Mar","Sat>=8",["23","0","0","s"],"60","S"],["1942","only","-","Apr","25",["22","0","0","s"],"120","M",""],["1942","only","-","Aug","15",["22","0","0","s"],"60","S"],["1942","1945","-","Oct","Sat>=24",["23","0","0","s"],"0","-"],["1943","only","-","Apr","17",["22","0","0","s"],"120","M"],["1943","1945","-","Aug","Sat>=25",["22","0","0","s"],"60","S"],["1944","1945","-","Apr","Sat>=21",["22","0","0","s"],"120","M"],["1946","only","-","Apr","Sat>=1",["23","0","0","s"],"60","S"],["1946","only","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1947","1949","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1951","1965","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1951","1965","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1977","only","-","Mar","27",["0","0","0","s"],"60","S"],["1977","only","-","Sep","25",["0","0","0","s"],"0","-"],["1978","1979","-","Apr","Sun>=1",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1979","1982","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1980","only","-","Mar","lastSun",["0","0","0","s"],"60","S"],["1981","1982","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1983","only","-","Mar","lastSun",["2","0","0","s"],"60","S"]],"Romania":[["1932","only","-","May","21",["0","0","0","s"],"60","S"],["1932","1939","-","Oct","Sun>=1",["0","0","0","s"],"0","-"],["1933","1939","-","Apr","Sun>=2",["0","0","0","s"],"60","S"],["1979","only","-","May","27",["0","0","0",null],"60","S"],["1979","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1980","only","-","Apr","5",["23","0","0",null],"60","S"],["1980","only","-","Sep","lastSun",["1","0","0",null],"0","-"],["1991","1993","-","Mar","lastSun",["0","0","0","s"],"60","S"],["1991","1993","-","Sep","lastSun",["0","0","0","s"],"0","-"]],"Spain":[["1917","only","-","May","5",["23","0","0","s"],"60","S"],["1917","1919","-","Oct","6",["23","0","0","s"],"0","-"],["1918","only","-","Apr","15",["23","0","0","s"],"60","S"],["1919","only","-","Apr","5",["23","0","0","s"],"60","S"],["1924","only","-","Apr","16",["23","0","0","s"],"60","S"],["1924","only","-","Oct","4",["23","0","0","s"],"0","-"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1926","1929","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1937","only","-","May","22",["23","0","0","s"],"60","S"],["1937","1939","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1938","only","-","Mar","22",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1940","only","-","Mar","16",["23","0","0","s"],"60","S"],["1942","only","-","May","2",["22","0","0","s"],"120","M",""],["1942","only","-","Sep","1",["22","0","0","s"],"60","S"],["1943","1946","-","Apr","Sat>=13",["22","0","0","s"],"120","M"],["1943","only","-","Oct","3",["22","0","0","s"],"60","S"],["1944","only","-","Oct","10",["22","0","0","s"],"60","S"],["1945","only","-","Sep","30",["1","0","0",null],"60","S"],["1946","only","-","Sep","30",["0","0","0",null],"0","-"],["1949","only","-","Apr","30",["23","0","0",null],"60","S"],["1949","only","-","Sep","30",["1","0","0",null],"0","-"],["1974","1975","-","Apr","Sat>=13",["23","0","0",null],"60","S"],["1974","1975","-","Oct","Sun>=1",["1","0","0",null],"0","-"],["1976","only","-","Mar","27",["23","0","0",null],"60","S"],["1976","1977","-","Sep","lastSun",["1","0","0",null],"0","-"],["1977","1978","-","Apr","2",["23","0","0",null],"60","S"],["1978","only","-","Oct","1",["1","0","0",null],"0","-"]],"SpainAfrica":[["1967","only","-","Jun","3",["12","0","0",null],"60","S"],["1967","only","-","Oct","1",["0","0","0",null],"0","-"],["1974","only","-","Jun","24",["0","0","0",null],"60","S"],["1974","only","-","Sep","1",["0","0","0",null],"0","-"],["1976","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Aug","1",["0","0","0",null],"0","-"],["1977","only","-","Sep","28",["0","0","0",null],"0","-"],["1978","only","-","Jun","1",["0","0","0",null],"60","S"],["1978","only","-","Aug","4",["0","0","0",null],"0","-"]],"Swiss":[["1941","1942","-","May","Mon>=1",["1","0","0",null],"60","S"],["1941","1942","-","Oct","Mon>=1",["2","0","0",null],"0","-"]],"Turkey":[["1916","only","-","May","1",["0","0","0",null],"60","S"],["1916","only","-","Oct","1",["0","0","0",null],"0","-"],["1920","only","-","Mar","28",["0","0","0",null],"60","S"],["1920","only","-","Oct","25",["0","0","0",null],"0","-"],["1921","only","-","Apr","3",["0","0","0",null],"60","S"],["1921","only","-","Oct","3",["0","0","0",null],"0","-"],["1922","only","-","Mar","26",["0","0","0",null],"60","S"],["1922","only","-","Oct","8",["0","0","0",null],"0","-"],["1924","only","-","May","13",["0","0","0",null],"60","S"],["1924","1925","-","Oct","1",["0","0","0",null],"0","-"],["1925","only","-","May","1",["0","0","0",null],"60","S"],["1940","only","-","Jun","30",["0","0","0",null],"60","S"],["1940","only","-","Oct","5",["0","0","0",null],"0","-"],["1940","only","-","Dec","1",["0","0","0",null],"60","S"],["1941","only","-","Sep","21",["0","0","0",null],"0","-"],["1942","only","-","Apr","1",["0","0","0",null],"60","S"],["1942","only","-","Nov","1",["0","0","0",null],"0","-"],["1945","only","-","Apr","2",["0","0","0",null],"60","S"],["1945","only","-","Oct","8",["0","0","0",null],"0","-"],["1946","only","-","Jun","1",["0","0","0",null],"60","S"],["1946","only","-","Oct","1",["0","0","0",null],"0","-"],["1947","1948","-","Apr","Sun>=16",["0","0","0",null],"60","S"],["1947","1950","-","Oct","Sun>=2",["0","0","0",null],"0","-"],["1949","only","-","Apr","10",["0","0","0",null],"60","S"],["1950","only","-","Apr","19",["0","0","0",null],"60","S"],["1951","only","-","Apr","22",["0","0","0",null],"60","S"],["1951","only","-","Oct","8",["0","0","0",null],"0","-"],["1962","only","-","Jul","15",["0","0","0",null],"60","S"],["1962","only","-","Oct","8",["0","0","0",null],"0","-"],["1964","only","-","May","15",["0","0","0",null],"60","S"],["1964","only","-","Oct","1",["0","0","0",null],"0","-"],["1970","1972","-","May","Sun>=2",["0","0","0",null],"60","S"],["1970","1972","-","Oct","Sun>=2",["0","0","0",null],"0","-"],["1973","only","-","Jun","3",["1","0","0",null],"60","S"],["1973","only","-","Nov","4",["3","0","0",null],"0","-"],["1974","only","-","Mar","31",["2","0","0",null],"60","S"],["1974","only","-","Nov","3",["5","0","0",null],"0","-"],["1975","only","-","Mar","30",["0","0","0",null],"60","S"],["1975","1976","-","Oct","lastSun",["0","0","0",null],"0","-"],["1976","only","-","Jun","1",["0","0","0",null],"60","S"],["1977","1978","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Oct","16",["0","0","0",null],"0","-"],["1979","1980","-","Apr","Sun>=1",["3","0","0",null],"60","S"],["1979","1982","-","Oct","Mon>=11",["0","0","0",null],"0","-"],["1981","1982","-","Mar","lastSun",["3","0","0",null],"60","S"],["1983","only","-","Jul","31",["0","0","0",null],"60","S"],["1983","only","-","Oct","2",["0","0","0",null],"0","-"],["1985","only","-","Apr","20",["0","0","0",null],"60","S"],["1985","only","-","Sep","28",["0","0","0",null],"0","-"],["1986","1990","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1986","1990","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1991","2006","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1991","1995","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1996","2006","-","Oct","lastSun",["1","0","0","s"],"0","-"]],"US":[["1918","1919","-","Mar","lastSun",["2","0","0",null],"60","D"],["1918","1919","-","Oct","lastSun",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1967","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1967","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1974","only","-","Jan","6",["2","0","0",null],"60","D"],["1975","only","-","Feb","23",["2","0","0",null],"60","D"],["1976","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"NYC":[["1920","only","-","Mar","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1921","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Chicago":[["1920","only","-","Jun","13",["2","0","0",null],"60","D"],["1920","1921","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","only","-","Mar","lastSun",["2","0","0",null],"60","D"],["1922","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1922","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Denver":[["1920","1921","-","Mar","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","only","-","May","22",["2","0","0",null],"0","S"],["1965","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1965","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"CA":[["1948","only","-","Mar","14",["2","0","0",null],"60","D"],["1949","only","-","Jan","1",["2","0","0",null],"0","S"],["1950","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1950","1961","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Indianapolis":[["1941","only","-","Jun","22",["2","0","0",null],"60","D"],["1941","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","1954","-","Apr","lastSun",["2","0","0",null],"60","D"]],"Marengo":[["1951","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1954","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1954","1960","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Vincennes":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1953","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1953","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","only","-","May","1",["0","0","0",null],"60","D"],["1956","1963","-","Apr","lastSun",["2","0","0",null],"60","D"],["1960","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1961","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1963","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Perry":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1953","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1953","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","only","-","May","1",["0","0","0",null],"60","D"],["1956","1963","-","Apr","lastSun",["2","0","0",null],"60","D"],["1960","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1961","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1963","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Pike":[["1955","only","-","May","1",["0","0","0",null],"60","D"],["1955","1960","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1964","-","Apr","lastSun",["2","0","0",null],"60","D"],["1961","1964","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Starke":[["1947","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1956","-","Oct","lastSun",["2","0","0",null],"0","S"],["1957","1958","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","1961","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Pulaski":[["1946","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1956","-","Oct","lastSun",["2","0","0",null],"0","S"],["1957","1960","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Louisville":[["1921","only","-","May","1",["2","0","0",null],"60","D"],["1921","only","-","Sep","1",["2","0","0",null],"0","S"],["1941","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1941","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Jun","2",["2","0","0",null],"0","S"],["1950","1955","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1960","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Detroit":[["1948","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1948","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1967","only","-","Jun","14",["2","0","0",null],"60","D"],["1967","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Menominee":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1966","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1966","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Canada":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1974","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1974","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"StJohns":[["1917","only","-","Apr","8",["2","0","0",null],"60","D"],["1917","only","-","Sep","17",["2","0","0",null],"0","S"],["1919","only","-","May","5",["23","0","0",null],"60","D"],["1919","only","-","Aug","12",["23","0","0",null],"0","S"],["1920","1935","-","May","Sun>=1",["23","0","0",null],"60","D"],["1920","1935","-","Oct","lastSun",["23","0","0",null],"0","S"],["1936","1941","-","May","Mon>=9",["0","0","0",null],"60","D"],["1936","1941","-","Oct","Mon>=2",["0","0","0",null],"0","S"],["1946","1950","-","May","Sun>=8",["2","0","0",null],"60","D"],["1946","1950","-","Oct","Sun>=2",["2","0","0",null],"0","S"],["1951","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1960","1986","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","only","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["1987","2006","-","Oct","lastSun",["0","1","0",null],"0","S"],["1988","only","-","Apr","Sun>=1",["0","1","0",null],"120","DD"],["1989","2006","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["2007","2011","-","Mar","Sun>=8",["0","1","0",null],"60","D"],["2007","2010","-","Nov","Sun>=1",["0","1","0",null],"0","S"]],"Halifax":[["1916","only","-","Apr","1",["0","0","0",null],"60","D"],["1916","only","-","Oct","1",["0","0","0",null],"0","S"],["1920","only","-","May","9",["0","0","0",null],"60","D"],["1920","only","-","Aug","29",["0","0","0",null],"0","S"],["1921","only","-","May","6",["0","0","0",null],"60","D"],["1921","1922","-","Sep","5",["0","0","0",null],"0","S"],["1922","only","-","Apr","30",["0","0","0",null],"60","D"],["1923","1925","-","May","Sun>=1",["0","0","0",null],"60","D"],["1923","only","-","Sep","4",["0","0","0",null],"0","S"],["1924","only","-","Sep","15",["0","0","0",null],"0","S"],["1925","only","-","Sep","28",["0","0","0",null],"0","S"],["1926","only","-","May","16",["0","0","0",null],"60","D"],["1926","only","-","Sep","13",["0","0","0",null],"0","S"],["1927","only","-","May","1",["0","0","0",null],"60","D"],["1927","only","-","Sep","26",["0","0","0",null],"0","S"],["1928","1931","-","May","Sun>=8",["0","0","0",null],"60","D"],["1928","only","-","Sep","9",["0","0","0",null],"0","S"],["1929","only","-","Sep","3",["0","0","0",null],"0","S"],["1930","only","-","Sep","15",["0","0","0",null],"0","S"],["1931","1932","-","Sep","Mon>=24",["0","0","0",null],"0","S"],["1932","only","-","May","1",["0","0","0",null],"60","D"],["1933","only","-","Apr","30",["0","0","0",null],"60","D"],["1933","only","-","Oct","2",["0","0","0",null],"0","S"],["1934","only","-","May","20",["0","0","0",null],"60","D"],["1934","only","-","Sep","16",["0","0","0",null],"0","S"],["1935","only","-","Jun","2",["0","0","0",null],"60","D"],["1935","only","-","Sep","30",["0","0","0",null],"0","S"],["1936","only","-","Jun","1",["0","0","0",null],"60","D"],["1936","only","-","Sep","14",["0","0","0",null],"0","S"],["1937","1938","-","May","Sun>=1",["0","0","0",null],"60","D"],["1937","1941","-","Sep","Mon>=24",["0","0","0",null],"0","S"],["1939","only","-","May","28",["0","0","0",null],"60","D"],["1940","1941","-","May","Sun>=1",["0","0","0",null],"60","D"],["1946","1949","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1949","-","Sep","lastSun",["2","0","0",null],"0","S"],["1951","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1959","-","Apr","lastSun",["2","0","0",null],"60","D"],["1956","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1962","1973","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Moncton":[["1933","1935","-","Jun","Sun>=8",["1","0","0",null],"60","D"],["1933","1935","-","Sep","Sun>=8",["1","0","0",null],"0","S"],["1936","1938","-","Jun","Sun>=1",["1","0","0",null],"60","D"],["1936","1938","-","Sep","Sun>=1",["1","0","0",null],"0","S"],["1939","only","-","May","27",["1","0","0",null],"60","D"],["1939","1941","-","Sep","Sat>=21",["1","0","0",null],"0","S"],["1940","only","-","May","19",["1","0","0",null],"60","D"],["1941","only","-","May","4",["1","0","0",null],"60","D"],["1946","1972","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1956","-","Sep","lastSun",["2","0","0",null],"0","S"],["1957","1972","-","Oct","lastSun",["2","0","0",null],"0","S"],["1993","2006","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["1993","2006","-","Oct","lastSun",["0","1","0",null],"0","S"]],"Mont":[["1917","only","-","Mar","25",["2","0","0",null],"60","D"],["1917","only","-","Apr","24",["0","0","0",null],"0","S"],["1919","only","-","Mar","31",["2","30","0",null],"60","D"],["1919","only","-","Oct","25",["2","30","0",null],"0","S"],["1920","only","-","May","2",["2","30","0",null],"60","D"],["1920","1922","-","Oct","Sun>=1",["2","30","0",null],"0","S"],["1921","only","-","May","1",["2","0","0",null],"60","D"],["1922","only","-","Apr","30",["2","0","0",null],"60","D"],["1924","only","-","May","17",["2","0","0",null],"60","D"],["1924","1926","-","Sep","lastSun",["2","30","0",null],"0","S"],["1925","1926","-","May","Sun>=1",["2","0","0",null],"60","D"],["1927","1937","-","Apr","lastSat",["24","0","0",null],"60","D"],["1927","1937","-","Sep","lastSat",["24","0","0",null],"0","S"],["1938","1940","-","Apr","lastSun",["0","0","0",null],"60","D"],["1938","1939","-","Sep","lastSun",["0","0","0",null],"0","S"],["1946","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1945","1948","-","Sep","lastSun",["2","0","0",null],"0","S"],["1949","1950","-","Oct","lastSun",["2","0","0",null],"0","S"],["1951","1956","-","Sep","lastSun",["2","0","0",null],"0","S"],["1957","1973","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Toronto":[["1919","only","-","Mar","30",["23","30","0",null],"60","D"],["1919","only","-","Oct","26",["0","0","0",null],"0","S"],["1920","only","-","May","2",["2","0","0",null],"60","D"],["1920","only","-","Sep","26",["0","0","0",null],"0","S"],["1921","only","-","May","15",["2","0","0",null],"60","D"],["1921","only","-","Sep","15",["2","0","0",null],"0","S"],["1922","1923","-","May","Sun>=8",["2","0","0",null],"60","D"],["1922","1926","-","Sep","Sun>=15",["2","0","0",null],"0","S"],["1924","1927","-","May","Sun>=1",["2","0","0",null],"60","D"],["1927","1932","-","Sep","lastSun",["2","0","0",null],"0","S"],["1928","1931","-","Apr","lastSun",["2","0","0",null],"60","D"],["1932","only","-","May","1",["2","0","0",null],"60","D"],["1933","1940","-","Apr","lastSun",["2","0","0",null],"60","D"],["1933","only","-","Oct","1",["2","0","0",null],"0","S"],["1934","1939","-","Sep","lastSun",["2","0","0",null],"0","S"],["1945","1946","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1949","-","Apr","lastSun",["0","0","0",null],"60","D"],["1947","1948","-","Sep","lastSun",["0","0","0",null],"0","S"],["1949","only","-","Nov","lastSun",["0","0","0",null],"0","S"],["1950","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1950","only","-","Nov","lastSun",["2","0","0",null],"0","S"],["1951","1956","-","Sep","lastSun",["2","0","0",null],"0","S"],["1957","1973","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Winn":[["1916","only","-","Apr","23",["0","0","0",null],"60","D"],["1916","only","-","Sep","17",["0","0","0",null],"0","S"],["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1937","only","-","May","16",["2","0","0",null],"60","D"],["1937","only","-","Sep","26",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","May","12",["2","0","0",null],"60","D"],["1946","only","-","Oct","13",["2","0","0",null],"0","S"],["1947","1949","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1949","-","Sep","lastSun",["2","0","0",null],"0","S"],["1950","only","-","May","1",["2","0","0",null],"60","D"],["1950","only","-","Sep","30",["2","0","0",null],"0","S"],["1951","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1958","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1960","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1963","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1963","only","-","Sep","22",["2","0","0",null],"0","S"],["1966","1986","-","Apr","lastSun",["2","0","0","s"],"60","D"],["1966","2005","-","Oct","lastSun",["2","0","0","s"],"0","S"],["1987","2005","-","Apr","Sun>=1",["2","0","0","s"],"60","D"]],"Regina":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1930","1934","-","May","Sun>=1",["0","0","0",null],"60","D"],["1930","1934","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["1937","1941","-","Apr","Sun>=8",["0","0","0",null],"60","D"],["1937","only","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1938","only","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["1939","1941","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Apr","Sun>=8",["2","0","0",null],"60","D"],["1946","only","-","Oct","Sun>=8",["2","0","0",null],"0","S"],["1947","1957","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1957","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Swift":[["1957","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1957","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1959","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1960","1961","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Edm":[["1918","1919","-","Apr","Sun>=8",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1919","only","-","May","27",["2","0","0",null],"0","S"],["1920","1923","-","Apr","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","1923","-","Sep","lastSun",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1947","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1967","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1967","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1969","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1969","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1972","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1972","2006","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Vanc":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1946","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Oct","13",["2","0","0",null],"0","S"],["1947","1961","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","2006","-","Oct","lastSun",["2","0","0",null],"0","S"]],"NT_YK":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1919","only","-","May","25",["2","0","0",null],"60","D"],["1919","only","-","Nov","1",["0","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1965","only","-","Apr","lastSun",["0","0","0",null],"120","DD"],["1965","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1980","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1980","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"]],"Mexico":[["1939","only","-","Feb","5",["0","0","0",null],"60","D"],["1939","only","-","Jun","25",["0","0","0",null],"0","S"],["1940","only","-","Dec","9",["0","0","0",null],"60","D"],["1941","only","-","Apr","1",["0","0","0",null],"0","S"],["1943","only","-","Dec","16",["0","0","0",null],"60","W",""],["1944","only","-","May","1",["0","0","0",null],"0","S"],["1950","only","-","Feb","12",["0","0","0",null],"60","D"],["1950","only","-","Jul","30",["0","0","0",null],"0","S"],["1996","2000","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1996","2000","-","Oct","lastSun",["2","0","0",null],"0","S"],["2001","only","-","May","Sun>=1",["2","0","0",null],"60","D"],["2001","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["2002","max","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2002","max","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Bahamas":[["1964","1975","-","Oct","lastSun",["2","0","0",null],"0","S"],["1964","1975","-","Apr","lastSun",["2","0","0",null],"60","D"]],"Barb":[["1977","only","-","Jun","12",["2","0","0",null],"60","D"],["1977","1978","-","Oct","Sun>=1",["2","0","0",null],"0","S"],["1978","1980","-","Apr","Sun>=15",["2","0","0",null],"60","D"],["1979","only","-","Sep","30",["2","0","0",null],"0","S"],["1980","only","-","Sep","25",["2","0","0",null],"0","S"]],"Belize":[["1918","1942","-","Oct","Sun>=2",["0","0","0",null],"30","HD"],["1919","1943","-","Feb","Sun>=9",["0","0","0",null],"0","S"],["1973","only","-","Dec","5",["0","0","0",null],"60","D"],["1974","only","-","Feb","9",["0","0","0",null],"0","S"],["1982","only","-","Dec","18",["0","0","0",null],"60","D"],["1983","only","-","Feb","12",["0","0","0",null],"0","S"]],"CR":[["1979","1980","-","Feb","lastSun",["0","0","0",null],"60","D"],["1979","1980","-","Jun","Sun>=1",["0","0","0",null],"0","S"],["1991","1992","-","Jan","Sat>=15",["0","0","0",null],"60","D"],["1991","only","-","Jul","1",["0","0","0",null],"0","S"],["1992","only","-","Mar","15",["0","0","0",null],"0","S"]],"Cuba":[["1928","only","-","Jun","10",["0","0","0",null],"60","D"],["1928","only","-","Oct","10",["0","0","0",null],"0","S"],["1940","1942","-","Jun","Sun>=1",["0","0","0",null],"60","D"],["1940","1942","-","Sep","Sun>=1",["0","0","0",null],"0","S"],["1945","1946","-","Jun","Sun>=1",["0","0","0",null],"60","D"],["1945","1946","-","Sep","Sun>=1",["0","0","0",null],"0","S"],["1965","only","-","Jun","1",["0","0","0",null],"60","D"],["1965","only","-","Sep","30",["0","0","0",null],"0","S"],["1966","only","-","May","29",["0","0","0",null],"60","D"],["1966","only","-","Oct","2",["0","0","0",null],"0","S"],["1967","only","-","Apr","8",["0","0","0",null],"60","D"],["1967","1968","-","Sep","Sun>=8",["0","0","0",null],"0","S"],["1968","only","-","Apr","14",["0","0","0",null],"60","D"],["1969","1977","-","Apr","lastSun",["0","0","0",null],"60","D"],["1969","1971","-","Oct","lastSun",["0","0","0",null],"0","S"],["1972","1974","-","Oct","8",["0","0","0",null],"0","S"],["1975","1977","-","Oct","lastSun",["0","0","0",null],"0","S"],["1978","only","-","May","7",["0","0","0",null],"60","D"],["1978","1990","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1979","1980","-","Mar","Sun>=15",["0","0","0",null],"60","D"],["1981","1985","-","May","Sun>=5",["0","0","0",null],"60","D"],["1986","1989","-","Mar","Sun>=14",["0","0","0",null],"60","D"],["1990","1997","-","Apr","Sun>=1",["0","0","0",null],"60","D"],["1991","1995","-","Oct","Sun>=8",["0","0","0","s"],"0","S"],["1996","only","-","Oct","6",["0","0","0","s"],"0","S"],["1997","only","-","Oct","12",["0","0","0","s"],"0","S"],["1998","1999","-","Mar","lastSun",["0","0","0","s"],"60","D"],["1998","2003","-","Oct","lastSun",["0","0","0","s"],"0","S"],["2000","2003","-","Apr","Sun>=1",["0","0","0","s"],"60","D"],["2004","only","-","Mar","lastSun",["0","0","0","s"],"60","D"],["2006","2010","-","Oct","lastSun",["0","0","0","s"],"0","S"],["2007","only","-","Mar","Sun>=8",["0","0","0","s"],"60","D"],["2008","only","-","Mar","Sun>=15",["0","0","0","s"],"60","D"],["2009","2010","-","Mar","Sun>=8",["0","0","0","s"],"60","D"],["2011","only","-","Mar","Sun>=15",["0","0","0","s"],"60","D"],["2011","only","-","Nov","13",["0","0","0","s"],"0","S"],["2012","only","-","Apr","1",["0","0","0","s"],"60","D"],["2012","max","-","Nov","Sun>=1",["0","0","0","s"],"0","S"],["2013","max","-","Mar","Sun>=8",["0","0","0","s"],"60","D"]],"DR":[["1966","only","-","Oct","30",["0","0","0",null],"60","D"],["1967","only","-","Feb","28",["0","0","0",null],"0","S"],["1969","1973","-","Oct","lastSun",["0","0","0",null],"30","HD"],["1970","only","-","Feb","21",["0","0","0",null],"0","S"],["1971","only","-","Jan","20",["0","0","0",null],"0","S"],["1972","1974","-","Jan","21",["0","0","0",null],"0","S"]],"Salv":[["1987","1988","-","May","Sun>=1",["0","0","0",null],"60","D"],["1987","1988","-","Sep","lastSun",["0","0","0",null],"0","S"]],"Guat":[["1973","only","-","Nov","25",["0","0","0",null],"60","D"],["1974","only","-","Feb","24",["0","0","0",null],"0","S"],["1983","only","-","May","21",["0","0","0",null],"60","D"],["1983","only","-","Sep","22",["0","0","0",null],"0","S"],["1991","only","-","Mar","23",["0","0","0",null],"60","D"],["1991","only","-","Sep","7",["0","0","0",null],"0","S"],["2006","only","-","Apr","30",["0","0","0",null],"60","D"],["2006","only","-","Oct","1",["0","0","0",null],"0","S"]],"Haiti":[["1983","only","-","May","8",["0","0","0",null],"60","D"],["1984","1987","-","Apr","lastSun",["0","0","0",null],"60","D"],["1983","1987","-","Oct","lastSun",["0","0","0",null],"0","S"],["1988","1997","-","Apr","Sun>=1",["1","0","0","s"],"60","D"],["1988","1997","-","Oct","lastSun",["1","0","0","s"],"0","S"],["2005","2006","-","Apr","Sun>=1",["0","0","0",null],"60","D"],["2005","2006","-","Oct","lastSun",["0","0","0",null],"0","S"],["2012","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2012","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"Hond":[["1987","1988","-","May","Sun>=1",["0","0","0",null],"60","D"],["1987","1988","-","Sep","lastSun",["0","0","0",null],"0","S"],["2006","only","-","May","Sun>=1",["0","0","0",null],"60","D"],["2006","only","-","Aug","Mon>=1",["0","0","0",null],"0","S"]],"Nic":[["1979","1980","-","Mar","Sun>=16",["0","0","0",null],"60","D"],["1979","1980","-","Jun","Mon>=23",["0","0","0",null],"0","S"],["2005","only","-","Apr","10",["0","0","0",null],"60","D"],["2005","only","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["2006","only","-","Apr","30",["2","0","0",null],"60","D"],["2006","only","-","Oct","Sun>=1",["1","0","0",null],"0","S"]],"Arg":[["1930","only","-","Dec","1",["0","0","0",null],"60","S"],["1931","only","-","Apr","1",["0","0","0",null],"0","-"],["1931","only","-","Oct","15",["0","0","0",null],"60","S"],["1932","1940","-","Mar","1",["0","0","0",null],"0","-"],["1932","1939","-","Nov","1",["0","0","0",null],"60","S"],["1940","only","-","Jul","1",["0","0","0",null],"60","S"],["1941","only","-","Jun","15",["0","0","0",null],"0","-"],["1941","only","-","Oct","15",["0","0","0",null],"60","S"],["1943","only","-","Aug","1",["0","0","0",null],"0","-"],["1943","only","-","Oct","15",["0","0","0",null],"60","S"],["1946","only","-","Mar","1",["0","0","0",null],"0","-"],["1946","only","-","Oct","1",["0","0","0",null],"60","S"],["1963","only","-","Oct","1",["0","0","0",null],"0","-"],["1963","only","-","Dec","15",["0","0","0",null],"60","S"],["1964","1966","-","Mar","1",["0","0","0",null],"0","-"],["1964","1966","-","Oct","15",["0","0","0",null],"60","S"],["1967","only","-","Apr","2",["0","0","0",null],"0","-"],["1967","1968","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["1968","1969","-","Apr","Sun>=1",["0","0","0",null],"0","-"],["1974","only","-","Jan","23",["0","0","0",null],"60","S"],["1974","only","-","May","1",["0","0","0",null],"0","-"],["1988","only","-","Dec","1",["0","0","0",null],"60","S"],["1989","1993","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1989","1992","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["1999","only","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["2000","only","-","Mar","3",["0","0","0",null],"0","-"],["2007","only","-","Dec","30",["0","0","0",null],"60","S"],["2008","2009","-","Mar","Sun>=15",["0","0","0",null],"0","-"],["2008","only","-","Oct","Sun>=15",["0","0","0",null],"60","S"]],"SanLuis":[["2008","2009","-","Mar","Sun>=8",["0","0","0",null],"0","-"],["2007","2008","-","Oct","Sun>=8",["0","0","0",null],"60","S"]],"Brazil":[["1931","only","-","Oct","3",["11","0","0",null],"60","S"],["1932","1933","-","Apr","1",["0","0","0",null],"0","-"],["1932","only","-","Oct","3",["0","0","0",null],"60","S"],["1949","1952","-","Dec","1",["0","0","0",null],"60","S"],["1950","only","-","Apr","16",["1","0","0",null],"0","-"],["1951","1952","-","Apr","1",["0","0","0",null],"0","-"],["1953","only","-","Mar","1",["0","0","0",null],"0","-"],["1963","only","-","Dec","9",["0","0","0",null],"60","S"],["1964","only","-","Mar","1",["0","0","0",null],"0","-"],["1965","only","-","Jan","31",["0","0","0",null],"60","S"],["1965","only","-","Mar","31",["0","0","0",null],"0","-"],["1965","only","-","Dec","1",["0","0","0",null],"60","S"],["1966","1968","-","Mar","1",["0","0","0",null],"0","-"],["1966","1967","-","Nov","1",["0","0","0",null],"60","S"],["1985","only","-","Nov","2",["0","0","0",null],"60","S"],["1986","only","-","Mar","15",["0","0","0",null],"0","-"],["1986","only","-","Oct","25",["0","0","0",null],"60","S"],["1987","only","-","Feb","14",["0","0","0",null],"0","-"],["1987","only","-","Oct","25",["0","0","0",null],"60","S"],["1988","only","-","Feb","7",["0","0","0",null],"0","-"],["1988","only","-","Oct","16",["0","0","0",null],"60","S"],["1989","only","-","Jan","29",["0","0","0",null],"0","-"],["1989","only","-","Oct","15",["0","0","0",null],"60","S"],["1990","only","-","Feb","11",["0","0","0",null],"0","-"],["1990","only","-","Oct","21",["0","0","0",null],"60","S"],["1991","only","-","Feb","17",["0","0","0",null],"0","-"],["1991","only","-","Oct","20",["0","0","0",null],"60","S"],["1992","only","-","Feb","9",["0","0","0",null],"0","-"],["1992","only","-","Oct","25",["0","0","0",null],"60","S"],["1993","only","-","Jan","31",["0","0","0",null],"0","-"],["1993","1995","-","Oct","Sun>=11",["0","0","0",null],"60","S"],["1994","1995","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["1996","only","-","Feb","11",["0","0","0",null],"0","-"],["1996","only","-","Oct","6",["0","0","0",null],"60","S"],["1997","only","-","Feb","16",["0","0","0",null],"0","-"],["1997","only","-","Oct","6",["0","0","0",null],"60","S"],["1998","only","-","Mar","1",["0","0","0",null],"0","-"],["1998","only","-","Oct","11",["0","0","0",null],"60","S"],["1999","only","-","Feb","21",["0","0","0",null],"0","-"],["1999","only","-","Oct","3",["0","0","0",null],"60","S"],["2000","only","-","Feb","27",["0","0","0",null],"0","-"],["2000","2001","-","Oct","Sun>=8",["0","0","0",null],"60","S"],["2001","2006","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2002","only","-","Nov","3",["0","0","0",null],"60","S"],["2003","only","-","Oct","19",["0","0","0",null],"60","S"],["2004","only","-","Nov","2",["0","0","0",null],"60","S"],["2005","only","-","Oct","16",["0","0","0",null],"60","S"],["2006","only","-","Nov","5",["0","0","0",null],"60","S"],["2007","only","-","Feb","25",["0","0","0",null],"0","-"],["2007","only","-","Oct","Sun>=8",["0","0","0",null],"60","S"],["2008","max","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["2008","2011","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2012","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2013","2014","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2015","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2016","2022","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2023","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2024","2025","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2026","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2027","2033","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2034","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2035","2036","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2037","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2038","max","-","Feb","Sun>=15",["0","0","0",null],"0","-"]],"Chile":[["1927","1932","-","Sep","1",["0","0","0",null],"60","S"],["1928","1932","-","Apr","1",["0","0","0",null],"0","-"],["1942","only","-","Jun","1",["4","0","0","u"],"0","-"],["1942","only","-","Aug","1",["5","0","0","u"],"60","S"],["1946","only","-","Jul","15",["4","0","0","u"],"60","S"],["1946","only","-","Sep","1",["3","0","0","u"],"0","-"],["1947","only","-","Apr","1",["4","0","0","u"],"0","-"],["1968","only","-","Nov","3",["4","0","0","u"],"60","S"],["1969","only","-","Mar","30",["3","0","0","u"],"0","-"],["1969","only","-","Nov","23",["4","0","0","u"],"60","S"],["1970","only","-","Mar","29",["3","0","0","u"],"0","-"],["1971","only","-","Mar","14",["3","0","0","u"],"0","-"],["1970","1972","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1972","1986","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1973","only","-","Sep","30",["4","0","0","u"],"60","S"],["1974","1987","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1987","only","-","Apr","12",["3","0","0","u"],"0","-"],["1988","1989","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1988","only","-","Oct","Sun>=1",["4","0","0","u"],"60","S"],["1989","only","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1990","only","-","Mar","18",["3","0","0","u"],"0","-"],["1990","only","-","Sep","16",["4","0","0","u"],"60","S"],["1991","1996","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1991","1997","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1997","only","-","Mar","30",["3","0","0","u"],"0","-"],["1998","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1998","only","-","Sep","27",["4","0","0","u"],"60","S"],["1999","only","-","Apr","4",["3","0","0","u"],"0","-"],["1999","2010","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["2000","2007","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2008","only","-","Mar","30",["3","0","0","u"],"0","-"],["2009","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2010","only","-","Apr","Sun>=1",["3","0","0","u"],"0","-"],["2011","only","-","May","Sun>=2",["3","0","0","u"],"0","-"],["2011","only","-","Aug","Sun>=16",["4","0","0","u"],"60","S"],["2012","max","-","Apr","Sun>=23",["3","0","0","u"],"0","-"],["2012","max","-","Sep","Sun>=2",["4","0","0","u"],"60","S"]],"CO":[["1992","only","-","May","3",["0","0","0",null],"60","S"],["1993","only","-","Apr","4",["0","0","0",null],"0","-"]],"Falk":[["1937","1938","-","Sep","lastSun",["0","0","0",null],"60","S"],["1938","1942","-","Mar","Sun>=19",["0","0","0",null],"0","-"],["1939","only","-","Oct","1",["0","0","0",null],"60","S"],["1940","1942","-","Sep","lastSun",["0","0","0",null],"60","S"],["1943","only","-","Jan","1",["0","0","0",null],"0","-"],["1983","only","-","Sep","lastSun",["0","0","0",null],"60","S"],["1984","1985","-","Apr","lastSun",["0","0","0",null],"0","-"],["1984","only","-","Sep","16",["0","0","0",null],"60","S"],["1985","2000","-","Sep","Sun>=9",["0","0","0",null],"60","S"],["1986","2000","-","Apr","Sun>=16",["0","0","0",null],"0","-"],["2001","2010","-","Apr","Sun>=15",["2","0","0",null],"0","-"],["2001","2010","-","Sep","Sun>=1",["2","0","0",null],"60","S"]],"Para":[["1975","1988","-","Oct","1",["0","0","0",null],"60","S"],["1975","1978","-","Mar","1",["0","0","0",null],"0","-"],["1979","1991","-","Apr","1",["0","0","0",null],"0","-"],["1989","only","-","Oct","22",["0","0","0",null],"60","S"],["1990","only","-","Oct","1",["0","0","0",null],"60","S"],["1991","only","-","Oct","6",["0","0","0",null],"60","S"],["1992","only","-","Mar","1",["0","0","0",null],"0","-"],["1992","only","-","Oct","5",["0","0","0",null],"60","S"],["1993","only","-","Mar","31",["0","0","0",null],"0","-"],["1993","1995","-","Oct","1",["0","0","0",null],"60","S"],["1994","1995","-","Feb","lastSun",["0","0","0",null],"0","-"],["1996","only","-","Mar","1",["0","0","0",null],"0","-"],["1996","2001","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["1997","only","-","Feb","lastSun",["0","0","0",null],"0","-"],["1998","2001","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["2002","2004","-","Apr","Sun>=1",["0","0","0",null],"0","-"],["2002","2003","-","Sep","Sun>=1",["0","0","0",null],"60","S"],["2004","2009","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["2005","2009","-","Mar","Sun>=8",["0","0","0",null],"0","-"],["2010","max","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["2010","2012","-","Apr","Sun>=8",["0","0","0",null],"0","-"],["2013","max","-","Mar","Sun>=22",["0","0","0",null],"0","-"]],"Peru":[["1938","only","-","Jan","1",["0","0","0",null],"60","S"],["1938","only","-","Apr","1",["0","0","0",null],"0","-"],["1938","1939","-","Sep","lastSun",["0","0","0",null],"60","S"],["1939","1940","-","Mar","Sun>=24",["0","0","0",null],"0","-"],["1986","1987","-","Jan","1",["0","0","0",null],"60","S"],["1986","1987","-","Apr","1",["0","0","0",null],"0","-"],["1990","only","-","Jan","1",["0","0","0",null],"60","S"],["1990","only","-","Apr","1",["0","0","0",null],"0","-"],["1994","only","-","Jan","1",["0","0","0",null],"60","S"],["1994","only","-","Apr","1",["0","0","0",null],"0","-"]],"Uruguay":[["1923","only","-","Oct","2",["0","0","0",null],"30","HS"],["1924","1926","-","Apr","1",["0","0","0",null],"0","-"],["1924","1925","-","Oct","1",["0","0","0",null],"30","HS"],["1933","1935","-","Oct","lastSun",["0","0","0",null],"30","HS"],["1934","1936","-","Mar","Sat>=25",["23","30","0","s"],"0","-"],["1936","only","-","Nov","1",["0","0","0",null],"30","HS"],["1937","1941","-","Mar","lastSun",["0","0","0",null],"0","-"],["1937","1940","-","Oct","lastSun",["0","0","0",null],"30","HS"],["1941","only","-","Aug","1",["0","0","0",null],"30","HS"],["1942","only","-","Jan","1",["0","0","0",null],"0","-"],["1942","only","-","Dec","14",["0","0","0",null],"60","S"],["1943","only","-","Mar","14",["0","0","0",null],"0","-"],["1959","only","-","May","24",["0","0","0",null],"60","S"],["1959","only","-","Nov","15",["0","0","0",null],"0","-"],["1960","only","-","Jan","17",["0","0","0",null],"60","S"],["1960","only","-","Mar","6",["0","0","0",null],"0","-"],["1965","1967","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1965","only","-","Sep","26",["0","0","0",null],"0","-"],["1966","1967","-","Oct","31",["0","0","0",null],"0","-"],["1968","1970","-","May","27",["0","0","0",null],"30","HS"],["1968","1970","-","Dec","2",["0","0","0",null],"0","-"],["1972","only","-","Apr","24",["0","0","0",null],"60","S"],["1972","only","-","Aug","15",["0","0","0",null],"0","-"],["1974","only","-","Mar","10",["0","0","0",null],"30","HS"],["1974","only","-","Dec","22",["0","0","0",null],"60","S"],["1976","only","-","Oct","1",["0","0","0",null],"0","-"],["1977","only","-","Dec","4",["0","0","0",null],"60","S"],["1978","only","-","Apr","1",["0","0","0",null],"0","-"],["1979","only","-","Oct","1",["0","0","0",null],"60","S"],["1980","only","-","May","1",["0","0","0",null],"0","-"],["1987","only","-","Dec","14",["0","0","0",null],"60","S"],["1988","only","-","Mar","14",["0","0","0",null],"0","-"],["1988","only","-","Dec","11",["0","0","0",null],"60","S"],["1989","only","-","Mar","12",["0","0","0",null],"0","-"],["1989","only","-","Oct","29",["0","0","0",null],"60","S"],["1990","1992","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1990","1991","-","Oct","Sun>=21",["0","0","0",null],"60","S"],["1992","only","-","Oct","18",["0","0","0",null],"60","S"],["1993","only","-","Feb","28",["0","0","0",null],"0","-"],["2004","only","-","Sep","19",["0","0","0",null],"60","S"],["2005","only","-","Mar","27",["2","0","0",null],"0","-"],["2005","only","-","Oct","9",["2","0","0",null],"60","S"],["2006","only","-","Mar","12",["2","0","0",null],"0","-"],["2006","max","-","Oct","Sun>=1",["2","0","0",null],"60","S"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"0","-"]],"SystemV":[["NaN","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["NaN","1973","-","Oct","lastSun",["2","0","0",null],"0","S"],["1974","only","-","Jan","6",["2","0","0",null],"60","D"],["1974","only","-","Nov","lastSun",["2","0","0",null],"0","S"],["1975","only","-","Feb","23",["2","0","0",null],"60","D"],["1975","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1976","max","-","Apr","lastSun",["2","0","0",null],"60","D"],["1976","max","-","Oct","lastSun",["2","0","0",null],"0","S"]]}}

},{}],15:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Time zone representation and offset calculation
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var basics = require("./basics");
var TimeStruct = basics.TimeStruct;

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

var strings = require("./strings");

var tzDatabase = require("./tz-database");
var TzDatabase = tzDatabase.TzDatabase;

/**
* The type of time zone
*/
(function (TimeZoneKind) {
    /**
    * Local time offset as determined by JavaScript Date class.
    */
    TimeZoneKind[TimeZoneKind["Local"] = 0] = "Local";

    /**
    * Fixed offset from UTC, without DST.
    */
    TimeZoneKind[TimeZoneKind["Offset"] = 1] = "Offset";

    /**
    * IANA timezone managed through Olsen TZ database. Includes
    * DST if applicable.
    */
    TimeZoneKind[TimeZoneKind["Proper"] = 2] = "Proper";
})(exports.TimeZoneKind || (exports.TimeZoneKind = {}));
var TimeZoneKind = exports.TimeZoneKind;

/**
* Option for TimeZone#normalizeLocal()
*/
(function (NormalizeOption) {
    /**
    * Normalize non-existing times by ADDING the DST offset
    */
    NormalizeOption[NormalizeOption["Up"] = 0] = "Up";

    /**
    * Normalize non-existing times by SUBTRACTING the DST offset
    */
    NormalizeOption[NormalizeOption["Down"] = 1] = "Down";
})(exports.NormalizeOption || (exports.NormalizeOption = {}));
var NormalizeOption = exports.NormalizeOption;

/**
* Time zone. The object is immutable because it is cached:
* requesting a time zone twice yields the very same object.
* Note that we use time zone offsets inverted w.r.t. JavaScript Date.getTimezoneOffset(),
* i.e. offset 90 means +01:30.
*
* Time zones come in three flavors: the local time zone, as calculated by JavaScript Date,
* a fixed offset ("+01:30") without DST, or a IANA timezone ("Europe/Amsterdam") with DST
* applied depending on the time zone rules.
*/
var TimeZone = (function () {
    /**
    * Do not use this constructor, use the static
    * TimeZone.zone() method instead.
    * @param name NORMALIZED name, assumed to be correct
    */
    function TimeZone(name) {
        this._name = name;
        if (name === "localtime") {
            this._kind = 0 /* Local */;
        } else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = 1 /* Offset */;
            this._offset = TimeZone.stringToOffset(name);
        } else {
            this._kind = 2 /* Proper */;
        }
    }
    /**
    * The local time zone for a given date. Note that
    * the time zone varies with the date: amsterdam time for
    * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
    */
    TimeZone.local = function () {
        return TimeZone._findOrCreate("localtime");
    };

    /**
    * The UTC time zone.
    */
    TimeZone.utc = function () {
        return TimeZone._findOrCreate("UTC");
    };

    /**
    * Zone implementations
    */
    TimeZone.zone = function (a) {
        var name = "";
        switch (typeof (a)) {
            case "string":
                 {
                    if (a.trim().length === 0) {
                        return null;
                    } else {
                        name = TimeZone._normalizeString(a);
                    }
                }
                break;
            case "number":
                 {
                    var offset = a;
                    assert(offset > -24 * 60 && offset < 24 * 60, "TimeZone.zone(): offset out of range");
                    name = TimeZone.offsetToString(offset);
                }
                break;

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");
                }
        }
        return TimeZone._findOrCreate(name);
    };

    /**
    * The time zone identifier. Can be an offset "-01:30" or an
    * IANA time zone name "Europe/Amsterdam", or "localtime" for
    * the local time zone.
    */
    TimeZone.prototype.name = function () {
        return this._name;
    };

    /**
    * The kind of time zone (Local/Offset/Proper)
    */
    TimeZone.prototype.kind = function () {
        return this._kind;
    };

    /**
    * Equality operator. Maps zero offsets and different names for UTC onto
    * each other. Other time zones are not mapped onto each other.
    */
    TimeZone.prototype.equals = function (other) {
        if (this.isUtc() && other.isUtc()) {
            return true;
        }
        switch (this._kind) {
            case 0 /* Local */:
                return (other.kind() === 0 /* Local */);
            case 1 /* Offset */:
                return (other.kind() === 1 /* Offset */ && this._offset === other._offset);
            case 2 /* Proper */:
                return (other.kind() === 2 /* Proper */ && this._name === other._name);

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown time zone kind.");
                }
        }
    };

    /**
    * Is this zone equivalent to UTC?
    */
    TimeZone.prototype.isUtc = function () {
        switch (this._kind) {
            case 0 /* Local */:
                return false;
            case 1 /* Offset */:
                return (this._offset === 0);
            case 2 /* Proper */:
                return (TzDatabase.instance().zoneIsUtc(this._name));

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return false;
                }
        }
    };

    /**
    * Does this zone have Daylight Saving Time at all?
    */
    TimeZone.prototype.hasDst = function () {
        switch (this._kind) {
            case 0 /* Local */:
                return false;
            case 1 /* Offset */:
                return false;
            case 2 /* Proper */:
                return (TzDatabase.instance().hasDst(this._name));

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return false;
                }
        }
    };

    /**
    * Calculate timezone offset from a UTC time.
    *
    * @param year Full year
    * @param month Month 1-12 (note this deviates from JavaScript date)
    * @param day Day of month 1-31
    * @param hour Hour 0-23
    * @param minute Minute 0-59
    * @param second Second 0-59
    * @param millisecond Millisecond 0-999
    *
    * @return the offset of this time zone with respect to UTC at the given time, in minutes.
    */
    TimeZone.prototype.offsetForUtc = function (year, month, day, hour, minute, second, millisecond) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
        assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                var date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
                return -1 * date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().totalOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
        }
    };

    /**
    * Calculate timezone offset from a zone-local time (NOT a UTC time).
    * @param year local full year
    * @param month local month 1-12 (note this deviates from JavaScript date)
    * @param day local day of month 1-31
    * @param hour local hour 0-23
    * @param minute local minute 0-59
    * @param second local second 0-59
    * @param millisecond local millisecond 0-999
    * @return the offset of this time zone with respect to UTC at the given time, in minutes.
    */
    TimeZone.prototype.offsetForZone = function (year, month, day, hour, minute, second, millisecond) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        assert(month > 0 && month < 13, "TimeZone.offsetForZone():  month out of range: " + month);
        assert(day > 0 && day < 32, "TimeZone.offsetForZone():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForZone():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForZone():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForZone():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForZone():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                var date = new Date(year, month - 1, day, hour, minute, second, millisecond);
                return -1 * date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                // note that TzDatabase normalizes the given date so we don't have to do it
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().totalOffsetLocal(this._name, tm.toUnixNoLeapSecs()).minutes();
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
        }
    };

    /**
    * Note: will be removed in version 2.0.0
    *
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    *
    * @param date: the date
    * @param funcs: the set of functions to use: get() or getUTC()
    */
    TimeZone.prototype.offsetForUtcDate = function (date, funcs) {
        switch (funcs) {
            case 0 /* Get */: {
                return this.offsetForUtc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case 1 /* GetUTC */: {
                return this.offsetForUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown DateFunctions value");
                }
        }
    };

    /**
    * Note: will be removed in version 2.0.0
    *
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    *
    * @param date: the date
    * @param funcs: the set of functions to use: get() or getUTC()
    */
    TimeZone.prototype.offsetForZoneDate = function (date, funcs) {
        switch (funcs) {
            case 0 /* Get */: {
                return this.offsetForZone(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case 1 /* GetUTC */: {
                return this.offsetForZone(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown DateFunctions value");
                }
        }
    };

    /**
    * Zone abbreviation at given UTC timestamp e.g. CEST for Central European Summer Time.
    *
    * @param year Full year
    * @param month Month 1-12 (note this deviates from JavaScript date)
    * @param day Day of month 1-31
    * @param hour Hour 0-23
    * @param minute Minute 0-59
    * @param second Second 0-59
    * @param millisecond Millisecond 0-999
    * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
    *
    * @return "local" for local timezone, the offset for an offset zone, or the abbreviation for a proper zone.
    */
    TimeZone.prototype.abbreviationForUtc = function (year, month, day, hour, minute, second, millisecond, dstDependent) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        if (typeof dstDependent === "undefined") { dstDependent = true; }
        assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
        assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                return "local";
            }
            case 1 /* Offset */: {
                return this.toString();
            }
            case 2 /* Proper */: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().abbreviation(this._name, tm.toUnixNoLeapSecs(), dstDependent);
            }

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
        }
    };

    /**
    * Normalizes non-existing local times by adding a forward offset change.
    * During a forward standard offset change or DST offset change, some amount of
    * local time is skipped. Therefore, this amount of local time does not exist.
    * This function adds the amount of forward change to any non-existing time. After all,
    * this is probably what the user meant.
    *
    * @param localUnixMillis	Unix timestamp in zone time
    * @param opt	(optional) Round up or down? Default: up
    *
    * @returns	Unix timestamp in zone time, normalized.
    */
    TimeZone.prototype.normalizeZoneTime = function (localUnixMillis, opt) {
        if (typeof opt === "undefined") { opt = 0 /* Up */; }
        if (this.kind() === 2 /* Proper */) {
            var tzopt = (opt === 1 /* Down */ ? 1 /* Down */ : 0 /* Up */);
            return TzDatabase.instance().normalizeLocal(this._name, localUnixMillis, tzopt);
        } else {
            return localUnixMillis;
        }
    };

    /**
    * The time zone identifier (normalized).
    * Either "localtime", IANA name, or "+hh:mm" offset.
    */
    TimeZone.prototype.toString = function () {
        return this._name;
    };

    /**
    * Used by util.inspect()
    */
    TimeZone.prototype.inspect = function () {
        return "[TimeZone: " + this.toString() + "]";
    };

    /**
    * Convert an offset number into an offset string
    * @param offset The offset in minutes from UTC e.g. 90 minutes
    * @return the offset in ISO notation "+01:30" for +90 minutes
    */
    TimeZone.offsetToString = function (offset) {
        var sign = (offset < 0 ? "-" : "+");
        var hours = Math.floor(Math.abs(offset) / 60);
        var minutes = Math.floor(Math.abs(offset) % 60);
        return sign + strings.padLeft(hours.toString(10), 2, "0") + ":" + strings.padLeft(minutes.toString(10), 2, "0");
    };

    /**
    * String to offset conversion.
    * @param s	Formats: "-01:00", "-0100", "-01", "Z"
    * @return offset w.r.t. UTC in minutes
    */
    TimeZone.stringToOffset = function (s) {
        var t = s.trim();

        // easy case
        if (t === "Z") {
            return 0;
        }

        // check that the remainder conforms to ISO time zone spec
        assert(t.match(/^[+-]\d\d(:?)\d\d$/) || t.match(/^[+-]\d\d$/), "Wrong time zone format: \"" + t + "\"");
        var sign = (t.charAt(0) === "+" ? 1 : -1);
        var hours = parseInt(t.substr(1, 2), 10);
        var minutes = 0;
        if (t.length === 5) {
            minutes = parseInt(t.substr(3, 2), 10);
        } else if (t.length === 6) {
            minutes = parseInt(t.substr(4, 2), 10);
        }
        assert(hours >= 0 && hours < 24, "Offsets from UTC must be less than a day.");
        return sign * (hours * 60 + minutes);
    };

    /**
    * Find in cache or create zone
    * @param name	Time zone name
    */
    TimeZone._findOrCreate = function (name) {
        if (name in TimeZone._cache) {
            return TimeZone._cache[name];
        } else {
            var t = new TimeZone(name);
            TimeZone._cache[name] = t;
            return t;
        }
    };

    /**
    * Normalize a string so it can be used as a key for a
    * cache lookup
    */
    TimeZone._normalizeString = function (s) {
        var t = s.trim();
        assert(t.length > 0, "Empty time zone string given");
        if (t === "localtime") {
            return t;
        } else if (t === "Z") {
            return "+00:00";
        } else if (t.charAt(0) === "+" || t.charAt(0) === "-" || t === "Z") {
            // offset string
            // normalize by converting back and forth
            return TimeZone.offsetToString(TimeZone.stringToOffset(t));
        } else {
            // Olsen TZ database name
            return t;
        }
    };
    TimeZone._cache = {};
    return TimeZone;
})();
exports.TimeZone = TimeZone;
//# sourceMappingURL=timezone.js.map

},{"./basics":1,"./javascript":9,"./strings":12,"./tz-database":17,"assert":19}],16:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Functionality to parse a DateTime object to a string
*/
/// <reference path="../typings/lib.d.ts"/>
var Tokenizer = (function () {
    /**
    * Create a new tokenizer
    * @param _formatString (optional) Set the format string
    */
    function Tokenizer(_formatString) {
        this._formatString = _formatString;
    }
    /**
    * Set the format string
    * @param formatString The new string to use for formatting
    */
    Tokenizer.prototype.setFormatString = function (formatString) {
        this._formatString = formatString;
    };

    /**
    * Append a new token to the current list of tokens.
    *
    * @param tokenString The string that makes up the token
    * @param tokenArray The existing array of tokens
    * @param raw (optional) If true, don't parse the token but insert it as is
    * @return Token[] The resulting array of tokens.
    */
    Tokenizer.prototype._appendToken = function (tokenString, tokenArray, raw) {
        if (tokenString !== "") {
            var token = {
                length: tokenString.length,
                raw: tokenString,
                symbol: tokenString[0],
                type: 0 /* IDENTITY */
            };

            if (!raw) {
                token.type = mapSymbolToType(token.symbol);
            }
            tokenArray.push(token);
        }
        return tokenArray;
    };

    /**
    * Parse the internal string and return an array of tokens.
    * @return Token[]
    */
    Tokenizer.prototype.parseTokens = function () {
        var result = [];

        var currentToken = "";
        var previousChar = "";
        var quoting = false;
        var possibleEscaping = false;

        for (var i = 0; i < this._formatString.length; ++i) {
            var currentChar = this._formatString[i];

            // Hanlde escaping and quoting
            if (currentChar === "'") {
                if (!quoting) {
                    if (possibleEscaping) {
                        // Escaped a single ' character without quoting
                        if (currentChar !== previousChar) {
                            result = this._appendToken(currentToken, result);
                            currentToken = "";
                        }
                        currentToken += "'";
                        possibleEscaping = false;
                    } else {
                        possibleEscaping = true;
                    }
                } else {
                    // Two possibilities: Were are done quoting, or we are escaping a ' character
                    if (possibleEscaping) {
                        // Escaping, add ' to the token
                        currentToken += currentChar;
                        possibleEscaping = false;
                    } else {
                        // Maybe escaping, wait for next token if we are escaping
                        possibleEscaping = true;
                    }
                }
                if (!possibleEscaping) {
                    // Current character is relevant, so save it for inspecting next round
                    previousChar = currentChar;
                }
                continue;
            } else if (possibleEscaping) {
                quoting = !quoting;
                possibleEscaping = false;

                // Flush current token
                result = this._appendToken(currentToken, result, !quoting);
                currentToken = "";
            }

            if (quoting) {
                // Quoting mode, add character to token.
                currentToken += currentChar;
                previousChar = currentChar;
                continue;
            }

            if (currentChar !== previousChar) {
                // We stumbled upon a new token!
                result = this._appendToken(currentToken, result);
                currentToken = currentChar;
            } else {
                // We are repeating the token with more characters
                currentToken += currentChar;
            }

            previousChar = currentChar;
        }

        // Don't forget to add the last token to the result!
        result = this._appendToken(currentToken, result, quoting);

        return result;
    };
    return Tokenizer;
})();
exports.Tokenizer = Tokenizer;

/**
* Different types of tokens, each for a DateTime "period type" (like year, month, hour etc.)
*/
(function (DateTimeTokenType) {
    DateTimeTokenType[DateTimeTokenType["IDENTITY"] = 0] = "IDENTITY";

    DateTimeTokenType[DateTimeTokenType["ERA"] = 1] = "ERA";
    DateTimeTokenType[DateTimeTokenType["YEAR"] = 2] = "YEAR";
    DateTimeTokenType[DateTimeTokenType["QUARTER"] = 3] = "QUARTER";
    DateTimeTokenType[DateTimeTokenType["MONTH"] = 4] = "MONTH";
    DateTimeTokenType[DateTimeTokenType["WEEK"] = 5] = "WEEK";
    DateTimeTokenType[DateTimeTokenType["DAY"] = 6] = "DAY";
    DateTimeTokenType[DateTimeTokenType["WEEKDAY"] = 7] = "WEEKDAY";
    DateTimeTokenType[DateTimeTokenType["DAYPERIOD"] = 8] = "DAYPERIOD";
    DateTimeTokenType[DateTimeTokenType["HOUR"] = 9] = "HOUR";
    DateTimeTokenType[DateTimeTokenType["MINUTE"] = 10] = "MINUTE";
    DateTimeTokenType[DateTimeTokenType["SECOND"] = 11] = "SECOND";
    DateTimeTokenType[DateTimeTokenType["ZONE"] = 12] = "ZONE";
})(exports.DateTimeTokenType || (exports.DateTimeTokenType = {}));
var DateTimeTokenType = exports.DateTimeTokenType;


var symbolMapping = {
    "G": 1 /* ERA */,
    "y": 2 /* YEAR */,
    "Y": 2 /* YEAR */,
    "u": 2 /* YEAR */,
    "U": 2 /* YEAR */,
    "r": 2 /* YEAR */,
    "Q": 3 /* QUARTER */,
    "q": 3 /* QUARTER */,
    "M": 4 /* MONTH */,
    "L": 4 /* MONTH */,
    "l": 4 /* MONTH */,
    "w": 5 /* WEEK */,
    "W": 5 /* WEEK */,
    "d": 6 /* DAY */,
    "D": 6 /* DAY */,
    "F": 6 /* DAY */,
    "g": 6 /* DAY */,
    "E": 7 /* WEEKDAY */,
    "e": 7 /* WEEKDAY */,
    "c": 7 /* WEEKDAY */,
    "a": 8 /* DAYPERIOD */,
    "h": 9 /* HOUR */,
    "H": 9 /* HOUR */,
    "k": 9 /* HOUR */,
    "K": 9 /* HOUR */,
    "j": 9 /* HOUR */,
    "J": 9 /* HOUR */,
    "m": 10 /* MINUTE */,
    "s": 11 /* SECOND */,
    "S": 11 /* SECOND */,
    "A": 11 /* SECOND */,
    "z": 12 /* ZONE */,
    "Z": 12 /* ZONE */,
    "O": 12 /* ZONE */,
    "v": 12 /* ZONE */,
    "V": 12 /* ZONE */,
    "X": 12 /* ZONE */,
    "x": 12 /* ZONE */
};

/**
* Map the given symbol to one of the DateTimeTokenTypes
* If there is no mapping, DateTimeTokenType.IDENTITY is used
*
* @param symbol The single-character symbol used to map the token
* @return DateTimeTokenType The Type of token this symbol represents
*/
function mapSymbolToType(symbol) {
    if (symbolMapping.hasOwnProperty(symbol)) {
        return symbolMapping[symbol];
    } else {
        return 0 /* IDENTITY */;
    }
}
//# sourceMappingURL=token.js.map

},{}],17:[function(require,module,exports){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Olsen Timezone Database container
*
* DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var util = require("util");

var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var basics = require("./basics");
var duration = require("./duration");
var math = require("./math");

/* tslint:disable */
var data = require("./timezone-data.json");

/* tslint:enable */
var Duration = duration.Duration;
var TimeStruct = basics.TimeStruct;
var WeekDay = basics.WeekDay;

/**
* Type of rule TO column value
*/
(function (ToType) {
    /**
    * Either a year number or "only"
    */
    ToType[ToType["Year"] = 0] = "Year";

    /**
    * "max"
    */
    ToType[ToType["Max"] = 1] = "Max";
})(exports.ToType || (exports.ToType = {}));
var ToType = exports.ToType;

/**
* Type of rule ON column value
*/
(function (OnType) {
    /**
    * Day-of-month number
    */
    OnType[OnType["DayNum"] = 0] = "DayNum";

    /**
    * "lastSun" or "lastWed" etc
    */
    OnType[OnType["LastX"] = 1] = "LastX";

    /**
    * e.g. "Sun>=8"
    */
    OnType[OnType["GreqX"] = 2] = "GreqX";

    /**
    * e.g. "Sun<=8"
    */
    OnType[OnType["LeqX"] = 3] = "LeqX";
})(exports.OnType || (exports.OnType = {}));
var OnType = exports.OnType;

(function (AtType) {
    /**
    * Local time (no DST)
    */
    AtType[AtType["Standard"] = 0] = "Standard";

    /**
    * Wall clock time (local time with DST)
    */
    AtType[AtType["Wall"] = 1] = "Wall";

    /**
    * Utc time
    */
    AtType[AtType["Utc"] = 2] = "Utc";
})(exports.AtType || (exports.AtType = {}));
var AtType = exports.AtType;

/**
* DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
*
* See http://www.cstdbill.com/tzdb/tz-how-to.html
*/
var RuleInfo = (function () {
    function RuleInfo(/**
    * FROM column year number.
    * Note, can be -10000 for NaN value (e.g. for "SystemV" rules)
    */
    from, /**
    * TO column type: Year for year numbers and "only" values, Max for "max" value.
    */
    toType, /**
    * If TO column is a year, the year number. If TO column is "only", the FROM year.
    */
    toYear, /**
    * TYPE column, not used so far
    */
    type, /**
    * IN column month number 1-12
    */
    inMonth, /**
    * ON column type
    */
    onType, /**
    * If onType is DayNum, the day number
    */
    onDay, /**
    * If onType is not DayNum, the weekday
    */
    onWeekDay, /**
    * AT column hour
    */
    atHour, /**
    * AT column minute
    */
    atMinute, /**
    * AT column second
    */
    atSecond, /**
    * AT column type
    */
    atType, /**
    * DST offset from local standard time (NOT from UTC!)
    */
    save, /**
    * Character to insert in %s for time zone abbreviation
    * Note if TZ database indicates "-" this is the empty string
    */
    letter) {
        this.from = from;
        this.toType = toType;
        this.toYear = toYear;
        this.type = type;
        this.inMonth = inMonth;
        this.onType = onType;
        this.onDay = onDay;
        this.onWeekDay = onWeekDay;
        this.atHour = atHour;
        this.atMinute = atMinute;
        this.atSecond = atSecond;
        this.atType = atType;
        this.save = save;
        this.letter = letter;
    }
    /**
    * Returns true iff this rule is applicable in the year
    */
    RuleInfo.prototype.applicable = function (year) {
        if (year < this.from) {
            return false;
        }
        switch (this.toType) {
            case 1 /* Max */:
                return true;
            case 0 /* Year */:
                return (year <= this.toYear);
        }
    };

    /**
    * Sort comparison
    * @return (first effective date is less than other's first effective date)
    */
    RuleInfo.prototype.effectiveLess = function (other) {
        if (this.from < other.from) {
            return true;
        }
        if (this.from > other.from) {
            return false;
        }
        if (this.inMonth < other.inMonth) {
            return true;
        }
        if (this.inMonth > other.inMonth) {
            return false;
        }
        if (this.effectiveDate(this.from).lessThan(other.effectiveDate(this.from))) {
            return true;
        }
        return false;
    };

    /**
    * Sort comparison
    * @return (first effective date is equal to other's first effective date)
    */
    RuleInfo.prototype.effectiveEqual = function (other) {
        if (this.from !== other.from) {
            return false;
        }
        if (this.inMonth !== other.inMonth) {
            return false;
        }
        if (!this.effectiveDate(this.from).equals(other.effectiveDate(this.from))) {
            return false;
        }
        return true;
    };

    /**
    * Returns the date that the rule takes effect. Note that the time
    * is NOT adjusted for wall clock time or standard time, i.e. this.atType is
    * not taken into account
    */
    RuleInfo.prototype.effectiveDate = function (year) {
        assert(this.applicable(year), "Rule is not applicable in " + year.toString(10));

        // year and month are given
        var tm = new TimeStruct(year, this.inMonth);

        switch (this.onType) {
            case 0 /* DayNum */:
                 {
                    tm.day = this.onDay;
                }
                break;
            case 2 /* GreqX */:
                 {
                    tm.day = basics.weekDayOnOrAfter(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case 3 /* LeqX */:
                 {
                    tm.day = basics.weekDayOnOrBefore(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case 1 /* LastX */:
                 {
                    tm.day = basics.lastWeekDayOfMonth(year, this.inMonth, this.onWeekDay);
                }
                break;
        }

        // calculate time
        tm.hour = this.atHour;
        tm.minute = this.atMinute;
        tm.second = this.atSecond;

        return tm;
    };

    /**
    * Returns the transition moment in UTC in the given year
    *
    * @param year	The year for which to return the transition
    * @param standardOffset	The standard offset for the timezone without DST
    * @param prevRule	The previous rule
    */
    RuleInfo.prototype.transitionTimeUtc = function (year, standardOffset, prevRule) {
        assert(this.applicable(year), "Rule not applicable in given year");
        var unixMillis = this.effectiveDate(year).toUnixNoLeapSecs();

        // adjust for given offset
        var offset;
        switch (this.atType) {
            case 2 /* Utc */:
                offset = Duration.hours(0);
                break;
            case 0 /* Standard */:
                offset = standardOffset;
                break;
            case 1 /* Wall */:
                if (prevRule) {
                    offset = standardOffset.add(prevRule.save);
                } else {
                    offset = standardOffset;
                }
                break;

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("unknown AtType");
                }
        }

        return unixMillis - offset.milliseconds();
    };
    return RuleInfo;
})();
exports.RuleInfo = RuleInfo;

/**
* Type of reference from zone to rule
*/
(function (RuleType) {
    /**
    * No rule applies
    */
    RuleType[RuleType["None"] = 0] = "None";

    /**
    * Fixed given offset
    */
    RuleType[RuleType["Offset"] = 1] = "Offset";

    /**
    * Reference to a named set of rules
    */
    RuleType[RuleType["RuleName"] = 2] = "RuleName";
})(exports.RuleType || (exports.RuleType = {}));
var RuleType = exports.RuleType;

/**
* DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
*
* See http://www.cstdbill.com/tzdb/tz-how-to.html
* First, and somewhat trivially, whereas Rules are considered to contain one or more records, a Zone is considered to
* be a single record with zero or more continuation lines. Thus, the keyword, “Zone,” and the zone name are not repeated.
* The last line is the one without anything in the [UNTIL] column.
* Second, and more fundamentally, each line of a Zone represents a steady state, not a transition between states.
* The state exists from the date and time in the previous line’s [UNTIL] column up to the date and time in the current line’s
* [UNTIL] column. In other words, the date and time in the [UNTIL] column is the instant that separates this state from the next.
* Where that would be ambiguous because we’re setting our clocks back, the [UNTIL] column specifies the first occurrence of the instant.
* The state specified by the last line, the one without anything in the [UNTIL] column, continues to the present.
* The first line typically specifies the mean solar time observed before the introduction of standard time. Since there’s no line before
* that, it has no beginning. 8-) For some places near the International Date Line, the first two lines will show solar times differing by
* 24 hours; this corresponds to a movement of the Date Line. For example:
* # Zone	NAME		GMTOFF	RULES	FORMAT	[UNTIL]
* Zone America/Juneau	 15:02:19 -	LMT	1867 Oct 18
* 			 -8:57:41 -	LMT	...
* When Alaska was purchased from Russia in 1867, the Date Line moved from the Alaska/Canada border to the Bering Strait; and the time in
* Alaska was then 24 hours earlier than it had been. <aside>(6 October in the Julian calendar, which Russia was still using then for
* religious reasons, was followed by a second instance of the same day with a different name, 18 October in the Gregorian calendar.
* Isn’t civil time wonderful? 8-))</aside>
* The abbreviation, “LMT,” stands for “local mean time,” which is an invention of the tz database and was probably never actually
* used during the period. Furthermore, the value is almost certainly wrong except in the archetypal place after which the zone is named.
* (The tz database usually doesn’t provide a separate Zone record for places where nothing significant happened after 1970.)
*/
var ZoneInfo = (function () {
    function ZoneInfo(/**
    * GMT offset in fractional minutes, POSITIVE to UTC (note JavaScript.Date gives offsets
    * contrary to what you might expect).  E.g. Europe/Amsterdam has +60 minutes in this field because
    * it is one hour ahead of UTC
    */
    gmtoff, /**
    * The RULES column tells us whether daylight saving time is being observed:
    * A hyphen, a kind of null value, means that we have not set our clocks ahead of standard time.
    * An amount of time (usually but not necessarily “1:00” meaning one hour) means that we have set our clocks ahead by that amount.
    * Some alphabetic string means that we might have set our clocks ahead; and we need to check the rule
    * the name of which is the given alphabetic string.
    */
    ruleType, /**
    * If the rule column is an offset, this is the offset
    */
    ruleOffset, /**
    * If the rule column is a rule name, this is the rule name
    */
    ruleName, /**
    * The FORMAT column specifies the usual abbreviation of the time zone name. It can have one of four forms:
    * the string, “zzz,” which is a kind of null value (don’t ask)
    * a single alphabetic string other than “zzz,” in which case that’s the abbreviation
    * a pair of strings separated by a slash (‘/’), in which case the first string is the abbreviation
    * for the standard time name and the second string is the abbreviation for the daylight saving time name
    * a string containing “%s,” in which case the “%s” will be replaced by the text in the appropriate Rule’s LETTER column
    */
    format, /**
    * Until timestamp in unix utc millis. The zone info is valid up to
    * and excluding this timestamp.
    * Note this value can be NULL (for the first rule)
    */
    until) {
        this.gmtoff = gmtoff;
        this.ruleType = ruleType;
        this.ruleOffset = ruleOffset;
        this.ruleName = ruleName;
        this.format = format;
        this.until = until;
    }
    return ZoneInfo;
})();
exports.ZoneInfo = ZoneInfo;

var TzMonthNames;
(function (TzMonthNames) {
    TzMonthNames[TzMonthNames["Jan"] = 1] = "Jan";
    TzMonthNames[TzMonthNames["Feb"] = 2] = "Feb";
    TzMonthNames[TzMonthNames["Mar"] = 3] = "Mar";
    TzMonthNames[TzMonthNames["Apr"] = 4] = "Apr";
    TzMonthNames[TzMonthNames["May"] = 5] = "May";
    TzMonthNames[TzMonthNames["Jun"] = 6] = "Jun";
    TzMonthNames[TzMonthNames["Jul"] = 7] = "Jul";
    TzMonthNames[TzMonthNames["Aug"] = 8] = "Aug";
    TzMonthNames[TzMonthNames["Sep"] = 9] = "Sep";
    TzMonthNames[TzMonthNames["Oct"] = 10] = "Oct";
    TzMonthNames[TzMonthNames["Nov"] = 11] = "Nov";
    TzMonthNames[TzMonthNames["Dec"] = 12] = "Dec";
})(TzMonthNames || (TzMonthNames = {}));

function monthNameToString(name) {
    for (var i = 1; i <= 12; ++i) {
        if (TzMonthNames[i] === name) {
            return i;
        }
    }

    /* istanbul ignore if */
    /* istanbul ignore next */
    if (true) {
        throw new Error("Invalid month name \"" + name + "\"");
    }
}

var TzDayNames;
(function (TzDayNames) {
    TzDayNames[TzDayNames["Sun"] = 0] = "Sun";
    TzDayNames[TzDayNames["Mon"] = 1] = "Mon";
    TzDayNames[TzDayNames["Tue"] = 2] = "Tue";
    TzDayNames[TzDayNames["Wed"] = 3] = "Wed";
    TzDayNames[TzDayNames["Thu"] = 4] = "Thu";
    TzDayNames[TzDayNames["Fri"] = 5] = "Fri";
    TzDayNames[TzDayNames["Sat"] = 6] = "Sat";
})(TzDayNames || (TzDayNames = {}));

/**
* Returns true if the given string is a valid offset string i.e.
* 1, -1, +1, 01, 1:00, 1:23:25.143
*/
function isValidOffsetString(s) {
    return /^(\-|\+)?([0-9]+((\:[0-9]+)?(\:[0-9]+(\.[0-9]+)?)?))$/.test(s);
}
exports.isValidOffsetString = isValidOffsetString;

/**
* Defines a moment at which the given rule becomes valid
*/
var Transition = (function () {
    function Transition(/**
    * Transition time in UTC millis
    */
    at, /**
    * New offset (type of offset depends on the function)
    */
    offset, /**
    * New timzone abbreviation letter
    */
    letter) {
        this.at = at;
        this.offset = offset;
        this.letter = letter;
    }
    return Transition;
})();
exports.Transition = Transition;

/**
* Option for TzDatabase#normalizeLocal()
*/
(function (NormalizeOption) {
    /**
    * Normalize non-existing times by ADDING the DST offset
    */
    NormalizeOption[NormalizeOption["Up"] = 0] = "Up";

    /**
    * Normalize non-existing times by SUBTRACTING the DST offset
    */
    NormalizeOption[NormalizeOption["Down"] = 1] = "Down";
})(exports.NormalizeOption || (exports.NormalizeOption = {}));
var NormalizeOption = exports.NormalizeOption;

/**
* DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
*
* This class typescriptifies reading the TZ data
*/
var TzDatabase = (function () {
    function TzDatabase(data) {
        /**
        * Performance improvement: zone info cache
        */
        this._zoneInfoCache = {};
        /**
        * Performance improvement: rule info cache
        */
        this._ruleInfoCache = {};
        assert(!TzDatabase._instance, "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        this._data = data;
        this._minmax = validateData(data);
    }
    /**
    * Single instance of this database
    */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            TzDatabase._instance = new TzDatabase(data);
        }
        return TzDatabase._instance;
    };

    /**
    * Inject test timezone data for unittests
    */
    TzDatabase.inject = function (data) {
        TzDatabase._instance = null; // circumvent constructor check on duplicate instances
        TzDatabase._instance = new TzDatabase(data);
    };

    /**
    * Minimum non-zero DST offset (which excludes standard offset) of all rules in the database.
    * Note that DST offsets need not be whole hours.
    *
    * Does return zero if a zoneName is given and there is no DST at all for the zone.
    *
    * @param zoneName	(optional) if given, the result for the given zone is returned
    */
    TzDatabase.prototype.minDstSave = function (zoneName) {
        var _this = this;
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            zoneInfos.forEach(function (zoneInfo) {
                if (zoneInfo.ruleType === 1 /* Offset */) {
                    if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
                        if (zoneInfo.ruleOffset.milliseconds() !== 0) {
                            result = zoneInfo.ruleOffset;
                        }
                    }
                }
                if (zoneInfo.ruleType === 2 /* RuleName */ && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = _this.getRuleInfos(zoneInfo.ruleName);
                    temp.forEach(function (ruleInfo) {
                        if (!result || result.greaterThan(ruleInfo.save)) {
                            if (ruleInfo.save.milliseconds() !== 0) {
                                result = ruleInfo.save;
                            }
                        }
                    });
                }
            });
            if (!result) {
                result = Duration.hours(0);
            }
            return result.clone();
        } else {
            return Duration.minutes(this._minmax.minDstSave);
        }
    };

    /**
    * Maximum DST offset (which excludes standard offset) of all rules in the database.
    * Note that DST offsets need not be whole hours.
    *
    * Returns 0 if zoneName given and no DST observed.
    *
    * @param zoneName	(optional) if given, the result for the given zone is returned
    */
    TzDatabase.prototype.maxDstSave = function (zoneName) {
        var _this = this;
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            zoneInfos.forEach(function (zoneInfo) {
                if (zoneInfo.ruleType === 1 /* Offset */) {
                    if (!result || result.lessThan(zoneInfo.ruleOffset)) {
                        result = zoneInfo.ruleOffset;
                    }
                }
                if (zoneInfo.ruleType === 2 /* RuleName */ && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = _this.getRuleInfos(zoneInfo.ruleName);
                    temp.forEach(function (ruleInfo) {
                        if (!result || result.lessThan(ruleInfo.save)) {
                            result = ruleInfo.save;
                        }
                    });
                }
            });
            if (!result) {
                result = Duration.hours(0);
            }
            return result.clone();
        } else {
            return Duration.minutes(this._minmax.maxDstSave);
        }
    };

    /**
    * Checks whether the zone has DST at all
    */
    TzDatabase.prototype.hasDst = function (zoneName) {
        return (this.maxDstSave(zoneName).milliseconds() !== 0);
    };

    /**
    * Returns true iff the given zone name eventually links to
    * "Etc/UTC", "Etc/GMT" or "Etc/UCT" in the TZ database. This is true e.g. for
    * "UTC", "GMT", "Etc/GMT" etc.
    *
    * @param zoneName	IANA time zone name.
    */
    TzDatabase.prototype.zoneIsUtc = function (zoneName) {
        var actualZoneName = zoneName;
        var zoneEntries = this._data.zones[zoneName];

        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \"" + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        return (actualZoneName === "Etc/UTC" || actualZoneName === "Etc/GMT" || actualZoneName === "Etc/UCT");
    };

    TzDatabase.prototype.normalizeLocal = function (zoneName, a, opt) {
        if (typeof opt === "undefined") { opt = 0 /* Up */; }
        assert(typeof (a) === "number" || typeof (a) === "object", "number or object expected");
        assert(typeof (a) !== "object" || a, "a is null");

        if (this.hasDst(zoneName)) {
            var unixMillis = 0;
            var tm = null;
            if (typeof a === "object") {
                unixMillis = (a).toUnixNoLeapSecs();
                tm = (a);
            } else {
                unixMillis = a;
                tm = basics.unixToTimeNoLeapSecs(unixMillis);
            }

            // local times behave like this during DST changes:
            // forward change (1h):   0 1 3 4 5
            // forward change (2h):   0 1 4 5 6
            // backward change (1h):  1 2 2 3 4
            // backward change (2h):  1 2 1 2 3
            // Therefore, binary searching is not possible.
            // Instead, we should check the DST forward transitions within a window around the local time
            // get all transitions (note this includes fake transition rules for zone offset changes)
            var transitions = this.getTransitionsTotalOffsets(zoneName, tm.year - 1, tm.year + 1);

            // find the DST forward transitions
            var prev = Duration.hours(0);
            for (var i = 0; i < transitions.length; ++i) {
                var transition = transitions[i];

                // forward transition?
                if (transition.offset.greaterThan(prev)) {
                    var localBefore = transition.at + prev.milliseconds();
                    var localAfter = transition.at + transition.offset.milliseconds();
                    if (unixMillis >= localBefore && unixMillis < localAfter) {
                        var forwardChange = transition.offset.sub(prev);

                        // non-existing time
                        var factor = (opt === 0 /* Up */ ? 1 : -1);
                        if (typeof a === "object") {
                            return basics.unixToTimeNoLeapSecs(unixMillis + factor * forwardChange.milliseconds());
                        } else {
                            return unixMillis + factor * forwardChange.milliseconds();
                        }
                    }
                }
                prev = transition.offset;
            }
            ;

            // no non-existing time
            return a;
        } else {
            return a;
        }
    };

    /**
    * Returns the standard time zone offset from UTC, without DST.
    * Throws if info not found.
    * @param zoneName	IANA time zone name
    * @param utcMillis	Timestamp in UTC
    */
    TzDatabase.prototype.standardOffset = function (zoneName, utcMillis) {
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        return zoneInfo.gmtoff.clone();
    };

    /**
    * Returns the total time zone offset from UTC, including DST, at
    * the given UTC timestamp.
    * Throws if zone info not found.
    *
    * @param zoneName	IANA time zone name
    * @param utcMillis	Timestamp in UTC
    */
    TzDatabase.prototype.totalOffset = function (zoneName, utcMillis) {
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        var dstOffset = null;

        switch (zoneInfo.ruleType) {
            case 0 /* None */:
                 {
                    dstOffset = Duration.minutes(0);
                }
                break;
            case 1 /* Offset */:
                 {
                    dstOffset = zoneInfo.ruleOffset;
                }
                break;
            case 2 /* RuleName */: {
                dstOffset = this.dstOffsetForRule(zoneInfo.ruleName, utcMillis, zoneInfo.gmtoff);
            }
        }

        return dstOffset.add(zoneInfo.gmtoff);
    };

    /**
    * The time zone rule abbreviation, e.g. CEST for Central European Summer Time.
    * Note this is dependent on the time, because with time different rules are in effect
    * and therefore different abbreviations. They also change with DST: e.g. CEST or CET.
    *
    * @param zoneName	IANA zone name
    * @param utcMillis	Timestamp in UTC unix milliseconds
    * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
    * @return	The abbreviation of the rule that is in effect
    */
    TzDatabase.prototype.abbreviation = function (zoneName, utcMillis, dstDependent) {
        if (typeof dstDependent === "undefined") { dstDependent = true; }
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        var format = zoneInfo.format;

        // is format dependent on DST?
        if (format.indexOf("%s") !== -1 && zoneInfo.ruleType === 2 /* RuleName */) {
            var letter;

            // place in format string
            if (dstDependent) {
                letter = this.letterForRule(zoneInfo.ruleName, utcMillis, zoneInfo.gmtoff);
            } else {
                letter = "";
            }
            return util.format(format, letter);
        }

        return format;
    };

    /**
    * Returns the total time zone offset from UTC, including DST, at
    * the given LOCAL timestamp. Non-existing local time is normalized out.
    * There can be multiple UTC times and therefore multiple offsets for a local time
    * namely during a backward DST change. This returns the FIRST such offset.
    * Throws if zone info not found.
    *
    * @param zoneName	IANA time zone name
    * @param localMillis	Timestamp in time zone time
    */
    TzDatabase.prototype.totalOffsetLocal = function (zoneName, localMillis) {
        var normalized = this.normalizeLocal(zoneName, localMillis);
        var normalizedTm = basics.unixToTimeNoLeapSecs(normalized);

        /// Note: during offset changes, local time can behave like:
        // forward change (1h):   0 1 3 4 5
        // forward change (2h):   0 1 4 5 6
        // backward change (1h):  1 2 2 3 4
        // backward change (2h):  1 2 1 2 3  <-- note time going BACKWARD
        // Therefore binary search does not apply. Linear search through transitions
        // and return the first offset that matches
        var transitions = this.getTransitionsTotalOffsets(zoneName, normalizedTm.year - 1, normalizedTm.year + 1);
        var prev = null;
        var prevPrev = null;
        for (var i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (transition.at + transition.offset.milliseconds() > normalized) {
                break;
            }
            prevPrev = prev;
            prev = transition;
        }

        /* istanbul ignore else */
        if (prev) {
            // special care during backward change: take first occurrence of local time
            if (prevPrev && prevPrev.offset.greaterThan(prev.offset)) {
                // backward change
                var diff = prevPrev.offset.sub(prev.offset);
                if (normalized >= prev.at + prev.offset.milliseconds() && normalized < prev.at + prev.offset.milliseconds() + diff.milliseconds()) {
                    // within duplicate range
                    return prevPrev.offset.clone();
                } else {
                    return prev.offset.clone();
                }
            } else {
                return prev.offset.clone();
            }
        } else {
            // this cannot happen as the transitions array is guaranteed to contain a transition at the
            // beginning of the requested fromYear
            return Duration.hours(0);
        }
    };

    /**
    * Returns the DST offset (WITHOUT the standard zone offset) for the given
    * ruleset and the given UTC timestamp
    *
    * @param ruleName	name of ruleset
    * @param utcMillis	UTC timestamp
    * @param standardOffset	Standard offset without DST for the time zone
    */
    TzDatabase.prototype.dstOffsetForRule = function (ruleName, utcMillis, standardOffset) {
        var tm = basics.unixToTimeNoLeapSecs(utcMillis);

        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, tm.year - 1, tm.year, standardOffset);

        // find the last prior to given date
        var offset = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= utcMillis) {
                offset = transition.offset.clone();
                break;
            }
        }

        /* istanbul ignore if */
        if (!offset) {
            throw new Error("No offset found.");
        }

        return offset;
    };

    /**
    * Returns the time zone letter for the given
    * ruleset and the given UTC timestamp
    *
    * @param ruleName	name of ruleset
    * @param utcMillis	UTC timestamp
    * @param standardOffset	Standard offset without DST for the time zone
    */
    TzDatabase.prototype.letterForRule = function (ruleName, utcMillis, standardOffset) {
        var tm = basics.unixToTimeNoLeapSecs(utcMillis);

        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, tm.year - 1, tm.year, standardOffset);

        // find the last prior to given date
        var letter = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= utcMillis) {
                letter = transition.letter;
                break;
            }
        }

        /* istanbul ignore if */
        if (letter === null) {
            throw new Error("No offset found.");
        }

        return letter;
    };

    /**
    * Return a list of all transitions in [fromYear..toYear] sorted by effective date
    *
    * @param ruleName	Name of the rule set
    * @param fromYear	first year to return transitions for
    * @param toYear	Last year to return transitions for
    * @param standardOffset	Standard offset without DST for the time zone
    *
    * @return Transitions, with DST offsets (no standard offset included)
    */
    TzDatabase.prototype.getTransitionsDstOffsets = function (ruleName, fromYear, toYear, standardOffset) {
        assert(fromYear <= toYear, "fromYear must be <= toYear");

        var ruleInfos = this.getRuleInfos(ruleName);
        var result = [];

        for (var y = fromYear; y <= toYear; y++) {
            var prevInfo = null;
            for (var i = 0; i < ruleInfos.length; i++) {
                var ruleInfo = ruleInfos[i];
                if (ruleInfo.applicable(y)) {
                    result.push(new Transition(ruleInfo.transitionTimeUtc(y, standardOffset, prevInfo), ruleInfo.save, ruleInfo.letter));
                }
                prevInfo = ruleInfo;
            }
        }

        result.sort(function (a, b) {
            return a.at - b.at;
        });
        return result;
    };

    /**
    * Return both zone and rule changes as total (std + dst) offsets.
    * Adds an initial transition if there is no zone change within the range.
    *
    * @param zoneName	IANA zone name
    * @param fromYear	First year to include
    * @param toYear	Last year to include
    */
    TzDatabase.prototype.getTransitionsTotalOffsets = function (zoneName, fromYear, toYear) {
        assert(fromYear <= toYear, "fromYear must be <= toYear");

        var startMillis = basics.timeToUnixNoLeapSecs(fromYear);
        var endMillis = basics.timeToUnixNoLeapSecs(toYear + 1);

        var zoneInfos = this.getZoneInfos(zoneName);
        assert(zoneInfos.length > 0, "Empty zoneInfos array returned from getZoneInfos()");

        var result = [];

        var prevZone = null;
        var prevUntilTm = null;
        var prevStdOffset = Duration.hours(0);
        var prevDstOffset = Duration.hours(0);
        var prevLetter = "";
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            var untilTm = (zoneInfo.until ? basics.unixToTimeNoLeapSecs(zoneInfo.until) : new TimeStruct(toYear + 1));
            var stdOffset = prevStdOffset;
            var dstOffset = prevDstOffset;
            var letter = prevLetter;

            // zone applicable?
            if ((prevZone === null || prevZone.until < endMillis - 1) && (zoneInfo.until === null || zoneInfo.until >= startMillis)) {
                stdOffset = zoneInfo.gmtoff;

                switch (zoneInfo.ruleType) {
                    case 0 /* None */:
                        dstOffset = Duration.hours(0);
                        letter = "";
                        break;
                    case 1 /* Offset */:
                        dstOffset = zoneInfo.ruleOffset;
                        letter = "";
                        break;
                    case 2 /* RuleName */:
                        // check whether the first rule takes effect immediately on the zone transition
                        // (e.g. Lybia)
                        if (prevZone) {
                            var ruleInfos = this.getRuleInfos(zoneInfo.ruleName);
                            ruleInfos.forEach(function (ruleInfo) {
                                if (ruleInfo.applicable(prevUntilTm.year)) {
                                    if (ruleInfo.transitionTimeUtc(prevUntilTm.year, stdOffset, null) === prevZone.until) {
                                        dstOffset = ruleInfo.save;
                                        letter = ruleInfo.letter;
                                    }
                                }
                            });
                        }
                        break;
                }

                // add a transition for the zone transition
                var at = (prevZone ? prevZone.until : startMillis);
                result.push(new Transition(at, stdOffset.add(dstOffset), letter));

                // add transitions for the zone rules in the range
                if (zoneInfo.ruleType === 2 /* RuleName */) {
                    var dstTransitions = this.getTransitionsDstOffsets(zoneInfo.ruleName, prevUntilTm ? Math.max(prevUntilTm.year, fromYear) : fromYear, Math.min(untilTm.year, toYear), stdOffset);
                    dstTransitions.forEach(function (transition) {
                        letter = transition.letter;
                        dstOffset = transition.offset;
                        result.push(new Transition(transition.at, transition.offset.add(stdOffset), transition.letter));
                    });
                }
            }

            prevZone = zoneInfo;
            prevUntilTm = untilTm;
            prevStdOffset = stdOffset;
            prevDstOffset = dstOffset;
            prevLetter = letter;
        }

        result.sort(function (a, b) {
            return a.at - b.at;
        });
        return result;
    };

    /**
    * Get the zone info for the given UTC timestamp. Throws if not found.
    * @param zoneName	IANA time zone name
    * @param utcMillis	UTC time stamp
    * @returns	ZoneInfo object. Do not change, we cache this object.
    */
    TzDatabase.prototype.getZoneInfo = function (zoneName, utcMillis) {
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until > utcMillis) {
                return zoneInfo;
            }
        }

        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            throw new Error("No zone info found");
        }
    };

    /**
    * Return the zone records for a given zone name, after
    * following any links.
    *
    * @param zoneName	IANA zone name like "Pacific/Efate"
    * @return Array of zone infos. Do not change, this is a cached value.
    */
    TzDatabase.prototype.getZoneInfos = function (zoneName) {
        // FIRST validate zone name before searching cache
        /* istanbul ignore if */
        if (!this._data.zones.hasOwnProperty(zoneName)) {
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Zone \"" + zoneName + "\" not found.");
            }
        }

        // Take from cache
        if (this._zoneInfoCache.hasOwnProperty(zoneName)) {
            return this._zoneInfoCache[zoneName];
        }

        var result = [];
        var actualZoneName = zoneName;
        var zoneEntries = this._data.zones[zoneName];

        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \"" + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }

        for (var i = 0; i < zoneEntries.length; ++i) {
            var zoneEntry = zoneEntries[i];
            var ruleType = this.parseRuleType(zoneEntry[1]);
            var until = math.filterFloat(zoneEntry[3]);
            if (isNaN(until)) {
                until = null;
            }

            result.push(new ZoneInfo(Duration.minutes(-1 * math.filterFloat(zoneEntry[0])), ruleType, ruleType === 1 /* Offset */ ? new Duration(zoneEntry[1]) : new Duration(), ruleType === 2 /* RuleName */ ? zoneEntry[1] : "", zoneEntry[2], until));
        }

        result.sort(function (a, b) {
            // sort null last
            /* istanbul ignore if */
            if (a.until === null && b.until === null) {
                return 0;
            }
            if (a.until !== null && b.until === null) {
                return -1;
            }
            if (a.until === null && b.until !== null) {
                return 1;
            }
            return (a.until - b.until);
        });

        this._zoneInfoCache[zoneName] = result;
        return result;
    };

    /**
    * Returns the rule set with the given rule name,
    * sorted by first effective date (uncompensated for "w" or "s" AtTime)
    *
    * @param ruleName	Name of rule set
    * @return RuleInfo array. Do not change, this is a cached value.
    */
    TzDatabase.prototype.getRuleInfos = function (ruleName) {
        // validate name BEFORE searching cache
        if (!this._data.rules.hasOwnProperty(ruleName)) {
            throw new Error("Rule set \"" + ruleName + "\" not found.");
        }

        // return from cache
        if (this._ruleInfoCache.hasOwnProperty(ruleName)) {
            return this._ruleInfoCache[ruleName];
        }

        var result = [];
        var ruleSet = this._data.rules[ruleName];
        for (var i = 0; i < ruleSet.length; ++i) {
            var rule = ruleSet[i];

            var fromYear = (rule[0] === "NaN" ? -10000 : parseInt(rule[0], 10));
            var toType = this.parseToType(rule[1]);
            var toYear = (toType === 1 /* Max */ ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
            var onType = this.parseOnType(rule[4]);
            var onDay = this.parseOnDay(rule[4], onType);
            var onWeekDay = this.parseOnWeekDay(rule[4]);
            var monthName = rule[3];
            var monthNumber = monthNameToString(monthName);

            result.push(new RuleInfo(fromYear, toType, toYear, rule[2], monthNumber, onType, onDay, onWeekDay, math.positiveModulo(parseInt(rule[5][0], 10), 24), math.positiveModulo(parseInt(rule[5][1], 10), 60), math.positiveModulo(parseInt(rule[5][2], 10), 60), this.parseAtType(rule[5][3]), Duration.minutes(parseInt(rule[6], 10)), rule[7] === "-" ? "" : rule[7]));
        }

        result.sort(function (a, b) {
            /* istanbul ignore if */
            if (a.effectiveEqual(b)) {
                return 0;
            } else if (a.effectiveLess(b)) {
                return -1;
            } else {
                return 1;
            }
        });

        this._ruleInfoCache[ruleName] = result;
        return result;
    };

    /**
    * Parse the RULES column of a zone info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseRuleType = function (rule) {
        if (rule === "-") {
            return 0 /* None */;
        } else if (exports.isValidOffsetString(rule)) {
            return 1 /* Offset */;
        } else {
            return 2 /* RuleName */;
        }
    };

    /**
    * Parse the TO column of a rule info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseToType = function (to) {
        if (to === "max") {
            return 1 /* Max */;
        } else if (to === "only") {
            return 0 /* Year */;
        } else if (!isNaN(parseInt(to, 10))) {
            return 0 /* Year */;
        } else {
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("TO column incorrect: " + to);
            }
        }
    };

    /**
    * Parse the ON column of a rule info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseOnType = function (on) {
        if (on.length > 4 && on.substr(0, 4) === "last") {
            return 1 /* LastX */;
        }
        if (on.indexOf("<=") !== -1) {
            return 3 /* LeqX */;
        }
        if (on.indexOf(">=") !== -1) {
            return 2 /* GreqX */;
        }
        return 0 /* DayNum */;
    };

    /**
    * Get the day number from an ON column string, 0 if no day.
    */
    TzDatabase.prototype.parseOnDay = function (on, onType) {
        switch (onType) {
            case 0 /* DayNum */:
                return parseInt(on, 10);
            case 3 /* LeqX */:
                return parseInt(on.substr(on.indexOf("<=") + 2), 10);
            case 2 /* GreqX */:
                return parseInt(on.substr(on.indexOf(">=") + 2), 10);

            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return 0;
                }
        }
    };

    /**
    * Get the day-of-week from an ON column string, Sunday if not present.
    */
    TzDatabase.prototype.parseOnWeekDay = function (on) {
        for (var i = 0; i < 7; i++) {
            if (on.indexOf(TzDayNames[i]) !== -1) {
                return i;
            }
        }

        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            return 0 /* Sunday */;
        }
    };

    /**
    * Parse the AT column of a rule info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseAtType = function (at) {
        switch (at) {
            case "s":
                return 0 /* Standard */;
            case "u":
                return 2 /* Utc */;
            case "g":
                return 2 /* Utc */;
            case "z":
                return 2 /* Utc */;
            case "w":
                return 1 /* Wall */;
            case "":
                return 1 /* Wall */;
            case null:
                return 1 /* Wall */;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return 1 /* Wall */;
                }
        }
    };
    TzDatabase._instance = null;
    return TzDatabase;
})();
exports.TzDatabase = TzDatabase;

/**
* Sanity check on data. Returns min/max values.
*/
function validateData(data) {
    var i;
    var result = {
        minDstSave: null,
        maxDstSave: null,
        minGmtOff: null,
        maxGmtOff: null
    };

    /* istanbul ignore if */
    if (typeof (data) !== "object") {
        throw new Error("data is not an object");
    }

    /* istanbul ignore if */
    if (!data.hasOwnProperty("rules")) {
        throw new Error("data has no rules property");
    }

    /* istanbul ignore if */
    if (!data.hasOwnProperty("zones")) {
        throw new Error("data has no zones property");
    }

    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                /* istanbul ignore if */
                if (!data.zones.hasOwnProperty(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" links to \"" + zoneArr + "\" but that doesn\'t exist");
                }
            } else {
                /* istanbul ignore if */
                if (!Array.isArray(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" is neither a string nor an array");
                }
                for (i = 0; i < zoneArr.length; i++) {
                    var entry = zoneArr[i];

                    /* istanbul ignore if */
                    if (!Array.isArray(entry)) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
                    }

                    /* istanbul ignore if */
                    if (entry.length !== 4) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
                    }

                    /* istanbul ignore if */
                    if (typeof entry[0] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
                    }
                    var gmtoff = math.filterFloat(entry[0]);

                    /* istanbul ignore if */
                    if (isNaN(gmtoff)) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
                    }

                    /* istanbul ignore if */
                    if (typeof entry[1] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
                    }

                    /* istanbul ignore if */
                    if (typeof entry[2] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
                    }

                    /* istanbul ignore if */
                    if (typeof entry[3] !== "string" && entry[3] !== null) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
                    }

                    /* istanbul ignore if */
                    if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
                    }
                    if (result.maxGmtOff === null || gmtoff > result.maxGmtOff) {
                        result.maxGmtOff = gmtoff;
                    }
                    if (result.minGmtOff === null || gmtoff < result.minGmtOff) {
                        result.minGmtOff = gmtoff;
                    }
                }
            }
        }
    }

    for (var ruleName in data.rules) {
        if (data.rules.hasOwnProperty(ruleName)) {
            var ruleArr = data.rules[ruleName];

            /* istanbul ignore if */
            if (!Array.isArray(ruleArr)) {
                throw new Error("Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (i = 0; i < ruleArr.length; i++) {
                var rule = ruleArr[i];

                /* istanbul ignore if */
                if (!Array.isArray(rule)) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
                }

                /* istanbul ignore if */
                if (rule.length < 8) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
                }
                for (var j = 0; j < rule.length; j++) {
                    /* istanbul ignore if */
                    if (j !== 5 && typeof rule[j] !== "string") {
                        throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
                    }
                }

                /* istanbul ignore if */
                if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
                }

                /* istanbul ignore if */
                if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
                }

                /* istanbul ignore if */
                if (!TzMonthNames.hasOwnProperty(rule[3])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
                }

                /* istanbul ignore if */
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1 && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
                }

                /* istanbul ignore if */
                if (!Array.isArray(rule[5])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
                }

                /* istanbul ignore if */
                if (rule[5].length !== 4) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
                }

                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][0], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
                }

                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][1], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
                }

                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][2], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
                }

                /* istanbul ignore if */
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w" && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
                }
                var save = parseInt(rule[6], 10);

                /* istanbul ignore if */
                if (isNaN(save)) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
                }
                if (save !== 0) {
                    if (result.maxDstSave === null || save > result.maxDstSave) {
                        result.maxDstSave = save;
                    }
                    if (result.minDstSave === null || save < result.minDstSave) {
                        result.minDstSave = save;
                    }
                }
            }
        }
    }

    return result;
}
//# sourceMappingURL=tz-database.js.map

},{"./basics":1,"./duration":3,"./math":10,"./timezone-data.json":14,"assert":19,"source-map-support":38,"util":27}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":27}],20:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":21,"ieee754":22}],21:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],22:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],23:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],24:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("VCmEsw"))
},{"VCmEsw":25}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],26:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],27:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("VCmEsw"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":26,"VCmEsw":25,"inherits":23}],28:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":33,"./source-map/source-map-generator":34,"./source-map/source-node":35}],29:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":36,"amdefine":37}],30:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string.
   */
  exports.decode = function base64VLQ_decode(aStr) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    return {
      value: fromVLQSigned(result),
      rest: aStr.slice(i)
    };
  };

});

},{"./base64":31,"amdefine":37}],31:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":37}],32:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the next
    //      closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return null.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return aHaystack[mid];
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return aHaystack[mid];
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0
        ? null
        : aHaystack[aLow];
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the next lowest value checked if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    return aHaystack.length > 0
      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
      : null;
  };

});

},{"amdefine":37}],33:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.slice()
        .sort(util.compareByGeneratedPositions);
      smc.__originalMappings = aSourceMap._mappings.slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            // Original source.
            temp = base64VLQ.decode(str);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              // Original name.
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var mapping = this._findMapping(needle,
                                      this._generatedMappings,
                                      "generatedLine",
                                      "generatedColumn",
                                      util.compareByGeneratedPositions);

      if (mapping) {
        var source = util.getArg(mapping, 'source', null);
        if (source && this.sourceRoot) {
          source = util.join(this.sourceRoot, source);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mapping = this._findMapping(needle,
                                      this._originalMappings,
                                      "originalLine",
                                      "originalColumn",
                                      util.compareByOriginalPositions);

      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }

      return {
        line: null,
        column: null
      };
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source && sourceRoot) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":29,"./base64-vlq":30,"./binary-search":32,"./util":36,"amdefine":37}],34:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. To create a new one, you must pass an object
   * with the following properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: An optional root for all URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    this._file = util.getArg(aArgs, 'file');
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = [];
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source) {
          newMapping.source = mapping.source;
          if (sourceRoot) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      this._validateMapping(generated, original, source, name);

      if (source && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.push({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent !== null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (!aSourceFile) {
        aSourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "aSourceFile" relative if an absolute Url is passed.
      if (sourceRoot) {
        aSourceFile = util.relative(sourceRoot, aSourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "aSourceFile"
      this._mappings.forEach(function (mapping) {
        if (mapping.source === aSourceFile && mapping.originalLine) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source !== null) {
            // Copy mapping
            if (sourceRoot) {
              mapping.source = util.relative(sourceRoot, original.source);
            } else {
              mapping.source = original.source;
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name !== null && mapping.name !== null) {
              // Only use the identifier name if it's an identifier
              // in both SourceMaps
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          if (sourceRoot) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      // The mappings must be guaranteed to be in sorted order before we start
      // serializing them or else the generated line numbers (which are defined
      // via the ';' separators) will be all messed up. Note: it might be more
      // performant to maintain the sorting as we insert them, rather than as we
      // serialize them, but the big O is the same either way.
      this._mappings.sort(util.compareByGeneratedPositions);

      for (var i = 0, len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        file: this._file,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._sourceRoot) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":29,"./base64-vlq":30,"./util":36,"amdefine":37}],35:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine === undefined ? null : aLine;
    this.column = aColumn === undefined ? null : aColumn;
    this.source = aSource === undefined ? null : aSource;
    this.name = aName === undefined ? null : aName;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // The generated code
      // Processed fragments are removed from this array.
      var remainingLines = aGeneratedCode.split('\n');

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping === null) {
          // We add the generated code until the first mapping
          // to the SourceNode without any mapping.
          // Each line is added as separate string.
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(remainingLines.shift() + "\n");
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[0];
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
        } else {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate full lines with "lastMapping"
            do {
              code += remainingLines.shift() + "\n";
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } while (lastGeneratedLine < mapping.generatedLine);
            // When we reached the correct line, we add code until we
            // reach the correct column too.
            if (lastGeneratedColumn < mapping.generatedColumn) {
              var nextLine = remainingLines[0];
              code += nextLine.substr(0, mapping.generatedColumn);
              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            // Create the SourceNode.
            addMappingWithCode(lastMapping, code);
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
          }
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      // Associate the remaining code in the current line with "lastMapping"
      // and add the remaining lines without any mapping
      addMappingWithCode(lastMapping, remainingLines.join("\n"));

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  mapping.source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk instanceof SourceNode) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild instanceof SourceNode) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i] instanceof SourceNode) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      chunk.split('').forEach(function (ch) {
        if (ch === '\n') {
          generated.line++;
          generated.column = 0;
        } else {
          generated.column++;
        }
      });
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":34,"./util":36,"amdefine":37}],36:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
  var dataUrlRegexp = /^data:.+\,.+/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[3],
      host: match[4],
      port: match[6],
      path: match[7]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = aParsedUrl.scheme + "://";
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + "@"
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  function join(aRoot, aPath) {
    var url;

    if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
      url.path = aPath;
      return urlGenerate(url);
    }

    return aRoot.replace(/\/$/, '') + '/' + aPath;
  }
  exports.join = join;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function relative(aRoot, aPath) {
    aRoot = aRoot.replace(/\/$/, '');

    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":37}],37:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 0.1.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                process.nextTick(function () {
                    callback.apply(null, deps);
                });
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require("VCmEsw"),"/..\\node_modules\\source-map-support\\node_modules\\source-map\\node_modules\\amdefine\\amdefine.js")
},{"VCmEsw":25,"path":24}],38:[function(require,module,exports){
(function (process,Buffer){
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var path = require('path');
var fs = require('fs');

// Only install once if called multiple times
var alreadyInstalled = false;

// If true, the caches are reset before a stack trace formatting operation
var emptyCacheBetweenOperations = false;

// Maps a file path to a string containing the file contents
var fileContentsCache = {};

// Maps a file path to a source map for that file
var sourceMapCache = {};

function isInBrowser() {
  return typeof window !== 'undefined';
}

function retrieveFile(path) {
  if (path in fileContentsCache) {
    return fileContentsCache[path];
  }

  try {
    // Use SJAX if we are in the browser
    if (isInBrowser()) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path, false);
      xhr.send(null);
      var contents = xhr.readyState === 4 ? xhr.responseText : null;
    }

    // Otherwise, use the filesystem
    else {
      var contents = fs.readFileSync(path, 'utf8');
    }
  } catch (e) {
    var contents = null;
  }

  return fileContentsCache[path] = contents;
}

// Support URLs relative to a directory, but be careful about a protocol prefix
// in case we are in the browser (i.e. directories may start with "http://")
function supportRelativeURL(file, url) {
  if (!file) return url;
  var dir = path.dirname(file);
  var match = /^\w+:\/\/[^\/]*/.exec(dir);
  var protocol = match ? match[0] : '';
  return protocol + path.resolve(dir.slice(protocol.length), url);
}

function retrieveSourceMapURL(source) {
  var fileData;

  if (isInBrowser()) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', source, false);
    xhr.send(null);
    fileData = xhr.readyState === 4 ? xhr.responseText : null;

    // Support providing a sourceMappingURL via the SourceMap header
    var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
                          xhr.getResponseHeader("X-SourceMap");
    if (sourceMapHeader) {
      return sourceMapHeader;
    }
  }

  // Get the URL of the source map
  fileData = retrieveFile(source);
  var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileData);
  if (!match) return null;
  return match[1];
};

// Can be overridden by the retrieveSourceMap option to install. Takes a
// generated source filename; returns a {map, optional url} object, or null if
// there is no source map.  The map field may be either a string or the parsed
// JSON object (ie, it must be a valid argument to the SourceMapConsumer
// constructor).
function retrieveSourceMap(source) {
  var sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) return null;

  // Read the contents of the source map
  var sourceMapData;
  var dataUrlPrefix = "data:application/json;base64,";
  if (sourceMappingURL.slice(0, dataUrlPrefix.length).toLowerCase() == dataUrlPrefix) {
    // Support source map URL as a data url
    sourceMapData = new Buffer(sourceMappingURL.slice(dataUrlPrefix.length), "base64").toString();
    sourceMappingURL = null;
  } else {
    // Support source map URLs relative to the source URL
    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
    sourceMapData = retrieveFile(sourceMappingURL, 'utf8');
  }

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: sourceMapData
  };
}

function mapSourcePosition(position) {
  var sourceMap = sourceMapCache[position.source];
  if (!sourceMap) {
    // Call the (overrideable) retrieveSourceMap function to get the source map.
    var urlAndMap = retrieveSourceMap(position.source);
    if (urlAndMap) {
      sourceMap = sourceMapCache[position.source] = {
        url: urlAndMap.url,
        map: new SourceMapConsumer(urlAndMap.map)
      };

      // Load all sources stored inline with the source map into the file cache
      // to pretend like they are already loaded. They may not exist on disk.
      if (sourceMap.map.sourcesContent) {
        sourceMap.map.sources.forEach(function(source, i) {
          var contents = sourceMap.map.sourcesContent[i];
          if (contents) {
            var url = supportRelativeURL(sourceMap.url, source);
            fileContentsCache[url] = contents;
          }
        });
      }
    }
  }

  // Resolve the source URL relative to the URL of the source map
  if (sourceMap) {
    var originalPosition = sourceMap.map.originalPositionFor(position);

    // Only return the original position if a matching line was found. If no
    // matching line is found then we return position instead, which will cause
    // the stack trace to print the path and line for the compiled file. It is
    // better to give a precise location in the compiled file than a vague
    // location in the original file.
    if (originalPosition.source !== null) {
      originalPosition.source = supportRelativeURL(
        sourceMap.url, originalPosition.source);
      return originalPosition;
    }
  }

  return position;
}

// Parses code generated by FormatEvalOrigin(), a function inside V8:
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
function mapEvalOrigin(origin) {
  // Most eval() calls are in this format
  var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
  if (match) {
    var position = mapSourcePosition({
      source: match[2],
      line: match[3],
      column: match[4] - 1
    });
    return 'eval at ' + match[1] + ' (' + position.source + ':' +
      position.line + ':' + (position.column + 1) + ')';
  }

  // Parse nested eval() calls using recursion
  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
  if (match) {
    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
  }

  // Make sure we still return useful information if we didn't find anything
  return origin;
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
  var fileName;
  var fileLocation = "";
  if (this.isNative()) {
    fileLocation = "native";
  } else {
    fileName = this.getScriptNameOrSourceURL();
    if (!fileName && this.isEval()) {
      fileLocation = this.getEvalOrigin();
      fileLocation += ", ";  // Expecting source position to follow.
    }

    if (fileName) {
      fileLocation += fileName;
    } else {
      // Source code does not originate from a file and is not native, but we
      // can still get the source position inside the source string, e.g. in
      // an eval string.
      fileLocation += "<anonymous>";
    }
    var lineNumber = this.getLineNumber();
    if (lineNumber != null) {
      fileLocation += ":" + lineNumber;
      var columnNumber = this.getColumnNumber();
      if (columnNumber) {
        fileLocation += ":" + columnNumber;
      }
    }
  }

  var line = "";
  var functionName = this.getFunctionName();
  var addSuffix = true;
  var isConstructor = this.isConstructor();
  var isMethodCall = !(this.isToplevel() || isConstructor);
  if (isMethodCall) {
    var typeName = this.getTypeName();
    var methodName = this.getMethodName();
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += typeName + ".";
      }
      line += functionName;
      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
        line += " [as " + methodName + "]";
      }
    } else {
      line += typeName + "." + (methodName || "<anonymous>");
    }
  } else if (isConstructor) {
    line += "new " + (functionName || "<anonymous>");
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
    addSuffix = false;
  }
  if (addSuffix) {
    line += " (" + fileLocation + ")";
  }
  return line;
}

function cloneCallSite(frame) {
  var object = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
    object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
  });
  object.toString = CallSiteToString;
  return object;
}

function wrapCallSite(frame) {
  // Most call sites will return the source file from getFileName(), but code
  // passed to eval() ending in "//# sourceURL=..." will return the source file
  // from getScriptNameOrSourceURL() instead
  var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    var position = mapSourcePosition({
      source: source,
      line: frame.getLineNumber(),
      column: frame.getColumnNumber() - 1
    });
    frame = cloneCallSite(frame);
    frame.getFileName = function() { return position.source; };
    frame.getLineNumber = function() { return position.line; };
    frame.getColumnNumber = function() { return position.column + 1; };
    frame.getScriptNameOrSourceURL = function() { return position.source; };
    return frame;
  }

  // Code called using eval() needs special handling
  var origin = frame.isEval() && frame.getEvalOrigin();
  if (origin) {
    origin = mapEvalOrigin(origin);
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = function() { return origin; };
    return frame;
  }

  // If we get here then we were unable to change the source position
  return frame;
}

// This function is part of the V8 stack trace API, for more info see:
// http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
function prepareStackTrace(error, stack) {
  if (emptyCacheBetweenOperations) {
    fileContentsCache = {};
    sourceMapCache = {};
  }
  return error + stack.map(function(frame) {
    return '\n    at ' + wrapCallSite(frame);
  }).join('');
}

// Generate position and snippet of original source with pointer
function getErrorSource(error) {
  var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
  if (match) {
    var source = match[1];
    var line = +match[2];
    var column = +match[3];

    // Support the inline sourceContents inside the source map
    var contents = fileContentsCache[source];

    // Support files on disk
    if (!contents && fs.existsSync(source)) {
      contents = fs.readFileSync(source, 'utf8');
    }

    // Format the line from the original source code like node does
    if (contents) {
      var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
      if (code) {
        return '\n' + source + ':' + line + '\n' + code + '\n' +
          new Array(column).join(' ') + '^';
      }
    }
  }
  return null;
}

// Mimic node's stack trace printing when an exception escapes the process
function handleUncaughtExceptions(error) {
  if (!error || !error.stack) {
    console.log('Uncaught exception:', error);
  } else {
    var source = getErrorSource(error);
    if (source !== null) console.log(source);
    console.log(error.stack);
  }
  process.exit(1);
}

exports.wrapCallSite = wrapCallSite;
exports.getErrorSource = getErrorSource;
exports.mapSourcePosition = mapSourcePosition;
exports.retrieveSourceMap = retrieveSourceMap;

exports.install = function(options) {
  if (!alreadyInstalled) {
    alreadyInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;

    // Configure options
    options = options || {};
    var installHandler = 'handleUncaughtExceptions' in options ?
      options.handleUncaughtExceptions : true;
    emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
      options.emptyCacheBetweenOperations : false;

    // Allow sources to be found by methods other than reading the files
    // directly from disk.
    if (options.retrieveFile)
      retrieveFile = options.retrieveFile;

    // Allow source maps to be found by methods other than reading the files
    // directly from disk.
    if (options.retrieveSourceMap)
      retrieveSourceMap = options.retrieveSourceMap;

    // Provide the option to not install the uncaught exception handler. This is
    // to support other uncaught exception handlers (in test frameworks, for
    // example). If this handler is not installed and there are no other uncaught
    // exception handlers, uncaught exceptions will be caught by node's built-in
    // exception handler and the process will still be terminated. However, the
    // generated JavaScript code will be shown above the stack trace instead of
    // the original source code.
    if (installHandler && !isInBrowser()) {
      process.on('uncaughtException', handleUncaughtExceptions);
    }
  }
};

}).call(this,require("VCmEsw"),require("buffer").Buffer)
},{"VCmEsw":25,"buffer":20,"fs":18,"path":24,"source-map":28}]},{},[4]);
return require("timezonecomplete");

}));
