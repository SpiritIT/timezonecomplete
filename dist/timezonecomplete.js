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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7QUFFYixnQkFBZ0IsU0FBYyxFQUFFLE9BQWU7SUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7QUFFRDtrQkFBZSxNQUFNLENBQUM7O0FDWnRCOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7QUFFYix1QkFBbUIsVUFBVSxDQUFDLENBQUE7QUFDOUIsMkJBQThCLGNBQWMsQ0FBQyxDQUFBO0FBQzdDLElBQVksSUFBSSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0FBQy9CLElBQVksT0FBTyxXQUFNLFdBQVcsQ0FBQyxDQUFBO0FBc0VyQzs7O0dBR0c7QUFDSCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMs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QUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN0QixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN0QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLHVDQUF1QztZQUN2RixDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNyQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsS0FBSyxpQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM5QyxDQUFDO1lB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Q0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO3VCQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0YsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLDZDQUE2QyxDQUFDLENBQUM7Z0JBQzVHLENBQUM7Z0JBQ0QsSUFBTSxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0Msd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsc0NBQXNDLENBQUMsQ0FBQztnQkFDckcsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUM1RCxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQzVELE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUMxQixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2YsQ0FBQzs7OztBQ3ZtREQ7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7OztBQUViLGlCQUFjLFVBQVUsQ0FBQyxFQUFBO0FBQ3pCLGlCQUFjLFlBQVksQ0FBQyxFQUFBO0FBQzNCLGlCQUFjLFlBQVksQ0FBQyxFQUFBO0FBQzNCLGlCQUFjLFVBQVUsQ0FBQyxFQUFBO0FBQ3pCLGlCQUFjLFdBQVcsQ0FBQyxFQUFBO0FBQzFCLGlCQUFjLGNBQWMsQ0FBQyxFQUFBO0FBQzdCLGlCQUFjLFNBQVMsQ0FBQyxFQUFBO0FBQ3hCLGlCQUFjLFVBQVUsQ0FBQyxFQUFBO0FBQ3pCLGlCQUFjLFVBQVUsQ0FBQyxFQUFBO0FBQ3pCLGlCQUFjLGNBQWMsQ0FBQyxFQUFBO0FBQzdCLGlCQUFjLFlBQVksQ0FBQyxFQUFBO0FBQzNCLGlCQUFjLGVBQWUsQ0FBQyxFQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNiBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGFueSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcblx0aWYgKCFjb25kaXRpb24pIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzc2VydDtcclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcclxuXHJcbi8qKlxyXG4gKiBVc2VkIGZvciBtZXRob2RzIHRoYXQgdGFrZSBhIHRpbWVzdGFtcCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRPcHRzIHtcclxuXHQvKipcclxuXHQgKiBZZWFyLCBkZWZhdWx0IDE5NzBcclxuXHQgKi9cclxuXHR5ZWFyPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIDEtMTIsIGRlZmF1bHQgMVxyXG5cdCAqL1xyXG5cdG1vbnRoPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIERheSBvZiBtb250aCAxLTMxLCBkZWZhdWx0IDFcclxuXHQgKi9cclxuXHRkYXk/OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogSG91ciBvZiBkYXkgMC0yMywgZGVmYXVsdCAwXHJcblx0ICovXHJcblx0aG91cj86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBNaW51dGUgMC01OSwgZGVmYXVsdCAwXHJcblx0ICovXHJcblx0bWludXRlPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIFNlY29uZCAwLTU5LCBkZWZhdWx0IDBcclxuXHQgKi9cclxuXHRzZWNvbmQ/OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWlsbGlzZWNvbmQgMC05OTksIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdG1pbGxpPzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogVGltZXN0YW1wIHJlcHJlc2VudGVkIGFzIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGltZUNvbXBvbmVudHMge1xyXG5cdC8qKlxyXG5cdCAqIFllYXJcclxuXHQgKi9cclxuXHR5ZWFyOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTW9udGggMS0xMlxyXG5cdCAqL1xyXG5cdG1vbnRoOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogRGF5IG9mIG1vbnRoIDEtMzFcclxuXHQgKi9cclxuXHRkYXk6IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBIb3VyIDAtMjNcclxuXHQgKi9cclxuXHRob3VyOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWludXRlXHJcblx0ICovXHJcblx0bWludXRlOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogU2Vjb25kXHJcblx0ICovXHJcblx0c2Vjb25kOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWlsbGlzZWNvbmQgMC05OTlcclxuXHQgKi9cclxuXHRtaWxsaTogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcclxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcclxuICovXHJcbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xyXG5cdFN1bmRheSxcclxuXHRNb25kYXksXHJcblx0VHVlc2RheSxcclxuXHRXZWRuZXNkYXksXHJcblx0VGh1cnNkYXksXHJcblx0RnJpZGF5LFxyXG5cdFNhdHVyZGF5XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUaW1lVW5pdCB7XHJcblx0TWlsbGlzZWNvbmQsXHJcblx0U2Vjb25kLFxyXG5cdE1pbnV0ZSxcclxuXHRIb3VyLFxyXG5cdERheSxcclxuXHRXZWVrLFxyXG5cdE1vbnRoLFxyXG5cdFllYXIsXHJcblx0LyoqXHJcblx0ICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXHJcblx0ICovXHJcblx0TUFYXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cclxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xyXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXHJcbiAqXHJcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxyXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiByZXR1cm4gMTtcclxuXHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiByZXR1cm4gNjAgKiA2MCAqIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDogcmV0dXJuIDMwICogODY0MDAwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXRcIik7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxyXG4gKiBpZiBuZWNlc3NhcnkuXHJcbiAqIEBwYXJhbSB1bml0IFRoZSB1bml0XHJcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdDogVGltZVVuaXQsIGFtb3VudDogbnVtYmVyID0gMSk6IHN0cmluZyB7XHJcblx0Y29uc3QgcmVzdWx0ID0gVGltZVVuaXRbdW5pdF0udG9Mb3dlckNhc2UoKTtcclxuXHRpZiAoYW1vdW50ID09PSAxIHx8IGFtb3VudCA9PT0gLTEpIHtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiByZXN1bHQgKyBcInNcIjtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHM6IHN0cmluZyk6IFRpbWVVbml0IHtcclxuXHRjb25zdCB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IFRpbWVVbml0Lk1BWDsgKytpKSB7XHJcblx0XHRjb25zdCBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XHJcblx0XHRpZiAob3RoZXIgPT09IHRyaW1tZWQgfHwgKG90aGVyICsgXCJzXCIpID09PSB0cmltbWVkKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNMZWFwWWVhcih5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHQvLyBmcm9tIFdpa2lwZWRpYTpcclxuXHQvLyBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNCB0aGVuIGNvbW1vbiB5ZWFyXHJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNDAwIHRoZW4gY29tbW9uIHllYXJcclxuXHQvLyBlbHNlIGxlYXAgeWVhclxyXG5cdGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0gZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICh5ZWFyICUgNDAwICE9PSAwKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBkYXlzIGluIGEgZ2l2ZW4geWVhclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjUpO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxyXG4gKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdHN3aXRjaCAobW9udGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMzpcclxuXHRcdGNhc2UgNTpcclxuXHRcdGNhc2UgNzpcclxuXHRcdGNhc2UgODpcclxuXHRcdGNhc2UgMTA6XHJcblx0XHRjYXNlIDEyOlxyXG5cdFx0XHRyZXR1cm4gMzE7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0Y2FzZSA2OlxyXG5cdFx0Y2FzZSA5OlxyXG5cdFx0Y2FzZSAxMTpcclxuXHRcdFx0cmV0dXJuIDMwO1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheU9mWWVhcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRhc3NlcnQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0YXNzZXJ0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuXHRsZXQgeWVhckRheTogbnVtYmVyID0gMDtcclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG5cdFx0eWVhckRheSArPSBkYXlzSW5Nb250aCh5ZWFyLCBpKTtcclxuXHR9XHJcblx0eWVhckRheSArPSAoZGF5IC0gMSk7XHJcblx0cmV0dXJuIHllYXJEYXk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcclxuICpcclxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBlbmRPZk1vbnRoOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5OiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkgfSk7XHJcblx0Y29uc3QgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gZW5kT2ZNb250aFdlZWtEYXk7XHJcblx0aWYgKGRpZmYgPiAwKSB7XHJcblx0XHRkaWZmIC09IDc7XHJcblx0fVxyXG5cdHJldHVybiBlbmRPZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcclxuICpcclxuICogQHJldHVybiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdGNvbnN0IGJlZ2luT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogMX0pO1xyXG5cdGNvbnN0IGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XHJcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmIDwgMCkge1xyXG5cdFx0ZGlmZiArPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gYmVnaW5PZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckFmdGVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdGNvbnN0IHN0YXJ0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5IH0pO1xyXG5cdGNvbnN0IHN0YXJ0V2Vla0RheTogV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG5cdGlmIChkaWZmIDwgMCkge1xyXG5cdFx0ZGlmZiArPSA3O1xyXG5cdH1cclxuXHRhc3NlcnQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmIDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXHJcbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtEYXlPbk9yQmVmb3JlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdGNvbnN0IHN0YXJ0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3Qoe3llYXIsIG1vbnRoLCBkYXl9KTtcclxuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuXHRpZiAoZGlmZiA+IDApIHtcclxuXHRcdGRpZmYgLT0gNztcclxuXHR9XHJcblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA+PSAxLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG5cdHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICpcclxuICogQHBhcmFtIHllYXIgVGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoIFRoZSBtb250aCBbMS0xMl1cclxuICogQHBhcmFtIGRheSBUaGUgZGF5IFsxLTMxXVxyXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0Y29uc3QgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xyXG5cdGNvbnN0IGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG5cdGlmIChkYXkgPCBmaXJzdE1vbmRheSkge1xyXG5cdFx0aWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xyXG5cdFx0XHQvLyBXZWVrIDFcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRcdFx0aWYgKG1vbnRoID4gMSkge1xyXG5cdFx0XHRcdC8vIERlZmF1bHQgY2FzZVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIDMxKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBKYW51YXJ5XHJcblx0XHRcdFx0cmV0dXJuIHdlZWtPZk1vbnRoKHllYXIgLSAxLCAxMiwgMzEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjb25zdCBsYXN0TW9uZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XHJcblx0Y29uc3QgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5ID49IGxhc3RNb25kYXkpIHtcclxuXHRcdGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcblx0XHRcdC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gTm9ybWFsIGNhc2VcclxuXHRsZXQgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG5cdGlmIChmaXJzdFRodXJzZGF5IDwgNCkge1xyXG5cdFx0cmVzdWx0ICs9IDE7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLXllYXIgb2YgdGhlIE1vbmRheSBvZiB3ZWVrIDEgaW4gdGhlIGdpdmVuIHllYXIuXHJcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcclxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcclxuICovXHJcbmZ1bmN0aW9uIGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHQvLyBmaXJzdCBtb25kYXkgb2YgSmFudWFyeSwgbWludXMgb25lIGJlY2F1c2Ugd2Ugd2FudCBkYXktb2YteWVhclxyXG5cdGxldCByZXN1bHQ6IG51bWJlciA9IHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgMSwgMSwgV2Vla0RheS5Nb25kYXkpIC0gMTtcclxuXHRpZiAocmVzdWx0ID4gMykgeyAvLyBncmVhdGVyIHRoYW4gamFuIDR0aFxyXG5cdFx0cmVzdWx0IC09IDc7XHJcblx0XHRpZiAocmVzdWx0IDwgMCkge1xyXG5cdFx0XHRyZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlciBmb3IgdGhlIGdpdmVuIGRhdGUuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IG9mIG1vbnRoIDEtMzFcclxuICpcclxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRjb25zdCBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XHJcblxyXG5cdC8vIGNoZWNrIGVuZC1vZi15ZWFyIGNvcm5lciBjYXNlOiBtYXkgYmUgd2VlayAxIG9mIG5leHQgeWVhclxyXG5cdGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcclxuXHRcdGNvbnN0IG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xyXG5cdFx0aWYgKG5leHRZZWFyV2Vla09uZSA+IDQgJiYgbmV4dFllYXJXZWVrT25lIDw9IGRveSkge1xyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIGNoZWNrIGJlZ2lubmluZy1vZi15ZWFyIGNvcm5lciBjYXNlXHJcblx0Y29uc3QgdGhpc1llYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKTtcclxuXHRpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xyXG5cdFx0Ly8gd2VlayAxIGlzIGF0IGVuZCBvZiBsYXN0IHllYXJcclxuXHRcdGNvbnN0IHdlZWtUd28gPSB0aGlzWWVhcldlZWtPbmUgKyA3IC0gZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcblx0XHRpZiAoZG95IDwgd2Vla1R3bykge1xyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB3ZWVrVHdvKSAvIDcpICsgMjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxyXG5cdGlmIChkb3kgPCB0aGlzWWVhcldlZWtPbmUpIHtcclxuXHRcdC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXHJcblx0XHRyZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHR9XHJcblxyXG5cdC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcclxuXHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpczogbnVtYmVyKTogdm9pZCB7XHJcblx0YXNzZXJ0KHR5cGVvZiAodW5peE1pbGxpcykgPT09IFwibnVtYmVyXCIsIFwibnVtYmVyIGlucHV0IGV4cGVjdGVkXCIpO1xyXG5cdGFzc2VydCghaXNOYU4odW5peE1pbGxpcyksIFwiTmFOIG5vdCBleHBlY3RlZCBhcyBpbnB1dFwiKTtcclxuXHRhc3NlcnQobWF0aC5pc0ludCh1bml4TWlsbGlzKSwgXCJFeHBlY3QgaW50ZWdlciBudW1iZXIgZm9yIHVuaXggVVRDIHRpbWVzdGFtcFwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzOiBudW1iZXIpOiBUaW1lQ29tcG9uZW50cyB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0bGV0IHRlbXA6IG51bWJlciA9IHVuaXhNaWxsaXM7XHJcblx0Y29uc3QgcmVzdWx0OiBUaW1lQ29tcG9uZW50cyA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwfTtcclxuXHRsZXQgeWVhcjogbnVtYmVyO1xyXG5cdGxldCBtb250aDogbnVtYmVyO1xyXG5cclxuXHRpZiAodW5peE1pbGxpcyA+PSAwKSB7XHJcblx0XHRyZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuXHRcdHJlc3VsdC5zZWNvbmQgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IHRlbXAgJSA2MDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcblx0XHRyZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcblxyXG5cdFx0eWVhciA9IDE5NzA7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XHJcblx0XHRcdHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcclxuXHRcdFx0eWVhcisrO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xyXG5cclxuXHRcdG1vbnRoID0gMTtcclxuXHRcdHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuXHRcdFx0bW9udGgrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC5tb250aCA9IG1vbnRoO1xyXG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXHJcblx0XHQvLyBXZSBtYWtlIGl0IHBvc2l0aXZlIGJ5IGFkZGluZyB0aGUgbW9kdWxvLlxyXG5cdFx0cmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuXHRcdHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcblx0XHRyZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcblxyXG5cdFx0eWVhciA9IDE5Njk7XHJcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5ZZWFyKHllYXIpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcclxuXHRcdFx0eWVhci0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xyXG5cclxuXHRcdG1vbnRoID0gMTI7XHJcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCArPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoLS07XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMSArIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXHJcbiAqL1xyXG5mdW5jdGlvbiBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzOiBUaW1lQ29tcG9uZW50T3B0cyk6IFRpbWVDb21wb25lbnRzIHtcclxuXHRjb25zdCBpbnB1dCA9IHtcclxuXHRcdHllYXI6IHR5cGVvZiBjb21wb25lbnRzLnllYXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnllYXIgOiAxOTcwLFxyXG5cdFx0bW9udGg6IHR5cGVvZiBjb21wb25lbnRzLm1vbnRoID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5tb250aCA6IDEsXHJcblx0XHRkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcclxuXHRcdGhvdXI6IHR5cGVvZiBjb21wb25lbnRzLmhvdXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmhvdXIgOiAwLFxyXG5cdFx0bWludXRlOiB0eXBlb2YgY29tcG9uZW50cy5taW51dGUgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbnV0ZSA6IDAsXHJcblx0XHRzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcclxuXHRcdG1pbGxpOiB0eXBlb2YgY29tcG9uZW50cy5taWxsaSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWlsbGkgOiAwLFxyXG5cdH07XHJcblx0cmV0dXJuIGlucHV0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBhIHllYXIsIG1vbnRoLCBkYXkgZXRjIGludG8gYSB1bml4IG1pbGxpIHRpbWVzdGFtcC5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IDEtMzFcclxuICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xyXG4gKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxyXG4gKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgaG91cjogbnVtYmVyLCBtaW51dGU6IG51bWJlciwgc2Vjb25kOiBudW1iZXIsIG1pbGxpOiBudW1iZXJcclxuKTogbnVtYmVyO1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBudW1iZXI7XHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhcclxuXHRhOiBUaW1lQ29tcG9uZW50T3B0cyB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcbik6IG51bWJlciB7XHJcblx0Y29uc3QgY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyB7IHllYXI6IGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9IDogYSk7XHJcblx0Y29uc3QgaW5wdXQ6IFRpbWVDb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XHJcblx0cmV0dXJuIGlucHV0Lm1pbGxpICsgMTAwMCAqIChcclxuXHRcdGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXHJcblx0XHQoaW5wdXQueWVhciAtIDE5NzApICogMzE1MzYwMDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTk2OSkgLyA0KSAqIDg2NDAwIC1cclxuXHRcdE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAxKSAvIDEwMCkgKiA4NjQwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAwICsgMjk5KSAvIDQwMCkgKiA4NjQwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5Tm9MZWFwU2Vjcyh1bml4TWlsbGlzOiBudW1iZXIpOiBXZWVrRGF5IHtcclxuXHRhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xyXG5cclxuXHRjb25zdCBlcG9jaERheTogV2Vla0RheSA9IFdlZWtEYXkuVGh1cnNkYXk7XHJcblx0Y29uc3QgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XHJcblx0cmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcclxufVxyXG5cclxuLyoqXHJcbiAqIE4tdGggc2Vjb25kIGluIHRoZSBkYXksIGNvdW50aW5nIGZyb20gMFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyByZXByZXNlbnRhdGlvbiBvZiBhIGRhdGUgYW5kIHRpbWVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaW1lU3RydWN0IHtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSB0aGUgZ2l2ZW4geWVhciwgbW9udGgsIGRheSBldGNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxyXG5cdCAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG5cdCAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcblx0ICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuXHQgKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tQ29tcG9uZW50cyhcclxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsXHJcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBUaW1lU3RydWN0IHtcclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xyXG5cdCAqIChiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbVVuaXgodW5peE1pbGxpczogbnVtYmVyKTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxyXG5cdCAqIEBwYXJhbSBkZlx0V2hpY2ggZnVuY3Rpb25zIHRvIHRha2UgKGdldFgoKSBvciBnZXRVVENYKCkpXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRGF0ZShkOiBEYXRlLCBkZjogRGF0ZUZ1bmN0aW9ucyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0aWYgKGRmID09PSBEYXRlRnVuY3Rpb25zLkdldCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xyXG5cdFx0XHRcdHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXHJcblx0XHRcdFx0aG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcblx0XHRcdFx0eWVhcjogZC5nZXRVVENGdWxsWWVhcigpLCBtb250aDogZC5nZXRVVENNb250aCgpICsgMSwgZGF5OiBkLmdldFVUQ0RhdGUoKSxcclxuXHRcdFx0XHRob3VyOiBkLmdldFVUQ0hvdXJzKCksIG1pbnV0ZTogZC5nZXRVVENNaW51dGVzKCksIHNlY29uZDogZC5nZXRVVENTZWNvbmRzKCksIG1pbGxpOiBkLmdldFVUQ01pbGxpc2Vjb25kcygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSBhbiBJU08gODYwMSBzdHJpbmcgV0lUSE9VVCB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoczogc3RyaW5nKTogVGltZVN0cnVjdCB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gMTk3MDtcclxuXHRcdFx0bGV0IG1vbnRoOiBudW1iZXIgPSAxO1xyXG5cdFx0XHRsZXQgZGF5OiBudW1iZXIgPSAxO1xyXG5cdFx0XHRsZXQgaG91cjogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IGZyYWN0aW9uTWlsbGlzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRsZXQgbGFzdFVuaXQ6IFRpbWVVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuXHJcblx0XHRcdC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcclxuXHRcdFx0Y29uc3Qgc3BsaXQ6IHN0cmluZ1tdID0gcy50cmltKCkuc3BsaXQoXCIuXCIpO1xyXG5cdFx0XHRhc3NlcnQoc3BsaXQubGVuZ3RoID49IDEgJiYgc3BsaXQubGVuZ3RoIDw9IDIsIFwiRW1wdHkgc3RyaW5nIG9yIG11bHRpcGxlIGRvdHMuXCIpO1xyXG5cclxuXHRcdFx0Ly8gcGFyc2UgbWFpbiBwYXJ0XHJcblx0XHRcdGNvbnN0IGlzQmFzaWNGb3JtYXQgPSAocy5pbmRleE9mKFwiLVwiKSA9PT0gLTEpO1xyXG5cdFx0XHRpZiAoaXNCYXNpY0Zvcm1hdCkge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXigoXFxkKSspfChcXGRcXGRcXGRcXGRcXGRcXGRcXGRcXGRUKFxcZCkrKSQvKSxcclxuXHRcdFx0XHRcdFwiSVNPIHN0cmluZyBpbiBiYXNpYyBub3RhdGlvbiBtYXkgb25seSBjb250YWluIG51bWJlcnMgYmVmb3JlIHRoZSBmcmFjdGlvbmFsIHBhcnRcIik7XHJcblxyXG5cdFx0XHRcdC8vIHJlbW92ZSBhbnkgXCJUXCIgc2VwYXJhdG9yXHJcblx0XHRcdFx0c3BsaXRbMF0gPSBzcGxpdFswXS5yZXBsYWNlKFwiVFwiLCBcIlwiKTtcclxuXHJcblx0XHRcdFx0YXNzZXJ0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLFxyXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuXHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0bW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGRheSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig2LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTIpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMCwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTIsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YXNzZXJ0KHNwbGl0WzBdLm1hdGNoKC9eXFxkXFxkXFxkXFxkKC1cXGRcXGQtXFxkXFxkKChUKT9cXGRcXGQoXFw6XFxkXFxkKDpcXGRcXGQpPyk/KT8pPyQvKSwgXCJJbnZhbGlkIElTTyBzdHJpbmdcIik7XHJcblx0XHRcdFx0bGV0IGRhdGVBbmRUaW1lOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRcdGlmIChzLmluZGV4T2YoXCJUXCIpICE9PSAtMSkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IFtzcGxpdFswXS5zdWJzdHIoMCwgMTApLCBzcGxpdFswXS5zdWJzdHIoMTApXTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0sIFwiXCJdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRhc3NlcnQoWzQsIDEwXS5pbmRleE9mKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCkgIT09IC0xLFxyXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuXHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSA0KSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XHJcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xyXG5cdFx0XHRcdFx0bWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gcGFyc2UgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRjb25zdCBmcmFjdGlvbjogbnVtYmVyID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XHJcblx0XHRcdFx0c3dpdGNoIChsYXN0VW5pdCkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gZGF5c0luWWVhcih5ZWFyKSAqIDg2NDAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZToge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDYwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAxMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gY29tYmluZSBtYWluIGFuZCBmcmFjdGlvbmFsIHBhcnRcclxuXHRcdFx0eWVhciA9IG1hdGgucm91bmRTeW0oeWVhcik7XHJcblx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XHJcblx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcclxuXHRcdFx0aG91ciA9IG1hdGgucm91bmRTeW0oaG91cik7XHJcblx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcclxuXHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xyXG5cdFx0XHRsZXQgdW5peE1pbGxpczogbnVtYmVyID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCB9KTtcclxuXHRcdFx0dW5peE1pbGxpcyA9IG1hdGgucm91bmRTeW0odW5peE1pbGxpcyArIGZyYWN0aW9uTWlsbGlzKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIlwiICsgcyArIFwiXFxcIjogXCIgKyBlLm1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgdmFsdWUgaW4gdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF91bml4TWlsbGlzOiBudW1iZXI7XHJcblx0cHVibGljIGdldCB1bml4TWlsbGlzKCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuX3VuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLl9jb21wb25lbnRzKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl91bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgdmFsdWUgaW4gc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2NvbXBvbmVudHM6IFRpbWVDb21wb25lbnRzO1xyXG5cdHB1YmxpYyBnZXQgY29tcG9uZW50cygpOiBUaW1lQ29tcG9uZW50cyB7XHJcblx0XHRpZiAoIXRoaXMuX2NvbXBvbmVudHMpIHtcclxuXHRcdFx0dGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHVuaXhNaWxsaXMgbWlsbGlzZWNvbmRzIHNpbmNlIDEtMS0xOTcwXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IodW5peE1pbGxpczogbnVtYmVyKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbXBvbmVudHMgU2VwYXJhdGUgdGltZXN0YW1wIGNvbXBvbmVudHMgKHllYXIsIG1vbnRoLCAuLi4pXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoYTogbnVtYmVyIHwgVGltZUNvbXBvbmVudE9wdHMpIHtcclxuXHRcdGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xyXG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gYTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGdldCB5ZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XHJcblx0fVxyXG5cclxuXHRnZXQgbW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XHJcblx0fVxyXG5cclxuXHRnZXQgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLmRheTtcclxuXHR9XHJcblxyXG5cdGdldCBob3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XHJcblx0fVxyXG5cclxuXHRnZXQgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcclxuXHR9XHJcblxyXG5cdGdldCBzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1pbGxpKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XHJcblx0ICovXHJcblx0cHVibGljIHllYXJEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBkYXlPZlllYXIodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aCwgdGhpcy5jb21wb25lbnRzLmRheSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lU3RydWN0KTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy52YWx1ZU9mKCkgPT09IG90aGVyLnZhbHVlT2YoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGNsb25lKCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX2NvbXBvbmVudHMpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX3VuaXhNaWxsaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcclxuXHQgKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgdGltZXN0YW1wIGlzIHZhbGlkXHJcblx0ICovXHJcblx0cHVibGljIHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5kYXkgPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMuZGF5IDw9IGRheXNJbk1vbnRoKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgpXHJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA8PSAyM1xyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XHJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPD0gNTlcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPD0gOTk5O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJU08gODYwMSBzdHJpbmcgWVlZWS1NTS1ERFRoaDptbTpzcy5ubm5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcclxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubW9udGgudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWludXRlLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeUluc2VydGlvbkluZGV4PFQ+KGFycjogVFtdLCBjb21wYXJlPzogKGE6IFQpID0+IG51bWJlcik6IG51bWJlciB7XHJcblx0bGV0IG1pbkluZGV4ID0gMDtcclxuXHRsZXQgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcclxuXHRsZXQgY3VycmVudEluZGV4OiBudW1iZXI7XHJcblx0bGV0IGN1cnJlbnRFbGVtZW50OiBUO1xyXG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcclxuXHRpZiAoIWFycikge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0Ly8gb3V0IG9mIGJvdW5kc1xyXG5cdGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0aWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xyXG5cdH1cclxuXHQvLyBlbGVtZW50IGluIHJhbmdlXHJcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XHJcblx0XHRjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xyXG5cdFx0Y3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuXHJcblx0XHRpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcblx0XHRcdG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcblx0XHRcdG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBXZWVrRGF5LCBUaW1lU3RydWN0LCBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XHJcbmltcG9ydCB7IFRpbWVTb3VyY2UsIFJlYWxUaW1lU291cmNlIH0gZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuaW1wb3J0ICogYXMgZm9ybWF0IGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5pbXBvcnQgKiBhcyBwYXJzZUZ1bmNzIGZyb20gXCIuL3BhcnNlXCI7XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3codGltZVpvbmU6IFRpbWVab25lID0gVGltZVpvbmUudXRjKCkpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIGZyb21ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcclxuXHRpZiAoZnJvbVpvbmUpIHtcclxuXHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gZnJvbVpvbmUub2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWUpO1xyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZS51bml4TWlsbGlzIC0gb2Zmc2V0ICogNjAwMDApO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gbG9jYWxUaW1lLmNsb25lKCk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0RnJvbVV0Yyh1dGNUaW1lOiBUaW1lU3RydWN0LCB0b1pvbmU/OiBUaW1lWm9uZSk6IFRpbWVTdHJ1Y3Qge1xyXG5cdGlmICh0b1pvbmUpIHtcclxuXHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcclxuXHRcdHJldHVybiB0b1pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IFRpbWVTdHJ1Y3QodXRjVGltZS51bml4TWlsbGlzICsgb2Zmc2V0ICogNjAwMDApKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWUge1xyXG5cclxuXHQvKipcclxuXHQgKiBVVEMgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcclxuXHQgKi9cclxuXHRwcml2YXRlIF91dGNEYXRlOiBUaW1lU3RydWN0O1xyXG5cdHByaXZhdGUgZ2V0IHV0Y0RhdGUoKTogVGltZVN0cnVjdCB7XHJcblx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZTtcclxuXHR9XHJcblx0cHJpdmF0ZSBzZXQgdXRjRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xyXG5cdFx0dGhpcy5fdXRjRGF0ZSA9IHZhbHVlO1xyXG5cdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2NhbCB0aW1lc3RhbXAgKGxhemlseSBjYWxjdWxhdGVkKVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVEYXRlOiBUaW1lU3RydWN0O1xyXG5cdHByaXZhdGUgZ2V0IHpvbmVEYXRlKCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0aWYgKCF0aGlzLl96b25lRGF0ZSkge1xyXG5cdFx0XHR0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlO1xyXG5cdH1cclxuXHRwcml2YXRlIHNldCB6b25lRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xyXG5cdFx0dGhpcy5fem9uZURhdGUgPSB2YWx1ZTtcclxuXHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBPcmlnaW5hbCB0aW1lIHpvbmUgdGhpcyBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmb3IuXHJcblx0ICogQ2FuIGJlIE5VTEwgZm9yIHVuYXdhcmUgdGltZXN0YW1wc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmU6IFRpbWVab25lO1xyXG5cclxuXHQvKipcclxuXHQgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXHJcblx0ICogZmFrZSB0aW1lIGluIHRlc3RzLiBEYXRlVGltZS5ub3dMb2NhbCgpIGFuZCBEYXRlVGltZS5ub3dVdGMoKVxyXG5cdCAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHRpbWVTb3VyY2U6IFRpbWVTb3VyY2UgPSBuZXcgUmVhbFRpbWVTb3VyY2UoKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93TG9jYWwoKTogRGF0ZVRpbWUge1xyXG5cdFx0Y29uc3QgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG4sIERhdGVGdW5jdGlvbnMuR2V0LCBUaW1lWm9uZS5sb2NhbCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dVdGMoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vdyh0aW1lWm9uZTogVGltZVpvbmUgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcclxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXHJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cclxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiBuID09PSBcIm51bWJlclwiLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRjb25zdCB1bml4VGltZXN0YW1wID0gTWF0aC5yb3VuZCgobiAtIDI1NTY5KSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuXHQgKiBFLmcuIDIwMTUtMDItMjkgcmV0dXJucyBmYWxzZSAobm90IGEgbGVhcCB5ZWFyKVxyXG5cdCAqIGFuZCAyMDE1LTAzLTI5VDAyOjMwOjAwIHJldHVybnMgZmFsc2UgKGRheWxpZ2h0IHNhdmluZyB0aW1lIG1pc3NpbmcgaG91cilcclxuXHQgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXHJcblx0ICogQnkgZGVmYXVsdCwgcHJlLTE5NzAgZGF0ZXMgYWxzbyByZXR1cm4gZmFsc2Ugc2luY2UgdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBkb2VzIG5vdCBjb250YWluIGFjY3VyYXRlIGluZm9cclxuXHQgKiBiZWZvcmUgdGhhdC4gWW91IGNhbiBjaGFuZ2UgdGhhdCB3aXRoIHRoZSBhbGxvd1ByZTE5NzAgZmxhZy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBhbGxvd1ByZTE5NzAgKG9wdGlvbmFsLCBkZWZhdWx0IGZhbHNlKTogcmV0dXJuIHRydWUgZm9yIHByZS0xOTcwIGRhdGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBleGlzdHMoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIgPSAxLCBkYXk6IG51bWJlciA9IDEsXHJcblx0XHRob3VyOiBudW1iZXIgPSAwLCBtaW51dGU6IG51bWJlciA9IDAsIHNlY29uZDogbnVtYmVyID0gMCwgbWlsbGlzZWNvbmQ6IG51bWJlciA9IDAsXHJcblx0XHR6b25lOiBUaW1lWm9uZSA9IG51bGwsIGFsbG93UHJlMTk3MDogYm9vbGVhbiA9IGZhbHNlXHJcblx0KTogYm9vbGVhbiB7XHJcblx0XHRpZiAoIWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSlcclxuXHRcdFx0fHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCFhbGxvd1ByZTE5NzAgJiYgeWVhciA8IDE5NzApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Y29uc3QgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcclxuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxyXG5cdFx0XHRcdCYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gQ3JlYXRlcyBjdXJyZW50IHRpbWUgaW4gbG9jYWwgdGltZXpvbmUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxyXG5cdCAqXHRcdCBpdCBtYXkgaW5jbHVkZSBhIHNwYWNlIGFuZCB0aGVuIGFuZCBJQU5BIHRpbWUgem9uZS5cclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCswMTowMFwiXHRcdFx0XHQoVVRDIG9mZnNldCB3aXRob3V0IGRheWxpZ2h0IHNhdmluZyB0aW1lKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFpcIlx0XHRcdFx0XHQoVVRDKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0aWYgZ2l2ZW4sIHRoZSBkYXRlIGluIHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGlzIHRpbWUgem9uZS5cclxuXHQgKlx0XHRcdFx0XHROb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcclxuXHQgKlx0XHRcdFx0XHRmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaXNvU3RyaW5nOiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgc3RyaW5nIGluIGdpdmVuIExETUwgZm9ybWF0LlxyXG5cdCAqIE5PVEU6IGRvZXMgbm90IGhhbmRsZSBlcmFzL3F1YXJ0ZXJzL3dlZWtzL3dlZWtkYXlzLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVTdHJpbmdcdERhdGUrVGltZSBzdHJpbmcuXHJcblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXHJcblx0ICpcdFx0XHRcdFx0Tm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXHJcblx0ICpcdFx0XHRcdFx0Zm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGVTdHJpbmc6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBZb3UgcHJvdmlkZSBhIGRhdGUsIHRoZW4geW91IHNheSB3aGV0aGVyIHRvIHRha2UgdGhlXHJcblx0ICogZGF0ZS5nZXRZZWFyKCkvZ2V0WHh4IG1ldGhvZHMgb3IgdGhlIGRhdGUuZ2V0VVRDWWVhcigpL2RhdGUuZ2V0VVRDWHh4IG1ldGhvZHMsXHJcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXHJcblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXHJcblx0ICogTm90ZSB0aGF0IHRoZSBEYXRlIGNsYXNzIGhhcyBidWdzIGFuZCBpbmNvbnNpc3RlbmNpZXMgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlbSB3aXRoIHRpbWVzIGFyb3VuZFxyXG5cdCAqIERTVCBjaGFuZ2VzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVcdEEgZGF0ZSBvYmplY3QuXHJcblx0ICogQHBhcmFtIGdldHRlcnNcdFNwZWNpZmllcyB3aGljaCBzZXQgb2YgRGF0ZSBnZXR0ZXJzIGNvbnRhaW5zIHRoZSBkYXRlIGluIHRoZSBnaXZlbiB0aW1lIHpvbmU6IHRoZVxyXG5cdCAqXHRcdFx0XHRcdERhdGUuZ2V0WHh4KCkgbWV0aG9kcyBvciB0aGUgRGF0ZS5nZXRVVENYeHgoKSBtZXRob2RzLlxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSB0aGF0IHRoZSBnaXZlbiBkYXRlIGlzIGFzc3VtZWQgdG8gYmUgaW4gKG1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGU6IERhdGUsIGdldEZ1bmNzOiBEYXRlRnVuY3Rpb25zLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBHZXQgYSBkYXRlIGZyb20gYSBUaW1lU3RydWN0XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IodG06IFRpbWVTdHJ1Y3QsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cclxuXHQgKiBVc2UgdGhlIGFkZChkdXJhdGlvbikgb3Igc3ViKGR1cmF0aW9uKSBmb3IgYXJpdGhtZXRpYy5cclxuXHQgKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhciAoZS5nLiAyMDE0KVxyXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXlcdFRoZSBkYXkgb2YgdGhlIG1vbnRoIFsxLTMxXVxyXG5cdCAqIEBwYXJhbSBob3VyXHRUaGUgaG91ciBvZiB0aGUgZGF5IFswLTI0KVxyXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXHJcblx0ICogQHBhcmFtIHNlY29uZFx0VGhlIHNlY29uZCBvZiB0aGUgbWludXRlIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZFx0VGhlIG1pbGxpc2Vjb25kIG9mIHRoZSBzZWNvbmQgWzAtOTk5XVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbCAoZm9yIHVuYXdhcmUgZGF0ZXMpXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpc2Vjb25kPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0gdW5peFRpbWVzdGFtcFx0bWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHR0aGUgdGltZSB6b25lIHRoYXQgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIGluICh1c3VhbGx5IFVUQykuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IodW5peFRpbWVzdGFtcDogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRhMT86IGFueSwgYTI/OiBhbnksIGEzPzogYW55LFxyXG5cdFx0aD86IG51bWJlciwgbT86IG51bWJlciwgcz86IG51bWJlciwgbXM/OiBudW1iZXIsXHJcblx0XHR0aW1lWm9uZT86IGFueSkge1xyXG5cdFx0c3dpdGNoICh0eXBlb2YgKGExKSkge1xyXG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcclxuXHRcdFx0XHRpZiAoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHQvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGV4cGVjdCB1bml4VGltZXN0YW1wIHRvIGJlIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBhMiBpbnN0YW5jZW9mIFRpbWVab25lID8gPFRpbWVab25lPmEyIDogbnVsbCk7XHJcblx0XHRcdFx0XHRsZXQgbm9ybWFsaXplZFVuaXhUaW1lc3RhbXA6IG51bWJlcjtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKDxudW1iZXI+YTEpKSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCB5ZWFyIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgbW9udGggdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDxudW1iZXI+YTE7XHJcblx0XHRcdFx0XHRsZXQgbW9udGg6IG51bWJlciA9IDxudW1iZXI+YTI7XHJcblx0XHRcdFx0XHRsZXQgZGF5OiBudW1iZXIgPSA8bnVtYmVyPmEzO1xyXG5cdFx0XHRcdFx0bGV0IGhvdXI6IG51bWJlciA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xyXG5cdFx0XHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XHJcblx0XHRcdFx0XHRsZXQgc2Vjb25kOiBudW1iZXIgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcclxuXHRcdFx0XHRcdGxldCBtaWxsaTogbnVtYmVyID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcclxuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuXHRcdFx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcclxuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRcdFx0bWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xyXG5cdFx0XHRcdFx0bWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcclxuXHRcdFx0XHRcdGNvbnN0IHRtID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdFx0XHRhc3NlcnQodG0udmFsaWRhdGUoKSwgYGludmFsaWQgZGF0ZTogJHt0bS50b1N0cmluZygpfWApO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgdGltZVpvbmUgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IHRpbWVab25lIDogbnVsbCk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0bSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRtO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0Ly8gZm9ybWF0IHN0cmluZyBnaXZlblxyXG5cdFx0XHRcdFx0Y29uc3QgZGF0ZVN0cmluZzogc3RyaW5nID0gPHN0cmluZz5hMTtcclxuXHRcdFx0XHRcdGNvbnN0IGZvcm1hdFN0cmluZzogc3RyaW5nID0gPHN0cmluZz5hMjtcclxuXHRcdFx0XHRcdGxldCB6b25lOiBUaW1lWm9uZSA9IG51bGw7XHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGEzIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdFx0em9uZSA9IDxUaW1lWm9uZT4oYTMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y29uc3QgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShkYXRlU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHpvbmUpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSBwYXJzZWQuem9uZSB8fCBudWxsO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zdCBnaXZlblN0cmluZyA9ICg8c3RyaW5nPmExKS50cmltKCk7XHJcblx0XHRcdFx0XHRjb25zdCBzczogc3RyaW5nW10gPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcclxuXHRcdFx0XHRcdGFzc2VydChzcy5sZW5ndGggPT09IDIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgPHN0cmluZz5hMSArIFwiXFxcIlwiKTtcclxuXHRcdFx0XHRcdGlmIChhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSA8VGltZVpvbmU+KGEyKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS56b25lKHNzWzFdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG5cdFx0XHRcdFx0Ly8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiB7XHJcblx0XHRcdFx0aWYgKGExIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMiA/IGEyIDogbnVsbCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChhMSBpbnN0YW5jZW9mIERhdGUpIHtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIixcclxuXHRcdFx0XHRcdFx0XCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KCFhMyB8fCBhMyBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRpbWVab25lIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcblx0XHRcdFx0XHRjb25zdCBkOiBEYXRlID0gPERhdGU+KGExKTtcclxuXHRcdFx0XHRcdGNvbnN0IGRrOiBEYXRlRnVuY3Rpb25zID0gPERhdGVGdW5jdGlvbnM+KGEyKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IG51bGwpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHtcclxuXHRcdFx0XHQvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IFRpbWVab25lLmxvY2FsKCk7XHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHVuZXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdHlwZS5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBhIGNvcHkgb2YgdGhpcyBvYmplY3RcclxuXHQgKi9cclxuXHRwdWJsaWMgY2xvbmUoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCB0aGlzLl96b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZSgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lQWJicmV2aWF0aW9uKGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xyXG5cdFx0aWYgKHRoaXMuem9uZSgpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnpvbmUoKS5hYmJyZXZpYXRpb25Gb3JVdGModGhpcy51dGNEYXRlLCBkc3REZXBlbmRlbnQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcblx0ICovXHJcblx0cHVibGljIHVuaXhVdGNNaWxsaXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnllYXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcblx0ICogd2VlayBkYXkgbnVtYmVycylcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcclxuXHRcdHJldHVybiA8V2Vla0RheT5iYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjU2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy51dGNIb3VyKCksIHRoaXMudXRjTWludXRlKCksIHRoaXMudXRjU2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcclxuXHQgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG5cdCAqIE5vIGNvbnZlcnNpb24gaXMgZG9uZSwgdGhlIHZhbHVlIGlzIGp1c3QgYXNzdW1lZCB0byBiZSBpbiBhIGRpZmZlcmVudCB6b25lLlxyXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lIFRoZSBuZXcgdGltZSB6b25lXHJcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgd2l0aFpvbmUoem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcclxuXHRcdFx0em9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRoaXMgZGF0ZSB0byB0aGUgZ2l2ZW4gdGltZSB6b25lIChpbi1wbGFjZSkuXHJcblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxyXG5cdCAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0aWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7IC8vIHN0aWxsIGFzc2lnbiwgYmVjYXVzZSB6b25lcyBtYXkgYmUgZXF1YWwgYnV0IG5vdCBpZGVudGljYWwgKFVUQy9HTVQvKzAwKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICghdGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlLCB0aGlzLl96b25lKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLl96b25lID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuXHQgKiBVbmF3YXJlIGRhdGVzIGNhbiBvbmx5IGJlIGNvbnZlcnRlZCB0byB1bmF3YXJlIGRhdGVzIChjbG9uZSlcclxuXHQgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3JcclxuXHQgKiBpZiB5b3UgcmVhbGx5IG5lZWQgdG8gZG8gdGhhdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxyXG5cdCAqIEByZXR1cm4gVGhlIGNvbnZlcnRlZCBkYXRlXHJcblx0ICovXHJcblx0cHVibGljIHRvWm9uZSh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG5cdFx0XHRyZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuXHRcdFx0cmVzdWx0Ll96b25lID0gem9uZTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgbnVsbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRvIEphdmFTY3JpcHQgZGF0ZSB3aXRoIHRoZSB6b25lIHRpbWUgaW4gdGhlIGdldFgoKSBtZXRob2RzLlxyXG5cdCAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXHJcblx0ICogVGhpcyBpcyBiZWNhdXNlIERhdGUgY2FsY3VsYXRlcyBnZXRVVENYKCkgZnJvbSBnZXRYKCkgYXBwbHlpbmcgbG9jYWwgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0RhdGUoKTogRGF0ZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHpvbmUuXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXHJcblx0ICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIHRvRXhjZWwodGltZVpvbmU/OiBUaW1lWm9uZSk6IG51bWJlciB7XHJcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcclxuXHRcdGlmICh0aW1lWm9uZSAmJiAhdGltZVpvbmUuZXF1YWxzKHRoaXMuem9uZSgpKSkge1xyXG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuXHRcdH1cclxuXHRcdGNvbnN0IG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcclxuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1V0Y0V4Y2VsKCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF91bml4VGltZVN0YW1wVG9FeGNlbChuOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcclxuXHRcdC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcclxuXHRcdGNvbnN0IG1zZWNzID0gcmVzdWx0IC8gKDEgLyA4NjQwMDAwMCk7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSB0aW1lIGR1cmF0aW9uIHJlbGF0aXZlIHRvIFVUQy4gUmV0dXJucyBhIG5ldyBEYXRlVGltZVxyXG5cdCAqIEByZXR1cm4gdGhpcyArIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGFkZChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgcmVsYXRpdmUgdG8gVVRDLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKlxyXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgdXRjSG91cigpIGZpZWxkLCBhZGRpbmcgMSBtb250aFxyXG5cdCAqIGluY3JlbWVudHMgdGhlIHV0Y01vbnRoKCkgZmllbGQuXHJcblx0ICogQWRkaW5nIGFuIGFtb3VudCBvZiB1bml0cyBsZWF2ZXMgbG93ZXIgdW5pdHMgaW50YWN0LiBFLmcuXHJcblx0ICogYWRkaW5nIGEgbW9udGggd2lsbCBsZWF2ZSB0aGUgZGF5KCkgZmllbGQgdW50b3VjaGVkIGlmIHBvc3NpYmxlLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICpcclxuXHQgKiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdXRjIHRpbWUgZmllbGRzIGFyZSBzdGlsbCB1bnRvdWNoZWQgYnV0IGxvY2FsXHJcblx0ICogdGltZSBmaWVsZHMgbWF5IHNoaWZ0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogSW1wbGVtZW50YXRpb24uXHJcblx0ICovXHJcblx0cHVibGljIGFkZChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRsZXQgYW1vdW50OiBudW1iZXI7XHJcblx0XHRsZXQgdTogVGltZVVuaXQ7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhbW91bnQgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHUgPSB1bml0O1xyXG5cdFx0fVxyXG5cdFx0Y29uc3QgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1dGNUbSwgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgem9uZSB0aW1lLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKlxyXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgaG91cigpIGZpZWxkIG9mIHRoZSB6b25lXHJcblx0ICogZGF0ZSBieSBvbmUuIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB0aW1lIGZpZWxkcyBtYXkgYWRkaXRpb25hbGx5XHJcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcclxuXHQgKiBiZSByZWFjaGVkIG90aGVyd2lzZS5cclxuXHQgKlxyXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcclxuXHQgKiB3b3VsZCBiZSBhIG5vbi1leGlzdGluZyB0aW1lLiBUaGVuIGFuIGV4dHJhIERTVCBvZmZzZXQgaXMgYWRkZWQuXHJcblx0ICpcclxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XHJcblx0ICogRGF0ZSNzZXRVVENNb250aCgpIGl0IHdpbGwgbm90IG92ZXJmbG93IGludG8gdGhlIG5leHQgbW9udGhcclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIGFkZExvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRsZXQgYW1vdW50OiBudW1iZXI7XHJcblx0XHRsZXQgdTogVGltZVVuaXQ7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhbW91bnQgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHUgPSB1bml0O1xyXG5cdFx0fVxyXG5cdFx0Y29uc3QgbG9jYWxUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnpvbmVEYXRlLCBhbW91bnQsIHUpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0Y29uc3QgZGlyZWN0aW9uOiBOb3JtYWxpemVPcHRpb24gPSAoYW1vdW50ID49IDAgPyBOb3JtYWxpemVPcHRpb24uVXAgOiBOb3JtYWxpemVPcHRpb24uRG93bik7XHJcblx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0sIGRpcmVjdGlvbik7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG5cdCAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIG5lY2Vzc2FyeS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9hZGRUb1RpbWVTdHJ1Y3QodG06IFRpbWVTdHJ1Y3QsIGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0bGV0IHllYXI6IG51bWJlcjtcclxuXHRcdGxldCBtb250aDogbnVtYmVyO1xyXG5cdFx0bGV0IGRheTogbnVtYmVyO1xyXG5cdFx0bGV0IGhvdXI6IG51bWJlcjtcclxuXHRcdGxldCBtaW51dGU6IG51bWJlcjtcclxuXHRcdGxldCBzZWNvbmQ6IG51bWJlcjtcclxuXHRcdGxldCBtaWxsaTogbnVtYmVyO1xyXG5cclxuXHRcdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDEwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNjAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDM2MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogODY0MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcblx0XHRcdFx0Ly8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXHJcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5jb21wb25lbnRzLm1vbnRoKSkgLyAxMik7XHJcblx0XHRcdFx0XHRtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG5cdFx0XHRcdGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XHJcblx0XHRcdFx0c2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcblx0XHRcdFx0bWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG5cdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBhbW91bnQ7XHJcblx0XHRcdFx0bW9udGggPSB0bS5jb21wb25lbnRzLm1vbnRoO1xyXG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG5cdFx0XHRcdG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWIoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiICYmIGExIGluc3RhbmNlb2YgRHVyYXRpb24pIHtcclxuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRjb25zdCBhbW91bnQ6IG51bWJlciA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWJMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKDxEdXJhdGlvbj5hMSkubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogPG51bWJlcj5hMSwgdW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZGlmZihvdGhlcjogRGF0ZVRpbWUpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG5cdCogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCovXHJcblx0cHVibGljIHN0YXJ0T2ZEYXkoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXJ0T2ZZZWFyKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPCBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPD0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxyXG5cdFx0XHQmJiAodGhpcy5fem9uZSA9PT0gbnVsbCkgPT09IChvdGhlci5fem9uZSA9PT0gbnVsbClcclxuXHRcdFx0JiYgKHRoaXMuX3pvbmUgPT09IG51bGwgfHwgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKVxyXG5cdFx0XHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1heChvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XHJcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgczogc3RyaW5nID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuXHQgKiBzcGVjaWZpZWQgZm9ybWF0LiBUaGUgZm9ybWF0IGlzIGltcGxlbWVudGVkIGFzIHRoZSBMRE1MIHN0YW5kYXJkXHJcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXHJcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXHJcblx0ICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nLCBmb3JtYXRPcHRpb25zPzogZm9ybWF0LkZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy56b25lRGF0ZSwgdGhpcy51dGNEYXRlLCB0aGlzLnpvbmUoKSwgZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxyXG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2VcclxuXHQgKiBAcGFyYW0gZm9ybWF0IHRoZSBmb3JtYXQgdGhlIHN0cmluZyBpcyBpblxyXG5cdCAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHBhcnNlKHM6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRjb25zdCBzOiBzdHJpbmcgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IFRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfc3BsaXREYXRlRnJvbVRpbWVab25lKHM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcclxuXHRcdGxldCBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCArIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgsIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuXHRcdGlmIChpbmRleCA8IDgpIHtcclxuXHRcdFx0aW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXHJcblx0XHR9XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIGR1cmF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgZHVyYXRpb24gd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYW4gYW1vdW50IGFuZCBhIHVuaXQgZS5nLlxyXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxyXG4gKlxyXG4gKiBJdCBoYXMgdHdvIHNldHMgb2YgZ2V0dGVyIGZ1bmN0aW9uczpcclxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxyXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxyXG4gKiAtIHNlY29uZHMoKSwgbWludXRlcygpLCBob3VycygpIGV0YywgcGx1cmFsIGZvcm06IHRoZXNlIHJldHVybiB0aGUgdG90YWwgYW1vdW50IHJlcHJlc2VudGVkIGluIHRoZSBjb3JyZXNwb25kaW5nIHVuaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiBHaXZlbiBhbW91bnQgaW4gY29uc3RydWN0b3JcclxuXHQgKi9cclxuXHRwcml2YXRlIF9hbW91bnQ6IG51bWJlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVW5pdFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3VuaXQ6IFRpbWVVbml0O1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuWWVhcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuSG91cik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWludXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gb2YgMFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gZnJvbSBhIHN0cmluZyBpbiBvbmUgb2YgdHdvIGZvcm1hdHM6XHJcblx0ICogMSkgWy1daGhoaFs6bW1bOnNzWy5ubm5dXV0gZS5nLiAnLTAxOjAwOjMwLjUwMSdcclxuXHQgKiAyKSBhbW91bnQgYW5kIHVuaXQgZS5nLiAnLTEgZGF5cycgb3IgJzEgeWVhcicuIFRoZSB1bml0IG1heSBiZSBpbiBzaW5ndWxhciBvciBwbHVyYWwgZm9ybSBhbmQgaXMgY2FzZS1pbnNlbnNpdGl2ZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSBkdXJhdGlvbiBmcm9tIGFuIGFtb3VudCBhbmQgYSB0aW1lIHVuaXQuXHJcblx0ICogQHBhcmFtIGFtb3VudFx0TnVtYmVyIG9mIHVuaXRzXHJcblx0ICogQHBhcmFtIHVuaXRcdEEgdGltZSB1bml0IGkuZS4gVGltZVVuaXQuU2Vjb25kLCBUaW1lVW5pdC5Ib3VyIGV0Yy4gRGVmYXVsdCBNaWxsaXNlY29uZC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihhbW91bnQ6IG51bWJlciwgdW5pdD86IFRpbWVVbml0KTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihpMT86IGFueSwgdW5pdD86IFRpbWVVbml0KSB7XHJcblx0XHRpZiAodHlwZW9mIChpMSkgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0Ly8gYW1vdW50K3VuaXQgY29uc3RydWN0b3JcclxuXHRcdFx0Y29uc3QgYW1vdW50ID0gPG51bWJlcj5pMTtcclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG5cdFx0XHR0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0Ly8gc3RyaW5nIGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Zyb21TdHJpbmcoPHN0cmluZz5pMSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IDA7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0Y29uc3QgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuXHRcdFx0Y29uc3QgcmVxTW9udGhzID0gKHVuaXQgPT09IFRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcblx0XHRcdGNvbnN0IHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcblx0ICogdGhlIHNhbWUgdW5pdC5cclxuXHQgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcblx0ICovXHJcblx0cHVibGljIGNvbnZlcnQodW5pdDogVGltZVVuaXQpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuU2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGVzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbnV0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG5cdCAqIGR1cmluZyBEU1QgY2hhbmdlcykuXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXHJcblx0ICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG5cdCAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlSG91cnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXHJcblx0ICovXHJcblx0cHVibGljIGRheXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5EYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGhzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Nb250aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcblx0ICovXHJcblx0cHVibGljIHllYXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5ZZWFyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcblx0ICovXHJcblx0cHVibGljIHdob2xlWWVhcnMoKTogbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cclxuXHRcdFx0XHRiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhUaW1lVW5pdC5ZZWFyKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhbW91bnQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5pdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpZ25cclxuXHQgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzaWduKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xyXG5cdCAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFsc0V4YWN0KG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPj0gVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IFRpbWVVbml0Lk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPD0gVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IFRpbWVVbml0LkRheSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSB1bml0IGFuZCBzYW1lIGFtb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBvdGhlci5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBvdGhlci51bml0KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIChtb3N0IG5lZ2F0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW4ob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IHdpdGggYSBmaXhlZCBudW1iZXIuXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKiB2YWx1ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgbXVsdGlwbHkodmFsdWU6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGl2aWRlIGJ5IGEgdW5pdGxlc3MgbnVtYmVyLiBUaGUgcmVzdWx0IGlzIGEgRHVyYXRpb24sIGUuZy4gMSB5ZWFyIC8gMiA9IDAuNSB5ZWFyXHJcblx0ICogVGhlIHJlc3VsdCBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGFzIGEgdW5pdCB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgKGUuZy4gMSBtb250aCBoYXMgdmFyaWFibGUgbGVuZ3RoKVxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbjtcclxuXHQvKipcclxuXHQgKiBEaXZpZGUgdGhpcyBEdXJhdGlvbiBieSBhIER1cmF0aW9uLiBUaGUgcmVzdWx0IGlzIGEgdW5pdGxlc3MgbnVtYmVyIGUuZy4gMSB5ZWFyIC8gMSBtb250aCA9IDEyXHJcblx0ICogVGhlIHJlc3VsdCBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGFzIGEgdW5pdCB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgKGUuZy4gMSBtb250aCBoYXMgdmFyaWFibGUgbGVuZ3RoKVxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBEdXJhdGlvbik6IG51bWJlcjtcclxuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBudW1iZXIgfCBEdXJhdGlvbik6IER1cmF0aW9uIHwgbnVtYmVyIHtcclxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHZhbHVlLl9hbW91bnQgPT09IDApIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbi5kaXZpZGUoKTogRGl2aWRlIGJ5IHplcm8gZHVyYXRpb25cIik7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgLyB2YWx1ZS5taWxsaXNlY29uZHMoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIGR1cmF0aW9uLlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGFkZCh2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXHJcblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAtIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKHZhbHVlOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZHVyYXRpb24gaS5lLiByZW1vdmUgdGhlIHNpZ24uXHJcblx0ICovXHJcblx0cHVibGljIGFicygpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAodGhpcy5fYW1vdW50ID49IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLm11bHRpcGx5KC0xKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmVcclxuXHQgKiBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXHJcblx0ICovXHJcblx0cHVibGljIHRvRnVsbFN0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMudG9IbXNTdHJpbmcodHJ1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbVs6c3NbLm5ubl1dIG5vdGF0aW9uLlxyXG5cdCAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xyXG5cdCAqICAgICAgICAgICAgIGFyZSBjaG9wcGVkIG9mZiBpZiB6ZXJvXHJcblx0ICovXHJcblx0cHVibGljIHRvSG1zU3RyaW5nKGZ1bGw6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XHJcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cdFx0aWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xyXG5cdFx0XHRyZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0XHR9XHJcblx0XHRpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLnNlY29uZCgpID4gMCkge1xyXG5cdFx0XHRyZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5taW51dGUoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXHJcblx0ICovXHJcblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArICh0aGlzLl9hbW91bnQgLyAxMDAwKS50b0ZpeGVkKDMpICsgXCJTXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiSFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuV2Vlazoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiIFwiICsgYmFzaWNzLnRpbWVVbml0VG9TdHJpbmcodGhpcy5fdW5pdCwgdGhpcy5fYW1vdW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0R1cmF0aW9uOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcGFydCh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICh1bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoVGltZVVuaXQuWWVhcikpKTtcclxuXHRcdH1cclxuXHRcdGxldCBuZXh0VW5pdDogVGltZVVuaXQ7XHJcblx0XHQvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcclxuXHRcdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0LlNlY29uZDsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiBuZXh0VW5pdCA9IFRpbWVVbml0LkhvdXI7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IG5leHRVbml0ID0gVGltZVVuaXQuRGF5OyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IG5leHRVbml0ID0gVGltZVVuaXQuTW9udGg7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiBuZXh0VW5pdCA9IFRpbWVVbml0LlllYXI7IGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcclxuXHR9XHJcblxyXG5cclxuXHRwcml2YXRlIF9mcm9tU3RyaW5nKHM6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG5cdFx0aWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XHJcblx0XHRcdGxldCBzaWduOiBudW1iZXIgPSAxO1xyXG5cdFx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGVzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRsZXQgc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IG1pbGxpc2Vjb25kczogbnVtYmVyID0gMDtcclxuXHRcdFx0Y29uc3QgcGFydHM6IHN0cmluZ1tdID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcblx0XHRcdGFzc2VydChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcblx0XHRcdFx0c2lnbiA9IC0xO1xyXG5cdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0aG91cnMgPSArcGFydHNbMF07XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRtaW51dGVzID0gK3BhcnRzWzFdO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcblx0XHRcdFx0Y29uc3Qgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcblx0XHRcdFx0c2Vjb25kcyA9ICtzZWNvbmRQYXJ0c1swXTtcclxuXHRcdFx0XHRpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRcdFx0bWlsbGlzZWNvbmRzID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc3QgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyArIDEwMDAgKiBzZWNvbmRzICsgNjAwMDAgKiBtaW51dGVzICsgMzYwMDAwMCAqIGhvdXJzKTtcclxuXHRcdFx0Ly8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG5cdFx0XHRpZiAobWlsbGlzZWNvbmRzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHNlY29uZHMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKG1pbnV0ZXMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGhvdXJzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuXHRcdFx0YXNzZXJ0KCFpc05hTihhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgY2Fubm90IHBhcnNlIGFtb3VudFwiKTtcclxuXHRcdFx0YXNzZXJ0KGlzRmluaXRlKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBhbW91bnQgaXMgaW5maW5pdGVcIik7XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuXHRcdFx0dGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBUb2tlbml6ZXIsIFRva2VuLCBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUgfSBmcm9tIFwiLi90b2tlblwiO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcclxuaW1wb3J0IHsgVGltZVpvbmUgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0T3B0aW9ucyB7XHJcblx0LyoqXHJcblx0ICogVGhlIGxldHRlciBpbmRpY2F0aW5nIGEgcXVhcnRlciBlLmcuIFwiUVwiIChiZWNvbWVzIFExLCBRMiwgUTMsIFE0KVxyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJMZXR0ZXI/OiBzdHJpbmc7XHJcblx0LyoqXHJcblx0ICogVGhlIHdvcmQgZm9yICdxdWFydGVyJ1xyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJXb3JkPzogc3RyaW5nO1xyXG5cdC8qKlxyXG5cdCAqIFF1YXJ0ZXIgYWJicmV2aWF0aW9ucyBlLmcuIDFzdCwgMm5kLCAzcmQsIDR0aFxyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJBYmJyZXZpYXRpb25zPzogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIG5hbWVzXHJcblx0ICovXHJcblx0bG9uZ01vbnRoTmFtZXM/OiBzdHJpbmdbXTtcclxuXHQvKipcclxuXHQgKiBUaHJlZS1sZXR0ZXIgbW9udGggbmFtZXNcclxuXHQgKi9cclxuXHRzaG9ydE1vbnRoTmFtZXM/OiBzdHJpbmdbXTtcclxuXHQvKipcclxuXHQgKiBNb250aCBsZXR0ZXJzXHJcblx0ICovXHJcblx0bW9udGhMZXR0ZXJzPzogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxyXG5cdCAqL1xyXG5cdGxvbmdXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcclxuXHRzaG9ydFdlZWtkYXlOYW1lcz86IHN0cmluZ1tdO1xyXG5cdHdlZWtkYXlUd29MZXR0ZXJzPzogc3RyaW5nW107XHJcblx0d2Vla2RheUxldHRlcnM/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IExPTkdfTU9OVEhfTkFNRVMgPVxyXG5cdFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNIT1JUX01PTlRIX05BTUVTID1cclxuXHRbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcblxyXG5leHBvcnQgY29uc3QgTU9OVEhfTEVUVEVSUyA9XHJcblx0W1wiSlwiLCBcIkZcIiwgXCJNXCIsIFwiQVwiLCBcIk1cIiwgXCJKXCIsIFwiSlwiLCBcIkFcIiwgXCJTXCIsIFwiT1wiLCBcIk5cIiwgXCJEXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IExPTkdfV0VFS0RBWV9OQU1FUyA9XHJcblx0W1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XHJcblxyXG5leHBvcnQgY29uc3QgU0hPUlRfV0VFS0RBWV9OQU1FUyA9XHJcblx0W1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFdFRUtEQVlfVFdPX0xFVFRFUlMgPVxyXG5cdFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFdFRUtEQVlfTEVUVEVSUyA9XHJcblx0W1wiU1wiLCBcIk1cIiwgXCJUXCIsIFwiV1wiLCBcIlRcIiwgXCJGXCIsIFwiU1wiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX0xFVFRFUiA9IFwiUVwiO1xyXG5leHBvcnQgY29uc3QgUVVBUlRFUl9XT1JEID0gXCJxdWFydGVyXCI7XHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX0FCQlJFVklBVElPTlMgPSBbXCIxc3RcIiwgXCIybmRcIiwgXCIzcmRcIiwgXCI0dGhcIl07XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9GT1JNQVRfT1BUSU9OUzogRm9ybWF0T3B0aW9ucyA9IHtcclxuXHRxdWFydGVyTGV0dGVyOiBRVUFSVEVSX0xFVFRFUixcclxuXHRxdWFydGVyV29yZDogUVVBUlRFUl9XT1JELFxyXG5cdHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBRVUFSVEVSX0FCQlJFVklBVElPTlMsXHJcblx0bG9uZ01vbnRoTmFtZXM6IExPTkdfTU9OVEhfTkFNRVMsXHJcblx0c2hvcnRNb250aE5hbWVzOiBTSE9SVF9NT05USF9OQU1FUyxcclxuXHRtb250aExldHRlcnM6IE1PTlRIX0xFVFRFUlMsXHJcblx0bG9uZ1dlZWtkYXlOYW1lczogTE9OR19XRUVLREFZX05BTUVTLFxyXG5cdHNob3J0V2Vla2RheU5hbWVzOiBTSE9SVF9XRUVLREFZX05BTUVTLFxyXG5cdHdlZWtkYXlUd29MZXR0ZXJzOiBXRUVLREFZX1RXT19MRVRURVJTLFxyXG5cdHdlZWtkYXlMZXR0ZXJzOiBXRUVLREFZX0xFVFRFUlNcclxufTtcclxuXHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gbG9jYWxab25lIFRoZSB6b25lIHRoYXQgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxyXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBPdGhlciBmb3JtYXQgb3B0aW9ucyBzdWNoIGFzIG1vbnRoIG5hbWVzXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KFxyXG5cdGRhdGVUaW1lOiBUaW1lU3RydWN0LFxyXG5cdHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsXHJcblx0bG9jYWxab25lOiBUaW1lWm9uZSxcclxuXHRmb3JtYXRTdHJpbmc6IHN0cmluZyxcclxuXHRmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zID0ge31cclxuKTogc3RyaW5nIHtcclxuXHQvLyBtZXJnZSBmb3JtYXQgb3B0aW9ucyB3aXRoIGRlZmF1bHQgZm9ybWF0IG9wdGlvbnNcclxuXHQvLyB0eXBlY2FzdCB0byBwcmV2ZW50IGVycm9yIFRTNzAxNzogSW5kZXggc2lnbmF0dXJlIG9mIG9iamVjdCB0eXBlIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXHJcblx0Y29uc3QgZ2l2ZW5Gb3JtYXRPcHRpb25zOiBhbnkgPSBmb3JtYXRPcHRpb25zO1xyXG5cdGNvbnN0IGRlZmF1bHRGb3JtYXRPcHRpb25zOiBhbnkgPSBERUZBVUxUX0ZPUk1BVF9PUFRJT05TO1xyXG5cdGNvbnN0IG1lcmdlZEZvcm1hdE9wdGlvbnM6IGFueSA9IHt9O1xyXG5cdGZvciAoY29uc3QgbmFtZSBpbiBERUZBVUxUX0ZPUk1BVF9PUFRJT05TKSB7XHJcblx0XHRpZiAoREVGQVVMVF9GT1JNQVRfT1BUSU9OUy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG5cdFx0XHRjb25zdCBnaXZlbkZvcm1hdE9wdGlvbjogYW55ID0gZ2l2ZW5Gb3JtYXRPcHRpb25zW25hbWVdO1xyXG5cdFx0XHRjb25zdCBkZWZhdWx0Rm9ybWF0T3B0aW9uOiBhbnkgPSBkZWZhdWx0Rm9ybWF0T3B0aW9uc1tuYW1lXTtcclxuXHRcdFx0bWVyZ2VkRm9ybWF0T3B0aW9uc1tuYW1lXSA9IGdpdmVuRm9ybWF0T3B0aW9uIHx8IGRlZmF1bHRGb3JtYXRPcHRpb247XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvcm1hdE9wdGlvbnMgPSBtZXJnZWRGb3JtYXRPcHRpb25zO1xyXG5cclxuXHRjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XHJcblx0Y29uc3QgdG9rZW5zOiBUb2tlbltdID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0Y29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XHJcblx0XHRsZXQgdG9rZW5SZXN1bHQ6IHN0cmluZztcclxuXHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5FUkE6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5IT1VSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTUlOVVRFOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IHRva2VuLnJhdztcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdHJlc3VsdCArPSB0b2tlblJlc3VsdDtcclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQudHJpbSgpO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0Y29uc3QgQUQ6IGJvb2xlYW4gPSBkYXRlVGltZS55ZWFyID4gMDtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBRFwiIDogXCJCQ1wiKTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQW5ubyBEb21pbmlcIiA6IFwiQmVmb3JlIENocmlzdFwiKTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQVwiIDogXCJCXCIpO1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHllYXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcInlcIjpcclxuXHRcdGNhc2UgXCJZXCI6XHJcblx0XHRjYXNlIFwiclwiOlxyXG5cdFx0XHRsZXQgeWVhclZhbHVlID0gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPT09IDIpIHsgLy8gU3BlY2lhbCBjYXNlOiBleGFjdGx5IHR3byBjaGFyYWN0ZXJzIGFyZSBleHBlY3RlZFxyXG5cdFx0XHRcdHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHllYXJWYWx1ZTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRjb25zdCBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgZm9ybWF0T3B0aW9ucy5xdWFydGVyV29yZDtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1vbnRoLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubW9udGhMZXR0ZXJzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgd2VlayBudW1iZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2VlayhkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRpZiAodG9rZW4uc3ltYm9sID09PSBcIndcIikge1xyXG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIG1vbnRoIChvciB5ZWFyKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXkoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJkXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuZGF5LnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0Y2FzZSBcIkRcIjpcclxuXHRcdFx0Y29uc3QgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF5T2ZZZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0Y29uc3Qgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcclxuXHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuXHRcdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdFx0fSAvLyBObyBicmVhaywgdGhpcyBpcyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaCFcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLndlZWtkYXlMZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0Y2FzZSA2OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBEYXkgUGVyaW9kIChBTSBvciBQTSlcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHJldHVybiAoZGF0ZVRpbWUuaG91ciA8IDEyID8gXCJBTVwiIDogXCJQTVwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgSG91clxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRIb3VyKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGxldCBob3VyID0gZGF0ZVRpbWUuaG91cjtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcImhcIjpcclxuXHRcdFx0aG91ciA9IGhvdXIgJSAxMjtcclxuXHRcdFx0aWYgKGhvdXIgPT09IDApIHtcclxuXHRcdFx0XHRob3VyID0gMTI7XHJcblx0XHRcdH07XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJIXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJLXCI6XHJcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJrXCI6XHJcblx0XHRcdGlmIChob3VyID09PSAwKSB7XHJcblx0XHRcdFx0aG91ciA9IDI0O1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtaW51dGVcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwic1wiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJTXCI6XHJcblx0XHRcdGNvbnN0IGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XHJcblx0XHRcdGxldCBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkTGVmdChmcmFjdGlvbi50b1N0cmluZygpLCAzLCBcIjBcIik7XHJcblx0XHRcdGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xyXG5cdFx0Y2FzZSBcIkFcIjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcclxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZTogVGltZVN0cnVjdCwgdXRjVGltZTogVGltZVN0cnVjdCwgem9uZTogVGltZVpvbmUsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0aWYgKCF6b25lKSB7XHJcblx0XHRyZXR1cm4gXCJcIjtcclxuXHR9XHJcblx0Y29uc3Qgb2Zmc2V0ID0gTWF0aC5yb3VuZCgoY3VycmVudFRpbWUudW5peE1pbGxpcyAtIHV0Y1RpbWUudW5peE1pbGxpcykgLyA2MDAwMCk7XHJcblxyXG5cdGNvbnN0IG9mZnNldEhvdXJzOiBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcblx0bGV0IG9mZnNldEhvdXJzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldEhvdXJzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuXHRvZmZzZXRIb3Vyc1N0cmluZyA9IChvZmZzZXQgPj0gMCA/IFwiK1wiICsgb2Zmc2V0SG91cnNTdHJpbmcgOiBcIi1cIiArIG9mZnNldEhvdXJzU3RyaW5nKTtcclxuXHRjb25zdCBvZmZzZXRNaW51dGVzID0gTWF0aC5hYnMob2Zmc2V0ICUgNjApO1xyXG5cdGNvbnN0IG9mZnNldE1pbnV0ZXNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0TWludXRlcy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0bGV0IHJlc3VsdDogc3RyaW5nO1xyXG5cclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcIk9cIjpcclxuXHRcdFx0cmVzdWx0ID0gXCJVVENcIjtcclxuXHRcdFx0aWYgKG9mZnNldCA+PSAwKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiK1wiO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIi1cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXN1bHQgKz0gb2Zmc2V0SG91cnMudG9TdHJpbmcoKTtcclxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA+PSA0IHx8IG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRjYXNlIFwiWlwiOlxyXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0XHRjb25zdCBuZXdUb2tlbjogVG9rZW4gPSB7XHJcblx0XHRcdFx0XHRcdGxlbmd0aDogNCxcclxuXHRcdFx0XHRcdFx0cmF3OiBcIk9PT09cIixcclxuXHRcdFx0XHRcdFx0c3ltYm9sOiBcIk9cIixcclxuXHRcdFx0XHRcdFx0dHlwZTogVG9rZW5UeXBlLlpPTkVcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRyZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcclxuXHRcdFx0XHRjYXNlIDU6XHJcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInpcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgdHJ1ZSk7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwidlwiOlxyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCBmYWxzZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcIlZcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0XHQvLyBOb3QgaW1wbGVtZW50ZWRcclxuXHRcdFx0XHRcdHJldHVybiBcInVua1wiO1xyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLm5hbWUoKTtcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0cmV0dXJuIFwiVW5rbm93blwiO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJYXCI6XHJcblx0XHRcdGlmIChvZmZzZXQgPT09IDApIHtcclxuXHRcdFx0XHRyZXR1cm4gXCJaXCI7XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJ4XCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcblx0XHRcdFx0XHRpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IGFueSwgZDI6IGFueSk6IGFueSB7XHJcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0YXNzZXJ0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRhc3NlcnQoKGQxIGluc3RhbmNlb2YgRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBEYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBEdXJhdGlvbiksXHJcblx0XHRcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcblx0cmV0dXJuIGQxLm1pbihkMik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IERhdGVUaW1lLCBkMjogRGF0ZVRpbWUpOiBEYXRlVGltZTtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIER1cmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogRHVyYXRpb24sIGQyOiBEdXJhdGlvbik6IER1cmF0aW9uO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogYW55LCBkMjogYW55KTogYW55IHtcclxuXHRhc3NlcnQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHRhc3NlcnQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGFzc2VydCgoZDEgaW5zdGFuY2VvZiBEYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIERhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBEdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIER1cmF0aW9uKSxcclxuXHRcdFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuXHRyZXR1cm4gZDEubWF4KGQyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhYnMoZDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0YXNzZXJ0KGQsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuXHRhc3NlcnQoZCBpbnN0YW5jZW9mIER1cmF0aW9uLCBcImZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhIER1cmF0aW9uXCIpO1xyXG5cdHJldHVybiBkLmFicygpO1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVGdW5jdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0LFxyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0VVRDXHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNJbnQobjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0aWYgKHR5cGVvZiAobikgIT09IFwibnVtYmVyXCIpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0aWYgKGlzTmFOKG4pKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiAoTWF0aC5mbG9vcihuKSA9PT0gbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRTeW0objogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRpZiAobiA8IDApIHtcclxuXHRcdHJldHVybiAtMSAqIE1hdGgucm91bmQoLTEgKiBuKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobik7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXHJcbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdGlmICgvXihcXC18XFwrKT8oWzAtOV0rKFxcLlswLTldKyk/fEluZmluaXR5KSQvLnRlc3QodmFsdWUpKSB7XHJcblx0XHRyZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuXHR9XHJcblx0cmV0dXJuIE5hTjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aXZlTW9kdWxvKHZhbHVlOiBudW1iZXIsIG1vZHVsbzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRhc3NlcnQobW9kdWxvID49IDEsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xyXG5cdGlmICh2YWx1ZSA8IDApIHtcclxuXHRcdHJldHVybiAoKHZhbHVlICUgbW9kdWxvKSArIG1vZHVsbykgJSBtb2R1bG87XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB2YWx1ZSAlIG1vZHVsbztcclxuXHR9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgVG9rZW5pemVyLCBUb2tlbiwgRGF0ZVRpbWVUb2tlblR5cGUgYXMgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcbmltcG9ydCB7IFRpbWVab25lIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lU3RydWN0IHBsdXMgem9uZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBBd2FyZVRpbWVTdHJ1Y3Qge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHN0cnVjdFxyXG5cdCAqL1xyXG5cdHRpbWU6IFRpbWVTdHJ1Y3Q7XHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHpvbmU/OiBUaW1lWm9uZTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlTnVtYmVyUmVzdWx0IHtcclxuXHRuOiBudW1iZXI7XHJcblx0cmVtYWluaW5nOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdHpvbmU6IFRpbWVab25lO1xyXG5cdHJlbWFpbmluZzogc3RyaW5nO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIGRhdGV0aW1lIHN0cmluZyBpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGZvcm1hdFxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXHJcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZWFibGUoZGF0ZVRpbWVTdHJpbmc6IHN0cmluZywgZm9ybWF0U3RyaW5nOiBzdHJpbmcsIGFsbG93VHJhaWxpbmc6IGJvb2xlYW4gPSB0cnVlKTogYm9vbGVhbiB7XHJcblx0dHJ5IHtcclxuXHRcdHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIG51bGwsIGFsbG93VHJhaWxpbmcpO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoXHJcblx0ZGF0ZVRpbWVTdHJpbmc6IHN0cmluZywgZm9ybWF0U3RyaW5nOiBzdHJpbmcsIG92ZXJyaWRlWm9uZT86IFRpbWVab25lLCBhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZVxyXG4pOiBBd2FyZVRpbWVTdHJ1Y3Qge1xyXG5cdGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIGRhdGUgZ2l2ZW5cIik7XHJcblx0fVxyXG5cdGlmICghZm9ybWF0U3RyaW5nKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBmb3JtYXQgZ2l2ZW5cIik7XHJcblx0fVxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XHJcblx0XHRjb25zdCB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRcdGNvbnN0IHRpbWU6IFRpbWVDb21wb25lbnRPcHRzID0geyB5ZWFyOiAtMSB9O1xyXG5cdFx0bGV0IHpvbmU6IFRpbWVab25lO1xyXG5cdFx0bGV0IHBucjogUGFyc2VOdW1iZXJSZXN1bHQ7XHJcblx0XHRsZXQgcHpyOiBQYXJzZVpvbmVSZXN1bHQ7XHJcblx0XHRsZXQgcmVtYWluaW5nOiBzdHJpbmcgPSBkYXRlVGltZVN0cmluZztcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xyXG5cdFx0XHRsZXQgdG9rZW5SZXN1bHQ6IHN0cmluZztcclxuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWUVBUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS55ZWFyID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUubW9udGggPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5kYXkgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUtEQVk6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5IT1VSOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLmhvdXIgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5taW51dGUgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlNFQ09ORDpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0aWYgKHRva2VuLnJhdy5jaGFyQXQoMCkgPT09IFwic1wiKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUuc2Vjb25kID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRva2VuLnJhdy5jaGFyQXQoMCkgPT09IFwiU1wiKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUubWlsbGkgPSBwbnIubjtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgc2Vjb25kIGZvcm1hdCAnJHt0b2tlbi5yYXd9J2ApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWk9ORTpcclxuXHRcdFx0XHRcdHB6ciA9IHN0cmlwWm9uZShyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHpvbmUgPSBwenIuem9uZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOlxyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRjb25zdCByZXN1bHQgPSB7IHRpbWU6IG5ldyBUaW1lU3RydWN0KHRpbWUpLCB6b25lOiB6b25lIHx8IG51bGwgfTtcclxuXHRcdGlmICghcmVzdWx0LnRpbWUudmFsaWRhdGUoKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJyZXN1bHRpbmcgZGF0ZSBpbnZhbGlkXCIpO1xyXG5cdFx0fVxyXG5cdFx0Ly8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxyXG5cdFx0aWYgKG92ZXJyaWRlWm9uZSkge1xyXG5cdFx0XHRyZXN1bHQuem9uZSA9IG92ZXJyaWRlWm9uZTtcclxuXHRcdH1cclxuXHRcdGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxyXG5cdFx0XHRcdGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ3JlbWFpbmluZydgXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBkYXRlICcke2RhdGVUaW1lU3RyaW5nfScgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJyR7Zm9ybWF0U3RyaW5nfSc6ICR7ZS5tZXNzYWdlfWApO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHN0cmlwTnVtYmVyKHM6IHN0cmluZyk6IFBhcnNlTnVtYmVyUmVzdWx0IHtcclxuXHRjb25zdCByZXN1bHQ6IFBhcnNlTnVtYmVyUmVzdWx0ID0ge1xyXG5cdFx0bjogTmFOLFxyXG5cdFx0cmVtYWluaW5nOiBzXHJcblx0fTtcclxuXHRsZXQgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuXHR3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApLm1hdGNoKC9cXGQvKSkge1xyXG5cdFx0bnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHQvLyByZW1vdmUgbGVhZGluZyB6ZXJvZXNcclxuXHR3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuXHRcdG51bWJlclN0cmluZyA9IG51bWJlclN0cmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XHJcblx0aWYgKG51bWJlclN0cmluZyA9PT0gXCJcIiB8fCAhaXNGaW5pdGUocmVzdWx0Lm4pKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkIGEgbnVtYmVyIGJ1dCBnb3QgJyR7bnVtYmVyU3RyaW5nfSdgKTtcclxuXHR9XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuY29uc3QgV0hJVEVTUEFDRSA9IFtcIiBcIiwgXCJcXHRcIiwgXCJcXHJcIiwgXCJcXHZcIiwgXCJcXG5cIl07XHJcblxyXG5mdW5jdGlvbiBzdHJpcFpvbmUoczogc3RyaW5nKTogUGFyc2Vab25lUmVzdWx0IHtcclxuXHRpZiAocy5sZW5ndGggPT09IDApIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIHpvbmUgZ2l2ZW5cIik7XHJcblx0fVxyXG5cdGNvbnN0IHJlc3VsdDogUGFyc2Vab25lUmVzdWx0ID0ge1xyXG5cdFx0em9uZTogbnVsbCxcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0bGV0IHpvbmVTdHJpbmcgPSBcIlwiO1xyXG5cdHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuXHRcdHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdHJlc3VsdC56b25lID0gVGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpcFJhdyhzOiBzdHJpbmcsIGV4cGVjdGVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCByZW1haW5pbmcgPSBzO1xyXG5cdGxldCBlcmVtYWluaW5nID0gZXhwZWN0ZWQ7XHJcblx0d2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHRcdGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCAnJHtleHBlY3RlZH0nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuXHJcbi8qKlxyXG4gKiBTcGVjaWZpZXMgaG93IHRoZSBwZXJpb2Qgc2hvdWxkIHJlcGVhdCBhY3Jvc3MgdGhlIGRheVxyXG4gKiBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBQZXJpb2REc3Qge1xyXG5cdC8qKlxyXG5cdCAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcclxuXHQgKiB1bmFmZmVjdGVkIGJ5IERheWxpZ2h0IFNhdmluZyBUaW1lLlxyXG5cdCAqIEUuZy4gYSByZXBldGl0aW9uIG9mIG9uZSBob3VyIHdpbGwgdGFrZSBvbmUgcmVhbCBob3VyXHJcblx0ICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cclxuXHQgKiBMZWFwIHNlY29uZHMsIGxlYXAgZGF5cyBhbmQgbW9udGggbGVuZ3RoXHJcblx0ICogZGlmZmVyZW5jZXMgd2lsbCBzdGlsbCBtYWtlIHRoZSBpbnRlcnZhbHMgZGlmZmVyZW50LlxyXG5cdCAqL1xyXG5cdFJlZ3VsYXJJbnRlcnZhbHMsXHJcblxyXG5cdC8qKlxyXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxyXG5cdCAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cclxuXHQgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxyXG5cdCAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxyXG5cdCAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXHJcblx0ICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG5cdCAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXHJcblx0ICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cclxuXHQgKi9cclxuXHRSZWd1bGFyTG9jYWxUaW1lLFxyXG5cclxuXHQvKipcclxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXJcclxuXHQgKi9cclxuXHRNQVhcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSBQZXJpb2REc3QgdG8gYSBzdHJpbmc6IFwicmVndWxhciBpbnRlcnZhbHNcIiBvciBcInJlZ3VsYXIgbG9jYWwgdGltZVwiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocDogUGVyaW9kRHN0KTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHApIHtcclxuXHRcdGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM6IHJldHVybiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCI7XHJcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcclxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcclxuXHJcblx0LyoqXHJcblx0ICogUmVmZXJlbmNlIG1vbWVudCBvZiBwZXJpb2RcclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZWZlcmVuY2U6IERhdGVUaW1lO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludGVydmFsOiBEdXJhdGlvbjtcclxuXHJcblx0LyoqXHJcblx0ICogRFNUIGhhbmRsaW5nXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZHN0OiBQZXJpb2REc3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZWQgcmVmZXJlbmNlIGRhdGUsIGhhcyBkYXktb2YtbW9udGggPD0gMjggZm9yIE1vbnRobHlcclxuXHQgKiBwZXJpb2QsIG9yIGZvciBZZWFybHkgcGVyaW9kIGlmIG1vbnRoIGlzIEZlYnJ1YXJ5XHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50UmVmZXJlbmNlOiBEYXRlVGltZTtcclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplZCBpbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludEludGVydmFsOiBEdXJhdGlvbjtcclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplZCBpbnRlcm5hbCBEU1QgaGFuZGxpbmcuIElmIERTVCBoYW5kbGluZyBpcyBpcnJlbGV2YW50XHJcblx0ICogKGJlY2F1c2UgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgZG9lcyBub3QgaGF2ZSBEU1QpXHJcblx0ICogdGhlbiBpdCBpcyBzZXQgdG8gUmVndWxhckludGVydmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50RHN0OiBQZXJpb2REc3Q7XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIExJTUlUQVRJT046IGlmIGRzdCBlcXVhbHMgUmVndWxhckxvY2FsVGltZSwgYW5kIHVuaXQgaXMgU2Vjb25kLCBNaW51dGUgb3IgSG91cixcclxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXHJcblx0ICogVGhpcyBpcyBkdWUgdG8gdGhlIGVub3Jtb3VzIHByb2Nlc3NpbmcgcG93ZXIgcmVxdWlyZWQgYnkgdGhlc2UgY2FzZXMuIFRoZXkgYXJlIG5vdFxyXG5cdCAqIGltcGxlbWVudGVkIGFuZCB5b3Ugd2lsbCBnZXQgYW4gYXNzZXJ0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJlZmVyZW5jZSBUaGUgcmVmZXJlbmNlIGRhdGUgb2YgdGhlIHBlcmlvZC4gSWYgdGhlIHBlcmlvZCBpcyBpbiBNb250aHMgb3IgWWVhcnMsIGFuZFxyXG5cdCAqXHRcdFx0XHR0aGUgZGF5IGlzIDI5IG9yIDMwIG9yIDMxLCB0aGUgcmVzdWx0cyBhcmUgbWF4aW1pc2VkIHRvIGVuZC1vZi1tb250aC5cclxuXHQgKiBAcGFyYW0gaW50ZXJ2YWxcdFRoZSBpbnRlcnZhbCBvZiB0aGUgcGVyaW9kXHJcblx0ICogQHBhcmFtIGRzdFx0U3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxyXG5cdCAqICAgICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXHJcblx0ICogICAgICAgICAgICAgIERlZmF1bHRzIHRvIFJlZ3VsYXJMb2NhbFRpbWUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxyXG5cdFx0aW50ZXJ2YWw6IER1cmF0aW9uLFxyXG5cdFx0ZHN0PzogUGVyaW9kRHN0KTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIExJTUlUQVRJT046IGlmIGRzdCBlcXVhbHMgUmVndWxhckxvY2FsVGltZSwgYW5kIHVuaXQgaXMgU2Vjb25kLCBNaW51dGUgb3IgSG91cixcclxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXHJcblx0ICogVGhpcyBpcyBkdWUgdG8gdGhlIGVub3Jtb3VzIHByb2Nlc3NpbmcgcG93ZXIgcmVxdWlyZWQgYnkgdGhlc2UgY2FzZXMuIFRoZXkgYXJlIG5vdFxyXG5cdCAqIGltcGxlbWVudGVkIGFuZCB5b3Ugd2lsbCBnZXQgYW4gYXNzZXJ0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJlZmVyZW5jZSBUaGUgcmVmZXJlbmNlIG9mIHRoZSBwZXJpb2QuIElmIHRoZSBwZXJpb2QgaXMgaW4gTW9udGhzIG9yIFllYXJzLCBhbmRcclxuXHQgKlx0XHRcdFx0dGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXHJcblx0ICogQHBhcmFtIGFtb3VudFx0VGhlIGFtb3VudCBvZiB1bml0cy5cclxuXHQgKiBAcGFyYW0gdW5pdFx0VGhlIHVuaXQuXHJcblx0ICogQHBhcmFtIGRzdFx0U3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxyXG5cdCAqICAgICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXHJcblx0ICogICAgICAgICAgICAgIERlZmF1bHRzIHRvIFJlZ3VsYXJMb2NhbFRpbWUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxyXG5cdFx0YW1vdW50OiBudW1iZXIsXHJcblx0XHR1bml0OiBUaW1lVW5pdCxcclxuXHRcdGRzdD86IFBlcmlvZERzdCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24uIFNlZSBvdGhlciBjb25zdHJ1Y3RvcnMgZm9yIGV4cGxhbmF0aW9uLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcclxuXHRcdGFtb3VudE9ySW50ZXJ2YWw6IGFueSxcclxuXHRcdHVuaXRPckRzdD86IGFueSxcclxuXHRcdGdpdmVuRHN0PzogUGVyaW9kRHN0XHJcblx0XHQpIHtcclxuXHJcblx0XHRsZXQgaW50ZXJ2YWw6IER1cmF0aW9uO1xyXG5cdFx0bGV0IGRzdDogUGVyaW9kRHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcblx0XHRpZiAodHlwZW9mIChhbW91bnRPckludGVydmFsKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRpbnRlcnZhbCA9IDxEdXJhdGlvbj5hbW91bnRPckludGVydmFsO1xyXG5cdFx0XHRkc3QgPSA8UGVyaW9kRHN0PnVuaXRPckRzdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IFRpbWVVbml0Lk1BWCwgXCJJbnZhbGlkIHVuaXRcIik7XHJcblx0XHRcdGludGVydmFsID0gbmV3IER1cmF0aW9uKDxudW1iZXI+YW1vdW50T3JJbnRlcnZhbCwgPFRpbWVVbml0PnVuaXRPckRzdCk7XHJcblx0XHRcdGRzdCA9IGdpdmVuRHN0O1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0ZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcblx0XHR9XHJcblx0XHRhc3NlcnQoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xyXG5cdFx0YXNzZXJ0KCEhcmVmZXJlbmNlLCBcIlJlZmVyZW5jZSB0aW1lIG5vdCBnaXZlblwiKTtcclxuXHRcdGFzc2VydChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xyXG5cdFx0YXNzZXJ0KE1hdGguZmxvb3IoaW50ZXJ2YWwuYW1vdW50KCkpID09PSBpbnRlcnZhbC5hbW91bnQoKSwgXCJBbW91bnQgbXVzdCBiZSBhIHdob2xlIG51bWJlclwiKTtcclxuXHJcblx0XHR0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XHJcblx0XHR0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xyXG5cdFx0dGhpcy5fZHN0ID0gZHN0O1xyXG5cdFx0dGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XHJcblxyXG5cdFx0Ly8gcmVndWxhciBsb2NhbCB0aW1lIGtlZXBpbmcgaXMgb25seSBzdXBwb3J0ZWQgaWYgd2UgY2FuIHJlc2V0IGVhY2ggZGF5XHJcblx0XHQvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXHJcblx0XHQvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxyXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkgJiYgZHN0ID09PSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZSkge1xyXG5cdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMDAwMCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdGFzc2VydCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwLFxyXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAyNCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IFBlcmlvZCB7XHJcblx0XHRyZXR1cm4gbmV3IFBlcmlvZCh0aGlzLl9yZWZlcmVuY2UsIHRoaXMuX2ludGVydmFsLCB0aGlzLl9kc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0ICovXHJcblx0cHVibGljIHJlZmVyZW5jZSgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydCgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIGludGVydmFsKCk6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGFtb3VudCBvZiB1bml0cyBvZiB0aGUgaW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGRzdCBoYW5kbGluZyBtb2RlXHJcblx0ICovXHJcblx0cHVibGljIGRzdCgpOiBQZXJpb2REc3Qge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgZ3JlYXRlciB0aGFuXHJcblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYWZ0ZXIgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuXHQgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuXHJcblx0ICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZEZpcnN0KGZyb21EYXRlOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLFxyXG5cdFx0XHRcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcblx0XHRsZXQgYXBwcm94OiBEYXRlVGltZTtcclxuXHRcdGxldCBhcHByb3gyOiBEYXRlVGltZTtcclxuXHRcdGxldCBhcHByb3hNaW46IERhdGVUaW1lO1xyXG5cdFx0bGV0IHBlcmlvZHM6IG51bWJlcjtcclxuXHRcdGxldCBkaWZmOiBudW1iZXI7XHJcblx0XHRsZXQgbmV3WWVhcjogbnVtYmVyO1xyXG5cdFx0bGV0IG5ld01vbnRoOiBudW1iZXI7XHJcblx0XHRsZXQgcmVtYWluZGVyOiBudW1iZXI7XHJcblx0XHRsZXQgaW1heDogbnVtYmVyO1xyXG5cdFx0bGV0IGltaW46IG51bWJlcjtcclxuXHRcdGxldCBpbWlkOiBudW1iZXI7XHJcblxyXG5cdFx0Y29uc3Qgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA9PT0gMSkge1xyXG5cdFx0XHQvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcclxuXHRcdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuXHRcdFx0XHQvLyBhcHBseSB0byBVVEMgdGltZVxyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCBpbnRlcnZhbHNcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBBbW91bnQgaXMgbm90IDEsXHJcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcblx0XHRcdFx0Ly8gYXBwbHkgdG8gVVRDIHRpbWVcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0XHRcdC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWludXRlcygpO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnV0Y1llYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNZZWFyKCkpICogMTIgK1xyXG5cdFx0XHRcdFx0XHRcdChub3JtYWxGcm9tLnV0Y01vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSkgLSAxO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XHJcblx0XHRcdFx0XHRcdC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuWWVhcik7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4oZnJvbURhdGUpKSB7XHJcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuXHRcdFx0XHRcdFx0XHQvLyBtaW51cyBvbmUgc2Vjb25kIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaWxsaXNlY29uZHNcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHQuc3ViTG9jYWwoMSwgVGltZVVuaXQuU2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0b1xyXG5cdFx0XHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG9kb1xyXG5cdFx0XHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWlsbGlzZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWlsbGlzZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcclxuXHRcdFx0XHRcdFx0XHRpbWF4ID0gTWF0aC5mbG9vcigoODY0MDAwMDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xyXG5cdFx0XHRcdFx0XHRcdHdoaWxlIChpbWF4ID49IGltaW4pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1pbiA9IGltaWQgKyAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1heCA9IGltaWQgLSAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcblx0XHRcdFx0XHRcdFx0Ly8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0Lk1pbnV0ZSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxyXG5cdFx0XHRcdFx0XHRcdC8vIGFyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0LlNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5TZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcclxuXHRcdFx0XHRcdFx0XHRpbWF4ID0gTWF0aC5mbG9vcigoODY0MDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xyXG5cdFx0XHRcdFx0XHRcdHdoaWxlIChpbWF4ID49IGltaW4pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveDI7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbWluID0gaW1pZCArIDE7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbWF4ID0gaW1pZCAtIDE7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcclxuXHRcdFx0XHRcdFx0XHQvLyB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWludXRlcywgc2Vjb25kc1xyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHQuc3ViTG9jYWwoMSwgVGltZVVuaXQuSG91cik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxyXG5cdFx0XHRcdFx0XHRcdC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaW51dGUpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWludXRlKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxyXG5cdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuXHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigyNCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5Ib3VyKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdFx0XHQvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gKG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSkgKiAxMiArXHJcblx0XHRcdFx0XHRcdFx0KG5vcm1hbEZyb20ubW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XHJcblx0XHRcdFx0XHRcdC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRuZXdZZWFyID0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSArIHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBuZXh0IHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3RcclxuXHQgKiBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeSwgb3RoZXJ3aXNlIHRoZSBhbnN3ZXIgaXMgaW5jb3JyZWN0LlxyXG5cdCAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxyXG5cdCAqIFJldHVybnMgdGhlIGRhdGV0aW1lIFwiY291bnRcIiB0aW1lcyBhd2F5IGZyb20gdGhlIGdpdmVuIGRhdGV0aW1lLlxyXG5cdCAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcblx0ICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZE5leHQocHJldjogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xyXG5cdFx0YXNzZXJ0KCEhcHJldiwgXCJQcmV2IG11c3QgYmUgZ2l2ZW5cIik7XHJcblx0XHRhc3NlcnQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLFxyXG5cdFx0XHRcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuXHRcdGFzc2VydCh0eXBlb2YgKGNvdW50KSA9PT0gXCJudW1iZXJcIiwgXCJDb3VudCBtdXN0IGJlIGEgbnVtYmVyXCIpO1xyXG5cdFx0YXNzZXJ0KE1hdGguZmxvb3IoY291bnQpID09PSBjb3VudCwgXCJDb3VudCBtdXN0IGJlIGFuIGludGVnZXJcIik7XHJcblx0XHRjb25zdCBub3JtYWxpemVkUHJldiA9IHRoaXMuX25vcm1hbGl6ZURheShwcmV2LnRvWm9uZSh0aGlzLl9yZWZlcmVuY2Uuem9uZSgpKSk7XHJcblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGQoXHJcblx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKVxyXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkTG9jYWwoXHJcblx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKVxyXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxyXG5cdCAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcblx0ICogQHJldHVybiB0aGUgbGFzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYmVmb3JlIGZyb21EYXRlLCBnaXZlblxyXG5cdCAqXHRcdFx0aW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmRMYXN0KGZyb206IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMuZmluZFByZXYodGhpcy5maW5kRmlyc3QoZnJvbSkpO1xyXG5cdFx0aWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcclxuXHRcdFx0cmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHByZXZpb3VzIHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3RcclxuXHQgKiBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeSwgb3RoZXJ3aXNlIHRoZSBhbnN3ZXIgaXMgaW5jb3JyZWN0LlxyXG5cdCAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBzdWJ0cmFjdC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cclxuXHQgKiBAcmV0dXJuIChuZXh0IC0gY291bnQgKiBwZXJpb2QpLCBpbiB0aGUgc2FtZSB0aW1lem9uZSBhcyBuZXh0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBmaW5kUHJldihuZXh0OiBEYXRlVGltZSwgY291bnQ6IG51bWJlciA9IDEpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5maW5kTmV4dChuZXh0LCAtMSAqIGNvdW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XHJcblx0ICogKGV4cGVuc2l2ZSEpXHJcblx0ICovXHJcblx0cHVibGljIGlzQm91bmRhcnkob2NjdXJyZW5jZTogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdGlmICghb2NjdXJyZW5jZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRhc3NlcnQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLFxyXG5cdFx0XHRcIlRoZSBvY2N1cnJlbmNlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG5cdFx0cmV0dXJuICh0aGlzLmZpbmRGaXJzdChvY2N1cnJlbmNlLnN1YihEdXJhdGlvbi5taWxsaXNlY29uZHMoMSkpKS5lcXVhbHMob2NjdXJyZW5jZSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXHJcblx0ICogaS5lLiBhIHBlcmlvZCBvZiAyNCBob3VycyBpcyBlcXVhbCB0byBvbmUgb2YgMSBkYXkgaWYgdGhleSBoYXZlIHRoZSBzYW1lIFVUQyByZWZlcmVuY2UgbW9tZW50XHJcblx0ICogYW5kIHNhbWUgZHN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFBlcmlvZCk6IGJvb2xlYW4ge1xyXG5cdFx0Ly8gbm90ZSB3ZSB0YWtlIHRoZSBub24tbm9ybWFsaXplZCByZWZlcmVuY2UoKSBiZWNhdXNlIHRoaXMgaGFzIGFuIGluZmx1ZW5jZSBvbiB0aGUgb3V0Y29tZVxyXG5cdFx0cmV0dXJuICh0aGlzLmlzQm91bmRhcnkob3RoZXIucmVmZXJlbmNlKCkpXHJcblx0XHRcdCYmIHRoaXMuX2ludEludGVydmFsLmVxdWFsc0V4YWN0KG90aGVyLmludGVydmFsKCkpXHJcblx0XHRcdCYmIHRoaXMuX2ludERzdCA9PT0gb3RoZXIuX2ludERzdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5fcmVmZXJlbmNlLmlkZW50aWNhbChvdGhlci5yZWZlcmVuY2UoKSlcclxuXHRcdFx0JiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLmludGVydmFsKCkpXHJcblx0XHRcdCYmIHRoaXMuZHN0KCkgPT09IG90aGVyLmRzdCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXHJcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFIXHJcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUFQxTSAgIChvbmUgbWludXRlKVxyXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXHJcblx0ICovXHJcblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXHJcblx0ICogXCIxMCB5ZWFycywgcmVmZXJlbmNlaW5nIGF0IDIwMTQtMDMtMDFUMTI6MDA6MDAgRXVyb3BlL0Ftc3RlcmRhbSwga2VlcGluZyByZWd1bGFyIGludGVydmFsc1wiLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuXHRcdC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcclxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcblx0XHRcdHJlc3VsdCArPSBcIiwga2VlcGluZyBcIiArIHBlcmlvZERzdFRvU3RyaW5nKHRoaXMuX2RzdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbUGVyaW9kOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2NvcnJlY3REYXkoZDogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCBNYXRoLm1pbihiYXNpY3MuZGF5c0luTW9udGgoZC55ZWFyKCksIGQubW9udGgoKSksIHRoaXMuX3JlZmVyZW5jZS5kYXkoKSksXHJcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcblx0ICogdG8gPD0gMjguXHJcblx0ICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25vcm1hbGl6ZURheShkOiBEYXRlVGltZSwgYW55bW9udGg6IGJvb2xlYW4gPSB0cnVlKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcclxuXHRcdFx0fHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIDI4LFxyXG5cdFx0XHRcdGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLFxyXG5cdFx0XHRcdGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGQ7IC8vIHNhdmUgb24gdGltZSBieSBub3QgcmV0dXJuaW5nIGEgY2xvbmVcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxyXG5cdCAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZHN0UmVsZXZhbnQoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKCEhdGhpcy5fcmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHQmJiB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxyXG5cdFx0XHQmJiB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpLmhhc0RzdCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcclxuXHQgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxyXG5cdCAqIEUuZy4gbW9yZSB0aGFuIDYwIG1pbnV0ZXMgaXMgdHJhbnNmZXJyZWQgdG8gaG91cnMsXHJcblx0ICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cclxuXHQgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9jYWxjSW50ZXJuYWxWYWx1ZXMoKTogdm9pZCB7XHJcblx0XHQvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXHJcblx0XHRsZXQgaW50QW1vdW50ID0gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcblx0XHRsZXQgaW50VW5pdCA9IHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuXHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTWlsbGlzZWNvbmQgJiYgaW50QW1vdW50ID49IDEwMDAgJiYgaW50QW1vdW50ICUgMTAwMCA9PT0gMCkge1xyXG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTAwMDtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdH1cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5TZWNvbmQgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcblx0XHRcdC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdH1cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuSG91cjtcclxuXHRcdH1cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Ib3VyICYmIGludEFtb3VudCA+PSAyNCAmJiBpbnRBbW91bnQgJSAyNCA9PT0gMCkge1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAyNDtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdH1cclxuXHRcdC8vIG5vdyByZW1vdmUgd2Vla3Mgc28gd2UgaGF2ZSBvbmUgbGVzcyBjYXNlIHRvIHdvcnJ5IGFib3V0XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuV2Vlaykge1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgKiA3O1xyXG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuRGF5O1xyXG5cdFx0fVxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1vbnRoICYmIGludEFtb3VudCA+PSAxMiAmJiBpbnRBbW91bnQgJSAxMiA9PT0gMCkge1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMjtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faW50SW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oaW50QW1vdW50LCBpbnRVbml0KTtcclxuXHJcblx0XHQvLyBub3JtYWxpemUgZHN0IGhhbmRsaW5nXHJcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xyXG5cdFx0XHR0aGlzLl9pbnREc3QgPSB0aGlzLl9kc3Q7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9pbnREc3QgPSBQZXJpb2REc3QuUmVndWxhckludGVydmFscztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxyXG5cdFx0dGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xyXG5cdH1cclxuXHJcbn1cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBTdHJpbmcgdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZExlZnQoczogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuXHRcdHBhZGRpbmcgKz0gY2hhcjtcclxuXHR9XHJcblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZFJpZ2h0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEZvciB0ZXN0aW5nIHB1cnBvc2VzLCB3ZSBvZnRlbiBuZWVkIHRvIG1hbmlwdWxhdGUgd2hhdCB0aGUgY3VycmVudFxyXG4gKiB0aW1lIGlzLiBUaGlzIGlzIGFuIGludGVyZmFjZSBmb3IgYSBjdXN0b20gdGltZSBzb3VyY2Ugb2JqZWN0XHJcbiAqIHNvIGluIHRlc3RzIHlvdSBjYW4gdXNlIGEgY3VzdG9tIHRpbWUgc291cmNlLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lU291cmNlIHtcclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIGN1cnJlbnQgZGF0ZSt0aW1lIGFzIGEgamF2YXNjcmlwdCBEYXRlIG9iamVjdFxyXG5cdCAqL1xyXG5cdG5vdygpOiBEYXRlO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB0aW1lIHNvdXJjZSwgcmV0dXJucyBhY3R1YWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJlYWxUaW1lU291cmNlIGltcGxlbWVudHMgVGltZVNvdXJjZSB7XHJcblx0bm93KCk6IERhdGUge1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcbmltcG9ydCAgeyBOb3JtYWxpemVPcHRpb24sIFR6RGF0YWJhc2UgfSBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsKCk6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUubG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHV0YygpOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLnV0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIG9mZnNldCBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzAuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAcmV0dXJucyBhIHRpbWUgem9uZSB3aXRoIHRoZSBnaXZlbiBmaXhlZCBvZmZzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XHJcblxyXG4vKipcclxuICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqIEBwYXJhbSBzIEVtcHR5IHN0cmluZyBmb3Igbm8gdGltZSB6b25lIChudWxsIGlzIHJldHVybmVkKSxcclxuICogICAgICAgICAgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcclxuICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxyXG4gKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXHJcbiAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcbiAqICAgICAgICAgICAgICBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShuYW1lOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcclxuXHJcbi8qKlxyXG4gKiBTZWUgdGhlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIG90aGVyIHpvbmUoKSBtZXRob2Qgc2lnbmF0dXJlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKGE6IGFueSwgZHN0PzogYm9vbGVhbik6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUuem9uZShhLCBkc3QpO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUaW1lWm9uZUtpbmQge1xyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxyXG5cdCAqL1xyXG5cdExvY2FsLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICovXHJcblx0T2Zmc2V0LFxyXG5cdC8qKlxyXG5cdCAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xyXG5cdCAqIERTVCBpZiBhcHBsaWNhYmxlLlxyXG5cdCAqL1xyXG5cdFByb3BlclxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcclxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXHJcbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxyXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXHJcbiAqXHJcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcclxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxyXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRpbWVab25lIHtcclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGlkZW50aWZpZXI6XHJcblx0ICogIFwibG9jYWx0aW1lXCIgc3RyaW5nIGZvciBsb2NhbCB0aW1lXHJcblx0ICogIEUuZy4gXCItMDE6MzBcIiBmb3IgYSBmaXhlZCBvZmZzZXQgZnJvbSBVVENcclxuXHQgKiAgRS5nLiBcIlVUQ1wiIG9yIFwiRXVyb3BlL0Ftc3RlcmRhbVwiIGZvciBhbiBPbHNlbiBUWiBkYXRhYmFzZSB0aW1lXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RzdDogYm9vbGVhbjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIHNwZWNpZmllZCBieSBfbmFtZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2tpbmQ6IFRpbWVab25lS2luZDtcclxuXHJcblx0LyoqXHJcblx0ICogT25seSBmb3IgZml4ZWQgb2Zmc2V0czogdGhlIG9mZnNldCBpbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfb2Zmc2V0OiBudW1iZXI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZS4gTm90ZSB0aGF0XHJcblx0ICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXHJcblx0ICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbG9jYWwoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJsb2NhbHRpbWVcIiwgdHJ1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgVVRDIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHV0YygpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcIlVUQ1wiLCB0cnVlKTsgLy8gdXNlICd0cnVlJyBmb3IgRFNUIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBkaXNwbGF5IGFzIFwiVVRDXCIsIG5vdCBcIlVUQyB3aXRob3V0IERTVFwiXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgd2l0aCBhIGZpeGVkIG9mZnNldFxyXG5cdCAqIEBwYXJhbSBvZmZzZXRcdG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMsIGUuZy4gOTAgZm9yICswMTozMFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcblx0ICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG5cdCAqIEBwYXJhbSBzIEVtcHR5IHN0cmluZyBmb3Igbm8gdGltZSB6b25lIChudWxsIGlzIHJldHVybmVkKSxcclxuXHQgKiAgICAgICAgICBcImxvY2FsdGltZVwiIGZvciBsb2NhbCB0aW1lLFxyXG5cdCAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXHJcblx0ICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxyXG5cdCAqICAgICAgICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHpfZGF0YWJhc2VfdGltZV96b25lc1xyXG5cdCAqICAgICAgICAgIFRaIGRhdGFiYXNlIHpvbmUgbmFtZSBtYXkgYmUgc3VmZml4ZWQgd2l0aCBcIiB3aXRob3V0IERTVFwiIHRvIGluZGljYXRlIG5vIERTVCBzaG91bGQgYmUgYXBwbGllZC5cclxuXHQgKiAgICAgICAgICBJbiB0aGF0IGNhc2UsIHRoZSBkc3QgcGFyYW1ldGVyIGlzIGlnbm9yZWQuXHJcblx0ICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXHJcblx0ICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcclxuXHQgKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgem9uZShzOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBpbXBsZW1lbnRhdGlvbnNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUoYTogYW55LCBkc3Q6IGJvb2xlYW4gPSB0cnVlKTogVGltZVpvbmUge1xyXG5cdFx0bGV0IG5hbWUgPSBcIlwiO1xyXG5cdFx0c3dpdGNoICh0eXBlb2YgKGEpKSB7XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xyXG5cdFx0XHRcdGxldCBzID0gPHN0cmluZz5hO1xyXG5cdFx0XHRcdGlmIChzLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRcdHJldHVybiBudWxsOyAvLyBubyB0aW1lIHpvbmVcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcclxuXHRcdFx0XHRcdFx0ZHN0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHMgPSBzLnNsaWNlKDAsIHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpIC0gMSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRuYW1lID0gVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyhzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xyXG5cdFx0XHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gPG51bWJlcj5hO1xyXG5cdFx0XHRcdGFzc2VydChvZmZzZXQgPiAtMjQgKiA2MCAmJiBvZmZzZXQgPCAyNCAqIDYwLCBcIlRpbWVab25lLnpvbmUoKTogb2Zmc2V0IG91dCBvZiByYW5nZVwiKTtcclxuXHRcdFx0XHRuYW1lID0gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcob2Zmc2V0KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaW1lWm9uZS56b25lKCk6IFVuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZSBcXFwiXCIgKyB0eXBlb2YgKGEpICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEbyBub3QgdXNlIHRoaXMgY29uc3RydWN0b3IsIHVzZSB0aGUgc3RhdGljXHJcblx0ICogVGltZVpvbmUuem9uZSgpIG1ldGhvZCBpbnN0ZWFkLlxyXG5cdCAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XHJcblx0ICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUsIGlnbm9yZWQgZm9yIGxvY2FsIHRpbWUgYW5kIGZpeGVkIG9mZnNldHNcclxuXHQgKi9cclxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuID0gdHJ1ZSkge1xyXG5cdFx0dGhpcy5fbmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XHJcblx0XHRpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLkxvY2FsO1xyXG5cdFx0fSBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcclxuXHRcdFx0dGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcclxuXHRcdFx0YXNzZXJ0KFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIGBub24tZXhpc3RpbmcgdGltZSB6b25lIG5hbWUgJyR7bmFtZX0nYCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgY2FjaGVkIHlvdSB3aWxsIE5PVFxyXG5cdCAqIGFjdHVhbGx5IGdldCBhIGNsb25lIGJ1dCB0aGUgc2FtZSBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyLiBDYW4gYmUgYW4gb2Zmc2V0IFwiLTAxOjMwXCIgb3IgYW5cclxuXHQgKiBJQU5BIHRpbWUgem9uZSBuYW1lIFwiRXVyb3BlL0Ftc3RlcmRhbVwiLCBvciBcImxvY2FsdGltZVwiIGZvclxyXG5cdCAqIHRoZSBsb2NhbCB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIG5hbWUoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLl9uYW1lO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRzdCgpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl9kc3Q7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgKExvY2FsL09mZnNldC9Qcm9wZXIpXHJcblx0ICovXHJcblx0cHVibGljIGtpbmQoKTogVGltZVpvbmVLaW5kIHtcclxuXHRcdHJldHVybiB0aGlzLl9raW5kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRXF1YWxpdHkgb3BlcmF0b3IuIE1hcHMgemVybyBvZmZzZXRzIGFuZCBkaWZmZXJlbnQgbmFtZXMgZm9yIFVUQyBvbnRvXHJcblx0ICogZWFjaCBvdGhlci4gT3RoZXIgdGltZSB6b25lcyBhcmUgbm90IG1hcHBlZCBvbnRvIGVhY2ggb3RoZXIuXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogVGltZVpvbmUpOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmlzVXRjKCkgJiYgb3RoZXIuaXNVdGMoKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxyXG5cdFx0XHRcdCYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXHJcblx0XHRcdFx0JiYgKHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCB8fCAhdGhpcy5oYXNEc3QoKSkpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyB3ZXJlIGlkZW50aWNhbCwgc28gVVRDICE9PSBHTVRcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xyXG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lICYmIHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHpvbmUga2luZC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSXMgdGhpcyB6b25lIGVxdWl2YWxlbnQgdG8gVVRDP1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBpc1V0YygpOiBib29sZWFuIHtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKFR6RGF0YWJhc2UuaW5zdGFuY2UoKS56b25lSXNVdGModGhpcy5fbmFtZSkpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRG9lcyB0aGlzIHpvbmUgaGF2ZSBEYXlsaWdodCBTYXZpbmcgVGltZSBhdCBhbGw/XHJcblx0ICovXHJcblx0cHVibGljIGhhc0RzdCgpOiBib29sZWFuIHtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5oYXNEc3QodGhpcy5fbmFtZSkpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIG9mZnNldCBmcm9tIGEgVVRDIHRpbWUuXHJcblxcXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhcclxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxyXG5cdFx0XHRcdFx0dXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaVxyXG5cdFx0XHRcdCkpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIHpvbmUtbG9jYWwgdGltZSAoTk9UIGEgVVRDIHRpbWUpLlxyXG5cdCAqIEBwYXJhbSB5ZWFyIGxvY2FsIGZ1bGwgeWVhclxyXG5cdCAqIEBwYXJhbSBtb250aCBsb2NhbCBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXHJcblx0ICogQHBhcmFtIGRheSBsb2NhbCBkYXkgb2YgbW9udGggMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyIGxvY2FsIGhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGUgbG9jYWwgbWludXRlIDAtNTlcclxuXHQgKiBAcGFyYW0gc2Vjb25kIGxvY2FsIHNlY29uZCAwLTU5XHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kIGxvY2FsIG1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclpvbmUobG9jYWxUaW1lOiBUaW1lU3RydWN0KTogbnVtYmVyO1xyXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShcclxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgbG9jYWxUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShcclxuXHRcdFx0XHRcdGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuZGF5LFxyXG5cdFx0XHRcdFx0bG9jYWxUaW1lLmNvbXBvbmVudHMuaG91ciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWludXRlLCBsb2NhbFRpbWUuY29tcG9uZW50cy5zZWNvbmQsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbGxpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuXHRcdFx0XHQvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcclxuXHRcdFx0XHRpZiAodGhpcy5fZHN0KSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG5cdCAqXHJcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcblx0ICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG5cdCAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGNEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhUaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG5cdCAqXHJcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcblx0ICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG5cdCAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lRGF0ZShkYXRlOiBEYXRlLCBmdW5jczogRGF0ZUZ1bmN0aW9ucyk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3Jab25lKFRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgYWJicmV2aWF0aW9uIGF0IGdpdmVuIFVUQyB0aW1lc3RhbXAgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHllYXIgRnVsbCB5ZWFyXHJcblx0ICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXHJcblx0ICogQHBhcmFtIGhvdXIgSG91ciAwLTIzXHJcblx0ICogQHBhcmFtIG1pbnV0ZSBNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmQgU2Vjb25kIDAtNTlcclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmQgTWlsbGlzZWNvbmQgMC05OTlcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFwibG9jYWxcIiBmb3IgbG9jYWwgdGltZXpvbmUsIHRoZSBvZmZzZXQgZm9yIGFuIG9mZnNldCB6b25lLCBvciB0aGUgYWJicmV2aWF0aW9uIGZvciBhIHByb3BlciB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIsIGRzdERlcGVuZGVudD86IGJvb2xlYW5cclxuXHQpOiBzdHJpbmc7XHJcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyh1dGNUaW1lOiBUaW1lU3RydWN0LCBkc3REZXBlbmRlbnQ/OiBib29sZWFuKTogc3RyaW5nO1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGMoXHJcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgYj86IG51bWJlciB8IGJvb2xlYW4sIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBjPzogYm9vbGVhblxyXG5cdCk6IHN0cmluZyB7XHJcblx0XHRsZXQgdXRjVGltZTogVGltZVN0cnVjdDtcclxuXHRcdGxldCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdFx0aWYgKGEgaW5zdGFuY2VvZiBUaW1lU3RydWN0KSB7XHJcblx0XHRcdHV0Y1RpbWUgPSBhO1xyXG5cdFx0XHRkc3REZXBlbmRlbnQgPSAoYiA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dXRjVGltZSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IGIgYXMgbnVtYmVyLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcclxuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdHJldHVybiBcImxvY2FsXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXHJcblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxyXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxyXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxyXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdHpvbmUgdGltZSB0aW1lc3RhbXAgYXMgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuc1x0dW5peCBtaWxsaXNlY29uZHMgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFVuaXhNaWxsaXM6IG51bWJlciwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cclxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXHJcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXHJcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcFxyXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXBcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zXHR0aW1lIHN0cnVjdCBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXHJcblx0ICovXHJcblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVGltZTogVGltZVN0cnVjdCwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogVGltZVN0cnVjdDtcclxuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xyXG5cdFx0Y29uc3QgdHpvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5Eb3duID8gTm9ybWFsaXplT3B0aW9uLkRvd24gOiBOb3JtYWxpemVPcHRpb24uVXApO1xyXG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUpLCB0em9wdCkudW5peE1pbGxpcztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbG9jYWxUaW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyIChub3JtYWxpemVkKS5cclxuXHQgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdGxldCByZXN1bHQgPSB0aGlzLm5hbWUoKTtcclxuXHRcdGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG5cdFx0XHRpZiAodGhpcy5oYXNEc3QoKSAmJiAhdGhpcy5kc3QoKSkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG5cdCAqL1xyXG5cdGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltUaW1lWm9uZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcclxuXHQgKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgaW4gbWludXRlcyBmcm9tIFVUQyBlLmcuIDkwIG1pbnV0ZXNcclxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW4gSVNPIG5vdGF0aW9uIFwiKzAxOjMwXCIgZm9yICs5MCBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBvZmZzZXRUb1N0cmluZyhvZmZzZXQ6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRjb25zdCBzaWduID0gKG9mZnNldCA8IDAgPyBcIi1cIiA6IFwiK1wiKTtcclxuXHRcdGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG5cdFx0Y29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAlIDYwKTtcclxuXHRcdHJldHVybiBzaWduICsgc3RyaW5ncy5wYWRMZWZ0KGhvdXJzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQobWludXRlcy50b1N0cmluZygxMCksIDIsIFwiMFwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cclxuXHQgKiBAcGFyYW0gc1x0Rm9ybWF0czogXCItMDE6MDBcIiwgXCItMDEwMFwiLCBcIi0wMVwiLCBcIlpcIlxyXG5cdCAqIEByZXR1cm4gb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgc3RyaW5nVG9PZmZzZXQoczogc3RyaW5nKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IHQgPSBzLnRyaW0oKTtcclxuXHRcdC8vIGVhc3kgY2FzZVxyXG5cdFx0aWYgKHQgPT09IFwiWlwiKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fVxyXG5cdFx0Ly8gY2hlY2sgdGhhdCB0aGUgcmVtYWluZGVyIGNvbmZvcm1zIHRvIElTTyB0aW1lIHpvbmUgc3BlY1xyXG5cdFx0YXNzZXJ0KHQubWF0Y2goL15bKy1dXFxkXFxkKDo/KVxcZFxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCQvKSwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xyXG5cdFx0Y29uc3Qgc2lnbjogbnVtYmVyID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XHJcblx0XHRjb25zdCBob3VyczogbnVtYmVyID0gcGFyc2VJbnQodC5zdWJzdHIoMSwgMiksIDEwKTtcclxuXHRcdGxldCBtaW51dGVzOiBudW1iZXIgPSAwO1xyXG5cdFx0aWYgKHQubGVuZ3RoID09PSA1KSB7XHJcblx0XHRcdG1pbnV0ZXMgPSBwYXJzZUludCh0LnN1YnN0cigzLCAyKSwgMTApO1xyXG5cdFx0fSBlbHNlIGlmICh0Lmxlbmd0aCA9PT0gNikge1xyXG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoNCwgMiksIDEwKTtcclxuXHRcdH1cclxuXHRcdGFzc2VydChob3VycyA+PSAwICYmIGhvdXJzIDwgMjQsIFwiT2Zmc2V0cyBmcm9tIFVUQyBtdXN0IGJlIGxlc3MgdGhhbiBhIGRheS5cIik7XHJcblx0XHRyZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcyk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGNhY2hlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9jYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFRpbWVab25lIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogRmluZCBpbiBjYWNoZSBvciBjcmVhdGUgem9uZVxyXG5cdCAqIEBwYXJhbSBuYW1lXHRUaW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfZmluZE9yQ3JlYXRlKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuKTogVGltZVpvbmUge1xyXG5cdFx0Y29uc3Qga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcclxuXHRcdGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XHJcblx0XHRcdHJldHVybiBUaW1lWm9uZS5fY2FjaGVba2V5XTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IHQgPSBuZXcgVGltZVpvbmUobmFtZSwgZHN0KTtcclxuXHRcdFx0VGltZVpvbmUuX2NhY2hlW2tleV0gPSB0O1xyXG5cdFx0XHRyZXR1cm4gdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHN0cmluZyBzbyBpdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBmb3IgYVxyXG5cdCAqIGNhY2hlIGxvb2t1cFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9ub3JtYWxpemVTdHJpbmcoczogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHQ6IHN0cmluZyA9IHMudHJpbSgpO1xyXG5cdFx0YXNzZXJ0KHQubGVuZ3RoID4gMCwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xyXG5cdFx0aWYgKHQgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9IGVsc2UgaWYgKHQgPT09IFwiWlwiKSB7XHJcblx0XHRcdHJldHVybiBcIiswMDowMFwiO1xyXG5cdFx0fSBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcclxuXHRcdFx0Ly8gb2Zmc2V0IHN0cmluZ1xyXG5cdFx0XHQvLyBub3JtYWxpemUgYnkgY29udmVydGluZyBiYWNrIGFuZCBmb3J0aFxyXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcoVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQodCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gT2xzZW4gVFogZGF0YWJhc2UgbmFtZVxyXG5cdFx0XHRyZXR1cm4gdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc3RhdGljIF9pc09mZnNldFN0cmluZyhzOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGNvbnN0IHQgPSBzLnRyaW0oKTtcclxuXHRcdHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRva2VuaXplciB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyB0b2tlbml6ZXJcclxuXHQgKiBAcGFyYW0gX2Zvcm1hdFN0cmluZyAob3B0aW9uYWwpIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgX2Zvcm1hdFN0cmluZz86IHN0cmluZykge1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIG5ldyBzdHJpbmcgdG8gdXNlIGZvciBmb3JtYXR0aW5nXHJcblx0ICovXHJcblx0c2V0Rm9ybWF0U3RyaW5nKGZvcm1hdFN0cmluZzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHR0aGlzLl9mb3JtYXRTdHJpbmcgPSBmb3JtYXRTdHJpbmc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHBlbmQgYSBuZXcgdG9rZW4gdG8gdGhlIGN1cnJlbnQgbGlzdCBvZiB0b2tlbnMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdG9rZW5TdHJpbmcgVGhlIHN0cmluZyB0aGF0IG1ha2VzIHVwIHRoZSB0b2tlblxyXG5cdCAqIEBwYXJhbSB0b2tlbkFycmF5IFRoZSBleGlzdGluZyBhcnJheSBvZiB0b2tlbnNcclxuXHQgKiBAcGFyYW0gcmF3IChvcHRpb25hbCkgSWYgdHJ1ZSwgZG9uJ3QgcGFyc2UgdGhlIHRva2VuIGJ1dCBpbnNlcnQgaXQgYXMgaXNcclxuXHQgKiBAcmV0dXJuIFRva2VuW10gVGhlIHJlc3VsdGluZyBhcnJheSBvZiB0b2tlbnMuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYXBwZW5kVG9rZW4odG9rZW5TdHJpbmc6IHN0cmluZywgdG9rZW5BcnJheTogVG9rZW5bXSwgcmF3PzogYm9vbGVhbik6IFRva2VuW10ge1xyXG5cdFx0aWYgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XHJcblx0XHRcdGNvbnN0IHRva2VuOiBUb2tlbiA9IHtcclxuXHRcdFx0XHRsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuXHRcdFx0XHRyYXc6IHRva2VuU3RyaW5nLFxyXG5cdFx0XHRcdHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcblx0XHRcdFx0dHlwZTogRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmICghcmF3KSB7XHJcblx0XHRcdFx0dG9rZW4udHlwZSA9IG1hcFN5bWJvbFRvVHlwZSh0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRva2VuQXJyYXkucHVzaCh0b2tlbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdG9rZW5BcnJheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBpbnRlcm5hbCBzdHJpbmcgYW5kIHJldHVybiBhbiBhcnJheSBvZiB0b2tlbnMuXHJcblx0ICogQHJldHVybiBUb2tlbltdXHJcblx0ICovXHJcblx0cGFyc2VUb2tlbnMoKTogVG9rZW5bXSB7XHJcblx0XHRsZXQgcmVzdWx0OiBUb2tlbltdID0gW107XHJcblxyXG5cdFx0bGV0IGN1cnJlbnRUb2tlbjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGxldCBwcmV2aW91c0NoYXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRsZXQgcXVvdGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdFx0bGV0IHBvc3NpYmxlRXNjYXBpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2Zvcm1hdFN0cmluZy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCBjdXJyZW50Q2hhciA9IHRoaXMuX2Zvcm1hdFN0cmluZ1tpXTtcclxuXHJcblx0XHRcdC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG5cdFx0XHRpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XHJcblx0XHRcdFx0aWYgKCFxdW90aW5nKSB7XHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xyXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBcIidcIjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIFR3byBwb3NzaWJpbGl0aWVzOiBXZXJlIGFyZSBkb25lIHF1b3RpbmcsIG9yIHdlIGFyZSBlc2NhcGluZyBhICcgY2hhcmFjdGVyXHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gTWF5YmUgZXNjYXBpbmcsIHdhaXQgZm9yIG5leHQgdG9rZW4gaWYgd2UgYXJlIGVzY2FwaW5nXHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKCFwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHQvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXHJcblx0XHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH0gZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdHF1b3RpbmcgPSAhcXVvdGluZztcclxuXHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuXHRcdFx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgIXF1b3RpbmcpO1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChxdW90aW5nKSB7XHJcblx0XHRcdFx0Ly8gUXVvdGluZyBtb2RlLCBhZGQgY2hhcmFjdGVyIHRvIHRva2VuLlxyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuXHRcdFx0XHQvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHR9XHJcblx0XHQvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcblx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgcXVvdGluZyk7XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVUaW1lVG9rZW5UeXBlIHtcclxuXHRJREVOVElUWSwgLy8gU3BlY2lhbCwgZG8gbm90IFwiZm9ybWF0XCIgdGhpcywgYnV0IGp1c3Qgb3V0cHV0IHdoYXQgd2VudCBpblxyXG5cclxuXHRFUkEsXHJcblx0WUVBUixcclxuXHRRVUFSVEVSLFxyXG5cdE1PTlRILFxyXG5cdFdFRUssXHJcblx0REFZLFxyXG5cdFdFRUtEQVksXHJcblx0REFZUEVSSU9ELFxyXG5cdEhPVVIsXHJcblx0TUlOVVRFLFxyXG5cdFNFQ09ORCxcclxuXHRaT05FXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyB0b2tlblxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUb2tlbiB7XHJcblx0LyoqXHJcblx0ICogVGhlIHR5cGUgb2YgdG9rZW5cclxuXHQgKi9cclxuXHR0eXBlOiBEYXRlVGltZVRva2VuVHlwZTtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHN5bWJvbCBmcm9tIHdoaWNoIHRoZSB0b2tlbiB3YXMgcGFyc2VkXHJcblx0ICovXHJcblx0c3ltYm9sOiBzdHJpbmc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHRva2VuXHJcblx0ICovXHJcblx0bGVuZ3RoOiBudW1iZXI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCBwcm9kdWNlZCB0aGlzIHRva2VuXHJcblx0ICovXHJcblx0cmF3OiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IHN5bWJvbE1hcHBpbmc6IHsgW2NoYXI6IHN0cmluZ106IERhdGVUaW1lVG9rZW5UeXBlIH0gPSB7XHJcblx0XCJHXCI6IERhdGVUaW1lVG9rZW5UeXBlLkVSQSxcclxuXHJcblx0XCJ5XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJZXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJ1XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJVXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblx0XCJyXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcblxyXG5cdFwiUVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG5cdFwicVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG5cclxuXHRcIk1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcblx0XCJMXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG5cdFwibFwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuXHJcblx0XCJ3XCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcblx0XCJXXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcblxyXG5cdFwiZFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblx0XCJEXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcIkZcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFwiZ1wiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblxyXG5cdFwiRVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFwiZVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFwiY1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cclxuXHRcImFcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cclxuXHRcImhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIkhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcImtcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIktcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcImpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHRcIkpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuXHJcblx0XCJtXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1JTlVURSxcclxuXHJcblx0XCJzXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcIlNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFwiQVwiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblxyXG5cdFwielwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiWlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiT1wiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwidlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiVlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwiWFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG5cdFwieFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbn07XHJcblxyXG4vKipcclxuICogTWFwIHRoZSBnaXZlbiBzeW1ib2wgdG8gb25lIG9mIHRoZSBEYXRlVGltZVRva2VuVHlwZXNcclxuICogSWYgdGhlcmUgaXMgbm8gbWFwcGluZywgRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFkgaXMgdXNlZFxyXG4gKlxyXG4gKiBAcGFyYW0gc3ltYm9sIFRoZSBzaW5nbGUtY2hhcmFjdGVyIHN5bWJvbCB1c2VkIHRvIG1hcCB0aGUgdG9rZW5cclxuICogQHJldHVybiBEYXRlVGltZVRva2VuVHlwZSBUaGUgVHlwZSBvZiB0b2tlbiB0aGlzIHN5bWJvbCByZXByZXNlbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXBTeW1ib2xUb1R5cGUoc3ltYm9sOiBzdHJpbmcpOiBEYXRlVGltZVRva2VuVHlwZSB7XHJcblx0aWYgKHN5bWJvbE1hcHBpbmcuaGFzT3duUHJvcGVydHkoc3ltYm9sKSkge1xyXG5cdFx0cmV0dXJuIHN5bWJvbE1hcHBpbmdbc3ltYm9sXTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZO1xyXG5cdH1cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QsIFRpbWVVbml0LCBXZWVrRGF5IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwidXRpbFwiO1xyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIFRvVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRWl0aGVyIGEgeWVhciBudW1iZXIgb3IgXCJvbmx5XCJcclxuXHQgKi9cclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIFwibWF4XCJcclxuXHQgKi9cclxuXHRNYXhcclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIE9uVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG5cdCAqL1xyXG5cdERheU51bSxcclxuXHQvKipcclxuXHQgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuXHQgKi9cclxuXHRMYXN0WCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPj04XCJcclxuXHQgKi9cclxuXHRHcmVxWCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPD04XCJcclxuXHQgKi9cclxuXHRMZXFYXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEF0VHlwZSB7XHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZSAobm8gRFNUKVxyXG5cdCAqL1xyXG5cdFN0YW5kYXJkLFxyXG5cdC8qKlxyXG5cdCAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuXHQgKi9cclxuXHRXYWxsLFxyXG5cdC8qKlxyXG5cdCAqIFV0YyB0aW1lXHJcblx0ICovXHJcblx0VXRjLFxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdWxlSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmcm9tOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9ZZWFyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHR5cGU6IHN0cmluZyxcclxuXHRcdC8qKlxyXG5cdFx0ICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE9OIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvblR5cGU6IE9uVHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uRGF5OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gaG91clxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRIb3VyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0TWludXRlOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBzZWNvbmRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFR5cGU6IEF0VHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBzYXZlOiBEdXJhdGlvbixcclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG5cdFx0ICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xyXG5cdFx0KSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuc2F2ZSkge1xyXG5cdFx0XHR0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChUaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVMZXNzKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSA8IG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcblx0ICovXHJcblx0cHVibGljIGVmZmVjdGl2ZUVxdWFsKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuXHQgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcblx0ICogbm90IHRha2VuIGludG8gYWNjb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVEYXRlKHllYXI6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG5cclxuXHRcdC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG5cdFx0Y29uc3QgdG06IFRpbWVDb21wb25lbnRPcHRzID0ge3llYXIsIG1vbnRoOiB0aGlzLmluTW9udGggfTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgZGF5XHJcblx0XHRzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xyXG5cdFx0XHRcdHRtLmRheSA9IHRoaXMub25EYXk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGltZVxyXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xyXG5cdFx0dG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuXHRcdHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRtKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRyYW5zaXRpb24gbW9tZW50IGluIFVUQyBpbiB0aGUgZ2l2ZW4geWVhclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGZvciB3aGljaCB0byByZXR1cm4gdGhlIHRyYW5zaXRpb25cclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFRoZSBzdGFuZGFyZCBvZmZzZXQgZm9yIHRoZSB0aW1lem9uZSB3aXRob3V0IERTVFxyXG5cdCAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdHJhbnNpdGlvblRpbWVVdGMoeWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24sIHByZXZSdWxlOiBSdWxlSW5mbyk6IG51bWJlciB7XHJcblx0XHRhc3NlcnQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgbm90IGFwcGxpY2FibGUgaW4gZ2l2ZW4geWVhclwiKTtcclxuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcikudW5peE1pbGxpcztcclxuXHJcblx0XHQvLyBhZGp1c3QgZm9yIGdpdmVuIG9mZnNldFxyXG5cdFx0bGV0IG9mZnNldDogRHVyYXRpb247XHJcblx0XHRzd2l0Y2ggKHRoaXMuYXRUeXBlKSB7XHJcblx0XHRcdGNhc2UgQXRUeXBlLlV0YzpcclxuXHRcdFx0XHRvZmZzZXQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBBdFR5cGUuU3RhbmRhcmQ6XHJcblx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgQXRUeXBlLldhbGw6XHJcblx0XHRcdFx0aWYgKHByZXZSdWxlKSB7XHJcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldC5hZGQocHJldlJ1bGUuc2F2ZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIEF0VHlwZVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVuaXhNaWxsaXMgLSBvZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJlZmVyZW5jZSBmcm9tIHpvbmUgdG8gcnVsZVxyXG4gKi9cclxuZXhwb3J0IGVudW0gUnVsZVR5cGUge1xyXG5cdC8qKlxyXG5cdCAqIE5vIHJ1bGUgYXBwbGllc1xyXG5cdCAqL1xyXG5cdE5vbmUsXHJcblx0LyoqXHJcblx0ICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XHJcblx0ICovXHJcblx0T2Zmc2V0LFxyXG5cdC8qKlxyXG5cdCAqIFJlZmVyZW5jZSB0byBhIG5hbWVkIHNldCBvZiBydWxlc1xyXG5cdCAqL1xyXG5cdFJ1bGVOYW1lXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKiBGaXJzdCwgYW5kIHNvbWV3aGF0IHRyaXZpYWxseSwgd2hlcmVhcyBSdWxlcyBhcmUgY29uc2lkZXJlZCB0byBjb250YWluIG9uZSBvciBtb3JlIHJlY29yZHMsIGEgWm9uZSBpcyBjb25zaWRlcmVkIHRvXHJcbiAqIGJlIGEgc2luZ2xlIHJlY29yZCB3aXRoIHplcm8gb3IgbW9yZSBjb250aW51YXRpb24gbGluZXMuIFRodXMsIHRoZSBrZXl3b3JkLCDigJxab25lLOKAnSBhbmQgdGhlIHpvbmUgbmFtZSBhcmUgbm90IHJlcGVhdGVkLlxyXG4gKiBUaGUgbGFzdCBsaW5lIGlzIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4uXHJcbiAqIFNlY29uZCwgYW5kIG1vcmUgZnVuZGFtZW50YWxseSwgZWFjaCBsaW5lIG9mIGEgWm9uZSByZXByZXNlbnRzIGEgc3RlYWR5IHN0YXRlLCBub3QgYSB0cmFuc2l0aW9uIGJldHdlZW4gc3RhdGVzLlxyXG4gKiBUaGUgc3RhdGUgZXhpc3RzIGZyb20gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIHByZXZpb3VzIGxpbmXigJlzIFtVTlRJTF0gY29sdW1uIHVwIHRvIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBjdXJyZW50IGxpbmXigJlzXHJcbiAqIFtVTlRJTF0gY29sdW1uLiBJbiBvdGhlciB3b3JkcywgdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIFtVTlRJTF0gY29sdW1uIGlzIHRoZSBpbnN0YW50IHRoYXQgc2VwYXJhdGVzIHRoaXMgc3RhdGUgZnJvbSB0aGUgbmV4dC5cclxuICogV2hlcmUgdGhhdCB3b3VsZCBiZSBhbWJpZ3VvdXMgYmVjYXVzZSB3ZeKAmXJlIHNldHRpbmcgb3VyIGNsb2NrcyBiYWNrLCB0aGUgW1VOVElMXSBjb2x1bW4gc3BlY2lmaWVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBpbnN0YW50LlxyXG4gKiBUaGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSBsYXN0IGxpbmUsIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4sIGNvbnRpbnVlcyB0byB0aGUgcHJlc2VudC5cclxuICogVGhlIGZpcnN0IGxpbmUgdHlwaWNhbGx5IHNwZWNpZmllcyB0aGUgbWVhbiBzb2xhciB0aW1lIG9ic2VydmVkIGJlZm9yZSB0aGUgaW50cm9kdWN0aW9uIG9mIHN0YW5kYXJkIHRpbWUuIFNpbmNlIHRoZXJl4oCZcyBubyBsaW5lIGJlZm9yZVxyXG4gKiB0aGF0LCBpdCBoYXMgbm8gYmVnaW5uaW5nLiA4LSkgRm9yIHNvbWUgcGxhY2VzIG5lYXIgdGhlIEludGVybmF0aW9uYWwgRGF0ZSBMaW5lLCB0aGUgZmlyc3QgdHdvIGxpbmVzIHdpbGwgc2hvdyBzb2xhciB0aW1lcyBkaWZmZXJpbmcgYnlcclxuICogMjQgaG91cnM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBtb3ZlbWVudCBvZiB0aGUgRGF0ZSBMaW5lLiBGb3IgZXhhbXBsZTpcclxuICogIyBab25lXHROQU1FXHRcdEdNVE9GRlx0UlVMRVNcdEZPUk1BVFx0W1VOVElMXVxyXG4gKiBab25lIEFtZXJpY2EvSnVuZWF1XHQgMTU6MDI6MTkgLVx0TE1UXHQxODY3IE9jdCAxOFxyXG4gKiBcdFx0XHQgLTg6NTc6NDEgLVx0TE1UXHQuLi5cclxuICogV2hlbiBBbGFza2Egd2FzIHB1cmNoYXNlZCBmcm9tIFJ1c3NpYSBpbiAxODY3LCB0aGUgRGF0ZSBMaW5lIG1vdmVkIGZyb20gdGhlIEFsYXNrYS9DYW5hZGEgYm9yZGVyIHRvIHRoZSBCZXJpbmcgU3RyYWl0OyBhbmQgdGhlIHRpbWUgaW5cclxuICogQWxhc2thIHdhcyB0aGVuIDI0IGhvdXJzIGVhcmxpZXIgdGhhbiBpdCBoYWQgYmVlbi4gPGFzaWRlPig2IE9jdG9iZXIgaW4gdGhlIEp1bGlhbiBjYWxlbmRhciwgd2hpY2ggUnVzc2lhIHdhcyBzdGlsbCB1c2luZyB0aGVuIGZvclxyXG4gKiByZWxpZ2lvdXMgcmVhc29ucywgd2FzIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIGluc3RhbmNlIG9mIHRoZSBzYW1lIGRheSB3aXRoIGEgZGlmZmVyZW50IG5hbWUsIDE4IE9jdG9iZXIgaW4gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cclxuICogSXNu4oCZdCBjaXZpbCB0aW1lIHdvbmRlcmZ1bD8gOC0pKTwvYXNpZGU+XHJcbiAqIFRoZSBhYmJyZXZpYXRpb24sIOKAnExNVCzigJ0gc3RhbmRzIGZvciDigJxsb2NhbCBtZWFuIHRpbWUs4oCdIHdoaWNoIGlzIGFuIGludmVudGlvbiBvZiB0aGUgdHogZGF0YWJhc2UgYW5kIHdhcyBwcm9iYWJseSBuZXZlciBhY3R1YWxseVxyXG4gKiB1c2VkIGR1cmluZyB0aGUgcGVyaW9kLiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlIGlzIGFsbW9zdCBjZXJ0YWlubHkgd3JvbmcgZXhjZXB0IGluIHRoZSBhcmNoZXR5cGFsIHBsYWNlIGFmdGVyIHdoaWNoIHRoZSB6b25lIGlzIG5hbWVkLlxyXG4gKiAoVGhlIHR6IGRhdGFiYXNlIHVzdWFsbHkgZG9lc27igJl0IHByb3ZpZGUgYSBzZXBhcmF0ZSBab25lIHJlY29yZCBmb3IgcGxhY2VzIHdoZXJlIG5vdGhpbmcgc2lnbmlmaWNhbnQgaGFwcGVuZWQgYWZ0ZXIgMTk3MC4pXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgWm9uZUluZm8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdC8qKlxyXG5cdFx0ICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xyXG5cdFx0ICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXHJcblx0XHQgKiBpdCBpcyBvbmUgaG91ciBhaGVhZCBvZiBVVENcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGdtdG9mZjogRHVyYXRpb24sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XHJcblx0XHQgKiBBIGh5cGhlbiwgYSBraW5kIG9mIG51bGwgdmFsdWUsIG1lYW5zIHRoYXQgd2UgaGF2ZSBub3Qgc2V0IG91ciBjbG9ja3MgYWhlYWQgb2Ygc3RhbmRhcmQgdGltZS5cclxuXHRcdCAqIEFuIGFtb3VudCBvZiB0aW1lICh1c3VhbGx5IGJ1dCBub3QgbmVjZXNzYXJpbHkg4oCcMTowMOKAnSBtZWFuaW5nIG9uZSBob3VyKSBtZWFucyB0aGF0IHdlIGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQgYnkgdGhhdCBhbW91bnQuXHJcblx0XHQgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcclxuXHRcdCAqIHRoZSBuYW1lIG9mIHdoaWNoIGlzIHRoZSBnaXZlbiBhbHBoYWJldGljIHN0cmluZy5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVUeXBlOiBSdWxlVHlwZSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgcnVsZU9mZnNldDogRHVyYXRpb24sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgcnVsZU5hbWU6IHN0cmluZyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XHJcblx0XHQgKiB0aGUgc3RyaW5nLCDigJx6enos4oCdIHdoaWNoIGlzIGEga2luZCBvZiBudWxsIHZhbHVlIChkb27igJl0IGFzaylcclxuXHRcdCAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cclxuXHRcdCAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cclxuXHRcdCAqIGZvciB0aGUgc3RhbmRhcmQgdGltZSBuYW1lIGFuZCB0aGUgc2Vjb25kIHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uIGZvciB0aGUgZGF5bGlnaHQgc2F2aW5nIHRpbWUgbmFtZVxyXG5cdFx0ICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgZm9ybWF0OiBzdHJpbmcsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXHJcblx0XHQgKiBhbmQgZXhjbHVkaW5nIHRoaXMgdGltZXN0YW1wLlxyXG5cdFx0ICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSBOVUxMIChmb3IgdGhlIGZpcnN0IHJ1bGUpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB1bnRpbDogbnVtYmVyXHJcblx0KSB7XHJcblx0XHRpZiAodGhpcy5ydWxlT2Zmc2V0KSB7XHJcblx0XHRcdHRoaXMucnVsZU9mZnNldCA9IHRoaXMucnVsZU9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblxyXG5lbnVtIFR6TW9udGhOYW1lcyB7XHJcblx0SmFuID0gMSxcclxuXHRGZWIgPSAyLFxyXG5cdE1hciA9IDMsXHJcblx0QXByID0gNCxcclxuXHRNYXkgPSA1LFxyXG5cdEp1biA9IDYsXHJcblx0SnVsID0gNyxcclxuXHRBdWcgPSA4LFxyXG5cdFNlcCA9IDksXHJcblx0T2N0ID0gMTAsXHJcblx0Tm92ID0gMTEsXHJcblx0RGVjID0gMTJcclxufVxyXG5cclxuZnVuY3Rpb24gbW9udGhOYW1lVG9TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDw9IDEyOyArK2kpIHtcclxuXHRcdGlmIChUek1vbnRoTmFtZXNbaV0gPT09IG5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIGk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0aWYgKHRydWUpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGggbmFtZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIpO1xyXG5cdH1cclxufVxyXG5cclxuZW51bSBUekRheU5hbWVzIHtcclxuXHRTdW4gPSAwLFxyXG5cdE1vbiA9IDEsXHJcblx0VHVlID0gMixcclxuXHRXZWQgPSAzLFxyXG5cdFRodSA9IDQsXHJcblx0RnJpID0gNSxcclxuXHRTYXQgPSA2XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBhIHZhbGlkIG9mZnNldCBzdHJpbmcgaS5lLlxyXG4gKiAxLCAtMSwgKzEsIDAxLCAxOjAwLCAxOjIzOjI1LjE0M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0cmV0dXJuIC9eKFxcLXxcXCspPyhbMC05XSsoKFxcOlswLTldKyk/KFxcOlswLTldKyhcXC5bMC05XSspPyk/KSkkLy50ZXN0KHMpO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIG1vbWVudCBhdCB3aGljaCB0aGUgZ2l2ZW4gcnVsZSBiZWNvbWVzIHZhbGlkXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbiB7XHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIFRyYW5zaXRpb24gdGltZSBpbiBVVEMgbWlsbGlzXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdDogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBOZXcgb2Zmc2V0ICh0eXBlIG9mIG9mZnNldCBkZXBlbmRzIG9uIHRoZSBmdW5jdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9mZnNldDogRHVyYXRpb24sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBOZXcgdGltem9uZSBhYmJyZXZpYXRpb24gbGV0dGVyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xyXG5cclxuXHRcdCkge1xyXG5cdFx0aWYgKHRoaXMub2Zmc2V0KSB7XHJcblx0XHRcdHRoaXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogT3B0aW9uIGZvciBUekRhdGFiYXNlI25vcm1hbGl6ZUxvY2FsKClcclxuICovXHJcbmV4cG9ydCBlbnVtIE5vcm1hbGl6ZU9wdGlvbiB7XHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBBRERJTkcgdGhlIERTVCBvZmZzZXRcclxuXHQgKi9cclxuXHRVcCxcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0RG93blxyXG59XHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxyXG4gKiBZb3UgdXN1YWxseSBkbyBub3QgbmVlZCB0byB1c2UgdGhpcyBkaXJlY3RseSwgdXNlIFRpbWVab25lIGFuZCBEYXRlVGltZSBpbnN0ZWFkLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFR6RGF0YWJhc2Uge1xyXG5cclxuXHQvKipcclxuXHQgKiBTaW5nbGUgaW5zdGFuY2UgbWVtYmVyXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBUekRhdGFiYXNlID0gbnVsbDtcclxuXHJcblx0LyoqXHJcblx0ICogKHJlLSkgaW5pdGlhbGl6ZSB0aW1lem9uZWNvbXBsZXRlIHdpdGggdGltZSB6b25lIGRhdGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRhIFRaIGRhdGEgYXMgSlNPTiBvYmplY3QgKGZyb20gb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMpLlxyXG5cdCAqICAgICAgICAgICAgIElmIG5vdCBnaXZlbiwgVGltZXpvbmVjb21wbGV0ZSB3aWxsIHNlYXJjaCBmb3IgaW5zdGFsbGVkIG1vZHVsZXMuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBpbml0KGRhdGE/OiBhbnkgfCBhbnlbXSk6IHZvaWQge1xyXG5cdFx0aWYgKGRhdGEpIHtcclxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcblx0XHRcdFR6RGF0YWJhc2UuaW5zdGFuY2UoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBvZiB0aGlzIGRhdGFiYXNlXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBpbnN0YW5jZSgpOiBUekRhdGFiYXNlIHtcclxuXHRcdGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuXHRcdFx0Y29uc3QgZGF0YTogYW55W10gPSBbXTtcclxuXHRcdFx0Ly8gdHJ5IHRvIGZpbmQgVFogZGF0YSBpbiBnbG9iYWwgdmFyaWFibGVzXHJcblx0XHRcdGNvbnN0IGc6IGFueSA9IChnbG9iYWwgPyBnbG9iYWwgOiB3aW5kb3cpO1xyXG5cdFx0XHRpZiAoZykge1xyXG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGcpKSB7XHJcblx0XHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoXCJ0emRhdGFcIikgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xyXG5cdFx0XHRcdFx0XHRcdGRhdGEucHVzaChnW2tleV0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgYXMgaW5zdGFsbGVkIE5QTSBtb2R1bGVzXHJcblx0XHRcdGNvbnN0IGZpbmROb2RlTW9kdWxlcyA9IChyZXF1aXJlOiBhbnkpOiB2b2lkID0+IHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxyXG5cdFx0XHRcdFx0Y29uc3QgdHpEYXRhTmFtZSA9IFwidHpkYXRhXCI7XHJcblx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZSh0ekRhdGFOYW1lKTsgLy8gdXNlIHZhcmlhYmxlIHRvIGF2b2lkIGJyb3dzZXJpZnkgYWN0aW5nIHVwXHJcblx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0Ly8gdGhlbiB0cnkgc3Vic2V0c1xyXG5cdFx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZXM6IHN0cmluZ1tdID0gW1xyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hZnJpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYW50YXJjdGljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hc2lhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWJhY2t3YXJkXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1ldGNldGVyYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1ldXJvcGVcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLXBhY2lmaWNuZXdcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLXN5c3RlbXZcIlxyXG5cdFx0XHRcdFx0XTtcclxuXHRcdFx0XHRcdGNvbnN0IGV4aXN0aW5nOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRcdFx0Y29uc3QgZXhpc3RpbmdQYXRoczogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRcdG1vZHVsZU5hbWVzLmZvckVhY2goKG1vZHVsZU5hbWU6IHN0cmluZyk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGQgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdGRhdGEucHVzaChkKTtcclxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0XHRcdGZpbmROb2RlTW9kdWxlcyhyZXF1aXJlKTsgLy8gbmVlZCB0byBwdXQgcmVxdWlyZSBpbnRvIGEgZnVuY3Rpb24gdG8gbWFrZSB3ZWJwYWNrIGhhcHB5XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoZGF0YSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVHpEYXRhYmFzZS5faW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgZGF0YWJhc2UgZGF0YVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RhdGE6IGFueTtcclxuXHJcblx0LyoqXHJcblx0ICogQ2FjaGVkIG1pbi9tYXggRFNUIHZhbHVlc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX21pbm1heDogTWluTWF4SW5mbztcclxuXHJcblx0LyoqXHJcblx0ICogQ2FjaGVkIHpvbmUgbmFtZXNcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lTmFtZXM6IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciAtIGRvIG5vdCB1c2UsIHRoaXMgaXMgYSBzaW5nbGV0b24gY2xhc3MuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKCkgaW5zdGVhZFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgY29uc3RydWN0b3IoZGF0YTogYW55W10pIHtcclxuXHRcdGFzc2VydCghVHpEYXRhYmFzZS5faW5zdGFuY2UsIFwiWW91IHNob3VsZCBub3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBUekRhdGFiYXNlIGNsYXNzIHlvdXJzZWxmLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpXCIpO1xyXG5cdFx0YXNzZXJ0KGRhdGEubGVuZ3RoID4gMCxcclxuXHRcdFx0XCJUaW1lem9uZWNvbXBsZXRlIG5lZWRzIHRpbWUgem9uZSBkYXRhLiBZb3UgbmVlZCB0byBpbnN0YWxsIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzIGJlZm9yZSB1c2luZyB0aW1lem9uZWNvbXBsZXRlLlwiXHJcblx0XHQpO1xyXG5cdFx0aWYgKGRhdGEubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcclxuXHRcdFx0ZGF0YS5mb3JFYWNoKChkOiBhbnkpOiB2b2lkID0+IHtcclxuXHRcdFx0XHRpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcclxuXHRcdFx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGQucnVsZXMpKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEucnVsZXNba2V5XSA9IGQucnVsZXNba2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGQuem9uZXMpKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fbWlubWF4ID0gdmFsaWRhdGVEYXRhKHRoaXMuX2RhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVOYW1lcygpOiBzdHJpbmdbXSB7XHJcblx0XHRpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG5cdFx0XHR0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuXHRcdFx0dGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl96b25lTmFtZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXhpc3RzKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG5cdCAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cclxuXHQgKlxyXG5cdCAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcblx0ICovXHJcblx0cHVibGljIG1pbkRzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAoem9uZU5hbWUpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0XHRsZXQgcmVzdWx0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRcdGNvbnN0IHJ1bGVOYW1lczogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcblx0XHRcdFx0XHRcdGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRjb25zdCB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnNhdmUubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uID0gbnVsbDtcclxuXHRcdFx0Y29uc3QgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XHJcblx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHRlbXBbal07XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAoIXJlc3VsdCkge1xyXG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5tYXhEc3RTYXZlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXHJcblx0ICovXHJcblx0cHVibGljIGhhc0RzdCh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMubWF4RHN0U2F2ZSh6b25lTmFtZSkubWlsbGlzZWNvbmRzKCkgIT09IDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmlyc3QgRFNUIGNoYW5nZSBtb21lbnQgQUZURVIgdGhlIGdpdmVuIFVUQyBkYXRlIGluIFVUQyBtaWxsaXNlY29uZHMsIHdpdGhpbiBvbmUgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IG51bWJlcik6IG51bWJlcjtcclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0KTogbnVtYmVyO1xyXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIGE6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0bGV0IHpvbmVJbmZvOiBab25lSW5mbztcclxuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgem9uZSBpbmZvcyBmb3IgW2RhdGUsIGRhdGUrMXllYXIpXHJcblx0XHRjb25zdCBhbGxab25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRjb25zdCByZWxldmFudFpvbmVJbmZvczogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0Y29uc3QgcmFuZ2VTdGFydDogbnVtYmVyID0gdXRjVGltZS51bml4TWlsbGlzO1xyXG5cdFx0Y29uc3QgcmFuZ2VFbmQ6IG51bWJlciA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xyXG5cdFx0bGV0IHByZXZFbmQ6IG51bWJlciA9IG51bGw7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR6b25lSW5mbyA9IGFsbFpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKChwcmV2RW5kID09PSBudWxsIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gcmFuZ2VTdGFydCkpIHtcclxuXHRcdFx0XHRyZWxldmFudFpvbmVJbmZvcy5wdXNoKHpvbmVJbmZvKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2RW5kID0gem9uZUluZm8udW50aWw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY29sbGVjdCBhbGwgdHJhbnNpdGlvbnMgaW4gdGhlIHpvbmVzIGZvciB0aGUgeWVhclxyXG5cdFx0bGV0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVsZXZhbnRab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0em9uZUluZm8gPSByZWxldmFudFpvbmVJbmZvc1tpXTtcclxuXHRcdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0XHR0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdChcclxuXHRcdFx0XHR0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZilcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdHRyYW5zaXRpb25zLnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBmaXJzdCBhZnRlciB0aGUgZ2l2ZW4gZGF0ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBvZmZzZXRcclxuXHRcdGxldCBwcmV2U2F2ZTogRHVyYXRpb24gPSBudWxsO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICghcHJldlNhdmUgfHwgIXByZXZTYXZlLmVxdWFscyh0cmFuc2l0aW9uLm9mZnNldCkpIHtcclxuXHRcdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA+IHV0Y1RpbWUudW5peE1pbGxpcykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRyYW5zaXRpb24uYXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZTYXZlID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xyXG5cdCAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxyXG5cdCAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZUlzVXRjKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nL3N1YnRyYWN0aW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRBIGxvY2FsIHRpbWUsIGVpdGhlciBhcyBhIFRpbWVTdHJ1Y3Qgb3IgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5cdFRoZSBub3JtYWxpemVkIHRpbWUsIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgbG9jYWxUaW1lIHBhcmFtZXRlciAoVGltZVN0cnVjdCBvciB1bml4IG1pbGxpcylcclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xyXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cdFx0XHQvLyBsb2NhbCB0aW1lcyBiZWhhdmUgbGlrZSB0aGlzIGR1cmluZyBEU1QgY2hhbmdlczpcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDNcclxuXHJcblx0XHRcdC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcblx0XHRcdC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG5cclxuXHRcdFx0Ly8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXHJcblx0XHRcdFx0em9uZU5hbWUsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0Ly8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcclxuXHRcdFx0bGV0IHByZXY6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdFx0Ly8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLm9mZnNldC5ncmVhdGVyVGhhbihwcmV2KSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxCZWZvcmU6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyBwcmV2Lm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxBZnRlcjogbnVtYmVyID0gdHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0aWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xyXG5cdFx0XHRcdFx0XHQvLyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0XHRcdFx0XHRjb25zdCBmYWN0b3I6IG51bWJlciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBUaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHQvLyBubyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IGEgOiBhLmNsb25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0KHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDoge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuUnVsZU5hbWU6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSB0aGlzLmRzdE9mZnNldEZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZHN0T2Zmc2V0LmFkZCh6b25lSW5mby5nbXRvZmYpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxyXG5cdCAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XHJcblx0ICogYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgYWJicmV2aWF0aW9ucy4gVGhleSBhbHNvIGNoYW5nZSB3aXRoIERTVDogZS5nLiBDRVNUIG9yIENFVC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQyB1bml4IG1pbGxpc2Vjb25kc1xyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XHJcblx0ICovXHJcblx0cHVibGljIGFiYnJldmlhdGlvbih6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG5cdFx0Y29uc3QgZm9ybWF0OiBzdHJpbmcgPSB6b25lSW5mby5mb3JtYXQ7XHJcblxyXG5cdFx0Ly8gaXMgZm9ybWF0IGRlcGVuZGVudCBvbiBEU1Q/XHJcblx0XHRpZiAoZm9ybWF0LmluZGV4T2YoXCIlc1wiKSAhPT0gLTFcclxuXHRcdFx0JiYgem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcblx0XHRcdGxldCBsZXR0ZXI6IHN0cmluZztcclxuXHRcdFx0Ly8gcGxhY2UgaW4gZm9ybWF0IHN0cmluZ1xyXG5cdFx0XHRpZiAoZHN0RGVwZW5kZW50KSB7XHJcblx0XHRcdFx0bGV0dGVyID0gdGhpcy5sZXR0ZXJGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZvcm1hdC5yZXBsYWNlKFwiJXNcIiwgbGV0dGVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZm9ybWF0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLCBhZ2FpbiBleGNsdWRpbmcgRFNULlxyXG5cdCAqXHJcblx0ICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxyXG5cdCAqIHRoZW4gdGhlIGZpcnN0IG9jY3VycmVuY2UgaXMgcmV0dXJuZWQuXHJcblx0ICpcclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IGxvY2FsVGltZSA6IGxvY2FsVGltZS51bml4TWlsbGlzKTtcclxuXHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG5cdCAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBVVEMgdGltZXMgYW5kIHRoZXJlZm9yZSBtdWx0aXBsZSBvZmZzZXRzIGZvciBhIGxvY2FsIHRpbWVcclxuXHQgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHRzOiBUaW1lU3RydWN0ID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUpIDogbG9jYWxUaW1lKTtcclxuXHRcdGNvbnN0IG5vcm1hbGl6ZWRUbTogVGltZVN0cnVjdCA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcclxuXHJcblx0XHQvLy8gTm90ZTogZHVyaW5nIG9mZnNldCBjaGFuZ2VzLCBsb2NhbCB0aW1lIGNhbiBiZWhhdmUgbGlrZTpcclxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXHJcblxyXG5cdFx0Ly8gVGhlcmVmb3JlIGJpbmFyeSBzZWFyY2ggZG9lcyBub3QgYXBwbHkuIExpbmVhciBzZWFyY2ggdGhyb3VnaCB0cmFuc2l0aW9uc1xyXG5cdFx0Ly8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG5cclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKFxyXG5cdFx0XHR6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxXHJcblx0XHQpO1xyXG5cdFx0bGV0IHByZXY6IFRyYW5zaXRpb24gPSBudWxsO1xyXG5cdFx0bGV0IHByZXZQcmV2OiBUcmFuc2l0aW9uID0gbnVsbDtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHQvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2UHJldiA9IHByZXY7XHJcblx0XHRcdHByZXYgPSB0cmFuc2l0aW9uO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcblx0XHRpZiAocHJldikge1xyXG5cdFx0XHQvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcclxuXHRcdFx0aWYgKHByZXZQcmV2ICYmIHByZXZQcmV2Lm9mZnNldC5ncmVhdGVyVGhhbihwcmV2Lm9mZnNldCkpIHtcclxuXHRcdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2VcclxuXHRcdFx0XHRjb25zdCBkaWZmID0gcHJldlByZXYub2Zmc2V0LnN1YihwcmV2Lm9mZnNldCk7XHJcblx0XHRcdFx0aWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG5cdFx0XHRcdFx0JiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgKyBkaWZmLm1pbGxpc2Vjb25kcygpKSB7XHJcblx0XHRcdFx0XHQvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXHJcblx0XHRcdFx0XHRyZXR1cm4gcHJldlByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdGhpcyBjYW5ub3QgaGFwcGVuIGFzIHRoZSB0cmFuc2l0aW9ucyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYSB0cmFuc2l0aW9uIGF0IHRoZVxyXG5cdFx0XHQvLyBiZWdpbm5pbmcgb2YgdGhlIHJlcXVlc3RlZCBmcm9tWWVhclxyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBEU1Qgb2Zmc2V0IChXSVRIT1VUIHRoZSBzdGFuZGFyZCB6b25lIG9mZnNldCkgZm9yIHRoZSBnaXZlblxyXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgZHN0T2Zmc2V0Rm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcblxyXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxyXG5cdFx0XHRydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldFxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uID0gbnVsbDtcclxuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuXHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb2Zmc2V0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXHJcblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXAgYXMgVGltZVN0cnVjdCBvciB1bml4IG1pbGxpc1xyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGxldHRlckZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHRzOiBUaW1lU3RydWN0ID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lKTtcclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0cnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXRcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgPSBudWxsO1xyXG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG5cdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIWxldHRlcikge1xyXG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuXHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbGV0dGVyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHRoZSBydWxlIHNldFxyXG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Zmlyc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcblx0ICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IFRyYW5zaXRpb25bXSB7XHJcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG5cclxuXHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcclxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XHJcblxyXG5cdFx0Zm9yIChsZXQgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XHJcblx0XHRcdGxldCBwcmV2SW5mbzogUnVsZUluZm8gPSBudWxsO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVJbmZvcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IHJ1bGVJbmZvOiBSdWxlSW5mbyA9IHJ1bGVJbmZvc1tpXTtcclxuXHRcdFx0XHRpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24oXHJcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHksIHN0YW5kYXJkT2Zmc2V0LCBwcmV2SW5mbyksXHJcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLnNhdmUsXHJcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLmxldHRlcikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRwcmV2SW5mbyA9IHJ1bGVJbmZvO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cclxuXHQgKiBBZGRzIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBpZiB0aGVyZSBpcyBubyB6b25lIGNoYW5nZSB3aXRoaW4gdGhlIHJhbmdlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Rmlyc3QgeWVhciB0byBpbmNsdWRlXHJcblx0ICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIGluY2x1ZGVcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIpOiBUcmFuc2l0aW9uW10ge1xyXG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuXHJcblx0XHRjb25zdCBzdGFydE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogZnJvbVllYXIgfSk7XHJcblx0XHRjb25zdCBlbmRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IHRvWWVhciArIDEgfSk7XHJcblxyXG5cclxuXHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGFzc2VydCh6b25lSW5mb3MubGVuZ3RoID4gMCwgXCJFbXB0eSB6b25lSW5mb3MgYXJyYXkgcmV0dXJuZWQgZnJvbSBnZXRab25lSW5mb3MoKVwiKTtcclxuXHJcblx0XHRjb25zdCByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cclxuXHRcdGxldCBwcmV2Wm9uZTogWm9uZUluZm8gPSBudWxsO1xyXG5cdFx0bGV0IHByZXZVbnRpbFllYXI6IG51bWJlcjtcclxuXHRcdGxldCBwcmV2U3RkT2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0bGV0IHByZXZEc3RPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRsZXQgcHJldkxldHRlcjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRjb25zdCB1bnRpbFllYXI6IG51bWJlciA9IHpvbmVJbmZvLnVudGlsID8gbmV3IFRpbWVTdHJ1Y3Qoem9uZUluZm8udW50aWwpLmNvbXBvbmVudHMueWVhciA6IHRvWWVhciArIDE7XHJcblx0XHRcdHZhciBzdGRPZmZzZXQ6IER1cmF0aW9uID0gcHJldlN0ZE9mZnNldDtcclxuXHRcdFx0dmFyIGRzdE9mZnNldDogRHVyYXRpb24gPSBwcmV2RHN0T2Zmc2V0O1xyXG5cdFx0XHR2YXIgbGV0dGVyOiBzdHJpbmcgPSBwcmV2TGV0dGVyO1xyXG5cclxuXHRcdFx0Ly8gem9uZSBhcHBsaWNhYmxlP1xyXG5cdFx0XHRpZiAoKHByZXZab25lID09PSBudWxsIHx8IHByZXZab25lLnVudGlsIDwgZW5kTWlsbGlzIC0gMSlcclxuXHRcdFx0XHQmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XHJcblxyXG5cdFx0XHRcdHN0ZE9mZnNldCA9IHpvbmVJbmZvLmdtdG9mZjtcclxuXHJcblx0XHRcdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOlxyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG5cdFx0XHRcdFx0XHQvLyBjaGVjayB3aGV0aGVyIHRoZSBmaXJzdCBydWxlIHRha2VzIGVmZmVjdCBpbW1lZGlhdGVseSBvbiB0aGUgem9uZSB0cmFuc2l0aW9uXHJcblx0XHRcdFx0XHRcdC8vIChlLmcuIEx5YmlhKVxyXG5cdFx0XHRcdFx0XHRpZiAocHJldlpvbmUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mb3M6IFJ1bGVJbmZvW10gPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBydWxlSW5mb3MubGVuZ3RoOyArK2opIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvID0gcnVsZUluZm9zW2pdO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUocHJldlVudGlsWWVhcikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgbnVsbCkgPT09IHByZXZab25lLnVudGlsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdGNvbnN0IGF0OiBudW1iZXIgPSAocHJldlpvbmUgPyBwcmV2Wm9uZS51bnRpbCA6IHN0YXJ0TWlsbGlzKTtcclxuXHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihhdCwgc3RkT2Zmc2V0LmFkZChkc3RPZmZzZXQpLCBsZXR0ZXIpKTtcclxuXHJcblx0XHRcdFx0Ly8gYWRkIHRyYW5zaXRpb25zIGZvciB0aGUgem9uZSBydWxlcyBpbiB0aGUgcmFuZ2VcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcblx0XHRcdFx0XHRjb25zdCBkc3RUcmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXHJcblx0XHRcdFx0XHRcdHpvbmVJbmZvLnJ1bGVOYW1lLFxyXG5cdFx0XHRcdFx0XHRwcmV2VW50aWxZZWFyICE9PSB1bmRlZmluZWQgPyBNYXRoLm1heChwcmV2VW50aWxZZWFyLCBmcm9tWWVhcikgOiBmcm9tWWVhcixcclxuXHRcdFx0XHRcdFx0TWF0aC5taW4odW50aWxZZWFyLCB0b1llYXIpLFxyXG5cdFx0XHRcdFx0XHRzdGRPZmZzZXRcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IGRzdFRyYW5zaXRpb25zLmxlbmd0aDsgKytrKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSBkc3RUcmFuc2l0aW9uc1trXTtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbih0cmFuc2l0aW9uLmF0LCB0cmFuc2l0aW9uLm9mZnNldC5hZGQoc3RkT2Zmc2V0KSwgdHJhbnNpdGlvbi5sZXR0ZXIpKTtcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwcmV2Wm9uZSA9IHpvbmVJbmZvO1xyXG5cdFx0XHRwcmV2VW50aWxZZWFyID0gdW50aWxZZWFyO1xyXG5cdFx0XHRwcmV2U3RkT2Zmc2V0ID0gc3RkT2Zmc2V0O1xyXG5cdFx0XHRwcmV2RHN0T2Zmc2V0ID0gZHN0T2Zmc2V0O1xyXG5cdFx0XHRwcmV2TGV0dGVyID0gbGV0dGVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSB6b25lIGluZm8gZm9yIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLiBUaHJvd3MgaWYgbm90IGZvdW5kLlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZSBzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kcyBvciBhcyBhIFRpbWVTdHJ1Y3RcclxuXHQgKiBAcmV0dXJuc1x0Wm9uZUluZm8gb2JqZWN0LiBEbyBub3QgY2hhbmdlLCB3ZSBjYWNoZSB0aGlzIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0Wm9uZUluZm8oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IFpvbmVJbmZvIHtcclxuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyB1dGNUaW1lIDogdXRjVGltZS51bml4TWlsbGlzKTtcclxuXHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPiB1bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFpvbmVJbmZvW10gfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXHJcblx0ICogZm9sbG93aW5nIGFueSBsaW5rcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxyXG5cdCAqIEByZXR1cm4gQXJyYXkgb2Ygem9uZSBpbmZvcy4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0Wm9uZUluZm9zKHpvbmVOYW1lOiBzdHJpbmcpOiBab25lSW5mb1tdIHtcclxuXHRcdC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGFrZSBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0bGV0IGFjdHVhbFpvbmVOYW1lOiBzdHJpbmcgPSB6b25lTmFtZTtcclxuXHRcdGxldCB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHQvLyBmb2xsb3cgbGlua3NcclxuXHRcdHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXHJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cdFx0Ly8gZmluYWwgem9uZSBpbmZvIGZvdW5kXHJcblx0XHRmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgem9uZUVudHJpZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUVudHJ5ID0gem9uZUVudHJpZXNbaV07XHJcblx0XHRcdGNvbnN0IHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xyXG5cdFx0XHRsZXQgdW50aWw6IG51bWJlciA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuXHRcdFx0aWYgKGlzTmFOKHVudGlsKSkge1xyXG5cdFx0XHRcdHVudGlsID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFpvbmVJbmZvKFxyXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQgPyBuZXcgRHVyYXRpb24oem9uZUVudHJ5WzFdKSA6IG5ldyBEdXJhdGlvbigpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsXHJcblx0XHRcdFx0em9uZUVudHJ5WzJdLFxyXG5cdFx0XHRcdHVudGlsXHJcblx0XHRcdCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBab25lSW5mbywgYjogWm9uZUluZm8pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHQvLyBzb3J0IG51bGwgbGFzdFxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsICE9PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAoYS51bnRpbCAtIGIudW50aWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3J1bGVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBSdWxlSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgcnVsZSBzZXQgd2l0aCB0aGUgZ2l2ZW4gcnVsZSBuYW1lLFxyXG5cdCAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHJ1bGUgc2V0XHJcblx0ICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0UnVsZUluZm9zKHJ1bGVOYW1lOiBzdHJpbmcpOiBSdWxlSW5mb1tdIHtcclxuXHRcdC8vIHZhbGlkYXRlIG5hbWUgQkVGT1JFIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0aWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJldHVybiBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogUnVsZUluZm9bXSA9IFtdO1xyXG5cdFx0Y29uc3QgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBydWxlU2V0Lmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHJ1bGUgPSBydWxlU2V0W2ldO1xyXG5cclxuXHRcdFx0Y29uc3QgZnJvbVllYXI6IG51bWJlciA9IChydWxlWzBdID09PSBcIk5hTlwiID8gLTEwMDAwIDogcGFyc2VJbnQocnVsZVswXSwgMTApKTtcclxuXHRcdFx0Y29uc3QgdG9UeXBlOiBUb1R5cGUgPSB0aGlzLnBhcnNlVG9UeXBlKHJ1bGVbMV0pO1xyXG5cdFx0XHRjb25zdCB0b1llYXI6IG51bWJlciA9ICh0b1R5cGUgPT09IFRvVHlwZS5NYXggPyAwIDogKHJ1bGVbMV0gPT09IFwib25seVwiID8gZnJvbVllYXIgOiBwYXJzZUludChydWxlWzFdLCAxMCkpKTtcclxuXHRcdFx0Y29uc3Qgb25UeXBlOiBPblR5cGUgPSB0aGlzLnBhcnNlT25UeXBlKHJ1bGVbNF0pO1xyXG5cdFx0XHRjb25zdCBvbkRheTogbnVtYmVyID0gdGhpcy5wYXJzZU9uRGF5KHJ1bGVbNF0sIG9uVHlwZSk7XHJcblx0XHRcdGNvbnN0IG9uV2Vla0RheTogV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XHJcblx0XHRcdGNvbnN0IG1vbnRoTmFtZTogc3RyaW5nID0gPHN0cmluZz5ydWxlWzNdO1xyXG5cdFx0XHRjb25zdCBtb250aE51bWJlcjogbnVtYmVyID0gbW9udGhOYW1lVG9TdHJpbmcobW9udGhOYW1lKTtcclxuXHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhcclxuXHRcdFx0XHRmcm9tWWVhcixcclxuXHRcdFx0XHR0b1R5cGUsXHJcblx0XHRcdFx0dG9ZZWFyLFxyXG5cdFx0XHRcdHJ1bGVbMl0sXHJcblx0XHRcdFx0bW9udGhOdW1iZXIsXHJcblx0XHRcdFx0b25UeXBlLFxyXG5cdFx0XHRcdG9uRGF5LFxyXG5cdFx0XHRcdG9uV2Vla0RheSxcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLFxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksXHJcblx0XHRcdFx0dGhpcy5wYXJzZUF0VHlwZShydWxlWzVdWzNdKSxcclxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksXHJcblx0XHRcdFx0cnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XVxyXG5cdFx0XHRcdCkpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogUnVsZUluZm8sIGI6IFJ1bGVJbmZvKTogbnVtYmVyID0+IHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH0gZWxzZSBpZiAoYS5lZmZlY3RpdmVMZXNzKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlUnVsZVR5cGUocnVsZTogc3RyaW5nKTogUnVsZVR5cGUge1xyXG5cdFx0aWYgKHJ1bGUgPT09IFwiLVwiKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5Ob25lO1xyXG5cdFx0fSBlbHNlIGlmIChpc1ZhbGlkT2Zmc2V0U3RyaW5nKHJ1bGUpKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5PZmZzZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlVG9UeXBlKHRvOiBzdHJpbmcpOiBUb1R5cGUge1xyXG5cdFx0aWYgKHRvID09PSBcIm1heFwiKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuTWF4O1xyXG5cdFx0fSBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcclxuXHRcdH0gZWxzZSBpZiAoIWlzTmFOKHBhcnNlSW50KHRvLCAxMCkpKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6IFwiICsgdG8pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgT04gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25UeXBlKG9uOiBzdHJpbmcpOiBPblR5cGUge1xyXG5cdFx0aWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkxhc3RYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5MZXFYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI+PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5HcmVxWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25EYXkob246IHN0cmluZywgb25UeXBlOiBPblR5cGUpOiBudW1iZXIge1xyXG5cdFx0c3dpdGNoIChvblR5cGUpIHtcclxuXHRcdFx0Y2FzZSBPblR5cGUuRGF5TnVtOiByZXR1cm4gcGFyc2VJbnQob24sIDEwKTtcclxuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPj1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25XZWVrRGF5KG9uOiBzdHJpbmcpOiBXZWVrRGF5IHtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcblx0XHRcdGlmIChvbi5pbmRleE9mKFR6RGF5TmFtZXNbaV0pICE9PSAtMSkge1xyXG5cdFx0XHRcdHJldHVybiA8V2Vla0RheT5pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gV2Vla0RheS5TdW5kYXk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlQXRUeXBlKGF0OiBhbnkpOiBBdFR5cGUge1xyXG5cdFx0c3dpdGNoIChhdCkge1xyXG5cdFx0XHRjYXNlIFwic1wiOiByZXR1cm4gQXRUeXBlLlN0YW5kYXJkO1xyXG5cdFx0XHRjYXNlIFwidVwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcImdcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJ6XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwid1wiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGNhc2UgXCJcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn1cclxuXHJcbmludGVyZmFjZSBNaW5NYXhJbmZvIHtcclxuXHRtaW5Ec3RTYXZlOiBudW1iZXI7XHJcblx0bWF4RHN0U2F2ZTogbnVtYmVyO1xyXG5cdG1pbkdtdE9mZjogbnVtYmVyO1xyXG5cdG1heEdtdE9mZjogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXR5IGNoZWNrIG9uIGRhdGEuIFJldHVybnMgbWluL21heCB2YWx1ZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YTogYW55KTogTWluTWF4SW5mbyB7XHJcblx0Y29uc3QgcmVzdWx0OiBNaW5NYXhJbmZvID0ge1xyXG5cdFx0bWluRHN0U2F2ZTogbnVsbCxcclxuXHRcdG1heERzdFNhdmU6IG51bGwsXHJcblx0XHRtaW5HbXRPZmY6IG51bGwsXHJcblx0XHRtYXhHbXRPZmY6IG51bGxcclxuXHR9O1xyXG5cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyBydWxlcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIikpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgem9uZXNcclxuXHRmb3IgKGxldCB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XHJcblx0XHRpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHRcdGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0Ly8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSg8c3RyaW5nPnpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyA8c3RyaW5nPnpvbmVBcnIgKyBcIlxcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoem9uZUFycikpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGVudHJ5OiBhbnkgPSB6b25lQXJyW2ldO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbnN0IGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoaXNOYU4oZ210b2ZmKSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHNlY29uZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzJdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiB0aGlyZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzNdICE9PSBcInN0cmluZ1wiICYmIGVudHJ5WzNdICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4R210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluR210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA8IHJlc3VsdC5taW5HbXRPZmYpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkdtdE9mZiA9IGdtdG9mZjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIHZhbGlkYXRlIHJ1bGVzXHJcblx0Zm9yIChsZXQgcnVsZU5hbWUgaW4gZGF0YS5ydWxlcykge1xyXG5cdFx0aWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcblx0XHRcdGNvbnN0IHJ1bGVBcnI6IGFueSA9IGRhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHJ1bGUgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZUFyci5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IHJ1bGUgPSBydWxlQXJyW2ldO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGUpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZS5sZW5ndGggPCA4KSB7IC8vIG5vdGUgc29tZSBydWxlcyA+IDggZXhpc3RzIGJ1dCB0aGF0IHNlZW1zIHRvIGJlIGEgYnVnIGluIHR6IGZpbGUgcGFyc2luZ1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbMV0gIT09IFwib25seVwiICYmIHJ1bGVbMV0gIT09IFwibWF4XCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVsxXSBpcyBub3QgYSBudW1iZXIsIG9ubHkgb3IgbWF4XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIVR6TW9udGhOYW1lcy5oYXNPd25Qcm9wZXJ0eShydWxlWzNdKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxyXG5cdFx0XHRcdFx0JiYgcnVsZVs0XS5pbmRleE9mKFwiPD1cIikgPT09IC0xICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbNF0sIDEwKSlcclxuXHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IG9mIGxlbmd0aCA0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMl0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVs1XVszXSAhPT0gXCJcIiAmJiBydWxlWzVdWzNdICE9PSBcInNcIiAmJiBydWxlWzVdWzNdICE9PSBcIndcIlxyXG5cdFx0XHRcdFx0JiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29uc3Qgc2F2ZTogbnVtYmVyID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihzYXZlKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc2F2ZSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhEc3RTYXZlID09PSBudWxsIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5Ec3RTYXZlID0gc2F2ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2RhdGV0aW1lXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9nbG9iYWxzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2VcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vcGVyaW9kXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lc291cmNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3RpbWV6b25lXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3R6LWRhdGFiYXNlXCI7XHJcbiJdfQ==
