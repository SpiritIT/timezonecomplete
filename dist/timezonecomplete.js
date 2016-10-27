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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZm9ybWF0LmpzIiwiZGlzdC9saWIvZ2xvYmFscy5qcyIsImRpc3QvbGliL2phdmFzY3JpcHQuanMiLCJkaXN0L2xpYi9tYXRoLmpzIiwiZGlzdC9saWIvcGFyc2UuanMiLCJkaXN0L2xpYi9wZXJpb2QuanMiLCJkaXN0L2xpYi9zdHJpbmdzLmpzIiwiZGlzdC9saWIvdGltZXNvdXJjZS5qcyIsImRpc3QvbGliL3RpbWV6b25lLmpzIiwiZGlzdC9saWIvdG9rZW4uanMiLCJkaXN0L2xpYi90ei1kYXRhYmFzZS5qcyIsImRpc3QvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqeUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDLzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMXFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ24rQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcclxuICAgIGlmICghY29uZGl0aW9uKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG59XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gYXNzZXJ0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWE56WlhKMExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJ4cFlpOWhjM05sY25RdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUU3TzBkQlJVYzdRVUZGU0N4WlFVRlpMRU5CUVVNN1FVRkZZaXhuUWtGQlowSXNVMEZCWXl4RlFVRkZMRTlCUVdVN1NVRkRPVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03U1VGRE1VSXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHRyUWtGQlpTeE5RVUZOTEVOQlFVTWlmUT09IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFdlZWtEYXkpIHtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlR1ZXNkYXlcIl0gPSAyXSA9IFwiVHVlc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIkZyaWRheVwiXSA9IDVdID0gXCJGcmlkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XHJcbn0pKGV4cG9ydHMuV2Vla0RheSB8fCAoZXhwb3J0cy5XZWVrRGF5ID0ge30pKTtcclxudmFyIFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXk7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRpbWVVbml0KSB7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1pbGxpc2Vjb25kXCJdID0gMF0gPSBcIk1pbGxpc2Vjb25kXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIlNlY29uZFwiXSA9IDFdID0gXCJTZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWludXRlXCJdID0gMl0gPSBcIk1pbnV0ZVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJIb3VyXCJdID0gM10gPSBcIkhvdXJcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiRGF5XCJdID0gNF0gPSBcIkRheVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJXZWVrXCJdID0gNV0gPSBcIldlZWtcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTW9udGhcIl0gPSA2XSA9IFwiTW9udGhcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiWWVhclwiXSA9IDddID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG4gICAgICovXHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1BWFwiXSA9IDhdID0gXCJNQVhcIjtcclxufSkoZXhwb3J0cy5UaW1lVW5pdCB8fCAoZXhwb3J0cy5UaW1lVW5pdCA9IHt9KSk7XHJcbnZhciBUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQ7XHJcbi8qKlxyXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cclxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xyXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXHJcbiAqXHJcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxyXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpIHtcclxuICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzID0gdGltZVVuaXRUb01pbGxpc2Vjb25kcztcclxuLyoqXHJcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXHJcbiAqIGlmIG5lY2Vzc2FyeS5cclxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcclxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQsIGFtb3VudCkge1xyXG4gICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDE7IH1cclxuICAgIHZhciByZXN1bHQgPSBUaW1lVW5pdFt1bml0XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBcInNcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnRpbWVVbml0VG9TdHJpbmcgPSB0aW1lVW5pdFRvU3RyaW5nO1xyXG5mdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHMpIHtcclxuICAgIHZhciB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcclxuICAgICAgICB2YXIgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG4gICAgICAgIGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gc3RyaW5nVG9UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcclxuICAgIC8vIGZyb20gV2lraXBlZGlhOlxyXG4gICAgLy8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBsZWFwIHllYXJcclxuICAgIGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmlzTGVhcFllYXIgPSBpc0xlYXBZZWFyO1xyXG4vKipcclxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcclxuICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5ZZWFyID0gZGF5c0luWWVhcjtcclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgc3dpdGNoIChtb250aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgIGNhc2UgNzpcclxuICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgY2FzZSAxMDpcclxuICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICByZXR1cm4gMzE7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgIGNhc2UgOTpcclxuICAgICAgICBjYXNlIDExOlxyXG4gICAgICAgICAgICByZXR1cm4gMzA7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5Nb250aCA9IGRheXNJbk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKi9cclxuZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIHZhciB5ZWFyRGF5ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG4gICAgICAgIHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcbiAgICB9XHJcbiAgICB5ZWFyRGF5ICs9IChkYXkgLSAxKTtcclxuICAgIHJldHVybiB5ZWFyRGF5O1xyXG59XHJcbmV4cG9ydHMuZGF5T2ZZZWFyID0gZGF5T2ZZZWFyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBlbmRPZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG4gICAgdmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMubGFzdFdlZWtEYXlPZk1vbnRoID0gbGFzdFdlZWtEYXlPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKlxyXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBiZWdpbk9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiAxIH0pO1xyXG4gICAgdmFyIGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5maXJzdFdlZWtEYXlPZk1vbnRoID0gZmlyc3RXZWVrRGF5T2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSB3ZWVrRGF5T25PckFmdGVyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXHJcbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgdmFyIGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuICAgIHZhciBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgaWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XHJcbiAgICAgICAgaWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xyXG4gICAgICAgICAgICAvLyBXZWVrIDFcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuICAgICAgICAgICAgaWYgKG1vbnRoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRGVmYXVsdCBjYXNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBKYW51YXJ5XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgdmFyIGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuICAgIGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xyXG4gICAgICAgIGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE5vcm1hbCBjYXNlXHJcbiAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG4gICAgaWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMud2Vla09mTW9udGggPSB3ZWVrT2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpIHtcclxuICAgIC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXHJcbiAgICB2YXIgcmVzdWx0ID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xyXG4gICAgaWYgKHJlc3VsdCA+IDMpIHtcclxuICAgICAgICByZXN1bHQgLT0gNztcclxuICAgICAgICBpZiAocmVzdWx0IDwgMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICB2YXIgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG4gICAgLy8gY2hlY2sgZW5kLW9mLXllYXIgY29ybmVyIGNhc2U6IG1heSBiZSB3ZWVrIDEgb2YgbmV4dCB5ZWFyXHJcbiAgICBpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcbiAgICAgICAgdmFyIG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xyXG4gICAgICAgIGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2VcclxuICAgIHZhciB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xyXG4gICAgaWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuICAgICAgICAvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxyXG4gICAgICAgIHZhciB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG4gICAgICAgIGlmIChkb3kgPCB3ZWVrVHdvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHdlZWtUd28pIC8gNykgKyAyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxyXG4gICAgaWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xyXG4gICAgICAgIC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXHJcbiAgICAgICAgcmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICB9XHJcbiAgICAvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcclxufVxyXG5leHBvcnRzLndlZWtOdW1iZXIgPSB3ZWVrTnVtYmVyO1xyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml4TWlsbGlzKSA9PT0gXCJudW1iZXJcIiwgXCJudW1iZXIgaW5wdXQgZXhwZWN0ZWRcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KCFpc05hTih1bml4TWlsbGlzKSwgXCJOYU4gbm90IGV4cGVjdGVkIGFzIGlucHV0XCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChtYXRoLmlzSW50KHVuaXhNaWxsaXMpLCBcIkV4cGVjdCBpbnRlZ2VyIG51bWJlciBmb3IgdW5peCBVVEMgdGltZXN0YW1wXCIpO1xyXG59XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5mdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XHJcbiAgICBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIHRlbXAgPSB1bml4TWlsbGlzO1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwIH07XHJcbiAgICB2YXIgeWVhcjtcclxuICAgIHZhciBtb250aDtcclxuICAgIGlmICh1bml4TWlsbGlzID49IDApIHtcclxuICAgICAgICByZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IHRlbXAgJSA2MDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG4gICAgICAgIHllYXIgPSAxOTcwO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJblllYXIoeWVhcikpIHtcclxuICAgICAgICAgICAgdGVtcCAtPSBkYXlzSW5ZZWFyKHllYXIpO1xyXG4gICAgICAgICAgICB5ZWFyKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC55ZWFyID0geWVhcjtcclxuICAgICAgICBtb250aCA9IDE7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPj0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXHJcbiAgICAgICAgLy8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuICAgICAgICByZXN1bHQubWlsbGkgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDEwMDApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuICAgICAgICByZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMjQpO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcbiAgICAgICAgeWVhciA9IDE5Njk7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcbiAgICAgICAgICAgIHllYXItLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xyXG4gICAgICAgIG1vbnRoID0gMTI7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMudW5peFRvVGltZU5vTGVhcFNlY3MgPSB1bml4VG9UaW1lTm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIEZpbGwgeW91IGFueSBtaXNzaW5nIHRpbWUgY29tcG9uZW50IHBhcnRzLCBkZWZhdWx0cyBhcmUgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpIHtcclxuICAgIHZhciBpbnB1dCA9IHtcclxuICAgICAgICB5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuICAgICAgICBtb250aDogdHlwZW9mIGNvbXBvbmVudHMubW9udGggPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1vbnRoIDogMSxcclxuICAgICAgICBkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcclxuICAgICAgICBob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuICAgICAgICBtaW51dGU6IHR5cGVvZiBjb21wb25lbnRzLm1pbnV0ZSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWludXRlIDogMCxcclxuICAgICAgICBzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcclxuICAgICAgICBtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbn1cclxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICB2YXIgY29tcG9uZW50cyA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSA6IGEpO1xyXG4gICAgdmFyIGlucHV0ID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XHJcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXHJcbiAgICAgICAgKGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcbiAgICAgICAgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDEpIC8gMTAwKSAqIDg2NDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDAgKyAyOTkpIC8gNDAwKSAqIDg2NDAwKTtcclxufVxyXG5leHBvcnRzLnRpbWVUb1VuaXhOb0xlYXBTZWNzID0gdGltZVRvVW5peE5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZXBvY2hEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG4gICAgdmFyIGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG4gICAgcmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcclxufVxyXG5leHBvcnRzLndlZWtEYXlOb0xlYXBTZWNzID0gd2Vla0RheU5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XHJcbiAgICByZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRPZkRheSA9IHNlY29uZE9mRGF5O1xyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG52YXIgVGltZVN0cnVjdCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVTdHJ1Y3QoYSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXHJcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICAgICAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAgICAgKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXHJcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gICAgICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICAgICAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xyXG4gICAgICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbVVuaXggPSBmdW5jdGlvbiAodW5peE1pbGxpcykge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIEphdmFTY3JpcHQgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGRmXHRXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tRGF0ZSA9IGZ1bmN0aW9uIChkLCBkZikge1xyXG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldFVUQ0Z1bGxZZWFyKCksIG1vbnRoOiBkLmdldFVUQ01vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0VVRDRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21TdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyID0gMTk3MDtcclxuICAgICAgICAgICAgdmFyIG1vbnRoID0gMTtcclxuICAgICAgICAgICAgdmFyIGRheSA9IDE7XHJcbiAgICAgICAgICAgIHZhciBob3VyID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbnV0ZSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25NaWxsaXMgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIG1haW4gcGFydFxyXG4gICAgICAgICAgICB2YXIgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Jhc2ljRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFueSBcIlRcIiBzZXBhcmF0b3JcclxuICAgICAgICAgICAgICAgIHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLCBcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoOCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEwLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlQW5kVGltZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoMCwgNCksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoNSwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBwYXJzZSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZyYWN0aW9uID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxhc3RVbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XHJcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInVuaXhNaWxsaXNcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhNaWxsaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiY29tcG9uZW50c1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInllYXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibW9udGhcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImRheVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImhvdXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWludXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwic2Vjb25kXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWlsbGlcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5LW9mLXllYXIgMC0zNjVcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUueWVhckRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKSA9PT0gb3RoZXIudmFsdWVPZigpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fdW5peE1pbGxpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcclxuICAgICAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSB0aW1lc3RhbXAgaXMgdmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICB9O1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGltZVN0cnVjdDtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lU3RydWN0ID0gVGltZVN0cnVjdDtcclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxyXG4gKi9cclxuZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXgoYXJyLCBjb21wYXJlKSB7XHJcbiAgICB2YXIgbWluSW5kZXggPSAwO1xyXG4gICAgdmFyIG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgY3VycmVudEluZGV4O1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG4gICAgLy8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxyXG4gICAgaWYgKCFhcnIpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICAvLyBvdXQgb2YgYm91bmRzXHJcbiAgICBpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG1heEluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIC8vIGVsZW1lbnQgaW4gcmFuZ2VcclxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IE1hdGguZmxvb3IoKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMik7XHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuICAgICAgICBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBiaW5hcnlJbnNlcnRpb25JbmRleDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWW1GemFXTnpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyeHBZaTlpWVhOcFkzTXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdSMEZKUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVWaUxIVkNRVUZ0UWl4VlFVRlZMRU5CUVVNc1EwRkJRVHRCUVVNNVFpd3lRa0ZCT0VJc1kwRkJZeXhEUVVGRExFTkJRVUU3UVVGRE4wTXNTVUZCV1N4SlFVRkpMRmRCUVUwc1VVRkJVU3hEUVVGRExFTkJRVUU3UVVGREwwSXNTVUZCV1N4UFFVRlBMRmRCUVUwc1YwRkJWeXhEUVVGRExFTkJRVUU3UVVGelJYSkRPenM3UjBGSFJ6dEJRVU5JTEZkQlFWa3NUMEZCVHp0SlFVTnNRaXg1UTBGQlRTeERRVUZCTzBsQlEwNHNlVU5CUVUwc1EwRkJRVHRKUVVOT0xESkRRVUZQTEVOQlFVRTdTVUZEVUN3clEwRkJVeXhEUVVGQk8wbEJRMVFzTmtOQlFWRXNRMEZCUVR0SlFVTlNMSGxEUVVGTkxFTkJRVUU3U1VGRFRpdzJRMEZCVVN4RFFVRkJPMEZCUTFRc1EwRkJReXhGUVZKWExHVkJRVThzUzBGQlVDeGxRVUZQTEZGQlVXeENPMEZCVWtRc1NVRkJXU3hQUVVGUExFZEJRVkFzWlVGUldDeERRVUZCTzBGQlJVUTdPMGRCUlVjN1FVRkRTQ3hYUVVGWkxGRkJRVkU3U1VGRGJrSXNjVVJCUVZjc1EwRkJRVHRKUVVOWUxESkRRVUZOTEVOQlFVRTdTVUZEVGl3eVEwRkJUU3hEUVVGQk8wbEJRMDRzZFVOQlFVa3NRMEZCUVR0SlFVTktMSEZEUVVGSExFTkJRVUU3U1VGRFNDeDFRMEZCU1N4RFFVRkJPMGxCUTBvc2VVTkJRVXNzUTBGQlFUdEpRVU5NTEhWRFFVRkpMRU5CUVVFN1NVRkRTanM3VDBGRlJ6dEpRVU5JTEhGRFFVRkhMRU5CUVVFN1FVRkRTaXhEUVVGRExFVkJZbGNzWjBKQlFWRXNTMEZCVWl4blFrRkJVU3hSUVdGdVFqdEJRV0pFTEVsQlFWa3NVVUZCVVN4SFFVRlNMR2RDUVdGWUxFTkJRVUU3UVVGRlJEczdPenM3T3p0SFFVOUhPMEZCUTBnc1owTkJRWFZETEVsQlFXTTdTVUZEY0VRc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTmtMRXRCUVVzc1VVRkJVU3hEUVVGRExGZEJRVmNzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNCRExFdEJRVXNzVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRE8xRkJRMnhETEV0QlFVc3NVVUZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFTkJRVU1zUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVTjJReXhMUVVGTExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNUVUZCVFN4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETzFGQlF6RkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRPMUZCUTI1RExFdEJRVXNzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF6dFJRVU40UXl4TFFVRkxMRkZCUVZFc1EwRkJReXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEVWQlFVVXNSMEZCUnl4UlFVRlJMRU5CUVVNN1VVRkRNVU1zUzBGQlN5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEZGQlFWRXNRMEZCUXp0UlFVTTVReXd3UWtGQk1FSTdVVUZETVVJN1dVRkRReXgzUWtGQmQwSTdXVUZEZUVJc01FSkJRVEJDTzFsQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhEUVVGRE8xbEJRM1JETEVOQlFVTTdTVUZEU0N4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVd4Q1pTdzRRa0ZCYzBJc2VVSkJhMEp5UXl4RFFVRkJPMEZCUlVRN096czdPMGRCUzBjN1FVRkRTQ3d3UWtGQmFVTXNTVUZCWXl4RlFVRkZMRTFCUVd0Q08wbEJRV3hDTEhOQ1FVRnJRaXhIUVVGc1FpeFZRVUZyUWp0SlFVTnNSU3hKUVVGTkxFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRkxFTkJRVU03U1VGRE5VTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zU1VGQlNTeE5RVUZOTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMjVETEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1NVRkRaaXhEUVVGRE8wbEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEVUN4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFZEJRVWNzUTBGQlF6dEpRVU55UWl4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVZCbExIZENRVUZuUWl4dFFrRlBMMElzUTBGQlFUdEJRVVZFTERCQ1FVRnBReXhEUVVGVE8wbEJRM3BETEVsQlFVMHNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0SlFVTjJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVOMlF5eEpRVUZOTEV0QlFVc3NSMEZCUnl4blFrRkJaMElzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRja01zUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4TFFVRkxMRTlCUVU4c1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eEhRVUZITEVOQlFVTXNTMEZCU3l4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JFTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVU5FTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc05FSkJRVFJDTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRM3BFTEVOQlFVTTdRVUZVWlN4M1FrRkJaMElzYlVKQlV5OUNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTEc5Q1FVRXlRaXhKUVVGWk8wbEJRM1JETEd0Q1FVRnJRanRKUVVOc1FpeHBSRUZCYVVRN1NVRkRha1FzYzBSQlFYTkVPMGxCUTNSRUxIZEVRVUYzUkR0SlFVTjRSQ3hwUWtGQmFVSTdTVUZEYWtJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0JDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1NVRkRaQ3hEUVVGRE8wbEJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETzBsQlEySXNRMEZCUXp0SlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE4wSXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJRenRKUVVOa0xFTkJRVU03U1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTlFMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU03U1VGRFlpeERRVUZETzBGQlEwWXNRMEZCUXp0QlFXWmxMR3RDUVVGVkxHRkJaWHBDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSUxHOUNRVUV5UWl4SlFVRlpPMGxCUTNSRExFMUJRVTBzUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEZGtNc1EwRkJRenRCUVVabExHdENRVUZWTEdGQlJYcENMRU5CUVVFN1FVRkZSRHM3T3p0SFFVbEhPMEZCUTBnc2NVSkJRVFJDTEVsQlFWa3NSVUZCUlN4TFFVRmhPMGxCUTNSRUxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRaaXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU5RTEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUTFBc1MwRkJTeXhEUVVGRExFTkJRVU03VVVGRFVDeExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTlFMRXRCUVVzc1EwRkJReXhEUVVGRE8xRkJRMUFzUzBGQlN5eEZRVUZGTEVOQlFVTTdVVUZEVWl4TFFVRkxMRVZCUVVVN1dVRkRUaXhOUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETzFGQlExZ3NTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU55UXl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVOUUxFdEJRVXNzUTBGQlF5eERRVUZETzFGQlExQXNTMEZCU3l4RFFVRkRMRU5CUVVNN1VVRkRVQ3hMUVVGTExFVkJRVVU3V1VGRFRpeE5RVUZOTEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUTFnN1dVRkRReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF6ZERMRU5CUVVNN1FVRkRSaXhEUVVGRE8wRkJjRUpsTEcxQ1FVRlhMR05CYjBJeFFpeERRVUZCTzBGQlJVUTdPenM3T3p0SFFVMUhPMEZCUTBnc2JVSkJRVEJDTEVsQlFWa3NSVUZCUlN4TFFVRmhMRVZCUVVVc1IwRkJWenRKUVVOcVJTeG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFbEJRVWtzUzBGQlN5eEpRVUZKTEVWQlFVVXNSVUZCUlN4dlFrRkJiMElzUTBGQlF5eERRVUZETzBsQlEzaEVMR2RDUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNSVUZCUlN4clFrRkJhMElzUTBGQlF5eERRVUZETzBsQlEzaEZMRWxCUVVrc1QwRkJUeXhIUVVGWExFTkJRVU1zUTBGQlF6dEpRVU40UWl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlZ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRXRCUVVzc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETzFGQlEzaERMRTlCUVU4c1NVRkJTU3hYUVVGWExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTJwRExFTkJRVU03U1VGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGNrSXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJRenRCUVVOb1FpeERRVUZETzBGQlZHVXNhVUpCUVZNc1dVRlRlRUlzUTBGQlFUdEJRVVZFT3pzN096czdPenRIUVZGSE8wRkJRMGdzTkVKQlFXMURMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzVDBGQlowSTdTVUZETDBVc1NVRkJUU3hWUVVGVkxFZEJRV1VzU1VGQlNTeFZRVUZWTEVOQlFVTXNSVUZCUlN4VlFVRkpMRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUlVGQlJTeFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU01Uml4SlFVRk5MR2xDUVVGcFFpeEhRVUZITEdsQ1FVRnBRaXhEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnVSU3hKUVVGSkxFbEJRVWtzUjBGQlZ5eFBRVUZQTEVkQlFVY3NhVUpCUVdsQ0xFTkJRVU03U1VGREwwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEWkN4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJRMWdzUTBGQlF6dEpRVU5FTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZEZWtNc1EwRkJRenRCUVZKbExEQkNRVUZyUWl4eFFrRlJha01zUTBGQlFUdEJRVVZFT3pzN096czdPenRIUVZGSE8wRkJRMGdzTmtKQlFXOURMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzVDBGQlowSTdTVUZEYUVZc1NVRkJUU3haUVVGWkxFZEJRV1VzU1VGQlNTeFZRVUZWTEVOQlFVTXNSVUZCUlN4VlFVRkpMRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNoRkxFbEJRVTBzYlVKQlFXMUNMRWRCUVVjc2FVSkJRV2xDTEVOQlFVTXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wbEJRM1pGTEVsQlFVa3NTVUZCU1N4SFFVRlhMRTlCUVU4c1IwRkJSeXh0UWtGQmJVSXNRMEZCUXp0SlFVTnFSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOa0xFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEV0N4RFFVRkRPMGxCUTBRc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRCUVVNelF5eERRVUZETzBGQlVtVXNNa0pCUVcxQ0xITkNRVkZzUXl4RFFVRkJPMEZCUlVRN096dEhRVWRITzBGQlEwZ3NNRUpCUVdsRExFbEJRVmtzUlVGQlJTeExRVUZoTEVWQlFVVXNSMEZCVnl4RlFVRkZMRTlCUVdkQ08wbEJRekZHTEVsQlFVMHNTMEZCU3l4SFFVRmxMRWxCUVVrc1ZVRkJWU3hEUVVGRExFVkJRVVVzVlVGQlNTeEZRVUZGTEZsQlFVc3NSVUZCUlN4UlFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJReTlFTEVsQlFVMHNXVUZCV1N4SFFVRlpMR2xDUVVGcFFpeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVOc1JTeEpRVUZKTEVsQlFVa3NSMEZCVnl4UFFVRlBMRWRCUVVjc1dVRkJXU3hEUVVGRE8wbEJRekZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyUXNTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVOWUxFTkJRVU03U1VGRFJDeG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NTVUZCU1N4WFFVRlhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eEZRVUZGTEhGRFFVRnhReXhEUVVGRExFTkJRVU03U1VGRGRrY3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTndReXhEUVVGRE8wRkJWR1VzZDBKQlFXZENMRzFDUVZNdlFpeERRVUZCTzBGQlJVUTdPenRIUVVkSE8wRkJRMGdzTWtKQlFXdERMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzUjBGQlZ5eEZRVUZGTEU5QlFXZENPMGxCUXpOR0xFbEJRVTBzUzBGQlN5eEhRVUZsTEVsQlFVa3NWVUZCVlN4RFFVRkRMRVZCUVVNc1ZVRkJTU3hGUVVGRkxGbEJRVXNzUlVGQlJTeFJRVUZITEVWQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpkRUxFbEJRVTBzV1VGQldTeEhRVUZaTEdsQ1FVRnBRaXhEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnNSU3hKUVVGSkxFbEJRVWtzUjBGQlZ5eFBRVUZQTEVkQlFVY3NXVUZCV1N4RFFVRkRPMGxCUXpGRExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMlFzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTllMRU5CUVVNN1NVRkRSQ3huUWtGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzU1VGQlNTeERRVUZETEVWQlFVVXNjVU5CUVhGRExFTkJRVU1zUTBGQlF6dEpRVU5vUml4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUTNCRExFTkJRVU03UVVGVVpTeDVRa0ZCYVVJc2IwSkJVMmhETEVOQlFVRTdRVUZGUkRzN096czdPenM3TzBkQlUwYzdRVUZEU0N4eFFrRkJORUlzU1VGQldTeEZRVUZGTEV0QlFXRXNSVUZCUlN4SFFVRlhPMGxCUTI1RkxFbEJRVTBzWVVGQllTeEhRVUZITEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVWQlFVVXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8wbEJRM3BGTEVsQlFVMHNWMEZCVnl4SFFVRkhMRzFDUVVGdFFpeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRVZCUVVVc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzBsQlEzSkZMSGRGUVVGM1JUdEpRVU40UlN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjJRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eGhRVUZoTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOcVF5eFRRVUZUTzFsQlExUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOV0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRGhDUVVFNFFqdFpRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRaaXhsUVVGbE8yZENRVU5tTEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzUjBGQlJ5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRla01zUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxGVkJRVlU3WjBKQlExWXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOMFF5eERRVUZETzFGQlEwWXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSQ3hKUVVGTkxGVkJRVlVzUjBGQlJ5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRKUVVOdVJTeEpRVUZOTEZsQlFWa3NSMEZCUnl4clFrRkJhMElzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU4yUlN4M1JVRkJkMFU3U1VGRGVFVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZGtJc1JVRkJSU3hEUVVGRExFTkJRVU1zVlVGQlZTeEhRVUZITEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRMMElzZFVKQlFYVkNPMWxCUTNaQ0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEVml4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRUxHTkJRV003U1VGRFpDeEpRVUZKTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZITEZkQlFWY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEpRVU55UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhoUVVGaExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjJRaXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETzBsQlEySXNRMEZCUXp0SlFVVkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03UVVGRFppeERRVUZETzBGQmNrTmxMRzFDUVVGWExHTkJjVU14UWl4RFFVRkJPMEZCUlVRN096czdSMEZKUnp0QlFVTklMRFpDUVVFMlFpeEpRVUZaTzBsQlEzaERMR2xGUVVGcFJUdEpRVU5xUlN4SlFVRkpMRTFCUVUwc1IwRkJWeXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRM1JGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyaENMRTFCUVUwc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRFdpeEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5vUWl4TlFVRk5MRWxCUVVrc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRlRU1zUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZEUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8wRkJRMllzUTBGQlF6dEJRVVZFT3pzN096czdPenM3TzBkQlZVYzdRVUZEU0N4dlFrRkJNa0lzU1VGQldTeEZRVUZGTEV0QlFXRXNSVUZCUlN4SFFVRlhPMGxCUTJ4RkxFbEJRVTBzUjBGQlJ5eEhRVUZITEZOQlFWTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBsQlJYaERMRFJFUVVFMFJEdEpRVU0xUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzQkRMRWxCUVUwc1pVRkJaU3hIUVVGSExHMUNRVUZ0UWl4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU4wUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhsUVVGbExFZEJRVWNzUTBGQlF5eEpRVUZKTEdWQlFXVXNTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVFTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFTEhORFFVRnpRenRKUVVOMFF5eEpRVUZOTEdWQlFXVXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eGxRVUZsTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlFpeG5RMEZCWjBNN1VVRkRhRU1zU1VGQlRTeFBRVUZQTEVkQlFVY3NaVUZCWlN4SFFVRkhMRU5CUVVNc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUXpORUxFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVVUZETlVNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJDeDFRMEZCZFVNN1NVRkRka01zUlVGQlJTeERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMR1ZCUVdVc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE0wSXNhMFJCUVd0RU8xRkJRMnhFTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRja01zUTBGQlF6dEpRVVZFTERCRVFVRXdSRHRKUVVNeFJDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eGxRVUZsTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGNFUXNRMEZCUXp0QlFTOUNaU3hyUWtGQlZTeGhRU3RDZWtJc1EwRkJRVHRCUVVkRUxEWkNRVUUyUWl4VlFVRnJRanRKUVVNNVF5eG5Ra0ZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eFJRVUZSTEVWQlFVVXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dEpRVU5zUlN4blFrRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZWQlFWVXNRMEZCUXl4RlFVRkZMREpDUVVFeVFpeERRVUZETEVOQlFVTTdTVUZEZUVRc1owSkJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRlZCUVZVc1EwRkJReXhGUVVGRkxEaERRVUU0UXl4RFFVRkRMRU5CUVVNN1FVRkRhRVlzUTBGQlF6dEJRVVZFT3pzN1IwRkhSenRCUVVOSUxEaENRVUZ4UXl4VlFVRnJRanRKUVVOMFJDeHRRa0ZCYlVJc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEpRVVZvUXl4SlFVRkpMRWxCUVVrc1IwRkJWeXhWUVVGVkxFTkJRVU03U1VGRE9VSXNTVUZCVFN4TlFVRk5MRWRCUVcxQ0xFVkJRVVVzU1VGQlNTeEZRVUZGTEVOQlFVTXNSVUZCUlN4TFFVRkxMRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRU5CUVVNc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUlVGQlF5eERRVUZETzBsQlEzSkhMRWxCUVVrc1NVRkJXU3hEUVVGRE8wbEJRMnBDTEVsQlFVa3NTMEZCWVN4RFFVRkRPMGxCUld4Q0xFVkJRVVVzUTBGQlF5eERRVUZETEZWQlFWVXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0pDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dFJRVU16UWl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRMMElzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRekZDTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRNVUlzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlF6ZENMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjRRaXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRk4wSXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVOYUxFOUJRVThzU1VGQlNTeEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8xbEJRMnBETEVsQlFVa3NTVUZCU1N4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRGVrSXNTVUZCU1N4RlFVRkZMRU5CUVVNN1VVRkRVaXhEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNN1VVRkZia0lzUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTldMRTlCUVU4c1NVRkJTU3hKUVVGSkxGZEJRVmNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVONlF5eEpRVUZKTEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVOVUxFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRSUVVOeVFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGRrSXNRMEZCUXp0SlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMUFzZVVWQlFYbEZPMUZCUTNwRkxEUkRRVUUwUXp0UlFVTTFReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF5OURMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVNdlFpeE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUXpsRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU0zUWl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRemxETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzFGQlF6VkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVVM1FpeEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUTFvc1QwRkJUeXhKUVVGSkxFZEJRVWNzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVOcVF5eEpRVUZKTEVsQlFVa3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRM3BDTEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTFJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUlc1Q0xFdEJRVXNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEV0N4UFFVRlBMRWxCUVVrc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVONlF5eEpRVUZKTEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVOVUxFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRSUVVOeVFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFZEJRVWNzVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOc1JDeERRVUZETzBsQlJVUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVObUxFTkJRVU03UVVFM1JHVXNORUpCUVc5Q0xIVkNRVFpFYmtNc1EwRkJRVHRCUVVWRU96dEhRVVZITzBGQlEwZ3NhVU5CUVdsRExGVkJRVFpDTzBsQlF6ZEVMRWxCUVUwc1MwRkJTeXhIUVVGSE8xRkJRMklzU1VGQlNTeEZRVUZGTEU5QlFVOHNWVUZCVlN4RFFVRkRMRWxCUVVrc1MwRkJTeXhSUVVGUkxFZEJRVWNzVlVGQlZTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpPMUZCUTJ4RkxFdEJRVXNzUlVGQlJTeFBRVUZQTEZWQlFWVXNRMEZCUXl4TFFVRkxMRXRCUVVzc1VVRkJVU3hIUVVGSExGVkJRVlVzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXp0UlFVTnNSU3hIUVVGSExFVkJRVVVzVDBGQlR5eFZRVUZWTEVOQlFVTXNSMEZCUnl4TFFVRkxMRkZCUVZFc1IwRkJSeXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVOQlFVTTdVVUZETlVRc1NVRkJTU3hGUVVGRkxFOUJRVThzVlVGQlZTeERRVUZETEVsQlFVa3NTMEZCU3l4UlFVRlJMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUjBGQlJ5eERRVUZETzFGQlF5OUVMRTFCUVUwc1JVRkJSU3hQUVVGUExGVkJRVlVzUTBGQlF5eE5RVUZOTEV0QlFVc3NVVUZCVVN4SFFVRkhMRlZCUVZVc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF6dFJRVU55UlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhWUVVGVkxFTkJRVU1zVFVGQlRTeExRVUZMTEZGQlFWRXNSMEZCUnl4VlFVRlZMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU03VVVGRGNrVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1ZVRkJWU3hEUVVGRExFdEJRVXNzUzBGQlN5eFJRVUZSTEVkQlFVY3NWVUZCVlN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRE8wdEJRMnhGTEVOQlFVTTdTVUZEUml4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wRkJRMlFzUTBGQlF6dEJRV3RDUkN3NFFrRkRReXhEUVVFMlFpeEZRVUZGTEV0QlFXTXNSVUZCUlN4SFFVRlpMRVZCUVVVc1NVRkJZU3hGUVVGRkxFMUJRV1VzUlVGQlJTeE5RVUZsTEVWQlFVVXNTMEZCWXp0SlFVVTFTQ3hKUVVGTkxGVkJRVlVzUjBGQmMwSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXl4RlFVRkZMRmxCUVVzc1JVRkJSU3hSUVVGSExFVkJRVVVzVlVGQlNTeEZRVUZGTEdOQlFVMHNSVUZCUlN4alFVRk5MRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEZWtnc1NVRkJUU3hMUVVGTExFZEJRVzFDTEhWQ1FVRjFRaXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEyeEZMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVTXpRaXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hIUVVGSExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEV0QlFVczdVVUZETlVjc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxPMUZCUXpWRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU03UVVGRGRrY3NRMEZCUXp0QlFWUmxMRFJDUVVGdlFpeDFRa0ZUYmtNc1EwRkJRVHRCUVVWRU96czdSMEZIUnp0QlFVTklMREpDUVVGclF5eFZRVUZyUWp0SlFVTnVSQ3h0UWtGQmJVSXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVWb1F5eEpRVUZOTEZGQlFWRXNSMEZCV1N4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRE8wbEJRek5ETEVsQlFVMHNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVlVGQlZTeEhRVUZITEVsQlFVa3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOdVJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBGQlF6bENMRU5CUVVNN1FVRk9aU3g1UWtGQmFVSXNiMEpCVFdoRExFTkJRVUU3UVVGRlJEczdSMEZGUnp0QlFVTklMSEZDUVVFMFFpeEpRVUZaTEVWQlFVVXNUVUZCWXl4RlFVRkZMRTFCUVdNN1NVRkRka1VzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1IwRkJSeXhOUVVGTkxFTkJRVU03UVVGREwwTXNRMEZCUXp0QlFVWmxMRzFDUVVGWExHTkJSVEZDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSU8wbEJPRTFET3p0UFFVVkhPMGxCUTBnc2IwSkJRVmtzUTBGQk5rSTdVVUZEZUVNc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNelFpeEpRVUZKTEVOQlFVTXNWMEZCVnl4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOMFFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hKUVVGSkxFTkJRVU1zVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlF5OURMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJjazVFT3pzN096czdPenM3TzA5QlZVYzdTVUZEVnl4NVFrRkJZeXhIUVVFMVFpeFZRVU5ETEVsQlFXRXNSVUZCUlN4TFFVRmpMRVZCUVVVc1IwRkJXU3hGUVVNelF5eEpRVUZoTEVWQlFVVXNUVUZCWlN4RlFVRkZMRTFCUVdVc1JVRkJSU3hMUVVGak8xRkJSUzlFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhGUVVGRkxGVkJRVWtzUlVGQlJTeFpRVUZMTEVWQlFVVXNVVUZCUnl4RlFVRkZMRlZCUVVrc1JVRkJSU3hqUVVGTkxFVkJRVVVzWTBGQlRTeEZRVUZGTEZsQlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRNVVVzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOWExHMUNRVUZSTEVkQlFYUkNMRlZCUVhWQ0xGVkJRV3RDTzFGQlEzaERMRTFCUVUwc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnVReXhEUVVGRE8wbEJSVVE3T3pzN08wOUJTMGM3U1VGRFZ5eHRRa0ZCVVN4SFFVRjBRaXhWUVVGMVFpeERRVUZQTEVWQlFVVXNSVUZCYVVJN1VVRkRhRVFzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4TFFVRkxMREJDUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFZRVUZWTEVOQlFVTTdaMEpCUTNKQ0xFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNSMEZCUnl4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVTdaMEpCUTJoRkxFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRExGVkJRVlVzUlVGQlJTeEZRVUZGTEV0QlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNc1pVRkJaU3hGUVVGRk8yRkJRemxHTEVOQlFVTXNRMEZCUXp0UlFVTktMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEUxQlFVMHNRMEZCUXl4SlFVRkpMRlZCUVZVc1EwRkJRenRuUWtGRGNrSXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhqUVVGakxFVkJRVVVzUlVGQlJTeExRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRMRmRCUVZjc1JVRkJSU3hIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRMRlZCUVZVc1JVRkJSVHRuUWtGRGVrVXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRMR0ZCUVdFc1JVRkJSU3hGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTXNZVUZCWVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eHJRa0ZCYTBJc1JVRkJSVHRoUVVNeFJ5eERRVUZETEVOQlFVTTdVVUZEU2l4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlExY3NjVUpCUVZVc1IwRkJlRUlzVlVGQmVVSXNRMEZCVXp0UlFVTnFReXhKUVVGSkxFTkJRVU03V1VGRFNpeEpRVUZKTEVsQlFVa3NSMEZCVnl4SlFVRkpMRU5CUVVNN1dVRkRlRUlzU1VGQlNTeExRVUZMTEVkQlFWY3NRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFbEJRVWtzUjBGQlJ5eEhRVUZYTEVOQlFVTXNRMEZCUXp0WlFVTndRaXhKUVVGSkxFbEJRVWtzUjBGQlZ5eERRVUZETEVOQlFVTTdXVUZEY2tJc1NVRkJTU3hOUVVGTkxFZEJRVmNzUTBGQlF5eERRVUZETzFsQlEzWkNMRWxCUVVrc1RVRkJUU3hIUVVGWExFTkJRVU1zUTBGQlF6dFpRVU4yUWl4SlFVRkpMR05CUVdNc1IwRkJWeXhEUVVGRExFTkJRVU03V1VGREwwSXNTVUZCU1N4UlFVRlJMRWRCUVdFc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF6dFpRVVYyUXl3clFrRkJLMEk3V1VGREwwSXNTVUZCVFN4TFFVRkxMRWRCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNMVF5eG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhGUVVGRkxHZERRVUZuUXl4RFFVRkRMRU5CUVVNN1dVRkZha1lzYTBKQlFXdENPMWxCUTJ4Q0xFbEJRVTBzWVVGQllTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpsRExFVkJRVVVzUTBGQlF5eERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMjVDTEdkQ1FVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4dlEwRkJiME1zUTBGQlF5eEZRVU14UkN4clJrRkJhMFlzUTBGQlF5eERRVUZETzJkQ1FVVnlSaXd5UWtGQk1rSTdaMEpCUXpOQ0xFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRuUWtGRmNrTXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkZMRVZCUVVVc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVTjRSQ3gzUmtGQmQwWXNRMEZCUXl4RFFVRkRPMmRDUVVVelJpeEZRVUZGTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRekZDTEVsQlFVa3NSMEZCUnl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdiMEpCUXpORExGRkJRVkVzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVNeFFpeERRVUZETzJkQ1FVTkVMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETVVJc1MwRkJTeXhIUVVGSExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenR2UWtGRE5VTXNSMEZCUnl4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMREpGUVVFeVJUdHZRa0ZEZEVnc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTTdaMEpCUTNwQ0xFTkJRVU03WjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU16UWl4SlFVRkpMRWRCUVVjc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMjlDUVVNelF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJRenRuUWtGRE1VSXNRMEZCUXp0blFrRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpOQ0xFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03YjBKQlF6bERMRkZCUVZFc1IwRkJSeXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETzJkQ1FVTTFRaXhEUVVGRE8yZENRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE0wSXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0dlFrRkRPVU1zVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJRelZDTEVOQlFVTTdXVUZEUml4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNaMEpCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMSEZFUVVGeFJDeERRVUZETEVWQlFVVXNiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dG5Ra0ZEY0Vjc1NVRkJTU3hYUVVGWExFZEJRV0VzUlVGQlJTeERRVUZETzJkQ1FVTXZRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRNMElzVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTI1RExFTkJRVU03WjBKQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE1VSXNWMEZCVnl4SFFVRkhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTTNSQ3hEUVVGRE8yZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOUUxGZEJRVmNzUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF6dG5Ra0ZET1VJc1EwRkJRenRuUWtGRFJDeG5Ra0ZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUTI1RUxIZEdRVUYzUml4RFFVRkRMRU5CUVVNN1owSkJSVE5HTEVWQlFVVXNRMEZCUXl4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGFFTXNTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0dlFrRkRha1FzVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRekZDTEVOQlFVTTdaMEpCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnFReXhMUVVGTExFZEJRVWNzVVVGQlVTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8yOUNRVU5zUkN4SFFVRkhMRWRCUVVjc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc01rVkJRVEpGTzI5Q1FVTTFTQ3hSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVkQlFVY3NRMEZCUXp0blFrRkRla0lzUTBGQlF6dG5Ra0ZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEyaERMRWxCUVVrc1IwRkJSeXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN2IwSkJRMnBFTEZGQlFWRXNSMEZCUnl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRE8yZENRVU14UWl4RFFVRkRPMmRDUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRhRU1zVFVGQlRTeEhRVUZITEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF6dHZRa0ZEYmtRc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdaMEpCUXpWQ0xFTkJRVU03WjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5vUXl4TlFVRk5MRWRCUVVjc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMjlDUVVOdVJDeFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJRenRuUWtGRE5VSXNRMEZCUXp0WlFVTkdMRU5CUVVNN1dVRkZSQ3gzUWtGQmQwSTdXVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4SlFVRk5MRkZCUVZFc1IwRkJWeXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU55UkN4TlFVRk5MRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnNRaXhMUVVGTExGRkJRVkVzUTBGQlF5eEpRVUZKTzNkQ1FVRkZMRU5CUVVNN05FSkJRM0JDTEdOQlFXTXNSMEZCUnl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXp0M1FrRkRla1FzUTBGQlF6dDNRa0ZCUXl4TFFVRkxMRU5CUVVNN2IwSkJRMUlzUzBGQlN5eFJRVUZSTEVOQlFVTXNSMEZCUnp0M1FrRkJSU3hEUVVGRE96UkNRVU51UWl4alFVRmpMRWRCUVVjc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF6dDNRa0ZEZEVNc1EwRkJRenQzUWtGQlF5eExRVUZMTEVOQlFVTTdiMEpCUTFJc1MwRkJTeXhSUVVGUkxFTkJRVU1zU1VGQlNUdDNRa0ZCUlN4RFFVRkRPelJDUVVOd1FpeGpRVUZqTEVkQlFVY3NUMEZCVHl4SFFVRkhMRkZCUVZFc1EwRkJRenQzUWtGRGNrTXNRMEZCUXp0M1FrRkJReXhMUVVGTExFTkJRVU03YjBKQlExSXNTMEZCU3l4UlFVRlJMRU5CUVVNc1RVRkJUVHQzUWtGQlJTeERRVUZET3pSQ1FVTjBRaXhqUVVGakxFZEJRVWNzUzBGQlN5eEhRVUZITEZGQlFWRXNRMEZCUXp0M1FrRkRia01zUTBGQlF6dDNRa0ZCUXl4TFFVRkxMRU5CUVVNN2IwSkJRMUlzUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFR0M1FrRkJSU3hEUVVGRE96UkNRVU4wUWl4alFVRmpMRWRCUVVjc1NVRkJTU3hIUVVGSExGRkJRVkVzUTBGQlF6dDNRa0ZEYkVNc1EwRkJRenQzUWtGQlF5eExRVUZMTEVOQlFVTTdaMEpCUTFRc1EwRkJRenRaUVVOR0xFTkJRVU03V1VGRlJDeHRRMEZCYlVNN1dVRkRia01zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRE0wSXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZETjBJc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRla0lzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRE0wSXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZETDBJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRMMElzU1VGQlNTeFZRVUZWTEVkQlFWY3NiMEpCUVc5Q0xFTkJRVU1zUlVGQlJTeFZRVUZKTEVWQlFVVXNXVUZCU3l4RlFVRkZMRkZCUVVjc1JVRkJSU3hWUVVGSkxFVkJRVVVzWTBGQlRTeEZRVUZGTEdOQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRNVVlzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hIUVVGSExHTkJRV01zUTBGQlF5eERRVUZETzFsQlEzaEVMRTFCUVUwc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0UlFVTnVReXhEUVVGRk8xRkJRVUVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOYUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNOa0pCUVRaQ0xFZEJRVWNzUTBGQlF5eEhRVUZITEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGVrVXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRk5SQ3h6UWtGQlZ5eHJRMEZCVlR0aFFVRnlRanRaUVVORExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRXRCUVVzc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExGZEJRVmNzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdXVUZETTBRc1EwRkJRenRaUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRPMUZCUTNwQ0xFTkJRVU03T3p0UFFVRkJPMGxCVFVRc2MwSkJRVmNzYTBOQlFWVTdZVUZCY2tJN1dVRkRReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4yUWl4SlFVRkpMRU5CUVVNc1YwRkJWeXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFpRVU16UkN4RFFVRkRPMWxCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEZWtJc1EwRkJRenM3TzA5QlFVRTdTVUY1UWtRc2MwSkJRVWtzTkVKQlFVazdZVUZCVWp0WlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTTNRaXhEUVVGRE96czdUMEZCUVR0SlFVVkVMSE5DUVVGSkxEWkNRVUZMTzJGQlFWUTdXVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZET1VJc1EwRkJRenM3TzA5QlFVRTdTVUZGUkN4elFrRkJTU3d5UWtGQlJ6dGhRVUZRTzFsQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETzFGQlF6VkNMRU5CUVVNN096dFBRVUZCTzBsQlJVUXNjMEpCUVVrc05FSkJRVWs3WVVGQlVqdFpRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU0zUWl4RFFVRkRPenM3VDBGQlFUdEpRVVZFTEhOQ1FVRkpMRGhDUVVGTk8yRkJRVlk3V1VGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGREwwSXNRMEZCUXpzN08wOUJRVUU3U1VGRlJDeHpRa0ZCU1N3NFFrRkJUVHRoUVVGV08xbEJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRE8xRkJReTlDTEVOQlFVTTdPenRQUVVGQk8wbEJSVVFzYzBKQlFVa3NOa0pCUVVzN1lVRkJWRHRaUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJRenRSUVVNNVFpeERRVUZET3pzN1QwRkJRVHRKUVVWRU96dFBRVVZITzBsQlEwa3NORUpCUVU4c1IwRkJaRHRSUVVORExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0SlFVTndSaXhEUVVGRE8wbEJSVTBzTWtKQlFVMHNSMEZCWWl4VlFVRmpMRXRCUVdsQ08xRkJRemxDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFdEJRVXNzUzBGQlN5eERRVUZETEU5QlFVOHNSVUZCUlN4RFFVRkRPMGxCUXpORExFTkJRVU03U1VGRlRTdzBRa0ZCVHl4SFFVRmtPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZEZUVJc1EwRkJRenRKUVVWTkxEQkNRVUZMTEVkQlFWbzdVVUZEUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjBRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xRkJRM3BETEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFMUJRVTBzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VVVGRGVrTXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N3MlFrRkJVU3hIUVVGbU8xRkJRME1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRFSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFdEJRVXNzU1VGQlNTeEZRVUZGTzIxQ1FVTTFSQ3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRE8yMUNRVU16Unl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEVsQlFVa3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFbEJRVWtzUlVGQlJUdHRRa0ZEZGtRc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeEpRVUZKTEVWQlFVVTdiVUpCUXpORUxFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNTVUZCU1N4RlFVRkZPMjFDUVVNelJDeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRWxCUVVrc1IwRkJSeXhEUVVGRE8xRkJRMmhGTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTTdVVUZEWWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NOa0pCUVZFc1IwRkJaanRSUVVORExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETzJOQlF6bEVMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRE8yTkJRMnBGTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRPMk5CUXk5RUxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETzJOQlEyaEZMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRE8yTkJRMnhGTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRPMk5CUTJ4RkxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZEZEVVc1EwRkJRenRKUVVWTkxEUkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNN1NVRkRhRVFzUTBGQlF6dEpRVVZHTEdsQ1FVRkRPMEZCUVVRc1EwRkJReXhCUVRsVFJDeEpRVGhUUXp0QlFUbFRXU3hyUWtGQlZTeGhRVGhUZEVJc1EwRkJRVHRCUVVkRU96czdPenRIUVV0SE8wRkJRMGdzT0VKQlFYZERMRWRCUVZFc1JVRkJSU3hQUVVFd1FqdEpRVU16UlN4SlFVRkpMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGFrSXNTVUZCU1N4UlFVRlJMRWRCUVVjc1IwRkJSeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZET1VJc1NVRkJTU3haUVVGdlFpeERRVUZETzBsQlEzcENMRWxCUVVrc1kwRkJhVUlzUTBGQlF6dEpRVU4wUWl4NVFrRkJlVUk3U1VGRGVrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOV0xFTkJRVU03U1VGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZEVJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5XTEVOQlFVTTdTVUZEUkN4blFrRkJaMEk3U1VGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGVrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOV0xFTkJRVU03U1VGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOb1F5eE5RVUZOTEVOQlFVTXNVVUZCVVN4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOeVFpeERRVUZETzBsQlEwUXNiVUpCUVcxQ08wbEJRMjVDTEU5QlFVOHNVVUZCVVN4SlFVRkpMRkZCUVZFc1JVRkJSU3hEUVVGRE8xRkJRemRDTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0pFTEdOQlFXTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03VVVGRmJrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRha01zVVVGQlVTeEhRVUZITEZsQlFWa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkROMElzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zWTBGQll5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFF5eFJRVUZSTEVkQlFVY3NXVUZCV1N4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVNM1FpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hOUVVGTkxFTkJRVU1zV1VGQldTeERRVUZETzFGQlEzSkNMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXp0QlFVTnFRaXhEUVVGRE8wRkJiRU5sTERSQ1FVRnZRaXgxUWtGclEyNURMRU5CUVVFaWZRPT0iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIERhdGUrdGltZSt0aW1lem9uZSByZXByZXNlbnRhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgamF2YXNjcmlwdF8xID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcclxudmFyIG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG52YXIgdGltZXNvdXJjZV8xID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxudmFyIGZvcm1hdCA9IHJlcXVpcmUoXCIuL2Zvcm1hdFwiKTtcclxudmFyIHBhcnNlRnVuY3MgPSByZXF1aXJlKFwiLi9wYXJzZVwiKTtcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmZ1bmN0aW9uIG5vd0xvY2FsKCkge1xyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuZXhwb3J0cy5ub3dMb2NhbCA9IG5vd0xvY2FsO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuICovXHJcbmZ1bmN0aW9uIG5vd1V0YygpIHtcclxuICAgIHJldHVybiBEYXRlVGltZS5ub3dVdGMoKTtcclxufVxyXG5leHBvcnRzLm5vd1V0YyA9IG5vd1V0YztcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxyXG4gKi9cclxuZnVuY3Rpb24gbm93KHRpbWVab25lKSB7XHJcbiAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cclxuICAgIHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcbmV4cG9ydHMubm93ID0gbm93O1xyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lLCBmcm9tWm9uZSkge1xyXG4gICAgaWYgKGZyb21ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcclxuICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lLnVuaXhNaWxsaXMgLSBvZmZzZXQgKiA2MDAwMCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbG9jYWxUaW1lLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZSwgdG9ab25lKSB7XHJcbiAgICBpZiAodG9ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XHJcbiAgICAgICAgcmV0dXJuIHRvWm9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lLnVuaXhNaWxsaXMgKyBvZmZzZXQgKiA2MDAwMCkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxudmFyIERhdGVUaW1lID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIERhdGVUaW1lKGExLCBhMiwgYTMsIGgsIG0sIHMsIG1zLCB0aW1lWm9uZSkge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhMSkpIHtcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGEyIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGV4cGVjdCB1bml4VGltZXN0YW1wIHRvIGJlIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGEyIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSA/IGEyIDogbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IHllYXIgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IGRheSB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5ZWFyID0gYTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb250aCA9IGEyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0gYTM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW51dGUgPSAodHlwZW9mIChtKSA9PT0gXCJudW1iZXJcIiA/IG0gOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlY29uZCA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWlsbGkgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpID0gbWF0aC5yb3VuZFN5bShtaWxsaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bSA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodG0udmFsaWRhdGUoKSwgXCJpbnZhbGlkIGRhdGU6IFwiICsgdG0udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgdGltZVpvbmUgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lID8gdGltZVpvbmUgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0bSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEyID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSBhMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1hdFN0cmluZyA9IGEyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgem9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTMgPT09IFwib2JqZWN0XCIgJiYgYTMgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lID0gKGEzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShkYXRlU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHpvbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gcGFyc2VkLnpvbmUgfHwgbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaXZlblN0cmluZyA9IGExLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNzID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYTIgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoc3NbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExIGluc3RhbmNlb2YgYmFzaWNzXzEuVGltZVN0cnVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGExLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhMSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFhMyB8fCBhMyBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGltZVpvbmUgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSAoYTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGsgPSAoYTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEzID8gYTMgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgZ2l2ZW4sIG1ha2UgbG9jYWwgZGF0ZXRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0ZVRpbWUucHJvdG90eXBlLCBcInV0Y0RhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91dGNEYXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwiem9uZURhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lRGF0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93TG9jYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobiwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0LCB0aW1lem9uZV8xLlRpbWVab25lLmxvY2FsKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93VXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93ID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XHJcbiAgICAgICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG4gICAgICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcbiAgICAgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLmZyb21FeGNlbCA9IGZ1bmN0aW9uIChuLCB0aW1lWm9uZSkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIG4gPT09IFwibnVtYmVyXCIsIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoIWlzTmFOKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuICAgICAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXHJcbiAgICAgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xyXG4gICAgICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZXhpc3RzID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSwgYWxsb3dQcmUxOTcwKSB7XHJcbiAgICAgICAgaWYgKG1vbnRoID09PSB2b2lkIDApIHsgbW9udGggPSAxOyB9XHJcbiAgICAgICAgaWYgKGRheSA9PT0gdm9pZCAwKSB7IGRheSA9IDE7IH1cclxuICAgICAgICBpZiAoaG91ciA9PT0gdm9pZCAwKSB7IGhvdXIgPSAwOyB9XHJcbiAgICAgICAgaWYgKG1pbnV0ZSA9PT0gdm9pZCAwKSB7IG1pbnV0ZSA9IDA7IH1cclxuICAgICAgICBpZiAoc2Vjb25kID09PSB2b2lkIDApIHsgc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmIChtaWxsaXNlY29uZCA9PT0gdm9pZCAwKSB7IG1pbGxpc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmICh6b25lID09PSB2b2lkIDApIHsgem9uZSA9IG51bGw7IH1cclxuICAgICAgICBpZiAoYWxsb3dQcmUxOTcwID09PSB2b2lkIDApIHsgYWxsb3dQcmUxOTcwID0gZmFsc2U7IH1cclxuICAgICAgICBpZiAoIWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSlcclxuICAgICAgICAgICAgfHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xyXG4gICAgICAgICAgICByZXR1cm4gKHllYXIgPT09IGR0LnllYXIoKSAmJiBtb250aCA9PT0gZHQubW9udGgoKSAmJiBkYXkgPT09IGR0LmRheSgpXHJcbiAgICAgICAgICAgICAgICAmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuem9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fem9uZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXHJcbiAgICAgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnpvbmVBYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICBpZiAodGhpcy56b25lKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuem9uZSgpLmFiYnJldmlhdGlvbkZvclV0Yyh0aGlzLnV0Y0RhdGUsIGRzdERlcGVuZGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgaG91ciAwLTIzXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG4gICAgICogd2VlayBkYXkgbnVtYmVycylcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG4gICAgICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS55ZWFyRGF5KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gICAgICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc2Vjb25kT2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnVuaXhVdGNNaWxsaXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0hvdXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNaW51dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuICAgICAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXlPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNaWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICAgICAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcbiAgICAgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNTZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcbiAgICAgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG4gICAgICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXHJcbiAgICAgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcclxuICAgICAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53aXRoWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLCB6b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cclxuICAgICAqIFRocm93cyBpZiB0aGlzIGRhdGUgZG9lcyBub3QgaGF2ZSBhIHRpbWUgem9uZS5cclxuICAgICAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgaWYgKHpvbmUpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlLCB0aGlzLl96b25lKTsgLy8gY2F1c2Ugem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHpvbmU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlLCB0aGlzLl96b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl96b25lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG4gICAgICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcbiAgICAgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3JcclxuICAgICAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxyXG4gICAgICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgaWYgKHpvbmUpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG4gICAgICAgICAgICByZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuICAgICAgICAgICAgcmVzdWx0Ll96b25lID0gem9uZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cclxuICAgICAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXHJcbiAgICAgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmUgT3B0aW9uYWwuIFpvbmUgdG8gY29udmVydCB0bywgZGVmYXVsdCB0aGUgem9uZSB0aGUgZGF0ZXRpbWUgaXMgYWxyZWFkeSBpbi5cclxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9FeGNlbCA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xyXG4gICAgICAgIHZhciBkdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRpbWVab25lICYmICF0aW1lWm9uZS5lcXVhbHModGhpcy56b25lKCkpKSB7XHJcbiAgICAgICAgICAgIGR0ID0gdGhpcy50b1pvbmUodGltZVpvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXAgKyBvZmZzZXRNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNFeGNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcclxuICAgICAgICAvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcbiAgICAgICAgdmFyIG1zZWNzID0gcmVzdWx0IC8gKDEgLyA4NjQwMDAwMCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBsZW1lbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIHZhciBhbW91bnQ7XHJcbiAgICAgICAgdmFyIHU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IChhMSk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG4gICAgICAgICAgICB1ID0gZHVyYXRpb24udW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IChhMSk7XHJcbiAgICAgICAgICAgIHUgPSB1bml0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkTG9jYWwgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICB2YXIgYW1vdW50O1xyXG4gICAgICAgIHZhciB1O1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuICAgICAgICAgICAgdSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gKGFtb3VudCA+PSAwID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXAgOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0sIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuICAgICAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxyXG4gICAgICogbmVjZXNzYXJ5LlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX2FkZFRvVGltZVN0cnVjdCA9IGZ1bmN0aW9uICh0bSwgYW1vdW50LCB1bml0KSB7XHJcbiAgICAgICAgdmFyIHllYXI7XHJcbiAgICAgICAgdmFyIG1vbnRoO1xyXG4gICAgICAgIHZhciBkYXk7XHJcbiAgICAgICAgdmFyIGhvdXI7XHJcbiAgICAgICAgdmFyIG1pbnV0ZTtcclxuICAgICAgICB2YXIgc2Vjb25kO1xyXG4gICAgICAgIHZhciBtaWxsaTtcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNjAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcbiAgICAgICAgICAgICAgICAvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcclxuICAgICAgICAgICAgICAgIGlmIChhbW91bnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmNlaWwoKGFtb3VudCAtICgxMiAtIHRtLmNvbXBvbmVudHMubW9udGgpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6IHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG4gICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIGFtb3VudDtcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIgJiYgYTEgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IChhMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3ViTG9jYWwgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKGExLm11bHRpcGx5KC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIGExLCB1bml0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgLSBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcclxuICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5sZXNzRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPD0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiAodGhpcy56b25lRGF0ZS5lcXVhbHMob3RoZXIuem9uZURhdGUpXHJcbiAgICAgICAgICAgICYmICh0aGlzLl96b25lID09PSBudWxsKSA9PT0gKG90aGVyLl96b25lID09PSBudWxsKVxyXG4gICAgICAgICAgICAmJiAodGhpcy5fem9uZSA9PT0gbnVsbCB8fCB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG4gICAgICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHMgKyB0aW1lem9uZV8xLlRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuICAgICAqIHNwZWNpZmllZCBmb3JtYXQuIFRoZSBmb3JtYXQgaXMgaW1wbGVtZW50ZWQgYXMgdGhlIExETUwgc3RhbmRhcmRcclxuICAgICAqIChodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF9QYXR0ZXJucylcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcclxuICAgICAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE9wdGlvbmFsLCBub24tZW5nbGlzaCBmb3JtYXQgbW9udGggbmFtZXMgZXRjLlxyXG4gICAgICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLnpvbmVEYXRlLCB0aGlzLnV0Y0RhdGUsIHRoaXMuem9uZSgpLCBmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XHJcbiAgICAgKiBAcGFyYW0gcyB0aGUgc3RyaW5nIHRvIHBhcnNlXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0IHRoZSBmb3JtYXQgdGhlIHN0cmluZyBpcyBpblxyXG4gICAgICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wYXJzZSA9IGZ1bmN0aW9uIChzLCBmb3JtYXQsIHpvbmUpIHtcclxuICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl96b25lLmtpbmQoKSAhPT0gdGltZXpvbmVfMS5UaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBkbyBub3Qgc2VwYXJhdGUgSVNPIHpvbmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZSA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPCA4KSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xyXG4gICAgICogZmFrZSB0aW1lIGluIHRlc3RzLiBEYXRlVGltZS5ub3dMb2NhbCgpIGFuZCBEYXRlVGltZS5ub3dVdGMoKVxyXG4gICAgICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS50aW1lU291cmNlID0gbmV3IHRpbWVzb3VyY2VfMS5SZWFsVGltZVNvdXJjZSgpO1xyXG4gICAgcmV0dXJuIERhdGVUaW1lO1xyXG59KCkpO1xyXG5leHBvcnRzLkRhdGVUaW1lID0gRGF0ZVRpbWU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpHRjBaWFJwYldVdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12YkdsaUwyUmhkR1YwYVcxbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN08wZEJTVWM3UVVGRlNDeFpRVUZaTEVOQlFVTTdRVUZGWWl4MVFrRkJiVUlzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZET1VJc2RVSkJRVGhETEZWQlFWVXNRMEZCUXl4RFFVRkJPMEZCUTNwRUxFbEJRVmtzVFVGQlRTeFhRVUZOTEZWQlFWVXNRMEZCUXl4RFFVRkJPMEZCUTI1RExIbENRVUY1UWl4WlFVRlpMRU5CUVVNc1EwRkJRVHRCUVVOMFF5d3lRa0ZCT0VJc1kwRkJZeXhEUVVGRExFTkJRVUU3UVVGRE4wTXNTVUZCV1N4SlFVRkpMRmRCUVUwc1VVRkJVU3hEUVVGRExFTkJRVUU3UVVGREwwSXNNa0pCUVRKRExHTkJRV01zUTBGQlF5eERRVUZCTzBGQlF6RkVMSGxDUVVGMVF5eFpRVUZaTEVOQlFVTXNRMEZCUVR0QlFVTndSQ3cwUWtGQlowTXNaVUZCWlN4RFFVRkRMRU5CUVVFN1FVRkRhRVFzU1VGQldTeE5RVUZOTEZkQlFVMHNWVUZCVlN4RFFVRkRMRU5CUVVFN1FVRkRia01zU1VGQldTeFZRVUZWTEZkQlFVMHNVMEZCVXl4RFFVRkRMRU5CUVVFN1FVRkZkRU03TzBkQlJVYzdRVUZEU0R0SlFVTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTTdRVUZETlVJc1EwRkJRenRCUVVabExHZENRVUZSTEZkQlJYWkNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTzBsQlEwTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dEJRVU14UWl4RFFVRkRPMEZCUm1Vc1kwRkJUU3hUUVVWeVFpeERRVUZCTzBGQlJVUTdPenRIUVVkSE8wRkJRMGdzWVVGQmIwSXNVVUZCYlVNN1NVRkJia01zZDBKQlFXMURMRWRCUVc1RExGZEJRWEZDTEcxQ1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRk8wbEJRM1JFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBGQlF5OUNMRU5CUVVNN1FVRkdaU3hYUVVGSExFMUJSV3hDTEVOQlFVRTdRVUZGUkN4elFrRkJjMElzVTBGQmNVSXNSVUZCUlN4UlFVRnRRanRKUVVNdlJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMlFzU1VGQlRTeE5RVUZOTEVkQlFWY3NVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVU42UkN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVjc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF6bEVMRU5CUVVNN1NVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU5RTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03U1VGRE1VSXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSQ3gzUWtGQmQwSXNUMEZCYlVJc1JVRkJSU3hOUVVGcFFqdEpRVU0zUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExb3NTVUZCVFN4TlFVRk5MRWRCUVZjc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVTndSQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzYlVKQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hIUVVGSExFMUJRVTBzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNSR0xFTkJRVU03U1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTlFMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdTVUZEZUVJc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGRlJEczdPMGRCUjBjN1FVRkRTRHRKUVRKTVF6czdUMEZGUnp0SlFVTklMR3RDUVVORExFVkJRVkVzUlVGQlJTeEZRVUZSTEVWQlFVVXNSVUZCVVN4RlFVTTFRaXhEUVVGVkxFVkJRVVVzUTBGQlZTeEZRVUZGTEVOQlFWVXNSVUZCUlN4RlFVRlhMRVZCUXk5RExGRkJRV003VVVGRFpDeE5RVUZOTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzSkNMRXRCUVVzc1VVRkJVVHRuUWtGQlJTeERRVUZETzI5Q1FVTm1MRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUzBGQlN5eFRRVUZUTEVsQlFVa3NSVUZCUlN4TFFVRkxMRWxCUVVrc1NVRkJTU3hGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJReTlFTERaQ1FVRTJRanQzUWtGRE4wSXNaMEpCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkZMREJFUVVFd1JDeERRVUZETEVOQlFVTTdkMEpCUXpkR0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzVVVGQlVTeEpRVUZKTEVWQlFVVXNXVUZCV1N4dFFrRkJVU3hIUVVGaExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRlRVlzU1VGQlNTeDFRa0ZCZFVJc1UwRkJVU3hEUVVGRE8zZENRVU53UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRhRUlzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExHbENRVUZwUWl4RFFVRkRMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRlRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZETVVZc1EwRkJRenQzUWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzMFFrRkRVQ3hKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NiVUpCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZUTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRelZFTEVOQlFVTTdiMEpCUTBZc1EwRkJRenR2UWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRVQ3cyUWtGQk5rSTdkMEpCUXpkQ0xHZENRVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhMUVVGTExGRkJRVkVzUlVGQlJTeHJSRUZCYTBRc1EwRkJReXhEUVVGRE8zZENRVU55Uml4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUVVVc2JVUkJRVzFFTEVOQlFVTXNRMEZCUXp0M1FrRkRkRVlzWjBKQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzVVVGQlVTeEZRVUZGTEdsRVFVRnBSQ3hEUVVGRExFTkJRVU03ZDBKQlEzQkdMRWxCUVVrc1NVRkJTU3hIUVVGdFFpeEZRVUZGTEVOQlFVTTdkMEpCUXpsQ0xFbEJRVWtzUzBGQlN5eEhRVUZ0UWl4RlFVRkZMRU5CUVVNN2QwSkJReTlDTEVsQlFVa3NSMEZCUnl4SFFVRnRRaXhGUVVGRkxFTkJRVU03ZDBKQlF6ZENMRWxCUVVrc1NVRkJTU3hIUVVGWExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRkZCUVZFc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNKRUxFbEJRVWtzVFVGQlRTeEhRVUZYTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExGRkJRVkVzUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM1pFTEVsQlFVa3NUVUZCVFN4SFFVRlhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEZGQlFWRXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEzWkVMRWxCUVVrc1MwRkJTeXhIUVVGWExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4TFFVRkxMRkZCUVZFc1IwRkJSeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNoRUxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU16UWl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0M1FrRkROMElzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03ZDBKQlEzcENMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2RDUVVNelFpeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dDNRa0ZETDBJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN2QwSkJReTlDTEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzNkQ1FVTTNRaXhKUVVGTkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEcxQ1FVRlZMRU5CUVVNc1JVRkJSU3hWUVVGSkxFVkJRVVVzV1VGQlN5eEZRVUZGTEZGQlFVY3NSVUZCUlN4VlFVRkpMRVZCUVVVc1kwRkJUU3hGUVVGRkxHTkJRVTBzUlVGQlJTeFpRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVNM1JTeG5Ra0ZCVFN4RFFVRkRMRVZCUVVVc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeHRRa0ZCYVVJc1JVRkJSU3hEUVVGRExGRkJRVkVzUlVGQlNTeERRVUZETEVOQlFVTTdkMEpCUlhoRUxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzVVVGQlVTeEpRVUZKTEZGQlFWRXNXVUZCV1N4dFFrRkJVU3hIUVVGSExGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkZhRWNzZDBSQlFYZEVPM2RDUVVONFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEYUVJc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVOdVJDeERRVUZETzNkQ1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE96UkNRVU5RTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGRE8zZENRVU55UWl4RFFVRkRPMjlDUVVOR0xFTkJRVU03WjBKQlEwWXNRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRFVpeExRVUZMTEZGQlFWRTdaMEpCUVVVc1EwRkJRenR2UWtGRFppeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTFRaXh6UWtGQmMwSTdkMEpCUTNSQ0xFbEJRVTBzVlVGQlZTeEhRVUZ0UWl4RlFVRkZMRU5CUVVNN2QwSkJRM1JETEVsQlFVMHNXVUZCV1N4SFFVRnRRaXhGUVVGRkxFTkJRVU03ZDBKQlEzaERMRWxCUVVrc1NVRkJTU3hIUVVGaExFbEJRVWtzUTBGQlF6dDNRa0ZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEV0QlFVc3NVVUZCVVN4SlFVRkpMRVZCUVVVc1dVRkJXU3h0UWtGQlVTeERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRkRVFzU1VGQlNTeEhRVUZoTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM1pDTEVOQlFVTTdkMEpCUTBRc1NVRkJUU3hOUVVGTkxFZEJRVWNzVlVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRVZCUVVVc1dVRkJXU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTm9SU3hKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNN2QwSkJRemRDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeEpRVUZKTEVOQlFVTTdiMEpCUTJ4RExFTkJRVU03YjBKQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN2QwSkJRMUFzU1VGQlRTeFhRVUZYTEVkQlFWa3NSVUZCUnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8zZENRVU40UXl4SlFVRk5MRVZCUVVVc1IwRkJZU3hSUVVGUkxFTkJRVU1zYzBKQlFYTkNMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03ZDBKQlEyeEZMR2RDUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRVZCUVVVc0swSkJRU3RDTEVkQlFWY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU0zUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRelZDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dDNRa0ZETjBJc1EwRkJRenQzUWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzMFFrRkRVQ3hKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEcxQ1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOdVF5eERRVUZETzNkQ1FVTkVMQ3RFUVVFclJEdDNRa0ZETDBRc2QwSkJRWGRDTzNkQ1FVTjRRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEcxQ1FVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNNVF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEYUVJc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenQzUWtGREwwUXNRMEZCUXp0dlFrRkRSaXhEUVVGRE8yZENRVU5HTEVOQlFVTTdaMEpCUVVNc1MwRkJTeXhEUVVGRE8xbEJRMUlzUzBGQlN5eFJRVUZSTzJkQ1FVRkZMRU5CUVVNN2IwSkJRMllzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4WlFVRlpMRzFDUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTVRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenQzUWtGRE5VSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN2IwSkJReTlDTEVOQlFVTTdiMEpCUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVWQlFVVXNXVUZCV1N4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU12UWl4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUXpsQ0xEQkdRVUV3Uml4RFFVRkRMRU5CUVVNN2QwSkJRemRHTEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeFpRVUZaTEcxQ1FVRlJMRVZCUVVVc05FUkJRVFJFTEVOQlFVTXNRMEZCUXp0M1FrRkRjRWNzU1VGQlRTeERRVUZETEVkQlFXVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenQzUWtGRE0wSXNTVUZCVFN4RlFVRkZMRWRCUVdsRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUXpsRExFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTTVRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEcxQ1FVRlZMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0M1FrRkROVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlEyaENMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN2QwSkJReTlFTEVOQlFVTTdiMEpCUTBZc1EwRkJRenRuUWtGRFJpeERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOU0xFdEJRVXNzVjBGQlZ6dG5Ra0ZCUlN4RFFVRkRPMjlDUVVOc1FpeHhRMEZCY1VNN2IwSkJRM0pETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0dlFrRkRPVUlzU1VGQlNTeERRVUZETEZGQlFWRXNSMEZCUnl4dFFrRkJWU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVGRkxEQkNRVUZoTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1owSkJRM1JHTEVOQlFVTTdaMEpCUVVNc1MwRkJTeXhEUVVGRE8xbEJRMUlzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYzBSQlFYTkVMRU5CUVVNc1EwRkJRenRuUWtGRGVrVXNRMEZCUXp0UlFVTklMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJibE5FTEhOQ1FVRlpMRFpDUVVGUE8yRkJRVzVDTzFsQlEwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRjRUlzU1VGQlNTeERRVUZETEZGQlFWRXNSMEZCUnl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkRNVVFzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJRM1JDTEVOQlFVTTdZVUZEUkN4VlFVRnZRaXhMUVVGcFFqdFpRVU53UXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU4wUWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExGTkJRVk1zUTBGQlF6dFJRVU0xUWl4RFFVRkRPenM3VDBGS1FUdEpRVlZFTEhOQ1FVRlpMRGhDUVVGUk8yRkJRWEJDTzFsQlEwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRja0lzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkROVVFzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRE8xRkJRM1pDTEVOQlFVTTdZVUZEUkN4VlFVRnhRaXhMUVVGcFFqdFpRVU55UXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU4yUWl4SlFVRkpMRU5CUVVNc1VVRkJVU3hIUVVGSExGTkJRVk1zUTBGQlF6dFJRVU16UWl4RFFVRkRPenM3VDBGS1FUdEpRVzFDUkRzN1QwRkZSenRKUVVOWExHbENRVUZSTEVkQlFYUkNPMUZCUTBNc1NVRkJUU3hEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVOd1F5eE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxEQkNRVUZoTEVOQlFVTXNSMEZCUnl4RlFVRkZMRzFDUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTTNSQ3hEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEVnl4bFFVRk5MRWRCUVhCQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNNRUpCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzYlVKQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJRM1JHTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFZ5eFpRVUZITEVkQlFXcENMRlZCUVd0Q0xGRkJRVzFETzFGQlFXNURMSGRDUVVGdFF5eEhRVUZ1UXl4WFFVRnhRaXh0UWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlR0UlFVTndSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGQlJTd3dRa0ZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3h0UWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBsQlEzWkhMRU5CUVVNN1NVRkZSRHM3T3pzN096dFBRVTlITzBsQlExY3NhMEpCUVZNc1IwRkJka0lzVlVGQmQwSXNRMEZCVXl4RlFVRkZMRkZCUVcxQ08xRkJRM0pFTEdkQ1FVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzVVVGQlVTeEZRVUZGTEN0RFFVRXJReXhEUVVGRExFTkJRVU03VVVGREwwVXNaMEpCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN3NFEwRkJPRU1zUTBGQlF5eERRVUZETzFGQlEyeEZMR2RDUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRGhEUVVFNFF5eERRVUZETEVOQlFVTTdVVUZEY0VVc1NVRkJUU3hoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU53UlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zWVVGQllTeEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMGxCUXpsRExFTkJRVU03U1VGRlJEczdPenM3T3pzN08wOUJVMGM3U1VGRFZ5eGxRVUZOTEVkQlFYQkNMRlZCUTBNc1NVRkJXU3hGUVVGRkxFdEJRV2xDTEVWQlFVVXNSMEZCWlN4RlFVTm9SQ3hKUVVGblFpeEZRVUZGTEUxQlFXdENMRVZCUVVVc1RVRkJhMElzUlVGQlJTeFhRVUYxUWl4RlFVTnFSaXhKUVVGeFFpeEZRVUZGTEZsQlFUWkNPMUZCUm5SRExIRkNRVUZwUWl4SFFVRnFRaXhUUVVGcFFqdFJRVUZGTEcxQ1FVRmxMRWRCUVdZc1QwRkJaVHRSUVVOb1JDeHZRa0ZCWjBJc1IwRkJhRUlzVVVGQlowSTdVVUZCUlN4elFrRkJhMElzUjBGQmJFSXNWVUZCYTBJN1VVRkJSU3h6UWtGQmEwSXNSMEZCYkVJc1ZVRkJhMEk3VVVGQlJTd3lRa0ZCZFVJc1IwRkJka0lzWlVGQmRVSTdVVUZEYWtZc2IwSkJRWEZDTEVkQlFYSkNMRmRCUVhGQ08xRkJRVVVzTkVKQlFUWkNMRWRCUVRkQ0xHOUNRVUUyUWp0UlFVVndSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGSExFTkJRVU03WlVGRGNrUXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzcEdMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRFpDeERRVUZETzFGQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0UlFVTmtMRU5CUVVNN1VVRkRSQ3hKUVVGSkxFTkJRVU03V1VGRFNpeEpRVUZOTEVWQlFVVXNSMEZCUnl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVc1RVRkJUU3hGUVVGRkxFMUJRVTBzUlVGQlJTeFhRVUZYTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRia1lzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeExRVUZMTEV0QlFVc3NSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFZEJRVWNzUzBGQlN5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RlFVRkZPMjFDUVVOc1JTeEpRVUZKTEV0QlFVc3NSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFMUJRVTBzUzBGQlN5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1RVRkJUU3hMUVVGTExFVkJRVVVzUTBGQlF5eE5RVUZOTEVWQlFVVXNTVUZCU1N4WFFVRlhMRXRCUVVzc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYWtnc1EwRkJSVHRSUVVGQkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRXaXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEyUXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRXdURVE3TzA5QlJVYzdTVUZEU1N4M1FrRkJTeXhIUVVGYU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUTJoRUxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMSFZDUVVGSkxFZEJRVmc3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJRenRKUVVOdVFpeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEcxRFFVRm5RaXhIUVVGMlFpeFZRVUYzUWl4WlFVRTBRanRSUVVFMVFpdzBRa0ZCTkVJc1IwRkJOVUlzYlVKQlFUUkNPMUZCUTI1RUxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFrSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZsQlFWa3NRMEZCUXl4RFFVRkRPMUZCUTI1RkxFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRFdDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzZVVKQlFVMHNSMEZCWWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU5xUml4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDFRa0ZCU1N4SFFVRllPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRKUVVOMFF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3gzUWtGQlN5eEhRVUZhTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4elFrRkJSeXhIUVVGV08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUTBGQlF6dEpRVU55UXl4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDFRa0ZCU1N4SFFVRllPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRKUVVOMFF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTjRReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4NVFrRkJUU3hIUVVGaU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF6dEpRVU40UXl4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTdzRRa0ZCVnl4SFFVRnNRanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU03U1VGRGRrTXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRN1VVRkRReXhOUVVGTkxFTkJRVlVzVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1NVRkRjRVVzUTBGQlF6dEpRVVZFT3pzN096dFBRVXRITzBsQlEwa3NORUpCUVZNc1IwRkJhRUk3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFVkJRVVVzUTBGQlF6dEpRVU5vUXl4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzTmtKQlFWVXNSMEZCYWtJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEycEZMRU5CUVVNN1NVRkZSRHM3T3pzN08wOUJUVWM3U1VGRFNTdzRRa0ZCVnl4SFFVRnNRanRSUVVORExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEYkVVc1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzT0VKQlFWY3NSMEZCYkVJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEzUkZMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEdkRFFVRmhMRWRCUVhCQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRE8wbEJRMmhETEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEQkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMGxCUTNKRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREpDUVVGUkxFZEJRV1k3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETzBsQlEzUkRMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhsQ1FVRk5MRWRCUVdJN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhEUVVGRE8wbEJRM0JETEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEQkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMGxCUTNKRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMRFJDUVVGVExFZEJRV2hDTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N3MFFrRkJVeXhIUVVGb1FqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEZGtNc1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzSzBKQlFWa3NSMEZCYmtJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEzcEZMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEdsRFFVRmpMRWRCUVhKQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU4wUXl4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NOa0pCUVZVc1IwRkJha0k3VVVGRFF5eE5RVUZOTEVOQlFWVXNUVUZCVFN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03U1VGRGJrVXNRMEZCUXp0SlFVVkVPenM3T3pzN1QwRk5SenRKUVVOSkxHZERRVUZoTEVkQlFYQkNPMUZCUTBNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU14UlN4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzYVVOQlFXTXNSMEZCY2tJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlF6TkZMRU5CUVVNN1NVRkZSRHM3T3pzN1QwRkxSenRKUVVOSkxHbERRVUZqTEVkQlFYSkNPMUZCUTBNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU12UlN4RFFVRkRPMGxCUlVRN096czdPenM3TzA5QlVVYzdTVUZEU1N3eVFrRkJVU3hIUVVGbUxGVkJRV2RDTEVsQlFXVTdVVUZET1VJc1RVRkJUU3hEUVVGRExFbEJRVWtzVVVGQlVTeERRVU5zUWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGNrTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NSVUZCUlN4RlFVTTNSQ3hKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU5TTEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlEwa3NNRUpCUVU4c1IwRkJaQ3hWUVVGbExFbEJRV1U3VVVGRE4wSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5XTEdkQ1FVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeHBSVUZCYVVVc1EwRkJReXhEUVVGRE8xbEJRM1JHTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE4wSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF5d3lSVUZCTWtVN1dVRkRMMFlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEzQkNMRWxCUVVrc1EwRkJReXhSUVVGUkxFZEJRVWNzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNLMEpCUVN0Q08yZENRVU14Uml4RFFVRkRPMmRDUVVORUxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmRDUVVOc1FpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJRenRaUVVNMVFpeERRVUZETzFGQlEwWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtJc1RVRkJUU3hEUVVGRE8xbEJRMUlzUTBGQlF6dFpRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNKQ0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVY3NZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpWRUxFTkJRVU03V1VGRFJDeEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOc1FpeEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRExIRkRRVUZ4UXp0UlFVTnFSU3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0SlFVTmlMRU5CUVVNN1NVRkZSRHM3T3pzN096czdUMEZSUnp0SlFVTkpMSGxDUVVGTkxFZEJRV0lzVlVGQll5eEpRVUZsTzFGQlF6VkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEVml4blFrRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNhVVZCUVdsRkxFTkJRVU1zUTBGQlF6dFpRVU4wUml4SlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxGRkJRVkVzUlVGQlJTeERRVUZETzFsQlF6bENMRTFCUVUwc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0WlFVTTVRaXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTndRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlEyWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETVVNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPenRQUVVsSE8wbEJRMGtzZVVKQlFVMHNSMEZCWWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRM2hFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTJwRkxFTkJRVU03U1VGRlJEczdPenM3VDBGTFJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRc1ZVRkJaU3hSUVVGdFFqdFJRVU5xUXl4SlFVRkpMRVZCUVVVc1IwRkJZU3hKUVVGSkxFTkJRVU03VVVGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETDBNc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkROVUlzUTBGQlF6dFJRVU5FTEVsQlFVMHNXVUZCV1N4SFFVRkhMRVZCUVVVc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUXpkRExFbEJRVTBzWVVGQllTeEhRVUZITEVWQlFVVXNRMEZCUXl4aFFVRmhMRVZCUVVVc1EwRkJRenRSUVVONlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMSEZDUVVGeFFpeERRVUZETEdGQlFXRXNSMEZCUnl4WlFVRlpMRU5CUVVNc1EwRkJRenRKUVVOcVJTeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTERaQ1FVRlZMRWRCUVdwQ08xRkJRME1zU1VGQlRTeGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRE8xRkJRek5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1NVRkRiRVFzUTBGQlF6dEpRVVZQTEhkRFFVRnhRaXhIUVVFM1FpeFZRVUU0UWl4RFFVRlRPMUZCUTNSRExFbEJRVTBzVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETzFGQlEzSkVMQ3RDUVVFclFqdFJRVU12UWl4SlFVRk5MRXRCUVVzc1IwRkJSeXhOUVVGTkxFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRkRU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNN1NVRkRNME1zUTBGQlF6dEpRWGRDUkRzN1QwRkZSenRKUVVOSkxITkNRVUZITEVkQlFWWXNWVUZCVnl4RlFVRlBMRVZCUVVVc1NVRkJaVHRSUVVOc1F5eEpRVUZKTEUxQlFXTXNRMEZCUXp0UlFVTnVRaXhKUVVGSkxFTkJRVmNzUTBGQlF6dFJRVU5vUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVFpeEpRVUZOTEZGQlFWRXNSMEZCZFVJc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVU14UXl4TlFVRk5MRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETzFsQlF6TkNMRU5CUVVNc1IwRkJSeXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEY2tJc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNaMEpCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkZMR2xEUVVGcFF5eERRVUZETEVOQlFVTTdXVUZEY0VVc1owSkJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1VVRkJVU3hGUVVGRkxHdERRVUZyUXl4RFFVRkRMRU5CUVVNN1dVRkRka1VzVFVGQlRTeEhRVUZYTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRkRUlzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVTldMRU5CUVVNN1VVRkRSQ3hKUVVGTkxFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE4wUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeHRRa0ZCVVN4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVNdlJDeERRVUZETzBsQmJVSk5MREpDUVVGUkxFZEJRV1lzVlVGQlowSXNSVUZCVHl4RlFVRkZMRWxCUVdVN1VVRkRka01zU1VGQlNTeE5RVUZqTEVOQlFVTTdVVUZEYmtJc1NVRkJTU3hEUVVGWExFTkJRVU03VVVGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRPVUlzU1VGQlRTeFJRVUZSTEVkQlFYVkNMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGRE1VTXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dFpRVU16UWl4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzSkNMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEdkQ1FVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUlN4cFEwRkJhVU1zUTBGQlF5eERRVUZETzFsQlEzQkZMR2RDUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRkZCUVZFc1JVRkJSU3hyUTBGQmEwTXNRMEZCUXl4RFFVRkRPMWxCUTNaRkxFMUJRVTBzUjBGQlZ5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdVVUZEVml4RFFVRkRPMUZCUTBRc1NVRkJUU3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyaENMRWxCUVUwc1UwRkJVeXhIUVVGdlFpeERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRWRCUVVjc05rSkJRV1VzUTBGQlF5eEZRVUZGTEVkQlFVY3NOa0pCUVdVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU0zUml4SlFVRk5MRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhEUVVGRExFOUJRVThzUlVGQlJTeFRRVUZUTEVOQlFVTXNRMEZCUXp0WlFVTndSU3hOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNWVUZCVlN4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU0zUXl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEzQkRMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOTExHMURRVUZuUWl4SFFVRjRRaXhWUVVGNVFpeEZRVUZqTEVWQlFVVXNUVUZCWXl4RlFVRkZMRWxCUVdNN1VVRkRkRVVzU1VGQlNTeEpRVUZaTEVOQlFVTTdVVUZEYWtJc1NVRkJTU3hMUVVGaExFTkJRVU03VVVGRGJFSXNTVUZCU1N4SFFVRlhMRU5CUVVNN1VVRkRhRUlzU1VGQlNTeEpRVUZaTEVOQlFVTTdVVUZEYWtJc1NVRkJTU3hOUVVGakxFTkJRVU03VVVGRGJrSXNTVUZCU1N4TlFVRmpMRU5CUVVNN1VVRkRia0lzU1VGQlNTeExRVUZoTEVOQlFVTTdVVUZGYkVJc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTmtMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eFhRVUZYTzJkQ1FVTjRRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemxFTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTk8yZENRVU51UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOeVJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1RVRkJUVHRuUWtGRGJrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMFJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHRuUWtGRGFrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1IwRkJSenRuUWtGRGFFSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHRuUWtGRGFrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SFFVRkhMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE4wVXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzJkQ1FVTnlRaXhuUWtGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzSzBOQlFTdERMRU5CUVVNc1EwRkJRenRuUWtGRE5VVXNlVVJCUVhsRU8yZENRVU42UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRha0lzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzI5Q1FVTnNSaXhMUVVGTExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8yZENRVU55Uml4RFFVRkRPMmRDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzI5Q1FVTlFMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1EwRkJRenR2UWtGRGJFWXNTMEZCU3l4SFFVRkhMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0blFrRkRjRVlzUTBGQlF6dG5Ra0ZEUkN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU51UlN4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTTdaMEpCUXpGQ0xFMUJRVTBzUjBGQlJ5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJRenRuUWtGRE9VSXNUVUZCVFN4SFFVRkhMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETzJkQ1FVTTVRaXhMUVVGTExFZEJRVWNzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNN1owSkJRelZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zUlVGQlJTeFZRVUZKTEVWQlFVVXNXVUZCU3l4RlFVRkZMRkZCUVVjc1JVRkJSU3hWUVVGSkxFVkJRVVVzWTBGQlRTeEZRVUZGTEdOQlFVMHNSVUZCUlN4WlFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRE8xbEJRekZGTEVOQlFVTTdXVUZEUkN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUTNCQ0xHZENRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUlVGQlJTdzRRMEZCT0VNc1EwRkJReXhEUVVGRE8yZENRVU16UlN4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NUVUZCVFN4RFFVRkRPMmRDUVVOdVF5eExRVUZMTEVkQlFVY3NSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU03WjBKQlF6VkNMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEyNUZMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRNVUlzVFVGQlRTeEhRVUZITEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRE8yZENRVU01UWl4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTTdaMEpCUXpsQ0xFdEJRVXNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJRenRuUWtGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eEZRVUZGTEZWQlFVa3NSVUZCUlN4WlFVRkxMRVZCUVVVc1VVRkJSeXhGUVVGRkxGVkJRVWtzUlVGQlJTeGpRVUZOTEVWQlFVVXNZMEZCVFN4RlFVRkZMRmxCUVVzc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGRE1VVXNRMEZCUXp0WlFVTkVMREJDUVVFd1FqdFpRVU14UWp0blFrRkRReXgzUWtGQmQwSTdaMEpCUTNoQ0xEQkNRVUV3UWp0blFrRkRNVUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRFZpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSE5DUVVGelFpeERRVUZETEVOQlFVTTdaMEpCUTNwRExFTkJRVU03VVVGRFNDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFWVk5MSE5DUVVGSExFZEJRVllzVlVGQlZ5eEZRVUZQTEVWQlFVVXNTVUZCWlR0UlFVTnNReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRXRCUVVzc1VVRkJVU3hKUVVGSkxFVkJRVVVzV1VGQldTeHRRa0ZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFJDeEpRVUZOTEZGQlFWRXNSMEZCZFVJc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVU14UXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU40UXl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeG5Ra0ZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRkxFTkJRVU1zUzBGQlN5eFJRVUZSTEVWQlFVVXNhVU5CUVdsRExFTkJRVU1zUTBGQlF6dFpRVU53UlN4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUVVVc2EwTkJRV3RETEVOQlFVTXNRMEZCUXp0WlFVTjJSU3hKUVVGTkxFMUJRVTBzUjBGQmJVSXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOd1F5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRjRU1zUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZQVFN3eVFrRkJVU3hIUVVGbUxGVkJRV2RDTEVWQlFVOHNSVUZCUlN4SlFVRmxPMUZCUTNaRExFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVmtzUlVGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGJrUXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpkRExFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzZFVKQlFVa3NSMEZCV0N4VlFVRlpMRXRCUVdVN1VVRkRNVUlzVFVGQlRTeERRVUZETEVsQlFVa3NiVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZWQlFWVXNSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEzcEZMRU5CUVVNN1NVRkZSRHM3TzAxQlIwVTdTVUZEU3l3MlFrRkJWU3hIUVVGcVFqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03U1VGRGNrWXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTEN0Q1FVRlpMRWRCUVc1Q08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTTFSU3hEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc09FSkJRVmNzUjBGQmJFSTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTJwRkxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREpDUVVGUkxFZEJRV1lzVlVGQlowSXNTMEZCWlR0UlFVTTVRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRWRCUVVjc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZETTBRc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NORUpCUVZNc1IwRkJhRUlzVlVGQmFVSXNTMEZCWlR0UlFVTXZRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZETlVRc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NlVUpCUVUwc1IwRkJZaXhWUVVGakxFdEJRV1U3VVVGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRKUVVNelF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3cwUWtGQlV5eEhRVUZvUWl4VlFVRnBRaXhMUVVGbE8xRkJReTlDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNN1pVRkRlRU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NTMEZCU3l4SlFVRkpMRU5CUVVNN1pVRkRhRVFzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGRE5VUXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTERoQ1FVRlhMRWRCUVd4Q0xGVkJRVzFDTEV0QlFXVTdVVUZEYWtNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4SFFVRkhMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETzBsQlF6TkVMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEN0Q1FVRlpMRWRCUVc1Q0xGVkJRVzlDTEV0QlFXVTdVVUZEYkVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETzBsQlF6VkVMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhOQ1FVRkhMRWRCUVZZc1ZVRkJWeXhMUVVGbE8xRkJRM3BDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpGQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkRja0lzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03U1VGRGRFSXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzYzBKQlFVY3NSMEZCVml4VlFVRlhMRXRCUVdVN1VVRkRla0lzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETjBJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0UlFVTnlRaXhEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRKUVVOMFFpeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzT0VKQlFWY3NSMEZCYkVJN1VVRkRReXhKUVVGTkxFTkJRVU1zUjBGQlZ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRE8xRkJRek5ETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyaENMRTFCUVUwc1EwRkJReXhEUVVGRExFZEJRVWNzYlVKQlFWRXNRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl3NFFrRkJPRUk3VVVGRGJFWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMR3RDUVVGclFqdFJRVU0zUWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96czdPenM3T3p0UFFWRkhPMGxCUTBrc2VVSkJRVTBzUjBGQllpeFZRVUZqTEZsQlFXOUNMRVZCUVVVc1lVRkJiME03VVVGRGRrVXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4WlFVRlpMRVZCUVVVc1lVRkJZU3hEUVVGRExFTkJRVU03U1VGRE4wWXNRMEZCUXp0SlFVVkVPenM3T3p0UFFVdEhPMGxCUTFjc1kwRkJTeXhIUVVGdVFpeFZRVUZ2UWl4RFFVRlRMRVZCUVVVc1RVRkJZeXhGUVVGRkxFbEJRV1U3VVVGRE4wUXNTVUZCVFN4TlFVRk5MRWRCUVVjc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMnBFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVNdlF5eERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzTWtKQlFWRXNSMEZCWmp0UlFVTkRMRWxCUVUwc1EwRkJReXhIUVVGWExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNN1VVRkRNME1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4MVFrRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXk5RExFMUJRVTBzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNRMEZCUXl4cFJFRkJhVVE3V1VGRE1VWXNRMEZCUXp0WlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVU5RTEUxQlFVMHNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4RFFVRkRMREpDUVVFeVFqdFpRVU01UkN4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExHdENRVUZyUWp0UlFVTTNRaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc01FSkJRVThzUjBGQlpEdFJRVU5ETEUxQlFVMHNRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXp0SlFVTTVReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N3d1FrRkJUeXhIUVVGa08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRVZCUVVVc1EwRkJRenRKUVVNM1FpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3c0UWtGQlZ5eEhRVUZzUWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTlpMQ3RDUVVGelFpeEhRVUZ5UXl4VlFVRnpReXhEUVVGVE8xRkJRemxETEVsQlFVMHNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVU42UWl4SlFVRk5MRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVVzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTjRRaXhKUVVGSkxFdEJRVXNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM0pETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYUVJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzFsQlEzSkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8xRkJRMllzUTBGQlF6dFJRVU5FTEV0QlFVc3NSMEZCUnl4UFFVRlBMRU5CUVVNc1YwRkJWeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEycERMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRhRUlzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTNKRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnlReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlEyWXNRMEZCUXp0UlFVTkVMRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJwRExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRM0pETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTJ4RExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEWml4RFFVRkRPMUZCUTBRc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFhRVUZYTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkRha01zUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXgzUTBGQmQwTTdVVUZEY2tRc1EwRkJRenRSUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRM0pETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTJ4RExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEWml4RFFVRkRPMUZCUTBRc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTndRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzBsQlEyWXNRMEZCUXp0SlFYb3JRa1E3T3pzN1QwRkpSenRKUVVOWExHMUNRVUZWTEVkQlFXVXNTVUZCU1N3eVFrRkJZeXhGUVVGRkxFTkJRVU03U1VGeEswSTNSQ3hsUVVGRE8wRkJRVVFzUTBGQlF5eEJRV2hvUTBRc1NVRm5hRU5ETzBGQmFHaERXU3huUWtGQlVTeFhRV2RvUTNCQ0xFTkJRVUVpZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSBkdXJhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gKi9cclxuZnVuY3Rpb24geWVhcnMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLnllYXJzKG4pO1xyXG59XHJcbmV4cG9ydHMueWVhcnMgPSB5ZWFycztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICovXHJcbmZ1bmN0aW9uIG1vbnRocyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xyXG59XHJcbmV4cG9ydHMubW9udGhzID0gbW9udGhzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5kYXlzKG4pO1xyXG59XHJcbmV4cG9ydHMuZGF5cyA9IGRheXM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gKi9cclxuZnVuY3Rpb24gaG91cnMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLmhvdXJzKG4pO1xyXG59XHJcbmV4cG9ydHMuaG91cnMgPSBob3VycztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gKi9cclxuZnVuY3Rpb24gbWludXRlcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcclxufVxyXG5leHBvcnRzLm1pbnV0ZXMgPSBtaW51dGVzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xyXG59XHJcbmV4cG9ydHMuc2Vjb25kcyA9IHNlY29uZHM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXHJcbiAqL1xyXG5mdW5jdGlvbiBtaWxsaXNlY29uZHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcclxufVxyXG5leHBvcnRzLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcztcclxuLyoqXHJcbiAqIFRpbWUgZHVyYXRpb24gd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYW4gYW1vdW50IGFuZCBhIHVuaXQgZS5nLlxyXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxyXG4gKlxyXG4gKiBJdCBoYXMgdHdvIHNldHMgb2YgZ2V0dGVyIGZ1bmN0aW9uczpcclxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxyXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxyXG4gKiAtIHNlY29uZHMoKSwgbWludXRlcygpLCBob3VycygpIGV0YywgcGx1cmFsIGZvcm06IHRoZXNlIHJldHVybiB0aGUgdG90YWwgYW1vdW50IHJlcHJlc2VudGVkIGluIHRoZSBjb3JyZXNwb25kaW5nIHVuaXQuXHJcbiAqL1xyXG52YXIgRHVyYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEdXJhdGlvbihpMSwgdW5pdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGkxKSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAvLyBhbW91bnQrdW5pdCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gaTE7XHJcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9ICh0eXBlb2YgdW5pdCA9PT0gXCJudW1iZXJcIiA/IHVuaXQgOiBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoaTEpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8vIHN0cmluZyBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB0aGlzLl9mcm9tU3RyaW5nKGkxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi55ZWFycyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5tb250aHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uZGF5cyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5ob3VycyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1pbnV0ZXMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnNlY29uZHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhbm90aGVyIGluc3RhbmNlIG9mIER1cmF0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFzID0gZnVuY3Rpb24gKHVuaXQpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcbiAgICAgICAgICAgIHZhciByZXFNb250aHMgPSAodW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTW9udGhzIC8gcmVxTW9udGhzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcbiAgICAgICAgICAgIHZhciByZXFNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0aGlzIGR1cmF0aW9uIHRvIGEgRHVyYXRpb24gaW4gYW5vdGhlciB1bml0LiBZb3UgYWx3YXlzIGdldCBhIGNsb25lIGV2ZW4gaWYgeW91IHNwZWNpZnlcclxuICAgICAqIHRoZSBzYW1lIHVuaXQuXHJcbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtaWxsaXNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiA0MDAgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbnV0ZXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgOTAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW51dGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWludXRlIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ob3VycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBob3VyIHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBkYXkgaGFzIDI0IGhvdXJzICh3aGljaCBpcyBub3QgdGhlIGNhc2VcclxuICAgICAqIGR1cmluZyBEU1QgY2hhbmdlcykuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBwYXJ0IGNhbiBleGNlZWQgMjMgaG91cnMsIGJlY2F1c2UgZm9yXHJcbiAgICAgKiBub3csIHdlIGRvIG5vdCBoYXZlIGEgZGF5cygpIGZ1bmN0aW9uXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDI1IGZvciBhIC0yNTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlSG91cnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRheSBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgbW9udGggaGFzIDMwIGRheXMuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRocyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnllYXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm9uLWZyYWN0aW9uYWwgcG9zaXRpdmUgeWVhcnNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xyXG4gICAgICAgICAgICAgICAgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1bml0IHRoaXMgZHVyYXRpb24gd2FzIGNyZWF0ZWQgd2l0aFxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdW5pdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpZ25cclxuICAgICAqIEByZXR1cm4gXCItXCIgaWYgdGhlIGR1cmF0aW9uIGlzIG5lZ2F0aXZlXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDwgb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPD0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuICAgICAqIFJldHVybnMgZmFsc2UgaWYgd2UgY2Fubm90IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsIGluIGFsbCB0aW1lIHpvbmVzXHJcbiAgICAgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmVxdWFsc0V4YWN0ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPD0gYmFzaWNzXzEuVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IGJhc2ljc18xLlRpbWVVbml0LkRheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgPT09IG90aGVyLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IG90aGVyLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID4gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID49IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAqIHZhbHVlKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIERpdmlkZSBieSBhIGZpeGVkIG51bWJlci5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbi5kaXZpZGUoKTogRGl2aWRlIGJ5IHplcm9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgZHVyYXRpb24uXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdCBhIGR1cmF0aW9uLlxyXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAtIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZHVyYXRpb24gaS5lLiByZW1vdmUgdGhlIHNpZ24uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIGluIFstXWhoaGg6bW06c3Mubm5uIG5vdGF0aW9uLiBBbGwgZmllbGRzIGFyZVxyXG4gICAgICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9GdWxsU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cclxuICAgICAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xyXG4gICAgICogICAgICAgICAgICAgYXJlIGNob3BwZWQgb2ZmIGlmIHplcm9cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvSG1zU3RyaW5nID0gZnVuY3Rpb24gKGZ1bGwpIHtcclxuICAgICAgICBpZiAoZnVsbCA9PT0gdm9pZCAwKSB7IGZ1bGwgPSBmYWxzZTsgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xyXG4gICAgICAgIGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLnNlY29uZCgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLm1pbnV0ZSgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbnV0ZSgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl91bml0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArICh0aGlzLl9hbW91bnQgLyAxMDAwKS50b0ZpeGVkKDMpICsgXCJTXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIlNcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiSFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJEXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiWVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiIFwiICsgYmFzaWNzLnRpbWVVbml0VG9TdHJpbmcodGhpcy5fdW5pdCwgdGhpcy5fYW1vdW50KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW0R1cmF0aW9uOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5fcGFydCA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKHVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV4dFVuaXQ7XHJcbiAgICAgICAgLy8gbm90ZSBub3QgYWxsIHVuaXRzIGFyZSB1c2VkIGhlcmU6IFdlZWtzIGFuZCBZZWFycyBhcmUgcnVsZWQgb3V0XHJcbiAgICAgICAgc3dpdGNoICh1bml0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtc2VjcyA9IChiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpICUgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMobmV4dFVuaXQpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKG1zZWNzIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCkpO1xyXG4gICAgfTtcclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5fZnJvbVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICBpZiAodHJpbW1lZC5tYXRjaCgvXi0/XFxkXFxkPyg6XFxkXFxkPyg6XFxkXFxkPyguXFxkXFxkP1xcZD8pPyk/KT8kLykpIHtcclxuICAgICAgICAgICAgdmFyIHNpZ24gPSAxO1xyXG4gICAgICAgICAgICB2YXIgaG91cnNfMSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBtaW51dGVzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgc2Vjb25kc18xID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbGxpc2Vjb25kc18xID0gMDtcclxuICAgICAgICAgICAgdmFyIHBhcnRzID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQocGFydHMubGVuZ3RoID4gMCAmJiBwYXJ0cy5sZW5ndGggPCA0LCBcIk5vdCBhIHByb3BlciB0aW1lIGR1cmF0aW9uIHN0cmluZzogXFxcIlwiICsgdHJpbW1lZCArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgaWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICAgICAgc2lnbiA9IC0xO1xyXG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5zdWJzdHIoMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXJzXzEgPSArcGFydHNbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZXNfMSA9ICtwYXJ0c1sxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZFBhcnRzID0gcGFydHNbMl0uc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc18xID0gK3NlY29uZFBhcnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHNfMSA9ICtzdHJpbmdzLnBhZFJpZ2h0KHNlY29uZFBhcnRzWzFdLCAzLCBcIjBcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFtb3VudE1zZWMgPSBzaWduICogTWF0aC5yb3VuZChtaWxsaXNlY29uZHNfMSArIDEwMDAgKiBzZWNvbmRzXzEgKyA2MDAwMCAqIG1pbnV0ZXNfMSArIDM2MDAwMDAgKiBob3Vyc18xKTtcclxuICAgICAgICAgICAgLy8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG4gICAgICAgICAgICBpZiAobWlsbGlzZWNvbmRzXzEgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzZWNvbmRzXzEgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobWludXRlc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGhvdXJzXzEgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHRyaW1tZWQudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggIT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gcGFyc2VGbG9hdChzcGxpdFswXSk7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoIWlzTmFOKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBjYW5ub3QgcGFyc2UgYW1vdW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGlzRmluaXRlKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBhbW91bnQgaXMgaW5maW5pdGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIER1cmF0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLkR1cmF0aW9uID0gRHVyYXRpb247XHJcbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWkhWeVlYUnBiMjR1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDJSMWNtRjBhVzl1TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPenM3TzBkQlNVYzdRVUZGU0N4WlFVRlpMRU5CUVVNN1FVRkZZaXgxUWtGQmJVSXNWVUZCVlN4RFFVRkRMRU5CUVVFN1FVRkRPVUlzZFVKQlFYbENMRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJRM0JETEVsQlFWa3NUVUZCVFN4WFFVRk5MRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJRMjVETEVsQlFWa3NUMEZCVHl4WFFVRk5MRmRCUVZjc1EwRkJReXhEUVVGQk8wRkJSM0pET3pzN08wZEJTVWM3UVVGRFNDeGxRVUZ6UWl4RFFVRlRPMGxCUXpsQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRekZDTEVOQlFVTTdRVUZHWlN4aFFVRkxMRkZCUlhCQ0xFTkJRVUU3UVVGRlJEczdPenRIUVVsSE8wRkJRMGdzWjBKQlFYVkNMRU5CUVZNN1NVRkRMMElzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRE0wSXNRMEZCUXp0QlFVWmxMR05CUVUwc1UwRkZja0lzUTBGQlFUdEJRVVZFT3pzN08wZEJTVWM3UVVGRFNDeGpRVUZ4UWl4RFFVRlRPMGxCUXpkQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM3BDTEVOQlFVTTdRVUZHWlN4WlFVRkpMRTlCUlc1Q0xFTkJRVUU3UVVGRlJEczdPenRIUVVsSE8wRkJRMGdzWlVGQmMwSXNRMEZCVXp0SlFVTTVRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVNeFFpeERRVUZETzBGQlJtVXNZVUZCU3l4UlFVVndRaXhEUVVGQk8wRkJSVVE3T3pzN1IwRkpSenRCUVVOSUxHbENRVUYzUWl4RFFVRlRPMGxCUTJoRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRelZDTEVOQlFVTTdRVUZHWlN4bFFVRlBMRlZCUlhSQ0xFTkJRVUU3UVVGRlJEczdPenRIUVVsSE8wRkJRMGdzYVVKQlFYZENMRU5CUVZNN1NVRkRhRU1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRE5VSXNRMEZCUXp0QlFVWmxMR1ZCUVU4c1ZVRkZkRUlzUTBGQlFUdEJRVVZFT3pzN08wZEJTVWM3UVVGRFNDeHpRa0ZCTmtJc1EwRkJVenRKUVVOeVF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU5xUXl4RFFVRkRPMEZCUm1Vc2IwSkJRVmtzWlVGRk0wSXNRMEZCUVR0QlFVVkVPenM3T3pzN096dEhRVkZITzBGQlEwZzdTVUU0UmtNN08wOUJSVWM3U1VGRFNDeHJRa0ZCV1N4RlFVRlJMRVZCUVVVc1NVRkJaVHRSUVVOd1F5eEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVRaXd3UWtGQk1FSTdXVUZETVVJc1NVRkJUU3hOUVVGTkxFZEJRVmNzUlVGQlJTeERRVUZETzFsQlF6RkNMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzVFVGQlRTeERRVUZETzFsQlEzUkNMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eFBRVUZQTEVsQlFVa3NTMEZCU3l4UlFVRlJMRWRCUVVjc1NVRkJTU3hIUVVGSExHbENRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1VVRkRka1VzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOeVF5eHhRa0ZCY1VJN1dVRkRja0lzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCVXl4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVNNVFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3h6UWtGQmMwSTdXVUZEZEVJc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEYWtJc1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eHBRa0ZCVVN4RFFVRkRMRmRCUVZjc1EwRkJRenRSUVVOdVF5eERRVUZETzBsQlEwWXNRMEZCUXp0SlFXNUhSRHM3T3p0UFFVbEhPMGxCUTFjc1kwRkJTeXhIUVVGdVFpeFZRVUZ2UWl4RFFVRlRPMUZCUXpWQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOWExHVkJRVTBzUjBGQmNFSXNWVUZCY1VJc1EwRkJVenRSUVVNM1FpeE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxHbENRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRlRU1zUTBGQlF6dEpRVVZFT3pzN08wOUJTVWM3U1VGRFZ5eGhRVUZKTEVkQlFXeENMRlZCUVcxQ0xFTkJRVk03VVVGRE0wSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRM1JETEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlExY3NZMEZCU3l4SFFVRnVRaXhWUVVGdlFpeERRVUZUTzFGQlF6VkNMRTFCUVUwc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVXNhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU4yUXl4RFFVRkRPMGxCUlVRN096czdUMEZKUnp0SlFVTlhMR2RDUVVGUExFZEJRWEpDTEZWQlFYTkNMRU5CUVZNN1VVRkRPVUlzVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSU3hwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMGxCUTNwRExFTkJRVU03U1VGRlJEczdPenRQUVVsSE8wbEJRMWNzWjBKQlFVOHNSMEZCY2tJc1ZVRkJjMElzUTBGQlV6dFJRVU01UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRGVrTXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEVnl4eFFrRkJXU3hIUVVFeFFpeFZRVUV5UWl4RFFVRlRPMUZCUTI1RExFMUJRVTBzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0SlFVTTVReXhEUVVGRE8wbEJkME5FT3p0UFFVVkhPMGxCUTBrc2QwSkJRVXNzUjBGQldqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVNdlF5eERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEhGQ1FVRkZMRWRCUVZRc1ZVRkJWU3hKUVVGak8xRkJRM1pDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFdEJRVXNzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjZRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTnlRaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFbEJRVWtzYVVKQlFWRXNRMEZCUXl4TFFVRkxMRWxCUVVrc1NVRkJTU3hKUVVGSkxHbENRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOdVJTeEpRVUZOTEZWQlFWVXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRWRCUVVjc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6TkVMRWxCUVUwc1UwRkJVeXhIUVVGSExFTkJRVU1zU1VGQlNTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTU3hIUVVGSExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTndSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4VlFVRlZMRWRCUVVjc1UwRkJVeXhEUVVGRE8xRkJRemxETEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFbEJRVTBzVVVGQlVTeEhRVUZITEUxQlFVMHNRMEZCUXl4elFrRkJjMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkRNMFFzU1VGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMSE5DUVVGelFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTNCRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRkZCUVZFc1IwRkJSeXhQUVVGUExFTkJRVU03VVVGRE1VTXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3T3pzN1QwRkxSenRKUVVOSkxEQkNRVUZQTEVkQlFXUXNWVUZCWlN4SlFVRmpPMUZCUXpWQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3dyUWtGQldTeEhRVUZ1UWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEdsQ1FVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03U1VGRGRFTXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEU1N3NFFrRkJWeXhIUVVGc1FqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExHbENRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1NVRkRla01zUTBGQlF6dEpRVVZFT3pzN08wOUJTVWM3U1VGRFNTd3dRa0ZCVHl4SFFVRmtPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNhVUpCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU5xUXl4RFFVRkRPMGxCUlVRN096czdUMEZKUnp0SlFVTkpMSGxDUVVGTkxFZEJRV0k3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMGxCUTNCRExFTkJRVU03U1VGRlJEczdPenRQUVVsSE8wbEJRMGtzTUVKQlFVOHNSMEZCWkR0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRGFrTXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEU1N4NVFrRkJUU3hIUVVGaU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SlFVTndReXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOSkxIZENRVUZMTEVkQlFWbzdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJReTlDTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTeDFRa0ZCU1N4SFFVRllPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU5zUXl4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzTmtKQlFWVXNSMEZCYWtJN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eERRVUZETzBsQlEycEhMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N4MVFrRkJTU3hIUVVGWU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0SlFVTTVRaXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4elFrRkJSeXhIUVVGV08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0SlFVTnFReXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc2VVSkJRVTBzUjBGQllqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExHbENRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRhRU1zUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc2QwSkJRVXNzUjBGQldqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExHbENRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRia01zUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxIZENRVUZMTEVkQlFWbzdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJReTlDTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEWkNRVUZWTEVkQlFXcENPMUZCUTBNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYkVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpReXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRekZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEyaEVMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eHpRa0ZCYzBJc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzJkQ1FVTnVSaXhOUVVGTkxFTkJRVU1zYzBKQlFYTkNMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU03U1VGRGNrSXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzZFVKQlFVa3NSMEZCV0R0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETzBsQlEyNUNMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N4MVFrRkJTU3hIUVVGWU8xRkJRME1zVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTNSRExFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3d5UWtGQlVTeEhRVUZtTEZWQlFXZENMRXRCUVdVN1VVRkRPVUlzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1IwRkJSeXhMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdTVUZEYmtRc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMRFJDUVVGVExFZEJRV2hDTEZWQlFXbENMRXRCUVdVN1VVRkRMMElzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1NVRkJTU3hMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdTVUZEY0VRc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTEZWQlFXTXNTMEZCWlR0UlFVTTFRaXhKUVVGTkxGTkJRVk1zUjBGQlJ5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU0xUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUzBGQlN5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1NVRkRMMFVzUTBGQlF6dEpRVVZFT3pzN096czdUMEZOUnp0SlFVTkpMRGhDUVVGWExFZEJRV3hDTEZWQlFXMUNMRXRCUVdVN1VVRkRha01zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1NVRkJTU3hwUWtGQlVTeERRVUZETEV0QlFVc3NTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzYVVKQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzFGQlF6TkNMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1NVRkJTU3hwUWtGQlVTeERRVUZETEVkQlFVY3NTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzYVVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1JGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzFGQlF6TkNMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRaQ3hEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc05FSkJRVk1zUjBGQmFFSXNWVUZCYVVJc1MwRkJaVHRSUVVNdlFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1MwRkJTeXhMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVsQlFVa3NTVUZCU1N4RFFVRkRMRXRCUVVzc1MwRkJTeXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdTVUZEZGtVc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMRGhDUVVGWExFZEJRV3hDTEZWQlFXMUNMRXRCUVdVN1VVRkRha01zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1IwRkJSeXhMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdTVUZEYmtRc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMQ3RDUVVGWkxFZEJRVzVDTEZWQlFXOUNMRXRCUVdVN1VVRkRiRU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1NVRkJTU3hMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdTVUZEY0VRc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMSE5DUVVGSExFZEJRVllzVlVGQlZ5eExRVUZsTzFGQlEzcENMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRekZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03VVVGRGNrSXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdTVUZEZEVJc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMSE5DUVVGSExFZEJRVllzVlVGQlZ5eExRVUZsTzFGQlEzcENMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemRDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03VVVGRGNrSXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdTVUZEZEVJc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRTU3d5UWtGQlVTeEhRVUZtTEZWQlFXZENMRXRCUVdFN1VVRkROVUlzVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOMlJDeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEhsQ1FVRk5MRWRCUVdJc1ZVRkJZeXhMUVVGaE8xRkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEycENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYlVOQlFXMURMRU5CUVVNc1EwRkJRenRSUVVOMFJDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU4yUkN4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NjMEpCUVVjc1IwRkJWaXhWUVVGWExFdEJRV1U3VVVGRGVrSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wbEJRM1JGTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTeHpRa0ZCUnl4SFFVRldMRlZCUVZjc1MwRkJaVHRSUVVONlFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlJ5eExRVUZMTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRkRVVzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc2MwSkJRVWNzUjBGQlZqdFJRVU5ETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjJRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNVUlzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTd3JRa0ZCV1N4SFFVRnVRanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJReTlDTEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlEwa3NPRUpCUVZjc1IwRkJiRUlzVlVGQmJVSXNTVUZCY1VJN1VVRkJja0lzYjBKQlFYRkNMRWRCUVhKQ0xGbEJRWEZDTzFGQlEzWkRMRWxCUVVrc1RVRkJUU3hIUVVGWExFVkJRVVVzUTBGQlF6dFJRVU40UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFbEJRVWtzU1VGQlNTeERRVUZETEZkQlFWY3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNFTXNUVUZCVFN4SFFVRkhMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM3BGTEVOQlFVTTdVVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFbEJRVWtzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRVFzVFVGQlRTeEhRVUZITEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4SFFVRkhMRTFCUVUwc1EwRkJRenRSUVVNM1JTeERRVUZETzFGQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hKUVVGSkxFMUJRVTBzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNCRUxFMUJRVTBzUjBGQlJ5eEhRVUZITEVkQlFVY3NUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeEhRVUZITEVOQlFVTXNSMEZCUnl4TlFVRk5MRU5CUVVNN1VVRkROMFVzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hIUVVGSExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTTdTVUZEZGtZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NPRUpCUVZjc1IwRkJiRUk3VVVGRFF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4TFFVRkxMR2xDUVVGUkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTTdaMEpCUXpOQ0xFMUJRVTBzUTBGQlF5eEhRVUZITEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFTkJRVU03V1VGRGNrUXNRMEZCUXp0WlFVTkVMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXp0blFrRkRkRUlzVFVGQlRTeERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRU5CUVVNN1dVRkRPVU1zUTBGQlF6dFpRVU5FTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dG5Ra0ZEZEVJc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4MVEwRkJkVU03V1VGRGRrWXNRMEZCUXp0WlFVTkVMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0blFrRkRjRUlzVFVGQlRTeERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRU5CUVVNN1dVRkRPVU1zUTBGQlF6dFpRVU5FTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dG5Ra0ZEYmtJc1RVRkJUU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZET1VNc1EwRkJRenRaUVVORUxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRGNFSXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhIUVVGSExFTkJRVU03V1VGRE9VTXNRMEZCUXp0WlFVTkVMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0blFrRkRja0lzVFVGQlRTeERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRU5CUVVNN1dVRkRPVU1zUTBGQlF6dFpRVU5FTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dG5Ra0ZEY0VJc1RVRkJUU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZET1VNc1EwRkJRenRaUVVORUxEQkNRVUV3UWp0WlFVTXhRanRuUWtGRFF5eDNRa0ZCZDBJN1owSkJRM2hDTERCQ1FVRXdRanRuUWtGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExITkNRVUZ6UWl4RFFVRkRMRU5CUVVNN1owSkJRM3BETEVOQlFVTTdVVUZEU0N4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NNa0pCUVZFc1IwRkJaanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVkQlFVY3NUVUZCVFN4RFFVRkRMR2RDUVVGblFpeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzBsQlF6VkdMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRN1VVRkRReXhOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU03U1VGRE9VTXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzTUVKQlFVOHNSMEZCWkR0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdTVUZETlVJc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwc3NkMEpCUVVzc1IwRkJZaXhWUVVGakxFbEJRV003VVVGRE0wSXNkMEpCUVhkQ08xRkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROVUlzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNKRUxFTkJRVU03VVVGRFJDeEpRVUZKTEZGQlFXdENMRU5CUVVNN1VVRkRka0lzYTBWQlFXdEZPMUZCUTJ4RkxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNWMEZCVnp0blFrRkJSU3hSUVVGUkxFZEJRVWNzYVVKQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJRVU1zUzBGQlN5eERRVUZETzFsQlF6ZEVMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eE5RVUZOTzJkQ1FVRkZMRkZCUVZFc1IwRkJSeXhwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRGVFUXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFMUJRVTA3WjBKQlFVVXNVVUZCVVN4SFFVRkhMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOMFJDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHRuUWtGQlJTeFJRVUZSTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU03WjBKQlFVTXNTMEZCU3l4RFFVRkRPMWxCUTI1RUxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SFFVRkhPMmRDUVVGRkxGRkJRVkVzUjBGQlJ5eHBRa0ZCVVN4RFFVRkRMRXRCUVVzc1EwRkJRenRuUWtGQlF5eExRVUZMTEVOQlFVTTdXVUZEY0VRc1MwRkJTeXhwUWtGQlVTeERRVUZETEV0QlFVczdaMEpCUVVVc1VVRkJVU3hIUVVGSExHbENRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVGRExFdEJRVXNzUTBGQlF6dFJRVU4wUkN4RFFVRkRPMUZCUlVRc1NVRkJUU3hMUVVGTExFZEJRVWNzUTBGQlF5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRWRCUVVjc1RVRkJUU3hEUVVGRExITkNRVUZ6UWl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRemRJTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTm9SU3hEUVVGRE8wbEJSMDhzT0VKQlFWY3NSMEZCYmtJc1ZVRkJiMElzUTBGQlV6dFJRVU0xUWl4SlFVRk5MRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEZWtJc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4NVEwRkJlVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVSQ3hKUVVGSkxFbEJRVWtzUjBGQlZ5eERRVUZETEVOQlFVTTdXVUZEY2tJc1NVRkJTU3hQUVVGTExFZEJRVmNzUTBGQlF5eERRVUZETzFsQlEzUkNMRWxCUVVrc1UwRkJUeXhIUVVGWExFTkJRVU1zUTBGQlF6dFpRVU40UWl4SlFVRkpMRk5CUVU4c1IwRkJWeXhEUVVGRExFTkJRVU03V1VGRGVFSXNTVUZCU1N4alFVRlpMRWRCUVZjc1EwRkJReXhEUVVGRE8xbEJRemRDTEVsQlFVMHNTMEZCU3l4SFFVRmhMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZETTBNc1owSkJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4MVEwRkJkVU1zUjBGQlJ5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRka2NzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVNdlFpeEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMVlzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRMMElzUTBGQlF6dFpRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRkRUlzVDBGQlN5eEhRVUZITEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVDTEVOQlFVTTdXVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM1JDTEZOQlFVOHNSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU55UWl4RFFVRkRPMWxCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUWl4SlFVRk5MRmRCUVZjc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU40UXl4VFFVRlBMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETlVJc1kwRkJXU3hIUVVGSExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMmRDUVVNeFJDeERRVUZETzFsQlEwWXNRMEZCUXp0WlFVTkVMRWxCUVUwc1ZVRkJWU3hIUVVGSExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR05CUVZrc1IwRkJSeXhKUVVGSkxFZEJRVWNzVTBGQlR5eEhRVUZITEV0QlFVc3NSMEZCUnl4VFFVRlBMRWRCUVVjc1QwRkJUeXhIUVVGSExFOUJRVXNzUTBGQlF5eERRVUZETzFsQlEzaEhMRzlFUVVGdlJEdFpRVU53UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhqUVVGWkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRlRUlzU1VGQlNTeERRVUZETEV0QlFVc3NSMEZCUnl4cFFrRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU51UXl4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZOQlFVOHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU14UWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExHbENRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRPMWxCUXpsQ0xFTkJRVU03V1VGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1UwRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpGQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03V1VGRE9VSXNRMEZCUXp0WlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZMTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGVFSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhwUWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXp0WlFVTTFRaXhEUVVGRE8xbEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTFBc1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eHBRa0ZCVVN4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVOdVF5eERRVUZETzFsQlEwUXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhWUVVGVkxFZEJRVWNzVFVGQlRTeERRVUZETEhOQ1FVRnpRaXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTjJSU3hEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4SlFVRk5MRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJReTlETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRlRUlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4MVFrRkJkVUlzUjBGQlJ5eERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRjRVFzUTBGQlF6dFpRVU5FTEVsQlFVMHNUVUZCVFN4SFFVRkhMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTndReXhuUWtGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxIVkNRVUYxUWl4SFFVRkhMRU5CUVVNc1IwRkJSeXgzUWtGQmQwSXNRMEZCUXl4RFFVRkRPMWxCUXk5RkxHZENRVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxIVkNRVUYxUWl4SFFVRkhMRU5CUVVNc1IwRkJSeXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMWxCUTJoR0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRPMWxCUTNSQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMR2RDUVVGblFpeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhFTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUTBZc1pVRkJRenRCUVVGRUxFTkJRVU1zUVVFMWJFSkVMRWxCTkd4Q1F6dEJRVFZzUWxrc1owSkJRVkVzVjBFMGJFSndRaXhEUVVGQk8wRkJRVUVzUTBGQlF5SjkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xyXG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbmV4cG9ydHMuTE9OR19NT05USF9OQU1FUyA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG5leHBvcnRzLlNIT1JUX01PTlRIX05BTUVTID0gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG5leHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XHJcbmV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTID0gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XHJcbmV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyA9IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcclxuZXhwb3J0cy5XRUVLREFZX1RXT19MRVRURVJTID0gW1wiU3VcIiwgXCJNb1wiLCBcIlR1XCIsIFwiV2VcIiwgXCJUaFwiLCBcIkZyXCIsIFwiU2FcIl07XHJcbmV4cG9ydHMuV0VFS0RBWV9MRVRURVJTID0gW1wiU1wiLCBcIk1cIiwgXCJUXCIsIFwiV1wiLCBcIlRcIiwgXCJGXCIsIFwiU1wiXTtcclxuZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IFwiUVwiO1xyXG5leHBvcnRzLlFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xyXG5leHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuZXhwb3J0cy5ERUZBVUxUX0ZPUk1BVF9PUFRJT05TID0ge1xyXG4gICAgcXVhcnRlckxldHRlcjogZXhwb3J0cy5RVUFSVEVSX0xFVFRFUixcclxuICAgIHF1YXJ0ZXJXb3JkOiBleHBvcnRzLlFVQVJURVJfV09SRCxcclxuICAgIHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBleHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuICAgIGxvbmdNb250aE5hbWVzOiBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMsXHJcbiAgICBzaG9ydE1vbnRoTmFtZXM6IGV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMsXHJcbiAgICBtb250aExldHRlcnM6IGV4cG9ydHMuTU9OVEhfTEVUVEVSUyxcclxuICAgIGxvbmdXZWVrZGF5TmFtZXM6IGV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTLFxyXG4gICAgc2hvcnRXZWVrZGF5TmFtZXM6IGV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuICAgIHdlZWtkYXlUd29MZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMsXHJcbiAgICB3ZWVrZGF5TGV0dGVyczogZXhwb3J0cy5XRUVLREFZX0xFVFRFUlNcclxufTtcclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0KGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUsIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgaWYgKGZvcm1hdE9wdGlvbnMgPT09IHZvaWQgMCkgeyBmb3JtYXRPcHRpb25zID0ge307IH1cclxuICAgIC8vIG1lcmdlIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCBmb3JtYXQgb3B0aW9uc1xyXG4gICAgLy8gdHlwZWNhc3QgdG8gcHJldmVudCBlcnJvciBUUzcwMTc6IEluZGV4IHNpZ25hdHVyZSBvZiBvYmplY3QgdHlwZSBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxyXG4gICAgdmFyIGdpdmVuRm9ybWF0T3B0aW9ucyA9IGZvcm1hdE9wdGlvbnM7XHJcbiAgICB2YXIgZGVmYXVsdEZvcm1hdE9wdGlvbnMgPSBleHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlM7XHJcbiAgICB2YXIgbWVyZ2VkRm9ybWF0T3B0aW9ucyA9IHt9O1xyXG4gICAgZm9yICh2YXIgbmFtZV8xIGluIGV4cG9ydHMuREVGQVVMVF9GT1JNQVRfT1BUSU9OUykge1xyXG4gICAgICAgIGlmIChleHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlMuaGFzT3duUHJvcGVydHkobmFtZV8xKSkge1xyXG4gICAgICAgICAgICB2YXIgZ2l2ZW5Gb3JtYXRPcHRpb24gPSBnaXZlbkZvcm1hdE9wdGlvbnNbbmFtZV8xXTtcclxuICAgICAgICAgICAgdmFyIGRlZmF1bHRGb3JtYXRPcHRpb24gPSBkZWZhdWx0Rm9ybWF0T3B0aW9uc1tuYW1lXzFdO1xyXG4gICAgICAgICAgICBtZXJnZWRGb3JtYXRPcHRpb25zW25hbWVfMV0gPSBnaXZlbkZvcm1hdE9wdGlvbiB8fCBkZWZhdWx0Rm9ybWF0T3B0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcm1hdE9wdGlvbnMgPSBtZXJnZWRGb3JtYXRPcHRpb25zO1xyXG4gICAgdmFyIHRva2VuaXplciA9IG5ldyB0b2tlbl8xLlRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG4gICAgdmFyIHRva2VucyA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcclxuICAgICAgICB2YXIgdG9rZW5SZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5FUkE6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWUVBUjpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUjpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVk6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9EOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdCArPSB0b2tlblJlc3VsdDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQudHJpbSgpO1xyXG59XHJcbmV4cG9ydHMuZm9ybWF0ID0gZm9ybWF0O1xyXG4vKipcclxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICB2YXIgQUQgPSBkYXRlVGltZS55ZWFyID4gMDtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBcIkFEXCIgOiBcIkJDXCIpO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IFwiQW5ubyBEb21pbmlcIiA6IFwiQmVmb3JlIENocmlzdFwiKTtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHllYXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcInlcIjpcclxuICAgICAgICBjYXNlIFwiWVwiOlxyXG4gICAgICAgIGNhc2UgXCJyXCI6XHJcbiAgICAgICAgICAgIHZhciB5ZWFyVmFsdWUgPSBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUueWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgeWVhclZhbHVlID0geWVhclZhbHVlLnNsaWNlKC0yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geWVhclZhbHVlO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgdmFyIHF1YXJ0ZXIgPSBNYXRoLmNlaWwoZGF0ZVRpbWUubW9udGggLyAzKTtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJXb3JkO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1vbnRoLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMubW9udGhMZXR0ZXJzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB3ZWVrIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrTnVtYmVyKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiZFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiRFwiOlxyXG4gICAgICAgICAgICB2YXIgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF5T2ZZZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICB2YXIgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICB9IC8vIE5vIGJyZWFrLCB0aGlzIGlzIGludGVudGlvbmFsIGZhbGx0aHJvdWdoIVxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5sb25nV2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICByZXR1cm4gKGRhdGVUaW1lLmhvdXIgPCAxMiA/IFwiQU1cIiA6IFwiUE1cIik7XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgSG91clxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgdmFyIGhvdXIgPSBkYXRlVGltZS5ob3VyO1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiaFwiOlxyXG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xyXG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IDEyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJIXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiS1wiOlxyXG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcImtcIjpcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSAyNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwic1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiU1wiOlxyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBkYXRlVGltZS5taWxsaTtcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZyYWN0aW9uU3RyaW5nLnNsaWNlKDAsIHRva2VuLmxlbmd0aCk7XHJcbiAgICAgICAgY2FzZSBcIkFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcclxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgdG9rZW4pIHtcclxuICAgIGlmICghem9uZSkge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gICAgdmFyIG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldEhvdXJzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xyXG4gICAgdmFyIG9mZnNldE1pbnV0ZXMgPSBNYXRoLmFicyhvZmZzZXQgJSA2MCk7XHJcbiAgICB2YXIgb2Zmc2V0TWludXRlc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRNaW51dGVzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIHZhciByZXN1bHQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJPXCI6XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiVVRDXCI7XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRIb3Vycy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID49IDQgfHwgb2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIGNhc2UgXCJaXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VG9rZW4gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiBcIk9PT09cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBcIk9cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInpcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInZcIjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIlZcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWRcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ1bmtcIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5uYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJYXCI6XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJ4XCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2labTl5YldGMExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJ4cFlpOW1iM0p0WVhRdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUU3T3pzN1IwRkpSenRCUVVWSUxGbEJRVmtzUTBGQlF6dEJRVWRpTEVsQlFWa3NUVUZCVFN4WFFVRk5MRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJRMjVETEhOQ1FVRnBSU3hUUVVGVExFTkJRVU1zUTBGQlFUdEJRVU16UlN4SlFVRlpMRTlCUVU4c1YwRkJUU3hYUVVGWExFTkJRVU1zUTBGQlFUdEJRWGREZUVJc2QwSkJRV2RDTEVkQlF6VkNMRU5CUVVNc1UwRkJVeXhGUVVGRkxGVkJRVlVzUlVGQlJTeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRXRCUVVzc1JVRkJSU3hOUVVGTkxFVkJRVVVzVFVGQlRTeEZRVUZGTEZGQlFWRXNSVUZCUlN4WFFVRlhMRVZCUVVVc1UwRkJVeXhGUVVGRkxGVkJRVlVzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVVXZSeXg1UWtGQmFVSXNSMEZETjBJc1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMEZCUlhwRkxIRkNRVUZoTEVkQlEzcENMRU5CUVVNc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVVnFSQ3d3UWtGQmEwSXNSMEZET1VJc1EwRkJReXhSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTEZOQlFWTXNSVUZCUlN4WFFVRlhMRVZCUVVVc1ZVRkJWU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVVnVSU3d5UWtGQmJVSXNSMEZETDBJc1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0QlFVVjBReXd5UWtGQmJVSXNSMEZETDBJc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0QlFVVXZRaXgxUWtGQlpTeEhRVU16UWl4RFFVRkRMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBGQlJYaENMSE5DUVVGakxFZEJRVWNzUjBGQlJ5eERRVUZETzBGQlEzSkNMRzlDUVVGWkxFZEJRVWNzVTBGQlV5eERRVUZETzBGQlEzcENMRFpDUVVGeFFpeEhRVUZITEVOQlFVTXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdRVUZGY2tRc09FSkJRWE5DTEVkQlFXdENPMGxCUTNCRUxHRkJRV0VzUlVGQlJTeHpRa0ZCWXp0SlFVTTNRaXhYUVVGWExFVkJRVVVzYjBKQlFWazdTVUZEZWtJc2IwSkJRVzlDTEVWQlFVVXNOa0pCUVhGQ08wbEJRek5ETEdOQlFXTXNSVUZCUlN4M1FrRkJaMEk3U1VGRGFFTXNaVUZCWlN4RlFVRkZMSGxDUVVGcFFqdEpRVU5zUXl4WlFVRlpMRVZCUVVVc2NVSkJRV0U3U1VGRE0wSXNaMEpCUVdkQ0xFVkJRVVVzTUVKQlFXdENPMGxCUTNCRExHbENRVUZwUWl4RlFVRkZMREpDUVVGdFFqdEpRVU4wUXl4cFFrRkJhVUlzUlVGQlJTd3lRa0ZCYlVJN1NVRkRkRU1zWTBGQll5eEZRVUZGTEhWQ1FVRmxPME5CUXk5Q0xFTkJRVU03UVVGSFJqczdPenM3T3pzN08wZEJVMGM3UVVGRFNDeG5Ra0ZEUXl4UlFVRnZRaXhGUVVOd1FpeFBRVUZ0UWl4RlFVTnVRaXhUUVVGdFFpeEZRVU51UWl4WlFVRnZRaXhGUVVOd1FpeGhRVUZwUXp0SlFVRnFReXcyUWtGQmFVTXNSMEZCYWtNc2EwSkJRV2xETzBsQlJXcERMRzFFUVVGdFJEdEpRVU51UkN4cFIwRkJhVWM3U1VGRGFrY3NTVUZCVFN4clFrRkJhMElzUjBGQlVTeGhRVUZoTEVOQlFVTTdTVUZET1VNc1NVRkJUU3h2UWtGQmIwSXNSMEZCVVN3NFFrRkJjMElzUTBGQlF6dEpRVU42UkN4SlFVRk5MRzFDUVVGdFFpeEhRVUZSTEVWQlFVVXNRMEZCUXp0SlFVTndReXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZOTEUxQlFVa3NTVUZCU1N3NFFrRkJjMElzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETTBNc1JVRkJSU3hEUVVGRExFTkJRVU1zT0VKQlFYTkNMRU5CUVVNc1kwRkJZeXhEUVVGRExFMUJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnFSQ3hKUVVGTkxHbENRVUZwUWl4SFFVRlJMR3RDUVVGclFpeERRVUZETEUxQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTNoRUxFbEJRVTBzYlVKQlFXMUNMRWRCUVZFc2IwSkJRVzlDTEVOQlFVTXNUVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkROVVFzYlVKQlFXMUNMRU5CUVVNc1RVRkJTU3hEUVVGRExFZEJRVWNzYVVKQlFXbENMRWxCUVVrc2JVSkJRVzFDTEVOQlFVTTdVVUZEZEVVc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRFJDeGhRVUZoTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU03U1VGRmNFTXNTVUZCVFN4VFFVRlRMRWRCUVVjc1NVRkJTU3hwUWtGQlV5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMGxCUXpsRExFbEJRVTBzVFVGQlRTeEhRVUZaTEZOQlFWTXNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRKUVVOb1JDeEpRVUZKTEUxQlFVMHNSMEZCVnl4RlFVRkZMRU5CUVVNN1NVRkRlRUlzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRGVFTXNTVUZCVFN4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzaENMRWxCUVVrc1YwRkJWeXhUUVVGUkxFTkJRVU03VVVGRGVFSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY0VJc1MwRkJTeXg1UWtGQlV5eERRVUZETEVkQlFVYzdaMEpCUTJwQ0xGZEJRVmNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8yZENRVU14UXl4TFFVRkxMRU5CUVVNN1dVRkRVQ3hMUVVGTExIbENRVUZUTEVOQlFVTXNTVUZCU1R0blFrRkRiRUlzVjBGQlZ5eEhRVUZITEZkQlFWY3NRMEZCUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03WjBKQlF6TkRMRXRCUVVzc1EwRkJRenRaUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4UFFVRlBPMmRDUVVOeVFpeFhRVUZYTEVkQlFVY3NZMEZCWXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFVkJRVVVzWVVGQllTeERRVUZETEVOQlFVTTdaMEpCUXpkRUxFdEJRVXNzUTBGQlF6dFpRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhMUVVGTE8yZENRVU51UWl4WFFVRlhMRWRCUVVjc1dVRkJXU3hEUVVGRExGRkJRVkVzUlVGQlJTeExRVUZMTEVWQlFVVXNZVUZCWVN4RFFVRkRMRU5CUVVNN1owSkJRek5FTEV0QlFVc3NRMEZCUXp0WlFVTlFMRXRCUVVzc2VVSkJRVk1zUTBGQlF5eEhRVUZITzJkQ1FVTnFRaXhYUVVGWExFZEJRVWNzVlVGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRE1VTXNTMEZCU3l4RFFVRkRPMWxCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEU5QlFVODdaMEpCUTNKQ0xGZEJRVmNzUjBGQlJ5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RlFVRkZMRXRCUVVzc1JVRkJSU3hoUVVGaExFTkJRVU1zUTBGQlF6dG5Ra0ZETjBRc1MwRkJTeXhEUVVGRE8xbEJRMUFzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRk5CUVZNN1owSkJRM1pDTEZkQlFWY3NSMEZCUnl4blFrRkJaMElzUTBGQlF5eFJRVUZSTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRMmhFTEV0QlFVc3NRMEZCUXp0WlFVTlFMRXRCUVVzc2VVSkJRVk1zUTBGQlF5eEpRVUZKTzJkQ1FVTnNRaXhYUVVGWExFZEJRVWNzVjBGQlZ5eERRVUZETEZGQlFWRXNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRE0wTXNTMEZCU3l4RFFVRkRPMWxCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEUxQlFVMDdaMEpCUTNCQ0xGZEJRVmNzUjBGQlJ5eGhRVUZoTEVOQlFVTXNVVUZCVVN4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4TFFVRkxMRU5CUVVNN1dVRkRVQ3hMUVVGTExIbENRVUZUTEVOQlFVTXNUVUZCVFR0blFrRkRjRUlzVjBGQlZ5eEhRVUZITEdGQlFXRXNRMEZCUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03WjBKQlF6ZERMRXRCUVVzc1EwRkJRenRaUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4SlFVRkpPMmRDUVVOc1FpeFhRVUZYTEVkQlFVY3NWMEZCVnl4RFFVRkRMRkZCUVZFc1JVRkJSU3hQUVVGUExFVkJRVVVzVTBGQlV5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVNdlJDeExRVUZMTEVOQlFVTTdXVUZEVUN4TFFVRkxMSGxDUVVGVExFTkJRVU1zU1VGQlNUdG5Ra0ZEYkVJc1YwRkJWeXhIUVVGSExGZEJRVmNzUTBGQlF5eFJRVUZSTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRek5ETEV0QlFVc3NRMEZCUXp0WlFVTlFMRkZCUVZFN1dVRkRVaXhMUVVGTExIbENRVUZUTEVOQlFVTXNVVUZCVVR0blFrRkRkRUlzVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNN1owSkJRM2hDTEV0QlFVc3NRMEZCUXp0UlFVTlNMRU5CUVVNN1VVRkRSQ3hOUVVGTkxFbEJRVWtzVjBGQlZ5eERRVUZETzBsQlEzWkNMRU5CUVVNN1NVRkZSQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMEZCUTNSQ0xFTkJRVU03UVVGNlJXVXNZMEZCVFN4VFFYbEZja0lzUTBGQlFUdEJRVVZFT3pzN096czdSMEZOUnp0QlFVTklMRzlDUVVGdlFpeFJRVUZ2UWl4RlFVRkZMRXRCUVZrN1NVRkRja1FzU1VGQlRTeEZRVUZGTEVkQlFWa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGRFTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZEVJc1MwRkJTeXhEUVVGRExFTkJRVU03VVVGRFVDeExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTlFMRXRCUVVzc1EwRkJRenRaUVVOTUxFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRE0wSXNTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZITEdGQlFXRXNSMEZCUnl4bFFVRmxMRU5CUVVNc1EwRkJRenRSUVVNdlF5eExRVUZMTEVOQlFVTTdXVUZEVEN4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTNwQ08xbEJRME1zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dlFrRkJiMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdTVUZEZGtZc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGRlJEczdPenM3TzBkQlRVYzdRVUZEU0N4eFFrRkJjVUlzVVVGQmIwSXNSVUZCUlN4TFFVRlpPMGxCUTNSRUxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM1JDTEV0QlFVc3NSMEZCUnl4RFFVRkRPMUZCUTFRc1MwRkJTeXhIUVVGSExFTkJRVU03VVVGRFZDeExRVUZMTEVkQlFVYzdXVUZEVUN4SlFVRkpMRk5CUVZNc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNM1JTeEZRVUZGTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNoQ0xGTkJRVk1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFrTXNRMEZCUXp0WlFVTkVMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU03VVVGRGJFSXNNRUpCUVRCQ08xRkJRekZDTzFsQlEwTXNkMEpCUVhkQ08xbEJRM2hDTERCQ1FVRXdRanRaUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2IwSkJRVzlDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhoUVVGaExFZEJRVWNzZVVKQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU01Uml4RFFVRkRPMGxCUTBnc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGRlJEczdPenM3TzBkQlRVYzdRVUZEU0N4M1FrRkJkMElzVVVGQmIwSXNSVUZCUlN4TFFVRlpMRVZCUVVVc1lVRkJORUk3U1VGRGRrWXNTVUZCVFN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRemxETEUxQlFVMHNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzUkNMRXRCUVVzc1EwRkJReXhEUVVGRE8xRkJRMUFzUzBGQlN5eERRVUZETzFsQlEwd3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU53UkN4TFFVRkxMRU5CUVVNN1dVRkRUQ3hOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEdGQlFXRXNSMEZCUnl4UFFVRlBMRU5CUVVNN1VVRkRPVU1zUzBGQlN5eERRVUZETzFsQlEwd3NUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEdGQlFXRXNRMEZCUXl4WFFVRlhMRU5CUVVNN1VVRkRNVVlzUzBGQlN5eERRVUZETzFsQlEwd3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFJRVU16UWl3d1FrRkJNRUk3VVVGRE1VSTdXVUZEUXl4M1FrRkJkMEk3V1VGRGVFSXNNRUpCUVRCQ08xbEJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXh2UWtGQmIwSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExHTkJRV01zUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRkRVlzUTBGQlF6dEpRVU5JTEVOQlFVTTdRVUZEUml4RFFVRkRPMEZCUlVRN096czdPenRIUVUxSE8wRkJRMGdzYzBKQlFYTkNMRkZCUVc5Q0xFVkJRVVVzUzBGQldTeEZRVUZGTEdGQlFUUkNPMGxCUTNKR0xFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM1JDTEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUTFBc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzUkZMRXRCUVVzc1EwRkJRenRaUVVOTUxFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNaVUZCWlN4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETVVRc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjZSQ3hMUVVGTExFTkJRVU03V1VGRFRDeE5RVUZOTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNaRUxEQkNRVUV3UWp0UlFVTXhRanRaUVVORExIZENRVUYzUWp0WlFVTjRRaXd3UWtGQk1FSTdXVUZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEc5Q1FVRnZRaXhIUVVGSExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NZMEZCWXl4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU4wUml4RFFVRkRPMGxCUTBnc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGRlJEczdPenM3TzBkQlRVYzdRVUZEU0N4eFFrRkJjVUlzVVVGQmIwSXNSVUZCUlN4TFFVRlpPMGxCUTNSRUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU14UWl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNWVUZCVlN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzVVVGQlVTeERRVUZETEV0QlFVc3NSVUZCUlN4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dEpRVU4wU0N4RFFVRkRPMGxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRFVDeE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOMlNDeERRVUZETzBGQlEwWXNRMEZCUXp0QlFVVkVPenM3T3pzN1IwRk5SenRCUVVOSUxHOUNRVUZ2UWl4UlFVRnZRaXhGUVVGRkxFdEJRVms3U1VGRGNrUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZEVJc1MwRkJTeXhIUVVGSE8xbEJRMUFzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzQkZMRXRCUVVzc1IwRkJSenRaUVVOUUxFbEJRVTBzVTBGQlV5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeFJRVUZSTEVOQlFVTXNTMEZCU3l4RlFVRkZMRkZCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEY0VZc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkRha1VzTUVKQlFUQkNPMUZCUXpGQ08xbEJRME1zZDBKQlFYZENPMWxCUTNoQ0xEQkNRVUV3UWp0WlFVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiMEpCUVc5Q0xFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4aFFVRmhMRWRCUVVjc2VVSkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVJpeERRVUZETzBsQlEwZ3NRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeDNRa0ZCZDBJc1VVRkJiMElzUlVGQlJTeExRVUZaTEVWQlFVVXNZVUZCTkVJN1NVRkRka1lzU1VGQlRTeGhRVUZoTEVkQlFVY3NUVUZCVFN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVWd1JTeE5RVUZOTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU4wUWl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVOUUxFdEJRVXNzUTBGQlF6dFpRVU5NTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRNVUlzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFsQlEzSkhMRU5CUVVNc1EwRkJReXcyUTBGQk5rTTdVVUZEYUVRc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0UlFVTjJSQ3hMUVVGTExFTkJRVU03V1VGRFRDeE5RVUZOTEVOQlFVTXNZVUZCWVN4RFFVRkRMR2RDUVVGblFpeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRPMUZCUTNSRUxFdEJRVXNzUTBGQlF6dFpRVU5NTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETzFGQlEzQkVMRXRCUVVzc1EwRkJRenRaUVVOTUxFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTTdVVUZEZGtRc01FSkJRVEJDTzFGQlF6RkNPMWxCUTBNc2QwSkJRWGRDTzFsQlEzaENMREJDUVVFd1FqdFpRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYjBKQlFXOUNMRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eGpRVUZqTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8xbEJRM1JHTEVOQlFVTTdTVUZEU0N4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVVWRU96czdPenM3UjBGTlJ6dEJRVU5JTERCQ1FVRXdRaXhSUVVGdlFpeEZRVUZGTEV0QlFWazdTVUZETTBRc1RVRkJUU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NSMEZCUnl4RlFVRkZMRWRCUVVjc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlF6TkRMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeHhRa0ZCY1VJc1VVRkJiMElzUlVGQlJTeExRVUZaTzBsQlEzUkVMRWxCUVVrc1NVRkJTU3hIUVVGSExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTTdTVUZEZWtJc1RVRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRkRUlzUzBGQlN5eEhRVUZITzFsQlExQXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRGFrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTJoQ0xFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTTdXVUZEV0N4RFFVRkRPMWxCUVVFc1EwRkJRenRaUVVOR0xFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRelZFTEV0QlFVc3NSMEZCUnp0WlFVTlFMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUXpWRUxFdEJRVXNzUjBGQlJ6dFpRVU5RTEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRE8xbEJRMnBDTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFGQlF6VkVMRXRCUVVzc1IwRkJSenRaUVVOUUxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5vUWl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRE8xbEJRMWdzUTBGQlF6dFpRVUZCTEVOQlFVTTdXVUZEUml4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTTFSQ3d3UWtGQk1FSTdVVUZETVVJN1dVRkRReXgzUWtGQmQwSTdXVUZEZUVJc01FSkJRVEJDTzFsQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHZRa0ZCYjBJc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEdGQlFXRXNSMEZCUnl4NVFrRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpsR0xFTkJRVU03U1VGRFNDeERRVUZETzBGQlEwWXNRMEZCUXp0QlFVVkVPenM3T3pzN1IwRk5SenRCUVVOSUxIVkNRVUYxUWl4UlFVRnZRaXhGUVVGRkxFdEJRVms3U1VGRGVFUXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMEZCUTNaRkxFTkJRVU03UVVGRlJEczdPenM3TzBkQlRVYzdRVUZEU0N4MVFrRkJkVUlzVVVGQmIwSXNSVUZCUlN4TFFVRlpPMGxCUTNoRUxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM1JDTEV0QlFVc3NSMEZCUnp0WlFVTlFMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOMlJTeExRVUZMTEVkQlFVYzdXVUZEVUN4SlFVRk5MRkZCUVZFc1IwRkJSeXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETzFsQlEyaERMRWxCUVVrc1kwRkJZeXhIUVVGSExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTnNSU3hqUVVGakxFZEJRVWNzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4alFVRmpMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTnlSU3hOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzFGQlF6bERMRXRCUVVzc1IwRkJSenRaUVVOUUxFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUXpOSUxEQkNRVUV3UWp0UlFVTXhRanRaUVVORExIZENRVUYzUWp0WlFVTjRRaXd3UWtGQk1FSTdXVUZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEc5Q1FVRnZRaXhIUVVGSExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NZVUZCWVN4SFFVRkhMSGxDUVVGVExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRPVVlzUTBGQlF6dEpRVU5JTEVOQlFVTTdRVUZEUml4RFFVRkRPMEZCUlVRN096czdPenM3UjBGUFJ6dEJRVU5JTEhGQ1FVRnhRaXhYUVVGMVFpeEZRVUZGTEU5QlFXMUNMRVZCUVVVc1NVRkJZeXhGUVVGRkxFdEJRVms3U1VGRE9VWXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExZ3NUVUZCVFN4RFFVRkRMRVZCUVVVc1EwRkJRenRKUVVOWUxFTkJRVU03U1VGRFJDeEpRVUZOTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVjBGQlZ5eERRVUZETEZWQlFWVXNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTTdTVUZGYWtZc1NVRkJUU3hYUVVGWExFZEJRVmNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUXpsRUxFbEJRVWtzYVVKQlFXbENMRWRCUVVjc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEzaEZMR2xDUVVGcFFpeEhRVUZITEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzYVVKQlFXbENMRWRCUVVjc1IwRkJSeXhIUVVGSExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN1NVRkRkRVlzU1VGQlRTeGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZETlVNc1NVRkJUU3h0UWtGQmJVSXNSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExHRkJRV0VzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRE9VVXNTVUZCU1N4TlFVRmpMRU5CUVVNN1NVRkZia0lzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGRFSXNTMEZCU3l4SFFVRkhPMWxCUTFBc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU5tTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTnFRaXhOUVVGTkxFbEJRVWtzUjBGQlJ5eERRVUZETzFsQlEyWXNRMEZCUXp0WlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVU5RTEUxQlFVMHNTVUZCU1N4SFFVRkhMRU5CUVVNN1dVRkRaaXhEUVVGRE8xbEJRMFFzVFVGQlRTeEpRVUZKTEZkQlFWY3NRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJRenRaUVVOcVF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zU1VGQlNTeGhRVUZoTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE9VTXNUVUZCVFN4SlFVRkpMRWRCUVVjc1IwRkJSeXh0UWtGQmJVSXNRMEZCUXp0WlFVTnlReXhEUVVGRE8xbEJRMFFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXp0UlFVTm1MRXRCUVVzc1IwRkJSenRaUVVOUUxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUWl4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRFVDeExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hMUVVGTExFTkJRVU03YjBKQlEwd3NUVUZCVFN4RFFVRkRMR2xDUVVGcFFpeEhRVUZITEcxQ1FVRnRRaXhEUVVGRE8yZENRVU5vUkN4TFFVRkxMRU5CUVVNN2IwSkJRMHdzU1VGQlRTeFJRVUZSTEVkQlFWVTdkMEpCUTNaQ0xFMUJRVTBzUlVGQlJTeERRVUZETzNkQ1FVTlVMRWRCUVVjc1JVRkJSU3hOUVVGTk8zZENRVU5ZTEUxQlFVMHNSVUZCUlN4SFFVRkhPM2RDUVVOWUxFbEJRVWtzUlVGQlJTeDVRa0ZCVXl4RFFVRkRMRWxCUVVrN2NVSkJRM0JDTEVOQlFVTTdiMEpCUTBZc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eFhRVUZYTEVWQlFVVXNUMEZCVHl4RlFVRkZMRWxCUVVrc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dG5Ra0ZETVVRc1MwRkJTeXhEUVVGRE8yOUNRVU5NTEUxQlFVMHNRMEZCUXl4cFFrRkJhVUlzUjBGQlJ5eEhRVUZITEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU03WjBKQlEzUkVMREJDUVVFd1FqdG5Ra0ZETVVJN2IwSkJRME1zZDBKQlFYZENPMjlDUVVONFFpd3dRa0ZCTUVJN2IwSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXh2UWtGQmIwSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExHTkJRV01zUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN2IwSkJRM1JHTEVOQlFVTTdXVUZEU0N4RFFVRkRPMUZCUTBZc1MwRkJTeXhIUVVGSE8xbEJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzUkNMRXRCUVVzc1EwRkJReXhEUVVGRE8yZENRVU5RTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFdEJRVXNzUTBGQlF6dHZRa0ZEVEN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRmRCUVZjc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtRc1MwRkJTeXhEUVVGRE8yOUNRVU5NTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU03WjBKQlEzaENMREJDUVVFd1FqdG5Ra0ZETVVJN2IwSkJRME1zZDBKQlFYZENPMjlDUVVONFFpd3dRa0ZCTUVJN2IwSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXh2UWtGQmIwSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExHTkJRV01zUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN2IwSkJRM1JHTEVOQlFVTTdXVUZEU0N4RFFVRkRPMUZCUTBZc1MwRkJTeXhIUVVGSE8xbEJRMUFzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjRRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExGZEJRVmNzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVTndSQ3hEUVVGRE8xbEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTFBc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0WlFVTjRRaXhEUVVGRE8xRkJRMFlzUzBGQlN5eEhRVUZITzFsQlExQXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNSQ0xFdEJRVXNzUTBGQlF6dHZRa0ZEVEN4clFrRkJhMEk3YjBKQlEyeENMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03WjBKQlEyUXNTMEZCU3l4RFFVRkRPMjlDUVVOTUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1owSkJRM0JDTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFdEJRVXNzUTBGQlF6dHZRa0ZEVEN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRE8yZENRVU5zUWl3d1FrRkJNRUk3WjBKQlF6RkNPMjlDUVVORExIZENRVUYzUWp0dlFrRkRlRUlzTUVKQlFUQkNPMjlDUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2IwSkJRVzlDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhqUVVGakxFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMjlDUVVOMFJpeERRVUZETzFsQlEwZ3NRMEZCUXp0UlFVTkdMRXRCUVVzc1IwRkJSenRaUVVOUUxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5zUWl4TlFVRk5MRU5CUVVNc1IwRkJSeXhEUVVGRE8xbEJRMW9zUTBGQlF6dFJRVU5HTEV0QlFVc3NSMEZCUnp0WlFVTlFMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOMFFpeExRVUZMTEVOQlFVTTdiMEpCUTB3c1RVRkJUU3hIUVVGSExHbENRVUZwUWl4RFFVRkRPMjlDUVVNelFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4aFFVRmhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEZWtJc1RVRkJUU3hKUVVGSkxHMUNRVUZ0UWl4RFFVRkRPMjlDUVVNdlFpeERRVUZETzI5Q1FVTkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03WjBKQlEyWXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRMUFzUzBGQlN5eERRVUZETzI5Q1FVTk1MRTFCUVUwc1EwRkJReXhwUWtGQmFVSXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF6dG5Ra0ZEYUVRc1MwRkJTeXhEUVVGRExFTkJRVU03WjBKQlExQXNTMEZCU3l4RFFVRkRPMjlDUVVOTUxFMUJRVTBzUTBGQlF5eHBRa0ZCYVVJc1IwRkJSeXhIUVVGSExFZEJRVWNzYlVKQlFXMUNMRU5CUVVNN1owSkJRM1JFTERCQ1FVRXdRanRuUWtGRE1VSTdiMEpCUTBNc2QwSkJRWGRDTzI5Q1FVTjRRaXd3UWtGQk1FSTdiMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dlFrRkJiMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdiMEpCUTNSR0xFTkJRVU03V1VGRFNDeERRVUZETzFGQlEwWXNNRUpCUVRCQ08xRkJRekZDTzFsQlEwTXNkMEpCUVhkQ08xbEJRM2hDTERCQ1FVRXdRanRaUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2IwSkJRVzlDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhoUVVGaExFZEJRVWNzZVVKQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU01Uml4RFFVRkRPMGxCUTBnc1EwRkJRenRCUVVOR0xFTkJRVU1pZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogR2xvYmFsIGZ1bmN0aW9ucyBkZXBlbmRpbmcgb24gRGF0ZVRpbWUvRHVyYXRpb24gZXRjXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgZGF0ZXRpbWVfMSA9IHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gbWluKGQxLCBkMikge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGFzc2VydF8xLmRlZmF1bHQoKGQxIGluc3RhbmNlb2YgZGF0ZXRpbWVfMS5EYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uKSwgXCJFaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zIGV4cGVjdGVkXCIpO1xyXG4gICAgcmV0dXJuIGQxLm1pbihkMik7XHJcbn1cclxuZXhwb3J0cy5taW4gPSBtaW47XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXgoZDEsIGQyKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdCgoZDEgaW5zdGFuY2VvZiBkYXRldGltZV8xLkRhdGVUaW1lICYmIGQyIGluc3RhbmNlb2YgZGF0ZXRpbWVfMS5EYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24pLCBcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcbiAgICByZXR1cm4gZDEubWF4KGQyKTtcclxufVxyXG5leHBvcnRzLm1heCA9IG1heDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGFicyhkKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZCBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24sIFwiZmlyc3QgYXJndW1lbnQgaXMgbm90IGEgRHVyYXRpb25cIik7XHJcbiAgICByZXR1cm4gZC5hYnMoKTtcclxufVxyXG5leHBvcnRzLmFicyA9IGFicztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWjJ4dlltRnNjeTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OXNhV0l2WjJ4dlltRnNjeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPenRIUVVsSE8wRkJSVWdzV1VGQldTeERRVUZETzBGQlJXSXNkVUpCUVcxQ0xGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlF6bENMSGxDUVVGNVFpeFpRVUZaTEVOQlFVTXNRMEZCUVR0QlFVTjBReXg1UWtGQmVVSXNXVUZCV1N4RFFVRkRMRU5CUVVFN1FVRlZkRU03TzBkQlJVYzdRVUZEU0N4aFFVRnZRaXhGUVVGUExFVkJRVVVzUlVGQlR6dEpRVU51UXl4blFrRkJUU3hEUVVGRExFVkJRVVVzUlVGQlJTeDNRa0ZCZDBJc1EwRkJReXhEUVVGRE8wbEJRM0pETEdkQ1FVRk5MRU5CUVVNc1JVRkJSU3hGUVVGRkxIZENRVUYzUWl4RFFVRkRMRU5CUVVNN1NVRkRja01zTUVKQlFUQkNPMGxCUXpGQ0xHZENRVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRmxCUVZrc2JVSkJRVkVzU1VGQlNTeEZRVUZGTEZsQlFWa3NiVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeFpRVUZaTEcxQ1FVRlJMRWxCUVVrc1JVRkJSU3haUVVGWkxHMUNRVUZSTEVOQlFVTXNSVUZET1Vjc1owUkJRV2RFTEVOQlFVTXNRMEZCUXp0SlFVTnVSQ3hOUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRCUVVOdVFpeERRVUZETzBGQlVHVXNWMEZCUnl4TlFVOXNRaXhEUVVGQk8wRkJWVVE3TzBkQlJVYzdRVUZEU0N4aFFVRnZRaXhGUVVGUExFVkJRVVVzUlVGQlR6dEpRVU51UXl4blFrRkJUU3hEUVVGRExFVkJRVVVzUlVGQlJTeDNRa0ZCZDBJc1EwRkJReXhEUVVGRE8wbEJRM0pETEdkQ1FVRk5MRU5CUVVNc1JVRkJSU3hGUVVGRkxIZENRVUYzUWl4RFFVRkRMRU5CUVVNN1NVRkRja01zTUVKQlFUQkNPMGxCUXpGQ0xHZENRVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRmxCUVZrc2JVSkJRVkVzU1VGQlNTeEZRVUZGTEZsQlFWa3NiVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeFpRVUZaTEcxQ1FVRlJMRWxCUVVrc1JVRkJSU3haUVVGWkxHMUNRVUZSTEVOQlFVTXNSVUZET1Vjc1owUkJRV2RFTEVOQlFVTXNRMEZCUXp0SlFVTnVSQ3hOUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRCUVVOdVFpeERRVUZETzBGQlVHVXNWMEZCUnl4TlFVOXNRaXhEUVVGQk8wRkJSVVE3TzBkQlJVYzdRVUZEU0N4aFFVRnZRaXhEUVVGWE8wbEJRemxDTEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxIZENRVUYzUWl4RFFVRkRMRU5CUVVNN1NVRkRjRU1zWjBKQlFVMHNRMEZCUXl4RFFVRkRMRmxCUVZrc2JVSkJRVkVzUlVGQlJTeHJRMEZCYTBNc1EwRkJReXhEUVVGRE8wbEJRMnhGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGFFSXNRMEZCUXp0QlFVcGxMRmRCUVVjc1RVRkpiRUlzUTBGQlFTSjkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIEluZGljYXRlcyBob3cgYSBEYXRlIG9iamVjdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXHJcbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcclxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXHJcbiAqL1xyXG4oZnVuY3Rpb24gKERhdGVGdW5jdGlvbnMpIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoZSBEYXRlLmdldEZ1bGxZZWFyKCksIERhdGUuZ2V0TW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0XCJdID0gMF0gPSBcIkdldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG4gICAgICovXHJcbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRVVENcIl0gPSAxXSA9IFwiR2V0VVRDXCI7XHJcbn0pKGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyB8fCAoZXhwb3J0cy5EYXRlRnVuY3Rpb25zID0ge30pKTtcclxudmFyIERhdGVGdW5jdGlvbnMgPSBleHBvcnRzLkRhdGVGdW5jdGlvbnM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFtRjJZWE5qY21sd2RDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5c2FXSXZhbUYyWVhOamNtbHdkQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdSMEZGUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVWaU96czdPMGRCU1VjN1FVRkRTQ3hYUVVGWkxHRkJRV0U3U1VGRGVFSTdPMDlCUlVjN1NVRkRTQ3dyUTBGQlJ5eERRVUZCTzBsQlEwZzdPMDlCUlVjN1NVRkRTQ3h4UkVGQlRTeERRVUZCTzBGQlExQXNRMEZCUXl4RlFWUlhMSEZDUVVGaExFdEJRV0lzY1VKQlFXRXNVVUZUZUVJN1FVRlVSQ3hKUVVGWkxHRkJRV0VzUjBGQllpeHhRa0ZUV0N4RFFVRkJJbjA9IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBNYXRoIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG4vKipcclxuICogQHJldHVybiB0cnVlIGlmZiBnaXZlbiBhcmd1bWVudCBpcyBhbiBpbnRlZ2VyIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gaXNJbnQobikge1xyXG4gICAgaWYgKHR5cGVvZiAobikgIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNOYU4obikpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKE1hdGguZmxvb3IobikgPT09IG4pO1xyXG59XHJcbmV4cG9ydHMuaXNJbnQgPSBpc0ludDtcclxuLyoqXHJcbiAqIFJvdW5kcyAtMS41IHRvIC0yIGluc3RlYWQgb2YgLTFcclxuICogUm91bmRzICsxLjUgdG8gKzJcclxuICovXHJcbmZ1bmN0aW9uIHJvdW5kU3ltKG4pIHtcclxuICAgIGlmIChuIDwgMCkge1xyXG4gICAgICAgIHJldHVybiAtMSAqIE1hdGgucm91bmQoLTEgKiBuKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG4pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucm91bmRTeW0gPSByb3VuZFN5bTtcclxuLyoqXHJcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxyXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcclxuICovXHJcbmZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlKSB7XHJcbiAgICBpZiAoL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5hTjtcclxufVxyXG5leHBvcnRzLmZpbHRlckZsb2F0ID0gZmlsdGVyRmxvYXQ7XHJcbmZ1bmN0aW9uIHBvc2l0aXZlTW9kdWxvKHZhbHVlLCBtb2R1bG8pIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQobW9kdWxvID49IDEsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xyXG4gICAgaWYgKHZhbHVlIDwgMCkge1xyXG4gICAgICAgIHJldHVybiAoKHZhbHVlICUgbW9kdWxvKSArIG1vZHVsbykgJSBtb2R1bG87XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUgJSBtb2R1bG87XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wb3NpdGl2ZU1vZHVsbyA9IHBvc2l0aXZlTW9kdWxvO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV0YwYUM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlzYVdJdmJXRjBhQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPenRIUVVsSE8wRkJSVWdzV1VGQldTeERRVUZETzBGQlJXSXNkVUpCUVcxQ0xGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlJUbENPenRIUVVWSE8wRkJRMGdzWlVGQmMwSXNRMEZCVXp0SlFVTTVRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU0zUWl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEWkN4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVU5FTEUxQlFVMHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkRPVUlzUTBGQlF6dEJRVkpsTEdGQlFVc3NVVUZSY0VJc1EwRkJRVHRCUVVWRU96czdSMEZIUnp0QlFVTklMR3RDUVVGNVFpeERRVUZUTzBsQlEycERMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFnc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEYUVNc1EwRkJRenRKUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlExQXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEZEVJc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGT1pTeG5Ra0ZCVVN4WFFVMTJRaXhEUVVGQk8wRkJSVVE3T3pzN1IwRkpSenRCUVVOSUxIRkNRVUUwUWl4TFFVRmhPMGxCUTNoRExFVkJRVVVzUTBGQlF5eERRVUZETEhkRFFVRjNReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNVVFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOMFFpeERRVUZETzBsQlEwUXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJRenRCUVVOYUxFTkJRVU03UVVGTVpTeHRRa0ZCVnl4alFVc3hRaXhEUVVGQk8wRkJSVVFzZDBKQlFTdENMRXRCUVdFc1JVRkJSU3hOUVVGak8wbEJRek5FTEdkQ1FVRk5MRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zUlVGQlJTeDFRa0ZCZFVJc1EwRkJReXhEUVVGRE8wbEJRemRETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRMRWRCUVVjc1RVRkJUU3hEUVVGRE8wbEJRemRETEVOQlFVTTdTVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOUUxFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRPMGxCUTNaQ0xFTkJRVU03UVVGRFJpeERRVUZETzBGQlVHVXNjMEpCUVdNc2FVSkJUemRDTEVOQlFVRWlmUT09IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gZGF0ZXRpbWUgc3RyaW5nIGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0XHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBMRE1MIGZvcm1hdCBzdHJpbmdcclxuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcclxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VhYmxlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIGFsbG93VHJhaWxpbmcpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgcGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgbnVsbCwgYWxsb3dUcmFpbGluZyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlYWJsZSA9IHBhcnNlYWJsZTtcclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBvdmVycmlkZVpvbmUsIGFsbG93VHJhaWxpbmcpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFmb3JtYXRTdHJpbmcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBmb3JtYXQgZ2l2ZW5cIik7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW5fMS5Ub2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuICAgICAgICB2YXIgdG9rZW5zID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcbiAgICAgICAgdmFyIHRpbWUgPSB7IHllYXI6IC0xIH07XHJcbiAgICAgICAgdmFyIHpvbmUgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHBuciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcHpyID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciByZW1haW5pbmcgPSBkYXRlVGltZVN0cmluZztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV07XHJcbiAgICAgICAgICAgIHZhciB0b2tlblJlc3VsdCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5kYXkgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1JTlVURTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcInNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbGxpID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICdcIiArIHRva2VuLnJhdyArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgICAgICBwenIgPSBzdHJpcFpvbmUocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvbmUgPSBwenIuem9uZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICB2YXIgcmVzdWx0ID0geyB0aW1lOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0aW1lKSwgem9uZTogem9uZSB8fCBudWxsIH07XHJcbiAgICAgICAgaWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlc3VsdGluZyBkYXRlIGludmFsaWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFsd2F5cyBvdmVyd3JpdGUgem9uZSB3aXRoIGdpdmVuIHpvbmVcclxuICAgICAgICBpZiAob3ZlcnJpZGVab25lKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgZGF0ZSAnXCIgKyBkYXRlVGltZVN0cmluZyArIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIgKyBmb3JtYXRTdHJpbmcgKyBcIic6IHRyYWlsaW5nIGNoYXJhY3RlcnM6ICdyZW1haW5pbmcnXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGRhdGUgJ1wiICsgZGF0ZVRpbWVTdHJpbmcgKyBcIicgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJ1wiICsgZm9ybWF0U3RyaW5nICsgXCInOiBcIiArIGUubWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xyXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIG46IE5hTixcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkubWF0Y2goL1xcZC8pKSB7XHJcbiAgICAgICAgbnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xyXG4gICAgd2hpbGUgKG51bWJlclN0cmluZy5jaGFyQXQoMCkgPT09IFwiMFwiICYmIG51bWJlclN0cmluZy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgbnVtYmVyU3RyaW5nID0gbnVtYmVyU3RyaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XHJcbiAgICBpZiAobnVtYmVyU3RyaW5nID09PSBcIlwiIHx8ICFpc0Zpbml0ZShyZXN1bHQubikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICdcIiArIG51bWJlclN0cmluZyArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxudmFyIFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xyXG5mdW5jdGlvbiBzdHJpcFpvbmUocykge1xyXG4gICAgaWYgKHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgem9uZTogbnVsbCxcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgem9uZVN0cmluZyA9IFwiXCI7XHJcbiAgICB3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XHJcbiAgICAgICAgem9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICB9XHJcbiAgICByZXN1bHQuem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZnVuY3Rpb24gc3RyaXBSYXcocywgZXhwZWN0ZWQpIHtcclxuICAgIHZhciByZW1haW5pbmcgPSBzO1xyXG4gICAgdmFyIGVyZW1haW5pbmcgPSBleHBlY3RlZDtcclxuICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiBlcmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLmNoYXJBdCgwKSA9PT0gZXJlbWFpbmluZy5jaGFyQXQoMCkpIHtcclxuICAgICAgICByZW1haW5pbmcgPSByZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgICAgIGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIGlmIChlcmVtYWluaW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCAnXCIgKyBleHBlY3RlZCArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dGeWMyVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMM0JoY25ObExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN08wZEJTVWM3TzBGQlJVZ3NkVUpCUVRoRExGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlEzcEVMSE5DUVVGcFJTeFRRVUZUTEVOQlFVTXNRMEZCUVR0QlFVVXpSU3g1UWtGQmVVSXNXVUZCV1N4RFFVRkRMRU5CUVVFN1FVRXlRblJET3pzN096czdSMEZOUnp0QlFVTklMRzFDUVVFd1FpeGpRVUZ6UWl4RlFVRkZMRmxCUVc5Q0xFVkJRVVVzWVVGQk5rSTdTVUZCTjBJc05rSkJRVFpDTEVkQlFUZENMRzlDUVVFMlFqdEpRVU53Unl4SlFVRkpMRU5CUVVNN1VVRkRTaXhMUVVGTExFTkJRVU1zWTBGQll5eEZRVUZGTEZsQlFWa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1lVRkJZU3hEUVVGRExFTkJRVU03VVVGRGVrUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRKUVVOaUxFTkJRVVU3U1VGQlFTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMW9zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTmtMRU5CUVVNN1FVRkRSaXhEUVVGRE8wRkJVR1VzYVVKQlFWTXNXVUZQZUVJc1EwRkJRVHRCUVVWRU96czdPenM3UjBGTlJ6dEJRVU5JTEdWQlEwTXNZMEZCYzBJc1JVRkJSU3haUVVGdlFpeEZRVUZGTEZsQlFYVkNMRVZCUVVVc1lVRkJOa0k3U1VGQk4wSXNOa0pCUVRaQ0xFZEJRVGRDTEc5Q1FVRTJRanRKUVVWd1J5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGNrSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhsUVVGbExFTkJRVU1zUTBGQlF6dEpRVU5zUXl4RFFVRkRPMGxCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTI1Q0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dEpRVU53UXl4RFFVRkRPMGxCUTBRc1NVRkJTU3hEUVVGRE8xRkJRMG9zU1VGQlRTeFRRVUZUTEVkQlFVY3NTVUZCU1N4cFFrRkJVeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzFGQlF6bERMRWxCUVUwc1RVRkJUU3hIUVVGWkxGTkJRVk1zUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVTm9SQ3hKUVVGTkxFbEJRVWtzUjBGQmMwSXNSVUZCUlN4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU0zUXl4SlFVRkpMRWxCUVVrc1UwRkJWU3hEUVVGRE8xRkJRMjVDTEVsQlFVa3NSMEZCUnl4VFFVRnRRaXhEUVVGRE8xRkJRek5DTEVsQlFVa3NSMEZCUnl4VFFVRnBRaXhEUVVGRE8xRkJRM3BDTEVsQlFVa3NVMEZCVXl4SFFVRlhMR05CUVdNc1EwRkJRenRSUVVOMlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF6dFpRVU40UXl4SlFVRk5MRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZUVJc1NVRkJTU3hYUVVGWExGTkJRVkVzUTBGQlF6dFpRVU40UWl4TlFVRk5MRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRjRUlzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRWRCUVVjN2IwSkJRMnBDTEZWQlFWVTdiMEpCUTFZc1MwRkJTeXhEUVVGRE8yZENRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhKUVVGSk8yOUNRVU5zUWl4SFFVRkhMRWRCUVVjc1YwRkJWeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzI5Q1FVTTNRaXhUUVVGVExFZEJRVWNzUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXp0dlFrRkRNVUlzU1VGQlNTeERRVUZETEVsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5zUWl4TFFVRkxMRU5CUVVNN1owSkJRMUFzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRTlCUVU4N2IwSkJRM0pDTEZWQlFWVTdiMEpCUTFZc1MwRkJTeXhEUVVGRE8yZENRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhMUVVGTE8yOUNRVU51UWl4SFFVRkhMRWRCUVVjc1YwRkJWeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzI5Q1FVTTNRaXhUUVVGVExFZEJRVWNzUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXp0dlFrRkRNVUlzU1VGQlNTeERRVUZETEV0QlFVc3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU51UWl4TFFVRkxMRU5CUVVNN1owSkJRMUFzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRWRCUVVjN2IwSkJRMnBDTEVkQlFVY3NSMEZCUnl4WFFVRlhMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03YjBKQlF6ZENMRk5CUVZNc1IwRkJSeXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETzI5Q1FVTXhRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMnBDTEV0QlFVc3NRMEZCUXp0blFrRkRVQ3hMUVVGTExIbENRVUZUTEVOQlFVTXNUMEZCVHp0dlFrRkRja0lzVlVGQlZUdHZRa0ZEVml4TFFVRkxMRU5CUVVNN1owSkJRMUFzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRk5CUVZNN2IwSkJRM1pDTEZWQlFWVTdiMEpCUTFZc1MwRkJTeXhEUVVGRE8yZENRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhKUVVGSk8yOUNRVU5zUWl4SFFVRkhMRWRCUVVjc1YwRkJWeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzI5Q1FVTTNRaXhUUVVGVExFZEJRVWNzUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXp0dlFrRkRNVUlzU1VGQlNTeERRVUZETEVsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5zUWl4TFFVRkxMRU5CUVVNN1owSkJRMUFzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRTFCUVUwN2IwSkJRM0JDTEVkQlFVY3NSMEZCUnl4WFFVRlhMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03YjBKQlF6ZENMRk5CUVZNc1IwRkJSeXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETzI5Q1FVTXhRaXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRM0JDTEV0QlFVc3NRMEZCUXp0blFrRkRVQ3hMUVVGTExIbENRVUZUTEVOQlFVTXNUVUZCVFR0dlFrRkRjRUlzUjBGQlJ5eEhRVUZITEZkQlFWY3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenR2UWtGRE4wSXNVMEZCVXl4SFFVRkhMRWRCUVVjc1EwRkJReXhUUVVGVExFTkJRVU03YjBKQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTJwRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGNrSXNRMEZCUXp0dlFrRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRGVFTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTndRaXhEUVVGRE8yOUNRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2RDUVVOUUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNaME5CUVRoQ0xFdEJRVXNzUTBGQlF5eEhRVUZITEUxQlFVY3NRMEZCUXl4RFFVRkRPMjlDUVVNM1JDeERRVUZETzI5Q1FVTkVMRXRCUVVzc1EwRkJRenRuUWtGRFVDeExRVUZMTEhsQ1FVRlRMRU5CUVVNc1NVRkJTVHR2UWtGRGJFSXNSMEZCUnl4SFFVRkhMRk5CUVZNc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dHZRa0ZETTBJc1UwRkJVeXhIUVVGSExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTTdiMEpCUXpGQ0xFbEJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVOb1FpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEVsQlFVazdiMEpCUTJ4Q0xGVkJRVlU3YjBKQlExWXNTMEZCU3l4RFFVRkRPMmRDUVVOUUxGRkJRVkU3WjBKQlExSXNTMEZCU3l4NVFrRkJVeXhEUVVGRExGRkJRVkU3YjBKQlEzUkNMRk5CUVZNc1IwRkJSeXhSUVVGUkxFTkJRVU1zVTBGQlV5eEZRVUZGTEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenR2UWtGRE0wTXNTMEZCU3l4RFFVRkRPMWxCUTFJc1EwRkJRenRSUVVOR0xFTkJRVU03VVVGQlFTeERRVUZETzFGQlEwWXNTVUZCVFN4TlFVRk5MRWRCUVVjc1JVRkJSU3hKUVVGSkxFVkJRVVVzU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVsQlFVa3NTVUZCU1N4RlFVRkZMRU5CUVVNN1VVRkRiRVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTNRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhkQ1FVRjNRaXhEUVVGRExFTkJRVU03VVVGRE0wTXNRMEZCUXp0UlFVTkVMSGREUVVGM1F6dFJRVU40UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyeENMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzV1VGQldTeERRVUZETzFGQlF6VkNMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFRRVUZUTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMnBETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUTJRc2JVSkJRV2xDTEdOQlFXTXNiVU5CUVRoQ0xGbEJRVmtzZDBOQlFYRkRMRU5CUXpsSExFTkJRVU03VVVGRFNDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVVU3U1VGQlFTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMW9zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dFFrRkJhVUlzWTBGQll5eHRRMEZCT0VJc1dVRkJXU3hYUVVGTkxFTkJRVU1zUTBGQlF5eFBRVUZUTEVOQlFVTXNRMEZCUXp0SlFVTTNSeXhEUVVGRE8wRkJRMFlzUTBGQlF6dEJRWEJIWlN4aFFVRkxMRkZCYjBkd1FpeERRVUZCTzBGQlIwUXNjVUpCUVhGQ0xFTkJRVk03U1VGRE4wSXNTVUZCVFN4TlFVRk5MRWRCUVhOQ08xRkJRMnBETEVOQlFVTXNSVUZCUlN4SFFVRkhPMUZCUTA0c1UwRkJVeXhGUVVGRkxFTkJRVU03UzBGRFdpeERRVUZETzBsQlEwWXNTVUZCU1N4WlFVRlpMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRM1JDTEU5QlFVOHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJRemxGTEZsQlFWa3NTVUZCU1N4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpReXhOUVVGTkxFTkJRVU1zVTBGQlV5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBsQlF5OURMRU5CUVVNN1NVRkRSQ3gzUWtGQmQwSTdTVUZEZUVJc1QwRkJUeXhaUVVGWkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3haUVVGWkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUTJ4RkxGbEJRVmtzUjBGQlJ5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRM1pETEVOQlFVTTdTVUZEUkN4TlFVRk5MRU5CUVVNc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF5eFpRVUZaTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRkRU1zUlVGQlJTeERRVUZETEVOQlFVTXNXVUZCV1N4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhFTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1owTkJRVGhDTEZsQlFWa3NUVUZCUnl4RFFVRkRMRU5CUVVNN1NVRkRhRVVzUTBGQlF6dEpRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1FVRkRaaXhEUVVGRE8wRkJSVVFzU1VGQlRTeFZRVUZWTEVkQlFVY3NRMEZCUXl4SFFVRkhMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1FVRkZha1FzYlVKQlFXMUNMRU5CUVZNN1NVRkRNMElzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzQkNMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zWlVGQlpTeERRVUZETEVOQlFVTTdTVUZEYkVNc1EwRkJRenRKUVVORUxFbEJRVTBzVFVGQlRTeEhRVUZ2UWp0UlFVTXZRaXhKUVVGSkxFVkJRVVVzU1VGQlNUdFJRVU5XTEZOQlFWTXNSVUZCUlN4RFFVRkRPMHRCUTFvc1EwRkJRenRKUVVOR0xFbEJRVWtzVlVGQlZTeEhRVUZITEVWQlFVVXNRMEZCUXp0SlFVTndRaXhQUVVGUExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1NVRkJTU3hWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVNM1JpeFZRVUZWTEVsQlFVa3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZWtNc1RVRkJUU3hEUVVGRExGTkJRVk1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU12UXl4RFFVRkRPMGxCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eHRRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEpRVU40UXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8wRkJRMllzUTBGQlF6dEJRVVZFTEd0Q1FVRnJRaXhEUVVGVExFVkJRVVVzVVVGQlowSTdTVUZETlVNc1NVRkJTU3hUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEyeENMRWxCUVVrc1ZVRkJWU3hIUVVGSExGRkJRVkVzUTBGQlF6dEpRVU14UWl4UFFVRlBMRk5CUVZNc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxGTkJRVk1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUTNSSExGTkJRVk1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhETEZWQlFWVXNSMEZCUnl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBsQlEyNURMRU5CUVVNN1NVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE0wSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhsUVVGaExGRkJRVkVzVFVGQlJ5eERRVUZETEVOQlFVTTdTVUZETTBNc1EwRkJRenRKUVVORUxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTTdRVUZEYkVJc1EwRkJReUo5IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuLyoqXHJcbiAqIFNwZWNpZmllcyBob3cgdGhlIHBlcmlvZCBzaG91bGQgcmVwZWF0IGFjcm9zcyB0aGUgZGF5XHJcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICovXHJcbihmdW5jdGlvbiAoUGVyaW9kRHN0KSB7XHJcbiAgICAvKipcclxuICAgICAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcclxuICAgICAqIHVuYWZmZWN0ZWQgYnkgRGF5bGlnaHQgU2F2aW5nIFRpbWUuXHJcbiAgICAgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxyXG4gICAgICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cclxuICAgICAqIExlYXAgc2Vjb25kcywgbGVhcCBkYXlzIGFuZCBtb250aCBsZW5ndGhcclxuICAgICAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJJbnRlcnZhbHNcIl0gPSAwXSA9IFwiUmVndWxhckludGVydmFsc1wiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcclxuICAgICAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cclxuICAgICAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXHJcbiAgICAgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcclxuICAgICAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXHJcbiAgICAgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAgICAgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxyXG4gICAgICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJMb2NhbFRpbWVcIl0gPSAxXSA9IFwiUmVndWxhckxvY2FsVGltZVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQtb2YtZW51bSBtYXJrZXJcclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIk1BWFwiXSA9IDJdID0gXCJNQVhcIjtcclxufSkoZXhwb3J0cy5QZXJpb2REc3QgfHwgKGV4cG9ydHMuUGVyaW9kRHN0ID0ge30pKTtcclxudmFyIFBlcmlvZERzdCA9IGV4cG9ydHMuUGVyaW9kRHN0O1xyXG4vKipcclxuICogQ29udmVydCBhIFBlcmlvZERzdCB0byBhIHN0cmluZzogXCJyZWd1bGFyIGludGVydmFsc1wiIG9yIFwicmVndWxhciBsb2NhbCB0aW1lXCJcclxuICovXHJcbmZ1bmN0aW9uIHBlcmlvZERzdFRvU3RyaW5nKHApIHtcclxuICAgIHN3aXRjaCAocCkge1xyXG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM6IHJldHVybiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCI7XHJcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTogcmV0dXJuIFwicmVndWxhciBsb2NhbCB0aW1lXCI7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gUGVyaW9kRHN0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wZXJpb2REc3RUb1N0cmluZyA9IHBlcmlvZERzdFRvU3RyaW5nO1xyXG4vKipcclxuICogUmVwZWF0aW5nIHRpbWUgcGVyaW9kOiBjb25zaXN0cyBvZiBhIHJlZmVyZW5jZSBkYXRlIGFuZFxyXG4gKiBhIHRpbWUgbGVuZ3RoLiBUaGlzIGNsYXNzIGFjY291bnRzIGZvciBsZWFwIHNlY29uZHMgYW5kIGxlYXAgZGF5cy5cclxuICovXHJcbnZhciBQZXJpb2QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFBlcmlvZChyZWZlcmVuY2UsIGFtb3VudE9ySW50ZXJ2YWwsIHVuaXRPckRzdCwgZ2l2ZW5Ec3QpIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWw7XHJcbiAgICAgICAgdmFyIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gYW1vdW50T3JJbnRlcnZhbDtcclxuICAgICAgICAgICAgZHN0ID0gdW5pdE9yRHN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJJbnZhbGlkIHVuaXRcIik7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCwgdW5pdE9yRHN0KTtcclxuICAgICAgICAgICAgZHN0ID0gZ2l2ZW5Ec3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhcmVmZXJlbmNlLCBcIlJlZmVyZW5jZSB0aW1lIG5vdCBnaXZlblwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGludGVydmFsLmFtb3VudCgpID4gMCwgXCJBbW91bnQgbXVzdCBiZSBwb3NpdGl2ZSBub24temVyby5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XHJcbiAgICAgICAgdGhpcy5fcmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG4gICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XHJcbiAgICAgICAgdGhpcy5fZHN0ID0gZHN0O1xyXG4gICAgICAgIHRoaXMuX2NhbGNJbnRlcm5hbFZhbHVlcygpO1xyXG4gICAgICAgIC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxyXG4gICAgICAgIC8vIE5vdGUgd2UgdXNlIGludGVybmFsIGFtb3VudHMgdG8gZGVjaWRlIHRoaXMgYmVjYXVzZSBhY3R1YWxseSBpdCBpcyBzdXBwb3J0ZWQgaWZcclxuICAgICAgICAvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwMDAwLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDI0LCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnJlZmVyZW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaW50ZXJ2YWxcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pbnRlcnZhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuYW1vdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmRzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cclxuICAgICAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG4gICAgICogQHJldHVybiB0aGUgZmlyc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGFmdGVyIGZyb21EYXRlLCBnaXZlblxyXG4gICAgICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoZnJvbURhdGUpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFmcm9tRGF0ZS56b25lKCksIFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICB2YXIgYXBwcm94O1xyXG4gICAgICAgIHZhciBhcHByb3gyO1xyXG4gICAgICAgIHZhciBhcHByb3hNaW47XHJcbiAgICAgICAgdmFyIHBlcmlvZHM7XHJcbiAgICAgICAgdmFyIGRpZmY7XHJcbiAgICAgICAgdmFyIG5ld1llYXI7XHJcbiAgICAgICAgdmFyIG5ld01vbnRoO1xyXG4gICAgICAgIHZhciByZW1haW5kZXI7XHJcbiAgICAgICAgdmFyIGltYXg7XHJcbiAgICAgICAgdmFyIGltaW47XHJcbiAgICAgICAgdmFyIGltaWQ7XHJcbiAgICAgICAgdmFyIG5vcm1hbEZyb20gPSB0aGlzLl9ub3JtYWxpemVEYXkoZnJvbURhdGUudG9ab25lKHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpKTtcclxuICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcclxuICAgICAgICAgICAgLy8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSwgbm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEFtb3VudCBpcyBub3QgMSxcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuc2Vjb25kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnV0Y1llYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNZZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCB0aW1lcy4gSWYgdGhlIHVuaXQgaXMgbGVzcyB0aGFuIGEgZGF5LCB3ZSByZWZlcmVuY2UgZWFjaCBkYXkgYW5ld1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxMDAwICYmICgxMDAwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIHNlY29uZCBlYWNoIG1pbnV0ZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gaW1pZCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaW51dGVzLCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGZpdCBpbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcHJldmlvdXMgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20ubW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXHJcbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcbiAgICAgKiBAcmV0dXJuIChwcmV2ICsgY291bnQgKiBwZXJpb2QpLCBpbiB0aGUgc2FtZSB0aW1lem9uZSBhcyBwcmV2LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKHByZXYsIGNvdW50KSB7XHJcbiAgICAgICAgaWYgKGNvdW50ID09PSB2b2lkIDApIHsgY291bnQgPSAxOyB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoY291bnQpID09PSBcIm51bWJlclwiLCBcIkNvdW50IG11c3QgYmUgYSBudW1iZXJcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkUHJldiA9IHRoaXMuX25vcm1hbGl6ZURheShwcmV2LnRvWm9uZSh0aGlzLl9yZWZlcmVuY2Uuem9uZSgpKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSkuY29udmVydChwcmV2LnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxyXG4gICAgICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuICAgICAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBsYXN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBiZWZvcmUgZnJvbURhdGUsIGdpdmVuXHJcbiAgICAgKlx0XHRcdGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKGZyb20pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG4gICAgICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kUHJldiA9IGZ1bmN0aW9uIChuZXh0LCBjb3VudCkge1xyXG4gICAgICAgIGlmIChjb3VudCA9PT0gdm9pZCAwKSB7IGNvdW50ID0gMTsgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgb24gYSBwZXJpb2QgYm91bmRhcnlcclxuICAgICAqIChleHBlbnNpdmUhKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmlzQm91bmRhcnkgPSBmdW5jdGlvbiAob2NjdXJyZW5jZSkge1xyXG4gICAgICAgIGlmICghb2NjdXJyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLCBcIlRoZSBvY2N1cnJlbmNlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoZHVyYXRpb25fMS5EdXJhdGlvbi5taWxsaXNlY29uZHMoMSkpKS5lcXVhbHMob2NjdXJyZW5jZSkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXHJcbiAgICAgKiBpLmUuIGEgcGVyaW9kIG9mIDI0IGhvdXJzIGlzIGVxdWFsIHRvIG9uZSBvZiAxIGRheSBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgVVRDIHJlZmVyZW5jZSBtb21lbnRcclxuICAgICAqIGFuZCBzYW1lIGRzdC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICAvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIHJlZmVyZW5jZSgpIGJlY2F1c2UgdGhpcyBoYXMgYW4gaW5mbHVlbmNlIG9uIHRoZSBvdXRjb21lXHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmlzQm91bmRhcnkob3RoZXIucmVmZXJlbmNlKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludEludGVydmFsLmVxdWFsc0V4YWN0KG90aGVyLmludGVydmFsKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludERzdCA9PT0gb3RoZXIuX2ludERzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIucmVmZXJlbmNlKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5pbnRlcnZhbCgpKVxyXG4gICAgICAgICAgICAmJiB0aGlzLmRzdCgpID09PSBvdGhlci5kc3QoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIElTTyBkdXJhdGlvbiBzdHJpbmcgZS5nLlxyXG4gICAgICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFIXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMU0gICAob25lIG1vbnRoKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2UudG9Jc29TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5faW50ZXJ2YWwudG9Jc29TdHJpbmcoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGUuZy5cclxuICAgICAqIFwiMTAgeWVhcnMsIHJlZmVyZW5jZWluZyBhdCAyMDE0LTAzLTAxVDEyOjAwOjAwIEV1cm9wZS9BbXN0ZXJkYW0sIGtlZXBpbmcgcmVndWxhciBpbnRlcnZhbHNcIi5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltQZXJpb2Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JyZWN0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIF9yZWZlcmVuY2UgYW5kIF9pbnRSZWZlcmVuY2UuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NvcnJlY3REYXkgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcbiAgICAgKiB0byA8PSAyOC5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fbm9ybWFsaXplRGF5ID0gZnVuY3Rpb24gKGQsIGFueW1vbnRoKSB7XHJcbiAgICAgICAgaWYgKGFueW1vbnRoID09PSB2b2lkIDApIHsgYW55bW9udGggPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcclxuICAgICAgICAgICAgfHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShkLnllYXIoKSwgZC5tb250aCgpLCAyOCwgZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7IC8vIHNhdmUgb24gdGltZSBieSBub3QgcmV0dXJuaW5nIGEgY2xvbmVcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cclxuICAgICAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2RzdFJlbGV2YW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAoISF0aGlzLl9yZWZlcmVuY2Uuem9uZSgpXHJcbiAgICAgICAgICAgICYmIHRoaXMuX3JlZmVyZW5jZS56b25lKCkua2luZCgpID09PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5Qcm9wZXJcclxuICAgICAgICAgICAgJiYgdGhpcy5fcmVmZXJlbmNlLnpvbmUoKS5oYXNEc3QoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgdGhlIHZhbHVlcyB3aGVyZSBwb3NzaWJsZSAtIG5vdCBhbGwgdmFsdWVzXHJcbiAgICAgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxyXG4gICAgICogRS5nLiBtb3JlIHRoYW4gNjAgbWludXRlcyBpcyB0cmFuc2ZlcnJlZCB0byBob3VycyxcclxuICAgICAqIGJ1dCBzZWNvbmRzIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZCB0byBtaW51dGVzIGR1ZSB0byBsZWFwIHNlY29uZHMuXHJcbiAgICAgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fY2FsY0ludGVybmFsVmFsdWVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhbnkgYWJvdmUtdW5pdCB2YWx1ZXNcclxuICAgICAgICB2YXIgaW50QW1vdW50ID0gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICAgICAgdmFyIGludFVuaXQgPSB0aGlzLl9pbnRlcnZhbC51bml0KCk7XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcclxuICAgICAgICAgICAgLy8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDEwMDA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuSG91ciAmJiBpbnRBbW91bnQgPj0gMjQgJiYgaW50QW1vdW50ICUgMjQgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyByZW1vdmUgd2Vla3Mgc28gd2UgaGF2ZSBvbmUgbGVzcyBjYXNlIHRvIHdvcnJ5IGFib3V0XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LldlZWspIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50ICogNztcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIGludEFtb3VudCA+PSAxMiAmJiBpbnRBbW91bnQgJSAxMiA9PT0gMCkge1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMjtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2ludEludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oaW50QW1vdW50LCBpbnRVbml0KTtcclxuICAgICAgICAvLyBub3JtYWxpemUgZHN0IGhhbmRsaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSByZWZlcmVuY2UgZGF5XHJcbiAgICAgICAgdGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQZXJpb2Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUGVyaW9kID0gUGVyaW9kO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR1Z5YVc5a0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJ4cFlpOXdaWEpwYjJRdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUU3T3pzN1IwRkpSenRCUVVWSUxGbEJRVmtzUTBGQlF6dEJRVVZpTEhWQ1FVRnRRaXhWUVVGVkxFTkJRVU1zUTBGQlFUdEJRVU01UWl4MVFrRkJlVUlzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZEY0VNc1NVRkJXU3hOUVVGTkxGZEJRVTBzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZEYmtNc2VVSkJRWGxDTEZsQlFWa3NRMEZCUXl4RFFVRkJPMEZCUTNSRExIbENRVUY1UWl4WlFVRlpMRU5CUVVNc1EwRkJRVHRCUVVOMFF5eDVRa0ZCZFVNc1dVRkJXU3hEUVVGRExFTkJRVUU3UVVGRmNFUTdPenRIUVVkSE8wRkJRMGdzVjBGQldTeFRRVUZUTzBsQlEzQkNPenM3T3pzN08wOUJUMGM3U1VGRFNDeHBSVUZCWjBJc1EwRkJRVHRKUVVWb1FqczdPenM3T3pzN08wOUJVMGM3U1VGRFNDeHBSVUZCWjBJc1EwRkJRVHRKUVVWb1FqczdUMEZGUnp0SlFVTklMSFZEUVVGSExFTkJRVUU3UVVGRFNpeERRVUZETEVWQk0wSlhMR2xDUVVGVExFdEJRVlFzYVVKQlFWTXNVVUV5UW5CQ08wRkJNMEpFTEVsQlFWa3NVMEZCVXl4SFFVRlVMR2xDUVRKQ1dDeERRVUZCTzBGQlJVUTdPMGRCUlVjN1FVRkRTQ3d5UWtGQmEwTXNRMEZCV1R0SlFVTTNReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFnc1MwRkJTeXhUUVVGVExFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1RVRkJUU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRPMUZCUXpWRUxFdEJRVXNzVTBGQlV5eERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFMUJRVTBzUTBGQlF5eHZRa0ZCYjBJc1EwRkJRenRSUVVNM1JDd3dRa0ZCTUVJN1VVRkRNVUk3V1VGRFF5eDNRa0ZCZDBJN1dVRkRlRUlzTUVKQlFUQkNPMWxCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eERRVUZETzFsQlEzUkRMRU5CUVVNN1NVRkRTQ3hEUVVGRE8wRkJRMFlzUTBGQlF6dEJRVnBsTEhsQ1FVRnBRaXh2UWtGWmFFTXNRMEZCUVR0QlFVVkVPenM3UjBGSFJ6dEJRVU5JTzBsQk1FVkRPenRQUVVWSE8wbEJRMGdzWjBKQlEwTXNVMEZCYlVJc1JVRkRia0lzWjBKQlFYRkNMRVZCUTNKQ0xGTkJRV1VzUlVGRFppeFJRVUZ2UWp0UlFVZHdRaXhKUVVGSkxGRkJRV3RDTEVOQlFVTTdVVUZEZGtJc1NVRkJTU3hIUVVGSExFZEJRV01zVTBGQlV5eERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xRkJRMmhFTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhuUWtGQlowSXNRMEZCUXl4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE5VTXNVVUZCVVN4SFFVRmhMR2RDUVVGblFpeERRVUZETzFsQlEzUkRMRWRCUVVjc1IwRkJZeXhUUVVGVExFTkJRVU03VVVGRE5VSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzWjBKQlFVMHNRMEZCUXl4UFFVRlBMRk5CUVZNc1MwRkJTeXhSUVVGUkxFbEJRVWtzVTBGQlV5eEpRVUZKTEVOQlFVTXNTVUZCU1N4VFFVRlRMRWRCUVVjc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNZMEZCWXl4RFFVRkRMRU5CUVVNN1dVRkRjRWNzVVVGQlVTeEhRVUZITEVsQlFVa3NiVUpCUVZFc1EwRkJVeXhuUWtGQlowSXNSVUZCV1N4VFFVRlRMRU5CUVVNc1EwRkJRenRaUVVOMlJTeEhRVUZITEVkQlFVY3NVVUZCVVN4RFFVRkRPMUZCUTJoQ0xFTkJRVU03VVVGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRWRCUVVjc1MwRkJTeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6ZENMRWRCUVVjc1IwRkJSeXhUUVVGVExFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkRiRU1zUTBGQlF6dFJRVU5FTEdkQ1FVRk5MRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVkQlFVY3NVMEZCVXl4RFFVRkRMRWRCUVVjc1JVRkJSU3d5UWtGQk1rSXNRMEZCUXl4RFFVRkRPMUZCUTNKRkxHZENRVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRk5CUVZNc1JVRkJSU3d3UWtGQk1FSXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxHZENRVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFTkJRVU1zUlVGQlJTeHRRMEZCYlVNc1EwRkJReXhEUVVGRE8xRkJRMjVGTEdkQ1FVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1MwRkJTeXhSUVVGUkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNLMEpCUVN0Q0xFTkJRVU1zUTBGQlF6dFJRVVUzUml4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGSExGTkJRVk1zUTBGQlF6dFJRVU0xUWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExGRkJRVkVzUTBGQlF6dFJRVU14UWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF6dFJRVU5vUWl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVWQlFVVXNRMEZCUXp0UlFVVXpRaXgzUlVGQmQwVTdVVUZEZUVVc2EwWkJRV3RHTzFGQlEyeEdMSE5EUVVGelF6dFJRVU4wUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeEZRVUZGTEVsQlFVa3NSMEZCUnl4TFFVRkxMRk5CUVZNc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRMMFFzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTJ4RExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4WFFVRlhPMjlDUVVONFFpeG5Ra0ZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NVVUZCVVN4RlFVTXpReXcwUlVGQk5FVTdkMEpCUXpWRkxHZEdRVUZuUml4RFFVRkRMRU5CUVVNN2IwSkJRMjVHTEV0QlFVc3NRMEZCUXp0blFrRkRVQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNUVUZCVFR0dlFrRkRia0lzWjBKQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEV0QlFVc3NSVUZEZUVNc05FVkJRVFJGTzNkQ1FVTTFSU3huUmtGQlowWXNRMEZCUXl4RFFVRkRPMjlDUVVOdVJpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEUxQlFVMDdiMEpCUTI1Q0xHZENRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEVWQlEzWkRMRFJGUVVFMFJUdDNRa0ZETlVVc1owWkJRV2RHTEVOQlFVTXNRMEZCUXp0dlFrRkRia1lzUzBGQlN5eERRVUZETzJkQ1FVTlFMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEpRVUZKTzI5Q1FVTnFRaXhuUWtGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEZRVU55UXl3MFJVRkJORVU3ZDBKQlF6VkZMR2RHUVVGblJpeERRVUZETEVOQlFVTTdiMEpCUTI1R0xFdEJRVXNzUTBGQlF6dFpRVU5TTEVOQlFVTTdVVUZEUml4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NjMEpCUVVzc1IwRkJXanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJReTlFTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEQkNRVUZUTEVkQlFXaENPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZEZUVJc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NjMEpCUVVzc1IwRkJXanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRPMGxCUTNoQ0xFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMSGxDUVVGUkxFZEJRV1k3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dEpRVU12UWl4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDFRa0ZCVFN4SFFVRmlPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1NVRkRhRU1zUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc2NVSkJRVWtzUjBGQldEdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzBsQlF6bENMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEc5Q1FVRkhMRWRCUVZZN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXp0SlFVTnNRaXhEUVVGRE8wbEJSVVE3T3pzN096czdUMEZQUnp0SlFVTkpMREJDUVVGVExFZEJRV2hDTEZWQlFXbENMRkZCUVd0Q08xRkJRMnhETEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZEZGtRc0swUkJRU3RFTEVOQlFVTXNRMEZCUXp0UlFVTnNSU3hKUVVGSkxFMUJRV2RDTEVOQlFVTTdVVUZEY2tJc1NVRkJTU3hQUVVGcFFpeERRVUZETzFGQlEzUkNMRWxCUVVrc1UwRkJiVUlzUTBGQlF6dFJRVU40UWl4SlFVRkpMRTlCUVdVc1EwRkJRenRSUVVOd1FpeEpRVUZKTEVsQlFWa3NRMEZCUXp0UlFVTnFRaXhKUVVGSkxFOUJRV1VzUTBGQlF6dFJRVU53UWl4SlFVRkpMRkZCUVdkQ0xFTkJRVU03VVVGRGNrSXNTVUZCU1N4VFFVRnBRaXhEUVVGRE8xRkJRM1JDTEVsQlFVa3NTVUZCV1N4RFFVRkRPMUZCUTJwQ0xFbEJRVWtzU1VGQldTeERRVUZETzFGQlEycENMRWxCUVVrc1NVRkJXU3hEUVVGRE8xRkJSV3BDTEVsQlFVMHNWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVnNSaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZEVNc2RVWkJRWFZHTzFsQlEzWkdMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEV0QlFVc3NVMEZCVXl4RFFVRkRMR2RDUVVGblFpeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRha1FzYjBKQlFXOUNPMmRDUVVOd1FpeE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRiRU1zUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRmRCUVZjN2QwSkJRM2hDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOb1JTeFZRVUZWTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExGTkJRVk1zUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4VFFVRlRMRVZCUVVVc1JVRkRjRVVzVlVGQlZTeERRVUZETEdOQlFXTXNSVUZCUlN4RlFVRkZMRzFDUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlF6TkRMRU5CUVVNN2QwSkJRMFlzUzBGQlN5eERRVUZETzI5Q1FVTlFMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eE5RVUZOTzNkQ1FVTnVRaXhOUVVGTkxFZEJRVWNzU1VGQlNTeHRRa0ZCVVN4RFFVTndRaXhWUVVGVkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZEYUVVc1ZVRkJWU3hEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4VFFVRlRMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zVTBGQlV5eEZRVUZGTEVWQlEzQkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zWTBGQll5eEZRVUZGTEVWQlFVVXNiVUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGRGJrUXNRMEZCUXp0M1FrRkRSaXhMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFMUJRVTA3ZDBKQlEyNUNMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU5vUlN4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEZOQlFWTXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVTBGQlV5eEZRVUZGTEVWQlF6VkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zWTBGQll5eEZRVUZGTEVWQlFVVXNiVUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGRGJrUXNRMEZCUXp0M1FrRkRSaXhMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWs3ZDBKQlEycENMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU5vUlN4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNSVUZCUlN4RlFVTndSaXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEdOQlFXTXNSVUZCUlN4RlFVRkZMRzFDUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlEyNUVMRU5CUVVNN2QwSkJRMFlzUzBGQlN5eERRVUZETzI5Q1FVTlFMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEhRVUZITzNkQ1FVTm9RaXhOUVVGTkxFZEJRVWNzU1VGQlNTeHRRa0ZCVVN4RFFVTndRaXhWUVVGVkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZEYUVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1UwRkJVeXhGUVVGRkxFVkJRelZHTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFVkJRVVVzYlVKQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkRia1FzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRXRCUVVzN2QwSkJRMnhDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGRGVFVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRk5CUVZNc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNVMEZCVXl4RlFVRkZMRVZCUXpWR0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4RlFVRkZMRVZCUVVVc2JVSkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZEYmtRc1EwRkJRenQzUWtGRFJpeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVazdkMEpCUTJwQ0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRMmhHTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNSVUZCUlN4RlFVTTFSaXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEdOQlFXTXNSVUZCUlN4RlFVRkZMRzFDUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlEyNUVMRU5CUVVNN2QwSkJRMFlzUzBGQlN5eERRVUZETzI5Q1FVTlFMREJDUVVFd1FqdHZRa0ZETVVJN2QwSkJRME1zZDBKQlFYZENPM2RDUVVONFFpd3dRa0ZCTUVJN2QwSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPM2RDUVVOeVF5eERRVUZETzJkQ1FVTklMRU5CUVVNN1owSkJRMFFzVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF6dHZRa0ZEZEVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03WjBKQlF6TkZMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTFBc2MwTkJRWE5ETzJkQ1FVTjBReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEYkVNc1MwRkJTeXhwUWtGQlVTeERRVUZETEZkQlFWYzdkMEpCUTNoQ0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RlFVTjJSQ3hWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZETTBRc1ZVRkJWU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRMjVFTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTk8zZENRVU51UWl4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGRrUXNWVUZCVlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRek5FTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkRNMFFzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRTFCUVUwN2QwSkJRMjVDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVOMlJDeFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRMjVGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkRNMFFzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrN2QwSkJRMnBDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVOMlJDeFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU16UlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhIUVVGSE8zZENRVU5vUWl4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGRrUXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUTI1R0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZETTBRc1EwRkJRenQzUWtGRFJpeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEV0QlFVczdkMEpCUTJ4Q0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkRMMFFzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlEyNUdMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGRE0wUXNRMEZCUXp0M1FrRkRSaXhMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWs3ZDBKQlEycENMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUTNaRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU51Uml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTERCQ1FVRXdRanR2UWtGRE1VSTdkMEpCUTBNc2QwSkJRWGRDTzNkQ1FVTjRRaXd3UWtGQk1FSTdkMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzNkQ1FVTnlReXhEUVVGRE8yZENRVU5JTEVOQlFVTTdaMEpCUTBRc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1EwRkJRenR2UWtGRGVFTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN1owSkJRMmhHTEVOQlFVTTdXVUZEUml4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNiVUpCUVcxQ08xbEJRMjVDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFdEJRVXNzVTBGQlV5eERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtRc2IwSkJRVzlDTzJkQ1FVTndRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEYkVNc1MwRkJTeXhwUWtGQlVTeERRVUZETEZkQlFWYzdkMEpCUTNoQ0xFbEJRVWtzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eFpRVUZaTEVWQlFVVXNRMEZCUXp0M1FrRkRNVVFzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJRenQzUWtGRGVFUXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF6dDNRa0ZEYUVjc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTk8zZENRVU51UWl4SlFVRkpMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVU03ZDBKQlEzSkVMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTNoRUxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRMmhITEV0QlFVc3NRMEZCUXp0dlFrRkRVQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNUVUZCVFR0M1FrRkRia0lzZDBWQlFYZEZPM2RDUVVONFJTeEpRVUZKTEVkQlFVY3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNN2QwSkJRM0pFTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTJoSExFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zU1VGQlNUdDNRa0ZEYWtJc1NVRkJTU3hIUVVGSExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzNkQ1FVTnVSQ3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVONFJDeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRE8zZENRVU5vUnl4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWRCUVVjN2QwSkJRMmhDTEVsQlFVa3NSMEZCUnl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU03ZDBKQlEzaEVMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTNoRUxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRMmhITEV0QlFVc3NRMEZCUXp0dlFrRkRVQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNTMEZCU3p0M1FrRkRiRUlzU1VGQlNTeEhRVUZITEVOQlFVTXNWVUZCVlN4RFFVRkRMRTlCUVU4c1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1IwRkJSeXhGUVVGRk96UkNRVU5vUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhSUVVGUkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzNkQ1FVTTNSQ3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVONFJDeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRE8zZENRVU5vUnl4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrN2QwSkJRMnBDTEd0SFFVRnJSenQzUWtGRGJFY3NTVUZCU1N4SFFVRkhMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dDNRa0ZEZWtRc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXp0M1FrRkRlRVFzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxHbENRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN2QwSkJRM0pHTEV0QlFVc3NRMEZCUXp0dlFrRkRVQ3d3UWtGQk1FSTdiMEpCUXpGQ08zZENRVU5ETEhkQ1FVRjNRanQzUWtGRGVFSXNNRUpCUVRCQ08zZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZET3pSQ1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJRenQzUWtGRGNrTXNRMEZCUXp0blFrRkRTQ3hEUVVGRE8yZENRVU5FTEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTTdiMEpCUTNSRExFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETzJkQ1FVTXpSU3hEUVVGRE8xbEJRMFlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxEaEdRVUU0Ump0blFrRkRPVVlzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTJ4RExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4WFFVRlhPM2RDUVVONFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVsQlFVa3NTVUZCU1N4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEY0VZc2QwVkJRWGRGT3pSQ1FVTjRSU3cwUkVGQk5FUTdORUpCUXpWRUxFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RlFVTjJSQ3hWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZETTBRc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFhRVUZYTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVU16UkR0cFEwRkRRU3hSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03ZDBKQlF5OUNMRU5CUVVNN2QwSkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdORUpCUTFBc2IwZEJRVzlIT3pSQ1FVTndSeXhOUVVGTkxFZEJRVWNzU1VGQlNTeHRRa0ZCVVN4RFFVTndRaXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZEZGtRc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRMjVHTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkRNMFFzUTBGQlF6czBRa0ZGUml4MVJVRkJkVVU3TkVKQlEzWkZMRzlFUVVGdlJEczBRa0ZEY0VRc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN05FSkJRMmhGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmREUVVOd1F5eFBRVUZQTzJkRFFVTlFMSGRDUVVGM1FqdG5RMEZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXl4WFFVRlhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5RFFVTTVSU3gzUlVGQmQwVTdiME5CUTNoRkxFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSU3hwUWtGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMmREUVVNelF5eERRVUZET3pSQ1FVTkdMRU5CUVVNN05FSkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaME5CUTFBc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1UwRkJVeXhGUVVGRkxHbENRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlEwRkRkRWNzSzBSQlFTdEVPMjlEUVVNdlJDeE5RVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzYVVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRuUTBGRE0wTXNRMEZCUXpzMFFrRkRSaXhEUVVGRE96UkNRVVZFTERoQ1FVRTRRanMwUWtGRE9VSXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdORUpCUXpORUxFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTTdORUpCUTFRc1QwRkJUeXhKUVVGSkxFbEJRVWtzU1VGQlNTeEZRVUZGTEVOQlFVTTdaME5CUTNKQ0xIRkVRVUZ4UkR0blEwRkRja1FzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owTkJRM0pETEU5QlFVOHNSMEZCUnl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxHbENRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1owTkJRMjVHTEZOQlFWTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0blEwRkRMMFVzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRmRCUVZjc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRMEZEZUVVc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF6dHZRMEZEYWtJc1MwRkJTeXhEUVVGRE8yZERRVU5RTEVOQlFVTTdaME5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5RFFVTXhReXcwUTBGQk5FTTdiME5CUXpWRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRPMmREUVVOcVFpeERRVUZETzJkRFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yOURRVU5RTERSRFFVRTBRenR2UTBGRE5VTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU03WjBOQlEycENMRU5CUVVNN05FSkJRMFlzUTBGQlF6dDNRa0ZEUml4RFFVRkRPM2RDUVVORUxFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zVFVGQlRUdDNRa0ZEYmtJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUTBGQlF5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRMmhHTEcxRlFVRnRSVHMwUWtGRGJrVXNkVVJCUVhWRU96UkNRVU4yUkN4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGRrUXNWVUZCVlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU51UlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTzJsRFFVTkJMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzYVVKQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenQzUWtGREwwSXNRMEZCUXp0M1FrRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6czBRa0ZEVUN4dlIwRkJiMGM3TkVKQlEzQkhMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeEZRVU4yUkN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkRia1lzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVTXpSQ3hEUVVGRE96UkNRVVZHTERSRlFVRTBSVHMwUWtGRE5VVXNPRU5CUVRoRE96UkNRVU01UXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXpzMFFrRkROMFFzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaME5CUTNCRExFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1UwRkJVeXhGUVVGRkxHbENRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlEwRkRla1VzZDBWQlFYZEZPMjlEUVVONFJTeE5RVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzYVVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRuUTBGRE0wTXNRMEZCUXpzMFFrRkRSaXhEUVVGRE96UkNRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmREUVVOUUxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxHbENRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwTkJRMnBITEN0RVFVRXJSRHR2UTBGREwwUXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBOQlF6TkRMRU5CUVVNN05FSkJRMFlzUTBGQlF6czBRa0ZGUkN3NFFrRkJPRUk3TkVKQlF6bENMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRPelJDUVVONFJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRPelJDUVVOVUxFOUJRVThzU1VGQlNTeEpRVUZKTEVsQlFVa3NSVUZCUlN4RFFVRkRPMmREUVVOeVFpeHhSRUZCY1VRN1owTkJRM0pFTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZERRVU55UXl4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8yZERRVU01UlN4VFFVRlRMRWRCUVVjc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxHbENRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1owTkJRekZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGWExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NVMEZCVXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiME5CUTNoRkxFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTTdiME5CUTJwQ0xFdEJRVXNzUTBGQlF6dG5RMEZEVUN4RFFVRkRPMmREUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlEwRkRNVU1zTkVOQlFUUkRPMjlEUVVNMVF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJRenRuUTBGRGFrSXNRMEZCUXp0blEwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHZRMEZEVUN3MFEwRkJORU03YjBOQlF6VkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETzJkRFFVTnFRaXhEUVVGRE96UkNRVU5HTEVOQlFVTTdkMEpCUTBZc1EwRkJRenQzUWtGRFJDeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEUxQlFVMDdkMEpCUTI1Q0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU5vUml4dlIwRkJiMGM3TkVKQlEzQkhMQ3REUVVFclF6czBRa0ZETDBNc1RVRkJUU3hIUVVGSExFbEJRVWtzYlVKQlFWRXNRMEZEY0VJc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlEzWkVMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUXpORkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZETTBRN2FVTkJRMEVzVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTTNRaXhEUVVGRE8zZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPelJDUVVOUUxIbEdRVUY1UmpzMFFrRkRla1lzVFVGQlRTeEhRVUZITEVsQlFVa3NiVUpCUVZFc1EwRkRjRUlzVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhMUVVGTExFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUTNaRUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU51Uml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTEVOQlFVTTdORUpCUlVZc05FUkJRVFJFT3pSQ1FVTTFSQ3dyUkVGQkswUTdORUpCUXk5RUxGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6czBRa0ZETDBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlEzQkRMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNWMEZCVnl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRMEZEZWtVc2QwVkJRWGRGTzI5RFFVTjRSU3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blEwRkRNME1zUTBGQlF6czBRa0ZEUml4RFFVRkRPelJDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkRFFVTlFMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1JVRkJSU3hwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiME5CUTJwSExDdEVRVUVyUkR0dlEwRkRMMFFzVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxHbENRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1owTkJRek5ETEVOQlFVTTdORUpCUTBZc1EwRkJRenQzUWtGRFJpeERRVUZETzNkQ1FVTkVMRXRCUVVzc1EwRkJRenR2UWtGRFVDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHQzUWtGRGFrSXNUVUZCVFN4SFFVRkhMRWxCUVVrc2JVSkJRVkVzUTBGRGNFSXNWVUZCVlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eExRVUZMTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRM1pFTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVTnVSaXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlF6TkVMRU5CUVVNN2QwSkJSVVlzTkVSQlFUUkVPM2RDUVVNMVJDd3JSRUZCSzBRN2QwSkJReTlFTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU53UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlEzWkZMSGRGUVVGM1JUdG5RMEZEZUVVc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdORUpCUXpORExFTkJRVU03ZDBKQlEwWXNRMEZCUXp0M1FrRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6czBRa0ZEVUN4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkRFFVTXZSaXdyUkVGQkswUTdaME5CUXk5RUxFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSU3hwUWtGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPelJDUVVNelF5eERRVUZETzNkQ1FVTkdMRU5CUVVNN2QwSkJRMFFzUzBGQlN5eERRVUZETzI5Q1FVTlFMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEhRVUZITzNkQ1FVTm9RaXh2UmtGQmIwWTdkMEpCUTNCR0xFbEJRVWtzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUVVNN2QwSkJRM2hFTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTNKSExFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zUzBGQlN6dDNRa0ZEYkVJc1NVRkJTU3hIUVVGSExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNSMEZCUnl4RlFVRkZPelJDUVVNeFJDeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRMjVFTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOMlJTeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVazdkMEpCUTJwQ0xHdEhRVUZyUnp0M1FrRkRiRWNzU1VGQlNTeEhRVUZITEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenQzUWtGRGVrUXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dDNRa0ZEZUVRc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWRCUVVjc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN2QwSkJRek5GTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRemRFTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVTnVSaXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlF6TkVMRU5CUVVNN2QwSkJRMFlzUzBGQlN5eERRVUZETzI5Q1FVTlFMREJDUVVFd1FqdHZRa0ZETVVJN2QwSkJRME1zZDBKQlFYZENPM2RDUVVONFFpd3dRa0ZCTUVJN2QwSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPM2RDUVVOeVF5eERRVUZETzJkQ1FVTklMRU5CUVVNN1owSkJRMFFzVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF6dHZRa0ZEZUVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03WjBKQlEyaEdMRU5CUVVNN1dVRkRSaXhEUVVGRE8xRkJRMFlzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU14UkN4RFFVRkRPMGxCUlVRN096czdPenM3TzA5QlVVYzdTVUZEU1N4NVFrRkJVU3hIUVVGbUxGVkJRV2RDTEVsQlFXTXNSVUZCUlN4TFFVRnBRanRSUVVGcVFpeHhRa0ZCYVVJc1IwRkJha0lzVTBGQmFVSTdVVUZEYUVRc1owSkJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRzlDUVVGdlFpeERRVUZETEVOQlFVTTdVVUZEY2tNc1owSkJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVOdVJDdzRSRUZCT0VRc1EwRkJReXhEUVVGRE8xRkJRMnBGTEdkQ1FVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUlN4M1FrRkJkMElzUTBGQlF5eERRVUZETzFGQlF6bEVMR2RDUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhMUVVGTExFVkJRVVVzTUVKQlFUQkNMRU5CUVVNc1EwRkJRenRSUVVOb1JTeEpRVUZOTEdOQlFXTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETDBVc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNTMEZCU3l4VFFVRlRMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJwRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRM3BETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGRE4wUXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEZUVJc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zWTBGQll5eERRVUZETEZGQlFWRXNRMEZET1VNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVTTNSQ3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVONFFpeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenM3T3pzN08wOUJUMGM3U1VGRFNTeDVRa0ZCVVN4SFFVRm1MRlZCUVdkQ0xFbEJRV003VVVGRE4wSXNTVUZCU1N4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGFrUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRla0lzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03VVVGRGFFTXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRFppeERRVUZETzBsQlJVUTdPenM3T3p0UFFVMUhPMGxCUTBrc2VVSkJRVkVzUjBGQlppeFZRVUZuUWl4SlFVRmpMRVZCUVVVc1MwRkJhVUk3VVVGQmFrSXNjVUpCUVdsQ0xFZEJRV3BDTEZOQlFXbENPMUZCUTJoRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTjRReXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc01rSkJRVlVzUjBGQmFrSXNWVUZCYTBJc1ZVRkJiMEk3VVVGRGNrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEycENMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRFpDeERRVUZETzFGQlEwUXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVTjZSQ3huUlVGQlowVXNRMEZCUXl4RFFVRkRPMUZCUTI1RkxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUTBGQlF5eHRRa0ZCVVN4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGRFWXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEU1N4MVFrRkJUU3hIUVVGaUxGVkJRV01zUzBGQllUdFJRVU14UWl3eVJrRkJNa1k3VVVGRE0wWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTXNVMEZCVXl4RlFVRkZMRU5CUVVNN1pVRkRkRU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETzJWQlF5OURMRWxCUVVrc1EwRkJReXhQUVVGUExFdEJRVXNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMGxCUTNKRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREJDUVVGVExFZEJRV2hDTEZWQlFXbENMRXRCUVdFN1VVRkROMElzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNSVUZCUlN4RFFVRkRPMlZCUTJoRUxFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dGxRVU14UXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFdEJRVXNzUzBGQlN5eERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRha01zUTBGQlF6dEpRVVZFT3pzN096dFBRVXRITzBsQlEwa3NORUpCUVZjc1IwRkJiRUk3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhYUVVGWExFVkJRVVVzUjBGQlJ5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dEpRVU16UlN4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NlVUpCUVZFc1IwRkJaanRSUVVORExFbEJRVWtzVFVGQlRTeEhRVUZYTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFZEJRVWNzYjBKQlFXOUNMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0UlFVTnVSeXc0UTBGQk9FTTdVVUZET1VNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlFpeE5RVUZOTEVsQlFVa3NXVUZCV1N4SFFVRkhMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOMlJDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMSGRDUVVGUExFZEJRV1E3VVVGRFF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTTdTVUZETlVNc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwc3NORUpCUVZjc1IwRkJia0lzVlVGQmIwSXNRMEZCVnp0UlFVTTVRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4TFFVRkxMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6VkRMRTFCUVUwc1EwRkJReXhKUVVGSkxHMUNRVUZSTEVOQlEyeENMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRVZCUXpkR0xFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVNdlJDeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExWXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3T3p0UFFVbEhPMGxCUTBzc09FSkJRV0VzUjBGQmNrSXNWVUZCYzBJc1EwRkJWeXhGUVVGRkxGRkJRWGRDTzFGQlFYaENMSGRDUVVGM1FpeEhRVUY0UWl4bFFVRjNRanRSUVVNeFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJRenRsUVVNM1JDeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUXk5R0xFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEwZ3NUVUZCVFN4RFFVRkRMRWxCUVVrc2JVSkJRVkVzUTBGRGJFSXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNSVUZCUlN4RlFVRkZMRVZCUTNaQ0xFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4RlFVTm9ReXhEUVVGRExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRE4wSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMSGREUVVGM1F6dFJRVU51UkN4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkxMRFpDUVVGWkxFZEJRWEJDTzFGQlEwTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZPMlZCUXpWQ0xFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzZFVKQlFWa3NRMEZCUXl4TlFVRk5PMlZCUTNKRUxFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU4wUXl4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMHNzYjBOQlFXMUNMRWRCUVROQ08xRkJRME1zYTBOQlFXdERPMUZCUTJ4RExFbEJRVWtzVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU03VVVGRGVFTXNTVUZCU1N4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVndReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhYUVVGWExFbEJRVWtzVTBGQlV5eEpRVUZKTEVsQlFVa3NTVUZCU1N4VFFVRlRMRWRCUVVjc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY2tZc2MwUkJRWE5FTzFsQlEzUkVMRk5CUVZNc1IwRkJSeXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETzFsQlF6ZENMRTlCUVU4c1IwRkJSeXhwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXp0UlFVTXpRaXhEUVVGRE8xRkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4TFFVRkxMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeEpRVUZKTEZOQlFWTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1UwRkJVeXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpWRkxITkVRVUZ6UkR0WlFVTjBSQ3hUUVVGVExFZEJRVWNzVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTXpRaXhQUVVGUExFZEJRVWNzYVVKQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRNMElzUTBGQlF6dFJRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1MwRkJTeXhwUWtGQlVTeERRVUZETEUxQlFVMHNTVUZCU1N4VFFVRlRMRWxCUVVrc1JVRkJSU3hKUVVGSkxGTkJRVk1zUjBGQlJ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNMVJTeFRRVUZUTEVkQlFVY3NVMEZCVXl4SFFVRkhMRVZCUVVVc1EwRkJRenRaUVVNelFpeFBRVUZQTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU03VVVGRGVrSXNRMEZCUXp0UlFVTkVMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1NVRkJTU3hUUVVGVExFbEJRVWtzUlVGQlJTeEpRVUZKTEZOQlFWTXNSMEZCUnl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU14UlN4VFFVRlRMRWRCUVVjc1UwRkJVeXhIUVVGSExFVkJRVVVzUTBGQlF6dFpRVU16UWl4UFFVRlBMRWRCUVVjc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTTdVVUZEZUVJc1EwRkJRenRSUVVORUxESkVRVUV5UkR0UlFVTXpSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF5OUNMRk5CUVZNc1IwRkJSeXhUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlF6RkNMRTlCUVU4c1IwRkJSeXhwUWtGQlVTeERRVUZETEVkQlFVY3NRMEZCUXp0UlFVTjRRaXhEUVVGRE8xRkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4TFFVRkxMR2xDUVVGUkxFTkJRVU1zUzBGQlN5eEpRVUZKTEZOQlFWTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1UwRkJVeXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpORkxGTkJRVk1zUjBGQlJ5eFRRVUZUTEVkQlFVY3NSVUZCUlN4RFFVRkRPMWxCUXpOQ0xFOUJRVThzUjBGQlJ5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVONlFpeERRVUZETzFGQlJVUXNTVUZCU1N4RFFVRkRMRmxCUVZrc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlFVTXNVMEZCVXl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJSWEpFTEhsQ1FVRjVRanRSUVVONlFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzcENMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTXhRaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExGTkJRVk1zUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRSUVVNelF5eERRVUZETzFGQlJVUXNNRUpCUVRCQ08xRkJRekZDTEVsQlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8wbEJRMnBGTEVOQlFVTTdTVUZGUml4aFFVRkRPMEZCUVVRc1EwRkJReXhCUVRkNVFrUXNTVUUyZVVKRE8wRkJOM2xDV1N4alFVRk5MRk5CTm5sQ2JFSXNRMEZCUVNKOSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgYmVnaW5uaW5nLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIHBhZExlZnQocywgd2lkdGgsIGNoYXIpIHtcclxuICAgIHZhciBwYWRkaW5nID0gXCJcIjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFkZGluZyArIHM7XHJcbn1cclxuZXhwb3J0cy5wYWRMZWZ0ID0gcGFkTGVmdDtcclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIHBhZFJpZ2h0KHMsIHdpZHRoLCBjaGFyKSB7XHJcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgcGFkZGluZyArPSBjaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHMgKyBwYWRkaW5nO1xyXG59XHJcbmV4cG9ydHMucGFkUmlnaHQgPSBwYWRSaWdodDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSeWFXNW5jeTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OXNhV0l2YzNSeWFXNW5jeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPenRIUVVsSE8wRkJSVWdzV1VGQldTeERRVUZETzBGQlNXSTdPenM3T3p0SFFVMUhPMEZCUTBnc2FVSkJRWGRDTEVOQlFWTXNSVUZCUlN4TFFVRmhMRVZCUVVVc1NVRkJXVHRKUVVNM1JDeEpRVUZKTEU5QlFVOHNSMEZCVnl4RlFVRkZMRU5CUVVNN1NVRkRla0lzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXp0UlFVTTNReXhQUVVGUExFbEJRVWtzU1VGQlNTeERRVUZETzBsQlEycENMRU5CUVVNN1NVRkRSQ3hOUVVGTkxFTkJRVU1zVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTndRaXhEUVVGRE8wRkJUbVVzWlVGQlR5eFZRVTEwUWl4RFFVRkJPMEZCUlVRN096czdPenRIUVUxSE8wRkJRMGdzYTBKQlFYbENMRU5CUVZNc1JVRkJSU3hMUVVGaExFVkJRVVVzU1VGQldUdEpRVU01UkN4SlFVRkpMRTlCUVU4c1IwRkJWeXhGUVVGRkxFTkJRVU03U1VGRGVrSXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJRenRSUVVNM1F5eFBRVUZQTEVsQlFVa3NTVUZCU1N4RFFVRkRPMGxCUTJwQ0xFTkJRVU03U1VGRFJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJRenRCUVVOd1FpeERRVUZETzBGQlRtVXNaMEpCUVZFc1YwRk5ka0lzUTBGQlFTSjkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcclxuICovXHJcbnZhciBSZWFsVGltZVNvdXJjZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSZWFsVGltZVNvdXJjZSgpIHtcclxuICAgIH1cclxuICAgIFJlYWxUaW1lU291cmNlLnByb3RvdHlwZS5ub3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJlYWxUaW1lU291cmNlO1xyXG59KCkpO1xyXG5leHBvcnRzLlJlYWxUaW1lU291cmNlID0gUmVhbFRpbWVTb3VyY2U7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRHbHRaWE52ZFhKalpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5c2FXSXZkR2x0WlhOdmRYSmpaUzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdSMEZGUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVdOaU96dEhRVVZITzBGQlEwZzdTVUZCUVR0SlFWRkJMRU5CUVVNN1NVRlFRU3cwUWtGQlJ5eEhRVUZJTzFGQlEwTXNkMEpCUVhkQ08xRkJRM2hDTERCQ1FVRXdRanRSUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMVlzVFVGQlRTeERRVUZETEVsQlFVa3NTVUZCU1N4RlFVRkZMRU5CUVVNN1VVRkRia0lzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZEUml4eFFrRkJRenRCUVVGRUxFTkJRVU1zUVVGU1JDeEpRVkZETzBGQlVsa3NjMEpCUVdNc2FVSkJVVEZDTEVOQlFVRWlmUT09IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbnZhciB0el9kYXRhYmFzZV8xID0gcmVxdWlyZShcIi4vdHotZGF0YWJhc2VcIik7XHJcbi8qKlxyXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmZ1bmN0aW9uIGxvY2FsKCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XHJcbn1cclxuZXhwb3J0cy5sb2NhbCA9IGxvY2FsO1xyXG4vKipcclxuICogQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUgem9uZS4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqL1xyXG5mdW5jdGlvbiB1dGMoKSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUudXRjKCk7XHJcbn1cclxuZXhwb3J0cy51dGMgPSB1dGM7XHJcbi8qKlxyXG4gKiBTZWUgdGhlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIG90aGVyIHpvbmUoKSBtZXRob2Qgc2lnbmF0dXJlcy5cclxuICovXHJcbmZ1bmN0aW9uIHpvbmUoYSwgZHN0KSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUuem9uZShhLCBkc3QpO1xyXG59XHJcbmV4cG9ydHMuem9uZSA9IHpvbmU7XHJcbi8qKlxyXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcclxuICovXHJcbihmdW5jdGlvbiAoVGltZVpvbmVLaW5kKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiTG9jYWxcIl0gPSAwXSA9IFwiTG9jYWxcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIk9mZnNldFwiXSA9IDFdID0gXCJPZmZzZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXHJcbiAgICAgKiBEU1QgaWYgYXBwbGljYWJsZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIlByb3BlclwiXSA9IDJdID0gXCJQcm9wZXJcIjtcclxufSkoZXhwb3J0cy5UaW1lWm9uZUtpbmQgfHwgKGV4cG9ydHMuVGltZVpvbmVLaW5kID0ge30pKTtcclxudmFyIFRpbWVab25lS2luZCA9IGV4cG9ydHMuVGltZVpvbmVLaW5kO1xyXG4vKipcclxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcclxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXHJcbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxyXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXHJcbiAqXHJcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcclxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxyXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxyXG4gKi9cclxudmFyIFRpbWVab25lID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xyXG4gICAgICogVGltZVpvbmUuem9uZSgpIG1ldGhvZCBpbnN0ZWFkLlxyXG4gICAgICogQHBhcmFtIG5hbWUgTk9STUFMSVpFRCBuYW1lLCBhc3N1bWVkIHRvIGJlIGNvcnJlY3RcclxuICAgICAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVab25lKG5hbWUsIGRzdCkge1xyXG4gICAgICAgIGlmIChkc3QgPT09IHZvaWQgMCkgeyBkc3QgPSB0cnVlOyB9XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5fZHN0ID0gZHN0O1xyXG4gICAgICAgIGlmIChuYW1lID09PSBcImxvY2FsdGltZVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuTG9jYWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSBcIitcIiB8fCBuYW1lLmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgbmFtZS5jaGFyQXQoMCkubWF0Y2goL1xcZC8pIHx8IG5hbWUgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuT2Zmc2V0O1xyXG4gICAgICAgICAgICB0aGlzLl9vZmZzZXQgPSBUaW1lWm9uZS5zdHJpbmdUb09mZnNldChuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuUHJvcGVyO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmV4aXN0cyhuYW1lKSwgXCJub24tZXhpc3RpbmcgdGltZSB6b25lIG5hbWUgJ1wiICsgbmFtZSArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZS4gTm90ZSB0aGF0XHJcbiAgICAgKiB0aGUgdGltZSB6b25lIHZhcmllcyB3aXRoIHRoZSBkYXRlOiBhbXN0ZXJkYW0gdGltZSBmb3JcclxuICAgICAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUubG9jYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJsb2NhbHRpbWVcIiwgdHJ1ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgVVRDIHRpbWUgem9uZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUudXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFpvbmUgaW1wbGVtZW50YXRpb25zXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnpvbmUgPSBmdW5jdGlvbiAoYSwgZHN0KSB7XHJcbiAgICAgICAgaWYgKGRzdCA9PT0gdm9pZCAwKSB7IGRzdCA9IHRydWU7IH1cclxuICAgICAgICB2YXIgbmFtZSA9IFwiXCI7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgKGEpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IGE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gbm8gdGltZSB6b25lXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IGE7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChvZmZzZXQgPiAtMjQgKiA2MCAmJiBvZmZzZXQgPCAyNCAqIDYwLCBcIlRpbWVab25lLnpvbmUoKTogb2Zmc2V0IG91dCBvZiByYW5nZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcob2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaW1lWm9uZS56b25lKCk6IFVuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZSBcXFwiXCIgKyB0eXBlb2YgKGEpICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShuYW1lLCBkc3QpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGNhY2hlZCB5b3Ugd2lsbCBOT1RcclxuICAgICAqIGFjdHVhbGx5IGdldCBhIGNsb25lIGJ1dCB0aGUgc2FtZSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXHJcbiAgICAgKiBJQU5BIHRpbWUgem9uZSBuYW1lIFwiRXVyb3BlL0Ftc3RlcmRhbVwiLCBvciBcImxvY2FsdGltZVwiIGZvclxyXG4gICAgICogdGhlIGxvY2FsIHRpbWUgem9uZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmRzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUua2luZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2luZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xyXG4gICAgICogZWFjaCBvdGhlci4gT3RoZXIgdGltZSB6b25lcyBhcmUgbm90IG1hcHBlZCBvbnRvIGVhY2ggb3RoZXIuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1V0YygpICYmIG90aGVyLmlzVXRjKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWVcclxuICAgICAgICAgICAgICAgICYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHpvbmUga2luZC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lICYmIHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmlzVXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnpvbmVJc1V0Yyh0aGlzLl9uYW1lKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIHRoaXMgem9uZSBoYXZlIERheWxpZ2h0IFNhdmluZyBUaW1lIGF0IGFsbD9cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmhhc0RzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuICh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5oYXNEc3QodGhpcy5fbmFtZSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3JVdGMgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICAgICAgdmFyIHV0Y1RpbWUgPSAoYSAmJiBhIGluc3RhbmNlb2YgYmFzaWNzXzEuVGltZVN0cnVjdCA/IGEgOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEModXRjVGltZS5jb21wb25lbnRzLnllYXIsIHV0Y1RpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIHV0Y1RpbWUuY29tcG9uZW50cy5kYXksIHV0Y1RpbWUuY29tcG9uZW50cy5ob3VyLCB1dGNUaW1lLmNvbXBvbmVudHMubWludXRlLCB1dGNUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCB1dGNUaW1lLmNvbXBvbmVudHMubWlsbGkpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBUaW1lWm9uZUtpbmQgJ1wiICsgdGhpcy5fa2luZCArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmUgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICAgICAgdmFyIGxvY2FsVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBiYXNpY3NfMS5UaW1lU3RydWN0ID8gYSA6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSkpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuaG91ciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWludXRlLCBsb2NhbFRpbWUuY29tcG9uZW50cy5zZWNvbmQsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbGxpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXRMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIFRpbWVab25lS2luZCAnXCIgKyB0aGlzLl9raW5kICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3JVdGNEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Rm9yVXRjKGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5hYmJyZXZpYXRpb25Gb3JVdGMgPSBmdW5jdGlvbiAoYSwgYiwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGksIGMpIHtcclxuICAgICAgICB2YXIgdXRjVGltZTtcclxuICAgICAgICB2YXIgZHN0RGVwZW5kZW50ID0gdHJ1ZTtcclxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIGJhc2ljc18xLlRpbWVTdHJ1Y3QpIHtcclxuICAgICAgICAgICAgdXRjVGltZSA9IGE7XHJcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB1dGNUaW1lID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImxvY2FsXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVua25vd24gVGltZVpvbmVLaW5kICdcIiArIHRoaXMuX2tpbmQgKyBcIidcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5ub3JtYWxpemVab25lVGltZSA9IGZ1bmN0aW9uIChsb2NhbFRpbWUsIG9wdCkge1xyXG4gICAgICAgIGlmIChvcHQgPT09IHZvaWQgMCkgeyBvcHQgPSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIHZhciB0em9wdCA9IChvcHQgPT09IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gPyB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXApO1xyXG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxUaW1lO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXHJcbiAgICAgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm5hbWUoKTtcclxuICAgICAgICBpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltUaW1lWm9uZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICAgICAgICB2YXIgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xyXG4gICAgICAgIHJldHVybiBzaWduICsgc3RyaW5ncy5wYWRMZWZ0KGhvdXJzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQobWludXRlcy50b1N0cmluZygxMCksIDIsIFwiMFwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cclxuICAgICAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXHJcbiAgICAgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgLy8gZWFzeSBjYXNlXHJcbiAgICAgICAgaWYgKHQgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayB0aGF0IHRoZSByZW1haW5kZXIgY29uZm9ybXMgdG8gSVNPIHRpbWUgem9uZSBzcGVjXHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLyksIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcclxuICAgICAgICB2YXIgc2lnbiA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xyXG4gICAgICAgIHZhciBob3VycyA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSAwO1xyXG4gICAgICAgIGlmICh0Lmxlbmd0aCA9PT0gNSkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodC5sZW5ndGggPT09IDYpIHtcclxuICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDQsIDIpLCAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaG91cnMgPj0gMCAmJiBob3VycyA8IDI0LCBcIk9mZnNldHMgZnJvbSBVVEMgbXVzdCBiZSBsZXNzIHRoYW4gYSBkYXkuXCIpO1xyXG4gICAgICAgIHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcclxuICAgICAqIEBwYXJhbSBuYW1lXHRUaW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIGRzdCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBuYW1lICsgKGRzdCA/IFwiX0RTVFwiIDogXCJfTk8tRFNUXCIpO1xyXG4gICAgICAgIGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUaW1lWm9uZS5fY2FjaGVba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XHJcbiAgICAgICAgICAgIFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXHJcbiAgICAgKiBjYWNoZSBsb29rdXBcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHQubGVuZ3RoID4gMCwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xyXG4gICAgICAgIGlmICh0ID09PSBcImxvY2FsdGltZVwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0ID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIrMDA6MDBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nKHQpKSB7XHJcbiAgICAgICAgICAgIC8vIG9mZnNldCBzdHJpbmdcclxuICAgICAgICAgICAgLy8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLl9pc09mZnNldFN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICByZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGltZSB6b25lIGNhY2hlLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fY2FjaGUgPSB7fTtcclxuICAgIHJldHVybiBUaW1lWm9uZTtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lWm9uZSA9IFRpbWVab25lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lkR2x0WlhwdmJtVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMM1JwYldWNmIyNWxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPMGRCU1VjN1FVRkZTQ3haUVVGWkxFTkJRVU03UVVGRllpeDFRa0ZCYlVJc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRE9VSXNkVUpCUVRKQ0xGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlJYUkRMRWxCUVZrc1QwRkJUeXhYUVVGTkxGZEJRVmNzUTBGQlF5eERRVUZCTzBGQlEzSkRMRFJDUVVFMlF5eGxRVUZsTEVOQlFVTXNRMEZCUVR0QlFVVTNSRHM3TzBkQlIwYzdRVUZEU0R0SlFVTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdRVUZEZWtJc1EwRkJRenRCUVVabExHRkJRVXNzVVVGRmNFSXNRMEZCUVR0QlFVVkVPenM3UjBGSFJ6dEJRVU5JTzBsQlEwTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dEJRVU4yUWl4RFFVRkRPMEZCUm1Vc1YwRkJSeXhOUVVWc1FpeERRVUZCTzBGQmRVSkVPenRIUVVWSE8wRkJRMGdzWTBGQmNVSXNRMEZCVFN4RlFVRkZMRWRCUVdFN1NVRkRla01zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBGQlF6bENMRU5CUVVNN1FVRkdaU3haUVVGSkxFOUJSVzVDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSUxGZEJRVmtzV1VGQldUdEpRVU4yUWpzN1QwRkZSenRKUVVOSUxHbEVRVUZMTEVOQlFVRTdTVUZEVERzN1QwRkZSenRKUVVOSUxHMUVRVUZOTEVOQlFVRTdTVUZEVGpzN08wOUJSMGM3U1VGRFNDeHRSRUZCVFN4RFFVRkJPMEZCUTFBc1EwRkJReXhGUVdSWExHOUNRVUZaTEV0QlFWb3NiMEpCUVZrc1VVRmpka0k3UVVGa1JDeEpRVUZaTEZsQlFWa3NSMEZCV2l4dlFrRmpXQ3hEUVVGQk8wRkJSVVE3T3pzN096czdPenRIUVZOSE8wRkJRMGc3U1VGcFIwTTdPenM3TzA5QlMwYzdTVUZEU0N4clFrRkJiMElzU1VGQldTeEZRVUZGTEVkQlFXMUNPMUZCUVc1Q0xHMUNRVUZ0UWl4SFFVRnVRaXhWUVVGdFFqdFJRVU53UkN4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF6dFJRVU5zUWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF6dFJRVU5vUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFdEJRVXNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTXhRaXhKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRha01zUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNelJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRmxCUVZrc1EwRkJReXhOUVVGTkxFTkJRVU03V1VGRGFrTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpsRExFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzV1VGQldTeERRVUZETEUxQlFVMHNRMEZCUXp0WlFVTnFReXhuUWtGQlRTeERRVUZETEhkQ1FVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMR3REUVVGblF5eEpRVUZKTEUxQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTNKR0xFTkJRVU03U1VGRFJpeERRVUZETzBsQk1VWkVPenM3TzA5QlNVYzdTVUZEVnl4alFVRkxMRWRCUVc1Q08xRkJRME1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzBsQlEyeEVMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5YTEZsQlFVY3NSMEZCYWtJN1VVRkRReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eHRSa0ZCYlVZN1NVRkRhRWtzUTBGQlF6dEpRWGRDUkRzN1QwRkZSenRKUVVOWExHRkJRVWtzUjBGQmJFSXNWVUZCYlVJc1EwRkJUU3hGUVVGRkxFZEJRVzFDTzFGQlFXNUNMRzFDUVVGdFFpeEhRVUZ1UWl4VlFVRnRRanRSUVVNM1F5eEpRVUZKTEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRaQ3hOUVVGTkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JDTEV0QlFVc3NVVUZCVVR0blFrRkJSU3hEUVVGRE8yOUNRVU5tTEVsQlFVa3NRMEZCUXl4SFFVRlhMRU5CUVVNc1EwRkJRenR2UWtGRGJFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU16UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zWlVGQlpUdHZRa0ZETjBJc1EwRkJRenR2UWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRVQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdORUpCUTI1RExFZEJRVWNzUjBGQlJ5eExRVUZMTEVOQlFVTTdORUpCUTFvc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRemxETEVOQlFVTTdkMEpCUTBRc1NVRkJTU3hIUVVGSExGRkJRVkVzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEY2tNc1EwRkJRenRuUWtGRFJpeERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOU0xFdEJRVXNzVVVGQlVUdG5Ra0ZCUlN4RFFVRkRPMjlDUVVObUxFbEJRVTBzVFVGQlRTeEhRVUZ0UWl4RFFVRkRMRU5CUVVNN2IwSkJRMnBETEdkQ1FVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNTVUZCU1N4TlFVRk5MRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUlVGQlJTeHpRMEZCYzBNc1EwRkJReXhEUVVGRE8yOUNRVU4wUml4SlFVRkpMRWRCUVVjc1VVRkJVU3hEUVVGRExHTkJRV01zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0blFrRkRlRU1zUTBGQlF6dG5Ra0ZCUXl4TFFVRkxMRU5CUVVNN1dVRkRVaXd3UWtGQk1FSTdXVUZETVVJN1owSkJRME1zZDBKQlFYZENPMmRDUVVONFFpd3dRa0ZCTUVJN1owSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXc0UTBGQk9FTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTNKR0xFTkJRVU03VVVGRFNDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGelFrUTdPenRQUVVkSE8wbEJRMGtzZDBKQlFVc3NSMEZCV2p0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU03U1VGRFlpeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEhWQ1FVRkpMRWRCUVZnN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTnVRaXhEUVVGRE8wbEJSVTBzYzBKQlFVY3NSMEZCVmp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETzBsQlEyeENMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhWQ1FVRkpMRWRCUVZnN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTnVRaXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc2VVSkJRVTBzUjBGQllpeFZRVUZqTEV0QlFXVTdVVUZETlVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYmtNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU5pTEVOQlFVTTdVVUZEUkN4TlFVRk5MRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTndRaXhMUVVGTExGbEJRVmtzUTBGQlF5eExRVUZMTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVOMFJTeExRVUZMTEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNTMEZCU3l4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03V1VGRE1VY3NTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhaUVVGWkxFTkJRVU1zVFVGQlRUdHRRa0ZEYkVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUzBGQlN5eExRVUZMTEVOQlFVTXNTMEZCU3p0dFFrRkRNVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4TFFVRkxMRXRCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMnhFTERCQ1FVRXdRanRaUVVNeFFqdG5Ra0ZEUXl4M1FrRkJkMEk3WjBKQlEzaENMREJDUVVFd1FqdG5Ra0ZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhsQ1FVRjVRaXhEUVVGRExFTkJRVU03WjBKQlF6VkRMRU5CUVVNN1VVRkRTQ3hEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc05FSkJRVk1zUjBGQmFFSXNWVUZCYVVJc1MwRkJaVHRSUVVNdlFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4TFFVRkxMRmxCUVZrc1EwRkJReXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVTjBSU3hMUVVGTExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEZsQlFWa3NRMEZCUXl4TlFVRk5MRWxCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkRNVWNzUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUU3hKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEV0QlFVc3NTMEZCU3l4RFFVRkRMRXRCUVVzc1NVRkJTU3hKUVVGSkxFTkJRVU1zU1VGQlNTeExRVUZMTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOc1NTd3dRa0ZCTUVJN1dVRkRNVUk3WjBKQlEwTXNkMEpCUVhkQ08yZENRVU40UWl3d1FrRkJNRUk3WjBKQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eDVRa0ZCZVVJc1EwRkJReXhEUVVGRE8yZENRVU0xUXl4RFFVRkRPMUZCUTBnc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMSGRDUVVGTExFZEJRVm83VVVGRFF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4TFFVRkxMRmxCUVZrc1EwRkJReXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0WlFVTjBReXhMUVVGTExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjBSQ3hMUVVGTExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc2QwSkJRVlVzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETDBVc01FSkJRVEJDTzFsQlF6RkNPMmRDUVVORExIZENRVUYzUWp0blFrRkRlRUlzTUVKQlFUQkNPMmRDUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5XTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1owSkJRMlFzUTBGQlF6dFJRVU5JTEVOQlFVTTdTVUZGUml4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDVRa0ZCVFN4SFFVRmlPMUZCUTBNc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRUlzUzBGQlN5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGRFTXNTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTTdXVUZEZGtNc1MwRkJTeXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMSGRDUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6VkZMREJDUVVFd1FqdFpRVU14UWp0blFrRkRReXgzUWtGQmQwSTdaMEpCUTNoQ0xEQkNRVUV3UWp0blFrRkRNVUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRFZpeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVOa0xFTkJRVU03VVVGRFNDeERRVUZETzBsQlJVWXNRMEZCUXp0SlFWRk5MQ3RDUVVGWkxFZEJRVzVDTEZWQlEwTXNRMEZCZFVJc1JVRkJSU3hMUVVGakxFVkJRVVVzUjBGQldTeEZRVUZGTEVsQlFXRXNSVUZCUlN4TlFVRmxMRVZCUVVVc1RVRkJaU3hGUVVGRkxFdEJRV003VVVGRmRFZ3NTVUZCVFN4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEcxQ1FVRlZMRWRCUVVjc1EwRkJReXhIUVVGSExFbEJRVWtzYlVKQlFWVXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hEUVVGWExFVkJRVVVzV1VGQlN5eEZRVUZGTEZGQlFVY3NSVUZCUlN4VlFVRkpMRVZCUVVVc1kwRkJUU3hGUVVGRkxHTkJRVTBzUlVGQlJTeFpRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRjRWtzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNFSXNTMEZCU3l4WlFVRlpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03WjBKQlEzcENMRWxCUVUwc1NVRkJTU3hIUVVGVExFbEJRVWtzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUTI1RExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNSVUZCUlN4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGRE4wVXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRM1pITEVOQlFVTXNRMEZCUXp0blFrRkRTQ3hOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeEZRVUZGTEVOQlFVTTdXVUZEZEVNc1EwRkJRenRaUVVORUxFdEJRVXNzV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPMmRDUVVNeFFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRaUVVOeVFpeERRVUZETzFsQlEwUXNTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU03WjBKQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVObUxFMUJRVTBzUTBGQlF5eDNRa0ZCVlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeERRVUZETzJkQ1FVTjZSU3hEUVVGRE8yZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOUUxFMUJRVTBzUTBGQlF5eDNRa0ZCVlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeERRVUZETzJkQ1FVTTFSU3hEUVVGRE8xbEJRMFlzUTBGQlF6dFpRVU5FTERCQ1FVRXdRanRaUVVNeFFqdG5Ra0ZEUXl4M1FrRkJkMEk3WjBKQlEzaENMREJDUVVFd1FqdG5Ra0ZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERKQ1FVRjVRaXhKUVVGSkxFTkJRVU1zUzBGQlN5eE5RVUZITEVOQlFVTXNRMEZCUXp0blFrRkRla1FzUTBGQlF6dFJRVU5JTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCWlUwc1owTkJRV0VzUjBGQmNFSXNWVUZEUXl4RFFVRjFRaXhGUVVGRkxFdEJRV01zUlVGQlJTeEhRVUZaTEVWQlFVVXNTVUZCWVN4RlFVRkZMRTFCUVdVc1JVRkJSU3hOUVVGbExFVkJRVVVzUzBGQll6dFJRVVYwU0N4SlFVRk5MRk5CUVZNc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NiVUpCUVZVc1IwRkJSeXhEUVVGRExFZEJRVWNzU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFTkJRVmNzUlVGQlJTeFpRVUZMTEVWQlFVVXNVVUZCUnl4RlFVRkZMRlZCUVVrc1JVRkJSU3hqUVVGTkxFVkJRVVVzWTBGQlRTeEZRVUZGTEZsQlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOMFNTeE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4TFFVRkxMRmxCUVZrc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dG5Ra0ZEZWtJc1NVRkJUU3hKUVVGSkxFZEJRVk1zU1VGQlNTeEpRVUZKTEVOQlF6RkNMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZOQlFWTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUlVGQlJTeFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkRia1lzVTBGQlV5eERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNVMEZCVXl4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzVTBGQlV5eERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUXk5SExFTkJRVU03WjBKQlEwWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1JVRkJSU3hEUVVGRE8xbEJRM1JETEVOQlFVTTdXVUZEUkN4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dG5Ra0ZETVVJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTTdXVUZEY2tJc1EwRkJRenRaUVVORUxFdEJRVXNzV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPMmRDUVVNeFFpd3lSVUZCTWtVN1owSkJRek5GTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTm1MRTFCUVUwc1EwRkJReXgzUWtGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMR2RDUVVGblFpeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTTdaMEpCUTJoR0xFTkJRVU03WjBKQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN2IwSkJRMUFzVFVGQlRTeERRVUZETEhkQ1FVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTTdaMEpCUXpsRkxFTkJRVU03V1VGRFJpeERRVUZETzFsQlEwUXNNRUpCUVRCQ08xbEJRekZDTzJkQ1FVTkRMSGRDUVVGM1FqdG5Ra0ZEZUVJc01FSkJRVEJDTzJkQ1FVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNNa0pCUVhsQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEUxQlFVY3NRMEZCUXl4RFFVRkRPMmRDUVVONlJDeERRVUZETzFGQlEwZ3NRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3T3pzN096czdUMEZSUnp0SlFVTkpMRzFEUVVGblFpeEhRVUYyUWl4VlFVRjNRaXhKUVVGVkxFVkJRVVVzUzBGQmIwSTdVVUZEZGtRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNiVUpCUVZVc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkROVVFzUTBGQlF6dEpRVVZFT3pzN096czdPenRQUVZGSE8wbEJRMGtzYjBOQlFXbENMRWRCUVhoQ0xGVkJRWGxDTEVsQlFWVXNSVUZCUlN4TFFVRnZRanRSUVVONFJDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXh0UWtGQlZTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU0zUkN4RFFVRkRPMGxCYjBKTkxIRkRRVUZyUWl4SFFVRjZRaXhWUVVORExFTkJRWFZDTEVWQlFVVXNRMEZCYjBJc1JVRkJSU3hIUVVGWkxFVkJRVVVzU1VGQllTeEZRVUZGTEUxQlFXVXNSVUZCUlN4TlFVRmxMRVZCUVVVc1MwRkJZeXhGUVVGRkxFTkJRVmM3VVVGRmVra3NTVUZCU1N4UFFVRnRRaXhEUVVGRE8xRkJRM2hDTEVsQlFVa3NXVUZCV1N4SFFVRlpMRWxCUVVrc1EwRkJRenRSUVVOcVF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRmxCUVZrc2JVSkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETjBJc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU5hTEZsQlFWa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1MwRkJTeXhMUVVGTExFZEJRVWNzUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpkRExFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTlCUVU4c1IwRkJSeXhKUVVGSkxHMUNRVUZWTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1EwRkJReXhGUVVGRkxFdEJRVXNzUlVGQlJTeERRVUZYTEVWQlFVVXNVVUZCUnl4RlFVRkZMRlZCUVVrc1JVRkJSU3hqUVVGTkxFVkJRVVVzWTBGQlRTeEZRVUZGTEZsQlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkROVVlzV1VGQldTeEhRVUZITEVOQlFVTXNRMEZCUXl4TFFVRkxMRXRCUVVzc1IwRkJSeXhMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETjBNc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JDTEV0QlFVc3NXVUZCV1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8yZENRVU42UWl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRE8xbEJRMmhDTEVOQlFVTTdXVUZEUkN4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dG5Ra0ZETVVJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0WlFVTjRRaXhEUVVGRE8xbEJRMFFzUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1owSkJRekZDTEUxQlFVMHNRMEZCUXl4M1FrRkJWU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFOUJRVThzUlVGQlJTeFpRVUZaTEVOQlFVTXNRMEZCUXp0WlFVTTVSU3hEUVVGRE8xbEJRMFFzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTWtKQlFYbENMRWxCUVVrc1EwRkJReXhMUVVGTExFMUJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTjZSQ3hEUVVGRE8xRkJRMGdzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUUwUWswc2IwTkJRV2xDTEVkQlFYaENMRlZCUVhsQ0xGTkJRVGhDTEVWQlFVVXNSMEZCZVVNN1VVRkJla01zYlVKQlFYbERMRWRCUVhwRExFMUJRWFZDTERaQ1FVRmxMRU5CUVVNc1JVRkJSVHRSUVVOcVJ5eEpRVUZOTEV0QlFVc3NSMEZCYjBJc1EwRkJReXhIUVVGSExFdEJRVXNzTmtKQlFXVXNRMEZCUXl4SlFVRkpMRWRCUVVjc05rSkJRV1VzUTBGQlF5eEpRVUZKTEVkQlFVY3NOa0pCUVdVc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU14Unl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhUUVVGVExFdEJRVXNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRia01zVFVGQlRTeERRVUZETEhkQ1FVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3h0UWtGQlZTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF6dFpRVU4wUnl4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNUVUZCVFN4RFFVRkRMSGRDUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFVkJRVVVzVTBGQlV5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpORkxFTkJRVU03VVVGRFJpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETzFGQlEyeENMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc01rSkJRVkVzUjBGQlpqdFJRVU5ETEVsQlFVa3NUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVU42UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYkVNc1RVRkJUU3hKUVVGSkxHTkJRV01zUTBGQlF6dFpRVU14UWl4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEWml4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNDd3dRa0ZCVHl4SFFVRlFPMUZCUTBNc1RVRkJUU3hEUVVGRExHRkJRV0VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZMRWRCUVVjc1IwRkJSeXhEUVVGRE8wbEJRemxETEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlExY3NkVUpCUVdNc1IwRkJOVUlzVlVGQk5rSXNUVUZCWXp0UlFVTXhReXhKUVVGTkxFbEJRVWtzUjBGQlJ5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzUkRMRWxCUVUwc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTm9SQ3hKUVVGTkxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVFVGQlRTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eEhRVUZITEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEycElMRU5CUVVNN1NVRkZSRHM3T3p0UFFVbEhPMGxCUTFjc2RVSkJRV01zUjBGQk5VSXNWVUZCTmtJc1EwRkJVenRSUVVOeVF5eEpRVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03VVVGRGJrSXNXVUZCV1R0UlFVTmFMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5XTEVOQlFVTTdVVUZEUkN3d1JFRkJNRVE3VVVGRE1VUXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEc5Q1FVRnZRaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4WlFVRlpMRU5CUVVNc1JVRkJSU3cwUWtGQk5FSXNSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRGVFY3NTVUZCVFN4SlFVRkpMRWRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTndSQ3hKUVVGTkxFdEJRVXNzUjBGQlZ5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRia1FzU1VGQlNTeFBRVUZQTEVkQlFWY3NRMEZCUXl4RFFVRkRPMUZCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4UFFVRlBMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEzaERMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6TkNMRTlCUVU4c1IwRkJSeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEZUVNc1EwRkJRenRSUVVORUxHZENRVUZOTEVOQlFVTXNTMEZCU3l4SlFVRkpMRU5CUVVNc1NVRkJTU3hMUVVGTExFZEJRVWNzUlVGQlJTeEZRVUZGTERKRFFVRXlReXhEUVVGRExFTkJRVU03VVVGRE9VVXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFdEJRVXNzUjBGQlJ5eEZRVUZGTEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNN1NVRkRkRU1zUTBGQlF6dEpRVkZFT3pzN08wOUJTVWM3U1VGRFdTeHpRa0ZCWVN4SFFVRTFRaXhWUVVFMlFpeEpRVUZaTEVWQlFVVXNSMEZCV1R0UlFVTjBSQ3hKUVVGTkxFZEJRVWNzUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWRCUVVjc1RVRkJUU3hIUVVGSExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlF6bERMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNMVFpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU0zUWl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeEpRVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEYkVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRla0lzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTldMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTFrc2VVSkJRV2RDTEVkQlFTOUNMRlZCUVdkRExFTkJRVk03VVVGRGVFTXNTVUZCVFN4RFFVRkRMRWRCUVZjc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlF6TkNMR2RDUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVc09FSkJRVGhDTEVOQlFVTXNRMEZCUXp0UlFVTnlSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMlFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFZc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUWl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJRMnBDTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVFTXNaMEpCUVdkQ08xbEJRMmhDTEhsRFFVRjVRenRaUVVONlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMR05CUVdNc1EwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkROVVFzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc2VVSkJRWGxDTzFsQlEzcENMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZpeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVmpMSGRDUVVGbExFZEJRVGxDTEZWQlFTdENMRU5CUVZNN1VVRkRka01zU1VGQlRTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xRkJRMjVDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6dEpRVU5zUlN4RFFVRkRPMGxCTjBORU96dFBRVVZITzBsQlExa3NaVUZCVFN4SFFVRnJReXhGUVVGRkxFTkJRVU03U1VFeVF6TkVMR1ZCUVVNN1FVRkJSQ3hEUVVGRExFRkJhbWhDUkN4SlFXbG9Ra003UVVGcWFFSlpMR2RDUVVGUkxGZEJhV2hDY0VJc1EwRkJRU0o5IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIFRva2VuaXplciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyB0b2tlbml6ZXJcclxuICAgICAqIEBwYXJhbSBfZm9ybWF0U3RyaW5nIChvcHRpb25hbCkgU2V0IHRoZSBmb3JtYXQgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRva2VuaXplcihfZm9ybWF0U3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fZm9ybWF0U3RyaW5nID0gX2Zvcm1hdFN0cmluZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBmb3JtYXQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBuZXcgc3RyaW5nIHRvIHVzZSBmb3IgZm9ybWF0dGluZ1xyXG4gICAgICovXHJcbiAgICBUb2tlbml6ZXIucHJvdG90eXBlLnNldEZvcm1hdFN0cmluZyA9IGZ1bmN0aW9uIChmb3JtYXRTdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9mb3JtYXRTdHJpbmcgPSBmb3JtYXRTdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBlbmQgYSBuZXcgdG9rZW4gdG8gdGhlIGN1cnJlbnQgbGlzdCBvZiB0b2tlbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHRva2VuU3RyaW5nIFRoZSBzdHJpbmcgdGhhdCBtYWtlcyB1cCB0aGUgdG9rZW5cclxuICAgICAqIEBwYXJhbSB0b2tlbkFycmF5IFRoZSBleGlzdGluZyBhcnJheSBvZiB0b2tlbnNcclxuICAgICAqIEBwYXJhbSByYXcgKG9wdGlvbmFsKSBJZiB0cnVlLCBkb24ndCBwYXJzZSB0aGUgdG9rZW4gYnV0IGluc2VydCBpdCBhcyBpc1xyXG4gICAgICogQHJldHVybiBUb2tlbltdIFRoZSByZXN1bHRpbmcgYXJyYXkgb2YgdG9rZW5zLlxyXG4gICAgICovXHJcbiAgICBUb2tlbml6ZXIucHJvdG90eXBlLl9hcHBlbmRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlblN0cmluZywgdG9rZW5BcnJheSwgcmF3KSB7XHJcbiAgICAgICAgaWYgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgcmF3OiB0b2tlblN0cmluZyxcclxuICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoIXJhdykge1xyXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSA9IG1hcFN5bWJvbFRvVHlwZSh0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRva2VuQXJyYXkucHVzaCh0b2tlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b2tlbkFycmF5O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIGludGVybmFsIHN0cmluZyBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIHRva2Vucy5cclxuICAgICAqIEByZXR1cm4gVG9rZW5bXVxyXG4gICAgICovXHJcbiAgICBUb2tlbml6ZXIucHJvdG90eXBlLnBhcnNlVG9rZW5zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgY3VycmVudFRva2VuID0gXCJcIjtcclxuICAgICAgICB2YXIgcHJldmlvdXNDaGFyID0gXCJcIjtcclxuICAgICAgICB2YXIgcXVvdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mb3JtYXRTdHJpbmcubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDaGFyID0gdGhpcy5fZm9ybWF0U3RyaW5nW2ldO1xyXG4gICAgICAgICAgICAvLyBIYW5sZGUgZXNjYXBpbmcgYW5kIHF1b3RpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyID09PSBcIidcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFxdW90aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBlZCBhIHNpbmdsZSAnIGNoYXJhY3RlciB3aXRob3V0IHF1b3RpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IFwiJ1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwaW5nLCBhZGQgJyB0byB0aGUgdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3VycmVudCBjaGFyYWN0ZXIgaXMgcmVsZXZhbnQsIHNvIHNhdmUgaXQgZm9yIGluc3BlY3RpbmcgbmV4dCByb3VuZFxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgcXVvdGluZyA9ICFxdW90aW5nO1xyXG4gICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLy8gRmx1c2ggY3VycmVudCB0b2tlblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsICFxdW90aW5nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHF1b3RpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGFyZSByZXBlYXRpbmcgdGhlIHRva2VuIHdpdGggbW9yZSBjaGFyYWN0ZXJzXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERvbid0IGZvcmdldCB0byBhZGQgdGhlIGxhc3QgdG9rZW4gdG8gdGhlIHJlc3VsdCFcclxuICAgICAgICByZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgcXVvdGluZyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVG9rZW5pemVyO1xyXG59KCkpO1xyXG5leHBvcnRzLlRva2VuaXplciA9IFRva2VuaXplcjtcclxuLyoqXHJcbiAqIERpZmZlcmVudCB0eXBlcyBvZiB0b2tlbnMsIGVhY2ggZm9yIGEgRGF0ZVRpbWUgXCJwZXJpb2QgdHlwZVwiIChsaWtlIHllYXIsIG1vbnRoLCBob3VyIGV0Yy4pXHJcbiAqL1xyXG4oZnVuY3Rpb24gKERhdGVUaW1lVG9rZW5UeXBlKSB7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIklERU5USVRZXCJdID0gMF0gPSBcIklERU5USVRZXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkVSQVwiXSA9IDFdID0gXCJFUkFcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiWUVBUlwiXSA9IDJdID0gXCJZRUFSXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIlFVQVJURVJcIl0gPSAzXSA9IFwiUVVBUlRFUlwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJNT05USFwiXSA9IDRdID0gXCJNT05USFwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJXRUVLXCJdID0gNV0gPSBcIldFRUtcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiREFZXCJdID0gNl0gPSBcIkRBWVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJXRUVLREFZXCJdID0gN10gPSBcIldFRUtEQVlcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiREFZUEVSSU9EXCJdID0gOF0gPSBcIkRBWVBFUklPRFwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJIT1VSXCJdID0gOV0gPSBcIkhPVVJcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiTUlOVVRFXCJdID0gMTBdID0gXCJNSU5VVEVcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiU0VDT05EXCJdID0gMTFdID0gXCJTRUNPTkRcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiWk9ORVwiXSA9IDEyXSA9IFwiWk9ORVwiO1xyXG59KShleHBvcnRzLkRhdGVUaW1lVG9rZW5UeXBlIHx8IChleHBvcnRzLkRhdGVUaW1lVG9rZW5UeXBlID0ge30pKTtcclxudmFyIERhdGVUaW1lVG9rZW5UeXBlID0gZXhwb3J0cy5EYXRlVGltZVRva2VuVHlwZTtcclxudmFyIHN5bWJvbE1hcHBpbmcgPSB7XHJcbiAgICBcIkdcIjogRGF0ZVRpbWVUb2tlblR5cGUuRVJBLFxyXG4gICAgXCJ5XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcIllcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwidVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJVXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcInJcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwiUVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG4gICAgXCJxXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcbiAgICBcIk1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcbiAgICBcIkxcIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcbiAgICBcImxcIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcbiAgICBcIndcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuICAgIFwiV1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLLFxyXG4gICAgXCJkXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuICAgIFwiRFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcIkZcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG4gICAgXCJnXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuICAgIFwiRVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG4gICAgXCJlXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcbiAgICBcImNcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuICAgIFwiYVwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcbiAgICBcImhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwiSFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJrXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcIktcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwialwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJKXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcIm1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFLFxyXG4gICAgXCJzXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuICAgIFwiU1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcbiAgICBcIkFcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG4gICAgXCJ6XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIlpcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwiT1wiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJ2XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIlZcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwiWFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJ4XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkVcclxufTtcclxuLyoqXHJcbiAqIE1hcCB0aGUgZ2l2ZW4gc3ltYm9sIHRvIG9uZSBvZiB0aGUgRGF0ZVRpbWVUb2tlblR5cGVzXHJcbiAqIElmIHRoZXJlIGlzIG5vIG1hcHBpbmcsIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZIGlzIHVzZWRcclxuICpcclxuICogQHBhcmFtIHN5bWJvbCBUaGUgc2luZ2xlLWNoYXJhY3RlciBzeW1ib2wgdXNlZCB0byBtYXAgdGhlIHRva2VuXHJcbiAqIEByZXR1cm4gRGF0ZVRpbWVUb2tlblR5cGUgVGhlIFR5cGUgb2YgdG9rZW4gdGhpcyBzeW1ib2wgcmVwcmVzZW50c1xyXG4gKi9cclxuZnVuY3Rpb24gbWFwU3ltYm9sVG9UeXBlKHN5bWJvbCkge1xyXG4gICAgaWYgKHN5bWJvbE1hcHBpbmcuaGFzT3duUHJvcGVydHkoc3ltYm9sKSkge1xyXG4gICAgICAgIHJldHVybiBzeW1ib2xNYXBwaW5nW3N5bWJvbF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pZEc5clpXNHVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMM1J2YTJWdUxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN08wZEJTVWM3UVVGRlNDeFpRVUZaTEVOQlFVTTdRVUZGWWp0SlFVVkRPenM3VDBGSFJ6dEpRVU5JTEcxQ1FVRnZRaXhoUVVGelFqdFJRVUYwUWl4clFrRkJZU3hIUVVGaUxHRkJRV0VzUTBGQlV6dEpRVVV4UXl4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwZ3NiVU5CUVdVc1IwRkJaaXhWUVVGblFpeFpRVUZ2UWp0UlFVTnVReXhKUVVGSkxFTkJRVU1zWVVGQllTeEhRVUZITEZsQlFWa3NRMEZCUXp0SlFVTnVReXhEUVVGRE8wbEJSVVE3T3pzN096czdUMEZQUnp0SlFVTkxMR2REUVVGWkxFZEJRWEJDTEZWQlFYRkNMRmRCUVcxQ0xFVkJRVVVzVlVGQmJVSXNSVUZCUlN4SFFVRmhPMUZCUXpORkxFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NTMEZCU3l4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM2hDTEVsQlFVMHNTMEZCU3l4SFFVRlZPMmRDUVVOd1FpeE5RVUZOTEVWQlFVVXNWMEZCVnl4RFFVRkRMRTFCUVUwN1owSkJRekZDTEVkQlFVY3NSVUZCUlN4WFFVRlhPMmRDUVVOb1FpeE5RVUZOTEVWQlFVVXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGRFSXNTVUZCU1N4RlFVRkZMR2xDUVVGcFFpeERRVUZETEZGQlFWRTdZVUZEYUVNc1EwRkJRenRaUVVWR0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFZpeExRVUZMTEVOQlFVTXNTVUZCU1N4SFFVRkhMR1ZCUVdVc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZETlVNc1EwRkJRenRaUVVORUxGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1VVRkRlRUlzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNN1NVRkRia0lzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSUxDdENRVUZYTEVkQlFWZzdVVUZEUXl4SlFVRkpMRTFCUVUwc1IwRkJXU3hGUVVGRkxFTkJRVU03VVVGRmVrSXNTVUZCU1N4WlFVRlpMRWRCUVZjc1JVRkJSU3hEUVVGRE8xRkJRemxDTEVsQlFVa3NXVUZCV1N4SFFVRlhMRVZCUVVVc1EwRkJRenRSUVVNNVFpeEpRVUZKTEU5QlFVOHNSMEZCV1N4TFFVRkxMRU5CUVVNN1VVRkROMElzU1VGQlNTeG5Ra0ZCWjBJc1IwRkJXU3hMUVVGTExFTkJRVU03VVVGRmRFTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRPMWxCUTNCRUxFbEJRVTBzVjBGQlZ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRk1VTXNPRUpCUVRoQ08xbEJRemxDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRmRCUVZjc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjZRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMlFzUlVGQlJTeERRVUZETEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjBRaXdyUTBGQkswTTdkMEpCUXk5RExFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NTMEZCU3l4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU5zUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFpRVUZaTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN05FSkJRMnBFTEZsQlFWa3NSMEZCUnl4RlFVRkZMRU5CUVVNN2QwSkJRMjVDTEVOQlFVTTdkMEpCUTBRc1dVRkJXU3hKUVVGSkxFZEJRVWNzUTBGQlF6dDNRa0ZEY0VJc1owSkJRV2RDTEVkQlFVY3NTMEZCU3l4RFFVRkRPMjlDUVVNeFFpeERRVUZETzI5Q1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU5RTEdkQ1FVRm5RaXhIUVVGSExFbEJRVWtzUTBGQlF6dHZRa0ZEZWtJc1EwRkJRenRuUWtGRFJpeERRVUZETzJkQ1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yOUNRVU5RTERaRlFVRTJSVHR2UWtGRE4wVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOMFFpd3JRa0ZCSzBJN2QwSkJReTlDTEZsQlFWa3NTVUZCU1N4WFFVRlhMRU5CUVVNN2QwSkJRelZDTEdkQ1FVRm5RaXhIUVVGSExFdEJRVXNzUTBGQlF6dHZRa0ZETVVJc1EwRkJRenR2UWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRVQ3g1UkVGQmVVUTdkMEpCUTNwRUxHZENRVUZuUWl4SFFVRkhMRWxCUVVrc1EwRkJRenR2UWtGRGVrSXNRMEZCUXp0blFrRkZSaXhEUVVGRE8yZENRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOMlFpeHpSVUZCYzBVN2IwSkJRM1JGTEZsQlFWa3NSMEZCUnl4WFFVRlhMRU5CUVVNN1owSkJRelZDTEVOQlFVTTdaMEpCUTBRc1VVRkJVU3hEUVVGRE8xbEJRMVlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRemRDTEU5QlFVOHNSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJRenRuUWtGRGJrSXNaMEpCUVdkQ0xFZEJRVWNzUzBGQlN5eERRVUZETzJkQ1FVVjZRaXh6UWtGQmMwSTdaMEpCUTNSQ0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRmxCUVZrc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkRNMFFzV1VGQldTeEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTnVRaXhEUVVGRE8xbEJSVVFzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFlpeDNRMEZCZDBNN1owSkJRM2hETEZsQlFWa3NTVUZCU1N4WFFVRlhMRU5CUVVNN1owSkJRelZDTEZsQlFWa3NSMEZCUnl4WFFVRlhMRU5CUVVNN1owSkJRek5DTEZGQlFWRXNRMEZCUXp0WlFVTldMRU5CUVVNN1dVRkZSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJFTXNaME5CUVdkRE8yZENRVU5vUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFpRVUZaTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1owSkJRMnBFTEZsQlFWa3NSMEZCUnl4WFFVRlhMRU5CUVVNN1dVRkROVUlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxHdEVRVUZyUkR0blFrRkRiRVFzV1VGQldTeEpRVUZKTEZkQlFWY3NRMEZCUXp0WlFVTTNRaXhEUVVGRE8xbEJSVVFzV1VGQldTeEhRVUZITEZkQlFWY3NRMEZCUXp0UlFVTTFRaXhEUVVGRE8xRkJRMFFzYjBSQlFXOUVPMUZCUTNCRUxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRmxCUVZrc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdVVUZGTVVRc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF6dEpRVU5tTEVOQlFVTTdTVUZGUml4blFrRkJRenRCUVVGRUxFTkJRVU1zUVVFeFNFUXNTVUV3U0VNN1FVRXhTRmtzYVVKQlFWTXNXVUV3U0hKQ0xFTkJRVUU3UVVGRlJEczdSMEZGUnp0QlFVTklMRmRCUVZrc2FVSkJRV2xDTzBsQlF6VkNMR2xGUVVGUkxFTkJRVUU3U1VGRlVpeDFSRUZCUnl4RFFVRkJPMGxCUTBnc2VVUkJRVWtzUTBGQlFUdEpRVU5LTEN0RVFVRlBMRU5CUVVFN1NVRkRVQ3d5UkVGQlN5eERRVUZCTzBsQlEwd3NlVVJCUVVrc1EwRkJRVHRKUVVOS0xIVkVRVUZITEVOQlFVRTdTVUZEU0N3clJFRkJUeXhEUVVGQk8wbEJRMUFzYlVWQlFWTXNRMEZCUVR0SlFVTlVMSGxFUVVGSkxFTkJRVUU3U1VGRFNpdzRSRUZCVFN4RFFVRkJPMGxCUTA0c09FUkJRVTBzUTBGQlFUdEpRVU5PTERCRVFVRkpMRU5CUVVFN1FVRkRUQ3hEUVVGRExFVkJabGNzZVVKQlFXbENMRXRCUVdwQ0xIbENRVUZwUWl4UlFXVTFRanRCUVdaRUxFbEJRVmtzYVVKQlFXbENMRWRCUVdwQ0xIbENRV1ZZTEVOQlFVRTdRVUV5UWtRc1NVRkJUU3hoUVVGaExFZEJRVEJETzBsQlF6VkVMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SFFVRkhPMGxCUlRGQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlJUTkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4UFFVRlBPMGxCUXpsQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhQUVVGUE8wbEJSVGxDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eExRVUZMTzBsQlF6VkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4TFFVRkxPMGxCUXpWQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhMUVVGTE8wbEJSVFZDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUlROQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhIUVVGSE8wbEJRekZDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEhRVUZITzBsQlF6RkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SFFVRkhPMGxCUXpGQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhIUVVGSE8wbEJSVEZDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eFBRVUZQTzBsQlF6bENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4UFFVRlBPMGxCUXpsQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhQUVVGUE8wbEJSVGxDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eFRRVUZUTzBsQlJXaERMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlJUTkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4TlFVRk5PMGxCUlRkQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhOUVVGTk8wbEJRemRDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eE5RVUZOTzBsQlF6ZENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4TlFVRk5PMGxCUlRkQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wTkJRek5DTEVOQlFVTTdRVUZGUmpzN096czdPMGRCVFVjN1FVRkRTQ3g1UWtGQmVVSXNUVUZCWXp0SlFVTjBReXhGUVVGRkxFTkJRVU1zUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU14UXl4TlFVRk5MRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzBsQlF6bENMRU5CUVVNN1NVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU5RTEUxQlFVMHNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eFJRVUZSTEVOQlFVTTdTVUZEYmtNc1EwRkJRenRCUVVOR0xFTkJRVU1pZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbihmdW5jdGlvbiAoVG9UeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXHJcbiAgICAgKi9cclxuICAgIFRvVHlwZVtUb1R5cGVbXCJZZWFyXCJdID0gMF0gPSBcIlllYXJcIjtcclxuICAgIC8qKlxyXG4gICAgICogXCJtYXhcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiTWF4XCJdID0gMV0gPSBcIk1heFwiO1xyXG59KShleHBvcnRzLlRvVHlwZSB8fCAoZXhwb3J0cy5Ub1R5cGUgPSB7fSkpO1xyXG52YXIgVG9UeXBlID0gZXhwb3J0cy5Ub1R5cGU7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKE9uVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEYXktb2YtbW9udGggbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJEYXlOdW1cIl0gPSAwXSA9IFwiRGF5TnVtXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibGFzdFN1blwiIG9yIFwibGFzdFdlZFwiIGV0Y1xyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiTGFzdFhcIl0gPSAxXSA9IFwiTGFzdFhcIjtcclxuICAgIC8qKlxyXG4gICAgICogZS5nLiBcIlN1bj49OFwiXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJHcmVxWFwiXSA9IDJdID0gXCJHcmVxWFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBlLmcuIFwiU3VuPD04XCJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkxlcVhcIl0gPSAzXSA9IFwiTGVxWFwiO1xyXG59KShleHBvcnRzLk9uVHlwZSB8fCAoZXhwb3J0cy5PblR5cGUgPSB7fSkpO1xyXG52YXIgT25UeXBlID0gZXhwb3J0cy5PblR5cGU7XHJcbihmdW5jdGlvbiAoQXRUeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlN0YW5kYXJkXCJdID0gMF0gPSBcIlN0YW5kYXJkXCI7XHJcbiAgICAvKipcclxuICAgICAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIldhbGxcIl0gPSAxXSA9IFwiV2FsbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVdGMgdGltZVxyXG4gICAgICovXHJcbiAgICBBdFR5cGVbQXRUeXBlW1wiVXRjXCJdID0gMl0gPSBcIlV0Y1wiO1xyXG59KShleHBvcnRzLkF0VHlwZSB8fCAoZXhwb3J0cy5BdFR5cGUgPSB7fSkpO1xyXG52YXIgQXRUeXBlID0gZXhwb3J0cy5BdFR5cGU7XHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKi9cclxudmFyIFJ1bGVJbmZvID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJ1bGVJbmZvKFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxyXG4gICAgICAgICAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnJvbSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9UeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b1llYXIsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuICAgICAgICAgKi9cclxuICAgICAgICB0eXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcclxuICAgICAgICAgKi9cclxuICAgICAgICBpbk1vbnRoLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPTiBjb2x1bW4gdHlwZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uVHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkRheSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25XZWVrRGF5LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gaG91clxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0SG91ciwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIG1pbnV0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0TWludXRlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXRTZWNvbmQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFUIGNvbHVtbiB0eXBlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXRUeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcclxuICAgICAgICAgKi9cclxuICAgICAgICBzYXZlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXHJcbiAgICAgICAgICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvVHlwZSA9IHRvVHlwZTtcclxuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuaW5Nb250aCA9IGluTW9udGg7XHJcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XHJcbiAgICAgICAgdGhpcy5vbkRheSA9IG9uRGF5O1xyXG4gICAgICAgIHRoaXMub25XZWVrRGF5ID0gb25XZWVrRGF5O1xyXG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xyXG4gICAgICAgIHRoaXMuYXRNaW51dGUgPSBhdE1pbnV0ZTtcclxuICAgICAgICB0aGlzLmF0U2Vjb25kID0gYXRTZWNvbmQ7XHJcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XHJcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHJ1bGUgaXMgYXBwbGljYWJsZSBpbiB0aGUgeWVhclxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUuYXBwbGljYWJsZSA9IGZ1bmN0aW9uICh5ZWFyKSB7XHJcbiAgICAgICAgaWYgKHllYXIgPCB0aGlzLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLlllYXI6IHJldHVybiAoeWVhciA8PSB0aGlzLnRvWWVhcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU29ydCBjb21wYXJpc29uXHJcbiAgICAgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZUxlc3MgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5mcm9tIDwgb3RoZXIuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA+IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNvcnQgY29tcGFyaXNvblxyXG4gICAgICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgZXF1YWwgdG8gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZUVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggIT09IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pLmVxdWFscyhvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuICAgICAqIGlzIE5PVCBhZGp1c3RlZCBmb3Igd2FsbCBjbG9jayB0aW1lIG9yIHN0YW5kYXJkIHRpbWUsIGkuZS4gdGhpcy5hdFR5cGUgaXNcclxuICAgICAqIG5vdCB0YWtlbiBpbnRvIGFjY291bnRcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZURhdGUgPSBmdW5jdGlvbiAoeWVhcikge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gXCIgKyB5ZWFyLnRvU3RyaW5nKDEwKSk7XHJcbiAgICAgICAgLy8geWVhciBhbmQgbW9udGggYXJlIGdpdmVuXHJcbiAgICAgICAgdmFyIHRtID0geyB5ZWFyOiB5ZWFyLCBtb250aDogdGhpcy5pbk1vbnRoIH07XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGRheVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5vblR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IHRoaXMub25EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGFzdFg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjYWxjdWxhdGUgdGltZVxyXG4gICAgICAgIHRtLmhvdXIgPSB0aGlzLmF0SG91cjtcclxuICAgICAgICB0bS5taW51dGUgPSB0aGlzLmF0TWludXRlO1xyXG4gICAgICAgIHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRtKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zaXRpb24gbW9tZW50IGluIFVUQyBpbiB0aGUgZ2l2ZW4geWVhclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFRoZSBzdGFuZGFyZCBvZmZzZXQgZm9yIHRoZSB0aW1lem9uZSB3aXRob3V0IERTVFxyXG4gICAgICogQHBhcmFtIHByZXZSdWxlXHRUaGUgcHJldmlvdXMgcnVsZVxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUudHJhbnNpdGlvblRpbWVVdGMgPSBmdW5jdGlvbiAoeWVhciwgc3RhbmRhcmRPZmZzZXQsIHByZXZSdWxlKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBub3QgYXBwbGljYWJsZSBpbiBnaXZlbiB5ZWFyXCIpO1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgLy8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuICAgICAgICB2YXIgb2Zmc2V0O1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBBdFR5cGUuVXRjOlxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDpcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldlJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldC5hZGQocHJldlJ1bGUuc2F2ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIEF0VHlwZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuaXhNaWxsaXMgLSBvZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJ1bGVJbmZvO1xyXG59KCkpO1xyXG5leHBvcnRzLlJ1bGVJbmZvID0gUnVsZUluZm87XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJlZmVyZW5jZSBmcm9tIHpvbmUgdG8gcnVsZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBObyBydWxlIGFwcGxpZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xyXG59KShleHBvcnRzLlJ1bGVUeXBlIHx8IChleHBvcnRzLlJ1bGVUeXBlID0ge30pKTtcclxudmFyIFJ1bGVUeXBlID0gZXhwb3J0cy5SdWxlVHlwZTtcclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cclxuICogYmUgYSBzaW5nbGUgcmVjb3JkIHdpdGggemVybyBvciBtb3JlIGNvbnRpbnVhdGlvbiBsaW5lcy4gVGh1cywgdGhlIGtleXdvcmQsIOKAnFpvbmUs4oCdIGFuZCB0aGUgem9uZSBuYW1lIGFyZSBub3QgcmVwZWF0ZWQuXHJcbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cclxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXHJcbiAqIFRoZSBzdGF0ZSBleGlzdHMgZnJvbSB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgcHJldmlvdXMgbGluZeKAmXMgW1VOVElMXSBjb2x1bW4gdXAgdG8gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIGN1cnJlbnQgbGluZeKAmXNcclxuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxyXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXHJcbiAqIFRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIGxhc3QgbGluZSwgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbiwgY29udGludWVzIHRvIHRoZSBwcmVzZW50LlxyXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXHJcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxyXG4gKiAyNCBob3VyczsgdGhpcyBjb3JyZXNwb25kcyB0byBhIG1vdmVtZW50IG9mIHRoZSBEYXRlIExpbmUuIEZvciBleGFtcGxlOlxyXG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXHJcbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XHJcbiAqIFx0XHRcdCAtODo1Nzo0MSAtXHRMTVRcdC4uLlxyXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxyXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXHJcbiAqIHJlbGlnaW91cyByZWFzb25zLCB3YXMgZm9sbG93ZWQgYnkgYSBzZWNvbmQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgZGF5IHdpdGggYSBkaWZmZXJlbnQgbmFtZSwgMTggT2N0b2JlciBpbiB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxyXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cclxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XHJcbiAqIHVzZWQgZHVyaW5nIHRoZSBwZXJpb2QuIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWUgaXMgYWxtb3N0IGNlcnRhaW5seSB3cm9uZyBleGNlcHQgaW4gdGhlIGFyY2hldHlwYWwgcGxhY2UgYWZ0ZXIgd2hpY2ggdGhlIHpvbmUgaXMgbmFtZWQuXHJcbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcclxuICovXHJcbnZhciBab25lSW5mbyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBab25lSW5mbyhcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXHJcbiAgICAgICAgICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXHJcbiAgICAgICAgICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ210b2ZmLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XHJcbiAgICAgICAgICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcbiAgICAgICAgICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cclxuICAgICAgICAgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcclxuICAgICAgICAgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcnVsZVR5cGUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVPZmZzZXQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcnVsZU5hbWUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XHJcbiAgICAgICAgICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcbiAgICAgICAgICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxyXG4gICAgICAgICAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAgICAgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuICAgICAgICAgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9ybWF0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXHJcbiAgICAgICAgICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuICAgICAgICAgKiBOb3RlIHRoaXMgdmFsdWUgY2FuIGJlIE5VTEwgKGZvciB0aGUgZmlyc3QgcnVsZSlcclxuICAgICAgICAgKi9cclxuICAgICAgICB1bnRpbCkge1xyXG4gICAgICAgIHRoaXMuZ210b2ZmID0gZ210b2ZmO1xyXG4gICAgICAgIHRoaXMucnVsZVR5cGUgPSBydWxlVHlwZTtcclxuICAgICAgICB0aGlzLnJ1bGVPZmZzZXQgPSBydWxlT2Zmc2V0O1xyXG4gICAgICAgIHRoaXMucnVsZU5hbWUgPSBydWxlTmFtZTtcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcclxuICAgICAgICB0aGlzLnVudGlsID0gdW50aWw7XHJcbiAgICAgICAgaWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG4gICAgICAgICAgICB0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFpvbmVJbmZvO1xyXG59KCkpO1xyXG5leHBvcnRzLlpvbmVJbmZvID0gWm9uZUluZm87XHJcbnZhciBUek1vbnRoTmFtZXM7XHJcbihmdW5jdGlvbiAoVHpNb250aE5hbWVzKSB7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSmFuXCJdID0gMV0gPSBcIkphblwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkZlYlwiXSA9IDJdID0gXCJGZWJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXJcIl0gPSAzXSA9IFwiTWFyXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiQXByXCJdID0gNF0gPSBcIkFwclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk1heVwiXSA9IDVdID0gXCJNYXlcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJKdW5cIl0gPSA2XSA9IFwiSnVuXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVsXCJdID0gN10gPSBcIkp1bFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkF1Z1wiXSA9IDhdID0gXCJBdWdcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJTZXBcIl0gPSA5XSA9IFwiU2VwXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiT2N0XCJdID0gMTBdID0gXCJPY3RcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJOb3ZcIl0gPSAxMV0gPSBcIk5vdlwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkRlY1wiXSA9IDEyXSA9IFwiRGVjXCI7XHJcbn0pKFR6TW9udGhOYW1lcyB8fCAoVHpNb250aE5hbWVzID0ge30pKTtcclxuZnVuY3Rpb24gbW9udGhOYW1lVG9TdHJpbmcobmFtZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMTI7ICsraSkge1xyXG4gICAgICAgIGlmIChUek1vbnRoTmFtZXNbaV0gPT09IG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgaWYgKHRydWUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuICAgIH1cclxufVxyXG52YXIgVHpEYXlOYW1lcztcclxuKGZ1bmN0aW9uIChUekRheU5hbWVzKSB7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTdW5cIl0gPSAwXSA9IFwiU3VuXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJNb25cIl0gPSAxXSA9IFwiTW9uXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUdWVcIl0gPSAyXSA9IFwiVHVlXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJXZWRcIl0gPSAzXSA9IFwiV2VkXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUaHVcIl0gPSA0XSA9IFwiVGh1XCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJGcmlcIl0gPSA1XSA9IFwiRnJpXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTYXRcIl0gPSA2XSA9IFwiU2F0XCI7XHJcbn0pKFR6RGF5TmFtZXMgfHwgKFR6RGF5TmFtZXMgPSB7fSkpO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcocykge1xyXG4gICAgcmV0dXJuIC9eKFxcLXxcXCspPyhbMC05XSsoKFxcOlswLTldKyk/KFxcOlswLTldKyhcXC5bMC05XSspPyk/KSkkLy50ZXN0KHMpO1xyXG59XHJcbmV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGlzVmFsaWRPZmZzZXRTdHJpbmc7XHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcclxuICovXHJcbnZhciBUcmFuc2l0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRyYW5zaXRpb24oXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJhbnNpdGlvbiB0aW1lIGluIFVUQyBtaWxsaXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb2Zmc2V0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBOZXcgdGltem9uZSBhYmJyZXZpYXRpb24gbGV0dGVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5hdCA9IGF0O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMubGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIGlmICh0aGlzLm9mZnNldCkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBUcmFuc2l0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLlRyYW5zaXRpb24gPSBUcmFuc2l0aW9uO1xyXG4vKipcclxuICogT3B0aW9uIGZvciBUekRhdGFiYXNlI25vcm1hbGl6ZUxvY2FsKClcclxuICovXHJcbihmdW5jdGlvbiAoTm9ybWFsaXplT3B0aW9uKSB7XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJVcFwiXSA9IDBdID0gXCJVcFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxufSkoZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gfHwgKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uID0ge30pKTtcclxudmFyIE5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uO1xyXG4vKipcclxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxyXG4gKiBZb3UgdXN1YWxseSBkbyBub3QgbmVlZCB0byB1c2UgdGhpcyBkaXJlY3RseSwgdXNlIFRpbWVab25lIGFuZCBEYXRlVGltZSBpbnN0ZWFkLlxyXG4gKi9cclxudmFyIFR6RGF0YWJhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciAtIGRvIG5vdCB1c2UsIHRoaXMgaXMgYSBzaW5nbGV0b24gY2xhc3MuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKCkgaW5zdGVhZFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUekRhdGFiYXNlKGRhdGEpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl96b25lSW5mb0NhY2hlID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3J1bGVJbmZvQ2FjaGUgPSB7fTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChkYXRhLmxlbmd0aCA+IDAsIFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIik7XHJcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZC5ydWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBPYmplY3Qua2V5cyhkLnpvbmVzKTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jW19iXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXHJcbiAgICAgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLmluc3RhbmNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5pbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIVR6RGF0YWJhc2UuX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhXzEgPSBbXTtcclxuICAgICAgICAgICAgLy8gdHJ5IHRvIGZpbmQgVFogZGF0YSBpbiBnbG9iYWwgdmFyaWFibGVzXHJcbiAgICAgICAgICAgIHZhciBnID0gKGdsb2JhbCA/IGdsb2JhbCA6IHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGlmIChnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCJ0emRhdGFcIikgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZ1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG4gICAgICAgICAgICB2YXIgZmluZE5vZGVNb2R1bGVzID0gZnVuY3Rpb24gKHJlcXVpcmUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHRyeSBzdWJzZXRzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZHVsZU5hbWVzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hZnJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYW50YXJjdGljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldGNldGVyYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldXJvcGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXBhY2lmaWNuZXdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXN5c3RlbXZcIlxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nUGF0aHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUobW9kdWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhXzEucHVzaChkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChkYXRhXzEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoZGF0YV8xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFR6RGF0YWJhc2UuX2luc3RhbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG4gICAgICAgICAgICB0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5leGlzdHMgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNaW5pbXVtIG5vbi16ZXJvIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuICAgICAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cclxuICAgICAqXHJcbiAgICAgKiBEb2VzIHJldHVybiB6ZXJvIGlmIGEgem9uZU5hbWUgaXMgZ2l2ZW4gYW5kIHRoZXJlIGlzIG5vIERTVCBhdCBhbGwgZm9yIHRoZSB6b25lLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWluRHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVPZmZzZXQubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5tYXhEc3RTYXZlID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgaWYgKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgcnVsZU5hbWVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSB0ZW1wW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuaGFzRHN0ID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5uZXh0RHN0Q2hhbmdlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhKSB7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvO1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuICAgICAgICAvLyBnZXQgYWxsIHpvbmUgaW5mb3MgZm9yIFtkYXRlLCBkYXRlKzF5ZWFyKVxyXG4gICAgICAgIHZhciBhbGxab25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgdmFyIHJlbGV2YW50Wm9uZUluZm9zID0gW107XHJcbiAgICAgICAgdmFyIHJhbmdlU3RhcnQgPSB1dGNUaW1lLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgdmFyIHJhbmdlRW5kID0gcmFuZ2VTdGFydCArIDM2NSAqIDg2NDAwRTM7XHJcbiAgICAgICAgdmFyIHByZXZFbmQgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsWm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHpvbmVJbmZvID0gYWxsWm9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICBpZiAoKHByZXZFbmQgPT09IG51bGwgfHwgcHJldkVuZCA8IHJhbmdlRW5kKSAmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmVsZXZhbnRab25lSW5mb3MucHVzaCh6b25lSW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldkVuZCA9IHpvbmVJbmZvLnVudGlsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWxldmFudFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB6b25lSW5mbyA9IHJlbGV2YW50Wm9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyICsgMSwgem9uZUluZm8uZ210b2ZmKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyYW5zaXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxyXG4gICAgICAgIHZhciBwcmV2U2F2ZSA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCA+IHV0Y1RpbWUudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZTYXZlID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cclxuICAgICAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxyXG4gICAgICogXCJVVENcIiwgXCJHTVRcIiwgXCJFdGMvR01UXCIgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuem9uZUlzVXRjID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG4gICAgfTtcclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5vcm1hbGl6ZUxvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhLCBvcHQpIHtcclxuICAgICAgICBpZiAob3B0ID09PSB2b2lkIDApIHsgb3B0ID0gTm9ybWFsaXplT3B0aW9uLlVwOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuICAgICAgICAgICAgLy8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICAvLyBnZXQgYWxsIHRyYW5zaXRpb25zIChub3RlIHRoaXMgaW5jbHVkZXMgZmFrZSB0cmFuc2l0aW9uIHJ1bGVzIGZvciB6b25lIG9mZnNldCBjaGFuZ2VzKVxyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDEpO1xyXG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xyXG4gICAgICAgICAgICB2YXIgcHJldiA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICAvLyBmb3J3YXJkIHRyYW5zaXRpb24/XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYWxCZWZvcmUgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYWxBZnRlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxUaW1lLnVuaXhNaWxsaXMgPj0gbG9jYWxCZWZvcmUgJiYgbG9jYWxUaW1lLnVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub24tZXhpc3RpbmcgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFjdG9yID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG4gICAgICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB6b25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG4gICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcbiAgICAgKiB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICB2YXIgZHN0T2Zmc2V0ID0gbnVsbDtcclxuICAgICAgICBzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XHJcbiAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB0aGlzLmRzdE9mZnNldEZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuICAgICAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XHJcbiAgICAgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmFiYnJldmlhdGlvbiA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICB2YXIgZm9ybWF0ID0gem9uZUluZm8uZm9ybWF0O1xyXG4gICAgICAgIC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG4gICAgICAgIGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxyXG4gICAgICAgICAgICAmJiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGxldHRlciA9IHZvaWQgMDtcclxuICAgICAgICAgICAgLy8gcGxhY2UgaW4gZm9ybWF0IHN0cmluZ1xyXG4gICAgICAgICAgICBpZiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0aGlzLmxldHRlckZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUsIHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3JtYXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBleGNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuICAgICAqXHJcbiAgICAgKiBJZiB0aGUgbG9jYWwgdGltZXN0YW1wIGV4aXN0cyB0d2ljZSAoYXMgY2FuIG9jY3VyIHZlcnkgcmFyZWx5IGR1ZSB0byB6b25lIGNoYW5nZXMpXHJcbiAgICAgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG4gICAgICpcclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0TG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGxvY2FsVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBsb2NhbFRpbWUgOiBsb2NhbFRpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCArIHpvbmVJbmZvLmdtdG9mZi5taWxsaXNlY29uZHMoKSA+IHVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXHJcbiAgICAgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcbiAgICAgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0TG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGxvY2FsVGltZSkge1xyXG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XHJcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRUbSA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcclxuICAgICAgICAvLy8gTm90ZTogZHVyaW5nIG9mZnNldCBjaGFuZ2VzLCBsb2NhbCB0aW1lIGNhbiBiZWhhdmUgbGlrZTpcclxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG4gICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcbiAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxyXG4gICAgICAgIC8vIFRoZXJlZm9yZSBiaW5hcnkgc2VhcmNoIGRvZXMgbm90IGFwcGx5LiBMaW5lYXIgc2VhcmNoIHRocm91Z2ggdHJhbnNpdGlvbnNcclxuICAgICAgICAvLyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBvZmZzZXQgdGhhdCBtYXRjaGVzXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxKTtcclxuICAgICAgICB2YXIgcHJldiA9IG51bGw7XHJcbiAgICAgICAgdmFyIHByZXZQcmV2ID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgPiBub3JtYWxpemVkVG0udW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgLy8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2UHJldiA9IHByZXY7XHJcbiAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG4gICAgICAgIGlmIChwcmV2KSB7XHJcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FyZSBkdXJpbmcgYmFja3dhcmQgY2hhbmdlOiB0YWtlIGZpcnN0IG9jY3VycmVuY2Ugb2YgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICBpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICYmIG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldlByZXYub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aGlzIGNhbm5vdCBoYXBwZW4gYXMgdGhlIHRyYW5zaXRpb25zIGFycmF5IGlzIGd1YXJhbnRlZWQgdG8gY29udGFpbiBhIHRyYW5zaXRpb24gYXQgdGhlXHJcbiAgICAgICAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXHJcbiAgICAgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcFxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZHN0T2Zmc2V0Rm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIG9mZnNldCA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIW9mZnNldCkge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgb2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXHJcbiAgICAgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5sZXR0ZXJGb3JSdWxlID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCB1dGNUaW1lLCBzdGFuZGFyZE9mZnNldCkge1xyXG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcbiAgICAgICAgLy8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0KTtcclxuICAgICAgICAvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuICAgICAgICB2YXIgbGV0dGVyID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIWxldHRlcikge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxldHRlcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGxpc3Qgb2YgYWxsIHRyYW5zaXRpb25zIGluIFtmcm9tWWVhci4udG9ZZWFyXSBzb3J0ZWQgYnkgZWZmZWN0aXZlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMgPSBmdW5jdGlvbiAocnVsZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcbiAgICAgICAgdmFyIHJ1bGVJbmZvcyA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2SW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZUluZm9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBydWxlSW5mb3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHksIHN0YW5kYXJkT2Zmc2V0LCBwcmV2SW5mbyksIHJ1bGVJbmZvLnNhdmUsIHJ1bGVJbmZvLmxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJldkluZm8gPSBydWxlSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxyXG4gICAgICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuICAgICAgICB2YXIgc3RhcnRNaWxsaXMgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiBmcm9tWWVhciB9KTtcclxuICAgICAgICB2YXIgZW5kTWlsbGlzID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwiRW1wdHkgem9uZUluZm9zIGFycmF5IHJldHVybmVkIGZyb20gZ2V0Wm9uZUluZm9zKClcIik7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBwcmV2Wm9uZSA9IG51bGw7XHJcbiAgICAgICAgdmFyIHByZXZVbnRpbFllYXI7XHJcbiAgICAgICAgdmFyIHByZXZTdGRPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgIHZhciBwcmV2RHN0T2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB2YXIgcHJldkxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICB2YXIgdW50aWxZZWFyID0gem9uZUluZm8udW50aWwgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkuY29tcG9uZW50cy55ZWFyIDogdG9ZZWFyICsgMTtcclxuICAgICAgICAgICAgdmFyIHN0ZE9mZnNldCA9IHByZXZTdGRPZmZzZXQ7XHJcbiAgICAgICAgICAgIHZhciBkc3RPZmZzZXQgPSBwcmV2RHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICB2YXIgbGV0dGVyID0gcHJldkxldHRlcjtcclxuICAgICAgICAgICAgLy8gem9uZSBhcHBsaWNhYmxlP1xyXG4gICAgICAgICAgICBpZiAoKHByZXZab25lID09PSBudWxsIHx8IHByZXZab25lLnVudGlsIDwgZW5kTWlsbGlzIC0gMSlcclxuICAgICAgICAgICAgICAgICYmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+PSBzdGFydE1pbGxpcykpIHtcclxuICAgICAgICAgICAgICAgIHN0ZE9mZnNldCA9IHpvbmVJbmZvLmdtdG9mZjtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBmaXJzdCBydWxlIHRha2VzIGVmZmVjdCBpbW1lZGlhdGVseSBvbiB0aGUgem9uZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIChlLmcuIEx5YmlhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mb3MgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGVJbmZvcy5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc1tqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxZZWFyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMocHJldlVudGlsWWVhciwgc3RkT2Zmc2V0LCBudWxsKSA9PT0gcHJldlpvbmUudW50aWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSB0cmFuc2l0aW9uIGZvciB0aGUgem9uZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgYXQgPSAocHJldlpvbmUgPyBwcmV2Wm9uZS51bnRpbCA6IHN0YXJ0TWlsbGlzKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgLy8gYWRkIHRyYW5zaXRpb25zIGZvciB0aGUgem9uZSBydWxlcyBpbiB0aGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHN0VHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgcHJldlVudGlsWWVhciAhPT0gdW5kZWZpbmVkID8gTWF0aC5tYXgocHJldlVudGlsWWVhciwgZnJvbVllYXIpIDogZnJvbVllYXIsIE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSwgc3RkT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGRzdFRyYW5zaXRpb25zLmxlbmd0aDsgKytrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gZHN0VHJhbnNpdGlvbnNba107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2Wm9uZSA9IHpvbmVJbmZvO1xyXG4gICAgICAgICAgICBwcmV2VW50aWxZZWFyID0gdW50aWxZZWFyO1xyXG4gICAgICAgICAgICBwcmV2U3RkT2Zmc2V0ID0gc3RkT2Zmc2V0O1xyXG4gICAgICAgICAgICBwcmV2RHN0T2Zmc2V0ID0gZHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICBwcmV2TGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxyXG4gICAgICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyB1dGNUaW1lIDogdXRjVGltZS51bml4TWlsbGlzKTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgem9uZSByZWNvcmRzIGZvciBhIGdpdmVuIHpvbmUgbmFtZSwgYWZ0ZXJcclxuICAgICAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZSBsaWtlIFwiUGFjaWZpYy9FZmF0ZVwiXHJcbiAgICAgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvcyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUYWtlIGZyb20gY2FjaGVcclxuICAgICAgICBpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmFsIHpvbmUgaW5mbyBmb3VuZFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUVudHJpZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuICAgICAgICAgICAgdmFyIHVudGlsID0gbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbM10pO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odW50aWwpKSB7XHJcbiAgICAgICAgICAgICAgICB1bnRpbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFpvbmVJbmZvKGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygtMSAqIG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzBdKSksIHJ1bGVUeXBlLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0ID8gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oem9uZUVudHJ5WzFdKSA6IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKCksIHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsIHpvbmVFbnRyeVsyXSwgdW50aWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgLy8gc29ydCBudWxsIGxhc3RcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhLnVudGlsICE9PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gbnVsbCAmJiBiLnVudGlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKGEudW50aWwgLSBiLnVudGlsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXSA9IHJlc3VsdDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcnVsZSBzZXQgd2l0aCB0aGUgZ2l2ZW4gcnVsZSBuYW1lLFxyXG4gICAgICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHJ1bGUgc2V0XHJcbiAgICAgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcclxuICAgICAgICAvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuICAgICAgICBpZiAoIXRoaXMuX2RhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJldHVybiBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlU2V0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlID0gcnVsZVNldFtpXTtcclxuICAgICAgICAgICAgdmFyIGZyb21ZZWFyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xyXG4gICAgICAgICAgICB2YXIgdG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuICAgICAgICAgICAgdmFyIHRvWWVhciA9ICh0b1R5cGUgPT09IFRvVHlwZS5NYXggPyAwIDogKHJ1bGVbMV0gPT09IFwib25seVwiID8gZnJvbVllYXIgOiBwYXJzZUludChydWxlWzFdLCAxMCkpKTtcclxuICAgICAgICAgICAgdmFyIG9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XHJcbiAgICAgICAgICAgIHZhciBvbkRheSA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG4gICAgICAgICAgICB2YXIgb25XZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcclxuICAgICAgICAgICAgdmFyIG1vbnRoTmFtZSA9IHJ1bGVbM107XHJcbiAgICAgICAgICAgIHZhciBtb250aE51bWJlciA9IG1vbnRoTmFtZVRvU3RyaW5nKG1vbnRoTmFtZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhmcm9tWWVhciwgdG9UeXBlLCB0b1llYXIsIHJ1bGVbMl0sIG1vbnRoTnVtYmVyLCBvblR5cGUsIG9uRGF5LCBvbldlZWtEYXksIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxyXG4gICAgICAgICAgICBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLCB0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLCBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSwgcnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxyXG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlUnVsZVR5cGUgPSBmdW5jdGlvbiAocnVsZSkge1xyXG4gICAgICAgIGlmIChydWxlID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuTm9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuT2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xyXG4gICAgICAgIGlmICh0byA9PT0gXCJtYXhcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLk1heDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodG8gPT09IFwib25seVwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFpc05hTihwYXJzZUludCh0bywgMTApKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLlllYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6IFwiICsgdG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25UeXBlID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgaWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxhc3RYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPblR5cGUuR3JlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25EYXkgPSBmdW5jdGlvbiAob24sIG9uVHlwZSkge1xyXG4gICAgICAgIHN3aXRjaCAob25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VPbldlZWtEYXkgPSBmdW5jdGlvbiAob24pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2ljc18xLldlZWtEYXkuU3VuZGF5O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZUF0VHlwZSA9IGZ1bmN0aW9uIChhdCkge1xyXG4gICAgICAgIHN3aXRjaCAoYXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNcIjogcmV0dXJuIEF0VHlwZS5TdGFuZGFyZDtcclxuICAgICAgICAgICAgY2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwielwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBudWxsOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW5nbGUgaW5zdGFuY2UgbWVtYmVyXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbnVsbDtcclxuICAgIHJldHVybiBUekRhdGFiYXNlO1xyXG59KCkpO1xyXG5leHBvcnRzLlR6RGF0YWJhc2UgPSBUekRhdGFiYXNlO1xyXG4vKipcclxuICogU2FuaXR5IGNoZWNrIG9uIGRhdGEuIFJldHVybnMgbWluL21heCB2YWx1ZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YSkge1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICBtaW5Ec3RTYXZlOiBudWxsLFxyXG4gICAgICAgIG1heERzdFNhdmU6IG51bGwsXHJcbiAgICAgICAgbWluR210T2ZmOiBudWxsLFxyXG4gICAgICAgIG1heEdtdE9mZjogbnVsbFxyXG4gICAgfTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgaWYgKHR5cGVvZiAoZGF0YSkgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcbiAgICB9XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gcnVsZXMgcHJvcGVydHlcIik7XHJcbiAgICB9XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gem9uZXMgcHJvcGVydHlcIik7XHJcbiAgICB9XHJcbiAgICAvLyB2YWxpZGF0ZSB6b25lc1xyXG4gICAgZm9yICh2YXIgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xyXG4gICAgICAgIGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUFyciA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgLy8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFycikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyB6b25lQXJyICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5Lmxlbmd0aCAhPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaGFzIGxlbmd0aCAhPSA0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzBdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4R210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IG51bGwgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHZhbGlkYXRlIHJ1bGVzXHJcbiAgICBmb3IgKHZhciBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XHJcbiAgICAgICAgaWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlQXJyID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZUFycltpXTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqICE9PSA1ICYmIHR5cGVvZiBydWxlW2pdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlWzVdWzNdICE9PSBcImdcIiAmJiBydWxlWzVdWzNdICE9PSBcInVcIiAmJiBydWxlWzVdWzNdICE9PSBcInpcIiAmJiBydWxlWzVdWzNdICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBzYXZlID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gbnVsbCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5taW5Ec3RTYXZlID0gc2F2ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRIb3RaR0YwWVdKaGMyVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMM1I2TFdSaGRHRmlZWE5sTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPenM3T3pzN1IwRk5SenRCUVVWSUxGbEJRVmtzUTBGQlF6dEJRVVZpTEhWQ1FVRnRRaXhWUVVGVkxFTkJRVU1zUTBGQlFUdEJRVU01UWl4MVFrRkJhVVVzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZETlVVc1NVRkJXU3hOUVVGTkxGZEJRVTBzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZEYmtNc2VVSkJRWGxDTEZsQlFWa3NRMEZCUXl4RFFVRkJPMEZCUTNSRExFbEJRVmtzU1VGQlNTeFhRVUZOTEZGQlFWRXNRMEZCUXl4RFFVRkJPMEZCUnk5Q096dEhRVVZITzBGQlEwZ3NWMEZCV1N4TlFVRk5PMGxCUTJwQ096dFBRVVZITzBsQlEwZ3NiVU5CUVVrc1EwRkJRVHRKUVVOS096dFBRVVZITzBsQlEwZ3NhVU5CUVVjc1EwRkJRVHRCUVVOS0xFTkJRVU1zUlVGVVZ5eGpRVUZOTEV0QlFVNHNZMEZCVFN4UlFWTnFRanRCUVZSRUxFbEJRVmtzVFVGQlRTeEhRVUZPTEdOQlUxZ3NRMEZCUVR0QlFVVkVPenRIUVVWSE8wRkJRMGdzVjBGQldTeE5RVUZOTzBsQlEycENPenRQUVVWSE8wbEJRMGdzZFVOQlFVMHNRMEZCUVR0SlFVTk9PenRQUVVWSE8wbEJRMGdzY1VOQlFVc3NRMEZCUVR0SlFVTk1PenRQUVVWSE8wbEJRMGdzY1VOQlFVc3NRMEZCUVR0SlFVTk1PenRQUVVWSE8wbEJRMGdzYlVOQlFVa3NRMEZCUVR0QlFVTk1MRU5CUVVNc1JVRnFRbGNzWTBGQlRTeExRVUZPTEdOQlFVMHNVVUZwUW1wQ08wRkJha0pFTEVsQlFWa3NUVUZCVFN4SFFVRk9MR05CYVVKWUxFTkJRVUU3UVVGRlJDeFhRVUZaTEUxQlFVMDdTVUZEYWtJN08wOUJSVWM3U1VGRFNDd3lRMEZCVVN4RFFVRkJPMGxCUTFJN08wOUJSVWM3U1VGRFNDeHRRMEZCU1N4RFFVRkJPMGxCUTBvN08wOUJSVWM3U1VGRFNDeHBRMEZCUnl4RFFVRkJPMEZCUTBvc1EwRkJReXhGUVdKWExHTkJRVTBzUzBGQlRpeGpRVUZOTEZGQllXcENPMEZCWWtRc1NVRkJXU3hOUVVGTkxFZEJRVTRzWTBGaFdDeERRVUZCTzBGQlJVUTdPenM3UjBGSlJ6dEJRVU5JTzBsQlJVTTdVVUZEUXpzN08xZEJSMGM3VVVGRFNTeEpRVUZaTzFGQlEyNUNPenRYUVVWSE8xRkJRMGtzVFVGQll6dFJRVU55UWpzN1YwRkZSenRSUVVOSkxFMUJRV003VVVGRGNrSTdPMWRCUlVjN1VVRkRTU3hKUVVGWk8xRkJRMjVDT3p0WFFVVkhPMUZCUTBrc1QwRkJaVHRSUVVOMFFqczdWMEZGUnp0UlFVTkpMRTFCUVdNN1VVRkRja0k3TzFkQlJVYzdVVUZEU1N4TFFVRmhPMUZCUTNCQ096dFhRVVZITzFGQlEwa3NVMEZCYTBJN1VVRkRla0k3TzFkQlJVYzdVVUZEU1N4TlFVRmpPMUZCUTNKQ096dFhRVVZITzFGQlEwa3NVVUZCWjBJN1VVRkRka0k3TzFkQlJVYzdVVUZEU1N4UlFVRm5RanRSUVVOMlFqczdWMEZGUnp0UlFVTkpMRTFCUVdNN1VVRkRja0k3TzFkQlJVYzdVVUZEU1N4SlFVRmpPMUZCUTNKQ096czdWMEZIUnp0UlFVTkpMRTFCUVdNN1VVRnlSR1FzVTBGQlNTeEhRVUZLTEVsQlFVa3NRMEZCVVR0UlFVbGFMRmRCUVUwc1IwRkJUaXhOUVVGTkxFTkJRVkU3VVVGSlpDeFhRVUZOTEVkQlFVNHNUVUZCVFN4RFFVRlJPMUZCU1dRc1UwRkJTU3hIUVVGS0xFbEJRVWtzUTBGQlVUdFJRVWxhTEZsQlFVOHNSMEZCVUN4UFFVRlBMRU5CUVZFN1VVRkpaaXhYUVVGTkxFZEJRVTRzVFVGQlRTeERRVUZSTzFGQlNXUXNWVUZCU3l4SFFVRk1MRXRCUVVzc1EwRkJVVHRSUVVsaUxHTkJRVk1zUjBGQlZDeFRRVUZUTEVOQlFWTTdVVUZKYkVJc1YwRkJUU3hIUVVGT0xFMUJRVTBzUTBGQlVUdFJRVWxrTEdGQlFWRXNSMEZCVWl4UlFVRlJMRU5CUVZFN1VVRkphRUlzWVVGQlVTeEhRVUZTTEZGQlFWRXNRMEZCVVR0UlFVbG9RaXhYUVVGTkxFZEJRVTRzVFVGQlRTeERRVUZSTzFGQlNXUXNVMEZCU1N4SFFVRktMRWxCUVVrc1EwRkJWVHRSUVV0a0xGZEJRVTBzUjBGQlRpeE5RVUZOTEVOQlFWRTdVVUZIY2tJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExHbENRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRPVU1zUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEWkNRVUZWTEVkQlFXcENMRlZCUVd0Q0xFbEJRVms3VVVGRE4wSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZEWkN4RFFVRkRPMUZCUTBRc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRja0lzUzBGQlN5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU03V1VGRE4wSXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NTVUZCU1N4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03VVVGRGFFUXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N4blEwRkJZU3hIUVVGd1FpeFZRVUZ4UWl4TFFVRmxPMUZCUTI1RExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETlVJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU5pTEVOQlFVTTdVVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRelZDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRaQ3hEUVVGRE8xRkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnNReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETzFGQlEySXNRMEZCUXp0UlFVTkVMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGJFTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJRenRSUVVOa0xFTkJRVU03VVVGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRVVzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTmlMRU5CUVVNN1VVRkRSQ3hOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzBsQlEyUXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTEdsRFFVRmpMRWRCUVhKQ0xGVkJRWE5DTEV0QlFXVTdVVUZEY0VNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NTMEZCU3l4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU01UWl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8xRkJRMlFzUTBGQlF6dFJRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFdEJRVXNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0UlFVTmtMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNelJTeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMUZCUTJRc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTTdTVUZEWWl4RFFVRkRPMGxCUlVRN096czdUMEZKUnp0SlFVTkpMR2REUVVGaExFZEJRWEJDTEZWQlFYRkNMRWxCUVZrN1VVRkRhRU1zWjBKQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTERSQ1FVRTBRaXhIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVWb1Jpd3lRa0ZCTWtJN1VVRkRNMElzU1VGQlRTeEZRVUZGTEVkQlFYTkNMRVZCUVVNc1ZVRkJTU3hGUVVGRkxFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNN1VVRkZNMFFzWjBKQlFXZENPMUZCUTJoQ0xFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0pDTEV0QlFVc3NUVUZCVFN4RFFVRkRMRTFCUVUwN1owSkJRVVVzUTBGQlF6dHZRa0ZEY0VJc1JVRkJSU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVOeVFpeERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOU0xFdEJRVXNzVFVGQlRTeERRVUZETEV0QlFVczdaMEpCUVVVc1EwRkJRenR2UWtGRGJrSXNSVUZCUlN4RFFVRkRMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdaMEpCUTJ4R0xFTkJRVU03WjBKQlFVTXNTMEZCU3l4RFFVRkRPMWxCUTFJc1MwRkJTeXhOUVVGTkxFTkJRVU1zU1VGQlNUdG5Ra0ZCUlN4RFFVRkRPMjlDUVVOc1FpeEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRTFCUVUwc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtZc1EwRkJRenRuUWtGQlF5eExRVUZMTEVOQlFVTTdXVUZEVWl4TFFVRkxMRTFCUVUwc1EwRkJReXhMUVVGTE8yZENRVUZGTEVOQlFVTTdiMEpCUTI1Q0xFVkJRVVVzUTBGQlF5eEhRVUZITEVkQlFVY3NUVUZCVFN4RFFVRkRMR3RDUVVGclFpeERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0blFrRkRlRVVzUTBGQlF6dG5Ra0ZCUXl4TFFVRkxMRU5CUVVNN1VVRkRWQ3hEUVVGRE8xRkJSVVFzYVVKQlFXbENPMUZCUTJwQ0xFVkJRVVVzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJRenRSUVVOMFFpeEZRVUZGTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU03VVVGRE1VSXNSVUZCUlN4RFFVRkRMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETzFGQlJURkNMRTFCUVUwc1EwRkJReXhKUVVGSkxHMUNRVUZWTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRNMElzUTBGQlF6dEpRVVZFT3pzN096czdUMEZOUnp0SlFVTkpMRzlEUVVGcFFpeEhRVUY0UWl4VlFVRjVRaXhKUVVGWkxFVkJRVVVzWTBGQmQwSXNSVUZCUlN4UlFVRnJRanRSUVVOc1JpeG5Ra0ZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNiVU5CUVcxRExFTkJRVU1zUTBGQlF6dFJRVU51UlN4SlFVRk5MRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJRenRSUVVWMlJDd3dRa0ZCTUVJN1VVRkRNVUlzU1VGQlNTeE5RVUZuUWl4RFFVRkRPMUZCUTNKQ0xFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0pDTEV0QlFVc3NUVUZCVFN4RFFVRkRMRWRCUVVjN1owSkJRMlFzVFVGQlRTeEhRVUZITEcxQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTXpRaXhMUVVGTExFTkJRVU03V1VGRFVDeExRVUZMTEUxQlFVMHNRMEZCUXl4UlFVRlJPMmRDUVVOdVFpeE5RVUZOTEVkQlFVY3NZMEZCWXl4RFFVRkRPMmRDUVVONFFpeExRVUZMTEVOQlFVTTdXVUZEVUN4TFFVRkxMRTFCUVUwc1EwRkJReXhKUVVGSk8yZENRVU5tTEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEyUXNUVUZCVFN4SFFVRkhMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVNMVF5eERRVUZETzJkQ1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yOUNRVU5RTEUxQlFVMHNSMEZCUnl4alFVRmpMRU5CUVVNN1owSkJRM3BDTEVOQlFVTTdaMEpCUTBRc1MwRkJTeXhEUVVGRE8xbEJRMUFzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRuUWtGRGJrTXNRMEZCUXp0UlFVTklMRU5CUVVNN1VVRkZSQ3hOUVVGTkxFTkJRVU1zVlVGQlZTeEhRVUZITEUxQlFVMHNRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJRenRKUVVNelF5eERRVUZETzBsQlIwWXNaVUZCUXp0QlFVRkVMRU5CUVVNc1FVRndUVVFzU1VGdlRVTTdRVUZ3VFZrc1owSkJRVkVzVjBGdlRYQkNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTEZkQlFWa3NVVUZCVVR0SlFVTnVRanM3VDBGRlJ6dEpRVU5JTEhWRFFVRkpMRU5CUVVFN1NVRkRTanM3VDBGRlJ6dEpRVU5JTERKRFFVRk5MRU5CUVVFN1NVRkRUanM3VDBGRlJ6dEpRVU5JTEN0RFFVRlJMRU5CUVVFN1FVRkRWQ3hEUVVGRExFVkJZbGNzWjBKQlFWRXNTMEZCVWl4blFrRkJVU3hSUVdGdVFqdEJRV0pFTEVsQlFWa3NVVUZCVVN4SFFVRlNMR2RDUVdGWUxFTkJRVUU3UVVGRlJEczdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3p0SFFYbENSenRCUVVOSU8wbEJSVU03VVVGRFF6czdPenRYUVVsSE8xRkJRMGtzVFVGQlowSTdVVUZGZGtJN096czdPenRYUVUxSE8xRkJRMGtzVVVGQmEwSTdVVUZGZWtJN08xZEJSVWM3VVVGRFNTeFZRVUZ2UWp0UlFVVXpRanM3VjBGRlJ6dFJRVU5KTEZGQlFXZENPMUZCUlhaQ096czdPenM3TzFkQlQwYzdVVUZEU1N4TlFVRmpPMUZCUlhKQ096czdPMWRCU1VjN1VVRkRTU3hMUVVGaE8xRkJjRU5pTEZkQlFVMHNSMEZCVGl4TlFVRk5MRU5CUVZVN1VVRlRhRUlzWVVGQlVTeEhRVUZTTEZGQlFWRXNRMEZCVlR0UlFVdHNRaXhsUVVGVkxFZEJRVllzVlVGQlZTeERRVUZWTzFGQlMzQkNMR0ZCUVZFc1IwRkJVaXhSUVVGUkxFTkJRVkU3VVVGVmFFSXNWMEZCVFN4SFFVRk9MRTFCUVUwc1EwRkJVVHRSUVU5a0xGVkJRVXNzUjBGQlRDeExRVUZMTEVOQlFWRTdVVUZGY0VJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRja0lzU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMnBGTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUTBZc1pVRkJRenRCUVVGRUxFTkJRVU1zUVVGc1JFUXNTVUZyUkVNN1FVRnNSRmtzWjBKQlFWRXNWMEZyUkhCQ0xFTkJRVUU3UVVGSFJDeEpRVUZMTEZsQllVbzdRVUZpUkN4WFFVRkxMRmxCUVZrN1NVRkRhRUlzTmtOQlFVOHNRMEZCUVR0SlFVTlFMRFpEUVVGUExFTkJRVUU3U1VGRFVDdzJRMEZCVHl4RFFVRkJPMGxCUTFBc05rTkJRVThzUTBGQlFUdEpRVU5RTERaRFFVRlBMRU5CUVVFN1NVRkRVQ3cyUTBGQlR5eERRVUZCTzBsQlExQXNOa05CUVU4c1EwRkJRVHRKUVVOUUxEWkRRVUZQTEVOQlFVRTdTVUZEVUN3MlEwRkJUeXhEUVVGQk8wbEJRMUFzT0VOQlFWRXNRMEZCUVR0SlFVTlNMRGhEUVVGUkxFTkJRVUU3U1VGRFVpdzRRMEZCVVN4RFFVRkJPMEZCUTFRc1EwRkJReXhGUVdKSkxGbEJRVmtzUzBGQldpeFpRVUZaTEZGQllXaENPMEZCUlVRc01rSkJRVEpDTEVsQlFWazdTVUZEZEVNc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFWY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTjBReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU01UWl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVlzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZEUkN4M1FrRkJkMEk3U1VGRGVFSXNNRUpCUVRCQ08wbEJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSFZDUVVGMVFpeEhRVUZITEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVONFJDeERRVUZETzBGQlEwWXNRMEZCUXp0QlFVVkVMRWxCUVVzc1ZVRlJTanRCUVZKRUxGZEJRVXNzVlVGQlZUdEpRVU5rTEhsRFFVRlBMRU5CUVVFN1NVRkRVQ3g1UTBGQlR5eERRVUZCTzBsQlExQXNlVU5CUVU4c1EwRkJRVHRKUVVOUUxIbERRVUZQTEVOQlFVRTdTVUZEVUN4NVEwRkJUeXhEUVVGQk8wbEJRMUFzZVVOQlFVOHNRMEZCUVR0SlFVTlFMSGxEUVVGUExFTkJRVUU3UVVGRFVpeERRVUZETEVWQlVra3NWVUZCVlN4TFFVRldMRlZCUVZVc1VVRlJaRHRCUVVWRU96czdSMEZIUnp0QlFVTklMRFpDUVVGdlF5eERRVUZUTzBsQlF6VkRMRTFCUVUwc1EwRkJReXgxUkVGQmRVUXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGVFVXNRMEZCUXp0QlFVWmxMREpDUVVGdFFpeHpRa0ZGYkVNc1EwRkJRVHRCUVVWRU96dEhRVVZITzBGQlEwZzdTVUZEUXp0UlFVTkRPenRYUVVWSE8xRkJRMGtzUlVGQlZUdFJRVU5xUWpzN1YwRkZSenRSUVVOSkxFMUJRV2RDTzFGQlJYWkNPenRYUVVWSE8xRkJRMGtzVFVGQll6dFJRVlJrTEU5QlFVVXNSMEZCUml4RlFVRkZMRU5CUVZFN1VVRkpWaXhYUVVGTkxFZEJRVTRzVFVGQlRTeERRVUZWTzFGQlMyaENMRmRCUVUwc1IwRkJUaXhOUVVGTkxFTkJRVkU3VVVGSGNrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYWtJc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUTNwRUxFTkJRVU03U1VGRFJpeERRVUZETzBsQlEwWXNhVUpCUVVNN1FVRkJSQ3hEUVVGRExFRkJja0pFTEVsQmNVSkRPMEZCY2tKWkxHdENRVUZWTEdGQmNVSjBRaXhEUVVGQk8wRkJSVVE3TzBkQlJVYzdRVUZEU0N4WFFVRlpMR1ZCUVdVN1NVRkRNVUk3TzA5QlJVYzdTVUZEU0N4cFJFRkJSU3hEUVVGQk8wbEJRMFk3TzA5QlJVYzdTVUZEU0N4eFJFRkJTU3hEUVVGQk8wRkJRMHdzUTBGQlF5eEZRVlJYTEhWQ1FVRmxMRXRCUVdZc2RVSkJRV1VzVVVGVE1VSTdRVUZVUkN4SlFVRlpMR1ZCUVdVc1IwRkJaaXgxUWtGVFdDeERRVUZCTzBGQlJVUTdPenRIUVVkSE8wRkJRMGc3U1VGdlIwTTdPMDlCUlVjN1NVRkRTQ3h2UWtGQmIwSXNTVUZCVnp0UlFYWkhhRU1zYVVKQk1DdENRenRSUVdwUlFUczdWMEZGUnp0UlFVTkxMRzFDUVVGakxFZEJRVzlETEVWQlFVVXNRMEZCUXp0UlFUUkZOMFE3TzFkQlJVYzdVVUZEU3l4dFFrRkJZeXhIUVVGdlF5eEZRVUZGTEVOQlFVTTdVVUZ1ZEVJMVJDeG5Ra0ZCVFN4RFFVRkRMRU5CUVVNc1ZVRkJWU3hEUVVGRExGTkJRVk1zUlVGQlJTd3JSa0ZCSzBZc1EwRkJReXhEUVVGRE8xRkJReTlJTEdkQ1FVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlEzSkNMSGxJUVVGNVNDeERRVU42U0N4RFFVRkRPMUZCUTBZc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1pDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzUkNMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1JVRkJSU3hMUVVGTExFVkJRVVVzUlVGQlJTeEZRVUZGTEV0QlFVc3NSVUZCUlN4RlFVRkZMRVZCUVVVc1EwRkJRenRaUVVOMFF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRlZCUVVNc1EwRkJUVHRuUWtGRGJrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEVsQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlF6ZENMRWRCUVVjc1EwRkJReXhEUVVGakxGVkJRVzlDTEVWQlFYQkNMRXRCUVVFc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVhCQ0xHTkJRVzlDTEVWQlFYQkNMRWxCUVc5Q0xFTkJRVU03ZDBKQlFXeERMRWxCUVUwc1IwRkJSeXhUUVVGQk8zZENRVU5pTEV0QlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03Y1VKQlEzSkRPMjlDUVVORUxFZEJRVWNzUTBGQlF5eERRVUZqTEZWQlFXOUNMRVZCUVhCQ0xFdEJRVUVzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRWEJDTEdOQlFXOUNMRVZCUVhCQ0xFbEJRVzlDTEVOQlFVTTdkMEpCUVd4RExFbEJRVTBzUjBGQlJ5eFRRVUZCTzNkQ1FVTmlMRXRCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdjVUpCUTNKRE8yZENRVU5HTEVOQlFVTTdXVUZEUml4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOS0xFTkJRVU03VVVGRFJDeEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdTVUZEZWtNc1EwRkJRenRKUVhKSVJEczdPenM3VDBGTFJ6dEpRVU5YTEdWQlFVa3NSMEZCYkVJc1ZVRkJiVUlzU1VGQmEwSTdVVUZEY0VNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTldMRlZCUVZVc1EwRkJReXhUUVVGVExFZEJRVWNzVTBGQlV5eERRVUZETzFsQlEycERMRlZCUVZVc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeFZRVUZWTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRelZGTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxGVkJRVlVzUTBGQlF5eFRRVUZUTEVkQlFVY3NVMEZCVXl4RFFVRkRPMWxCUTJwRExGVkJRVlVzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0UlFVTjJRaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTFjc2JVSkJRVkVzUjBGQmRFSTdVVUZEUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpOQ0xFbEJRVTBzVFVGQlNTeEhRVUZWTEVWQlFVVXNRMEZCUXp0WlFVTjJRaXd3UTBGQk1FTTdXVUZETVVNc1NVRkJUU3hEUVVGRExFZEJRVkVzUTBGQlF5eE5RVUZOTEVkQlFVY3NUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhEUVVGRE8xbEJRekZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlExQXNSMEZCUnl4RFFVRkRMRU5CUVdNc1ZVRkJZeXhGUVVGa0xFdEJRVUVzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJaQ3hqUVVGakxFVkJRV1FzU1VGQll5eERRVUZETzI5Q1FVRTFRaXhKUVVGTkxFZEJRVWNzVTBGQlFUdHZRa0ZEWWl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEycERMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4TFFVRkxMRkZCUVZFc1NVRkJTU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPelJDUVVOb1JTeE5RVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTnVRaXhEUVVGRE8yOUNRVU5HTEVOQlFVTTdhVUpCUTBRN1dVRkRSaXhEUVVGRE8xbEJRMFFzSzBOQlFTdERPMWxCUXk5RExFbEJRVTBzWlVGQlpTeEhRVUZITEZWQlFVTXNUMEZCV1R0blFrRkRjRU1zU1VGQlNTeERRVUZETzI5Q1FVTktMREpEUVVFeVF6dHZRa0ZETTBNc1NVRkJUU3hWUVVGVkxFZEJRVWNzVVVGQlVTeERRVUZETzI5Q1FVTTFRaXhKUVVGTkxFTkJRVU1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXcyUTBGQk5rTTdiMEpCUXpWRkxFMUJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMlFzUTBGQlJUdG5Ra0ZCUVN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTmFMRzFDUVVGdFFqdHZRa0ZEYmtJc1NVRkJUU3hYUVVGWExFZEJRV0U3ZDBKQlF6ZENMR1ZCUVdVN2QwSkJRMllzYlVKQlFXMUNPM2RDUVVOdVFpeGhRVUZoTzNkQ1FVTmlMRzlDUVVGdlFqdDNRa0ZEY0VJc2FVSkJRV2xDTzNkQ1FVTnFRaXh4UWtGQmNVSTdkMEpCUTNKQ0xHbENRVUZwUWp0M1FrRkRha0lzWlVGQlpUdDNRa0ZEWml4eFFrRkJjVUk3ZDBKQlEzSkNMRzFDUVVGdFFqdDNRa0ZEYmtJc2NVSkJRWEZDTzNkQ1FVTnlRaXhuUWtGQlowSTdjVUpCUTJoQ0xFTkJRVU03YjBKQlEwWXNTVUZCVFN4UlFVRlJMRWRCUVdFc1JVRkJSU3hEUVVGRE8yOUNRVU01UWl4SlFVRk5MR0ZCUVdFc1IwRkJZU3hGUVVGRkxFTkJRVU03YjBKQlEyNURMRmRCUVZjc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlF5eFZRVUZyUWp0M1FrRkRkRU1zU1VGQlNTeERRVUZET3pSQ1FVTktMRWxCUVUwc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXpzMFFrRkRPVUlzVFVGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRFpDeERRVUZGTzNkQ1FVRkJMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUldJc1EwRkJRenR2UWtGRFJpeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRTaXhEUVVGRE8xbEJRMFlzUTBGQlF5eERRVUZETzFsQlEwWXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOMlFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRTFCUVUwc1MwRkJTeXhSUVVGUkxFbEJRVWtzVDBGQlR5eE5RVUZOTEVOQlFVTXNUMEZCVHl4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEzUkZMR1ZCUVdVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETERSRVFVRTBSRHRuUWtGRGRrWXNRMEZCUXp0WlFVTkdMRU5CUVVNN1dVRkRSQ3hWUVVGVkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NWVUZCVlN4RFFVRkRMRTFCUVVrc1EwRkJReXhEUVVGRE8xRkJRemRETEVOQlFVTTdVVUZEUkN4TlFVRk5MRU5CUVVNc1ZVRkJWU3hEUVVGRExGTkJRVk1zUTBGQlF6dEpRVU0zUWl4RFFVRkRPMGxCTWtORU96dFBRVVZITzBsQlEwa3NPRUpCUVZNc1IwRkJhRUk3VVVGRFF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzUkNMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzFsQlEyaEVMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEZUVJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRPMGxCUTNoQ0xFTkJRVU03U1VGRlRTd3lRa0ZCVFN4SFFVRmlMRlZCUVdNc1VVRkJaMEk3VVVGRE4wSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRKUVVOc1JDeERRVUZETzBsQlJVUTdPenM3T3pzN1QwRlBSenRKUVVOSkxDdENRVUZWTEVkQlFXcENMRlZCUVd0Q0xGRkJRV2xDTzFGQlEyeERMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEWkN4SlFVRk5MRk5CUVZNc1IwRkJaU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMWxCUXpGRUxFbEJRVWtzVFVGQlRTeEhRVUZoTEVsQlFVa3NRMEZCUXp0WlFVTTFRaXhKUVVGTkxGTkJRVk1zUjBGQllTeEZRVUZGTEVOQlFVTTdXVUZETDBJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1owSkJRek5ETEVsQlFVMHNVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZET1VJc1JVRkJSU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNTMEZCU3l4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETTBNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVONFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExGbEJRVmtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRemxETEUxQlFVMHNSMEZCUnl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRE8zZENRVU01UWl4RFFVRkRPMjlDUVVOR0xFTkJRVU03WjBKQlEwWXNRMEZCUXp0blFrRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4TFFVRkxMRkZCUVZFc1EwRkJReXhSUVVGUk8zVkNRVU4yUXl4VFFVRlRMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEycEVMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMjlDUVVOc1F5eEpRVUZOTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0dlFrRkRiRVFzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03ZDBKQlEzUkRMRWxCUVUwc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRla0lzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU5zUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlEzaERMRTFCUVUwc1IwRkJSeXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZET3pSQ1FVTjRRaXhEUVVGRE8zZENRVU5HTEVOQlFVTTdiMEpCUTBZc1EwRkJRenR2UWtGQlFTeERRVUZETzJkQ1FVTklMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRVUVzUTBGQlF6dFpRVU5HTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEWWl4TlFVRk5MRWRCUVVjc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROVUlzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03VVVGRGRrSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEcxQ1FVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN096czdPenRQUVU5SE8wbEJRMGtzSzBKQlFWVXNSMEZCYWtJc1ZVRkJhMElzVVVGQmFVSTdVVUZEYkVNc1JVRkJSU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTmtMRWxCUVUwc1UwRkJVeXhIUVVGbExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1dVRkRNVVFzU1VGQlNTeE5RVUZOTEVkQlFXRXNTVUZCU1N4RFFVRkRPMWxCUXpWQ0xFbEJRVTBzVTBGQlV5eEhRVUZoTEVWQlFVVXNRMEZCUXp0WlFVTXZRaXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExGTkJRVk1zUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJRenRuUWtGRE0wTXNTVUZCVFN4UlFVRlJMRWRCUVVjc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTTVRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4TFFVRkxMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTXpReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM0pFTEUxQlFVMHNSMEZCUnl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRE8yOUNRVU01UWl4RFFVRkRPMmRDUVVOR0xFTkJRVU03WjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGRkJRVkVzUzBGQlN5eFJRVUZSTEVOQlFVTXNVVUZCVVR0MVFrRkRka01zVTBGQlV5eERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOcVJDeFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dHZRa0ZEYkVNc1NVRkJUU3hKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03YjBKQlEyeEVMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRPM2RDUVVOMFF5eEpRVUZOTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEzcENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRMME1zVFVGQlRTeEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN2QwSkJRM2hDTEVOQlFVTTdiMEpCUTBZc1EwRkJRenR2UWtGQlFTeERRVUZETzJkQ1FVTklMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRVUVzUTBGQlF6dFpRVU5HTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEWWl4TlFVRk5MRWRCUVVjc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROVUlzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03VVVGRGRrSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEcxQ1FVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxESkNRVUZOTEVkQlFXSXNWVUZCWXl4UlFVRm5RanRSUVVNM1FpeE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEZsQlFWa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRM3BFTEVOQlFVTTdTVUZQVFN4clEwRkJZU3hIUVVGd1FpeFZRVUZ4UWl4UlFVRm5RaXhGUVVGRkxFTkJRWE5DTzFGQlF6VkVMRWxCUVVrc1VVRkJhMElzUTBGQlF6dFJRVU4yUWl4SlFVRk5MRTlCUVU4c1IwRkJaU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEZGQlFWRXNSMEZCUnl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkZOVVVzTkVOQlFUUkRPMUZCUXpWRExFbEJRVTBzV1VGQldTeEhRVUZsTEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRE4wUXNTVUZCVFN4cFFrRkJhVUlzUjBGQlpTeEZRVUZGTEVOQlFVTTdVVUZEZWtNc1NVRkJUU3hWUVVGVkxFZEJRVmNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXp0UlFVTTVReXhKUVVGTkxGRkJRVkVzUjBGQlZ5eFZRVUZWTEVkQlFVY3NSMEZCUnl4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVOd1JDeEpRVUZKTEU5QlFVOHNSMEZCVnl4SlFVRkpMRU5CUVVNN1VVRkRNMElzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03V1VGRE9VTXNVVUZCVVN4SFFVRkhMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU16UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUzBGQlN5eEpRVUZKTEVsQlFVa3NUMEZCVHl4SFFVRkhMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NTMEZCU3l4SlFVRkpMRWxCUVVrc1VVRkJVU3hEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRekZITEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0WlFVTnNReXhEUVVGRE8xbEJRMFFzVDBGQlR5eEhRVUZITEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRNVUlzUTBGQlF6dFJRVVZFTEc5RVFVRnZSRHRSUVVOd1JDeEpRVUZKTEZkQlFWY3NSMEZCYVVJc1JVRkJSU3hEUVVGRE8xRkJRMjVETEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NhVUpCUVdsQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1dVRkRia1FzVVVGQlVTeEhRVUZITEdsQ1FVRnBRaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyaERMSEZEUVVGeFF6dFpRVU55UXl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGREwwSXNTVUZCU1N4RFFVRkRMSGRDUVVGM1FpeERRVUZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRVZCUVVVc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RlFVRkZMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNSVUZCUlN4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRek5JTEVOQlFVTTdVVUZEU0N4RFFVRkRPMUZCUTBRc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZETEVOQlFXRXNSVUZCUlN4RFFVRmhPMWxCUXpkRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRGNFSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkZTQ3hyUlVGQmEwVTdVVUZEYkVVc1NVRkJTU3hSUVVGUkxFZEJRV0VzU1VGQlNTeERRVUZETzFGQlF6bENMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1YwRkJWeXhEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRPMWxCUXpkRExFbEJRVTBzVlVGQlZTeEhRVUZITEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOc1F5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRkZCUVZFc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEZEVRc1JVRkJSU3hEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVWQlFVVXNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEZUVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTTdaMEpCUTNSQ0xFTkJRVU03V1VGRFJpeERRVUZETzFsQlEwUXNVVUZCVVN4SFFVRkhMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGRE9VSXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3T3pzN08wOUJUVWM3U1VGRFNTdzRRa0ZCVXl4SFFVRm9RaXhWUVVGcFFpeFJRVUZuUWp0UlFVTm9ReXhKUVVGSkxHTkJRV01zUjBGQlZ5eFJRVUZSTEVOQlFVTTdVVUZEZEVNc1NVRkJTU3hYUVVGWExFZEJRVkVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRGJFUXNaVUZCWlR0UlFVTm1MRTlCUVU4c1QwRkJUeXhEUVVGRExGZEJRVmNzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUlN4RFFVRkRPMWxCUXpGRExIZENRVUYzUWp0WlFVTjRRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMjVFTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1UwRkJVeXhIUVVGSExGZEJRVmNzUjBGQlJ5d3lRMEZCTWtNN2MwSkJRMnhHTEZGQlFWRXNSMEZCUnl4WFFVRlhMRWRCUVVjc1kwRkJZeXhIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlEzQkVMRU5CUVVNN1dVRkRSQ3hqUVVGakxFZEJRVWNzVjBGQlZ5eERRVUZETzFsQlF6ZENMRmRCUVZjc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRenRSUVVOb1JDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1kwRkJZeXhMUVVGTExGTkJRVk1zU1VGQlNTeGpRVUZqTEV0QlFVc3NVMEZCVXl4SlFVRkpMR05CUVdNc1MwRkJTeXhUUVVGVExFTkJRVU1zUTBGQlF6dEpRVU4yUnl4RFFVRkRPMGxCYVVKTkxHMURRVUZqTEVkQlFYSkNMRlZCUVhOQ0xGRkJRV2RDTEVWQlFVVXNRMEZCYzBJc1JVRkJSU3hIUVVGNVF6dFJRVUY2UXl4dFFrRkJlVU1zUjBGQmVrTXNUVUZCZFVJc1pVRkJaU3hEUVVGRExFVkJRVVU3VVVGRGVFY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRNMElzU1VGQlRTeFRRVUZUTEVkQlFXVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFZEJRVWNzU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6bEZMRzFFUVVGdFJEdFpRVU51UkN4dFEwRkJiVU03V1VGRGJrTXNiVU5CUVcxRE8xbEJRMjVETEcxRFFVRnRRenRaUVVOdVF5eHRRMEZCYlVNN1dVRkZia01zSzBOQlFTdERPMWxCUXk5RExEWkdRVUUyUmp0WlFVVTNSaXg1UmtGQmVVWTdXVUZEZWtZc1NVRkJUU3hYUVVGWExFZEJRV2xDTEVsQlFVa3NRMEZCUXl3d1FrRkJNRUlzUTBGRGFFVXNVVUZCVVN4RlFVRkZMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNSVUZCUlN4VFFVRlRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlEzUkZMRU5CUVVNN1dVRkZSaXh0UTBGQmJVTTdXVUZEYmtNc1NVRkJTU3hKUVVGSkxFZEJRV0VzYlVKQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRrTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4WFFVRlhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdaMEpCUXpkRExFbEJRVTBzVlVGQlZTeEhRVUZITEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJFTXNjMEpCUVhOQ08yZENRVU4wUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEzcERMRWxCUVUwc1YwRkJWeXhIUVVGWExGVkJRVlVzUTBGQlF5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1JVRkJSU3hEUVVGRE8yOUNRVU5vUlN4SlFVRk5MRlZCUVZVc1IwRkJWeXhWUVVGVkxFTkJRVU1zUlVGQlJTeEhRVUZITEZWQlFWVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1dVRkJXU3hGUVVGRkxFTkJRVU03YjBKQlF6VkZMRVZCUVVVc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eFZRVUZWTEVsQlFVa3NWMEZCVnl4SlFVRkpMRk5CUVZNc1EwRkJReXhWUVVGVkxFZEJRVWNzVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRPVVVzU1VGQlRTeGhRVUZoTEVkQlFVY3NWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdkMEpCUTJ4RUxHOUNRVUZ2UWp0M1FrRkRjRUlzU1VGQlRTeE5RVUZOTEVkQlFWY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1pVRkJaU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRE4wUXNTVUZCVFN4WlFVRlpMRWRCUVVjc1UwRkJVeXhEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NZVUZCWVN4RFFVRkRMRmxCUVZrc1JVRkJSU3hEUVVGRE8zZENRVU5zUml4TlFVRk5MRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eFJRVUZSTEVkQlFVY3NXVUZCV1N4SFFVRkhMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNNVJTeERRVUZETzJkQ1FVTkdMRU5CUVVNN1owSkJRMFFzU1VGQlNTeEhRVUZITEZWQlFWVXNRMEZCUXl4TlFVRk5MRU5CUVVNN1dVRkRNVUlzUTBGQlF6dFpRVUZCTEVOQlFVTTdVVUZIU0N4RFFVRkRPMUZCUTBRc1RVRkJUU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NVVUZCVVN4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTm9SQ3hEUVVGRE8wbEJSVVE3T3pzN08wOUJTMGM3U1VGRFNTeHRRMEZCWXl4SFFVRnlRaXhWUVVGelFpeFJRVUZuUWl4RlFVRkZMRTlCUVRSQ08xRkJRMjVGTEVsQlFVMHNVVUZCVVN4SFFVRmhMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRPMUZCUXk5RUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8wbEJRMmhETEVOQlFVTTdTVUZGUkRzN096czdPenRQUVU5SE8wbEJRMGtzWjBOQlFWY3NSMEZCYkVJc1ZVRkJiVUlzVVVGQlowSXNSVUZCUlN4UFFVRTBRanRSUVVOb1JTeEpRVUZOTEZGQlFWRXNSMEZCWVN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVTXZSQ3hKUVVGSkxGTkJRVk1zUjBGQllTeEpRVUZKTEVOQlFVTTdVVUZGTDBJc1RVRkJUU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRNMElzUzBGQlN5eFJRVUZSTEVOQlFVTXNTVUZCU1R0blFrRkJSU3hEUVVGRE8yOUNRVU53UWl4VFFVRlRMRWRCUVVjc2JVSkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMnBETEVOQlFVTTdaMEpCUVVNc1MwRkJTeXhEUVVGRE8xbEJRMUlzUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFR0blFrRkJSU3hEUVVGRE8yOUNRVU4wUWl4VFFVRlRMRWRCUVVjc1VVRkJVU3hEUVVGRExGVkJRVlVzUTBGQlF6dG5Ra0ZEYWtNc1EwRkJRenRuUWtGQlF5eExRVUZMTEVOQlFVTTdXVUZEVWl4TFFVRkxMRkZCUVZFc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dG5Ra0ZEZUVJc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVUZGTEU5QlFVOHNSVUZCUlN4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRGFFWXNRMEZCUXp0UlFVTkdMRU5CUVVNN1VVRkZSQ3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRGRrTXNRMEZCUXp0SlFVVkVPenM3T3pzN096czdUMEZUUnp0SlFVTkpMR2xEUVVGWkxFZEJRVzVDTEZWQlFXOUNMRkZCUVdkQ0xFVkJRVVVzVDBGQk5FSXNSVUZCUlN4WlFVRTBRanRSUVVFMVFpdzBRa0ZCTkVJc1IwRkJOVUlzYlVKQlFUUkNPMUZCUXk5R0xFbEJRVTBzVVVGQlVTeEhRVUZoTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETzFGQlF5OUVMRWxCUVUwc1RVRkJUU3hIUVVGWExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZGZGtNc09FSkJRVGhDTzFGQlF6bENMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8yVkJRek5DTEZGQlFWRXNRMEZCUXl4UlFVRlJMRXRCUVVzc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETjBNc1NVRkJTU3hOUVVGTkxGTkJRVkVzUTBGQlF6dFpRVU51UWl4NVFrRkJlVUk3V1VGRGVrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYkVJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hQUVVGUExFVkJRVVVzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMWxCUXpGRkxFTkJRVU03V1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hOUVVGTkxFZEJRVWNzUlVGQlJTeERRVUZETzFsQlEySXNRMEZCUXp0WlFVTkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenRSUVVOeVF5eERRVUZETzFGQlJVUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVU03U1VGRlJEczdPenM3T3pzN096czdUMEZYUnp0SlFVTkpMSGREUVVGdFFpeEhRVUV4UWl4VlFVRXlRaXhSUVVGblFpeEZRVUZGTEZOQlFUaENPMUZCUXpGRkxFbEJRVTBzVlVGQlZTeEhRVUZITEVOQlFVTXNUMEZCVHl4VFFVRlRMRXRCUVVzc1VVRkJVU3hIUVVGSExGTkJRVk1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRkRVlzU1VGQlRTeFRRVUZUTEVkQlFXVXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU14UkN4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRk5CUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXp0WlFVTXpReXhKUVVGTkxGRkJRVkVzUjBGQlJ5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRPVUlzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1MwRkJTeXhKUVVGSkxFbEJRVWtzVVVGQlVTeERRVUZETEV0QlFVc3NSMEZCUnl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExGbEJRVmtzUlVGQlJTeEhRVUZITEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRemRHTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzFsQlEyaERMRU5CUVVNN1VVRkRSaXhEUVVGRE8xRkJRMFFzZDBKQlFYZENPMUZCUTNoQ0xEQkNRVUV3UWp0UlFVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhEUVVGRE8xRkJRM1pETEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRN096czdPenM3T3p0UFFWTkhPMGxCUTBrc2NVTkJRV2RDTEVkQlFYWkNMRlZCUVhkQ0xGRkJRV2RDTEVWQlFVVXNVMEZCT0VJN1VVRkRka1VzU1VGQlRTeEZRVUZGTEVkQlFXVXNRMEZCUXl4UFFVRlBMRk5CUVZNc1MwRkJTeXhSUVVGUkxFZEJRVWNzU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlF5OUdMRWxCUVUwc1dVRkJXU3hIUVVGbExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJSVzVGTERSRVFVRTBSRHRSUVVNMVJDeHRRMEZCYlVNN1VVRkRia01zYlVOQlFXMURPMUZCUTI1RExHMURRVUZ0UXp0UlFVTnVReXhwUlVGQmFVVTdVVUZGYWtVc05FVkJRVFJGTzFGQlF6VkZMREpEUVVFeVF6dFJRVVV6UXl4SlFVRk5MRmRCUVZjc1IwRkJhVUlzU1VGQlNTeERRVUZETERCQ1FVRXdRaXhEUVVOb1JTeFJRVUZSTEVWQlFVVXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eEZRVUZGTEZsQlFWa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGRE5VVXNRMEZCUXp0UlFVTkdMRWxCUVVrc1NVRkJTU3hIUVVGbExFbEJRVWtzUTBGQlF6dFJRVU0xUWl4SlFVRkpMRkZCUVZFc1IwRkJaU3hKUVVGSkxFTkJRVU03VVVGRGFFTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4WFFVRlhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdXVUZETjBNc1NVRkJUU3hWUVVGVkxFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJ4RExFVkJRVVVzUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF5eFpRVUZaTEVWQlFVVXNSMEZCUnl4WlFVRlpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYUVZc2IwTkJRVzlETzJkQ1FVTndReXhMUVVGTExFTkJRVU03V1VGRFVDeERRVUZETzFsQlEwUXNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOb1FpeEpRVUZKTEVkQlFVY3NWVUZCVlN4RFFVRkRPMUZCUTI1Q0xFTkJRVU03VVVGRlJDd3dRa0ZCTUVJN1VVRkRNVUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOV0xESkZRVUV5UlR0WlFVTXpSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVsQlFVa3NVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE1VUXNhMEpCUVd0Q08yZENRVU5zUWl4SlFVRk5MRWxCUVVrc1IwRkJSeXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03WjBKQlF6bERMRVZCUVVVc1EwRkJReXhEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVsQlFVa3NTVUZCU1N4RFFVRkRMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEZsQlFWa3NSVUZCUlR0MVFrRkRMMFFzV1VGQldTeERRVUZETEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNXVUZCV1N4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRNVVlzZVVKQlFYbENPMjlDUVVONlFpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dG5Ra0ZEYUVNc1EwRkJRenRuUWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0dlFrRkRVQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRuUWtGRE5VSXNRMEZCUXp0WlFVTkdMRU5CUVVNN1dVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZEVUN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0WlFVTTFRaXhEUVVGRE8xRkJRMFlzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc01rWkJRVEpHTzFsQlF6TkdMSE5EUVVGelF6dFpRVU4wUXl4TlFVRk5MRU5CUVVNc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNVUlzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN096czdPenRQUVU5SE8wbEJRMGtzY1VOQlFXZENMRWRCUVhaQ0xGVkJRWGRDTEZGQlFXZENMRVZCUVVVc1QwRkJORUlzUlVGQlJTeGpRVUYzUWp0UlFVTXZSaXhKUVVGTkxFVkJRVVVzUjBGQlpTeERRVUZETEU5QlFVOHNUMEZCVHl4TFFVRkxMRkZCUVZFc1IwRkJSeXhKUVVGSkxHMUNRVUZWTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmVrWXNjVU5CUVhGRE8xRkJRM0pETEVsQlFVMHNWMEZCVnl4SFFVRnBRaXhKUVVGSkxFTkJRVU1zZDBKQlFYZENMRU5CUXpsRUxGRkJRVkVzUlVGQlJTeEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1kwRkJZeXhEUVVOd1JTeERRVUZETzFGQlJVWXNiME5CUVc5RE8xRkJRM0JETEVsQlFVa3NUVUZCVFN4SFFVRmhMRWxCUVVrc1EwRkJRenRSUVVNMVFpeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhYUVVGWExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTTdXVUZEYkVRc1NVRkJUU3hWUVVGVkxFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJ4RExFVkJRVVVzUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNCRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8yZENRVU51UXl4TFFVRkxMRU5CUVVNN1dVRkRVQ3hEUVVGRE8xRkJRMFlzUTBGQlF6dFJRVVZFTEhkQ1FVRjNRanRSUVVONFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFlpeHRSRUZCYlVRN1dVRkRia1FzVFVGQlRTeEhRVUZITEcxQ1FVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlF6bENMRU5CUVVNN1VVRkZSQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzBsQlEyWXNRMEZCUXp0SlFVVkVPenM3T3pzN08wOUJUMGM3U1VGRFNTeHJRMEZCWVN4SFFVRndRaXhWUVVGeFFpeFJRVUZuUWl4RlFVRkZMRTlCUVRSQ0xFVkJRVVVzWTBGQmQwSTdVVUZETlVZc1NVRkJUU3hGUVVGRkxFZEJRV1VzUTBGQlF5eFBRVUZQTEU5QlFVOHNTMEZCU3l4UlFVRlJMRWRCUVVjc1NVRkJTU3h0UWtGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJRM3BHTEhGRFFVRnhRenRSUVVOeVF5eEpRVUZOTEZkQlFWY3NSMEZCYVVJc1NVRkJTU3hEUVVGRExIZENRVUYzUWl4RFFVTTVSQ3hSUVVGUkxFVkJRVVVzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRWRCUVVjc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMR05CUVdNc1EwRkRjRVVzUTBGQlF6dFJRVVZHTEc5RFFVRnZRenRSUVVOd1F5eEpRVUZKTEUxQlFVMHNSMEZCVnl4SlFVRkpMRU5CUVVNN1VVRkRNVUlzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1YwRkJWeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETzFsQlEyeEVMRWxCUVUwc1ZVRkJWU3hIUVVGSExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnNReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTndReXhOUVVGTkxFZEJRVWNzVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXp0blFrRkRNMElzUzBGQlN5eERRVUZETzFsQlExQXNRMEZCUXp0UlFVTkdMRU5CUVVNN1VVRkZSQ3gzUWtGQmQwSTdVVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJJc2JVUkJRVzFFTzFsQlEyNUVMRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRFlpeERRVUZETzFGQlJVUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVU03U1VGRlJEczdPenM3T3pzN08wOUJVMGM3U1VGRFNTdzJRMEZCZDBJc1IwRkJMMElzVlVGQlowTXNVVUZCWjBJc1JVRkJSU3hSUVVGblFpeEZRVUZGTEUxQlFXTXNSVUZCUlN4alFVRjNRanRSUVVNelJ5eG5Ra0ZCVFN4RFFVRkRMRkZCUVZFc1NVRkJTU3hOUVVGTkxFVkJRVVVzTkVKQlFUUkNMRU5CUVVNc1EwRkJRenRSUVVWNlJDeEpRVUZOTEZOQlFWTXNSMEZCWlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlF6RkVMRWxCUVUwc1RVRkJUU3hIUVVGcFFpeEZRVUZGTEVOQlFVTTdVVUZGYUVNc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NVVUZCVVN4RlFVRkZMRU5CUVVNc1NVRkJTU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXp0WlFVTjZReXhKUVVGSkxGRkJRVkVzUjBGQllTeEpRVUZKTEVOQlFVTTdXVUZET1VJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNN1owSkJRek5ETEVsQlFVMHNVVUZCVVN4SFFVRmhMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVNc1JVRkJSU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlF6VkNMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeFZRVUZWTEVOQlEzcENMRkZCUVZFc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRMRVZCUVVVc1kwRkJZeXhGUVVGRkxGRkJRVkVzUTBGQlF5eEZRVU4yUkN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVOaUxGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOd1FpeERRVUZETzJkQ1FVTkVMRkZCUVZFc1IwRkJSeXhSUVVGUkxFTkJRVU03V1VGRGNrSXNRMEZCUXp0UlFVTkdMRU5CUVVNN1VVRkZSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCWVN4RlFVRkZMRU5CUVdFN1dVRkRlRU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU53UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOSUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEWml4RFFVRkRPMGxCUlVRN096czdPenM3VDBGUFJ6dEpRVU5KTEN0RFFVRXdRaXhIUVVGcVF5eFZRVUZyUXl4UlFVRm5RaXhGUVVGRkxGRkJRV2RDTEVWQlFVVXNUVUZCWXp0UlFVTnVSaXhuUWtGQlRTeERRVUZETEZGQlFWRXNTVUZCU1N4TlFVRk5MRVZCUVVVc05FSkJRVFJDTEVOQlFVTXNRMEZCUXp0UlFVVjZSQ3hKUVVGTkxGZEJRVmNzUjBGQlZ5eE5RVUZOTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVNMVJTeEpRVUZOTEZOQlFWTXNSMEZCVnl4TlFVRk5MRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVVUZITlVVc1NVRkJUU3hUUVVGVExFZEJRV1VzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVNeFJDeG5Ra0ZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEZRVUZGTEc5RVFVRnZSQ3hEUVVGRExFTkJRVU03VVVGRmJrWXNTVUZCVFN4TlFVRk5MRWRCUVdsQ0xFVkJRVVVzUTBGQlF6dFJRVVZvUXl4SlFVRkpMRkZCUVZFc1IwRkJZU3hKUVVGSkxFTkJRVU03VVVGRE9VSXNTVUZCU1N4aFFVRnhRaXhEUVVGRE8xRkJRekZDTEVsQlFVa3NZVUZCWVN4SFFVRmhMRzFDUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxFbEJRVWtzWVVGQllTeEhRVUZoTEcxQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyaEVMRWxCUVVrc1ZVRkJWU3hIUVVGWExFVkJRVVVzUTBGQlF6dFJRVU0xUWl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRk5CUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXp0WlFVTXpReXhKUVVGTkxGRkJRVkVzUjBGQlJ5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRPVUlzU1VGQlRTeFRRVUZUTEVkQlFWY3NVVUZCVVN4RFFVRkRMRXRCUVVzc1IwRkJSeXhKUVVGSkxHMUNRVUZWTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVOMlJ5eEpRVUZKTEZOQlFWTXNSMEZCWVN4aFFVRmhMRU5CUVVNN1dVRkRlRU1zU1VGQlNTeFRRVUZUTEVkQlFXRXNZVUZCWVN4RFFVRkRPMWxCUTNoRExFbEJRVWtzVFVGQlRTeEhRVUZYTEZWQlFWVXNRMEZCUXp0WlFVVm9ReXh0UWtGQmJVSTdXVUZEYmtJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEV0QlFVc3NTVUZCU1N4SlFVRkpMRkZCUVZFc1EwRkJReXhMUVVGTExFZEJRVWNzVTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXp0dFFrRkRja1FzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1NVRkJTU3hSUVVGUkxFTkJRVU1zUzBGQlN5eEpRVUZKTEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRmFFVXNVMEZCVXl4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03WjBKQlJUVkNMRTFCUVUwc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNelFpeExRVUZMTEZGQlFWRXNRMEZCUXl4SlFVRkpPM2RDUVVOcVFpeFRRVUZUTEVkQlFVY3NiVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUXpsQ0xFMUJRVTBzUjBGQlJ5eEZRVUZGTEVOQlFVTTdkMEpCUTFvc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NVVUZCVVN4RFFVRkRMRTFCUVUwN2QwSkJRMjVDTEZOQlFWTXNSMEZCUnl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRE8zZENRVU5vUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRE8zZENRVU5hTEV0QlFVc3NRMEZCUXp0dlFrRkRVQ3hMUVVGTExGRkJRVkVzUTBGQlF5eFJRVUZSTzNkQ1FVTnlRaXdyUlVGQkswVTdkMEpCUXk5RkxHVkJRV1U3ZDBKQlEyWXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEWkN4SlFVRk5MRk5CUVZNc1IwRkJaU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenMwUWtGRGJrVXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdaME5CUXpORExFbEJRVTBzVVVGQlVTeEhRVUZITEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRE9VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGVkJRVlVzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwTkJRM2hETEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4aFFVRmhMRVZCUVVVc1UwRkJVeXhGUVVGRkxFbEJRVWtzUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8zZERRVU51Uml4VFFVRlRMRWRCUVVjc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF6dDNRMEZETVVJc1RVRkJUU3hIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdiME5CUXpGQ0xFTkJRVU03WjBOQlEwWXNRMEZCUXpzMFFrRkRSaXhEUVVGRE96UkNRVUZCTEVOQlFVTTdkMEpCUTBnc1EwRkJRenQzUWtGRFJDeExRVUZMTEVOQlFVTTdaMEpCUTFJc1EwRkJRenRuUWtGRlJDd3lRMEZCTWtNN1owSkJRek5ETEVsQlFVMHNSVUZCUlN4SFFVRlhMRU5CUVVNc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eExRVUZMTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNN1owSkJRemRFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hWUVVGVkxFTkJRVU1zUlVGQlJTeEZRVUZGTEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1UwRkJVeXhEUVVGRExFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkZiRVVzYTBSQlFXdEVPMmRDUVVOc1JDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hMUVVGTExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNM1F5eEpRVUZOTEdOQlFXTXNSMEZCYVVJc1NVRkJTU3hEUVVGRExIZENRVUYzUWl4RFFVTnFSU3hSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVU5xUWl4aFFVRmhMRXRCUVVzc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNZVUZCWVN4RlFVRkZMRkZCUVZFc1EwRkJReXhIUVVGSExGRkJRVkVzUlVGRE1VVXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhUUVVGVExFVkJRVVVzVFVGQlRTeERRVUZETEVWQlF6TkNMRk5CUVZNc1EwRkRWQ3hEUVVGRE8yOUNRVU5HTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NZMEZCWXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETzNkQ1FVTm9SQ3hKUVVGTkxGVkJRVlVzUjBGQlJ5eGpRVUZqTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM0pETEUxQlFVMHNSMEZCUnl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRE8zZENRVU16UWl4VFFVRlRMRWRCUVVjc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF6dDNRa0ZET1VJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOcVJ5eERRVUZETzI5Q1FVRkJMRU5CUVVNN1owSkJRMGdzUTBGQlF6dFpRVU5HTEVOQlFVTTdXVUZGUkN4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRE8xbEJRM0JDTEdGQlFXRXNSMEZCUnl4VFFVRlRMRU5CUVVNN1dVRkRNVUlzWVVGQllTeEhRVUZITEZOQlFWTXNRMEZCUXp0WlFVTXhRaXhoUVVGaExFZEJRVWNzVTBGQlV5eERRVUZETzFsQlF6RkNMRlZCUVZVc1IwRkJSeXhOUVVGTkxFTkJRVU03VVVGRGNrSXNRMEZCUXp0UlFVVkVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZoTEVWQlFVVXNRMEZCWVR0WlFVTjRReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJRM0JDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTBnc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF6dEpRVU5tTEVOQlFVTTdTVUZGUkRzN096czdUMEZMUnp0SlFVTkpMR2REUVVGWExFZEJRV3hDTEZWQlFXMUNMRkZCUVdkQ0xFVkJRVVVzVDBGQk5FSTdVVUZEYUVVc1NVRkJUU3hWUVVGVkxFZEJRVWNzUTBGQlF5eFBRVUZQTEU5QlFVOHNTMEZCU3l4UlFVRlJMRWRCUVVjc1QwRkJUeXhIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0UlFVTm9SaXhKUVVGTkxGTkJRVk1zUjBGQlpTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRekZFTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETzFsQlF6TkRMRWxCUVUwc1VVRkJVU3hIUVVGSExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1NVRkJTU3hSUVVGUkxFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRelZFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNN1dVRkRha0lzUTBGQlF6dFJRVU5HTEVOQlFVTTdVVUZEUkN4M1FrRkJkMEk3VVVGRGVFSXNNRUpCUVRCQ08xRkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFZpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRzlDUVVGdlFpeERRVUZETEVOQlFVTTdVVUZEZGtNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGUFJEczdPenM3TzA5QlRVYzdTVUZEU1N4cFEwRkJXU3hIUVVGdVFpeFZRVUZ2UWl4UlFVRm5RanRSUVVOdVF5eHJSRUZCYTBRN1VVRkRiRVFzZDBKQlFYZENPMUZCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOb1JDeDNRa0ZCZDBJN1dVRkRlRUlzTUVKQlFUQkNPMWxCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1VVRkJVU3hIUVVGSExHVkJRV1VzUTBGQlF5eERRVUZETzFsQlEzcEVMRU5CUVVNN1VVRkRSaXhEUVVGRE8xRkJSVVFzYTBKQlFXdENPMUZCUTJ4Q0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnNSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOMFF5eERRVUZETzFGQlJVUXNTVUZCVFN4TlFVRk5MRWRCUVdVc1JVRkJSU3hEUVVGRE8xRkJRemxDTEVsQlFVa3NZMEZCWXl4SFFVRlhMRkZCUVZFc1EwRkJRenRSUVVOMFF5eEpRVUZKTEZkQlFWY3NSMEZCVVN4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVTnNSQ3hsUVVGbE8xRkJRMllzVDBGQlR5eFBRVUZQTEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1VVRkJVU3hGUVVGRkxFTkJRVU03V1VGRE1VTXNkMEpCUVhkQ08xbEJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNZMEZCWXl4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtRc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NWMEZCVnl4SFFVRkhMREpEUVVFeVF6dHpRa0ZEYkVZc1VVRkJVU3hIUVVGSExGZEJRVmNzUjBGQlJ5eGpRVUZqTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRjRVFzUTBGQlF6dFpRVU5FTEdOQlFXTXNSMEZCUnl4WFFVRlhMRU5CUVVNN1dVRkROMElzVjBGQlZ5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzFGQlEyaEVMRU5CUVVNN1VVRkRSQ3gzUWtGQmQwSTdVVUZEZUVJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFWY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhYUVVGWExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1dVRkRja1FzU1VGQlRTeFRRVUZUTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMnBETEVsQlFVMHNVVUZCVVN4SFFVRmhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROVVFzU1VGQlNTeExRVUZMTEVkQlFWY3NTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnVSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5zUWl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRMlFzUTBGQlF6dFpRVVZFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRM1pDTEcxQ1FVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZEY2tRc1VVRkJVU3hGUVVOU0xGRkJRVkVzUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc2JVSkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVWQlFVVXNSVUZETVVVc1VVRkJVU3hMUVVGTExGRkJRVkVzUTBGQlF5eFJRVUZSTEVkQlFVY3NVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGJFUXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVOYUxFdEJRVXNzUTBGRFRDeERRVUZETEVOQlFVTTdVVUZEU2l4RFFVRkRPMUZCUlVRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZETEVOQlFWY3NSVUZCUlN4RFFVRlhPMWxCUTNCRExHbENRVUZwUWp0WlFVTnFRaXgzUWtGQmQwSTdXVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NTMEZCU3l4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUzBGQlN5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVNeFF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTFZc1EwRkJRenRaUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRXRCUVVzc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEV0QlFVc3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE1VTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMWdzUTBGQlF6dFpRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFdEJRVXNzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRXRCUVVzc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZETVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5XTEVOQlFVTTdXVUZEUkN4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVNMVFpeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVklMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRPMUZCUTNaRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEWml4RFFVRkRPMGxCVDBRN096czdPenRQUVUxSE8wbEJRMGtzYVVOQlFWa3NSMEZCYmtJc1ZVRkJiMElzVVVGQlowSTdVVUZEYmtNc2RVTkJRWFZETzFGQlEzWkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTm9SQ3hOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEdGQlFXRXNSMEZCUnl4UlFVRlJMRWRCUVVjc1pVRkJaU3hEUVVGRExFTkJRVU03VVVGRE4wUXNRMEZCUXp0UlFVVkVMRzlDUVVGdlFqdFJRVU53UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGJFUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZEZEVNc1EwRkJRenRSUVVWRUxFbEJRVTBzVFVGQlRTeEhRVUZsTEVWQlFVVXNRMEZCUXp0UlFVTTVRaXhKUVVGTkxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU16UXl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXp0WlFVTjZReXhKUVVGTkxFbEJRVWtzUjBGQlJ5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkZlRUlzU1VGQlRTeFJRVUZSTEVkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUzBGQlN5eEhRVUZITEVOQlFVTXNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVJTeEpRVUZOTEUxQlFVMHNSMEZCVnl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJwRUxFbEJRVTBzVFVGQlRTeEhRVUZYTEVOQlFVTXNUVUZCVFN4TFFVRkxMRTFCUVUwc1EwRkJReXhIUVVGSExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFMUJRVTBzUjBGQlJ5eFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROMGNzU1VGQlRTeE5RVUZOTEVkQlFWY3NTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnFSQ3hKUVVGTkxFdEJRVXNzUjBGQlZ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0WlFVTjJSQ3hKUVVGTkxGTkJRVk1zUjBGQldTeEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzaEVMRWxCUVUwc1UwRkJVeXhIUVVGdFFpeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRNVU1zU1VGQlRTeFhRVUZYTEVkQlFWY3NhVUpCUVdsQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdXVUZGZWtRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZEZGtJc1VVRkJVU3hGUVVOU0xFMUJRVTBzUlVGRFRpeE5RVUZOTEVWQlEwNHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVOUUxGZEJRVmNzUlVGRFdDeE5RVUZOTEVWQlEwNHNTMEZCU3l4RlFVTk1MRk5CUVZNc1JVRkRWQ3hKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzTUVSQlFUQkVPMWxCUXpkSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGRGFrUXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVTnFSQ3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVU0xUWl4dFFrRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVWQlEzWkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZITEVkQlFVY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGRE4wSXNRMEZCUXl4RFFVRkRPMUZCUlV3c1EwRkJRenRSUVVWRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRlhMRVZCUVVVc1EwRkJWenRaUVVOd1F5eDNRa0ZCZDBJN1dVRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNwQ0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEVml4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTXZRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEV0N4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOV0xFTkJRVU03VVVGRFJpeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVklMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRPMUZCUTNaRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEWml4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NhME5CUVdFc1IwRkJjRUlzVlVGQmNVSXNTVUZCV1R0UlFVTm9ReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOc1FpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVOMFFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF6dFJRVU40UWl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJRenRSUVVNeFFpeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTEdkRFFVRlhMRWRCUVd4Q0xGVkJRVzFDTEVWQlFWVTdVVUZETlVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeExRVUZMTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRUlzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNN1VVRkRia0lzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhGUVVGRkxFdEJRVXNzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTXhRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRGhDUVVFNFFqdFJRVU51UkN4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRja01zVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNN1VVRkRjRUlzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc2QwSkJRWGRDTzFsQlEzaENMREJDUVVFd1FqdFpRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zZFVKQlFYVkNMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGREwwTXNRMEZCUXp0UlFVTkdMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc1owTkJRVmNzUjBGQmJFSXNWVUZCYlVJc1JVRkJWVHRSUVVNMVFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJwRUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMUZCUTNKQ0xFTkJRVU03VVVGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNM1FpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVOd1FpeERRVUZETzFGQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE4wSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRGNrSXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzBsQlEzUkNMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEN0Q1FVRlZMRWRCUVdwQ0xGVkJRV3RDTEVWQlFWVXNSVUZCUlN4TlFVRmpPMUZCUXpORExFMUJRVTBzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRhRUlzUzBGQlN5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMWxCUXpWRExFdEJRVXNzVFVGQlRTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOMlJTeExRVUZMTEUxQlFVMHNRMEZCUXl4TFFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGRGVFVXNNRUpCUVRCQ08xbEJRekZDTzJkQ1FVTkRMSGRDUVVGM1FqdG5Ra0ZEZUVJc01FSkJRVEJDTzJkQ1FVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOV0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1EwRkJRenRSUVVOSUxFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3h0UTBGQll5eEhRVUZ5UWl4VlFVRnpRaXhGUVVGVk8xRkJReTlDTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU03V1VGRE5VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNSRExFMUJRVTBzUTBGQlZTeERRVUZETEVOQlFVTTdXVUZEYmtJc1EwRkJRenRSUVVOR0xFTkJRVU03VVVGRFJDeDNRa0ZCZDBJN1VVRkRlRUlzTUVKQlFUQkNPMUZCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRWaXhOUVVGTkxFTkJRVU1zWjBKQlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRka0lzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTeG5RMEZCVnl4SFFVRnNRaXhWUVVGdFFpeEZRVUZQTzFGQlEzcENMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEV2l4TFFVRkxMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXp0WlFVTnFReXhMUVVGTExFZEJRVWNzUlVGQlJTeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJRenRaUVVNMVFpeExRVUZMTEVkQlFVY3NSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF6dFpRVU0xUWl4TFFVRkxMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVkQlFVY3NRMEZCUXp0WlFVTTFRaXhMUVVGTExFZEJRVWNzUlVGQlJTeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVNM1FpeExRVUZMTEVWQlFVVXNSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dFpRVU0xUWl4TFFVRkxMRWxCUVVrc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0WlFVTTVRanRuUWtGRFF5eDNRa0ZCZDBJN1owSkJRM2hDTERCQ1FVRXdRanRuUWtGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEVml4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dG5Ra0ZEY0VJc1EwRkJRenRSUVVOSUxFTkJRVU03U1VGRFJpeERRVUZETzBsQmRDdENSRHM3VDBGRlJ6dEpRVU5aTEc5Q1FVRlRMRWRCUVdVc1NVRkJTU3hEUVVGRE8wbEJjU3RDTjBNc2FVSkJRVU03UVVGQlJDeERRVUZETEVGQk1TdENSQ3hKUVRBclFrTTdRVUV4SzBKWkxHdENRVUZWTEdGQk1DdENkRUlzUTBGQlFUdEJRVk5FT3p0SFFVVkhPMEZCUTBnc2MwSkJRWE5DTEVsQlFWTTdTVUZET1VJc1NVRkJUU3hOUVVGTkxFZEJRV1U3VVVGRE1VSXNWVUZCVlN4RlFVRkZMRWxCUVVrN1VVRkRhRUlzVlVGQlZTeEZRVUZGTEVsQlFVazdVVUZEYUVJc1UwRkJVeXhGUVVGRkxFbEJRVWs3VVVGRFppeFRRVUZUTEVWQlFVVXNTVUZCU1R0TFFVTm1MRU5CUVVNN1NVRkZSaXgzUWtGQmQwSTdTVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03VVVGREwwSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRFJDeDNRa0ZCZDBJN1NVRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnVReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERSQ1FVRTBRaXhEUVVGRExFTkJRVU03U1VGREwwTXNRMEZCUXp0SlFVTkVMSGRDUVVGM1FqdEpRVU40UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMjVETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc05FSkJRVFJDTEVOQlFVTXNRMEZCUXp0SlFVTXZReXhEUVVGRE8wbEJSVVFzYVVKQlFXbENPMGxCUTJwQ0xFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NVVUZCVVN4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEycERMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNZMEZCWXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU42UXl4SlFVRk5MRTlCUVU4c1IwRkJVU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMWxCUXpGRExFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTnVReXgzUTBGQmQwTTdaMEpCUTNoRExIZENRVUYzUWp0blFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlV5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMnBFTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NVVUZCVVN4SFFVRkhMR2RDUVVGblFpeEhRVUZYTEU5QlFVOHNSMEZCUnl3MFFrRkJORUlzUTBGQlF5eERRVUZETzJkQ1FVTnlTQ3hEUVVGRE8xbEJRMFlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxIZENRVUYzUWp0blFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkROMElzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dFFrRkJiVUlzUjBGQlJ5eFJRVUZSTEVkQlFVY3NjVU5CUVhGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEZWtZc1EwRkJRenRuUWtGRFJDeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF6dHZRa0ZEZWtNc1NVRkJUU3hMUVVGTExFZEJRVkVzVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNNVFpeDNRa0ZCZDBJN2IwSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRek5DTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1kwRkJZeXhIUVVGSExGRkJRVkVzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJReXhEUVVGRE8yOUNRVU12Uml4RFFVRkRPMjlDUVVORUxIZENRVUYzUWp0dlFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjRRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEdOQlFXTXNSMEZCUnl4UlFVRlJMRWRCUVVjc2IwSkJRVzlDTEVOQlFVTXNRMEZCUXp0dlFrRkRMMFlzUTBGQlF6dHZRa0ZEUkN4M1FrRkJkMEk3YjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEyeERMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVVVGQlVTeEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzWTBGQll5eEhRVUZITEZGQlFWRXNSMEZCUnl4cFEwRkJhVU1zUTBGQlF5eERRVUZETzI5Q1FVTTFSeXhEUVVGRE8yOUNRVU5FTEVsQlFVMHNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRekZETEhkQ1FVRjNRanR2UWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRia0lzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4alFVRmpMRWRCUVVjc1VVRkJVU3hIUVVGSExESkRRVUV5UXl4RFFVRkRMRU5CUVVNN2IwSkJRM1JJTEVOQlFVTTdiMEpCUTBRc2QwSkJRWGRDTzI5Q1FVTjRRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTnNReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEdOQlFXTXNSMEZCUnl4UlFVRlJMRWRCUVVjc2EwTkJRV3RETEVOQlFVTXNRMEZCUXp0dlFrRkROMGNzUTBGQlF6dHZRa0ZEUkN4M1FrRkJkMEk3YjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEyeERMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVVVGQlVTeEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzWTBGQll5eEhRVUZITEZGQlFWRXNSMEZCUnl4cFEwRkJhVU1zUTBGQlF5eERRVUZETzI5Q1FVTTFSeXhEUVVGRE8yOUNRVU5FTEhkQ1FVRjNRanR2UWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NVVUZCVVN4SlFVRkpMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOMlJDeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMR05CUVdNc1IwRkJSeXhSUVVGUkxFZEJRVWNzTWtOQlFUSkRMRU5CUVVNc1EwRkJRenR2UWtGRGRFZ3NRMEZCUXp0dlFrRkRSQ3gzUWtGQmQwSTdiMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExGRkJRVkVzU1VGQlNTeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRGRrVXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhqUVVGakxFZEJRVWNzVVVGQlVTeEhRVUZITERSRFFVRTBReXhEUVVGRExFTkJRVU03YjBKQlEzWklMRU5CUVVNN2IwSkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1MwRkJTeXhKUVVGSkxFbEJRVWtzVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU0xUkN4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExFMUJRVTBzUTBGQlF6dHZRa0ZETTBJc1EwRkJRenR2UWtGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1UwRkJVeXhMUVVGTExFbEJRVWtzU1VGQlNTeE5RVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlF6VkVMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzVFVGQlRTeERRVUZETzI5Q1FVTXpRaXhEUVVGRE8yZENRVU5HTEVOQlFVTTdXVUZEUml4RFFVRkRPMUZCUTBZc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJDeHBRa0ZCYVVJN1NVRkRha0lzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEYWtNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4alFVRmpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzcERMRWxCUVUwc1QwRkJUeXhIUVVGUkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1dVRkRNVU1zZDBKQlFYZENPMWxCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpkQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzVVVGQlVTeEhRVUZITEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03V1VGRGVFVXNRMEZCUXp0WlFVTkVMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1QwRkJUeXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRPMmRDUVVONlF5eEpRVUZOTEVsQlFVa3NSMEZCUnl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzWkNMSGRDUVVGM1FqdG5Ra0ZEZWtJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETVVJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NVVUZCVVN4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRzFDUVVGdFFpeERRVUZETEVOQlFVTTdaMEpCUTJ4R0xFTkJRVU03WjBKQlEwRXNkMEpCUVhkQ08yZENRVU42UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRM0pDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExGRkJRVkVzUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eHpRa0ZCYzBJc1EwRkJReXhEUVVGRE8yZENRVU55Uml4RFFVRkRPMmRDUVVORUxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRE8yOUNRVU4wUXl4M1FrRkJkMEk3YjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NUMEZCVHl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkROVU1zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1VVRkJVU3hIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExHMUNRVUZ0UWl4RFFVRkRMRU5CUVVNN2IwSkJRekZITEVOQlFVTTdaMEpCUTBZc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eExRVUZMTEVsQlFVa3NTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEzWkVMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEZGQlFWRXNSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4elFrRkJjMElzUTBGQlF5eERRVUZETzJkQ1FVTnlSaXhEUVVGRE8yZENRVU5FTEhkQ1FVRjNRanRuUWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEUxQlFVMHNTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUzBGQlN5eEpRVUZKTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU0zUlN4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFJRVUZSTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NiVU5CUVcxRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYkVjc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1dVRkJXU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlF6TkRMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEZGQlFWRXNSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl3d1FrRkJNRUlzUTBGQlF5eERRVUZETzJkQ1FVTjZSaXhEUVVGRE8yZENRVU5FTEhkQ1FVRjNRanRuUWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPM1ZDUVVNdlJDeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVNdlJDeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRSaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4UlFVRlJMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc2QwTkJRWGRETEVOQlFVTXNRMEZCUXp0blFrRkRka2NzUTBGQlF6dG5Ra0ZEUkN4M1FrRkJkMEk3WjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpkQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRkZCUVZFc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXh6UWtGQmMwSXNRMEZCUXl4RFFVRkRPMmRDUVVOeVJpeERRVUZETzJkQ1FVTkVMSGRDUVVGM1FqdG5Ra0ZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTXhRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4UlFVRlJMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc2VVSkJRWGxDTEVOQlFVTXNRMEZCUXp0blFrRkRlRVlzUTBGQlF6dG5Ra0ZEUkN4M1FrRkJkMEk3WjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU55UXl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFJRVUZSTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NlVUpCUVhsQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVZc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOeVF5eE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhSUVVGUkxFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzZVVKQlFYbENMRU5CUVVNc1EwRkJRenRuUWtGRGVFWXNRMEZCUXp0blFrRkRSQ3gzUWtGQmQwSTdaMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnlReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4UlFVRlJMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc2VVSkJRWGxDTEVOQlFVTXNRMEZCUXp0blFrRkRlRVlzUTBGQlF6dG5Ra0ZEUkN4M1FrRkJkMEk3WjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ6dDFRa0ZETjBRc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGSExFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpOR0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRkZCUVZFc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXcyUTBGQk5rTXNRMEZCUXl4RFFVRkRPMmRDUVVNMVJ5eERRVUZETzJkQ1FVTkVMRWxCUVUwc1NVRkJTU3hIUVVGWExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03WjBKQlF6TkRMSGRDUVVGM1FqdG5Ra0ZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGFrSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzVVVGQlVTeEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEhORFFVRnpReXhEUVVGRExFTkJRVU03WjBKQlEzSkhMRU5CUVVNN1owSkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEyaENMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTEV0QlFVc3NTVUZCU1N4SlFVRkpMRWxCUVVrc1IwRkJSeXhOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkROVVFzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNN2IwSkJRekZDTEVOQlFVTTdiMEpCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNTMEZCU3l4SlFVRkpMRWxCUVVrc1NVRkJTU3hIUVVGSExFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNMVJDeE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJRenR2UWtGRE1VSXNRMEZCUXp0blFrRkRSaXhEUVVGRE8xbEJRMFlzUTBGQlF6dFJRVU5HTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF6dEJRVU5tTEVOQlFVTWlmUT09IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9iYXNpY3NcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9kYXRldGltZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vZm9ybWF0XCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vZ2xvYmFsc1wiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9wYXJzZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3BlcmlvZFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2Jhc2ljc1wiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3RpbWVzb3VyY2VcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi90aW1lem9uZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMMmx1WkdWNExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN08wZEJTVWM3UVVGRlNDeFpRVUZaTEVOQlFVTTdPenM3UVVGRllpeHBRa0ZCWXl4VlFVRlZMRU5CUVVNc1JVRkJRVHRCUVVONlFpeHBRa0ZCWXl4WlFVRlpMRU5CUVVNc1JVRkJRVHRCUVVNelFpeHBRa0ZCWXl4WlFVRlpMRU5CUVVNc1JVRkJRVHRCUVVNelFpeHBRa0ZCWXl4VlFVRlZMRU5CUVVNc1JVRkJRVHRCUVVONlFpeHBRa0ZCWXl4WFFVRlhMRU5CUVVNc1JVRkJRVHRCUVVNeFFpeHBRa0ZCWXl4alFVRmpMRU5CUVVNc1JVRkJRVHRCUVVNM1FpeHBRa0ZCWXl4VFFVRlRMRU5CUVVNc1JVRkJRVHRCUVVONFFpeHBRa0ZCWXl4VlFVRlZMRU5CUVVNc1JVRkJRVHRCUVVONlFpeHBRa0ZCWXl4VlFVRlZMRU5CUVVNc1JVRkJRVHRCUVVONlFpeHBRa0ZCWXl4alFVRmpMRU5CUVVNc1JVRkJRVHRCUVVNM1FpeHBRa0ZCWXl4WlFVRlpMRU5CUVVNc1JVRkJRVHRCUVVNelFpeHBRa0ZCWXl4bFFVRmxMRU5CUVVNc1JVRkJRU0o5Il19
