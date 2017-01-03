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
                        this._zone = (typeof (a2) === "object" && a2 instanceof timezone_1.TimeZone ? a2 : undefined);
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
                        this._zone = (typeof (timeZone) === "object" && timeZone instanceof timezone_1.TimeZone ? timeZone : undefined);
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
                        var zone = void 0;
                        if (typeof a3 === "object" && a3 instanceof timezone_1.TimeZone) {
                            zone = (a3);
                        }
                        var parsed = parseFuncs.parse(dateString, formatString, zone);
                        this._zoneDate = parsed.time;
                        this._zone = parsed.zone;
                    }
                    else {
                        var givenString = a1.trim();
                        var ss = DateTime._splitDateFromTimeZone(givenString);
                        assert_1.default(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                        if (a2 instanceof timezone_1.TimeZone) {
                            this._zone = (a2);
                        }
                        else {
                            this._zone = (ss[1].trim() ? timezone_1.TimeZone.zone(ss[1]) : undefined);
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
                        this._zone = (a2 ? a2 : undefined);
                    }
                    else if (a1 instanceof Date) {
                        assert_1.default(typeof (a2) === "number", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        assert_1.default(!a3 || a3 instanceof timezone_1.TimeZone, "DateTime.DateTime(): timeZone should be a TimeZone object.");
                        var d = (a1);
                        var dk = (a2);
                        this._zone = (a3 ? a3 : undefined);
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
        if (zone === void 0) { zone = undefined; }
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
     * @return The time zone that the date is in. May be undefined for unaware dates.
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
            this._zone = undefined;
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
     * @param zone	The new time zone. This may be null or undefined to create unaware date.
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
            return new DateTime(this.zoneDate, undefined);
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
            return new DateTime(localTm, undefined);
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
                tokenResult = _formatZone(dateTime, utcTime, localZone ? localZone : undefined, token);
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
    assert_1.default(d1, "first argument is falsy");
    assert_1.default(d2, "first argument is falsy");
    /* istanbul ignore next */
    assert_1.default((d1 instanceof datetime_1.DateTime && d2 instanceof datetime_1.DateTime) || (d1 instanceof duration_1.Duration && d2 instanceof duration_1.Duration), "Either two datetimes or two durations expected");
    return d1.min(d2);
}
exports.min = min;
/**
 * Returns the maximum of two DateTimes or Durations
 */
function max(d1, d2) {
    assert_1.default(d1, "first argument is falsy");
    assert_1.default(d2, "first argument is falsy");
    /* istanbul ignore next */
    assert_1.default((d1 instanceof datetime_1.DateTime && d2 instanceof datetime_1.DateTime) || (d1 instanceof duration_1.Duration && d2 instanceof duration_1.Duration), "Either two datetimes or two durations expected");
    return d1.max(d2);
}
exports.max = max;
/**
 * Returns the absolute value of a Duration
 */
function abs(d) {
    assert_1.default(d, "first argument is falsy");
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
        var zone = void 0;
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
        var result = { time: new basics_1.TimeStruct(time), zone: zone };
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
        remaining: s
    };
    var zoneString = "";
    while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
        zoneString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    if (zoneString.trim()) {
        result.zone = timezone_1.TimeZone.zone(zoneString);
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7QUFFYixnQkFBZ0IsU0FBYyxFQUFFLE9BQWU7SUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7O0FBRUQsa0JBQWUsTUFBTSxDQUFDOztBQ1p0Qjs7OztHQUlHO0FBRUgsWUFBWSxDQUFDO0FBRWIsbUNBQThCO0FBQzlCLDJDQUE2QztBQUM3Qyw2QkFBK0I7QUFDL0IsbUNBQXFDO0FBc0VyQzs7O0dBR0c7QUFDSCxJQUFZLE9BUVg7QUFSRCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7SUFDUix5Q0FBTSxDQUFBO0lBQ04sNkNBQVEsQ0FBQTtBQUNULENB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TSxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxH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QUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFFNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFFMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7SUFFaEMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFFN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFFN0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7Q0FDM0IsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILHlCQUF5QixNQUFjO0lBQ3RDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0FBQ0YsQ0FBQzs7O0FDclBEOzs7Ozs7R0FNRztBQUVILFlBQVksQ0FBQztBQUViLG1DQUE4QjtBQUM5QixtQ0FBNEU7QUFDNUUsaUNBQW1DO0FBQ25DLHVDQUFzQztBQUN0Qyw2QkFBK0I7QUFFL0I7O0dBRUc7QUFDSCxJQUFZLE1BU1g7QUFURCxXQUFZLE1BQU07SUFDakI7O09BRUc7SUFDSCxtQ0FBSSxDQUFBO0lBQ0o7O09BRUc7SUFDSCxpQ0FBRyxDQUFBO0FBQ0osQ0FBQyxFQVRXLE1BQU0sR0FBTixjQUFNLEtBQU4sY0FBTSxRQVNqQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxNQWlCWDtBQWpCRCxXQUFZLE1BQU07SUFDakI7O09BRUc7SUFDSCx1Q0FBTSxDQUFBO0lBQ047O09BRUc7SUFDSCxxQ0FBSyxDQUFBO0lBQ0w7O09BRUc7SUFDSCxxQ0FBSyxDQUFBO0lBQ0w7O09BRUc7SUFDSCxtQ0FBSSxDQUFBO0FBQ0wsQ0FBQyxFQWpCVyxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFpQmpCO0FBRUQsSUFBWSxNQWFYO0FBYkQsV0FBWSxNQUFNO0lBQ2pCOztPQUVHO0lBQ0gsMkNBQVEsQ0FBQTtJQUNSOztPQUVHO0lBQ0gsbUNBQUksQ0FBQTtJQUNKOztPQUVHO0lBQ0gsaUNBQUcsQ0FBQTtBQUNKLENBQUMsRUFiVyxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFhakI7QUFFRDs7OztHQUlHO0FBQ0g7SUFFQztRQUNDOzs7V0FHRztRQUNJLElBQVk7UUFDbkI7O1dBRUc7UUFDSSxNQUFjO1FBQ3JCOztXQUVHO1FBQ0ksTUFBYztRQUNyQjs7V0FFRztRQUNJLElBQVk7UUFDbkI7O1dBRUc7UUFDSSxPQUFlO1FBQ3RCOztXQUVHO1FBQ0ksTUFBYztRQUNyQjs7V0FFRztRQUNJLEtBQWE7UUFDcEI7O1dBRUc7UUFDSSxTQUFrQjtRQUN6Qjs7V0FFRztRQUNJLE1BQWM7UUFDckI7O1dBRUc7UUFDSSxRQUFnQjtRQUN2Qjs7V0FFRztRQUNJLFFBQWdCO1FBQ3ZCOztXQUVHO1FBQ0ksTUFBYztRQUNyQjs7V0FFRztRQUNJLElBQWM7UUFDckI7OztXQUdHO1FBQ0ksTUFBYztRQXJEZCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBSVosV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUlkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFJZCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBSVosWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUlmLFdBQU0sR0FBTixNQUFNLENBQVE7UUFJZCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBSWIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUlsQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBSWQsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUloQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBSWhCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFJZCxTQUFJLEdBQUosSUFBSSxDQUFVO1FBS2QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUdyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ksNkJBQVUsR0FBakIsVUFBa0IsSUFBWTtRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNyQixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztZQUM3QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGdDQUFhLEdBQXBCLFVBQXFCLEtBQWU7UUFDbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksaUNBQWMsR0FBckIsVUFBc0IsS0FBZTtRQUNwQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksZ0NBQWEsR0FBcEIsVUFBcUIsSUFBWTtRQUNoQyxnQkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWhGLDJCQUEyQjtRQUMzQixJQUFNLEVBQUUsR0FBc0IsRUFBQyxJQUFJLE1BQUEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTNELGdCQUFnQjtRQUNoQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNyQixLQUFLLE1BQU0sQ0FBQyxNQUFNO2dCQUFFLENBQUM7b0JBQ3BCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDckIsQ0FBQztnQkFBQyxLQUFLLENBQUM7WUFDUixLQUFLLE1BQU0sQ0FBQyxLQUFLO2dCQUFFLENBQUM7b0JBQ25CLEVBQUUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNsRixDQUFDO2dCQUFDLEtBQUssQ0FBQztZQUNSLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQUUsQ0FBQztvQkFDbEIsRUFBRSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25GLENBQUM7Z0JBQUMsS0FBSyxDQUFDO1lBQ1IsS0FBSyxNQUFNLENBQUMsS0FBSztnQkFBRSxDQUFDO29CQUNuQixFQUFFLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3hFLENBQUM7Z0JBQUMsS0FBSyxDQUFDO1FBQ1QsQ0FBQztRQUVELGlCQUFpQjtRQUNqQixFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdEIsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUUxQixNQUFNLENBQUMsSUFBSSxtQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxvQ0FBaUIsR0FBeEIsVUFBeUIsSUFBWSxFQUFFLGNBQXdCLEVBQUUsUUFBbUI7UUFDbkYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFDbkUsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFFdkQsMEJBQTBCO1FBQzFCLElBQUksTUFBZ0IsQ0FBQztRQUNyQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNyQixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNkLE1BQU0sR0FBRyxtQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsS0FBSyxDQUFDO1lBQ1AsS0FBSyxNQUFNLENBQUMsUUFBUTtnQkFDbkIsTUFBTSxHQUFHLGNBQWMsQ0FBQztnQkFDeEIsS0FBSyxDQUFDO1lBQ1AsS0FBSyxNQUFNLENBQUMsSUFBSTtnQkFDZixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNkLE1BQU0sR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxNQUFNLEdBQUcsY0FBYyxDQUFDO2dCQUN6QixDQUFDO2dCQUNELEtBQUssQ0FBQztZQUNQLDBCQUEwQjtZQUMxQjtnQkFDQyx3QkFBd0I7Z0JBQ3hCLDBCQUEwQjtnQkFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ25DLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUdGLGVBQUM7QUFBRCxDQXBNQSxBQW9NQyxJQUFBO0FBcE1ZLDRCQUFRO0FBc01yQjs7R0FFRztBQUNILElBQVksUUFhWDtBQWJELFdBQVksUUFBUTtJQUNuQjs7T0FFRztJQUNILHVDQUFJLENBQUE7SUFDSjs7T0FFRztJQUNILDJDQUFNLENBQUE7SUFDTjs7T0FFRztJQUNILCtDQUFRLENBQUE7QUFDVCxDQUFDLEVBYlcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFhbkI7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNIO0lBRUM7UUFDQzs7OztXQUlHO1FBQ0ksTUFBZ0I7UUFFdkI7Ozs7OztXQU1HO1FBQ0ksUUFBa0I7UUFFekI7O1dBRUc7UUFDSSxVQUFvQjtRQUUzQjs7V0FFRztRQUNJLFFBQWdCO1FBRXZCOzs7Ozs7O1dBT0c7UUFDSSxNQUFjO1FBRXJCOzs7O1dBSUc7UUFDSSxLQUFjO1FBcENkLFdBQU0sR0FBTixNQUFNLENBQVU7UUFTaEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUtsQixlQUFVLEdBQVYsVUFBVSxDQUFVO1FBS3BCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFVaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQU9kLFVBQUssR0FBTCxLQUFLLENBQVM7UUFFckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDRixDQUFDO0lBQ0YsZUFBQztBQUFELENBbERBLEFBa0RDLElBQUE7QUFsRFksNEJBQVE7QUFxRHJCLElBQUssWUFhSjtBQWJELFdBQUssWUFBWTtJQUNoQiw2Q0FBTyxDQUFBO0lBQ1AsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCw2Q0FBTyxDQUFBO0lBQ1AsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCw2Q0FBTyxDQUFBO0lBQ1AsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCw4Q0FBUSxDQUFBO0lBQ1IsOENBQVEsQ0FBQTtJQUNSLDhDQUFRLENBQUE7QUFDVCxDQUFDLEVBYkksWUFBWSxLQUFaLFlBQVksUUFhaEI7QUFFRCwyQkFBMkIsSUFBWTtJQUN0QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDO0lBQ0YsQ0FBQztJQUNELHdCQUF3QjtJQUN4QiwwQkFBMEI7SUFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7QUFDRixDQUFDO0FBRUQsSUFBSyxVQVFKO0FBUkQsV0FBSyxVQUFVO0lBQ2QseUNBQU8sQ0FBQTtJQUNQLHlDQUFPLENBQUE7SUFDUCx5Q0FBTyxDQUFBO0lBQ1AseUNBQU8sQ0FBQTtJQUNQLHlDQUFPLENBQUE7SUFDUCx5Q0FBTyxDQUFBO0lBQ1AseUNBQU8sQ0FBQTtBQUNSLENBQUMsRUFSSSxVQUFVLEtBQVYsVUFBVSxRQVFkO0FBRUQ7OztHQUdHO0FBQ0gsNkJBQW9DLENBQVM7SUFDNUMsTUFBTSxDQUFDLHVEQUF1RCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RSxDQUFDO0FBRkQsa0RBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0M7UUFDQzs7V0FFRztRQUNJLEVBQVU7UUFDakI7O1dBRUc7UUFDSSxNQUFnQjtRQUV2Qjs7V0FFRztRQUNJLE1BQWM7UUFUZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBSVYsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUtoQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBR3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0YsQ0FBQztJQUNGLGlCQUFDO0FBQUQsQ0FyQkEsQUFxQkMsSUFBQTtBQXJCWSxnQ0FBVTtBQXVCdkI7O0dBRUc7QUFDSCxJQUFZLGVBU1g7QUFURCxXQUFZLGVBQWU7SUFDMUI7O09BRUc7SUFDSCxpREFBRSxDQUFBO0lBQ0Y7O09BRUc7SUFDSCxxREFBSSxDQUFBO0FBQ0wsQ0FBQyxFQVRXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBUzFCO0FBRUQ7OztHQUdHO0FBQ0g7SUFpR0M7O09BRUc7SUFDSCxvQkFBb0IsSUFBVztRQUEvQixpQkFxQkM7UUFrbkJEOztXQUVHO1FBQ0ssbUJBQWMsR0FBb0MsRUFBRSxDQUFDO1FBNEU3RDs7V0FFRztRQUNLLG1CQUFjLEdBQW9DLEVBQUUsQ0FBQztRQXh0QjVELGdCQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLCtGQUErRixDQUFDLENBQUM7UUFDL0gsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDckIseUhBQXlILENBQ3pILENBQUM7UUFDRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFNO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsR0FBRyxDQUFDLENBQWMsVUFBb0IsRUFBcEIsS0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBcEIsY0FBb0IsRUFBcEIsSUFBb0I7d0JBQWpDLElBQU0sR0FBRyxTQUFBO3dCQUNiLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3JDO29CQUNELEdBQUcsQ0FBQyxDQUFjLFVBQW9CLEVBQXBCLEtBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQXBCLGNBQW9CLEVBQXBCLElBQW9CO3dCQUFqQyxJQUFNLEdBQUcsU0FBQTt3QkFDYixLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNyQztnQkFDRixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFsSEQ7Ozs7O09BS0c7SUFDVyxlQUFJLEdBQWxCLFVBQW1CLElBQWtCO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVixVQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLG1DQUFtQztZQUNyRSxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFNLE1BQUksR0FBVSxFQUFFLENBQUM7WUFDdkIsMENBQTBDO1lBQzFDLElBQU0sQ0FBQyxHQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLEdBQUcsQ0FBQyxDQUFjLFVBQWMsRUFBZCxLQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQWQsY0FBYyxFQUFkLElBQWM7b0JBQTNCLElBQU0sR0FBRyxTQUFBO29CQUNiLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ2hFLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ25CLENBQUM7b0JBQ0YsQ0FBQztpQkFDRDtZQUNGLENBQUM7WUFDRCwrQ0FBK0M7WUFDL0MsSUFBTSxlQUFlLEdBQUcsVUFBQyxPQUFZO2dCQUNwQyxJQUFJLENBQUM7b0JBQ0osMkNBQTJDO29CQUMzQyxJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUM7b0JBQzVCLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDZDQUE2QztvQkFDNUUsTUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZCxDQUFFO2dCQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osbUJBQW1CO29CQUNuQixJQUFNLFdBQVcsR0FBYTt3QkFDN0IsZUFBZTt3QkFDZixtQkFBbUI7d0JBQ25CLGFBQWE7d0JBQ2Isb0JBQW9CO3dCQUNwQixpQkFBaUI7d0JBQ2pCLHFCQUFxQjt3QkFDckIsaUJBQWlCO3dCQUNqQixlQUFlO3dCQUNmLHFCQUFxQjt3QkFDckIsbUJBQW1CO3dCQUNuQixxQkFBcUI7d0JBQ3JCLGdCQUFnQjtxQkFDaEIsQ0FBQztvQkFDRixXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBa0I7d0JBQ3RDLElBQUksQ0FBQzs0QkFDSixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQzlCLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2QsQ0FBRTt3QkFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUViLENBQUM7b0JBQ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUMsQ0FBQztZQUNGLEVBQUUsQ0FBQyxDQUFDLE1BQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE9BQU8sTUFBTSxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN0RSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyw0REFBNEQ7Z0JBQ3ZGLENBQUM7WUFDRixDQUFDO1lBQ0QsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ1csbUJBQVEsR0FBdEI7UUFDQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixDQUFDO1FBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUF1QixDQUFDO0lBQzNDLENBQUM7SUEyQ0Q7O09BRUc7SUFDSSw4QkFBUyxHQUFoQjtRQUNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDeEIsQ0FBQztJQUVNLDJCQUFNLEdBQWIsVUFBYyxRQUFnQjtRQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksK0JBQVUsR0FBakIsVUFBa0IsUUFBaUI7UUFDbEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNkLElBQU0sU0FBUyxHQUFlLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsSUFBSSxNQUFNLFNBQXNCLENBQUM7WUFDakMsSUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMzQyxJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM5QyxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQzt3QkFDOUIsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsUUFBUTt1QkFDdkMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUN0QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbEQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN4QyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs0QkFDeEIsQ0FBQzt3QkFDRixDQUFDO29CQUNGLENBQUM7b0JBQUEsQ0FBQztnQkFDSCxDQUFDO1lBQ0YsQ0FBQztZQUFBLENBQUM7WUFDRixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsTUFBTSxHQUFHLG1CQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7WUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7SUFDRixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLCtCQUFVLEdBQWpCLFVBQWtCLFFBQWlCO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFNLFNBQVMsR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFELElBQUksTUFBTSxTQUFzQixDQUFDO1lBQ2pDLElBQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztZQUMvQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JELE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUM5QixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsUUFBUTt1QkFDdkMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUN0QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDL0MsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLENBQUM7b0JBQ0YsQ0FBQztvQkFBQSxDQUFDO2dCQUNILENBQUM7WUFDRixDQUFDO1lBQUEsQ0FBQztZQUNGLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLEdBQUcsbUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEQsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNJLDJCQUFNLEdBQWIsVUFBYyxRQUFnQjtRQUM3QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFRTSxrQ0FBYSxHQUFwQixVQUFxQixRQUFnQixFQUFFLENBQXNCO1FBQzVELElBQUksUUFBa0IsQ0FBQztRQUN2QixJQUFNLE9BQU8sR0FBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsR0FBRyxJQUFJLG1CQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFNUUsNENBQTRDO1FBQzVDLElBQU0sWUFBWSxHQUFlLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0QsSUFBTSxpQkFBaUIsR0FBZSxFQUFFLENBQUM7UUFDekMsSUFBTSxVQUFVLEdBQVcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUM5QyxJQUFNLFFBQVEsR0FBVyxVQUFVLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQztRQUNwRCxJQUFJLE9BQTJCLENBQUM7UUFDaEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BILGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUVELG9EQUFvRDtRQUNwRCxJQUFJLFdBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQ25DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDbkQsUUFBUSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLHFDQUFxQztZQUNyQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FDL0IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQzNILENBQUM7UUFDSCxDQUFDO1FBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQWEsRUFBRSxDQUFhO1lBQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsSUFBSSxRQUE4QixDQUFDO1FBQ25DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzdDLElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLENBQUM7WUFDRixDQUFDO1lBQ0QsUUFBUSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDOUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLDhCQUFTLEdBQWhCLFVBQWlCLFFBQWdCO1FBQ2hDLElBQUksY0FBYyxHQUFXLFFBQVEsQ0FBQztRQUN0QyxJQUFJLFdBQVcsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxlQUFlO1FBQ2YsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDMUMsd0JBQXdCO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLDJDQUEyQztzQkFDbEYsUUFBUSxHQUFHLFdBQVcsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELGNBQWMsR0FBRyxXQUFXLENBQUM7WUFDN0IsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLGNBQWMsS0FBSyxTQUFTLElBQUksY0FBYyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7SUFpQk0sbUNBQWMsR0FBckIsVUFBc0IsUUFBZ0IsRUFBRSxDQUFzQixFQUFFLEdBQXlDO1FBQXpDLG9CQUFBLEVBQUEsTUFBdUIsZUFBZSxDQUFDLEVBQUU7UUFDeEcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBTSxTQUFTLEdBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLEdBQUcsSUFBSSxtQkFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlFLG1EQUFtRDtZQUNuRCxtQ0FBbUM7WUFDbkMsbUNBQW1DO1lBQ25DLG1DQUFtQztZQUNuQyxtQ0FBbUM7WUFFbkMsK0NBQStDO1lBQy9DLDZGQUE2RjtZQUU3Rix5RkFBeUY7WUFDekYsSUFBTSxXQUFXLEdBQWlCLElBQUksQ0FBQywwQkFBMEIsQ0FDaEUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQ3RFLENBQUM7WUFFRixtQ0FBbUM7WUFDbkMsSUFBSSxJQUFJLEdBQWEsbUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsc0JBQXNCO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLElBQU0sV0FBVyxHQUFXLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNoRSxJQUFNLFVBQVUsR0FBVyxVQUFVLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQzVFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLElBQUksV0FBVyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDOUUsSUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2xELG9CQUFvQjt3QkFDcEIsSUFBTSxNQUFNLEdBQVcsQ0FBQyxHQUFHLEtBQUssZUFBZSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0QsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLEdBQUcsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNsRixNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLEdBQUcsWUFBWSxHQUFHLElBQUksbUJBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUM5RSxDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDMUIsQ0FBQztZQUFBLENBQUM7UUFHSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxtQ0FBYyxHQUFyQixVQUFzQixRQUFnQixFQUFFLE9BQTRCO1FBQ25FLElBQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksZ0NBQVcsR0FBbEIsVUFBbUIsUUFBZ0IsRUFBRSxPQUE0QjtRQUNoRSxJQUFNLFFBQVEsR0FBYSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJLFNBQW1CLENBQUM7UUFFeEIsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsS0FBSyxRQUFRLENBQUMsSUFBSTtnQkFBRSxDQUFDO29CQUNwQixTQUFTLEdBQUcsbUJBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7Z0JBQUMsS0FBSyxDQUFDO1lBQ1IsS0FBSyxRQUFRLENBQUMsTUFBTTtnQkFBRSxDQUFDO29CQUN0QixTQUFTLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztnQkFDakMsQ0FBQztnQkFBQyxLQUFLLENBQUM7WUFDUixLQUFLLFFBQVEsQ0FBQyxRQUFRO2dCQUFFLENBQUM7b0JBQ3hCLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRixDQUFDO2dCQUFDLEtBQUssQ0FBQztZQUNSO2dCQUNDLFNBQVMsR0FBRyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsS0FBSyxDQUFDO1FBQ1IsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksaUNBQVksR0FBbkIsVUFBb0IsUUFBZ0IsRUFBRSxPQUE0QixFQUFFLFlBQTRCO1FBQTVCLDZCQUFBLEVBQUEsbUJBQTRCO1FBQy9GLElBQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFFdkMsOEJBQThCO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2VBQzNCLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxNQUFNLFNBQVEsQ0FBQztZQUNuQix5QkFBeUI7WUFDekIsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2IsQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNJLHdDQUFtQixHQUExQixVQUEyQixRQUFnQixFQUFFLFNBQThCO1FBQzFFLElBQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEYsSUFBTSxTQUFTLEdBQWUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hDLENBQUM7UUFDRixDQUFDO1FBQ0Qsd0JBQXdCO1FBQ3hCLDBCQUEwQjtRQUMxQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7SUFDRixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0kscUNBQWdCLEdBQXZCLFVBQXdCLFFBQWdCLEVBQUUsU0FBOEI7UUFDdkUsSUFBTSxFQUFFLEdBQWUsQ0FBQyxPQUFPLFNBQVMsS0FBSyxRQUFRLEdBQUcsSUFBSSxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLElBQU0sWUFBWSxHQUFlLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRW5FLDREQUE0RDtRQUM1RCxtQ0FBbUM7UUFDbkMsbUNBQW1DO1FBQ25DLG1DQUFtQztRQUNuQyxpRUFBaUU7UUFFakUsNEVBQTRFO1FBQzVFLDJDQUEyQztRQUUzQyxJQUFNLFdBQVcsR0FBaUIsSUFBSSxDQUFDLDBCQUEwQixDQUNoRSxRQUFRLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FDNUUsQ0FBQztRQUNGLElBQUksSUFBNEIsQ0FBQztRQUNqQyxJQUFJLFFBQWdDLENBQUM7UUFDckMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDN0MsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDaEYsb0NBQW9DO2dCQUNwQyxLQUFLLENBQUM7WUFDUCxDQUFDO1lBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFRCwwQkFBMEI7UUFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNWLDJFQUEyRTtZQUMzRSxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsa0JBQWtCO2dCQUNsQixJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTt1QkFDL0QsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDMUYseUJBQXlCO29CQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDNUIsQ0FBQztZQUNGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixDQUFDO1FBQ0YsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsMkZBQTJGO1lBQzNGLHNDQUFzQztZQUN0QyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztJQUNGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0kscUNBQWdCLEdBQXZCLFVBQXdCLFFBQWdCLEVBQUUsT0FBNEIsRUFBRSxjQUF3QjtRQUMvRixJQUFNLEVBQUUsR0FBZSxDQUFDLE9BQU8sT0FBTyxLQUFLLFFBQVEsR0FBRyxJQUFJLG1CQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFFekYscUNBQXFDO1FBQ3JDLElBQU0sV0FBVyxHQUFpQixJQUFJLENBQUMsd0JBQXdCLENBQzlELFFBQVEsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUNwRSxDQUFDO1FBRUYsb0NBQW9DO1FBQ3BDLElBQUksTUFBNEIsQ0FBQztRQUNqQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEQsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNuQyxLQUFLLENBQUM7WUFDUCxDQUFDO1FBQ0YsQ0FBQztRQUVELHdCQUF3QjtRQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixtREFBbUQ7WUFDbkQsTUFBTSxHQUFHLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxrQ0FBYSxHQUFwQixVQUFxQixRQUFnQixFQUFFLE9BQTRCLEVBQUUsY0FBd0I7UUFDNUYsSUFBTSxFQUFFLEdBQWUsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLEdBQUcsSUFBSSxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3pGLHFDQUFxQztRQUNyQyxJQUFNLFdBQVcsR0FBaUIsSUFBSSxDQUFDLHdCQUF3QixDQUM5RCxRQUFRLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FDcEUsQ0FBQztRQUVGLG9DQUFvQztRQUNwQyxJQUFJLE1BQTBCLENBQUM7UUFDL0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xELElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztnQkFDM0IsS0FBSyxDQUFDO1lBQ1AsQ0FBQztRQUNGLENBQUM7UUFFRCx3QkFBd0I7UUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsbURBQW1EO1lBQ25ELE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDYixDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSSw2Q0FBd0IsR0FBL0IsVUFBZ0MsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLE1BQWMsRUFBRSxjQUF3QjtRQUMzRyxnQkFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUV6RCxJQUFNLFNBQVMsR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFELElBQU0sTUFBTSxHQUFpQixFQUFFLENBQUM7UUFFaEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxJQUFJLFFBQVEsU0FBc0IsQ0FBQztZQUNuQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDM0MsSUFBTSxRQUFRLEdBQWEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FDekIsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLEVBQ3ZELFFBQVEsQ0FBQyxJQUFJLEVBQ2IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7Z0JBQ0QsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFhLEVBQUUsQ0FBYTtZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksK0NBQTBCLEdBQWpDLFVBQWtDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjO1FBQ25GLGdCQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBRXpELElBQU0sV0FBVyxHQUFXLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQU0sU0FBUyxHQUFXLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUc1RSxJQUFNLFNBQVMsR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFELGdCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztRQUVuRixJQUFNLE1BQU0sR0FBaUIsRUFBRSxDQUFDO1FBRWhDLElBQUksUUFBOEIsQ0FBQztRQUNuQyxJQUFJLGFBQWlDLENBQUM7UUFDdEMsSUFBSSxhQUFhLEdBQWEsbUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEQsSUFBSSxhQUFhLEdBQWEsbUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEQsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFNLFNBQVMsR0FBVyxRQUFRLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxJQUFJLG1CQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNySCxJQUFJLFNBQVMsR0FBYSxhQUFhLENBQUM7WUFDeEMsSUFBSSxTQUFTLEdBQWEsYUFBYSxDQUFDO1lBQ3hDLElBQUksTUFBTSxHQUFXLFVBQVUsQ0FBQztZQUVoQyxtQkFBbUI7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0SCxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFFNUIsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLEtBQUssUUFBUSxDQUFDLElBQUk7d0JBQ2pCLFNBQVMsR0FBRyxtQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDOUIsTUFBTSxHQUFHLEVBQUUsQ0FBQzt3QkFDWixLQUFLLENBQUM7b0JBQ1AsS0FBSyxRQUFRLENBQUMsTUFBTTt3QkFDbkIsU0FBUyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7d0JBQ2hDLE1BQU0sR0FBRyxFQUFFLENBQUM7d0JBQ1osS0FBSyxDQUFDO29CQUNQLEtBQUssUUFBUSxDQUFDLFFBQVE7d0JBQ3JCLCtFQUErRTt3QkFDL0UsZUFBZTt3QkFDZixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUNkLElBQU0sU0FBUyxHQUFlLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUNuRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQ0FDM0MsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUM5QixFQUFFLENBQUMsQ0FBQyxPQUFPLGFBQWEsS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQzdFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dDQUN4RixTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzt3Q0FDMUIsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0NBQzFCLENBQUM7Z0NBQ0YsQ0FBQzs0QkFDRixDQUFDOzRCQUFBLENBQUM7d0JBQ0gsQ0FBQzt3QkFDRCxLQUFLLENBQUM7Z0JBQ1IsQ0FBQztnQkFFRCwyQ0FBMkM7Z0JBQzNDLElBQU0sRUFBRSxHQUFXLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLEtBQUssU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQzdGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFFbEUsa0RBQWtEO2dCQUNsRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUM3QyxJQUFNLGNBQWMsR0FBaUIsSUFBSSxDQUFDLHdCQUF3QixDQUNqRSxRQUFRLENBQUMsUUFBUSxFQUNqQixhQUFhLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsRUFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQzNCLFNBQVMsQ0FDVCxDQUFDO29CQUNGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUNoRCxJQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO3dCQUMzQixTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzt3QkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNqRyxDQUFDO29CQUFBLENBQUM7Z0JBQ0gsQ0FBQztZQUNGLENBQUM7WUFFRCxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3BCLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDMUIsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUMxQixhQUFhLEdBQUcsU0FBUyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFhLEVBQUUsQ0FBYTtZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLGdDQUFXLEdBQWxCLFVBQW1CLFFBQWdCLEVBQUUsT0FBNEI7UUFDaEUsSUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRixJQUFNLFNBQVMsR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDakIsQ0FBQztRQUNGLENBQUM7UUFDRCx3QkFBd0I7UUFDeEIsMEJBQTBCO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdkMsQ0FBQztJQUNGLENBQUM7SUFPRDs7Ozs7O09BTUc7SUFDSSxpQ0FBWSxHQUFuQixVQUFvQixRQUFnQjtRQUNuQyxrREFBa0Q7UUFDbEQsd0JBQXdCO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCx3QkFBd0I7WUFDeEIsMEJBQTBCO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLGVBQWUsQ0FBQyxDQUFDO1lBQ3pELENBQUM7UUFDRixDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1FBQzlCLElBQUksY0FBYyxHQUFXLFFBQVEsQ0FBQztRQUN0QyxJQUFJLFdBQVcsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxlQUFlO1FBQ2YsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDMUMsd0JBQXdCO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLDJDQUEyQztzQkFDbEYsUUFBUSxHQUFHLFdBQVcsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELGNBQWMsR0FBRyxXQUFXLENBQUM7WUFDN0IsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCx3QkFBd0I7UUFDeEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDckQsSUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBSSxLQUFLLEdBQXVCLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUNuQixDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FDdkIsbUJBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNyRCxRQUFRLEVBQ1IsUUFBUSxLQUFLLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksbUJBQVEsRUFBRSxFQUMxRSxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUNsRCxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQ1osS0FBSyxDQUNMLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBVyxFQUFFLENBQVc7WUFDcEMsc0JBQXNCO1lBQ3RCLHdCQUF3QjtZQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDVixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFPRDs7Ozs7O09BTUc7SUFDSSxpQ0FBWSxHQUFuQixVQUFvQixRQUFnQjtRQUNuQyx1Q0FBdUM7UUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxHQUFHLFFBQVEsR0FBRyxlQUFlLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsb0JBQW9CO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1FBQzlCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3pDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFNLFFBQVEsR0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQU0sTUFBTSxHQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBTSxNQUFNLEdBQVcsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RyxJQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELElBQU0sS0FBSyxHQUFXLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZELElBQU0sU0FBUyxHQUFZLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsSUFBTSxTQUFTLEdBQW1CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFNLFdBQVcsR0FBVyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV6RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUN2QixRQUFRLEVBQ1IsTUFBTSxFQUNOLE1BQU0sRUFDTixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsV0FBVyxFQUNYLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSwwREFBMEQ7WUFDN0csSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzVCLG1CQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDdkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUM3QixDQUFDLENBQUM7UUFFTCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQVcsRUFBRSxDQUFXO1lBQ3BDLHdCQUF3QjtZQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNWLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFDSSxrQ0FBYSxHQUFwQixVQUFxQixJQUFZO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQzFCLENBQUM7SUFDRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksZ0NBQVcsR0FBbEIsVUFBbUIsRUFBVTtRQUM1QixFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNuQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsOEJBQThCO1FBQ25ELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCx3QkFBd0I7WUFDeEIsMEJBQTBCO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFRDs7O09BR0c7SUFDSSxnQ0FBVyxHQUFsQixVQUFtQixFQUFVO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksK0JBQVUsR0FBakIsVUFBa0IsRUFBVSxFQUFFLE1BQWM7UUFDM0MsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RSwwQkFBMEI7WUFDMUI7Z0JBQ0Msd0JBQXdCO2dCQUN4QiwwQkFBMEI7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVixDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNJLG1DQUFjLEdBQXJCLFVBQXNCLEVBQVU7UUFDL0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFVLENBQUMsQ0FBQztZQUNuQixDQUFDO1FBQ0YsQ0FBQztRQUNELHdCQUF3QjtRQUN4QiwwQkFBMEI7UUFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNWLE1BQU0sQ0FBQyxnQkFBTyxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGdDQUFXLEdBQWxCLFVBQW1CLEVBQU87UUFDekIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNaLEtBQUssR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2pDLEtBQUssR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQzVCLEtBQUssR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQzVCLEtBQUssR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQzVCLEtBQUssR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzdCLEtBQUssRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzVCLEtBQUssSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzlCO2dCQUNDLHdCQUF3QjtnQkFDeEIsMEJBQTBCO2dCQUMxQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNwQixDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUM7SUFFRixpQkFBQztBQUFELENBNStCQSxBQTQrQkMsSUFBQTtBQTUrQlksZ0NBQVU7QUFxL0J2Qjs7R0FFRztBQUNILHNCQUFzQixJQUFTO0lBQzlCLElBQU0sTUFBTSxHQUF3QixFQUFFLENBQUM7SUFFdkMsd0JBQXdCO0lBQ3hCLEVBQUUsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0Qsd0JBQXdCO0lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCx3QkFBd0I7SUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELGlCQUFpQjtJQUNqQixHQUFHLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBTSxPQUFPLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDbkMsd0NBQXdDO2dCQUN4Qyx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQVMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixHQUFHLFFBQVEsR0FBRyxnQkFBZ0IsR0FBVyxPQUFPLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztnQkFDckgsQ0FBQztZQUNGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxHQUFHLHFDQUFxQyxDQUFDLENBQUM7Z0JBQ3pGLENBQUM7Z0JBQ0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3pDLElBQU0sS0FBSyxHQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsd0JBQXdCO29CQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztvQkFDL0YsQ0FBQztvQkFDRCx3QkFBd0I7b0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLEdBQUcsUUFBUSxHQUFHLG9CQUFvQixDQUFDLENBQUM7b0JBQy9GLENBQUM7b0JBQ0Qsd0JBQXdCO29CQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLEdBQUcsaUNBQWlDLENBQUMsQ0FBQztvQkFDNUcsQ0FBQztvQkFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQyx3QkFBd0I7b0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxHQUFHLFFBQVEsR0FBRywyQ0FBMkMsQ0FBQyxDQUFDO29CQUN0SCxDQUFDO29CQUNELHdCQUF3QjtvQkFDeEIsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLEdBQUcsUUFBUSxHQUFHLGtDQUFrQyxDQUFDLENBQUM7b0JBQzdHLENBQUM7b0JBQ0Qsd0JBQXdCO29CQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLEdBQUcsaUNBQWlDLENBQUMsQ0FBQztvQkFDNUcsQ0FBQztvQkFDRCx3QkFBd0I7b0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDdkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLEdBQUcsUUFBUSxHQUFHLDJDQUEyQyxDQUFDLENBQUM7b0JBQ3RILENBQUM7b0JBQ0Qsd0JBQXdCO29CQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3ZFLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxHQUFHLFFBQVEsR0FBRyw0Q0FBNEMsQ0FBQyxDQUFDO29CQUN2SCxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDakUsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7b0JBQzNCLENBQUM7b0JBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUNqRSxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztvQkFDM0IsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsaUJBQWlCO0lBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFNLE9BQU8sR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLHdCQUF3QjtZQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixHQUFHLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFDRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDekMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2Qix3QkFBd0I7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNsRixDQUFDO2dCQUNBLHdCQUF3QjtnQkFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFDRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEMsd0JBQXdCO29CQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO29CQUMxRyxDQUFDO2dCQUNGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ2xHLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsMEJBQTBCLENBQUMsQ0FBQztnQkFDekYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt1QkFDL0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDL0QsQ0FBQyxDQUFDLENBQUM7b0JBQ0YsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHdDQUF3QyxDQUFDLENBQUM7Z0JBQ3ZHLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7dUJBQzdELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzRixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsNkNBQTZDLENBQUMsQ0FBQztnQkFDNUcsQ0FBQztnQkFDRCxJQUFNLElBQUksR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2pFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUMxQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDakUsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzFCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFvQixDQUFDO0FBQzdCLENBQUM7Ozs7QUNubUREOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7QUFFYiw4QkFBeUI7QUFDekIsZ0NBQTJCO0FBQzNCLGdDQUEyQjtBQUMzQiw4QkFBeUI7QUFDekIsK0JBQTBCO0FBQzFCLGtDQUE2QjtBQUM3Qiw2QkFBd0I7QUFDeEIsOEJBQXlCO0FBQ3pCLDhCQUF5QjtBQUN6QixrQ0FBNkI7QUFDN0IsZ0NBQTJCO0FBQzNCLG1DQUE4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTYgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uOiBhbnksIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG5cdGlmICghY29uZGl0aW9uKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3NlcnQ7XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xyXG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcblxyXG4vKipcclxuICogVXNlZCBmb3IgbWV0aG9kcyB0aGF0IHRha2UgYSB0aW1lc3RhbXAgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lQ29tcG9uZW50T3B0cyB7XHJcblx0LyoqXHJcblx0ICogWWVhciwgZGVmYXVsdCAxOTcwXHJcblx0ICovXHJcblx0eWVhcj86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBNb250aCAxLTEyLCBkZWZhdWx0IDFcclxuXHQgKi9cclxuXHRtb250aD86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBEYXkgb2YgbW9udGggMS0zMSwgZGVmYXVsdCAxXHJcblx0ICovXHJcblx0ZGF5PzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIEhvdXIgb2YgZGF5IDAtMjMsIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdGhvdXI/OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWludXRlIDAtNTksIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdG1pbnV0ZT86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBTZWNvbmQgMC01OSwgZGVmYXVsdCAwXHJcblx0ICovXHJcblx0c2Vjb25kPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5LCBkZWZhdWx0IDBcclxuXHQgKi9cclxuXHRtaWxsaT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWVzdGFtcCByZXByZXNlbnRlZCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRzIHtcclxuXHQvKipcclxuXHQgKiBZZWFyXHJcblx0ICovXHJcblx0eWVhcjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIDEtMTJcclxuXHQgKi9cclxuXHRtb250aDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIERheSBvZiBtb250aCAxLTMxXHJcblx0ICovXHJcblx0ZGF5OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogSG91ciAwLTIzXHJcblx0ICovXHJcblx0aG91cjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbnV0ZVxyXG5cdCAqL1xyXG5cdG1pbnV0ZTogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIFNlY29uZFxyXG5cdCAqL1xyXG5cdHNlY29uZDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICovXHJcblx0bWlsbGk6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcclxuXHRTdW5kYXksXHJcblx0TW9uZGF5LFxyXG5cdFR1ZXNkYXksXHJcblx0V2VkbmVzZGF5LFxyXG5cdFRodXJzZGF5LFxyXG5cdEZyaWRheSxcclxuXHRTYXR1cmRheVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0c1xyXG4gKi9cclxuZXhwb3J0IGVudW0gVGltZVVuaXQge1xyXG5cdE1pbGxpc2Vjb25kLFxyXG5cdFNlY29uZCxcclxuXHRNaW51dGUsXHJcblx0SG91cixcclxuXHREYXksXHJcblx0V2VlayxcclxuXHRNb250aCxcclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG5cdCAqL1xyXG5cdE1BWFxyXG59XHJcblxyXG4vKipcclxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXHJcbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcclxuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcclxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogcmV0dXJuIDE7XHJcblx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuSG91cjogcmV0dXJuIDYwICogNjAgKiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHJldHVybiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cclxuICogaWYgbmVjZXNzYXJ5LlxyXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxyXG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQ6IFRpbWVVbml0LCBhbW91bnQ6IG51bWJlciA9IDEpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzOiBzdHJpbmcpOiBUaW1lVW5pdCB7XHJcblx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG5cdFx0Y29uc3Qgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG5cdFx0aWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xyXG5cdFx0XHRyZXR1cm4gaTtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIFRydWUgaWZmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0Ly8gZnJvbSBXaWtpcGVkaWE6XHJcblx0Ly8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXHJcblx0Ly8gZWxzZSBsZWFwIHllYXJcclxuXHRpZiAoeWVhciAlIDQgIT09IDApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9IGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRzd2l0Y2ggKG1vbnRoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDM6XHJcblx0XHRjYXNlIDU6XHJcblx0XHRjYXNlIDc6XHJcblx0XHRjYXNlIDg6XHJcblx0XHRjYXNlIDEwOlxyXG5cdFx0Y2FzZSAxMjpcclxuXHRcdFx0cmV0dXJuIDMxO1xyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdGNhc2UgNjpcclxuXHRcdGNhc2UgOTpcclxuXHRcdGNhc2UgMTE6XHJcblx0XHRcdHJldHVybiAzMDtcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGg6IFwiICsgbW9udGgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XHJcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlPZlllYXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiTW9udGggb3V0IG9mIHJhbmdlXCIpO1xyXG5cdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcblx0bGV0IHllYXJEYXk6IG51bWJlciA9IDA7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IG1vbnRoOyBpKyspIHtcclxuXHRcdHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcblx0fVxyXG5cdHllYXJEYXkgKz0gKGRheSAtIDEpO1xyXG5cdHJldHVybiB5ZWFyRGF5O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XHJcblx0Y29uc3QgZW5kT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG5cdGNvbnN0IGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmID4gMCkge1xyXG5cdFx0ZGlmZiAtPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBiZWdpbk9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IDF9KTtcclxuXHRjb25zdCBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0cmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSB9KTtcclxuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XHJcblx0cmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHt5ZWFyLCBtb250aCwgZGF5fSk7XHJcblx0Y29uc3Qgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcblx0aWYgKGRpZmYgPiAwKSB7XHJcblx0XHRkaWZmIC09IDc7XHJcblx0fVxyXG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGNvbnN0IGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuXHRjb25zdCBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdFx0Ly8gV2VlayAxXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0XHRcdGlmIChtb250aCA+IDEpIHtcclxuXHRcdFx0XHQvLyBEZWZhdWx0IGNhc2VcclxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gSmFudWFyeVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y29uc3QgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdGNvbnN0IGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcblx0Ly8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiBsYXN0IHdlZWsgb3Igd2VlayAxIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0aWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XHJcblx0XHRpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xyXG5cdFx0XHQvLyBXZWVrIDEgb2YgbmV4dCBtb250aFxyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIE5vcm1hbCBjYXNlXHJcblx0bGV0IHJlc3VsdCA9IE1hdGguZmxvb3IoKGRheSAtIGZpcnN0TW9uZGF5KSAvIDcpICsgMTtcclxuXHRpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcclxuXHRcdHJlc3VsdCArPSAxO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0Ly8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcclxuXHRsZXQgcmVzdWx0OiBudW1iZXIgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XHJcblx0aWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcclxuXHRcdHJlc3VsdCAtPSA3O1xyXG5cdFx0aWYgKHJlc3VsdCA8IDApIHtcclxuXHRcdFx0cmVzdWx0ICs9IGV4cG9ydHMuZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtOdW1iZXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0Y29uc3QgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG5cclxuXHQvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuXHRpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcblx0XHRjb25zdCBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcclxuXHRcdGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG5cdGNvbnN0IHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XHJcblx0aWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuXHRcdC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXHJcblx0XHRjb25zdCB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG5cdFx0aWYgKGRveSA8IHdlZWtUd28pIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cclxuXHRpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcblx0XHQvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxyXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcblx0fVxyXG5cclxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcblx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xyXG5cdGFzc2VydCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcclxuXHRhc3NlcnQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XHJcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogVGltZUNvbXBvbmVudHMge1xyXG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcblxyXG5cdGxldCB0ZW1wOiBudW1iZXIgPSB1bml4TWlsbGlzO1xyXG5cdGNvbnN0IHJlc3VsdDogVGltZUNvbXBvbmVudHMgPSB7IHllYXI6IDAsIG1vbnRoOiAwLCBkYXk6IDAsIGhvdXI6IDAsIG1pbnV0ZTogMCwgc2Vjb25kOiAwLCBtaWxsaTogMH07XHJcblx0bGV0IHllYXI6IG51bWJlcjtcclxuXHRsZXQgbW9udGg6IG51bWJlcjtcclxuXHJcblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG5cdFx0cmVzdWx0Lm1pbGxpID0gdGVtcCAlIDEwMDA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSB0ZW1wICUgMjQ7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTcwO1xyXG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXIrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDE7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoKys7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG5cdFx0Ly8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTY5O1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXItLTtcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDEyO1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG5cdFx0XHRtb250aC0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogRmlsbCB5b3UgYW55IG1pc3NpbmcgdGltZSBjb21wb25lbnQgcGFydHMsIGRlZmF1bHRzIGFyZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBUaW1lQ29tcG9uZW50cyB7XHJcblx0Y29uc3QgaW5wdXQgPSB7XHJcblx0XHR5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuXHRcdG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG5cdFx0ZGF5OiB0eXBlb2YgY29tcG9uZW50cy5kYXkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmRheSA6IDEsXHJcblx0XHRob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuXHRcdG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG5cdFx0c2Vjb25kOiB0eXBlb2YgY29tcG9uZW50cy5zZWNvbmQgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnNlY29uZCA6IDAsXHJcblx0XHRtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuXHR9O1xyXG5cdHJldHVybiBpbnB1dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB5ZWFyLCBtb250aCwgZGF5IGV0YyBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuICogQHBhcmFtIG1pbnV0ZVx0TWludXRlIDAtNTlcclxuICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxyXG5cdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyLCBtaWxsaTogbnVtYmVyXHJcbik6IG51bWJlcjtcclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogbnVtYmVyO1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0YTogVGltZUNvbXBvbmVudE9wdHMgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG4pOiBudW1iZXIge1xyXG5cdGNvbnN0IGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSA6IGEpO1xyXG5cdGNvbnN0IGlucHV0OiBUaW1lQ29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpO1xyXG5cdHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoXHJcblx0XHRpbnB1dC5zZWNvbmQgKyBpbnB1dC5taW51dGUgKiA2MCArIGlucHV0LmhvdXIgKiAzNjAwICsgZGF5T2ZZZWFyKGlucHV0LnllYXIsIGlucHV0Lm1vbnRoLCBpbnB1dC5kYXkpICogODY0MDAgK1xyXG5cdFx0KGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcblx0XHRNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0Y29uc3QgZXBvY2hEYXk6IFdlZWtEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG5cdHJldHVybiAoZXBvY2hEYXkgKyBkYXlzKSAlIDc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRPZkRheShob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xyXG59XHJcblxyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuXHQgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXHJcblx0ICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUNvbXBvbmVudHMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21Vbml4KHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZFx0VGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZGZcdFdoaWNoIGZ1bmN0aW9ucyB0byB0YWtlIChnZXRYKCkgb3IgZ2V0VVRDWCgpKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbURhdGUoZDogRGF0ZSwgZGY6IERhdGVGdW5jdGlvbnMpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmIChkZiA9PT0gRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuXHRcdFx0XHR5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG5cdFx0XHRcdGhvdXI6IGQuZ2V0SG91cnMoKSwgbWludXRlOiBkLmdldE1pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFNlY29uZHMoKSwgbWlsbGk6IGQuZ2V0TWlsbGlzZWNvbmRzKClcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xyXG5cdFx0XHRcdHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXHJcblx0XHRcdFx0aG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDE5NzA7XHJcblx0XHRcdGxldCBtb250aDogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGRheTogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGhvdXI6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBmcmFjdGlvbk1pbGxpczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblxyXG5cdFx0XHQvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuXHRcdFx0YXNzZXJ0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcclxuXHJcblx0XHRcdC8vIHBhcnNlIG1haW4gcGFydFxyXG5cdFx0XHRjb25zdCBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcclxuXHRcdFx0aWYgKGlzQmFzaWNGb3JtYXQpIHtcclxuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXHJcblx0XHRcdFx0XHRcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG5cclxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxyXG5cdFx0XHRcdHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcblxyXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xyXG5cdFx0XHRcdGxldCBkYXRlQW5kVGltZTogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YXNzZXJ0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Y29uc3QgZnJhY3Rpb246IG51bWJlciA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0bGV0IHVuaXhNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgfSk7XHJcblx0XHRcdHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdW5peE1pbGxpczogbnVtYmVyO1xyXG5cdHB1YmxpYyBnZXQgdW5peE1pbGxpcygpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXhNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9jb21wb25lbnRzOiBUaW1lQ29tcG9uZW50cztcclxuXHRwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKTogVGltZUNvbXBvbmVudHMge1xyXG5cdFx0aWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSB1bml4VG9UaW1lTm9MZWFwU2Vjcyh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1bml4TWlsbGlzIG1pbGxpc2Vjb25kcyBzaW5jZSAxLTEtMTk3MFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhNaWxsaXM6IG51bWJlcik7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb21wb25lbnRzIFNlcGFyYXRlIHRpbWVzdGFtcCBjb21wb25lbnRzICh5ZWFyLCBtb250aCwgLi4uKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGE6IG51bWJlciB8IFRpbWVDb21wb25lbnRPcHRzKSB7XHJcblx0XHRpZiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9jb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoYSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXQgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0Z2V0IGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHRnZXQgc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdGdldCBtaWxsaSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogVGltZVN0cnVjdCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXHJcblx0ICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWxpZGF0ZSgpOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuZGF5ID49IDEgJiYgdGhpcy5jb21wb25lbnRzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoKVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kIDw9IDU5XHJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVTdHJ1Y3Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBCaW5hcnkgc2VhcmNoXHJcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcclxuICogQHBhcmFtIGNvbXBhcmUgRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIDwgMCBpZiBnaXZlbiBlbGVtZW50IGlzIGxlc3MgdGhhbiBzZWFyY2hlZCBlbGVtZW50IGV0Y1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleDxUPihhcnI6IFRbXSwgY29tcGFyZTogKGE6IFQpID0+IG51bWJlcik6IG51bWJlciB7XHJcblx0bGV0IG1pbkluZGV4ID0gMDtcclxuXHRsZXQgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcclxuXHRsZXQgY3VycmVudEluZGV4OiBudW1iZXI7XHJcblx0bGV0IGN1cnJlbnRFbGVtZW50OiBUO1xyXG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcclxuXHRpZiAoIWFycikge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0Ly8gb3V0IG9mIGJvdW5kc1xyXG5cdGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0aWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xyXG5cdH1cclxuXHQvLyBlbGVtZW50IGluIHJhbmdlXHJcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XHJcblx0XHRjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xyXG5cdFx0Y3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuXHJcblx0XHRpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcblx0XHRcdG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcblx0XHRcdG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBXZWVrRGF5LCBUaW1lU3RydWN0LCBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XHJcbmltcG9ydCB7IFRpbWVTb3VyY2UsIFJlYWxUaW1lU291cmNlIH0gZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuaW1wb3J0ICogYXMgZm9ybWF0IGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5pbXBvcnQgKiBhcyBwYXJzZUZ1bmNzIGZyb20gXCIuL3BhcnNlXCI7XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3codGltZVpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkIHwgbnVsbCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBmcm9tWm9uZT86IFRpbWVab25lKTogVGltZVN0cnVjdCB7XHJcblx0aWYgKGZyb21ab25lKSB7XHJcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIGxvY2FsVGltZS5jbG9uZSgpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZTogVGltZVN0cnVjdCwgdG9ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcclxuXHRpZiAodG9ab25lKSB7XHJcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XHJcblx0XHRyZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB1dGNUaW1lLmNsb25lKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcclxuXHJcblx0LyoqXHJcblx0ICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdXRjRGF0ZT86IFRpbWVTdHJ1Y3Q7XHJcblx0cHJpdmF0ZSBnZXQgdXRjRGF0ZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG5cdFx0XHR0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGU7XHJcblx0fVxyXG5cdHByaXZhdGUgc2V0IHV0Y0RhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcclxuXHRcdHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcclxuXHRcdHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lRGF0ZT86IFRpbWVTdHJ1Y3Q7XHJcblx0cHJpdmF0ZSBnZXQgem9uZURhdGUoKTogVGltZVN0cnVjdCB7XHJcblx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZTtcclxuXHR9XHJcblx0cHJpdmF0ZSBzZXQgem9uZURhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcclxuXHRcdHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XHJcblx0XHR0aGlzLl91dGNEYXRlID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxyXG5cdCAqIENhbiBiZSB1bmRlZmluZWQgZm9yIHVuYXdhcmUgdGltZXN0YW1wc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmU/OiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xyXG5cdCAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuXHQgKiB1c2UgdGhpcyBwcm9wZXJ0eSBmb3Igb2J0YWluaW5nIHRoZSBjdXJyZW50IHRpbWUuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB0aW1lU291cmNlOiBUaW1lU291cmNlID0gbmV3IFJlYWxUaW1lU291cmNlKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRcdGNvbnN0IG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShuLCBEYXRlRnVuY3Rpb25zLkdldCwgVGltZVpvbmUubG9jYWwoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3codGltZVpvbmU6IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG5cdCAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxyXG5cdCAqIEByZXR1cm5zIGEgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21FeGNlbChuOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiBuID09PSBcIm51bWJlclwiLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRjb25zdCB1bml4VGltZXN0YW1wID0gTWF0aC5yb3VuZCgobiAtIDI1NTY5KSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuXHQgKiBFLmcuIDIwMTUtMDItMjkgcmV0dXJucyBmYWxzZSAobm90IGEgbGVhcCB5ZWFyKVxyXG5cdCAqIGFuZCAyMDE1LTAzLTI5VDAyOjMwOjAwIHJldHVybnMgZmFsc2UgKGRheWxpZ2h0IHNhdmluZyB0aW1lIG1pc3NpbmcgaG91cilcclxuXHQgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXHJcblx0ICogQnkgZGVmYXVsdCwgcHJlLTE5NzAgZGF0ZXMgYWxzbyByZXR1cm4gZmFsc2Ugc2luY2UgdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBkb2VzIG5vdCBjb250YWluIGFjY3VyYXRlIGluZm9cclxuXHQgKiBiZWZvcmUgdGhhdC4gWW91IGNhbiBjaGFuZ2UgdGhhdCB3aXRoIHRoZSBhbGxvd1ByZTE5NzAgZmxhZy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBhbGxvd1ByZTE5NzAgKG9wdGlvbmFsLCBkZWZhdWx0IGZhbHNlKTogcmV0dXJuIHRydWUgZm9yIHByZS0xOTcwIGRhdGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBleGlzdHMoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIgPSAxLCBkYXk6IG51bWJlciA9IDEsXHJcblx0XHRob3VyOiBudW1iZXIgPSAwLCBtaW51dGU6IG51bWJlciA9IDAsIHNlY29uZDogbnVtYmVyID0gMCwgbWlsbGlzZWNvbmQ6IG51bWJlciA9IDAsXHJcblx0XHR6b25lOiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsIGFsbG93UHJlMTk3MDogYm9vbGVhbiA9IGZhbHNlXHJcblx0KTogYm9vbGVhbiB7XHJcblx0XHRpZiAoIWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSlcclxuXHRcdFx0fHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCFhbGxvd1ByZTE5NzAgJiYgeWVhciA8IDE5NzApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Y29uc3QgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcclxuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxyXG5cdFx0XHRcdCYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gQ3JlYXRlcyBjdXJyZW50IHRpbWUgaW4gbG9jYWwgdGltZXpvbmUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxyXG5cdCAqXHRcdCBpdCBtYXkgaW5jbHVkZSBhIHNwYWNlIGFuZCB0aGVuIGFuZCBJQU5BIHRpbWUgem9uZS5cclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCswMTowMFwiXHRcdFx0XHQoVVRDIG9mZnNldCB3aXRob3V0IGRheWxpZ2h0IHNhdmluZyB0aW1lKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFpcIlx0XHRcdFx0XHQoVVRDKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0aWYgZ2l2ZW4sIHRoZSBkYXRlIGluIHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGlzIHRpbWUgem9uZS5cclxuXHQgKlx0XHRcdFx0XHROb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcclxuXHQgKlx0XHRcdFx0XHRmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaXNvU3RyaW5nOiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIHN0cmluZyBpbiBnaXZlbiBMRE1MIGZvcm1hdC5cclxuXHQgKiBOT1RFOiBkb2VzIG5vdCBoYW5kbGUgZXJhcy9xdWFydGVycy93ZWVrcy93ZWVrZGF5cy5cclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlU3RyaW5nXHREYXRlK1RpbWUgc3RyaW5nLlxyXG5cdCAqIEBwYXJhbSBmb3JtYXQgVGhlIExETUwgZm9ybWF0IHRoYXQgdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxyXG5cdCAqXHRcdFx0XHRcdE5vdGUgdGhhdCBpdCBpcyBOT1QgQ09OVkVSVEVEIHRvIHRoZSB0aW1lIHpvbmUuIFVzZWZ1bFxyXG5cdCAqXHRcdFx0XHRcdGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIFlvdSBwcm92aWRlIGEgZGF0ZSwgdGhlbiB5b3Ugc2F5IHdoZXRoZXIgdG8gdGFrZSB0aGVcclxuXHQgKiBkYXRlLmdldFllYXIoKS9nZXRYeHggbWV0aG9kcyBvciB0aGUgZGF0ZS5nZXRVVENZZWFyKCkvZGF0ZS5nZXRVVENYeHggbWV0aG9kcyxcclxuXHQgKiBhbmQgdGhlbiB5b3Ugc3RhdGUgd2hpY2ggdGltZSB6b25lIHRoYXQgZGF0ZSBpcyBpbi5cclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKiBOb3RlIHRoYXQgdGhlIERhdGUgY2xhc3MgaGFzIGJ1Z3MgYW5kIGluY29uc2lzdGVuY2llcyB3aGVuIGNvbnN0cnVjdGluZyB0aGVtIHdpdGggdGltZXMgYXJvdW5kXHJcblx0ICogRFNUIGNoYW5nZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZVx0QSBkYXRlIG9iamVjdC5cclxuXHQgKiBAcGFyYW0gZ2V0dGVyc1x0U3BlY2lmaWVzIHdoaWNoIHNldCBvZiBEYXRlIGdldHRlcnMgY29udGFpbnMgdGhlIGRhdGUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZTogdGhlXHJcblx0ICpcdFx0XHRcdFx0RGF0ZS5nZXRYeHgoKSBtZXRob2RzIG9yIHRoZSBEYXRlLmdldFVUQ1h4eCgpIG1ldGhvZHMuXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgdGltZSB6b25lIHRoYXQgdGhlIGdpdmVuIGRhdGUgaXMgYXNzdW1lZCB0byBiZSBpbiAobWF5IGJlIHVuZGVmaW5lZCBvciBudWxsIGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGU6IERhdGUsIGdldEZ1bmNzOiBEYXRlRnVuY3Rpb25zLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XHJcblx0LyoqXHJcblx0ICogR2V0IGEgZGF0ZSBmcm9tIGEgVGltZVN0cnVjdFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHRtOiBUaW1lU3RydWN0LCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIE5vdGUgdGhhdCB1bmxpa2UgSmF2YVNjcmlwdCBkYXRlcyB3ZSByZXF1aXJlIGZpZWxkcyB0byBiZSBpbiBub3JtYWwgcmFuZ2VzLlxyXG5cdCAqIFVzZSB0aGUgYWRkKGR1cmF0aW9uKSBvciBzdWIoZHVyYXRpb24pIGZvciBhcml0aG1ldGljLlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyIChlLmcuIDIwMTQpXHJcblx0ICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggWzEtMTJdIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICogQHBhcmFtIGRheVx0VGhlIGRheSBvZiB0aGUgbW9udGggWzEtMzFdXHJcblx0ICogQHBhcmFtIGhvdXJcdFRoZSBob3VyIG9mIHRoZSBkYXkgWzAtMjQpXHJcblx0ICogQHBhcmFtIG1pbnV0ZVx0VGhlIG1pbnV0ZSBvZiB0aGUgaG91ciBbMC01OV1cclxuXHQgKiBAcGFyYW0gc2Vjb25kXHRUaGUgc2Vjb25kIG9mIHRoZSBtaW51dGUgWzAtNTldXHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kXHRUaGUgbWlsbGlzZWNvbmQgb2YgdGhlIHNlY29uZCBbMC05OTldXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgdGltZSB6b25lLCBvciBudWxsL3VuZGVmaW5lZCAoZm9yIHVuYXdhcmUgZGF0ZXMpXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpc2Vjb25kPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWRcclxuXHQpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0dGhlIHRpbWUgem9uZSB0aGF0IHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBpbiAodXN1YWxseSBVVEMpLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgZG8gbm90IGNhbGxcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdGExPzogYW55LCBhMj86IGFueSwgYTM/OiBhbnksXHJcblx0XHRoPzogbnVtYmVyLCBtPzogbnVtYmVyLCBzPzogbnVtYmVyLCBtcz86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsXHJcblx0KSB7XHJcblx0XHRzd2l0Y2ggKHR5cGVvZiAoYTEpKSB7XHJcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xyXG5cdFx0XHRcdGlmIChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGEyIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZXhwZWN0IHVuaXhUaW1lc3RhbXAgdG8gYmUgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGEyIGluc3RhbmNlb2YgVGltZVpvbmUgPyA8VGltZVpvbmU+YTIgOiB1bmRlZmluZWQpO1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSkpKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSg8bnVtYmVyPmExKSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IHllYXIgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IGRheSB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gPG51bWJlcj5hMTtcclxuXHRcdFx0XHRcdGxldCBtb250aDogbnVtYmVyID0gPG51bWJlcj5hMjtcclxuXHRcdFx0XHRcdGxldCBkYXk6IG51bWJlciA9IDxudW1iZXI+YTM7XHJcblx0XHRcdFx0XHRsZXQgaG91cjogbnVtYmVyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XHJcblx0XHRcdFx0XHRsZXQgbWludXRlOiBudW1iZXIgPSAodHlwZW9mIChtKSA9PT0gXCJudW1iZXJcIiA/IG0gOiAwKTtcclxuXHRcdFx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xyXG5cdFx0XHRcdFx0bGV0IG1pbGxpOiBudW1iZXIgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xyXG5cdFx0XHRcdFx0eWVhciA9IG1hdGgucm91bmRTeW0oeWVhcik7XHJcblx0XHRcdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG5cdFx0XHRcdFx0aG91ciA9IG1hdGgucm91bmRTeW0oaG91cik7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcblx0XHRcdFx0XHRtaWxsaSA9IG1hdGgucm91bmRTeW0obWlsbGkpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdG0gPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcclxuXHRcdFx0XHRcdGFzc2VydCh0bS52YWxpZGF0ZSgpLCBgaW52YWxpZCBkYXRlOiAke3RtLnRvU3RyaW5nKCl9YCk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKHRpbWVab25lKSA9PT0gXCJvYmplY3RcIiAmJiB0aW1lWm9uZSBpbnN0YW5jZW9mIFRpbWVab25lID8gdGltZVpvbmUgOiB1bmRlZmluZWQpO1xyXG5cclxuXHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0bTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYTIgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cclxuXHRcdFx0XHRcdGNvbnN0IGRhdGVTdHJpbmc6IHN0cmluZyA9IDxzdHJpbmc+YTE7XHJcblx0XHRcdFx0XHRjb25zdCBmb3JtYXRTdHJpbmc6IHN0cmluZyA9IDxzdHJpbmc+YTI7XHJcblx0XHRcdFx0XHRsZXQgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGEzIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdFx0em9uZSA9IDxUaW1lWm9uZT4oYTMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y29uc3QgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShkYXRlU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHpvbmUpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSBwYXJzZWQuem9uZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc3QgZ2l2ZW5TdHJpbmcgPSAoPHN0cmluZz5hMSkudHJpbSgpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgc3M6IHN0cmluZ1tdID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIDxzdHJpbmc+YTEgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gPFRpbWVab25lPihhMik7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gKHNzWzFdLnRyaW0oKSA/IFRpbWVab25lLnpvbmUoc3NbMV0pIDogdW5kZWZpbmVkKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG5cdFx0XHRcdFx0Ly8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiB7XHJcblx0XHRcdFx0aWYgKGExIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMiA/IGEyIDogdW5kZWZpbmVkKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKGExIGluc3RhbmNlb2YgRGF0ZSkge1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLFxyXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdFx0XHRhc3NlcnQoIWEzIHx8IGEzIGluc3RhbmNlb2YgVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGltZVpvbmUgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcclxuXHRcdFx0XHRcdGNvbnN0IGQ6IERhdGUgPSA8RGF0ZT4oYTEpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZGs6IERhdGVGdW5jdGlvbnMgPSA8RGF0ZUZ1bmN0aW9ucz4oYTIpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMyA/IGEzIDogdW5kZWZpbmVkKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XHJcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS5sb2NhbCgpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZGF0ZSBpcyBpbi4gTWF5IGJlIHVuZGVmaW5lZCBmb3IgdW5hd2FyZSBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZSgpOiBUaW1lWm9uZSB8IHVuZGVmaW5lZCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lQWJicmV2aWF0aW9uKGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgYXMgYSBEdXJhdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhNYXRoLnJvdW5kKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBzdGFuZGFyZCBvZmZzZXQgV0lUSE9VVCBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldER1cmF0aW9uKCk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy51dGNEYXRlKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcygwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcblx0ICovXHJcblx0cHVibGljIHVuaXhVdGNNaWxsaXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnllYXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcblx0ICogd2VlayBkYXkgbnVtYmVycylcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcclxuXHRcdHJldHVybiA8V2Vla0RheT5iYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjU2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy51dGNIb3VyKCksIHRoaXMudXRjTWludXRlKCksIHRoaXMudXRjU2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcclxuXHQgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG5cdCAqIE5vIGNvbnZlcnNpb24gaXMgZG9uZSwgdGhlIHZhbHVlIGlzIGp1c3QgYXNzdW1lZCB0byBiZSBpbiBhIGRpZmZlcmVudCB6b25lLlxyXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lIFRoZSBuZXcgdGltZSB6b25lXHJcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgd2l0aFpvbmUoem9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksXHJcblx0XHRcdHpvbmVcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRoaXMgZGF0ZSB0byB0aGUgZ2l2ZW4gdGltZSB6b25lIChpbi1wbGFjZSkuXHJcblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxyXG5cdCAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3pvbmUpIHsgLy8gaWYtc3RhdGVtZW50IHNhdGlzZmllcyB0aGUgY29tcGlsZXJcclxuXHRcdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcclxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKCF0aGlzLl91dGNEYXRlKSB7XHJcblx0XHRcdFx0XHR0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpOyAvLyBjYXVzZSB6b25lIC0+IHV0YyBjb252ZXJzaW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX3pvbmUgPSB1bmRlZmluZWQ7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcblx0ICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgb3IgdW5kZWZpbmVkIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXHJcblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9ab25lKHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG5cdFx0XHRyZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuXHRcdFx0cmVzdWx0Ll96b25lID0gem9uZTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdW5kZWZpbmVkKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXHJcblx0ICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuXHQgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHRvRGF0ZSgpOiBEYXRlIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgT3B0aW9uYWwuIFpvbmUgdG8gY29udmVydCB0bywgZGVmYXVsdCB0aGUgem9uZSB0aGUgZGF0ZXRpbWUgaXMgYWxyZWFkeSBpbi5cclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9FeGNlbCh0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XHJcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcclxuXHRcdGlmICh0aW1lWm9uZSAmJiAoIXRoaXMuX3pvbmUgfHwgIXRpbWVab25lLmVxdWFscyh0aGlzLl96b25lKSkpIHtcclxuXHRcdFx0ZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0XHR9XHJcblx0XHRjb25zdCBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuXHRcdGNvbnN0IHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNFeGNlbCgpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfdW5peFRpbWVTdGFtcFRvRXhjZWwobjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcblx0XHRjb25zdCBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgdGltZSBkdXJhdGlvbiByZWxhdGl2ZSB0byBVVEMuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKiBAcmV0dXJuIHRoaXMgKyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIHV0Y0hvdXIoKSBmaWVsZCwgYWRkaW5nIDEgbW9udGhcclxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxyXG5cdCAqIEFkZGluZyBhbiBhbW91bnQgb2YgdW5pdHMgbGVhdmVzIGxvd2VyIHVuaXRzIGludGFjdC4gRS5nLlxyXG5cdCAqIGFkZGluZyBhIG1vbnRoIHdpbGwgbGVhdmUgdGhlIGRheSgpIGZpZWxkIHVudG91Y2hlZCBpZiBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcclxuXHQgKiB0aGUgc3RhcnQgZGF0ZSB3YXMgYXQgdGhlIGVuZCBvZiBhIG1vbnRoLCBpLmUuIGNvbnRyYXJ5IHRvIEphdmFTY3JpcHRcclxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxyXG5cdCAqXHJcblx0ICogSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHV0YyB0aW1lIGZpZWxkcyBhcmUgc3RpbGwgdW50b3VjaGVkIGJ1dCBsb2NhbFxyXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEltcGxlbWVudGF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIHpvbmUgdGltZSwgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxyXG5cdCAqIGRhdGUgYnkgb25lLiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdGltZSBmaWVsZHMgbWF5IGFkZGl0aW9uYWxseVxyXG5cdCAqIGluY3JlYXNlIGJ5IHRoZSBEU1Qgb2Zmc2V0LCBpZiBhIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lIHdvdWxkXHJcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgYSB1bml0IG9mIHRpbWUgd2lsbCBsZWF2ZSBsb3dlci11bml0IGZpZWxkcyBpbnRhY3QsIHVubGVzcyB0aGUgcmVzdWx0XHJcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICovXHJcblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgYWRkTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG5cdFx0XHRjb25zdCBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG5vcm1hbGl6ZWQsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLCB1bmRlZmluZWQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG5cdCAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIG5lY2Vzc2FyeS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9hZGRUb1RpbWVTdHJ1Y3QodG06IFRpbWVTdHJ1Y3QsIGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0bGV0IHllYXI6IG51bWJlcjtcclxuXHRcdGxldCBtb250aDogbnVtYmVyO1xyXG5cdFx0bGV0IGRheTogbnVtYmVyO1xyXG5cdFx0bGV0IGhvdXI6IG51bWJlcjtcclxuXHRcdGxldCBtaW51dGU6IG51bWJlcjtcclxuXHRcdGxldCBzZWNvbmQ6IG51bWJlcjtcclxuXHRcdGxldCBtaWxsaTogbnVtYmVyO1xyXG5cclxuXHRcdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDEwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNjAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDM2MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogODY0MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcblx0XHRcdFx0Ly8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXHJcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5jb21wb25lbnRzLm1vbnRoKSkgLyAxMik7XHJcblx0XHRcdFx0XHRtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG5cdFx0XHRcdGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XHJcblx0XHRcdFx0c2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcblx0XHRcdFx0bWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG5cdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBhbW91bnQ7XHJcblx0XHRcdFx0bW9udGggPSB0bS5jb21wb25lbnRzLm1vbnRoO1xyXG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG5cdFx0XHRcdG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWIoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiICYmIGExIGluc3RhbmNlb2YgRHVyYXRpb24pIHtcclxuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRjb25zdCBhbW91bnQ6IG51bWJlciA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0IGFzIFRpbWVVbml0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWJMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKDxEdXJhdGlvbj5hMSkubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogPG51bWJlcj5hMSwgdW5pdCBhcyBUaW1lVW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZGlmZihvdGhlcjogRGF0ZVRpbWUpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG5cdCogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCovXHJcblx0cHVibGljIHN0YXJ0T2ZEYXkoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXJ0T2ZZZWFyKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPCBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPD0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gISEodGhpcy56b25lRGF0ZS5lcXVhbHMob3RoZXIuem9uZURhdGUpXHJcblx0XHRcdCYmICghdGhpcy5fem9uZSkgPT09ICghb3RoZXIuX3pvbmUpXHJcblx0XHRcdCYmICgoIXRoaXMuX3pvbmUgJiYgIW90aGVyLl96b25lKSB8fCAodGhpcy5fem9uZSAmJiBvdGhlci5fem9uZSAmJiB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKVxyXG5cdFx0XHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1heChvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XHJcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgczogc3RyaW5nID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuXHQgKiBzcGVjaWZpZWQgZm9ybWF0LiBUaGUgZm9ybWF0IGlzIGltcGxlbWVudGVkIGFzIHRoZSBMRE1MIHN0YW5kYXJkXHJcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXHJcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXHJcblx0ICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nLCBmb3JtYXRPcHRpb25zPzogZm9ybWF0LlBhcnRpYWxGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy5fem9uZSwgZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxyXG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2VcclxuXHQgKiBAcGFyYW0gZm9ybWF0IHRoZSBmb3JtYXQgdGhlIHN0cmluZyBpcyBpblxyXG5cdCAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHBhcnNlKHM6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRjb25zdCBzOiBzdHJpbmcgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IFRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfc3BsaXREYXRlRnJvbVRpbWVab25lKHM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcclxuXHRcdGxldCBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJ3aXRob3V0IERTVFwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdGNvbnN0IHJlc3VsdCA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUocy5zbGljZSgwLCBpbmRleCAtIDEpKTtcclxuXHRcdFx0cmVzdWx0WzFdICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCArIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgsIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuXHRcdGlmIChpbmRleCA8IDgpIHtcclxuXHRcdFx0aW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXHJcblx0XHR9XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIGR1cmF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgZHVyYXRpb24gd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYW4gYW1vdW50IGFuZCBhIHVuaXQgZS5nLlxyXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxyXG4gKlxyXG4gKiBJdCBoYXMgdHdvIHNldHMgb2YgZ2V0dGVyIGZ1bmN0aW9uczpcclxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxyXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxyXG4gKiAtIHNlY29uZHMoKSwgbWludXRlcygpLCBob3VycygpIGV0YywgcGx1cmFsIGZvcm06IHRoZXNlIHJldHVybiB0aGUgdG90YWwgYW1vdW50IHJlcHJlc2VudGVkIGluIHRoZSBjb3JyZXNwb25kaW5nIHVuaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiBHaXZlbiBhbW91bnQgaW4gY29uc3RydWN0b3JcclxuXHQgKi9cclxuXHRwcml2YXRlIF9hbW91bnQ6IG51bWJlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVW5pdFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3VuaXQ6IFRpbWVVbml0O1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuWWVhcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuSG91cik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWludXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gb2YgMFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gZnJvbSBhIHN0cmluZyBpbiBvbmUgb2YgdHdvIGZvcm1hdHM6XHJcblx0ICogMSkgWy1daGhoaFs6bW1bOnNzWy5ubm5dXV0gZS5nLiAnLTAxOjAwOjMwLjUwMSdcclxuXHQgKiAyKSBhbW91bnQgYW5kIHVuaXQgZS5nLiAnLTEgZGF5cycgb3IgJzEgeWVhcicuIFRoZSB1bml0IG1heSBiZSBpbiBzaW5ndWxhciBvciBwbHVyYWwgZm9ybSBhbmQgaXMgY2FzZS1pbnNlbnNpdGl2ZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSBkdXJhdGlvbiBmcm9tIGFuIGFtb3VudCBhbmQgYSB0aW1lIHVuaXQuXHJcblx0ICogQHBhcmFtIGFtb3VudFx0TnVtYmVyIG9mIHVuaXRzXHJcblx0ICogQHBhcmFtIHVuaXRcdEEgdGltZSB1bml0IGkuZS4gVGltZVVuaXQuU2Vjb25kLCBUaW1lVW5pdC5Ib3VyIGV0Yy4gRGVmYXVsdCBNaWxsaXNlY29uZC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihhbW91bnQ6IG51bWJlciwgdW5pdD86IFRpbWVVbml0KTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihpMT86IGFueSwgdW5pdD86IFRpbWVVbml0KSB7XHJcblx0XHRpZiAodHlwZW9mIChpMSkgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0Ly8gYW1vdW50K3VuaXQgY29uc3RydWN0b3JcclxuXHRcdFx0Y29uc3QgYW1vdW50ID0gPG51bWJlcj5pMTtcclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG5cdFx0XHR0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0Ly8gc3RyaW5nIGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Zyb21TdHJpbmcoPHN0cmluZz5pMSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IDA7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0Y29uc3QgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuXHRcdFx0Y29uc3QgcmVxTW9udGhzID0gKHVuaXQgPT09IFRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcblx0XHRcdGNvbnN0IHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcblx0ICogdGhlIHNhbWUgdW5pdC5cclxuXHQgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcblx0ICovXHJcblx0cHVibGljIGNvbnZlcnQodW5pdDogVGltZVVuaXQpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuU2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGVzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbnV0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG5cdCAqIGR1cmluZyBEU1QgY2hhbmdlcykuXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXHJcblx0ICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG5cdCAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlSG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXHJcblx0ICovXHJcblx0cHVibGljIGRheXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5EYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGhzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Nb250aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcblx0ICovXHJcblx0cHVibGljIHllYXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5ZZWFyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlWWVhcnMoKTogbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cclxuXHRcdFx0XHRiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhUaW1lVW5pdC5ZZWFyKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhbW91bnQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5pdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpZ25cclxuXHQgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzaWduKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xyXG5cdCAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFsc0V4YWN0KG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IG90aGVyLl91bml0KSB7XHJcblx0XHRcdHJldHVybiAodGhpcy5fYW1vdW50ID09PSBvdGhlci5fYW1vdW50KTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBUaW1lVW5pdC5Nb250aCAmJiBvdGhlci51bml0KCkgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbW9udGhzIGFuZCB5ZWFyc1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0IDwgVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IFRpbWVVbml0LkRheSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtaWxsaXNlY29uZHMgdGhyb3VnaCBob3Vyc1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBjYW5ub3QgY29tcGFyZSBkYXlzIHRvIGFueXRoaW5nIGVsc2VcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSAobW9zdCBwb3NpdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4KG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIG11bHRpcGx5KHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZSBieSBhIHVuaXRsZXNzIG51bWJlci4gVGhlIHJlc3VsdCBpcyBhIER1cmF0aW9uLCBlLmcuIDEgeWVhciAvIDIgPSAwLjUgeWVhclxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb247XHJcblx0LyoqXHJcblx0ICogRGl2aWRlIHRoaXMgRHVyYXRpb24gYnkgYSBEdXJhdGlvbi4gVGhlIHJlc3VsdCBpcyBhIHVuaXRsZXNzIG51bWJlciBlLmcuIDEgeWVhciAvIDEgbW9udGggPSAxMlxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogRHVyYXRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyIHwgRHVyYXRpb24pOiBEdXJhdGlvbiB8IG51bWJlciB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvIGR1cmF0aW9uXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSBkdXJhdGlvbi5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdCBhIGR1cmF0aW9uLlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHN1Yih2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYnMoKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXHJcblx0ICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0Z1bGxTdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cclxuXHQgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcclxuXHQgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0htc1N0cmluZyhmdWxsOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHRcdGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5zZWNvbmQoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcblx0XHRcdHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0c3dpdGNoICh0aGlzLl91bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BhcnQodW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdFx0bGV0IG5leHRVbml0OiBUaW1lVW5pdDtcclxuXHRcdC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxyXG5cdFx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuU2Vjb25kOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuTWludXRlOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IG5leHRVbml0ID0gVGltZVVuaXQuSG91cjsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjogbmV4dFVuaXQgPSBUaW1lVW5pdC5EYXk7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Nb250aDsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IG5leHRVbml0ID0gVGltZVVuaXQuWWVhcjsgYnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhUaW1lVW5pdC5ZZWFyKSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcclxuXHR9XHJcblxyXG5cclxuXHRwcml2YXRlIF9mcm9tU3RyaW5nKHM6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG5cdFx0aWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XHJcblx0XHRcdGxldCBzaWduOiBudW1iZXIgPSAxO1xyXG5cdFx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGVzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRsZXQgc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IG1pbGxpc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0Y29uc3QgcGFydHM6IHN0cmluZ1tdID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcblx0XHRcdGFzc2VydChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcblx0XHRcdFx0c2lnbiA9IC0xO1xyXG5cdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0aG91cnMgPSArcGFydHNbMF07XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRtaW51dGVzID0gK3BhcnRzWzFdO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcblx0XHRcdFx0Y29uc3Qgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcblx0XHRcdFx0c2Vjb25kcyA9ICtzZWNvbmRQYXJ0c1swXTtcclxuXHRcdFx0XHRpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRcdFx0bWlsbGlzZWNvbmRzID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc3QgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyArIDEwMDAgKiBzZWNvbmRzICsgNjAwMDAgKiBtaW51dGVzICsgMzYwMDAwMCAqIGhvdXJzKTtcclxuXHRcdFx0Ly8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG5cdFx0XHRpZiAobWlsbGlzZWNvbmRzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHNlY29uZHMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKG1pbnV0ZXMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGhvdXJzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuXHRcdFx0YXNzZXJ0KCFpc05hTihhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgY2Fubm90IHBhcnNlIGFtb3VudFwiKTtcclxuXHRcdFx0YXNzZXJ0KGlzRmluaXRlKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBhbW91bnQgaXMgaW5maW5pdGVcIik7XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuXHRcdFx0dGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBUb2tlbml6ZXIsIFRva2VuLCBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUgfSBmcm9tIFwiLi90b2tlblwiO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcclxuaW1wb3J0IHsgVGltZVpvbmUgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0T3B0aW9ucyB7XHJcblx0LyoqXHJcblx0ICogVGhlIGxldHRlciBpbmRpY2F0aW5nIGEgcXVhcnRlciBlLmcuIFwiUVwiIChiZWNvbWVzIFExLCBRMiwgUTMsIFE0KVxyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJMZXR0ZXI6IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXHJcblx0ICovXHJcblx0cXVhcnRlcldvcmQ6IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBRdWFydGVyIGFiYnJldmlhdGlvbnMgZS5nLiAxc3QsIDJuZCwgM3JkLCA0dGhcclxuXHQgKi9cclxuXHRxdWFydGVyQWJicmV2aWF0aW9uczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIG5hbWVzXHJcblx0ICovXHJcblx0bG9uZ01vbnRoTmFtZXM6IHN0cmluZ1tdO1xyXG5cdC8qKlxyXG5cdCAqIFRocmVlLWxldHRlciBtb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdHNob3J0TW9udGhOYW1lczogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogTW9udGggbGV0dGVyc1xyXG5cdCAqL1xyXG5cdG1vbnRoTGV0dGVyczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxyXG5cdCAqL1xyXG5cdGxvbmdXZWVrZGF5TmFtZXM6IHN0cmluZ1tdO1xyXG5cdHNob3J0V2Vla2RheU5hbWVzOiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVyczogc3RyaW5nW107XHJcblx0d2Vla2RheUxldHRlcnM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vLyB0b2RvIHRoaXMgY2FuIGJlIFBhcnRpYWw8Rm9ybWF0T3B0aW9ucz4gYnV0IGZvciBjb21wYXRpYmlsaXR5IHdpdGggXHJcbi8vIHByZS0yLjEgdHlwZXNjcmlwdCB1c2VycyB3ZSB3cml0ZSB0aGlzIG91dCBvdXJzZWx2ZXMgZm9yIGEgd2hpbGUgeWV0XHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFydGlhbEZvcm1hdE9wdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcclxuXHQgKi9cclxuXHRxdWFydGVyTGV0dGVyPzogc3RyaW5nO1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB3b3JkIGZvciAncXVhcnRlcidcclxuXHQgKi9cclxuXHRxdWFydGVyV29yZD86IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBRdWFydGVyIGFiYnJldmlhdGlvbnMgZS5nLiAxc3QsIDJuZCwgM3JkLCA0dGhcclxuXHQgKi9cclxuXHRxdWFydGVyQWJicmV2aWF0aW9ucz86IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBNb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdGxvbmdNb250aE5hbWVzPzogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogVGhyZWUtbGV0dGVyIG1vbnRoIG5hbWVzXHJcblx0ICovXHJcblx0c2hvcnRNb250aE5hbWVzPzogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogTW9udGggbGV0dGVyc1xyXG5cdCAqL1xyXG5cdG1vbnRoTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBXZWVrIGRheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBzdW5kYXlcclxuXHQgKi9cclxuXHRsb25nV2Vla2RheU5hbWVzPzogc3RyaW5nW107XHJcblx0c2hvcnRXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cdHdlZWtkYXlMZXR0ZXJzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9XHJcblx0W1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcblxyXG5leHBvcnQgY29uc3QgU0hPUlRfTU9OVEhfTkFNRVM6IHN0cmluZ1tdID1cclxuXHRbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcblxyXG5leHBvcnQgY29uc3QgTU9OVEhfTEVUVEVSUzogc3RyaW5nW10gPVxyXG5cdFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX1dFRUtEQVlfTkFNRVM6IHN0cmluZ1tdID1cclxuXHRbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBTSE9SVF9XRUVLREFZX05BTUVTOiBzdHJpbmdbXSA9XHJcblx0W1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFdFRUtEQVlfVFdPX0xFVFRFUlM6IHN0cmluZ1tdID1cclxuXHRbXCJTdVwiLCBcIk1vXCIsIFwiVHVcIiwgXCJXZVwiLCBcIlRoXCIsIFwiRnJcIiwgXCJTYVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBXRUVLREFZX0xFVFRFUlM6IHN0cmluZ1tdID1cclxuXHRbXCJTXCIsIFwiTVwiLCBcIlRcIiwgXCJXXCIsIFwiVFwiLCBcIkZcIiwgXCJTXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFFVQVJURVJfTEVUVEVSOiBzdHJpbmcgPSBcIlFcIjtcclxuZXhwb3J0IGNvbnN0IFFVQVJURVJfV09SRDogc3RyaW5nID0gXCJxdWFydGVyXCI7XHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX0FCQlJFVklBVElPTlM6IHN0cmluZ1tdID0gW1wiMXN0XCIsIFwiMm5kXCIsIFwiM3JkXCIsIFwiNHRoXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRk9STUFUX09QVElPTlM6IEZvcm1hdE9wdGlvbnMgPSB7XHJcblx0cXVhcnRlckxldHRlcjogUVVBUlRFUl9MRVRURVIsXHJcblx0cXVhcnRlcldvcmQ6IFFVQVJURVJfV09SRCxcclxuXHRxdWFydGVyQWJicmV2aWF0aW9uczogUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxyXG5cdGxvbmdNb250aE5hbWVzOiBMT05HX01PTlRIX05BTUVTLFxyXG5cdHNob3J0TW9udGhOYW1lczogU0hPUlRfTU9OVEhfTkFNRVMsXHJcblx0bW9udGhMZXR0ZXJzOiBNT05USF9MRVRURVJTLFxyXG5cdGxvbmdXZWVrZGF5TmFtZXM6IExPTkdfV0VFS0RBWV9OQU1FUyxcclxuXHRzaG9ydFdlZWtkYXlOYW1lczogU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuXHR3ZWVrZGF5VHdvTGV0dGVyczogV0VFS0RBWV9UV09fTEVUVEVSUyxcclxuXHR3ZWVrZGF5TGV0dGVyczogV0VFS0RBWV9MRVRURVJTXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChcclxuXHRkYXRlVGltZTogVGltZVN0cnVjdCxcclxuXHR1dGNUaW1lOiBUaW1lU3RydWN0LFxyXG5cdGxvY2FsWm9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQgfCBudWxsLFxyXG5cdGZvcm1hdFN0cmluZzogc3RyaW5nLFxyXG5cdGZvcm1hdE9wdGlvbnM6IFBhcnRpYWxGb3JtYXRPcHRpb25zID0ge31cclxuKTogc3RyaW5nIHtcclxuXHRjb25zdCBtZXJnZWRGb3JtYXRPcHRpb25zOiBQYXJ0aWFsRm9ybWF0T3B0aW9ucyA9IHt9O1xyXG5cdGZvciAoY29uc3QgbmFtZSBpbiBERUZBVUxUX0ZPUk1BVF9PUFRJT05TKSB7XHJcblx0XHRpZiAoREVGQVVMVF9GT1JNQVRfT1BUSU9OUy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG5cdFx0XHRtZXJnZWRGb3JtYXRPcHRpb25zW25hbWVdID0gKGZvcm1hdE9wdGlvbnNbbmFtZV0gIT09IHVuZGVmaW5lZCA/IGZvcm1hdE9wdGlvbnNbbmFtZV0gOiBERUZBVUxUX0ZPUk1BVF9PUFRJT05TW25hbWVdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNvbnN0IHRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuXHRjb25zdCB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcclxuXHRcdGxldCB0b2tlblJlc3VsdDogc3RyaW5nO1xyXG5cdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuWUVBUjpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlFVQVJURVI6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIG1lcmdlZEZvcm1hdE9wdGlvbnMgYXMgRm9ybWF0T3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkRm9ybWF0T3B0aW9ucyBhcyBGb3JtYXRPcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRGb3JtYXRPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnMpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5aT05FOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSA/IGxvY2FsWm9uZSA6IHVuZGVmaW5lZCwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuSURFTlRJVFk6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQgKz0gdG9rZW5SZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0LnRyaW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZXJhIChCQyBvciBBRClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RXJhKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGNvbnN0IEFEOiBib29sZWFuID0gZGF0ZVRpbWUueWVhciA+IDA7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQURcIiA6IFwiQkNcIik7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiAoQUQgPyBcIkFubm8gRG9taW5pXCIgOiBcIkJlZm9yZSBDaHJpc3RcIik7XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFllYXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJ5XCI6XHJcblx0XHRjYXNlIFwiWVwiOlxyXG5cdFx0Y2FzZSBcInJcIjpcclxuXHRcdFx0bGV0IHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcclxuXHRcdFx0XHR5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB5ZWFyVmFsdWU7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBxdWFydGVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0Y29uc3QgcXVhcnRlciA9IE1hdGguY2VpbChkYXRlVGltZS5tb250aCAvIDMpO1xyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5xdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGZvcm1hdE9wdGlvbnMucXVhcnRlcldvcmQ7XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbW9udGhcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLm1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiZFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJEXCI6XHJcblx0XHRcdGNvbnN0IGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHdlZWtEYXlOdW1iZXIgPSBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcyk7XHJcblxyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XHJcblx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcykudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLndlZWtkYXlMZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0Y2FzZSA2OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBEYXkgUGVyaW9kIChBTSBvciBQTSlcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lOiBUaW1lU3RydWN0KTogc3RyaW5nIHtcclxuXHRyZXR1cm4gKGRhdGVUaW1lLmhvdXIgPCAxMiA/IFwiQU1cIiA6IFwiUE1cIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIEhvdXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRsZXQgaG91ciA9IGRhdGVUaW1lLmhvdXI7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJoXCI6XHJcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XHJcblx0XHRcdGlmIChob3VyID09PSAwKSB7XHJcblx0XHRcdFx0aG91ciA9IDEyO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiSFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiS1wiOlxyXG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwia1wiOlxyXG5cdFx0XHRpZiAoaG91ciA9PT0gMCkge1xyXG5cdFx0XHRcdGhvdXIgPSAyNDtcclxuXHRcdFx0fTtcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbWludXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcInNcIjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiU1wiOlxyXG5cdFx0XHRjb25zdCBmcmFjdGlvbiA9IGRhdGVUaW1lLm1pbGxpO1xyXG5cdFx0XHRsZXQgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQoZnJhY3Rpb24udG9TdHJpbmcoKSwgMywgXCIwXCIpO1xyXG5cdFx0XHRmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkUmlnaHQoZnJhY3Rpb25TdHJpbmcsIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0XHRyZXR1cm4gZnJhY3Rpb25TdHJpbmcuc2xpY2UoMCwgdG9rZW4ubGVuZ3RoKTtcclxuXHRcdGNhc2UgXCJBXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLnNlY29uZE9mRGF5KGRhdGVUaW1lLmhvdXIsIGRhdGVUaW1lLm1pbnV0ZSwgZGF0ZVRpbWUuc2Vjb25kKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHRpbWUgem9uZS4gRm9yIHRoaXMsIHdlIG5lZWQgdGhlIGN1cnJlbnQgdGltZSwgdGhlIHRpbWUgaW4gVVRDIGFuZCB0aGUgdGltZSB6b25lXHJcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSB6b25lIFRoZSB0aW1lem9uZSBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWU6IFRpbWVTdHJ1Y3QsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkLCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGlmICghem9uZSkge1xyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG5cclxuXHRjb25zdCBvZmZzZXRIb3VyczogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0b2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcblx0Y29uc3Qgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZztcclxuXHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJPXCI6XHJcblx0XHRcdHJlc3VsdCA9IFwiVVRDXCI7XHJcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIitcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0Y2FzZSBcIlpcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0Y29uc3QgbmV3VG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdFx0XHRsZW5ndGg6IDQsXHJcblx0XHRcdFx0XHRcdHJhdzogXCJPT09PXCIsXHJcblx0XHRcdFx0XHRcdHN5bWJvbDogXCJPXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5aT05FXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0cmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJ6XCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInZcIjpcclxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJWXCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0Ly8gTm90IGltcGxlbWVudGVkXHJcblx0XHRcdFx0XHRyZXR1cm4gXCJ1bmtcIjtcclxuXHRcdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5uYW1lKCk7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiBcIlVua25vd25cIjtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwiWFwiOlxyXG5cdFx0Y2FzZSBcInhcIjpcclxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgb2Zmc2V0ID09PSAwKSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiWlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcblx0XHRcdFx0XHRpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IGFueSwgZDI6IGFueSk6IGFueSB7XHJcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xyXG5cdGFzc2VydChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGFzc2VydCgoZDEgaW5zdGFuY2VvZiBEYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIERhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBEdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIER1cmF0aW9uKSxcclxuXHRcdFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuXHRyZXR1cm4gZDEubWluKGQyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogRGF0ZVRpbWUsIGQyOiBEYXRlVGltZSk6IERhdGVUaW1lO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRHVyYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBEdXJhdGlvbiwgZDI6IER1cmF0aW9uKTogRHVyYXRpb247XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBhbnksIGQyOiBhbnkpOiBhbnkge1xyXG5cdGFzc2VydChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuXHRhc3NlcnQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRhc3NlcnQoKGQxIGluc3RhbmNlb2YgRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBEYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBEdXJhdGlvbiksXHJcblx0XHRcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcblx0cmV0dXJuIGQxLm1heChkMik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWJzKGQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdGFzc2VydChkLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xyXG5cdGFzc2VydChkIGluc3RhbmNlb2YgRHVyYXRpb24sIFwiZmlyc3QgYXJndW1lbnQgaXMgbm90IGEgRHVyYXRpb25cIik7XHJcblx0cmV0dXJuIGQuYWJzKCk7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBJbmRpY2F0ZXMgaG93IGEgRGF0ZSBvYmplY3Qgc2hvdWxkIGJlIGludGVycHJldGVkLlxyXG4gKiBFaXRoZXIgd2UgY2FuIHRha2UgZ2V0WWVhcigpLCBnZXRNb250aCgpIGV0YyBmb3Igb3VyIGZpZWxkXHJcbiAqIHZhbHVlcywgb3Igd2UgY2FuIHRha2UgZ2V0VVRDWWVhcigpLCBnZXRVdGNNb250aCgpIGV0YyB0byBkbyB0aGF0LlxyXG4gKi9cclxuZXhwb3J0IGVudW0gRGF0ZUZ1bmN0aW9ucyB7XHJcblx0LyoqXHJcblx0ICogVXNlIHRoZSBEYXRlLmdldEZ1bGxZZWFyKCksIERhdGUuZ2V0TW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuXHQgKi9cclxuXHRHZXQsXHJcblx0LyoqXHJcblx0ICogVXNlIHRoZSBEYXRlLmdldFVUQ0Z1bGxZZWFyKCksIERhdGUuZ2V0VVRDTW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuXHQgKi9cclxuXHRHZXRVVENcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBNYXRoIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5cclxuLyoqXHJcbiAqIEByZXR1cm4gdHJ1ZSBpZmYgZ2l2ZW4gYXJndW1lbnQgaXMgYW4gaW50ZWdlciBudW1iZXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ludChuOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRpZiAobiA9PT0gbnVsbCB8fCAhaXNGaW5pdGUobikpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0cmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdW5kcyAtMS41IHRvIC0yIGluc3RlYWQgb2YgLTFcclxuICogUm91bmRzICsxLjUgdG8gKzJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3VuZFN5bShuOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGlmIChuIDwgMCkge1xyXG5cdFx0cmV0dXJuIC0xICogTWF0aC5yb3VuZCgtMSAqIG4pO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChuKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdHJpY3RlciB2YXJpYW50IG9mIHBhcnNlRmxvYXQoKS5cclxuICogQHBhcmFtIHZhbHVlXHRJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB0aGUgZmxvYXQgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGZsb2F0LCBOYU4gb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRmxvYXQodmFsdWU6IHN0cmluZyk6IG51bWJlciB7XHJcblx0aWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcclxuXHRcdHJldHVybiBOdW1iZXIodmFsdWUpO1xyXG5cdH1cclxuXHRyZXR1cm4gTmFOO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpdmVNb2R1bG8odmFsdWU6IG51bWJlciwgbW9kdWxvOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGFzc2VydChtb2R1bG8gPj0gMSwgXCJtb2R1bG8gc2hvdWxkIGJlID49IDFcIik7XHJcblx0aWYgKHZhbHVlIDwgMCkge1xyXG5cdFx0cmV0dXJuICgodmFsdWUgJSBtb2R1bG8pICsgbW9kdWxvKSAlIG1vZHVsbztcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHZhbHVlICUgbW9kdWxvO1xyXG5cdH1cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50T3B0cywgVGltZVN0cnVjdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBUb2tlbml6ZXIsIFRva2VuLCBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUgfSBmcm9tIFwiLi90b2tlblwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcblxyXG4vKipcclxuICogVGltZVN0cnVjdCBwbHVzIHpvbmVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXdhcmVUaW1lU3RydWN0IHtcclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSBzdHJ1Y3RcclxuXHQgKi9cclxuXHR0aW1lOiBUaW1lU3RydWN0O1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgKGNhbiBiZSB1bmRlZmluZWQpXHJcblx0ICovXHJcblx0em9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0bjogbnVtYmVyO1xyXG5cdHJlbWFpbmluZzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUGFyc2Vab25lUmVzdWx0IHtcclxuXHR6b25lPzogVGltZVpvbmU7XHJcblx0cmVtYWluaW5nOiBzdHJpbmc7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gZGF0ZXRpbWUgc3RyaW5nIGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0XHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBMRE1MIGZvcm1hdCBzdHJpbmdcclxuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcclxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZzogc3RyaW5nLCBmb3JtYXRTdHJpbmc6IHN0cmluZywgYWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuIHtcclxuXHR0cnkge1xyXG5cdFx0cGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgdW5kZWZpbmVkLCBhbGxvd1RyYWlsaW5nKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFyc2VcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKFxyXG5cdGRhdGVUaW1lU3RyaW5nOiBzdHJpbmcsIGZvcm1hdFN0cmluZzogc3RyaW5nLCBvdmVycmlkZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQsIGFsbG93VHJhaWxpbmc6IGJvb2xlYW4gPSB0cnVlXHJcbik6IEF3YXJlVGltZVN0cnVjdCB7XHJcblx0aWYgKCFkYXRlVGltZVN0cmluZykge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZGF0ZSBnaXZlblwiKTtcclxuXHR9XHJcblx0aWYgKCFmb3JtYXRTdHJpbmcpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIGZvcm1hdCBnaXZlblwiKTtcclxuXHR9XHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IHRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuXHRcdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cdFx0Y29uc3QgdGltZTogVGltZUNvbXBvbmVudE9wdHMgPSB7IHllYXI6IC0xIH07XHJcblx0XHRsZXQgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XHJcblx0XHRsZXQgcG5yOiBQYXJzZU51bWJlclJlc3VsdDtcclxuXHRcdGxldCBwenI6IFBhcnNlWm9uZVJlc3VsdDtcclxuXHRcdGxldCByZW1haW5pbmc6IHN0cmluZyA9IGRhdGVUaW1lU3RyaW5nO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XHJcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUueWVhciA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLm1vbnRoID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUuZGF5ID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUubWludXRlID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcInNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IHBuci5uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLm1pbGxpID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJyR7dG9rZW4ucmF3fSdgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XHJcblx0XHRcdFx0XHRwenIgPSBzdHJpcFpvbmUocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHB6ci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHN0cmlwUmF3KHJlbWFpbmluZywgdG9rZW4ucmF3KTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgcmVzdWx0OiBBd2FyZVRpbWVTdHJ1Y3QgPSB7IHRpbWU6IG5ldyBUaW1lU3RydWN0KHRpbWUpLCB6b25lIH07XHJcblx0XHRpZiAoIXJlc3VsdC50aW1lLnZhbGlkYXRlKCkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicmVzdWx0aW5nIGRhdGUgaW52YWxpZFwiKTtcclxuXHRcdH1cclxuXHRcdC8vIGFsd2F5cyBvdmVyd3JpdGUgem9uZSB3aXRoIGdpdmVuIHpvbmVcclxuXHRcdGlmIChvdmVycmlkZVpvbmUpIHtcclxuXHRcdFx0cmVzdWx0LnpvbmUgPSBvdmVycmlkZVpvbmU7XHJcblx0XHR9XHJcblx0XHRpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcclxuXHRcdFx0XHRgaW52YWxpZCBkYXRlICcke2RhdGVUaW1lU3RyaW5nfScgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJyR7Zm9ybWF0U3RyaW5nfSc6IHRyYWlsaW5nIGNoYXJhY3RlcnM6ICdyZW1haW5pbmcnYFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0ZSAnJHtkYXRlVGltZVN0cmluZ30nIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICcke2Zvcm1hdFN0cmluZ30nOiAke2UubWVzc2FnZX1gKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzOiBzdHJpbmcpOiBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0Y29uc3QgcmVzdWx0OiBQYXJzZU51bWJlclJlc3VsdCA9IHtcclxuXHRcdG46IE5hTixcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0bGV0IG51bWJlclN0cmluZyA9IFwiXCI7XHJcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcclxuXHRcdG51bWJlclN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuXHRcdHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0Ly8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXHJcblx0d2hpbGUgKG51bWJlclN0cmluZy5jaGFyQXQoMCkgPT09IFwiMFwiICYmIG51bWJlclN0cmluZy5sZW5ndGggPiAxKSB7XHJcblx0XHRudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHRyZXN1bHQubiA9IHBhcnNlSW50KG51bWJlclN0cmluZywgMTApO1xyXG5cdGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIWlzRmluaXRlKHJlc3VsdC5uKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICcke251bWJlclN0cmluZ30nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmNvbnN0IFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xyXG5cclxuZnVuY3Rpb24gc3RyaXBab25lKHM6IHN0cmluZyk6IFBhcnNlWm9uZVJlc3VsdCB7XHJcblx0aWYgKHMubGVuZ3RoID09PSAwKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyB6b25lIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRjb25zdCByZXN1bHQ6IFBhcnNlWm9uZVJlc3VsdCA9IHtcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0bGV0IHpvbmVTdHJpbmcgPSBcIlwiO1xyXG5cdHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuXHRcdHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdGlmICh6b25lU3RyaW5nLnRyaW0oKSkge1xyXG5cdFx0cmVzdWx0LnpvbmUgPSBUaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpcFJhdyhzOiBzdHJpbmcsIGV4cGVjdGVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCByZW1haW5pbmcgPSBzO1xyXG5cdGxldCBlcmVtYWluaW5nID0gZXhwZWN0ZWQ7XHJcblx0d2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHRcdGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCAnJHtleHBlY3RlZH0nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuXHJcbi8qKlxyXG4gKiBTcGVjaWZpZXMgaG93IHRoZSBwZXJpb2Qgc2hvdWxkIHJlcGVhdCBhY3Jvc3MgdGhlIGRheVxyXG4gKiBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBQZXJpb2REc3Qge1xyXG5cdC8qKlxyXG5cdCAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcclxuXHQgKiB1bmFmZmVjdGVkIGJ5IERheWxpZ2h0IFNhdmluZyBUaW1lLlxyXG5cdCAqIEUuZy4gYSByZXBldGl0aW9uIG9mIG9uZSBob3VyIHdpbGwgdGFrZSBvbmUgcmVhbCBob3VyXHJcblx0ICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cclxuXHQgKiBMZWFwIHNlY29uZHMsIGxlYXAgZGF5cyBhbmQgbW9udGggbGVuZ3RoXHJcblx0ICogZGlmZmVyZW5jZXMgd2lsbCBzdGlsbCBtYWtlIHRoZSBpbnRlcnZhbHMgZGlmZmVyZW50LlxyXG5cdCAqL1xyXG5cdFJlZ3VsYXJJbnRlcnZhbHMsXHJcblxyXG5cdC8qKlxyXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxyXG5cdCAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cclxuXHQgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxyXG5cdCAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxyXG5cdCAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXHJcblx0ICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG5cdCAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXHJcblx0ICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cclxuXHQgKi9cclxuXHRSZWd1bGFyTG9jYWxUaW1lLFxyXG5cclxuXHQvKipcclxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXJcclxuXHQgKi9cclxuXHRNQVhcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSBQZXJpb2REc3QgdG8gYSBzdHJpbmc6IFwicmVndWxhciBpbnRlcnZhbHNcIiBvciBcInJlZ3VsYXIgbG9jYWwgdGltZVwiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocDogUGVyaW9kRHN0KTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHApIHtcclxuXHRcdGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM6IHJldHVybiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCI7XHJcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcclxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcclxuXHJcblx0LyoqXHJcblx0ICogUmVmZXJlbmNlIG1vbWVudCBvZiBwZXJpb2RcclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZWZlcmVuY2U6IERhdGVUaW1lO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludGVydmFsOiBEdXJhdGlvbjtcclxuXHJcblx0LyoqXHJcblx0ICogRFNUIGhhbmRsaW5nXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZHN0OiBQZXJpb2REc3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZWQgcmVmZXJlbmNlIGRhdGUsIGhhcyBkYXktb2YtbW9udGggPD0gMjggZm9yIE1vbnRobHlcclxuXHQgKiBwZXJpb2QsIG9yIGZvciBZZWFybHkgcGVyaW9kIGlmIG1vbnRoIGlzIEZlYnJ1YXJ5XHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50UmVmZXJlbmNlOiBEYXRlVGltZTtcclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplZCBpbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludEludGVydmFsOiBEdXJhdGlvbjtcclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplZCBpbnRlcm5hbCBEU1QgaGFuZGxpbmcuIElmIERTVCBoYW5kbGluZyBpcyBpcnJlbGV2YW50XHJcblx0ICogKGJlY2F1c2UgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgZG9lcyBub3QgaGF2ZSBEU1QpXHJcblx0ICogdGhlbiBpdCBpcyBzZXQgdG8gUmVndWxhckludGVydmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50RHN0OiBQZXJpb2REc3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxyXG5cdCAqIHRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGEgZmFjdG9yIG9mIDI0LiBTbyAxMjAgc2Vjb25kcyBpcyBhbGxvd2VkIHdoaWxlIDEyMSBzZWNvbmRzIGlzIG5vdC5cclxuXHQgKiBUaGlzIGlzIGR1ZSB0byB0aGUgZW5vcm1vdXMgcHJvY2Vzc2luZyBwb3dlciByZXF1aXJlZCBieSB0aGVzZSBjYXNlcy4gVGhleSBhcmUgbm90XHJcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcmVmZXJlbmNlIFRoZSByZWZlcmVuY2UgZGF0ZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXHJcblx0ICpcdFx0XHRcdHRoZSBkYXkgaXMgMjkgb3IgMzAgb3IgMzEsIHRoZSByZXN1bHRzIGFyZSBtYXhpbWlzZWQgdG8gZW5kLW9mLW1vbnRoLlxyXG5cdCAqIEBwYXJhbSBpbnRlcnZhbFx0VGhlIGludGVydmFsIG9mIHRoZSBwZXJpb2RcclxuXHQgKiBAcGFyYW0gZHN0XHRTcGVjaWZpZXMgaG93IHRvIGhhbmRsZSBEYXlsaWdodCBTYXZpbmcgVGltZS4gTm90IHJlbGV2YW50XHJcblx0ICogICAgICAgICAgICAgIGlmIHRoZSB0aW1lIHpvbmUgb2YgdGhlIHJlZmVyZW5jZSBkYXRldGltZSBkb2VzIG5vdCBoYXZlIERTVC5cclxuXHQgKiAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXHJcblx0XHRpbnRlcnZhbDogRHVyYXRpb24sXHJcblx0XHRkc3Q/OiBQZXJpb2REc3RcclxuXHQpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxyXG5cdCAqIHRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGEgZmFjdG9yIG9mIDI0LiBTbyAxMjAgc2Vjb25kcyBpcyBhbGxvd2VkIHdoaWxlIDEyMSBzZWNvbmRzIGlzIG5vdC5cclxuXHQgKiBUaGlzIGlzIGR1ZSB0byB0aGUgZW5vcm1vdXMgcHJvY2Vzc2luZyBwb3dlciByZXF1aXJlZCBieSB0aGVzZSBjYXNlcy4gVGhleSBhcmUgbm90XHJcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcmVmZXJlbmNlIFRoZSByZWZlcmVuY2Ugb2YgdGhlIHBlcmlvZC4gSWYgdGhlIHBlcmlvZCBpcyBpbiBNb250aHMgb3IgWWVhcnMsIGFuZFxyXG5cdCAqXHRcdFx0XHR0aGUgZGF5IGlzIDI5IG9yIDMwIG9yIDMxLCB0aGUgcmVzdWx0cyBhcmUgbWF4aW1pc2VkIHRvIGVuZC1vZi1tb250aC5cclxuXHQgKiBAcGFyYW0gYW1vdW50XHRUaGUgYW1vdW50IG9mIHVuaXRzLlxyXG5cdCAqIEBwYXJhbSB1bml0XHRUaGUgdW5pdC5cclxuXHQgKiBAcGFyYW0gZHN0XHRTcGVjaWZpZXMgaG93IHRvIGhhbmRsZSBEYXlsaWdodCBTYXZpbmcgVGltZS4gTm90IHJlbGV2YW50XHJcblx0ICogICAgICAgICAgICAgIGlmIHRoZSB0aW1lIHpvbmUgb2YgdGhlIHJlZmVyZW5jZSBkYXRldGltZSBkb2VzIG5vdCBoYXZlIERTVC5cclxuXHQgKiAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXHJcblx0XHRhbW91bnQ6IG51bWJlcixcclxuXHRcdHVuaXQ6IFRpbWVVbml0LFxyXG5cdFx0ZHN0PzogUGVyaW9kRHN0XHJcblx0KTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxyXG5cdFx0YW1vdW50T3JJbnRlcnZhbDogYW55LFxyXG5cdFx0dW5pdE9yRHN0PzogYW55LFxyXG5cdFx0Z2l2ZW5Ec3Q/OiBQZXJpb2REc3RcclxuXHQpIHtcclxuXHJcblx0XHRsZXQgaW50ZXJ2YWw6IER1cmF0aW9uO1xyXG5cdFx0bGV0IGRzdDogUGVyaW9kRHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcblx0XHRpZiAodHlwZW9mIChhbW91bnRPckludGVydmFsKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRpbnRlcnZhbCA9IDxEdXJhdGlvbj5hbW91bnRPckludGVydmFsO1xyXG5cdFx0XHRkc3QgPSA8UGVyaW9kRHN0PnVuaXRPckRzdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IFRpbWVVbml0Lk1BWCwgXCJJbnZhbGlkIHVuaXRcIik7XHJcblx0XHRcdGludGVydmFsID0gbmV3IER1cmF0aW9uKDxudW1iZXI+YW1vdW50T3JJbnRlcnZhbCwgPFRpbWVVbml0PnVuaXRPckRzdCk7XHJcblx0XHRcdGRzdCA9IGdpdmVuRHN0IGFzIFBlcmlvZERzdDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcclxuXHRcdGFzc2VydCghIXJlZmVyZW5jZSwgXCJSZWZlcmVuY2UgdGltZSBub3QgZ2l2ZW5cIik7XHJcblx0XHRhc3NlcnQoaW50ZXJ2YWwuYW1vdW50KCkgPiAwLCBcIkFtb3VudCBtdXN0IGJlIHBvc2l0aXZlIG5vbi16ZXJvLlwiKTtcclxuXHRcdGFzc2VydChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XHJcblxyXG5cdFx0dGhpcy5fcmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG5cdFx0dGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcclxuXHRcdHRoaXMuX2RzdCA9IGRzdDtcclxuXHRcdHRoaXMuX2NhbGNJbnRlcm5hbFZhbHVlcygpO1xyXG5cclxuXHRcdC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxyXG5cdFx0Ly8gTm90ZSB3ZSB1c2UgaW50ZXJuYWwgYW1vdW50cyB0byBkZWNpZGUgdGhpcyBiZWNhdXNlIGFjdHVhbGx5IGl0IGlzIHN1cHBvcnRlZCBpZlxyXG5cdFx0Ly8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cclxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcclxuXHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdGFzc2VydCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDE0NDAsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBQZXJpb2Qge1xyXG5cdFx0cmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyByZWZlcmVuY2UoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERFUFJFQ0FURUQ6IG9sZCBuYW1lIGZvciB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnQoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBpbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnRlcnZhbCgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHVuaXQgb2YgdGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIHVuaXQoKTogVGltZVVuaXQge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkc3QoKTogUGVyaW9kRHN0IHtcclxuXHRcdHJldHVybiB0aGlzLl9kc3Q7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGdyZWF0ZXIgdGhhblxyXG5cdCAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuXHQgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGFmdGVyIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcblx0ICogQHJldHVybiB0aGUgZmlyc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGFmdGVyIGZyb21EYXRlLCBnaXZlblxyXG5cdCAqXHRcdFx0aW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmRGaXJzdChmcm9tRGF0ZTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRhc3NlcnQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSxcclxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG5cdFx0bGV0IGFwcHJveDogRGF0ZVRpbWU7XHJcblx0XHRsZXQgYXBwcm94MjogRGF0ZVRpbWU7XHJcblx0XHRsZXQgYXBwcm94TWluOiBEYXRlVGltZTtcclxuXHRcdGxldCBwZXJpb2RzOiBudW1iZXI7XHJcblx0XHRsZXQgZGlmZjogbnVtYmVyO1xyXG5cdFx0bGV0IG5ld1llYXI6IG51bWJlcjtcclxuXHRcdGxldCByZW1haW5kZXI6IG51bWJlcjtcclxuXHRcdGxldCBpbWF4OiBudW1iZXI7XHJcblx0XHRsZXQgaW1pbjogbnVtYmVyO1xyXG5cdFx0bGV0IGltaWQ6IG51bWJlcjtcclxuXHJcblx0XHRjb25zdCBub3JtYWxGcm9tID0gdGhpcy5fbm9ybWFsaXplRGF5KGZyb21EYXRlLnRvWm9uZSh0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpID09PSAxKSB7XHJcblx0XHRcdC8vIHNpbXBsZSBjYXNlczogYW1vdW50IGVxdWFscyAxIChlbGltaW5hdGVzIG5lZWQgZm9yIHNlYXJjaGluZyBmb3IgcmVmZXJlbmNlaW5nIHBvaW50KVxyXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4oZnJvbURhdGUpKSB7XHJcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIEFtb3VudCBpcyBub3QgMSxcclxuXHRcdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuXHRcdFx0XHQvLyBhcHBseSB0byBVVEMgdGltZVxyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdFx0Ly8gb25seSAyNSBsZWFwIHNlY29uZHMgaGF2ZSBldmVyIGJlZW4gYWRkZWQgc28gdGhpcyBzaG91bGQgc3RpbGwgYmUgT0suXHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taW51dGVzKCk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gKG5vcm1hbEZyb20udXRjWWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y1llYXIoKSkgKiAxMiArXHJcblx0XHRcdFx0XHRcdFx0KG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcclxuXHRcdFx0XHRcdFx0Ly8gVGhlIC0xIGJlbG93IGlzIGJlY2F1c2UgdGhlIGRheS1vZi1tb250aCBvZiByZWZlcmVuY2UgZGF0ZSBtYXkgYmUgYWZ0ZXIgdGhlIGRheSBvZiB0aGUgZnJvbURhdGVcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5ZZWFyKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgdGltZXMuIElmIHRoZSB1bml0IGlzIGxlc3MgdGhhbiBhIGRheSwgd2UgcmVmZXJlbmNlIGVhY2ggZGF5IGFuZXdcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTAwMCAmJiAoMTAwMCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBtaWxsaXNlY29uZCBlYWNoIHNlY29uZCwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXHJcblx0XHRcdFx0XHRcdFx0Ly8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyB0b2RvXHJcblx0XHRcdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaWxsaXNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdFx0aW1pbiA9IDA7XHJcblx0XHRcdFx0XHRcdFx0d2hpbGUgKGltYXggPj0gaW1pbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuXHRcdFx0XHRcdFx0XHRcdGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveDI7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbWluID0gaW1pZCArIDE7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbWF4ID0gaW1pZCAtIDE7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBzZWNvbmQgZWFjaCBtaW51dGUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuXHRcdFx0XHRcdFx0XHQvLyBtaW51cyBvbmUgbWludXRlIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBzZWNvbmRzXHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHQuc3ViTG9jYWwoMSwgVGltZVVuaXQuTWludXRlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0byB0YWtlXHJcblx0XHRcdFx0XHRcdFx0Ly8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0LlNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdFx0aW1pbiA9IDA7XHJcblx0XHRcdFx0XHRcdFx0d2hpbGUgKGltYXggPj0gaW1pbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuXHRcdFx0XHRcdFx0XHRcdGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94MjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIGhvdXIgdGhpcy5faW50UmVmZXJlbmNlYXJ5IGVhY2ggdGltZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZSBtaW51cyBvbmUgaG91clxyXG5cdFx0XHRcdFx0XHRcdC8vIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaW51dGVzLCBzZWNvbmRzXHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5Ib3VyKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBmaXQgaW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHByZXZpb3VzIGRheVxyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcblx0XHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoMjQgKiA2MCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaW51dGUpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcblx0XHRcdFx0XHRcdC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG5cdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0LkhvdXIpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5Ib3VyKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0XHRcdC8vIHdlIGRvbid0IGhhdmUgbGVhcCBkYXlzLCBzbyB3ZSBjYW4gYXBwcm94aW1hdGUgYnkgY2FsY3VsYXRpbmcgd2l0aCBVVEMgdGltZXN0YW1wc1xyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpKSAqIDEyICtcclxuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwodGhpcy5faW50ZXJ2YWwubXVsdGlwbHkocGVyaW9kcykpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcclxuXHRcdFx0XHRcdFx0Ly8gVGhlIC0xIGJlbG93IGlzIGJlY2F1c2UgdGhlIGRheS1vZi1tb250aCBvZiByZWZlcmVuY2UgZGF0ZSBtYXkgYmUgYWZ0ZXIgdGhlIGRheSBvZiB0aGUgZnJvbURhdGVcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdG5ld1llYXIgPSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpICsgcGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bmV3WWVhciwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBoYXMgTVVDSCBiZXR0ZXIgcGVyZm9ybWFuY2UgdGhhbiBmaW5kRmlyc3QuXHJcblx0ICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXHJcblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cclxuXHQgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIGFkZC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cclxuXHQgKiBAcmV0dXJuIChwcmV2ICsgY291bnQgKiBwZXJpb2QpLCBpbiB0aGUgc2FtZSB0aW1lem9uZSBhcyBwcmV2LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBmaW5kTmV4dChwcmV2OiBEYXRlVGltZSwgY291bnQ6IG51bWJlciA9IDEpOiBEYXRlVGltZSB7XHJcblx0XHRhc3NlcnQoISFwcmV2LCBcIlByZXYgbXVzdCBiZSBnaXZlblwiKTtcclxuXHRcdGFzc2VydCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhcHJldi56b25lKCksXHJcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiAoY291bnQpID09PSBcIm51bWJlclwiLCBcIkNvdW50IG11c3QgYmUgYSBudW1iZXJcIik7XHJcblx0XHRhc3NlcnQoTWF0aC5mbG9vcihjb3VudCkgPT09IGNvdW50LCBcIkNvdW50IG11c3QgYmUgYW4gaW50ZWdlclwiKTtcclxuXHRcdGNvbnN0IG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcclxuXHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZChcclxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXHJcblx0XHRcdCkuY29udmVydChwcmV2LnpvbmUoKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGRMb2NhbChcclxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXHJcblx0XHRcdCkuY29udmVydChwcmV2LnpvbmUoKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgbGVzcyB0aGFuXHJcblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcblx0ICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBiZWZvcmUgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuXHQgKiBAcmV0dXJuIHRoZSBsYXN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBiZWZvcmUgZnJvbURhdGUsIGdpdmVuXHJcblx0ICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZExhc3QoZnJvbTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XHJcblx0XHRpZiAocmVzdWx0LmVxdWFscyhmcm9tKSkge1xyXG5cdFx0XHRyZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHJlc3VsdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXHJcblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cclxuXHQgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG5cdCAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmRQcmV2KG5leHQ6IERhdGVUaW1lLCBjb3VudDogbnVtYmVyID0gMSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgb24gYSBwZXJpb2QgYm91bmRhcnlcclxuXHQgKiAoZXhwZW5zaXZlISlcclxuXHQgKi9cclxuXHRwdWJsaWMgaXNCb3VuZGFyeShvY2N1cnJlbmNlOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKCFvY2N1cnJlbmNlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGFzc2VydChcclxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLFxyXG5cdFx0XHRcIlRoZSBvY2N1cnJlbmNlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcclxuXHRcdCk7XHJcblx0XHRyZXR1cm4gKHRoaXMuZmluZEZpcnN0KG9jY3VycmVuY2Uuc3ViKER1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cclxuXHQgKiBpLmUuIGEgcGVyaW9kIG9mIDI0IGhvdXJzIGlzIGVxdWFsIHRvIG9uZSBvZiAxIGRheSBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgVVRDIHJlZmVyZW5jZSBtb21lbnRcclxuXHQgKiBhbmQgc2FtZSBkc3QuXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogUGVyaW9kKTogYm9vbGVhbiB7XHJcblx0XHQvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcclxuXHRcdGlmICghdGhpcy5pc0JvdW5kYXJ5KG90aGVyLl9yZWZlcmVuY2UpIHx8ICF0aGlzLl9pbnRJbnRlcnZhbC5lcXVhbHMob3RoZXIuX2ludEludGVydmFsKSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRjb25zdCByZWZab25lID0gdGhpcy5fcmVmZXJlbmNlLnpvbmUoKTtcclxuXHRcdGNvbnN0IG90aGVyWm9uZSA9IG90aGVyLl9yZWZlcmVuY2Uuem9uZSgpO1xyXG5cdFx0Y29uc3QgdGhpc0lzUmVndWxhciA9ICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFyZWZab25lIHx8IHJlZlpvbmUuaXNVdGMoKSk7XHJcblx0XHRjb25zdCBvdGhlcklzUmVndWxhciA9IChvdGhlci5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscyB8fCAhb3RoZXJab25lIHx8IG90aGVyWm9uZS5pc1V0YygpKTtcclxuXHRcdGlmICh0aGlzSXNSZWd1bGFyICYmIG90aGVySXNSZWd1bGFyKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gb3RoZXIuX2ludERzdCAmJiByZWZab25lICYmIG90aGVyWm9uZSAmJiByZWZab25lLmVxdWFscyhvdGhlclpvbmUpKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogUGVyaW9kKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcclxuXHRcdFx0JiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLl9pbnRlcnZhbClcclxuXHRcdFx0JiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXHJcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFIXHJcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUFQxTSAgIChvbmUgbWludXRlKVxyXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXHJcblx0ICovXHJcblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXHJcblx0ICogXCIxMCB5ZWFycywgcmVmZXJlbmNlaW5nIGF0IDIwMTQtMDMtMDFUMTI6MDA6MDAgRXVyb3BlL0Ftc3RlcmRhbSwga2VlcGluZyByZWd1bGFyIGludGVydmFsc1wiLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuXHRcdC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcclxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcblx0XHRcdHJlc3VsdCArPSBcIiwga2VlcGluZyBcIiArIHBlcmlvZERzdFRvU3RyaW5nKHRoaXMuX2RzdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbUGVyaW9kOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2NvcnJlY3REYXkoZDogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCBNYXRoLm1pbihiYXNpY3MuZGF5c0luTW9udGgoZC55ZWFyKCksIGQubW9udGgoKSksIHRoaXMuX3JlZmVyZW5jZS5kYXkoKSksXHJcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcblx0ICogdG8gPD0gMjguXHJcblx0ICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25vcm1hbGl6ZURheShkOiBEYXRlVGltZSwgYW55bW9udGg6IGJvb2xlYW4gPSB0cnVlKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcclxuXHRcdFx0fHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIDI4LFxyXG5cdFx0XHRcdGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLFxyXG5cdFx0XHRcdGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGQ7IC8vIHNhdmUgb24gdGltZSBieSBub3QgcmV0dXJuaW5nIGEgY2xvbmVcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxyXG5cdCAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZHN0UmVsZXZhbnQoKTogYm9vbGVhbiB7XHJcblx0XHRsZXQgem9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XHJcblx0XHRyZXR1cm4gISEoem9uZVxyXG5cdFx0XHQmJiB6b25lLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxyXG5cdFx0XHQmJiB6b25lLmhhc0RzdCgpXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIHRoZSB2YWx1ZXMgd2hlcmUgcG9zc2libGUgLSBub3QgYWxsIHZhbHVlc1xyXG5cdCAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXHJcblx0ICogRS5nLiBtb3JlIHRoYW4gNjAgbWludXRlcyBpcyB0cmFuc2ZlcnJlZCB0byBob3VycyxcclxuXHQgKiBidXQgc2Vjb25kcyBjYW5ub3QgYmUgdHJhbnNmZXJyZWQgdG8gbWludXRlcyBkdWUgdG8gbGVhcCBzZWNvbmRzLlxyXG5cdCAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2NhbGNJbnRlcm5hbFZhbHVlcygpOiB2b2lkIHtcclxuXHRcdC8vIG5vcm1hbGl6ZSBhbnkgYWJvdmUtdW5pdCB2YWx1ZXNcclxuXHRcdGxldCBpbnRBbW91bnQgPSB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcclxuXHRcdGxldCBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG5cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5NaWxsaXNlY29uZCAmJiBpbnRBbW91bnQgPj0gMTAwMCAmJiBpbnRBbW91bnQgJSAxMDAwID09PSAwKSB7XHJcblx0XHRcdC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LlNlY29uZCAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcclxuXHRcdFx0Ly8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDI0O1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuRGF5O1xyXG5cdFx0fVxyXG5cdFx0Ly8gbm93IHJlbW92ZSB3ZWVrcyBzbyB3ZSBoYXZlIG9uZSBsZXNzIGNhc2UgdG8gd29ycnkgYWJvdXRcclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5XZWVrKSB7XHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTW9udGggJiYgaW50QW1vdW50ID49IDEyICYmIGludEFtb3VudCAlIDEyID09PSAwKSB7XHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDEyO1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBEdXJhdGlvbihpbnRBbW91bnQsIGludFVuaXQpO1xyXG5cclxuXHRcdC8vIG5vcm1hbGl6ZSBkc3QgaGFuZGxpbmdcclxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcblx0XHRcdHRoaXMuX2ludERzdCA9IHRoaXMuX2RzdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIG5vcm1hbGl6ZSByZWZlcmVuY2UgZGF5XHJcblx0XHR0aGlzLl9pbnRSZWZlcmVuY2UgPSB0aGlzLl9ub3JtYWxpemVEYXkodGhpcy5fcmVmZXJlbmNlLCBmYWxzZSk7XHJcblx0fVxyXG5cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgYmVnaW5uaW5nLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWRMZWZ0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBwYWRkaW5nICsgcztcclxufVxyXG5cclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWRSaWdodChzOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGNoYXI6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0bGV0IHBhZGRpbmc6IHN0cmluZyA9IFwiXCI7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG5cdFx0cGFkZGluZyArPSBjaGFyO1xyXG5cdH1cclxuXHRyZXR1cm4gcyArIHBhZGRpbmc7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBGb3IgdGVzdGluZyBwdXJwb3Nlcywgd2Ugb2Z0ZW4gbmVlZCB0byBtYW5pcHVsYXRlIHdoYXQgdGhlIGN1cnJlbnRcclxuICogdGltZSBpcy4gVGhpcyBpcyBhbiBpbnRlcmZhY2UgZm9yIGEgY3VzdG9tIHRpbWUgc291cmNlIG9iamVjdFxyXG4gKiBzbyBpbiB0ZXN0cyB5b3UgY2FuIHVzZSBhIGN1c3RvbSB0aW1lIHNvdXJjZS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGltZVNvdXJjZSB7XHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSBjdXJyZW50IGRhdGUrdGltZSBhcyBhIGphdmFzY3JpcHQgRGF0ZSBvYmplY3RcclxuXHQgKi9cclxuXHRub3coKTogRGF0ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZWFsVGltZVNvdXJjZSBpbXBsZW1lbnRzIFRpbWVTb3VyY2Uge1xyXG5cdG5vdygpOiBEYXRlIHtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFRpbWUgem9uZSByZXByZXNlbnRhdGlvbiBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5pbXBvcnQgIHsgTm9ybWFsaXplT3B0aW9uLCBUekRhdGFiYXNlIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2NhbCgpOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSB6b25lLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1dGMoKTogVGltZVpvbmUge1xyXG5cdHJldHVybiBUaW1lWm9uZS51dGMoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICogQHJldHVybnMgYSB0aW1lIHpvbmUgd2l0aCB0aGUgZ2l2ZW4gZml4ZWQgb2Zmc2V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xyXG5cclxuLyoqXHJcbiAqIFRpbWUgem9uZSBmb3IgYW4gb2Zmc2V0IHN0cmluZyBvciBhbiBJQU5BIHRpbWUgem9uZSBzdHJpbmcuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAcGFyYW0gcyBcImxvY2FsdGltZVwiIGZvciBsb2NhbCB0aW1lLFxyXG4gKiAgICAgICAgICBhIFRaIGRhdGFiYXNlIHRpbWUgem9uZSBuYW1lIChlLmcuIEV1cm9wZS9BbXN0ZXJkYW0pLFxyXG4gKiAgICAgICAgICBvciBhbiBvZmZzZXQgc3RyaW5nIChlaXRoZXIgKzAxOjMwLCArMDEzMCwgKzAxLCBaKS4gRm9yIGEgZnVsbCBsaXN0IG9mIG5hbWVzLCBzZWU6XHJcbiAqICAgICAgICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHpfZGF0YWJhc2VfdGltZV96b25lc1xyXG4gKiBAcGFyYW0gZHN0XHRPcHRpb25hbCwgZGVmYXVsdCB0cnVlOiBhZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZS4gTm90ZSBmb3JcclxuICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcclxuICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKG5hbWU6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xyXG5cclxuLyoqXHJcbiAqIFNlZSB0aGUgZGVzY3JpcHRpb25zIGZvciB0aGUgb3RoZXIgem9uZSgpIG1ldGhvZCBzaWduYXR1cmVzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHpvbmUoYTogYW55LCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmUge1xyXG5cdHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcclxuICovXHJcbmV4cG9ydCBlbnVtIFRpbWVab25lS2luZCB7XHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZSBvZmZzZXQgYXMgZGV0ZXJtaW5lZCBieSBKYXZhU2NyaXB0IERhdGUgY2xhc3MuXHJcblx0ICovXHJcblx0TG9jYWwsXHJcblx0LyoqXHJcblx0ICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuXHQgKi9cclxuXHRPZmZzZXQsXHJcblx0LyoqXHJcblx0ICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXHJcblx0ICogRFNUIGlmIGFwcGxpY2FibGUuXHJcblx0ICovXHJcblx0UHJvcGVyXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIHpvbmUuIFRoZSBvYmplY3QgaXMgaW1tdXRhYmxlIGJlY2F1c2UgaXQgaXMgY2FjaGVkOlxyXG4gKiByZXF1ZXN0aW5nIGEgdGltZSB6b25lIHR3aWNlIHlpZWxkcyB0aGUgdmVyeSBzYW1lIG9iamVjdC5cclxuICogTm90ZSB0aGF0IHdlIHVzZSB0aW1lIHpvbmUgb2Zmc2V0cyBpbnZlcnRlZCB3LnIudC4gSmF2YVNjcmlwdCBEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCksXHJcbiAqIGkuZS4gb2Zmc2V0IDkwIG1lYW5zICswMTozMC5cclxuICpcclxuICogVGltZSB6b25lcyBjb21lIGluIHRocmVlIGZsYXZvcnM6IHRoZSBsb2NhbCB0aW1lIHpvbmUsIGFzIGNhbGN1bGF0ZWQgYnkgSmF2YVNjcmlwdCBEYXRlLFxyXG4gKiBhIGZpeGVkIG9mZnNldCAoXCIrMDE6MzBcIikgd2l0aG91dCBEU1QsIG9yIGEgSUFOQSB0aW1lem9uZSAoXCJFdXJvcGUvQW1zdGVyZGFtXCIpIHdpdGggRFNUXHJcbiAqIGFwcGxpZWQgZGVwZW5kaW5nIG9uIHRoZSB0aW1lIHpvbmUgcnVsZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGltZVpvbmUge1xyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgaWRlbnRpZmllcjpcclxuXHQgKiAgXCJsb2NhbHRpbWVcIiBzdHJpbmcgZm9yIGxvY2FsIHRpbWVcclxuXHQgKiAgRS5nLiBcIi0wMTozMFwiIGZvciBhIGZpeGVkIG9mZnNldCBmcm9tIFVUQ1xyXG5cdCAqICBFLmcuIFwiVVRDXCIgb3IgXCJFdXJvcGUvQW1zdGVyZGFtXCIgZm9yIGFuIE9sc2VuIFRaIGRhdGFiYXNlIHRpbWVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9uYW1lOiBzdHJpbmc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZHN0OiBib29sZWFuO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgc3BlY2lmaWVkIGJ5IF9uYW1lXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfa2luZDogVGltZVpvbmVLaW5kO1xyXG5cclxuXHQvKipcclxuXHQgKiBPbmx5IGZvciBmaXhlZCBvZmZzZXRzOiB0aGUgb2Zmc2V0IGluIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9vZmZzZXQ6IG51bWJlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcclxuXHQgKiB0aGUgdGltZSB6b25lIHZhcmllcyB3aXRoIHRoZSBkYXRlOiBhbXN0ZXJkYW0gdGltZSBmb3JcclxuXHQgKiAyMDE0LTAxLTAxIGlzICswMTowMCBhbmQgYW1zdGVyZGFtIHRpbWUgZm9yIDIwMTQtMDctMDEgaXMgKzAyOjAwXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBsb2NhbCgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcImxvY2FsdGltZVwiLCB0cnVlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBVVEMgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgdXRjKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSB3aXRoIGEgZml4ZWQgb2Zmc2V0XHJcblx0ICogQHBhcmFtIG9mZnNldFx0b2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBmb3IgYW4gb2Zmc2V0IHN0cmluZyBvciBhbiBJQU5BIHRpbWUgem9uZSBzdHJpbmcuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuXHQgKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcblx0ICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuXHQgKiAgICAgICAgICBhIFRaIGRhdGFiYXNlIHRpbWUgem9uZSBuYW1lIChlLmcuIEV1cm9wZS9BbXN0ZXJkYW0pLFxyXG5cdCAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcclxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuXHQgKiAgICAgICAgICBUWiBkYXRhYmFzZSB6b25lIG5hbWUgbWF5IGJlIHN1ZmZpeGVkIHdpdGggXCIgd2l0aG91dCBEU1RcIiB0byBpbmRpY2F0ZSBubyBEU1Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcblx0ICogICAgICAgICAgSW4gdGhhdCBjYXNlLCB0aGUgZHN0IHBhcmFtZXRlciBpcyBpZ25vcmVkLlxyXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxyXG5cdCAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcblx0ICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUoczogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgaW1wbGVtZW50YXRpb25zXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcclxuXHRcdGxldCBuYW1lID0gXCJcIjtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhKSkge1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcclxuXHRcdFx0XHRsZXQgcyA9IDxzdHJpbmc+YTtcclxuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgPj0gMCkge1xyXG5cdFx0XHRcdFx0ZHN0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRuYW1lID0gVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyhzKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XHJcblx0XHRcdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSA8bnVtYmVyPmE7XHJcblx0XHRcdFx0YXNzZXJ0KG9mZnNldCA+IC0yNCAqIDYwICYmIG9mZnNldCA8IDI0ICogNjAsIFwiVGltZVpvbmUuem9uZSgpOiBvZmZzZXQgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRpbWVab25lLnpvbmUoKTogVW5leHBlY3RlZCBhcmd1bWVudCB0eXBlIFxcXCJcIiArIHR5cGVvZiAoYSkgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUobmFtZSwgZHN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERvIG5vdCB1c2UgdGhpcyBjb25zdHJ1Y3RvciwgdXNlIHRoZSBzdGF0aWNcclxuXHQgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXHJcblx0ICogQHBhcmFtIG5hbWUgTk9STUFMSVpFRCBuYW1lLCBhc3N1bWVkIHRvIGJlIGNvcnJlY3RcclxuXHQgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4gPSB0cnVlKSB7XHJcblx0XHR0aGlzLl9uYW1lID0gbmFtZTtcclxuXHRcdHRoaXMuX2RzdCA9IGRzdDtcclxuXHRcdGlmIChuYW1lID09PSBcImxvY2FsdGltZVwiKSB7XHJcblx0XHRcdHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuTG9jYWw7XHJcblx0XHR9IGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSBcIitcIiB8fCBuYW1lLmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgbmFtZS5jaGFyQXQoMCkubWF0Y2goL1xcZC8pIHx8IG5hbWUgPT09IFwiWlwiKSB7XHJcblx0XHRcdHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuT2Zmc2V0O1xyXG5cdFx0XHR0aGlzLl9vZmZzZXQgPSBUaW1lWm9uZS5zdHJpbmdUb09mZnNldChuYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuUHJvcGVyO1xyXG5cdFx0XHRhc3NlcnQoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmV4aXN0cyhuYW1lKSwgYG5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnJHtuYW1lfSdgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1ha2VzIHRoaXMgY2xhc3MgYXBwZWFyIGNsb25hYmxlLiBOT1RFIGFzIHRpbWUgem9uZSBvYmplY3RzIGFyZSBjYWNoZWQgeW91IHdpbGwgTk9UXHJcblx0ICogYWN0dWFsbHkgZ2V0IGEgY2xvbmUgYnV0IHRoZSBzYW1lIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgY2xvbmUoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxyXG5cdCAqIElBTkEgdGltZSB6b25lIG5hbWUgXCJFdXJvcGUvQW1zdGVyZGFtXCIsIG9yIFwibG9jYWx0aW1lXCIgZm9yXHJcblx0ICogdGhlIGxvY2FsIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgbmFtZSgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX25hbWU7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZHN0KCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSAoTG9jYWwvT2Zmc2V0L1Byb3BlcilcclxuXHQgKi9cclxuXHRwdWJsaWMga2luZCgpOiBUaW1lWm9uZUtpbmQge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2tpbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBFcXVhbGl0eSBvcGVyYXRvci4gTWFwcyB6ZXJvIG9mZnNldHMgYW5kIGRpZmZlcmVudCBuYW1lcyBmb3IgVVRDIG9udG9cclxuXHQgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXHJcblx0XHRcdFx0JiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWVcclxuXHRcdFx0XHQmJiAodGhpcy5fZHN0ID09PSBvdGhlci5fZHN0IHx8ICF0aGlzLmhhc0RzdCgpKSk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHpvbmUga2luZC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWUgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJcyB0aGlzIHpvbmUgZXF1aXZhbGVudCB0byBVVEM/XHJcblx0ICovXHJcblx0cHVibGljIGlzVXRjKCk6IGJvb2xlYW4ge1xyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuICh0aGlzLl9vZmZzZXQgPT09IDApO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnpvbmVJc1V0Yyh0aGlzLl9uYW1lKSk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEb2VzIHRoaXMgem9uZSBoYXZlIERheWxpZ2h0IFNhdmluZyBUaW1lIGF0IGFsbD9cclxuXHQgKi9cclxuXHRwdWJsaWMgaGFzRHN0KCk6IGJvb2xlYW4ge1xyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGltZXpvbmUgb2Zmc2V0IGluY2x1ZGluZyBEU1QgZnJvbSBhIFVUQyB0aW1lLlxyXG5cXFx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclV0YyhvZmZzZXRGb3JVdGM6IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XHJcblx0cHVibGljIG9mZnNldEZvclV0Yyh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XHJcblx0cHVibGljIG9mZnNldEZvclV0YyhcclxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdXRjVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBUaW1lU3RydWN0ID8gYSA6IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSBhcyBudW1iZXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSk7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoXHJcblx0XHRcdFx0XHR1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSxcclxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy5ob3VyLCB1dGNUaW1lLmNvbXBvbmVudHMubWludXRlLCB1dGNUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCB1dGNUaW1lLmNvbXBvbmVudHMubWlsbGlcclxuXHRcdFx0XHQpKTtcclxuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuXHRcdFx0XHRpZiAodGhpcy5fZHN0KSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGltZXpvbmUgc3RhbmRhcmQgb2Zmc2V0IGV4Y2x1ZGluZyBEU1QgZnJvbSBhIFVUQyB0aW1lLlxyXG5cdCAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldEZvclV0YyhvZmZzZXRGb3JVdGM6IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxyXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogbnVtYmVyO1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldEZvclV0YyhcclxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdXRjVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBUaW1lU3RydWN0ID8gYSA6IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSBhcyBudW1iZXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSk7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoRGF0ZS5VVEModXRjVGltZS5jb21wb25lbnRzLnllYXIsIDAsIDEsIDApKTtcclxuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIG9mZnNldCBmcm9tIGEgem9uZS1sb2NhbCB0aW1lIChOT1QgYSBVVEMgdGltZSkuXHJcblx0ICogQHBhcmFtIHllYXIgbG9jYWwgZnVsbCB5ZWFyXHJcblx0ICogQHBhcmFtIG1vbnRoIGxvY2FsIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5IGxvY2FsIGRheSBvZiBtb250aCAxLTMxXHJcblx0ICogQHBhcmFtIGhvdXIgbG9jYWwgaG91ciAwLTIzXHJcblx0ICogQHBhcmFtIG1pbnV0ZSBsb2NhbCBtaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmQgbG9jYWwgc2Vjb25kIDAtNTlcclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmQgbG9jYWwgbWlsbGlzZWNvbmQgMC05OTlcclxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XHJcblx0cHVibGljIG9mZnNldEZvclpvbmUoeWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyKTogbnVtYmVyO1xyXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCBsb2NhbFRpbWUgPSAoYSAmJiBhIGluc3RhbmNlb2YgVGltZVN0cnVjdCA/IGEgOiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEgYXMgbnVtYmVyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSkpO1xyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcblx0XHRcdFx0Y29uc3QgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKFxyXG5cdFx0XHRcdFx0bG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy5kYXksXHJcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGlcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdC8vIG5vdGUgdGhhdCBUekRhdGFiYXNlIG5vcm1hbGl6ZXMgdGhlIGdpdmVuIGRhdGUgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyBpdFxyXG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXRMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcblx0ICpcclxuXHQgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcclxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXHJcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclV0Y0RhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMub2Zmc2V0Rm9yVXRjKFRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcblx0ICpcclxuXHQgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcclxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXHJcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclpvbmVEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBhYmJyZXZpYXRpb24gYXQgZ2l2ZW4gVVRDIHRpbWVzdGFtcCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhciBGdWxsIHllYXJcclxuXHQgKiBAcGFyYW0gbW9udGggTW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBkYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuXHQgKiBAcGFyYW0gaG91ciBIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlIE1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZCBTZWNvbmQgMC01OVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gXCJsb2NhbFwiIGZvciBsb2NhbCB0aW1lem9uZSwgdGhlIG9mZnNldCBmb3IgYW4gb2Zmc2V0IHpvbmUsIG9yIHRoZSBhYmJyZXZpYXRpb24gZm9yIGEgcHJvcGVyIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0YyhcclxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgZHN0RGVwZW5kZW50PzogYm9vbGVhblxyXG5cdCk6IHN0cmluZztcclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIGRzdERlcGVuZGVudD86IGJvb2xlYW4pOiBzdHJpbmc7XHJcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0YyhcclxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBiPzogbnVtYmVyIHwgYm9vbGVhbiwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIsIGM/OiBib29sZWFuXHJcblx0KTogc3RyaW5nIHtcclxuXHRcdGxldCB1dGNUaW1lOiBUaW1lU3RydWN0O1xyXG5cdFx0bGV0IGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWU7XHJcblx0XHRpZiAoYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QpIHtcclxuXHRcdFx0dXRjVGltZSA9IGE7XHJcblx0XHRcdGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR1dGNUaW1lID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiBhcyBudW1iZXIsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xyXG5cdFx0XHRkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG5cdFx0fVxyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwibG9jYWxcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuYWJicmV2aWF0aW9uKHRoaXMuX25hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cclxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXHJcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXHJcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kc1xyXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXBcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zXHR1bml4IG1pbGxpc2Vjb25kcyBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXHJcblx0ICovXHJcblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVW5peE1pbGxpczogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHR6b25lIHRpbWUgdGltZXN0YW1wXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cFxyXG5cdCAqXHJcblx0ICogQHJldHVybnNcdHRpbWUgc3RydWN0IGluIHpvbmUgdGltZSwgbm9ybWFsaXplZC5cclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xyXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG9wdDogTm9ybWFsaXplT3B0aW9uID0gTm9ybWFsaXplT3B0aW9uLlVwKTogVGltZVN0cnVjdCB8IG51bWJlciB7XHJcblx0XHRjb25zdCB0em9wdDogTm9ybWFsaXplT3B0aW9uID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLkRvd24gPyBOb3JtYWxpemVPcHRpb24uRG93biA6IE5vcm1hbGl6ZU9wdGlvbi5VcCk7XHJcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lLCB0em9wdCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBsb2NhbFRpbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIgKG5vcm1hbGl6ZWQpLlxyXG5cdCAqIEVpdGhlciBcImxvY2FsdGltZVwiLCBJQU5BIG5hbWUsIG9yIFwiK2hoOm1tXCIgb2Zmc2V0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubmFtZSgpO1xyXG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcblx0XHRcdGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0aW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVab25lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xyXG5cdCAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG9mZnNldFRvU3RyaW5nKG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xyXG5cdFx0Y29uc3QgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcblx0XHRjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xyXG5cdFx0cmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RyaW5nIHRvIG9mZnNldCBjb252ZXJzaW9uLlxyXG5cdCAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXHJcblx0ICogQHJldHVybiBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBzdHJpbmdUb09mZnNldChzOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xyXG5cdFx0Ly8gZWFzeSBjYXNlXHJcblx0XHRpZiAodCA9PT0gXCJaXCIpIHtcclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHR9XHJcblx0XHQvLyBjaGVjayB0aGF0IHRoZSByZW1haW5kZXIgY29uZm9ybXMgdG8gSVNPIHRpbWUgem9uZSBzcGVjXHJcblx0XHRhc3NlcnQodC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pLCBcIldyb25nIHRpbWUgem9uZSBmb3JtYXQ6IFxcXCJcIiArIHQgKyBcIlxcXCJcIik7XHJcblx0XHRjb25zdCBzaWduOiBudW1iZXIgPSAodC5jaGFyQXQoMCkgPT09IFwiK1wiID8gMSA6IC0xKTtcclxuXHRcdGNvbnN0IGhvdXJzOiBudW1iZXIgPSBwYXJzZUludCh0LnN1YnN0cigxLCAyKSwgMTApO1xyXG5cdFx0bGV0IG1pbnV0ZXM6IG51bWJlciA9IDA7XHJcblx0XHRpZiAodC5sZW5ndGggPT09IDUpIHtcclxuXHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDMsIDIpLCAxMCk7XHJcblx0XHR9IGVsc2UgaWYgKHQubGVuZ3RoID09PSA2KSB7XHJcblx0XHRcdG1pbnV0ZXMgPSBwYXJzZUludCh0LnN1YnN0cig0LCAyKSwgMTApO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJPZmZzZXRzIGZyb20gVVRDIG11c3QgYmUgbGVzcyB0aGFuIGEgZGF5LlwiKTtcclxuXHRcdHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgY2FjaGUuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogVGltZVpvbmUgfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBGaW5kIGluIGNhY2hlIG9yIGNyZWF0ZSB6b25lXHJcblx0ICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9maW5kT3JDcmVhdGUobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4pOiBUaW1lWm9uZSB7XHJcblx0XHRjb25zdCBrZXkgPSBuYW1lICsgKGRzdCA/IFwiX0RTVFwiIDogXCJfTk8tRFNUXCIpO1xyXG5cdFx0aWYgKGtleSBpbiBUaW1lWm9uZS5fY2FjaGUpIHtcclxuXHRcdFx0cmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29uc3QgdCA9IG5ldyBUaW1lWm9uZShuYW1lLCBkc3QpO1xyXG5cdFx0XHRUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XHJcblx0XHRcdHJldHVybiB0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXHJcblx0ICogY2FjaGUgbG9va3VwXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX25vcm1hbGl6ZVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3QgdDogc3RyaW5nID0gcy50cmltKCk7XHJcblx0XHRhc3NlcnQodC5sZW5ndGggPiAwLCBcIkVtcHR5IHRpbWUgem9uZSBzdHJpbmcgZ2l2ZW5cIik7XHJcblx0XHRpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG5cdFx0XHRyZXR1cm4gdDtcclxuXHRcdH0gZWxzZSBpZiAodCA9PT0gXCJaXCIpIHtcclxuXHRcdFx0cmV0dXJuIFwiKzAwOjAwXCI7XHJcblx0XHR9IGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xyXG5cdFx0XHQvLyBvZmZzZXQgc3RyaW5nXHJcblx0XHRcdC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXHJcblx0XHRcdHJldHVybiBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhUaW1lWm9uZS5zdHJpbmdUb09mZnNldCh0KSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXHJcblx0XHRcdHJldHVybiB0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2lzT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xyXG5cdFx0cmV0dXJuICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgdC5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IHQgPT09IFwiWlwiKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuIiwiLyoqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUb2tlbml6ZXIge1xyXG5cclxuXHRwcml2YXRlIF9mb3JtYXRTdHJpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IHRva2VuaXplclxyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgKG9wdGlvbmFsKSBTZXQgdGhlIGZvcm1hdCBzdHJpbmdcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihmb3JtYXRTdHJpbmc/OiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuX2Zvcm1hdFN0cmluZyA9IGZvcm1hdFN0cmluZztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIG5ldyBzdHJpbmcgdG8gdXNlIGZvciBmb3JtYXR0aW5nXHJcblx0ICovXHJcblx0c2V0Rm9ybWF0U3RyaW5nKGZvcm1hdFN0cmluZzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHR0aGlzLl9mb3JtYXRTdHJpbmcgPSBmb3JtYXRTdHJpbmc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHBlbmQgYSBuZXcgdG9rZW4gdG8gdGhlIGN1cnJlbnQgbGlzdCBvZiB0b2tlbnMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdG9rZW5TdHJpbmcgVGhlIHN0cmluZyB0aGF0IG1ha2VzIHVwIHRoZSB0b2tlblxyXG5cdCAqIEBwYXJhbSB0b2tlbkFycmF5IFRoZSBleGlzdGluZyBhcnJheSBvZiB0b2tlbnNcclxuXHQgKiBAcGFyYW0gcmF3IChvcHRpb25hbCkgSWYgdHJ1ZSwgZG9uJ3QgcGFyc2UgdGhlIHRva2VuIGJ1dCBpbnNlcnQgaXQgYXMgaXNcclxuXHQgKiBAcmV0dXJuIFRva2VuW10gVGhlIHJlc3VsdGluZyBhcnJheSBvZiB0b2tlbnMuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYXBwZW5kVG9rZW4odG9rZW5TdHJpbmc6IHN0cmluZywgdG9rZW5BcnJheTogVG9rZW5bXSwgcmF3PzogYm9vbGVhbik6IFRva2VuW10ge1xyXG5cdFx0aWYgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XHJcblx0XHRcdGNvbnN0IHRva2VuOiBUb2tlbiA9IHtcclxuXHRcdFx0XHRsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuXHRcdFx0XHRyYXc6IHRva2VuU3RyaW5nLFxyXG5cdFx0XHRcdHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcblx0XHRcdFx0dHlwZTogRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmICghcmF3KSB7XHJcblx0XHRcdFx0dG9rZW4udHlwZSA9IG1hcFN5bWJvbFRvVHlwZSh0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRva2VuQXJyYXkucHVzaCh0b2tlbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdG9rZW5BcnJheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBpbnRlcm5hbCBzdHJpbmcgYW5kIHJldHVybiBhbiBhcnJheSBvZiB0b2tlbnMuXHJcblx0ICogQHJldHVybiBUb2tlbltdXHJcblx0ICovXHJcblx0cGFyc2VUb2tlbnMoKTogVG9rZW5bXSB7XHJcblx0XHRpZiAoIXRoaXMuX2Zvcm1hdFN0cmluZykge1xyXG5cdFx0XHRyZXR1cm4gW107XHJcblx0XHR9XHJcblx0XHRsZXQgcmVzdWx0OiBUb2tlbltdID0gW107XHJcblxyXG5cdFx0bGV0IGN1cnJlbnRUb2tlbjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGxldCBwcmV2aW91c0NoYXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRsZXQgcXVvdGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdFx0bGV0IHBvc3NpYmxlRXNjYXBpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2Zvcm1hdFN0cmluZy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCBjdXJyZW50Q2hhciA9IHRoaXMuX2Zvcm1hdFN0cmluZ1tpXTtcclxuXHJcblx0XHRcdC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG5cdFx0XHRpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XHJcblx0XHRcdFx0aWYgKCFxdW90aW5nKSB7XHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xyXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBcIidcIjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIFR3byBwb3NzaWJpbGl0aWVzOiBXZXJlIGFyZSBkb25lIHF1b3RpbmcsIG9yIHdlIGFyZSBlc2NhcGluZyBhICcgY2hhcmFjdGVyXHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gTWF5YmUgZXNjYXBpbmcsIHdhaXQgZm9yIG5leHQgdG9rZW4gaWYgd2UgYXJlIGVzY2FwaW5nXHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKCFwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHQvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXHJcblx0XHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH0gZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdHF1b3RpbmcgPSAhcXVvdGluZztcclxuXHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuXHRcdFx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgIXF1b3RpbmcpO1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChxdW90aW5nKSB7XHJcblx0XHRcdFx0Ly8gUXVvdGluZyBtb2RlLCBhZGQgY2hhcmFjdGVyIHRvIHRva2VuLlxyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuXHRcdFx0XHQvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHR9XHJcblx0XHQvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcblx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgcXVvdGluZyk7XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVUaW1lVG9rZW5UeXBlIHtcclxuXHRJREVOVElUWSwgLy8gU3BlY2lhbCwgZG8gbm90IFwiZm9ybWF0XCIgdGhpcywgYnV0IGp1c3Qgb3V0cHV0IHdoYXQgd2VudCBpblxyXG5cclxuXHRFUkEsXHJcblx0WUVBUixcclxuXHRRVUFSVEVSLFxyXG5cdE1PTlRILFxyXG5cdFdFRUssXHJcblx0REFZLFxyXG5cdFdFRUtEQVksXHJcblx0REFZUEVSSU9ELFxyXG5cdEhPVVIsXHJcblx0TUlOVVRFLFxyXG5cdFNFQ09ORCxcclxuXHRaT05FXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyB0b2tlblxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUb2tlbiB7XHJcblx0LyoqXHJcblx0ICogVGhlIHR5cGUgb2YgdG9rZW5cclxuXHQgKi9cclxuXHR0eXBlOiBEYXRlVGltZVRva2VuVHlwZTtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHN5bWJvbCBmcm9tIHdoaWNoIHRoZSB0b2tlbiB3YXMgcGFyc2VkXHJcblx0ICovXHJcblx0c3ltYm9sOiBzdHJpbmc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHRva2VuXHJcblx0ICovXHJcblx0bGVuZ3RoOiBudW1iZXI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCBwcm9kdWNlZCB0aGlzIHRva2VuXHJcblx0ICovXHJcblx0cmF3OiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IHN5bWJvbE1hcHBpbmc6IHsgW2NoYXI6IHN0cmluZ106IERhdGVUaW1lVG9rZW5UeXBlIH0gPSB7XHJcblx0XCJHXCI6IERhdGVUaW1lVG9rZW5UeXBlLkVSQSxcclxuXHJcblx0XCJ5XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJZXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJ1XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJVXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJyXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblxyXG5cdFwiUVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG5cdFwicVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG5cclxuXHRcIk1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcblx0XCJMXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG5cdFwibFwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuXHJcblx0XCJ3XCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcblx0XCJXXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcblxyXG5cdFwiZFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblx0XCJEXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcIkZcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFwiZ1wiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblxyXG5cdFwiRVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFwiZVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFwiY1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cclxuXHRcImFcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cclxuXHRcImhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIkhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcImtcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIktcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcImpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIkpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHJcblx0XCJtXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1JTlVURSxcclxuXHJcblx0XCJzXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcIlNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFwiQVwiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblxyXG5cdFwielwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiWlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiT1wiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwidlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiVlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiWFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwieFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbn07XHJcblxyXG4vKipcclxuICogTWFwIHRoZSBnaXZlbiBzeW1ib2wgdG8gb25lIG9mIHRoZSBEYXRlVGltZVRva2VuVHlwZXNcclxuICogSWYgdGhlcmUgaXMgbm8gbWFwcGluZywgRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFkgaXMgdXNlZFxyXG4gKlxyXG4gKiBAcGFyYW0gc3ltYm9sIFRoZSBzaW5nbGUtY2hhcmFjdGVyIHN5bWJvbCB1c2VkIHRvIG1hcCB0aGUgdG9rZW5cclxuICogQHJldHVybiBEYXRlVGltZVRva2VuVHlwZSBUaGUgVHlwZSBvZiB0b2tlbiB0aGlzIHN5bWJvbCByZXByZXNlbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXBTeW1ib2xUb1R5cGUoc3ltYm9sOiBzdHJpbmcpOiBEYXRlVGltZVRva2VuVHlwZSB7XHJcblx0aWYgKHN5bWJvbE1hcHBpbmcuaGFzT3duUHJvcGVydHkoc3ltYm9sKSkge1xyXG5cdFx0cmV0dXJuIHN5bWJvbE1hcHBpbmdbc3ltYm9sXTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZO1xyXG5cdH1cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QsIFRpbWVVbml0LCBXZWVrRGF5IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcclxuXHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUb1R5cGUge1xyXG5cdC8qKlxyXG5cdCAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXHJcblx0ICovXHJcblx0WWVhcixcclxuXHQvKipcclxuXHQgKiBcIm1heFwiXHJcblx0ICovXHJcblx0TWF4XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBPblR5cGUge1xyXG5cdC8qKlxyXG5cdCAqIERheS1vZi1tb250aCBudW1iZXJcclxuXHQgKi9cclxuXHREYXlOdW0sXHJcblx0LyoqXHJcblx0ICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXHJcblx0ICovXHJcblx0TGFzdFgsXHJcblx0LyoqXHJcblx0ICogZS5nLiBcIlN1bj49OFwiXHJcblx0ICovXHJcblx0R3JlcVgsXHJcblx0LyoqXHJcblx0ICogZS5nLiBcIlN1bjw9OFwiXHJcblx0ICovXHJcblx0TGVxWFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBBdFR5cGUge1xyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuXHQgKi9cclxuXHRTdGFuZGFyZCxcclxuXHQvKipcclxuXHQgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXHJcblx0ICovXHJcblx0V2FsbCxcclxuXHQvKipcclxuXHQgKiBVdGMgdGltZVxyXG5cdCAqL1xyXG5cdFV0YyxcclxufVxyXG5cclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUnVsZUluZm8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdC8qKlxyXG5cdFx0ICogRlJPTSBjb2x1bW4geWVhciBudW1iZXIuXHJcblx0XHQgKiBOb3RlLCBjYW4gYmUgLTEwMDAwIGZvciBOYU4gdmFsdWUgKGUuZy4gZm9yIFwiU3lzdGVtVlwiIHJ1bGVzKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgZnJvbTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUTyBjb2x1bW4gdHlwZTogWWVhciBmb3IgeWVhciBudW1iZXJzIGFuZCBcIm9ubHlcIiB2YWx1ZXMsIE1heCBmb3IgXCJtYXhcIiB2YWx1ZS5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHRvVHlwZTogVG9UeXBlLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHRvWWVhcjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB0eXBlOiBzdHJpbmcsXHJcblx0XHQvKipcclxuXHRcdCAqIElOIGNvbHVtbiBtb250aCBudW1iZXIgMS0xMlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgaW5Nb250aDogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBPTiBjb2x1bW4gdHlwZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25UeXBlOiBPblR5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvbkRheTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiBvblR5cGUgaXMgbm90IERheU51bSwgdGhlIHdlZWtkYXlcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uV2Vla0RheTogV2Vla0RheSxcclxuXHRcdC8qKlxyXG5cdFx0ICogQVQgY29sdW1uIGhvdXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0SG91cjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gbWludXRlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdE1pbnV0ZTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gc2Vjb25kXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFNlY29uZDogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gdHlwZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRUeXBlOiBBdFR5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIERTVCBvZmZzZXQgZnJvbSBsb2NhbCBzdGFuZGFyZCB0aW1lIChOT1QgZnJvbSBVVEMhKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgc2F2ZTogRHVyYXRpb24sXHJcblx0XHQvKipcclxuXHRcdCAqIENoYXJhY3RlciB0byBpbnNlcnQgaW4gJXMgZm9yIHRpbWUgem9uZSBhYmJyZXZpYXRpb25cclxuXHRcdCAqIE5vdGUgaWYgVFogZGF0YWJhc2UgaW5kaWNhdGVzIFwiLVwiIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHRcdCkge1xyXG5cclxuXHRcdGlmICh0aGlzLnNhdmUpIHtcclxuXHRcdFx0dGhpcy5zYXZlID0gdGhpcy5zYXZlLmNvbnZlcnQoVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIGFwcGxpY2FibGUoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XHJcblx0XHRcdGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XHJcblx0XHRcdGNhc2UgVG9UeXBlLlllYXI6IHJldHVybiAoeWVhciA8PSB0aGlzLnRvWWVhcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTb3J0IGNvbXBhcmlzb25cclxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlTGVzcyhvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmZyb20gPCBvdGhlci5mcm9tKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoID4gb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTb3J0IGNvbXBhcmlzb25cclxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBlcXVhbCB0byBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVFcXVhbChvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuaW5Nb250aCAhPT0gb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAoIXRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pLmVxdWFscyhvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gTm90ZSB0aGF0IHRoZSB0aW1lXHJcblx0ICogaXMgTk9UIGFkanVzdGVkIGZvciB3YWxsIGNsb2NrIHRpbWUgb3Igc3RhbmRhcmQgdGltZSwgaS5lLiB0aGlzLmF0VHlwZSBpc1xyXG5cdCAqIG5vdCB0YWtlbiBpbnRvIGFjY291bnRcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlRGF0ZSh5ZWFyOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcclxuXHRcdGFzc2VydCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBpcyBub3QgYXBwbGljYWJsZSBpbiBcIiArIHllYXIudG9TdHJpbmcoMTApKTtcclxuXHJcblx0XHQvLyB5ZWFyIGFuZCBtb250aCBhcmUgZ2l2ZW5cclxuXHRcdGNvbnN0IHRtOiBUaW1lQ29tcG9uZW50T3B0cyA9IHt5ZWFyLCBtb250aDogdGhpcy5pbk1vbnRoIH07XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIGRheVxyXG5cdFx0c3dpdGNoICh0aGlzLm9uVHlwZSkge1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHtcclxuXHRcdFx0XHR0bS5kYXkgPSB0aGlzLm9uRGF5O1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDoge1xyXG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MYXN0WDoge1xyXG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRpbWVcclxuXHRcdHRtLmhvdXIgPSB0aGlzLmF0SG91cjtcclxuXHRcdHRtLm1pbnV0ZSA9IHRoaXMuYXRNaW51dGU7XHJcblx0XHR0bS5zZWNvbmQgPSB0aGlzLmF0U2Vjb25kO1xyXG5cclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0bSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1RcclxuXHQgKiBAcGFyYW0gcHJldlJ1bGVcdFRoZSBwcmV2aW91cyBydWxlXHJcblx0ICovXHJcblx0cHVibGljIHRyYW5zaXRpb25UaW1lVXRjKHllYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uLCBwcmV2UnVsZT86IFJ1bGVJbmZvKTogbnVtYmVyIHtcclxuXHRcdGFzc2VydCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBub3QgYXBwbGljYWJsZSBpbiBnaXZlbiB5ZWFyXCIpO1xyXG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS51bml4TWlsbGlzO1xyXG5cclxuXHRcdC8vIGFkanVzdCBmb3IgZ2l2ZW4gb2Zmc2V0XHJcblx0XHRsZXQgb2Zmc2V0OiBEdXJhdGlvbjtcclxuXHRcdHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcclxuXHRcdFx0Y2FzZSBBdFR5cGUuVXRjOlxyXG5cdFx0XHRcdG9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5TdGFuZGFyZDpcclxuXHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBBdFR5cGUuV2FsbDpcclxuXHRcdFx0XHRpZiAocHJldlJ1bGUpIHtcclxuXHRcdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0LmFkZChwcmV2UnVsZS5zYXZlKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVua25vd24gQXRUeXBlXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5peE1pbGxpcyAtIG9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcmVmZXJlbmNlIGZyb20gem9uZSB0byBydWxlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBSdWxlVHlwZSB7XHJcblx0LyoqXHJcblx0ICogTm8gcnVsZSBhcHBsaWVzXHJcblx0ICovXHJcblx0Tm9uZSxcclxuXHQvKipcclxuXHQgKiBGaXhlZCBnaXZlbiBvZmZzZXRcclxuXHQgKi9cclxuXHRPZmZzZXQsXHJcblx0LyoqXHJcblx0ICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXHJcblx0ICovXHJcblx0UnVsZU5hbWVcclxufVxyXG5cclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cclxuICogYmUgYSBzaW5nbGUgcmVjb3JkIHdpdGggemVybyBvciBtb3JlIGNvbnRpbnVhdGlvbiBsaW5lcy4gVGh1cywgdGhlIGtleXdvcmQsIOKAnFpvbmUs4oCdIGFuZCB0aGUgem9uZSBuYW1lIGFyZSBub3QgcmVwZWF0ZWQuXHJcbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cclxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXHJcbiAqIFRoZSBzdGF0ZSBleGlzdHMgZnJvbSB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgcHJldmlvdXMgbGluZeKAmXMgW1VOVElMXSBjb2x1bW4gdXAgdG8gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIGN1cnJlbnQgbGluZeKAmXNcclxuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxyXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXHJcbiAqIFRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIGxhc3QgbGluZSwgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbiwgY29udGludWVzIHRvIHRoZSBwcmVzZW50LlxyXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXHJcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxyXG4gKiAyNCBob3VyczsgdGhpcyBjb3JyZXNwb25kcyB0byBhIG1vdmVtZW50IG9mIHRoZSBEYXRlIExpbmUuIEZvciBleGFtcGxlOlxyXG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXHJcbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XHJcbiAqIFx0XHRcdCAtODo1Nzo0MSAtXHRMTVRcdC4uLlxyXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxyXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXHJcbiAqIHJlbGlnaW91cyByZWFzb25zLCB3YXMgZm9sbG93ZWQgYnkgYSBzZWNvbmQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgZGF5IHdpdGggYSBkaWZmZXJlbnQgbmFtZSwgMTggT2N0b2JlciBpbiB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxyXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cclxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XHJcbiAqIHVzZWQgZHVyaW5nIHRoZSBwZXJpb2QuIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWUgaXMgYWxtb3N0IGNlcnRhaW5seSB3cm9uZyBleGNlcHQgaW4gdGhlIGFyY2hldHlwYWwgcGxhY2UgYWZ0ZXIgd2hpY2ggdGhlIHpvbmUgaXMgbmFtZWQuXHJcbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcclxuICovXHJcbmV4cG9ydCBjbGFzcyBab25lSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXHJcblx0XHQgKiBjb250cmFyeSB0byB3aGF0IHlvdSBtaWdodCBleHBlY3QpLiAgRS5nLiBFdXJvcGUvQW1zdGVyZGFtIGhhcyArNjAgbWludXRlcyBpbiB0aGlzIGZpZWxkIGJlY2F1c2VcclxuXHRcdCAqIGl0IGlzIG9uZSBob3VyIGFoZWFkIG9mIFVUQ1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgZ210b2ZmOiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRoZSBSVUxFUyBjb2x1bW4gdGVsbHMgdXMgd2hldGhlciBkYXlsaWdodCBzYXZpbmcgdGltZSBpcyBiZWluZyBvYnNlcnZlZDpcclxuXHRcdCAqIEEgaHlwaGVuLCBhIGtpbmQgb2YgbnVsbCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBoYXZlIG5vdCBzZXQgb3VyIGNsb2NrcyBhaGVhZCBvZiBzdGFuZGFyZCB0aW1lLlxyXG5cdFx0ICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cclxuXHRcdCAqIFNvbWUgYWxwaGFiZXRpYyBzdHJpbmcgbWVhbnMgdGhhdCB3ZSBtaWdodCBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkOyBhbmQgd2UgbmVlZCB0byBjaGVjayB0aGUgcnVsZVxyXG5cdFx0ICogdGhlIG5hbWUgb2Ygd2hpY2ggaXMgdGhlIGdpdmVuIGFscGhhYmV0aWMgc3RyaW5nLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgcnVsZVR5cGU6IFJ1bGVUeXBlLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGFuIG9mZnNldCwgdGhpcyBpcyB0aGUgb2Zmc2V0XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlT2Zmc2V0OiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlTmFtZTogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIEZPUk1BVCBjb2x1bW4gc3BlY2lmaWVzIHRoZSB1c3VhbCBhYmJyZXZpYXRpb24gb2YgdGhlIHRpbWUgem9uZSBuYW1lLiBJdCBjYW4gaGF2ZSBvbmUgb2YgZm91ciBmb3JtczpcclxuXHRcdCAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxyXG5cdFx0ICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxyXG5cdFx0ICogYSBwYWlyIG9mIHN0cmluZ3Mgc2VwYXJhdGVkIGJ5IGEgc2xhc2ggKOKAmC/igJkpLCBpbiB3aGljaCBjYXNlIHRoZSBmaXJzdCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvblxyXG5cdFx0ICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXHJcblx0XHQgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmb3JtYXQ6IHN0cmluZyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVudGlsIHRpbWVzdGFtcCBpbiB1bml4IHV0YyBtaWxsaXMuIFRoZSB6b25lIGluZm8gaXMgdmFsaWQgdXAgdG9cclxuXHRcdCAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXHJcblx0XHQgKiBOb3RlIHRoaXMgdmFsdWUgY2FuIGJlIHVuZGVmaW5lZCAoZm9yIHRoZSBmaXJzdCBydWxlKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdW50aWw/OiBudW1iZXJcclxuXHQpIHtcclxuXHRcdGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuXHRcdFx0dGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuXHJcbmVudW0gVHpNb250aE5hbWVzIHtcclxuXHRKYW4gPSAxLFxyXG5cdEZlYiA9IDIsXHJcblx0TWFyID0gMyxcclxuXHRBcHIgPSA0LFxyXG5cdE1heSA9IDUsXHJcblx0SnVuID0gNixcclxuXHRKdWwgPSA3LFxyXG5cdEF1ZyA9IDgsXHJcblx0U2VwID0gOSxcclxuXHRPY3QgPSAxMCxcclxuXHROb3YgPSAxMSxcclxuXHREZWMgPSAxMlxyXG59XHJcblxyXG5mdW5jdGlvbiBtb250aE5hbWVUb1N0cmluZyhuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdGZvciAobGV0IGk6IG51bWJlciA9IDE7IGkgPD0gMTI7ICsraSkge1xyXG5cdFx0aWYgKFR6TW9udGhOYW1lc1tpXSA9PT0gbmFtZSkge1xyXG5cdFx0XHRyZXR1cm4gaTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRpZiAodHJ1ZSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCJcIik7XHJcblx0fVxyXG59XHJcblxyXG5lbnVtIFR6RGF5TmFtZXMge1xyXG5cdFN1biA9IDAsXHJcblx0TW9uID0gMSxcclxuXHRUdWUgPSAyLFxyXG5cdFdlZCA9IDMsXHJcblx0VGh1ID0gNCxcclxuXHRGcmkgPSA1LFxyXG5cdFNhdCA9IDZcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXHJcbiAqIDEsIC0xLCArMSwgMDEsIDE6MDAsIDE6MjM6MjUuMTQzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZE9mZnNldFN0cmluZyhzOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRyZXR1cm4gL14oXFwtfFxcKyk/KFswLTldKygoXFw6WzAtOV0rKT8oXFw6WzAtOV0rKFxcLlswLTldKyk/KT8pKSQvLnRlc3Qocyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcclxuICovXHJcbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uIHtcclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdC8qKlxyXG5cdFx0ICogVHJhbnNpdGlvbiB0aW1lIGluIFVUQyBtaWxsaXNcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb2Zmc2V0OiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE5ldyB0aW16b25lIGFiYnJldmlhdGlvbiBsZXR0ZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxldHRlcjogc3RyaW5nXHJcblxyXG5cdFx0KSB7XHJcblx0XHRpZiAodGhpcy5vZmZzZXQpIHtcclxuXHRcdFx0dGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPcHRpb24gZm9yIFR6RGF0YWJhc2Ujbm9ybWFsaXplTG9jYWwoKVxyXG4gKi9cclxuZXhwb3J0IGVudW0gTm9ybWFsaXplT3B0aW9uIHtcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdFVwLFxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgU1VCVFJBQ1RJTkcgdGhlIERTVCBvZmZzZXRcclxuXHQgKi9cclxuXHREb3duXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGlzIGEgd3JhcHBlciBhcm91bmQgdGltZSB6b25lIGRhdGEgSlNPTiBvYmplY3QgZnJvbSB0aGUgdHpkYXRhIE5QTSBtb2R1bGUuXHJcbiAqIFlvdSB1c3VhbGx5IGRvIG5vdCBuZWVkIHRvIHVzZSB0aGlzIGRpcmVjdGx5LCB1c2UgVGltZVpvbmUgYW5kIERhdGVUaW1lIGluc3RlYWQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHpEYXRhYmFzZSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBtZW1iZXJcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U/OiBUekRhdGFiYXNlO1xyXG5cclxuXHQvKipcclxuXHQgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXHJcblx0ICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGluaXQoZGF0YT86IGFueSB8IGFueVtdKTogdm9pZCB7XHJcblx0XHRpZiAoZGF0YSkge1xyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IHVuZGVmaW5lZDsgLy8gbmVlZGVkIGZvciBhc3NlcnQgaW4gY29uc3RydWN0b3JcclxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtkYXRhXSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCBkYXRhOiBhbnlbXSA9IFtdO1xyXG5cdFx0XHQvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGluIGdsb2JhbCB2YXJpYWJsZXNcclxuXHRcdFx0Y29uc3QgZzogYW55ID0gKGdsb2JhbCA/IGdsb2JhbCA6IHdpbmRvdyk7XHJcblx0XHRcdGlmIChnKSB7XHJcblx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZykpIHtcclxuXHRcdFx0XHRcdGlmIChrZXkuaW5kZXhPZihcInR6ZGF0YVwiKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGdba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBnW2tleV0ucnVsZXMgJiYgZ1trZXldLnpvbmVzKSB7XHJcblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoKGdba2V5XSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gdHJ5IHRvIGZpbmQgVFogZGF0YSBhcyBpbnN0YWxsZWQgTlBNIG1vZHVsZXNcclxuXHRcdFx0Y29uc3QgZmluZE5vZGVNb2R1bGVzID0gKHJlcXVpcmU6IGFueSk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHQvLyBmaXJzdCB0cnkgdHpkYXRhIHdoaWNoIGNvbnRhaW5zIGFsbCBkYXRhXHJcblx0XHRcdFx0XHRjb25zdCB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcclxuXHRcdFx0XHRcdGNvbnN0IGQgPSByZXF1aXJlKHR6RGF0YU5hbWUpOyAvLyB1c2UgdmFyaWFibGUgdG8gYXZvaWQgYnJvd3NlcmlmeSBhY3RpbmcgdXBcclxuXHRcdFx0XHRcdGRhdGEucHVzaChkKTtcclxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHQvLyB0aGVuIHRyeSBzdWJzZXRzXHJcblx0XHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lczogc3RyaW5nW10gPSBbXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFmcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hbnRhcmN0aWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFzaWFcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYXVzdHJhbGFzaWFcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYmFja3dhcmRcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYmFja3dhcmQtdXRjXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWV0Y2V0ZXJhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWV1cm9wZVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1ub3J0aGFtZXJpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtcGFjaWZpY25ld1wiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zb3V0aGFtZXJpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtc3lzdGVtdlwiXHJcblx0XHRcdFx0XHRdO1xyXG5cdFx0XHRcdFx0bW9kdWxlTmFtZXMuZm9yRWFjaCgobW9kdWxlTmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgZCA9IHJlcXVpcmUobW9kdWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xyXG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRcdFx0ZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShkYXRhKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBvZiB0aGlzIGRhdGFiYXNlXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBpbnN0YW5jZSgpOiBUekRhdGFiYXNlIHtcclxuXHRcdGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuXHRcdFx0VHpEYXRhYmFzZS5pbml0KCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVHpEYXRhYmFzZS5faW5zdGFuY2UgYXMgVHpEYXRhYmFzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBkYXRhYmFzZSBkYXRhXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZGF0YTogYW55O1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWNoZWQgbWluL21heCBEU1QgdmFsdWVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbWlubWF4OiBNaW5NYXhJbmZvO1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWNoZWQgem9uZSBuYW1lc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVOYW1lczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIC0gZG8gbm90IHVzZSwgdGhpcyBpcyBhIHNpbmdsZXRvbiBjbGFzcy4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKSBpbnN0ZWFkXHJcblx0ICovXHJcblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihkYXRhOiBhbnlbXSkge1xyXG5cdFx0YXNzZXJ0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XHJcblx0XHRhc3NlcnQoZGF0YS5sZW5ndGggPiAwLFxyXG5cdFx0XHRcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCJcclxuXHRcdCk7XHJcblx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDEpIHtcclxuXHRcdFx0dGhpcy5fZGF0YSA9IGRhdGFbMF07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9kYXRhID0geyB6b25lczoge30sIHJ1bGVzOiB7fSB9O1xyXG5cdFx0XHRkYXRhLmZvckVhY2goKGQ6IGFueSk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdGlmIChkICYmIGQucnVsZXMgJiYgZC56b25lcykge1xyXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC5ydWxlcykpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC56b25lcykpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS56b25lc1trZXldID0gZC56b25lc1trZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc29ydGVkIGxpc3Qgb2YgYWxsIHpvbmUgbmFtZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZU5hbWVzKCk6IHN0cmluZ1tdIHtcclxuXHRcdGlmICghdGhpcy5fem9uZU5hbWVzKSB7XHJcblx0XHRcdHRoaXMuX3pvbmVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuem9uZXMpO1xyXG5cdFx0XHR0aGlzLl96b25lTmFtZXMuc29ydCgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBleGlzdHMoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluRHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0Y29uc3Qgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHRlbXBbal07XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby5zYXZlLm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmICghcmVzdWx0KSB7XHJcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcblx0ICovXHJcblx0cHVibGljIG1heERzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAoem9uZU5hbWUpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0XHRsZXQgcmVzdWx0OiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdFx0Y29uc3QgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XHJcblx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHRlbXBbal07XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAoIXJlc3VsdCkge1xyXG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5tYXhEc3RTYXZlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXHJcblx0ICovXHJcblx0cHVibGljIGhhc0RzdCh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMubWF4RHN0U2F2ZSh6b25lTmFtZSkubWlsbGlzZWNvbmRzKCkgIT09IDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmlyc3QgRFNUIGNoYW5nZSBtb21lbnQgQUZURVIgdGhlIGdpdmVuIFVUQyBkYXRlIGluIFVUQyBtaWxsaXNlY29uZHMsIHdpdGhpbiBvbmUgeWVhcixcclxuXHQgKiByZXR1cm5zIHVuZGVmaW5lZCBpZiBubyBzdWNoIGNoYW5nZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0KTogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIGE6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG5cdFx0bGV0IHpvbmVJbmZvOiBab25lSW5mbztcclxuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgem9uZSBpbmZvcyBmb3IgW2RhdGUsIGRhdGUrMXllYXIpXHJcblx0XHRjb25zdCBhbGxab25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRjb25zdCByZWxldmFudFpvbmVJbmZvczogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0Y29uc3QgcmFuZ2VTdGFydDogbnVtYmVyID0gdXRjVGltZS51bml4TWlsbGlzO1xyXG5cdFx0Y29uc3QgcmFuZ2VFbmQ6IG51bWJlciA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xyXG5cdFx0bGV0IHByZXZFbmQ6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsWm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHpvbmVJbmZvID0gYWxsWm9uZUluZm9zW2ldO1xyXG5cdFx0XHRpZiAoKHByZXZFbmQgPT09IHVuZGVmaW5lZCB8fCBwcmV2RW5kIDwgcmFuZ2VFbmQpICYmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID4gcmFuZ2VTdGFydCkpIHtcclxuXHRcdFx0XHRyZWxldmFudFpvbmVJbmZvcy5wdXNoKHpvbmVJbmZvKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2RW5kID0gem9uZUluZm8udW50aWw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY29sbGVjdCBhbGwgdHJhbnNpdGlvbnMgaW4gdGhlIHpvbmVzIGZvciB0aGUgeWVhclxyXG5cdFx0bGV0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVsZXZhbnRab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0em9uZUluZm8gPSByZWxldmFudFpvbmVJbmZvc1tpXTtcclxuXHRcdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0XHR0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdChcclxuXHRcdFx0XHR0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZilcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdHRyYW5zaXRpb25zLnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBmaXJzdCBhZnRlciB0aGUgZ2l2ZW4gZGF0ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBvZmZzZXRcclxuXHRcdGxldCBwcmV2U2F2ZTogRHVyYXRpb24gfCB1bmRlZmluZWQ7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKCFwcmV2U2F2ZSB8fCAhcHJldlNhdmUuZXF1YWxzKHRyYW5zaXRpb24ub2Zmc2V0KSkge1xyXG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ID4gdXRjVGltZS51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJhbnNpdGlvbi5hdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldlNhdmUgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cclxuXHQgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuXHQgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVJc1V0Yyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xyXG5cdFx0bGV0IHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuXHRcdC8vIGZvbGxvdyBsaW5rc1xyXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZy9zdWJ0cmFjdGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cclxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXHJcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXHJcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0QSBsb2NhbCB0aW1lLCBlaXRoZXIgYXMgYSBUaW1lU3RydWN0IG9yIGFzIGEgdW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXAuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuXHRUaGUgbm9ybWFsaXplZCB0aW1lLCBpbiB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIGxvY2FsVGltZSBwYXJhbWV0ZXIgKFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXMpXHJcblx0ICovXHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogVGltZVN0cnVjdDtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuXHRcdFx0Y29uc3QgbG9jYWxUaW1lOiBUaW1lU3RydWN0ID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuXHRcdFx0Ly8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcblxyXG5cdFx0XHQvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG5cdFx0XHQvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuXHJcblx0XHRcdC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKFxyXG5cdFx0XHRcdHpvbmVOYW1lLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDFcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdC8vIGZpbmQgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zXHJcblx0XHRcdGxldCBwcmV2OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRcdC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cclxuXHRcdFx0XHRpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQmVmb3JlOiBudW1iZXIgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGlmIChsb2NhbFRpbWUudW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiBsb2NhbFRpbWUudW5peE1pbGxpcyA8IGxvY2FsQWZ0ZXIpIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjdG9yOiBudW1iZXIgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Ly8gbm8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdH1cclxuXHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG5cdCAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLlxyXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG90YWxPZmZzZXQoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG5cdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb247XHJcblxyXG5cdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDoge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuUnVsZU5hbWU6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSB0aGlzLmRzdE9mZnNldEZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6IC8vIGNhbm5vdCBoYXBwZW4sIGJ1dCB0aGUgY29tcGlsZXIgZG9lc250IHJlYWxpemUgaXRcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBkc3RPZmZzZXQuYWRkKHpvbmVJbmZvLmdtdG9mZik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSB6b25lIHJ1bGUgYWJicmV2aWF0aW9uLCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXHJcblx0ICogTm90ZSB0aGlzIGlzIGRlcGVuZGVudCBvbiB0aGUgdGltZSwgYmVjYXVzZSB3aXRoIHRpbWUgZGlmZmVyZW50IHJ1bGVzIGFyZSBpbiBlZmZlY3RcclxuXHQgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqIEByZXR1cm5cdFRoZSBhYmJyZXZpYXRpb24gb2YgdGhlIHJ1bGUgdGhhdCBpcyBpbiBlZmZlY3RcclxuXHQgKi9cclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRjb25zdCBmb3JtYXQ6IHN0cmluZyA9IHpvbmVJbmZvLmZvcm1hdDtcclxuXHJcblx0XHQvLyBpcyBmb3JtYXQgZGVwZW5kZW50IG9uIERTVD9cclxuXHRcdGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxyXG5cdFx0XHQmJiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuXHRcdFx0bGV0IGxldHRlcjogc3RyaW5nO1xyXG5cdFx0XHQvLyBwbGFjZSBpbiBmb3JtYXQgc3RyaW5nXHJcblx0XHRcdGlmIChkc3REZXBlbmRlbnQpIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSB0aGlzLmxldHRlckZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmb3JtYXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBleGNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAsIGFnYWluIGV4Y2x1ZGluZyBEU1QuXHJcblx0ICpcclxuXHQgKiBJZiB0aGUgbG9jYWwgdGltZXN0YW1wIGV4aXN0cyB0d2ljZSAoYXMgY2FuIG9jY3VyIHZlcnkgcmFyZWx5IGR1ZSB0byB6b25lIGNoYW5nZXMpXHJcblx0ICogdGhlbiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBpcyByZXR1cm5lZC5cclxuXHQgKlxyXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xyXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsICsgem9uZUluZm8uZ210b2ZmLm1pbGxpc2Vjb25kcygpID4gdW5peE1pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZSBpcyBub3JtYWxpemVkIG91dC5cclxuXHQgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcblx0ICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG90YWxPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XHJcblx0XHRjb25zdCBub3JtYWxpemVkVG06IFRpbWVTdHJ1Y3QgPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XHJcblxyXG5cdFx0Ly8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XHJcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxyXG5cclxuXHRcdC8vIFRoZXJlZm9yZSBiaW5hcnkgc2VhcmNoIGRvZXMgbm90IGFwcGx5LiBMaW5lYXIgc2VhcmNoIHRocm91Z2ggdHJhbnNpdGlvbnNcclxuXHRcdC8vIGFuZCByZXR1cm4gdGhlIGZpcnN0IG9mZnNldCB0aGF0IG1hdGNoZXNcclxuXHJcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyhcclxuXHRcdFx0em9uZU5hbWUsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgLSAxLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyICsgMVxyXG5cdFx0KTtcclxuXHRcdGxldCBwcmV2OiBUcmFuc2l0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0bGV0IHByZXZQcmV2OiBUcmFuc2l0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgPiBub3JtYWxpemVkVG0udW5peE1pbGxpcykge1xyXG5cdFx0XHRcdC8vIGZvdW5kIG9mZnNldDogcHJldi5vZmZzZXQgYXBwbGllc1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZQcmV2ID0gcHJldjtcclxuXHRcdFx0cHJldiA9IHRyYW5zaXRpb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuXHRcdGlmIChwcmV2KSB7XHJcblx0XHRcdC8vIHNwZWNpYWwgY2FyZSBkdXJpbmcgYmFja3dhcmQgY2hhbmdlOiB0YWtlIGZpcnN0IG9jY3VycmVuY2Ugb2YgbG9jYWwgdGltZVxyXG5cdFx0XHRpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xyXG5cdFx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZVxyXG5cdFx0XHRcdGNvbnN0IGRpZmYgPSBwcmV2UHJldi5vZmZzZXQuc3ViKHByZXYub2Zmc2V0KTtcclxuXHRcdFx0XHRpZiAobm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPj0gcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpXHJcblx0XHRcdFx0XHQmJiBub3JtYWxpemVkVG0udW5peE1pbGxpcyA8IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKSArIGRpZmYubWlsbGlzZWNvbmRzKCkpIHtcclxuXHRcdFx0XHRcdC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuXHRcdFx0XHRcdHJldHVybiBwcmV2UHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0aGlzIGNhbm5vdCBoYXBwZW4gYXMgdGhlIHRyYW5zaXRpb25zIGFycmF5IGlzIGd1YXJhbnRlZWQgdG8gY29udGFpbiBhIHRyYW5zaXRpb24gYXQgdGhlXHJcblx0XHRcdC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXHJcblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkc3RPZmZzZXRGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHRzOiBUaW1lU3RydWN0ID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lKTtcclxuXHJcblx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXHJcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XHJcblx0XHQpO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG5cdFx0bGV0IG9mZnNldDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XHJcblx0XHRmb3IgKGxldCBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcblx0XHRcdG9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG9mZnNldDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRpbWUgem9uZSBsZXR0ZXIgZm9yIHRoZSBnaXZlblxyXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wIGFzIFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXNcclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXR0ZXJGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IHN0cmluZyB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcblx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXHJcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XHJcblx0XHQpO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG5cdFx0bGV0IGxldHRlcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG5cdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIWxldHRlcikge1xyXG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuXHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbGV0dGVyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHRoZSBydWxlIHNldFxyXG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Zmlyc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcblx0ICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IFRyYW5zaXRpb25bXSB7XHJcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG5cclxuXHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcclxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XHJcblxyXG5cdFx0Zm9yIChsZXQgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XHJcblx0XHRcdGxldCBwcmV2SW5mbzogUnVsZUluZm8gfCB1bmRlZmluZWQ7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZUluZm9zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3QgcnVsZUluZm86IFJ1bGVJbmZvID0gcnVsZUluZm9zW2ldO1xyXG5cdFx0XHRcdGlmIChydWxlSW5mby5hcHBsaWNhYmxlKHkpKSB7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMoeSwgc3RhbmRhcmRPZmZzZXQsIHByZXZJbmZvKSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8uc2F2ZSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8ubGV0dGVyKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHByZXZJbmZvID0gcnVsZUluZm87XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxyXG5cdCAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vIHpvbmUgY2hhbmdlIHdpdGhpbiB0aGUgcmFuZ2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlcik6IFRyYW5zaXRpb25bXSB7XHJcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG5cclxuXHRcdGNvbnN0IHN0YXJ0TWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiBmcm9tWWVhciB9KTtcclxuXHRcdGNvbnN0IGVuZE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcclxuXHJcblxyXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0YXNzZXJ0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XHJcblxyXG5cdFx0bGV0IHByZXZab25lOiBab25lSW5mbyB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCBwcmV2VW50aWxZZWFyOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcblx0XHRsZXQgcHJldlN0ZE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdGxldCBwcmV2RHN0T2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0bGV0IHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0Y29uc3QgdW50aWxZZWFyOiBudW1iZXIgPSB6b25lSW5mby51bnRpbCAhPT0gdW5kZWZpbmVkID8gbmV3IFRpbWVTdHJ1Y3Qoem9uZUluZm8udW50aWwpLmNvbXBvbmVudHMueWVhciA6IHRvWWVhciArIDE7XHJcblx0XHRcdGxldCBzdGRPZmZzZXQ6IER1cmF0aW9uID0gcHJldlN0ZE9mZnNldDtcclxuXHRcdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb24gPSBwcmV2RHN0T2Zmc2V0O1xyXG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgPSBwcmV2TGV0dGVyO1xyXG5cclxuXHRcdFx0Ly8gem9uZSBhcHBsaWNhYmxlP1xyXG5cdFx0XHRpZiAoKCFwcmV2Wm9uZSB8fCBwcmV2Wm9uZS51bnRpbCA8IGVuZE1pbGxpcyAtIDEpICYmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID49IHN0YXJ0TWlsbGlzKSkge1xyXG5cclxuXHRcdFx0XHRzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcblxyXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdFx0XHQvLyAoZS5nLiBMeWJpYSlcclxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgcnVsZUluZm9zLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHJ1bGVJbmZvc1tqXTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcHJldlVudGlsWWVhciA9PT0gXCJudW1iZXJcIiAmJiBydWxlSW5mby5hcHBsaWNhYmxlKHByZXZVbnRpbFllYXIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby50cmFuc2l0aW9uVGltZVV0YyhwcmV2VW50aWxZZWFyLCBzdGRPZmZzZXQsIHVuZGVmaW5lZCkgPT09IHByZXZab25lLnVudGlsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdGNvbnN0IGF0OiBudW1iZXIgPSAocHJldlpvbmUgJiYgcHJldlpvbmUudW50aWwgIT09IHVuZGVmaW5lZCA/IHByZXZab25lLnVudGlsIDogc3RhcnRNaWxsaXMpO1xyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xyXG5cclxuXHRcdFx0XHQvLyBhZGQgdHJhbnNpdGlvbnMgZm9yIHRoZSB6b25lIHJ1bGVzIGluIHRoZSByYW5nZVxyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGRzdFRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0XHRcdFx0em9uZUluZm8ucnVsZU5hbWUsXHJcblx0XHRcdFx0XHRcdHByZXZVbnRpbFllYXIgIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByZXZVbnRpbFllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLFxyXG5cdFx0XHRcdFx0XHRNYXRoLm1pbih1bnRpbFllYXIsIHRvWWVhciksXHJcblx0XHRcdFx0XHRcdHN0ZE9mZnNldFxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGsgPSAwOyBrIDwgZHN0VHJhbnNpdGlvbnMubGVuZ3RoOyArK2spIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IGRzdFRyYW5zaXRpb25zW2tdO1xyXG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHRyYW5zaXRpb24uYXQsIHRyYW5zaXRpb24ub2Zmc2V0LmFkZChzdGRPZmZzZXQpLCB0cmFuc2l0aW9uLmxldHRlcikpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHByZXZab25lID0gem9uZUluZm87XHJcblx0XHRcdHByZXZVbnRpbFllYXIgPSB1bnRpbFllYXI7XHJcblx0XHRcdHByZXZTdGRPZmZzZXQgPSBzdGRPZmZzZXQ7XHJcblx0XHRcdHByZXZEc3RPZmZzZXQgPSBkc3RPZmZzZXQ7XHJcblx0XHRcdHByZXZMZXR0ZXIgPSBsZXR0ZXI7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHpvbmUgaW5mbyBmb3IgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuIFRocm93cyBpZiBub3QgZm91bmQuXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxyXG5cdCAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRab25lSW5mbyh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogWm9uZUluZm8ge1xyXG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IHV0Y1RpbWUgOiB1dGNUaW1lLnVuaXhNaWxsaXMpO1xyXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBab25lSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lLCBhZnRlclxyXG5cdCAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcclxuXHQgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvcyh6b25lTmFtZTogc3RyaW5nKTogWm9uZUluZm9bXSB7XHJcblx0XHQvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRha2UgZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCByZXN1bHQ6IFpvbmVJbmZvW10gPSBbXTtcclxuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdC8vIGZpbmFsIHpvbmUgaW5mbyBmb3VuZFxyXG5cdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHpvbmVFbnRyaWVzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzW2ldO1xyXG5cdFx0XHRjb25zdCBydWxlVHlwZTogUnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuXHRcdFx0bGV0IHVudGlsOiBudW1iZXIgfCB1bmRlZmluZWQgPSBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVszXSk7XHJcblx0XHRcdGlmIChpc05hTih1bnRpbCkpIHtcclxuXHRcdFx0XHR1bnRpbCA9IHVuZGVmaW5lZDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFpvbmVJbmZvKFxyXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQgPyBuZXcgRHVyYXRpb24oem9uZUVudHJ5WzFdKSA6IG5ldyBEdXJhdGlvbigpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsXHJcblx0XHRcdFx0em9uZUVudHJ5WzJdLFxyXG5cdFx0XHRcdHVudGlsXHJcblx0XHRcdCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBab25lSW5mbywgYjogWm9uZUluZm8pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHQvLyBzb3J0IHVuZGVmaW5lZCBsYXN0XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsICE9PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIDE7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIChhLnVudGlsIC0gYi51bnRpbCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXSA9IHJlc3VsdDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogcnVsZSBpbmZvIGNhY2hlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcnVsZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFJ1bGVJbmZvW10gfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBydWxlIHNldCB3aXRoIHRoZSBnaXZlbiBydWxlIG5hbWUsXHJcblx0ICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgcnVsZSBzZXRcclxuXHQgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRSdWxlSW5mb3MocnVsZU5hbWU6IHN0cmluZyk6IFJ1bGVJbmZvW10ge1xyXG5cdFx0Ly8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXHJcblx0XHRpZiAoIXRoaXMuX2RhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gcmV0dXJuIGZyb20gY2FjaGVcclxuXHRcdGlmICh0aGlzLl9ydWxlSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV07XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0OiBSdWxlSW5mb1tdID0gW107XHJcblx0XHRjb25zdCBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVTZXQubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgcnVsZSA9IHJ1bGVTZXRbaV07XHJcblxyXG5cdFx0XHRjb25zdCBmcm9tWWVhcjogbnVtYmVyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xyXG5cdFx0XHRjb25zdCB0b1R5cGU6IFRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XHJcblx0XHRcdGNvbnN0IHRvWWVhcjogbnVtYmVyID0gKHRvVHlwZSA9PT0gVG9UeXBlLk1heCA/IDAgOiAocnVsZVsxXSA9PT0gXCJvbmx5XCIgPyBmcm9tWWVhciA6IHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpO1xyXG5cdFx0XHRjb25zdCBvblR5cGU6IE9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XHJcblx0XHRcdGNvbnN0IG9uRGF5OiBudW1iZXIgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcclxuXHRcdFx0Y29uc3Qgb25XZWVrRGF5OiBXZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcclxuXHRcdFx0Y29uc3QgbW9udGhOYW1lOiBzdHJpbmcgPSA8c3RyaW5nPnJ1bGVbM107XHJcblx0XHRcdGNvbnN0IG1vbnRoTnVtYmVyOiBudW1iZXIgPSBtb250aE5hbWVUb1N0cmluZyhtb250aE5hbWUpO1xyXG5cclxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFJ1bGVJbmZvKFxyXG5cdFx0XHRcdGZyb21ZZWFyLFxyXG5cdFx0XHRcdHRvVHlwZSxcclxuXHRcdFx0XHR0b1llYXIsXHJcblx0XHRcdFx0cnVsZVsyXSxcclxuXHRcdFx0XHRtb250aE51bWJlcixcclxuXHRcdFx0XHRvblR5cGUsXHJcblx0XHRcdFx0b25EYXksXHJcblx0XHRcdFx0b25XZWVrRGF5LFxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApLCA2MCksXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzJdLCAxMCksIDYwKSxcclxuXHRcdFx0XHR0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLFxyXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSxcclxuXHRcdFx0XHRydWxlWzddID09PSBcIi1cIiA/IFwiXCIgOiBydWxlWzddXHJcblx0XHRcdFx0KSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBSdWxlSW5mbywgYjogUnVsZUluZm8pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fSBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIDE7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdID0gcmVzdWx0O1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBSVUxFUyBjb2x1bW4gb2YgYSB6b25lIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VSdWxlVHlwZShydWxlOiBzdHJpbmcpOiBSdWxlVHlwZSB7XHJcblx0XHRpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcblx0XHR9IGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VUb1R5cGUodG86IHN0cmluZyk6IFRvVHlwZSB7XHJcblx0XHRpZiAodG8gPT09IFwibWF4XCIpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5NYXg7XHJcblx0XHR9IGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLlllYXI7IC8vIHllcyB3ZSByZXR1cm4gWWVhciBmb3Igb25seVxyXG5cdFx0fSBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVE8gY29sdW1uIGluY29ycmVjdDogXCIgKyB0byk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPblR5cGUob246IHN0cmluZyk6IE9uVHlwZSB7XHJcblx0XHRpZiAob24ubGVuZ3RoID4gNCAmJiBvbi5zdWJzdHIoMCwgNCkgPT09IFwibGFzdFwiKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuTGFzdFg7XHJcblx0XHR9XHJcblx0XHRpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkxlcVg7XHJcblx0XHR9XHJcblx0XHRpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkdyZXFYO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIE9uVHlwZS5EYXlOdW07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGRheSBudW1iZXIgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCAwIGlmIG5vIGRheS5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPbkRheShvbjogc3RyaW5nLCBvblR5cGU6IE9uVHlwZSk6IG51bWJlciB7XHJcblx0XHRzd2l0Y2ggKG9uVHlwZSkge1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI8PVwiKSArIDIpLCAxMCk7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI+PVwiKSArIDIpLCAxMCk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPbldlZWtEYXkob246IHN0cmluZyk6IFdlZWtEYXkge1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuXHRcdFx0aWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XHJcblx0XHRcdFx0cmV0dXJuIDxXZWVrRGF5Pmk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHJldHVybiBXZWVrRGF5LlN1bmRheTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VBdFR5cGUoYXQ6IGFueSk6IEF0VHlwZSB7XHJcblx0XHRzd2l0Y2ggKGF0KSB7XHJcblx0XHRcdGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcblx0XHRcdGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0Y2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuaW50ZXJmYWNlIE1pbk1heEluZm8ge1xyXG5cdG1pbkRzdFNhdmU6IG51bWJlcjtcclxuXHRtYXhEc3RTYXZlOiBudW1iZXI7XHJcblx0bWluR210T2ZmOiBudW1iZXI7XHJcblx0bWF4R210T2ZmOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRGF0YShkYXRhOiBhbnkpOiBNaW5NYXhJbmZvIHtcclxuXHRjb25zdCByZXN1bHQ6IFBhcnRpYWw8TWluTWF4SW5mbz4gPSB7fTtcclxuXHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gcnVsZXMgcHJvcGVydHlcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyB6b25lcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblxyXG5cdC8vIHZhbGlkYXRlIHpvbmVzXHJcblx0Zm9yIChsZXQgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xyXG5cdFx0aWYgKGRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVBcnI6IGFueSA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0XHRpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoPHN0cmluZz56b25lQXJyKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgPHN0cmluZz56b25lQXJyICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBlbnRyeTogYW55ID0gem9uZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjb25zdCBnbXRvZmYgPSBtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzBdKTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGlzTmFOKGdtdG9mZikpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gdW5kZWZpbmVkIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluR210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgcnVsZXNcclxuXHRmb3IgKGxldCBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XHJcblx0XHRpZiAoZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0Y29uc3QgcnVsZUFycjogYW55ID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3QgcnVsZSA9IHJ1bGVBcnJbaV07XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlLmxlbmd0aCA8IDgpIHsgLy8gbm90ZSBzb21lIHJ1bGVzID4gOCBleGlzdHMgYnV0IHRoYXQgc2VlbXMgdG8gYmUgYSBidWcgaW4gdHogZmlsZSBwYXJzaW5nXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBydWxlLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChqICE9PSA1ICYmIHR5cGVvZiBydWxlW2pdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXHJcblx0XHRcdFx0XHQmJiBydWxlWzRdLmluZGV4T2YoXCI8PVwiKSA9PT0gLTEgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVs0XSwgMTApKVxyXG5cdFx0XHRcdCkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzVdLmxlbmd0aCAhPT0gNCkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMV0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXHJcblx0XHRcdFx0XHQmJiBydWxlWzVdWzNdICE9PSBcImdcIiAmJiBydWxlWzVdWzNdICE9PSBcInVcIiAmJiBydWxlWzVdWzNdICE9PSBcInpcIiAmJiBydWxlWzVdWzNdICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzNdIGlzIG5vdCBlbXB0eSwgZywgeiwgcywgdywgdSBvciBudWxsXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb25zdCBzYXZlOiBudW1iZXIgPSBwYXJzZUludChydWxlWzZdLCAxMCk7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHNhdmUpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzYXZlICE9PSAwKSB7XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5Ec3RTYXZlID0gc2F2ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQgYXMgTWluTWF4SW5mbztcclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIERhdGUgYW5kIFRpbWUgdXRpbGl0eSBmdW5jdGlvbnMgLSBtYWluIGluZGV4XHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZGF0ZXRpbWVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZm9ybWF0XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2dsb2JhbHNcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9wYXJzZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9wZXJpb2RcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3RpbWVzb3VyY2VcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuIl19
