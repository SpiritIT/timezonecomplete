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

},{"./assert":1,"./basics":2,"./duration":4,"./format":5,"./javascript":7,"./math":8,"./parse":9,"./timesource":12,"./timezone":14,"./tz-database":16}],4:[function(require,module,exports){
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

},{"./basics":2,"./strings":11,"./token":15}],6:[function(require,module,exports){
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

},{"./basics":2,"./timezone":14,"./token":15}],10:[function(require,module,exports){
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

},{"./assert":1,"./basics":2,"./datetime":3,"./duration":4,"./timezone":14}],11:[function(require,module,exports){
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
module.exports={"zones":{"Africa/Algiers":[["-12.2","-","LMT","-2486678340000"],["-9.35","-","PMT","-1855958400000"],["0","Algeria","WE%sT","-942012000000"],["-60","Algeria","CE%sT","-733276800000"],["0","-","WET","-439430400000"],["-60","-","CET","-212025600000"],["0","Algeria","WE%sT","246240000000"],["-60","Algeria","CE%sT","309744000000"],["0","Algeria","WE%sT","357523200000"],["-60","-","CET",null]],"Atlantic/Cape_Verde":[["94.06666666666668","-","LMT","-1956700800000"],["120","-","CVT","-862617600000"],["120","1:00","CVST","-764121600000"],["120","-","CVT","186112800000"],["60","-","CVT",null]],"Africa/Ndjamena":[["-60.2","-","LMT","-1798848000000"],["-60","-","WAT","308707200000"],["-60","1:00","WAST","321321600000"],["-60","-","WAT",null]],"Africa/Abidjan":[["16.133333333333333","-","LMT","-1798848000000"],["0","-","GMT",null]],"Africa/Bamako":"Africa/Abidjan","Africa/Banjul":"Africa/Abidjan","Africa/Conakry":"Africa/Abidjan","Africa/Dakar":"Africa/Abidjan","Africa/Freetown":"Africa/Abidjan","Africa/Lome":"Africa/Abidjan","Africa/Nouakchott":"Africa/Abidjan","Africa/Ouagadougou":"Africa/Abidjan","Africa/Sao_Tome":"Africa/Abidjan","Atlantic/St_Helena":"Africa/Abidjan","Africa/Cairo":[["-125.15","-","LMT","-2185401600000"],["-120","Egypt","EE%sT",null]],"Africa/Accra":[["0.8666666666666666","-","LMT","-1609545600000"],["0","Ghana","%s",null]],"Africa/Bissau":[["62.333333333333336","-","LMT","-1830384000000"],["60","-","WAT","189216000000"],["0","-","GMT",null]],"Africa/Nairobi":[["-147.26666666666665","-","LMT","-1309737600000"],["-180","-","EAT","-1230854400000"],["-150","-","BEAT","-915235200000"],["-165","-","BEAUT","-284083200000"],["-180","-","EAT",null]],"Africa/Addis_Ababa":"Africa/Nairobi","Africa/Asmara":"Africa/Nairobi","Africa/Dar_es_Salaam":"Africa/Nairobi","Africa/Djibouti":"Africa/Nairobi","Africa/Kampala":"Africa/Nairobi","Africa/Mogadishu":"Africa/Nairobi","Indian/Antananarivo":"Africa/Nairobi","Indian/Comoro":"Africa/Nairobi","Indian/Mayotte":"Africa/Nairobi","Africa/Monrovia":[["43.13333333333333","-","LMT","-2745532800000"],["43.13333333333333","-","MMT","-1604361600000"],["44.5","-","LRT","73526400000"],["0","-","GMT",null]],"Africa/Tripoli":[["-52.733333333333334","-","LMT","-1546387200000"],["-60","Libya","CE%sT","-315705600000"],["-120","-","EET","410140800000"],["-60","Libya","CE%sT","641779200000"],["-120","-","EET","844041600000"],["-60","Libya","CE%sT","875923200000"],["-120","-","EET","1352512800000"],["-60","Libya","CE%sT","1382666400000"],["-120","-","EET",null]],"Indian/Mauritius":[["-230","-","LMT","-1956700800000"],["-240","Mauritius","MU%sT",null]],"Africa/Casablanca":[["30.333333333333332","-","LMT","-1773014400000"],["0","Morocco","WE%sT","448243200000"],["-60","-","CET","536371200000"],["0","Morocco","WE%sT",null]],"Africa/El_Aaiun":[["52.8","-","LMT","-1136073600000"],["60","-","WAT","198288000000"],["0","Morocco","WE%sT",null]],"Africa/Maputo":[["-130.33333333333331","-","LMT","-2109283200000"],["-120","-","CAT",null]],"Africa/Blantyre":"Africa/Maputo","Africa/Bujumbura":"Africa/Maputo","Africa/Gaborone":"Africa/Maputo","Africa/Harare":"Africa/Maputo","Africa/Kigali":"Africa/Maputo","Africa/Lubumbashi":"Africa/Maputo","Africa/Lusaka":"Africa/Maputo","Africa/Windhoek":[["-68.4","-","LMT","-2458166400000"],["-90","-","SWAT","-2109283200000"],["-120","-","SAST","-860968800000"],["-120","1:00","SAST","-845244000000"],["-120","-","SAST","637977600000"],["-120","-","CAT","765331200000"],["-60","Namibia","WA%sT",null]],"Africa/Lagos":[["-13.6","-","LMT","-1588464000000"],["-60","-","WAT",null]],"Africa/Bangui":"Africa/Lagos","Africa/Brazzaville":"Africa/Lagos","Africa/Douala":"Africa/Lagos","Africa/Kinshasa":"Africa/Lagos","Africa/Libreville":"Africa/Lagos","Africa/Luanda":"Africa/Lagos","Africa/Malabo":"Africa/Lagos","Africa/Niamey":"Africa/Lagos","Africa/Porto-Novo":"Africa/Lagos","Indian/Reunion":[["-221.86666666666665","-","LMT","-1848873600000"],["-240","-","RET",null]],"Indian/Mahe":[["-221.8","-","LMT","-2006640000000"],["-240","-","SCT",null]],"Africa/Johannesburg":[["-112","-","LMT","-2458166400000"],["-90","-","SAST","-2109283200000"],["-120","SA","SAST",null]],"Africa/Maseru":"Africa/Johannesburg","Africa/Mbabane":"Africa/Johannesburg","Africa/Khartoum":[["-130.13333333333333","-","LMT","-1199318400000"],["-120","Sudan","CA%sT","947937600000"],["-180","-","EAT",null]],"Africa/Juba":"Africa/Khartoum","Africa/Tunis":[["-40.733333333333334","-","LMT","-2797200000000"],["-9.35","-","PMT","-1855958400000"],["-60","Tunisia","CE%sT",null]],"Antarctica/Casey":[["0","-","-00","-86400000"],["-480","-","+08","1255831200000"],["-660","-","+11","1267754400000"],["-480","-","+08","1319767200000"],["-660","-","+11","1329843600000"],["-480","-","+08",null]],"Antarctica/Davis":[["0","-","-00","-409190400000"],["-420","-","+07","-163036800000"],["0","-","-00","-28857600000"],["-420","-","+07","1255831200000"],["-300","-","+05","1268251200000"],["-420","-","+07","1319767200000"],["-300","-","+05","1329854400000"],["-420","-","+07",null]],"Antarctica/Mawson":[["0","-","-00","-501206400000"],["-360","-","+06","1255831200000"],["-300","-","+05",null]],"Indian/Kerguelen":[["0","-","-00","-599702400000"],["-300","-","+05",null]],"Antarctica/DumontDUrville":[["0","-","-00","-694396800000"],["-600","-","+10","-566956800000"],["0","-","-00","-415497600000"],["-600","-","+10",null]],"Antarctica/Syowa":[["0","-","-00","-407808000000"],["-180","-","+03",null]],"Antarctica/Troll":[["0","-","-00","1108166400000"],["0","Troll","%s",null]],"Antarctica/Vostok":[["0","-","-00","-380073600000"],["-360","-","+06",null]],"Antarctica/Rothera":[["0","-","-00","218246400000"],["180","-","-03",null]],"Asia/Kabul":[["-276.8","-","LMT","-2493072000000"],["-240","-","AFT","-757468800000"],["-270","-","AFT",null]],"Asia/Yerevan":[["-178","-","LMT","-1441152000000"],["-180","-","+03","-405129600000"],["-240","RussiaAsia","+04/+05","670384800000"],["-180","RussiaAsia","+03/+04","811908000000"],["-240","-","+04","883526400000"],["-240","RussiaAsia","+04/+05",null]],"Asia/Baku":[["-199.4","-","LMT","-1441152000000"],["-180","-","+03","-405129600000"],["-240","RussiaAsia","+04/+05","670384800000"],["-180","RussiaAsia","+03/+04","715312800000"],["-240","-","+04","851990400000"],["-240","EUAsia","+04/+05","883526400000"],["-240","Azer","+04/+05",null]],"Asia/Dhaka":[["-361.6666666666667","-","LMT","-2493072000000"],["-353.3333333333333","-","HMT","-891561600000"],["-390","-","BURT","-872035200000"],["-330","-","IST","-862617600000"],["-390","-","BURT","-576115200000"],["-360","-","DACT","38793600000"],["-360","-","BDT","1262217600000"],["-360","Dhaka","BD%sT",null]],"Asia/Thimphu":[["-358.6","-","LMT","-706320000000"],["-330","-","IST","560044800000"],["-360","-","BTT",null]],"Indian/Chagos":[["-289.6666666666667","-","LMT","-1956700800000"],["-300","-","IOT","851990400000"],["-360","-","IOT",null]],"Asia/Brunei":[["-459.6666666666667","-","LMT","-1383436800000"],["-450","-","BNT","-1136160000000"],["-480","-","BNT",null]],"Asia/Yangon":[["-384.6666666666667","-","LMT","-2808604800000"],["-384.6666666666667","-","RMT","-1546387200000"],["-390","-","BURT","-873244800000"],["-540","-","JST","-778377600000"],["-390","-","MMT",null]],"Asia/Shanghai":[["-485.7166666666667","-","LMT","-2146003200000"],["-480","Shang","C%sT","-631238400000"],["-480","PRC","C%sT",null]],"Asia/Urumqi":[["-350.3333333333333","-","LMT","-1293926400000"],["-360","-","XJT",null]],"Asia/Hong_Kong":[["-456.7","-","LMT","-2056665600000"],["-480","HK","HK%sT","-884217600000"],["-540","-","JST","-766713600000"],["-480","HK","HK%sT",null]],"Asia/Taipei":[["-486","-","LMT","-2335219200000"],["-480","-","JWST","-1017792000000"],["-540","-","JST","-766191600000"],["-480","Taiwan","C%sT",null]],"Asia/Macau":[["-454.3333333333333","-","LMT","-1830384000000"],["-480","Macau","MO%sT","945648000000"],["-480","PRC","C%sT",null]],"Asia/Nicosia":[["-133.46666666666667","-","LMT","-1518912000000"],["-120","Cyprus","EE%sT","904608000000"],["-120","EUAsia","EE%sT",null]],"Europe/Nicosia":"Asia/Nicosia","Asia/Tbilisi":[["-179.18333333333334","-","LMT","-2808604800000"],["-179.18333333333334","-","TBMT","-1441152000000"],["-180","-","+03","-405129600000"],["-240","RussiaAsia","+04/+05","670384800000"],["-180","RussiaAsia","+03/+04","725760000000"],["-180","E-EurAsia","+03/+04","778377600000"],["-240","E-EurAsia","+04/+05","844128000000"],["-240","1:00","+05","857174400000"],["-240","E-EurAsia","+04/+05","1088294400000"],["-180","RussiaAsia","+03/+04","1109642400000"],["-240","-","+04",null]],"Asia/Dili":[["-502.3333333333333","-","LMT","-1830384000000"],["-480","-","TLT","-879123600000"],["-540","-","JST","-766022400000"],["-540","-","TLT","199929600000"],["-480","-","WITA","969148800000"],["-540","-","TLT",null]],"Asia/Kolkata":[["-353.4666666666667","-","LMT","-2808604800000"],["-353.3333333333333","-","HMT","-891561600000"],["-390","-","BURT","-872035200000"],["-330","-","IST","-862617600000"],["-330","1:00","IST","-764121600000"],["-330","-","IST",null]],"Asia/Jakarta":[["-427.2","-","LMT","-3231273600000"],["-427.2","-","BMT","-1451693568000"],["-440","-","JAVT","-1172880000000"],["-450","-","WIB","-876614400000"],["-540","-","JST","-766022400000"],["-450","-","WIB","-683856000000"],["-480","-","WIB","-620784000000"],["-450","-","WIB","-157852800000"],["-420","-","WIB",null]],"Asia/Pontianak":[["-437.3333333333333","-","LMT","-1946160000000"],["-437.3333333333333","-","PMT","-1172880000000"],["-450","-","WIB","-881193600000"],["-540","-","JST","-766022400000"],["-450","-","WIB","-683856000000"],["-480","-","WIB","-620784000000"],["-450","-","WIB","-157852800000"],["-480","-","WITA","567993600000"],["-420","-","WIB",null]],"Asia/Makassar":[["-477.6","-","LMT","-1546387200000"],["-477.6","-","MMT","-1172880000000"],["-480","-","WITA","-880243200000"],["-540","-","JST","-766022400000"],["-480","-","WITA",null]],"Asia/Jayapura":[["-562.8","-","LMT","-1172880000000"],["-540","-","WIT","-799459200000"],["-570","-","ACST","-157852800000"],["-540","-","WIT",null]],"Asia/Tehran":[["-205.73333333333335","-","LMT","-1672617600000"],["-205.73333333333335","-","TMT","-725932800000"],["-210","-","IRST","247190400000"],["-240","Iran","IR%sT","315446400000"],["-210","Iran","IR%sT",null]],"Asia/Baghdad":[["-177.66666666666666","-","LMT","-2493072000000"],["-177.6","-","BMT","-1609545600000"],["-180","-","AST","389059200000"],["-180","Iraq","A%sT",null]],"Asia/Jerusalem":[["-140.9","-","LMT","-2808604800000"],["-140.66666666666666","-","JMT","-1609545600000"],["-120","Zion","I%sT",null]],"Asia/Tokyo":[["-558.9833333333333","-","LMT","-2587712400000"],["-540","-","JST","-2335219200000"],["-540","-","JCST","-1017792000000"],["-540","Japan","J%sT",null]],"Asia/Amman":[["-143.73333333333335","-","LMT","-1199318400000"],["-120","Jordan","EE%sT",null]],"Asia/Almaty":[["-307.8","-","LMT","-1441152000000"],["-300","-","+05","-1247529600000"],["-360","RussiaAsia","+06/+07","670384800000"],["-300","RussiaAsia","+05/+06","695786400000"],["-360","RussiaAsia","+06/+07","1099188000000"],["-360","-","+06",null]],"Asia/Qyzylorda":[["-261.8666666666667","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","-","+05","354931200000"],["-300","1:00","+06","370742400000"],["-360","-","+06","386467200000"],["-300","RussiaAsia","+05/+06","670384800000"],["-240","RussiaAsia","+04/+05","686109600000"],["-300","RussiaAsia","+05/+06","695786400000"],["-360","RussiaAsia","+06/+07","701834400000"],["-300","RussiaAsia","+05/+06","1099188000000"],["-360","-","+06",null]],"Asia/Aqtobe":[["-228.66666666666666","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","-","+05","354931200000"],["-300","1:00","+06","370742400000"],["-360","-","+06","386467200000"],["-300","RussiaAsia","+05/+06","670384800000"],["-240","RussiaAsia","+04/+05","695786400000"],["-300","RussiaAsia","+05/+06","1099188000000"],["-300","-","+05",null]],"Asia/Aqtau":[["-201.06666666666666","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","-","+05","-189475200000"],["-300","-","+05","370742400000"],["-360","-","+06","386467200000"],["-300","RussiaAsia","+05/+06","670384800000"],["-240","RussiaAsia","+04/+05","695786400000"],["-300","RussiaAsia","+05/+06","780458400000"],["-240","RussiaAsia","+04/+05","1099188000000"],["-300","-","+05",null]],"Asia/Oral":[["-205.4","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","-","+05","354931200000"],["-300","1:00","+06","370742400000"],["-360","-","+06","386467200000"],["-300","RussiaAsia","+05/+06","606880800000"],["-240","RussiaAsia","+04/+05","695786400000"],["-300","RussiaAsia","+05/+06","701834400000"],["-240","RussiaAsia","+04/+05","1099188000000"],["-300","-","+05",null]],"Asia/Bishkek":[["-298.4","-","LMT","-1441152000000"],["-300","-","+05","-1247529600000"],["-360","RussiaAsia","+06/+07","670384800000"],["-300","RussiaAsia","+05/+06","683604000000"],["-300","Kyrgyz","+05/+06","1123804800000"],["-360","-","+06",null]],"Asia/Seoul":[["-507.8666666666667","-","LMT","-1948752000000"],["-510","-","KST","-1830384000000"],["-540","-","JCST","-1017792000000"],["-540","-","JST","-767318400000"],["-540","-","KST","-498096000000"],["-510","ROK","K%sT","-264902400000"],["-540","ROK","K%sT",null]],"Asia/Pyongyang":[["-503","-","LMT","-1948752000000"],["-510","-","KST","-1830384000000"],["-540","-","JCST","-1017792000000"],["-540","-","JST","-768614400000"],["-540","-","KST","1439596800000"],["-510","-","KST",null]],"Asia/Beirut":[["-142","-","LMT","-2808604800000"],["-120","Lebanon","EE%sT",null]],"Asia/Kuala_Lumpur":[["-406.7666666666667","-","LMT","-2177452800000"],["-415.4166666666667","-","SMT","-2038176000000"],["-420","-","MALT","-1167609600000"],["-420","0:20","MALST","-1073001600000"],["-440","-","MALT","-894153600000"],["-450","-","MALT","-879638400000"],["-540","-","JST","-766972800000"],["-450","-","MALT","378691200000"],["-480","-","MYT",null]],"Asia/Kuching":[["-441.3333333333333","-","LMT","-1383436800000"],["-450","-","BORT","-1136160000000"],["-480","NBorneo","BOR%sT","-879638400000"],["-540","-","JST","-766972800000"],["-480","-","BORT","378691200000"],["-480","-","MYT",null]],"Indian/Maldives":[["-294","-","LMT","-2808604800000"],["-294","-","MMT","-284083200000"],["-300","-","MVT",null]],"Asia/Hovd":[["-366.6","-","LMT","-2032905600000"],["-360","-","HOVT","283910400000"],["-420","Mongol","HOV%sT",null]],"Asia/Ulaanbaatar":[["-427.5333333333333","-","LMT","-2032905600000"],["-420","-","ULAT","283910400000"],["-480","Mongol","ULA%sT",null]],"Asia/Choibalsan":[["-458","-","LMT","-2032905600000"],["-420","-","ULAT","283910400000"],["-480","-","ULAT","418003200000"],["-540","Mongol","CHO%sT","1206921600000"],["-480","Mongol","CHO%sT",null]],"Asia/Kathmandu":[["-341.2666666666667","-","LMT","-1546387200000"],["-330","-","IST","536371200000"],["-345","-","NPT",null]],"Asia/Karachi":[["-268.2","-","LMT","-1956700800000"],["-330","-","IST","-862617600000"],["-330","1:00","IST","-764121600000"],["-330","-","IST","-576115200000"],["-300","-","KART","38793600000"],["-300","Pakistan","PK%sT",null]],"Asia/Gaza":[["-137.86666666666665","-","LMT","-2185401600000"],["-120","Zion","EET","-682646400000"],["-120","EgyptAsia","EE%sT","-81302400000"],["-120","Zion","I%sT","851990400000"],["-120","Jordan","EE%sT","946598400000"],["-120","Palestine","EE%sT","1219968000000"],["-120","-","EET","1220227200000"],["-120","Palestine","EE%sT","1293753600000"],["-120","-","EET","1269648060000"],["-120","Palestine","EE%sT","1312156800000"],["-120","-","EET","1356912000000"],["-120","Palestine","EE%sT",null]],"Asia/Hebron":[["-140.38333333333335","-","LMT","-2185401600000"],["-120","Zion","EET","-682646400000"],["-120","EgyptAsia","EE%sT","-81302400000"],["-120","Zion","I%sT","851990400000"],["-120","Jordan","EE%sT","946598400000"],["-120","Palestine","EE%sT",null]],"Asia/Manila":[["956","-","LMT","-3944678400000"],["-484","-","LMT","-2229292800000"],["-480","Phil","PH%sT","-873244800000"],["-540","-","JST","-794188800000"],["-480","Phil","PH%sT",null]],"Asia/Qatar":[["-206.13333333333335","-","LMT","-1546387200000"],["-240","-","GST","76204800000"],["-180","-","AST",null]],"Asia/Bahrain":"Asia/Qatar","Asia/Riyadh":[["-186.86666666666665","-","LMT","-719625600000"],["-180","-","AST",null]],"Asia/Aden":"Asia/Riyadh","Asia/Kuwait":"Asia/Riyadh","Asia/Singapore":[["-415.4166666666667","-","LMT","-2177452800000"],["-415.4166666666667","-","SMT","-2038176000000"],["-420","-","MALT","-1167609600000"],["-420","0:20","MALST","-1073001600000"],["-440","-","MALT","-894153600000"],["-450","-","MALT","-879638400000"],["-540","-","JST","-766972800000"],["-450","-","MALT","-138758400000"],["-450","-","SGT","378691200000"],["-480","-","SGT",null]],"Asia/Colombo":[["-319.4","-","LMT","-2808604800000"],["-319.5333333333333","-","MMT","-1988236800000"],["-330","-","IST","-883267200000"],["-330","0:30","IHST","-862617600000"],["-330","1:00","IST","-764028000000"],["-330","-","IST","832982400000"],["-390","-","LKT","846289800000"],["-360","-","LKT","1145061000000"],["-330","-","IST",null]],"Asia/Damascus":[["-145.2","-","LMT","-1546387200000"],["-120","Syria","EE%sT",null]],"Asia/Dushanbe":[["-275.2","-","LMT","-1441152000000"],["-300","-","+05","-1247529600000"],["-360","RussiaAsia","+06/+07","670384800000"],["-300","1:00","+05/+06","684381600000"],["-300","-","+05",null]],"Asia/Bangkok":[["-402.06666666666666","-","LMT","-2808604800000"],["-402.06666666666666","-","BMT","-1570060800000"],["-420","-","ICT",null]],"Asia/Phnom_Penh":"Asia/Bangkok","Asia/Vientiane":"Asia/Bangkok","Asia/Ashgabat":[["-233.53333333333333","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","RussiaAsia","+05/+06","670384800000"],["-240","RussiaAsia","+04/+05","695786400000"],["-300","-","+05",null]],"Asia/Dubai":[["-221.2","-","LMT","-1546387200000"],["-240","-","GST",null]],"Asia/Muscat":"Asia/Dubai","Asia/Samarkand":[["-267.8833333333333","-","LMT","-1441152000000"],["-240","-","+04","-1247529600000"],["-300","-","+05","354931200000"],["-300","1:00","+06","370742400000"],["-360","-","+06","386467200000"],["-300","RussiaAsia","+05/+06","725760000000"],["-300","-","+05",null]],"Asia/Tashkent":[["-277.18333333333334","-","LMT","-1441152000000"],["-300","-","+05","-1247529600000"],["-360","RussiaAsia","+06/+07","670384800000"],["-300","RussiaAsia","+05/+06","725760000000"],["-300","-","+05",null]],"Asia/Ho_Chi_Minh":[["-426.6666666666667","-","LMT","-2004048000000"],["-426.5","-","PLMT","-1851552000000"],["-420","-","ICT","-852080400000"],["-480","-","IDT","-782614800000"],["-540","-","JST","-767836800000"],["-420","-","ICT","-718070400000"],["-480","-","IDT","-457747200000"],["-420","-","ICT","-315622800000"],["-480","-","IDT","171849600000"],["-420","-","ICT",null]],"Australia/Darwin":[["-523.3333333333333","-","LMT","-2364076800000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT",null]],"Australia/Perth":[["-463.4","-","LMT","-2337897600000"],["-480","Aus","AW%sT","-836438400000"],["-480","AW","AW%sT",null]],"Australia/Eucla":[["-515.4666666666667","-","LMT","-2337897600000"],["-525","Aus","ACW%sT","-836438400000"],["-525","AW","ACW%sT",null]],"Australia/Brisbane":[["-612.1333333333333","-","LMT","-2335305600000"],["-600","Aus","AE%sT","62985600000"],["-600","AQ","AE%sT",null]],"Australia/Lindeman":[["-595.9333333333334","-","LMT","-2335305600000"],["-600","Aus","AE%sT","62985600000"],["-600","AQ","AE%sT","709948800000"],["-600","Holiday","AE%sT",null]],"Australia/Adelaide":[["-554.3333333333334","-","LMT","-2364076800000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT","62985600000"],["-570","AS","AC%sT",null]],"Australia/Hobart":[["-589.2666666666667","-","LMT","-2345760000000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","-63244800000"],["-600","AT","AE%sT",null]],"Australia/Currie":[["-575.4666666666666","-","LMT","-2345760000000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","47174400000"],["-600","AT","AE%sT",null]],"Australia/Melbourne":[["-579.8666666666667","-","LMT","-2364076800000"],["-600","Aus","AE%sT","62985600000"],["-600","AV","AE%sT",null]],"Australia/Sydney":[["-604.8666666666667","-","LMT","-2364076800000"],["-600","Aus","AE%sT","62985600000"],["-600","AN","AE%sT",null]],"Australia/Broken_Hill":[["-565.8","-","LMT","-2364076800000"],["-600","-","AEST","-2314915200000"],["-540","-","ACST","-2230156800000"],["-570","Aus","AC%sT","62985600000"],["-570","AN","AC%sT","978220800000"],["-570","AS","AC%sT",null]],"Australia/Lord_Howe":[["-636.3333333333334","-","LMT","-2364076800000"],["-600","-","AEST","352252800000"],["-630","LH","LH%sT",null]],"Antarctica/Macquarie":[["0","-","-00","-2214259200000"],["-600","-","AEST","-1680472800000"],["-600","1:00","AEDT","-1669852800000"],["-600","Aus","AE%sT","-1601683200000"],["0","-","-00","-687052800000"],["-600","Aus","AE%sT","-63244800000"],["-600","AT","AE%sT","1270350000000"],["-660","-","MIST",null]],"Indian/Christmas":[["-422.8666666666667","-","LMT","-2364076800000"],["-420","-","CXT",null]],"Indian/Cocos":[["-387.6666666666667","-","LMT","-2177539200000"],["-390","-","CCT",null]],"Pacific/Fiji":[["-715.7333333333333","-","LMT","-1709942400000"],["-720","Fiji","FJ%sT",null]],"Pacific/Gambier":[["539.8","-","LMT","-1806710400000"],["540","-","GAMT",null]],"Pacific/Marquesas":[["558","-","LMT","-1806710400000"],["570","-","MART",null]],"Pacific/Tahiti":[["598.2666666666667","-","LMT","-1806710400000"],["600","-","TAHT",null]],"Pacific/Guam":[["861","-","LMT","-3944678400000"],["-579","-","LMT","-2146003200000"],["-600","-","GST","977529600000"],["-600","-","ChST",null]],"Pacific/Saipan":"Pacific/Guam","Pacific/Tarawa":[["-692.0666666666666","-","LMT","-2146003200000"],["-720","-","GILT",null]],"Pacific/Enderbury":[["684.3333333333334","-","LMT","-2146003200000"],["720","-","PHOT","307584000000"],["660","-","PHOT","820368000000"],["-780","-","PHOT",null]],"Pacific/Kiritimati":[["629.3333333333334","-","LMT","-2146003200000"],["640","-","LINT","307584000000"],["600","-","LINT","820368000000"],["-840","-","LINT",null]],"Pacific/Majuro":[["-684.8","-","LMT","-2146003200000"],["-660","-","MHT","-7948800000"],["-720","-","MHT",null]],"Pacific/Kwajalein":[["-669.3333333333334","-","LMT","-2146003200000"],["-660","-","MHT","-7948800000"],["720","-","KWAT","745804800000"],["-720","-","MHT",null]],"Pacific/Chuuk":[["-607.1333333333333","-","LMT","-2146003200000"],["-600","-","CHUT",null]],"Pacific/Pohnpei":[["-632.8666666666667","-","LMT","-2146003200000"],["-660","-","PONT",null]],"Pacific/Kosrae":[["-651.9333333333334","-","LMT","-2146003200000"],["-660","-","KOST","-7948800000"],["-720","-","KOST","946598400000"],["-660","-","KOST",null]],"Pacific/Nauru":[["-667.6666666666666","-","LMT","-1545091200000"],["-690","-","NRT","-877305600000"],["-540","-","JST","-800928000000"],["-690","-","NRT","294364800000"],["-720","-","NRT",null]],"Pacific/Noumea":[["-665.8","-","LMT","-1829347200000"],["-660","NC","NC%sT",null]],"Pacific/Auckland":[["-699.0666666666666","-","LMT","-3192393600000"],["-690","NZ","NZ%sT","-757382400000"],["-720","NZ","NZ%sT",null]],"Pacific/Chatham":[["-733.8","-","LMT","-3192393600000"],["-735","-","CHAST","-757382400000"],["-765","Chatham","CHA%sT",null]],"Antarctica/McMurdo":"Pacific/Auckland","Pacific/Rarotonga":[["639.0666666666666","-","LMT","-2146003200000"],["630","-","CKT","279676800000"],["600","Cook","CK%sT",null]],"Pacific/Niue":[["679.6666666666666","-","LMT","-2146003200000"],["680","-","NUT","-568166400000"],["690","-","NUT","276048000000"],["660","-","NUT",null]],"Pacific/Norfolk":[["-671.8666666666667","-","LMT","-2146003200000"],["-672","-","NMT","-568166400000"],["-690","-","NFT","152071200000"],["-690","1:00","NFST","162957600000"],["-690","-","NFT","1443924000000"],["-660","-","NFT",null]],"Pacific/Palau":[["-537.9333333333334","-","LMT","-2146003200000"],["-540","-","PWT",null]],"Pacific/Port_Moresby":[["-588.6666666666666","-","LMT","-2808604800000"],["-588.5333333333334","-","PMMT","-2335305600000"],["-600","-","PGT",null]],"Pacific/Bougainville":[["-622.2666666666667","-","LMT","-2808604800000"],["-588.5333333333334","-","PMMT","-2335305600000"],["-600","-","PGT","-867974400000"],["-540","-","JST","-768873600000"],["-600","-","PGT","1419732000000"],["-660","-","BST",null]],"Pacific/Pitcairn":[["520.3333333333333","-","LMT","-2146003200000"],["510","-","PNT","893635200000"],["480","-","PST",null]],"Pacific/Pago_Pago":[["-757.2","-","LMT","-2855692800000"],["682.8","-","LMT","-1830470400000"],["660","-","NST","-86918400000"],["660","-","BST","438998400000"],["660","-","SST",null]],"Pacific/Midway":"Pacific/Pago_Pago","Pacific/Apia":[["-753.0666666666666","-","LMT","-2855692800000"],["686.9333333333334","-","LMT","-1830470400000"],["690","-","WSST","-599702400000"],["660","WS","S%sT","1325203200000"],["-780","WS","WS%sT",null]],"Pacific/Guadalcanal":[["-639.8","-","LMT","-1806710400000"],["-660","-","SBT",null]],"Pacific/Fakaofo":[["684.9333333333334","-","LMT","-2146003200000"],["660","-","TKT","1325203200000"],["-780","-","TKT",null]],"Pacific/Tongatapu":[["-739.3333333333334","-","LMT","-2146003200000"],["-740","-","TOT","-883699200000"],["-780","-","TOT","946598400000"],["-780","Tonga","TO%sT",null]],"Pacific/Funafuti":[["-716.8666666666667","-","LMT","-2146003200000"],["-720","-","TVT",null]],"Pacific/Wake":[["-666.4666666666666","-","LMT","-2146003200000"],["-720","-","WAKT",null]],"Pacific/Efate":[["-673.2666666666667","-","LMT","-1829347200000"],["-660","Vanuatu","VU%sT",null]],"Pacific/Wallis":[["-735.3333333333334","-","LMT","-2146003200000"],["-720","-","WFT",null]],"Africa/Asmera":"Africa/Nairobi","Africa/Timbuktu":"Africa/Abidjan","America/Argentina/ComodRivadavia":"America/Argentina/Catamarca","America/Atka":"America/Adak","America/Buenos_Aires":"America/Argentina/Buenos_Aires","America/Catamarca":"America/Argentina/Catamarca","America/Coral_Harbour":"America/Atikokan","America/Cordoba":"America/Argentina/Cordoba","America/Ensenada":"America/Tijuana","America/Fort_Wayne":"America/Indiana/Indianapolis","America/Indianapolis":"America/Indiana/Indianapolis","America/Jujuy":"America/Argentina/Jujuy","America/Knox_IN":"America/Indiana/Knox","America/Louisville":"America/Kentucky/Louisville","America/Mendoza":"America/Argentina/Mendoza","America/Montreal":"America/Toronto","America/Porto_Acre":"America/Rio_Branco","America/Rosario":"America/Argentina/Cordoba","America/Santa_Isabel":"America/Tijuana","America/Shiprock":"America/Denver","America/Virgin":"America/Port_of_Spain","Antarctica/South_Pole":"Pacific/Auckland","Asia/Ashkhabad":"Asia/Ashgabat","Asia/Calcutta":"Asia/Kolkata","Asia/Chongqing":"Asia/Shanghai","Asia/Chungking":"Asia/Shanghai","Asia/Dacca":"Asia/Dhaka","Asia/Harbin":"Asia/Shanghai","Asia/Kashgar":"Asia/Urumqi","Asia/Katmandu":"Asia/Kathmandu","Asia/Macao":"Asia/Macau","Asia/Rangoon":"Asia/Yangon","Asia/Saigon":"Asia/Ho_Chi_Minh","Asia/Tel_Aviv":"Asia/Jerusalem","Asia/Thimbu":"Asia/Thimphu","Asia/Ujung_Pandang":"Asia/Makassar","Asia/Ulan_Bator":"Asia/Ulaanbaatar","Atlantic/Faeroe":"Atlantic/Faroe","Atlantic/Jan_Mayen":"Europe/Oslo","Australia/ACT":"Australia/Sydney","Australia/Canberra":"Australia/Sydney","Australia/LHI":"Australia/Lord_Howe","Australia/NSW":"Australia/Sydney","Australia/North":"Australia/Darwin","Australia/Queensland":"Australia/Brisbane","Australia/South":"Australia/Adelaide","Australia/Tasmania":"Australia/Hobart","Australia/Victoria":"Australia/Melbourne","Australia/West":"Australia/Perth","Australia/Yancowinna":"Australia/Broken_Hill","Brazil/Acre":"America/Rio_Branco","Brazil/DeNoronha":"America/Noronha","Brazil/East":"America/Sao_Paulo","Brazil/West":"America/Manaus","Canada/Atlantic":"America/Halifax","Canada/Central":"America/Winnipeg","Canada/East-Saskatchewan":"America/Regina","Canada/Eastern":"America/Toronto","Canada/Mountain":"America/Edmonton","Canada/Newfoundland":"America/St_Johns","Canada/Pacific":"America/Vancouver","Canada/Saskatchewan":"America/Regina","Canada/Yukon":"America/Whitehorse","Chile/Continental":"America/Santiago","Chile/EasterIsland":"Pacific/Easter","Cuba":"America/Havana","Egypt":"Africa/Cairo","Eire":"Europe/Dublin","Europe/Belfast":"Europe/London","Europe/Tiraspol":"Europe/Chisinau","GB":"Europe/London","GB-Eire":"Europe/London","GMT+0":"Etc/GMT","GMT-0":"Etc/GMT","GMT0":"Etc/GMT","Greenwich":"Etc/GMT","Hongkong":"Asia/Hong_Kong","Iceland":"Atlantic/Reykjavik","Iran":"Asia/Tehran","Israel":"Asia/Jerusalem","Jamaica":"America/Jamaica","Japan":"Asia/Tokyo","Kwajalein":"Pacific/Kwajalein","Libya":"Africa/Tripoli","Mexico/BajaNorte":"America/Tijuana","Mexico/BajaSur":"America/Mazatlan","Mexico/General":"America/Mexico_City","NZ":"Pacific/Auckland","NZ-CHAT":"Pacific/Chatham","Navajo":"America/Denver","PRC":"Asia/Shanghai","Pacific/Ponape":"Pacific/Pohnpei","Pacific/Samoa":"Pacific/Pago_Pago","Pacific/Truk":"Pacific/Chuuk","Pacific/Yap":"Pacific/Chuuk","Poland":"Europe/Warsaw","Portugal":"Europe/Lisbon","ROC":"Asia/Taipei","ROK":"Asia/Seoul","Singapore":"Asia/Singapore","Turkey":"Europe/Istanbul","UCT":"Etc/UCT","US/Alaska":"America/Anchorage","US/Aleutian":"America/Adak","US/Arizona":"America/Phoenix","US/Central":"America/Chicago","US/East-Indiana":"America/Indiana/Indianapolis","US/Eastern":"America/New_York","US/Hawaii":"Pacific/Honolulu","US/Indiana-Starke":"America/Indiana/Knox","US/Michigan":"America/Detroit","US/Mountain":"America/Denver","US/Pacific":"America/Los_Angeles","US/Samoa":"Pacific/Pago_Pago","UTC":"Etc/UTC","Universal":"Etc/UTC","W-SU":"Europe/Moscow","Zulu":"Etc/UTC","Etc/GMT":[["0","-","GMT",null]],"Etc/UTC":[["0","-","UTC",null]],"Etc/UCT":[["0","-","UCT",null]],"GMT":"Etc/GMT","Etc/Universal":"Etc/UTC","Etc/Zulu":"Etc/UTC","Etc/Greenwich":"Etc/GMT","Etc/GMT-0":"Etc/GMT","Etc/GMT+0":"Etc/GMT","Etc/GMT0":"Etc/GMT","Etc/GMT-14":[["-840","-","+14",null]],"Etc/GMT-13":[["-780","-","+13",null]],"Etc/GMT-12":[["-720","-","+12",null]],"Etc/GMT-11":[["-660","-","+11",null]],"Etc/GMT-10":[["-600","-","+10",null]],"Etc/GMT-9":[["-540","-","+09",null]],"Etc/GMT-8":[["-480","-","+08",null]],"Etc/GMT-7":[["-420","-","+07",null]],"Etc/GMT-6":[["-360","-","+06",null]],"Etc/GMT-5":[["-300","-","+05",null]],"Etc/GMT-4":[["-240","-","+04",null]],"Etc/GMT-3":[["-180","-","+03",null]],"Etc/GMT-2":[["-120","-","+02",null]],"Etc/GMT-1":[["-60","-","+01",null]],"Etc/GMT+1":[["60","-","-01",null]],"Etc/GMT+2":[["120","-","-02",null]],"Etc/GMT+3":[["180","-","-03",null]],"Etc/GMT+4":[["240","-","-04",null]],"Etc/GMT+5":[["300","-","-05",null]],"Etc/GMT+6":[["360","-","-06",null]],"Etc/GMT+7":[["420","-","-07",null]],"Etc/GMT+8":[["480","-","-08",null]],"Etc/GMT+9":[["540","-","-09",null]],"Etc/GMT+10":[["600","-","-10",null]],"Etc/GMT+11":[["660","-","-11",null]],"Etc/GMT+12":[["720","-","-12",null]],"Europe/London":[["1.25","-","LMT","-3852662400000"],["0","GB-Eire","%s","-37238400000"],["-60","-","BST","57722400000"],["0","GB-Eire","%s","851990400000"],["0","EU","GMT/BST",null]],"Europe/Jersey":"Europe/London","Europe/Guernsey":"Europe/London","Europe/Isle_of_Man":"Europe/London","Europe/Dublin":[["25","-","LMT","-2821651200000"],["25.35","-","DMT","-1691964000000"],["25.35","1:00","IST","-1680472800000"],["0","GB-Eire","%s","-1517011200000"],["0","GB-Eire","GMT/IST","-942012000000"],["0","1:00","IST","-733356000000"],["0","-","GMT","-719445600000"],["0","1:00","IST","-699487200000"],["0","-","GMT","-684972000000"],["0","GB-Eire","GMT/IST","-37238400000"],["-60","-","IST","57722400000"],["0","GB-Eire","GMT/IST","851990400000"],["0","EU","GMT/IST",null]],"WET":[["0","EU","WE%sT",null]],"CET":[["-60","C-Eur","CE%sT",null]],"MET":[["-60","C-Eur","ME%sT",null]],"EET":[["-120","EU","EE%sT",null]],"Europe/Tirane":[["-79.33333333333333","-","LMT","-1735776000000"],["-60","-","CET","-932342400000"],["-60","Albania","CE%sT","457488000000"],["-60","EU","CE%sT",null]],"Europe/Andorra":[["-6.066666666666667","-","LMT","-2146003200000"],["0","-","WET","-733881600000"],["-60","-","CET","481082400000"],["-60","EU","CE%sT",null]],"Europe/Vienna":[["-65.35","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-1546387200000"],["-60","Austria","CE%sT","-938901600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","1:00","CEST","-780184800000"],["-60","-","CET","-725932800000"],["-60","Austria","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Minsk":[["-110.26666666666667","-","LMT","-2808604800000"],["-110","-","MMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-899769600000"],["-60","C-Eur","CE%sT","-804643200000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","670384800000"],["-120","Russia","EE%sT","1301191200000"],["-180","-","+03",null]],"Europe/Brussels":[["-17.5","-","LMT","-2808604800000"],["-17.5","-","BMT","-2450952000000"],["0","-","WET","-1740355200000"],["-60","-","CET","-1693699200000"],["-60","C-Eur","CE%sT","-1613826000000"],["0","Belgium","WE%sT","-934668000000"],["-60","C-Eur","CE%sT","-799286400000"],["-60","Belgium","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Sofia":[["-93.26666666666667","-","LMT","-2808604800000"],["-116.93333333333332","-","IMT","-2369520000000"],["-120","-","EET","-857250000000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","-","CET","-781045200000"],["-120","-","EET","291769200000"],["-120","Bulg","EE%sT","401857200000"],["-120","C-Eur","EE%sT","694137600000"],["-120","E-Eur","EE%sT","883526400000"],["-120","EU","EE%sT",null]],"Europe/Prague":[["-57.733333333333334","-","LMT","-3755376000000"],["-57.733333333333334","-","PMT","-2469398400000"],["-60","C-Eur","CE%sT","-798069600000"],["-60","Czech","CE%sT","315446400000"],["-60","EU","CE%sT",null]],"Europe/Copenhagen":[["-50.333333333333336","-","LMT","-2493072000000"],["-50.333333333333336","-","CMT","-2398291200000"],["-60","Denmark","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Denmark","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Atlantic/Faroe":[["27.066666666666666","-","LMT","-1955750400000"],["0","-","WET","378604800000"],["0","EU","WE%sT",null]],"America/Danmarkshavn":[["74.66666666666667","-","LMT","-1686096000000"],["180","-","WGT","323834400000"],["180","EU","WG%sT","851990400000"],["0","-","GMT",null]],"America/Scoresbysund":[["87.86666666666667","-","LMT","-1686096000000"],["120","-","CGT","323834400000"],["120","C-Eur","CG%sT","354672000000"],["60","EU","EG%sT",null]],"America/Godthab":[["206.93333333333334","-","LMT","-1686096000000"],["180","-","WGT","323834400000"],["180","EU","WG%sT",null]],"America/Thule":[["275.1333333333333","-","LMT","-1686096000000"],["240","Thule","A%sT",null]],"Europe/Tallinn":[["-99","-","LMT","-2808604800000"],["-99","-","TMT","-1638316800000"],["-60","C-Eur","CE%sT","-1593820800000"],["-99","-","TMT","-1535932800000"],["-120","-","EET","-927936000000"],["-180","-","MSK","-892944000000"],["-60","C-Eur","CE%sT","-797644800000"],["-180","Russia","MSK/MSD","606880800000"],["-120","1:00","EEST","622605600000"],["-120","C-Eur","EE%sT","906422400000"],["-120","EU","EE%sT","941342400000"],["-120","-","EET","1014249600000"],["-120","EU","EE%sT",null]],"Europe/Helsinki":[["-99.81666666666668","-","LMT","-2890252800000"],["-99.81666666666668","-","HMT","-1535932800000"],["-120","Finland","EE%sT","441676800000"],["-120","EU","EE%sT",null]],"Europe/Mariehamn":"Europe/Helsinki","Europe/Paris":[["-9.35","-","LMT","-2486678340000"],["-9.35","-","PMT","-1855958340000"],["0","France","WE%sT","-932432400000"],["-60","C-Eur","CE%sT","-800064000000"],["0","France","WE%sT","-766616400000"],["-60","France","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Berlin":[["-53.46666666666666","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-776556000000"],["-60","SovietZone","CE%sT","-725932800000"],["-60","Germany","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Europe/Busingen":"Europe/Zurich","Europe/Gibraltar":[["21.4","-","LMT","-2821651200000"],["0","GB-Eire","%s","-401320800000"],["-60","-","CET","410140800000"],["-60","EU","CE%sT",null]],"Europe/Athens":[["-94.86666666666667","-","LMT","-2344636800000"],["-94.86666666666667","-","AMT","-1686095940000"],["-120","Greece","EE%sT","-904867200000"],["-60","Greece","CE%sT","-812419200000"],["-120","Greece","EE%sT","378604800000"],["-120","EU","EE%sT",null]],"Europe/Budapest":[["-76.33333333333333","-","LMT","-2500934400000"],["-60","C-Eur","CE%sT","-1609545600000"],["-60","Hungary","CE%sT","-906768000000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","Hungary","CE%sT","338954400000"],["-60","EU","CE%sT",null]],"Atlantic/Reykjavik":[["88","-","LMT","-1925078400000"],["60","Iceland","IS%sT","-54774000000"],["0","-","GMT",null]],"Europe/Rome":[["-49.93333333333334","-","LMT","-3259094400000"],["-49.93333333333334","-","RMT","-2403561600000"],["-60","Italy","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-804816000000"],["-60","Italy","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Europe/Vatican":"Europe/Rome","Europe/San_Marino":"Europe/Rome","Europe/Riga":[["-96.56666666666668","-","LMT","-2808604800000"],["-96.56666666666668","-","RMT","-1632002400000"],["-96.56666666666668","1:00","LST","-1618693200000"],["-96.56666666666668","-","RMT","-1601676000000"],["-96.56666666666668","1:00","LST","-1597266000000"],["-96.56666666666668","-","RMT","-1377302400000"],["-120","-","EET","-928022400000"],["-180","-","MSK","-899510400000"],["-60","C-Eur","CE%sT","-795830400000"],["-180","Russia","MSK/MSD","604720800000"],["-120","1:00","EEST","620618400000"],["-120","Latvia","EE%sT","853804800000"],["-120","EU","EE%sT","951782400000"],["-120","-","EET","978393600000"],["-120","EU","EE%sT",null]],"Europe/Vaduz":"Europe/Zurich","Europe/Vilnius":[["-101.26666666666667","-","LMT","-2808604800000"],["-84","-","WMT","-1641081600000"],["-95.6","-","KMT","-1585094400000"],["-60","-","CET","-1561248000000"],["-120","-","EET","-1553558400000"],["-60","-","CET","-928195200000"],["-180","-","MSK","-900115200000"],["-60","C-Eur","CE%sT","-802137600000"],["-180","Russia","MSK/MSD","606880800000"],["-120","Russia","EE%sT","686109600000"],["-120","C-Eur","EE%sT","915062400000"],["-120","-","EET","891133200000"],["-60","EU","CE%sT","941331600000"],["-120","-","EET","1041379200000"],["-120","EU","EE%sT",null]],"Europe/Luxembourg":[["-24.6","-","LMT","-2069712000000"],["-60","Lux","CE%sT","-1612656000000"],["0","Lux","WE%sT","-1269813600000"],["0","Belgium","WE%sT","-935182800000"],["-60","C-Eur","WE%sT","-797979600000"],["-60","Belgium","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Malta":[["-58.06666666666666","-","LMT","-2403475200000"],["-60","Italy","CE%sT","-857253600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Italy","CE%sT","102384000000"],["-60","Malta","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Chisinau":[["-115.33333333333333","-","LMT","-2808604800000"],["-115","-","CMT","-1637107200000"],["-104.4","-","BMT","-1213142400000"],["-120","Romania","EE%sT","-927158400000"],["-120","1:00","EEST","-898128000000"],["-60","C-Eur","CE%sT","-800150400000"],["-180","Russia","MSK/MSD","641959200000"],["-120","Russia","EE%sT","725760000000"],["-120","E-Eur","EE%sT","883526400000"],["-120","Moldova","EE%sT",null]],"Europe/Monaco":[["-29.53333333333333","-","LMT","-2486678400000"],["-9.35","-","PMT","-1855958400000"],["0","France","WE%sT","-766616400000"],["-60","France","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Amsterdam":[["-19.53333333333333","-","LMT","-4228761600000"],["-19.53333333333333","Neth","%s","-1025740800000"],["-20","Neth","NE%sT","-935020800000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Neth","CE%sT","252374400000"],["-60","EU","CE%sT",null]],"Europe/Oslo":[["-43","-","LMT","-2366755200000"],["-60","Norway","CE%sT","-927507600000"],["-60","C-Eur","CE%sT","-781048800000"],["-60","Norway","CE%sT","347068800000"],["-60","EU","CE%sT",null]],"Arctic/Longyearbyen":"Europe/Oslo","Europe/Warsaw":[["-84","-","LMT","-2808604800000"],["-84","-","WMT","-1717027200000"],["-60","C-Eur","CE%sT","-1618693200000"],["-120","Poland","EE%sT","-1501718400000"],["-60","Poland","CE%sT","-931730400000"],["-60","C-Eur","CE%sT","-796867200000"],["-60","Poland","CE%sT","252374400000"],["-60","W-Eur","CE%sT","599529600000"],["-60","EU","CE%sT",null]],"Europe/Lisbon":[["36.75","-","LMT","-2682374400000"],["36.75","-","LMT","-1830384000000"],["0","Port","WE%sT","-118274400000"],["-60","-","CET","212547600000"],["0","Port","WE%sT","433299600000"],["0","W-Eur","WE%sT","717555600000"],["-60","EU","CE%sT","828234000000"],["0","EU","WE%sT",null]],"Atlantic/Azores":[["102.66666666666667","-","LMT","-2682374400000"],["114.53333333333333","-","HMT","-1830384000000"],["120","Port","AZO%sT","-118274400000"],["60","Port","AZO%sT","433299600000"],["60","W-Eur","AZO%sT","717555600000"],["0","EU","WE%sT","733280400000"],["60","EU","AZO%sT",null]],"Atlantic/Madeira":[["67.6","-","LMT","-2682374400000"],["67.6","-","FMT","-1830384000000"],["60","Port","MAD%sT","-118274400000"],["0","Port","WE%sT","433299600000"],["0","EU","WE%sT",null]],"Europe/Bucharest":[["-104.4","-","LMT","-2469398400000"],["-104.4","-","BMT","-1213142400000"],["-120","Romania","EE%sT","354679200000"],["-120","C-Eur","EE%sT","694137600000"],["-120","Romania","EE%sT","788832000000"],["-120","E-Eur","EE%sT","883526400000"],["-120","EU","EE%sT",null]],"Europe/Kaliningrad":[["-82","-","LMT","-2422051200000"],["-60","C-Eur","CE%sT","-757468800000"],["-120","Poland","CE%sT","-725932800000"],["-180","Russia","MSK/MSD","606880800000"],["-120","Russia","EE%sT","1301191200000"],["-180","-","+03","1414288800000"],["-120","-","EET",null]],"Europe/Moscow":[["-150.28333333333333","-","LMT","-2808604800000"],["-150.28333333333333","-","MMT","-1688256000000"],["-151.31666666666666","Russia","%s","-1593820800000"],["-180","Russia","%s","-1522713600000"],["-180","Russia","MSK/MSD","-1491177600000"],["-120","-","EET","-1247529600000"],["-180","Russia","MSK/MSD","670384800000"],["-120","Russia","EE%sT","695786400000"],["-180","Russia","MSK/MSD","1301191200000"],["-240","-","MSK","1414288800000"],["-180","-","MSK",null]],"Europe/Simferopol":[["-136.4","-","LMT","-2808604800000"],["-136","-","SMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-888883200000"],["-60","C-Eur","CE%sT","-811641600000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","646797600000"],["-120","-","EET","725760000000"],["-120","E-Eur","EE%sT","767750400000"],["-180","E-Eur","MSK/MSD","828230400000"],["-180","1:00","MSD","846385200000"],["-180","Russia","MSK/MSD","883526400000"],["-180","-","MSK","857178000000"],["-120","EU","EE%sT","1396144800000"],["-240","-","MSK","1414288800000"],["-180","-","MSK",null]],"Europe/Astrakhan":[["-192.2","-","LMT","-1441238400000"],["-180","-","+03","-1247529600000"],["-240","Russia","+04/+05","606880800000"],["-180","Russia","+03/+04","670384800000"],["-240","-","+04","701834400000"],["-180","Russia","+03/+04","1301191200000"],["-240","-","+04","1414288800000"],["-180","-","+03","1459044000000"],["-240","-","+04",null]],"Europe/Volgograd":[["-177.66666666666666","-","LMT","-1577750400000"],["-180","-","+03","-1247529600000"],["-240","-","+04","-256867200000"],["-240","Russia","+04/+05","575431200000"],["-180","Russia","+03/+04","670384800000"],["-240","-","+04","701834400000"],["-180","Russia","+03/+04","1301191200000"],["-240","-","+04","1414288800000"],["-180","-","+03",null]],"Europe/Kirov":[["-198.8","-","LMT","-1593820800000"],["-180","-","+03","-1247529600000"],["-240","Russia","+04/+05","606880800000"],["-180","Russia","+03/+04","670384800000"],["-240","-","+04","701834400000"],["-180","Russia","+03/+04","1301191200000"],["-240","-","+04","1414288800000"],["-180","-","+03",null]],"Europe/Samara":[["-200.33333333333334","-","LMT","-1593820800000"],["-180","-","+03","-1247529600000"],["-240","-","+04","-1102291200000"],["-240","Russia","+04/+05","606880800000"],["-180","Russia","+03/+04","670384800000"],["-120","Russia","+02/+03","686109600000"],["-180","-","+03","687927600000"],["-240","Russia","+04/+05","1269741600000"],["-180","Russia","+03/+04","1301191200000"],["-240","-","+04",null]],"Europe/Ulyanovsk":[["-193.6","-","LMT","-1593820800000"],["-180","-","+03","-1247529600000"],["-240","Russia","+04/+05","606880800000"],["-180","Russia","+03/+04","670384800000"],["-120","Russia","+02/+03","695786400000"],["-180","Russia","+03/+04","1301191200000"],["-240","-","+04","1414288800000"],["-180","-","+03","1459044000000"],["-240","-","+04",null]],"Asia/Yekaterinburg":[["-242.55","-","LMT","-1688256000000"],["-225.08333333333334","-","PMT","-1592596800000"],["-240","-","+04","-1247529600000"],["-300","Russia","+05/+06","670384800000"],["-240","Russia","+04/+05","695786400000"],["-300","Russia","+05/+06","1301191200000"],["-360","-","+06","1414288800000"],["-300","-","+05",null]],"Asia/Omsk":[["-293.5","-","LMT","-1582070400000"],["-300","-","+05","-1247529600000"],["-360","Russia","+06/+07","670384800000"],["-300","Russia","+05/+06","695786400000"],["-360","Russia","+06/+07","1301191200000"],["-420","-","+07","1414288800000"],["-360","-","+06",null]],"Asia/Barnaul":[["-335","-","LMT","-1579824000000"],["-360","-","+06","-1247529600000"],["-420","Russia","+07/+08","670384800000"],["-360","Russia","+06/+07","695786400000"],["-420","Russia","+07/+08","801619200000"],["-360","Russia","+06/+07","1301191200000"],["-420","-","+07","1414288800000"],["-360","-","+06","1459044000000"],["-420","-","+07",null]],"Asia/Novosibirsk":[["-331.6666666666667","-","LMT","-1579456800000"],["-360","-","+06","-1247529600000"],["-420","Russia","+07/+08","670384800000"],["-360","Russia","+06/+07","695786400000"],["-420","Russia","+07/+08","738115200000"],["-360","Russia","+06/+07","1301191200000"],["-420","-","+07","1414288800000"],["-360","-","+06","1469325600000"],["-420","-","+07",null]],"Asia/Tomsk":[["-339.85","-","LMT","-1578787200000"],["-360","-","+06","-1247529600000"],["-420","Russia","+07/+08","670384800000"],["-360","Russia","+06/+07","695786400000"],["-420","Russia","+07/+08","1020222000000"],["-360","Russia","+06/+07","1301191200000"],["-420","-","+07","1414288800000"],["-360","-","+06","1464487200000"],["-420","-","+07",null]],"Asia/Novokuznetsk":[["-348.8","-","LMT","-1441238400000"],["-360","-","+06","-1247529600000"],["-420","Russia","+07/+08","670384800000"],["-360","Russia","+06/+07","695786400000"],["-420","Russia","+07/+08","1269741600000"],["-360","Russia","+06/+07","1301191200000"],["-420","-","+07",null]],"Asia/Krasnoyarsk":[["-371.43333333333334","-","LMT","-1577491200000"],["-360","-","+06","-1247529600000"],["-420","Russia","+07/+08","670384800000"],["-360","Russia","+06/+07","695786400000"],["-420","Russia","+07/+08","1301191200000"],["-480","-","+08","1414288800000"],["-420","-","+07",null]],"Asia/Irkutsk":[["-417.0833333333333","-","LMT","-2808604800000"],["-417.0833333333333","-","IMT","-1575849600000"],["-420","-","+07","-1247529600000"],["-480","Russia","+08/+09","670384800000"],["-420","Russia","+07/+08","695786400000"],["-480","Russia","+08/+09","1301191200000"],["-540","-","+09","1414288800000"],["-480","-","+08",null]],"Asia/Chita":[["-453.8666666666667","-","LMT","-1579392000000"],["-480","-","+08","-1247529600000"],["-540","Russia","+09/+10","670384800000"],["-480","Russia","+08/+09","695786400000"],["-540","Russia","+09/+10","1301191200000"],["-600","-","+10","1414288800000"],["-480","-","+08","1459044000000"],["-540","-","+09",null]],"Asia/Yakutsk":[["-518.9666666666667","-","LMT","-1579392000000"],["-480","-","+08","-1247529600000"],["-540","Russia","+09/+10","670384800000"],["-480","Russia","+08/+09","695786400000"],["-540","Russia","+09/+10","1301191200000"],["-600","-","+10","1414288800000"],["-540","-","+09",null]],"Asia/Vladivostok":[["-527.5166666666667","-","LMT","-1487289600000"],["-540","-","+09","-1247529600000"],["-600","Russia","+10/+11","670384800000"],["-540","Russia","+09/+10","695786400000"],["-600","Russia","+10/+11","1301191200000"],["-660","-","+11","1414288800000"],["-600","-","+10",null]],"Asia/Khandyga":[["-542.2166666666666","-","LMT","-1579392000000"],["-480","-","+08","-1247529600000"],["-540","Russia","+09/+10","670384800000"],["-480","Russia","+08/+09","695786400000"],["-540","Russia","+09/+10","1104451200000"],["-600","Russia","+10/+11","1301191200000"],["-660","-","+11","1315872000000"],["-600","-","+10","1414288800000"],["-540","-","+09",null]],"Asia/Sakhalin":[["-570.8","-","LMT","-2031004800000"],["-540","-","+09","-768528000000"],["-660","Russia","+11/+12","670384800000"],["-600","Russia","+10/+11","695786400000"],["-660","Russia","+11/+12","857181600000"],["-600","Russia","+10/+11","1301191200000"],["-660","-","+11","1414288800000"],["-600","-","+10","1459044000000"],["-660","-","+11",null]],"Asia/Magadan":[["-603.2","-","LMT","-1441152000000"],["-600","-","+10","-1247529600000"],["-660","Russia","+11/+12","670384800000"],["-600","Russia","+10/+11","695786400000"],["-660","Russia","+11/+12","1301191200000"],["-720","-","+12","1414288800000"],["-600","-","+10","1461463200000"],["-660","-","+11",null]],"Asia/Srednekolymsk":[["-614.8666666666667","-","LMT","-1441152000000"],["-600","-","+10","-1247529600000"],["-660","Russia","+11/+12","670384800000"],["-600","Russia","+10/+11","695786400000"],["-660","Russia","+11/+12","1301191200000"],["-720","-","+12","1414288800000"],["-660","-","+11",null]],"Asia/Ust-Nera":[["-572.9","-","LMT","-1579392000000"],["-480","-","+08","-1247529600000"],["-540","Russia","+09/+10","354931200000"],["-660","Russia","+11/+12","670384800000"],["-600","Russia","+10/+11","695786400000"],["-660","Russia","+11/+12","1301191200000"],["-720","-","+12","1315872000000"],["-660","-","+11","1414288800000"],["-600","-","+10",null]],"Asia/Kamchatka":[["-634.6","-","LMT","-1487721600000"],["-660","-","+11","-1247529600000"],["-720","Russia","+12/+13","670384800000"],["-660","Russia","+11/+12","695786400000"],["-720","Russia","+12/+13","1269741600000"],["-660","Russia","+11/+12","1301191200000"],["-720","-","+12",null]],"Asia/Anadyr":[["-709.9333333333334","-","LMT","-1441152000000"],["-720","-","+12","-1247529600000"],["-780","Russia","+13/+14","386467200000"],["-720","Russia","+12/+13","670384800000"],["-660","Russia","+11/+12","695786400000"],["-720","Russia","+12/+13","1269741600000"],["-660","Russia","+11/+12","1301191200000"],["-720","-","+12",null]],"Europe/Belgrade":[["-82","-","LMT","-2682374400000"],["-60","-","CET","-905821200000"],["-60","C-Eur","CE%sT","-757468800000"],["-60","-","CET","-777938400000"],["-60","1:00","CEST","-766620000000"],["-60","-","CET","407203200000"],["-60","EU","CE%sT",null]],"Europe/Ljubljana":"Europe/Belgrade","Europe/Podgorica":"Europe/Belgrade","Europe/Sarajevo":"Europe/Belgrade","Europe/Skopje":"Europe/Belgrade","Europe/Zagreb":"Europe/Belgrade","Europe/Bratislava":"Europe/Prague","Europe/Madrid":[["14.733333333333334","-","LMT","-2177452800000"],["0","Spain","WE%sT","-733881600000"],["-60","Spain","CE%sT","315446400000"],["-60","EU","CE%sT",null]],"Africa/Ceuta":[["21.26666666666667","-","LMT","-2146003200000"],["0","-","WET","-1630112400000"],["0","1:00","WEST","-1616806800000"],["0","-","WET","-1420156800000"],["0","Spain","WE%sT","-1262390400000"],["0","SpainAfrica","WE%sT","448243200000"],["-60","-","CET","536371200000"],["-60","EU","CE%sT",null]],"Atlantic/Canary":[["61.6","-","LMT","-1509667200000"],["60","-","CANT","-733878000000"],["0","-","WET","323827200000"],["0","1:00","WEST","338950800000"],["0","EU","WE%sT",null]],"Europe/Stockholm":[["-72.2","-","LMT","-2871676800000"],["-60.233333333333334","-","SET","-2208988800000"],["-60","-","CET","-1692493200000"],["-60","1:00","CEST","-1680476400000"],["-60","-","CET","347068800000"],["-60","EU","CE%sT",null]],"Europe/Zurich":[["-34.13333333333333","-","LMT","-3675196800000"],["-29.76666666666667","-","BMT","-2385244800000"],["-60","Swiss","CE%sT","378604800000"],["-60","EU","CE%sT",null]],"Europe/Istanbul":[["-115.86666666666667","-","LMT","-2808604800000"],["-116.93333333333332","-","IMT","-1869868800000"],["-120","Turkey","EE%sT","277257600000"],["-180","Turkey","+03/+04","482803200000"],["-120","Turkey","EE%sT","1199059200000"],["-120","EU","EE%sT","1301187600000"],["-120","-","EET","1301274000000"],["-120","EU","EE%sT","1396141200000"],["-120","-","EET","1396227600000"],["-120","EU","EE%sT","1445734800000"],["-120","1:00","EEST","1446944400000"],["-120","EU","EE%sT","1473206400000"],["-180","-","+03",null]],"Asia/Istanbul":"Europe/Istanbul","Europe/Kiev":[["-122.06666666666668","-","LMT","-2808604800000"],["-122.06666666666668","-","KMT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-892512000000"],["-60","C-Eur","CE%sT","-825379200000"],["-180","Russia","MSK/MSD","646797600000"],["-120","1:00","EEST","686113200000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"Europe/Uzhgorod":[["-89.2","-","LMT","-2500934400000"],["-60","-","CET","-915235200000"],["-60","C-Eur","CE%sT","-796867200000"],["-60","1:00","CEST","-794707200000"],["-60","-","CET","-773452800000"],["-180","Russia","MSK/MSD","662601600000"],["-180","-","MSK","646797600000"],["-60","-","CET","670388400000"],["-120","-","EET","725760000000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"Europe/Zaporozhye":[["-140.66666666666666","-","LMT","-2808604800000"],["-140","-","CUT","-1441152000000"],["-120","-","EET","-1247529600000"],["-180","-","MSK","-894758400000"],["-60","C-Eur","CE%sT","-826416000000"],["-180","Russia","MSK/MSD","670384800000"],["-120","E-Eur","EE%sT","820368000000"],["-120","EU","EE%sT",null]],"EST":[["300","-","EST",null]],"MST":[["420","-","MST",null]],"HST":[["600","-","HST",null]],"EST5EDT":[["300","US","E%sT",null]],"CST6CDT":[["360","US","C%sT",null]],"MST7MDT":[["420","US","M%sT",null]],"PST8PDT":[["480","US","P%sT",null]],"America/New_York":[["296.0333333333333","-","LMT","-2717668562000"],["300","US","E%sT","-1546387200000"],["300","NYC","E%sT","-852163200000"],["300","US","E%sT","-725932800000"],["300","NYC","E%sT","-63244800000"],["300","US","E%sT",null]],"America/Chicago":[["350.6","-","LMT","-2717668236000"],["360","US","C%sT","-1546387200000"],["360","Chicago","C%sT","-1067810400000"],["300","-","EST","-1045432800000"],["360","Chicago","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Chicago","C%sT","-63244800000"],["360","US","C%sT",null]],"America/North_Dakota/Center":[["405.2","-","LMT","-2717667912000"],["420","US","M%sT","719978400000"],["360","US","C%sT",null]],"America/North_Dakota/New_Salem":[["405.65","-","LMT","-2717667939000"],["420","US","M%sT","1067133600000"],["360","US","C%sT",null]],"America/North_Dakota/Beulah":[["407.1166666666667","-","LMT","-2717668027000"],["420","US","M%sT","1289095200000"],["360","US","C%sT",null]],"America/Denver":[["419.93333333333334","-","LMT","-2717668796000"],["420","US","M%sT","-1546387200000"],["420","Denver","M%sT","-852163200000"],["420","US","M%sT","-725932800000"],["420","Denver","M%sT","-63244800000"],["420","US","M%sT",null]],"America/Los_Angeles":[["472.9666666666667","-","LMT","-2717668378000"],["480","US","P%sT","-725932800000"],["480","CA","P%sT","-63244800000"],["480","US","P%sT",null]],"America/Juneau":[["-902.3166666666666","-","LMT","-3225312000000"],["537.6833333333334","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","325648800000"],["540","US","Y%sT","341373600000"],["480","US","P%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Sitka":[["-898.7833333333334","-","LMT","-3225312000000"],["541.2166666666666","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Metlakatla":[["-913.7","-","LMT","-3225312000000"],["526.3","-","LMT","-2188987200000"],["480","-","PST","-852163200000"],["480","US","P%sT","-725932800000"],["480","-","PST","-86400000"],["480","US","P%sT","436327200000"],["480","-","PST","1446343200000"],["540","US","AK%sT",null]],"America/Yakutat":[["-881.0833333333334","-","LMT","-3225312000000"],["558.9166666666666","-","LMT","-2188987200000"],["540","-","YST","-852163200000"],["540","US","Y%sT","-725932800000"],["540","-","YST","-86400000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Anchorage":[["-840.4","-","LMT","-3225312000000"],["599.6","-","LMT","-2188987200000"],["600","-","CAT","-852163200000"],["600","US","CAT/CAWT","-769395600000"],["600","US","CAT/CAPT","-725932800000"],["600","-","CAT","-86918400000"],["600","-","AHST","-86400000"],["600","US","AH%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Nome":[["-778.35","-","LMT","-3225312000000"],["661.6333333333333","-","LMT","-2188987200000"],["660","-","NST","-852163200000"],["660","US","N%sT","-725932800000"],["660","-","NST","-86918400000"],["660","-","BST","-86400000"],["660","US","B%sT","436327200000"],["540","US","Y%sT","438998400000"],["540","US","AK%sT",null]],"America/Adak":[["-733.35","-","LMT","-3225312000000"],["706.6333333333333","-","LMT","-2188987200000"],["660","-","NST","-852163200000"],["660","US","N%sT","-725932800000"],["660","-","NST","-86918400000"],["660","-","BST","-86400000"],["660","US","B%sT","436327200000"],["600","US","AH%sT","438998400000"],["600","US","H%sT",null]],"Pacific/Honolulu":[["631.4333333333334","-","LMT","-2334139200000"],["630","-","HST","-1157320800000"],["630","1:00","HDT","-1155470400000"],["630","-","HST","-880236000000"],["630","1:00","HDT","-765410400000"],["630","-","HST","-712188000000"],["600","-","HST",null]],"Pacific/Johnston":"Pacific/Honolulu","America/Phoenix":[["448.3","-","LMT","-2717670498000"],["420","US","M%sT","-820540740000"],["420","-","MST","-812678340000"],["420","US","M%sT","-796867140000"],["420","-","MST","-63244800000"],["420","US","M%sT","-56246400000"],["420","-","MST",null]],"America/Boise":[["464.81666666666666","-","LMT","-2717667889000"],["480","US","P%sT","-1471816800000"],["420","US","M%sT","157680000000"],["420","-","MST","129088800000"],["420","US","M%sT",null]],"America/Indiana/Indianapolis":[["344.6333333333333","-","LMT","-2717667878000"],["360","US","C%sT","-1546387200000"],["360","Indianapolis","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Indianapolis","C%sT","-463615200000"],["300","-","EST","-386805600000"],["360","-","CST","-368661600000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Indiana/Marengo":[["345.3833333333333","-","LMT","-2717667923000"],["360","US","C%sT","-568166400000"],["360","Marengo","C%sT","-273708000000"],["300","-","EST","-86400000"],["300","US","E%sT","126669600000"],["360","1:00","CDT","152071200000"],["300","US","E%sT","220838400000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Indiana/Vincennes":[["350.1166666666667","-","LMT","-2717668207000"],["360","US","C%sT","-725932800000"],["360","Vincennes","C%sT","-179359200000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT","1194141600000"],["300","US","E%sT",null]],"America/Indiana/Tell_City":[["347.05","-","LMT","-2717668023000"],["360","US","C%sT","-725932800000"],["360","Perry","C%sT","-179359200000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT",null]],"America/Indiana/Petersburg":[["349.1166666666667","-","LMT","-2717668147000"],["360","US","C%sT","-441936000000"],["360","Pike","C%sT","-147909600000"],["300","-","EST","-100130400000"],["360","US","C%sT","247024800000"],["300","-","EST","1143943200000"],["360","US","C%sT","1194141600000"],["300","US","E%sT",null]],"America/Indiana/Knox":[["346.5","-","LMT","-2717667990000"],["360","US","C%sT","-694396800000"],["360","Starke","C%sT","-242258400000"],["300","-","EST","-195084000000"],["360","US","C%sT","688528800000"],["300","-","EST","1143943200000"],["360","US","C%sT",null]],"America/Indiana/Winamac":[["346.4166666666667","-","LMT","-2717667985000"],["360","US","C%sT","-725932800000"],["360","Pulaski","C%sT","-273708000000"],["300","-","EST","-86400000"],["300","US","E%sT","62985600000"],["300","-","EST","1143943200000"],["360","US","C%sT","1173578400000"],["300","US","E%sT",null]],"America/Indiana/Vevay":[["340.2666666666667","-","LMT","-2717667616000"],["360","US","C%sT","-495064800000"],["300","-","EST","-86400000"],["300","US","E%sT","126144000000"],["300","-","EST","1167523200000"],["300","US","E%sT",null]],"America/Kentucky/Louisville":[["343.0333333333333","-","LMT","-2717667782000"],["360","US","C%sT","-1514851200000"],["360","Louisville","C%sT","-852163200000"],["360","US","C%sT","-725932800000"],["360","Louisville","C%sT","-266450400000"],["300","-","EST","-31622400000"],["300","US","E%sT","126669600000"],["360","1:00","CDT","152071200000"],["300","US","E%sT",null]],"America/Kentucky/Monticello":[["339.4","-","LMT","-2717667564000"],["360","US","C%sT","-725932800000"],["360","-","CST","-31622400000"],["360","US","C%sT","972784800000"],["300","US","E%sT",null]],"America/Detroit":[["332.18333333333334","-","LMT","-2019772800000"],["360","-","CST","-1724104800000"],["300","-","EST","-852163200000"],["300","US","E%sT","-725932800000"],["300","Detroit","E%sT","126144000000"],["300","US","E%sT","189216000000"],["300","-","EST","167796000000"],["300","US","E%sT",null]],"America/Menominee":[["350.45","-","LMT","-2659780800000"],["360","US","C%sT","-725932800000"],["360","Menominee","C%sT","-21506400000"],["300","-","EST","104896800000"],["360","US","C%sT",null]],"America/St_Johns":[["210.86666666666665","-","LMT","-2682374400000"],["210.86666666666665","StJohns","N%sT","-1609545600000"],["210.86666666666665","Canada","N%sT","-1578009600000"],["210.86666666666665","StJohns","N%sT","-1096934400000"],["210","StJohns","N%sT","-872380800000"],["210","Canada","N%sT","-725932800000"],["210","StJohns","N%sT","1320105600000"],["210","Canada","N%sT",null]],"America/Goose_Bay":[["241.66666666666666","-","LMT","-2682374400000"],["210.86666666666665","-","NST","-1609545600000"],["210.86666666666665","Canada","N%sT","-1578009600000"],["210.86666666666665","-","NST","-1096934400000"],["210","-","NST","-1041465600000"],["210","StJohns","N%sT","-872380800000"],["210","Canada","N%sT","-725932800000"],["210","StJohns","N%sT","-119916000000"],["240","StJohns","A%sT","1320105600000"],["240","Canada","A%sT",null]],"America/Halifax":[["254.4","-","LMT","-2131660800000"],["240","Halifax","A%sT","-1609545600000"],["240","Canada","A%sT","-1578009600000"],["240","Halifax","A%sT","-880236000000"],["240","Canada","A%sT","-725932800000"],["240","Halifax","A%sT","157680000000"],["240","Canada","A%sT",null]],"America/Glace_Bay":[["239.8","-","LMT","-2131660800000"],["240","Canada","A%sT","-505008000000"],["240","Halifax","A%sT","-473472000000"],["240","-","AST","94608000000"],["240","Halifax","A%sT","157680000000"],["240","Canada","A%sT",null]],"America/Moncton":[["259.1333333333333","-","LMT","-2715897600000"],["300","-","EST","-2131660800000"],["240","Canada","A%sT","-1136160000000"],["240","Moncton","A%sT","-852163200000"],["240","Canada","A%sT","-725932800000"],["240","Moncton","A%sT","126144000000"],["240","Canada","A%sT","757296000000"],["240","Moncton","A%sT","1199059200000"],["240","Canada","A%sT",null]],"America/Blanc-Sablon":[["228.46666666666667","-","LMT","-2682374400000"],["240","Canada","A%sT","31449600000"],["240","-","AST",null]],"America/Toronto":[["317.5333333333333","-","LMT","-2335305600000"],["300","Canada","E%sT","-1578009600000"],["300","Toronto","E%sT","-880236000000"],["300","Canada","E%sT","-725932800000"],["300","Toronto","E%sT","157680000000"],["300","Canada","E%sT",null]],"America/Thunder_Bay":[["357","-","LMT","-2335305600000"],["360","-","CST","-1862006400000"],["300","-","EST","-852163200000"],["300","Canada","E%sT","31449600000"],["300","Toronto","E%sT","126144000000"],["300","-","EST","157680000000"],["300","Canada","E%sT",null]],"America/Nipigon":[["353.06666666666666","-","LMT","-2335305600000"],["300","Canada","E%sT","-923270400000"],["300","1:00","EDT","-880236000000"],["300","Canada","E%sT",null]],"America/Rainy_River":[["378.2666666666667","-","LMT","-2335305600000"],["360","Canada","C%sT","-923270400000"],["360","1:00","CDT","-880236000000"],["360","Canada","C%sT",null]],"America/Atikokan":[["366.4666666666667","-","LMT","-2335305600000"],["360","Canada","C%sT","-923270400000"],["360","1:00","CDT","-880236000000"],["360","Canada","C%sT","-765410400000"],["300","-","EST",null]],"America/Winnipeg":[["388.6","-","LMT","-2602281600000"],["360","Winn","C%sT","1167523200000"],["360","Canada","C%sT",null]],"America/Regina":[["418.6","-","LMT","-2030227200000"],["420","Regina","M%sT","-307749600000"],["360","-","CST",null]],"America/Swift_Current":[["431.3333333333333","-","LMT","-2030227200000"],["420","Canada","M%sT","-749599200000"],["420","Regina","M%sT","-599702400000"],["420","Swift","M%sT","70941600000"],["360","-","CST",null]],"America/Edmonton":[["453.8666666666667","-","LMT","-1998691200000"],["420","Edm","M%sT","567907200000"],["420","Canada","M%sT",null]],"America/Vancouver":[["492.4666666666667","-","LMT","-2682374400000"],["480","Vanc","P%sT","567907200000"],["480","Canada","P%sT",null]],"America/Dawson_Creek":[["480.93333333333334","-","LMT","-2682374400000"],["480","Canada","P%sT","-694396800000"],["480","Vanc","P%sT","83988000000"],["420","-","MST",null]],"America/Fort_Nelson":[["490.7833333333333","-","LMT","-2682374400000"],["480","Vanc","P%sT","-725932800000"],["480","-","PST","-694396800000"],["480","Vanc","P%sT","567907200000"],["480","Canada","P%sT","1425780000000"],["420","-","MST",null]],"America/Creston":[["466.06666666666666","-","LMT","-2682374400000"],["420","-","MST","-1680480000000"],["480","-","PST","-1627862400000"],["420","-","MST",null]],"America/Pangnirtung":[["0","-","-00","-1514851200000"],["240","NT_YK","A%sT","796701600000"],["300","Canada","E%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","Canada","E%sT",null]],"America/Iqaluit":[["0","-","-00","-865296000000"],["300","NT_YK","E%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","Canada","E%sT",null]],"America/Resolute":[["0","-","-00","-704937600000"],["360","NT_YK","C%sT","972784800000"],["300","-","EST","986094000000"],["360","Canada","C%sT","1162087200000"],["300","-","EST","1173582000000"],["360","Canada","C%sT",null]],"America/Rankin_Inlet":[["0","-","-00","-378777600000"],["360","NT_YK","C%sT","972784800000"],["300","-","EST","986094000000"],["360","Canada","C%sT",null]],"America/Cambridge_Bay":[["0","-","-00","-1546387200000"],["420","NT_YK","M%sT","941335200000"],["360","Canada","C%sT","972784800000"],["300","-","EST","973382400000"],["360","-","CST","986094000000"],["420","Canada","M%sT",null]],"America/Yellowknife":[["0","-","-00","-1073088000000"],["420","NT_YK","M%sT","347068800000"],["420","Canada","M%sT",null]],"America/Inuvik":[["0","-","-00","-505008000000"],["480","NT_YK","P%sT","291780000000"],["420","NT_YK","M%sT","347068800000"],["420","Canada","M%sT",null]],"America/Whitehorse":[["540.2","-","LMT","-2189030400000"],["540","NT_YK","Y%sT","-81993600000"],["480","NT_YK","P%sT","347068800000"],["480","Canada","P%sT",null]],"America/Dawson":[["557.6666666666666","-","LMT","-2189030400000"],["540","NT_YK","Y%sT","120614400000"],["480","NT_YK","P%sT","347068800000"],["480","Canada","P%sT",null]],"America/Cancun":[["347.06666666666666","-","LMT","-1514764024000"],["360","-","CST","377913600000"],["300","Mexico","E%sT","902023200000"],["360","Mexico","C%sT","1422756000000"],["300","-","EST",null]],"America/Merida":[["358.4666666666667","-","LMT","-1514764708000"],["360","-","CST","377913600000"],["300","-","EST","407635200000"],["360","Mexico","C%sT",null]],"America/Matamoros":[["400","-","LMT","-1514767200000"],["360","-","CST","599529600000"],["360","US","C%sT","631065600000"],["360","Mexico","C%sT","1293753600000"],["360","US","C%sT",null]],"America/Monterrey":[["401.2666666666667","-","LMT","-1514767276000"],["360","-","CST","599529600000"],["360","US","C%sT","631065600000"],["360","Mexico","C%sT",null]],"America/Mexico_City":[["396.6","-","LMT","-1514763396000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","Mexico","C%sT","1001815200000"],["360","-","CST","1014163200000"],["360","Mexico","C%sT",null]],"America/Ojinaga":[["417.6666666666667","-","LMT","-1514764660000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","851990400000"],["360","Mexico","C%sT","915062400000"],["360","-","CST","891399600000"],["420","Mexico","M%sT","1293753600000"],["420","US","M%sT",null]],"America/Chihuahua":[["424.3333333333333","-","LMT","-1514765060000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","851990400000"],["360","Mexico","C%sT","915062400000"],["360","-","CST","891399600000"],["420","Mexico","M%sT",null]],"America/Hermosillo":[["443.8666666666667","-","LMT","-1514766232000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT","946598400000"],["420","-","MST",null]],"America/Mazatlan":[["425.6666666666667","-","LMT","-1514765140000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT",null]],"America/Bahia_Banderas":[["421","-","LMT","-1514764860000"],["420","-","MST","-1343091600000"],["360","-","CST","-1234828800000"],["420","-","MST","-1220317200000"],["360","-","CST","-1207180800000"],["420","-","MST","-1191369600000"],["360","-","CST","-873849600000"],["420","-","MST","-661564800000"],["480","-","PST","31449600000"],["420","Mexico","M%sT","1270346400000"],["360","Mexico","C%sT",null]],"America/Tijuana":[["468.06666666666666","-","LMT","-1514764084000"],["420","-","MST","-1420156800000"],["480","-","PST","-1343091600000"],["420","-","MST","-1234828800000"],["480","-","PST","-1222992000000"],["480","1:00","PDT","-1207267200000"],["480","-","PST","-873849600000"],["480","1:00","PWT","-769395600000"],["480","1:00","PPT","-761702400000"],["480","-","PST","-686102400000"],["480","1:00","PDT","-661564800000"],["480","-","PST","-473472000000"],["480","CA","P%sT","-252547200000"],["480","-","PST","220838400000"],["480","US","P%sT","851990400000"],["480","Mexico","P%sT","1009756800000"],["480","US","P%sT","1014163200000"],["480","Mexico","P%sT","1293753600000"],["480","US","P%sT",null]],"America/Nassau":[["309.5","-","LMT","-1825113600000"],["300","Bahamas","E%sT","220838400000"],["300","US","E%sT",null]],"America/Barbados":[["238.48333333333335","-","LMT","-1420156800000"],["238.48333333333335","-","BMT","-1167696000000"],["240","Barb","A%sT",null]],"America/Belize":[["352.8","-","LMT","-1822521600000"],["360","Belize","C%sT",null]],"Atlantic/Bermuda":[["259.3","-","LMT","-1262296800000"],["240","-","AST","136346400000"],["240","Canada","A%sT","220838400000"],["240","US","A%sT",null]],"America/Costa_Rica":[["336.2166666666667","-","LMT","-2493072000000"],["336.2166666666667","-","SJMT","-1545091200000"],["360","CR","C%sT",null]],"America/Havana":[["329.4666666666667","-","LMT","-2493072000000"],["329.6","-","HMT","-1402833600000"],["300","Cuba","C%sT",null]],"America/Santo_Domingo":[["279.6","-","LMT","-2493072000000"],["280","-","SDMT","-1159790400000"],["300","DR","E%sT","152064000000"],["240","-","AST","972784800000"],["300","US","E%sT","975805200000"],["240","-","AST",null]],"America/El_Salvador":[["356.8","-","LMT","-1514851200000"],["360","Salv","C%sT",null]],"America/Guatemala":[["362.06666666666666","-","LMT","-1617062400000"],["360","Guat","C%sT",null]],"America/Port-au-Prince":[["289.3333333333333","-","LMT","-2493072000000"],["289","-","PPMT","-1670500800000"],["300","Haiti","E%sT",null]],"America/Tegucigalpa":[["348.8666666666667","-","LMT","-1538524800000"],["360","Hond","C%sT",null]],"America/Jamaica":[["307.18333333333334","-","LMT","-2493072000000"],["307.18333333333334","-","KMT","-1827705600000"],["300","-","EST","157680000000"],["300","US","E%sT","473299200000"],["300","-","EST",null]],"America/Martinique":[["244.33333333333334","-","LMT","-2493072000000"],["244.33333333333334","-","FFMT","-1851552000000"],["240","-","AST","323827200000"],["240","1:00","ADT","338947200000"],["240","-","AST",null]],"America/Managua":[["345.1333333333333","-","LMT","-2493072000000"],["345.2","-","MMT","-1121126400000"],["360","-","CST","105062400000"],["300","-","EST","161740800000"],["360","Nic","C%sT","694238400000"],["300","-","EST","717292800000"],["360","-","CST","757296000000"],["300","-","EST","883526400000"],["360","Nic","C%sT",null]],"America/Panama":[["318.1333333333333","-","LMT","-2493072000000"],["319.6","-","CMT","-1946937600000"],["300","-","EST",null]],"America/Cayman":"America/Panama","America/Puerto_Rico":[["264.4166666666667","-","LMT","-2233051200000"],["240","-","AST","-873072000000"],["240","US","A%sT","-725932800000"],["240","-","AST",null]],"America/Miquelon":[["224.66666666666666","-","LMT","-1850342400000"],["240","-","AST","325987200000"],["180","-","PMST","567907200000"],["180","Canada","PM%sT",null]],"America/Grand_Turk":[["284.5333333333333","-","LMT","-2493072000000"],["307.18333333333334","-","KMT","-1827705600000"],["300","-","EST","315446400000"],["300","US","E%sT","1446343200000"],["240","-","AST",null]],"US/Pacific-New":"America/Los_Angeles","America/Argentina/Buenos_Aires":[["233.8","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT",null]],"America/Argentina/Cordoba":[["256.8","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT",null]],"America/Argentina/Salta":[["261.66666666666663","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Tucuman":[["260.8666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087084800000"],["180","Arg","AR%sT",null]],"America/Argentina/La_Rioja":[["267.4","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667785600000"],["240","-","WART","673574400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/San_Juan":[["274.06666666666666","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667785600000"],["240","-","WART","673574400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085961600000"],["240","-","WART","1090713600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Jujuy":[["261.2","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","636508800000"],["240","-","WART","657072000000"],["240","1:00","WARST","669168000000"],["240","-","WART","686707200000"],["180","1:00","ARST","725760000000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Catamarca":[["263.1333333333333","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","667958400000"],["240","-","WART","687916800000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Mendoza":[["275.2666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","636508800000"],["240","-","WART","655948800000"],["240","1:00","WARST","667785600000"],["240","-","WART","687484800000"],["240","1:00","WARST","699408000000"],["240","-","WART","719366400000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085270400000"],["240","-","WART","1096156800000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/San_Luis":[["265.4","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","662601600000"],["180","1:00","ARST","637372800000"],["240","-","WART","655948800000"],["240","1:00","WARST","667785600000"],["240","-","WART","675734400000"],["180","-","ART","938908800000"],["240","1:00","WARST","952041600000"],["180","-","ART","1085961600000"],["240","-","WART","1090713600000"],["180","Arg","AR%sT","1200873600000"],["240","SanLuis","WAR%sT","1255219200000"],["180","-","ART",null]],"America/Argentina/Rio_Gallegos":[["276.8666666666667","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1086048000000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Argentina/Ushuaia":[["273.2","-","LMT","-2372112000000"],["256.8","-","CMT","-1567468800000"],["240","-","ART","-1233446400000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","938908800000"],["240","Arg","AR%sT","952041600000"],["180","-","ART","1085875200000"],["240","-","WART","1087689600000"],["180","Arg","AR%sT","1224288000000"],["180","-","ART",null]],"America/Aruba":"America/Curacao","America/La_Paz":[["272.6","-","LMT","-2493072000000"],["272.6","-","CMT","-1205971200000"],["272.6","1:00","BOST","-1192320000000"],["240","-","BOT",null]],"America/Noronha":[["129.66666666666669","-","LMT","-1735776000000"],["120","Brazil","FN%sT","653529600000"],["120","-","FNT","938649600000"],["120","Brazil","FN%sT","971568000000"],["120","-","FNT","1000339200000"],["120","Brazil","FN%sT","1033430400000"],["120","-","FNT",null]],"America/Belem":[["193.93333333333334","-","LMT","-1735776000000"],["180","Brazil","BR%sT","590025600000"],["180","-","BRT",null]],"America/Santarem":[["218.8","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","1214265600000"],["180","-","BRT",null]],"America/Fortaleza":[["154","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","972172800000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Recife":[["139.6","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","971568000000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Araguaina":[["192.8","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","811036800000"],["180","Brazil","BR%sT","1064361600000"],["180","-","BRT","1350777600000"],["180","Brazil","BR%sT","1377993600000"],["180","-","BRT",null]],"America/Maceio":[["142.86666666666665","-","LMT","-1735776000000"],["180","Brazil","BR%sT","653529600000"],["180","-","BRT","813542400000"],["180","Brazil","BR%sT","841795200000"],["180","-","BRT","938649600000"],["180","Brazil","BR%sT","972172800000"],["180","-","BRT","1000339200000"],["180","Brazil","BR%sT","1033430400000"],["180","-","BRT",null]],"America/Bahia":[["154.06666666666666","-","LMT","-1735776000000"],["180","Brazil","BR%sT","1064361600000"],["180","-","BRT","1318723200000"],["180","Brazil","BR%sT","1350777600000"],["180","-","BRT",null]],"America/Sao_Paulo":[["186.46666666666667","-","LMT","-1735776000000"],["180","Brazil","BR%sT","-195436800000"],["180","1:00","BRST","-157852800000"],["180","Brazil","BR%sT",null]],"America/Campo_Grande":[["218.46666666666667","-","LMT","-1735776000000"],["240","Brazil","AM%sT",null]],"America/Cuiaba":[["224.33333333333334","-","LMT","-1735776000000"],["240","Brazil","AM%sT","1064361600000"],["240","-","AMT","1096588800000"],["240","Brazil","AM%sT",null]],"America/Porto_Velho":[["255.6","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT",null]],"America/Boa_Vista":[["242.66666666666666","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","938649600000"],["240","Brazil","AM%sT","971568000000"],["240","-","AMT",null]],"America/Manaus":[["240.06666666666666","-","LMT","-1735776000000"],["240","Brazil","AM%sT","590025600000"],["240","-","AMT","749174400000"],["240","Brazil","AM%sT","780192000000"],["240","-","AMT",null]],"America/Eirunepe":[["279.4666666666667","-","LMT","-1735776000000"],["300","Brazil","AC%sT","590025600000"],["300","-","ACT","749174400000"],["300","Brazil","AC%sT","780192000000"],["300","-","ACT","1214265600000"],["240","-","AMT","1384041600000"],["300","-","ACT",null]],"America/Rio_Branco":[["271.2","-","LMT","-1735776000000"],["300","Brazil","AC%sT","590025600000"],["300","-","ACT","1214265600000"],["240","-","AMT","1384041600000"],["300","-","ACT",null]],"America/Santiago":[["282.7666666666667","-","LMT","-2493072000000"],["282.7666666666667","-","SMT","-1892678400000"],["300","-","CLT","-1688428800000"],["282.7666666666667","-","SMT","-1619222400000"],["240","-","CLT","-1593820800000"],["282.7666666666667","-","SMT","-1336003200000"],["300","Chile","CL%sT","-1178150400000"],["240","-","CLT","-870566400000"],["300","-","CLT","-865296000000"],["240","-","CLT","-740534400000"],["240","1:00","CLST","-736387200000"],["240","-","CLT","-718070400000"],["300","-","CLT","-713667600000"],["240","Chile","CL%sT",null]],"Pacific/Easter":[["437.4666666666667","-","LMT","-2493072000000"],["437.4666666666667","-","EMT","-1178150400000"],["420","Chile","EAS%sT","384922800000"],["360","Chile","EAS%sT",null]],"Antarctica/Palmer":[["0","-","-00","-126316800000"],["240","Arg","AR%sT","-7603200000"],["180","Arg","AR%sT","389059200000"],["240","Chile","CL%sT",null]],"America/Bogota":[["296.2666666666667","-","LMT","-2707689600000"],["296.2666666666667","-","BMT","-1739059200000"],["300","CO","CO%sT",null]],"America/Curacao":[["275.7833333333333","-","LMT","-1826755200000"],["270","-","ANT","-126316800000"],["240","-","AST",null]],"America/Lower_Princes":"America/Curacao","America/Kralendijk":"America/Curacao","America/Guayaquil":[["319.3333333333333","-","LMT","-2493072000000"],["314","-","QMT","-1199318400000"],["300","-","ECT",null]],"Pacific/Galapagos":[["358.4","-","LMT","-1199318400000"],["300","-","ECT","536371200000"],["360","-","GALT",null]],"Atlantic/Stanley":[["231.4","-","LMT","-2493072000000"],["231.4","-","SMT","-1824249600000"],["240","Falk","FK%sT","420595200000"],["180","Falk","FK%sT","495590400000"],["240","Falk","FK%sT","1283652000000"],["180","-","FKST",null]],"America/Cayenne":[["209.33333333333334","-","LMT","-1846281600000"],["240","-","GFT","-71107200000"],["180","-","GFT",null]],"America/Guyana":[["232.66666666666666","-","LMT","-1730592000000"],["225","-","GBGT","-113702400000"],["225","-","GYT","175996800000"],["180","-","GYT","694137600000"],["240","-","GYT",null]],"America/Asuncion":[["230.66666666666666","-","LMT","-2493072000000"],["230.66666666666666","-","AMT","-1206403200000"],["240","-","PYT","86745600000"],["180","-","PYT","134006400000"],["240","Para","PY%sT",null]],"America/Lima":[["308.2","-","LMT","-2493072000000"],["308.6","-","LMT","-1938556800000"],["300","Peru","PE%sT",null]],"Atlantic/South_Georgia":[["146.13333333333335","-","LMT","-2493072000000"],["120","-","GST",null]],"America/Paramaribo":[["220.66666666666666","-","LMT","-1830470400000"],["220.86666666666665","-","PMT","-1073088000000"],["220.6","-","PMT","-765331200000"],["210","-","NEGT","185673600000"],["210","-","SRT","465436800000"],["180","-","SRT",null]],"America/Port_of_Spain":[["246.06666666666666","-","LMT","-1825113600000"],["240","-","AST",null]],"America/Anguilla":"America/Port_of_Spain","America/Antigua":"America/Port_of_Spain","America/Dominica":"America/Port_of_Spain","America/Grenada":"America/Port_of_Spain","America/Guadeloupe":"America/Port_of_Spain","America/Marigot":"America/Port_of_Spain","America/Montserrat":"America/Port_of_Spain","America/St_Barthelemy":"America/Port_of_Spain","America/St_Kitts":"America/Port_of_Spain","America/St_Lucia":"America/Port_of_Spain","America/St_Thomas":"America/Port_of_Spain","America/St_Vincent":"America/Port_of_Spain","America/Tortola":"America/Port_of_Spain","America/Montevideo":[["224.73333333333335","-","LMT","-2256681600000"],["224.73333333333335","-","MMT","-1567468800000"],["210","Uruguay","UY%sT","-853632000000"],["180","Uruguay","UY%sT",null]],"America/Caracas":[["267.7333333333333","-","LMT","-2493072000000"],["267.6666666666667","-","CMT","-1826755200000"],["270","-","VET","-157766400000"],["240","-","VET","1197169200000"],["270","-","VET","1462069800000"],["240","-","VET",null]]},"rules":{"Algeria":[["1916","only","-","Jun","14",["23","0","0","s"],"60","S"],["1916","1919","-","Oct","Sun>=1",["23","0","0","s"],"0","-"],["1917","only","-","Mar","24",["23","0","0","s"],"60","S"],["1918","only","-","Mar","9",["23","0","0","s"],"60","S"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Jun","21",["23","0","0","s"],"0","-"],["1939","only","-","Sep","11",["23","0","0","s"],"60","S"],["1939","only","-","Nov","19",["1","0","0",null],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0",null],"60","S"],["1944","only","-","Oct","8",["2","0","0",null],"0","-"],["1945","only","-","Sep","16",["1","0","0",null],"0","-"],["1971","only","-","Apr","25",["23","0","0","s"],"60","S"],["1971","only","-","Sep","26",["23","0","0","s"],"0","-"],["1977","only","-","May","6",["0","0","0",null],"60","S"],["1977","only","-","Oct","21",["0","0","0",null],"0","-"],["1978","only","-","Mar","24",["1","0","0",null],"60","S"],["1978","only","-","Sep","22",["3","0","0",null],"0","-"],["1980","only","-","Apr","25",["0","0","0",null],"60","S"],["1980","only","-","Oct","31",["2","0","0",null],"0","-"]],"Egypt":[["1940","only","-","Jul","15",["0","0","0",null],"60","S"],["1940","only","-","Oct","1",["0","0","0",null],"0","-"],["1941","only","-","Apr","15",["0","0","0",null],"60","S"],["1941","only","-","Sep","16",["0","0","0",null],"0","-"],["1942","1944","-","Apr","1",["0","0","0",null],"60","S"],["1942","only","-","Oct","27",["0","0","0",null],"0","-"],["1943","1945","-","Nov","1",["0","0","0",null],"0","-"],["1945","only","-","Apr","16",["0","0","0",null],"60","S"],["1957","only","-","May","10",["0","0","0",null],"60","S"],["1957","1958","-","Oct","1",["0","0","0",null],"0","-"],["1958","only","-","May","1",["0","0","0",null],"60","S"],["1959","1981","-","May","1",["1","0","0",null],"60","S"],["1959","1965","-","Sep","30",["3","0","0",null],"0","-"],["1966","1994","-","Oct","1",["3","0","0",null],"0","-"],["1982","only","-","Jul","25",["1","0","0",null],"60","S"],["1983","only","-","Jul","12",["1","0","0",null],"60","S"],["1984","1988","-","May","1",["1","0","0",null],"60","S"],["1989","only","-","May","6",["1","0","0",null],"60","S"],["1990","1994","-","May","1",["1","0","0",null],"60","S"],["1995","2010","-","Apr","lastFri",["0","0","0","s"],"60","S"],["1995","2005","-","Sep","lastThu",["24","0","0",null],"0","-"],["2006","only","-","Sep","21",["24","0","0",null],"0","-"],["2007","only","-","Sep","Thu>=1",["24","0","0",null],"0","-"],["2008","only","-","Aug","lastThu",["24","0","0",null],"0","-"],["2009","only","-","Aug","20",["24","0","0",null],"0","-"],["2010","only","-","Aug","10",["24","0","0",null],"0","-"],["2010","only","-","Sep","9",["24","0","0",null],"60","S"],["2010","only","-","Sep","lastThu",["24","0","0",null],"0","-"],["2014","only","-","May","15",["24","0","0",null],"60","S"],["2014","only","-","Jun","26",["24","0","0",null],"0","-"],["2014","only","-","Jul","31",["24","0","0",null],"60","S"],["2014","only","-","Sep","lastThu",["24","0","0",null],"0","-"]],"Ghana":[["1920","1942","-","Sep","1",["0","0","0",null],"20","GHST"],["1920","1942","-","Dec","31",["0","0","0",null],"0","GMT"]],"Libya":[["1951","only","-","Oct","14",["2","0","0",null],"60","S"],["1952","only","-","Jan","1",["0","0","0",null],"0","-"],["1953","only","-","Oct","9",["2","0","0",null],"60","S"],["1954","only","-","Jan","1",["0","0","0",null],"0","-"],["1955","only","-","Sep","30",["0","0","0",null],"60","S"],["1956","only","-","Jan","1",["0","0","0",null],"0","-"],["1982","1984","-","Apr","1",["0","0","0",null],"60","S"],["1982","1985","-","Oct","1",["0","0","0",null],"0","-"],["1985","only","-","Apr","6",["0","0","0",null],"60","S"],["1986","only","-","Apr","4",["0","0","0",null],"60","S"],["1986","only","-","Oct","3",["0","0","0",null],"0","-"],["1987","1989","-","Apr","1",["0","0","0",null],"60","S"],["1987","1989","-","Oct","1",["0","0","0",null],"0","-"],["1997","only","-","Apr","4",["0","0","0",null],"60","S"],["1997","only","-","Oct","4",["0","0","0",null],"0","-"],["2013","only","-","Mar","lastFri",["1","0","0",null],"60","S"],["2013","only","-","Oct","lastFri",["2","0","0",null],"0","-"]],"Mauritius":[["1982","only","-","Oct","10",["0","0","0",null],"60","S"],["1983","only","-","Mar","21",["0","0","0",null],"0","-"],["2008","only","-","Oct","lastSun",["2","0","0",null],"60","S"],["2009","only","-","Mar","lastSun",["2","0","0",null],"0","-"]],"Morocco":[["1939","only","-","Sep","12",["0","0","0",null],"60","S"],["1939","only","-","Nov","19",["0","0","0",null],"0","-"],["1940","only","-","Feb","25",["0","0","0",null],"60","S"],["1945","only","-","Nov","18",["0","0","0",null],"0","-"],["1950","only","-","Jun","11",["0","0","0",null],"60","S"],["1950","only","-","Oct","29",["0","0","0",null],"0","-"],["1967","only","-","Jun","3",["12","0","0",null],"60","S"],["1967","only","-","Oct","1",["0","0","0",null],"0","-"],["1974","only","-","Jun","24",["0","0","0",null],"60","S"],["1974","only","-","Sep","1",["0","0","0",null],"0","-"],["1976","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Aug","1",["0","0","0",null],"0","-"],["1977","only","-","Sep","28",["0","0","0",null],"0","-"],["1978","only","-","Jun","1",["0","0","0",null],"60","S"],["1978","only","-","Aug","4",["0","0","0",null],"0","-"],["2008","only","-","Jun","1",["0","0","0",null],"60","S"],["2008","only","-","Sep","1",["0","0","0",null],"0","-"],["2009","only","-","Jun","1",["0","0","0",null],"60","S"],["2009","only","-","Aug","21",["0","0","0",null],"0","-"],["2010","only","-","May","2",["0","0","0",null],"60","S"],["2010","only","-","Aug","8",["0","0","0",null],"0","-"],["2011","only","-","Apr","3",["0","0","0",null],"60","S"],["2011","only","-","Jul","31",["0","0","0",null],"0","-"],["2012","2013","-","Apr","lastSun",["2","0","0",null],"60","S"],["2012","only","-","Jul","20",["3","0","0",null],"0","-"],["2012","only","-","Aug","20",["2","0","0",null],"60","S"],["2012","only","-","Sep","30",["3","0","0",null],"0","-"],["2013","only","-","Jul","7",["3","0","0",null],"0","-"],["2013","only","-","Aug","10",["2","0","0",null],"60","S"],["2013","max","-","Oct","lastSun",["3","0","0",null],"0","-"],["2014","2021","-","Mar","lastSun",["2","0","0",null],"60","S"],["2014","only","-","Jun","28",["3","0","0",null],"0","-"],["2014","only","-","Aug","2",["2","0","0",null],"60","S"],["2015","only","-","Jun","14",["3","0","0",null],"0","-"],["2015","only","-","Jul","19",["2","0","0",null],"60","S"],["2016","only","-","Jun","5",["3","0","0",null],"0","-"],["2016","only","-","Jul","10",["2","0","0",null],"60","S"],["2017","only","-","May","21",["3","0","0",null],"0","-"],["2017","only","-","Jul","2",["2","0","0",null],"60","S"],["2018","only","-","May","13",["3","0","0",null],"0","-"],["2018","only","-","Jun","17",["2","0","0",null],"60","S"],["2019","only","-","May","5",["3","0","0",null],"0","-"],["2019","only","-","Jun","9",["2","0","0",null],"60","S"],["2020","only","-","Apr","19",["3","0","0",null],"0","-"],["2020","only","-","May","24",["2","0","0",null],"60","S"],["2021","only","-","Apr","11",["3","0","0",null],"0","-"],["2021","only","-","May","16",["2","0","0",null],"60","S"],["2022","only","-","May","8",["2","0","0",null],"60","S"],["2023","only","-","Apr","23",["2","0","0",null],"60","S"],["2024","only","-","Apr","14",["2","0","0",null],"60","S"],["2025","only","-","Apr","6",["2","0","0",null],"60","S"],["2026","max","-","Mar","lastSun",["2","0","0",null],"60","S"],["2036","only","-","Oct","19",["3","0","0",null],"0","-"],["2037","only","-","Oct","4",["3","0","0",null],"0","-"]],"Namibia":[["1994","max","-","Sep","Sun>=1",["2","0","0",null],"60","S"],["1995","max","-","Apr","Sun>=1",["2","0","0",null],"0","-"]],"SA":[["1942","1943","-","Sep","Sun>=15",["2","0","0",null],"60","-"],["1943","1944","-","Mar","Sun>=15",["2","0","0",null],"0","-"]],"Sudan":[["1970","only","-","May","1",["0","0","0",null],"60","S"],["1970","1985","-","Oct","15",["0","0","0",null],"0","-"],["1971","only","-","Apr","30",["0","0","0",null],"60","S"],["1972","1985","-","Apr","lastSun",["0","0","0",null],"60","S"]],"Tunisia":[["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","25",["23","0","0","s"],"60","S"],["1941","only","-","Oct","6",["0","0","0",null],"0","-"],["1942","only","-","Mar","9",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","29",["2","0","0",null],"60","S"],["1943","only","-","Apr","17",["2","0","0",null],"0","-"],["1943","only","-","Apr","25",["2","0","0",null],"60","S"],["1943","only","-","Oct","4",["2","0","0",null],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0",null],"60","S"],["1944","only","-","Oct","8",["0","0","0",null],"0","-"],["1945","only","-","Sep","16",["0","0","0",null],"0","-"],["1977","only","-","Apr","30",["0","0","0","s"],"60","S"],["1977","only","-","Sep","24",["0","0","0","s"],"0","-"],["1978","only","-","May","1",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1988","only","-","Jun","1",["0","0","0","s"],"60","S"],["1988","1990","-","Sep","lastSun",["0","0","0","s"],"0","-"],["1989","only","-","Mar","26",["0","0","0","s"],"60","S"],["1990","only","-","May","1",["0","0","0","s"],"60","S"],["2005","only","-","May","1",["0","0","0","s"],"60","S"],["2005","only","-","Sep","30",["1","0","0","s"],"0","-"],["2006","2008","-","Mar","lastSun",["2","0","0","s"],"60","S"],["2006","2008","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"Troll":[["2005","max","-","Mar","lastSun",["1","0","0","u"],"120","+02"],["2004","max","-","Oct","lastSun",["1","0","0","u"],"0","+00"]],"EUAsia":[["1981","max","-","Mar","lastSun",["1","0","0","u"],"60","S"],["1979","1995","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1996","max","-","Oct","lastSun",["1","0","0","u"],"0","-"]],"E-EurAsia":[["1981","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1979","1995","-","Sep","lastSun",["0","0","0",null],"0","-"],["1996","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"RussiaAsia":[["1981","1984","-","Apr","1",["0","0","0",null],"60","S"],["1981","1983","-","Oct","1",["0","0","0",null],"0","-"],["1984","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1985","2011","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1996","2011","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"Azer":[["1997","2015","-","Mar","lastSun",["4","0","0",null],"60","S"],["1997","2015","-","Oct","lastSun",["5","0","0",null],"0","-"]],"Dhaka":[["2009","only","-","Jun","19",["23","0","0",null],"60","S"],["2009","only","-","Dec","31",["24","0","0",null],"0","-"]],"Shang":[["1940","only","-","Jun","3",["0","0","0",null],"60","D"],["1940","1941","-","Oct","1",["0","0","0",null],"0","S"],["1941","only","-","Mar","16",["0","0","0",null],"60","D"]],"PRC":[["1986","only","-","May","4",["0","0","0",null],"60","D"],["1986","1991","-","Sep","Sun>=11",["0","0","0",null],"0","S"],["1987","1991","-","Apr","Sun>=10",["0","0","0",null],"60","D"]],"HK":[["1941","only","-","Apr","1",["3","30","0",null],"60","S"],["1941","only","-","Sep","30",["3","30","0",null],"0","-"],["1946","only","-","Apr","20",["3","30","0",null],"60","S"],["1946","only","-","Dec","1",["3","30","0",null],"0","-"],["1947","only","-","Apr","13",["3","30","0",null],"60","S"],["1947","only","-","Dec","30",["3","30","0",null],"0","-"],["1948","only","-","May","2",["3","30","0",null],"60","S"],["1948","1951","-","Oct","lastSun",["3","30","0",null],"0","-"],["1952","only","-","Oct","25",["3","30","0",null],"0","-"],["1949","1953","-","Apr","Sun>=1",["3","30","0",null],"60","S"],["1953","only","-","Nov","1",["3","30","0",null],"0","-"],["1954","1964","-","Mar","Sun>=18",["3","30","0",null],"60","S"],["1954","only","-","Oct","31",["3","30","0",null],"0","-"],["1955","1964","-","Nov","Sun>=1",["3","30","0",null],"0","-"],["1965","1976","-","Apr","Sun>=16",["3","30","0",null],"60","S"],["1965","1976","-","Oct","Sun>=16",["3","30","0",null],"0","-"],["1973","only","-","Dec","30",["3","30","0",null],"60","S"],["1979","only","-","May","Sun>=8",["3","30","0",null],"60","S"],["1979","only","-","Oct","Sun>=16",["3","30","0",null],"0","-"]],"Taiwan":[["1946","only","-","May","15",["0","0","0",null],"60","D"],["1946","only","-","Oct","1",["0","0","0",null],"0","S"],["1947","only","-","Apr","15",["0","0","0",null],"60","D"],["1947","only","-","Nov","1",["0","0","0",null],"0","S"],["1948","1951","-","May","1",["0","0","0",null],"60","D"],["1948","1951","-","Oct","1",["0","0","0",null],"0","S"],["1952","only","-","Mar","1",["0","0","0",null],"60","D"],["1952","1954","-","Nov","1",["0","0","0",null],"0","S"],["1953","1959","-","Apr","1",["0","0","0",null],"60","D"],["1955","1961","-","Oct","1",["0","0","0",null],"0","S"],["1960","1961","-","Jun","1",["0","0","0",null],"60","D"],["1974","1975","-","Apr","1",["0","0","0",null],"60","D"],["1974","1975","-","Oct","1",["0","0","0",null],"0","S"],["1979","only","-","Jul","1",["0","0","0",null],"60","D"],["1979","only","-","Oct","1",["0","0","0",null],"0","S"]],"Macau":[["1961","1962","-","Mar","Sun>=16",["3","30","0",null],"60","S"],["1961","1964","-","Nov","Sun>=1",["3","30","0",null],"0","-"],["1963","only","-","Mar","Sun>=16",["0","0","0",null],"60","S"],["1964","only","-","Mar","Sun>=16",["3","30","0",null],"60","S"],["1965","only","-","Mar","Sun>=16",["0","0","0",null],"60","S"],["1965","only","-","Oct","31",["0","0","0",null],"0","-"],["1966","1971","-","Apr","Sun>=16",["3","30","0",null],"60","S"],["1966","1971","-","Oct","Sun>=16",["3","30","0",null],"0","-"],["1972","1974","-","Apr","Sun>=15",["0","0","0",null],"60","S"],["1972","1973","-","Oct","Sun>=15",["0","0","0",null],"0","-"],["1974","1977","-","Oct","Sun>=15",["3","30","0",null],"0","-"],["1975","1977","-","Apr","Sun>=15",["3","30","0",null],"60","S"],["1978","1980","-","Apr","Sun>=15",["0","0","0",null],"60","S"],["1978","1980","-","Oct","Sun>=15",["0","0","0",null],"0","-"]],"Cyprus":[["1975","only","-","Apr","13",["0","0","0",null],"60","S"],["1975","only","-","Oct","12",["0","0","0",null],"0","-"],["1976","only","-","May","15",["0","0","0",null],"60","S"],["1976","only","-","Oct","11",["0","0","0",null],"0","-"],["1977","1980","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Sep","25",["0","0","0",null],"0","-"],["1978","only","-","Oct","2",["0","0","0",null],"0","-"],["1979","1997","-","Sep","lastSun",["0","0","0",null],"0","-"],["1981","1998","-","Mar","lastSun",["0","0","0",null],"60","S"]],"Iran":[["1978","1980","-","Mar","21",["0","0","0",null],"60","D"],["1978","only","-","Oct","21",["0","0","0",null],"0","S"],["1979","only","-","Sep","19",["0","0","0",null],"0","S"],["1980","only","-","Sep","23",["0","0","0",null],"0","S"],["1991","only","-","May","3",["0","0","0",null],"60","D"],["1992","1995","-","Mar","22",["0","0","0",null],"60","D"],["1991","1995","-","Sep","22",["0","0","0",null],"0","S"],["1996","only","-","Mar","21",["0","0","0",null],"60","D"],["1996","only","-","Sep","21",["0","0","0",null],"0","S"],["1997","1999","-","Mar","22",["0","0","0",null],"60","D"],["1997","1999","-","Sep","22",["0","0","0",null],"0","S"],["2000","only","-","Mar","21",["0","0","0",null],"60","D"],["2000","only","-","Sep","21",["0","0","0",null],"0","S"],["2001","2003","-","Mar","22",["0","0","0",null],"60","D"],["2001","2003","-","Sep","22",["0","0","0",null],"0","S"],["2004","only","-","Mar","21",["0","0","0",null],"60","D"],["2004","only","-","Sep","21",["0","0","0",null],"0","S"],["2005","only","-","Mar","22",["0","0","0",null],"60","D"],["2005","only","-","Sep","22",["0","0","0",null],"0","S"],["2008","only","-","Mar","21",["0","0","0",null],"60","D"],["2008","only","-","Sep","21",["0","0","0",null],"0","S"],["2009","2011","-","Mar","22",["0","0","0",null],"60","D"],["2009","2011","-","Sep","22",["0","0","0",null],"0","S"],["2012","only","-","Mar","21",["0","0","0",null],"60","D"],["2012","only","-","Sep","21",["0","0","0",null],"0","S"],["2013","2015","-","Mar","22",["0","0","0",null],"60","D"],["2013","2015","-","Sep","22",["0","0","0",null],"0","S"],["2016","only","-","Mar","21",["0","0","0",null],"60","D"],["2016","only","-","Sep","21",["0","0","0",null],"0","S"],["2017","2019","-","Mar","22",["0","0","0",null],"60","D"],["2017","2019","-","Sep","22",["0","0","0",null],"0","S"],["2020","only","-","Mar","21",["0","0","0",null],"60","D"],["2020","only","-","Sep","21",["0","0","0",null],"0","S"],["2021","2023","-","Mar","22",["0","0","0",null],"60","D"],["2021","2023","-","Sep","22",["0","0","0",null],"0","S"],["2024","only","-","Mar","21",["0","0","0",null],"60","D"],["2024","only","-","Sep","21",["0","0","0",null],"0","S"],["2025","2027","-","Mar","22",["0","0","0",null],"60","D"],["2025","2027","-","Sep","22",["0","0","0",null],"0","S"],["2028","2029","-","Mar","21",["0","0","0",null],"60","D"],["2028","2029","-","Sep","21",["0","0","0",null],"0","S"],["2030","2031","-","Mar","22",["0","0","0",null],"60","D"],["2030","2031","-","Sep","22",["0","0","0",null],"0","S"],["2032","2033","-","Mar","21",["0","0","0",null],"60","D"],["2032","2033","-","Sep","21",["0","0","0",null],"0","S"],["2034","2035","-","Mar","22",["0","0","0",null],"60","D"],["2034","2035","-","Sep","22",["0","0","0",null],"0","S"],["2036","max","-","Mar","21",["0","0","0",null],"60","D"],["2036","max","-","Sep","21",["0","0","0",null],"0","S"]],"Iraq":[["1982","only","-","May","1",["0","0","0",null],"60","D"],["1982","1984","-","Oct","1",["0","0","0",null],"0","S"],["1983","only","-","Mar","31",["0","0","0",null],"60","D"],["1984","1985","-","Apr","1",["0","0","0",null],"60","D"],["1985","1990","-","Sep","lastSun",["1","0","0","s"],"0","S"],["1986","1990","-","Mar","lastSun",["1","0","0","s"],"60","D"],["1991","2007","-","Apr","1",["3","0","0","s"],"60","D"],["1991","2007","-","Oct","1",["3","0","0","s"],"0","S"]],"Zion":[["1940","only","-","Jun","1",["0","0","0",null],"60","D"],["1942","1944","-","Nov","1",["0","0","0",null],"0","S"],["1943","only","-","Apr","1",["2","0","0",null],"60","D"],["1944","only","-","Apr","1",["0","0","0",null],"60","D"],["1945","only","-","Apr","16",["0","0","0",null],"60","D"],["1945","only","-","Nov","1",["2","0","0",null],"0","S"],["1946","only","-","Apr","16",["2","0","0",null],"60","D"],["1946","only","-","Nov","1",["0","0","0",null],"0","S"],["1948","only","-","May","23",["0","0","0",null],"120","DD"],["1948","only","-","Sep","1",["0","0","0",null],"60","D"],["1948","1949","-","Nov","1",["2","0","0",null],"0","S"],["1949","only","-","May","1",["0","0","0",null],"60","D"],["1950","only","-","Apr","16",["0","0","0",null],"60","D"],["1950","only","-","Sep","15",["3","0","0",null],"0","S"],["1951","only","-","Apr","1",["0","0","0",null],"60","D"],["1951","only","-","Nov","11",["3","0","0",null],"0","S"],["1952","only","-","Apr","20",["2","0","0",null],"60","D"],["1952","only","-","Oct","19",["3","0","0",null],"0","S"],["1953","only","-","Apr","12",["2","0","0",null],"60","D"],["1953","only","-","Sep","13",["3","0","0",null],"0","S"],["1954","only","-","Jun","13",["0","0","0",null],"60","D"],["1954","only","-","Sep","12",["0","0","0",null],"0","S"],["1955","only","-","Jun","11",["2","0","0",null],"60","D"],["1955","only","-","Sep","11",["0","0","0",null],"0","S"],["1956","only","-","Jun","3",["0","0","0",null],"60","D"],["1956","only","-","Sep","30",["3","0","0",null],"0","S"],["1957","only","-","Apr","29",["2","0","0",null],"60","D"],["1957","only","-","Sep","22",["0","0","0",null],"0","S"],["1974","only","-","Jul","7",["0","0","0",null],"60","D"],["1974","only","-","Oct","13",["0","0","0",null],"0","S"],["1975","only","-","Apr","20",["0","0","0",null],"60","D"],["1975","only","-","Aug","31",["0","0","0",null],"0","S"],["1985","only","-","Apr","14",["0","0","0",null],"60","D"],["1985","only","-","Sep","15",["0","0","0",null],"0","S"],["1986","only","-","May","18",["0","0","0",null],"60","D"],["1986","only","-","Sep","7",["0","0","0",null],"0","S"],["1987","only","-","Apr","15",["0","0","0",null],"60","D"],["1987","only","-","Sep","13",["0","0","0",null],"0","S"],["1988","only","-","Apr","10",["0","0","0",null],"60","D"],["1988","only","-","Sep","4",["0","0","0",null],"0","S"],["1989","only","-","Apr","30",["0","0","0",null],"60","D"],["1989","only","-","Sep","3",["0","0","0",null],"0","S"],["1990","only","-","Mar","25",["0","0","0",null],"60","D"],["1990","only","-","Aug","26",["0","0","0",null],"0","S"],["1991","only","-","Mar","24",["0","0","0",null],"60","D"],["1991","only","-","Sep","1",["0","0","0",null],"0","S"],["1992","only","-","Mar","29",["0","0","0",null],"60","D"],["1992","only","-","Sep","6",["0","0","0",null],"0","S"],["1993","only","-","Apr","2",["0","0","0",null],"60","D"],["1993","only","-","Sep","5",["0","0","0",null],"0","S"],["1994","only","-","Apr","1",["0","0","0",null],"60","D"],["1994","only","-","Aug","28",["0","0","0",null],"0","S"],["1995","only","-","Mar","31",["0","0","0",null],"60","D"],["1995","only","-","Sep","3",["0","0","0",null],"0","S"],["1996","only","-","Mar","15",["0","0","0",null],"60","D"],["1996","only","-","Sep","16",["0","0","0",null],"0","S"],["1997","only","-","Mar","21",["0","0","0",null],"60","D"],["1997","only","-","Sep","14",["0","0","0",null],"0","S"],["1998","only","-","Mar","20",["0","0","0",null],"60","D"],["1998","only","-","Sep","6",["0","0","0",null],"0","S"],["1999","only","-","Apr","2",["2","0","0",null],"60","D"],["1999","only","-","Sep","3",["2","0","0",null],"0","S"],["2000","only","-","Apr","14",["2","0","0",null],"60","D"],["2000","only","-","Oct","6",["1","0","0",null],"0","S"],["2001","only","-","Apr","9",["1","0","0",null],"60","D"],["2001","only","-","Sep","24",["1","0","0",null],"0","S"],["2002","only","-","Mar","29",["1","0","0",null],"60","D"],["2002","only","-","Oct","7",["1","0","0",null],"0","S"],["2003","only","-","Mar","28",["1","0","0",null],"60","D"],["2003","only","-","Oct","3",["1","0","0",null],"0","S"],["2004","only","-","Apr","7",["1","0","0",null],"60","D"],["2004","only","-","Sep","22",["1","0","0",null],"0","S"],["2005","only","-","Apr","1",["2","0","0",null],"60","D"],["2005","only","-","Oct","9",["2","0","0",null],"0","S"],["2006","2010","-","Mar","Fri>=26",["2","0","0",null],"60","D"],["2006","only","-","Oct","1",["2","0","0",null],"0","S"],["2007","only","-","Sep","16",["2","0","0",null],"0","S"],["2008","only","-","Oct","5",["2","0","0",null],"0","S"],["2009","only","-","Sep","27",["2","0","0",null],"0","S"],["2010","only","-","Sep","12",["2","0","0",null],"0","S"],["2011","only","-","Apr","1",["2","0","0",null],"60","D"],["2011","only","-","Oct","2",["2","0","0",null],"0","S"],["2012","only","-","Mar","Fri>=26",["2","0","0",null],"60","D"],["2012","only","-","Sep","23",["2","0","0",null],"0","S"],["2013","max","-","Mar","Fri>=23",["2","0","0",null],"60","D"],["2013","max","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Japan":[["1948","only","-","May","Sun>=1",["2","0","0",null],"60","D"],["1948","1951","-","Sep","Sat>=8",["2","0","0",null],"0","S"],["1949","only","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1950","1951","-","May","Sun>=1",["2","0","0",null],"60","D"]],"Jordan":[["1973","only","-","Jun","6",["0","0","0",null],"60","S"],["1973","1975","-","Oct","1",["0","0","0",null],"0","-"],["1974","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Nov","1",["0","0","0",null],"0","-"],["1977","only","-","Oct","1",["0","0","0",null],"0","-"],["1978","only","-","Apr","30",["0","0","0",null],"60","S"],["1978","only","-","Sep","30",["0","0","0",null],"0","-"],["1985","only","-","Apr","1",["0","0","0",null],"60","S"],["1985","only","-","Oct","1",["0","0","0",null],"0","-"],["1986","1988","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["1986","1990","-","Oct","Fri>=1",["0","0","0",null],"0","-"],["1989","only","-","May","8",["0","0","0",null],"60","S"],["1990","only","-","Apr","27",["0","0","0",null],"60","S"],["1991","only","-","Apr","17",["0","0","0",null],"60","S"],["1991","only","-","Sep","27",["0","0","0",null],"0","-"],["1992","only","-","Apr","10",["0","0","0",null],"60","S"],["1992","1993","-","Oct","Fri>=1",["0","0","0",null],"0","-"],["1993","1998","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["1994","only","-","Sep","Fri>=15",["0","0","0",null],"0","-"],["1995","1998","-","Sep","Fri>=15",["0","0","0","s"],"0","-"],["1999","only","-","Jul","1",["0","0","0","s"],"60","S"],["1999","2002","-","Sep","lastFri",["0","0","0","s"],"0","-"],["2000","2001","-","Mar","lastThu",["0","0","0","s"],"60","S"],["2002","2012","-","Mar","lastThu",["24","0","0",null],"60","S"],["2003","only","-","Oct","24",["0","0","0","s"],"0","-"],["2004","only","-","Oct","15",["0","0","0","s"],"0","-"],["2005","only","-","Sep","lastFri",["0","0","0","s"],"0","-"],["2006","2011","-","Oct","lastFri",["0","0","0","s"],"0","-"],["2013","only","-","Dec","20",["0","0","0",null],"0","-"],["2014","max","-","Mar","lastThu",["24","0","0",null],"60","S"],["2014","max","-","Oct","lastFri",["0","0","0","s"],"0","-"]],"Kyrgyz":[["1992","1996","-","Apr","Sun>=7",["0","0","0","s"],"60","S"],["1992","1996","-","Sep","lastSun",["0","0","0",null],"0","-"],["1997","2005","-","Mar","lastSun",["2","30","0",null],"60","S"],["1997","2004","-","Oct","lastSun",["2","30","0",null],"0","-"]],"ROK":[["1948","only","-","Jun","1",["0","0","0",null],"60","D"],["1948","only","-","Sep","13",["0","0","0",null],"0","S"],["1949","only","-","Apr","3",["0","0","0",null],"60","D"],["1949","1951","-","Sep","Sun>=8",["0","0","0",null],"0","S"],["1950","only","-","Apr","1",["0","0","0",null],"60","D"],["1951","only","-","May","6",["0","0","0",null],"60","D"],["1955","only","-","May","5",["0","0","0",null],"60","D"],["1955","only","-","Sep","9",["0","0","0",null],"0","S"],["1956","only","-","May","20",["0","0","0",null],"60","D"],["1956","only","-","Sep","30",["0","0","0",null],"0","S"],["1957","1960","-","May","Sun>=1",["0","0","0",null],"60","D"],["1957","1960","-","Sep","Sun>=18",["0","0","0",null],"0","S"],["1987","1988","-","May","Sun>=8",["2","0","0",null],"60","D"],["1987","1988","-","Oct","Sun>=8",["3","0","0",null],"0","S"]],"Lebanon":[["1920","only","-","Mar","28",["0","0","0",null],"60","S"],["1920","only","-","Oct","25",["0","0","0",null],"0","-"],["1921","only","-","Apr","3",["0","0","0",null],"60","S"],["1921","only","-","Oct","3",["0","0","0",null],"0","-"],["1922","only","-","Mar","26",["0","0","0",null],"60","S"],["1922","only","-","Oct","8",["0","0","0",null],"0","-"],["1923","only","-","Apr","22",["0","0","0",null],"60","S"],["1923","only","-","Sep","16",["0","0","0",null],"0","-"],["1957","1961","-","May","1",["0","0","0",null],"60","S"],["1957","1961","-","Oct","1",["0","0","0",null],"0","-"],["1972","only","-","Jun","22",["0","0","0",null],"60","S"],["1972","1977","-","Oct","1",["0","0","0",null],"0","-"],["1973","1977","-","May","1",["0","0","0",null],"60","S"],["1978","only","-","Apr","30",["0","0","0",null],"60","S"],["1978","only","-","Sep","30",["0","0","0",null],"0","-"],["1984","1987","-","May","1",["0","0","0",null],"60","S"],["1984","1991","-","Oct","16",["0","0","0",null],"0","-"],["1988","only","-","Jun","1",["0","0","0",null],"60","S"],["1989","only","-","May","10",["0","0","0",null],"60","S"],["1990","1992","-","May","1",["0","0","0",null],"60","S"],["1992","only","-","Oct","4",["0","0","0",null],"0","-"],["1993","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1993","1998","-","Sep","lastSun",["0","0","0",null],"0","-"],["1999","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"NBorneo":[["1935","1941","-","Sep","14",["0","0","0",null],"20","TS",""],["1935","1941","-","Dec","14",["0","0","0",null],"0","-"]],"Mongol":[["1983","1984","-","Apr","1",["0","0","0",null],"60","S"],["1983","only","-","Oct","1",["0","0","0",null],"0","-"],["1985","1998","-","Mar","lastSun",["0","0","0",null],"60","S"],["1984","1998","-","Sep","lastSun",["0","0","0",null],"0","-"],["2001","only","-","Apr","lastSat",["2","0","0",null],"60","S"],["2001","2006","-","Sep","lastSat",["2","0","0",null],"0","-"],["2002","2006","-","Mar","lastSat",["2","0","0",null],"60","S"],["2015","max","-","Mar","lastSat",["2","0","0",null],"60","S"],["2015","max","-","Sep","lastSat",["0","0","0",null],"0","-"]],"Pakistan":[["2002","only","-","Apr","Sun>=2",["0","0","0",null],"60","S"],["2002","only","-","Oct","Sun>=2",["0","0","0",null],"0","-"],["2008","only","-","Jun","1",["0","0","0",null],"60","S"],["2008","2009","-","Nov","1",["0","0","0",null],"0","-"],["2009","only","-","Apr","15",["0","0","0",null],"60","S"]],"EgyptAsia":[["1957","only","-","May","10",["0","0","0",null],"60","S"],["1957","1958","-","Oct","1",["0","0","0",null],"0","-"],["1958","only","-","May","1",["0","0","0",null],"60","S"],["1959","1967","-","May","1",["1","0","0",null],"60","S"],["1959","1965","-","Sep","30",["3","0","0",null],"0","-"],["1966","only","-","Oct","1",["3","0","0",null],"0","-"]],"Palestine":[["1999","2005","-","Apr","Fri>=15",["0","0","0",null],"60","S"],["1999","2003","-","Oct","Fri>=15",["0","0","0",null],"0","-"],["2004","only","-","Oct","1",["1","0","0",null],"0","-"],["2005","only","-","Oct","4",["2","0","0",null],"0","-"],["2006","2007","-","Apr","1",["0","0","0",null],"60","S"],["2006","only","-","Sep","22",["0","0","0",null],"0","-"],["2007","only","-","Sep","Thu>=8",["2","0","0",null],"0","-"],["2008","2009","-","Mar","lastFri",["0","0","0",null],"60","S"],["2008","only","-","Sep","1",["0","0","0",null],"0","-"],["2009","only","-","Sep","Fri>=1",["1","0","0",null],"0","-"],["2010","only","-","Mar","26",["0","0","0",null],"60","S"],["2010","only","-","Aug","11",["0","0","0",null],"0","-"],["2011","only","-","Apr","1",["0","1","0",null],"60","S"],["2011","only","-","Aug","1",["0","0","0",null],"0","-"],["2011","only","-","Aug","30",["0","0","0",null],"60","S"],["2011","only","-","Sep","30",["0","0","0",null],"0","-"],["2012","2014","-","Mar","lastThu",["24","0","0",null],"60","S"],["2012","only","-","Sep","21",["1","0","0",null],"0","-"],["2013","only","-","Sep","Fri>=21",["0","0","0",null],"0","-"],["2014","max","-","Oct","Fri>=21",["0","0","0",null],"0","-"],["2015","only","-","Mar","lastFri",["24","0","0",null],"60","S"],["2016","max","-","Mar","lastSat",["1","0","0",null],"60","S"]],"Phil":[["1936","only","-","Nov","1",["0","0","0",null],"60","S"],["1937","only","-","Feb","1",["0","0","0",null],"0","-"],["1954","only","-","Apr","12",["0","0","0",null],"60","S"],["1954","only","-","Jul","1",["0","0","0",null],"0","-"],["1978","only","-","Mar","22",["0","0","0",null],"60","S"],["1978","only","-","Sep","21",["0","0","0",null],"0","-"]],"Syria":[["1920","1923","-","Apr","Sun>=15",["2","0","0",null],"60","S"],["1920","1923","-","Oct","Sun>=1",["2","0","0",null],"0","-"],["1962","only","-","Apr","29",["2","0","0",null],"60","S"],["1962","only","-","Oct","1",["2","0","0",null],"0","-"],["1963","1965","-","May","1",["2","0","0",null],"60","S"],["1963","only","-","Sep","30",["2","0","0",null],"0","-"],["1964","only","-","Oct","1",["2","0","0",null],"0","-"],["1965","only","-","Sep","30",["2","0","0",null],"0","-"],["1966","only","-","Apr","24",["2","0","0",null],"60","S"],["1966","1976","-","Oct","1",["2","0","0",null],"0","-"],["1967","1978","-","May","1",["2","0","0",null],"60","S"],["1977","1978","-","Sep","1",["2","0","0",null],"0","-"],["1983","1984","-","Apr","9",["2","0","0",null],"60","S"],["1983","1984","-","Oct","1",["2","0","0",null],"0","-"],["1986","only","-","Feb","16",["2","0","0",null],"60","S"],["1986","only","-","Oct","9",["2","0","0",null],"0","-"],["1987","only","-","Mar","1",["2","0","0",null],"60","S"],["1987","1988","-","Oct","31",["2","0","0",null],"0","-"],["1988","only","-","Mar","15",["2","0","0",null],"60","S"],["1989","only","-","Mar","31",["2","0","0",null],"60","S"],["1989","only","-","Oct","1",["2","0","0",null],"0","-"],["1990","only","-","Apr","1",["2","0","0",null],"60","S"],["1990","only","-","Sep","30",["2","0","0",null],"0","-"],["1991","only","-","Apr","1",["0","0","0",null],"60","S"],["1991","1992","-","Oct","1",["0","0","0",null],"0","-"],["1992","only","-","Apr","8",["0","0","0",null],"60","S"],["1993","only","-","Mar","26",["0","0","0",null],"60","S"],["1993","only","-","Sep","25",["0","0","0",null],"0","-"],["1994","1996","-","Apr","1",["0","0","0",null],"60","S"],["1994","2005","-","Oct","1",["0","0","0",null],"0","-"],["1997","1998","-","Mar","lastMon",["0","0","0",null],"60","S"],["1999","2006","-","Apr","1",["0","0","0",null],"60","S"],["2006","only","-","Sep","22",["0","0","0",null],"0","-"],["2007","only","-","Mar","lastFri",["0","0","0",null],"60","S"],["2007","only","-","Nov","Fri>=1",["0","0","0",null],"0","-"],["2008","only","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["2008","only","-","Nov","1",["0","0","0",null],"0","-"],["2009","only","-","Mar","lastFri",["0","0","0",null],"60","S"],["2010","2011","-","Apr","Fri>=1",["0","0","0",null],"60","S"],["2012","max","-","Mar","lastFri",["0","0","0",null],"60","S"],["2009","max","-","Oct","lastFri",["0","0","0",null],"0","-"]],"Aus":[["1917","only","-","Jan","1",["0","1","0",null],"60","D"],["1917","only","-","Mar","25",["2","0","0",null],"0","S"],["1942","only","-","Jan","1",["2","0","0",null],"60","D"],["1942","only","-","Mar","29",["2","0","0",null],"0","S"],["1942","only","-","Sep","27",["2","0","0",null],"60","D"],["1943","1944","-","Mar","lastSun",["2","0","0",null],"0","S"],["1943","only","-","Oct","3",["2","0","0",null],"60","D"]],"AW":[["1974","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1975","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1983","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1984","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1991","only","-","Nov","17",["2","0","0","s"],"60","D"],["1992","only","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["2006","only","-","Dec","3",["2","0","0","s"],"60","D"],["2007","2009","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2007","2008","-","Oct","lastSun",["2","0","0","s"],"60","D"]],"AQ":[["1971","only","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1989","1991","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1990","1992","-","Mar","Sun>=1",["2","0","0","s"],"0","S"]],"Holiday":[["1992","1993","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1993","1994","-","Mar","Sun>=1",["2","0","0","s"],"0","S"]],"AS":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1986","only","-","Oct","19",["2","0","0","s"],"60","D"],["1987","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","27",["2","0","0","s"],"0","S"],["1973","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1991","only","-","Mar","3",["2","0","0","s"],"0","S"],["1992","only","-","Mar","22",["2","0","0","s"],"0","S"],["1993","only","-","Mar","7",["2","0","0","s"],"0","S"],["1994","only","-","Mar","20",["2","0","0","s"],"0","S"],["1995","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2006","only","-","Apr","2",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"AT":[["1967","only","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1968","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["1968","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1969","1971","-","Mar","Sun>=8",["2","0","0","s"],"0","S"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1973","1981","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1982","1983","-","Mar","lastSun",["2","0","0","s"],"0","S"],["1984","1986","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","only","-","Oct","Sun>=15",["2","0","0","s"],"60","D"],["1987","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1987","only","-","Oct","Sun>=22",["2","0","0","s"],"60","D"],["1988","1990","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1991","1999","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1991","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"]],"AV":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1973","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1990","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1986","1987","-","Oct","Sun>=15",["2","0","0","s"],"60","D"],["1988","1999","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1991","1994","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1995","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"AN":[["1971","1985","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1972","only","-","Feb","27",["2","0","0","s"],"0","S"],["1973","1981","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1982","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["1983","1985","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1986","1989","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["1986","only","-","Oct","19",["2","0","0","s"],"60","D"],["1987","1999","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1990","1995","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1996","2005","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0","s"],"60","D"],["2001","2007","-","Oct","lastSun",["2","0","0","s"],"60","D"],["2006","only","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0","s"],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0","s"],"60","D"]],"LH":[["1981","1984","-","Oct","lastSun",["2","0","0",null],"60","D"],["1982","1985","-","Mar","Sun>=1",["2","0","0",null],"0","S"],["1985","only","-","Oct","lastSun",["2","0","0",null],"30","D"],["1986","1989","-","Mar","Sun>=15",["2","0","0",null],"0","S"],["1986","only","-","Oct","19",["2","0","0",null],"30","D"],["1987","1999","-","Oct","lastSun",["2","0","0",null],"30","D"],["1990","1995","-","Mar","Sun>=1",["2","0","0",null],"0","S"],["1996","2005","-","Mar","lastSun",["2","0","0",null],"0","S"],["2000","only","-","Aug","lastSun",["2","0","0",null],"30","D"],["2001","2007","-","Oct","lastSun",["2","0","0",null],"30","D"],["2006","only","-","Apr","Sun>=1",["2","0","0",null],"0","S"],["2007","only","-","Mar","lastSun",["2","0","0",null],"0","S"],["2008","max","-","Apr","Sun>=1",["2","0","0",null],"0","S"],["2008","max","-","Oct","Sun>=1",["2","0","0",null],"30","D"]],"Fiji":[["1998","1999","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["1999","2000","-","Feb","lastSun",["3","0","0",null],"0","-"],["2009","only","-","Nov","29",["2","0","0",null],"60","S"],["2010","only","-","Mar","lastSun",["3","0","0",null],"0","-"],["2010","2013","-","Oct","Sun>=21",["2","0","0",null],"60","S"],["2011","only","-","Mar","Sun>=1",["3","0","0",null],"0","-"],["2012","2013","-","Jan","Sun>=18",["3","0","0",null],"0","-"],["2014","only","-","Jan","Sun>=18",["2","0","0",null],"0","-"],["2014","max","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["2015","max","-","Jan","Sun>=15",["3","0","0",null],"0","-"]],"NC":[["1977","1978","-","Dec","Sun>=1",["0","0","0",null],"60","S"],["1978","1979","-","Feb","27",["0","0","0",null],"0","-"],["1996","only","-","Dec","1",["2","0","0","s"],"60","S"],["1997","only","-","Mar","2",["2","0","0","s"],"0","-"]],"NZ":[["1927","only","-","Nov","6",["2","0","0",null],"60","S"],["1928","only","-","Mar","4",["2","0","0",null],"0","M"],["1928","1933","-","Oct","Sun>=8",["2","0","0",null],"30","S"],["1929","1933","-","Mar","Sun>=15",["2","0","0",null],"0","M"],["1934","1940","-","Apr","lastSun",["2","0","0",null],"0","M"],["1934","1940","-","Sep","lastSun",["2","0","0",null],"30","S"],["1946","only","-","Jan","1",["0","0","0",null],"0","S"],["1974","only","-","Nov","Sun>=1",["2","0","0","s"],"60","D"],["1975","only","-","Feb","lastSun",["2","0","0","s"],"0","S"],["1975","1988","-","Oct","lastSun",["2","0","0","s"],"60","D"],["1976","1989","-","Mar","Sun>=1",["2","0","0","s"],"0","S"],["1989","only","-","Oct","Sun>=8",["2","0","0","s"],"60","D"],["1990","2006","-","Oct","Sun>=1",["2","0","0","s"],"60","D"],["1990","2007","-","Mar","Sun>=15",["2","0","0","s"],"0","S"],["2007","max","-","Sep","lastSun",["2","0","0","s"],"60","D"],["2008","max","-","Apr","Sun>=1",["2","0","0","s"],"0","S"]],"Chatham":[["1974","only","-","Nov","Sun>=1",["2","45","0","s"],"60","D"],["1975","only","-","Feb","lastSun",["2","45","0","s"],"0","S"],["1975","1988","-","Oct","lastSun",["2","45","0","s"],"60","D"],["1976","1989","-","Mar","Sun>=1",["2","45","0","s"],"0","S"],["1989","only","-","Oct","Sun>=8",["2","45","0","s"],"60","D"],["1990","2006","-","Oct","Sun>=1",["2","45","0","s"],"60","D"],["1990","2007","-","Mar","Sun>=15",["2","45","0","s"],"0","S"],["2007","max","-","Sep","lastSun",["2","45","0","s"],"60","D"],["2008","max","-","Apr","Sun>=1",["2","45","0","s"],"0","S"]],"Cook":[["1978","only","-","Nov","12",["0","0","0",null],"30","HS"],["1979","1991","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1979","1990","-","Oct","lastSun",["0","0","0",null],"30","HS"]],"WS":[["2010","only","-","Sep","lastSun",["0","0","0",null],"60","D"],["2011","only","-","Apr","Sat>=1",["4","0","0",null],"0","S"],["2011","only","-","Sep","lastSat",["3","0","0",null],"60","D"],["2012","max","-","Apr","Sun>=1",["4","0","0",null],"0","S"],["2012","max","-","Sep","lastSun",["3","0","0",null],"60","D"]],"Tonga":[["1999","only","-","Oct","7",["2","0","0","s"],"60","S"],["2000","only","-","Mar","19",["2","0","0","s"],"0","-"],["2000","2001","-","Nov","Sun>=1",["2","0","0",null],"60","S"],["2001","2002","-","Jan","lastSun",["2","0","0",null],"0","-"]],"Vanuatu":[["1983","only","-","Sep","25",["0","0","0",null],"60","S"],["1984","1991","-","Mar","Sun>=23",["0","0","0",null],"0","-"],["1984","only","-","Oct","23",["0","0","0",null],"60","S"],["1985","1991","-","Sep","Sun>=23",["0","0","0",null],"60","S"],["1992","1993","-","Jan","Sun>=23",["0","0","0",null],"0","-"],["1992","only","-","Oct","Sun>=23",["0","0","0",null],"60","S"]],"GB-Eire":[["1916","only","-","May","21",["2","0","0","s"],"60","BST"],["1916","only","-","Oct","1",["2","0","0","s"],"0","GMT"],["1917","only","-","Apr","8",["2","0","0","s"],"60","BST"],["1917","only","-","Sep","17",["2","0","0","s"],"0","GMT"],["1918","only","-","Mar","24",["2","0","0","s"],"60","BST"],["1918","only","-","Sep","30",["2","0","0","s"],"0","GMT"],["1919","only","-","Mar","30",["2","0","0","s"],"60","BST"],["1919","only","-","Sep","29",["2","0","0","s"],"0","GMT"],["1920","only","-","Mar","28",["2","0","0","s"],"60","BST"],["1920","only","-","Oct","25",["2","0","0","s"],"0","GMT"],["1921","only","-","Apr","3",["2","0","0","s"],"60","BST"],["1921","only","-","Oct","3",["2","0","0","s"],"0","GMT"],["1922","only","-","Mar","26",["2","0","0","s"],"60","BST"],["1922","only","-","Oct","8",["2","0","0","s"],"0","GMT"],["1923","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1923","1924","-","Sep","Sun>=16",["2","0","0","s"],"0","GMT"],["1924","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1925","1926","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1925","1938","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1927","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1928","1929","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1930","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1931","1932","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1933","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1934","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1935","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1936","1937","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1938","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1939","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1939","only","-","Nov","Sun>=16",["2","0","0","s"],"0","GMT"],["1940","only","-","Feb","Sun>=23",["2","0","0","s"],"60","BST"],["1941","only","-","May","Sun>=2",["1","0","0","s"],"120","BDST"],["1941","1943","-","Aug","Sun>=9",["1","0","0","s"],"60","BST"],["1942","1944","-","Apr","Sun>=2",["1","0","0","s"],"120","BDST"],["1944","only","-","Sep","Sun>=16",["1","0","0","s"],"60","BST"],["1945","only","-","Apr","Mon>=2",["1","0","0","s"],"120","BDST"],["1945","only","-","Jul","Sun>=9",["1","0","0","s"],"60","BST"],["1945","1946","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1946","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1947","only","-","Mar","16",["2","0","0","s"],"60","BST"],["1947","only","-","Apr","13",["1","0","0","s"],"120","BDST"],["1947","only","-","Aug","10",["1","0","0","s"],"60","BST"],["1947","only","-","Nov","2",["2","0","0","s"],"0","GMT"],["1948","only","-","Mar","14",["2","0","0","s"],"60","BST"],["1948","only","-","Oct","31",["2","0","0","s"],"0","GMT"],["1949","only","-","Apr","3",["2","0","0","s"],"60","BST"],["1949","only","-","Oct","30",["2","0","0","s"],"0","GMT"],["1950","1952","-","Apr","Sun>=14",["2","0","0","s"],"60","BST"],["1950","1952","-","Oct","Sun>=21",["2","0","0","s"],"0","GMT"],["1953","only","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1953","1960","-","Oct","Sun>=2",["2","0","0","s"],"0","GMT"],["1954","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1955","1956","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1957","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1958","1959","-","Apr","Sun>=16",["2","0","0","s"],"60","BST"],["1960","only","-","Apr","Sun>=9",["2","0","0","s"],"60","BST"],["1961","1963","-","Mar","lastSun",["2","0","0","s"],"60","BST"],["1961","1968","-","Oct","Sun>=23",["2","0","0","s"],"0","GMT"],["1964","1967","-","Mar","Sun>=19",["2","0","0","s"],"60","BST"],["1968","only","-","Feb","18",["2","0","0","s"],"60","BST"],["1972","1980","-","Mar","Sun>=16",["2","0","0","s"],"60","BST"],["1972","1980","-","Oct","Sun>=23",["2","0","0","s"],"0","GMT"],["1981","1995","-","Mar","lastSun",["1","0","0","u"],"60","BST"],["1981","1989","-","Oct","Sun>=23",["1","0","0","u"],"0","GMT"],["1990","1995","-","Oct","Sun>=22",["1","0","0","u"],"0","GMT"]],"EU":[["1977","1980","-","Apr","Sun>=1",["1","0","0","u"],"60","S"],["1977","only","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1978","only","-","Oct","1",["1","0","0","u"],"0","-"],["1979","1995","-","Sep","lastSun",["1","0","0","u"],"0","-"],["1981","max","-","Mar","lastSun",["1","0","0","u"],"60","S"],["1996","max","-","Oct","lastSun",["1","0","0","u"],"0","-"]],"W-Eur":[["1977","1980","-","Apr","Sun>=1",["1","0","0","s"],"60","S"],["1977","only","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1978","only","-","Oct","1",["1","0","0","s"],"0","-"],["1979","1995","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1981","max","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1996","max","-","Oct","lastSun",["1","0","0","s"],"0","-"]],"C-Eur":[["1916","only","-","Apr","30",["23","0","0",null],"60","S"],["1916","only","-","Oct","1",["1","0","0",null],"0","-"],["1917","1918","-","Apr","Mon>=15",["2","0","0","s"],"60","S"],["1917","1918","-","Sep","Mon>=15",["2","0","0","s"],"0","-"],["1940","only","-","Apr","1",["2","0","0","s"],"60","S"],["1942","only","-","Nov","2",["2","0","0","s"],"0","-"],["1943","only","-","Mar","29",["2","0","0","s"],"60","S"],["1943","only","-","Oct","4",["2","0","0","s"],"0","-"],["1944","1945","-","Apr","Mon>=1",["2","0","0","s"],"60","S"],["1944","only","-","Oct","2",["2","0","0","s"],"0","-"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"],["1977","1980","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1977","only","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1978","only","-","Oct","1",["2","0","0","s"],"0","-"],["1979","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1981","max","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1996","max","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"E-Eur":[["1977","1980","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1978","only","-","Oct","1",["0","0","0",null],"0","-"],["1979","1995","-","Sep","lastSun",["0","0","0",null],"0","-"],["1981","max","-","Mar","lastSun",["0","0","0",null],"60","S"],["1996","max","-","Oct","lastSun",["0","0","0",null],"0","-"]],"Russia":[["1917","only","-","Jul","1",["23","0","0",null],"60","MST",""],["1917","only","-","Dec","28",["0","0","0",null],"0","MMT",""],["1918","only","-","May","31",["22","0","0",null],"120","MDST",""],["1918","only","-","Sep","16",["1","0","0",null],"60","MST"],["1919","only","-","May","31",["23","0","0",null],"120","MDST"],["1919","only","-","Jul","1",["0","0","0","u"],"60","MSD"],["1919","only","-","Aug","16",["0","0","0",null],"0","MSK"],["1921","only","-","Feb","14",["23","0","0",null],"60","MSD"],["1921","only","-","Mar","20",["23","0","0",null],"120","+05"],["1921","only","-","Sep","1",["0","0","0",null],"60","MSD"],["1921","only","-","Oct","1",["0","0","0",null],"0","-"],["1981","1984","-","Apr","1",["0","0","0",null],"60","S"],["1981","1983","-","Oct","1",["0","0","0",null],"0","-"],["1984","1995","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1985","2010","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1996","2010","-","Oct","lastSun",["2","0","0","s"],"0","-"]],"Albania":[["1940","only","-","Jun","16",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","29",["2","0","0",null],"60","S"],["1943","only","-","Apr","10",["3","0","0",null],"0","-"],["1974","only","-","May","4",["0","0","0",null],"60","S"],["1974","only","-","Oct","2",["0","0","0",null],"0","-"],["1975","only","-","May","1",["0","0","0",null],"60","S"],["1975","only","-","Oct","2",["0","0","0",null],"0","-"],["1976","only","-","May","2",["0","0","0",null],"60","S"],["1976","only","-","Oct","3",["0","0","0",null],"0","-"],["1977","only","-","May","8",["0","0","0",null],"60","S"],["1977","only","-","Oct","2",["0","0","0",null],"0","-"],["1978","only","-","May","6",["0","0","0",null],"60","S"],["1978","only","-","Oct","1",["0","0","0",null],"0","-"],["1979","only","-","May","5",["0","0","0",null],"60","S"],["1979","only","-","Sep","30",["0","0","0",null],"0","-"],["1980","only","-","May","3",["0","0","0",null],"60","S"],["1980","only","-","Oct","4",["0","0","0",null],"0","-"],["1981","only","-","Apr","26",["0","0","0",null],"60","S"],["1981","only","-","Sep","27",["0","0","0",null],"0","-"],["1982","only","-","May","2",["0","0","0",null],"60","S"],["1982","only","-","Oct","3",["0","0","0",null],"0","-"],["1983","only","-","Apr","18",["0","0","0",null],"60","S"],["1983","only","-","Oct","1",["0","0","0",null],"0","-"],["1984","only","-","Apr","1",["0","0","0",null],"60","S"]],"Austria":[["1920","only","-","Apr","5",["2","0","0","s"],"60","S"],["1920","only","-","Sep","13",["2","0","0","s"],"0","-"],["1946","only","-","Apr","14",["2","0","0","s"],"60","S"],["1946","1948","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","6",["2","0","0","s"],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1980","only","-","Apr","6",["0","0","0",null],"60","S"],["1980","only","-","Sep","28",["0","0","0",null],"0","-"]],"Belgium":[["1918","only","-","Mar","9",["0","0","0","s"],"60","S"],["1918","1919","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Oct","25",["23","0","0","s"],"0","-"],["1922","only","-","Mar","25",["23","0","0","s"],"60","S"],["1922","1927","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1923","only","-","Apr","21",["23","0","0","s"],"60","S"],["1924","only","-","Mar","29",["23","0","0","s"],"60","S"],["1925","only","-","Apr","4",["23","0","0","s"],"60","S"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1928","1938","-","Oct","Sun>=2",["2","0","0","s"],"0","-"],["1929","only","-","Apr","21",["2","0","0","s"],"60","S"],["1930","only","-","Apr","13",["2","0","0","s"],"60","S"],["1931","only","-","Apr","19",["2","0","0","s"],"60","S"],["1932","only","-","Apr","3",["2","0","0","s"],"60","S"],["1933","only","-","Mar","26",["2","0","0","s"],"60","S"],["1934","only","-","Apr","8",["2","0","0","s"],"60","S"],["1935","only","-","Mar","31",["2","0","0","s"],"60","S"],["1936","only","-","Apr","19",["2","0","0","s"],"60","S"],["1937","only","-","Apr","4",["2","0","0","s"],"60","S"],["1938","only","-","Mar","27",["2","0","0","s"],"60","S"],["1939","only","-","Apr","16",["2","0","0","s"],"60","S"],["1939","only","-","Nov","19",["2","0","0","s"],"0","-"],["1940","only","-","Feb","25",["2","0","0","s"],"60","S"],["1944","only","-","Sep","17",["2","0","0","s"],"0","-"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"],["1946","only","-","May","19",["2","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"]],"Bulg":[["1979","only","-","Mar","31",["23","0","0",null],"60","S"],["1979","only","-","Oct","1",["1","0","0",null],"0","-"],["1980","1982","-","Apr","Sat>=1",["23","0","0",null],"60","S"],["1980","only","-","Sep","29",["1","0","0",null],"0","-"],["1981","only","-","Sep","27",["2","0","0",null],"0","-"]],"Czech":[["1945","only","-","Apr","8",["2","0","0","s"],"60","S"],["1945","only","-","Nov","18",["2","0","0","s"],"0","-"],["1946","only","-","May","6",["2","0","0","s"],"60","S"],["1946","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","20",["2","0","0","s"],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","9",["2","0","0","s"],"60","S"]],"Denmark":[["1916","only","-","May","14",["23","0","0",null],"60","S"],["1916","only","-","Sep","30",["23","0","0",null],"0","-"],["1940","only","-","May","15",["0","0","0",null],"60","S"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Aug","15",["2","0","0","s"],"0","-"],["1946","only","-","May","1",["2","0","0","s"],"60","S"],["1946","only","-","Sep","1",["2","0","0","s"],"0","-"],["1947","only","-","May","4",["2","0","0","s"],"60","S"],["1947","only","-","Aug","10",["2","0","0","s"],"0","-"],["1948","only","-","May","9",["2","0","0","s"],"60","S"],["1948","only","-","Aug","8",["2","0","0","s"],"0","-"]],"Thule":[["1991","1992","-","Mar","lastSun",["2","0","0",null],"60","D"],["1991","1992","-","Sep","lastSun",["2","0","0",null],"0","S"],["1993","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1993","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"Finland":[["1942","only","-","Apr","2",["24","0","0",null],"60","S"],["1942","only","-","Oct","4",["1","0","0",null],"0","-"],["1981","1982","-","Mar","lastSun",["2","0","0",null],"60","S"],["1981","1982","-","Sep","lastSun",["3","0","0",null],"0","-"]],"France":[["1916","only","-","Jun","14",["23","0","0","s"],"60","S"],["1916","1919","-","Oct","Sun>=1",["23","0","0","s"],"0","-"],["1917","only","-","Mar","24",["23","0","0","s"],"60","S"],["1918","only","-","Mar","9",["23","0","0","s"],"60","S"],["1919","only","-","Mar","1",["23","0","0","s"],"60","S"],["1920","only","-","Feb","14",["23","0","0","s"],"60","S"],["1920","only","-","Oct","23",["23","0","0","s"],"0","-"],["1921","only","-","Mar","14",["23","0","0","s"],"60","S"],["1921","only","-","Oct","25",["23","0","0","s"],"0","-"],["1922","only","-","Mar","25",["23","0","0","s"],"60","S"],["1922","1938","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1923","only","-","May","26",["23","0","0","s"],"60","S"],["1924","only","-","Mar","29",["23","0","0","s"],"60","S"],["1925","only","-","Apr","4",["23","0","0","s"],"60","S"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1930","only","-","Apr","12",["23","0","0","s"],"60","S"],["1931","only","-","Apr","18",["23","0","0","s"],"60","S"],["1932","only","-","Apr","2",["23","0","0","s"],"60","S"],["1933","only","-","Mar","25",["23","0","0","s"],"60","S"],["1934","only","-","Apr","7",["23","0","0","s"],"60","S"],["1935","only","-","Mar","30",["23","0","0","s"],"60","S"],["1936","only","-","Apr","18",["23","0","0","s"],"60","S"],["1937","only","-","Apr","3",["23","0","0","s"],"60","S"],["1938","only","-","Mar","26",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","25",["2","0","0",null],"60","S"],["1941","only","-","May","5",["0","0","0",null],"120","M",""],["1941","only","-","Oct","6",["0","0","0",null],"60","S"],["1942","only","-","Mar","9",["0","0","0",null],"120","M"],["1942","only","-","Nov","2",["3","0","0",null],"60","S"],["1943","only","-","Mar","29",["2","0","0",null],"120","M"],["1943","only","-","Oct","4",["3","0","0",null],"60","S"],["1944","only","-","Apr","3",["2","0","0",null],"120","M"],["1944","only","-","Oct","8",["1","0","0",null],"60","S"],["1945","only","-","Apr","2",["2","0","0",null],"120","M"],["1945","only","-","Sep","16",["3","0","0",null],"0","-"],["1976","only","-","Mar","28",["1","0","0",null],"60","S"],["1976","only","-","Sep","26",["1","0","0",null],"0","-"]],"Germany":[["1946","only","-","Apr","14",["2","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","only","-","Apr","6",["3","0","0","s"],"60","S"],["1947","only","-","May","11",["2","0","0","s"],"120","M"],["1947","only","-","Jun","29",["3","0","0",null],"60","S"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","10",["2","0","0","s"],"60","S"]],"SovietZone":[["1945","only","-","May","24",["2","0","0",null],"120","M",""],["1945","only","-","Sep","24",["3","0","0",null],"60","S"],["1945","only","-","Nov","18",["2","0","0","s"],"0","-"]],"Greece":[["1932","only","-","Jul","7",["0","0","0",null],"60","S"],["1932","only","-","Sep","1",["0","0","0",null],"0","-"],["1941","only","-","Apr","7",["0","0","0",null],"60","S"],["1942","only","-","Nov","2",["3","0","0",null],"0","-"],["1943","only","-","Mar","30",["0","0","0",null],"60","S"],["1943","only","-","Oct","4",["0","0","0",null],"0","-"],["1952","only","-","Jul","1",["0","0","0",null],"60","S"],["1952","only","-","Nov","2",["0","0","0",null],"0","-"],["1975","only","-","Apr","12",["0","0","0","s"],"60","S"],["1975","only","-","Nov","26",["0","0","0","s"],"0","-"],["1976","only","-","Apr","11",["2","0","0","s"],"60","S"],["1976","only","-","Oct","10",["2","0","0","s"],"0","-"],["1977","1978","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1977","only","-","Sep","26",["2","0","0","s"],"0","-"],["1978","only","-","Sep","24",["4","0","0",null],"0","-"],["1979","only","-","Apr","1",["9","0","0",null],"60","S"],["1979","only","-","Sep","29",["2","0","0",null],"0","-"],["1980","only","-","Apr","1",["0","0","0",null],"60","S"],["1980","only","-","Sep","28",["0","0","0",null],"0","-"]],"Hungary":[["1918","only","-","Apr","1",["3","0","0",null],"60","S"],["1918","only","-","Sep","16",["3","0","0",null],"0","-"],["1919","only","-","Apr","15",["3","0","0",null],"60","S"],["1919","only","-","Nov","24",["3","0","0",null],"0","-"],["1945","only","-","May","1",["23","0","0",null],"60","S"],["1945","only","-","Nov","1",["0","0","0",null],"0","-"],["1946","only","-","Mar","31",["2","0","0","s"],"60","S"],["1946","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1947","1949","-","Apr","Sun>=4",["2","0","0","s"],"60","S"],["1950","only","-","Apr","17",["2","0","0","s"],"60","S"],["1950","only","-","Oct","23",["2","0","0","s"],"0","-"],["1954","1955","-","May","23",["0","0","0",null],"60","S"],["1954","1955","-","Oct","3",["0","0","0",null],"0","-"],["1956","only","-","Jun","Sun>=1",["0","0","0",null],"60","S"],["1956","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1957","only","-","Jun","Sun>=1",["1","0","0",null],"60","S"],["1957","only","-","Sep","lastSun",["3","0","0",null],"0","-"],["1980","only","-","Apr","6",["1","0","0",null],"60","S"]],"Iceland":[["1917","1919","-","Feb","19",["23","0","0",null],"60","S"],["1917","only","-","Oct","21",["1","0","0",null],"0","-"],["1918","1919","-","Nov","16",["1","0","0",null],"0","-"],["1921","only","-","Mar","19",["23","0","0",null],"60","S"],["1921","only","-","Jun","23",["1","0","0",null],"0","-"],["1939","only","-","Apr","29",["23","0","0",null],"60","S"],["1939","only","-","Oct","29",["2","0","0",null],"0","-"],["1940","only","-","Feb","25",["2","0","0",null],"60","S"],["1940","1941","-","Nov","Sun>=2",["1","0","0","s"],"0","-"],["1941","1942","-","Mar","Sun>=2",["1","0","0","s"],"60","S"],["1943","1946","-","Mar","Sun>=1",["1","0","0","s"],"60","S"],["1942","1948","-","Oct","Sun>=22",["1","0","0","s"],"0","-"],["1947","1967","-","Apr","Sun>=1",["1","0","0","s"],"60","S"],["1949","only","-","Oct","30",["1","0","0","s"],"0","-"],["1950","1966","-","Oct","Sun>=22",["1","0","0","s"],"0","-"],["1967","only","-","Oct","29",["1","0","0","s"],"0","-"]],"Italy":[["1916","only","-","Jun","3",["0","0","0","s"],"60","S"],["1916","only","-","Oct","1",["0","0","0","s"],"0","-"],["1917","only","-","Apr","1",["0","0","0","s"],"60","S"],["1917","only","-","Sep","30",["0","0","0","s"],"0","-"],["1918","only","-","Mar","10",["0","0","0","s"],"60","S"],["1918","1919","-","Oct","Sun>=1",["0","0","0","s"],"0","-"],["1919","only","-","Mar","2",["0","0","0","s"],"60","S"],["1920","only","-","Mar","21",["0","0","0","s"],"60","S"],["1920","only","-","Sep","19",["0","0","0","s"],"0","-"],["1940","only","-","Jun","15",["0","0","0","s"],"60","S"],["1944","only","-","Sep","17",["0","0","0","s"],"0","-"],["1945","only","-","Apr","2",["2","0","0",null],"60","S"],["1945","only","-","Sep","15",["0","0","0","s"],"0","-"],["1946","only","-","Mar","17",["2","0","0","s"],"60","S"],["1946","only","-","Oct","6",["2","0","0","s"],"0","-"],["1947","only","-","Mar","16",["0","0","0","s"],"60","S"],["1947","only","-","Oct","5",["0","0","0","s"],"0","-"],["1948","only","-","Feb","29",["2","0","0","s"],"60","S"],["1948","only","-","Oct","3",["2","0","0","s"],"0","-"],["1966","1968","-","May","Sun>=22",["0","0","0",null],"60","S"],["1966","1969","-","Sep","Sun>=22",["0","0","0",null],"0","-"],["1969","only","-","Jun","1",["0","0","0",null],"60","S"],["1970","only","-","May","31",["0","0","0",null],"60","S"],["1970","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1971","1972","-","May","Sun>=22",["0","0","0",null],"60","S"],["1971","only","-","Sep","lastSun",["1","0","0",null],"0","-"],["1972","only","-","Oct","1",["0","0","0",null],"0","-"],["1973","only","-","Jun","3",["0","0","0",null],"60","S"],["1973","1974","-","Sep","lastSun",["0","0","0",null],"0","-"],["1974","only","-","May","26",["0","0","0",null],"60","S"],["1975","only","-","Jun","1",["0","0","0","s"],"60","S"],["1975","1977","-","Sep","lastSun",["0","0","0","s"],"0","-"],["1976","only","-","May","30",["0","0","0","s"],"60","S"],["1977","1979","-","May","Sun>=22",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1979","only","-","Sep","30",["0","0","0","s"],"0","-"]],"Latvia":[["1989","1996","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1989","1996","-","Sep","lastSun",["2","0","0","s"],"0","-"]],"Lux":[["1916","only","-","May","14",["23","0","0",null],"60","S"],["1916","only","-","Oct","1",["1","0","0",null],"0","-"],["1917","only","-","Apr","28",["23","0","0",null],"60","S"],["1917","only","-","Sep","17",["1","0","0",null],"0","-"],["1918","only","-","Apr","Mon>=15",["2","0","0","s"],"60","S"],["1918","only","-","Sep","Mon>=15",["2","0","0","s"],"0","-"],["1919","only","-","Mar","1",["23","0","0",null],"60","S"],["1919","only","-","Oct","5",["3","0","0",null],"0","-"],["1920","only","-","Feb","14",["23","0","0",null],"60","S"],["1920","only","-","Oct","24",["2","0","0",null],"0","-"],["1921","only","-","Mar","14",["23","0","0",null],"60","S"],["1921","only","-","Oct","26",["2","0","0",null],"0","-"],["1922","only","-","Mar","25",["23","0","0",null],"60","S"],["1922","only","-","Oct","Sun>=2",["1","0","0",null],"0","-"],["1923","only","-","Apr","21",["23","0","0",null],"60","S"],["1923","only","-","Oct","Sun>=2",["2","0","0",null],"0","-"],["1924","only","-","Mar","29",["23","0","0",null],"60","S"],["1924","1928","-","Oct","Sun>=2",["1","0","0",null],"0","-"],["1925","only","-","Apr","5",["23","0","0",null],"60","S"],["1926","only","-","Apr","17",["23","0","0",null],"60","S"],["1927","only","-","Apr","9",["23","0","0",null],"60","S"],["1928","only","-","Apr","14",["23","0","0",null],"60","S"],["1929","only","-","Apr","20",["23","0","0",null],"60","S"]],"Malta":[["1973","only","-","Mar","31",["0","0","0","s"],"60","S"],["1973","only","-","Sep","29",["0","0","0","s"],"0","-"],["1974","only","-","Apr","21",["0","0","0","s"],"60","S"],["1974","only","-","Sep","16",["0","0","0","s"],"0","-"],["1975","1979","-","Apr","Sun>=15",["2","0","0",null],"60","S"],["1975","1980","-","Sep","Sun>=15",["2","0","0",null],"0","-"],["1980","only","-","Mar","31",["2","0","0",null],"60","S"]],"Moldova":[["1997","max","-","Mar","lastSun",["2","0","0",null],"60","S"],["1997","max","-","Oct","lastSun",["3","0","0",null],"0","-"]],"Neth":[["1916","only","-","May","1",["0","0","0",null],"60","NST",""],["1916","only","-","Oct","1",["0","0","0",null],"0","AMT",""],["1917","only","-","Apr","16",["2","0","0","s"],"60","NST"],["1917","only","-","Sep","17",["2","0","0","s"],"0","AMT"],["1918","1921","-","Apr","Mon>=1",["2","0","0","s"],"60","NST"],["1918","1921","-","Sep","lastMon",["2","0","0","s"],"0","AMT"],["1922","only","-","Mar","lastSun",["2","0","0","s"],"60","NST"],["1922","1936","-","Oct","Sun>=2",["2","0","0","s"],"0","AMT"],["1923","only","-","Jun","Fri>=1",["2","0","0","s"],"60","NST"],["1924","only","-","Mar","lastSun",["2","0","0","s"],"60","NST"],["1925","only","-","Jun","Fri>=1",["2","0","0","s"],"60","NST"],["1926","1931","-","May","15",["2","0","0","s"],"60","NST"],["1932","only","-","May","22",["2","0","0","s"],"60","NST"],["1933","1936","-","May","15",["2","0","0","s"],"60","NST"],["1937","only","-","May","22",["2","0","0","s"],"60","NST"],["1937","only","-","Jul","1",["0","0","0",null],"60","S"],["1937","1939","-","Oct","Sun>=2",["2","0","0","s"],"0","-"],["1938","1939","-","May","15",["2","0","0","s"],"60","S"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Sep","16",["2","0","0","s"],"0","-"]],"Norway":[["1916","only","-","May","22",["1","0","0",null],"60","S"],["1916","only","-","Sep","30",["0","0","0",null],"0","-"],["1945","only","-","Apr","2",["2","0","0","s"],"60","S"],["1945","only","-","Oct","1",["2","0","0","s"],"0","-"],["1959","1964","-","Mar","Sun>=15",["2","0","0","s"],"60","S"],["1959","1965","-","Sep","Sun>=15",["2","0","0","s"],"0","-"],["1965","only","-","Apr","25",["2","0","0","s"],"60","S"]],"Poland":[["1918","1919","-","Sep","16",["2","0","0","s"],"0","-"],["1919","only","-","Apr","15",["2","0","0","s"],"60","S"],["1944","only","-","Apr","3",["2","0","0","s"],"60","S"],["1944","only","-","Oct","4",["2","0","0",null],"0","-"],["1945","only","-","Apr","29",["0","0","0",null],"60","S"],["1945","only","-","Nov","1",["0","0","0",null],"0","-"],["1946","only","-","Apr","14",["0","0","0","s"],"60","S"],["1946","only","-","Oct","7",["2","0","0","s"],"0","-"],["1947","only","-","May","4",["2","0","0","s"],"60","S"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1948","only","-","Apr","18",["2","0","0","s"],"60","S"],["1949","only","-","Apr","10",["2","0","0","s"],"60","S"],["1957","only","-","Jun","2",["1","0","0","s"],"60","S"],["1957","1958","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1958","only","-","Mar","30",["1","0","0","s"],"60","S"],["1959","only","-","May","31",["1","0","0","s"],"60","S"],["1959","1961","-","Oct","Sun>=1",["1","0","0","s"],"0","-"],["1960","only","-","Apr","3",["1","0","0","s"],"60","S"],["1961","1964","-","May","lastSun",["1","0","0","s"],"60","S"],["1962","1964","-","Sep","lastSun",["1","0","0","s"],"0","-"]],"Port":[["1916","only","-","Jun","17",["23","0","0",null],"60","S"],["1916","only","-","Nov","1",["1","0","0",null],"0","-"],["1917","only","-","Feb","28",["23","0","0","s"],"60","S"],["1917","1921","-","Oct","14",["23","0","0","s"],"0","-"],["1918","only","-","Mar","1",["23","0","0","s"],"60","S"],["1919","only","-","Feb","28",["23","0","0","s"],"60","S"],["1920","only","-","Feb","29",["23","0","0","s"],"60","S"],["1921","only","-","Feb","28",["23","0","0","s"],"60","S"],["1924","only","-","Apr","16",["23","0","0","s"],"60","S"],["1924","only","-","Oct","14",["23","0","0","s"],"0","-"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1926","1929","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1931","only","-","Apr","18",["23","0","0","s"],"60","S"],["1931","1932","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1932","only","-","Apr","2",["23","0","0","s"],"60","S"],["1934","only","-","Apr","7",["23","0","0","s"],"60","S"],["1934","1938","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1935","only","-","Mar","30",["23","0","0","s"],"60","S"],["1936","only","-","Apr","18",["23","0","0","s"],"60","S"],["1937","only","-","Apr","3",["23","0","0","s"],"60","S"],["1938","only","-","Mar","26",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1939","only","-","Nov","18",["23","0","0","s"],"0","-"],["1940","only","-","Feb","24",["23","0","0","s"],"60","S"],["1940","1941","-","Oct","5",["23","0","0","s"],"0","-"],["1941","only","-","Apr","5",["23","0","0","s"],"60","S"],["1942","1945","-","Mar","Sat>=8",["23","0","0","s"],"60","S"],["1942","only","-","Apr","25",["22","0","0","s"],"120","M",""],["1942","only","-","Aug","15",["22","0","0","s"],"60","S"],["1942","1945","-","Oct","Sat>=24",["23","0","0","s"],"0","-"],["1943","only","-","Apr","17",["22","0","0","s"],"120","M"],["1943","1945","-","Aug","Sat>=25",["22","0","0","s"],"60","S"],["1944","1945","-","Apr","Sat>=21",["22","0","0","s"],"120","M"],["1946","only","-","Apr","Sat>=1",["23","0","0","s"],"60","S"],["1946","only","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1947","1949","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1947","1949","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1951","1965","-","Apr","Sun>=1",["2","0","0","s"],"60","S"],["1951","1965","-","Oct","Sun>=1",["2","0","0","s"],"0","-"],["1977","only","-","Mar","27",["0","0","0","s"],"60","S"],["1977","only","-","Sep","25",["0","0","0","s"],"0","-"],["1978","1979","-","Apr","Sun>=1",["0","0","0","s"],"60","S"],["1978","only","-","Oct","1",["0","0","0","s"],"0","-"],["1979","1982","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1980","only","-","Mar","lastSun",["0","0","0","s"],"60","S"],["1981","1982","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1983","only","-","Mar","lastSun",["2","0","0","s"],"60","S"]],"Romania":[["1932","only","-","May","21",["0","0","0","s"],"60","S"],["1932","1939","-","Oct","Sun>=1",["0","0","0","s"],"0","-"],["1933","1939","-","Apr","Sun>=2",["0","0","0","s"],"60","S"],["1979","only","-","May","27",["0","0","0",null],"60","S"],["1979","only","-","Sep","lastSun",["0","0","0",null],"0","-"],["1980","only","-","Apr","5",["23","0","0",null],"60","S"],["1980","only","-","Sep","lastSun",["1","0","0",null],"0","-"],["1991","1993","-","Mar","lastSun",["0","0","0","s"],"60","S"],["1991","1993","-","Sep","lastSun",["0","0","0","s"],"0","-"]],"Spain":[["1917","only","-","May","5",["23","0","0","s"],"60","S"],["1917","1919","-","Oct","6",["23","0","0","s"],"0","-"],["1918","only","-","Apr","15",["23","0","0","s"],"60","S"],["1919","only","-","Apr","5",["23","0","0","s"],"60","S"],["1924","only","-","Apr","16",["23","0","0","s"],"60","S"],["1924","only","-","Oct","4",["23","0","0","s"],"0","-"],["1926","only","-","Apr","17",["23","0","0","s"],"60","S"],["1926","1929","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1927","only","-","Apr","9",["23","0","0","s"],"60","S"],["1928","only","-","Apr","14",["23","0","0","s"],"60","S"],["1929","only","-","Apr","20",["23","0","0","s"],"60","S"],["1937","only","-","May","22",["23","0","0","s"],"60","S"],["1937","1939","-","Oct","Sat>=1",["23","0","0","s"],"0","-"],["1938","only","-","Mar","22",["23","0","0","s"],"60","S"],["1939","only","-","Apr","15",["23","0","0","s"],"60","S"],["1940","only","-","Mar","16",["23","0","0","s"],"60","S"],["1942","only","-","May","2",["22","0","0","s"],"120","M",""],["1942","only","-","Sep","1",["22","0","0","s"],"60","S"],["1943","1946","-","Apr","Sat>=13",["22","0","0","s"],"120","M"],["1943","only","-","Oct","3",["22","0","0","s"],"60","S"],["1944","only","-","Oct","10",["22","0","0","s"],"60","S"],["1945","only","-","Sep","30",["1","0","0",null],"60","S"],["1946","only","-","Sep","30",["0","0","0",null],"0","-"],["1949","only","-","Apr","30",["23","0","0",null],"60","S"],["1949","only","-","Sep","30",["1","0","0",null],"0","-"],["1974","1975","-","Apr","Sat>=13",["23","0","0",null],"60","S"],["1974","1975","-","Oct","Sun>=1",["1","0","0",null],"0","-"],["1976","only","-","Mar","27",["23","0","0",null],"60","S"],["1976","1977","-","Sep","lastSun",["1","0","0",null],"0","-"],["1977","1978","-","Apr","2",["23","0","0",null],"60","S"],["1978","only","-","Oct","1",["1","0","0",null],"0","-"]],"SpainAfrica":[["1967","only","-","Jun","3",["12","0","0",null],"60","S"],["1967","only","-","Oct","1",["0","0","0",null],"0","-"],["1974","only","-","Jun","24",["0","0","0",null],"60","S"],["1974","only","-","Sep","1",["0","0","0",null],"0","-"],["1976","1977","-","May","1",["0","0","0",null],"60","S"],["1976","only","-","Aug","1",["0","0","0",null],"0","-"],["1977","only","-","Sep","28",["0","0","0",null],"0","-"],["1978","only","-","Jun","1",["0","0","0",null],"60","S"],["1978","only","-","Aug","4",["0","0","0",null],"0","-"]],"Swiss":[["1941","1942","-","May","Mon>=1",["1","0","0",null],"60","S"],["1941","1942","-","Oct","Mon>=1",["2","0","0",null],"0","-"]],"Turkey":[["1916","only","-","May","1",["0","0","0",null],"60","S"],["1916","only","-","Oct","1",["0","0","0",null],"0","-"],["1920","only","-","Mar","28",["0","0","0",null],"60","S"],["1920","only","-","Oct","25",["0","0","0",null],"0","-"],["1921","only","-","Apr","3",["0","0","0",null],"60","S"],["1921","only","-","Oct","3",["0","0","0",null],"0","-"],["1922","only","-","Mar","26",["0","0","0",null],"60","S"],["1922","only","-","Oct","8",["0","0","0",null],"0","-"],["1924","only","-","May","13",["0","0","0",null],"60","S"],["1924","1925","-","Oct","1",["0","0","0",null],"0","-"],["1925","only","-","May","1",["0","0","0",null],"60","S"],["1940","only","-","Jun","30",["0","0","0",null],"60","S"],["1940","only","-","Oct","5",["0","0","0",null],"0","-"],["1940","only","-","Dec","1",["0","0","0",null],"60","S"],["1941","only","-","Sep","21",["0","0","0",null],"0","-"],["1942","only","-","Apr","1",["0","0","0",null],"60","S"],["1942","only","-","Nov","1",["0","0","0",null],"0","-"],["1945","only","-","Apr","2",["0","0","0",null],"60","S"],["1945","only","-","Oct","8",["0","0","0",null],"0","-"],["1946","only","-","Jun","1",["0","0","0",null],"60","S"],["1946","only","-","Oct","1",["0","0","0",null],"0","-"],["1947","1948","-","Apr","Sun>=16",["0","0","0",null],"60","S"],["1947","1950","-","Oct","Sun>=2",["0","0","0",null],"0","-"],["1949","only","-","Apr","10",["0","0","0",null],"60","S"],["1950","only","-","Apr","19",["0","0","0",null],"60","S"],["1951","only","-","Apr","22",["0","0","0",null],"60","S"],["1951","only","-","Oct","8",["0","0","0",null],"0","-"],["1962","only","-","Jul","15",["0","0","0",null],"60","S"],["1962","only","-","Oct","8",["0","0","0",null],"0","-"],["1964","only","-","May","15",["0","0","0",null],"60","S"],["1964","only","-","Oct","1",["0","0","0",null],"0","-"],["1970","1972","-","May","Sun>=2",["0","0","0",null],"60","S"],["1970","1972","-","Oct","Sun>=2",["0","0","0",null],"0","-"],["1973","only","-","Jun","3",["1","0","0",null],"60","S"],["1973","only","-","Nov","4",["3","0","0",null],"0","-"],["1974","only","-","Mar","31",["2","0","0",null],"60","S"],["1974","only","-","Nov","3",["5","0","0",null],"0","-"],["1975","only","-","Mar","30",["0","0","0",null],"60","S"],["1975","1976","-","Oct","lastSun",["0","0","0",null],"0","-"],["1976","only","-","Jun","1",["0","0","0",null],"60","S"],["1977","1978","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1977","only","-","Oct","16",["0","0","0",null],"0","-"],["1979","1980","-","Apr","Sun>=1",["3","0","0",null],"60","S"],["1979","1982","-","Oct","Mon>=11",["0","0","0",null],"0","-"],["1981","1982","-","Mar","lastSun",["3","0","0",null],"60","S"],["1983","only","-","Jul","31",["0","0","0",null],"60","S"],["1983","only","-","Oct","2",["0","0","0",null],"0","-"],["1985","only","-","Apr","20",["0","0","0",null],"60","S"],["1985","only","-","Sep","28",["0","0","0",null],"0","-"],["1986","1990","-","Mar","lastSun",["2","0","0","s"],"60","S"],["1986","1990","-","Sep","lastSun",["2","0","0","s"],"0","-"],["1991","2006","-","Mar","lastSun",["1","0","0","s"],"60","S"],["1991","1995","-","Sep","lastSun",["1","0","0","s"],"0","-"],["1996","2006","-","Oct","lastSun",["1","0","0","s"],"0","-"]],"US":[["1918","1919","-","Mar","lastSun",["2","0","0",null],"60","D"],["1918","1919","-","Oct","lastSun",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1967","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1967","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1974","only","-","Jan","6",["2","0","0",null],"60","D"],["1975","only","-","Feb","23",["2","0","0",null],"60","D"],["1976","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"NYC":[["1920","only","-","Mar","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1921","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Chicago":[["1920","only","-","Jun","13",["2","0","0",null],"60","D"],["1920","1921","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","only","-","Mar","lastSun",["2","0","0",null],"60","D"],["1922","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1922","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Denver":[["1920","1921","-","Mar","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","only","-","May","22",["2","0","0",null],"0","S"],["1965","1966","-","Apr","lastSun",["2","0","0",null],"60","D"],["1965","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"CA":[["1948","only","-","Mar","14",["2","1","0",null],"60","D"],["1949","only","-","Jan","1",["2","0","0",null],"0","S"],["1950","1966","-","Apr","lastSun",["1","0","0",null],"60","D"],["1950","1961","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1966","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Indianapolis":[["1941","only","-","Jun","22",["2","0","0",null],"60","D"],["1941","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","1954","-","Apr","lastSun",["2","0","0",null],"60","D"]],"Marengo":[["1951","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1954","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1954","1960","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Vincennes":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1953","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1953","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","only","-","May","1",["0","0","0",null],"60","D"],["1956","1963","-","Apr","lastSun",["2","0","0",null],"60","D"],["1960","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1961","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1963","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Perry":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1953","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1953","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","only","-","May","1",["0","0","0",null],"60","D"],["1956","1963","-","Apr","lastSun",["2","0","0",null],"60","D"],["1960","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1961","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1963","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Pike":[["1955","only","-","May","1",["0","0","0",null],"60","D"],["1955","1960","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1964","-","Apr","lastSun",["2","0","0",null],"60","D"],["1961","1964","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Starke":[["1947","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1956","-","Oct","lastSun",["2","0","0",null],"0","S"],["1957","1958","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","1961","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Pulaski":[["1946","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1955","1956","-","Oct","lastSun",["2","0","0",null],"0","S"],["1957","1960","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Louisville":[["1921","only","-","May","1",["2","0","0",null],"60","D"],["1921","only","-","Sep","1",["2","0","0",null],"0","S"],["1941","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1941","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Jun","2",["2","0","0",null],"0","S"],["1950","1955","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1960","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Detroit":[["1948","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1948","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1967","only","-","Jun","14",["2","0","0",null],"60","D"],["1967","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Menominee":[["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1966","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1966","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Canada":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1974","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1974","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2007","max","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2007","max","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"StJohns":[["1917","only","-","Apr","8",["2","0","0",null],"60","D"],["1917","only","-","Sep","17",["2","0","0",null],"0","S"],["1919","only","-","May","5",["23","0","0",null],"60","D"],["1919","only","-","Aug","12",["23","0","0",null],"0","S"],["1920","1935","-","May","Sun>=1",["23","0","0",null],"60","D"],["1920","1935","-","Oct","lastSun",["23","0","0",null],"0","S"],["1936","1941","-","May","Mon>=9",["0","0","0",null],"60","D"],["1936","1941","-","Oct","Mon>=2",["0","0","0",null],"0","S"],["1946","1950","-","May","Sun>=8",["2","0","0",null],"60","D"],["1946","1950","-","Oct","Sun>=2",["2","0","0",null],"0","S"],["1951","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1960","1986","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","only","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["1987","2006","-","Oct","lastSun",["0","1","0",null],"0","S"],["1988","only","-","Apr","Sun>=1",["0","1","0",null],"120","DD"],["1989","2006","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["2007","2011","-","Mar","Sun>=8",["0","1","0",null],"60","D"],["2007","2010","-","Nov","Sun>=1",["0","1","0",null],"0","S"]],"Halifax":[["1916","only","-","Apr","1",["0","0","0",null],"60","D"],["1916","only","-","Oct","1",["0","0","0",null],"0","S"],["1920","only","-","May","9",["0","0","0",null],"60","D"],["1920","only","-","Aug","29",["0","0","0",null],"0","S"],["1921","only","-","May","6",["0","0","0",null],"60","D"],["1921","1922","-","Sep","5",["0","0","0",null],"0","S"],["1922","only","-","Apr","30",["0","0","0",null],"60","D"],["1923","1925","-","May","Sun>=1",["0","0","0",null],"60","D"],["1923","only","-","Sep","4",["0","0","0",null],"0","S"],["1924","only","-","Sep","15",["0","0","0",null],"0","S"],["1925","only","-","Sep","28",["0","0","0",null],"0","S"],["1926","only","-","May","16",["0","0","0",null],"60","D"],["1926","only","-","Sep","13",["0","0","0",null],"0","S"],["1927","only","-","May","1",["0","0","0",null],"60","D"],["1927","only","-","Sep","26",["0","0","0",null],"0","S"],["1928","1931","-","May","Sun>=8",["0","0","0",null],"60","D"],["1928","only","-","Sep","9",["0","0","0",null],"0","S"],["1929","only","-","Sep","3",["0","0","0",null],"0","S"],["1930","only","-","Sep","15",["0","0","0",null],"0","S"],["1931","1932","-","Sep","Mon>=24",["0","0","0",null],"0","S"],["1932","only","-","May","1",["0","0","0",null],"60","D"],["1933","only","-","Apr","30",["0","0","0",null],"60","D"],["1933","only","-","Oct","2",["0","0","0",null],"0","S"],["1934","only","-","May","20",["0","0","0",null],"60","D"],["1934","only","-","Sep","16",["0","0","0",null],"0","S"],["1935","only","-","Jun","2",["0","0","0",null],"60","D"],["1935","only","-","Sep","30",["0","0","0",null],"0","S"],["1936","only","-","Jun","1",["0","0","0",null],"60","D"],["1936","only","-","Sep","14",["0","0","0",null],"0","S"],["1937","1938","-","May","Sun>=1",["0","0","0",null],"60","D"],["1937","1941","-","Sep","Mon>=24",["0","0","0",null],"0","S"],["1939","only","-","May","28",["0","0","0",null],"60","D"],["1940","1941","-","May","Sun>=1",["0","0","0",null],"60","D"],["1946","1949","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1949","-","Sep","lastSun",["2","0","0",null],"0","S"],["1951","1954","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1954","-","Sep","lastSun",["2","0","0",null],"0","S"],["1956","1959","-","Apr","lastSun",["2","0","0",null],"60","D"],["1956","1959","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1962","1973","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Moncton":[["1933","1935","-","Jun","Sun>=8",["1","0","0",null],"60","D"],["1933","1935","-","Sep","Sun>=8",["1","0","0",null],"0","S"],["1936","1938","-","Jun","Sun>=1",["1","0","0",null],"60","D"],["1936","1938","-","Sep","Sun>=1",["1","0","0",null],"0","S"],["1939","only","-","May","27",["1","0","0",null],"60","D"],["1939","1941","-","Sep","Sat>=21",["1","0","0",null],"0","S"],["1940","only","-","May","19",["1","0","0",null],"60","D"],["1941","only","-","May","4",["1","0","0",null],"60","D"],["1946","1972","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","1956","-","Sep","lastSun",["2","0","0",null],"0","S"],["1957","1972","-","Oct","lastSun",["2","0","0",null],"0","S"],["1993","2006","-","Apr","Sun>=1",["0","1","0",null],"60","D"],["1993","2006","-","Oct","lastSun",["0","1","0",null],"0","S"]],"Toronto":[["1919","only","-","Mar","30",["23","30","0",null],"60","D"],["1919","only","-","Oct","26",["0","0","0",null],"0","S"],["1920","only","-","May","2",["2","0","0",null],"60","D"],["1920","only","-","Sep","26",["0","0","0",null],"0","S"],["1921","only","-","May","15",["2","0","0",null],"60","D"],["1921","only","-","Sep","15",["2","0","0",null],"0","S"],["1922","1923","-","May","Sun>=8",["2","0","0",null],"60","D"],["1922","1926","-","Sep","Sun>=15",["2","0","0",null],"0","S"],["1924","1927","-","May","Sun>=1",["2","0","0",null],"60","D"],["1927","1932","-","Sep","lastSun",["2","0","0",null],"0","S"],["1928","1931","-","Apr","lastSun",["2","0","0",null],"60","D"],["1932","only","-","May","1",["2","0","0",null],"60","D"],["1933","1940","-","Apr","lastSun",["2","0","0",null],"60","D"],["1933","only","-","Oct","1",["2","0","0",null],"0","S"],["1934","1939","-","Sep","lastSun",["2","0","0",null],"0","S"],["1945","1946","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1949","-","Apr","lastSun",["0","0","0",null],"60","D"],["1947","1948","-","Sep","lastSun",["0","0","0",null],"0","S"],["1949","only","-","Nov","lastSun",["0","0","0",null],"0","S"],["1950","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["1950","only","-","Nov","lastSun",["2","0","0",null],"0","S"],["1951","1956","-","Sep","lastSun",["2","0","0",null],"0","S"],["1957","1973","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Winn":[["1916","only","-","Apr","23",["0","0","0",null],"60","D"],["1916","only","-","Sep","17",["0","0","0",null],"0","S"],["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1937","only","-","May","16",["2","0","0",null],"60","D"],["1937","only","-","Sep","26",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","May","12",["2","0","0",null],"60","D"],["1946","only","-","Oct","13",["2","0","0",null],"0","S"],["1947","1949","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1949","-","Sep","lastSun",["2","0","0",null],"0","S"],["1950","only","-","May","1",["2","0","0",null],"60","D"],["1950","only","-","Sep","30",["2","0","0",null],"0","S"],["1951","1960","-","Apr","lastSun",["2","0","0",null],"60","D"],["1951","1958","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1960","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1963","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1963","only","-","Sep","22",["2","0","0",null],"0","S"],["1966","1986","-","Apr","lastSun",["2","0","0","s"],"60","D"],["1966","2005","-","Oct","lastSun",["2","0","0","s"],"0","S"],["1987","2005","-","Apr","Sun>=1",["2","0","0","s"],"60","D"]],"Regina":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1930","1934","-","May","Sun>=1",["0","0","0",null],"60","D"],["1930","1934","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["1937","1941","-","Apr","Sun>=8",["0","0","0",null],"60","D"],["1937","only","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1938","only","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["1939","1941","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1946","only","-","Apr","Sun>=8",["2","0","0",null],"60","D"],["1946","only","-","Oct","Sun>=8",["2","0","0",null],"0","S"],["1947","1957","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","1957","-","Sep","lastSun",["2","0","0",null],"0","S"],["1959","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Swift":[["1957","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1957","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1959","1961","-","Apr","lastSun",["2","0","0",null],"60","D"],["1959","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1960","1961","-","Sep","lastSun",["2","0","0",null],"0","S"]],"Edm":[["1918","1919","-","Apr","Sun>=8",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1919","only","-","May","27",["2","0","0",null],"0","S"],["1920","1923","-","Apr","lastSun",["2","0","0",null],"60","D"],["1920","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1921","1923","-","Sep","lastSun",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1947","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1947","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["1967","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1967","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1969","only","-","Apr","lastSun",["2","0","0",null],"60","D"],["1969","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1972","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1972","2006","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Vanc":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1946","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1946","only","-","Oct","13",["2","0","0",null],"0","S"],["1947","1961","-","Sep","lastSun",["2","0","0",null],"0","S"],["1962","2006","-","Oct","lastSun",["2","0","0",null],"0","S"]],"NT_YK":[["1918","only","-","Apr","14",["2","0","0",null],"60","D"],["1918","only","-","Oct","27",["2","0","0",null],"0","S"],["1919","only","-","May","25",["2","0","0",null],"60","D"],["1919","only","-","Nov","1",["0","0","0",null],"0","S"],["1942","only","-","Feb","9",["2","0","0",null],"60","W",""],["1945","only","-","Aug","14",["23","0","0","u"],"60","P",""],["1945","only","-","Sep","30",["2","0","0",null],"0","S"],["1965","only","-","Apr","lastSun",["0","0","0",null],"120","DD"],["1965","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1980","1986","-","Apr","lastSun",["2","0","0",null],"60","D"],["1980","2006","-","Oct","lastSun",["2","0","0",null],"0","S"],["1987","2006","-","Apr","Sun>=1",["2","0","0",null],"60","D"]],"Mexico":[["1939","only","-","Feb","5",["0","0","0",null],"60","D"],["1939","only","-","Jun","25",["0","0","0",null],"0","S"],["1940","only","-","Dec","9",["0","0","0",null],"60","D"],["1941","only","-","Apr","1",["0","0","0",null],"0","S"],["1943","only","-","Dec","16",["0","0","0",null],"60","W",""],["1944","only","-","May","1",["0","0","0",null],"0","S"],["1950","only","-","Feb","12",["0","0","0",null],"60","D"],["1950","only","-","Jul","30",["0","0","0",null],"0","S"],["1996","2000","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["1996","2000","-","Oct","lastSun",["2","0","0",null],"0","S"],["2001","only","-","May","Sun>=1",["2","0","0",null],"60","D"],["2001","only","-","Sep","lastSun",["2","0","0",null],"0","S"],["2002","max","-","Apr","Sun>=1",["2","0","0",null],"60","D"],["2002","max","-","Oct","lastSun",["2","0","0",null],"0","S"]],"Bahamas":[["1964","1975","-","Oct","lastSun",["2","0","0",null],"0","S"],["1964","1975","-","Apr","lastSun",["2","0","0",null],"60","D"]],"Barb":[["1977","only","-","Jun","12",["2","0","0",null],"60","D"],["1977","1978","-","Oct","Sun>=1",["2","0","0",null],"0","S"],["1978","1980","-","Apr","Sun>=15",["2","0","0",null],"60","D"],["1979","only","-","Sep","30",["2","0","0",null],"0","S"],["1980","only","-","Sep","25",["2","0","0",null],"0","S"]],"Belize":[["1918","1942","-","Oct","Sun>=2",["0","0","0",null],"30","HD"],["1919","1943","-","Feb","Sun>=9",["0","0","0",null],"0","S"],["1973","only","-","Dec","5",["0","0","0",null],"60","D"],["1974","only","-","Feb","9",["0","0","0",null],"0","S"],["1982","only","-","Dec","18",["0","0","0",null],"60","D"],["1983","only","-","Feb","12",["0","0","0",null],"0","S"]],"CR":[["1979","1980","-","Feb","lastSun",["0","0","0",null],"60","D"],["1979","1980","-","Jun","Sun>=1",["0","0","0",null],"0","S"],["1991","1992","-","Jan","Sat>=15",["0","0","0",null],"60","D"],["1991","only","-","Jul","1",["0","0","0",null],"0","S"],["1992","only","-","Mar","15",["0","0","0",null],"0","S"]],"Cuba":[["1928","only","-","Jun","10",["0","0","0",null],"60","D"],["1928","only","-","Oct","10",["0","0","0",null],"0","S"],["1940","1942","-","Jun","Sun>=1",["0","0","0",null],"60","D"],["1940","1942","-","Sep","Sun>=1",["0","0","0",null],"0","S"],["1945","1946","-","Jun","Sun>=1",["0","0","0",null],"60","D"],["1945","1946","-","Sep","Sun>=1",["0","0","0",null],"0","S"],["1965","only","-","Jun","1",["0","0","0",null],"60","D"],["1965","only","-","Sep","30",["0","0","0",null],"0","S"],["1966","only","-","May","29",["0","0","0",null],"60","D"],["1966","only","-","Oct","2",["0","0","0",null],"0","S"],["1967","only","-","Apr","8",["0","0","0",null],"60","D"],["1967","1968","-","Sep","Sun>=8",["0","0","0",null],"0","S"],["1968","only","-","Apr","14",["0","0","0",null],"60","D"],["1969","1977","-","Apr","lastSun",["0","0","0",null],"60","D"],["1969","1971","-","Oct","lastSun",["0","0","0",null],"0","S"],["1972","1974","-","Oct","8",["0","0","0",null],"0","S"],["1975","1977","-","Oct","lastSun",["0","0","0",null],"0","S"],["1978","only","-","May","7",["0","0","0",null],"60","D"],["1978","1990","-","Oct","Sun>=8",["0","0","0",null],"0","S"],["1979","1980","-","Mar","Sun>=15",["0","0","0",null],"60","D"],["1981","1985","-","May","Sun>=5",["0","0","0",null],"60","D"],["1986","1989","-","Mar","Sun>=14",["0","0","0",null],"60","D"],["1990","1997","-","Apr","Sun>=1",["0","0","0",null],"60","D"],["1991","1995","-","Oct","Sun>=8",["0","0","0","s"],"0","S"],["1996","only","-","Oct","6",["0","0","0","s"],"0","S"],["1997","only","-","Oct","12",["0","0","0","s"],"0","S"],["1998","1999","-","Mar","lastSun",["0","0","0","s"],"60","D"],["1998","2003","-","Oct","lastSun",["0","0","0","s"],"0","S"],["2000","2003","-","Apr","Sun>=1",["0","0","0","s"],"60","D"],["2004","only","-","Mar","lastSun",["0","0","0","s"],"60","D"],["2006","2010","-","Oct","lastSun",["0","0","0","s"],"0","S"],["2007","only","-","Mar","Sun>=8",["0","0","0","s"],"60","D"],["2008","only","-","Mar","Sun>=15",["0","0","0","s"],"60","D"],["2009","2010","-","Mar","Sun>=8",["0","0","0","s"],"60","D"],["2011","only","-","Mar","Sun>=15",["0","0","0","s"],"60","D"],["2011","only","-","Nov","13",["0","0","0","s"],"0","S"],["2012","only","-","Apr","1",["0","0","0","s"],"60","D"],["2012","max","-","Nov","Sun>=1",["0","0","0","s"],"0","S"],["2013","max","-","Mar","Sun>=8",["0","0","0","s"],"60","D"]],"DR":[["1966","only","-","Oct","30",["0","0","0",null],"60","D"],["1967","only","-","Feb","28",["0","0","0",null],"0","S"],["1969","1973","-","Oct","lastSun",["0","0","0",null],"30","HD"],["1970","only","-","Feb","21",["0","0","0",null],"0","S"],["1971","only","-","Jan","20",["0","0","0",null],"0","S"],["1972","1974","-","Jan","21",["0","0","0",null],"0","S"]],"Salv":[["1987","1988","-","May","Sun>=1",["0","0","0",null],"60","D"],["1987","1988","-","Sep","lastSun",["0","0","0",null],"0","S"]],"Guat":[["1973","only","-","Nov","25",["0","0","0",null],"60","D"],["1974","only","-","Feb","24",["0","0","0",null],"0","S"],["1983","only","-","May","21",["0","0","0",null],"60","D"],["1983","only","-","Sep","22",["0","0","0",null],"0","S"],["1991","only","-","Mar","23",["0","0","0",null],"60","D"],["1991","only","-","Sep","7",["0","0","0",null],"0","S"],["2006","only","-","Apr","30",["0","0","0",null],"60","D"],["2006","only","-","Oct","1",["0","0","0",null],"0","S"]],"Haiti":[["1983","only","-","May","8",["0","0","0",null],"60","D"],["1984","1987","-","Apr","lastSun",["0","0","0",null],"60","D"],["1983","1987","-","Oct","lastSun",["0","0","0",null],"0","S"],["1988","1997","-","Apr","Sun>=1",["1","0","0","s"],"60","D"],["1988","1997","-","Oct","lastSun",["1","0","0","s"],"0","S"],["2005","2006","-","Apr","Sun>=1",["0","0","0",null],"60","D"],["2005","2006","-","Oct","lastSun",["0","0","0",null],"0","S"],["2012","2015","-","Mar","Sun>=8",["2","0","0",null],"60","D"],["2012","2015","-","Nov","Sun>=1",["2","0","0",null],"0","S"]],"Hond":[["1987","1988","-","May","Sun>=1",["0","0","0",null],"60","D"],["1987","1988","-","Sep","lastSun",["0","0","0",null],"0","S"],["2006","only","-","May","Sun>=1",["0","0","0",null],"60","D"],["2006","only","-","Aug","Mon>=1",["0","0","0",null],"0","S"]],"Nic":[["1979","1980","-","Mar","Sun>=16",["0","0","0",null],"60","D"],["1979","1980","-","Jun","Mon>=23",["0","0","0",null],"0","S"],["2005","only","-","Apr","10",["0","0","0",null],"60","D"],["2005","only","-","Oct","Sun>=1",["0","0","0",null],"0","S"],["2006","only","-","Apr","30",["2","0","0",null],"60","D"],["2006","only","-","Oct","Sun>=1",["1","0","0",null],"0","S"]],"Arg":[["1930","only","-","Dec","1",["0","0","0",null],"60","S"],["1931","only","-","Apr","1",["0","0","0",null],"0","-"],["1931","only","-","Oct","15",["0","0","0",null],"60","S"],["1932","1940","-","Mar","1",["0","0","0",null],"0","-"],["1932","1939","-","Nov","1",["0","0","0",null],"60","S"],["1940","only","-","Jul","1",["0","0","0",null],"60","S"],["1941","only","-","Jun","15",["0","0","0",null],"0","-"],["1941","only","-","Oct","15",["0","0","0",null],"60","S"],["1943","only","-","Aug","1",["0","0","0",null],"0","-"],["1943","only","-","Oct","15",["0","0","0",null],"60","S"],["1946","only","-","Mar","1",["0","0","0",null],"0","-"],["1946","only","-","Oct","1",["0","0","0",null],"60","S"],["1963","only","-","Oct","1",["0","0","0",null],"0","-"],["1963","only","-","Dec","15",["0","0","0",null],"60","S"],["1964","1966","-","Mar","1",["0","0","0",null],"0","-"],["1964","1966","-","Oct","15",["0","0","0",null],"60","S"],["1967","only","-","Apr","2",["0","0","0",null],"0","-"],["1967","1968","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["1968","1969","-","Apr","Sun>=1",["0","0","0",null],"0","-"],["1974","only","-","Jan","23",["0","0","0",null],"60","S"],["1974","only","-","May","1",["0","0","0",null],"0","-"],["1988","only","-","Dec","1",["0","0","0",null],"60","S"],["1989","1993","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1989","1992","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["1999","only","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["2000","only","-","Mar","3",["0","0","0",null],"0","-"],["2007","only","-","Dec","30",["0","0","0",null],"60","S"],["2008","2009","-","Mar","Sun>=15",["0","0","0",null],"0","-"],["2008","only","-","Oct","Sun>=15",["0","0","0",null],"60","S"]],"SanLuis":[["2008","2009","-","Mar","Sun>=8",["0","0","0",null],"0","-"],["2007","2008","-","Oct","Sun>=8",["0","0","0",null],"60","S"]],"Brazil":[["1931","only","-","Oct","3",["11","0","0",null],"60","S"],["1932","1933","-","Apr","1",["0","0","0",null],"0","-"],["1932","only","-","Oct","3",["0","0","0",null],"60","S"],["1949","1952","-","Dec","1",["0","0","0",null],"60","S"],["1950","only","-","Apr","16",["1","0","0",null],"0","-"],["1951","1952","-","Apr","1",["0","0","0",null],"0","-"],["1953","only","-","Mar","1",["0","0","0",null],"0","-"],["1963","only","-","Dec","9",["0","0","0",null],"60","S"],["1964","only","-","Mar","1",["0","0","0",null],"0","-"],["1965","only","-","Jan","31",["0","0","0",null],"60","S"],["1965","only","-","Mar","31",["0","0","0",null],"0","-"],["1965","only","-","Dec","1",["0","0","0",null],"60","S"],["1966","1968","-","Mar","1",["0","0","0",null],"0","-"],["1966","1967","-","Nov","1",["0","0","0",null],"60","S"],["1985","only","-","Nov","2",["0","0","0",null],"60","S"],["1986","only","-","Mar","15",["0","0","0",null],"0","-"],["1986","only","-","Oct","25",["0","0","0",null],"60","S"],["1987","only","-","Feb","14",["0","0","0",null],"0","-"],["1987","only","-","Oct","25",["0","0","0",null],"60","S"],["1988","only","-","Feb","7",["0","0","0",null],"0","-"],["1988","only","-","Oct","16",["0","0","0",null],"60","S"],["1989","only","-","Jan","29",["0","0","0",null],"0","-"],["1989","only","-","Oct","15",["0","0","0",null],"60","S"],["1990","only","-","Feb","11",["0","0","0",null],"0","-"],["1990","only","-","Oct","21",["0","0","0",null],"60","S"],["1991","only","-","Feb","17",["0","0","0",null],"0","-"],["1991","only","-","Oct","20",["0","0","0",null],"60","S"],["1992","only","-","Feb","9",["0","0","0",null],"0","-"],["1992","only","-","Oct","25",["0","0","0",null],"60","S"],["1993","only","-","Jan","31",["0","0","0",null],"0","-"],["1993","1995","-","Oct","Sun>=11",["0","0","0",null],"60","S"],["1994","1995","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["1996","only","-","Feb","11",["0","0","0",null],"0","-"],["1996","only","-","Oct","6",["0","0","0",null],"60","S"],["1997","only","-","Feb","16",["0","0","0",null],"0","-"],["1997","only","-","Oct","6",["0","0","0",null],"60","S"],["1998","only","-","Mar","1",["0","0","0",null],"0","-"],["1998","only","-","Oct","11",["0","0","0",null],"60","S"],["1999","only","-","Feb","21",["0","0","0",null],"0","-"],["1999","only","-","Oct","3",["0","0","0",null],"60","S"],["2000","only","-","Feb","27",["0","0","0",null],"0","-"],["2000","2001","-","Oct","Sun>=8",["0","0","0",null],"60","S"],["2001","2006","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2002","only","-","Nov","3",["0","0","0",null],"60","S"],["2003","only","-","Oct","19",["0","0","0",null],"60","S"],["2004","only","-","Nov","2",["0","0","0",null],"60","S"],["2005","only","-","Oct","16",["0","0","0",null],"60","S"],["2006","only","-","Nov","5",["0","0","0",null],"60","S"],["2007","only","-","Feb","25",["0","0","0",null],"0","-"],["2007","only","-","Oct","Sun>=8",["0","0","0",null],"60","S"],["2008","max","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["2008","2011","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2012","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2013","2014","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2015","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2016","2022","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2023","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2024","2025","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2026","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2027","2033","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2034","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2035","2036","-","Feb","Sun>=15",["0","0","0",null],"0","-"],["2037","only","-","Feb","Sun>=22",["0","0","0",null],"0","-"],["2038","max","-","Feb","Sun>=15",["0","0","0",null],"0","-"]],"Chile":[["1927","1931","-","Sep","1",["0","0","0",null],"60","S"],["1928","1932","-","Apr","1",["0","0","0",null],"0","-"],["1968","only","-","Nov","3",["4","0","0","u"],"60","S"],["1969","only","-","Mar","30",["3","0","0","u"],"0","-"],["1969","only","-","Nov","23",["4","0","0","u"],"60","S"],["1970","only","-","Mar","29",["3","0","0","u"],"0","-"],["1971","only","-","Mar","14",["3","0","0","u"],"0","-"],["1970","1972","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1972","1986","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1973","only","-","Sep","30",["4","0","0","u"],"60","S"],["1974","1987","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1987","only","-","Apr","12",["3","0","0","u"],"0","-"],["1988","1990","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1988","1989","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1990","only","-","Sep","16",["4","0","0","u"],"60","S"],["1991","1996","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1991","1997","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["1997","only","-","Mar","30",["3","0","0","u"],"0","-"],["1998","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["1998","only","-","Sep","27",["4","0","0","u"],"60","S"],["1999","only","-","Apr","4",["3","0","0","u"],"0","-"],["1999","2010","-","Oct","Sun>=9",["4","0","0","u"],"60","S"],["2000","2007","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2008","only","-","Mar","30",["3","0","0","u"],"0","-"],["2009","only","-","Mar","Sun>=9",["3","0","0","u"],"0","-"],["2010","only","-","Apr","Sun>=1",["3","0","0","u"],"0","-"],["2011","only","-","May","Sun>=2",["3","0","0","u"],"0","-"],["2011","only","-","Aug","Sun>=16",["4","0","0","u"],"60","S"],["2012","2014","-","Apr","Sun>=23",["3","0","0","u"],"0","-"],["2012","2014","-","Sep","Sun>=2",["4","0","0","u"],"60","S"],["2016","max","-","May","Sun>=9",["3","0","0","u"],"0","-"],["2016","max","-","Aug","Sun>=9",["4","0","0","u"],"60","S"]],"CO":[["1992","only","-","May","3",["0","0","0",null],"60","S"],["1993","only","-","Apr","4",["0","0","0",null],"0","-"]],"Falk":[["1937","1938","-","Sep","lastSun",["0","0","0",null],"60","S"],["1938","1942","-","Mar","Sun>=19",["0","0","0",null],"0","-"],["1939","only","-","Oct","1",["0","0","0",null],"60","S"],["1940","1942","-","Sep","lastSun",["0","0","0",null],"60","S"],["1943","only","-","Jan","1",["0","0","0",null],"0","-"],["1983","only","-","Sep","lastSun",["0","0","0",null],"60","S"],["1984","1985","-","Apr","lastSun",["0","0","0",null],"0","-"],["1984","only","-","Sep","16",["0","0","0",null],"60","S"],["1985","2000","-","Sep","Sun>=9",["0","0","0",null],"60","S"],["1986","2000","-","Apr","Sun>=16",["0","0","0",null],"0","-"],["2001","2010","-","Apr","Sun>=15",["2","0","0",null],"0","-"],["2001","2010","-","Sep","Sun>=1",["2","0","0",null],"60","S"]],"Para":[["1975","1988","-","Oct","1",["0","0","0",null],"60","S"],["1975","1978","-","Mar","1",["0","0","0",null],"0","-"],["1979","1991","-","Apr","1",["0","0","0",null],"0","-"],["1989","only","-","Oct","22",["0","0","0",null],"60","S"],["1990","only","-","Oct","1",["0","0","0",null],"60","S"],["1991","only","-","Oct","6",["0","0","0",null],"60","S"],["1992","only","-","Mar","1",["0","0","0",null],"0","-"],["1992","only","-","Oct","5",["0","0","0",null],"60","S"],["1993","only","-","Mar","31",["0","0","0",null],"0","-"],["1993","1995","-","Oct","1",["0","0","0",null],"60","S"],["1994","1995","-","Feb","lastSun",["0","0","0",null],"0","-"],["1996","only","-","Mar","1",["0","0","0",null],"0","-"],["1996","2001","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["1997","only","-","Feb","lastSun",["0","0","0",null],"0","-"],["1998","2001","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["2002","2004","-","Apr","Sun>=1",["0","0","0",null],"0","-"],["2002","2003","-","Sep","Sun>=1",["0","0","0",null],"60","S"],["2004","2009","-","Oct","Sun>=15",["0","0","0",null],"60","S"],["2005","2009","-","Mar","Sun>=8",["0","0","0",null],"0","-"],["2010","max","-","Oct","Sun>=1",["0","0","0",null],"60","S"],["2010","2012","-","Apr","Sun>=8",["0","0","0",null],"0","-"],["2013","max","-","Mar","Sun>=22",["0","0","0",null],"0","-"]],"Peru":[["1938","only","-","Jan","1",["0","0","0",null],"60","S"],["1938","only","-","Apr","1",["0","0","0",null],"0","-"],["1938","1939","-","Sep","lastSun",["0","0","0",null],"60","S"],["1939","1940","-","Mar","Sun>=24",["0","0","0",null],"0","-"],["1986","1987","-","Jan","1",["0","0","0",null],"60","S"],["1986","1987","-","Apr","1",["0","0","0",null],"0","-"],["1990","only","-","Jan","1",["0","0","0",null],"60","S"],["1990","only","-","Apr","1",["0","0","0",null],"0","-"],["1994","only","-","Jan","1",["0","0","0",null],"60","S"],["1994","only","-","Apr","1",["0","0","0",null],"0","-"]],"Uruguay":[["1923","only","-","Oct","2",["0","0","0",null],"30","HS"],["1924","1926","-","Apr","1",["0","0","0",null],"0","-"],["1924","1925","-","Oct","1",["0","0","0",null],"30","HS"],["1933","1935","-","Oct","lastSun",["0","0","0",null],"30","HS"],["1934","1936","-","Mar","Sat>=25",["23","30","0","s"],"0","-"],["1936","only","-","Nov","1",["0","0","0",null],"30","HS"],["1937","1941","-","Mar","lastSun",["0","0","0",null],"0","-"],["1937","1940","-","Oct","lastSun",["0","0","0",null],"30","HS"],["1941","only","-","Aug","1",["0","0","0",null],"30","HS"],["1942","only","-","Jan","1",["0","0","0",null],"0","-"],["1942","only","-","Dec","14",["0","0","0",null],"60","S"],["1943","only","-","Mar","14",["0","0","0",null],"0","-"],["1959","only","-","May","24",["0","0","0",null],"60","S"],["1959","only","-","Nov","15",["0","0","0",null],"0","-"],["1960","only","-","Jan","17",["0","0","0",null],"60","S"],["1960","only","-","Mar","6",["0","0","0",null],"0","-"],["1965","1967","-","Apr","Sun>=1",["0","0","0",null],"60","S"],["1965","only","-","Sep","26",["0","0","0",null],"0","-"],["1966","1967","-","Oct","31",["0","0","0",null],"0","-"],["1968","1970","-","May","27",["0","0","0",null],"30","HS"],["1968","1970","-","Dec","2",["0","0","0",null],"0","-"],["1972","only","-","Apr","24",["0","0","0",null],"60","S"],["1972","only","-","Aug","15",["0","0","0",null],"0","-"],["1974","only","-","Mar","10",["0","0","0",null],"30","HS"],["1974","only","-","Dec","22",["0","0","0",null],"60","S"],["1976","only","-","Oct","1",["0","0","0",null],"0","-"],["1977","only","-","Dec","4",["0","0","0",null],"60","S"],["1978","only","-","Apr","1",["0","0","0",null],"0","-"],["1979","only","-","Oct","1",["0","0","0",null],"60","S"],["1980","only","-","May","1",["0","0","0",null],"0","-"],["1987","only","-","Dec","14",["0","0","0",null],"60","S"],["1988","only","-","Mar","14",["0","0","0",null],"0","-"],["1988","only","-","Dec","11",["0","0","0",null],"60","S"],["1989","only","-","Mar","12",["0","0","0",null],"0","-"],["1989","only","-","Oct","29",["0","0","0",null],"60","S"],["1990","1992","-","Mar","Sun>=1",["0","0","0",null],"0","-"],["1990","1991","-","Oct","Sun>=21",["0","0","0",null],"60","S"],["1992","only","-","Oct","18",["0","0","0",null],"60","S"],["1993","only","-","Feb","28",["0","0","0",null],"0","-"],["2004","only","-","Sep","19",["0","0","0",null],"60","S"],["2005","only","-","Mar","27",["2","0","0",null],"0","-"],["2005","only","-","Oct","9",["2","0","0",null],"60","S"],["2006","only","-","Mar","12",["2","0","0",null],"0","-"],["2006","2014","-","Oct","Sun>=1",["2","0","0",null],"60","S"],["2007","2015","-","Mar","Sun>=8",["2","0","0",null],"0","-"]],"SystemV":[["NaN","1973","-","Apr","lastSun",["2","0","0",null],"60","D"],["NaN","1973","-","Oct","lastSun",["2","0","0",null],"0","S"],["1974","only","-","Jan","6",["2","0","0",null],"60","D"],["1974","only","-","Nov","lastSun",["2","0","0",null],"0","S"],["1975","only","-","Feb","23",["2","0","0",null],"60","D"],["1975","only","-","Oct","lastSun",["2","0","0",null],"0","S"],["1976","max","-","Apr","lastSun",["2","0","0",null],"60","D"],["1976","max","-","Oct","lastSun",["2","0","0",null],"0","S"]]}}

},{}],14:[function(require,module,exports){
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

},{"./assert":1,"./basics":2,"./strings":11,"./tz-database":16}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
/* tslint:disable */
var data = require("./timezone-data.json");
/* tslint:enable */
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
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * This class typescriptifies reading the TZ data
 */
var TzDatabase = (function () {
    function TzDatabase(data) {
        /**
         * Performance improvement: zone info cache
         */
        this._zoneInfoCache = {};
        /**
         * Performance improvement: rule info cache
         */
        this._ruleInfoCache = {};
        assert_1.default(!TzDatabase._instance, "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        this._data = data;
        this._minmax = validateData(data);
    }
    /**
     * Single instance of this database
     */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            TzDatabase._instance = new TzDatabase(data);
        }
        return TzDatabase._instance;
    };
    /**
     * Inject test timezone data for unittests
     */
    TzDatabase.inject = function (data) {
        TzDatabase._instance = null; // circumvent constructor check on duplicate instances
        TzDatabase._instance = new TzDatabase(data);
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

},{"./assert":1,"./basics":2,"./duration":4,"./math":8,"./timezone-data.json":13}],"timezonecomplete":[function(require,module,exports){
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

},{"./basics":2,"./datetime":3,"./duration":4,"./format":5,"./globals":6,"./javascript":7,"./parse":9,"./period":10,"./timesource":12,"./timezone":14,"./tz-database":16}]},{},[])("timezonecomplete")
});