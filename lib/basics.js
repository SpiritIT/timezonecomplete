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
            // Week 1 of previous month
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

function secondInDay(hour, minute, second) {
    return (((hour * 60) + minute) * 60) + second;
}
exports.secondInDay = secondInDay;

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
