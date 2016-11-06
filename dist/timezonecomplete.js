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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZm9ybWF0LmpzIiwiZGlzdC9saWIvZ2xvYmFscy5qcyIsImRpc3QvbGliL2phdmFzY3JpcHQuanMiLCJkaXN0L2xpYi9tYXRoLmpzIiwiZGlzdC9saWIvcGFyc2UuanMiLCJkaXN0L2xpYi9wZXJpb2QuanMiLCJkaXN0L2xpYi9zdHJpbmdzLmpzIiwiZGlzdC9saWIvdGltZXNvdXJjZS5qcyIsImRpc3QvbGliL3RpbWV6b25lLmpzIiwiZGlzdC9saWIvdG9rZW4uanMiLCJkaXN0L2xpYi90ei1kYXRhYmFzZS5qcyIsImRpc3QvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqeUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDLzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5bkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMXFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ24rQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcclxuICAgIGlmICghY29uZGl0aW9uKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG59XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gYXNzZXJ0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWE56WlhKMExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJ4cFlpOWhjM05sY25RdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUU3TzBkQlJVYzdRVUZGU0N4WlFVRlpMRU5CUVVNN1FVRkZZaXhuUWtGQlowSXNVMEZCWXl4RlFVRkZMRTlCUVdVN1NVRkRPVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03U1VGRE1VSXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHRyUWtGQlpTeE5RVUZOTEVOQlFVTWlmUT09IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XHJcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFdlZWtEYXkpIHtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlR1ZXNkYXlcIl0gPSAyXSA9IFwiVHVlc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIkZyaWRheVwiXSA9IDVdID0gXCJGcmlkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XHJcbn0pKGV4cG9ydHMuV2Vla0RheSB8fCAoZXhwb3J0cy5XZWVrRGF5ID0ge30pKTtcclxudmFyIFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXk7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRpbWVVbml0KSB7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1pbGxpc2Vjb25kXCJdID0gMF0gPSBcIk1pbGxpc2Vjb25kXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIlNlY29uZFwiXSA9IDFdID0gXCJTZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWludXRlXCJdID0gMl0gPSBcIk1pbnV0ZVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJIb3VyXCJdID0gM10gPSBcIkhvdXJcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiRGF5XCJdID0gNF0gPSBcIkRheVwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJXZWVrXCJdID0gNV0gPSBcIldlZWtcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTW9udGhcIl0gPSA2XSA9IFwiTW9udGhcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiWWVhclwiXSA9IDddID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxyXG4gICAgICovXHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1BWFwiXSA9IDhdID0gXCJNQVhcIjtcclxufSkoZXhwb3J0cy5UaW1lVW5pdCB8fCAoZXhwb3J0cy5UaW1lVW5pdCA9IHt9KSk7XHJcbnZhciBUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQ7XHJcbi8qKlxyXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cclxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xyXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXHJcbiAqXHJcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxyXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpIHtcclxuICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzID0gdGltZVVuaXRUb01pbGxpc2Vjb25kcztcclxuLyoqXHJcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXHJcbiAqIGlmIG5lY2Vzc2FyeS5cclxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcclxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQsIGFtb3VudCkge1xyXG4gICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDE7IH1cclxuICAgIHZhciByZXN1bHQgPSBUaW1lVW5pdFt1bml0XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBcInNcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnRpbWVVbml0VG9TdHJpbmcgPSB0aW1lVW5pdFRvU3RyaW5nO1xyXG5mdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHMpIHtcclxuICAgIHZhciB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcclxuICAgICAgICB2YXIgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xyXG4gICAgICAgIGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gc3RyaW5nVG9UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcclxuICAgIC8vIGZyb20gV2lraXBlZGlhOlxyXG4gICAgLy8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBsZWFwIHllYXJcclxuICAgIGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmlzTGVhcFllYXIgPSBpc0xlYXBZZWFyO1xyXG4vKipcclxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcclxuICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5ZZWFyID0gZGF5c0luWWVhcjtcclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgc3dpdGNoIChtb250aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgIGNhc2UgNzpcclxuICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgY2FzZSAxMDpcclxuICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICByZXR1cm4gMzE7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgIGNhc2UgOTpcclxuICAgICAgICBjYXNlIDExOlxyXG4gICAgICAgICAgICByZXR1cm4gMzA7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5Nb250aCA9IGRheXNJbk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKi9cclxuZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIHZhciB5ZWFyRGF5ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG4gICAgICAgIHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcbiAgICB9XHJcbiAgICB5ZWFyRGF5ICs9IChkYXkgLSAxKTtcclxuICAgIHJldHVybiB5ZWFyRGF5O1xyXG59XHJcbmV4cG9ydHMuZGF5T2ZZZWFyID0gZGF5T2ZZZWFyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBlbmRPZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG4gICAgdmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMubGFzdFdlZWtEYXlPZk1vbnRoID0gbGFzdFdlZWtEYXlPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKlxyXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIHZhciBiZWdpbk9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiAxIH0pO1xyXG4gICAgdmFyIGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5maXJzdFdlZWtEYXlPZk1vbnRoID0gZmlyc3RXZWVrRGF5T2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSB3ZWVrRGF5T25PckFmdGVyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXHJcbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xyXG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgdmFyIGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuICAgIHZhciBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgaWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XHJcbiAgICAgICAgaWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xyXG4gICAgICAgICAgICAvLyBXZWVrIDFcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuICAgICAgICAgICAgaWYgKG1vbnRoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRGVmYXVsdCBjYXNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBKYW51YXJ5XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgdmFyIGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuICAgIGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xyXG4gICAgICAgIGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE5vcm1hbCBjYXNlXHJcbiAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG4gICAgaWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMud2Vla09mTW9udGggPSB3ZWVrT2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpIHtcclxuICAgIC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXHJcbiAgICB2YXIgcmVzdWx0ID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xyXG4gICAgaWYgKHJlc3VsdCA+IDMpIHtcclxuICAgICAgICByZXN1bHQgLT0gNztcclxuICAgICAgICBpZiAocmVzdWx0IDwgMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKi9cclxuZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICB2YXIgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG4gICAgLy8gY2hlY2sgZW5kLW9mLXllYXIgY29ybmVyIGNhc2U6IG1heSBiZSB3ZWVrIDEgb2YgbmV4dCB5ZWFyXHJcbiAgICBpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcbiAgICAgICAgdmFyIG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xyXG4gICAgICAgIGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2VcclxuICAgIHZhciB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xyXG4gICAgaWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcclxuICAgICAgICAvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxyXG4gICAgICAgIHZhciB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG4gICAgICAgIGlmIChkb3kgPCB3ZWVrVHdvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHdlZWtUd28pIC8gNykgKyAyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxyXG4gICAgaWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xyXG4gICAgICAgIC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXHJcbiAgICAgICAgcmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICB9XHJcbiAgICAvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcclxufVxyXG5leHBvcnRzLndlZWtOdW1iZXIgPSB3ZWVrTnVtYmVyO1xyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml4TWlsbGlzKSA9PT0gXCJudW1iZXJcIiwgXCJudW1iZXIgaW5wdXQgZXhwZWN0ZWRcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KCFpc05hTih1bml4TWlsbGlzKSwgXCJOYU4gbm90IGV4cGVjdGVkIGFzIGlucHV0XCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChtYXRoLmlzSW50KHVuaXhNaWxsaXMpLCBcIkV4cGVjdCBpbnRlZ2VyIG51bWJlciBmb3IgdW5peCBVVEMgdGltZXN0YW1wXCIpO1xyXG59XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5mdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XHJcbiAgICBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIHRlbXAgPSB1bml4TWlsbGlzO1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwIH07XHJcbiAgICB2YXIgeWVhcjtcclxuICAgIHZhciBtb250aDtcclxuICAgIGlmICh1bml4TWlsbGlzID49IDApIHtcclxuICAgICAgICByZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IHRlbXAgJSA2MDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG4gICAgICAgIHllYXIgPSAxOTcwO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJblllYXIoeWVhcikpIHtcclxuICAgICAgICAgICAgdGVtcCAtPSBkYXlzSW5ZZWFyKHllYXIpO1xyXG4gICAgICAgICAgICB5ZWFyKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC55ZWFyID0geWVhcjtcclxuICAgICAgICBtb250aCA9IDE7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPj0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXHJcbiAgICAgICAgLy8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuICAgICAgICByZXN1bHQubWlsbGkgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDEwMDApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuICAgICAgICByZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuICAgICAgICByZXN1bHQuaG91ciA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMjQpO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcbiAgICAgICAgeWVhciA9IDE5Njk7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcbiAgICAgICAgICAgIHllYXItLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xyXG4gICAgICAgIG1vbnRoID0gMTI7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgICAgICAgICBtb250aC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcclxuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMudW5peFRvVGltZU5vTGVhcFNlY3MgPSB1bml4VG9UaW1lTm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIEZpbGwgeW91IGFueSBtaXNzaW5nIHRpbWUgY29tcG9uZW50IHBhcnRzLCBkZWZhdWx0cyBhcmUgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpIHtcclxuICAgIHZhciBpbnB1dCA9IHtcclxuICAgICAgICB5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcclxuICAgICAgICBtb250aDogdHlwZW9mIGNvbXBvbmVudHMubW9udGggPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1vbnRoIDogMSxcclxuICAgICAgICBkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcclxuICAgICAgICBob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcclxuICAgICAgICBtaW51dGU6IHR5cGVvZiBjb21wb25lbnRzLm1pbnV0ZSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWludXRlIDogMCxcclxuICAgICAgICBzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcclxuICAgICAgICBtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbn1cclxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICB2YXIgY29tcG9uZW50cyA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSA6IGEpO1xyXG4gICAgdmFyIGlucHV0ID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XHJcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXHJcbiAgICAgICAgKGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcbiAgICAgICAgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDEpIC8gMTAwKSAqIDg2NDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDAgKyAyOTkpIC8gNDAwKSAqIDg2NDAwKTtcclxufVxyXG5leHBvcnRzLnRpbWVUb1VuaXhOb0xlYXBTZWNzID0gdGltZVRvVW5peE5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZXBvY2hEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xyXG4gICAgdmFyIGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG4gICAgcmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcclxufVxyXG5leHBvcnRzLndlZWtEYXlOb0xlYXBTZWNzID0gd2Vla0RheU5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XHJcbiAgICByZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRPZkRheSA9IHNlY29uZE9mRGF5O1xyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG52YXIgVGltZVN0cnVjdCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVTdHJ1Y3QoYSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXHJcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICAgICAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAgICAgKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXHJcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gICAgICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICAgICAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xyXG4gICAgICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbVVuaXggPSBmdW5jdGlvbiAodW5peE1pbGxpcykge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIEphdmFTY3JpcHQgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGRmXHRXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tRGF0ZSA9IGZ1bmN0aW9uIChkLCBkZikge1xyXG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldFVUQ0Z1bGxZZWFyKCksIG1vbnRoOiBkLmdldFVUQ01vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0VVRDRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21TdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyID0gMTk3MDtcclxuICAgICAgICAgICAgdmFyIG1vbnRoID0gMTtcclxuICAgICAgICAgICAgdmFyIGRheSA9IDE7XHJcbiAgICAgICAgICAgIHZhciBob3VyID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbnV0ZSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25NaWxsaXMgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIG1haW4gcGFydFxyXG4gICAgICAgICAgICB2YXIgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Jhc2ljRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFueSBcIlRcIiBzZXBhcmF0b3JcclxuICAgICAgICAgICAgICAgIHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLCBcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoOCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEwLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlQW5kVGltZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoMCwgNCksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoNSwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBwYXJzZSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZyYWN0aW9uID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxhc3RVbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XHJcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInVuaXhNaWxsaXNcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhNaWxsaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiY29tcG9uZW50c1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInllYXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibW9udGhcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImRheVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImhvdXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWludXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwic2Vjb25kXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWlsbGlcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5LW9mLXllYXIgMC0zNjVcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUueWVhckRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKSA9PT0gb3RoZXIudmFsdWVPZigpO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fY29tcG9uZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fdW5peE1pbGxpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcclxuICAgICAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSB0aW1lc3RhbXAgaXMgdmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICB9O1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGltZVN0cnVjdDtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lU3RydWN0ID0gVGltZVN0cnVjdDtcclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxyXG4gKi9cclxuZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXgoYXJyLCBjb21wYXJlKSB7XHJcbiAgICB2YXIgbWluSW5kZXggPSAwO1xyXG4gICAgdmFyIG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgY3VycmVudEluZGV4O1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG4gICAgLy8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxyXG4gICAgaWYgKCFhcnIpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICAvLyBvdXQgb2YgYm91bmRzXHJcbiAgICBpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG1heEluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIC8vIGVsZW1lbnQgaW4gcmFuZ2VcclxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IE1hdGguZmxvb3IoKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMik7XHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuICAgICAgICBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBiaW5hcnlJbnNlcnRpb25JbmRleDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWW1GemFXTnpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyeHBZaTlpWVhOcFkzTXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdSMEZKUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVWaUxIVkNRVUZ0UWl4VlFVRlZMRU5CUVVNc1EwRkJRVHRCUVVNNVFpd3lRa0ZCT0VJc1kwRkJZeXhEUVVGRExFTkJRVUU3UVVGRE4wTXNTVUZCV1N4SlFVRkpMRmRCUVUwc1VVRkJVU3hEUVVGRExFTkJRVUU3UVVGREwwSXNTVUZCV1N4UFFVRlBMRmRCUVUwc1YwRkJWeXhEUVVGRExFTkJRVUU3UVVGelJYSkRPenM3UjBGSFJ6dEJRVU5JTEZkQlFWa3NUMEZCVHp0SlFVTnNRaXg1UTBGQlRTeERRVUZCTzBsQlEwNHNlVU5CUVUwc1EwRkJRVHRKUVVOT0xESkRRVUZQTEVOQlFVRTdTVUZEVUN3clEwRkJVeXhEUVVGQk8wbEJRMVFzTmtOQlFWRXNRMEZCUVR0SlFVTlNMSGxEUVVGTkxFTkJRVUU3U1VGRFRpdzJRMEZCVVN4RFFVRkJPMEZCUTFRc1EwRkJReXhGUVZKWExHVkJRVThzUzBGQlVDeGxRVUZQTEZGQlVXeENPMEZCVWtRc1NVRkJXU3hQUVVGUExFZEJRVkFzWlVGUldDeERRVUZCTzBGQlJVUTdPMGRCUlVjN1FVRkRTQ3hYUVVGWkxGRkJRVkU3U1VGRGJrSXNjVVJCUVZjc1EwRkJRVHRKUVVOWUxESkRRVUZOTEVOQlFVRTdTVUZEVGl3eVEwRkJUU3hEUVVGQk8wbEJRMDRzZFVOQlFVa3NRMEZCUVR0SlFVTktMSEZEUVVGSExFTkJRVUU3U1VGRFNDeDFRMEZCU1N4RFFVRkJPMGxCUTBvc2VVTkJRVXNzUTBGQlFUdEpRVU5NTEhWRFFVRkpMRU5CUVVFN1NVRkRTanM3VDBGRlJ6dEpRVU5JTEhGRFFVRkhMRU5CUVVFN1FVRkRTaXhEUVVGRExFVkJZbGNzWjBKQlFWRXNTMEZCVWl4blFrRkJVU3hSUVdGdVFqdEJRV0pFTEVsQlFWa3NVVUZCVVN4SFFVRlNMR2RDUVdGWUxFTkJRVUU3UVVGRlJEczdPenM3T3p0SFFVOUhPMEZCUTBnc1owTkJRWFZETEVsQlFXTTdTVUZEY0VRc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTmtMRXRCUVVzc1VVRkJVU3hEUVVGRExGZEJRVmNzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNCRExFdEJRVXNzVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRE8xRkJRMnhETEV0QlFVc3NVVUZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFTkJRVU1zUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVTjJReXhMUVVGTExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNUVUZCVFN4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETzFGQlF6RkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRPMUZCUTI1RExFdEJRVXNzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF6dFJRVU40UXl4TFFVRkxMRkZCUVZFc1EwRkJReXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEVWQlFVVXNSMEZCUnl4UlFVRlJMRU5CUVVNN1VVRkRNVU1zUzBGQlN5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEZGQlFWRXNRMEZCUXp0UlFVTTVReXd3UWtGQk1FSTdVVUZETVVJN1dVRkRReXgzUWtGQmQwSTdXVUZEZUVJc01FSkJRVEJDTzFsQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhEUVVGRE8xbEJRM1JETEVOQlFVTTdTVUZEU0N4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVd4Q1pTdzRRa0ZCYzBJc2VVSkJhMEp5UXl4RFFVRkJPMEZCUlVRN096czdPMGRCUzBjN1FVRkRTQ3d3UWtGQmFVTXNTVUZCWXl4RlFVRkZMRTFCUVd0Q08wbEJRV3hDTEhOQ1FVRnJRaXhIUVVGc1FpeFZRVUZyUWp0SlFVTnNSU3hKUVVGTkxFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRkxFTkJRVU03U1VGRE5VTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zU1VGQlNTeE5RVUZOTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMjVETEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1NVRkRaaXhEUVVGRE8wbEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEVUN4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFZEJRVWNzUTBGQlF6dEpRVU55UWl4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVZCbExIZENRVUZuUWl4dFFrRlBMMElzUTBGQlFUdEJRVVZFTERCQ1FVRnBReXhEUVVGVE8wbEJRM3BETEVsQlFVMHNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0SlFVTjJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVOMlF5eEpRVUZOTEV0QlFVc3NSMEZCUnl4blFrRkJaMElzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRja01zUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4TFFVRkxMRTlCUVU4c1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eEhRVUZITEVOQlFVTXNTMEZCU3l4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JFTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVU5FTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc05FSkJRVFJDTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRM3BFTEVOQlFVTTdRVUZVWlN4M1FrRkJaMElzYlVKQlV5OUNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTEc5Q1FVRXlRaXhKUVVGWk8wbEJRM1JETEd0Q1FVRnJRanRKUVVOc1FpeHBSRUZCYVVRN1NVRkRha1FzYzBSQlFYTkVPMGxCUTNSRUxIZEVRVUYzUkR0SlFVTjRSQ3hwUWtGQmFVSTdTVUZEYWtJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0JDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1NVRkRaQ3hEUVVGRE8wbEJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETzBsQlEySXNRMEZCUXp0SlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE4wSXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJRenRKUVVOa0xFTkJRVU03U1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTlFMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU03U1VGRFlpeERRVUZETzBGQlEwWXNRMEZCUXp0QlFXWmxMR3RDUVVGVkxHRkJaWHBDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSUxHOUNRVUV5UWl4SlFVRlpPMGxCUTNSRExFMUJRVTBzUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEZGtNc1EwRkJRenRCUVVabExHdENRVUZWTEdGQlJYcENMRU5CUVVFN1FVRkZSRHM3T3p0SFFVbEhPMEZCUTBnc2NVSkJRVFJDTEVsQlFWa3NSVUZCUlN4TFFVRmhPMGxCUTNSRUxFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRaaXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU5RTEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUTFBc1MwRkJTeXhEUVVGRExFTkJRVU03VVVGRFVDeExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTlFMRXRCUVVzc1EwRkJReXhEUVVGRE8xRkJRMUFzUzBGQlN5eEZRVUZGTEVOQlFVTTdVVUZEVWl4TFFVRkxMRVZCUVVVN1dVRkRUaXhOUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETzFGQlExZ3NTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU55UXl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVOUUxFdEJRVXNzUTBGQlF5eERRVUZETzFGQlExQXNTMEZCU3l4RFFVRkRMRU5CUVVNN1VVRkRVQ3hMUVVGTExFVkJRVVU3V1VGRFRpeE5RVUZOTEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUTFnN1dVRkRReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF6ZERMRU5CUVVNN1FVRkRSaXhEUVVGRE8wRkJjRUpsTEcxQ1FVRlhMR05CYjBJeFFpeERRVUZCTzBGQlJVUTdPenM3T3p0SFFVMUhPMEZCUTBnc2JVSkJRVEJDTEVsQlFWa3NSVUZCUlN4TFFVRmhMRVZCUVVVc1IwRkJWenRKUVVOcVJTeG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFbEJRVWtzUzBGQlN5eEpRVUZKTEVWQlFVVXNSVUZCUlN4dlFrRkJiMElzUTBGQlF5eERRVUZETzBsQlEzaEVMR2RDUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNSVUZCUlN4clFrRkJhMElzUTBGQlF5eERRVUZETzBsQlEzaEZMRWxCUVVrc1QwRkJUeXhIUVVGWExFTkJRVU1zUTBGQlF6dEpRVU40UWl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlZ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRXRCUVVzc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETzFGQlEzaERMRTlCUVU4c1NVRkJTU3hYUVVGWExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTJwRExFTkJRVU03U1VGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGNrSXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJRenRCUVVOb1FpeERRVUZETzBGQlZHVXNhVUpCUVZNc1dVRlRlRUlzUTBGQlFUdEJRVVZFT3pzN096czdPenRIUVZGSE8wRkJRMGdzTkVKQlFXMURMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzVDBGQlowSTdTVUZETDBVc1NVRkJUU3hWUVVGVkxFZEJRV1VzU1VGQlNTeFZRVUZWTEVOQlFVTXNSVUZCUlN4VlFVRkpMRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUlVGQlJTeFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU01Uml4SlFVRk5MR2xDUVVGcFFpeEhRVUZITEdsQ1FVRnBRaXhEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnVSU3hKUVVGSkxFbEJRVWtzUjBGQlZ5eFBRVUZQTEVkQlFVY3NhVUpCUVdsQ0xFTkJRVU03U1VGREwwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEWkN4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJRMWdzUTBGQlF6dEpRVU5FTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZEZWtNc1EwRkJRenRCUVZKbExEQkNRVUZyUWl4eFFrRlJha01zUTBGQlFUdEJRVVZFT3pzN096czdPenRIUVZGSE8wRkJRMGdzTmtKQlFXOURMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzVDBGQlowSTdTVUZEYUVZc1NVRkJUU3haUVVGWkxFZEJRV1VzU1VGQlNTeFZRVUZWTEVOQlFVTXNSVUZCUlN4VlFVRkpMRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNoRkxFbEJRVTBzYlVKQlFXMUNMRWRCUVVjc2FVSkJRV2xDTEVOQlFVTXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wbEJRM1pGTEVsQlFVa3NTVUZCU1N4SFFVRlhMRTlCUVU4c1IwRkJSeXh0UWtGQmJVSXNRMEZCUXp0SlFVTnFSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOa0xFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEV0N4RFFVRkRPMGxCUTBRc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRCUVVNelF5eERRVUZETzBGQlVtVXNNa0pCUVcxQ0xITkNRVkZzUXl4RFFVRkJPMEZCUlVRN096dEhRVWRITzBGQlEwZ3NNRUpCUVdsRExFbEJRVmtzUlVGQlJTeExRVUZoTEVWQlFVVXNSMEZCVnl4RlFVRkZMRTlCUVdkQ08wbEJRekZHTEVsQlFVMHNTMEZCU3l4SFFVRmxMRWxCUVVrc1ZVRkJWU3hEUVVGRExFVkJRVVVzVlVGQlNTeEZRVUZGTEZsQlFVc3NSVUZCUlN4UlFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJReTlFTEVsQlFVMHNXVUZCV1N4SFFVRlpMR2xDUVVGcFFpeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVOc1JTeEpRVUZKTEVsQlFVa3NSMEZCVnl4UFFVRlBMRWRCUVVjc1dVRkJXU3hEUVVGRE8wbEJRekZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyUXNTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVOWUxFTkJRVU03U1VGRFJDeG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NTVUZCU1N4WFFVRlhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eEZRVUZGTEhGRFFVRnhReXhEUVVGRExFTkJRVU03U1VGRGRrY3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTndReXhEUVVGRE8wRkJWR1VzZDBKQlFXZENMRzFDUVZNdlFpeERRVUZCTzBGQlJVUTdPenRIUVVkSE8wRkJRMGdzTWtKQlFXdERMRWxCUVZrc1JVRkJSU3hMUVVGaExFVkJRVVVzUjBGQlZ5eEZRVUZGTEU5QlFXZENPMGxCUXpOR0xFbEJRVTBzUzBGQlN5eEhRVUZsTEVsQlFVa3NWVUZCVlN4RFFVRkRMRVZCUVVNc1ZVRkJTU3hGUVVGRkxGbEJRVXNzUlVGQlJTeFJRVUZITEVWQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpkRUxFbEJRVTBzV1VGQldTeEhRVUZaTEdsQ1FVRnBRaXhEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnNSU3hKUVVGSkxFbEJRVWtzUjBGQlZ5eFBRVUZQTEVkQlFVY3NXVUZCV1N4RFFVRkRPMGxCUXpGRExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMlFzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTllMRU5CUVVNN1NVRkRSQ3huUWtGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzU1VGQlNTeERRVUZETEVWQlFVVXNjVU5CUVhGRExFTkJRVU1zUTBGQlF6dEpRVU5vUml4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUTNCRExFTkJRVU03UVVGVVpTeDVRa0ZCYVVJc2IwSkJVMmhETEVOQlFVRTdRVUZGUkRzN096czdPenM3TzBkQlUwYzdRVUZEU0N4eFFrRkJORUlzU1VGQldTeEZRVUZGTEV0QlFXRXNSVUZCUlN4SFFVRlhPMGxCUTI1RkxFbEJRVTBzWVVGQllTeEhRVUZITEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVWQlFVVXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8wbEJRM3BGTEVsQlFVMHNWMEZCVnl4SFFVRkhMRzFDUVVGdFFpeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRVZCUVVVc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzBsQlEzSkZMSGRGUVVGM1JUdEpRVU40UlN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjJRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eGhRVUZoTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOcVF5eFRRVUZUTzFsQlExUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOV0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRGhDUVVFNFFqdFpRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRaaXhsUVVGbE8yZENRVU5tTEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzUjBGQlJ5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRla01zUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxGVkJRVlU3WjBKQlExWXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOMFF5eERRVUZETzFGQlEwWXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSQ3hKUVVGTkxGVkJRVlVzUjBGQlJ5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRKUVVOdVJTeEpRVUZOTEZsQlFWa3NSMEZCUnl4clFrRkJhMElzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU4yUlN4M1JVRkJkMFU3U1VGRGVFVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZGtJc1JVRkJSU3hEUVVGRExFTkJRVU1zVlVGQlZTeEhRVUZITEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRMMElzZFVKQlFYVkNPMWxCUTNaQ0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEVml4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRUxHTkJRV003U1VGRFpDeEpRVUZKTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZITEZkQlFWY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEpRVU55UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhoUVVGaExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjJRaXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETzBsQlEySXNRMEZCUXp0SlFVVkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03UVVGRFppeERRVUZETzBGQmNrTmxMRzFDUVVGWExHTkJjVU14UWl4RFFVRkJPMEZCUlVRN096czdSMEZKUnp0QlFVTklMRFpDUVVFMlFpeEpRVUZaTzBsQlEzaERMR2xGUVVGcFJUdEpRVU5xUlN4SlFVRkpMRTFCUVUwc1IwRkJWeXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRM1JGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyaENMRTFCUVUwc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRFdpeEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5vUWl4TlFVRk5MRWxCUVVrc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRlRU1zUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZEUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8wRkJRMllzUTBGQlF6dEJRVVZFT3pzN096czdPenM3TzBkQlZVYzdRVUZEU0N4dlFrRkJNa0lzU1VGQldTeEZRVUZGTEV0QlFXRXNSVUZCUlN4SFFVRlhPMGxCUTJ4RkxFbEJRVTBzUjBGQlJ5eEhRVUZITEZOQlFWTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBsQlJYaERMRFJFUVVFMFJEdEpRVU0xUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzQkRMRWxCUVUwc1pVRkJaU3hIUVVGSExHMUNRVUZ0UWl4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU4wUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhsUVVGbExFZEJRVWNzUTBGQlF5eEpRVUZKTEdWQlFXVXNTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVFTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFTEhORFFVRnpRenRKUVVOMFF5eEpRVUZOTEdWQlFXVXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eGxRVUZsTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlFpeG5RMEZCWjBNN1VVRkRhRU1zU1VGQlRTeFBRVUZQTEVkQlFVY3NaVUZCWlN4SFFVRkhMRU5CUVVNc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUXpORUxFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVVUZETlVNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJDeDFRMEZCZFVNN1NVRkRka01zUlVGQlJTeERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMR1ZCUVdVc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE0wSXNhMFJCUVd0RU8xRkJRMnhFTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRja01zUTBGQlF6dEpRVVZFTERCRVFVRXdSRHRKUVVNeFJDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eGxRVUZsTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGNFUXNRMEZCUXp0QlFTOUNaU3hyUWtGQlZTeGhRU3RDZWtJc1EwRkJRVHRCUVVkRUxEWkNRVUUyUWl4VlFVRnJRanRKUVVNNVF5eG5Ra0ZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eFJRVUZSTEVWQlFVVXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dEpRVU5zUlN4blFrRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZWQlFWVXNRMEZCUXl4RlFVRkZMREpDUVVFeVFpeERRVUZETEVOQlFVTTdTVUZEZUVRc1owSkJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRlZCUVZVc1EwRkJReXhGUVVGRkxEaERRVUU0UXl4RFFVRkRMRU5CUVVNN1FVRkRhRVlzUTBGQlF6dEJRVVZFT3pzN1IwRkhSenRCUVVOSUxEaENRVUZ4UXl4VlFVRnJRanRKUVVOMFJDeHRRa0ZCYlVJc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEpRVVZvUXl4SlFVRkpMRWxCUVVrc1IwRkJWeXhWUVVGVkxFTkJRVU03U1VGRE9VSXNTVUZCVFN4TlFVRk5MRWRCUVcxQ0xFVkJRVVVzU1VGQlNTeEZRVUZGTEVOQlFVTXNSVUZCUlN4TFFVRkxMRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRU5CUVVNc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUlVGQlF5eERRVUZETzBsQlEzSkhMRWxCUVVrc1NVRkJXU3hEUVVGRE8wbEJRMnBDTEVsQlFVa3NTMEZCWVN4RFFVRkRPMGxCUld4Q0xFVkJRVVVzUTBGQlF5eERRVUZETEZWQlFWVXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0pDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dFJRVU16UWl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRMMElzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRekZDTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRNVUlzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlF6ZENMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjRRaXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRk4wSXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVOYUxFOUJRVThzU1VGQlNTeEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8xbEJRMnBETEVsQlFVa3NTVUZCU1N4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRGVrSXNTVUZCU1N4RlFVRkZMRU5CUVVNN1VVRkRVaXhEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNN1VVRkZia0lzUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTldMRTlCUVU4c1NVRkJTU3hKUVVGSkxGZEJRVmNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVONlF5eEpRVUZKTEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVOVUxFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRSUVVOeVFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGRrSXNRMEZCUXp0SlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMUFzZVVWQlFYbEZPMUZCUTNwRkxEUkRRVUUwUXp0UlFVTTFReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF5OURMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVNdlFpeE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUXpsRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU0zUWl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRemxETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzFGQlF6VkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVVM1FpeEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUTFvc1QwRkJUeXhKUVVGSkxFZEJRVWNzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVOcVF5eEpRVUZKTEVsQlFVa3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRM3BDTEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTFJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUlc1Q0xFdEJRVXNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEV0N4UFFVRlBMRWxCUVVrc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVONlF5eEpRVUZKTEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVOVUxFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRSUVVOeVFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFZEJRVWNzVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOc1JDeERRVUZETzBsQlJVUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVObUxFTkJRVU03UVVFM1JHVXNORUpCUVc5Q0xIVkNRVFpFYmtNc1EwRkJRVHRCUVVWRU96dEhRVVZITzBGQlEwZ3NhVU5CUVdsRExGVkJRVFpDTzBsQlF6ZEVMRWxCUVUwc1MwRkJTeXhIUVVGSE8xRkJRMklzU1VGQlNTeEZRVUZGTEU5QlFVOHNWVUZCVlN4RFFVRkRMRWxCUVVrc1MwRkJTeXhSUVVGUkxFZEJRVWNzVlVGQlZTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpPMUZCUTJ4RkxFdEJRVXNzUlVGQlJTeFBRVUZQTEZWQlFWVXNRMEZCUXl4TFFVRkxMRXRCUVVzc1VVRkJVU3hIUVVGSExGVkJRVlVzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXp0UlFVTnNSU3hIUVVGSExFVkJRVVVzVDBGQlR5eFZRVUZWTEVOQlFVTXNSMEZCUnl4TFFVRkxMRkZCUVZFc1IwRkJSeXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVOQlFVTTdVVUZETlVRc1NVRkJTU3hGUVVGRkxFOUJRVThzVlVGQlZTeERRVUZETEVsQlFVa3NTMEZCU3l4UlFVRlJMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUjBGQlJ5eERRVUZETzFGQlF5OUVMRTFCUVUwc1JVRkJSU3hQUVVGUExGVkJRVlVzUTBGQlF5eE5RVUZOTEV0QlFVc3NVVUZCVVN4SFFVRkhMRlZCUVZVc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF6dFJRVU55UlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhWUVVGVkxFTkJRVU1zVFVGQlRTeExRVUZMTEZGQlFWRXNSMEZCUnl4VlFVRlZMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU03VVVGRGNrVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1ZVRkJWU3hEUVVGRExFdEJRVXNzUzBGQlN5eFJRVUZSTEVkQlFVY3NWVUZCVlN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRE8wdEJRMnhGTEVOQlFVTTdTVUZEUml4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wRkJRMlFzUTBGQlF6dEJRV3RDUkN3NFFrRkRReXhEUVVFMlFpeEZRVUZGTEV0QlFXTXNSVUZCUlN4SFFVRlpMRVZCUVVVc1NVRkJZU3hGUVVGRkxFMUJRV1VzUlVGQlJTeE5RVUZsTEVWQlFVVXNTMEZCWXp0SlFVVTFTQ3hKUVVGTkxGVkJRVlVzUjBGQmMwSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXl4RlFVRkZMRmxCUVVzc1JVRkJSU3hSUVVGSExFVkJRVVVzVlVGQlNTeEZRVUZGTEdOQlFVMHNSVUZCUlN4alFVRk5MRVZCUVVVc1dVRkJTeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEZWtnc1NVRkJUU3hMUVVGTExFZEJRVzFDTEhWQ1FVRjFRaXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEyeEZMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVTXpRaXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hIUVVGSExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEV0QlFVczdVVUZETlVjc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxPMUZCUXpWRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU03UVVGRGRrY3NRMEZCUXp0QlFWUmxMRFJDUVVGdlFpeDFRa0ZUYmtNc1EwRkJRVHRCUVVWRU96czdSMEZIUnp0QlFVTklMREpDUVVGclF5eFZRVUZyUWp0SlFVTnVSQ3h0UWtGQmJVSXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVWb1F5eEpRVUZOTEZGQlFWRXNSMEZCV1N4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRE8wbEJRek5ETEVsQlFVMHNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVlVGQlZTeEhRVUZITEVsQlFVa3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVOdVJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBGQlF6bENMRU5CUVVNN1FVRk9aU3g1UWtGQmFVSXNiMEpCVFdoRExFTkJRVUU3UVVGRlJEczdSMEZGUnp0QlFVTklMSEZDUVVFMFFpeEpRVUZaTEVWQlFVVXNUVUZCWXl4RlFVRkZMRTFCUVdNN1NVRkRka1VzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1IwRkJSeXhOUVVGTkxFTkJRVU03UVVGREwwTXNRMEZCUXp0QlFVWmxMRzFDUVVGWExHTkJSVEZDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSU8wbEJPRTFET3p0UFFVVkhPMGxCUTBnc2IwSkJRVmtzUTBGQk5rSTdVVUZEZUVNc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNelFpeEpRVUZKTEVOQlFVTXNWMEZCVnl4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOMFFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hKUVVGSkxFTkJRVU1zVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlF5OURMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJjazVFT3pzN096czdPenM3TzA5QlZVYzdTVUZEVnl4NVFrRkJZeXhIUVVFMVFpeFZRVU5ETEVsQlFXRXNSVUZCUlN4TFFVRmpMRVZCUVVVc1IwRkJXU3hGUVVNelF5eEpRVUZoTEVWQlFVVXNUVUZCWlN4RlFVRkZMRTFCUVdVc1JVRkJSU3hMUVVGak8xRkJSUzlFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhGUVVGRkxGVkJRVWtzUlVGQlJTeFpRVUZMTEVWQlFVVXNVVUZCUnl4RlFVRkZMRlZCUVVrc1JVRkJSU3hqUVVGTkxFVkJRVVVzWTBGQlRTeEZRVUZGTEZsQlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRNVVVzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOWExHMUNRVUZSTEVkQlFYUkNMRlZCUVhWQ0xGVkJRV3RDTzFGQlEzaERMRTFCUVUwc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnVReXhEUVVGRE8wbEJSVVE3T3pzN08wOUJTMGM3U1VGRFZ5eHRRa0ZCVVN4SFFVRjBRaXhWUVVGMVFpeERRVUZQTEVWQlFVVXNSVUZCYVVJN1VVRkRhRVFzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4TFFVRkxMREJDUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFZRVUZWTEVOQlFVTTdaMEpCUTNKQ0xFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNSMEZCUnl4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVTdaMEpCUTJoRkxFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRExGVkJRVlVzUlVGQlJTeEZRVUZGTEV0QlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNc1pVRkJaU3hGUVVGRk8yRkJRemxHTEVOQlFVTXNRMEZCUXp0UlFVTktMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEUxQlFVMHNRMEZCUXl4SlFVRkpMRlZCUVZVc1EwRkJRenRuUWtGRGNrSXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhqUVVGakxFVkJRVVVzUlVGQlJTeExRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRMRmRCUVZjc1JVRkJSU3hIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRMRlZCUVZVc1JVRkJSVHRuUWtGRGVrVXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRMR0ZCUVdFc1JVRkJSU3hGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTXNZVUZCWVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eHJRa0ZCYTBJc1JVRkJSVHRoUVVNeFJ5eERRVUZETEVOQlFVTTdVVUZEU2l4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlExY3NjVUpCUVZVc1IwRkJlRUlzVlVGQmVVSXNRMEZCVXp0UlFVTnFReXhKUVVGSkxFTkJRVU03V1VGRFNpeEpRVUZKTEVsQlFVa3NSMEZCVnl4SlFVRkpMRU5CUVVNN1dVRkRlRUlzU1VGQlNTeExRVUZMTEVkQlFWY3NRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFbEJRVWtzUjBGQlJ5eEhRVUZYTEVOQlFVTXNRMEZCUXp0WlFVTndRaXhKUVVGSkxFbEJRVWtzUjBGQlZ5eERRVUZETEVOQlFVTTdXVUZEY2tJc1NVRkJTU3hOUVVGTkxFZEJRVmNzUTBGQlF5eERRVUZETzFsQlEzWkNMRWxCUVVrc1RVRkJUU3hIUVVGWExFTkJRVU1zUTBGQlF6dFpRVU4yUWl4SlFVRkpMR05CUVdNc1IwRkJWeXhEUVVGRExFTkJRVU03V1VGREwwSXNTVUZCU1N4UlFVRlJMRWRCUVdFc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF6dFpRVVYyUXl3clFrRkJLMEk3V1VGREwwSXNTVUZCVFN4TFFVRkxMRWRCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNMVF5eG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhGUVVGRkxHZERRVUZuUXl4RFFVRkRMRU5CUVVNN1dVRkZha1lzYTBKQlFXdENPMWxCUTJ4Q0xFbEJRVTBzWVVGQllTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpsRExFVkJRVVVzUTBGQlF5eERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMjVDTEdkQ1FVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4dlEwRkJiME1zUTBGQlF5eEZRVU14UkN4clJrRkJhMFlzUTBGQlF5eERRVUZETzJkQ1FVVnlSaXd5UWtGQk1rSTdaMEpCUXpOQ0xFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRuUWtGRmNrTXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkZMRVZCUVVVc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVTjRSQ3gzUmtGQmQwWXNRMEZCUXl4RFFVRkRPMmRDUVVVelJpeEZRVUZGTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRekZDTEVsQlFVa3NSMEZCUnl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdiMEpCUXpORExGRkJRVkVzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVNeFFpeERRVUZETzJkQ1FVTkVMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETVVJc1MwRkJTeXhIUVVGSExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenR2UWtGRE5VTXNSMEZCUnl4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMREpGUVVFeVJUdHZRa0ZEZEVnc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTTdaMEpCUTNwQ0xFTkJRVU03WjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU16UWl4SlFVRkpMRWRCUVVjc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMjlDUVVNelF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJRenRuUWtGRE1VSXNRMEZCUXp0blFrRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpOQ0xFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03YjBKQlF6bERMRkZCUVZFc1IwRkJSeXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETzJkQ1FVTTFRaXhEUVVGRE8yZENRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE0wSXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0dlFrRkRPVU1zVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJRelZDTEVOQlFVTTdXVUZEUml4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNaMEpCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMSEZFUVVGeFJDeERRVUZETEVWQlFVVXNiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dG5Ra0ZEY0Vjc1NVRkJTU3hYUVVGWExFZEJRV0VzUlVGQlJTeERRVUZETzJkQ1FVTXZRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRNMElzVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTI1RExFTkJRVU03WjBKQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE1VSXNWMEZCVnl4SFFVRkhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTTNSQ3hEUVVGRE8yZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOUUxGZEJRVmNzUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF6dG5Ra0ZET1VJc1EwRkJRenRuUWtGRFJDeG5Ra0ZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUTI1RUxIZEdRVUYzUml4RFFVRkRMRU5CUVVNN1owSkJSVE5HTEVWQlFVVXNRMEZCUXl4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGFFTXNTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0dlFrRkRha1FzVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRekZDTEVOQlFVTTdaMEpCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnFReXhMUVVGTExFZEJRVWNzVVVGQlVTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8yOUNRVU5zUkN4SFFVRkhMRWRCUVVjc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc01rVkJRVEpGTzI5Q1FVTTFTQ3hSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVkQlFVY3NRMEZCUXp0blFrRkRla0lzUTBGQlF6dG5Ra0ZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEyaERMRWxCUVVrc1IwRkJSeXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN2IwSkJRMnBFTEZGQlFWRXNSMEZCUnl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRE8yZENRVU14UWl4RFFVRkRPMmRDUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRhRU1zVFVGQlRTeEhRVUZITEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF6dHZRa0ZEYmtRc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdaMEpCUXpWQ0xFTkJRVU03WjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5vUXl4TlFVRk5MRWRCUVVjc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMjlDUVVOdVJDeFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJRenRuUWtGRE5VSXNRMEZCUXp0WlFVTkdMRU5CUVVNN1dVRkZSQ3gzUWtGQmQwSTdXVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4SlFVRk5MRkZCUVZFc1IwRkJWeXhWUVVGVkxFTkJRVU1zU1VGQlNTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU55UkN4TlFVRk5MRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnNRaXhMUVVGTExGRkJRVkVzUTBGQlF5eEpRVUZKTzNkQ1FVRkZMRU5CUVVNN05FSkJRM0JDTEdOQlFXTXNSMEZCUnl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXp0M1FrRkRla1FzUTBGQlF6dDNRa0ZCUXl4TFFVRkxMRU5CUVVNN2IwSkJRMUlzUzBGQlN5eFJRVUZSTEVOQlFVTXNSMEZCUnp0M1FrRkJSU3hEUVVGRE96UkNRVU51UWl4alFVRmpMRWRCUVVjc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF6dDNRa0ZEZEVNc1EwRkJRenQzUWtGQlF5eExRVUZMTEVOQlFVTTdiMEpCUTFJc1MwRkJTeXhSUVVGUkxFTkJRVU1zU1VGQlNUdDNRa0ZCUlN4RFFVRkRPelJDUVVOd1FpeGpRVUZqTEVkQlFVY3NUMEZCVHl4SFFVRkhMRkZCUVZFc1EwRkJRenQzUWtGRGNrTXNRMEZCUXp0M1FrRkJReXhMUVVGTExFTkJRVU03YjBKQlExSXNTMEZCU3l4UlFVRlJMRU5CUVVNc1RVRkJUVHQzUWtGQlJTeERRVUZET3pSQ1FVTjBRaXhqUVVGakxFZEJRVWNzUzBGQlN5eEhRVUZITEZGQlFWRXNRMEZCUXp0M1FrRkRia01zUTBGQlF6dDNRa0ZCUXl4TFFVRkxMRU5CUVVNN2IwSkJRMUlzUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFR0M1FrRkJSU3hEUVVGRE96UkNRVU4wUWl4alFVRmpMRWRCUVVjc1NVRkJTU3hIUVVGSExGRkJRVkVzUTBGQlF6dDNRa0ZEYkVNc1EwRkJRenQzUWtGQlF5eExRVUZMTEVOQlFVTTdaMEpCUTFRc1EwRkJRenRaUVVOR0xFTkJRVU03V1VGRlJDeHRRMEZCYlVNN1dVRkRia01zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRE0wSXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZETjBJc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRla0lzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRE0wSXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZETDBJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRMMElzU1VGQlNTeFZRVUZWTEVkQlFWY3NiMEpCUVc5Q0xFTkJRVU1zUlVGQlJTeFZRVUZKTEVWQlFVVXNXVUZCU3l4RlFVRkZMRkZCUVVjc1JVRkJSU3hWUVVGSkxFVkJRVVVzWTBGQlRTeEZRVUZGTEdOQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRNVVlzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hIUVVGSExHTkJRV01zUTBGQlF5eERRVUZETzFsQlEzaEVMRTFCUVUwc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0UlFVTnVReXhEUVVGRk8xRkJRVUVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOYUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNOa0pCUVRaQ0xFZEJRVWNzUTBGQlF5eEhRVUZITEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGVrVXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRk5SQ3h6UWtGQlZ5eHJRMEZCVlR0aFFVRnlRanRaUVVORExFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRXRCUVVzc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExGZEJRVmNzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdXVUZETTBRc1EwRkJRenRaUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRPMUZCUTNwQ0xFTkJRVU03T3p0UFFVRkJPMGxCVFVRc2MwSkJRVmNzYTBOQlFWVTdZVUZCY2tJN1dVRkRReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4yUWl4SlFVRkpMRU5CUVVNc1YwRkJWeXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFpRVU16UkN4RFFVRkRPMWxCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEZWtJc1EwRkJRenM3TzA5QlFVRTdTVUY1UWtRc2MwSkJRVWtzTkVKQlFVazdZVUZCVWp0WlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTTNRaXhEUVVGRE96czdUMEZCUVR0SlFVVkVMSE5DUVVGSkxEWkNRVUZMTzJGQlFWUTdXVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZET1VJc1EwRkJRenM3TzA5QlFVRTdTVUZGUkN4elFrRkJTU3d5UWtGQlJ6dGhRVUZRTzFsQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETzFGQlF6VkNMRU5CUVVNN096dFBRVUZCTzBsQlJVUXNjMEpCUVVrc05FSkJRVWs3WVVGQlVqdFpRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU0zUWl4RFFVRkRPenM3VDBGQlFUdEpRVVZFTEhOQ1FVRkpMRGhDUVVGTk8yRkJRVlk3V1VGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGREwwSXNRMEZCUXpzN08wOUJRVUU3U1VGRlJDeHpRa0ZCU1N3NFFrRkJUVHRoUVVGV08xbEJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRE8xRkJReTlDTEVOQlFVTTdPenRQUVVGQk8wbEJSVVFzYzBKQlFVa3NOa0pCUVVzN1lVRkJWRHRaUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJRenRSUVVNNVFpeERRVUZET3pzN1QwRkJRVHRKUVVWRU96dFBRVVZITzBsQlEwa3NORUpCUVU4c1IwRkJaRHRSUVVORExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0SlFVTndSaXhEUVVGRE8wbEJSVTBzTWtKQlFVMHNSMEZCWWl4VlFVRmpMRXRCUVdsQ08xRkJRemxDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFdEJRVXNzUzBGQlN5eERRVUZETEU5QlFVOHNSVUZCUlN4RFFVRkRPMGxCUXpORExFTkJRVU03U1VGRlRTdzBRa0ZCVHl4SFFVRmtPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZEZUVJc1EwRkJRenRKUVVWTkxEQkNRVUZMTEVkQlFWbzdVVUZEUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjBRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xRkJRM3BETEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFMUJRVTBzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VVVGRGVrTXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N3MlFrRkJVU3hIUVVGbU8xRkJRME1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRFSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFdEJRVXNzU1VGQlNTeEZRVUZGTzIxQ1FVTTFSQ3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEhRVUZITEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRE8yMUNRVU16Unl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEVsQlFVa3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFbEJRVWtzUlVGQlJUdHRRa0ZEZGtRc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeEpRVUZKTEVWQlFVVTdiVUpCUXpORUxFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNTVUZCU1N4RlFVRkZPMjFDUVVNelJDeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRWxCUVVrc1IwRkJSeXhEUVVGRE8xRkJRMmhGTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTTdVVUZEWWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NOa0pCUVZFc1IwRkJaanRSUVVORExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETzJOQlF6bEVMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRE8yTkJRMnBGTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRPMk5CUXk5RUxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETzJOQlEyaEZMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRE8yTkJRMnhGTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRPMk5CUTJ4RkxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZEZEVVc1EwRkJRenRKUVVWTkxEUkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNN1NVRkRhRVFzUTBGQlF6dEpRVVZHTEdsQ1FVRkRPMEZCUVVRc1EwRkJReXhCUVRsVFJDeEpRVGhUUXp0QlFUbFRXU3hyUWtGQlZTeGhRVGhUZEVJc1EwRkJRVHRCUVVkRU96czdPenRIUVV0SE8wRkJRMGdzT0VKQlFYZERMRWRCUVZFc1JVRkJSU3hQUVVFd1FqdEpRVU16UlN4SlFVRkpMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGFrSXNTVUZCU1N4UlFVRlJMRWRCUVVjc1IwRkJSeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZET1VJc1NVRkJTU3haUVVGdlFpeERRVUZETzBsQlEzcENMRWxCUVVrc1kwRkJhVUlzUTBGQlF6dEpRVU4wUWl4NVFrRkJlVUk3U1VGRGVrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOV0xFTkJRVU03U1VGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZEVJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5XTEVOQlFVTTdTVUZEUkN4blFrRkJaMEk3U1VGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGVrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOV0xFTkJRVU03U1VGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOb1F5eE5RVUZOTEVOQlFVTXNVVUZCVVN4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOeVFpeERRVUZETzBsQlEwUXNiVUpCUVcxQ08wbEJRMjVDTEU5QlFVOHNVVUZCVVN4SlFVRkpMRkZCUVZFc1JVRkJSU3hEUVVGRE8xRkJRemRDTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0pFTEdOQlFXTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03VVVGRmJrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRha01zVVVGQlVTeEhRVUZITEZsQlFWa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkROMElzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zWTBGQll5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFF5eFJRVUZSTEVkQlFVY3NXVUZCV1N4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVNM1FpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hOUVVGTkxFTkJRVU1zV1VGQldTeERRVUZETzFGQlEzSkNMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXp0QlFVTnFRaXhEUVVGRE8wRkJiRU5sTERSQ1FVRnZRaXgxUWtGclEyNURMRU5CUVVFaWZRPT0iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIERhdGUrdGltZSt0aW1lem9uZSByZXByZXNlbnRhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgamF2YXNjcmlwdF8xID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcclxudmFyIG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG52YXIgdGltZXNvdXJjZV8xID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxudmFyIGZvcm1hdCA9IHJlcXVpcmUoXCIuL2Zvcm1hdFwiKTtcclxudmFyIHBhcnNlRnVuY3MgPSByZXF1aXJlKFwiLi9wYXJzZVwiKTtcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmZ1bmN0aW9uIG5vd0xvY2FsKCkge1xyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuZXhwb3J0cy5ub3dMb2NhbCA9IG5vd0xvY2FsO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuICovXHJcbmZ1bmN0aW9uIG5vd1V0YygpIHtcclxuICAgIHJldHVybiBEYXRlVGltZS5ub3dVdGMoKTtcclxufVxyXG5leHBvcnRzLm5vd1V0YyA9IG5vd1V0YztcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxyXG4gKi9cclxuZnVuY3Rpb24gbm93KHRpbWVab25lKSB7XHJcbiAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cclxuICAgIHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcbmV4cG9ydHMubm93ID0gbm93O1xyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lLCBmcm9tWm9uZSkge1xyXG4gICAgaWYgKGZyb21ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcclxuICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lLnVuaXhNaWxsaXMgLSBvZmZzZXQgKiA2MDAwMCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbG9jYWxUaW1lLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZSwgdG9ab25lKSB7XHJcbiAgICBpZiAodG9ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XHJcbiAgICAgICAgcmV0dXJuIHRvWm9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lLnVuaXhNaWxsaXMgKyBvZmZzZXQgKiA2MDAwMCkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxudmFyIERhdGVUaW1lID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIERhdGVUaW1lKGExLCBhMiwgYTMsIGgsIG0sIHMsIG1zLCB0aW1lWm9uZSkge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhMSkpIHtcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGEyIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGV4cGVjdCB1bml4VGltZXN0YW1wIHRvIGJlIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGEyIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSA/IGEyIDogbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IHllYXIgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IGRheSB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5ZWFyID0gYTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb250aCA9IGEyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0gYTM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW51dGUgPSAodHlwZW9mIChtKSA9PT0gXCJudW1iZXJcIiA/IG0gOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlY29uZCA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWlsbGkgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpID0gbWF0aC5yb3VuZFN5bShtaWxsaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bSA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodG0udmFsaWRhdGUoKSwgXCJpbnZhbGlkIGRhdGU6IFwiICsgdG0udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgdGltZVpvbmUgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lID8gdGltZVpvbmUgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0bSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEyID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSBhMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1hdFN0cmluZyA9IGEyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgem9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTMgPT09IFwib2JqZWN0XCIgJiYgYTMgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lID0gKGEzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShkYXRlU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHpvbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gcGFyc2VkLnpvbmUgfHwgbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaXZlblN0cmluZyA9IGExLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNzID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYTIgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoc3NbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExIGluc3RhbmNlb2YgYmFzaWNzXzEuVGltZVN0cnVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGExLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhMSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFhMyB8fCBhMyBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGltZVpvbmUgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSAoYTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGsgPSAoYTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEzID8gYTMgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgZ2l2ZW4sIG1ha2UgbG9jYWwgZGF0ZXRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0ZVRpbWUucHJvdG90eXBlLCBcInV0Y0RhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91dGNEYXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwiem9uZURhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lRGF0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93TG9jYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobiwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0LCB0aW1lem9uZV8xLlRpbWVab25lLmxvY2FsKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93VXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93ID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XHJcbiAgICAgICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG4gICAgICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcbiAgICAgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLmZyb21FeGNlbCA9IGZ1bmN0aW9uIChuLCB0aW1lWm9uZSkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIG4gPT09IFwibnVtYmVyXCIsIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoIWlzTmFOKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuICAgICAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXHJcbiAgICAgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xyXG4gICAgICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZXhpc3RzID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSwgYWxsb3dQcmUxOTcwKSB7XHJcbiAgICAgICAgaWYgKG1vbnRoID09PSB2b2lkIDApIHsgbW9udGggPSAxOyB9XHJcbiAgICAgICAgaWYgKGRheSA9PT0gdm9pZCAwKSB7IGRheSA9IDE7IH1cclxuICAgICAgICBpZiAoaG91ciA9PT0gdm9pZCAwKSB7IGhvdXIgPSAwOyB9XHJcbiAgICAgICAgaWYgKG1pbnV0ZSA9PT0gdm9pZCAwKSB7IG1pbnV0ZSA9IDA7IH1cclxuICAgICAgICBpZiAoc2Vjb25kID09PSB2b2lkIDApIHsgc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmIChtaWxsaXNlY29uZCA9PT0gdm9pZCAwKSB7IG1pbGxpc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmICh6b25lID09PSB2b2lkIDApIHsgem9uZSA9IG51bGw7IH1cclxuICAgICAgICBpZiAoYWxsb3dQcmUxOTcwID09PSB2b2lkIDApIHsgYWxsb3dQcmUxOTcwID0gZmFsc2U7IH1cclxuICAgICAgICBpZiAoIWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSlcclxuICAgICAgICAgICAgfHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xyXG4gICAgICAgICAgICByZXR1cm4gKHllYXIgPT09IGR0LnllYXIoKSAmJiBtb250aCA9PT0gZHQubW9udGgoKSAmJiBkYXkgPT09IGR0LmRheSgpXHJcbiAgICAgICAgICAgICAgICAmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuem9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fem9uZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXHJcbiAgICAgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnpvbmVBYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICBpZiAodGhpcy56b25lKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuem9uZSgpLmFiYnJldmlhdGlvbkZvclV0Yyh0aGlzLnV0Y0RhdGUsIGRzdERlcGVuZGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgaG91ciAwLTIzXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG4gICAgICogd2VlayBkYXkgbnVtYmVycylcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG4gICAgICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS55ZWFyRGF5KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gICAgICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc2Vjb25kT2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnVuaXhVdGNNaWxsaXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0hvdXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNaW51dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuICAgICAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXlPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNNaWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICAgICAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcbiAgICAgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNTZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcbiAgICAgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG4gICAgICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXHJcbiAgICAgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcclxuICAgICAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53aXRoWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLCB6b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cclxuICAgICAqIFRocm93cyBpZiB0aGlzIGRhdGUgZG9lcyBub3QgaGF2ZSBhIHRpbWUgem9uZS5cclxuICAgICAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgaWYgKHpvbmUpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlLCB0aGlzLl96b25lKTsgLy8gY2F1c2Ugem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHpvbmU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlLCB0aGlzLl96b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl96b25lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG4gICAgICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcbiAgICAgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3JcclxuICAgICAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxyXG4gICAgICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgaWYgKHpvbmUpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG4gICAgICAgICAgICByZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuICAgICAgICAgICAgcmVzdWx0Ll96b25lID0gem9uZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cclxuICAgICAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXHJcbiAgICAgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmUgT3B0aW9uYWwuIFpvbmUgdG8gY29udmVydCB0bywgZGVmYXVsdCB0aGUgem9uZSB0aGUgZGF0ZXRpbWUgaXMgYWxyZWFkeSBpbi5cclxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9FeGNlbCA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xyXG4gICAgICAgIHZhciBkdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRpbWVab25lICYmICF0aW1lWm9uZS5lcXVhbHModGhpcy56b25lKCkpKSB7XHJcbiAgICAgICAgICAgIGR0ID0gdGhpcy50b1pvbmUodGltZVpvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXAgKyBvZmZzZXRNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNFeGNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcclxuICAgICAgICAvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcbiAgICAgICAgdmFyIG1zZWNzID0gcmVzdWx0IC8gKDEgLyA4NjQwMDAwMCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBsZW1lbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIHZhciBhbW91bnQ7XHJcbiAgICAgICAgdmFyIHU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IChhMSk7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG4gICAgICAgICAgICB1ID0gZHVyYXRpb24udW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFtb3VudCA9IChhMSk7XHJcbiAgICAgICAgICAgIHUgPSB1bml0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkTG9jYWwgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICB2YXIgYW1vdW50O1xyXG4gICAgICAgIHZhciB1O1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuICAgICAgICAgICAgdSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gKGFtb3VudCA+PSAwID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXAgOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0sIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuICAgICAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxyXG4gICAgICogbmVjZXNzYXJ5LlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX2FkZFRvVGltZVN0cnVjdCA9IGZ1bmN0aW9uICh0bSwgYW1vdW50LCB1bml0KSB7XHJcbiAgICAgICAgdmFyIHllYXI7XHJcbiAgICAgICAgdmFyIG1vbnRoO1xyXG4gICAgICAgIHZhciBkYXk7XHJcbiAgICAgICAgdmFyIGhvdXI7XHJcbiAgICAgICAgdmFyIG1pbnV0ZTtcclxuICAgICAgICB2YXIgc2Vjb25kO1xyXG4gICAgICAgIHZhciBtaWxsaTtcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNjAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcbiAgICAgICAgICAgICAgICAvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcclxuICAgICAgICAgICAgICAgIGlmIChhbW91bnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmNlaWwoKGFtb3VudCAtICgxMiAtIHRtLmNvbXBvbmVudHMubW9udGgpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6IHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG4gICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIGFtb3VudDtcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIgJiYgYTEgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IChhMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3ViTG9jYWwgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKGExLm11bHRpcGx5KC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIGExLCB1bml0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgLSBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcclxuICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5sZXNzRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPD0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiAodGhpcy56b25lRGF0ZS5lcXVhbHMob3RoZXIuem9uZURhdGUpXHJcbiAgICAgICAgICAgICYmICh0aGlzLl96b25lID09PSBudWxsKSA9PT0gKG90aGVyLl96b25lID09PSBudWxsKVxyXG4gICAgICAgICAgICAmJiAodGhpcy5fem9uZSA9PT0gbnVsbCB8fCB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG4gICAgICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHMgKyB0aW1lem9uZV8xLlRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuICAgICAqIHNwZWNpZmllZCBmb3JtYXQuIFRoZSBmb3JtYXQgaXMgaW1wbGVtZW50ZWQgYXMgdGhlIExETUwgc3RhbmRhcmRcclxuICAgICAqIChodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF9QYXR0ZXJucylcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcclxuICAgICAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE9wdGlvbmFsLCBub24tZW5nbGlzaCBmb3JtYXQgbW9udGggbmFtZXMgZXRjLlxyXG4gICAgICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLnpvbmVEYXRlLCB0aGlzLnV0Y0RhdGUsIHRoaXMuem9uZSgpLCBmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XHJcbiAgICAgKiBAcGFyYW0gcyB0aGUgc3RyaW5nIHRvIHBhcnNlXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0IHRoZSBmb3JtYXQgdGhlIHN0cmluZyBpcyBpblxyXG4gICAgICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wYXJzZSA9IGZ1bmN0aW9uIChzLCBmb3JtYXQsIHpvbmUpIHtcclxuICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl96b25lLmtpbmQoKSAhPT0gdGltZXpvbmVfMS5UaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBkbyBub3Qgc2VwYXJhdGUgSVNPIHpvbmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZSA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPCA4KSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xyXG4gICAgICogZmFrZSB0aW1lIGluIHRlc3RzLiBEYXRlVGltZS5ub3dMb2NhbCgpIGFuZCBEYXRlVGltZS5ub3dVdGMoKVxyXG4gICAgICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS50aW1lU291cmNlID0gbmV3IHRpbWVzb3VyY2VfMS5SZWFsVGltZVNvdXJjZSgpO1xyXG4gICAgcmV0dXJuIERhdGVUaW1lO1xyXG59KCkpO1xyXG5leHBvcnRzLkRhdGVUaW1lID0gRGF0ZVRpbWU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpHRjBaWFJwYldVdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12YkdsaUwyUmhkR1YwYVcxbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN08wZEJTVWM3UVVGRlNDeFpRVUZaTEVOQlFVTTdRVUZGWWl4MVFrRkJiVUlzVlVGQlZTeERRVUZETEVOQlFVRTdRVUZET1VJc2RVSkJRVGhETEZWQlFWVXNRMEZCUXl4RFFVRkJPMEZCUTNwRUxFbEJRVmtzVFVGQlRTeFhRVUZOTEZWQlFWVXNRMEZCUXl4RFFVRkJPMEZCUTI1RExIbENRVUY1UWl4WlFVRlpMRU5CUVVNc1EwRkJRVHRCUVVOMFF5d3lRa0ZCT0VJc1kwRkJZeXhEUVVGRExFTkJRVUU3UVVGRE4wTXNTVUZCV1N4SlFVRkpMRmRCUVUwc1VVRkJVU3hEUVVGRExFTkJRVUU3UVVGREwwSXNNa0pCUVRKRExHTkJRV01zUTBGQlF5eERRVUZCTzBGQlF6RkVMSGxDUVVGMVF5eFpRVUZaTEVOQlFVTXNRMEZCUVR0QlFVTndSQ3cwUWtGQlowTXNaVUZCWlN4RFFVRkRMRU5CUVVFN1FVRkRhRVFzU1VGQldTeE5RVUZOTEZkQlFVMHNWVUZCVlN4RFFVRkRMRU5CUVVFN1FVRkRia01zU1VGQldTeFZRVUZWTEZkQlFVMHNVMEZCVXl4RFFVRkRMRU5CUVVFN1FVRkZkRU03TzBkQlJVYzdRVUZEU0R0SlFVTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTTdRVUZETlVJc1EwRkJRenRCUVVabExHZENRVUZSTEZkQlJYWkNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTzBsQlEwTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dEJRVU14UWl4RFFVRkRPMEZCUm1Vc1kwRkJUU3hUUVVWeVFpeERRVUZCTzBGQlJVUTdPenRIUVVkSE8wRkJRMGdzWVVGQmIwSXNVVUZCYlVNN1NVRkJia01zZDBKQlFXMURMRWRCUVc1RExGZEJRWEZDTEcxQ1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRk8wbEJRM1JFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBGQlF5OUNMRU5CUVVNN1FVRkdaU3hYUVVGSExFMUJSV3hDTEVOQlFVRTdRVUZGUkN4elFrRkJjMElzVTBGQmNVSXNSVUZCUlN4UlFVRnRRanRKUVVNdlJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMlFzU1VGQlRTeE5RVUZOTEVkQlFWY3NVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVU42UkN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVjc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF6bEVMRU5CUVVNN1NVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU5RTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03U1VGRE1VSXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSQ3gzUWtGQmQwSXNUMEZCYlVJc1JVRkJSU3hOUVVGcFFqdEpRVU0zUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExb3NTVUZCVFN4TlFVRk5MRWRCUVZjc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVTndSQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzYlVKQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hIUVVGSExFMUJRVTBzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNSR0xFTkJRVU03U1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTlFMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdTVUZEZUVJc1EwRkJRenRCUVVOR0xFTkJRVU03UVVGRlJEczdPMGRCUjBjN1FVRkRTRHRKUVRKTVF6czdUMEZGUnp0SlFVTklMR3RDUVVORExFVkJRVkVzUlVGQlJTeEZRVUZSTEVWQlFVVXNSVUZCVVN4RlFVTTFRaXhEUVVGVkxFVkJRVVVzUTBGQlZTeEZRVUZGTEVOQlFWVXNSVUZCUlN4RlFVRlhMRVZCUXk5RExGRkJRV003VVVGRFpDeE5RVUZOTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzSkNMRXRCUVVzc1VVRkJVVHRuUWtGQlJTeERRVUZETzI5Q1FVTm1MRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUzBGQlN5eFRRVUZUTEVsQlFVa3NSVUZCUlN4TFFVRkxMRWxCUVVrc1NVRkJTU3hGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJReTlFTERaQ1FVRTJRanQzUWtGRE4wSXNaMEpCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkZMREJFUVVFd1JDeERRVUZETEVOQlFVTTdkMEpCUXpkR0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzVVVGQlVTeEpRVUZKTEVWQlFVVXNXVUZCV1N4dFFrRkJVU3hIUVVGaExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRlRVlzU1VGQlNTeDFRa0ZCZFVJc1UwRkJVU3hEUVVGRE8zZENRVU53UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRhRUlzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExHbENRVUZwUWl4RFFVRkRMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRlRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZETVVZc1EwRkJRenQzUWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzMFFrRkRVQ3hKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NiVUpCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZUTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRelZFTEVOQlFVTTdiMEpCUTBZc1EwRkJRenR2UWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkRVQ3cyUWtGQk5rSTdkMEpCUXpkQ0xHZENRVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhMUVVGTExGRkJRVkVzUlVGQlJTeHJSRUZCYTBRc1EwRkJReXhEUVVGRE8zZENRVU55Uml4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUVVVc2JVUkJRVzFFTEVOQlFVTXNRMEZCUXp0M1FrRkRkRVlzWjBKQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzVVVGQlVTeEZRVUZGTEdsRVFVRnBSQ3hEUVVGRExFTkJRVU03ZDBKQlEzQkdMRWxCUVVrc1NVRkJTU3hIUVVGdFFpeEZRVUZGTEVOQlFVTTdkMEpCUXpsQ0xFbEJRVWtzUzBGQlN5eEhRVUZ0UWl4RlFVRkZMRU5CUVVNN2QwSkJReTlDTEVsQlFVa3NSMEZCUnl4SFFVRnRRaXhGUVVGRkxFTkJRVU03ZDBKQlF6ZENMRWxCUVVrc1NVRkJTU3hIUVVGWExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRkZCUVZFc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNKRUxFbEJRVWtzVFVGQlRTeEhRVUZYTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExGRkJRVkVzUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM1pFTEVsQlFVa3NUVUZCVFN4SFFVRlhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEZGQlFWRXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEzWkVMRWxCUVVrc1MwRkJTeXhIUVVGWExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4TFFVRkxMRkZCUVZFc1IwRkJSeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNoRUxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU16UWl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0M1FrRkROMElzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03ZDBKQlEzcENMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2RDUVVNelFpeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dDNRa0ZETDBJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN2QwSkJReTlDTEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzNkQ1FVTTNRaXhKUVVGTkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEcxQ1FVRlZMRU5CUVVNc1JVRkJSU3hWUVVGSkxFVkJRVVVzV1VGQlN5eEZRVUZGTEZGQlFVY3NSVUZCUlN4VlFVRkpMRVZCUVVVc1kwRkJUU3hGUVVGRkxHTkJRVTBzUlVGQlJTeFpRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVNM1JTeG5Ra0ZCVFN4RFFVRkRMRVZCUVVVc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeHRRa0ZCYVVJc1JVRkJSU3hEUVVGRExGRkJRVkVzUlVGQlNTeERRVUZETEVOQlFVTTdkMEpCUlhoRUxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzVVVGQlVTeEpRVUZKTEZGQlFWRXNXVUZCV1N4dFFrRkJVU3hIUVVGSExGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXp0M1FrRkZhRWNzZDBSQlFYZEVPM2RDUVVONFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEYUVJc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVOdVJDeERRVUZETzNkQ1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE96UkNRVU5RTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGRE8zZENRVU55UWl4RFFVRkRPMjlDUVVOR0xFTkJRVU03WjBKQlEwWXNRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRFVpeExRVUZMTEZGQlFWRTdaMEpCUVVVc1EwRkJRenR2UWtGRFppeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTFRaXh6UWtGQmMwSTdkMEpCUTNSQ0xFbEJRVTBzVlVGQlZTeEhRVUZ0UWl4RlFVRkZMRU5CUVVNN2QwSkJRM1JETEVsQlFVMHNXVUZCV1N4SFFVRnRRaXhGUVVGRkxFTkJRVU03ZDBKQlEzaERMRWxCUVVrc1NVRkJTU3hIUVVGaExFbEJRVWtzUTBGQlF6dDNRa0ZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEV0QlFVc3NVVUZCVVN4SlFVRkpMRVZCUVVVc1dVRkJXU3h0UWtGQlVTeERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRkRVFzU1VGQlNTeEhRVUZoTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM1pDTEVOQlFVTTdkMEpCUTBRc1NVRkJUU3hOUVVGTkxFZEJRVWNzVlVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZMRVZCUVVVc1dVRkJXU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTm9SU3hKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNN2QwSkJRemRDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeEpRVUZKTEVOQlFVTTdiMEpCUTJ4RExFTkJRVU03YjBKQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN2QwSkJRMUFzU1VGQlRTeFhRVUZYTEVkQlFWa3NSVUZCUnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8zZENRVU40UXl4SlFVRk5MRVZCUVVVc1IwRkJZU3hSUVVGUkxFTkJRVU1zYzBKQlFYTkNMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03ZDBKQlEyeEZMR2RDUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRVZCUVVVc0swSkJRU3RDTEVkQlFWY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU0zUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRelZDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dDNRa0ZETjBJc1EwRkJRenQzUWtGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzMFFrRkRVQ3hKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEcxQ1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOdVF5eERRVUZETzNkQ1FVTkVMQ3RFUVVFclJEdDNRa0ZETDBRc2QwSkJRWGRDTzNkQ1FVTjRRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEcxQ1FVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNNVF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEYUVJc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenQzUWtGREwwUXNRMEZCUXp0dlFrRkRSaXhEUVVGRE8yZENRVU5HTEVOQlFVTTdaMEpCUVVNc1MwRkJTeXhEUVVGRE8xbEJRMUlzUzBGQlN5eFJRVUZSTzJkQ1FVRkZMRU5CUVVNN2IwSkJRMllzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4WlFVRlpMRzFDUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTVRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenQzUWtGRE5VSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN2IwSkJReTlDTEVOQlFVTTdiMEpCUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVWQlFVVXNXVUZCV1N4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU12UWl4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUXpsQ0xEQkdRVUV3Uml4RFFVRkRMRU5CUVVNN2QwSkJRemRHTEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeFpRVUZaTEcxQ1FVRlJMRVZCUVVVc05FUkJRVFJFTEVOQlFVTXNRMEZCUXp0M1FrRkRjRWNzU1VGQlRTeERRVUZETEVkQlFXVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenQzUWtGRE0wSXNTVUZCVFN4RlFVRkZMRWRCUVdsRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUXpsRExFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTTVRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEcxQ1FVRlZMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0M1FrRkROVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlEyaENMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN2QwSkJReTlFTEVOQlFVTTdiMEpCUTBZc1EwRkJRenRuUWtGRFJpeERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOU0xFdEJRVXNzVjBGQlZ6dG5Ra0ZCUlN4RFFVRkRPMjlDUVVOc1FpeHhRMEZCY1VNN2IwSkJRM0pETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0dlFrRkRPVUlzU1VGQlNTeERRVUZETEZGQlFWRXNSMEZCUnl4dFFrRkJWU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVGRkxEQkNRVUZoTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1owSkJRM1JHTEVOQlFVTTdaMEpCUVVNc1MwRkJTeXhEUVVGRE8xbEJRMUlzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYzBSQlFYTkVMRU5CUVVNc1EwRkJRenRuUWtGRGVrVXNRMEZCUXp0UlFVTklMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJibE5FTEhOQ1FVRlpMRFpDUVVGUE8yRkJRVzVDTzFsQlEwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRjRUlzU1VGQlNTeERRVUZETEZGQlFWRXNSMEZCUnl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkRNVVFzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJRM1JDTEVOQlFVTTdZVUZEUkN4VlFVRnZRaXhMUVVGcFFqdFpRVU53UXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU4wUWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExGTkJRVk1zUTBGQlF6dFJRVU0xUWl4RFFVRkRPenM3VDBGS1FUdEpRVlZFTEhOQ1FVRlpMRGhDUVVGUk8yRkJRWEJDTzFsQlEwTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRja0lzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkROVVFzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRE8xRkJRM1pDTEVOQlFVTTdZVUZEUkN4VlFVRnhRaXhMUVVGcFFqdFpRVU55UXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU4yUWl4SlFVRkpMRU5CUVVNc1VVRkJVU3hIUVVGSExGTkJRVk1zUTBGQlF6dFJRVU16UWl4RFFVRkRPenM3VDBGS1FUdEpRVzFDUkRzN1QwRkZSenRKUVVOWExHbENRVUZSTEVkQlFYUkNPMUZCUTBNc1NVRkJUU3hEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVOd1F5eE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxEQkNRVUZoTEVOQlFVTXNSMEZCUnl4RlFVRkZMRzFDUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTTNSQ3hEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEVnl4bFFVRk5MRWRCUVhCQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNNRUpCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzYlVKQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJRM1JHTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFZ5eFpRVUZITEVkQlFXcENMRlZCUVd0Q0xGRkJRVzFETzFGQlFXNURMSGRDUVVGdFF5eEhRVUZ1UXl4WFFVRnhRaXh0UWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlR0UlFVTndSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGQlJTd3dRa0ZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3h0UWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBsQlEzWkhMRU5CUVVNN1NVRkZSRHM3T3pzN096dFBRVTlITzBsQlExY3NhMEpCUVZNc1IwRkJka0lzVlVGQmQwSXNRMEZCVXl4RlFVRkZMRkZCUVcxQ08xRkJRM0pFTEdkQ1FVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzVVVGQlVTeEZRVUZGTEN0RFFVRXJReXhEUVVGRExFTkJRVU03VVVGREwwVXNaMEpCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN3NFEwRkJPRU1zUTBGQlF5eERRVUZETzFGQlEyeEZMR2RDUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRGhEUVVFNFF5eERRVUZETEVOQlFVTTdVVUZEY0VVc1NVRkJUU3hoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU53UlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zWVVGQllTeEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMGxCUXpsRExFTkJRVU03U1VGRlJEczdPenM3T3pzN08wOUJVMGM3U1VGRFZ5eGxRVUZOTEVkQlFYQkNMRlZCUTBNc1NVRkJXU3hGUVVGRkxFdEJRV2xDTEVWQlFVVXNSMEZCWlN4RlFVTm9SQ3hKUVVGblFpeEZRVUZGTEUxQlFXdENMRVZCUVVVc1RVRkJhMElzUlVGQlJTeFhRVUYxUWl4RlFVTnFSaXhKUVVGeFFpeEZRVUZGTEZsQlFUWkNPMUZCUm5SRExIRkNRVUZwUWl4SFFVRnFRaXhUUVVGcFFqdFJRVUZGTEcxQ1FVRmxMRWRCUVdZc1QwRkJaVHRSUVVOb1JDeHZRa0ZCWjBJc1IwRkJhRUlzVVVGQlowSTdVVUZCUlN4elFrRkJhMElzUjBGQmJFSXNWVUZCYTBJN1VVRkJSU3h6UWtGQmEwSXNSMEZCYkVJc1ZVRkJhMEk3VVVGQlJTd3lRa0ZCZFVJc1IwRkJka0lzWlVGQmRVSTdVVUZEYWtZc2IwSkJRWEZDTEVkQlFYSkNMRmRCUVhGQ08xRkJRVVVzTkVKQlFUWkNMRWRCUVRkQ0xHOUNRVUUyUWp0UlFVVndSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGSExFTkJRVU03WlVGRGNrUXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzcEdMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRFpDeERRVUZETzFGQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0UlFVTmtMRU5CUVVNN1VVRkRSQ3hKUVVGSkxFTkJRVU03V1VGRFNpeEpRVUZOTEVWQlFVVXNSMEZCUnl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVc1RVRkJUU3hGUVVGRkxFMUJRVTBzUlVGQlJTeFhRVUZYTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRia1lzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeExRVUZMTEV0QlFVc3NSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFZEJRVWNzUzBGQlN5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RlFVRkZPMjFDUVVOc1JTeEpRVUZKTEV0QlFVc3NSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFMUJRVTBzUzBGQlN5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1RVRkJUU3hMUVVGTExFVkJRVVVzUTBGQlF5eE5RVUZOTEVWQlFVVXNTVUZCU1N4WFFVRlhMRXRCUVVzc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYWtnc1EwRkJSVHRSUVVGQkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRXaXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEyUXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRXdURVE3TzA5QlJVYzdTVUZEU1N4M1FrRkJTeXhIUVVGYU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUTJoRUxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMSFZDUVVGSkxFZEJRVmc3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJRenRKUVVOdVFpeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEcxRFFVRm5RaXhIUVVGMlFpeFZRVUYzUWl4WlFVRTBRanRSUVVFMVFpdzBRa0ZCTkVJc1IwRkJOVUlzYlVKQlFUUkNPMUZCUTI1RUxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFrSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZsQlFWa3NRMEZCUXl4RFFVRkRPMUZCUTI1RkxFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRFdDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzZVVKQlFVMHNSMEZCWWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU5xUml4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDFRa0ZCU1N4SFFVRllPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRKUVVOMFF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3gzUWtGQlN5eEhRVUZhTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4elFrRkJSeXhIUVVGV08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUTBGQlF6dEpRVU55UXl4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDFRa0ZCU1N4SFFVRllPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRKUVVOMFF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTjRReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4NVFrRkJUU3hIUVVGaU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF6dEpRVU40UXl4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTdzRRa0ZCVnl4SFFVRnNRanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU03U1VGRGRrTXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRN1VVRkRReXhOUVVGTkxFTkJRVlVzVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1NVRkRjRVVzUTBGQlF6dEpRVVZFT3pzN096dFBRVXRITzBsQlEwa3NORUpCUVZNc1IwRkJhRUk3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFVkJRVVVzUTBGQlF6dEpRVU5vUXl4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzTmtKQlFWVXNSMEZCYWtJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEycEZMRU5CUVVNN1NVRkZSRHM3T3pzN08wOUJUVWM3U1VGRFNTdzRRa0ZCVnl4SFFVRnNRanRSUVVORExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEYkVVc1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzT0VKQlFWY3NSMEZCYkVJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEzUkZMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEdkRFFVRmhMRWRCUVhCQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRE8wbEJRMmhETEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEQkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMGxCUTNKRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREpDUVVGUkxFZEJRV1k3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETzBsQlEzUkRMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhsQ1FVRk5MRWRCUVdJN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhEUVVGRE8wbEJRM0JETEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxEQkNRVUZQTEVkQlFXUTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMGxCUTNKRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMRFJDUVVGVExFZEJRV2hDTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N3MFFrRkJVeXhIUVVGb1FqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZEZGtNc1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzSzBKQlFWa3NSMEZCYmtJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlEzcEZMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEdsRFFVRmpMRWRCUVhKQ08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU4wUXl4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NOa0pCUVZVc1IwRkJha0k3VVVGRFF5eE5RVUZOTEVOQlFWVXNUVUZCVFN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03U1VGRGJrVXNRMEZCUXp0SlFVVkVPenM3T3pzN1QwRk5SenRKUVVOSkxHZERRVUZoTEVkQlFYQkNPMUZCUTBNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU14UlN4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzYVVOQlFXTXNSMEZCY2tJN1VVRkRReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzBsQlF6TkZMRU5CUVVNN1NVRkZSRHM3T3pzN1QwRkxSenRKUVVOSkxHbERRVUZqTEVkQlFYSkNPMUZCUTBNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU12UlN4RFFVRkRPMGxCUlVRN096czdPenM3TzA5QlVVYzdTVUZEU1N3eVFrRkJVU3hIUVVGbUxGVkJRV2RDTEVsQlFXVTdVVUZET1VJc1RVRkJUU3hEUVVGRExFbEJRVWtzVVVGQlVTeERRVU5zUWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGNrTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NSVUZCUlN4RlFVTTNSQ3hKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU5TTEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlEwa3NNRUpCUVU4c1IwRkJaQ3hWUVVGbExFbEJRV1U3VVVGRE4wSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5XTEdkQ1FVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeHBSVUZCYVVVc1EwRkJReXhEUVVGRE8xbEJRM1JHTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE4wSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF5d3lSVUZCTWtVN1dVRkRMMFlzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEzQkNMRWxCUVVrc1EwRkJReXhSUVVGUkxFZEJRVWNzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNLMEpCUVN0Q08yZENRVU14Uml4RFFVRkRPMmRDUVVORUxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmRDUVVOc1FpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJRenRaUVVNMVFpeERRVUZETzFGQlEwWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtJc1RVRkJUU3hEUVVGRE8xbEJRMUlzUTBGQlF6dFpRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNKQ0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVY3NZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpWRUxFTkJRVU03V1VGRFJDeEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOc1FpeEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRExIRkRRVUZ4UXp0UlFVTnFSU3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0SlFVTmlMRU5CUVVNN1NVRkZSRHM3T3pzN096czdUMEZSUnp0SlFVTkpMSGxDUVVGTkxFZEJRV0lzVlVGQll5eEpRVUZsTzFGQlF6VkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEVml4blFrRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNhVVZCUVdsRkxFTkJRVU1zUTBGQlF6dFpRVU4wUml4SlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxGRkJRVkVzUlVGQlJTeERRVUZETzFsQlF6bENMRTFCUVUwc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0WlFVTTVRaXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTndRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlEyWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETVVNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPenRQUVVsSE8wbEJRMGtzZVVKQlFVMHNSMEZCWWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRM2hFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTJwRkxFTkJRVU03U1VGRlJEczdPenM3VDBGTFJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRc1ZVRkJaU3hSUVVGdFFqdFJRVU5xUXl4SlFVRkpMRVZCUVVVc1IwRkJZU3hKUVVGSkxFTkJRVU03VVVGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETDBNc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkROVUlzUTBGQlF6dFJRVU5FTEVsQlFVMHNXVUZCV1N4SFFVRkhMRVZCUVVVc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUXpkRExFbEJRVTBzWVVGQllTeEhRVUZITEVWQlFVVXNRMEZCUXl4aFFVRmhMRVZCUVVVc1EwRkJRenRSUVVONlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMSEZDUVVGeFFpeERRVUZETEdGQlFXRXNSMEZCUnl4WlFVRlpMRU5CUVVNc1EwRkJRenRKUVVOcVJTeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTERaQ1FVRlZMRWRCUVdwQ08xRkJRME1zU1VGQlRTeGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRE8xRkJRek5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1NVRkRiRVFzUTBGQlF6dEpRVVZQTEhkRFFVRnhRaXhIUVVFM1FpeFZRVUU0UWl4RFFVRlRPMUZCUTNSRExFbEJRVTBzVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETzFGQlEzSkVMQ3RDUVVFclFqdFJRVU12UWl4SlFVRk5MRXRCUVVzc1IwRkJSeXhOUVVGTkxFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRkRU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNN1NVRkRNME1zUTBGQlF6dEpRWGRDUkRzN1QwRkZSenRKUVVOSkxITkNRVUZITEVkQlFWWXNWVUZCVnl4RlFVRlBMRVZCUVVVc1NVRkJaVHRSUVVOc1F5eEpRVUZKTEUxQlFXTXNRMEZCUXp0UlFVTnVRaXhKUVVGSkxFTkJRVmNzUTBGQlF6dFJRVU5vUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVFpeEpRVUZOTEZGQlFWRXNSMEZCZFVJc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVU14UXl4TlFVRk5MRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETzFsQlF6TkNMRU5CUVVNc1IwRkJSeXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEY2tJc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNaMEpCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkZMR2xEUVVGcFF5eERRVUZETEVOQlFVTTdXVUZEY0VVc1owSkJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1VVRkJVU3hGUVVGRkxHdERRVUZyUXl4RFFVRkRMRU5CUVVNN1dVRkRka1VzVFVGQlRTeEhRVUZYTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRkRUlzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVTldMRU5CUVVNN1VVRkRSQ3hKUVVGTkxFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE4wUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeHRRa0ZCVVN4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVNdlJDeERRVUZETzBsQmJVSk5MREpDUVVGUkxFZEJRV1lzVlVGQlowSXNSVUZCVHl4RlFVRkZMRWxCUVdVN1VVRkRka01zU1VGQlNTeE5RVUZqTEVOQlFVTTdVVUZEYmtJc1NVRkJTU3hEUVVGWExFTkJRVU03VVVGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRPVUlzU1VGQlRTeFJRVUZSTEVkQlFYVkNMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGRE1VTXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dFpRVU16UWl4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzSkNMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEdkQ1FVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUlN4cFEwRkJhVU1zUTBGQlF5eERRVUZETzFsQlEzQkZMR2RDUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRkZCUVZFc1JVRkJSU3hyUTBGQmEwTXNRMEZCUXl4RFFVRkRPMWxCUTNaRkxFMUJRVTBzUjBGQlZ5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdVVUZEVml4RFFVRkRPMUZCUTBRc1NVRkJUU3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyaENMRWxCUVUwc1UwRkJVeXhIUVVGdlFpeERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRWRCUVVjc05rSkJRV1VzUTBGQlF5eEZRVUZGTEVkQlFVY3NOa0pCUVdVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU0zUml4SlFVRk5MRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhEUVVGRExFOUJRVThzUlVGQlJTeFRRVUZUTEVOQlFVTXNRMEZCUXp0WlFVTndSU3hOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNWVUZCVlN4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU0zUXl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeE5RVUZOTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEzQkRMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOTExHMURRVUZuUWl4SFFVRjRRaXhWUVVGNVFpeEZRVUZqTEVWQlFVVXNUVUZCWXl4RlFVRkZMRWxCUVdNN1VVRkRkRVVzU1VGQlNTeEpRVUZaTEVOQlFVTTdVVUZEYWtJc1NVRkJTU3hMUVVGaExFTkJRVU03VVVGRGJFSXNTVUZCU1N4SFFVRlhMRU5CUVVNN1VVRkRhRUlzU1VGQlNTeEpRVUZaTEVOQlFVTTdVVUZEYWtJc1NVRkJTU3hOUVVGakxFTkJRVU03VVVGRGJrSXNTVUZCU1N4TlFVRmpMRU5CUVVNN1VVRkRia0lzU1VGQlNTeExRVUZoTEVOQlFVTTdVVUZGYkVJc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTmtMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eFhRVUZYTzJkQ1FVTjRRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeHRRa0ZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemxFTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTk8yZENRVU51UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOeVJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1RVRkJUVHRuUWtGRGJrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMFJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHRuUWtGRGFrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1IwRkJSenRuUWtGRGFFSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlJTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHRuUWtGRGFrSXNkVVZCUVhWRk8yZENRVU4yUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SFFVRkhMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE4wVXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzJkQ1FVTnlRaXhuUWtGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzSzBOQlFTdERMRU5CUVVNc1EwRkJRenRuUWtGRE5VVXNlVVJCUVhsRU8yZENRVU42UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRha0lzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzI5Q1FVTnNSaXhMUVVGTExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8yZENRVU55Uml4RFFVRkRPMmRDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzI5Q1FVTlFMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1EwRkJRenR2UWtGRGJFWXNTMEZCU3l4SFFVRkhMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0blFrRkRjRVlzUTBGQlF6dG5Ra0ZEUkN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU51UlN4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTTdaMEpCUXpGQ0xFMUJRVTBzUjBGQlJ5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJRenRuUWtGRE9VSXNUVUZCVFN4SFFVRkhMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETzJkQ1FVTTVRaXhMUVVGTExFZEJRVWNzUlVGQlJTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNN1owSkJRelZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zUlVGQlJTeFZRVUZKTEVWQlFVVXNXVUZCU3l4RlFVRkZMRkZCUVVjc1JVRkJSU3hWUVVGSkxFVkJRVVVzWTBGQlRTeEZRVUZGTEdOQlFVMHNSVUZCUlN4WlFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRE8xbEJRekZGTEVOQlFVTTdXVUZEUkN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUTNCQ0xHZENRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUlVGQlJTdzRRMEZCT0VNc1EwRkJReXhEUVVGRE8yZENRVU16UlN4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NUVUZCVFN4RFFVRkRPMmRDUVVOdVF5eExRVUZMTEVkQlFVY3NSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU03WjBKQlF6VkNMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEyNUZMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRNVUlzVFVGQlRTeEhRVUZITEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRE8yZENRVU01UWl4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTTdaMEpCUXpsQ0xFdEJRVXNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJRenRuUWtGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eEZRVUZGTEZWQlFVa3NSVUZCUlN4WlFVRkxMRVZCUVVVc1VVRkJSeXhGUVVGRkxGVkJRVWtzUlVGQlJTeGpRVUZOTEVWQlFVVXNZMEZCVFN4RlFVRkZMRmxCUVVzc1JVRkJSU3hEUVVGRExFTkJRVU03V1VGRE1VVXNRMEZCUXp0WlFVTkVMREJDUVVFd1FqdFpRVU14UWp0blFrRkRReXgzUWtGQmQwSTdaMEpCUTNoQ0xEQkNRVUV3UWp0blFrRkRNVUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRFZpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSE5DUVVGelFpeERRVUZETEVOQlFVTTdaMEpCUTNwRExFTkJRVU03VVVGRFNDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFWVk5MSE5DUVVGSExFZEJRVllzVlVGQlZ5eEZRVUZQTEVWQlFVVXNTVUZCWlR0UlFVTnNReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRXRCUVVzc1VVRkJVU3hKUVVGSkxFVkJRVVVzV1VGQldTeHRRa0ZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONFJDeEpRVUZOTEZGQlFWRXNSMEZCZFVJc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVU14UXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU40UXl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeG5Ra0ZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRkxFTkJRVU1zUzBGQlN5eFJRVUZSTEVWQlFVVXNhVU5CUVdsRExFTkJRVU1zUTBGQlF6dFpRVU53UlN4blFrRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4UlFVRlJMRVZCUVVVc2EwTkJRV3RETEVOQlFVTXNRMEZCUXp0WlFVTjJSU3hKUVVGTkxFMUJRVTBzUjBGQmJVSXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOd1F5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRjRU1zUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZQVFN3eVFrRkJVU3hIUVVGbUxGVkJRV2RDTEVWQlFVOHNSVUZCUlN4SlFVRmxPMUZCUTNaRExFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVmtzUlVGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGJrUXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpkRExFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzZFVKQlFVa3NSMEZCV0N4VlFVRlpMRXRCUVdVN1VVRkRNVUlzVFVGQlRTeERRVUZETEVsQlFVa3NiVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZWQlFWVXNSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEzcEZMRU5CUVVNN1NVRkZSRHM3TzAxQlIwVTdTVUZEU3l3MlFrRkJWU3hIUVVGcVFqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03U1VGRGNrWXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTEN0Q1FVRlpMRWRCUVc1Q08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTTFSU3hEUVVGRE8wbEJSVVE3T3p0UFFVZEhPMGxCUTBrc09FSkJRVmNzUjBGQmJFSTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTJwRkxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREpDUVVGUkxFZEJRV1lzVlVGQlowSXNTMEZCWlR0UlFVTTVRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRWRCUVVjc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZETTBRc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NORUpCUVZNc1IwRkJhRUlzVlVGQmFVSXNTMEZCWlR0UlFVTXZRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZETlVRc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NlVUpCUVUwc1IwRkJZaXhWUVVGakxFdEJRV1U3VVVGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRKUVVNelF5eERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3cwUWtGQlV5eEhRVUZvUWl4VlFVRnBRaXhMUVVGbE8xRkJReTlDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNN1pVRkRlRU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NTMEZCU3l4SlFVRkpMRU5CUVVNN1pVRkRhRVFzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGRE5VUXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTERoQ1FVRlhMRWRCUVd4Q0xGVkJRVzFDTEV0QlFXVTdVVUZEYWtNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4SFFVRkhMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETzBsQlF6TkVMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEN0Q1FVRlpMRWRCUVc1Q0xGVkJRVzlDTEV0QlFXVTdVVUZEYkVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETzBsQlF6VkVMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhOQ1FVRkhMRWRCUVZZc1ZVRkJWeXhMUVVGbE8xRkJRM3BDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpGQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkRja0lzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03U1VGRGRFSXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzYzBKQlFVY3NSMEZCVml4VlFVRlhMRXRCUVdVN1VVRkRla0lzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETjBJc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0UlFVTnlRaXhEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRKUVVOMFFpeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzT0VKQlFWY3NSMEZCYkVJN1VVRkRReXhKUVVGTkxFTkJRVU1zUjBGQlZ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRE8xRkJRek5ETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyaENMRTFCUVUwc1EwRkJReXhEUVVGRExFZEJRVWNzYlVKQlFWRXNRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl3NFFrRkJPRUk3VVVGRGJFWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMR3RDUVVGclFqdFJRVU0zUWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96czdPenM3T3p0UFFWRkhPMGxCUTBrc2VVSkJRVTBzUjBGQllpeFZRVUZqTEZsQlFXOUNMRVZCUVVVc1lVRkJiME03VVVGRGRrVXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4WlFVRlpMRVZCUVVVc1lVRkJZU3hEUVVGRExFTkJRVU03U1VGRE4wWXNRMEZCUXp0SlFVVkVPenM3T3p0UFFVdEhPMGxCUTFjc1kwRkJTeXhIUVVGdVFpeFZRVUZ2UWl4RFFVRlRMRVZCUVVVc1RVRkJZeXhGUVVGRkxFbEJRV1U3VVVGRE4wUXNTVUZCVFN4TlFVRk5MRWRCUVVjc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMnBFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVNdlF5eERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzTWtKQlFWRXNSMEZCWmp0UlFVTkRMRWxCUVUwc1EwRkJReXhIUVVGWExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNN1VVRkRNME1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4MVFrRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXk5RExFMUJRVTBzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNRMEZCUXl4cFJFRkJhVVE3V1VGRE1VWXNRMEZCUXp0WlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVU5RTEUxQlFVMHNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4RFFVRkRMREpDUVVFeVFqdFpRVU01UkN4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExHdENRVUZyUWp0UlFVTTNRaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc01FSkJRVThzUjBGQlpEdFJRVU5ETEUxQlFVMHNRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXp0SlFVTTVReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N3d1FrRkJUeXhIUVVGa08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRVZCUVVVc1EwRkJRenRKUVVNM1FpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3c0UWtGQlZ5eEhRVUZzUWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTlpMQ3RDUVVGelFpeEhRVUZ5UXl4VlFVRnpReXhEUVVGVE8xRkJRemxETEVsQlFVMHNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVU42UWl4SlFVRk5MRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVVzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTjRRaXhKUVVGSkxFdEJRVXNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM0pETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYUVJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzFsQlEzSkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8xRkJRMllzUTBGQlF6dFJRVU5FTEV0QlFVc3NSMEZCUnl4UFFVRlBMRU5CUVVNc1YwRkJWeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEycERMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRhRUlzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTNKRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnlReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlEyWXNRMEZCUXp0UlFVTkVMRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJwRExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRM0pETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTJ4RExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEWml4RFFVRkRPMUZCUTBRc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFhRVUZYTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkRha01zUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXgzUTBGQmQwTTdVVUZEY2tRc1EwRkJRenRSUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFFSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRM0pETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTJ4RExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEWml4RFFVRkRPMUZCUTBRc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTndRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETzBsQlEyWXNRMEZCUXp0SlFYb3JRa1E3T3pzN1QwRkpSenRKUVVOWExHMUNRVUZWTEVkQlFXVXNTVUZCU1N3eVFrRkJZeXhGUVVGRkxFTkJRVU03U1VGeEswSTNSQ3hsUVVGRE8wRkJRVVFzUTBGQlF5eEJRV2hvUTBRc1NVRm5hRU5ETzBGQmFHaERXU3huUWtGQlVTeFhRV2RvUTNCQ0xFTkJRVUVpZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSBkdXJhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gKi9cclxuZnVuY3Rpb24geWVhcnMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLnllYXJzKG4pO1xyXG59XHJcbmV4cG9ydHMueWVhcnMgPSB5ZWFycztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICovXHJcbmZ1bmN0aW9uIG1vbnRocyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xyXG59XHJcbmV4cG9ydHMubW9udGhzID0gbW9udGhzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5kYXlzKG4pO1xyXG59XHJcbmV4cG9ydHMuZGF5cyA9IGRheXM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gKi9cclxuZnVuY3Rpb24gaG91cnMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLmhvdXJzKG4pO1xyXG59XHJcbmV4cG9ydHMuaG91cnMgPSBob3VycztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gKi9cclxuZnVuY3Rpb24gbWludXRlcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcclxufVxyXG5leHBvcnRzLm1pbnV0ZXMgPSBtaW51dGVzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xyXG59XHJcbmV4cG9ydHMuc2Vjb25kcyA9IHNlY29uZHM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXHJcbiAqL1xyXG5mdW5jdGlvbiBtaWxsaXNlY29uZHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcclxufVxyXG5leHBvcnRzLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcztcclxuLyoqXHJcbiAqIFRpbWUgZHVyYXRpb24gd2hpY2ggaXMgcmVwcmVzZW50ZWQgYXMgYW4gYW1vdW50IGFuZCBhIHVuaXQgZS5nLlxyXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxyXG4gKlxyXG4gKiBJdCBoYXMgdHdvIHNldHMgb2YgZ2V0dGVyIGZ1bmN0aW9uczpcclxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxyXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxyXG4gKiAtIHNlY29uZHMoKSwgbWludXRlcygpLCBob3VycygpIGV0YywgcGx1cmFsIGZvcm06IHRoZXNlIHJldHVybiB0aGUgdG90YWwgYW1vdW50IHJlcHJlc2VudGVkIGluIHRoZSBjb3JyZXNwb25kaW5nIHVuaXQuXHJcbiAqL1xyXG52YXIgRHVyYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEdXJhdGlvbihpMSwgdW5pdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGkxKSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAvLyBhbW91bnQrdW5pdCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gaTE7XHJcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9ICh0eXBlb2YgdW5pdCA9PT0gXCJudW1iZXJcIiA/IHVuaXQgOiBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoaTEpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8vIHN0cmluZyBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB0aGlzLl9mcm9tU3RyaW5nKGkxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi55ZWFycyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5tb250aHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uZGF5cyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5ob3VycyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihuLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1pbnV0ZXMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnNlY29uZHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhbm90aGVyIGluc3RhbmNlIG9mIER1cmF0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFzID0gZnVuY3Rpb24gKHVuaXQpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcbiAgICAgICAgICAgIHZhciByZXFNb250aHMgPSAodW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTW9udGhzIC8gcmVxTW9udGhzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcbiAgICAgICAgICAgIHZhciByZXFNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0aGlzIGR1cmF0aW9uIHRvIGEgRHVyYXRpb24gaW4gYW5vdGhlciB1bml0LiBZb3UgYWx3YXlzIGdldCBhIGNsb25lIGV2ZW4gaWYgeW91IHNwZWNpZnlcclxuICAgICAqIHRoZSBzYW1lIHVuaXQuXHJcbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXHJcbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtaWxsaXNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiA0MDAgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbnV0ZXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgOTAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW51dGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWludXRlIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ob3VycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBob3VyIHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBkYXkgaGFzIDI0IGhvdXJzICh3aGljaCBpcyBub3QgdGhlIGNhc2VcclxuICAgICAqIGR1cmluZyBEU1QgY2hhbmdlcykuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBwYXJ0IGNhbiBleGNlZWQgMjMgaG91cnMsIGJlY2F1c2UgZm9yXHJcbiAgICAgKiBub3csIHdlIGRvIG5vdCBoYXZlIGEgZGF5cygpIGZ1bmN0aW9uXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDI1IGZvciBhIC0yNTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlSG91cnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRheSBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgbW9udGggaGFzIDMwIGRheXMuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRocyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnllYXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm9uLWZyYWN0aW9uYWwgcG9zaXRpdmUgeWVhcnNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xyXG4gICAgICAgICAgICAgICAgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1bml0IHRoaXMgZHVyYXRpb24gd2FzIGNyZWF0ZWQgd2l0aFxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdW5pdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpZ25cclxuICAgICAqIEByZXR1cm4gXCItXCIgaWYgdGhlIGR1cmF0aW9uIGlzIG5lZ2F0aXZlXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDwgb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPD0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuICAgICAqIFJldHVybnMgZmFsc2UgaWYgd2UgY2Fubm90IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsIGluIGFsbCB0aW1lIHpvbmVzXHJcbiAgICAgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmVxdWFsc0V4YWN0ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPD0gYmFzaWNzXzEuVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IGJhc2ljc18xLlRpbWVVbml0LkRheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgPT09IG90aGVyLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IG90aGVyLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID4gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID49IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAqIHZhbHVlKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbi5kaXZpZGUoKTogRGl2aWRlIGJ5IHplcm8gZHVyYXRpb25cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgLyB2YWx1ZS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBkdXJhdGlvbi5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLSB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkdXJhdGlvbiBpLmUuIHJlbW92ZSB0aGUgc2lnbi5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fYW1vdW50ID49IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXHJcbiAgICAgKiBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0Z1bGxTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9IbXNTdHJpbmcodHJ1ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbVs6c3NbLm5ubl1dIG5vdGF0aW9uLlxyXG4gICAgICogQHBhcmFtIGZ1bGwgSWYgdHJ1ZSwgdGhlbiBhbGwgZmllbGRzIGFyZSBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uIE90aGVyd2lzZSwgc2Vjb25kcyBhbmQgbWlsbGlzZWNvbmRzXHJcbiAgICAgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9IbXNTdHJpbmcgPSBmdW5jdGlvbiAoZnVsbCkge1xyXG4gICAgICAgIGlmIChmdWxsID09PSB2b2lkIDApIHsgZnVsbCA9IGZhbHNlOyB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgKHRoaXMuX2Ftb3VudCAvIDEwMDApLnRvRml4ZWQoMykgKyBcIlNcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJIXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIHdpdGggYW1vdW50IGFuZCB1bml0IGUuZy4gJzEuNSB5ZWFycycgb3IgJy0xIGRheSdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCIgXCIgKyBiYXNpY3MudGltZVVuaXRUb1N0cmluZyh0aGlzLl91bml0LCB0aGlzLl9hbW91bnQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbRHVyYXRpb246IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoaXMgJSB1bml0LCBhbHdheXMgcG9zaXRpdmVcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLl9wYXJ0ID0gZnVuY3Rpb24gKHVuaXQpIHtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAodW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXh0VW5pdDtcclxuICAgICAgICAvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XHJcbiAgICB9O1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLl9mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkLm1hdGNoKC9eLT9cXGRcXGQ/KDpcXGRcXGQ/KDpcXGRcXGQ/KC5cXGRcXGQ/XFxkPyk/KT8pPyQvKSkge1xyXG4gICAgICAgICAgICB2YXIgc2lnbiA9IDE7XHJcbiAgICAgICAgICAgIHZhciBob3Vyc18xID0gMDtcclxuICAgICAgICAgICAgdmFyIG1pbnV0ZXNfMSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSB0cmltbWVkLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICBpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcbiAgICAgICAgICAgICAgICBzaWduID0gLTE7XHJcbiAgICAgICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91cnNfMSA9ICtwYXJ0c1swXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgbWludXRlc18xID0gK3BhcnRzWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzXzEgPSArc2Vjb25kUGFydHNbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kc18xID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kc18xICsgMTAwMCAqIHNlY29uZHNfMSArIDYwMDAwICogbWludXRlc18xICsgMzYwMDAwMCAqIGhvdXJzXzEpO1xyXG4gICAgICAgICAgICAvLyBmaW5kIGxvd2VzdCBub24temVybyBudW1iZXIgYW5kIHRha2UgdGhhdCBhcyB1bml0XHJcbiAgICAgICAgICAgIGlmIChtaWxsaXNlY29uZHNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZHNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtaW51dGVzXzEgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaG91cnNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50TXNlYyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaXNGaW5pdGUoYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGFtb3VudCBpcyBpbmZpbml0ZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzLnN0cmluZ1RvVGltZVVuaXQoc3BsaXRbMV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gRHVyYXRpb247XHJcbn0oKSk7XHJcbmV4cG9ydHMuRHVyYXRpb24gPSBEdXJhdGlvbjtcclxuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2laSFZ5WVhScGIyNHVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmJHbGlMMlIxY21GMGFXOXVMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPMGRCU1VjN1FVRkZTQ3haUVVGWkxFTkJRVU03UVVGRllpeDFRa0ZCYlVJc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRE9VSXNkVUpCUVhsQ0xGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlEzQkRMRWxCUVZrc1RVRkJUU3hYUVVGTkxGVkJRVlVzUTBGQlF5eERRVUZCTzBGQlEyNURMRWxCUVZrc1QwRkJUeXhYUVVGTkxGZEJRVmNzUTBGQlF5eERRVUZCTzBGQlIzSkRPenM3TzBkQlNVYzdRVUZEU0N4bFFVRnpRaXhEUVVGVE8wbEJRemxDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBGQlF6RkNMRU5CUVVNN1FVRkdaU3hoUVVGTExGRkJSWEJDTEVOQlFVRTdRVUZGUkRzN096dEhRVWxITzBGQlEwZ3NaMEpCUVhWQ0xFTkJRVk03U1VGREwwSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZETTBJc1EwRkJRenRCUVVabExHTkJRVTBzVTBGRmNrSXNRMEZCUVR0QlFVVkVPenM3TzBkQlNVYzdRVUZEU0N4alFVRnhRaXhEUVVGVE8wbEJRemRDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBGQlEzcENMRU5CUVVNN1FVRkdaU3haUVVGSkxFOUJSVzVDTEVOQlFVRTdRVUZGUkRzN096dEhRVWxITzBGQlEwZ3NaVUZCYzBJc1EwRkJVenRKUVVNNVFpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU14UWl4RFFVRkRPMEZCUm1Vc1lVRkJTeXhSUVVWd1FpeERRVUZCTzBGQlJVUTdPenM3UjBGSlJ6dEJRVU5JTEdsQ1FVRjNRaXhEUVVGVE8wbEJRMmhETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBGQlF6VkNMRU5CUVVNN1FVRkdaU3hsUVVGUExGVkJSWFJDTEVOQlFVRTdRVUZGUkRzN096dEhRVWxITzBGQlEwZ3NhVUpCUVhkQ0xFTkJRVk03U1VGRGFFTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZETlVJc1EwRkJRenRCUVVabExHVkJRVThzVlVGRmRFSXNRMEZCUVR0QlFVVkVPenM3TzBkQlNVYzdRVUZEU0N4elFrRkJOa0lzUTBGQlV6dEpRVU55UXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTnFReXhEUVVGRE8wRkJSbVVzYjBKQlFWa3NaVUZGTTBJc1EwRkJRVHRCUVVWRU96czdPenM3T3p0SFFWRkhPMEZCUTBnN1NVRTRSa003TzA5QlJVYzdTVUZEU0N4clFrRkJXU3hGUVVGUkxFVkJRVVVzU1VGQlpUdFJRVU53UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVFpd3dRa0ZCTUVJN1dVRkRNVUlzU1VGQlRTeE5RVUZOTEVkQlFWY3NSVUZCUlN4RFFVRkRPMWxCUXpGQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRPMWxCUTNSQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRWxCUVVrc1MwRkJTeXhSUVVGUkxFZEJRVWNzU1VGQlNTeEhRVUZITEdsQ1FVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VVVGRGRrVXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU55UXl4eFFrRkJjVUk3V1VGRGNrSXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJVeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU01UWl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeHpRa0ZCYzBJN1dVRkRkRUlzU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRha0lzU1VGQlNTeERRVUZETEV0QlFVc3NSMEZCUnl4cFFrRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF6dFJRVU51UXl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVc1SFJEczdPenRQUVVsSE8wbEJRMWNzWTBGQlN5eEhRVUZ1UWl4VlFVRnZRaXhEUVVGVE8xRkJRelZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVOMlF5eERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5YTEdWQlFVMHNSMEZCY0VJc1ZVRkJjVUlzUTBGQlV6dFJRVU0zUWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRGVFTXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEVnl4aFFVRkpMRWRCUVd4Q0xGVkJRVzFDTEVOQlFWTTdVVUZETTBJc1RVRkJUU3hEUVVGRExFbEJRVWtzVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEzUkRMRU5CUVVNN1NVRkZSRHM3T3p0UFFVbEhPMGxCUTFjc1kwRkJTeXhIUVVGdVFpeFZRVUZ2UWl4RFFVRlRPMUZCUXpWQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTjJReXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOWExHZENRVUZQTEVkQlFYSkNMRlZCUVhOQ0xFTkJRVk03VVVGRE9VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wbEJRM3BETEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlExY3NaMEpCUVU4c1IwRkJja0lzVlVGQmMwSXNRMEZCVXp0UlFVTTVRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdTVUZEZWtNc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRWeXh4UWtGQldTeEhRVUV4UWl4VlFVRXlRaXhEUVVGVE8xRkJRMjVETEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzYVVKQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRKUVVNNVF5eERRVUZETzBsQmQwTkVPenRQUVVWSE8wbEJRMGtzZDBKQlFVc3NSMEZCV2p0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU12UXl4RFFVRkRPMGxCUlVRN096czdUMEZKUnp0SlFVTkpMSEZDUVVGRkxFZEJRVlFzVlVGQlZTeEpRVUZqTzFGQlEzWkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEV0QlFVc3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVOeVFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVsQlFVa3NhVUpCUVZFc1EwRkJReXhMUVVGTExFbEJRVWtzU1VGQlNTeEpRVUZKTEdsQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU51UlN4SlFVRk5MRlZCUVZVc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhKUVVGSkxFZEJRVWNzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpORUxFbEJRVTBzVTBGQlV5eEhRVUZITEVOQlFVTXNTVUZCU1N4TFFVRkxMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeEhRVUZITEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOd1JDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhWUVVGVkxFZEJRVWNzVTBGQlV5eERRVUZETzFGQlF6bERMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEVsQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRE0wUXNTVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExITkNRVUZ6UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRM0JFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExGRkJRVkVzUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZETVVNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPenM3VDBGTFJ6dEpRVU5KTERCQ1FVRlBMRWRCUVdRc1ZVRkJaU3hKUVVGak8xRkJRelZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJRekZETEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTd3JRa0ZCV1N4SFFVRnVRanRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMR2xDUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdTVUZEZEVNc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRTU3c0UWtGQlZ5eEhRVUZzUWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEdsQ1FVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03U1VGRGVrTXNRMEZCUXp0SlFVVkVPenM3TzA5QlNVYzdTVUZEU1N3d1FrRkJUeXhIUVVGa08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SlFVTnFReXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOSkxIbENRVUZOTEVkQlFXSTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eHBRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wbEJRM0JETEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlEwa3NNRUpCUVU4c1IwRkJaRHRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdTVUZEYWtNc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zYVVKQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRKUVVOd1F5eERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEhkQ1FVRkxMRWRCUVZvN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4cFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBsQlF5OUNMRU5CUVVNN1NVRkZSRHM3TzA5QlIwYzdTVUZEU1N4MVFrRkJTU3hIUVVGWU8xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTnNReXhEUVVGRE8wbEJSVVE3T3pzN096dFBRVTFITzBsQlEwa3NOa0pCUVZVc1IwRkJha0k3VVVGRFF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zYzBKQlFYTkNMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4RFFVRkRPMGxCUTJwSExFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3gxUWtGQlNTeEhRVUZZTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zYVVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVNNVFpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3h6UWtGQlJ5eEhRVUZXTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zYVVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOcVF5eERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzZVVKQlFVMHNSMEZCWWp0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEdsQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRGFFTXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzZDBKQlFVc3NSMEZCV2p0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEdsQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRGJrTXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5KTEhkQ1FVRkxMRWRCUVZvN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4cFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBsQlF5OUNMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTERaQ1FVRlZMRWRCUVdwQ08xRkJRME1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNelF5eERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6RkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4elFrRkJjMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRPMmRDUVVOdVJpeE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhFTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeDVRa0ZCVFN4SFFVRmlPMUZCUTBNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTTdTVUZEY2tJc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NkVUpCUVVrc1IwRkJXRHRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUTI1Q0xFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3gxUWtGQlNTeEhRVUZZTzFGQlEwTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJRM1JETEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTd3lRa0ZCVVN4SFFVRm1MRlZCUVdkQ0xFdEJRV1U3VVVGRE9VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFVkJRVVVzUjBGQlJ5eExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNN1NVRkRia1FzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxEUkNRVUZUTEVkQlFXaENMRlZCUVdsQ0xFdEJRV1U3VVVGREwwSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFVkJRVVVzU1VGQlNTeExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNN1NVRkRjRVFzUTBGQlF6dEpRVVZFT3pzN08wOUJTVWM3U1VGRFNTeDVRa0ZCVFN4SFFVRmlMRlZCUVdNc1MwRkJaVHRSUVVNMVFpeEpRVUZOTEZOQlFWTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTTFReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNTMEZCU3l4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFbEJRVWtzU1VGQlNTeERRVUZETEV0QlFVc3NTMEZCU3l4VFFVRlRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03U1VGREwwVXNRMEZCUXp0SlFVVkVPenM3T3pzN1QwRk5SenRKUVVOSkxEaENRVUZYTEVkQlFXeENMRlZCUVcxQ0xFdEJRV1U3VVVGRGFrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzU1VGQlNTeHBRa0ZCVVN4RFFVRkRMRXRCUVVzc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NhVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzQkZMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUXpOQ0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzU1VGQlNTeHBRa0ZCVVN4RFFVRkRMRWRCUVVjc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzUkZMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUXpOQ0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRFpDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzTkVKQlFWTXNSMEZCYUVJc1ZVRkJhVUlzUzBGQlpUdFJRVU12UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUzBGQlN5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1NVRkRka1VzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxEaENRVUZYTEVkQlFXeENMRlZCUVcxQ0xFdEJRV1U3VVVGRGFrTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFVkJRVVVzUjBGQlJ5eExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNN1NVRkRia1FzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxDdENRVUZaTEVkQlFXNUNMRlZCUVc5Q0xFdEJRV1U3VVVGRGJFTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFVkJRVVVzU1VGQlNTeExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNN1NVRkRjRVFzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxITkNRVUZITEVkQlFWWXNWVUZCVnl4TFFVRmxPMUZCUTNwQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6RkNMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdVVUZEY2tJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1NVRkRkRUlzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxITkNRVUZITEVkQlFWWXNWVUZCVnl4TFFVRmxPMUZCUTNwQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6ZENMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdVVUZEY2tJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1NVRkRkRUlzUTBGQlF6dEpRVVZFT3pzN08wOUJTVWM3U1VGRFNTd3lRa0ZCVVN4SFFVRm1MRlZCUVdkQ0xFdEJRV0U3VVVGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU4yUkN4RFFVRkRPMGxCWTAwc2VVSkJRVTBzUjBGQllpeFZRVUZqTEV0QlFYZENPMUZCUTNKRExFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNTMEZCU3l4TFFVRkxMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGREwwSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTJwQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiVU5CUVcxRExFTkJRVU1zUTBGQlF6dFpRVU4wUkN4RFFVRkRPMWxCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1MwRkJTeXhGUVVGRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTjJSQ3hEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM3BDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc05FTkJRVFJETEVOQlFVTXNRMEZCUXp0WlFVTXZSQ3hEUVVGRE8xbEJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1IwRkJSeXhMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTTdVVUZEYmtRc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3h6UWtGQlJ5eEhRVUZXTEZWQlFWY3NTMEZCWlR0UlFVTjZRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdTVUZEZEVVc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMSE5DUVVGSExFZEJRVllzVlVGQlZ5eExRVUZsTzFGQlEzcENMRTFCUVUwc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRXRCUVVzc1EwRkJReXhGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU4wUlN4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRFNTeHpRa0ZCUnl4SFFVRldPMUZCUTBNc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1pDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03VVVGRGNrSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU14UWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTkpMQ3RDUVVGWkxFZEJRVzVDTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTVUZETDBJc1EwRkJRenRKUVVWRU96czdPMDlCU1VjN1NVRkRTU3c0UWtGQlZ5eEhRVUZzUWl4VlFVRnRRaXhKUVVGeFFqdFJRVUZ5UWl4dlFrRkJjVUlzUjBGQmNrSXNXVUZCY1VJN1VVRkRka01zU1VGQlNTeE5RVUZOTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTndReXhOUVVGTkxFZEJRVWNzUjBGQlJ5eEhRVUZITEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExGZEJRVmNzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdVVUZEZWtVc1EwRkJRenRSUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NTVUZCU1N4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UkN4TlFVRk5MRWRCUVVjc1IwRkJSeXhIUVVGSExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzFGQlF6ZEZMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVsQlFVa3NUVUZCVFN4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNFUXNUVUZCVFN4SFFVRkhMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhIUVVGSExFMUJRVTBzUTBGQlF6dFJRVU0zUlN4RFFVRkRPMUZCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4SFFVRkhMRTFCUVUwc1EwRkJRenRKUVVOMlJpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3c0UWtGQlZ5eEhRVUZzUWp0UlFVTkRMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNCQ0xFdEJRVXNzYVVKQlFWRXNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRuUWtGRE0wSXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NRMEZCUXp0WlFVTnlSQ3hEUVVGRE8xbEJRMFFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRE8yZENRVU4wUWl4TlFVRk5MRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFZEJRVWNzUTBGQlF6dFpRVU01UXl4RFFVRkRPMWxCUTBRc1MwRkJTeXhwUWtGQlVTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPMmRDUVVOMFFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExIVkRRVUYxUXp0WlFVTjJSaXhEUVVGRE8xbEJRMFFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8yZENRVU53UWl4TlFVRk5MRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFZEJRVWNzUTBGQlF6dFpRVU01UXl4RFFVRkRPMWxCUTBRc1MwRkJTeXhwUWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMmRDUVVOdVFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJRenRaUVVNNVF5eERRVUZETzFsQlEwUXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJkQ1FVTndRaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEVkQlFVY3NRMEZCUXp0WlFVTTVReXhEUVVGRE8xbEJRMFFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8yZENRVU55UWl4TlFVRk5MRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFZEJRVWNzUTBGQlF6dFpRVU01UXl4RFFVRkRPMWxCUTBRc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVOd1FpeE5RVUZOTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJRenRaUVVNNVF5eERRVUZETzFsQlEwUXNNRUpCUVRCQ08xbEJRekZDTzJkQ1FVTkRMSGRDUVVGM1FqdG5Ra0ZEZUVJc01FSkJRVEJDTzJkQ1FVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZEZWtNc1EwRkJRenRSUVVOSUxFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3d5UWtGQlVTeEhRVUZtTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1NVRkROVVlzUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc01FSkJRVThzUjBGQlpEdFJRVU5ETEUxQlFVMHNRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXp0SlFVTTVReXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N3d1FrRkJUeXhIUVVGa08xRkJRME1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJRenRKUVVNMVFpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTeXgzUWtGQlN5eEhRVUZpTEZWQlFXTXNTVUZCWXp0UlFVTXpRaXgzUWtGQmQwSTdVVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU0xUWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGNrUXNRMEZCUXp0UlFVTkVMRWxCUVVrc1VVRkJhMElzUTBGQlF6dFJRVU4yUWl4clJVRkJhMFU3VVVGRGJFVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5rTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhYUVVGWE8yZENRVUZGTEZGQlFWRXNSMEZCUnl4cFFrRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF6dG5Ra0ZCUXl4TFFVRkxMRU5CUVVNN1dVRkROMFFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRTFCUVUwN1owSkJRVVVzVVVGQlVTeEhRVUZITEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRE8yZENRVUZETEV0QlFVc3NRMEZCUXp0WlFVTjRSQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNUVUZCVFR0blFrRkJSU3hSUVVGUkxFZEJRVWNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRVU1zUzBGQlN5eERRVUZETzFsQlEzUkVMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEpRVUZKTzJkQ1FVRkZMRkZCUVZFc1IwRkJSeXhwUWtGQlVTeERRVUZETEVkQlFVY3NRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRGJrUXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFZEJRVWM3WjBKQlFVVXNVVUZCVVN4SFFVRkhMR2xDUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETzJkQ1FVRkRMRXRCUVVzc1EwRkJRenRaUVVOd1JDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1MwRkJTenRuUWtGQlJTeFJRVUZSTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU03WjBKQlFVTXNTMEZCU3l4RFFVRkRPMUZCUTNSRUxFTkJRVU03VVVGRlJDeEpRVUZOTEV0QlFVc3NSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZETjBnc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4SFFVRkhMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRMmhGTEVOQlFVTTdTVUZIVHl3NFFrRkJWeXhIUVVGdVFpeFZRVUZ2UWl4RFFVRlRPMUZCUXpWQ0xFbEJRVTBzVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVONlFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExIbERRVUY1UXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemxFTEVsQlFVa3NTVUZCU1N4SFFVRlhMRU5CUVVNc1EwRkJRenRaUVVOeVFpeEpRVUZKTEU5QlFVc3NSMEZCVnl4RFFVRkRMRU5CUVVNN1dVRkRkRUlzU1VGQlNTeFRRVUZQTEVkQlFWY3NRMEZCUXl4RFFVRkRPMWxCUTNoQ0xFbEJRVWtzVTBGQlR5eEhRVUZYTEVOQlFVTXNRMEZCUXp0WlFVTjRRaXhKUVVGSkxHTkJRVmtzUjBGQlZ5eERRVUZETEVOQlFVTTdXVUZETjBJc1NVRkJUU3hMUVVGTExFZEJRV0VzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNelF5eG5Ra0ZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRkxIVkRRVUYxUXl4SFFVRkhMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU4yUnl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlF5OUNMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEVml4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU12UWl4RFFVRkRPMWxCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUWl4UFFVRkxMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYmtJc1EwRkJRenRaUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEZEVJc1UwRkJUeXhIUVVGSExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNKQ0xFTkJRVU03V1VGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNSQ0xFbEJRVTBzVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTNoRExGTkJRVThzUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNMVFpeGpRVUZaTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlF6RkVMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRMFFzU1VGQlRTeFZRVUZWTEVkQlFVY3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zWTBGQldTeEhRVUZITEVsQlFVa3NSMEZCUnl4VFFVRlBMRWRCUVVjc1MwRkJTeXhIUVVGSExGTkJRVThzUjBGQlJ5eFBRVUZQTEVkQlFVY3NUMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkRlRWNzYjBSQlFXOUVPMWxCUTNCRUxFVkJRVVVzUTBGQlF5eERRVUZETEdOQlFWa3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU40UWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExHbENRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTI1RExFTkJRVU03V1VGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1UwRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpGQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03V1VGRE9VSXNRMEZCUXp0WlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFRRVUZQTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE1VSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXp0WlFVTTVRaXhEUVVGRE8xbEJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjRRaXhKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEdsQ1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRE8xbEJRelZDTEVOQlFVTTdXVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRuUWtGRFVDeEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMR2xDUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETzFsQlEyNURMRU5CUVVNN1dVRkRSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8xRkJRM1pGTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFbEJRVTBzUzBGQlN5eEhRVUZITEU5QlFVOHNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZETDBNc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU40UWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIVkNRVUYxUWl4SFFVRkhMRU5CUVVNc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU53UkN4RFFVRkRPMWxCUTBRc1NVRkJUU3hOUVVGTkxFZEJRVWNzVlVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM0JETEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNkVUpCUVhWQ0xFZEJRVWNzUTBGQlF5eEhRVUZITEhkQ1FVRjNRaXhEUVVGRExFTkJRVU03V1VGREwwVXNaMEpCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNkVUpCUVhWQ0xFZEJRVWNzUTBGQlF5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRExFTkJRVU03V1VGRGFFWXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhOUVVGTkxFTkJRVU03V1VGRGRFSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEYUVRc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRFJpeGxRVUZETzBGQlFVUXNRMEZCUXl4QlFURnRRa1FzU1VFd2JVSkRPMEZCTVcxQ1dTeG5Ra0ZCVVN4WFFUQnRRbkJDTEVOQlFVRTdRVUZCUVN4RFFVRkRJbjA9IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG5leHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMgPSBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuZXhwb3J0cy5TSE9SVF9NT05USF9OQU1FUyA9IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcclxuZXhwb3J0cy5NT05USF9MRVRURVJTID0gW1wiSlwiLCBcIkZcIiwgXCJNXCIsIFwiQVwiLCBcIk1cIiwgXCJKXCIsIFwiSlwiLCBcIkFcIiwgXCJTXCIsIFwiT1wiLCBcIk5cIiwgXCJEXCJdO1xyXG5leHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG5leHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbmV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyA9IFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xyXG5leHBvcnRzLldFRUtEQVlfTEVUVEVSUyA9IFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XHJcbmV4cG9ydHMuUVVBUlRFUl9MRVRURVIgPSBcIlFcIjtcclxuZXhwb3J0cy5RVUFSVEVSX1dPUkQgPSBcInF1YXJ0ZXJcIjtcclxuZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBbXCIxc3RcIiwgXCIybmRcIiwgXCIzcmRcIiwgXCI0dGhcIl07XHJcbmV4cG9ydHMuREVGQVVMVF9GT1JNQVRfT1BUSU9OUyA9IHtcclxuICAgIHF1YXJ0ZXJMZXR0ZXI6IGV4cG9ydHMuUVVBUlRFUl9MRVRURVIsXHJcbiAgICBxdWFydGVyV29yZDogZXhwb3J0cy5RVUFSVEVSX1dPUkQsXHJcbiAgICBxdWFydGVyQWJicmV2aWF0aW9uczogZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMsXHJcbiAgICBsb25nTW9udGhOYW1lczogZXhwb3J0cy5MT05HX01PTlRIX05BTUVTLFxyXG4gICAgc2hvcnRNb250aE5hbWVzOiBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTLFxyXG4gICAgbW9udGhMZXR0ZXJzOiBleHBvcnRzLk1PTlRIX0xFVFRFUlMsXHJcbiAgICBsb25nV2Vla2RheU5hbWVzOiBleHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyxcclxuICAgIHNob3J0V2Vla2RheU5hbWVzOiBleHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMsXHJcbiAgICB3ZWVrZGF5VHdvTGV0dGVyczogZXhwb3J0cy5XRUVLREFZX1RXT19MRVRURVJTLFxyXG4gICAgd2Vla2RheUxldHRlcnM6IGV4cG9ydHMuV0VFS0RBWV9MRVRURVJTXHJcbn07XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIHdpdGggdGhlIGZvcm1hdHRpbmcgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSBsb2NhbFpvbmUgVGhlIHpvbmUgdGhhdCBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdChkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lLCBmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgIGlmIChmb3JtYXRPcHRpb25zID09PSB2b2lkIDApIHsgZm9ybWF0T3B0aW9ucyA9IHt9OyB9XHJcbiAgICAvLyBtZXJnZSBmb3JtYXQgb3B0aW9ucyB3aXRoIGRlZmF1bHQgZm9ybWF0IG9wdGlvbnNcclxuICAgIC8vIHR5cGVjYXN0IHRvIHByZXZlbnQgZXJyb3IgVFM3MDE3OiBJbmRleCBzaWduYXR1cmUgb2Ygb2JqZWN0IHR5cGUgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZS5cclxuICAgIHZhciBnaXZlbkZvcm1hdE9wdGlvbnMgPSBmb3JtYXRPcHRpb25zO1xyXG4gICAgdmFyIGRlZmF1bHRGb3JtYXRPcHRpb25zID0gZXhwb3J0cy5ERUZBVUxUX0ZPUk1BVF9PUFRJT05TO1xyXG4gICAgdmFyIG1lcmdlZEZvcm1hdE9wdGlvbnMgPSB7fTtcclxuICAgIGZvciAodmFyIG5hbWVfMSBpbiBleHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlMpIHtcclxuICAgICAgICBpZiAoZXhwb3J0cy5ERUZBVUxUX0ZPUk1BVF9PUFRJT05TLmhhc093blByb3BlcnR5KG5hbWVfMSkpIHtcclxuICAgICAgICAgICAgdmFyIGdpdmVuRm9ybWF0T3B0aW9uID0gZ2l2ZW5Gb3JtYXRPcHRpb25zW25hbWVfMV07XHJcbiAgICAgICAgICAgIHZhciBkZWZhdWx0Rm9ybWF0T3B0aW9uID0gZGVmYXVsdEZvcm1hdE9wdGlvbnNbbmFtZV8xXTtcclxuICAgICAgICAgICAgbWVyZ2VkRm9ybWF0T3B0aW9uc1tuYW1lXzFdID0gZ2l2ZW5Gb3JtYXRPcHRpb24gfHwgZGVmYXVsdEZvcm1hdE9wdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3JtYXRPcHRpb25zID0gbWVyZ2VkRm9ybWF0T3B0aW9ucztcclxuICAgIHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW5fMS5Ub2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuICAgIHZhciB0b2tlbnMgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuICAgIHZhciByZXN1bHQgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV07XHJcbiAgICAgICAgdmFyIHRva2VuUmVzdWx0ID0gdm9pZCAwO1xyXG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLllFQVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuREFZOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVk6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5IT1VSOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlpPTkU6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRab25lKGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuV0VFSzpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IHRva2VuLnJhdztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQgKz0gdG9rZW5SZXN1bHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0LnRyaW0oKTtcclxufVxyXG5leHBvcnRzLmZvcm1hdCA9IGZvcm1hdDtcclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZXJhIChCQyBvciBBRClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgdmFyIEFEID0gZGF0ZVRpbWUueWVhciA+IDA7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gXCJBRFwiIDogXCJCQ1wiKTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBcIkFubm8gRG9taW5pXCIgOiBcIkJlZm9yZSBDaHJpc3RcIik7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gXCJBXCIgOiBcIkJcIik7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJ5XCI6XHJcbiAgICAgICAgY2FzZSBcIllcIjpcclxuICAgICAgICBjYXNlIFwiclwiOlxyXG4gICAgICAgICAgICB2YXIgeWVhclZhbHVlID0gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHllYXJWYWx1ZTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgIHZhciBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5xdWFydGVyTGV0dGVyICsgcXVhcnRlcjtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgZm9ybWF0T3B0aW9ucy5xdWFydGVyV29yZDtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLm1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgd2VlayBudW1iZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwid1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgbW9udGggKG9yIHllYXIpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5kYXkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIkRcIjpcclxuICAgICAgICAgICAgdmFyIGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucykge1xyXG4gICAgdmFyIHdlZWtEYXlOdW1iZXIgPSBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcyk7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgfSAvLyBObyBicmVhaywgdGhpcyBpcyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaCFcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ1dlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLndlZWtkYXlMZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheVR3b0xldHRlcnNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBEYXkgUGVyaW9kIChBTSBvciBQTSlcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgcmV0dXJuIChkYXRlVGltZS5ob3VyIDwgMTIgPyBcIkFNXCIgOiBcIlBNXCIpO1xyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIEhvdXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHZhciBob3VyID0gZGF0ZVRpbWUuaG91cjtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImhcIjpcclxuICAgICAgICAgICAgaG91ciA9IGhvdXIgJSAxMjtcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSAxMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiSFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIktcIjpcclxuICAgICAgICAgICAgaG91ciA9IGhvdXIgJSAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJrXCI6XHJcbiAgICAgICAgICAgIGlmIChob3VyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBob3VyID0gMjQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtaW51dGVcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5taW51dGUudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcInNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIlNcIjpcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XHJcbiAgICAgICAgICAgIHZhciBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkTGVmdChmcmFjdGlvbi50b1N0cmluZygpLCAzLCBcIjBcIik7XHJcbiAgICAgICAgICAgIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xyXG4gICAgICAgIGNhc2UgXCJBXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLnNlY29uZE9mRGF5KGRhdGVUaW1lLmhvdXIsIGRhdGVUaW1lLm1pbnV0ZSwgZGF0ZVRpbWUuc2Vjb25kKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHRpbWUgem9uZS4gRm9yIHRoaXMsIHdlIG5lZWQgdGhlIGN1cnJlbnQgdGltZSwgdGhlIHRpbWUgaW4gVVRDIGFuZCB0aGUgdGltZSB6b25lXHJcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSB6b25lIFRoZSB0aW1lem9uZSBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIHRva2VuKSB7XHJcbiAgICBpZiAoIXpvbmUpIHtcclxuICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICAgIHZhciBvZmZzZXQgPSBNYXRoLnJvdW5kKChjdXJyZW50VGltZS51bml4TWlsbGlzIC0gdXRjVGltZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuICAgIHZhciBvZmZzZXRIb3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcclxuICAgIHZhciBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcbiAgICBvZmZzZXRIb3Vyc1N0cmluZyA9IChvZmZzZXQgPj0gMCA/IFwiK1wiICsgb2Zmc2V0SG91cnNTdHJpbmcgOiBcIi1cIiArIG9mZnNldEhvdXJzU3RyaW5nKTtcclxuICAgIHZhciBvZmZzZXRNaW51dGVzID0gTWF0aC5hYnMob2Zmc2V0ICUgNjApO1xyXG4gICAgdmFyIG9mZnNldE1pbnV0ZXNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0TWludXRlcy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcbiAgICB2YXIgcmVzdWx0O1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiT1wiOlxyXG4gICAgICAgICAgICByZXN1bHQgPSBcIlVUQ1wiO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2V0ID49IDApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIitcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIi1cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2Zmc2V0SG91cnMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA+PSA0IHx8IG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICBjYXNlIFwiWlwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1Rva2VuID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogXCJPT09PXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogXCJPXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWk9ORVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJ6XCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJ2XCI6XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJWXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IGltcGxlbWVudGVkXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidW5rXCI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUubmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiWFwiOlxyXG4gICAgICAgICAgICBpZiAob2Zmc2V0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJaXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwieFwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9mZnNldEhvdXJzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWm05eWJXRjBMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyeHBZaTltYjNKdFlYUXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdSMEZKUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVkaUxFbEJRVmtzVFVGQlRTeFhRVUZOTEZWQlFWVXNRMEZCUXl4RFFVRkJPMEZCUTI1RExITkNRVUZwUlN4VFFVRlRMRU5CUVVNc1EwRkJRVHRCUVVNelJTeEpRVUZaTEU5QlFVOHNWMEZCVFN4WFFVRlhMRU5CUVVNc1EwRkJRVHRCUVhkRGVFSXNkMEpCUVdkQ0xFZEJRelZDTEVOQlFVTXNVMEZCVXl4RlFVRkZMRlZCUVZVc1JVRkJSU3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TlFVRk5MRVZCUVVVc1RVRkJUU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFhRVUZYTEVWQlFVVXNVMEZCVXl4RlFVRkZMRlZCUVZVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVVV2Unl4NVFrRkJhVUlzUjBGRE4wSXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzBGQlJYcEZMSEZDUVVGaExFZEJRM3BDTEVOQlFVTXNSMEZCUnl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dEJRVVZxUkN3d1FrRkJhMElzUjBGRE9VSXNRMEZCUXl4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRkxGTkJRVk1zUlVGQlJTeFhRVUZYTEVWQlFVVXNWVUZCVlN4RlFVRkZMRkZCUVZFc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVVZ1UlN3eVFrRkJiVUlzUjBGREwwSXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dEJRVVYwUXl3eVFrRkJiVUlzUjBGREwwSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVVV2UWl4MVFrRkJaU3hIUVVNelFpeERRVUZETEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJSWGhDTEhOQ1FVRmpMRWRCUVVjc1IwRkJSeXhEUVVGRE8wRkJRM0pDTEc5Q1FVRlpMRWRCUVVjc1UwRkJVeXhEUVVGRE8wRkJRM3BDTERaQ1FVRnhRaXhIUVVGSExFTkJRVU1zUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03UVVGRmNrUXNPRUpCUVhOQ0xFZEJRV3RDTzBsQlEzQkVMR0ZCUVdFc1JVRkJSU3h6UWtGQll6dEpRVU0zUWl4WFFVRlhMRVZCUVVVc2IwSkJRVms3U1VGRGVrSXNiMEpCUVc5Q0xFVkJRVVVzTmtKQlFYRkNPMGxCUXpORExHTkJRV01zUlVGQlJTeDNRa0ZCWjBJN1NVRkRhRU1zWlVGQlpTeEZRVUZGTEhsQ1FVRnBRanRKUVVOc1F5eFpRVUZaTEVWQlFVVXNjVUpCUVdFN1NVRkRNMElzWjBKQlFXZENMRVZCUVVVc01FSkJRV3RDTzBsQlEzQkRMR2xDUVVGcFFpeEZRVUZGTERKQ1FVRnRRanRKUVVOMFF5eHBRa0ZCYVVJc1JVRkJSU3d5UWtGQmJVSTdTVUZEZEVNc1kwRkJZeXhGUVVGRkxIVkNRVUZsTzBOQlF5OUNMRU5CUVVNN1FVRkhSanM3T3pzN096czdPMGRCVTBjN1FVRkRTQ3huUWtGRFF5eFJRVUZ2UWl4RlFVTndRaXhQUVVGdFFpeEZRVU51UWl4VFFVRnRRaXhGUVVOdVFpeFpRVUZ2UWl4RlFVTndRaXhoUVVGcFF6dEpRVUZxUXl3MlFrRkJhVU1zUjBGQmFrTXNhMEpCUVdsRE8wbEJSV3BETEcxRVFVRnRSRHRKUVVOdVJDeHBSMEZCYVVjN1NVRkRha2NzU1VGQlRTeHJRa0ZCYTBJc1IwRkJVU3hoUVVGaExFTkJRVU03U1VGRE9VTXNTVUZCVFN4dlFrRkJiMElzUjBGQlVTdzRRa0ZCYzBJc1EwRkJRenRKUVVONlJDeEpRVUZOTEcxQ1FVRnRRaXhIUVVGUkxFVkJRVVVzUTBGQlF6dEpRVU53UXl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGTkxFMUJRVWtzU1VGQlNTdzRRa0ZCYzBJc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE0wTXNSVUZCUlN4RFFVRkRMRU5CUVVNc09FSkJRWE5DTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTFCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5xUkN4SlFVRk5MR2xDUVVGcFFpeEhRVUZSTEd0Q1FVRnJRaXhEUVVGRExFMUJRVWtzUTBGQlF5eERRVUZETzFsQlEzaEVMRWxCUVUwc2JVSkJRVzFDTEVkQlFWRXNiMEpCUVc5Q0xFTkJRVU1zVFVGQlNTeERRVUZETEVOQlFVTTdXVUZETlVRc2JVSkJRVzFDTEVOQlFVTXNUVUZCU1N4RFFVRkRMRWRCUVVjc2FVSkJRV2xDTEVsQlFVa3NiVUpCUVcxQ0xFTkJRVU03VVVGRGRFVXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkRSQ3hoUVVGaExFZEJRVWNzYlVKQlFXMUNMRU5CUVVNN1NVRkZjRU1zU1VGQlRTeFRRVUZUTEVkQlFVY3NTVUZCU1N4cFFrRkJVeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzBsQlF6bERMRWxCUVUwc1RVRkJUU3hIUVVGWkxGTkJRVk1zUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0SlFVTm9SQ3hKUVVGSkxFMUJRVTBzUjBGQlZ5eEZRVUZGTEVOQlFVTTdTVUZEZUVJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1VVRkRlRU1zU1VGQlRTeExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM2hDTEVsQlFVa3NWMEZCVnl4VFFVRlJMRU5CUVVNN1VVRkRlRUlzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNFSXNTMEZCU3l4NVFrRkJVeXhEUVVGRExFZEJRVWM3WjBKQlEycENMRmRCUVZjc1IwRkJSeXhWUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVNeFF5eExRVUZMTEVOQlFVTTdXVUZEVUN4TFFVRkxMSGxDUVVGVExFTkJRVU1zU1VGQlNUdG5Ra0ZEYkVJc1YwRkJWeXhIUVVGSExGZEJRVmNzUTBGQlF5eFJRVUZSTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRek5ETEV0QlFVc3NRMEZCUXp0WlFVTlFMRXRCUVVzc2VVSkJRVk1zUTBGQlF5eFBRVUZQTzJkQ1FVTnlRaXhYUVVGWExFZEJRVWNzWTBGQll5eERRVUZETEZGQlFWRXNSVUZCUlN4TFFVRkxMRVZCUVVVc1lVRkJZU3hEUVVGRExFTkJRVU03WjBKQlF6ZEVMRXRCUVVzc1EwRkJRenRaUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4TFFVRkxPMmRDUVVOdVFpeFhRVUZYTEVkQlFVY3NXVUZCV1N4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFVkJRVVVzWVVGQllTeERRVUZETEVOQlFVTTdaMEpCUXpORUxFdEJRVXNzUTBGQlF6dFpRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhIUVVGSE8yZENRVU5xUWl4WFFVRlhMRWRCUVVjc1ZVRkJWU3hEUVVGRExGRkJRVkVzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRNVU1zUzBGQlN5eERRVUZETzFsQlExQXNTMEZCU3l4NVFrRkJVeXhEUVVGRExFOUJRVTg3WjBKQlEzSkNMRmRCUVZjc1IwRkJSeXhqUVVGakxFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NSVUZCUlN4aFFVRmhMRU5CUVVNc1EwRkJRenRuUWtGRE4wUXNTMEZCU3l4RFFVRkRPMWxCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEZOQlFWTTdaMEpCUTNaQ0xGZEJRVmNzUjBGQlJ5eG5Ra0ZCWjBJc1EwRkJReXhSUVVGUkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUTJoRUxFdEJRVXNzUTBGQlF6dFpRVU5RTEV0QlFVc3NlVUpCUVZNc1EwRkJReXhKUVVGSk8yZENRVU5zUWl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRExGRkJRVkVzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRNME1zUzBGQlN5eERRVUZETzFsQlExQXNTMEZCU3l4NVFrRkJVeXhEUVVGRExFMUJRVTA3WjBKQlEzQkNMRmRCUVZjc1IwRkJSeXhoUVVGaExFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVNM1F5eExRVUZMTEVOQlFVTTdXVUZEVUN4TFFVRkxMSGxDUVVGVExFTkJRVU1zVFVGQlRUdG5Ra0ZEY0VJc1YwRkJWeXhIUVVGSExHRkJRV0VzUTBGQlF5eFJRVUZSTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRemRETEV0QlFVc3NRMEZCUXp0WlFVTlFMRXRCUVVzc2VVSkJRVk1zUTBGQlF5eEpRVUZKTzJkQ1FVTnNRaXhYUVVGWExFZEJRVWNzVjBGQlZ5eERRVUZETEZGQlFWRXNSVUZCUlN4UFFVRlBMRVZCUVVVc1UwRkJVeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzJkQ1FVTXZSQ3hMUVVGTExFTkJRVU03V1VGRFVDeExRVUZMTEhsQ1FVRlRMRU5CUVVNc1NVRkJTVHRuUWtGRGJFSXNWMEZCVnl4SFFVRkhMRmRCUVZjc1EwRkJReXhSUVVGUkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUXpORExFdEJRVXNzUTBGQlF6dFpRVU5RTEZGQlFWRTdXVUZEVWl4TFFVRkxMSGxDUVVGVExFTkJRVU1zVVVGQlVUdG5Ra0ZEZEVJc1YwRkJWeXhIUVVGSExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTTdaMEpCUTNoQ0xFdEJRVXNzUTBGQlF6dFJRVU5TTEVOQlFVTTdVVUZEUkN4TlFVRk5MRWxCUVVrc1YwRkJWeXhEUVVGRE8wbEJRM1pDTEVOQlFVTTdTVUZGUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzBGQlEzUkNMRU5CUVVNN1FVRjZSV1VzWTBGQlRTeFRRWGxGY2tJc1EwRkJRVHRCUVVWRU96czdPenM3UjBGTlJ6dEJRVU5JTEc5Q1FVRnZRaXhSUVVGdlFpeEZRVUZGTEV0QlFWazdTVUZEY2tRc1NVRkJUU3hGUVVGRkxFZEJRVmtzVVVGQlVTeERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1NVRkRkRU1zVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGRFSXNTMEZCU3l4RFFVRkRMRU5CUVVNN1VVRkRVQ3hMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU5RTEV0QlFVc3NRMEZCUXp0WlFVTk1MRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNMElzUzBGQlN5eERRVUZETzFsQlEwd3NUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGSExHRkJRV0VzUjBGQlJ5eGxRVUZsTEVOQlFVTXNRMEZCUXp0UlFVTXZReXhMUVVGTExFTkJRVU03V1VGRFRDeE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzcENPMWxCUTBNc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHZRa0ZCYjBJc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEdOQlFXTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRGRrWXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeHhRa0ZCY1VJc1VVRkJiMElzUlVGQlJTeExRVUZaTzBsQlEzUkVMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNSQ0xFdEJRVXNzUjBGQlJ5eERRVUZETzFGQlExUXNTMEZCU3l4SFFVRkhMRU5CUVVNN1VVRkRWQ3hMUVVGTExFZEJRVWM3V1VGRFVDeEpRVUZKTEZOQlFWTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTTNSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzaENMRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRha01zUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN1VVRkRiRUlzTUVKQlFUQkNPMUZCUXpGQ08xbEJRME1zZDBKQlFYZENPMWxCUTNoQ0xEQkNRVUV3UWp0WlFVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiMEpCUVc5Q0xFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4aFFVRmhMRWRCUVVjc2VVSkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVJpeERRVUZETzBsQlEwZ3NRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeDNRa0ZCZDBJc1VVRkJiMElzUlVGQlJTeExRVUZaTEVWQlFVVXNZVUZCTkVJN1NVRkRka1lzU1VGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpsRExFMUJRVTBzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM1JDTEV0QlFVc3NRMEZCUXl4RFFVRkRPMUZCUTFBc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUlVGQlJTeEZRVUZGTEVOQlFVTXNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOd1JDeExRVUZMTEVOQlFVTTdXVUZEVEN4TlFVRk5MRU5CUVVNc1lVRkJZU3hEUVVGRExHRkJRV0VzUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZET1VNc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExHRkJRV0VzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZETVVZc1MwRkJTeXhEUVVGRE8xbEJRMHdzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJRenRSUVVNelFpd3dRa0ZCTUVJN1VVRkRNVUk3V1VGRFF5eDNRa0ZCZDBJN1dVRkRlRUlzTUVKQlFUQkNPMWxCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dlFrRkJiMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZEZEVZc1EwRkJRenRKUVVOSUxFTkJRVU03UVVGRFJpeERRVUZETzBGQlJVUTdPenM3T3p0SFFVMUhPMEZCUTBnc2MwSkJRWE5DTEZGQlFXOUNMRVZCUVVVc1MwRkJXU3hGUVVGRkxHRkJRVFJDTzBsQlEzSkdMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNSQ0xFdEJRVXNzUTBGQlF5eERRVUZETzFGQlExQXNTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM1JGTEV0QlFVc3NRMEZCUXp0WlFVTk1MRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zWlVGQlpTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE1VUXNTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU42UkN4TFFVRkxMRU5CUVVNN1dVRkRUQ3hOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzWkVMREJDUVVFd1FqdFJRVU14UWp0WlFVTkRMSGRDUVVGM1FqdFpRVU40UWl3d1FrRkJNRUk3V1VGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExHOUNRVUZ2UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzWTBGQll5eEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRaUVVOMFJpeERRVUZETzBsQlEwZ3NRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeHhRa0ZCY1VJc1VVRkJiMElzUlVGQlJTeExRVUZaTzBsQlEzUkVMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNeFFpeE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOMFNDeERRVUZETzBsQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRVQ3hOUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNVVUZCVVN4RFFVRkRMRXRCUVVzc1JVRkJSU3hSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0SlFVTjJTQ3hEUVVGRE8wRkJRMFlzUTBGQlF6dEJRVVZFT3pzN096czdSMEZOUnp0QlFVTklMRzlDUVVGdlFpeFJRVUZ2UWl4RlFVRkZMRXRCUVZrN1NVRkRja1FzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGRFSXNTMEZCU3l4SFFVRkhPMWxCUTFBc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM0JGTEV0QlFVc3NSMEZCUnp0WlFVTlFMRWxCUVUwc1UwRkJVeXhIUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hSUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03V1VGRGNFWXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRXRCUVVzc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdVVUZEYWtVc01FSkJRVEJDTzFGQlF6RkNPMWxCUTBNc2QwSkJRWGRDTzFsQlEzaENMREJDUVVFd1FqdFpRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYjBKQlFXOUNMRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eGhRVUZoTEVkQlFVY3NlVUpCUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVSaXhEUVVGRE8wbEJRMGdzUTBGQlF6dEJRVU5HTEVOQlFVTTdRVUZGUkRzN096czdPMGRCVFVjN1FVRkRTQ3gzUWtGQmQwSXNVVUZCYjBJc1JVRkJSU3hMUVVGWkxFVkJRVVVzWVVGQk5FSTdTVUZEZGtZc1NVRkJUU3hoUVVGaExFZEJRVWNzVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExGRkJRVkVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVVndSU3hOUVVGTkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOMFFpeExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTlFMRXRCUVVzc1EwRkJRenRaUVVOTUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZETVVJc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRM0pITEVOQlFVTXNRMEZCUXl3MlEwRkJOa003VVVGRGFFUXNTMEZCU3l4RFFVRkRPMWxCUTB3c1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dFJRVU4yUkN4TFFVRkxMRU5CUVVNN1dVRkRUQ3hOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETzFGQlEzUkVMRXRCUVVzc1EwRkJRenRaUVVOTUxFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRE8xRkJRM0JFTEV0QlFVc3NRMEZCUXp0WlFVTk1MRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03VVVGRGRrUXNNRUpCUVRCQ08xRkJRekZDTzFsQlEwTXNkMEpCUVhkQ08xbEJRM2hDTERCQ1FVRXdRanRaUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2IwSkJRVzlDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhqUVVGakxFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMWxCUTNSR0xFTkJRVU03U1VGRFNDeERRVUZETzBGQlEwWXNRMEZCUXp0QlFVVkVPenM3T3pzN1IwRk5SenRCUVVOSUxEQkNRVUV3UWl4UlFVRnZRaXhGUVVGRkxFdEJRVms3U1VGRE0wUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRE8wRkJRek5ETEVOQlFVTTdRVUZGUkRzN096czdPMGRCVFVjN1FVRkRTQ3h4UWtGQmNVSXNVVUZCYjBJc1JVRkJSU3hMUVVGWk8wbEJRM1JFTEVsQlFVa3NTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU03U1VGRGVrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEZEVJc1MwRkJTeXhIUVVGSE8xbEJRMUFzU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1dVRkRha0lzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEyaENMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRFdDeERRVUZETzFsQlFVRXNRMEZCUXp0WlFVTkdMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUXpWRUxFdEJRVXNzUjBGQlJ6dFpRVU5RTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFGQlF6VkVMRXRCUVVzc1IwRkJSenRaUVVOUUxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NSVUZCUlN4RFFVRkRPMWxCUTJwQ0xFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRelZFTEV0QlFVc3NSMEZCUnp0WlFVTlFMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOb1FpeEpRVUZKTEVkQlFVY3NSVUZCUlN4RFFVRkRPMWxCUTFnc1EwRkJRenRaUVVGQkxFTkJRVU03V1VGRFJpeE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU0xUkN3d1FrRkJNRUk3VVVGRE1VSTdXVUZEUXl4M1FrRkJkMEk3V1VGRGVFSXNNRUpCUVRCQ08xbEJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXh2UWtGQmIwSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExHRkJRV0VzUjBGQlJ5eDVRa0ZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6bEdMRU5CUVVNN1NVRkRTQ3hEUVVGRE8wRkJRMFlzUTBGQlF6dEJRVVZFT3pzN096czdSMEZOUnp0QlFVTklMSFZDUVVGMVFpeFJRVUZ2UWl4RlFVRkZMRXRCUVZrN1NVRkRlRVFzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBGQlEzWkZMRU5CUVVNN1FVRkZSRHM3T3pzN08wZEJUVWM3UVVGRFNDeDFRa0ZCZFVJc1VVRkJiMElzUlVGQlJTeExRVUZaTzBsQlEzaEVMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNSQ0xFdEJRVXNzUjBGQlJ6dFpRVU5RTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTjJSU3hMUVVGTExFZEJRVWM3V1VGRFVDeEpRVUZOTEZGQlFWRXNSMEZCUnl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRE8xbEJRMmhETEVsQlFVa3NZMEZCWXl4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU5zUlN4alFVRmpMRWRCUVVjc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eGpRVUZqTEVWQlFVVXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU55UlN4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8xRkJRemxETEV0QlFVc3NSMEZCUnp0WlFVTlFMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFGQlF6TklMREJDUVVFd1FqdFJRVU14UWp0WlFVTkRMSGRDUVVGM1FqdFpRVU40UWl3d1FrRkJNRUk3V1VGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExHOUNRVUZ2UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzWVVGQllTeEhRVUZITEhsQ1FVRlRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZET1VZc1EwRkJRenRKUVVOSUxFTkJRVU03UVVGRFJpeERRVUZETzBGQlJVUTdPenM3T3pzN1IwRlBSenRCUVVOSUxIRkNRVUZ4UWl4WFFVRjFRaXhGUVVGRkxFOUJRVzFDTEVWQlFVVXNTVUZCWXl4RlFVRkZMRXRCUVZrN1NVRkRPVVlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMWdzVFVGQlRTeERRVUZETEVWQlFVVXNRMEZCUXp0SlFVTllMRU5CUVVNN1NVRkRSQ3hKUVVGTkxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExGVkJRVlVzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRmFrWXNTVUZCVFN4WFFVRlhMRWRCUVZjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzBsQlF6bEVMRWxCUVVrc2FVSkJRV2xDTEVkQlFVY3NUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRM2hGTEdsQ1FVRnBRaXhIUVVGSExFTkJRVU1zVFVGQlRTeEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWRCUVVjc2FVSkJRV2xDTEVkQlFVY3NSMEZCUnl4SFFVRkhMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdTVUZEZEVZc1NVRkJUU3hoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU03U1VGRE5VTXNTVUZCVFN4dFFrRkJiVUlzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMR0ZCUVdFc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1NVRkRPVVVzU1VGQlNTeE5RVUZqTEVOQlFVTTdTVUZGYmtJc1RVRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRkRUlzUzBGQlN5eEhRVUZITzFsQlExQXNUVUZCVFN4SFFVRkhMRXRCUVVzc1EwRkJRenRaUVVObUxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5xUWl4TlFVRk5MRWxCUVVrc1IwRkJSeXhEUVVGRE8xbEJRMllzUTBGQlF6dFpRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFMUJRVTBzU1VGQlNTeEhRVUZITEVOQlFVTTdXVUZEWml4RFFVRkRPMWxCUTBRc1RVRkJUU3hKUVVGSkxGZEJRVmNzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0WlFVTnFReXhGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1NVRkJTU3hoUVVGaExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRPVU1zVFVGQlRTeEpRVUZKTEVkQlFVY3NSMEZCUnl4dFFrRkJiVUlzUTBGQlF6dFpRVU55UXl4RFFVRkRPMWxCUTBRc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF6dFJRVU5tTEV0QlFVc3NSMEZCUnp0WlFVTlFMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOMFFpeExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hMUVVGTExFTkJRVU1zUTBGQlF6dG5Ra0ZEVUN4TFFVRkxMRU5CUVVNN2IwSkJRMHdzVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhIUVVGSExHMUNRVUZ0UWl4RFFVRkRPMmRDUVVOb1JDeExRVUZMTEVOQlFVTTdiMEpCUTB3c1NVRkJUU3hSUVVGUkxFZEJRVlU3ZDBKQlEzWkNMRTFCUVUwc1JVRkJSU3hEUVVGRE8zZENRVU5VTEVkQlFVY3NSVUZCUlN4TlFVRk5PM2RDUVVOWUxFMUJRVTBzUlVGQlJTeEhRVUZITzNkQ1FVTllMRWxCUVVrc1JVRkJSU3g1UWtGQlV5eERRVUZETEVsQlFVazdjVUpCUTNCQ0xFTkJRVU03YjBKQlEwWXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhYUVVGWExFVkJRVVVzVDBGQlR5eEZRVUZGTEVsQlFVa3NSVUZCUlN4UlFVRlJMRU5CUVVNc1EwRkJRenRuUWtGRE1VUXNTMEZCU3l4RFFVRkRPMjlDUVVOTUxFMUJRVTBzUTBGQlF5eHBRa0ZCYVVJc1IwRkJSeXhIUVVGSExFZEJRVWNzYlVKQlFXMUNMRU5CUVVNN1owSkJRM1JFTERCQ1FVRXdRanRuUWtGRE1VSTdiMEpCUTBNc2QwSkJRWGRDTzI5Q1FVTjRRaXd3UWtGQk1FSTdiMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dlFrRkJiMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdiMEpCUTNSR0xFTkJRVU03V1VGRFNDeERRVUZETzFGQlEwWXNTMEZCU3l4SFFVRkhPMWxCUTFBc1RVRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM1JDTEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVOUUxFdEJRVXNzUTBGQlF5eERRVUZETzJkQ1FVTlFMRXRCUVVzc1EwRkJRenR2UWtGRFRDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMR3RDUVVGclFpeERRVUZETEZkQlFWY3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRuUWtGRGJrUXNTMEZCU3l4RFFVRkRPMjlDUVVOTUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNN1owSkJRM2hDTERCQ1FVRXdRanRuUWtGRE1VSTdiMEpCUTBNc2QwSkJRWGRDTzI5Q1FVTjRRaXd3UWtGQk1FSTdiMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4dlFrRkJiMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdiMEpCUTNSR0xFTkJRVU03V1VGRFNDeERRVUZETzFGQlEwWXNTMEZCU3l4SFFVRkhPMWxCUTFBc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU40UWl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRmRCUVZjc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU53UkN4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFpRVU40UWl4RFFVRkRPMUZCUTBZc1MwRkJTeXhIUVVGSE8xbEJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzUkNMRXRCUVVzc1EwRkJRenR2UWtGRFRDeHJRa0ZCYTBJN2IwSkJRMnhDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1owSkJRMlFzUzBGQlN5eERRVUZETzI5Q1FVTk1MRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUTNCQ0xFdEJRVXNzUTBGQlF5eERRVUZETzJkQ1FVTlFMRXRCUVVzc1EwRkJRenR2UWtGRFRDeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRPMmRDUVVOc1Fpd3dRa0ZCTUVJN1owSkJRekZDTzI5Q1FVTkRMSGRDUVVGM1FqdHZRa0ZEZUVJc01FSkJRVEJDTzI5Q1FVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiMEpCUVc5Q0xFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4alFVRmpMRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzI5Q1FVTjBSaXhEUVVGRE8xbEJRMGdzUTBGQlF6dFJRVU5HTEV0QlFVc3NSMEZCUnp0WlFVTlFMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOc1FpeE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRPMWxCUTFvc1EwRkJRenRSUVVOR0xFdEJRVXNzUjBGQlJ6dFpRVU5RTEUxQlFVMHNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjBRaXhMUVVGTExFTkJRVU03YjBKQlEwd3NUVUZCVFN4SFFVRkhMR2xDUVVGcFFpeERRVUZETzI5Q1FVTXpRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eGhRVUZoTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRGVrSXNUVUZCVFN4SlFVRkpMRzFDUVVGdFFpeERRVUZETzI5Q1FVTXZRaXhEUVVGRE8yOUNRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJRMllzUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUTFBc1MwRkJTeXhEUVVGRE8yOUNRVU5NTEUxQlFVMHNRMEZCUXl4cFFrRkJhVUlzUjBGQlJ5eHRRa0ZCYlVJc1EwRkJRenRuUWtGRGFFUXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRMUFzUzBGQlN5eERRVUZETzI5Q1FVTk1MRTFCUVUwc1EwRkJReXhwUWtGQmFVSXNSMEZCUnl4SFFVRkhMRWRCUVVjc2JVSkJRVzFDTEVOQlFVTTdaMEpCUTNSRUxEQkNRVUV3UWp0blFrRkRNVUk3YjBKQlEwTXNkMEpCUVhkQ08yOUNRVU40UWl3d1FrRkJNRUk3YjBKQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHZRa0ZCYjBJc1IwRkJSeXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEdOQlFXTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03YjBKQlEzUkdMRU5CUVVNN1dVRkRTQ3hEUVVGRE8xRkJRMFlzTUVKQlFUQkNPMUZCUXpGQ08xbEJRME1zZDBKQlFYZENPMWxCUTNoQ0xEQkNRVUV3UWp0WlFVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOV0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiMEpCUVc5Q0xFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4aFFVRmhMRWRCUVVjc2VVSkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVJpeERRVUZETzBsQlEwZ3NRMEZCUXp0QlFVTkdMRU5CUVVNaWZRPT0iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIG1pbihkMSwgZDIpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KChkMSBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBkYXRldGltZV8xLkRhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiksIFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuICAgIHJldHVybiBkMS5taW4oZDIpO1xyXG59XHJcbmV4cG9ydHMubWluID0gbWluO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gbWF4KGQxLCBkMikge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGFzc2VydF8xLmRlZmF1bHQoKGQxIGluc3RhbmNlb2YgZGF0ZXRpbWVfMS5EYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uKSwgXCJFaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zIGV4cGVjdGVkXCIpO1xyXG4gICAgcmV0dXJuIGQxLm1heChkMik7XHJcbn1cclxuZXhwb3J0cy5tYXggPSBtYXg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBhYnMoZCkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uLCBcImZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhIER1cmF0aW9uXCIpO1xyXG4gICAgcmV0dXJuIGQuYWJzKCk7XHJcbn1cclxuZXhwb3J0cy5hYnMgPSBhYnM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVoyeHZZbUZzY3k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlzYVdJdloyeHZZbUZzY3k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3T3p0SFFVbEhPMEZCUlVnc1dVRkJXU3hEUVVGRE8wRkJSV0lzZFVKQlFXMUNMRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJRemxDTEhsQ1FVRjVRaXhaUVVGWkxFTkJRVU1zUTBGQlFUdEJRVU4wUXl4NVFrRkJlVUlzV1VGQldTeERRVUZETEVOQlFVRTdRVUZWZEVNN08wZEJSVWM3UVVGRFNDeGhRVUZ2UWl4RlFVRlBMRVZCUVVVc1JVRkJUenRKUVVOdVF5eG5Ra0ZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3gzUWtGQmQwSXNRMEZCUXl4RFFVRkRPMGxCUTNKRExHZENRVUZOTEVOQlFVTXNSVUZCUlN4RlFVRkZMSGRDUVVGM1FpeERRVUZETEVOQlFVTTdTVUZEY2tNc01FSkJRVEJDTzBsQlF6RkNMR2RDUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEZsQlFWa3NiVUpCUVZFc1NVRkJTU3hGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3haUVVGWkxHMUNRVUZSTEVsQlFVa3NSVUZCUlN4WlFVRlpMRzFDUVVGUkxFTkJRVU1zUlVGRE9VY3NaMFJCUVdkRUxFTkJRVU1zUTBGQlF6dEpRVU51UkN4TlFVRk5MRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXp0QlFVTnVRaXhEUVVGRE8wRkJVR1VzVjBGQlJ5eE5RVTlzUWl4RFFVRkJPMEZCVlVRN08wZEJSVWM3UVVGRFNDeGhRVUZ2UWl4RlFVRlBMRVZCUVVVc1JVRkJUenRKUVVOdVF5eG5Ra0ZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3gzUWtGQmQwSXNRMEZCUXl4RFFVRkRPMGxCUTNKRExHZENRVUZOTEVOQlFVTXNSVUZCUlN4RlFVRkZMSGRDUVVGM1FpeERRVUZETEVOQlFVTTdTVUZEY2tNc01FSkJRVEJDTzBsQlF6RkNMR2RDUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEZsQlFWa3NiVUpCUVZFc1NVRkJTU3hGUVVGRkxGbEJRVmtzYlVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3haUVVGWkxHMUNRVUZSTEVsQlFVa3NSVUZCUlN4WlFVRlpMRzFDUVVGUkxFTkJRVU1zUlVGRE9VY3NaMFJCUVdkRUxFTkJRVU1zUTBGQlF6dEpRVU51UkN4TlFVRk5MRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXp0QlFVTnVRaXhEUVVGRE8wRkJVR1VzVjBGQlJ5eE5RVTlzUWl4RFFVRkJPMEZCUlVRN08wZEJSVWM3UVVGRFNDeGhRVUZ2UWl4RFFVRlhPMGxCUXpsQ0xHZENRVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMSGRDUVVGM1FpeERRVUZETEVOQlFVTTdTVUZEY0VNc1owSkJRVTBzUTBGQlF5eERRVUZETEZsQlFWa3NiVUpCUVZFc1JVRkJSU3hyUTBGQmEwTXNRMEZCUXl4RFFVRkRPMGxCUTJ4RkxFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNN1FVRkRhRUlzUTBGQlF6dEJRVXBsTEZkQlFVY3NUVUZKYkVJc1EwRkJRU0o5IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBJbmRpY2F0ZXMgaG93IGEgRGF0ZSBvYmplY3Qgc2hvdWxkIGJlIGludGVycHJldGVkLlxyXG4gKiBFaXRoZXIgd2UgY2FuIHRha2UgZ2V0WWVhcigpLCBnZXRNb250aCgpIGV0YyBmb3Igb3VyIGZpZWxkXHJcbiAqIHZhbHVlcywgb3Igd2UgY2FuIHRha2UgZ2V0VVRDWWVhcigpLCBnZXRVdGNNb250aCgpIGV0YyB0byBkbyB0aGF0LlxyXG4gKi9cclxuKGZ1bmN0aW9uIChEYXRlRnVuY3Rpb25zKSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIERhdGVGdW5jdGlvbnNbRGF0ZUZ1bmN0aW9uc1tcIkdldFwiXSA9IDBdID0gXCJHZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoZSBEYXRlLmdldFVUQ0Z1bGxZZWFyKCksIERhdGUuZ2V0VVRDTW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0VVRDXCJdID0gMV0gPSBcIkdldFVUQ1wiO1xyXG59KShleHBvcnRzLkRhdGVGdW5jdGlvbnMgfHwgKGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyA9IHt9KSk7XHJcbnZhciBEYXRlRnVuY3Rpb25zID0gZXhwb3J0cy5EYXRlRnVuY3Rpb25zO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhbUYyWVhOamNtbHdkQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OXNhV0l2YW1GMllYTmpjbWx3ZEM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3UjBGRlJ6dEJRVVZJTEZsQlFWa3NRMEZCUXp0QlFVVmlPenM3TzBkQlNVYzdRVUZEU0N4WFFVRlpMR0ZCUVdFN1NVRkRlRUk3TzA5QlJVYzdTVUZEU0N3clEwRkJSeXhEUVVGQk8wbEJRMGc3TzA5QlJVYzdTVUZEU0N4eFJFRkJUU3hEUVVGQk8wRkJRMUFzUTBGQlF5eEZRVlJYTEhGQ1FVRmhMRXRCUVdJc2NVSkJRV0VzVVVGVGVFSTdRVUZVUkN4SlFVRlpMR0ZCUVdFc1IwRkJZaXh4UWtGVFdDeERRVUZCSW4wPSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxuLyoqXHJcbiAqIEByZXR1cm4gdHJ1ZSBpZmYgZ2l2ZW4gYXJndW1lbnQgaXMgYW4gaW50ZWdlciBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGlzSW50KG4pIHtcclxuICAgIGlmICh0eXBlb2YgKG4pICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKG4pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcclxufVxyXG5leHBvcnRzLmlzSW50ID0gaXNJbnQ7XHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqL1xyXG5mdW5jdGlvbiByb3VuZFN5bShuKSB7XHJcbiAgICBpZiAobiA8IDApIHtcclxuICAgICAgICByZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChuKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnJvdW5kU3ltID0gcm91bmRTeW07XHJcbi8qKlxyXG4gKiBTdHJpY3RlciB2YXJpYW50IG9mIHBhcnNlRmxvYXQoKS5cclxuICogQHBhcmFtIHZhbHVlXHRJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB0aGUgZmxvYXQgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGZsb2F0LCBOYU4gb3RoZXJ3aXNlXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZSkge1xyXG4gICAgaWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBOYU47XHJcbn1cclxuZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGZpbHRlckZsb2F0O1xyXG5mdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZSwgbW9kdWxvKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG1vZHVsbyA+PSAxLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuICAgIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICByZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlICUgbW9kdWxvO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucG9zaXRpdmVNb2R1bG8gPSBwb3NpdGl2ZU1vZHVsbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGMGFDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5c2FXSXZiV0YwYUM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3T3p0SFFVbEhPMEZCUlVnc1dVRkJXU3hEUVVGRE8wRkJSV0lzZFVKQlFXMUNMRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJSVGxDT3p0SFFVVkhPMEZCUTBnc1pVRkJjMElzUTBGQlV6dEpRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNM1FpeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUTJRc1EwRkJRenRKUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFpDeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUTJRc1EwRkJRenRKUVVORUxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdRVUZET1VJc1EwRkJRenRCUVZKbExHRkJRVXNzVVVGUmNFSXNRMEZCUVR0QlFVVkVPenM3UjBGSFJ6dEJRVU5JTEd0Q1FVRjVRaXhEUVVGVE8wbEJRMnBETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExZ3NUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGFFTXNRMEZCUXp0SlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGRFSXNRMEZCUXp0QlFVTkdMRU5CUVVNN1FVRk9aU3huUWtGQlVTeFhRVTEyUWl4RFFVRkJPMEZCUlVRN096czdSMEZKUnp0QlFVTklMSEZDUVVFMFFpeExRVUZoTzBsQlEzaERMRVZCUVVVc1EwRkJReXhEUVVGRExIZERRVUYzUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETVVRc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTjBRaXhEUVVGRE8wbEJRMFFzVFVGQlRTeERRVUZETEVkQlFVY3NRMEZCUXp0QlFVTmFMRU5CUVVNN1FVRk1aU3h0UWtGQlZ5eGpRVXN4UWl4RFFVRkJPMEZCUlVRc2QwSkJRU3RDTEV0QlFXRXNSVUZCUlN4TlFVRmpPMGxCUXpORUxHZENRVUZOTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1JVRkJSU3gxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMGxCUXpkRExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMllzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRPMGxCUXpkRExFTkJRVU03U1VGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTlFMRTFCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETzBsQlEzWkNMRU5CUVVNN1FVRkRSaXhEUVVGRE8wRkJVR1VzYzBKQlFXTXNhVUpCVHpkQ0xFTkJRVUVpZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIGRhdGV0aW1lIHN0cmluZyBpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGZvcm1hdFxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXHJcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBhbGxvd1RyYWlsaW5nKSB7XHJcbiAgICBpZiAoYWxsb3dUcmFpbGluZyA9PT0gdm9pZCAwKSB7IGFsbG93VHJhaWxpbmcgPSB0cnVlOyB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIG51bGwsIGFsbG93VHJhaWxpbmcpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5wYXJzZWFibGUgPSBwYXJzZWFibGU7XHJcbi8qKlxyXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFyc2VcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgb3ZlcnJpZGVab25lLCBhbGxvd1RyYWlsaW5nKSB7XHJcbiAgICBpZiAoYWxsb3dUcmFpbGluZyA9PT0gdm9pZCAwKSB7IGFsbG93VHJhaWxpbmcgPSB0cnVlOyB9XHJcbiAgICBpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gZGF0ZSBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIGlmICghZm9ybWF0U3RyaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gZm9ybWF0IGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuXzEuVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XHJcbiAgICAgICAgdmFyIHRva2VucyA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG4gICAgICAgIHZhciB0aW1lID0geyB5ZWFyOiAtMSB9O1xyXG4gICAgICAgIHZhciB6b25lID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBwbnIgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHB6ciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcmVtYWluaW5nID0gZGF0ZVRpbWVTdHJpbmc7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gdG9rZW5zW2ldO1xyXG4gICAgICAgICAgICB2YXIgdG9rZW5SZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkVSQTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuWUVBUjpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS55ZWFyID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUjpcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVk6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUuZGF5ID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9EOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5IT1VSOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4ucmF3LmNoYXJBdCgwKSA9PT0gXCJzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4ucmF3LmNoYXJBdCgwKSA9PT0gXCJTXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5zdXBwb3J0ZWQgc2Vjb25kIGZvcm1hdCAnXCIgKyB0b2tlbi5yYXcgKyBcIidcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlpPTkU6XHJcbiAgICAgICAgICAgICAgICAgICAgcHpyID0gc3RyaXBab25lKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB6b25lID0gcHpyLnpvbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuV0VFSzpcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHN0cmlwUmF3KHJlbWFpbmluZywgdG9rZW4ucmF3KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHsgdGltZTogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodGltZSksIHpvbmU6IHpvbmUgfHwgbnVsbCB9O1xyXG4gICAgICAgIGlmICghcmVzdWx0LnRpbWUudmFsaWRhdGUoKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXN1bHRpbmcgZGF0ZSBpbnZhbGlkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbHdheXMgb3ZlcndyaXRlIHpvbmUgd2l0aCBnaXZlbiB6b25lXHJcbiAgICAgICAgaWYgKG92ZXJyaWRlWm9uZSkge1xyXG4gICAgICAgICAgICByZXN1bHQuem9uZSA9IG92ZXJyaWRlWm9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlbWFpbmluZyAmJiAhYWxsb3dUcmFpbGluZykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGRhdGUgJ1wiICsgZGF0ZVRpbWVTdHJpbmcgKyBcIicgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJ1wiICsgZm9ybWF0U3RyaW5nICsgXCInOiB0cmFpbGluZyBjaGFyYWN0ZXJzOiAncmVtYWluaW5nJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBkYXRlICdcIiArIGRhdGVUaW1lU3RyaW5nICsgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIiArIGZvcm1hdFN0cmluZyArIFwiJzogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcclxuZnVuY3Rpb24gc3RyaXBOdW1iZXIocykge1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICBuOiBOYU4sXHJcbiAgICAgICAgcmVtYWluaW5nOiBzXHJcbiAgICB9O1xyXG4gICAgdmFyIG51bWJlclN0cmluZyA9IFwiXCI7XHJcbiAgICB3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApLm1hdGNoKC9cXGQvKSkge1xyXG4gICAgICAgIG51bWJlclN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICB9XHJcbiAgICAvLyByZW1vdmUgbGVhZGluZyB6ZXJvZXNcclxuICAgIHdoaWxlIChudW1iZXJTdHJpbmcuY2hhckF0KDApID09PSBcIjBcIiAmJiBudW1iZXJTdHJpbmcubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIG51bWJlclN0cmluZyA9IG51bWJlclN0cmluZy5zdWJzdHIoMSk7XHJcbiAgICB9XHJcbiAgICByZXN1bHQubiA9IHBhcnNlSW50KG51bWJlclN0cmluZywgMTApO1xyXG4gICAgaWYgKG51bWJlclN0cmluZyA9PT0gXCJcIiB8fCAhaXNGaW5pdGUocmVzdWx0Lm4pKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnXCIgKyBudW1iZXJTdHJpbmcgKyBcIidcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbnZhciBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcclxuZnVuY3Rpb24gc3RyaXBab25lKHMpIHtcclxuICAgIGlmIChzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIHpvbmUgZ2l2ZW5cIik7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIHpvbmU6IG51bGwsXHJcbiAgICAgICAgcmVtYWluaW5nOiBzXHJcbiAgICB9O1xyXG4gICAgdmFyIHpvbmVTdHJpbmcgPSBcIlwiO1xyXG4gICAgd2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiBXSElURVNQQUNFLmluZGV4T2YocmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkpID09PSAtMSkge1xyXG4gICAgICAgIHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcbiAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgcmVzdWx0LnpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoem9uZVN0cmluZyk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmZ1bmN0aW9uIHN0cmlwUmF3KHMsIGV4cGVjdGVkKSB7XHJcbiAgICB2YXIgcmVtYWluaW5nID0gcztcclxuICAgIHZhciBlcmVtYWluaW5nID0gZXhwZWN0ZWQ7XHJcbiAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XHJcbiAgICAgICAgcmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgICAgICBlcmVtYWluaW5nID0gZXJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZXJlbWFpbmluZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgJ1wiICsgZXhwZWN0ZWQgKyBcIidcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVtYWluaW5nO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHRnljMlV1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDNCaGNuTmxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPMGRCU1VjN08wRkJSVWdzZFVKQlFUaERMRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJRM3BFTEhOQ1FVRnBSU3hUUVVGVExFTkJRVU1zUTBGQlFUdEJRVVV6UlN4NVFrRkJlVUlzV1VGQldTeERRVUZETEVOQlFVRTdRVUV5UW5SRE96czdPenM3UjBGTlJ6dEJRVU5JTEcxQ1FVRXdRaXhqUVVGelFpeEZRVUZGTEZsQlFXOUNMRVZCUVVVc1lVRkJOa0k3U1VGQk4wSXNOa0pCUVRaQ0xFZEJRVGRDTEc5Q1FVRTJRanRKUVVOd1J5eEpRVUZKTEVOQlFVTTdVVUZEU2l4TFFVRkxMRU5CUVVNc1kwRkJZeXhGUVVGRkxGbEJRVmtzUlVGQlJTeEpRVUZKTEVWQlFVVXNZVUZCWVN4RFFVRkRMRU5CUVVNN1VVRkRla1FzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0SlFVTmlMRU5CUVVVN1NVRkJRU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFvc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU5rTEVOQlFVTTdRVUZEUml4RFFVRkRPMEZCVUdVc2FVSkJRVk1zV1VGUGVFSXNRMEZCUVR0QlFVVkVPenM3T3pzN1IwRk5SenRCUVVOSUxHVkJRME1zWTBGQmMwSXNSVUZCUlN4WlFVRnZRaXhGUVVGRkxGbEJRWFZDTEVWQlFVVXNZVUZCTmtJN1NVRkJOMElzTmtKQlFUWkNMRWRCUVRkQ0xHOUNRVUUyUWp0SlFVVndSeXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRja0lzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4bFFVRmxMRU5CUVVNc1EwRkJRenRKUVVOc1F5eERRVUZETzBsQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyNUNMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1EwRkJRenRKUVVOd1F5eERRVUZETzBsQlEwUXNTVUZCU1N4RFFVRkRPMUZCUTBvc1NVRkJUU3hUUVVGVExFZEJRVWNzU1VGQlNTeHBRa0ZCVXl4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRE8xRkJRemxETEVsQlFVMHNUVUZCVFN4SFFVRlpMRk5CUVZNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dFJRVU5vUkN4SlFVRk5MRWxCUVVrc1IwRkJjMElzUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVNM1F5eEpRVUZKTEVsQlFVa3NVMEZCVlN4RFFVRkRPMUZCUTI1Q0xFbEJRVWtzUjBGQlJ5eFRRVUZ0UWl4RFFVRkRPMUZCUXpOQ0xFbEJRVWtzUjBGQlJ5eFRRVUZwUWl4RFFVRkRPMUZCUTNwQ0xFbEJRVWtzVTBGQlV5eEhRVUZYTEdOQlFXTXNRMEZCUXp0UlFVTjJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJRenRaUVVONFF5eEpRVUZOTEV0QlFVc3NSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVFSXNTVUZCU1N4WFFVRlhMRk5CUVZFc1EwRkJRenRaUVVONFFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEY0VJc1MwRkJTeXg1UWtGQlV5eERRVUZETEVkQlFVYzdiMEpCUTJwQ0xGVkJRVlU3YjBKQlExWXNTMEZCU3l4RFFVRkRPMmRDUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4SlFVRkpPMjlDUVVOc1FpeEhRVUZITEVkQlFVY3NWMEZCVnl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8yOUNRVU0zUWl4VFFVRlRMRWRCUVVjc1IwRkJSeXhEUVVGRExGTkJRVk1zUTBGQlF6dHZRa0ZETVVJc1NVRkJTU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOc1FpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEU5QlFVODdiMEpCUTNKQ0xGVkJRVlU3YjBKQlExWXNTMEZCU3l4RFFVRkRPMmRDUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4TFFVRkxPMjlDUVVOdVFpeEhRVUZITEVkQlFVY3NWMEZCVnl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8yOUNRVU0zUWl4VFFVRlRMRWRCUVVjc1IwRkJSeXhEUVVGRExGTkJRVk1zUTBGQlF6dHZRa0ZETVVJc1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOdVFpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEVkQlFVYzdiMEpCUTJwQ0xFZEJRVWNzUjBGQlJ5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN2IwSkJRemRDTEZOQlFWTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1UwRkJVeXhEUVVGRE8yOUNRVU14UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTJwQ0xFdEJRVXNzUTBGQlF6dG5Ra0ZEVUN4TFFVRkxMSGxDUVVGVExFTkJRVU1zVDBGQlR6dHZRa0ZEY2tJc1ZVRkJWVHR2UWtGRFZpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEZOQlFWTTdiMEpCUTNaQ0xGVkJRVlU3YjBKQlExWXNTMEZCU3l4RFFVRkRPMmRDUVVOUUxFdEJRVXNzZVVKQlFWTXNRMEZCUXl4SlFVRkpPMjlDUVVOc1FpeEhRVUZITEVkQlFVY3NWMEZCVnl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8yOUNRVU0zUWl4VFFVRlRMRWRCUVVjc1IwRkJSeXhEUVVGRExGTkJRVk1zUTBGQlF6dHZRa0ZETVVJc1NVRkJTU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOc1FpeExRVUZMTEVOQlFVTTdaMEpCUTFBc1MwRkJTeXg1UWtGQlV5eERRVUZETEUxQlFVMDdiMEpCUTNCQ0xFZEJRVWNzUjBGQlJ5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN2IwSkJRemRDTEZOQlFWTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1UwRkJVeXhEUVVGRE8yOUNRVU14UWl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTNCQ0xFdEJRVXNzUTBGQlF6dG5Ra0ZEVUN4TFFVRkxMSGxDUVVGVExFTkJRVU1zVFVGQlRUdHZRa0ZEY0VJc1IwRkJSeXhIUVVGSExGZEJRVmNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0dlFrRkROMElzVTBGQlV5eEhRVUZITEVkQlFVY3NRMEZCUXl4VFFVRlRMRU5CUVVNN2IwSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEycERMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRja0lzUTBGQlF6dHZRa0ZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRlRU1zU1VGQlNTeERRVUZETEV0QlFVc3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU53UWl4RFFVRkRPMjlDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzNkQ1FVTlFMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zWjBOQlFUaENMRXRCUVVzc1EwRkJReXhIUVVGSExFMUJRVWNzUTBGQlF5eERRVUZETzI5Q1FVTTNSQ3hEUVVGRE8yOUNRVU5FTEV0QlFVc3NRMEZCUXp0blFrRkRVQ3hMUVVGTExIbENRVUZUTEVOQlFVTXNTVUZCU1R0dlFrRkRiRUlzUjBGQlJ5eEhRVUZITEZOQlFWTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenR2UWtGRE0wSXNVMEZCVXl4SFFVRkhMRWRCUVVjc1EwRkJReXhUUVVGVExFTkJRVU03YjBKQlF6RkNMRWxCUVVrc1IwRkJSeXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETzI5Q1FVTm9RaXhMUVVGTExFTkJRVU03WjBKQlExQXNTMEZCU3l4NVFrRkJVeXhEUVVGRExFbEJRVWs3YjBKQlEyeENMRlZCUVZVN2IwSkJRMVlzUzBGQlN5eERRVUZETzJkQ1FVTlFMRkZCUVZFN1owSkJRMUlzUzBGQlN5eDVRa0ZCVXl4RFFVRkRMRkZCUVZFN2IwSkJRM1JDTEZOQlFWTXNSMEZCUnl4UlFVRlJMRU5CUVVNc1UwRkJVeXhGUVVGRkxFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0dlFrRkRNME1zUzBGQlN5eERRVUZETzFsQlExSXNRMEZCUXp0UlFVTkdMRU5CUVVNN1VVRkJRU3hEUVVGRE8xRkJRMFlzU1VGQlRTeE5RVUZOTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVc1NVRkJTU3h0UWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFbEJRVWtzU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEYkVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU0zUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIZENRVUYzUWl4RFFVRkRMRU5CUVVNN1VVRkRNME1zUTBGQlF6dFJRVU5FTEhkRFFVRjNRenRSUVVONFF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMnhDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRWRCUVVjc1dVRkJXU3hEUVVGRE8xRkJRelZDTEVOQlFVTTdVVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhUUVVGVExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJwRExFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlEyUXNiVUpCUVdsQ0xHTkJRV01zYlVOQlFUaENMRmxCUVZrc2QwTkJRWEZETEVOQlF6bEhMRU5CUVVNN1VVRkRTQ3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTm1MRU5CUVVVN1NVRkJRU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFvc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHRRa0ZCYVVJc1kwRkJZeXh0UTBGQk9FSXNXVUZCV1N4WFFVRk5MRU5CUVVNc1EwRkJReXhQUVVGVExFTkJRVU1zUTBGQlF6dEpRVU0zUnl4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVhCSFpTeGhRVUZMTEZGQmIwZHdRaXhEUVVGQk8wRkJSMFFzY1VKQlFYRkNMRU5CUVZNN1NVRkROMElzU1VGQlRTeE5RVUZOTEVkQlFYTkNPMUZCUTJwRExFTkJRVU1zUlVGQlJTeEhRVUZITzFGQlEwNHNVMEZCVXl4RlFVRkZMRU5CUVVNN1MwRkRXaXhEUVVGRE8wbEJRMFlzU1VGQlNTeFpRVUZaTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNSQ0xFOUJRVThzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUXpsRkxGbEJRVmtzU1VGQlNTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU16UXl4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJReTlETEVOQlFVTTdTVUZEUkN4M1FrRkJkMEk3U1VGRGVFSXNUMEZCVHl4WlFVRlpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4WlFVRlpMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETzFGQlEyeEZMRmxCUVZrc1IwRkJSeXhaUVVGWkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNaRExFTkJRVU03U1VGRFJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4SFFVRkhMRkZCUVZFc1EwRkJReXhaUVVGWkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEZEVNc1JVRkJSU3hEUVVGRExFTkJRVU1zV1VGQldTeExRVUZMTEVWQlFVVXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNaME5CUVRoQ0xGbEJRVmtzVFVGQlJ5eERRVUZETEVOQlFVTTdTVUZEYUVVc1EwRkJRenRKUVVORUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdRVUZEWml4RFFVRkRPMEZCUlVRc1NVRkJUU3hWUVVGVkxFZEJRVWNzUTBGQlF5eEhRVUZITEVWQlFVVXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZGYWtRc2JVSkJRVzFDTEVOQlFWTTdTVUZETTBJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0JDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1pVRkJaU3hEUVVGRExFTkJRVU03U1VGRGJFTXNRMEZCUXp0SlFVTkVMRWxCUVUwc1RVRkJUU3hIUVVGdlFqdFJRVU12UWl4SlFVRkpMRVZCUVVVc1NVRkJTVHRSUVVOV0xGTkJRVk1zUlVGQlJTeERRVUZETzB0QlExb3NRMEZCUXp0SlFVTkdMRWxCUVVrc1ZVRkJWU3hIUVVGSExFVkJRVVVzUTBGQlF6dEpRVU53UWl4UFFVRlBMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNTVUZCU1N4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTTNSaXhWUVVGVkxFbEJRVWtzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGVrTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVNdlF5eERRVUZETzBsQlEwUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXh0UWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVONFF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRPMEZCUTJZc1EwRkJRenRCUVVWRUxHdENRVUZyUWl4RFFVRlRMRVZCUVVVc1VVRkJaMEk3U1VGRE5VTXNTVUZCU1N4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRMnhDTEVsQlFVa3NWVUZCVlN4SFFVRkhMRkZCUVZFc1EwRkJRenRKUVVNeFFpeFBRVUZQTEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SlFVRkpMRk5CUVZNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETzFGQlEzUkhMRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTJoRExGVkJRVlVzUjBGQlJ5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRMjVETEVOQlFVTTdTVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNMElzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4bFFVRmhMRkZCUVZFc1RVRkJSeXhEUVVGRExFTkJRVU03U1VGRE0wTXNRMEZCUXp0SlFVTkVMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU03UVVGRGJFSXNRMEZCUXlKOSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbnZhciBkYXRldGltZV8xID0gcmVxdWlyZShcIi4vZGF0ZXRpbWVcIik7XHJcbnZhciB0aW1lem9uZV8xID0gcmVxdWlyZShcIi4vdGltZXpvbmVcIik7XHJcbi8qKlxyXG4gKiBTcGVjaWZpZXMgaG93IHRoZSBwZXJpb2Qgc2hvdWxkIHJlcGVhdCBhY3Jvc3MgdGhlIGRheVxyXG4gKiBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFBlcmlvZERzdCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBLZWVwIHJlcGVhdGluZyBpbiBzaW1pbGFyIGludGVydmFscyBtZWFzdXJlZCBpbiBVVEMsXHJcbiAgICAgKiB1bmFmZmVjdGVkIGJ5IERheWxpZ2h0IFNhdmluZyBUaW1lLlxyXG4gICAgICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcclxuICAgICAqIGV2ZXJ5IHRpbWUsIGV2ZW4gaW4gYSB0aW1lIHpvbmUgd2l0aCBEU1QuXHJcbiAgICAgKiBMZWFwIHNlY29uZHMsIGxlYXAgZGF5cyBhbmQgbW9udGggbGVuZ3RoXHJcbiAgICAgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZERzdFtQZXJpb2REc3RbXCJSZWd1bGFySW50ZXJ2YWxzXCJdID0gMF0gPSBcIlJlZ3VsYXJJbnRlcnZhbHNcIjtcclxuICAgIC8qKlxyXG4gICAgICogRW5zdXJlIHRoYXQgdGhlIHRpbWUgYXQgd2hpY2ggdGhlIGludGVydmFscyBvY2N1ciBzdGF5XHJcbiAgICAgKiBhdCB0aGUgc2FtZSBwbGFjZSBpbiB0aGUgZGF5LCBsb2NhbCB0aW1lLiBTbyBlLmcuXHJcbiAgICAgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxyXG4gICAgICogd2lsbCBhbHdheXMgcmVmZXJlbmNlIGF0IDg6MDUgRXVyb3BlL0Ftc3RlcmRhbS4gVGhpcyBtZWFucyB0aGF0XHJcbiAgICAgKiBpbiBVVEMgdGltZSwgc29tZSBpbnRlcnZhbHMgd2lsbCBiZSAyNSBob3VycyBhbmQgc29tZVxyXG4gICAgICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG4gICAgICogQW5vdGhlciBleGFtcGxlOiBhbiBob3VybHkgaW50ZXJ2YWwgd2lsbCBiZSBob3VybHkgaW4gbG9jYWwgdGltZSxcclxuICAgICAqIHNraXBwaW5nIGFuIGhvdXIgaW4gVVRDIGZvciBhIERTVCBiYWNrd2FyZCBjaGFuZ2UuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZERzdFtQZXJpb2REc3RbXCJSZWd1bGFyTG9jYWxUaW1lXCJdID0gMV0gPSBcIlJlZ3VsYXJMb2NhbFRpbWVcIjtcclxuICAgIC8qKlxyXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZERzdFtQZXJpb2REc3RbXCJNQVhcIl0gPSAyXSA9IFwiTUFYXCI7XHJcbn0pKGV4cG9ydHMuUGVyaW9kRHN0IHx8IChleHBvcnRzLlBlcmlvZERzdCA9IHt9KSk7XHJcbnZhciBQZXJpb2REc3QgPSBleHBvcnRzLlBlcmlvZERzdDtcclxuLyoqXHJcbiAqIENvbnZlcnQgYSBQZXJpb2REc3QgdG8gYSBzdHJpbmc6IFwicmVndWxhciBpbnRlcnZhbHNcIiBvciBcInJlZ3VsYXIgbG9jYWwgdGltZVwiXHJcbiAqL1xyXG5mdW5jdGlvbiBwZXJpb2REc3RUb1N0cmluZyhwKSB7XHJcbiAgICBzd2l0Y2ggKHApIHtcclxuICAgICAgICBjYXNlIFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzOiByZXR1cm4gXCJyZWd1bGFyIGludGVydmFsc1wiO1xyXG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU6IHJldHVybiBcInJlZ3VsYXIgbG9jYWwgdGltZVwiO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGVyaW9kRHN0VG9TdHJpbmcgPSBwZXJpb2REc3RUb1N0cmluZztcclxuLyoqXHJcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcclxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXHJcbiAqL1xyXG52YXIgUGVyaW9kID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24uIFNlZSBvdGhlciBjb25zdHJ1Y3RvcnMgZm9yIGV4cGxhbmF0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBQZXJpb2QocmVmZXJlbmNlLCBhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QsIGdpdmVuRHN0KSB7XHJcbiAgICAgICAgdmFyIGludGVydmFsO1xyXG4gICAgICAgIHZhciBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuICAgICAgICBpZiAodHlwZW9mIChhbW91bnRPckludGVydmFsKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGRzdCA9IHVuaXRPckRzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIHVuaXRPckRzdCA9PT0gXCJudW1iZXJcIiAmJiB1bml0T3JEc3QgPj0gMCAmJiB1bml0T3JEc3QgPCBiYXNpY3NfMS5UaW1lVW5pdC5NQVgsIFwiSW52YWxpZCB1bml0XCIpO1xyXG4gICAgICAgICAgICBpbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGFtb3VudE9ySW50ZXJ2YWwsIHVuaXRPckRzdCk7XHJcbiAgICAgICAgICAgIGRzdCA9IGdpdmVuRHN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGRzdCAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChkc3QgPj0gMCAmJiBkc3QgPCBQZXJpb2REc3QuTUFYLCBcIkludmFsaWQgUGVyaW9kRHN0IHNldHRpbmdcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXJlZmVyZW5jZSwgXCJSZWZlcmVuY2UgdGltZSBub3QgZ2l2ZW5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTWF0aC5mbG9vcihpbnRlcnZhbC5hbW91bnQoKSkgPT09IGludGVydmFsLmFtb3VudCgpLCBcIkFtb3VudCBtdXN0IGJlIGEgd2hvbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IHJlZmVyZW5jZTtcclxuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICB0aGlzLl9jYWxjSW50ZXJuYWxWYWx1ZXMoKTtcclxuICAgICAgICAvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcclxuICAgICAgICAvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXHJcbiAgICAgICAgLy8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cclxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMDAwMCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDE0NDAsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAyNCwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUGVyaW9kKHRoaXMuX3JlZmVyZW5jZSwgdGhpcy5faW50ZXJ2YWwsIHRoaXMuX2RzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5yZWZlcmVuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQ6IG9sZCBuYW1lIGZvciB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaW50ZXJ2YWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYW1vdW50IG9mIHVuaXRzIG9mIHRoZSBpbnRlcnZhbFxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS51bml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC51bml0KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZHN0IGhhbmRsaW5nIG1vZGVcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5kc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RzdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgZ3JlYXRlciB0aGFuXHJcbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXHJcbiAgICAgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuICAgICAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYWZ0ZXIgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuICAgICAqIEByZXR1cm4gdGhlIGZpcnN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBhZnRlciBmcm9tRGF0ZSwgZ2l2ZW5cclxuICAgICAqXHRcdFx0aW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZEZpcnN0ID0gZnVuY3Rpb24gKGZyb21EYXRlKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgdmFyIGFwcHJveDtcclxuICAgICAgICB2YXIgYXBwcm94MjtcclxuICAgICAgICB2YXIgYXBwcm94TWluO1xyXG4gICAgICAgIHZhciBwZXJpb2RzO1xyXG4gICAgICAgIHZhciBkaWZmO1xyXG4gICAgICAgIHZhciBuZXdZZWFyO1xyXG4gICAgICAgIHZhciBuZXdNb250aDtcclxuICAgICAgICB2YXIgcmVtYWluZGVyO1xyXG4gICAgICAgIHZhciBpbWF4O1xyXG4gICAgICAgIHZhciBpbWluO1xyXG4gICAgICAgIHZhciBpbWlkO1xyXG4gICAgICAgIHZhciBub3JtYWxGcm9tID0gdGhpcy5fbm9ybWFsaXplRGF5KGZyb21EYXRlLnRvWm9uZSh0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vIHNpbXBsZSBjYXNlczogYW1vdW50IGVxdWFscyAxIChlbGltaW5hdGVzIG5lZWQgZm9yIHNlYXJjaGluZyBmb3IgcmVmZXJlbmNlaW5nIHBvaW50KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdG8gVVRDIHRpbWVcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksIG5vcm1hbEZyb20udXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4oZnJvbURhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgaW50ZXJ2YWxzXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCBub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBBbW91bnQgaXMgbm90IDEsXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IDI1IGxlYXAgc2Vjb25kcyBoYXZlIGV2ZXIgYmVlbiBhZGRlZCBzbyB0aGlzIHNob3VsZCBzdGlsbCBiZSBPSy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChub3JtYWxGcm9tLnV0Y01vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4oZnJvbURhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgdGltZXMuIElmIHRoZSB1bml0IGlzIGxlc3MgdGhhbiBhIGRheSwgd2UgcmVmZXJlbmNlIGVhY2ggZGF5IGFuZXdcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTAwMCAmJiAoMTAwMCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW51cyBvbmUgc2Vjb25kIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaWxsaXNlY29uZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0b1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvZG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbWF4ID49IGltaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gaW1pZCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBzZWNvbmQgZWFjaCBtaW51dGUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IE1hdGguZmxvb3IoKDg2NDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3gyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IGltaWQgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IGltaWQgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgaG91ciB0aGlzLl9pbnRSZWZlcmVuY2VhcnkgZWFjaCB0aW1lLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlIG1pbnVzIG9uZSBob3VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWludXRlcywgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBmaXQgaW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHByZXZpb3VzIGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCgyNCAqIDYwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigyNCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpKSAqIDEyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChub3JtYWxGcm9tLm1vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIC0xIGJlbG93IGlzIGJlY2F1c2UgdGhlIGRheS1vZi1tb250aCBvZiByZWZlcmVuY2UgZGF0ZSBtYXkgYmUgYWZ0ZXIgdGhlIGRheSBvZiB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1llYXIgPSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpICsgcGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShuZXdZZWFyLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBuZXh0IHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3RcclxuICAgICAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGhhcyBNVUNIIGJldHRlciBwZXJmb3JtYW5jZSB0aGFuIGZpbmRGaXJzdC5cclxuICAgICAqIFJldHVybnMgdGhlIGRhdGV0aW1lIFwiY291bnRcIiB0aW1lcyBhd2F5IGZyb20gdGhlIGdpdmVuIGRhdGV0aW1lLlxyXG4gICAgICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cclxuICAgICAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gYWRkLiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG4gICAgICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kTmV4dCA9IGZ1bmN0aW9uIChwcmV2LCBjb3VudCkge1xyXG4gICAgICAgIGlmIChjb3VudCA9PT0gdm9pZCAwKSB7IGNvdW50ID0gMTsgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISFwcmV2LCBcIlByZXYgbXVzdCBiZSBnaXZlblwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSwgXCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGNvdW50KSA9PT0gXCJudW1iZXJcIiwgXCJDb3VudCBtdXN0IGJlIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTWF0aC5mbG9vcihjb3VudCkgPT09IGNvdW50LCBcIkNvdW50IG11c3QgYmUgYW4gaW50ZWdlclwiKTtcclxuICAgICAgICB2YXIgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpKS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cclxuICAgICAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG4gICAgICogQHJldHVybiB0aGUgbGFzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYmVmb3JlIGZyb21EYXRlLCBnaXZlblxyXG4gICAgICpcdFx0XHRpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kTGFzdCA9IGZ1bmN0aW9uIChmcm9tKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZmluZFByZXYodGhpcy5maW5kRmlyc3QoZnJvbSkpO1xyXG4gICAgICAgIGlmIChyZXN1bHQuZXF1YWxzKGZyb20pKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHByZXZpb3VzIHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3RcclxuICAgICAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXHJcbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBzdWJ0cmFjdC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cclxuICAgICAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZFByZXYgPSBmdW5jdGlvbiAobmV4dCwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICByZXR1cm4gdGhpcy5maW5kTmV4dChuZXh0LCAtMSAqIGNvdW50KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XHJcbiAgICAgKiAoZXhwZW5zaXZlISlcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pc0JvdW5kYXJ5ID0gZnVuY3Rpb24gKG9jY3VycmVuY2UpIHtcclxuICAgICAgICBpZiAoIW9jY3VycmVuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFvY2N1cnJlbmNlLnpvbmUoKSwgXCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICByZXR1cm4gKHRoaXMuZmluZEZpcnN0KG9jY3VycmVuY2Uuc3ViKGR1cmF0aW9uXzEuRHVyYXRpb24ubWlsbGlzZWNvbmRzKDEpKSkuZXF1YWxzKG9jY3VycmVuY2UpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBwZXJpb2QgaGFzIHRoZSBzYW1lIGVmZmVjdCBhcyB0aGUgZ2l2ZW4gb25lLlxyXG4gICAgICogaS5lLiBhIHBlcmlvZCBvZiAyNCBob3VycyBpcyBlcXVhbCB0byBvbmUgb2YgMSBkYXkgaWYgdGhleSBoYXZlIHRoZSBzYW1lIFVUQyByZWZlcmVuY2UgbW9tZW50XHJcbiAgICAgKiBhbmQgc2FtZSBkc3QuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgLy8gbm90ZSB3ZSB0YWtlIHRoZSBub24tbm9ybWFsaXplZCByZWZlcmVuY2UoKSBiZWNhdXNlIHRoaXMgaGFzIGFuIGluZmx1ZW5jZSBvbiB0aGUgb3V0Y29tZVxyXG4gICAgICAgIHJldHVybiAodGhpcy5pc0JvdW5kYXJ5KG90aGVyLnJlZmVyZW5jZSgpKVxyXG4gICAgICAgICAgICAmJiB0aGlzLl9pbnRJbnRlcnZhbC5lcXVhbHNFeGFjdChvdGhlci5pbnRlcnZhbCgpKVxyXG4gICAgICAgICAgICAmJiB0aGlzLl9pbnREc3QgPT09IG90aGVyLl9pbnREc3QpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9yZWZlcmVuY2UuaWRlbnRpY2FsKG90aGVyLnJlZmVyZW5jZSgpKVxyXG4gICAgICAgICAgICAmJiB0aGlzLl9pbnRlcnZhbC5pZGVudGljYWwob3RoZXIuaW50ZXJ2YWwoKSlcclxuICAgICAgICAgICAgJiYgdGhpcy5kc3QoKSA9PT0gb3RoZXIuZHN0KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBJU08gZHVyYXRpb24gc3RyaW5nIGUuZy5cclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxyXG4gICAgICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUFQxTSAgIChvbmUgbWludXRlKVxyXG4gICAgICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFNICAgKG9uZSBtb250aClcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXHJcbiAgICAgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2ludGVydmFsLnRvU3RyaW5nKCkgKyBcIiwgcmVmZXJlbmNlaW5nIGF0IFwiICsgdGhpcy5fcmVmZXJlbmNlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgLy8gb25seSBhZGQgdGhlIERTVCBoYW5kbGluZyBpZiBpdCBpcyByZWxldmFudFxyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiwga2VlcGluZyBcIiArIHBlcmlvZERzdFRvU3RyaW5nKHRoaXMuX2RzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbUGVyaW9kOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9jb3JyZWN0RGF5ID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIE1hdGgubWluKGJhc2ljcy5kYXlzSW5Nb250aChkLnllYXIoKSwgZC5tb250aCgpKSwgdGhpcy5fcmVmZXJlbmNlLmRheSgpKSwgZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhpcy5faW50ZXJuYWxVbml0IGluIFtNb250aCwgWWVhcl0sIG5vcm1hbGl6ZXMgdGhlIGRheS1vZi1tb250aFxyXG4gICAgICogdG8gPD0gMjguXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IGRhdGUgaWYgZGlmZmVyZW50LCBvdGhlcndpc2UgdGhlIGV4YWN0IHNhbWUgb2JqZWN0IChubyBjbG9uZSEpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX25vcm1hbGl6ZURheSA9IGZ1bmN0aW9uIChkLCBhbnltb250aCkge1xyXG4gICAgICAgIGlmIChhbnltb250aCA9PT0gdm9pZCAwKSB7IGFueW1vbnRoID0gdHJ1ZTsgfVxyXG4gICAgICAgIGlmICgodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBkLmRheSgpID4gMjgpXHJcbiAgICAgICAgICAgIHx8ICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgJiYgKGQubW9udGgoKSA9PT0gMiB8fCBhbnltb250aCkgJiYgZC5kYXkoKSA+IDI4KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgMjgsIGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkOyAvLyBzYXZlIG9uIHRpbWUgYnkgbm90IHJldHVybmluZyBhIGNsb25lXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIERTVCBoYW5kbGluZyBpcyByZWxldmFudCBmb3IgdXMuXHJcbiAgICAgKiAoaS5lLiBpZiB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBoYXMgRFNUKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9kc3RSZWxldmFudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKCEhdGhpcy5fcmVmZXJlbmNlLnpvbmUoKVxyXG4gICAgICAgICAgICAmJiB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpLmtpbmQoKSA9PT0gdGltZXpvbmVfMS5UaW1lWm9uZUtpbmQuUHJvcGVyXHJcbiAgICAgICAgICAgICYmIHRoaXMuX3JlZmVyZW5jZS56b25lKCkuaGFzRHN0KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIHRoZSB2YWx1ZXMgd2hlcmUgcG9zc2libGUgLSBub3QgYWxsIHZhbHVlc1xyXG4gICAgICogYXJlIGNvbnZlcnRpYmxlIGludG8gb25lIGFub3RoZXIuIFdlZWtzIGFyZSBjb252ZXJ0ZWQgdG8gZGF5cy5cclxuICAgICAqIEUuZy4gbW9yZSB0aGFuIDYwIG1pbnV0ZXMgaXMgdHJhbnNmZXJyZWQgdG8gaG91cnMsXHJcbiAgICAgKiBidXQgc2Vjb25kcyBjYW5ub3QgYmUgdHJhbnNmZXJyZWQgdG8gbWludXRlcyBkdWUgdG8gbGVhcCBzZWNvbmRzLlxyXG4gICAgICogV2Vla3MgYXJlIGNvbnZlcnRlZCBiYWNrIHRvIGRheXMuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NhbGNJbnRlcm5hbFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXHJcbiAgICAgICAgdmFyIGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG4gICAgICAgIHZhciBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCAmJiBpbnRBbW91bnQgPj0gMTAwMCAmJiBpbnRBbW91bnQgJSAxMDAwID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDI0O1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IHRoaXMuX2RzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxyXG4gICAgICAgIHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGVyaW9kO1xyXG59KCkpO1xyXG5leHBvcnRzLlBlcmlvZCA9IFBlcmlvZDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dWeWFXOWtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyeHBZaTl3WlhKcGIyUXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdSMEZKUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVWaUxIVkNRVUZ0UWl4VlFVRlZMRU5CUVVNc1EwRkJRVHRCUVVNNVFpeDFRa0ZCZVVJc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRGNFTXNTVUZCV1N4TlFVRk5MRmRCUVUwc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRGJrTXNlVUpCUVhsQ0xGbEJRVmtzUTBGQlF5eERRVUZCTzBGQlEzUkRMSGxDUVVGNVFpeFpRVUZaTEVOQlFVTXNRMEZCUVR0QlFVTjBReXg1UWtGQmRVTXNXVUZCV1N4RFFVRkRMRU5CUVVFN1FVRkZjRVE3T3p0SFFVZEhPMEZCUTBnc1YwRkJXU3hUUVVGVE8wbEJRM0JDT3pzN096czdPMDlCVDBjN1NVRkRTQ3hwUlVGQlowSXNRMEZCUVR0SlFVVm9RanM3T3pzN096czdPMDlCVTBjN1NVRkRTQ3hwUlVGQlowSXNRMEZCUVR0SlFVVm9RanM3VDBGRlJ6dEpRVU5JTEhWRFFVRkhMRU5CUVVFN1FVRkRTaXhEUVVGRExFVkJNMEpYTEdsQ1FVRlRMRXRCUVZRc2FVSkJRVk1zVVVFeVFuQkNPMEZCTTBKRUxFbEJRVmtzVTBGQlV5eEhRVUZVTEdsQ1FUSkNXQ3hEUVVGQk8wRkJSVVE3TzBkQlJVYzdRVUZEU0N3eVFrRkJhME1zUTBGQldUdEpRVU0zUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExZ3NTMEZCU3l4VFFVRlRMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNUVUZCVFN4RFFVRkRMRzFDUVVGdFFpeERRVUZETzFGQlF6VkVMRXRCUVVzc1UwRkJVeXhEUVVGRExHZENRVUZuUWl4RlFVRkZMRTFCUVUwc1EwRkJReXh2UWtGQmIwSXNRMEZCUXp0UlFVTTNSQ3d3UWtGQk1FSTdVVUZETVVJN1dVRkRReXgzUWtGQmQwSTdXVUZEZUVJc01FSkJRVEJDTzFsQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhEUVVGRE8xbEJRM1JETEVOQlFVTTdTVUZEU0N4RFFVRkRPMEZCUTBZc1EwRkJRenRCUVZwbExIbENRVUZwUWl4dlFrRlphRU1zUTBGQlFUdEJRVVZFT3pzN1IwRkhSenRCUVVOSU8wbEJNRVZET3p0UFFVVkhPMGxCUTBnc1owSkJRME1zVTBGQmJVSXNSVUZEYmtJc1owSkJRWEZDTEVWQlEzSkNMRk5CUVdVc1JVRkRaaXhSUVVGdlFqdFJRVWR3UWl4SlFVRkpMRkZCUVd0Q0xFTkJRVU03VVVGRGRrSXNTVUZCU1N4SFFVRkhMRWRCUVdNc1UwRkJVeXhEUVVGRExHZENRVUZuUWl4RFFVRkRPMUZCUTJoRUxFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4blFrRkJaMElzUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROVU1zVVVGQlVTeEhRVUZoTEdkQ1FVRm5RaXhEUVVGRE8xbEJRM1JETEVkQlFVY3NSMEZCWXl4VFFVRlRMRU5CUVVNN1VVRkROVUlzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc1owSkJRVTBzUTBGQlF5eFBRVUZQTEZOQlFWTXNTMEZCU3l4UlFVRlJMRWxCUVVrc1UwRkJVeXhKUVVGSkxFTkJRVU1zU1VGQlNTeFRRVUZUTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzWTBGQll5eERRVUZETEVOQlFVTTdXVUZEY0Vjc1VVRkJVU3hIUVVGSExFbEJRVWtzYlVKQlFWRXNRMEZCVXl4blFrRkJaMElzUlVGQldTeFRRVUZUTEVOQlFVTXNRMEZCUXp0WlFVTjJSU3hIUVVGSExFZEJRVWNzVVVGQlVTeERRVUZETzFGQlEyaENMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemRDTEVkQlFVY3NSMEZCUnl4VFFVRlRMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZEYkVNc1EwRkJRenRSUVVORUxHZENRVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFZEJRVWNzVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN3eVFrRkJNa0lzUTBGQlF5eERRVUZETzFGQlEzSkZMR2RDUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNSVUZCUlN3d1FrRkJNRUlzUTBGQlF5eERRVUZETzFGQlEyaEVMR2RDUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1JVRkJSU3h0UTBGQmJVTXNRMEZCUXl4RFFVRkRPMUZCUTI1RkxHZENRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNTMEZCU3l4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzSzBKQlFTdENMRU5CUVVNc1EwRkJRenRSUVVVM1JpeEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkhMRk5CUVZNc1EwRkJRenRSUVVNMVFpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRkZCUVZFc1EwRkJRenRSUVVNeFFpeEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWRCUVVjc1EwRkJRenRSUVVOb1FpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVVzUTBGQlF6dFJRVVV6UWl4M1JVRkJkMFU3VVVGRGVFVXNhMFpCUVd0R08xRkJRMnhHTEhORFFVRnpRenRSUVVOMFF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hGUVVGRkxFbEJRVWtzUjBGQlJ5eExRVUZMTEZOQlFWTXNRMEZCUXl4blFrRkJaMElzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETDBRc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEyeERMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eFhRVUZYTzI5Q1FVTjRRaXhuUWtGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzVVVGQlVTeEZRVU16UXl3MFJVRkJORVU3ZDBKQlF6VkZMR2RHUVVGblJpeERRVUZETEVOQlFVTTdiMEpCUTI1R0xFdEJRVXNzUTBGQlF6dG5Ra0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zVFVGQlRUdHZRa0ZEYmtJc1owSkJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFdEJRVXNzUlVGRGVFTXNORVZCUVRSRk8zZENRVU0xUlN4blJrRkJaMFlzUTBGQlF5eERRVUZETzI5Q1FVTnVSaXhMUVVGTExFTkJRVU03WjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFMUJRVTA3YjBKQlEyNUNMR2RDUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhKUVVGSkxFVkJRM1pETERSRlFVRTBSVHQzUWtGRE5VVXNaMFpCUVdkR0xFTkJRVU1zUTBGQlF6dHZRa0ZEYmtZc1MwRkJTeXhEUVVGRE8yZENRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhKUVVGSk8yOUNRVU5xUWl4blFrRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1JVRkJSU3hGUVVOeVF5dzBSVUZCTkVVN2QwSkJRelZGTEdkR1FVRm5SaXhEUVVGRExFTkJRVU03YjBKQlEyNUdMRXRCUVVzc1EwRkJRenRaUVVOU0xFTkJRVU03VVVGRFJpeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzYzBKQlFVc3NSMEZCV2p0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMGxCUXk5RUxFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREJDUVVGVExFZEJRV2hDTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03U1VGRGVFSXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzYzBKQlFVc3NSMEZCV2p0UlFVTkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETzBsQlEzaENMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhsQ1FVRlJMRWRCUVdZN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRKUVVNdlFpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3gxUWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdTVUZEYUVNc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NjVUpCUVVrc1IwRkJXRHRSUVVORExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8wbEJRemxDTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxHOUNRVUZITEVkQlFWWTdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF6dEpRVU5zUWl4RFFVRkRPMGxCUlVRN096czdPenM3VDBGUFJ6dEpRVU5KTERCQ1FVRlRMRWRCUVdoQ0xGVkJRV2xDTEZGQlFXdENPMUZCUTJ4RExHZENRVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGRGRrUXNLMFJCUVN0RUxFTkJRVU1zUTBGQlF6dFJRVU5zUlN4SlFVRkpMRTFCUVdkQ0xFTkJRVU03VVVGRGNrSXNTVUZCU1N4UFFVRnBRaXhEUVVGRE8xRkJRM1JDTEVsQlFVa3NVMEZCYlVJc1EwRkJRenRSUVVONFFpeEpRVUZKTEU5QlFXVXNRMEZCUXp0UlFVTndRaXhKUVVGSkxFbEJRVmtzUTBGQlF6dFJRVU5xUWl4SlFVRkpMRTlCUVdVc1EwRkJRenRSUVVOd1FpeEpRVUZKTEZGQlFXZENMRU5CUVVNN1VVRkRja0lzU1VGQlNTeFRRVUZwUWl4RFFVRkRPMUZCUTNSQ0xFbEJRVWtzU1VGQldTeERRVUZETzFGQlEycENMRWxCUVVrc1NVRkJXU3hEUVVGRE8xRkJRMnBDTEVsQlFVa3NTVUZCV1N4RFFVRkRPMUZCUldwQ0xFbEJRVTBzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVZzUml4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRFTXNkVVpCUVhWR08xbEJRM1pHTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFdEJRVXNzVTBGQlV5eERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtRc2IwSkJRVzlDTzJkQ1FVTndRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEYkVNc1MwRkJTeXhwUWtGQlVTeERRVUZETEZkQlFWYzdkMEpCUTNoQ0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVTm9SU3hWUVVGVkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRk5CUVZNc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZEY0VVc1ZVRkJWU3hEUVVGRExHTkJRV01zUlVGQlJTeEZRVUZGTEcxQ1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRek5ETEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhOUVVGTk8zZENRVU51UWl4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGRGFFVXNWVUZCVlN4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1UwRkJVeXhGUVVGRkxFVkJRM0JGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFVkJRVVVzYlVKQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkRia1FzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRTFCUVUwN2QwSkJRMjVDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOb1JTeFZRVUZWTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExGTkJRVk1zUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1UwRkJVeXhGUVVGRkxFVkJRelZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFVkJRVVVzYlVKQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkRia1FzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrN2QwSkJRMnBDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOb1JTeFZRVUZWTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUlVGQlJTeEZRVU53Uml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExHTkJRV01zUlVGQlJTeEZRVUZGTEcxQ1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRMjVFTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhIUVVGSE8zZENRVU5vUWl4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGRGFFVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRk5CUVZNc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNVMEZCVXl4RlFVRkZMRVZCUXpWR0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4RlFVRkZMRVZCUVVVc2JVSkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZEYmtRc1EwRkJRenQzUWtGRFJpeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEV0QlFVczdkMEpCUTJ4Q0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkRlRVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVTBGQlV5eEZRVUZGTEVWQlF6VkdMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zWTBGQll5eEZRVUZGTEVWQlFVVXNiVUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGRGJrUXNRMEZCUXp0M1FrRkRSaXhMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWs3ZDBKQlEycENMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUTJoR0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUlVGQlJTeEZRVU0xUml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExHTkJRV01zUlVGQlJTeEZRVUZGTEcxQ1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRMjVFTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTERCQ1FVRXdRanR2UWtGRE1VSTdkMEpCUTBNc2QwSkJRWGRDTzNkQ1FVTjRRaXd3UWtGQk1FSTdkMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzNkQ1FVTnlReXhEUVVGRE8yZENRVU5JTEVOQlFVTTdaMEpCUTBRc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJRenR2UWtGRGRFTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN1owSkJRek5GTEVOQlFVTTdXVUZEUml4RFFVRkRPMWxCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlExQXNjME5CUVhORE8yZENRVU4wUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGJFTXNTMEZCU3l4cFFrRkJVU3hEUVVGRExGZEJRVmM3ZDBKQlEzaENMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeEZRVU4yUkN4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGRE0wUXNWVUZCVlN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUTI1RUxFTkJRVU03ZDBKQlEwWXNTMEZCU3l4RFFVRkRPMjlDUVVOUUxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4TlFVRk5PM2RDUVVOdVFpeE5RVUZOTEVkQlFVY3NTVUZCU1N4dFFrRkJVU3hEUVVOd1FpeFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkRka1FzVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUXpORUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZETTBRc1EwRkJRenQzUWtGRFJpeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEUxQlFVMDdkMEpCUTI1Q0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RlFVTjJSQ3hWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUTI1RkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZETTBRc1EwRkJRenQzUWtGRFJpeExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVazdkMEpCUTJwQ0xFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEVkQlFVY3NSVUZCUlN4RlFVTjJSQ3hWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVNelJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUXpORUxFTkJRVU03ZDBKQlEwWXNTMEZCU3l4RFFVRkRPMjlDUVVOUUxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SFFVRkhPM2RDUVVOb1FpeE5RVUZOTEVkQlFVY3NTVUZCU1N4dFFrRkJVU3hEUVVOd1FpeFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkRka1FzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlEyNUdMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGRE0wUXNRMEZCUXp0M1FrRkRSaXhMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFdEJRVXM3ZDBKQlEyeENMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZETDBRc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRMjVHTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkRNMFFzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRU5CUVVNN2IwSkJRMUFzUzBGQlN5eHBRa0ZCVVN4RFFVRkRMRWxCUVVrN2QwSkJRMnBDTEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlEzWkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOdVJpeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUXpORUxFTkJRVU03ZDBKQlEwWXNTMEZCU3l4RFFVRkRPMjlDUVVOUUxEQkNRVUV3UWp0dlFrRkRNVUk3ZDBKQlEwTXNkMEpCUVhkQ08zZENRVU40UWl3d1FrRkJNRUk3ZDBKQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdORUpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8zZENRVU55UXl4RFFVRkRPMmRDUVVOSUxFTkJRVU03WjBKQlEwUXNUMEZCVHl4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXp0dlFrRkRlRU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdaMEpCUTJoR0xFTkJRVU03V1VGRFJpeERRVUZETzFGQlEwWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzYlVKQlFXMUNPMWxCUTI1Q0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRXRCUVVzc1UwRkJVeXhEUVVGRExHZENRVUZuUWl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGFrUXNiMEpCUVc5Q08yZENRVU53UWl4TlFVRk5MRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGJFTXNTMEZCU3l4cFFrRkJVU3hEUVVGRExGZEJRVmM3ZDBKQlEzaENMRWxCUVVrc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhaUVVGWkxFVkJRVVVzUTBGQlF6dDNRa0ZETVVRc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXp0M1FrRkRlRVFzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJRenQzUWtGRGFFY3NTMEZCU3l4RFFVRkRPMjlDUVVOUUxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4TlFVRk5PM2RDUVVOdVFpeEpRVUZKTEVkQlFVY3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNN2QwSkJRM0pFTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTJoSExFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zVFVGQlRUdDNRa0ZEYmtJc2QwVkJRWGRGTzNkQ1FVTjRSU3hKUVVGSkxFZEJRVWNzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTTdkMEpCUTNKRUxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM2hFTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEyaEhMRXRCUVVzc1EwRkJRenR2UWtGRFVDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1NVRkJTVHQzUWtGRGFrSXNTVUZCU1N4SFFVRkhMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8zZENRVU51UkN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzNkQ1FVTjRSQ3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVOb1J5eExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEVkQlFVYzdkMEpCUTJoQ0xFbEJRVWtzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUVVNN2QwSkJRM2hFTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzaEVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTJoSExFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMR2xDUVVGUkxFTkJRVU1zUzBGQlN6dDNRa0ZEYkVJc1NVRkJTU3hIUVVGSExFTkJRVU1zVlVGQlZTeERRVUZETEU5QlFVOHNSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RlFVRkZPelJDUVVOb1JTeERRVUZETEZWQlFWVXNRMEZCUXl4UlFVRlJMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8zZENRVU0zUkN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzNkQ1FVTjRSQ3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2RDUVVOb1J5eExRVUZMTEVOQlFVTTdiMEpCUTFBc1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVazdkMEpCUTJwQ0xHdEhRVUZyUnp0M1FrRkRiRWNzU1VGQlNTeEhRVUZITEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenQzUWtGRGVrUXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dDNRa0ZEZUVRc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdkMEpCUTNKR0xFdEJRVXNzUTBGQlF6dHZRa0ZEVUN3d1FrRkJNRUk3YjBKQlF6RkNPM2RDUVVORExIZENRVUYzUWp0M1FrRkRlRUlzTUVKQlFUQkNPM2RDUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNRMEZCUXp0M1FrRkRja01zUTBGQlF6dG5Ra0ZEU0N4RFFVRkRPMmRDUVVORUxFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU03YjBKQlEzUkRMRTFCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRE8yZENRVU16UlN4RFFVRkRPMWxCUTBZc1EwRkJRenRaUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTlFMRGhHUVVFNFJqdG5Ra0ZET1VZc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlEyeERMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eFhRVUZYTzNkQ1FVTjRRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFbEJRVWtzU1VGQlNTeERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenMwUWtGRGNFWXNkMFZCUVhkRk96UkNRVU40UlN3MFJFRkJORVE3TkVKQlF6VkVMRTFCUVUwc1IwRkJSeXhKUVVGSkxHMUNRVUZSTEVOQlEzQkNMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeEZRVU4yUkN4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGRE0wUXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVNelJEdHBRMEZEUVN4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxHbENRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN2QwSkJReTlDTEVOQlFVTTdkMEpCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03TkVKQlExQXNiMGRCUVc5SE96UkNRVU53Unl4TlFVRk5MRWRCUVVjc1NVRkJTU3h0UWtGQlVTeERRVU53UWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzVlVGQlZTeERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGRGRrUXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUTI1R0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZETTBRc1EwRkJRenMwUWtGRlJpeDFSVUZCZFVVN05FSkJRM1pGTEc5RVFVRnZSRHMwUWtGRGNFUXNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdORUpCUTJoRkxFVkJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkRFFVTndReXhQUVVGUE8yZERRVU5RTEhkQ1FVRjNRanRuUTBGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVWQlFVVXNhVUpCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eFhRVUZYTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOURRVU01UlN4M1JVRkJkMFU3YjBOQlEzaEZMRTFCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJkRFFVTXpReXhEUVVGRE96UkNRVU5HTEVOQlFVTTdORUpCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBOQlExQXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVXNhVUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRMEZEZEVjc0swUkJRU3RFTzI5RFFVTXZSQ3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blEwRkRNME1zUTBGQlF6czBRa0ZEUml4RFFVRkRPelJDUVVWRUxEaENRVUU0UWpzMFFrRkRPVUlzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03TkVKQlF6TkVMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU03TkVKQlExUXNUMEZCVHl4SlFVRkpMRWxCUVVrc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBOQlEzSkNMSEZFUVVGeFJEdG5RMEZEY2tRc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdaME5CUTNKRExFOUJRVThzUjBGQlJ5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdaME5CUTI1R0xGTkJRVk1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNhVUpCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dG5RMEZETDBVc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEZkQlFWY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UTBGRGVFVXNUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJRenR2UTBGRGFrSXNTMEZCU3l4RFFVRkRPMmREUVVOUUxFTkJRVU03WjBOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOURRVU14UXl3MFEwRkJORU03YjBOQlF6VkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETzJkRFFVTnFRaXhEUVVGRE8yZERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlEUVVOUUxEUkRRVUUwUXp0dlEwRkROVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1owTkJRMnBDTEVOQlFVTTdORUpCUTBZc1EwRkJRenQzUWtGRFJpeERRVUZETzNkQ1FVTkVMRXRCUVVzc1EwRkJRenR2UWtGRFVDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1RVRkJUVHQzUWtGRGJrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RlFVRkZMRWxCUVVrc1EwRkJReXhGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdORUpCUTJoR0xHMUZRVUZ0UlRzMFFrRkRia1VzZFVSQlFYVkVPelJDUVVOMlJDeE5RVUZOTEVkQlFVY3NTVUZCU1N4dFFrRkJVU3hEUVVOd1FpeFZRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1ZVRkJWU3hEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkRka1FzVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOdVJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUXpORU8ybERRVU5CTEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0M1FrRkRMMElzUTBGQlF6dDNRa0ZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenMwUWtGRFVDeHZSMEZCYjBjN05FSkJRM0JITEUxQlFVMHNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRM0JDTEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVVXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVOMlJDeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZEYmtZc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFhRVUZYTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVU16UkN4RFFVRkRPelJDUVVWR0xEUkZRVUUwUlRzMFFrRkROVVVzT0VOQlFUaERPelJDUVVNNVF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6czBRa0ZETjBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlEzQkRMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNWMEZCVnl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRMEZEZWtVc2QwVkJRWGRGTzI5RFFVTjRSU3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc2FVSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blEwRkRNME1zUTBGQlF6czBRa0ZEUml4RFFVRkRPelJDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkRFFVTlFMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1JVRkJSU3hwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiME5CUTJwSExDdEVRVUVyUkR0dlEwRkRMMFFzVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxHbENRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1owTkJRek5ETEVOQlFVTTdORUpCUTBZc1EwRkJRenMwUWtGRlJDdzRRa0ZCT0VJN05FSkJRemxDTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZET3pSQ1FVTjRSQ3hKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZET3pSQ1FVTlVMRTlCUVU4c1NVRkJTU3hKUVVGSkxFbEJRVWtzUlVGQlJTeERRVUZETzJkRFFVTnlRaXh4UkVGQmNVUTdaME5CUTNKRUxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMmREUVVOeVF5eFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hwUWtGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMmREUVVNNVJTeFRRVUZUTEVkQlFVY3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMR2xDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdaME5CUXpGRkxFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4WFFVRlhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzVTBGQlV5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBOQlEzaEZMRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU03YjBOQlEycENMRXRCUVVzc1EwRkJRenRuUTBGRFVDeERRVUZETzJkRFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRMEZETVVNc05FTkJRVFJETzI5RFFVTTFReXhKUVVGSkxFZEJRVWNzU1VGQlNTeEhRVUZITEVOQlFVTXNRMEZCUXp0blEwRkRha0lzUTBGQlF6dG5RMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenR2UTBGRFVDdzBRMEZCTkVNN2IwTkJRelZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUVVjc1EwRkJReXhEUVVGRE8yZERRVU5xUWl4RFFVRkRPelJDUVVOR0xFTkJRVU03ZDBKQlEwWXNRMEZCUXp0M1FrRkRSQ3hMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFMUJRVTA3ZDBKQlEyNUNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPelJDUVVOb1JpeHZSMEZCYjBjN05FSkJRM0JITEN0RFFVRXJRenMwUWtGREwwTXNUVUZCVFN4SFFVRkhMRWxCUVVrc2JVSkJRVkVzUTBGRGNFSXNWVUZCVlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRkxGVkJRVlVzUTBGQlF5eExRVUZMTEVWQlFVVXNSVUZCUlN4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRM1pFTEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlF6TkZMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGRE0wUTdhVU5CUTBFc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zZENRVU0zUWl4RFFVRkRPM2RDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZET3pSQ1FVTlFMSGxHUVVGNVJqczBRa0ZEZWtZc1RVRkJUU3hIUVVGSExFbEJRVWtzYlVKQlFWRXNRMEZEY0VJc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZGTEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1JVRkJSU3hWUVVGVkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlEzWkVMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVOdVJpeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUXpORUxFTkJRVU03TkVKQlJVWXNORVJCUVRSRU96UkNRVU0xUkN3clJFRkJLMFE3TkVKQlF5OUVMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJRenMwUWtGREwwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owTkJRM0JETEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVTBGQlV5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zVjBGQlZ5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UTBGRGVrVXNkMFZCUVhkRk8yOURRVU40UlN4TlFVRk5MRWRCUVVjc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVXNhVUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dG5RMEZETTBNc1EwRkJRenMwUWtGRFJpeERRVUZET3pSQ1FVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yZERRVU5RTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBOQlEycEhMQ3RFUVVFclJEdHZRMEZETDBRc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMR2xDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaME5CUXpORExFTkJRVU03TkVKQlEwWXNRMEZCUXp0M1FrRkRSaXhEUVVGRE8zZENRVU5FTEV0QlFVc3NRMEZCUXp0dlFrRkRVQ3hMUVVGTExHbENRVUZSTEVOQlFVTXNTVUZCU1R0M1FrRkRha0lzVFVGQlRTeEhRVUZITEVsQlFVa3NiVUpCUVZFc1EwRkRjRUlzVlVGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhMUVVGTExFVkJRVVVzUlVGQlJTeFZRVUZWTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUTNaRUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU51Uml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTEVOQlFVTTdkMEpCUlVZc05FUkJRVFJFTzNkQ1FVTTFSQ3dyUkVGQkswUTdkMEpCUXk5RUxGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM2hFTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPelJDUVVOd1F5eEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owTkJRM1pGTEhkRlFVRjNSVHRuUTBGRGVFVXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTEdsQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03TkVKQlF6TkRMRU5CUVVNN2QwSkJRMFlzUTBGQlF6dDNRa0ZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenMwUWtGRFVDeEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeHBRa0ZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVWQlFVVXNhVUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZERRVU12Uml3clJFRkJLMFE3WjBOQlF5OUVMRTFCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4cFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZET3pSQ1FVTXpReXhEUVVGRE8zZENRVU5HTEVOQlFVTTdkMEpCUTBRc1MwRkJTeXhEUVVGRE8yOUNRVU5RTEV0QlFVc3NhVUpCUVZFc1EwRkJReXhIUVVGSE8zZENRVU5vUWl4dlJrRkJiMFk3ZDBKQlEzQkdMRWxCUVVrc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVOQlFVTTdkMEpCUTNoRUxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM2hFTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03ZDBKQlEzSkhMRXRCUVVzc1EwRkJRenR2UWtGRFVDeExRVUZMTEdsQ1FVRlJMRU5CUVVNc1MwRkJTenQzUWtGRGJFSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUjBGQlJ5eEZRVUZGT3pSQ1FVTXhSQ3hEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTTdkMEpCUTI1RUxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN2QwSkJRM2hFTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjJSU3hMUVVGTExFTkJRVU03YjBKQlExQXNTMEZCU3l4cFFrRkJVU3hEUVVGRExFbEJRVWs3ZDBKQlEycENMR3RIUVVGclJ6dDNRa0ZEYkVjc1NVRkJTU3hIUVVGSExGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0M1FrRkRla1FzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJRenQzUWtGRGVFUXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdkMEpCUXpORkxFMUJRVTBzUjBGQlJ5eEpRVUZKTEcxQ1FVRlJMRU5CUTNCQ0xFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUXpkRUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU51Uml4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRek5FTEVOQlFVTTdkMEpCUTBZc1MwRkJTeXhEUVVGRE8yOUNRVU5RTERCQ1FVRXdRanR2UWtGRE1VSTdkMEpCUTBNc2QwSkJRWGRDTzNkQ1FVTjRRaXd3UWtGQk1FSTdkMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzNkQ1FVTnlReXhEUVVGRE8yZENRVU5JTEVOQlFVTTdaMEpCUTBRc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1EwRkJRenR2UWtGRGVFTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN1owSkJRMmhHTEVOQlFVTTdXVUZEUml4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVNeFJDeERRVUZETzBsQlJVUTdPenM3T3pzN08wOUJVVWM3U1VGRFNTeDVRa0ZCVVN4SFFVRm1MRlZCUVdkQ0xFbEJRV01zUlVGQlJTeExRVUZwUWp0UlFVRnFRaXh4UWtGQmFVSXNSMEZCYWtJc1UwRkJhVUk3VVVGRGFFUXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03VVVGRGNrTXNaMEpCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4RlFVTnVSQ3c0UkVGQk9FUXNRMEZCUXl4RFFVRkRPMUZCUTJwRkxHZENRVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExGRkJRVkVzUlVGQlJTeDNRa0ZCZDBJc1EwRkJReXhEUVVGRE8xRkJRemxFTEdkQ1FVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4TFFVRkxMRVZCUVVVc01FSkJRVEJDTEVOQlFVTXNRMEZCUXp0UlFVTm9SU3hKUVVGTkxHTkJRV01zUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VVVGREwwVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eFRRVUZUTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEycEVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUTNwRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1MwRkJTeXhGUVVGRkxFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkROMFFzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGVFSXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMUFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGRE9VTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eExRVUZMTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVU0zUkN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTjRRaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3pzN096czdPMDlCVDBjN1NVRkRTU3g1UWtGQlVTeEhRVUZtTEZWQlFXZENMRWxCUVdNN1VVRkROMElzU1VGQlNTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRha1FzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZWtJc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1VVRkRhRU1zUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1NVRkRaaXhEUVVGRE8wbEJSVVE3T3pzN096dFBRVTFITzBsQlEwa3NlVUpCUVZFc1IwRkJaaXhWUVVGblFpeEpRVUZqTEVWQlFVVXNTMEZCYVVJN1VVRkJha0lzY1VKQlFXbENMRWRCUVdwQ0xGTkJRV2xDTzFGQlEyaEVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU40UXl4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NNa0pCUVZVc1IwRkJha0lzVlVGQmEwSXNWVUZCYjBJN1VVRkRja01zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMnBDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRaQ3hEUVVGRE8xRkJRMFFzWjBKQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVU42UkN4blJVRkJaMFVzUTBGQlF5eERRVUZETzFGQlEyNUZMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXh0UWtGQlVTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRkRVlzUTBGQlF6dEpRVVZFT3pzN08wOUJTVWM3U1VGRFNTeDFRa0ZCVFN4SFFVRmlMRlZCUVdNc1MwRkJZVHRSUVVNeFFpd3lSa0ZCTWtZN1VVRkRNMFlzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU1zVTBGQlV5eEZRVUZGTEVOQlFVTTdaVUZEZEVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRE8yVkJReTlETEVsQlFVa3NRMEZCUXl4UFFVRlBMRXRCUVVzc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzBsQlEzSkRMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTERCQ1FVRlRMRWRCUVdoQ0xGVkJRV2xDTEV0QlFXRTdVVUZETjBJc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhEUVVGRExGTkJRVk1zUlVGQlJTeERRVUZETzJWQlEyaEVMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJRenRsUVVNeFF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZMRXRCUVVzc1MwRkJTeXhEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEYWtNc1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzTkVKQlFWY3NSMEZCYkVJN1VVRkRReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1IwRkJSeXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRKUVVNelJTeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzZVVKQlFWRXNSMEZCWmp0UlFVTkRMRWxCUVVrc1RVRkJUU3hIUVVGWExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RlFVRkZMRWRCUVVjc2IwSkJRVzlDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFJRVU51Unl3NFEwRkJPRU03VVVGRE9VTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjZRaXhOUVVGTkxFbEJRVWtzV1VGQldTeEhRVUZITEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTjJSQ3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTm1MRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhkQ1FVRlBMRWRCUVdRN1VVRkRReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU03U1VGRE5VTXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMHNzTkVKQlFWY3NSMEZCYmtJc1ZVRkJiMElzUTBGQlZ6dFJRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeExRVUZMTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRelZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRzFDUVVGUkxFTkJRMnhDTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVWQlF6ZEdMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTXZSQ3hEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVlzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlEwc3NPRUpCUVdFc1IwRkJja0lzVlVGQmMwSXNRMEZCVnl4RlFVRkZMRkZCUVhkQ08xRkJRWGhDTEhkQ1FVRjNRaXhIUVVGNFFpeGxRVUYzUWp0UlFVTXhSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzYVVKQlFWRXNRMEZCUXl4TFFVRkxMRWxCUVVrc1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXp0bFFVTTNSQ3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc2FVSkJRVkVzUTBGQlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVOQlF5OUdMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMGdzVFVGQlRTeERRVUZETEVsQlFVa3NiVUpCUVZFc1EwRkRiRUlzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVVVzUlVGQlJTeEZRVUZGTEVWQlEzWkNMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlJTeEZRVU5vUXl4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkROMElzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEhkRFFVRjNRenRSUVVOdVJDeERRVUZETzBsQlEwWXNRMEZCUXp0SlFVVkVPenM3VDBGSFJ6dEpRVU5MTERaQ1FVRlpMRWRCUVhCQ08xRkJRME1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTzJWQlF6VkNMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc2RVSkJRVmtzUTBGQlF5eE5RVUZOTzJWQlEzSkVMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVOMFF5eERRVUZETzBsQlJVUTdPenM3T3p0UFFVMUhPMGxCUTBzc2IwTkJRVzFDTEVkQlFUTkNPMUZCUTBNc2EwTkJRV3RETzFGQlEyeERMRWxCUVVrc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1VVRkRlRU1zU1VGQlNTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVVZ3UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4WFFVRlhMRWxCUVVrc1UwRkJVeXhKUVVGSkxFbEJRVWtzU1VGQlNTeFRRVUZUTEVkQlFVY3NTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNrWXNjMFJCUVhORU8xbEJRM1JFTEZOQlFWTXNSMEZCUnl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRemRDTEU5QlFVOHNSMEZCUnl4cFFrRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF6dFJRVU16UWl4RFFVRkRPMUZCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eExRVUZMTEdsQ1FVRlJMRU5CUVVNc1RVRkJUU3hKUVVGSkxGTkJRVk1zU1VGQlNTeEZRVUZGTEVsQlFVa3NVMEZCVXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6VkZMSE5FUVVGelJEdFpRVU4wUkN4VFFVRlRMRWRCUVVjc1UwRkJVeXhIUVVGSExFVkJRVVVzUTBGQlF6dFpRVU16UWl4UFFVRlBMRWRCUVVjc2FVSkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZETTBJc1EwRkJRenRSUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEU5QlFVOHNTMEZCU3l4cFFrRkJVU3hEUVVGRExFMUJRVTBzU1VGQlNTeFRRVUZUTEVsQlFVa3NSVUZCUlN4SlFVRkpMRk5CUVZNc1IwRkJSeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTFSU3hUUVVGVExFZEJRVWNzVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTXpRaXhQUVVGUExFZEJRVWNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNN1VVRkRla0lzUTBGQlF6dFJRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1MwRkJTeXhwUWtGQlVTeERRVUZETEVsQlFVa3NTVUZCU1N4VFFVRlRMRWxCUVVrc1JVRkJSU3hKUVVGSkxGTkJRVk1zUjBGQlJ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNeFJTeFRRVUZUTEVkQlFVY3NVMEZCVXl4SFFVRkhMRVZCUVVVc1EwRkJRenRaUVVNelFpeFBRVUZQTEVkQlFVY3NhVUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU03VVVGRGVFSXNRMEZCUXp0UlFVTkVMREpFUVVFeVJEdFJRVU16UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFdEJRVXNzYVVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJReTlDTEZOQlFWTXNSMEZCUnl4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRekZDTEU5QlFVOHNSMEZCUnl4cFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF6dFJRVU40UWl4RFFVRkRPMUZCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eExRVUZMTEdsQ1FVRlJMRU5CUVVNc1MwRkJTeXhKUVVGSkxGTkJRVk1zU1VGQlNTeEZRVUZGTEVsQlFVa3NVMEZCVXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6TkZMRk5CUVZNc1IwRkJSeXhUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzFsQlF6TkNMRTlCUVU4c1IwRkJSeXhwUWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTjZRaXhEUVVGRE8xRkJSVVFzU1VGQlNTeERRVUZETEZsQlFWa3NSMEZCUnl4SlFVRkpMRzFDUVVGUkxFTkJRVU1zVTBGQlV5eEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRPMUZCUlhKRUxIbENRVUY1UWp0UlFVTjZRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM3BDTEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU14UWl4RFFVRkRPMUZCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03V1VGRFVDeEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRk5CUVZNc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0UlFVTXpReXhEUVVGRE8xRkJSVVFzTUVKQlFUQkNPMUZCUXpGQ0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUTJwRkxFTkJRVU03U1VGRlJpeGhRVUZETzBGQlFVUXNRMEZCUXl4QlFUZDVRa1FzU1VFMmVVSkRPMEZCTjNsQ1dTeGpRVUZOTEZOQk5ubENiRUlzUTBGQlFTSjkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGJlZ2lubmluZy5cclxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXHJcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcclxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXHJcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYWRMZWZ0KHMsIHdpZHRoLCBjaGFyKSB7XHJcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgcGFkZGluZyArPSBjaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcbmV4cG9ydHMucGFkTGVmdCA9IHBhZExlZnQ7XHJcbi8qKlxyXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGVuZC5cclxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXHJcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcclxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXHJcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYWRSaWdodChzLCB3aWR0aCwgY2hhcikge1xyXG4gICAgdmFyIHBhZGRpbmcgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG4gICAgICAgIHBhZGRpbmcgKz0gY2hhcjtcclxuICAgIH1cclxuICAgIHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5leHBvcnRzLnBhZFJpZ2h0ID0gcGFkUmlnaHQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlhVzVuY3k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlzYVdJdmMzUnlhVzVuY3k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3T3p0SFFVbEhPMEZCUlVnc1dVRkJXU3hEUVVGRE8wRkJTV0k3T3pzN096dEhRVTFITzBGQlEwZ3NhVUpCUVhkQ0xFTkJRVk1zUlVGQlJTeExRVUZoTEVWQlFVVXNTVUZCV1R0SlFVTTNSQ3hKUVVGSkxFOUJRVThzUjBGQlZ5eEZRVUZGTEVOQlFVTTdTVUZEZWtJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF6dFJRVU0zUXl4UFFVRlBMRWxCUVVrc1NVRkJTU3hEUVVGRE8wbEJRMnBDTEVOQlFVTTdTVUZEUkN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU53UWl4RFFVRkRPMEZCVG1Vc1pVRkJUeXhWUVUxMFFpeERRVUZCTzBGQlJVUTdPenM3T3p0SFFVMUhPMEZCUTBnc2EwSkJRWGxDTEVOQlFWTXNSVUZCUlN4TFFVRmhMRVZCUVVVc1NVRkJXVHRKUVVNNVJDeEpRVUZKTEU5QlFVOHNSMEZCVnl4RlFVRkZMRU5CUVVNN1NVRkRla0lzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXp0UlFVTTNReXhQUVVGUExFbEJRVWtzU1VGQlNTeERRVUZETzBsQlEycENMRU5CUVVNN1NVRkRSQ3hOUVVGTkxFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXp0QlFVTndRaXhEUVVGRE8wRkJUbVVzWjBKQlFWRXNWMEZOZGtJc1EwRkJRU0o5IiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBEZWZhdWx0IHRpbWUgc291cmNlLCByZXR1cm5zIGFjdHVhbCB0aW1lXHJcbiAqL1xyXG52YXIgUmVhbFRpbWVTb3VyY2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUmVhbFRpbWVTb3VyY2UoKSB7XHJcbiAgICB9XHJcbiAgICBSZWFsVGltZVNvdXJjZS5wcm90b3R5cGUubm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWFsVGltZVNvdXJjZTtcclxufSgpKTtcclxuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IFJlYWxUaW1lU291cmNlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lkR2x0WlhOdmRYSmpaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OXNhV0l2ZEdsdFpYTnZkWEpqWlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3UjBGRlJ6dEJRVVZJTEZsQlFWa3NRMEZCUXp0QlFXTmlPenRIUVVWSE8wRkJRMGc3U1VGQlFUdEpRVkZCTEVOQlFVTTdTVUZRUVN3MFFrRkJSeXhIUVVGSU8xRkJRME1zZDBKQlFYZENPMUZCUTNoQ0xEQkNRVUV3UWp0UlFVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTFZc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZEYmtJc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRFJpeHhRa0ZCUXp0QlFVRkVMRU5CUVVNc1FVRlNSQ3hKUVZGRE8wRkJVbGtzYzBKQlFXTXNhVUpCVVRGQ0xFTkJRVUVpZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xyXG4vKipcclxuICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlIGFzIHBlciBPUyBzZXR0aW5ncy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqL1xyXG5mdW5jdGlvbiBsb2NhbCgpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS5sb2NhbCgpO1xyXG59XHJcbmV4cG9ydHMubG9jYWwgPSBsb2NhbDtcclxuLyoqXHJcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZnVuY3Rpb24gdXRjKCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLnV0YygpO1xyXG59XHJcbmV4cG9ydHMudXRjID0gdXRjO1xyXG4vKipcclxuICogU2VlIHRoZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBvdGhlciB6b25lKCkgbWV0aG9kIHNpZ25hdHVyZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB6b25lKGEsIGRzdCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcclxufVxyXG5leHBvcnRzLnpvbmUgPSB6b25lO1xyXG4vKipcclxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRpbWVab25lS2luZCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIkxvY2FsXCJdID0gMF0gPSBcIkxvY2FsXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZpeGVkIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJPZmZzZXRcIl0gPSAxXSA9IFwiT2Zmc2V0XCI7XHJcbiAgICAvKipcclxuICAgICAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xyXG4gICAgICogRFNUIGlmIGFwcGxpY2FibGUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJQcm9wZXJcIl0gPSAyXSA9IFwiUHJvcGVyXCI7XHJcbn0pKGV4cG9ydHMuVGltZVpvbmVLaW5kIHx8IChleHBvcnRzLlRpbWVab25lS2luZCA9IHt9KSk7XHJcbnZhciBUaW1lWm9uZUtpbmQgPSBleHBvcnRzLlRpbWVab25lS2luZDtcclxuLyoqXHJcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XHJcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxyXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcclxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXHJcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcclxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cclxuICovXHJcbnZhciBUaW1lWm9uZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIERvIG5vdCB1c2UgdGhpcyBjb25zdHJ1Y3RvciwgdXNlIHRoZSBzdGF0aWNcclxuICAgICAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XHJcbiAgICAgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUaW1lWm9uZShuYW1lLCBkc3QpIHtcclxuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICBpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLkxvY2FsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcclxuICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIFwibm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICdcIiArIG5hbWUgKyBcIidcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUuIE5vdGUgdGhhdFxyXG4gICAgICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXHJcbiAgICAgKiAyMDE0LTAxLTAxIGlzICswMTowMCBhbmQgYW1zdGVyZGFtIHRpbWUgZm9yIDIwMTQtMDctMDEgaXMgKzAyOjAwXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLmxvY2FsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnV0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcIlVUQ1wiLCB0cnVlKTsgLy8gdXNlICd0cnVlJyBmb3IgRFNUIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBkaXNwbGF5IGFzIFwiVVRDXCIsIG5vdCBcIlVUQyB3aXRob3V0IERTVFwiXHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBab25lIGltcGxlbWVudGF0aW9uc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS56b25lID0gZnVuY3Rpb24gKGEsIGRzdCkge1xyXG4gICAgICAgIGlmIChkc3QgPT09IHZvaWQgMCkgeyBkc3QgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIG5hbWUgPSBcIlwiO1xyXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhKSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIG5vIHRpbWUgem9uZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyhzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGltZVpvbmUuem9uZSgpOiBVbmV4cGVjdGVkIGFyZ3VtZW50IHR5cGUgXFxcIlwiICsgdHlwZW9mIChhKSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUobmFtZSwgZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1ha2VzIHRoaXMgY2xhc3MgYXBwZWFyIGNsb25hYmxlLiBOT1RFIGFzIHRpbWUgem9uZSBvYmplY3RzIGFyZSBjYWNoZWQgeW91IHdpbGwgTk9UXHJcbiAgICAgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxyXG4gICAgICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuICAgICAqIHRoZSBsb2NhbCB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5kc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RzdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSAoTG9jYWwvT2Zmc2V0L1Byb3BlcilcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmtpbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tpbmQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBFcXVhbGl0eSBvcGVyYXRvci4gTWFwcyB6ZXJvIG9mZnNldHMgYW5kIGRpZmZlcmVudCBuYW1lcyBmb3IgVVRDIG9udG9cclxuICAgICAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXHJcbiAgICAgICAgICAgICAgICAmJiAodGhpcy5fZHN0ID09PSBvdGhlci5fZHN0IHx8ICF0aGlzLmhhc0RzdCgpKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyB3ZXJlIGlkZW50aWNhbCwgc28gVVRDICE9PSBHTVRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGlzIHpvbmUgZXF1aXZhbGVudCB0byBVVEM/XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pc1V0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuICh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS56b25lSXNVdGModGhpcy5fbmFtZSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRG9lcyB0aGlzIHpvbmUgaGF2ZSBEYXlsaWdodCBTYXZpbmcgVGltZSBhdCBhbGw/XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIGJhc2ljc18xLlRpbWVTdHJ1Y3QgPyBhIDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSk7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LCB1dGNUaW1lLmNvbXBvbmVudHMuaG91ciwgdXRjVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgdXRjVGltZS5jb21wb25lbnRzLnNlY29uZCwgdXRjVGltZS5jb21wb25lbnRzLm1pbGxpKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVua25vd24gVGltZVpvbmVLaW5kICdcIiArIHRoaXMuX2tpbmQgKyBcIidcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHZhciBsb2NhbFRpbWUgPSAoYSAmJiBhIGluc3RhbmNlb2YgYmFzaWNzXzEuVGltZVN0cnVjdCA/IGEgOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUobG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy5kYXksIGxvY2FsVGltZS5jb21wb25lbnRzLmhvdXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taWxsaSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBUaW1lWm9uZUtpbmQgJ1wiICsgdGhpcy5fa2luZCArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG4gICAgICpcclxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG4gICAgICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuICAgICAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG4gICAgICpcclxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG4gICAgICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuICAgICAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yWm9uZURhdGUgPSBmdW5jdGlvbiAoZGF0ZSwgZnVuY3MpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXRGb3Jab25lKGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuYWJicmV2aWF0aW9uRm9yVXRjID0gZnVuY3Rpb24gKGEsIGIsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpLCBjKSB7XHJcbiAgICAgICAgdmFyIHV0Y1RpbWU7XHJcbiAgICAgICAgdmFyIGRzdERlcGVuZGVudCA9IHRydWU7XHJcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBiYXNpY3NfMS5UaW1lU3RydWN0KSB7XHJcbiAgICAgICAgICAgIHV0Y1RpbWUgPSBhO1xyXG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYiA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdXRjVGltZSA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IGIsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgZHN0RGVwZW5kZW50ID0gKGMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJsb2NhbFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIFRpbWVab25lS2luZCAnXCIgKyB0aGlzLl9raW5kICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUubm9ybWFsaXplWm9uZVRpbWUgPSBmdW5jdGlvbiAobG9jYWxUaW1lLCBvcHQpIHtcclxuICAgICAgICBpZiAob3B0ID09PSB2b2lkIDApIHsgb3B0ID0gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXA7IH1cclxuICAgICAgICB2YXIgdHpvcHQgPSAob3B0ID09PSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93biA6IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwKTtcclxuICAgICAgICBpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUpLCB0em9wdCkudW5peE1pbGxpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUsIHR6b3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVGltZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIgKG5vcm1hbGl6ZWQpLlxyXG4gICAgICogRWl0aGVyIFwibG9jYWx0aW1lXCIsIElBTkEgbmFtZSwgb3IgXCIraGg6bW1cIiBvZmZzZXQuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XHJcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJbVGltZVpvbmU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGFuIG9mZnNldCBudW1iZXIgaW50byBhbiBvZmZzZXQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgaW4gbWludXRlcyBmcm9tIFVUQyBlLmcuIDkwIG1pbnV0ZXNcclxuICAgICAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xyXG4gICAgICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcclxuICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAlIDYwKTtcclxuICAgICAgICByZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXHJcbiAgICAgKiBAcGFyYW0gc1x0Rm9ybWF0czogXCItMDE6MDBcIiwgXCItMDEwMFwiLCBcIi0wMVwiLCBcIlpcIlxyXG4gICAgICogQHJldHVybiBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0ID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xyXG4gICAgICAgIC8vIGVhc3kgY2FzZVxyXG4gICAgICAgIGlmICh0ID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhhdCB0aGUgcmVtYWluZGVyIGNvbmZvcm1zIHRvIElTTyB0aW1lIHpvbmUgc3BlY1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pLCBcIldyb25nIHRpbWUgem9uZSBmb3JtYXQ6IFxcXCJcIiArIHQgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgdmFyIHNpZ24gPSAodC5jaGFyQXQoMCkgPT09IFwiK1wiID8gMSA6IC0xKTtcclxuICAgICAgICB2YXIgaG91cnMgPSBwYXJzZUludCh0LnN1YnN0cigxLCAyKSwgMTApO1xyXG4gICAgICAgIHZhciBtaW51dGVzID0gMDtcclxuICAgICAgICBpZiAodC5sZW5ndGggPT09IDUpIHtcclxuICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDMsIDIpLCAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHQubGVuZ3RoID09PSA2KSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0LnN1YnN0cig0LCAyKSwgMTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJPZmZzZXRzIGZyb20gVVRDIG11c3QgYmUgbGVzcyB0aGFuIGEgZGF5LlwiKTtcclxuICAgICAgICByZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGluIGNhY2hlIG9yIGNyZWF0ZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gbmFtZVx0VGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX2ZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBkc3QpIHtcclxuICAgICAgICB2YXIga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcclxuICAgICAgICBpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdCA9IG5ldyBUaW1lWm9uZShuYW1lLCBkc3QpO1xyXG4gICAgICAgICAgICBUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSBhIHN0cmluZyBzbyBpdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBmb3IgYVxyXG4gICAgICogY2FjaGUgbG9va3VwXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcclxuICAgICAgICBpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodCA9PT0gXCJaXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiKzAwOjAwXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xyXG4gICAgICAgICAgICAvLyBvZmZzZXQgc3RyaW5nXHJcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXHJcbiAgICAgICAgICAgIHJldHVybiBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhUaW1lWm9uZS5zdHJpbmdUb09mZnNldCh0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgcmV0dXJuICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgdC5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IHQgPT09IFwiWlwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRpbWUgem9uZSBjYWNoZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX2NhY2hlID0ge307XHJcbiAgICByZXR1cm4gVGltZVpvbmU7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVGltZVpvbmUgPSBUaW1lWm9uZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pZEdsdFpYcHZibVV1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDNScGJXVjZiMjVsTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPenM3TzBkQlNVYzdRVUZGU0N4WlFVRlpMRU5CUVVNN1FVRkZZaXgxUWtGQmJVSXNWVUZCVlN4RFFVRkRMRU5CUVVFN1FVRkRPVUlzZFVKQlFUSkNMRlZCUVZVc1EwRkJReXhEUVVGQk8wRkJSWFJETEVsQlFWa3NUMEZCVHl4WFFVRk5MRmRCUVZjc1EwRkJReXhEUVVGQk8wRkJRM0pETERSQ1FVRTJReXhsUVVGbExFTkJRVU1zUTBGQlFUdEJRVVUzUkRzN08wZEJSMGM3UVVGRFNEdEpRVU5ETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03UVVGRGVrSXNRMEZCUXp0QlFVWmxMR0ZCUVVzc1VVRkZjRUlzUTBGQlFUdEJRVVZFT3pzN1IwRkhSenRCUVVOSU8wbEJRME1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRCUVVOMlFpeERRVUZETzBGQlJtVXNWMEZCUnl4TlFVVnNRaXhEUVVGQk8wRkJkVUpFT3p0SFFVVkhPMEZCUTBnc1kwRkJjVUlzUTBGQlRTeEZRVUZGTEVkQlFXRTdTVUZEZWtNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRemxDTEVOQlFVTTdRVUZHWlN4WlFVRkpMRTlCUlc1Q0xFTkJRVUU3UVVGRlJEczdSMEZGUnp0QlFVTklMRmRCUVZrc1dVRkJXVHRKUVVOMlFqczdUMEZGUnp0SlFVTklMR2xFUVVGTExFTkJRVUU3U1VGRFREczdUMEZGUnp0SlFVTklMRzFFUVVGTkxFTkJRVUU3U1VGRFRqczdPMDlCUjBjN1NVRkRTQ3h0UkVGQlRTeERRVUZCTzBGQlExQXNRMEZCUXl4RlFXUlhMRzlDUVVGWkxFdEJRVm9zYjBKQlFWa3NVVUZqZGtJN1FVRmtSQ3hKUVVGWkxGbEJRVmtzUjBGQldpeHZRa0ZqV0N4RFFVRkJPMEZCUlVRN096czdPenM3T3p0SFFWTkhPMEZCUTBnN1NVRnBSME03T3pzN08wOUJTMGM3U1VGRFNDeHJRa0ZCYjBJc1NVRkJXU3hGUVVGRkxFZEJRVzFDTzFGQlFXNUNMRzFDUVVGdFFpeEhRVUZ1UWl4VlFVRnRRanRSUVVOd1JDeEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVOc1FpeEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWRCUVVjc1EwRkJRenRSUVVOb1FpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU14UWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZEYWtNc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hKUVVGSkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTXpSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEZsQlFWa3NRMEZCUXl4TlFVRk5MRU5CUVVNN1dVRkRha01zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4UlFVRlJMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF6bERMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF6dFpRVU5xUXl4blFrRkJUU3hEUVVGRExIZENRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEd0RFFVRm5ReXhKUVVGSkxFMUJRVWNzUTBGQlF5eERRVUZETzFGQlEzSkdMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJNVVpFT3pzN08wOUJTVWM3U1VGRFZ5eGpRVUZMTEVkQlFXNUNPMUZCUTBNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8wbEJRMnhFTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOWExGbEJRVWNzUjBGQmFrSTdVVUZEUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXh0UmtGQmJVWTdTVUZEYUVrc1EwRkJRenRKUVhkQ1JEczdUMEZGUnp0SlFVTlhMR0ZCUVVrc1IwRkJiRUlzVlVGQmJVSXNRMEZCVFN4RlFVRkZMRWRCUVcxQ08xRkJRVzVDTEcxQ1FVRnRRaXhIUVVGdVFpeFZRVUZ0UWp0UlFVTTNReXhKUVVGSkxFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEWkN4TlFVRk5MRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNCQ0xFdEJRVXNzVVVGQlVUdG5Ra0ZCUlN4RFFVRkRPMjlDUVVObUxFbEJRVWtzUTBGQlF5eEhRVUZYTEVOQlFVTXNRMEZCUXp0dlFrRkRiRUlzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNelFpeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1pVRkJaVHR2UWtGRE4wSXNRMEZCUXp0dlFrRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dDNRa0ZEVUN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlEyNURMRWRCUVVjc1IwRkJSeXhMUVVGTExFTkJRVU03TkVKQlExb3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUXpsRExFTkJRVU03ZDBKQlEwUXNTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGNrTXNRMEZCUXp0blFrRkRSaXhEUVVGRE8yZENRVUZETEV0QlFVc3NRMEZCUXp0WlFVTlNMRXRCUVVzc1VVRkJVVHRuUWtGQlJTeERRVUZETzI5Q1FVTm1MRWxCUVUwc1RVRkJUU3hIUVVGdFFpeERRVUZETEVOQlFVTTdiMEpCUTJwRExHZENRVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSU3hIUVVGSExFVkJRVVVzU1VGQlNTeE5RVUZOTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1JVRkJSU3h6UTBGQmMwTXNRMEZCUXl4RFFVRkRPMjlDUVVOMFJpeEpRVUZKTEVkQlFVY3NVVUZCVVN4RFFVRkRMR05CUVdNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVNc1EwRkJRenRuUWtGQlF5eExRVUZMTEVOQlFVTTdXVUZEVWl3d1FrRkJNRUk3V1VGRE1VSTdaMEpCUTBNc2QwSkJRWGRDTzJkQ1FVTjRRaXd3UWtGQk1FSTdaMEpCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMVlzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3NFEwRkJPRU1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlEzSkdMRU5CUVVNN1VVRkRTQ3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRnpRa1E3T3p0UFFVZEhPMGxCUTBrc2QwSkJRVXNzUjBGQldqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNN1NVRkRZaXhEUVVGRE8wbEJSVVE3T3pzN1QwRkpSenRKUVVOSkxIVkNRVUZKTEVkQlFWZzdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU51UWl4RFFVRkRPMGxCUlUwc2MwSkJRVWNzUjBGQlZqdFJRVU5ETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRE8wbEJRMnhDTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxIVkNRVUZKTEVkQlFWZzdVVUZEUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU51UWl4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NlVUpCUVUwc1IwRkJZaXhWUVVGakxFdEJRV1U3VVVGRE5VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGJrTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVOaUxFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU53UWl4TFFVRkxMRmxCUVZrc1EwRkJReXhMUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVTjBSU3hMUVVGTExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEZsQlFWa3NRMEZCUXl4TlFVRk5MRWxCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUzBGQlN5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkRNVWNzUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUVHR0UWtGRGJFVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1MwRkJTeXhMUVVGTExFTkJRVU1zUzBGQlN6dHRRa0ZETVVJc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeExRVUZMTEV0QlFVc3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJ4RUxEQkNRVUV3UWp0WlFVTXhRanRuUWtGRFF5eDNRa0ZCZDBJN1owSkJRM2hDTERCQ1FVRXdRanRuUWtGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIbENRVUY1UWl4RFFVRkRMRU5CUVVNN1owSkJRelZETEVOQlFVTTdVVUZEU0N4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlEwa3NORUpCUVZNc1IwRkJhRUlzVlVGQmFVSXNTMEZCWlR0UlFVTXZRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOd1FpeExRVUZMTEZsQlFWa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU4wUlN4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExGbEJRVmtzUTBGQlF5eE5RVUZOTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1MwRkJTeXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdXVUZETVVjc1MwRkJTeXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFdEJRVXNzUzBGQlN5eERRVUZETEV0QlFVc3NTVUZCU1N4SlFVRkpMRU5CUVVNc1NVRkJTU3hMUVVGTExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTnNTU3d3UWtGQk1FSTdXVUZETVVJN1owSkJRME1zZDBKQlFYZENPMmRDUVVONFFpd3dRa0ZCTUVJN1owSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXg1UWtGQmVVSXNRMEZCUXl4RFFVRkRPMmRDUVVNMVF5eERRVUZETzFGQlEwZ3NRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSRHM3VDBGRlJ6dEpRVU5KTEhkQ1FVRkxMRWRCUVZvN1VVRkRReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOd1FpeExRVUZMTEZsQlFWa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dFpRVU4wUXl4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUkN4TFFVRkxMRmxCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTXNkMEpCUVZVc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03V1VGREwwVXNNRUpCUVRCQ08xbEJRekZDTzJkQ1FVTkRMSGRDUVVGM1FqdG5Ra0ZEZUVJc01FSkJRVEJDTzJkQ1FVTXhRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOV0xFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTTdaMEpCUTJRc1EwRkJRenRSUVVOSUxFTkJRVU03U1VGRlJpeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTU3g1UWtGQlRTeEhRVUZpTzFGQlEwTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY0VJc1MwRkJTeXhaUVVGWkxFTkJRVU1zUzBGQlN5eEZRVUZGTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1dVRkRkRU1zUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGRrTXNTMEZCU3l4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEhkQ1FVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRelZGTERCQ1FVRXdRanRaUVVNeFFqdG5Ra0ZEUXl4M1FrRkJkMEk3WjBKQlEzaENMREJDUVVFd1FqdG5Ra0ZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRWaXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzJkQ1FVTmtMRU5CUVVNN1VVRkRTQ3hEUVVGRE8wbEJSVVlzUTBGQlF6dEpRVkZOTEN0Q1FVRlpMRWRCUVc1Q0xGVkJRME1zUTBGQmRVSXNSVUZCUlN4TFFVRmpMRVZCUVVVc1IwRkJXU3hGUVVGRkxFbEJRV0VzUlVGQlJTeE5RVUZsTEVWQlFVVXNUVUZCWlN4RlFVRkZMRXRCUVdNN1VVRkZkRWdzU1VGQlRTeFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxHMUNRVUZWTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWxCUVVrc2JVSkJRVlVzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4RFFVRlhMRVZCUVVVc1dVRkJTeXhGUVVGRkxGRkJRVWNzUlVGQlJTeFZRVUZKTEVWQlFVVXNZMEZCVFN4RlFVRkZMR05CUVUwc1JVRkJSU3haUVVGTExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEY0Vrc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRUlzUzBGQlN5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1owSkJRM3BDTEVsQlFVMHNTVUZCU1N4SFFVRlRMRWxCUVVrc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlEyNURMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUlVGQlJTeFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkROMFVzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUTNaSExFTkJRVU1zUTBGQlF6dG5Ra0ZEU0N4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhGUVVGRkxFTkJRVU03V1VGRGRFTXNRMEZCUXp0WlFVTkVMRXRCUVVzc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETzJkQ1FVTXhRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0WlFVTnlRaXhEUVVGRE8xbEJRMFFzUzBGQlN5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1owSkJRekZDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTm1MRTFCUVUwc1EwRkJReXgzUWtGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRmRCUVZjc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hEUVVGRE8yZENRVU42UlN4RFFVRkRPMmRDUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzI5Q1FVTlFMRTFCUVUwc1EwRkJReXgzUWtGQlZTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hEUVVGRE8yZENRVU0xUlN4RFFVRkRPMWxCUTBZc1EwRkJRenRaUVVORUxEQkNRVUV3UWp0WlFVTXhRanRuUWtGRFF5eDNRa0ZCZDBJN1owSkJRM2hDTERCQ1FVRXdRanRuUWtGRE1VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExESkNRVUY1UWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhOUVVGSExFTkJRVU1zUTBGQlF6dG5Ra0ZEZWtRc1EwRkJRenRSUVVOSUxFTkJRVU03U1VGRFJpeERRVUZETzBsQlpVMHNaME5CUVdFc1IwRkJjRUlzVlVGRFF5eERRVUYxUWl4RlFVRkZMRXRCUVdNc1JVRkJSU3hIUVVGWkxFVkJRVVVzU1VGQllTeEZRVUZGTEUxQlFXVXNSVUZCUlN4TlFVRmxMRVZCUVVVc1MwRkJZenRSUVVWMFNDeEpRVUZOTEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzYlVKQlFWVXNSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3h0UWtGQlZTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRU5CUVZjc1JVRkJSU3haUVVGTExFVkJRVVVzVVVGQlJ5eEZRVUZGTEZWQlFVa3NSVUZCUlN4alFVRk5MRVZCUVVVc1kwRkJUU3hGUVVGRkxGbEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTjBTU3hOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOd1FpeExRVUZMTEZsQlFWa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRuUWtGRGVrSXNTVUZCVFN4SlFVRkpMRWRCUVZNc1NVRkJTU3hKUVVGSkxFTkJRekZDTEZOQlFWTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxGTkJRVk1zUTBGQlF5eFZRVUZWTEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1JVRkJSU3hUUVVGVExFTkJRVU1zVlVGQlZTeERRVUZETEVkQlFVY3NSVUZEYmtZc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzVTBGQlV5eERRVUZETEZWQlFWVXNRMEZCUXl4TlFVRk5MRVZCUVVVc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlF5OUhMRU5CUVVNN1owSkJRMFlzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNSVUZCUlN4RFFVRkRPMWxCUTNSRExFTkJRVU03V1VGRFJDeExRVUZMTEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJRenRuUWtGRE1VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU03V1VGRGNrSXNRMEZCUXp0WlFVTkVMRXRCUVVzc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETzJkQ1FVTXhRaXd5UlVGQk1rVTdaMEpCUXpORkxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5tTEUxQlFVMHNRMEZCUXl4M1FrRkJWU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVU03WjBKQlEyaEdMRU5CUVVNN1owSkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdiMEpCUTFBc1RVRkJUU3hEUVVGRExIZENRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVU03WjBKQlF6bEZMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRMFFzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTWtKQlFYbENMRWxCUVVrc1EwRkJReXhMUVVGTExFMUJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTjZSQ3hEUVVGRE8xRkJRMGdzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN096czdPenM3VDBGUlJ6dEpRVU5KTEcxRFFVRm5RaXhIUVVGMlFpeFZRVUYzUWl4SlFVRlZMRVZCUVVVc1MwRkJiMEk3VVVGRGRrUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zYlVKQlFWVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETlVRc1EwRkJRenRKUVVWRU96czdPenM3T3p0UFFWRkhPMGxCUTBrc2IwTkJRV2xDTEVkQlFYaENMRlZCUVhsQ0xFbEJRVlVzUlVGQlJTeExRVUZ2UWp0UlFVTjRSQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4dFFrRkJWU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVNM1JDeERRVUZETzBsQmIwSk5MSEZEUVVGclFpeEhRVUY2UWl4VlFVTkRMRU5CUVhWQ0xFVkJRVVVzUTBGQmIwSXNSVUZCUlN4SFFVRlpMRVZCUVVVc1NVRkJZU3hGUVVGRkxFMUJRV1VzUlVGQlJTeE5RVUZsTEVWQlFVVXNTMEZCWXl4RlFVRkZMRU5CUVZjN1VVRkZla2tzU1VGQlNTeFBRVUZ0UWl4RFFVRkRPMUZCUTNoQ0xFbEJRVWtzV1VGQldTeEhRVUZaTEVsQlFVa3NRMEZCUXp0UlFVTnFReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFWa3NiVUpCUVZVc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE4wSXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVOYUxGbEJRVmtzUjBGQlJ5eERRVUZETEVOQlFVTXNTMEZCU3l4TFFVRkxMRWRCUVVjc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF6ZERMRU5CUVVNN1VVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5RTEU5QlFVOHNSMEZCUnl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hEUVVGWExFVkJRVVVzVVVGQlJ5eEZRVUZGTEZWQlFVa3NSVUZCUlN4alFVRk5MRVZCUVVVc1kwRkJUU3hGUVVGRkxGbEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTTdXVUZETlVZc1dVRkJXU3hIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEV0QlFVc3NSMEZCUnl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRE4wTXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNCQ0xFdEJRVXNzV1VGQldTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMmRDUVVONlFpeE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRPMWxCUTJoQ0xFTkJRVU03V1VGRFJDeExRVUZMTEZsQlFWa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJRenRuUWtGRE1VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFpRVU40UWl4RFFVRkRPMWxCUTBRc1MwRkJTeXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdaMEpCUXpGQ0xFMUJRVTBzUTBGQlF5eDNRa0ZCVlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTlCUVU4c1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF6dFpRVU01UlN4RFFVRkRPMWxCUTBRc01FSkJRVEJDTzFsQlF6RkNPMmRDUVVORExIZENRVUYzUWp0blFrRkRlRUlzTUVKQlFUQkNPMmRDUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc01rSkJRWGxDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRTFCUVVjc1EwRkJReXhEUVVGRE8yZENRVU42UkN4RFFVRkRPMUZCUTBnc1EwRkJRenRKUVVOR0xFTkJRVU03U1VFMFFrMHNiME5CUVdsQ0xFZEJRWGhDTEZWQlFYbENMRk5CUVRoQ0xFVkJRVVVzUjBGQmVVTTdVVUZCZWtNc2JVSkJRWGxETEVkQlFYcERMRTFCUVhWQ0xEWkNRVUZsTEVOQlFVTXNSVUZCUlR0UlFVTnFSeXhKUVVGTkxFdEJRVXNzUjBGQmIwSXNRMEZCUXl4SFFVRkhMRXRCUVVzc05rSkJRV1VzUTBGQlF5eEpRVUZKTEVkQlFVY3NOa0pCUVdVc1EwRkJReXhKUVVGSkxFZEJRVWNzTmtKQlFXVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVNeFJ5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzV1VGQldTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRla01zUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4VFFVRlRMRXRCUVVzc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtNc1RVRkJUU3hEUVVGRExIZENRVUZWTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4dFFrRkJWU3hEUVVGRExGTkJRVk1zUTBGQlF5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJRenRaUVVOMFJ5eERRVUZETzFsQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJRMUFzVFVGQlRTeERRVUZETEhkQ1FVRlZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1UwRkJVeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzFsQlF6TkZMRU5CUVVNN1VVRkRSaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEVUN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRE8xRkJRMnhDTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NNa0pCUVZFc1IwRkJaanRSUVVORExFbEJRVWtzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVONlFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFdEJRVXNzV1VGQldTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRla01zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJFTXNUVUZCVFN4SlFVRkpMR05CUVdNc1EwRkJRenRaUVVNeFFpeERRVUZETzFGQlEwWXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRFppeERRVUZETzBsQlJVUTdPMDlCUlVjN1NVRkRTQ3d3UWtGQlR5eEhRVUZRTzFGQlEwTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVkQlFVY3NSMEZCUnl4RFFVRkRPMGxCUXpsRExFTkJRVU03U1VGRlJEczdPenRQUVVsSE8wbEJRMWNzZFVKQlFXTXNSMEZCTlVJc1ZVRkJOa0lzVFVGQll6dFJRVU14UXl4SlFVRk5MRWxCUVVrc1IwRkJSeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRM1JETEVsQlFVMHNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU5vUkN4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYkVRc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhIUVVGSExFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8wbEJRMnBJTEVOQlFVTTdTVUZGUkRzN096dFBRVWxITzBsQlExY3NkVUpCUVdNc1IwRkJOVUlzVlVGQk5rSXNRMEZCVXp0UlFVTnlReXhKUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1VVRkRia0lzV1VGQldUdFJRVU5hTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOV0xFTkJRVU03VVVGRFJDd3dSRUZCTUVRN1VVRkRNVVFzWjBKQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eFpRVUZaTEVOQlFVTXNSVUZCUlN3MFFrRkJORUlzUjBGQlJ5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRlRWNzU1VGQlRTeEpRVUZKTEVkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU53UkN4SlFVRk5MRXRCUVVzc1IwRkJWeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYmtRc1NVRkJTU3hQUVVGUExFZEJRVmNzUTBGQlF5eERRVUZETzFGQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOd1FpeFBRVUZQTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRM2hETEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRek5DTEU5QlFVOHNSMEZCUnl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGVFTXNRMEZCUXp0UlFVTkVMR2RDUVVGTkxFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNTVUZCU1N4TFFVRkxMRWRCUVVjc1JVRkJSU3hGUVVGRkxESkRRVUV5UXl4RFFVRkRMRU5CUVVNN1VVRkRPVVVzVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRXRCUVVzc1IwRkJSeXhGUVVGRkxFZEJRVWNzVDBGQlR5eERRVUZETEVOQlFVTTdTVUZEZEVNc1EwRkJRenRKUVZGRU96czdPMDlCU1VjN1NVRkRXU3h6UWtGQllTeEhRVUUxUWl4VlFVRTJRaXhKUVVGWkxFVkJRVVVzUjBGQldUdFJRVU4wUkN4SlFVRk5MRWRCUVVjc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eEhRVUZITEVkQlFVY3NUVUZCVFN4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRE8xRkJRemxETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTFRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVNM1FpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hKUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU03V1VGRGJFTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEZWtJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5XTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlExa3NlVUpCUVdkQ0xFZEJRUzlDTEZWQlFXZERMRU5CUVZNN1VVRkRlRU1zU1VGQlRTeERRVUZETEVkQlFWY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xRkJRek5DTEdkQ1FVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlFVVXNPRUpCUVRoQ0xFTkJRVU1zUTBGQlF6dFJRVU55UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjJRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExWXNRMEZCUXp0UlFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMFFpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRPMUZCUTJwQ0xFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExHVkJRV1VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRlRU1zWjBKQlFXZENPMWxCUTJoQ0xIbERRVUY1UXp0WlFVTjZReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETlVRc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNlVUpCUVhsQ08xbEJRM3BDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZqTEhkQ1FVRmxMRWRCUVRsQ0xGVkJRU3RDTEVOQlFWTTdVVUZEZGtNc1NVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTI1Q0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOc1JTeERRVUZETzBsQk4wTkVPenRQUVVWSE8wbEJRMWtzWlVGQlRTeEhRVUZyUXl4RlFVRkZMRU5CUVVNN1NVRXlRek5FTEdWQlFVTTdRVUZCUkN4RFFVRkRMRUZCYW1oQ1JDeEpRV2xvUWtNN1FVRnFhRUpaTEdkQ1FVRlJMRmRCYVdoQ2NFSXNRMEZCUVNKOSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUb2tlbml6ZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgdG9rZW5pemVyXHJcbiAgICAgKiBAcGFyYW0gX2Zvcm1hdFN0cmluZyAob3B0aW9uYWwpIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUb2tlbml6ZXIoX2Zvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2Zvcm1hdFN0cmluZyA9IF9mb3JtYXRTdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgbmV3IHN0cmluZyB0byB1c2UgZm9yIGZvcm1hdHRpbmdcclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5zZXRGb3JtYXRTdHJpbmcgPSBmdW5jdGlvbiAoZm9ybWF0U3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fZm9ybWF0U3RyaW5nID0gZm9ybWF0U3RyaW5nO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kIGEgbmV3IHRva2VuIHRvIHRoZSBjdXJyZW50IGxpc3Qgb2YgdG9rZW5zLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB0b2tlblN0cmluZyBUaGUgc3RyaW5nIHRoYXQgbWFrZXMgdXAgdGhlIHRva2VuXHJcbiAgICAgKiBAcGFyYW0gdG9rZW5BcnJheSBUaGUgZXhpc3RpbmcgYXJyYXkgb2YgdG9rZW5zXHJcbiAgICAgKiBAcGFyYW0gcmF3IChvcHRpb25hbCkgSWYgdHJ1ZSwgZG9uJ3QgcGFyc2UgdGhlIHRva2VuIGJ1dCBpbnNlcnQgaXQgYXMgaXNcclxuICAgICAqIEByZXR1cm4gVG9rZW5bXSBUaGUgcmVzdWx0aW5nIGFycmF5IG9mIHRva2Vucy5cclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5fYXBwZW5kVG9rZW4gPSBmdW5jdGlvbiAodG9rZW5TdHJpbmcsIHRva2VuQXJyYXksIHJhdykge1xyXG4gICAgICAgIGlmICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCFyYXcpIHtcclxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgPSBtYXBTeW1ib2xUb1R5cGUodG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2tlbkFycmF5LnB1c2godG9rZW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9rZW5BcnJheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBpbnRlcm5hbCBzdHJpbmcgYW5kIHJldHVybiBhbiBhcnJheSBvZiB0b2tlbnMuXHJcbiAgICAgKiBAcmV0dXJuIFRva2VuW11cclxuICAgICAqL1xyXG4gICAgVG9rZW5pemVyLnByb3RvdHlwZS5wYXJzZVRva2VucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICAgICAgdmFyIHByZXZpb3VzQ2hhciA9IFwiXCI7XHJcbiAgICAgICAgdmFyIHF1b3RpbmcgPSBmYWxzZTtcclxuICAgICAgICB2YXIgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZm9ybWF0U3RyaW5nLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q2hhciA9IHRoaXMuX2Zvcm1hdFN0cmluZ1tpXTtcclxuICAgICAgICAgICAgLy8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICghcXVvdGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBcIidcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF5YmUgZXNjYXBpbmcsIHdhaXQgZm9yIG5leHQgdG9rZW4gaWYgd2UgYXJlIGVzY2FwaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghcG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgY2hhcmFjdGVyIGlzIHJlbGV2YW50LCBzbyBzYXZlIGl0IGZvciBpbnNwZWN0aW5nIG5leHQgcm91bmRcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgIHF1b3RpbmcgPSAhcXVvdGluZztcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCAhcXVvdGluZyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChxdW90aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBRdW90aW5nIG1vZGUsIGFkZCBjaGFyYWN0ZXIgdG8gdG9rZW4uXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsIHF1b3RpbmcpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFRva2VuaXplcjtcclxufSgpKTtcclxuZXhwb3J0cy5Ub2tlbml6ZXIgPSBUb2tlbml6ZXI7XHJcbi8qKlxyXG4gKiBEaWZmZXJlbnQgdHlwZXMgb2YgdG9rZW5zLCBlYWNoIGZvciBhIERhdGVUaW1lIFwicGVyaW9kIHR5cGVcIiAobGlrZSB5ZWFyLCBtb250aCwgaG91ciBldGMuKVxyXG4gKi9cclxuKGZ1bmN0aW9uIChEYXRlVGltZVRva2VuVHlwZSkge1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJJREVOVElUWVwiXSA9IDBdID0gXCJJREVOVElUWVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJFUkFcIl0gPSAxXSA9IFwiRVJBXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIllFQVJcIl0gPSAyXSA9IFwiWUVBUlwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJRVUFSVEVSXCJdID0gM10gPSBcIlFVQVJURVJcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiTU9OVEhcIl0gPSA0XSA9IFwiTU9OVEhcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiV0VFS1wiXSA9IDVdID0gXCJXRUVLXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkRBWVwiXSA9IDZdID0gXCJEQVlcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiV0VFS0RBWVwiXSA9IDddID0gXCJXRUVLREFZXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkRBWVBFUklPRFwiXSA9IDhdID0gXCJEQVlQRVJJT0RcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiSE9VUlwiXSA9IDldID0gXCJIT1VSXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIk1JTlVURVwiXSA9IDEwXSA9IFwiTUlOVVRFXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIlNFQ09ORFwiXSA9IDExXSA9IFwiU0VDT05EXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIlpPTkVcIl0gPSAxMl0gPSBcIlpPTkVcIjtcclxufSkoZXhwb3J0cy5EYXRlVGltZVRva2VuVHlwZSB8fCAoZXhwb3J0cy5EYXRlVGltZVRva2VuVHlwZSA9IHt9KSk7XHJcbnZhciBEYXRlVGltZVRva2VuVHlwZSA9IGV4cG9ydHMuRGF0ZVRpbWVUb2tlblR5cGU7XHJcbnZhciBzeW1ib2xNYXBwaW5nID0ge1xyXG4gICAgXCJHXCI6IERhdGVUaW1lVG9rZW5UeXBlLkVSQSxcclxuICAgIFwieVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJZXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcInVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwiVVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJyXCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcIlFcIjogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcclxuICAgIFwicVwiOiBEYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSLFxyXG4gICAgXCJNXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJMXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJsXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG4gICAgXCJ3XCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcbiAgICBcIldcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuICAgIFwiZFwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcIkRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG4gICAgXCJGXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuICAgIFwiZ1wiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcIkVcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuICAgIFwiZVwiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG4gICAgXCJjXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcbiAgICBcImFcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG4gICAgXCJoXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcIkhcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwia1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJLXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcImpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwiSlwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJtXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1JTlVURSxcclxuICAgIFwic1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcbiAgICBcIlNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG4gICAgXCJBXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuICAgIFwielwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJaXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIk9cIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwidlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJWXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcIlhcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwieFwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FXHJcbn07XHJcbi8qKlxyXG4gKiBNYXAgdGhlIGdpdmVuIHN5bWJvbCB0byBvbmUgb2YgdGhlIERhdGVUaW1lVG9rZW5UeXBlc1xyXG4gKiBJZiB0aGVyZSBpcyBubyBtYXBwaW5nLCBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSBpcyB1c2VkXHJcbiAqXHJcbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHNpbmdsZS1jaGFyYWN0ZXIgc3ltYm9sIHVzZWQgdG8gbWFwIHRoZSB0b2tlblxyXG4gKiBAcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlIFRoZSBUeXBlIG9mIHRva2VuIHRoaXMgc3ltYm9sIHJlcHJlc2VudHNcclxuICovXHJcbmZ1bmN0aW9uIG1hcFN5bWJvbFRvVHlwZShzeW1ib2wpIHtcclxuICAgIGlmIChzeW1ib2xNYXBwaW5nLmhhc093blByb3BlcnR5KHN5bWJvbCkpIHtcclxuICAgICAgICByZXR1cm4gc3ltYm9sTWFwcGluZ1tzeW1ib2xdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRHOXJaVzR1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDNSdmEyVnVMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPMGRCU1VjN1FVRkZTQ3haUVVGWkxFTkJRVU03UVVGRllqdEpRVVZET3pzN1QwRkhSenRKUVVOSUxHMUNRVUZ2UWl4aFFVRnpRanRSUVVGMFFpeHJRa0ZCWVN4SFFVRmlMR0ZCUVdFc1EwRkJVenRKUVVVeFF5eERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGdzYlVOQlFXVXNSMEZCWml4VlFVRm5RaXhaUVVGdlFqdFJRVU51UXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExGbEJRVmtzUTBGQlF6dEpRVU51UXl4RFFVRkRPMGxCUlVRN096czdPenM3VDBGUFJ6dEpRVU5MTEdkRFFVRlpMRWRCUVhCQ0xGVkJRWEZDTEZkQlFXMUNMRVZCUVVVc1ZVRkJiVUlzUlVGQlJTeEhRVUZoTzFGQlF6TkZMRVZCUVVVc1EwRkJReXhEUVVGRExGZEJRVmNzUzBGQlN5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNoQ0xFbEJRVTBzUzBGQlN5eEhRVUZWTzJkQ1FVTndRaXhOUVVGTkxFVkJRVVVzVjBGQlZ5eERRVUZETEUxQlFVMDdaMEpCUXpGQ0xFZEJRVWNzUlVGQlJTeFhRVUZYTzJkQ1FVTm9RaXhOUVVGTkxFVkJRVVVzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRkRUlzU1VGQlNTeEZRVUZGTEdsQ1FVRnBRaXhEUVVGRExGRkJRVkU3WVVGRGFFTXNRMEZCUXp0WlFVVkdMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRWaXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEdWQlFXVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRE5VTXNRMEZCUXp0WlFVTkVMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdVVUZEZUVJc1EwRkJRenRSUVVORUxFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTTdTVUZEYmtJc1EwRkJRenRKUVVWRU96czdUMEZIUnp0SlFVTklMQ3RDUVVGWExFZEJRVmc3VVVGRFF5eEpRVUZKTEUxQlFVMHNSMEZCV1N4RlFVRkZMRU5CUVVNN1VVRkZla0lzU1VGQlNTeFpRVUZaTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUXpsQ0xFbEJRVWtzV1VGQldTeEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVTTVRaXhKUVVGSkxFOUJRVThzUjBGQldTeExRVUZMTEVOQlFVTTdVVUZETjBJc1NVRkJTU3huUWtGQlowSXNSMEZCV1N4TFFVRkxMRU5CUVVNN1VVRkZkRU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETzFsQlEzQkVMRWxCUVUwc1YwRkJWeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkZNVU1zT0VKQlFUaENPMWxCUXpsQ0xFVkJRVVVzUTBGQlF5eERRVUZETEZkQlFWY3NTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU42UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTJRc1JVRkJSU3hEUVVGRExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU4wUWl3clEwRkJLME03ZDBKQlF5OURMRVZCUVVVc1EwRkJReXhEUVVGRExGZEJRVmNzUzBGQlN5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRPelJDUVVOc1F5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhaUVVGWkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdORUpCUTJwRUxGbEJRVmtzUjBGQlJ5eEZRVUZGTEVOQlFVTTdkMEpCUTI1Q0xFTkJRVU03ZDBKQlEwUXNXVUZCV1N4SlFVRkpMRWRCUVVjc1EwRkJRenQzUWtGRGNFSXNaMEpCUVdkQ0xFZEJRVWNzUzBGQlN5eERRVUZETzI5Q1FVTXhRaXhEUVVGRE8yOUNRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2RDUVVOUUxHZENRVUZuUWl4SFFVRkhMRWxCUVVrc1EwRkJRenR2UWtGRGVrSXNRMEZCUXp0blFrRkRSaXhEUVVGRE8yZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOUUxEWkZRVUUyUlR0dlFrRkROMFVzUlVGQlJTeERRVUZETEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjBRaXdyUWtGQkswSTdkMEpCUXk5Q0xGbEJRVmtzU1VGQlNTeFhRVUZYTEVOQlFVTTdkMEpCUXpWQ0xHZENRVUZuUWl4SFFVRkhMRXRCUVVzc1EwRkJRenR2UWtGRE1VSXNRMEZCUXp0dlFrRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dDNRa0ZEVUN4NVJFRkJlVVE3ZDBKQlEzcEVMR2RDUVVGblFpeEhRVUZITEVsQlFVa3NRMEZCUXp0dlFrRkRla0lzUTBGQlF6dG5Ra0ZGUml4RFFVRkRPMmRDUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTjJRaXh6UlVGQmMwVTdiMEpCUTNSRkxGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdaMEpCUXpWQ0xFTkJRVU03WjBKQlEwUXNVVUZCVVN4RFFVRkRPMWxCUTFZc1EwRkJRenRaUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4blFrRkJaMElzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpkQ0xFOUJRVThzUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXp0blFrRkRia0lzWjBKQlFXZENMRWRCUVVjc1MwRkJTeXhEUVVGRE8yZENRVVY2UWl4elFrRkJjMEk3WjBKQlEzUkNMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZsQlFWa3NSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZETTBRc1dVRkJXU3hIUVVGSExFVkJRVVVzUTBGQlF6dFpRVU51UWl4RFFVRkRPMWxCUlVRc1JVRkJSU3hEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRZaXgzUTBGQmQwTTdaMEpCUTNoRExGbEJRVmtzU1VGQlNTeFhRVUZYTEVOQlFVTTdaMEpCUXpWQ0xGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdaMEpCUXpOQ0xGRkJRVkVzUTBGQlF6dFpRVU5XTEVOQlFVTTdXVUZGUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFdEJRVXNzV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRiRU1zWjBOQlFXZERPMmRDUVVOb1F5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhaUVVGWkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdaMEpCUTJwRUxGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdXVUZETlVJc1EwRkJRenRaUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTlFMR3RFUVVGclJEdG5Ra0ZEYkVRc1dVRkJXU3hKUVVGSkxGZEJRVmNzUTBGQlF6dFpRVU0zUWl4RFFVRkRPMWxCUlVRc1dVRkJXU3hIUVVGSExGZEJRVmNzUTBGQlF6dFJRVU0xUWl4RFFVRkRPMUZCUTBRc2IwUkJRVzlFTzFGQlEzQkVMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZsQlFWa3NSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRk1VUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVU03U1VGRlJpeG5Ra0ZCUXp0QlFVRkVMRU5CUVVNc1FVRXhTRVFzU1VFd1NFTTdRVUV4U0Zrc2FVSkJRVk1zV1VFd1NISkNMRU5CUVVFN1FVRkZSRHM3UjBGRlJ6dEJRVU5JTEZkQlFWa3NhVUpCUVdsQ08wbEJRelZDTEdsRlFVRlJMRU5CUVVFN1NVRkZVaXgxUkVGQlJ5eERRVUZCTzBsQlEwZ3NlVVJCUVVrc1EwRkJRVHRKUVVOS0xDdEVRVUZQTEVOQlFVRTdTVUZEVUN3eVJFRkJTeXhEUVVGQk8wbEJRMHdzZVVSQlFVa3NRMEZCUVR0SlFVTktMSFZFUVVGSExFTkJRVUU3U1VGRFNDd3JSRUZCVHl4RFFVRkJPMGxCUTFBc2JVVkJRVk1zUTBGQlFUdEpRVU5VTEhsRVFVRkpMRU5CUVVFN1NVRkRTaXc0UkVGQlRTeERRVUZCTzBsQlEwNHNPRVJCUVUwc1EwRkJRVHRKUVVOT0xEQkVRVUZKTEVOQlFVRTdRVUZEVEN4RFFVRkRMRVZCWmxjc2VVSkJRV2xDTEV0QlFXcENMSGxDUVVGcFFpeFJRV1UxUWp0QlFXWkVMRWxCUVZrc2FVSkJRV2xDTEVkQlFXcENMSGxDUVdWWUxFTkJRVUU3UVVFeVFrUXNTVUZCVFN4aFFVRmhMRWRCUVRCRE8wbEJRelZFTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEhRVUZITzBsQlJURkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJSVE5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eFBRVUZQTzBsQlF6bENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4UFFVRlBPMGxCUlRsQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhMUVVGTE8wbEJRelZDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eExRVUZMTzBsQlF6VkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4TFFVRkxPMGxCUlRWQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlJUTkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SFFVRkhPMGxCUXpGQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhIUVVGSE8wbEJRekZDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEhRVUZITzBsQlF6RkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SFFVRkhPMGxCUlRGQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhQUVVGUE8wbEJRemxDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eFBRVUZQTzBsQlF6bENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4UFFVRlBPMGxCUlRsQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhUUVVGVE8wbEJSV2hETEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJSVE5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eE5RVUZOTzBsQlJUZENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4TlFVRk5PMGxCUXpkQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhOUVVGTk8wbEJRemRDTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eE5RVUZOTzBsQlJUZENMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPMGxCUXpOQ0xFZEJRVWNzUlVGQlJTeHBRa0ZCYVVJc1EwRkJReXhKUVVGSk8wbEJRek5DTEVkQlFVY3NSVUZCUlN4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTzBsQlF6TkNMRWRCUVVjc1JVRkJSU3hwUWtGQmFVSXNRMEZCUXl4SlFVRkpPME5CUXpOQ0xFTkJRVU03UVVGRlJqczdPenM3TzBkQlRVYzdRVUZEU0N4NVFrRkJlVUlzVFVGQll6dEpRVU4wUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhoUVVGaExFTkJRVU1zWTBGQll5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNeFF5eE5RVUZOTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wbEJRemxDTEVOQlFVTTdTVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOUUxFMUJRVTBzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhSUVVGUkxFTkJRVU03U1VGRGJrTXNRMEZCUXp0QlFVTkdMRU5CUVVNaWZRPT0iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRvVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiWWVhclwiXSA9IDBdID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibWF4XCJcclxuICAgICAqL1xyXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcclxufSkoZXhwb3J0cy5Ub1R5cGUgfHwgKGV4cG9ydHMuVG9UeXBlID0ge30pKTtcclxudmFyIFRvVHlwZSA9IGV4cG9ydHMuVG9UeXBlO1xyXG4vKipcclxuICogVHlwZSBvZiBydWxlIE9OIGNvbHVtbiB2YWx1ZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChPblR5cGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiRGF5TnVtXCJdID0gMF0gPSBcIkRheU51bVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkxhc3RYXCJdID0gMV0gPSBcIkxhc3RYXCI7XHJcbiAgICAvKipcclxuICAgICAqIGUuZy4gXCJTdW4+PThcIlxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiR3JlcVhcIl0gPSAyXSA9IFwiR3JlcVhcIjtcclxuICAgIC8qKlxyXG4gICAgICogZS5nLiBcIlN1bjw9OFwiXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJMZXFYXCJdID0gM10gPSBcIkxlcVhcIjtcclxufSkoZXhwb3J0cy5PblR5cGUgfHwgKGV4cG9ydHMuT25UeXBlID0ge30pKTtcclxudmFyIE9uVHlwZSA9IGV4cG9ydHMuT25UeXBlO1xyXG4oZnVuY3Rpb24gKEF0VHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBMb2NhbCB0aW1lIChubyBEU1QpXHJcbiAgICAgKi9cclxuICAgIEF0VHlwZVtBdFR5cGVbXCJTdGFuZGFyZFwiXSA9IDBdID0gXCJTdGFuZGFyZFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXHJcbiAgICAgKi9cclxuICAgIEF0VHlwZVtBdFR5cGVbXCJXYWxsXCJdID0gMV0gPSBcIldhbGxcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXRjIHRpbWVcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlV0Y1wiXSA9IDJdID0gXCJVdGNcIjtcclxufSkoZXhwb3J0cy5BdFR5cGUgfHwgKGV4cG9ydHMuQXRUeXBlID0ge30pKTtcclxudmFyIEF0VHlwZSA9IGV4cG9ydHMuQXRUeXBlO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbnZhciBSdWxlSW5mbyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSdWxlSW5mbyhcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuICAgICAgICAgKiBOb3RlLCBjYW4gYmUgLTEwMDAwIGZvciBOYU4gdmFsdWUgKGUuZy4gZm9yIFwiU3lzdGVtVlwiIHJ1bGVzKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZyb20sIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvVHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgVE8gY29sdW1uIGlzIGEgeWVhciwgdGhlIHllYXIgbnVtYmVyLiBJZiBUTyBjb2x1bW4gaXMgXCJvbmx5XCIsIHRoZSBGUk9NIHllYXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9ZZWFyLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW5Nb250aCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT04gY29sdW1uIHR5cGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblR5cGUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25EYXksIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uV2Vla0RheSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIGhvdXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdEhvdXIsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFUIGNvbHVtbiBtaW51dGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdE1pbnV0ZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIHNlY29uZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0U2Vjb25kLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gdHlwZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0VHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2F2ZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG4gICAgICAgICAqIE5vdGUgaWYgVFogZGF0YWJhc2UgaW5kaWNhdGVzIFwiLVwiIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldHRlcikge1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50b1R5cGUgPSB0b1R5cGU7XHJcbiAgICAgICAgdGhpcy50b1llYXIgPSB0b1llYXI7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmluTW9udGggPSBpbk1vbnRoO1xyXG4gICAgICAgIHRoaXMub25UeXBlID0gb25UeXBlO1xyXG4gICAgICAgIHRoaXMub25EYXkgPSBvbkRheTtcclxuICAgICAgICB0aGlzLm9uV2Vla0RheSA9IG9uV2Vla0RheTtcclxuICAgICAgICB0aGlzLmF0SG91ciA9IGF0SG91cjtcclxuICAgICAgICB0aGlzLmF0TWludXRlID0gYXRNaW51dGU7XHJcbiAgICAgICAgdGhpcy5hdFNlY29uZCA9IGF0U2Vjb25kO1xyXG4gICAgICAgIHRoaXMuYXRUeXBlID0gYXRUeXBlO1xyXG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuc2F2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmFwcGxpY2FibGUgPSBmdW5jdGlvbiAoeWVhcikge1xyXG4gICAgICAgIGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnRvVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5NYXg6IHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5ZZWFyOiByZXR1cm4gKHllYXIgPD0gdGhpcy50b1llYXIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNvcnQgY29tcGFyaXNvblxyXG4gICAgICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgbGVzcyB0aGFuIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVMZXNzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmZyb20gPiBvdGhlci5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pIDwgb3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gTm90ZSB0aGF0IHRoZSB0aW1lXHJcbiAgICAgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcbiAgICAgKiBub3QgdGFrZW4gaW50byBhY2NvdW50XHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG4gICAgICAgIC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG4gICAgICAgIHZhciB0bSA9IHsgeWVhcjogeWVhciwgbW9udGg6IHRoaXMuaW5Nb250aCB9O1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkYXlcclxuICAgICAgICBzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0bS5kYXkgPSB0aGlzLm9uRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRpbWVcclxuICAgICAgICB0bS5ob3VyID0gdGhpcy5hdEhvdXI7XHJcbiAgICAgICAgdG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuICAgICAgICB0bS5zZWNvbmQgPSB0aGlzLmF0U2Vjb25kO1xyXG4gICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0bSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZm9yIHdoaWNoIHRvIHJldHVybiB0aGUgdHJhbnNpdGlvblxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1RcclxuICAgICAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLnRyYW5zaXRpb25UaW1lVXRjID0gZnVuY3Rpb24gKHllYXIsIHN0YW5kYXJkT2Zmc2V0LCBwcmV2UnVsZSkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgbm90IGFwcGxpY2FibGUgaW4gZ2l2ZW4geWVhclwiKTtcclxuICAgICAgICB2YXIgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS51bml4TWlsbGlzO1xyXG4gICAgICAgIC8vIGFkanVzdCBmb3IgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgICAgdmFyIG9mZnNldDtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuYXRUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLlV0YzpcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBdFR5cGUuU3RhbmRhcmQ6XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5XYWxsOlxyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZSdWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSdWxlSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5SdWxlSW5mbyA9IFJ1bGVJbmZvO1xyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbihmdW5jdGlvbiAoUnVsZVR5cGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogTm8gcnVsZSBhcHBsaWVzXHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBSdWxlVHlwZVtSdWxlVHlwZVtcIk9mZnNldFwiXSA9IDFdID0gXCJPZmZzZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiUnVsZU5hbWVcIl0gPSAyXSA9IFwiUnVsZU5hbWVcIjtcclxufSkoZXhwb3J0cy5SdWxlVHlwZSB8fCAoZXhwb3J0cy5SdWxlVHlwZSA9IHt9KSk7XHJcbnZhciBSdWxlVHlwZSA9IGV4cG9ydHMuUnVsZVR5cGU7XHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKiBGaXJzdCwgYW5kIHNvbWV3aGF0IHRyaXZpYWxseSwgd2hlcmVhcyBSdWxlcyBhcmUgY29uc2lkZXJlZCB0byBjb250YWluIG9uZSBvciBtb3JlIHJlY29yZHMsIGEgWm9uZSBpcyBjb25zaWRlcmVkIHRvXHJcbiAqIGJlIGEgc2luZ2xlIHJlY29yZCB3aXRoIHplcm8gb3IgbW9yZSBjb250aW51YXRpb24gbGluZXMuIFRodXMsIHRoZSBrZXl3b3JkLCDigJxab25lLOKAnSBhbmQgdGhlIHpvbmUgbmFtZSBhcmUgbm90IHJlcGVhdGVkLlxyXG4gKiBUaGUgbGFzdCBsaW5lIGlzIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4uXHJcbiAqIFNlY29uZCwgYW5kIG1vcmUgZnVuZGFtZW50YWxseSwgZWFjaCBsaW5lIG9mIGEgWm9uZSByZXByZXNlbnRzIGEgc3RlYWR5IHN0YXRlLCBub3QgYSB0cmFuc2l0aW9uIGJldHdlZW4gc3RhdGVzLlxyXG4gKiBUaGUgc3RhdGUgZXhpc3RzIGZyb20gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIHByZXZpb3VzIGxpbmXigJlzIFtVTlRJTF0gY29sdW1uIHVwIHRvIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBjdXJyZW50IGxpbmXigJlzXHJcbiAqIFtVTlRJTF0gY29sdW1uLiBJbiBvdGhlciB3b3JkcywgdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIFtVTlRJTF0gY29sdW1uIGlzIHRoZSBpbnN0YW50IHRoYXQgc2VwYXJhdGVzIHRoaXMgc3RhdGUgZnJvbSB0aGUgbmV4dC5cclxuICogV2hlcmUgdGhhdCB3b3VsZCBiZSBhbWJpZ3VvdXMgYmVjYXVzZSB3ZeKAmXJlIHNldHRpbmcgb3VyIGNsb2NrcyBiYWNrLCB0aGUgW1VOVElMXSBjb2x1bW4gc3BlY2lmaWVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBpbnN0YW50LlxyXG4gKiBUaGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSBsYXN0IGxpbmUsIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4sIGNvbnRpbnVlcyB0byB0aGUgcHJlc2VudC5cclxuICogVGhlIGZpcnN0IGxpbmUgdHlwaWNhbGx5IHNwZWNpZmllcyB0aGUgbWVhbiBzb2xhciB0aW1lIG9ic2VydmVkIGJlZm9yZSB0aGUgaW50cm9kdWN0aW9uIG9mIHN0YW5kYXJkIHRpbWUuIFNpbmNlIHRoZXJl4oCZcyBubyBsaW5lIGJlZm9yZVxyXG4gKiB0aGF0LCBpdCBoYXMgbm8gYmVnaW5uaW5nLiA4LSkgRm9yIHNvbWUgcGxhY2VzIG5lYXIgdGhlIEludGVybmF0aW9uYWwgRGF0ZSBMaW5lLCB0aGUgZmlyc3QgdHdvIGxpbmVzIHdpbGwgc2hvdyBzb2xhciB0aW1lcyBkaWZmZXJpbmcgYnlcclxuICogMjQgaG91cnM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBtb3ZlbWVudCBvZiB0aGUgRGF0ZSBMaW5lLiBGb3IgZXhhbXBsZTpcclxuICogIyBab25lXHROQU1FXHRcdEdNVE9GRlx0UlVMRVNcdEZPUk1BVFx0W1VOVElMXVxyXG4gKiBab25lIEFtZXJpY2EvSnVuZWF1XHQgMTU6MDI6MTkgLVx0TE1UXHQxODY3IE9jdCAxOFxyXG4gKiBcdFx0XHQgLTg6NTc6NDEgLVx0TE1UXHQuLi5cclxuICogV2hlbiBBbGFza2Egd2FzIHB1cmNoYXNlZCBmcm9tIFJ1c3NpYSBpbiAxODY3LCB0aGUgRGF0ZSBMaW5lIG1vdmVkIGZyb20gdGhlIEFsYXNrYS9DYW5hZGEgYm9yZGVyIHRvIHRoZSBCZXJpbmcgU3RyYWl0OyBhbmQgdGhlIHRpbWUgaW5cclxuICogQWxhc2thIHdhcyB0aGVuIDI0IGhvdXJzIGVhcmxpZXIgdGhhbiBpdCBoYWQgYmVlbi4gPGFzaWRlPig2IE9jdG9iZXIgaW4gdGhlIEp1bGlhbiBjYWxlbmRhciwgd2hpY2ggUnVzc2lhIHdhcyBzdGlsbCB1c2luZyB0aGVuIGZvclxyXG4gKiByZWxpZ2lvdXMgcmVhc29ucywgd2FzIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIGluc3RhbmNlIG9mIHRoZSBzYW1lIGRheSB3aXRoIGEgZGlmZmVyZW50IG5hbWUsIDE4IE9jdG9iZXIgaW4gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cclxuICogSXNu4oCZdCBjaXZpbCB0aW1lIHdvbmRlcmZ1bD8gOC0pKTwvYXNpZGU+XHJcbiAqIFRoZSBhYmJyZXZpYXRpb24sIOKAnExNVCzigJ0gc3RhbmRzIGZvciDigJxsb2NhbCBtZWFuIHRpbWUs4oCdIHdoaWNoIGlzIGFuIGludmVudGlvbiBvZiB0aGUgdHogZGF0YWJhc2UgYW5kIHdhcyBwcm9iYWJseSBuZXZlciBhY3R1YWxseVxyXG4gKiB1c2VkIGR1cmluZyB0aGUgcGVyaW9kLiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlIGlzIGFsbW9zdCBjZXJ0YWlubHkgd3JvbmcgZXhjZXB0IGluIHRoZSBhcmNoZXR5cGFsIHBsYWNlIGFmdGVyIHdoaWNoIHRoZSB6b25lIGlzIG5hbWVkLlxyXG4gKiAoVGhlIHR6IGRhdGFiYXNlIHVzdWFsbHkgZG9lc27igJl0IHByb3ZpZGUgYSBzZXBhcmF0ZSBab25lIHJlY29yZCBmb3IgcGxhY2VzIHdoZXJlIG5vdGhpbmcgc2lnbmlmaWNhbnQgaGFwcGVuZWQgYWZ0ZXIgMTk3MC4pXHJcbiAqL1xyXG52YXIgWm9uZUluZm8gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gWm9uZUluZm8oXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xyXG4gICAgICAgICAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG4gICAgICAgICAqIGl0IGlzIG9uZSBob3VyIGFoZWFkIG9mIFVUQ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdtdG9mZiwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG4gICAgICAgICAqIEEgaHlwaGVuLCBhIGtpbmQgb2YgbnVsbCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBoYXZlIG5vdCBzZXQgb3VyIGNsb2NrcyBhaGVhZCBvZiBzdGFuZGFyZCB0aW1lLlxyXG4gICAgICAgICAqIEFuIGFtb3VudCBvZiB0aW1lICh1c3VhbGx5IGJ1dCBub3QgbmVjZXNzYXJpbHkg4oCcMTowMOKAnSBtZWFuaW5nIG9uZSBob3VyKSBtZWFucyB0aGF0IHdlIGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQgYnkgdGhhdCBhbW91bnQuXHJcbiAgICAgICAgICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcbiAgICAgICAgICogdGhlIG5hbWUgb2Ygd2hpY2ggaXMgdGhlIGdpdmVuIGFscGhhYmV0aWMgc3RyaW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVUeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBydWxlT2Zmc2V0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVOYW1lLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG4gICAgICAgICAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxyXG4gICAgICAgICAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAgICAgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcbiAgICAgICAgICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXHJcbiAgICAgICAgICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvcm1hdCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG4gICAgICAgICAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXHJcbiAgICAgICAgICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSBOVUxMIChmb3IgdGhlIGZpcnN0IHJ1bGUpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdW50aWwpIHtcclxuICAgICAgICB0aGlzLmdtdG9mZiA9IGdtdG9mZjtcclxuICAgICAgICB0aGlzLnJ1bGVUeXBlID0gcnVsZVR5cGU7XHJcbiAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gcnVsZU9mZnNldDtcclxuICAgICAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XHJcbiAgICAgICAgdGhpcy51bnRpbCA9IHVudGlsO1xyXG4gICAgICAgIGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBab25lSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5ab25lSW5mbyA9IFpvbmVJbmZvO1xyXG52YXIgVHpNb250aE5hbWVzO1xyXG4oZnVuY3Rpb24gKFR6TW9udGhOYW1lcykge1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkphblwiXSA9IDFdID0gXCJKYW5cIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJGZWJcIl0gPSAyXSA9IFwiRmViXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTWFyXCJdID0gM10gPSBcIk1hclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkFwclwiXSA9IDRdID0gXCJBcHJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXlcIl0gPSA1XSA9IFwiTWF5XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVuXCJdID0gNl0gPSBcIkp1blwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1bFwiXSA9IDddID0gXCJKdWxcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJBdWdcIl0gPSA4XSA9IFwiQXVnXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiU2VwXCJdID0gOV0gPSBcIlNlcFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk9jdFwiXSA9IDEwXSA9IFwiT2N0XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTm92XCJdID0gMTFdID0gXCJOb3ZcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJEZWNcIl0gPSAxMl0gPSBcIkRlY1wiO1xyXG59KShUek1vbnRoTmFtZXMgfHwgKFR6TW9udGhOYW1lcyA9IHt9KSk7XHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWUpIHtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyArK2kpIHtcclxuICAgICAgICBpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCJcIik7XHJcbiAgICB9XHJcbn1cclxudmFyIFR6RGF5TmFtZXM7XHJcbihmdW5jdGlvbiAoVHpEYXlOYW1lcykge1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU3VuXCJdID0gMF0gPSBcIlN1blwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiTW9uXCJdID0gMV0gPSBcIk1vblwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVHVlXCJdID0gMl0gPSBcIlR1ZVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiV2VkXCJdID0gM10gPSBcIldlZFwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVGh1XCJdID0gNF0gPSBcIlRodVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiRnJpXCJdID0gNV0gPSBcIkZyaVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU2F0XCJdID0gNl0gPSBcIlNhdFwiO1xyXG59KShUekRheU5hbWVzIHx8IChUekRheU5hbWVzID0ge30pKTtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXHJcbiAqIDEsIC0xLCArMSwgMDEsIDE6MDAsIDE6MjM6MjUuMTQzXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHMpIHtcclxuICAgIHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5leHBvcnRzLmlzVmFsaWRPZmZzZXRTdHJpbmcgPSBpc1ZhbGlkT2Zmc2V0U3RyaW5nO1xyXG4vKipcclxuICogRGVmaW5lcyBhIG1vbWVudCBhdCB3aGljaCB0aGUgZ2l2ZW4gcnVsZSBiZWNvbWVzIHZhbGlkXHJcbiAqL1xyXG52YXIgVHJhbnNpdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUcmFuc2l0aW9uKFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyYW5zaXRpb24gdGltZSBpbiBVVEMgbWlsbGlzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9mZnNldCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldHRlcikge1xyXG4gICAgICAgIHRoaXMuYXQgPSBhdDtcclxuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5vZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVHJhbnNpdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5UcmFuc2l0aW9uID0gVHJhbnNpdGlvbjtcclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG4oZnVuY3Rpb24gKE5vcm1hbGl6ZU9wdGlvbikge1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiVXBcIl0gPSAwXSA9IFwiVXBcIjtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XHJcbn0pKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uIHx8IChleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IHt9KSk7XHJcbnZhciBOb3JtYWxpemVPcHRpb24gPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbjtcclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbnZhciBUekRhdGFiYXNlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVHpEYXRhYmFzZShkYXRhKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZSA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlID0ge307XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghVHpEYXRhYmFzZS5faW5zdGFuY2UsIFwiWW91IHNob3VsZCBub3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBUekRhdGFiYXNlIGNsYXNzIHlvdXJzZWxmLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS5sZW5ndGggPiAwLCBcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCIpO1xyXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gZGF0YVswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB7IHpvbmVzOiB7fSwgcnVsZXM6IHt9IH07XHJcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5rZXlzKGQucnVsZXMpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gT2JqZWN0LmtleXMoZC56b25lcyk7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfY1tfYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnpvbmVzW2tleV0gPSBkLnpvbmVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWlubWF4ID0gdmFsaWRhdGVEYXRhKHRoaXMuX2RhdGEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRhIFRaIGRhdGEgYXMgSlNPTiBvYmplY3QgKGZyb20gb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMpLlxyXG4gICAgICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5pbml0ID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtkYXRhXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5pbnN0YW5jZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbmdsZSBpbnN0YW5jZSBvZiB0aGlzIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UuaW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YV8xID0gW107XHJcbiAgICAgICAgICAgIC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xyXG4gICAgICAgICAgICB2YXIgZyA9IChnbG9iYWwgPyBnbG9iYWwgOiB3aW5kb3cpO1xyXG4gICAgICAgICAgICBpZiAoZykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5rZXlzKGcpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKFwidHpkYXRhXCIpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZ1trZXldID09PSBcIm9iamVjdFwiICYmIGdba2V5XS5ydWxlcyAmJiBnW2tleV0uem9uZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGdba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdHJ5IHRvIGZpbmQgVFogZGF0YSBhcyBpbnN0YWxsZWQgTlBNIG1vZHVsZXNcclxuICAgICAgICAgICAgdmFyIGZpbmROb2RlTW9kdWxlcyA9IGZ1bmN0aW9uIChyZXF1aXJlKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHRyeSB0emRhdGEgd2hpY2ggY29udGFpbnMgYWxsIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHpEYXRhTmFtZSA9IFwidHpkYXRhXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSByZXF1aXJlKHR6RGF0YU5hbWUpOyAvLyB1c2UgdmFyaWFibGUgdG8gYXZvaWQgYnJvd3NlcmlmeSBhY3RpbmcgdXBcclxuICAgICAgICAgICAgICAgICAgICBkYXRhXzEucHVzaChkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiB0cnkgc3Vic2V0c1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2R1bGVOYW1lcyA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYWZyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWFudGFyY3RpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYXNpYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1iYWNrd2FyZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1iYWNrd2FyZC11dGNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtZXRjZXRlcmFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtZXVyb3BlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLW5vcnRoYW1lcmljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1wYWNpZmljbmV3XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXNvdXRoYW1lcmljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1zeXN0ZW12XCJcclxuICAgICAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGlzdGluZyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ1BhdGhzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoZGF0YV8xLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGFfMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS56b25lTmFtZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl96b25lTmFtZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVOYW1lcy5zb3J0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl96b25lTmFtZXM7XHJcbiAgICB9O1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZXhpc3RzID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcbiAgICAgKlxyXG4gICAgICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm1pbkRzdFNhdmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICBpZiAoem9uZU5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBydWxlTmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnNhdmUubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1heGltdW0gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAgICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG4gICAgICpcclxuICAgICAqIFJldHVybnMgMCBpZiB6b25lTmFtZSBnaXZlbiBhbmQgbm8gRFNUIG9ic2VydmVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWF4RHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmhhc0RzdCA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XHJcbiAgICB9O1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubmV4dERzdENoYW5nZSA9IGZ1bmN0aW9uICh6b25lTmFtZSwgYSkge1xyXG4gICAgICAgIHZhciB6b25lSW5mbztcclxuICAgICAgICB2YXIgdXRjVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgLy8gZ2V0IGFsbCB6b25lIGluZm9zIGZvciBbZGF0ZSwgZGF0ZSsxeWVhcilcclxuICAgICAgICB2YXIgYWxsWm9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIHZhciByZWxldmFudFpvbmVJbmZvcyA9IFtdO1xyXG4gICAgICAgIHZhciByYW5nZVN0YXJ0ID0gdXRjVGltZS51bml4TWlsbGlzO1xyXG4gICAgICAgIHZhciByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xyXG4gICAgICAgIHZhciBwcmV2RW5kID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB6b25lSW5mbyA9IGFsbFpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKChwcmV2RW5kID09PSBudWxsIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gcmFuZ2VTdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29sbGVjdCBhbGwgdHJhbnNpdGlvbnMgaW4gdGhlIHpvbmVzIGZvciB0aGUgeWVhclxyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVsZXZhbnRab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgem9uZUluZm8gPSByZWxldmFudFpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgLy8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG4gICAgICAgICAgICB0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdCh0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmFuc2l0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBmaW5kIHRoZSBmaXJzdCBhZnRlciB0aGUgZ2l2ZW4gZGF0ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBvZmZzZXRcclxuICAgICAgICB2YXIgcHJldlNhdmUgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKCFwcmV2U2F2ZSB8fCAhcHJldlNhdmUuZXF1YWxzKHRyYW5zaXRpb24ub2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNpdGlvbi5hdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBldmVudHVhbGx5IGxpbmtzIHRvXHJcbiAgICAgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuICAgICAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVJc1V0YyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5ub3JtYWxpemVMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgYSwgb3B0KSB7XHJcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IE5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2FsVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgICAgIC8vIGxvY2FsIHRpbWVzIGJlaGF2ZSBsaWtlIHRoaXMgZHVyaW5nIERTVCBjaGFuZ2VzOlxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xyXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG4gICAgICAgICAgICAvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuICAgICAgICAgICAgLy8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgKyAxKTtcclxuICAgICAgICAgICAgLy8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcclxuICAgICAgICAgICAgdmFyIHByZXYgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQmVmb3JlID0gdHJhbnNpdGlvbi5hdCArIHByZXYubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQWZ0ZXIgPSB0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9uLWV4aXN0aW5nIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gYSA6IGEuY2xvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuICAgICAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcbiAgICAgICAgdmFyIGRzdE9mZnNldCA9IG51bGw7XHJcbiAgICAgICAgc3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xyXG4gICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gdGhpcy5kc3RPZmZzZXRGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkc3RPZmZzZXQuYWRkKHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIHJ1bGUgYWJicmV2aWF0aW9uLCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXHJcbiAgICAgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG4gICAgICogYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgYWJicmV2aWF0aW9ucy4gVGhleSBhbHNvIGNoYW5nZSB3aXRoIERTVDogZS5nLiBDRVNUIG9yIENFVC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQyB1bml4IG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG4gICAgICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5hYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQgPT09IHZvaWQgMCkgeyBkc3REZXBlbmRlbnQgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcbiAgICAgICAgdmFyIGZvcm1hdCA9IHpvbmVJbmZvLmZvcm1hdDtcclxuICAgICAgICAvLyBpcyBmb3JtYXQgZGVwZW5kZW50IG9uIERTVD9cclxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoXCIlc1wiKSAhPT0gLTFcclxuICAgICAgICAgICAgJiYgem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBsZXR0ZXIgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuICAgICAgICAgICAgaWYgKGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdGhpcy5sZXR0ZXJGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm9ybWF0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAsIGFnYWluIGV4Y2x1ZGluZyBEU1QuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxyXG4gICAgICogdGhlbiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBpcyByZXR1cm5lZC5cclxuICAgICAqXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xyXG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICBpZiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG4gICAgICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxyXG4gICAgICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS50b3RhbE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkVG0gPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XHJcbiAgICAgICAgLy8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XHJcbiAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcclxuICAgICAgICAvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXHJcbiAgICAgICAgLy8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWUsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgLSAxLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyICsgMSk7XHJcbiAgICAgICAgdmFyIHByZXYgPSBudWxsO1xyXG4gICAgICAgIHZhciBwcmV2UHJldiA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZvdW5kIG9mZnNldDogcHJldi5vZmZzZXQgYXBwbGllc1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldlByZXYgPSBwcmV2O1xyXG4gICAgICAgICAgICBwcmV2ID0gdHJhbnNpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuICAgICAgICBpZiAocHJldikge1xyXG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcclxuICAgICAgICAgICAgaWYgKHByZXZQcmV2ICYmIHByZXZQcmV2Lm9mZnNldC5ncmVhdGVyVGhhbihwcmV2Lm9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBwcmV2UHJldi5vZmZzZXQuc3ViKHByZXYub2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKClcclxuICAgICAgICAgICAgICAgICAgICAmJiBub3JtYWxpemVkVG0udW5peE1pbGxpcyA8IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKSArIGRpZmYubWlsbGlzZWNvbmRzKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGhpcyBjYW5ub3QgaGFwcGVuIGFzIHRoZSB0cmFuc2l0aW9ucyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYSB0cmFuc2l0aW9uIGF0IHRoZVxyXG4gICAgICAgICAgICAvLyBiZWdpbm5pbmcgb2YgdGhlIHJlcXVlc3RlZCBmcm9tWWVhclxyXG4gICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBEU1Qgb2Zmc2V0IChXSVRIT1VUIHRoZSBzdGFuZGFyZCB6b25lIG9mZnNldCkgZm9yIHRoZSBnaXZlblxyXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmRzdE9mZnNldEZvclJ1bGUgPSBmdW5jdGlvbiAocnVsZU5hbWUsIHV0Y1RpbWUsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIHRzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lKTtcclxuICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG4gICAgICAgIHZhciBvZmZzZXQgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCFvZmZzZXQpIHtcclxuICAgICAgICAgICAgLy8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcbiAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRpbWUgem9uZSBsZXR0ZXIgZm9yIHRoZSBnaXZlblxyXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXAgYXMgVGltZVN0cnVjdCBvciB1bml4IG1pbGxpc1xyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubGV0dGVyRm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIGxldHRlciA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCFsZXR0ZXIpIHtcclxuICAgICAgICAgICAgLy8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcbiAgICAgICAgICAgIGxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsZXR0ZXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBsaXN0IG9mIGFsbCB0cmFuc2l0aW9ucyBpbiBbZnJvbVllYXIuLnRvWWVhcl0gc29ydGVkIGJ5IGVmZmVjdGl2ZSBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHRoZSBydWxlIHNldFxyXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyLCBzdGFuZGFyZE9mZnNldCkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG4gICAgICAgIHZhciBydWxlSW5mb3MgPSB0aGlzLmdldFJ1bGVJbmZvcyhydWxlTmFtZSk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIHkgPSBmcm9tWWVhcjsgeSA8PSB0b1llYXI7IHkrKykge1xyXG4gICAgICAgICAgICB2YXIgcHJldkluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gcnVsZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihydWxlSW5mby50cmFuc2l0aW9uVGltZVV0Yyh5LCBzdGFuZGFyZE9mZnNldCwgcHJldkluZm8pLCBydWxlSW5mby5zYXZlLCBydWxlSW5mby5sZXR0ZXIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZXZJbmZvID0gcnVsZUluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cclxuICAgICAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vIHpvbmUgY2hhbmdlIHdpdGhpbiB0aGUgcmFuZ2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcbiAgICAgICAgdmFyIHN0YXJ0TWlsbGlzID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogZnJvbVllYXIgfSk7XHJcbiAgICAgICAgdmFyIGVuZE1pbGxpcyA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IHRvWWVhciArIDEgfSk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcHJldlpvbmUgPSBudWxsO1xyXG4gICAgICAgIHZhciBwcmV2VW50aWxZZWFyO1xyXG4gICAgICAgIHZhciBwcmV2U3RkT2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB2YXIgcHJldkRzdE9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgdmFyIHByZXZMZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgdmFyIHVudGlsWWVhciA9IHpvbmVJbmZvLnVudGlsID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoem9uZUluZm8udW50aWwpLmNvbXBvbmVudHMueWVhciA6IHRvWWVhciArIDE7XHJcbiAgICAgICAgICAgIHZhciBzdGRPZmZzZXQgPSBwcmV2U3RkT2Zmc2V0O1xyXG4gICAgICAgICAgICB2YXIgZHN0T2Zmc2V0ID0gcHJldkRzdE9mZnNldDtcclxuICAgICAgICAgICAgdmFyIGxldHRlciA9IHByZXZMZXR0ZXI7XHJcbiAgICAgICAgICAgIC8vIHpvbmUgYXBwbGljYWJsZT9cclxuICAgICAgICAgICAgaWYgKChwcmV2Wm9uZSA9PT0gbnVsbCB8fCBwcmV2Wm9uZS51bnRpbCA8IGVuZE1pbGxpcyAtIDEpXHJcbiAgICAgICAgICAgICAgICAmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5Ob25lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZS5nLiBMeWJpYSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm9zID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBydWxlSW5mb3MubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBydWxlSW5mb3Nbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUocHJldlVudGlsWWVhcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgbnVsbCkgPT09IHByZXZab25lLnVudGlsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIGF0ID0gKHByZXZab25lID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihhdCwgc3RkT2Zmc2V0LmFkZChkc3RPZmZzZXQpLCBsZXR0ZXIpKTtcclxuICAgICAgICAgICAgICAgIC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRzdFRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHByZXZVbnRpbFllYXIgIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByZXZVbnRpbFllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLCBNYXRoLm1pbih1bnRpbFllYXIsIHRvWWVhciksIHN0ZE9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBkc3RUcmFuc2l0aW9ucy5sZW5ndGg7ICsraykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IGRzdFRyYW5zaXRpb25zW2tdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHRyYW5zaXRpb24uYXQsIHRyYW5zaXRpb24ub2Zmc2V0LmFkZChzdGRPZmZzZXQpLCB0cmFuc2l0aW9uLmxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldlpvbmUgPSB6b25lSW5mbztcclxuICAgICAgICAgICAgcHJldlVudGlsWWVhciA9IHVudGlsWWVhcjtcclxuICAgICAgICAgICAgcHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuICAgICAgICAgICAgcHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuICAgICAgICAgICAgcHJldkxldHRlciA9IGxldHRlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHpvbmUgaW5mbyBmb3IgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuIFRocm93cyBpZiBub3QgZm91bmQuXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZSBzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kcyBvciBhcyBhIFRpbWVTdHJ1Y3RcclxuICAgICAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mbyA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXHJcbiAgICAgKiBmb2xsb3dpbmcgYW55IGxpbmtzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxyXG4gICAgICogQHJldHVybiBBcnJheSBvZiB6b25lIGluZm9zLiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mb3MgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICAvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVGFrZSBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmaW5hbCB6b25lIGluZm8gZm91bmRcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVFbnRyaWVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lRW50cnkgPSB6b25lRW50cmllc1tpXTtcclxuICAgICAgICAgICAgdmFyIHJ1bGVUeXBlID0gdGhpcy5wYXJzZVJ1bGVUeXBlKHpvbmVFbnRyeVsxXSk7XHJcbiAgICAgICAgICAgIHZhciB1bnRpbCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHVudGlsKSkge1xyXG4gICAgICAgICAgICAgICAgdW50aWwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLCBydWxlVHlwZSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbigpLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLCB6b25lRW50cnlbMl0sIHVudGlsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIC8vIHNvcnQgbnVsbCBsYXN0XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCAhPT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChhLnVudGlsIC0gYi51bnRpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuICAgICAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG4gICAgICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0UnVsZUluZm9zID0gZnVuY3Rpb24gKHJ1bGVOYW1lKSB7XHJcbiAgICAgICAgLy8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gZnJvbSBjYWNoZVxyXG4gICAgICAgIGlmICh0aGlzLl9ydWxlSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZVNldC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVTZXRbaV07XHJcbiAgICAgICAgICAgIHZhciBmcm9tWWVhciA9IChydWxlWzBdID09PSBcIk5hTlwiID8gLTEwMDAwIDogcGFyc2VJbnQocnVsZVswXSwgMTApKTtcclxuICAgICAgICAgICAgdmFyIHRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XHJcbiAgICAgICAgICAgIHZhciB0b1llYXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcbiAgICAgICAgICAgIHZhciBvblR5cGUgPSB0aGlzLnBhcnNlT25UeXBlKHJ1bGVbNF0pO1xyXG4gICAgICAgICAgICB2YXIgb25EYXkgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcclxuICAgICAgICAgICAgdmFyIG9uV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XHJcbiAgICAgICAgICAgIHZhciBtb250aE5hbWUgPSBydWxlWzNdO1xyXG4gICAgICAgICAgICB2YXIgbW9udGhOdW1iZXIgPSBtb250aE5hbWVUb1N0cmluZyhtb250aE5hbWUpO1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgUnVsZUluZm8oZnJvbVllYXIsIHRvVHlwZSwgdG9ZZWFyLCBydWxlWzJdLCBtb250aE51bWJlciwgb25UeXBlLCBvbkRheSwgb25XZWVrRGF5LCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuICAgICAgICAgICAgbWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzFdLCAxMCksIDYwKSwgbWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzJdLCAxMCksIDYwKSwgdGhpcy5wYXJzZUF0VHlwZShydWxlWzVdWzNdKSwgZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksIHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN10pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBSVUxFUyBjb2x1bW4gb2YgYSB6b25lIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVJ1bGVUeXBlID0gZnVuY3Rpb24gKHJ1bGUpIHtcclxuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VUb1R5cGUgPSBmdW5jdGlvbiAodG8pIHtcclxuICAgICAgICBpZiAodG8gPT09IFwibWF4XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5NYXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLlllYXI7IC8vIHllcyB3ZSByZXR1cm4gWWVhciBmb3Igb25seVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUTyBjb2x1bW4gaW5jb3JyZWN0OiBcIiArIHRvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uVHlwZSA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MYXN0WDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkdyZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gT25UeXBlLkRheU51bTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uRGF5ID0gZnVuY3Rpb24gKG9uLCBvblR5cGUpIHtcclxuICAgICAgICBzd2l0Y2ggKG9uVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5MZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI8PVwiKSArIDIpLCAxMCk7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI+PVwiKSArIDIpLCAxMCk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25XZWVrRGF5ID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNpY3NfMS5XZWVrRGF5LlN1bmRheTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VBdFR5cGUgPSBmdW5jdGlvbiAoYXQpIHtcclxuICAgICAgICBzd2l0Y2ggKGF0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG51bGw7XHJcbiAgICByZXR1cm4gVHpEYXRhYmFzZTtcclxufSgpKTtcclxuZXhwb3J0cy5UekRhdGFiYXNlID0gVHpEYXRhYmFzZTtcclxuLyoqXHJcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGEpIHtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgbWluRHN0U2F2ZTogbnVsbCxcclxuICAgICAgICBtYXhEc3RTYXZlOiBudWxsLFxyXG4gICAgICAgIG1pbkdtdE9mZjogbnVsbCxcclxuICAgICAgICBtYXhHbXRPZmY6IG51bGxcclxuICAgIH07XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICh0eXBlb2YgKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHJ1bGVzIHByb3BlcnR5XCIpO1xyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJ6b25lc1wiKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xyXG4gICAgfVxyXG4gICAgLy8gdmFsaWRhdGUgem9uZXNcclxuICAgIGZvciAodmFyIHpvbmVOYW1lIGluIGRhdGEuem9uZXMpIHtcclxuICAgICAgICBpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVBcnIgPSBkYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoem9uZUFycikgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgem9uZUFyciArIFwiXFxcIiBidXQgdGhhdCBkb2VzblxcJ3QgZXhpc3RcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh6b25lQXJyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gem9uZUFycltpXTtcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05hTihnbXRvZmYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsxXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgc2Vjb25kIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMl0gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHRoaXJkIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbM10gIT09IFwic3RyaW5nXCIgJiYgZW50cnlbM10gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nIG5vciBudWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzNdID09PSBcInN0cmluZ1wiICYmIGlzTmFOKG1hdGguZmlsdGVyRmxvYXQoZW50cnlbM10pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tYXhHbXRPZmYgPSBnbXRvZmY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluR210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA8IHJlc3VsdC5taW5HbXRPZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1pbkdtdE9mZiA9IGdtdG9mZjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyB2YWxpZGF0ZSBydWxlc1xyXG4gICAgZm9yICh2YXIgcnVsZU5hbWUgaW4gZGF0YS5ydWxlcykge1xyXG4gICAgICAgIGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgcnVsZUFyciA9IGRhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5sZW5ndGggPCA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbMF0gIT09IFwiTmFOXCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVswXSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVsxXSBpcyBub3QgYSBudW1iZXIsIG9ubHkgb3IgbWF4XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIVR6TW9udGhOYW1lcy5oYXNPd25Qcm9wZXJ0eShydWxlWzNdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bM10gaXMgbm90IGEgbW9udGggbmFtZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNF0uc3Vic3RyKDAsIDQpICE9PSBcImxhc3RcIiAmJiBydWxlWzRdLmluZGV4T2YoXCI+PVwiKSA9PT0gLTFcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlWzRdLmluZGV4T2YoXCI8PVwiKSA9PT0gLTEgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVs0XSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZSA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tYXhEc3RTYXZlID0gc2F2ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSBudWxsIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lkSG90WkdGMFlXSmhjMlV1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDNSNkxXUmhkR0ZpWVhObExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCT3pzN096czdSMEZOUnp0QlFVVklMRmxCUVZrc1EwRkJRenRCUVVWaUxIVkNRVUZ0UWl4VlFVRlZMRU5CUVVNc1EwRkJRVHRCUVVNNVFpeDFRa0ZCYVVVc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRE5VVXNTVUZCV1N4TlFVRk5MRmRCUVUwc1ZVRkJWU3hEUVVGRExFTkJRVUU3UVVGRGJrTXNlVUpCUVhsQ0xGbEJRVmtzUTBGQlF5eERRVUZCTzBGQlEzUkRMRWxCUVZrc1NVRkJTU3hYUVVGTkxGRkJRVkVzUTBGQlF5eERRVUZCTzBGQlJ5OUNPenRIUVVWSE8wRkJRMGdzVjBGQldTeE5RVUZOTzBsQlEycENPenRQUVVWSE8wbEJRMGdzYlVOQlFVa3NRMEZCUVR0SlFVTktPenRQUVVWSE8wbEJRMGdzYVVOQlFVY3NRMEZCUVR0QlFVTktMRU5CUVVNc1JVRlVWeXhqUVVGTkxFdEJRVTRzWTBGQlRTeFJRVk5xUWp0QlFWUkVMRWxCUVZrc1RVRkJUU3hIUVVGT0xHTkJVMWdzUTBGQlFUdEJRVVZFT3p0SFFVVkhPMEZCUTBnc1YwRkJXU3hOUVVGTk8wbEJRMnBDT3p0UFFVVkhPMGxCUTBnc2RVTkJRVTBzUTBGQlFUdEpRVU5PT3p0UFFVVkhPMGxCUTBnc2NVTkJRVXNzUTBGQlFUdEpRVU5NT3p0UFFVVkhPMGxCUTBnc2NVTkJRVXNzUTBGQlFUdEpRVU5NT3p0UFFVVkhPMGxCUTBnc2JVTkJRVWtzUTBGQlFUdEJRVU5NTEVOQlFVTXNSVUZxUWxjc1kwRkJUU3hMUVVGT0xHTkJRVTBzVVVGcFFtcENPMEZCYWtKRUxFbEJRVmtzVFVGQlRTeEhRVUZPTEdOQmFVSllMRU5CUVVFN1FVRkZSQ3hYUVVGWkxFMUJRVTA3U1VGRGFrSTdPMDlCUlVjN1NVRkRTQ3d5UTBGQlVTeERRVUZCTzBsQlExSTdPMDlCUlVjN1NVRkRTQ3h0UTBGQlNTeERRVUZCTzBsQlEwbzdPMDlCUlVjN1NVRkRTQ3hwUTBGQlJ5eERRVUZCTzBGQlEwb3NRMEZCUXl4RlFXSlhMR05CUVUwc1MwRkJUaXhqUVVGTkxGRkJZV3BDTzBGQllrUXNTVUZCV1N4TlFVRk5MRWRCUVU0c1kwRmhXQ3hEUVVGQk8wRkJSVVE3T3pzN1IwRkpSenRCUVVOSU8wbEJSVU03VVVGRFF6czdPMWRCUjBjN1VVRkRTU3hKUVVGWk8xRkJRMjVDT3p0WFFVVkhPMUZCUTBrc1RVRkJZenRSUVVOeVFqczdWMEZGUnp0UlFVTkpMRTFCUVdNN1VVRkRja0k3TzFkQlJVYzdVVUZEU1N4SlFVRlpPMUZCUTI1Q096dFhRVVZITzFGQlEwa3NUMEZCWlR0UlFVTjBRanM3VjBGRlJ6dFJRVU5KTEUxQlFXTTdVVUZEY2tJN08xZEJSVWM3VVVGRFNTeExRVUZoTzFGQlEzQkNPenRYUVVWSE8xRkJRMGtzVTBGQmEwSTdVVUZEZWtJN08xZEJSVWM3VVVGRFNTeE5RVUZqTzFGQlEzSkNPenRYUVVWSE8xRkJRMGtzVVVGQlowSTdVVUZEZGtJN08xZEJSVWM3VVVGRFNTeFJRVUZuUWp0UlFVTjJRanM3VjBGRlJ6dFJRVU5KTEUxQlFXTTdVVUZEY2tJN08xZEJSVWM3VVVGRFNTeEpRVUZqTzFGQlEzSkNPenM3VjBGSFJ6dFJRVU5KTEUxQlFXTTdVVUZ5UkdRc1UwRkJTU3hIUVVGS0xFbEJRVWtzUTBGQlVUdFJRVWxhTEZkQlFVMHNSMEZCVGl4TlFVRk5MRU5CUVZFN1VVRkpaQ3hYUVVGTkxFZEJRVTRzVFVGQlRTeERRVUZSTzFGQlNXUXNVMEZCU1N4SFFVRktMRWxCUVVrc1EwRkJVVHRSUVVsYUxGbEJRVThzUjBGQlVDeFBRVUZQTEVOQlFWRTdVVUZKWml4WFFVRk5MRWRCUVU0c1RVRkJUU3hEUVVGUk8xRkJTV1FzVlVGQlN5eEhRVUZNTEV0QlFVc3NRMEZCVVR0UlFVbGlMR05CUVZNc1IwRkJWQ3hUUVVGVExFTkJRVk03VVVGSmJFSXNWMEZCVFN4SFFVRk9MRTFCUVUwc1EwRkJVVHRSUVVsa0xHRkJRVkVzUjBGQlVpeFJRVUZSTEVOQlFWRTdVVUZKYUVJc1lVRkJVU3hIUVVGU0xGRkJRVkVzUTBGQlVUdFJRVWxvUWl4WFFVRk5MRWRCUVU0c1RVRkJUU3hEUVVGUk8xRkJTV1FzVTBGQlNTeEhRVUZLTEVsQlFVa3NRMEZCVlR0UlFVdGtMRmRCUVUwc1IwRkJUaXhOUVVGTkxFTkJRVkU3VVVGSGNrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEWml4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMR2xDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZET1VNc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMRFpDUVVGVkxFZEJRV3BDTEZWQlFXdENMRWxCUVZrN1VVRkROMElzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzUkNMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VVVGRFpDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY2tJc1MwRkJTeXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNN1dVRkROMElzUzBGQlN5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzU1VGQlNTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1VVRkRhRVFzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN08wOUJSMGM3U1VGRFNTeG5RMEZCWVN4SFFVRndRaXhWUVVGeFFpeExRVUZsTzFGQlEyNURMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE5VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVOaUxFTkJRVU03VVVGRFJDeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpWQ0xFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZEWkN4RFFVRkRPMUZCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5zUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRE8xRkJRMklzUTBGQlF6dFJRVU5FTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0UlFVTmtMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY0VVc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVU5pTEVOQlFVTTdVVUZEUkN4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxHbERRVUZqTEVkQlFYSkNMRlZCUVhOQ0xFdEJRV1U3VVVGRGNFTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUzBGQlN5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVFpeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMUZCUTJRc1EwRkJRenRSUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRXRCUVVzc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY0VNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dFJRVU5rTEVOQlFVTTdVVUZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTXpSU3hOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEyUXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU03U1VGRFlpeERRVUZETzBsQlJVUTdPenM3VDBGSlJ6dEpRVU5KTEdkRFFVRmhMRWRCUVhCQ0xGVkJRWEZDTEVsQlFWazdVVUZEYUVNc1owSkJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxEUkNRVUUwUWl4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVm9SaXd5UWtGQk1rSTdVVUZETTBJc1NVRkJUU3hGUVVGRkxFZEJRWE5DTEVWQlFVTXNWVUZCU1N4RlFVRkZMRXRCUVVzc1JVRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTTdVVUZGTTBRc1owSkJRV2RDTzFGQlEyaENMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNKQ0xFdEJRVXNzVFVGQlRTeERRVUZETEUxQlFVMDdaMEpCUVVVc1EwRkJRenR2UWtGRGNFSXNSVUZCUlN4RFFVRkRMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETzJkQ1FVTnlRaXhEUVVGRE8yZENRVUZETEV0QlFVc3NRMEZCUXp0WlFVTlNMRXRCUVVzc1RVRkJUU3hEUVVGRExFdEJRVXM3WjBKQlFVVXNRMEZCUXp0dlFrRkRia0lzUlVGQlJTeERRVUZETEVkQlFVY3NSMEZCUnl4TlFVRk5MRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03WjBKQlEyeEdMRU5CUVVNN1owSkJRVU1zUzBGQlN5eERRVUZETzFsQlExSXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTVHRuUWtGQlJTeERRVUZETzI5Q1FVTnNRaXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEhRVUZITEUxQlFVMHNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSU3hKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRuUWtGRGJrWXNRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRFVpeExRVUZMTEUxQlFVMHNRMEZCUXl4TFFVRkxPMmRDUVVGRkxFTkJRVU03YjBKQlEyNUNMRVZCUVVVc1EwRkJReXhIUVVGSExFZEJRVWNzVFVGQlRTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVVc1EwRkJRenRuUWtGQlF5eExRVUZMTEVOQlFVTTdVVUZEVkN4RFFVRkRPMUZCUlVRc2FVSkJRV2xDTzFGQlEycENMRVZCUVVVc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXp0UlFVTjBRaXhGUVVGRkxFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNN1VVRkRNVUlzUlVGQlJTeERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJSVEZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdTVUZETTBJc1EwRkJRenRKUVVWRU96czdPenM3VDBGTlJ6dEpRVU5KTEc5RFFVRnBRaXhIUVVGNFFpeFZRVUY1UWl4SlFVRlpMRVZCUVVVc1kwRkJkMElzUlVGQlJTeFJRVUZyUWp0UlFVTnNSaXhuUWtGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzYlVOQlFXMURMRU5CUVVNc1EwRkJRenRSUVVOdVJTeEpRVUZOTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXp0UlFVVjJSQ3d3UWtGQk1FSTdVVUZETVVJc1NVRkJTU3hOUVVGblFpeERRVUZETzFGQlEzSkNMRTFCUVUwc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNKQ0xFdEJRVXNzVFVGQlRTeERRVUZETEVkQlFVYzdaMEpCUTJRc1RVRkJUU3hIUVVGSExHMUNRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU16UWl4TFFVRkxMRU5CUVVNN1dVRkRVQ3hMUVVGTExFMUJRVTBzUTBGQlF5eFJRVUZSTzJkQ1FVTnVRaXhOUVVGTkxFZEJRVWNzWTBGQll5eERRVUZETzJkQ1FVTjRRaXhMUVVGTExFTkJRVU03V1VGRFVDeExRVUZMTEUxQlFVMHNRMEZCUXl4SlFVRkpPMmRDUVVObUxFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMlFzVFVGQlRTeEhRVUZITEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTTFReXhEUVVGRE8yZENRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOUUxFMUJRVTBzUjBGQlJ5eGpRVUZqTEVOQlFVTTdaMEpCUTNwQ0xFTkJRVU03WjBKQlEwUXNTMEZCU3l4RFFVRkRPMWxCUTFBc01FSkJRVEJDTzFsQlF6RkNPMmRDUVVORExIZENRVUYzUWp0blFrRkRlRUlzTUVKQlFUQkNPMmRDUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXp0blFrRkRia01zUTBGQlF6dFJRVU5JTEVOQlFVTTdVVUZGUkN4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExFMUJRVTBzUTBGQlF5eFpRVUZaTEVWQlFVVXNRMEZCUXp0SlFVTXpReXhEUVVGRE8wbEJSMFlzWlVGQlF6dEJRVUZFTEVOQlFVTXNRVUZ3VFVRc1NVRnZUVU03UVVGd1RWa3NaMEpCUVZFc1YwRnZUWEJDTEVOQlFVRTdRVUZGUkRzN1IwRkZSenRCUVVOSUxGZEJRVmtzVVVGQlVUdEpRVU51UWpzN1QwRkZSenRKUVVOSUxIVkRRVUZKTEVOQlFVRTdTVUZEU2pzN1QwRkZSenRKUVVOSUxESkRRVUZOTEVOQlFVRTdTVUZEVGpzN1QwRkZSenRKUVVOSUxDdERRVUZSTEVOQlFVRTdRVUZEVkN4RFFVRkRMRVZCWWxjc1owSkJRVkVzUzBGQlVpeG5Ra0ZCVVN4UlFXRnVRanRCUVdKRUxFbEJRVmtzVVVGQlVTeEhRVUZTTEdkQ1FXRllMRU5CUVVFN1FVRkZSRHM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096dEhRWGxDUnp0QlFVTklPMGxCUlVNN1VVRkRRenM3T3p0WFFVbEhPMUZCUTBrc1RVRkJaMEk3VVVGRmRrSTdPenM3T3p0WFFVMUhPMUZCUTBrc1VVRkJhMEk3VVVGRmVrSTdPMWRCUlVjN1VVRkRTU3hWUVVGdlFqdFJRVVV6UWpzN1YwRkZSenRSUVVOSkxGRkJRV2RDTzFGQlJYWkNPenM3T3pzN08xZEJUMGM3VVVGRFNTeE5RVUZqTzFGQlJYSkNPenM3TzFkQlNVYzdVVUZEU1N4TFFVRmhPMUZCY0VOaUxGZEJRVTBzUjBGQlRpeE5RVUZOTEVOQlFWVTdVVUZUYUVJc1lVRkJVU3hIUVVGU0xGRkJRVkVzUTBGQlZUdFJRVXRzUWl4bFFVRlZMRWRCUVZZc1ZVRkJWU3hEUVVGVk8xRkJTM0JDTEdGQlFWRXNSMEZCVWl4UlFVRlJMRU5CUVZFN1VVRlZhRUlzVjBGQlRTeEhRVUZPTEUxQlFVMHNRMEZCVVR0UlFVOWtMRlZCUVVzc1IwRkJUQ3hMUVVGTExFTkJRVkU3VVVGRmNFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY2tJc1NVRkJTU3hEUVVGRExGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUTJwRkxFTkJRVU03U1VGRFJpeERRVUZETzBsQlEwWXNaVUZCUXp0QlFVRkVMRU5CUVVNc1FVRnNSRVFzU1VGclJFTTdRVUZzUkZrc1owSkJRVkVzVjBGclJIQkNMRU5CUVVFN1FVRkhSQ3hKUVVGTExGbEJZVW83UVVGaVJDeFhRVUZMTEZsQlFWazdTVUZEYUVJc05rTkJRVThzUTBGQlFUdEpRVU5RTERaRFFVRlBMRU5CUVVFN1NVRkRVQ3cyUTBGQlR5eERRVUZCTzBsQlExQXNOa05CUVU4c1EwRkJRVHRKUVVOUUxEWkRRVUZQTEVOQlFVRTdTVUZEVUN3MlEwRkJUeXhEUVVGQk8wbEJRMUFzTmtOQlFVOHNRMEZCUVR0SlFVTlFMRFpEUVVGUExFTkJRVUU3U1VGRFVDdzJRMEZCVHl4RFFVRkJPMGxCUTFBc09FTkJRVkVzUTBGQlFUdEpRVU5TTERoRFFVRlJMRU5CUVVFN1NVRkRVaXc0UTBGQlVTeERRVUZCTzBGQlExUXNRMEZCUXl4RlFXSkpMRmxCUVZrc1MwRkJXaXhaUVVGWkxGRkJZV2hDTzBGQlJVUXNNa0pCUVRKQ0xFbEJRVms3U1VGRGRFTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVmNzUTBGQlF5eEZRVUZGTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU4wUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNNVFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFZc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRFJDeDNRa0ZCZDBJN1NVRkRlRUlzTUVKQlFUQkNPMGxCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhWQ1FVRjFRaXhIUVVGSExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTjRSQ3hEUVVGRE8wRkJRMFlzUTBGQlF6dEJRVVZFTEVsQlFVc3NWVUZSU2p0QlFWSkVMRmRCUVVzc1ZVRkJWVHRKUVVOa0xIbERRVUZQTEVOQlFVRTdTVUZEVUN4NVEwRkJUeXhEUVVGQk8wbEJRMUFzZVVOQlFVOHNRMEZCUVR0SlFVTlFMSGxEUVVGUExFTkJRVUU3U1VGRFVDeDVRMEZCVHl4RFFVRkJPMGxCUTFBc2VVTkJRVThzUTBGQlFUdEpRVU5RTEhsRFFVRlBMRU5CUVVFN1FVRkRVaXhEUVVGRExFVkJVa2tzVlVGQlZTeExRVUZXTEZWQlFWVXNVVUZSWkR0QlFVVkVPenM3UjBGSFJ6dEJRVU5JTERaQ1FVRnZReXhEUVVGVE8wbEJRelZETEUxQlFVMHNRMEZCUXl4MVJFRkJkVVFzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkRlRVVzUTBGQlF6dEJRVVpsTERKQ1FVRnRRaXh6UWtGRmJFTXNRMEZCUVR0QlFVVkVPenRIUVVWSE8wRkJRMGc3U1VGRFF6dFJRVU5ET3p0WFFVVkhPMUZCUTBrc1JVRkJWVHRSUVVOcVFqczdWMEZGUnp0UlFVTkpMRTFCUVdkQ08xRkJSWFpDT3p0WFFVVkhPMUZCUTBrc1RVRkJZenRSUVZSa0xFOUJRVVVzUjBGQlJpeEZRVUZGTEVOQlFWRTdVVUZKVml4WFFVRk5MRWRCUVU0c1RVRkJUU3hEUVVGVk8xRkJTMmhDTEZkQlFVMHNSMEZCVGl4TlFVRk5MRU5CUVZFN1VVRkhja0lzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGFrSXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEzcEVMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJRMFlzYVVKQlFVTTdRVUZCUkN4RFFVRkRMRUZCY2tKRUxFbEJjVUpETzBGQmNrSlpMR3RDUVVGVkxHRkJjVUowUWl4RFFVRkJPMEZCUlVRN08wZEJSVWM3UVVGRFNDeFhRVUZaTEdWQlFXVTdTVUZETVVJN08wOUJSVWM3U1VGRFNDeHBSRUZCUlN4RFFVRkJPMGxCUTBZN08wOUJSVWM3U1VGRFNDeHhSRUZCU1N4RFFVRkJPMEZCUTB3c1EwRkJReXhGUVZSWExIVkNRVUZsTEV0QlFXWXNkVUpCUVdVc1VVRlRNVUk3UVVGVVJDeEpRVUZaTEdWQlFXVXNSMEZCWml4MVFrRlRXQ3hEUVVGQk8wRkJSVVE3T3p0SFFVZEhPMEZCUTBnN1NVRnZSME03TzA5QlJVYzdTVUZEU0N4dlFrRkJiMElzU1VGQlZ6dFJRWFpIYUVNc2FVSkJNQ3RDUXp0UlFXcFJRVHM3VjBGRlJ6dFJRVU5MTEcxQ1FVRmpMRWRCUVc5RExFVkJRVVVzUTBGQlF6dFJRVFJGTjBRN08xZEJSVWM3VVVGRFN5eHRRa0ZCWXl4SFFVRnZReXhGUVVGRkxFTkJRVU03VVVGdWRFSTFSQ3huUWtGQlRTeERRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRk5CUVZNc1JVRkJSU3dyUmtGQkswWXNRMEZCUXl4RFFVRkRPMUZCUXk5SUxHZENRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRM0pDTEhsSVFVRjVTQ3hEUVVONlNDeERRVUZETzFGQlEwWXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNaQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM1JDTEVOQlFVTTdVVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOUUxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NSVUZCUlN4TFFVRkxMRVZCUVVVc1JVRkJSU3hGUVVGRkxFdEJRVXNzUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXp0WlFVTjBReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZWQlFVTXNRMEZCVFR0blFrRkRia0lzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRemRDTEVkQlFVY3NRMEZCUXl4RFFVRmpMRlZCUVc5Q0xFVkJRWEJDTEV0QlFVRXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVWQlFYQkNMR05CUVc5Q0xFVkJRWEJDTEVsQlFXOUNMRU5CUVVNN2QwSkJRV3hETEVsQlFVMHNSMEZCUnl4VFFVRkJPM2RDUVVOaUxFdEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2NVSkJRM0pETzI5Q1FVTkVMRWRCUVVjc1EwRkJReXhEUVVGakxGVkJRVzlDTEVWQlFYQkNMRXRCUVVFc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVhCQ0xHTkJRVzlDTEVWQlFYQkNMRWxCUVc5Q0xFTkJRVU03ZDBKQlFXeERMRWxCUVUwc1IwRkJSeXhUUVVGQk8zZENRVU5pTEV0QlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03Y1VKQlEzSkRPMmRDUVVOR0xFTkJRVU03V1VGRFJpeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTktMRU5CUVVNN1VVRkRSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03U1VGRGVrTXNRMEZCUXp0SlFYSklSRHM3T3pzN1QwRkxSenRKUVVOWExHVkJRVWtzUjBGQmJFSXNWVUZCYlVJc1NVRkJhMEk3VVVGRGNFTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5XTEZWQlFWVXNRMEZCUXl4VFFVRlRMRWRCUVVjc1UwRkJVeXhEUVVGRE8xbEJRMnBETEZWQlFWVXNRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUXpWRkxFTkJRVU03VVVGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTlFMRlZCUVZVc1EwRkJReXhUUVVGVExFZEJRVWNzVTBGQlV5eERRVUZETzFsQlEycERMRlZCUVZVc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFJRVU4yUWl4RFFVRkRPMGxCUTBZc1EwRkJRenRKUVVWRU96dFBRVVZITzBsQlExY3NiVUpCUVZFc1IwRkJkRUk3VVVGRFF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6TkNMRWxCUVUwc1RVRkJTU3hIUVVGVkxFVkJRVVVzUTBGQlF6dFpRVU4yUWl3d1EwRkJNRU03V1VGRE1VTXNTVUZCVFN4RFFVRkRMRWRCUVZFc1EwRkJReXhOUVVGTkxFZEJRVWNzVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4RFFVRkRPMWxCUXpGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMUFzUjBGQlJ5eERRVUZETEVOQlFXTXNWVUZCWXl4RlFVRmtMRXRCUVVFc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCWkN4alFVRmpMRVZCUVdRc1NVRkJZeXhEUVVGRE8yOUNRVUUxUWl4SlFVRk5MRWRCUVVjc1UwRkJRVHR2UWtGRFlpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMnBETEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eExRVUZMTEZGQlFWRXNTVUZCU1N4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZET3pSQ1FVTm9SU3hOUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU51UWl4RFFVRkRPMjlDUVVOR0xFTkJRVU03YVVKQlEwUTdXVUZEUml4RFFVRkRPMWxCUTBRc0swTkJRU3RETzFsQlF5OURMRWxCUVUwc1pVRkJaU3hIUVVGSExGVkJRVU1zVDBGQldUdG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRE8yOUNRVU5LTERKRFFVRXlRenR2UWtGRE0wTXNTVUZCVFN4VlFVRlZMRWRCUVVjc1VVRkJVU3hEUVVGRE8yOUNRVU0xUWl4SlFVRk5MRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl3MlEwRkJOa003YjBKQlF6VkZMRTFCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTJRc1EwRkJSVHRuUWtGQlFTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5hTEcxQ1FVRnRRanR2UWtGRGJrSXNTVUZCVFN4WFFVRlhMRWRCUVdFN2QwSkJRemRDTEdWQlFXVTdkMEpCUTJZc2JVSkJRVzFDTzNkQ1FVTnVRaXhoUVVGaE8zZENRVU5pTEc5Q1FVRnZRanQzUWtGRGNFSXNhVUpCUVdsQ08zZENRVU5xUWl4eFFrRkJjVUk3ZDBKQlEzSkNMR2xDUVVGcFFqdDNRa0ZEYWtJc1pVRkJaVHQzUWtGRFppeHhRa0ZCY1VJN2QwSkJRM0pDTEcxQ1FVRnRRanQzUWtGRGJrSXNjVUpCUVhGQ08zZENRVU55UWl4blFrRkJaMEk3Y1VKQlEyaENMRU5CUVVNN2IwSkJRMFlzU1VGQlRTeFJRVUZSTEVkQlFXRXNSVUZCUlN4RFFVRkRPMjlDUVVNNVFpeEpRVUZOTEdGQlFXRXNSMEZCWVN4RlFVRkZMRU5CUVVNN2IwSkJRMjVETEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJReXhWUVVGclFqdDNRa0ZEZEVNc1NVRkJTU3hEUVVGRE96UkNRVU5LTEVsQlFVMHNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6czBRa0ZET1VJc1RVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRaQ3hEUVVGRk8zZENRVUZCTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlJXSXNRMEZCUXp0dlFrRkRSaXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEU2l4RFFVRkRPMWxCUTBZc1EwRkJReXhEUVVGRE8xbEJRMFlzUlVGQlJTeERRVUZETEVOQlFVTXNUVUZCU1N4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjJRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEUxQlFVMHNTMEZCU3l4UlFVRlJMRWxCUVVrc1QwRkJUeXhOUVVGTkxFTkJRVU1zVDBGQlR5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRM1JGTEdWQlFXVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExEUkVRVUUwUkR0blFrRkRka1lzUTBGQlF6dFpRVU5HTEVOQlFVTTdXVUZEUkN4VlFVRlZMRU5CUVVNc1UwRkJVeXhIUVVGSExFbEJRVWtzVlVGQlZTeERRVUZETEUxQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpkRExFTkJRVU03VVVGRFJDeE5RVUZOTEVOQlFVTXNWVUZCVlN4RFFVRkRMRk5CUVZNc1EwRkJRenRKUVVNM1FpeERRVUZETzBsQk1rTkVPenRQUVVWSE8wbEJRMGtzT0VKQlFWTXNSMEZCYUVJN1VVRkRReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1JDTEVsQlFVa3NRMEZCUXl4VlFVRlZMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRMmhFTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03VVVGRGVFSXNRMEZCUXp0UlFVTkVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETzBsQlEzaENMRU5CUVVNN1NVRkZUU3d5UWtGQlRTeEhRVUZpTEZWQlFXTXNVVUZCWjBJN1VVRkROMElzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3hEUVVGRE8wbEJSVVE3T3pzN096czdUMEZQUnp0SlFVTkpMQ3RDUVVGVkxFZEJRV3BDTEZWQlFXdENMRkZCUVdsQ08xRkJRMnhETEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFpDeEpRVUZOTEZOQlFWTXNSMEZCWlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFsQlF6RkVMRWxCUVVrc1RVRkJUU3hIUVVGaExFbEJRVWtzUTBGQlF6dFpRVU0xUWl4SlFVRk5MRk5CUVZNc1IwRkJZU3hGUVVGRkxFTkJRVU03V1VGREwwSXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdaMEpCUXpORExFbEJRVTBzVVVGQlVTeEhRVUZITEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE9VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGRkJRVkVzUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE0wTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRmxCUVZrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdORUpCUXpsRExFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRPM2RDUVVNNVFpeERRVUZETzI5Q1FVTkdMRU5CUVVNN1owSkJRMFlzUTBGQlF6dG5Ra0ZEUkN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeExRVUZMTEZGQlFWRXNRMEZCUXl4UlFVRlJPM1ZDUVVOMlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMnBFTEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzI5Q1FVTnNReXhKUVVGTkxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dHZRa0ZEYkVRc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN2QwSkJRM1JETEVsQlFVMHNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEZWtJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPelJDUVVOc1JDeEZRVUZGTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owTkJRM2hETEUxQlFVMHNSMEZCUnl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRE96UkNRVU40UWl4RFFVRkRPM2RDUVVOR0xFTkJRVU03YjBKQlEwWXNRMEZCUXp0dlFrRkJRU3hEUVVGRE8yZENRVU5JTEVOQlFVTTdXVUZEUml4RFFVRkRPMWxCUVVFc1EwRkJRenRaUVVOR0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFlpeE5RVUZOTEVkQlFVY3NiVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETlVJc1EwRkJRenRaUVVORUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkRka0lzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc1RVRkJUU3hEUVVGRExHMUNRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZEYkVRc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPenM3T3p0UFFVOUhPMGxCUTBrc0swSkJRVlVzUjBGQmFrSXNWVUZCYTBJc1VVRkJhVUk3VVVGRGJFTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5rTEVsQlFVMHNVMEZCVXl4SFFVRmxMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZETVVRc1NVRkJTU3hOUVVGTkxFZEJRV0VzU1VGQlNTeERRVUZETzFsQlF6VkNMRWxCUVUwc1UwRkJVeXhIUVVGaExFVkJRVVVzUTBGQlF6dFpRVU12UWl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRk5CUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXp0blFrRkRNME1zU1VGQlRTeFJRVUZSTEVkQlFVY3NVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeExRVUZMTEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU16UXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzU1VGQlNTeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNKRUxFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRPMjlDUVVNNVFpeERRVUZETzJkQ1FVTkdMRU5CUVVNN1owSkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1MwRkJTeXhSUVVGUkxFTkJRVU1zVVVGQlVUdDFRa0ZEZGtNc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnFSQ3hUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenR2UWtGRGJFTXNTVUZCVFN4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN2IwSkJRMnhFTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETzNkQ1FVTjBReXhKUVVGTkxGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM3BDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZETDBNc1RVRkJUU3hIUVVGSExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTTdkMEpCUTNoQ0xFTkJRVU03YjBKQlEwWXNRMEZCUXp0dlFrRkJRU3hEUVVGRE8yZENRVU5JTEVOQlFVTTdXVUZEUml4RFFVRkRPMWxCUVVFc1EwRkJRenRaUVVOR0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFlpeE5RVUZOTEVkQlFVY3NiVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETlVJc1EwRkJRenRaUVVORUxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkRka0lzUTBGQlF6dFJRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTFBc1RVRkJUU3hEUVVGRExHMUNRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZEYkVRc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVTkpMREpDUVVGTkxFZEJRV0lzVlVGQll5eFJRVUZuUWp0UlFVTTNRaXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExGbEJRVmtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUTNwRUxFTkJRVU03U1VGUFRTeHJRMEZCWVN4SFFVRndRaXhWUVVGeFFpeFJRVUZuUWl4RlFVRkZMRU5CUVhOQ08xRkJRelZFTEVsQlFVa3NVVUZCYTBJc1EwRkJRenRSUVVOMlFpeEpRVUZOTEU5QlFVOHNSMEZCWlN4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExGRkJRVkVzUjBGQlJ5eEpRVUZKTEcxQ1FVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZGTlVVc05FTkJRVFJETzFGQlF6VkRMRWxCUVUwc1dVRkJXU3hIUVVGbExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkROMFFzU1VGQlRTeHBRa0ZCYVVJc1IwRkJaU3hGUVVGRkxFTkJRVU03VVVGRGVrTXNTVUZCVFN4VlFVRlZMRWRCUVZjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF6dFJRVU01UXl4SlFVRk5MRkZCUVZFc1IwRkJWeXhWUVVGVkxFZEJRVWNzUjBGQlJ5eEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTndSQ3hKUVVGSkxFOUJRVThzUjBGQlZ5eEpRVUZKTEVOQlFVTTdVVUZETTBJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNN1dVRkRPVU1zVVVGQlVTeEhRVUZITEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVNelFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1MwRkJTeXhKUVVGSkxFbEJRVWtzVDBGQlR5eEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUzBGQlN5eEpRVUZKTEVsQlFVa3NVVUZCVVN4RFFVRkRMRXRCUVVzc1IwRkJSeXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpGSExHbENRVUZwUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFpRVU5zUXl4RFFVRkRPMWxCUTBRc1QwRkJUeXhIUVVGSExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZETVVJc1EwRkJRenRSUVVWRUxHOUVRVUZ2UkR0UlFVTndSQ3hKUVVGSkxGZEJRVmNzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMUZCUTI1RExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzYVVKQlFXbENMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdXVUZEYmtRc1VVRkJVU3hIUVVGSExHbENRVUZwUWl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMmhETEhGRFFVRnhRenRaUVVOeVF5eFhRVUZYTEVkQlFVY3NWMEZCVnl4RFFVRkRMRTFCUVUwc1EwRkRMMElzU1VGQlNTeERRVUZETEhkQ1FVRjNRaXhEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVWQlFVVXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eEZRVUZGTEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUlVGQlJTeFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUXpOSUxFTkJRVU03VVVGRFNDeERRVUZETzFGQlEwUXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRV0VzUlVGQlJTeERRVUZoTzFsQlF6ZERMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1VVRkRjRUlzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZGU0N4clJVRkJhMFU3VVVGRGJFVXNTVUZCU1N4UlFVRlJMRWRCUVdFc1NVRkJTU3hEUVVGRE8xRkJRemxDTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NWMEZCVnl4RFFVRkRMRTFCUVUwc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETzFsQlF6ZERMRWxCUVUwc1ZVRkJWU3hIUVVGSExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnNReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGRFUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRGVFTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1EwRkJReXhGUVVGRkxFTkJRVU03WjBKQlEzUkNMRU5CUVVNN1dVRkRSaXhEUVVGRE8xbEJRMFFzVVVGQlVTeEhRVUZITEZWQlFWVXNRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRPVUlzUTBGQlF6dEpRVU5HTEVOQlFVTTdTVUZGUkRzN096czdPMDlCVFVjN1NVRkRTU3c0UWtGQlV5eEhRVUZvUWl4VlFVRnBRaXhSUVVGblFqdFJRVU5vUXl4SlFVRkpMR05CUVdNc1IwRkJWeXhSUVVGUkxFTkJRVU03VVVGRGRFTXNTVUZCU1N4WFFVRlhMRWRCUVZFc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzWlVGQlpUdFJRVU5tTEU5QlFVOHNUMEZCVHl4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExGRkJRVkVzUlVGQlJTeERRVUZETzFsQlF6RkRMSGRDUVVGM1FqdFpRVU40UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMR05CUVdNc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTI1RUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNVMEZCVXl4SFFVRkhMRmRCUVZjc1IwRkJSeXd5UTBGQk1rTTdjMEpCUTJ4R0xGRkJRVkVzUjBGQlJ5eFhRVUZYTEVkQlFVY3NZMEZCWXl4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRM0JFTEVOQlFVTTdXVUZEUkN4alFVRmpMRWRCUVVjc1YwRkJWeXhEUVVGRE8xbEJRemRDTEZkQlFWY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXp0UlFVTm9SQ3hEUVVGRE8xRkJRMFFzVFVGQlRTeERRVUZETEVOQlFVTXNZMEZCWXl4TFFVRkxMRk5CUVZNc1NVRkJTU3hqUVVGakxFdEJRVXNzVTBGQlV5eEpRVUZKTEdOQlFXTXNTMEZCU3l4VFFVRlRMRU5CUVVNc1EwRkJRenRKUVVOMlJ5eERRVUZETzBsQmFVSk5MRzFEUVVGakxFZEJRWEpDTEZWQlFYTkNMRkZCUVdkQ0xFVkJRVVVzUTBGQmMwSXNSVUZCUlN4SFFVRjVRenRSUVVGNlF5eHRRa0ZCZVVNc1IwRkJla01zVFVGQmRVSXNaVUZCWlN4RFFVRkRMRVZCUVVVN1VVRkRlRWNzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETTBJc1NVRkJUU3hUUVVGVExFZEJRV1VzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4UlFVRlJMRWRCUVVjc1NVRkJTU3h0UWtGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRemxGTEcxRVFVRnRSRHRaUVVOdVJDeHRRMEZCYlVNN1dVRkRia01zYlVOQlFXMURPMWxCUTI1RExHMURRVUZ0UXp0WlFVTnVReXh0UTBGQmJVTTdXVUZGYmtNc0swTkJRU3RETzFsQlF5OURMRFpHUVVFMlJqdFpRVVUzUml4NVJrRkJlVVk3V1VGRGVrWXNTVUZCVFN4WFFVRlhMRWRCUVdsQ0xFbEJRVWtzUTBGQlF5d3dRa0ZCTUVJc1EwRkRhRVVzVVVGQlVTeEZRVUZGTEZOQlFWTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUlVGQlJTeFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRM1JGTEVOQlFVTTdXVUZGUml4dFEwRkJiVU03V1VGRGJrTXNTVUZCU1N4SlFVRkpMRWRCUVdFc2JVSkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRka01zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03WjBKQlF6ZERMRWxCUVUwc1ZVRkJWU3hIUVVGSExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRiRU1zYzBKQlFYTkNPMmRDUVVOMFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRM3BETEVsQlFVMHNWMEZCVnl4SFFVRlhMRlZCUVZVc1EwRkJReXhGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NSVUZCUlN4RFFVRkRPMjlDUVVOb1JTeEpRVUZOTEZWQlFWVXNSMEZCVnl4VlFVRlZMRU5CUVVNc1JVRkJSU3hIUVVGSExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNN2IwSkJRelZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFbEJRVWtzVjBGQlZ5eEpRVUZKTEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVjc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZET1VVc1NVRkJUU3hoUVVGaExFZEJRVWNzVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03ZDBKQlEyeEVMRzlDUVVGdlFqdDNRa0ZEY0VJc1NVRkJUU3hOUVVGTkxFZEJRVmNzUTBGQlF5eEhRVUZITEV0QlFVc3NaVUZCWlN4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkROMFFzU1VGQlRTeFpRVUZaTEVkQlFVY3NVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJSeXhOUVVGTkxFZEJRVWNzWVVGQllTeERRVUZETEZsQlFWa3NSVUZCUlN4RFFVRkRPM2RDUVVOc1JpeE5RVUZOTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFZEJRVWNzV1VGQldTeEhRVUZITEVsQlFVa3NiVUpCUVZVc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTTVSU3hEUVVGRE8yZENRVU5HTEVOQlFVTTdaMEpCUTBRc1NVRkJTU3hIUVVGSExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTTdXVUZETVVJc1EwRkJRenRaUVVGQkxFTkJRVU03VVVGSFNDeERRVUZETzFGQlEwUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzVVVGQlVTeEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU5vUkN4RFFVRkRPMGxCUlVRN096czdPMDlCUzBjN1NVRkRTU3h0UTBGQll5eEhRVUZ5UWl4VlFVRnpRaXhSUVVGblFpeEZRVUZGTEU5QlFUUkNPMUZCUTI1RkxFbEJRVTBzVVVGQlVTeEhRVUZoTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETzFGQlF5OUVMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJEczdPenM3T3p0UFFVOUhPMGxCUTBrc1owTkJRVmNzUjBGQmJFSXNWVUZCYlVJc1VVRkJaMElzUlVGQlJTeFBRVUUwUWp0UlFVTm9SU3hKUVVGTkxGRkJRVkVzUjBGQllTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRkZCUVZFc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFJRVU12UkN4SlFVRkpMRk5CUVZNc1IwRkJZU3hKUVVGSkxFTkJRVU03VVVGRkwwSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETTBJc1MwRkJTeXhSUVVGUkxFTkJRVU1zU1VGQlNUdG5Ra0ZCUlN4RFFVRkRPMjlDUVVOd1FpeFRRVUZUTEVkQlFVY3NiVUpCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTJwRExFTkJRVU03WjBKQlFVTXNTMEZCU3l4RFFVRkRPMWxCUTFJc1MwRkJTeXhSUVVGUkxFTkJRVU1zVFVGQlRUdG5Ra0ZCUlN4RFFVRkRPMjlDUVVOMFFpeFRRVUZUTEVkQlFVY3NVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJRenRuUWtGRGFrTXNRMEZCUXp0blFrRkJReXhMUVVGTExFTkJRVU03V1VGRFVpeExRVUZMTEZGQlFWRXNRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJRenRuUWtGRGVFSXNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hGUVVGRkxFOUJRVThzUlVGQlJTeFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRhRVlzUTBGQlF6dFJRVU5HTEVOQlFVTTdVVUZGUkN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1NVRkRka01zUTBGQlF6dEpRVVZFT3pzN096czdPenM3VDBGVFJ6dEpRVU5KTEdsRFFVRlpMRWRCUVc1Q0xGVkJRVzlDTEZGQlFXZENMRVZCUVVVc1QwRkJORUlzUlVGQlJTeFpRVUUwUWp0UlFVRTFRaXcwUWtGQk5FSXNSMEZCTlVJc2JVSkJRVFJDTzFGQlF5OUdMRWxCUVUwc1VVRkJVU3hIUVVGaExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJReTlFTEVsQlFVMHNUVUZCVFN4SFFVRlhMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGRmRrTXNPRUpCUVRoQ08xRkJRemxDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMlZCUXpOQ0xGRkJRVkVzUTBGQlF5eFJRVUZSTEV0QlFVc3NVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRE4wTXNTVUZCU1N4TlFVRk5MRk5CUVZFc1EwRkJRenRaUVVOdVFpeDVRa0ZCZVVJN1dVRkRla0lzUlVGQlJTeERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJFSXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNSVUZCUlN4UFFVRlBMRVZCUVVVc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzFsQlF6RkZMRU5CUVVNN1dVRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZEVUN4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRE8xbEJRMklzUTBGQlF6dFpRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0UlFVTnlReXhEUVVGRE8xRkJSVVFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTm1MRU5CUVVNN1NVRkZSRHM3T3pzN096czdPenM3VDBGWFJ6dEpRVU5KTEhkRFFVRnRRaXhIUVVFeFFpeFZRVUV5UWl4UlFVRm5RaXhGUVVGRkxGTkJRVGhDTzFGQlF6RkZMRWxCUVUwc1ZVRkJWU3hIUVVGSExFTkJRVU1zVDBGQlR5eFRRVUZUTEV0QlFVc3NVVUZCVVN4SFFVRkhMRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZEZEVZc1NVRkJUU3hUUVVGVExFZEJRV1VzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVNeFJDeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEZOQlFWTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF6dFpRVU16UXl4SlFVRk5MRkZCUVZFc1IwRkJSeXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZET1VJc1JVRkJSU3hEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NTMEZCU3l4SlFVRkpMRWxCUVVrc1VVRkJVU3hEUVVGRExFdEJRVXNzUjBGQlJ5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRmxCUVZrc1JVRkJSU3hIUVVGSExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpkR0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8xbEJRMmhETEVOQlFVTTdVVUZEUml4RFFVRkRPMUZCUTBRc2QwSkJRWGRDTzFGQlEzaENMREJDUVVFd1FqdFJRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlExWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4RFFVRkRPMUZCUTNaRExFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUTdPenM3T3pzN096dFBRVk5ITzBsQlEwa3NjVU5CUVdkQ0xFZEJRWFpDTEZWQlFYZENMRkZCUVdkQ0xFVkJRVVVzVTBGQk9FSTdVVUZEZGtVc1NVRkJUU3hGUVVGRkxFZEJRV1VzUTBGQlF5eFBRVUZQTEZOQlFWTXNTMEZCU3l4UlFVRlJMRWRCUVVjc1NVRkJTU3h0UWtGQlZTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRE8xRkJReTlHTEVsQlFVMHNXVUZCV1N4SFFVRmxMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUlc1RkxEUkVRVUUwUkR0UlFVTTFSQ3h0UTBGQmJVTTdVVUZEYmtNc2JVTkJRVzFETzFGQlEyNURMRzFEUVVGdFF6dFJRVU51UXl4cFJVRkJhVVU3VVVGRmFrVXNORVZCUVRSRk8xRkJRelZGTERKRFFVRXlRenRSUVVVelF5eEpRVUZOTEZkQlFWY3NSMEZCYVVJc1NVRkJTU3hEUVVGRExEQkNRVUV3UWl4RFFVTm9SU3hSUVVGUkxFVkJRVVVzV1VGQldTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRWRCUVVjc1EwRkJReXhGUVVGRkxGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkROVVVzUTBGQlF6dFJRVU5HTEVsQlFVa3NTVUZCU1N4SFFVRmxMRWxCUVVrc1EwRkJRenRSUVVNMVFpeEpRVUZKTEZGQlFWRXNSMEZCWlN4SlFVRkpMRU5CUVVNN1VVRkRhRU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03V1VGRE4wTXNTVUZCVFN4VlFVRlZMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyeERMRVZCUVVVc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF5eEZRVUZGTEVkQlFVY3NWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJReXhaUVVGWkxFVkJRVVVzUjBGQlJ5eFpRVUZaTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGFFWXNiME5CUVc5RE8yZENRVU53UXl4TFFVRkxMRU5CUVVNN1dVRkRVQ3hEUVVGRE8xbEJRMFFzVVVGQlVTeEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTm9RaXhKUVVGSkxFZEJRVWNzVlVGQlZTeERRVUZETzFGQlEyNUNMRU5CUVVNN1VVRkZSQ3d3UWtGQk1FSTdVVUZETVVJc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTldMREpGUVVFeVJUdFpRVU16UlN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFbEJRVWtzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRNVVFzYTBKQlFXdENPMmRDUVVOc1FpeEpRVUZOTEVsQlFVa3NSMEZCUnl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1owSkJRemxETEVWQlFVVXNRMEZCUXl4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFbEJRVWtzU1VGQlNTeERRVUZETEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExGbEJRVmtzUlVGQlJUdDFRa0ZETDBRc1dVRkJXU3hEUVVGRExGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zV1VGQldTeEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETVVZc2VVSkJRWGxDTzI5Q1FVTjZRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRuUWtGRGFFTXNRMEZCUXp0blFrRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHZRa0ZEVUN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0blFrRkROVUlzUTBGQlF6dFpRVU5HTEVOQlFVTTdXVUZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRuUWtGRFVDeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dFpRVU0xUWl4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNNa1pCUVRKR08xbEJRek5HTEhORFFVRnpRenRaUVVOMFF5eE5RVUZOTEVOQlFVTXNiVUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETVVJc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPenM3T3p0UFFVOUhPMGxCUTBrc2NVTkJRV2RDTEVkQlFYWkNMRlZCUVhkQ0xGRkJRV2RDTEVWQlFVVXNUMEZCTkVJc1JVRkJSU3hqUVVGM1FqdFJRVU12Uml4SlFVRk5MRVZCUVVVc1IwRkJaU3hEUVVGRExFOUJRVThzVDBGQlR5eExRVUZMTEZGQlFWRXNSMEZCUnl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNN1VVRkZla1lzY1VOQlFYRkRPMUZCUTNKRExFbEJRVTBzVjBGQlZ5eEhRVUZwUWl4SlFVRkpMRU5CUVVNc2QwSkJRWGRDTEVOQlF6bEVMRkZCUVZFc1JVRkJSU3hGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNZMEZCWXl4RFFVTndSU3hEUVVGRE8xRkJSVVlzYjBOQlFXOURPMUZCUTNCRExFbEJRVWtzVFVGQlRTeEhRVUZoTEVsQlFVa3NRMEZCUXp0UlFVTTFRaXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4WFFVRlhMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU03V1VGRGJFUXNTVUZCVFN4VlFVRlZMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyeERMRVZCUVVVc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzQkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMmRDUVVOdVF5eExRVUZMTEVOQlFVTTdXVUZEVUN4RFFVRkRPMUZCUTBZc1EwRkJRenRSUVVWRUxIZENRVUYzUWp0UlFVTjRRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRZaXh0UkVGQmJVUTdXVUZEYmtRc1RVRkJUU3hIUVVGSExHMUNRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRemxDTEVOQlFVTTdVVUZGUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8wbEJRMllzUTBGQlF6dEpRVVZFT3pzN096czdPMDlCVDBjN1NVRkRTU3hyUTBGQllTeEhRVUZ3UWl4VlFVRnhRaXhSUVVGblFpeEZRVUZGTEU5QlFUUkNMRVZCUVVVc1kwRkJkMEk3VVVGRE5VWXNTVUZCVFN4RlFVRkZMRWRCUVdVc1EwRkJReXhQUVVGUExFOUJRVThzUzBGQlN5eFJRVUZSTEVkQlFVY3NTVUZCU1N4dFFrRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4RFFVRkRPMUZCUTNwR0xIRkRRVUZ4UXp0UlFVTnlReXhKUVVGTkxGZEJRVmNzUjBGQmFVSXNTVUZCU1N4RFFVRkRMSGRDUVVGM1FpeERRVU01UkN4UlFVRlJMRVZCUVVVc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEdOQlFXTXNRMEZEY0VVc1EwRkJRenRSUVVWR0xHOURRVUZ2UXp0UlFVTndReXhKUVVGSkxFMUJRVTBzUjBGQlZ5eEpRVUZKTEVOQlFVTTdVVUZETVVJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NWMEZCVnl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRE8xbEJRMnhFTEVsQlFVMHNWVUZCVlN4SFFVRkhMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5zUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU53UXl4TlFVRk5MRWRCUVVjc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF6dG5Ra0ZETTBJc1MwRkJTeXhEUVVGRE8xbEJRMUFzUTBGQlF6dFJRVU5HTEVOQlFVTTdVVUZGUkN4M1FrRkJkMEk3VVVGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEySXNiVVJCUVcxRU8xbEJRMjVFTEUxQlFVMHNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRZaXhEUVVGRE8xRkJSVVFzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTm1MRU5CUVVNN1NVRkZSRHM3T3pzN096czdPMDlCVTBjN1NVRkRTU3cyUTBGQmQwSXNSMEZCTDBJc1ZVRkJaME1zVVVGQlowSXNSVUZCUlN4UlFVRm5RaXhGUVVGRkxFMUJRV01zUlVGQlJTeGpRVUYzUWp0UlFVTXpSeXhuUWtGQlRTeERRVUZETEZGQlFWRXNTVUZCU1N4TlFVRk5MRVZCUVVVc05FSkJRVFJDTEVOQlFVTXNRMEZCUXp0UlFVVjZSQ3hKUVVGTkxGTkJRVk1zUjBGQlpTeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRekZFTEVsQlFVMHNUVUZCVFN4SFFVRnBRaXhGUVVGRkxFTkJRVU03VVVGRmFFTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzVVVGQlVTeEZRVUZGTEVOQlFVTXNTVUZCU1N4TlFVRk5MRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF6dFpRVU42UXl4SlFVRkpMRkZCUVZFc1IwRkJZU3hKUVVGSkxFTkJRVU03V1VGRE9VSXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTTdaMEpCUXpORExFbEJRVTBzVVVGQlVTeEhRVUZoTEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGVFTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRelZDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hWUVVGVkxFTkJRM3BDTEZGQlFWRXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eERRVUZETEVWQlFVVXNZMEZCWXl4RlFVRkZMRkZCUVZFc1EwRkJReXhGUVVOMlJDeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVTmlMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTndRaXhEUVVGRE8yZENRVU5FTEZGQlFWRXNSMEZCUnl4UlFVRlJMRU5CUVVNN1dVRkRja0lzUTBGQlF6dFJRVU5HTEVOQlFVTTdVVUZGUkN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVU1zUTBGQllTeEZRVUZGTEVOQlFXRTdXVUZEZUVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVOd1FpeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTklMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRFppeERRVUZETzBsQlJVUTdPenM3T3pzN1QwRlBSenRKUVVOSkxDdERRVUV3UWl4SFFVRnFReXhWUVVGclF5eFJRVUZuUWl4RlFVRkZMRkZCUVdkQ0xFVkJRVVVzVFVGQll6dFJRVU51Uml4blFrRkJUU3hEUVVGRExGRkJRVkVzU1VGQlNTeE5RVUZOTEVWQlFVVXNORUpCUVRSQ0xFTkJRVU1zUTBGQlF6dFJRVVY2UkN4SlFVRk5MRmRCUVZjc1IwRkJWeXhOUVVGTkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVVVGQlVTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTFSU3hKUVVGTkxGTkJRVk1zUjBGQlZ5eE5RVUZOTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGSE5VVXNTVUZCVFN4VFFVRlRMRWRCUVdVc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVTXhSQ3huUWtGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRkxHOUVRVUZ2UkN4RFFVRkRMRU5CUVVNN1VVRkZia1lzU1VGQlRTeE5RVUZOTEVkQlFXbENMRVZCUVVVc1EwRkJRenRSUVVWb1F5eEpRVUZKTEZGQlFWRXNSMEZCWVN4SlFVRkpMRU5CUVVNN1VVRkRPVUlzU1VGQlNTeGhRVUZ4UWl4RFFVRkRPMUZCUXpGQ0xFbEJRVWtzWVVGQllTeEhRVUZoTEcxQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyaEVMRWxCUVVrc1lVRkJZU3hIUVVGaExHMUNRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMmhFTEVsQlFVa3NWVUZCVlN4SFFVRlhMRVZCUVVVc1EwRkJRenRSUVVNMVFpeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEZOQlFWTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF6dFpRVU16UXl4SlFVRk5MRkZCUVZFc1IwRkJSeXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZET1VJc1NVRkJUU3hUUVVGVExFZEJRVmNzVVVGQlVTeERRVUZETEV0QlFVc3NSMEZCUnl4SlFVRkpMRzFDUVVGVkxFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFZEJRVWNzVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTjJSeXhKUVVGSkxGTkJRVk1zUjBGQllTeGhRVUZoTEVOQlFVTTdXVUZEZUVNc1NVRkJTU3hUUVVGVExFZEJRV0VzWVVGQllTeERRVUZETzFsQlEzaERMRWxCUVVrc1RVRkJUU3hIUVVGWExGVkJRVlVzUTBGQlF6dFpRVVZvUXl4dFFrRkJiVUk3V1VGRGJrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFdEJRVXNzU1VGQlNTeEpRVUZKTEZGQlFWRXNRMEZCUXl4TFFVRkxMRWRCUVVjc1UwRkJVeXhIUVVGSExFTkJRVU1zUTBGQlF6dHRRa0ZEY2tRc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eExRVUZMTEVsQlFVa3NTVUZCU1N4UlFVRlJMRU5CUVVNc1MwRkJTeXhKUVVGSkxGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkZhRVVzVTBGQlV5eEhRVUZITEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJSVFZDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTXpRaXhMUVVGTExGRkJRVkVzUTBGQlF5eEpRVUZKTzNkQ1FVTnFRaXhUUVVGVExFZEJRVWNzYlVKQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlF6bENMRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03ZDBKQlExb3NTMEZCU3l4RFFVRkRPMjlDUVVOUUxFdEJRVXNzVVVGQlVTeERRVUZETEUxQlFVMDdkMEpCUTI1Q0xGTkJRVk1zUjBGQlJ5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRPM2RDUVVOb1F5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRPM2RDUVVOYUxFdEJRVXNzUTBGQlF6dHZRa0ZEVUN4TFFVRkxMRkZCUVZFc1EwRkJReXhSUVVGUk8zZENRVU55UWl3clJVRkJLMFU3ZDBKQlF5OUZMR1ZCUVdVN2QwSkJRMllzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenMwUWtGRFpDeEpRVUZOTEZOQlFWTXNSMEZCWlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXpzMFFrRkRia1VzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU03WjBOQlF6TkRMRWxCUVUwc1VVRkJVU3hIUVVGSExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRPVUlzUlVGQlJTeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiME5CUTNoRExFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eGhRVUZoTEVWQlFVVXNVMEZCVXl4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2REUVVOdVJpeFRRVUZUTEVkQlFVY3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJRenQzUTBGRE1VSXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03YjBOQlF6RkNMRU5CUVVNN1owTkJRMFlzUTBGQlF6czBRa0ZEUml4RFFVRkRPelJDUVVGQkxFTkJRVU03ZDBKQlEwZ3NRMEZCUXp0M1FrRkRSQ3hMUVVGTExFTkJRVU03WjBKQlExSXNRMEZCUXp0blFrRkZSQ3d5UTBGQk1rTTdaMEpCUXpORExFbEJRVTBzUlVGQlJTeEhRVUZYTEVOQlFVTXNVVUZCVVN4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTTdaMEpCUXpkRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRkxGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNVMEZCVXl4RFFVRkRMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZGYkVVc2EwUkJRV3RFTzJkQ1FVTnNSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4TFFVRkxMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTTNReXhKUVVGTkxHTkJRV01zUjBGQmFVSXNTVUZCU1N4RFFVRkRMSGRDUVVGM1FpeERRVU5xUlN4UlFVRlJMRU5CUVVNc1VVRkJVU3hGUVVOcVFpeGhRVUZoTEV0QlFVc3NVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zWVVGQllTeEZRVUZGTEZGQlFWRXNRMEZCUXl4SFFVRkhMRkZCUVZFc1JVRkRNVVVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRVZCUVVVc1RVRkJUU3hEUVVGRExFVkJRek5DTEZOQlFWTXNRMEZEVkN4RFFVRkRPMjlDUVVOR0xFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzWTBGQll5eERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRE8zZENRVU5vUkN4SlFVRk5MRlZCUVZVc1IwRkJSeXhqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNKRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRPM2RDUVVNelFpeFRRVUZUTEVkQlFVY3NWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJRenQzUWtGRE9VSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNSVUZCUlN4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnFSeXhEUVVGRE8yOUNRVUZCTEVOQlFVTTdaMEpCUTBnc1EwRkJRenRaUVVOR0xFTkJRVU03V1VGRlJDeFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRPMWxCUTNCQ0xHRkJRV0VzUjBGQlJ5eFRRVUZUTEVOQlFVTTdXVUZETVVJc1lVRkJZU3hIUVVGSExGTkJRVk1zUTBGQlF6dFpRVU14UWl4aFFVRmhMRWRCUVVjc1UwRkJVeXhEUVVGRE8xbEJRekZDTEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNN1VVRkRja0lzUTBGQlF6dFJRVVZFTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJReXhEUVVGaExFVkJRVVVzUTBGQllUdFpRVU40UXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUTNCQ0xFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEwZ3NUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRKUVVObUxFTkJRVU03U1VGRlJEczdPenM3VDBGTFJ6dEpRVU5KTEdkRFFVRlhMRWRCUVd4Q0xGVkJRVzFDTEZGQlFXZENMRVZCUVVVc1QwRkJORUk3VVVGRGFFVXNTVUZCVFN4VlFVRlZMRWRCUVVjc1EwRkJReXhQUVVGUExFOUJRVThzUzBGQlN5eFJRVUZSTEVkQlFVY3NUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU5vUml4SlFVRk5MRk5CUVZNc1IwRkJaU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUXpGRUxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzVTBGQlV5eERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRE8xbEJRek5ETEVsQlFVMHNVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU01UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eExRVUZMTEVsQlFVa3NTVUZCU1N4UlFVRlJMRU5CUVVNc1MwRkJTeXhIUVVGSExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpWRUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTTdXVUZEYWtJc1EwRkJRenRSUVVOR0xFTkJRVU03VVVGRFJDeDNRa0ZCZDBJN1VVRkRlRUlzTUVKQlFUQkNPMUZCUXpGQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03VVVGRGRrTXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRlBSRHM3T3pzN08wOUJUVWM3U1VGRFNTeHBRMEZCV1N4SFFVRnVRaXhWUVVGdlFpeFJRVUZuUWp0UlFVTnVReXhyUkVGQmEwUTdVVUZEYkVRc2QwSkJRWGRDTzFGQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTm9SQ3gzUWtGQmQwSTdXVUZEZUVJc01FSkJRVEJDTzFsQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NVVUZCVVN4SFFVRkhMR1ZCUVdVc1EwRkJReXhEUVVGRE8xbEJRM3BFTEVOQlFVTTdVVUZEUml4RFFVRkRPMUZCUlVRc2EwSkJRV3RDTzFGQlEyeENMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNZMEZCWXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5zUkN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVTjBReXhEUVVGRE8xRkJSVVFzU1VGQlRTeE5RVUZOTEVkQlFXVXNSVUZCUlN4RFFVRkRPMUZCUXpsQ0xFbEJRVWtzWTBGQll5eEhRVUZYTEZGQlFWRXNRMEZCUXp0UlFVTjBReXhKUVVGSkxGZEJRVmNzUjBGQlVTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU5zUkN4bFFVRmxPMUZCUTJZc1QwRkJUeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkZMRU5CUVVNN1dVRkRNVU1zZDBKQlFYZENPMWxCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zWTBGQll5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJrUXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzVjBGQlZ5eEhRVUZITERKRFFVRXlRenR6UWtGRGJFWXNVVUZCVVN4SFFVRkhMRmRCUVZjc1IwRkJSeXhqUVVGakxFZEJRVWNzU1VGQlNTeERRVUZETEVOQlFVTTdXVUZEY0VRc1EwRkJRenRaUVVORUxHTkJRV01zUjBGQlJ5eFhRVUZYTEVOQlFVTTdXVUZETjBJc1YwRkJWeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRE8xRkJRMmhFTEVOQlFVTTdVVUZEUkN4M1FrRkJkMEk3VVVGRGVFSXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVmNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4WFFVRlhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTTdXVUZEY2tRc1NVRkJUU3hUUVVGVExFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJwRExFbEJRVTBzVVVGQlVTeEhRVUZoTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETlVRc1NVRkJTU3hMUVVGTExFZEJRVmNzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU51UkN4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOc1FpeExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUTJRc1EwRkJRenRaUVVWRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUTNaQ0xHMUNRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGRGNrUXNVVUZCVVN4RlFVTlNMRkZCUVZFc1MwRkJTeXhSUVVGUkxFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NiVUpCUVZFc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SlFVRkpMRzFDUVVGUkxFVkJRVVVzUlVGRE1VVXNVVUZCVVN4TFFVRkxMRkZCUVZFc1EwRkJReXhSUVVGUkxFZEJRVWNzVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkRiRVFzVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVTmFMRXRCUVVzc1EwRkRUQ3hEUVVGRExFTkJRVU03VVVGRFNpeERRVUZETzFGQlJVUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVmNzUlVGQlJTeERRVUZYTzFsQlEzQkRMR2xDUVVGcFFqdFpRVU5xUWl4M1FrRkJkMEk3V1VGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUzBGQlN5eEpRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1MwRkJTeXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTXhReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlExWXNRMEZCUXp0WlFVTkVMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEV0QlFVc3NTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJReXhMUVVGTExFdEJRVXNzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRNVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTFnc1EwRkJRenRaUVVORUxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRXRCUVVzc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEV0QlFVc3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRE1VTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOV0xFTkJRVU03V1VGRFJDeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTTFRaXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVZJTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzFGQlEzWkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRFppeERRVUZETzBsQlQwUTdPenM3T3p0UFFVMUhPMGxCUTBrc2FVTkJRVmtzUjBGQmJrSXNWVUZCYjBJc1VVRkJaMEk3VVVGRGJrTXNkVU5CUVhWRE8xRkJRM1pETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNZMEZCWXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5vUkN4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExHRkJRV0VzUjBGQlJ5eFJRVUZSTEVkQlFVY3NaVUZCWlN4RFFVRkRMRU5CUVVNN1VVRkROMFFzUTBGQlF6dFJRVVZFTEc5Q1FVRnZRanRSUVVOd1FpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExHTkJRV01zUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRiRVFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRGRFTXNRMEZCUXp0UlFVVkVMRWxCUVUwc1RVRkJUU3hIUVVGbExFVkJRVVVzUTBGQlF6dFJRVU01UWl4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVNelF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF6dFpRVU42UXl4SlFVRk5MRWxCUVVrc1IwRkJSeXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZGZUVJc1NVRkJUU3hSUVVGUkxFZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1MwRkJTeXhIUVVGSExFTkJRVU1zUzBGQlN5eEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTVSU3hKUVVGTkxFMUJRVTBzUjBGQlZ5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEycEVMRWxCUVUwc1RVRkJUU3hIUVVGWExFTkJRVU1zVFVGQlRTeExRVUZMTEUxQlFVMHNRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRTFCUVUwc1IwRkJSeXhSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETjBjc1NVRkJUU3hOUVVGTkxFZEJRVmNzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5xUkN4SlFVRk5MRXRCUVVzc1IwRkJWeXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU4yUkN4SlFVRk5MRk5CUVZNc1IwRkJXU3hKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM2hFTEVsQlFVMHNVMEZCVXl4SFFVRnRRaXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETVVNc1NVRkJUU3hYUVVGWExFZEJRVmNzYVVKQlFXbENMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03V1VGRmVrUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGRGRrSXNVVUZCVVN4RlFVTlNMRTFCUVUwc1JVRkRUaXhOUVVGTkxFVkJRMDRzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVTlFMRmRCUVZjc1JVRkRXQ3hOUVVGTkxFVkJRMDRzUzBGQlN5eEZRVU5NTEZOQlFWTXNSVUZEVkN4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc01FUkJRVEJFTzFsQlF6ZEhMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkRha1FzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVU5xUkN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVNMVFpeHRRa0ZCVVN4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRM1pETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGSExFZEJRVWNzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkROMElzUTBGQlF5eERRVUZETzFGQlJVd3NRMEZCUXp0UlFVVkVMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZYTEVWQlFVVXNRMEZCVnp0WlFVTndReXgzUWtGQmQwSTdXVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzcENMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFZpeERRVUZETzFsQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU12UWl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFdDeERRVUZETzFsQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJRMUFzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTldMRU5CUVVNN1VVRkRSaXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVZJTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzFGQlEzWkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRFppeERRVUZETzBsQlJVUTdPenRQUVVkSE8wbEJRMGtzYTBOQlFXRXNSMEZCY0VJc1ZVRkJjVUlzU1VGQldUdFJRVU5vUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnNRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTjBRaXhEUVVGRE8xRkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMFF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJRenRSUVVONFFpeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkRVQ3hOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNRMEZCUXp0UlFVTXhRaXhEUVVGRE8wbEJRMFlzUTBGQlF6dEpRVVZFT3pzN1QwRkhSenRKUVVOSkxHZERRVUZYTEVkQlFXeENMRlZCUVcxQ0xFVkJRVlU3VVVGRE5VSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hMUVVGTExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYkVJc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTTdVVUZEYmtJc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU14UWl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETERoQ1FVRTRRanRSUVVOdVJDeERRVUZETzFGQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEY2tNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTTdVVUZEY0VJc1EwRkJRenRSUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlExQXNkMEpCUVhkQ08xbEJRM2hDTERCQ1FVRXdRanRaUVVNeFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5XTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2RVSkJRWFZDTEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRMME1zUTBGQlF6dFJRVU5HTEVOQlFVTTdTVUZEUml4RFFVRkRPMGxCUlVRN096dFBRVWRITzBsQlEwa3NaME5CUVZjc1IwRkJiRUlzVlVGQmJVSXNSVUZCVlR0UlFVTTFRaXhGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEycEVMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEzSkNMRU5CUVVNN1VVRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTTNRaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVTndRaXhEUVVGRE8xRkJRMFFzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkROMElzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRja0lzUTBGQlF6dFJRVU5FTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRE8wbEJRM1JDTEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVOSkxDdENRVUZWTEVkQlFXcENMRlZCUVd0Q0xFVkJRVlVzUlVGQlJTeE5RVUZqTzFGQlF6TkRMRTFCUVUwc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYUVJc1MwRkJTeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzFsQlF6VkRMRXRCUVVzc1RVRkJUU3hEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0WlFVTjJSU3hMUVVGTExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRlRVVzTUVKQlFUQkNPMWxCUXpGQ08yZENRVU5ETEhkQ1FVRjNRanRuUWtGRGVFSXNNRUpCUVRCQ08yZENRVU14UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTldMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlExWXNRMEZCUXp0UlFVTklMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZEU1N4dFEwRkJZeXhIUVVGeVFpeFZRVUZ6UWl4RlFVRlZPMUZCUXk5Q0xFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNN1dVRkROVUlzUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzUkRMRTFCUVUwc1EwRkJWU3hEUVVGRExFTkJRVU03V1VGRGJrSXNRMEZCUXp0UlFVTkdMRU5CUVVNN1VVRkRSQ3gzUWtGQmQwSTdVVUZEZUVJc01FSkJRVEJDTzFGQlF6RkNMRVZCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEVml4TlFVRk5MRU5CUVVNc1owSkJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEZGtJc1EwRkJRenRKUVVOR0xFTkJRVU03U1VGRlJEczdPMDlCUjBjN1NVRkRTU3huUTBGQlZ5eEhRVUZzUWl4VlFVRnRRaXhGUVVGUE8xRkJRM3BDTEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFdpeExRVUZMTEVkQlFVY3NSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF6dFpRVU5xUXl4TFFVRkxMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVkQlFVY3NRMEZCUXp0WlFVTTFRaXhMUVVGTExFZEJRVWNzUlVGQlJTeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJRenRaUVVNMVFpeExRVUZMTEVkQlFVY3NSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF6dFpRVU0xUWl4TFFVRkxMRWRCUVVjc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXp0WlFVTTNRaXhMUVVGTExFVkJRVVVzUlVGQlJTeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVNMVFpeExRVUZMTEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF6dFpRVU01UWp0blFrRkRReXgzUWtGQmQwSTdaMEpCUTNoQ0xEQkNRVUV3UWp0blFrRkRNVUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRFZpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenRuUWtGRGNFSXNRMEZCUXp0UlFVTklMRU5CUVVNN1NVRkRSaXhEUVVGRE8wbEJkQ3RDUkRzN1QwRkZSenRKUVVOWkxHOUNRVUZUTEVkQlFXVXNTVUZCU1N4RFFVRkRPMGxCY1N0Q04wTXNhVUpCUVVNN1FVRkJSQ3hEUVVGRExFRkJNU3RDUkN4SlFUQXJRa003UVVFeEswSlpMR3RDUVVGVkxHRkJNQ3RDZEVJc1EwRkJRVHRCUVZORU96dEhRVVZITzBGQlEwZ3NjMEpCUVhOQ0xFbEJRVk03U1VGRE9VSXNTVUZCVFN4TlFVRk5MRWRCUVdVN1VVRkRNVUlzVlVGQlZTeEZRVUZGTEVsQlFVazdVVUZEYUVJc1ZVRkJWU3hGUVVGRkxFbEJRVWs3VVVGRGFFSXNVMEZCVXl4RlFVRkZMRWxCUVVrN1VVRkRaaXhUUVVGVExFVkJRVVVzU1VGQlNUdExRVU5tTEVOQlFVTTdTVUZGUml4M1FrRkJkMEk3U1VGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1QwRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRMMElzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4MVFrRkJkVUlzUTBGQlF5eERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkRSQ3gzUWtGQmQwSTdTVUZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU51UXl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEUkNRVUUwUWl4RFFVRkRMRU5CUVVNN1NVRkRMME1zUTBGQlF6dEpRVU5FTEhkQ1FVRjNRanRKUVVONFFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTI1RExFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNORUpCUVRSQ0xFTkJRVU1zUTBGQlF6dEpRVU12UXl4RFFVRkRPMGxCUlVRc2FVSkJRV2xDTzBsQlEycENMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzVVVGQlVTeEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMnBETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlF5eEpRVUZOTEU5QlFVOHNSMEZCVVN4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFsQlF6RkRMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU51UXl4M1EwRkJkME03WjBKQlEzaERMSGRDUVVGM1FqdG5Ra0ZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMR05CUVdNc1EwRkJVeXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTJwRUxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzVVVGQlVTeEhRVUZITEdkQ1FVRm5RaXhIUVVGWExFOUJRVThzUjBGQlJ5dzBRa0ZCTkVJc1EwRkJReXhEUVVGRE8yZENRVU55U0N4RFFVRkRPMWxCUTBZc1EwRkJRenRaUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTlFMSGRDUVVGM1FqdG5Ra0ZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZETjBJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhSUVVGUkxFZEJRVWNzY1VOQlFYRkRMRU5CUVVNc1EwRkJRenRuUWtGRGVrWXNRMEZCUXp0blFrRkRSQ3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJRenR2UWtGRGVrTXNTVUZCVFN4TFFVRkxMRWRCUVZFc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTTVRaXgzUWtGQmQwSTdiMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUXpOQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NZMEZCWXl4SFFVRkhMRkZCUVZFc1IwRkJSeXh2UWtGQmIwSXNRMEZCUXl4RFFVRkRPMjlDUVVNdlJpeERRVUZETzI5Q1FVTkVMSGRDUVVGM1FqdHZRa0ZEZUVJc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU40UWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExGRkJRVkVzUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExHTkJRV01zUjBGQlJ5eFJRVUZSTEVkQlFVY3NiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dHZRa0ZETDBZc1EwRkJRenR2UWtGRFJDeDNRa0ZCZDBJN2IwSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMnhETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1kwRkJZeXhIUVVGSExGRkJRVkVzUjBGQlJ5eHBRMEZCYVVNc1EwRkJReXhEUVVGRE8yOUNRVU0xUnl4RFFVRkRPMjlDUVVORUxFbEJRVTBzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpGRExIZENRVUYzUWp0dlFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEYmtJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eGpRVUZqTEVkQlFVY3NVVUZCVVN4SFFVRkhMREpEUVVFeVF5eERRVUZETEVOQlFVTTdiMEpCUTNSSUxFTkJRVU03YjBKQlEwUXNkMEpCUVhkQ08yOUNRVU40UWl4RlFVRkZMRU5CUVVNc1EwRkJReXhQUVVGUExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8zZENRVU5zUXl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExGRkJRVkVzUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExHTkJRV01zUjBGQlJ5eFJRVUZSTEVkQlFVY3NhME5CUVd0RExFTkJRVU1zUTBGQlF6dHZRa0ZETjBjc1EwRkJRenR2UWtGRFJDeDNRa0ZCZDBJN2IwSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMnhETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1kwRkJZeXhIUVVGSExGRkJRVkVzUjBGQlJ5eHBRMEZCYVVNc1EwRkJReXhEUVVGRE8yOUNRVU0xUnl4RFFVRkRPMjlDUVVORUxIZENRVUYzUWp0dlFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzVVVGQlVTeEpRVUZKTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjJSQ3hOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEdOQlFXTXNSMEZCUnl4UlFVRlJMRWRCUVVjc01rTkJRVEpETEVOQlFVTXNRMEZCUXp0dlFrRkRkRWdzUTBGQlF6dHZRa0ZEUkN4M1FrRkJkMEk3YjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFOUJRVThzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRkZCUVZFc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRka1VzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4alFVRmpMRWRCUVVjc1VVRkJVU3hIUVVGSExEUkRRVUUwUXl4RFFVRkRMRU5CUVVNN2IwSkJRM1pJTEVOQlFVTTdiMEpCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEZOQlFWTXNTMEZCU3l4SlFVRkpMRWxCUVVrc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNMVJDeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRTFCUVUwc1EwRkJRenR2UWtGRE0wSXNRMEZCUXp0dlFrRkRSQ3hGUVVGRkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNVMEZCVXl4TFFVRkxMRWxCUVVrc1NVRkJTU3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRelZFTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRE8yOUNRVU16UWl4RFFVRkRPMmRDUVVOR0xFTkJRVU03V1VGRFJpeERRVUZETzFGQlEwWXNRMEZCUXp0SlFVTkdMRU5CUVVNN1NVRkZSQ3hwUWtGQmFVSTdTVUZEYWtJc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeFJRVUZSTEVsQlFVa3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRGFrTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM3BETEVsQlFVMHNUMEZCVHl4SFFVRlJMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZETVVNc2QwSkJRWGRDTzFsQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlF6ZENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYlVKQlFXMUNMRWRCUVVjc1VVRkJVU3hIUVVGSExHOUNRVUZ2UWl4RFFVRkRMRU5CUVVNN1dVRkRlRVVzUTBGQlF6dFpRVU5FTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NUMEZCVHl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETzJkQ1FVTjZReXhKUVVGTkxFbEJRVWtzUjBGQlJ5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM1pDTEhkQ1FVRjNRanRuUWtGRGVrSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenR2UWtGRE1VSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzVVVGQlVTeEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEcxQ1FVRnRRaXhEUVVGRExFTkJRVU03WjBKQlEyeEdMRU5CUVVNN1owSkJRMEVzZDBKQlFYZENPMmRDUVVONlFpeEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUTNKQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRkZCUVZFc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXh6UWtGQmMwSXNRMEZCUXl4RFFVRkRPMmRDUVVOeVJpeERRVUZETzJkQ1FVTkVMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRPMjlDUVVOMFF5eDNRa0ZCZDBJN2IwSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzVDBGQlR5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZETlVNc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NVVUZCVVN4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRzFDUVVGdFFpeERRVUZETEVOQlFVTTdiMEpCUXpGSExFTkJRVU03WjBKQlEwWXNRMEZCUXp0blFrRkRSQ3gzUWtGQmQwSTdaMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhMUVVGTExFbEJRVWtzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRM1pFTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExGRkJRVkVzUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eHpRa0ZCYzBJc1EwRkJReXhEUVVGRE8yZENRVU55Uml4RFFVRkRPMmRDUVVORUxIZENRVUYzUWp0blFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFMUJRVTBzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1MwRkJTeXhKUVVGSkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVNM1JTeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhSUVVGUkxFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzYlVOQlFXMURMRU5CUVVNc1EwRkJRenRuUWtGRGJFY3NRMEZCUXp0blFrRkRSQ3gzUWtGQmQwSTdaMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRek5ETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExGRkJRVkVzUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8yZENRVU42Uml4RFFVRkRPMmRDUVVORUxIZENRVUYzUWp0blFrRkRlRUlzUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1RVRkJUU3hKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzNWQ1FVTXZSQ3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVTXZSQ3hEUVVGRExFTkJRVU1zUTBGQlF6dHZRa0ZEUml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFJRVUZSTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NkME5CUVhkRExFTkJRVU1zUTBGQlF6dG5Ra0ZEZGtjc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlF6ZENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEZGQlFWRXNSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4elFrRkJjMElzUTBGQlF5eERRVUZETzJkQ1FVTnlSaXhEUVVGRE8yZENRVU5FTEhkQ1FVRjNRanRuUWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU14UWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFJRVUZSTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NlVUpCUVhsQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVZc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOeVF5eE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhSUVVGUkxFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzZVVKQlFYbENMRU5CUVVNc1EwRkJRenRuUWtGRGVFWXNRMEZCUXp0blFrRkRSQ3gzUWtGQmQwSTdaMEpCUTNoQ0xFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTnlReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4UlFVRlJMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc2VVSkJRWGxDTEVOQlFVTXNRMEZCUXp0blFrRkRlRVlzUTBGQlF6dG5Ra0ZEUkN4M1FrRkJkMEk3WjBKQlEzaENMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU55UXl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFJRVUZSTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NlVUpCUVhsQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZEZUVZc1EwRkJRenRuUWtGRFJDeDNRa0ZCZDBJN1owSkJRM2hDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSenQxUWtGRE4wUXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03YjBKQlF6TkdMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEZGQlFWRXNSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl3MlEwRkJOa01zUTBGQlF5eERRVUZETzJkQ1FVTTFSeXhEUVVGRE8yZENRVU5FTEVsQlFVMHNTVUZCU1N4SFFVRlhMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1owSkJRek5ETEhkQ1FVRjNRanRuUWtGRGVFSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRha0lzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1VVRkJVU3hIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExITkRRVUZ6UXl4RFFVRkRMRU5CUVVNN1owSkJRM0pITEVOQlFVTTdaMEpCUTBRc1JVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2IwSkJRMmhDTEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhWUVVGVkxFdEJRVXNzU1VGQlNTeEpRVUZKTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZETlVRc1RVRkJUU3hEUVVGRExGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdiMEpCUXpGQ0xFTkJRVU03YjBKQlEwUXNSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUzBGQlN5eEpRVUZKTEVsQlFVa3NTVUZCU1N4SFFVRkhMRTFCUVUwc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTFSQ3hOUVVGTkxFTkJRVU1zVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXp0dlFrRkRNVUlzUTBGQlF6dG5Ra0ZEUml4RFFVRkRPMWxCUTBZc1EwRkJRenRSUVVOR0xFTkJRVU03U1VGRFJpeERRVUZETzBsQlJVUXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVObUxFTkJRVU1pZlE9PSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBfX2V4cG9ydChtKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuX19leHBvcnQocmVxdWlyZShcIi4vYmFzaWNzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vZGF0ZXRpbWVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9kdXJhdGlvblwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2Zvcm1hdFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2dsb2JhbHNcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vcGFyc2VcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9wZXJpb2RcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9iYXNpY3NcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi90aW1lc291cmNlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vdGltZXpvbmVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFXNWtaWGd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZiR2xpTDJsdVpHVjRMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPMGRCU1VjN1FVRkZTQ3haUVVGWkxFTkJRVU03T3pzN1FVRkZZaXhwUWtGQll5eFZRVUZWTEVOQlFVTXNSVUZCUVR0QlFVTjZRaXhwUWtGQll5eFpRVUZaTEVOQlFVTXNSVUZCUVR0QlFVTXpRaXhwUWtGQll5eFpRVUZaTEVOQlFVTXNSVUZCUVR0QlFVTXpRaXhwUWtGQll5eFZRVUZWTEVOQlFVTXNSVUZCUVR0QlFVTjZRaXhwUWtGQll5eFhRVUZYTEVOQlFVTXNSVUZCUVR0QlFVTXhRaXhwUWtGQll5eGpRVUZqTEVOQlFVTXNSVUZCUVR0QlFVTTNRaXhwUWtGQll5eFRRVUZUTEVOQlFVTXNSVUZCUVR0QlFVTjRRaXhwUWtGQll5eFZRVUZWTEVOQlFVTXNSVUZCUVR0QlFVTjZRaXhwUWtGQll5eFZRVUZWTEVOQlFVTXNSVUZCUVR0QlFVTjZRaXhwUWtGQll5eGpRVUZqTEVOQlFVTXNSVUZCUVR0QlFVTTNRaXhwUWtGQll5eFpRVUZaTEVOQlFVTXNSVUZCUVR0QlFVTXpRaXhwUWtGQll5eGxRVUZsTEVOQlFVTXNSVUZCUVNKOSJdfQ==
