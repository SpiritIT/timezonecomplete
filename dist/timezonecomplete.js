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
var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
    WeekDay[WeekDay["Monday"] = 1] = "Monday";
    WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
    WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
    WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
    WeekDay[WeekDay["Friday"] = 5] = "Friday";
    WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay = exports.WeekDay || (exports.WeekDay = {}));
/**
 * Time units
 */
var TimeUnit;
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
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
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
                            this._zone = (ss[1].trim() ? timezone_1.TimeZone.zone(ss[1]) : null);
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
        if (this._zone) {
            return this._zone.abbreviationForUtc(this.utcDate, dstDependent);
        }
        else {
            return "";
        }
    };
    /**
     * @return the offset including DST w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
     */
    DateTime.prototype.offset = function () {
        return Math.round((this.zoneDate.unixMillis - this.utcDate.unixMillis) / 60000);
    };
    /**
     * @return the offset including DST w.r.t. UTC as a Duration.
     */
    DateTime.prototype.offsetDuration = function () {
        return duration_1.Duration.milliseconds(Math.round(this.zoneDate.unixMillis - this.utcDate.unixMillis));
    };
    /**
     * @return the standard offset WITHOUT DST w.r.t. UTC as a Duration.
     */
    DateTime.prototype.standardOffsetDuration = function () {
        if (this._zone) {
            return duration_1.Duration.minutes(this._zone.standardOffsetForUtc(this.utcDate));
        }
        return duration_1.Duration.minutes(0);
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
            if (!this._zone) {
                assert_1.default(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            }
            else if (this._zone.equals(zone)) {
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
                return this;
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
        if (timeZone && (!this._zone || !timeZone.equals(this._zone))) {
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
        return !!(this.zoneDate.equals(other.zoneDate)
            && (!this._zone) === (!other._zone)
            && ((!this._zone && !other._zone) || (this._zone && other._zone && this._zone.identical(other._zone))));
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
        return format.format(this.zoneDate, this.utcDate, this._zone, formatString, formatOptions);
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
        var index = trimmed.lastIndexOf("without DST");
        if (index > -1) {
            var result_1 = DateTime._splitDateFromTimeZone(s.slice(0, index - 1));
            result_1[1] += " without DST";
            return result_1;
        }
        index = trimmed.lastIndexOf(" ");
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
    return DateTime;
}());
/**
 * Actual time source in use. Setting this property allows to
 * fake time in tests. DateTime.nowLocal() and DateTime.nowUtc()
 * use this property for obtaining the current time.
 */
DateTime.timeSource = new timesource_1.RealTimeSource();
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
        if (this._unit === other._unit) {
            return (this._amount === other._amount);
        }
        else if (this._unit >= basics_1.TimeUnit.Month && other.unit() >= basics_1.TimeUnit.Month) {
            return this.equals(other); // can compare months and years
        }
        else if (this._unit < basics_1.TimeUnit.Day && other.unit() < basics_1.TimeUnit.Day) {
            return this.equals(other); // can compare milliseconds through hours
        }
        else {
            return false; // cannot compare days to anything else
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
     * Multiply with a fixed number.
     * Approximate if the durations have units that cannot be converted
     * @return a new Duration of (this * value)
     */
    Duration.prototype.multiply = function (value) {
        return new Duration(this._amount * value, this._unit);
    };
    Duration.prototype.divide = function (value) {
        if (typeof value === "number") {
            if (value === 0) {
                throw new Error("Duration.divide(): Divide by zero");
            }
            return new Duration(this._amount / value, this._unit);
        }
        else {
            if (value._amount === 0) {
                throw new Error("Duration.divide(): Divide by zero duration");
            }
            return this.milliseconds() / value.milliseconds();
        }
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
            default:
                return Math.floor(Math.abs(this.as(basics_1.TimeUnit.Year)));
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
    var mergedFormatOptions = {};
    for (var name_1 in exports.DEFAULT_FORMAT_OPTIONS) {
        if (exports.DEFAULT_FORMAT_OPTIONS.hasOwnProperty(name_1)) {
            mergedFormatOptions[name_1] = (formatOptions[name_1] !== undefined ? formatOptions[name_1] : exports.DEFAULT_FORMAT_OPTIONS[name_1]);
        }
    }
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
                tokenResult = _formatQuarter(dateTime, token, mergedFormatOptions);
                break;
            case token_1.DateTimeTokenType.MONTH:
                tokenResult = _formatMonth(dateTime, token, mergedFormatOptions);
                break;
            case token_1.DateTimeTokenType.DAY:
                tokenResult = _formatDay(dateTime, token);
                break;
            case token_1.DateTimeTokenType.WEEKDAY:
                tokenResult = _formatWeekday(dateTime, token, mergedFormatOptions);
                break;
            case token_1.DateTimeTokenType.DAYPERIOD:
                tokenResult = _formatDayPeriod(dateTime);
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
            }
            else {
                return formatOptions.shortWeekdayNames[weekDayNumber];
            }
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
function _formatDayPeriod(dateTime) {
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
        case "x":
            if (token.symbol === "X" && offset === 0) {
                return "Z";
            }
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
var DateFunctions;
(function (DateFunctions) {
    /**
     * Use the Date.getFullYear(), Date.getMonth(), ... functions.
     */
    DateFunctions[DateFunctions["Get"] = 0] = "Get";
    /**
     * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
     */
    DateFunctions[DateFunctions["GetUTC"] = 1] = "GetUTC";
})(DateFunctions = exports.DateFunctions || (exports.DateFunctions = {}));
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
    if (n === null || !isFinite(n)) {
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
        parse(dateTimeString, formatString, undefined, allowTrailing);
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
        var zone = null;
        var pnr = void 0;
        var pzr = void 0;
        var remaining = dateTimeString;
        for (var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
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
        var result = { time: new basics_1.TimeStruct(time), zone: (zone ? zone : null) };
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
var PeriodDst;
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
})(PeriodDst = exports.PeriodDst || (exports.PeriodDst = {}));
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
        // note we take the non-normalized _reference because this has an influence on the outcome
        if (!this.isBoundary(other._reference) || !this._intInterval.equals(other._intInterval)) {
            return false;
        }
        var refZone = this._reference.zone();
        var otherZone = other._reference.zone();
        var thisIsRegular = (this._intDst === PeriodDst.RegularIntervals || !refZone || refZone.isUtc());
        var otherIsRegular = (other._intDst === PeriodDst.RegularIntervals || !otherZone || otherZone.isUtc());
        if (thisIsRegular && otherIsRegular) {
            return true;
        }
        if (this._intDst === other._intDst && refZone && otherZone && refZone.equals(otherZone)) {
            return true;
        }
        return false;
    };
    /**
     * Returns true iff this period was constructed with identical arguments to the other one.
     */
    Period.prototype.identical = function (other) {
        return (this._reference.identical(other._reference)
            && this._interval.identical(other._interval)
            && this._dst === other._dst);
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
        var zone = this._reference.zone();
        return !!(zone
            && zone.kind() === timezone_1.TimeZoneKind.Proper
            && zone.hasDst());
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
var TimeZoneKind;
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
})(TimeZoneKind = exports.TimeZoneKind || (exports.TimeZoneKind = {}));
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
                    if (s.indexOf("without DST") >= 0) {
                        dst = false;
                        s = s.slice(0, s.indexOf("without DST") - 1);
                    }
                    name = TimeZone._normalizeString(s);
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
    TimeZone.prototype.standardOffsetForUtc = function (a, month, day, hour, minute, second, milli) {
        var utcTime = (a && a instanceof basics_1.TimeStruct ? a : new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }));
        switch (this._kind) {
            case TimeZoneKind.Local: {
                var date = new Date(Date.UTC(utcTime.components.year, 0, 1, 0));
                return -1 * date.getTimezoneOffset();
            }
            case TimeZoneKind.Offset: {
                return this._offset;
            }
            case TimeZoneKind.Proper: {
                return tz_database_1.TzDatabase.instance().standardOffset(this._name, utcTime).minutes();
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
    return TimeZone;
}());
/**
 * Time zone cache.
 */
TimeZone._cache = {};
exports.TimeZone = TimeZone;
},{"./assert":1,"./basics":2,"./strings":11,"./tz-database":15}],14:[function(require,module,exports){
/**
 * Functionality to parse a DateTime object to a string
 */
"use strict";
var Tokenizer = (function () {
    /**
     * Create a new tokenizer
     * @param formatString (optional) Set the format string
     */
    function Tokenizer(formatString) {
        this._formatString = formatString;
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
        if (!this._formatString) {
            return [];
        }
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
var DateTimeTokenType;
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
})(DateTimeTokenType = exports.DateTimeTokenType || (exports.DateTimeTokenType = {}));
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
var ToType;
(function (ToType) {
    /**
     * Either a year number or "only"
     */
    ToType[ToType["Year"] = 0] = "Year";
    /**
     * "max"
     */
    ToType[ToType["Max"] = 1] = "Max";
})(ToType = exports.ToType || (exports.ToType = {}));
/**
 * Type of rule ON column value
 */
var OnType;
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
})(OnType = exports.OnType || (exports.OnType = {}));
var AtType;
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
})(AtType = exports.AtType || (exports.AtType = {}));
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
var RuleType;
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
})(RuleType = exports.RuleType || (exports.RuleType = {}));
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
         * Note this value can be undefined (for the first rule)
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
var NormalizeOption;
(function (NormalizeOption) {
    /**
     * Normalize non-existing times by ADDING the DST offset
     */
    NormalizeOption[NormalizeOption["Up"] = 0] = "Up";
    /**
     * Normalize non-existing times by SUBTRACTING the DST offset
     */
    NormalizeOption[NormalizeOption["Down"] = 1] = "Down";
})(NormalizeOption = exports.NormalizeOption || (exports.NormalizeOption = {}));
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
            TzDatabase._instance = undefined; // needed for assert in constructor
            TzDatabase._instance = new TzDatabase(Array.isArray(data) ? data : [data]);
        }
        else {
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
    };
    /**
     * Single instance of this database
     */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            TzDatabase.init();
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
            var result = void 0;
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
            var result = void 0;
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
        var prevEnd;
        for (var i = 0; i < allZoneInfos.length; ++i) {
            zoneInfo = allZoneInfos[i];
            if ((prevEnd === undefined || prevEnd < rangeEnd) && (zoneInfo.until === undefined || zoneInfo.until > rangeStart)) {
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
        var prevSave;
        for (var i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (!prevSave || !prevSave.equals(transition.offset)) {
                if (transition.at > utcTime.unixMillis) {
                    return transition.at;
                }
            }
            prevSave = transition.offset;
        }
        return undefined;
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
        var dstOffset;
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
            case RuleType.RuleName:
                {
                    dstOffset = this.dstOffsetForRule(zoneInfo.ruleName, utcTime, zoneInfo.gmtoff);
                }
                break;
            default:
                dstOffset = duration_1.Duration.minutes(0);
                break;
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
            if (zoneInfo.until === undefined || zoneInfo.until + zoneInfo.gmtoff.milliseconds() > unixMillis) {
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
        var prev;
        var prevPrev;
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
        var offset;
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
        var letter;
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
            var prevInfo = void 0;
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
        var prevZone;
        var prevUntilYear;
        var prevStdOffset = duration_1.Duration.hours(0);
        var prevDstOffset = duration_1.Duration.hours(0);
        var prevLetter = "";
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            var untilYear = zoneInfo.until !== undefined ? new basics_1.TimeStruct(zoneInfo.until).components.year : toYear + 1;
            var stdOffset = prevStdOffset;
            var dstOffset = prevDstOffset;
            var letter = prevLetter;
            // zone applicable?
            if ((!prevZone || prevZone.until < endMillis - 1) && (zoneInfo.until === undefined || zoneInfo.until >= startMillis)) {
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
                                if (typeof prevUntilYear === "number" && ruleInfo.applicable(prevUntilYear)) {
                                    if (ruleInfo.transitionTimeUtc(prevUntilYear, stdOffset, undefined) === prevZone.until) {
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
                var at = (prevZone && prevZone.until !== undefined ? prevZone.until : startMillis);
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
            if (zoneInfo.until === undefined || zoneInfo.until > unixMillis) {
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
                until = undefined;
            }
            result.push(new ZoneInfo(duration_1.Duration.minutes(-1 * math.filterFloat(zoneEntry[0])), ruleType, ruleType === RuleType.Offset ? new duration_1.Duration(zoneEntry[1]) : new duration_1.Duration(), ruleType === RuleType.RuleName ? zoneEntry[1] : "", zoneEntry[2], until));
        }
        result.sort(function (a, b) {
            // sort undefined last
            /* istanbul ignore if */
            if (a.until === undefined && b.until === undefined) {
                return 0;
            }
            if (a.until !== undefined && b.until === undefined) {
                return -1;
            }
            if (a.until === undefined && b.until !== undefined) {
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
    return TzDatabase;
}());
exports.TzDatabase = TzDatabase;
/**
 * Sanity check on data. Returns min/max values.
 */
function validateData(data) {
    var result = {};
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
                    if (result.maxGmtOff === undefined || gmtoff > result.maxGmtOff) {
                        result.maxGmtOff = gmtoff;
                    }
                    if (result.minGmtOff === undefined || gmtoff < result.minGmtOff) {
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
                    if (result.maxDstSave === undefined || save > result.maxDstSave) {
                        result.maxDstSave = save;
                    }
                    if (result.minDstSave === undefined || save < result.minDstSave) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7QUFFYixnQkFBZ0IsU0FBYyxFQUFFLE9BQWU7SUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7O0FBRUQsa0JBQWUsTUFBTSxDQUFDOztBQ1p0Qjs7OztHQUlHO0FBRUgsWUFBWSxDQUFDO0FBRWIsbUNBQThCO0FBQzlCLDJDQUE2QztBQUM3Qyw2QkFBK0I7QUFDL0IsbUNBQXFDO0FBc0VyQzs7O0dBR0c7QUFDSCxJQUFZLE9BUVg7QUFSRCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7SUFDUix5Q0FBTSxDQUFBO0lBQ04sNkNBQVEsQ0FBQTtBQUNULENB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LE1BQU0sQ0FBQyxRQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNmLENB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QU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFFNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFFMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7SUFFaEMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFFN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFFN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0Is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Q3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2pFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUMxQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDakUsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzFCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFvQixDQUFDO0FBQzdCLENBQUM7Ozs7QUNwbUREOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7QUFFYiw4QkFBeUI7QUFDekIsZ0NBQTJCO0FBQzNCLGdDQUEyQjtBQUMzQiw4QkFBeUI7QUFDekIsK0JBQTBCO0FBQzFCLGtDQUE2QjtBQUM3Qiw2QkFBd0I7QUFDeEIsOEJBQXlCO0FBQ3pCLDhCQUF5QjtBQUN6QixrQ0FBNkI7QUFDN0IsZ0NBQTJCO0FBQzNCLG1DQUE4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTYgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uOiBhbnksIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG5cdGlmICghY29uZGl0aW9uKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3NlcnQ7XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xyXG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcblxyXG4vKipcclxuICogVXNlZCBmb3IgbWV0aG9kcyB0aGF0IHRha2UgYSB0aW1lc3RhbXAgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lQ29tcG9uZW50T3B0cyB7XHJcblx0LyoqXHJcblx0ICogWWVhciwgZGVmYXVsdCAxOTcwXHJcblx0ICovXHJcblx0eWVhcj86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBNb250aCAxLTEyLCBkZWZhdWx0IDFcclxuXHQgKi9cclxuXHRtb250aD86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBEYXkgb2YgbW9udGggMS0zMSwgZGVmYXVsdCAxXHJcblx0ICovXHJcblx0ZGF5PzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIEhvdXIgb2YgZGF5IDAtMjMsIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdGhvdXI/OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWludXRlIDAtNTksIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdG1pbnV0ZT86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBTZWNvbmQgMC01OSwgZGVmYXVsdCAwXHJcblx0ICovXHJcblx0c2Vjb25kPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5LCBkZWZhdWx0IDBcclxuXHQgKi9cclxuXHRtaWxsaT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWVzdGFtcCByZXByZXNlbnRlZCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRzIHtcclxuXHQvKipcclxuXHQgKiBZZWFyXHJcblx0ICovXHJcblx0eWVhcjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIDEtMTJcclxuXHQgKi9cclxuXHRtb250aDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIERheSBvZiBtb250aCAxLTMxXHJcblx0ICovXHJcblx0ZGF5OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogSG91ciAwLTIzXHJcblx0ICovXHJcblx0aG91cjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbnV0ZVxyXG5cdCAqL1xyXG5cdG1pbnV0ZTogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIFNlY29uZFxyXG5cdCAqL1xyXG5cdHNlY29uZDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICovXHJcblx0bWlsbGk6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcclxuXHRTdW5kYXksXHJcblx0TW9uZGF5LFxyXG5cdFR1ZXNkYXksXHJcblx0V2VkbmVzZGF5LFxyXG5cdFRodXJzZGF5LFxyXG5cdEZyaWRheSxcclxuXHRTYXR1cmRheVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0c1xyXG4gKi9cclxuZXhwb3J0IGVudW0gVGltZVVuaXQge1xyXG5cdE1pbGxpc2Vjb25kLFxyXG5cdFNlY29uZCxcclxuXHRNaW51dGUsXHJcblx0SG91cixcclxuXHREYXksXHJcblx0V2VlayxcclxuXHRNb250aCxcclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG5cdCAqL1xyXG5cdE1BWFxyXG59XHJcblxyXG4vKipcclxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXHJcbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcclxuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcclxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogcmV0dXJuIDE7XHJcblx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuSG91cjogcmV0dXJuIDYwICogNjAgKiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHJldHVybiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cclxuICogaWYgbmVjZXNzYXJ5LlxyXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxyXG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQ6IFRpbWVVbml0LCBhbW91bnQ6IG51bWJlciA9IDEpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzOiBzdHJpbmcpOiBUaW1lVW5pdCB7XHJcblx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG5cdFx0Y29uc3Qgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG5cdFx0aWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xyXG5cdFx0XHRyZXR1cm4gaTtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIFRydWUgaWZmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0Ly8gZnJvbSBXaWtpcGVkaWE6XHJcblx0Ly8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXHJcblx0Ly8gZWxzZSBsZWFwIHllYXJcclxuXHRpZiAoeWVhciAlIDQgIT09IDApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9IGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRzd2l0Y2ggKG1vbnRoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDM6XHJcblx0XHRjYXNlIDU6XHJcblx0XHRjYXNlIDc6XHJcblx0XHRjYXNlIDg6XHJcblx0XHRjYXNlIDEwOlxyXG5cdFx0Y2FzZSAxMjpcclxuXHRcdFx0cmV0dXJuIDMxO1xyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdGNhc2UgNjpcclxuXHRcdGNhc2UgOTpcclxuXHRcdGNhc2UgMTE6XHJcblx0XHRcdHJldHVybiAzMDtcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGg6IFwiICsgbW9udGgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XHJcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlPZlllYXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiTW9udGggb3V0IG9mIHJhbmdlXCIpO1xyXG5cdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcblx0bGV0IHllYXJEYXk6IG51bWJlciA9IDA7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IG1vbnRoOyBpKyspIHtcclxuXHRcdHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcblx0fVxyXG5cdHllYXJEYXkgKz0gKGRheSAtIDEpO1xyXG5cdHJldHVybiB5ZWFyRGF5O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XHJcblx0Y29uc3QgZW5kT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG5cdGNvbnN0IGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmID4gMCkge1xyXG5cdFx0ZGlmZiAtPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBiZWdpbk9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IDF9KTtcclxuXHRjb25zdCBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0cmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSB9KTtcclxuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XHJcblx0cmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHt5ZWFyLCBtb250aCwgZGF5fSk7XHJcblx0Y29uc3Qgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcblx0aWYgKGRpZmYgPiAwKSB7XHJcblx0XHRkaWZmIC09IDc7XHJcblx0fVxyXG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGNvbnN0IGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuXHRjb25zdCBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdFx0Ly8gV2VlayAxXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0XHRcdGlmIChtb250aCA+IDEpIHtcclxuXHRcdFx0XHQvLyBEZWZhdWx0IGNhc2VcclxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gSmFudWFyeVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y29uc3QgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdGNvbnN0IGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcblx0Ly8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiBsYXN0IHdlZWsgb3Igd2VlayAxIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0aWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XHJcblx0XHRpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xyXG5cdFx0XHQvLyBXZWVrIDEgb2YgbmV4dCBtb250aFxyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIE5vcm1hbCBjYXNlXHJcblx0bGV0IHJlc3VsdCA9IE1hdGguZmxvb3IoKGRheSAtIGZpcnN0TW9uZGF5KSAvIDcpICsgMTtcclxuXHRpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcclxuXHRcdHJlc3VsdCArPSAxO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0Ly8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcclxuXHRsZXQgcmVzdWx0OiBudW1iZXIgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XHJcblx0aWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcclxuXHRcdHJlc3VsdCAtPSA3O1xyXG5cdFx0aWYgKHJlc3VsdCA8IDApIHtcclxuXHRcdFx0cmVzdWx0ICs9IGV4cG9ydHMuZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtOdW1iZXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0Y29uc3QgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG5cclxuXHQvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuXHRpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcblx0XHRjb25zdCBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcclxuXHRcdGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG5cdGNvbnN0IHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XHJcblx0aWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuXHRcdC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXHJcblx0XHRjb25zdCB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG5cdFx0aWYgKGRveSA8IHdlZWtUd28pIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cclxuXHRpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcblx0XHQvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxyXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcblx0fVxyXG5cclxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcblx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xyXG5cdGFzc2VydCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcclxuXHRhc3NlcnQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XHJcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogVGltZUNvbXBvbmVudHMge1xyXG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcblxyXG5cdGxldCB0ZW1wOiBudW1iZXIgPSB1bml4TWlsbGlzO1xyXG5cdGNvbnN0IHJlc3VsdDogVGltZUNvbXBvbmVudHMgPSB7IHllYXI6IDAsIG1vbnRoOiAwLCBkYXk6IDAsIGhvdXI6IDAsIG1pbnV0ZTogMCwgc2Vjb25kOiAwLCBtaWxsaTogMH07XHJcblx0bGV0IHllYXI6IG51bWJlcjtcclxuXHRsZXQgbW9udGg6IG51bWJlcjtcclxuXHJcblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG5cdFx0cmVzdWx0Lm1pbGxpID0gdGVtcCAlIDEwMDA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSB0ZW1wICUgMjQ7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTcwO1xyXG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXIrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDE7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoKys7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG5cdFx0Ly8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTY5O1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXItLTtcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDEyO1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG5cdFx0XHRtb250aC0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogRmlsbCB5b3UgYW55IG1pc3NpbmcgdGltZSBjb21wb25lbnQgcGFydHMsIGRlZmF1bHRzIGFyZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBUaW1lQ29tcG9uZW50cyB7XHJcblx0Y29uc3QgaW5wdXQgPSB7XHJcblx0XHR5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuXHRcdG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG5cdFx0ZGF5OiB0eXBlb2YgY29tcG9uZW50cy5kYXkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmRheSA6IDEsXHJcblx0XHRob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuXHRcdG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG5cdFx0c2Vjb25kOiB0eXBlb2YgY29tcG9uZW50cy5zZWNvbmQgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnNlY29uZCA6IDAsXHJcblx0XHRtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuXHR9O1xyXG5cdHJldHVybiBpbnB1dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB5ZWFyLCBtb250aCwgZGF5IGV0YyBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuICogQHBhcmFtIG1pbnV0ZVx0TWludXRlIDAtNTlcclxuICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxyXG5cdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyLCBtaWxsaTogbnVtYmVyXHJcbik6IG51bWJlcjtcclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogbnVtYmVyO1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0YTogVGltZUNvbXBvbmVudE9wdHMgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG4pOiBudW1iZXIge1xyXG5cdGNvbnN0IGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSA6IGEpO1xyXG5cdGNvbnN0IGlucHV0OiBUaW1lQ29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpO1xyXG5cdHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoXHJcblx0XHRpbnB1dC5zZWNvbmQgKyBpbnB1dC5taW51dGUgKiA2MCArIGlucHV0LmhvdXIgKiAzNjAwICsgZGF5T2ZZZWFyKGlucHV0LnllYXIsIGlucHV0Lm1vbnRoLCBpbnB1dC5kYXkpICogODY0MDAgK1xyXG5cdFx0KGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcblx0XHRNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0Y29uc3QgZXBvY2hEYXk6IFdlZWtEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG5cdHJldHVybiAoZXBvY2hEYXkgKyBkYXlzKSAlIDc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRPZkRheShob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xyXG59XHJcblxyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuXHQgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXHJcblx0ICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUNvbXBvbmVudHMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21Vbml4KHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZFx0VGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZGZcdFdoaWNoIGZ1bmN0aW9ucyB0byB0YWtlIChnZXRYKCkgb3IgZ2V0VVRDWCgpKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbURhdGUoZDogRGF0ZSwgZGY6IERhdGVGdW5jdGlvbnMpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmIChkZiA9PT0gRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuXHRcdFx0XHR5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG5cdFx0XHRcdGhvdXI6IGQuZ2V0SG91cnMoKSwgbWludXRlOiBkLmdldE1pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFNlY29uZHMoKSwgbWlsbGk6IGQuZ2V0TWlsbGlzZWNvbmRzKClcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xyXG5cdFx0XHRcdHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXHJcblx0XHRcdFx0aG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDE5NzA7XHJcblx0XHRcdGxldCBtb250aDogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGRheTogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGhvdXI6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBmcmFjdGlvbk1pbGxpczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblxyXG5cdFx0XHQvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuXHRcdFx0YXNzZXJ0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcclxuXHJcblx0XHRcdC8vIHBhcnNlIG1haW4gcGFydFxyXG5cdFx0XHRjb25zdCBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcclxuXHRcdFx0aWYgKGlzQmFzaWNGb3JtYXQpIHtcclxuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXHJcblx0XHRcdFx0XHRcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG5cclxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxyXG5cdFx0XHRcdHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcblxyXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xyXG5cdFx0XHRcdGxldCBkYXRlQW5kVGltZTogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YXNzZXJ0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Y29uc3QgZnJhY3Rpb246IG51bWJlciA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0bGV0IHVuaXhNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgfSk7XHJcblx0XHRcdHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdW5peE1pbGxpczogbnVtYmVyO1xyXG5cdHB1YmxpYyBnZXQgdW5peE1pbGxpcygpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXhNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9jb21wb25lbnRzOiBUaW1lQ29tcG9uZW50cztcclxuXHRwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKTogVGltZUNvbXBvbmVudHMge1xyXG5cdFx0aWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSB1bml4VG9UaW1lTm9MZWFwU2Vjcyh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1bml4TWlsbGlzIG1pbGxpc2Vjb25kcyBzaW5jZSAxLTEtMTk3MFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhNaWxsaXM6IG51bWJlcik7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb21wb25lbnRzIFNlcGFyYXRlIHRpbWVzdGFtcCBjb21wb25lbnRzICh5ZWFyLCBtb250aCwgLi4uKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGE6IG51bWJlciB8IFRpbWVDb21wb25lbnRPcHRzKSB7XHJcblx0XHRpZiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9jb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoYSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXQgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0Z2V0IGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHRnZXQgc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdGdldCBtaWxsaSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogVGltZVN0cnVjdCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXHJcblx0ICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWxpZGF0ZSgpOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuZGF5ID49IDEgJiYgdGhpcy5jb21wb25lbnRzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoKVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kIDw9IDU5XHJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVTdHJ1Y3Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBCaW5hcnkgc2VhcmNoXHJcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcclxuICogQHBhcmFtIGNvbXBhcmUgRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIDwgMCBpZiBnaXZlbiBlbGVtZW50IGlzIGxlc3MgdGhhbiBzZWFyY2hlZCBlbGVtZW50IGV0Y1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleDxUPihhcnI6IFRbXSwgY29tcGFyZTogKGE6IFQpID0+IG51bWJlcik6IG51bWJlciB7XHJcblx0bGV0IG1pbkluZGV4ID0gMDtcclxuXHRsZXQgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcclxuXHRsZXQgY3VycmVudEluZGV4OiBudW1iZXI7XHJcblx0bGV0IGN1cnJlbnRFbGVtZW50OiBUO1xyXG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcclxuXHRpZiAoIWFycikge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0Ly8gb3V0IG9mIGJvdW5kc1xyXG5cdGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0aWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xyXG5cdH1cclxuXHQvLyBlbGVtZW50IGluIHJhbmdlXHJcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XHJcblx0XHRjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xyXG5cdFx0Y3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuXHJcblx0XHRpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcblx0XHRcdG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcblx0XHRcdG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBXZWVrRGF5LCBUaW1lU3RydWN0LCBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XHJcbmltcG9ydCB7IFRpbWVTb3VyY2UsIFJlYWxUaW1lU291cmNlIH0gZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuaW1wb3J0ICogYXMgZm9ybWF0IGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5pbXBvcnQgKiBhcyBwYXJzZUZ1bmNzIGZyb20gXCIuL3BhcnNlXCI7XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3codGltZVpvbmU6IFRpbWVab25lIHwgbnVsbCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBmcm9tWm9uZT86IFRpbWVab25lIHwgbnVsbCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdGlmIChmcm9tWm9uZSkge1xyXG5cdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBmcm9tWm9uZS5vZmZzZXRGb3Jab25lKGxvY2FsVGltZSk7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lLnVuaXhNaWxsaXMgLSBvZmZzZXQgKiA2MDAwMCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbnZlcnRGcm9tVXRjKHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHRvWm9uZT86IFRpbWVab25lIHwgbnVsbCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdGlmICh0b1pvbmUpIHtcclxuXHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcclxuXHRcdHJldHVybiB0b1pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IFRpbWVTdHJ1Y3QodXRjVGltZS51bml4TWlsbGlzICsgb2Zmc2V0ICogNjAwMDApKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWUge1xyXG5cclxuXHQvKipcclxuXHQgKiBVVEMgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcclxuXHQgKi9cclxuXHRwcml2YXRlIF91dGNEYXRlOiBUaW1lU3RydWN0IHwgdW5kZWZpbmVkO1xyXG5cdHByaXZhdGUgZ2V0IHV0Y0RhdGUoKTogVGltZVN0cnVjdCB7XHJcblx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlO1xyXG5cdH1cclxuXHRwcml2YXRlIHNldCB1dGNEYXRlKHZhbHVlOiBUaW1lU3RydWN0KSB7XHJcblx0XHR0aGlzLl91dGNEYXRlID0gdmFsdWU7XHJcblx0XHR0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZURhdGU6IFRpbWVTdHJ1Y3QgfCB1bmRlZmluZWQ7XHJcblx0cHJpdmF0ZSBnZXQgem9uZURhdGUoKTogVGltZVN0cnVjdCB7XHJcblx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZTtcclxuXHR9XHJcblx0cHJpdmF0ZSBzZXQgem9uZURhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcclxuXHRcdHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XHJcblx0XHR0aGlzLl91dGNEYXRlID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxyXG5cdCAqIENhbiBiZSBOVUxMIGZvciB1bmF3YXJlIHRpbWVzdGFtcHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lOiBUaW1lWm9uZSB8IG51bGw7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuXHQgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXHJcblx0ICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgdGltZVNvdXJjZTogVGltZVNvdXJjZSA9IG5ldyBSZWFsVGltZVNvdXJjZSgpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0XHRjb25zdCBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobiwgRGF0ZUZ1bmN0aW9ucy5HZXQsIFRpbWVab25lLmxvY2FsKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93KHRpbWVab25lOiBUaW1lWm9uZSB8IG51bGwgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcclxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXHJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cclxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XHJcblx0XHRhc3NlcnQoIWlzTmFOKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0YXNzZXJ0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcclxuXHQgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcblx0ICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxyXG5cdCAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXHJcblx0ICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZXhpc3RzKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsIG1pbGxpc2Vjb25kOiBudW1iZXIgPSAwLFxyXG5cdFx0em9uZTogVGltZVpvbmUgfCBudWxsID0gbnVsbCwgYWxsb3dQcmUxOTcwOiBib29sZWFuID0gZmFsc2VcclxuXHQpOiBib29sZWFuIHtcclxuXHRcdGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KVxyXG5cdFx0XHR8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZCkgfHwgIWlzRmluaXRlKG1pbGxpc2Vjb25kKSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR0cnkge1xyXG5cdFx0XHRjb25zdCBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xyXG5cdFx0XHRyZXR1cm4gKHllYXIgPT09IGR0LnllYXIoKSAmJiBtb250aCA9PT0gZHQubW9udGgoKSAmJiBkYXkgPT09IGR0LmRheSgpXHJcblx0XHRcdFx0JiYgaG91ciA9PT0gZHQuaG91cigpICYmIG1pbnV0ZSA9PT0gZHQubWludXRlKCkgJiYgc2Vjb25kID09PSBkdC5zZWNvbmQoKSAmJiBtaWxsaXNlY29uZCA9PT0gZHQubWlsbGlzZWNvbmQoKSk7XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBDcmVhdGVzIGN1cnJlbnQgdGltZSBpbiBsb2NhbCB0aW1lem9uZS5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcigpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgSVNPIHRpbWVzdGFtcCBzdHJpbmcuXHJcblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaXNvU3RyaW5nXHRTdHJpbmcgaW4gSVNPIDg2MDEgZm9ybWF0LiBJbnN0ZWFkIG9mIElTTyB0aW1lIHpvbmUsXHJcblx0ICpcdFx0IGl0IG1heSBpbmNsdWRlIGEgc3BhY2UgYW5kIHRoZW4gYW5kIElBTkEgdGltZSB6b25lLlxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFwiXHRcdFx0XHRcdChubyB0aW1lIHpvbmUsIG5haXZlIGRhdGUpXHJcblx0ICogZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwKzAxOjAwXCJcdFx0XHRcdChVVEMgb2Zmc2V0IHdpdGhvdXQgZGF5bGlnaHQgc2F2aW5nIHRpbWUpXHJcblx0ICogb3IgICBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwWlwiXHRcdFx0XHRcdChVVEMpXHJcblx0ICogb3IgICBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwIEV1cm9wZS9BbXN0ZXJkYW1cIlx0KElBTkEgdGltZSB6b25lLCB3aXRoIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlmIGFwcGxpY2FibGUpXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxyXG5cdCAqXHRcdFx0XHRcdE5vdGUgdGhhdCBpdCBpcyBOT1QgQ09OVkVSVEVEIHRvIHRoZSB0aW1lIHpvbmUuIFVzZWZ1bFxyXG5cdCAqXHRcdFx0XHRcdGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihpc29TdHJpbmc6IHN0cmluZywgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgc3RyaW5nIGluIGdpdmVuIExETUwgZm9ybWF0LlxyXG5cdCAqIE5PVEU6IGRvZXMgbm90IGhhbmRsZSBlcmFzL3F1YXJ0ZXJzL3dlZWtzL3dlZWtkYXlzLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVTdHJpbmdcdERhdGUrVGltZSBzdHJpbmcuXHJcblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXHJcblx0ICpcdFx0XHRcdFx0Tm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXHJcblx0ICpcdFx0XHRcdFx0Zm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGVTdHJpbmc6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxyXG5cdCAqIGRhdGUuZ2V0WWVhcigpL2dldFh4eCBtZXRob2RzIG9yIHRoZSBkYXRlLmdldFVUQ1llYXIoKS9kYXRlLmdldFVUQ1h4eCBtZXRob2RzLFxyXG5cdCAqIGFuZCB0aGVuIHlvdSBzdGF0ZSB3aGljaCB0aW1lIHpvbmUgdGhhdCBkYXRlIGlzIGluLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqIE5vdGUgdGhhdCB0aGUgRGF0ZSBjbGFzcyBoYXMgYnVncyBhbmQgaW5jb25zaXN0ZW5jaWVzIHdoZW4gY29uc3RydWN0aW5nIHRoZW0gd2l0aCB0aW1lcyBhcm91bmRcclxuXHQgKiBEU1QgY2hhbmdlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlXHRBIGRhdGUgb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBnZXR0ZXJzXHRTcGVjaWZpZXMgd2hpY2ggc2V0IG9mIERhdGUgZ2V0dGVycyBjb250YWlucyB0aGUgZGF0ZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lOiB0aGVcclxuXHQgKlx0XHRcdFx0XHREYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcylcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwpO1xyXG5cdC8qKlxyXG5cdCAqIEdldCBhIGRhdGUgZnJvbSBhIFRpbWVTdHJ1Y3RcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcih0bTogVGltZVN0cnVjdCwgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cclxuXHQgKiBVc2UgdGhlIGFkZChkdXJhdGlvbikgb3Igc3ViKGR1cmF0aW9uKSBmb3IgYXJpdGhtZXRpYy5cclxuXHQgKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhciAoZS5nLiAyMDE0KVxyXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXlcdFRoZSBkYXkgb2YgdGhlIG1vbnRoIFsxLTMxXVxyXG5cdCAqIEBwYXJhbSBob3VyXHRUaGUgaG91ciBvZiB0aGUgZGF5IFswLTI0KVxyXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXHJcblx0ICogQHBhcmFtIHNlY29uZFx0VGhlIHNlY29uZCBvZiB0aGUgbWludXRlIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZFx0VGhlIG1pbGxpc2Vjb25kIG9mIHRoZSBzZWNvbmQgWzAtOTk5XVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbCAoZm9yIHVuYXdhcmUgZGF0ZXMpXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpc2Vjb25kPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0dGhlIHRpbWUgem9uZSB0aGF0IHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBpbiAodXN1YWxseSBVVEMpLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgZG8gbm90IGNhbGxcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdGExPzogYW55LCBhMj86IGFueSwgYTM/OiBhbnksXHJcblx0XHRoPzogbnVtYmVyLCBtPzogbnVtYmVyLCBzPzogbnVtYmVyLCBtcz86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsXHJcblx0KSB7XHJcblx0XHRzd2l0Y2ggKHR5cGVvZiAoYTEpKSB7XHJcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xyXG5cdFx0XHRcdGlmIChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGEyIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZXhwZWN0IHVuaXhUaW1lc3RhbXAgdG8gYmUgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGEyIGluc3RhbmNlb2YgVGltZVpvbmUgPyA8VGltZVpvbmU+YTIgOiBudWxsKTtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKDxudW1iZXI+YTEpKSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCB5ZWFyIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgbW9udGggdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDxudW1iZXI+YTE7XHJcblx0XHRcdFx0XHRsZXQgbW9udGg6IG51bWJlciA9IDxudW1iZXI+YTI7XHJcblx0XHRcdFx0XHRsZXQgZGF5OiBudW1iZXIgPSA8bnVtYmVyPmEzO1xyXG5cdFx0XHRcdFx0bGV0IGhvdXI6IG51bWJlciA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xyXG5cdFx0XHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XHJcblx0XHRcdFx0XHRsZXQgc2Vjb25kOiBudW1iZXIgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcclxuXHRcdFx0XHRcdGxldCBtaWxsaTogbnVtYmVyID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcclxuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuXHRcdFx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcclxuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRcdFx0bWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xyXG5cdFx0XHRcdFx0bWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcclxuXHRcdFx0XHRcdGNvbnN0IHRtID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdFx0XHRhc3NlcnQodG0udmFsaWRhdGUoKSwgYGludmFsaWQgZGF0ZTogJHt0bS50b1N0cmluZygpfWApO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgdGltZVpvbmUgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IHRpbWVab25lIDogbnVsbCk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0bSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRtO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0Ly8gZm9ybWF0IHN0cmluZyBnaXZlblxyXG5cdFx0XHRcdFx0Y29uc3QgZGF0ZVN0cmluZzogc3RyaW5nID0gPHN0cmluZz5hMTtcclxuXHRcdFx0XHRcdGNvbnN0IGZvcm1hdFN0cmluZzogc3RyaW5nID0gPHN0cmluZz5hMjtcclxuXHRcdFx0XHRcdGxldCB6b25lOiBUaW1lWm9uZSB8IG51bGwgPSBudWxsO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBhMyBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHRcdHpvbmUgPSA8VGltZVpvbmU+KGEzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UoZGF0ZVN0cmluZywgZm9ybWF0U3RyaW5nLCB6b25lKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gcGFyc2VkLnRpbWU7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gcGFyc2VkLnpvbmUgfHwgbnVsbDtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc3QgZ2l2ZW5TdHJpbmcgPSAoPHN0cmluZz5hMSkudHJpbSgpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgc3M6IHN0cmluZ1tdID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIDxzdHJpbmc+YTEgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gPFRpbWVab25lPihhMik7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gKHNzWzFdLnRyaW0oKSA/IFRpbWVab25lLnpvbmUoc3NbMV0pIDogbnVsbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcclxuXHRcdFx0XHRcdC8vIChmcmVlIG9mIERhdGUgcXVpcmtzKVxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xyXG5cdFx0XHRcdGlmIChhMSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gYTEuY2xvbmUoKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IG51bGwpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsXHJcblx0XHRcdFx0XHRcdFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZm9yIGEgRGF0ZSBvYmplY3QgYSBEYXRlRnVuY3Rpb25zIG11c3QgYmUgcGFzc2VkIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCghYTMgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aW1lWm9uZSBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZDogRGF0ZSA9IDxEYXRlPihhMSk7XHJcblx0XHRcdFx0XHRjb25zdCBkazogRGF0ZUZ1bmN0aW9ucyA9IDxEYXRlRnVuY3Rpb25zPihhMik7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiBudWxsKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XHJcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS5sb2NhbCgpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZGF0ZSBpcyBpbi4gTWF5IGJlIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUgfCBudWxsIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVBYmJyZXZpYXRpb24oZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fem9uZS5hYmJyZXZpYXRpb25Gb3JVdGModGhpcy51dGNEYXRlLCBkc3REZXBlbmRlbnQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW5jbHVkaW5nIERTVCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXREdXJhdGlvbigpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBXSVRIT1VUIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fem9uZS5zdGFuZGFyZE9mZnNldEZvclV0Yyh0aGlzLnV0Y0RhdGUpKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnllYXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICovXHJcblx0cHVibGljIG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcblx0ICovXHJcblx0cHVibGljIGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIG1pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBzZWNvbmRzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcblx0ICogd2VlayBkYXkgbnVtYmVycylcclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla0RheSgpOiBXZWVrRGF5IHtcclxuXHRcdHJldHVybiA8V2Vla0RheT5iYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy56b25lRGF0ZS51bml4TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcblx0ICovXHJcblx0cHVibGljIGRheU9mWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtOdW1iZXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG5cdCAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla09mTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmRPZkRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5peFV0Y01pbGxpcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICovXHJcblx0cHVibGljIHV0Y01vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0RheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjSG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y01pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjU2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0RheU9mWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y01pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuXHQgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrRGF5KCk6IFdlZWtEYXkge1xyXG5cdFx0cmV0dXJuIDxXZWVrRGF5PmJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgSVNPIDg2MDEgVVRDIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtOdW1iZXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG5cdCAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla09mTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNTZWNvbmRPZkRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lIHdoaWNoIGlzIHRoZSBkYXRlK3RpbWUgcmVpbnRlcnByZXRlZCBhc1xyXG5cdCAqIGluIHRoZSBuZXcgem9uZS4gU28gZS5nLiAwODowMCBBbWVyaWNhL0NoaWNhZ28gY2FuIGJlIHNldCB0byAwODowMCBFdXJvcGUvQnJ1c3NlbHMuXHJcblx0ICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXHJcblx0ICogV29ya3MgZm9yIG5haXZlIGFuZCBhd2FyZSBkYXRlcy4gVGhlIG5ldyB6b25lIG1heSBiZSBudWxsLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcclxuXHQgKiBAcmV0dXJuIEEgbmV3IERhdGVUaW1lIHdpdGggdGhlIG9yaWdpbmFsIHRpbWVzdGFtcCBhbmQgdGhlIG5ldyB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3aXRoWm9uZSh6b25lPzogVGltZVpvbmUgfCBudWxsKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcclxuXHRcdFx0em9uZVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cclxuXHQgKiBUaHJvd3MgaWYgdGhpcyBkYXRlIGRvZXMgbm90IGhhdmUgYSB0aW1lIHpvbmUuXHJcblx0ICogQHJldHVybiB0aGlzIChmb3IgY2hhaW5pbmcpXHJcblx0ICovXHJcblx0cHVibGljIGNvbnZlcnQoem9uZT86IFRpbWVab25lIHwgbnVsbCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGlmICghdGhpcy5fem9uZSkgeyAvLyBpZi1zdGF0ZW1lbnQgc2F0aXNmaWVzIHRoZSBjb21waWxlclxyXG5cdFx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICghdGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fem9uZSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcblx0ICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cclxuXHQgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lIHwgbnVsbCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XHJcblx0XHRcdHJlc3VsdC51dGNEYXRlID0gdGhpcy51dGNEYXRlO1xyXG5cdFx0XHRyZXN1bHQuX3pvbmUgPSB6b25lO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXHJcblx0ICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuXHQgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHRvRGF0ZSgpOiBEYXRlIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgT3B0aW9uYWwuIFpvbmUgdG8gY29udmVydCB0bywgZGVmYXVsdCB0aGUgem9uZSB0aGUgZGF0ZXRpbWUgaXMgYWxyZWFkeSBpbi5cclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9FeGNlbCh0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCk6IG51bWJlciB7XHJcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcclxuXHRcdGlmICh0aW1lWm9uZSAmJiAoIXRoaXMuX3pvbmUgfHwgIXRpbWVab25lLmVxdWFscyh0aGlzLl96b25lKSkpIHtcclxuXHRcdFx0ZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0XHR9XHJcblx0XHRjb25zdCBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuXHRcdGNvbnN0IHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNFeGNlbCgpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfdW5peFRpbWVTdGFtcFRvRXhjZWwobjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcblx0XHRjb25zdCBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgdGltZSBkdXJhdGlvbiByZWxhdGl2ZSB0byBVVEMuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKiBAcmV0dXJuIHRoaXMgKyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIHV0Y0hvdXIoKSBmaWVsZCwgYWRkaW5nIDEgbW9udGhcclxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxyXG5cdCAqIEFkZGluZyBhbiBhbW91bnQgb2YgdW5pdHMgbGVhdmVzIGxvd2VyIHVuaXRzIGludGFjdC4gRS5nLlxyXG5cdCAqIGFkZGluZyBhIG1vbnRoIHdpbGwgbGVhdmUgdGhlIGRheSgpIGZpZWxkIHVudG91Y2hlZCBpZiBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcclxuXHQgKiB0aGUgc3RhcnQgZGF0ZSB3YXMgYXQgdGhlIGVuZCBvZiBhIG1vbnRoLCBpLmUuIGNvbnRyYXJ5IHRvIEphdmFTY3JpcHRcclxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxyXG5cdCAqXHJcblx0ICogSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHV0YyB0aW1lIGZpZWxkcyBhcmUgc3RpbGwgdW50b3VjaGVkIGJ1dCBsb2NhbFxyXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEltcGxlbWVudGF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIHpvbmUgdGltZSwgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxyXG5cdCAqIGRhdGUgYnkgb25lLiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdGltZSBmaWVsZHMgbWF5IGFkZGl0aW9uYWxseVxyXG5cdCAqIGluY3JlYXNlIGJ5IHRoZSBEU1Qgb2Zmc2V0LCBpZiBhIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lIHdvdWxkXHJcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgYSB1bml0IG9mIHRpbWUgd2lsbCBsZWF2ZSBsb3dlci11bml0IGZpZWxkcyBpbnRhY3QsIHVubGVzcyB0aGUgcmVzdWx0XHJcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICovXHJcblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgYWRkTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG5cdFx0XHRjb25zdCBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG5vcm1hbGl6ZWQsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcclxuXHQgKiBuZWNlc3NhcnkuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcclxuXHRcdGxldCB5ZWFyOiBudW1iZXI7XHJcblx0XHRsZXQgbW9udGg6IG51bWJlcjtcclxuXHRcdGxldCBkYXk6IG51bWJlcjtcclxuXHRcdGxldCBob3VyOiBudW1iZXI7XHJcblx0XHRsZXQgbWludXRlOiBudW1iZXI7XHJcblx0XHRsZXQgc2Vjb25kOiBudW1iZXI7XHJcblx0XHRsZXQgbWlsbGk6IG51bWJlcjtcclxuXHJcblx0XHRzd2l0Y2ggKHVuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50KSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAxMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuV2VlazpcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xyXG5cdFx0XHRcdC8vIGtlZXAgdGhlIGRheS1vZi1tb250aCB0aGUgc2FtZSAoY2xhbXAgdG8gZW5kLW9mLW1vbnRoKVxyXG5cdFx0XHRcdGlmIChhbW91bnQgPj0gMCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcclxuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG5cdFx0XHRcdG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiB5ZWFyc1wiKTtcclxuXHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xyXG5cdFx0XHRcdG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuXHRcdFx0XHRkYXkgPSBNYXRoLm1pbih0bS5jb21wb25lbnRzLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XHJcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuXHRcdFx0XHRtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuXHRcdFx0XHRzZWNvbmQgPSB0bS5jb21wb25lbnRzLnNlY29uZDtcclxuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGQoLTEqZHVyYXRpb24pOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIiAmJiBhMSBpbnN0YW5jZW9mIER1cmF0aW9uKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0Y29uc3QgYW1vdW50OiBudW1iZXIgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCBhcyBUaW1lVW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZExvY2FsKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWJMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKCg8RHVyYXRpb24+YTEpLm11bHRpcGx5KC0xKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIDxudW1iZXI+YTEsIHVuaXQgYXMgVGltZVVuaXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xyXG5cdCAqIEByZXR1cm4gdGhpcyAtIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGRpZmYob3RoZXI6IERhdGVUaW1lKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcclxuXHQqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQqL1xyXG5cdHB1YmxpYyBzdGFydE9mRGF5KCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnRPZk1vbnRoKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mWWVhcigpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDw9IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxyXG5cdFx0XHQmJiAoIXRoaXMuX3pvbmUpID09PSAoIW90aGVyLl96b25lKVxyXG5cdFx0XHQmJiAoKCF0aGlzLl96b25lICYmICFvdGhlci5fem9uZSkgfHwgKHRoaXMuX3pvbmUgJiYgb3RoZXIuX3pvbmUgJiYgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKSlcclxuXHRcdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID4gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1pbihvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHJldHVybiBzICsgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXHJcblx0ICogc3BlY2lmaWVkIGZvcm1hdC4gVGhlIGZvcm1hdCBpcyBpbXBsZW1lbnRlZCBhcyB0aGUgTERNTCBzdGFuZGFyZFxyXG5cdCAqIChodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF9QYXR0ZXJucylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxyXG5cdCAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE9wdGlvbmFsLCBub24tZW5nbGlzaCBmb3JtYXQgbW9udGggbmFtZXMgZXRjLlxyXG5cdCAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIGZvcm1hdChmb3JtYXRTdHJpbmc6IHN0cmluZywgZm9ybWF0T3B0aW9ucz86IFBhcnRpYWw8Zm9ybWF0LkZvcm1hdE9wdGlvbnM+KTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy5fem9uZSwgZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxyXG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2VcclxuXHQgKiBAcGFyYW0gZm9ybWF0IHRoZSBmb3JtYXQgdGhlIHN0cmluZyBpcyBpblxyXG5cdCAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHBhcnNlKHM6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRjb25zdCBzOiBzdHJpbmcgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IFRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfc3BsaXREYXRlRnJvbVRpbWVab25lKHM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcclxuXHRcdGxldCBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJ3aXRob3V0IERTVFwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdGNvbnN0IHJlc3VsdCA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUocy5zbGljZSgwLCBpbmRleCAtIDEpKTtcclxuXHRcdFx0cmVzdWx0WzFdICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCArIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgsIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuXHRcdGlmIChpbmRleCA8IDgpIHtcclxuXHRcdFx0aW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXHJcblx0XHR9XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIGR1cmF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgZHVyYXRpb24gd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYW4gYW1vdW50IGFuZCBhIHVuaXQgZS5nLlxyXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxyXG4gKlxyXG4gKiBJdCBoYXMgdHdvIHNldHMgb2YgZ2V0dGVyIGZ1bmN0aW9uczpcclxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxyXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxyXG4gKiAtIHNlY29uZHMoKSwgbWludXRlcygpLCBob3VycygpIGV0YywgcGx1cmFsIGZvcm06IHRoZXNlIHJldHVybiB0aGUgdG90YWwgYW1vdW50IHJlcHJlc2VudGVkIGluIHRoZSBjb3JyZXNwb25kaW5nIHVuaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiBHaXZlbiBhbW91bnQgaW4gY29uc3RydWN0b3JcclxuXHQgKi9cclxuXHRwcml2YXRlIF9hbW91bnQ6IG51bWJlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVW5pdFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3VuaXQ6IFRpbWVVbml0O1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuWWVhcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuSG91cik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWludXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gb2YgMFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gZnJvbSBhIHN0cmluZyBpbiBvbmUgb2YgdHdvIGZvcm1hdHM6XHJcblx0ICogMSkgWy1daGhoaFs6bW1bOnNzWy5ubm5dXV0gZS5nLiAnLTAxOjAwOjMwLjUwMSdcclxuXHQgKiAyKSBhbW91bnQgYW5kIHVuaXQgZS5nLiAnLTEgZGF5cycgb3IgJzEgeWVhcicuIFRoZSB1bml0IG1heSBiZSBpbiBzaW5ndWxhciBvciBwbHVyYWwgZm9ybSBhbmQgaXMgY2FzZS1pbnNlbnNpdGl2ZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSBkdXJhdGlvbiBmcm9tIGFuIGFtb3VudCBhbmQgYSB0aW1lIHVuaXQuXHJcblx0ICogQHBhcmFtIGFtb3VudFx0TnVtYmVyIG9mIHVuaXRzXHJcblx0ICogQHBhcmFtIHVuaXRcdEEgdGltZSB1bml0IGkuZS4gVGltZVVuaXQuU2Vjb25kLCBUaW1lVW5pdC5Ib3VyIGV0Yy4gRGVmYXVsdCBNaWxsaXNlY29uZC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihhbW91bnQ6IG51bWJlciwgdW5pdD86IFRpbWVVbml0KTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihpMT86IGFueSwgdW5pdD86IFRpbWVVbml0KSB7XHJcblx0XHRpZiAodHlwZW9mIChpMSkgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0Ly8gYW1vdW50K3VuaXQgY29uc3RydWN0b3JcclxuXHRcdFx0Y29uc3QgYW1vdW50ID0gPG51bWJlcj5pMTtcclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG5cdFx0XHR0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0Ly8gc3RyaW5nIGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Zyb21TdHJpbmcoPHN0cmluZz5pMSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IDA7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0Y29uc3QgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuXHRcdFx0Y29uc3QgcmVxTW9udGhzID0gKHVuaXQgPT09IFRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcblx0XHRcdGNvbnN0IHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcblx0ICogdGhlIHNhbWUgdW5pdC5cclxuXHQgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcblx0ICovXHJcblx0cHVibGljIGNvbnZlcnQodW5pdDogVGltZVVuaXQpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuU2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGVzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbnV0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG5cdCAqIGR1cmluZyBEU1QgY2hhbmdlcykuXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXHJcblx0ICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG5cdCAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlSG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXHJcblx0ICovXHJcblx0cHVibGljIGRheXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5EYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGhzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Nb250aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcblx0ICovXHJcblx0cHVibGljIHllYXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5ZZWFyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlWWVhcnMoKTogbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cclxuXHRcdFx0XHRiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhUaW1lVW5pdC5ZZWFyKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhbW91bnQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5pdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpZ25cclxuXHQgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzaWduKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xyXG5cdCAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFsc0V4YWN0KG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IG90aGVyLl91bml0KSB7XHJcblx0XHRcdHJldHVybiAodGhpcy5fYW1vdW50ID09PSBvdGhlci5fYW1vdW50KTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBUaW1lVW5pdC5Nb250aCAmJiBvdGhlci51bml0KCkgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbW9udGhzIGFuZCB5ZWFyc1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0IDwgVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IFRpbWVVbml0LkRheSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtaWxsaXNlY29uZHMgdGhyb3VnaCBob3Vyc1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBjYW5ub3QgY29tcGFyZSBkYXlzIHRvIGFueXRoaW5nIGVsc2VcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSAobW9zdCBwb3NpdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4KG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIG11bHRpcGx5KHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZSBieSBhIHVuaXRsZXNzIG51bWJlci4gVGhlIHJlc3VsdCBpcyBhIER1cmF0aW9uLCBlLmcuIDEgeWVhciAvIDIgPSAwLjUgeWVhclxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb247XHJcblx0LyoqXHJcblx0ICogRGl2aWRlIHRoaXMgRHVyYXRpb24gYnkgYSBEdXJhdGlvbi4gVGhlIHJlc3VsdCBpcyBhIHVuaXRsZXNzIG51bWJlciBlLmcuIDEgeWVhciAvIDEgbW9udGggPSAxMlxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogRHVyYXRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyIHwgRHVyYXRpb24pOiBEdXJhdGlvbiB8IG51bWJlciB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvIGR1cmF0aW9uXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSBkdXJhdGlvbi5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdCBhIGR1cmF0aW9uLlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHN1Yih2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYnMoKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXHJcblx0ICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0Z1bGxTdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cclxuXHQgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcclxuXHQgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0htc1N0cmluZyhmdWxsOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHRcdGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5zZWNvbmQoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcblx0XHRcdHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0c3dpdGNoICh0aGlzLl91bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BhcnQodW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdFx0bGV0IG5leHRVbml0OiBUaW1lVW5pdDtcclxuXHRcdC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxyXG5cdFx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuU2Vjb25kOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuTWludXRlOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IG5leHRVbml0ID0gVGltZVVuaXQuSG91cjsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjogbmV4dFVuaXQgPSBUaW1lVW5pdC5EYXk7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Nb250aDsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IG5leHRVbml0ID0gVGltZVVuaXQuWWVhcjsgYnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhUaW1lVW5pdC5ZZWFyKSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcclxuXHR9XHJcblxyXG5cclxuXHRwcml2YXRlIF9mcm9tU3RyaW5nKHM6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG5cdFx0aWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XHJcblx0XHRcdGxldCBzaWduOiBudW1iZXIgPSAxO1xyXG5cdFx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGVzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRsZXQgc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IG1pbGxpc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0Y29uc3QgcGFydHM6IHN0cmluZ1tdID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcblx0XHRcdGFzc2VydChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcblx0XHRcdFx0c2lnbiA9IC0xO1xyXG5cdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0aG91cnMgPSArcGFydHNbMF07XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRtaW51dGVzID0gK3BhcnRzWzFdO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcblx0XHRcdFx0Y29uc3Qgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcblx0XHRcdFx0c2Vjb25kcyA9ICtzZWNvbmRQYXJ0c1swXTtcclxuXHRcdFx0XHRpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRcdFx0bWlsbGlzZWNvbmRzID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc3QgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyArIDEwMDAgKiBzZWNvbmRzICsgNjAwMDAgKiBtaW51dGVzICsgMzYwMDAwMCAqIGhvdXJzKTtcclxuXHRcdFx0Ly8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG5cdFx0XHRpZiAobWlsbGlzZWNvbmRzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHNlY29uZHMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKG1pbnV0ZXMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGhvdXJzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuXHRcdFx0YXNzZXJ0KCFpc05hTihhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgY2Fubm90IHBhcnNlIGFtb3VudFwiKTtcclxuXHRcdFx0YXNzZXJ0KGlzRmluaXRlKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBhbW91bnQgaXMgaW5maW5pdGVcIik7XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuXHRcdFx0dGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBUb2tlbml6ZXIsIFRva2VuLCBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUgfSBmcm9tIFwiLi90b2tlblwiO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcclxuaW1wb3J0IHsgVGltZVpvbmUgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0T3B0aW9ucyB7XHJcblx0LyoqXHJcblx0ICogVGhlIGxldHRlciBpbmRpY2F0aW5nIGEgcXVhcnRlciBlLmcuIFwiUVwiIChiZWNvbWVzIFExLCBRMiwgUTMsIFE0KVxyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJMZXR0ZXI6IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXHJcblx0ICovXHJcblx0cXVhcnRlcldvcmQ6IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBRdWFydGVyIGFiYnJldmlhdGlvbnMgZS5nLiAxc3QsIDJuZCwgM3JkLCA0dGhcclxuXHQgKi9cclxuXHRxdWFydGVyQWJicmV2aWF0aW9uczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIG5hbWVzXHJcblx0ICovXHJcblx0bG9uZ01vbnRoTmFtZXM6IHN0cmluZ1tdO1xyXG5cdC8qKlxyXG5cdCAqIFRocmVlLWxldHRlciBtb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdHNob3J0TW9udGhOYW1lczogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogTW9udGggbGV0dGVyc1xyXG5cdCAqL1xyXG5cdG1vbnRoTGV0dGVyczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxyXG5cdCAqL1xyXG5cdGxvbmdXZWVrZGF5TmFtZXM6IHN0cmluZ1tdO1xyXG5cdHNob3J0V2Vla2RheU5hbWVzOiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVyczogc3RyaW5nW107XHJcblx0d2Vla2RheUxldHRlcnM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgTE9OR19NT05USF9OQU1FUyA9XHJcblx0W1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcblxyXG5leHBvcnQgY29uc3QgU0hPUlRfTU9OVEhfTkFNRVMgPVxyXG5cdFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBNT05USF9MRVRURVJTID1cclxuXHRbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XHJcblxyXG5leHBvcnQgY29uc3QgTE9OR19XRUVLREFZX05BTUVTID1cclxuXHRbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBTSE9SVF9XRUVLREFZX05BTUVTID1cclxuXHRbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcblxyXG5leHBvcnQgY29uc3QgV0VFS0RBWV9UV09fTEVUVEVSUyA9XHJcblx0W1wiU3VcIiwgXCJNb1wiLCBcIlR1XCIsIFwiV2VcIiwgXCJUaFwiLCBcIkZyXCIsIFwiU2FcIl07XHJcblxyXG5leHBvcnQgY29uc3QgV0VFS0RBWV9MRVRURVJTID1cclxuXHRbXCJTXCIsIFwiTVwiLCBcIlRcIiwgXCJXXCIsIFwiVFwiLCBcIkZcIiwgXCJTXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFFVQVJURVJfTEVUVEVSID0gXCJRXCI7XHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX1dPUkQgPSBcInF1YXJ0ZXJcIjtcclxuZXhwb3J0IGNvbnN0IFFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZPUk1BVF9PUFRJT05TOiBGb3JtYXRPcHRpb25zID0ge1xyXG5cdHF1YXJ0ZXJMZXR0ZXI6IFFVQVJURVJfTEVUVEVSLFxyXG5cdHF1YXJ0ZXJXb3JkOiBRVUFSVEVSX1dPUkQsXHJcblx0cXVhcnRlckFiYnJldmlhdGlvbnM6IFFVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuXHRsb25nTW9udGhOYW1lczogTE9OR19NT05USF9OQU1FUyxcclxuXHRzaG9ydE1vbnRoTmFtZXM6IFNIT1JUX01PTlRIX05BTUVTLFxyXG5cdG1vbnRoTGV0dGVyczogTU9OVEhfTEVUVEVSUyxcclxuXHRsb25nV2Vla2RheU5hbWVzOiBMT05HX1dFRUtEQVlfTkFNRVMsXHJcblx0c2hvcnRXZWVrZGF5TmFtZXM6IFNIT1JUX1dFRUtEQVlfTkFNRVMsXHJcblx0d2Vla2RheVR3b0xldHRlcnM6IFdFRUtEQVlfVFdPX0xFVFRFUlMsXHJcblx0d2Vla2RheUxldHRlcnM6IFdFRUtEQVlfTEVUVEVSU1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIHdpdGggdGhlIGZvcm1hdHRpbmcgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSBsb2NhbFpvbmUgVGhlIHpvbmUgdGhhdCBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQoXHJcblx0ZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsXHJcblx0dXRjVGltZTogVGltZVN0cnVjdCxcclxuXHRsb2NhbFpvbmU6IFRpbWVab25lIHwgbnVsbCxcclxuXHRmb3JtYXRTdHJpbmc6IHN0cmluZyxcclxuXHRmb3JtYXRPcHRpb25zOiBQYXJ0aWFsPEZvcm1hdE9wdGlvbnM+ID0ge31cclxuKTogc3RyaW5nIHtcclxuXHRjb25zdCBtZXJnZWRGb3JtYXRPcHRpb25zOiBQYXJ0aWFsPEZvcm1hdE9wdGlvbnM+ID0ge307XHJcblx0Zm9yIChjb25zdCBuYW1lIGluIERFRkFVTFRfRk9STUFUX09QVElPTlMpIHtcclxuXHRcdGlmIChERUZBVUxUX0ZPUk1BVF9PUFRJT05TLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcblx0XHRcdG1lcmdlZEZvcm1hdE9wdGlvbnNbbmFtZV0gPSAoZm9ybWF0T3B0aW9uc1tuYW1lXSAhPT0gdW5kZWZpbmVkID8gZm9ybWF0T3B0aW9uc1tuYW1lXSA6IERFRkFVTFRfRk9STUFUX09QVElPTlNbbmFtZV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y29uc3QgdG9rZW5pemVyID0gbmV3IFRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG5cdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xyXG5cdFx0bGV0IHRva2VuUmVzdWx0OiBzdHJpbmc7XHJcblx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5ZRUFSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkRm9ybWF0T3B0aW9ucyBhcyBGb3JtYXRPcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRGb3JtYXRPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnMpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUtEQVk6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZEZvcm1hdE9wdGlvbnMgYXMgRm9ybWF0T3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5IT1VSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTUlOVVRFOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IHRva2VuLnJhdztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdHJlc3VsdCArPSB0b2tlblJlc3VsdDtcclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQudHJpbSgpO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0Y29uc3QgQUQ6IGJvb2xlYW4gPSBkYXRlVGltZS55ZWFyID4gMDtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBRFwiIDogXCJCQ1wiKTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQW5ubyBEb21pbmlcIiA6IFwiQmVmb3JlIENocmlzdFwiKTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQVwiIDogXCJCXCIpO1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHllYXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcInlcIjpcclxuXHRcdGNhc2UgXCJZXCI6XHJcblx0XHRjYXNlIFwiclwiOlxyXG5cdFx0XHRsZXQgeWVhclZhbHVlID0gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPT09IDIpIHsgLy8gU3BlY2lhbCBjYXNlOiBleGFjdGx5IHR3byBjaGFyYWN0ZXJzIGFyZSBleHBlY3RlZFxyXG5cdFx0XHRcdHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHllYXJWYWx1ZTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRjb25zdCBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgZm9ybWF0T3B0aW9ucy5xdWFydGVyV29yZDtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1vbnRoLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubW9udGhMZXR0ZXJzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgd2VlayBudW1iZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2VlayhkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRpZiAodG9rZW4uc3ltYm9sID09PSBcIndcIikge1xyXG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIG1vbnRoIChvciB5ZWFyKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXkoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJkXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuZGF5LnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0Y2FzZSBcIkRcIjpcclxuXHRcdFx0Y29uc3QgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF5T2ZZZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0Y29uc3Qgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcclxuXHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuXHRcdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ1dlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDY6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLndlZWtkYXlUd29MZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QpOiBzdHJpbmcge1xyXG5cdHJldHVybiAoZGF0ZVRpbWUuaG91ciA8IDEyID8gXCJBTVwiIDogXCJQTVwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgSG91clxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRIb3VyKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGxldCBob3VyID0gZGF0ZVRpbWUuaG91cjtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcImhcIjpcclxuXHRcdFx0aG91ciA9IGhvdXIgJSAxMjtcclxuXHRcdFx0aWYgKGhvdXIgPT09IDApIHtcclxuXHRcdFx0XHRob3VyID0gMTI7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJIXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJLXCI6XHJcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJrXCI6XHJcblx0XHRcdGlmIChob3VyID09PSAwKSB7XHJcblx0XHRcdFx0aG91ciA9IDI0O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtaW51dGVcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwic1wiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJTXCI6XHJcblx0XHRcdGNvbnN0IGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XHJcblx0XHRcdGxldCBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkTGVmdChmcmFjdGlvbi50b1N0cmluZygpLCAzLCBcIjBcIik7XHJcblx0XHRcdGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xyXG5cdFx0Y2FzZSBcIkFcIjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcclxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZTogVGltZVN0cnVjdCwgdXRjVGltZTogVGltZVN0cnVjdCwgem9uZTogVGltZVpvbmUgfCBudWxsLCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGlmICghem9uZSkge1xyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG5cclxuXHRjb25zdCBvZmZzZXRIb3VyczogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0b2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcblx0Y29uc3Qgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZztcclxuXHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJPXCI6XHJcblx0XHRcdHJlc3VsdCA9IFwiVVRDXCI7XHJcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIitcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0Y2FzZSBcIlpcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0Y29uc3QgbmV3VG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdFx0XHRsZW5ndGg6IDQsXHJcblx0XHRcdFx0XHRcdHJhdzogXCJPT09PXCIsXHJcblx0XHRcdFx0XHRcdHN5bWJvbDogXCJPXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5aT05FXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0cmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJ6XCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInZcIjpcclxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJWXCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0Ly8gTm90IGltcGxlbWVudGVkXHJcblx0XHRcdFx0XHRyZXR1cm4gXCJ1bmtcIjtcclxuXHRcdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5uYW1lKCk7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiBcIlVua25vd25cIjtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwiWFwiOlxyXG5cdFx0Y2FzZSBcInhcIjpcclxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgb2Zmc2V0ID09PSAwKSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiWlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcblx0XHRcdFx0XHRpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IGFueSwgZDI6IGFueSk6IGFueSB7XHJcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0YXNzZXJ0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRhc3NlcnQoKGQxIGluc3RhbmNlb2YgRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBEYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBEdXJhdGlvbiksXHJcblx0XHRcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcblx0cmV0dXJuIGQxLm1pbihkMik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IERhdGVUaW1lLCBkMjogRGF0ZVRpbWUpOiBEYXRlVGltZTtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIER1cmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogRHVyYXRpb24sIGQyOiBEdXJhdGlvbik6IER1cmF0aW9uO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogYW55LCBkMjogYW55KTogYW55IHtcclxuXHRhc3NlcnQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHRhc3NlcnQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGFzc2VydCgoZDEgaW5zdGFuY2VvZiBEYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIERhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBEdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIER1cmF0aW9uKSxcclxuXHRcdFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuXHRyZXR1cm4gZDEubWF4KGQyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhYnMoZDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0YXNzZXJ0KGQsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHRhc3NlcnQoZCBpbnN0YW5jZW9mIER1cmF0aW9uLCBcImZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhIER1cmF0aW9uXCIpO1xyXG5cdHJldHVybiBkLmFicygpO1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVGdW5jdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0LFxyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0VVRDXHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNJbnQobjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0aWYgKG4gPT09IG51bGwgfHwgIWlzRmluaXRlKG4pKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiAoTWF0aC5mbG9vcihuKSA9PT0gbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRTeW0objogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRpZiAobiA8IDApIHtcclxuXHRcdHJldHVybiAtMSAqIE1hdGgucm91bmQoLTEgKiBuKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobik7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXHJcbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdGlmICgvXihcXC18XFwrKT8oWzAtOV0rKFxcLlswLTldKyk/fEluZmluaXR5KSQvLnRlc3QodmFsdWUpKSB7XHJcblx0XHRyZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuXHR9XHJcblx0cmV0dXJuIE5hTjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aXZlTW9kdWxvKHZhbHVlOiBudW1iZXIsIG1vZHVsbzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRhc3NlcnQobW9kdWxvID49IDEsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xyXG5cdGlmICh2YWx1ZSA8IDApIHtcclxuXHRcdHJldHVybiAoKHZhbHVlICUgbW9kdWxvKSArIG1vZHVsbykgJSBtb2R1bG87XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB2YWx1ZSAlIG1vZHVsbztcclxuXHR9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgVG9rZW5pemVyLCBUb2tlbiwgRGF0ZVRpbWVUb2tlblR5cGUgYXMgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcclxuaW1wb3J0IHsgVGltZVpvbmUgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5cclxuLyoqXHJcbiAqIFRpbWVTdHJ1Y3QgcGx1cyB6b25lXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEF3YXJlVGltZVN0cnVjdCB7XHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgc3RydWN0XHJcblx0ICovXHJcblx0dGltZTogVGltZVN0cnVjdDtcclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0em9uZTogVGltZVpvbmUgfCBudWxsO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdG46IG51bWJlcjtcclxuXHRyZW1haW5pbmc6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlWm9uZVJlc3VsdCB7XHJcblx0em9uZTogVGltZVpvbmUgfCBudWxsO1xyXG5cdHJlbWFpbmluZzogc3RyaW5nO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIGRhdGV0aW1lIHN0cmluZyBpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGZvcm1hdFxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXHJcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZWFibGUoZGF0ZVRpbWVTdHJpbmc6IHN0cmluZywgZm9ybWF0U3RyaW5nOiBzdHJpbmcsIGFsbG93VHJhaWxpbmc6IGJvb2xlYW4gPSB0cnVlKTogYm9vbGVhbiB7XHJcblx0dHJ5IHtcclxuXHRcdHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHVuZGVmaW5lZCwgYWxsb3dUcmFpbGluZyk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogUGFyc2UgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIGFzc3VtaW5nIHRoZSBnaXZlbiBmb3JtYXQuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHBhcnNlXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShcclxuXHRkYXRlVGltZVN0cmluZzogc3RyaW5nLCBmb3JtYXRTdHJpbmc6IHN0cmluZywgb3ZlcnJpZGVab25lPzogVGltZVpvbmUgfCBudWxsLCBhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZVxyXG4pOiBBd2FyZVRpbWVTdHJ1Y3Qge1xyXG5cdGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIGRhdGUgZ2l2ZW5cIik7XHJcblx0fVxyXG5cdGlmICghZm9ybWF0U3RyaW5nKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBmb3JtYXQgZ2l2ZW5cIik7XHJcblx0fVxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XHJcblx0XHRjb25zdCB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRcdGNvbnN0IHRpbWU6IFRpbWVDb21wb25lbnRPcHRzID0geyB5ZWFyOiAtMSB9O1xyXG5cdFx0bGV0IHpvbmU6IFRpbWVab25lIHwgbnVsbCA9IG51bGw7XHJcblx0XHRsZXQgcG5yOiBQYXJzZU51bWJlclJlc3VsdDtcclxuXHRcdGxldCBwenI6IFBhcnNlWm9uZVJlc3VsdDtcclxuXHRcdGxldCByZW1haW5pbmc6IHN0cmluZyA9IGRhdGVUaW1lU3RyaW5nO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XHJcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUueWVhciA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLm1vbnRoID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUuZGF5ID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUubWludXRlID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcInNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IHBuci5uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLm1pbGxpID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJyR7dG9rZW4ucmF3fSdgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XHJcblx0XHRcdFx0XHRwenIgPSBzdHJpcFpvbmUocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHB6ci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHN0cmlwUmF3KHJlbWFpbmluZywgdG9rZW4ucmF3KTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgcmVzdWx0OiBBd2FyZVRpbWVTdHJ1Y3QgPSB7IHRpbWU6IG5ldyBUaW1lU3RydWN0KHRpbWUpLCB6b25lOiAoem9uZSA/IHpvbmUgOiBudWxsKSB9O1xyXG5cdFx0aWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInJlc3VsdGluZyBkYXRlIGludmFsaWRcIik7XHJcblx0XHR9XHJcblx0XHQvLyBhbHdheXMgb3ZlcndyaXRlIHpvbmUgd2l0aCBnaXZlbiB6b25lXHJcblx0XHRpZiAob3ZlcnJpZGVab25lKSB7XHJcblx0XHRcdHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHJlbWFpbmluZyAmJiAhYWxsb3dUcmFpbGluZykge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXHJcblx0XHRcdFx0YGludmFsaWQgZGF0ZSAnJHtkYXRlVGltZVN0cmluZ30nIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICcke2Zvcm1hdFN0cmluZ30nOiB0cmFpbGluZyBjaGFyYWN0ZXJzOiAncmVtYWluaW5nJ2BcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogJHtlLm1lc3NhZ2V9YCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gc3RyaXBOdW1iZXIoczogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdGNvbnN0IHJlc3VsdDogUGFyc2VOdW1iZXJSZXN1bHQgPSB7XHJcblx0XHRuOiBOYU4sXHJcblx0XHRyZW1haW5pbmc6IHNcclxuXHR9O1xyXG5cdGxldCBudW1iZXJTdHJpbmcgPSBcIlwiO1xyXG5cdHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkubWF0Y2goL1xcZC8pKSB7XHJcblx0XHRudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xyXG5cdHdoaWxlIChudW1iZXJTdHJpbmcuY2hhckF0KDApID09PSBcIjBcIiAmJiBudW1iZXJTdHJpbmcubGVuZ3RoID4gMSkge1xyXG5cdFx0bnVtYmVyU3RyaW5nID0gbnVtYmVyU3RyaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0cmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcclxuXHRpZiAobnVtYmVyU3RyaW5nID09PSBcIlwiIHx8ICFpc0Zpbml0ZShyZXN1bHQubikpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnJHtudW1iZXJTdHJpbmd9J2ApO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5jb25zdCBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcclxuXHJcbmZ1bmN0aW9uIHN0cmlwWm9uZShzOiBzdHJpbmcpOiBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdGlmIChzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcclxuXHR9XHJcblx0Y29uc3QgcmVzdWx0OiBQYXJzZVpvbmVSZXN1bHQgPSB7XHJcblx0XHR6b25lOiBudWxsLFxyXG5cdFx0cmVtYWluaW5nOiBzXHJcblx0fTtcclxuXHRsZXQgem9uZVN0cmluZyA9IFwiXCI7XHJcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiBXSElURVNQQUNFLmluZGV4T2YocmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkpID09PSAtMSkge1xyXG5cdFx0em9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuXHRcdHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0cmVzdWx0LnpvbmUgPSBUaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwUmF3KHM6IHN0cmluZywgZXhwZWN0ZWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0bGV0IHJlbWFpbmluZyA9IHM7XHJcblx0bGV0IGVyZW1haW5pbmcgPSBleHBlY3RlZDtcclxuXHR3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XHJcblx0XHRyZW1haW5pbmcgPSByZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdFx0ZXJlbWFpbmluZyA9IGVyZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHRpZiAoZXJlbWFpbmluZy5sZW5ndGggPiAwKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkICcke2V4cGVjdGVkfSdgKTtcclxuXHR9XHJcblx0cmV0dXJuIHJlbWFpbmluZztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IFRpbWVVbml0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gXCIuL2RhdGV0aW1lXCI7XHJcbmltcG9ydCB7IFRpbWVab25lLCBUaW1lWm9uZUtpbmQgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5cclxuLyoqXHJcbiAqIFNwZWNpZmllcyBob3cgdGhlIHBlcmlvZCBzaG91bGQgcmVwZWF0IGFjcm9zcyB0aGUgZGF5XHJcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICovXHJcbmV4cG9ydCBlbnVtIFBlcmlvZERzdCB7XHJcblx0LyoqXHJcblx0ICogS2VlcCByZXBlYXRpbmcgaW4gc2ltaWxhciBpbnRlcnZhbHMgbWVhc3VyZWQgaW4gVVRDLFxyXG5cdCAqIHVuYWZmZWN0ZWQgYnkgRGF5bGlnaHQgU2F2aW5nIFRpbWUuXHJcblx0ICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcclxuXHQgKiBldmVyeSB0aW1lLCBldmVuIGluIGEgdGltZSB6b25lIHdpdGggRFNULlxyXG5cdCAqIExlYXAgc2Vjb25kcywgbGVhcCBkYXlzIGFuZCBtb250aCBsZW5ndGhcclxuXHQgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXHJcblx0ICovXHJcblx0UmVndWxhckludGVydmFscyxcclxuXHJcblx0LyoqXHJcblx0ICogRW5zdXJlIHRoYXQgdGhlIHRpbWUgYXQgd2hpY2ggdGhlIGludGVydmFscyBvY2N1ciBzdGF5XHJcblx0ICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxyXG5cdCAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXHJcblx0ICogd2lsbCBhbHdheXMgcmVmZXJlbmNlIGF0IDg6MDUgRXVyb3BlL0Ftc3RlcmRhbS4gVGhpcyBtZWFucyB0aGF0XHJcblx0ICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcclxuXHQgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcblx0ICogQW5vdGhlciBleGFtcGxlOiBhbiBob3VybHkgaW50ZXJ2YWwgd2lsbCBiZSBob3VybHkgaW4gbG9jYWwgdGltZSxcclxuXHQgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxyXG5cdCAqL1xyXG5cdFJlZ3VsYXJMb2NhbFRpbWUsXHJcblxyXG5cdC8qKlxyXG5cdCAqIEVuZC1vZi1lbnVtIG1hcmtlclxyXG5cdCAqL1xyXG5cdE1BWFxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBhIFBlcmlvZERzdCB0byBhIHN0cmluZzogXCJyZWd1bGFyIGludGVydmFsc1wiIG9yIFwicmVndWxhciBsb2NhbCB0aW1lXCJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwZXJpb2REc3RUb1N0cmluZyhwOiBQZXJpb2REc3QpOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAocCkge1xyXG5cdFx0Y2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcclxuXHRcdGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU6IHJldHVybiBcInJlZ3VsYXIgbG9jYWwgdGltZVwiO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gUGVyaW9kRHN0XCIpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogUmVwZWF0aW5nIHRpbWUgcGVyaW9kOiBjb25zaXN0cyBvZiBhIHJlZmVyZW5jZSBkYXRlIGFuZFxyXG4gKiBhIHRpbWUgbGVuZ3RoLiBUaGlzIGNsYXNzIGFjY291bnRzIGZvciBsZWFwIHNlY29uZHMgYW5kIGxlYXAgZGF5cy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQZXJpb2Qge1xyXG5cclxuXHQvKipcclxuXHQgKiBSZWZlcmVuY2UgbW9tZW50IG9mIHBlcmlvZFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3JlZmVyZW5jZTogRGF0ZVRpbWU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEludGVydmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50ZXJ2YWw6IER1cmF0aW9uO1xyXG5cclxuXHQvKipcclxuXHQgKiBEU1QgaGFuZGxpbmdcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kc3Q6IFBlcmlvZERzdDtcclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplZCByZWZlcmVuY2UgZGF0ZSwgaGFzIGRheS1vZi1tb250aCA8PSAyOCBmb3IgTW9udGhseVxyXG5cdCAqIHBlcmlvZCwgb3IgZm9yIFllYXJseSBwZXJpb2QgaWYgbW9udGggaXMgRmVicnVhcnlcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnRSZWZlcmVuY2U6IERhdGVUaW1lO1xyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVkIGludGVydmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50SW50ZXJ2YWw6IER1cmF0aW9uO1xyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVkIGludGVybmFsIERTVCBoYW5kbGluZy4gSWYgRFNUIGhhbmRsaW5nIGlzIGlycmVsZXZhbnRcclxuXHQgKiAoYmVjYXVzZSB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBkb2VzIG5vdCBoYXZlIERTVClcclxuXHQgKiB0aGVuIGl0IGlzIHNldCB0byBSZWd1bGFySW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnREc3Q6IFBlcmlvZERzdDtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBMSU1JVEFUSU9OOiBpZiBkc3QgZXF1YWxzIFJlZ3VsYXJMb2NhbFRpbWUsIGFuZCB1bml0IGlzIFNlY29uZCwgTWludXRlIG9yIEhvdXIsXHJcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxyXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3RcclxuXHQgKiBpbXBsZW1lbnRlZCBhbmQgeW91IHdpbGwgZ2V0IGFuIGFzc2VydC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBkYXRlIG9mIHRoZSBwZXJpb2QuIElmIHRoZSBwZXJpb2QgaXMgaW4gTW9udGhzIG9yIFllYXJzLCBhbmRcclxuXHQgKlx0XHRcdFx0dGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXHJcblx0ICogQHBhcmFtIGludGVydmFsXHRUaGUgaW50ZXJ2YWwgb2YgdGhlIHBlcmlvZFxyXG5cdCAqIEBwYXJhbSBkc3RcdFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcclxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxyXG5cdCAqICAgICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcclxuXHRcdGludGVydmFsOiBEdXJhdGlvbixcclxuXHRcdGRzdD86IFBlcmlvZERzdFxyXG5cdCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBMSU1JVEFUSU9OOiBpZiBkc3QgZXF1YWxzIFJlZ3VsYXJMb2NhbFRpbWUsIGFuZCB1bml0IGlzIFNlY29uZCwgTWludXRlIG9yIEhvdXIsXHJcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxyXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3RcclxuXHQgKiBpbXBsZW1lbnRlZCBhbmQgeW91IHdpbGwgZ2V0IGFuIGFzc2VydC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXHJcblx0ICpcdFx0XHRcdHRoZSBkYXkgaXMgMjkgb3IgMzAgb3IgMzEsIHRoZSByZXN1bHRzIGFyZSBtYXhpbWlzZWQgdG8gZW5kLW9mLW1vbnRoLlxyXG5cdCAqIEBwYXJhbSBhbW91bnRcdFRoZSBhbW91bnQgb2YgdW5pdHMuXHJcblx0ICogQHBhcmFtIHVuaXRcdFRoZSB1bml0LlxyXG5cdCAqIEBwYXJhbSBkc3RcdFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcclxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxyXG5cdCAqICAgICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcclxuXHRcdGFtb3VudDogbnVtYmVyLFxyXG5cdFx0dW5pdDogVGltZVVuaXQsXHJcblx0XHRkc3Q/OiBQZXJpb2REc3RcclxuXHQpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLiBTZWUgb3RoZXIgY29uc3RydWN0b3JzIGZvciBleHBsYW5hdGlvbi5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXHJcblx0XHRhbW91bnRPckludGVydmFsOiBhbnksXHJcblx0XHR1bml0T3JEc3Q/OiBhbnksXHJcblx0XHRnaXZlbkRzdD86IFBlcmlvZERzdFxyXG5cdCkge1xyXG5cclxuXHRcdGxldCBpbnRlcnZhbDogRHVyYXRpb247XHJcblx0XHRsZXQgZHN0OiBQZXJpb2REc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuXHRcdGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGludGVydmFsID0gPER1cmF0aW9uPmFtb3VudE9ySW50ZXJ2YWw7XHJcblx0XHRcdGRzdCA9IDxQZXJpb2REc3Q+dW5pdE9yRHN0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiB1bml0T3JEc3QgPT09IFwibnVtYmVyXCIgJiYgdW5pdE9yRHN0ID49IDAgJiYgdW5pdE9yRHN0IDwgVGltZVVuaXQuTUFYLCBcIkludmFsaWQgdW5pdFwiKTtcclxuXHRcdFx0aW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oPG51bWJlcj5hbW91bnRPckludGVydmFsLCA8VGltZVVuaXQ+dW5pdE9yRHN0KTtcclxuXHRcdFx0ZHN0ID0gZ2l2ZW5Ec3QgYXMgUGVyaW9kRHN0O1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0ZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcblx0XHR9XHJcblx0XHRhc3NlcnQoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xyXG5cdFx0YXNzZXJ0KCEhcmVmZXJlbmNlLCBcIlJlZmVyZW5jZSB0aW1lIG5vdCBnaXZlblwiKTtcclxuXHRcdGFzc2VydChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xyXG5cdFx0YXNzZXJ0KE1hdGguZmxvb3IoaW50ZXJ2YWwuYW1vdW50KCkpID09PSBpbnRlcnZhbC5hbW91bnQoKSwgXCJBbW91bnQgbXVzdCBiZSBhIHdob2xlIG51bWJlclwiKTtcclxuXHJcblx0XHR0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XHJcblx0XHR0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xyXG5cdFx0dGhpcy5fZHN0ID0gZHN0O1xyXG5cdFx0dGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XHJcblxyXG5cdFx0Ly8gcmVndWxhciBsb2NhbCB0aW1lIGtlZXBpbmcgaXMgb25seSBzdXBwb3J0ZWQgaWYgd2UgY2FuIHJlc2V0IGVhY2ggZGF5XHJcblx0XHQvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXHJcblx0XHQvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxyXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkgJiYgZHN0ID09PSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZSkge1xyXG5cdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMDAwMCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdGFzc2VydCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwLFxyXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAyNCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IFBlcmlvZCB7XHJcblx0XHRyZXR1cm4gbmV3IFBlcmlvZCh0aGlzLl9yZWZlcmVuY2UsIHRoaXMuX2ludGVydmFsLCB0aGlzLl9kc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0ICovXHJcblx0cHVibGljIHJlZmVyZW5jZSgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydCgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIGludGVydmFsKCk6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGFtb3VudCBvZiB1bml0cyBvZiB0aGUgaW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGRzdCBoYW5kbGluZyBtb2RlXHJcblx0ICovXHJcblx0cHVibGljIGRzdCgpOiBQZXJpb2REc3Qge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgZ3JlYXRlciB0aGFuXHJcblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYWZ0ZXIgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuXHQgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuXHJcblx0ICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZEZpcnN0KGZyb21EYXRlOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLFxyXG5cdFx0XHRcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcblx0XHRsZXQgYXBwcm94OiBEYXRlVGltZTtcclxuXHRcdGxldCBhcHByb3gyOiBEYXRlVGltZTtcclxuXHRcdGxldCBhcHByb3hNaW46IERhdGVUaW1lO1xyXG5cdFx0bGV0IHBlcmlvZHM6IG51bWJlcjtcclxuXHRcdGxldCBkaWZmOiBudW1iZXI7XHJcblx0XHRsZXQgbmV3WWVhcjogbnVtYmVyO1xyXG5cdFx0bGV0IHJlbWFpbmRlcjogbnVtYmVyO1xyXG5cdFx0bGV0IGltYXg6IG51bWJlcjtcclxuXHRcdGxldCBpbWluOiBudW1iZXI7XHJcblx0XHRsZXQgaW1pZDogbnVtYmVyO1xyXG5cclxuXHRcdGNvbnN0IG5vcm1hbEZyb20gPSB0aGlzLl9ub3JtYWxpemVEYXkoZnJvbURhdGUudG9ab25lKHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpKTtcclxuXHJcblx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcclxuXHRcdFx0Ly8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXHJcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcblx0XHRcdFx0Ly8gYXBwbHkgdG8gVVRDIHRpbWVcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgaW50ZXJ2YWxzXHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gQW1vdW50IGlzIG5vdCAxLFxyXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHQvLyBvbmx5IDI1IGxlYXAgc2Vjb25kcyBoYXZlIGV2ZXIgYmVlbiBhZGRlZCBzbyB0aGlzIHNob3VsZCBzdGlsbCBiZSBPSy5cclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcclxuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlllYXIpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCB0aW1lcy4gSWYgdGhlIHVuaXQgaXMgbGVzcyB0aGFuIGEgZGF5LCB3ZSByZWZlcmVuY2UgZWFjaCBkYXkgYW5ld1xyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxMDAwICYmICgxMDAwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcblx0XHRcdFx0XHRcdFx0Ly8gbWludXMgb25lIHNlY29uZCB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWlsbGlzZWNvbmRzXHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LlNlY29uZCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cclxuXHRcdFx0XHRcdFx0XHQvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIHRvZG9cclxuXHRcdFx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpbWluID0gMDtcclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG5cdFx0XHRcdFx0XHRcdFx0aW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94MjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIHNlY29uZCBlYWNoIG1pbnV0ZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5NaW51dGUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2VcclxuXHRcdFx0XHRcdFx0XHQvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpbWluID0gMDtcclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG5cdFx0XHRcdFx0XHRcdFx0aW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1pbiA9IGltaWQgKyAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1heCA9IGltaWQgLSAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgaG91ciB0aGlzLl9pbnRSZWZlcmVuY2VhcnkgZWFjaCB0aW1lLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlIG1pbnVzIG9uZSBob3VyXHJcblx0XHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LkhvdXIpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGZpdCBpbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcHJldmlvdXMgZGF5XHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuXHRcdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCgyNCAqIDYwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWludXRlKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuXHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoMjQgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xyXG5cdFx0XHRcdFx0XHRcdChub3JtYWxGcm9tLm1vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0bmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRuZXdZZWFyLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KGFwcHJveCkuY29udmVydChmcm9tRGF0ZS56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGhhcyBNVUNIIGJldHRlciBwZXJmb3JtYW5jZSB0aGFuIGZpbmRGaXJzdC5cclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cclxuXHQgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gYWRkLiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG5cdCAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmROZXh0KHByZXY6IERhdGVUaW1lLCBjb3VudDogbnVtYmVyID0gMSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xyXG5cdFx0YXNzZXJ0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSxcclxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcblx0XHRhc3NlcnQodHlwZW9mIChjb3VudCkgPT09IFwibnVtYmVyXCIsIFwiQ291bnQgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xyXG5cdFx0Y29uc3Qgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xyXG5cdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKFxyXG5cdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSlcclxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKFxyXG5cdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSlcclxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cclxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXHJcblx0ICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuXHQgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG5cdCAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cclxuXHQgKlx0XHRcdGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBmaW5kTGFzdChmcm9tOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGxldCByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHRoaXMuZmluZEZpcnN0KGZyb20pKTtcclxuXHRcdGlmIChyZXN1bHQuZXF1YWxzKGZyb20pKSB7XHJcblx0XHRcdHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuXHQgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcblx0ICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZFByZXYobmV4dDogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuZmluZE5leHQobmV4dCwgLTEgKiBjb3VudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyBvbiBhIHBlcmlvZCBib3VuZGFyeVxyXG5cdCAqIChleHBlbnNpdmUhKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpc0JvdW5kYXJ5KG9jY3VycmVuY2U6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoIW9jY3VycmVuY2UpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KFxyXG5cdFx0XHQhIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksXHJcblx0XHRcdFwiVGhlIG9jY3VycmVuY2UgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIlxyXG5cdFx0KTtcclxuXHRcdHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoRHVyYXRpb24ubWlsbGlzZWNvbmRzKDEpKSkuZXF1YWxzKG9jY3VycmVuY2UpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBwZXJpb2QgaGFzIHRoZSBzYW1lIGVmZmVjdCBhcyB0aGUgZ2l2ZW4gb25lLlxyXG5cdCAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxyXG5cdCAqIGFuZCBzYW1lIGRzdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcclxuXHRcdC8vIG5vdGUgd2UgdGFrZSB0aGUgbm9uLW5vcm1hbGl6ZWQgX3JlZmVyZW5jZSBiZWNhdXNlIHRoaXMgaGFzIGFuIGluZmx1ZW5jZSBvbiB0aGUgb3V0Y29tZVxyXG5cdFx0aWYgKCF0aGlzLmlzQm91bmRhcnkob3RoZXIuX3JlZmVyZW5jZSkgfHwgIXRoaXMuX2ludEludGVydmFsLmVxdWFscyhvdGhlci5faW50SW50ZXJ2YWwpKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGNvbnN0IHJlZlpvbmUgPSB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpO1xyXG5cdFx0Y29uc3Qgb3RoZXJab25lID0gb3RoZXIuX3JlZmVyZW5jZS56b25lKCk7XHJcblx0XHRjb25zdCB0aGlzSXNSZWd1bGFyID0gKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIXJlZlpvbmUgfHwgcmVmWm9uZS5pc1V0YygpKTtcclxuXHRcdGNvbnN0IG90aGVySXNSZWd1bGFyID0gKG90aGVyLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFvdGhlclpvbmUgfHwgb3RoZXJab25lLmlzVXRjKCkpO1xyXG5cdFx0aWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0ICYmIHJlZlpvbmUgJiYgb3RoZXJab25lICYmIHJlZlpvbmUuZXF1YWxzKG90aGVyWm9uZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5fcmVmZXJlbmNlLmlkZW50aWNhbChvdGhlci5fcmVmZXJlbmNlKVxyXG5cdFx0XHQmJiB0aGlzLl9pbnRlcnZhbC5pZGVudGljYWwob3RoZXIuX2ludGVydmFsKVxyXG5cdFx0XHQmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhbiBJU08gZHVyYXRpb24gc3RyaW5nIGUuZy5cclxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMUhcclxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXHJcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFNICAgKG9uZSBtb250aClcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2UudG9Jc29TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5faW50ZXJ2YWwudG9Jc29TdHJpbmcoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGUuZy5cclxuXHQgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xyXG5cdFx0Ly8gb25seSBhZGQgdGhlIERTVCBoYW5kbGluZyBpZiBpdCBpcyByZWxldmFudFxyXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuXHRcdFx0cmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltQZXJpb2Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb3JyZWN0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIF9yZWZlcmVuY2UgYW5kIF9pbnRSZWZlcmVuY2UuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfY29ycmVjdERheShkOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIE1hdGgubWluKGJhc2ljcy5kYXlzSW5Nb250aChkLnllYXIoKSwgZC5tb250aCgpKSwgdGhpcy5fcmVmZXJlbmNlLmRheSgpKSxcclxuXHRcdFx0XHRkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIElmIHRoaXMuX2ludGVybmFsVW5pdCBpbiBbTW9udGgsIFllYXJdLCBub3JtYWxpemVzIHRoZSBkYXktb2YtbW9udGhcclxuXHQgKiB0byA8PSAyOC5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IGRhdGUgaWYgZGlmZmVyZW50LCBvdGhlcndpc2UgdGhlIGV4YWN0IHNhbWUgb2JqZWN0IChubyBjbG9uZSEpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbm9ybWFsaXplRGF5KGQ6IERhdGVUaW1lLCBhbnltb250aDogYm9vbGVhbiA9IHRydWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxyXG5cdFx0XHR8fCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBUaW1lVW5pdC5ZZWFyICYmIChkLm1vbnRoKCkgPT09IDIgfHwgYW55bW9udGgpICYmIGQuZGF5KCkgPiAyOClcclxuXHRcdFx0KSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0ZC55ZWFyKCksIGQubW9udGgoKSwgMjgsXHJcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksXHJcblx0XHRcdFx0ZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmIERTVCBoYW5kbGluZyBpcyByZWxldmFudCBmb3IgdXMuXHJcblx0ICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kc3RSZWxldmFudCgpOiBib29sZWFuIHtcclxuXHRcdGxldCB6b25lID0gdGhpcy5fcmVmZXJlbmNlLnpvbmUoKTtcclxuXHRcdHJldHVybiAhISh6b25lXHJcblx0XHRcdCYmIHpvbmUua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXHJcblx0XHRcdCYmIHpvbmUuaGFzRHN0KClcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgdGhlIHZhbHVlcyB3aGVyZSBwb3NzaWJsZSAtIG5vdCBhbGwgdmFsdWVzXHJcblx0ICogYXJlIGNvbnZlcnRpYmxlIGludG8gb25lIGFub3RoZXIuIFdlZWtzIGFyZSBjb252ZXJ0ZWQgdG8gZGF5cy5cclxuXHQgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxyXG5cdCAqIGJ1dCBzZWNvbmRzIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZCB0byBtaW51dGVzIGR1ZSB0byBsZWFwIHNlY29uZHMuXHJcblx0ICogV2Vla3MgYXJlIGNvbnZlcnRlZCBiYWNrIHRvIGRheXMuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfY2FsY0ludGVybmFsVmFsdWVzKCk6IHZvaWQge1xyXG5cdFx0Ly8gbm9ybWFsaXplIGFueSBhYm92ZS11bml0IHZhbHVlc1xyXG5cdFx0bGV0IGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG5cdFx0bGV0IGludFVuaXQgPSB0aGlzLl9pbnRlcnZhbC51bml0KCk7XHJcblxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcclxuXHRcdFx0Ly8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDEwMDA7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTWludXRlICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuSG91ciAmJiBpbnRBbW91bnQgPj0gMjQgJiYgaW50QW1vdW50ICUgMjQgPT09IDApIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHR9XHJcblx0XHQvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LldlZWspIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50ICogNztcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdH1cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2ludEludGVydmFsID0gbmV3IER1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XHJcblxyXG5cdFx0Ly8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xyXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuXHRcdFx0dGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gbm9ybWFsaXplIHJlZmVyZW5jZSBkYXlcclxuXHRcdHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcclxuXHR9XHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZExlZnQoczogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuXHRcdHBhZGRpbmcgKz0gY2hhcjtcclxuXHR9XHJcblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZFJpZ2h0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEZvciB0ZXN0aW5nIHB1cnBvc2VzLCB3ZSBvZnRlbiBuZWVkIHRvIG1hbmlwdWxhdGUgd2hhdCB0aGUgY3VycmVudFxyXG4gKiB0aW1lIGlzLiBUaGlzIGlzIGFuIGludGVyZmFjZSBmb3IgYSBjdXN0b20gdGltZSBzb3VyY2Ugb2JqZWN0XHJcbiAqIHNvIGluIHRlc3RzIHlvdSBjYW4gdXNlIGEgY3VzdG9tIHRpbWUgc291cmNlLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lU291cmNlIHtcclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIGN1cnJlbnQgZGF0ZSt0aW1lIGFzIGEgamF2YXNjcmlwdCBEYXRlIG9iamVjdFxyXG5cdCAqL1xyXG5cdG5vdygpOiBEYXRlO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB0aW1lIHNvdXJjZSwgcmV0dXJucyBhY3R1YWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJlYWxUaW1lU291cmNlIGltcGxlbWVudHMgVGltZVNvdXJjZSB7XHJcblx0bm93KCk6IERhdGUge1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcbmltcG9ydCAgeyBOb3JtYWxpemVPcHRpb24sIFR6RGF0YWJhc2UgfSBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsKCk6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUubG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHV0YygpOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLnV0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIG9mZnNldCBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzAuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAcmV0dXJucyBhIHRpbWUgem9uZSB3aXRoIHRoZSBnaXZlbiBmaXhlZCBvZmZzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XHJcblxyXG4vKipcclxuICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqIEBwYXJhbSBzIEVtcHR5IHN0cmluZyBmb3Igbm8gdGltZSB6b25lIChudWxsIGlzIHJldHVybmVkKSxcclxuICogICAgICAgICAgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcclxuICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxyXG4gKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXHJcbiAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcbiAqICAgICAgICAgICAgICBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShuYW1lOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcclxuXHJcbi8qKlxyXG4gKiBTZWUgdGhlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIG90aGVyIHpvbmUoKSBtZXRob2Qgc2lnbmF0dXJlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKGE6IGFueSwgZHN0PzogYm9vbGVhbik6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUuem9uZShhLCBkc3QpO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUaW1lWm9uZUtpbmQge1xyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxyXG5cdCAqL1xyXG5cdExvY2FsLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICovXHJcblx0T2Zmc2V0LFxyXG5cdC8qKlxyXG5cdCAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xyXG5cdCAqIERTVCBpZiBhcHBsaWNhYmxlLlxyXG5cdCAqL1xyXG5cdFByb3BlclxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcclxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXHJcbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxyXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXHJcbiAqXHJcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcclxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxyXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRpbWVab25lIHtcclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGlkZW50aWZpZXI6XHJcblx0ICogIFwibG9jYWx0aW1lXCIgc3RyaW5nIGZvciBsb2NhbCB0aW1lXHJcblx0ICogIEUuZy4gXCItMDE6MzBcIiBmb3IgYSBmaXhlZCBvZmZzZXQgZnJvbSBVVENcclxuXHQgKiAgRS5nLiBcIlVUQ1wiIG9yIFwiRXVyb3BlL0Ftc3RlcmRhbVwiIGZvciBhbiBPbHNlbiBUWiBkYXRhYmFzZSB0aW1lXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RzdDogYm9vbGVhbjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIHNwZWNpZmllZCBieSBfbmFtZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2tpbmQ6IFRpbWVab25lS2luZDtcclxuXHJcblx0LyoqXHJcblx0ICogT25seSBmb3IgZml4ZWQgb2Zmc2V0czogdGhlIG9mZnNldCBpbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfb2Zmc2V0OiBudW1iZXI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZS4gTm90ZSB0aGF0XHJcblx0ICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXHJcblx0ICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbG9jYWwoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJsb2NhbHRpbWVcIiwgdHJ1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgVVRDIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHV0YygpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcIlVUQ1wiLCB0cnVlKTsgLy8gdXNlICd0cnVlJyBmb3IgRFNUIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBkaXNwbGF5IGFzIFwiVVRDXCIsIG5vdCBcIlVUQyB3aXRob3V0IERTVFwiXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgd2l0aCBhIGZpeGVkIG9mZnNldFxyXG5cdCAqIEBwYXJhbSBvZmZzZXRcdG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMsIGUuZy4gOTAgZm9yICswMTozMFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcblx0ICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG5cdCAqIEBwYXJhbSBzIEVtcHR5IHN0cmluZyBmb3Igbm8gdGltZSB6b25lIChudWxsIGlzIHJldHVybmVkKSxcclxuXHQgKiAgICAgICAgICBcImxvY2FsdGltZVwiIGZvciBsb2NhbCB0aW1lLFxyXG5cdCAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXHJcblx0ICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxyXG5cdCAqICAgICAgICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHpfZGF0YWJhc2VfdGltZV96b25lc1xyXG5cdCAqICAgICAgICAgIFRaIGRhdGFiYXNlIHpvbmUgbmFtZSBtYXkgYmUgc3VmZml4ZWQgd2l0aCBcIiB3aXRob3V0IERTVFwiIHRvIGluZGljYXRlIG5vIERTVCBzaG91bGQgYmUgYXBwbGllZC5cclxuXHQgKiAgICAgICAgICBJbiB0aGF0IGNhc2UsIHRoZSBkc3QgcGFyYW1ldGVyIGlzIGlnbm9yZWQuXHJcblx0ICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXHJcblx0ICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcclxuXHQgKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgem9uZShzOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBpbXBsZW1lbnRhdGlvbnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUoYTogYW55LCBkc3Q6IGJvb2xlYW4gPSB0cnVlKTogVGltZVpvbmUge1xyXG5cdFx0bGV0IG5hbWUgPSBcIlwiO1xyXG5cdFx0c3dpdGNoICh0eXBlb2YgKGEpKSB7XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xyXG5cdFx0XHRcdGxldCBzID0gPHN0cmluZz5hO1xyXG5cdFx0XHRcdGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XHJcblx0XHRcdFx0XHRkc3QgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHMgPSBzLnNsaWNlKDAsIHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpIC0gMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcclxuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IDxudW1iZXI+YTtcclxuXHRcdFx0XHRhc3NlcnQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRcdFx0bmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVGltZVpvbmUuem9uZSgpOiBVbmV4cGVjdGVkIGFyZ3VtZW50IHR5cGUgXFxcIlwiICsgdHlwZW9mIChhKSArIFwiXFxcIlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShuYW1lLCBkc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xyXG5cdCAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cclxuXHQgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxyXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbiA9IHRydWUpIHtcclxuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xyXG5cdFx0dGhpcy5fZHN0ID0gZHN0O1xyXG5cdFx0aWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcclxuXHRcdH0gZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5PZmZzZXQ7XHJcblx0XHRcdHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Qcm9wZXI7XHJcblx0XHRcdGFzc2VydChUekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBgbm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICcke25hbWV9J2ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGNhY2hlZCB5b3Ugd2lsbCBOT1RcclxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXHJcblx0ICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBuYW1lKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZHN0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBraW5kKCk6IFRpbWVab25lS2luZCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fa2luZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xyXG5cdCAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XHJcblx0XHRpZiAodGhpcy5pc1V0YygpICYmIG90aGVyLmlzVXRjKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuXHRcdFx0XHQmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxyXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogVGltZVpvbmUpOiBib29sZWFuIHtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cclxuXHQgKi9cclxuXHRwdWJsaWMgaXNVdGMoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgaW5jbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXHJcblxcXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhcclxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxyXG5cdFx0XHRcdFx0dXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaVxyXG5cdFx0XHRcdCkpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBzdGFuZGFyZCBvZmZzZXQgZXhjbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXHJcblx0ICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBudW1iZXI7XHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgMCwgMSwgMCkpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGltZXpvbmUgb2Zmc2V0IGZyb20gYSB6b25lLWxvY2FsIHRpbWUgKE5PVCBhIFVUQyB0aW1lKS5cclxuXHQgKiBAcGFyYW0geWVhciBsb2NhbCBmdWxsIHllYXJcclxuXHQgKiBAcGFyYW0gbW9udGggbG9jYWwgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBkYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXkgbG9jYWwgZGF5IG9mIG1vbnRoIDEtMzFcclxuXHQgKiBAcGFyYW0gaG91ciBsb2NhbCBob3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlIGxvY2FsIG1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZCBsb2NhbCBzZWNvbmQgMC01OVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBsb2NhbCBtaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKGxvY2FsVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZSh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XHJcblx0cHVibGljIG9mZnNldEZvclpvbmUoXHJcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IGxvY2FsVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBUaW1lU3RydWN0ID8gYSA6IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSBhcyBudW1iZXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSk7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoXHJcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSxcclxuXHRcdFx0XHRcdGxvY2FsVGltZS5jb21wb25lbnRzLmhvdXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taWxsaVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcblx0XHRcdFx0Ly8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XHJcblx0XHRcdFx0aWYgKHRoaXMuX2RzdCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuXHQgKlxyXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjRGF0ZShkYXRlOiBEYXRlLCBmdW5jczogRGF0ZUZ1bmN0aW9ucyk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuXHQgKlxyXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZURhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMub2Zmc2V0Rm9yWm9uZShUaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBab25lIGFiYnJldmlhdGlvbiBhdCBnaXZlbiBVVEMgdGltZXN0YW1wIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyIEZ1bGwgeWVhclxyXG5cdCAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXHJcblx0ICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyIEhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGUgTWludXRlIDAtNTlcclxuXHQgKiBAcGFyYW0gc2Vjb25kIFNlY29uZCAwLTU5XHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kIE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqXHJcblx0ICogQHJldHVybiBcImxvY2FsXCIgZm9yIGxvY2FsIHRpbWV6b25lLCB0aGUgb2Zmc2V0IGZvciBhbiBvZmZzZXQgem9uZSwgb3IgdGhlIGFiYnJldmlhdGlvbiBmb3IgYSBwcm9wZXIgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxyXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBkc3REZXBlbmRlbnQ/OiBib29sZWFuXHJcblx0KTogc3RyaW5nO1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGModXRjVGltZTogVGltZVN0cnVjdCwgZHN0RGVwZW5kZW50PzogYm9vbGVhbik6IHN0cmluZztcclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIGI/OiBudW1iZXIgfCBib29sZWFuLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgYz86IGJvb2xlYW5cclxuXHQpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3Q7XHJcblx0XHRsZXQgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZTtcclxuXHRcdGlmIChhIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xyXG5cdFx0XHR1dGNUaW1lID0gYTtcclxuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGIgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHV0Y1RpbWUgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBiIGFzIG51bWJlciwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdGRzdERlcGVuZGVudCA9IChjID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJsb2NhbFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHR6b25lIHRpbWUgdGltZXN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cFxyXG5cdCAqXHJcblx0ICogQHJldHVybnNcdHVuaXggbWlsbGlzZWNvbmRzIGluIHpvbmUgdGltZSwgbm9ybWFsaXplZC5cclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxVbml4TWlsbGlzOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXHJcblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxyXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxyXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxyXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdHpvbmUgdGltZSB0aW1lc3RhbXBcclxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuc1x0dGltZSBzdHJ1Y3QgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IFRpbWVTdHJ1Y3Q7XHJcblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcclxuXHRcdGNvbnN0IHR6b3B0OiBOb3JtYWxpemVPcHRpb24gPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uRG93biA/IE5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogTm9ybWFsaXplT3B0aW9uLlVwKTtcclxuXHRcdGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG5cdFx0XHRpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUsIHR6b3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGxvY2FsVGltZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXHJcblx0ICogRWl0aGVyIFwibG9jYWx0aW1lXCIsIElBTkEgbmFtZSwgb3IgXCIraGg6bW1cIiBvZmZzZXQuXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XHJcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuXHRcdFx0aWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbVGltZVpvbmU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IGFuIG9mZnNldCBudW1iZXIgaW50byBhbiBvZmZzZXQgc3RyaW5nXHJcblx0ICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgb2Zmc2V0VG9TdHJpbmcob2Zmc2V0OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XHJcblx0XHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcclxuXHRcdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XHJcblx0XHRyZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXHJcblx0ICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcclxuXHQgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHN0cmluZ1RvT2Zmc2V0KHM6IHN0cmluZyk6IG51bWJlciB7XHJcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XHJcblx0XHQvLyBlYXN5IGNhc2VcclxuXHRcdGlmICh0ID09PSBcIlpcIikge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH1cclxuXHRcdC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcclxuXHRcdGFzc2VydCh0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLyksIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcclxuXHRcdGNvbnN0IHNpZ246IG51bWJlciA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xyXG5cdFx0Y29uc3QgaG91cnM6IG51bWJlciA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XHJcblx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcclxuXHRcdGlmICh0Lmxlbmd0aCA9PT0gNSkge1xyXG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcclxuXHRcdH0gZWxzZSBpZiAodC5sZW5ndGggPT09IDYpIHtcclxuXHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHR9XHJcblx0XHRhc3NlcnQoaG91cnMgPj0gMCAmJiBob3VycyA8IDI0LCBcIk9mZnNldHMgZnJvbSBVVEMgbXVzdCBiZSBsZXNzIHRoYW4gYSBkYXkuXCIpO1xyXG5cdFx0cmV0dXJuIHNpZ24gKiAoaG91cnMgKiA2MCArIG1pbnV0ZXMpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBjYWNoZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfY2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBUaW1lWm9uZSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcclxuXHQgKiBAcGFyYW0gbmFtZVx0VGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWU/XHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2ZpbmRPckNyZWF0ZShuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbik6IFRpbWVab25lIHtcclxuXHRcdGNvbnN0IGtleSA9IG5hbWUgKyAoZHN0ID8gXCJfRFNUXCIgOiBcIl9OTy1EU1RcIik7XHJcblx0XHRpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xyXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XHJcblx0XHRcdFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGFcclxuXHQgKiBjYWNoZSBsb29rdXBcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfbm9ybWFsaXplU3RyaW5nKHM6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB0OiBzdHJpbmcgPSBzLnRyaW0oKTtcclxuXHRcdGFzc2VydCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcclxuXHRcdGlmICh0ID09PSBcImxvY2FsdGltZVwiKSB7XHJcblx0XHRcdHJldHVybiB0O1xyXG5cdFx0fSBlbHNlIGlmICh0ID09PSBcIlpcIikge1xyXG5cdFx0XHRyZXR1cm4gXCIrMDA6MDBcIjtcclxuXHRcdH0gZWxzZSBpZiAoVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nKHQpKSB7XHJcblx0XHRcdC8vIG9mZnNldCBzdHJpbmdcclxuXHRcdFx0Ly8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcclxuXHRcdFx0cmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHN0YXRpYyBfaXNPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XHJcblx0XHRyZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG4iLCIvKipcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRva2VuaXplciB7XHJcblxyXG5cdHByaXZhdGUgX2Zvcm1hdFN0cmluZzogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgdG9rZW5pemVyXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyAob3B0aW9uYWwpIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGZvcm1hdFN0cmluZz86IHN0cmluZykge1xyXG5cdFx0dGhpcy5fZm9ybWF0U3RyaW5nID0gZm9ybWF0U3RyaW5nO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBmb3JtYXQgc3RyaW5nXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgbmV3IHN0cmluZyB0byB1c2UgZm9yIGZvcm1hdHRpbmdcclxuXHQgKi9cclxuXHRzZXRGb3JtYXRTdHJpbmcoZm9ybWF0U3RyaW5nOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHRoaXMuX2Zvcm1hdFN0cmluZyA9IGZvcm1hdFN0cmluZztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcGVuZCBhIG5ldyB0b2tlbiB0byB0aGUgY3VycmVudCBsaXN0IG9mIHRva2Vucy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB0b2tlblN0cmluZyBUaGUgc3RyaW5nIHRoYXQgbWFrZXMgdXAgdGhlIHRva2VuXHJcblx0ICogQHBhcmFtIHRva2VuQXJyYXkgVGhlIGV4aXN0aW5nIGFycmF5IG9mIHRva2Vuc1xyXG5cdCAqIEBwYXJhbSByYXcgKG9wdGlvbmFsKSBJZiB0cnVlLCBkb24ndCBwYXJzZSB0aGUgdG9rZW4gYnV0IGluc2VydCBpdCBhcyBpc1xyXG5cdCAqIEByZXR1cm4gVG9rZW5bXSBUaGUgcmVzdWx0aW5nIGFycmF5IG9mIHRva2Vucy5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9hcHBlbmRUb2tlbih0b2tlblN0cmluZzogc3RyaW5nLCB0b2tlbkFycmF5OiBUb2tlbltdLCByYXc/OiBib29sZWFuKTogVG9rZW5bXSB7XHJcblx0XHRpZiAodG9rZW5TdHJpbmcgIT09IFwiXCIpIHtcclxuXHRcdFx0Y29uc3QgdG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxyXG5cdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcsXHJcblx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuXHRcdFx0XHR0eXBlOiBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYgKCFyYXcpIHtcclxuXHRcdFx0XHR0b2tlbi50eXBlID0gbWFwU3ltYm9sVG9UeXBlKHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dG9rZW5BcnJheS5wdXNoKHRva2VuKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0b2tlbkFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIGludGVybmFsIHN0cmluZyBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIHRva2Vucy5cclxuXHQgKiBAcmV0dXJuIFRva2VuW11cclxuXHQgKi9cclxuXHRwYXJzZVRva2VucygpOiBUb2tlbltdIHtcclxuXHRcdGlmICghdGhpcy5fZm9ybWF0U3RyaW5nKSB7XHJcblx0XHRcdHJldHVybiBbXTtcclxuXHRcdH1cclxuXHRcdGxldCByZXN1bHQ6IFRva2VuW10gPSBbXTtcclxuXHJcblx0XHRsZXQgY3VycmVudFRva2VuOiBzdHJpbmcgPSBcIlwiO1xyXG5cdFx0bGV0IHByZXZpb3VzQ2hhcjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGxldCBxdW90aW5nOiBib29sZWFuID0gZmFsc2U7XHJcblx0XHRsZXQgcG9zc2libGVFc2NhcGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZm9ybWF0U3RyaW5nLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IGN1cnJlbnRDaGFyID0gdGhpcy5fZm9ybWF0U3RyaW5nW2ldO1xyXG5cclxuXHRcdFx0Ly8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXHJcblx0XHRcdGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcclxuXHRcdFx0XHRpZiAoIXF1b3RpbmcpIHtcclxuXHRcdFx0XHRcdGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHRcdC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXHJcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xyXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IFwiJ1wiO1xyXG5cdFx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcclxuXHRcdFx0XHRcdGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHRcdC8vIEVzY2FwaW5nLCBhZGQgJyB0byB0aGUgdG9rZW5cclxuXHRcdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0XHRcdC8vIEN1cnJlbnQgY2hhcmFjdGVyIGlzIHJlbGV2YW50LCBzbyBzYXZlIGl0IGZvciBpbnNwZWN0aW5nIG5leHQgcm91bmRcclxuXHRcdFx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fSBlbHNlIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0cXVvdGluZyA9ICFxdW90aW5nO1xyXG5cdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0Ly8gRmx1c2ggY3VycmVudCB0b2tlblxyXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCAhcXVvdGluZyk7XHJcblx0XHRcdFx0Y3VycmVudFRva2VuID0gXCJcIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHF1b3RpbmcpIHtcclxuXHRcdFx0XHQvLyBRdW90aW5nIG1vZGUsIGFkZCBjaGFyYWN0ZXIgdG8gdG9rZW4uXHJcblx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG5cdFx0XHRcdC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXHJcblx0XHRcdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiA9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIFdlIGFyZSByZXBlYXRpbmcgdGhlIHRva2VuIHdpdGggbW9yZSBjaGFyYWN0ZXJzXHJcblx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdH1cclxuXHRcdC8vIERvbid0IGZvcmdldCB0byBhZGQgdGhlIGxhc3QgdG9rZW4gdG8gdGhlIHJlc3VsdCFcclxuXHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCBxdW90aW5nKTtcclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaWZmZXJlbnQgdHlwZXMgb2YgdG9rZW5zLCBlYWNoIGZvciBhIERhdGVUaW1lIFwicGVyaW9kIHR5cGVcIiAobGlrZSB5ZWFyLCBtb250aCwgaG91ciBldGMuKVxyXG4gKi9cclxuZXhwb3J0IGVudW0gRGF0ZVRpbWVUb2tlblR5cGUge1xyXG5cdElERU5USVRZLCAvLyBTcGVjaWFsLCBkbyBub3QgXCJmb3JtYXRcIiB0aGlzLCBidXQganVzdCBvdXRwdXQgd2hhdCB3ZW50IGluXHJcblxyXG5cdEVSQSxcclxuXHRZRUFSLFxyXG5cdFFVQVJURVIsXHJcblx0TU9OVEgsXHJcblx0V0VFSyxcclxuXHREQVksXHJcblx0V0VFS0RBWSxcclxuXHREQVlQRVJJT0QsXHJcblx0SE9VUixcclxuXHRNSU5VVEUsXHJcblx0U0VDT05ELFxyXG5cdFpPTkVcclxufVxyXG5cclxuLyoqXHJcbiAqIEJhc2ljIHRva2VuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRva2VuIHtcclxuXHQvKipcclxuXHQgKiBUaGUgdHlwZSBvZiB0b2tlblxyXG5cdCAqL1xyXG5cdHR5cGU6IERhdGVUaW1lVG9rZW5UeXBlO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc3ltYm9sIGZyb20gd2hpY2ggdGhlIHRva2VuIHdhcyBwYXJzZWRcclxuXHQgKi9cclxuXHRzeW1ib2w6IHN0cmluZztcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgdG9rZW5cclxuXHQgKi9cclxuXHRsZW5ndGg6IG51bWJlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHByb2R1Y2VkIHRoaXMgdG9rZW5cclxuXHQgKi9cclxuXHRyYXc6IHN0cmluZztcclxufVxyXG5cclxuY29uc3Qgc3ltYm9sTWFwcGluZzogeyBbY2hhcjogc3RyaW5nXTogRGF0ZVRpbWVUb2tlblR5cGUgfSA9IHtcclxuXHRcIkdcIjogRGF0ZVRpbWVUb2tlblR5cGUuRVJBLFxyXG5cclxuXHRcInlcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcIllcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcInVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcIlVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcInJcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHJcblx0XCJRXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcblx0XCJxXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcblxyXG5cdFwiTVwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuXHRcIkxcIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcblx0XCJsXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG5cclxuXHRcIndcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuXHRcIldcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuXHJcblx0XCJkXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcIkRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFwiRlwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblx0XCJnXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHJcblx0XCJFXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XCJlXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XCJjXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblxyXG5cdFwiYVwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblxyXG5cdFwiaFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiSFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwia1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiS1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwialwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiSlwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cclxuXHRcIm1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFLFxyXG5cclxuXHRcInNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFwiU1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XCJBXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHJcblx0XCJ6XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJaXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJPXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJ2XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJWXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJYXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJ4XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYXAgdGhlIGdpdmVuIHN5bWJvbCB0byBvbmUgb2YgdGhlIERhdGVUaW1lVG9rZW5UeXBlc1xyXG4gKiBJZiB0aGVyZSBpcyBubyBtYXBwaW5nLCBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSBpcyB1c2VkXHJcbiAqXHJcbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHNpbmdsZS1jaGFyYWN0ZXIgc3ltYm9sIHVzZWQgdG8gbWFwIHRoZSB0b2tlblxyXG4gKiBAcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlIFRoZSBUeXBlIG9mIHRva2VuIHRoaXMgc3ltYm9sIHJlcHJlc2VudHNcclxuICovXHJcbmZ1bmN0aW9uIG1hcFN5bWJvbFRvVHlwZShzeW1ib2w6IHN0cmluZyk6IERhdGVUaW1lVG9rZW5UeXBlIHtcclxuXHRpZiAoc3ltYm9sTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShzeW1ib2wpKSB7XHJcblx0XHRyZXR1cm4gc3ltYm9sTWFwcGluZ1tzeW1ib2xdO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk7XHJcblx0fVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50T3B0cywgVGltZVN0cnVjdCwgVGltZVVuaXQsIFdlZWtEYXkgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIFRvVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRWl0aGVyIGEgeWVhciBudW1iZXIgb3IgXCJvbmx5XCJcclxuXHQgKi9cclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIFwibWF4XCJcclxuXHQgKi9cclxuXHRNYXhcclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIE9uVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG5cdCAqL1xyXG5cdERheU51bSxcclxuXHQvKipcclxuXHQgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuXHQgKi9cclxuXHRMYXN0WCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPj04XCJcclxuXHQgKi9cclxuXHRHcmVxWCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPD04XCJcclxuXHQgKi9cclxuXHRMZXFYXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEF0VHlwZSB7XHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZSAobm8gRFNUKVxyXG5cdCAqL1xyXG5cdFN0YW5kYXJkLFxyXG5cdC8qKlxyXG5cdCAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuXHQgKi9cclxuXHRXYWxsLFxyXG5cdC8qKlxyXG5cdCAqIFV0YyB0aW1lXHJcblx0ICovXHJcblx0VXRjLFxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdWxlSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmcm9tOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9ZZWFyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHR5cGU6IHN0cmluZyxcclxuXHRcdC8qKlxyXG5cdFx0ICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE9OIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvblR5cGU6IE9uVHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uRGF5OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gaG91clxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRIb3VyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0TWludXRlOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBzZWNvbmRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFR5cGU6IEF0VHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBzYXZlOiBEdXJhdGlvbixcclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG5cdFx0ICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xyXG5cdFx0KSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuc2F2ZSkge1xyXG5cdFx0XHR0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChUaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVMZXNzKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSA8IG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcblx0ICovXHJcblx0cHVibGljIGVmZmVjdGl2ZUVxdWFsKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuXHQgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcblx0ICogbm90IHRha2VuIGludG8gYWNjb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVEYXRlKHllYXI6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG5cclxuXHRcdC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG5cdFx0Y29uc3QgdG06IFRpbWVDb21wb25lbnRPcHRzID0ge3llYXIsIG1vbnRoOiB0aGlzLmluTW9udGggfTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgZGF5XHJcblx0XHRzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xyXG5cdFx0XHRcdHRtLmRheSA9IHRoaXMub25EYXk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGltZVxyXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xyXG5cdFx0dG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuXHRcdHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRtKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRyYW5zaXRpb24gbW9tZW50IGluIFVUQyBpbiB0aGUgZ2l2ZW4geWVhclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGZvciB3aGljaCB0byByZXR1cm4gdGhlIHRyYW5zaXRpb25cclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFRoZSBzdGFuZGFyZCBvZmZzZXQgZm9yIHRoZSB0aW1lem9uZSB3aXRob3V0IERTVFxyXG5cdCAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdHJhbnNpdGlvblRpbWVVdGMoeWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24sIHByZXZSdWxlPzogUnVsZUluZm8pOiBudW1iZXIge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XHJcblxyXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uO1xyXG5cdFx0c3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XHJcblx0XHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxyXG5cdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxyXG5cdFx0XHRcdGlmIChwcmV2UnVsZSkge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbmV4cG9ydCBlbnVtIFJ1bGVUeXBlIHtcclxuXHQvKipcclxuXHQgKiBObyBydWxlIGFwcGxpZXNcclxuXHQgKi9cclxuXHROb25lLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG5cdCAqL1xyXG5cdE9mZnNldCxcclxuXHQvKipcclxuXHQgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuXHQgKi9cclxuXHRSdWxlTmFtZVxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIEdNVCBvZmZzZXQgaW4gZnJhY3Rpb25hbCBtaW51dGVzLCBQT1NJVElWRSB0byBVVEMgKG5vdGUgSmF2YVNjcmlwdC5EYXRlIGdpdmVzIG9mZnNldHNcclxuXHRcdCAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBnbXRvZmY6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcblx0XHQgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG5cdFx0ICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlVHlwZTogUnVsZVR5cGUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVPZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGEgcnVsZSBuYW1lLCB0aGlzIGlzIHRoZSBydWxlIG5hbWVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG5cdFx0ICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcblx0XHQgKiBhIHNpbmdsZSBhbHBoYWJldGljIHN0cmluZyBvdGhlciB0aGFuIOKAnHp6eizigJ0gaW4gd2hpY2ggY2FzZSB0aGF04oCZcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuXHRcdCAqIGEgc3RyaW5nIGNvbnRhaW5pbmcg4oCcJXMs4oCdIGluIHdoaWNoIGNhc2UgdGhlIOKAnCVz4oCdIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIHRleHQgaW4gdGhlIGFwcHJvcHJpYXRlIFJ1bGXigJlzIExFVFRFUiBjb2x1bW5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGZvcm1hdDogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG5cdFx0ICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgdW5kZWZpbmVkIChmb3IgdGhlIGZpcnN0IHJ1bGUpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB1bnRpbD86IG51bWJlclxyXG5cdCkge1xyXG5cdFx0aWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG5cdFx0XHR0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuZW51bSBUek1vbnRoTmFtZXMge1xyXG5cdEphbiA9IDEsXHJcblx0RmViID0gMixcclxuXHRNYXIgPSAzLFxyXG5cdEFwciA9IDQsXHJcblx0TWF5ID0gNSxcclxuXHRKdW4gPSA2LFxyXG5cdEp1bCA9IDcsXHJcblx0QXVnID0gOCxcclxuXHRTZXAgPSA5LFxyXG5cdE9jdCA9IDEwLFxyXG5cdE5vdiA9IDExLFxyXG5cdERlYyA9IDEyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XHJcblx0XHRpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGlmICh0cnVlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuXHR9XHJcbn1cclxuXHJcbmVudW0gVHpEYXlOYW1lcyB7XHJcblx0U3VuID0gMCxcclxuXHRNb24gPSAxLFxyXG5cdFR1ZSA9IDIsXHJcblx0V2VkID0gMyxcclxuXHRUaHUgPSA0LFxyXG5cdEZyaSA9IDUsXHJcblx0U2F0ID0gNlxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXQ6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHJcblx0XHQpIHtcclxuXHRcdGlmICh0aGlzLm9mZnNldCkge1xyXG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG5leHBvcnQgZW51bSBOb3JtYWxpemVPcHRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0VXAsXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdERvd25cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUekRhdGFiYXNlIHtcclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZT86IFR6RGF0YWJhc2U7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0YSBUWiBkYXRhIGFzIEpTT04gb2JqZWN0IChmcm9tIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzKS5cclxuXHQgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5pdChkYXRhPzogYW55IHwgYW55W10pOiB2b2lkIHtcclxuXHRcdGlmIChkYXRhKSB7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkOyAvLyBuZWVkZWQgZm9yIGFzc2VydCBpbiBjb25zdHJ1Y3RvclxyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IGRhdGE6IGFueVtdID0gW107XHJcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xyXG5cdFx0XHRjb25zdCBnOiBhbnkgPSAoZ2xvYmFsID8gZ2xvYmFsIDogd2luZG93KTtcclxuXHRcdFx0aWYgKGcpIHtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhnKSkge1xyXG5cdFx0XHRcdFx0aWYgKGtleS5pbmRleE9mKFwidHpkYXRhXCIpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZ1trZXldID09PSBcIm9iamVjdFwiICYmIGdba2V5XS5ydWxlcyAmJiBnW2tleV0uem9uZXMpIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZ1trZXldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG5cdFx0XHRjb25zdCBmaW5kTm9kZU1vZHVsZXMgPSAocmVxdWlyZTogYW55KTogdm9pZCA9PiB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGZpcnN0IHRyeSB0emRhdGEgd2hpY2ggY29udGFpbnMgYWxsIGRhdGFcclxuXHRcdFx0XHRcdGNvbnN0IHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xyXG5cdFx0XHRcdFx0Y29uc3QgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG5cdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdC8vIHRoZW4gdHJ5IHN1YnNldHNcclxuXHRcdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWVzOiBzdHJpbmdbXSA9IFtcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYWZyaWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFudGFyY3RpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZFwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZC11dGNcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXRjZXRlcmFcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXVyb3BlXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLW5vcnRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1wYWNpZmljbmV3XCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLXNvdXRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zeXN0ZW12XCJcclxuXHRcdFx0XHRcdF07XHJcblx0XHRcdFx0XHRtb2R1bGVOYW1lcy5mb3JFYWNoKChtb2R1bGVOYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdFx0XHRmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGluc3RhbmNlKCk6IFR6RGF0YWJhc2Uge1xyXG5cdFx0aWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xyXG5cdFx0XHRUekRhdGFiYXNlLmluaXQoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZSBhcyBUekRhdGFiYXNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGRhdGFiYXNlIGRhdGFcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kYXRhOiBhbnk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCBtaW4vbWF4IERTVCB2YWx1ZXNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9taW5tYXg6IE1pbk1heEluZm87XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCB6b25lIG5hbWVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZU5hbWVzOiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuXHQgKi9cclxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGRhdGE6IGFueVtdKSB7XHJcblx0XHRhc3NlcnQoIVR6RGF0YWJhc2UuX2luc3RhbmNlLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcclxuXHRcdGFzc2VydChkYXRhLmxlbmd0aCA+IDAsXHJcblx0XHRcdFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIlxyXG5cdFx0KTtcclxuXHRcdGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHR0aGlzLl9kYXRhID0gZGF0YVswXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2RhdGEgPSB7IHpvbmVzOiB7fSwgcnVsZXM6IHt9IH07XHJcblx0XHRcdGRhdGEuZm9yRWFjaCgoZDogYW55KTogdm9pZCA9PiB7XHJcblx0XHRcdFx0aWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnJ1bGVzKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnpvbmVzKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9kYXRhLnpvbmVzW2tleV0gPSBkLnpvbmVzW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX21pbm1heCA9IHZhbGlkYXRlRGF0YSh0aGlzLl9kYXRhKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lTmFtZXMoKTogc3RyaW5nW10ge1xyXG5cdFx0aWYgKCF0aGlzLl96b25lTmFtZXMpIHtcclxuXHRcdFx0dGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XHJcblx0XHRcdHRoaXMuX3pvbmVOYW1lcy5zb3J0KCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZU5hbWVzO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGV4aXN0cyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNaW5pbXVtIG5vbi16ZXJvIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBEb2VzIHJldHVybiB6ZXJvIGlmIGEgem9uZU5hbWUgaXMgZ2l2ZW4gYW5kIHRoZXJlIGlzIG5vIERTVCBhdCBhbGwgZm9yIHRoZSB6b25lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW5Ec3RTYXZlKHpvbmVOYW1lPzogc3RyaW5nKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHpvbmVOYW1lKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdFx0bGV0IHJlc3VsdDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XHJcblx0XHRcdGNvbnN0IHJ1bGVOYW1lczogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcblx0XHRcdFx0XHRcdGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRjb25zdCB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnNhdmUubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0Y29uc3Qgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRjb25zdCB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmICghcmVzdWx0KSB7XHJcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcclxuXHQgKi9cclxuXHRwdWJsaWMgaGFzRHN0KHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGaXJzdCBEU1QgY2hhbmdlIG1vbWVudCBBRlRFUiB0aGUgZ2l2ZW4gVVRDIGRhdGUgaW4gVVRDIG1pbGxpc2Vjb25kcywgd2l0aGluIG9uZSB5ZWFyLFxyXG5cdCAqIHJldHVybnMgdW5kZWZpbmVkIGlmIG5vIHN1Y2ggY2hhbmdlXHJcblx0ICovXHJcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogbnVtYmVyKTogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QpOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcblx0XHRsZXQgem9uZUluZm86IFpvbmVJbmZvO1xyXG5cdFx0Y29uc3QgdXRjVGltZTogVGltZVN0cnVjdCA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGEpIDogYSk7XHJcblxyXG5cdFx0Ly8gZ2V0IGFsbCB6b25lIGluZm9zIGZvciBbZGF0ZSwgZGF0ZSsxeWVhcilcclxuXHRcdGNvbnN0IGFsbFpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGNvbnN0IHJlbGV2YW50Wm9uZUluZm9zOiBab25lSW5mb1tdID0gW107XHJcblx0XHRjb25zdCByYW5nZVN0YXJ0OiBudW1iZXIgPSB1dGNUaW1lLnVuaXhNaWxsaXM7XHJcblx0XHRjb25zdCByYW5nZUVuZDogbnVtYmVyID0gcmFuZ2VTdGFydCArIDM2NSAqIDg2NDAwRTM7XHJcblx0XHRsZXQgcHJldkVuZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhbGxab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0em9uZUluZm8gPSBhbGxab25lSW5mb3NbaV07XHJcblx0XHRcdGlmICgocHJldkVuZCA9PT0gdW5kZWZpbmVkIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xyXG5cdFx0XHRcdHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXHJcblx0XHRsZXQgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCByZWxldmFudFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR6b25lSW5mbyA9IHJlbGV2YW50Wm9uZUluZm9zW2ldO1xyXG5cdFx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRcdHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KFxyXG5cdFx0XHRcdHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyICsgMSwgem9uZUluZm8uZ210b2ZmKVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0dHJhbnNpdGlvbnMuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxyXG5cdFx0bGV0IHByZXZTYXZlOiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xyXG5cdCAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxyXG5cdCAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZUlzVXRjKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nL3N1YnRyYWN0aW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRBIGxvY2FsIHRpbWUsIGVpdGhlciBhcyBhIFRpbWVTdHJ1Y3Qgb3IgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5cdFRoZSBub3JtYWxpemVkIHRpbWUsIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgbG9jYWxUaW1lIHBhcmFtZXRlciAoVGltZVN0cnVjdCBvciB1bml4IG1pbGxpcylcclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xyXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cdFx0XHQvLyBsb2NhbCB0aW1lcyBiZWhhdmUgbGlrZSB0aGlzIGR1cmluZyBEU1QgY2hhbmdlczpcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDNcclxuXHJcblx0XHRcdC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcblx0XHRcdC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG5cclxuXHRcdFx0Ly8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXHJcblx0XHRcdFx0em9uZU5hbWUsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0Ly8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcclxuXHRcdFx0bGV0IHByZXY6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdFx0Ly8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLm9mZnNldC5ncmVhdGVyVGhhbihwcmV2KSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxCZWZvcmU6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyBwcmV2Lm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxBZnRlcjogbnVtYmVyID0gdHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0aWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xyXG5cdFx0XHRcdFx0XHQvLyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0XHRcdFx0XHRjb25zdCBmYWN0b3I6IG51bWJlciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBUaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHQvLyBubyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IGEgOiBhLmNsb25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0KHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbjtcclxuXHJcblx0XHRzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuT2Zmc2V0OiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IHRoaXMuZHN0T2Zmc2V0Rm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0ZGVmYXVsdDogLy8gY2Fubm90IGhhcHBlbiwgYnV0IHRoZSBjb21waWxlciBkb2VzbnQgcmVhbGl6ZSBpdFxyXG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG5cdCAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb24oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdGNvbnN0IGZvcm1hdDogc3RyaW5nID0gem9uZUluZm8uZm9ybWF0O1xyXG5cclxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG5cdFx0aWYgKGZvcm1hdC5pbmRleE9mKFwiJXNcIikgIT09IC0xXHJcblx0XHRcdCYmIHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmc7XHJcblx0XHRcdC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuXHRcdFx0aWYgKGRzdERlcGVuZGVudCkge1xyXG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZvcm1hdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGV4Y2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuXHQgKlxyXG5cdCAqIElmIHRoZSBsb2NhbCB0aW1lc3RhbXAgZXhpc3RzIHR3aWNlIChhcyBjYW4gb2NjdXIgdmVyeSByYXJlbHkgZHVlIHRvIHpvbmUgY2hhbmdlcylcclxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG5cdCAqXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBsb2NhbFRpbWUgOiBsb2NhbFRpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG5cdCAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBVVEMgdGltZXMgYW5kIHRoZXJlZm9yZSBtdWx0aXBsZSBvZmZzZXRzIGZvciBhIGxvY2FsIHRpbWVcclxuXHQgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHRzOiBUaW1lU3RydWN0ID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUpIDogbG9jYWxUaW1lKTtcclxuXHRcdGNvbnN0IG5vcm1hbGl6ZWRUbTogVGltZVN0cnVjdCA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcclxuXHJcblx0XHQvLy8gTm90ZTogZHVyaW5nIG9mZnNldCBjaGFuZ2VzLCBsb2NhbCB0aW1lIGNhbiBiZWhhdmUgbGlrZTpcclxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXHJcblxyXG5cdFx0Ly8gVGhlcmVmb3JlIGJpbmFyeSBzZWFyY2ggZG9lcyBub3QgYXBwbHkuIExpbmVhciBzZWFyY2ggdGhyb3VnaCB0cmFuc2l0aW9uc1xyXG5cdFx0Ly8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG5cclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKFxyXG5cdFx0XHR6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxXHJcblx0XHQpO1xyXG5cdFx0bGV0IHByZXY6IFRyYW5zaXRpb24gfCB1bmRlZmluZWQ7XHJcblx0XHRsZXQgcHJldlByZXY6IFRyYW5zaXRpb24gfCB1bmRlZmluZWQ7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKSA+IG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0Ly8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldlByZXYgPSBwcmV2O1xyXG5cdFx0XHRwcmV2ID0gdHJhbnNpdGlvbjtcclxuXHRcdH1cclxuXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG5cdFx0aWYgKHByZXYpIHtcclxuXHRcdFx0Ly8gc3BlY2lhbCBjYXJlIGR1cmluZyBiYWNrd2FyZCBjaGFuZ2U6IHRha2UgZmlyc3Qgb2NjdXJyZW5jZSBvZiBsb2NhbCB0aW1lXHJcblx0XHRcdGlmIChwcmV2UHJldiAmJiBwcmV2UHJldi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlXHJcblx0XHRcdFx0Y29uc3QgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG5cdFx0XHRcdGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKClcclxuXHRcdFx0XHRcdCYmIG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG5cdFx0XHRcdFx0Ly8gd2l0aGluIGR1cGxpY2F0ZSByYW5nZVxyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRoaXMgY2Fubm90IGhhcHBlbiBhcyB0aGUgdHJhbnNpdGlvbnMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBjb250YWluIGEgdHJhbnNpdGlvbiBhdCB0aGVcclxuXHRcdFx0Ly8gYmVnaW5uaW5nIG9mIHRoZSByZXF1ZXN0ZWQgZnJvbVllYXJcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW5cclxuXHQgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcFxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGRzdE9mZnNldEZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG5cclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0cnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXRcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHRsZXQgb2Zmc2V0OiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuXHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb2Zmc2V0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXHJcblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXAgYXMgVGltZVN0cnVjdCBvciB1bml4IG1pbGxpc1xyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGxldHRlckZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHRzOiBUaW1lU3RydWN0ID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lKTtcclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0cnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXRcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblx0XHRmb3IgKGxldCBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0bGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICghbGV0dGVyKSB7XHJcblx0XHRcdC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xyXG5cdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBsZXR0ZXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBsaXN0IG9mIGFsbCB0cmFuc2l0aW9ucyBpbiBbZnJvbVllYXIuLnRvWWVhcl0gc29ydGVkIGJ5IGVmZmVjdGl2ZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRyYW5zaXRpb25zLCB3aXRoIERTVCBvZmZzZXRzIChubyBzdGFuZGFyZCBvZmZzZXQgaW5jbHVkZWQpXHJcblx0ICovXHJcblx0cHVibGljIGdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogVHJhbnNpdGlvbltdIHtcclxuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcblxyXG5cdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3MocnVsZU5hbWUpO1xyXG5cdFx0Y29uc3QgcmVzdWx0OiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHJcblx0XHRmb3IgKGxldCB5ID0gZnJvbVllYXI7IHkgPD0gdG9ZZWFyOyB5KyspIHtcclxuXHRcdFx0bGV0IHByZXZJbmZvOiBSdWxlSW5mbyB8IHVuZGVmaW5lZDtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBydWxlSW5mb3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBydWxlSW5mbzogUnVsZUluZm8gPSBydWxlSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby50cmFuc2l0aW9uVGltZVV0Yyh5LCBzdGFuZGFyZE9mZnNldCwgcHJldkluZm8pLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5zYXZlLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5sZXR0ZXIpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldkluZm8gPSBydWxlSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGJvdGggem9uZSBhbmQgcnVsZSBjaGFuZ2VzIGFzIHRvdGFsIChzdGQgKyBkc3QpIG9mZnNldHMuXHJcblx0ICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcblx0ICovXHJcblx0cHVibGljIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyKTogVHJhbnNpdGlvbltdIHtcclxuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcblxyXG5cdFx0Y29uc3Qgc3RhcnRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IGZyb21ZZWFyIH0pO1xyXG5cdFx0Y29uc3QgZW5kTWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB0b1llYXIgKyAxIH0pO1xyXG5cclxuXHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRhc3NlcnQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwiRW1wdHkgem9uZUluZm9zIGFycmF5IHJldHVybmVkIGZyb20gZ2V0Wm9uZUluZm9zKClcIik7XHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0OiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHJcblx0XHRsZXQgcHJldlpvbmU6IFpvbmVJbmZvIHwgdW5kZWZpbmVkO1xyXG5cdFx0bGV0IHByZXZVbnRpbFllYXI6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCBwcmV2U3RkT2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0bGV0IHByZXZEc3RPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRsZXQgcHJldkxldHRlcjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRjb25zdCB1bnRpbFllYXI6IG51bWJlciA9IHpvbmVJbmZvLnVudGlsICE9PSB1bmRlZmluZWQgPyBuZXcgVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkuY29tcG9uZW50cy55ZWFyIDogdG9ZZWFyICsgMTtcclxuXHRcdFx0bGV0IHN0ZE9mZnNldDogRHVyYXRpb24gPSBwcmV2U3RkT2Zmc2V0O1xyXG5cdFx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZEc3RPZmZzZXQ7XHJcblx0XHRcdGxldCBsZXR0ZXI6IHN0cmluZyA9IHByZXZMZXR0ZXI7XHJcblxyXG5cdFx0XHQvLyB6b25lIGFwcGxpY2FibGU/XHJcblx0XHRcdGlmICgoIXByZXZab25lIHx8IHByZXZab25lLnVudGlsIDwgZW5kTWlsbGlzIC0gMSkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XHJcblxyXG5cdFx0XHRcdHN0ZE9mZnNldCA9IHpvbmVJbmZvLmdtdG9mZjtcclxuXHJcblx0XHRcdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOlxyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG5cdFx0XHRcdFx0XHQvLyBjaGVjayB3aGV0aGVyIHRoZSBmaXJzdCBydWxlIHRha2VzIGVmZmVjdCBpbW1lZGlhdGVseSBvbiB0aGUgem9uZSB0cmFuc2l0aW9uXHJcblx0XHRcdFx0XHRcdC8vIChlLmcuIEx5YmlhKVxyXG5cdFx0XHRcdFx0XHRpZiAocHJldlpvbmUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mb3M6IFJ1bGVJbmZvW10gPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBydWxlSW5mb3MubGVuZ3RoOyArK2opIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvID0gcnVsZUluZm9zW2pdO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBwcmV2VW50aWxZZWFyID09PSBcIm51bWJlclwiICYmIHJ1bGVJbmZvLmFwcGxpY2FibGUocHJldlVudGlsWWVhcikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgdW5kZWZpbmVkKSA9PT0gcHJldlpvbmUudW50aWwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldHRlciA9IHJ1bGVJbmZvLmxldHRlcjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBhZGQgYSB0cmFuc2l0aW9uIGZvciB0aGUgem9uZSB0cmFuc2l0aW9uXHJcblx0XHRcdFx0Y29uc3QgYXQ6IG51bWJlciA9IChwcmV2Wm9uZSAmJiBwcmV2Wm9uZS51bnRpbCAhPT0gdW5kZWZpbmVkID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XHJcblx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24oYXQsIHN0ZE9mZnNldC5hZGQoZHN0T2Zmc2V0KSwgbGV0dGVyKSk7XHJcblxyXG5cdFx0XHRcdC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgZHN0VHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxyXG5cdFx0XHRcdFx0XHR6b25lSW5mby5ydWxlTmFtZSxcclxuXHRcdFx0XHRcdFx0cHJldlVudGlsWWVhciAhPT0gdW5kZWZpbmVkID8gTWF0aC5tYXgocHJldlVudGlsWWVhciwgZnJvbVllYXIpIDogZnJvbVllYXIsXHJcblx0XHRcdFx0XHRcdE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSxcclxuXHRcdFx0XHRcdFx0c3RkT2Zmc2V0XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBkc3RUcmFuc2l0aW9ucy5sZW5ndGg7ICsraykge1xyXG5cdFx0XHRcdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gZHN0VHJhbnNpdGlvbnNba107XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldlpvbmUgPSB6b25lSW5mbztcclxuXHRcdFx0cHJldlVudGlsWWVhciA9IHVudGlsWWVhcjtcclxuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuXHRcdFx0cHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuXHRcdFx0cHJldkxldHRlciA9IGxldHRlcjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWUgc3RhbXAgYXMgdW5peCBtaWxsaXNlY29uZHMgb3IgYXMgYSBUaW1lU3RydWN0XHJcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBab25lSW5mbyB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPiB1bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFpvbmVJbmZvW10gfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXHJcblx0ICogZm9sbG93aW5nIGFueSBsaW5rcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxyXG5cdCAqIEByZXR1cm4gQXJyYXkgb2Ygem9uZSBpbmZvcy4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0Wm9uZUluZm9zKHpvbmVOYW1lOiBzdHJpbmcpOiBab25lSW5mb1tdIHtcclxuXHRcdC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGFrZSBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0bGV0IGFjdHVhbFpvbmVOYW1lOiBzdHJpbmcgPSB6b25lTmFtZTtcclxuXHRcdGxldCB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHQvLyBmb2xsb3cgbGlua3NcclxuXHRcdHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXHJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cdFx0Ly8gZmluYWwgem9uZSBpbmZvIGZvdW5kXHJcblx0XHRmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgem9uZUVudHJpZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUVudHJ5ID0gem9uZUVudHJpZXNbaV07XHJcblx0XHRcdGNvbnN0IHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xyXG5cdFx0XHRsZXQgdW50aWw6IG51bWJlciB8IHVuZGVmaW5lZCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuXHRcdFx0aWYgKGlzTmFOKHVudGlsKSkge1xyXG5cdFx0XHRcdHVudGlsID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgWm9uZUluZm8oXHJcblx0XHRcdFx0RHVyYXRpb24ubWludXRlcygtMSAqIG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzBdKSksXHJcblx0XHRcdFx0cnVsZVR5cGUsXHJcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBEdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IER1cmF0aW9uKCksXHJcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lID8gem9uZUVudHJ5WzFdIDogXCJcIixcclxuXHRcdFx0XHR6b25lRW50cnlbMl0sXHJcblx0XHRcdFx0dW50aWxcclxuXHRcdFx0KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFpvbmVJbmZvLCBiOiBab25lSW5mbyk6IG51bWJlciA9PiB7XHJcblx0XHRcdC8vIHNvcnQgdW5kZWZpbmVkIGxhc3RcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgIT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gKGEudW50aWwgLSBiLnVudGlsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdID0gcmVzdWx0O1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ydWxlSW5mb0NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogUnVsZUluZm9bXSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuXHQgKiBzb3J0ZWQgYnkgZmlyc3QgZWZmZWN0aXZlIGRhdGUgKHVuY29tcGVuc2F0ZWQgZm9yIFwid1wiIG9yIFwic1wiIEF0VGltZSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG5cdCAqIEByZXR1cm4gUnVsZUluZm8gYXJyYXkuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFJ1bGVJbmZvcyhydWxlTmFtZTogc3RyaW5nKTogUnVsZUluZm9bXSB7XHJcblx0XHQvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuXHRcdGlmICghdGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBzZXQgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZXR1cm4gZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCByZXN1bHQ6IFJ1bGVJbmZvW10gPSBbXTtcclxuXHRcdGNvbnN0IHJ1bGVTZXQgPSB0aGlzLl9kYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZVNldC5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCBydWxlID0gcnVsZVNldFtpXTtcclxuXHJcblx0XHRcdGNvbnN0IGZyb21ZZWFyOiBudW1iZXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XHJcblx0XHRcdGNvbnN0IHRvVHlwZTogVG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuXHRcdFx0Y29uc3QgdG9ZZWFyOiBudW1iZXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcblx0XHRcdGNvbnN0IG9uVHlwZTogT25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcclxuXHRcdFx0Y29uc3Qgb25EYXk6IG51bWJlciA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG5cdFx0XHRjb25zdCBvbldlZWtEYXk6IFdlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xyXG5cdFx0XHRjb25zdCBtb250aE5hbWU6IHN0cmluZyA9IDxzdHJpbmc+cnVsZVszXTtcclxuXHRcdFx0Y29uc3QgbW9udGhOdW1iZXI6IG51bWJlciA9IG1vbnRoTmFtZVRvU3RyaW5nKG1vbnRoTmFtZSk7XHJcblxyXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgUnVsZUluZm8oXHJcblx0XHRcdFx0ZnJvbVllYXIsXHJcblx0XHRcdFx0dG9UeXBlLFxyXG5cdFx0XHRcdHRvWWVhcixcclxuXHRcdFx0XHRydWxlWzJdLFxyXG5cdFx0XHRcdG1vbnRoTnVtYmVyLFxyXG5cdFx0XHRcdG9uVHlwZSxcclxuXHRcdFx0XHRvbkRheSxcclxuXHRcdFx0XHRvbldlZWtEYXksXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzBdLCAxMCksIDI0KSwgLy8gbm90ZSB0aGUgZGF0YWJhc2Ugc29tZXRpbWVzIGNvbnRhaW5zIFwiMjRcIiBhcyBob3VyIHZhbHVlXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzFdLCAxMCksIDYwKSxcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLFxyXG5cdFx0XHRcdHRoaXMucGFyc2VBdFR5cGUocnVsZVs1XVszXSksXHJcblx0XHRcdFx0RHVyYXRpb24ubWludXRlcyhwYXJzZUludChydWxlWzZdLCAxMCkpLFxyXG5cdFx0XHRcdHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN11cclxuXHRcdFx0XHQpKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFJ1bGVJbmZvLCBiOiBSdWxlSW5mbyk6IG51bWJlciA9PiB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoYS5lZmZlY3RpdmVFcXVhbChiKSkge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xyXG5cdFx0XHRcdHJldHVybiAtMTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZVJ1bGVUeXBlKHJ1bGU6IHN0cmluZyk6IFJ1bGVUeXBlIHtcclxuXHRcdGlmIChydWxlID09PSBcIi1cIikge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuTm9uZTtcclxuXHRcdH0gZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuT2Zmc2V0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIFRPIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZVRvVHlwZSh0bzogc3RyaW5nKTogVG9UeXBlIHtcclxuXHRcdGlmICh0byA9PT0gXCJtYXhcIikge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLk1heDtcclxuXHRcdH0gZWxzZSBpZiAodG8gPT09IFwib25seVwiKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XHJcblx0XHR9IGVsc2UgaWYgKCFpc05hTihwYXJzZUludCh0bywgMTApKSkge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLlllYXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUTyBjb2x1bW4gaW5jb3JyZWN0OiBcIiArIHRvKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uVHlwZShvbjogc3RyaW5nKTogT25UeXBlIHtcclxuXHRcdGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5MYXN0WDtcclxuXHRcdH1cclxuXHRcdGlmIChvbi5pbmRleE9mKFwiPD1cIikgIT09IC0xKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuTGVxWDtcclxuXHRcdH1cclxuXHRcdGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuR3JlcVg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gT25UeXBlLkRheU51bTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uRGF5KG9uOiBzdHJpbmcsIG9uVHlwZTogT25UeXBlKTogbnVtYmVyIHtcclxuXHRcdHN3aXRjaCAob25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcclxuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uV2Vla0RheShvbjogc3RyaW5nKTogV2Vla0RheSB7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG5cdFx0XHRpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRyZXR1cm4gPFdlZWtEYXk+aTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIFdlZWtEYXkuU3VuZGF5O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZUF0VHlwZShhdDogYW55KTogQXRUeXBlIHtcclxuXHRcdHN3aXRjaCAoYXQpIHtcclxuXHRcdFx0Y2FzZSBcInNcIjogcmV0dXJuIEF0VHlwZS5TdGFuZGFyZDtcclxuXHRcdFx0Y2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwielwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG5pbnRlcmZhY2UgTWluTWF4SW5mbyB7XHJcblx0bWluRHN0U2F2ZTogbnVtYmVyO1xyXG5cdG1heERzdFNhdmU6IG51bWJlcjtcclxuXHRtaW5HbXRPZmY6IG51bWJlcjtcclxuXHRtYXhHbXRPZmY6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGE6IGFueSk6IE1pbk1heEluZm8ge1xyXG5cdGNvbnN0IHJlc3VsdDogUGFydGlhbDxNaW5NYXhJbmZvPiA9IHtcclxuXHR9O1xyXG5cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyBydWxlcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIikpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgem9uZXNcclxuXHRmb3IgKGxldCB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XHJcblx0XHRpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHRcdGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0Ly8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSg8c3RyaW5nPnpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyA8c3RyaW5nPnpvbmVBcnIgKyBcIlxcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoem9uZUFycikpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGVudHJ5OiBhbnkgPSB6b25lQXJyW2ldO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbnN0IGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoaXNOYU4oZ210b2ZmKSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHNlY29uZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzJdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiB0aGlyZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzNdICE9PSBcInN0cmluZ1wiICYmIGVudHJ5WzNdICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4R210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmID4gcmVzdWx0Lm1heEdtdE9mZikge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4R210T2ZmID0gZ210b2ZmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB2YWxpZGF0ZSBydWxlc1xyXG5cdGZvciAobGV0IHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcclxuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBydWxlQXJyOiBhbnkgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBydWxlID0gcnVsZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IG9mIGxlbmd0aCA4XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbMF0gIT09IFwiTmFOXCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVswXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMV0gaXMgbm90IGEgbnVtYmVyLCBvbmx5IG9yIG1heFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFUek1vbnRoTmFtZXMuaGFzT3duUHJvcGVydHkocnVsZVszXSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bM10gaXMgbm90IGEgbW9udGggbmFtZVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNF0uc3Vic3RyKDAsIDQpICE9PSBcImxhc3RcIiAmJiBydWxlWzRdLmluZGV4T2YoXCI+PVwiKSA9PT0gLTFcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpXHJcblx0XHRcdFx0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzRdIGlzIG5vdCBhIGtub3duIHR5cGUgb2YgZXhwcmVzc2lvblwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVbNV0pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnN0IHNhdmU6IG51bWJlciA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4oc2F2ZSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNl0gZG9lcyBub3QgY29udGFpbiBhIHZhbGlkIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNhdmUgIT09IDApIHtcclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlIDwgcmVzdWx0Lm1pbkRzdFNhdmUpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdCBhcyBNaW5NYXhJbmZvO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZ2xvYmFsc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BlcmlvZFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG4iXX0=
