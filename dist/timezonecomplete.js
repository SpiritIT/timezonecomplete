(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tc = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright(c) 2016 Spirit IT BV
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
exports.default = assert;
},{}],2:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var TimeStruct = /** @class */ (function () {
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
                        fractionMillis = daysInYear(year) * 86400000 * fraction;
                        break;
                    case TimeUnit.Day:
                        fractionMillis = 86400000 * fraction;
                        break;
                    case TimeUnit.Hour:
                        fractionMillis = 3600000 * fraction;
                        break;
                    case TimeUnit.Minute:
                        fractionMillis = 60000 * fraction;
                        break;
                    case TimeUnit.Second:
                        fractionMillis = 1000 * fraction;
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
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("./assert");
var basics = require("./basics");
var basics_1 = require("./basics");
var duration_1 = require("./duration");
var format = require("./format");
var javascript_1 = require("./javascript");
var math = require("./math");
var parseFuncs = require("./parse");
var timesource_1 = require("./timesource");
var timezone_1 = require("./timezone");
var tz_database_1 = require("./tz-database");
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
var DateTime = /** @class */ (function () {
    /**
     * Constructor implementation, do not call
     */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
        switch (typeof (a1)) {
            case "number":
                {
                    if (a2 === undefined || a2 === null || a2 instanceof timezone_1.TimeZone) {
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "for unix timestamp datetime constructor, third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || a2 instanceof timezone_1.TimeZone, "DateTime.DateTime(): second arg should be a TimeZone object.");
                        // unix timestamp constructor
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
                        assert_1.default(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
                        assert_1.default(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
                        assert_1.default(timeZone === undefined || timeZone === null || timeZone instanceof timezone_1.TimeZone, "DateTime.DateTime(): eighth arg should be a TimeZone object.");
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
                        assert_1.default(h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first two arguments are a string, therefore the fourth through 8th argument must be undefined");
                        assert_1.default(a3 === undefined || a3 === null || a3 instanceof timezone_1.TimeZone, "DateTime.DateTime(): third arg should be a TimeZone object.");
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
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first arguments is a string and the second is not, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || a2 instanceof timezone_1.TimeZone, "DateTime.DateTime(): second arg should be a TimeZone object.");
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
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first argument is a TimeStruct, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || a2 instanceof timezone_1.TimeZone, "expect a TimeZone as second argument");
                        this._zoneDate = a1.clone();
                        this._zone = (a2 ? a2 : undefined);
                    }
                    else if (a1 instanceof Date) {
                        assert_1.default(h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first argument is a Date, therefore the fourth through 8th argument must be undefined");
                        assert_1.default(typeof (a2) === "number" && (a2 === javascript_1.DateFunctions.Get || a2 === javascript_1.DateFunctions.GetUTC), "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        assert_1.default(a3 === undefined || a3 === null || a3 instanceof timezone_1.TimeZone, "DateTime.DateTime(): third arg should be a TimeZone object.");
                        var d = (a1);
                        var dk = (a2);
                        this._zone = (a3 ? a3 : undefined);
                        this._zoneDate = basics_1.TimeStruct.fromDate(d, dk);
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
                        }
                    }
                    else {
                        assert_1.default(false, "DateTime constructor expected a Date or a TimeStruct but got a " + a1);
                    }
                }
                break;
            case "undefined":
                {
                    assert_1.default(a2 === undefined && a3 === undefined && h === undefined && m === undefined
                        && s === undefined && ms === undefined && timeZone === undefined, "first argument is undefined, therefore the rest must also be undefined");
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var Duration = /** @class */ (function () {
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
},{"./assert":1,"./basics":2,"./strings":11}],5:[function(require,module,exports){
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var basics = require("./basics");
var strings = require("./strings");
var token_1 = require("./token");
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
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
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
                case 4:// No seconds in our implementation, so this is the same
                    return offsetHoursString + offsetMinutesString;
                case 3:
                case 5:// No seconds in our implementation, so this is the same
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
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
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
"use strict";
/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
Object.defineProperty(exports, "__esModule", { value: true });
var basics_1 = require("./basics");
var timezone_1 = require("./timezone");
var token_1 = require("./token");
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
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
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
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var datetime_1 = require("./datetime");
var duration_1 = require("./duration");
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
var Period = /** @class */ (function () {
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
     * @return the first date matching the period after fromDate, given in the same zone as the fromDate.
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
     *         in the same zone as the fromDate.
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
Object.defineProperty(exports, "__esModule", { value: true });
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default time source, returns actual time
 */
var RealTimeSource = /** @class */ (function () {
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var TimeZone = /** @class */ (function () {
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
    /**
     * Time zone cache.
     */
    TimeZone._cache = {};
    return TimeZone;
}());
exports.TimeZone = TimeZone;
},{"./assert":1,"./basics":2,"./strings":11,"./tz-database":15}],14:[function(require,module,exports){
/**
 * Functionality to parse a DateTime object to a string
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tokenizer = /** @class */ (function () {
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
        for (var _i = 0, _a = this._formatString; _i < _a.length; _i++) {
            var currentChar = _a[_i];
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
    G: DateTimeTokenType.ERA,
    y: DateTimeTokenType.YEAR,
    Y: DateTimeTokenType.YEAR,
    u: DateTimeTokenType.YEAR,
    U: DateTimeTokenType.YEAR,
    r: DateTimeTokenType.YEAR,
    Q: DateTimeTokenType.QUARTER,
    q: DateTimeTokenType.QUARTER,
    M: DateTimeTokenType.MONTH,
    L: DateTimeTokenType.MONTH,
    l: DateTimeTokenType.MONTH,
    w: DateTimeTokenType.WEEK,
    W: DateTimeTokenType.WEEK,
    d: DateTimeTokenType.DAY,
    D: DateTimeTokenType.DAY,
    F: DateTimeTokenType.DAY,
    g: DateTimeTokenType.DAY,
    E: DateTimeTokenType.WEEKDAY,
    e: DateTimeTokenType.WEEKDAY,
    c: DateTimeTokenType.WEEKDAY,
    a: DateTimeTokenType.DAYPERIOD,
    h: DateTimeTokenType.HOUR,
    H: DateTimeTokenType.HOUR,
    k: DateTimeTokenType.HOUR,
    K: DateTimeTokenType.HOUR,
    j: DateTimeTokenType.HOUR,
    J: DateTimeTokenType.HOUR,
    m: DateTimeTokenType.MINUTE,
    s: DateTimeTokenType.SECOND,
    S: DateTimeTokenType.SECOND,
    A: DateTimeTokenType.SECOND,
    z: DateTimeTokenType.ZONE,
    Z: DateTimeTokenType.ZONE,
    O: DateTimeTokenType.ZONE,
    v: DateTimeTokenType.ZONE,
    V: DateTimeTokenType.ZONE,
    X: DateTimeTokenType.ZONE,
    x: DateTimeTokenType.ZONE
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var RuleInfo = /** @class */ (function () {
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
var ZoneInfo = /** @class */ (function () {
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
var Transition = /** @class */ (function () {
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
var TzDatabase = /** @class */ (function () {
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
                            // nothing
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
            for (var _i = 0, zoneInfos_1 = zoneInfos; _i < zoneInfos_1.length; _i++) {
                var zoneInfo = zoneInfos_1[_i];
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
                    for (var _a = 0, temp_1 = temp; _a < temp_1.length; _a++) {
                        var ruleInfo = temp_1[_a];
                        if (!result || result.greaterThan(ruleInfo.save)) {
                            if (ruleInfo.save.milliseconds() !== 0) {
                                result = ruleInfo.save;
                            }
                        }
                    }
                }
            }
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
            for (var _i = 0, zoneInfos_2 = zoneInfos; _i < zoneInfos_2.length; _i++) {
                var zoneInfo = zoneInfos_2[_i];
                if (zoneInfo.ruleType === RuleType.Offset) {
                    if (!result || result.lessThan(zoneInfo.ruleOffset)) {
                        result = zoneInfo.ruleOffset;
                    }
                }
                if (zoneInfo.ruleType === RuleType.RuleName
                    && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = this.getRuleInfos(zoneInfo.ruleName);
                    for (var _a = 0, temp_2 = temp; _a < temp_2.length; _a++) {
                        var ruleInfo = temp_2[_a];
                        if (!result || result.lessThan(ruleInfo.save)) {
                            result = ruleInfo.save;
                        }
                    }
                }
            }
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
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct(a) : a);
        // get all zone infos for [date, date+1year)
        var allZoneInfos = this.getZoneInfos(zoneName);
        var relevantZoneInfos = [];
        var rangeStart = utcTime.unixMillis;
        var rangeEnd = rangeStart + 365 * 86400E3;
        var prevEnd;
        for (var _i = 0, allZoneInfos_1 = allZoneInfos; _i < allZoneInfos_1.length; _i++) {
            var zoneInfo = allZoneInfos_1[_i];
            if ((prevEnd === undefined || prevEnd < rangeEnd) && (zoneInfo.until === undefined || zoneInfo.until > rangeStart)) {
                relevantZoneInfos.push(zoneInfo);
            }
            prevEnd = zoneInfo.until;
        }
        // collect all transitions in the zones for the year
        var transitions = [];
        for (var _a = 0, relevantZoneInfos_1 = relevantZoneInfos; _a < relevantZoneInfos_1.length; _a++) {
            var zoneInfo = relevantZoneInfos_1[_a];
            // find applicable transition moments
            transitions = transitions.concat(this.getTransitionsDstOffsets(zoneInfo.ruleName, utcTime.components.year - 1, utcTime.components.year + 1, zoneInfo.gmtoff));
        }
        transitions.sort(function (a, b) {
            return a.at - b.at;
        });
        // find the first after the given date that has a different offset
        var prevSave;
        for (var _b = 0, transitions_1 = transitions; _b < transitions_1.length; _b++) {
            var transition = transitions_1[_b];
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
            for (var _i = 0, transitions_2 = transitions; _i < transitions_2.length; _i++) {
                var transition = transitions_2[_i];
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
            // no non-existing time
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
            default:// cannot happen, but the compiler doesnt realize it
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
        for (var _i = 0, zoneInfos_3 = zoneInfos; _i < zoneInfos_3.length; _i++) {
            var zoneInfo = zoneInfos_3[_i];
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
        for (var _i = 0, transitions_3 = transitions; _i < transitions_3.length; _i++) {
            var transition = transitions_3[_i];
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
            for (var _i = 0, ruleInfos_1 = ruleInfos; _i < ruleInfos_1.length; _i++) {
                var ruleInfo = ruleInfos_1[_i];
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
        for (var _i = 0, zoneInfos_4 = zoneInfos; _i < zoneInfos_4.length; _i++) {
            var zoneInfo = zoneInfos_4[_i];
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
                            for (var _a = 0, ruleInfos_2 = ruleInfos; _a < ruleInfos_2.length; _a++) {
                                var ruleInfo = ruleInfos_2[_a];
                                if (typeof prevUntilYear === "number" && ruleInfo.applicable(prevUntilYear)) {
                                    if (ruleInfo.transitionTimeUtc(prevUntilYear, stdOffset, undefined) === prevZone.until) {
                                        dstOffset = ruleInfo.save;
                                        letter = ruleInfo.letter;
                                    }
                                }
                            }
                        }
                        break;
                }
                // add a transition for the zone transition
                var at = (prevZone && prevZone.until !== undefined ? prevZone.until : startMillis);
                result.push(new Transition(at, stdOffset.add(dstOffset), letter));
                // add transitions for the zone rules in the range
                if (zoneInfo.ruleType === RuleType.RuleName) {
                    var dstTransitions = this.getTransitionsDstOffsets(zoneInfo.ruleName, prevUntilYear !== undefined ? Math.max(prevUntilYear, fromYear) : fromYear, Math.min(untilYear, toYear), stdOffset);
                    for (var _b = 0, dstTransitions_1 = dstTransitions; _b < dstTransitions_1.length; _b++) {
                        var transition = dstTransitions_1[_b];
                        letter = transition.letter;
                        dstOffset = transition.offset;
                        result.push(new Transition(transition.at, transition.offset.add(stdOffset), transition.letter));
                    }
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
        for (var _i = 0, zoneInfos_5 = zoneInfos; _i < zoneInfos_5.length; _i++) {
            var zoneInfo = zoneInfos_5[_i];
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
        for (var _i = 0, zoneEntries_1 = zoneEntries; _i < zoneEntries_1.length; _i++) {
            var zoneEntry = zoneEntries_1[_i];
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
        for (var _i = 0, ruleSet_1 = ruleSet; _i < ruleSet_1.length; _i++) {
            var rule = ruleSet_1[_i];
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
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0JBQWdCLFNBQWMsRUFBRSxPQUFlO0lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLENBQUM7QUFDRixDQUFDO0FBRUQsa0JBQWUsTUFBTSxDQUFDOztBQ1p0Qjs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQUViLG1DQUE4QjtBQUM5QiwyQ0FBNkM7QUFDN0MsNkJBQStCO0FBQy9CLG1DQUFxQztBQXNFckM7OztHQUdHO0FBQ0gsSUFBWSxPQVFYO0FBUkQsV0FBWSxPQUFPO0lBQ2xCLHlDQUFNLENBQUE7SUFDTix5Q0FBTSxDQUFBO0lBQ04sMkNBQU8sQ0FBQTtJQUNQLCtDQUFTLENBQUE7SUFDVCw2Q0FBUSxDQUFBO0lBQ1IseUNBQU0sQ0FBQTtJQUNOLDZDQUFRLENBQUE7QUFDVCxDQUFDLEVBUlcsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBUWxCO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLFFBYVg7QUFiRCxXQUFZLFFBQVE7SUFDbkIscURBQVcsQ0FBQTtJQUNYLDJDQUFNLENBQUE7SUFDTiwyQ0FBTSxDQUFBO0lBQ04sdUNBQUksQ0FBQTtJQUNKLHFDQUFHLENBQUE7SUFDSCx1Q0FBSSxDQUFBO0lBQ0oseUNBQUssQ0FBQTtJQUNMLHVDQUFJLENBQUE7SUFDSjs7T0FFRztJQUNILHFDQUFHLENBQUE7QUFDSixDQUFDLEVBYlcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFhbkI7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsZ0NBQXVDLElBQWM7SUFDcEQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNkLEtBQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2xDLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN2QyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzFDLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ25DLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUN4QyxLQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDMUMsS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUM5QywwQkFBMEI7UUFDMUI7WUFDQyx3QkFBd0I7WUFDeEIsMEJBQTBCO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7SUFDSCxDQUFDO0FBQ0YsQ0FBQztBQWxCRCx3REFrQkM7QUFFRDs7Ozs7R0FLRztBQUNILDBCQUFpQyxJQUFjLEVBQUUsTUFBa0I7SUFBbEIsdUJBQUEsRUFBQSxVQUFrQjtJQUNsRSxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDNUMsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNyQixDQUFDO0FBQ0YsQ0FBQztBQVBELDRDQU9DO0FBRUQsMEJBQWlDLENBQVM7SUFDekMsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZDLElBQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUM7SUFDRixDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQVRELDRDQVNDO0FBRUQ7O0dBRUc7QUFDSCxvQkFBMkIsSUFBWTtJQUN0QyxrQkFBa0I7SUFDbEIsaURBQWlEO0lBQ2pELHNEQUFzRDtJQUN0RCx3REFBd0Q7SUFDeEQsaUJBQWlCO0lBQ2pCLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2IsQ0FBQztBQUNGLENBQUM7QUFmRCxnQ0FlQztBQUVEOztHQUVHO0FBQ0gsb0JBQTJCLElBQVk7SUFDdEMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFGRCxnQ0FFQztBQUVEOzs7O0dBSUc7QUFDSCxxQkFBNEIsSUFBWSxFQUFFLEtBQWE7SUFDdEQsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRTtZQUNOLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDWCxLQUFLLENBQUM7WUFDTCxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxFQUFFO1lBQ04sTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNYO1lBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUM3QyxDQUFDO0FBQ0YsQ0FBQztBQXBCRCxrQ0FvQkM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxtQkFBMEIsSUFBWSxFQUFFLEtBQWEsRUFBRSxHQUFXO0lBQ2pFLGdCQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDeEQsZ0JBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDeEUsSUFBSSxPQUFPLEdBQVcsQ0FBQyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyQixNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ2hCLENBQUM7QUFURCw4QkFTQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsNEJBQW1DLElBQVksRUFBRSxLQUFhLEVBQUUsT0FBZ0I7SUFDL0UsSUFBTSxVQUFVLEdBQWUsSUFBSSxVQUFVLENBQUMsRUFBRSxJQUFJLE1BQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUYsSUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkUsSUFBSSxJQUFJLEdBQVcsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0lBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ3pDLENBQUM7QUFSRCxnREFRQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsNkJBQW9DLElBQVksRUFBRSxLQUFhLEVBQUUsT0FBZ0I7SUFDaEYsSUFBTSxZQUFZLEdBQWUsSUFBSSxVQUFVLENBQUMsRUFBRSxJQUFJLE1BQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUN4RSxJQUFNLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2RSxJQUFJLElBQUksR0FBVyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7SUFDakQsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDM0MsQ0FBQztBQVJELGtEQVFDO0FBRUQ7OztHQUdHO0FBQ0gsMEJBQWlDLElBQVksRUFBRSxLQUFhLEVBQUUsR0FBVyxFQUFFLE9BQWdCO0lBQzFGLElBQU0sS0FBSyxHQUFlLElBQUksVUFBVSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELElBQU0sWUFBWSxHQUFZLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsRSxJQUFJLElBQUksR0FBVyxPQUFPLEdBQUcsWUFBWSxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDRCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7SUFDdkcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNwQyxDQUFDO0FBVEQsNENBU0M7QUFFRDs7O0dBR0c7QUFDSCwyQkFBa0MsSUFBWSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsT0FBZ0I7SUFDM0YsSUFBTSxLQUFLLEdBQWUsSUFBSSxVQUFVLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxHQUFHLEtBQUEsRUFBQyxDQUFDLENBQUM7SUFDN0QsSUFBTSxZQUFZLEdBQVksaUJBQWlCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xFLElBQUksSUFBSSxHQUFXLE9BQU8sR0FBRyxZQUFZLENBQUM7SUFDMUMsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELGdCQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDcEMsQ0FBQztBQVRELDhDQVNDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gscUJBQTRCLElBQVksRUFBRSxLQUFhLEVBQUUsR0FBVztJQUNuRSxJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RSxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRSx3RUFBd0U7SUFDeEUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdkIsRUFBRSxDQUFDLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakMsU0FBUztZQUNULE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCw4QkFBOEI7WUFDOUIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsZUFBZTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxVQUFVO2dCQUNWLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsSUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkUsd0VBQXdFO0lBQ3hFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQy9CLHVCQUF1QjtZQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztJQUNGLENBQUM7SUFFRCxjQUFjO0lBQ2QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckQsRUFBRSxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxJQUFJLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQXJDRCxrQ0FxQ0M7QUFFRDs7OztHQUlHO0FBQ0gsNkJBQTZCLElBQVk7SUFDeEMsaUVBQWlFO0lBQ2pFLElBQUksTUFBTSxHQUFXLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEUsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNaLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0YsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILG9CQUEyQixJQUFZLEVBQUUsS0FBYSxFQUFFLEdBQVc7SUFDbEUsSUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFeEMsNERBQTREO0lBQzVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBTSxlQUFlLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksZUFBZSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUM7SUFDRixDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLElBQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xELEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLGdDQUFnQztRQUNoQyxJQUFNLE9BQU8sR0FBRyxlQUFlLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0YsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMzQixrREFBa0Q7UUFDbEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsMERBQTBEO0lBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBL0JELGdDQStCQztBQUVELDZCQUE2QixVQUFrQjtJQUM5QyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxRQUFRLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUNsRSxnQkFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLDJCQUEyQixDQUFDLENBQUM7SUFDeEQsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLDhDQUE4QyxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVEOzs7R0FHRztBQUNILDhCQUFxQyxVQUFrQjtJQUN0RCxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVoQyxJQUFJLElBQUksR0FBVyxVQUFVLENBQUM7SUFDOUIsSUFBTSxNQUFNLEdBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO0lBQ3JHLElBQUksSUFBWSxDQUFDO0lBQ2pCLElBQUksS0FBYSxDQUFDO0lBRWxCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFN0IsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNaLE9BQU8sSUFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsSUFBSSxFQUFFLENBQUM7UUFDUixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbkIsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNWLE9BQU8sSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqQyxLQUFLLEVBQUUsQ0FBQztRQUNULENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AseUVBQXlFO1FBQ3pFLDRDQUE0QztRQUM1QyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUU3QixJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osT0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksRUFBRSxDQUFDO1FBQ1IsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRW5CLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqQyxLQUFLLEVBQUUsQ0FBQztRQUNULENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNmLENBQUM7QUE3REQsb0RBNkRDO0FBRUQ7O0dBRUc7QUFDSCxpQ0FBaUMsVUFBNkI7SUFDN0QsSUFBTSxLQUFLLEdBQUc7UUFDYixJQUFJLEVBQUUsT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNsRSxLQUFLLEVBQUUsT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxHQUFHLEVBQUUsT0FBTyxVQUFVLENBQUMsR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFJLEVBQUUsT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxNQUFNLEVBQUUsT0FBTyxVQUFVLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLEVBQUUsT0FBTyxVQUFVLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxLQUFLLEVBQUUsT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsRSxDQUFDO0lBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFrQkQsOEJBQ0MsQ0FBNkIsRUFBRSxLQUFjLEVBQUUsR0FBWSxFQUFFLElBQWEsRUFBRSxNQUFlLEVBQUUsTUFBZSxFQUFFLEtBQWM7SUFFNUgsSUFBTSxVQUFVLEdBQXNCLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekgsSUFBTSxLQUFLLEdBQW1CLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUMzQixLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUs7UUFDNUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLO1FBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDdkcsQ0FBQztBQVRELG9EQVNDO0FBRUQ7OztHQUdHO0FBQ0gsMkJBQWtDLFVBQWtCO0lBQ25ELG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRWhDLElBQU0sUUFBUSxHQUFZLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDM0MsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELE1BQU0sQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQU5ELDhDQU1DO0FBRUQ7O0dBRUc7QUFDSCxxQkFBNEIsSUFBWSxFQUFFLE1BQWMsRUFBRSxNQUFjO0lBQ3ZFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQy9DLENBQUM7QUFGRCxrQ0FFQztBQUVEOztHQUVHO0FBQ0g7SUE4TUM7O09BRUc7SUFDSCxvQkFBWSxDQUE2QjtRQUN4QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxXQUFXLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNGLENBQUM7SUFyTkQ7Ozs7Ozs7Ozs7T0FVRztJQUNXLHlCQUFjLEdBQTVCLFVBQ0MsSUFBYSxFQUFFLEtBQWMsRUFBRSxHQUFZLEVBQzNDLElBQWEsRUFBRSxNQUFlLEVBQUUsTUFBZSxFQUFFLEtBQWM7UUFFL0QsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7O09BR0c7SUFDVyxtQkFBUSxHQUF0QixVQUF1QixVQUFrQjtRQUN4QyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ1csbUJBQVEsR0FBdEIsVUFBdUIsQ0FBTyxFQUFFLEVBQWlCO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSywwQkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDO2dCQUNyQixJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUNoRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUM5RixDQUFDLENBQUM7UUFDSixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUM7Z0JBQ3JCLElBQUksRUFBRSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pFLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsa0JBQWtCLEVBQUU7YUFDMUcsQ0FBQyxDQUFDO1FBQ0osQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNXLHFCQUFVLEdBQXhCLFVBQXlCLENBQVM7UUFDakMsSUFBSSxDQUFDO1lBQ0osSUFBSSxJQUFJLEdBQVcsSUFBSSxDQUFDO1lBQ3hCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUM7WUFDcEIsSUFBSSxJQUFJLEdBQVcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7WUFDdkIsSUFBSSxjQUFjLEdBQVcsQ0FBQyxDQUFDO1lBQy9CLElBQUksUUFBUSxHQUFhLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFFdkMsK0JBQStCO1lBQy9CLElBQU0sS0FBSyxHQUFhLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBRWpGLGtCQUFrQjtZQUNsQixJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsRUFDMUQsa0ZBQWtGLENBQUMsQ0FBQztnQkFFckYsMkJBQTJCO2dCQUMzQixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRXJDLGdCQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDeEQsd0ZBQXdGLENBQUMsQ0FBQztnQkFFM0YsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMzQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDMUIsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQywyRUFBMkU7b0JBQ3RILFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUN6QixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDM0IsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0MsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQixNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM5QyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzlDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM1QixDQUFDO1lBQ0YsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNQLGdCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3BHLElBQUksV0FBVyxHQUFhLEVBQUUsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLFdBQVcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0QsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxXQUFXLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7Z0JBQ0QsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUNuRCx3RkFBd0YsQ0FBQyxDQUFDO2dCQUUzRixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLElBQUksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2pELFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUMxQixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDakMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDbEQsR0FBRyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLDJFQUEyRTtvQkFDNUgsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNqRCxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDMUIsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ25ELFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM1QixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDbkQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzVCLENBQUM7WUFDRixDQUFDO1lBRUQsd0JBQXdCO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBTSxRQUFRLEdBQVcsVUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckQsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDbEIsS0FBSyxRQUFRLENBQUMsSUFBSTt3QkFDakIsY0FBYyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO3dCQUN4RCxLQUFLLENBQUM7b0JBQ1AsS0FBSyxRQUFRLENBQUMsR0FBRzt3QkFDaEIsY0FBYyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUM7d0JBQ3JDLEtBQUssQ0FBQztvQkFDUCxLQUFLLFFBQVEsQ0FBQyxJQUFJO3dCQUNqQixjQUFjLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQzt3QkFDcEMsS0FBSyxDQUFDO29CQUNQLEtBQUssUUFBUSxDQUFDLE1BQU07d0JBQ25CLGNBQWMsR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFDO3dCQUNsQyxLQUFLLENBQUM7b0JBQ1AsS0FBSyxRQUFRLENBQUMsTUFBTTt3QkFDbkIsY0FBYyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUM7d0JBQ2pDLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0YsQ0FBQztZQUVELG1DQUFtQztZQUNuQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixJQUFJLFVBQVUsR0FBVyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLElBQUksTUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUMsQ0FBQztZQUMxRixVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RSxDQUFDO0lBQ0YsQ0FBQztJQU1ELHNCQUFXLGtDQUFVO2FBQXJCO1lBQ0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsV0FBVyxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyxrQ0FBVTthQUFyQjtZQUNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQXlCRCxzQkFBSSw0QkFBSTthQUFSO1lBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksNkJBQUs7YUFBVDtZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJCQUFHO2FBQVA7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDNUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw0QkFBSTthQUFSO1lBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksOEJBQU07YUFBVjtZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDhCQUFNO2FBQVY7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw2QkFBSzthQUFUO1lBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQzlCLENBQUM7OztPQUFBO0lBRUQ7O09BRUc7SUFDSSw0QkFBTyxHQUFkO1FBQ0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTSwyQkFBTSxHQUFiLFVBQWMsS0FBaUI7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVNLDRCQUFPLEdBQWQ7UUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4QixDQUFDO0lBRU0sMEJBQUssR0FBWjtRQUNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLDZCQUFRLEdBQWY7UUFDQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUU7bUJBQzVELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7bUJBQzNHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxFQUFFO21CQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRTttQkFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLEVBQUU7bUJBQzNELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7UUFDaEUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNiLENBQUM7SUFDRixDQUFDO0lBRUQ7O09BRUc7SUFDSSw2QkFBUSxHQUFmO1FBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDOUQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDakUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDL0QsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMs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QyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDNUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFNUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDMUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFDMUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEtBQUs7SUFFMUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDeEIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDeEIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFDeEIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEdBQUc7SUFFeEIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDNUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFDNUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87SUFFNUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7SUFFOUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFDekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUk7SUFFekIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFFM0IsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDM0IsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE1BQU07SUFDM0IsQ0FBQyxFQUFFLGlC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R0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7dUJBQzdELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzRixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsNkNBQTZDLENBQUMsQ0FBQztnQkFDNUcsQ0FBQztnQkFDRCxJQUFNLElBQUksR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyx3QkFBd0I7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2pFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUMxQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDakUsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzFCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFvQixDQUFDO0FBQzdCLENBQUM7Ozs7QUNsbEREOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7O0FBRWIsOEJBQXlCO0FBQ3pCLGdDQUEyQjtBQUMzQixnQ0FBMkI7QUFDM0IsOEJBQXlCO0FBQ3pCLCtCQUEwQjtBQUMxQixrQ0FBNkI7QUFDN0IsNkJBQXdCO0FBQ3hCLDhCQUF5QjtBQUN6Qiw4QkFBeUI7QUFDekIsa0NBQTZCO0FBQzdCLGdDQUEyQjtBQUMzQixtQ0FBOEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYW55LCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRpZiAoIWNvbmRpdGlvbikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXNzZXJ0O1xyXG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5cbi8qKlxuICogVXNlZCBmb3IgbWV0aG9kcyB0aGF0IHRha2UgYSB0aW1lc3RhbXAgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRPcHRzIHtcblx0LyoqXG5cdCAqIFllYXIsIGRlZmF1bHQgMTk3MFxuXHQgKi9cblx0eWVhcj86IG51bWJlcjtcblx0LyoqXG5cdCAqIE1vbnRoIDEtMTIsIGRlZmF1bHQgMVxuXHQgKi9cblx0bW9udGg/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEYXkgb2YgbW9udGggMS0zMSwgZGVmYXVsdCAxXG5cdCAqL1xuXHRkYXk/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBIb3VyIG9mIGRheSAwLTIzLCBkZWZhdWx0IDBcblx0ICovXG5cdGhvdXI/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaW51dGUgMC01OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRtaW51dGU/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBTZWNvbmQgMC01OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRzZWNvbmQ/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZCAwLTk5OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRtaWxsaT86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBUaW1lc3RhbXAgcmVwcmVzZW50ZWQgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRzIHtcblx0LyoqXG5cdCAqIFllYXJcblx0ICovXG5cdHllYXI6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1vbnRoIDEtMTJcblx0ICovXG5cdG1vbnRoOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEYXkgb2YgbW9udGggMS0zMVxuXHQgKi9cblx0ZGF5OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBIb3VyIDAtMjNcblx0ICovXG5cdGhvdXI6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1pbnV0ZVxuXHQgKi9cblx0bWludXRlOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBTZWNvbmRcblx0ICovXG5cdHNlY29uZDogbnVtYmVyO1xuXHQvKipcblx0ICogTWlsbGlzZWNvbmQgMC05OTlcblx0ICovXG5cdG1pbGxpOiBudW1iZXI7XG59XG5cbi8qKlxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXG4gKi9cbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xuXHRTdW5kYXksXG5cdE1vbmRheSxcblx0VHVlc2RheSxcblx0V2VkbmVzZGF5LFxuXHRUaHVyc2RheSxcblx0RnJpZGF5LFxuXHRTYXR1cmRheVxufVxuXG4vKipcbiAqIFRpbWUgdW5pdHNcbiAqL1xuZXhwb3J0IGVudW0gVGltZVVuaXQge1xuXHRNaWxsaXNlY29uZCxcblx0U2Vjb25kLFxuXHRNaW51dGUsXG5cdEhvdXIsXG5cdERheSxcblx0V2Vlayxcblx0TW9udGgsXG5cdFllYXIsXG5cdC8qKlxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXIsIGRvIG5vdCB1c2Vcblx0ICovXG5cdE1BWFxufVxuXG4vKipcbiAqIEFwcHJveGltYXRlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGEgdGltZSB1bml0LlxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxuICpcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XG5cdHN3aXRjaCAodW5pdCkge1xuXHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xuXHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcblx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcblx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXRcIik7XG5cdFx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxuICogaWYgbmVjZXNzYXJ5LlxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb1N0cmluZyh1bml0OiBUaW1lVW5pdCwgYW1vdW50OiBudW1iZXIgPSAxKTogc3RyaW5nIHtcblx0Y29uc3QgcmVzdWx0ID0gVGltZVVuaXRbdW5pdF0udG9Mb3dlckNhc2UoKTtcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvVGltZVVuaXQoczogc3RyaW5nKTogVGltZVVuaXQge1xuXHRjb25zdCB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xuXHRcdGNvbnN0IG90aGVyID0gdGltZVVuaXRUb1N0cmluZyhpLCAxKTtcblx0XHRpZiAob3RoZXIgPT09IHRyaW1tZWQgfHwgKG90aGVyICsgXCJzXCIpID09PSB0cmltbWVkKSB7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdH1cblx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XG59XG5cbi8qKlxuICogQHJldHVybiBUcnVlIGlmZiB0aGUgZ2l2ZW4geWVhciBpcyBhIGxlYXAgeWVhci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XG5cdC8vIGZyb20gV2lraXBlZGlhOlxuXHQvLyBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNCB0aGVuIGNvbW1vbiB5ZWFyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxuXHQvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxuXHQvLyBlbHNlIGxlYXAgeWVhclxuXHRpZiAoeWVhciAlIDQgIT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcblx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpOiBudW1iZXIge1xuXHRzd2l0Y2ggKG1vbnRoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMzpcblx0XHRjYXNlIDU6XG5cdFx0Y2FzZSA3OlxuXHRcdGNhc2UgODpcblx0XHRjYXNlIDEwOlxuXHRcdGNhc2UgMTI6XG5cdFx0XHRyZXR1cm4gMzE7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCk7XG5cdFx0Y2FzZSA0OlxuXHRcdGNhc2UgNjpcblx0XHRjYXNlIDk6XG5cdFx0Y2FzZSAxMTpcblx0XHRcdHJldHVybiAzMDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XG5cdH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXkgb2YgdGhlIHllYXIgb2YgdGhlIGdpdmVuIGRhdGUgWzAuLjM2NV0uIEphbnVhcnkgZmlyc3QgaXMgMC5cbiAqXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XG4gKiBAcGFyYW0gbW9udGggTW9udGggMS0xMlxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRhc3NlcnQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XG5cdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XG5cdGxldCB5ZWFyRGF5OiBudW1iZXIgPSAwO1xuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDwgbW9udGg7IGkrKykge1xuXHRcdHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XG5cdH1cblx0eWVhckRheSArPSAoZGF5IC0gMSk7XG5cdHJldHVybiB5ZWFyRGF5O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcbiAqXG4gKiBAcmV0dXJuIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IGVuZE9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB9KTtcblx0Y29uc3QgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoLnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xuXHRpZiAoZGlmZiA+IDApIHtcblx0XHRkaWZmIC09IDc7XG5cdH1cblx0cmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XG4gKlxuICogQHJldHVybiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IGJlZ2luT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogMX0pO1xuXHRjb25zdCBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGJlZ2luT2ZNb250aFdlZWtEYXk7XG5cdGlmIChkaWZmIDwgMCkge1xuXHRcdGRpZmYgKz0gNztcblx0fVxuXHRyZXR1cm4gYmVnaW5PZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3Qgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXkgfSk7XG5cdGNvbnN0IHN0YXJ0V2Vla0RheTogV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcblx0aWYgKGRpZmYgPCAwKSB7XG5cdFx0ZGlmZiArPSA3O1xuXHR9XG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3Qgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7eWVhciwgbW9udGgsIGRheX0pO1xuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XG5cdGlmIChkaWZmID4gMCkge1xuXHRcdGRpZmYgLT0gNztcblx0fVxuXHRhc3NlcnQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XG5cdHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5cbi8qKlxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXG4gKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxuICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcbiAqXG4gKiBAcGFyYW0geWVhciBUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoIFRoZSBtb250aCBbMS0xMl1cbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cbiAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRjb25zdCBmaXJzdFRodXJzZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XG5cdGNvbnN0IGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcblx0aWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XG5cdFx0aWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xuXHRcdFx0Ly8gV2VlayAxXG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXG5cdFx0XHRpZiAobW9udGggPiAxKSB7XG5cdFx0XHRcdC8vIERlZmF1bHQgY2FzZVxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBKYW51YXJ5XG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsYXN0TW9uZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XG5cdGNvbnN0IGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxuXHRpZiAoZGF5ID49IGxhc3RNb25kYXkpIHtcblx0XHRpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xuXHRcdFx0Ly8gV2VlayAxIG9mIG5leHQgbW9udGhcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblx0fVxuXG5cdC8vIE5vcm1hbCBjYXNlXG5cdGxldCByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XG5cdGlmIChmaXJzdFRodXJzZGF5IDwgNCkge1xuXHRcdHJlc3VsdCArPSAxO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YteWVhciBvZiB0aGUgTW9uZGF5IG9mIHdlZWsgMSBpbiB0aGUgZ2l2ZW4geWVhci5cbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XG4gKi9cbmZ1bmN0aW9uIGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcblx0Ly8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcblx0bGV0IHJlc3VsdDogbnVtYmVyID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xuXHRpZiAocmVzdWx0ID4gMykgeyAvLyBncmVhdGVyIHRoYW4gamFuIDR0aFxuXHRcdHJlc3VsdCAtPSA3O1xuXHRcdGlmIChyZXN1bHQgPCAwKSB7XG5cdFx0XHRyZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcbiAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG4gKlxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTg4XG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXG4gKlxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRjb25zdCBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XG5cblx0Ly8gY2hlY2sgZW5kLW9mLXllYXIgY29ybmVyIGNhc2U6IG1heSBiZSB3ZWVrIDEgb2YgbmV4dCB5ZWFyXG5cdGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcblx0XHRjb25zdCBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcblx0XHRpZiAobmV4dFllYXJXZWVrT25lID4gNCAmJiBuZXh0WWVhcldlZWtPbmUgPD0gZG95KSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdH1cblxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxuXHRjb25zdCB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xuXHRpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xuXHRcdC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXG5cdFx0Y29uc3Qgd2Vla1R3byA9IHRoaXNZZWFyV2Vla09uZSArIDcgLSBkYXlzSW5ZZWFyKHllYXIgLSAxKTtcblx0XHRpZiAoZG95IDwgd2Vla1R3bykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB3ZWVrVHdvKSAvIDcpICsgMjtcblx0XHR9XG5cdH1cblxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cblx0aWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xuXHRcdC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XG5cdH1cblxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXG5cdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB0aGlzWWVhcldlZWtPbmUpIC8gNykgKyAxO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xuXHRhc3NlcnQodHlwZW9mICh1bml4TWlsbGlzKSA9PT0gXCJudW1iZXJcIiwgXCJudW1iZXIgaW5wdXQgZXhwZWN0ZWRcIik7XG5cdGFzc2VydCghaXNOYU4odW5peE1pbGxpcyksIFwiTmFOIG5vdCBleHBlY3RlZCBhcyBpbnB1dFwiKTtcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHVuaXggbWlsbGkgdGltZXN0YW1wIGludG8gYSBUaW1lVCBzdHJ1Y3R1cmUuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVDb21wb25lbnRzIHtcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcblxuXHRsZXQgdGVtcDogbnVtYmVyID0gdW5peE1pbGxpcztcblx0Y29uc3QgcmVzdWx0OiBUaW1lQ29tcG9uZW50cyA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwfTtcblx0bGV0IHllYXI6IG51bWJlcjtcblx0bGV0IG1vbnRoOiBudW1iZXI7XG5cblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xuXHRcdHJlc3VsdC5taWxsaSA9IHRlbXAgJSAxMDAwO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IHRlbXAgJSA2MDtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5ob3VyID0gdGVtcCAlIDI0O1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XG5cblx0XHR5ZWFyID0gMTk3MDtcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XG5cdFx0XHR5ZWFyKys7XG5cdFx0fVxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcblxuXHRcdG1vbnRoID0gMTtcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcblx0XHRcdHRlbXAgLT0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHRcdFx0bW9udGgrKztcblx0XHR9XG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxO1xuXHR9IGVsc2Uge1xuXHRcdC8vIE5vdGUgdGhhdCBhIG5lZ2F0aXZlIG51bWJlciBtb2R1bG8gc29tZXRoaW5nIHlpZWxkcyBhIG5lZ2F0aXZlIG51bWJlci5cblx0XHQvLyBXZSBtYWtlIGl0IHBvc2l0aXZlIGJ5IGFkZGluZyB0aGUgbW9kdWxvLlxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xuXHRcdHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcblxuXHRcdHllYXIgPSAxOTY5O1xuXHRcdHdoaWxlICh0ZW1wIDwgLWRheXNJblllYXIoeWVhcikpIHtcblx0XHRcdHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcblx0XHRcdHllYXItLTtcblx0XHR9XG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xuXG5cdFx0bW9udGggPSAxMjtcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHRcdFx0bW9udGgtLTtcblx0XHR9XG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxICsgZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogVGltZUNvbXBvbmVudHMge1xuXHRjb25zdCBpbnB1dCA9IHtcblx0XHR5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcblx0XHRtb250aDogdHlwZW9mIGNvbXBvbmVudHMubW9udGggPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1vbnRoIDogMSxcblx0XHRkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcblx0XHRob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcblx0XHRtaW51dGU6IHR5cGVvZiBjb21wb25lbnRzLm1pbnV0ZSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWludXRlIDogMCxcblx0XHRzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcblx0XHRtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcblx0fTtcblx0cmV0dXJuIGlucHV0O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSB5ZWFyLCBtb250aCwgZGF5IGV0YyBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcbiAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxuICogQHBhcmFtIGRheVx0RGF5IDEtMzFcbiAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcbiAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XG4gKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxuICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXG5cdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyLCBtaWxsaTogbnVtYmVyXG4pOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXG5cdGE6IFRpbWVDb21wb25lbnRPcHRzIHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcbik6IG51bWJlciB7XG5cdGNvbnN0IGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSA6IGEpO1xuXHRjb25zdCBpbnB1dDogVGltZUNvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcblx0cmV0dXJuIGlucHV0Lm1pbGxpICsgMTAwMCAqIChcblx0XHRpbnB1dC5zZWNvbmQgKyBpbnB1dC5taW51dGUgKiA2MCArIGlucHV0LmhvdXIgKiAzNjAwICsgZGF5T2ZZZWFyKGlucHV0LnllYXIsIGlucHV0Lm1vbnRoLCBpbnB1dC5kYXkpICogODY0MDAgK1xuXHRcdChpbnB1dC55ZWFyIC0gMTk3MCkgKiAzMTUzNjAwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTY5KSAvIDQpICogODY0MDAgLVxuXHRcdE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAxKSAvIDEwMCkgKiA4NjQwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAwICsgMjk5KSAvIDQwMCkgKiA4NjQwMCk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XG5cblx0Y29uc3QgZXBvY2hEYXk6IFdlZWtEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xuXHRjb25zdCBkYXlzID0gTWF0aC5mbG9vcih1bml4TWlsbGlzIC8gMTAwMCAvIDg2NDAwKTtcblx0cmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcbn1cblxuLyoqXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyKTogbnVtYmVyIHtcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xufVxuXG4vKipcbiAqIEJhc2ljIHJlcHJlc2VudGF0aW9uIG9mIGEgZGF0ZSBhbmQgdGltZVxuICovXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXG5cdCAqXG5cdCAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcblx0ICogQHBhcmFtIGRheVx0RGF5IDEtMzFcblx0ICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxuXHQgKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21Db21wb25lbnRzKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcblx0ICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21Vbml4KHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcblx0ICpcblx0ICogQHBhcmFtIGRcdFRoZSBkYXRlXG5cdCAqIEBwYXJhbSBkZlx0V2hpY2ggZnVuY3Rpb25zIHRvIHRha2UgKGdldFgoKSBvciBnZXRVVENYKCkpXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21EYXRlKGQ6IERhdGUsIGRmOiBEYXRlRnVuY3Rpb25zKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKGRmID09PSBEYXRlRnVuY3Rpb25zLkdldCkge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcblx0XHRcdFx0eWVhcjogZC5nZXRGdWxsWWVhcigpLCBtb250aDogZC5nZXRNb250aCgpICsgMSwgZGF5OiBkLmdldERhdGUoKSxcblx0XHRcdFx0aG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7XG5cdFx0XHRcdHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXG5cdFx0XHRcdGhvdXI6IGQuZ2V0VVRDSG91cnMoKSwgbWludXRlOiBkLmdldFVUQ01pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFVUQ1NlY29uZHMoKSwgbWlsbGk6IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKClcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xuXHRcdHRyeSB7XG5cdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gMTk3MDtcblx0XHRcdGxldCBtb250aDogbnVtYmVyID0gMTtcblx0XHRcdGxldCBkYXk6IG51bWJlciA9IDE7XG5cdFx0XHRsZXQgaG91cjogbnVtYmVyID0gMDtcblx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgc2Vjb25kOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IGZyYWN0aW9uTWlsbGlzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XG5cblx0XHRcdC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcblx0XHRcdGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcblx0XHRcdGFzc2VydChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XG5cblx0XHRcdC8vIHBhcnNlIG1haW4gcGFydFxuXHRcdFx0Y29uc3QgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XG5cdFx0XHRpZiAoaXNCYXNpY0Zvcm1hdCkge1xuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXG5cdFx0XHRcdFx0XCJJU08gc3RyaW5nIGluIGJhc2ljIG5vdGF0aW9uIG1heSBvbmx5IGNvbnRhaW4gbnVtYmVycyBiZWZvcmUgdGhlIGZyYWN0aW9uYWwgcGFydFwiKTtcblxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxuXHRcdFx0XHRzcGxpdFswXSA9IHNwbGl0WzBdLnJlcGxhY2UoXCJUXCIsIFwiXCIpO1xuXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcblx0XHRcdFx0XHRcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xuXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xuXHRcdFx0XHRcdHllYXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMCwgNCksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA4KSB7XG5cdFx0XHRcdFx0bW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xuXHRcdFx0XHRcdGhvdXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoOCwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMikge1xuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMCwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcblx0XHRcdFx0bGV0IGRhdGVBbmRUaW1lOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IHNwbGl0WzBdLnNwbGl0KFwiVFwiKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0sIFwiXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFzc2VydChbNCwgMTBdLmluZGV4T2YoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoKSAhPT0gLTEsXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcblxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDQpIHtcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xuXHRcdFx0XHRcdGRheSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig4LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDIpIHtcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xuXHRcdFx0XHRcdHNlY29uZCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cig2LCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBmcmFjdGlvbjogbnVtYmVyID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XG5cdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcblx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XG5cdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcblx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcblx0XHRcdGxldCB1bml4TWlsbGlzOiBudW1iZXIgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kIH0pO1xuXHRcdFx0dW5peE1pbGxpcyA9IG1hdGgucm91bmRTeW0odW5peE1pbGxpcyArIGZyYWN0aW9uTWlsbGlzKTtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIlwiICsgcyArIFwiXFxcIjogXCIgKyBlLm1lc3NhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB2YWx1ZSBpbiB1bml4IG1pbGxpc2Vjb25kc1xuXHQgKi9cblx0cHJpdmF0ZSBfdW5peE1pbGxpczogbnVtYmVyO1xuXHRwdWJsaWMgZ2V0IHVuaXhNaWxsaXMoKTogbnVtYmVyIHtcblx0XHRpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl91bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcblx0ICovXG5cdHByaXZhdGUgX2NvbXBvbmVudHM6IFRpbWVDb21wb25lbnRzO1xuXHRwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKTogVGltZUNvbXBvbmVudHMge1xuXHRcdGlmICghdGhpcy5fY29tcG9uZW50cykge1xuXHRcdFx0dGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fY29tcG9uZW50cztcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gdW5peE1pbGxpcyBtaWxsaXNlY29uZHMgc2luY2UgMS0xLTE5NzBcblx0ICovXG5cdGNvbnN0cnVjdG9yKHVuaXhNaWxsaXM6IG51bWJlcik7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gY29tcG9uZW50cyBTZXBhcmF0ZSB0aW1lc3RhbXAgY29tcG9uZW50cyAoeWVhciwgbW9udGgsIC4uLilcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihhOiBudW1iZXIgfCBUaW1lQ29tcG9uZW50T3B0cykge1xuXHRcdGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcblx0XHR9XG5cdH1cblxuXHRnZXQgeWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMueWVhcjtcblx0fVxuXG5cdGdldCBtb250aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHRnZXQgZGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHRnZXQgaG91cigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdGdldCBtaW51dGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdGdldCBzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdGdldCBtaWxsaSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XG5cdCAqL1xuXHRwdWJsaWMgeWVhckRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiBkYXlPZlllYXIodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aCwgdGhpcy5jb21wb25lbnRzLmRheSk7XG5cdH1cblxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lU3RydWN0KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XG5cdH1cblxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnVuaXhNaWxsaXM7XG5cdH1cblxuXHRwdWJsaWMgY2xvbmUoKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX3VuaXhNaWxsaXMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZSBhIHRpbWVzdGFtcC4gRmlsdGVycyBvdXQgbm9uLWV4aXN0aW5nIHZhbHVlcyBmb3IgYWxsIHRpbWUgY29tcG9uZW50c1xuXHQgKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgdGltZXN0YW1wIGlzIHZhbGlkXG5cdCAqL1xuXHRwdWJsaWMgdmFsaWRhdGUoKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcblx0XHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA8PSAyM1xuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPD0gOTk5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXG5cdFx0XHQrIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5tb250aC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taW51dGUudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG5cdH1cblxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIltUaW1lU3RydWN0OiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xuXHR9XG5cbn1cblxuXG4vKipcbiAqIEJpbmFyeSBzZWFyY2hcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcbiAqIEBwYXJhbSBjb21wYXJlIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiA8IDAgaWYgZ2l2ZW4gZWxlbWVudCBpcyBsZXNzIHRoYW4gc2VhcmNoZWQgZWxlbWVudCBldGNcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXg8VD4oYXJyOiBUW10sIGNvbXBhcmU6IChhOiBUKSA9PiBudW1iZXIpOiBudW1iZXIge1xuXHRsZXQgbWluSW5kZXggPSAwO1xuXHRsZXQgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcblx0bGV0IGN1cnJlbnRJbmRleDogbnVtYmVyO1xuXHRsZXQgY3VycmVudEVsZW1lbnQ6IFQ7XG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcblx0aWYgKCFhcnIpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cdC8vIG91dCBvZiBib3VuZHNcblx0aWYgKGNvbXBhcmUoYXJyWzBdKSA+IDApIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAoY29tcGFyZShhcnJbbWF4SW5kZXhdKSA8IDApIHtcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xuXHR9XG5cdC8vIGVsZW1lbnQgaW4gcmFuZ2Vcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XG5cdFx0Y3VycmVudEluZGV4ID0gTWF0aC5mbG9vcigobWluSW5kZXggKyBtYXhJbmRleCkgLyAyKTtcblx0XHRjdXJyZW50RWxlbWVudCA9IGFycltjdXJyZW50SW5kZXhdO1xuXG5cdFx0aWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpIDwgMCkge1xuXHRcdFx0bWluSW5kZXggPSBjdXJyZW50SW5kZXggKyAxO1xuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XG5cdFx0XHRtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG1heEluZGV4O1xufVxuXG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIERhdGUrdGltZSt0aW1lem9uZSByZXByZXNlbnRhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgVGltZVN0cnVjdCwgVGltZVVuaXQsIFdlZWtEYXkgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcbmltcG9ydCAqIGFzIGZvcm1hdCBmcm9tIFwiLi9mb3JtYXRcIjtcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcbmltcG9ydCAqIGFzIHBhcnNlRnVuY3MgZnJvbSBcIi4vcGFyc2VcIjtcbmltcG9ydCB7IFJlYWxUaW1lU291cmNlLCBUaW1lU291cmNlIH0gZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5pbXBvcnQgeyBOb3JtYWxpemVPcHRpb24gfSBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xuXG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcblx0cmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XG59XG5cbi8qKlxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vd1V0YygpOiBEYXRlVGltZSB7XG5cdHJldHVybiBEYXRlVGltZS5ub3dVdGMoKTtcbn1cblxuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3codGltZVpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkIHwgbnVsbCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xuXHRyZXR1cm4gRGF0ZVRpbWUubm93KHRpbWVab25lKTtcbn1cblxuZnVuY3Rpb24gY29udmVydFRvVXRjKGxvY2FsVGltZTogVGltZVN0cnVjdCwgZnJvbVpvbmU/OiBUaW1lWm9uZSk6IFRpbWVTdHJ1Y3Qge1xuXHRpZiAoZnJvbVpvbmUpIHtcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lLnVuaXhNaWxsaXMgLSBvZmZzZXQgKiA2MDAwMCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGxvY2FsVGltZS5jbG9uZSgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGcm9tVXRjKHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHRvWm9uZT86IFRpbWVab25lKTogVGltZVN0cnVjdCB7XG5cdGlmICh0b1pvbmUpIHtcblx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XG5cdFx0cmV0dXJuIHRvWm9uZS5ub3JtYWxpemVab25lVGltZShuZXcgVGltZVN0cnVjdCh1dGNUaW1lLnVuaXhNaWxsaXMgKyBvZmZzZXQgKiA2MDAwMCkpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1dGNUaW1lLmNsb25lKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuICovXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWUge1xuXG5cdC8qKlxuXHQgKiBVVEMgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcblx0ICovXG5cdHByaXZhdGUgX3V0Y0RhdGU/OiBUaW1lU3RydWN0O1xuXHRwcml2YXRlIGdldCB1dGNEYXRlKCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGU7XG5cdH1cblx0cHJpdmF0ZSBzZXQgdXRjRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xuXHRcdHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcblx0XHR0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2NhbCB0aW1lc3RhbXAgKGxhemlseSBjYWxjdWxhdGVkKVxuXHQgKi9cblx0cHJpdmF0ZSBfem9uZURhdGU/OiBUaW1lU3RydWN0O1xuXHRwcml2YXRlIGdldCB6b25lRGF0ZSgpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XG5cdFx0XHR0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZTtcblx0fVxuXHRwcml2YXRlIHNldCB6b25lRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xuXHRcdHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XG5cdFx0dGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBPcmlnaW5hbCB0aW1lIHpvbmUgdGhpcyBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmb3IuXG5cdCAqIENhbiBiZSB1bmRlZmluZWQgZm9yIHVuYXdhcmUgdGltZXN0YW1wc1xuXHQgKi9cblx0cHJpdmF0ZSBfem9uZT86IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXG5cdCAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcblx0ICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0aW1lU291cmNlOiBUaW1lU291cmNlID0gbmV3IFJlYWxUaW1lU291cmNlKCk7XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbm93TG9jYWwoKTogRGF0ZVRpbWUge1xuXHRcdGNvbnN0IG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobiwgRGF0ZUZ1bmN0aW9ucy5HZXQsIFRpbWVab25lLmxvY2FsKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG5vd1V0YygpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBub3codGltZVpvbmU6IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIERhdGVUaW1lIGZyb20gYSBMb3R1cyAxMjMgLyBNaWNyb3NvZnQgRXhjZWwgZGF0ZS10aW1lIHZhbHVlXG5cdCAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcblx0ICogQHBhcmFtIG4gZXhjZWwgZGF0ZS90aW1lIG51bWJlclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21FeGNlbChuOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdGFzc2VydCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XG5cdFx0YXNzZXJ0KCFpc05hTihuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHVuaXhUaW1lc3RhbXAsIHRpbWVab25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cblx0ICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcblx0ICogYW5kIDIwMTUtMDMtMjlUMDI6MzA6MDAgcmV0dXJucyBmYWxzZSAoZGF5bGlnaHQgc2F2aW5nIHRpbWUgbWlzc2luZyBob3VyKVxuXHQgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXG5cdCAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXG5cdCAqIGJlZm9yZSB0aGF0LiBZb3UgY2FuIGNoYW5nZSB0aGF0IHdpdGggdGhlIGFsbG93UHJlMTk3MCBmbGFnLlxuXHQgKlxuXHQgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBleGlzdHMoXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLFxuXHRcdGhvdXI6IG51bWJlciA9IDAsIG1pbnV0ZTogbnVtYmVyID0gMCwgc2Vjb25kOiBudW1iZXIgPSAwLCBtaWxsaXNlY29uZDogbnVtYmVyID0gMCxcblx0XHR6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkLCBhbGxvd1ByZTE5NzA6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAoIWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSlcblx0XHRcdHx8ICFpc0Zpbml0ZShob3VyKSB8fCAhaXNGaW5pdGUobWludXRlKSB8fCAhaXNGaW5pdGUoc2Vjb25kKSB8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxuXHRcdFx0XHQmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBDcmVhdGVzIGN1cnJlbnQgdGltZSBpbiBsb2NhbCB0aW1lem9uZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cblx0ICpcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxuXHQgKiAgICAgICAgaXQgbWF5IGluY2x1ZGUgYSBzcGFjZSBhbmQgdGhlbiBhbmQgSUFOQSB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxuXHQgKiAgICAgICAgZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwKzAxOjAwXCJcdFx0XHRcdChVVEMgb2Zmc2V0IHdpdGhvdXQgZGF5bGlnaHQgc2F2aW5nIHRpbWUpXG5cdCAqICAgICAgICBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBaXCJcdFx0XHRcdFx0KFVUQylcblx0ICogICAgICAgIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBOb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcblx0ICogICAgICAgIGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcblx0ICovXG5cdGNvbnN0cnVjdG9yKGlzb1N0cmluZzogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIHN0cmluZyBpbiBnaXZlbiBMRE1MIGZvcm1hdC5cblx0ICogTk9URTogZG9lcyBub3QgaGFuZGxlIGVyYXMvcXVhcnRlcnMvd2Vla3Mvd2Vla2RheXMuXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVN0cmluZ1x0RGF0ZStUaW1lIHN0cmluZy5cblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxuXHQgKiAgICAgICAgTm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXG5cdCAqICAgICAgICBmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxuXHQgKiBkYXRlLmdldFllYXIoKS9nZXRYeHggbWV0aG9kcyBvciB0aGUgZGF0ZS5nZXRVVENZZWFyKCkvZGF0ZS5nZXRVVENYeHggbWV0aG9kcyxcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIERhdGUgY2xhc3MgaGFzIGJ1Z3MgYW5kIGluY29uc2lzdGVuY2llcyB3aGVuIGNvbnN0cnVjdGluZyB0aGVtIHdpdGggdGltZXMgYXJvdW5kXG5cdCAqIERTVCBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVx0QSBkYXRlIG9iamVjdC5cblx0ICogQHBhcmFtIGdldHRlcnMgU3BlY2lmaWVzIHdoaWNoIHNldCBvZiBEYXRlIGdldHRlcnMgY29udGFpbnMgdGhlIGRhdGUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZTogdGhlXG5cdCAqICAgICAgICBEYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cblx0ICogQHBhcmFtIHRpbWVab25lIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgdW5kZWZpbmVkIG9yIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMpXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xuXHQvKipcblx0ICogR2V0IGEgZGF0ZSBmcm9tIGEgVGltZVN0cnVjdFxuXHQgKi9cblx0Y29uc3RydWN0b3IodG06IFRpbWVTdHJ1Y3QsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyIChlLmcuIDIwMTQpXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cblx0ICogQHBhcmFtIGhvdXJcdFRoZSBob3VyIG9mIHRoZSBkYXkgWzAtMjQpXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kXHRUaGUgbWlsbGlzZWNvbmQgb2YgdGhlIHNlY29uZCBbMC05OTldXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbC91bmRlZmluZWQgKGZvciB1bmF3YXJlIGRhdGVzKVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGlzZWNvbmQ/OiBudW1iZXIsXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWRcblx0KTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB1bml4VGltZXN0YW1wXHRtaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcblx0ICogQHBhcmFtIHRpbWVab25lXHR0aGUgdGltZSB6b25lIHRoYXQgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIGluICh1c3VhbGx5IFVUQykuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bml4VGltZXN0YW1wOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRhMT86IGFueSwgYTI/OiBhbnksIGEzPzogYW55LFxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxuXHRcdHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsXG5cdCkge1xuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRpZiAoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmb3IgdW5peCB0aW1lc3RhbXAgZGF0ZXRpbWUgY29uc3RydWN0b3IsIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsICB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHQvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IGEyIGFzIFRpbWVab25lIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRpbWVab25lID09PSB1bmRlZmluZWQgfHwgdGltZVpvbmUgPT09IG51bGwgIHx8IHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUsXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGVpZ2h0aCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gYTEgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBtb250aDogbnVtYmVyID0gYTIgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBkYXk6IG51bWJlciA9IGEzIGFzIG51bWJlcjtcblx0XHRcdFx0XHRsZXQgaG91cjogbnVtYmVyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XG5cdFx0XHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbGxpOiBudW1iZXIgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG5cdFx0XHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcblx0XHRcdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XG5cdFx0XHRcdFx0bWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcblx0XHRcdFx0XHRjb25zdCB0bSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0XHRcdGFzc2VydCh0bS52YWxpZGF0ZSgpLCBgaW52YWxpZCBkYXRlOiAke3RtLnRvU3RyaW5nKCl9YCk7XG5cblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUgPyB0aW1lWm9uZSA6IHVuZGVmaW5lZCk7XG5cblx0XHRcdFx0XHQvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRtO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZpcnN0IHR3byBhcmd1bWVudHMgYXJlIGEgc3RyaW5nLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCAgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aGlyZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHQvLyBmb3JtYXQgc3RyaW5nIGdpdmVuXG5cdFx0XHRcdFx0Y29uc3QgZGF0ZVN0cmluZzogc3RyaW5nID0gYTEgYXMgc3RyaW5nO1xuXHRcdFx0XHRcdGNvbnN0IGZvcm1hdFN0cmluZzogc3RyaW5nID0gYTIgYXMgc3RyaW5nO1xuXHRcdFx0XHRcdGxldCB6b25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGEzIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcblx0XHRcdFx0XHRcdHpvbmUgPSAoYTMpIGFzIFRpbWVab25lO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcblx0XHRcdFx0XHR0aGlzLl96b25lID0gcGFyc2VkLnpvbmU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudHMgaXMgYSBzdHJpbmcgYW5kIHRoZSBzZWNvbmQgaXMgbm90LCB0aGVyZWZvcmUgdGhlIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsICB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHRjb25zdCBnaXZlblN0cmluZyA9IChhMSBhcyBzdHJpbmcpLnRyaW0oKTtcblx0XHRcdFx0XHRjb25zdCBzczogc3RyaW5nW10gPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExIGFzIHN0cmluZyArIFwiXFxcIlwiKTtcblx0XHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMikgYXMgVGltZVpvbmU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoc3NbMV0udHJpbSgpID8gVGltZVpvbmUuem9uZShzc1sxXSkgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcblx0XHRcdFx0XHQvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xuXHRcdFx0XHRpZiAoYTEgaW5zdGFuY2VvZiBUaW1lU3RydWN0KSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyBhIFRpbWVTdHJ1Y3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0aCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0JiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFwiZmlyc3QgYXJndW1lbnQgaXMgYSBEYXRlLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHR0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiAmJiAoYTIgPT09IERhdGVGdW5jdGlvbnMuR2V0IHx8IGEyID09PSBEYXRlRnVuY3Rpb25zLkdldFVUQyksXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgIHx8IGEzIGluc3RhbmNlb2YgVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGhpcmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG5cdFx0XHRcdFx0Y29uc3QgZDogRGF0ZSA9IChhMSkgYXMgRGF0ZTtcblx0XHRcdFx0XHRjb25zdCBkazogRGF0ZUZ1bmN0aW9ucyA9IChhMikgYXMgRGF0ZUZ1bmN0aW9ucztcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFzc2VydChmYWxzZSwgYERhdGVUaW1lIGNvbnN0cnVjdG9yIGV4cGVjdGVkIGEgRGF0ZSBvciBhIFRpbWVTdHJ1Y3QgYnV0IGdvdCBhICR7YTF9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gICAgICAgICAgICAgIGJyZWFrO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XG5cdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRhMiA9PT0gdW5kZWZpbmVkICYmIGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWQsIHRoZXJlZm9yZSB0aGUgcmVzdCBtdXN0IGFsc28gYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxuXHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUubG9jYWwoKTtcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xuXHRcdFx0fSAgICAgICAgICAgICAgICAgYnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl96b25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgem9uZUFiYnJldmlhdGlvbihkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykgLyA2MDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIG9mZnNldER1cmF0aW9uKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBzdGFuZGFyZCBvZmZzZXQgV0lUSE9VVCBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl96b25lLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjKHRoaXMudXRjRGF0ZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcygwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIGRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgd2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcykgYXMgV2Vla0RheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cblx0ICpcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxuXHQgKi9cblx0cHVibGljIGRheU9mWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgd2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHNlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXG5cdCAqL1xuXHRwdWJsaWMgdW5peFV0Y01pbGxpcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIHV0Y0RheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjU2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG5cdCAqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cblx0ICovXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSBhcyBXZWVrRGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cblx0ICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cblx0ICovXG5cdHB1YmxpYyB3aXRoWm9uZSh6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHR0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLFxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcblx0XHRcdHpvbmVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcblx0ICovXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHpvbmUpIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkgeyAvLyBpZi1zdGF0ZW1lbnQgc2F0aXNmaWVzIHRoZSBjb21waWxlclxuXHRcdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xuXHRcdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fem9uZURhdGUpIHtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fem9uZSA9IHVuZGVmaW5lZDtcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG5cdCAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxuXHQgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3Jcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCBvciB1bmRlZmluZWQgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcblx0ICovXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRpZiAoem9uZSkge1xuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XG5cdFx0XHRyZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHVuZGVmaW5lZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXG5cdCAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cblx0ICovXG5cdHB1YmxpYyB0b0RhdGUoKTogRGF0ZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlKFxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcblx0XHRpZiAodGltZVpvbmUgJiYgKCF0aGlzLl96b25lIHx8ICF0aW1lWm9uZS5lcXVhbHModGhpcy5fem9uZSkpKSB7XG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcblx0XHR9XG5cdFx0Y29uc3Qgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b1V0Y0V4Y2VsKCk6IG51bWJlciB7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcblx0fVxuXG5cdHByaXZhdGUgX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKG46IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXG5cdFx0Y29uc3QgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIEFkZCBhIHRpbWUgZHVyYXRpb24gcmVsYXRpdmUgdG8gVVRDLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqIEByZXR1cm4gdGhpcyArIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgdXRjSG91cigpIGZpZWxkLCBhZGRpbmcgMSBtb250aFxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxuXHQgKiBBZGRpbmcgYW4gYW1vdW50IG9mIHVuaXRzIGxlYXZlcyBsb3dlciB1bml0cyBpbnRhY3QuIEUuZy5cblx0ICogYWRkaW5nIGEgbW9udGggd2lsbCBsZWF2ZSB0aGUgZGF5KCkgZmllbGQgdW50b3VjaGVkIGlmIHBvc3NpYmxlLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKlxuXHQgKiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdXRjIHRpbWUgZmllbGRzIGFyZSBzdGlsbCB1bnRvdWNoZWQgYnV0IGxvY2FsXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cblx0ICovXG5cdHB1YmxpYyBhZGQoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBJbXBsZW1lbnRhdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xuXHRcdGxldCBhbW91bnQ6IG51bWJlcjtcblx0XHRsZXQgdTogVGltZVVuaXQ7XG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRjb25zdCBkdXJhdGlvbjogRHVyYXRpb24gPSAoYTEpIGFzIER1cmF0aW9uO1xuXHRcdFx0YW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0YW1vdW50ID0gKGExKSBhcyBudW1iZXI7XG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcblx0XHR9XG5cdFx0Y29uc3QgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSB6b25lIHRpbWUsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS4gUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKlxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxuXHQgKiBkYXRlIGJ5IG9uZS4gSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHRpbWUgZmllbGRzIG1heSBhZGRpdGlvbmFsbHlcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXG5cdCAqXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKi9cblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHRwdWJsaWMgYWRkTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xuXHRcdGxldCB1OiBUaW1lVW5pdDtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IChhMSkgYXMgRHVyYXRpb247XG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRhbW91bnQgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHUgPSB1bml0IGFzIFRpbWVVbml0O1xuXHRcdH1cblx0XHRjb25zdCBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuem9uZURhdGUsIGFtb3VudCwgdSk7XG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbSwgZGlyZWN0aW9uKTtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbSwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcblx0ICogbmVjZXNzYXJ5LlxuXHQgKi9cblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcblx0XHRsZXQgeWVhcjogbnVtYmVyO1xuXHRcdGxldCBtb250aDogbnVtYmVyO1xuXHRcdGxldCBkYXk6IG51bWJlcjtcblx0XHRsZXQgaG91cjogbnVtYmVyO1xuXHRcdGxldCBtaW51dGU6IG51bWJlcjtcblx0XHRsZXQgc2Vjb25kOiBudW1iZXI7XG5cdFx0bGV0IG1pbGxpOiBudW1iZXI7XG5cblx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA2MDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xuXHRcdFx0XHQvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcblx0XHRcdFx0XHRtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xuXHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xuXHRcdFx0XHRtb250aCA9IHRtLmNvbXBvbmVudHMubW9udGg7XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdWIoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIgJiYgYTEgaW5zdGFuY2VvZiBEdXJhdGlvbikge1xuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gKGExKSBhcyBEdXJhdGlvbjtcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0Y29uc3QgYW1vdW50OiBudW1iZXIgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCBhcyBUaW1lVW5pdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN1YkxvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBzdWJMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHR5cGVvZiBhMSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKGExIGFzIER1cmF0aW9uKS5tdWx0aXBseSgtMSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIGExIGFzIG51bWJlciwgdW5pdCBhcyBUaW1lVW5pdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRpbWUgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBEYXRlVGltZXNcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBkaWZmKG90aGVyOiBEYXRlVGltZSk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaG9wcyBvZmYgdGhlIHRpbWUgcGFydCwgeWllbGRzIHRoZSBzYW1lIGRhdGUgYXQgMDA6MDA6MDAuMDAwXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGFydE9mRGF5KCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnRPZlllYXIoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxuXHRcdFx0JiYgKCF0aGlzLl96b25lKSA9PT0gKCFvdGhlci5fem9uZSlcblx0XHRcdCYmICgoIXRoaXMuX3pvbmUgJiYgIW90aGVyLl96b25lKSB8fCAodGhpcy5fem9uZSAmJiBvdGhlci5fem9uZSAmJiB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKVxuXHRcdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuXHQgKi9cblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgbWluKG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cblx0ICovXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXG5cdCAqIHNwZWNpZmllZCBmb3JtYXQuIFRoZSBmb3JtYXQgaXMgaW1wbGVtZW50ZWQgYXMgdGhlIExETUwgc3RhbmRhcmRcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXG5cdCAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nLCBmb3JtYXRPcHRpb25zPzogZm9ybWF0LlBhcnRpYWxGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLnpvbmVEYXRlLCB0aGlzLnV0Y0RhdGUsIHRoaXMuX3pvbmUsIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2Vcblx0ICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW5cblx0ICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwYXJzZShzOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XG5cdFx0Y29uc3QgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0aWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSBUaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XG5cdFx0XHRcdHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcblx0ICovXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cblx0ICovXG5cdHB1YmxpYyB0b1V0Y1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudG9TdHJpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9zcGxpdERhdGVGcm9tVGltZVpvbmUoczogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcblx0XHRjb25zdCByZXN1bHQgPSBbXCJcIiwgXCJcIl07XG5cdFx0bGV0IGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIndpdGhvdXQgRFNUXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XG5cdFx0XHRyZXN1bHRbMV0gKz0gXCIgd2l0aG91dCBEU1RcIjtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xuXHRcdGlmIChpbmRleCA8IDgpIHtcblx0XHRcdGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxuXHRcdH1cblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdFx0cmVzdWx0WzBdID0gdHJpbW1lZDtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogVGltZSBkdXJhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuXG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24geWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcbn1cblxuLyoqXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXG4gKlxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxuICovXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xuXG5cdC8qKlxuXHQgKiBHaXZlbiBhbW91bnQgaW4gY29uc3RydWN0b3Jcblx0ICovXG5cdHByaXZhdGUgX2Ftb3VudDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBVbml0XG5cdCAqL1xuXHRwcml2YXRlIF91bml0OiBUaW1lVW5pdDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgeWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuWWVhcik7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTW9udGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkRheSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuSG91cik7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWludXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uIG9mIDBcblx0ICovXG5cdGNvbnN0cnVjdG9yKCk7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gZnJvbSBhIHN0cmluZyBpbiBvbmUgb2YgdHdvIGZvcm1hdHM6XG5cdCAqIDEpIFstXWhoaGhbOm1tWzpzc1subm5uXV1dIGUuZy4gJy0wMTowMDozMC41MDEnXG5cdCAqIDIpIGFtb3VudCBhbmQgdW5pdCBlLmcuICctMSBkYXlzJyBvciAnMSB5ZWFyJy4gVGhlIHVuaXQgbWF5IGJlIGluIHNpbmd1bGFyIG9yIHBsdXJhbCBmb3JtIGFuZCBpcyBjYXNlLWluc2Vuc2l0aXZlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihpbnB1dDogc3RyaW5nKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgZHVyYXRpb24gZnJvbSBhbiBhbW91bnQgYW5kIGEgdGltZSB1bml0LlxuXHQgKiBAcGFyYW0gYW1vdW50XHROdW1iZXIgb2YgdW5pdHNcblx0ICogQHBhcmFtIHVuaXRcdEEgdGltZSB1bml0IGkuZS4gVGltZVVuaXQuU2Vjb25kLCBUaW1lVW5pdC5Ib3VyIGV0Yy4gRGVmYXVsdCBNaWxsaXNlY29uZC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGFtb3VudDogbnVtYmVyLCB1bml0PzogVGltZVVuaXQpO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxuXHQgKi9cblx0Y29uc3RydWN0b3IoaTE/OiBhbnksIHVuaXQ/OiBUaW1lVW5pdCkge1xuXHRcdGlmICh0eXBlb2YgKGkxKSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0Ly8gYW1vdW50K3VuaXQgY29uc3RydWN0b3Jcblx0XHRcdGNvbnN0IGFtb3VudCA9IGkxIGFzIG51bWJlcjtcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcblx0XHRcdHRoaXMuX3VuaXQgPSAodHlwZW9mIHVuaXQgPT09IFwibnVtYmVyXCIgPyB1bml0IDogVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdC8vIHN0cmluZyBjb25zdHJ1Y3RvclxuXHRcdFx0dGhpcy5fZnJvbVN0cmluZyhpMSBhcyBzdHJpbmcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXG5cdFx0XHR0aGlzLl9hbW91bnQgPSAwO1xuXHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIGFub3RoZXIgaW5zdGFuY2Ugb2YgRHVyYXRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQsIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxuXHQgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cblx0ICovXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcblx0XHRcdGNvbnN0IHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XG5cdFx0XHRjb25zdCByZXFNb250aHMgPSAodW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgdGhpc01zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcblx0XHRcdGNvbnN0IHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XG5cdCAqIHRoZSBzYW1lIHVuaXQuXG5cdCAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXG5cdCAqL1xuXHRwdWJsaWMgY29udmVydCh1bml0OiBUaW1lVW5pdCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSlcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICovXG5cdHB1YmxpYyBtaWxsaXNlY29uZHMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiA0MDAgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgMTUwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzZWNvbmRzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuU2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAzIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5TZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgOTAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgbWludXRlcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1pbnV0ZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMiBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTWludXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA1NDAwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGhvdXJzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuSG91cik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxuXHQgKiBkdXJpbmcgRFNUIGNoYW5nZXMpLlxuXHQgKi9cblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Ib3VyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaG91ciBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKS5cblx0ICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxuXHQgKiBub3csIHdlIGRvIG5vdCBoYXZlIGEgZGF5cygpIGZ1bmN0aW9uXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgd2hvbGVIb3VycygpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gZGF5cyFcblx0ICovXG5cdHB1YmxpYyBkYXlzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuRGF5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cblx0ICovXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5EYXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxuXHQgKi9cblx0cHVibGljIG1vbnRocygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1vbnRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIG1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTW9udGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4geWVhcnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcblx0ICovXG5cdHB1YmxpYyB5ZWFycygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlllYXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXG5cdCAqL1xuXHRwdWJsaWMgd2hvbGVZZWFycygpOiBudW1iZXIge1xuXHRcdGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0Lk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xuXHRcdFx0XHRiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhUaW1lVW5pdC5ZZWFyKSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqL1xuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcblx0ICovXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcblx0XHRyZXR1cm4gdGhpcy5fdW5pdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaWduXG5cdCAqIEByZXR1cm4gXCItXCIgaWYgdGhlIGR1cmF0aW9uIGlzIG5lZ2F0aXZlXG5cdCAqL1xuXHRwdWJsaWMgc2lnbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gY29udmVydGVkLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IGNvbnZlcnRlZC51bml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xuXHQgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxuXHQgKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzRXhhY3Qob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IG90aGVyLl91bml0KSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuX2Ftb3VudCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBUaW1lVW5pdC5Nb250aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbW9udGhzIGFuZCB5ZWFyc1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA8IFRpbWVVbml0LkRheSAmJiBvdGhlci51bml0KCkgPCBUaW1lVW5pdC5EYXkpIHtcblx0XHRcdHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1pbGxpc2Vjb25kcyB0aHJvdWdoIGhvdXJzXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTsgLy8gY2Fubm90IGNvbXBhcmUgZGF5cyB0byBhbnl0aGluZyBlbHNlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcblx0ICovXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyVGhhbihvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID49IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtaW4ob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxuXHQgKi9cblx0cHVibGljIG1heChvdGhlcjogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKiB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBtdWx0aXBseSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpdmlkZSBieSBhIHVuaXRsZXNzIG51bWJlci4gVGhlIHJlc3VsdCBpcyBhIER1cmF0aW9uLCBlLmcuIDEgeWVhciAvIDIgPSAwLjUgeWVhclxuXHQgKiBUaGUgcmVzdWx0IGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gYXMgYSB1bml0IHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhIG51bWJlciAoZS5nLiAxIG1vbnRoIGhhcyB2YXJpYWJsZSBsZW5ndGgpXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBkaXZpZGUodmFsdWU6IG51bWJlcik6IER1cmF0aW9uO1xuXHQvKipcblx0ICogRGl2aWRlIHRoaXMgRHVyYXRpb24gYnkgYSBEdXJhdGlvbi4gVGhlIHJlc3VsdCBpcyBhIHVuaXRsZXNzIG51bWJlciBlLmcuIDEgeWVhciAvIDEgbW9udGggPSAxMlxuXHQgKiBUaGUgcmVzdWx0IGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gYXMgYSB1bml0IHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhIG51bWJlciAoZS5nLiAxIG1vbnRoIGhhcyB2YXJpYWJsZSBsZW5ndGgpXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBkaXZpZGUodmFsdWU6IER1cmF0aW9uKTogbnVtYmVyO1xuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBudW1iZXIgfCBEdXJhdGlvbik6IER1cmF0aW9uIHwgbnVtYmVyIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLyB2YWx1ZSwgdGhpcy5fdW5pdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVybyBkdXJhdGlvblwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIGR1cmF0aW9uLlxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGFkZCh2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogU3VidHJhY3QgYSBkdXJhdGlvbi5cblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAtIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzdWIodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxuXHQgKi9cblx0cHVibGljIGFicygpOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmVcblx0ICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxuXHQgKi9cblx0cHVibGljIHRvRnVsbFN0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tWzpzc1subm5uXV0gbm90YXRpb24uXG5cdCAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xuXHQgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xuXHQgKi9cblx0cHVibGljIHRvSG1zU3RyaW5nKGZ1bGw6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcblx0XHRpZiAoZnVsbCB8fCB0aGlzLm1pbGxpc2Vjb25kKCkgPiAwKSB7XG5cdFx0XHRyZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG5cdFx0fVxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XG5cdFx0XHRyZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuXHRcdH1cblx0XHRpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLm1pbnV0ZSgpID4gMCkge1xuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuc2lnbigpICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMud2hvbGVIb3VycygpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgKHRoaXMuX2Ftb3VudCAvIDEwMDApLnRvRml4ZWQoMykgKyBcIlNcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIlNcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XG5cdFx0XHRcdHJldHVybiBcIlBUXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7IC8vIG5vdGUgdGhlIFwiVFwiIHRvIGRpc2FtYmlndWF0ZSB0aGUgXCJNXCJcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJIXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJEXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiV1wiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiWVwiO1xuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiIFwiICsgYmFzaWNzLnRpbWVVbml0VG9TdHJpbmcodGhpcy5fdW5pdCwgdGhpcy5fYW1vdW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXG5cdCAqL1xuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXG5cdCAqL1xuXHRwcml2YXRlIF9wYXJ0KHVuaXQ6IFRpbWVVbml0KTogbnVtYmVyIHtcblx0XHRsZXQgbmV4dFVuaXQ6IFRpbWVVbml0O1xuXHRcdC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxuXHRcdHN3aXRjaCAodW5pdCkge1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogbmV4dFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuTWludXRlOyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiBuZXh0VW5pdCA9IFRpbWVVbml0LkhvdXI7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiBuZXh0VW5pdCA9IFRpbWVVbml0LkRheTsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Nb250aDsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiBuZXh0VW5pdCA9IFRpbWVVbml0LlllYXI7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhUaW1lVW5pdC5ZZWFyKSkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XG5cdH1cblxuXG5cdHByaXZhdGUgX2Zyb21TdHJpbmcoczogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xuXHRcdGlmICh0cmltbWVkLm1hdGNoKC9eLT9cXGRcXGQ/KDpcXGRcXGQ/KDpcXGRcXGQ/KC5cXGRcXGQ/XFxkPyk/KT8pPyQvKSkge1xuXHRcdFx0bGV0IHNpZ246IG51bWJlciA9IDE7XG5cdFx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcblx0XHRcdGxldCBzZWNvbmRzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IG1pbGxpc2Vjb25kczogbnVtYmVyID0gMDtcblx0XHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xuXHRcdFx0YXNzZXJ0KHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJOb3QgYSBwcm9wZXIgdGltZSBkdXJhdGlvbiBzdHJpbmc6IFxcXCJcIiArIHRyaW1tZWQgKyBcIlxcXCJcIik7XG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XG5cdFx0XHRcdHNpZ24gPSAtMTtcblx0XHRcdFx0cGFydHNbMF0gPSBwYXJ0c1swXS5zdWJzdHIoMSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRob3VycyA9ICtwYXJ0c1swXTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdG1pbnV0ZXMgPSArcGFydHNbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMikge1xuXHRcdFx0XHRjb25zdCBzZWNvbmRQYXJ0cyA9IHBhcnRzWzJdLnNwbGl0KFwiLlwiKTtcblx0XHRcdFx0c2Vjb25kcyA9ICtzZWNvbmRQYXJ0c1swXTtcblx0XHRcdFx0aWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRtaWxsaXNlY29uZHMgPSArc3RyaW5ncy5wYWRSaWdodChzZWNvbmRQYXJ0c1sxXSwgMywgXCIwXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBhbW91bnRNc2VjID0gc2lnbiAqIE1hdGgucm91bmQobWlsbGlzZWNvbmRzICsgMTAwMCAqIHNlY29uZHMgKyA2MDAwMCAqIG1pbnV0ZXMgKyAzNjAwMDAwICogaG91cnMpO1xuXHRcdFx0Ly8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxuXHRcdFx0aWYgKG1pbGxpc2Vjb25kcyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG5cdFx0XHR9IGVsc2UgaWYgKHNlY29uZHMgIT09IDApIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LlNlY29uZDtcblx0XHRcdH0gZWxzZSBpZiAobWludXRlcyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdFx0fSBlbHNlIGlmIChob3VycyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuSG91cjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc3BsaXQgPSB0cmltbWVkLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcblx0XHRcdGFzc2VydCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XG5cdFx0XHRhc3NlcnQoaXNGaW5pdGUoYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGFtb3VudCBpcyBpbmZpbml0ZVwiKTtcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcblx0XHRcdHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XG5cdFx0fVxuXHR9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHsgVGltZVN0cnVjdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5pbXBvcnQgeyBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUsIFRva2VuLCBUb2tlbml6ZXIgfSBmcm9tIFwiLi90b2tlblwiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBUaGUgbGV0dGVyIGluZGljYXRpbmcgYSBxdWFydGVyIGUuZy4gXCJRXCIgKGJlY29tZXMgUTEsIFEyLCBRMywgUTQpXG5cdCAqL1xuXHRxdWFydGVyTGV0dGVyOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXG5cdCAqL1xuXHRxdWFydGVyV29yZDogc3RyaW5nO1xuXHQvKipcblx0ICogUXVhcnRlciBhYmJyZXZpYXRpb25zIGUuZy4gMXN0LCAybmQsIDNyZCwgNHRoXG5cdCAqL1xuXHRxdWFydGVyQWJicmV2aWF0aW9uczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIE1vbnRoIG5hbWVzXG5cdCAqL1xuXHRsb25nTW9udGhOYW1lczogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBUaHJlZS1sZXR0ZXIgbW9udGggbmFtZXNcblx0ICovXG5cdHNob3J0TW9udGhOYW1lczogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBNb250aCBsZXR0ZXJzXG5cdCAqL1xuXHRtb250aExldHRlcnM6IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBXZWVrIGRheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBzdW5kYXlcblx0ICovXG5cdGxvbmdXZWVrZGF5TmFtZXM6IHN0cmluZ1tdO1xuXHRzaG9ydFdlZWtkYXlOYW1lczogc3RyaW5nW107XG5cdHdlZWtkYXlUd29MZXR0ZXJzOiBzdHJpbmdbXTtcblx0d2Vla2RheUxldHRlcnM6IHN0cmluZ1tdO1xufVxuXG4vLyB0b2RvIHRoaXMgY2FuIGJlIFBhcnRpYWw8Rm9ybWF0T3B0aW9ucz4gYnV0IGZvciBjb21wYXRpYmlsaXR5IHdpdGhcbi8vIHByZS0yLjEgdHlwZXNjcmlwdCB1c2VycyB3ZSB3cml0ZSB0aGlzIG91dCBvdXJzZWx2ZXMgZm9yIGEgd2hpbGUgeWV0XG5leHBvcnQgaW50ZXJmYWNlIFBhcnRpYWxGb3JtYXRPcHRpb25zIHtcblx0LyoqXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcblx0ICovXG5cdHF1YXJ0ZXJMZXR0ZXI/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXG5cdCAqL1xuXHRxdWFydGVyV29yZD86IHN0cmluZztcblx0LyoqXG5cdCAqIFF1YXJ0ZXIgYWJicmV2aWF0aW9ucyBlLmcuIDFzdCwgMm5kLCAzcmQsIDR0aFxuXHQgKi9cblx0cXVhcnRlckFiYnJldmlhdGlvbnM/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogTW9udGggbmFtZXNcblx0ICovXG5cdGxvbmdNb250aE5hbWVzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBUaHJlZS1sZXR0ZXIgbW9udGggbmFtZXNcblx0ICovXG5cdHNob3J0TW9udGhOYW1lcz86IHN0cmluZ1tdO1xuXHQvKipcblx0ICogTW9udGggbGV0dGVyc1xuXHQgKi9cblx0bW9udGhMZXR0ZXJzPzogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxuXHQgKi9cblx0bG9uZ1dlZWtkYXlOYW1lcz86IHN0cmluZ1tdO1xuXHRzaG9ydFdlZWtkYXlOYW1lcz86IHN0cmluZ1tdO1xuXHR3ZWVrZGF5VHdvTGV0dGVycz86IHN0cmluZ1tdO1xuXHR3ZWVrZGF5TGV0dGVycz86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY29uc3QgTE9OR19NT05USF9OQU1FUzogc3RyaW5nW10gPVxuXHRbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcblxuZXhwb3J0IGNvbnN0IFNIT1JUX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcblxuZXhwb3J0IGNvbnN0IE1PTlRIX0xFVFRFUlM6IHN0cmluZ1tdID1cblx0W1wiSlwiLCBcIkZcIiwgXCJNXCIsIFwiQVwiLCBcIk1cIiwgXCJKXCIsIFwiSlwiLCBcIkFcIiwgXCJTXCIsIFwiT1wiLCBcIk5cIiwgXCJEXCJdO1xuXG5leHBvcnQgY29uc3QgTE9OR19XRUVLREFZX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xuXG5leHBvcnQgY29uc3QgU0hPUlRfV0VFS0RBWV9OQU1FUzogc3RyaW5nW10gPVxuXHRbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG5cbmV4cG9ydCBjb25zdCBXRUVLREFZX1RXT19MRVRURVJTOiBzdHJpbmdbXSA9XG5cdFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xuXG5leHBvcnQgY29uc3QgV0VFS0RBWV9MRVRURVJTOiBzdHJpbmdbXSA9XG5cdFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XG5cbmV4cG9ydCBjb25zdCBRVUFSVEVSX0xFVFRFUjogc3RyaW5nID0gXCJRXCI7XG5leHBvcnQgY29uc3QgUVVBUlRFUl9XT1JEOiBzdHJpbmcgPSBcInF1YXJ0ZXJcIjtcbmV4cG9ydCBjb25zdCBRVUFSVEVSX0FCQlJFVklBVElPTlM6IHN0cmluZ1tdID0gW1wiMXN0XCIsIFwiMm5kXCIsIFwiM3JkXCIsIFwiNHRoXCJdO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9GT1JNQVRfT1BUSU9OUzogRm9ybWF0T3B0aW9ucyA9IHtcblx0cXVhcnRlckxldHRlcjogUVVBUlRFUl9MRVRURVIsXG5cdHF1YXJ0ZXJXb3JkOiBRVUFSVEVSX1dPUkQsXG5cdHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBRVUFSVEVSX0FCQlJFVklBVElPTlMsXG5cdGxvbmdNb250aE5hbWVzOiBMT05HX01PTlRIX05BTUVTLFxuXHRzaG9ydE1vbnRoTmFtZXM6IFNIT1JUX01PTlRIX05BTUVTLFxuXHRtb250aExldHRlcnM6IE1PTlRIX0xFVFRFUlMsXG5cdGxvbmdXZWVrZGF5TmFtZXM6IExPTkdfV0VFS0RBWV9OQU1FUyxcblx0c2hvcnRXZWVrZGF5TmFtZXM6IFNIT1JUX1dFRUtEQVlfTkFNRVMsXG5cdHdlZWtkYXlUd29MZXR0ZXJzOiBXRUVLREFZX1RXT19MRVRURVJTLFxuXHR3ZWVrZGF5TGV0dGVyczogV0VFS0RBWV9MRVRURVJTXG59O1xuXG5cbi8qKlxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBPdGhlciBmb3JtYXQgb3B0aW9ucyBzdWNoIGFzIG1vbnRoIG5hbWVzXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KFxuXHRkYXRlVGltZTogVGltZVN0cnVjdCxcblx0dXRjVGltZTogVGltZVN0cnVjdCxcblx0bG9jYWxab25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZCB8IG51bGwsXG5cdGZvcm1hdFN0cmluZzogc3RyaW5nLFxuXHRmb3JtYXRPcHRpb25zOiBQYXJ0aWFsRm9ybWF0T3B0aW9ucyA9IHt9XG4pOiBzdHJpbmcge1xuXHRjb25zdCBtZXJnZWRGb3JtYXRPcHRpb25zOiBQYXJ0aWFsRm9ybWF0T3B0aW9ucyA9IHt9O1xuXHRmb3IgKGNvbnN0IG5hbWUgaW4gREVGQVVMVF9GT1JNQVRfT1BUSU9OUykge1xuXHRcdGlmIChERUZBVUxUX0ZPUk1BVF9PUFRJT05TLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cdFx0XHRtZXJnZWRGb3JtYXRPcHRpb25zW25hbWVdID0gKGZvcm1hdE9wdGlvbnNbbmFtZV0gIT09IHVuZGVmaW5lZCA/IGZvcm1hdE9wdGlvbnNbbmFtZV0gOiBERUZBVUxUX0ZPUk1BVF9PUFRJT05TW25hbWVdKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XG5cdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xuXHRsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuXHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdGxldCB0b2tlblJlc3VsdDogc3RyaW5nO1xuXHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5ZRUFSOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIG1lcmdlZEZvcm1hdE9wdGlvbnMgYXMgRm9ybWF0T3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkRm9ybWF0T3B0aW9ucyBhcyBGb3JtYXRPcHRpb25zKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUtEQVk6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRGb3JtYXRPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWVBFUklPRDpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5IT1VSOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuTUlOVVRFOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5TRUNPTkQ6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSA/IGxvY2FsWm9uZSA6IHVuZGVmaW5lZCwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuSURFTlRJVFk6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmVzdWx0ICs9IHRva2VuUmVzdWx0O1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGNvbnN0IEFEOiBib29sZWFuID0gZGF0ZVRpbWUueWVhciA+IDA7XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRjYXNlIDM6XG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBRFwiIDogXCJCQ1wiKTtcblx0XHRjYXNlIDQ6XG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBbm5vIERvbWluaVwiIDogXCJCZWZvcmUgQ2hyaXN0XCIpO1xuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgeWVhclxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRZZWFyKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJ5XCI6XG5cdFx0Y2FzZSBcIllcIjpcblx0XHRjYXNlIFwiclwiOlxuXHRcdFx0bGV0IHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMikgeyAvLyBTcGVjaWFsIGNhc2U6IGV4YWN0bHkgdHdvIGNoYXJhY3RlcnMgYXJlIGV4cGVjdGVkXG5cdFx0XHRcdHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geWVhclZhbHVlO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sICsgXCIgZm9yIHRva2VuIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xuXHRjb25zdCBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJXb3JkO1xuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgbW9udGhcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xuXHRcdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSB3ZWVrIG51bWJlclxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRXZWVrKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRpZiAodG9rZW4uc3ltYm9sID09PSBcIndcIikge1xuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgbW9udGggKG9yIHllYXIpXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdERheShkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwiZFwiOlxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5kYXkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcIkRcIjpcblx0XHRcdGNvbnN0IGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXlPZlllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xuXHRcdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIHdlZWtcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0V2Vla2RheShkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcblx0Y29uc3Qgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcblxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0XHRpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xuXHRcdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xuXHRcdFx0fVxuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xuXHRcdGNhc2UgNDpcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG5cdFx0Y2FzZSA1OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XG5cdFx0Y2FzZSA2OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMud2Vla2RheVR3b0xldHRlcnNbd2Vla0RheU51bWJlcl07XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZTogVGltZVN0cnVjdCk6IHN0cmluZyB7XG5cdHJldHVybiAoZGF0ZVRpbWUuaG91ciA8IDEyID8gXCJBTVwiIDogXCJQTVwiKTtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIEhvdXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0bGV0IGhvdXIgPSBkYXRlVGltZS5ob3VyO1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJoXCI6XG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xuXHRcdFx0aWYgKGhvdXIgPT09IDApIHtcblx0XHRcdFx0aG91ciA9IDEyO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdGNhc2UgXCJIXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcIktcIjpcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcImtcIjpcblx0XHRcdGlmIChob3VyID09PSAwKSB7XG5cdFx0XHRcdGhvdXIgPSAyNDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCArIFwiIGZvciB0b2tlbiBcIiArIFRva2VuVHlwZVt0b2tlbi50eXBlXSk7XG5cdFx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwic1wiOlxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcIlNcIjpcblx0XHRcdGNvbnN0IGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XG5cdFx0XHRsZXQgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQoZnJhY3Rpb24udG9TdHJpbmcoKSwgMywgXCIwXCIpO1xuXHRcdFx0ZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xuXHRcdGNhc2UgXCJBXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy5zZWNvbmRPZkRheShkYXRlVGltZS5ob3VyLCBkYXRlVGltZS5taW51dGUsIGRhdGVUaW1lLnNlY29uZCkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xuXHRcdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSB0aW1lIHpvbmUuIEZvciB0aGlzLCB3ZSBuZWVkIHRoZSBjdXJyZW50IHRpbWUsIHRoZSB0aW1lIGluIFVUQyBhbmQgdGhlIHRpbWUgem9uZVxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXG4gKiBAcGFyYW0gem9uZSBUaGUgdGltZXpvbmUgY3VycmVudFRpbWUgaXMgaW5cbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZTogVGltZVN0cnVjdCwgdXRjVGltZTogVGltZVN0cnVjdCwgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGlmICghem9uZSkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xuXG5cdGNvbnN0IG9mZnNldEhvdXJzOiBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XG5cdG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xuXHRjb25zdCBvZmZzZXRNaW51dGVzID0gTWF0aC5hYnMob2Zmc2V0ICUgNjApO1xuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuXHRsZXQgcmVzdWx0OiBzdHJpbmc7XG5cblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwiT1wiOlxuXHRcdFx0cmVzdWx0ID0gXCJVVENcIjtcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCIrXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXN1bHQgKz0gb2Zmc2V0SG91cnMudG9TdHJpbmcoKTtcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdGNhc2UgXCJaXCI6XG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRjb25zdCBuZXdUb2tlbjogVG9rZW4gPSB7XG5cdFx0XHRcdFx0XHRsZW5ndGg6IDQsXG5cdFx0XHRcdFx0XHRyYXc6IFwiT09PT1wiLFxuXHRcdFx0XHRcdFx0c3ltYm9sOiBcIk9cIixcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5aT05FXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcblx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHRjYXNlIFwielwiOlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxlbmd0aCBcIiArIHRva2VuLmxlbmd0aCArIFwiIGZvciBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHRjYXNlIFwidlwiOlxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcIlZcIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHQvLyBOb3QgaW1wbGVtZW50ZWRcblx0XHRcdFx0XHRyZXR1cm4gXCJ1bmtcIjtcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHJldHVybiB6b25lLm5hbWUoKTtcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIFwiVW5rbm93blwiO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGVuZ3RoIFwiICsgdG9rZW4ubGVuZ3RoICsgXCIgZm9yIHN5bWJvbCBcIiArIHRva2VuLnN5bWJvbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGNhc2UgXCJYXCI6XG5cdFx0Y2FzZSBcInhcIjpcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIG9mZnNldCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gXCJaXCI7XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XG5cdFx0XHRcdFx0aWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBsZW5ndGggXCIgKyB0b2tlbi5sZW5ndGggKyBcIiBmb3Igc3ltYm9sIFwiICsgdG9rZW4uc3ltYm9sKTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBzeW1ib2wgXCIgKyB0b2tlbi5zeW1ib2wgKyBcIiBmb3IgdG9rZW4gXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0pO1xuXHRcdFx0fVxuXHR9XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogR2xvYmFsIGZ1bmN0aW9ucyBkZXBlbmRpbmcgb24gRGF0ZVRpbWUvRHVyYXRpb24gZXRjXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gXCIuL2RhdGV0aW1lXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IERhdGVUaW1lLCBkMjogRGF0ZVRpbWUpOiBEYXRlVGltZTtcbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBhbnksIGQyOiBhbnkpOiBhbnkge1xuXHRhc3NlcnQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdGFzc2VydChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0YXNzZXJ0KFxuXHRcdChkMSBpbnN0YW5jZW9mIERhdGVUaW1lICYmIGQyIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIER1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgRHVyYXRpb24pLFxuXHRcdFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiXG5cdCk7XG5cdHJldHVybiBkMS5taW4oZDIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIER1cmF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBEdXJhdGlvbiwgZDI6IER1cmF0aW9uKTogRHVyYXRpb247XG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogYW55LCBkMjogYW55KTogYW55IHtcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuXHRhc3NlcnQoZDIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGFzc2VydChcblx0XHQoZDEgaW5zdGFuY2VvZiBEYXRlVGltZSAmJiBkMiBpbnN0YW5jZW9mIERhdGVUaW1lKSB8fCAoZDEgaW5zdGFuY2VvZiBEdXJhdGlvbiAmJiBkMiBpbnN0YW5jZW9mIER1cmF0aW9uKSxcblx0XHRcIkVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnMgZXhwZWN0ZWRcIlxuXHQpO1xuXHRyZXR1cm4gZDEubWF4KGQyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhYnMoZDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdGFzc2VydChkLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuXHRhc3NlcnQoZCBpbnN0YW5jZW9mIER1cmF0aW9uLCBcImZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhIER1cmF0aW9uXCIpO1xuXHRyZXR1cm4gZC5hYnMoKTtcbn1cblxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEluZGljYXRlcyBob3cgYSBEYXRlIG9iamVjdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXHJcbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcclxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBEYXRlRnVuY3Rpb25zIHtcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0RnVsbFllYXIoKSwgRGF0ZS5nZXRNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldCxcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldFVUQ1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE1hdGggdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcblxyXG4vKipcclxuICogQHJldHVybiB0cnVlIGlmZiBnaXZlbiBhcmd1bWVudCBpcyBhbiBpbnRlZ2VyIG51bWJlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW50KG46IG51bWJlcik6IGJvb2xlYW4ge1xyXG5cdGlmIChuID09PSBudWxsIHx8ICFpc0Zpbml0ZShuKSkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRyZXR1cm4gKE1hdGguZmxvb3IobikgPT09IG4pO1xyXG59XHJcblxyXG4vKipcclxuICogUm91bmRzIC0xLjUgdG8gLTIgaW5zdGVhZCBvZiAtMVxyXG4gKiBSb3VuZHMgKzEuNSB0byArMlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kU3ltKG46IG51bWJlcik6IG51bWJlciB7XHJcblx0aWYgKG4gPCAwKSB7XHJcblx0XHRyZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG4pO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxyXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcclxuXHRpZiAoL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkLy50ZXN0KHZhbHVlKSkge1xyXG5cdFx0cmV0dXJuIE51bWJlcih2YWx1ZSk7XHJcblx0fVxyXG5cdHJldHVybiBOYU47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZTogbnVtYmVyLCBtb2R1bG86IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vZHVsbyA+PSAxLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuXHRpZiAodmFsdWUgPCAwKSB7XHJcblx0XHRyZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdmFsdWUgJSBtb2R1bG87XHJcblx0fVxyXG59XHJcbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xuICovXG5cbmltcG9ydCB7IFRpbWVDb21wb25lbnRPcHRzLCBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5pbXBvcnQgeyBEYXRlVGltZVRva2VuVHlwZSBhcyBUb2tlblR5cGUsIFRva2VuLCBUb2tlbml6ZXIgfSBmcm9tIFwiLi90b2tlblwiO1xuXG4vKipcbiAqIFRpbWVTdHJ1Y3QgcGx1cyB6b25lXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXdhcmVUaW1lU3RydWN0IHtcblx0LyoqXG5cdCAqIFRoZSB0aW1lIHN0cnVjdFxuXHQgKi9cblx0dGltZTogVGltZVN0cnVjdDtcblx0LyoqXG5cdCAqIFRoZSB0aW1lIHpvbmUgKGNhbiBiZSB1bmRlZmluZWQpXG5cdCAqL1xuXHR6b25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIFBhcnNlTnVtYmVyUmVzdWx0IHtcblx0bjogbnVtYmVyO1xuXHRyZW1haW5pbmc6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFBhcnNlWm9uZVJlc3VsdCB7XG5cdHpvbmU/OiBUaW1lWm9uZTtcblx0cmVtYWluaW5nOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nXG4gKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBzdHJpbmcgYWZ0ZXIgdGhlIGRhdGUrdGltZVxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VhYmxlKGRhdGVUaW1lU3RyaW5nOiBzdHJpbmcsIGZvcm1hdFN0cmluZzogc3RyaW5nLCBhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4ge1xuXHR0cnkge1xuXHRcdHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHVuZGVmaW5lZCwgYWxsb3dUcmFpbGluZyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKFxuXHRkYXRlVGltZVN0cmluZzogc3RyaW5nLCBmb3JtYXRTdHJpbmc6IHN0cmluZywgb3ZlcnJpZGVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkLCBhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZVxuKTogQXdhcmVUaW1lU3RydWN0IHtcblx0aWYgKCFkYXRlVGltZVN0cmluZykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIGRhdGUgZ2l2ZW5cIik7XG5cdH1cblx0aWYgKCFmb3JtYXRTdHJpbmcpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBmb3JtYXQgZ2l2ZW5cIik7XG5cdH1cblx0dHJ5IHtcblx0XHRjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGZvcm1hdFN0cmluZyk7XG5cdFx0Y29uc3QgdG9rZW5zOiBUb2tlbltdID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XG5cdFx0Y29uc3QgdGltZTogVGltZUNvbXBvbmVudE9wdHMgPSB7IHllYXI6IC0xIH07XG5cdFx0bGV0IHpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBwbnI6IFBhcnNlTnVtYmVyUmVzdWx0O1xuXHRcdGxldCBwenI6IFBhcnNlWm9uZVJlc3VsdDtcblx0XHRsZXQgcmVtYWluaW5nOiBzdHJpbmcgPSBkYXRlVGltZVN0cmluZztcblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcblx0XHRcdFx0XHQvLyBub3RoaW5nXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xuXHRcdFx0XHRcdHRpbWUueWVhciA9IHBuci5uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xuXHRcdFx0XHRcdHRpbWUubW9udGggPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZOlxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHR0aW1lLmRheSA9IHBuci5uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5taW51dGUgPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOlxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHRpZiAodG9rZW4ucmF3LmNoYXJBdCgwKSA9PT0gXCJzXCIpIHtcblx0XHRcdFx0XHRcdHRpbWUuc2Vjb25kID0gcG5yLm47XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xuXHRcdFx0XHRcdFx0dGltZS5taWxsaSA9IHBuci5uO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJyR7dG9rZW4ucmF3fSdgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XG5cdFx0XHRcdFx0cHpyID0gc3RyaXBab25lKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5JREVOVElUWTpcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBzdHJpcFJhdyhyZW1haW5pbmcsIHRva2VuLnJhdyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IHJlc3VsdDogQXdhcmVUaW1lU3RydWN0ID0geyB0aW1lOiBuZXcgVGltZVN0cnVjdCh0aW1lKSwgem9uZSB9O1xuXHRcdGlmICghcmVzdWx0LnRpbWUudmFsaWRhdGUoKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicmVzdWx0aW5nIGRhdGUgaW52YWxpZFwiKTtcblx0XHR9XG5cdFx0Ly8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxuXHRcdGlmIChvdmVycmlkZVpvbmUpIHtcblx0XHRcdHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xuXHRcdH1cblx0XHRpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ3JlbWFpbmluZydgXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogJHtlLm1lc3NhZ2V9YCk7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzOiBzdHJpbmcpOiBQYXJzZU51bWJlclJlc3VsdCB7XG5cdGNvbnN0IHJlc3VsdDogUGFyc2VOdW1iZXJSZXN1bHQgPSB7XG5cdFx0bjogTmFOLFxuXHRcdHJlbWFpbmluZzogc1xuXHR9O1xuXHRsZXQgbnVtYmVyU3RyaW5nID0gXCJcIjtcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcblx0XHRudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xuXHR9XG5cdC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xuXHR3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcblx0XHRudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xuXHR9XG5cdHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XG5cdGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIWlzRmluaXRlKHJlc3VsdC5uKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnJHtudW1iZXJTdHJpbmd9J2ApO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xuXG5mdW5jdGlvbiBzdHJpcFpvbmUoczogc3RyaW5nKTogUGFyc2Vab25lUmVzdWx0IHtcblx0aWYgKHMubGVuZ3RoID09PSAwKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcblx0fVxuXHRjb25zdCByZXN1bHQ6IFBhcnNlWm9uZVJlc3VsdCA9IHtcblx0XHRyZW1haW5pbmc6IHNcblx0fTtcblx0bGV0IHpvbmVTdHJpbmcgPSBcIlwiO1xuXHR3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XG5cdFx0em9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0aWYgKHpvbmVTdHJpbmcudHJpbSgpKSB7XG5cdFx0cmVzdWx0LnpvbmUgPSBUaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHN0cmlwUmF3KHM6IHN0cmluZywgZXhwZWN0ZWQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCByZW1haW5pbmcgPSBzO1xuXHRsZXQgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xuXHR3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcblx0XHRlcmVtYWluaW5nID0gZXJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgJyR7ZXhwZWN0ZWR9J2ApO1xuXHR9XG5cdHJldHVybiByZW1haW5pbmc7XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5cbi8qKlxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGVudW0gUGVyaW9kRHN0IHtcblx0LyoqXG5cdCAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcblx0ICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cblx0ICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcblx0ICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cblx0ICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxuXHQgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXG5cdCAqL1xuXHRSZWd1bGFySW50ZXJ2YWxzLFxuXG5cdC8qKlxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcblx0ICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxuXHQgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxuXHQgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcblx0ICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcblx0ICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxuXHQgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxuXHQgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxuXHQgKi9cblx0UmVndWxhckxvY2FsVGltZSxcblxuXHQvKipcblx0ICogRW5kLW9mLWVudW0gbWFya2VyXG5cdCAqL1xuXHRNQVhcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocDogUGVyaW9kRHN0KTogc3RyaW5nIHtcblx0c3dpdGNoIChwKSB7XG5cdFx0Y2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxuICovXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcblxuXHQvKipcblx0ICogUmVmZXJlbmNlIG1vbWVudCBvZiBwZXJpb2Rcblx0ICovXG5cdHByaXZhdGUgX3JlZmVyZW5jZTogRGF0ZVRpbWU7XG5cblx0LyoqXG5cdCAqIEludGVydmFsXG5cdCAqL1xuXHRwcml2YXRlIF9pbnRlcnZhbDogRHVyYXRpb247XG5cblx0LyoqXG5cdCAqIERTVCBoYW5kbGluZ1xuXHQgKi9cblx0cHJpdmF0ZSBfZHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZWQgcmVmZXJlbmNlIGRhdGUsIGhhcyBkYXktb2YtbW9udGggPD0gMjggZm9yIE1vbnRobHlcblx0ICogcGVyaW9kLCBvciBmb3IgWWVhcmx5IHBlcmlvZCBpZiBtb250aCBpcyBGZWJydWFyeVxuXHQgKi9cblx0cHJpdmF0ZSBfaW50UmVmZXJlbmNlOiBEYXRlVGltZTtcblxuXHQvKipcblx0ICogTm9ybWFsaXplZCBpbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50SW50ZXJ2YWw6IER1cmF0aW9uO1xuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVkIGludGVybmFsIERTVCBoYW5kbGluZy4gSWYgRFNUIGhhbmRsaW5nIGlzIGlycmVsZXZhbnRcblx0ICogKGJlY2F1c2UgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgZG9lcyBub3QgaGF2ZSBEU1QpXG5cdCAqIHRoZW4gaXQgaXMgc2V0IHRvIFJlZ3VsYXJJbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50RHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIExJTUlUQVRJT046IGlmIGRzdCBlcXVhbHMgUmVndWxhckxvY2FsVGltZSwgYW5kIHVuaXQgaXMgU2Vjb25kLCBNaW51dGUgb3IgSG91cixcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxuXHQgKiBUaGlzIGlzIGR1ZSB0byB0aGUgZW5vcm1vdXMgcHJvY2Vzc2luZyBwb3dlciByZXF1aXJlZCBieSB0aGVzZSBjYXNlcy4gVGhleSBhcmUgbm90XG5cdCAqIGltcGxlbWVudGVkIGFuZCB5b3Ugd2lsbCBnZXQgYW4gYXNzZXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVmZXJlbmNlIFRoZSByZWZlcmVuY2UgZGF0ZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBpbnRlcnZhbCBUaGUgaW50ZXJ2YWwgb2YgdGhlIHBlcmlvZFxuXHQgKiBAcGFyYW0gZHN0IFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcblx0ICogICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXG5cdCAqICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0aW50ZXJ2YWw6IER1cmF0aW9uLFxuXHRcdGRzdD86IFBlcmlvZERzdFxuXHQpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3Rcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiB1bml0cy5cblx0ICogQHBhcmFtIHVuaXQgVGhlIHVuaXQuXG5cdCAqIEBwYXJhbSBkc3QgU3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxuXHQgKiAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0YW1vdW50OiBudW1iZXIsXG5cdFx0dW5pdDogVGltZVVuaXQsXG5cdFx0ZHN0PzogUGVyaW9kRHN0XG5cdCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxuXHRcdGFtb3VudE9ySW50ZXJ2YWw6IGFueSxcblx0XHR1bml0T3JEc3Q/OiBhbnksXG5cdFx0Z2l2ZW5Ec3Q/OiBQZXJpb2REc3Rcblx0KSB7XG5cblx0XHRsZXQgaW50ZXJ2YWw6IER1cmF0aW9uO1xuXHRcdGxldCBkc3Q6IFBlcmlvZERzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xuXHRcdGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWwgYXMgRHVyYXRpb247XG5cdFx0XHRkc3QgPSB1bml0T3JEc3QgYXMgUGVyaW9kRHN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIHVuaXRPckRzdCA9PT0gXCJudW1iZXJcIiAmJiB1bml0T3JEc3QgPj0gMCAmJiB1bml0T3JEc3QgPCBUaW1lVW5pdC5NQVgsIFwiSW52YWxpZCB1bml0XCIpO1xuXHRcdFx0aW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCBhcyBudW1iZXIsIHVuaXRPckRzdCBhcyBUaW1lVW5pdCk7XG5cdFx0XHRkc3QgPSBnaXZlbkRzdCBhcyBQZXJpb2REc3Q7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XG5cdFx0XHRkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcblx0XHR9XG5cdFx0YXNzZXJ0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcblx0XHRhc3NlcnQoISFyZWZlcmVuY2UsIFwiUmVmZXJlbmNlIHRpbWUgbm90IGdpdmVuXCIpO1xuXHRcdGFzc2VydChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XG5cblx0XHR0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG5cdFx0dGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XG5cdFx0dGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XG5cblx0XHQvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcblx0XHQvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXG5cdFx0Ly8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFBlcmlvZCB7XG5cdFx0cmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgcmVmZXJlbmNlIGRhdGVcblx0ICovXG5cdHB1YmxpYyByZWZlcmVuY2UoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG5cdH1cblxuXHQvKipcblx0ICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0KCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGludGVydmFsKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHVuaXRzIG9mIHRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcblx0ICovXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxuXHQgKi9cblx0cHVibGljIGRzdCgpOiBQZXJpb2REc3Qge1xuXHRcdHJldHVybiB0aGlzLl9kc3Q7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3Rcblx0ICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuXHQgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxuXHQgKi9cblx0cHVibGljIGZpbmRGaXJzdChmcm9tRGF0ZTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRsZXQgYXBwcm94OiBEYXRlVGltZTtcblx0XHRsZXQgYXBwcm94MjogRGF0ZVRpbWU7XG5cdFx0bGV0IGFwcHJveE1pbjogRGF0ZVRpbWU7XG5cdFx0bGV0IHBlcmlvZHM6IG51bWJlcjtcblx0XHRsZXQgZGlmZjogbnVtYmVyO1xuXHRcdGxldCBuZXdZZWFyOiBudW1iZXI7XG5cdFx0bGV0IHJlbWFpbmRlcjogbnVtYmVyO1xuXHRcdGxldCBpbWF4OiBudW1iZXI7XG5cdFx0bGV0IGltaW46IG51bWJlcjtcblx0XHRsZXQgaW1pZDogbnVtYmVyO1xuXG5cdFx0Y29uc3Qgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xuXG5cdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpID09PSAxKSB7XG5cdFx0XHQvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBBbW91bnQgaXMgbm90IDEsXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0XHQvLyBhcHBseSB0byBVVEMgdGltZVxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0XHRcdC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcblx0XHRcdFx0XHRcdFx0KG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlllYXIpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXG5cdFx0XHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG9kb1xuXHRcdFx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94Mjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWluID0gaW1pZCArIDE7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWF4ID0gaW1pZCAtIDE7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5NaW51dGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2Vcblx0XHRcdFx0XHRcdFx0Ly8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcblx0XHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LkhvdXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcblx0XHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuXHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxuXHRcdFx0XHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0bmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxuXHQgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXG5cdCAqL1xuXHRwdWJsaWMgZmluZE5leHQocHJldjogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdGFzc2VydCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xuXHRcdGFzc2VydChcblx0XHRcdCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcblx0XHQpO1xuXHRcdGFzc2VydCh0eXBlb2YgKGNvdW50KSA9PT0gXCJudW1iZXJcIiwgXCJDb3VudCBtdXN0IGJlIGEgbnVtYmVyXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKFxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGRMb2NhbChcblx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKVxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXG5cdCAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cblx0ICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cblx0ICovXG5cdHB1YmxpYyBmaW5kTGFzdChmcm9tOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XG5cdFx0aWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcblx0XHRcdHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXG5cdCAqL1xuXHRwdWJsaWMgZmluZFByZXYobmV4dDogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XG5cdCAqIChleHBlbnNpdmUhKVxuXHQgKi9cblx0cHVibGljIGlzQm91bmRhcnkob2NjdXJyZW5jZTogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRpZiAoIW9jY3VycmVuY2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLFxuXHRcdFx0XCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRyZXR1cm4gKHRoaXMuZmluZEZpcnN0KG9jY3VycmVuY2Uuc3ViKER1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXG5cdCAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxuXHQgKiBhbmQgc2FtZSBkc3QuXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHQvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcblx0XHRpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3Qgb3RoZXJab25lID0gb3RoZXIuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3QgdGhpc0lzUmVndWxhciA9ICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFyZWZab25lIHx8IHJlZlpvbmUuaXNVdGMoKSk7XG5cdFx0Y29uc3Qgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XG5cdFx0aWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0ICYmIHJlZlpvbmUgJiYgb3RoZXJab25lICYmIHJlZlpvbmUuZXF1YWxzKG90aGVyWm9uZSkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcblx0XHRcdCYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5faW50ZXJ2YWwpXG5cdFx0XHQmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZS5nLlxuXHQgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xuXHRcdC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xuXHRcdFx0cmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXG5cdCAqL1xuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIltQZXJpb2Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XG5cdH1cblxuXHQvKipcblx0ICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxuXHQgKi9cblx0cHJpdmF0ZSBfY29ycmVjdERheShkOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIE1hdGgubWluKGJhc2ljcy5kYXlzSW5Nb250aChkLnllYXIoKSwgZC5tb250aCgpKSwgdGhpcy5fcmVmZXJlbmNlLmRheSgpKSxcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSWYgdGhpcy5faW50ZXJuYWxVbml0IGluIFtNb250aCwgWWVhcl0sIG5vcm1hbGl6ZXMgdGhlIGRheS1vZi1tb250aFxuXHQgKiB0byA8PSAyOC5cblx0ICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxuXHQgKi9cblx0cHJpdmF0ZSBfbm9ybWFsaXplRGF5KGQ6IERhdGVUaW1lLCBhbnltb250aDogYm9vbGVhbiA9IHRydWUpOiBEYXRlVGltZSB7XG5cdFx0aWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcblx0XHRcdHx8ICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0LlllYXIgJiYgKGQubW9udGgoKSA9PT0gMiB8fCBhbnltb250aCkgJiYgZC5kYXkoKSA+IDI4KVxuXHRcdFx0KSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCAyOCxcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksXG5cdFx0XHRcdGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cblx0ICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcblx0ICovXG5cdHByaXZhdGUgX2RzdFJlbGV2YW50KCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHpvbmUgPSB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpO1xuXHRcdHJldHVybiAhISh6b25lXG5cdFx0XHQmJiB6b25lLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxuXHRcdFx0JiYgem9uZS5oYXNEc3QoKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplIHRoZSB2YWx1ZXMgd2hlcmUgcG9zc2libGUgLSBub3QgYWxsIHZhbHVlc1xuXHQgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxuXHQgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxuXHQgKiBidXQgc2Vjb25kcyBjYW5ub3QgYmUgdHJhbnNmZXJyZWQgdG8gbWludXRlcyBkdWUgdG8gbGVhcCBzZWNvbmRzLlxuXHQgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cblx0ICovXG5cdHByaXZhdGUgX2NhbGNJbnRlcm5hbFZhbHVlcygpOiB2b2lkIHtcblx0XHQvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXG5cdFx0bGV0IGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xuXHRcdGxldCBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcblx0XHRcdC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTAwMDtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5TZWNvbmQgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Ib3VyICYmIGludEFtb3VudCA+PSAyNCAmJiBpbnRBbW91bnQgJSAyNCA9PT0gMCkge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuRGF5O1xuXHRcdH1cblx0XHQvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5XZWVrKSB7XG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgKiA3O1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1vbnRoICYmIGludEFtb3VudCA+PSAxMiAmJiBpbnRBbW91bnQgJSAxMiA9PT0gMCkge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuWWVhcjtcblx0XHR9XG5cblx0XHR0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBEdXJhdGlvbihpbnRBbW91bnQsIGludFVuaXQpO1xuXG5cdFx0Ly8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XG5cdFx0XHR0aGlzLl9pbnREc3QgPSB0aGlzLl9kc3Q7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xuXHRcdH1cblxuXHRcdC8vIG5vcm1hbGl6ZSByZWZlcmVuY2UgZGF5XG5cdFx0dGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xuXHR9XG5cbn1cbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZExlZnQoczogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuXHRcdHBhZGRpbmcgKz0gY2hhcjtcclxuXHR9XHJcblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZFJpZ2h0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5cclxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBGb3IgdGVzdGluZyBwdXJwb3Nlcywgd2Ugb2Z0ZW4gbmVlZCB0byBtYW5pcHVsYXRlIHdoYXQgdGhlIGN1cnJlbnRcbiAqIHRpbWUgaXMuIFRoaXMgaXMgYW4gaW50ZXJmYWNlIGZvciBhIGN1c3RvbSB0aW1lIHNvdXJjZSBvYmplY3RcbiAqIHNvIGluIHRlc3RzIHlvdSBjYW4gdXNlIGEgY3VzdG9tIHRpbWUgc291cmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVTb3VyY2Uge1xuXHQvKipcblx0ICogUmV0dXJuIHRoZSBjdXJyZW50IGRhdGUrdGltZSBhcyBhIGphdmFzY3JpcHQgRGF0ZSBvYmplY3Rcblx0ICovXG5cdG5vdygpOiBEYXRlO1xufVxuXG4vKipcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcbiAqL1xuZXhwb3J0IGNsYXNzIFJlYWxUaW1lU291cmNlIGltcGxlbWVudHMgVGltZVNvdXJjZSB7XG5cdHB1YmxpYyBub3coKTogRGF0ZSB7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XG5cdFx0fVxuXHR9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIFRpbWUgem9uZSByZXByZXNlbnRhdGlvbiBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5pbXBvcnQgeyBOb3JtYWxpemVPcHRpb24sIFR6RGF0YWJhc2UgfSBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xuXG4vKipcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsKCk6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XG59XG5cbi8qKlxuICogQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUgem9uZS4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRjKCk6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLnV0YygpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAcmV0dXJucyBhIHRpbWUgem9uZSB3aXRoIHRoZSBnaXZlbiBmaXhlZCBvZmZzZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpvbmUob2Zmc2V0OiBudW1iZXIpOiBUaW1lWm9uZTtcblxuLyoqXG4gKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAcGFyYW0gcyBcImxvY2FsdGltZVwiIGZvciBsb2NhbCB0aW1lLFxuICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcbiAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcbiAqICAgICAgICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHpfZGF0YWJhc2VfdGltZV96b25lc1xuICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXG4gKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xuICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpvbmUobmFtZTogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XG5cbi8qKlxuICogU2VlIHRoZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBvdGhlciB6b25lKCkgbWV0aG9kIHNpZ25hdHVyZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKGE6IGFueSwgZHN0PzogYm9vbGVhbik6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcbn1cblxuLyoqXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcbiAqL1xuZXhwb3J0IGVudW0gVGltZVpvbmVLaW5kIHtcblx0LyoqXG5cdCAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxuXHQgKi9cblx0TG9jYWwsXG5cdC8qKlxuXHQgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxuXHQgKi9cblx0T2Zmc2V0LFxuXHQvKipcblx0ICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXG5cdCAqIERTVCBpZiBhcHBsaWNhYmxlLlxuXHQgKi9cblx0UHJvcGVyXG59XG5cbi8qKlxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxuICogTm90ZSB0aGF0IHdlIHVzZSB0aW1lIHpvbmUgb2Zmc2V0cyBpbnZlcnRlZCB3LnIudC4gSmF2YVNjcmlwdCBEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCksXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXG4gKlxuICogVGltZSB6b25lcyBjb21lIGluIHRocmVlIGZsYXZvcnM6IHRoZSBsb2NhbCB0aW1lIHpvbmUsIGFzIGNhbGN1bGF0ZWQgYnkgSmF2YVNjcmlwdCBEYXRlLFxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRpbWVab25lIHtcblxuXHQvKipcblx0ICogVGltZSB6b25lIGlkZW50aWZpZXI6XG5cdCAqICBcImxvY2FsdGltZVwiIHN0cmluZyBmb3IgbG9jYWwgdGltZVxuXHQgKiAgRS5nLiBcIi0wMTozMFwiIGZvciBhIGZpeGVkIG9mZnNldCBmcm9tIFVUQ1xuXHQgKiAgRS5nLiBcIlVUQ1wiIG9yIFwiRXVyb3BlL0Ftc3RlcmRhbVwiIGZvciBhbiBPbHNlbiBUWiBkYXRhYmFzZSB0aW1lXG5cdCAqL1xuXHRwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlXG5cdCAqL1xuXHRwcml2YXRlIF9kc3Q6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSBzcGVjaWZpZWQgYnkgX25hbWVcblx0ICovXG5cdHByaXZhdGUgX2tpbmQ6IFRpbWVab25lS2luZDtcblxuXHQvKipcblx0ICogT25seSBmb3IgZml4ZWQgb2Zmc2V0czogdGhlIG9mZnNldCBpbiBtaW51dGVzXG5cdCAqL1xuXHRwcml2YXRlIF9vZmZzZXQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcblx0ICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXG5cdCAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbG9jYWwoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBVVEMgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB1dGMoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcblx0fVxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgd2l0aCBhIGZpeGVkIG9mZnNldFxuXHQgKiBAcGFyYW0gb2Zmc2V0XHRvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG5cdCAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cblx0ICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcblx0ICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcblx0ICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcblx0ICogICAgICAgICAgVFogZGF0YWJhc2Ugem9uZSBuYW1lIG1heSBiZSBzdWZmaXhlZCB3aXRoIFwiIHdpdGhvdXQgRFNUXCIgdG8gaW5kaWNhdGUgbm8gRFNUIHNob3VsZCBiZSBhcHBsaWVkLlxuXHQgKiAgICAgICAgICBJbiB0aGF0IGNhc2UsIHRoZSBkc3QgcGFyYW1ldGVyIGlzIGlnbm9yZWQuXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxuXHQgKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xuXHQgKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKHM6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBab25lIGltcGxlbWVudGF0aW9uc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcblx0XHRsZXQgbmFtZSA9IFwiXCI7XG5cdFx0c3dpdGNoICh0eXBlb2YgKGEpKSB7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0bGV0IHMgPSBhIGFzIHN0cmluZztcblx0XHRcdFx0aWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcblx0XHRcdFx0XHRkc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGEgYXMgbnVtYmVyO1xuXHRcdFx0XHRhc3NlcnQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaW1lWm9uZS56b25lKCk6IFVuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZSBcXFwiXCIgKyB0eXBlb2YgKGEpICsgXCJcXFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XG5cdH1cblxuXHQvKipcblx0ICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xuXHQgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXG5cdCAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXG5cdCAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2RzdCA9IGRzdDtcblx0XHRpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcblx0XHR9IGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSBcIitcIiB8fCBuYW1lLmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgbmFtZS5jaGFyQXQoMCkubWF0Y2goL1xcZC8pIHx8IG5hbWUgPT09IFwiWlwiKSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcblx0XHRcdHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3Blcjtcblx0XHRcdGFzc2VydChUekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBgbm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICcke25hbWV9J2ApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgY2FjaGVkIHlvdSB3aWxsIE5PVFxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFRpbWVab25lIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxuXHQgKiBJQU5BIHRpbWUgem9uZSBuYW1lIFwiRXVyb3BlL0Ftc3RlcmRhbVwiLCBvciBcImxvY2FsdGltZVwiIGZvclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIG5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcblx0fVxuXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgKExvY2FsL09mZnNldC9Qcm9wZXIpXG5cdCAqL1xuXHRwdWJsaWMga2luZCgpOiBUaW1lWm9uZUtpbmQge1xuXHRcdHJldHVybiB0aGlzLl9raW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xuXHQgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXG5cdFx0XHRcdCYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cblx0ICovXG5cdHB1YmxpYyBpc1V0YygpOiBib29sZWFuIHtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBEb2VzIHRoaXMgem9uZSBoYXZlIERheWxpZ2h0IFNhdmluZyBUaW1lIGF0IGFsbD9cblx0ICovXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIG9mZnNldCBpbmNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclV0Yyh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XG5cdHB1YmxpYyBvZmZzZXRGb3JVdGMoXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBudW1iZXIge1xuXHRcdGNvbnN0IHV0Y1RpbWUgPSAoYSAmJiBhIGluc3RhbmNlb2YgVGltZVN0cnVjdCA/IGEgOiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEgYXMgbnVtYmVyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSkpO1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcblx0XHRcdFx0Y29uc3QgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy5ob3VyLCB1dGNUaW1lLmNvbXBvbmVudHMubWludXRlLCB1dGNUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCB1dGNUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KSk7XG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIHN0YW5kYXJkIG9mZnNldCBleGNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMob2Zmc2V0Rm9yVXRjOiBUaW1lU3RydWN0KTogbnVtYmVyO1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMoXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlcjtcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcblx0KTogbnVtYmVyIHtcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgMCwgMSwgMCkpO1xuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIHpvbmUtbG9jYWwgdGltZSAoTk9UIGEgVVRDIHRpbWUpLlxuXHQgKiBAcGFyYW0geWVhciBsb2NhbCBmdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIGxvY2FsIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBsb2NhbCBkYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBsb2NhbCBob3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBsb2NhbCBtaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIGxvY2FsIHNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBsb2NhbCBtaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKGxvY2FsVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclpvbmUoeWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyKTogbnVtYmVyO1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlciB7XG5cdFx0Y29uc3QgbG9jYWxUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSxcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0Ly8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcblx0ICpcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGNEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXG5cdCAqXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZURhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgYWJicmV2aWF0aW9uIGF0IGdpdmVuIFVUQyB0aW1lc3RhbXAgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0geWVhciBGdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBIb3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBNaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIFNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBNaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXG5cdCAqXG5cdCAqIEByZXR1cm4gXCJsb2NhbFwiIGZvciBsb2NhbCB0aW1lem9uZSwgdGhlIG9mZnNldCBmb3IgYW4gb2Zmc2V0IHpvbmUsIG9yIHRoZSBhYmJyZXZpYXRpb24gZm9yIGEgcHJvcGVyIHpvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgZHN0RGVwZW5kZW50PzogYm9vbGVhblxuXHQpOiBzdHJpbmc7XG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGModXRjVGltZTogVGltZVN0cnVjdCwgZHN0RGVwZW5kZW50PzogYm9vbGVhbik6IHN0cmluZztcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyhcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgYj86IG51bWJlciB8IGJvb2xlYW4sIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBjPzogYm9vbGVhblxuXHQpOiBzdHJpbmcge1xuXHRcdGxldCB1dGNUaW1lOiBUaW1lU3RydWN0O1xuXHRcdGxldCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXHRcdGlmIChhIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xuXHRcdFx0dXRjVGltZSA9IGE7XG5cdFx0XHRkc3REZXBlbmRlbnQgPSAoYiA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR1dGNUaW1lID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiBhcyBudW1iZXIsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcblx0XHR9XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xuXHRcdFx0XHRyZXR1cm4gXCJsb2NhbFwiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cblx0ICpcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kc1xuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXG5cdCAqXG5cdCAqIEByZXR1cm5zXHR1bml4IG1pbGxpc2Vjb25kcyBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXG5cdCAqL1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxVbml4TWlsbGlzOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cblx0ICpcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcFxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXG5cdCAqXG5cdCAqIEByZXR1cm5zXHR0aW1lIHN0cnVjdCBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXG5cdCAqL1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xuXHRcdGNvbnN0IHR6b3B0OiBOb3JtYWxpemVPcHRpb24gPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uRG93biA/IE5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogTm9ybWFsaXplT3B0aW9uLlVwKTtcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcblx0XHRcdGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbG9jYWxUaW1lO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIgKG5vcm1hbGl6ZWQpLlxuXHQgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm5hbWUoKTtcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcblx0XHRcdGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcblx0ICovXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiW1RpbWVab25lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcblx0ICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgb2Zmc2V0VG9TdHJpbmcob2Zmc2V0OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xuXHRcdGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xuXHRcdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XG5cdFx0cmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cblx0ICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcblx0ICogQHJldHVybiBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHN0cmluZ1RvT2Zmc2V0KHM6IHN0cmluZyk6IG51bWJlciB7XG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xuXHRcdC8vIGVhc3kgY2FzZVxuXHRcdGlmICh0ID09PSBcIlpcIikge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXHRcdC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcblx0XHRhc3NlcnQodC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pLCBcIldyb25nIHRpbWUgem9uZSBmb3JtYXQ6IFxcXCJcIiArIHQgKyBcIlxcXCJcIik7XG5cdFx0Y29uc3Qgc2lnbjogbnVtYmVyID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XG5cdFx0Y29uc3QgaG91cnM6IG51bWJlciA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XG5cdFx0bGV0IG1pbnV0ZXM6IG51bWJlciA9IDA7XG5cdFx0aWYgKHQubGVuZ3RoID09PSA1KSB7XG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcblx0XHR9IGVsc2UgaWYgKHQubGVuZ3RoID09PSA2KSB7XG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoNCwgMiksIDEwKTtcblx0XHR9XG5cdFx0YXNzZXJ0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJPZmZzZXRzIGZyb20gVVRDIG11c3QgYmUgbGVzcyB0aGFuIGEgZGF5LlwiKTtcblx0XHRyZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcyk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgY2FjaGUuXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfY2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBUaW1lWm9uZSB9ID0ge307XG5cblx0LyoqXG5cdCAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcblx0ICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9maW5kT3JDcmVhdGUobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4pOiBUaW1lWm9uZSB7XG5cdFx0Y29uc3Qga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcblx0XHRpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xuXHRcdFx0cmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XG5cdFx0XHRUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXG5cdCAqIGNhY2hlIGxvb2t1cFxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgX25vcm1hbGl6ZVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHQ6IHN0cmluZyA9IHMudHJpbSgpO1xuXHRcdGFzc2VydCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcblx0XHRpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0cmV0dXJuIHQ7XG5cdFx0fSBlbHNlIGlmICh0ID09PSBcIlpcIikge1xuXHRcdFx0cmV0dXJuIFwiKzAwOjAwXCI7XG5cdFx0fSBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcblx0XHRcdC8vIG9mZnNldCBzdHJpbmdcblx0XHRcdC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcoVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQodCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0YXRpYyBfaXNPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xuXHRcdHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XG5cdH1cbn1cblxuXG5cbiIsIi8qKlxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgY2xhc3MgVG9rZW5pemVyIHtcblxuXHRwcml2YXRlIF9mb3JtYXRTdHJpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbmV3IHRva2VuaXplclxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIChvcHRpb25hbCkgU2V0IHRoZSBmb3JtYXQgc3RyaW5nXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihmb3JtYXRTdHJpbmc/OiBzdHJpbmcpIHtcblx0XHR0aGlzLl9mb3JtYXRTdHJpbmcgPSBmb3JtYXRTdHJpbmc7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmb3JtYXQgc3RyaW5nXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIG5ldyBzdHJpbmcgdG8gdXNlIGZvciBmb3JtYXR0aW5nXG5cdCAqL1xuXHRwdWJsaWMgc2V0Rm9ybWF0U3RyaW5nKGZvcm1hdFN0cmluZzogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5fZm9ybWF0U3RyaW5nID0gZm9ybWF0U3RyaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGVuZCBhIG5ldyB0b2tlbiB0byB0aGUgY3VycmVudCBsaXN0IG9mIHRva2Vucy5cblx0ICpcblx0ICogQHBhcmFtIHRva2VuU3RyaW5nIFRoZSBzdHJpbmcgdGhhdCBtYWtlcyB1cCB0aGUgdG9rZW5cblx0ICogQHBhcmFtIHRva2VuQXJyYXkgVGhlIGV4aXN0aW5nIGFycmF5IG9mIHRva2Vuc1xuXHQgKiBAcGFyYW0gcmF3IChvcHRpb25hbCkgSWYgdHJ1ZSwgZG9uJ3QgcGFyc2UgdGhlIHRva2VuIGJ1dCBpbnNlcnQgaXQgYXMgaXNcblx0ICogQHJldHVybiBUb2tlbltdIFRoZSByZXN1bHRpbmcgYXJyYXkgb2YgdG9rZW5zLlxuXHQgKi9cblx0cHJpdmF0ZSBfYXBwZW5kVG9rZW4odG9rZW5TdHJpbmc6IHN0cmluZywgdG9rZW5BcnJheTogVG9rZW5bXSwgcmF3PzogYm9vbGVhbik6IFRva2VuW10ge1xuXHRcdGlmICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xuXHRcdFx0Y29uc3QgdG9rZW46IFRva2VuID0ge1xuXHRcdFx0XHRsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcblx0XHRcdFx0cmF3OiB0b2tlblN0cmluZyxcblx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcblx0XHRcdFx0dHlwZTogRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFlcblx0XHRcdH07XG5cblx0XHRcdGlmICghcmF3KSB7XG5cdFx0XHRcdHRva2VuLnR5cGUgPSBtYXBTeW1ib2xUb1R5cGUodG9rZW4uc3ltYm9sKTtcblx0XHRcdH1cblx0XHRcdHRva2VuQXJyYXkucHVzaCh0b2tlbik7XG5cdFx0fVxuXHRcdHJldHVybiB0b2tlbkFycmF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIHRoZSBpbnRlcm5hbCBzdHJpbmcgYW5kIHJldHVybiBhbiBhcnJheSBvZiB0b2tlbnMuXG5cdCAqIEByZXR1cm4gVG9rZW5bXVxuXHQgKi9cblx0cHVibGljIHBhcnNlVG9rZW5zKCk6IFRva2VuW10ge1xuXHRcdGlmICghdGhpcy5fZm9ybWF0U3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdGxldCByZXN1bHQ6IFRva2VuW10gPSBbXTtcblxuXHRcdGxldCBjdXJyZW50VG9rZW46IHN0cmluZyA9IFwiXCI7XG5cdFx0bGV0IHByZXZpb3VzQ2hhcjogc3RyaW5nID0gXCJcIjtcblx0XHRsZXQgcXVvdGluZzogYm9vbGVhbiA9IGZhbHNlO1xuXHRcdGxldCBwb3NzaWJsZUVzY2FwaW5nOiBib29sZWFuID0gZmFsc2U7XG5cblx0XHRmb3IgKGNvbnN0IGN1cnJlbnRDaGFyIG9mIHRoaXMuX2Zvcm1hdFN0cmluZykge1xuXHRcdFx0Ly8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXG5cdFx0XHRpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XG5cdFx0XHRcdGlmICghcXVvdGluZykge1xuXHRcdFx0XHRcdGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XG5cdFx0XHRcdFx0XHQvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xuXHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQpO1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IFwiJ1wiO1xuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHRcdFx0Ly8gRXNjYXBpbmcsIGFkZCAnIHRvIHRoZSB0b2tlblxuXHRcdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghcG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHRcdC8vIEN1cnJlbnQgY2hhcmFjdGVyIGlzIHJlbGV2YW50LCBzbyBzYXZlIGl0IGZvciBpbnNwZWN0aW5nIG5leHQgcm91bmRcblx0XHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH0gZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHRxdW90aW5nID0gIXF1b3Rpbmc7XG5cdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBGbHVzaCBjdXJyZW50IHRva2VuXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0LCAhcXVvdGluZyk7XG5cdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChxdW90aW5nKSB7XG5cdFx0XHRcdC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cblx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuXHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XG5cdFx0XHRcdC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcblx0XHRcdFx0Y3VycmVudFRva2VuID0gY3VycmVudENoYXI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xuXHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XG5cdFx0XHR9XG5cblx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuXHRcdH1cblx0XHQvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXG5cdFx0cmVzdWx0ID0gdGhpcy5fYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCByZXN1bHQsIHF1b3RpbmcpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59XG5cbi8qKlxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcbiAqL1xuZXhwb3J0IGVudW0gRGF0ZVRpbWVUb2tlblR5cGUge1xuXHRJREVOVElUWSwgLy8gU3BlY2lhbCwgZG8gbm90IFwiZm9ybWF0XCIgdGhpcywgYnV0IGp1c3Qgb3V0cHV0IHdoYXQgd2VudCBpblxuXG5cdEVSQSxcblx0WUVBUixcblx0UVVBUlRFUixcblx0TU9OVEgsXG5cdFdFRUssXG5cdERBWSxcblx0V0VFS0RBWSxcblx0REFZUEVSSU9ELFxuXHRIT1VSLFxuXHRNSU5VVEUsXG5cdFNFQ09ORCxcblx0Wk9ORVxufVxuXG4vKipcbiAqIEJhc2ljIHRva2VuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW4ge1xuXHQvKipcblx0ICogVGhlIHR5cGUgb2YgdG9rZW5cblx0ICovXG5cdHR5cGU6IERhdGVUaW1lVG9rZW5UeXBlO1xuXG5cdC8qKlxuXHQgKiBUaGUgc3ltYm9sIGZyb20gd2hpY2ggdGhlIHRva2VuIHdhcyBwYXJzZWRcblx0ICovXG5cdHN5bWJvbDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSB0b2tlblxuXHQgKi9cblx0bGVuZ3RoOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCBwcm9kdWNlZCB0aGlzIHRva2VuXG5cdCAqL1xuXHRyYXc6IHN0cmluZztcbn1cblxuY29uc3Qgc3ltYm9sTWFwcGluZzogeyBbY2hhcjogc3RyaW5nXTogRGF0ZVRpbWVUb2tlblR5cGUgfSA9IHtcblx0RzogRGF0ZVRpbWVUb2tlblR5cGUuRVJBLFxuXG5cdHk6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXG5cdFk6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXG5cdHU6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXG5cdFU6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXG5cdHI6IERhdGVUaW1lVG9rZW5UeXBlLllFQVIsXG5cblx0UTogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcblx0cTogRGF0ZVRpbWVUb2tlblR5cGUuUVVBUlRFUixcblxuXHRNOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcblx0TDogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXG5cdGw6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxuXG5cdHc6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXG5cdFc6IERhdGVUaW1lVG9rZW5UeXBlLldFRUssXG5cblx0ZDogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxuXHREOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXG5cdEY6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcblx0ZzogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxuXG5cdEU6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXG5cdGU6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXG5cdGM6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXG5cblx0YTogRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxuXG5cdGg6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cdEg6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cdGs6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cdEs6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cdGo6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cdEo6IERhdGVUaW1lVG9rZW5UeXBlLkhPVVIsXG5cblx0bTogRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFLFxuXG5cdHM6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcblx0UzogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxuXHRBOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXG5cblx0ejogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0WjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0TzogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0djogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0VjogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0WDogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORSxcblx0eDogRGF0ZVRpbWVUb2tlblR5cGUuWk9ORVxufTtcblxuLyoqXG4gKiBNYXAgdGhlIGdpdmVuIHN5bWJvbCB0byBvbmUgb2YgdGhlIERhdGVUaW1lVG9rZW5UeXBlc1xuICogSWYgdGhlcmUgaXMgbm8gbWFwcGluZywgRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFkgaXMgdXNlZFxuICpcbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHNpbmdsZS1jaGFyYWN0ZXIgc3ltYm9sIHVzZWQgdG8gbWFwIHRoZSB0b2tlblxuICogQHJldHVybiBEYXRlVGltZVRva2VuVHlwZSBUaGUgVHlwZSBvZiB0b2tlbiB0aGlzIHN5bWJvbCByZXByZXNlbnRzXG4gKi9cbmZ1bmN0aW9uIG1hcFN5bWJvbFRvVHlwZShzeW1ib2w6IHN0cmluZyk6IERhdGVUaW1lVG9rZW5UeXBlIHtcblx0aWYgKHN5bWJvbE1hcHBpbmcuaGFzT3duUHJvcGVydHkoc3ltYm9sKSkge1xuXHRcdHJldHVybiBzeW1ib2xNYXBwaW5nW3N5bWJvbF07XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZO1xuXHR9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICpcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50T3B0cywgVGltZVN0cnVjdCwgVGltZVVuaXQsIFdlZWtEYXkgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xuXG4vKipcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcbiAqL1xuZXhwb3J0IGVudW0gVG9UeXBlIHtcblx0LyoqXG5cdCAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXG5cdCAqL1xuXHRZZWFyLFxuXHQvKipcblx0ICogXCJtYXhcIlxuXHQgKi9cblx0TWF4XG59XG5cbi8qKlxuICogVHlwZSBvZiBydWxlIE9OIGNvbHVtbiB2YWx1ZVxuICovXG5leHBvcnQgZW51bSBPblR5cGUge1xuXHQvKipcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxuXHQgKi9cblx0RGF5TnVtLFxuXHQvKipcblx0ICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXG5cdCAqL1xuXHRMYXN0WCxcblx0LyoqXG5cdCAqIGUuZy4gXCJTdW4+PThcIlxuXHQgKi9cblx0R3JlcVgsXG5cdC8qKlxuXHQgKiBlLmcuIFwiU3VuPD04XCJcblx0ICovXG5cdExlcVhcbn1cblxuZXhwb3J0IGVudW0gQXRUeXBlIHtcblx0LyoqXG5cdCAqIExvY2FsIHRpbWUgKG5vIERTVClcblx0ICovXG5cdFN0YW5kYXJkLFxuXHQvKipcblx0ICogV2FsbCBjbG9jayB0aW1lIChsb2NhbCB0aW1lIHdpdGggRFNUKVxuXHQgKi9cblx0V2FsbCxcblx0LyoqXG5cdCAqIFV0YyB0aW1lXG5cdCAqL1xuXHRVdGMsXG59XG5cbi8qKlxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcbiAqXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxuICovXG5leHBvcnQgY2xhc3MgUnVsZUluZm8ge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdC8qKlxuXHRcdCAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXG5cdFx0ICovXG5cdFx0cHVibGljIGZyb206IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBUTyBjb2x1bW4gdHlwZTogWWVhciBmb3IgeWVhciBudW1iZXJzIGFuZCBcIm9ubHlcIiB2YWx1ZXMsIE1heCBmb3IgXCJtYXhcIiB2YWx1ZS5cblx0XHQgKi9cblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXG5cdFx0LyoqXG5cdFx0ICogSWYgVE8gY29sdW1uIGlzIGEgeWVhciwgdGhlIHllYXIgbnVtYmVyLiBJZiBUTyBjb2x1bW4gaXMgXCJvbmx5XCIsIHRoZSBGUk9NIHllYXIuXG5cdFx0ICovXG5cdFx0cHVibGljIHRvWWVhcjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcblx0XHQgKi9cblx0XHRwdWJsaWMgdHlwZTogc3RyaW5nLFxuXHRcdC8qKlxuXHRcdCAqIElOIGNvbHVtbiBtb250aCBudW1iZXIgMS0xMlxuXHRcdCAqL1xuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogT04gY29sdW1uIHR5cGVcblx0XHQgKi9cblx0XHRwdWJsaWMgb25UeXBlOiBPblR5cGUsXG5cdFx0LyoqXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcblx0XHQgKi9cblx0XHRwdWJsaWMgb25EYXk6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBJZiBvblR5cGUgaXMgbm90IERheU51bSwgdGhlIHdlZWtkYXlcblx0XHQgKi9cblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxuXHRcdC8qKlxuXHRcdCAqIEFUIGNvbHVtbiBob3VyXG5cdFx0ICovXG5cdFx0cHVibGljIGF0SG91cjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRNaW51dGU6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBBVCBjb2x1bW4gc2Vjb25kXG5cdFx0ICovXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogQVQgY29sdW1uIHR5cGVcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRUeXBlOiBBdFR5cGUsXG5cdFx0LyoqXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXG5cdFx0ICovXG5cdFx0cHVibGljIHNhdmU6IER1cmF0aW9uLFxuXHRcdC8qKlxuXHRcdCAqIENoYXJhY3RlciB0byBpbnNlcnQgaW4gJXMgZm9yIHRpbWUgem9uZSBhYmJyZXZpYXRpb25cblx0XHQgKiBOb3RlIGlmIFRaIGRhdGFiYXNlIGluZGljYXRlcyBcIi1cIiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcblx0XHQgKi9cblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcblx0XHQpIHtcblxuXHRcdGlmICh0aGlzLnNhdmUpIHtcblx0XHRcdHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KFRpbWVVbml0LkhvdXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXG5cdCAqL1xuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XG5cdFx0XHRjYXNlIFRvVHlwZS5NYXg6IHJldHVybiB0cnVlO1xuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU29ydCBjb21wYXJpc29uXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxuXHQgKi9cblx0cHVibGljIGVmZmVjdGl2ZUxlc3Mob3RoZXI6IFJ1bGVJbmZvKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSA8IG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTb3J0IGNvbXBhcmlzb25cblx0ICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgZXF1YWwgdG8gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcblx0ICovXG5cdHB1YmxpYyBlZmZlY3RpdmVFcXVhbChvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5mcm9tICE9PSBvdGhlci5mcm9tKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluTW9udGggIT09IG90aGVyLmluTW9udGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcblx0ICogaXMgTk9UIGFkanVzdGVkIGZvciB3YWxsIGNsb2NrIHRpbWUgb3Igc3RhbmRhcmQgdGltZSwgaS5lLiB0aGlzLmF0VHlwZSBpc1xuXHQgKiBub3QgdGFrZW4gaW50byBhY2NvdW50XG5cdCAqL1xuXHRwdWJsaWMgZWZmZWN0aXZlRGF0ZSh5ZWFyOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcblx0XHRhc3NlcnQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gXCIgKyB5ZWFyLnRvU3RyaW5nKDEwKSk7XG5cblx0XHQvLyB5ZWFyIGFuZCBtb250aCBhcmUgZ2l2ZW5cblx0XHRjb25zdCB0bTogVGltZUNvbXBvbmVudE9wdHMgPSB7eWVhciwgbW9udGg6IHRoaXMuaW5Nb250aCB9O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIGRheVxuXHRcdHN3aXRjaCAodGhpcy5vblR5cGUpIHtcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xuXHRcdFx0XHR0bS5kYXkgPSB0aGlzLm9uRGF5O1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdH1cblxuXHRcdC8vIGNhbGN1bGF0ZSB0aW1lXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xuXHRcdHRtLm1pbnV0ZSA9IHRoaXMuYXRNaW51dGU7XG5cdFx0dG0uc2Vjb25kID0gdGhpcy5hdFNlY29uZDtcblxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0bSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdHJhbnNpdGlvbiBtb21lbnQgaW4gVVRDIGluIHRoZSBnaXZlbiB5ZWFyXG5cdCAqXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0VGhlIHN0YW5kYXJkIG9mZnNldCBmb3IgdGhlIHRpbWV6b25lIHdpdGhvdXQgRFNUXG5cdCAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcblx0ICovXG5cdHB1YmxpYyB0cmFuc2l0aW9uVGltZVV0Yyh5ZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbiwgcHJldlJ1bGU/OiBSdWxlSW5mbyk6IG51bWJlciB7XG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS51bml4TWlsbGlzO1xuXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcblx0XHRsZXQgb2Zmc2V0OiBEdXJhdGlvbjtcblx0XHRzd2l0Y2ggKHRoaXMuYXRUeXBlKSB7XG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XG5cdFx0XHRcdG9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxuXHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxuXHRcdFx0XHRpZiAocHJldlJ1bGUpIHtcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldC5hZGQocHJldlJ1bGUuc2F2ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XG5cdFx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdW5peE1pbGxpcyAtIG9mZnNldC5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cbn1cblxuLyoqXG4gKiBUeXBlIG9mIHJlZmVyZW5jZSBmcm9tIHpvbmUgdG8gcnVsZVxuICovXG5leHBvcnQgZW51bSBSdWxlVHlwZSB7XG5cdC8qKlxuXHQgKiBObyBydWxlIGFwcGxpZXNcblx0ICovXG5cdE5vbmUsXG5cdC8qKlxuXHQgKiBGaXhlZCBnaXZlbiBvZmZzZXRcblx0ICovXG5cdE9mZnNldCxcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byBhIG5hbWVkIHNldCBvZiBydWxlc1xuXHQgKi9cblx0UnVsZU5hbWVcbn1cblxuLyoqXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxuICpcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXG4gKiBGaXJzdCwgYW5kIHNvbWV3aGF0IHRyaXZpYWxseSwgd2hlcmVhcyBSdWxlcyBhcmUgY29uc2lkZXJlZCB0byBjb250YWluIG9uZSBvciBtb3JlIHJlY29yZHMsIGEgWm9uZSBpcyBjb25zaWRlcmVkIHRvXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cbiAqIFNlY29uZCwgYW5kIG1vcmUgZnVuZGFtZW50YWxseSwgZWFjaCBsaW5lIG9mIGEgWm9uZSByZXByZXNlbnRzIGEgc3RlYWR5IHN0YXRlLCBub3QgYSB0cmFuc2l0aW9uIGJldHdlZW4gc3RhdGVzLlxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxuICogV2hlcmUgdGhhdCB3b3VsZCBiZSBhbWJpZ3VvdXMgYmVjYXVzZSB3ZeKAmXJlIHNldHRpbmcgb3VyIGNsb2NrcyBiYWNrLCB0aGUgW1VOVElMXSBjb2x1bW4gc3BlY2lmaWVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBpbnN0YW50LlxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXG4gKiB0aGF0LCBpdCBoYXMgbm8gYmVnaW5uaW5nLiA4LSkgRm9yIHNvbWUgcGxhY2VzIG5lYXIgdGhlIEludGVybmF0aW9uYWwgRGF0ZSBMaW5lLCB0aGUgZmlyc3QgdHdvIGxpbmVzIHdpbGwgc2hvdyBzb2xhciB0aW1lcyBkaWZmZXJpbmcgYnlcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXG4gKiBab25lIEFtZXJpY2EvSnVuZWF1XHQgMTU6MDI6MTkgLVx0TE1UXHQxODY3IE9jdCAxOFxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxuICogQWxhc2thIHdhcyB0aGVuIDI0IGhvdXJzIGVhcmxpZXIgdGhhbiBpdCBoYWQgYmVlbi4gPGFzaWRlPig2IE9jdG9iZXIgaW4gdGhlIEp1bGlhbiBjYWxlbmRhciwgd2hpY2ggUnVzc2lhIHdhcyBzdGlsbCB1c2luZyB0aGVuIGZvclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cbiAqIFRoZSBhYmJyZXZpYXRpb24sIOKAnExNVCzigJ0gc3RhbmRzIGZvciDigJxsb2NhbCBtZWFuIHRpbWUs4oCdIHdoaWNoIGlzIGFuIGludmVudGlvbiBvZiB0aGUgdHogZGF0YWJhc2UgYW5kIHdhcyBwcm9iYWJseSBuZXZlciBhY3R1YWxseVxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcbiAqL1xuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHQvKipcblx0XHQgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXG5cdFx0ICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXG5cdFx0ICovXG5cdFx0cHVibGljIGdtdG9mZjogRHVyYXRpb24sXG5cblx0XHQvKipcblx0XHQgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXG5cdFx0ICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cblx0XHQgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXG5cdFx0ICovXG5cdFx0cHVibGljIHJ1bGVUeXBlOiBSdWxlVHlwZSxcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxuXHRcdCAqL1xuXHRcdHB1YmxpYyBydWxlT2Zmc2V0OiBEdXJhdGlvbixcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXG5cdFx0ICovXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXG5cblx0XHQvKipcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxuXHRcdCAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxuXHRcdCAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXG5cdFx0ICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXG5cdFx0ICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxuXHRcdCAqL1xuXHRcdHB1YmxpYyBmb3JtYXQ6IHN0cmluZyxcblxuXHRcdC8qKlxuXHRcdCAqIFVudGlsIHRpbWVzdGFtcCBpbiB1bml4IHV0YyBtaWxsaXMuIFRoZSB6b25lIGluZm8gaXMgdmFsaWQgdXAgdG9cblx0XHQgKiBhbmQgZXhjbHVkaW5nIHRoaXMgdGltZXN0YW1wLlxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgdW5kZWZpbmVkIChmb3IgdGhlIGZpcnN0IHJ1bGUpXG5cdFx0ICovXG5cdFx0cHVibGljIHVudGlsPzogbnVtYmVyXG5cdCkge1xuXHRcdGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcblx0XHRcdHRoaXMucnVsZU9mZnNldCA9IHRoaXMucnVsZU9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcblx0XHR9XG5cdH1cbn1cblxuXG5lbnVtIFR6TW9udGhOYW1lcyB7XG5cdEphbiA9IDEsXG5cdEZlYiA9IDIsXG5cdE1hciA9IDMsXG5cdEFwciA9IDQsXG5cdE1heSA9IDUsXG5cdEp1biA9IDYsXG5cdEp1bCA9IDcsXG5cdEF1ZyA9IDgsXG5cdFNlcCA9IDksXG5cdE9jdCA9IDEwLFxuXHROb3YgPSAxMSxcblx0RGVjID0gMTJcbn1cblxuZnVuY3Rpb24gbW9udGhOYW1lVG9TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XG5cdFx0aWYgKFR6TW9udGhOYW1lc1tpXSA9PT0gbmFtZSkge1xuXHRcdFx0cmV0dXJuIGk7XG5cdFx0fVxuXHR9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRpZiAodHJ1ZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGggbmFtZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIpO1xuXHR9XG59XG5cbmVudW0gVHpEYXlOYW1lcyB7XG5cdFN1biA9IDAsXG5cdE1vbiA9IDEsXG5cdFR1ZSA9IDIsXG5cdFdlZCA9IDMsXG5cdFRodSA9IDQsXG5cdEZyaSA9IDUsXG5cdFNhdCA9IDZcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBhIHZhbGlkIG9mZnNldCBzdHJpbmcgaS5lLlxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcbiAqL1xuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHQvKipcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xuXHRcdCAqL1xuXHRcdHB1YmxpYyBhdDogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxuXG5cdFx0LyoqXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxuXHRcdCAqL1xuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xuXG5cdFx0KSB7XG5cdFx0aWYgKHRoaXMub2Zmc2V0KSB7XG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXG4gKi9cbmV4cG9ydCBlbnVtIE5vcm1hbGl6ZU9wdGlvbiB7XG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxuXHQgKi9cblx0VXAsXG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XG5cdCAqL1xuXHREb3duXG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFR6RGF0YWJhc2Uge1xuXG5cdC8qKlxuXHQgKiBTaW5nbGUgaW5zdGFuY2UgbWVtYmVyXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U/OiBUekRhdGFiYXNlO1xuXG5cdC8qKlxuXHQgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YSBUWiBkYXRhIGFzIEpTT04gb2JqZWN0IChmcm9tIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzKS5cblx0ICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW5pdChkYXRhPzogYW55IHwgYW55W10pOiB2b2lkIHtcblx0XHRpZiAoZGF0YSkge1xuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7IC8vIG5lZWRlZCBmb3IgYXNzZXJ0IGluIGNvbnN0cnVjdG9yXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZGF0YTogYW55W10gPSBbXTtcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xuXHRcdFx0Y29uc3QgZzogYW55ID0gKGdsb2JhbCA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cdFx0XHRpZiAoZykge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhnKSkge1xuXHRcdFx0XHRcdGlmIChrZXkuaW5kZXhPZihcInR6ZGF0YVwiKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZ1trZXldKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgYXMgaW5zdGFsbGVkIE5QTSBtb2R1bGVzXG5cdFx0XHRjb25zdCBmaW5kTm9kZU1vZHVsZXMgPSAocmVxdWlyZTogYW55KTogdm9pZCA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Ly8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxuXHRcdFx0XHRcdGNvbnN0IHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xuXHRcdFx0XHRcdGNvbnN0IGQgPSByZXF1aXJlKHR6RGF0YU5hbWUpOyAvLyB1c2UgdmFyaWFibGUgdG8gYXZvaWQgYnJvd3NlcmlmeSBhY3RpbmcgdXBcblx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHQvLyB0aGVuIHRyeSBzdWJzZXRzXG5cdFx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZXM6IHN0cmluZ1tdID0gW1xuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYWZyaWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hbnRhcmN0aWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hc2lhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYmFja3dhcmRcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXRjZXRlcmFcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWV1cm9wZVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1wYWNpZmljbmV3XCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zb3V0aGFtZXJpY2FcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLXN5c3RlbXZcIlxuXHRcdFx0XHRcdF07XG5cdFx0XHRcdFx0bW9kdWxlTmFtZXMuZm9yRWFjaCgobW9kdWxlTmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHQvLyBub3RoaW5nXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0ZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShkYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2Vcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKTogVHpEYXRhYmFzZSB7XG5cdFx0aWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xuXHRcdFx0VHpEYXRhYmFzZS5pbml0KCk7XG5cdFx0fVxuXHRcdHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZSBhcyBUekRhdGFiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRpbWUgem9uZSBkYXRhYmFzZSBkYXRhXG5cdCAqL1xuXHRwcml2YXRlIF9kYXRhOiBhbnk7XG5cblx0LyoqXG5cdCAqIENhY2hlZCBtaW4vbWF4IERTVCB2YWx1ZXNcblx0ICovXG5cdHByaXZhdGUgX21pbm1heDogTWluTWF4SW5mbztcblxuXHQvKipcblx0ICogQ2FjaGVkIHpvbmUgbmFtZXNcblx0ICovXG5cdHByaXZhdGUgX3pvbmVOYW1lczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIC0gZG8gbm90IHVzZSwgdGhpcyBpcyBhIHNpbmdsZXRvbiBjbGFzcy4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKSBpbnN0ZWFkXG5cdCAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGRhdGE6IGFueVtdKSB7XG5cdFx0YXNzZXJ0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ZGF0YS5sZW5ndGggPiAwLFxuXHRcdFx0XCJUaW1lem9uZWNvbXBsZXRlIG5lZWRzIHRpbWUgem9uZSBkYXRhLiBZb3UgbmVlZCB0byBpbnN0YWxsIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzIGJlZm9yZSB1c2luZyB0aW1lem9uZWNvbXBsZXRlLlwiXG5cdFx0KTtcblx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9kYXRhID0geyB6b25lczoge30sIHJ1bGVzOiB7fSB9O1xuXHRcdFx0ZGF0YS5mb3JFYWNoKChkOiBhbnkpOiB2b2lkID0+IHtcblx0XHRcdFx0aWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC5ydWxlcykpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEucnVsZXNba2V5XSA9IGQucnVsZXNba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC56b25lcykpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXG5cdCAqL1xuXHRwdWJsaWMgem9uZU5hbWVzKCk6IHN0cmluZ1tdIHtcblx0XHRpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xuXHRcdFx0dGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XG5cdFx0XHR0aGlzLl96b25lTmFtZXMuc29ydCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fem9uZU5hbWVzO1xuXHR9XG5cblx0cHVibGljIGV4aXN0cyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG5cdCAqXG5cdCAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcblx0ICovXG5cdHB1YmxpYyBtaW5Ec3RTYXZlKHpvbmVOYW1lPzogc3RyaW5nKTogRHVyYXRpb24ge1xuXHRcdGlmICh6b25lTmFtZSkge1xuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdFx0bGV0IHJlc3VsdDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xuXHRcdFx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVPZmZzZXQubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxuXHRcdFx0XHRcdCYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHRlbXApIHtcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1heGltdW0gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG5cdCAqXG5cdCAqIFJldHVybnMgMCBpZiB6b25lTmFtZSBnaXZlbiBhbmQgbm8gRFNUIG9ic2VydmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXG5cdCAqL1xuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcblx0XHRpZiAoem9uZU5hbWUpIHtcblx0XHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcblx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xuXHRcdFx0XHRcdGNvbnN0IHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiB0ZW1wKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXG5cdCAqL1xuXHRwdWJsaWMgaGFzRHN0KHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMubWF4RHN0U2F2ZSh6b25lTmFtZSkubWlsbGlzZWNvbmRzKCkgIT09IDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpcnN0IERTVCBjaGFuZ2UgbW9tZW50IEFGVEVSIHRoZSBnaXZlbiBVVEMgZGF0ZSBpbiBVVEMgbWlsbGlzZWNvbmRzLCB3aXRoaW4gb25lIHllYXIsXG5cdCAqIHJldHVybnMgdW5kZWZpbmVkIGlmIG5vIHN1Y2ggY2hhbmdlXG5cdCAqL1xuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QpOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIGE6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xuXG5cdFx0Ly8gZ2V0IGFsbCB6b25lIGluZm9zIGZvciBbZGF0ZSwgZGF0ZSsxeWVhcilcblx0XHRjb25zdCBhbGxab25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0Y29uc3QgcmVsZXZhbnRab25lSW5mb3M6IFpvbmVJbmZvW10gPSBbXTtcblx0XHRjb25zdCByYW5nZVN0YXJ0OiBudW1iZXIgPSB1dGNUaW1lLnVuaXhNaWxsaXM7XG5cdFx0Y29uc3QgcmFuZ2VFbmQ6IG51bWJlciA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xuXHRcdGxldCBwcmV2RW5kOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiBhbGxab25lSW5mb3MpIHtcblx0XHRcdGlmICgocHJldkVuZCA9PT0gdW5kZWZpbmVkIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xuXHRcdFx0XHRyZWxldmFudFpvbmVJbmZvcy5wdXNoKHpvbmVJbmZvKTtcblx0XHRcdH1cblx0XHRcdHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcblx0XHR9XG5cblx0XHQvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXG5cdFx0bGV0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSBbXTtcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHJlbGV2YW50Wm9uZUluZm9zKSB7XG5cdFx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXG5cdFx0XHR0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdChcblx0XHRcdFx0dGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgKyAxLCB6b25lSW5mby5nbXRvZmYpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR0cmFuc2l0aW9ucy5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcblx0XHR9KTtcblxuXHRcdC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxuXHRcdGxldCBwcmV2U2F2ZTogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ID4gdXRjVGltZS51bml4TWlsbGlzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRyYW5zaXRpb24uYXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHByZXZTYXZlID0gdHJhbnNpdGlvbi5vZmZzZXQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xuXHQgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3Jcblx0ICogXCJVVENcIiwgXCJHTVRcIiwgXCJFdGMvR01UXCIgZXRjLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXG5cdCAqL1xuXHRwdWJsaWMgem9uZUlzVXRjKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xuXHRcdGxldCB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XG5cdFx0Ly8gZm9sbG93IGxpbmtzXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcblx0XHRcdH1cblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xuXHRcdH1cblx0XHRyZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcvc3VidHJhY3RpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2Zcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRBIGxvY2FsIHRpbWUsIGVpdGhlciBhcyBhIFRpbWVTdHJ1Y3Qgb3IgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHZhbHVlXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXAuXG5cdCAqXG5cdCAqIEByZXR1cm5cdFRoZSBub3JtYWxpemVkIHRpbWUsIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgbG9jYWxUaW1lIHBhcmFtZXRlciAoVGltZVN0cnVjdCBvciB1bml4IG1pbGxpcylcblx0ICovXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IG51bWJlciwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogbnVtYmVyO1xuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcblx0XHRpZiAodGhpcy5oYXNEc3Qoem9uZU5hbWUpKSB7XG5cdFx0XHRjb25zdCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xuXHRcdFx0Ly8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XG5cdFx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XG5cdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xuXG5cdFx0XHQvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxuXHRcdFx0Ly8gSW5zdGVhZCwgd2Ugc2hvdWxkIGNoZWNrIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9ucyB3aXRoaW4gYSB3aW5kb3cgYXJvdW5kIHRoZSBsb2NhbCB0aW1lXG5cblx0XHRcdC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyhcblx0XHRcdFx0em9uZU5hbWUsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMVxuXHRcdFx0KTtcblxuXHRcdFx0Ly8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcblx0XHRcdGxldCBwcmV2OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRcdC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cblx0XHRcdFx0aWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxCZWZvcmU6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyBwcmV2Lm1pbGxpc2Vjb25kcygpO1xuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcblx0XHRcdFx0XHRpZiAobG9jYWxUaW1lLnVuaXhNaWxsaXMgPj0gbG9jYWxCZWZvcmUgJiYgbG9jYWxUaW1lLnVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcblx0XHRcdFx0XHRcdGNvbnN0IGZhY3RvcjogbnVtYmVyID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcblx0XHRcdFx0XHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBub24tZXhpc3RpbmcgdGltZVxuXHRcdH1cblx0XHRyZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gYSA6IGEuY2xvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXG5cdCAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXQoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcblx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcblx0ICovXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xuXHRcdGxldCBkc3RPZmZzZXQ6IER1cmF0aW9uO1xuXG5cdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xuXHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOiB7XG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6IHtcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XG5cdFx0XHRcdGRzdE9mZnNldCA9IHRoaXMuZHN0T2Zmc2V0Rm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiAvLyBjYW5ub3QgaGFwcGVuLCBidXQgdGhlIGNvbXBpbGVyIGRvZXNudCByZWFsaXplIGl0XG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBkc3RPZmZzZXQuYWRkKHpvbmVJbmZvLmdtdG9mZik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxuXHQgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cblx0ICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxuXHQgKi9cblx0cHVibGljIGFiYnJldmlhdGlvbih6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcblx0XHRjb25zdCBmb3JtYXQ6IHN0cmluZyA9IHpvbmVJbmZvLmZvcm1hdDtcblxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xuXHRcdGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxuXHRcdFx0JiYgem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmc7XG5cdFx0XHQvLyBwbGFjZSBpbiBmb3JtYXQgc3RyaW5nXG5cdFx0XHRpZiAoZHN0RGVwZW5kZW50KSB7XG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3JtYXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cblx0ICpcblx0ICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxuXHQgKlxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IGxvY2FsVGltZSA6IGxvY2FsVGltZS51bml4TWlsbGlzKTtcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsICsgem9uZUluZm8uZ210b2ZmLm1pbGxpc2Vjb25kcygpID4gdW5peE1pbGxpcykge1xuXHRcdFx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0aWYgKHRydWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXG5cdCAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBVVEMgdGltZXMgYW5kIHRoZXJlZm9yZSBtdWx0aXBsZSBvZmZzZXRzIGZvciBhIGxvY2FsIHRpbWVcblx0ICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgdG90YWxPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWRUbTogVGltZVN0cnVjdCA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcblxuXHRcdC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXG5cblx0XHQvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXG5cdFx0Ly8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xuXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXG5cdFx0XHR6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxXG5cdFx0KTtcblx0XHRsZXQgcHJldjogVHJhbnNpdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcHJldlByZXY6IFRyYW5zaXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcblx0XHRcdFx0Ly8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cHJldlByZXYgPSBwcmV2O1xuXHRcdFx0cHJldiA9IHRyYW5zaXRpb247XG5cdFx0fVxuXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cblx0XHRpZiAocHJldikge1xuXHRcdFx0Ly8gc3BlY2lhbCBjYXJlIGR1cmluZyBiYWNrd2FyZCBjaGFuZ2U6IHRha2UgZmlyc3Qgb2NjdXJyZW5jZSBvZiBsb2NhbCB0aW1lXG5cdFx0XHRpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xuXHRcdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2Vcblx0XHRcdFx0Y29uc3QgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xuXHRcdFx0XHRpZiAobm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPj0gcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpXG5cdFx0XHRcdFx0JiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgKyBkaWZmLm1pbGxpc2Vjb25kcygpKSB7XG5cdFx0XHRcdFx0Ly8gd2l0aGluIGR1cGxpY2F0ZSByYW5nZVxuXHRcdFx0XHRcdHJldHVybiBwcmV2UHJldi5vZmZzZXQuY2xvbmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRoaXMgY2Fubm90IGhhcHBlbiBhcyB0aGUgdHJhbnNpdGlvbnMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBjb250YWluIGEgdHJhbnNpdGlvbiBhdCB0aGVcblx0XHRcdC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG5cdCAqL1xuXHRwdWJsaWMgZHN0T2Zmc2V0Rm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XG5cdFx0KTtcblxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xuXHRcdFx0XHRvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIW9mZnNldCkge1xuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXG5cdFx0XHRvZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvZmZzZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wIGFzIFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXNcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBsZXR0ZXJGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IHN0cmluZyB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXG5cdFx0XHRydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldFxuXHRcdCk7XG5cblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcblx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XG5cdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIWxldHRlcikge1xuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXG5cdFx0XHRsZXR0ZXIgPSBcIlwiO1xuXHRcdH1cblxuXHRcdHJldHVybiBsZXR0ZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Zmlyc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG5cdCAqXG5cdCAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcblx0ICovXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IFRyYW5zaXRpb25bXSB7XG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcblxuXHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcblx0XHRjb25zdCByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xuXG5cdFx0Zm9yIChsZXQgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XG5cdFx0XHRsZXQgcHJldkluZm86IFJ1bGVJbmZvIHwgdW5kZWZpbmVkO1xuXHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiBydWxlSW5mb3MpIHtcblx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHksIHN0YW5kYXJkT2Zmc2V0LCBwcmV2SW5mbyksXG5cdFx0XHRcdFx0XHRydWxlSW5mby5zYXZlLFxuXHRcdFx0XHRcdFx0cnVsZUluZm8ubGV0dGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cHJldkluZm8gPSBydWxlSW5mbztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cblx0ICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxuXHQgKi9cblx0cHVibGljIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyKTogVHJhbnNpdGlvbltdIHtcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xuXG5cdFx0Y29uc3Qgc3RhcnRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IGZyb21ZZWFyIH0pO1xuXHRcdGNvbnN0IGVuZE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcblxuXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdGFzc2VydCh6b25lSW5mb3MubGVuZ3RoID4gMCwgXCJFbXB0eSB6b25lSW5mb3MgYXJyYXkgcmV0dXJuZWQgZnJvbSBnZXRab25lSW5mb3MoKVwiKTtcblxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XG5cblx0XHRsZXQgcHJldlpvbmU6IFpvbmVJbmZvIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBwcmV2VW50aWxZZWFyOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHByZXZTdGRPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0bGV0IHByZXZEc3RPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0bGV0IHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdGNvbnN0IHVudGlsWWVhcjogbnVtYmVyID0gem9uZUluZm8udW50aWwgIT09IHVuZGVmaW5lZCA/IG5ldyBUaW1lU3RydWN0KHpvbmVJbmZvLnVudGlsKS5jb21wb25lbnRzLnllYXIgOiB0b1llYXIgKyAxO1xuXHRcdFx0bGV0IHN0ZE9mZnNldDogRHVyYXRpb24gPSBwcmV2U3RkT2Zmc2V0O1xuXHRcdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb24gPSBwcmV2RHN0T2Zmc2V0O1xuXHRcdFx0bGV0IGxldHRlcjogc3RyaW5nID0gcHJldkxldHRlcjtcblxuXHRcdFx0Ly8gem9uZSBhcHBsaWNhYmxlP1xuXHRcdFx0aWYgKCghcHJldlpvbmUgfHwgcHJldlpvbmUudW50aWwhIDwgZW5kTWlsbGlzIC0gMSkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XG5cblx0XHRcdFx0c3RkT2Zmc2V0ID0gem9uZUluZm8uZ210b2ZmO1xuXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6XG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5ob3VycygwKTtcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDpcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcblx0XHRcdFx0XHRcdC8vIGNoZWNrIHdoZXRoZXIgdGhlIGZpcnN0IHJ1bGUgdGFrZXMgZWZmZWN0IGltbWVkaWF0ZWx5IG9uIHRoZSB6b25lIHRyYW5zaXRpb25cblx0XHRcdFx0XHRcdC8vIChlLmcuIEx5YmlhKVxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiBydWxlSW5mb3MpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHByZXZVbnRpbFllYXIgPT09IFwibnVtYmVyXCIgJiYgcnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxZZWFyKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgdW5kZWZpbmVkKSA9PT0gcHJldlpvbmUudW50aWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gcnVsZUluZm8uc2F2ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBhZGQgYSB0cmFuc2l0aW9uIGZvciB0aGUgem9uZSB0cmFuc2l0aW9uXG5cdFx0XHRcdGNvbnN0IGF0OiBudW1iZXIgPSAocHJldlpvbmUgJiYgcHJldlpvbmUudW50aWwgIT09IHVuZGVmaW5lZCA/IHByZXZab25lLnVudGlsIDogc3RhcnRNaWxsaXMpO1xuXHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihhdCwgc3RkT2Zmc2V0LmFkZChkc3RPZmZzZXQpLCBsZXR0ZXIpKTtcblxuXHRcdFx0XHQvLyBhZGQgdHJhbnNpdGlvbnMgZm9yIHRoZSB6b25lIHJ1bGVzIGluIHRoZSByYW5nZVxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XG5cdFx0XHRcdFx0Y29uc3QgZHN0VHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxuXHRcdFx0XHRcdFx0em9uZUluZm8ucnVsZU5hbWUsXG5cdFx0XHRcdFx0XHRwcmV2VW50aWxZZWFyICE9PSB1bmRlZmluZWQgPyBNYXRoLm1heChwcmV2VW50aWxZZWFyLCBmcm9tWWVhcikgOiBmcm9tWWVhcixcblx0XHRcdFx0XHRcdE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSxcblx0XHRcdFx0XHRcdHN0ZE9mZnNldFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIGRzdFRyYW5zaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0O1xuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHByZXZab25lID0gem9uZUluZm87XG5cdFx0XHRwcmV2VW50aWxZZWFyID0gdW50aWxZZWFyO1xuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcblx0XHRcdHByZXZEc3RPZmZzZXQgPSBkc3RPZmZzZXQ7XG5cdFx0XHRwcmV2TGV0dGVyID0gbGV0dGVyO1xuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZSBzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kcyBvciBhcyBhIFRpbWVTdHJ1Y3Rcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Wm9uZUluZm8oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IFpvbmVJbmZvIHtcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2Ygem9uZUluZm9zKSB7XG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGlmICh0cnVlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcblx0ICovXG5cdHByaXZhdGUgX3pvbmVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBab25lSW5mb1tdIH0gPSB7fTtcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lLCBhZnRlclxuXHQgKiBmb2xsb3dpbmcgYW55IGxpbmtzLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcblx0ICogQHJldHVybiBBcnJheSBvZiB6b25lIGluZm9zLiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGdldFpvbmVJbmZvcyh6b25lTmFtZTogc3RyaW5nKTogWm9uZUluZm9bXSB7XG5cdFx0Ly8gRklSU1QgdmFsaWRhdGUgem9uZSBuYW1lIGJlZm9yZSBzZWFyY2hpbmcgY2FjaGVcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGFrZSBmcm9tIGNhY2hlXG5cdFx0aWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV07XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzdWx0OiBab25lSW5mb1tdID0gW107XG5cdFx0bGV0IGFjdHVhbFpvbmVOYW1lOiBzdHJpbmcgPSB6b25lTmFtZTtcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xuXHRcdC8vIGZvbGxvdyBsaW5rc1xuXHRcdHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcblx0XHR9XG5cdFx0Ly8gZmluYWwgem9uZSBpbmZvIGZvdW5kXG5cdFx0Zm9yIChjb25zdCB6b25lRW50cnkgb2Ygem9uZUVudHJpZXMpIHtcblx0XHRcdGNvbnN0IHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xuXHRcdFx0bGV0IHVudGlsOiBudW1iZXIgfCB1bmRlZmluZWQgPSBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVszXSk7XG5cdFx0XHRpZiAoaXNOYU4odW50aWwpKSB7XG5cdFx0XHRcdHVudGlsID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgWm9uZUluZm8oXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLFxuXHRcdFx0XHRydWxlVHlwZSxcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBEdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IER1cmF0aW9uKCksXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsXG5cdFx0XHRcdHpvbmVFbnRyeVsyXSxcblx0XHRcdFx0dW50aWxcblx0XHRcdCkpO1xuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBab25lSW5mbywgYjogWm9uZUluZm8pOiBudW1iZXIgPT4ge1xuXHRcdFx0Ly8gc29ydCB1bmRlZmluZWQgbGFzdFxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdGlmIChhLnVudGlsICE9PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIChhLnVudGlsISAtIGIudW50aWwhKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdID0gcmVzdWx0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxuXHQgKi9cblx0cHJpdmF0ZSBfcnVsZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFJ1bGVJbmZvW10gfSA9IHt9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBydWxlIHNldCB3aXRoIHRoZSBnaXZlbiBydWxlIG5hbWUsXG5cdCAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxuXHQgKlxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgcnVsZSBzZXRcblx0ICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBnZXRSdWxlSW5mb3MocnVsZU5hbWU6IHN0cmluZyk6IFJ1bGVJbmZvW10ge1xuXHRcdC8vIHZhbGlkYXRlIG5hbWUgQkVGT1JFIHNlYXJjaGluZyBjYWNoZVxuXHRcdGlmICghdGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly8gcmV0dXJuIGZyb20gY2FjaGVcblx0XHRpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcblx0XHR9XG5cblx0XHRjb25zdCByZXN1bHQ6IFJ1bGVJbmZvW10gPSBbXTtcblx0XHRjb25zdCBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XG5cdFx0Zm9yIChjb25zdCBydWxlIG9mIHJ1bGVTZXQpIHtcblxuXHRcdFx0Y29uc3QgZnJvbVllYXI6IG51bWJlciA9IChydWxlWzBdID09PSBcIk5hTlwiID8gLTEwMDAwIDogcGFyc2VJbnQocnVsZVswXSwgMTApKTtcblx0XHRcdGNvbnN0IHRvVHlwZTogVG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcblx0XHRcdGNvbnN0IHRvWWVhcjogbnVtYmVyID0gKHRvVHlwZSA9PT0gVG9UeXBlLk1heCA/IDAgOiAocnVsZVsxXSA9PT0gXCJvbmx5XCIgPyBmcm9tWWVhciA6IHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpO1xuXHRcdFx0Y29uc3Qgb25UeXBlOiBPblR5cGUgPSB0aGlzLnBhcnNlT25UeXBlKHJ1bGVbNF0pO1xuXHRcdFx0Y29uc3Qgb25EYXk6IG51bWJlciA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xuXHRcdFx0Y29uc3Qgb25XZWVrRGF5OiBXZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcblx0XHRcdGNvbnN0IG1vbnRoTmFtZTogc3RyaW5nID0gcnVsZVszXSBhcyBzdHJpbmc7XG5cdFx0XHRjb25zdCBtb250aE51bWJlcjogbnVtYmVyID0gbW9udGhOYW1lVG9TdHJpbmcobW9udGhOYW1lKTtcblxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFJ1bGVJbmZvKFxuXHRcdFx0XHRmcm9tWWVhcixcblx0XHRcdFx0dG9UeXBlLFxuXHRcdFx0XHR0b1llYXIsXG5cdFx0XHRcdHJ1bGVbMl0sXG5cdFx0XHRcdG1vbnRoTnVtYmVyLFxuXHRcdFx0XHRvblR5cGUsXG5cdFx0XHRcdG9uRGF5LFxuXHRcdFx0XHRvbldlZWtEYXksXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLFxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLFxuXHRcdFx0XHR0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLFxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksXG5cdFx0XHRcdHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN11cblx0XHRcdFx0KSk7XG5cblx0XHR9XG5cblx0XHRyZXN1bHQuc29ydCgoYTogUnVsZUluZm8sIGI6IFJ1bGVJbmZvKTogbnVtYmVyID0+IHtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0aWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9IGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xuXHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdID0gcmVzdWx0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZVJ1bGVUeXBlKHJ1bGU6IHN0cmluZyk6IFJ1bGVUeXBlIHtcblx0XHRpZiAocnVsZSA9PT0gXCItXCIpIHtcblx0XHRcdHJldHVybiBSdWxlVHlwZS5Ob25lO1xuXHRcdH0gZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlVG9UeXBlKHRvOiBzdHJpbmcpOiBUb1R5cGUge1xuXHRcdGlmICh0byA9PT0gXCJtYXhcIikge1xuXHRcdFx0cmV0dXJuIFRvVHlwZS5NYXg7XG5cdFx0fSBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XG5cdFx0fSBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVE8gY29sdW1uIGluY29ycmVjdDogXCIgKyB0byk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VPblR5cGUob246IHN0cmluZyk6IE9uVHlwZSB7XG5cdFx0aWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xuXHRcdFx0cmV0dXJuIE9uVHlwZS5MYXN0WDtcblx0XHR9XG5cdFx0aWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcblx0XHRcdHJldHVybiBPblR5cGUuTGVxWDtcblx0XHR9XG5cdFx0aWYgKG9uLmluZGV4T2YoXCI+PVwiKSAhPT0gLTEpIHtcblx0XHRcdHJldHVybiBPblR5cGUuR3JlcVg7XG5cdFx0fVxuXHRcdHJldHVybiBPblR5cGUuRGF5TnVtO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxuXHQgKi9cblx0cHVibGljIHBhcnNlT25EYXkob246IHN0cmluZywgb25UeXBlOiBPblR5cGUpOiBudW1iZXIge1xuXHRcdHN3aXRjaCAob25UeXBlKSB7XG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxuXHQgKi9cblx0cHVibGljIHBhcnNlT25XZWVrRGF5KG9uOiBzdHJpbmcpOiBXZWVrRGF5IHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xuXHRcdFx0aWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XG5cdFx0XHRcdHJldHVybiBpIGFzIFdlZWtEYXk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0aWYgKHRydWUpIHtcblx0XHRcdHJldHVybiBXZWVrRGF5LlN1bmRheTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZUF0VHlwZShhdDogYW55KTogQXRUeXBlIHtcblx0XHRzd2l0Y2ggKGF0KSB7XG5cdFx0XHRjYXNlIFwic1wiOiByZXR1cm4gQXRUeXBlLlN0YW5kYXJkO1xuXHRcdFx0Y2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XG5cdFx0XHRjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0Yztcblx0XHRcdGNhc2UgXCJ6XCI6IHJldHVybiBBdFR5cGUuVXRjO1xuXHRcdFx0Y2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xuXHRcdFx0Y2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBBdFR5cGUuV2FsbDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHJldHVybiBBdFR5cGUuV2FsbDtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG59XG5cbmludGVyZmFjZSBNaW5NYXhJbmZvIHtcblx0bWluRHN0U2F2ZTogbnVtYmVyO1xuXHRtYXhEc3RTYXZlOiBudW1iZXI7XG5cdG1pbkdtdE9mZjogbnVtYmVyO1xuXHRtYXhHbXRPZmY6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGE6IGFueSk6IE1pbk1heEluZm8ge1xuXHRjb25zdCByZXN1bHQ6IFBhcnRpYWw8TWluTWF4SW5mbz4gPSB7fTtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaXMgbm90IGFuIG9iamVjdFwiKTtcblx0fVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwicnVsZXNcIikpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyBydWxlcyBwcm9wZXJ0eVwiKTtcblx0fVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIikpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyB6b25lcyBwcm9wZXJ0eVwiKTtcblx0fVxuXG5cdC8vIHZhbGlkYXRlIHpvbmVzXG5cdGZvciAoY29uc3Qgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xuXHRcdGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xuXHRcdFx0Y29uc3Qgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XG5cdFx0XHRpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHQvLyBvaywgaXMgbGluayB0byBvdGhlciB6b25lLCBjaGVjayBsaW5rXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFyciBhcyBzdHJpbmcpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgem9uZUFyciBhcyBzdHJpbmcgKyBcIlxcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gYXJyYXlcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29uc3QgZW50cnk6IGFueSA9IHpvbmVBcnJbaV07XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKGVudHJ5Lmxlbmd0aCAhPT0gNCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmIChpc05hTihnbXRvZmYpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHRoaXJkIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gIT09IFwic3RyaW5nXCIgJiYgZW50cnlbM10gIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4R210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmID4gcmVzdWx0Lm1heEdtdE9mZikge1xuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIHZhbGlkYXRlIHJ1bGVzXG5cdGZvciAoY29uc3QgcnVsZU5hbWUgaW4gZGF0YS5ydWxlcykge1xuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuXHRcdFx0Y29uc3QgcnVsZUFycjogYW55ID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgcnVsZSA9IHJ1bGVBcnJbaV07XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlLmxlbmd0aCA8IDgpIHsgLy8gbm90ZSBzb21lIHJ1bGVzID4gOCBleGlzdHMgYnV0IHRoYXQgc2VlbXMgdG8gYmUgYSBidWcgaW4gdHogZmlsZSBwYXJzaW5nXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBydWxlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxuXHRcdFx0XHRcdCYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXG5cdFx0XHRcdFx0JiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgc2F2ZTogbnVtYmVyID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGlzTmFOKHNhdmUpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzYXZlICE9PSAwKSB7XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhEc3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluRHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQgYXMgTWluTWF4SW5mbztcbn1cbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kYXRldGltZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9kdXJhdGlvblwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vZ2xvYmFsc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BlcmlvZFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG4iXX0=
