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
            return duration_1.Duration.minutes(this._zone.standardOffsetForUtc(this._utcDate));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7QUFFYixnQkFBZ0IsU0FBYyxFQUFFLE9BQWU7SUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUIsQ0FBQztBQUNGLENBQUM7QUFFRDtrQkFBZSxNQUFNLENBQUM7O0FDWnRCOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7QUFFYix1QkFBbUIsVUFBVSxDQUFDLENBQUE7QUFDOUIsMkJBQThCLGNBQWMsQ0FBQyxDQUFBO0FBQzdDLElBQVksSUFBSSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0FBQy9CLElBQVksT0FBTyxXQUFNLFdBQVcsQ0FBQyxDQUFBO0FBc0VyQzs7O0dBR0c7QUFDSCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMs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LENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RSxRQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxRQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxD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R0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFFMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFFNUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFFMUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFOUIsR0FBRyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7SUFFaEMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDM0IsR0FBRyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFM0IsR0FBRyxFQUFF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LEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztnQkFDRCx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRzt1QkFDN0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzNGLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyw2Q0FBNkMsQ0FBQyxDQUFDO2dCQUM1RyxDQUFDO2dCQUNELElBQU0sSUFBSSxHQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzNDLHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNDQUFzQyxDQUFDLENBQUM7Z0JBQ3JHLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDNUQsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzFCLENBQUM7b0JBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUM1RCxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDMUIsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNmLENBQUM7Ozs7QUN2bUREOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7QUFFYixpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxZQUFZLENBQUMsRUFBQTtBQUMzQixpQkFBYyxZQUFZLENBQUMsRUFBQTtBQUMzQixpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxXQUFXLENBQUMsRUFBQTtBQUMxQixpQkFBYyxjQUFjLENBQUMsRUFBQTtBQUM3QixpQkFBYyxTQUFTLENBQUMsRUFBQTtBQUN4QixpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxjQUFjLENBQUMsRUFBQTtBQUM3QixpQkFBYyxZQUFZLENBQUMsRUFBQTtBQUMzQixpQkFBYyxlQUFlLENBQUMsRUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTYgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uOiBhbnksIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG5cdGlmICghY29uZGl0aW9uKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3NlcnQ7XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xyXG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcblxyXG4vKipcclxuICogVXNlZCBmb3IgbWV0aG9kcyB0aGF0IHRha2UgYSB0aW1lc3RhbXAgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lQ29tcG9uZW50T3B0cyB7XHJcblx0LyoqXHJcblx0ICogWWVhciwgZGVmYXVsdCAxOTcwXHJcblx0ICovXHJcblx0eWVhcj86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBNb250aCAxLTEyLCBkZWZhdWx0IDFcclxuXHQgKi9cclxuXHRtb250aD86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBEYXkgb2YgbW9udGggMS0zMSwgZGVmYXVsdCAxXHJcblx0ICovXHJcblx0ZGF5PzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIEhvdXIgb2YgZGF5IDAtMjMsIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdGhvdXI/OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogTWludXRlIDAtNTksIGRlZmF1bHQgMFxyXG5cdCAqL1xyXG5cdG1pbnV0ZT86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBTZWNvbmQgMC01OSwgZGVmYXVsdCAwXHJcblx0ICovXHJcblx0c2Vjb25kPzogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5LCBkZWZhdWx0IDBcclxuXHQgKi9cclxuXHRtaWxsaT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWVzdGFtcCByZXByZXNlbnRlZCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRzIHtcclxuXHQvKipcclxuXHQgKiBZZWFyXHJcblx0ICovXHJcblx0eWVhcjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIDEtMTJcclxuXHQgKi9cclxuXHRtb250aDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIERheSBvZiBtb250aCAxLTMxXHJcblx0ICovXHJcblx0ZGF5OiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogSG91ciAwLTIzXHJcblx0ICovXHJcblx0aG91cjogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbnV0ZVxyXG5cdCAqL1xyXG5cdG1pbnV0ZTogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIFNlY29uZFxyXG5cdCAqL1xyXG5cdHNlY29uZDogbnVtYmVyO1xyXG5cdC8qKlxyXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICovXHJcblx0bWlsbGk6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcclxuXHRTdW5kYXksXHJcblx0TW9uZGF5LFxyXG5cdFR1ZXNkYXksXHJcblx0V2VkbmVzZGF5LFxyXG5cdFRodXJzZGF5LFxyXG5cdEZyaWRheSxcclxuXHRTYXR1cmRheVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0c1xyXG4gKi9cclxuZXhwb3J0IGVudW0gVGltZVVuaXQge1xyXG5cdE1pbGxpc2Vjb25kLFxyXG5cdFNlY29uZCxcclxuXHRNaW51dGUsXHJcblx0SG91cixcclxuXHREYXksXHJcblx0V2VlayxcclxuXHRNb250aCxcclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG5cdCAqL1xyXG5cdE1BWFxyXG59XHJcblxyXG4vKipcclxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXHJcbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcclxuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcclxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogcmV0dXJuIDE7XHJcblx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuSG91cjogcmV0dXJuIDYwICogNjAgKiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHJldHVybiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cclxuICogaWYgbmVjZXNzYXJ5LlxyXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxyXG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQ6IFRpbWVVbml0LCBhbW91bnQ6IG51bWJlciA9IDEpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzOiBzdHJpbmcpOiBUaW1lVW5pdCB7XHJcblx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG5cdFx0Y29uc3Qgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG5cdFx0aWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xyXG5cdFx0XHRyZXR1cm4gaTtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIFRydWUgaWZmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0Ly8gZnJvbSBXaWtpcGVkaWE6XHJcblx0Ly8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXHJcblx0Ly8gZWxzZSBsZWFwIHllYXJcclxuXHRpZiAoeWVhciAlIDQgIT09IDApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9IGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRzd2l0Y2ggKG1vbnRoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDM6XHJcblx0XHRjYXNlIDU6XHJcblx0XHRjYXNlIDc6XHJcblx0XHRjYXNlIDg6XHJcblx0XHRjYXNlIDEwOlxyXG5cdFx0Y2FzZSAxMjpcclxuXHRcdFx0cmV0dXJuIDMxO1xyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdGNhc2UgNjpcclxuXHRcdGNhc2UgOTpcclxuXHRcdGNhc2UgMTE6XHJcblx0XHRcdHJldHVybiAzMDtcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGg6IFwiICsgbW9udGgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XHJcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlPZlllYXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiTW9udGggb3V0IG9mIHJhbmdlXCIpO1xyXG5cdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcblx0bGV0IHllYXJEYXk6IG51bWJlciA9IDA7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IG1vbnRoOyBpKyspIHtcclxuXHRcdHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcblx0fVxyXG5cdHllYXJEYXkgKz0gKGRheSAtIDEpO1xyXG5cdHJldHVybiB5ZWFyRGF5O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XHJcblx0Y29uc3QgZW5kT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG5cdGNvbnN0IGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmID4gMCkge1xyXG5cdFx0ZGlmZiAtPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBiZWdpbk9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IDF9KTtcclxuXHRjb25zdCBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0cmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSB9KTtcclxuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcclxuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XHJcblx0cmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHt5ZWFyLCBtb250aCwgZGF5fSk7XHJcblx0Y29uc3Qgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcblx0aWYgKGRpZmYgPiAwKSB7XHJcblx0XHRkaWZmIC09IDc7XHJcblx0fVxyXG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGNvbnN0IGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuXHRjb25zdCBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdFx0Ly8gV2VlayAxXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0XHRcdGlmIChtb250aCA+IDEpIHtcclxuXHRcdFx0XHQvLyBEZWZhdWx0IGNhc2VcclxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gSmFudWFyeVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y29uc3QgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdGNvbnN0IGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcblx0Ly8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiBsYXN0IHdlZWsgb3Igd2VlayAxIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0aWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XHJcblx0XHRpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xyXG5cdFx0XHQvLyBXZWVrIDEgb2YgbmV4dCBtb250aFxyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIE5vcm1hbCBjYXNlXHJcblx0bGV0IHJlc3VsdCA9IE1hdGguZmxvb3IoKGRheSAtIGZpcnN0TW9uZGF5KSAvIDcpICsgMTtcclxuXHRpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcclxuXHRcdHJlc3VsdCArPSAxO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XHJcblx0Ly8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcclxuXHRsZXQgcmVzdWx0OiBudW1iZXIgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XHJcblx0aWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcclxuXHRcdHJlc3VsdCAtPSA3O1xyXG5cdFx0aWYgKHJlc3VsdCA8IDApIHtcclxuXHRcdFx0cmVzdWx0ICs9IGV4cG9ydHMuZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtOdW1iZXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XHJcblx0Y29uc3QgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG5cclxuXHQvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuXHRpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcblx0XHRjb25zdCBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcclxuXHRcdGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG5cdGNvbnN0IHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XHJcblx0aWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuXHRcdC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXHJcblx0XHRjb25zdCB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG5cdFx0aWYgKGRveSA8IHdlZWtUd28pIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cclxuXHRpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcblx0XHQvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxyXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcblx0fVxyXG5cclxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcblx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xyXG5cdGFzc2VydCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcclxuXHRhc3NlcnQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XHJcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogVGltZUNvbXBvbmVudHMge1xyXG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcblxyXG5cdGxldCB0ZW1wOiBudW1iZXIgPSB1bml4TWlsbGlzO1xyXG5cdGNvbnN0IHJlc3VsdDogVGltZUNvbXBvbmVudHMgPSB7IHllYXI6IDAsIG1vbnRoOiAwLCBkYXk6IDAsIGhvdXI6IDAsIG1pbnV0ZTogMCwgc2Vjb25kOiAwLCBtaWxsaTogMH07XHJcblx0bGV0IHllYXI6IG51bWJlcjtcclxuXHRsZXQgbW9udGg6IG51bWJlcjtcclxuXHJcblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG5cdFx0cmVzdWx0Lm1pbGxpID0gdGVtcCAlIDEwMDA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSB0ZW1wICUgMjQ7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTcwO1xyXG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXIrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDE7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoKys7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG5cdFx0Ly8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTY5O1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXItLTtcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDEyO1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG5cdFx0XHRtb250aC0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogRmlsbCB5b3UgYW55IG1pc3NpbmcgdGltZSBjb21wb25lbnQgcGFydHMsIGRlZmF1bHRzIGFyZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBUaW1lQ29tcG9uZW50cyB7XHJcblx0Y29uc3QgaW5wdXQgPSB7XHJcblx0XHR5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuXHRcdG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG5cdFx0ZGF5OiB0eXBlb2YgY29tcG9uZW50cy5kYXkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmRheSA6IDEsXHJcblx0XHRob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuXHRcdG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG5cdFx0c2Vjb25kOiB0eXBlb2YgY29tcG9uZW50cy5zZWNvbmQgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnNlY29uZCA6IDAsXHJcblx0XHRtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuXHR9O1xyXG5cdHJldHVybiBpbnB1dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB5ZWFyLCBtb250aCwgZGF5IGV0YyBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuICogQHBhcmFtIG1pbnV0ZVx0TWludXRlIDAtNTlcclxuICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxyXG5cdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyLCBtaWxsaTogbnVtYmVyXHJcbik6IG51bWJlcjtcclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogbnVtYmVyO1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0YTogVGltZUNvbXBvbmVudE9wdHMgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG4pOiBudW1iZXIge1xyXG5cdGNvbnN0IGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSA6IGEpO1xyXG5cdGNvbnN0IGlucHV0OiBUaW1lQ29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpO1xyXG5cdHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoXHJcblx0XHRpbnB1dC5zZWNvbmQgKyBpbnB1dC5taW51dGUgKiA2MCArIGlucHV0LmhvdXIgKiAzNjAwICsgZGF5T2ZZZWFyKGlucHV0LnllYXIsIGlucHV0Lm1vbnRoLCBpbnB1dC5kYXkpICogODY0MDAgK1xyXG5cdFx0KGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcblx0XHRNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0Y29uc3QgZXBvY2hEYXk6IFdlZWtEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG5cdHJldHVybiAoZXBvY2hEYXkgKyBkYXlzKSAlIDc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRPZkRheShob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xyXG59XHJcblxyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuXHQgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXHJcblx0ICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUNvbXBvbmVudHMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21Vbml4KHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZFx0VGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZGZcdFdoaWNoIGZ1bmN0aW9ucyB0byB0YWtlIChnZXRYKCkgb3IgZ2V0VVRDWCgpKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbURhdGUoZDogRGF0ZSwgZGY6IERhdGVGdW5jdGlvbnMpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmIChkZiA9PT0gRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuXHRcdFx0XHR5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG5cdFx0XHRcdGhvdXI6IGQuZ2V0SG91cnMoKSwgbWludXRlOiBkLmdldE1pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFNlY29uZHMoKSwgbWlsbGk6IGQuZ2V0TWlsbGlzZWNvbmRzKClcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xyXG5cdFx0XHRcdHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXHJcblx0XHRcdFx0aG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDE5NzA7XHJcblx0XHRcdGxldCBtb250aDogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGRheTogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGhvdXI6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBmcmFjdGlvbk1pbGxpczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblxyXG5cdFx0XHQvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuXHRcdFx0YXNzZXJ0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcclxuXHJcblx0XHRcdC8vIHBhcnNlIG1haW4gcGFydFxyXG5cdFx0XHRjb25zdCBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcclxuXHRcdFx0aWYgKGlzQmFzaWNGb3JtYXQpIHtcclxuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXHJcblx0XHRcdFx0XHRcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG5cclxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxyXG5cdFx0XHRcdHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcblxyXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xyXG5cdFx0XHRcdGxldCBkYXRlQW5kVGltZTogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YXNzZXJ0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Y29uc3QgZnJhY3Rpb246IG51bWJlciA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0bGV0IHVuaXhNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgfSk7XHJcblx0XHRcdHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdW5peE1pbGxpczogbnVtYmVyO1xyXG5cdHB1YmxpYyBnZXQgdW5peE1pbGxpcygpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXhNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9jb21wb25lbnRzOiBUaW1lQ29tcG9uZW50cztcclxuXHRwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKTogVGltZUNvbXBvbmVudHMge1xyXG5cdFx0aWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSB1bml4VG9UaW1lTm9MZWFwU2Vjcyh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1bml4TWlsbGlzIG1pbGxpc2Vjb25kcyBzaW5jZSAxLTEtMTk3MFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhNaWxsaXM6IG51bWJlcik7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb21wb25lbnRzIFNlcGFyYXRlIHRpbWVzdGFtcCBjb21wb25lbnRzICh5ZWFyLCBtb250aCwgLi4uKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGE6IG51bWJlciB8IFRpbWVDb21wb25lbnRPcHRzKSB7XHJcblx0XHRpZiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIpIHtcclxuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9jb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoYSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXQgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0Z2V0IGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XHJcblx0fVxyXG5cclxuXHRnZXQgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xyXG5cdH1cclxuXHJcblx0Z2V0IG1pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcblx0fVxyXG5cclxuXHRnZXQgc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdGdldCBtaWxsaSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogVGltZVN0cnVjdCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXHJcblx0ICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWxpZGF0ZSgpOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuZGF5ID49IDEgJiYgdGhpcy5jb21wb25lbnRzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoKVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kIDw9IDU5XHJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVTdHJ1Y3Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBCaW5hcnkgc2VhcmNoXHJcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcclxuICogQHBhcmFtIGNvbXBhcmUgRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIDwgMCBpZiBnaXZlbiBlbGVtZW50IGlzIGxlc3MgdGhhbiBzZWFyY2hlZCBlbGVtZW50IGV0Y1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleDxUPihhcnI6IFRbXSwgY29tcGFyZT86IChhOiBUKSA9PiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGxldCBtaW5JbmRleCA9IDA7XHJcblx0bGV0IG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XHJcblx0bGV0IGN1cnJlbnRJbmRleDogbnVtYmVyO1xyXG5cdGxldCBjdXJyZW50RWxlbWVudDogVDtcclxuXHQvLyBubyBhcnJheSAvIGVtcHR5IGFycmF5XHJcblx0aWYgKCFhcnIpIHtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdC8vIG91dCBvZiBib3VuZHNcclxuXHRpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdGlmIChjb21wYXJlKGFyclttYXhJbmRleF0pIDwgMCkge1xyXG5cdFx0cmV0dXJuIG1heEluZGV4ICsgMTtcclxuXHR9XHJcblx0Ly8gZWxlbWVudCBpbiByYW5nZVxyXG5cdHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xyXG5cdFx0Y3VycmVudEluZGV4ID0gTWF0aC5mbG9vcigobWluSW5kZXggKyBtYXhJbmRleCkgLyAyKTtcclxuXHRcdGN1cnJlbnRFbGVtZW50ID0gYXJyW2N1cnJlbnRJbmRleF07XHJcblxyXG5cdFx0aWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpIDwgMCkge1xyXG5cdFx0XHRtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDE7XHJcblx0XHR9IGVsc2UgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpID4gMCkge1xyXG5cdFx0XHRtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gY3VycmVudEluZGV4O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIG1heEluZGV4O1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIERhdGUrdGltZSt0aW1lem9uZSByZXByZXNlbnRhdGlvblxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgV2Vla0RheSwgVGltZVN0cnVjdCwgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xyXG5pbXBvcnQgeyBUaW1lU291cmNlLCBSZWFsVGltZVNvdXJjZSB9IGZyb20gXCIuL3RpbWVzb3VyY2VcIjtcclxuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcbmltcG9ydCB7IE5vcm1hbGl6ZU9wdGlvbiB9IGZyb20gXCIuL3R6LWRhdGFiYXNlXCI7XHJcbmltcG9ydCAqIGFzIGZvcm1hdCBmcm9tIFwiLi9mb3JtYXRcIjtcclxuaW1wb3J0ICogYXMgcGFyc2VGdW5jcyBmcm9tIFwiLi9wYXJzZVwiO1xyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBmcm9tWm9uZT86IFRpbWVab25lKTogVGltZVN0cnVjdCB7XHJcblx0aWYgKGZyb21ab25lKSB7XHJcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIGxvY2FsVGltZS5jbG9uZSgpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZTogVGltZVN0cnVjdCwgdG9ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcclxuXHRpZiAodG9ab25lKSB7XHJcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XHJcblx0XHRyZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB1dGNUaW1lLmNsb25lKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcclxuXHJcblx0LyoqXHJcblx0ICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdXRjRGF0ZTogVGltZVN0cnVjdDtcclxuXHRwcml2YXRlIGdldCB1dGNEYXRlKCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0aWYgKCF0aGlzLl91dGNEYXRlKSB7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGU7XHJcblx0fVxyXG5cdHByaXZhdGUgc2V0IHV0Y0RhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcclxuXHRcdHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcclxuXHRcdHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lRGF0ZTogVGltZVN0cnVjdDtcclxuXHRwcml2YXRlIGdldCB6b25lRGF0ZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuXHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlLCB0aGlzLl96b25lKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZTtcclxuXHR9XHJcblx0cHJpdmF0ZSBzZXQgem9uZURhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcclxuXHRcdHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XHJcblx0XHR0aGlzLl91dGNEYXRlID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxyXG5cdCAqIENhbiBiZSBOVUxMIGZvciB1bmF3YXJlIHRpbWVzdGFtcHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xyXG5cdCAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuXHQgKiB1c2UgdGhpcyBwcm9wZXJ0eSBmb3Igb2J0YWluaW5nIHRoZSBjdXJyZW50IHRpbWUuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB0aW1lU291cmNlOiBUaW1lU291cmNlID0gbmV3IFJlYWxUaW1lU291cmNlKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRcdGNvbnN0IG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShuLCBEYXRlRnVuY3Rpb25zLkdldCwgVGltZVpvbmUubG9jYWwoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3codGltZVpvbmU6IFRpbWVab25lID0gVGltZVpvbmUudXRjKCkpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSkudG9ab25lKHRpbWVab25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIERhdGVUaW1lIGZyb20gYSBMb3R1cyAxMjMgLyBNaWNyb3NvZnQgRXhjZWwgZGF0ZS10aW1lIHZhbHVlXHJcblx0ICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHBhcmFtIG4gZXhjZWwgZGF0ZS90aW1lIG51bWJlclxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcblx0ICogQHJldHVybnMgYSBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUV4Y2VsKG46IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XHJcblx0XHRhc3NlcnQoIWlzTmFOKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0YXNzZXJ0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcclxuXHQgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcblx0ICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxyXG5cdCAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXHJcblx0ICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZXhpc3RzKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsIG1pbGxpc2Vjb25kOiBudW1iZXIgPSAwLFxyXG5cdFx0em9uZTogVGltZVpvbmUgPSBudWxsLCBhbGxvd1ByZTE5NzA6IGJvb2xlYW4gPSBmYWxzZVxyXG5cdCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKCFpc0Zpbml0ZSh5ZWFyKSB8fCAhaXNGaW5pdGUobW9udGgpIHx8ICFpc0Zpbml0ZShkYXkpXHJcblx0XHRcdHx8ICFpc0Zpbml0ZShob3VyKSB8fCAhaXNGaW5pdGUobWludXRlKSB8fCAhaXNGaW5pdGUoc2Vjb25kKSB8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHRyeSB7XHJcblx0XHRcdGNvbnN0IGR0ID0gbmV3IERhdGVUaW1lKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSk7XHJcblx0XHRcdHJldHVybiAoeWVhciA9PT0gZHQueWVhcigpICYmIG1vbnRoID09PSBkdC5tb250aCgpICYmIGRheSA9PT0gZHQuZGF5KClcclxuXHRcdFx0XHQmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIENyZWF0ZXMgY3VycmVudCB0aW1lIGluIGxvY2FsIHRpbWV6b25lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIFBhcnNlcyBJU08gdGltZXN0YW1wIHN0cmluZy5cclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBpc29TdHJpbmdcdFN0cmluZyBpbiBJU08gODYwMSBmb3JtYXQuIEluc3RlYWQgb2YgSVNPIHRpbWUgem9uZSxcclxuXHQgKlx0XHQgaXQgbWF5IGluY2x1ZGUgYSBzcGFjZSBhbmQgdGhlbiBhbmQgSUFOQSB0aW1lIHpvbmUuXHJcblx0ICogZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwXCJcdFx0XHRcdFx0KG5vIHRpbWUgem9uZSwgbmFpdmUgZGF0ZSlcclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDArMDE6MDBcIlx0XHRcdFx0KFVUQyBvZmZzZXQgd2l0aG91dCBkYXlsaWdodCBzYXZpbmcgdGltZSlcclxuXHQgKiBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBaXCJcdFx0XHRcdFx0KFVUQylcclxuXHQgKiBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHQoSUFOQSB0aW1lIHpvbmUsIHdpdGggZGF5bGlnaHQgc2F2aW5nIHRpbWUgaWYgYXBwbGljYWJsZSlcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXHJcblx0ICpcdFx0XHRcdFx0Tm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXHJcblx0ICpcdFx0XHRcdFx0Zm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGlzb1N0cmluZzogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIHN0cmluZyBpbiBnaXZlbiBMRE1MIGZvcm1hdC5cclxuXHQgKiBOT1RFOiBkb2VzIG5vdCBoYW5kbGUgZXJhcy9xdWFydGVycy93ZWVrcy93ZWVrZGF5cy5cclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlU3RyaW5nXHREYXRlK1RpbWUgc3RyaW5nLlxyXG5cdCAqIEBwYXJhbSBmb3JtYXQgVGhlIExETUwgZm9ybWF0IHRoYXQgdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxyXG5cdCAqXHRcdFx0XHRcdE5vdGUgdGhhdCBpdCBpcyBOT1QgQ09OVkVSVEVEIHRvIHRoZSB0aW1lIHpvbmUuIFVzZWZ1bFxyXG5cdCAqXHRcdFx0XHRcdGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxyXG5cdCAqIGRhdGUuZ2V0WWVhcigpL2dldFh4eCBtZXRob2RzIG9yIHRoZSBkYXRlLmdldFVUQ1llYXIoKS9kYXRlLmdldFVUQ1h4eCBtZXRob2RzLFxyXG5cdCAqIGFuZCB0aGVuIHlvdSBzdGF0ZSB3aGljaCB0aW1lIHpvbmUgdGhhdCBkYXRlIGlzIGluLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqIE5vdGUgdGhhdCB0aGUgRGF0ZSBjbGFzcyBoYXMgYnVncyBhbmQgaW5jb25zaXN0ZW5jaWVzIHdoZW4gY29uc3RydWN0aW5nIHRoZW0gd2l0aCB0aW1lcyBhcm91bmRcclxuXHQgKiBEU1QgY2hhbmdlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlXHRBIGRhdGUgb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBnZXR0ZXJzXHRTcGVjaWZpZXMgd2hpY2ggc2V0IG9mIERhdGUgZ2V0dGVycyBjb250YWlucyB0aGUgZGF0ZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lOiB0aGVcclxuXHQgKlx0XHRcdFx0XHREYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcylcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblx0LyoqXHJcblx0ICogR2V0IGEgZGF0ZSBmcm9tIGEgVGltZVN0cnVjdFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHRtOiBUaW1lU3RydWN0LCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gTm90ZSB0aGF0IHVubGlrZSBKYXZhU2NyaXB0IGRhdGVzIHdlIHJlcXVpcmUgZmllbGRzIHRvIGJlIGluIG5vcm1hbCByYW5nZXMuXHJcblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXIgKGUuZy4gMjAxNClcclxuXHQgKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCBbMS0xMl0gKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cclxuXHQgKiBAcGFyYW0gaG91clx0VGhlIGhvdXIgb2YgdGhlIGRheSBbMC0yNClcclxuXHQgKiBAcGFyYW0gbWludXRlXHRUaGUgbWludXRlIG9mIHRoZSBob3VyIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmRcdFRoZSBtaWxsaXNlY29uZCBvZiB0aGUgc2Vjb25kIFswLTk5OV1cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUsIG9yIG51bGwgKGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcclxuXHRcdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaXNlY29uZD86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0dGhlIHRpbWUgem9uZSB0aGF0IHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBpbiAodXN1YWxseSBVVEMpLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBkbyBub3QgY2FsbFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0YTE/OiBhbnksIGEyPzogYW55LCBhMz86IGFueSxcclxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBhbnkpIHtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcclxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XHJcblx0XHRcdFx0aWYgKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0Ly8gdW5peCB0aW1lc3RhbXAgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBleHBlY3QgdW5peFRpbWVzdGFtcCB0byBiZSBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IDxUaW1lWm9uZT5hMiA6IG51bGwpO1xyXG5cdFx0XHRcdFx0bGV0IG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wOiBudW1iZXI7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSg8bnVtYmVyPmExKSkpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKDxudW1iZXI+YTEpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8geWVhciBtb250aCBkYXkgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgeWVhciB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGxldCB5ZWFyOiBudW1iZXIgPSA8bnVtYmVyPmExO1xyXG5cdFx0XHRcdFx0bGV0IG1vbnRoOiBudW1iZXIgPSA8bnVtYmVyPmEyO1xyXG5cdFx0XHRcdFx0bGV0IGRheTogbnVtYmVyID0gPG51bWJlcj5hMztcclxuXHRcdFx0XHRcdGxldCBob3VyOiBudW1iZXIgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcclxuXHRcdFx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xyXG5cdFx0XHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XHJcblx0XHRcdFx0XHRsZXQgbWlsbGk6IG51bWJlciA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XHJcblx0XHRcdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XHJcblx0XHRcdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcclxuXHRcdFx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0XHRcdG1pbGxpID0gbWF0aC5yb3VuZFN5bShtaWxsaSk7XHJcblx0XHRcdFx0XHRjb25zdCB0bSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHRtLnZhbGlkYXRlKCksIGBpbnZhbGlkIGRhdGU6ICR7dG0udG9TdHJpbmcoKX1gKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUgPyB0aW1lWm9uZSA6IG51bGwpO1xyXG5cclxuXHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0bTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYTIgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cclxuXHRcdFx0XHRcdGNvbnN0IGRhdGVTdHJpbmc6IHN0cmluZyA9IDxzdHJpbmc+YTE7XHJcblx0XHRcdFx0XHRjb25zdCBmb3JtYXRTdHJpbmc6IHN0cmluZyA9IDxzdHJpbmc+YTI7XHJcblx0XHRcdFx0XHRsZXQgem9uZTogVGltZVpvbmUgPSBudWxsO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBhMyBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHRcdHpvbmUgPSA8VGltZVpvbmU+KGEzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UoZGF0ZVN0cmluZywgZm9ybWF0U3RyaW5nLCB6b25lKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gcGFyc2VkLnRpbWU7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gcGFyc2VkLnpvbmUgfHwgbnVsbDtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc3QgZ2l2ZW5TdHJpbmcgPSAoPHN0cmluZz5hMSkudHJpbSgpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgc3M6IHN0cmluZ1tdID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIDxzdHJpbmc+YTEgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gPFRpbWVab25lPihhMik7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUuem9uZShzc1sxXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcclxuXHRcdFx0XHRcdC8vIChmcmVlIG9mIERhdGUgcXVpcmtzKVxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xyXG5cdFx0XHRcdGlmIChhMSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gYTEuY2xvbmUoKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IG51bGwpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsXHJcblx0XHRcdFx0XHRcdFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZm9yIGEgRGF0ZSBvYmplY3QgYSBEYXRlRnVuY3Rpb25zIG11c3QgYmUgcGFzc2VkIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCghYTMgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aW1lWm9uZSBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZDogRGF0ZSA9IDxEYXRlPihhMSk7XHJcblx0XHRcdFx0XHRjb25zdCBkazogRGF0ZUZ1bmN0aW9ucyA9IDxEYXRlRnVuY3Rpb25zPihhMik7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiBudWxsKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XHJcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS5sb2NhbCgpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZGF0ZSBpcyBpbi4gTWF5IGJlIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBab25lIG5hbWUgYWJicmV2aWF0aW9uIGF0IHRoaXMgdGltZVxyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKiBAcmV0dXJuIFRoZSBhYmJyZXZpYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZUFiYnJldmlhdGlvbihkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcclxuXHRcdGlmICh0aGlzLnpvbmUoKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy56b25lKCkuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgYXMgYSBEdXJhdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhNYXRoLnJvdW5kKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBzdGFuZGFyZCBvZmZzZXQgV0lUSE9VVCBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldER1cmF0aW9uKCk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy5fdXRjRGF0ZSkpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcblx0ICovXHJcblx0cHVibGljIHllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubW9udGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmRheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBob3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIHNlY29uZHMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuXHQgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrRGF5KCk6IFdlZWtEYXkge1xyXG5cdFx0cmV0dXJuIDxXZWVrRGF5PmJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5T2ZZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS55ZWFyRGF5KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuXHQgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla051bWJlcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrT2ZNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcblx0ICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZE9mRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gTWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwWlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1bml4VXRjTWlsbGlzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1llYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNIb3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIHNlY29uZHMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNTZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjRGF5T2ZZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaWxsaXNlY29uZHMgMC05OTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIFVUQyBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuXHQgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrT2ZNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcblx0ICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cclxuXHQgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cclxuXHQgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxyXG5cdCAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHdpdGhab25lKHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksXHJcblx0XHRcdHpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxyXG5cdCAqIFRocm93cyBpZiB0aGlzIGRhdGUgZG9lcyBub3QgaGF2ZSBhIHRpbWUgem9uZS5cclxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgY29udmVydCh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpOyAvLyBjYXVzZSB6b25lIC0+IHV0YyBjb252ZXJzaW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCF0aGlzLl96b25lRGF0ZSkge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fem9uZSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcblx0ICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cclxuXHQgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHpvbmUpIHtcclxuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG5cdFx0XHRjb25zdCByZXN1bHQgPSBuZXcgRGF0ZVRpbWUoKTtcclxuXHRcdFx0cmVzdWx0LnV0Y0RhdGUgPSB0aGlzLnV0Y0RhdGU7XHJcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cclxuXHQgKiBVbmxlc3MgdGhlIHRpbWV6b25lIGlzIGxvY2FsLCB0aGUgRGF0ZS5nZXRVVENYKCkgbWV0aG9kcyB3aWxsIE5PVCBiZSBjb3JyZWN0LlxyXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9EYXRlKCk6IERhdGUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLFxyXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxyXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUpOiBudW1iZXIge1xyXG5cdFx0bGV0IGR0OiBEYXRlVGltZSA9IHRoaXM7XHJcblx0XHRpZiAodGltZVpvbmUgJiYgIXRpbWVab25lLmVxdWFscyh0aGlzLnpvbmUoKSkpIHtcclxuXHRcdFx0ZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0XHR9XHJcblx0XHRjb25zdCBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuXHRcdGNvbnN0IHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNFeGNlbCgpOiBudW1iZXIge1xyXG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfdW5peFRpbWVTdGFtcFRvRXhjZWwobjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcblx0XHRjb25zdCBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgdGltZSBkdXJhdGlvbiByZWxhdGl2ZSB0byBVVEMuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKiBAcmV0dXJuIHRoaXMgKyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIHV0Y0hvdXIoKSBmaWVsZCwgYWRkaW5nIDEgbW9udGhcclxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxyXG5cdCAqIEFkZGluZyBhbiBhbW91bnQgb2YgdW5pdHMgbGVhdmVzIGxvd2VyIHVuaXRzIGludGFjdC4gRS5nLlxyXG5cdCAqIGFkZGluZyBhIG1vbnRoIHdpbGwgbGVhdmUgdGhlIGRheSgpIGZpZWxkIHVudG91Y2hlZCBpZiBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcclxuXHQgKiB0aGUgc3RhcnQgZGF0ZSB3YXMgYXQgdGhlIGVuZCBvZiBhIG1vbnRoLCBpLmUuIGNvbnRyYXJ5IHRvIEphdmFTY3JpcHRcclxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxyXG5cdCAqXHJcblx0ICogSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHV0YyB0aW1lIGZpZWxkcyBhcmUgc3RpbGwgdW50b3VjaGVkIGJ1dCBsb2NhbFxyXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEltcGxlbWVudGF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIHpvbmUgdGltZSwgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxyXG5cdCAqIGRhdGUgYnkgb25lLiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdGltZSBmaWVsZHMgbWF5IGFkZGl0aW9uYWxseVxyXG5cdCAqIGluY3JlYXNlIGJ5IHRoZSBEU1Qgb2Zmc2V0LCBpZiBhIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lIHdvdWxkXHJcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgYSB1bml0IG9mIHRpbWUgd2lsbCBsZWF2ZSBsb3dlci11bml0IGZpZWxkcyBpbnRhY3QsIHVubGVzcyB0aGUgcmVzdWx0XHJcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICovXHJcblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgYWRkTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xyXG5cdFx0bGV0IHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG5cdFx0XHRjb25zdCBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG5vcm1hbGl6ZWQsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcclxuXHQgKiBuZWNlc3NhcnkuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcclxuXHRcdGxldCB5ZWFyOiBudW1iZXI7XHJcblx0XHRsZXQgbW9udGg6IG51bWJlcjtcclxuXHRcdGxldCBkYXk6IG51bWJlcjtcclxuXHRcdGxldCBob3VyOiBudW1iZXI7XHJcblx0XHRsZXQgbWludXRlOiBudW1iZXI7XHJcblx0XHRsZXQgc2Vjb25kOiBudW1iZXI7XHJcblx0XHRsZXQgbWlsbGk6IG51bWJlcjtcclxuXHJcblx0XHRzd2l0Y2ggKHVuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50KSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAxMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuV2VlazpcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xyXG5cdFx0XHRcdC8vIGtlZXAgdGhlIGRheS1vZi1tb250aCB0aGUgc2FtZSAoY2xhbXAgdG8gZW5kLW9mLW1vbnRoKVxyXG5cdFx0XHRcdGlmIChhbW91bnQgPj0gMCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcclxuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG5cdFx0XHRcdG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiB5ZWFyc1wiKTtcclxuXHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xyXG5cdFx0XHRcdG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuXHRcdFx0XHRkYXkgPSBNYXRoLm1pbih0bS5jb21wb25lbnRzLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XHJcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuXHRcdFx0XHRtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuXHRcdFx0XHRzZWNvbmQgPSB0bS5jb21wb25lbnRzLnNlY29uZDtcclxuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGQoLTEqZHVyYXRpb24pOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIiAmJiBhMSBpbnN0YW5jZW9mIER1cmF0aW9uKSB7XHJcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0Y29uc3QgYW1vdW50OiBudW1iZXIgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZExvY2FsKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWJMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKCg8RHVyYXRpb24+YTEpLm11bHRpcGx5KC0xKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIDxudW1iZXI+YTEsIHVuaXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xyXG5cdCAqIEByZXR1cm4gdGhpcyAtIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGRpZmYob3RoZXI6IERhdGVUaW1lKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcclxuXHQqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQqL1xyXG5cdHB1YmxpYyBzdGFydE9mRGF5KCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnRPZk1vbnRoKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mWWVhcigpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDw9IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLnpvbmVEYXRlLmVxdWFscyhvdGhlci56b25lRGF0ZSlcclxuXHRcdFx0JiYgKHRoaXMuX3pvbmUgPT09IG51bGwpID09PSAob3RoZXIuX3pvbmUgPT09IG51bGwpXHJcblx0XHRcdCYmICh0aGlzLl96b25lID09PSBudWxsIHx8IHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSlcclxuXHRcdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID4gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1pbihvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHJldHVybiBzICsgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXHJcblx0ICogc3BlY2lmaWVkIGZvcm1hdC4gVGhlIGZvcm1hdCBpcyBpbXBsZW1lbnRlZCBhcyB0aGUgTERNTCBzdGFuZGFyZFxyXG5cdCAqIChodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF9QYXR0ZXJucylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxyXG5cdCAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE9wdGlvbmFsLCBub24tZW5nbGlzaCBmb3JtYXQgbW9udGggbmFtZXMgZXRjLlxyXG5cdCAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIGZvcm1hdChmb3JtYXRTdHJpbmc6IHN0cmluZywgZm9ybWF0T3B0aW9ucz86IGZvcm1hdC5Gb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy56b25lKCksIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSBhIGRhdGUgaW4gYSBnaXZlbiBmb3JtYXRcclxuXHQgKiBAcGFyYW0gcyB0aGUgc3RyaW5nIHRvIHBhcnNlXHJcblx0ICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW5cclxuXHQgKiBAcGFyYW0gem9uZSBPcHRpb25hbCwgdGhlIHpvbmUgdG8gYWRkIChpZiBubyB6b25lIGlzIGdpdmVuIGluIHRoZSBzdHJpbmcpXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBwYXJzZShzOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKHMsIGZvcm1hdCwgem9uZSk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHBhcnNlZC50aW1lLCBwYXJzZWQuem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXHJcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMuMDAwIEV1cm9wZS9BbXN0ZXJkYW1cIlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgczogc3RyaW5nID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0aWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSBUaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XHJcblx0XHRcdFx0cmV0dXJuIHMgKyBcIiBcIiArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gc2VwYXJhdGUgSUFOQSBuYW1lIG9yIFwibG9jYWx0aW1lXCIgd2l0aCBhIHNwYWNlXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltEYXRlVGltZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xyXG5cdFx0cmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyBpbiBVVEMgd2l0aG91dCB0aW1lIHpvbmUgaW5mb1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1V0Y1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShzOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcblx0XHRjb25zdCB0cmltbWVkID0gcy50cmltKCk7XHJcblx0XHRjb25zdCByZXN1bHQgPSBbXCJcIiwgXCJcIl07XHJcblx0XHRsZXQgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwid2l0aG91dCBEU1RcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRjb25zdCByZXN1bHQgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XHJcblx0XHRcdHJlc3VsdFsxXSArPSBcIiB3aXRob3V0IERTVFwiO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XHJcblx0XHRpZiAoaW5kZXggPCA4KSB7XHJcblx0XHRcdGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxyXG5cdFx0fVxyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRyZXN1bHRbMF0gPSB0cmltbWVkO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSBkdXJhdGlvblxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcclxuXHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB5ZWFycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLnllYXJzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1vbnRocyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLm1vbnRocyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5kYXlzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBob3VycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLmhvdXJzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWludXRlcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24uc2Vjb25kcyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5taWxsaXNlY29uZHMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cclxuICogJzEgTW9udGgnIG9yICcxNjYgU2Vjb25kcycuIFRoZSB1bml0IGlzIHByZXNlcnZlZCB0aHJvdWdoIGNhbGN1bGF0aW9ucy5cclxuICpcclxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XHJcbiAqIC0gc2Vjb25kKCksIG1pbnV0ZSgpLCBob3VyKCkgZXRjLCBzaW5ndWxhciBmb3JtOiB0aGVzZSBjYW4gYmUgdXNlZCB0byBjcmVhdGUgc3RyaW5nIHJlcHJlc2VudGF0aW9ucy5cclxuICogICBUaGVzZSByZXR1cm4gYSBwYXJ0IG9mIHlvdXIgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiBFLmcuIGZvciAyNTAwIG1pbGxpc2Vjb25kcywgdGhlIG1pbGxpc2Vjb25kKCkgcGFydCB3b3VsZCBiZSA1MDBcclxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIER1cmF0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogR2l2ZW4gYW1vdW50IGluIGNvbnN0cnVjdG9yXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYW1vdW50OiBudW1iZXI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVuaXRcclxuXHQgKi9cclxuXHRwcml2YXRlIF91bml0OiBUaW1lVW5pdDtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB5ZWFycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LlllYXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG1vbnRocyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1vbnRoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGRheXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5EYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBob3VycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkhvdXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbWludXRlcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbnV0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuU2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBtaWxsaXNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uIG9mIDBcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcigpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uIGZyb20gYSBzdHJpbmcgaW4gb25lIG9mIHR3byBmb3JtYXRzOlxyXG5cdCAqIDEpIFstXWhoaGhbOm1tWzpzc1subm5uXV1dIGUuZy4gJy0wMTowMDozMC41MDEnXHJcblx0ICogMikgYW1vdW50IGFuZCB1bml0IGUuZy4gJy0xIGRheXMnIG9yICcxIHllYXInLiBUaGUgdW5pdCBtYXkgYmUgaW4gc2luZ3VsYXIgb3IgcGx1cmFsIGZvcm0gYW5kIGlzIGNhc2UtaW5zZW5zaXRpdmVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihpbnB1dDogc3RyaW5nKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgZHVyYXRpb24gZnJvbSBhbiBhbW91bnQgYW5kIGEgdGltZSB1bml0LlxyXG5cdCAqIEBwYXJhbSBhbW91bnRcdE51bWJlciBvZiB1bml0c1xyXG5cdCAqIEBwYXJhbSB1bml0XHRBIHRpbWUgdW5pdCBpLmUuIFRpbWVVbml0LlNlY29uZCwgVGltZVVuaXQuSG91ciBldGMuIERlZmF1bHQgTWlsbGlzZWNvbmQuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoYW1vdW50OiBudW1iZXIsIHVuaXQ/OiBUaW1lVW5pdCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaTE/OiBhbnksIHVuaXQ/OiBUaW1lVW5pdCkge1xyXG5cdFx0aWYgKHR5cGVvZiAoaTEpID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXHJcblx0XHRcdGNvbnN0IGFtb3VudCA9IDxudW1iZXI+aTE7XHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuXHRcdFx0dGhpcy5fdW5pdCA9ICh0eXBlb2YgdW5pdCA9PT0gXCJudW1iZXJcIiA/IHVuaXQgOiBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiAoaTEpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8vIHN0cmluZyBjb25zdHJ1Y3RvclxyXG5cdFx0XHR0aGlzLl9mcm9tU3RyaW5nKDxzdHJpbmc+aTEpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZGVmYXVsdCBjb25zdHJ1Y3RvclxyXG5cdFx0XHR0aGlzLl9hbW91bnQgPSAwO1xyXG5cdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIGFub3RoZXIgaW5zdGFuY2Ugb2YgRHVyYXRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgY2xvbmUoKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQsIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIGR1cmF0aW9uIGV4cHJlc3NlZCBpbiBkaWZmZXJlbnQgdW5pdCAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpLlxyXG5cdCAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cclxuXHQgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgYXModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBUaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IFRpbWVVbml0Lk1vbnRoKSB7XHJcblx0XHRcdGNvbnN0IHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcblx0XHRcdGNvbnN0IHJlcU1vbnRocyA9ICh1bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNb250aHMgLyByZXFNb250aHM7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG5cdFx0XHRjb25zdCByZXFNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCk7XHJcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRoaXMgZHVyYXRpb24gdG8gYSBEdXJhdGlvbiBpbiBhbm90aGVyIHVuaXQuIFlvdSBhbHdheXMgZ2V0IGEgY2xvbmUgZXZlbiBpZiB5b3Ugc3BlY2lmeVxyXG5cdCAqIHRoZSBzYW1lIHVuaXQuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb252ZXJ0KHVuaXQ6IFRpbWVVbml0KTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLmFzKHVuaXQpLCB1bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSlcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaWxsaXNlY29uZHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtaWxsaXNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmRzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbnV0ZXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWludXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtaW51dGUgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBob3VycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGhvdXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Ib3VyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBob3VyIHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBkYXkgaGFzIDI0IGhvdXJzICh3aGljaCBpcyBub3QgdGhlIGNhc2VcclxuXHQgKiBkdXJpbmcgRFNUIGNoYW5nZXMpLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBob3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Ib3VyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBob3VyIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpLlxyXG5cdCAqIE5vdGUgdGhhdCB0aGlzIHBhcnQgY2FuIGV4Y2VlZCAyMyBob3VycywgYmVjYXVzZSBmb3JcclxuXHQgKiBub3csIHdlIGRvIG5vdCBoYXZlIGEgZGF5cygpIGZ1bmN0aW9uXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMjUgZm9yIGEgLTI1OjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3aG9sZUhvdXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAzNjAwMDAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXlzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5EYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGRheSBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgbW9udGggaGFzIDMwIGRheXMuXHJcblx0ICovXHJcblx0cHVibGljIGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuRGF5KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcblx0ICovXHJcblx0cHVibGljIG1vbnRocygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTW9udGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1vbnRoIHBhcnQgb2YgYSBkdXJhdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1vbnRoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4geWVhcnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFycygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuWWVhcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb24tZnJhY3Rpb25hbCBwb3NpdGl2ZSB5ZWFyc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB3aG9sZVllYXJzKCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhcikge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDEyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvXHJcblx0XHRcdFx0YmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoVGltZVVuaXQuWWVhcikpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQW1vdW50IG9mIHVuaXRzIChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKi9cclxuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHVuaXQgdGhpcyBkdXJhdGlvbiB3YXMgY3JlYXRlZCB3aXRoXHJcblx0ICovXHJcblx0cHVibGljIHVuaXQoKTogVGltZVVuaXQge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaWduXHJcblx0ICogQHJldHVybiBcIi1cIiBpZiB0aGUgZHVyYXRpb24gaXMgbmVnYXRpdmVcclxuXHQgKi9cclxuXHRwdWJsaWMgc2lnbigpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuICh0aGlzLl9hbW91bnQgPCAwID8gXCItXCIgOiBcIlwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRjb25zdCBjb252ZXJ0ZWQgPSBvdGhlci5jb252ZXJ0KHRoaXMuX3VuaXQpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gY29udmVydGVkLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IGNvbnZlcnRlZC51bml0KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXHJcblx0ICogUmV0dXJucyBmYWxzZSBpZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgZXF1YWwgaW4gYWxsIHRpbWUgem9uZXNcclxuXHQgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHNFeGFjdChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBUaW1lVW5pdC5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0IDw9IFRpbWVVbml0LkRheSAmJiBvdGhlci51bml0KCkgPCBUaW1lVW5pdC5EYXkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSAobW9zdCBwb3NpdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4KG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIG11bHRpcGx5KHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZSBieSBhIHVuaXRsZXNzIG51bWJlci4gVGhlIHJlc3VsdCBpcyBhIER1cmF0aW9uLCBlLmcuIDEgeWVhciAvIDIgPSAwLjUgeWVhclxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb247XHJcblx0LyoqXHJcblx0ICogRGl2aWRlIHRoaXMgRHVyYXRpb24gYnkgYSBEdXJhdGlvbi4gVGhlIHJlc3VsdCBpcyBhIHVuaXRsZXNzIG51bWJlciBlLmcuIDEgeWVhciAvIDEgbW9udGggPSAxMlxyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogRHVyYXRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyIHwgRHVyYXRpb24pOiBEdXJhdGlvbiB8IG51bWJlciB7XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvIGR1cmF0aW9uXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSBkdXJhdGlvbi5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdCBhIGR1cmF0aW9uLlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHN1Yih2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYnMoKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXHJcblx0ICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0Z1bGxTdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cclxuXHQgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcclxuXHQgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0htc1N0cmluZyhmdWxsOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHRcdGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5zZWNvbmQoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcblx0XHRcdHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0c3dpdGNoICh0aGlzLl91bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BhcnQodW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAodW5pdCA9PT0gVGltZVVuaXQuWWVhcikge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLmFzKFRpbWVVbml0LlllYXIpKSk7XHJcblx0XHR9XHJcblx0XHRsZXQgbmV4dFVuaXQ6IFRpbWVVbml0O1xyXG5cdFx0Ly8gbm90ZSBub3QgYWxsIHVuaXRzIGFyZSB1c2VkIGhlcmU6IFdlZWtzIGFuZCBZZWFycyBhcmUgcnVsZWQgb3V0XHJcblx0XHRzd2l0Y2ggKHVuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogbmV4dFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogbmV4dFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Ib3VyOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiBuZXh0VW5pdCA9IFRpbWVVbml0LkRheTsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiBuZXh0VW5pdCA9IFRpbWVVbml0Lk1vbnRoOyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDogbmV4dFVuaXQgPSBUaW1lVW5pdC5ZZWFyOyBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBtc2VjcyA9IChiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpICUgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMobmV4dFVuaXQpO1xyXG5cdFx0cmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XHJcblx0fVxyXG5cclxuXHJcblx0cHJpdmF0ZSBfZnJvbVN0cmluZyhzOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuXHRcdGlmICh0cmltbWVkLm1hdGNoKC9eLT9cXGRcXGQ/KDpcXGRcXGQ/KDpcXGRcXGQ/KC5cXGRcXGQ/XFxkPyk/KT8pPyQvKSkge1xyXG5cdFx0XHRsZXQgc2lnbjogbnVtYmVyID0gMTtcclxuXHRcdFx0bGV0IGhvdXJzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcclxuXHRcdFx0bGV0IHNlY29uZHM6IG51bWJlciA9IDA7XHJcblx0XHRcdGxldCBtaWxsaXNlY29uZHM6IG51bWJlciA9IDA7XHJcblx0XHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xyXG5cdFx0XHRhc3NlcnQocGFydHMubGVuZ3RoID4gMCAmJiBwYXJ0cy5sZW5ndGggPCA0LCBcIk5vdCBhIHByb3BlciB0aW1lIGR1cmF0aW9uIHN0cmluZzogXFxcIlwiICsgdHJpbW1lZCArIFwiXFxcIlwiKTtcclxuXHRcdFx0aWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xyXG5cdFx0XHRcdHNpZ24gPSAtMTtcclxuXHRcdFx0XHRwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdGhvdXJzID0gK3BhcnRzWzBdO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XHJcblx0XHRcdFx0bWludXRlcyA9ICtwYXJ0c1sxXTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMikge1xyXG5cdFx0XHRcdGNvbnN0IHNlY29uZFBhcnRzID0gcGFydHNbMl0uc3BsaXQoXCIuXCIpO1xyXG5cdFx0XHRcdHNlY29uZHMgPSArc2Vjb25kUGFydHNbMF07XHJcblx0XHRcdFx0aWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRcdG1pbGxpc2Vjb25kcyA9ICtzdHJpbmdzLnBhZFJpZ2h0KHNlY29uZFBhcnRzWzFdLCAzLCBcIjBcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnN0IGFtb3VudE1zZWMgPSBzaWduICogTWF0aC5yb3VuZChtaWxsaXNlY29uZHMgKyAxMDAwICogc2Vjb25kcyArIDYwMDAwICogbWludXRlcyArIDM2MDAwMDAgKiBob3Vycyk7XHJcblx0XHRcdC8vIGZpbmQgbG93ZXN0IG5vbi16ZXJvIG51bWJlciBhbmQgdGFrZSB0aGF0IGFzIHVuaXRcclxuXHRcdFx0aWYgKG1pbGxpc2Vjb25kcyAhPT0gMCkge1xyXG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdFx0fSBlbHNlIGlmIChzZWNvbmRzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0fSBlbHNlIGlmIChtaW51dGVzICE9PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0fSBlbHNlIGlmIChob3VycyAhPT0gMCkge1xyXG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnRNc2VjIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCBzcGxpdCA9IHRyaW1tZWQudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcblx0XHRcdGlmIChzcGxpdC5sZW5ndGggIT09IDIpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc3QgYW1vdW50ID0gcGFyc2VGbG9hdChzcGxpdFswXSk7XHJcblx0XHRcdGFzc2VydCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XHJcblx0XHRcdGFzc2VydChpc0Zpbml0ZShhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgYW1vdW50IGlzIGluZmluaXRlXCIpO1xyXG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgVG9rZW5pemVyLCBUb2tlbiwgRGF0ZVRpbWVUb2tlblR5cGUgYXMgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcclxuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XHJcbmltcG9ydCB7IFRpbWVab25lIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdE9wdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcclxuXHQgKi9cclxuXHRxdWFydGVyTGV0dGVyPzogc3RyaW5nO1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB3b3JkIGZvciAncXVhcnRlcidcclxuXHQgKi9cclxuXHRxdWFydGVyV29yZD86IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBRdWFydGVyIGFiYnJldmlhdGlvbnMgZS5nLiAxc3QsIDJuZCwgM3JkLCA0dGhcclxuXHQgKi9cclxuXHRxdWFydGVyQWJicmV2aWF0aW9ucz86IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBNb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdGxvbmdNb250aE5hbWVzPzogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogVGhyZWUtbGV0dGVyIG1vbnRoIG5hbWVzXHJcblx0ICovXHJcblx0c2hvcnRNb250aE5hbWVzPzogc3RyaW5nW107XHJcblx0LyoqXHJcblx0ICogTW9udGggbGV0dGVyc1xyXG5cdCAqL1xyXG5cdG1vbnRoTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBXZWVrIGRheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBzdW5kYXlcclxuXHQgKi9cclxuXHRsb25nV2Vla2RheU5hbWVzPzogc3RyaW5nW107XHJcblx0c2hvcnRXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cdHdlZWtkYXlMZXR0ZXJzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX01PTlRIX05BTUVTID1cclxuXHRbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBTSE9SVF9NT05USF9OQU1FUyA9XHJcblx0W1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1PTlRIX0xFVFRFUlMgPVxyXG5cdFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX1dFRUtEQVlfTkFNRVMgPVxyXG5cdFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNIT1JUX1dFRUtEQVlfTkFNRVMgPVxyXG5cdFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBXRUVLREFZX1RXT19MRVRURVJTID1cclxuXHRbXCJTdVwiLCBcIk1vXCIsIFwiVHVcIiwgXCJXZVwiLCBcIlRoXCIsIFwiRnJcIiwgXCJTYVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBXRUVLREFZX0xFVFRFUlMgPVxyXG5cdFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XHJcblxyXG5leHBvcnQgY29uc3QgUVVBUlRFUl9MRVRURVIgPSBcIlFcIjtcclxuZXhwb3J0IGNvbnN0IFFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xyXG5leHBvcnQgY29uc3QgUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gW1wiMXN0XCIsIFwiMm5kXCIsIFwiM3JkXCIsIFwiNHRoXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRk9STUFUX09QVElPTlM6IEZvcm1hdE9wdGlvbnMgPSB7XHJcblx0cXVhcnRlckxldHRlcjogUVVBUlRFUl9MRVRURVIsXHJcblx0cXVhcnRlcldvcmQ6IFFVQVJURVJfV09SRCxcclxuXHRxdWFydGVyQWJicmV2aWF0aW9uczogUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxyXG5cdGxvbmdNb250aE5hbWVzOiBMT05HX01PTlRIX05BTUVTLFxyXG5cdHNob3J0TW9udGhOYW1lczogU0hPUlRfTU9OVEhfTkFNRVMsXHJcblx0bW9udGhMZXR0ZXJzOiBNT05USF9MRVRURVJTLFxyXG5cdGxvbmdXZWVrZGF5TmFtZXM6IExPTkdfV0VFS0RBWV9OQU1FUyxcclxuXHRzaG9ydFdlZWtkYXlOYW1lczogU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuXHR3ZWVrZGF5VHdvTGV0dGVyczogV0VFS0RBWV9UV09fTEVUVEVSUyxcclxuXHR3ZWVrZGF5TGV0dGVyczogV0VFS0RBWV9MRVRURVJTXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChcclxuXHRkYXRlVGltZTogVGltZVN0cnVjdCxcclxuXHR1dGNUaW1lOiBUaW1lU3RydWN0LFxyXG5cdGxvY2FsWm9uZTogVGltZVpvbmUsXHJcblx0Zm9ybWF0U3RyaW5nOiBzdHJpbmcsXHJcblx0Zm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyA9IHt9XHJcbik6IHN0cmluZyB7XHJcblx0Ly8gbWVyZ2UgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IGZvcm1hdCBvcHRpb25zXHJcblx0Ly8gdHlwZWNhc3QgdG8gcHJldmVudCBlcnJvciBUUzcwMTc6IEluZGV4IHNpZ25hdHVyZSBvZiBvYmplY3QgdHlwZSBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLlxyXG5cdGNvbnN0IGdpdmVuRm9ybWF0T3B0aW9uczogYW55ID0gZm9ybWF0T3B0aW9ucztcclxuXHRjb25zdCBkZWZhdWx0Rm9ybWF0T3B0aW9uczogYW55ID0gREVGQVVMVF9GT1JNQVRfT1BUSU9OUztcclxuXHRjb25zdCBtZXJnZWRGb3JtYXRPcHRpb25zOiBhbnkgPSB7fTtcclxuXHRmb3IgKGNvbnN0IG5hbWUgaW4gREVGQVVMVF9GT1JNQVRfT1BUSU9OUykge1xyXG5cdFx0aWYgKERFRkFVTFRfRk9STUFUX09QVElPTlMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuXHRcdFx0Y29uc3QgZ2l2ZW5Gb3JtYXRPcHRpb246IGFueSA9IGdpdmVuRm9ybWF0T3B0aW9uc1tuYW1lXTtcclxuXHRcdFx0Y29uc3QgZGVmYXVsdEZvcm1hdE9wdGlvbjogYW55ID0gZGVmYXVsdEZvcm1hdE9wdGlvbnNbbmFtZV07XHJcblx0XHRcdG1lcmdlZEZvcm1hdE9wdGlvbnNbbmFtZV0gPSBnaXZlbkZvcm1hdE9wdGlvbiB8fCBkZWZhdWx0Rm9ybWF0T3B0aW9uO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3JtYXRPcHRpb25zID0gbWVyZ2VkRm9ybWF0T3B0aW9ucztcclxuXHJcblx0Y29uc3QgdG9rZW5pemVyID0gbmV3IFRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG5cdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xyXG5cdFx0bGV0IHRva2VuUmVzdWx0OiBzdHJpbmc7XHJcblx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5ZRUFSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFS0RBWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5aT05FOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuSURFTlRJVFk6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQgKz0gdG9rZW5SZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0LnRyaW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZXJhIChCQyBvciBBRClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RXJhKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGNvbnN0IEFEOiBib29sZWFuID0gZGF0ZVRpbWUueWVhciA+IDA7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIChBRCA/IFwiQURcIiA6IFwiQkNcIik7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiAoQUQgPyBcIkFubm8gRG9taW5pXCIgOiBcIkJlZm9yZSBDaHJpc3RcIik7XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFllYXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJ5XCI6XHJcblx0XHRjYXNlIFwiWVwiOlxyXG5cdFx0Y2FzZSBcInJcIjpcclxuXHRcdFx0bGV0IHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcclxuXHRcdFx0XHR5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB5ZWFyVmFsdWU7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBxdWFydGVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0Y29uc3QgcXVhcnRlciA9IE1hdGguY2VpbChkYXRlVGltZS5tb250aCAvIDMpO1xyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5xdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGZvcm1hdE9wdGlvbnMucXVhcnRlcldvcmQ7XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbW9udGhcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLm1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiZFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJEXCI6XHJcblx0XHRcdGNvbnN0IGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHdlZWtEYXlOdW1iZXIgPSBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcyk7XHJcblxyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XHJcblx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcykudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdH0gLy8gTm8gYnJlYWssIHRoaXMgaXMgaW50ZW50aW9uYWwgZmFsbHRocm91Z2ghXHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5sb25nV2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0Y2FzZSA1OlxyXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5TGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdGNhc2UgNjpcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheVR3b0xldHRlcnNbd2Vla0RheU51bWJlcl07XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRyZXR1cm4gKGRhdGVUaW1lLmhvdXIgPCAxMiA/IFwiQU1cIiA6IFwiUE1cIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIEhvdXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRsZXQgaG91ciA9IGRhdGVUaW1lLmhvdXI7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJoXCI6XHJcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XHJcblx0XHRcdGlmIChob3VyID09PSAwKSB7XHJcblx0XHRcdFx0aG91ciA9IDEyO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiSFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiS1wiOlxyXG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwia1wiOlxyXG5cdFx0XHRpZiAoaG91ciA9PT0gMCkge1xyXG5cdFx0XHRcdGhvdXIgPSAyNDtcclxuXHRcdFx0fTtcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbWludXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcInNcIjpcclxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiU1wiOlxyXG5cdFx0XHRjb25zdCBmcmFjdGlvbiA9IGRhdGVUaW1lLm1pbGxpO1xyXG5cdFx0XHRsZXQgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQoZnJhY3Rpb24udG9TdHJpbmcoKSwgMywgXCIwXCIpO1xyXG5cdFx0XHRmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkUmlnaHQoZnJhY3Rpb25TdHJpbmcsIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0XHRyZXR1cm4gZnJhY3Rpb25TdHJpbmcuc2xpY2UoMCwgdG9rZW4ubGVuZ3RoKTtcclxuXHRcdGNhc2UgXCJBXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLnNlY29uZE9mRGF5KGRhdGVUaW1lLmhvdXIsIGRhdGVUaW1lLm1pbnV0ZSwgZGF0ZVRpbWUuc2Vjb25kKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHRpbWUgem9uZS4gRm9yIHRoaXMsIHdlIG5lZWQgdGhlIGN1cnJlbnQgdGltZSwgdGhlIHRpbWUgaW4gVVRDIGFuZCB0aGUgdGltZSB6b25lXHJcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSB6b25lIFRoZSB0aW1lem9uZSBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWU6IFRpbWVTdHJ1Y3QsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHpvbmU6IFRpbWVab25lLCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGlmICghem9uZSkge1xyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG5cclxuXHRjb25zdCBvZmZzZXRIb3VyczogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0b2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcblx0Y29uc3Qgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZztcclxuXHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJPXCI6XHJcblx0XHRcdHJlc3VsdCA9IFwiVVRDXCI7XHJcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIitcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0Y2FzZSBcIlpcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0Y29uc3QgbmV3VG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdFx0XHRsZW5ndGg6IDQsXHJcblx0XHRcdFx0XHRcdHJhdzogXCJPT09PXCIsXHJcblx0XHRcdFx0XHRcdHN5bWJvbDogXCJPXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5aT05FXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0cmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJ6XCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInZcIjpcclxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJWXCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0Ly8gTm90IGltcGxlbWVudGVkXHJcblx0XHRcdFx0XHRyZXR1cm4gXCJ1bmtcIjtcclxuXHRcdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5uYW1lKCk7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiBcIlVua25vd25cIjtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwiWFwiOlxyXG5cdFx0XHRpZiAob2Zmc2V0ID09PSAwKSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiWlwiO1xyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwieFwiOlxyXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRcdHJlc3VsdCA9IG9mZnNldEhvdXJzU3RyaW5nO1xyXG5cdFx0XHRcdFx0aWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRjYXNlIDQ6IC8vIE5vIHNlY29uZHMgaW4gb3VyIGltcGxlbWVudGF0aW9uLCBzbyB0aGlzIGlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRjYXNlIDU6IC8vIE5vIHNlY29uZHMgaW4gb3VyIGltcGxlbWVudGF0aW9uLCBzbyB0aGlzIGlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSBcIi4vZGF0ZXRpbWVcIjtcclxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRGF0ZVRpbWUsIGQyOiBEYXRlVGltZSk6IERhdGVUaW1lO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRHVyYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEdXJhdGlvbiwgZDI6IER1cmF0aW9uKTogRHVyYXRpb247XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBhbnksIGQyOiBhbnkpOiBhbnkge1xyXG5cdGFzc2VydChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG5cdGFzc2VydChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0YXNzZXJ0KChkMSBpbnN0YW5jZW9mIERhdGVUaW1lICYmIGQyIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIER1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgRHVyYXRpb24pLFxyXG5cdFx0XCJFaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zIGV4cGVjdGVkXCIpO1xyXG5cdHJldHVybiBkMS5taW4oZDIpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IGFueSwgZDI6IGFueSk6IGFueSB7XHJcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0YXNzZXJ0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRhc3NlcnQoKGQxIGluc3RhbmNlb2YgRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBEYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBEdXJhdGlvbiksXHJcblx0XHRcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIik7XHJcblx0cmV0dXJuIGQxLm1heChkMik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWJzKGQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdGFzc2VydChkLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcblx0YXNzZXJ0KGQgaW5zdGFuY2VvZiBEdXJhdGlvbiwgXCJmaXJzdCBhcmd1bWVudCBpcyBub3QgYSBEdXJhdGlvblwiKTtcclxuXHRyZXR1cm4gZC5hYnMoKTtcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEluZGljYXRlcyBob3cgYSBEYXRlIG9iamVjdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXHJcbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcclxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBEYXRlRnVuY3Rpb25zIHtcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0RnVsbFllYXIoKSwgRGF0ZS5nZXRNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldCxcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldFVUQ1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE1hdGggdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcblxyXG4vKipcclxuICogQHJldHVybiB0cnVlIGlmZiBnaXZlbiBhcmd1bWVudCBpcyBhbiBpbnRlZ2VyIG51bWJlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW50KG46IG51bWJlcik6IGJvb2xlYW4ge1xyXG5cdGlmICh0eXBlb2YgKG4pICE9PSBcIm51bWJlclwiKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdGlmIChpc05hTihuKSkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRyZXR1cm4gKE1hdGguZmxvb3IobikgPT09IG4pO1xyXG59XHJcblxyXG4vKipcclxuICogUm91bmRzIC0xLjUgdG8gLTIgaW5zdGVhZCBvZiAtMVxyXG4gKiBSb3VuZHMgKzEuNSB0byArMlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kU3ltKG46IG51bWJlcik6IG51bWJlciB7XHJcblx0aWYgKG4gPCAwKSB7XHJcblx0XHRyZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG4pO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxyXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcclxuXHRpZiAoL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkLy50ZXN0KHZhbHVlKSkge1xyXG5cdFx0cmV0dXJuIE51bWJlcih2YWx1ZSk7XHJcblx0fVxyXG5cdHJldHVybiBOYU47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZTogbnVtYmVyLCBtb2R1bG86IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vZHVsbyA+PSAxLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuXHRpZiAodmFsdWUgPCAwKSB7XHJcblx0XHRyZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdmFsdWUgJSBtb2R1bG87XHJcblx0fVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IFRpbWVDb21wb25lbnRPcHRzLCBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IFRva2VuaXplciwgVG9rZW4sIERhdGVUaW1lVG9rZW5UeXBlIGFzIFRva2VuVHlwZSB9IGZyb20gXCIuL3Rva2VuXCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcblxyXG4vKipcclxuICogVGltZVN0cnVjdCBwbHVzIHpvbmVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXdhcmVUaW1lU3RydWN0IHtcclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSBzdHJ1Y3RcclxuXHQgKi9cclxuXHR0aW1lOiBUaW1lU3RydWN0O1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHR6b25lPzogVGltZVpvbmU7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0bjogbnVtYmVyO1xyXG5cdHJlbWFpbmluZzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUGFyc2Vab25lUmVzdWx0IHtcclxuXHR6b25lOiBUaW1lWm9uZTtcclxuXHRyZW1haW5pbmc6IHN0cmluZztcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gdGVzdFxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIExETUwgZm9ybWF0IHN0cmluZ1xyXG4gKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBzdHJpbmcgYWZ0ZXIgdGhlIGRhdGUrdGltZVxyXG4gKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgc3RyaW5nIGlzIHZhbGlkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VhYmxlKGRhdGVUaW1lU3RyaW5nOiBzdHJpbmcsIGZvcm1hdFN0cmluZzogc3RyaW5nLCBhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4ge1xyXG5cdHRyeSB7XHJcblx0XHRwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBudWxsLCBhbGxvd1RyYWlsaW5nKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFyc2VcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKFxyXG5cdGRhdGVUaW1lU3RyaW5nOiBzdHJpbmcsIGZvcm1hdFN0cmluZzogc3RyaW5nLCBvdmVycmlkZVpvbmU/OiBUaW1lWm9uZSwgYWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWVcclxuKTogQXdhcmVUaW1lU3RydWN0IHtcclxuXHRpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRpZiAoIWZvcm1hdFN0cmluZykge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZm9ybWF0IGdpdmVuXCIpO1xyXG5cdH1cclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgdG9rZW5pemVyID0gbmV3IFRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG5cdFx0Y29uc3QgdG9rZW5zOiBUb2tlbltdID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0XHRjb25zdCB0aW1lOiBUaW1lQ29tcG9uZW50T3B0cyA9IHsgeWVhcjogLTEgfTtcclxuXHRcdGxldCB6b25lOiBUaW1lWm9uZTtcclxuXHRcdGxldCBwbnI6IFBhcnNlTnVtYmVyUmVzdWx0O1xyXG5cdFx0bGV0IHB6cjogUGFyc2Vab25lUmVzdWx0O1xyXG5cdFx0bGV0IHJlbWFpbmluZzogc3RyaW5nID0gZGF0ZVRpbWVTdHJpbmc7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcclxuXHRcdFx0bGV0IHRva2VuUmVzdWx0OiBzdHJpbmc7XHJcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUueWVhciA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLm1vbnRoID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUuZGF5ID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUubWludXRlID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcInNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IHBuci5uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLm1pbGxpID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJyR7dG9rZW4ucmF3fSdgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XHJcblx0XHRcdFx0XHRwenIgPSBzdHJpcFpvbmUocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHB6ci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHN0cmlwUmF3KHJlbWFpbmluZywgdG9rZW4ucmF3KTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgcmVzdWx0ID0geyB0aW1lOiBuZXcgVGltZVN0cnVjdCh0aW1lKSwgem9uZTogem9uZSB8fCBudWxsIH07XHJcblx0XHRpZiAoIXJlc3VsdC50aW1lLnZhbGlkYXRlKCkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicmVzdWx0aW5nIGRhdGUgaW52YWxpZFwiKTtcclxuXHRcdH1cclxuXHRcdC8vIGFsd2F5cyBvdmVyd3JpdGUgem9uZSB3aXRoIGdpdmVuIHpvbmVcclxuXHRcdGlmIChvdmVycmlkZVpvbmUpIHtcclxuXHRcdFx0cmVzdWx0LnpvbmUgPSBvdmVycmlkZVpvbmU7XHJcblx0XHR9XHJcblx0XHRpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcclxuXHRcdFx0XHRgaW52YWxpZCBkYXRlICcke2RhdGVUaW1lU3RyaW5nfScgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJyR7Zm9ybWF0U3RyaW5nfSc6IHRyYWlsaW5nIGNoYXJhY3RlcnM6ICdyZW1haW5pbmcnYFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0ZSAnJHtkYXRlVGltZVN0cmluZ30nIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICcke2Zvcm1hdFN0cmluZ30nOiAke2UubWVzc2FnZX1gKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzOiBzdHJpbmcpOiBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0Y29uc3QgcmVzdWx0OiBQYXJzZU51bWJlclJlc3VsdCA9IHtcclxuXHRcdG46IE5hTixcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0bGV0IG51bWJlclN0cmluZyA9IFwiXCI7XHJcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcclxuXHRcdG51bWJlclN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuXHRcdHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0Ly8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXHJcblx0d2hpbGUgKG51bWJlclN0cmluZy5jaGFyQXQoMCkgPT09IFwiMFwiICYmIG51bWJlclN0cmluZy5sZW5ndGggPiAxKSB7XHJcblx0XHRudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHRyZXN1bHQubiA9IHBhcnNlSW50KG51bWJlclN0cmluZywgMTApO1xyXG5cdGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIWlzRmluaXRlKHJlc3VsdC5uKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICcke251bWJlclN0cmluZ30nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmNvbnN0IFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xyXG5cclxuZnVuY3Rpb24gc3RyaXBab25lKHM6IHN0cmluZyk6IFBhcnNlWm9uZVJlc3VsdCB7XHJcblx0aWYgKHMubGVuZ3RoID09PSAwKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyB6b25lIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRjb25zdCByZXN1bHQ6IFBhcnNlWm9uZVJlc3VsdCA9IHtcclxuXHRcdHpvbmU6IG51bGwsXHJcblx0XHRyZW1haW5pbmc6IHNcclxuXHR9O1xyXG5cdGxldCB6b25lU3RyaW5nID0gXCJcIjtcclxuXHR3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XHJcblx0XHR6b25lU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHRyZXN1bHQuem9uZSA9IFRpbWVab25lLnpvbmUoem9uZVN0cmluZyk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RyaXBSYXcoczogc3RyaW5nLCBleHBlY3RlZDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcmVtYWluaW5nID0gcztcclxuXHRsZXQgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xyXG5cdHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiBlcmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLmNoYXJBdCgwKSA9PT0gZXJlbWFpbmluZy5jaGFyQXQoMCkpIHtcclxuXHRcdHJlbWFpbmluZyA9IHJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0XHRlcmVtYWluaW5nID0gZXJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdGlmIChlcmVtYWluaW5nLmxlbmd0aCA+IDApIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgJyR7ZXhwZWN0ZWR9J2ApO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVtYWluaW5nO1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFBlcmlvZGljIGludGVydmFsIGZ1bmN0aW9uc1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuaW1wb3J0IHsgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSBcIi4vZGF0ZXRpbWVcIjtcclxuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcblxyXG4vKipcclxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcclxuICogZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG4gKi9cclxuZXhwb3J0IGVudW0gUGVyaW9kRHN0IHtcclxuXHQvKipcclxuXHQgKiBLZWVwIHJlcGVhdGluZyBpbiBzaW1pbGFyIGludGVydmFscyBtZWFzdXJlZCBpbiBVVEMsXHJcblx0ICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cclxuXHQgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxyXG5cdCAqIGV2ZXJ5IHRpbWUsIGV2ZW4gaW4gYSB0aW1lIHpvbmUgd2l0aCBEU1QuXHJcblx0ICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxyXG5cdCAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cclxuXHQgKi9cclxuXHRSZWd1bGFySW50ZXJ2YWxzLFxyXG5cclxuXHQvKipcclxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcclxuXHQgKiBhdCB0aGUgc2FtZSBwbGFjZSBpbiB0aGUgZGF5LCBsb2NhbCB0aW1lLiBTbyBlLmcuXHJcblx0ICogYSBwZXJpb2Qgb2Ygb25lIGRheSwgcmVmZXJlbmNlaW5nIGF0IDg6MDVBTSBFdXJvcGUvQW1zdGVyZGFtIHRpbWVcclxuXHQgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcclxuXHQgKiBpbiBVVEMgdGltZSwgc29tZSBpbnRlcnZhbHMgd2lsbCBiZSAyNSBob3VycyBhbmQgc29tZVxyXG5cdCAqIDIzIGhvdXJzIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuXHQgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxyXG5cdCAqIHNraXBwaW5nIGFuIGhvdXIgaW4gVVRDIGZvciBhIERTVCBiYWNrd2FyZCBjaGFuZ2UuXHJcblx0ICovXHJcblx0UmVndWxhckxvY2FsVGltZSxcclxuXHJcblx0LyoqXHJcblx0ICogRW5kLW9mLWVudW0gbWFya2VyXHJcblx0ICovXHJcblx0TUFYXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBlcmlvZERzdFRvU3RyaW5nKHA6IFBlcmlvZERzdCk6IHN0cmluZyB7XHJcblx0c3dpdGNoIChwKSB7XHJcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzOiByZXR1cm4gXCJyZWd1bGFyIGludGVydmFsc1wiO1xyXG5cdFx0Y2FzZSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTogcmV0dXJuIFwicmVndWxhciBsb2NhbCB0aW1lXCI7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBQZXJpb2REc3RcIik7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXBlYXRpbmcgdGltZSBwZXJpb2Q6IGNvbnNpc3RzIG9mIGEgcmVmZXJlbmNlIGRhdGUgYW5kXHJcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFBlcmlvZCB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZmVyZW5jZSBtb21lbnQgb2YgcGVyaW9kXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcmVmZXJlbmNlOiBEYXRlVGltZTtcclxuXHJcblx0LyoqXHJcblx0ICogSW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnRlcnZhbDogRHVyYXRpb247XHJcblxyXG5cdC8qKlxyXG5cdCAqIERTVCBoYW5kbGluZ1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RzdDogUGVyaW9kRHN0O1xyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVkIHJlZmVyZW5jZSBkYXRlLCBoYXMgZGF5LW9mLW1vbnRoIDw9IDI4IGZvciBNb250aGx5XHJcblx0ICogcGVyaW9kLCBvciBmb3IgWWVhcmx5IHBlcmlvZCBpZiBtb250aCBpcyBGZWJydWFyeVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludFJlZmVyZW5jZTogRGF0ZVRpbWU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZWQgaW50ZXJ2YWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnRJbnRlcnZhbDogRHVyYXRpb247XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZWQgaW50ZXJuYWwgRFNUIGhhbmRsaW5nLiBJZiBEU1QgaGFuZGxpbmcgaXMgaXJyZWxldmFudFxyXG5cdCAqIChiZWNhdXNlIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGRvZXMgbm90IGhhdmUgRFNUKVxyXG5cdCAqIHRoZW4gaXQgaXMgc2V0IHRvIFJlZ3VsYXJJbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2ludERzdDogUGVyaW9kRHN0O1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBMSU1JVEFUSU9OOiBpZiBkc3QgZXF1YWxzIFJlZ3VsYXJMb2NhbFRpbWUsIGFuZCB1bml0IGlzIFNlY29uZCwgTWludXRlIG9yIEhvdXIsXHJcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxyXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3RcclxuXHQgKiBpbXBsZW1lbnRlZCBhbmQgeW91IHdpbGwgZ2V0IGFuIGFzc2VydC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBkYXRlIG9mIHRoZSBwZXJpb2QuIElmIHRoZSBwZXJpb2QgaXMgaW4gTW9udGhzIG9yIFllYXJzLCBhbmRcclxuXHQgKlx0XHRcdFx0dGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXHJcblx0ICogQHBhcmFtIGludGVydmFsXHRUaGUgaW50ZXJ2YWwgb2YgdGhlIHBlcmlvZFxyXG5cdCAqIEBwYXJhbSBkc3RcdFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcclxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxyXG5cdCAqICAgICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcclxuXHRcdGludGVydmFsOiBEdXJhdGlvbixcclxuXHRcdGRzdD86IFBlcmlvZERzdCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBMSU1JVEFUSU9OOiBpZiBkc3QgZXF1YWxzIFJlZ3VsYXJMb2NhbFRpbWUsIGFuZCB1bml0IGlzIFNlY29uZCwgTWludXRlIG9yIEhvdXIsXHJcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxyXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3RcclxuXHQgKiBpbXBsZW1lbnRlZCBhbmQgeW91IHdpbGwgZ2V0IGFuIGFzc2VydC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXHJcblx0ICpcdFx0XHRcdHRoZSBkYXkgaXMgMjkgb3IgMzAgb3IgMzEsIHRoZSByZXN1bHRzIGFyZSBtYXhpbWlzZWQgdG8gZW5kLW9mLW1vbnRoLlxyXG5cdCAqIEBwYXJhbSBhbW91bnRcdFRoZSBhbW91bnQgb2YgdW5pdHMuXHJcblx0ICogQHBhcmFtIHVuaXRcdFRoZSB1bml0LlxyXG5cdCAqIEBwYXJhbSBkc3RcdFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcclxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxyXG5cdCAqICAgICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcclxuXHRcdGFtb3VudDogbnVtYmVyLFxyXG5cdFx0dW5pdDogVGltZVVuaXQsXHJcblx0XHRkc3Q/OiBQZXJpb2REc3QpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLiBTZWUgb3RoZXIgY29uc3RydWN0b3JzIGZvciBleHBsYW5hdGlvbi5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXHJcblx0XHRhbW91bnRPckludGVydmFsOiBhbnksXHJcblx0XHR1bml0T3JEc3Q/OiBhbnksXHJcblx0XHRnaXZlbkRzdD86IFBlcmlvZERzdFxyXG5cdFx0KSB7XHJcblxyXG5cdFx0bGV0IGludGVydmFsOiBEdXJhdGlvbjtcclxuXHRcdGxldCBkc3Q6IFBlcmlvZERzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG5cdFx0aWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0aW50ZXJ2YWwgPSA8RHVyYXRpb24+YW1vdW50T3JJbnRlcnZhbDtcclxuXHRcdFx0ZHN0ID0gPFBlcmlvZERzdD51bml0T3JEc3Q7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mIHVuaXRPckRzdCA9PT0gXCJudW1iZXJcIiAmJiB1bml0T3JEc3QgPj0gMCAmJiB1bml0T3JEc3QgPCBUaW1lVW5pdC5NQVgsIFwiSW52YWxpZCB1bml0XCIpO1xyXG5cdFx0XHRpbnRlcnZhbCA9IG5ldyBEdXJhdGlvbig8bnVtYmVyPmFtb3VudE9ySW50ZXJ2YWwsIDxUaW1lVW5pdD51bml0T3JEc3QpO1xyXG5cdFx0XHRkc3QgPSBnaXZlbkRzdDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XHJcblx0XHRcdGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcclxuXHRcdGFzc2VydCghIXJlZmVyZW5jZSwgXCJSZWZlcmVuY2UgdGltZSBub3QgZ2l2ZW5cIik7XHJcblx0XHRhc3NlcnQoaW50ZXJ2YWwuYW1vdW50KCkgPiAwLCBcIkFtb3VudCBtdXN0IGJlIHBvc2l0aXZlIG5vbi16ZXJvLlwiKTtcclxuXHRcdGFzc2VydChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XHJcblxyXG5cdFx0dGhpcy5fcmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG5cdFx0dGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcclxuXHRcdHRoaXMuX2RzdCA9IGRzdDtcclxuXHRcdHRoaXMuX2NhbGNJbnRlcm5hbFZhbHVlcygpO1xyXG5cclxuXHRcdC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxyXG5cdFx0Ly8gTm90ZSB3ZSB1c2UgaW50ZXJuYWwgYW1vdW50cyB0byBkZWNpZGUgdGhpcyBiZWNhdXNlIGFjdHVhbGx5IGl0IGlzIHN1cHBvcnRlZCBpZlxyXG5cdFx0Ly8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cclxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcclxuXHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRhc3NlcnQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCxcclxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdGFzc2VydCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDE0NDAsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0YXNzZXJ0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsXHJcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBQZXJpb2Qge1xyXG5cdFx0cmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyByZWZlcmVuY2UoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERFUFJFQ0FURUQ6IG9sZCBuYW1lIGZvciB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnQoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBpbnRlcnZhbFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnRlcnZhbCgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHVuaXQgb2YgdGhlIGludGVydmFsXHJcblx0ICovXHJcblx0cHVibGljIHVuaXQoKTogVGltZVVuaXQge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkc3QoKTogUGVyaW9kRHN0IHtcclxuXHRcdHJldHVybiB0aGlzLl9kc3Q7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGdyZWF0ZXIgdGhhblxyXG5cdCAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuXHQgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGFmdGVyIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcblx0ICogQHJldHVybiB0aGUgZmlyc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGFmdGVyIGZyb21EYXRlLCBnaXZlblxyXG5cdCAqXHRcdFx0aW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmRGaXJzdChmcm9tRGF0ZTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRhc3NlcnQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSxcclxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG5cdFx0bGV0IGFwcHJveDogRGF0ZVRpbWU7XHJcblx0XHRsZXQgYXBwcm94MjogRGF0ZVRpbWU7XHJcblx0XHRsZXQgYXBwcm94TWluOiBEYXRlVGltZTtcclxuXHRcdGxldCBwZXJpb2RzOiBudW1iZXI7XHJcblx0XHRsZXQgZGlmZjogbnVtYmVyO1xyXG5cdFx0bGV0IG5ld1llYXI6IG51bWJlcjtcclxuXHRcdGxldCBuZXdNb250aDogbnVtYmVyO1xyXG5cdFx0bGV0IHJlbWFpbmRlcjogbnVtYmVyO1xyXG5cdFx0bGV0IGltYXg6IG51bWJlcjtcclxuXHRcdGxldCBpbWluOiBudW1iZXI7XHJcblx0XHRsZXQgaW1pZDogbnVtYmVyO1xyXG5cclxuXHRcdGNvbnN0IG5vcm1hbEZyb20gPSB0aGlzLl9ub3JtYWxpemVEYXkoZnJvbURhdGUudG9ab25lKHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpKTtcclxuXHJcblx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcclxuXHRcdFx0Ly8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXHJcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcblx0XHRcdFx0Ly8gYXBwbHkgdG8gVVRDIHRpbWVcclxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgaW50ZXJ2YWxzXHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gQW1vdW50IGlzIG5vdCAxLFxyXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHQvLyBvbmx5IDI1IGxlYXAgc2Vjb25kcyBoYXZlIGV2ZXIgYmVlbiBhZGRlZCBzbyB0aGlzIHNob3VsZCBzdGlsbCBiZSBPSy5cclxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XHJcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcclxuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlllYXIpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCB0aW1lcy4gSWYgdGhlIHVuaXQgaXMgbGVzcyB0aGFuIGEgZGF5LCB3ZSByZWZlcmVuY2UgZWFjaCBkYXkgYW5ld1xyXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxMDAwICYmICgxMDAwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcblx0XHRcdFx0XHRcdFx0Ly8gbWludXMgb25lIHNlY29uZCB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWlsbGlzZWNvbmRzXHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LlNlY29uZCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cclxuXHRcdFx0XHRcdFx0XHQvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIHRvZG9cclxuXHRcdFx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpbWluID0gMDtcclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG5cdFx0XHRcdFx0XHRcdFx0aW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94MjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIHNlY29uZCBlYWNoIG1pbnV0ZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5NaW51dGUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2VcclxuXHRcdFx0XHRcdFx0XHQvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpbWluID0gMDtcclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG5cdFx0XHRcdFx0XHRcdFx0aW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1pbiA9IGltaWQgKyAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW1heCA9IGltaWQgLSAxO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgaG91ciB0aGlzLl9pbnRSZWZlcmVuY2VhcnkgZWFjaCB0aW1lLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlIG1pbnVzIG9uZSBob3VyXHJcblx0XHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcclxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LkhvdXIpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGZpdCBpbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcHJldmlvdXMgZGF5XHJcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcclxuXHRcdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuXHRcdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCgyNCAqIDYwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWludXRlKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuXHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcblx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoMjQgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcclxuXHRcdFx0XHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXHJcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcclxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xyXG5cdFx0XHRcdFx0XHRcdChub3JtYWxGcm9tLm1vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSk7XHJcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuXHRcdFx0XHRcdFx0bmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XHJcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRcdFx0XHRuZXdZZWFyLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KGFwcHJveCkuY29udmVydChmcm9tRGF0ZS56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGhhcyBNVUNIIGJldHRlciBwZXJmb3JtYW5jZSB0aGFuIGZpbmRGaXJzdC5cclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cclxuXHQgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gYWRkLiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG5cdCAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXHJcblx0ICovXHJcblx0cHVibGljIGZpbmROZXh0KHByZXY6IERhdGVUaW1lLCBjb3VudDogbnVtYmVyID0gMSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xyXG5cdFx0YXNzZXJ0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSxcclxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcblx0XHRhc3NlcnQodHlwZW9mIChjb3VudCkgPT09IFwibnVtYmVyXCIsIFwiQ291bnQgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xyXG5cdFx0Y29uc3Qgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xyXG5cdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKFxyXG5cdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSlcclxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKFxyXG5cdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSlcclxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cclxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXHJcblx0ICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuXHQgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG5cdCAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cclxuXHQgKlx0XHRcdGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBmaW5kTGFzdChmcm9tOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGxldCByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHRoaXMuZmluZEZpcnN0KGZyb20pKTtcclxuXHRcdGlmIChyZXN1bHQuZXF1YWxzKGZyb20pKSB7XHJcblx0XHRcdHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuXHQgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcblx0ICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZmluZFByZXYobmV4dDogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIHRoaXMuZmluZE5leHQobmV4dCwgLTEgKiBjb3VudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyBvbiBhIHBlcmlvZCBib3VuZGFyeVxyXG5cdCAqIChleHBlbnNpdmUhKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpc0JvdW5kYXJ5KG9jY3VycmVuY2U6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoIW9jY3VycmVuY2UpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFvY2N1cnJlbmNlLnpvbmUoKSxcclxuXHRcdFx0XCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuXHRcdHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoRHVyYXRpb24ubWlsbGlzZWNvbmRzKDEpKSkuZXF1YWxzKG9jY3VycmVuY2UpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBwZXJpb2QgaGFzIHRoZSBzYW1lIGVmZmVjdCBhcyB0aGUgZ2l2ZW4gb25lLlxyXG5cdCAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxyXG5cdCAqIGFuZCBzYW1lIGRzdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcclxuXHRcdC8vIG5vdGUgd2UgdGFrZSB0aGUgbm9uLW5vcm1hbGl6ZWQgcmVmZXJlbmNlKCkgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcclxuXHRcdHJldHVybiAodGhpcy5pc0JvdW5kYXJ5KG90aGVyLnJlZmVyZW5jZSgpKVxyXG5cdFx0XHQmJiB0aGlzLl9pbnRJbnRlcnZhbC5lcXVhbHNFeGFjdChvdGhlci5pbnRlcnZhbCgpKVxyXG5cdFx0XHQmJiB0aGlzLl9pbnREc3QgPT09IG90aGVyLl9pbnREc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogUGVyaW9kKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIucmVmZXJlbmNlKCkpXHJcblx0XHRcdCYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5pbnRlcnZhbCgpKVxyXG5cdFx0XHQmJiB0aGlzLmRzdCgpID09PSBvdGhlci5kc3QoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGFuIElTTyBkdXJhdGlvbiBzdHJpbmcgZS5nLlxyXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxyXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcclxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMU0gICAob25lIG1vbnRoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZS50b0lzb1N0cmluZygpICsgXCIvXCIgKyB0aGlzLl9pbnRlcnZhbC50b0lzb1N0cmluZygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZS5nLlxyXG5cdCAqIFwiMTAgeWVhcnMsIHJlZmVyZW5jZWluZyBhdCAyMDE0LTAzLTAxVDEyOjAwOjAwIEV1cm9wZS9BbXN0ZXJkYW0sIGtlZXBpbmcgcmVndWxhciBpbnRlcnZhbHNcIi5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdGxldCByZXN1bHQ6IHN0cmluZyA9IHRoaXMuX2ludGVydmFsLnRvU3RyaW5nKCkgKyBcIiwgcmVmZXJlbmNlaW5nIGF0IFwiICsgdGhpcy5fcmVmZXJlbmNlLnRvU3RyaW5nKCk7XHJcblx0XHQvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XHJcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xyXG5cdFx0XHRyZXN1bHQgKz0gXCIsIGtlZXBpbmcgXCIgKyBwZXJpb2REc3RUb1N0cmluZyh0aGlzLl9kc3QpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1BlcmlvZDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvcnJlY3RzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gX3JlZmVyZW5jZSBhbmQgX2ludFJlZmVyZW5jZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9jb3JyZWN0RGF5KGQ6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMuX3JlZmVyZW5jZSAhPT0gdGhpcy5faW50UmVmZXJlbmNlKSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdFx0ZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLFxyXG5cdFx0XHRcdGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSWYgdGhpcy5faW50ZXJuYWxVbml0IGluIFtNb250aCwgWWVhcl0sIG5vcm1hbGl6ZXMgdGhlIGRheS1vZi1tb250aFxyXG5cdCAqIHRvIDw9IDI4LlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ub3JtYWxpemVEYXkoZDogRGF0ZVRpbWUsIGFueW1vbnRoOiBib29sZWFuID0gdHJ1ZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICgodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBUaW1lVW5pdC5Nb250aCAmJiBkLmRheSgpID4gMjgpXHJcblx0XHRcdHx8ICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0LlllYXIgJiYgKGQubW9udGgoKSA9PT0gMiB8fCBhbnltb250aCkgJiYgZC5kYXkoKSA+IDI4KVxyXG5cdFx0XHQpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCAyOCxcclxuXHRcdFx0XHRkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSxcclxuXHRcdFx0XHRkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBkOyAvLyBzYXZlIG9uIHRpbWUgYnkgbm90IHJldHVybmluZyBhIGNsb25lXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cclxuXHQgKiAoaS5lLiBpZiB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBoYXMgRFNUKVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RzdFJlbGV2YW50KCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICghIXRoaXMuX3JlZmVyZW5jZS56b25lKClcclxuXHRcdFx0JiYgdGhpcy5fcmVmZXJlbmNlLnpvbmUoKS5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuXHRcdFx0JiYgdGhpcy5fcmVmZXJlbmNlLnpvbmUoKS5oYXNEc3QoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgdGhlIHZhbHVlcyB3aGVyZSBwb3NzaWJsZSAtIG5vdCBhbGwgdmFsdWVzXHJcblx0ICogYXJlIGNvbnZlcnRpYmxlIGludG8gb25lIGFub3RoZXIuIFdlZWtzIGFyZSBjb252ZXJ0ZWQgdG8gZGF5cy5cclxuXHQgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxyXG5cdCAqIGJ1dCBzZWNvbmRzIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZCB0byBtaW51dGVzIGR1ZSB0byBsZWFwIHNlY29uZHMuXHJcblx0ICogV2Vla3MgYXJlIGNvbnZlcnRlZCBiYWNrIHRvIGRheXMuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfY2FsY0ludGVybmFsVmFsdWVzKCk6IHZvaWQge1xyXG5cdFx0Ly8gbm9ybWFsaXplIGFueSBhYm92ZS11bml0IHZhbHVlc1xyXG5cdFx0bGV0IGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG5cdFx0bGV0IGludFVuaXQgPSB0aGlzLl9pbnRlcnZhbC51bml0KCk7XHJcblxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcclxuXHRcdFx0Ly8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDEwMDA7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTWludXRlICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHR9XHJcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuSG91ciAmJiBpbnRBbW91bnQgPj0gMjQgJiYgaW50QW1vdW50ICUgMjQgPT09IDApIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHR9XHJcblx0XHQvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxyXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LldlZWspIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50ICogNztcclxuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdH1cclxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcclxuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XHJcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2ludEludGVydmFsID0gbmV3IER1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XHJcblxyXG5cdFx0Ly8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xyXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuXHRcdFx0dGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gbm9ybWFsaXplIHJlZmVyZW5jZSBkYXlcclxuXHRcdHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcclxuXHR9XHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5cclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgYmVnaW5uaW5nLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWRMZWZ0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBwYWRkaW5nICsgcztcclxufVxyXG5cclxuLyoqXHJcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxyXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcclxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxyXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcclxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWRSaWdodChzOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGNoYXI6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0bGV0IHBhZGRpbmc6IHN0cmluZyA9IFwiXCI7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG5cdFx0cGFkZGluZyArPSBjaGFyO1xyXG5cdH1cclxuXHRyZXR1cm4gcyArIHBhZGRpbmc7XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBGb3IgdGVzdGluZyBwdXJwb3Nlcywgd2Ugb2Z0ZW4gbmVlZCB0byBtYW5pcHVsYXRlIHdoYXQgdGhlIGN1cnJlbnRcclxuICogdGltZSBpcy4gVGhpcyBpcyBhbiBpbnRlcmZhY2UgZm9yIGEgY3VzdG9tIHRpbWUgc291cmNlIG9iamVjdFxyXG4gKiBzbyBpbiB0ZXN0cyB5b3UgY2FuIHVzZSBhIGN1c3RvbSB0aW1lIHNvdXJjZS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGltZVNvdXJjZSB7XHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSBjdXJyZW50IGRhdGUrdGltZSBhcyBhIGphdmFzY3JpcHQgRGF0ZSBvYmplY3RcclxuXHQgKi9cclxuXHRub3coKTogRGF0ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZWFsVGltZVNvdXJjZSBpbXBsZW1lbnRzIFRpbWVTb3VyY2Uge1xyXG5cdG5vdygpOiBEYXRlIHtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFRpbWUgem9uZSByZXByZXNlbnRhdGlvbiBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5pbXBvcnQgIHsgTm9ybWFsaXplT3B0aW9uLCBUekRhdGFiYXNlIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2NhbCgpOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSB6b25lLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1dGMoKTogVGltZVpvbmUge1xyXG5cdHJldHVybiBUaW1lWm9uZS51dGMoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICogQHJldHVybnMgYSB0aW1lIHpvbmUgd2l0aCB0aGUgZ2l2ZW4gZml4ZWQgb2Zmc2V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xyXG5cclxuLyoqXHJcbiAqIFRpbWUgem9uZSBmb3IgYW4gb2Zmc2V0IHN0cmluZyBvciBhbiBJQU5BIHRpbWUgem9uZSBzdHJpbmcuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAcGFyYW0gcyBFbXB0eSBzdHJpbmcgZm9yIG5vIHRpbWUgem9uZSAobnVsbCBpcyByZXR1cm5lZCksXHJcbiAqICAgICAgICAgIFwibG9jYWx0aW1lXCIgZm9yIGxvY2FsIHRpbWUsXHJcbiAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXHJcbiAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcclxuICogICAgICAgICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl90el9kYXRhYmFzZV90aW1lX3pvbmVzXHJcbiAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxyXG4gKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xyXG4gKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHpvbmUobmFtZTogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XHJcblxyXG4vKipcclxuICogU2VlIHRoZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBvdGhlciB6b25lKCkgbWV0aG9kIHNpZ25hdHVyZXMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShhOiBhbnksIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSB0eXBlIG9mIHRpbWUgem9uZVxyXG4gKi9cclxuZXhwb3J0IGVudW0gVGltZVpvbmVLaW5kIHtcclxuXHQvKipcclxuXHQgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cclxuXHQgKi9cclxuXHRMb2NhbCxcclxuXHQvKipcclxuXHQgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG5cdCAqL1xyXG5cdE9mZnNldCxcclxuXHQvKipcclxuXHQgKiBJQU5BIHRpbWV6b25lIG1hbmFnZWQgdGhyb3VnaCBPbHNlbiBUWiBkYXRhYmFzZS4gSW5jbHVkZXNcclxuXHQgKiBEU1QgaWYgYXBwbGljYWJsZS5cclxuXHQgKi9cclxuXHRQcm9wZXJcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XHJcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxyXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcclxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXHJcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcclxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaW1lWm9uZSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBpZGVudGlmaWVyOlxyXG5cdCAqICBcImxvY2FsdGltZVwiIHN0cmluZyBmb3IgbG9jYWwgdGltZVxyXG5cdCAqICBFLmcuIFwiLTAxOjMwXCIgZm9yIGEgZml4ZWQgb2Zmc2V0IGZyb20gVVRDXHJcblx0ICogIEUuZy4gXCJVVENcIiBvciBcIkV1cm9wZS9BbXN0ZXJkYW1cIiBmb3IgYW4gT2xzZW4gVFogZGF0YWJhc2UgdGltZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25hbWU6IHN0cmluZztcclxuXHJcblx0LyoqXHJcblx0ICogQWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kc3Q6IGJvb2xlYW47XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSBzcGVjaWZpZWQgYnkgX25hbWVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9raW5kOiBUaW1lWm9uZUtpbmQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9ubHkgZm9yIGZpeGVkIG9mZnNldHM6IHRoZSBvZmZzZXQgaW4gbWludXRlc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX29mZnNldDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUuIE5vdGUgdGhhdFxyXG5cdCAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxyXG5cdCAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGxvY2FsKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB1dGMoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJVVENcIiwgdHJ1ZSk7IC8vIHVzZSAndHJ1ZScgZm9yIERTVCBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gZGlzcGxheSBhcyBcIlVUQ1wiLCBub3QgXCJVVEMgd2l0aG91dCBEU1RcIlxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIHdpdGggYSBmaXhlZCBvZmZzZXRcclxuXHQgKiBAcGFyYW0gb2Zmc2V0XHRvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzBcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUob2Zmc2V0OiBudW1iZXIpOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG5cdCAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuXHQgKiBAcGFyYW0gcyBFbXB0eSBzdHJpbmcgZm9yIG5vIHRpbWUgem9uZSAobnVsbCBpcyByZXR1cm5lZCksXHJcblx0ICogICAgICAgICAgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuXHQgKiAgICAgICAgICBhIFRaIGRhdGFiYXNlIHRpbWUgem9uZSBuYW1lIChlLmcuIEV1cm9wZS9BbXN0ZXJkYW0pLFxyXG5cdCAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcclxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuXHQgKiAgICAgICAgICBUWiBkYXRhYmFzZSB6b25lIG5hbWUgbWF5IGJlIHN1ZmZpeGVkIHdpdGggXCIgd2l0aG91dCBEU1RcIiB0byBpbmRpY2F0ZSBubyBEU1Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcblx0ICogICAgICAgICAgSW4gdGhhdCBjYXNlLCB0aGUgZHN0IHBhcmFtZXRlciBpcyBpZ25vcmVkLlxyXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxyXG5cdCAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcblx0ICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUoczogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgaW1wbGVtZW50YXRpb25zXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcclxuXHRcdGxldCBuYW1lID0gXCJcIjtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhKSkge1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcclxuXHRcdFx0XHRsZXQgcyA9IDxzdHJpbmc+YTtcclxuXHRcdFx0XHRpZiAocy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDsgLy8gbm8gdGltZSB6b25lXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XHJcblx0XHRcdFx0XHRcdGRzdCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcclxuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IDxudW1iZXI+YTtcclxuXHRcdFx0XHRhc3NlcnQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRcdFx0bmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVGltZVpvbmUuem9uZSgpOiBVbmV4cGVjdGVkIGFyZ3VtZW50IHR5cGUgXFxcIlwiICsgdHlwZW9mIChhKSArIFwiXFxcIlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShuYW1lLCBkc3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xyXG5cdCAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cclxuXHQgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxyXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbiA9IHRydWUpIHtcclxuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xyXG5cdFx0dGhpcy5fZHN0ID0gZHN0O1xyXG5cdFx0aWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcclxuXHRcdH0gZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5PZmZzZXQ7XHJcblx0XHRcdHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Qcm9wZXI7XHJcblx0XHRcdGFzc2VydChUekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBgbm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICcke25hbWV9J2ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGNhY2hlZCB5b3Ugd2lsbCBOT1RcclxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXHJcblx0ICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBuYW1lKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZHN0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBraW5kKCk6IFRpbWVab25lS2luZCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fa2luZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xyXG5cdCAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XHJcblx0XHRpZiAodGhpcy5pc1V0YygpICYmIG90aGVyLmlzVXRjKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuXHRcdFx0XHQmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxyXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogVGltZVpvbmUpOiBib29sZWFuIHtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cclxuXHQgKi9cclxuXHRwdWJsaWMgaXNVdGMoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgaW5jbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXHJcblxcXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhcclxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxyXG5cdFx0XHRcdFx0dXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaVxyXG5cdFx0XHRcdCkpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBzdGFuZGFyZCBvZmZzZXQgZXhjbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXHJcblx0ICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMoXHJcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcclxuXHQpOiBudW1iZXI7XHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxyXG5cdCk6IG51bWJlciB7XHJcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgMCwgMSwgMCkpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGltZXpvbmUgb2Zmc2V0IGZyb20gYSB6b25lLWxvY2FsIHRpbWUgKE5PVCBhIFVUQyB0aW1lKS5cclxuXHQgKiBAcGFyYW0geWVhciBsb2NhbCBmdWxsIHllYXJcclxuXHQgKiBAcGFyYW0gbW9udGggbG9jYWwgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBkYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXkgbG9jYWwgZGF5IG9mIG1vbnRoIDEtMzFcclxuXHQgKiBAcGFyYW0gaG91ciBsb2NhbCBob3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlIGxvY2FsIG1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZCBsb2NhbCBzZWNvbmQgMC01OVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBsb2NhbCBtaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKGxvY2FsVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZSh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XHJcblx0cHVibGljIG9mZnNldEZvclpvbmUoXHJcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXHJcblx0KTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IGxvY2FsVGltZSA9IChhICYmIGEgaW5zdGFuY2VvZiBUaW1lU3RydWN0ID8gYSA6IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSBhcyBudW1iZXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSk7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoXHJcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSxcclxuXHRcdFx0XHRcdGxvY2FsVGltZS5jb21wb25lbnRzLmhvdXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taWxsaVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcblx0XHRcdFx0Ly8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XHJcblx0XHRcdFx0aWYgKHRoaXMuX2RzdCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuXHQgKlxyXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjRGF0ZShkYXRlOiBEYXRlLCBmdW5jczogRGF0ZUZ1bmN0aW9ucyk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcclxuXHQgKlxyXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZURhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMub2Zmc2V0Rm9yWm9uZShUaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBab25lIGFiYnJldmlhdGlvbiBhdCBnaXZlbiBVVEMgdGltZXN0YW1wIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyIEZ1bGwgeWVhclxyXG5cdCAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXHJcblx0ICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyIEhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGUgTWludXRlIDAtNTlcclxuXHQgKiBAcGFyYW0gc2Vjb25kIFNlY29uZCAwLTU5XHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kIE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqXHJcblx0ICogQHJldHVybiBcImxvY2FsXCIgZm9yIGxvY2FsIHRpbWV6b25lLCB0aGUgb2Zmc2V0IGZvciBhbiBvZmZzZXQgem9uZSwgb3IgdGhlIGFiYnJldmlhdGlvbiBmb3IgYSBwcm9wZXIgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxyXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBkc3REZXBlbmRlbnQ/OiBib29sZWFuXHJcblx0KTogc3RyaW5nO1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGModXRjVGltZTogVGltZVN0cnVjdCwgZHN0RGVwZW5kZW50PzogYm9vbGVhbik6IHN0cmluZztcclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxyXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIGI/OiBudW1iZXIgfCBib29sZWFuLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgYz86IGJvb2xlYW5cclxuXHQpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3Q7XHJcblx0XHRsZXQgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZTtcclxuXHRcdGlmIChhIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xyXG5cdFx0XHR1dGNUaW1lID0gYTtcclxuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGIgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHV0Y1RpbWUgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBiIGFzIG51bWJlciwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XHJcblx0XHRcdGRzdERlcGVuZGVudCA9IChjID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJsb2NhbFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHR6b25lIHRpbWUgdGltZXN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cFxyXG5cdCAqXHJcblx0ICogQHJldHVybnNcdHVuaXggbWlsbGlzZWNvbmRzIGluIHpvbmUgdGltZSwgbm9ybWFsaXplZC5cclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxVbml4TWlsbGlzOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXHJcblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxyXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxyXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxyXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdHpvbmUgdGltZSB0aW1lc3RhbXBcclxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuc1x0dGltZSBzdHJ1Y3QgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IFRpbWVTdHJ1Y3Q7XHJcblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcclxuXHRcdGNvbnN0IHR6b3B0OiBOb3JtYWxpemVPcHRpb24gPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uRG93biA/IE5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogTm9ybWFsaXplT3B0aW9uLlVwKTtcclxuXHRcdGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG5cdFx0XHRpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xyXG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUsIHR6b3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGxvY2FsVGltZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXHJcblx0ICogRWl0aGVyIFwibG9jYWx0aW1lXCIsIElBTkEgbmFtZSwgb3IgXCIraGg6bW1cIiBvZmZzZXQuXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XHJcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuXHRcdFx0aWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbVGltZVpvbmU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IGFuIG9mZnNldCBudW1iZXIgaW50byBhbiBvZmZzZXQgc3RyaW5nXHJcblx0ICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgb2Zmc2V0VG9TdHJpbmcob2Zmc2V0OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3Qgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XHJcblx0XHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcclxuXHRcdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XHJcblx0XHRyZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXHJcblx0ICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcclxuXHQgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHN0cmluZ1RvT2Zmc2V0KHM6IHN0cmluZyk6IG51bWJlciB7XHJcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XHJcblx0XHQvLyBlYXN5IGNhc2VcclxuXHRcdGlmICh0ID09PSBcIlpcIikge1xyXG5cdFx0XHRyZXR1cm4gMDtcclxuXHRcdH1cclxuXHRcdC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcclxuXHRcdGFzc2VydCh0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLyksIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcclxuXHRcdGNvbnN0IHNpZ246IG51bWJlciA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xyXG5cdFx0Y29uc3QgaG91cnM6IG51bWJlciA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XHJcblx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcclxuXHRcdGlmICh0Lmxlbmd0aCA9PT0gNSkge1xyXG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcclxuXHRcdH0gZWxzZSBpZiAodC5sZW5ndGggPT09IDYpIHtcclxuXHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHR9XHJcblx0XHRhc3NlcnQoaG91cnMgPj0gMCAmJiBob3VycyA8IDI0LCBcIk9mZnNldHMgZnJvbSBVVEMgbXVzdCBiZSBsZXNzIHRoYW4gYSBkYXkuXCIpO1xyXG5cdFx0cmV0dXJuIHNpZ24gKiAoaG91cnMgKiA2MCArIG1pbnV0ZXMpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBjYWNoZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfY2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBUaW1lWm9uZSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcclxuXHQgKiBAcGFyYW0gbmFtZVx0VGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWU/XHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2ZpbmRPckNyZWF0ZShuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbik6IFRpbWVab25lIHtcclxuXHRcdGNvbnN0IGtleSA9IG5hbWUgKyAoZHN0ID8gXCJfRFNUXCIgOiBcIl9OTy1EU1RcIik7XHJcblx0XHRpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xyXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XHJcblx0XHRcdFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGFcclxuXHQgKiBjYWNoZSBsb29rdXBcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfbm9ybWFsaXplU3RyaW5nKHM6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB0OiBzdHJpbmcgPSBzLnRyaW0oKTtcclxuXHRcdGFzc2VydCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcclxuXHRcdGlmICh0ID09PSBcImxvY2FsdGltZVwiKSB7XHJcblx0XHRcdHJldHVybiB0O1xyXG5cdFx0fSBlbHNlIGlmICh0ID09PSBcIlpcIikge1xyXG5cdFx0XHRyZXR1cm4gXCIrMDA6MDBcIjtcclxuXHRcdH0gZWxzZSBpZiAoVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nKHQpKSB7XHJcblx0XHRcdC8vIG9mZnNldCBzdHJpbmdcclxuXHRcdFx0Ly8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcclxuXHRcdFx0cmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHN0YXRpYyBfaXNPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XHJcblx0XHRyZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUb2tlbml6ZXIge1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgdG9rZW5pemVyXHJcblx0ICogQHBhcmFtIF9mb3JtYXRTdHJpbmcgKG9wdGlvbmFsKSBTZXQgdGhlIGZvcm1hdCBzdHJpbmdcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIF9mb3JtYXRTdHJpbmc/OiBzdHJpbmcpIHtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGZvcm1hdCBzdHJpbmdcclxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBuZXcgc3RyaW5nIHRvIHVzZSBmb3IgZm9ybWF0dGluZ1xyXG5cdCAqL1xyXG5cdHNldEZvcm1hdFN0cmluZyhmb3JtYXRTdHJpbmc6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0dGhpcy5fZm9ybWF0U3RyaW5nID0gZm9ybWF0U3RyaW5nO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwZW5kIGEgbmV3IHRva2VuIHRvIHRoZSBjdXJyZW50IGxpc3Qgb2YgdG9rZW5zLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHRva2VuU3RyaW5nIFRoZSBzdHJpbmcgdGhhdCBtYWtlcyB1cCB0aGUgdG9rZW5cclxuXHQgKiBAcGFyYW0gdG9rZW5BcnJheSBUaGUgZXhpc3RpbmcgYXJyYXkgb2YgdG9rZW5zXHJcblx0ICogQHBhcmFtIHJhdyAob3B0aW9uYWwpIElmIHRydWUsIGRvbid0IHBhcnNlIHRoZSB0b2tlbiBidXQgaW5zZXJ0IGl0IGFzIGlzXHJcblx0ICogQHJldHVybiBUb2tlbltdIFRoZSByZXN1bHRpbmcgYXJyYXkgb2YgdG9rZW5zLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2FwcGVuZFRva2VuKHRva2VuU3RyaW5nOiBzdHJpbmcsIHRva2VuQXJyYXk6IFRva2VuW10sIHJhdz86IGJvb2xlYW4pOiBUb2tlbltdIHtcclxuXHRcdGlmICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xyXG5cdFx0XHRjb25zdCB0b2tlbjogVG9rZW4gPSB7XHJcblx0XHRcdFx0bGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXHJcblx0XHRcdFx0cmF3OiB0b2tlblN0cmluZyxcclxuXHRcdFx0XHRzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxyXG5cdFx0XHRcdHR5cGU6IERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRpZiAoIXJhdykge1xyXG5cdFx0XHRcdHRva2VuLnR5cGUgPSBtYXBTeW1ib2xUb1R5cGUodG9rZW4uc3ltYm9sKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0b2tlbkFycmF5LnB1c2godG9rZW4pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRva2VuQXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgaW50ZXJuYWwgc3RyaW5nIGFuZCByZXR1cm4gYW4gYXJyYXkgb2YgdG9rZW5zLlxyXG5cdCAqIEByZXR1cm4gVG9rZW5bXVxyXG5cdCAqL1xyXG5cdHBhcnNlVG9rZW5zKCk6IFRva2VuW10ge1xyXG5cdFx0bGV0IHJlc3VsdDogVG9rZW5bXSA9IFtdO1xyXG5cclxuXHRcdGxldCBjdXJyZW50VG9rZW46IHN0cmluZyA9IFwiXCI7XHJcblx0XHRsZXQgcHJldmlvdXNDaGFyOiBzdHJpbmcgPSBcIlwiO1xyXG5cdFx0bGV0IHF1b3Rpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRcdGxldCBwb3NzaWJsZUVzY2FwaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9mb3JtYXRTdHJpbmcubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgY3VycmVudENoYXIgPSB0aGlzLl9mb3JtYXRTdHJpbmdbaV07XHJcblxyXG5cdFx0XHQvLyBIYW5sZGUgZXNjYXBpbmcgYW5kIHF1b3RpbmdcclxuXHRcdFx0aWYgKGN1cnJlbnRDaGFyID09PSBcIidcIikge1xyXG5cdFx0XHRcdGlmICghcXVvdGluZykge1xyXG5cdFx0XHRcdFx0aWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0XHRcdFx0Ly8gRXNjYXBlZCBhIHNpbmdsZSAnIGNoYXJhY3RlciB3aXRob3V0IHF1b3RpbmdcclxuXHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCk7XHJcblx0XHRcdFx0XHRcdFx0Y3VycmVudFRva2VuID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gXCInXCI7XHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxyXG5cdFx0XHRcdFx0aWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0XHRcdFx0Ly8gRXNjYXBpbmcsIGFkZCAnIHRvIHRoZSB0b2tlblxyXG5cdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xyXG5cdFx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICghcG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0Ly8gQ3VycmVudCBjaGFyYWN0ZXIgaXMgcmVsZXZhbnQsIHNvIHNhdmUgaXQgZm9yIGluc3BlY3RpbmcgbmV4dCByb3VuZFxyXG5cdFx0XHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0XHRxdW90aW5nID0gIXF1b3Rpbmc7XHJcblx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHQvLyBGbHVzaCBjdXJyZW50IHRva2VuXHJcblx0XHRcdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsICFxdW90aW5nKTtcclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAocXVvdGluZykge1xyXG5cdFx0XHRcdC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcblx0XHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcblx0XHRcdFx0Ly8gV2Ugc3R1bWJsZWQgdXBvbiBhIG5ldyB0b2tlbiFcclxuXHRcdFx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCk7XHJcblx0XHRcdFx0Y3VycmVudFRva2VuID0gY3VycmVudENoYXI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gV2UgYXJlIHJlcGVhdGluZyB0aGUgdG9rZW4gd2l0aCBtb3JlIGNoYXJhY3RlcnNcclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG5cdFx0fVxyXG5cdFx0Ly8gRG9uJ3QgZm9yZ2V0IHRvIGFkZCB0aGUgbGFzdCB0b2tlbiB0byB0aGUgcmVzdWx0IVxyXG5cdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsIHF1b3RpbmcpO1xyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIERpZmZlcmVudCB0eXBlcyBvZiB0b2tlbnMsIGVhY2ggZm9yIGEgRGF0ZVRpbWUgXCJwZXJpb2QgdHlwZVwiIChsaWtlIHllYXIsIG1vbnRoLCBob3VyIGV0Yy4pXHJcbiAqL1xyXG5leHBvcnQgZW51bSBEYXRlVGltZVRva2VuVHlwZSB7XHJcblx0SURFTlRJVFksIC8vIFNwZWNpYWwsIGRvIG5vdCBcImZvcm1hdFwiIHRoaXMsIGJ1dCBqdXN0IG91dHB1dCB3aGF0IHdlbnQgaW5cclxuXHJcblx0RVJBLFxyXG5cdFlFQVIsXHJcblx0UVVBUlRFUixcclxuXHRNT05USCxcclxuXHRXRUVLLFxyXG5cdERBWSxcclxuXHRXRUVLREFZLFxyXG5cdERBWVBFUklPRCxcclxuXHRIT1VSLFxyXG5cdE1JTlVURSxcclxuXHRTRUNPTkQsXHJcblx0Wk9ORVxyXG59XHJcblxyXG4vKipcclxuICogQmFzaWMgdG9rZW5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW4ge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0eXBlIG9mIHRva2VuXHJcblx0ICovXHJcblx0dHlwZTogRGF0ZVRpbWVUb2tlblR5cGU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzeW1ib2wgZnJvbSB3aGljaCB0aGUgdG9rZW4gd2FzIHBhcnNlZFxyXG5cdCAqL1xyXG5cdHN5bWJvbDogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSB0b2tlblxyXG5cdCAqL1xyXG5cdGxlbmd0aDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgcHJvZHVjZWQgdGhpcyB0b2tlblxyXG5cdCAqL1xyXG5cdHJhdzogc3RyaW5nO1xyXG59XHJcblxyXG5jb25zdCBzeW1ib2xNYXBwaW5nOiB7IFtjaGFyOiBzdHJpbmddOiBEYXRlVGltZVRva2VuVHlwZSB9ID0ge1xyXG5cdFwiR1wiOiBEYXRlVGltZVRva2VuVHlwZS5FUkEsXHJcblxyXG5cdFwieVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG5cdFwiWVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG5cdFwidVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG5cdFwiVVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG5cdFwiclwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG5cclxuXHRcIlFcIjogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcclxuXHRcInFcIjogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcclxuXHJcblx0XCJNXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG5cdFwiTFwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuXHRcImxcIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcblxyXG5cdFwid1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLLFxyXG5cdFwiV1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLLFxyXG5cclxuXHRcImRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFwiRFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblx0XCJGXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcImdcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cclxuXHRcIkVcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHRcImVcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHRcImNcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHJcblx0XCJhXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuXHJcblx0XCJoXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblx0XCJIXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblx0XCJrXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblx0XCJLXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblx0XCJqXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblx0XCJKXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcblxyXG5cdFwibVwiOiBEYXRlVGltZVRva2VuVHlwZS5NSU5VVEUsXHJcblxyXG5cdFwic1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XCJTXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcIkFcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cclxuXHRcInpcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcIlpcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcIk9cIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcInZcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcIlZcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcIlhcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuXHRcInhcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hcCB0aGUgZ2l2ZW4gc3ltYm9sIHRvIG9uZSBvZiB0aGUgRGF0ZVRpbWVUb2tlblR5cGVzXHJcbiAqIElmIHRoZXJlIGlzIG5vIG1hcHBpbmcsIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZIGlzIHVzZWRcclxuICpcclxuICogQHBhcmFtIHN5bWJvbCBUaGUgc2luZ2xlLWNoYXJhY3RlciBzeW1ib2wgdXNlZCB0byBtYXAgdGhlIHRva2VuXHJcbiAqIEByZXR1cm4gRGF0ZVRpbWVUb2tlblR5cGUgVGhlIFR5cGUgb2YgdG9rZW4gdGhpcyBzeW1ib2wgcmVwcmVzZW50c1xyXG4gKi9cclxuZnVuY3Rpb24gbWFwU3ltYm9sVG9UeXBlKHN5bWJvbDogc3RyaW5nKTogRGF0ZVRpbWVUb2tlblR5cGUge1xyXG5cdGlmIChzeW1ib2xNYXBwaW5nLmhhc093blByb3BlcnR5KHN5bWJvbCkpIHtcclxuXHRcdHJldHVybiBzeW1ib2xNYXBwaW5nW3N5bWJvbF07XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWTtcclxuXHR9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICpcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcbmltcG9ydCB7IFRpbWVDb21wb25lbnRPcHRzLCBUaW1lU3RydWN0LCBUaW1lVW5pdCwgV2Vla0RheSB9IGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcclxuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcInV0aWxcIjtcclxuXHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUb1R5cGUge1xyXG5cdC8qKlxyXG5cdCAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXHJcblx0ICovXHJcblx0WWVhcixcclxuXHQvKipcclxuXHQgKiBcIm1heFwiXHJcblx0ICovXHJcblx0TWF4XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBPblR5cGUge1xyXG5cdC8qKlxyXG5cdCAqIERheS1vZi1tb250aCBudW1iZXJcclxuXHQgKi9cclxuXHREYXlOdW0sXHJcblx0LyoqXHJcblx0ICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXHJcblx0ICovXHJcblx0TGFzdFgsXHJcblx0LyoqXHJcblx0ICogZS5nLiBcIlN1bj49OFwiXHJcblx0ICovXHJcblx0R3JlcVgsXHJcblx0LyoqXHJcblx0ICogZS5nLiBcIlN1bjw9OFwiXHJcblx0ICovXHJcblx0TGVxWFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBBdFR5cGUge1xyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuXHQgKi9cclxuXHRTdGFuZGFyZCxcclxuXHQvKipcclxuXHQgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXHJcblx0ICovXHJcblx0V2FsbCxcclxuXHQvKipcclxuXHQgKiBVdGMgdGltZVxyXG5cdCAqL1xyXG5cdFV0YyxcclxufVxyXG5cclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUnVsZUluZm8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdC8qKlxyXG5cdFx0ICogRlJPTSBjb2x1bW4geWVhciBudW1iZXIuXHJcblx0XHQgKiBOb3RlLCBjYW4gYmUgLTEwMDAwIGZvciBOYU4gdmFsdWUgKGUuZy4gZm9yIFwiU3lzdGVtVlwiIHJ1bGVzKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgZnJvbTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUTyBjb2x1bW4gdHlwZTogWWVhciBmb3IgeWVhciBudW1iZXJzIGFuZCBcIm9ubHlcIiB2YWx1ZXMsIE1heCBmb3IgXCJtYXhcIiB2YWx1ZS5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHRvVHlwZTogVG9UeXBlLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHRvWWVhcjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB0eXBlOiBzdHJpbmcsXHJcblx0XHQvKipcclxuXHRcdCAqIElOIGNvbHVtbiBtb250aCBudW1iZXIgMS0xMlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgaW5Nb250aDogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBPTiBjb2x1bW4gdHlwZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25UeXBlOiBPblR5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvbkRheTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiBvblR5cGUgaXMgbm90IERheU51bSwgdGhlIHdlZWtkYXlcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uV2Vla0RheTogV2Vla0RheSxcclxuXHRcdC8qKlxyXG5cdFx0ICogQVQgY29sdW1uIGhvdXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0SG91cjogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gbWludXRlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdE1pbnV0ZTogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gc2Vjb25kXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFNlY29uZDogbnVtYmVyLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gdHlwZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRUeXBlOiBBdFR5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIERTVCBvZmZzZXQgZnJvbSBsb2NhbCBzdGFuZGFyZCB0aW1lIChOT1QgZnJvbSBVVEMhKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgc2F2ZTogRHVyYXRpb24sXHJcblx0XHQvKipcclxuXHRcdCAqIENoYXJhY3RlciB0byBpbnNlcnQgaW4gJXMgZm9yIHRpbWUgem9uZSBhYmJyZXZpYXRpb25cclxuXHRcdCAqIE5vdGUgaWYgVFogZGF0YWJhc2UgaW5kaWNhdGVzIFwiLVwiIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHRcdCkge1xyXG5cclxuXHRcdGlmICh0aGlzLnNhdmUpIHtcclxuXHRcdFx0dGhpcy5zYXZlID0gdGhpcy5zYXZlLmNvbnZlcnQoVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIGFwcGxpY2FibGUoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XHJcblx0XHRcdGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XHJcblx0XHRcdGNhc2UgVG9UeXBlLlllYXI6IHJldHVybiAoeWVhciA8PSB0aGlzLnRvWWVhcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTb3J0IGNvbXBhcmlzb25cclxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlTGVzcyhvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmZyb20gPCBvdGhlci5mcm9tKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoID4gb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTb3J0IGNvbXBhcmlzb25cclxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBlcXVhbCB0byBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVFcXVhbChvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuaW5Nb250aCAhPT0gb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAoIXRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pLmVxdWFscyhvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gTm90ZSB0aGF0IHRoZSB0aW1lXHJcblx0ICogaXMgTk9UIGFkanVzdGVkIGZvciB3YWxsIGNsb2NrIHRpbWUgb3Igc3RhbmRhcmQgdGltZSwgaS5lLiB0aGlzLmF0VHlwZSBpc1xyXG5cdCAqIG5vdCB0YWtlbiBpbnRvIGFjY291bnRcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlRGF0ZSh5ZWFyOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcclxuXHRcdGFzc2VydCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBpcyBub3QgYXBwbGljYWJsZSBpbiBcIiArIHllYXIudG9TdHJpbmcoMTApKTtcclxuXHJcblx0XHQvLyB5ZWFyIGFuZCBtb250aCBhcmUgZ2l2ZW5cclxuXHRcdGNvbnN0IHRtOiBUaW1lQ29tcG9uZW50T3B0cyA9IHt5ZWFyLCBtb250aDogdGhpcy5pbk1vbnRoIH07XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIGRheVxyXG5cdFx0c3dpdGNoICh0aGlzLm9uVHlwZSkge1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHtcclxuXHRcdFx0XHR0bS5kYXkgPSB0aGlzLm9uRGF5O1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDoge1xyXG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MYXN0WDoge1xyXG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRpbWVcclxuXHRcdHRtLmhvdXIgPSB0aGlzLmF0SG91cjtcclxuXHRcdHRtLm1pbnV0ZSA9IHRoaXMuYXRNaW51dGU7XHJcblx0XHR0bS5zZWNvbmQgPSB0aGlzLmF0U2Vjb25kO1xyXG5cclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0bSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1RcclxuXHQgKiBAcGFyYW0gcHJldlJ1bGVcdFRoZSBwcmV2aW91cyBydWxlXHJcblx0ICovXHJcblx0cHVibGljIHRyYW5zaXRpb25UaW1lVXRjKHllYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uLCBwcmV2UnVsZTogUnVsZUluZm8pOiBudW1iZXIge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XHJcblxyXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uO1xyXG5cdFx0c3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XHJcblx0XHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxyXG5cdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxyXG5cdFx0XHRcdGlmIChwcmV2UnVsZSkge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbmV4cG9ydCBlbnVtIFJ1bGVUeXBlIHtcclxuXHQvKipcclxuXHQgKiBObyBydWxlIGFwcGxpZXNcclxuXHQgKi9cclxuXHROb25lLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG5cdCAqL1xyXG5cdE9mZnNldCxcclxuXHQvKipcclxuXHQgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuXHQgKi9cclxuXHRSdWxlTmFtZVxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIEdNVCBvZmZzZXQgaW4gZnJhY3Rpb25hbCBtaW51dGVzLCBQT1NJVElWRSB0byBVVEMgKG5vdGUgSmF2YVNjcmlwdC5EYXRlIGdpdmVzIG9mZnNldHNcclxuXHRcdCAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBnbXRvZmY6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcblx0XHQgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG5cdFx0ICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlVHlwZTogUnVsZVR5cGUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVPZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGEgcnVsZSBuYW1lLCB0aGlzIGlzIHRoZSBydWxlIG5hbWVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG5cdFx0ICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcblx0XHQgKiBhIHNpbmdsZSBhbHBoYWJldGljIHN0cmluZyBvdGhlciB0aGFuIOKAnHp6eizigJ0gaW4gd2hpY2ggY2FzZSB0aGF04oCZcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuXHRcdCAqIGEgc3RyaW5nIGNvbnRhaW5pbmcg4oCcJXMs4oCdIGluIHdoaWNoIGNhc2UgdGhlIOKAnCVz4oCdIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIHRleHQgaW4gdGhlIGFwcHJvcHJpYXRlIFJ1bGXigJlzIExFVFRFUiBjb2x1bW5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGZvcm1hdDogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG5cdFx0ICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgTlVMTCAoZm9yIHRoZSBmaXJzdCBydWxlKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdW50aWw6IG51bWJlclxyXG5cdCkge1xyXG5cdFx0aWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG5cdFx0XHR0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuZW51bSBUek1vbnRoTmFtZXMge1xyXG5cdEphbiA9IDEsXHJcblx0RmViID0gMixcclxuXHRNYXIgPSAzLFxyXG5cdEFwciA9IDQsXHJcblx0TWF5ID0gNSxcclxuXHRKdW4gPSA2LFxyXG5cdEp1bCA9IDcsXHJcblx0QXVnID0gOCxcclxuXHRTZXAgPSA5LFxyXG5cdE9jdCA9IDEwLFxyXG5cdE5vdiA9IDExLFxyXG5cdERlYyA9IDEyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XHJcblx0XHRpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGlmICh0cnVlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuXHR9XHJcbn1cclxuXHJcbmVudW0gVHpEYXlOYW1lcyB7XHJcblx0U3VuID0gMCxcclxuXHRNb24gPSAxLFxyXG5cdFR1ZSA9IDIsXHJcblx0V2VkID0gMyxcclxuXHRUaHUgPSA0LFxyXG5cdEZyaSA9IDUsXHJcblx0U2F0ID0gNlxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXQ6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHJcblx0XHQpIHtcclxuXHRcdGlmICh0aGlzLm9mZnNldCkge1xyXG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG5leHBvcnQgZW51bSBOb3JtYWxpemVPcHRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0VXAsXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdERvd25cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUekRhdGFiYXNlIHtcclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogVHpEYXRhYmFzZSA9IG51bGw7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0YSBUWiBkYXRhIGFzIEpTT04gb2JqZWN0IChmcm9tIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzKS5cclxuXHQgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5pdChkYXRhPzogYW55IHwgYW55W10pOiB2b2lkIHtcclxuXHRcdGlmIChkYXRhKSB7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRUekRhdGFiYXNlLmluc3RhbmNlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgdGhpcyBkYXRhYmFzZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKTogVHpEYXRhYmFzZSB7XHJcblx0XHRpZiAoIVR6RGF0YWJhc2UuX2luc3RhbmNlKSB7XHJcblx0XHRcdGNvbnN0IGRhdGE6IGFueVtdID0gW107XHJcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xyXG5cdFx0XHRjb25zdCBnOiBhbnkgPSAoZ2xvYmFsID8gZ2xvYmFsIDogd2luZG93KTtcclxuXHRcdFx0aWYgKGcpIHtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhnKSkge1xyXG5cdFx0XHRcdFx0aWYgKGtleS5pbmRleE9mKFwidHpkYXRhXCIpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZ1trZXldID09PSBcIm9iamVjdFwiICYmIGdba2V5XS5ydWxlcyAmJiBnW2tleV0uem9uZXMpIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZ1trZXldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG5cdFx0XHRjb25zdCBmaW5kTm9kZU1vZHVsZXMgPSAocmVxdWlyZTogYW55KTogdm9pZCA9PiB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGZpcnN0IHRyeSB0emRhdGEgd2hpY2ggY29udGFpbnMgYWxsIGRhdGFcclxuXHRcdFx0XHRcdGNvbnN0IHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xyXG5cdFx0XHRcdFx0Y29uc3QgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG5cdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdC8vIHRoZW4gdHJ5IHN1YnNldHNcclxuXHRcdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWVzOiBzdHJpbmdbXSA9IFtcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYWZyaWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFudGFyY3RpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZFwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZC11dGNcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXRjZXRlcmFcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXVyb3BlXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLW5vcnRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1wYWNpZmljbmV3XCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLXNvdXRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zeXN0ZW12XCJcclxuXHRcdFx0XHRcdF07XHJcblx0XHRcdFx0XHRjb25zdCBleGlzdGluZzogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRcdGNvbnN0IGV4aXN0aW5nUGF0aHM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdFx0XHRtb2R1bGVOYW1lcy5mb3JFYWNoKChtb2R1bGVOYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdFx0XHRmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGEpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFR6RGF0YWJhc2UuX2luc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGRhdGFiYXNlIGRhdGFcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kYXRhOiBhbnk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCBtaW4vbWF4IERTVCB2YWx1ZXNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9taW5tYXg6IE1pbk1heEluZm87XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCB6b25lIG5hbWVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZU5hbWVzOiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuXHQgKi9cclxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGRhdGE6IGFueVtdKSB7XHJcblx0XHRhc3NlcnQoIVR6RGF0YWJhc2UuX2luc3RhbmNlLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcclxuXHRcdGFzc2VydChkYXRhLmxlbmd0aCA+IDAsXHJcblx0XHRcdFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIlxyXG5cdFx0KTtcclxuXHRcdGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHR0aGlzLl9kYXRhID0gZGF0YVswXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2RhdGEgPSB7IHpvbmVzOiB7fSwgcnVsZXM6IHt9IH07XHJcblx0XHRcdGRhdGEuZm9yRWFjaCgoZDogYW55KTogdm9pZCA9PiB7XHJcblx0XHRcdFx0aWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnJ1bGVzKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnpvbmVzKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9kYXRhLnpvbmVzW2tleV0gPSBkLnpvbmVzW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX21pbm1heCA9IHZhbGlkYXRlRGF0YSh0aGlzLl9kYXRhKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lTmFtZXMoKTogc3RyaW5nW10ge1xyXG5cdFx0aWYgKCF0aGlzLl96b25lTmFtZXMpIHtcclxuXHRcdFx0dGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XHJcblx0XHRcdHRoaXMuX3pvbmVOYW1lcy5zb3J0KCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZU5hbWVzO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGV4aXN0cyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNaW5pbXVtIG5vbi16ZXJvIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBEb2VzIHJldHVybiB6ZXJvIGlmIGEgem9uZU5hbWUgaXMgZ2l2ZW4gYW5kIHRoZXJlIGlzIG5vIERTVCBhdCBhbGwgZm9yIHRoZSB6b25lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW5Ec3RTYXZlKHpvbmVOYW1lPzogc3RyaW5nKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHpvbmVOYW1lKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdFx0bGV0IHJlc3VsdDogRHVyYXRpb24gPSBudWxsO1xyXG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0Y29uc3Qgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7ICsraikge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHRlbXBbal07XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby5zYXZlLm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmICghcmVzdWx0KSB7XHJcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcblx0ICovXHJcblx0cHVibGljIG1heERzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAoem9uZU5hbWUpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0XHRsZXQgcmVzdWx0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRcdGNvbnN0IHJ1bGVOYW1lczogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcclxuXHRcdFx0XHRcdCYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGNvbnN0IHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyArK2opIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgcnVsZUluZm8gPSB0ZW1wW2pdO1xyXG5cdFx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgem9uZSBoYXMgRFNUIGF0IGFsbFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3Qoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpcnN0IERTVCBjaGFuZ2UgbW9tZW50IEFGVEVSIHRoZSBnaXZlbiBVVEMgZGF0ZSBpbiBVVEMgbWlsbGlzZWNvbmRzLCB3aXRoaW4gb25lIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBudW1iZXIpOiBudW1iZXI7XHJcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGxldCB6b25lSW5mbzogWm9uZUluZm87XHJcblx0XHRjb25zdCB1dGNUaW1lOiBUaW1lU3RydWN0ID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuXHJcblx0XHQvLyBnZXQgYWxsIHpvbmUgaW5mb3MgZm9yIFtkYXRlLCBkYXRlKzF5ZWFyKVxyXG5cdFx0Y29uc3QgYWxsWm9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0Y29uc3QgcmVsZXZhbnRab25lSW5mb3M6IFpvbmVJbmZvW10gPSBbXTtcclxuXHRcdGNvbnN0IHJhbmdlU3RhcnQ6IG51bWJlciA9IHV0Y1RpbWUudW5peE1pbGxpcztcclxuXHRcdGNvbnN0IHJhbmdlRW5kOiBudW1iZXIgPSByYW5nZVN0YXJ0ICsgMzY1ICogODY0MDBFMztcclxuXHRcdGxldCBwcmV2RW5kOiBudW1iZXIgPSBudWxsO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhbGxab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0em9uZUluZm8gPSBhbGxab25lSW5mb3NbaV07XHJcblx0XHRcdGlmICgocHJldkVuZCA9PT0gbnVsbCB8fCBwcmV2RW5kIDwgcmFuZ2VFbmQpICYmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+IHJhbmdlU3RhcnQpKSB7XHJcblx0XHRcdFx0cmVsZXZhbnRab25lSW5mb3MucHVzaCh6b25lSW5mbyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldkVuZCA9IHpvbmVJbmZvLnVudGlsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNvbGxlY3QgYWxsIHRyYW5zaXRpb25zIGluIHRoZSB6b25lcyBmb3IgdGhlIHllYXJcclxuXHRcdGxldCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gW107XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJlbGV2YW50Wm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHpvbmVJbmZvID0gcmVsZXZhbnRab25lSW5mb3NbaV07XHJcblx0XHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdFx0dHJhbnNpdGlvbnMgPSB0cmFuc2l0aW9ucy5jb25jYXQoXHJcblx0XHRcdFx0dGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgKyAxLCB6b25lSW5mby5nbXRvZmYpXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHR0cmFuc2l0aW9ucy5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgZmlyc3QgYWZ0ZXIgdGhlIGdpdmVuIGRhdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgb2Zmc2V0XHJcblx0XHRsZXQgcHJldlNhdmU6IER1cmF0aW9uID0gbnVsbDtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cclxuXHQgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuXHQgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVJc1V0Yyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xyXG5cdFx0bGV0IHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuXHRcdC8vIGZvbGxvdyBsaW5rc1xyXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZy9zdWJ0cmFjdGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cclxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXHJcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXHJcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0QSBsb2NhbCB0aW1lLCBlaXRoZXIgYXMgYSBUaW1lU3RydWN0IG9yIGFzIGEgdW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXAuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuXHRUaGUgbm9ybWFsaXplZCB0aW1lLCBpbiB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIGxvY2FsVGltZSBwYXJhbWV0ZXIgKFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXMpXHJcblx0ICovXHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogVGltZVN0cnVjdDtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuXHRcdFx0Y29uc3QgbG9jYWxUaW1lOiBUaW1lU3RydWN0ID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuXHRcdFx0Ly8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcblxyXG5cdFx0XHQvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG5cdFx0XHQvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuXHJcblx0XHRcdC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKFxyXG5cdFx0XHRcdHpvbmVOYW1lLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDFcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdC8vIGZpbmQgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zXHJcblx0XHRcdGxldCBwcmV2OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRcdC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cclxuXHRcdFx0XHRpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQmVmb3JlOiBudW1iZXIgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGlmIChsb2NhbFRpbWUudW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiBsb2NhbFRpbWUudW5peE1pbGxpcyA8IGxvY2FsQWZ0ZXIpIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjdG9yOiBudW1iZXIgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Ly8gbm8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdH1cclxuXHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG5cdCAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLlxyXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG90YWxPZmZzZXQoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG5cdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb24gPSBudWxsO1xyXG5cclxuXHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gdGhpcy5kc3RPZmZzZXRGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG5cdCAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb24oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdGNvbnN0IGZvcm1hdDogc3RyaW5nID0gem9uZUluZm8uZm9ybWF0O1xyXG5cclxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG5cdFx0aWYgKGZvcm1hdC5pbmRleE9mKFwiJXNcIikgIT09IC0xXHJcblx0XHRcdCYmIHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmc7XHJcblx0XHRcdC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuXHRcdFx0aWYgKGRzdERlcGVuZGVudCkge1xyXG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZvcm1hdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGV4Y2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuXHQgKlxyXG5cdCAqIElmIHRoZSBsb2NhbCB0aW1lc3RhbXAgZXhpc3RzIHR3aWNlIChhcyBjYW4gb2NjdXIgdmVyeSByYXJlbHkgZHVlIHRvIHpvbmUgY2hhbmdlcylcclxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG5cdCAqXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBsb2NhbFRpbWUgOiBsb2NhbFRpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsICsgem9uZUluZm8uZ210b2ZmLm1pbGxpc2Vjb25kcygpID4gdW5peE1pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZSBpcyBub3JtYWxpemVkIG91dC5cclxuXHQgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcblx0ICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG90YWxPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XHJcblx0XHRjb25zdCBub3JtYWxpemVkVG06IFRpbWVTdHJ1Y3QgPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XHJcblxyXG5cdFx0Ly8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XHJcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxyXG5cclxuXHRcdC8vIFRoZXJlZm9yZSBiaW5hcnkgc2VhcmNoIGRvZXMgbm90IGFwcGx5LiBMaW5lYXIgc2VhcmNoIHRocm91Z2ggdHJhbnNpdGlvbnNcclxuXHRcdC8vIGFuZCByZXR1cm4gdGhlIGZpcnN0IG9mZnNldCB0aGF0IG1hdGNoZXNcclxuXHJcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyhcclxuXHRcdFx0em9uZU5hbWUsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgLSAxLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyICsgMVxyXG5cdFx0KTtcclxuXHRcdGxldCBwcmV2OiBUcmFuc2l0aW9uID0gbnVsbDtcclxuXHRcdGxldCBwcmV2UHJldjogVHJhbnNpdGlvbiA9IG51bGw7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKSA+IG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0Ly8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldlByZXYgPSBwcmV2O1xyXG5cdFx0XHRwcmV2ID0gdHJhbnNpdGlvbjtcclxuXHRcdH1cclxuXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG5cdFx0aWYgKHByZXYpIHtcclxuXHRcdFx0Ly8gc3BlY2lhbCBjYXJlIGR1cmluZyBiYWNrd2FyZCBjaGFuZ2U6IHRha2UgZmlyc3Qgb2NjdXJyZW5jZSBvZiBsb2NhbCB0aW1lXHJcblx0XHRcdGlmIChwcmV2UHJldiAmJiBwcmV2UHJldi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlXHJcblx0XHRcdFx0Y29uc3QgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG5cdFx0XHRcdGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKClcclxuXHRcdFx0XHRcdCYmIG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG5cdFx0XHRcdFx0Ly8gd2l0aGluIGR1cGxpY2F0ZSByYW5nZVxyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRoaXMgY2Fubm90IGhhcHBlbiBhcyB0aGUgdHJhbnNpdGlvbnMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBjb250YWluIGEgdHJhbnNpdGlvbiBhdCB0aGVcclxuXHRcdFx0Ly8gYmVnaW5uaW5nIG9mIHRoZSByZXF1ZXN0ZWQgZnJvbVllYXJcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW5cclxuXHQgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcFxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGRzdE9mZnNldEZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG5cclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0cnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXRcclxuXHRcdCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHRsZXQgb2Zmc2V0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRmb3IgKGxldCBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcblx0XHRcdG9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG9mZnNldDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRpbWUgem9uZSBsZXR0ZXIgZm9yIHRoZSBnaXZlblxyXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wIGFzIFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXNcclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXR0ZXJGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IHN0cmluZyB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcblx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXHJcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XHJcblx0XHQpO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG5cdFx0bGV0IGxldHRlcjogc3RyaW5nID0gbnVsbDtcclxuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCFsZXR0ZXIpIHtcclxuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcblx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGxldHRlcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIGxpc3Qgb2YgYWxsIHRyYW5zaXRpb25zIGluIFtmcm9tWWVhci4udG9ZZWFyXSBzb3J0ZWQgYnkgZWZmZWN0aXZlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiB0aGUgcnVsZSBzZXRcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBUcmFuc2l0aW9uW10ge1xyXG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuXHJcblx0XHRjb25zdCBydWxlSW5mb3M6IFJ1bGVJbmZvW10gPSB0aGlzLmdldFJ1bGVJbmZvcyhydWxlTmFtZSk7XHJcblx0XHRjb25zdCByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cclxuXHRcdGZvciAobGV0IHkgPSBmcm9tWWVhcjsgeSA8PSB0b1llYXI7IHkrKykge1xyXG5cdFx0XHRsZXQgcHJldkluZm86IFJ1bGVJbmZvID0gbnVsbDtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBydWxlSW5mb3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBydWxlSW5mbzogUnVsZUluZm8gPSBydWxlSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby50cmFuc2l0aW9uVGltZVV0Yyh5LCBzdGFuZGFyZE9mZnNldCwgcHJldkluZm8pLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5zYXZlLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5sZXR0ZXIpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldkluZm8gPSBydWxlSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGJvdGggem9uZSBhbmQgcnVsZSBjaGFuZ2VzIGFzIHRvdGFsIChzdGQgKyBkc3QpIG9mZnNldHMuXHJcblx0ICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcblx0ICovXHJcblx0cHVibGljIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyKTogVHJhbnNpdGlvbltdIHtcclxuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcblxyXG5cdFx0Y29uc3Qgc3RhcnRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IGZyb21ZZWFyIH0pO1xyXG5cdFx0Y29uc3QgZW5kTWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB0b1llYXIgKyAxIH0pO1xyXG5cclxuXHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRhc3NlcnQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwiRW1wdHkgem9uZUluZm9zIGFycmF5IHJldHVybmVkIGZyb20gZ2V0Wm9uZUluZm9zKClcIik7XHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0OiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHJcblx0XHRsZXQgcHJldlpvbmU6IFpvbmVJbmZvID0gbnVsbDtcclxuXHRcdGxldCBwcmV2VW50aWxZZWFyOiBudW1iZXI7XHJcblx0XHRsZXQgcHJldlN0ZE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdGxldCBwcmV2RHN0T2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0bGV0IHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0Y29uc3QgdW50aWxZZWFyOiBudW1iZXIgPSB6b25lSW5mby51bnRpbCA/IG5ldyBUaW1lU3RydWN0KHpvbmVJbmZvLnVudGlsKS5jb21wb25lbnRzLnllYXIgOiB0b1llYXIgKyAxO1xyXG5cdFx0XHR2YXIgc3RkT2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZTdGRPZmZzZXQ7XHJcblx0XHRcdHZhciBkc3RPZmZzZXQ6IER1cmF0aW9uID0gcHJldkRzdE9mZnNldDtcclxuXHRcdFx0dmFyIGxldHRlcjogc3RyaW5nID0gcHJldkxldHRlcjtcclxuXHJcblx0XHRcdC8vIHpvbmUgYXBwbGljYWJsZT9cclxuXHRcdFx0aWYgKChwcmV2Wm9uZSA9PT0gbnVsbCB8fCBwcmV2Wm9uZS51bnRpbCA8IGVuZE1pbGxpcyAtIDEpXHJcblx0XHRcdFx0JiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID49IHN0YXJ0TWlsbGlzKSkge1xyXG5cclxuXHRcdFx0XHRzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcblxyXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdFx0XHQvLyAoZS5nLiBMeWJpYSlcclxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgcnVsZUluZm9zLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBydWxlSW5mbyA9IHJ1bGVJbmZvc1tqXTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby5hcHBsaWNhYmxlKHByZXZVbnRpbFllYXIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby50cmFuc2l0aW9uVGltZVV0YyhwcmV2VW50aWxZZWFyLCBzdGRPZmZzZXQsIG51bGwpID09PSBwcmV2Wm9uZS51bnRpbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIGFkZCBhIHRyYW5zaXRpb24gZm9yIHRoZSB6b25lIHRyYW5zaXRpb25cclxuXHRcdFx0XHRjb25zdCBhdDogbnVtYmVyID0gKHByZXZab25lID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XHJcblx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24oYXQsIHN0ZE9mZnNldC5hZGQoZHN0T2Zmc2V0KSwgbGV0dGVyKSk7XHJcblxyXG5cdFx0XHRcdC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgZHN0VHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxyXG5cdFx0XHRcdFx0XHR6b25lSW5mby5ydWxlTmFtZSxcclxuXHRcdFx0XHRcdFx0cHJldlVudGlsWWVhciAhPT0gdW5kZWZpbmVkID8gTWF0aC5tYXgocHJldlVudGlsWWVhciwgZnJvbVllYXIpIDogZnJvbVllYXIsXHJcblx0XHRcdFx0XHRcdE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSxcclxuXHRcdFx0XHRcdFx0c3RkT2Zmc2V0XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBkc3RUcmFuc2l0aW9ucy5sZW5ndGg7ICsraykge1xyXG5cdFx0XHRcdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gZHN0VHJhbnNpdGlvbnNba107XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldlpvbmUgPSB6b25lSW5mbztcclxuXHRcdFx0cHJldlVudGlsWWVhciA9IHVudGlsWWVhcjtcclxuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuXHRcdFx0cHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuXHRcdFx0cHJldkxldHRlciA9IGxldHRlcjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWUgc3RhbXAgYXMgdW5peCBtaWxsaXNlY29uZHMgb3IgYXMgYSBUaW1lU3RydWN0XHJcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBab25lSW5mbyB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBab25lSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lLCBhZnRlclxyXG5cdCAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcclxuXHQgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvcyh6b25lTmFtZTogc3RyaW5nKTogWm9uZUluZm9bXSB7XHJcblx0XHQvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRha2UgZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCByZXN1bHQ6IFpvbmVJbmZvW10gPSBbXTtcclxuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdC8vIGZpbmFsIHpvbmUgaW5mbyBmb3VuZFxyXG5cdFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHpvbmVFbnRyaWVzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzW2ldO1xyXG5cdFx0XHRjb25zdCBydWxlVHlwZTogUnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuXHRcdFx0bGV0IHVudGlsOiBudW1iZXIgPSBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVszXSk7XHJcblx0XHRcdGlmIChpc05hTih1bnRpbCkpIHtcclxuXHRcdFx0XHR1bnRpbCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhcclxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKC0xICogbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbMF0pKSxcclxuXHRcdFx0XHRydWxlVHlwZSxcclxuXHRcdFx0XHRydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0ID8gbmV3IER1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgRHVyYXRpb24oKSxcclxuXHRcdFx0XHRydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLFxyXG5cdFx0XHRcdHpvbmVFbnRyeVsyXSxcclxuXHRcdFx0XHR1bnRpbFxyXG5cdFx0XHQpKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogWm9uZUluZm8sIGI6IFpvbmVJbmZvKTogbnVtYmVyID0+IHtcclxuXHRcdFx0Ly8gc29ydCBudWxsIGxhc3RcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoYS51bnRpbCAhPT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgIT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gKGEudW50aWwgLSBiLnVudGlsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdID0gcmVzdWx0O1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ydWxlSW5mb0NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogUnVsZUluZm9bXSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuXHQgKiBzb3J0ZWQgYnkgZmlyc3QgZWZmZWN0aXZlIGRhdGUgKHVuY29tcGVuc2F0ZWQgZm9yIFwid1wiIG9yIFwic1wiIEF0VGltZSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG5cdCAqIEByZXR1cm4gUnVsZUluZm8gYXJyYXkuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFJ1bGVJbmZvcyhydWxlTmFtZTogc3RyaW5nKTogUnVsZUluZm9bXSB7XHJcblx0XHQvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuXHRcdGlmICghdGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBzZXQgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZXR1cm4gZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCByZXN1bHQ6IFJ1bGVJbmZvW10gPSBbXTtcclxuXHRcdGNvbnN0IHJ1bGVTZXQgPSB0aGlzLl9kYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZVNldC5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRjb25zdCBydWxlID0gcnVsZVNldFtpXTtcclxuXHJcblx0XHRcdGNvbnN0IGZyb21ZZWFyOiBudW1iZXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XHJcblx0XHRcdGNvbnN0IHRvVHlwZTogVG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuXHRcdFx0Y29uc3QgdG9ZZWFyOiBudW1iZXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcblx0XHRcdGNvbnN0IG9uVHlwZTogT25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcclxuXHRcdFx0Y29uc3Qgb25EYXk6IG51bWJlciA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG5cdFx0XHRjb25zdCBvbldlZWtEYXk6IFdlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xyXG5cdFx0XHRjb25zdCBtb250aE5hbWU6IHN0cmluZyA9IDxzdHJpbmc+cnVsZVszXTtcclxuXHRcdFx0Y29uc3QgbW9udGhOdW1iZXI6IG51bWJlciA9IG1vbnRoTmFtZVRvU3RyaW5nKG1vbnRoTmFtZSk7XHJcblxyXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgUnVsZUluZm8oXHJcblx0XHRcdFx0ZnJvbVllYXIsXHJcblx0XHRcdFx0dG9UeXBlLFxyXG5cdFx0XHRcdHRvWWVhcixcclxuXHRcdFx0XHRydWxlWzJdLFxyXG5cdFx0XHRcdG1vbnRoTnVtYmVyLFxyXG5cdFx0XHRcdG9uVHlwZSxcclxuXHRcdFx0XHRvbkRheSxcclxuXHRcdFx0XHRvbldlZWtEYXksXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzBdLCAxMCksIDI0KSwgLy8gbm90ZSB0aGUgZGF0YWJhc2Ugc29tZXRpbWVzIGNvbnRhaW5zIFwiMjRcIiBhcyBob3VyIHZhbHVlXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzFdLCAxMCksIDYwKSxcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLFxyXG5cdFx0XHRcdHRoaXMucGFyc2VBdFR5cGUocnVsZVs1XVszXSksXHJcblx0XHRcdFx0RHVyYXRpb24ubWludXRlcyhwYXJzZUludChydWxlWzZdLCAxMCkpLFxyXG5cdFx0XHRcdHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN11cclxuXHRcdFx0XHQpKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFJ1bGVJbmZvLCBiOiBSdWxlSW5mbyk6IG51bWJlciA9PiB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoYS5lZmZlY3RpdmVFcXVhbChiKSkge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xyXG5cdFx0XHRcdHJldHVybiAtMTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZVJ1bGVUeXBlKHJ1bGU6IHN0cmluZyk6IFJ1bGVUeXBlIHtcclxuXHRcdGlmIChydWxlID09PSBcIi1cIikge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuTm9uZTtcclxuXHRcdH0gZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuT2Zmc2V0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIFRPIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZVRvVHlwZSh0bzogc3RyaW5nKTogVG9UeXBlIHtcclxuXHRcdGlmICh0byA9PT0gXCJtYXhcIikge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLk1heDtcclxuXHRcdH0gZWxzZSBpZiAodG8gPT09IFwib25seVwiKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XHJcblx0XHR9IGVsc2UgaWYgKCFpc05hTihwYXJzZUludCh0bywgMTApKSkge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLlllYXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUTyBjb2x1bW4gaW5jb3JyZWN0OiBcIiArIHRvKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uVHlwZShvbjogc3RyaW5nKTogT25UeXBlIHtcclxuXHRcdGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5MYXN0WDtcclxuXHRcdH1cclxuXHRcdGlmIChvbi5pbmRleE9mKFwiPD1cIikgIT09IC0xKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuTGVxWDtcclxuXHRcdH1cclxuXHRcdGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuR3JlcVg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gT25UeXBlLkRheU51bTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uRGF5KG9uOiBzdHJpbmcsIG9uVHlwZTogT25UeXBlKTogbnVtYmVyIHtcclxuXHRcdHN3aXRjaCAob25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcclxuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZU9uV2Vla0RheShvbjogc3RyaW5nKTogV2Vla0RheSB7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG5cdFx0XHRpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRyZXR1cm4gPFdlZWtEYXk+aTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIFdlZWtEYXkuU3VuZGF5O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBwYXJzZUF0VHlwZShhdDogYW55KTogQXRUeXBlIHtcclxuXHRcdHN3aXRjaCAoYXQpIHtcclxuXHRcdFx0Y2FzZSBcInNcIjogcmV0dXJuIEF0VHlwZS5TdGFuZGFyZDtcclxuXHRcdFx0Y2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwielwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG5pbnRlcmZhY2UgTWluTWF4SW5mbyB7XHJcblx0bWluRHN0U2F2ZTogbnVtYmVyO1xyXG5cdG1heERzdFNhdmU6IG51bWJlcjtcclxuXHRtaW5HbXRPZmY6IG51bWJlcjtcclxuXHRtYXhHbXRPZmY6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGE6IGFueSk6IE1pbk1heEluZm8ge1xyXG5cdGNvbnN0IHJlc3VsdDogTWluTWF4SW5mbyA9IHtcclxuXHRcdG1pbkRzdFNhdmU6IG51bGwsXHJcblx0XHRtYXhEc3RTYXZlOiBudWxsLFxyXG5cdFx0bWluR210T2ZmOiBudWxsLFxyXG5cdFx0bWF4R210T2ZmOiBudWxsXHJcblx0fTtcclxuXHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gcnVsZXMgcHJvcGVydHlcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyB6b25lcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblxyXG5cdC8vIHZhbGlkYXRlIHpvbmVzXHJcblx0Zm9yIChsZXQgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xyXG5cdFx0aWYgKGRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdGNvbnN0IHpvbmVBcnI6IGFueSA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0XHRpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoPHN0cmluZz56b25lQXJyKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgPHN0cmluZz56b25lQXJyICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBlbnRyeTogYW55ID0gem9uZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjb25zdCBnbXRvZmYgPSBtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzBdKTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGlzTmFOKGdtdG9mZikpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5tYXhHbXRPZmYgPSBnbXRvZmY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB2YWxpZGF0ZSBydWxlc1xyXG5cdGZvciAobGV0IHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcclxuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBydWxlQXJyOiBhbnkgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBydWxlID0gcnVsZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IG9mIGxlbmd0aCA4XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbMF0gIT09IFwiTmFOXCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVswXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMV0gaXMgbm90IGEgbnVtYmVyLCBvbmx5IG9yIG1heFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFUek1vbnRoTmFtZXMuaGFzT3duUHJvcGVydHkocnVsZVszXSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bM10gaXMgbm90IGEgbW9udGggbmFtZVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNF0uc3Vic3RyKDAsIDQpICE9PSBcImxhc3RcIiAmJiBydWxlWzRdLmluZGV4T2YoXCI+PVwiKSA9PT0gLTFcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpXHJcblx0XHRcdFx0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzRdIGlzIG5vdCBhIGtub3duIHR5cGUgb2YgZXhwcmVzc2lvblwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVbNV0pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnN0IHNhdmU6IG51bWJlciA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4oc2F2ZSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNl0gZG9lcyBub3QgY29udGFpbiBhIHZhbGlkIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNhdmUgIT09IDApIHtcclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gbnVsbCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSBudWxsIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZ2xvYmFsc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BlcmlvZFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG4iXX0=
