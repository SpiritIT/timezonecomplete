(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tc = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright(c) 2016 Spirit IT BV
 */
"use strict";
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = assert;

},{}],2:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */
"use strict";
var assert_1 = require("./assert");
var javascript_1 = require("./javascript");
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
    /**
     * End-of-enum marker, do not use
     */
    TimeUnit[TimeUnit["MAX"] = 8] = "MAX";
})(exports.TimeUnit || (exports.TimeUnit = {}));
var TimeUnit = exports.TimeUnit;
/**
 * Approximate number of milliseconds for a time unit.
 * A day is assumed to have 24 hours, a month is assumed to equal 30 days
 * and a year is set to 360 days (because 12 months of 30 days).
 *
 * @param unit	Time unit e.g. TimeUnit.Month
 * @returns	The number of milliseconds.
 */
function timeUnitToMilliseconds(unit) {
    switch (unit) {
        case TimeUnit.Millisecond: return 1;
        case TimeUnit.Second: return 1000;
        case TimeUnit.Minute: return 60 * 1000;
        case TimeUnit.Hour: return 60 * 60 * 1000;
        case TimeUnit.Day: return 86400000;
        case TimeUnit.Week: return 7 * 86400000;
        case TimeUnit.Month: return 30 * 86400000;
        case TimeUnit.Year: return 12 * 30 * 86400000;
        /* istanbul ignore next */
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
 * Time unit to lowercase string. If amount is specified, then the string is put in plural form
 * if necessary.
 * @param unit The unit
 * @param amount If this is unequal to -1 and 1, then the result is pluralized
 */
function timeUnitToString(unit, amount) {
    if (amount === void 0) { amount = 1; }
    var result = TimeUnit[unit].toLowerCase();
    if (amount === 1 || amount === -1) {
        return result;
    }
    else {
        return result + "s";
    }
}
exports.timeUnitToString = timeUnitToString;
function stringToTimeUnit(s) {
    var trimmed = s.trim().toLowerCase();
    for (var i = 0; i < TimeUnit.MAX; ++i) {
        var other = timeUnitToString(i, 1);
        if (other === trimmed || (other + "s") === trimmed) {
            return i;
        }
    }
    throw new Error("Unknown time unit string '" + s + "'");
}
exports.stringToTimeUnit = stringToTimeUnit;
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
    assert_1.default(month >= 1 && month <= 12, "Month out of range");
    assert_1.default(day >= 1 && day <= daysInMonth(year, month), "day out of range");
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
    var endOfMonth = new TimeStruct({ year: year, month: month, day: daysInMonth(year, month) });
    var endOfMonthWeekDay = weekDayNoLeapSecs(endOfMonth.unixMillis);
    var diff = weekDay - endOfMonthWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    return endOfMonth.components.day + diff;
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
    var beginOfMonth = new TimeStruct({ year: year, month: month, day: 1 });
    var beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonth.unixMillis);
    var diff = weekDay - beginOfMonthWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    return beginOfMonth.components.day + diff;
}
exports.firstWeekDayOfMonth = firstWeekDayOfMonth;
/**
 * Returns the day-of-month that is on the given weekday and which is >= the given day.
 * Throws if the month has no such day.
 */
function weekDayOnOrAfter(year, month, day, weekDay) {
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    assert_1.default(start.components.day + diff <= daysInMonth(year, month), "The given month has no such weekday");
    return start.components.day + diff;
}
exports.weekDayOnOrAfter = weekDayOnOrAfter;
/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * Throws if the month has no such day.
 */
function weekDayOnOrBefore(year, month, day, weekDay) {
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    assert_1.default(start.components.day + diff >= 1, "The given month has no such weekday");
    return start.components.day + diff;
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
    var firstThursday = firstWeekDayOfMonth(year, month, WeekDay.Thursday);
    var firstMonday = firstWeekDayOfMonth(year, month, WeekDay.Monday);
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
    var lastMonday = lastWeekDayOfMonth(year, month, WeekDay.Monday);
    var lastThursday = lastWeekDayOfMonth(year, month, WeekDay.Thursday);
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
    var result = weekDayOnOrAfter(year, 1, 1, WeekDay.Monday) - 1;
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
    assert_1.default(typeof (unixMillis) === "number", "number input expected");
    assert_1.default(!isNaN(unixMillis), "NaN not expected as input");
    assert_1.default(math.isInt(unixMillis), "Expect integer number for unix UTC timestamp");
}
/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 */
function unixToTimeNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);
    var temp = unixMillis;
    var result = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, milli: 0 };
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
/**
 * Fill you any missing time component parts, defaults are 1970-01-01T00:00:00.000
 */
function normalizeTimeComponents(components) {
    var input = {
        year: typeof components.year === "number" ? components.year : 1970,
        month: typeof components.month === "number" ? components.month : 1,
        day: typeof components.day === "number" ? components.day : 1,
        hour: typeof components.hour === "number" ? components.hour : 0,
        minute: typeof components.minute === "number" ? components.minute : 0,
        second: typeof components.second === "number" ? components.second : 0,
        milli: typeof components.milli === "number" ? components.milli : 0,
    };
    return input;
}
function timeToUnixNoLeapSecs(a, month, day, hour, minute, second, milli) {
    var components = (typeof a === "number" ? { year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli } : a);
    var input = normalizeTimeComponents(components);
    return input.milli + 1000 * (input.second + input.minute * 60 + input.hour * 3600 + dayOfYear(input.year, input.month, input.day) * 86400 +
        (input.year - 1970) * 31536000 + Math.floor((input.year - 1969) / 4) * 86400 -
        Math.floor((input.year - 1901) / 100) * 86400 + Math.floor((input.year - 1900 + 299) / 400) * 86400);
}
exports.timeToUnixNoLeapSecs = timeToUnixNoLeapSecs;
/**
 * Return the day-of-week.
 * This does NOT take leap seconds into account.
 */
function weekDayNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);
    var epochDay = WeekDay.Thursday;
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
     * Constructor implementation
     */
    function TimeStruct(a) {
        if (typeof a === "number") {
            this._unixMillis = a;
        }
        else {
            this._components = normalizeTimeComponents(a);
        }
    }
    /**
     * Returns a TimeStruct from the given year, month, day etc
     *
     * @param year	Year e.g. 1970
     * @param month	Month 1-12
     * @param day	Day 1-31
     * @param hour	Hour 0-23
     * @param minute	Minute 0-59
     * @param second	Second 0-59 (no leap seconds)
     * @param milli	Millisecond 0-999
     */
    TimeStruct.fromComponents = function (year, month, day, hour, minute, second, milli) {
        return new TimeStruct({ year: year, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli });
    };
    /**
     * Create a TimeStruct from a number of unix milliseconds
     * (backward compatibility)
     */
    TimeStruct.fromUnix = function (unixMillis) {
        return new TimeStruct(unixMillis);
    };
    /**
     * Create a TimeStruct from a JavaScript date
     *
     * @param d	The date
     * @param df	Which functions to take (getX() or getUTCX())
     */
    TimeStruct.fromDate = function (d, df) {
        if (df === javascript_1.DateFunctions.Get) {
            return new TimeStruct({
                year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
                hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), milli: d.getMilliseconds()
            });
        }
        else {
            return new TimeStruct({
                year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
                hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(), milli: d.getUTCMilliseconds()
            });
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
            var lastUnit = TimeUnit.Year;
            // separate any fractional part
            var split = s.trim().split(".");
            assert_1.default(split.length >= 1 && split.length <= 2, "Empty string or multiple dots.");
            // parse main part
            var isBasicFormat = (s.indexOf("-") === -1);
            if (isBasicFormat) {
                assert_1.default(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "ISO string in basic notation may only contain numbers before the fractional part");
                // remove any "T" separator
                split[0] = split[0].replace("T", "");
                assert_1.default([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
                if (split[0].length >= 4) {
                    year = parseInt(split[0].substr(0, 4), 10);
                    lastUnit = TimeUnit.Year;
                }
                if (split[0].length >= 8) {
                    month = parseInt(split[0].substr(4, 2), 10);
                    day = parseInt(split[0].substr(6, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = TimeUnit.Day;
                }
                if (split[0].length >= 10) {
                    hour = parseInt(split[0].substr(8, 2), 10);
                    lastUnit = TimeUnit.Hour;
                }
                if (split[0].length >= 12) {
                    minute = parseInt(split[0].substr(10, 2), 10);
                    lastUnit = TimeUnit.Minute;
                }
                if (split[0].length >= 14) {
                    second = parseInt(split[0].substr(12, 2), 10);
                    lastUnit = TimeUnit.Second;
                }
            }
            else {
                assert_1.default(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Invalid ISO string");
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
                assert_1.default([4, 10].indexOf(dateAndTime[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
                if (dateAndTime[0].length >= 4) {
                    year = parseInt(dateAndTime[0].substr(0, 4), 10);
                    lastUnit = TimeUnit.Year;
                }
                if (dateAndTime[0].length >= 10) {
                    month = parseInt(dateAndTime[0].substr(5, 2), 10);
                    day = parseInt(dateAndTime[0].substr(8, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = TimeUnit.Day;
                }
                if (dateAndTime[1].length >= 2) {
                    hour = parseInt(dateAndTime[1].substr(0, 2), 10);
                    lastUnit = TimeUnit.Hour;
                }
                if (dateAndTime[1].length >= 5) {
                    minute = parseInt(dateAndTime[1].substr(3, 2), 10);
                    lastUnit = TimeUnit.Minute;
                }
                if (dateAndTime[1].length >= 8) {
                    second = parseInt(dateAndTime[1].substr(6, 2), 10);
                    lastUnit = TimeUnit.Second;
                }
            }
            // parse fractional part
            if (split.length > 1 && split[1].length > 0) {
                var fraction = parseFloat("0." + split[1]);
                switch (lastUnit) {
                    case TimeUnit.Year:
                        {
                            fractionMillis = daysInYear(year) * 86400000 * fraction;
                        }
                        break;
                    case TimeUnit.Day:
                        {
                            fractionMillis = 86400000 * fraction;
                        }
                        break;
                    case TimeUnit.Hour:
                        {
                            fractionMillis = 3600000 * fraction;
                        }
                        break;
                    case TimeUnit.Minute:
                        {
                            fractionMillis = 60000 * fraction;
                        }
                        break;
                    case TimeUnit.Second:
                        {
                            fractionMillis = 1000 * fraction;
                        }
                        break;
                }
            }
            // combine main and fractional part
            year = math.roundSym(year);
            month = math.roundSym(month);
            day = math.roundSym(day);
            hour = math.roundSym(hour);
            minute = math.roundSym(minute);
            second = math.roundSym(second);
            var unixMillis = timeToUnixNoLeapSecs({ year: year, month: month, day: day, hour: hour, minute: minute, second: second });
            unixMillis = math.roundSym(unixMillis + fractionMillis);
            return new TimeStruct(unixMillis);
        }
        catch (e) {
            throw new Error("Invalid ISO 8601 string: \"" + s + "\": " + e.message);
        }
    };
    Object.defineProperty(TimeStruct.prototype, "unixMillis", {
        get: function () {
            if (this._unixMillis === undefined) {
                this._unixMillis = timeToUnixNoLeapSecs(this._components);
            }
            return this._unixMillis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "components", {
        get: function () {
            if (!this._components) {
                this._components = unixToTimeNoLeapSecs(this._unixMillis);
            }
            return this._components;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "year", {
        get: function () {
            return this.components.year;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "month", {
        get: function () {
            return this.components.month;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "day", {
        get: function () {
            return this.components.day;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "hour", {
        get: function () {
            return this.components.hour;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "minute", {
        get: function () {
            return this.components.minute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "second", {
        get: function () {
            return this.components.second;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "milli", {
        get: function () {
            return this.components.milli;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The day-of-year 0-365
     */
    TimeStruct.prototype.yearDay = function () {
        return dayOfYear(this.components.year, this.components.month, this.components.day);
    };
    TimeStruct.prototype.equals = function (other) {
        return this.valueOf() === other.valueOf();
    };
    TimeStruct.prototype.valueOf = function () {
        return this.unixMillis;
    };
    TimeStruct.prototype.clone = function () {
        if (this._components) {
            return new TimeStruct(this._components);
        }
        else {
            return new TimeStruct(this._unixMillis);
        }
    };
    /**
     * Validate a timestamp. Filters out non-existing values for all time components
     * @returns true iff the timestamp is valid
     */
    TimeStruct.prototype.validate = function () {
        if (this._components) {
            return this.components.month >= 1 && this.components.month <= 12
                && this.components.day >= 1 && this.components.day <= daysInMonth(this.components.year, this.components.month)
                && this.components.hour >= 0 && this.components.hour <= 23
                && this.components.minute >= 0 && this.components.minute <= 59
                && this.components.second >= 0 && this.components.second <= 59
                && this.components.milli >= 0 && this.components.milli <= 999;
        }
        else {
            return true;
        }
    };
    /**
     * ISO 8601 string YYYY-MM-DDThh:mm:ss.nnn
     */
    TimeStruct.prototype.toString = function () {
        return strings.padLeft(this.components.year.toString(10), 4, "0")
            + "-" + strings.padLeft(this.components.month.toString(10), 2, "0")
            + "-" + strings.padLeft(this.components.day.toString(10), 2, "0")
            + "T" + strings.padLeft(this.components.hour.toString(10), 2, "0")
            + ":" + strings.padLeft(this.components.minute.toString(10), 2, "0")
            + ":" + strings.padLeft(this.components.second.toString(10), 2, "0")
            + "." + strings.padLeft(this.components.milli.toString(10), 3, "0");
    };
    TimeStruct.prototype.inspect = function () {
        return "[TimeStruct: " + this.toString() + "]";
    };
    return TimeStruct;
}());
exports.TimeStruct = TimeStruct;
/**
 * Binary search
 * @param array Array to search
 * @param compare Function that should return < 0 if given element is less than searched element etc
 * @return {Number} The insertion index of the element to look for
 */
function binaryInsertionIndex(arr, compare) {
    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;
    var currentElement;
    // no array / empty array
    if (!arr) {
        return 0;
    }
    if (arr.length === 0) {
        return 0;
    }
    // out of bounds
    if (compare(arr[0]) > 0) {
        return 0;
    }
    if (compare(arr[maxIndex]) < 0) {
        return maxIndex + 1;
    }
    // element in range
    while (minIndex <= maxIndex) {
        currentIndex = Math.floor((minIndex + maxIndex) / 2);
        currentElement = arr[currentIndex];
        if (compare(currentElement) < 0) {
            minIndex = currentIndex + 1;
        }
        else if (compare(currentElement) > 0) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
    return maxIndex;
}
exports.binaryInsertionIndex = binaryInsertionIndex;

},{"./assert":1,"./javascript":7,"./math":8,"./strings":11}],3:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date+time+timezone representation
 */
"use strict";
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var duration_1 = require("./duration");
var javascript_1 = require("./javascript");
var math = require("./math");
var timesource_1 = require("./timesource");
var timezone_1 = require("./timezone");
var tz_database_1 = require("./tz-database");
var format = require("./format");
var parseFuncs = require("./parse");
/**
 * Current date+time in local time
 */
function nowLocal() {
    return DateTime.nowLocal();
}
exports.nowLocal = nowLocal;
/**
 * Current date+time in UTC time
 */
function nowUtc() {
    return DateTime.nowUtc();
}
exports.nowUtc = nowUtc;
/**
 * Current date+time in the given time zone
 * @param timeZone	The desired time zone (optional, defaults to UTC).
 */
function now(timeZone) {
    if (timeZone === void 0) { timeZone = timezone_1.TimeZone.utc(); }
    return DateTime.now(timeZone);
}
exports.now = now;
function convertToUtc(localTime, fromZone) {
    if (fromZone) {
        var offset = fromZone.offsetForZone(localTime);
        return new basics_1.TimeStruct(localTime.unixMillis - offset * 60000);
    }
    else {
        return localTime.clone();
    }
}
function convertFromUtc(utcTime, toZone) {
    if (toZone) {
        var offset = toZone.offsetForUtc(utcTime);
        return toZone.normalizeZoneTime(new basics_1.TimeStruct(utcTime.unixMillis + offset * 60000));
    }
    else {
        return utcTime.clone();
    }
}
/**
 * DateTime class which is time zone-aware
 * and which can be mocked for testing purposes.
 */
var DateTime = (function () {
    /**
     * Constructor implementation, do not call
     */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
        switch (typeof (a1)) {
            case "number":
                {
                    if (a2 === undefined || a2 === null || a2 instanceof timezone_1.TimeZone) {
                        // unix timestamp constructor
                        assert_1.default(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
                        this._zone = (typeof (a2) === "object" && a2 instanceof timezone_1.TimeZone ? a2 : null);
                        var normalizedUnixTimestamp = void 0;
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(new basics_1.TimeStruct(math.roundSym(a1)));
                        }
                        else {
                            this._zoneDate = new basics_1.TimeStruct(math.roundSym(a1));
                        }
                    }
                    else {
                        // year month day constructor
                        assert_1.default(typeof (a1) === "number", "DateTime.DateTime(): Expect year to be a number.");
                        assert_1.default(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
                        assert_1.default(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
                        var year = a1;
                        var month = a2;
                        var day = a3;
                        var hour = (typeof (h) === "number" ? h : 0);
                        var minute = (typeof (m) === "number" ? m : 0);
                        var second = (typeof (s) === "number" ? s : 0);
                        var milli = (typeof (ms) === "number" ? ms : 0);
                        year = math.roundSym(year);
                        month = math.roundSym(month);
                        day = math.roundSym(day);
                        hour = math.roundSym(hour);
                        minute = math.roundSym(minute);
                        second = math.roundSym(second);
                        milli = math.roundSym(milli);
                        var tm = new basics_1.TimeStruct({ year: year, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli });
                        assert_1.default(tm.validate(), "invalid date: " + tm.toString());
                        this._zone = (typeof (timeZone) === "object" && timeZone instanceof timezone_1.TimeZone ? timeZone : null);
                        // normalize local time (remove non-existing local time)
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(tm);
                        }
                        else {
                            this._zoneDate = tm;
                        }
                    }
                }
                break;
            case "string":
                {
                    if (typeof a2 === "string") {
                        // format string given
                        var dateString = a1;
                        var formatString = a2;
                        var zone = null;
                        if (typeof a3 === "object" && a3 instanceof timezone_1.TimeZone) {
                            zone = (a3);
                        }
                        var parsed = parseFuncs.parse(dateString, formatString, zone);
                        this._zoneDate = parsed.time;
                        this._zone = parsed.zone || null;
                    }
                    else {
                        var givenString = a1.trim();
                        var ss = DateTime._splitDateFromTimeZone(givenString);
                        assert_1.default(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                        if (a2 instanceof timezone_1.TimeZone) {
                            this._zone = (a2);
                        }
                        else {
                            this._zone = timezone_1.TimeZone.zone(ss[1]);
                        }
                        // use our own ISO parsing because that it platform independent
                        // (free of Date quirks)
                        this._zoneDate = basics_1.TimeStruct.fromString(ss[0]);
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
                        }
                    }
                }
                break;
            case "object":
                {
                    if (a1 instanceof basics_1.TimeStruct) {
                        this._zoneDate = a1.clone();
                        this._zone = (a2 ? a2 : null);
                    }
                    else if (a1 instanceof Date) {
                        assert_1.default(typeof (a2) === "number", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        assert_1.default(!a3 || a3 instanceof timezone_1.TimeZone, "DateTime.DateTime(): timeZone should be a TimeZone object.");
                        var d = (a1);
                        var dk = (a2);
                        this._zone = (a3 ? a3 : null);
                        this._zoneDate = basics_1.TimeStruct.fromDate(d, dk);
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
                        }
                    }
                }
                break;
            case "undefined":
                {
                    // nothing given, make local datetime
                    this._zone = timezone_1.TimeZone.local();
                    this._utcDate = basics_1.TimeStruct.fromDate(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC);
                }
                break;
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("DateTime.DateTime(): unexpected first argument type.");
                }
        }
    }
    Object.defineProperty(DateTime.prototype, "utcDate", {
        get: function () {
            if (!this._utcDate) {
                this._utcDate = convertToUtc(this._zoneDate, this._zone);
            }
            return this._utcDate;
        },
        set: function (value) {
            this._utcDate = value;
            this._zoneDate = undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateTime.prototype, "zoneDate", {
        get: function () {
            if (!this._zoneDate) {
                this._zoneDate = convertFromUtc(this._utcDate, this._zone);
            }
            return this._zoneDate;
        },
        set: function (value) {
            this._zoneDate = value;
            this._utcDate = undefined;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Current date+time in local time
     */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, javascript_1.DateFunctions.Get, timezone_1.TimeZone.local());
    };
    /**
     * Current date+time in UTC time
     */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC, timezone_1.TimeZone.utc());
    };
    /**
     * Current date+time in the given time zone
     * @param timeZone	The desired time zone (optional, defaults to UTC).
     */
    DateTime.now = function (timeZone) {
        if (timeZone === void 0) { timeZone = timezone_1.TimeZone.utc(); }
        return new DateTime(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC, timezone_1.TimeZone.utc()).toZone(timeZone);
    };
    /**
     * Create a DateTime from a Lotus 123 / Microsoft Excel date-time value
     * i.e. a double representing days since 1-1-1900 where 1900 is incorrectly seen as leap year
     * Does not work for dates < 1900
     * @param n excel date/time number
     * @param timeZone Time zone to assume that the excel value is in
     * @returns a DateTime
     */
    DateTime.fromExcel = function (n, timeZone) {
        assert_1.default(typeof n === "number", "fromExcel(): first parameter must be a number");
        assert_1.default(!isNaN(n), "fromExcel(): first parameter must not be NaN");
        assert_1.default(isFinite(n), "fromExcel(): first parameter must not be NaN");
        var unixTimestamp = Math.round((n - 25569) * 24 * 60 * 60 * 1000);
        return new DateTime(unixTimestamp, timeZone);
    };
    /**
     * Check whether a given date exists in the given time zone.
     * E.g. 2015-02-29 returns false (not a leap year)
     * and 2015-03-29T02:30:00 returns false (daylight saving time missing hour)
     * and 2015-04-31 returns false (April has 30 days).
     * By default, pre-1970 dates also return false since the time zone database does not contain accurate info
     * before that. You can change that with the allowPre1970 flag.
     *
     * @param allowPre1970 (optional, default false): return true for pre-1970 dates
     */
    DateTime.exists = function (year, month, day, hour, minute, second, millisecond, zone, allowPre1970) {
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (millisecond === void 0) { millisecond = 0; }
        if (zone === void 0) { zone = null; }
        if (allowPre1970 === void 0) { allowPre1970 = false; }
        if (!isFinite(year) || !isFinite(month) || !isFinite(day)
            || !isFinite(hour) || !isFinite(minute) || !isFinite(second) || !isFinite(millisecond)) {
            return false;
        }
        if (!allowPre1970 && year < 1970) {
            return false;
        }
        try {
            var dt = new DateTime(year, month, day, hour, minute, second, millisecond, zone);
            return (year === dt.year() && month === dt.month() && day === dt.day()
                && hour === dt.hour() && minute === dt.minute() && second === dt.second() && millisecond === dt.millisecond());
        }
        catch (e) {
            return false;
        }
    };
    /**
     * @return a copy of this object
     */
    DateTime.prototype.clone = function () {
        return new DateTime(this.zoneDate, this._zone);
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
        if (dstDependent === void 0) { dstDependent = true; }
        if (this.zone()) {
            return this.zone().abbreviationForUtc(this.utcDate, dstDependent);
        }
        else {
            return "";
        }
    };
    /**
     * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
     */
    DateTime.prototype.offset = function () {
        return Math.round((this.zoneDate.unixMillis - this.utcDate.unixMillis) / 60000);
    };
    /**
     * @return The full year e.g. 2014
     */
    DateTime.prototype.year = function () {
        return this.zoneDate.components.year;
    };
    /**
     * @return The month 1-12 (note this deviates from JavaScript Date)
     */
    DateTime.prototype.month = function () {
        return this.zoneDate.components.month;
    };
    /**
     * @return The day of the month 1-31
     */
    DateTime.prototype.day = function () {
        return this.zoneDate.components.day;
    };
    /**
     * @return The hour 0-23
     */
    DateTime.prototype.hour = function () {
        return this.zoneDate.components.hour;
    };
    /**
     * @return the minutes 0-59
     */
    DateTime.prototype.minute = function () {
        return this.zoneDate.components.minute;
    };
    /**
     * @return the seconds 0-59
     */
    DateTime.prototype.second = function () {
        return this.zoneDate.components.second;
    };
    /**
     * @return the milliseconds 0-999
     */
    DateTime.prototype.millisecond = function () {
        return this.zoneDate.components.milli;
    };
    /**
     * @return the day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     */
    DateTime.prototype.weekDay = function () {
        return basics.weekDayNoLeapSecs(this.zoneDate.unixMillis);
    };
    /**
     * Returns the day number within the year: Jan 1st has number 0,
     * Jan 2nd has number 1 etc.
     *
     * @return the day-of-year [0-366]
     */
    DateTime.prototype.dayOfYear = function () {
        return this.zoneDate.yearDay();
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
        return this.utcDate.unixMillis;
    };
    /**
     * @return The full year e.g. 2014
     */
    DateTime.prototype.utcYear = function () {
        return this.utcDate.components.year;
    };
    /**
     * @return The UTC month 1-12 (note this deviates from JavaScript Date)
     */
    DateTime.prototype.utcMonth = function () {
        return this.utcDate.components.month;
    };
    /**
     * @return The UTC day of the month 1-31
     */
    DateTime.prototype.utcDay = function () {
        return this.utcDate.components.day;
    };
    /**
     * @return The UTC hour 0-23
     */
    DateTime.prototype.utcHour = function () {
        return this.utcDate.components.hour;
    };
    /**
     * @return The UTC minutes 0-59
     */
    DateTime.prototype.utcMinute = function () {
        return this.utcDate.components.minute;
    };
    /**
     * @return The UTC seconds 0-59
     */
    DateTime.prototype.utcSecond = function () {
        return this.utcDate.components.second;
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
        return this.utcDate.components.milli;
    };
    /**
     * @return the UTC day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     */
    DateTime.prototype.utcWeekDay = function () {
        return basics.weekDayNoLeapSecs(this.utcDate.unixMillis);
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
     * Returns a new DateTime which is the date+time reinterpreted as
     * in the new zone. So e.g. 08:00 America/Chicago can be set to 08:00 Europe/Brussels.
     * No conversion is done, the value is just assumed to be in a different zone.
     * Works for naive and aware dates. The new zone may be null.
     *
     * @param zone The new time zone
     * @return A new DateTime with the original timestamp and the new zone.
     */
    DateTime.prototype.withZone = function (zone) {
        return new DateTime(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond(), zone);
    };
    /**
     * Convert this date to the given time zone (in-place).
     * Throws if this date does not have a time zone.
     * @return this (for chaining)
     */
    DateTime.prototype.convert = function (zone) {
        if (zone) {
            assert_1.default(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            if (this._zone.equals(zone)) {
                this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
            }
            else {
                if (!this._utcDate) {
                    this._utcDate = convertToUtc(this._zoneDate, this._zone); // cause zone -> utc conversion
                }
                this._zone = zone;
                this._zoneDate = undefined;
            }
        }
        else {
            if (!this._zone) {
                return;
            }
            if (!this._zoneDate) {
                this._zoneDate = convertFromUtc(this._utcDate, this._zone);
            }
            this._zone = null;
            this._utcDate = undefined; // cause later zone -> utc conversion
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
            assert_1.default(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            var result = new DateTime();
            result.utcDate = this.utcDate;
            result._zone = zone;
            return result;
        }
        else {
            return new DateTime(this.zoneDate, null);
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
     * Create an Excel timestamp for this datetime converted to the given zone.
     * Does not work for dates < 1900
     * @param timeZone Optional. Zone to convert to, default the zone the datetime is already in.
     * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
     */
    DateTime.prototype.toExcel = function (timeZone) {
        var dt = this;
        if (timeZone && !timeZone.equals(this.zone())) {
            dt = this.toZone(timeZone);
        }
        var offsetMillis = dt.offset() * 60 * 1000;
        var unixTimestamp = dt.unixUtcMillis();
        return this._unixTimeStampToExcel(unixTimestamp + offsetMillis);
    };
    /**
     * Create an Excel timestamp for this datetime converted to UTC
     * Does not work for dates < 1900
     * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
     */
    DateTime.prototype.toUtcExcel = function () {
        var unixTimestamp = this.unixUtcMillis();
        return this._unixTimeStampToExcel(unixTimestamp);
    };
    DateTime.prototype._unixTimeStampToExcel = function (n) {
        var result = ((n) / (24 * 60 * 60 * 1000)) + 25569;
        // round to nearest millisecond
        var msecs = result / (1 / 86400000);
        return Math.round(msecs) * (1 / 86400000);
    };
    /**
     * Implementation.
     */
    DateTime.prototype.add = function (a1, unit) {
        var amount;
        var u;
        if (typeof (a1) === "object") {
            var duration = (a1);
            amount = duration.amount();
            u = duration.unit();
        }
        else {
            assert_1.default(typeof (a1) === "number", "expect number as first argument");
            assert_1.default(typeof (unit) === "number", "expect number as second argument");
            amount = (a1);
            u = unit;
        }
        var utcTm = this._addToTimeStruct(this.utcDate, amount, u);
        return new DateTime(utcTm, timezone_1.TimeZone.utc()).toZone(this._zone);
    };
    DateTime.prototype.addLocal = function (a1, unit) {
        var amount;
        var u;
        if (typeof (a1) === "object") {
            var duration = (a1);
            amount = duration.amount();
            u = duration.unit();
        }
        else {
            assert_1.default(typeof (a1) === "number", "expect number as first argument");
            assert_1.default(typeof (unit) === "number", "expect number as second argument");
            amount = (a1);
            u = unit;
        }
        var localTm = this._addToTimeStruct(this.zoneDate, amount, u);
        if (this._zone) {
            var direction = (amount >= 0 ? tz_database_1.NormalizeOption.Up : tz_database_1.NormalizeOption.Down);
            var normalized = this._zone.normalizeZoneTime(localTm, direction);
            return new DateTime(normalized, this._zone);
        }
        else {
            return new DateTime(localTm, null);
        }
    };
    /**
     * Add an amount of time to the given time struct. Note: does not normalize.
     * Keeps lower unit fields the same where possible, clamps day to end-of-month if
     * necessary.
     */
    DateTime.prototype._addToTimeStruct = function (tm, amount, unit) {
        var year;
        var month;
        var day;
        var hour;
        var minute;
        var second;
        var milli;
        switch (unit) {
            case basics_1.TimeUnit.Millisecond:
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount));
            case basics_1.TimeUnit.Second:
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount * 1000));
            case basics_1.TimeUnit.Minute:
                // todo more intelligent approach needed when implementing leap seconds
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount * 60000));
            case basics_1.TimeUnit.Hour:
                // todo more intelligent approach needed when implementing leap seconds
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount * 3600000));
            case basics_1.TimeUnit.Day:
                // todo more intelligent approach needed when implementing leap seconds
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount * 86400000));
            case basics_1.TimeUnit.Week:
                // todo more intelligent approach needed when implementing leap seconds
                return new basics_1.TimeStruct(math.roundSym(tm.unixMillis + amount * 7 * 86400000));
            case basics_1.TimeUnit.Month: {
                assert_1.default(math.isInt(amount), "Cannot add/sub a non-integer amount of months");
                // keep the day-of-month the same (clamp to end-of-month)
                if (amount >= 0) {
                    year = tm.components.year + Math.ceil((amount - (12 - tm.components.month)) / 12);
                    month = 1 + math.positiveModulo((tm.components.month - 1 + Math.floor(amount)), 12);
                }
                else {
                    year = tm.components.year + Math.floor((amount + (tm.components.month - 1)) / 12);
                    month = 1 + math.positiveModulo((tm.components.month - 1 + Math.ceil(amount)), 12);
                }
                day = Math.min(tm.components.day, basics.daysInMonth(year, month));
                hour = tm.components.hour;
                minute = tm.components.minute;
                second = tm.components.second;
                milli = tm.components.milli;
                return new basics_1.TimeStruct({ year: year, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli });
            }
            case basics_1.TimeUnit.Year: {
                assert_1.default(math.isInt(amount), "Cannot add/sub a non-integer amount of years");
                year = tm.components.year + amount;
                month = tm.components.month;
                day = Math.min(tm.components.day, basics.daysInMonth(year, month));
                hour = tm.components.hour;
                minute = tm.components.minute;
                second = tm.components.second;
                milli = tm.components.milli;
                return new basics_1.TimeStruct({ year: year, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli });
            }
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };
    DateTime.prototype.sub = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof duration_1.Duration) {
            var duration = (a1);
            return this.add(duration.multiply(-1));
        }
        else {
            assert_1.default(typeof (a1) === "number", "expect number as first argument");
            assert_1.default(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            return this.add(-1 * amount, unit);
        }
    };
    DateTime.prototype.subLocal = function (a1, unit) {
        if (typeof a1 === "object") {
            return this.addLocal(a1.multiply(-1));
        }
        else {
            return this.addLocal(-1 * a1, unit);
        }
    };
    /**
     * Time difference between two DateTimes
     * @return this - other
     */
    DateTime.prototype.diff = function (other) {
        return new duration_1.Duration(this.utcDate.unixMillis - other.utcDate.unixMillis);
    };
    /**
    * Chops off the time part, yields the same date at 00:00:00.000
    * @return a new DateTime
    */
    DateTime.prototype.startOfDay = function () {
        return new DateTime(this.year(), this.month(), this.day(), 0, 0, 0, 0, this.zone());
    };
    /**
     * Returns the first day of the month at 00:00:00
     * @return a new DateTime
     */
    DateTime.prototype.startOfMonth = function () {
        return new DateTime(this.year(), this.month(), 1, 0, 0, 0, 0, this.zone());
    };
    /**
     * Returns the first day of the year at 00:00:00
     * @return a new DateTime
     */
    DateTime.prototype.startOfYear = function () {
        return new DateTime(this.year(), 1, 1, 0, 0, 0, 0, this.zone());
    };
    /**
     * @return True iff (this < other)
     */
    DateTime.prototype.lessThan = function (other) {
        return this.utcDate.unixMillis < other.utcDate.unixMillis;
    };
    /**
     * @return True iff (this <= other)
     */
    DateTime.prototype.lessEqual = function (other) {
        return this.utcDate.unixMillis <= other.utcDate.unixMillis;
    };
    /**
     * @return True iff this and other represent the same moment in time in UTC
     */
    DateTime.prototype.equals = function (other) {
        return this.utcDate.equals(other.utcDate);
    };
    /**
     * @return True iff this and other represent the same time and the same zone
     */
    DateTime.prototype.identical = function (other) {
        return (this.zoneDate.equals(other.zoneDate)
            && (this._zone === null) === (other._zone === null)
            && (this._zone === null || this._zone.identical(other._zone)));
    };
    /**
     * @return True iff this > other
     */
    DateTime.prototype.greaterThan = function (other) {
        return this.utcDate.unixMillis > other.utcDate.unixMillis;
    };
    /**
     * @return True iff this >= other
     */
    DateTime.prototype.greaterEqual = function (other) {
        return this.utcDate.unixMillis >= other.utcDate.unixMillis;
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
        var s = this.zoneDate.toString();
        if (this._zone) {
            return s + timezone_1.TimeZone.offsetToString(this.offset()); // convert IANA name to offset
        }
        else {
            return s; // no zone present
        }
    };
    /**
     * Return a string representation of the DateTime according to the
     * specified format. The format is implemented as the LDML standard
     * (http://unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns)
     *
     * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
     * @param formatOptions Optional, non-english format month names etc.
     * @return The string representation of this DateTime
     */
    DateTime.prototype.format = function (formatString, formatOptions) {
        return format.format(this.zoneDate, this.utcDate, this.zone(), formatString, formatOptions);
    };
    /**
     * Parse a date in a given format
     * @param s the string to parse
     * @param format the format the string is in
     * @param zone Optional, the zone to add (if no zone is given in the string)
     */
    DateTime.parse = function (s, format, zone) {
        var parsed = parseFuncs.parse(s, format, zone);
        return new DateTime(parsed.time, parsed.zone);
    };
    /**
     * Modified ISO 8601 format string with IANA name if applicable.
     * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
     */
    DateTime.prototype.toString = function () {
        var s = this.zoneDate.toString();
        if (this._zone) {
            if (this._zone.kind() !== timezone_1.TimeZoneKind.Offset) {
                return s + " " + this._zone.toString(); // separate IANA name or "localtime" with a space
            }
            else {
                return s + this._zone.toString(); // do not separate ISO zone
            }
        }
        else {
            return s; // no zone present
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
        return this.utcDate.toString();
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
    /**
     * Actual time source in use. Setting this property allows to
     * fake time in tests. DateTime.nowLocal() and DateTime.nowUtc()
     * use this property for obtaining the current time.
     */
    DateTime.timeSource = new timesource_1.RealTimeSource();
    return DateTime;
}());
exports.DateTime = DateTime;

},{"./assert":1,"./basics":2,"./duration":4,"./format":5,"./javascript":7,"./math":8,"./parse":9,"./timesource":12,"./timezone":13,"./tz-database":15}],4:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time duration
 */
"use strict";
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var strings = require("./strings");
/**
 * Construct a time duration
 * @param n	Number of years (may be fractional or negative)
 * @return A duration of n years
 */
function years(n) {
    return Duration.years(n);
}
exports.years = years;
/**
 * Construct a time duration
 * @param n	Number of months (may be fractional or negative)
 * @return A duration of n months
 */
function months(n) {
    return Duration.months(n);
}
exports.months = months;
/**
 * Construct a time duration
 * @param n	Number of days (may be fractional or negative)
 * @return A duration of n days
 */
function days(n) {
    return Duration.days(n);
}
exports.days = days;
/**
 * Construct a time duration
 * @param n	Number of hours (may be fractional or negative)
 * @return A duration of n hours
 */
function hours(n) {
    return Duration.hours(n);
}
exports.hours = hours;
/**
 * Construct a time duration
 * @param n	Number of minutes (may be fractional or negative)
 * @return A duration of n minutes
 */
function minutes(n) {
    return Duration.minutes(n);
}
exports.minutes = minutes;
/**
 * Construct a time duration
 * @param n	Number of seconds (may be fractional or negative)
 * @return A duration of n seconds
 */
function seconds(n) {
    return Duration.seconds(n);
}
exports.seconds = seconds;
/**
 * Construct a time duration
 * @param n	Number of milliseconds (may be fractional or negative)
 * @return A duration of n milliseconds
 */
function milliseconds(n) {
    return Duration.milliseconds(n);
}
exports.milliseconds = milliseconds;
/**
 * Time duration which is represented as an amount and a unit e.g.
 * '1 Month' or '166 Seconds'. The unit is preserved through calculations.
 *
 * It has two sets of getter functions:
 * - second(), minute(), hour() etc, singular form: these can be used to create string representations.
 *   These return a part of your string representation. E.g. for 2500 milliseconds, the millisecond() part would be 500
 * - seconds(), minutes(), hours() etc, plural form: these return the total amount represented in the corresponding unit.
 */
var Duration = (function () {
    /**
     * Constructor implementation
     */
    function Duration(i1, unit) {
        if (typeof (i1) === "number") {
            // amount+unit constructor
            var amount = i1;
            this._amount = amount;
            this._unit = (typeof unit === "number" ? unit : basics_1.TimeUnit.Millisecond);
        }
        else if (typeof (i1) === "string") {
            // string constructor
            this._fromString(i1);
        }
        else {
            // default constructor
            this._amount = 0;
            this._unit = basics_1.TimeUnit.Millisecond;
        }
    }
    /**
     * Construct a time duration
     * @param n	Number of years (may be fractional or negative)
     * @return A duration of n years
     */
    Duration.years = function (n) {
        return new Duration(n, basics_1.TimeUnit.Year);
    };
    /**
     * Construct a time duration
     * @param n	Number of months (may be fractional or negative)
     * @return A duration of n months
     */
    Duration.months = function (n) {
        return new Duration(n, basics_1.TimeUnit.Month);
    };
    /**
     * Construct a time duration
     * @param n	Number of days (may be fractional or negative)
     * @return A duration of n days
     */
    Duration.days = function (n) {
        return new Duration(n, basics_1.TimeUnit.Day);
    };
    /**
     * Construct a time duration
     * @param n	Number of hours (may be fractional or negative)
     * @return A duration of n hours
     */
    Duration.hours = function (n) {
        return new Duration(n, basics_1.TimeUnit.Hour);
    };
    /**
     * Construct a time duration
     * @param n	Number of minutes (may be fractional or negative)
     * @return A duration of n minutes
     */
    Duration.minutes = function (n) {
        return new Duration(n, basics_1.TimeUnit.Minute);
    };
    /**
     * Construct a time duration
     * @param n	Number of seconds (may be fractional or negative)
     * @return A duration of n seconds
     */
    Duration.seconds = function (n) {
        return new Duration(n, basics_1.TimeUnit.Second);
    };
    /**
     * Construct a time duration
     * @param n	Number of milliseconds (may be fractional or negative)
     * @return A duration of n milliseconds
     */
    Duration.milliseconds = function (n) {
        return new Duration(n, basics_1.TimeUnit.Millisecond);
    };
    /**
     * @return another instance of Duration with the same value.
     */
    Duration.prototype.clone = function () {
        return new Duration(this._amount, this._unit);
    };
    /**
     * Returns this duration expressed in different unit (positive or negative, fractional).
     * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
     * It is approximate for any other conversion
     */
    Duration.prototype.as = function (unit) {
        if (this._unit === unit) {
            return this._amount;
        }
        else if (this._unit >= basics_1.TimeUnit.Month && unit >= basics_1.TimeUnit.Month) {
            var thisMonths = (this._unit === basics_1.TimeUnit.Year ? 12 : 1);
            var reqMonths = (unit === basics_1.TimeUnit.Year ? 12 : 1);
            return this._amount * thisMonths / reqMonths;
        }
        else {
            var thisMsec = basics.timeUnitToMilliseconds(this._unit);
            var reqMsec = basics.timeUnitToMilliseconds(unit);
            return this._amount * thisMsec / reqMsec;
        }
    };
    /**
     * Convert this duration to a Duration in another unit. You always get a clone even if you specify
     * the same unit.
     * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
     * It is approximate for any other conversion
     */
    Duration.prototype.convert = function (unit) {
        return new Duration(this.as(unit), unit);
    };
    /**
     * The entire duration in milliseconds (negative or positive)
     * For Day/Month/Year durations, this is approximate!
     */
    Duration.prototype.milliseconds = function () {
        return this.as(basics_1.TimeUnit.Millisecond);
    };
    /**
     * The millisecond part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 400 for a -01:02:03.400 duration
     */
    Duration.prototype.millisecond = function () {
        return this._part(basics_1.TimeUnit.Millisecond);
    };
    /**
     * The entire duration in seconds (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 1500 milliseconds duration
     */
    Duration.prototype.seconds = function () {
        return this.as(basics_1.TimeUnit.Second);
    };
    /**
     * The second part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 3 for a -01:02:03.400 duration
     */
    Duration.prototype.second = function () {
        return this._part(basics_1.TimeUnit.Second);
    };
    /**
     * The entire duration in minutes (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 90000 milliseconds duration
     */
    Duration.prototype.minutes = function () {
        return this.as(basics_1.TimeUnit.Minute);
    };
    /**
     * The minute part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 2 for a -01:02:03.400 duration
     */
    Duration.prototype.minute = function () {
        return this._part(basics_1.TimeUnit.Minute);
    };
    /**
     * The entire duration in hours (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 5400000 milliseconds duration
     */
    Duration.prototype.hours = function () {
        return this.as(basics_1.TimeUnit.Hour);
    };
    /**
     * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
     * during DST changes).
     */
    Duration.prototype.hour = function () {
        return this._part(basics_1.TimeUnit.Hour);
    };
    /**
     * The hour part of the duration (always positive).
     * Note that this part can exceed 23 hours, because for
     * now, we do not have a days() function
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 25 for a -25:02:03.400 duration
     */
    Duration.prototype.wholeHours = function () {
        return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / 3600000);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in days!
     */
    Duration.prototype.days = function () {
        return this.as(basics_1.TimeUnit.Day);
    };
    /**
     * The day part of a duration. This assumes that a month has 30 days.
     */
    Duration.prototype.day = function () {
        return this._part(basics_1.TimeUnit.Day);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.months = function () {
        return this.as(basics_1.TimeUnit.Month);
    };
    /**
     * The month part of a duration.
     */
    Duration.prototype.month = function () {
        return this._part(basics_1.TimeUnit.Month);
    };
    /**
     * The entire duration in years (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.years = function () {
        return this.as(basics_1.TimeUnit.Year);
    };
    /**
     * Non-fractional positive years
     */
    Duration.prototype.wholeYears = function () {
        if (this._unit === basics_1.TimeUnit.Year) {
            return Math.floor(Math.abs(this._amount));
        }
        else if (this._unit === basics_1.TimeUnit.Month) {
            return Math.floor(Math.abs(this._amount) / 12);
        }
        else {
            return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) /
                basics.timeUnitToMilliseconds(basics_1.TimeUnit.Year));
        }
    };
    /**
     * Amount of units (positive or negative, fractional)
     */
    Duration.prototype.amount = function () {
        return this._amount;
    };
    /**
     * The unit this duration was created with
     */
    Duration.prototype.unit = function () {
        return this._unit;
    };
    /**
     * Sign
     * @return "-" if the duration is negative
     */
    Duration.prototype.sign = function () {
        return (this._amount < 0 ? "-" : "");
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this < other)
     */
    Duration.prototype.lessThan = function (other) {
        return this.milliseconds() < other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this <= other)
     */
    Duration.prototype.lessEqual = function (other) {
        return this.milliseconds() <= other.milliseconds();
    };
    /**
     * Similar but not identical
     * Approximate if the durations have units that cannot be converted
     * @return True iff this and other represent the same time duration
     */
    Duration.prototype.equals = function (other) {
        var converted = other.convert(this._unit);
        return this._amount === converted.amount() && this._unit === converted.unit();
    };
    /**
     * Similar but not identical
     * Returns false if we cannot determine whether they are equal in all time zones
     * so e.g. 60 minutes equals 1 hour, but 24 hours do NOT equal 1 day
     *
     * @return True iff this and other represent the same time duration
     */
    Duration.prototype.equalsExact = function (other) {
        if (this._unit >= basics_1.TimeUnit.Month && other.unit() >= basics_1.TimeUnit.Month) {
            return this.equals(other);
        }
        else if (this._unit <= basics_1.TimeUnit.Day && other.unit() < basics_1.TimeUnit.Day) {
            return this.equals(other);
        }
        else {
            return false;
        }
    };
    /**
     * Same unit and same amount
     */
    Duration.prototype.identical = function (other) {
        return this._amount === other.amount() && this._unit === other.unit();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this > other
     */
    Duration.prototype.greaterThan = function (other) {
        return this.milliseconds() > other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this >= other
     */
    Duration.prototype.greaterEqual = function (other) {
        return this.milliseconds() >= other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return The minimum (most negative) of this and other
     */
    Duration.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return The maximum (most positive) of this and other
     */
    Duration.prototype.max = function (other) {
        if (this.greaterThan(other)) {
            return this.clone();
        }
        return other.clone();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * Multiply with a fixed number.
     * @return a new Duration of (this * value)
     */
    Duration.prototype.multiply = function (value) {
        return new Duration(this._amount * value, this._unit);
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * Divide by a fixed number.
     * @return a new Duration of (this / value)
     */
    Duration.prototype.divide = function (value) {
        if (value === 0) {
            throw new Error("Duration.divide(): Divide by zero");
        }
        return new Duration(this._amount / value, this._unit);
    };
    /**
     * Add a duration.
     * @return a new Duration of (this + value) with the unit of this duration
     */
    Duration.prototype.add = function (value) {
        return new Duration(this._amount + value.as(this._unit), this._unit);
    };
    /**
     * Subtract a duration.
     * @return a new Duration of (this - value) with the unit of this duration
     */
    Duration.prototype.sub = function (value) {
        return new Duration(this._amount - value.as(this._unit), this._unit);
    };
    /**
     * Return the absolute value of the duration i.e. remove the sign.
     */
    Duration.prototype.abs = function () {
        if (this._amount >= 0) {
            return this.clone();
        }
        else {
            return this.multiply(-1);
        }
    };
    /**
     * String in [-]hhhh:mm:ss.nnn notation. All fields are
     * always present except the sign.
     */
    Duration.prototype.toFullString = function () {
        return this.toHmsString(true);
    };
    /**
     * String in [-]hhhh:mm[:ss[.nnn]] notation.
     * @param full If true, then all fields are always present except the sign. Otherwise, seconds and milliseconds
     *             are chopped off if zero
     */
    Duration.prototype.toHmsString = function (full) {
        if (full === void 0) { full = false; }
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
    /**
     * String in ISO 8601 notation e.g. 'P1M' for one month or 'PT1M' for one minute
     */
    Duration.prototype.toIsoString = function () {
        switch (this._unit) {
            case basics_1.TimeUnit.Millisecond: {
                return "P" + (this._amount / 1000).toFixed(3) + "S";
            }
            case basics_1.TimeUnit.Second: {
                return "P" + this._amount.toString(10) + "S";
            }
            case basics_1.TimeUnit.Minute: {
                return "PT" + this._amount.toString(10) + "M"; // note the "T" to disambiguate the "M"
            }
            case basics_1.TimeUnit.Hour: {
                return "P" + this._amount.toString(10) + "H";
            }
            case basics_1.TimeUnit.Day: {
                return "P" + this._amount.toString(10) + "D";
            }
            case basics_1.TimeUnit.Week: {
                return "P" + this._amount.toString(10) + "W";
            }
            case basics_1.TimeUnit.Month: {
                return "P" + this._amount.toString(10) + "M";
            }
            case basics_1.TimeUnit.Year: {
                return "P" + this._amount.toString(10) + "Y";
            }
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };
    /**
     * String representation with amount and unit e.g. '1.5 years' or '-1 day'
     */
    Duration.prototype.toString = function () {
        return this._amount.toString(10) + " " + basics.timeUnitToString(this._unit, this._amount);
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
    /**
     * Return this % unit, always positive
     */
    Duration.prototype._part = function (unit) {
        /* istanbul ignore if */
        if (unit === basics_1.TimeUnit.Year) {
            return Math.floor(Math.abs(this.as(basics_1.TimeUnit.Year)));
        }
        var nextUnit;
        // note not all units are used here: Weeks and Years are ruled out
        switch (unit) {
            case basics_1.TimeUnit.Millisecond:
                nextUnit = basics_1.TimeUnit.Second;
                break;
            case basics_1.TimeUnit.Second:
                nextUnit = basics_1.TimeUnit.Minute;
                break;
            case basics_1.TimeUnit.Minute:
                nextUnit = basics_1.TimeUnit.Hour;
                break;
            case basics_1.TimeUnit.Hour:
                nextUnit = basics_1.TimeUnit.Day;
                break;
            case basics_1.TimeUnit.Day:
                nextUnit = basics_1.TimeUnit.Month;
                break;
            case basics_1.TimeUnit.Month:
                nextUnit = basics_1.TimeUnit.Year;
                break;
        }
        var msecs = (basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount)) % basics.timeUnitToMilliseconds(nextUnit);
        return Math.floor(msecs / basics.timeUnitToMilliseconds(unit));
    };
    Duration.prototype._fromString = function (s) {
        var trimmed = s.trim();
        if (trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/)) {
            var sign = 1;
            var hours_1 = 0;
            var minutes_1 = 0;
            var seconds_1 = 0;
            var milliseconds_1 = 0;
            var parts = trimmed.split(":");
            assert_1.default(parts.length > 0 && parts.length < 4, "Not a proper time duration string: \"" + trimmed + "\"");
            if (trimmed.charAt(0) === "-") {
                sign = -1;
                parts[0] = parts[0].substr(1);
            }
            if (parts.length > 0) {
                hours_1 = +parts[0];
            }
            if (parts.length > 1) {
                minutes_1 = +parts[1];
            }
            if (parts.length > 2) {
                var secondParts = parts[2].split(".");
                seconds_1 = +secondParts[0];
                if (secondParts.length > 1) {
                    milliseconds_1 = +strings.padRight(secondParts[1], 3, "0");
                }
            }
            var amountMsec = sign * Math.round(milliseconds_1 + 1000 * seconds_1 + 60000 * minutes_1 + 3600000 * hours_1);
            // find lowest non-zero number and take that as unit
            if (milliseconds_1 !== 0) {
                this._unit = basics_1.TimeUnit.Millisecond;
            }
            else if (seconds_1 !== 0) {
                this._unit = basics_1.TimeUnit.Second;
            }
            else if (minutes_1 !== 0) {
                this._unit = basics_1.TimeUnit.Minute;
            }
            else if (hours_1 !== 0) {
                this._unit = basics_1.TimeUnit.Hour;
            }
            else {
                this._unit = basics_1.TimeUnit.Millisecond;
            }
            this._amount = amountMsec / basics.timeUnitToMilliseconds(this._unit);
        }
        else {
            var split = trimmed.toLowerCase().split(" ");
            if (split.length !== 2) {
                throw new Error("Invalid time string '" + s + "'");
            }
            var amount = parseFloat(split[0]);
            assert_1.default(!isNaN(amount), "Invalid time string '" + s + "', cannot parse amount");
            assert_1.default(isFinite(amount), "Invalid time string '" + s + "', amount is infinite");
            this._amount = amount;
            this._unit = basics.stringToTimeUnit(split[1]);
        }
    };
    return Duration;
}());
exports.Duration = Duration;
;

},{"./assert":1,"./basics":2,"./strings":11}],5:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
var basics = require("./basics");
var token_1 = require("./token");
var strings = require("./strings");
exports.LONG_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
exports.SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
exports.MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
exports.LONG_WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
exports.SHORT_WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
exports.WEEKDAY_TWO_LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
exports.WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
exports.QUARTER_LETTER = "Q";
exports.QUARTER_WORD = "quarter";
exports.QUARTER_ABBREVIATIONS = ["1st", "2nd", "3rd", "4th"];
exports.DEFAULT_FORMAT_OPTIONS = {
    quarterLetter: exports.QUARTER_LETTER,
    quarterWord: exports.QUARTER_WORD,
    quarterAbbreviations: exports.QUARTER_ABBREVIATIONS,
    longMonthNames: exports.LONG_MONTH_NAMES,
    shortMonthNames: exports.SHORT_MONTH_NAMES,
    monthLetters: exports.MONTH_LETTERS,
    longWeekdayNames: exports.LONG_WEEKDAY_NAMES,
    shortWeekdayNames: exports.SHORT_WEEKDAY_NAMES,
    weekdayTwoLetters: exports.WEEKDAY_TWO_LETTERS,
    weekdayLetters: exports.WEEKDAY_LETTERS
};
/**
 * Format the supplied dateTime with the formatting string.
 *
 * @param dateTime The current time to format
 * @param utcTime The time in UTC
 * @param localZone The zone that currentTime is in
 * @param formatString The formatting string to be applied
 * @param formatOptions Other format options such as month names
 * @return string
 */
function format(dateTime, utcTime, localZone, formatString, formatOptions) {
    if (formatOptions === void 0) { formatOptions = {}; }
    // merge format options with default format options
    // typecast to prevent error TS7017: Index signature of object type implicitly has an 'any' type.
    var givenFormatOptions = formatOptions;
    var defaultFormatOptions = exports.DEFAULT_FORMAT_OPTIONS;
    var mergedFormatOptions = {};
    for (var name_1 in exports.DEFAULT_FORMAT_OPTIONS) {
        if (exports.DEFAULT_FORMAT_OPTIONS.hasOwnProperty(name_1)) {
            var givenFormatOption = givenFormatOptions[name_1];
            var defaultFormatOption = defaultFormatOptions[name_1];
            mergedFormatOptions[name_1] = givenFormatOption || defaultFormatOption;
        }
    }
    formatOptions = mergedFormatOptions;
    var tokenizer = new token_1.Tokenizer(formatString);
    var tokens = tokenizer.parseTokens();
    var result = "";
    for (var i = 0; i < tokens.length; ++i) {
        var token = tokens[i];
        var tokenResult = void 0;
        switch (token.type) {
            case token_1.DateTimeTokenType.ERA:
                tokenResult = _formatEra(dateTime, token);
                break;
            case token_1.DateTimeTokenType.YEAR:
                tokenResult = _formatYear(dateTime, token);
                break;
            case token_1.DateTimeTokenType.QUARTER:
                tokenResult = _formatQuarter(dateTime, token, formatOptions);
                break;
            case token_1.DateTimeTokenType.MONTH:
                tokenResult = _formatMonth(dateTime, token, formatOptions);
                break;
            case token_1.DateTimeTokenType.DAY:
                tokenResult = _formatDay(dateTime, token);
                break;
            case token_1.DateTimeTokenType.WEEKDAY:
                tokenResult = _formatWeekday(dateTime, token, formatOptions);
                break;
            case token_1.DateTimeTokenType.DAYPERIOD:
                tokenResult = _formatDayPeriod(dateTime, token);
                break;
            case token_1.DateTimeTokenType.HOUR:
                tokenResult = _formatHour(dateTime, token);
                break;
            case token_1.DateTimeTokenType.MINUTE:
                tokenResult = _formatMinute(dateTime, token);
                break;
            case token_1.DateTimeTokenType.SECOND:
                tokenResult = _formatSecond(dateTime, token);
                break;
            case token_1.DateTimeTokenType.ZONE:
                tokenResult = _formatZone(dateTime, utcTime, localZone, token);
                break;
            case token_1.DateTimeTokenType.WEEK:
                tokenResult = _formatWeek(dateTime, token);
                break;
            default:
            case token_1.DateTimeTokenType.IDENTITY:
                tokenResult = token.raw;
                break;
        }
        result += tokenResult;
    }
    return result.trim();
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
        /* istanbul ignore next */
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + token_1.DateTimeTokenType[token.type]);
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
function _formatQuarter(dateTime, token, formatOptions) {
    var quarter = Math.ceil(dateTime.month / 3);
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(quarter.toString(), 2, "0");
        case 3:
            return formatOptions.quarterLetter + quarter;
        case 4:
            return formatOptions.quarterAbbreviations[quarter - 1] + " " + formatOptions.quarterWord;
        case 5:
            return quarter.toString();
        /* istanbul ignore next */
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
function _formatMonth(dateTime, token, formatOptions) {
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(dateTime.month.toString(), token.length, "0");
        case 3:
            return formatOptions.shortMonthNames[dateTime.month - 1];
        case 4:
            return formatOptions.longMonthNames[dateTime.month - 1];
        case 5:
            return formatOptions.monthLetters[dateTime.month - 1];
        /* istanbul ignore next */
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
    }
    else {
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
        /* istanbul ignore next */
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + token_1.DateTimeTokenType[token.type]);
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
function _formatWeekday(dateTime, token, formatOptions) {
    var weekDayNumber = basics.weekDayNoLeapSecs(dateTime.unixMillis);
    switch (token.length) {
        case 1:
        case 2:
            if (token.symbol === "e") {
                return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.unixMillis).toString(), token.length, "0");
            } // No break, this is intentional fallthrough!
        case 3:
            return formatOptions.shortWeekdayNames[weekDayNumber];
        case 4:
            return formatOptions.longWeekdayNames[weekDayNumber];
        case 5:
            return formatOptions.weekdayLetters[weekDayNumber];
        case 6:
            return formatOptions.weekdayTwoLetters[weekDayNumber];
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + token_1.DateTimeTokenType[token.type]);
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
        /* istanbul ignore next */
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + token_1.DateTimeTokenType[token.type]);
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
    if (!zone) {
        return "";
    }
    var offset = Math.round((currentTime.unixMillis - utcTime.unixMillis) / 60000);
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
            }
            else {
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
                        type: token_1.DateTimeTokenType.ZONE
                    };
                    return _formatZone(currentTime, utcTime, zone, newToken);
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;
                /* istanbul ignore next */
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
                    return zone.abbreviationForUtc(currentTime, true);
                case 4:
                    return zone.toString();
                /* istanbul ignore next */
                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "v":
            if (token.length === 1) {
                return zone.abbreviationForUtc(currentTime, false);
            }
            else {
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
                /* istanbul ignore next */
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
                /* istanbul ignore next */
                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        /* istanbul ignore next */
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + token_1.DateTimeTokenType[token.type]);
            }
    }
}

},{"./basics":2,"./strings":11,"./token":14}],6:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Global functions depending on DateTime/Duration etc
 */
"use strict";
var assert_1 = require("./assert");
var datetime_1 = require("./datetime");
var duration_1 = require("./duration");
/**
 * Returns the minimum of two DateTimes or Durations
 */
function min(d1, d2) {
    assert_1.default(d1, "first argument is null");
    assert_1.default(d2, "first argument is null");
    /* istanbul ignore next */
    assert_1.default((d1 instanceof datetime_1.DateTime && d2 instanceof datetime_1.DateTime) || (d1 instanceof duration_1.Duration && d2 instanceof duration_1.Duration), "Either two datetimes or two durations expected");
    return d1.min(d2);
}
exports.min = min;
/**
 * Returns the maximum of two DateTimes or Durations
 */
function max(d1, d2) {
    assert_1.default(d1, "first argument is null");
    assert_1.default(d2, "first argument is null");
    /* istanbul ignore next */
    assert_1.default((d1 instanceof datetime_1.DateTime && d2 instanceof datetime_1.DateTime) || (d1 instanceof duration_1.Duration && d2 instanceof duration_1.Duration), "Either two datetimes or two durations expected");
    return d1.max(d2);
}
exports.max = max;
/**
 * Returns the absolute value of a Duration
 */
function abs(d) {
    assert_1.default(d, "first argument is null");
    assert_1.default(d instanceof duration_1.Duration, "first argument is not a Duration");
    return d.abs();
}
exports.abs = abs;

},{"./assert":1,"./datetime":3,"./duration":4}],7:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 */
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

},{}],8:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Math utility functions
 */
"use strict";
var assert_1 = require("./assert");
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
 * Rounds -1.5 to -2 instead of -1
 * Rounds +1.5 to +2
 */
function roundSym(n) {
    if (n < 0) {
        return -1 * Math.round(-1 * n);
    }
    else {
        return Math.round(n);
    }
}
exports.roundSym = roundSym;
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
    assert_1.default(modulo >= 1, "modulo should be >= 1");
    if (value < 0) {
        return ((value % modulo) + modulo) % modulo;
    }
    else {
        return value % modulo;
    }
}
exports.positiveModulo = positiveModulo;

},{"./assert":1}],9:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
var basics_1 = require("./basics");
var token_1 = require("./token");
var timezone_1 = require("./timezone");
/**
 * Checks if a given datetime string is according to the given format
 * @param dateTimeString The string to test
 * @param formatString LDML format string
 * @param allowTrailing Allow trailing string after the date+time
 * @returns true iff the string is valid
 */
function parseable(dateTimeString, formatString, allowTrailing) {
    if (allowTrailing === void 0) { allowTrailing = true; }
    try {
        parse(dateTimeString, formatString, null, allowTrailing);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.parseable = parseable;
/**
 * Parse the supplied dateTime assuming the given format.
 *
 * @param dateTimeString The string to parse
 * @param formatString The formatting string to be applied
 * @return string
 */
function parse(dateTimeString, formatString, overrideZone, allowTrailing) {
    if (allowTrailing === void 0) { allowTrailing = true; }
    if (!dateTimeString) {
        throw new Error("no date given");
    }
    if (!formatString) {
        throw new Error("no format given");
    }
    try {
        var tokenizer = new token_1.Tokenizer(formatString);
        var tokens = tokenizer.parseTokens();
        var time = { year: -1 };
        var zone = void 0;
        var pnr = void 0;
        var pzr = void 0;
        var remaining = dateTimeString;
        for (var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
            var tokenResult = void 0;
            switch (token.type) {
                case token_1.DateTimeTokenType.ERA:
                    // nothing
                    break;
                case token_1.DateTimeTokenType.YEAR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.year = pnr.n;
                    break;
                case token_1.DateTimeTokenType.QUARTER:
                    // nothing
                    break;
                case token_1.DateTimeTokenType.MONTH:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.month = pnr.n;
                    break;
                case token_1.DateTimeTokenType.DAY:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.day = pnr.n;
                    break;
                case token_1.DateTimeTokenType.WEEKDAY:
                    // nothing
                    break;
                case token_1.DateTimeTokenType.DAYPERIOD:
                    // nothing
                    break;
                case token_1.DateTimeTokenType.HOUR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.hour = pnr.n;
                    break;
                case token_1.DateTimeTokenType.MINUTE:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.minute = pnr.n;
                    break;
                case token_1.DateTimeTokenType.SECOND:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    if (token.raw.charAt(0) === "s") {
                        time.second = pnr.n;
                    }
                    else if (token.raw.charAt(0) === "S") {
                        time.milli = pnr.n;
                    }
                    else {
                        throw new Error("unsupported second format '" + token.raw + "'");
                    }
                    break;
                case token_1.DateTimeTokenType.ZONE:
                    pzr = stripZone(remaining);
                    remaining = pzr.remaining;
                    zone = pzr.zone;
                    break;
                case token_1.DateTimeTokenType.WEEK:
                    // nothing
                    break;
                default:
                case token_1.DateTimeTokenType.IDENTITY:
                    remaining = stripRaw(remaining, token.raw);
                    break;
            }
        }
        ;
        var result = { time: new basics_1.TimeStruct(time), zone: zone || null };
        if (!result.time.validate()) {
            throw new Error("resulting date invalid");
        }
        // always overwrite zone with given zone
        if (overrideZone) {
            result.zone = overrideZone;
        }
        if (remaining && !allowTrailing) {
            throw new Error("invalid date '" + dateTimeString + "' not according to format '" + formatString + "': trailing characters: 'remaining'");
        }
        return result;
    }
    catch (e) {
        throw new Error("invalid date '" + dateTimeString + "' not according to format '" + formatString + "': " + e.message);
    }
}
exports.parse = parse;
function stripNumber(s) {
    var result = {
        n: NaN,
        remaining: s
    };
    var numberString = "";
    while (result.remaining.length > 0 && result.remaining.charAt(0).match(/\d/)) {
        numberString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    // remove leading zeroes
    while (numberString.charAt(0) === "0" && numberString.length > 1) {
        numberString = numberString.substr(1);
    }
    result.n = parseInt(numberString, 10);
    if (numberString === "" || !isFinite(result.n)) {
        throw new Error("expected a number but got '" + numberString + "'");
    }
    return result;
}
var WHITESPACE = [" ", "\t", "\r", "\v", "\n"];
function stripZone(s) {
    if (s.length === 0) {
        throw new Error("no zone given");
    }
    var result = {
        zone: null,
        remaining: s
    };
    var zoneString = "";
    while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
        zoneString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    result.zone = timezone_1.TimeZone.zone(zoneString);
    return result;
}
function stripRaw(s, expected) {
    var remaining = s;
    var eremaining = expected;
    while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
        remaining = remaining.substr(1);
        eremaining = eremaining.substr(1);
    }
    if (eremaining.length > 0) {
        throw new Error("expected '" + expected + "'");
    }
    return remaining;
}

},{"./basics":2,"./timezone":13,"./token":14}],10:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Periodic interval functions
 */
"use strict";
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var duration_1 = require("./duration");
var datetime_1 = require("./datetime");
var timezone_1 = require("./timezone");
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
     * a period of one day, referenceing at 8:05AM Europe/Amsterdam time
     * will always reference at 8:05 Europe/Amsterdam. This means that
     * in UTC time, some intervals will be 25 hours and some
     * 23 hours during DST changes.
     * Another example: an hourly interval will be hourly in local time,
     * skipping an hour in UTC for a DST backward change.
     */
    PeriodDst[PeriodDst["RegularLocalTime"] = 1] = "RegularLocalTime";
    /**
     * End-of-enum marker
     */
    PeriodDst[PeriodDst["MAX"] = 2] = "MAX";
})(exports.PeriodDst || (exports.PeriodDst = {}));
var PeriodDst = exports.PeriodDst;
/**
 * Convert a PeriodDst to a string: "regular intervals" or "regular local time"
 */
function periodDstToString(p) {
    switch (p) {
        case PeriodDst.RegularIntervals: return "regular intervals";
        case PeriodDst.RegularLocalTime: return "regular local time";
        /* istanbul ignore next */
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
 * Repeating time period: consists of a reference date and
 * a time length. This class accounts for leap seconds and leap days.
 */
var Period = (function () {
    /**
     * Constructor implementation. See other constructors for explanation.
     */
    function Period(reference, amountOrInterval, unitOrDst, givenDst) {
        var interval;
        var dst = PeriodDst.RegularLocalTime;
        if (typeof (amountOrInterval) === "object") {
            interval = amountOrInterval;
            dst = unitOrDst;
        }
        else {
            assert_1.default(typeof unitOrDst === "number" && unitOrDst >= 0 && unitOrDst < basics_1.TimeUnit.MAX, "Invalid unit");
            interval = new duration_1.Duration(amountOrInterval, unitOrDst);
            dst = givenDst;
        }
        if (typeof dst !== "number") {
            dst = PeriodDst.RegularLocalTime;
        }
        assert_1.default(dst >= 0 && dst < PeriodDst.MAX, "Invalid PeriodDst setting");
        assert_1.default(!!reference, "Reference time not given");
        assert_1.default(interval.amount() > 0, "Amount must be positive non-zero.");
        assert_1.default(Math.floor(interval.amount()) === interval.amount(), "Amount must be a whole number");
        this._reference = reference;
        this._interval = interval;
        this._dst = dst;
        this._calcInternalValues();
        // regular local time keeping is only supported if we can reset each day
        // Note we use internal amounts to decide this because actually it is supported if
        // the input is a multiple of one day.
        if (this._dstRelevant() && dst === PeriodDst.RegularLocalTime) {
            switch (this._intInterval.unit()) {
                case basics_1.TimeUnit.Millisecond:
                    assert_1.default(this._intInterval.amount() < 86400000, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Second:
                    assert_1.default(this._intInterval.amount() < 86400, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Minute:
                    assert_1.default(this._intInterval.amount() < 1440, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Hour:
                    assert_1.default(this._intInterval.amount() < 24, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
            }
        }
    }
    /**
     * Return a fresh copy of the period
     */
    Period.prototype.clone = function () {
        return new Period(this._reference, this._interval, this._dst);
    };
    /**
     * The reference date
     */
    Period.prototype.reference = function () {
        return this._reference;
    };
    /**
     * DEPRECATED: old name for the reference date
     */
    Period.prototype.start = function () {
        return this._reference;
    };
    /**
     * The interval
     */
    Period.prototype.interval = function () {
        return this._interval.clone();
    };
    /**
     * The amount of units of the interval
     */
    Period.prototype.amount = function () {
        return this._interval.amount();
    };
    /**
     * The unit of the interval
     */
    Period.prototype.unit = function () {
        return this._interval.unit();
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
     * Pre: the fromdate and reference date must either both have timezones or not
     * @param fromDate: the date after which to return the next date
     * @return the first date matching the period after fromDate, given
     *			in the same zone as the fromDate.
     */
    Period.prototype.findFirst = function (fromDate) {
        assert_1.default(!!this._intReference.zone() === !!fromDate.zone(), "The fromDate and reference date must both be aware or unaware");
        var approx;
        var approx2;
        var approxMin;
        var periods;
        var diff;
        var newYear;
        var newMonth;
        var remainder;
        var imax;
        var imin;
        var imid;
        var normalFrom = this._normalizeDay(fromDate.toZone(this._intReference.zone()));
        if (this._intInterval.amount() === 1) {
            // simple cases: amount equals 1 (eliminates need for searching for referenceing point)
            if (this._intDst === PeriodDst.RegularIntervals) {
                // apply to UTC time
                switch (this._intInterval.unit()) {
                    case basics_1.TimeUnit.Millisecond:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), normalFrom.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Second:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Minute:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), this._intReference.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Hour:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Day:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Month:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), this._intReference.utcDay(), this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    case basics_1.TimeUnit.Year:
                        approx = new datetime_1.DateTime(normalFrom.utcYear(), this._intReference.utcMonth(), this._intReference.utcDay(), this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(), this._intReference.utcMillisecond(), timezone_1.TimeZone.utc());
                        break;
                    /* istanbul ignore next */
                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intInterval.amount(), this._intInterval.unit());
                }
            }
            else {
                // Try to keep regular local intervals
                switch (this._intInterval.unit()) {
                    case basics_1.TimeUnit.Millisecond:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), normalFrom.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Second:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Minute:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Hour:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Day:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Month:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), this._intReference.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    case basics_1.TimeUnit.Year:
                        approx = new datetime_1.DateTime(normalFrom.year(), this._intReference.month(), this._intReference.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    /* istanbul ignore next */
                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intInterval.amount(), this._intInterval.unit());
                }
            }
        }
        else {
            // Amount is not 1,
            if (this._intDst === PeriodDst.RegularIntervals) {
                // apply to UTC time
                switch (this._intInterval.unit()) {
                    case basics_1.TimeUnit.Millisecond:
                        diff = normalFrom.diff(this._intReference).milliseconds();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Second:
                        diff = normalFrom.diff(this._intReference).seconds();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Minute:
                        // only 25 leap seconds have ever been added so this should still be OK.
                        diff = normalFrom.diff(this._intReference).minutes();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Hour:
                        diff = normalFrom.diff(this._intReference).hours();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Day:
                        diff = normalFrom.diff(this._intReference).hours() / 24;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Month:
                        diff = (normalFrom.utcYear() - this._intReference.utcYear()) * 12 +
                            (normalFrom.utcMonth() - this._intReference.utcMonth()) - 1;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Year:
                        // The -1 below is because the day-of-month of reference date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intReference.year() - 1;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.add(periods * this._intInterval.amount(), basics_1.TimeUnit.Year);
                        break;
                    /* istanbul ignore next */
                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intInterval.amount(), this._intInterval.unit());
                }
            }
            else {
                // Try to keep regular local times. If the unit is less than a day, we reference each day anew
                switch (this._intInterval.unit()) {
                    case basics_1.TimeUnit.Millisecond:
                        if (this._intInterval.amount() < 1000 && (1000 % this._intInterval.amount()) === 0) {
                            // optimization: same millisecond each second, so just take the fromDate
                            // minus one second with the this._intReference milliseconds
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intReference.millisecond(), this._intReference.zone())
                                .subLocal(1, basics_1.TimeUnit.Second);
                        }
                        else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate reference-of-day
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                            // since we start counting from this._intReference each day, we have to
                            // take care of the shorter interval at the boundary
                            remainder = Math.floor((86400000) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                // todo
                                /* istanbul ignore if */
                                if (approx.subLocal(remainder, basics_1.TimeUnit.Millisecond).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the reference date
                                    approx = approx.subLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                            else {
                                if (approx.addLocal(1, basics_1.TimeUnit.Day).subLocal(remainder, basics_1.TimeUnit.Millisecond).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                            // optimization: binary search
                            imax = Math.floor((86400000) / this._intInterval.amount());
                            imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                imid = Math.floor((imin + imax) / 2);
                                approx2 = approx.addLocal(imid * this._intInterval.amount(), basics_1.TimeUnit.Millisecond);
                                approxMin = approx2.subLocal(this._intInterval.amount(), basics_1.TimeUnit.Millisecond);
                                if (approx2.greaterThan(normalFrom) && approxMin.lessEqual(normalFrom)) {
                                    approx = approx2;
                                    break;
                                }
                                else if (approx2.lessEqual(normalFrom)) {
                                    // change min index to search upper subarray
                                    imin = imid + 1;
                                }
                                else {
                                    // change max index to search lower subarray
                                    imax = imid - 1;
                                }
                            }
                        }
                        break;
                    case basics_1.TimeUnit.Second:
                        if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
                            // optimization: same second each minute, so just take the fromDate
                            // minus one minute with the this._intReference seconds
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone())
                                .subLocal(1, basics_1.TimeUnit.Minute);
                        }
                        else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate reference-of-day
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                            // since we start counting from this._intReference each day, we have to take
                            // are of the shorter interval at the boundary
                            remainder = Math.floor((86400) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, basics_1.TimeUnit.Second).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the reference date
                                    approx = approx.subLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                            else {
                                if (approx.addLocal(1, basics_1.TimeUnit.Day).subLocal(remainder, basics_1.TimeUnit.Second).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                            // optimization: binary search
                            imax = Math.floor((86400) / this._intInterval.amount());
                            imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                imid = Math.floor((imin + imax) / 2);
                                approx2 = approx.addLocal(imid * this._intInterval.amount(), basics_1.TimeUnit.Second);
                                approxMin = approx2.subLocal(this._intInterval.amount(), basics_1.TimeUnit.Second);
                                if (approx2.greaterThan(normalFrom) && approxMin.lessEqual(normalFrom)) {
                                    approx = approx2;
                                    break;
                                }
                                else if (approx2.lessEqual(normalFrom)) {
                                    // change min index to search upper subarray
                                    imin = imid + 1;
                                }
                                else {
                                    // change max index to search lower subarray
                                    imax = imid - 1;
                                }
                            }
                        }
                        break;
                    case basics_1.TimeUnit.Minute:
                        if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
                            // optimization: same hour this._intReferenceary each time, so just take the fromDate minus one hour
                            // with the this._intReference minutes, seconds
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone())
                                .subLocal(1, basics_1.TimeUnit.Hour);
                        }
                        else {
                            // per constructor assert, the seconds fit in a day, so just go the fromDate previous day
                            approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                            // since we start counting from this._intReference each day,
                            // we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 60) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, basics_1.TimeUnit.Minute).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the reference date
                                    approx = approx.subLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                            else {
                                if (approx.addLocal(1, basics_1.TimeUnit.Day).subLocal(remainder, basics_1.TimeUnit.Minute).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, basics_1.TimeUnit.Day);
                                }
                            }
                        }
                        break;
                    case basics_1.TimeUnit.Hour:
                        approx = new datetime_1.DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        // since we start counting from this._intReference each day,
                        // we have to take care of the shorter interval at the boundary
                        remainder = Math.floor(24 % this._intInterval.amount());
                        if (approx.greaterThan(normalFrom)) {
                            if (approx.subLocal(remainder, basics_1.TimeUnit.Hour).greaterThan(normalFrom)) {
                                // normalFrom lies outside the boundary period before the reference date
                                approx = approx.subLocal(1, basics_1.TimeUnit.Day);
                            }
                        }
                        else {
                            if (approx.addLocal(1, basics_1.TimeUnit.Day).subLocal(remainder, basics_1.TimeUnit.Hour).lessEqual(normalFrom)) {
                                // normalFrom lies in the boundary period, move to the next day
                                approx = approx.addLocal(1, basics_1.TimeUnit.Day);
                            }
                        }
                        break;
                    case basics_1.TimeUnit.Day:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        diff = normalFrom.diff(this._intReference).hours() / 24;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.addLocal(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case basics_1.TimeUnit.Month:
                        diff = (normalFrom.year() - this._intReference.year()) * 12 +
                            (normalFrom.month() - this._intReference.month());
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intReference.addLocal(this._interval.multiply(periods));
                        break;
                    case basics_1.TimeUnit.Year:
                        // The -1 below is because the day-of-month of reference date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intReference.year() - 1;
                        periods = Math.floor(diff / this._intInterval.amount());
                        newYear = this._intReference.year() + periods * this._intInterval.amount();
                        approx = new datetime_1.DateTime(newYear, this._intReference.month(), this._intReference.day(), this._intReference.hour(), this._intReference.minute(), this._intReference.second(), this._intReference.millisecond(), this._intReference.zone());
                        break;
                    /* istanbul ignore next */
                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intInterval.amount(), this._intInterval.unit());
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
     * @param prev	Boundary date. Must have a time zone (any time zone) iff the period reference date has one.
     * @param count	Number of periods to add. Optional. Must be an integer number, may be negative.
     * @return (prev + count * period), in the same timezone as prev.
     */
    Period.prototype.findNext = function (prev, count) {
        if (count === void 0) { count = 1; }
        assert_1.default(!!prev, "Prev must be given");
        assert_1.default(!!this._intReference.zone() === !!prev.zone(), "The fromDate and referenceDate must both be aware or unaware");
        assert_1.default(typeof (count) === "number", "Count must be a number");
        assert_1.default(Math.floor(count) === count, "Count must be an integer");
        var normalizedPrev = this._normalizeDay(prev.toZone(this._reference.zone()));
        if (this._intDst === PeriodDst.RegularIntervals) {
            return this._correctDay(normalizedPrev.add(this._intInterval.amount() * count, this._intInterval.unit())).convert(prev.zone());
        }
        else {
            return this._correctDay(normalizedPrev.addLocal(this._intInterval.amount() * count, this._intInterval.unit())).convert(prev.zone());
        }
    };
    /**
     * The last occurrence of the period less than
     * the given date. The given date need not be at a period boundary.
     * Pre: the fromdate and the period reference date must either both have timezones or not
     * @param fromDate: the date before which to return the next date
     * @return the last date matching the period before fromDate, given
     *			in the same zone as the fromDate.
     */
    Period.prototype.findLast = function (from) {
        var result = this.findPrev(this.findFirst(from));
        if (result.equals(from)) {
            result = this.findPrev(result);
        }
        return result;
    };
    /**
     * Returns the previous timestamp in the period. The given timestamp must
     * be at a period boundary, otherwise the answer is incorrect.
     * @param prev	Boundary date. Must have a time zone (any time zone) iff the period reference date has one.
     * @param count	Number of periods to subtract. Optional. Must be an integer number, may be negative.
     * @return (next - count * period), in the same timezone as next.
     */
    Period.prototype.findPrev = function (next, count) {
        if (count === void 0) { count = 1; }
        return this.findNext(next, -1 * count);
    };
    /**
     * Checks whether the given date is on a period boundary
     * (expensive!)
     */
    Period.prototype.isBoundary = function (occurrence) {
        if (!occurrence) {
            return false;
        }
        assert_1.default(!!this._intReference.zone() === !!occurrence.zone(), "The occurrence and referenceDate must both be aware or unaware");
        return (this.findFirst(occurrence.sub(duration_1.Duration.milliseconds(1))).equals(occurrence));
    };
    /**
     * Returns true iff this period has the same effect as the given one.
     * i.e. a period of 24 hours is equal to one of 1 day if they have the same UTC reference moment
     * and same dst.
     */
    Period.prototype.equals = function (other) {
        // note we take the non-normalized reference() because this has an influence on the outcome
        return (this.isBoundary(other.reference())
            && this._intInterval.equalsExact(other.interval())
            && this._intDst === other._intDst);
    };
    /**
     * Returns true iff this period was constructed with identical arguments to the other one.
     */
    Period.prototype.identical = function (other) {
        return (this._reference.identical(other.reference())
            && this._interval.identical(other.interval())
            && this.dst() === other.dst());
    };
    /**
     * Returns an ISO duration string e.g.
     * 2014-01-01T12:00:00.000+01:00/P1H
     * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
     * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
     */
    Period.prototype.toIsoString = function () {
        return this._reference.toIsoString() + "/" + this._interval.toIsoString();
    };
    /**
     * A string representation e.g.
     * "10 years, referenceing at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
     */
    Period.prototype.toString = function () {
        var result = this._interval.toString() + ", referenceing at " + this._reference.toString();
        // only add the DST handling if it is relevant
        if (this._dstRelevant()) {
            result += ", keeping " + periodDstToString(this._dst);
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
     * Corrects the difference between _reference and _intReference.
     */
    Period.prototype._correctDay = function (d) {
        if (this._reference !== this._intReference) {
            return new datetime_1.DateTime(d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._reference.day()), d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        }
        else {
            return d;
        }
    };
    /**
     * If this._internalUnit in [Month, Year], normalizes the day-of-month
     * to <= 28.
     * @return a new date if different, otherwise the exact same object (no clone!)
     */
    Period.prototype._normalizeDay = function (d, anymonth) {
        if (anymonth === void 0) { anymonth = true; }
        if ((this._intInterval.unit() === basics_1.TimeUnit.Month && d.day() > 28)
            || (this._intInterval.unit() === basics_1.TimeUnit.Year && (d.month() === 2 || anymonth) && d.day() > 28)) {
            return new datetime_1.DateTime(d.year(), d.month(), 28, d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        }
        else {
            return d; // save on time by not returning a clone
        }
    };
    /**
     * Returns true if DST handling is relevant for us.
     * (i.e. if the reference time zone has DST)
     */
    Period.prototype._dstRelevant = function () {
        return (!!this._reference.zone()
            && this._reference.zone().kind() === timezone_1.TimeZoneKind.Proper
            && this._reference.zone().hasDst());
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
        var intAmount = this._interval.amount();
        var intUnit = this._interval.unit();
        if (intUnit === basics_1.TimeUnit.Millisecond && intAmount >= 1000 && intAmount % 1000 === 0) {
            // note this won't work if we account for leap seconds
            intAmount = intAmount / 1000;
            intUnit = basics_1.TimeUnit.Second;
        }
        if (intUnit === basics_1.TimeUnit.Second && intAmount >= 60 && intAmount % 60 === 0) {
            // note this won't work if we account for leap seconds
            intAmount = intAmount / 60;
            intUnit = basics_1.TimeUnit.Minute;
        }
        if (intUnit === basics_1.TimeUnit.Minute && intAmount >= 60 && intAmount % 60 === 0) {
            intAmount = intAmount / 60;
            intUnit = basics_1.TimeUnit.Hour;
        }
        if (intUnit === basics_1.TimeUnit.Hour && intAmount >= 24 && intAmount % 24 === 0) {
            intAmount = intAmount / 24;
            intUnit = basics_1.TimeUnit.Day;
        }
        // now remove weeks so we have one less case to worry about
        if (intUnit === basics_1.TimeUnit.Week) {
            intAmount = intAmount * 7;
            intUnit = basics_1.TimeUnit.Day;
        }
        if (intUnit === basics_1.TimeUnit.Month && intAmount >= 12 && intAmount % 12 === 0) {
            intAmount = intAmount / 12;
            intUnit = basics_1.TimeUnit.Year;
        }
        this._intInterval = new duration_1.Duration(intAmount, intUnit);
        // normalize dst handling
        if (this._dstRelevant()) {
            this._intDst = this._dst;
        }
        else {
            this._intDst = PeriodDst.RegularIntervals;
        }
        // normalize reference day
        this._intReference = this._normalizeDay(this._reference, false);
    };
    return Period;
}());
exports.Period = Period;

},{"./assert":1,"./basics":2,"./datetime":3,"./duration":4,"./timezone":13}],11:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * String utility functions
 */
"use strict";
/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
function padLeft(s, width, char) {
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
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return s + padding;
}
exports.padRight = padRight;

},{}],12:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 */
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
}());
exports.RealTimeSource = RealTimeSource;

},{}],13:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time zone representation and offset calculation
 */
"use strict";
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var strings = require("./strings");
var tz_database_1 = require("./tz-database");
/**
 * The local time zone for a given date as per OS settings. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 */
function local() {
    return TimeZone.local();
}
exports.local = local;
/**
 * Coordinated Universal Time zone. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 */
function utc() {
    return TimeZone.utc();
}
exports.utc = utc;
/**
 * See the descriptions for the other zone() method signatures.
 */
function zone(a, dst) {
    return TimeZone.zone(a, dst);
}
exports.zone = zone;
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
     * @param dst	Adhere to Daylight Saving Time if applicable, ignored for local time and fixed offsets
     */
    function TimeZone(name, dst) {
        if (dst === void 0) { dst = true; }
        this._name = name;
        this._dst = dst;
        if (name === "localtime") {
            this._kind = TimeZoneKind.Local;
        }
        else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = TimeZoneKind.Offset;
            this._offset = TimeZone.stringToOffset(name);
        }
        else {
            this._kind = TimeZoneKind.Proper;
            assert_1.default(tz_database_1.TzDatabase.instance().exists(name), "non-existing time zone name '" + name + "'");
        }
    }
    /**
     * The local time zone for a given date. Note that
     * the time zone varies with the date: amsterdam time for
     * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
     */
    TimeZone.local = function () {
        return TimeZone._findOrCreate("localtime", true);
    };
    /**
     * The UTC time zone.
     */
    TimeZone.utc = function () {
        return TimeZone._findOrCreate("UTC", true); // use 'true' for DST because we want it to display as "UTC", not "UTC without DST"
    };
    /**
     * Zone implementations
     */
    TimeZone.zone = function (a, dst) {
        if (dst === void 0) { dst = true; }
        var name = "";
        switch (typeof (a)) {
            case "string":
                {
                    var s = a;
                    if (s.trim().length === 0) {
                        return null; // no time zone
                    }
                    else {
                        if (s.indexOf("without DST") >= 0) {
                            dst = false;
                            s = s.slice(0, s.indexOf("without DST") - 1);
                        }
                        name = TimeZone._normalizeString(s);
                    }
                }
                break;
            case "number":
                {
                    var offset = a;
                    assert_1.default(offset > -24 * 60 && offset < 24 * 60, "TimeZone.zone(): offset out of range");
                    name = TimeZone.offsetToString(offset);
                }
                break;
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");
                }
        }
        return TimeZone._findOrCreate(name, dst);
    };
    /**
     * Makes this class appear clonable. NOTE as time zone objects are cached you will NOT
     * actually get a clone but the same object.
     */
    TimeZone.prototype.clone = function () {
        return this;
    };
    /**
     * The time zone identifier. Can be an offset "-01:30" or an
     * IANA time zone name "Europe/Amsterdam", or "localtime" for
     * the local time zone.
     */
    TimeZone.prototype.name = function () {
        return this._name;
    };
    TimeZone.prototype.dst = function () {
        return this._dst;
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
            case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
            case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
            case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper
                && this._name === other._name
                && (this._dst === other._dst || !this.hasDst()));
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown time zone kind.");
                }
        }
    };
    /**
     * Returns true iff the constructor arguments were identical, so UTC !== GMT
     */
    TimeZone.prototype.identical = function (other) {
        switch (this._kind) {
            case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
            case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
            case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper && this._name === other._name && this._dst === other._dst);
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return (this._offset === 0);
            case TimeZoneKind.Proper: return (tz_database_1.TzDatabase.instance().zoneIsUtc(this._name));
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return false;
            case TimeZoneKind.Proper: return (tz_database_1.TzDatabase.instance().hasDst(this._name));
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return false;
                }
        }
    };
    TimeZone.prototype.offsetForUtc = function (a, month, day, hour, minute, second, milli) {
        var utcTime = (a && a instanceof basics_1.TimeStruct ? a : new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }));
        switch (this._kind) {
            case TimeZoneKind.Local: {
                var date = new Date(Date.UTC(utcTime.components.year, utcTime.components.month - 1, utcTime.components.day, utcTime.components.hour, utcTime.components.minute, utcTime.components.second, utcTime.components.milli));
                return -1 * date.getTimezoneOffset();
            }
            case TimeZoneKind.Offset: {
                return this._offset;
            }
            case TimeZoneKind.Proper: {
                if (this._dst) {
                    return tz_database_1.TzDatabase.instance().totalOffset(this._name, utcTime).minutes();
                }
                else {
                    return tz_database_1.TzDatabase.instance().standardOffset(this._name, utcTime).minutes();
                }
            }
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("unknown TimeZoneKind '" + this._kind + "'");
                }
        }
    };
    TimeZone.prototype.offsetForZone = function (a, month, day, hour, minute, second, milli) {
        var localTime = (a && a instanceof basics_1.TimeStruct ? a : new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }));
        switch (this._kind) {
            case TimeZoneKind.Local: {
                var date = new Date(localTime.components.year, localTime.components.month - 1, localTime.components.day, localTime.components.hour, localTime.components.minute, localTime.components.second, localTime.components.milli);
                return -1 * date.getTimezoneOffset();
            }
            case TimeZoneKind.Offset: {
                return this._offset;
            }
            case TimeZoneKind.Proper: {
                // note that TzDatabase normalizes the given date so we don't have to do it
                if (this._dst) {
                    return tz_database_1.TzDatabase.instance().totalOffsetLocal(this._name, localTime).minutes();
                }
                else {
                    return tz_database_1.TzDatabase.instance().standardOffset(this._name, localTime).minutes();
                }
            }
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("unknown TimeZoneKind '" + this._kind + "'");
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
        return this.offsetForUtc(basics_1.TimeStruct.fromDate(date, funcs));
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
        return this.offsetForZone(basics_1.TimeStruct.fromDate(date, funcs));
    };
    TimeZone.prototype.abbreviationForUtc = function (a, b, day, hour, minute, second, milli, c) {
        var utcTime;
        var dstDependent = true;
        if (a instanceof basics_1.TimeStruct) {
            utcTime = a;
            dstDependent = (b === false ? false : true);
        }
        else {
            utcTime = new basics_1.TimeStruct({ year: a, month: b, day: day, hour: hour, minute: minute, second: second, milli: milli });
            dstDependent = (c === false ? false : true);
        }
        switch (this._kind) {
            case TimeZoneKind.Local: {
                return "local";
            }
            case TimeZoneKind.Offset: {
                return this.toString();
            }
            case TimeZoneKind.Proper: {
                return tz_database_1.TzDatabase.instance().abbreviation(this._name, utcTime, dstDependent);
            }
            /* istanbul ignore next */
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("unknown TimeZoneKind '" + this._kind + "'");
                }
        }
    };
    TimeZone.prototype.normalizeZoneTime = function (localTime, opt) {
        if (opt === void 0) { opt = tz_database_1.NormalizeOption.Up; }
        var tzopt = (opt === tz_database_1.NormalizeOption.Down ? tz_database_1.NormalizeOption.Down : tz_database_1.NormalizeOption.Up);
        if (this.kind() === TimeZoneKind.Proper) {
            if (typeof localTime === "number") {
                return tz_database_1.TzDatabase.instance().normalizeLocal(this._name, new basics_1.TimeStruct(localTime), tzopt).unixMillis;
            }
            else {
                return tz_database_1.TzDatabase.instance().normalizeLocal(this._name, localTime, tzopt);
            }
        }
        else {
            return localTime;
        }
    };
    /**
     * The time zone identifier (normalized).
     * Either "localtime", IANA name, or "+hh:mm" offset.
     */
    TimeZone.prototype.toString = function () {
        var result = this.name();
        if (this.kind() === TimeZoneKind.Proper) {
            if (this.hasDst() && !this.dst()) {
                result += " without DST";
            }
        }
        return result;
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
        assert_1.default(t.match(/^[+-]\d\d(:?)\d\d$/) || t.match(/^[+-]\d\d$/), "Wrong time zone format: \"" + t + "\"");
        var sign = (t.charAt(0) === "+" ? 1 : -1);
        var hours = parseInt(t.substr(1, 2), 10);
        var minutes = 0;
        if (t.length === 5) {
            minutes = parseInt(t.substr(3, 2), 10);
        }
        else if (t.length === 6) {
            minutes = parseInt(t.substr(4, 2), 10);
        }
        assert_1.default(hours >= 0 && hours < 24, "Offsets from UTC must be less than a day.");
        return sign * (hours * 60 + minutes);
    };
    /**
     * Find in cache or create zone
     * @param name	Time zone name
     * @param dst	Adhere to Daylight Saving Time?
     */
    TimeZone._findOrCreate = function (name, dst) {
        var key = name + (dst ? "_DST" : "_NO-DST");
        if (key in TimeZone._cache) {
            return TimeZone._cache[key];
        }
        else {
            var t = new TimeZone(name, dst);
            TimeZone._cache[key] = t;
            return t;
        }
    };
    /**
     * Normalize a string so it can be used as a key for a
     * cache lookup
     */
    TimeZone._normalizeString = function (s) {
        var t = s.trim();
        assert_1.default(t.length > 0, "Empty time zone string given");
        if (t === "localtime") {
            return t;
        }
        else if (t === "Z") {
            return "+00:00";
        }
        else if (TimeZone._isOffsetString(t)) {
            // offset string
            // normalize by converting back and forth
            return TimeZone.offsetToString(TimeZone.stringToOffset(t));
        }
        else {
            // Olsen TZ database name
            return t;
        }
    };
    TimeZone._isOffsetString = function (s) {
        var t = s.trim();
        return (t.charAt(0) === "+" || t.charAt(0) === "-" || t === "Z");
    };
    /**
     * Time zone cache.
     */
    TimeZone._cache = {};
    return TimeZone;
}());
exports.TimeZone = TimeZone;

},{"./assert":1,"./basics":2,"./strings":11,"./tz-database":15}],14:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
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
                type: DateTimeTokenType.IDENTITY
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
                    }
                    else {
                        possibleEscaping = true;
                    }
                }
                else {
                    // Two possibilities: Were are done quoting, or we are escaping a ' character
                    if (possibleEscaping) {
                        // Escaping, add ' to the token
                        currentToken += currentChar;
                        possibleEscaping = false;
                    }
                    else {
                        // Maybe escaping, wait for next token if we are escaping
                        possibleEscaping = true;
                    }
                }
                if (!possibleEscaping) {
                    // Current character is relevant, so save it for inspecting next round
                    previousChar = currentChar;
                }
                continue;
            }
            else if (possibleEscaping) {
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
            }
            else {
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
}());
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
    "G": DateTimeTokenType.ERA,
    "y": DateTimeTokenType.YEAR,
    "Y": DateTimeTokenType.YEAR,
    "u": DateTimeTokenType.YEAR,
    "U": DateTimeTokenType.YEAR,
    "r": DateTimeTokenType.YEAR,
    "Q": DateTimeTokenType.QUARTER,
    "q": DateTimeTokenType.QUARTER,
    "M": DateTimeTokenType.MONTH,
    "L": DateTimeTokenType.MONTH,
    "l": DateTimeTokenType.MONTH,
    "w": DateTimeTokenType.WEEK,
    "W": DateTimeTokenType.WEEK,
    "d": DateTimeTokenType.DAY,
    "D": DateTimeTokenType.DAY,
    "F": DateTimeTokenType.DAY,
    "g": DateTimeTokenType.DAY,
    "E": DateTimeTokenType.WEEKDAY,
    "e": DateTimeTokenType.WEEKDAY,
    "c": DateTimeTokenType.WEEKDAY,
    "a": DateTimeTokenType.DAYPERIOD,
    "h": DateTimeTokenType.HOUR,
    "H": DateTimeTokenType.HOUR,
    "k": DateTimeTokenType.HOUR,
    "K": DateTimeTokenType.HOUR,
    "j": DateTimeTokenType.HOUR,
    "J": DateTimeTokenType.HOUR,
    "m": DateTimeTokenType.MINUTE,
    "s": DateTimeTokenType.SECOND,
    "S": DateTimeTokenType.SECOND,
    "A": DateTimeTokenType.SECOND,
    "z": DateTimeTokenType.ZONE,
    "Z": DateTimeTokenType.ZONE,
    "O": DateTimeTokenType.ZONE,
    "v": DateTimeTokenType.ZONE,
    "V": DateTimeTokenType.ZONE,
    "X": DateTimeTokenType.ZONE,
    "x": DateTimeTokenType.ZONE
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
    }
    else {
        return DateTimeTokenType.IDENTITY;
    }
}

},{}],15:[function(require,module,exports){
(function (global){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 *
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 */
"use strict";
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var duration_1 = require("./duration");
var math = require("./math");
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
    function RuleInfo(
        /**
         * FROM column year number.
         * Note, can be -10000 for NaN value (e.g. for "SystemV" rules)
         */
        from, 
        /**
         * TO column type: Year for year numbers and "only" values, Max for "max" value.
         */
        toType, 
        /**
         * If TO column is a year, the year number. If TO column is "only", the FROM year.
         */
        toYear, 
        /**
         * TYPE column, not used so far
         */
        type, 
        /**
         * IN column month number 1-12
         */
        inMonth, 
        /**
         * ON column type
         */
        onType, 
        /**
         * If onType is DayNum, the day number
         */
        onDay, 
        /**
         * If onType is not DayNum, the weekday
         */
        onWeekDay, 
        /**
         * AT column hour
         */
        atHour, 
        /**
         * AT column minute
         */
        atMinute, 
        /**
         * AT column second
         */
        atSecond, 
        /**
         * AT column type
         */
        atType, 
        /**
         * DST offset from local standard time (NOT from UTC!)
         */
        save, 
        /**
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
        if (this.save) {
            this.save = this.save.convert(basics_1.TimeUnit.Hour);
        }
    }
    /**
     * Returns true iff this rule is applicable in the year
     */
    RuleInfo.prototype.applicable = function (year) {
        if (year < this.from) {
            return false;
        }
        switch (this.toType) {
            case ToType.Max: return true;
            case ToType.Year: return (year <= this.toYear);
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
        if (this.effectiveDate(this.from) < other.effectiveDate(this.from)) {
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
        assert_1.default(this.applicable(year), "Rule is not applicable in " + year.toString(10));
        // year and month are given
        var tm = { year: year, month: this.inMonth };
        // calculate day
        switch (this.onType) {
            case OnType.DayNum:
                {
                    tm.day = this.onDay;
                }
                break;
            case OnType.GreqX:
                {
                    tm.day = basics.weekDayOnOrAfter(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case OnType.LeqX:
                {
                    tm.day = basics.weekDayOnOrBefore(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case OnType.LastX:
                {
                    tm.day = basics.lastWeekDayOfMonth(year, this.inMonth, this.onWeekDay);
                }
                break;
        }
        // calculate time
        tm.hour = this.atHour;
        tm.minute = this.atMinute;
        tm.second = this.atSecond;
        return new basics_1.TimeStruct(tm);
    };
    /**
     * Returns the transition moment in UTC in the given year
     *
     * @param year	The year for which to return the transition
     * @param standardOffset	The standard offset for the timezone without DST
     * @param prevRule	The previous rule
     */
    RuleInfo.prototype.transitionTimeUtc = function (year, standardOffset, prevRule) {
        assert_1.default(this.applicable(year), "Rule not applicable in given year");
        var unixMillis = this.effectiveDate(year).unixMillis;
        // adjust for given offset
        var offset;
        switch (this.atType) {
            case AtType.Utc:
                offset = duration_1.Duration.hours(0);
                break;
            case AtType.Standard:
                offset = standardOffset;
                break;
            case AtType.Wall:
                if (prevRule) {
                    offset = standardOffset.add(prevRule.save);
                }
                else {
                    offset = standardOffset;
                }
                break;
            /* istanbul ignore next */
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
}());
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
    function ZoneInfo(
        /**
         * GMT offset in fractional minutes, POSITIVE to UTC (note JavaScript.Date gives offsets
         * contrary to what you might expect).  E.g. Europe/Amsterdam has +60 minutes in this field because
         * it is one hour ahead of UTC
         */
        gmtoff, 
        /**
         * The RULES column tells us whether daylight saving time is being observed:
         * A hyphen, a kind of null value, means that we have not set our clocks ahead of standard time.
         * An amount of time (usually but not necessarily “1:00” meaning one hour) means that we have set our clocks ahead by that amount.
         * Some alphabetic string means that we might have set our clocks ahead; and we need to check the rule
         * the name of which is the given alphabetic string.
         */
        ruleType, 
        /**
         * If the rule column is an offset, this is the offset
         */
        ruleOffset, 
        /**
         * If the rule column is a rule name, this is the rule name
         */
        ruleName, 
        /**
         * The FORMAT column specifies the usual abbreviation of the time zone name. It can have one of four forms:
         * the string, “zzz,” which is a kind of null value (don’t ask)
         * a single alphabetic string other than “zzz,” in which case that’s the abbreviation
         * a pair of strings separated by a slash (‘/’), in which case the first string is the abbreviation
         * for the standard time name and the second string is the abbreviation for the daylight saving time name
         * a string containing “%s,” in which case the “%s” will be replaced by the text in the appropriate Rule’s LETTER column
         */
        format, 
        /**
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
        if (this.ruleOffset) {
            this.ruleOffset = this.ruleOffset.convert(basics.TimeUnit.Hour);
        }
    }
    return ZoneInfo;
}());
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
    function Transition(
        /**
         * Transition time in UTC millis
         */
        at, 
        /**
         * New offset (type of offset depends on the function)
         */
        offset, 
        /**
         * New timzone abbreviation letter
         */
        letter) {
        this.at = at;
        this.offset = offset;
        this.letter = letter;
        if (this.offset) {
            this.offset = this.offset.convert(basics.TimeUnit.Hour);
        }
    }
    return Transition;
}());
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
 * This class is a wrapper around time zone data JSON object from the tzdata NPM module.
 * You usually do not need to use this directly, use TimeZone and DateTime instead.
 */
var TzDatabase = (function () {
    /**
     * Constructor - do not use, this is a singleton class. Use TzDatabase.instance() instead
     */
    function TzDatabase(data) {
        var _this = this;
        /**
         * Performance improvement: zone info cache
         */
        this._zoneInfoCache = {};
        /**
         * Performance improvement: rule info cache
         */
        this._ruleInfoCache = {};
        assert_1.default(!TzDatabase._instance, "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        assert_1.default(data.length > 0, "Timezonecomplete needs time zone data. You need to install one of the tzdata NPM modules before using timezonecomplete.");
        if (data.length === 1) {
            this._data = data[0];
        }
        else {
            this._data = { zones: {}, rules: {} };
            data.forEach(function (d) {
                if (d && d.rules && d.zones) {
                    for (var _i = 0, _a = Object.keys(d.rules); _i < _a.length; _i++) {
                        var key = _a[_i];
                        _this._data.rules[key] = d.rules[key];
                    }
                    for (var _b = 0, _c = Object.keys(d.zones); _b < _c.length; _b++) {
                        var key = _c[_b];
                        _this._data.zones[key] = d.zones[key];
                    }
                }
            });
        }
        this._minmax = validateData(this._data);
    }
    /**
     * (re-) initialize timezonecomplete with time zone data
     *
     * @param data TZ data as JSON object (from one of the tzdata NPM modules).
     *             If not given, Timezonecomplete will search for installed modules.
     */
    TzDatabase.init = function (data) {
        if (data) {
            TzDatabase._instance = undefined;
            TzDatabase._instance = new TzDatabase(Array.isArray(data) ? data : [data]);
        }
        else {
            TzDatabase._instance = undefined;
            TzDatabase.instance();
        }
    };
    /**
     * Single instance of this database
     */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            var data_1 = [];
            // try to find TZ data in global variables
            var g = (global ? global : window);
            if (g) {
                for (var _i = 0, _a = Object.keys(g); _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (key.indexOf("tzdata") === 0) {
                        if (typeof g[key] === "object" && g[key].rules && g[key].zones) {
                            data_1.push(g[key]);
                        }
                    }
                }
            }
            // try to find TZ data as installed NPM modules
            var findNodeModules = function (require) {
                try {
                    // first try tzdata which contains all data
                    var tzDataName = "tzdata";
                    var d = require(tzDataName); // use variable to avoid browserify acting up
                    data_1.push(d);
                }
                catch (e) {
                    // then try subsets
                    var moduleNames = [
                        "tzdata-africa",
                        "tzdata-antarctica",
                        "tzdata-asia",
                        "tzdata-australasia",
                        "tzdata-backward",
                        "tzdata-backward-utc",
                        "tzdata-etcetera",
                        "tzdata-europe",
                        "tzdata-northamerica",
                        "tzdata-pacificnew",
                        "tzdata-southamerica",
                        "tzdata-systemv"
                    ];
                    var existing = [];
                    var existingPaths = [];
                    moduleNames.forEach(function (moduleName) {
                        try {
                            var d = require(moduleName);
                            data_1.push(d);
                        }
                        catch (e) {
                        }
                    });
                }
            };
            if (data_1.length === 0) {
                if (typeof module === "object" && typeof module.exports === "object") {
                    findNodeModules(require); // need to put require into a function to make webpack happy
                }
            }
            TzDatabase._instance = new TzDatabase(data_1);
        }
        return TzDatabase._instance;
    };
    /**
     * Returns a sorted list of all zone names
     */
    TzDatabase.prototype.zoneNames = function () {
        if (!this._zoneNames) {
            this._zoneNames = Object.keys(this._data.zones);
            this._zoneNames.sort();
        }
        return this._zoneNames;
    };
    TzDatabase.prototype.exists = function (zoneName) {
        return this._data.zones.hasOwnProperty(zoneName);
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
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            for (var i = 0; i < zoneInfos.length; ++i) {
                var zoneInfo = zoneInfos[i];
                if (zoneInfo.ruleType === RuleType.Offset) {
                    if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
                        if (zoneInfo.ruleOffset.milliseconds() !== 0) {
                            result = zoneInfo.ruleOffset;
                        }
                    }
                }
                if (zoneInfo.ruleType === RuleType.RuleName
                    && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = this.getRuleInfos(zoneInfo.ruleName);
                    for (var j = 0; j < temp.length; ++j) {
                        var ruleInfo = temp[j];
                        if (!result || result.greaterThan(ruleInfo.save)) {
                            if (ruleInfo.save.milliseconds() !== 0) {
                                result = ruleInfo.save;
                            }
                        }
                    }
                    ;
                }
            }
            ;
            if (!result) {
                result = duration_1.Duration.hours(0);
            }
            return result.clone();
        }
        else {
            return duration_1.Duration.minutes(this._minmax.minDstSave);
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
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            for (var i = 0; i < zoneInfos.length; ++i) {
                var zoneInfo = zoneInfos[i];
                if (zoneInfo.ruleType === RuleType.Offset) {
                    if (!result || result.lessThan(zoneInfo.ruleOffset)) {
                        result = zoneInfo.ruleOffset;
                    }
                }
                if (zoneInfo.ruleType === RuleType.RuleName
                    && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = this.getRuleInfos(zoneInfo.ruleName);
                    for (var j = 0; j < temp.length; ++j) {
                        var ruleInfo = temp[j];
                        if (!result || result.lessThan(ruleInfo.save)) {
                            result = ruleInfo.save;
                        }
                    }
                    ;
                }
            }
            ;
            if (!result) {
                result = duration_1.Duration.hours(0);
            }
            return result.clone();
        }
        else {
            return duration_1.Duration.minutes(this._minmax.maxDstSave);
        }
    };
    /**
     * Checks whether the zone has DST at all
     */
    TzDatabase.prototype.hasDst = function (zoneName) {
        return (this.maxDstSave(zoneName).milliseconds() !== 0);
    };
    TzDatabase.prototype.nextDstChange = function (zoneName, a) {
        var zoneInfo;
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct(a) : a);
        // get all zone infos for [date, date+1year)
        var allZoneInfos = this.getZoneInfos(zoneName);
        var relevantZoneInfos = [];
        var rangeStart = utcTime.unixMillis;
        var rangeEnd = rangeStart + 365 * 86400E3;
        var prevEnd = null;
        for (var i = 0; i < allZoneInfos.length; ++i) {
            zoneInfo = allZoneInfos[i];
            if ((prevEnd === null || prevEnd < rangeEnd) && (zoneInfo.until === null || zoneInfo.until > rangeStart)) {
                relevantZoneInfos.push(zoneInfo);
            }
            prevEnd = zoneInfo.until;
        }
        // collect all transitions in the zones for the year
        var transitions = [];
        for (var i = 0; i < relevantZoneInfos.length; ++i) {
            zoneInfo = relevantZoneInfos[i];
            // find applicable transition moments
            transitions = transitions.concat(this.getTransitionsDstOffsets(zoneInfo.ruleName, utcTime.components.year - 1, utcTime.components.year + 1, zoneInfo.gmtoff));
        }
        transitions.sort(function (a, b) {
            return a.at - b.at;
        });
        // find the first after the given date that has a different offset
        var prevSave = null;
        for (var i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (!prevSave || !prevSave.equals(transition.offset)) {
                if (transition.at > utcTime.unixMillis) {
                    return transition.at;
                }
            }
            prevSave = transition.offset;
        }
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
        // follow links
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
                    + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        return (actualZoneName === "Etc/UTC" || actualZoneName === "Etc/GMT" || actualZoneName === "Etc/UCT");
    };
    TzDatabase.prototype.normalizeLocal = function (zoneName, a, opt) {
        if (opt === void 0) { opt = NormalizeOption.Up; }
        if (this.hasDst(zoneName)) {
            var localTime = (typeof a === "number" ? new basics_1.TimeStruct(a) : a);
            // local times behave like this during DST changes:
            // forward change (1h):   0 1 3 4 5
            // forward change (2h):   0 1 4 5 6
            // backward change (1h):  1 2 2 3 4
            // backward change (2h):  1 2 1 2 3
            // Therefore, binary searching is not possible.
            // Instead, we should check the DST forward transitions within a window around the local time
            // get all transitions (note this includes fake transition rules for zone offset changes)
            var transitions = this.getTransitionsTotalOffsets(zoneName, localTime.components.year - 1, localTime.components.year + 1);
            // find the DST forward transitions
            var prev = duration_1.Duration.hours(0);
            for (var i = 0; i < transitions.length; ++i) {
                var transition = transitions[i];
                // forward transition?
                if (transition.offset.greaterThan(prev)) {
                    var localBefore = transition.at + prev.milliseconds();
                    var localAfter = transition.at + transition.offset.milliseconds();
                    if (localTime.unixMillis >= localBefore && localTime.unixMillis < localAfter) {
                        var forwardChange = transition.offset.sub(prev);
                        // non-existing time
                        var factor = (opt === NormalizeOption.Up ? 1 : -1);
                        var resultMillis = localTime.unixMillis + factor * forwardChange.milliseconds();
                        return (typeof a === "number" ? resultMillis : new basics_1.TimeStruct(resultMillis));
                    }
                }
                prev = transition.offset;
            }
            ;
        }
        return (typeof a === "number" ? a : a.clone());
    };
    /**
     * Returns the standard time zone offset from UTC, without DST.
     * Throws if info not found.
     * @param zoneName	IANA time zone name
     * @param utcTime	Timestamp in UTC, either as TimeStruct or as Unix millisecond value
     */
    TzDatabase.prototype.standardOffset = function (zoneName, utcTime) {
        var zoneInfo = this.getZoneInfo(zoneName, utcTime);
        return zoneInfo.gmtoff.clone();
    };
    /**
     * Returns the total time zone offset from UTC, including DST, at
     * the given UTC timestamp.
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param utcTime	Timestamp in UTC, either as TimeStruct or as Unix millisecond value
     */
    TzDatabase.prototype.totalOffset = function (zoneName, utcTime) {
        var zoneInfo = this.getZoneInfo(zoneName, utcTime);
        var dstOffset = null;
        switch (zoneInfo.ruleType) {
            case RuleType.None:
                {
                    dstOffset = duration_1.Duration.minutes(0);
                }
                break;
            case RuleType.Offset:
                {
                    dstOffset = zoneInfo.ruleOffset;
                }
                break;
            case RuleType.RuleName: {
                dstOffset = this.dstOffsetForRule(zoneInfo.ruleName, utcTime, zoneInfo.gmtoff);
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
     * @param utcTime	Timestamp in UTC unix milliseconds
     * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
     * @return	The abbreviation of the rule that is in effect
     */
    TzDatabase.prototype.abbreviation = function (zoneName, utcTime, dstDependent) {
        if (dstDependent === void 0) { dstDependent = true; }
        var zoneInfo = this.getZoneInfo(zoneName, utcTime);
        var format = zoneInfo.format;
        // is format dependent on DST?
        if (format.indexOf("%s") !== -1
            && zoneInfo.ruleType === RuleType.RuleName) {
            var letter = void 0;
            // place in format string
            if (dstDependent) {
                letter = this.letterForRule(zoneInfo.ruleName, utcTime, zoneInfo.gmtoff);
            }
            else {
                letter = "";
            }
            return format.replace("%s", letter);
        }
        return format;
    };
    /**
     * Returns the standard time zone offset from UTC, excluding DST, at
     * the given LOCAL timestamp, again excluding DST.
     *
     * If the local timestamp exists twice (as can occur very rarely due to zone changes)
     * then the first occurrence is returned.
     *
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param localTime	Timestamp in time zone time
     */
    TzDatabase.prototype.standardOffsetLocal = function (zoneName, localTime) {
        var unixMillis = (typeof localTime === "number" ? localTime : localTime.unixMillis);
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until + zoneInfo.gmtoff.milliseconds() > unixMillis) {
                return zoneInfo.gmtoff.clone();
            }
        }
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            throw new Error("No zone info found");
        }
    };
    /**
     * Returns the total time zone offset from UTC, including DST, at
     * the given LOCAL timestamp. Non-existing local time is normalized out.
     * There can be multiple UTC times and therefore multiple offsets for a local time
     * namely during a backward DST change. This returns the FIRST such offset.
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param localTime	Timestamp in time zone time
     */
    TzDatabase.prototype.totalOffsetLocal = function (zoneName, localTime) {
        var ts = (typeof localTime === "number" ? new basics_1.TimeStruct(localTime) : localTime);
        var normalizedTm = this.normalizeLocal(zoneName, ts);
        /// Note: during offset changes, local time can behave like:
        // forward change (1h):   0 1 3 4 5
        // forward change (2h):   0 1 4 5 6
        // backward change (1h):  1 2 2 3 4
        // backward change (2h):  1 2 1 2 3  <-- note time going BACKWARD
        // Therefore binary search does not apply. Linear search through transitions
        // and return the first offset that matches
        var transitions = this.getTransitionsTotalOffsets(zoneName, normalizedTm.components.year - 1, normalizedTm.components.year + 1);
        var prev = null;
        var prevPrev = null;
        for (var i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (transition.at + transition.offset.milliseconds() > normalizedTm.unixMillis) {
                // found offset: prev.offset applies
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
                if (normalizedTm.unixMillis >= prev.at + prev.offset.milliseconds()
                    && normalizedTm.unixMillis < prev.at + prev.offset.milliseconds() + diff.milliseconds()) {
                    // within duplicate range
                    return prevPrev.offset.clone();
                }
                else {
                    return prev.offset.clone();
                }
            }
            else {
                return prev.offset.clone();
            }
        }
        else {
            // this cannot happen as the transitions array is guaranteed to contain a transition at the
            // beginning of the requested fromYear
            return duration_1.Duration.hours(0);
        }
    };
    /**
     * Returns the DST offset (WITHOUT the standard zone offset) for the given
     * ruleset and the given UTC timestamp
     *
     * @param ruleName	name of ruleset
     * @param utcTime	UTC timestamp
     * @param standardOffset	Standard offset without DST for the time zone
     */
    TzDatabase.prototype.dstOffsetForRule = function (ruleName, utcTime, standardOffset) {
        var ts = (typeof utcTime === "number" ? new basics_1.TimeStruct(utcTime) : utcTime);
        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, ts.components.year - 1, ts.components.year, standardOffset);
        // find the last prior to given date
        var offset = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= ts.unixMillis) {
                offset = transition.offset.clone();
                break;
            }
        }
        /* istanbul ignore if */
        if (!offset) {
            // apparently no longer DST, as e.g. for Asia/Tokyo
            offset = duration_1.Duration.minutes(0);
        }
        return offset;
    };
    /**
     * Returns the time zone letter for the given
     * ruleset and the given UTC timestamp
     *
     * @param ruleName	name of ruleset
     * @param utcTime	UTC timestamp as TimeStruct or unix millis
     * @param standardOffset	Standard offset without DST for the time zone
     */
    TzDatabase.prototype.letterForRule = function (ruleName, utcTime, standardOffset) {
        var ts = (typeof utcTime === "number" ? new basics_1.TimeStruct(utcTime) : utcTime);
        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, ts.components.year - 1, ts.components.year, standardOffset);
        // find the last prior to given date
        var letter = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= ts.unixMillis) {
                letter = transition.letter;
                break;
            }
        }
        /* istanbul ignore if */
        if (!letter) {
            // apparently no longer DST, as e.g. for Asia/Tokyo
            letter = "";
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
        assert_1.default(fromYear <= toYear, "fromYear must be <= toYear");
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
        assert_1.default(fromYear <= toYear, "fromYear must be <= toYear");
        var startMillis = basics.timeToUnixNoLeapSecs({ year: fromYear });
        var endMillis = basics.timeToUnixNoLeapSecs({ year: toYear + 1 });
        var zoneInfos = this.getZoneInfos(zoneName);
        assert_1.default(zoneInfos.length > 0, "Empty zoneInfos array returned from getZoneInfos()");
        var result = [];
        var prevZone = null;
        var prevUntilYear;
        var prevStdOffset = duration_1.Duration.hours(0);
        var prevDstOffset = duration_1.Duration.hours(0);
        var prevLetter = "";
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            var untilYear = zoneInfo.until ? new basics_1.TimeStruct(zoneInfo.until).components.year : toYear + 1;
            var stdOffset = prevStdOffset;
            var dstOffset = prevDstOffset;
            var letter = prevLetter;
            // zone applicable?
            if ((prevZone === null || prevZone.until < endMillis - 1)
                && (zoneInfo.until === null || zoneInfo.until >= startMillis)) {
                stdOffset = zoneInfo.gmtoff;
                switch (zoneInfo.ruleType) {
                    case RuleType.None:
                        dstOffset = duration_1.Duration.hours(0);
                        letter = "";
                        break;
                    case RuleType.Offset:
                        dstOffset = zoneInfo.ruleOffset;
                        letter = "";
                        break;
                    case RuleType.RuleName:
                        // check whether the first rule takes effect immediately on the zone transition
                        // (e.g. Lybia)
                        if (prevZone) {
                            var ruleInfos = this.getRuleInfos(zoneInfo.ruleName);
                            for (var j = 0; j < ruleInfos.length; ++j) {
                                var ruleInfo = ruleInfos[j];
                                if (ruleInfo.applicable(prevUntilYear)) {
                                    if (ruleInfo.transitionTimeUtc(prevUntilYear, stdOffset, null) === prevZone.until) {
                                        dstOffset = ruleInfo.save;
                                        letter = ruleInfo.letter;
                                    }
                                }
                            }
                            ;
                        }
                        break;
                }
                // add a transition for the zone transition
                var at = (prevZone ? prevZone.until : startMillis);
                result.push(new Transition(at, stdOffset.add(dstOffset), letter));
                // add transitions for the zone rules in the range
                if (zoneInfo.ruleType === RuleType.RuleName) {
                    var dstTransitions = this.getTransitionsDstOffsets(zoneInfo.ruleName, prevUntilYear !== undefined ? Math.max(prevUntilYear, fromYear) : fromYear, Math.min(untilYear, toYear), stdOffset);
                    for (var k = 0; k < dstTransitions.length; ++k) {
                        var transition = dstTransitions[k];
                        letter = transition.letter;
                        dstOffset = transition.offset;
                        result.push(new Transition(transition.at, transition.offset.add(stdOffset), transition.letter));
                    }
                    ;
                }
            }
            prevZone = zoneInfo;
            prevUntilYear = untilYear;
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
     * @param utcTime	UTC time stamp as unix milliseconds or as a TimeStruct
     * @returns	ZoneInfo object. Do not change, we cache this object.
     */
    TzDatabase.prototype.getZoneInfo = function (zoneName, utcTime) {
        var unixMillis = (typeof utcTime === "number" ? utcTime : utcTime.unixMillis);
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until > unixMillis) {
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
        // follow links
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
                    + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        // final zone info found
        for (var i = 0; i < zoneEntries.length; ++i) {
            var zoneEntry = zoneEntries[i];
            var ruleType = this.parseRuleType(zoneEntry[1]);
            var until = math.filterFloat(zoneEntry[3]);
            if (isNaN(until)) {
                until = null;
            }
            result.push(new ZoneInfo(duration_1.Duration.minutes(-1 * math.filterFloat(zoneEntry[0])), ruleType, ruleType === RuleType.Offset ? new duration_1.Duration(zoneEntry[1]) : new duration_1.Duration(), ruleType === RuleType.RuleName ? zoneEntry[1] : "", zoneEntry[2], until));
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
            var toYear = (toType === ToType.Max ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
            var onType = this.parseOnType(rule[4]);
            var onDay = this.parseOnDay(rule[4], onType);
            var onWeekDay = this.parseOnWeekDay(rule[4]);
            var monthName = rule[3];
            var monthNumber = monthNameToString(monthName);
            result.push(new RuleInfo(fromYear, toType, toYear, rule[2], monthNumber, onType, onDay, onWeekDay, math.positiveModulo(parseInt(rule[5][0], 10), 24), // note the database sometimes contains "24" as hour value
            math.positiveModulo(parseInt(rule[5][1], 10), 60), math.positiveModulo(parseInt(rule[5][2], 10), 60), this.parseAtType(rule[5][3]), duration_1.Duration.minutes(parseInt(rule[6], 10)), rule[7] === "-" ? "" : rule[7]));
        }
        result.sort(function (a, b) {
            /* istanbul ignore if */
            if (a.effectiveEqual(b)) {
                return 0;
            }
            else if (a.effectiveLess(b)) {
                return -1;
            }
            else {
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
            return RuleType.None;
        }
        else if (isValidOffsetString(rule)) {
            return RuleType.Offset;
        }
        else {
            return RuleType.RuleName;
        }
    };
    /**
     * Parse the TO column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseToType = function (to) {
        if (to === "max") {
            return ToType.Max;
        }
        else if (to === "only") {
            return ToType.Year; // yes we return Year for only
        }
        else if (!isNaN(parseInt(to, 10))) {
            return ToType.Year;
        }
        else {
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
            return OnType.LastX;
        }
        if (on.indexOf("<=") !== -1) {
            return OnType.LeqX;
        }
        if (on.indexOf(">=") !== -1) {
            return OnType.GreqX;
        }
        return OnType.DayNum;
    };
    /**
     * Get the day number from an ON column string, 0 if no day.
     */
    TzDatabase.prototype.parseOnDay = function (on, onType) {
        switch (onType) {
            case OnType.DayNum: return parseInt(on, 10);
            case OnType.LeqX: return parseInt(on.substr(on.indexOf("<=") + 2), 10);
            case OnType.GreqX: return parseInt(on.substr(on.indexOf(">=") + 2), 10);
            /* istanbul ignore next */
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
            return basics_1.WeekDay.Sunday;
        }
    };
    /**
     * Parse the AT column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseAtType = function (at) {
        switch (at) {
            case "s": return AtType.Standard;
            case "u": return AtType.Utc;
            case "g": return AtType.Utc;
            case "z": return AtType.Utc;
            case "w": return AtType.Wall;
            case "": return AtType.Wall;
            case null: return AtType.Wall;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return AtType.Wall;
                }
        }
    };
    /**
     * Single instance member
     */
    TzDatabase._instance = null;
    return TzDatabase;
}());
exports.TzDatabase = TzDatabase;
/**
 * Sanity check on data. Returns min/max values.
 */
function validateData(data) {
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
    // validate zones
    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                /* istanbul ignore if */
                if (!data.zones.hasOwnProperty(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" links to \"" + zoneArr + "\" but that doesn\'t exist");
                }
            }
            else {
                /* istanbul ignore if */
                if (!Array.isArray(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" is neither a string nor an array");
                }
                for (var i = 0; i < zoneArr.length; i++) {
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
    // validate rules
    for (var ruleName in data.rules) {
        if (data.rules.hasOwnProperty(ruleName)) {
            var ruleArr = data.rules[ruleName];
            /* istanbul ignore if */
            if (!Array.isArray(ruleArr)) {
                throw new Error("Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (var i = 0; i < ruleArr.length; i++) {
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
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
                    && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
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
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
                    && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./assert":1,"./basics":2,"./duration":4,"./math":8}],"timezonecomplete":[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date and Time utility functions - main index
 */
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require("./basics"));
__export(require("./datetime"));
__export(require("./duration"));
__export(require("./format"));
__export(require("./globals"));
__export(require("./javascript"));
__export(require("./parse"));
__export(require("./period"));
__export(require("./basics"));
__export(require("./timesource"));
__export(require("./timezone"));
__export(require("./tz-database"));

},{"./basics":2,"./datetime":3,"./duration":4,"./format":5,"./globals":6,"./javascript":7,"./parse":9,"./period":10,"./timesource":12,"./timezone":13,"./tz-database":15}]},{},[])("timezonecomplete")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZm9ybWF0LmpzIiwiZGlzdC9saWIvZ2xvYmFscy5qcyIsImRpc3QvbGliL2phdmFzY3JpcHQuanMiLCJkaXN0L2xpYi9tYXRoLmpzIiwiZGlzdC9saWIvcGFyc2UuanMiLCJkaXN0L2xpYi9wZXJpb2QuanMiLCJkaXN0L2xpYi9zdHJpbmdzLmpzIiwiZGlzdC9saWIvdGltZXNvdXJjZS5qcyIsImRpc3QvbGliL3RpbWV6b25lLmpzIiwiZGlzdC9saWIvdG9rZW4uanMiLCJkaXN0L2xpYi90ei1kYXRhYmFzZS5qcyIsImRpc3QvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25mQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ24rQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcclxuICAgIGlmICghY29uZGl0aW9uKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG59XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gYXNzZXJ0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc3NlcnQuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFdlZWtEYXkpIHtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlR1ZXNkYXlcIl0gPSAyXSA9IFwiVHVlc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIkZyaWRheVwiXSA9IDVdID0gXCJGcmlkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XHJcbn0pKGV4cG9ydHMuV2Vla0RheSB8fCAoZXhwb3J0cy5XZWVrRGF5ID0ge30pKTtcclxudmFyIFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXk7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRpbWVVbml0KSB7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1pbGxpc2Vjb25kXCJdID0gMF0gPSBcIk1pbGxpc2Vjb25kXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIlNlY29uZFwiXSA9IDFdID0gXCJTZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWludXRlXCJdID0gMl0gPSBcIk1pbnV0ZVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJIb3VyXCJdID0gM10gPSBcIkhvdXJcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiRGF5XCJdID0gNF0gPSBcIkRheVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJXZWVrXCJdID0gNV0gPSBcIldlZWtcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTW9udGhcIl0gPSA2XSA9IFwiTW9udGhcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiWWVhclwiXSA9IDddID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG4gICAgICovXHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1BWFwiXSA9IDhdID0gXCJNQVhcIjtcclxufSkoZXhwb3J0cy5UaW1lVW5pdCB8fCAoZXhwb3J0cy5UaW1lVW5pdCA9IHt9KSk7XHJcbnZhciBUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQ7XHJcbi8qKlxyXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cclxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xyXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXHJcbiAqXHJcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxyXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpIHtcclxuICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzID0gdGltZVVuaXRUb01pbGxpc2Vjb25kcztcclxuLyoqXHJcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXHJcbiAqIGlmIG5lY2Vzc2FyeS5cclxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcclxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQsIGFtb3VudCkge1xyXG4gICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDE7IH1cclxuICAgIHZhciByZXN1bHQgPSBUaW1lVW5pdFt1bml0XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBcInNcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnRpbWVVbml0VG9TdHJpbmcgPSB0aW1lVW5pdFRvU3RyaW5nO1xyXG5mdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHMpIHtcclxuICAgIHZhciB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcclxuICAgICAgICB2YXIgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG4gICAgICAgIGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gc3RyaW5nVG9UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcclxuICAgIC8vIGZyb20gV2lraXBlZGlhOlxyXG4gICAgLy8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBsZWFwIHllYXJcclxuICAgIGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmlzTGVhcFllYXIgPSBpc0xlYXBZZWFyO1xyXG4vKipcclxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcclxuICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5ZZWFyID0gZGF5c0luWWVhcjtcclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgc3dpdGNoIChtb250aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgIGNhc2UgNzpcclxuICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgY2FzZSAxMDpcclxuICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICByZXR1cm4gMzE7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgIGNhc2UgOTpcclxuICAgICAgICBjYXNlIDExOlxyXG4gICAgICAgICAgICByZXR1cm4gMzA7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5Nb250aCA9IGRheXNJbk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKi9cclxuZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIHZhciB5ZWFyRGF5ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG4gICAgICAgIHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcbiAgICB9XHJcbiAgICB5ZWFyRGF5ICs9IChkYXkgLSAxKTtcclxuICAgIHJldHVybiB5ZWFyRGF5O1xyXG59XHJcbmV4cG9ydHMuZGF5T2ZZZWFyID0gZGF5T2ZZZWFyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBlbmRPZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG4gICAgdmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMubGFzdFdlZWtEYXlPZk1vbnRoID0gbGFzdFdlZWtEYXlPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKlxyXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBiZWdpbk9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiAxIH0pO1xyXG4gICAgdmFyIGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5maXJzdFdlZWtEYXlPZk1vbnRoID0gZmlyc3RXZWVrRGF5T2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSB3ZWVrRGF5T25PckFmdGVyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXHJcbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgdmFyIGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuICAgIHZhciBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgaWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XHJcbiAgICAgICAgaWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xyXG4gICAgICAgICAgICAvLyBXZWVrIDFcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuICAgICAgICAgICAgaWYgKG1vbnRoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRGVmYXVsdCBjYXNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBKYW51YXJ5XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgdmFyIGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuICAgIGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xyXG4gICAgICAgIGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE5vcm1hbCBjYXNlXHJcbiAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG4gICAgaWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMud2Vla09mTW9udGggPSB3ZWVrT2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpIHtcclxuICAgIC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXHJcbiAgICB2YXIgcmVzdWx0ID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xyXG4gICAgaWYgKHJlc3VsdCA+IDMpIHtcclxuICAgICAgICByZXN1bHQgLT0gNztcclxuICAgICAgICBpZiAocmVzdWx0IDwgMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICB2YXIgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG4gICAgLy8gY2hlY2sgZW5kLW9mLXllYXIgY29ybmVyIGNhc2U6IG1heSBiZSB3ZWVrIDEgb2YgbmV4dCB5ZWFyXHJcbiAgICBpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcbiAgICAgICAgdmFyIG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xyXG4gICAgICAgIGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2VcclxuICAgIHZhciB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xyXG4gICAgaWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuICAgICAgICAvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxyXG4gICAgICAgIHZhciB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG4gICAgICAgIGlmIChkb3kgPCB3ZWVrVHdvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHdlZWtUd28pIC8gNykgKyAyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxyXG4gICAgaWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xyXG4gICAgICAgIC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXHJcbiAgICAgICAgcmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICB9XHJcbiAgICAvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcclxufVxyXG5leHBvcnRzLndlZWtOdW1iZXIgPSB3ZWVrTnVtYmVyO1xyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml4TWlsbGlzKSA9PT0gXCJudW1iZXJcIiwgXCJudW1iZXIgaW5wdXQgZXhwZWN0ZWRcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KCFpc05hTih1bml4TWlsbGlzKSwgXCJOYU4gbm90IGV4cGVjdGVkIGFzIGlucHV0XCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChtYXRoLmlzSW50KHVuaXhNaWxsaXMpLCBcIkV4cGVjdCBpbnRlZ2VyIG51bWJlciBmb3IgdW5peCBVVEMgdGltZXN0YW1wXCIpO1xyXG59XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5mdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XHJcbiAgICBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIHRlbXAgPSB1bml4TWlsbGlzO1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwIH07XHJcbiAgICB2YXIgeWVhcjtcclxuICAgIHZhciBtb250aDtcclxuICAgIGlmICh1bml4TWlsbGlzID49IDApIHtcclxuICAgICAgICByZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IHRlbXAgJSA2MDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG4gICAgICAgIHllYXIgPSAxOTcwO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJblllYXIoeWVhcikpIHtcclxuICAgICAgICAgICAgdGVtcCAtPSBkYXlzSW5ZZWFyKHllYXIpO1xyXG4gICAgICAgICAgICB5ZWFyKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC55ZWFyID0geWVhcjtcclxuICAgICAgICBtb250aCA9IDE7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPj0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXHJcbiAgICAgICAgLy8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuICAgICAgICByZXN1bHQubWlsbGkgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDEwMDApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuICAgICAgICByZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMjQpO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcbiAgICAgICAgeWVhciA9IDE5Njk7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcbiAgICAgICAgICAgIHllYXItLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xyXG4gICAgICAgIG1vbnRoID0gMTI7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMudW5peFRvVGltZU5vTGVhcFNlY3MgPSB1bml4VG9UaW1lTm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIEZpbGwgeW91IGFueSBtaXNzaW5nIHRpbWUgY29tcG9uZW50IHBhcnRzLCBkZWZhdWx0cyBhcmUgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpIHtcclxuICAgIHZhciBpbnB1dCA9IHtcclxuICAgICAgICB5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuICAgICAgICBtb250aDogdHlwZW9mIGNvbXBvbmVudHMubW9udGggPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1vbnRoIDogMSxcclxuICAgICAgICBkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcclxuICAgICAgICBob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuICAgICAgICBtaW51dGU6IHR5cGVvZiBjb21wb25lbnRzLm1pbnV0ZSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWludXRlIDogMCxcclxuICAgICAgICBzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcclxuICAgICAgICBtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbn1cclxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICB2YXIgY29tcG9uZW50cyA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSA6IGEpO1xyXG4gICAgdmFyIGlucHV0ID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XHJcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXHJcbiAgICAgICAgKGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcbiAgICAgICAgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDEpIC8gMTAwKSAqIDg2NDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDAgKyAyOTkpIC8gNDAwKSAqIDg2NDAwKTtcclxufVxyXG5leHBvcnRzLnRpbWVUb1VuaXhOb0xlYXBTZWNzID0gdGltZVRvVW5peE5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZXBvY2hEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG4gICAgdmFyIGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG4gICAgcmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcclxufVxyXG5leHBvcnRzLndlZWtEYXlOb0xlYXBTZWNzID0gd2Vla0RheU5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XHJcbiAgICByZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRPZkRheSA9IHNlY29uZE9mRGF5O1xyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG52YXIgVGltZVN0cnVjdCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVTdHJ1Y3QoYSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXHJcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICAgICAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAgICAgKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXHJcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gICAgICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICAgICAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xyXG4gICAgICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbVVuaXggPSBmdW5jdGlvbiAodW5peE1pbGxpcykge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIEphdmFTY3JpcHQgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGRmXHRXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tRGF0ZSA9IGZ1bmN0aW9uIChkLCBkZikge1xyXG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldFVUQ0Z1bGxZZWFyKCksIG1vbnRoOiBkLmdldFVUQ01vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0VVRDRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21TdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyID0gMTk3MDtcclxuICAgICAgICAgICAgdmFyIG1vbnRoID0gMTtcclxuICAgICAgICAgICAgdmFyIGRheSA9IDE7XHJcbiAgICAgICAgICAgIHZhciBob3VyID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbnV0ZSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25NaWxsaXMgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIG1haW4gcGFydFxyXG4gICAgICAgICAgICB2YXIgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Jhc2ljRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFueSBcIlRcIiBzZXBhcmF0b3JcclxuICAgICAgICAgICAgICAgIHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLCBcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoOCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEwLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlQW5kVGltZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoMCwgNCksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoNSwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBwYXJzZSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZyYWN0aW9uID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxhc3RVbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XHJcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInVuaXhNaWxsaXNcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhNaWxsaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiY29tcG9uZW50c1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInllYXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibW9udGhcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImRheVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImhvdXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWludXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwic2Vjb25kXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWlsbGlcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5LW9mLXllYXIgMC0zNjVcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUueWVhckRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKSA9PT0gb3RoZXIudmFsdWVPZigpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fdW5peE1pbGxpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcclxuICAgICAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSB0aW1lc3RhbXAgaXMgdmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICB9O1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGltZVN0cnVjdDtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lU3RydWN0ID0gVGltZVN0cnVjdDtcclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxyXG4gKi9cclxuZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXgoYXJyLCBjb21wYXJlKSB7XHJcbiAgICB2YXIgbWluSW5kZXggPSAwO1xyXG4gICAgdmFyIG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgY3VycmVudEluZGV4O1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG4gICAgLy8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxyXG4gICAgaWYgKCFhcnIpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICAvLyBvdXQgb2YgYm91bmRzXHJcbiAgICBpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG1heEluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIC8vIGVsZW1lbnQgaW4gcmFuZ2VcclxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IE1hdGguZmxvb3IoKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMik7XHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuICAgICAgICBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBiaW5hcnlJbnNlcnRpb25JbmRleDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmFzaWNzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbnZhciB0aW1lc291cmNlXzEgPSByZXF1aXJlKFwiLi90aW1lc291cmNlXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xyXG52YXIgZm9ybWF0ID0gcmVxdWlyZShcIi4vZm9ybWF0XCIpO1xyXG52YXIgcGFyc2VGdW5jcyA9IHJlcXVpcmUoXCIuL3BhcnNlXCIpO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKi9cclxuZnVuY3Rpb24gbm93TG9jYWwoKSB7XHJcbiAgICByZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcclxufVxyXG5leHBvcnRzLm5vd0xvY2FsID0gbm93TG9jYWw7XHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gKi9cclxuZnVuY3Rpb24gbm93VXRjKCkge1xyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcbmV4cG9ydHMubm93VXRjID0gbm93VXRjO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqL1xyXG5mdW5jdGlvbiBub3codGltZVpvbmUpIHtcclxuICAgIGlmICh0aW1lWm9uZSA9PT0gdm9pZCAwKSB7IHRpbWVab25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKTsgfVxyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XHJcbn1cclxuZXhwb3J0cy5ub3cgPSBub3c7XHJcbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWUsIGZyb21ab25lKSB7XHJcbiAgICBpZiAoZnJvbVpvbmUpIHtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gZnJvbVpvbmUub2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBjb252ZXJ0RnJvbVV0Yyh1dGNUaW1lLCB0b1pvbmUpIHtcclxuICAgIGlmICh0b1pvbmUpIHtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcclxuICAgICAgICByZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdXRjVGltZS5jbG9uZSgpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG52YXIgRGF0ZVRpbWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgZG8gbm90IGNhbGxcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRGF0ZVRpbWUoYTEsIGEyLCBhMywgaCwgbSwgcywgbXMsIHRpbWVab25lKSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgKGExKSkge1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZXhwZWN0IHVuaXhUaW1lc3RhbXAgdG8gYmUgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lID8gYTIgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geWVhciBtb250aCBkYXkgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgeWVhciB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHllYXIgPSBhMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vbnRoID0gYTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXkgPSBhMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbnV0ZSA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaWxsaSA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRtID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0bS52YWxpZGF0ZSgpLCBcImludmFsaWQgZGF0ZTogXCIgKyB0bS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9ICh0eXBlb2YgKHRpbWVab25lKSA9PT0gXCJvYmplY3RcIiAmJiB0aW1lWm9uZSBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUgPyB0aW1lWm9uZSA6IG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdG07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTIgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHN0cmluZyBnaXZlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZVN0cmluZyA9IGExO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybWF0U3RyaW5nID0gYTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB6b25lID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBhMyBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbmUgPSAoYTMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gcGFyc2VkLnRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSBwYXJzZWQuem9uZSB8fCBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpdmVuU3RyaW5nID0gYTEudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3MgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcy5sZW5ndGggPT09IDIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgYTEgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhMiBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZShzc1sxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlIG91ciBvd24gSVNPIHBhcnNpbmcgYmVjYXVzZSB0aGF0IGl0IHBsYXRmb3JtIGluZGVwZW5kZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIChmcmVlIG9mIERhdGUgcXVpcmtzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYTEgaW5zdGFuY2VvZiBiYXNpY3NfMS5UaW1lU3RydWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYTEuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMiA/IGEyIDogbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGExIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoIWEzIHx8IGEzIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aW1lWm9uZSBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IChhMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkayA9IChhMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZCwgZGspO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLmxvY2FsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwidXRjRGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3V0Y0RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGVUaW1lLnByb3RvdHlwZSwgXCJ6b25lRGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVEYXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5ub3dMb2NhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShuLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQsIHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5ub3dVdGMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gICAgICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5ub3cgPSBmdW5jdGlvbiAodGltZVpvbmUpIHtcclxuICAgICAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQywgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSkudG9ab25lKHRpbWVab25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIERhdGVUaW1lIGZyb20gYSBMb3R1cyAxMjMgLyBNaWNyb3NvZnQgRXhjZWwgZGF0ZS10aW1lIHZhbHVlXHJcbiAgICAgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG4gICAgICogQHBhcmFtIG4gZXhjZWwgZGF0ZS90aW1lIG51bWJlclxyXG4gICAgICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cclxuICAgICAqIEByZXR1cm5zIGEgRGF0ZVRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZnJvbUV4Y2VsID0gZnVuY3Rpb24gKG4sIHRpbWVab25lKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChpc0Zpbml0ZShuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHVuaXhUaW1lc3RhbXAsIHRpbWVab25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBkYXRlIGV4aXN0cyBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG4gICAgICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcclxuICAgICAqIGFuZCAyMDE1LTAzLTI5VDAyOjMwOjAwIHJldHVybnMgZmFsc2UgKGRheWxpZ2h0IHNhdmluZyB0aW1lIG1pc3NpbmcgaG91cilcclxuICAgICAqIGFuZCAyMDE1LTA0LTMxIHJldHVybnMgZmFsc2UgKEFwcmlsIGhhcyAzMCBkYXlzKS5cclxuICAgICAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXHJcbiAgICAgKiBiZWZvcmUgdGhhdC4gWW91IGNhbiBjaGFuZ2UgdGhhdCB3aXRoIHRoZSBhbGxvd1ByZTE5NzAgZmxhZy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5leGlzdHMgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lLCBhbGxvd1ByZTE5NzApIHtcclxuICAgICAgICBpZiAobW9udGggPT09IHZvaWQgMCkgeyBtb250aCA9IDE7IH1cclxuICAgICAgICBpZiAoZGF5ID09PSB2b2lkIDApIHsgZGF5ID0gMTsgfVxyXG4gICAgICAgIGlmIChob3VyID09PSB2b2lkIDApIHsgaG91ciA9IDA7IH1cclxuICAgICAgICBpZiAobWludXRlID09PSB2b2lkIDApIHsgbWludXRlID0gMDsgfVxyXG4gICAgICAgIGlmIChzZWNvbmQgPT09IHZvaWQgMCkgeyBzZWNvbmQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG1pbGxpc2Vjb25kID09PSB2b2lkIDApIHsgbWlsbGlzZWNvbmQgPSAwOyB9XHJcbiAgICAgICAgaWYgKHpvbmUgPT09IHZvaWQgMCkgeyB6b25lID0gbnVsbDsgfVxyXG4gICAgICAgIGlmIChhbGxvd1ByZTE5NzAgPT09IHZvaWQgMCkgeyBhbGxvd1ByZTE5NzAgPSBmYWxzZTsgfVxyXG4gICAgICAgIGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KVxyXG4gICAgICAgICAgICB8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZCkgfHwgIWlzRmluaXRlKG1pbGxpc2Vjb25kKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGR0ID0gbmV3IERhdGVUaW1lKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSk7XHJcbiAgICAgICAgICAgIHJldHVybiAoeWVhciA9PT0gZHQueWVhcigpICYmIG1vbnRoID09PSBkdC5tb250aCgpICYmIGRheSA9PT0gZHQuZGF5KClcclxuICAgICAgICAgICAgICAgICYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhIGNvcHkgb2YgdGhpcyBvYmplY3RcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZGF0ZSBpcyBpbi4gTWF5IGJlIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl96b25lO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcclxuICAgICAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuICAgICAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuem9uZUFiYnJldmlhdGlvbiA9IGZ1bmN0aW9uIChkc3REZXBlbmRlbnQpIHtcclxuICAgICAgICBpZiAoZHN0RGVwZW5kZW50ID09PSB2b2lkIDApIHsgZHN0RGVwZW5kZW50ID0gdHJ1ZTsgfVxyXG4gICAgICAgIGlmICh0aGlzLnpvbmUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy56b25lKCkuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm9mZnNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUueWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnllYXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5kYXk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBob3VyIDAtMjNcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5ob3VyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBzZWNvbmRzIDAtNTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taWxsaTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcbiAgICAgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla0RheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGF5T2ZZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53ZWVrTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICAgICAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcbiAgICAgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gTWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwWlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudW5peFV0Y01pbGxpcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5tb250aDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjSG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIHNlY29uZHMgMC01OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjU2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG4gICAgICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtaWxsaXNlY29uZHMgMC05OTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taWxsaTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIFVUQyBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG4gICAgICogd2VlayBkYXkgbnVtYmVycylcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1dlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSVNPIDg2MDEgVVRDIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICAgICAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuICAgICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1dlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAgICAgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrT2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuICAgICAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy51dGNIb3VyKCksIHRoaXMudXRjTWludXRlKCksIHRoaXMudXRjU2Vjb25kKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcclxuICAgICAqIGluIHRoZSBuZXcgem9uZS4gU28gZS5nLiAwODowMCBBbWVyaWNhL0NoaWNhZ28gY2FuIGJlIHNldCB0byAwODowMCBFdXJvcGUvQnJ1c3NlbHMuXHJcbiAgICAgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cclxuICAgICAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxyXG4gICAgICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndpdGhab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksIHpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxyXG4gICAgICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxyXG4gICAgICogQHJldHVybiB0aGlzIChmb3IgY2hhaW5pbmcpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gKHpvbmUpIHtcclxuICAgICAgICBpZiAoem9uZSkge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpOyAvLyBjYXVzZSB6b25lIC0+IHV0YyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdW5kZWZpbmVkOyAvLyBjYXVzZSBsYXRlciB6b25lIC0+IHV0YyBjb252ZXJzaW9uXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcbiAgICAgKiBVbmF3YXJlIGRhdGVzIGNhbiBvbmx5IGJlIGNvbnZlcnRlZCB0byB1bmF3YXJlIGRhdGVzIChjbG9uZSlcclxuICAgICAqIENvbnZlcnRpbmcgYW4gdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGUgdGhyb3dzIGFuIGV4Y2VwdGlvbi4gVXNlIHRoZSBjb25zdHJ1Y3RvclxyXG4gICAgICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVcdFRoZSBuZXcgdGltZSB6b25lLiBUaGlzIG1heSBiZSBudWxsIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9ab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcclxuICAgICAgICBpZiAoem9uZSkge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XHJcbiAgICAgICAgICAgIHJlc3VsdC51dGNEYXRlID0gdGhpcy51dGNEYXRlO1xyXG4gICAgICAgICAgICByZXN1bHQuX3pvbmUgPSB6b25lO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHRvIEphdmFTY3JpcHQgZGF0ZSB3aXRoIHRoZSB6b25lIHRpbWUgaW4gdGhlIGdldFgoKSBtZXRob2RzLlxyXG4gICAgICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuICAgICAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvRGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksIHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHpvbmUuXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxyXG4gICAgICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0V4Y2VsID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XHJcbiAgICAgICAgdmFyIGR0ID0gdGhpcztcclxuICAgICAgICBpZiAodGltZVpvbmUgJiYgIXRpbWVab25lLmVxdWFscyh0aGlzLnpvbmUoKSkpIHtcclxuICAgICAgICAgICAgZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG4gICAgICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y0V4Y2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xyXG4gICAgICAgIC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcclxuICAgICAgICB2YXIgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEltcGxlbWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gKGExKTtcclxuICAgICAgICAgICAgdSA9IHVuaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB1dGNUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnV0Y0RhdGUsIGFtb3VudCwgdSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh1dGNUbSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSkudG9ab25lKHRoaXMuX3pvbmUpO1xyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5hZGRMb2NhbCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIHZhciBhbW91bnQ7XHJcbiAgICAgICAgdmFyIHU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IChhMSk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG4gICAgICAgICAgICB1ID0gZHVyYXRpb24udW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IChhMSk7XHJcbiAgICAgICAgICAgIHUgPSB1bml0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbG9jYWxUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnpvbmVEYXRlLCBhbW91bnQsIHUpO1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSAoYW1vdW50ID49IDAgPyB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcCA6IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG4gICAgICAgICAgICB2YXIgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbSwgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShub3JtYWxpemVkLCB0aGlzLl96b25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbSwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG4gICAgICogS2VlcHMgbG93ZXIgdW5pdCBmaWVsZHMgdGhlIHNhbWUgd2hlcmUgcG9zc2libGUsIGNsYW1wcyBkYXkgdG8gZW5kLW9mLW1vbnRoIGlmXHJcbiAgICAgKiBuZWNlc3NhcnkuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5fYWRkVG9UaW1lU3RydWN0ID0gZnVuY3Rpb24gKHRtLCBhbW91bnQsIHVuaXQpIHtcclxuICAgICAgICB2YXIgeWVhcjtcclxuICAgICAgICB2YXIgbW9udGg7XHJcbiAgICAgICAgdmFyIGRheTtcclxuICAgICAgICB2YXIgaG91cjtcclxuICAgICAgICB2YXIgbWludXRlO1xyXG4gICAgICAgIHZhciBzZWNvbmQ7XHJcbiAgICAgICAgdmFyIG1pbGxpO1xyXG4gICAgICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA2MDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDM2MDAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2VlazpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIG1vbnRoc1wiKTtcclxuICAgICAgICAgICAgICAgIC8vIGtlZXAgdGhlIGRheS1vZi1tb250aCB0aGUgc2FtZSAoY2xhbXAgdG8gZW5kLW9mLW1vbnRoKVxyXG4gICAgICAgICAgICAgICAgaWYgKGFtb3VudCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSkpIC8gMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkYXkgPSBNYXRoLm1pbih0bS5jb21wb25lbnRzLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XHJcbiAgICAgICAgICAgICAgICBob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG4gICAgICAgICAgICAgICAgbWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmQgPSB0bS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgICAgICAgICAgICAgIG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjoge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgeWVhcnNcIik7XHJcbiAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xyXG4gICAgICAgICAgICAgICAgbW9udGggPSB0bS5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIiAmJiBhMSBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKGR1cmF0aW9uLm11bHRpcGx5KC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgdmFyIGFtb3VudCA9IChhMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdWJMb2NhbCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTG9jYWwoYTEubXVsdGlwbHkoLTEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogYTEsIHVuaXQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRpbWUgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBEYXRlVGltZXNcclxuICAgICAqIEByZXR1cm4gdGhpcyAtIG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG4gICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmxlc3NFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnpvbmVEYXRlLmVxdWFscyhvdGhlci56b25lRGF0ZSlcclxuICAgICAgICAgICAgJiYgKHRoaXMuX3pvbmUgPT09IG51bGwpID09PSAob3RoZXIuX3pvbmUgPT09IG51bGwpXHJcbiAgICAgICAgICAgICYmICh0aGlzLl96b25lID09PSBudWxsIHx8IHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID4gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ncmVhdGVyRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPj0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbWluaW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XHJcbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcyArIHRpbWV6b25lXzEuVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgRGF0ZVRpbWUgYWNjb3JkaW5nIHRvIHRoZVxyXG4gICAgICogc3BlY2lmaWVkIGZvcm1hdC4gVGhlIGZvcm1hdCBpcyBpbXBsZW1lbnRlZCBhcyB0aGUgTERNTCBzdGFuZGFyZFxyXG4gICAgICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxyXG4gICAgICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy56b25lKCksIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhIGRhdGUgaW4gYSBnaXZlbiBmb3JtYXRcclxuICAgICAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2VcclxuICAgICAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluXHJcbiAgICAgKiBAcGFyYW0gem9uZSBPcHRpb25hbCwgdGhlIHpvbmUgdG8gYWRkIChpZiBubyB6b25lIGlzIGdpdmVuIGluIHRoZSBzdHJpbmcpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnBhcnNlID0gZnVuY3Rpb24gKHMsIGZvcm1hdCwgem9uZSkge1xyXG4gICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKHMsIGZvcm1hdCwgem9uZSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShwYXJzZWQudGltZSwgcGFyc2VkLnpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIElBTkEgbmFtZSBpZiBhcHBsaWNhYmxlLlxyXG4gICAgICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMuMDAwIEV1cm9wZS9BbXN0ZXJkYW1cIlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbRGF0ZVRpbWU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvVXRjU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudG9TdHJpbmcoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNwbGl0IGEgY29tYmluZWQgSVNPIGRhdGV0aW1lIGFuZCB0aW1lem9uZSBpbnRvIGRhdGV0aW1lIGFuZCB0aW1lem9uZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXCJcIiwgXCJcIl07XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCArIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xyXG4gICAgICAgIGlmIChpbmRleCA8IDgpIHtcclxuICAgICAgICAgICAgaW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXHJcbiAgICAgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXHJcbiAgICAgKiB1c2UgdGhpcyBwcm9wZXJ0eSBmb3Igb2J0YWluaW5nIHRoZSBjdXJyZW50IHRpbWUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnRpbWVTb3VyY2UgPSBuZXcgdGltZXNvdXJjZV8xLlJlYWxUaW1lU291cmNlKCk7XHJcbiAgICByZXR1cm4gRGF0ZVRpbWU7XHJcbn0oKSk7XHJcbmV4cG9ydHMuRGF0ZVRpbWUgPSBEYXRlVGltZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0ZXRpbWUuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIGR1cmF0aW9uXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcbiAqL1xyXG5mdW5jdGlvbiB5ZWFycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuZXhwb3J0cy55ZWFycyA9IHllYXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gKi9cclxuZnVuY3Rpb24gbW9udGhzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5tb250aHMobik7XHJcbn1cclxuZXhwb3J0cy5tb250aHMgPSBtb250aHM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICovXHJcbmZ1bmN0aW9uIGRheXMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuZXhwb3J0cy5kYXlzID0gZGF5cztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcbiAqL1xyXG5mdW5jdGlvbiBob3VycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuZXhwb3J0cy5ob3VycyA9IGhvdXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAqL1xyXG5mdW5jdGlvbiBtaW51dGVzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5taW51dGVzKG4pO1xyXG59XHJcbmV4cG9ydHMubWludXRlcyA9IG1pbnV0ZXM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLnNlY29uZHMobik7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRzID0gc2Vjb25kcztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICovXHJcbmZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKG4pO1xyXG59XHJcbmV4cG9ydHMubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzO1xyXG4vKipcclxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXHJcbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXHJcbiAqXHJcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxyXG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXHJcbiAqICAgVGhlc2UgcmV0dXJuIGEgcGFydCBvZiB5b3VyIHN0cmluZyByZXByZXNlbnRhdGlvbi4gRS5nLiBmb3IgMjUwMCBtaWxsaXNlY29uZHMsIHRoZSBtaWxsaXNlY29uZCgpIHBhcnQgd291bGQgYmUgNTAwXHJcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cclxuICovXHJcbnZhciBEdXJhdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIER1cmF0aW9uKGkxLCB1bml0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoaTEpID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBpMTtcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgLy8gc3RyaW5nIGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIHRoaXMuX2Zyb21TdHJpbmcoaTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnllYXJzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1vbnRocyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5kYXlzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLmhvdXJzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ubWludXRlcyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uc2Vjb25kcyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIGFub3RoZXIgaW5zdGFuY2Ugb2YgRHVyYXRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50LCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cclxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cclxuICAgICAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYXMgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIGlmICh0aGlzLl91bml0ID09PSB1bml0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xyXG4gICAgICAgICAgICB2YXIgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuICAgICAgICAgICAgdmFyIHJlcU1vbnRocyA9ICh1bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNb250aHMgLyByZXFNb250aHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdGhpc01zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcclxuICAgICAgICAgICAgdmFyIHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHRoaXMgZHVyYXRpb24gdG8gYSBEdXJhdGlvbiBpbiBhbm90aGVyIHVuaXQuIFlvdSBhbHdheXMgZ2V0IGEgY2xvbmUgZXZlbiBpZiB5b3Ugc3BlY2lmeVxyXG4gICAgICogdGhlIHNhbWUgdW5pdC5cclxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cclxuICAgICAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLmFzKHVuaXQpLCB1bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSlcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgMTUwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbnV0ZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtaW51dGUgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMiBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gaG91cnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmhvdXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG4gICAgICogZHVyaW5nIERTVCBjaGFuZ2VzKS5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaG91ciBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKS5cclxuICAgICAqIE5vdGUgdGhhdCB0aGlzIHBhcnQgY2FuIGV4Y2VlZCAyMyBob3VycywgYmVjYXVzZSBmb3JcclxuICAgICAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMjUgZm9yIGEgLTI1OjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUud2hvbGVIb3VycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAzNjAwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXlzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubW9udGhzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtb250aCBwYXJ0IG9mIGEgZHVyYXRpb24uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUueWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb24tZnJhY3Rpb25hbCBwb3NpdGl2ZSB5ZWFyc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUud2hvbGVZZWFycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDEyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvXHJcbiAgICAgICAgICAgICAgICBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQW1vdW50IG9mIHVuaXRzIChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHVuaXQgdGhpcyBkdXJhdGlvbiB3YXMgY3JlYXRlZCB3aXRoXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS51bml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2lnblxyXG4gICAgICogQHJldHVybiBcIi1cIiBpZiB0aGUgZHVyYXRpb24gaXMgbmVnYXRpdmVcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnNpZ24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hbW91bnQgPCAwID8gXCItXCIgOiBcIlwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5sZXNzRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHZhciBjb252ZXJ0ZWQgPSBvdGhlci5jb252ZXJ0KHRoaXMuX3VuaXQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgPT09IGNvbnZlcnRlZC5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBjb252ZXJ0ZWQudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG4gICAgICogUmV0dXJucyBmYWxzZSBpZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgZXF1YWwgaW4gYWxsIHRpbWUgem9uZXNcclxuICAgICAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZXF1YWxzRXhhY3QgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBvdGhlci51bml0KCkgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA8PSBiYXNpY3NfMS5UaW1lVW5pdC5EYXkgJiYgb3RoZXIudW5pdCgpIDwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2FtZSB1bml0IGFuZCBzYW1lIGFtb3VudFxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIChtb3N0IG5lZ2F0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUaGUgbWF4aW11bSAobW9zdCBwb3NpdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIE11bHRpcGx5IHdpdGggYSBmaXhlZCBudW1iZXIuXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogRGl2aWRlIGJ5IGEgZml4ZWQgbnVtYmVyLlxyXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAvIHZhbHVlKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLyB2YWx1ZSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBkdXJhdGlvbi5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLSB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkdXJhdGlvbiBpLmUuIHJlbW92ZSB0aGUgc2lnbi5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fYW1vdW50ID49IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXHJcbiAgICAgKiBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0Z1bGxTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9IbXNTdHJpbmcodHJ1ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbVs6c3NbLm5ubl1dIG5vdGF0aW9uLlxyXG4gICAgICogQHBhcmFtIGZ1bGwgSWYgdHJ1ZSwgdGhlbiBhbGwgZmllbGRzIGFyZSBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uIE90aGVyd2lzZSwgc2Vjb25kcyBhbmQgbWlsbGlzZWNvbmRzXHJcbiAgICAgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9IbXNTdHJpbmcgPSBmdW5jdGlvbiAoZnVsbCkge1xyXG4gICAgICAgIGlmIChmdWxsID09PSB2b2lkIDApIHsgZnVsbCA9IGZhbHNlOyB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgKHRoaXMuX2Ftb3VudCAvIDEwMDApLnRvRml4ZWQoMykgKyBcIlNcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJIXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIHdpdGggYW1vdW50IGFuZCB1bml0IGUuZy4gJzEuNSB5ZWFycycgb3IgJy0xIGRheSdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCIgXCIgKyBiYXNpY3MudGltZVVuaXRUb1N0cmluZyh0aGlzLl91bml0LCB0aGlzLl9hbW91bnQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbRHVyYXRpb246IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoaXMgJSB1bml0LCBhbHdheXMgcG9zaXRpdmVcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLl9wYXJ0ID0gZnVuY3Rpb24gKHVuaXQpIHtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAodW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXh0VW5pdDtcclxuICAgICAgICAvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XHJcbiAgICB9O1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLl9mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkLm1hdGNoKC9eLT9cXGRcXGQ/KDpcXGRcXGQ/KDpcXGRcXGQ/KC5cXGRcXGQ/XFxkPyk/KT8pPyQvKSkge1xyXG4gICAgICAgICAgICB2YXIgc2lnbiA9IDE7XHJcbiAgICAgICAgICAgIHZhciBob3Vyc18xID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbnV0ZXNfMSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSB0cmltbWVkLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICBpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcbiAgICAgICAgICAgICAgICBzaWduID0gLTE7XHJcbiAgICAgICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91cnNfMSA9ICtwYXJ0c1swXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgbWludXRlc18xID0gK3BhcnRzWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzXzEgPSArc2Vjb25kUGFydHNbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kc18xID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kc18xICsgMTAwMCAqIHNlY29uZHNfMSArIDYwMDAwICogbWludXRlc18xICsgMzYwMDAwMCAqIGhvdXJzXzEpO1xyXG4gICAgICAgICAgICAvLyBmaW5kIGxvd2VzdCBub24temVybyBudW1iZXIgYW5kIHRha2UgdGhhdCBhcyB1bml0XHJcbiAgICAgICAgICAgIGlmIChtaWxsaXNlY29uZHNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZHNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtaW51dGVzXzEgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaG91cnNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50TXNlYyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaXNGaW5pdGUoYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGFtb3VudCBpcyBpbmZpbml0ZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzLnN0cmluZ1RvVGltZVVuaXQoc3BsaXRbMV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gRHVyYXRpb247XHJcbn0oKSk7XHJcbmV4cG9ydHMuRHVyYXRpb24gPSBEdXJhdGlvbjtcclxuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kdXJhdGlvbi5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xyXG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbmV4cG9ydHMuTE9OR19NT05USF9OQU1FUyA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG5leHBvcnRzLlNIT1JUX01PTlRIX05BTUVTID0gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG5leHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XHJcbmV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTID0gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XHJcbmV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyA9IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcclxuZXhwb3J0cy5XRUVLREFZX1RXT19MRVRURVJTID0gW1wiU3VcIiwgXCJNb1wiLCBcIlR1XCIsIFwiV2VcIiwgXCJUaFwiLCBcIkZyXCIsIFwiU2FcIl07XHJcbmV4cG9ydHMuV0VFS0RBWV9MRVRURVJTID0gW1wiU1wiLCBcIk1cIiwgXCJUXCIsIFwiV1wiLCBcIlRcIiwgXCJGXCIsIFwiU1wiXTtcclxuZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IFwiUVwiO1xyXG5leHBvcnRzLlFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xyXG5leHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuZXhwb3J0cy5ERUZBVUxUX0ZPUk1BVF9PUFRJT05TID0ge1xyXG4gICAgcXVhcnRlckxldHRlcjogZXhwb3J0cy5RVUFSVEVSX0xFVFRFUixcclxuICAgIHF1YXJ0ZXJXb3JkOiBleHBvcnRzLlFVQVJURVJfV09SRCxcclxuICAgIHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBleHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuICAgIGxvbmdNb250aE5hbWVzOiBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMsXHJcbiAgICBzaG9ydE1vbnRoTmFtZXM6IGV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMsXHJcbiAgICBtb250aExldHRlcnM6IGV4cG9ydHMuTU9OVEhfTEVUVEVSUyxcclxuICAgIGxvbmdXZWVrZGF5TmFtZXM6IGV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTLFxyXG4gICAgc2hvcnRXZWVrZGF5TmFtZXM6IGV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuICAgIHdlZWtkYXlUd29MZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMsXHJcbiAgICB3ZWVrZGF5TGV0dGVyczogZXhwb3J0cy5XRUVLREFZX0xFVFRFUlNcclxufTtcclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0KGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUsIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgaWYgKGZvcm1hdE9wdGlvbnMgPT09IHZvaWQgMCkgeyBmb3JtYXRPcHRpb25zID0ge307IH1cclxuICAgIC8vIG1lcmdlIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCBmb3JtYXQgb3B0aW9uc1xyXG4gICAgLy8gdHlwZWNhc3QgdG8gcHJldmVudCBlcnJvciBUUzcwMTc6IEluZGV4IHNpZ25hdHVyZSBvZiBvYmplY3QgdHlwZSBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxyXG4gICAgdmFyIGdpdmVuRm9ybWF0T3B0aW9ucyA9IGZvcm1hdE9wdGlvbnM7XHJcbiAgICB2YXIgZGVmYXVsdEZvcm1hdE9wdGlvbnMgPSBleHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlM7XHJcbiAgICB2YXIgbWVyZ2VkRm9ybWF0T3B0aW9ucyA9IHt9O1xyXG4gICAgZm9yICh2YXIgbmFtZV8xIGluIGV4cG9ydHMuREVGQVVMVF9GT1JNQVRfT1BUSU9OUykge1xyXG4gICAgICAgIGlmIChleHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlMuaGFzT3duUHJvcGVydHkobmFtZV8xKSkge1xyXG4gICAgICAgICAgICB2YXIgZ2l2ZW5Gb3JtYXRPcHRpb24gPSBnaXZlbkZvcm1hdE9wdGlvbnNbbmFtZV8xXTtcclxuICAgICAgICAgICAgdmFyIGRlZmF1bHRGb3JtYXRPcHRpb24gPSBkZWZhdWx0Rm9ybWF0T3B0aW9uc1tuYW1lXzFdO1xyXG4gICAgICAgICAgICBtZXJnZWRGb3JtYXRPcHRpb25zW25hbWVfMV0gPSBnaXZlbkZvcm1hdE9wdGlvbiB8fCBkZWZhdWx0Rm9ybWF0T3B0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcm1hdE9wdGlvbnMgPSBtZXJnZWRGb3JtYXRPcHRpb25zO1xyXG4gICAgdmFyIHRva2VuaXplciA9IG5ldyB0b2tlbl8xLlRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG4gICAgdmFyIHRva2VucyA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcclxuICAgICAgICB2YXIgdG9rZW5SZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5FUkE6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWUVBUjpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUjpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVk6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9EOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdCArPSB0b2tlblJlc3VsdDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQudHJpbSgpO1xyXG59XHJcbmV4cG9ydHMuZm9ybWF0ID0gZm9ybWF0O1xyXG4vKipcclxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICB2YXIgQUQgPSBkYXRlVGltZS55ZWFyID4gMDtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBcIkFEXCIgOiBcIkJDXCIpO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IFwiQW5ubyBEb21pbmlcIiA6IFwiQmVmb3JlIENocmlzdFwiKTtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHllYXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcInlcIjpcclxuICAgICAgICBjYXNlIFwiWVwiOlxyXG4gICAgICAgIGNhc2UgXCJyXCI6XHJcbiAgICAgICAgICAgIHZhciB5ZWFyVmFsdWUgPSBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUueWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgeWVhclZhbHVlID0geWVhclZhbHVlLnNsaWNlKC0yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geWVhclZhbHVlO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgdmFyIHF1YXJ0ZXIgPSBNYXRoLmNlaWwoZGF0ZVRpbWUubW9udGggLyAzKTtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJXb3JkO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1vbnRoLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMubW9udGhMZXR0ZXJzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB3ZWVrIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrTnVtYmVyKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiZFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiRFwiOlxyXG4gICAgICAgICAgICB2YXIgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF5T2ZZZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICB2YXIgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICB9IC8vIE5vIGJyZWFrLCB0aGlzIGlzIGludGVudGlvbmFsIGZhbGx0aHJvdWdoIVxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5sb25nV2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICByZXR1cm4gKGRhdGVUaW1lLmhvdXIgPCAxMiA/IFwiQU1cIiA6IFwiUE1cIik7XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgSG91clxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgdmFyIGhvdXIgPSBkYXRlVGltZS5ob3VyO1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiaFwiOlxyXG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xyXG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IDEyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJIXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiS1wiOlxyXG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcImtcIjpcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSAyNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwic1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiU1wiOlxyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBkYXRlVGltZS5taWxsaTtcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZyYWN0aW9uU3RyaW5nLnNsaWNlKDAsIHRva2VuLmxlbmd0aCk7XHJcbiAgICAgICAgY2FzZSBcIkFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcclxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgdG9rZW4pIHtcclxuICAgIGlmICghem9uZSkge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gICAgdmFyIG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldEhvdXJzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xyXG4gICAgdmFyIG9mZnNldE1pbnV0ZXMgPSBNYXRoLmFicyhvZmZzZXQgJSA2MCk7XHJcbiAgICB2YXIgb2Zmc2V0TWludXRlc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRNaW51dGVzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIHZhciByZXN1bHQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJPXCI6XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiVVRDXCI7XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRIb3Vycy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID49IDQgfHwgb2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIGNhc2UgXCJaXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VG9rZW4gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiBcIk9PT09cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBcIk9cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInpcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInZcIjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIlZcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWRcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ1bmtcIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5uYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJYXCI6XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJ4XCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1mb3JtYXQuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBkYXRldGltZV8xID0gcmVxdWlyZShcIi4vZGF0ZXRpbWVcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqL1xyXG5mdW5jdGlvbiBtaW4oZDEsIGQyKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdCgoZDEgaW5zdGFuY2VvZiBkYXRldGltZV8xLkRhdGVUaW1lICYmIGQyIGluc3RhbmNlb2YgZGF0ZXRpbWVfMS5EYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24pLCBcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcbiAgICByZXR1cm4gZDEubWluKGQyKTtcclxufVxyXG5leHBvcnRzLm1pbiA9IG1pbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIG1heChkMSwgZDIpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KChkMSBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBkYXRldGltZV8xLkRhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiksIFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuICAgIHJldHVybiBkMS5tYXgoZDIpO1xyXG59XHJcbmV4cG9ydHMubWF4ID0gbWF4O1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgYSBEdXJhdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gYWJzKGQpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZCwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiwgXCJmaXJzdCBhcmd1bWVudCBpcyBub3QgYSBEdXJhdGlvblwiKTtcclxuICAgIHJldHVybiBkLmFicygpO1xyXG59XHJcbmV4cG9ydHMuYWJzID0gYWJzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbihmdW5jdGlvbiAoRGF0ZUZ1bmN0aW9ucykge1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIERhdGUuZ2V0RnVsbFllYXIoKSwgRGF0ZS5nZXRNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG4gICAgICovXHJcbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRcIl0gPSAwXSA9IFwiR2V0XCI7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIERhdGVGdW5jdGlvbnNbRGF0ZUZ1bmN0aW9uc1tcIkdldFVUQ1wiXSA9IDFdID0gXCJHZXRVVENcIjtcclxufSkoZXhwb3J0cy5EYXRlRnVuY3Rpb25zIHx8IChleHBvcnRzLkRhdGVGdW5jdGlvbnMgPSB7fSkpO1xyXG52YXIgRGF0ZUZ1bmN0aW9ucyA9IGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9amF2YXNjcmlwdC5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE1hdGggdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0ludChuKSB7XHJcbiAgICBpZiAodHlwZW9mIChuKSAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChpc05hTihuKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiAoTWF0aC5mbG9vcihuKSA9PT0gbik7XHJcbn1cclxuZXhwb3J0cy5pc0ludCA9IGlzSW50O1xyXG4vKipcclxuICogUm91bmRzIC0xLjUgdG8gLTIgaW5zdGVhZCBvZiAtMVxyXG4gKiBSb3VuZHMgKzEuNSB0byArMlxyXG4gKi9cclxuZnVuY3Rpb24gcm91bmRTeW0obikge1xyXG4gICAgaWYgKG4gPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xICogTWF0aC5yb3VuZCgtMSAqIG4pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5yb3VuZFN5bSA9IHJvdW5kU3ltO1xyXG4vKipcclxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXHJcbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxyXG4gKi9cclxuZnVuY3Rpb24gZmlsdGVyRmxvYXQodmFsdWUpIHtcclxuICAgIGlmICgvXihcXC18XFwrKT8oWzAtOV0rKFxcLlswLTldKyk/fEluZmluaXR5KSQvLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTmFOO1xyXG59XHJcbmV4cG9ydHMuZmlsdGVyRmxvYXQgPSBmaWx0ZXJGbG9hdDtcclxuZnVuY3Rpb24gcG9zaXRpdmVNb2R1bG8odmFsdWUsIG1vZHVsbykge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChtb2R1bG8gPj0gMSwgXCJtb2R1bG8gc2hvdWxkIGJlID49IDFcIik7XHJcbiAgICBpZiAodmFsdWUgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuICgodmFsdWUgJSBtb2R1bG8pICsgbW9kdWxvKSAlIG1vZHVsbztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZSAlIG1vZHVsbztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBvc2l0aXZlTW9kdWxvID0gcG9zaXRpdmVNb2R1bG87XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGguanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gZGF0ZXRpbWUgc3RyaW5nIGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0XHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBMRE1MIGZvcm1hdCBzdHJpbmdcclxuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcclxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VhYmxlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIGFsbG93VHJhaWxpbmcpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgcGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgbnVsbCwgYWxsb3dUcmFpbGluZyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlYWJsZSA9IHBhcnNlYWJsZTtcclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBvdmVycmlkZVpvbmUsIGFsbG93VHJhaWxpbmcpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFmb3JtYXRTdHJpbmcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBmb3JtYXQgZ2l2ZW5cIik7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW5fMS5Ub2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuICAgICAgICB2YXIgdG9rZW5zID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcbiAgICAgICAgdmFyIHRpbWUgPSB7IHllYXI6IC0xIH07XHJcbiAgICAgICAgdmFyIHpvbmUgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHBuciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcHpyID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciByZW1haW5pbmcgPSBkYXRlVGltZVN0cmluZztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV07XHJcbiAgICAgICAgICAgIHZhciB0b2tlblJlc3VsdCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5kYXkgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1JTlVURTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcInNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbGxpID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICdcIiArIHRva2VuLnJhdyArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgICAgICBwenIgPSBzdHJpcFpvbmUocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvbmUgPSBwenIuem9uZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICB2YXIgcmVzdWx0ID0geyB0aW1lOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0aW1lKSwgem9uZTogem9uZSB8fCBudWxsIH07XHJcbiAgICAgICAgaWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlc3VsdGluZyBkYXRlIGludmFsaWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFsd2F5cyBvdmVyd3JpdGUgem9uZSB3aXRoIGdpdmVuIHpvbmVcclxuICAgICAgICBpZiAob3ZlcnJpZGVab25lKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgZGF0ZSAnXCIgKyBkYXRlVGltZVN0cmluZyArIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIgKyBmb3JtYXRTdHJpbmcgKyBcIic6IHRyYWlsaW5nIGNoYXJhY3RlcnM6ICdyZW1haW5pbmcnXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGRhdGUgJ1wiICsgZGF0ZVRpbWVTdHJpbmcgKyBcIicgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJ1wiICsgZm9ybWF0U3RyaW5nICsgXCInOiBcIiArIGUubWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xyXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIG46IE5hTixcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkubWF0Y2goL1xcZC8pKSB7XHJcbiAgICAgICAgbnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xyXG4gICAgd2hpbGUgKG51bWJlclN0cmluZy5jaGFyQXQoMCkgPT09IFwiMFwiICYmIG51bWJlclN0cmluZy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgbnVtYmVyU3RyaW5nID0gbnVtYmVyU3RyaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XHJcbiAgICBpZiAobnVtYmVyU3RyaW5nID09PSBcIlwiIHx8ICFpc0Zpbml0ZShyZXN1bHQubikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICdcIiArIG51bWJlclN0cmluZyArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxudmFyIFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xyXG5mdW5jdGlvbiBzdHJpcFpvbmUocykge1xyXG4gICAgaWYgKHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgem9uZTogbnVsbCxcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgem9uZVN0cmluZyA9IFwiXCI7XHJcbiAgICB3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XHJcbiAgICAgICAgem9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICB9XHJcbiAgICByZXN1bHQuem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZnVuY3Rpb24gc3RyaXBSYXcocywgZXhwZWN0ZWQpIHtcclxuICAgIHZhciByZW1haW5pbmcgPSBzO1xyXG4gICAgdmFyIGVyZW1haW5pbmcgPSBleHBlY3RlZDtcclxuICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiBlcmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLmNoYXJBdCgwKSA9PT0gZXJlbWFpbmluZy5jaGFyQXQoMCkpIHtcclxuICAgICAgICByZW1haW5pbmcgPSByZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgICAgIGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIGlmIChlcmVtYWluaW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCAnXCIgKyBleHBlY3RlZCArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2UuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuLyoqXHJcbiAqIFNwZWNpZmllcyBob3cgdGhlIHBlcmlvZCBzaG91bGQgcmVwZWF0IGFjcm9zcyB0aGUgZGF5XHJcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICovXHJcbihmdW5jdGlvbiAoUGVyaW9kRHN0KSB7XHJcbiAgICAvKipcclxuICAgICAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcclxuICAgICAqIHVuYWZmZWN0ZWQgYnkgRGF5bGlnaHQgU2F2aW5nIFRpbWUuXHJcbiAgICAgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxyXG4gICAgICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cclxuICAgICAqIExlYXAgc2Vjb25kcywgbGVhcCBkYXlzIGFuZCBtb250aCBsZW5ndGhcclxuICAgICAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJJbnRlcnZhbHNcIl0gPSAwXSA9IFwiUmVndWxhckludGVydmFsc1wiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcclxuICAgICAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cclxuICAgICAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXHJcbiAgICAgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcclxuICAgICAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXHJcbiAgICAgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAgICAgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxyXG4gICAgICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJMb2NhbFRpbWVcIl0gPSAxXSA9IFwiUmVndWxhckxvY2FsVGltZVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQtb2YtZW51bSBtYXJrZXJcclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIk1BWFwiXSA9IDJdID0gXCJNQVhcIjtcclxufSkoZXhwb3J0cy5QZXJpb2REc3QgfHwgKGV4cG9ydHMuUGVyaW9kRHN0ID0ge30pKTtcclxudmFyIFBlcmlvZERzdCA9IGV4cG9ydHMuUGVyaW9kRHN0O1xyXG4vKipcclxuICogQ29udmVydCBhIFBlcmlvZERzdCB0byBhIHN0cmluZzogXCJyZWd1bGFyIGludGVydmFsc1wiIG9yIFwicmVndWxhciBsb2NhbCB0aW1lXCJcclxuICovXHJcbmZ1bmN0aW9uIHBlcmlvZERzdFRvU3RyaW5nKHApIHtcclxuICAgIHN3aXRjaCAocCkge1xyXG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM6IHJldHVybiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCI7XHJcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTogcmV0dXJuIFwicmVndWxhciBsb2NhbCB0aW1lXCI7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gUGVyaW9kRHN0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wZXJpb2REc3RUb1N0cmluZyA9IHBlcmlvZERzdFRvU3RyaW5nO1xyXG4vKipcclxuICogUmVwZWF0aW5nIHRpbWUgcGVyaW9kOiBjb25zaXN0cyBvZiBhIHJlZmVyZW5jZSBkYXRlIGFuZFxyXG4gKiBhIHRpbWUgbGVuZ3RoLiBUaGlzIGNsYXNzIGFjY291bnRzIGZvciBsZWFwIHNlY29uZHMgYW5kIGxlYXAgZGF5cy5cclxuICovXHJcbnZhciBQZXJpb2QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFBlcmlvZChyZWZlcmVuY2UsIGFtb3VudE9ySW50ZXJ2YWwsIHVuaXRPckRzdCwgZ2l2ZW5Ec3QpIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWw7XHJcbiAgICAgICAgdmFyIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gYW1vdW50T3JJbnRlcnZhbDtcclxuICAgICAgICAgICAgZHN0ID0gdW5pdE9yRHN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJJbnZhbGlkIHVuaXRcIik7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCwgdW5pdE9yRHN0KTtcclxuICAgICAgICAgICAgZHN0ID0gZ2l2ZW5Ec3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhcmVmZXJlbmNlLCBcIlJlZmVyZW5jZSB0aW1lIG5vdCBnaXZlblwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGludGVydmFsLmFtb3VudCgpID4gMCwgXCJBbW91bnQgbXVzdCBiZSBwb3NpdGl2ZSBub24temVyby5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XHJcbiAgICAgICAgdGhpcy5fcmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG4gICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XHJcbiAgICAgICAgdGhpcy5fZHN0ID0gZHN0O1xyXG4gICAgICAgIHRoaXMuX2NhbGNJbnRlcm5hbFZhbHVlcygpO1xyXG4gICAgICAgIC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxyXG4gICAgICAgIC8vIE5vdGUgd2UgdXNlIGludGVybmFsIGFtb3VudHMgdG8gZGVjaWRlIHRoaXMgYmVjYXVzZSBhY3R1YWxseSBpdCBpcyBzdXBwb3J0ZWQgaWZcclxuICAgICAgICAvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwMDAwLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDI0LCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnJlZmVyZW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaW50ZXJ2YWxcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pbnRlcnZhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuYW1vdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmRzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cclxuICAgICAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG4gICAgICogQHJldHVybiB0aGUgZmlyc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGFmdGVyIGZyb21EYXRlLCBnaXZlblxyXG4gICAgICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoZnJvbURhdGUpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFmcm9tRGF0ZS56b25lKCksIFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICB2YXIgYXBwcm94O1xyXG4gICAgICAgIHZhciBhcHByb3gyO1xyXG4gICAgICAgIHZhciBhcHByb3hNaW47XHJcbiAgICAgICAgdmFyIHBlcmlvZHM7XHJcbiAgICAgICAgdmFyIGRpZmY7XHJcbiAgICAgICAgdmFyIG5ld1llYXI7XHJcbiAgICAgICAgdmFyIG5ld01vbnRoO1xyXG4gICAgICAgIHZhciByZW1haW5kZXI7XHJcbiAgICAgICAgdmFyIGltYXg7XHJcbiAgICAgICAgdmFyIGltaW47XHJcbiAgICAgICAgdmFyIGltaWQ7XHJcbiAgICAgICAgdmFyIG5vcm1hbEZyb20gPSB0aGlzLl9ub3JtYWxpemVEYXkoZnJvbURhdGUudG9ab25lKHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpKTtcclxuICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcclxuICAgICAgICAgICAgLy8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSwgbm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEFtb3VudCBpcyBub3QgMSxcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuc2Vjb25kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnV0Y1llYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNZZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCB0aW1lcy4gSWYgdGhlIHVuaXQgaXMgbGVzcyB0aGFuIGEgZGF5LCB3ZSByZWZlcmVuY2UgZWFjaCBkYXkgYW5ld1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxMDAwICYmICgxMDAwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIHNlY29uZCBlYWNoIG1pbnV0ZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gaW1pZCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaW51dGVzLCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGZpdCBpbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcHJldmlvdXMgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20ubW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXHJcbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcbiAgICAgKiBAcmV0dXJuIChwcmV2ICsgY291bnQgKiBwZXJpb2QpLCBpbiB0aGUgc2FtZSB0aW1lem9uZSBhcyBwcmV2LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKHByZXYsIGNvdW50KSB7XHJcbiAgICAgICAgaWYgKGNvdW50ID09PSB2b2lkIDApIHsgY291bnQgPSAxOyB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoY291bnQpID09PSBcIm51bWJlclwiLCBcIkNvdW50IG11c3QgYmUgYSBudW1iZXJcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkUHJldiA9IHRoaXMuX25vcm1hbGl6ZURheShwcmV2LnRvWm9uZSh0aGlzLl9yZWZlcmVuY2Uuem9uZSgpKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSkuY29udmVydChwcmV2LnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxyXG4gICAgICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuICAgICAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBsYXN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBiZWZvcmUgZnJvbURhdGUsIGdpdmVuXHJcbiAgICAgKlx0XHRcdGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKGZyb20pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG4gICAgICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kUHJldiA9IGZ1bmN0aW9uIChuZXh0LCBjb3VudCkge1xyXG4gICAgICAgIGlmIChjb3VudCA9PT0gdm9pZCAwKSB7IGNvdW50ID0gMTsgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgb24gYSBwZXJpb2QgYm91bmRhcnlcclxuICAgICAqIChleHBlbnNpdmUhKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmlzQm91bmRhcnkgPSBmdW5jdGlvbiAob2NjdXJyZW5jZSkge1xyXG4gICAgICAgIGlmICghb2NjdXJyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLCBcIlRoZSBvY2N1cnJlbmNlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoZHVyYXRpb25fMS5EdXJhdGlvbi5taWxsaXNlY29uZHMoMSkpKS5lcXVhbHMob2NjdXJyZW5jZSkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKiBpLmUuIGEgcGVyaW9kIG9mIDI0IGhvdXJzIGlzIGVxdWFsIHRvIG9uZSBvZiAxIGRheSBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgVVRDIHJlZmVyZW5jZSBtb21lbnRcclxuICAgICAqIGFuZCBzYW1lIGRzdC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICAvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIHJlZmVyZW5jZSgpIGJlY2F1c2UgdGhpcyBoYXMgYW4gaW5mbHVlbmNlIG9uIHRoZSBvdXRjb21lXHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmlzQm91bmRhcnkob3RoZXIucmVmZXJlbmNlKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludEludGVydmFsLmVxdWFsc0V4YWN0KG90aGVyLmludGVydmFsKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludERzdCA9PT0gb3RoZXIuX2ludERzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIucmVmZXJlbmNlKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5pbnRlcnZhbCgpKVxyXG4gICAgICAgICAgICAmJiB0aGlzLmRzdCgpID09PSBvdGhlci5kc3QoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIElTTyBkdXJhdGlvbiBzdHJpbmcgZS5nLlxyXG4gICAgICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFIXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMU0gICAob25lIG1vbnRoKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2UudG9Jc29TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5faW50ZXJ2YWwudG9Jc29TdHJpbmcoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGUuZy5cclxuICAgICAqIFwiMTAgeWVhcnMsIHJlZmVyZW5jZWluZyBhdCAyMDE0LTAzLTAxVDEyOjAwOjAwIEV1cm9wZS9BbXN0ZXJkYW0sIGtlZXBpbmcgcmVndWxhciBpbnRlcnZhbHNcIi5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltQZXJpb2Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JyZWN0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIF9yZWZlcmVuY2UgYW5kIF9pbnRSZWZlcmVuY2UuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NvcnJlY3REYXkgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcbiAgICAgKiB0byA8PSAyOC5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fbm9ybWFsaXplRGF5ID0gZnVuY3Rpb24gKGQsIGFueW1vbnRoKSB7XHJcbiAgICAgICAgaWYgKGFueW1vbnRoID09PSB2b2lkIDApIHsgYW55bW9udGggPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcclxuICAgICAgICAgICAgfHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShkLnllYXIoKSwgZC5tb250aCgpLCAyOCwgZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7IC8vIHNhdmUgb24gdGltZSBieSBub3QgcmV0dXJuaW5nIGEgY2xvbmVcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cclxuICAgICAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2RzdFJlbGV2YW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAoISF0aGlzLl9yZWZlcmVuY2Uuem9uZSgpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX3JlZmVyZW5jZS56b25lKCkua2luZCgpID09PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5Qcm9wZXJcclxuICAgICAgICAgICAgJiYgdGhpcy5fcmVmZXJlbmNlLnpvbmUoKS5oYXNEc3QoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgdGhlIHZhbHVlcyB3aGVyZSBwb3NzaWJsZSAtIG5vdCBhbGwgdmFsdWVzXHJcbiAgICAgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxyXG4gICAgICogRS5nLiBtb3JlIHRoYW4gNjAgbWludXRlcyBpcyB0cmFuc2ZlcnJlZCB0byBob3VycyxcclxuICAgICAqIGJ1dCBzZWNvbmRzIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZCB0byBtaW51dGVzIGR1ZSB0byBsZWFwIHNlY29uZHMuXHJcbiAgICAgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fY2FsY0ludGVybmFsVmFsdWVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhbnkgYWJvdmUtdW5pdCB2YWx1ZXNcclxuICAgICAgICB2YXIgaW50QW1vdW50ID0gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICAgICAgdmFyIGludFVuaXQgPSB0aGlzLl9pbnRlcnZhbC51bml0KCk7XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcclxuICAgICAgICAgICAgLy8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDEwMDA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuSG91ciAmJiBpbnRBbW91bnQgPj0gMjQgJiYgaW50QW1vdW50ICUgMjQgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyByZW1vdmUgd2Vla3Mgc28gd2UgaGF2ZSBvbmUgbGVzcyBjYXNlIHRvIHdvcnJ5IGFib3V0XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LldlZWspIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50ICogNztcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIGludEFtb3VudCA+PSAxMiAmJiBpbnRBbW91bnQgJSAxMiA9PT0gMCkge1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMjtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2ludEludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oaW50QW1vdW50LCBpbnRVbml0KTtcclxuICAgICAgICAvLyBub3JtYWxpemUgZHN0IGhhbmRsaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSByZWZlcmVuY2UgZGF5XHJcbiAgICAgICAgdGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQZXJpb2Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUGVyaW9kID0gUGVyaW9kO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJpb2QuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBTdHJpbmcgdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gcGFkTGVmdChzLCB3aWR0aCwgY2hhcikge1xyXG4gICAgdmFyIHBhZGRpbmcgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG4gICAgICAgIHBhZGRpbmcgKz0gY2hhcjtcclxuICAgIH1cclxuICAgIHJldHVybiBwYWRkaW5nICsgcztcclxufVxyXG5leHBvcnRzLnBhZExlZnQgPSBwYWRMZWZ0O1xyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gcGFkUmlnaHQocywgd2lkdGgsIGNoYXIpIHtcclxuICAgIHZhciBwYWRkaW5nID0gXCJcIjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcyArIHBhZGRpbmc7XHJcbn1cclxuZXhwb3J0cy5wYWRSaWdodCA9IHBhZFJpZ2h0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdHJpbmdzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogRGVmYXVsdCB0aW1lIHNvdXJjZSwgcmV0dXJucyBhY3R1YWwgdGltZVxyXG4gKi9cclxudmFyIFJlYWxUaW1lU291cmNlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJlYWxUaW1lU291cmNlKCkge1xyXG4gICAgfVxyXG4gICAgUmVhbFRpbWVTb3VyY2UucHJvdG90eXBlLm5vdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVhbFRpbWVTb3VyY2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUmVhbFRpbWVTb3VyY2UgPSBSZWFsVGltZVNvdXJjZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZXNvdXJjZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFRpbWUgem9uZSByZXByZXNlbnRhdGlvbiBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxuLyoqXHJcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZnVuY3Rpb24gbG9jYWwoKSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUubG9jYWwoKTtcclxufVxyXG5leHBvcnRzLmxvY2FsID0gbG9jYWw7XHJcbi8qKlxyXG4gKiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSB6b25lLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmZ1bmN0aW9uIHV0YygpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS51dGMoKTtcclxufVxyXG5leHBvcnRzLnV0YyA9IHV0YztcclxuLyoqXHJcbiAqIFNlZSB0aGUgZGVzY3JpcHRpb25zIGZvciB0aGUgb3RoZXIgem9uZSgpIG1ldGhvZCBzaWduYXR1cmVzLlxyXG4gKi9cclxuZnVuY3Rpb24gem9uZShhLCBkc3QpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XHJcbn1cclxuZXhwb3J0cy56b25lID0gem9uZTtcclxuLyoqXHJcbiAqIFRoZSB0eXBlIG9mIHRpbWUgem9uZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChUaW1lWm9uZUtpbmQpIHtcclxuICAgIC8qKlxyXG4gICAgICogTG9jYWwgdGltZSBvZmZzZXQgYXMgZGV0ZXJtaW5lZCBieSBKYXZhU2NyaXB0IERhdGUgY2xhc3MuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJMb2NhbFwiXSA9IDBdID0gXCJMb2NhbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBJQU5BIHRpbWV6b25lIG1hbmFnZWQgdGhyb3VnaCBPbHNlbiBUWiBkYXRhYmFzZS4gSW5jbHVkZXNcclxuICAgICAqIERTVCBpZiBhcHBsaWNhYmxlLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiUHJvcGVyXCJdID0gMl0gPSBcIlByb3BlclwiO1xyXG59KShleHBvcnRzLlRpbWVab25lS2luZCB8fCAoZXhwb3J0cy5UaW1lWm9uZUtpbmQgPSB7fSkpO1xyXG52YXIgVGltZVpvbmVLaW5kID0gZXhwb3J0cy5UaW1lWm9uZUtpbmQ7XHJcbi8qKlxyXG4gKiBUaW1lIHpvbmUuIFRoZSBvYmplY3QgaXMgaW1tdXRhYmxlIGJlY2F1c2UgaXQgaXMgY2FjaGVkOlxyXG4gKiByZXF1ZXN0aW5nIGEgdGltZSB6b25lIHR3aWNlIHlpZWxkcyB0aGUgdmVyeSBzYW1lIG9iamVjdC5cclxuICogTm90ZSB0aGF0IHdlIHVzZSB0aW1lIHpvbmUgb2Zmc2V0cyBpbnZlcnRlZCB3LnIudC4gSmF2YVNjcmlwdCBEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCksXHJcbiAqIGkuZS4gb2Zmc2V0IDkwIG1lYW5zICswMTozMC5cclxuICpcclxuICogVGltZSB6b25lcyBjb21lIGluIHRocmVlIGZsYXZvcnM6IHRoZSBsb2NhbCB0aW1lIHpvbmUsIGFzIGNhbGN1bGF0ZWQgYnkgSmF2YVNjcmlwdCBEYXRlLFxyXG4gKiBhIGZpeGVkIG9mZnNldCAoXCIrMDE6MzBcIikgd2l0aG91dCBEU1QsIG9yIGEgSUFOQSB0aW1lem9uZSAoXCJFdXJvcGUvQW1zdGVyZGFtXCIpIHdpdGggRFNUXHJcbiAqIGFwcGxpZWQgZGVwZW5kaW5nIG9uIHRoZSB0aW1lIHpvbmUgcnVsZXMuXHJcbiAqL1xyXG52YXIgVGltZVpvbmUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEbyBub3QgdXNlIHRoaXMgY29uc3RydWN0b3IsIHVzZSB0aGUgc3RhdGljXHJcbiAgICAgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXHJcbiAgICAgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxyXG4gICAgICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUsIGlnbm9yZWQgZm9yIGxvY2FsIHRpbWUgYW5kIGZpeGVkIG9mZnNldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVGltZVpvbmUobmFtZSwgZHN0KSB7XHJcbiAgICAgICAgaWYgKGRzdCA9PT0gdm9pZCAwKSB7IGRzdCA9IHRydWU7IH1cclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLl9kc3QgPSBkc3Q7XHJcbiAgICAgICAgaWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5PZmZzZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Qcm9wZXI7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBcIm5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnXCIgKyBuYW1lICsgXCInXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcclxuICAgICAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxyXG4gICAgICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5sb2NhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcImxvY2FsdGltZVwiLCB0cnVlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBVVEMgdGltZSB6b25lLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS51dGMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJVVENcIiwgdHJ1ZSk7IC8vIHVzZSAndHJ1ZScgZm9yIERTVCBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gZGlzcGxheSBhcyBcIlVUQ1wiLCBub3QgXCJVVEMgd2l0aG91dCBEU1RcIlxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogWm9uZSBpbXBsZW1lbnRhdGlvbnNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuem9uZSA9IGZ1bmN0aW9uIChhLCBkc3QpIHtcclxuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHZhciBuYW1lID0gXCJcIjtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiAoYSkpIHtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gYTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBubyB0aW1lIHpvbmVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gYTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG9mZnNldCA+IC0yNCAqIDYwICYmIG9mZnNldCA8IDI0ICogNjAsIFwiVGltZVpvbmUuem9uZSgpOiBvZmZzZXQgb3V0IG9mIHJhbmdlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRpbWVab25lLnpvbmUoKTogVW5leHBlY3RlZCBhcmd1bWVudCB0eXBlIFxcXCJcIiArIHR5cGVvZiAoYSkgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgY2FjaGVkIHlvdSB3aWxsIE5PVFxyXG4gICAgICogYWN0dWFsbHkgZ2V0IGEgY2xvbmUgYnV0IHRoZSBzYW1lIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyLiBDYW4gYmUgYW4gb2Zmc2V0IFwiLTAxOjMwXCIgb3IgYW5cclxuICAgICAqIElBTkEgdGltZSB6b25lIG5hbWUgXCJFdXJvcGUvQW1zdGVyZGFtXCIsIG9yIFwibG9jYWx0aW1lXCIgZm9yXHJcbiAgICAgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUubmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kc3Q7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgKExvY2FsL09mZnNldC9Qcm9wZXIpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9raW5kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRXF1YWxpdHkgb3BlcmF0b3IuIE1hcHMgemVybyBvZmZzZXRzIGFuZCBkaWZmZXJlbnQgbmFtZXMgZm9yIFVUQyBvbnRvXHJcbiAgICAgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmlzVXRjKCkgJiYgb3RoZXIuaXNVdGMoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxyXG4gICAgICAgICAgICAgICAgJiYgKHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCB8fCAhdGhpcy5oYXNEc3QoKSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWUgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHpvbmUga2luZC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSXMgdGhpcyB6b25lIGVxdWl2YWxlbnQgdG8gVVRDP1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaXNVdGMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuICh0aGlzLl9vZmZzZXQgPT09IDApO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaGFzRHN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclV0YyA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICB2YXIgdXRjVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBiYXNpY3NfMS5UaW1lU3RydWN0ID8gYSA6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSkpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSwgdXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIFRpbWVab25lS2luZCAnXCIgKyB0aGlzLl9raW5kICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yWm9uZSA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICB2YXIgbG9jYWxUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIGJhc2ljc18xLlRpbWVTdHJ1Y3QgPyBhIDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSk7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuZGF5LCBsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIC8vIG5vdGUgdGhhdCBUekRhdGFiYXNlIG5vcm1hbGl6ZXMgdGhlIGdpdmVuIGRhdGUgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyBpdFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVua25vd24gVGltZVpvbmVLaW5kICdcIiArIHRoaXMuX2tpbmQgKyBcIidcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuICAgICAqXHJcbiAgICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcclxuICAgICAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXHJcbiAgICAgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclV0Y0RhdGUgPSBmdW5jdGlvbiAoZGF0ZSwgZnVuY3MpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuICAgICAqXHJcbiAgICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcclxuICAgICAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXHJcbiAgICAgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmVEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Rm9yWm9uZShiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmFiYnJldmlhdGlvbkZvclV0YyA9IGZ1bmN0aW9uIChhLCBiLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSwgYykge1xyXG4gICAgICAgIHZhciB1dGNUaW1lO1xyXG4gICAgICAgIHZhciBkc3REZXBlbmRlbnQgPSB0cnVlO1xyXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgYmFzaWNzXzEuVGltZVN0cnVjdCkge1xyXG4gICAgICAgICAgICB1dGNUaW1lID0gYTtcclxuICAgICAgICAgICAgZHN0RGVwZW5kZW50ID0gKGIgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHV0Y1RpbWUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBiLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChjID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibG9jYWxcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuYWJicmV2aWF0aW9uKHRoaXMuX25hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBUaW1lWm9uZUtpbmQgJ1wiICsgdGhpcy5fa2luZCArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm5vcm1hbGl6ZVpvbmVUaW1lID0gZnVuY3Rpb24gKGxvY2FsVGltZSwgb3B0KSB7XHJcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwOyB9XHJcbiAgICAgICAgdmFyIHR6b3B0ID0gKG9wdCA9PT0gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93biA/IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcCk7XHJcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lLCB0em9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyIChub3JtYWxpemVkKS5cclxuICAgICAqIEVpdGhlciBcImxvY2FsdGltZVwiLCBJQU5BIG5hbWUsIG9yIFwiK2hoOm1tXCIgb2Zmc2V0LlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMubmFtZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEc3QoKSAmJiAhdGhpcy5kc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW1RpbWVab25lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW4gSVNPIG5vdGF0aW9uIFwiKzAxOjMwXCIgZm9yICs5MCBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLm9mZnNldFRvU3RyaW5nID0gZnVuY3Rpb24gKG9mZnNldCkge1xyXG4gICAgICAgIHZhciBzaWduID0gKG9mZnNldCA8IDAgPyBcIi1cIiA6IFwiK1wiKTtcclxuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XHJcbiAgICAgICAgcmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHRvIG9mZnNldCBjb252ZXJzaW9uLlxyXG4gICAgICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcclxuICAgICAqIEByZXR1cm4gb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5zdHJpbmdUb09mZnNldCA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICAvLyBlYXN5IGNhc2VcclxuICAgICAgICBpZiAodCA9PT0gXCJaXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHQubWF0Y2goL15bKy1dXFxkXFxkKDo/KVxcZFxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCQvKSwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xyXG4gICAgICAgIHZhciBzaWduID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gcGFyc2VJbnQodC5zdWJzdHIoMSwgMiksIDEwKTtcclxuICAgICAgICB2YXIgbWludXRlcyA9IDA7XHJcbiAgICAgICAgaWYgKHQubGVuZ3RoID09PSA1KSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0LnN1YnN0cigzLCAyKSwgMTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0Lmxlbmd0aCA9PT0gNikge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoNCwgMiksIDEwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChob3VycyA+PSAwICYmIGhvdXJzIDwgMjQsIFwiT2Zmc2V0cyBmcm9tIFVUQyBtdXN0IGJlIGxlc3MgdGhhbiBhIGRheS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHNpZ24gKiAoaG91cnMgKiA2MCArIG1pbnV0ZXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRmluZCBpbiBjYWNoZSBvciBjcmVhdGUgem9uZVxyXG4gICAgICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWU/XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9maW5kT3JDcmVhdGUgPSBmdW5jdGlvbiAobmFtZSwgZHN0KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IG5hbWUgKyAoZHN0ID8gXCJfRFNUXCIgOiBcIl9OTy1EU1RcIik7XHJcbiAgICAgICAgaWYgKGtleSBpbiBUaW1lWm9uZS5fY2FjaGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHQgPSBuZXcgVGltZVpvbmUobmFtZSwgZHN0KTtcclxuICAgICAgICAgICAgVGltZVpvbmUuX2NhY2hlW2tleV0gPSB0O1xyXG4gICAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGFcclxuICAgICAqIGNhY2hlIGxvb2t1cFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodC5sZW5ndGggPiAwLCBcIkVtcHR5IHRpbWUgem9uZSBzdHJpbmcgZ2l2ZW5cIik7XHJcbiAgICAgICAgaWYgKHQgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHQgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIiswMDowMFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcclxuICAgICAgICAgICAgLy8gb2Zmc2V0IHN0cmluZ1xyXG4gICAgICAgICAgICAvLyBub3JtYWxpemUgYnkgY29udmVydGluZyBiYWNrIGFuZCBmb3J0aFxyXG4gICAgICAgICAgICByZXR1cm4gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcoVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQodCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gT2xzZW4gVFogZGF0YWJhc2UgbmFtZVxyXG4gICAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xyXG4gICAgICAgIHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lIHpvbmUgY2FjaGUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9jYWNoZSA9IHt9O1xyXG4gICAgcmV0dXJuIFRpbWVab25lO1xyXG59KCkpO1xyXG5leHBvcnRzLlRpbWVab25lID0gVGltZVpvbmU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWV6b25lLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUb2tlbml6ZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgdG9rZW5pemVyXHJcbiAgICAgKiBAcGFyYW0gX2Zvcm1hdFN0cmluZyAob3B0aW9uYWwpIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUb2tlbml6ZXIoX2Zvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2Zvcm1hdFN0cmluZyA9IF9mb3JtYXRTdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgbmV3IHN0cmluZyB0byB1c2UgZm9yIGZvcm1hdHRpbmdcclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5zZXRGb3JtYXRTdHJpbmcgPSBmdW5jdGlvbiAoZm9ybWF0U3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fZm9ybWF0U3RyaW5nID0gZm9ybWF0U3RyaW5nO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kIGEgbmV3IHRva2VuIHRvIHRoZSBjdXJyZW50IGxpc3Qgb2YgdG9rZW5zLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB0b2tlblN0cmluZyBUaGUgc3RyaW5nIHRoYXQgbWFrZXMgdXAgdGhlIHRva2VuXHJcbiAgICAgKiBAcGFyYW0gdG9rZW5BcnJheSBUaGUgZXhpc3RpbmcgYXJyYXkgb2YgdG9rZW5zXHJcbiAgICAgKiBAcGFyYW0gcmF3IChvcHRpb25hbCkgSWYgdHJ1ZSwgZG9uJ3QgcGFyc2UgdGhlIHRva2VuIGJ1dCBpbnNlcnQgaXQgYXMgaXNcclxuICAgICAqIEByZXR1cm4gVG9rZW5bXSBUaGUgcmVzdWx0aW5nIGFycmF5IG9mIHRva2Vucy5cclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5fYXBwZW5kVG9rZW4gPSBmdW5jdGlvbiAodG9rZW5TdHJpbmcsIHRva2VuQXJyYXksIHJhdykge1xyXG4gICAgICAgIGlmICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCFyYXcpIHtcclxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgPSBtYXBTeW1ib2xUb1R5cGUodG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2tlbkFycmF5LnB1c2godG9rZW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9rZW5BcnJheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBpbnRlcm5hbCBzdHJpbmcgYW5kIHJldHVybiBhbiBhcnJheSBvZiB0b2tlbnMuXHJcbiAgICAgKiBAcmV0dXJuIFRva2VuW11cclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5wYXJzZVRva2VucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICAgICAgdmFyIHByZXZpb3VzQ2hhciA9IFwiXCI7XHJcbiAgICAgICAgdmFyIHF1b3RpbmcgPSBmYWxzZTtcclxuICAgICAgICB2YXIgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZm9ybWF0U3RyaW5nLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q2hhciA9IHRoaXMuX2Zvcm1hdFN0cmluZ1tpXTtcclxuICAgICAgICAgICAgLy8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICghcXVvdGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBcIidcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF5YmUgZXNjYXBpbmcsIHdhaXQgZm9yIG5leHQgdG9rZW4gaWYgd2UgYXJlIGVzY2FwaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghcG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgY2hhcmFjdGVyIGlzIHJlbGV2YW50LCBzbyBzYXZlIGl0IGZvciBpbnNwZWN0aW5nIG5leHQgcm91bmRcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgIHF1b3RpbmcgPSAhcXVvdGluZztcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCAhcXVvdGluZyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChxdW90aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBRdW90aW5nIG1vZGUsIGFkZCBjaGFyYWN0ZXIgdG8gdG9rZW4uXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsIHF1b3RpbmcpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFRva2VuaXplcjtcclxufSgpKTtcclxuZXhwb3J0cy5Ub2tlbml6ZXIgPSBUb2tlbml6ZXI7XHJcbi8qKlxyXG4gKiBEaWZmZXJlbnQgdHlwZXMgb2YgdG9rZW5zLCBlYWNoIGZvciBhIERhdGVUaW1lIFwicGVyaW9kIHR5cGVcIiAobGlrZSB5ZWFyLCBtb250aCwgaG91ciBldGMuKVxyXG4gKi9cclxuKGZ1bmN0aW9uIChEYXRlVGltZVRva2VuVHlwZSkge1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJJREVOVElUWVwiXSA9IDBdID0gXCJJREVOVElUWVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJFUkFcIl0gPSAxXSA9IFwiRVJBXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIllFQVJcIl0gPSAyXSA9IFwiWUVBUlwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJRVUFSVEVSXCJdID0gM10gPSBcIlFVQVJURVJcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiTU9OVEhcIl0gPSA0XSA9IFwiTU9OVEhcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiV0VFS1wiXSA9IDVdID0gXCJXRUVLXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkRBWVwiXSA9IDZdID0gXCJEQVlcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiV0VFS0RBWVwiXSA9IDddID0gXCJXRUVLREFZXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkRBWVBFUklPRFwiXSA9IDhdID0gXCJEQVlQRVJJT0RcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiSE9VUlwiXSA9IDldID0gXCJIT1VSXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIk1JTlVURVwiXSA9IDEwXSA9IFwiTUlOVVRFXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIlNFQ09ORFwiXSA9IDExXSA9IFwiU0VDT05EXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIlpPTkVcIl0gPSAxMl0gPSBcIlpPTkVcIjtcclxufSkoZXhwb3J0cy5EYXRlVGltZVRva2VuVHlwZSB8fCAoZXhwb3J0cy5EYXRlVGltZVRva2VuVHlwZSA9IHt9KSk7XHJcbnZhciBEYXRlVGltZVRva2VuVHlwZSA9IGV4cG9ydHMuRGF0ZVRpbWVUb2tlblR5cGU7XHJcbnZhciBzeW1ib2xNYXBwaW5nID0ge1xyXG4gICAgXCJHXCI6IERhdGVUaW1lVG9rZW5UeXBlLkVSQSxcclxuICAgIFwieVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJZXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcInVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwiVVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJyXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcIlFcIjogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcclxuICAgIFwicVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG4gICAgXCJNXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJMXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJsXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJ3XCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcbiAgICBcIldcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuICAgIFwiZFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcIkRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG4gICAgXCJGXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuICAgIFwiZ1wiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcIkVcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuICAgIFwiZVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG4gICAgXCJjXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcbiAgICBcImFcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG4gICAgXCJoXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcIkhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwia1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJLXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcImpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwiSlwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJtXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1JTlVURSxcclxuICAgIFwic1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcbiAgICBcIlNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG4gICAgXCJBXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuICAgIFwielwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJaXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIk9cIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwidlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJWXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIlhcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwieFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbn07XHJcbi8qKlxyXG4gKiBNYXAgdGhlIGdpdmVuIHN5bWJvbCB0byBvbmUgb2YgdGhlIERhdGVUaW1lVG9rZW5UeXBlc1xyXG4gKiBJZiB0aGVyZSBpcyBubyBtYXBwaW5nLCBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSBpcyB1c2VkXHJcbiAqXHJcbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHNpbmdsZS1jaGFyYWN0ZXIgc3ltYm9sIHVzZWQgdG8gbWFwIHRoZSB0b2tlblxyXG4gKiBAcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlIFRoZSBUeXBlIG9mIHRva2VuIHRoaXMgc3ltYm9sIHJlcHJlc2VudHNcclxuICovXHJcbmZ1bmN0aW9uIG1hcFN5bWJvbFRvVHlwZShzeW1ib2wpIHtcclxuICAgIGlmIChzeW1ib2xNYXBwaW5nLmhhc093blByb3BlcnR5KHN5bWJvbCkpIHtcclxuICAgICAgICByZXR1cm4gc3ltYm9sTWFwcGluZ1tzeW1ib2xdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRva2VuLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbihmdW5jdGlvbiAoVG9UeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXHJcbiAgICAgKi9cclxuICAgIFRvVHlwZVtUb1R5cGVbXCJZZWFyXCJdID0gMF0gPSBcIlllYXJcIjtcclxuICAgIC8qKlxyXG4gICAgICogXCJtYXhcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiTWF4XCJdID0gMV0gPSBcIk1heFwiO1xyXG59KShleHBvcnRzLlRvVHlwZSB8fCAoZXhwb3J0cy5Ub1R5cGUgPSB7fSkpO1xyXG52YXIgVG9UeXBlID0gZXhwb3J0cy5Ub1R5cGU7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKE9uVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEYXktb2YtbW9udGggbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJEYXlOdW1cIl0gPSAwXSA9IFwiRGF5TnVtXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibGFzdFN1blwiIG9yIFwibGFzdFdlZFwiIGV0Y1xyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiTGFzdFhcIl0gPSAxXSA9IFwiTGFzdFhcIjtcclxuICAgIC8qKlxyXG4gICAgICogZS5nLiBcIlN1bj49OFwiXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJHcmVxWFwiXSA9IDJdID0gXCJHcmVxWFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBlLmcuIFwiU3VuPD04XCJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkxlcVhcIl0gPSAzXSA9IFwiTGVxWFwiO1xyXG59KShleHBvcnRzLk9uVHlwZSB8fCAoZXhwb3J0cy5PblR5cGUgPSB7fSkpO1xyXG52YXIgT25UeXBlID0gZXhwb3J0cy5PblR5cGU7XHJcbihmdW5jdGlvbiAoQXRUeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlN0YW5kYXJkXCJdID0gMF0gPSBcIlN0YW5kYXJkXCI7XHJcbiAgICAvKipcclxuICAgICAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIldhbGxcIl0gPSAxXSA9IFwiV2FsbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVdGMgdGltZVxyXG4gICAgICovXHJcbiAgICBBdFR5cGVbQXRUeXBlW1wiVXRjXCJdID0gMl0gPSBcIlV0Y1wiO1xyXG59KShleHBvcnRzLkF0VHlwZSB8fCAoZXhwb3J0cy5BdFR5cGUgPSB7fSkpO1xyXG52YXIgQXRUeXBlID0gZXhwb3J0cy5BdFR5cGU7XHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKi9cclxudmFyIFJ1bGVJbmZvID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJ1bGVJbmZvKFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxyXG4gICAgICAgICAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnJvbSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9UeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b1llYXIsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuICAgICAgICAgKi9cclxuICAgICAgICB0eXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcclxuICAgICAgICAgKi9cclxuICAgICAgICBpbk1vbnRoLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPTiBjb2x1bW4gdHlwZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uVHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkRheSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25XZWVrRGF5LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gaG91clxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0SG91ciwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIG1pbnV0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0TWludXRlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXRTZWNvbmQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFUIGNvbHVtbiB0eXBlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXRUeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcclxuICAgICAgICAgKi9cclxuICAgICAgICBzYXZlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXHJcbiAgICAgICAgICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvVHlwZSA9IHRvVHlwZTtcclxuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuaW5Nb250aCA9IGluTW9udGg7XHJcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XHJcbiAgICAgICAgdGhpcy5vbkRheSA9IG9uRGF5O1xyXG4gICAgICAgIHRoaXMub25XZWVrRGF5ID0gb25XZWVrRGF5O1xyXG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xyXG4gICAgICAgIHRoaXMuYXRNaW51dGUgPSBhdE1pbnV0ZTtcclxuICAgICAgICB0aGlzLmF0U2Vjb25kID0gYXRTZWNvbmQ7XHJcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XHJcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHJ1bGUgaXMgYXBwbGljYWJsZSBpbiB0aGUgeWVhclxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUuYXBwbGljYWJsZSA9IGZ1bmN0aW9uICh5ZWFyKSB7XHJcbiAgICAgICAgaWYgKHllYXIgPCB0aGlzLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLlllYXI6IHJldHVybiAoeWVhciA8PSB0aGlzLnRvWWVhcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU29ydCBjb21wYXJpc29uXHJcbiAgICAgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZUxlc3MgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5mcm9tIDwgb3RoZXIuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA+IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNvcnQgY29tcGFyaXNvblxyXG4gICAgICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgZXF1YWwgdG8gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZUVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggIT09IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pLmVxdWFscyhvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuICAgICAqIGlzIE5PVCBhZGp1c3RlZCBmb3Igd2FsbCBjbG9jayB0aW1lIG9yIHN0YW5kYXJkIHRpbWUsIGkuZS4gdGhpcy5hdFR5cGUgaXNcclxuICAgICAqIG5vdCB0YWtlbiBpbnRvIGFjY291bnRcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZURhdGUgPSBmdW5jdGlvbiAoeWVhcikge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gXCIgKyB5ZWFyLnRvU3RyaW5nKDEwKSk7XHJcbiAgICAgICAgLy8geWVhciBhbmQgbW9udGggYXJlIGdpdmVuXHJcbiAgICAgICAgdmFyIHRtID0geyB5ZWFyOiB5ZWFyLCBtb250aDogdGhpcy5pbk1vbnRoIH07XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGRheVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5vblR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IHRoaXMub25EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGFzdFg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjYWxjdWxhdGUgdGltZVxyXG4gICAgICAgIHRtLmhvdXIgPSB0aGlzLmF0SG91cjtcclxuICAgICAgICB0bS5taW51dGUgPSB0aGlzLmF0TWludXRlO1xyXG4gICAgICAgIHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRtKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zaXRpb24gbW9tZW50IGluIFVUQyBpbiB0aGUgZ2l2ZW4geWVhclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFRoZSBzdGFuZGFyZCBvZmZzZXQgZm9yIHRoZSB0aW1lem9uZSB3aXRob3V0IERTVFxyXG4gICAgICogQHBhcmFtIHByZXZSdWxlXHRUaGUgcHJldmlvdXMgcnVsZVxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUudHJhbnNpdGlvblRpbWVVdGMgPSBmdW5jdGlvbiAoeWVhciwgc3RhbmRhcmRPZmZzZXQsIHByZXZSdWxlKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBub3QgYXBwbGljYWJsZSBpbiBnaXZlbiB5ZWFyXCIpO1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgLy8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuICAgICAgICB2YXIgb2Zmc2V0O1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBBdFR5cGUuVXRjOlxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDpcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldlJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldC5hZGQocHJldlJ1bGUuc2F2ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIEF0VHlwZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuaXhNaWxsaXMgLSBvZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJ1bGVJbmZvO1xyXG59KCkpO1xyXG5leHBvcnRzLlJ1bGVJbmZvID0gUnVsZUluZm87XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJlZmVyZW5jZSBmcm9tIHpvbmUgdG8gcnVsZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBObyBydWxlIGFwcGxpZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xyXG59KShleHBvcnRzLlJ1bGVUeXBlIHx8IChleHBvcnRzLlJ1bGVUeXBlID0ge30pKTtcclxudmFyIFJ1bGVUeXBlID0gZXhwb3J0cy5SdWxlVHlwZTtcclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cclxuICogYmUgYSBzaW5nbGUgcmVjb3JkIHdpdGggemVybyBvciBtb3JlIGNvbnRpbnVhdGlvbiBsaW5lcy4gVGh1cywgdGhlIGtleXdvcmQsIOKAnFpvbmUs4oCdIGFuZCB0aGUgem9uZSBuYW1lIGFyZSBub3QgcmVwZWF0ZWQuXHJcbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cclxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXHJcbiAqIFRoZSBzdGF0ZSBleGlzdHMgZnJvbSB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgcHJldmlvdXMgbGluZeKAmXMgW1VOVElMXSBjb2x1bW4gdXAgdG8gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIGN1cnJlbnQgbGluZeKAmXNcclxuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxyXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXHJcbiAqIFRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIGxhc3QgbGluZSwgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbiwgY29udGludWVzIHRvIHRoZSBwcmVzZW50LlxyXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXHJcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxyXG4gKiAyNCBob3VyczsgdGhpcyBjb3JyZXNwb25kcyB0byBhIG1vdmVtZW50IG9mIHRoZSBEYXRlIExpbmUuIEZvciBleGFtcGxlOlxyXG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXHJcbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XHJcbiAqIFx0XHRcdCAtODo1Nzo0MSAtXHRMTVRcdC4uLlxyXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxyXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXHJcbiAqIHJlbGlnaW91cyByZWFzb25zLCB3YXMgZm9sbG93ZWQgYnkgYSBzZWNvbmQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgZGF5IHdpdGggYSBkaWZmZXJlbnQgbmFtZSwgMTggT2N0b2JlciBpbiB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxyXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cclxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XHJcbiAqIHVzZWQgZHVyaW5nIHRoZSBwZXJpb2QuIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWUgaXMgYWxtb3N0IGNlcnRhaW5seSB3cm9uZyBleGNlcHQgaW4gdGhlIGFyY2hldHlwYWwgcGxhY2UgYWZ0ZXIgd2hpY2ggdGhlIHpvbmUgaXMgbmFtZWQuXHJcbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcclxuICovXHJcbnZhciBab25lSW5mbyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBab25lSW5mbyhcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXHJcbiAgICAgICAgICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXHJcbiAgICAgICAgICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ210b2ZmLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XHJcbiAgICAgICAgICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcbiAgICAgICAgICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cclxuICAgICAgICAgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcclxuICAgICAgICAgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcnVsZVR5cGUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVPZmZzZXQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcnVsZU5hbWUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XHJcbiAgICAgICAgICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcbiAgICAgICAgICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxyXG4gICAgICAgICAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAgICAgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuICAgICAgICAgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9ybWF0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXHJcbiAgICAgICAgICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuICAgICAgICAgKiBOb3RlIHRoaXMgdmFsdWUgY2FuIGJlIE5VTEwgKGZvciB0aGUgZmlyc3QgcnVsZSlcclxuICAgICAgICAgKi9cclxuICAgICAgICB1bnRpbCkge1xyXG4gICAgICAgIHRoaXMuZ210b2ZmID0gZ210b2ZmO1xyXG4gICAgICAgIHRoaXMucnVsZVR5cGUgPSBydWxlVHlwZTtcclxuICAgICAgICB0aGlzLnJ1bGVPZmZzZXQgPSBydWxlT2Zmc2V0O1xyXG4gICAgICAgIHRoaXMucnVsZU5hbWUgPSBydWxlTmFtZTtcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcclxuICAgICAgICB0aGlzLnVudGlsID0gdW50aWw7XHJcbiAgICAgICAgaWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG4gICAgICAgICAgICB0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFpvbmVJbmZvO1xyXG59KCkpO1xyXG5leHBvcnRzLlpvbmVJbmZvID0gWm9uZUluZm87XHJcbnZhciBUek1vbnRoTmFtZXM7XHJcbihmdW5jdGlvbiAoVHpNb250aE5hbWVzKSB7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSmFuXCJdID0gMV0gPSBcIkphblwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkZlYlwiXSA9IDJdID0gXCJGZWJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXJcIl0gPSAzXSA9IFwiTWFyXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiQXByXCJdID0gNF0gPSBcIkFwclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk1heVwiXSA9IDVdID0gXCJNYXlcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJKdW5cIl0gPSA2XSA9IFwiSnVuXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVsXCJdID0gN10gPSBcIkp1bFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkF1Z1wiXSA9IDhdID0gXCJBdWdcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJTZXBcIl0gPSA5XSA9IFwiU2VwXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiT2N0XCJdID0gMTBdID0gXCJPY3RcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJOb3ZcIl0gPSAxMV0gPSBcIk5vdlwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkRlY1wiXSA9IDEyXSA9IFwiRGVjXCI7XHJcbn0pKFR6TW9udGhOYW1lcyB8fCAoVHpNb250aE5hbWVzID0ge30pKTtcclxuZnVuY3Rpb24gbW9udGhOYW1lVG9TdHJpbmcobmFtZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMTI7ICsraSkge1xyXG4gICAgICAgIGlmIChUek1vbnRoTmFtZXNbaV0gPT09IG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgaWYgKHRydWUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuICAgIH1cclxufVxyXG52YXIgVHpEYXlOYW1lcztcclxuKGZ1bmN0aW9uIChUekRheU5hbWVzKSB7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTdW5cIl0gPSAwXSA9IFwiU3VuXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJNb25cIl0gPSAxXSA9IFwiTW9uXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUdWVcIl0gPSAyXSA9IFwiVHVlXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJXZWRcIl0gPSAzXSA9IFwiV2VkXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUaHVcIl0gPSA0XSA9IFwiVGh1XCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJGcmlcIl0gPSA1XSA9IFwiRnJpXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTYXRcIl0gPSA2XSA9IFwiU2F0XCI7XHJcbn0pKFR6RGF5TmFtZXMgfHwgKFR6RGF5TmFtZXMgPSB7fSkpO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcocykge1xyXG4gICAgcmV0dXJuIC9eKFxcLXxcXCspPyhbMC05XSsoKFxcOlswLTldKyk/KFxcOlswLTldKyhcXC5bMC05XSspPyk/KSkkLy50ZXN0KHMpO1xyXG59XHJcbmV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGlzVmFsaWRPZmZzZXRTdHJpbmc7XHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcclxuICovXHJcbnZhciBUcmFuc2l0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRyYW5zaXRpb24oXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJhbnNpdGlvbiB0aW1lIGluIFVUQyBtaWxsaXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb2Zmc2V0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBOZXcgdGltem9uZSBhYmJyZXZpYXRpb24gbGV0dGVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5hdCA9IGF0O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMubGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIGlmICh0aGlzLm9mZnNldCkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBUcmFuc2l0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLlRyYW5zaXRpb24gPSBUcmFuc2l0aW9uO1xyXG4vKipcclxuICogT3B0aW9uIGZvciBUekRhdGFiYXNlI25vcm1hbGl6ZUxvY2FsKClcclxuICovXHJcbihmdW5jdGlvbiAoTm9ybWFsaXplT3B0aW9uKSB7XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJVcFwiXSA9IDBdID0gXCJVcFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxufSkoZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gfHwgKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uID0ge30pKTtcclxudmFyIE5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uO1xyXG4vKipcclxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxyXG4gKiBZb3UgdXN1YWxseSBkbyBub3QgbmVlZCB0byB1c2UgdGhpcyBkaXJlY3RseSwgdXNlIFRpbWVab25lIGFuZCBEYXRlVGltZSBpbnN0ZWFkLlxyXG4gKi9cclxudmFyIFR6RGF0YWJhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciAtIGRvIG5vdCB1c2UsIHRoaXMgaXMgYSBzaW5nbGV0b24gY2xhc3MuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKCkgaW5zdGVhZFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUekRhdGFiYXNlKGRhdGEpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl96b25lSW5mb0NhY2hlID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3J1bGVJbmZvQ2FjaGUgPSB7fTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChkYXRhLmxlbmd0aCA+IDAsIFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIik7XHJcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZC5ydWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBPYmplY3Qua2V5cyhkLnpvbmVzKTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jW19iXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXHJcbiAgICAgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLmluc3RhbmNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5pbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIVR6RGF0YWJhc2UuX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhXzEgPSBbXTtcclxuICAgICAgICAgICAgLy8gdHJ5IHRvIGZpbmQgVFogZGF0YSBpbiBnbG9iYWwgdmFyaWFibGVzXHJcbiAgICAgICAgICAgIHZhciBnID0gKGdsb2JhbCA/IGdsb2JhbCA6IHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGlmIChnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCJ0emRhdGFcIikgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZ1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG4gICAgICAgICAgICB2YXIgZmluZE5vZGVNb2R1bGVzID0gZnVuY3Rpb24gKHJlcXVpcmUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHRyeSBzdWJzZXRzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZHVsZU5hbWVzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hZnJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYW50YXJjdGljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldGNldGVyYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldXJvcGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXBhY2lmaWNuZXdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXN5c3RlbXZcIlxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nUGF0aHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUobW9kdWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhXzEucHVzaChkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChkYXRhXzEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoZGF0YV8xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFR6RGF0YWJhc2UuX2luc3RhbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG4gICAgICAgICAgICB0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5leGlzdHMgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNaW5pbXVtIG5vbi16ZXJvIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuICAgICAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cclxuICAgICAqXHJcbiAgICAgKiBEb2VzIHJldHVybiB6ZXJvIGlmIGEgem9uZU5hbWUgaXMgZ2l2ZW4gYW5kIHRoZXJlIGlzIG5vIERTVCBhdCBhbGwgZm9yIHRoZSB6b25lLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWluRHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVPZmZzZXQubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5tYXhEc3RTYXZlID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgaWYgKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgcnVsZU5hbWVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSB0ZW1wW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuaGFzRHN0ID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5uZXh0RHN0Q2hhbmdlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhKSB7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvO1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuICAgICAgICAvLyBnZXQgYWxsIHpvbmUgaW5mb3MgZm9yIFtkYXRlLCBkYXRlKzF5ZWFyKVxyXG4gICAgICAgIHZhciBhbGxab25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgdmFyIHJlbGV2YW50Wm9uZUluZm9zID0gW107XHJcbiAgICAgICAgdmFyIHJhbmdlU3RhcnQgPSB1dGNUaW1lLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgdmFyIHJhbmdlRW5kID0gcmFuZ2VTdGFydCArIDM2NSAqIDg2NDAwRTM7XHJcbiAgICAgICAgdmFyIHByZXZFbmQgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsWm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHpvbmVJbmZvID0gYWxsWm9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICBpZiAoKHByZXZFbmQgPT09IG51bGwgfHwgcHJldkVuZCA8IHJhbmdlRW5kKSAmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmVsZXZhbnRab25lSW5mb3MucHVzaCh6b25lSW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldkVuZCA9IHpvbmVJbmZvLnVudGlsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWxldmFudFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB6b25lSW5mbyA9IHJlbGV2YW50Wm9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyICsgMSwgem9uZUluZm8uZ210b2ZmKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyYW5zaXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxyXG4gICAgICAgIHZhciBwcmV2U2F2ZSA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCA+IHV0Y1RpbWUudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZTYXZlID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cclxuICAgICAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxyXG4gICAgICogXCJVVENcIiwgXCJHTVRcIiwgXCJFdGMvR01UXCIgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuem9uZUlzVXRjID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG4gICAgfTtcclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5vcm1hbGl6ZUxvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhLCBvcHQpIHtcclxuICAgICAgICBpZiAob3B0ID09PSB2b2lkIDApIHsgb3B0ID0gTm9ybWFsaXplT3B0aW9uLlVwOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuICAgICAgICAgICAgLy8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICAvLyBnZXQgYWxsIHRyYW5zaXRpb25zIChub3RlIHRoaXMgaW5jbHVkZXMgZmFrZSB0cmFuc2l0aW9uIHJ1bGVzIGZvciB6b25lIG9mZnNldCBjaGFuZ2VzKVxyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDEpO1xyXG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xyXG4gICAgICAgICAgICB2YXIgcHJldiA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICAvLyBmb3J3YXJkIHRyYW5zaXRpb24/XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYWxCZWZvcmUgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYWxBZnRlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxUaW1lLnVuaXhNaWxsaXMgPj0gbG9jYWxCZWZvcmUgJiYgbG9jYWxUaW1lLnVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub24tZXhpc3RpbmcgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFjdG9yID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG4gICAgICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB6b25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG4gICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcbiAgICAgKiB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICB2YXIgZHN0T2Zmc2V0ID0gbnVsbDtcclxuICAgICAgICBzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XHJcbiAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB0aGlzLmRzdE9mZnNldEZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuICAgICAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XHJcbiAgICAgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmFiYnJldmlhdGlvbiA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICB2YXIgZm9ybWF0ID0gem9uZUluZm8uZm9ybWF0O1xyXG4gICAgICAgIC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG4gICAgICAgIGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxyXG4gICAgICAgICAgICAmJiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGxldHRlciA9IHZvaWQgMDtcclxuICAgICAgICAgICAgLy8gcGxhY2UgaW4gZm9ybWF0IHN0cmluZ1xyXG4gICAgICAgICAgICBpZiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0aGlzLmxldHRlckZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3JtYXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBleGNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuICAgICAqXHJcbiAgICAgKiBJZiB0aGUgbG9jYWwgdGltZXN0YW1wIGV4aXN0cyB0d2ljZSAoYXMgY2FuIG9jY3VyIHZlcnkgcmFyZWx5IGR1ZSB0byB6b25lIGNoYW5nZXMpXHJcbiAgICAgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG4gICAgICpcclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0TG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGxvY2FsVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBsb2NhbFRpbWUgOiBsb2NhbFRpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCArIHpvbmVJbmZvLmdtdG9mZi5taWxsaXNlY29uZHMoKSA+IHVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXHJcbiAgICAgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcbiAgICAgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0TG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGxvY2FsVGltZSkge1xyXG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XHJcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRUbSA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcclxuICAgICAgICAvLy8gTm90ZTogZHVyaW5nIG9mZnNldCBjaGFuZ2VzLCBsb2NhbCB0aW1lIGNhbiBiZWhhdmUgbGlrZTpcclxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG4gICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcbiAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxyXG4gICAgICAgIC8vIFRoZXJlZm9yZSBiaW5hcnkgc2VhcmNoIGRvZXMgbm90IGFwcGx5LiBMaW5lYXIgc2VhcmNoIHRocm91Z2ggdHJhbnNpdGlvbnNcclxuICAgICAgICAvLyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBvZmZzZXQgdGhhdCBtYXRjaGVzXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxKTtcclxuICAgICAgICB2YXIgcHJldiA9IG51bGw7XHJcbiAgICAgICAgdmFyIHByZXZQcmV2ID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgPiBub3JtYWxpemVkVG0udW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgLy8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2UHJldiA9IHByZXY7XHJcbiAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG4gICAgICAgIGlmIChwcmV2KSB7XHJcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FyZSBkdXJpbmcgYmFja3dhcmQgY2hhbmdlOiB0YWtlIGZpcnN0IG9jY3VycmVuY2Ugb2YgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICBpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICYmIG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldlByZXYub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aGlzIGNhbm5vdCBoYXBwZW4gYXMgdGhlIHRyYW5zaXRpb25zIGFycmF5IGlzIGd1YXJhbnRlZWQgdG8gY29udGFpbiBhIHRyYW5zaXRpb24gYXQgdGhlXHJcbiAgICAgICAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXHJcbiAgICAgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcFxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZHN0T2Zmc2V0Rm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIG9mZnNldCA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIW9mZnNldCkge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgb2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXHJcbiAgICAgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5sZXR0ZXJGb3JSdWxlID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCB1dGNUaW1lLCBzdGFuZGFyZE9mZnNldCkge1xyXG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcbiAgICAgICAgLy8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0KTtcclxuICAgICAgICAvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuICAgICAgICB2YXIgbGV0dGVyID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIWxldHRlcikge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxldHRlcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGxpc3Qgb2YgYWxsIHRyYW5zaXRpb25zIGluIFtmcm9tWWVhci4udG9ZZWFyXSBzb3J0ZWQgYnkgZWZmZWN0aXZlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMgPSBmdW5jdGlvbiAocnVsZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcbiAgICAgICAgdmFyIHJ1bGVJbmZvcyA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2SW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZUluZm9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBydWxlSW5mb3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHksIHN0YW5kYXJkT2Zmc2V0LCBwcmV2SW5mbyksIHJ1bGVJbmZvLnNhdmUsIHJ1bGVJbmZvLmxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJldkluZm8gPSBydWxlSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxyXG4gICAgICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuICAgICAgICB2YXIgc3RhcnRNaWxsaXMgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiBmcm9tWWVhciB9KTtcclxuICAgICAgICB2YXIgZW5kTWlsbGlzID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwiRW1wdHkgem9uZUluZm9zIGFycmF5IHJldHVybmVkIGZyb20gZ2V0Wm9uZUluZm9zKClcIik7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBwcmV2Wm9uZSA9IG51bGw7XHJcbiAgICAgICAgdmFyIHByZXZVbnRpbFllYXI7XHJcbiAgICAgICAgdmFyIHByZXZTdGRPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgIHZhciBwcmV2RHN0T2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB2YXIgcHJldkxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICB2YXIgdW50aWxZZWFyID0gem9uZUluZm8udW50aWwgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkuY29tcG9uZW50cy55ZWFyIDogdG9ZZWFyICsgMTtcclxuICAgICAgICAgICAgdmFyIHN0ZE9mZnNldCA9IHByZXZTdGRPZmZzZXQ7XHJcbiAgICAgICAgICAgIHZhciBkc3RPZmZzZXQgPSBwcmV2RHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICB2YXIgbGV0dGVyID0gcHJldkxldHRlcjtcclxuICAgICAgICAgICAgLy8gem9uZSBhcHBsaWNhYmxlP1xyXG4gICAgICAgICAgICBpZiAoKHByZXZab25lID09PSBudWxsIHx8IHByZXZab25lLnVudGlsIDwgZW5kTWlsbGlzIC0gMSlcclxuICAgICAgICAgICAgICAgICYmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+PSBzdGFydE1pbGxpcykpIHtcclxuICAgICAgICAgICAgICAgIHN0ZE9mZnNldCA9IHpvbmVJbmZvLmdtdG9mZjtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBmaXJzdCBydWxlIHRha2VzIGVmZmVjdCBpbW1lZGlhdGVseSBvbiB0aGUgem9uZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIChlLmcuIEx5YmlhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mb3MgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGVJbmZvcy5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc1tqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxZZWFyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMocHJldlVudGlsWWVhciwgc3RkT2Zmc2V0LCBudWxsKSA9PT0gcHJldlpvbmUudW50aWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSB0cmFuc2l0aW9uIGZvciB0aGUgem9uZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgYXQgPSAocHJldlpvbmUgPyBwcmV2Wm9uZS51bnRpbCA6IHN0YXJ0TWlsbGlzKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgLy8gYWRkIHRyYW5zaXRpb25zIGZvciB0aGUgem9uZSBydWxlcyBpbiB0aGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHN0VHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgcHJldlVudGlsWWVhciAhPT0gdW5kZWZpbmVkID8gTWF0aC5tYXgocHJldlVudGlsWWVhciwgZnJvbVllYXIpIDogZnJvbVllYXIsIE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSwgc3RkT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGRzdFRyYW5zaXRpb25zLmxlbmd0aDsgKytrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gZHN0VHJhbnNpdGlvbnNba107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2Wm9uZSA9IHpvbmVJbmZvO1xyXG4gICAgICAgICAgICBwcmV2VW50aWxZZWFyID0gdW50aWxZZWFyO1xyXG4gICAgICAgICAgICBwcmV2U3RkT2Zmc2V0ID0gc3RkT2Zmc2V0O1xyXG4gICAgICAgICAgICBwcmV2RHN0T2Zmc2V0ID0gZHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICBwcmV2TGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxyXG4gICAgICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyB1dGNUaW1lIDogdXRjVGltZS51bml4TWlsbGlzKTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgem9uZSByZWNvcmRzIGZvciBhIGdpdmVuIHpvbmUgbmFtZSwgYWZ0ZXJcclxuICAgICAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZSBsaWtlIFwiUGFjaWZpYy9FZmF0ZVwiXHJcbiAgICAgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvcyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUYWtlIGZyb20gY2FjaGVcclxuICAgICAgICBpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmFsIHpvbmUgaW5mbyBmb3VuZFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUVudHJpZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuICAgICAgICAgICAgdmFyIHVudGlsID0gbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbM10pO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odW50aWwpKSB7XHJcbiAgICAgICAgICAgICAgICB1bnRpbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFpvbmVJbmZvKGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygtMSAqIG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzBdKSksIHJ1bGVUeXBlLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0ID8gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oem9uZUVudHJ5WzFdKSA6IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKCksIHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsIHpvbmVFbnRyeVsyXSwgdW50aWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgLy8gc29ydCBudWxsIGxhc3RcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhLnVudGlsICE9PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gbnVsbCAmJiBiLnVudGlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKGEudW50aWwgLSBiLnVudGlsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXSA9IHJlc3VsdDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcnVsZSBzZXQgd2l0aCB0aGUgZ2l2ZW4gcnVsZSBuYW1lLFxyXG4gICAgICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHJ1bGUgc2V0XHJcbiAgICAgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcclxuICAgICAgICAvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuICAgICAgICBpZiAoIXRoaXMuX2RhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJldHVybiBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlU2V0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlID0gcnVsZVNldFtpXTtcclxuICAgICAgICAgICAgdmFyIGZyb21ZZWFyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xyXG4gICAgICAgICAgICB2YXIgdG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuICAgICAgICAgICAgdmFyIHRvWWVhciA9ICh0b1R5cGUgPT09IFRvVHlwZS5NYXggPyAwIDogKHJ1bGVbMV0gPT09IFwib25seVwiID8gZnJvbVllYXIgOiBwYXJzZUludChydWxlWzFdLCAxMCkpKTtcclxuICAgICAgICAgICAgdmFyIG9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XHJcbiAgICAgICAgICAgIHZhciBvbkRheSA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG4gICAgICAgICAgICB2YXIgb25XZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcclxuICAgICAgICAgICAgdmFyIG1vbnRoTmFtZSA9IHJ1bGVbM107XHJcbiAgICAgICAgICAgIHZhciBtb250aE51bWJlciA9IG1vbnRoTmFtZVRvU3RyaW5nKG1vbnRoTmFtZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhmcm9tWWVhciwgdG9UeXBlLCB0b1llYXIsIHJ1bGVbMl0sIG1vbnRoTnVtYmVyLCBvblR5cGUsIG9uRGF5LCBvbldlZWtEYXksIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxyXG4gICAgICAgICAgICBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLCB0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLCBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSwgcnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxyXG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlUnVsZVR5cGUgPSBmdW5jdGlvbiAocnVsZSkge1xyXG4gICAgICAgIGlmIChydWxlID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuTm9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuT2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xyXG4gICAgICAgIGlmICh0byA9PT0gXCJtYXhcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLk1heDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodG8gPT09IFwib25seVwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFpc05hTihwYXJzZUludCh0bywgMTApKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLlllYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6IFwiICsgdG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25UeXBlID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgaWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxhc3RYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPblR5cGUuR3JlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25EYXkgPSBmdW5jdGlvbiAob24sIG9uVHlwZSkge1xyXG4gICAgICAgIHN3aXRjaCAob25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VPbldlZWtEYXkgPSBmdW5jdGlvbiAob24pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2ljc18xLldlZWtEYXkuU3VuZGF5O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZUF0VHlwZSA9IGZ1bmN0aW9uIChhdCkge1xyXG4gICAgICAgIHN3aXRjaCAoYXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNcIjogcmV0dXJuIEF0VHlwZS5TdGFuZGFyZDtcclxuICAgICAgICAgICAgY2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwielwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBudWxsOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW5nbGUgaW5zdGFuY2UgbWVtYmVyXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbnVsbDtcclxuICAgIHJldHVybiBUekRhdGFiYXNlO1xyXG59KCkpO1xyXG5leHBvcnRzLlR6RGF0YWJhc2UgPSBUekRhdGFiYXNlO1xyXG4vKipcclxuICogU2FuaXR5IGNoZWNrIG9uIGRhdGEuIFJldHVybnMgbWluL21heCB2YWx1ZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YSkge1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICBtaW5Ec3RTYXZlOiBudWxsLFxyXG4gICAgICAgIG1heERzdFNhdmU6IG51bGwsXHJcbiAgICAgICAgbWluR210T2ZmOiBudWxsLFxyXG4gICAgICAgIG1heEdtdE9mZjogbnVsbFxyXG4gICAgfTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgaWYgKHR5cGVvZiAoZGF0YSkgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcbiAgICB9XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gcnVsZXMgcHJvcGVydHlcIik7XHJcbiAgICB9XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gem9uZXMgcHJvcGVydHlcIik7XHJcbiAgICB9XHJcbiAgICAvLyB2YWxpZGF0ZSB6b25lc1xyXG4gICAgZm9yICh2YXIgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xyXG4gICAgICAgIGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUFyciA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgLy8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFycikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyB6b25lQXJyICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5Lmxlbmd0aCAhPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaGFzIGxlbmd0aCAhPSA0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzBdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4R210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IG51bGwgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHZhbGlkYXRlIHJ1bGVzXHJcbiAgICBmb3IgKHZhciBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XHJcbiAgICAgICAgaWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlQXJyID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZUFycltpXTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqICE9PSA1ICYmIHR5cGVvZiBydWxlW2pdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlWzVdWzNdICE9PSBcImdcIiAmJiBydWxlWzVdWzNdICE9PSBcInVcIiAmJiBydWxlWzVdWzNdICE9PSBcInpcIiAmJiBydWxlWzVdWzNdICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBzYXZlID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gbnVsbCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5taW5Ec3RTYXZlID0gc2F2ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR6LWRhdGFiYXNlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuX19leHBvcnQocmVxdWlyZShcIi4vYmFzaWNzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vZGF0ZXRpbWVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9kdXJhdGlvblwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2Zvcm1hdFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2dsb2JhbHNcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vcGFyc2VcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9wZXJpb2RcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9iYXNpY3NcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi90aW1lc291cmNlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vdGltZXpvbmVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdfQ==
