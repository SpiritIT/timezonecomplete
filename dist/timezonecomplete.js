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
    /* istanbul ignore else */
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
        if (!isFinite(year) || !isFinite(month) || !isFinite(day) || !isFinite(hour) || !isFinite(minute) || !isFinite(second)
            || !isFinite(millisecond)) {
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
    var tokens = token_1.tokenize(formatString);
    var result = "";
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        var tokenResult = void 0;
        switch (token.type) {
            case token_1.TokenType.ERA:
                tokenResult = _formatEra(dateTime, token);
                break;
            case token_1.TokenType.YEAR:
                tokenResult = _formatYear(dateTime, token);
                break;
            case token_1.TokenType.QUARTER:
                tokenResult = _formatQuarter(dateTime, token, mergedFormatOptions);
                break;
            case token_1.TokenType.MONTH:
                tokenResult = _formatMonth(dateTime, token, mergedFormatOptions);
                break;
            case token_1.TokenType.DAY:
                tokenResult = _formatDay(dateTime, token);
                break;
            case token_1.TokenType.WEEKDAY:
                tokenResult = _formatWeekday(dateTime, token, mergedFormatOptions);
                break;
            case token_1.TokenType.DAYPERIOD:
                tokenResult = _formatDayPeriod(dateTime);
                break;
            case token_1.TokenType.HOUR:
                tokenResult = _formatHour(dateTime, token);
                break;
            case token_1.TokenType.MINUTE:
                tokenResult = _formatMinute(dateTime, token);
                break;
            case token_1.TokenType.SECOND:
                tokenResult = _formatSecond(dateTime, token);
                break;
            case token_1.TokenType.ZONE:
                tokenResult = _formatZone(dateTime, utcTime, localZone ? localZone : undefined, token);
                break;
            case token_1.TokenType.WEEK:
                tokenResult = _formatWeek(dateTime, token);
                break;
            case token_1.TokenType.IDENTITY: // intentional fallthrough
            /* istanbul ignore next */
            default:
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
        /* istanbul ignore next */
        default:
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
            if (token.length > 4) {
                result += token.raw.slice(4);
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
                        type: token_1.TokenType.ZONE
                    };
                    return _formatZone(currentTime, utcTime, zone, newToken);
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;
                /* istanbul ignore next */
                default:
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
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
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
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
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
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
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
            }
        /* istanbul ignore next */
        default:
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
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
        var tokens = token_1.tokenize(formatString);
        var time = { year: -1 };
        var zone = void 0;
        var pnr = void 0;
        var pzr = void 0;
        var remaining = dateTimeString;
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            switch (token.type) {
                /* istanbul ignore next */
                case token_1.TokenType.ERA:
                /* istanbul ignore next */
                case token_1.TokenType.QUARTER:
                /* istanbul ignore next */
                case token_1.TokenType.WEEKDAY:
                /* istanbul ignore next */
                case token_1.TokenType.DAYPERIOD:
                /* istanbul ignore next */
                case token_1.TokenType.WEEK:
                    /* istanbul ignore next */
                    break; // nothing to learn from this
                case token_1.TokenType.YEAR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.year = pnr.n;
                    break;
                case token_1.TokenType.MONTH:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.month = pnr.n;
                    break;
                case token_1.TokenType.DAY:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.day = pnr.n;
                    break;
                case token_1.TokenType.HOUR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.hour = pnr.n;
                    break;
                case token_1.TokenType.MINUTE:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    time.minute = pnr.n;
                    break;
                case token_1.TokenType.SECOND:
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
                case token_1.TokenType.ZONE:
                    pzr = stripZone(remaining);
                    remaining = pzr.remaining;
                    zone = pzr.zone;
                    break;
                /* istanbul ignore next */
                default:
                case token_1.TokenType.IDENTITY:
                    remaining = stripRaw(remaining, token.raw);
                    break;
            }
        }
        var result = { time: new basics_1.TimeStruct(time), zone: zone };
        if (!result.time.validate()) {
            throw new Error("invalid resulting date");
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
    /* istanbul ignore next */
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
/**
 * Different types of tokens, each for a DateTime "period type" (like year, month, hour etc.)
 */
var TokenType;
(function (TokenType) {
    /**
     * Raw text
     */
    TokenType[TokenType["IDENTITY"] = 0] = "IDENTITY";
    TokenType[TokenType["ERA"] = 1] = "ERA";
    TokenType[TokenType["YEAR"] = 2] = "YEAR";
    TokenType[TokenType["QUARTER"] = 3] = "QUARTER";
    TokenType[TokenType["MONTH"] = 4] = "MONTH";
    TokenType[TokenType["WEEK"] = 5] = "WEEK";
    TokenType[TokenType["DAY"] = 6] = "DAY";
    TokenType[TokenType["WEEKDAY"] = 7] = "WEEKDAY";
    TokenType[TokenType["DAYPERIOD"] = 8] = "DAYPERIOD";
    TokenType[TokenType["HOUR"] = 9] = "HOUR";
    TokenType[TokenType["MINUTE"] = 10] = "MINUTE";
    TokenType[TokenType["SECOND"] = 11] = "SECOND";
    TokenType[TokenType["ZONE"] = 12] = "ZONE";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
/**
 * Tokenize an LDML date/time format string
 * @param formatString the string to tokenize
 */
function tokenize(formatString) {
    if (!formatString) {
        return [];
    }
    var result = [];
    var appendToken = function (tokenString, raw) {
        // The tokenString may be longer than supported for a tokentype, e.g. "hhhh" which would be TWO hour specs.
        // We greedily consume LDML specs while possible
        while (tokenString !== "") {
            if (raw || !SYMBOL_MAPPING.hasOwnProperty(tokenString[0])) {
                var token = {
                    length: tokenString.length,
                    raw: tokenString,
                    symbol: tokenString[0],
                    type: TokenType.IDENTITY
                };
                result.push(token);
                tokenString = "";
            }
            else {
                // depending on the type of token, different lengths may be supported
                var info = SYMBOL_MAPPING[tokenString[0]];
                var length_1 = void 0;
                if (info.maxLength === undefined && (!Array.isArray(info.lengths) || info.lengths.length === 0)) {
                    // everything is allowed
                    length_1 = tokenString.length;
                }
                else if (info.maxLength !== undefined) {
                    // greedily gobble up
                    length_1 = Math.min(tokenString.length, info.maxLength);
                }
                else if (Array.isArray(info.lengths) && info.lengths.length > 0) {
                    // find maximum allowed length
                    for (var _i = 0, _a = info.lengths; _i < _a.length; _i++) {
                        var l = _a[_i];
                        if (l <= tokenString.length && (length_1 === undefined || length_1 < l)) {
                            length_1 = l;
                        }
                    }
                }
                /* istanbul ignore if */
                if (length_1 === undefined) {
                    // no allowed length found (not possible with current symbol mapping since length 1 is always allowed)
                    var token = {
                        length: tokenString.length,
                        raw: tokenString,
                        symbol: tokenString[0],
                        type: TokenType.IDENTITY
                    };
                    result.push(token);
                    tokenString = "";
                }
                else {
                    // prefix found
                    var token = {
                        length: length_1,
                        raw: tokenString.slice(0, length_1),
                        symbol: tokenString[0],
                        type: info.type
                    };
                    result.push(token);
                    tokenString = tokenString.slice(length_1);
                }
            }
        }
    };
    var currentToken = "";
    var previousChar = "";
    var quoting = false;
    var possibleEscaping = false;
    for (var _i = 0, formatString_1 = formatString; _i < formatString_1.length; _i++) {
        var currentChar = formatString_1[_i];
        // Hanlde escaping and quoting
        if (currentChar === "'") {
            if (!quoting) {
                if (possibleEscaping) {
                    // Escaped a single ' character without quoting
                    if (currentChar !== previousChar) {
                        appendToken(currentToken);
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
            appendToken(currentToken, !quoting);
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
            appendToken(currentToken);
            currentToken = currentChar;
        }
        else {
            // We are repeating the token with more characters
            currentToken += currentChar;
        }
        previousChar = currentChar;
    }
    // Don't forget to add the last token to the result!
    appendToken(currentToken, quoting);
    return result;
}
exports.tokenize = tokenize;
var SYMBOL_MAPPING = {
    G: { type: TokenType.ERA, maxLength: 5 },
    y: { type: TokenType.YEAR },
    Y: { type: TokenType.YEAR },
    u: { type: TokenType.YEAR },
    U: { type: TokenType.YEAR, maxLength: 5 },
    r: { type: TokenType.YEAR },
    Q: { type: TokenType.QUARTER, maxLength: 5 },
    q: { type: TokenType.QUARTER, maxLength: 5 },
    M: { type: TokenType.MONTH, maxLength: 5 },
    L: { type: TokenType.MONTH, maxLength: 5 },
    l: { type: TokenType.MONTH, maxLength: 1 },
    w: { type: TokenType.WEEK, maxLength: 2 },
    W: { type: TokenType.WEEK, maxLength: 1 },
    d: { type: TokenType.DAY, maxLength: 2 },
    D: { type: TokenType.DAY, maxLength: 3 },
    F: { type: TokenType.DAY, maxLength: 1 },
    g: { type: TokenType.DAY },
    E: { type: TokenType.WEEKDAY, maxLength: 6 },
    e: { type: TokenType.WEEKDAY, maxLength: 6 },
    c: { type: TokenType.WEEKDAY, maxLength: 6 },
    a: { type: TokenType.DAYPERIOD, maxLength: 5 },
    h: { type: TokenType.HOUR, maxLength: 2 },
    H: { type: TokenType.HOUR, maxLength: 2 },
    k: { type: TokenType.HOUR, maxLength: 2 },
    K: { type: TokenType.HOUR, maxLength: 2 },
    j: { type: TokenType.HOUR, maxLength: 6 },
    J: { type: TokenType.HOUR, maxLength: 2 },
    m: { type: TokenType.MINUTE, maxLength: 2 },
    s: { type: TokenType.SECOND, maxLength: 2 },
    S: { type: TokenType.SECOND },
    A: { type: TokenType.SECOND },
    z: { type: TokenType.ZONE, maxLength: 4 },
    Z: { type: TokenType.ZONE, maxLength: 5 },
    O: { type: TokenType.ZONE, lengths: [1, 4] },
    v: { type: TokenType.ZONE, lengths: [1, 4] },
    V: { type: TokenType.ZONE, maxLength: 4 },
    X: { type: TokenType.ZONE, maxLength: 5 },
    x: { type: TokenType.ZONE, maxLength: 5 },
};
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGxpYlxcYXNzZXJ0LnRzIiwic3JjXFxsaWJcXGJhc2ljcy50cyIsInNyY1xcbGliXFxkYXRldGltZS50cyIsInNyY1xcbGliXFxkdXJhdGlvbi50cyIsInNyY1xcbGliXFxmb3JtYXQudHMiLCJzcmNcXGxpYlxcZ2xvYmFscy50cyIsInNyY1xcbGliXFxqYXZhc2NyaXB0LnRzIiwic3JjXFxsaWJcXG1hdGgudHMiLCJzcmNcXGxpYlxccGFyc2UudHMiLCJzcmNcXGxpYlxccGVyaW9kLnRzIiwic3JjXFxsaWJcXHN0cmluZ3MudHMiLCJzcmNcXGxpYlxcdGltZXNvdXJjZS50cyIsInNyY1xcbGliXFx0aW1lem9uZS50cyIsInNyY1xcbGliXFx0b2tlbi50cyIsImRpc3RcXGxpYlxcc3JjXFxsaWJcXHR6LWRhdGFiYXNlLnRzIiwic3JjXFxsaWJcXGluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0dBRUc7QUFFSCxZQUFZLENBQUM7O0FBRWIsZ0JBQWdCLFNBQWMsRUFBRSxPQUFlO0lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLENBQUM7QUFDRixDQUFDO0FBRUQsa0JBQWUsTUFBTSxDQUFDOztBQ1p0Qjs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQUViLG1DQUE4QjtBQUM5QiwyQ0FBNkM7QUFDN0MsNkJBQStCO0FBQy9CLG1DQUFxQztBQXNFckM7OztHQUdHO0FBQ0gsSUFBWSxPQVFYO0FBUkQsV0FBWSxPQUFPO0lBQ2xCLHlDQUFNLENBQUE7SUFDTix5Q0FBTSxDQUFBO0lBQ04sMkNBQU8sQ0FBQTtJQUNQLCtDQUFTLENBQUE7SUFDVCw2Q0FBUSxDQUFBO0lBQ1IseUNBQU0sQ0FBQTtJQUNOLDZDQUFRLENBQUE7QUFDVCxD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LEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7bUJBQzNHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxFQUFFO21CQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRTttQkFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLEVBQUU7bUJBQzNELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7UUFDaEUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNiLENBQUM7SUFDRixDQUFDO0lBRUQ7O09BRUc7SUFDSSw2QkFBUSxHQUFmO1FBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDOUQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDakUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7Y0FDL0QsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMs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M0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRTtJQUMzQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzVDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUMxQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDMUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDeEMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN4QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3hDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFO0lBQzFCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUM1QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzVDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDOUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUMzQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzNDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFO0lBQzdCLENBQUMsRUFBRSxF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Q0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELHdCQUF3QjtnQkFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO3VCQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0YsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLDZDQUE2QyxDQUFDLENBQUM7Z0JBQzVHLENBQUM7Z0JBQ0QsSUFBTSxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0Msd0JBQXdCO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsc0NBQXNDLENBQUMsQ0FBQztnQkFDckcsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNqRSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2pFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUMxQixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBb0IsQ0FBQztBQUM3QixDQUFDOzs7O0FDbGxERDs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOzs7OztBQUViLDhCQUF5QjtBQUN6QixnQ0FBMkI7QUFDM0IsZ0NBQTJCO0FBQzNCLDhCQUF5QjtBQUN6QiwrQkFBMEI7QUFDMUIsa0NBQTZCO0FBQzdCLDZCQUF3QjtBQUN4Qiw4QkFBeUI7QUFDekIsOEJBQXlCO0FBQ3pCLGtDQUE2QjtBQUM3QixnQ0FBMkI7QUFDM0IsbUNBQThCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNiBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGFueSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcblx0aWYgKCFjb25kaXRpb24pIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzc2VydDtcclxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IERhdGVGdW5jdGlvbnMgfSBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XG5pbXBvcnQgKiBhcyBtYXRoIGZyb20gXCIuL21hdGhcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuXG4vKipcbiAqIFVzZWQgZm9yIG1ldGhvZHMgdGhhdCB0YWtlIGEgdGltZXN0YW1wIGFzIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lQ29tcG9uZW50T3B0cyB7XG5cdC8qKlxuXHQgKiBZZWFyLCBkZWZhdWx0IDE5NzBcblx0ICovXG5cdHllYXI/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNb250aCAxLTEyLCBkZWZhdWx0IDFcblx0ICovXG5cdG1vbnRoPzogbnVtYmVyO1xuXHQvKipcblx0ICogRGF5IG9mIG1vbnRoIDEtMzEsIGRlZmF1bHQgMVxuXHQgKi9cblx0ZGF5PzogbnVtYmVyO1xuXHQvKipcblx0ICogSG91ciBvZiBkYXkgMC0yMywgZGVmYXVsdCAwXG5cdCAqL1xuXHRob3VyPzogbnVtYmVyO1xuXHQvKipcblx0ICogTWludXRlIDAtNTksIGRlZmF1bHQgMFxuXHQgKi9cblx0bWludXRlPzogbnVtYmVyO1xuXHQvKipcblx0ICogU2Vjb25kIDAtNTksIGRlZmF1bHQgMFxuXHQgKi9cblx0c2Vjb25kPzogbnVtYmVyO1xuXHQvKipcblx0ICogTWlsbGlzZWNvbmQgMC05OTksIGRlZmF1bHQgMFxuXHQgKi9cblx0bWlsbGk/OiBudW1iZXI7XG59XG5cbi8qKlxuICogVGltZXN0YW1wIHJlcHJlc2VudGVkIGFzIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lQ29tcG9uZW50cyB7XG5cdC8qKlxuXHQgKiBZZWFyXG5cdCAqL1xuXHR5ZWFyOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNb250aCAxLTEyXG5cdCAqL1xuXHRtb250aDogbnVtYmVyO1xuXHQvKipcblx0ICogRGF5IG9mIG1vbnRoIDEtMzFcblx0ICovXG5cdGRheTogbnVtYmVyO1xuXHQvKipcblx0ICogSG91ciAwLTIzXG5cdCAqL1xuXHRob3VyOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaW51dGVcblx0ICovXG5cdG1pbnV0ZTogbnVtYmVyO1xuXHQvKipcblx0ICogU2Vjb25kXG5cdCAqL1xuXHRzZWNvbmQ6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5XG5cdCAqL1xuXHRtaWxsaTogbnVtYmVyO1xufVxuXG4vKipcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XG4gKiBTdW5kYXkgPSAwLCBNb25kYXkgPSAxIGV0Y1xuICovXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcblx0U3VuZGF5LFxuXHRNb25kYXksXG5cdFR1ZXNkYXksXG5cdFdlZG5lc2RheSxcblx0VGh1cnNkYXksXG5cdEZyaWRheSxcblx0U2F0dXJkYXlcbn1cblxuLyoqXG4gKiBUaW1lIHVuaXRzXG4gKi9cbmV4cG9ydCBlbnVtIFRpbWVVbml0IHtcblx0TWlsbGlzZWNvbmQsXG5cdFNlY29uZCxcblx0TWludXRlLFxuXHRIb3VyLFxuXHREYXksXG5cdFdlZWssXG5cdE1vbnRoLFxuXHRZZWFyLFxuXHQvKipcblx0ICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXG5cdCAqL1xuXHRNQVhcbn1cblxuLyoqXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcbiAqIGFuZCBhIHllYXIgaXMgc2V0IHRvIDM2MCBkYXlzIChiZWNhdXNlIDEyIG1vbnRocyBvZiAzMCBkYXlzKS5cbiAqXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcbiAqIEByZXR1cm5zXHRUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xuXHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiByZXR1cm4gMTtcblx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHJldHVybiA2MCAqIDEwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiByZXR1cm4gNjAgKiA2MCAqIDEwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcblx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHJldHVybiA3ICogODY0MDAwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDogcmV0dXJuIDMwICogODY0MDAwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0XCIpO1xuXHRcdFx0fVxuXHR9XG59XG5cbi8qKlxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cbiAqIGlmIG5lY2Vzc2FyeS5cbiAqIEBwYXJhbSB1bml0IFRoZSB1bml0XG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdDogVGltZVVuaXQsIGFtb3VudDogbnVtYmVyID0gMSk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XG5cdGlmIChhbW91bnQgPT09IDEgfHwgYW1vdW50ID09PSAtMSkge1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHJlc3VsdCArIFwic1wiO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHM6IHN0cmluZyk6IFRpbWVVbml0IHtcblx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcblx0XHRjb25zdCBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XG5cdFx0aWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xuXHRcdFx0cmV0dXJuIGk7XG5cdFx0fVxuXHR9XG5cdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0IHN0cmluZyAnXCIgKyBzICsgXCInXCIpO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0xlYXBZZWFyKHllYXI6IG51bWJlcik6IGJvb2xlYW4ge1xuXHQvLyBmcm9tIFdpa2lwZWRpYTpcblx0Ly8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxuXHQvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSAxMDAgdGhlbiBsZWFwIHllYXJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNDAwIHRoZW4gY29tbW9uIHllYXJcblx0Ly8gZWxzZSBsZWFwIHllYXJcblx0aWYgKHllYXIgJSA0ICE9PSAwKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIGlmICh5ZWFyICUgNDAwICE9PSAwKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG5cbi8qKlxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XG5cdHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcbiAqIEByZXR1cm4gVGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBnaXZlbiBtb250aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyKTogbnVtYmVyIHtcblx0c3dpdGNoIChtb250aCkge1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDM6XG5cdFx0Y2FzZSA1OlxuXHRcdGNhc2UgNzpcblx0XHRjYXNlIDg6XG5cdFx0Y2FzZSAxMDpcblx0XHRjYXNlIDEyOlxuXHRcdFx0cmV0dXJuIDMxO1xuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xuXHRcdGNhc2UgNDpcblx0XHRjYXNlIDY6XG5cdFx0Y2FzZSA5OlxuXHRcdGNhc2UgMTE6XG5cdFx0XHRyZXR1cm4gMzA7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGg6IFwiICsgbW9udGgpO1xuXHR9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGUuZy4gMTk4NlxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheU9mWWVhcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcblx0YXNzZXJ0KG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiTW9udGggb3V0IG9mIHJhbmdlXCIpO1xuXHRhc3NlcnQoZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xuXHRsZXQgeWVhckRheTogbnVtYmVyID0gMDtcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IG1vbnRoOyBpKyspIHtcblx0XHR5ZWFyRGF5ICs9IGRheXNJbk1vbnRoKHllYXIsIGkpO1xuXHR9XG5cdHllYXJEYXkgKz0gKGRheSAtIDEpO1xuXHRyZXR1cm4geWVhckRheTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XG4gKlxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xuXHRjb25zdCBlbmRPZk1vbnRoOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5OiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkgfSk7XG5cdGNvbnN0IGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBlbmRPZk1vbnRoV2Vla0RheTtcblx0aWYgKGRpZmYgPiAwKSB7XG5cdFx0ZGlmZiAtPSA3O1xuXHR9XG5cdHJldHVybiBlbmRPZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcbiAqXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxuICpcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xuXHRjb25zdCBiZWdpbk9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IDF9KTtcblx0Y29uc3QgYmVnaW5PZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGJlZ2luT2ZNb250aC51bml4TWlsbGlzKTtcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xuXHRpZiAoZGlmZiA8IDApIHtcblx0XHRkaWZmICs9IDc7XG5cdH1cblx0cmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzID49IHRoZSBnaXZlbiBkYXkuXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IHN0YXJ0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5IH0pO1xuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XG5cdGlmIChkaWZmIDwgMCkge1xuXHRcdGRpZmYgKz0gNztcblx0fVxuXHRhc3NlcnQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmIDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcblx0cmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPD0gdGhlIGdpdmVuIGRheS5cbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IHN0YXJ0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3Qoe3llYXIsIG1vbnRoLCBkYXl9KTtcblx0Y29uc3Qgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xuXHRpZiAoZGlmZiA+IDApIHtcblx0XHRkaWZmIC09IDc7XG5cdH1cblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA+PSAxLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxuICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXG4gKlxuICogQHBhcmFtIHllYXIgVGhlIHllYXJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXG4gKiBAcGFyYW0gZGF5IFRoZSBkYXkgWzEtMzFdXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrT2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcblx0Y29uc3QgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xuXHRjb25zdCBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcblx0Ly8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiB3ZWVrIDEgb3IgbGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXG5cdGlmIChkYXkgPCBmaXJzdE1vbmRheSkge1xuXHRcdGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcblx0XHRcdC8vIFdlZWsgMVxuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIExhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxuXHRcdFx0aWYgKG1vbnRoID4gMSkge1xuXHRcdFx0XHQvLyBEZWZhdWx0IGNhc2Vcblx0XHRcdFx0cmV0dXJuIHdlZWtPZk1vbnRoKHllYXIsIG1vbnRoIC0gMSwgMzEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSmFudWFyeVxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xuXHRjb25zdCBsYXN0VGh1cnNkYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcblx0aWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XG5cdFx0aWYgKGxhc3RNb25kYXkgPiBsYXN0VGh1cnNkYXkpIHtcblx0XHRcdC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdH1cblxuXHQvLyBOb3JtYWwgY2FzZVxuXHRsZXQgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xuXHRpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcblx0XHRyZXN1bHQgKz0gMTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGF5LW9mLXllYXIgb2YgdGhlIE1vbmRheSBvZiB3ZWVrIDEgaW4gdGhlIGdpdmVuIHllYXIuXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XG4gKiB3aWxsIGJlIChtdWNoKSBncmVhdGVyIHRoYW4gNFxuICovXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXI6IG51bWJlcik6IG51bWJlciB7XG5cdC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXG5cdGxldCByZXN1bHQ6IG51bWJlciA9IHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgMSwgMSwgV2Vla0RheS5Nb25kYXkpIC0gMTtcblx0aWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcblx0XHRyZXN1bHQgLT0gNztcblx0XHRpZiAocmVzdWx0IDwgMCkge1xuXHRcdFx0cmVzdWx0ICs9IGV4cG9ydHMuZGF5c0luWWVhcih5ZWFyIC0gMSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyIGZvciB0aGUgZ2l2ZW4gZGF0ZS4gV2VlayAxIGlzIHRoZSB3ZWVrXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxuICpcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXG4gKiBAcGFyYW0gZGF5XHREYXkgb2YgbW9udGggMS0zMVxuICpcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcblx0Y29uc3QgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xuXG5cdC8vIGNoZWNrIGVuZC1vZi15ZWFyIGNvcm5lciBjYXNlOiBtYXkgYmUgd2VlayAxIG9mIG5leHQgeWVhclxuXHRpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XG5cdFx0Y29uc3QgbmV4dFllYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyICsgMSk7XG5cdFx0aWYgKG5leHRZZWFyV2Vla09uZSA+IDQgJiYgbmV4dFllYXJXZWVrT25lIDw9IGRveSkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXHR9XG5cblx0Ly8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2Vcblx0Y29uc3QgdGhpc1llYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKTtcblx0aWYgKHRoaXNZZWFyV2Vla09uZSA+IDQpIHtcblx0XHQvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxuXHRcdGNvbnN0IHdlZWtUd28gPSB0aGlzWWVhcldlZWtPbmUgKyA3IC0gZGF5c0luWWVhcih5ZWFyIC0gMSk7XG5cdFx0aWYgKGRveSA8IHdlZWtUd28pIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gV2VlayAxIGlzIGVudGlyZWx5IGluc2lkZSB0aGlzIHllYXIuXG5cdGlmIChkb3kgPCB0aGlzWWVhcldlZWtPbmUpIHtcblx0XHQvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxuXHRcdHJldHVybiB3ZWVrTnVtYmVyKHllYXIgLSAxLCAxMiwgMzEpO1xuXHR9XG5cblx0Ly8gbm9ybWFsIGNhc2VzOyBub3RlIHRoYXQgd2VlayBudW1iZXJzIHN0YXJ0IGZyb20gMSBzbyArMVxuXHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzOiBudW1iZXIpOiB2b2lkIHtcblx0YXNzZXJ0KHR5cGVvZiAodW5peE1pbGxpcykgPT09IFwibnVtYmVyXCIsIFwibnVtYmVyIGlucHV0IGV4cGVjdGVkXCIpO1xuXHRhc3NlcnQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XG5cdGFzc2VydChtYXRoLmlzSW50KHVuaXhNaWxsaXMpLCBcIkV4cGVjdCBpbnRlZ2VyIG51bWJlciBmb3IgdW5peCBVVEMgdGltZXN0YW1wXCIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzOiBudW1iZXIpOiBUaW1lQ29tcG9uZW50cyB7XG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XG5cblx0bGV0IHRlbXA6IG51bWJlciA9IHVuaXhNaWxsaXM7XG5cdGNvbnN0IHJlc3VsdDogVGltZUNvbXBvbmVudHMgPSB7IHllYXI6IDAsIG1vbnRoOiAwLCBkYXk6IDAsIGhvdXI6IDAsIG1pbnV0ZTogMCwgc2Vjb25kOiAwLCBtaWxsaTogMH07XG5cdGxldCB5ZWFyOiBudW1iZXI7XG5cdGxldCBtb250aDogbnVtYmVyO1xuXG5cdGlmICh1bml4TWlsbGlzID49IDApIHtcblx0XHRyZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XG5cdFx0cmVzdWx0LnNlY29uZCA9IHRlbXAgJSA2MDtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcblx0XHRyZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xuXG5cdFx0eWVhciA9IDE5NzA7XG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xuXHRcdFx0dGVtcCAtPSBkYXlzSW5ZZWFyKHllYXIpO1xuXHRcdFx0eWVhcisrO1xuXHRcdH1cblx0XHRyZXN1bHQueWVhciA9IHllYXI7XG5cblx0XHRtb250aCA9IDE7XG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XG5cdFx0XHR0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcblx0XHRcdG1vbnRoKys7XG5cdFx0fVxuXHRcdHJlc3VsdC5tb250aCA9IG1vbnRoO1xuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcblx0fSBlbHNlIHtcblx0XHQvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXG5cdFx0Ly8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cblx0XHRyZXN1bHQubWlsbGkgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDEwMDApO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcblx0XHRyZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcblx0XHRyZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcblx0XHRyZXN1bHQuaG91ciA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMjQpO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XG5cblx0XHR5ZWFyID0gMTk2OTtcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5ZZWFyKHllYXIpKSB7XG5cdFx0XHR0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XG5cdFx0XHR5ZWFyLS07XG5cdFx0fVxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcblxuXHRcdG1vbnRoID0gMTI7XG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XG5cdFx0XHR0ZW1wICs9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcblx0XHRcdG1vbnRoLS07XG5cdFx0fVxuXHRcdHJlc3VsdC5tb250aCA9IG1vbnRoO1xuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMSArIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRmlsbCB5b3UgYW55IG1pc3NpbmcgdGltZSBjb21wb25lbnQgcGFydHMsIGRlZmF1bHRzIGFyZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxuICovXG5mdW5jdGlvbiBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzOiBUaW1lQ29tcG9uZW50T3B0cyk6IFRpbWVDb21wb25lbnRzIHtcblx0Y29uc3QgaW5wdXQgPSB7XG5cdFx0eWVhcjogdHlwZW9mIGNvbXBvbmVudHMueWVhciA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMueWVhciA6IDE5NzAsXG5cdFx0bW9udGg6IHR5cGVvZiBjb21wb25lbnRzLm1vbnRoID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5tb250aCA6IDEsXG5cdFx0ZGF5OiB0eXBlb2YgY29tcG9uZW50cy5kYXkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmRheSA6IDEsXG5cdFx0aG91cjogdHlwZW9mIGNvbXBvbmVudHMuaG91ciA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuaG91ciA6IDAsXG5cdFx0bWludXRlOiB0eXBlb2YgY29tcG9uZW50cy5taW51dGUgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbnV0ZSA6IDAsXG5cdFx0c2Vjb25kOiB0eXBlb2YgY29tcG9uZW50cy5zZWNvbmQgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnNlY29uZCA6IDAsXG5cdFx0bWlsbGk6IHR5cGVvZiBjb21wb25lbnRzLm1pbGxpID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taWxsaSA6IDAsXG5cdH07XG5cdHJldHVybiBpbnB1dDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgeWVhciwgbW9udGgsIGRheSBldGMgaW50byBhIHVuaXggbWlsbGkgdGltZXN0YW1wLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKlxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXlcdERheSAxLTMxXG4gKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXG4gKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxuICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcbiAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxuXHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCBob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlciwgbWlsbGk6IG51bWJlclxuKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxuXHRhOiBUaW1lQ29tcG9uZW50T3B0cyB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG4pOiBudW1iZXIge1xuXHRjb25zdCBjb21wb25lbnRzOiBUaW1lQ29tcG9uZW50T3B0cyA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHsgeWVhcjogYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0gOiBhKTtcblx0Y29uc3QgaW5wdXQ6IFRpbWVDb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XG5cdHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoXG5cdFx0aW5wdXQuc2Vjb25kICsgaW5wdXQubWludXRlICogNjAgKyBpbnB1dC5ob3VyICogMzYwMCArIGRheU9mWWVhcihpbnB1dC55ZWFyLCBpbnB1dC5tb250aCwgaW5wdXQuZGF5KSAqIDg2NDAwICtcblx0XHQoaW5wdXQueWVhciAtIDE5NzApICogMzE1MzYwMDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTk2OSkgLyA0KSAqIDg2NDAwIC1cblx0XHRNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgZGF5LW9mLXdlZWsuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXM6IG51bWJlcik6IFdlZWtEYXkge1xuXHRhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xuXG5cdGNvbnN0IGVwb2NoRGF5OiBXZWVrRGF5ID0gV2Vla0RheS5UaHVyc2RheTtcblx0Y29uc3QgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XG5cdHJldHVybiAoZXBvY2hEYXkgKyBkYXlzKSAlIDc7XG59XG5cbi8qKlxuICogTi10aCBzZWNvbmQgaW4gdGhlIGRheSwgY291bnRpbmcgZnJvbSAwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRPZkRheShob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlcik6IG51bWJlciB7XG5cdHJldHVybiAoKChob3VyICogNjApICsgbWludXRlKSAqIDYwKSArIHNlY29uZDtcbn1cblxuLyoqXG4gKiBCYXNpYyByZXByZXNlbnRhdGlvbiBvZiBhIGRhdGUgYW5kIHRpbWVcbiAqL1xuZXhwb3J0IGNsYXNzIFRpbWVTdHJ1Y3Qge1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIHRoZSBnaXZlbiB5ZWFyLCBtb250aCwgZGF5IGV0Y1xuXHQgKlxuXHQgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcblx0ICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXG5cdCAqIEBwYXJhbSBkYXlcdERheSAxLTMxXG5cdCAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZVx0TWludXRlIDAtNTlcblx0ICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcblx0ICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tQ29tcG9uZW50cyhcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLFxuXHRcdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBUaW1lU3RydWN0IHtcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXG5cdCAqIChiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tVW5peCh1bml4TWlsbGlzOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxuXHQgKiBAcGFyYW0gZGZcdFdoaWNoIGZ1bmN0aW9ucyB0byB0YWtlIChnZXRYKCkgb3IgZ2V0VVRDWCgpKVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tRGF0ZShkOiBEYXRlLCBkZjogRGF0ZUZ1bmN0aW9ucyk6IFRpbWVTdHJ1Y3Qge1xuXHRcdGlmIChkZiA9PT0gRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7XG5cdFx0XHRcdHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXG5cdFx0XHRcdGhvdXI6IGQuZ2V0SG91cnMoKSwgbWludXRlOiBkLmdldE1pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFNlY29uZHMoKSwgbWlsbGk6IGQuZ2V0TWlsbGlzZWNvbmRzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuXHRcdFx0XHR5ZWFyOiBkLmdldFVUQ0Z1bGxZZWFyKCksIG1vbnRoOiBkLmdldFVUQ01vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0VVRDRGF0ZSgpLFxuXHRcdFx0XHRob3VyOiBkLmdldFVUQ0hvdXJzKCksIG1pbnV0ZTogZC5nZXRVVENNaW51dGVzKCksIHNlY29uZDogZC5nZXRVVENTZWNvbmRzKCksIG1pbGxpOiBkLmdldFVUQ01pbGxpc2Vjb25kcygpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSBhbiBJU08gODYwMSBzdHJpbmcgV0lUSE9VVCB0aW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyhzOiBzdHJpbmcpOiBUaW1lU3RydWN0IHtcblx0XHR0cnkge1xuXHRcdFx0bGV0IHllYXI6IG51bWJlciA9IDE5NzA7XG5cdFx0XHRsZXQgbW9udGg6IG51bWJlciA9IDE7XG5cdFx0XHRsZXQgZGF5OiBudW1iZXIgPSAxO1xuXHRcdFx0bGV0IGhvdXI6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgbWludXRlOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gMDtcblx0XHRcdGxldCBmcmFjdGlvbk1pbGxpczogbnVtYmVyID0gMDtcblx0XHRcdGxldCBsYXN0VW5pdDogVGltZVVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuXG5cdFx0XHQvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XG5cdFx0XHRjb25zdCBzcGxpdDogc3RyaW5nW10gPSBzLnRyaW0oKS5zcGxpdChcIi5cIik7XG5cdFx0XHRhc3NlcnQoc3BsaXQubGVuZ3RoID49IDEgJiYgc3BsaXQubGVuZ3RoIDw9IDIsIFwiRW1wdHkgc3RyaW5nIG9yIG11bHRpcGxlIGRvdHMuXCIpO1xuXG5cdFx0XHQvLyBwYXJzZSBtYWluIHBhcnRcblx0XHRcdGNvbnN0IGlzQmFzaWNGb3JtYXQgPSAocy5pbmRleE9mKFwiLVwiKSA9PT0gLTEpO1xuXHRcdFx0aWYgKGlzQmFzaWNGb3JtYXQpIHtcblx0XHRcdFx0YXNzZXJ0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLFxuXHRcdFx0XHRcdFwiSVNPIHN0cmluZyBpbiBiYXNpYyBub3RhdGlvbiBtYXkgb25seSBjb250YWluIG51bWJlcnMgYmVmb3JlIHRoZSBmcmFjdGlvbmFsIHBhcnRcIik7XG5cblx0XHRcdFx0Ly8gcmVtb3ZlIGFueSBcIlRcIiBzZXBhcmF0b3Jcblx0XHRcdFx0c3BsaXRbMF0gPSBzcGxpdFswXS5yZXBsYWNlKFwiVFwiLCBcIlwiKTtcblxuXHRcdFx0XHRhc3NlcnQoWzQsIDgsIDEwLCAxMiwgMTRdLmluZGV4T2Yoc3BsaXRbMF0ubGVuZ3RoKSAhPT0gLTEsXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcblxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDQpIHtcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTApIHtcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTIpIHtcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xuXHRcdFx0XHRcdHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXNzZXJ0KHNwbGl0WzBdLm1hdGNoKC9eXFxkXFxkXFxkXFxkKC1cXGRcXGQtXFxkXFxkKChUKT9cXGRcXGQoXFw6XFxkXFxkKDpcXGRcXGQpPyk/KT8pPyQvKSwgXCJJbnZhbGlkIElTTyBzdHJpbmdcIik7XG5cdFx0XHRcdGxldCBkYXRlQW5kVGltZTogc3RyaW5nW10gPSBbXTtcblx0XHRcdFx0aWYgKHMuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XG5cdFx0XHRcdH0gZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLnN1YnN0cigwLCAxMCksIHNwbGl0WzBdLnN1YnN0cigxMCldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhc3NlcnQoWzQsIDEwXS5pbmRleE9mKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCkgIT09IC0xLFxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XG5cblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSA0KSB7XG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XG5cdFx0XHRcdFx0bW9udGggPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoNSwgMiksIDEwKTtcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoMywgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDgpIHtcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBwYXJzZSBmcmFjdGlvbmFsIHBhcnRcblx0XHRcdGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29uc3QgZnJhY3Rpb246IG51bWJlciA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xuXHRcdFx0XHRzd2l0Y2ggKGxhc3RVbml0KSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSBkYXlzSW5ZZWFyKHllYXIpICogODY0MDAwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA4NjQwMDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gNjAwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAxMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxuXHRcdFx0eWVhciA9IG1hdGgucm91bmRTeW0oeWVhcik7XG5cdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xuXHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xuXHRcdFx0aG91ciA9IG1hdGgucm91bmRTeW0oaG91cik7XG5cdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XG5cdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XG5cdFx0XHRsZXQgdW5peE1pbGxpczogbnVtYmVyID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCB9KTtcblx0XHRcdHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgdmFsdWUgaW4gdW5peCBtaWxsaXNlY29uZHNcblx0ICovXG5cdHByaXZhdGUgX3VuaXhNaWxsaXM6IG51bWJlcjtcblx0cHVibGljIGdldCB1bml4TWlsbGlzKCk6IG51bWJlciB7XG5cdFx0aWYgKHRoaXMuX3VuaXhNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHRoaXMuX2NvbXBvbmVudHMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB2YWx1ZSBpbiBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXG5cdCAqL1xuXHRwcml2YXRlIF9jb21wb25lbnRzOiBUaW1lQ29tcG9uZW50cztcblx0cHVibGljIGdldCBjb21wb25lbnRzKCk6IFRpbWVDb21wb25lbnRzIHtcblx0XHRpZiAoIXRoaXMuX2NvbXBvbmVudHMpIHtcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSB1bml4VG9UaW1lTm9MZWFwU2Vjcyh0aGlzLl91bml4TWlsbGlzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIHVuaXhNaWxsaXMgbWlsbGlzZWNvbmRzIHNpbmNlIDEtMS0xOTcwXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bml4TWlsbGlzOiBudW1iZXIpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGNvbXBvbmVudHMgU2VwYXJhdGUgdGltZXN0YW1wIGNvbXBvbmVudHMgKHllYXIsIG1vbnRoLCAuLi4pXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihjb21wb25lbnRzOiBUaW1lQ29tcG9uZW50T3B0cyk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxuXHQgKi9cblx0Y29uc3RydWN0b3IoYTogbnVtYmVyIHwgVGltZUNvbXBvbmVudE9wdHMpIHtcblx0XHRpZiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdHRoaXMuX3VuaXhNaWxsaXMgPSBhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9jb21wb25lbnRzID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoYSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0IHllYXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XG5cdH1cblxuXHRnZXQgbW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xuXHR9XG5cblx0Z2V0IGRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMuZGF5O1xuXHR9XG5cblx0Z2V0IGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XG5cdH1cblxuXHRnZXQgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XG5cdH1cblxuXHRnZXQgc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5zZWNvbmQ7XG5cdH1cblxuXHRnZXQgbWlsbGkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxuXHQgKi9cblx0cHVibGljIHllYXJEYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xuXHR9XG5cblx0cHVibGljIGVxdWFscyhvdGhlcjogVGltZVN0cnVjdCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlT2YoKSA9PT0gb3RoZXIudmFsdWVPZigpO1xuXHR9XG5cblx0cHVibGljIHZhbHVlT2YoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51bml4TWlsbGlzO1xuXHR9XG5cblx0cHVibGljIGNsb25lKCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fY29tcG9uZW50cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcblx0ICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxuXHQgKi9cblx0cHVibGljIHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLl9jb21wb25lbnRzKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoID49IDEgJiYgdGhpcy5jb21wb25lbnRzLm1vbnRoIDw9IDEyXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5kYXkgPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMuZGF5IDw9IGRheXNJbk1vbnRoKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgpXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPD0gNTlcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPD0gNTlcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxuXHQgKi9cblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMueWVhci50b1N0cmluZygxMCksIDQsIFwiMFwiKVxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubW9udGgudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIlRcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuaG91ci50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWludXRlLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbGxpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xuXHR9XG5cblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcblx0fVxuXG59XG5cblxuLyoqXG4gKiBCaW5hcnkgc2VhcmNoXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgdG8gc2VhcmNoXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeUluc2VydGlvbkluZGV4PFQ+KGFycjogVFtdLCBjb21wYXJlOiAoYTogVCkgPT4gbnVtYmVyKTogbnVtYmVyIHtcblx0bGV0IG1pbkluZGV4ID0gMDtcblx0bGV0IG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XG5cdGxldCBjdXJyZW50SW5kZXg6IG51bWJlcjtcblx0bGV0IGN1cnJlbnRFbGVtZW50OiBUO1xuXHQvLyBubyBhcnJheSAvIGVtcHR5IGFycmF5XG5cdGlmICghYXJyKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblx0aWYgKGFyci5sZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHQvLyBvdXQgb2YgYm91bmRzXG5cdGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblx0aWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XG5cdFx0cmV0dXJuIG1heEluZGV4ICsgMTtcblx0fVxuXHQvLyBlbGVtZW50IGluIHJhbmdlXG5cdHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xuXHRcdGN1cnJlbnRJbmRleCA9IE1hdGguZmxvb3IoKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMik7XG5cdFx0Y3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcblxuXHRcdGlmIChjb21wYXJlKGN1cnJlbnRFbGVtZW50KSA8IDApIHtcblx0XHRcdG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcblx0XHR9IGVsc2UgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpID4gMCkge1xuXHRcdFx0bWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY3VycmVudEluZGV4O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBtYXhJbmRleDtcbn1cblxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqXG4gKiBEYXRlK3RpbWUrdGltZXpvbmUgcmVwcmVzZW50YXRpb25cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IFRpbWVTdHJ1Y3QsIFRpbWVVbml0LCBXZWVrRGF5IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XG5pbXBvcnQgKiBhcyBmb3JtYXQgZnJvbSBcIi4vZm9ybWF0XCI7XG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XG5pbXBvcnQgKiBhcyBwYXJzZUZ1bmNzIGZyb20gXCIuL3BhcnNlXCI7XG5pbXBvcnQgeyBSZWFsVGltZVNvdXJjZSwgVGltZVNvdXJjZSB9IGZyb20gXCIuL3RpbWVzb3VyY2VcIjtcbmltcG9ydCB7IFRpbWVab25lLCBUaW1lWm9uZUtpbmQgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcblxuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XG5cdHJldHVybiBEYXRlVGltZS5ub3dMb2NhbCgpO1xufVxuXG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3dVdGMoKTogRGF0ZVRpbWUge1xuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XG59XG5cbi8qKlxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxuICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZCB8IG51bGwgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcblx0cmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIGZyb21ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcblx0aWYgKGZyb21ab25lKSB7XG5cdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBmcm9tWm9uZS5vZmZzZXRGb3Jab25lKGxvY2FsVGltZSk7XG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZS51bml4TWlsbGlzIC0gb2Zmc2V0ICogNjAwMDApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0RnJvbVV0Yyh1dGNUaW1lOiBUaW1lU3RydWN0LCB0b1pvbmU/OiBUaW1lWm9uZSk6IFRpbWVTdHJ1Y3Qge1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuXHRpZiAodG9ab25lKSB7XG5cdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSB0b1pvbmUub2Zmc2V0Rm9yVXRjKHV0Y1RpbWUpO1xuXHRcdHJldHVybiB0b1pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IFRpbWVTdHJ1Y3QodXRjVGltZS51bml4TWlsbGlzICsgb2Zmc2V0ICogNjAwMDApKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdXRjVGltZS5jbG9uZSgpO1xuXHR9XG59XG5cbi8qKlxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXG4gKiBhbmQgd2hpY2ggY2FuIGJlIG1vY2tlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcblxuXHQvKipcblx0ICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXG5cdCAqL1xuXHRwcml2YXRlIF91dGNEYXRlPzogVGltZVN0cnVjdDtcblx0cHJpdmF0ZSBnZXQgdXRjRGF0ZSgpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlO1xuXHR9XG5cdHByaXZhdGUgc2V0IHV0Y0RhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcblx0XHR0aGlzLl91dGNEYXRlID0gdmFsdWU7XG5cdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogTG9jYWwgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcblx0ICovXG5cdHByaXZhdGUgX3pvbmVEYXRlPzogVGltZVN0cnVjdDtcblx0cHJpdmF0ZSBnZXQgem9uZURhdGUoKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKCF0aGlzLl96b25lRGF0ZSkge1xuXHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGU7XG5cdH1cblx0cHJpdmF0ZSBzZXQgem9uZURhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcblx0XHR0aGlzLl96b25lRGF0ZSA9IHZhbHVlO1xuXHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxuXHQgKiBDYW4gYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIHRpbWVzdGFtcHNcblx0ICovXG5cdHByaXZhdGUgX3pvbmU/OiBUaW1lWm9uZTtcblxuXHQvKipcblx0ICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xuXHQgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXG5cdCAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGltZVNvdXJjZTogVGltZVNvdXJjZSA9IG5ldyBSZWFsVGltZVNvdXJjZSgpO1xuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcblx0XHRjb25zdCBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG4sIERhdGVGdW5jdGlvbnMuR2V0LCBUaW1lWm9uZS5sb2NhbCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBub3dVdGMoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbm93KHRpbWVab25lOiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSkudG9ab25lKHRpbWVab25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cblx0ICogQHJldHVybnMgYSBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRhc3NlcnQodHlwZW9mIG4gPT09IFwibnVtYmVyXCIsIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGEgbnVtYmVyXCIpO1xuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XG5cdFx0YXNzZXJ0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xuXHRcdGNvbnN0IHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG5cdCAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXG5cdCAqIGFuZCAyMDE1LTAzLTI5VDAyOjMwOjAwIHJldHVybnMgZmFsc2UgKGRheWxpZ2h0IHNhdmluZyB0aW1lIG1pc3NpbmcgaG91cilcblx0ICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxuXHQgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xuXHQgKiBiZWZvcmUgdGhhdC4gWW91IGNhbiBjaGFuZ2UgdGhhdCB3aXRoIHRoZSBhbGxvd1ByZTE5NzAgZmxhZy5cblx0ICpcblx0ICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZXhpc3RzKFxuXHRcdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciA9IDEsIGRheTogbnVtYmVyID0gMSxcblx0XHRob3VyOiBudW1iZXIgPSAwLCBtaW51dGU6IG51bWJlciA9IDAsIHNlY29uZDogbnVtYmVyID0gMCwgbWlsbGlzZWNvbmQ6IG51bWJlciA9IDAsXG5cdFx0em9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCwgYWxsb3dQcmUxOTcwOiBib29sZWFuID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKFxuXHRcdFx0IWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSkgfHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpXG5cdFx0XHR8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxuXHRcdFx0XHQmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBDcmVhdGVzIGN1cnJlbnQgdGltZSBpbiBsb2NhbCB0aW1lem9uZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cblx0ICpcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxuXHQgKiAgICAgICAgaXQgbWF5IGluY2x1ZGUgYSBzcGFjZSBhbmQgdGhlbiBhbmQgSUFOQSB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxuXHQgKiAgICAgICAgZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwKzAxOjAwXCJcdFx0XHRcdChVVEMgb2Zmc2V0IHdpdGhvdXQgZGF5bGlnaHQgc2F2aW5nIHRpbWUpXG5cdCAqICAgICAgICBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBaXCJcdFx0XHRcdFx0KFVUQylcblx0ICogICAgICAgIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBOb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcblx0ICogICAgICAgIGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcblx0ICovXG5cdGNvbnN0cnVjdG9yKGlzb1N0cmluZzogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIHN0cmluZyBpbiBnaXZlbiBMRE1MIGZvcm1hdC5cblx0ICogTk9URTogZG9lcyBub3QgaGFuZGxlIGVyYXMvcXVhcnRlcnMvd2Vla3Mvd2Vla2RheXMuXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVN0cmluZ1x0RGF0ZStUaW1lIHN0cmluZy5cblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxuXHQgKiAgICAgICAgTm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXG5cdCAqICAgICAgICBmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxuXHQgKiBkYXRlLmdldFllYXIoKS9nZXRYeHggbWV0aG9kcyBvciB0aGUgZGF0ZS5nZXRVVENZZWFyKCkvZGF0ZS5nZXRVVENYeHggbWV0aG9kcyxcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIERhdGUgY2xhc3MgaGFzIGJ1Z3MgYW5kIGluY29uc2lzdGVuY2llcyB3aGVuIGNvbnN0cnVjdGluZyB0aGVtIHdpdGggdGltZXMgYXJvdW5kXG5cdCAqIERTVCBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVx0QSBkYXRlIG9iamVjdC5cblx0ICogQHBhcmFtIGdldHRlcnMgU3BlY2lmaWVzIHdoaWNoIHNldCBvZiBEYXRlIGdldHRlcnMgY29udGFpbnMgdGhlIGRhdGUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZTogdGhlXG5cdCAqICAgICAgICBEYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cblx0ICogQHBhcmFtIHRpbWVab25lIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgdW5kZWZpbmVkIG9yIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMpXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xuXHQvKipcblx0ICogR2V0IGEgZGF0ZSBmcm9tIGEgVGltZVN0cnVjdFxuXHQgKi9cblx0Y29uc3RydWN0b3IodG06IFRpbWVTdHJ1Y3QsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyIChlLmcuIDIwMTQpXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cblx0ICogQHBhcmFtIGhvdXJcdFRoZSBob3VyIG9mIHRoZSBkYXkgWzAtMjQpXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kXHRUaGUgbWlsbGlzZWNvbmQgb2YgdGhlIHNlY29uZCBbMC05OTldXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbC91bmRlZmluZWQgKGZvciB1bmF3YXJlIGRhdGVzKVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGlzZWNvbmQ/OiBudW1iZXIsXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWRcblx0KTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB1bml4VGltZXN0YW1wXHRtaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcblx0ICogQHBhcmFtIHRpbWVab25lXHR0aGUgdGltZSB6b25lIHRoYXQgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIGluICh1c3VhbGx5IFVUQykuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bml4VGltZXN0YW1wOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRhMT86IGFueSwgYTI/OiBhbnksIGEzPzogYW55LFxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxuXHRcdHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsXG5cdCkge1xuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRpZiAoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmb3IgdW5peCB0aW1lc3RhbXAgZGF0ZXRpbWUgY29uc3RydWN0b3IsIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsICB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHQvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IGEyIGFzIFRpbWVab25lIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRpbWVab25lID09PSB1bmRlZmluZWQgfHwgdGltZVpvbmUgPT09IG51bGwgIHx8IHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUsXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGVpZ2h0aCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gYTEgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBtb250aDogbnVtYmVyID0gYTIgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBkYXk6IG51bWJlciA9IGEzIGFzIG51bWJlcjtcblx0XHRcdFx0XHRsZXQgaG91cjogbnVtYmVyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XG5cdFx0XHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbGxpOiBudW1iZXIgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG5cdFx0XHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcblx0XHRcdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XG5cdFx0XHRcdFx0bWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcblx0XHRcdFx0XHRjb25zdCB0bSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0XHRcdGFzc2VydCh0bS52YWxpZGF0ZSgpLCBgaW52YWxpZCBkYXRlOiAke3RtLnRvU3RyaW5nKCl9YCk7XG5cblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUgPyB0aW1lWm9uZSA6IHVuZGVmaW5lZCk7XG5cblx0XHRcdFx0XHQvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRtO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZpcnN0IHR3byBhcmd1bWVudHMgYXJlIGEgc3RyaW5nLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCAgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aGlyZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHQvLyBmb3JtYXQgc3RyaW5nIGdpdmVuXG5cdFx0XHRcdFx0Y29uc3QgZGF0ZVN0cmluZzogc3RyaW5nID0gYTEgYXMgc3RyaW5nO1xuXHRcdFx0XHRcdGNvbnN0IGZvcm1hdFN0cmluZzogc3RyaW5nID0gYTIgYXMgc3RyaW5nO1xuXHRcdFx0XHRcdGxldCB6b25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGEzIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcblx0XHRcdFx0XHRcdHpvbmUgPSAoYTMpIGFzIFRpbWVab25lO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcblx0XHRcdFx0XHR0aGlzLl96b25lID0gcGFyc2VkLnpvbmU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudHMgaXMgYSBzdHJpbmcgYW5kIHRoZSBzZWNvbmQgaXMgbm90LCB0aGVyZWZvcmUgdGhlIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsICB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHRjb25zdCBnaXZlblN0cmluZyA9IChhMSBhcyBzdHJpbmcpLnRyaW0oKTtcblx0XHRcdFx0XHRjb25zdCBzczogc3RyaW5nW10gPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExIGFzIHN0cmluZyArIFwiXFxcIlwiKTtcblx0XHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMikgYXMgVGltZVpvbmU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoc3NbMV0udHJpbSgpID8gVGltZVpvbmUuem9uZShzc1sxXSkgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcblx0XHRcdFx0XHQvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xuXHRcdFx0XHRpZiAoYTEgaW5zdGFuY2VvZiBUaW1lU3RydWN0KSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyBhIFRpbWVTdHJ1Y3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0aCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0JiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFwiZmlyc3QgYXJndW1lbnQgaXMgYSBEYXRlLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHR0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiAmJiAoYTIgPT09IERhdGVGdW5jdGlvbnMuR2V0IHx8IGEyID09PSBEYXRlRnVuY3Rpb25zLkdldFVUQyksXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgIHx8IGEzIGluc3RhbmNlb2YgVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGhpcmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG5cdFx0XHRcdFx0Y29uc3QgZDogRGF0ZSA9IChhMSkgYXMgRGF0ZTtcblx0XHRcdFx0XHRjb25zdCBkazogRGF0ZUZ1bmN0aW9ucyA9IChhMikgYXMgRGF0ZUZ1bmN0aW9ucztcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFzc2VydChmYWxzZSwgYERhdGVUaW1lIGNvbnN0cnVjdG9yIGV4cGVjdGVkIGEgRGF0ZSBvciBhIFRpbWVTdHJ1Y3QgYnV0IGdvdCBhICR7YTF9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gICAgICAgICAgICAgIGJyZWFrO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XG5cdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRhMiA9PT0gdW5kZWZpbmVkICYmIGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWQsIHRoZXJlZm9yZSB0aGUgcmVzdCBtdXN0IGFsc28gYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxuXHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUubG9jYWwoKTtcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xuXHRcdFx0fSAgICAgICAgICAgICAgICAgYnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl96b25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgem9uZUFiYnJldmlhdGlvbihkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykgLyA2MDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIG9mZnNldER1cmF0aW9uKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBzdGFuZGFyZCBvZmZzZXQgV0lUSE9VVCBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl96b25lLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjKHRoaXMudXRjRGF0ZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcygwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIGRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgd2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcykgYXMgV2Vla0RheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cblx0ICpcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxuXHQgKi9cblx0cHVibGljIGRheU9mWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgd2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHNlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXG5cdCAqL1xuXHRwdWJsaWMgdW5peFV0Y01pbGxpcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIHV0Y0RheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjU2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG5cdCAqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cblx0ICovXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSBhcyBXZWVrRGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cblx0ICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cblx0ICovXG5cdHB1YmxpYyB3aXRoWm9uZSh6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHR0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLFxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcblx0XHRcdHpvbmVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcblx0ICovXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHpvbmUpIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkgeyAvLyBpZi1zdGF0ZW1lbnQgc2F0aXNmaWVzIHRoZSBjb21waWxlclxuXHRcdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xuXHRcdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fem9uZURhdGUpIHtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fem9uZSA9IHVuZGVmaW5lZDtcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG5cdCAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxuXHQgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3Jcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCBvciB1bmRlZmluZWQgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcblx0ICovXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRpZiAoem9uZSkge1xuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XG5cdFx0XHRyZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHVuZGVmaW5lZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXG5cdCAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cblx0ICovXG5cdHB1YmxpYyB0b0RhdGUoKTogRGF0ZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlKFxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcblx0XHRpZiAodGltZVpvbmUgJiYgKCF0aGlzLl96b25lIHx8ICF0aW1lWm9uZS5lcXVhbHModGhpcy5fem9uZSkpKSB7XG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcblx0XHR9XG5cdFx0Y29uc3Qgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b1V0Y0V4Y2VsKCk6IG51bWJlciB7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcblx0fVxuXG5cdHByaXZhdGUgX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKG46IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXG5cdFx0Y29uc3QgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIEFkZCBhIHRpbWUgZHVyYXRpb24gcmVsYXRpdmUgdG8gVVRDLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqIEByZXR1cm4gdGhpcyArIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgdXRjSG91cigpIGZpZWxkLCBhZGRpbmcgMSBtb250aFxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxuXHQgKiBBZGRpbmcgYW4gYW1vdW50IG9mIHVuaXRzIGxlYXZlcyBsb3dlciB1bml0cyBpbnRhY3QuIEUuZy5cblx0ICogYWRkaW5nIGEgbW9udGggd2lsbCBsZWF2ZSB0aGUgZGF5KCkgZmllbGQgdW50b3VjaGVkIGlmIHBvc3NpYmxlLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKlxuXHQgKiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdXRjIHRpbWUgZmllbGRzIGFyZSBzdGlsbCB1bnRvdWNoZWQgYnV0IGxvY2FsXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cblx0ICovXG5cdHB1YmxpYyBhZGQoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBJbXBsZW1lbnRhdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xuXHRcdGxldCBhbW91bnQ6IG51bWJlcjtcblx0XHRsZXQgdTogVGltZVVuaXQ7XG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRjb25zdCBkdXJhdGlvbjogRHVyYXRpb24gPSAoYTEpIGFzIER1cmF0aW9uO1xuXHRcdFx0YW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0YW1vdW50ID0gKGExKSBhcyBudW1iZXI7XG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcblx0XHR9XG5cdFx0Y29uc3QgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSB6b25lIHRpbWUsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS4gUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKlxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxuXHQgKiBkYXRlIGJ5IG9uZS4gSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHRpbWUgZmllbGRzIG1heSBhZGRpdGlvbmFsbHlcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXG5cdCAqXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKi9cblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHRwdWJsaWMgYWRkTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xuXHRcdGxldCB1OiBUaW1lVW5pdDtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IChhMSkgYXMgRHVyYXRpb247XG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRhbW91bnQgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHUgPSB1bml0IGFzIFRpbWVVbml0O1xuXHRcdH1cblx0XHRjb25zdCBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuem9uZURhdGUsIGFtb3VudCwgdSk7XG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbSwgZGlyZWN0aW9uKTtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbSwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcblx0ICogbmVjZXNzYXJ5LlxuXHQgKi9cblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcblx0XHRsZXQgeWVhcjogbnVtYmVyO1xuXHRcdGxldCBtb250aDogbnVtYmVyO1xuXHRcdGxldCBkYXk6IG51bWJlcjtcblx0XHRsZXQgaG91cjogbnVtYmVyO1xuXHRcdGxldCBtaW51dGU6IG51bWJlcjtcblx0XHRsZXQgc2Vjb25kOiBudW1iZXI7XG5cdFx0bGV0IG1pbGxpOiBudW1iZXI7XG5cblx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA2MDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xuXHRcdFx0XHQvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcblx0XHRcdFx0XHRtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xuXHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xuXHRcdFx0XHRtb250aCA9IHRtLmNvbXBvbmVudHMubW9udGg7XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdWIoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIgJiYgYTEgaW5zdGFuY2VvZiBEdXJhdGlvbikge1xuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gKGExKSBhcyBEdXJhdGlvbjtcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0Y29uc3QgYW1vdW50OiBudW1iZXIgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCBhcyBUaW1lVW5pdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN1YkxvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBzdWJMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHR5cGVvZiBhMSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKGExIGFzIER1cmF0aW9uKS5tdWx0aXBseSgtMSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIGExIGFzIG51bWJlciwgdW5pdCBhcyBUaW1lVW5pdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRpbWUgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBEYXRlVGltZXNcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBkaWZmKG90aGVyOiBEYXRlVGltZSk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaG9wcyBvZmYgdGhlIHRpbWUgcGFydCwgeWllbGRzIHRoZSBzYW1lIGRhdGUgYXQgMDA6MDA6MDAuMDAwXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGFydE9mRGF5KCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnRPZlllYXIoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxuXHRcdFx0JiYgKCF0aGlzLl96b25lKSA9PT0gKCFvdGhlci5fem9uZSlcblx0XHRcdCYmICgoIXRoaXMuX3pvbmUgJiYgIW90aGVyLl96b25lKSB8fCAodGhpcy5fem9uZSAmJiBvdGhlci5fem9uZSAmJiB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKVxuXHRcdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuXHQgKi9cblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgbWluKG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cblx0ICovXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXG5cdCAqIHNwZWNpZmllZCBmb3JtYXQuIFRoZSBmb3JtYXQgaXMgaW1wbGVtZW50ZWQgYXMgdGhlIExETUwgc3RhbmRhcmRcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXG5cdCAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nLCBmb3JtYXRPcHRpb25zPzogZm9ybWF0LlBhcnRpYWxGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLnpvbmVEYXRlLCB0aGlzLnV0Y0RhdGUsIHRoaXMuX3pvbmUsIGZvcm1hdFN0cmluZywgZm9ybWF0T3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2Vcblx0ICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW5cblx0ICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwYXJzZShzOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XG5cdFx0Y29uc3QgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0aWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSBUaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XG5cdFx0XHRcdHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcblx0ICovXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cblx0ICovXG5cdHB1YmxpYyB0b1V0Y1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudG9TdHJpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9zcGxpdERhdGVGcm9tVGltZVpvbmUoczogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcblx0XHRjb25zdCByZXN1bHQgPSBbXCJcIiwgXCJcIl07XG5cdFx0bGV0IGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIndpdGhvdXQgRFNUXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XG5cdFx0XHRyZXN1bHRbMV0gKz0gXCIgd2l0aG91dCBEU1RcIjtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xuXHRcdGlmIChpbmRleCA8IDgpIHtcblx0XHRcdGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxuXHRcdH1cblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdFx0cmVzdWx0WzBdID0gdHJpbW1lZDtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogVGltZSBkdXJhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuXG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24geWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcbn1cblxuLyoqXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXG4gKlxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxuICovXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xuXG5cdC8qKlxuXHQgKiBHaXZlbiBhbW91bnQgaW4gY29uc3RydWN0b3Jcblx0ICovXG5cdHByaXZhdGUgX2Ftb3VudDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBVbml0XG5cdCAqL1xuXHRwcml2YXRlIF91bml0OiBUaW1lVW5pdDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgeWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuWWVhcik7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTW9udGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkRheSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuSG91cik7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWludXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uIG9mIDBcblx0ICovXG5cdGNvbnN0cnVjdG9yKCk7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gZnJvbSBhIHN0cmluZyBpbiBvbmUgb2YgdHdvIGZvcm1hdHM6XG5cdCAqIDEpIFstXWhoaGhbOm1tWzpzc1subm5uXV1dIGUuZy4gJy0wMTowMDozMC41MDEnXG5cdCAqIDIpIGFtb3VudCBhbmQgdW5pdCBlLmcuICctMSBkYXlzJyBvciAnMSB5ZWFyJy4gVGhlIHVuaXQgbWF5IGJlIGluIHNpbmd1bGFyIG9yIHBsdXJhbCBmb3JtIGFuZCBpcyBjYXNlLWluc2Vuc2l0aXZlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihpbnB1dDogc3RyaW5nKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgZHVyYXRpb24gZnJvbSBhbiBhbW91bnQgYW5kIGEgdGltZSB1bml0LlxuXHQgKiBAcGFyYW0gYW1vdW50XHROdW1iZXIgb2YgdW5pdHNcblx0ICogQHBhcmFtIHVuaXRcdEEgdGltZSB1bml0IGkuZS4gVGltZVVuaXQuU2Vjb25kLCBUaW1lVW5pdC5Ib3VyIGV0Yy4gRGVmYXVsdCBNaWxsaXNlY29uZC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGFtb3VudDogbnVtYmVyLCB1bml0PzogVGltZVVuaXQpO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxuXHQgKi9cblx0Y29uc3RydWN0b3IoaTE/OiBhbnksIHVuaXQ/OiBUaW1lVW5pdCkge1xuXHRcdGlmICh0eXBlb2YgKGkxKSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0Ly8gYW1vdW50K3VuaXQgY29uc3RydWN0b3Jcblx0XHRcdGNvbnN0IGFtb3VudCA9IGkxIGFzIG51bWJlcjtcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcblx0XHRcdHRoaXMuX3VuaXQgPSAodHlwZW9mIHVuaXQgPT09IFwibnVtYmVyXCIgPyB1bml0IDogVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdC8vIHN0cmluZyBjb25zdHJ1Y3RvclxuXHRcdFx0dGhpcy5fZnJvbVN0cmluZyhpMSBhcyBzdHJpbmcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXG5cdFx0XHR0aGlzLl9hbW91bnQgPSAwO1xuXHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIGFub3RoZXIgaW5zdGFuY2Ugb2YgRHVyYXRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQsIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxuXHQgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cblx0ICovXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcblx0XHRcdGNvbnN0IHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XG5cdFx0XHRjb25zdCByZXFNb250aHMgPSAodW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgdGhpc01zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcblx0XHRcdGNvbnN0IHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XG5cdCAqIHRoZSBzYW1lIHVuaXQuXG5cdCAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXG5cdCAqL1xuXHRwdWJsaWMgY29udmVydCh1bml0OiBUaW1lVW5pdCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSlcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICovXG5cdHB1YmxpYyBtaWxsaXNlY29uZHMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiA0MDAgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgMTUwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzZWNvbmRzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuU2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAzIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5TZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgOTAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgbWludXRlcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1pbnV0ZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMiBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTWludXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA1NDAwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGhvdXJzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuSG91cik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxuXHQgKiBkdXJpbmcgRFNUIGNoYW5nZXMpLlxuXHQgKi9cblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Ib3VyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaG91ciBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKS5cblx0ICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxuXHQgKiBub3csIHdlIGRvIG5vdCBoYXZlIGEgZGF5cygpIGZ1bmN0aW9uXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgd2hvbGVIb3VycygpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gZGF5cyFcblx0ICovXG5cdHB1YmxpYyBkYXlzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuRGF5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cblx0ICovXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5EYXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gZGF5cyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxuXHQgKi9cblx0cHVibGljIG1vbnRocygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1vbnRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIG1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuTW9udGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4geWVhcnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcblx0ICovXG5cdHB1YmxpYyB5ZWFycygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlllYXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXG5cdCAqL1xuXHRwdWJsaWMgd2hvbGVZZWFycygpOiBudW1iZXIge1xuXHRcdGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0Lk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xuXHRcdFx0XHRiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhUaW1lVW5pdC5ZZWFyKSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqL1xuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcblx0ICovXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcblx0XHRyZXR1cm4gdGhpcy5fdW5pdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaWduXG5cdCAqIEByZXR1cm4gXCItXCIgaWYgdGhlIGR1cmF0aW9uIGlzIG5lZ2F0aXZlXG5cdCAqL1xuXHRwdWJsaWMgc2lnbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXG5cdCAqL1xuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gY29udmVydGVkLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IGNvbnZlcnRlZC51bml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xuXHQgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxuXHQgKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzRXhhY3Qob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IG90aGVyLl91bml0KSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuX2Ftb3VudCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBUaW1lVW5pdC5Nb250aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbW9udGhzIGFuZCB5ZWFyc1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA8IFRpbWVVbml0LkRheSAmJiBvdGhlci51bml0KCkgPCBUaW1lVW5pdC5EYXkpIHtcblx0XHRcdHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1pbGxpc2Vjb25kcyB0aHJvdWdoIGhvdXJzXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTsgLy8gY2Fubm90IGNvbXBhcmUgZGF5cyB0byBhbnl0aGluZyBlbHNlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcblx0ICovXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyVGhhbihvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID49IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtaW4ob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxuXHQgKi9cblx0cHVibGljIG1heChvdGhlcjogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKiB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBtdWx0aXBseSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpdmlkZSBieSBhIHVuaXRsZXNzIG51bWJlci4gVGhlIHJlc3VsdCBpcyBhIER1cmF0aW9uLCBlLmcuIDEgeWVhciAvIDIgPSAwLjUgeWVhclxuXHQgKiBUaGUgcmVzdWx0IGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gYXMgYSB1bml0IHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhIG51bWJlciAoZS5nLiAxIG1vbnRoIGhhcyB2YXJpYWJsZSBsZW5ndGgpXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBkaXZpZGUodmFsdWU6IG51bWJlcik6IER1cmF0aW9uO1xuXHQvKipcblx0ICogRGl2aWRlIHRoaXMgRHVyYXRpb24gYnkgYSBEdXJhdGlvbi4gVGhlIHJlc3VsdCBpcyBhIHVuaXRsZXNzIG51bWJlciBlLmcuIDEgeWVhciAvIDEgbW9udGggPSAxMlxuXHQgKiBUaGUgcmVzdWx0IGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gYXMgYSB1bml0IHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhIG51bWJlciAoZS5nLiAxIG1vbnRoIGhhcyB2YXJpYWJsZSBsZW5ndGgpXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLyB2YWx1ZSlcblx0ICovXG5cdHB1YmxpYyBkaXZpZGUodmFsdWU6IER1cmF0aW9uKTogbnVtYmVyO1xuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBudW1iZXIgfCBEdXJhdGlvbik6IER1cmF0aW9uIHwgbnVtYmVyIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLyB2YWx1ZSwgdGhpcy5fdW5pdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh2YWx1ZS5fYW1vdW50ID09PSAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVybyBkdXJhdGlvblwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIGR1cmF0aW9uLlxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGFkZCh2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKyB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogU3VidHJhY3QgYSBkdXJhdGlvbi5cblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAtIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBzdWIodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxuXHQgKi9cblx0cHVibGljIGFicygpOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmVcblx0ICogYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxuXHQgKi9cblx0cHVibGljIHRvRnVsbFN0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tWzpzc1subm5uXV0gbm90YXRpb24uXG5cdCAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xuXHQgKiAgICAgICAgICAgICBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xuXHQgKi9cblx0cHVibGljIHRvSG1zU3RyaW5nKGZ1bGw6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcblx0XHRpZiAoZnVsbCB8fCB0aGlzLm1pbGxpc2Vjb25kKCkgPiAwKSB7XG5cdFx0XHRyZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG5cdFx0fVxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XG5cdFx0XHRyZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuXHRcdH1cblx0XHRpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLm1pbnV0ZSgpID4gMCkge1xuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuc2lnbigpICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMud2hvbGVIb3VycygpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgKHRoaXMuX2Ftb3VudCAvIDEwMDApLnRvRml4ZWQoMykgKyBcIlNcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIlNcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XG5cdFx0XHRcdHJldHVybiBcIlBUXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7IC8vIG5vdGUgdGhlIFwiVFwiIHRvIGRpc2FtYmlndWF0ZSB0aGUgXCJNXCJcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJIXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJEXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiV1wiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiWVwiO1xuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiIFwiICsgYmFzaWNzLnRpbWVVbml0VG9TdHJpbmcodGhpcy5fdW5pdCwgdGhpcy5fYW1vdW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXG5cdCAqL1xuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIltEdXJhdGlvbjogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXG5cdCAqL1xuXHRwcml2YXRlIF9wYXJ0KHVuaXQ6IFRpbWVVbml0KTogbnVtYmVyIHtcblx0XHRsZXQgbmV4dFVuaXQ6IFRpbWVVbml0O1xuXHRcdC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxuXHRcdHN3aXRjaCAodW5pdCkge1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogbmV4dFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuTWludXRlOyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiBuZXh0VW5pdCA9IFRpbWVVbml0LkhvdXI7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiBuZXh0VW5pdCA9IFRpbWVVbml0LkRheTsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Nb250aDsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiBuZXh0VW5pdCA9IFRpbWVVbml0LlllYXI7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhUaW1lVW5pdC5ZZWFyKSkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XG5cdH1cblxuXG5cdHByaXZhdGUgX2Zyb21TdHJpbmcoczogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xuXHRcdGlmICh0cmltbWVkLm1hdGNoKC9eLT9cXGRcXGQ/KDpcXGRcXGQ/KDpcXGRcXGQ/KC5cXGRcXGQ/XFxkPyk/KT8pPyQvKSkge1xuXHRcdFx0bGV0IHNpZ246IG51bWJlciA9IDE7XG5cdFx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcblx0XHRcdGxldCBzZWNvbmRzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IG1pbGxpc2Vjb25kczogbnVtYmVyID0gMDtcblx0XHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xuXHRcdFx0YXNzZXJ0KHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJOb3QgYSBwcm9wZXIgdGltZSBkdXJhdGlvbiBzdHJpbmc6IFxcXCJcIiArIHRyaW1tZWQgKyBcIlxcXCJcIik7XG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XG5cdFx0XHRcdHNpZ24gPSAtMTtcblx0XHRcdFx0cGFydHNbMF0gPSBwYXJ0c1swXS5zdWJzdHIoMSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRob3VycyA9ICtwYXJ0c1swXTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdG1pbnV0ZXMgPSArcGFydHNbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMikge1xuXHRcdFx0XHRjb25zdCBzZWNvbmRQYXJ0cyA9IHBhcnRzWzJdLnNwbGl0KFwiLlwiKTtcblx0XHRcdFx0c2Vjb25kcyA9ICtzZWNvbmRQYXJ0c1swXTtcblx0XHRcdFx0aWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRtaWxsaXNlY29uZHMgPSArc3RyaW5ncy5wYWRSaWdodChzZWNvbmRQYXJ0c1sxXSwgMywgXCIwXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBhbW91bnRNc2VjID0gc2lnbiAqIE1hdGgucm91bmQobWlsbGlzZWNvbmRzICsgMTAwMCAqIHNlY29uZHMgKyA2MDAwMCAqIG1pbnV0ZXMgKyAzNjAwMDAwICogaG91cnMpO1xuXHRcdFx0Ly8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxuXHRcdFx0aWYgKG1pbGxpc2Vjb25kcyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG5cdFx0XHR9IGVsc2UgaWYgKHNlY29uZHMgIT09IDApIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LlNlY29uZDtcblx0XHRcdH0gZWxzZSBpZiAobWludXRlcyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdFx0fSBlbHNlIGlmIChob3VycyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuSG91cjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc3BsaXQgPSB0cmltbWVkLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcblx0XHRcdGFzc2VydCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XG5cdFx0XHRhc3NlcnQoaXNGaW5pdGUoYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGFtb3VudCBpcyBpbmZpbml0ZVwiKTtcblx0XHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcblx0XHRcdHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XG5cdFx0fVxuXHR9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHsgVGltZVN0cnVjdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5pbXBvcnQgeyBUb2tlbiwgdG9rZW5pemUsIFRva2VuVHlwZSB9IGZyb20gXCIuL3Rva2VuXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRPcHRpb25zIHtcblx0LyoqXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcblx0ICovXG5cdHF1YXJ0ZXJMZXR0ZXI6IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSB3b3JkIGZvciAncXVhcnRlcidcblx0ICovXG5cdHF1YXJ0ZXJXb3JkOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBRdWFydGVyIGFiYnJldmlhdGlvbnMgZS5nLiAxc3QsIDJuZCwgM3JkLCA0dGhcblx0ICovXG5cdHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogTW9udGggbmFtZXNcblx0ICovXG5cdGxvbmdNb250aE5hbWVzOiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFRocmVlLWxldHRlciBtb250aCBuYW1lc1xuXHQgKi9cblx0c2hvcnRNb250aE5hbWVzOiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIE1vbnRoIGxldHRlcnNcblx0ICovXG5cdG1vbnRoTGV0dGVyczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxuXHQgKi9cblx0bG9uZ1dlZWtkYXlOYW1lczogc3RyaW5nW107XG5cdHNob3J0V2Vla2RheU5hbWVzOiBzdHJpbmdbXTtcblx0d2Vla2RheVR3b0xldHRlcnM6IHN0cmluZ1tdO1xuXHR3ZWVrZGF5TGV0dGVyczogc3RyaW5nW107XG59XG5cbi8vIHRvZG8gdGhpcyBjYW4gYmUgUGFydGlhbDxGb3JtYXRPcHRpb25zPiBidXQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aFxuLy8gcHJlLTIuMSB0eXBlc2NyaXB0IHVzZXJzIHdlIHdyaXRlIHRoaXMgb3V0IG91cnNlbHZlcyBmb3IgYSB3aGlsZSB5ZXRcbmV4cG9ydCBpbnRlcmZhY2UgUGFydGlhbEZvcm1hdE9wdGlvbnMge1xuXHQvKipcblx0ICogVGhlIGxldHRlciBpbmRpY2F0aW5nIGEgcXVhcnRlciBlLmcuIFwiUVwiIChiZWNvbWVzIFExLCBRMiwgUTMsIFE0KVxuXHQgKi9cblx0cXVhcnRlckxldHRlcj86IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSB3b3JkIGZvciAncXVhcnRlcidcblx0ICovXG5cdHF1YXJ0ZXJXb3JkPzogc3RyaW5nO1xuXHQvKipcblx0ICogUXVhcnRlciBhYmJyZXZpYXRpb25zIGUuZy4gMXN0LCAybmQsIDNyZCwgNHRoXG5cdCAqL1xuXHRxdWFydGVyQWJicmV2aWF0aW9ucz86IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBNb250aCBuYW1lc1xuXHQgKi9cblx0bG9uZ01vbnRoTmFtZXM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFRocmVlLWxldHRlciBtb250aCBuYW1lc1xuXHQgKi9cblx0c2hvcnRNb250aE5hbWVzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBNb250aCBsZXR0ZXJzXG5cdCAqL1xuXHRtb250aExldHRlcnM/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2VlayBkYXkgbmFtZXMsIHN0YXJ0aW5nIHdpdGggc3VuZGF5XG5cdCAqL1xuXHRsb25nV2Vla2RheU5hbWVzPzogc3RyaW5nW107XG5cdHNob3J0V2Vla2RheU5hbWVzPzogc3RyaW5nW107XG5cdHdlZWtkYXlUd29MZXR0ZXJzPzogc3RyaW5nW107XG5cdHdlZWtkYXlMZXR0ZXJzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjb25zdCBMT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xuXG5leHBvcnQgY29uc3QgU0hPUlRfTU9OVEhfTkFNRVM6IHN0cmluZ1tdID1cblx0W1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xuXG5leHBvcnQgY29uc3QgTU9OVEhfTEVUVEVSUzogc3RyaW5nW10gPVxuXHRbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XG5cbmV4cG9ydCBjb25zdCBMT05HX1dFRUtEQVlfTkFNRVM6IHN0cmluZ1tdID1cblx0W1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XG5cbmV4cG9ydCBjb25zdCBTSE9SVF9XRUVLREFZX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcblxuZXhwb3J0IGNvbnN0IFdFRUtEQVlfVFdPX0xFVFRFUlM6IHN0cmluZ1tdID1cblx0W1wiU3VcIiwgXCJNb1wiLCBcIlR1XCIsIFwiV2VcIiwgXCJUaFwiLCBcIkZyXCIsIFwiU2FcIl07XG5cbmV4cG9ydCBjb25zdCBXRUVLREFZX0xFVFRFUlM6IHN0cmluZ1tdID1cblx0W1wiU1wiLCBcIk1cIiwgXCJUXCIsIFwiV1wiLCBcIlRcIiwgXCJGXCIsIFwiU1wiXTtcblxuZXhwb3J0IGNvbnN0IFFVQVJURVJfTEVUVEVSOiBzdHJpbmcgPSBcIlFcIjtcbmV4cG9ydCBjb25zdCBRVUFSVEVSX1dPUkQ6IHN0cmluZyA9IFwicXVhcnRlclwiO1xuZXhwb3J0IGNvbnN0IFFVQVJURVJfQUJCUkVWSUFUSU9OUzogc3RyaW5nW10gPSBbXCIxc3RcIiwgXCIybmRcIiwgXCIzcmRcIiwgXCI0dGhcIl07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZPUk1BVF9PUFRJT05TOiBGb3JtYXRPcHRpb25zID0ge1xuXHRxdWFydGVyTGV0dGVyOiBRVUFSVEVSX0xFVFRFUixcblx0cXVhcnRlcldvcmQ6IFFVQVJURVJfV09SRCxcblx0cXVhcnRlckFiYnJldmlhdGlvbnM6IFFVQVJURVJfQUJCUkVWSUFUSU9OUyxcblx0bG9uZ01vbnRoTmFtZXM6IExPTkdfTU9OVEhfTkFNRVMsXG5cdHNob3J0TW9udGhOYW1lczogU0hPUlRfTU9OVEhfTkFNRVMsXG5cdG1vbnRoTGV0dGVyczogTU9OVEhfTEVUVEVSUyxcblx0bG9uZ1dlZWtkYXlOYW1lczogTE9OR19XRUVLREFZX05BTUVTLFxuXHRzaG9ydFdlZWtkYXlOYW1lczogU0hPUlRfV0VFS0RBWV9OQU1FUyxcblx0d2Vla2RheVR3b0xldHRlcnM6IFdFRUtEQVlfVFdPX0xFVFRFUlMsXG5cdHdlZWtkYXlMZXR0ZXJzOiBXRUVLREFZX0xFVFRFUlNcbn07XG5cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIHdpdGggdGhlIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXG4gKiBAcGFyYW0gbG9jYWxab25lIFRoZSB6b25lIHRoYXQgY3VycmVudFRpbWUgaXMgaW5cbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQoXG5cdGRhdGVUaW1lOiBUaW1lU3RydWN0LFxuXHR1dGNUaW1lOiBUaW1lU3RydWN0LFxuXHRsb2NhbFpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkIHwgbnVsbCxcblx0Zm9ybWF0U3RyaW5nOiBzdHJpbmcsXG5cdGZvcm1hdE9wdGlvbnM6IFBhcnRpYWxGb3JtYXRPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG5cdGNvbnN0IG1lcmdlZEZvcm1hdE9wdGlvbnM6IFBhcnRpYWxGb3JtYXRPcHRpb25zID0ge307XG5cdGZvciAoY29uc3QgbmFtZSBpbiBERUZBVUxUX0ZPUk1BVF9PUFRJT05TKSB7XG5cdFx0aWYgKERFRkFVTFRfRk9STUFUX09QVElPTlMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblx0XHRcdG1lcmdlZEZvcm1hdE9wdGlvbnNbbmFtZV0gPSAoZm9ybWF0T3B0aW9uc1tuYW1lXSAhPT0gdW5kZWZpbmVkID8gZm9ybWF0T3B0aW9uc1tuYW1lXSA6IERFRkFVTFRfRk9STUFUX09QVElPTlNbbmFtZV0pO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplKGZvcm1hdFN0cmluZyk7XG5cdGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XG5cdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG5cdFx0bGV0IHRva2VuUmVzdWx0OiBzdHJpbmc7XG5cdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5FUkE6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkRm9ybWF0T3B0aW9ucyBhcyBGb3JtYXRPcHRpb25zKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NT05USDpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRGb3JtYXRPcHRpb25zIGFzIEZvcm1hdE9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFS0RBWTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZEZvcm1hdE9wdGlvbnMgYXMgRm9ybWF0T3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkhPVVI6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlNFQ09ORDpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuWk9ORTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lID8gbG9jYWxab25lIDogdW5kZWZpbmVkLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFSzpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmVzdWx0ICs9IHRva2VuUmVzdWx0O1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGNvbnN0IEFEOiBib29sZWFuID0gZGF0ZVRpbWUueWVhciA+IDA7XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRjYXNlIDM6XG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBRFwiIDogXCJCQ1wiKTtcblx0XHRjYXNlIDQ6XG5cdFx0XHRyZXR1cm4gKEFEID8gXCJBbm5vIERvbWluaVwiIDogXCJCZWZvcmUgQ2hyaXN0XCIpO1xuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiAoQUQgPyBcIkFcIiA6IFwiQlwiKTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHllYXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwieVwiOlxuXHRcdGNhc2UgXCJZXCI6XG5cdFx0Y2FzZSBcInJcIjpcblx0XHRcdGxldCB5ZWFyVmFsdWUgPSBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUueWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPT09IDIpIHsgLy8gU3BlY2lhbCBjYXNlOiBleGFjdGx5IHR3byBjaGFyYWN0ZXJzIGFyZSBleHBlY3RlZFxuXHRcdFx0XHR5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHllYXJWYWx1ZTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zKTogc3RyaW5nIHtcblx0Y29uc3QgcXVhcnRlciA9IE1hdGguY2VpbChkYXRlVGltZS5tb250aCAvIDMpO1xuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xuXHRcdGNhc2UgNDpcblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zLnF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgZm9ybWF0T3B0aW9ucy5xdWFydGVyV29yZDtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgbW9udGhcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGlmICh0b2tlbi5zeW1ib2wgPT09IFwid1wiKSB7XG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrT2ZNb250aChkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJkXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRjYXNlIFwiRFwiOlxuXHRcdFx0Y29uc3QgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xuXHRjb25zdCB3ZWVrRGF5TnVtYmVyID0gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpO1xuXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMjpcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XG5cdFx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG5cdFx0XHR9XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnMubG9uZ1dlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5TGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcblx0XHRjYXNlIDY6XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9ucy53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QpOiBzdHJpbmcge1xuXHRyZXR1cm4gKGRhdGVUaW1lLmhvdXIgPCAxMiA/IFwiQU1cIiA6IFwiUE1cIik7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBIb3VyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdEhvdXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGxldCBob3VyID0gZGF0ZVRpbWUuaG91cjtcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwiaFwiOlxuXHRcdFx0aG91ciA9IGhvdXIgJSAxMjtcblx0XHRcdGlmIChob3VyID09PSAwKSB7XG5cdFx0XHRcdGhvdXIgPSAxMjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRjYXNlIFwiSFwiOlxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdGNhc2UgXCJLXCI6XG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdGNhc2UgXCJrXCI6XG5cdFx0XHRpZiAoaG91ciA9PT0gMCkge1xuXHRcdFx0XHRob3VyID0gMjQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBtaW51dGVcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHNlY29uZHMgKG9yIGZyYWN0aW9uIG9mIGEgc2Vjb25kKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcInNcIjpcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuc2Vjb25kLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdGNhc2UgXCJTXCI6XG5cdFx0XHRjb25zdCBmcmFjdGlvbiA9IGRhdGVUaW1lLm1pbGxpO1xuXHRcdFx0bGV0IGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcblx0XHRcdGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0XHRyZXR1cm4gZnJhY3Rpb25TdHJpbmcuc2xpY2UoMCwgdG9rZW4ubGVuZ3RoKTtcblx0XHRjYXNlIFwiQVwiOlxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWU6IFRpbWVTdHJ1Y3QsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkLCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRpZiAoIXpvbmUpIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXHRjb25zdCBvZmZzZXQgPSBNYXRoLnJvdW5kKChjdXJyZW50VGltZS51bml4TWlsbGlzIC0gdXRjVGltZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcblxuXHRjb25zdCBvZmZzZXRIb3VyczogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xuXHRsZXQgb2Zmc2V0SG91cnNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0SG91cnMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuXHRvZmZzZXRIb3Vyc1N0cmluZyA9IChvZmZzZXQgPj0gMCA/IFwiK1wiICsgb2Zmc2V0SG91cnNTdHJpbmcgOiBcIi1cIiArIG9mZnNldEhvdXJzU3RyaW5nKTtcblx0Y29uc3Qgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcblx0Y29uc3Qgb2Zmc2V0TWludXRlc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRNaW51dGVzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcblx0bGV0IHJlc3VsdDogc3RyaW5nO1xuXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcIk9cIjpcblx0XHRcdHJlc3VsdCA9IFwiVVRDXCI7XG5cdFx0XHRpZiAob2Zmc2V0ID49IDApIHtcblx0XHRcdFx0cmVzdWx0ICs9IFwiK1wiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ICs9IFwiLVwiO1xuXHRcdFx0fVxuXHRcdFx0cmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID49IDQgfHwgb2Zmc2V0TWludXRlcyAhPT0gMCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA+IDQpIHtcblx0XHRcdFx0cmVzdWx0ICs9IHRva2VuLnJhdy5zbGljZSg0KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0Y2FzZSBcIlpcIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcblx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdGNvbnN0IG5ld1Rva2VuOiBUb2tlbiA9IHtcblx0XHRcdFx0XHRcdGxlbmd0aDogNCxcblx0XHRcdFx0XHRcdHJhdzogXCJPT09PXCIsXG5cdFx0XHRcdFx0XHRzeW1ib2w6IFwiT1wiLFxuXHRcdFx0XHRcdFx0dHlwZTogVG9rZW5UeXBlLlpPTkVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJldHVybiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgbmV3VG9rZW4pO1xuXHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHRcdFx0fVxuXHRcdGNhc2UgXCJ6XCI6XG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgdHJ1ZSk7XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRyZXR1cm4gem9uZS50b1N0cmluZygpO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHRcdFx0fVxuXHRcdGNhc2UgXCJ2XCI6XG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHRjYXNlIFwiVlwiOlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdC8vIE5vdCBpbXBsZW1lbnRlZFxuXHRcdFx0XHRcdHJldHVybiBcInVua1wiO1xuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUubmFtZSgpO1xuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRyZXR1cm4gXCJVbmtub3duXCI7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcIlhcIjpcblx0XHRjYXNlIFwieFwiOlxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgb2Zmc2V0ID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBcIlpcIjtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRyZXN1bHQgPSBvZmZzZXRIb3Vyc1N0cmluZztcblx0XHRcdFx0XHRpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0Y2FzZSA0OiAvLyBObyBzZWNvbmRzIGluIG91ciBpbXBsZW1lbnRhdGlvbiwgc28gdGhpcyBpcyB0aGUgc2FtZVxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0Y2FzZSA1OiAvLyBObyBzZWNvbmRzIGluIG91ciBpbXBsZW1lbnRhdGlvbiwgc28gdGhpcyBpcyB0aGUgc2FtZVxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0XHRcdH1cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSBcIi4vZGF0ZXRpbWVcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRGF0ZVRpbWUsIGQyOiBEYXRlVGltZSk6IERhdGVUaW1lO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEdXJhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRHVyYXRpb24sIGQyOiBEdXJhdGlvbik6IER1cmF0aW9uO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IGFueSwgZDI6IGFueSk6IGFueSB7XG5cdGFzc2VydChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0YXNzZXJ0KGQyLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRhc3NlcnQoXG5cdFx0KGQxIGluc3RhbmNlb2YgRGF0ZVRpbWUgJiYgZDIgaW5zdGFuY2VvZiBEYXRlVGltZSkgfHwgKGQxIGluc3RhbmNlb2YgRHVyYXRpb24gJiYgZDIgaW5zdGFuY2VvZiBEdXJhdGlvbiksXG5cdFx0XCJFaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zIGV4cGVjdGVkXCJcblx0KTtcblx0cmV0dXJuIGQxLm1pbihkMik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IERhdGVUaW1lLCBkMjogRGF0ZVRpbWUpOiBEYXRlVGltZTtcbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBhbnksIGQyOiBhbnkpOiBhbnkge1xuXHRhc3NlcnQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdGFzc2VydChkMiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0YXNzZXJ0KFxuXHRcdChkMSBpbnN0YW5jZW9mIERhdGVUaW1lICYmIGQyIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHx8IChkMSBpbnN0YW5jZW9mIER1cmF0aW9uICYmIGQyIGluc3RhbmNlb2YgRHVyYXRpb24pLFxuXHRcdFwiRWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9ucyBleHBlY3RlZFwiXG5cdCk7XG5cdHJldHVybiBkMS5tYXgoZDIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFicyhkOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0YXNzZXJ0KGQsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdGFzc2VydChkIGluc3RhbmNlb2YgRHVyYXRpb24sIFwiZmlyc3QgYXJndW1lbnQgaXMgbm90IGEgRHVyYXRpb25cIik7XG5cdHJldHVybiBkLmFicygpO1xufVxuXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVGdW5jdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0LFxyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0VVRDXHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNJbnQobjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0aWYgKG4gPT09IG51bGwgfHwgIWlzRmluaXRlKG4pKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiAoTWF0aC5mbG9vcihuKSA9PT0gbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRTeW0objogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRpZiAobiA8IDApIHtcclxuXHRcdHJldHVybiAtMSAqIE1hdGgucm91bmQoLTEgKiBuKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobik7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXHJcbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdGlmICgvXihcXC18XFwrKT8oWzAtOV0rKFxcLlswLTldKyk/fEluZmluaXR5KSQvLnRlc3QodmFsdWUpKSB7XHJcblx0XHRyZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuXHR9XHJcblx0cmV0dXJuIE5hTjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aXZlTW9kdWxvKHZhbHVlOiBudW1iZXIsIG1vZHVsbzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRhc3NlcnQobW9kdWxvID49IDEsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xyXG5cdGlmICh2YWx1ZSA8IDApIHtcclxuXHRcdHJldHVybiAoKHZhbHVlICUgbW9kdWxvKSArIG1vZHVsbykgJSBtb2R1bG87XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB2YWx1ZSAlIG1vZHVsbztcclxuXHR9XHJcbn1cclxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXG4gKi9cblxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IFRpbWVab25lIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcbmltcG9ydCB7IFRva2VuLCB0b2tlbml6ZSwgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcblxuLyoqXG4gKiBUaW1lU3RydWN0IHBsdXMgem9uZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF3YXJlVGltZVN0cnVjdCB7XG5cdC8qKlxuXHQgKiBUaGUgdGltZSBzdHJ1Y3Rcblx0ICovXG5cdHRpbWU6IFRpbWVTdHJ1Y3Q7XG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIChjYW4gYmUgdW5kZWZpbmVkKVxuXHQgKi9cblx0em9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XG59XG5cbmludGVyZmFjZSBQYXJzZU51bWJlclJlc3VsdCB7XG5cdG46IG51bWJlcjtcblx0cmVtYWluaW5nOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQYXJzZVpvbmVSZXN1bHQge1xuXHR6b25lPzogVGltZVpvbmU7XG5cdHJlbWFpbmluZzogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gZGF0ZXRpbWUgc3RyaW5nIGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0XG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIExETUwgZm9ybWF0IHN0cmluZ1xuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZzogc3RyaW5nLCBmb3JtYXRTdHJpbmc6IHN0cmluZywgYWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuIHtcblx0dHJ5IHtcblx0XHRwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCB1bmRlZmluZWQsIGFsbG93VHJhaWxpbmcpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIGFzc3VtaW5nIHRoZSBnaXZlbiBmb3JtYXQuXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShcblx0ZGF0ZVRpbWVTdHJpbmc6IHN0cmluZywgZm9ybWF0U3RyaW5nOiBzdHJpbmcsIG92ZXJyaWRlWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCwgYWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWVcbik6IEF3YXJlVGltZVN0cnVjdCB7XG5cdGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xuXHR9XG5cdGlmICghZm9ybWF0U3RyaW5nKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZm9ybWF0IGdpdmVuXCIpO1xuXHR9XG5cdHRyeSB7XG5cdFx0Y29uc3QgdG9rZW5zOiBUb2tlbltdID0gdG9rZW5pemUoZm9ybWF0U3RyaW5nKTtcblx0XHRjb25zdCB0aW1lOiBUaW1lQ29tcG9uZW50T3B0cyA9IHsgeWVhcjogLTEgfTtcblx0XHRsZXQgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHBucjogUGFyc2VOdW1iZXJSZXN1bHQ7XG5cdFx0bGV0IHB6cjogUGFyc2Vab25lUmVzdWx0O1xuXHRcdGxldCByZW1haW5pbmc6IHN0cmluZyA9IGRhdGVUaW1lU3RyaW5nO1xuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG5cdFx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVlQRVJJT0Q6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRicmVhazsgLy8gbm90aGluZyB0byBsZWFybiBmcm9tIHRoaXNcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWUVBUjpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS55ZWFyID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHR0aW1lLm1vbnRoID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5kYXkgPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5taW51dGUgPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOlxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHRpZiAodG9rZW4ucmF3LmNoYXJBdCgwKSA9PT0gXCJzXCIpIHtcblx0XHRcdFx0XHRcdHRpbWUuc2Vjb25kID0gcG5yLm47XG5cdFx0XHRcdFx0fSBlbHNlIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovIGlmICh0b2tlbi5yYXcuY2hhckF0KDApID09PSBcIlNcIikge1xuXHRcdFx0XHRcdFx0dGltZS5taWxsaSA9IHBuci5uO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJyR7dG9rZW4ucmF3fSdgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlpPTkU6XG5cdFx0XHRcdFx0cHpyID0gc3RyaXBab25lKHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOlxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHN0cmlwUmF3KHJlbWFpbmluZywgdG9rZW4ucmF3KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgcmVzdWx0OiBBd2FyZVRpbWVTdHJ1Y3QgPSB7IHRpbWU6IG5ldyBUaW1lU3RydWN0KHRpbWUpLCB6b25lIH07XG5cdFx0aWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgcmVzdWx0aW5nIGRhdGVgKTtcblx0XHR9XG5cdFx0Ly8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxuXHRcdGlmIChvdmVycmlkZVpvbmUpIHtcblx0XHRcdHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xuXHRcdH1cblx0XHRpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ3JlbWFpbmluZydgXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogJHtlLm1lc3NhZ2V9YCk7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBzdHJpcE51bWJlcihzOiBzdHJpbmcpOiBQYXJzZU51bWJlclJlc3VsdCB7XG5cdGNvbnN0IHJlc3VsdDogUGFyc2VOdW1iZXJSZXN1bHQgPSB7XG5cdFx0bjogTmFOLFxuXHRcdHJlbWFpbmluZzogc1xuXHR9O1xuXHRsZXQgbnVtYmVyU3RyaW5nID0gXCJcIjtcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcblx0XHRudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xuXHR9XG5cdC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xuXHR3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcblx0XHRudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xuXHR9XG5cdHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XG5cdGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIWlzRmluaXRlKHJlc3VsdC5uKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnJHtudW1iZXJTdHJpbmd9J2ApO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xuXG5mdW5jdGlvbiBzdHJpcFpvbmUoczogc3RyaW5nKTogUGFyc2Vab25lUmVzdWx0IHtcblx0aWYgKHMubGVuZ3RoID09PSAwKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcblx0fVxuXHRjb25zdCByZXN1bHQ6IFBhcnNlWm9uZVJlc3VsdCA9IHtcblx0XHRyZW1haW5pbmc6IHNcblx0fTtcblx0bGV0IHpvbmVTdHJpbmcgPSBcIlwiO1xuXHR3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XG5cdFx0em9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0aWYgKHpvbmVTdHJpbmcudHJpbSgpKSB7XG5cdFx0cmVzdWx0LnpvbmUgPSBUaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHN0cmlwUmF3KHM6IHN0cmluZywgZXhwZWN0ZWQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCByZW1haW5pbmcgPSBzO1xuXHRsZXQgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xuXHR3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcblx0XHRlcmVtYWluaW5nID0gZXJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgJyR7ZXhwZWN0ZWR9J2ApO1xuXHR9XG5cdHJldHVybiByZW1haW5pbmc7XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5cbi8qKlxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGVudW0gUGVyaW9kRHN0IHtcblx0LyoqXG5cdCAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcblx0ICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cblx0ICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcblx0ICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cblx0ICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxuXHQgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXG5cdCAqL1xuXHRSZWd1bGFySW50ZXJ2YWxzLFxuXG5cdC8qKlxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcblx0ICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxuXHQgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxuXHQgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcblx0ICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcblx0ICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxuXHQgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxuXHQgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxuXHQgKi9cblx0UmVndWxhckxvY2FsVGltZSxcblxuXHQvKipcblx0ICogRW5kLW9mLWVudW0gbWFya2VyXG5cdCAqL1xuXHRNQVhcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocDogUGVyaW9kRHN0KTogc3RyaW5nIHtcblx0c3dpdGNoIChwKSB7XG5cdFx0Y2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxuICovXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcblxuXHQvKipcblx0ICogUmVmZXJlbmNlIG1vbWVudCBvZiBwZXJpb2Rcblx0ICovXG5cdHByaXZhdGUgX3JlZmVyZW5jZTogRGF0ZVRpbWU7XG5cblx0LyoqXG5cdCAqIEludGVydmFsXG5cdCAqL1xuXHRwcml2YXRlIF9pbnRlcnZhbDogRHVyYXRpb247XG5cblx0LyoqXG5cdCAqIERTVCBoYW5kbGluZ1xuXHQgKi9cblx0cHJpdmF0ZSBfZHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZWQgcmVmZXJlbmNlIGRhdGUsIGhhcyBkYXktb2YtbW9udGggPD0gMjggZm9yIE1vbnRobHlcblx0ICogcGVyaW9kLCBvciBmb3IgWWVhcmx5IHBlcmlvZCBpZiBtb250aCBpcyBGZWJydWFyeVxuXHQgKi9cblx0cHJpdmF0ZSBfaW50UmVmZXJlbmNlOiBEYXRlVGltZTtcblxuXHQvKipcblx0ICogTm9ybWFsaXplZCBpbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50SW50ZXJ2YWw6IER1cmF0aW9uO1xuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVkIGludGVybmFsIERTVCBoYW5kbGluZy4gSWYgRFNUIGhhbmRsaW5nIGlzIGlycmVsZXZhbnRcblx0ICogKGJlY2F1c2UgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgZG9lcyBub3QgaGF2ZSBEU1QpXG5cdCAqIHRoZW4gaXQgaXMgc2V0IHRvIFJlZ3VsYXJJbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50RHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIExJTUlUQVRJT046IGlmIGRzdCBlcXVhbHMgUmVndWxhckxvY2FsVGltZSwgYW5kIHVuaXQgaXMgU2Vjb25kLCBNaW51dGUgb3IgSG91cixcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxuXHQgKiBUaGlzIGlzIGR1ZSB0byB0aGUgZW5vcm1vdXMgcHJvY2Vzc2luZyBwb3dlciByZXF1aXJlZCBieSB0aGVzZSBjYXNlcy4gVGhleSBhcmUgbm90XG5cdCAqIGltcGxlbWVudGVkIGFuZCB5b3Ugd2lsbCBnZXQgYW4gYXNzZXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVmZXJlbmNlIFRoZSByZWZlcmVuY2UgZGF0ZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBpbnRlcnZhbCBUaGUgaW50ZXJ2YWwgb2YgdGhlIHBlcmlvZFxuXHQgKiBAcGFyYW0gZHN0IFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcblx0ICogICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXG5cdCAqICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0aW50ZXJ2YWw6IER1cmF0aW9uLFxuXHRcdGRzdD86IFBlcmlvZERzdFxuXHQpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3Rcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiB1bml0cy5cblx0ICogQHBhcmFtIHVuaXQgVGhlIHVuaXQuXG5cdCAqIEBwYXJhbSBkc3QgU3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxuXHQgKiAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0YW1vdW50OiBudW1iZXIsXG5cdFx0dW5pdDogVGltZVVuaXQsXG5cdFx0ZHN0PzogUGVyaW9kRHN0XG5cdCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxuXHRcdGFtb3VudE9ySW50ZXJ2YWw6IGFueSxcblx0XHR1bml0T3JEc3Q/OiBhbnksXG5cdFx0Z2l2ZW5Ec3Q/OiBQZXJpb2REc3Rcblx0KSB7XG5cblx0XHRsZXQgaW50ZXJ2YWw6IER1cmF0aW9uO1xuXHRcdGxldCBkc3Q6IFBlcmlvZERzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xuXHRcdGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWwgYXMgRHVyYXRpb247XG5cdFx0XHRkc3QgPSB1bml0T3JEc3QgYXMgUGVyaW9kRHN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIHVuaXRPckRzdCA9PT0gXCJudW1iZXJcIiAmJiB1bml0T3JEc3QgPj0gMCAmJiB1bml0T3JEc3QgPCBUaW1lVW5pdC5NQVgsIFwiSW52YWxpZCB1bml0XCIpO1xuXHRcdFx0aW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCBhcyBudW1iZXIsIHVuaXRPckRzdCBhcyBUaW1lVW5pdCk7XG5cdFx0XHRkc3QgPSBnaXZlbkRzdCBhcyBQZXJpb2REc3Q7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XG5cdFx0XHRkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcblx0XHR9XG5cdFx0YXNzZXJ0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcblx0XHRhc3NlcnQoISFyZWZlcmVuY2UsIFwiUmVmZXJlbmNlIHRpbWUgbm90IGdpdmVuXCIpO1xuXHRcdGFzc2VydChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XG5cblx0XHR0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG5cdFx0dGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XG5cdFx0dGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XG5cblx0XHQvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcblx0XHQvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXG5cdFx0Ly8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFBlcmlvZCB7XG5cdFx0cmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgcmVmZXJlbmNlIGRhdGVcblx0ICovXG5cdHB1YmxpYyByZWZlcmVuY2UoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG5cdH1cblxuXHQvKipcblx0ICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0KCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGludGVydmFsKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHVuaXRzIG9mIHRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcblx0ICovXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxuXHQgKi9cblx0cHVibGljIGRzdCgpOiBQZXJpb2REc3Qge1xuXHRcdHJldHVybiB0aGlzLl9kc3Q7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3Rcblx0ICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuXHQgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxuXHQgKi9cblx0cHVibGljIGZpbmRGaXJzdChmcm9tRGF0ZTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRsZXQgYXBwcm94OiBEYXRlVGltZTtcblx0XHRsZXQgYXBwcm94MjogRGF0ZVRpbWU7XG5cdFx0bGV0IGFwcHJveE1pbjogRGF0ZVRpbWU7XG5cdFx0bGV0IHBlcmlvZHM6IG51bWJlcjtcblx0XHRsZXQgZGlmZjogbnVtYmVyO1xuXHRcdGxldCBuZXdZZWFyOiBudW1iZXI7XG5cdFx0bGV0IHJlbWFpbmRlcjogbnVtYmVyO1xuXHRcdGxldCBpbWF4OiBudW1iZXI7XG5cdFx0bGV0IGltaW46IG51bWJlcjtcblx0XHRsZXQgaW1pZDogbnVtYmVyO1xuXG5cdFx0Y29uc3Qgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xuXG5cdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpID09PSAxKSB7XG5cdFx0XHQvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBBbW91bnQgaXMgbm90IDEsXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0XHQvLyBhcHBseSB0byBVVEMgdGltZVxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0XHRcdC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcblx0XHRcdFx0XHRcdFx0KG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlllYXIpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXG5cdFx0XHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG9kb1xuXHRcdFx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94Mjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWluID0gaW1pZCArIDE7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWF4ID0gaW1pZCAtIDE7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5NaW51dGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2Vcblx0XHRcdFx0XHRcdFx0Ly8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcblx0XHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LkhvdXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcblx0XHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuXHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxuXHRcdFx0XHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0bmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxuXHQgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXG5cdCAqL1xuXHRwdWJsaWMgZmluZE5leHQocHJldjogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdGFzc2VydCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xuXHRcdGFzc2VydChcblx0XHRcdCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcblx0XHQpO1xuXHRcdGFzc2VydCh0eXBlb2YgKGNvdW50KSA9PT0gXCJudW1iZXJcIiwgXCJDb3VudCBtdXN0IGJlIGEgbnVtYmVyXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKFxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGRMb2NhbChcblx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKVxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXG5cdCAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cblx0ICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cblx0ICovXG5cdHB1YmxpYyBmaW5kTGFzdChmcm9tOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XG5cdFx0aWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcblx0XHRcdHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXG5cdCAqL1xuXHRwdWJsaWMgZmluZFByZXYobmV4dDogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XG5cdCAqIChleHBlbnNpdmUhKVxuXHQgKi9cblx0cHVibGljIGlzQm91bmRhcnkob2NjdXJyZW5jZTogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRpZiAoIW9jY3VycmVuY2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLFxuXHRcdFx0XCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRyZXR1cm4gKHRoaXMuZmluZEZpcnN0KG9jY3VycmVuY2Uuc3ViKER1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXG5cdCAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxuXHQgKiBhbmQgc2FtZSBkc3QuXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHQvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcblx0XHRpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3Qgb3RoZXJab25lID0gb3RoZXIuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3QgdGhpc0lzUmVndWxhciA9ICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFyZWZab25lIHx8IHJlZlpvbmUuaXNVdGMoKSk7XG5cdFx0Y29uc3Qgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XG5cdFx0aWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0ICYmIHJlZlpvbmUgJiYgb3RoZXJab25lICYmIHJlZlpvbmUuZXF1YWxzKG90aGVyWm9uZSkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcblx0XHRcdCYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5faW50ZXJ2YWwpXG5cdFx0XHQmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZS5nLlxuXHQgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xuXHRcdC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xuXHRcdFx0cmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXG5cdCAqL1xuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIltQZXJpb2Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XG5cdH1cblxuXHQvKipcblx0ICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxuXHQgKi9cblx0cHJpdmF0ZSBfY29ycmVjdERheShkOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIE1hdGgubWluKGJhc2ljcy5kYXlzSW5Nb250aChkLnllYXIoKSwgZC5tb250aCgpKSwgdGhpcy5fcmVmZXJlbmNlLmRheSgpKSxcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSWYgdGhpcy5faW50ZXJuYWxVbml0IGluIFtNb250aCwgWWVhcl0sIG5vcm1hbGl6ZXMgdGhlIGRheS1vZi1tb250aFxuXHQgKiB0byA8PSAyOC5cblx0ICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxuXHQgKi9cblx0cHJpdmF0ZSBfbm9ybWFsaXplRGF5KGQ6IERhdGVUaW1lLCBhbnltb250aDogYm9vbGVhbiA9IHRydWUpOiBEYXRlVGltZSB7XG5cdFx0aWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcblx0XHRcdHx8ICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IFRpbWVVbml0LlllYXIgJiYgKGQubW9udGgoKSA9PT0gMiB8fCBhbnltb250aCkgJiYgZC5kYXkoKSA+IDI4KVxuXHRcdFx0KSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCAyOCxcblx0XHRcdFx0ZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksXG5cdFx0XHRcdGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cblx0ICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcblx0ICovXG5cdHByaXZhdGUgX2RzdFJlbGV2YW50KCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHpvbmUgPSB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpO1xuXHRcdHJldHVybiAhISh6b25lXG5cdFx0XHQmJiB6b25lLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxuXHRcdFx0JiYgem9uZS5oYXNEc3QoKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplIHRoZSB2YWx1ZXMgd2hlcmUgcG9zc2libGUgLSBub3QgYWxsIHZhbHVlc1xuXHQgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxuXHQgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxuXHQgKiBidXQgc2Vjb25kcyBjYW5ub3QgYmUgdHJhbnNmZXJyZWQgdG8gbWludXRlcyBkdWUgdG8gbGVhcCBzZWNvbmRzLlxuXHQgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cblx0ICovXG5cdHByaXZhdGUgX2NhbGNJbnRlcm5hbFZhbHVlcygpOiB2b2lkIHtcblx0XHQvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXG5cdFx0bGV0IGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xuXHRcdGxldCBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuXG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcblx0XHRcdC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTAwMDtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5TZWNvbmQgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Ib3VyICYmIGludEFtb3VudCA+PSAyNCAmJiBpbnRBbW91bnQgJSAyNCA9PT0gMCkge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuRGF5O1xuXHRcdH1cblx0XHQvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5XZWVrKSB7XG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgKiA3O1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0Lk1vbnRoICYmIGludEFtb3VudCA+PSAxMiAmJiBpbnRBbW91bnQgJSAxMiA9PT0gMCkge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuWWVhcjtcblx0XHR9XG5cblx0XHR0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBEdXJhdGlvbihpbnRBbW91bnQsIGludFVuaXQpO1xuXG5cdFx0Ly8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XG5cdFx0XHR0aGlzLl9pbnREc3QgPSB0aGlzLl9kc3Q7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xuXHRcdH1cblxuXHRcdC8vIG5vcm1hbGl6ZSByZWZlcmVuY2UgZGF5XG5cdFx0dGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xuXHR9XG5cbn1cbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZExlZnQoczogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuXHRcdHBhZGRpbmcgKz0gY2hhcjtcclxuXHR9XHJcblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZFJpZ2h0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5cclxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBGb3IgdGVzdGluZyBwdXJwb3Nlcywgd2Ugb2Z0ZW4gbmVlZCB0byBtYW5pcHVsYXRlIHdoYXQgdGhlIGN1cnJlbnRcbiAqIHRpbWUgaXMuIFRoaXMgaXMgYW4gaW50ZXJmYWNlIGZvciBhIGN1c3RvbSB0aW1lIHNvdXJjZSBvYmplY3RcbiAqIHNvIGluIHRlc3RzIHlvdSBjYW4gdXNlIGEgY3VzdG9tIHRpbWUgc291cmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVTb3VyY2Uge1xuXHQvKipcblx0ICogUmV0dXJuIHRoZSBjdXJyZW50IGRhdGUrdGltZSBhcyBhIGphdmFzY3JpcHQgRGF0ZSBvYmplY3Rcblx0ICovXG5cdG5vdygpOiBEYXRlO1xufVxuXG4vKipcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcbiAqL1xuZXhwb3J0IGNsYXNzIFJlYWxUaW1lU291cmNlIGltcGxlbWVudHMgVGltZVNvdXJjZSB7XG5cdHB1YmxpYyBub3coKTogRGF0ZSB7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XG5cdFx0fVxuXHR9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxuICpcbiAqIFRpbWUgem9uZSByZXByZXNlbnRhdGlvbiBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5pbXBvcnQgeyBOb3JtYWxpemVPcHRpb24sIFR6RGF0YWJhc2UgfSBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xuXG4vKipcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsKCk6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XG59XG5cbi8qKlxuICogQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUgem9uZS4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRjKCk6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLnV0YygpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAcmV0dXJucyBhIHRpbWUgem9uZSB3aXRoIHRoZSBnaXZlbiBmaXhlZCBvZmZzZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpvbmUob2Zmc2V0OiBudW1iZXIpOiBUaW1lWm9uZTtcblxuLyoqXG4gKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAcGFyYW0gcyBcImxvY2FsdGltZVwiIGZvciBsb2NhbCB0aW1lLFxuICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcbiAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcbiAqICAgICAgICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHpfZGF0YWJhc2VfdGltZV96b25lc1xuICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXG4gKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xuICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpvbmUobmFtZTogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XG5cbi8qKlxuICogU2VlIHRoZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBvdGhlciB6b25lKCkgbWV0aG9kIHNpZ25hdHVyZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKGE6IGFueSwgZHN0PzogYm9vbGVhbik6IFRpbWVab25lIHtcblx0cmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcbn1cblxuLyoqXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcbiAqL1xuZXhwb3J0IGVudW0gVGltZVpvbmVLaW5kIHtcblx0LyoqXG5cdCAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxuXHQgKi9cblx0TG9jYWwsXG5cdC8qKlxuXHQgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxuXHQgKi9cblx0T2Zmc2V0LFxuXHQvKipcblx0ICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXG5cdCAqIERTVCBpZiBhcHBsaWNhYmxlLlxuXHQgKi9cblx0UHJvcGVyXG59XG5cbi8qKlxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxuICogTm90ZSB0aGF0IHdlIHVzZSB0aW1lIHpvbmUgb2Zmc2V0cyBpbnZlcnRlZCB3LnIudC4gSmF2YVNjcmlwdCBEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCksXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXG4gKlxuICogVGltZSB6b25lcyBjb21lIGluIHRocmVlIGZsYXZvcnM6IHRoZSBsb2NhbCB0aW1lIHpvbmUsIGFzIGNhbGN1bGF0ZWQgYnkgSmF2YVNjcmlwdCBEYXRlLFxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRpbWVab25lIHtcblxuXHQvKipcblx0ICogVGltZSB6b25lIGlkZW50aWZpZXI6XG5cdCAqICBcImxvY2FsdGltZVwiIHN0cmluZyBmb3IgbG9jYWwgdGltZVxuXHQgKiAgRS5nLiBcIi0wMTozMFwiIGZvciBhIGZpeGVkIG9mZnNldCBmcm9tIFVUQ1xuXHQgKiAgRS5nLiBcIlVUQ1wiIG9yIFwiRXVyb3BlL0Ftc3RlcmRhbVwiIGZvciBhbiBPbHNlbiBUWiBkYXRhYmFzZSB0aW1lXG5cdCAqL1xuXHRwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlXG5cdCAqL1xuXHRwcml2YXRlIF9kc3Q6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSBzcGVjaWZpZWQgYnkgX25hbWVcblx0ICovXG5cdHByaXZhdGUgX2tpbmQ6IFRpbWVab25lS2luZDtcblxuXHQvKipcblx0ICogT25seSBmb3IgZml4ZWQgb2Zmc2V0czogdGhlIG9mZnNldCBpbiBtaW51dGVzXG5cdCAqL1xuXHRwcml2YXRlIF9vZmZzZXQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcblx0ICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXG5cdCAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbG9jYWwoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBVVEMgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB1dGMoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcblx0fVxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgd2l0aCBhIGZpeGVkIG9mZnNldFxuXHQgKiBAcGFyYW0gb2Zmc2V0XHRvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG5cdCAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cblx0ICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcblx0ICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcblx0ICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcblx0ICogICAgICAgICAgVFogZGF0YWJhc2Ugem9uZSBuYW1lIG1heSBiZSBzdWZmaXhlZCB3aXRoIFwiIHdpdGhvdXQgRFNUXCIgdG8gaW5kaWNhdGUgbm8gRFNUIHNob3VsZCBiZSBhcHBsaWVkLlxuXHQgKiAgICAgICAgICBJbiB0aGF0IGNhc2UsIHRoZSBkc3QgcGFyYW1ldGVyIGlzIGlnbm9yZWQuXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxuXHQgKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xuXHQgKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKHM6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBab25lIGltcGxlbWVudGF0aW9uc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcblx0XHRsZXQgbmFtZSA9IFwiXCI7XG5cdFx0c3dpdGNoICh0eXBlb2YgKGEpKSB7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0bGV0IHMgPSBhIGFzIHN0cmluZztcblx0XHRcdFx0aWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcblx0XHRcdFx0XHRkc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGEgYXMgbnVtYmVyO1xuXHRcdFx0XHRhc3NlcnQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaW1lWm9uZS56b25lKCk6IFVuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZSBcXFwiXCIgKyB0eXBlb2YgKGEpICsgXCJcXFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XG5cdH1cblxuXHQvKipcblx0ICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xuXHQgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXG5cdCAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXG5cdCAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2RzdCA9IGRzdDtcblx0XHRpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcblx0XHR9IGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSBcIitcIiB8fCBuYW1lLmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgbmFtZS5jaGFyQXQoMCkubWF0Y2goL1xcZC8pIHx8IG5hbWUgPT09IFwiWlwiKSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcblx0XHRcdHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3Blcjtcblx0XHRcdGFzc2VydChUekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBgbm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICcke25hbWV9J2ApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgY2FjaGVkIHlvdSB3aWxsIE5PVFxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFRpbWVab25lIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxuXHQgKiBJQU5BIHRpbWUgem9uZSBuYW1lIFwiRXVyb3BlL0Ftc3RlcmRhbVwiLCBvciBcImxvY2FsdGltZVwiIGZvclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIG5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcblx0fVxuXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgKExvY2FsL09mZnNldC9Qcm9wZXIpXG5cdCAqL1xuXHRwdWJsaWMga2luZCgpOiBUaW1lWm9uZUtpbmQge1xuXHRcdHJldHVybiB0aGlzLl9raW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xuXHQgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXG5cdFx0XHRcdCYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cblx0ICovXG5cdHB1YmxpYyBpc1V0YygpOiBib29sZWFuIHtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBEb2VzIHRoaXMgem9uZSBoYXZlIERheWxpZ2h0IFNhdmluZyBUaW1lIGF0IGFsbD9cblx0ICovXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIG9mZnNldCBpbmNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclV0Yyh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XG5cdHB1YmxpYyBvZmZzZXRGb3JVdGMoXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBudW1iZXIge1xuXHRcdGNvbnN0IHV0Y1RpbWUgPSAoYSAmJiBhIGluc3RhbmNlb2YgVGltZVN0cnVjdCA/IGEgOiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEgYXMgbnVtYmVyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSkpO1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcblx0XHRcdFx0Y29uc3QgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy5ob3VyLCB1dGNUaW1lLmNvbXBvbmVudHMubWludXRlLCB1dGNUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCB1dGNUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KSk7XG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIHN0YW5kYXJkIG9mZnNldCBleGNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMob2Zmc2V0Rm9yVXRjOiBUaW1lU3RydWN0KTogbnVtYmVyO1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMoXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlcjtcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcblx0KTogbnVtYmVyIHtcblx0XHRjb25zdCB1dGNUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgMCwgMSwgMCkpO1xuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIHpvbmUtbG9jYWwgdGltZSAoTk9UIGEgVVRDIHRpbWUpLlxuXHQgKiBAcGFyYW0geWVhciBsb2NhbCBmdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIGxvY2FsIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBsb2NhbCBkYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBsb2NhbCBob3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBsb2NhbCBtaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIGxvY2FsIHNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBsb2NhbCBtaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKGxvY2FsVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclpvbmUoeWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyKTogbnVtYmVyO1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlciB7XG5cdFx0Y29uc3QgbG9jYWxUaW1lID0gKGEgJiYgYSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3QgPyBhIDogbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhIGFzIG51bWJlciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pKTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSxcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0Ly8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcblx0ICpcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGNEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXG5cdCAqXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZURhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgYWJicmV2aWF0aW9uIGF0IGdpdmVuIFVUQyB0aW1lc3RhbXAgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0geWVhciBGdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBIb3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBNaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIFNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBNaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXG5cdCAqXG5cdCAqIEByZXR1cm4gXCJsb2NhbFwiIGZvciBsb2NhbCB0aW1lem9uZSwgdGhlIG9mZnNldCBmb3IgYW4gb2Zmc2V0IHpvbmUsIG9yIHRoZSBhYmJyZXZpYXRpb24gZm9yIGEgcHJvcGVyIHpvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgZHN0RGVwZW5kZW50PzogYm9vbGVhblxuXHQpOiBzdHJpbmc7XG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGModXRjVGltZTogVGltZVN0cnVjdCwgZHN0RGVwZW5kZW50PzogYm9vbGVhbik6IHN0cmluZztcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyhcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgYj86IG51bWJlciB8IGJvb2xlYW4sIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBjPzogYm9vbGVhblxuXHQpOiBzdHJpbmcge1xuXHRcdGxldCB1dGNUaW1lOiBUaW1lU3RydWN0O1xuXHRcdGxldCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXHRcdGlmIChhIGluc3RhbmNlb2YgVGltZVN0cnVjdCkge1xuXHRcdFx0dXRjVGltZSA9IGE7XG5cdFx0XHRkc3REZXBlbmRlbnQgPSAoYiA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR1dGNUaW1lID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiBhcyBudW1iZXIsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcblx0XHR9XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xuXHRcdFx0XHRyZXR1cm4gXCJsb2NhbFwiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cblx0ICpcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kc1xuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXG5cdCAqXG5cdCAqIEByZXR1cm5zXHR1bml4IG1pbGxpc2Vjb25kcyBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXG5cdCAqL1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxVbml4TWlsbGlzOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cblx0ICpcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0em9uZSB0aW1lIHRpbWVzdGFtcFxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXG5cdCAqXG5cdCAqIEByZXR1cm5zXHR0aW1lIHN0cnVjdCBpbiB6b25lIHRpbWUsIG5vcm1hbGl6ZWQuXG5cdCAqL1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xuXHRwdWJsaWMgbm9ybWFsaXplWm9uZVRpbWUobG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xuXHRcdGNvbnN0IHR6b3B0OiBOb3JtYWxpemVPcHRpb24gPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uRG93biA/IE5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogTm9ybWFsaXplT3B0aW9uLlVwKTtcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcblx0XHRcdGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbG9jYWxUaW1lO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIgKG5vcm1hbGl6ZWQpLlxuXHQgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm5hbWUoKTtcblx0XHRpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcblx0XHRcdGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcblx0ICovXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiW1RpbWVab25lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcblx0ICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgb2Zmc2V0VG9TdHJpbmcob2Zmc2V0OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xuXHRcdGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xuXHRcdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XG5cdFx0cmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cblx0ICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcblx0ICogQHJldHVybiBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHN0cmluZ1RvT2Zmc2V0KHM6IHN0cmluZyk6IG51bWJlciB7XG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xuXHRcdC8vIGVhc3kgY2FzZVxuXHRcdGlmICh0ID09PSBcIlpcIikge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXHRcdC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcblx0XHRhc3NlcnQodC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pLCBcIldyb25nIHRpbWUgem9uZSBmb3JtYXQ6IFxcXCJcIiArIHQgKyBcIlxcXCJcIik7XG5cdFx0Y29uc3Qgc2lnbjogbnVtYmVyID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XG5cdFx0Y29uc3QgaG91cnM6IG51bWJlciA9IHBhcnNlSW50KHQuc3Vic3RyKDEsIDIpLCAxMCk7XG5cdFx0bGV0IG1pbnV0ZXM6IG51bWJlciA9IDA7XG5cdFx0aWYgKHQubGVuZ3RoID09PSA1KSB7XG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoMywgMiksIDEwKTtcblx0XHR9IGVsc2UgaWYgKHQubGVuZ3RoID09PSA2KSB7XG5cdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zdWJzdHIoNCwgMiksIDEwKTtcblx0XHR9XG5cdFx0YXNzZXJ0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJPZmZzZXRzIGZyb20gVVRDIG11c3QgYmUgbGVzcyB0aGFuIGEgZGF5LlwiKTtcblx0XHRyZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcyk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgY2FjaGUuXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfY2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBUaW1lWm9uZSB9ID0ge307XG5cblx0LyoqXG5cdCAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcblx0ICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9maW5kT3JDcmVhdGUobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4pOiBUaW1lWm9uZSB7XG5cdFx0Y29uc3Qga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcblx0XHRpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xuXHRcdFx0cmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XG5cdFx0XHRUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXG5cdCAqIGNhY2hlIGxvb2t1cFxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgX25vcm1hbGl6ZVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHQ6IHN0cmluZyA9IHMudHJpbSgpO1xuXHRcdGFzc2VydCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcblx0XHRpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0cmV0dXJuIHQ7XG5cdFx0fSBlbHNlIGlmICh0ID09PSBcIlpcIikge1xuXHRcdFx0cmV0dXJuIFwiKzAwOjAwXCI7XG5cdFx0fSBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcblx0XHRcdC8vIG9mZnNldCBzdHJpbmdcblx0XHRcdC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcoVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQodCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0YXRpYyBfaXNPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xuXHRcdHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XG5cdH1cbn1cblxuXG5cbiIsIi8qKlxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIERpZmZlcmVudCB0eXBlcyBvZiB0b2tlbnMsIGVhY2ggZm9yIGEgRGF0ZVRpbWUgXCJwZXJpb2QgdHlwZVwiIChsaWtlIHllYXIsIG1vbnRoLCBob3VyIGV0Yy4pXG4gKi9cbmV4cG9ydCBlbnVtIFRva2VuVHlwZSB7XG5cdC8qKlxuXHQgKiBSYXcgdGV4dFxuXHQgKi9cblx0SURFTlRJVFksXG5cdEVSQSxcblx0WUVBUixcblx0UVVBUlRFUixcblx0TU9OVEgsXG5cdFdFRUssXG5cdERBWSxcblx0V0VFS0RBWSxcblx0REFZUEVSSU9ELFxuXHRIT1VSLFxuXHRNSU5VVEUsXG5cdFNFQ09ORCxcblx0Wk9ORVxufVxuXG4vKipcbiAqIEJhc2ljIHRva2VuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW4ge1xuXHQvKipcblx0ICogVGhlIHR5cGUgb2YgdG9rZW5cblx0ICovXG5cdHR5cGU6IFRva2VuVHlwZTtcblxuXHQvKipcblx0ICogVGhlIHN5bWJvbCBmcm9tIHdoaWNoIHRoZSB0b2tlbiB3YXMgcGFyc2VkXG5cdCAqL1xuXHRzeW1ib2w6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgdG9rZW5cblx0ICovXG5cdGxlbmd0aDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgcHJvZHVjZWQgdGhpcyB0b2tlblxuXHQgKi9cblx0cmF3OiBzdHJpbmc7XG59XG5cbi8qKlxuICogVG9rZW5pemUgYW4gTERNTCBkYXRlL3RpbWUgZm9ybWF0IHN0cmluZ1xuICogQHBhcmFtIGZvcm1hdFN0cmluZyB0aGUgc3RyaW5nIHRvIHRva2VuaXplXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZShmb3JtYXRTdHJpbmc6IHN0cmluZyk6IFRva2VuW10ge1xuXHRpZiAoIWZvcm1hdFN0cmluZykge1xuXHRcdHJldHVybiBbXTtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdDogVG9rZW5bXSA9IFtdO1xuXG5cdGNvbnN0IGFwcGVuZFRva2VuID0gKHRva2VuU3RyaW5nOiBzdHJpbmcsIHJhdz86IGJvb2xlYW4pOiB2b2lkID0+IHtcblx0XHQvLyBUaGUgdG9rZW5TdHJpbmcgbWF5IGJlIGxvbmdlciB0aGFuIHN1cHBvcnRlZCBmb3IgYSB0b2tlbnR5cGUsIGUuZy4gXCJoaGhoXCIgd2hpY2ggd291bGQgYmUgVFdPIGhvdXIgc3BlY3MuXG5cdFx0Ly8gV2UgZ3JlZWRpbHkgY29uc3VtZSBMRE1MIHNwZWNzIHdoaWxlIHBvc3NpYmxlXG5cdFx0d2hpbGUgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XG5cdFx0XHRpZiAocmF3IHx8ICFTWU1CT0xfTUFQUElORy5oYXNPd25Qcm9wZXJ0eSh0b2tlblN0cmluZ1swXSkpIHtcblx0XHRcdFx0Y29uc3QgdG9rZW46IFRva2VuID0ge1xuXHRcdFx0XHRcdGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxuXHRcdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcsXG5cdFx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcblx0XHRcdFx0XHR0eXBlOiBUb2tlblR5cGUuSURFTlRJVFlcblx0XHRcdFx0fTtcblx0XHRcdFx0cmVzdWx0LnB1c2godG9rZW4pO1xuXHRcdFx0XHR0b2tlblN0cmluZyA9IFwiXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdG9rZW4sIGRpZmZlcmVudCBsZW5ndGhzIG1heSBiZSBzdXBwb3J0ZWRcblx0XHRcdFx0Y29uc3QgaW5mbyA9IFNZTUJPTF9NQVBQSU5HW3Rva2VuU3RyaW5nWzBdXTtcblx0XHRcdFx0bGV0IGxlbmd0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRpZiAoaW5mby5tYXhMZW5ndGggPT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkoaW5mby5sZW5ndGhzKSB8fCBpbmZvLmxlbmd0aHMubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0XHRcdC8vIGV2ZXJ5dGhpbmcgaXMgYWxsb3dlZFxuXHRcdFx0XHRcdGxlbmd0aCA9IHRva2VuU3RyaW5nLmxlbmd0aDtcblx0XHRcdFx0fSBlbHNlIGlmIChpbmZvLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Ly8gZ3JlZWRpbHkgZ29iYmxlIHVwXG5cdFx0XHRcdFx0bGVuZ3RoID0gTWF0aC5taW4odG9rZW5TdHJpbmcubGVuZ3RoLCBpbmZvLm1heExlbmd0aCk7XG5cdFx0XHRcdH0gZWxzZSAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqLyBpZiAoQXJyYXkuaXNBcnJheShpbmZvLmxlbmd0aHMpICYmIGluZm8ubGVuZ3Rocy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0Ly8gZmluZCBtYXhpbXVtIGFsbG93ZWQgbGVuZ3RoXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBsIG9mIGluZm8ubGVuZ3Rocykge1xuXHRcdFx0XHRcdFx0aWYgKGwgPD0gdG9rZW5TdHJpbmcubGVuZ3RoICYmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPCBsKSkge1xuXHRcdFx0XHRcdFx0XHRsZW5ndGggPSBsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Ly8gbm8gYWxsb3dlZCBsZW5ndGggZm91bmQgKG5vdCBwb3NzaWJsZSB3aXRoIGN1cnJlbnQgc3ltYm9sIG1hcHBpbmcgc2luY2UgbGVuZ3RoIDEgaXMgYWx3YXlzIGFsbG93ZWQpXG5cdFx0XHRcdFx0Y29uc3QgdG9rZW46IFRva2VuID0ge1xuXHRcdFx0XHRcdFx0bGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXG5cdFx0XHRcdFx0XHRyYXc6IHRva2VuU3RyaW5nLFxuXHRcdFx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2godG9rZW4pO1xuXHRcdFx0XHRcdHRva2VuU3RyaW5nID0gXCJcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBwcmVmaXggZm91bmRcblx0XHRcdFx0XHRjb25zdCB0b2tlbjogVG9rZW4gPSB7XG5cdFx0XHRcdFx0XHRsZW5ndGgsXG5cdFx0XHRcdFx0XHRyYXc6IHRva2VuU3RyaW5nLnNsaWNlKDAsIGxlbmd0aCksXG5cdFx0XHRcdFx0XHRzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxuXHRcdFx0XHRcdFx0dHlwZTogaW5mby50eXBlXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZXN1bHQucHVzaCh0b2tlbik7XG5cdFx0XHRcdFx0dG9rZW5TdHJpbmcgPSB0b2tlblN0cmluZy5zbGljZShsZW5ndGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGxldCBjdXJyZW50VG9rZW46IHN0cmluZyA9IFwiXCI7XG5cdGxldCBwcmV2aW91c0NoYXI6IHN0cmluZyA9IFwiXCI7XG5cdGxldCBxdW90aW5nOiBib29sZWFuID0gZmFsc2U7XG5cdGxldCBwb3NzaWJsZUVzY2FwaW5nOiBib29sZWFuID0gZmFsc2U7XG5cblx0Zm9yIChjb25zdCBjdXJyZW50Q2hhciBvZiBmb3JtYXRTdHJpbmcpIHtcblx0XHQvLyBIYW5sZGUgZXNjYXBpbmcgYW5kIHF1b3Rpbmdcblx0XHRpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XG5cdFx0XHRpZiAoIXF1b3RpbmcpIHtcblx0XHRcdFx0aWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcblx0XHRcdFx0XHQvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xuXHRcdFx0XHRcdGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XG5cdFx0XHRcdFx0XHRhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xuXHRcdFx0XHRcdFx0Y3VycmVudFRva2VuID0gXCJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IFwiJ1wiO1xuXHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcblx0XHRcdFx0aWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcblx0XHRcdFx0XHQvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXG5cdFx0XHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuXHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcblx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcblx0XHRcdFx0Ly8gQ3VycmVudCBjaGFyYWN0ZXIgaXMgcmVsZXZhbnQsIHNvIHNhdmUgaXQgZm9yIGluc3BlY3RpbmcgbmV4dCByb3VuZFxuXHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcblx0XHRcdH1cblx0XHRcdGNvbnRpbnVlO1xuXHRcdH0gZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0cXVvdGluZyA9ICFxdW90aW5nO1xuXHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuXG5cdFx0XHQvLyBGbHVzaCBjdXJyZW50IHRva2VuXG5cdFx0XHRhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sICFxdW90aW5nKTtcblx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0aWYgKHF1b3RpbmcpIHtcblx0XHRcdC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cblx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcblx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcblx0XHRcdC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXG5cdFx0XHRhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xuXHRcdFx0Y3VycmVudFRva2VuID0gY3VycmVudENoYXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFdlIGFyZSByZXBlYXRpbmcgdGhlIHRva2VuIHdpdGggbW9yZSBjaGFyYWN0ZXJzXG5cdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XG5cdFx0fVxuXG5cdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XG5cdH1cblx0Ly8gRG9uJ3QgZm9yZ2V0IHRvIGFkZCB0aGUgbGFzdCB0b2tlbiB0byB0aGUgcmVzdWx0IVxuXHRhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHF1b3RpbmcpO1xuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBTeW1ib2xJbmZvIHtcblx0LyoqXG5cdCAqIFRva2VuIHR5cGVcblx0ICovXG5cdHR5cGU6IFRva2VuVHlwZTtcblx0LyoqXG5cdCAqIE1heGltdW0gdG9rZW4gbGVuZ3RoICh1bmRlZmluZWQgZm9yIHVubGltaXRlZCB0b2tlbnMpXG5cdCAqL1xuXHRtYXhMZW5ndGg/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBBbGxvd2VkIHRva2VuIGxlbmd0aHMgKGluc3RlYWQgb2YgbWluTGVuZ3RoL21heExlbmd0aClcblx0ICovXG5cdGxlbmd0aHM/OiBudW1iZXJbXTtcbn1cblxuY29uc3QgU1lNQk9MX01BUFBJTkc6IHsgW2NoYXI6IHN0cmluZ106IFN5bWJvbEluZm8gfSA9IHtcblx0RzogeyB0eXBlOiBUb2tlblR5cGUuRVJBLCBtYXhMZW5ndGg6IDUgfSxcblx0eTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuXHRZOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXG5cdHU6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcblx0VTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiwgbWF4TGVuZ3RoOiA1IH0sXG5cdHI6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcblx0UTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXG5cdHE6IHsgdHlwZTogVG9rZW5UeXBlLlFVQVJURVIsIG1heExlbmd0aDogNSB9LFxuXHRNOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiA1IH0sXG5cdEw6IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcblx0bDogeyB0eXBlOiBUb2tlblR5cGUuTU9OVEgsIG1heExlbmd0aDogMSB9LFxuXHR3OiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLLCBtYXhMZW5ndGg6IDIgfSxcblx0VzogeyB0eXBlOiBUb2tlblR5cGUuV0VFSywgbWF4TGVuZ3RoOiAxIH0sXG5cdGQ6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAyIH0sXG5cdEQ6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAzIH0sXG5cdEY6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAxIH0sXG5cdGc6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSB9LFxuXHRFOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcblx0ZTogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXG5cdGM6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxuXHRhOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxuXHRoOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcblx0SDogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXG5cdGs6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuXHRLOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcblx0ajogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiA2IH0sXG5cdEo6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuXHRtOiB7IHR5cGU6IFRva2VuVHlwZS5NSU5VVEUsIG1heExlbmd0aDogMiB9LFxuXHRzOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQsIG1heExlbmd0aDogMiB9LFxuXHRTOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQgfSxcblx0QTogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05EIH0sXG5cdHo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxuXHRaOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcblx0TzogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbGVuZ3RoczogWzEsIDRdIH0sXG5cdHY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIGxlbmd0aHM6IFsxLCA0XSB9LFxuXHRWOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDQgfSxcblx0WDogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXG5cdHg6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxufTtcbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXG4gKlxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXG4gKlxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IFRpbWVDb21wb25lbnRPcHRzLCBUaW1lU3RydWN0LCBUaW1lVW5pdCwgV2Vla0RheSB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XG5cbi8qKlxuICogVHlwZSBvZiBydWxlIFRPIGNvbHVtbiB2YWx1ZVxuICovXG5leHBvcnQgZW51bSBUb1R5cGUge1xuXHQvKipcblx0ICogRWl0aGVyIGEgeWVhciBudW1iZXIgb3IgXCJvbmx5XCJcblx0ICovXG5cdFllYXIsXG5cdC8qKlxuXHQgKiBcIm1heFwiXG5cdCAqL1xuXHRNYXhcbn1cblxuLyoqXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXG4gKi9cbmV4cG9ydCBlbnVtIE9uVHlwZSB7XG5cdC8qKlxuXHQgKiBEYXktb2YtbW9udGggbnVtYmVyXG5cdCAqL1xuXHREYXlOdW0sXG5cdC8qKlxuXHQgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcblx0ICovXG5cdExhc3RYLFxuXHQvKipcblx0ICogZS5nLiBcIlN1bj49OFwiXG5cdCAqL1xuXHRHcmVxWCxcblx0LyoqXG5cdCAqIGUuZy4gXCJTdW48PThcIlxuXHQgKi9cblx0TGVxWFxufVxuXG5leHBvcnQgZW51bSBBdFR5cGUge1xuXHQvKipcblx0ICogTG9jYWwgdGltZSAobm8gRFNUKVxuXHQgKi9cblx0U3RhbmRhcmQsXG5cdC8qKlxuXHQgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXG5cdCAqL1xuXHRXYWxsLFxuXHQvKipcblx0ICogVXRjIHRpbWVcblx0ICovXG5cdFV0Yyxcbn1cblxuLyoqXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxuICpcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXG4gKi9cbmV4cG9ydCBjbGFzcyBSdWxlSW5mbyB7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0LyoqXG5cdFx0ICogRlJPTSBjb2x1bW4geWVhciBudW1iZXIuXG5cdFx0ICogTm90ZSwgY2FuIGJlIC0xMDAwMCBmb3IgTmFOIHZhbHVlIChlLmcuIGZvciBcIlN5c3RlbVZcIiBydWxlcylcblx0XHQgKi9cblx0XHRwdWJsaWMgZnJvbTogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxuXHRcdCAqL1xuXHRcdHB1YmxpYyB0b1R5cGU6IFRvVHlwZSxcblx0XHQvKipcblx0XHQgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cblx0XHQgKi9cblx0XHRwdWJsaWMgdG9ZZWFyOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogVFlQRSBjb2x1bW4sIG5vdCB1c2VkIHNvIGZhclxuXHRcdCAqL1xuXHRcdHB1YmxpYyB0eXBlOiBzdHJpbmcsXG5cdFx0LyoqXG5cdFx0ICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXG5cdFx0ICovXG5cdFx0cHVibGljIGluTW9udGg6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBPTiBjb2x1bW4gdHlwZVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBvblR5cGU6IE9uVHlwZSxcblx0XHQvKipcblx0XHQgKiBJZiBvblR5cGUgaXMgRGF5TnVtLCB0aGUgZGF5IG51bWJlclxuXHRcdCAqL1xuXHRcdHB1YmxpYyBvbkRheTogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBvbldlZWtEYXk6IFdlZWtEYXksXG5cdFx0LyoqXG5cdFx0ICogQVQgY29sdW1uIGhvdXJcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRIb3VyOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogQVQgY29sdW1uIG1pbnV0ZVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBhdE1pbnV0ZTogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIEFUIGNvbHVtbiBzZWNvbmRcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRTZWNvbmQ6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBBVCBjb2x1bW4gdHlwZVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBhdFR5cGU6IEF0VHlwZSxcblx0XHQvKipcblx0XHQgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcblx0XHQgKi9cblx0XHRwdWJsaWMgc2F2ZTogRHVyYXRpb24sXG5cdFx0LyoqXG5cdFx0ICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxuXHRcdCAqIE5vdGUgaWYgVFogZGF0YWJhc2UgaW5kaWNhdGVzIFwiLVwiIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xuXHRcdCAqL1xuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xuXHRcdCkge1xuXG5cdFx0aWYgKHRoaXMuc2F2ZSkge1xuXHRcdFx0dGhpcy5zYXZlID0gdGhpcy5zYXZlLmNvbnZlcnQoVGltZVVuaXQuSG91cik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcblx0ICovXG5cdHB1YmxpYyBhcHBsaWNhYmxlKHllYXI6IG51bWJlcik6IGJvb2xlYW4ge1xuXHRcdGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHN3aXRjaCAodGhpcy50b1R5cGUpIHtcblx0XHRcdGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XG5cdFx0XHRjYXNlIFRvVHlwZS5ZZWFyOiByZXR1cm4gKHllYXIgPD0gdGhpcy50b1llYXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTb3J0IGNvbXBhcmlzb25cblx0ICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgbGVzcyB0aGFuIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXG5cdCAqL1xuXHRwdWJsaWMgZWZmZWN0aXZlTGVzcyhvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5mcm9tIDwgb3RoZXIuZnJvbSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmZyb20gPiBvdGhlci5mcm9tKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluTW9udGggPCBvdGhlci5pbk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuaW5Nb250aCA+IG90aGVyLmluTW9udGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pIDwgb3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNvcnQgY29tcGFyaXNvblxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBlcXVhbCB0byBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxuXHQgKi9cblx0cHVibGljIGVmZmVjdGl2ZUVxdWFsKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuaW5Nb250aCAhPT0gb3RoZXIuaW5Nb250aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoIXRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pLmVxdWFscyhvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGRhdGUgdGhhdCB0aGUgcnVsZSB0YWtlcyBlZmZlY3QuIE5vdGUgdGhhdCB0aGUgdGltZVxuXHQgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXG5cdCAqIG5vdCB0YWtlbiBpbnRvIGFjY291bnRcblx0ICovXG5cdHB1YmxpYyBlZmZlY3RpdmVEYXRlKHllYXI6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xuXHRcdGFzc2VydCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBpcyBub3QgYXBwbGljYWJsZSBpbiBcIiArIHllYXIudG9TdHJpbmcoMTApKTtcblxuXHRcdC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxuXHRcdGNvbnN0IHRtOiBUaW1lQ29tcG9uZW50T3B0cyA9IHt5ZWFyLCBtb250aDogdGhpcy5pbk1vbnRoIH07XG5cblx0XHQvLyBjYWxjdWxhdGUgZGF5XG5cdFx0c3dpdGNoICh0aGlzLm9uVHlwZSkge1xuXHRcdFx0Y2FzZSBPblR5cGUuRGF5TnVtOiB7XG5cdFx0XHRcdHRtLmRheSA9IHRoaXMub25EYXk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHtcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDoge1xuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBPblR5cGUuTGFzdFg6IHtcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsY3VsYXRlIHRpbWVcblx0XHR0bS5ob3VyID0gdGhpcy5hdEhvdXI7XG5cdFx0dG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcblx0XHR0bS5zZWNvbmQgPSB0aGlzLmF0U2Vjb25kO1xuXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcblx0ICpcblx0ICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGZvciB3aGljaCB0byByZXR1cm4gdGhlIHRyYW5zaXRpb25cblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1Rcblx0ICogQHBhcmFtIHByZXZSdWxlXHRUaGUgcHJldmlvdXMgcnVsZVxuXHQgKi9cblx0cHVibGljIHRyYW5zaXRpb25UaW1lVXRjKHllYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uLCBwcmV2UnVsZT86IFJ1bGVJbmZvKTogbnVtYmVyIHtcblx0XHRhc3NlcnQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgbm90IGFwcGxpY2FibGUgaW4gZ2l2ZW4geWVhclwiKTtcblx0XHRjb25zdCB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XG5cblx0XHQvLyBhZGp1c3QgZm9yIGdpdmVuIG9mZnNldFxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uO1xuXHRcdHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcblx0XHRcdGNhc2UgQXRUeXBlLlV0Yzpcblx0XHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBBdFR5cGUuU3RhbmRhcmQ6XG5cdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQXRUeXBlLldhbGw6XG5cdFx0XHRcdGlmIChwcmV2UnVsZSkge1xuXHRcdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0LmFkZChwcmV2UnVsZS5zYXZlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIEF0VHlwZVwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblxufVxuXG4vKipcbiAqIFR5cGUgb2YgcmVmZXJlbmNlIGZyb20gem9uZSB0byBydWxlXG4gKi9cbmV4cG9ydCBlbnVtIFJ1bGVUeXBlIHtcblx0LyoqXG5cdCAqIE5vIHJ1bGUgYXBwbGllc1xuXHQgKi9cblx0Tm9uZSxcblx0LyoqXG5cdCAqIEZpeGVkIGdpdmVuIG9mZnNldFxuXHQgKi9cblx0T2Zmc2V0LFxuXHQvKipcblx0ICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXG5cdCAqL1xuXHRSdWxlTmFtZVxufVxuXG4vKipcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKlxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cbiAqIGJlIGEgc2luZ2xlIHJlY29yZCB3aXRoIHplcm8gb3IgbW9yZSBjb250aW51YXRpb24gbGluZXMuIFRodXMsIHRoZSBrZXl3b3JkLCDigJxab25lLOKAnSBhbmQgdGhlIHpvbmUgbmFtZSBhcmUgbm90IHJlcGVhdGVkLlxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXG4gKiBUaGUgc3RhdGUgZXhpc3RzIGZyb20gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIHByZXZpb3VzIGxpbmXigJlzIFtVTlRJTF0gY29sdW1uIHVwIHRvIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBjdXJyZW50IGxpbmXigJlzXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXG4gKiBUaGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSBsYXN0IGxpbmUsIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4sIGNvbnRpbnVlcyB0byB0aGUgcHJlc2VudC5cbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxuICogMjQgaG91cnM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBtb3ZlbWVudCBvZiB0aGUgRGF0ZSBMaW5lLiBGb3IgZXhhbXBsZTpcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XG4gKiBcdFx0XHQgLTg6NTc6NDEgLVx0TE1UXHQuLi5cbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXG4gKiByZWxpZ2lvdXMgcmVhc29ucywgd2FzIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIGluc3RhbmNlIG9mIHRoZSBzYW1lIGRheSB3aXRoIGEgZGlmZmVyZW50IG5hbWUsIDE4IE9jdG9iZXIgaW4gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XG4gKiB1c2VkIGR1cmluZyB0aGUgcGVyaW9kLiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlIGlzIGFsbW9zdCBjZXJ0YWlubHkgd3JvbmcgZXhjZXB0IGluIHRoZSBhcmNoZXR5cGFsIHBsYWNlIGFmdGVyIHdoaWNoIHRoZSB6b25lIGlzIG5hbWVkLlxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxuICovXG5leHBvcnQgY2xhc3MgWm9uZUluZm8ge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdC8qKlxuXHRcdCAqIEdNVCBvZmZzZXQgaW4gZnJhY3Rpb25hbCBtaW51dGVzLCBQT1NJVElWRSB0byBVVEMgKG5vdGUgSmF2YVNjcmlwdC5EYXRlIGdpdmVzIG9mZnNldHNcblx0XHQgKiBjb250cmFyeSB0byB3aGF0IHlvdSBtaWdodCBleHBlY3QpLiAgRS5nLiBFdXJvcGUvQW1zdGVyZGFtIGhhcyArNjAgbWludXRlcyBpbiB0aGlzIGZpZWxkIGJlY2F1c2Vcblx0XHQgKiBpdCBpcyBvbmUgaG91ciBhaGVhZCBvZiBVVENcblx0XHQgKi9cblx0XHRwdWJsaWMgZ210b2ZmOiBEdXJhdGlvbixcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBSVUxFUyBjb2x1bW4gdGVsbHMgdXMgd2hldGhlciBkYXlsaWdodCBzYXZpbmcgdGltZSBpcyBiZWluZyBvYnNlcnZlZDpcblx0XHQgKiBBIGh5cGhlbiwgYSBraW5kIG9mIG51bGwgdmFsdWUsIG1lYW5zIHRoYXQgd2UgaGF2ZSBub3Qgc2V0IG91ciBjbG9ja3MgYWhlYWQgb2Ygc3RhbmRhcmQgdGltZS5cblx0XHQgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxuXHRcdCAqIFNvbWUgYWxwaGFiZXRpYyBzdHJpbmcgbWVhbnMgdGhhdCB3ZSBtaWdodCBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkOyBhbmQgd2UgbmVlZCB0byBjaGVjayB0aGUgcnVsZVxuXHRcdCAqIHRoZSBuYW1lIG9mIHdoaWNoIGlzIHRoZSBnaXZlbiBhbHBoYWJldGljIHN0cmluZy5cblx0XHQgKi9cblx0XHRwdWJsaWMgcnVsZVR5cGU6IFJ1bGVUeXBlLFxuXG5cdFx0LyoqXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGFuIG9mZnNldCwgdGhpcyBpcyB0aGUgb2Zmc2V0XG5cdFx0ICovXG5cdFx0cHVibGljIHJ1bGVPZmZzZXQ6IER1cmF0aW9uLFxuXG5cdFx0LyoqXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGEgcnVsZSBuYW1lLCB0aGlzIGlzIHRoZSBydWxlIG5hbWVcblx0XHQgKi9cblx0XHRwdWJsaWMgcnVsZU5hbWU6IHN0cmluZyxcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XG5cdFx0ICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXG5cdFx0ICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxuXHRcdCAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cblx0XHQgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcblx0XHQgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXG5cdFx0ICovXG5cdFx0cHVibGljIGZvcm1hdDogc3RyaW5nLFxuXG5cdFx0LyoqXG5cdFx0ICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xuXHRcdCAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXG5cdFx0ICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSB1bmRlZmluZWQgKGZvciB0aGUgZmlyc3QgcnVsZSlcblx0XHQgKi9cblx0XHRwdWJsaWMgdW50aWw/OiBudW1iZXJcblx0KSB7XG5cdFx0aWYgKHRoaXMucnVsZU9mZnNldCkge1xuXHRcdFx0dGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xuXHRcdH1cblx0fVxufVxuXG5cbmVudW0gVHpNb250aE5hbWVzIHtcblx0SmFuID0gMSxcblx0RmViID0gMixcblx0TWFyID0gMyxcblx0QXByID0gNCxcblx0TWF5ID0gNSxcblx0SnVuID0gNixcblx0SnVsID0gNyxcblx0QXVnID0gOCxcblx0U2VwID0gOSxcblx0T2N0ID0gMTAsXG5cdE5vdiA9IDExLFxuXHREZWMgPSAxMlxufVxuXG5mdW5jdGlvbiBtb250aE5hbWVUb1N0cmluZyhuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDw9IDEyOyArK2kpIHtcblx0XHRpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdH1cblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGlmICh0cnVlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCJcIik7XG5cdH1cbn1cblxuZW51bSBUekRheU5hbWVzIHtcblx0U3VuID0gMCxcblx0TW9uID0gMSxcblx0VHVlID0gMixcblx0V2VkID0gMyxcblx0VGh1ID0gNCxcblx0RnJpID0gNSxcblx0U2F0ID0gNlxufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXG4gKiAxLCAtMSwgKzEsIDAxLCAxOjAwLCAxOjIzOjI1LjE0M1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZE9mZnNldFN0cmluZyhzOiBzdHJpbmcpOiBib29sZWFuIHtcblx0cmV0dXJuIC9eKFxcLXxcXCspPyhbMC05XSsoKFxcOlswLTldKyk/KFxcOlswLTldKyhcXC5bMC05XSspPyk/KSkkLy50ZXN0KHMpO1xufVxuXG4vKipcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxuICovXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbiB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdC8qKlxuXHRcdCAqIFRyYW5zaXRpb24gdGltZSBpbiBVVEMgbWlsbGlzXG5cdFx0ICovXG5cdFx0cHVibGljIGF0OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXG5cdFx0ICovXG5cdFx0cHVibGljIG9mZnNldDogRHVyYXRpb24sXG5cblx0XHQvKipcblx0XHQgKiBOZXcgdGltem9uZSBhYmJyZXZpYXRpb24gbGV0dGVyXG5cdFx0ICovXG5cdFx0cHVibGljIGxldHRlcjogc3RyaW5nXG5cblx0XHQpIHtcblx0XHRpZiAodGhpcy5vZmZzZXQpIHtcblx0XHRcdHRoaXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogT3B0aW9uIGZvciBUekRhdGFiYXNlI25vcm1hbGl6ZUxvY2FsKClcbiAqL1xuZXhwb3J0IGVudW0gTm9ybWFsaXplT3B0aW9uIHtcblx0LyoqXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XG5cdCAqL1xuXHRVcCxcblx0LyoqXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgU1VCVFJBQ1RJTkcgdGhlIERTVCBvZmZzZXRcblx0ICovXG5cdERvd25cbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIGEgd3JhcHBlciBhcm91bmQgdGltZSB6b25lIGRhdGEgSlNPTiBvYmplY3QgZnJvbSB0aGUgdHpkYXRhIE5QTSBtb2R1bGUuXG4gKiBZb3UgdXN1YWxseSBkbyBub3QgbmVlZCB0byB1c2UgdGhpcyBkaXJlY3RseSwgdXNlIFRpbWVab25lIGFuZCBEYXRlVGltZSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgVHpEYXRhYmFzZSB7XG5cblx0LyoqXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBtZW1iZXJcblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZT86IFR6RGF0YWJhc2U7XG5cblx0LyoqXG5cdCAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhIFRaIGRhdGEgYXMgSlNPTiBvYmplY3QgKGZyb20gb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMpLlxuXHQgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbml0KGRhdGE/OiBhbnkgfCBhbnlbXSk6IHZvaWQge1xuXHRcdGlmIChkYXRhKSB7XG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IHVuZGVmaW5lZDsgLy8gbmVlZGVkIGZvciBhc3NlcnQgaW4gY29uc3RydWN0b3Jcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBkYXRhOiBhbnlbXSA9IFtdO1xuXHRcdFx0Ly8gdHJ5IHRvIGZpbmQgVFogZGF0YSBpbiBnbG9iYWwgdmFyaWFibGVzXG5cdFx0XHRjb25zdCBnOiBhbnkgPSAoZ2xvYmFsID8gZ2xvYmFsIDogd2luZG93KTtcblx0XHRcdGlmIChnKSB7XG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGcpKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmRleE9mKFwidHpkYXRhXCIpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGdba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBnW2tleV0ucnVsZXMgJiYgZ1trZXldLnpvbmVzKSB7XG5cdFx0XHRcdFx0XHRcdGRhdGEucHVzaChnW2tleV0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gdHJ5IHRvIGZpbmQgVFogZGF0YSBhcyBpbnN0YWxsZWQgTlBNIG1vZHVsZXNcblx0XHRcdGNvbnN0IGZpbmROb2RlTW9kdWxlcyA9IChyZXF1aXJlOiBhbnkpOiB2b2lkID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBmaXJzdCB0cnkgdHpkYXRhIHdoaWNoIGNvbnRhaW5zIGFsbCBkYXRhXG5cdFx0XHRcdFx0Y29uc3QgdHpEYXRhTmFtZSA9IFwidHpkYXRhXCI7XG5cdFx0XHRcdFx0Y29uc3QgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxuXHRcdFx0XHRcdGRhdGEucHVzaChkKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdC8vIHRoZW4gdHJ5IHN1YnNldHNcblx0XHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lczogc3RyaW5nW10gPSBbXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hZnJpY2FcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFudGFyY3RpY2FcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFzaWFcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZFwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYmFja3dhcmQtdXRjXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1ldGNldGVyYVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXVyb3BlXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1ub3J0aGFtZXJpY2FcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLXBhY2lmaWNuZXdcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLXNvdXRoYW1lcmljYVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtc3lzdGVtdlwiXG5cdFx0XHRcdFx0XTtcblx0XHRcdFx0XHRtb2R1bGVOYW1lcy5mb3JFYWNoKChtb2R1bGVOYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGQgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG5vdGhpbmdcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgdGhpcyBkYXRhYmFzZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbnN0YW5jZSgpOiBUekRhdGFiYXNlIHtcblx0XHRpZiAoIVR6RGF0YWJhc2UuX2luc3RhbmNlKSB7XG5cdFx0XHRUekRhdGFiYXNlLmluaXQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIFR6RGF0YWJhc2UuX2luc3RhbmNlIGFzIFR6RGF0YWJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogVGltZSB6b25lIGRhdGFiYXNlIGRhdGFcblx0ICovXG5cdHByaXZhdGUgX2RhdGE6IGFueTtcblxuXHQvKipcblx0ICogQ2FjaGVkIG1pbi9tYXggRFNUIHZhbHVlc1xuXHQgKi9cblx0cHJpdmF0ZSBfbWlubWF4OiBNaW5NYXhJbmZvO1xuXG5cdC8qKlxuXHQgKiBDYWNoZWQgem9uZSBuYW1lc1xuXHQgKi9cblx0cHJpdmF0ZSBfem9uZU5hbWVzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcblx0ICovXG5cdHByaXZhdGUgY29uc3RydWN0b3IoZGF0YTogYW55W10pIHtcblx0XHRhc3NlcnQoIVR6RGF0YWJhc2UuX2luc3RhbmNlLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcblx0XHRhc3NlcnQoXG5cdFx0XHRkYXRhLmxlbmd0aCA+IDAsXG5cdFx0XHRcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCJcblx0XHQpO1xuXHRcdGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGhpcy5fZGF0YSA9IGRhdGFbMF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2RhdGEgPSB7IHpvbmVzOiB7fSwgcnVsZXM6IHt9IH07XG5cdFx0XHRkYXRhLmZvckVhY2goKGQ6IGFueSk6IHZvaWQgPT4ge1xuXHRcdFx0XHRpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnJ1bGVzKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkLnpvbmVzKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS56b25lc1trZXldID0gZC56b25lc1trZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRoaXMuX21pbm1heCA9IHZhbGlkYXRlRGF0YSh0aGlzLl9kYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgc29ydGVkIGxpc3Qgb2YgYWxsIHpvbmUgbmFtZXNcblx0ICovXG5cdHB1YmxpYyB6b25lTmFtZXMoKTogc3RyaW5nW10ge1xuXHRcdGlmICghdGhpcy5fem9uZU5hbWVzKSB7XG5cdFx0XHR0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcblx0XHRcdHRoaXMuX3pvbmVOYW1lcy5zb3J0KCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl96b25lTmFtZXM7XG5cdH1cblxuXHRwdWJsaWMgZXhpc3RzKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXG5cdCAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cblx0ICpcblx0ICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxuXHQgKi9cblx0cHVibGljIG1pbkRzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHpvbmVOYW1lKSB7XG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0XHRsZXQgcmVzdWx0OiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IHJ1bGVOYW1lczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2Ygem9uZUluZm9zKSB7XG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XG5cdFx0XHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRjb25zdCB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcnVsZUluZm8gb2YgdGVtcCkge1xuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby5zYXZlLm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5taW5Ec3RTYXZlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXG5cdCAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cblx0ICpcblx0ICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcblx0ICovXG5cdHB1YmxpYyBtYXhEc3RTYXZlKHpvbmVOYW1lPzogc3RyaW5nKTogRHVyYXRpb24ge1xuXHRcdGlmICh6b25lTmFtZSkge1xuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdFx0bGV0IHJlc3VsdDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxuXHRcdFx0XHRcdCYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHRlbXApIHtcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBydWxlSW5mby5zYXZlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5tYXhEc3RTYXZlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcblx0ICovXG5cdHB1YmxpYyBoYXNEc3Qoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XG5cdH1cblxuXHQvKipcblx0ICogRmlyc3QgRFNUIGNoYW5nZSBtb21lbnQgQUZURVIgdGhlIGdpdmVuIFVUQyBkYXRlIGluIFVUQyBtaWxsaXNlY29uZHMsIHdpdGhpbiBvbmUgeWVhcixcblx0ICogcmV0dXJucyB1bmRlZmluZWQgaWYgbm8gc3VjaCBjaGFuZ2Vcblx0ICovXG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCk6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgdXRjVGltZTogVGltZVN0cnVjdCA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGEpIDogYSk7XG5cblx0XHQvLyBnZXQgYWxsIHpvbmUgaW5mb3MgZm9yIFtkYXRlLCBkYXRlKzF5ZWFyKVxuXHRcdGNvbnN0IGFsbFpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcblx0XHRjb25zdCByZWxldmFudFpvbmVJbmZvczogWm9uZUluZm9bXSA9IFtdO1xuXHRcdGNvbnN0IHJhbmdlU3RhcnQ6IG51bWJlciA9IHV0Y1RpbWUudW5peE1pbGxpcztcblx0XHRjb25zdCByYW5nZUVuZDogbnVtYmVyID0gcmFuZ2VTdGFydCArIDM2NSAqIDg2NDAwRTM7XG5cdFx0bGV0IHByZXZFbmQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIGFsbFpvbmVJbmZvcykge1xuXHRcdFx0aWYgKChwcmV2RW5kID09PSB1bmRlZmluZWQgfHwgcHJldkVuZCA8IHJhbmdlRW5kKSAmJiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHJhbmdlU3RhcnQpKSB7XG5cdFx0XHRcdHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xuXHRcdFx0fVxuXHRcdFx0cHJldkVuZCA9IHpvbmVJbmZvLnVudGlsO1xuXHRcdH1cblxuXHRcdC8vIGNvbGxlY3QgYWxsIHRyYW5zaXRpb25zIGluIHRoZSB6b25lcyBmb3IgdGhlIHllYXJcblx0XHRsZXQgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IFtdO1xuXHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2YgcmVsZXZhbnRab25lSW5mb3MpIHtcblx0XHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcblx0XHRcdHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KFxuXHRcdFx0XHR0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZilcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHRyYW5zaXRpb25zLnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xuXHRcdH0pO1xuXG5cdFx0Ly8gZmluZCB0aGUgZmlyc3QgYWZ0ZXIgdGhlIGdpdmVuIGRhdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgb2Zmc2V0XG5cdFx0bGV0IHByZXZTYXZlOiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IHRyYW5zaXRpb24gb2YgdHJhbnNpdGlvbnMpIHtcblx0XHRcdGlmICghcHJldlNhdmUgfHwgIXByZXZTYXZlLmVxdWFscyh0cmFuc2l0aW9uLm9mZnNldCkpIHtcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJhbnNpdGlvbi5hdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cHJldlNhdmUgPSB0cmFuc2l0aW9uLm9mZnNldDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBldmVudHVhbGx5IGxpbmtzIHRvXG5cdCAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxuXHQgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cblx0ICovXG5cdHB1YmxpYyB6b25lSXNVdGMoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XG5cdFx0bGV0IHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcblx0XHQvLyBmb2xsb3cgbGlua3Ncblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0aWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xuXHRcdFx0fVxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XG5cdFx0fVxuXHRcdHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZy9zdWJ0cmFjdGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdEEgbG9jYWwgdGltZSwgZWl0aGVyIGFzIGEgVGltZVN0cnVjdCBvciBhcyBhIHVuaXggbWlsbGlzZWNvbmQgdmFsdWVcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cC5cblx0ICpcblx0ICogQHJldHVyblx0VGhlIG5vcm1hbGl6ZWQgdGltZSwgaW4gdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBsb2NhbFRpbWUgcGFyYW1ldGVyIChUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzKVxuXHQgKi9cblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IFRpbWVTdHJ1Y3Q7XG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xuXHRcdGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcblx0XHRcdGNvbnN0IGxvY2FsVGltZTogVGltZVN0cnVjdCA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGEpIDogYSk7XG5cdFx0XHQvLyBsb2NhbCB0aW1lcyBiZWhhdmUgbGlrZSB0aGlzIGR1cmluZyBEU1QgY2hhbmdlczpcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XG5cdFx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXG5cblx0XHRcdC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXG5cdFx0XHQvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcblxuXHRcdFx0Ly8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcblx0XHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKFxuXHRcdFx0XHR6b25lTmFtZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgKyAxXG5cdFx0XHQpO1xuXG5cdFx0XHQvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xuXHRcdFx0bGV0IHByZXY6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0XHRmb3IgKGNvbnN0IHRyYW5zaXRpb24gb2YgdHJhbnNpdGlvbnMpIHtcblx0XHRcdFx0Ly8gZm9yd2FyZCB0cmFuc2l0aW9uP1xuXHRcdFx0XHRpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcblx0XHRcdFx0XHRjb25zdCBsb2NhbEJlZm9yZTogbnVtYmVyID0gdHJhbnNpdGlvbi5hdCArIHByZXYubWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxBZnRlcjogbnVtYmVyID0gdHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuXHRcdFx0XHRcdGlmIChsb2NhbFRpbWUudW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiBsb2NhbFRpbWUudW5peE1pbGxpcyA8IGxvY2FsQWZ0ZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGZvcndhcmRDaGFuZ2UgPSB0cmFuc2l0aW9uLm9mZnNldC5zdWIocHJldik7XG5cdFx0XHRcdFx0XHQvLyBub24tZXhpc3RpbmcgdGltZVxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjdG9yOiBudW1iZXIgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0TWlsbGlzID0gbG9jYWxUaW1lLnVuaXhNaWxsaXMgKyBmYWN0b3IgKiBmb3J3YXJkQ2hhbmdlLm1pbGxpc2Vjb25kcygpO1xuXHRcdFx0XHRcdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBUaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG5vIG5vbi1leGlzdGluZyB0aW1lXG5cdFx0fVxuXHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cblx0ICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcblx0ICovXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xuXHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxuXHQgKiB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC5cblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxuXHQgKi9cblx0cHVibGljIHRvdGFsT2Zmc2V0KHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XG5cdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb247XG5cblx0XHRzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6IHtcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDoge1xuXHRcdFx0XHRkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgUnVsZVR5cGUuUnVsZU5hbWU6IHtcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gdGhpcy5kc3RPZmZzZXRGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGRlZmF1bHQ6IC8vIGNhbm5vdCBoYXBwZW4sIGJ1dCB0aGUgY29tcGlsZXIgZG9lc250IHJlYWxpemUgaXRcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIHJ1bGUgYWJicmV2aWF0aW9uLCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXG5cdCAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XG5cdCAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMgdW5peCBtaWxsaXNlY29uZHNcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuXHQgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XG5cdCAqL1xuXHRwdWJsaWMgYWJicmV2aWF0aW9uKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xuXHRcdGNvbnN0IGZvcm1hdDogc3RyaW5nID0gem9uZUluZm8uZm9ybWF0O1xuXG5cdFx0Ly8gaXMgZm9ybWF0IGRlcGVuZGVudCBvbiBEU1Q/XG5cdFx0aWYgKGZvcm1hdC5pbmRleE9mKFwiJXNcIikgIT09IC0xXG5cdFx0XHQmJiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcblx0XHRcdGxldCBsZXR0ZXI6IHN0cmluZztcblx0XHRcdC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcblx0XHRcdGlmIChkc3REZXBlbmRlbnQpIHtcblx0XHRcdFx0bGV0dGVyID0gdGhpcy5sZXR0ZXJGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLCB6b25lSW5mby5nbXRvZmYpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0dGVyID0gXCJcIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZvcm1hdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBleGNsdWRpbmcgRFNULCBhdFxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLCBhZ2FpbiBleGNsdWRpbmcgRFNULlxuXHQgKlxuXHQgKiBJZiB0aGUgbG9jYWwgdGltZXN0YW1wIGV4aXN0cyB0d2ljZSAoYXMgY2FuIG9jY3VyIHZlcnkgcmFyZWx5IGR1ZSB0byB6b25lIGNoYW5nZXMpXG5cdCAqIHRoZW4gdGhlIGZpcnN0IG9jY3VycmVuY2UgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xuXHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XG5cdFx0XHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZSBpcyBub3JtYWxpemVkIG91dC5cblx0ICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxuXHQgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcblx0ICovXG5cdHB1YmxpYyB0b3RhbE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XG5cdFx0Y29uc3Qgbm9ybWFsaXplZFRtOiBUaW1lU3RydWN0ID0gdGhpcy5ub3JtYWxpemVMb2NhbCh6b25lTmFtZSwgdHMpO1xuXG5cdFx0Ly8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcblxuXHRcdC8vIFRoZXJlZm9yZSBiaW5hcnkgc2VhcmNoIGRvZXMgbm90IGFwcGx5LiBMaW5lYXIgc2VhcmNoIHRocm91Z2ggdHJhbnNpdGlvbnNcblx0XHQvLyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBvZmZzZXQgdGhhdCBtYXRjaGVzXG5cblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyhcblx0XHRcdHpvbmVOYW1lLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyIC0gMSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciArIDFcblx0XHQpO1xuXHRcdGxldCBwcmV2OiBUcmFuc2l0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBwcmV2UHJldjogVHJhbnNpdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IHRyYW5zaXRpb24gb2YgdHJhbnNpdGlvbnMpIHtcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgPiBub3JtYWxpemVkVG0udW5peE1pbGxpcykge1xuXHRcdFx0XHQvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRwcmV2UHJldiA9IHByZXY7XG5cdFx0XHRwcmV2ID0gdHJhbnNpdGlvbjtcblx0XHR9XG5cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuXHRcdGlmIChwcmV2KSB7XG5cdFx0XHQvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcblx0XHRcdGlmIChwcmV2UHJldiAmJiBwcmV2UHJldi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldi5vZmZzZXQpKSB7XG5cdFx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZVxuXHRcdFx0XHRjb25zdCBkaWZmID0gcHJldlByZXYub2Zmc2V0LnN1YihwcmV2Lm9mZnNldCk7XG5cdFx0XHRcdGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKClcblx0XHRcdFx0XHQmJiBub3JtYWxpemVkVG0udW5peE1pbGxpcyA8IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKSArIGRpZmYubWlsbGlzZWNvbmRzKCkpIHtcblx0XHRcdFx0XHQvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXG5cdFx0XHRcdFx0cmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdGhpcyBjYW5ub3QgaGFwcGVuIGFzIHRoZSB0cmFuc2l0aW9ucyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYSB0cmFuc2l0aW9uIGF0IHRoZVxuXHRcdFx0Ly8gYmVnaW5uaW5nIG9mIHRoZSByZXF1ZXN0ZWQgZnJvbVllYXJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5ob3VycygwKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW5cblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcblx0ICpcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBkc3RPZmZzZXRGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XG5cblx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxuXHRcdFx0cnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXRcblx0XHQpO1xuXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXG5cdFx0bGV0IG9mZnNldDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XG5cdFx0XHRcdG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdGlmICghb2Zmc2V0KSB7XG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cblx0XHRcdG9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9mZnNldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0aW1lIHpvbmUgbGV0dGVyIGZvciB0aGUgZ2l2ZW5cblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcblx0ICpcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXAgYXMgVGltZVN0cnVjdCBvciB1bml4IG1pbGxpc1xuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxuXHQgKi9cblx0cHVibGljIGxldHRlckZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogc3RyaW5nIHtcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XG5cdFx0KTtcblxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxuXHRcdGxldCBsZXR0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGxldCBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcblx0XHRcdFx0bGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdGlmICghbGV0dGVyKSB7XG5cdFx0XHQvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cblx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxldHRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBsaXN0IG9mIGFsbCB0cmFuc2l0aW9ucyBpbiBbZnJvbVllYXIuLnRvWWVhcl0gc29ydGVkIGJ5IGVmZmVjdGl2ZSBkYXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiB0aGUgcnVsZSBzZXRcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3Jcblx0ICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3Jcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcblx0ICpcblx0ICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxuXHQgKi9cblx0cHVibGljIGdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogVHJhbnNpdGlvbltdIHtcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xuXG5cdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3MocnVsZU5hbWUpO1xuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XG5cblx0XHRmb3IgKGxldCB5ID0gZnJvbVllYXI7IHkgPD0gdG9ZZWFyOyB5KyspIHtcblx0XHRcdGxldCBwcmV2SW5mbzogUnVsZUluZm8gfCB1bmRlZmluZWQ7XG5cdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHJ1bGVJbmZvcykge1xuXHRcdFx0XHRpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKFxuXHRcdFx0XHRcdFx0cnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMoeSwgc3RhbmRhcmRPZmZzZXQsIHByZXZJbmZvKSxcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLnNhdmUsXG5cdFx0XHRcdFx0XHRydWxlSW5mby5sZXR0ZXIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRwcmV2SW5mbyA9IHJ1bGVJbmZvO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxuXHQgKiBBZGRzIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBpZiB0aGVyZSBpcyBubyB6b25lIGNoYW5nZSB3aXRoaW4gdGhlIHJhbmdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Rmlyc3QgeWVhciB0byBpbmNsdWRlXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIpOiBUcmFuc2l0aW9uW10ge1xuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XG5cblx0XHRjb25zdCBzdGFydE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogZnJvbVllYXIgfSk7XG5cdFx0Y29uc3QgZW5kTWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB0b1llYXIgKyAxIH0pO1xuXG5cblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0YXNzZXJ0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xuXG5cdFx0Y29uc3QgcmVzdWx0OiBUcmFuc2l0aW9uW10gPSBbXTtcblxuXHRcdGxldCBwcmV2Wm9uZTogWm9uZUluZm8gfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHByZXZVbnRpbFllYXI6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcHJldlN0ZE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcblx0XHRsZXQgcHJldkRzdE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcblx0XHRsZXQgcHJldkxldHRlcjogc3RyaW5nID0gXCJcIjtcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xuXHRcdFx0Y29uc3QgdW50aWxZZWFyOiBudW1iZXIgPSB6b25lSW5mby51bnRpbCAhPT0gdW5kZWZpbmVkID8gbmV3IFRpbWVTdHJ1Y3Qoem9uZUluZm8udW50aWwpLmNvbXBvbmVudHMueWVhciA6IHRvWWVhciArIDE7XG5cdFx0XHRsZXQgc3RkT2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZTdGRPZmZzZXQ7XG5cdFx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZEc3RPZmZzZXQ7XG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgPSBwcmV2TGV0dGVyO1xuXG5cdFx0XHQvLyB6b25lIGFwcGxpY2FibGU/XG5cdFx0XHRpZiAoKCFwcmV2Wm9uZSB8fCBwcmV2Wm9uZS51bnRpbCEgPCBlbmRNaWxsaXMgLSAxKSAmJiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+PSBzdGFydE1pbGxpcykpIHtcblxuXHRcdFx0XHRzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XG5cblx0XHRcdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZTpcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0XHRcdFx0bGV0dGVyID0gXCJcIjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxuXHRcdFx0XHRcdFx0Ly8gKGUuZy4gTHliaWEpXG5cdFx0XHRcdFx0XHRpZiAocHJldlpvbmUpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHJ1bGVJbmZvcykge1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcHJldlVudGlsWWVhciA9PT0gXCJudW1iZXJcIiAmJiBydWxlSW5mby5hcHBsaWNhYmxlKHByZXZVbnRpbFllYXIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMocHJldlVudGlsWWVhciwgc3RkT2Zmc2V0LCB1bmRlZmluZWQpID09PSBwcmV2Wm9uZS51bnRpbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBydWxlSW5mby5zYXZlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGFkZCBhIHRyYW5zaXRpb24gZm9yIHRoZSB6b25lIHRyYW5zaXRpb25cblx0XHRcdFx0Y29uc3QgYXQ6IG51bWJlciA9IChwcmV2Wm9uZSAmJiBwcmV2Wm9uZS51bnRpbCAhPT0gdW5kZWZpbmVkID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xuXG5cdFx0XHRcdC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcblx0XHRcdFx0XHRjb25zdCBkc3RUcmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXG5cdFx0XHRcdFx0XHR6b25lSW5mby5ydWxlTmFtZSxcblx0XHRcdFx0XHRcdHByZXZVbnRpbFllYXIgIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByZXZVbnRpbFllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLFxuXHRcdFx0XHRcdFx0TWF0aC5taW4odW50aWxZZWFyLCB0b1llYXIpLFxuXHRcdFx0XHRcdFx0c3RkT2Zmc2V0XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHRyYW5zaXRpb24gb2YgZHN0VHJhbnNpdGlvbnMpIHtcblx0XHRcdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbih0cmFuc2l0aW9uLmF0LCB0cmFuc2l0aW9uLm9mZnNldC5hZGQoc3RkT2Zmc2V0KSwgdHJhbnNpdGlvbi5sZXR0ZXIpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cHJldlpvbmUgPSB6b25lSW5mbztcblx0XHRcdHByZXZVbnRpbFllYXIgPSB1bnRpbFllYXI7XG5cdFx0XHRwcmV2U3RkT2Zmc2V0ID0gc3RkT2Zmc2V0O1xuXHRcdFx0cHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcblx0XHRcdHByZXZMZXR0ZXIgPSBsZXR0ZXI7XG5cdFx0fVxuXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFRyYW5zaXRpb24sIGI6IFRyYW5zaXRpb24pOiBudW1iZXIgPT4ge1xuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSB6b25lIGluZm8gZm9yIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLiBUaHJvd3MgaWYgbm90IGZvdW5kLlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxuXHQgKiBAcmV0dXJuc1x0Wm9uZUluZm8gb2JqZWN0LiBEbyBub3QgY2hhbmdlLCB3ZSBjYWNoZSB0aGlzIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXRab25lSW5mbyh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogWm9uZUluZm8ge1xuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyB1dGNUaW1lIDogdXRjVGltZS51bml4TWlsbGlzKTtcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xuXHRcdFx0XHRyZXR1cm4gem9uZUluZm87XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0aWYgKHRydWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxuXHQgKi9cblx0cHJpdmF0ZSBfem9uZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFpvbmVJbmZvW10gfSA9IHt9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXG5cdCAqIGZvbGxvd2luZyBhbnkgbGlua3MuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxuXHQgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Wm9uZUluZm9zKHpvbmVOYW1lOiBzdHJpbmcpOiBab25lSW5mb1tdIHtcblx0XHQvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBUYWtlIGZyb20gY2FjaGVcblx0XHRpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcblx0XHR9XG5cblx0XHRjb25zdCByZXN1bHQ6IFpvbmVJbmZvW10gPSBbXTtcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xuXHRcdGxldCB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XG5cdFx0Ly8gZm9sbG93IGxpbmtzXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcblx0XHRcdH1cblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xuXHRcdH1cblx0XHQvLyBmaW5hbCB6b25lIGluZm8gZm91bmRcblx0XHRmb3IgKGNvbnN0IHpvbmVFbnRyeSBvZiB6b25lRW50cmllcykge1xuXHRcdFx0Y29uc3QgcnVsZVR5cGU6IFJ1bGVUeXBlID0gdGhpcy5wYXJzZVJ1bGVUeXBlKHpvbmVFbnRyeVsxXSk7XG5cdFx0XHRsZXQgdW50aWw6IG51bWJlciB8IHVuZGVmaW5lZCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcblx0XHRcdGlmIChpc05hTih1bnRpbCkpIHtcblx0XHRcdFx0dW50aWwgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhcblx0XHRcdFx0RHVyYXRpb24ubWludXRlcygtMSAqIG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzBdKSksXG5cdFx0XHRcdHJ1bGVUeXBlLFxuXHRcdFx0XHRydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0ID8gbmV3IER1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgRHVyYXRpb24oKSxcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lID8gem9uZUVudHJ5WzFdIDogXCJcIixcblx0XHRcdFx0em9uZUVudHJ5WzJdLFxuXHRcdFx0XHR1bnRpbFxuXHRcdFx0KSk7XG5cdFx0fVxuXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFpvbmVJbmZvLCBiOiBab25lSW5mbyk6IG51bWJlciA9PiB7XG5cdFx0XHQvLyBzb3J0IHVuZGVmaW5lZCBsYXN0XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGEudW50aWwgIT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gKGEudW50aWwhIC0gYi51bnRpbCEpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogcnVsZSBpbmZvIGNhY2hlXG5cdCAqL1xuXHRwcml2YXRlIF9ydWxlSW5mb0NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogUnVsZUluZm9bXSB9ID0ge307XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcblx0ICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxuXHQgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGdldFJ1bGVJbmZvcyhydWxlTmFtZTogc3RyaW5nKTogUnVsZUluZm9bXSB7XG5cdFx0Ly8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXG5cdFx0aWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBzZXQgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHQvLyByZXR1cm4gZnJvbSBjYWNoZVxuXHRcdGlmICh0aGlzLl9ydWxlSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xuXHRcdH1cblxuXHRcdGNvbnN0IHJlc3VsdDogUnVsZUluZm9bXSA9IFtdO1xuXHRcdGNvbnN0IHJ1bGVTZXQgPSB0aGlzLl9kYXRhLnJ1bGVzW3J1bGVOYW1lXTtcblx0XHRmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZVNldCkge1xuXG5cdFx0XHRjb25zdCBmcm9tWWVhcjogbnVtYmVyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xuXHRcdFx0Y29uc3QgdG9UeXBlOiBUb1R5cGUgPSB0aGlzLnBhcnNlVG9UeXBlKHJ1bGVbMV0pO1xuXHRcdFx0Y29uc3QgdG9ZZWFyOiBudW1iZXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XG5cdFx0XHRjb25zdCBvblR5cGU6IE9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XG5cdFx0XHRjb25zdCBvbkRheTogbnVtYmVyID0gdGhpcy5wYXJzZU9uRGF5KHJ1bGVbNF0sIG9uVHlwZSk7XG5cdFx0XHRjb25zdCBvbldlZWtEYXk6IFdlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xuXHRcdFx0Y29uc3QgbW9udGhOYW1lOiBzdHJpbmcgPSBydWxlWzNdIGFzIHN0cmluZztcblx0XHRcdGNvbnN0IG1vbnRoTnVtYmVyOiBudW1iZXIgPSBtb250aE5hbWVUb1N0cmluZyhtb250aE5hbWUpO1xuXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgUnVsZUluZm8oXG5cdFx0XHRcdGZyb21ZZWFyLFxuXHRcdFx0XHR0b1R5cGUsXG5cdFx0XHRcdHRvWWVhcixcblx0XHRcdFx0cnVsZVsyXSxcblx0XHRcdFx0bW9udGhOdW1iZXIsXG5cdFx0XHRcdG9uVHlwZSxcblx0XHRcdFx0b25EYXksXG5cdFx0XHRcdG9uV2Vla0RheSxcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzBdLCAxMCksIDI0KSwgLy8gbm90ZSB0aGUgZGF0YWJhc2Ugc29tZXRpbWVzIGNvbnRhaW5zIFwiMjRcIiBhcyBob3VyIHZhbHVlXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApLCA2MCksXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksXG5cdFx0XHRcdHRoaXMucGFyc2VBdFR5cGUocnVsZVs1XVszXSksXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSxcblx0XHRcdFx0cnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XVxuXHRcdFx0XHQpKTtcblxuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBSdWxlSW5mbywgYjogUnVsZUluZm8pOiBudW1iZXIgPT4ge1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRpZiAoYS5lZmZlY3RpdmVFcXVhbChiKSkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH0gZWxzZSBpZiAoYS5lZmZlY3RpdmVMZXNzKGIpKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlUnVsZVR5cGUocnVsZTogc3RyaW5nKTogUnVsZVR5cGUge1xuXHRcdGlmIChydWxlID09PSBcIi1cIikge1xuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk5vbmU7XG5cdFx0fSBlbHNlIGlmIChpc1ZhbGlkT2Zmc2V0U3RyaW5nKHJ1bGUpKSB7XG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuT2Zmc2V0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VUb1R5cGUodG86IHN0cmluZyk6IFRvVHlwZSB7XG5cdFx0aWYgKHRvID09PSBcIm1heFwiKSB7XG5cdFx0XHRyZXR1cm4gVG9UeXBlLk1heDtcblx0XHR9IGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcblx0XHR9IGVsc2UgaWYgKCFpc05hTihwYXJzZUludCh0bywgMTApKSkge1xuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUTyBjb2x1bW4gaW5jb3JyZWN0OiBcIiArIHRvKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZU9uVHlwZShvbjogc3RyaW5nKTogT25UeXBlIHtcblx0XHRpZiAob24ubGVuZ3RoID4gNCAmJiBvbi5zdWJzdHIoMCwgNCkgPT09IFwibGFzdFwiKSB7XG5cdFx0XHRyZXR1cm4gT25UeXBlLkxhc3RYO1xuXHRcdH1cblx0XHRpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xuXHRcdFx0cmV0dXJuIE9uVHlwZS5MZXFYO1xuXHRcdH1cblx0XHRpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xuXHRcdFx0cmV0dXJuIE9uVHlwZS5HcmVxWDtcblx0XHR9XG5cdFx0cmV0dXJuIE9uVHlwZS5EYXlOdW07XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VPbkRheShvbjogc3RyaW5nLCBvblR5cGU6IE9uVHlwZSk6IG51bWJlciB7XG5cdFx0c3dpdGNoIChvblR5cGUpIHtcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XG5cdFx0XHRjYXNlIE9uVHlwZS5MZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI8PVwiKSArIDIpLCAxMCk7XG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPj1cIikgKyAyKSwgMTApO1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VPbldlZWtEYXkob246IHN0cmluZyk6IFdlZWtEYXkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XG5cdFx0XHRpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcblx0XHRcdFx0cmV0dXJuIGkgYXMgV2Vla0RheTtcblx0XHRcdH1cblx0XHR9XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0cmV0dXJuIFdlZWtEYXkuU3VuZGF5O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlQXRUeXBlKGF0OiBhbnkpOiBBdFR5cGUge1xuXHRcdHN3aXRjaCAoYXQpIHtcblx0XHRcdGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XG5cdFx0XHRjYXNlIFwidVwiOiByZXR1cm4gQXRUeXBlLlV0Yztcblx0XHRcdGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xuXHRcdFx0Y2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XG5cdFx0XHRjYXNlIFwid1wiOiByZXR1cm4gQXRUeXBlLldhbGw7XG5cdFx0XHRjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIEF0VHlwZS5XYWxsO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn1cblxuaW50ZXJmYWNlIE1pbk1heEluZm8ge1xuXHRtaW5Ec3RTYXZlOiBudW1iZXI7XG5cdG1heERzdFNhdmU6IG51bWJlcjtcblx0bWluR210T2ZmOiBudW1iZXI7XG5cdG1heEdtdE9mZjogbnVtYmVyO1xufVxuXG4vKipcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YTogYW55KTogTWluTWF4SW5mbyB7XG5cdGNvbnN0IHJlc3VsdDogUGFydGlhbDxNaW5NYXhJbmZvPiA9IHt9O1xuXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xuXHR9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHJ1bGVzIHByb3BlcnR5XCIpO1xuXHR9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJ6b25lc1wiKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xuXHR9XG5cblx0Ly8gdmFsaWRhdGUgem9uZXNcblx0Zm9yIChjb25zdCB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XG5cdFx0aWYgKGRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XG5cdFx0XHRjb25zdCB6b25lQXJyOiBhbnkgPSBkYXRhLnpvbmVzW3pvbmVOYW1lXTtcblx0XHRcdGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lQXJyIGFzIHN0cmluZykpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyB6b25lQXJyIGFzIHN0cmluZyArIFwiXFxcIiBidXQgdGhhdCBkb2VzblxcJ3QgZXhpc3RcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoem9uZUFycikpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBlbnRyeTogYW55ID0gem9uZUFycltpXTtcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaGFzIGxlbmd0aCAhPSA0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzBdICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKGlzTmFOKGdtdG9mZikpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsxXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHNlY29uZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzJdICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nIG5vciBudWxsXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzNdID09PSBcInN0cmluZ1wiICYmIGlzTmFOKG1hdGguZmlsdGVyRmxvYXQoZW50cnlbM10pKSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhHbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4R210T2ZmID0gZ210b2ZmO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkdtdE9mZiA9PT0gdW5kZWZpbmVkIHx8IGdtdG9mZiA8IHJlc3VsdC5taW5HbXRPZmYpIHtcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gdmFsaWRhdGUgcnVsZXNcblx0Zm9yIChjb25zdCBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XG5cdFx0aWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XG5cdFx0XHRjb25zdCBydWxlQXJyOiBhbnkgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcblx0XHRcdH1cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZUFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBydWxlID0gcnVsZUFycltpXTtcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGUpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKHJ1bGVbMV0gIT09IFwib25seVwiICYmIHJ1bGVbMV0gIT09IFwibWF4XCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVsxXSwgMTApKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMV0gaXMgbm90IGEgbnVtYmVyLCBvbmx5IG9yIG1heFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKCFUek1vbnRoTmFtZXMuaGFzT3duUHJvcGVydHkocnVsZVszXSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXG5cdFx0XHRcdFx0JiYgcnVsZVs0XS5pbmRleE9mKFwiPD1cIikgPT09IC0xICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbNF0sIDEwKSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcblx0XHRcdFx0XHQmJiBydWxlWzVdWzNdICE9PSBcImdcIiAmJiBydWxlWzVdWzNdICE9PSBcInVcIiAmJiBydWxlWzVdWzNdICE9PSBcInpcIiAmJiBydWxlWzVdWzNdICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBzYXZlOiBudW1iZXIgPSBwYXJzZUludChydWxlWzZdLCAxMCk7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoaXNOYU4oc2F2ZSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNhdmUgIT09IDApIHtcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdC5tYXhEc3RTYXZlID0gc2F2ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdCBhcyBNaW5NYXhJbmZvO1xufVxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2RhdGV0aW1lXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9nbG9iYWxzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vcGFyc2VcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vcGVyaW9kXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lc291cmNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3RpbWV6b25lXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3R6LWRhdGFiYXNlXCI7XHJcbiJdfQ==
