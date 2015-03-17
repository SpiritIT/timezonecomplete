/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
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
    TimeUnit[TimeUnit["Millisecond"] = 0] = "Millisecond";
    TimeUnit[TimeUnit["Second"] = 1] = "Second";
    TimeUnit[TimeUnit["Minute"] = 2] = "Minute";
    TimeUnit[TimeUnit["Hour"] = 3] = "Hour";
    TimeUnit[TimeUnit["Day"] = 4] = "Day";
    TimeUnit[TimeUnit["Week"] = 5] = "Week";
    TimeUnit[TimeUnit["Month"] = 6] = "Month";
    TimeUnit[TimeUnit["Year"] = 7] = "Year";
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
        case 0 /* Millisecond */: return 1;
        case 1 /* Second */: return 1000;
        case 2 /* Minute */: return 60000;
        case 3 /* Hour */: return 3600000;
        case 4 /* Day */: return 86400000;
        case 5 /* Week */: return 604800000;
        case 6 /* Month */: return 2592000000;
        case 7 /* Year */: return 31536000000;
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
    }
    else if (year % 100 !== 0) {
        return true;
    }
    else if (year % 400 !== 0) {
        return false;
    }
    else {
        return true;
    }
}
exports.isLeapYear = isLeapYear;
/**
 * The days in a given year
 */
function daysInYear(year) {
    return (isLeapYear(year) ? 366 : 365);
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
            return (isLeapYear(year) ? 29 : 28);
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
    assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
    var yearDay = 0;
    for (var i = 1; i < month; i++) {
        yearDay += daysInMonth(year, i);
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
    var endOfMonth = new TimeStruct(year, month, daysInMonth(year, month));
    var endOfMonthMillis = timeToUnixNoLeapSecs(endOfMonth);
    var endOfMonthWeekDay = weekDayNoLeapSecs(endOfMonthMillis);
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
    var beginOfMonthMillis = timeToUnixNoLeapSecs(beginOfMonth);
    var beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonthMillis);
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
    var startMillis = timeToUnixNoLeapSecs(start);
    var startWeekDay = weekDayNoLeapSecs(startMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    assert(start.day + diff <= daysInMonth(year, month), "The given month has no such weekday");
    return start.day + diff;
}
exports.weekDayOnOrAfter = weekDayOnOrAfter;
/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * Throws if the month has no such day.
 */
function weekDayOnOrBefore(year, month, day, weekDay) {
    var start = new TimeStruct(year, month, day);
    var startMillis = timeToUnixNoLeapSecs(start);
    var startWeekDay = weekDayNoLeapSecs(startMillis);
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
    var firstThursday = firstWeekDayOfMonth(year, month, 4 /* Thursday */);
    var firstMonday = firstWeekDayOfMonth(year, month, 1 /* Monday */);
    // Corner case: check if we are in week 1 or last week of previous month
    if (day < firstMonday) {
        if (firstThursday < firstMonday) {
            // Week 1
            return 1;
        }
        else {
            // Last week of previous month
            if (month > 1) {
                // Default case
                return weekOfMonth(year, month - 1, 31);
            }
            else {
                // January
                return weekOfMonth(year - 1, 12, 31);
            }
        }
    }
    var lastMonday = lastWeekDayOfMonth(year, month, 1 /* Monday */);
    var lastThursday = lastWeekDayOfMonth(year, month, 4 /* Thursday */);
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
    var result = weekDayOnOrAfter(year, 1, 1, 1 /* Monday */) - 1;
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
    var doy = dayOfYear(year, month, day);
    // check end-of-year corner case: may be week 1 of next year
    if (doy >= dayOfYear(year, 12, 29)) {
        var nextYearWeekOne = getWeekOneDayOfYear(year + 1);
        if (nextYearWeekOne > 4 && nextYearWeekOne <= doy) {
            return 1;
        }
    }
    // check beginning-of-year corner case
    var thisYearWeekOne = getWeekOneDayOfYear(year);
    if (thisYearWeekOne > 4) {
        // week 1 is at end of last year
        var weekTwo = thisYearWeekOne + 7 - daysInYear(year - 1);
        if (doy < weekTwo) {
            return 1;
        }
        else {
            return Math.floor((doy - weekTwo) / 7) + 2;
        }
    }
    // Week 1 is entirely inside this year.
    if (doy < thisYearWeekOne) {
        // The date is part of the last week of prev year.
        return weekNumber(year - 1, 12, 31);
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
        while (temp >= daysInYear(year)) {
            temp -= daysInYear(year);
            year++;
        }
        result.year = year;
        month = 1;
        while (temp >= daysInMonth(year, month)) {
            temp -= daysInMonth(year, month);
            month++;
        }
        result.month = month;
        result.day = temp + 1;
    }
    else {
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
        while (temp < -daysInYear(year)) {
            temp += daysInYear(year);
            year--;
        }
        result.year = year;
        month = 12;
        while (temp < -daysInMonth(year, month)) {
            temp += daysInMonth(year, month);
            month--;
        }
        result.month = month;
        result.day = temp + 1 + daysInMonth(year, month);
    }
    return result;
}
exports.unixToTimeNoLeapSecs = unixToTimeNoLeapSecs;
function timeToUnixNoLeapSecs(a, month, day, hour, minute, second, milli) {
    if (a === void 0) { a = 1970; }
    if (month === void 0) { month = 1; }
    if (day === void 0) { day = 1; }
    if (hour === void 0) { hour = 0; }
    if (minute === void 0) { minute = 0; }
    if (second === void 0) { second = 0; }
    if (milli === void 0) { milli = 0; }
    assert(typeof (a) === "object" || typeof (a) === "number", "Please give either a TimeStruct or a number as first argument.");
    if (typeof (a) === "object") {
        var tm = a;
        assert(tm.validate(), "tm invalid");
        return timeToUnixNoLeapSecs(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli);
    }
    else {
        var year = a;
        assert(month >= 1 && month <= 12, "Month out of range");
        assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
        assert(hour >= 0 && hour <= 23, "hour out of range");
        assert(minute >= 0 && minute <= 59, "minute out of range");
        assert(second >= 0 && second <= 59, "second out of range");
        assert(milli >= 0 && milli <= 999, "milli out of range");
        return milli + 1000 * (second + minute * 60 + hour * 3600 + dayOfYear(year, month, day) * 86400 + (year - 1970) * 31536000 + Math.floor((year - 1969) / 4) * 86400 - Math.floor((year - 1901) / 100) * 86400 + Math.floor((year - 1900 + 299) / 400) * 86400);
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
    function TimeStruct(
        /**
         * Year, 1970-...
         */
        year, 
        /**
         * Month 1-12
         */
        month, 
        /**
         * Day of month, 1-31
         */
        day, 
        /**
         * Hour 0-23
         */
        hour, 
        /**
         * Minute 0-59
         */
        minute, 
        /**
         * Seconds, 0-59
         */
        second, 
        /**
         * Milliseconds 0-999
         */
        milli) {
        if (year === void 0) { year = 1970; }
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (milli === void 0) { milli = 0; }
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
        return unixToTimeNoLeapSecs(unixMillis);
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
        }
        else {
            return new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        }
    };
    /**
     * Returns a TimeStruct from an ISO 8601 string WITHOUT time zone
     */
    TimeStruct.fromString = function (s) {
        try {
            var year = 1970;
            var month = 1;
            var day = 1;
            var hour = 0;
            var minute = 0;
            var second = 0;
            var fractionMillis = 0;
            var lastUnit = 7 /* Year */;
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
                    lastUnit = 7 /* Year */;
                }
                if (split[0].length >= 8) {
                    month = parseInt(split[0].substr(4, 2), 10);
                    day = parseInt(split[0].substr(6, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 4 /* Day */;
                }
                if (split[0].length >= 10) {
                    hour = parseInt(split[0].substr(8, 2), 10);
                    lastUnit = 3 /* Hour */;
                }
                if (split[0].length >= 12) {
                    minute = parseInt(split[0].substr(10, 2), 10);
                    lastUnit = 2 /* Minute */;
                }
                if (split[0].length >= 14) {
                    second = parseInt(split[0].substr(12, 2), 10);
                    lastUnit = 1 /* Second */;
                }
            }
            else {
                assert(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Invalid ISO string");
                var dateAndTime = [];
                if (s.indexOf("T") !== -1) {
                    dateAndTime = split[0].split("T");
                }
                else if (s.length > 10) {
                    dateAndTime = [split[0].substr(0, 10), split[0].substr(10)];
                }
                else {
                    dateAndTime = [split[0], ""];
                }
                assert([4, 10].indexOf(dateAndTime[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
                if (dateAndTime[0].length >= 4) {
                    year = parseInt(dateAndTime[0].substr(0, 4), 10);
                    lastUnit = 7 /* Year */;
                }
                if (dateAndTime[0].length >= 10) {
                    month = parseInt(dateAndTime[0].substr(5, 2), 10);
                    day = parseInt(dateAndTime[0].substr(8, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 4 /* Day */;
                }
                if (dateAndTime[1].length >= 2) {
                    hour = parseInt(dateAndTime[1].substr(0, 2), 10);
                    lastUnit = 3 /* Hour */;
                }
                if (dateAndTime[1].length >= 5) {
                    minute = parseInt(dateAndTime[1].substr(3, 2), 10);
                    lastUnit = 2 /* Minute */;
                }
                if (dateAndTime[1].length >= 8) {
                    second = parseInt(dateAndTime[1].substr(6, 2), 10);
                    lastUnit = 1 /* Second */;
                }
            }
            // parse fractional part
            if (split.length > 1 && split[1].length > 0) {
                var fraction = parseFloat("0." + split[1]);
                switch (lastUnit) {
                    case 7 /* Year */:
                        {
                            fractionMillis = daysInYear(year) * 86400000 * fraction;
                        }
                        break;
                    case 4 /* Day */:
                        {
                            fractionMillis = 86400000 * fraction;
                        }
                        break;
                    case 3 /* Hour */:
                        {
                            fractionMillis = 3600000 * fraction;
                        }
                        break;
                    case 2 /* Minute */:
                        {
                            fractionMillis = 60000 * fraction;
                        }
                        break;
                    case 1 /* Second */:
                        {
                            fractionMillis = 1000 * fraction;
                        }
                        break;
                    case 0 /* Millisecond */:
                        {
                            fractionMillis = fraction;
                        }
                        break;
                }
            }
            // combine main and fractional part
            var unixMillis = timeToUnixNoLeapSecs(year, month, day, hour, minute, second);
            unixMillis = Math.floor(unixMillis + fractionMillis);
            return unixToTimeNoLeapSecs(unixMillis);
        }
        catch (e) {
            throw new Error("Invalid ISO 8601 string: \"" + s + "\": " + e.message);
        }
    };
    /**
     * Validate a TimeStruct, returns false if invalid.
     */
    TimeStruct.prototype.validate = function () {
        return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000 && typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12 && typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1 && this.day <= daysInMonth(this.year, this.month) && typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23 && typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59 && typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 59 && typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0 && this.milli <= 999);
    };
    /**
     * The day-of-year 0-365
     */
    TimeStruct.prototype.yearDay = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return dayOfYear(this.year, this.month, this.day);
    };
    /**
     * Returns this time as a unix millisecond timestamp
     * Does NOT take leap seconds into account.
     */
    TimeStruct.prototype.toUnixNoLeapSecs = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
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
        return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2ljcy50cyJdLCJuYW1lcyI6WyJXZWVrRGF5IiwiVGltZVVuaXQiLCJ0aW1lVW5pdFRvTWlsbGlzZWNvbmRzIiwiaXNMZWFwWWVhciIsImRheXNJblllYXIiLCJkYXlzSW5Nb250aCIsImRheU9mWWVhciIsImxhc3RXZWVrRGF5T2ZNb250aCIsImZpcnN0V2Vla0RheU9mTW9udGgiLCJ3ZWVrRGF5T25PckFmdGVyIiwid2Vla0RheU9uT3JCZWZvcmUiLCJ3ZWVrT2ZNb250aCIsImdldFdlZWtPbmVEYXlPZlllYXIiLCJ3ZWVrTnVtYmVyIiwiYXNzZXJ0VW5peFRpbWVzdGFtcCIsInVuaXhUb1RpbWVOb0xlYXBTZWNzIiwidGltZVRvVW5peE5vTGVhcFNlY3MiLCJ3ZWVrRGF5Tm9MZWFwU2VjcyIsInNlY29uZE9mRGF5IiwiVGltZVN0cnVjdCIsIlRpbWVTdHJ1Y3QuY29uc3RydWN0b3IiLCJUaW1lU3RydWN0LmZyb21Vbml4IiwiVGltZVN0cnVjdC5mcm9tRGF0ZSIsIlRpbWVTdHJ1Y3QuZnJvbVN0cmluZyIsIlRpbWVTdHJ1Y3QudmFsaWRhdGUiLCJUaW1lU3RydWN0LnllYXJEYXkiLCJUaW1lU3RydWN0LnRvVW5peE5vTGVhcFNlY3MiLCJUaW1lU3RydWN0LmVxdWFscyIsIlRpbWVTdHJ1Y3QubGVzc1RoYW4iLCJUaW1lU3RydWN0LmNsb25lIiwiVGltZVN0cnVjdC52YWx1ZU9mIiwiVGltZVN0cnVjdC50b1N0cmluZyIsIlRpbWVTdHJ1Y3QuaW5zcGVjdCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILEFBRUEsMkNBRjJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLElBQU8sYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7QUFFaEQsSUFBTyxJQUFJLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDaEMsSUFBTyxP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RUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUN4REEsTUFBTUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQTtRQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsRUFBRUEsRUFBRUEsbUJBQW1CQSxDQUFDQSxDQUFDQTtRQUNyREEsTUFBTUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsTUFBTUEsSUFBSUEsRUFBRUEsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsTUFBTUEsSUFBSUEsRUFBRUEsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsR0FBR0EsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUN6REEsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FDckJBLE1BQU1BLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLEtBQUtBLEdBQ3hFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxHQUNoRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEs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b0JBQzFCQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDM0NBLFFBQVFBLEdBQUdBLFlBQWFBLENBQUNBO2dCQUMxQkEsQ0FBQ0E7Z0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUMxQkEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzVDQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSwyRUFBMkVBO29CQUN0SEEsUUFBUUEsR0FBR0EsV0FBWUEsQ0FBQ0E7Z0JBQ3pCQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDM0NBLFFBQVFBLEdBQUdBLFlBQWFBLENBQUNBO2dCQUMxQkEsQ0FBQ0E7Z0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLEVBQUVBLENBQUNBLENBQUNB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LENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLEVBQUVBLElBQ3ZIQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUMzRkEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFDOUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLElBQ2xIQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxFQUFFQSxJQUM1SEEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsRUFBRUEsSUFDNUhBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQ25HQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxHQUFHQSxDQUNuQkEsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFREw7O09BRUdBO0lBQ0lBLDRCQUFPQSxHQUFkQTtRQUNDTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFFQSw0QkFBNEJBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3hFQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNuREEsQ0FBQ0E7SUFFRE47OztPQUdHQTtJQUNJQSxxQ0FBZ0JBLEdBQXZCQTtRQUNDTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFFQSw0QkFBNEJBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3hFQSxNQUFNQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQy9HQSxDQUFDQTtJQUVEUDs7T0FFR0E7SUFDSUEsMkJBQU1BLEdBQWJBLFVBQWNBLEtBQWlCQTtRQUM5QlEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFDNUJBLElBQUlBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLEtBQUtBLElBQzFCQSxJQUFJQSxDQUFDQSxHQUFHQSxLQUFLQSxLQUFLQSxDQUFDQSxHQUFHQSxJQUN0QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFDeEJBLElBQUlBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLENBQUNBLE1BQU1BLElBQzVCQSxJQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxDQUFDQSxNQUFNQSxJQUM1QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURSOztPQUVHQTtJQUNJQSw2QkFBUUEsR0FBZkEsVUFBZ0JBLEtBQWlCQTtRQUNoQ1MsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVNVCwwQkFBS0EsR0FBWkE7UUFDQ1UsTUFBTUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekdBLENBQUNBO0lBRU1WLDRCQUFPQSxHQUFkQTtRQUNDVyxNQUFNQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQy9HQSxDQUFDQTtJQUVEWDs7T0FFR0E7SUFDSUEsNkJBQVFBLEdBQWZBO1FBQ0NZLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQ25EQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUN0REEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FDcERBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQ3JEQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUN2REEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FDdkRBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQzNEQSxDQUFDQTtJQUVNWiw0QkFBT0EsR0FBZEE7UUFDQ2EsTUFBTUEsQ0FBQ0EsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDaERBLENBQUNBO0lBRUZiLGlCQUFDQTtBQUFEQSxDQWxSQSxBQWtSQ0EsSUFBQTtBQWxSWSxrQkFBVSxHQUFWLFVBa1JaLENBQUEiLCJmaWxlIjoibGliL2Jhc2ljcy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19