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
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }) : a);
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
        var localTime = (typeof a === "number" ? new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }) : a);
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
            TzDatabase._instance = new TzDatabase([data]);
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
            if (data_1.length === 0 && require && require) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZm9ybWF0LmpzIiwiZGlzdC9saWIvZ2xvYmFscy5qcyIsImRpc3QvbGliL2phdmFzY3JpcHQuanMiLCJkaXN0L2xpYi9tYXRoLmpzIiwiZGlzdC9saWIvcGFyc2UuanMiLCJkaXN0L2xpYi9wZXJpb2QuanMiLCJkaXN0L2xpYi9zdHJpbmdzLmpzIiwiZGlzdC9saWIvdGltZXNvdXJjZS5qcyIsImRpc3QvbGliL3RpbWV6b25lLmpzIiwiZGlzdC9saWIvdG9rZW4uanMiLCJkaXN0L2xpYi90ei1kYXRhYmFzZS5qcyIsImRpc3QvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25mQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOTlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTYgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xyXG4gICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmRlZmF1bHQgPSBhc3NlcnQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydC5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGphdmFzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG4vKipcclxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcclxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcclxuICovXHJcbihmdW5jdGlvbiAoV2Vla0RheSkge1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiU3VuZGF5XCJdID0gMF0gPSBcIlN1bmRheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiTW9uZGF5XCJdID0gMV0gPSBcIk1vbmRheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVHVlc2RheVwiXSA9IDJdID0gXCJUdWVzZGF5XCI7XHJcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJXZWRuZXNkYXlcIl0gPSAzXSA9IFwiV2VkbmVzZGF5XCI7XHJcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJUaHVyc2RheVwiXSA9IDRdID0gXCJUaHVyc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiRnJpZGF5XCJdID0gNV0gPSBcIkZyaWRheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiU2F0dXJkYXlcIl0gPSA2XSA9IFwiU2F0dXJkYXlcIjtcclxufSkoZXhwb3J0cy5XZWVrRGF5IHx8IChleHBvcnRzLldlZWtEYXkgPSB7fSkpO1xyXG52YXIgV2Vla0RheSA9IGV4cG9ydHMuV2Vla0RheTtcclxuLyoqXHJcbiAqIFRpbWUgdW5pdHNcclxuICovXHJcbihmdW5jdGlvbiAoVGltZVVuaXQpIHtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWlsbGlzZWNvbmRcIl0gPSAwXSA9IFwiTWlsbGlzZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiU2Vjb25kXCJdID0gMV0gPSBcIlNlY29uZFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNaW51dGVcIl0gPSAyXSA9IFwiTWludXRlXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIkhvdXJcIl0gPSAzXSA9IFwiSG91clwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJEYXlcIl0gPSA0XSA9IFwiRGF5XCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIldlZWtcIl0gPSA1XSA9IFwiV2Vla1wiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNb250aFwiXSA9IDZdID0gXCJNb250aFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJZZWFyXCJdID0gN10gPSBcIlllYXJcIjtcclxuICAgIC8qKlxyXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXHJcbiAgICAgKi9cclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTUFYXCJdID0gOF0gPSBcIk1BWFwiO1xyXG59KShleHBvcnRzLlRpbWVVbml0IHx8IChleHBvcnRzLlRpbWVVbml0ID0ge30pKTtcclxudmFyIFRpbWVVbml0ID0gZXhwb3J0cy5UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEFwcHJveGltYXRlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGEgdGltZSB1bml0LlxyXG4gKiBBIGRheSBpcyBhc3N1bWVkIHRvIGhhdmUgMjQgaG91cnMsIGEgbW9udGggaXMgYXNzdW1lZCB0byBlcXVhbCAzMCBkYXlzXHJcbiAqIGFuZCBhIHllYXIgaXMgc2V0IHRvIDM2MCBkYXlzIChiZWNhdXNlIDEyIG1vbnRocyBvZiAzMCBkYXlzKS5cclxuICpcclxuICogQHBhcmFtIHVuaXRcdFRpbWUgdW5pdCBlLmcuIFRpbWVVbml0Lk1vbnRoXHJcbiAqIEByZXR1cm5zXHRUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cclxuICovXHJcbmZ1bmN0aW9uIHRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCkge1xyXG4gICAgc3dpdGNoICh1bml0KSB7XHJcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogcmV0dXJuIDE7XHJcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHJldHVybiAxMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuSG91cjogcmV0dXJuIDYwICogNjAgKiAxMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuRGF5OiByZXR1cm4gODY0MDAwMDA7XHJcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTW9udGg6IHJldHVybiAzMCAqIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuWWVhcjogcmV0dXJuIDEyICogMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMgPSB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzO1xyXG4vKipcclxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cclxuICogaWYgbmVjZXNzYXJ5LlxyXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxyXG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcclxuICovXHJcbmZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdCwgYW1vdW50KSB7XHJcbiAgICBpZiAoYW1vdW50ID09PSB2b2lkIDApIHsgYW1vdW50ID0gMTsgfVxyXG4gICAgdmFyIHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoYW1vdW50ID09PSAxIHx8IGFtb3VudCA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIFwic1wiO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IHRpbWVVbml0VG9TdHJpbmc7XHJcbmZ1bmN0aW9uIHN0cmluZ1RvVGltZVVuaXQocykge1xyXG4gICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG4gICAgICAgIHZhciBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XHJcbiAgICAgICAgaWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxufVxyXG5leHBvcnRzLnN0cmluZ1RvVGltZVVuaXQgPSBzdHJpbmdUb1RpbWVVbml0O1xyXG4vKipcclxuICogQHJldHVybiBUcnVlIGlmZiB0aGUgZ2l2ZW4geWVhciBpcyBhIGxlYXAgeWVhci5cclxuICovXHJcbmZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xyXG4gICAgLy8gZnJvbSBXaWtpcGVkaWE6XHJcbiAgICAvLyBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNCB0aGVuIGNvbW1vbiB5ZWFyXHJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSAxMDAgdGhlbiBsZWFwIHllYXJcclxuICAgIC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXHJcbiAgICAvLyBlbHNlIGxlYXAgeWVhclxyXG4gICAgaWYgKHllYXIgJSA0ICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuaXNMZWFwWWVhciA9IGlzTGVhcFllYXI7XHJcbi8qKlxyXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcclxuICovXHJcbmZ1bmN0aW9uIGRheXNJblllYXIoeWVhcikge1xyXG4gICAgcmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcclxufVxyXG5leHBvcnRzLmRheXNJblllYXIgPSBkYXlzSW5ZZWFyO1xyXG4vKipcclxuICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxyXG4gKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XHJcbiAgICBzd2l0Y2ggKG1vbnRoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgIGNhc2UgODpcclxuICAgICAgICBjYXNlIDEwOlxyXG4gICAgICAgIGNhc2UgMTI6XHJcbiAgICAgICAgICAgIHJldHVybiAzMTtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgIHJldHVybiAzMDtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoOiBcIiArIG1vbnRoKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmRheXNJbk1vbnRoID0gZGF5c0luTW9udGg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXkgb2YgdGhlIHllYXIgb2YgdGhlIGdpdmVuIGRhdGUgWzAuLjM2NV0uIEphbnVhcnkgZmlyc3QgaXMgMC5cclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGUuZy4gMTk4NlxyXG4gKiBAcGFyYW0gbW9udGggTW9udGggMS0xMlxyXG4gKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIk1vbnRoIG91dCBvZiByYW5nZVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xyXG4gICAgdmFyIHllYXJEYXkgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBtb250aDsgaSsrKSB7XHJcbiAgICAgICAgeWVhckRheSArPSBkYXlzSW5Nb250aCh5ZWFyLCBpKTtcclxuICAgIH1cclxuICAgIHllYXJEYXkgKz0gKGRheSAtIDEpO1xyXG4gICAgcmV0dXJuIHllYXJEYXk7XHJcbn1cclxuZXhwb3J0cy5kYXlPZlllYXIgPSBkYXlPZlllYXI7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcclxuICpcclxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgd2Vla0RheSkge1xyXG4gICAgdmFyIGVuZE9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkgfSk7XHJcbiAgICB2YXIgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gZW5kT2ZNb250aFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICBkaWZmIC09IDc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5sYXN0V2Vla0RheU9mTW9udGggPSBsYXN0V2Vla0RheU9mTW9udGg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKi9cclxuZnVuY3Rpb24gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgd2Vla0RheSkge1xyXG4gICAgdmFyIGJlZ2luT2ZNb250aCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IDEgfSk7XHJcbiAgICB2YXIgYmVnaW5PZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGJlZ2luT2ZNb250aC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGJlZ2luT2ZNb250aFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICBkaWZmICs9IDc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmVnaW5PZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLmZpcnN0V2Vla0RheU9mTW9udGggPSBmaXJzdFdlZWtEYXlPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzID49IHRoZSBnaXZlbiBkYXkuXHJcbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCBtb250aCwgZGF5LCB3ZWVrRGF5KSB7XHJcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XHJcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICBkaWZmICs9IDc7XHJcbiAgICB9XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XHJcbiAgICByZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMud2Vla0RheU9uT3JBZnRlciA9IHdlZWtEYXlPbk9yQWZ0ZXI7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPD0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyLCBtb250aCwgZGF5LCB3ZWVrRGF5KSB7XHJcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XHJcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICBkaWZmIC09IDc7XHJcbiAgICB9XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA+PSAxLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLndlZWtEYXlPbk9yQmVmb3JlID0gd2Vla0RheU9uT3JCZWZvcmU7XHJcbi8qKlxyXG4gKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICpcclxuICogQHBhcmFtIHllYXIgVGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoIFRoZSBtb250aCBbMS0xMl1cclxuICogQHBhcmFtIGRheSBUaGUgZGF5IFsxLTMxXVxyXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICB2YXIgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xyXG4gICAgdmFyIGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgLy8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiB3ZWVrIDEgb3IgbGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcbiAgICBpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuICAgICAgICBpZiAoZmlyc3RUaHVyc2RheSA8IGZpcnN0TW9uZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMVxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIExhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgICAgICAgICBpZiAobW9udGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IGNhc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIDMxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEphbnVhcnlcclxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBsYXN0TW9uZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XHJcbiAgICB2YXIgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgaWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XHJcbiAgICAgICAgaWYgKGxhc3RNb25kYXkgPiBsYXN0VGh1cnNkYXkpIHtcclxuICAgICAgICAgICAgLy8gV2VlayAxIG9mIG5leHQgbW9udGhcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gTm9ybWFsIGNhc2VcclxuICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XHJcbiAgICBpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcclxuICAgICAgICByZXN1bHQgKz0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy53ZWVrT2ZNb250aCA9IHdlZWtPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLXllYXIgb2YgdGhlIE1vbmRheSBvZiB3ZWVrIDEgaW4gdGhlIGdpdmVuIHllYXIuXHJcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcclxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcclxuICovXHJcbmZ1bmN0aW9uIGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcikge1xyXG4gICAgLy8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcclxuICAgIHZhciByZXN1bHQgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XHJcbiAgICBpZiAocmVzdWx0ID4gMykge1xyXG4gICAgICAgIHJlc3VsdCAtPSA3O1xyXG4gICAgICAgIGlmIChyZXN1bHQgPCAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmRheXNJblllYXIoeWVhciAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlciBmb3IgdGhlIGdpdmVuIGRhdGUuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IG9mIG1vbnRoIDEtMzFcclxuICpcclxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgIHZhciBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XHJcbiAgICAvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuICAgIGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcclxuICAgICAgICB2YXIgbmV4dFllYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyICsgMSk7XHJcbiAgICAgICAgaWYgKG5leHRZZWFyV2Vla09uZSA+IDQgJiYgbmV4dFllYXJXZWVrT25lIDw9IGRveSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG4gICAgdmFyIHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XHJcbiAgICBpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xyXG4gICAgICAgIC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXHJcbiAgICAgICAgdmFyIHdlZWtUd28gPSB0aGlzWWVhcldlZWtPbmUgKyA3IC0gZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcbiAgICAgICAgaWYgKGRveSA8IHdlZWtUd28pIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gV2VlayAxIGlzIGVudGlyZWx5IGluc2lkZSB0aGlzIHllYXIuXHJcbiAgICBpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcbiAgICAgICAgLy8gVGhlIGRhdGUgaXMgcGFydCBvZiB0aGUgbGFzdCB3ZWVrIG9mIHByZXYgeWVhci5cclxuICAgICAgICByZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcclxuICAgIH1cclxuICAgIC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcclxuICAgIHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB0aGlzWWVhcldlZWtPbmUpIC8gNykgKyAxO1xyXG59XHJcbmV4cG9ydHMud2Vla051bWJlciA9IHdlZWtOdW1iZXI7XHJcbmZ1bmN0aW9uIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcykge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XHJcbn1cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmZ1bmN0aW9uIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcbiAgICB2YXIgdGVtcCA9IHVuaXhNaWxsaXM7XHJcbiAgICB2YXIgcmVzdWx0ID0geyB5ZWFyOiAwLCBtb250aDogMCwgZGF5OiAwLCBob3VyOiAwLCBtaW51dGU6IDAsIHNlY29uZDogMCwgbWlsbGk6IDAgfTtcclxuICAgIHZhciB5ZWFyO1xyXG4gICAgdmFyIG1vbnRoO1xyXG4gICAgaWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG4gICAgICAgIHJlc3VsdC5taWxsaSA9IHRlbXAgJSAxMDAwO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuICAgICAgICByZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcbiAgICAgICAgcmVzdWx0Lm1pbnV0ZSA9IHRlbXAgJSA2MDtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5ob3VyID0gdGVtcCAlIDI0O1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcbiAgICAgICAgeWVhciA9IDE5NzA7XHJcbiAgICAgICAgd2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xyXG4gICAgICAgICAgICB0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XHJcbiAgICAgICAgICAgIHllYXIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xyXG4gICAgICAgIG1vbnRoID0gMTtcclxuICAgICAgICB3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuICAgICAgICAgICAgdGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcbiAgICAgICAgICAgIG1vbnRoKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5tb250aCA9IG1vbnRoO1xyXG4gICAgICAgIHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIE5vdGUgdGhhdCBhIG5lZ2F0aXZlIG51bWJlciBtb2R1bG8gc29tZXRoaW5nIHlpZWxkcyBhIG5lZ2F0aXZlIG51bWJlci5cclxuICAgICAgICAvLyBXZSBtYWtlIGl0IHBvc2l0aXZlIGJ5IGFkZGluZyB0aGUgbW9kdWxvLlxyXG4gICAgICAgIHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xyXG4gICAgICAgIHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcclxuICAgICAgICB5ZWFyID0gMTk2OTtcclxuICAgICAgICB3aGlsZSAodGVtcCA8IC1kYXlzSW5ZZWFyKHllYXIpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcclxuICAgICAgICAgICAgeWVhci0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQueWVhciA9IHllYXI7XHJcbiAgICAgICAgbW9udGggPSAxMjtcclxuICAgICAgICB3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuICAgICAgICAgICAgdGVtcCArPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcbiAgICAgICAgICAgIG1vbnRoLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5tb250aCA9IG1vbnRoO1xyXG4gICAgICAgIHJlc3VsdC5kYXkgPSB0ZW1wICsgMSArIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy51bml4VG9UaW1lTm9MZWFwU2VjcyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzO1xyXG4vKipcclxuICogRmlsbCB5b3UgYW55IG1pc3NpbmcgdGltZSBjb21wb25lbnQgcGFydHMsIGRlZmF1bHRzIGFyZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cykge1xyXG4gICAgdmFyIGlucHV0ID0ge1xyXG4gICAgICAgIHllYXI6IHR5cGVvZiBjb21wb25lbnRzLnllYXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnllYXIgOiAxOTcwLFxyXG4gICAgICAgIG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG4gICAgICAgIGRheTogdHlwZW9mIGNvbXBvbmVudHMuZGF5ID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5kYXkgOiAxLFxyXG4gICAgICAgIGhvdXI6IHR5cGVvZiBjb21wb25lbnRzLmhvdXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmhvdXIgOiAwLFxyXG4gICAgICAgIG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG4gICAgICAgIHNlY29uZDogdHlwZW9mIGNvbXBvbmVudHMuc2Vjb25kID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5zZWNvbmQgOiAwLFxyXG4gICAgICAgIG1pbGxpOiB0eXBlb2YgY29tcG9uZW50cy5taWxsaSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWlsbGkgOiAwLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBpbnB1dDtcclxufVxyXG5mdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgIHZhciBjb21wb25lbnRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9IDogYSk7XHJcbiAgICB2YXIgaW5wdXQgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcclxuICAgIHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoaW5wdXQuc2Vjb25kICsgaW5wdXQubWludXRlICogNjAgKyBpbnB1dC5ob3VyICogMzYwMCArIGRheU9mWWVhcihpbnB1dC55ZWFyLCBpbnB1dC5tb250aCwgaW5wdXQuZGF5KSAqIDg2NDAwICtcclxuICAgICAgICAoaW5wdXQueWVhciAtIDE5NzApICogMzE1MzYwMDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTk2OSkgLyA0KSAqIDg2NDAwIC1cclxuICAgICAgICBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG59XHJcbmV4cG9ydHMudGltZVRvVW5peE5vTGVhcFNlY3MgPSB0aW1lVG9Vbml4Tm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIFJldHVybiB0aGUgZGF5LW9mLXdlZWsuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKi9cclxuZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpcykge1xyXG4gICAgYXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuICAgIHZhciBlcG9jaERheSA9IFdlZWtEYXkuVGh1cnNkYXk7XHJcbiAgICB2YXIgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XHJcbiAgICByZXR1cm4gKGVwb2NoRGF5ICsgZGF5cykgJSA3O1xyXG59XHJcbmV4cG9ydHMud2Vla0RheU5vTGVhcFNlY3MgPSB3ZWVrRGF5Tm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIE4tdGggc2Vjb25kIGluIHRoZSBkYXksIGNvdW50aW5nIGZyb20gMFxyXG4gKi9cclxuZnVuY3Rpb24gc2Vjb25kT2ZEYXkoaG91ciwgbWludXRlLCBzZWNvbmQpIHtcclxuICAgIHJldHVybiAoKChob3VyICogNjApICsgbWludXRlKSAqIDYwKSArIHNlY29uZDtcclxufVxyXG5leHBvcnRzLnNlY29uZE9mRGF5ID0gc2Vjb25kT2ZEYXk7XHJcbi8qKlxyXG4gKiBCYXNpYyByZXByZXNlbnRhdGlvbiBvZiBhIGRhdGUgYW5kIHRpbWVcclxuICovXHJcbnZhciBUaW1lU3RydWN0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVGltZVN0cnVjdChhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXhNaWxsaXMgPSBhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSB0aGUgZ2l2ZW4geWVhciwgbW9udGgsIGRheSBldGNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuICAgICAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG4gICAgICogQHBhcmFtIGRheVx0RGF5IDEtMzFcclxuICAgICAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuICAgICAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XHJcbiAgICAgKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxyXG4gICAgICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21Db21wb25lbnRzID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXHJcbiAgICAgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tVW5peCA9IGZ1bmN0aW9uICh1bml4TWlsbGlzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRcdFRoZSBkYXRlXHJcbiAgICAgKiBAcGFyYW0gZGZcdFdoaWNoIGZ1bmN0aW9ucyB0byB0YWtlIChnZXRYKCkgb3IgZ2V0VVRDWCgpKVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21EYXRlID0gZnVuY3Rpb24gKGQsIGRmKSB7XHJcbiAgICAgICAgaWYgKGRmID09PSBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXHJcbiAgICAgICAgICAgICAgICBob3VyOiBkLmdldEhvdXJzKCksIG1pbnV0ZTogZC5nZXRNaW51dGVzKCksIHNlY29uZDogZC5nZXRTZWNvbmRzKCksIG1pbGxpOiBkLmdldE1pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXHJcbiAgICAgICAgICAgICAgICBob3VyOiBkLmdldFVUQ0hvdXJzKCksIG1pbnV0ZTogZC5nZXRVVENNaW51dGVzKCksIHNlY29uZDogZC5nZXRVVENTZWNvbmRzKCksIG1pbGxpOiBkLmdldFVUQ01pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHllYXIgPSAxOTcwO1xyXG4gICAgICAgICAgICB2YXIgbW9udGggPSAxO1xyXG4gICAgICAgICAgICB2YXIgZGF5ID0gMTtcclxuICAgICAgICAgICAgdmFyIGhvdXIgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbWludXRlID0gMDtcclxuICAgICAgICAgICAgdmFyIHNlY29uZCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBmcmFjdGlvbk1pbGxpcyA9IDA7XHJcbiAgICAgICAgICAgIHZhciBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgIC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gcy50cmltKCkuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcclxuICAgICAgICAgICAgLy8gcGFyc2UgbWFpbiBwYXJ0XHJcbiAgICAgICAgICAgIHZhciBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcclxuICAgICAgICAgICAgaWYgKGlzQmFzaWNGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksIFwiSVNPIHN0cmluZyBpbiBiYXNpYyBub3RhdGlvbiBtYXkgb25seSBjb250YWluIG51bWJlcnMgYmVmb3JlIHRoZSBmcmFjdGlvbmFsIHBhcnRcIik7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxyXG4gICAgICAgICAgICAgICAgc3BsaXRbMF0gPSBzcGxpdFswXS5yZXBsYWNlKFwiVFwiLCBcIlwiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoWzQsIDgsIDEwLCAxMiwgMTRdLmluZGV4T2Yoc3BsaXRbMF0ubGVuZ3RoKSAhPT0gLTEsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVBbmRUaW1lID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IHNwbGl0WzBdLnNwbGl0KFwiVFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMubGVuZ3RoID4gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXS5zdWJzdHIoMCwgMTApLCBzcGxpdFswXS5zdWJzdHIoMTApXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoWzQsIDEwXS5pbmRleE9mKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCkgIT09IC0xLCBcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGRheSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig4LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoMCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoMywgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cig2LCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBwYXJzZUZsb2F0KFwiMC5cIiArIHNwbGl0WzFdKTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAobGFzdFVuaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gZGF5c0luWWVhcih5ZWFyKSAqIDg2NDAwMDAwICogZnJhY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gMzYwMDAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDYwMDAwICogZnJhY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG4gICAgICAgICAgICBtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG4gICAgICAgICAgICBkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcbiAgICAgICAgICAgIGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG4gICAgICAgICAgICBtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcbiAgICAgICAgICAgIHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuICAgICAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCB9KTtcclxuICAgICAgICAgICAgdW5peE1pbGxpcyA9IG1hdGgucm91bmRTeW0odW5peE1pbGxpcyArIGZyYWN0aW9uTWlsbGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIlwiICsgcyArIFwiXFxcIjogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwidW5peE1pbGxpc1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl91bml4TWlsbGlzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLl9jb21wb25lbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJjb21wb25lbnRzXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gdW5peFRvVGltZU5vTGVhcFNlY3ModGhpcy5fdW5peE1pbGxpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwieWVhclwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMueWVhcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtb250aFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiZGF5XCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiaG91clwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuaG91cjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtaW51dGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJzZWNvbmRcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtaWxsaVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS55ZWFyRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBkYXlPZlllYXIodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aCwgdGhpcy5jb21wb25lbnRzLmRheSk7XHJcbiAgICB9O1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XHJcbiAgICB9O1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZSBhIHRpbWVzdGFtcC4gRmlsdGVycyBvdXQgbm9uLWV4aXN0aW5nIHZhbHVlcyBmb3IgYWxsIHRpbWUgY29tcG9uZW50c1xyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoID49IDEgJiYgdGhpcy5jb21wb25lbnRzLm1vbnRoIDw9IDEyXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuZGF5ID49IDEgJiYgdGhpcy5jb21wb25lbnRzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoKVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA8PSAyM1xyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPD0gNTlcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kIDw9IDU5XHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPD0gOTk5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubW9udGgudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWludXRlLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcclxuICAgIH07XHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltUaW1lU3RydWN0OiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUaW1lU3RydWN0O1xyXG59KCkpO1xyXG5leHBvcnRzLlRpbWVTdHJ1Y3QgPSBUaW1lU3RydWN0O1xyXG4vKipcclxuICogQmluYXJ5IHNlYXJjaFxyXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgdG8gc2VhcmNoXHJcbiAqIEBwYXJhbSBjb21wYXJlIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiA8IDAgaWYgZ2l2ZW4gZWxlbWVudCBpcyBsZXNzIHRoYW4gc2VhcmNoZWQgZWxlbWVudCBldGNcclxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgaW5zZXJ0aW9uIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIGxvb2sgZm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleChhcnIsIGNvbXBhcmUpIHtcclxuICAgIHZhciBtaW5JbmRleCA9IDA7XHJcbiAgICB2YXIgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcclxuICAgIHZhciBjdXJyZW50SW5kZXg7XHJcbiAgICB2YXIgY3VycmVudEVsZW1lbnQ7XHJcbiAgICAvLyBubyBhcnJheSAvIGVtcHR5IGFycmF5XHJcbiAgICBpZiAoIWFycikge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGFyci5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIC8vIG91dCBvZiBib3VuZHNcclxuICAgIGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAoY29tcGFyZShhcnJbbWF4SW5kZXhdKSA8IDApIHtcclxuICAgICAgICByZXR1cm4gbWF4SW5kZXggKyAxO1xyXG4gICAgfVxyXG4gICAgLy8gZWxlbWVudCBpbiByYW5nZVxyXG4gICAgd2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gTWF0aC5mbG9vcigobWluSW5kZXggKyBtYXhJbmRleCkgLyAyKTtcclxuICAgICAgICBjdXJyZW50RWxlbWVudCA9IGFycltjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgIGlmIChjb21wYXJlKGN1cnJlbnRFbGVtZW50KSA8IDApIHtcclxuICAgICAgICAgICAgbWluSW5kZXggPSBjdXJyZW50SW5kZXggKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjb21wYXJlKGN1cnJlbnRFbGVtZW50KSA+IDApIHtcclxuICAgICAgICAgICAgbWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJbmRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuZXhwb3J0cy5iaW5hcnlJbnNlcnRpb25JbmRleCA9IGJpbmFyeUluc2VydGlvbkluZGV4O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iYXNpY3MuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBEYXRlK3RpbWUrdGltZXpvbmUgcmVwcmVzZW50YXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxudmFyIGphdmFzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHRpbWVzb3VyY2VfMSA9IHJlcXVpcmUoXCIuL3RpbWVzb3VyY2VcIik7XHJcbnZhciB0aW1lem9uZV8xID0gcmVxdWlyZShcIi4vdGltZXpvbmVcIik7XHJcbnZhciB0el9kYXRhYmFzZV8xID0gcmVxdWlyZShcIi4vdHotZGF0YWJhc2VcIik7XHJcbnZhciBmb3JtYXQgPSByZXF1aXJlKFwiLi9mb3JtYXRcIik7XHJcbnZhciBwYXJzZUZ1bmNzID0gcmVxdWlyZShcIi4vcGFyc2VcIik7XHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBub3dMb2NhbCgpIHtcclxuICAgIHJldHVybiBEYXRlVGltZS5ub3dMb2NhbCgpO1xyXG59XHJcbmV4cG9ydHMubm93TG9jYWwgPSBub3dMb2NhbDtcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBub3dVdGMoKSB7XHJcbiAgICByZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuZXhwb3J0cy5ub3dVdGMgPSBub3dVdGM7XHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICovXHJcbmZ1bmN0aW9uIG5vdyh0aW1lWm9uZSkge1xyXG4gICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XHJcbiAgICByZXR1cm4gRGF0ZVRpbWUubm93KHRpbWVab25lKTtcclxufVxyXG5leHBvcnRzLm5vdyA9IG5vdztcclxuZnVuY3Rpb24gY29udmVydFRvVXRjKGxvY2FsVGltZSwgZnJvbVpvbmUpIHtcclxuICAgIGlmIChmcm9tWm9uZSkge1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSBmcm9tWm9uZS5vZmZzZXRGb3Jab25lKGxvY2FsVGltZSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZS51bml4TWlsbGlzIC0gb2Zmc2V0ICogNjAwMDApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGxvY2FsVGltZS5jbG9uZSgpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGNvbnZlcnRGcm9tVXRjKHV0Y1RpbWUsIHRvWm9uZSkge1xyXG4gICAgaWYgKHRvWm9uZSkge1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSB0b1pvbmUub2Zmc2V0Rm9yVXRjKHV0Y1RpbWUpO1xyXG4gICAgICAgIHJldHVybiB0b1pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZS51bml4TWlsbGlzICsgb2Zmc2V0ICogNjAwMDApKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB1dGNUaW1lLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIERhdGVUaW1lIGNsYXNzIHdoaWNoIGlzIHRpbWUgem9uZS1hd2FyZVxyXG4gKiBhbmQgd2hpY2ggY2FuIGJlIG1vY2tlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cclxuICovXHJcbnZhciBEYXRlVGltZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBkbyBub3QgY2FsbFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEYXRlVGltZShhMSwgYTIsIGEzLCBoLCBtLCBzLCBtcywgdGltZVpvbmUpIHtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiAoYTEpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBhMiBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdW5peCB0aW1lc3RhbXAgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBleHBlY3QgdW5peFRpbWVzdGFtcCB0byBiZSBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBhMiBpbnN0YW5jZW9mIHRpbWV6b25lXzEuVGltZVpvbmUgPyBhMiA6IG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9ybWFsaXplZFVuaXhUaW1lc3RhbXAgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bShhMSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bShhMSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCB5ZWFyIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgbW9udGggdG8gYmUgYSBudW1iZXIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeWVhciA9IGExO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9udGggPSBhMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRheSA9IGEzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91ciA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWludXRlID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWNvbmQgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbGxpID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeWVhciA9IG1hdGgucm91bmRTeW0oeWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG91ciA9IG1hdGgucm91bmRTeW0oaG91cik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxsaSA9IG1hdGgucm91bmRTeW0obWlsbGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG0gPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRtLnZhbGlkYXRlKCksIFwiaW52YWxpZCBkYXRlOiBcIiArIHRtLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIHRpbWVab25lIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSA/IHRpbWVab25lIDogbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtYXQgc3RyaW5nIGdpdmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyaW5nID0gYTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXRTdHJpbmcgPSBhMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHpvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGEzIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9uZSA9IChhMyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UoZGF0ZVN0cmluZywgZm9ybWF0U3RyaW5nLCB6b25lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHBhcnNlZC56b25lIHx8IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2l2ZW5TdHJpbmcgPSBhMS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcyA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNzLmxlbmd0aCA9PT0gMiwgXCJJbnZhbGlkIGRhdGUgc3RyaW5nIGdpdmVuOiBcXFwiXCIgKyBhMSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGEyIGluc3RhbmNlb2YgdGltZXpvbmVfMS5UaW1lWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS56b25lKHNzWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tU3RyaW5nKHNzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMSBpbnN0YW5jZW9mIGJhc2ljc18xLlRpbWVTdHJ1Y3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyID8gYTIgOiBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZm9yIGEgRGF0ZSBvYmplY3QgYSBEYXRlRnVuY3Rpb25zIG11c3QgYmUgcGFzc2VkIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghYTMgfHwgYTMgaW5zdGFuY2VvZiB0aW1lem9uZV8xLlRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRpbWVab25lIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gKGExKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRrID0gKGEyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMyA/IGEzIDogbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHVuZXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdHlwZS5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGVUaW1lLnByb3RvdHlwZSwgXCJ1dGNEYXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl91dGNEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlLCB0aGlzLl96b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdXRjRGF0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0ZVRpbWUucHJvdG90eXBlLCBcInpvbmVEYXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlLCB0aGlzLl96b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZURhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLm5vd0xvY2FsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKG4sIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldCwgdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLm5vd1V0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQywgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLm5vdyA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xyXG4gICAgICAgIGlmICh0aW1lWm9uZSA9PT0gdm9pZCAwKSB7IHRpbWVab25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKTsgfVxyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcclxuICAgICAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxyXG4gICAgICogQHJldHVybnMgYSBEYXRlVGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5mcm9tRXhjZWwgPSBmdW5jdGlvbiAobiwgdGltZVpvbmUpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiBuID09PSBcIm51bWJlclwiLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFpc05hTihuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gTWF0aC5yb3VuZCgobiAtIDI1NTY5KSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcbiAgICAgKiBFLmcuIDIwMTUtMDItMjkgcmV0dXJucyBmYWxzZSAobm90IGEgbGVhcCB5ZWFyKVxyXG4gICAgICogYW5kIDIwMTUtMDMtMjlUMDI6MzA6MDAgcmV0dXJucyBmYWxzZSAoZGF5bGlnaHQgc2F2aW5nIHRpbWUgbWlzc2luZyBob3VyKVxyXG4gICAgICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxyXG4gICAgICogQnkgZGVmYXVsdCwgcHJlLTE5NzAgZGF0ZXMgYWxzbyByZXR1cm4gZmFsc2Ugc2luY2UgdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBkb2VzIG5vdCBjb250YWluIGFjY3VyYXRlIGluZm9cclxuICAgICAqIGJlZm9yZSB0aGF0LiBZb3UgY2FuIGNoYW5nZSB0aGF0IHdpdGggdGhlIGFsbG93UHJlMTk3MCBmbGFnLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhbGxvd1ByZTE5NzAgKG9wdGlvbmFsLCBkZWZhdWx0IGZhbHNlKTogcmV0dXJuIHRydWUgZm9yIHByZS0xOTcwIGRhdGVzXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLmV4aXN0cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUsIGFsbG93UHJlMTk3MCkge1xyXG4gICAgICAgIGlmIChtb250aCA9PT0gdm9pZCAwKSB7IG1vbnRoID0gMTsgfVxyXG4gICAgICAgIGlmIChkYXkgPT09IHZvaWQgMCkgeyBkYXkgPSAxOyB9XHJcbiAgICAgICAgaWYgKGhvdXIgPT09IHZvaWQgMCkgeyBob3VyID0gMDsgfVxyXG4gICAgICAgIGlmIChtaW51dGUgPT09IHZvaWQgMCkgeyBtaW51dGUgPSAwOyB9XHJcbiAgICAgICAgaWYgKHNlY29uZCA9PT0gdm9pZCAwKSB7IHNlY29uZCA9IDA7IH1cclxuICAgICAgICBpZiAobWlsbGlzZWNvbmQgPT09IHZvaWQgMCkgeyBtaWxsaXNlY29uZCA9IDA7IH1cclxuICAgICAgICBpZiAoem9uZSA9PT0gdm9pZCAwKSB7IHpvbmUgPSBudWxsOyB9XHJcbiAgICAgICAgaWYgKGFsbG93UHJlMTk3MCA9PT0gdm9pZCAwKSB7IGFsbG93UHJlMTk3MCA9IGZhbHNlOyB9XHJcbiAgICAgICAgaWYgKCFpc0Zpbml0ZSh5ZWFyKSB8fCAhaXNGaW5pdGUobW9udGgpIHx8ICFpc0Zpbml0ZShkYXkpXHJcbiAgICAgICAgICAgIHx8ICFpc0Zpbml0ZShob3VyKSB8fCAhaXNGaW5pdGUobWludXRlKSB8fCAhaXNGaW5pdGUoc2Vjb25kKSB8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFhbGxvd1ByZTE5NzAgJiYgeWVhciA8IDE5NzApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcclxuICAgICAgICAgICAgcmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxyXG4gICAgICAgICAgICAgICAgJiYgaG91ciA9PT0gZHQuaG91cigpICYmIG1pbnV0ZSA9PT0gZHQubWludXRlKCkgJiYgc2Vjb25kID09PSBkdC5zZWNvbmQoKSAmJiBtaWxsaXNlY29uZCA9PT0gZHQubWlsbGlzZWNvbmQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCB0aGlzLl96b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcy5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnpvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBab25lIG5hbWUgYWJicmV2aWF0aW9uIGF0IHRoaXMgdGltZVxyXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG4gICAgICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lQWJicmV2aWF0aW9uID0gZnVuY3Rpb24gKGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQgPT09IHZvaWQgMCkgeyBkc3REZXBlbmRlbnQgPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuem9uZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnpvbmUoKS5hYmJyZXZpYXRpb25Gb3JVdGModGhpcy51dGNEYXRlLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykgLyA2MDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS55ZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmRheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIHNlY29uZHMgMC01OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53ZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy56b25lRGF0ZS51bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuICAgICAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXlPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICAgICAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuICAgICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAgICAgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53ZWVrT2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuICAgICAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51bml4VXRjTWlsbGlzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1llYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnllYXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNIb3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5ob3VyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIG1pbnV0ZXMgMC01OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNTZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjRGF5T2ZZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcbiAgICAgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla0RheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gICAgICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1dlZWtPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjU2Vjb25kT2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lIHdoaWNoIGlzIHRoZSBkYXRlK3RpbWUgcmVpbnRlcnByZXRlZCBhc1xyXG4gICAgICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cclxuICAgICAqIE5vIGNvbnZlcnNpb24gaXMgZG9uZSwgdGhlIHZhbHVlIGlzIGp1c3QgYXNzdW1lZCB0byBiZSBpbiBhIGRpZmZlcmVudCB6b25lLlxyXG4gICAgICogV29ya3MgZm9yIG5haXZlIGFuZCBhd2FyZSBkYXRlcy4gVGhlIG5ldyB6b25lIG1heSBiZSBudWxsLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lIFRoZSBuZXcgdGltZSB6b25lXHJcbiAgICAgKiBAcmV0dXJuIEEgbmV3IERhdGVUaW1lIHdpdGggdGhlIG9yaWdpbmFsIHRpbWVzdGFtcCBhbmQgdGhlIG5ldyB6b25lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2l0aFpvbmUgPSBmdW5jdGlvbiAoem9uZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgdGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSwgem9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHRoaXMgZGF0ZSB0byB0aGUgZ2l2ZW4gdGltZSB6b25lIChpbi1wbGFjZSkuXHJcbiAgICAgKiBUaHJvd3MgaWYgdGhpcyBkYXRlIGRvZXMgbm90IGhhdmUgYSB0aW1lIHpvbmUuXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAoem9uZSkge1xyXG4gICAgICAgIGlmICh6b25lKSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHpvbmU7IC8vIHN0aWxsIGFzc2lnbiwgYmVjYXVzZSB6b25lcyBtYXkgYmUgZXF1YWwgYnV0IG5vdCBpZGVudGljYWwgKFVUQy9HTVQvKzAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl91dGNEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB6b25lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fem9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuICAgICAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxyXG4gICAgICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBpZiB5b3UgcmVhbGx5IG5lZWQgdG8gZG8gdGhhdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cclxuICAgICAqIEByZXR1cm4gVGhlIGNvbnZlcnRlZCBkYXRlXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1pvbmUgPSBmdW5jdGlvbiAoem9uZSkge1xyXG4gICAgICAgIGlmICh6b25lKSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZVRpbWUoKTtcclxuICAgICAgICAgICAgcmVzdWx0LnV0Y0RhdGUgPSB0aGlzLnV0Y0RhdGU7XHJcbiAgICAgICAgICAgIHJlc3VsdC5fem9uZSA9IHpvbmU7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXHJcbiAgICAgKiBVbmxlc3MgdGhlIHRpbWV6b25lIGlzIGxvY2FsLCB0aGUgRGF0ZS5nZXRVVENYKCkgbWV0aG9kcyB3aWxsIE5PVCBiZSBjb3JyZWN0LlxyXG4gICAgICogVGhpcyBpcyBiZWNhdXNlIERhdGUgY2FsY3VsYXRlcyBnZXRVVENYKCkgZnJvbSBnZXRYKCkgYXBwbHlpbmcgbG9jYWwgdGltZSB6b25lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9EYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSwgdGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG4gICAgICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvRXhjZWwgPSBmdW5jdGlvbiAodGltZVpvbmUpIHtcclxuICAgICAgICB2YXIgZHQgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0aW1lWm9uZSAmJiAhdGltZVpvbmUuZXF1YWxzKHRoaXMuem9uZSgpKSkge1xyXG4gICAgICAgICAgICBkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvVXRjRXhjZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCk7XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLl91bml4VGltZVN0YW1wVG9FeGNlbCA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcbiAgICAgICAgLy8gcm91bmQgdG8gbmVhcmVzdCBtaWxsaXNlY29uZFxyXG4gICAgICAgIHZhciBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG1zZWNzKSAqICgxIC8gODY0MDAwMDApO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSW1wbGVtZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICB2YXIgYW1vdW50O1xyXG4gICAgICAgIHZhciB1O1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuICAgICAgICAgICAgdSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZExvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gKGExKTtcclxuICAgICAgICAgICAgdSA9IHVuaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuem9uZURhdGUsIGFtb3VudCwgdSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IChhbW91bnQgPj0gMCA/IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93bik7XHJcbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKG5vcm1hbGl6ZWQsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIGdpdmVuIHRpbWUgc3RydWN0LiBOb3RlOiBkb2VzIG5vdCBub3JtYWxpemUuXHJcbiAgICAgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcclxuICAgICAqIG5lY2Vzc2FyeS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLl9hZGRUb1RpbWVTdHJ1Y3QgPSBmdW5jdGlvbiAodG0sIGFtb3VudCwgdW5pdCkge1xyXG4gICAgICAgIHZhciB5ZWFyO1xyXG4gICAgICAgIHZhciBtb250aDtcclxuICAgICAgICB2YXIgZGF5O1xyXG4gICAgICAgIHZhciBob3VyO1xyXG4gICAgICAgIHZhciBtaW51dGU7XHJcbiAgICAgICAgdmFyIHNlY29uZDtcclxuICAgICAgICB2YXIgbWlsbGk7XHJcbiAgICAgICAgc3dpdGNoICh1bml0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50KSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDEwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogODY0MDAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDoge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXHJcbiAgICAgICAgICAgICAgICBpZiAoYW1vdW50ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5jb21wb25lbnRzLm1vbnRoKSkgLyAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5mbG9vcigoYW1vdW50ICsgKHRtLmNvbXBvbmVudHMubW9udGggLSAxKSkgLyAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiB5ZWFyc1wiKTtcclxuICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBhbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBtb250aCA9IHRtLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICAgICAgICAgICAgICBkYXkgPSBNYXRoLm1pbih0bS5jb21wb25lbnRzLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XHJcbiAgICAgICAgICAgICAgICBob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xyXG4gICAgICAgICAgICAgICAgbWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmQgPSB0bS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgICAgICAgICAgICAgIG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiICYmIGExIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gKGExKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YkxvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhMSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMb2NhbChhMS5tdWx0aXBseSgtMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTG9jYWwoLTEgKiBhMSwgdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xyXG4gICAgICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24odGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgLSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgKiBDaG9wcyBvZmYgdGhlIHRpbWUgcGFydCwgeWllbGRzIHRoZSBzYW1lIGRhdGUgYXQgMDA6MDA6MDAuMDAwXHJcbiAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgbW9udGggYXQgMDA6MDA6MDBcclxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgMSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPCBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDw9IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5lcXVhbHMob3RoZXIudXRjRGF0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGFuZCB0aGUgc2FtZSB6b25lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxyXG4gICAgICAgICAgICAmJiAodGhpcy5fem9uZSA9PT0gbnVsbCkgPT09IChvdGhlci5fem9uZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgJiYgKHRoaXMuX3pvbmUgPT09IG51bGwgfHwgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmdyZWF0ZXJFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzICsgdGltZXpvbmVfMS5UaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXHJcbiAgICAgKiBzcGVjaWZpZWQgZm9ybWF0LiBUaGUgZm9ybWF0IGlzIGltcGxlbWVudGVkIGFzIHRoZSBMRE1MIHN0YW5kYXJkXHJcbiAgICAgKiAoaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9Gb3JtYXRfUGF0dGVybnMpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBPcHRpb25hbCwgbm9uLWVuZ2xpc2ggZm9ybWF0IG1vbnRoIG5hbWVzIGV0Yy5cclxuICAgICAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy56b25lRGF0ZSwgdGhpcy51dGNEYXRlLCB0aGlzLnpvbmUoKSwgZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxyXG4gICAgICogQHBhcmFtIHMgdGhlIHN0cmluZyB0byBwYXJzZVxyXG4gICAgICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW5cclxuICAgICAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucGFyc2UgPSBmdW5jdGlvbiAocywgZm9ybWF0LCB6b25lKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lKTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHBhcnNlZC50aW1lLCBwYXJzZWQuem9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXHJcbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IHRpbWV6b25lXzEuVGltZVpvbmVLaW5kLk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgKyBcIiBcIiArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gc2VwYXJhdGUgSUFOQSBuYW1lIG9yIFwibG9jYWx0aW1lXCIgd2l0aCBhIHNwYWNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltEYXRlVGltZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyBpbiBVVEMgd2l0aG91dCB0aW1lIHpvbmUgaW5mb1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0cmltbWVkID0gcy50cmltKCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcclxuICAgICAgICB2YXIgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgOCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IC0xOyAvLyBhbnkgXCItXCIgd2UgZm91bmQgd2FzIGEgZGF0ZSBzZXBhcmF0b3JcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuICAgICAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuICAgICAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUudGltZVNvdXJjZSA9IG5ldyB0aW1lc291cmNlXzEuUmVhbFRpbWVTb3VyY2UoKTtcclxuICAgIHJldHVybiBEYXRlVGltZTtcclxufSgpKTtcclxuZXhwb3J0cy5EYXRlVGltZSA9IERhdGVUaW1lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRldGltZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFRpbWUgZHVyYXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuICovXHJcbmZ1bmN0aW9uIHllYXJzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi55ZWFycyhuKTtcclxufVxyXG5leHBvcnRzLnllYXJzID0geWVhcnM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcbiAqL1xyXG5mdW5jdGlvbiBtb250aHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLm1vbnRocyhuKTtcclxufVxyXG5leHBvcnRzLm1vbnRocyA9IG1vbnRocztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xyXG4gKi9cclxuZnVuY3Rpb24gZGF5cyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24uZGF5cyhuKTtcclxufVxyXG5leHBvcnRzLmRheXMgPSBkYXlzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuICovXHJcbmZ1bmN0aW9uIGhvdXJzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5ob3VycyhuKTtcclxufVxyXG5leHBvcnRzLmhvdXJzID0gaG91cnM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuICovXHJcbmZ1bmN0aW9uIG1pbnV0ZXMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLm1pbnV0ZXMobik7XHJcbn1cclxuZXhwb3J0cy5taW51dGVzID0gbWludXRlcztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gKi9cclxuZnVuY3Rpb24gc2Vjb25kcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24uc2Vjb25kcyhuKTtcclxufVxyXG5leHBvcnRzLnNlY29uZHMgPSBzZWNvbmRzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZnVuY3Rpb24gbWlsbGlzZWNvbmRzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5taWxsaXNlY29uZHMobik7XHJcbn1cclxuZXhwb3J0cy5taWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZHM7XHJcbi8qKlxyXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cclxuICogJzEgTW9udGgnIG9yICcxNjYgU2Vjb25kcycuIFRoZSB1bml0IGlzIHByZXNlcnZlZCB0aHJvdWdoIGNhbGN1bGF0aW9ucy5cclxuICpcclxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XHJcbiAqIC0gc2Vjb25kKCksIG1pbnV0ZSgpLCBob3VyKCkgZXRjLCBzaW5ndWxhciBmb3JtOiB0aGVzZSBjYW4gYmUgdXNlZCB0byBjcmVhdGUgc3RyaW5nIHJlcHJlc2VudGF0aW9ucy5cclxuICogICBUaGVzZSByZXR1cm4gYSBwYXJ0IG9mIHlvdXIgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiBFLmcuIGZvciAyNTAwIG1pbGxpc2Vjb25kcywgdGhlIG1pbGxpc2Vjb25kKCkgcGFydCB3b3VsZCBiZSA1MDBcclxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxyXG4gKi9cclxudmFyIER1cmF0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRHVyYXRpb24oaTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChpMSkgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgLy8gYW1vdW50K3VuaXQgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdmFyIGFtb3VudCA9IGkxO1xyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXQgPSAodHlwZW9mIHVuaXQgPT09IFwibnVtYmVyXCIgPyB1bml0IDogYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGkxKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvLyBzdHJpbmcgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdGhpcy5fZnJvbVN0cmluZyhpMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ueWVhcnMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ubW9udGhzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLmRheXMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uaG91cnMgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24obiwgYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5taW51dGVzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5zZWNvbmRzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ubWlsbGlzZWNvbmRzID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKG4sIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQsIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGlzIGR1cmF0aW9uIGV4cHJlc3NlZCBpbiBkaWZmZXJlbnQgdW5pdCAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpLlxyXG4gICAgICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hcyA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTW9udGhzID0gKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTW9udGhzID0gKHVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01zZWMgLyByZXFNc2VjO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcbiAgICAgKiB0aGUgc2FtZSB1bml0LlxyXG4gICAgICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gKHVuaXQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWlsbGlzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAzIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaW51dGVzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBob3VycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA1NDAwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91cnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaG91ciBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgZGF5IGhhcyAyNCBob3VycyAod2hpY2ggaXMgbm90IHRoZSBjYXNlXHJcbiAgICAgKiBkdXJpbmcgRFNUIGNoYW5nZXMpLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBob3VyIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpLlxyXG4gICAgICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG4gICAgICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS53aG9sZUhvdXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gZGF5cyFcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRheXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXkgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIG1vbnRoIGhhcyAzMCBkYXlzLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1vbnRoIHBhcnQgb2YgYSBkdXJhdGlvbi5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4geWVhcnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS55ZWFycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS53aG9sZVllYXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cclxuICAgICAgICAgICAgICAgIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYW1vdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduXHJcbiAgICAgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2lnbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgdmFyIGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gY29udmVydGVkLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IGNvbnZlcnRlZC51bml0KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXHJcbiAgICAgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xyXG4gICAgICogc28gZS5nLiA2MCBtaW51dGVzIGVxdWFscyAxIGhvdXIsIGJ1dCAyNCBob3VycyBkbyBOT1QgZXF1YWwgMSBkYXlcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHNFeGFjdCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0IDw9IGJhc2ljc18xLlRpbWVVbml0LkRheSAmJiBvdGhlci51bml0KCkgPCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTYW1lIHVuaXQgYW5kIHNhbWUgYW1vdW50XHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBvdGhlci5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBvdGhlci51bml0KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gKG1vc3QgbmVnYXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogTXVsdGlwbHkgd2l0aCBhIGZpeGVkIG51bWJlci5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKiB2YWx1ZSlcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKiB2YWx1ZSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBEaXZpZGUgYnkgYSBmaXhlZCBudW1iZXIuXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGR1cmF0aW9uLlxyXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyArIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICsgdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3QgYSBkdXJhdGlvbi5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9hbW91bnQgPj0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkoLTEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmVcclxuICAgICAqIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvRnVsbFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b0htc1N0cmluZyh0cnVlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBbLV1oaGhoOm1tWzpzc1subm5uXV0gbm90YXRpb24uXHJcbiAgICAgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcclxuICAgICAqICAgICAgICAgICAgIGFyZSBjaG9wcGVkIG9mZiBpZiB6ZXJvXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0htc1N0cmluZyA9IGZ1bmN0aW9uIChmdWxsKSB7XHJcbiAgICAgICAgaWYgKGZ1bGwgPT09IHZvaWQgMCkgeyBmdWxsID0gZmFsc2U7IH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcclxuICAgICAgICBpZiAoZnVsbCB8fCB0aGlzLm1pbGxpc2Vjb25kKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWlsbGlzZWNvbmQoKS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5zZWNvbmQoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5taW51dGUoKSA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2lnbigpICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMud2hvbGVIb3VycygpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIGluIElTTyA4NjAxIG5vdGF0aW9uIGUuZy4gJ1AxTScgZm9yIG9uZSBtb250aCBvciAnUFQxTScgZm9yIG9uZSBtaW51dGVcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fdW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBUXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7IC8vIG5vdGUgdGhlIFwiVFwiIHRvIGRpc2FtYmlndWF0ZSB0aGUgXCJNXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2Vlazoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiV1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuX3BhcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGlmICh1bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5leHRVbml0O1xyXG4gICAgICAgIC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxyXG4gICAgICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGg7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbXNlY3MgPSAoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpKSAlIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKG5leHRVbml0KTtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcclxuICAgIH07XHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuX2Zyb21TdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0cmltbWVkID0gcy50cmltKCk7XHJcbiAgICAgICAgaWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XHJcbiAgICAgICAgICAgIHZhciBzaWduID0gMTtcclxuICAgICAgICAgICAgdmFyIGhvdXJzXzEgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbWludXRlc18xID0gMDtcclxuICAgICAgICAgICAgdmFyIHNlY29uZHNfMSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBtaWxsaXNlY29uZHNfMSA9IDA7XHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJOb3QgYSBwcm9wZXIgdGltZSBkdXJhdGlvbiBzdHJpbmc6IFxcXCJcIiArIHRyaW1tZWQgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgIGlmICh0cmltbWVkLmNoYXJBdCgwKSA9PT0gXCItXCIpIHtcclxuICAgICAgICAgICAgICAgIHNpZ24gPSAtMTtcclxuICAgICAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBob3Vyc18xID0gK3BhcnRzWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBtaW51dGVzXzEgPSArcGFydHNbMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWNvbmRQYXJ0cyA9IHBhcnRzWzJdLnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNfMSA9ICtzZWNvbmRQYXJ0c1swXTtcclxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmRQYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzXzEgPSArc3RyaW5ncy5wYWRSaWdodChzZWNvbmRQYXJ0c1sxXSwgMywgXCIwXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhbW91bnRNc2VjID0gc2lnbiAqIE1hdGgucm91bmQobWlsbGlzZWNvbmRzXzEgKyAxMDAwICogc2Vjb25kc18xICsgNjAwMDAgKiBtaW51dGVzXzEgKyAzNjAwMDAwICogaG91cnNfMSk7XHJcbiAgICAgICAgICAgIC8vIGZpbmQgbG93ZXN0IG5vbi16ZXJvIG51bWJlciBhbmQgdGFrZSB0aGF0IGFzIHVuaXRcclxuICAgICAgICAgICAgaWYgKG1pbGxpc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1pbnV0ZXNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChob3Vyc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnRNc2VjIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgc3BsaXQgPSB0cmltbWVkLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICBpZiAoc3BsaXQubGVuZ3RoICE9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFtb3VudCA9IHBhcnNlRmxvYXQoc3BsaXRbMF0pO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFpc05hTihhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgY2Fubm90IHBhcnNlIGFtb3VudFwiKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChpc0Zpbml0ZShhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgYW1vdW50IGlzIGluZmluaXRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBEdXJhdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5EdXJhdGlvbiA9IER1cmF0aW9uO1xyXG47XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cmF0aW9uLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciB0b2tlbl8xID0gcmVxdWlyZShcIi4vdG9rZW5cIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbmV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMgPSBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbmV4cG9ydHMuTU9OVEhfTEVUVEVSUyA9IFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuZXhwb3J0cy5MT05HX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuZXhwb3J0cy5TSE9SVF9XRUVLREFZX05BTUVTID0gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG5leHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMgPSBbXCJTdVwiLCBcIk1vXCIsIFwiVHVcIiwgXCJXZVwiLCBcIlRoXCIsIFwiRnJcIiwgXCJTYVwiXTtcclxuZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMgPSBbXCJTXCIsIFwiTVwiLCBcIlRcIiwgXCJXXCIsIFwiVFwiLCBcIkZcIiwgXCJTXCJdO1xyXG5leHBvcnRzLlFVQVJURVJfTEVUVEVSID0gXCJRXCI7XHJcbmV4cG9ydHMuUVVBUlRFUl9XT1JEID0gXCJxdWFydGVyXCI7XHJcbmV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gW1wiMXN0XCIsIFwiMm5kXCIsIFwiM3JkXCIsIFwiNHRoXCJdO1xyXG5leHBvcnRzLkRFRkFVTFRfRk9STUFUX09QVElPTlMgPSB7XHJcbiAgICBxdWFydGVyTGV0dGVyOiBleHBvcnRzLlFVQVJURVJfTEVUVEVSLFxyXG4gICAgcXVhcnRlcldvcmQ6IGV4cG9ydHMuUVVBUlRFUl9XT1JELFxyXG4gICAgcXVhcnRlckFiYnJldmlhdGlvbnM6IGV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxyXG4gICAgbG9uZ01vbnRoTmFtZXM6IGV4cG9ydHMuTE9OR19NT05USF9OQU1FUyxcclxuICAgIHNob3J0TW9udGhOYW1lczogZXhwb3J0cy5TSE9SVF9NT05USF9OQU1FUyxcclxuICAgIG1vbnRoTGV0dGVyczogZXhwb3J0cy5NT05USF9MRVRURVJTLFxyXG4gICAgbG9uZ1dlZWtkYXlOYW1lczogZXhwb3J0cy5MT05HX1dFRUtEQVlfTkFNRVMsXHJcbiAgICBzaG9ydFdlZWtkYXlOYW1lczogZXhwb3J0cy5TSE9SVF9XRUVLREFZX05BTUVTLFxyXG4gICAgd2Vla2RheVR3b0xldHRlcnM6IGV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyxcclxuICAgIHdlZWtkYXlMZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfTEVUVEVSU1xyXG59O1xyXG4vKipcclxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gbG9jYWxab25lIFRoZSB6b25lIHRoYXQgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxyXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBPdGhlciBmb3JtYXQgb3B0aW9ucyBzdWNoIGFzIG1vbnRoIG5hbWVzXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXQoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgZm9ybWF0U3RyaW5nLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICBpZiAoZm9ybWF0T3B0aW9ucyA9PT0gdm9pZCAwKSB7IGZvcm1hdE9wdGlvbnMgPSB7fTsgfVxyXG4gICAgLy8gbWVyZ2UgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IGZvcm1hdCBvcHRpb25zXHJcbiAgICAvLyB0eXBlY2FzdCB0byBwcmV2ZW50IGVycm9yIFRTNzAxNzogSW5kZXggc2lnbmF0dXJlIG9mIG9iamVjdCB0eXBlIGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUuXHJcbiAgICB2YXIgZ2l2ZW5Gb3JtYXRPcHRpb25zID0gZm9ybWF0T3B0aW9ucztcclxuICAgIHZhciBkZWZhdWx0Rm9ybWF0T3B0aW9ucyA9IGV4cG9ydHMuREVGQVVMVF9GT1JNQVRfT1BUSU9OUztcclxuICAgIHZhciBtZXJnZWRGb3JtYXRPcHRpb25zID0ge307XHJcbiAgICBmb3IgKHZhciBuYW1lXzEgaW4gZXhwb3J0cy5ERUZBVUxUX0ZPUk1BVF9PUFRJT05TKSB7XHJcbiAgICAgICAgaWYgKGV4cG9ydHMuREVGQVVMVF9GT1JNQVRfT1BUSU9OUy5oYXNPd25Qcm9wZXJ0eShuYW1lXzEpKSB7XHJcbiAgICAgICAgICAgIHZhciBnaXZlbkZvcm1hdE9wdGlvbiA9IGdpdmVuRm9ybWF0T3B0aW9uc1tuYW1lXzFdO1xyXG4gICAgICAgICAgICB2YXIgZGVmYXVsdEZvcm1hdE9wdGlvbiA9IGRlZmF1bHRGb3JtYXRPcHRpb25zW25hbWVfMV07XHJcbiAgICAgICAgICAgIG1lcmdlZEZvcm1hdE9wdGlvbnNbbmFtZV8xXSA9IGdpdmVuRm9ybWF0T3B0aW9uIHx8IGRlZmF1bHRGb3JtYXRPcHRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9ybWF0T3B0aW9ucyA9IG1lcmdlZEZvcm1hdE9wdGlvbnM7XHJcbiAgICB2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuXzEuVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XHJcbiAgICB2YXIgdG9rZW5zID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgdmFyIHRva2VuID0gdG9rZW5zW2ldO1xyXG4gICAgICAgIHZhciB0b2tlblJlc3VsdCA9IHZvaWQgMDtcclxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkVSQTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgZm9ybWF0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuSE9VUjpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5aT05FOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLldFRUs6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IHRva2VuUmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdC50cmltKCk7XHJcbn1cclxuZXhwb3J0cy5mb3JtYXQgPSBmb3JtYXQ7XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGVyYSAoQkMgb3IgQUQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHZhciBBRCA9IGRhdGVUaW1lLnllYXIgPiAwO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IFwiQURcIiA6IFwiQkNcIik7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gXCJBbm5vIERvbWluaVwiIDogXCJCZWZvcmUgQ2hyaXN0XCIpO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IFwiQVwiIDogXCJCXCIpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgeWVhclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwieVwiOlxyXG4gICAgICAgIGNhc2UgXCJZXCI6XHJcbiAgICAgICAgY2FzZSBcInJcIjpcclxuICAgICAgICAgICAgdmFyIHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB5ZWFyVmFsdWU7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBxdWFydGVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICB2YXIgcXVhcnRlciA9IE1hdGguY2VpbChkYXRlVGltZS5tb250aCAvIDMpO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5xdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGZvcm1hdE9wdGlvbnMucXVhcnRlcldvcmQ7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbW9udGhcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBmb3JtYXRPcHRpb25zKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcIndcIikge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrT2ZNb250aChkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIG1vbnRoIChvciB5ZWFyKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJkXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuZGF5LnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJEXCI6XHJcbiAgICAgICAgICAgIHZhciBkYXlPZlllYXIgPSBiYXNpY3MuZGF5T2ZZZWFyKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXlPZlllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIHdlZWtcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIGZvcm1hdE9wdGlvbnMpIHtcclxuICAgIHZhciB3ZWVrRGF5TnVtYmVyID0gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcykudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgICAgIH0gLy8gTm8gYnJlYWssIHRoaXMgaXMgaW50ZW50aW9uYWwgZmFsbHRocm91Z2ghXHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5TGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcHRpb25zLndlZWtkYXlUd29MZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHJldHVybiAoZGF0ZVRpbWUuaG91ciA8IDEyID8gXCJBTVwiIDogXCJQTVwiKTtcclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBIb3VyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICB2YXIgaG91ciA9IGRhdGVUaW1lLmhvdXI7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJoXCI6XHJcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XHJcbiAgICAgICAgICAgIGlmIChob3VyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBob3VyID0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIkhcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJLXCI6XHJcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwia1wiOlxyXG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IDI0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbWludXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHNlY29uZHMgKG9yIGZyYWN0aW9uIG9mIGEgc2Vjb25kKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJzXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuc2Vjb25kLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJTXCI6XHJcbiAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IGRhdGVUaW1lLm1pbGxpO1xyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQoZnJhY3Rpb24udG9TdHJpbmcoKSwgMywgXCIwXCIpO1xyXG4gICAgICAgICAgICBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkUmlnaHQoZnJhY3Rpb25TdHJpbmcsIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZnJhY3Rpb25TdHJpbmcuc2xpY2UoMCwgdG9rZW4ubGVuZ3RoKTtcclxuICAgICAgICBjYXNlIFwiQVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy5zZWNvbmRPZkRheShkYXRlVGltZS5ob3VyLCBkYXRlVGltZS5taW51dGUsIGRhdGVUaW1lLnNlY29uZCkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZVt0b2tlbi50eXBlXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB0aW1lIHpvbmUuIEZvciB0aGlzLCB3ZSBuZWVkIHRoZSBjdXJyZW50IHRpbWUsIHRoZSB0aW1lIGluIFVUQyBhbmQgdGhlIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gY3VycmVudFRpbWUgVGhlIHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gem9uZSBUaGUgdGltZXpvbmUgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCB0b2tlbikge1xyXG4gICAgaWYgKCF6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZCgoY3VycmVudFRpbWUudW5peE1pbGxpcyAtIHV0Y1RpbWUudW5peE1pbGxpcykgLyA2MDAwMCk7XHJcbiAgICB2YXIgb2Zmc2V0SG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcbiAgICB2YXIgb2Zmc2V0SG91cnNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0SG91cnMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgb2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcbiAgICB2YXIgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuICAgIHZhciBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgdmFyIHJlc3VsdDtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcIk9cIjpcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCJVVENcIjtcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCItXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgY2FzZSBcIlpcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUb2tlbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXc6IFwiT09PT1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IFwiT1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlpPTkVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgbmV3VG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwielwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwidlwiOlxyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiVlwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInVua1wiO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLm5hbWUoKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIlhcIjpcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiWlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInhcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvZmZzZXRIb3Vyc1N0cmluZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcm1hdC5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIG1pbihkMSwgZDIpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgbnVsbFwiKTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KChkMSBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBkYXRldGltZV8xLkRhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgZHVyYXRpb25fMS5EdXJhdGlvbiksIFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiKTtcclxuICAgIHJldHVybiBkMS5taW4oZDIpO1xyXG59XHJcbmV4cG9ydHMubWluID0gbWluO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gbWF4KGQxLCBkMikge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBudWxsXCIpO1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGFzc2VydF8xLmRlZmF1bHQoKGQxIGluc3RhbmNlb2YgZGF0ZXRpbWVfMS5EYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIGRhdGV0aW1lXzEuRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIGR1cmF0aW9uXzEuRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uKSwgXCJFaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zIGV4cGVjdGVkXCIpO1xyXG4gICAgcmV0dXJuIGQxLm1heChkMik7XHJcbn1cclxuZXhwb3J0cy5tYXggPSBtYXg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBhYnMoZCkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkLCBcImZpcnN0IGFyZ3VtZW50IGlzIG51bGxcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQgaW5zdGFuY2VvZiBkdXJhdGlvbl8xLkR1cmF0aW9uLCBcImZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhIER1cmF0aW9uXCIpO1xyXG4gICAgcmV0dXJuIGQuYWJzKCk7XHJcbn1cclxuZXhwb3J0cy5hYnMgPSBhYnM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdsb2JhbHMuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBJbmRpY2F0ZXMgaG93IGEgRGF0ZSBvYmplY3Qgc2hvdWxkIGJlIGludGVycHJldGVkLlxyXG4gKiBFaXRoZXIgd2UgY2FuIHRha2UgZ2V0WWVhcigpLCBnZXRNb250aCgpIGV0YyBmb3Igb3VyIGZpZWxkXHJcbiAqIHZhbHVlcywgb3Igd2UgY2FuIHRha2UgZ2V0VVRDWWVhcigpLCBnZXRVdGNNb250aCgpIGV0YyB0byBkbyB0aGF0LlxyXG4gKi9cclxuKGZ1bmN0aW9uIChEYXRlRnVuY3Rpb25zKSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIERhdGVGdW5jdGlvbnNbRGF0ZUZ1bmN0aW9uc1tcIkdldFwiXSA9IDBdID0gXCJHZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoZSBEYXRlLmdldFVUQ0Z1bGxZZWFyKCksIERhdGUuZ2V0VVRDTW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0VVRDXCJdID0gMV0gPSBcIkdldFVUQ1wiO1xyXG59KShleHBvcnRzLkRhdGVGdW5jdGlvbnMgfHwgKGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyA9IHt9KSk7XHJcbnZhciBEYXRlRnVuY3Rpb25zID0gZXhwb3J0cy5EYXRlRnVuY3Rpb25zO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1qYXZhc2NyaXB0LmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxuLyoqXHJcbiAqIEByZXR1cm4gdHJ1ZSBpZmYgZ2l2ZW4gYXJndW1lbnQgaXMgYW4gaW50ZWdlciBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGlzSW50KG4pIHtcclxuICAgIGlmICh0eXBlb2YgKG4pICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKG4pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcclxufVxyXG5leHBvcnRzLmlzSW50ID0gaXNJbnQ7XHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqL1xyXG5mdW5jdGlvbiByb3VuZFN5bShuKSB7XHJcbiAgICBpZiAobiA8IDApIHtcclxuICAgICAgICByZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChuKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnJvdW5kU3ltID0gcm91bmRTeW07XHJcbi8qKlxyXG4gKiBTdHJpY3RlciB2YXJpYW50IG9mIHBhcnNlRmxvYXQoKS5cclxuICogQHBhcmFtIHZhbHVlXHRJbnB1dCBzdHJpbmdcclxuICogQHJldHVybiB0aGUgZmxvYXQgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGZsb2F0LCBOYU4gb3RoZXJ3aXNlXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZSkge1xyXG4gICAgaWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBOYU47XHJcbn1cclxuZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGZpbHRlckZsb2F0O1xyXG5mdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZSwgbW9kdWxvKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG1vZHVsbyA+PSAxLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuICAgIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICByZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlICUgbW9kdWxvO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucG9zaXRpdmVNb2R1bG8gPSBwb3NpdGl2ZU1vZHVsbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciB0b2tlbl8xID0gcmVxdWlyZShcIi4vdG9rZW5cIik7XHJcbnZhciB0aW1lem9uZV8xID0gcmVxdWlyZShcIi4vdGltZXpvbmVcIik7XHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gdGVzdFxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIExETUwgZm9ybWF0IHN0cmluZ1xyXG4gKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBzdHJpbmcgYWZ0ZXIgdGhlIGRhdGUrdGltZVxyXG4gKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgc3RyaW5nIGlzIHZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZWFibGUoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgYWxsb3dUcmFpbGluZykge1xyXG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBudWxsLCBhbGxvd1RyYWlsaW5nKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGFyc2VhYmxlID0gcGFyc2VhYmxlO1xyXG4vKipcclxuICogUGFyc2UgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIGFzc3VtaW5nIHRoZSBnaXZlbiBmb3JtYXQuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHBhcnNlXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIG92ZXJyaWRlWm9uZSwgYWxsb3dUcmFpbGluZykge1xyXG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxyXG4gICAgaWYgKCFkYXRlVGltZVN0cmluZykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIGRhdGUgZ2l2ZW5cIik7XHJcbiAgICB9XHJcbiAgICBpZiAoIWZvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIGZvcm1hdCBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgdmFyIHRva2VuaXplciA9IG5ldyB0b2tlbl8xLlRva2VuaXplcihmb3JtYXRTdHJpbmcpO1xyXG4gICAgICAgIHZhciB0b2tlbnMgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuICAgICAgICB2YXIgdGltZSA9IHsgeWVhcjogLTEgfTtcclxuICAgICAgICB2YXIgem9uZSA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcG5yID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBwenIgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IGRhdGVUaW1lU3RyaW5nO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcclxuICAgICAgICAgICAgdmFyIHRva2VuUmVzdWx0ID0gdm9pZCAwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5FUkE6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLllFQVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVI6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLm1vbnRoID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuREFZOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLmRheSA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVk6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuSE9VUjpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbnV0ZSA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuLnJhdy5jaGFyQXQoMCkgPT09IFwic1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuc2Vjb25kID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLnJhdy5jaGFyQXQoMCkgPT09IFwiU1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJ1wiICsgdG9rZW4ucmF3ICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5aT05FOlxyXG4gICAgICAgICAgICAgICAgICAgIHB6ciA9IHN0cmlwWm9uZShyZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHB6ci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgem9uZSA9IHB6ci56b25lO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLkRhdGVUaW1lVG9rZW5UeXBlLldFRUs6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWTpcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcFJhdyhyZW1haW5pbmcsIHRva2VuLnJhdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB7IHRpbWU6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRpbWUpLCB6b25lOiB6b25lIHx8IG51bGwgfTtcclxuICAgICAgICBpZiAoIXJlc3VsdC50aW1lLnZhbGlkYXRlKCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicmVzdWx0aW5nIGRhdGUgaW52YWxpZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxyXG4gICAgICAgIGlmIChvdmVycmlkZVpvbmUpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnpvbmUgPSBvdmVycmlkZVpvbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBkYXRlICdcIiArIGRhdGVUaW1lU3RyaW5nICsgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIiArIGZvcm1hdFN0cmluZyArIFwiJzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ3JlbWFpbmluZydcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgZGF0ZSAnXCIgKyBkYXRlVGltZVN0cmluZyArIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIgKyBmb3JtYXRTdHJpbmcgKyBcIic6IFwiICsgZS5tZXNzYWdlKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XHJcbmZ1bmN0aW9uIHN0cmlwTnVtYmVyKHMpIHtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgbjogTmFOLFxyXG4gICAgICAgIHJlbWFpbmluZzogc1xyXG4gICAgfTtcclxuICAgIHZhciBudW1iZXJTdHJpbmcgPSBcIlwiO1xyXG4gICAgd2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcbiAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXHJcbiAgICB3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgcmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcclxuICAgIGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIWlzRmluaXRlKHJlc3VsdC5uKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIGEgbnVtYmVyIGJ1dCBnb3QgJ1wiICsgbnVtYmVyU3RyaW5nICsgXCInXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG52YXIgV0hJVEVTUEFDRSA9IFtcIiBcIiwgXCJcXHRcIiwgXCJcXHJcIiwgXCJcXHZcIiwgXCJcXG5cIl07XHJcbmZ1bmN0aW9uIHN0cmlwWm9uZShzKSB7XHJcbiAgICBpZiAocy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyB6b25lIGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICB6b25lOiBudWxsLFxyXG4gICAgICAgIHJlbWFpbmluZzogc1xyXG4gICAgfTtcclxuICAgIHZhciB6b25lU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuICAgICAgICB6b25lU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIHJlc3VsdC56b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5mdW5jdGlvbiBzdHJpcFJhdyhzLCBleHBlY3RlZCkge1xyXG4gICAgdmFyIHJlbWFpbmluZyA9IHM7XHJcbiAgICB2YXIgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xyXG4gICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG4gICAgICAgIHJlbWFpbmluZyA9IHJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICAgICAgZXJlbWFpbmluZyA9IGVyZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgaWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkICdcIiArIGV4cGVjdGVkICsgXCInXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbWFpbmluZztcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFBlcmlvZGljIGludGVydmFsIGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgZGF0ZXRpbWVfMSA9IHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG4vKipcclxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcclxuICogZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG4gKi9cclxuKGZ1bmN0aW9uIChQZXJpb2REc3QpIHtcclxuICAgIC8qKlxyXG4gICAgICogS2VlcCByZXBlYXRpbmcgaW4gc2ltaWxhciBpbnRlcnZhbHMgbWVhc3VyZWQgaW4gVVRDLFxyXG4gICAgICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cclxuICAgICAqIEUuZy4gYSByZXBldGl0aW9uIG9mIG9uZSBob3VyIHdpbGwgdGFrZSBvbmUgcmVhbCBob3VyXHJcbiAgICAgKiBldmVyeSB0aW1lLCBldmVuIGluIGEgdGltZSB6b25lIHdpdGggRFNULlxyXG4gICAgICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxyXG4gICAgICogZGlmZmVyZW5jZXMgd2lsbCBzdGlsbCBtYWtlIHRoZSBpbnRlcnZhbHMgZGlmZmVyZW50LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckludGVydmFsc1wiXSA9IDBdID0gXCJSZWd1bGFySW50ZXJ2YWxzXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxyXG4gICAgICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxyXG4gICAgICogYSBwZXJpb2Qgb2Ygb25lIGRheSwgcmVmZXJlbmNlaW5nIGF0IDg6MDVBTSBFdXJvcGUvQW1zdGVyZGFtIHRpbWVcclxuICAgICAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxyXG4gICAgICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcclxuICAgICAqIDIzIGhvdXJzIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICAgICAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXHJcbiAgICAgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckxvY2FsVGltZVwiXSA9IDFdID0gXCJSZWd1bGFyTG9jYWxUaW1lXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuZC1vZi1lbnVtIG1hcmtlclxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiTUFYXCJdID0gMl0gPSBcIk1BWFwiO1xyXG59KShleHBvcnRzLlBlcmlvZERzdCB8fCAoZXhwb3J0cy5QZXJpb2REc3QgPSB7fSkpO1xyXG52YXIgUGVyaW9kRHN0ID0gZXhwb3J0cy5QZXJpb2REc3Q7XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxyXG4gKi9cclxuZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocCkge1xyXG4gICAgc3dpdGNoIChwKSB7XHJcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcclxuICAgICAgICBjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBQZXJpb2REc3RcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBlcmlvZERzdFRvU3RyaW5nID0gcGVyaW9kRHN0VG9TdHJpbmc7XHJcbi8qKlxyXG4gKiBSZXBlYXRpbmcgdGltZSBwZXJpb2Q6IGNvbnNpc3RzIG9mIGEgcmVmZXJlbmNlIGRhdGUgYW5kXHJcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxyXG4gKi9cclxudmFyIFBlcmlvZCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLiBTZWUgb3RoZXIgY29uc3RydWN0b3JzIGZvciBleHBsYW5hdGlvbi5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUGVyaW9kKHJlZmVyZW5jZSwgYW1vdW50T3JJbnRlcnZhbCwgdW5pdE9yRHN0LCBnaXZlbkRzdCkge1xyXG4gICAgICAgIHZhciBpbnRlcnZhbDtcclxuICAgICAgICB2YXIgZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaW50ZXJ2YWwgPSBhbW91bnRPckludGVydmFsO1xyXG4gICAgICAgICAgICBkc3QgPSB1bml0T3JEc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiB1bml0T3JEc3QgPT09IFwibnVtYmVyXCIgJiYgdW5pdE9yRHN0ID49IDAgJiYgdW5pdE9yRHN0IDwgYmFzaWNzXzEuVGltZVVuaXQuTUFYLCBcIkludmFsaWQgdW5pdFwiKTtcclxuICAgICAgICAgICAgaW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QpO1xyXG4gICAgICAgICAgICBkc3QgPSBnaXZlbkRzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISFyZWZlcmVuY2UsIFwiUmVmZXJlbmNlIHRpbWUgbm90IGdpdmVuXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaW50ZXJ2YWwuYW1vdW50KCkgPiAwLCBcIkFtb3VudCBtdXN0IGJlIHBvc2l0aXZlIG5vbi16ZXJvLlwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE1hdGguZmxvb3IoaW50ZXJ2YWwuYW1vdW50KCkpID09PSBpbnRlcnZhbC5hbW91bnQoKSwgXCJBbW91bnQgbXVzdCBiZSBhIHdob2xlIG51bWJlclwiKTtcclxuICAgICAgICB0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XHJcbiAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcclxuICAgICAgICB0aGlzLl9kc3QgPSBkc3Q7XHJcbiAgICAgICAgdGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XHJcbiAgICAgICAgLy8gcmVndWxhciBsb2NhbCB0aW1lIGtlZXBpbmcgaXMgb25seSBzdXBwb3J0ZWQgaWYgd2UgY2FuIHJlc2V0IGVhY2ggZGF5XHJcbiAgICAgICAgLy8gTm90ZSB3ZSB1c2UgaW50ZXJuYWwgYW1vdW50cyB0byBkZWNpZGUgdGhpcyBiZWNhdXNlIGFjdHVhbGx5IGl0IGlzIHN1cHBvcnRlZCBpZlxyXG4gICAgICAgIC8vIHRoZSBpbnB1dCBpcyBhIG11bHRpcGxlIG9mIG9uZSBkYXkuXHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkgJiYgZHN0ID09PSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxNDQwLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBmcmVzaCBjb3B5IG9mIHRoZSBwZXJpb2RcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBlcmlvZCh0aGlzLl9yZWZlcmVuY2UsIHRoaXMuX2ludGVydmFsLCB0aGlzLl9kc3QpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUucmVmZXJlbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBERVBSRUNBVEVEOiBvbGQgbmFtZSBmb3IgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBpbnRlcnZhbFxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmludGVydmFsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGFtb3VudCBvZiB1bml0cyBvZiB0aGUgaW50ZXJ2YWxcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHVuaXQgb2YgdGhlIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRzdCBoYW5kbGluZyBtb2RlXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kc3Q7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGdyZWF0ZXIgdGhhblxyXG4gICAgICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGFmdGVyIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuXHJcbiAgICAgKlx0XHRcdGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRGaXJzdCA9IGZ1bmN0aW9uIChmcm9tRGF0ZSkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSwgXCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG4gICAgICAgIHZhciBhcHByb3g7XHJcbiAgICAgICAgdmFyIGFwcHJveDI7XHJcbiAgICAgICAgdmFyIGFwcHJveE1pbjtcclxuICAgICAgICB2YXIgcGVyaW9kcztcclxuICAgICAgICB2YXIgZGlmZjtcclxuICAgICAgICB2YXIgbmV3WWVhcjtcclxuICAgICAgICB2YXIgbmV3TW9udGg7XHJcbiAgICAgICAgdmFyIHJlbWFpbmRlcjtcclxuICAgICAgICB2YXIgaW1heDtcclxuICAgICAgICB2YXIgaW1pbjtcclxuICAgICAgICB2YXIgaW1pZDtcclxuICAgICAgICB2YXIgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA9PT0gMSkge1xyXG4gICAgICAgICAgICAvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCBub3JtYWxGcm9tLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgbm9ybWFsRnJvbS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gQW1vdW50IGlzIG5vdCAxLFxyXG4gICAgICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdG8gVVRDIHRpbWVcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb25seSAyNSBsZWFwIHNlY29uZHMgaGF2ZSBldmVyIGJlZW4gYWRkZWQgc28gdGhpcyBzaG91bGQgc3RpbGwgYmUgT0suXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gKG5vcm1hbEZyb20udXRjWWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y1llYXIoKSkgKiAxMiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIC0xIGJlbG93IGlzIGJlY2F1c2UgdGhlIGRheS1vZi1tb250aCBvZiByZWZlcmVuY2UgZGF0ZSBtYXkgYmUgYWZ0ZXIgdGhlIGRheSBvZiB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBtaWxsaXNlY29uZCBlYWNoIHNlY29uZCwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIHNlY29uZCB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWlsbGlzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDAwMDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3gyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IGltaWQgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IGltaWQgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW51cyBvbmUgbWludXRlIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0byB0YWtlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbWF4ID49IGltaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIGhvdXIgdGhpcy5faW50UmVmZXJlbmNlYXJ5IGVhY2ggdGltZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZSBtaW51cyBvbmUgaG91clxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoMjQgKiA2MCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoMjQgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IGhhdmUgbGVhcCBkYXlzLCBzbyB3ZSBjYW4gYXBwcm94aW1hdGUgYnkgY2FsY3VsYXRpbmcgd2l0aCBVVEMgdGltZXN0YW1wc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gKG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSkgKiAxMiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwodGhpcy5faW50ZXJ2YWwubXVsdGlwbHkocGVyaW9kcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdZZWFyID0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSArIHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobmV3WWVhciwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KGFwcHJveCkuY29udmVydChmcm9tRGF0ZS56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcbiAgICAgKiBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeSwgb3RoZXJ3aXNlIHRoZSBhbnN3ZXIgaXMgaW5jb3JyZWN0LlxyXG4gICAgICogVGhpcyBmdW5jdGlvbiBoYXMgTVVDSCBiZXR0ZXIgcGVyZm9ybWFuY2UgdGhhbiBmaW5kRmlyc3QuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cclxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIGFkZC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cclxuICAgICAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZE5leHQgPSBmdW5jdGlvbiAocHJldiwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhcHJldiwgXCJQcmV2IG11c3QgYmUgZ2l2ZW5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhcHJldi56b25lKCksIFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChjb3VudCkgPT09IFwibnVtYmVyXCIsIFwiQ291bnQgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE1hdGguZmxvb3IoY291bnQpID09PSBjb3VudCwgXCJDb3VudCBtdXN0IGJlIGFuIGludGVnZXJcIik7XHJcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcclxuICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSkuY29udmVydChwcmV2LnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpKS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgbGVzcyB0aGFuXHJcbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXHJcbiAgICAgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxyXG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBiZWZvcmUgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuICAgICAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cclxuICAgICAqXHRcdFx0aW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZExhc3QgPSBmdW5jdGlvbiAoZnJvbSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHRoaXMuZmluZEZpcnN0KGZyb20pKTtcclxuICAgICAgICBpZiAocmVzdWx0LmVxdWFscyhmcm9tKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XHJcbiAgICAgKiBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeSwgb3RoZXJ3aXNlIHRoZSBhbnN3ZXIgaXMgaW5jb3JyZWN0LlxyXG4gICAgICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cclxuICAgICAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXHJcbiAgICAgKiBAcmV0dXJuIChuZXh0IC0gY291bnQgKiBwZXJpb2QpLCBpbiB0aGUgc2FtZSB0aW1lem9uZSBhcyBuZXh0LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRQcmV2ID0gZnVuY3Rpb24gKG5leHQsIGNvdW50KSB7XHJcbiAgICAgICAgaWYgKGNvdW50ID09PSB2b2lkIDApIHsgY291bnQgPSAxOyB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5leHQobmV4dCwgLTEgKiBjb3VudCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyBvbiBhIHBlcmlvZCBib3VuZGFyeVxyXG4gICAgICogKGV4cGVuc2l2ZSEpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaXNCb3VuZGFyeSA9IGZ1bmN0aW9uIChvY2N1cnJlbmNlKSB7XHJcbiAgICAgICAgaWYgKCFvY2N1cnJlbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksIFwiVGhlIG9jY3VycmVuY2UgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmZpbmRGaXJzdChvY2N1cnJlbmNlLnN1YihkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cclxuICAgICAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxyXG4gICAgICogYW5kIHNhbWUgZHN0LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIC8vIG5vdGUgd2UgdGFrZSB0aGUgbm9uLW5vcm1hbGl6ZWQgcmVmZXJlbmNlKCkgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcclxuICAgICAgICByZXR1cm4gKHRoaXMuaXNCb3VuZGFyeShvdGhlci5yZWZlcmVuY2UoKSlcclxuICAgICAgICAgICAgJiYgdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzRXhhY3Qob3RoZXIuaW50ZXJ2YWwoKSlcclxuICAgICAgICAgICAgJiYgdGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBwZXJpb2Qgd2FzIGNvbnN0cnVjdGVkIHdpdGggaWRlbnRpY2FsIGFyZ3VtZW50cyB0byB0aGUgb3RoZXIgb25lLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fcmVmZXJlbmNlLmlkZW50aWNhbChvdGhlci5yZWZlcmVuY2UoKSlcclxuICAgICAgICAgICAgJiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLmludGVydmFsKCkpXHJcbiAgICAgICAgICAgICYmIHRoaXMuZHN0KCkgPT09IG90aGVyLmRzdCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMUhcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZS50b0lzb1N0cmluZygpICsgXCIvXCIgKyB0aGlzLl9pbnRlcnZhbC50b0lzb1N0cmluZygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZS5nLlxyXG4gICAgICogXCIxMCB5ZWFycywgcmVmZXJlbmNlaW5nIGF0IDIwMTQtMDMtMDFUMTI6MDA6MDAgRXVyb3BlL0Ftc3RlcmRhbSwga2VlcGluZyByZWd1bGFyIGludGVydmFsc1wiLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xyXG4gICAgICAgIC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcclxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCIsIGtlZXBpbmcgXCIgKyBwZXJpb2REc3RUb1N0cmluZyh0aGlzLl9kc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW1BlcmlvZDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvcnJlY3RzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gX3JlZmVyZW5jZSBhbmQgX2ludFJlZmVyZW5jZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fY29ycmVjdERheSA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3JlZmVyZW5jZSAhPT0gdGhpcy5faW50UmVmZXJlbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShkLnllYXIoKSwgZC5tb250aCgpLCBNYXRoLm1pbihiYXNpY3MuZGF5c0luTW9udGgoZC55ZWFyKCksIGQubW9udGgoKSksIHRoaXMuX3JlZmVyZW5jZS5kYXkoKSksIGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElmIHRoaXMuX2ludGVybmFsVW5pdCBpbiBbTW9udGgsIFllYXJdLCBub3JtYWxpemVzIHRoZSBkYXktb2YtbW9udGhcclxuICAgICAqIHRvIDw9IDI4LlxyXG4gICAgICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9ub3JtYWxpemVEYXkgPSBmdW5jdGlvbiAoZCwgYW55bW9udGgpIHtcclxuICAgICAgICBpZiAoYW55bW9udGggPT09IHZvaWQgMCkgeyBhbnltb250aCA9IHRydWU7IH1cclxuICAgICAgICBpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxyXG4gICAgICAgICAgICB8fCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyICYmIChkLm1vbnRoKCkgPT09IDIgfHwgYW55bW9udGgpICYmIGQuZGF5KCkgPiAyOCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIDI4LCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxyXG4gICAgICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fZHN0UmVsZXZhbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICghIXRoaXMuX3JlZmVyZW5jZS56b25lKClcclxuICAgICAgICAgICAgJiYgdGhpcy5fcmVmZXJlbmNlLnpvbmUoKS5raW5kKCkgPT09IHRpbWV6b25lXzEuVGltZVpvbmVLaW5kLlByb3BlclxyXG4gICAgICAgICAgICAmJiB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpLmhhc0RzdCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcclxuICAgICAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXHJcbiAgICAgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxyXG4gICAgICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cclxuICAgICAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9jYWxjSW50ZXJuYWxWYWx1ZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIGFueSBhYm92ZS11bml0IHZhbHVlc1xyXG4gICAgICAgIHZhciBpbnRBbW91bnQgPSB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcclxuICAgICAgICB2YXIgaW50VW5pdCA9IHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQgJiYgaW50QW1vdW50ID49IDEwMDAgJiYgaW50QW1vdW50ICUgMTAwMCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMTAwMDtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcclxuICAgICAgICAgICAgLy8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTWludXRlICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyICYmIGludEFtb3VudCA+PSAyNCAmJiBpbnRBbW91bnQgJSAyNCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAyNDtcclxuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbm93IHJlbW92ZSB3ZWVrcyBzbyB3ZSBoYXZlIG9uZSBsZXNzIGNhc2UgdG8gd29ycnkgYWJvdXRcclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuV2Vlaykge1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgKiA3O1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgaW50QW1vdW50ID49IDEyICYmIGludEFtb3VudCAlIDEyID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDEyO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW50SW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihpbnRBbW91bnQsIGludFVuaXQpO1xyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBkc3QgaGFuZGxpbmdcclxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnREc3QgPSB0aGlzLl9kc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnREc3QgPSBQZXJpb2REc3QuUmVndWxhckludGVydmFscztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIHJlZmVyZW5jZSBkYXlcclxuICAgICAgICB0aGlzLl9pbnRSZWZlcmVuY2UgPSB0aGlzLl9ub3JtYWxpemVEYXkodGhpcy5fcmVmZXJlbmNlLCBmYWxzZSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBlcmlvZDtcclxufSgpKTtcclxuZXhwb3J0cy5QZXJpb2QgPSBQZXJpb2Q7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBlcmlvZC5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGJlZ2lubmluZy5cclxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXHJcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcclxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXHJcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYWRMZWZ0KHMsIHdpZHRoLCBjaGFyKSB7XHJcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgcGFkZGluZyArPSBjaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcbmV4cG9ydHMucGFkTGVmdCA9IHBhZExlZnQ7XHJcbi8qKlxyXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGVuZC5cclxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXHJcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcclxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXHJcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBwYWRSaWdodChzLCB3aWR0aCwgY2hhcikge1xyXG4gICAgdmFyIHBhZGRpbmcgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG4gICAgICAgIHBhZGRpbmcgKz0gY2hhcjtcclxuICAgIH1cclxuICAgIHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5leHBvcnRzLnBhZFJpZ2h0ID0gcGFkUmlnaHQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0cmluZ3MuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBEZWZhdWx0IHRpbWUgc291cmNlLCByZXR1cm5zIGFjdHVhbCB0aW1lXHJcbiAqL1xyXG52YXIgUmVhbFRpbWVTb3VyY2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUmVhbFRpbWVTb3VyY2UoKSB7XHJcbiAgICB9XHJcbiAgICBSZWFsVGltZVNvdXJjZS5wcm90b3R5cGUubm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWFsVGltZVNvdXJjZTtcclxufSgpKTtcclxuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IFJlYWxUaW1lU291cmNlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lc291cmNlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xyXG4vKipcclxuICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlIGFzIHBlciBPUyBzZXR0aW5ncy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqL1xyXG5mdW5jdGlvbiBsb2NhbCgpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS5sb2NhbCgpO1xyXG59XHJcbmV4cG9ydHMubG9jYWwgPSBsb2NhbDtcclxuLyoqXHJcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZnVuY3Rpb24gdXRjKCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLnV0YygpO1xyXG59XHJcbmV4cG9ydHMudXRjID0gdXRjO1xyXG4vKipcclxuICogU2VlIHRoZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBvdGhlciB6b25lKCkgbWV0aG9kIHNpZ25hdHVyZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB6b25lKGEsIGRzdCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcclxufVxyXG5leHBvcnRzLnpvbmUgPSB6b25lO1xyXG4vKipcclxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRpbWVab25lS2luZCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIkxvY2FsXCJdID0gMF0gPSBcIkxvY2FsXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZpeGVkIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJPZmZzZXRcIl0gPSAxXSA9IFwiT2Zmc2V0XCI7XHJcbiAgICAvKipcclxuICAgICAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xyXG4gICAgICogRFNUIGlmIGFwcGxpY2FibGUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJQcm9wZXJcIl0gPSAyXSA9IFwiUHJvcGVyXCI7XHJcbn0pKGV4cG9ydHMuVGltZVpvbmVLaW5kIHx8IChleHBvcnRzLlRpbWVab25lS2luZCA9IHt9KSk7XHJcbnZhciBUaW1lWm9uZUtpbmQgPSBleHBvcnRzLlRpbWVab25lS2luZDtcclxuLyoqXHJcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XHJcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxyXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcclxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXHJcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcclxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cclxuICovXHJcbnZhciBUaW1lWm9uZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIERvIG5vdCB1c2UgdGhpcyBjb25zdHJ1Y3RvciwgdXNlIHRoZSBzdGF0aWNcclxuICAgICAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XHJcbiAgICAgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUaW1lWm9uZShuYW1lLCBkc3QpIHtcclxuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICBpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLkxvY2FsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcclxuICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIFwibm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICdcIiArIG5hbWUgKyBcIidcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUuIE5vdGUgdGhhdFxyXG4gICAgICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXHJcbiAgICAgKiAyMDE0LTAxLTAxIGlzICswMTowMCBhbmQgYW1zdGVyZGFtIHRpbWUgZm9yIDIwMTQtMDctMDEgaXMgKzAyOjAwXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLmxvY2FsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnV0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcIlVUQ1wiLCB0cnVlKTsgLy8gdXNlICd0cnVlJyBmb3IgRFNUIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBkaXNwbGF5IGFzIFwiVVRDXCIsIG5vdCBcIlVUQyB3aXRob3V0IERTVFwiXHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBab25lIGltcGxlbWVudGF0aW9uc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS56b25lID0gZnVuY3Rpb24gKGEsIGRzdCkge1xyXG4gICAgICAgIGlmIChkc3QgPT09IHZvaWQgMCkgeyBkc3QgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIG5hbWUgPSBcIlwiO1xyXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhKSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIG5vIHRpbWUgem9uZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyhzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGltZVpvbmUuem9uZSgpOiBVbmV4cGVjdGVkIGFyZ3VtZW50IHR5cGUgXFxcIlwiICsgdHlwZW9mIChhKSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUobmFtZSwgZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1ha2VzIHRoaXMgY2xhc3MgYXBwZWFyIGNsb25hYmxlLiBOT1RFIGFzIHRpbWUgem9uZSBvYmplY3RzIGFyZSBjYWNoZWQgeW91IHdpbGwgTk9UXHJcbiAgICAgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxyXG4gICAgICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuICAgICAqIHRoZSBsb2NhbCB0aW1lIHpvbmUuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5kc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RzdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSAoTG9jYWwvT2Zmc2V0L1Byb3BlcilcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmtpbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tpbmQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBFcXVhbGl0eSBvcGVyYXRvci4gTWFwcyB6ZXJvIG9mZnNldHMgYW5kIGRpZmZlcmVudCBuYW1lcyBmb3IgVVRDIG9udG9cclxuICAgICAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXHJcbiAgICAgICAgICAgICAgICAmJiAodGhpcy5fZHN0ID09PSBvdGhlci5fZHN0IHx8ICF0aGlzLmhhc0RzdCgpKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyB3ZXJlIGlkZW50aWNhbCwgc28gVVRDICE9PSBHTVRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGlzIHpvbmUgZXF1aXZhbGVudCB0byBVVEM/XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pc1V0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuICh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS56b25lSXNVdGModGhpcy5fbmFtZSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRG9lcyB0aGlzIHpvbmUgaGF2ZSBEYXlsaWdodCBTYXZpbmcgVGltZSBhdCBhbGw/XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6IGEpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSwgdXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIFRpbWVab25lS2luZCAnXCIgKyB0aGlzLl9raW5kICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yWm9uZSA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6IGEpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuaG91ciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWludXRlLCBsb2NhbFRpbWUuY29tcG9uZW50cy5zZWNvbmQsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbGxpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXRMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIFRpbWVab25lS2luZCAnXCIgKyB0aGlzLl9raW5kICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3JVdGNEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Rm9yVXRjKGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5hYmJyZXZpYXRpb25Gb3JVdGMgPSBmdW5jdGlvbiAoYSwgYiwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGksIGMpIHtcclxuICAgICAgICB2YXIgdXRjVGltZTtcclxuICAgICAgICB2YXIgZHN0RGVwZW5kZW50ID0gdHJ1ZTtcclxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIGJhc2ljc18xLlRpbWVTdHJ1Y3QpIHtcclxuICAgICAgICAgICAgdXRjVGltZSA9IGE7XHJcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB1dGNUaW1lID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImxvY2FsXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVua25vd24gVGltZVpvbmVLaW5kICdcIiArIHRoaXMuX2tpbmQgKyBcIidcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5ub3JtYWxpemVab25lVGltZSA9IGZ1bmN0aW9uIChsb2NhbFRpbWUsIG9wdCkge1xyXG4gICAgICAgIGlmIChvcHQgPT09IHZvaWQgMCkgeyBvcHQgPSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIHZhciB0em9wdCA9IChvcHQgPT09IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gPyB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXApO1xyXG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxUaW1lO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXHJcbiAgICAgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm5hbWUoKTtcclxuICAgICAgICBpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBcIltUaW1lWm9uZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICAgICAgICB2YXIgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xyXG4gICAgICAgIHJldHVybiBzaWduICsgc3RyaW5ncy5wYWRMZWZ0KGhvdXJzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQobWludXRlcy50b1N0cmluZygxMCksIDIsIFwiMFwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cclxuICAgICAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXHJcbiAgICAgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgLy8gZWFzeSBjYXNlXHJcbiAgICAgICAgaWYgKHQgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayB0aGF0IHRoZSByZW1haW5kZXIgY29uZm9ybXMgdG8gSVNPIHRpbWUgem9uZSBzcGVjXHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLyksIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcclxuICAgICAgICB2YXIgc2lnbiA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xyXG4gICAgICAgIHZhciBob3VycyA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSAwO1xyXG4gICAgICAgIGlmICh0Lmxlbmd0aCA9PT0gNSkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodC5sZW5ndGggPT09IDYpIHtcclxuICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDQsIDIpLCAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaG91cnMgPj0gMCAmJiBob3VycyA8IDI0LCBcIk9mZnNldHMgZnJvbSBVVEMgbXVzdCBiZSBsZXNzIHRoYW4gYSBkYXkuXCIpO1xyXG4gICAgICAgIHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcclxuICAgICAqIEBwYXJhbSBuYW1lXHRUaW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIGRzdCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBuYW1lICsgKGRzdCA/IFwiX0RTVFwiIDogXCJfTk8tRFNUXCIpO1xyXG4gICAgICAgIGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUaW1lWm9uZS5fY2FjaGVba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XHJcbiAgICAgICAgICAgIFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXHJcbiAgICAgKiBjYWNoZSBsb29rdXBcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHQubGVuZ3RoID4gMCwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xyXG4gICAgICAgIGlmICh0ID09PSBcImxvY2FsdGltZVwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0ID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIrMDA6MDBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nKHQpKSB7XHJcbiAgICAgICAgICAgIC8vIG9mZnNldCBzdHJpbmdcclxuICAgICAgICAgICAgLy8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLl9pc09mZnNldFN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICByZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGltZSB6b25lIGNhY2hlLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fY2FjaGUgPSB7fTtcclxuICAgIHJldHVybiBUaW1lWm9uZTtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lWm9uZSA9IFRpbWVab25lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lem9uZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgVG9rZW5pemVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IHRva2VuaXplclxyXG4gICAgICogQHBhcmFtIF9mb3JtYXRTdHJpbmcgKG9wdGlvbmFsKSBTZXQgdGhlIGZvcm1hdCBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVG9rZW5pemVyKF9mb3JtYXRTdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9mb3JtYXRTdHJpbmcgPSBfZm9ybWF0U3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGZvcm1hdCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIG5ldyBzdHJpbmcgdG8gdXNlIGZvciBmb3JtYXR0aW5nXHJcbiAgICAgKi9cclxuICAgIFRva2VuaXplci5wcm90b3R5cGUuc2V0Rm9ybWF0U3RyaW5nID0gZnVuY3Rpb24gKGZvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2Zvcm1hdFN0cmluZyA9IGZvcm1hdFN0cmluZztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcGVuZCBhIG5ldyB0b2tlbiB0byB0aGUgY3VycmVudCBsaXN0IG9mIHRva2Vucy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdG9rZW5TdHJpbmcgVGhlIHN0cmluZyB0aGF0IG1ha2VzIHVwIHRoZSB0b2tlblxyXG4gICAgICogQHBhcmFtIHRva2VuQXJyYXkgVGhlIGV4aXN0aW5nIGFycmF5IG9mIHRva2Vuc1xyXG4gICAgICogQHBhcmFtIHJhdyAob3B0aW9uYWwpIElmIHRydWUsIGRvbid0IHBhcnNlIHRoZSB0b2tlbiBidXQgaW5zZXJ0IGl0IGFzIGlzXHJcbiAgICAgKiBAcmV0dXJuIFRva2VuW10gVGhlIHJlc3VsdGluZyBhcnJheSBvZiB0b2tlbnMuXHJcbiAgICAgKi9cclxuICAgIFRva2VuaXplci5wcm90b3R5cGUuX2FwcGVuZFRva2VuID0gZnVuY3Rpb24gKHRva2VuU3RyaW5nLCB0b2tlbkFycmF5LCByYXcpIHtcclxuICAgICAgICBpZiAodG9rZW5TdHJpbmcgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0ge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByYXc6IHRva2VuU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmICghcmF3KSB7XHJcbiAgICAgICAgICAgICAgICB0b2tlbi50eXBlID0gbWFwU3ltYm9sVG9UeXBlKHRva2VuLnN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9rZW5BcnJheS5wdXNoKHRva2VuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRva2VuQXJyYXk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgaW50ZXJuYWwgc3RyaW5nIGFuZCByZXR1cm4gYW4gYXJyYXkgb2YgdG9rZW5zLlxyXG4gICAgICogQHJldHVybiBUb2tlbltdXHJcbiAgICAgKi9cclxuICAgIFRva2VuaXplci5wcm90b3R5cGUucGFyc2VUb2tlbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgIHZhciBwcmV2aW91c0NoYXIgPSBcIlwiO1xyXG4gICAgICAgIHZhciBxdW90aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2Zvcm1hdFN0cmluZy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudENoYXIgPSB0aGlzLl9mb3JtYXRTdHJpbmdbaV07XHJcbiAgICAgICAgICAgIC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXF1b3RpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gXCInXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFR3byBwb3NzaWJpbGl0aWVzOiBXZXJlIGFyZSBkb25lIHF1b3RpbmcsIG9yIHdlIGFyZSBlc2NhcGluZyBhICcgY2hhcmFjdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBpbmcsIGFkZCAnIHRvIHRoZSB0b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBxdW90aW5nID0gIXF1b3Rpbmc7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyBGbHVzaCBjdXJyZW50IHRva2VuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgIXF1b3RpbmcpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocXVvdGluZykge1xyXG4gICAgICAgICAgICAgICAgLy8gUXVvdGluZyBtb2RlLCBhZGQgY2hhcmFjdGVyIHRvIHRva2VuLlxyXG4gICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc3R1bWJsZWQgdXBvbiBhIG5ldyB0b2tlbiFcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgYXJlIHJlcGVhdGluZyB0aGUgdG9rZW4gd2l0aCBtb3JlIGNoYXJhY3RlcnNcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG9uJ3QgZm9yZ2V0IHRvIGFkZCB0aGUgbGFzdCB0b2tlbiB0byB0aGUgcmVzdWx0IVxyXG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCBxdW90aW5nKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUb2tlbml6ZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVG9rZW5pemVyID0gVG9rZW5pemVyO1xyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbihmdW5jdGlvbiAoRGF0ZVRpbWVUb2tlblR5cGUpIHtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiSURFTlRJVFlcIl0gPSAwXSA9IFwiSURFTlRJVFlcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiRVJBXCJdID0gMV0gPSBcIkVSQVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJZRUFSXCJdID0gMl0gPSBcIllFQVJcIjtcclxuICAgIERhdGVUaW1lVG9rZW5UeXBlW0RhdGVUaW1lVG9rZW5UeXBlW1wiUVVBUlRFUlwiXSA9IDNdID0gXCJRVUFSVEVSXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIk1PTlRIXCJdID0gNF0gPSBcIk1PTlRIXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIldFRUtcIl0gPSA1XSA9IFwiV0VFS1wiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJEQVlcIl0gPSA2XSA9IFwiREFZXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIldFRUtEQVlcIl0gPSA3XSA9IFwiV0VFS0RBWVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJEQVlQRVJJT0RcIl0gPSA4XSA9IFwiREFZUEVSSU9EXCI7XHJcbiAgICBEYXRlVGltZVRva2VuVHlwZVtEYXRlVGltZVRva2VuVHlwZVtcIkhPVVJcIl0gPSA5XSA9IFwiSE9VUlwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJNSU5VVEVcIl0gPSAxMF0gPSBcIk1JTlVURVwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJTRUNPTkRcIl0gPSAxMV0gPSBcIlNFQ09ORFwiO1xyXG4gICAgRGF0ZVRpbWVUb2tlblR5cGVbRGF0ZVRpbWVUb2tlblR5cGVbXCJaT05FXCJdID0gMTJdID0gXCJaT05FXCI7XHJcbn0pKGV4cG9ydHMuRGF0ZVRpbWVUb2tlblR5cGUgfHwgKGV4cG9ydHMuRGF0ZVRpbWVUb2tlblR5cGUgPSB7fSkpO1xyXG52YXIgRGF0ZVRpbWVUb2tlblR5cGUgPSBleHBvcnRzLkRhdGVUaW1lVG9rZW5UeXBlO1xyXG52YXIgc3ltYm9sTWFwcGluZyA9IHtcclxuICAgIFwiR1wiOiBEYXRlVGltZVRva2VuVHlwZS5FUkEsXHJcbiAgICBcInlcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwiWVwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJ1XCI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXHJcbiAgICBcIlVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuICAgIFwiclwiOiBEYXRlVGltZVRva2VuVHlwZS5ZRUFSLFxyXG4gICAgXCJRXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcbiAgICBcInFcIjogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcclxuICAgIFwiTVwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuICAgIFwiTFwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuICAgIFwibFwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuICAgIFwid1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLLFxyXG4gICAgXCJXXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXHJcbiAgICBcImRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG4gICAgXCJEXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuICAgIFwiRlwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcbiAgICBcImdcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG4gICAgXCJFXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcbiAgICBcImVcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuICAgIFwiY1wiOiBEYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG4gICAgXCJhXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuICAgIFwiaFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJIXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcImtcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwiS1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG4gICAgXCJqXCI6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXHJcbiAgICBcIkpcIjogRGF0ZVRpbWVUb2tlblR5cGUuSE9VUixcclxuICAgIFwibVwiOiBEYXRlVGltZVRva2VuVHlwZS5NSU5VVEUsXHJcbiAgICBcInNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG4gICAgXCJTXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuICAgIFwiQVwiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcbiAgICBcInpcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwiWlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJPXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcInZcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcclxuICAgIFwiVlwiOiBEYXRlVGltZVRva2VuVHlwZS5aT05FLFxyXG4gICAgXCJYXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcbiAgICBcInhcIjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORVxyXG59O1xyXG4vKipcclxuICogTWFwIHRoZSBnaXZlbiBzeW1ib2wgdG8gb25lIG9mIHRoZSBEYXRlVGltZVRva2VuVHlwZXNcclxuICogSWYgdGhlcmUgaXMgbm8gbWFwcGluZywgRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFkgaXMgdXNlZFxyXG4gKlxyXG4gKiBAcGFyYW0gc3ltYm9sIFRoZSBzaW5nbGUtY2hhcmFjdGVyIHN5bWJvbCB1c2VkIHRvIG1hcCB0aGUgdG9rZW5cclxuICogQHJldHVybiBEYXRlVGltZVRva2VuVHlwZSBUaGUgVHlwZSBvZiB0b2tlbiB0aGlzIHN5bWJvbCByZXByZXNlbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXBTeW1ib2xUb1R5cGUoc3ltYm9sKSB7XHJcbiAgICBpZiAoc3ltYm9sTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShzeW1ib2wpKSB7XHJcbiAgICAgICAgcmV0dXJuIHN5bWJvbE1hcHBpbmdbc3ltYm9sXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10b2tlbi5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG4oZnVuY3Rpb24gKFRvVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiWWVhclwiXSA9IDBdID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibWF4XCJcclxuICAgICAqL1xyXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcclxufSkoZXhwb3J0cy5Ub1R5cGUgfHwgKGV4cG9ydHMuVG9UeXBlID0ge30pKTtcclxudmFyIFRvVHlwZSA9IGV4cG9ydHMuVG9UeXBlO1xyXG4vKipcclxuICogVHlwZSBvZiBydWxlIE9OIGNvbHVtbiB2YWx1ZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChPblR5cGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiRGF5TnVtXCJdID0gMF0gPSBcIkRheU51bVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkxhc3RYXCJdID0gMV0gPSBcIkxhc3RYXCI7XHJcbiAgICAvKipcclxuICAgICAqIGUuZy4gXCJTdW4+PThcIlxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiR3JlcVhcIl0gPSAyXSA9IFwiR3JlcVhcIjtcclxuICAgIC8qKlxyXG4gICAgICogZS5nLiBcIlN1bjw9OFwiXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJMZXFYXCJdID0gM10gPSBcIkxlcVhcIjtcclxufSkoZXhwb3J0cy5PblR5cGUgfHwgKGV4cG9ydHMuT25UeXBlID0ge30pKTtcclxudmFyIE9uVHlwZSA9IGV4cG9ydHMuT25UeXBlO1xyXG4oZnVuY3Rpb24gKEF0VHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBMb2NhbCB0aW1lIChubyBEU1QpXHJcbiAgICAgKi9cclxuICAgIEF0VHlwZVtBdFR5cGVbXCJTdGFuZGFyZFwiXSA9IDBdID0gXCJTdGFuZGFyZFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXHJcbiAgICAgKi9cclxuICAgIEF0VHlwZVtBdFR5cGVbXCJXYWxsXCJdID0gMV0gPSBcIldhbGxcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXRjIHRpbWVcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlV0Y1wiXSA9IDJdID0gXCJVdGNcIjtcclxufSkoZXhwb3J0cy5BdFR5cGUgfHwgKGV4cG9ydHMuQXRUeXBlID0ge30pKTtcclxudmFyIEF0VHlwZSA9IGV4cG9ydHMuQXRUeXBlO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbnZhciBSdWxlSW5mbyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSdWxlSW5mbyhcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuICAgICAgICAgKiBOb3RlLCBjYW4gYmUgLTEwMDAwIGZvciBOYU4gdmFsdWUgKGUuZy4gZm9yIFwiU3lzdGVtVlwiIHJ1bGVzKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZyb20sIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvVHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSWYgVE8gY29sdW1uIGlzIGEgeWVhciwgdGhlIHllYXIgbnVtYmVyLiBJZiBUTyBjb2x1bW4gaXMgXCJvbmx5XCIsIHRoZSBGUk9NIHllYXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9ZZWFyLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW5Nb250aCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT04gY29sdW1uIHR5cGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblR5cGUsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25EYXksIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uV2Vla0RheSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIGhvdXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdEhvdXIsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFUIGNvbHVtbiBtaW51dGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBhdE1pbnV0ZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQVQgY29sdW1uIHNlY29uZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0U2Vjb25kLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBVCBjb2x1bW4gdHlwZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGF0VHlwZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2F2ZSwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG4gICAgICAgICAqIE5vdGUgaWYgVFogZGF0YWJhc2UgaW5kaWNhdGVzIFwiLVwiIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldHRlcikge1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50b1R5cGUgPSB0b1R5cGU7XHJcbiAgICAgICAgdGhpcy50b1llYXIgPSB0b1llYXI7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmluTW9udGggPSBpbk1vbnRoO1xyXG4gICAgICAgIHRoaXMub25UeXBlID0gb25UeXBlO1xyXG4gICAgICAgIHRoaXMub25EYXkgPSBvbkRheTtcclxuICAgICAgICB0aGlzLm9uV2Vla0RheSA9IG9uV2Vla0RheTtcclxuICAgICAgICB0aGlzLmF0SG91ciA9IGF0SG91cjtcclxuICAgICAgICB0aGlzLmF0TWludXRlID0gYXRNaW51dGU7XHJcbiAgICAgICAgdGhpcy5hdFNlY29uZCA9IGF0U2Vjb25kO1xyXG4gICAgICAgIHRoaXMuYXRUeXBlID0gYXRUeXBlO1xyXG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuc2F2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmFwcGxpY2FibGUgPSBmdW5jdGlvbiAoeWVhcikge1xyXG4gICAgICAgIGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnRvVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5NYXg6IHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5ZZWFyOiByZXR1cm4gKHllYXIgPD0gdGhpcy50b1llYXIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNvcnQgY29tcGFyaXNvblxyXG4gICAgICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgbGVzcyB0aGFuIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVMZXNzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmZyb20gPiBvdGhlci5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pIDwgb3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gTm90ZSB0aGF0IHRoZSB0aW1lXHJcbiAgICAgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcbiAgICAgKiBub3QgdGFrZW4gaW50byBhY2NvdW50XHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG4gICAgICAgIC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG4gICAgICAgIHZhciB0bSA9IHsgeWVhcjogeWVhciwgbW9udGg6IHRoaXMuaW5Nb250aCB9O1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkYXlcclxuICAgICAgICBzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0bS5kYXkgPSB0aGlzLm9uRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRpbWVcclxuICAgICAgICB0bS5ob3VyID0gdGhpcy5hdEhvdXI7XHJcbiAgICAgICAgdG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuICAgICAgICB0bS5zZWNvbmQgPSB0aGlzLmF0U2Vjb25kO1xyXG4gICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0bSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZm9yIHdoaWNoIHRvIHJldHVybiB0aGUgdHJhbnNpdGlvblxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1RcclxuICAgICAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcclxuICAgICAqL1xyXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLnRyYW5zaXRpb25UaW1lVXRjID0gZnVuY3Rpb24gKHllYXIsIHN0YW5kYXJkT2Zmc2V0LCBwcmV2UnVsZSkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgbm90IGFwcGxpY2FibGUgaW4gZ2l2ZW4geWVhclwiKTtcclxuICAgICAgICB2YXIgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS51bml4TWlsbGlzO1xyXG4gICAgICAgIC8vIGFkanVzdCBmb3IgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgICAgdmFyIG9mZnNldDtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuYXRUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLlV0YzpcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBdFR5cGUuU3RhbmRhcmQ6XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5XYWxsOlxyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZSdWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSdWxlSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5SdWxlSW5mbyA9IFJ1bGVJbmZvO1xyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbihmdW5jdGlvbiAoUnVsZVR5cGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogTm8gcnVsZSBhcHBsaWVzXHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBSdWxlVHlwZVtSdWxlVHlwZVtcIk9mZnNldFwiXSA9IDFdID0gXCJPZmZzZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiUnVsZU5hbWVcIl0gPSAyXSA9IFwiUnVsZU5hbWVcIjtcclxufSkoZXhwb3J0cy5SdWxlVHlwZSB8fCAoZXhwb3J0cy5SdWxlVHlwZSA9IHt9KSk7XHJcbnZhciBSdWxlVHlwZSA9IGV4cG9ydHMuUnVsZVR5cGU7XHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKiBGaXJzdCwgYW5kIHNvbWV3aGF0IHRyaXZpYWxseSwgd2hlcmVhcyBSdWxlcyBhcmUgY29uc2lkZXJlZCB0byBjb250YWluIG9uZSBvciBtb3JlIHJlY29yZHMsIGEgWm9uZSBpcyBjb25zaWRlcmVkIHRvXHJcbiAqIGJlIGEgc2luZ2xlIHJlY29yZCB3aXRoIHplcm8gb3IgbW9yZSBjb250aW51YXRpb24gbGluZXMuIFRodXMsIHRoZSBrZXl3b3JkLCDigJxab25lLOKAnSBhbmQgdGhlIHpvbmUgbmFtZSBhcmUgbm90IHJlcGVhdGVkLlxyXG4gKiBUaGUgbGFzdCBsaW5lIGlzIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4uXHJcbiAqIFNlY29uZCwgYW5kIG1vcmUgZnVuZGFtZW50YWxseSwgZWFjaCBsaW5lIG9mIGEgWm9uZSByZXByZXNlbnRzIGEgc3RlYWR5IHN0YXRlLCBub3QgYSB0cmFuc2l0aW9uIGJldHdlZW4gc3RhdGVzLlxyXG4gKiBUaGUgc3RhdGUgZXhpc3RzIGZyb20gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIHByZXZpb3VzIGxpbmXigJlzIFtVTlRJTF0gY29sdW1uIHVwIHRvIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBjdXJyZW50IGxpbmXigJlzXHJcbiAqIFtVTlRJTF0gY29sdW1uLiBJbiBvdGhlciB3b3JkcywgdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIFtVTlRJTF0gY29sdW1uIGlzIHRoZSBpbnN0YW50IHRoYXQgc2VwYXJhdGVzIHRoaXMgc3RhdGUgZnJvbSB0aGUgbmV4dC5cclxuICogV2hlcmUgdGhhdCB3b3VsZCBiZSBhbWJpZ3VvdXMgYmVjYXVzZSB3ZeKAmXJlIHNldHRpbmcgb3VyIGNsb2NrcyBiYWNrLCB0aGUgW1VOVElMXSBjb2x1bW4gc3BlY2lmaWVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBpbnN0YW50LlxyXG4gKiBUaGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSBsYXN0IGxpbmUsIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4sIGNvbnRpbnVlcyB0byB0aGUgcHJlc2VudC5cclxuICogVGhlIGZpcnN0IGxpbmUgdHlwaWNhbGx5IHNwZWNpZmllcyB0aGUgbWVhbiBzb2xhciB0aW1lIG9ic2VydmVkIGJlZm9yZSB0aGUgaW50cm9kdWN0aW9uIG9mIHN0YW5kYXJkIHRpbWUuIFNpbmNlIHRoZXJl4oCZcyBubyBsaW5lIGJlZm9yZVxyXG4gKiB0aGF0LCBpdCBoYXMgbm8gYmVnaW5uaW5nLiA4LSkgRm9yIHNvbWUgcGxhY2VzIG5lYXIgdGhlIEludGVybmF0aW9uYWwgRGF0ZSBMaW5lLCB0aGUgZmlyc3QgdHdvIGxpbmVzIHdpbGwgc2hvdyBzb2xhciB0aW1lcyBkaWZmZXJpbmcgYnlcclxuICogMjQgaG91cnM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBtb3ZlbWVudCBvZiB0aGUgRGF0ZSBMaW5lLiBGb3IgZXhhbXBsZTpcclxuICogIyBab25lXHROQU1FXHRcdEdNVE9GRlx0UlVMRVNcdEZPUk1BVFx0W1VOVElMXVxyXG4gKiBab25lIEFtZXJpY2EvSnVuZWF1XHQgMTU6MDI6MTkgLVx0TE1UXHQxODY3IE9jdCAxOFxyXG4gKiBcdFx0XHQgLTg6NTc6NDEgLVx0TE1UXHQuLi5cclxuICogV2hlbiBBbGFza2Egd2FzIHB1cmNoYXNlZCBmcm9tIFJ1c3NpYSBpbiAxODY3LCB0aGUgRGF0ZSBMaW5lIG1vdmVkIGZyb20gdGhlIEFsYXNrYS9DYW5hZGEgYm9yZGVyIHRvIHRoZSBCZXJpbmcgU3RyYWl0OyBhbmQgdGhlIHRpbWUgaW5cclxuICogQWxhc2thIHdhcyB0aGVuIDI0IGhvdXJzIGVhcmxpZXIgdGhhbiBpdCBoYWQgYmVlbi4gPGFzaWRlPig2IE9jdG9iZXIgaW4gdGhlIEp1bGlhbiBjYWxlbmRhciwgd2hpY2ggUnVzc2lhIHdhcyBzdGlsbCB1c2luZyB0aGVuIGZvclxyXG4gKiByZWxpZ2lvdXMgcmVhc29ucywgd2FzIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIGluc3RhbmNlIG9mIHRoZSBzYW1lIGRheSB3aXRoIGEgZGlmZmVyZW50IG5hbWUsIDE4IE9jdG9iZXIgaW4gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cclxuICogSXNu4oCZdCBjaXZpbCB0aW1lIHdvbmRlcmZ1bD8gOC0pKTwvYXNpZGU+XHJcbiAqIFRoZSBhYmJyZXZpYXRpb24sIOKAnExNVCzigJ0gc3RhbmRzIGZvciDigJxsb2NhbCBtZWFuIHRpbWUs4oCdIHdoaWNoIGlzIGFuIGludmVudGlvbiBvZiB0aGUgdHogZGF0YWJhc2UgYW5kIHdhcyBwcm9iYWJseSBuZXZlciBhY3R1YWxseVxyXG4gKiB1c2VkIGR1cmluZyB0aGUgcGVyaW9kLiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlIGlzIGFsbW9zdCBjZXJ0YWlubHkgd3JvbmcgZXhjZXB0IGluIHRoZSBhcmNoZXR5cGFsIHBsYWNlIGFmdGVyIHdoaWNoIHRoZSB6b25lIGlzIG5hbWVkLlxyXG4gKiAoVGhlIHR6IGRhdGFiYXNlIHVzdWFsbHkgZG9lc27igJl0IHByb3ZpZGUgYSBzZXBhcmF0ZSBab25lIHJlY29yZCBmb3IgcGxhY2VzIHdoZXJlIG5vdGhpbmcgc2lnbmlmaWNhbnQgaGFwcGVuZWQgYWZ0ZXIgMTk3MC4pXHJcbiAqL1xyXG52YXIgWm9uZUluZm8gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gWm9uZUluZm8oXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xyXG4gICAgICAgICAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG4gICAgICAgICAqIGl0IGlzIG9uZSBob3VyIGFoZWFkIG9mIFVUQ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdtdG9mZiwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG4gICAgICAgICAqIEEgaHlwaGVuLCBhIGtpbmQgb2YgbnVsbCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBoYXZlIG5vdCBzZXQgb3VyIGNsb2NrcyBhaGVhZCBvZiBzdGFuZGFyZCB0aW1lLlxyXG4gICAgICAgICAqIEFuIGFtb3VudCBvZiB0aW1lICh1c3VhbGx5IGJ1dCBub3QgbmVjZXNzYXJpbHkg4oCcMTowMOKAnSBtZWFuaW5nIG9uZSBob3VyKSBtZWFucyB0aGF0IHdlIGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQgYnkgdGhhdCBhbW91bnQuXHJcbiAgICAgICAgICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcbiAgICAgICAgICogdGhlIG5hbWUgb2Ygd2hpY2ggaXMgdGhlIGdpdmVuIGFscGhhYmV0aWMgc3RyaW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVUeXBlLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBydWxlT2Zmc2V0LCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJ1bGVOYW1lLCBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG4gICAgICAgICAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxyXG4gICAgICAgICAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAgICAgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcbiAgICAgICAgICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXHJcbiAgICAgICAgICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvcm1hdCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG4gICAgICAgICAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXHJcbiAgICAgICAgICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSBOVUxMIChmb3IgdGhlIGZpcnN0IHJ1bGUpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdW50aWwpIHtcclxuICAgICAgICB0aGlzLmdtdG9mZiA9IGdtdG9mZjtcclxuICAgICAgICB0aGlzLnJ1bGVUeXBlID0gcnVsZVR5cGU7XHJcbiAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gcnVsZU9mZnNldDtcclxuICAgICAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XHJcbiAgICAgICAgdGhpcy51bnRpbCA9IHVudGlsO1xyXG4gICAgICAgIGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBab25lSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5ab25lSW5mbyA9IFpvbmVJbmZvO1xyXG52YXIgVHpNb250aE5hbWVzO1xyXG4oZnVuY3Rpb24gKFR6TW9udGhOYW1lcykge1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkphblwiXSA9IDFdID0gXCJKYW5cIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJGZWJcIl0gPSAyXSA9IFwiRmViXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTWFyXCJdID0gM10gPSBcIk1hclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkFwclwiXSA9IDRdID0gXCJBcHJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXlcIl0gPSA1XSA9IFwiTWF5XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVuXCJdID0gNl0gPSBcIkp1blwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1bFwiXSA9IDddID0gXCJKdWxcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJBdWdcIl0gPSA4XSA9IFwiQXVnXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiU2VwXCJdID0gOV0gPSBcIlNlcFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk9jdFwiXSA9IDEwXSA9IFwiT2N0XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTm92XCJdID0gMTFdID0gXCJOb3ZcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJEZWNcIl0gPSAxMl0gPSBcIkRlY1wiO1xyXG59KShUek1vbnRoTmFtZXMgfHwgKFR6TW9udGhOYW1lcyA9IHt9KSk7XHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWUpIHtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyArK2kpIHtcclxuICAgICAgICBpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCJcIik7XHJcbiAgICB9XHJcbn1cclxudmFyIFR6RGF5TmFtZXM7XHJcbihmdW5jdGlvbiAoVHpEYXlOYW1lcykge1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU3VuXCJdID0gMF0gPSBcIlN1blwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiTW9uXCJdID0gMV0gPSBcIk1vblwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVHVlXCJdID0gMl0gPSBcIlR1ZVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiV2VkXCJdID0gM10gPSBcIldlZFwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVGh1XCJdID0gNF0gPSBcIlRodVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiRnJpXCJdID0gNV0gPSBcIkZyaVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU2F0XCJdID0gNl0gPSBcIlNhdFwiO1xyXG59KShUekRheU5hbWVzIHx8IChUekRheU5hbWVzID0ge30pKTtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXHJcbiAqIDEsIC0xLCArMSwgMDEsIDE6MDAsIDE6MjM6MjUuMTQzXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHMpIHtcclxuICAgIHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5leHBvcnRzLmlzVmFsaWRPZmZzZXRTdHJpbmcgPSBpc1ZhbGlkT2Zmc2V0U3RyaW5nO1xyXG4vKipcclxuICogRGVmaW5lcyBhIG1vbWVudCBhdCB3aGljaCB0aGUgZ2l2ZW4gcnVsZSBiZWNvbWVzIHZhbGlkXHJcbiAqL1xyXG52YXIgVHJhbnNpdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUcmFuc2l0aW9uKFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyYW5zaXRpb24gdGltZSBpbiBVVEMgbWlsbGlzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXQsIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9mZnNldCwgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldHRlcikge1xyXG4gICAgICAgIHRoaXMuYXQgPSBhdDtcclxuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5vZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVHJhbnNpdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5UcmFuc2l0aW9uID0gVHJhbnNpdGlvbjtcclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG4oZnVuY3Rpb24gKE5vcm1hbGl6ZU9wdGlvbikge1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiVXBcIl0gPSAwXSA9IFwiVXBcIjtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XHJcbn0pKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uIHx8IChleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IHt9KSk7XHJcbnZhciBOb3JtYWxpemVPcHRpb24gPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbjtcclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbnZhciBUekRhdGFiYXNlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVHpEYXRhYmFzZShkYXRhKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZSA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlID0ge307XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghVHpEYXRhYmFzZS5faW5zdGFuY2UsIFwiWW91IHNob3VsZCBub3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBUekRhdGFiYXNlIGNsYXNzIHlvdXJzZWxmLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS5sZW5ndGggPiAwLCBcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCIpO1xyXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gZGF0YVswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB7IHpvbmVzOiB7fSwgcnVsZXM6IHt9IH07XHJcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5rZXlzKGQucnVsZXMpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gT2JqZWN0LmtleXMoZC56b25lcyk7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfY1tfYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnpvbmVzW2tleV0gPSBkLnpvbmVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWlubWF4ID0gdmFsaWRhdGVEYXRhKHRoaXMuX2RhdGEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRhIFRaIGRhdGEgYXMgSlNPTiBvYmplY3QgKGZyb20gb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMpLlxyXG4gICAgICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5pbml0ID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShbZGF0YV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuaW5zdGFuY2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgdGhpcyBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGFfMSA9IFtdO1xyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGluIGdsb2JhbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgdmFyIGcgPSAoZ2xvYmFsID8gZ2xvYmFsIDogd2luZG93KTtcclxuICAgICAgICAgICAgaWYgKGcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhnKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihcInR6ZGF0YVwiKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGdba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBnW2tleV0ucnVsZXMgJiYgZ1trZXldLnpvbmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhXzEucHVzaChnW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgYXMgaW5zdGFsbGVkIE5QTSBtb2R1bGVzXHJcbiAgICAgICAgICAgIGlmIChkYXRhXzEubGVuZ3RoID09PSAwICYmIHJlcXVpcmUgJiYgcmVxdWlyZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCB0cnkgdHpkYXRhIHdoaWNoIGNvbnRhaW5zIGFsbCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gcmVxdWlyZSh0ekRhdGFOYW1lKTsgLy8gdXNlIHZhcmlhYmxlIHRvIGF2b2lkIGJyb3dzZXJpZnkgYWN0aW5nIHVwXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gdHJ5IHN1YnNldHNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kdWxlTmFtZXMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWFmcmljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hbnRhcmN0aWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWFzaWFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYXVzdHJhbGFzaWFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYmFja3dhcmRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYmFja3dhcmQtdXRjXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWV0Y2V0ZXJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWV1cm9wZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ub3J0aGFtZXJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtcGFjaWZpY25ld1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1zb3V0aGFtZXJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc3lzdGVtdlwiXHJcbiAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZXhpc3RpbmdQYXRocyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG1vZHVsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGFfMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS56b25lTmFtZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl96b25lTmFtZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVOYW1lcy5zb3J0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl96b25lTmFtZXM7XHJcbiAgICB9O1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZXhpc3RzID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcbiAgICAgKlxyXG4gICAgICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm1pbkRzdFNhdmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICBpZiAoem9uZU5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBydWxlTmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnNhdmUubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1heGltdW0gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAgICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG4gICAgICpcclxuICAgICAqIFJldHVybnMgMCBpZiB6b25lTmFtZSBnaXZlbiBhbmQgbm8gRFNUIG9ic2VydmVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWF4RHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmhhc0RzdCA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XHJcbiAgICB9O1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubmV4dERzdENoYW5nZSA9IGZ1bmN0aW9uICh6b25lTmFtZSwgYSkge1xyXG4gICAgICAgIHZhciB6b25lSW5mbztcclxuICAgICAgICB2YXIgdXRjVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgLy8gZ2V0IGFsbCB6b25lIGluZm9zIGZvciBbZGF0ZSwgZGF0ZSsxeWVhcilcclxuICAgICAgICB2YXIgYWxsWm9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIHZhciByZWxldmFudFpvbmVJbmZvcyA9IFtdO1xyXG4gICAgICAgIHZhciByYW5nZVN0YXJ0ID0gdXRjVGltZS51bml4TWlsbGlzO1xyXG4gICAgICAgIHZhciByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xyXG4gICAgICAgIHZhciBwcmV2RW5kID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB6b25lSW5mbyA9IGFsbFpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKChwcmV2RW5kID09PSBudWxsIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gcmFuZ2VTdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29sbGVjdCBhbGwgdHJhbnNpdGlvbnMgaW4gdGhlIHpvbmVzIGZvciB0aGUgeWVhclxyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVsZXZhbnRab25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgem9uZUluZm8gPSByZWxldmFudFpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgLy8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG4gICAgICAgICAgICB0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdCh0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmFuc2l0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBmaW5kIHRoZSBmaXJzdCBhZnRlciB0aGUgZ2l2ZW4gZGF0ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBvZmZzZXRcclxuICAgICAgICB2YXIgcHJldlNhdmUgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKCFwcmV2U2F2ZSB8fCAhcHJldlNhdmUuZXF1YWxzKHRyYW5zaXRpb24ub2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNpdGlvbi5hdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBldmVudHVhbGx5IGxpbmtzIHRvXHJcbiAgICAgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuICAgICAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVJc1V0YyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5ub3JtYWxpemVMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgYSwgb3B0KSB7XHJcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IE5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2FsVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgICAgIC8vIGxvY2FsIHRpbWVzIGJlaGF2ZSBsaWtlIHRoaXMgZHVyaW5nIERTVCBjaGFuZ2VzOlxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xyXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG4gICAgICAgICAgICAvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuICAgICAgICAgICAgLy8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgKyAxKTtcclxuICAgICAgICAgICAgLy8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcclxuICAgICAgICAgICAgdmFyIHByZXYgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQmVmb3JlID0gdHJhbnNpdGlvbi5hdCArIHByZXYubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQWZ0ZXIgPSB0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9uLWV4aXN0aW5nIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gYSA6IGEuY2xvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuICAgICAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcclxuICAgICAgICB2YXIgem9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcbiAgICAgICAgdmFyIGRzdE9mZnNldCA9IG51bGw7XHJcbiAgICAgICAgc3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xyXG4gICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gdGhpcy5kc3RPZmZzZXRGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkc3RPZmZzZXQuYWRkKHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIHJ1bGUgYWJicmV2aWF0aW9uLCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXHJcbiAgICAgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG4gICAgICogYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgYWJicmV2aWF0aW9ucy4gVGhleSBhbHNvIGNoYW5nZSB3aXRoIERTVDogZS5nLiBDRVNUIG9yIENFVC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQyB1bml4IG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG4gICAgICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5hYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQgPT09IHZvaWQgMCkgeyBkc3REZXBlbmRlbnQgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcbiAgICAgICAgdmFyIGZvcm1hdCA9IHpvbmVJbmZvLmZvcm1hdDtcclxuICAgICAgICAvLyBpcyBmb3JtYXQgZGVwZW5kZW50IG9uIERTVD9cclxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoXCIlc1wiKSAhPT0gLTFcclxuICAgICAgICAgICAgJiYgem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBsZXR0ZXIgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuICAgICAgICAgICAgaWYgKGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdGhpcy5sZXR0ZXJGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm9ybWF0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAsIGFnYWluIGV4Y2x1ZGluZyBEU1QuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxyXG4gICAgICogdGhlbiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBpcyByZXR1cm5lZC5cclxuICAgICAqXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xyXG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG4gICAgICAgICAgICBpZiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG4gICAgICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxyXG4gICAgICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS50b3RhbE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkVG0gPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XHJcbiAgICAgICAgLy8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XHJcbiAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcclxuICAgICAgICAvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXHJcbiAgICAgICAgLy8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWUsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgLSAxLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyICsgMSk7XHJcbiAgICAgICAgdmFyIHByZXYgPSBudWxsO1xyXG4gICAgICAgIHZhciBwcmV2UHJldiA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZvdW5kIG9mZnNldDogcHJldi5vZmZzZXQgYXBwbGllc1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldlByZXYgPSBwcmV2O1xyXG4gICAgICAgICAgICBwcmV2ID0gdHJhbnNpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuICAgICAgICBpZiAocHJldikge1xyXG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcclxuICAgICAgICAgICAgaWYgKHByZXZQcmV2ICYmIHByZXZQcmV2Lm9mZnNldC5ncmVhdGVyVGhhbihwcmV2Lm9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBwcmV2UHJldi5vZmZzZXQuc3ViKHByZXYub2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKClcclxuICAgICAgICAgICAgICAgICAgICAmJiBub3JtYWxpemVkVG0udW5peE1pbGxpcyA8IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKSArIGRpZmYubWlsbGlzZWNvbmRzKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGhpcyBjYW5ub3QgaGFwcGVuIGFzIHRoZSB0cmFuc2l0aW9ucyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYSB0cmFuc2l0aW9uIGF0IHRoZVxyXG4gICAgICAgICAgICAvLyBiZWdpbm5pbmcgb2YgdGhlIHJlcXVlc3RlZCBmcm9tWWVhclxyXG4gICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBEU1Qgb2Zmc2V0IChXSVRIT1VUIHRoZSBzdGFuZGFyZCB6b25lIG9mZnNldCkgZm9yIHRoZSBnaXZlblxyXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmRzdE9mZnNldEZvclJ1bGUgPSBmdW5jdGlvbiAocnVsZU5hbWUsIHV0Y1RpbWUsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIHRzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lKTtcclxuICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG4gICAgICAgIHZhciBvZmZzZXQgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCFvZmZzZXQpIHtcclxuICAgICAgICAgICAgLy8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcbiAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRpbWUgem9uZSBsZXR0ZXIgZm9yIHRoZSBnaXZlblxyXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXAgYXMgVGltZVN0cnVjdCBvciB1bml4IG1pbGxpc1xyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubGV0dGVyRm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIGxldHRlciA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgaWYgKCFsZXR0ZXIpIHtcclxuICAgICAgICAgICAgLy8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcbiAgICAgICAgICAgIGxldHRlciA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsZXR0ZXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBsaXN0IG9mIGFsbCB0cmFuc2l0aW9ucyBpbiBbZnJvbVllYXIuLnRvWWVhcl0gc29ydGVkIGJ5IGVmZmVjdGl2ZSBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHRoZSBydWxlIHNldFxyXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyLCBzdGFuZGFyZE9mZnNldCkge1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG4gICAgICAgIHZhciBydWxlSW5mb3MgPSB0aGlzLmdldFJ1bGVJbmZvcyhydWxlTmFtZSk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIHkgPSBmcm9tWWVhcjsgeSA8PSB0b1llYXI7IHkrKykge1xyXG4gICAgICAgICAgICB2YXIgcHJldkluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gcnVsZUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihydWxlSW5mby50cmFuc2l0aW9uVGltZVV0Yyh5LCBzdGFuZGFyZE9mZnNldCwgcHJldkluZm8pLCBydWxlSW5mby5zYXZlLCBydWxlSW5mby5sZXR0ZXIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZXZJbmZvID0gcnVsZUluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cclxuICAgICAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vIHpvbmUgY2hhbmdlIHdpdGhpbiB0aGUgcmFuZ2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcbiAgICAgICAgdmFyIHN0YXJ0TWlsbGlzID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogZnJvbVllYXIgfSk7XHJcbiAgICAgICAgdmFyIGVuZE1pbGxpcyA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IHRvWWVhciArIDEgfSk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcHJldlpvbmUgPSBudWxsO1xyXG4gICAgICAgIHZhciBwcmV2VW50aWxZZWFyO1xyXG4gICAgICAgIHZhciBwcmV2U3RkT2Zmc2V0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICB2YXIgcHJldkRzdE9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgdmFyIHByZXZMZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuICAgICAgICAgICAgdmFyIHVudGlsWWVhciA9IHpvbmVJbmZvLnVudGlsID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoem9uZUluZm8udW50aWwpLmNvbXBvbmVudHMueWVhciA6IHRvWWVhciArIDE7XHJcbiAgICAgICAgICAgIHZhciBzdGRPZmZzZXQgPSBwcmV2U3RkT2Zmc2V0O1xyXG4gICAgICAgICAgICB2YXIgZHN0T2Zmc2V0ID0gcHJldkRzdE9mZnNldDtcclxuICAgICAgICAgICAgdmFyIGxldHRlciA9IHByZXZMZXR0ZXI7XHJcbiAgICAgICAgICAgIC8vIHpvbmUgYXBwbGljYWJsZT9cclxuICAgICAgICAgICAgaWYgKChwcmV2Wm9uZSA9PT0gbnVsbCB8fCBwcmV2Wm9uZS51bnRpbCA8IGVuZE1pbGxpcyAtIDEpXHJcbiAgICAgICAgICAgICAgICAmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5Ob25lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZS5nLiBMeWJpYSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm9zID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBydWxlSW5mb3MubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBydWxlSW5mb3Nbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUocHJldlVudGlsWWVhcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgbnVsbCkgPT09IHByZXZab25lLnVudGlsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIGF0ID0gKHByZXZab25lID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihhdCwgc3RkT2Zmc2V0LmFkZChkc3RPZmZzZXQpLCBsZXR0ZXIpKTtcclxuICAgICAgICAgICAgICAgIC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRzdFRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHByZXZVbnRpbFllYXIgIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByZXZVbnRpbFllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLCBNYXRoLm1pbih1bnRpbFllYXIsIHRvWWVhciksIHN0ZE9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBkc3RUcmFuc2l0aW9ucy5sZW5ndGg7ICsraykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IGRzdFRyYW5zaXRpb25zW2tdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHRyYW5zaXRpb24uYXQsIHRyYW5zaXRpb24ub2Zmc2V0LmFkZChzdGRPZmZzZXQpLCB0cmFuc2l0aW9uLmxldHRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldlpvbmUgPSB6b25lSW5mbztcclxuICAgICAgICAgICAgcHJldlVudGlsWWVhciA9IHVudGlsWWVhcjtcclxuICAgICAgICAgICAgcHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuICAgICAgICAgICAgcHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuICAgICAgICAgICAgcHJldkxldHRlciA9IGxldHRlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHpvbmUgaW5mbyBmb3IgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuIFRocm93cyBpZiBub3QgZm91bmQuXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZSBzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kcyBvciBhcyBhIFRpbWVTdHJ1Y3RcclxuICAgICAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mbyA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXHJcbiAgICAgKiBmb2xsb3dpbmcgYW55IGxpbmtzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxyXG4gICAgICogQHJldHVybiBBcnJheSBvZiB6b25lIGluZm9zLiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mb3MgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICAvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVGFrZSBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmaW5hbCB6b25lIGluZm8gZm91bmRcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVFbnRyaWVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lRW50cnkgPSB6b25lRW50cmllc1tpXTtcclxuICAgICAgICAgICAgdmFyIHJ1bGVUeXBlID0gdGhpcy5wYXJzZVJ1bGVUeXBlKHpvbmVFbnRyeVsxXSk7XHJcbiAgICAgICAgICAgIHZhciB1bnRpbCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHVudGlsKSkge1xyXG4gICAgICAgICAgICAgICAgdW50aWwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLCBydWxlVHlwZSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbigpLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLCB6b25lRW50cnlbMl0sIHVudGlsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIC8vIHNvcnQgbnVsbCBsYXN0XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCAhPT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChhLnVudGlsIC0gYi51bnRpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuICAgICAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG4gICAgICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0UnVsZUluZm9zID0gZnVuY3Rpb24gKHJ1bGVOYW1lKSB7XHJcbiAgICAgICAgLy8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gZnJvbSBjYWNoZVxyXG4gICAgICAgIGlmICh0aGlzLl9ydWxlSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZVNldC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVTZXRbaV07XHJcbiAgICAgICAgICAgIHZhciBmcm9tWWVhciA9IChydWxlWzBdID09PSBcIk5hTlwiID8gLTEwMDAwIDogcGFyc2VJbnQocnVsZVswXSwgMTApKTtcclxuICAgICAgICAgICAgdmFyIHRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XHJcbiAgICAgICAgICAgIHZhciB0b1llYXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcbiAgICAgICAgICAgIHZhciBvblR5cGUgPSB0aGlzLnBhcnNlT25UeXBlKHJ1bGVbNF0pO1xyXG4gICAgICAgICAgICB2YXIgb25EYXkgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcclxuICAgICAgICAgICAgdmFyIG9uV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XHJcbiAgICAgICAgICAgIHZhciBtb250aE5hbWUgPSBydWxlWzNdO1xyXG4gICAgICAgICAgICB2YXIgbW9udGhOdW1iZXIgPSBtb250aE5hbWVUb1N0cmluZyhtb250aE5hbWUpO1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgUnVsZUluZm8oZnJvbVllYXIsIHRvVHlwZSwgdG9ZZWFyLCBydWxlWzJdLCBtb250aE51bWJlciwgb25UeXBlLCBvbkRheSwgb25XZWVrRGF5LCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuICAgICAgICAgICAgbWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzFdLCAxMCksIDYwKSwgbWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzJdLCAxMCksIDYwKSwgdGhpcy5wYXJzZUF0VHlwZShydWxlWzVdWzNdKSwgZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksIHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN10pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBSVUxFUyBjb2x1bW4gb2YgYSB6b25lIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVJ1bGVUeXBlID0gZnVuY3Rpb24gKHJ1bGUpIHtcclxuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VUb1R5cGUgPSBmdW5jdGlvbiAodG8pIHtcclxuICAgICAgICBpZiAodG8gPT09IFwibWF4XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5NYXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gVG9UeXBlLlllYXI7IC8vIHllcyB3ZSByZXR1cm4gWWVhciBmb3Igb25seVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUTyBjb2x1bW4gaW5jb3JyZWN0OiBcIiArIHRvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uVHlwZSA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MYXN0WDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkdyZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gT25UeXBlLkRheU51bTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uRGF5ID0gZnVuY3Rpb24gKG9uLCBvblR5cGUpIHtcclxuICAgICAgICBzd2l0Y2ggKG9uVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5MZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI8PVwiKSArIDIpLCAxMCk7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI+PVwiKSArIDIpLCAxMCk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25XZWVrRGF5ID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNpY3NfMS5XZWVrRGF5LlN1bmRheTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VBdFR5cGUgPSBmdW5jdGlvbiAoYXQpIHtcclxuICAgICAgICBzd2l0Y2ggKGF0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG51bGw7XHJcbiAgICByZXR1cm4gVHpEYXRhYmFzZTtcclxufSgpKTtcclxuZXhwb3J0cy5UekRhdGFiYXNlID0gVHpEYXRhYmFzZTtcclxuLyoqXHJcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGEpIHtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgbWluRHN0U2F2ZTogbnVsbCxcclxuICAgICAgICBtYXhEc3RTYXZlOiBudWxsLFxyXG4gICAgICAgIG1pbkdtdE9mZjogbnVsbCxcclxuICAgICAgICBtYXhHbXRPZmY6IG51bGxcclxuICAgIH07XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgIGlmICh0eXBlb2YgKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHJ1bGVzIHByb3BlcnR5XCIpO1xyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJ6b25lc1wiKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xyXG4gICAgfVxyXG4gICAgLy8gdmFsaWRhdGUgem9uZXNcclxuICAgIGZvciAodmFyIHpvbmVOYW1lIGluIGRhdGEuem9uZXMpIHtcclxuICAgICAgICBpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVBcnIgPSBkYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoem9uZUFycikgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgem9uZUFyciArIFwiXFxcIiBidXQgdGhhdCBkb2VzblxcJ3QgZXhpc3RcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh6b25lQXJyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gem9uZUFycltpXTtcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05hTihnbXRvZmYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsxXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgc2Vjb25kIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMl0gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHRoaXJkIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbM10gIT09IFwic3RyaW5nXCIgJiYgZW50cnlbM10gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nIG5vciBudWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzNdID09PSBcInN0cmluZ1wiICYmIGlzTmFOKG1hdGguZmlsdGVyRmxvYXQoZW50cnlbM10pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tYXhHbXRPZmYgPSBnbXRvZmY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluR210T2ZmID09PSBudWxsIHx8IGdtdG9mZiA8IHJlc3VsdC5taW5HbXRPZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1pbkdtdE9mZiA9IGdtdG9mZjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyB2YWxpZGF0ZSBydWxlc1xyXG4gICAgZm9yICh2YXIgcnVsZU5hbWUgaW4gZGF0YS5ydWxlcykge1xyXG4gICAgICAgIGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgcnVsZUFyciA9IGRhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5sZW5ndGggPCA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbMF0gIT09IFwiTmFOXCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVswXSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVsxXSBpcyBub3QgYSBudW1iZXIsIG9ubHkgb3IgbWF4XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIVR6TW9udGhOYW1lcy5oYXNPd25Qcm9wZXJ0eShydWxlWzNdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bM10gaXMgbm90IGEgbW9udGggbmFtZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNF0uc3Vic3RyKDAsIDQpICE9PSBcImxhc3RcIiAmJiBydWxlWzRdLmluZGV4T2YoXCI+PVwiKSA9PT0gLTFcclxuICAgICAgICAgICAgICAgICAgICAmJiBydWxlWzRdLmluZGV4T2YoXCI8PVwiKSA9PT0gLTEgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVs0XSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZSA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tYXhEc3RTYXZlID0gc2F2ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSBudWxsIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10ei1kYXRhYmFzZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIERhdGUgYW5kIFRpbWUgdXRpbGl0eSBmdW5jdGlvbnMgLSBtYWluIGluZGV4XHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gX19leHBvcnQobSkge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2Jhc2ljc1wiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vZHVyYXRpb25cIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9mb3JtYXRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9nbG9iYWxzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3BhcnNlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vcGVyaW9kXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vYmFzaWNzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vdHotZGF0YWJhc2VcIikpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXX0=
