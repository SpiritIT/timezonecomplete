(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright(c) 2016 ABB Switzerland Ltd.
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
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
    if (result > 3) { // greater than jan 4th
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
},{"./assert":1,"./javascript":7,"./math":9,"./strings":12}],3:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
        /**
         * Allow not using instanceof
         */
        this.kind = "DateTime";
        switch (typeof (a1)) {
            case "number":
                {
                    if (typeof a2 !== "number") {
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "for unix timestamp datetime constructor, third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "DateTime.DateTime(): second arg should be a TimeZone object.");
                        // unix timestamp constructor
                        this._zone = (typeof (a2) === "object" && isTimeZone(a2) ? a2 : undefined);
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
                        assert_1.default(timeZone === undefined || timeZone === null || isTimeZone(timeZone), "DateTime.DateTime(): eighth arg should be a TimeZone object.");
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
                        this._zone = (typeof (timeZone) === "object" && isTimeZone(timeZone) ? timeZone : undefined);
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
                        assert_1.default(a3 === undefined || a3 === null || isTimeZone(a3), "DateTime.DateTime(): third arg should be a TimeZone object.");
                        // format string given
                        var dateString = a1;
                        var formatString = a2;
                        var zone = void 0;
                        if (typeof a3 === "object" && isTimeZone(a3)) {
                            zone = (a3);
                        }
                        var parsed = parseFuncs.parse(dateString, formatString, zone);
                        this._zoneDate = parsed.time;
                        this._zone = parsed.zone;
                    }
                    else {
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first arguments is a string and the second is not, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "DateTime.DateTime(): second arg should be a TimeZone object.");
                        var givenString = a1.trim();
                        var ss = DateTime._splitDateFromTimeZone(givenString);
                        assert_1.default(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                        if (isTimeZone(a2)) {
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
                    if (a1 instanceof Date) {
                        assert_1.default(h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first argument is a Date, therefore the fourth through 8th argument must be undefined");
                        assert_1.default(typeof (a2) === "number" && (a2 === javascript_1.DateFunctions.Get || a2 === javascript_1.DateFunctions.GetUTC), "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        assert_1.default(a3 === undefined || a3 === null || isTimeZone(a3), "DateTime.DateTime(): third arg should be a TimeZone object.");
                        var d = (a1);
                        var dk = (a2);
                        this._zone = (a3 ? a3 : undefined);
                        this._zoneDate = basics_1.TimeStruct.fromDate(d, dk);
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
                        }
                    }
                    else { // a1 instanceof TimeStruct
                        assert_1.default(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "first argument is a TimeStruct, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "expect a TimeZone as second argument");
                        this._zoneDate = a1.clone();
                        this._zone = (a2 ? a2 : undefined);
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
            if (!this._zone) { // if-statement satisfies the compiler
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
        if (typeof a1 === "number") {
            assert_1.default(typeof unit === "number", "expect number as second argument");
            var amount = a1;
            return this.add(-1 * amount, unit);
        }
        else {
            var duration = a1;
            return this.add(duration.multiply(-1));
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
     * specified format. See LDML.md for supported formats.
     *
     * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
     * @param locale Optional, non-english format month names etc.
     * @return The string representation of this DateTime
     */
    DateTime.prototype.format = function (formatString, locale) {
        return format.format(this.zoneDate, this.utcDate, this._zone, formatString, locale);
    };
    /**
     * Parse a date in a given format
     * @param s the string to parse
     * @param format the format the string is in. See LDML.md for supported formats.
     * @param zone Optional, the zone to add (if no zone is given in the string)
     * @param locale Optional, different settings for constants like 'AM' etc
     */
    DateTime.parse = function (s, format, zone, locale) {
        var parsed = parseFuncs.parse(s, format, zone, false, locale);
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
/**
 * Checks whether `a` is similar to a TimeZone without using the instanceof operator.
 * It checks for the availability of the functions used in the DateTime implementation
 * @param a the object to check
 * @returns a is TimeZone-like
 */
function isTimeZone(a) {
    if (a && typeof a === "object") {
        if (typeof a.normalizeZoneTime === "function"
            && typeof a.abbreviationForUtc === "function"
            && typeof a.standardOffsetForUtc === "function"
            && typeof a.identical === "function"
            && typeof a.equals === "function"
            && typeof a.kind === "function"
            && typeof a.clone === "function") {
            return true;
        }
    }
    return false;
}
},{"./assert":1,"./basics":2,"./duration":4,"./format":5,"./javascript":7,"./math":9,"./parse":10,"./timesource":13,"./timezone":14,"./tz-database":16}],4:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
        this.kind = "Duration";
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
},{"./assert":1,"./basics":2,"./strings":12}],5:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var basics = require("./basics");
var locale_1 = require("./locale");
var strings = require("./strings");
var token_1 = require("./token");
/**
 * Format the supplied dateTime with the formatting string.
 *
 * @param dateTime The current time to format
 * @param utcTime The time in UTC
 * @param localZone The zone that currentTime is in
 * @param formatString The LDML format pattern (see LDML.md)
 * @param locale Other format options such as month names
 * @return string
 */
function format(dateTime, utcTime, localZone, formatString, locale) {
    if (locale === void 0) { locale = {}; }
    var mergedLocale = __assign({}, locale_1.DEFAULT_LOCALE, locale);
    var tokens = token_1.tokenize(formatString);
    var result = "";
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        var tokenResult = void 0;
        switch (token.type) {
            case token_1.TokenType.ERA:
                tokenResult = _formatEra(dateTime, token, mergedLocale);
                break;
            case token_1.TokenType.YEAR:
                tokenResult = _formatYear(dateTime, token);
                break;
            case token_1.TokenType.QUARTER:
                tokenResult = _formatQuarter(dateTime, token, mergedLocale);
                break;
            case token_1.TokenType.MONTH:
                tokenResult = _formatMonth(dateTime, token, mergedLocale);
                break;
            case token_1.TokenType.DAY:
                tokenResult = _formatDay(dateTime, token);
                break;
            case token_1.TokenType.WEEKDAY:
                tokenResult = _formatWeekday(dateTime, token, mergedLocale);
                break;
            case token_1.TokenType.DAYPERIOD:
                tokenResult = _formatDayPeriod(dateTime, token, mergedLocale);
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
function _formatEra(dateTime, token, locale) {
    var AD = dateTime.year > 0;
    switch (token.length) {
        case 1:
        case 2:
        case 3:
            return (AD ? locale.eraAbbreviated[0] : locale.eraAbbreviated[1]);
        case 4:
            return (AD ? locale.eraWide[0] : locale.eraWide[1]);
        case 5:
            return (AD ? locale.eraNarrow[0] : locale.eraNarrow[1]);
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
            if (token.length === 2) { // Special case: exactly two characters are expected
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
function _formatQuarter(dateTime, token, locale) {
    var quarter = Math.ceil(dateTime.month / 3);
    switch (token.symbol) {
        case "Q":
            switch (token.length) {
                case 1:
                case 2:
                    return strings.padLeft(quarter.toString(), 2, "0");
                case 3:
                    return locale.quarterLetter + quarter;
                case 4:
                    return locale.quarterAbbreviations[quarter - 1] + " " + locale.quarterWord;
                case 5:
                    return quarter.toString();
                /* istanbul ignore next */
                default:
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
            }
        case "q":
            switch (token.length) {
                case 1:
                case 2:
                    return strings.padLeft(quarter.toString(), 2, "0");
                case 3:
                    return locale.standAloneQuarterLetter + quarter;
                case 4:
                    return locale.standAloneQuarterAbbreviations[quarter - 1] + " " + locale.standAloneQuarterWord;
                case 5:
                    return quarter.toString();
                /* istanbul ignore next */
                default:
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
            }
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid quarter pattern");
    }
}
/**
 * Format the month
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatMonth(dateTime, token, locale) {
    switch (token.symbol) {
        case "M":
            switch (token.length) {
                case 1:
                case 2:
                    return strings.padLeft(dateTime.month.toString(), token.length, "0");
                case 3:
                    return locale.shortMonthNames[dateTime.month - 1];
                case 4:
                    return locale.longMonthNames[dateTime.month - 1];
                case 5:
                    return locale.monthLetters[dateTime.month - 1];
                /* istanbul ignore next */
                default:
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
            }
        case "L":
            switch (token.length) {
                case 1:
                case 2:
                    return strings.padLeft(dateTime.month.toString(), token.length, "0");
                case 3:
                    return locale.standAloneShortMonthNames[dateTime.month - 1];
                case 4:
                    return locale.standAloneLongMonthNames[dateTime.month - 1];
                case 5:
                    return locale.standAloneMonthLetters[dateTime.month - 1];
                /* istanbul ignore next */
                default:
                    // tokenizer should prevent this
                    /* istanbul ignore next */
                    return token.raw;
            }
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid month pattern");
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
function _formatWeekday(dateTime, token, locale) {
    var weekDayNumber = basics.weekDayNoLeapSecs(dateTime.unixMillis);
    switch (token.length) {
        case 1:
        case 2:
            if (token.symbol === "e") {
                return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.unixMillis).toString(), token.length, "0");
            }
            else {
                return locale.shortWeekdayNames[weekDayNumber];
            }
        case 3:
            return locale.shortWeekdayNames[weekDayNumber];
        case 4:
            return locale.longWeekdayNames[weekDayNumber];
        case 5:
            return locale.weekdayLetters[weekDayNumber];
        case 6:
            return locale.weekdayTwoLetters[weekDayNumber];
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
function _formatDayPeriod(dateTime, token, locale) {
    switch (token.symbol) {
        case "a": {
            if (token.length <= 3) {
                if (dateTime.hour < 12) {
                    return locale.dayPeriodAbbreviated.am;
                }
                else {
                    return locale.dayPeriodAbbreviated.pm;
                }
            }
            else if (token.length === 4) {
                if (dateTime.hour < 12) {
                    return locale.dayPeriodWide.am;
                }
                else {
                    return locale.dayPeriodWide.pm;
                }
            }
            else {
                if (dateTime.hour < 12) {
                    return locale.dayPeriodNarrow.am;
                }
                else {
                    return locale.dayPeriodNarrow.pm;
                }
            }
        }
        case "b":
        case "B": {
            if (token.length <= 3) {
                if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodAbbreviated.midnight;
                }
                else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodAbbreviated.noon;
                }
                else if (dateTime.hour < 12) {
                    return locale.dayPeriodAbbreviated.am;
                }
                else {
                    return locale.dayPeriodAbbreviated.pm;
                }
            }
            else if (token.length === 4) {
                if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodWide.midnight;
                }
                else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodWide.noon;
                }
                else if (dateTime.hour < 12) {
                    return locale.dayPeriodWide.am;
                }
                else {
                    return locale.dayPeriodWide.pm;
                }
            }
            else {
                if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodNarrow.midnight;
                }
                else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
                    return locale.dayPeriodNarrow.noon;
                }
                else if (dateTime.hour < 12) {
                    return locale.dayPeriodNarrow.am;
                }
                else {
                    return locale.dayPeriodNarrow.pm;
                }
            }
        }
        /* istanbul ignore next */
        default:
            // tokenizer should prevent this
            /* istanbul ignore next */
            return token.raw;
    }
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
            result = "GMT";
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
                    if (offset === 0) {
                        return "Z";
                    }
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
                case 4: // No seconds in our implementation, so this is the same
                    return offsetHoursString + offsetMinutesString;
                case 3:
                case 5: // No seconds in our implementation, so this is the same
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
},{"./basics":2,"./locale":8,"./strings":12,"./token":15}],6:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Global functions depending on DateTime/Duration etc
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("./assert");
/**
 * Returns the minimum of two DateTimes or Durations
 */
function min(d1, d2) {
    assert_1.default(d1, "first argument is falsy");
    assert_1.default(d2, "second argument is falsy");
    /* istanbul ignore next */
    assert_1.default(d1.kind === d2.kind, "expected either two datetimes or two durations");
    return d1.min(d2);
}
exports.min = min;
/**
 * Returns the maximum of two DateTimes or Durations
 */
function max(d1, d2) {
    assert_1.default(d1, "first argument is falsy");
    assert_1.default(d2, "second argument is falsy");
    /* istanbul ignore next */
    assert_1.default(d1.kind === d2.kind, "expected either two datetimes or two durations");
    return d1.max(d2);
}
exports.max = max;
/**
 * Returns the absolute value of a Duration
 */
function abs(d) {
    assert_1.default(d, "first argument is falsy");
    return d.abs();
}
exports.abs = abs;
},{"./assert":1}],7:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
"use strict";
/**
 * Copyright(c) 2017 ABB Switzerland Ltd.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERA_NAMES_NARROW = ["A", "B"];
exports.ERA_NAMES_WIDE = ["Anno Domini", "Before Christ"];
exports.ERA_NAMES_ABBREVIATED = ["AD", "BC"];
exports.QUARTER_LETTER = "Q";
exports.QUARTER_WORD = "quarter";
exports.QUARTER_ABBREVIATIONS = ["1st", "2nd", "3rd", "4th"];
/**
 * In some languages, different words are necessary for stand-alone quarter names
 */
exports.STAND_ALONE_QUARTER_LETTER = exports.QUARTER_LETTER;
exports.STAND_ALONE_QUARTER_WORD = exports.QUARTER_WORD;
exports.STAND_ALONE_QUARTER_ABBREVIATIONS = exports.QUARTER_ABBREVIATIONS.slice();
exports.LONG_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
exports.SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
exports.MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
exports.STAND_ALONE_LONG_MONTH_NAMES = exports.LONG_MONTH_NAMES.slice();
exports.STAND_ALONE_SHORT_MONTH_NAMES = exports.SHORT_MONTH_NAMES.slice();
exports.STAND_ALONE_MONTH_LETTERS = exports.MONTH_LETTERS.slice();
exports.LONG_WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
exports.SHORT_WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
exports.WEEKDAY_TWO_LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
exports.WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
exports.DAY_PERIODS_ABBREVIATED = { am: "AM", pm: "PM", noon: "noon", midnight: "mid." };
exports.DAY_PERIODS_WIDE = { am: "AM", pm: "PM", noon: "noon", midnight: "midnight" };
exports.DAY_PERIODS_NARROW = { am: "A", pm: "P", noon: "noon", midnight: "md" };
exports.DEFAULT_LOCALE = {
    eraNarrow: exports.ERA_NAMES_NARROW,
    eraWide: exports.ERA_NAMES_WIDE,
    eraAbbreviated: exports.ERA_NAMES_ABBREVIATED,
    quarterLetter: exports.QUARTER_LETTER,
    quarterWord: exports.QUARTER_WORD,
    quarterAbbreviations: exports.QUARTER_ABBREVIATIONS,
    standAloneQuarterLetter: exports.STAND_ALONE_QUARTER_LETTER,
    standAloneQuarterWord: exports.STAND_ALONE_QUARTER_WORD,
    standAloneQuarterAbbreviations: exports.STAND_ALONE_QUARTER_ABBREVIATIONS,
    longMonthNames: exports.LONG_MONTH_NAMES,
    shortMonthNames: exports.SHORT_MONTH_NAMES,
    monthLetters: exports.MONTH_LETTERS,
    standAloneLongMonthNames: exports.STAND_ALONE_LONG_MONTH_NAMES,
    standAloneShortMonthNames: exports.STAND_ALONE_SHORT_MONTH_NAMES,
    standAloneMonthLetters: exports.STAND_ALONE_MONTH_LETTERS,
    longWeekdayNames: exports.LONG_WEEKDAY_NAMES,
    shortWeekdayNames: exports.SHORT_WEEKDAY_NAMES,
    weekdayTwoLetters: exports.WEEKDAY_TWO_LETTERS,
    weekdayLetters: exports.WEEKDAY_LETTERS,
    dayPeriodAbbreviated: exports.DAY_PERIODS_ABBREVIATED,
    dayPeriodWide: exports.DAY_PERIODS_WIDE,
    dayPeriodNarrow: exports.DAY_PERIODS_NARROW
};
},{}],9:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
},{"./assert":1}],10:[function(require,module,exports){
"use strict";
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var basics_1 = require("./basics");
var locale_1 = require("./locale");
var timezone_1 = require("./timezone");
var token_1 = require("./token");
/**
 * Checks if a given datetime string is according to the given format
 * @param dateTimeString The string to test
 * @param formatString LDML format string (see LDML.md)
 * @param allowTrailing Allow trailing string after the date+time
 * @param locale Locale-specific constants such as month names
 * @returns true iff the string is valid
 */
function parseable(dateTimeString, formatString, allowTrailing, locale) {
    if (allowTrailing === void 0) { allowTrailing = true; }
    if (locale === void 0) { locale = {}; }
    try {
        parse(dateTimeString, formatString, undefined, allowTrailing, locale);
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
 * @param locale Locale-specific constants such as month names
 * @return string
 */
function parse(dateTimeString, formatString, overrideZone, allowTrailing, locale) {
    if (allowTrailing === void 0) { allowTrailing = true; }
    if (locale === void 0) { locale = {}; }
    if (!dateTimeString) {
        throw new Error("no date given");
    }
    if (!formatString) {
        throw new Error("no format given");
    }
    var mergedLocale = __assign({}, locale_1.DEFAULT_LOCALE, locale);
    try {
        var tokens = token_1.tokenize(formatString);
        var time = { year: undefined };
        var zone = void 0;
        var pnr = void 0;
        var pzr = void 0;
        var dpr = void 0;
        var era = 1;
        var quarter = void 0;
        var remaining = dateTimeString;
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            switch (token.type) {
                case token_1.TokenType.ERA:
                    _a = stripEra(token, remaining, mergedLocale), era = _a[0], remaining = _a[1];
                    break;
                case token_1.TokenType.QUARTER:
                    {
                        var r = stripQuarter(token, remaining, mergedLocale);
                        quarter = r.n;
                        remaining = r.remaining;
                    }
                    break;
                /* istanbul ignore next */
                case token_1.TokenType.WEEKDAY:
                /* istanbul ignore next */
                case token_1.TokenType.WEEK:
                    /* istanbul ignore next */
                    break; // nothing to learn from this
                case token_1.TokenType.DAYPERIOD:
                    dpr = stripDayPeriod(token, remaining, mergedLocale);
                    remaining = dpr.remaining;
                    break;
                case token_1.TokenType.YEAR:
                    pnr = stripNumber(remaining, Infinity);
                    remaining = pnr.remaining;
                    time.year = pnr.n;
                    break;
                case token_1.TokenType.MONTH:
                    pnr = stripMonth(token, remaining, mergedLocale);
                    remaining = pnr.remaining;
                    time.month = pnr.n;
                    break;
                case token_1.TokenType.DAY:
                    pnr = stripNumber(remaining, 2);
                    remaining = pnr.remaining;
                    time.day = pnr.n;
                    break;
                case token_1.TokenType.HOUR:
                    pnr = stripHour(token, remaining);
                    remaining = pnr.remaining;
                    time.hour = pnr.n;
                    break;
                case token_1.TokenType.MINUTE:
                    pnr = stripNumber(remaining, 2);
                    remaining = pnr.remaining;
                    time.minute = pnr.n;
                    break;
                case token_1.TokenType.SECOND:
                    {
                        pnr = stripSecond(token, remaining);
                        remaining = pnr.remaining;
                        switch (token.symbol) {
                            case "s":
                                time.second = pnr.n;
                                break;
                            case "S":
                                time.milli = 1000 * parseFloat("0." + Math.floor(pnr.n).toString(10).slice(0, 3));
                                break;
                            case "A":
                                time.hour = Math.floor((pnr.n / 3600E3));
                                time.minute = Math.floor((pnr.n / 60E3) % 60);
                                time.second = Math.floor((pnr.n / 1000) % 60);
                                time.milli = pnr.n % 1000;
                                break;
                            /* istanbul ignore next */
                            default:
                                /* istanbul ignore next */
                                throw new Error("unsupported second format '" + token.raw + "'");
                        }
                    }
                    break;
                case token_1.TokenType.ZONE:
                    pzr = stripZone(token, remaining);
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
        if (dpr) {
            switch (dpr.type) {
                case "am":
                    if (time.hour !== undefined && time.hour >= 12) {
                        time.hour -= 12;
                    }
                    break;
                case "pm":
                    if (time.hour !== undefined && time.hour < 12) {
                        time.hour += 12;
                    }
                    break;
                case "noon":
                    if (time.hour === undefined || time.hour === 0) {
                        time.hour = 12;
                    }
                    if (time.minute === undefined) {
                        time.minute = 0;
                    }
                    if (time.second === undefined) {
                        time.second = 0;
                    }
                    if (time.milli === undefined) {
                        time.milli = 0;
                    }
                    if (time.hour !== 12 || time.minute !== 0 || time.second !== 0 || time.milli !== 0) {
                        throw new Error("invalid time, contains 'noon' specifier but time differs from noon");
                    }
                    break;
                case "midnight":
                    if (time.hour === undefined || time.hour === 12) {
                        time.hour = 0;
                    }
                    if (time.hour === 12) {
                        time.hour = 0;
                    }
                    if (time.minute === undefined) {
                        time.minute = 0;
                    }
                    if (time.second === undefined) {
                        time.second = 0;
                    }
                    if (time.milli === undefined) {
                        time.milli = 0;
                    }
                    if (time.hour !== 0 || time.minute !== 0 || time.second !== 0 || time.milli !== 0) {
                        throw new Error("invalid time, contains 'midnight' specifier but time differs from midnight");
                    }
                    break;
            }
        }
        if (time.year !== undefined) {
            time.year *= era;
        }
        if (quarter !== undefined) {
            if (time.month === undefined) {
                switch (quarter) {
                    case 1:
                        time.month = 1;
                        break;
                    case 2:
                        time.month = 4;
                        break;
                    case 3:
                        time.month = 7;
                        break;
                    case 4:
                        time.month = 10;
                        break;
                }
            }
            else {
                var error = false;
                switch (quarter) {
                    case 1:
                        error = !(time.month >= 1 && time.month <= 3);
                        break;
                    case 2:
                        error = !(time.month >= 4 && time.month <= 6);
                        break;
                    case 3:
                        error = !(time.month >= 7 && time.month <= 9);
                        break;
                    case 4:
                        error = !(time.month >= 10 && time.month <= 12);
                        break;
                }
                if (error) {
                    throw new Error("the quarter does not match the month");
                }
            }
        }
        if (time.year === undefined) {
            time.year = 1970;
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
            throw new Error("invalid date '" + dateTimeString + "' not according to format '" + formatString + "': trailing characters: '" + remaining + "'");
        }
        return result;
    }
    catch (e) {
        throw new Error("invalid date '" + dateTimeString + "' not according to format '" + formatString + "': " + e.message);
    }
    var _a;
}
exports.parse = parse;
var WHITESPACE = [" ", "\t", "\r", "\v", "\n"];
function stripZone(token, s) {
    var unsupported = (token.symbol === "z")
        || (token.symbol === "Z" && token.length === 5)
        || (token.symbol === "v")
        || (token.symbol === "V" && token.length !== 2)
        || (token.symbol === "x" && token.length >= 4)
        || (token.symbol === "X" && token.length >= 4);
    if (unsupported) {
        throw new Error("time zone pattern '" + token.raw + "' is not implemented");
    }
    var result = {
        remaining: s
    };
    // chop off "GMT" prefix if needed
    var hadGMT = false;
    if ((token.symbol === "Z" && token.length === 4) || token.symbol === "O") {
        if (result.remaining.toUpperCase().startsWith("GMT")) {
            result.remaining = result.remaining.slice(3);
            hadGMT = true;
        }
    }
    // parse any zone, regardless of specified format
    var zoneString = "";
    while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
        zoneString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    zoneString = zoneString.trim();
    if (zoneString) {
        // ensure chopping off GMT does not hide time zone errors (bit of a sloppy regex but OK)
        if (hadGMT && !zoneString.match(/[\+\-]?[\d\:]+/i)) {
            throw new Error("invalid time zone 'GMT" + zoneString + "'");
        }
        result.zone = timezone_1.TimeZone.zone(zoneString);
    }
    else {
        throw new Error("no time zone given");
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
function stripDayPeriod(token, remaining, locale) {
    var offsets;
    switch (token.symbol) {
        case "a":
            switch (token.length) {
                case 4:
                    offsets = (_a = {},
                        _a[locale.dayPeriodWide.am] = "am",
                        _a[locale.dayPeriodWide.pm] = "pm",
                        _a);
                    break;
                case 5:
                    offsets = (_b = {},
                        _b[locale.dayPeriodNarrow.am] = "am",
                        _b[locale.dayPeriodNarrow.pm] = "pm",
                        _b);
                    break;
                default:
                    offsets = (_c = {},
                        _c[locale.dayPeriodAbbreviated.am] = "am",
                        _c[locale.dayPeriodAbbreviated.pm] = "pm",
                        _c);
                    break;
            }
            break;
        default:
            switch (token.length) {
                case 4:
                    offsets = (_d = {},
                        _d[locale.dayPeriodWide.am] = "am",
                        _d[locale.dayPeriodWide.midnight] = "midnight",
                        _d[locale.dayPeriodWide.pm] = "pm",
                        _d[locale.dayPeriodWide.noon] = "noon",
                        _d);
                    break;
                case 5:
                    offsets = (_e = {},
                        _e[locale.dayPeriodNarrow.am] = "am",
                        _e[locale.dayPeriodNarrow.midnight] = "midnight",
                        _e[locale.dayPeriodNarrow.pm] = "pm",
                        _e[locale.dayPeriodNarrow.noon] = "noon",
                        _e);
                    break;
                default:
                    offsets = (_f = {},
                        _f[locale.dayPeriodAbbreviated.am] = "am",
                        _f[locale.dayPeriodAbbreviated.midnight] = "midnight",
                        _f[locale.dayPeriodAbbreviated.pm] = "pm",
                        _f[locale.dayPeriodAbbreviated.noon] = "noon",
                        _f);
                    break;
            }
            break;
    }
    // match longest possible day period string; sort keys by length descending
    var sortedKeys = Object.keys(offsets)
        .sort(function (a, b) { return (a.length < b.length ? 1 : a.length > b.length ? -1 : 0); });
    var upper = remaining.toUpperCase();
    for (var _i = 0, sortedKeys_1 = sortedKeys; _i < sortedKeys_1.length; _i++) {
        var key = sortedKeys_1[_i];
        if (upper.startsWith(key.toUpperCase())) {
            return {
                type: offsets[key],
                remaining: remaining.slice(key.length)
            };
        }
    }
    throw new Error("missing day period i.e. " + Object.keys(offsets).join(", "));
    var _a, _b, _c, _d, _e, _f;
}
/**
 * Returns factor -1 or 1 depending on BC or AD
 * @param token
 * @param remaining
 * @param locale
 * @returns [factor, remaining]
 */
function stripEra(token, remaining, locale) {
    var allowed;
    switch (token.length) {
        case 4:
            allowed = locale.eraWide;
            break;
        case 5:
            allowed = locale.eraNarrow;
            break;
        default:
            allowed = locale.eraAbbreviated;
            break;
    }
    var result = stripStrings(token, remaining, allowed);
    return [allowed.indexOf(result.chosen) === 0 ? 1 : -1, result.remaining];
}
function stripQuarter(token, remaining, locale) {
    var quarterLetter;
    var quarterWord;
    var quarterAbbreviations;
    switch (token.symbol) {
        case "Q":
            quarterLetter = locale.quarterLetter;
            quarterWord = locale.quarterWord;
            quarterAbbreviations = locale.quarterAbbreviations;
            break;
        case "q": {
            quarterLetter = locale.standAloneQuarterLetter;
            quarterWord = locale.standAloneQuarterWord;
            quarterAbbreviations = locale.standAloneQuarterAbbreviations;
            break;
        }
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid quarter pattern");
    }
    var allowed;
    switch (token.length) {
        case 1:
        case 5:
            return stripNumber(remaining, 1);
        case 2:
            return stripNumber(remaining, 2);
        case 3:
            allowed = [1, 2, 3, 4].map(function (n) { return quarterLetter + n.toString(10); });
            break;
        case 4:
            allowed = quarterAbbreviations.map(function (a) { return a + " " + quarterWord; });
            break;
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid quarter pattern");
    }
    var r = stripStrings(token, remaining, allowed);
    return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}
function stripMonth(token, remaining, locale) {
    var shortMonthNames;
    var longMonthNames;
    var monthLetters;
    switch (token.symbol) {
        case "M":
            shortMonthNames = locale.shortMonthNames;
            longMonthNames = locale.longMonthNames;
            monthLetters = locale.monthLetters;
            break;
        case "L":
            shortMonthNames = locale.standAloneShortMonthNames;
            longMonthNames = locale.standAloneLongMonthNames;
            monthLetters = locale.standAloneMonthLetters;
            break;
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid month pattern");
    }
    var allowed;
    switch (token.length) {
        case 1:
        case 2:
            return stripNumber(remaining, 2);
        case 3:
            allowed = shortMonthNames;
            break;
        case 4:
            allowed = longMonthNames;
            break;
        case 5:
            allowed = monthLetters;
            break;
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid month pattern");
    }
    var r = stripStrings(token, remaining, allowed);
    return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}
function stripHour(token, remaining) {
    var result = stripNumber(remaining, 2);
    switch (token.symbol) {
        case "h":
            if (result.n === 12) {
                result.n = 0;
            }
            break;
        case "H":
            // nothing, in range 0-23
            break;
        case "K":
            // nothing, in range 0-11
            break;
        case "k":
            result.n -= 1;
            break;
    }
    return result;
}
function stripSecond(token, remaining) {
    switch (token.symbol) {
        case "s":
            return stripNumber(remaining, 2);
        case "S":
            return stripNumber(remaining, token.length);
        case "A":
            return stripNumber(remaining, 8);
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw new Error("invalid seconds pattern");
    }
}
function stripNumber(s, maxLength) {
    var result = {
        n: NaN,
        remaining: s
    };
    var numberString = "";
    while (numberString.length < maxLength && result.remaining.length > 0 && result.remaining.charAt(0).match(/\d/)) {
        numberString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    // remove leading zeroes
    while (numberString.charAt(0) === "0" && numberString.length > 1) {
        numberString = numberString.substr(1);
    }
    result.n = parseInt(numberString, 10);
    if (numberString === "" || !Number.isFinite(result.n)) {
        throw new Error("expected a number but got '" + numberString + "'");
    }
    return result;
}
function stripStrings(token, remaining, allowed) {
    // match longest possible string; sort keys by length descending
    var sortedKeys = allowed.slice()
        .sort(function (a, b) { return (a.length < b.length ? 1 : a.length > b.length ? -1 : 0); });
    var upper = remaining.toUpperCase();
    for (var _i = 0, sortedKeys_2 = sortedKeys; _i < sortedKeys_2.length; _i++) {
        var key = sortedKeys_2[_i];
        if (upper.startsWith(key.toUpperCase())) {
            return {
                chosen: key,
                remaining: remaining.slice(key.length)
            };
        }
    }
    throw new Error("invalid " + token_1.TokenType[token.type].toLowerCase() + ", expected one of " + allowed.join(", "));
}
},{"./basics":2,"./locale":8,"./timezone":14,"./token":15}],11:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
},{"./assert":1,"./basics":2,"./datetime":3,"./duration":4,"./timezone":14}],12:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
},{}],13:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
},{}],14:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }) :
            typeof a === "undefined" ? new basics_1.TimeStruct({}) :
                a);
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
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }) :
            typeof a === "undefined" ? new basics_1.TimeStruct({}) :
                a);
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
        var localTime = (typeof a === "number" ? new basics_1.TimeStruct({ year: a, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli }) :
            typeof a === "undefined" ? new basics_1.TimeStruct({}) :
                a);
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
        if (typeof a !== "number" && !!a) {
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
        assert_1.default(t.match(/^[+-]\d$/) || t.match(/^[+-]\d\d$/) || t.match(/^[+-]\d\d(:?)\d\d$/), "Wrong time zone format: \"" + t + "\"");
        var sign = (t.charAt(0) === "+" ? 1 : -1);
        var hours = 0;
        var minutes = 0;
        switch (t.length) {
            case 2:
                hours = parseInt(t.slice(1, 2), 10);
                break;
            case 3:
                hours = parseInt(t.slice(1, 3), 10);
                break;
            case 5:
                hours = parseInt(t.slice(1, 3), 10);
                minutes = parseInt(t.slice(3, 5), 10);
                break;
            case 6:
                hours = parseInt(t.slice(1, 3), 10);
                minutes = parseInt(t.slice(4, 6), 10);
                break;
        }
        assert_1.default(hours >= 0 && hours < 24, "Invalid time zone (hours out of range): '" + t + "'");
        assert_1.default(minutes >= 0 && minutes < 60, "Invalid time zone (minutes out of range): '" + t + "'");
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
},{"./assert":1,"./basics":2,"./strings":12,"./tz-database":16}],15:[function(require,module,exports){
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
                else /* istanbul ignore else */ if (Array.isArray(info.lengths) && info.lengths.length > 0) {
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
    b: { type: TokenType.DAYPERIOD, maxLength: 5 },
    B: { type: TokenType.DAYPERIOD, maxLength: 5 },
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
},{}],16:[function(require,module,exports){
(function (global){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
            var g = void 0;
            if (typeof window !== "undefined") {
                g = window;
            }
            else if (typeof global !== "undefined") {
                g = global;
            }
            else if (typeof self !== "undefined") {
                g = self;
            }
            else {
                g = {};
            }
            if (g) {
                for (var _i = 0, _a = Object.keys(g); _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (key.startsWith("tzdata")) {
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
            default: // cannot happen, but the compiler doesnt realize it
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
                if (rule.length < 8) { // note some rules > 8 exists but that seems to be a bug in tz file parsing
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

},{"./assert":1,"./basics":2,"./duration":4,"./math":9}],"timezonecomplete":[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
__export(require("./locale"));
__export(require("./parse"));
__export(require("./period"));
__export(require("./basics"));
__export(require("./timesource"));
__export(require("./timezone"));
__export(require("./tz-database"));
},{"./basics":2,"./datetime":3,"./duration":4,"./format":5,"./globals":6,"./javascript":7,"./locale":8,"./parse":10,"./period":11,"./timesource":13,"./timezone":14,"./tz-database":16}]},{},[])("timezonecomplete")
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL2Fzc2VydC50cyIsInNyYy9saWIvYmFzaWNzLnRzIiwic3JjL2xpYi9kYXRldGltZS50cyIsInNyYy9saWIvZHVyYXRpb24udHMiLCJzcmMvbGliL2Zvcm1hdC50cyIsInNyYy9saWIvZ2xvYmFscy50cyIsInNyYy9saWIvamF2YXNjcmlwdC50cyIsInNyYy9saWIvbG9jYWxlLnRzIiwic3JjL2xpYi9tYXRoLnRzIiwic3JjL2xpYi9wYXJzZS50cyIsInNyYy9saWIvcGVyaW9kLnRzIiwic3JjL2xpYi9zdHJpbmdzLnRzIiwic3JjL2xpYi90aW1lc291cmNlLnRzIiwic3JjL2xpYi90aW1lem9uZS50cyIsInNyYy9saWIvdG9rZW4udHMiLCJkaXN0L2xpYi9zcmMvbGliL3R6LWRhdGFiYXNlLnRzIiwic3JjL2xpYi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztHQUVHO0FBRUgsWUFBWSxDQUFDOztBQUViLGdCQUFnQixTQUFjLEVBQUUsT0FBZTtJQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN6QjtBQUNGLENBQUM7QUFFRCxrQkFBZSxNQUFNLENBQUM7O0FDWnRCOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7O0FBRWIsbUNBQThCO0FBQzlCLDJDQUE2QztBQUM3Qyw2QkFBK0I7QUFDL0IsbUNBQXFDO0FBc0VyQzs7O0dBR0c7QUFDSCxJQUFZLE9BUVg7QUFSRCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7SUFDUix5Q0FBTSxDQUFBO0lBQ04sNkNBQVEsQ0FBQTtBQUNULENBQUMsRUFSVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFRbEI7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QUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRTtJQUMzQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzVDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUMxQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDMUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDeEMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN4QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3hDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFO0lBQzFCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUM1QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzVDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDOUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUM5QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzlDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDM0MsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUMzQyxD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LE1BQU0sQ0FBQyxVQUFVLEVBQUU7d0JBQ2hFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO3FCQUN6QjtpQkFDRDthQUNEO1NBQ0Q7S0FDRDtJQUVELE9BQU8sTUFBb0IsQ0FBQztBQUM3QixDQUFDOzs7O0FDM2xERDs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOzs7OztBQUViLDhCQUF5QjtBQUN6QixnQ0FBMkI7QUFDM0IsZ0NBQTJCO0FBQzNCLDhCQUF5QjtBQUN6QiwrQkFBMEI7QUFDMUIsa0NBQTZCO0FBQzdCLDhCQUF5QjtBQUN6Qiw2QkFBd0I7QUFDeEIsOEJBQXlCO0FBQ3pCLDhCQUF5QjtBQUN6QixrQ0FBNkI7QUFDN0IsZ0NBQTJCO0FBQzNCLG1DQUE4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNiBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYW55LCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRpZiAoIWNvbmRpdGlvbikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXNzZXJ0O1xyXG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcblxuLyoqXG4gKiBVc2VkIGZvciBtZXRob2RzIHRoYXQgdGFrZSBhIHRpbWVzdGFtcCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZUNvbXBvbmVudE9wdHMge1xuXHQvKipcblx0ICogWWVhciwgZGVmYXVsdCAxOTcwXG5cdCAqL1xuXHR5ZWFyPzogbnVtYmVyO1xuXHQvKipcblx0ICogTW9udGggMS0xMiwgZGVmYXVsdCAxXG5cdCAqL1xuXHRtb250aD86IG51bWJlcjtcblx0LyoqXG5cdCAqIERheSBvZiBtb250aCAxLTMxLCBkZWZhdWx0IDFcblx0ICovXG5cdGRheT86IG51bWJlcjtcblx0LyoqXG5cdCAqIEhvdXIgb2YgZGF5IDAtMjMsIGRlZmF1bHQgMFxuXHQgKi9cblx0aG91cj86IG51bWJlcjtcblx0LyoqXG5cdCAqIE1pbnV0ZSAwLTU5LCBkZWZhdWx0IDBcblx0ICovXG5cdG1pbnV0ZT86IG51bWJlcjtcblx0LyoqXG5cdCAqIFNlY29uZCAwLTU5LCBkZWZhdWx0IDBcblx0ICovXG5cdHNlY29uZD86IG51bWJlcjtcblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kIDAtOTk5LCBkZWZhdWx0IDBcblx0ICovXG5cdG1pbGxpPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIFRpbWVzdGFtcCByZXByZXNlbnRlZCBhcyBzZXBhcmF0ZSB5ZWFyL21vbnRoLy4uLiBjb21wb25lbnRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZUNvbXBvbmVudHMge1xuXHQvKipcblx0ICogWWVhclxuXHQgKi9cblx0eWVhcjogbnVtYmVyO1xuXHQvKipcblx0ICogTW9udGggMS0xMlxuXHQgKi9cblx0bW9udGg6IG51bWJlcjtcblx0LyoqXG5cdCAqIERheSBvZiBtb250aCAxLTMxXG5cdCAqL1xuXHRkYXk6IG51bWJlcjtcblx0LyoqXG5cdCAqIEhvdXIgMC0yM1xuXHQgKi9cblx0aG91cjogbnVtYmVyO1xuXHQvKipcblx0ICogTWludXRlXG5cdCAqL1xuXHRtaW51dGU6IG51bWJlcjtcblx0LyoqXG5cdCAqIFNlY29uZFxuXHQgKi9cblx0c2Vjb25kOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZCAwLTk5OVxuXHQgKi9cblx0bWlsbGk6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBEYXktb2Ytd2Vlay4gTm90ZSB0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0IGRheS1vZi13ZWVrOlxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcbiAqL1xuZXhwb3J0IGVudW0gV2Vla0RheSB7XG5cdFN1bmRheSxcblx0TW9uZGF5LFxuXHRUdWVzZGF5LFxuXHRXZWRuZXNkYXksXG5cdFRodXJzZGF5LFxuXHRGcmlkYXksXG5cdFNhdHVyZGF5XG59XG5cbi8qKlxuICogVGltZSB1bml0c1xuICovXG5leHBvcnQgZW51bSBUaW1lVW5pdCB7XG5cdE1pbGxpc2Vjb25kLFxuXHRTZWNvbmQsXG5cdE1pbnV0ZSxcblx0SG91cixcblx0RGF5LFxuXHRXZWVrLFxuXHRNb250aCxcblx0WWVhcixcblx0LyoqXG5cdCAqIEVuZC1vZi1lbnVtIG1hcmtlciwgZG8gbm90IHVzZVxuXHQgKi9cblx0TUFYXG59XG5cbi8qKlxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXG4gKiBBIGRheSBpcyBhc3N1bWVkIHRvIGhhdmUgMjQgaG91cnMsIGEgbW9udGggaXMgYXNzdW1lZCB0byBlcXVhbCAzMCBkYXlzXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXG4gKlxuICogQHBhcmFtIHVuaXRcdFRpbWUgdW5pdCBlLmcuIFRpbWVVbml0Lk1vbnRoXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQ6IFRpbWVVbml0KTogbnVtYmVyIHtcblx0c3dpdGNoICh1bml0KSB7XG5cdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDogcmV0dXJuIDE7XG5cdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHJldHVybiAxMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuSG91cjogcmV0dXJuIDYwICogNjAgKiAxMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuRGF5OiByZXR1cm4gODY0MDAwMDA7XG5cdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHJldHVybiAzMCAqIDg2NDAwMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuWWVhcjogcmV0dXJuIDEyICogMzAgKiA4NjQwMDAwMDtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdFwiKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXG4gKiBpZiBuZWNlc3NhcnkuXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQ6IFRpbWVVbml0LCBhbW91bnQ6IG51bWJlciA9IDEpOiBzdHJpbmcge1xuXHRjb25zdCByZXN1bHQgPSBUaW1lVW5pdFt1bml0XS50b0xvd2VyQ2FzZSgpO1xuXHRpZiAoYW1vdW50ID09PSAxIHx8IGFtb3VudCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiByZXN1bHQgKyBcInNcIjtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzOiBzdHJpbmcpOiBUaW1lVW5pdCB7XG5cdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IFRpbWVVbml0Lk1BWDsgKytpKSB7XG5cdFx0Y29uc3Qgb3RoZXIgPSB0aW1lVW5pdFRvU3RyaW5nKGksIDEpO1xuXHRcdGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcblx0XHRcdHJldHVybiBpO1xuXHRcdH1cblx0fVxuXHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRydWUgaWZmIHRoZSBnaXZlbiB5ZWFyIGlzIGEgbGVhcCB5ZWFyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMZWFwWWVhcih5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcblx0Ly8gZnJvbSBXaWtpcGVkaWE6XG5cdC8vIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0IHRoZW4gY29tbW9uIHllYXJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXG5cdC8vIGVsc2UgbGVhcCB5ZWFyXG5cdGlmICh5ZWFyICUgNCAhPT0gMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIGlmICh5ZWFyICUgMTAwICE9PSAwKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufVxuXG4vKipcbiAqIFRoZSBkYXlzIGluIGEgZ2l2ZW4geWVhclxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luWWVhcih5ZWFyOiBudW1iZXIpOiBudW1iZXIge1xuXHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCAxLTEyXG4gKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgZ2l2ZW4gbW9udGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcik6IG51bWJlciB7XG5cdHN3aXRjaCAobW9udGgpIHtcblx0XHRjYXNlIDE6XG5cdFx0Y2FzZSAzOlxuXHRcdGNhc2UgNTpcblx0XHRjYXNlIDc6XG5cdFx0Y2FzZSA4OlxuXHRcdGNhc2UgMTA6XG5cdFx0Y2FzZSAxMjpcblx0XHRcdHJldHVybiAzMTtcblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4KTtcblx0XHRjYXNlIDQ6XG5cdFx0Y2FzZSA2OlxuXHRcdGNhc2UgOTpcblx0XHRjYXNlIDExOlxuXHRcdFx0cmV0dXJuIDMwO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoOiBcIiArIG1vbnRoKTtcblx0fVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXG4gKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlPZlllYXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XG5cdGFzc2VydChtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIk1vbnRoIG91dCBvZiByYW5nZVwiKTtcblx0YXNzZXJ0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcblx0bGV0IHllYXJEYXk6IG51bWJlciA9IDA7XG5cdGZvciAobGV0IGk6IG51bWJlciA9IDE7IGkgPCBtb250aDsgaSsrKSB7XG5cdFx0eWVhckRheSArPSBkYXlzSW5Nb250aCh5ZWFyLCBpKTtcblx0fVxuXHR5ZWFyRGF5ICs9IChkYXkgLSAxKTtcblx0cmV0dXJuIHllYXJEYXk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcbiAqXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxuICpcbiAqIEByZXR1cm4gdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3QgZW5kT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xuXHRjb25zdCBlbmRPZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGVuZE9mTW9udGgudW5peE1pbGxpcyk7XG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gZW5kT2ZNb250aFdlZWtEYXk7XG5cdGlmIChkaWZmID4gMCkge1xuXHRcdGRpZmYgLT0gNztcblx0fVxuXHRyZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcbiAqXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3QgYmVnaW5PZk1vbnRoOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyLCBtb250aCwgZGF5OiAxfSk7XG5cdGNvbnN0IGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcblx0aWYgKGRpZmYgPCAwKSB7XG5cdFx0ZGlmZiArPSA3O1xuXHR9XG5cdHJldHVybiBiZWdpbk9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckFmdGVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSB9KTtcblx0Y29uc3Qgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XG5cdGxldCBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xuXHRpZiAoZGlmZiA8IDApIHtcblx0XHRkaWZmICs9IDc7XG5cdH1cblx0YXNzZXJ0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XG5cdHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtEYXlPbk9yQmVmb3JlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xuXHRjb25zdCBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHt5ZWFyLCBtb250aCwgZGF5fSk7XG5cdGNvbnN0IHN0YXJ0V2Vla0RheTogV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcblx0aWYgKGRpZmYgPiAwKSB7XG5cdFx0ZGlmZiAtPSA3O1xuXHR9XG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcblx0cmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cblxuLyoqXG4gKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxuICpcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGggVGhlIG1vbnRoIFsxLTEyXVxuICogQHBhcmFtIGRheSBUaGUgZGF5IFsxLTMxXVxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XG5cdGNvbnN0IGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcblx0Y29uc3QgZmlyc3RNb25kYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxuXHRpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcblx0XHRpZiAoZmlyc3RUaHVyc2RheSA8IGZpcnN0TW9uZGF5KSB7XG5cdFx0XHQvLyBXZWVrIDFcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcblx0XHRcdGlmIChtb250aCA+IDEpIHtcblx0XHRcdFx0Ly8gRGVmYXVsdCBjYXNlXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIDMxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEphbnVhcnlcblx0XHRcdFx0cmV0dXJuIHdlZWtPZk1vbnRoKHllYXIgLSAxLCAxMiwgMzEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGxhc3RNb25kYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcblx0Y29uc3QgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcblx0Ly8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiBsYXN0IHdlZWsgb3Igd2VlayAxIG9mIHByZXZpb3VzIG1vbnRoXG5cdGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xuXHRcdGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XG5cdFx0XHQvLyBXZWVrIDEgb2YgbmV4dCBtb250aFxuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm9ybWFsIGNhc2Vcblx0bGV0IHJlc3VsdCA9IE1hdGguZmxvb3IoKGRheSAtIGZpcnN0TW9uZGF5KSAvIDcpICsgMTtcblx0aWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XG5cdFx0cmVzdWx0ICs9IDE7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxuICogTm90ZSB0aGF0IHRoZSByZXN1bHQgbWF5IGxpZSBpbiB0aGUgcHJldmlvdXMgeWVhciwgaW4gd2hpY2ggY2FzZSBpdFxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcbiAqL1xuZnVuY3Rpb24gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyOiBudW1iZXIpOiBudW1iZXIge1xuXHQvLyBmaXJzdCBtb25kYXkgb2YgSmFudWFyeSwgbWludXMgb25lIGJlY2F1c2Ugd2Ugd2FudCBkYXktb2YteWVhclxuXHRsZXQgcmVzdWx0OiBudW1iZXIgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XG5cdGlmIChyZXN1bHQgPiAzKSB7IC8vIGdyZWF0ZXIgdGhhbiBqYW4gNHRoXG5cdFx0cmVzdWx0IC09IDc7XG5cdFx0aWYgKHJlc3VsdCA8IDApIHtcblx0XHRcdHJlc3VsdCArPSBleHBvcnRzLmRheXNJblllYXIoeWVhciAtIDEpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlciBmb3IgdGhlIGdpdmVuIGRhdGUuIFdlZWsgMSBpcyB0aGUgd2Vla1xuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxuICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcbiAqXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcbiAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxuICogQHBhcmFtIGRheVx0RGF5IG9mIG1vbnRoIDEtMzFcbiAqXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIDEtNTNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtOdW1iZXIoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IG51bWJlciB7XG5cdGNvbnN0IGRveSA9IGRheU9mWWVhcih5ZWFyLCBtb250aCwgZGF5KTtcblxuXHQvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcblx0aWYgKGRveSA+PSBkYXlPZlllYXIoeWVhciwgMTIsIDI5KSkge1xuXHRcdGNvbnN0IG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xuXHRcdGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblx0fVxuXG5cdC8vIGNoZWNrIGJlZ2lubmluZy1vZi15ZWFyIGNvcm5lciBjYXNlXG5cdGNvbnN0IHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XG5cdGlmICh0aGlzWWVhcldlZWtPbmUgPiA0KSB7XG5cdFx0Ly8gd2VlayAxIGlzIGF0IGVuZCBvZiBsYXN0IHllYXJcblx0XHRjb25zdCB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xuXHRcdGlmIChkb3kgPCB3ZWVrVHdvKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHdlZWtUd28pIC8gNykgKyAyO1xuXHRcdH1cblx0fVxuXG5cdC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxuXHRpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XG5cdFx0Ly8gVGhlIGRhdGUgaXMgcGFydCBvZiB0aGUgbGFzdCB3ZWVrIG9mIHByZXYgeWVhci5cblx0XHRyZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcblx0fVxuXG5cdC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcblx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpczogbnVtYmVyKTogdm9pZCB7XG5cdGFzc2VydCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcblx0YXNzZXJ0KCFpc05hTih1bml4TWlsbGlzKSwgXCJOYU4gbm90IGV4cGVjdGVkIGFzIGlucHV0XCIpO1xuXHRhc3NlcnQobWF0aC5pc0ludCh1bml4TWlsbGlzKSwgXCJFeHBlY3QgaW50ZWdlciBudW1iZXIgZm9yIHVuaXggVVRDIHRpbWVzdGFtcFwiKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogVGltZUNvbXBvbmVudHMge1xuXHRhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xuXG5cdGxldCB0ZW1wOiBudW1iZXIgPSB1bml4TWlsbGlzO1xuXHRjb25zdCByZXN1bHQ6IFRpbWVDb21wb25lbnRzID0geyB5ZWFyOiAwLCBtb250aDogMCwgZGF5OiAwLCBob3VyOiAwLCBtaW51dGU6IDAsIHNlY29uZDogMCwgbWlsbGk6IDB9O1xuXHRsZXQgeWVhcjogbnVtYmVyO1xuXHRsZXQgbW9udGg6IG51bWJlcjtcblxuXHRpZiAodW5peE1pbGxpcyA+PSAwKSB7XG5cdFx0cmVzdWx0Lm1pbGxpID0gdGVtcCAlIDEwMDA7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xuXHRcdHJlc3VsdC5zZWNvbmQgPSB0ZW1wICUgNjA7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcblx0XHRyZXN1bHQubWludXRlID0gdGVtcCAlIDYwO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG5cdFx0cmVzdWx0LmhvdXIgPSB0ZW1wICUgMjQ7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcblxuXHRcdHllYXIgPSAxOTcwO1xuXHRcdHdoaWxlICh0ZW1wID49IGRheXNJblllYXIoeWVhcikpIHtcblx0XHRcdHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcblx0XHRcdHllYXIrKztcblx0XHR9XG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xuXG5cdFx0bW9udGggPSAxO1xuXHRcdHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xuXHRcdFx0dGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG5cdFx0XHRtb250aCsrO1xuXHRcdH1cblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDE7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxuXHRcdC8vIFdlIG1ha2UgaXQgcG9zaXRpdmUgYnkgYWRkaW5nIHRoZSBtb2R1bG8uXG5cdFx0cmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XG5cdFx0cmVzdWx0LnNlY29uZCA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG5cdFx0cmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xuXG5cdFx0eWVhciA9IDE5Njk7XG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xuXHRcdFx0dGVtcCArPSBkYXlzSW5ZZWFyKHllYXIpO1xuXHRcdFx0eWVhci0tO1xuXHRcdH1cblx0XHRyZXN1bHQueWVhciA9IHllYXI7XG5cblx0XHRtb250aCA9IDEyO1xuXHRcdHdoaWxlICh0ZW1wIDwgLWRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xuXHRcdFx0dGVtcCArPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG5cdFx0XHRtb250aC0tO1xuXHRcdH1cblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEZpbGwgeW91IGFueSBtaXNzaW5nIHRpbWUgY29tcG9uZW50IHBhcnRzLCBkZWZhdWx0cyBhcmUgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBUaW1lQ29tcG9uZW50cyB7XG5cdGNvbnN0IGlucHV0ID0ge1xuXHRcdHllYXI6IHR5cGVvZiBjb21wb25lbnRzLnllYXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnllYXIgOiAxOTcwLFxuXHRcdG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxuXHRcdGRheTogdHlwZW9mIGNvbXBvbmVudHMuZGF5ID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5kYXkgOiAxLFxuXHRcdGhvdXI6IHR5cGVvZiBjb21wb25lbnRzLmhvdXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmhvdXIgOiAwLFxuXHRcdG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxuXHRcdHNlY29uZDogdHlwZW9mIGNvbXBvbmVudHMuc2Vjb25kID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5zZWNvbmQgOiAwLFxuXHRcdG1pbGxpOiB0eXBlb2YgY29tcG9uZW50cy5taWxsaSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWlsbGkgOiAwLFxuXHR9O1xuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHllYXIsIG1vbnRoLCBkYXkgZXRjIGludG8gYSB1bml4IG1pbGxpIHRpbWVzdGFtcC5cbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxuICpcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXG4gKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxuICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xuICogQHBhcmFtIG1pbnV0ZVx0TWludXRlIDAtNTlcbiAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXG4gKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyhcblx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgaG91cjogbnVtYmVyLCBtaW51dGU6IG51bWJlciwgc2Vjb25kOiBudW1iZXIsIG1pbGxpOiBudW1iZXJcbik6IG51bWJlcjtcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyhjb21wb25lbnRzOiBUaW1lQ29tcG9uZW50T3B0cyk6IG51bWJlcjtcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyhcblx0YTogVGltZUNvbXBvbmVudE9wdHMgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuKTogbnVtYmVyIHtcblx0Y29uc3QgY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyB7IHllYXI6IGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9IDogYSk7XG5cdGNvbnN0IGlucHV0OiBUaW1lQ29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHMpO1xuXHRyZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKFxuXHRcdGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXG5cdFx0KGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXG5cdFx0TWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDEpIC8gMTAwKSAqIDg2NDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDAgKyAyOTkpIC8gNDAwKSAqIDg2NDAwKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5Tm9MZWFwU2Vjcyh1bml4TWlsbGlzOiBudW1iZXIpOiBXZWVrRGF5IHtcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcblxuXHRjb25zdCBlcG9jaERheTogV2Vla0RheSA9IFdlZWtEYXkuVGh1cnNkYXk7XG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xuXHRyZXR1cm4gKGVwb2NoRGF5ICsgZGF5cykgJSA3O1xufVxuXG4vKipcbiAqIE4tdGggc2Vjb25kIGluIHRoZSBkYXksIGNvdW50aW5nIGZyb20gMFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2Vjb25kT2ZEYXkoaG91cjogbnVtYmVyLCBtaW51dGU6IG51bWJlciwgc2Vjb25kOiBudW1iZXIpOiBudW1iZXIge1xuXHRyZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XG59XG5cbi8qKlxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXG4gKi9cbmV4cG9ydCBjbGFzcyBUaW1lU3RydWN0IHtcblxuXHQvKipcblx0ICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSB0aGUgZ2l2ZW4geWVhciwgbW9udGgsIGRheSBldGNcblx0ICpcblx0ICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXG5cdCAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxuXHQgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxuXHQgKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXG5cdCAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XG5cdCAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXG5cdCAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUNvbXBvbmVudHMoXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlcixcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcblx0KTogVGltZVN0cnVjdCB7XG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xuXHQgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZnJvbVVuaXgodW5peE1pbGxpczogbnVtYmVyKTogVGltZVN0cnVjdCB7XG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIEphdmFTY3JpcHQgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gZFx0VGhlIGRhdGVcblx0ICogQHBhcmFtIGRmXHRXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZnJvbURhdGUoZDogRGF0ZSwgZGY6IERhdGVGdW5jdGlvbnMpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAoZGYgPT09IERhdGVGdW5jdGlvbnMuR2V0KSB7XG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuXHRcdFx0XHR5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxuXHRcdFx0XHRob3VyOiBkLmdldEhvdXJzKCksIG1pbnV0ZTogZC5nZXRNaW51dGVzKCksIHNlY29uZDogZC5nZXRTZWNvbmRzKCksIG1pbGxpOiBkLmdldE1pbGxpc2Vjb25kcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcblx0XHRcdFx0eWVhcjogZC5nZXRVVENGdWxsWWVhcigpLCBtb250aDogZC5nZXRVVENNb250aCgpICsgMSwgZGF5OiBkLmdldFVUQ0RhdGUoKSxcblx0XHRcdFx0aG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoczogc3RyaW5nKTogVGltZVN0cnVjdCB7XG5cdFx0dHJ5IHtcblx0XHRcdGxldCB5ZWFyOiBudW1iZXIgPSAxOTcwO1xuXHRcdFx0bGV0IG1vbnRoOiBudW1iZXIgPSAxO1xuXHRcdFx0bGV0IGRheTogbnVtYmVyID0gMTtcblx0XHRcdGxldCBob3VyOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gMDtcblx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgZnJhY3Rpb25NaWxsaXM6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgbGFzdFVuaXQ6IFRpbWVVbml0ID0gVGltZVVuaXQuWWVhcjtcblxuXHRcdFx0Ly8gc2VwYXJhdGUgYW55IGZyYWN0aW9uYWwgcGFydFxuXHRcdFx0Y29uc3Qgc3BsaXQ6IHN0cmluZ1tdID0gcy50cmltKCkuc3BsaXQoXCIuXCIpO1xuXHRcdFx0YXNzZXJ0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcblxuXHRcdFx0Ly8gcGFyc2UgbWFpbiBwYXJ0XG5cdFx0XHRjb25zdCBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcblx0XHRcdGlmIChpc0Jhc2ljRm9ybWF0KSB7XG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXigoXFxkKSspfChcXGRcXGRcXGRcXGRcXGRcXGRcXGRcXGRUKFxcZCkrKSQvKSxcblx0XHRcdFx0XHRcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xuXG5cdFx0XHRcdC8vIHJlbW92ZSBhbnkgXCJUXCIgc2VwYXJhdG9yXG5cdFx0XHRcdHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XG5cblx0XHRcdFx0YXNzZXJ0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLFxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XG5cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig0LCAyKSwgMTApO1xuXHRcdFx0XHRcdGRheSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig2LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEwKSB7XG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XG5cdFx0XHRcdFx0bWludXRlID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEwLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTQpIHtcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTIsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xuXHRcdFx0XHRsZXQgZGF0ZUFuZFRpbWU6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcdGlmIChzLmluZGV4T2YoXCJUXCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHMubGVuZ3RoID4gMTApIHtcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IFtzcGxpdFswXS5zdWJzdHIoMCwgMTApLCBzcGxpdFswXS5zdWJzdHIoMTApXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XG5cdFx0XHRcdH1cblx0XHRcdFx0YXNzZXJ0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSxcblx0XHRcdFx0XHRcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xuXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xuXHRcdFx0XHRcdHllYXIgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoMCwgNCksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSAxMCkge1xuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xuXHRcdFx0XHRcdGhvdXIgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoMCwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA1KSB7XG5cdFx0XHRcdFx0bWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gcGFyc2UgZnJhY3Rpb25hbCBwYXJ0XG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnN0IGZyYWN0aW9uOiBudW1iZXIgPSBwYXJzZUZsb2F0KFwiMC5cIiArIHNwbGl0WzFdKTtcblx0XHRcdFx0c3dpdGNoIChsYXN0VW5pdCkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gZGF5c0luWWVhcih5ZWFyKSAqIDg2NDAwMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMzYwMDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDYwMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gY29tYmluZSBtYWluIGFuZCBmcmFjdGlvbmFsIHBhcnRcblx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xuXHRcdFx0bW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcblx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcblx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xuXHRcdFx0bWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xuXHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xuXHRcdFx0bGV0IHVuaXhNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgfSk7XG5cdFx0XHR1bml4TWlsbGlzID0gbWF0aC5yb3VuZFN5bSh1bml4TWlsbGlzICsgZnJhY3Rpb25NaWxsaXMpO1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgSVNPIDg2MDEgc3RyaW5nOiBcXFwiXCIgKyBzICsgXCJcXFwiOiBcIiArIGUubWVzc2FnZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHVuaXggbWlsbGlzZWNvbmRzXG5cdCAqL1xuXHRwcml2YXRlIF91bml4TWlsbGlzOiBudW1iZXI7XG5cdHB1YmxpYyBnZXQgdW5peE1pbGxpcygpOiBudW1iZXIge1xuXHRcdGlmICh0aGlzLl91bml4TWlsbGlzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX3VuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLl9jb21wb25lbnRzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgdmFsdWUgaW4gc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBfY29tcG9uZW50czogVGltZUNvbXBvbmVudHM7XG5cdHB1YmxpYyBnZXQgY29tcG9uZW50cygpOiBUaW1lQ29tcG9uZW50cyB7XG5cdFx0aWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XG5cdFx0XHR0aGlzLl9jb21wb25lbnRzID0gdW5peFRvVGltZU5vTGVhcFNlY3ModGhpcy5fdW5peE1pbGxpcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSB1bml4TWlsbGlzIG1pbGxpc2Vjb25kcyBzaW5jZSAxLTEtMTk3MFxuXHQgKi9cblx0Y29uc3RydWN0b3IodW5peE1pbGxpczogbnVtYmVyKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBjb21wb25lbnRzIFNlcGFyYXRlIHRpbWVzdGFtcCBjb21wb25lbnRzICh5ZWFyLCBtb250aCwgLi4uKVxuXHQgKi9cblx0Y29uc3RydWN0b3IoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cblx0ICovXG5cdGNvbnN0cnVjdG9yKGE6IG51bWJlciB8IFRpbWVDb21wb25lbnRPcHRzKSB7XG5cdFx0aWYgKHR5cGVvZiBhID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gYTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGEpO1xuXHRcdH1cblx0fVxuXG5cdGdldCB5ZWFyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xuXHR9XG5cblx0Z2V0IG1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aDtcblx0fVxuXG5cdGdldCBkYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLmRheTtcblx0fVxuXG5cdGdldCBob3VyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xuXHR9XG5cblx0Z2V0IG1pbnV0ZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubWludXRlO1xuXHR9XG5cblx0Z2V0IHNlY29uZCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kO1xuXHR9XG5cblx0Z2V0IG1pbGxpKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZGF5LW9mLXllYXIgMC0zNjVcblx0ICovXG5cdHB1YmxpYyB5ZWFyRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGRheU9mWWVhcih0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoLCB0aGlzLmNvbXBvbmVudHMuZGF5KTtcblx0fVxuXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVTdHJ1Y3QpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZU9mKCkgPT09IG90aGVyLnZhbHVlT2YoKTtcblx0fVxuXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudW5peE1pbGxpcztcblx0fVxuXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAodGhpcy5fY29tcG9uZW50cykge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX2NvbXBvbmVudHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fdW5peE1pbGxpcyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXG5cdCAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSB0aW1lc3RhbXAgaXMgdmFsaWRcblx0ICovXG5cdHB1YmxpYyB2YWxpZGF0ZSgpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5fY29tcG9uZW50cykge1xuXHRcdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuZGF5ID49IDEgJiYgdGhpcy5jb21wb25lbnRzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoKVxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5ob3VyIDw9IDIzXG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kIDw9IDU5XG5cdFx0XHRcdCYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA8PSA5OTk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJU08gODYwMSBzdHJpbmcgWVlZWS1NTS1ERFRoaDptbTpzcy5ubm5cblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5kYXkudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuc2Vjb25kLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcblx0fVxufVxuXG5cbi8qKlxuICogQmluYXJ5IHNlYXJjaFxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxuICogQHBhcmFtIGNvbXBhcmUgRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIDwgMCBpZiBnaXZlbiBlbGVtZW50IGlzIGxlc3MgdGhhbiBzZWFyY2hlZCBlbGVtZW50IGV0Y1xuICogQHJldHVybiB7TnVtYmVyfSBUaGUgaW5zZXJ0aW9uIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIGxvb2sgZm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleDxUPihhcnI6IFRbXSwgY29tcGFyZTogKGE6IFQpID0+IG51bWJlcik6IG51bWJlciB7XG5cdGxldCBtaW5JbmRleCA9IDA7XG5cdGxldCBtYXhJbmRleCA9IGFyci5sZW5ndGggLSAxO1xuXHRsZXQgY3VycmVudEluZGV4OiBudW1iZXI7XG5cdGxldCBjdXJyZW50RWxlbWVudDogVDtcblx0Ly8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxuXHRpZiAoIWFycikge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblx0Ly8gb3V0IG9mIGJvdW5kc1xuXHRpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cdGlmIChjb21wYXJlKGFyclttYXhJbmRleF0pIDwgMCkge1xuXHRcdHJldHVybiBtYXhJbmRleCArIDE7XG5cdH1cblx0Ly8gZWxlbWVudCBpbiByYW5nZVxuXHR3aGlsZSAobWluSW5kZXggPD0gbWF4SW5kZXgpIHtcblx0XHRjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xuXHRcdGN1cnJlbnRFbGVtZW50ID0gYXJyW2N1cnJlbnRJbmRleF07XG5cblx0XHRpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XG5cdFx0XHRtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDE7XG5cdFx0fSBlbHNlIGlmIChjb21wYXJlKGN1cnJlbnRFbGVtZW50KSA+IDApIHtcblx0XHRcdG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGN1cnJlbnRJbmRleDtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbWF4SW5kZXg7XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBEYXRlK3RpbWUrdGltZXpvbmUgcmVwcmVzZW50YXRpb25cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IFRpbWVTdHJ1Y3QsIFRpbWVVbml0LCBXZWVrRGF5IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XG5pbXBvcnQgKiBhcyBmb3JtYXQgZnJvbSBcIi4vZm9ybWF0XCI7XG5pbXBvcnQgeyBEYXRlRnVuY3Rpb25zIH0gZnJvbSBcIi4vamF2YXNjcmlwdFwiO1xuaW1wb3J0IHsgUGFydGlhbExvY2FsZSB9IGZyb20gXCIuL2xvY2FsZVwiO1xuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCI7XG5pbXBvcnQgKiBhcyBwYXJzZUZ1bmNzIGZyb20gXCIuL3BhcnNlXCI7XG5pbXBvcnQgeyBSZWFsVGltZVNvdXJjZSwgVGltZVNvdXJjZSB9IGZyb20gXCIuL3RpbWVzb3VyY2VcIjtcbmltcG9ydCB7IFRpbWVab25lLCBUaW1lWm9uZUtpbmQgfSBmcm9tIFwiLi90aW1lem9uZVwiO1xuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcblxuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XG5cdHJldHVybiBEYXRlVGltZS5ub3dMb2NhbCgpO1xufVxuXG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3dVdGMoKTogRGF0ZVRpbWUge1xuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XG59XG5cbi8qKlxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxuICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZCB8IG51bGwgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcblx0cmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIGZyb21ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcblx0aWYgKGZyb21ab25lKSB7XG5cdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBmcm9tWm9uZS5vZmZzZXRGb3Jab25lKGxvY2FsVGltZSk7XG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZS51bml4TWlsbGlzIC0gb2Zmc2V0ICogNjAwMDApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0RnJvbVV0Yyh1dGNUaW1lOiBUaW1lU3RydWN0LCB0b1pvbmU/OiBUaW1lWm9uZSk6IFRpbWVTdHJ1Y3Qge1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuXHRpZiAodG9ab25lKSB7XG5cdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSB0b1pvbmUub2Zmc2V0Rm9yVXRjKHV0Y1RpbWUpO1xuXHRcdHJldHVybiB0b1pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IFRpbWVTdHJ1Y3QodXRjVGltZS51bml4TWlsbGlzICsgb2Zmc2V0ICogNjAwMDApKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdXRjVGltZS5jbG9uZSgpO1xuXHR9XG59XG5cbi8qKlxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXG4gKiBhbmQgd2hpY2ggY2FuIGJlIG1vY2tlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcblxuXHQvKipcblx0ICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2Zcblx0ICovXG5cdHB1YmxpYyBraW5kID0gXCJEYXRlVGltZVwiO1xuXG5cdC8qKlxuXHQgKiBVVEMgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcblx0ICovXG5cdHByaXZhdGUgX3V0Y0RhdGU/OiBUaW1lU3RydWN0O1xuXHRwcml2YXRlIGdldCB1dGNEYXRlKCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGU7XG5cdH1cblx0cHJpdmF0ZSBzZXQgdXRjRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xuXHRcdHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcblx0XHR0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2NhbCB0aW1lc3RhbXAgKGxhemlseSBjYWxjdWxhdGVkKVxuXHQgKi9cblx0cHJpdmF0ZSBfem9uZURhdGU/OiBUaW1lU3RydWN0O1xuXHRwcml2YXRlIGdldCB6b25lRGF0ZSgpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XG5cdFx0XHR0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZTtcblx0fVxuXHRwcml2YXRlIHNldCB6b25lRGF0ZSh2YWx1ZTogVGltZVN0cnVjdCkge1xuXHRcdHRoaXMuX3pvbmVEYXRlID0gdmFsdWU7XG5cdFx0dGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBPcmlnaW5hbCB0aW1lIHpvbmUgdGhpcyBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmb3IuXG5cdCAqIENhbiBiZSB1bmRlZmluZWQgZm9yIHVuYXdhcmUgdGltZXN0YW1wc1xuXHQgKi9cblx0cHJpdmF0ZSBfem9uZT86IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXG5cdCAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcblx0ICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0aW1lU291cmNlOiBUaW1lU291cmNlID0gbmV3IFJlYWxUaW1lU291cmNlKCk7XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbm93TG9jYWwoKTogRGF0ZVRpbWUge1xuXHRcdGNvbnN0IG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobiwgRGF0ZUZ1bmN0aW9ucy5HZXQsIFRpbWVab25lLmxvY2FsKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG5vd1V0YygpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBub3codGltZVpvbmU6IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIERhdGVUaW1lIGZyb20gYSBMb3R1cyAxMjMgLyBNaWNyb3NvZnQgRXhjZWwgZGF0ZS10aW1lIHZhbHVlXG5cdCAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcblx0ICogQHBhcmFtIG4gZXhjZWwgZGF0ZS90aW1lIG51bWJlclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21FeGNlbChuOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdGFzc2VydCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XG5cdFx0YXNzZXJ0KCFpc05hTihuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHVuaXhUaW1lc3RhbXAsIHRpbWVab25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cblx0ICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcblx0ICogYW5kIDIwMTUtMDMtMjlUMDI6MzA6MDAgcmV0dXJucyBmYWxzZSAoZGF5bGlnaHQgc2F2aW5nIHRpbWUgbWlzc2luZyBob3VyKVxuXHQgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXG5cdCAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXG5cdCAqIGJlZm9yZSB0aGF0LiBZb3UgY2FuIGNoYW5nZSB0aGF0IHdpdGggdGhlIGFsbG93UHJlMTk3MCBmbGFnLlxuXHQgKlxuXHQgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBleGlzdHMoXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLFxuXHRcdGhvdXI6IG51bWJlciA9IDAsIG1pbnV0ZTogbnVtYmVyID0gMCwgc2Vjb25kOiBudW1iZXIgPSAwLCBtaWxsaXNlY29uZDogbnVtYmVyID0gMCxcblx0XHR6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkLCBhbGxvd1ByZTE5NzA6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAoXG5cdFx0XHQhaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KSB8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZClcblx0XHRcdHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZClcblx0XHQpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKCFhbGxvd1ByZTE5NzAgJiYgeWVhciA8IDE5NzApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGR0ID0gbmV3IERhdGVUaW1lKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSk7XG5cdFx0XHRyZXR1cm4gKHllYXIgPT09IGR0LnllYXIoKSAmJiBtb250aCA9PT0gZHQubW9udGgoKSAmJiBkYXkgPT09IGR0LmRheSgpXG5cdFx0XHRcdCYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IuIENyZWF0ZXMgY3VycmVudCB0aW1lIGluIGxvY2FsIHRpbWV6b25lLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgSVNPIHRpbWVzdGFtcCBzdHJpbmcuXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gaXNvU3RyaW5nXHRTdHJpbmcgaW4gSVNPIDg2MDEgZm9ybWF0LiBJbnN0ZWFkIG9mIElTTyB0aW1lIHpvbmUsXG5cdCAqICAgICAgICBpdCBtYXkgaW5jbHVkZSBhIHNwYWNlIGFuZCB0aGVuIGFuZCBJQU5BIHRpbWUgem9uZS5cblx0ICogICAgICAgIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFwiXHRcdFx0XHRcdChubyB0aW1lIHpvbmUsIG5haXZlIGRhdGUpXG5cdCAqICAgICAgICBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDArMDE6MDBcIlx0XHRcdFx0KFVUQyBvZmZzZXQgd2l0aG91dCBkYXlsaWdodCBzYXZpbmcgdGltZSlcblx0ICogICAgICAgIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFpcIlx0XHRcdFx0XHQoVVRDKVxuXHQgKiAgICAgICAgb3IgICBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwIEV1cm9wZS9BbXN0ZXJkYW1cIlx0KElBTkEgdGltZSB6b25lLCB3aXRoIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlmIGFwcGxpY2FibGUpXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0aWYgZ2l2ZW4sIHRoZSBkYXRlIGluIHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGlzIHRpbWUgem9uZS5cblx0ICogICAgICAgIE5vdGUgdGhhdCBpdCBpcyBOT1QgQ09OVkVSVEVEIHRvIHRoZSB0aW1lIHpvbmUuIFVzZWZ1bFxuXHQgKiAgICAgICAgZm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoaXNvU3RyaW5nOiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgc3RyaW5nIGluIGdpdmVuIExETUwgZm9ybWF0LlxuXHQgKiBOT1RFOiBkb2VzIG5vdCBoYW5kbGUgZXJhcy9xdWFydGVycy93ZWVrcy93ZWVrZGF5cy5cblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRlU3RyaW5nXHREYXRlK1RpbWUgc3RyaW5nLlxuXHQgKiBAcGFyYW0gZm9ybWF0IFRoZSBMRE1MIGZvcm1hdCB0aGF0IHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpblxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBOb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcblx0ICogICAgICAgIGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcblx0ICovXG5cdGNvbnN0cnVjdG9yKGRhdGVTdHJpbmc6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBZb3UgcHJvdmlkZSBhIGRhdGUsIHRoZW4geW91IHNheSB3aGV0aGVyIHRvIHRha2UgdGhlXG5cdCAqIGRhdGUuZ2V0WWVhcigpL2dldFh4eCBtZXRob2RzIG9yIHRoZSBkYXRlLmdldFVUQ1llYXIoKS9kYXRlLmdldFVUQ1h4eCBtZXRob2RzLFxuXHQgKiBhbmQgdGhlbiB5b3Ugc3RhdGUgd2hpY2ggdGltZSB6b25lIHRoYXQgZGF0ZSBpcyBpbi5cblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXG5cdCAqIE5vdGUgdGhhdCB0aGUgRGF0ZSBjbGFzcyBoYXMgYnVncyBhbmQgaW5jb25zaXN0ZW5jaWVzIHdoZW4gY29uc3RydWN0aW5nIHRoZW0gd2l0aCB0aW1lcyBhcm91bmRcblx0ICogRFNUIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRlXHRBIGRhdGUgb2JqZWN0LlxuXHQgKiBAcGFyYW0gZ2V0dGVycyBTcGVjaWZpZXMgd2hpY2ggc2V0IG9mIERhdGUgZ2V0dGVycyBjb250YWlucyB0aGUgZGF0ZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lOiB0aGVcblx0ICogICAgICAgIERhdGUuZ2V0WHh4KCkgbWV0aG9kcyBvciB0aGUgRGF0ZS5nZXRVVENYeHgoKSBtZXRob2RzLlxuXHQgKiBAcGFyYW0gdGltZVpvbmUgVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBnaXZlbiBkYXRlIGlzIGFzc3VtZWQgdG8gYmUgaW4gKG1heSBiZSB1bmRlZmluZWQgb3IgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcylcblx0ICovXG5cdGNvbnN0cnVjdG9yKGRhdGU6IERhdGUsIGdldEZ1bmNzOiBEYXRlRnVuY3Rpb25zLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBHZXQgYSBkYXRlIGZyb20gYSBUaW1lU3RydWN0XG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih0bTogVGltZVN0cnVjdCwgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3IuIE5vdGUgdGhhdCB1bmxpa2UgSmF2YVNjcmlwdCBkYXRlcyB3ZSByZXF1aXJlIGZpZWxkcyB0byBiZSBpbiBub3JtYWwgcmFuZ2VzLlxuXHQgKiBVc2UgdGhlIGFkZChkdXJhdGlvbikgb3Igc3ViKGR1cmF0aW9uKSBmb3IgYXJpdGhtZXRpYy5cblx0ICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXIgKGUuZy4gMjAxNClcblx0ICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggWzEtMTJdIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqIEBwYXJhbSBkYXlcdFRoZSBkYXkgb2YgdGhlIG1vbnRoIFsxLTMxXVxuXHQgKiBAcGFyYW0gaG91clx0VGhlIGhvdXIgb2YgdGhlIGRheSBbMC0yNClcblx0ICogQHBhcmFtIG1pbnV0ZVx0VGhlIG1pbnV0ZSBvZiB0aGUgaG91ciBbMC01OV1cblx0ICogQHBhcmFtIHNlY29uZFx0VGhlIHNlY29uZCBvZiB0aGUgbWludXRlIFswLTU5XVxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmRcdFRoZSBtaWxsaXNlY29uZCBvZiB0aGUgc2Vjb25kIFswLTk5OV1cblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgdGltZSB6b25lLCBvciBudWxsL3VuZGVmaW5lZCAoZm9yIHVuYXdhcmUgZGF0ZXMpXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxuXHRcdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaXNlY29uZD86IG51bWJlcixcblx0XHR0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZFxuXHQpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdHRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgdGltZXN0YW1wIGlzIGFzc3VtZWQgdG8gYmUgaW4gKHVzdWFsbHkgVVRDKS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgZG8gbm90IGNhbGxcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGExPzogYW55LCBhMj86IGFueSwgYTM/OiBhbnksXG5cdFx0aD86IG51bWJlciwgbT86IG51bWJlciwgcz86IG51bWJlciwgbXM/OiBudW1iZXIsXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGxcblx0KSB7XG5cdFx0c3dpdGNoICh0eXBlb2YgKGExKSkge1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgYTIgIT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHRhMyA9PT0gdW5kZWZpbmVkICYmIGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZvciB1bml4IHRpbWVzdGFtcCBkYXRldGltZSBjb25zdHJ1Y3RvciwgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogc2Vjb25kIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuXHRcdFx0XHRcdC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKGEyKSA/IGEyIGFzIFRpbWVab25lIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0oYTEgYXMgbnVtYmVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRpbWVab25lID09PSB1bmRlZmluZWQgfHwgdGltZVpvbmUgPT09IG51bGwgfHwgaXNUaW1lWm9uZSh0aW1lWm9uZSksXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGVpZ2h0aCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gYTEgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBtb250aDogbnVtYmVyID0gYTIgYXMgbnVtYmVyO1xuXHRcdFx0XHRcdGxldCBkYXk6IG51bWJlciA9IGEzIGFzIG51bWJlcjtcblx0XHRcdFx0XHRsZXQgaG91cjogbnVtYmVyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XG5cdFx0XHRcdFx0bGV0IHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XG5cdFx0XHRcdFx0bGV0IG1pbGxpOiBudW1iZXIgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG5cdFx0XHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcblx0XHRcdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XG5cdFx0XHRcdFx0bWlsbGkgPSBtYXRoLnJvdW5kU3ltKG1pbGxpKTtcblx0XHRcdFx0XHRjb25zdCB0bSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0XHRcdGFzc2VydCh0bS52YWxpZGF0ZSgpLCBgaW52YWxpZCBkYXRlOiAke3RtLnRvU3RyaW5nKCl9YCk7XG5cblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIGlzVGltZVpvbmUodGltZVpvbmUpID8gdGltZVpvbmUgOiB1bmRlZmluZWQpO1xuXG5cdFx0XHRcdFx0Ly8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRtKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB0bTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgYTIgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHRoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCB0d28gYXJndW1lbnRzIGFyZSBhIHN0cmluZywgdGhlcmVmb3JlIHRoZSBmb3VydGggdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMyksIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGhpcmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG5cdFx0XHRcdFx0Ly8gZm9ybWF0IHN0cmluZyBnaXZlblxuXHRcdFx0XHRcdGNvbnN0IGRhdGVTdHJpbmc6IHN0cmluZyA9IGExIGFzIHN0cmluZztcblx0XHRcdFx0XHRjb25zdCBmb3JtYXRTdHJpbmc6IHN0cmluZyA9IGEyIGFzIHN0cmluZztcblx0XHRcdFx0XHRsZXQgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKGEzKSkge1xuXHRcdFx0XHRcdFx0em9uZSA9IChhMykgYXMgVGltZVpvbmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UoZGF0ZVN0cmluZywgZm9ybWF0U3RyaW5nLCB6b25lKTtcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSBwYXJzZWQuem9uZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHRhMyA9PT0gdW5kZWZpbmVkICYmIGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZpcnN0IGFyZ3VtZW50cyBpcyBhIHN0cmluZyBhbmQgdGhlIHNlY29uZCBpcyBub3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogc2Vjb25kIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuXHRcdFx0XHRcdGNvbnN0IGdpdmVuU3RyaW5nID0gKGExIGFzIHN0cmluZykudHJpbSgpO1xuXHRcdFx0XHRcdGNvbnN0IHNzOiBzdHJpbmdbXSA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xuXHRcdFx0XHRcdGFzc2VydChzcy5sZW5ndGggPT09IDIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgYTEgYXMgc3RyaW5nICsgXCJcXFwiXCIpO1xuXHRcdFx0XHRcdGlmIChpc1RpbWVab25lKGEyKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMikgYXMgVGltZVpvbmU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoc3NbMV0udHJpbSgpID8gVGltZVpvbmUuem9uZShzc1sxXSkgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcblx0XHRcdFx0XHQvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xuXHRcdFx0XHRpZiAoYTEgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0aCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0JiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFwiZmlyc3QgYXJndW1lbnQgaXMgYSBEYXRlLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHR0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiAmJiAoYTIgPT09IERhdGVGdW5jdGlvbnMuR2V0IHx8IGEyID09PSBEYXRlRnVuY3Rpb25zLkdldFVUQyksXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMyksIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGhpcmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG5cdFx0XHRcdFx0Y29uc3QgZDogRGF0ZSA9IChhMSkgYXMgRGF0ZTtcblx0XHRcdFx0XHRjb25zdCBkazogRGF0ZUZ1bmN0aW9ucyA9IChhMikgYXMgRGF0ZUZ1bmN0aW9ucztcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgeyAvLyBhMSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3Rcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHRhMyA9PT0gdW5kZWZpbmVkICYmIGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZpcnN0IGFyZ3VtZW50IGlzIGEgVGltZVN0cnVjdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhc3NlcnQoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEyKSwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBhMS5jbG9uZSgpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHtcblx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdGEyID09PSB1bmRlZmluZWQgJiYgYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0JiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcImZpcnN0IGFyZ3VtZW50IGlzIHVuZGVmaW5lZCwgdGhlcmVmb3JlIHRoZSByZXN0IG11c3QgYWxzbyBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS5sb2NhbCgpO1xuXHRcdFx0XHR0aGlzLl91dGNEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQyk7XG5cdFx0XHR9ICAgICAgICAgICAgICAgICBicmVhaztcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XG5cdCAqL1xuXHRwdWJsaWMgY2xvbmUoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdGhpcy5fem9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSB1bmRlZmluZWQgZm9yIHVuYXdhcmUgZGF0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgem9uZSgpOiBUaW1lWm9uZSB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX3pvbmU7XG5cdH1cblxuXHQvKipcblx0ICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuXHQgKiBAcmV0dXJuIFRoZSBhYmJyZXZpYXRpb25cblx0ICovXG5cdHB1YmxpYyB6b25lQWJicmV2aWF0aW9uKGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fem9uZS5hYmJyZXZpYXRpb25Gb3JVdGModGhpcy51dGNEYXRlLCBkc3REZXBlbmRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW5jbHVkaW5nIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBEdXJhdGlvbi5taWxsaXNlY29uZHMoTWF0aC5yb3VuZCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBXSVRIT1VUIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXREdXJhdGlvbigpOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy51dGNEYXRlKSk7XG5cdFx0fVxuXHRcdHJldHVybiBEdXJhdGlvbi5taW51dGVzKDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcblx0ICovXG5cdHB1YmxpYyB5ZWFyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcblx0ICovXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgZGF5IG9mIHRoZSBtb250aCAxLTMxXG5cdCAqL1xuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgaG91ciAwLTIzXG5cdCAqL1xuXHRwdWJsaWMgaG91cigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcblx0ICovXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBzZWNvbmRzIDAtNTlcblx0ICovXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcblx0ICovXG5cdHB1YmxpYyBtaWxsaXNlY29uZCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcblx0ICogd2VlayBkYXkgbnVtYmVycylcblx0ICovXG5cdHB1YmxpYyB3ZWVrRGF5KCk6IFdlZWtEYXkge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy56b25lRGF0ZS51bml4TWlsbGlzKSBhcyBXZWVrRGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxuXHQgKlxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXG5cdCAqL1xuXHRwdWJsaWMgZGF5T2ZZZWFyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cblx0ICovXG5cdHB1YmxpYyB3ZWVrTnVtYmVyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxuXHQgKlxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXG5cdCAqL1xuXHRwdWJsaWMgd2Vla09mTW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xuXHQgKlxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcblx0ICovXG5cdHB1YmxpYyB1bml4VXRjTWlsbGlzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcblx0ICovXG5cdHB1YmxpYyB1dGNZZWFyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnllYXI7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcblx0ICovXG5cdHB1YmxpYyB1dGNNb250aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5tb250aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXG5cdCAqL1xuXHRwdWJsaWMgdXRjRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXG5cdCAqL1xuXHRwdWJsaWMgdXRjSG91cigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5ob3VyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcblx0ICovXG5cdHB1YmxpYyB1dGNNaW51dGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWludXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcblx0ICovXG5cdHB1YmxpYyB1dGNTZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cblx0ICpcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxuXHQgKi9cblx0cHVibGljIHV0Y0RheU9mWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaWxsaXNlY29uZHMgMC05OTlcblx0ICovXG5cdHB1YmxpYyB1dGNNaWxsaXNlY29uZCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taWxsaTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcblx0ICogd2VlayBkYXkgbnVtYmVycylcblx0ICovXG5cdHB1YmxpYyB1dGNXZWVrRGF5KCk6IFdlZWtEYXkge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIGFzIFdlZWtEYXk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cblx0ICovXG5cdHB1YmxpYyB1dGNXZWVrTnVtYmVyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxuXHQgKlxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla09mTW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xuXHQgKlxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXG5cdCAqL1xuXHRwdWJsaWMgdXRjU2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lIHdoaWNoIGlzIHRoZSBkYXRlK3RpbWUgcmVpbnRlcnByZXRlZCBhc1xuXHQgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxuXHQgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cblx0ICogV29ya3MgZm9yIG5haXZlIGFuZCBhd2FyZSBkYXRlcy4gVGhlIG5ldyB6b25lIG1heSBiZSBudWxsLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxuXHQgKiBAcmV0dXJuIEEgbmV3IERhdGVUaW1lIHdpdGggdGhlIG9yaWdpbmFsIHRpbWVzdGFtcCBhbmQgdGhlIG5ldyB6b25lLlxuXHQgKi9cblx0cHVibGljIHdpdGhab25lKHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcblx0XHRcdHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLFxuXHRcdFx0em9uZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxuXHQgKiBUaHJvd3MgaWYgdGhpcyBkYXRlIGRvZXMgbm90IGhhdmUgYSB0aW1lIHpvbmUuXG5cdCAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxuXHQgKi9cblx0cHVibGljIGNvbnZlcnQoem9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRpZiAoem9uZSkge1xuXHRcdFx0aWYgKCF0aGlzLl96b25lKSB7IC8vIGlmLXN0YXRlbWVudCBzYXRpc2ZpZXMgdGhlIGNvbXBpbGVyXG5cdFx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7IC8vIHN0aWxsIGFzc2lnbiwgYmVjYXVzZSB6b25lcyBtYXkgYmUgZXF1YWwgYnV0IG5vdCBpZGVudGljYWwgKFVUQy9HTVQvKzAwKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCF0aGlzLl91dGNEYXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSBhcyBUaW1lU3RydWN0LCB0aGlzLl96b25lKTsgLy8gY2F1c2Ugem9uZSAtPiB1dGMgY29udmVyc2lvblxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lO1xuXHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCF0aGlzLl96b25lKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0aGlzLl96b25lRGF0ZSkge1xuXHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl96b25lID0gdW5kZWZpbmVkO1xuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoaXMgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHRpbWUgem9uZS5cblx0ICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXG5cdCAqIENvbnZlcnRpbmcgYW4gdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGUgdGhyb3dzIGFuIGV4Y2VwdGlvbi4gVXNlIHRoZSBjb25zdHJ1Y3RvclxuXHQgKiBpZiB5b3UgcmVhbGx5IG5lZWQgdG8gZG8gdGhhdC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVcdFRoZSBuZXcgdGltZSB6b25lLiBUaGlzIG1heSBiZSBudWxsIG9yIHVuZGVmaW5lZCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxuXHQgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxuXHQgKi9cblx0cHVibGljIHRvWm9uZSh6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdGlmICh6b25lKSB7XG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBuZXcgRGF0ZVRpbWUoKTtcblx0XHRcdHJlc3VsdC51dGNEYXRlID0gdGhpcy51dGNEYXRlO1xuXHRcdFx0cmVzdWx0Ll96b25lID0gem9uZTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cblx0ICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cblx0ICogVGhpcyBpcyBiZWNhdXNlIERhdGUgY2FsY3VsYXRlcyBnZXRVVENYKCkgZnJvbSBnZXRYKCkgYXBwbHlpbmcgbG9jYWwgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIHRvRGF0ZSgpOiBEYXRlIHtcblx0XHRyZXR1cm4gbmV3IERhdGUoXG5cdFx0XHR0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSxcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcblx0ICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuXHQgKi9cblx0cHVibGljIHRvRXhjZWwodGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuXHRcdGxldCBkdDogRGF0ZVRpbWUgPSB0aGlzO1xuXHRcdGlmICh0aW1lWm9uZSAmJiAoIXRoaXMuX3pvbmUgfHwgIXRpbWVab25lLmVxdWFscyh0aGlzLl96b25lKSkpIHtcblx0XHRcdGR0ID0gdGhpcy50b1pvbmUodGltZVpvbmUpO1xuXHRcdH1cblx0XHRjb25zdCBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcblx0XHRjb25zdCB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuXHQgKi9cblx0cHVibGljIHRvVXRjRXhjZWwoKTogbnVtYmVyIHtcblx0XHRjb25zdCB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xuXHR9XG5cblx0cHJpdmF0ZSBfdW5peFRpbWVTdGFtcFRvRXhjZWwobjogbnVtYmVyKTogbnVtYmVyIHtcblx0XHRjb25zdCByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xuXHRcdC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcblx0XHRjb25zdCBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKG1zZWNzKSAqICgxIC8gODY0MDAwMDApO1xuXHR9XG5cblxuXHQvKipcblx0ICogQWRkIGEgdGltZSBkdXJhdGlvbiByZWxhdGl2ZSB0byBVVEMuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICogQHJldHVybiB0aGlzICsgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBhZGQoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgcmVsYXRpdmUgdG8gVVRDLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICpcblx0ICogQWRkaW5nIGUuZy4gMSBob3VyIHdpbGwgaW5jcmVtZW50IHRoZSB1dGNIb3VyKCkgZmllbGQsIGFkZGluZyAxIG1vbnRoXG5cdCAqIGluY3JlbWVudHMgdGhlIHV0Y01vbnRoKCkgZmllbGQuXG5cdCAqIEFkZGluZyBhbiBhbW91bnQgb2YgdW5pdHMgbGVhdmVzIGxvd2VyIHVuaXRzIGludGFjdC4gRS5nLlxuXHQgKiBhZGRpbmcgYSBtb250aCB3aWxsIGxlYXZlIHRoZSBkYXkoKSBmaWVsZCB1bnRvdWNoZWQgaWYgcG9zc2libGUuXG5cdCAqXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXG5cdCAqXG5cdCAqIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB1dGMgdGltZSBmaWVsZHMgYXJlIHN0aWxsIHVudG91Y2hlZCBidXQgbG9jYWxcblx0ICogdGltZSBmaWVsZHMgbWF5IHNoaWZ0LlxuXHQgKi9cblx0cHVibGljIGFkZChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcblx0LyoqXG5cdCAqIEltcGxlbWVudGF0aW9uLlxuXHQgKi9cblx0cHVibGljIGFkZChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xuXHRcdGxldCB1OiBUaW1lVW5pdDtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IChhMSkgYXMgRHVyYXRpb247XG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRhbW91bnQgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHUgPSB1bml0IGFzIFRpbWVVbml0O1xuXHRcdH1cblx0XHRjb25zdCB1dGNUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnV0Y0RhdGUsIGFtb3VudCwgdSk7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1dGNUbSwgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIHpvbmUgdGltZSwgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgaG91cigpIGZpZWxkIG9mIHRoZSB6b25lXG5cdCAqIGRhdGUgYnkgb25lLiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdGltZSBmaWVsZHMgbWF5IGFkZGl0aW9uYWxseVxuXHQgKiBpbmNyZWFzZSBieSB0aGUgRFNUIG9mZnNldCwgaWYgYSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSB3b3VsZFxuXHQgKiBiZSByZWFjaGVkIG90aGVyd2lzZS5cblx0ICpcblx0ICogQWRkaW5nIGEgdW5pdCBvZiB0aW1lIHdpbGwgbGVhdmUgbG93ZXItdW5pdCBmaWVsZHMgaW50YWN0LCB1bmxlc3MgdGhlIHJlc3VsdFxuXHQgKiB3b3VsZCBiZSBhIG5vbi1leGlzdGluZyB0aW1lLiBUaGVuIGFuIGV4dHJhIERTVCBvZmZzZXQgaXMgYWRkZWQuXG5cdCAqXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXG5cdCAqL1xuXHRwdWJsaWMgYWRkTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBhZGRMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcblx0cHVibGljIGFkZExvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcblx0XHRsZXQgYW1vdW50OiBudW1iZXI7XG5cdFx0bGV0IHU6IFRpbWVVbml0O1xuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gKGExKSBhcyBEdXJhdGlvbjtcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcblx0XHRcdGFtb3VudCA9IChhMSkgYXMgbnVtYmVyO1xuXHRcdFx0dSA9IHVuaXQgYXMgVGltZVVuaXQ7XG5cdFx0fVxuXHRcdGNvbnN0IGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0Y29uc3QgZGlyZWN0aW9uOiBOb3JtYWxpemVPcHRpb24gPSAoYW1vdW50ID49IDAgPyBOb3JtYWxpemVPcHRpb24uVXAgOiBOb3JtYWxpemVPcHRpb24uRG93bik7XG5cdFx0XHRjb25zdCBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShub3JtYWxpemVkLCB0aGlzLl96b25lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLCB1bmRlZmluZWQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIGdpdmVuIHRpbWUgc3RydWN0LiBOb3RlOiBkb2VzIG5vdCBub3JtYWxpemUuXG5cdCAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxuXHQgKiBuZWNlc3NhcnkuXG5cdCAqL1xuXHRwcml2YXRlIF9hZGRUb1RpbWVTdHJ1Y3QodG06IFRpbWVTdHJ1Y3QsIGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdGxldCB5ZWFyOiBudW1iZXI7XG5cdFx0bGV0IG1vbnRoOiBudW1iZXI7XG5cdFx0bGV0IGRheTogbnVtYmVyO1xuXHRcdGxldCBob3VyOiBudW1iZXI7XG5cdFx0bGV0IG1pbnV0ZTogbnVtYmVyO1xuXHRcdGxldCBzZWNvbmQ6IG51bWJlcjtcblx0XHRsZXQgbWlsbGk6IG51bWJlcjtcblxuXHRcdHN3aXRjaCAodW5pdCkge1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAxMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDg2NDAwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHtcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XG5cdFx0XHRcdC8vIGtlZXAgdGhlIGRheS1vZi1tb250aCB0aGUgc2FtZSAoY2xhbXAgdG8gZW5kLW9mLW1vbnRoKVxuXHRcdFx0XHRpZiAoYW1vdW50ID49IDApIHtcblx0XHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5jb21wb25lbnRzLm1vbnRoKSkgLyAxMik7XG5cdFx0XHRcdFx0bW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSkpIC8gMTIpO1xuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xuXHRcdFx0XHRtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcblx0XHRcdFx0c2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgeWVhcnNcIik7XG5cdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBhbW91bnQ7XG5cdFx0XHRcdG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcblx0XHRcdFx0ZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xuXHRcdFx0XHRob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xuXHRcdFx0XHRtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcblx0XHRcdFx0c2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XG5cdFx0XHRcdG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pO1xuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmR1cmF0aW9uKTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN1YihkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcblx0LyoqXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdWIoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBzdWIoYTE6IG51bWJlciB8IER1cmF0aW9uLCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHR5cGVvZiBhMSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0Y29uc3QgYW1vdW50OiBudW1iZXIgPSBhMSBhcyBudW1iZXI7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQgYXMgVGltZVVuaXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBkdXJhdGlvbjogRHVyYXRpb24gPSBhMSBhcyBEdXJhdGlvbjtcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZExvY2FsKC0xKmFtb3VudCwgdW5pdCk7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdWJMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcblx0cHVibGljIHN1YkxvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKChhMSBhcyBEdXJhdGlvbikubXVsdGlwbHkoLTEpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoLTEgKiBhMSBhcyBudW1iZXIsIHVuaXQgYXMgVGltZVVuaXQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXG5cdCAqIEByZXR1cm4gdGhpcyAtIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZGlmZihvdGhlcjogRGF0ZVRpbWUpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnRPZkRheSgpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnRPZk1vbnRoKCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0T2ZZZWFyKCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxuXHQgKi9cblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxuXHQgKi9cblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPD0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xuXHQgKi9cblx0cHVibGljIGVxdWFscyhvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGFuZCB0aGUgc2FtZSB6b25lXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhISh0aGlzLnpvbmVEYXRlLmVxdWFscyhvdGhlci56b25lRGF0ZSlcblx0XHRcdCYmICghdGhpcy5fem9uZSkgPT09ICghb3RoZXIuX3pvbmUpXG5cdFx0XHQmJiAoKCF0aGlzLl96b25lICYmICFvdGhlci5fem9uZSkgfHwgKHRoaXMuX3pvbmUgJiYgb3RoZXIuX3pvbmUgJiYgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKSlcblx0XHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyVGhhbihvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgbWluaW11bSBvZiB0aGlzIGFuZCBvdGhlclxuXHQgKi9cblx0cHVibGljIG1pbihvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgbWF4KG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRjb25zdCBzOiBzdHJpbmcgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdHJldHVybiBzICsgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgRGF0ZVRpbWUgYWNjb3JkaW5nIHRvIHRoZVxuXHQgKiBzcGVjaWZpZWQgZm9ybWF0LiBTZWUgTERNTC5tZCBmb3Igc3VwcG9ydGVkIGZvcm1hdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxuXHQgKiBAcGFyYW0gbG9jYWxlIE9wdGlvbmFsLCBub24tZW5nbGlzaCBmb3JtYXQgbW9udGggbmFtZXMgZXRjLlxuXHQgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIGZvcm1hdChmb3JtYXRTdHJpbmc6IHN0cmluZywgbG9jYWxlPzogUGFydGlhbExvY2FsZSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy56b25lRGF0ZSwgdGhpcy51dGNEYXRlLCB0aGlzLl96b25lLCBmb3JtYXRTdHJpbmcsIGxvY2FsZSk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XG5cdCAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2Vcblx0ICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW4uIFNlZSBMRE1MLm1kIGZvciBzdXBwb3J0ZWQgZm9ybWF0cy5cblx0ICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxuXHQgKiBAcGFyYW0gbG9jYWxlIE9wdGlvbmFsLCBkaWZmZXJlbnQgc2V0dGluZ3MgZm9yIGNvbnN0YW50cyBsaWtlICdBTScgZXRjXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHBhcnNlKHM6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHpvbmU/OiBUaW1lWm9uZSwgbG9jYWxlPzogUGFydGlhbExvY2FsZSk6IERhdGVUaW1lIHtcblx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKHMsIGZvcm1hdCwgem9uZSwgZmFsc2UsIGxvY2FsZSk7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShwYXJzZWQudGltZSwgcGFyc2VkLnpvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMuMDAwIEV1cm9wZS9BbXN0ZXJkYW1cIlxuXHQgKi9cblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0Y29uc3Qgczogc3RyaW5nID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IFRpbWVab25lS2luZC5PZmZzZXQpIHtcblx0XHRcdFx0cmV0dXJuIHMgKyBcIiBcIiArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gc2VwYXJhdGUgSUFOQSBuYW1lIG9yIFwibG9jYWx0aW1lXCIgd2l0aCBhIHNwYWNlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHZhbHVlT2YoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XG5cdH1cblxuXHQvKipcblx0ICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyBpbiBVVEMgd2l0aG91dCB0aW1lIHpvbmUgaW5mb1xuXHQgKi9cblx0cHVibGljIHRvVXRjU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNwbGl0IGEgY29tYmluZWQgSVNPIGRhdGV0aW1lIGFuZCB0aW1lem9uZSBpbnRvIGRhdGV0aW1lIGFuZCB0aW1lem9uZVxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShzOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgdHJpbW1lZCA9IHMudHJpbSgpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcblx0XHRsZXQgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwid2l0aG91dCBEU1RcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUocy5zbGljZSgwLCBpbmRleCAtIDEpKTtcblx0XHRcdHJlc3VsdFsxXSArPSBcIiB3aXRob3V0IERTVFwiO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XG5cdFx0aWYgKGluZGV4IDwgOCkge1xuXHRcdFx0aW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXG5cdFx0fVxuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRyZXN1bHRbMF0gPSB0cmltbWVkO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBgYWAgaXMgc2ltaWxhciB0byBhIFRpbWVab25lIHdpdGhvdXQgdXNpbmcgdGhlIGluc3RhbmNlb2Ygb3BlcmF0b3IuXG4gKiBJdCBjaGVja3MgZm9yIHRoZSBhdmFpbGFiaWxpdHkgb2YgdGhlIGZ1bmN0aW9ucyB1c2VkIGluIHRoZSBEYXRlVGltZSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIGEgdGhlIG9iamVjdCB0byBjaGVja1xuICogQHJldHVybnMgYSBpcyBUaW1lWm9uZS1saWtlXG4gKi9cbmZ1bmN0aW9uIGlzVGltZVpvbmUoYTogYW55KTogYSBpcyBUaW1lWm9uZSB7XG5cdGlmIChhICYmIHR5cGVvZiBhID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKFxuXHRcdFx0dHlwZW9mIGEubm9ybWFsaXplWm9uZVRpbWUgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0JiYgdHlwZW9mIGEuYWJicmV2aWF0aW9uRm9yVXRjID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdCYmIHR5cGVvZiBhLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdCYmIHR5cGVvZiBhLmlkZW50aWNhbCA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQmJiB0eXBlb2YgYS5lcXVhbHMgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0JiYgdHlwZW9mIGEua2luZCA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQmJiB0eXBlb2YgYS5jbG9uZSA9PT0gXCJmdW5jdGlvblwiXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIFRpbWUgZHVyYXRpb25cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IFRpbWVVbml0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcblxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLnllYXJzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLm1vbnRocyhuKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdHJldHVybiBEdXJhdGlvbi5kYXlzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLmhvdXJzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24uc2Vjb25kcyhuKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdHJldHVybiBEdXJhdGlvbi5taWxsaXNlY29uZHMobik7XG59XG5cbi8qKlxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxuICpcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxuICogICBUaGVzZSByZXR1cm4gYSBwYXJ0IG9mIHlvdXIgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiBFLmcuIGZvciAyNTAwIG1pbGxpc2Vjb25kcywgdGhlIG1pbGxpc2Vjb25kKCkgcGFydCB3b3VsZCBiZSA1MDBcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cbiAqL1xuZXhwb3J0IGNsYXNzIER1cmF0aW9uIHtcblxuXHRwdWJsaWMga2luZCA9IFwiRHVyYXRpb25cIjtcblxuXHQvKipcblx0ICogR2l2ZW4gYW1vdW50IGluIGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRwcml2YXRlIF9hbW91bnQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVW5pdFxuXHQgKi9cblx0cHJpdmF0ZSBfdW5pdDogVGltZVVuaXQ7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHllYXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LlllYXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbW9udGhzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1vbnRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZGF5cyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5EYXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGhvdXJzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LkhvdXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBtaW51dGVzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0Lk1pbnV0ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuU2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG1pbGxpc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvbiBvZiAwXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uIGZyb20gYSBzdHJpbmcgaW4gb25lIG9mIHR3byBmb3JtYXRzOlxuXHQgKiAxKSBbLV1oaGhoWzptbVs6c3NbLm5ubl1dXSBlLmcuICctMDE6MDA6MzAuNTAxJ1xuXHQgKiAyKSBhbW91bnQgYW5kIHVuaXQgZS5nLiAnLTEgZGF5cycgb3IgJzEgeWVhcicuIFRoZSB1bml0IG1heSBiZSBpbiBzaW5ndWxhciBvciBwbHVyYWwgZm9ybSBhbmQgaXMgY2FzZS1pbnNlbnNpdGl2ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoaW5wdXQ6IHN0cmluZyk7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIGR1cmF0aW9uIGZyb20gYW4gYW1vdW50IGFuZCBhIHRpbWUgdW5pdC5cblx0ICogQHBhcmFtIGFtb3VudFx0TnVtYmVyIG9mIHVuaXRzXG5cdCAqIEBwYXJhbSB1bml0XHRBIHRpbWUgdW5pdCBpLmUuIFRpbWVVbml0LlNlY29uZCwgVGltZVVuaXQuSG91ciBldGMuIERlZmF1bHQgTWlsbGlzZWNvbmQuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihhbW91bnQ6IG51bWJlciwgdW5pdD86IFRpbWVVbml0KTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cblx0ICovXG5cdGNvbnN0cnVjdG9yKGkxPzogYW55LCB1bml0PzogVGltZVVuaXQpIHtcblx0XHRpZiAodHlwZW9mIChpMSkgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXG5cdFx0XHRjb25zdCBhbW91bnQgPSBpMSBhcyBudW1iZXI7XG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdFx0XHR0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiAoaTEpID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvLyBzdHJpbmcgY29uc3RydWN0b3Jcblx0XHRcdHRoaXMuX2Zyb21TdHJpbmcoaTEgYXMgc3RyaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZGVmYXVsdCBjb25zdHJ1Y3RvclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gMDtcblx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBhbm90aGVyIGluc3RhbmNlIG9mIER1cmF0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWUuXG5cdCAqL1xuXHRwdWJsaWMgY2xvbmUoKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50LCB0aGlzLl91bml0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXG5cdCAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cblx0ICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXG5cdCAqL1xuXHRwdWJsaWMgYXModW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xuXHRcdGlmICh0aGlzLl91bml0ID09PSB1bml0KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBUaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IFRpbWVVbml0Lk1vbnRoKSB7XG5cdFx0XHRjb25zdCB0aGlzTW9udGhzID0gKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xuXHRcdFx0Y29uc3QgcmVxTW9udGhzID0gKHVuaXQgPT09IFRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNb250aHMgLyByZXFNb250aHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XG5cdFx0XHRjb25zdCByZXFNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCk7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01zZWMgLyByZXFNc2VjO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IHRoaXMgZHVyYXRpb24gdG8gYSBEdXJhdGlvbiBpbiBhbm90aGVyIHVuaXQuIFlvdSBhbHdheXMgZ2V0IGEgY2xvbmUgZXZlbiBpZiB5b3Ugc3BlY2lmeVxuXHQgKiB0aGUgc2FtZSB1bml0LlxuXHQgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxuXHQgKi9cblx0cHVibGljIGNvbnZlcnQodW5pdDogVGltZVVuaXQpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLmFzKHVuaXQpLCB1bml0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqL1xuXHRwdWJsaWMgbWlsbGlzZWNvbmRzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtaWxsaXNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBtaWxsaXNlY29uZCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuU2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbnV0ZXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIG1pbnV0ZXMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5NaW51dGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtaW51dGUgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIG1pbnV0ZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1pbnV0ZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBob3VycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBob3VycygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkhvdXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBob3VyIHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBkYXkgaGFzIDI0IGhvdXJzICh3aGljaCBpcyBub3QgdGhlIGNhc2Vcblx0ICogZHVyaW5nIERTVCBjaGFuZ2VzKS5cblx0ICovXG5cdHB1YmxpYyBob3VyKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuSG91cik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXG5cdCAqIE5vdGUgdGhhdCB0aGlzIHBhcnQgY2FuIGV4Y2VlZCAyMyBob3VycywgYmVjYXVzZSBmb3Jcblx0ICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMjUgZm9yIGEgLTI1OjAyOjAzLjQwMCBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIHdob2xlSG91cnMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAzNjAwMDAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXG5cdCAqL1xuXHRwdWJsaWMgZGF5cygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LkRheSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGRheSBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgbW9udGggaGFzIDMwIGRheXMuXG5cdCAqL1xuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcnQoVGltZVVuaXQuRGF5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcblx0ICovXG5cdHB1YmxpYyBtb250aHMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Nb250aCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1vbnRoIHBhcnQgb2YgYSBkdXJhdGlvbi5cblx0ICovXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0Lk1vbnRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXG5cdCAqL1xuXHRwdWJsaWMgeWVhcnMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5ZZWFyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOb24tZnJhY3Rpb25hbCBwb3NpdGl2ZSB5ZWFyc1xuXHQgKi9cblx0cHVibGljIHdob2xlWWVhcnMoKTogbnVtYmVyIHtcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhcikge1xuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5Nb250aCkge1xuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDEyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cblx0XHRcdFx0YmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoVGltZVVuaXQuWWVhcikpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKi9cblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9hbW91bnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHVuaXQgdGhpcyBkdXJhdGlvbiB3YXMgY3JlYXRlZCB3aXRoXG5cdCAqL1xuXHRwdWJsaWMgdW5pdCgpOiBUaW1lVW5pdCB7XG5cdFx0cmV0dXJuIHRoaXMuX3VuaXQ7XG5cdH1cblxuXHQvKipcblx0ICogU2lnblxuXHQgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxuXHQgKi9cblx0cHVibGljIHNpZ24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxuXHQgKi9cblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDwgb3RoZXIubWlsbGlzZWNvbmRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxuXHQgKi9cblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8PSBvdGhlci5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGVxdWFscyhvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRjb25zdCBjb252ZXJ0ZWQgPSBvdGhlci5jb252ZXJ0KHRoaXMuX3VuaXQpO1xuXHRcdHJldHVybiB0aGlzLl9hbW91bnQgPT09IGNvbnZlcnRlZC5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBjb252ZXJ0ZWQudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcblx0ICogUmV0dXJucyBmYWxzZSBpZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgZXF1YWwgaW4gYWxsIHRpbWUgem9uZXNcblx0ICogc28gZS5nLiA2MCBtaW51dGVzIGVxdWFscyAxIGhvdXIsIGJ1dCAyNCBob3VycyBkbyBOT1QgZXF1YWwgMSBkYXlcblx0ICpcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIGVxdWFsc0V4YWN0KG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLl91bml0ID09PSBvdGhlci5fdW5pdCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLl9hbW91bnQgPT09IG90aGVyLl9hbW91bnQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBUaW1lVW5pdC5Nb250aCAmJiBvdGhlci51bml0KCkgPj0gVGltZVVuaXQuTW9udGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1vbnRocyBhbmQgeWVhcnNcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPCBUaW1lVW5pdC5EYXkgJiYgb3RoZXIudW5pdCgpIDwgVGltZVVuaXQuRGF5KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtaWxsaXNlY29uZHMgdGhyb3VnaCBob3Vyc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGNhbm5vdCBjb21wYXJlIGRheXMgdG8gYW55dGhpbmcgZWxzZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYW1lIHVuaXQgYW5kIHNhbWUgYW1vdW50XG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9hbW91bnQgPT09IG90aGVyLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IG90aGVyLnVuaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxuXHQgKi9cblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVGhlIG1pbmltdW0gKG1vc3QgbmVnYXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgbWluKG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSAobW9zdCBwb3NpdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtYXgob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogTXVsdGlwbHkgd2l0aCBhIGZpeGVkIG51bWJlci5cblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXG5cdCAqL1xuXHRwdWJsaWMgbXVsdGlwbHkodmFsdWU6IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXZpZGUgYnkgYSB1bml0bGVzcyBudW1iZXIuIFRoZSByZXN1bHQgaXMgYSBEdXJhdGlvbiwgZS5nLiAxIHllYXIgLyAyID0gMC41IHllYXJcblx0ICogVGhlIHJlc3VsdCBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGFzIGEgdW5pdCB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgKGUuZy4gMSBtb250aCBoYXMgdmFyaWFibGUgbGVuZ3RoKVxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXG5cdCAqL1xuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbjtcblx0LyoqXG5cdCAqIERpdmlkZSB0aGlzIER1cmF0aW9uIGJ5IGEgRHVyYXRpb24uIFRoZSByZXN1bHQgaXMgYSB1bml0bGVzcyBudW1iZXIgZS5nLiAxIHllYXIgLyAxIG1vbnRoID0gMTJcblx0ICogVGhlIHJlc3VsdCBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGFzIGEgdW5pdCB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgKGUuZy4gMSBtb250aCBoYXMgdmFyaWFibGUgbGVuZ3RoKVxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXG5cdCAqL1xuXHRwdWJsaWMgZGl2aWRlKHZhbHVlOiBEdXJhdGlvbik6IG51bWJlcjtcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyIHwgRHVyYXRpb24pOiBEdXJhdGlvbiB8IG51bWJlciB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodmFsdWUuX2Ftb3VudCA9PT0gMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbi5kaXZpZGUoKTogRGl2aWRlIGJ5IHplcm8gZHVyYXRpb25cIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSAvIHZhbHVlLm1pbGxpc2Vjb25kcygpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYSBkdXJhdGlvbi5cblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyArIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBhZGQodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICsgdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgc3ViKHZhbHVlOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkdXJhdGlvbiBpLmUuIHJlbW92ZSB0aGUgc2lnbi5cblx0ICovXG5cdHB1YmxpYyBhYnMoKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLl9hbW91bnQgPj0gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHkoLTEpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlXG5cdCAqIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi5cblx0ICovXG5cdHB1YmxpYyB0b0Z1bGxTdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy50b0htc1N0cmluZyh0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbVs6c3NbLm5ubl1dIG5vdGF0aW9uLlxuXHQgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcblx0ICogICAgICAgICAgICAgYXJlIGNob3BwZWQgb2ZmIGlmIHplcm9cblx0ICovXG5cdHB1YmxpYyB0b0htc1N0cmluZyhmdWxsOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuXHRcdGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XG5cdFx0aWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xuXHRcdFx0cmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xuXHRcdH1cblx0XHRpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLnNlY29uZCgpID4gMCkge1xuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5zZWNvbmQoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcblx0XHR9XG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5taW51dGUoKSA+IDApIHtcblx0XHRcdHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxuXHQgKi9cblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0c3dpdGNoICh0aGlzLl91bml0KSB7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArICh0aGlzLl9hbW91bnQgLyAxMDAwKS50b0ZpeGVkKDMpICsgXCJTXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZToge1xuXHRcdFx0XHRyZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiSFwiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xuXHQgKi9cblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHZhbHVlT2YoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcGFydCh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XG5cdFx0bGV0IG5leHRVbml0OiBUaW1lVW5pdDtcblx0XHQvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcblx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IG5leHRVbml0ID0gVGltZVVuaXQuU2Vjb25kOyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogbmV4dFVuaXQgPSBUaW1lVW5pdC5Ib3VyOyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjogbmV4dFVuaXQgPSBUaW1lVW5pdC5EYXk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IG5leHRVbml0ID0gVGltZVVuaXQuTW9udGg7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDogbmV4dFVuaXQgPSBUaW1lVW5pdC5ZZWFyOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoVGltZVVuaXQuWWVhcikpKTtcblx0XHR9XG5cblx0XHRjb25zdCBtc2VjcyA9IChiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpICUgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMobmV4dFVuaXQpO1xuXHRcdHJldHVybiBNYXRoLmZsb29yKG1zZWNzIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCkpO1xuXHR9XG5cblxuXHRwcml2YXRlIF9mcm9tU3RyaW5nKHM6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcblx0XHRpZiAodHJpbW1lZC5tYXRjaCgvXi0/XFxkXFxkPyg6XFxkXFxkPyg6XFxkXFxkPyguXFxkXFxkP1xcZD8pPyk/KT8kLykpIHtcblx0XHRcdGxldCBzaWduOiBudW1iZXIgPSAxO1xuXHRcdFx0bGV0IGhvdXJzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IG1pbnV0ZXM6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgc2Vjb25kczogbnVtYmVyID0gMDtcblx0XHRcdGxldCBtaWxsaXNlY29uZHM6IG51bWJlciA9IDA7XG5cdFx0XHRjb25zdCBwYXJ0czogc3RyaW5nW10gPSB0cmltbWVkLnNwbGl0KFwiOlwiKTtcblx0XHRcdGFzc2VydChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xuXHRcdFx0aWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xuXHRcdFx0XHRzaWduID0gLTE7XG5cdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0aG91cnMgPSArcGFydHNbMF07XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRtaW51dGVzID0gK3BhcnRzWzFdO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0Y29uc3Qgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XG5cdFx0XHRcdHNlY29uZHMgPSArc2Vjb25kUGFydHNbMF07XG5cdFx0XHRcdGlmIChzZWNvbmRQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0bWlsbGlzZWNvbmRzID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyArIDEwMDAgKiBzZWNvbmRzICsgNjAwMDAgKiBtaW51dGVzICsgMzYwMDAwMCAqIGhvdXJzKTtcblx0XHRcdC8vIGZpbmQgbG93ZXN0IG5vbi16ZXJvIG51bWJlciBhbmQgdGFrZSB0aGF0IGFzIHVuaXRcblx0XHRcdGlmIChtaWxsaXNlY29uZHMgIT09IDApIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xuXHRcdFx0fSBlbHNlIGlmIChzZWNvbmRzICE9PSAwKSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG5cdFx0XHR9IGVsc2UgaWYgKG1pbnV0ZXMgIT09IDApIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHRcdH0gZWxzZSBpZiAoaG91cnMgIT09IDApIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnRNc2VjIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcblx0XHRcdGlmIChzcGxpdC5sZW5ndGggIT09IDIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInXCIpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYW1vdW50ID0gcGFyc2VGbG9hdChzcGxpdFswXSk7XG5cdFx0XHRhc3NlcnQoIWlzTmFOKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBjYW5ub3QgcGFyc2UgYW1vdW50XCIpO1xuXHRcdFx0YXNzZXJ0KGlzRmluaXRlKGFtb3VudCksIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnXCIgKyBzICsgXCInLCBhbW91bnQgaXMgaW5maW5pdGVcIik7XG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdFx0XHR0aGlzLl91bml0ID0gYmFzaWNzLnN0cmluZ1RvVGltZVVuaXQoc3BsaXRbMV0pO1xuXHRcdH1cblx0fVxufVxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBERUZBVUxUX0xPQ0FMRSwgTG9jYWxlLCBQYXJ0aWFsTG9jYWxlIH0gZnJvbSBcIi4vbG9jYWxlXCI7XHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcbmltcG9ydCB7IFRva2VuLCB0b2tlbml6ZSwgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcclxuXHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gbG9jYWxab25lIFRoZSB6b25lIHRoYXQgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgTERNTCBmb3JtYXQgcGF0dGVybiAoc2VlIExETUwubWQpXHJcbiAqIEBwYXJhbSBsb2NhbGUgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChcclxuXHRkYXRlVGltZTogVGltZVN0cnVjdCxcclxuXHR1dGNUaW1lOiBUaW1lU3RydWN0LFxyXG5cdGxvY2FsWm9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQgfCBudWxsLFxyXG5cdGZvcm1hdFN0cmluZzogc3RyaW5nLFxyXG5cdGxvY2FsZTogUGFydGlhbExvY2FsZSA9IHt9XHJcbik6IHN0cmluZyB7XHJcblx0Y29uc3QgbWVyZ2VkTG9jYWxlOiBMb2NhbGUgPSB7XHJcblx0XHQuLi5ERUZBVUxUX0xPQ0FMRSxcclxuXHRcdC4uLmxvY2FsZVxyXG5cdH07XHJcblxyXG5cdGNvbnN0IHRva2VuczogVG9rZW5bXSA9IHRva2VuaXplKGZvcm1hdFN0cmluZyk7XHJcblx0bGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xyXG5cdFx0bGV0IHRva2VuUmVzdWx0OiBzdHJpbmc7XHJcblx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NT05USDpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFS0RBWTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkhPVVI6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XHJcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlNFQ09ORDpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWUsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuWk9ORTpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRab25lKGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUgPyBsb2NhbFpvbmUgOiB1bmRlZmluZWQsIHRva2VuKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFSzpcclxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0ICs9IHRva2VuUmVzdWx0O1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGVyYSAoQkMgb3IgQUQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdEVyYShkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBsb2NhbGU6IExvY2FsZSk6IHN0cmluZyB7XHJcblx0Y29uc3QgQUQ6IGJvb2xlYW4gPSBkYXRlVGltZS55ZWFyID4gMDtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gKEFEID8gbG9jYWxlLmVyYUFiYnJldmlhdGVkWzBdIDogbG9jYWxlLmVyYUFiYnJldmlhdGVkWzFdKTtcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0cmV0dXJuIChBRCA/IGxvY2FsZS5lcmFXaWRlWzBdIDogbG9jYWxlLmVyYVdpZGVbMV0pO1xyXG5cdFx0Y2FzZSA1OlxyXG5cdFx0XHRyZXR1cm4gKEFEID8gbG9jYWxlLmVyYU5hcnJvd1swXSA6IGxvY2FsZS5lcmFOYXJyb3dbMV0pO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFllYXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJ5XCI6XHJcblx0XHRjYXNlIFwiWVwiOlxyXG5cdFx0Y2FzZSBcInJcIjpcclxuXHRcdFx0bGV0IHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcclxuXHRcdFx0XHR5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB5ZWFyVmFsdWU7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBsb2NhbGU6IExvY2FsZSk6IHN0cmluZyB7XHJcblx0Y29uc3QgcXVhcnRlciA9IE1hdGguY2VpbChkYXRlVGltZS5tb250aCAvIDMpO1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiUVwiOlxyXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5xdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGxvY2FsZS5xdWFydGVyV29yZDtcclxuXHRcdFx0XHRjYXNlIDU6XHJcblx0XHRcdFx0XHRyZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInFcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyICsgcXVhcnRlcjtcclxuXHRcdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGxvY2FsZS5zdGFuZEFsb25lUXVhcnRlcldvcmQ7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0cmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XHJcblx0XHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGxvY2FsZTogTG9jYWxlKTogc3RyaW5nIHtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcIk1cIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdFx0XHRjYXNlIDU6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLm1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcIkxcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuXHRcdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVMb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0XHRcdGNhc2UgNTpcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZU1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHRcdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiZFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdGNhc2UgXCJEXCI6XHJcblx0XHRcdGNvbnN0IGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgbG9jYWxlOiBMb2NhbGUpOiBzdHJpbmcge1xyXG5cdGNvbnN0IHdlZWtEYXlOdW1iZXIgPSBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcyk7XHJcblxyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XHJcblx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcykudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRyZXR1cm4gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0XHRyZXR1cm4gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDU6XHJcblx0XHRcdHJldHVybiBsb2NhbGUud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XHJcblx0XHRjYXNlIDY6XHJcblx0XHRcdHJldHVybiBsb2NhbGUud2Vla2RheVR3b0xldHRlcnNbd2Vla0RheU51bWJlcl07XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgbG9jYWxlOiBMb2NhbGUpOiBzdHJpbmcge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiYVwiOiB7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPD0gMykge1xyXG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgaWYgKHRva2VuLmxlbmd0aCA9PT0gNCkge1xyXG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RXaWRlLnBtO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRjYXNlIFwiYlwiOlxyXG5cdFx0Y2FzZSBcIkJcIjoge1xyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoIDw9IDMpIHtcclxuXHRcdFx0XHRpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm1pZG5pZ2h0O1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5ub29uO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIGlmICh0b2tlbi5sZW5ndGggPT09IDQpIHtcclxuXHRcdFx0XHRpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHQ7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChkYXRlVGltZS5ob3VyID09PSAxMiAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbjtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RXaWRlLmFtO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm1pZG5pZ2h0O1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cubm9vbjtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IHRoZSBIb3VyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdEhvdXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0bGV0IGhvdXIgPSBkYXRlVGltZS5ob3VyO1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwiaFwiOlxyXG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xyXG5cdFx0XHRpZiAoaG91ciA9PT0gMCkge1xyXG5cdFx0XHRcdGhvdXIgPSAxMjtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiSFwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwiS1wiOlxyXG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHRjYXNlIFwia1wiOlxyXG5cdFx0XHRpZiAoaG91ciA9PT0gMCkge1xyXG5cdFx0XHRcdGhvdXIgPSAyNDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5taW51dGUudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHNlY29uZHMgKG9yIGZyYWN0aW9uIG9mIGEgc2Vjb25kKVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJzXCI6XHJcblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuc2Vjb25kLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG5cdFx0Y2FzZSBcIlNcIjpcclxuXHRcdFx0Y29uc3QgZnJhY3Rpb24gPSBkYXRlVGltZS5taWxsaTtcclxuXHRcdFx0bGV0IGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcclxuXHRcdFx0ZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuXHRcdFx0cmV0dXJuIGZyYWN0aW9uU3RyaW5nLnNsaWNlKDAsIHRva2VuLmxlbmd0aCk7XHJcblx0XHRjYXNlIFwiQVwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy5zZWNvbmRPZkRheShkYXRlVGltZS5ob3VyLCBkYXRlVGltZS5taW51dGUsIGRhdGVUaW1lLnNlY29uZCkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHRpbWUgem9uZS4gRm9yIHRoaXMsIHdlIG5lZWQgdGhlIGN1cnJlbnQgdGltZSwgdGhlIHRpbWUgaW4gVVRDIGFuZCB0aGUgdGltZSB6b25lXHJcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXHJcbiAqIEBwYXJhbSB6b25lIFRoZSB0aW1lem9uZSBjdXJyZW50VGltZSBpcyBpblxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWU6IFRpbWVTdHJ1Y3QsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIHpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkLCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xyXG5cdGlmICghem9uZSkge1xyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG5cclxuXHRjb25zdCBvZmZzZXRIb3VyczogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XHJcblx0b2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcblx0Y29uc3Qgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG5cdGxldCByZXN1bHQ6IHN0cmluZztcclxuXHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJPXCI6XHJcblx0XHRcdHJlc3VsdCA9IFwiR01UXCI7XHJcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSBcIitcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID4gNCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSB0b2tlbi5yYXcuc2xpY2UoNCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdGNhc2UgXCJaXCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRcdGNvbnN0IG5ld1Rva2VuOiBUb2tlbiA9IHtcclxuXHRcdFx0XHRcdFx0bGVuZ3RoOiA0LFxyXG5cdFx0XHRcdFx0XHRyYXc6IFwiT09PT1wiLFxyXG5cdFx0XHRcdFx0XHRzeW1ib2w6IFwiT1wiLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiBUb2tlblR5cGUuWk9ORVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdHJldHVybiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgbmV3VG9rZW4pO1xyXG5cdFx0XHRcdGNhc2UgNTpcclxuXHRcdFx0XHRcdGlmIChvZmZzZXQgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiWlwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcclxuXHRcdFx0fVxyXG5cdFx0Y2FzZSBcInpcIjpcclxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuXHRcdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRcdHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgdHJ1ZSk7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XHJcblx0XHRcdH1cclxuXHRcdGNhc2UgXCJ2XCI6XHJcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPT09IDEpIHtcclxuXHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIGZhbHNlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gem9uZS50b1N0cmluZygpO1xyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwiVlwiOlxyXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRcdC8vIE5vdCBpbXBsZW1lbnRlZFxyXG5cdFx0XHRcdFx0cmV0dXJuIFwidW5rXCI7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUubmFtZSgpO1xyXG5cdFx0XHRcdGNhc2UgMzpcclxuXHRcdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0XHRyZXR1cm4gXCJVbmtub3duXCI7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xyXG5cdFx0XHR9XHJcblx0XHRjYXNlIFwiWFwiOlxyXG5cdFx0Y2FzZSBcInhcIjpcclxuXHRcdFx0aWYgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgb2Zmc2V0ID09PSAwKSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiWlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcblx0XHRcdFx0XHRpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcblx0XHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XHJcblx0XHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xyXG5cdH1cclxufVxyXG5cclxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEYXRlVGltZSwgZDI6IERhdGVUaW1lKTogRGF0ZVRpbWU7XG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIER1cmF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKGQxOiBEdXJhdGlvbiwgZDI6IER1cmF0aW9uKTogRHVyYXRpb247XG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRGF0ZVRpbWUgfCBEdXJhdGlvbiwgZDI6IERhdGVUaW1lIHwgRHVyYXRpb24pOiBEYXRlVGltZSB8IER1cmF0aW9uIHtcblx0YXNzZXJ0KGQxLCBcImZpcnN0IGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuXHRhc3NlcnQoZDIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRhc3NlcnQoZDEua2luZCA9PT0gZDIua2luZCwgXCJleHBlY3RlZCBlaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zXCIpO1xuXHRyZXR1cm4gKGQxIGFzIGFueSkubWluKGQyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogRGF0ZVRpbWUsIGQyOiBEYXRlVGltZSk6IERhdGVUaW1lO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEdXJhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChkMTogRHVyYXRpb24sIGQyOiBEdXJhdGlvbik6IER1cmF0aW9uO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IERhdGVUaW1lIHwgRHVyYXRpb24sIGQyOiBEYXRlVGltZSB8IER1cmF0aW9uKTogRGF0ZVRpbWUgfCBEdXJhdGlvbiB7XG5cdGFzc2VydChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0YXNzZXJ0KGQyLCBcInNlY29uZCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0YXNzZXJ0KGQxLmtpbmQgPT09IGQyLmtpbmQsIFwiZXhwZWN0ZWQgZWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9uc1wiKTtcblx0cmV0dXJuIChkMSBhcyBhbnkpLm1heChkMik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgYSBEdXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYWJzKGQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xuXHRhc3NlcnQoZCwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0cmV0dXJuIGQuYWJzKCk7XG59XG5cbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEluZGljYXRlcyBob3cgYSBEYXRlIG9iamVjdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXHJcbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcclxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBEYXRlRnVuY3Rpb25zIHtcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0RnVsbFllYXIoKSwgRGF0ZS5nZXRNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldCxcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldFVUQ1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTcgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICovXHJcblxyXG4vKipcclxuICogRml4ZWQgZGF5IHBlcmlvZCBydWxlc1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBEYXlQZXJpb2Qge1xyXG5cdGFtOiBzdHJpbmc7XHJcblx0cG06IHN0cmluZztcclxuXHRtaWRuaWdodDogc3RyaW5nO1xyXG5cdG5vb246IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIExvY2FsZSBmb3IgZm9ybWF0dGluZ1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb2NhbGUge1xyXG5cdC8qKlxyXG5cdCAqIEVyYSBuYW1lczogQUQsIEJDXHJcblx0ICovXHJcblx0ZXJhTmFycm93OiBbc3RyaW5nLCBzdHJpbmddO1xyXG5cdGVyYVdpZGU6IFtzdHJpbmcsIHN0cmluZ107XHJcblx0ZXJhQWJicmV2aWF0ZWQ6IFtzdHJpbmcsIHN0cmluZ107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcclxuXHQgKi9cclxuXHRxdWFydGVyTGV0dGVyOiBzdHJpbmc7XHJcblx0LyoqXHJcblx0ICogVGhlIHdvcmQgZm9yICdxdWFydGVyJ1xyXG5cdCAqL1xyXG5cdHF1YXJ0ZXJXb3JkOiBzdHJpbmc7XHJcblx0LyoqXHJcblx0ICogUXVhcnRlciBhYmJyZXZpYXRpb25zIGUuZy4gMXN0LCAybmQsIDNyZCwgNHRoXHJcblx0ICovXHJcblx0cXVhcnRlckFiYnJldmlhdGlvbnM6IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbiBzb21lIGxhbmd1YWdlcywgcXVhcnRlcnMgbmVlZCBkaWZmZXJlbnQgbmFtZXMgd2hlbiB1c2VkIHN0YW5kLWFsb25lXHJcblx0ICovXHJcblx0c3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI6IHN0cmluZztcclxuXHRzdGFuZEFsb25lUXVhcnRlcldvcmQ6IHN0cmluZztcclxuXHRzdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM6IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBNb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdGxvbmdNb250aE5hbWVzOiBzdHJpbmdbXTtcclxuXHQvKipcclxuXHQgKiBUaHJlZS1sZXR0ZXIgbW9udGggbmFtZXNcclxuXHQgKi9cclxuXHRzaG9ydE1vbnRoTmFtZXM6IHN0cmluZ1tdO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIGxldHRlcnNcclxuXHQgKi9cclxuXHRtb250aExldHRlcnM6IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbiBzb21lIGxhbmd1YWdlcywgbW9udGhzIG5lZWQgZGlmZmVyZW50IG5hbWVzIHdoZW4gdXNlZCBzdGFuZC1hbG9uZVxyXG5cdCAqL1xyXG5cdHN0YW5kQWxvbmVMb25nTW9udGhOYW1lczogc3RyaW5nW107XHJcblx0c3RhbmRBbG9uZVNob3J0TW9udGhOYW1lczogc3RyaW5nW107XHJcblx0c3RhbmRBbG9uZU1vbnRoTGV0dGVyczogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdlZWsgZGF5IG5hbWVzLCBzdGFydGluZyB3aXRoIHN1bmRheVxyXG5cdCAqL1xyXG5cdGxvbmdXZWVrZGF5TmFtZXM6IHN0cmluZ1tdO1xyXG5cdHNob3J0V2Vla2RheU5hbWVzOiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVyczogc3RyaW5nW107XHJcblx0d2Vla2RheUxldHRlcnM6IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBGaXhlZCBkYXkgcGVyaW9kIG5hbWVzIChBTS9QTS9ub29uL21pZG5pZ2h0LCBmb3JtYXQgJ2EnIGFuZCAnYicpXHJcblx0ICovXHJcblx0ZGF5UGVyaW9kTmFycm93OiBEYXlQZXJpb2Q7XHJcblx0ZGF5UGVyaW9kV2lkZTogRGF5UGVyaW9kO1xyXG5cdGRheVBlcmlvZEFiYnJldmlhdGVkOiBEYXlQZXJpb2Q7XHJcbn1cclxuXHJcblxyXG4vLyB0b2RvIHRoaXMgY2FuIGJlIFBhcnRpYWw8Rm9ybWF0T3B0aW9ucz4gYnV0IGZvciBjb21wYXRpYmlsaXR5IHdpdGhcclxuLy8gcHJlLTIuMSB0eXBlc2NyaXB0IHVzZXJzIHdlIHdyaXRlIHRoaXMgb3V0IG91cnNlbHZlcyBmb3IgYSB3aGlsZSB5ZXRcclxuZXhwb3J0IGludGVyZmFjZSBQYXJ0aWFsTG9jYWxlIHtcclxuXHQvKipcclxuXHQgKiBFcmEgbmFtZXM6IEFELCBCQ1xyXG5cdCAqL1xyXG5cdGVyYU5hcnJvdz86IFtzdHJpbmcsIHN0cmluZ107XHJcblx0ZXJhV2lkZT86IFtzdHJpbmcsIHN0cmluZ107XHJcblx0ZXJhQWJicmV2aWF0ZWQ/OiBbc3RyaW5nLCBzdHJpbmddO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbGV0dGVyIGluZGljYXRpbmcgYSBxdWFydGVyIGUuZy4gXCJRXCIgKGJlY29tZXMgUTEsIFEyLCBRMywgUTQpXHJcblx0ICovXHJcblx0cXVhcnRlckxldHRlcj86IHN0cmluZztcclxuXHQvKipcclxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXHJcblx0ICovXHJcblx0cXVhcnRlcldvcmQ/OiBzdHJpbmc7XHJcblx0LyoqXHJcblx0ICogUXVhcnRlciBhYmJyZXZpYXRpb25zIGUuZy4gMXN0LCAybmQsIDNyZCwgNHRoXHJcblx0ICovXHJcblx0cXVhcnRlckFiYnJldmlhdGlvbnM/OiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogSW4gc29tZSBsYW5ndWFnZXMsIHF1YXJ0ZXJzIG5lZWQgZGlmZmVyZW50IG5hbWVzIHdoZW4gdXNlZCBzdGFuZC1hbG9uZVxyXG5cdCAqL1xyXG5cdHN0YW5kQWxvbmVRdWFydGVyTGV0dGVyPzogc3RyaW5nO1xyXG5cdHN0YW5kQWxvbmVRdWFydGVyV29yZD86IHN0cmluZztcclxuXHRzdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM/OiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogTW9udGggbmFtZXNcclxuXHQgKi9cclxuXHRsb25nTW9udGhOYW1lcz86IHN0cmluZ1tdO1xyXG5cdC8qKlxyXG5cdCAqIFRocmVlLWxldHRlciBtb250aCBuYW1lc1xyXG5cdCAqL1xyXG5cdHNob3J0TW9udGhOYW1lcz86IHN0cmluZ1tdO1xyXG5cdC8qKlxyXG5cdCAqIE1vbnRoIGxldHRlcnNcclxuXHQgKi9cclxuXHRtb250aExldHRlcnM/OiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogSW4gc29tZSBsYW5ndWFnZXMsIG1vbnRocyBuZWVkIGRpZmZlcmVudCBuYW1lcyB3aGVuIHVzZWQgc3RhbmQtYWxvbmVcclxuXHQgKi9cclxuXHRzdGFuZEFsb25lTG9uZ01vbnRoTmFtZXM/OiBzdHJpbmdbXTtcclxuXHRzdGFuZEFsb25lU2hvcnRNb250aE5hbWVzPzogc3RyaW5nW107XHJcblx0c3RhbmRBbG9uZU1vbnRoTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cclxuXHQvKipcclxuXHQgKiBXZWVrIGRheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBzdW5kYXlcclxuXHQgKi9cclxuXHRsb25nV2Vla2RheU5hbWVzPzogc3RyaW5nW107XHJcblx0c2hvcnRXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcclxuXHR3ZWVrZGF5VHdvTGV0dGVycz86IHN0cmluZ1tdO1xyXG5cdHdlZWtkYXlMZXR0ZXJzPzogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIGRheSBwZXJpb2QgbmFtZXMgKEFNL1BNL25vb24vbWlkbmlnaHQsIGZvcm1hdCAnYScgYW5kICdiJylcclxuXHQgKi9cclxuXHRkYXlQZXJpb2ROYXJyb3c/OiBEYXlQZXJpb2Q7XHJcblx0ZGF5UGVyaW9kV2lkZT86IERheVBlcmlvZDtcclxuXHRkYXlQZXJpb2RBYmJyZXZpYXRlZD86IERheVBlcmlvZDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEVSQV9OQU1FU19OQVJST1c6IFtzdHJpbmcsIHN0cmluZ10gPSBbXCJBXCIsIFwiQlwiXTtcclxuZXhwb3J0IGNvbnN0IEVSQV9OQU1FU19XSURFOiBbc3RyaW5nLCBzdHJpbmddID0gW1wiQW5ubyBEb21pbmlcIiwgXCJCZWZvcmUgQ2hyaXN0XCJdO1xyXG5leHBvcnQgY29uc3QgRVJBX05BTUVTX0FCQlJFVklBVEVEOiBbc3RyaW5nLCBzdHJpbmddID0gW1wiQURcIiwgXCJCQ1wiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX0xFVFRFUjogc3RyaW5nID0gXCJRXCI7XHJcbmV4cG9ydCBjb25zdCBRVUFSVEVSX1dPUkQ6IHN0cmluZyA9IFwicXVhcnRlclwiO1xyXG5leHBvcnQgY29uc3QgUVVBUlRFUl9BQkJSRVZJQVRJT05TOiBzdHJpbmdbXSA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuXHJcbi8qKlxyXG4gKiBJbiBzb21lIGxhbmd1YWdlcywgZGlmZmVyZW50IHdvcmRzIGFyZSBuZWNlc3NhcnkgZm9yIHN0YW5kLWFsb25lIHF1YXJ0ZXIgbmFtZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9RVUFSVEVSX0xFVFRFUjogc3RyaW5nID0gUVVBUlRFUl9MRVRURVI7XHJcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQ6IHN0cmluZyA9IFFVQVJURVJfV09SRDtcclxuZXhwb3J0IGNvbnN0IFNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUzogc3RyaW5nW10gPSBRVUFSVEVSX0FCQlJFVklBVElPTlMuc2xpY2UoKTtcclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9XHJcblx0W1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcblxyXG5leHBvcnQgY29uc3QgU0hPUlRfTU9OVEhfTkFNRVM6IHN0cmluZ1tdID1cclxuXHRbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcblxyXG5leHBvcnQgY29uc3QgTU9OVEhfTEVUVEVSUzogc3RyaW5nW10gPVxyXG5cdFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9IExPTkdfTU9OVEhfTkFNRVMuc2xpY2UoKTtcclxuZXhwb3J0IGNvbnN0IFNUQU5EX0FMT05FX1NIT1JUX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9IFNIT1JUX01PTlRIX05BTUVTLnNsaWNlKCk7XHJcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9NT05USF9MRVRURVJTOiBzdHJpbmdbXSA9IE1PTlRIX0xFVFRFUlMuc2xpY2UoKTtcclxuXHJcbmV4cG9ydCBjb25zdCBMT05HX1dFRUtEQVlfTkFNRVM6IHN0cmluZ1tdID1cclxuXHRbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBTSE9SVF9XRUVLREFZX05BTUVTOiBzdHJpbmdbXSA9XHJcblx0W1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IFdFRUtEQVlfVFdPX0xFVFRFUlM6IHN0cmluZ1tdID1cclxuXHRbXCJTdVwiLCBcIk1vXCIsIFwiVHVcIiwgXCJXZVwiLCBcIlRoXCIsIFwiRnJcIiwgXCJTYVwiXTtcclxuXHJcbmV4cG9ydCBjb25zdCBXRUVLREFZX0xFVFRFUlM6IHN0cmluZ1tdID1cclxuXHRbXCJTXCIsIFwiTVwiLCBcIlRcIiwgXCJXXCIsIFwiVFwiLCBcIkZcIiwgXCJTXCJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IERBWV9QRVJJT0RTX0FCQlJFVklBVEVEID0geyBhbTogXCJBTVwiLCBwbTogXCJQTVwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWlkLlwiIH07XHJcbmV4cG9ydCBjb25zdCBEQVlfUEVSSU9EU19XSURFID0geyBhbTogXCJBTVwiLCBwbTogXCJQTVwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWlkbmlnaHRcIiB9O1xyXG5leHBvcnQgY29uc3QgREFZX1BFUklPRFNfTkFSUk9XID0geyBhbTogXCJBXCIsIHBtOiBcIlBcIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1kXCIgfTtcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPQ0FMRTogTG9jYWxlID0ge1xyXG5cdGVyYU5hcnJvdzogRVJBX05BTUVTX05BUlJPVyxcclxuXHRlcmFXaWRlOiBFUkFfTkFNRVNfV0lERSxcclxuXHRlcmFBYmJyZXZpYXRlZDogRVJBX05BTUVTX0FCQlJFVklBVEVELFxyXG5cdHF1YXJ0ZXJMZXR0ZXI6IFFVQVJURVJfTEVUVEVSLFxyXG5cdHF1YXJ0ZXJXb3JkOiBRVUFSVEVSX1dPUkQsXHJcblx0cXVhcnRlckFiYnJldmlhdGlvbnM6IFFVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuXHRzdGFuZEFsb25lUXVhcnRlckxldHRlcjogU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIsXHJcblx0c3RhbmRBbG9uZVF1YXJ0ZXJXb3JkOiBTVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQsXHJcblx0c3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBTVEFORF9BTE9ORV9RVUFSVEVSX0FCQlJFVklBVElPTlMsXHJcblx0bG9uZ01vbnRoTmFtZXM6IExPTkdfTU9OVEhfTkFNRVMsXHJcblx0c2hvcnRNb250aE5hbWVzOiBTSE9SVF9NT05USF9OQU1FUyxcclxuXHRtb250aExldHRlcnM6IE1PTlRIX0xFVFRFUlMsXHJcblx0c3RhbmRBbG9uZUxvbmdNb250aE5hbWVzOiBTVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTLFxyXG5cdHN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM6IFNUQU5EX0FMT05FX1NIT1JUX01PTlRIX05BTUVTLFxyXG5cdHN0YW5kQWxvbmVNb250aExldHRlcnM6IFNUQU5EX0FMT05FX01PTlRIX0xFVFRFUlMsXHJcblx0bG9uZ1dlZWtkYXlOYW1lczogTE9OR19XRUVLREFZX05BTUVTLFxyXG5cdHNob3J0V2Vla2RheU5hbWVzOiBTSE9SVF9XRUVLREFZX05BTUVTLFxyXG5cdHdlZWtkYXlUd29MZXR0ZXJzOiBXRUVLREFZX1RXT19MRVRURVJTLFxyXG5cdHdlZWtkYXlMZXR0ZXJzOiBXRUVLREFZX0xFVFRFUlMsXHJcblx0ZGF5UGVyaW9kQWJicmV2aWF0ZWQ6IERBWV9QRVJJT0RTX0FCQlJFVklBVEVELFxyXG5cdGRheVBlcmlvZFdpZGU6IERBWV9QRVJJT0RTX1dJREUsXHJcblx0ZGF5UGVyaW9kTmFycm93OiBEQVlfUEVSSU9EU19OQVJST1dcclxufTtcclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIE1hdGggdXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XHJcblxyXG4vKipcclxuICogQHJldHVybiB0cnVlIGlmZiBnaXZlbiBhcmd1bWVudCBpcyBhbiBpbnRlZ2VyIG51bWJlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW50KG46IG51bWJlcik6IGJvb2xlYW4ge1xyXG5cdGlmIChuID09PSBudWxsIHx8ICFpc0Zpbml0ZShuKSkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRyZXR1cm4gKE1hdGguZmxvb3IobikgPT09IG4pO1xyXG59XHJcblxyXG4vKipcclxuICogUm91bmRzIC0xLjUgdG8gLTIgaW5zdGVhZCBvZiAtMVxyXG4gKiBSb3VuZHMgKzEuNSB0byArMlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kU3ltKG46IG51bWJlcik6IG51bWJlciB7XHJcblx0aWYgKG4gPCAwKSB7XHJcblx0XHRyZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG4pO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxyXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcclxuXHRpZiAoL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkLy50ZXN0KHZhbHVlKSkge1xyXG5cdFx0cmV0dXJuIE51bWJlcih2YWx1ZSk7XHJcblx0fVxyXG5cdHJldHVybiBOYU47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZTogbnVtYmVyLCBtb2R1bG86IG51bWJlcik6IG51bWJlciB7XHJcblx0YXNzZXJ0KG1vZHVsbyA+PSAxLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuXHRpZiAodmFsdWUgPCAwKSB7XHJcblx0XHRyZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gdmFsdWUgJSBtb2R1bG87XHJcblx0fVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0IHsgREVGQVVMVF9MT0NBTEUsIExvY2FsZSwgUGFydGlhbExvY2FsZSB9IGZyb20gXCIuL2xvY2FsZVwiO1xyXG5pbXBvcnQgeyBUaW1lWm9uZSB9IGZyb20gXCIuL3RpbWV6b25lXCI7XHJcbmltcG9ydCB7IFRva2VuLCB0b2tlbml6ZSwgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lU3RydWN0IHBsdXMgem9uZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBBd2FyZVRpbWVTdHJ1Y3Qge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHN0cnVjdFxyXG5cdCAqL1xyXG5cdHRpbWU6IFRpbWVTdHJ1Y3Q7XHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZSAoY2FuIGJlIHVuZGVmaW5lZClcclxuXHQgKi9cclxuXHR6b25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlTnVtYmVyUmVzdWx0IHtcclxuXHRuOiBudW1iZXI7XHJcblx0cmVtYWluaW5nOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdHpvbmU/OiBUaW1lWm9uZTtcclxuXHRyZW1haW5pbmc6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlRGF5UGVyaW9kUmVzdWx0IHtcclxuXHR0eXBlOiBcImFtXCIgfCBcInBtXCIgfCBcIm5vb25cIiB8IFwibWlkbmlnaHRcIjtcclxuXHRyZW1haW5pbmc6IHN0cmluZztcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcclxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gdGVzdFxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIExETUwgZm9ybWF0IHN0cmluZyAoc2VlIExETUwubWQpXHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXHJcbiAqIEBwYXJhbSBsb2NhbGUgTG9jYWxlLXNwZWNpZmljIGNvbnN0YW50cyBzdWNoIGFzIG1vbnRoIG5hbWVzXHJcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZWFibGUoXHJcblx0ZGF0ZVRpbWVTdHJpbmc6IHN0cmluZyxcclxuXHRmb3JtYXRTdHJpbmc6IHN0cmluZyxcclxuXHRhbGxvd1RyYWlsaW5nOiBib29sZWFuID0gdHJ1ZSxcclxuXHRsb2NhbGU6IFBhcnRpYWxMb2NhbGUgPSB7fVxyXG4pOiBib29sZWFuIHtcclxuXHR0cnkge1xyXG5cdFx0cGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgdW5kZWZpbmVkLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEBwYXJhbSBsb2NhbGUgTG9jYWxlLXNwZWNpZmljIGNvbnN0YW50cyBzdWNoIGFzIG1vbnRoIG5hbWVzXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoXHJcblx0ZGF0ZVRpbWVTdHJpbmc6IHN0cmluZyxcclxuXHRmb3JtYXRTdHJpbmc6IHN0cmluZyxcclxuXHRvdmVycmlkZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQsXHJcblx0YWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWUsXHJcblx0bG9jYWxlOiBQYXJ0aWFsTG9jYWxlID0ge31cclxuKTogQXdhcmVUaW1lU3RydWN0IHtcclxuXHRpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRpZiAoIWZvcm1hdFN0cmluZykge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZm9ybWF0IGdpdmVuXCIpO1xyXG5cdH1cclxuXHRjb25zdCBtZXJnZWRMb2NhbGU6IExvY2FsZSA9IHtcclxuXHRcdC4uLkRFRkFVTFRfTE9DQUxFLFxyXG5cdFx0Li4ubG9jYWxlXHJcblx0fTtcclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgdG9rZW5zOiBUb2tlbltdID0gdG9rZW5pemUoZm9ybWF0U3RyaW5nKTtcclxuXHRcdGNvbnN0IHRpbWU6IFRpbWVDb21wb25lbnRPcHRzID0geyB5ZWFyOiB1bmRlZmluZWQgfTtcclxuXHRcdGxldCB6b25lOiBUaW1lWm9uZSB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCBwbnI6IFBhcnNlTnVtYmVyUmVzdWx0IHwgdW5kZWZpbmVkO1xyXG5cdFx0bGV0IHB6cjogUGFyc2Vab25lUmVzdWx0IHwgdW5kZWZpbmVkO1xyXG5cdFx0bGV0IGRwcjogUGFyc2VEYXlQZXJpb2RSZXN1bHQgfCB1bmRlZmluZWQ7XHJcblx0XHRsZXQgZXJhOiBudW1iZXIgPSAxO1xyXG5cdFx0bGV0IHF1YXJ0ZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCByZW1haW5pbmc6IHN0cmluZyA9IGRhdGVUaW1lU3RyaW5nO1xyXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcclxuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdFx0W2VyYSwgcmVtYWluaW5nXSA9IHN0cmlwRXJhKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOiB7XHJcblx0XHRcdFx0XHRjb25zdCByID0gc3RyaXBRdWFydGVyKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0XHRxdWFydGVyID0gci5uO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gci5yZW1haW5pbmc7XHJcblx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUtEQVk6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdGJyZWFrOyAvLyBub3RoaW5nIHRvIGxlYXJuIGZyb20gdGhpc1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuXHRcdFx0XHRcdGRwciA9IHN0cmlwRGF5UGVyaW9kKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBkcHIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWUVBUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgSW5maW5pdHkpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHRpbWUueWVhciA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE1vbnRoKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5tb250aCA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLmRheSA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSE9VUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwSG91cih0b2tlbiwgcmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR0aW1lLmhvdXIgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0dGltZS5taW51dGUgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLlNFQ09ORDoge1xyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBTZWNvbmQodG9rZW4sIHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdFx0XHRcdFx0Y2FzZSBcInNcIjogdGltZS5zZWNvbmQgPSBwbnIubjsgYnJlYWs7XHJcblx0XHRcdFx0XHRcdGNhc2UgXCJTXCI6IHRpbWUubWlsbGkgPSAxMDAwICogcGFyc2VGbG9hdChcIjAuXCIgKyBNYXRoLmZsb29yKHBuci5uKS50b1N0cmluZygxMCkuc2xpY2UoMCwgMykpOyBicmVhaztcclxuXHRcdFx0XHRcdFx0Y2FzZSBcIkFcIjpcclxuXHRcdFx0XHRcdFx0XHR0aW1lLmhvdXIgPSBNYXRoLmZsb29yKChwbnIubiAvIDM2MDBFMykpO1xyXG5cdFx0XHRcdFx0XHRcdHRpbWUubWludXRlID0gTWF0aC5mbG9vcigocG5yLm4gLyA2MEUzKSAlIDYwKTtcclxuXHRcdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IE1hdGguZmxvb3IoKHBuci5uIC8gMTAwMCkgJSA2MCk7XHJcblx0XHRcdFx0XHRcdFx0dGltZS5taWxsaSA9IHBuci5uICUgMTAwMDtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgc2Vjb25kIGZvcm1hdCAnJHt0b2tlbi5yYXd9J2ApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWk9ORTpcclxuXHRcdFx0XHRcdHB6ciA9IHN0cmlwWm9uZSh0b2tlbiwgcmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHB6ci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHR6b25lID0gcHpyLnpvbmU7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSURFTlRJVFk6XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBzdHJpcFJhdyhyZW1haW5pbmcsIHRva2VuLnJhdyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKGRwcikge1xyXG5cdFx0XHRzd2l0Y2ggKGRwci50eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSBcImFtXCI6XHJcblx0XHRcdFx0XHRpZiAodGltZS5ob3VyICE9PSB1bmRlZmluZWQgJiYgdGltZS5ob3VyID49IDEyKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUuaG91ciAtPSAxMjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwicG1cIjpcclxuXHRcdFx0XHRcdGlmICh0aW1lLmhvdXIgIT09IHVuZGVmaW5lZCAmJiB0aW1lLmhvdXIgPCAxMikge1xyXG5cdFx0XHRcdFx0XHR0aW1lLmhvdXIgKz0gMTI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcIm5vb25cIjpcclxuXHRcdFx0XHRcdGlmICh0aW1lLmhvdXIgPT09IHVuZGVmaW5lZCB8fCB0aW1lLmhvdXIgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0dGltZS5ob3VyID0gMTI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5taW51dGUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHR0aW1lLm1pbnV0ZSA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5taWxsaSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUubWlsbGkgPSAwO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHRpbWUuaG91ciAhPT0gMTIgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdGltZSwgY29udGFpbnMgJ25vb24nIHNwZWNpZmllciBidXQgdGltZSBkaWZmZXJzIGZyb20gbm9vbmApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJtaWRuaWdodFwiOlxyXG5cdFx0XHRcdFx0aWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMTIpIHtcclxuXHRcdFx0XHRcdFx0dGltZS5ob3VyID0gMDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmICh0aW1lLmhvdXIgPT09IDEyKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUuaG91ciA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5taW51dGUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHR0aW1lLm1pbnV0ZSA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IDA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAodGltZS5taWxsaSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdHRpbWUubWlsbGkgPSAwO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHRpbWUuaG91ciAhPT0gMCB8fCB0aW1lLm1pbnV0ZSAhPT0gMCB8fCB0aW1lLnNlY29uZCAhPT0gMCB8fCB0aW1lLm1pbGxpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW52YWxpZCB0aW1lLCBjb250YWlucyAnbWlkbmlnaHQnIHNwZWNpZmllciBidXQgdGltZSBkaWZmZXJzIGZyb20gbWlkbmlnaHRgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKHRpbWUueWVhciAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRpbWUueWVhciAqPSBlcmE7XHJcblx0XHR9XHJcblx0XHRpZiAocXVhcnRlciAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGlmICh0aW1lLm1vbnRoID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRzd2l0Y2ggKHF1YXJ0ZXIpIHtcclxuXHRcdFx0XHRcdGNhc2UgMTogdGltZS5tb250aCA9IDE7IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSAyOiB0aW1lLm1vbnRoID0gNDsgYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIDM6IHRpbWUubW9udGggPSA3OyBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgNDogdGltZS5tb250aCA9IDEwOyBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGV0IGVycm9yID0gZmFsc2U7XHJcblx0XHRcdFx0c3dpdGNoIChxdWFydGVyKSB7XHJcblx0XHRcdFx0XHRjYXNlIDE6IGVycm9yID0gISh0aW1lLm1vbnRoID49IDEgJiYgdGltZS5tb250aCA8PSAzKTsgYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIDI6IGVycm9yID0gISh0aW1lLm1vbnRoID49IDQgJiYgdGltZS5tb250aCA8PSA2KTsgYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIDM6IGVycm9yID0gISh0aW1lLm1vbnRoID49IDcgJiYgdGltZS5tb250aCA8PSA5KTsgYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIDQ6IGVycm9yID0gISh0aW1lLm1vbnRoID49IDEwICYmIHRpbWUubW9udGggPD0gMTIpOyBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGVycm9yKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ0aGUgcXVhcnRlciBkb2VzIG5vdCBtYXRjaCB0aGUgbW9udGhcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAodGltZS55ZWFyID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dGltZS55ZWFyID0gMTk3MDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IHJlc3VsdDogQXdhcmVUaW1lU3RydWN0ID0geyB0aW1lOiBuZXcgVGltZVN0cnVjdCh0aW1lKSwgem9uZSB9O1xyXG5cdFx0aWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihgaW52YWxpZCByZXN1bHRpbmcgZGF0ZWApO1xyXG5cdFx0fVxyXG5cdFx0Ly8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxyXG5cdFx0aWYgKG92ZXJyaWRlWm9uZSkge1xyXG5cdFx0XHRyZXN1bHQuem9uZSA9IG92ZXJyaWRlWm9uZTtcclxuXHRcdH1cclxuXHRcdGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxyXG5cdFx0XHRcdGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogdHJhaWxpbmcgY2hhcmFjdGVyczogJyR7cmVtYWluaW5nfSdgXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBkYXRlICcke2RhdGVUaW1lU3RyaW5nfScgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJyR7Zm9ybWF0U3RyaW5nfSc6ICR7ZS5tZXNzYWdlfWApO1xyXG5cdH1cclxufVxyXG5cclxuY29uc3QgV0hJVEVTUEFDRSA9IFtcIiBcIiwgXCJcXHRcIiwgXCJcXHJcIiwgXCJcXHZcIiwgXCJcXG5cIl07XHJcblxyXG5mdW5jdGlvbiBzdHJpcFpvbmUodG9rZW46IFRva2VuLCBzOiBzdHJpbmcpOiBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdGNvbnN0IHVuc3VwcG9ydGVkOiBib29sZWFuID1cclxuXHRcdCh0b2tlbi5zeW1ib2wgPT09IFwielwiKVxyXG5cdFx0fHwgKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA1KVxyXG5cdFx0fHwgKHRva2VuLnN5bWJvbCA9PT0gXCJ2XCIpXHJcblx0XHR8fCAodG9rZW4uc3ltYm9sID09PSBcIlZcIiAmJiB0b2tlbi5sZW5ndGggIT09IDIpXHJcblx0XHR8fCAodG9rZW4uc3ltYm9sID09PSBcInhcIiAmJiB0b2tlbi5sZW5ndGggPj0gNClcclxuXHRcdHx8ICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIHRva2VuLmxlbmd0aCA+PSA0KVxyXG5cdFx0O1xyXG5cdGlmICh1bnN1cHBvcnRlZCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwidGltZSB6b25lIHBhdHRlcm4gJ1wiICsgdG9rZW4ucmF3ICsgXCInIGlzIG5vdCBpbXBsZW1lbnRlZFwiKTtcclxuXHR9XHJcblx0Y29uc3QgcmVzdWx0OiBQYXJzZVpvbmVSZXN1bHQgPSB7XHJcblx0XHRyZW1haW5pbmc6IHNcclxuXHR9O1xyXG5cdC8vIGNob3Agb2ZmIFwiR01UXCIgcHJlZml4IGlmIG5lZWRlZFxyXG5cdGxldCBoYWRHTVQgPSBmYWxzZTtcclxuXHRpZiAoKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA0KSB8fCB0b2tlbi5zeW1ib2wgPT09IFwiT1wiKSB7XHJcblx0XHRpZiAocmVzdWx0LnJlbWFpbmluZy50b1VwcGVyQ2FzZSgpLnN0YXJ0c1dpdGgoXCJHTVRcIikpIHtcclxuXHRcdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc2xpY2UoMyk7XHJcblx0XHRcdGhhZEdNVCA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8vIHBhcnNlIGFueSB6b25lLCByZWdhcmRsZXNzIG9mIHNwZWNpZmllZCBmb3JtYXRcclxuXHRsZXQgem9uZVN0cmluZyA9IFwiXCI7XHJcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiBXSElURVNQQUNFLmluZGV4T2YocmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkpID09PSAtMSkge1xyXG5cdFx0em9uZVN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcclxuXHRcdHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0em9uZVN0cmluZyA9IHpvbmVTdHJpbmcudHJpbSgpO1xyXG5cdGlmICh6b25lU3RyaW5nKSB7XHJcblx0XHQvLyBlbnN1cmUgY2hvcHBpbmcgb2ZmIEdNVCBkb2VzIG5vdCBoaWRlIHRpbWUgem9uZSBlcnJvcnMgKGJpdCBvZiBhIHNsb3BweSByZWdleCBidXQgT0spXHJcblx0XHRpZiAoaGFkR01UICYmICF6b25lU3RyaW5nLm1hdGNoKC9bXFwrXFwtXT9bXFxkXFw6XSsvaSkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB0aW1lIHpvbmUgJ0dNVFwiICsgem9uZVN0cmluZyArIFwiJ1wiKTtcclxuXHRcdH1cclxuXHRcdHJlc3VsdC56b25lID0gVGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gdGltZSB6b25lIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpcFJhdyhzOiBzdHJpbmcsIGV4cGVjdGVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCByZW1haW5pbmcgPSBzO1xyXG5cdGxldCBlcmVtYWluaW5nID0gZXhwZWN0ZWQ7XHJcblx0d2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHRcdGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCAnJHtleHBlY3RlZH0nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwRGF5UGVyaW9kKHRva2VuOiBUb2tlbiwgcmVtYWluaW5nOiBzdHJpbmcsIGxvY2FsZTogTG9jYWxlKTogUGFyc2VEYXlQZXJpb2RSZXN1bHQge1xyXG5cdGxldCBvZmZzZXRzOiB7W2luZGV4OiBzdHJpbmddOiBcImFtXCIgfCBcInBtXCIgfCBcIm5vb25cIiB8IFwibWlkbmlnaHRcIn07XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJhXCI6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcclxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2RXaWRlLmFtXTogXCJhbVwiLFxyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUucG1dOiBcInBtXCJcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcclxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW1dOiBcImFtXCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXTogXCJwbVwiXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRvZmZzZXRzID0ge1xyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtXTogXCJhbVwiLFxyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtXTogXCJwbVwiXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcclxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2RXaWRlLmFtXTogXCJhbVwiLFxyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHRdOiBcIm1pZG5pZ2h0XCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbV06IFwicG1cIixcclxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2RXaWRlLm5vb25dOiBcIm5vb25cIlxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDU6XHJcblx0XHRcdFx0XHRvZmZzZXRzID0ge1xyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbV06IFwiYW1cIixcclxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cubWlkbmlnaHRdOiBcIm1pZG5pZ2h0XCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXTogXCJwbVwiLFxyXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5ub29uXTogXCJub29uXCJcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdG9mZnNldHMgPSB7XHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW1dOiBcImFtXCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubWlkbmlnaHRdOiBcIm1pZG5pZ2h0XCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG1dOiBcInBtXCIsXHJcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubm9vbl06IFwibm9vblwiXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0Ly8gbWF0Y2ggbG9uZ2VzdCBwb3NzaWJsZSBkYXkgcGVyaW9kIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXHJcblx0Y29uc3Qgc29ydGVkS2V5czogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhvZmZzZXRzKVxyXG5cdFx0LnNvcnQoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyID0+IChhLmxlbmd0aCA8IGIubGVuZ3RoID8gMSA6IGEubGVuZ3RoID4gYi5sZW5ndGggPyAtMSA6IDApKTtcclxuXHJcblx0Y29uc3QgdXBwZXIgPSByZW1haW5pbmcudG9VcHBlckNhc2UoKTtcclxuXHRmb3IgKGNvbnN0IGtleSBvZiBzb3J0ZWRLZXlzKSB7XHJcblx0XHRpZiAodXBwZXIuc3RhcnRzV2l0aChrZXkudG9VcHBlckNhc2UoKSkpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0eXBlOiBvZmZzZXRzW2tleV0sXHJcblx0XHRcdFx0cmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhyb3cgbmV3IEVycm9yKFwibWlzc2luZyBkYXkgcGVyaW9kIGkuZS4gXCIgKyBPYmplY3Qua2V5cyhvZmZzZXRzKS5qb2luKFwiLCBcIikpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBmYWN0b3IgLTEgb3IgMSBkZXBlbmRpbmcgb24gQkMgb3IgQURcclxuICogQHBhcmFtIHRva2VuXHJcbiAqIEBwYXJhbSByZW1haW5pbmdcclxuICogQHBhcmFtIGxvY2FsZVxyXG4gKiBAcmV0dXJucyBbZmFjdG9yLCByZW1haW5pbmddXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcEVyYSh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nLCBsb2NhbGU6IExvY2FsZSk6IFtudW1iZXIsIHN0cmluZ10ge1xyXG5cdGxldCBhbGxvd2VkOiBzdHJpbmdbXTtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSA0OiBhbGxvd2VkID0gbG9jYWxlLmVyYVdpZGU7IGJyZWFrO1xyXG5cdFx0Y2FzZSA1OiBhbGxvd2VkID0gbG9jYWxlLmVyYU5hcnJvdzsgYnJlYWs7XHJcblx0XHRkZWZhdWx0OiBhbGxvd2VkID0gbG9jYWxlLmVyYUFiYnJldmlhdGVkOyBicmVhaztcclxuXHR9XHJcblx0Y29uc3QgcmVzdWx0ID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xyXG5cdHJldHVybiBbYWxsb3dlZC5pbmRleE9mKHJlc3VsdC5jaG9zZW4pID09PSAwID8gMSA6IC0xLCByZXN1bHQucmVtYWluaW5nXTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RyaXBRdWFydGVyKHRva2VuOiBUb2tlbiwgcmVtYWluaW5nOiBzdHJpbmcsIGxvY2FsZTogTG9jYWxlKTogUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdGxldCBxdWFydGVyTGV0dGVyOiBzdHJpbmc7XHJcblx0bGV0IHF1YXJ0ZXJXb3JkOiBzdHJpbmc7XHJcblx0bGV0IHF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBzdHJpbmdbXTtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcIlFcIjpcclxuXHRcdFx0cXVhcnRlckxldHRlciA9IGxvY2FsZS5xdWFydGVyTGV0dGVyO1xyXG5cdFx0XHRxdWFydGVyV29yZCA9IGxvY2FsZS5xdWFydGVyV29yZDtcclxuXHRcdFx0cXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUucXVhcnRlckFiYnJldmlhdGlvbnM7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSBcInFcIjoge1xyXG5cdFx0XHRxdWFydGVyTGV0dGVyID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyO1xyXG5cdFx0XHRxdWFydGVyV29yZCA9IGxvY2FsZS5zdGFuZEFsb25lUXVhcnRlcldvcmQ7XHJcblx0XHRcdHF1YXJ0ZXJBYmJyZXZpYXRpb25zID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyQWJicmV2aWF0aW9ucztcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBxdWFydGVyIHBhdHRlcm5cIik7XHJcblx0fVxyXG5cdGxldCBhbGxvd2VkOiBzdHJpbmdbXTtcclxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSA1OlxyXG5cdFx0XHRyZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKTtcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdGFsbG93ZWQgPSBbMSwgMiwgMywgNF0ubWFwKChuOiBudW1iZXIpOiBzdHJpbmcgPT4gcXVhcnRlckxldHRlciArIG4udG9TdHJpbmcoMTApKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRcdGFsbG93ZWQgPSBxdWFydGVyQWJicmV2aWF0aW9ucy5tYXAoKGE6IHN0cmluZyk6IHN0cmluZyA9PiBhICsgXCIgXCIgKyBxdWFydGVyV29yZCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xyXG5cdH1cclxuXHRjb25zdCByID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xyXG5cdHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwTW9udGgodG9rZW46IFRva2VuLCByZW1haW5pbmc6IHN0cmluZywgbG9jYWxlOiBMb2NhbGUpOiBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0bGV0IHNob3J0TW9udGhOYW1lczogc3RyaW5nW107XHJcblx0bGV0IGxvbmdNb250aE5hbWVzOiBzdHJpbmdbXTtcclxuXHRsZXQgbW9udGhMZXR0ZXJzOiBzdHJpbmdbXTtcclxuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG5cdFx0Y2FzZSBcIk1cIjpcclxuXHRcdFx0c2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnNob3J0TW9udGhOYW1lcztcclxuXHRcdFx0bG9uZ01vbnRoTmFtZXMgPSBsb2NhbGUubG9uZ01vbnRoTmFtZXM7XHJcblx0XHRcdG1vbnRoTGV0dGVycyA9IGxvY2FsZS5tb250aExldHRlcnM7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSBcIkxcIjpcclxuXHRcdFx0c2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM7XHJcblx0XHRcdGxvbmdNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVMb25nTW9udGhOYW1lcztcclxuXHRcdFx0bW9udGhMZXR0ZXJzID0gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnM7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcclxuXHR9XHJcblx0bGV0IGFsbG93ZWQ6IHN0cmluZ1tdO1xyXG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRhbGxvd2VkID0gc2hvcnRNb250aE5hbWVzO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgNDpcclxuXHRcdFx0YWxsb3dlZCA9IGxvbmdNb250aE5hbWVzO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgNTpcclxuXHRcdFx0YWxsb3dlZCA9IG1vbnRoTGV0dGVycztcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xyXG5cdH1cclxuXHRjb25zdCByID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xyXG5cdHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwSG91cih0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdGNvbnN0IHJlc3VsdCA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuXHRcdGNhc2UgXCJoXCI6XHJcblx0XHRcdGlmIChyZXN1bHQubiA9PT0gMTIpIHtcclxuXHRcdFx0XHRyZXN1bHQubiA9IDA7XHJcblx0XHRcdH1cclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlIFwiSFwiOlxyXG5cdFx0XHQvLyBub3RoaW5nLCBpbiByYW5nZSAwLTIzXHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSBcIktcIjpcclxuXHRcdFx0Ly8gbm90aGluZywgaW4gcmFuZ2UgMC0xMVxyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgXCJrXCI6XHJcblx0XHRcdHJlc3VsdC5uIC09IDE7XHJcblx0XHRcdGJyZWFrO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpcFNlY29uZCh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcblx0XHRjYXNlIFwic1wiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuXHRcdGNhc2UgXCJTXCI6XHJcblx0XHRcdHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIHRva2VuLmxlbmd0aCk7XHJcblx0XHRjYXNlIFwiQVwiOlxyXG5cdFx0XHRyZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCA4KTtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHNlY29uZHMgcGF0dGVyblwiKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwTnVtYmVyKHM6IHN0cmluZywgbWF4TGVuZ3RoOiBudW1iZXIpOiBQYXJzZU51bWJlclJlc3VsdCB7XHJcblx0Y29uc3QgcmVzdWx0OiBQYXJzZU51bWJlclJlc3VsdCA9IHtcclxuXHRcdG46IE5hTixcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0bGV0IG51bWJlclN0cmluZyA9IFwiXCI7XHJcblx0d2hpbGUgKG51bWJlclN0cmluZy5sZW5ndGggPCBtYXhMZW5ndGggJiYgcmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApLm1hdGNoKC9cXGQvKSkge1xyXG5cdFx0bnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHQvLyByZW1vdmUgbGVhZGluZyB6ZXJvZXNcclxuXHR3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuXHRcdG51bWJlclN0cmluZyA9IG51bWJlclN0cmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XHJcblx0aWYgKG51bWJlclN0cmluZyA9PT0gXCJcIiB8fCAhTnVtYmVyLmlzRmluaXRlKHJlc3VsdC5uKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICcke251bWJlclN0cmluZ30nYCk7XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwU3RyaW5ncyh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nLCBhbGxvd2VkOiBzdHJpbmdbXSk6IHsgcmVtYWluaW5nOiBzdHJpbmcsIGNob3Nlbjogc3RyaW5nIH0ge1xyXG5cdC8vIG1hdGNoIGxvbmdlc3QgcG9zc2libGUgc3RyaW5nOyBzb3J0IGtleXMgYnkgbGVuZ3RoIGRlc2NlbmRpbmdcclxuXHRjb25zdCBzb3J0ZWRLZXlzOiBzdHJpbmdbXSA9IGFsbG93ZWQuc2xpY2UoKVxyXG5cdFx0LnNvcnQoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyID0+IChhLmxlbmd0aCA8IGIubGVuZ3RoID8gMSA6IGEubGVuZ3RoID4gYi5sZW5ndGggPyAtMSA6IDApKTtcclxuXHJcblx0Y29uc3QgdXBwZXIgPSByZW1haW5pbmcudG9VcHBlckNhc2UoKTtcclxuXHRmb3IgKGNvbnN0IGtleSBvZiBzb3J0ZWRLZXlzKSB7XHJcblx0XHRpZiAodXBwZXIuc3RhcnRzV2l0aChrZXkudG9VcHBlckNhc2UoKSkpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRjaG9zZW46IGtleSxcclxuXHRcdFx0XHRyZW1haW5pbmc6IHJlbWFpbmluZy5zbGljZShrZXkubGVuZ3RoKVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIFwiICsgVG9rZW5UeXBlW3Rva2VuLnR5cGVdLnRvTG93ZXJDYXNlKCkgKyBcIiwgZXhwZWN0ZWQgb25lIG9mIFwiICsgYWxsb3dlZC5qb2luKFwiLCBcIikpO1xyXG59XHJcbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IFRpbWVVbml0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gXCIuL2RhdGV0aW1lXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcblxuLyoqXG4gKiBTcGVjaWZpZXMgaG93IHRoZSBwZXJpb2Qgc2hvdWxkIHJlcGVhdCBhY3Jvc3MgdGhlIGRheVxuICogZHVyaW5nIERTVCBjaGFuZ2VzLlxuICovXG5leHBvcnQgZW51bSBQZXJpb2REc3Qge1xuXHQvKipcblx0ICogS2VlcCByZXBlYXRpbmcgaW4gc2ltaWxhciBpbnRlcnZhbHMgbWVhc3VyZWQgaW4gVVRDLFxuXHQgKiB1bmFmZmVjdGVkIGJ5IERheWxpZ2h0IFNhdmluZyBUaW1lLlxuXHQgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxuXHQgKiBldmVyeSB0aW1lLCBldmVuIGluIGEgdGltZSB6b25lIHdpdGggRFNULlxuXHQgKiBMZWFwIHNlY29uZHMsIGxlYXAgZGF5cyBhbmQgbW9udGggbGVuZ3RoXG5cdCAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cblx0ICovXG5cdFJlZ3VsYXJJbnRlcnZhbHMsXG5cblx0LyoqXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxuXHQgKiBhdCB0aGUgc2FtZSBwbGFjZSBpbiB0aGUgZGF5LCBsb2NhbCB0aW1lLiBTbyBlLmcuXG5cdCAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXG5cdCAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxuXHQgKiBpbiBVVEMgdGltZSwgc29tZSBpbnRlcnZhbHMgd2lsbCBiZSAyNSBob3VycyBhbmQgc29tZVxuXHQgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXG5cdCAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXG5cdCAqIHNraXBwaW5nIGFuIGhvdXIgaW4gVVRDIGZvciBhIERTVCBiYWNrd2FyZCBjaGFuZ2UuXG5cdCAqL1xuXHRSZWd1bGFyTG9jYWxUaW1lLFxuXG5cdC8qKlxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXJcblx0ICovXG5cdE1BWFxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBQZXJpb2REc3QgdG8gYSBzdHJpbmc6IFwicmVndWxhciBpbnRlcnZhbHNcIiBvciBcInJlZ3VsYXIgbG9jYWwgdGltZVwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJpb2REc3RUb1N0cmluZyhwOiBQZXJpb2REc3QpOiBzdHJpbmcge1xuXHRzd2l0Y2ggKHApIHtcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzOiByZXR1cm4gXCJyZWd1bGFyIGludGVydmFsc1wiO1xuXHRcdGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU6IHJldHVybiBcInJlZ3VsYXIgbG9jYWwgdGltZVwiO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gUGVyaW9kRHN0XCIpO1xuXHRcdFx0fVxuXHR9XG59XG5cbi8qKlxuICogUmVwZWF0aW5nIHRpbWUgcGVyaW9kOiBjb25zaXN0cyBvZiBhIHJlZmVyZW5jZSBkYXRlIGFuZFxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQZXJpb2Qge1xuXG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgbW9tZW50IG9mIHBlcmlvZFxuXHQgKi9cblx0cHJpdmF0ZSBfcmVmZXJlbmNlOiBEYXRlVGltZTtcblxuXHQvKipcblx0ICogSW50ZXJ2YWxcblx0ICovXG5cdHByaXZhdGUgX2ludGVydmFsOiBEdXJhdGlvbjtcblxuXHQvKipcblx0ICogRFNUIGhhbmRsaW5nXG5cdCAqL1xuXHRwcml2YXRlIF9kc3Q6IFBlcmlvZERzdDtcblxuXHQvKipcblx0ICogTm9ybWFsaXplZCByZWZlcmVuY2UgZGF0ZSwgaGFzIGRheS1vZi1tb250aCA8PSAyOCBmb3IgTW9udGhseVxuXHQgKiBwZXJpb2QsIG9yIGZvciBZZWFybHkgcGVyaW9kIGlmIG1vbnRoIGlzIEZlYnJ1YXJ5XG5cdCAqL1xuXHRwcml2YXRlIF9pbnRSZWZlcmVuY2U6IERhdGVUaW1lO1xuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVkIGludGVydmFsXG5cdCAqL1xuXHRwcml2YXRlIF9pbnRJbnRlcnZhbDogRHVyYXRpb247XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZWQgaW50ZXJuYWwgRFNUIGhhbmRsaW5nLiBJZiBEU1QgaGFuZGxpbmcgaXMgaXJyZWxldmFudFxuXHQgKiAoYmVjYXVzZSB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBkb2VzIG5vdCBoYXZlIERTVClcblx0ICogdGhlbiBpdCBpcyBzZXQgdG8gUmVndWxhckludGVydmFsXG5cdCAqL1xuXHRwcml2YXRlIF9pbnREc3Q6IFBlcmlvZERzdDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3Rcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBkYXRlIG9mIHRoZSBwZXJpb2QuIElmIHRoZSBwZXJpb2QgaXMgaW4gTW9udGhzIG9yIFllYXJzLCBhbmRcblx0ICogICAgICAgICAgICAgICAgICB0aGUgZGF5IGlzIDI5IG9yIDMwIG9yIDMxLCB0aGUgcmVzdWx0cyBhcmUgbWF4aW1pc2VkIHRvIGVuZC1vZi1tb250aC5cblx0ICogQHBhcmFtIGludGVydmFsIFRoZSBpbnRlcnZhbCBvZiB0aGUgcGVyaW9kXG5cdCAqIEBwYXJhbSBkc3QgU3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxuXHQgKiAgICAgICAgICAgIGlmIHRoZSB0aW1lIHpvbmUgb2YgdGhlIHJlZmVyZW5jZSBkYXRldGltZSBkb2VzIG5vdCBoYXZlIERTVC5cblx0ICogICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcblx0XHRpbnRlcnZhbDogRHVyYXRpb24sXG5cdFx0ZHN0PzogUGVyaW9kRHN0XG5cdCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKiBMSU1JVEFUSU9OOiBpZiBkc3QgZXF1YWxzIFJlZ3VsYXJMb2NhbFRpbWUsIGFuZCB1bml0IGlzIFNlY29uZCwgTWludXRlIG9yIEhvdXIsXG5cdCAqIHRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGEgZmFjdG9yIG9mIDI0LiBTbyAxMjAgc2Vjb25kcyBpcyBhbGxvd2VkIHdoaWxlIDEyMSBzZWNvbmRzIGlzIG5vdC5cblx0ICogVGhpcyBpcyBkdWUgdG8gdGhlIGVub3Jtb3VzIHByb2Nlc3NpbmcgcG93ZXIgcmVxdWlyZWQgYnkgdGhlc2UgY2FzZXMuIFRoZXkgYXJlIG5vdFxuXHQgKiBpbXBsZW1lbnRlZCBhbmQgeW91IHdpbGwgZ2V0IGFuIGFzc2VydC5cblx0ICpcblx0ICogQHBhcmFtIHJlZmVyZW5jZSBUaGUgcmVmZXJlbmNlIG9mIHRoZSBwZXJpb2QuIElmIHRoZSBwZXJpb2QgaXMgaW4gTW9udGhzIG9yIFllYXJzLCBhbmRcblx0ICogICAgICAgICAgICAgICAgICB0aGUgZGF5IGlzIDI5IG9yIDMwIG9yIDMxLCB0aGUgcmVzdWx0cyBhcmUgbWF4aW1pc2VkIHRvIGVuZC1vZi1tb250aC5cblx0ICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IG9mIHVuaXRzLlxuXHQgKiBAcGFyYW0gdW5pdCBUaGUgdW5pdC5cblx0ICogQHBhcmFtIGRzdCBTcGVjaWZpZXMgaG93IHRvIGhhbmRsZSBEYXlsaWdodCBTYXZpbmcgVGltZS4gTm90IHJlbGV2YW50XG5cdCAqICAgICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXG5cdCAqICAgICAgICAgICAgICBEZWZhdWx0cyB0byBSZWd1bGFyTG9jYWxUaW1lLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cmVmZXJlbmNlOiBEYXRlVGltZSxcblx0XHRhbW91bnQ6IG51bWJlcixcblx0XHR1bml0OiBUaW1lVW5pdCxcblx0XHRkc3Q/OiBQZXJpb2REc3Rcblx0KTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLiBTZWUgb3RoZXIgY29uc3RydWN0b3JzIGZvciBleHBsYW5hdGlvbi5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0YW1vdW50T3JJbnRlcnZhbDogYW55LFxuXHRcdHVuaXRPckRzdD86IGFueSxcblx0XHRnaXZlbkRzdD86IFBlcmlvZERzdFxuXHQpIHtcblxuXHRcdGxldCBpbnRlcnZhbDogRHVyYXRpb247XG5cdFx0bGV0IGRzdDogUGVyaW9kRHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XG5cdFx0aWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGludGVydmFsID0gYW1vdW50T3JJbnRlcnZhbCBhcyBEdXJhdGlvbjtcblx0XHRcdGRzdCA9IHVuaXRPckRzdCBhcyBQZXJpb2REc3Q7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IFRpbWVVbml0Lk1BWCwgXCJJbnZhbGlkIHVuaXRcIik7XG5cdFx0XHRpbnRlcnZhbCA9IG5ldyBEdXJhdGlvbihhbW91bnRPckludGVydmFsIGFzIG51bWJlciwgdW5pdE9yRHN0IGFzIFRpbWVVbml0KTtcblx0XHRcdGRzdCA9IGdpdmVuRHN0IGFzIFBlcmlvZERzdDtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcblx0XHRcdGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xuXHRcdH1cblx0XHRhc3NlcnQoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xuXHRcdGFzc2VydCghIXJlZmVyZW5jZSwgXCJSZWZlcmVuY2UgdGltZSBub3QgZ2l2ZW5cIik7XG5cdFx0YXNzZXJ0KGludGVydmFsLmFtb3VudCgpID4gMCwgXCJBbW91bnQgbXVzdCBiZSBwb3NpdGl2ZSBub24temVyby5cIik7XG5cdFx0YXNzZXJ0KE1hdGguZmxvb3IoaW50ZXJ2YWwuYW1vdW50KCkpID09PSBpbnRlcnZhbC5hbW91bnQoKSwgXCJBbW91bnQgbXVzdCBiZSBhIHdob2xlIG51bWJlclwiKTtcblxuXHRcdHRoaXMuX3JlZmVyZW5jZSA9IHJlZmVyZW5jZTtcblx0XHR0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuXHRcdHRoaXMuX2RzdCA9IGRzdDtcblx0XHR0aGlzLl9jYWxjSW50ZXJuYWxWYWx1ZXMoKTtcblxuXHRcdC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxuXHRcdC8vIE5vdGUgd2UgdXNlIGludGVybmFsIGFtb3VudHMgdG8gZGVjaWRlIHRoaXMgYmVjYXVzZSBhY3R1YWxseSBpdCBpcyBzdXBwb3J0ZWQgaWZcblx0XHQvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcblx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMDAwMCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxNDQwLFxuXHRcdFx0XHRcdFx0XCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcblx0XHRcdFx0XHRcdFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAyNCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXG5cdCAqL1xuXHRwdWJsaWMgY2xvbmUoKTogUGVyaW9kIHtcblx0XHRyZXR1cm4gbmV3IFBlcmlvZCh0aGlzLl9yZWZlcmVuY2UsIHRoaXMuX2ludGVydmFsLCB0aGlzLl9kc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSByZWZlcmVuY2UgZGF0ZVxuXHQgKi9cblx0cHVibGljIHJlZmVyZW5jZSgpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBERVBSRUNBVEVEOiBvbGQgbmFtZSBmb3IgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnQoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGludGVydmFsXG5cdCAqL1xuXHRwdWJsaWMgaW50ZXJ2YWwoKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXG5cdCAqL1xuXHRwdWJsaWMgYW1vdW50KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIHVuaXQoKTogVGltZVVuaXQge1xuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC51bml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGRzdCBoYW5kbGluZyBtb2RlXG5cdCAqL1xuXHRwdWJsaWMgZHN0KCk6IFBlcmlvZERzdCB7XG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGdyZWF0ZXIgdGhhblxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGVpdGhlciBib3RoIGhhdmUgdGltZXpvbmVzIG9yIG5vdFxuXHQgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGFmdGVyIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXG5cdCAqIEByZXR1cm4gdGhlIGZpcnN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBhZnRlciBmcm9tRGF0ZSwgZ2l2ZW4gaW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXG5cdCAqL1xuXHRwdWJsaWMgZmluZEZpcnN0KGZyb21EYXRlOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRhc3NlcnQoXG5cdFx0XHQhIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLFxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcblx0XHQpO1xuXHRcdGxldCBhcHByb3g6IERhdGVUaW1lO1xuXHRcdGxldCBhcHByb3gyOiBEYXRlVGltZTtcblx0XHRsZXQgYXBwcm94TWluOiBEYXRlVGltZTtcblx0XHRsZXQgcGVyaW9kczogbnVtYmVyO1xuXHRcdGxldCBkaWZmOiBudW1iZXI7XG5cdFx0bGV0IG5ld1llYXI6IG51bWJlcjtcblx0XHRsZXQgcmVtYWluZGVyOiBudW1iZXI7XG5cdFx0bGV0IGltYXg6IG51bWJlcjtcblx0XHRsZXQgaW1pbjogbnVtYmVyO1xuXHRcdGxldCBpbWlkOiBudW1iZXI7XG5cblx0XHRjb25zdCBub3JtYWxGcm9tID0gdGhpcy5fbm9ybWFsaXplRGF5KGZyb21EYXRlLnRvWm9uZSh0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKSk7XG5cblx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcblx0XHRcdC8vIHNpbXBsZSBjYXNlczogYW1vdW50IGVxdWFscyAxIChlbGltaW5hdGVzIG5lZWQgZm9yIHNlYXJjaGluZyBmb3IgcmVmZXJlbmNlaW5nIHBvaW50KVxuXHRcdFx0aWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcblx0XHRcdFx0Ly8gYXBwbHkgdG8gVVRDIHRpbWVcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgaW50ZXJ2YWxzXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFtb3VudCBpcyBub3QgMSxcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0Ly8gb25seSAyNSBsZWFwIHNlY29uZHMgaGF2ZSBldmVyIGJlZW4gYWRkZWQgc28gdGhpcyBzaG91bGQgc3RpbGwgYmUgT0suXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWludXRlcygpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheTpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnV0Y1llYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNZZWFyKCkpICogMTIgK1xuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcblx0XHRcdFx0XHRcdC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuWWVhcik7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVVbml0XCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgdGltZXMuIElmIHRoZSB1bml0IGlzIGxlc3MgdGhhbiBhIGRheSwgd2UgcmVmZXJlbmNlIGVhY2ggZGF5IGFuZXdcblx0XHRcdFx0c3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTAwMCAmJiAoMTAwMCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcblx0XHRcdFx0XHRcdFx0Ly8gbWludXMgb25lIHNlY29uZCB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWlsbGlzZWNvbmRzXG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LlNlY29uZCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cblx0XHRcdFx0XHRcdFx0Ly8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyB0b2RvXG5cdFx0XHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWlsbGlzZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdFx0aW1pbiA9IDA7XG5cdFx0XHRcdFx0XHRcdHdoaWxlIChpbWF4ID49IGltaW4pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxuXHRcdFx0XHRcdFx0XHRcdGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHRcdFx0XHRcdFx0XHRcdGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBzZWNvbmQgZWFjaCBtaW51dGUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcblx0XHRcdFx0XHRcdFx0Ly8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0Lk1pbnV0ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XG5cdFx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxuXHRcdFx0XHRcdFx0XHQvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5TZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcblx0XHRcdFx0XHRcdFx0aW1heCA9IE1hdGguZmxvb3IoKDg2NDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdFx0aW1pbiA9IDA7XG5cdFx0XHRcdFx0XHRcdHdoaWxlIChpbWF4ID49IGltaW4pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxuXHRcdFx0XHRcdFx0XHRcdGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveDI7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxuXHRcdFx0XHRcdFx0XHRcdFx0aW1pbiA9IGltaWQgKyAxO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxuXHRcdFx0XHRcdFx0XHRcdFx0aW1heCA9IGltaWQgLSAxO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIGhvdXIgdGhpcy5faW50UmVmZXJlbmNlYXJ5IGVhY2ggdGltZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZSBtaW51cyBvbmUgaG91clxuXHRcdFx0XHRcdFx0XHQvLyB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWludXRlcywgc2Vjb25kc1xuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQuc3ViTG9jYWwoMSwgVGltZVVuaXQuSG91cik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBmaXQgaW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHByZXZpb3VzIGRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuXHRcdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoMjQgKiA2MCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWludXRlKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuTWludXRlKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0Ly8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXG5cdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcblx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoMjQgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5Ib3VyKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5Ib3VyKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHQvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XG5cdFx0XHRcdFx0XHRkaWZmID0gKG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSkgKiAxMiArXG5cdFx0XHRcdFx0XHRcdChub3JtYWxGcm9tLm1vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjpcblx0XHRcdFx0XHRcdC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRuZXdZZWFyID0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSArIHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bmV3WWVhciwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBuZXh0IHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3Rcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cblx0ICogVGhpcyBmdW5jdGlvbiBoYXMgTVVDSCBiZXR0ZXIgcGVyZm9ybWFuY2UgdGhhbiBmaW5kRmlyc3QuXG5cdCAqIFJldHVybnMgdGhlIGRhdGV0aW1lIFwiY291bnRcIiB0aW1lcyBhd2F5IGZyb20gdGhlIGdpdmVuIGRhdGV0aW1lLlxuXHQgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxuXHQgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIGFkZC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cblx0ICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cblx0ICovXG5cdHB1YmxpYyBmaW5kTmV4dChwcmV2OiBEYXRlVGltZSwgY291bnQ6IG51bWJlciA9IDEpOiBEYXRlVGltZSB7XG5cdFx0YXNzZXJ0KCEhcHJldiwgXCJQcmV2IG11c3QgYmUgZ2l2ZW5cIik7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLFxuXHRcdFx0XCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIlxuXHRcdCk7XG5cdFx0YXNzZXJ0KHR5cGVvZiAoY291bnQpID09PSBcIm51bWJlclwiLCBcIkNvdW50IG11c3QgYmUgYSBudW1iZXJcIik7XG5cdFx0YXNzZXJ0KE1hdGguZmxvb3IoY291bnQpID09PSBjb3VudCwgXCJDb3VudCBtdXN0IGJlIGFuIGludGVnZXJcIik7XG5cdFx0Y29uc3Qgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xuXHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGQoXG5cdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSlcblx0XHRcdCkuY29udmVydChwcmV2LnpvbmUoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKFxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgbGVzcyB0aGFuXG5cdCAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cblx0ICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3Rcblx0ICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBiZWZvcmUgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcblx0ICogQHJldHVybiB0aGUgbGFzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYmVmb3JlIGZyb21EYXRlLCBnaXZlblxuXHQgKiAgICAgICAgIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxuXHQgKi9cblx0cHVibGljIGZpbmRMYXN0KGZyb206IERhdGVUaW1lKTogRGF0ZVRpbWUge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHRoaXMuZmluZEZpcnN0KGZyb20pKTtcblx0XHRpZiAocmVzdWx0LmVxdWFscyhmcm9tKSkge1xuXHRcdFx0cmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHByZXZpb3VzIHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3Rcblx0ICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBzdWJ0cmFjdC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBuZWdhdGl2ZS5cblx0ICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cblx0ICovXG5cdHB1YmxpYyBmaW5kUHJldihuZXh0OiBEYXRlVGltZSwgY291bnQ6IG51bWJlciA9IDEpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIHRoaXMuZmluZE5leHQobmV4dCwgLTEgKiBjb3VudCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgb24gYSBwZXJpb2QgYm91bmRhcnlcblx0ICogKGV4cGVuc2l2ZSEpXG5cdCAqL1xuXHRwdWJsaWMgaXNCb3VuZGFyeShvY2N1cnJlbmNlOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xuXHRcdGlmICghb2NjdXJyZW5jZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRhc3NlcnQoXG5cdFx0XHQhIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksXG5cdFx0XHRcIlRoZSBvY2N1cnJlbmNlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcblx0XHQpO1xuXHRcdHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoRHVyYXRpb24ubWlsbGlzZWNvbmRzKDEpKSkuZXF1YWxzKG9jY3VycmVuY2UpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cblx0ICogaS5lLiBhIHBlcmlvZCBvZiAyNCBob3VycyBpcyBlcXVhbCB0byBvbmUgb2YgMSBkYXkgaWYgdGhleSBoYXZlIHRoZSBzYW1lIFVUQyByZWZlcmVuY2UgbW9tZW50XG5cdCAqIGFuZCBzYW1lIGRzdC5cblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFBlcmlvZCk6IGJvb2xlYW4ge1xuXHRcdC8vIG5vdGUgd2UgdGFrZSB0aGUgbm9uLW5vcm1hbGl6ZWQgX3JlZmVyZW5jZSBiZWNhdXNlIHRoaXMgaGFzIGFuIGluZmx1ZW5jZSBvbiB0aGUgb3V0Y29tZVxuXHRcdGlmICghdGhpcy5pc0JvdW5kYXJ5KG90aGVyLl9yZWZlcmVuY2UpIHx8ICF0aGlzLl9pbnRJbnRlcnZhbC5lcXVhbHMob3RoZXIuX2ludEludGVydmFsKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRjb25zdCByZWZab25lID0gdGhpcy5fcmVmZXJlbmNlLnpvbmUoKTtcblx0XHRjb25zdCBvdGhlclpvbmUgPSBvdGhlci5fcmVmZXJlbmNlLnpvbmUoKTtcblx0XHRjb25zdCB0aGlzSXNSZWd1bGFyID0gKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIXJlZlpvbmUgfHwgcmVmWm9uZS5pc1V0YygpKTtcblx0XHRjb25zdCBvdGhlcklzUmVndWxhciA9IChvdGhlci5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscyB8fCAhb3RoZXJab25lIHx8IG90aGVyWm9uZS5pc1V0YygpKTtcblx0XHRpZiAodGhpc0lzUmVndWxhciAmJiBvdGhlcklzUmVndWxhcikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9pbnREc3QgPT09IG90aGVyLl9pbnREc3QgJiYgcmVmWm9uZSAmJiBvdGhlclpvbmUgJiYgcmVmWm9uZS5lcXVhbHMob3RoZXJab25lKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cblx0ICovXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IFBlcmlvZCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAodGhpcy5fcmVmZXJlbmNlLmlkZW50aWNhbChvdGhlci5fcmVmZXJlbmNlKVxuXHRcdFx0JiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLl9pbnRlcnZhbClcblx0XHRcdCYmIHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBJU08gZHVyYXRpb24gc3RyaW5nIGUuZy5cblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFIXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcblx0ICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFNICAgKG9uZSBtb250aClcblx0ICovXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2UudG9Jc29TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5faW50ZXJ2YWwudG9Jc29TdHJpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXG5cdCAqIFwiMTAgeWVhcnMsIHJlZmVyZW5jZWluZyBhdCAyMDE0LTAzLTAxVDEyOjAwOjAwIEV1cm9wZS9BbXN0ZXJkYW0sIGtlZXBpbmcgcmVndWxhciBpbnRlcnZhbHNcIi5cblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGxldCByZXN1bHQ6IHN0cmluZyA9IHRoaXMuX2ludGVydmFsLnRvU3RyaW5nKCkgKyBcIiwgcmVmZXJlbmNlaW5nIGF0IFwiICsgdGhpcy5fcmVmZXJlbmNlLnRvU3RyaW5nKCk7XG5cdFx0Ly8gb25seSBhZGQgdGhlIERTVCBoYW5kbGluZyBpZiBpdCBpcyByZWxldmFudFxuXHRcdGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XG5cdFx0XHRyZXN1bHQgKz0gXCIsIGtlZXBpbmcgXCIgKyBwZXJpb2REc3RUb1N0cmluZyh0aGlzLl9kc3QpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENvcnJlY3RzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gX3JlZmVyZW5jZSBhbmQgX2ludFJlZmVyZW5jZS5cblx0ICovXG5cdHByaXZhdGUgX2NvcnJlY3REYXkoZDogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHRoaXMuX3JlZmVyZW5jZSAhPT0gdGhpcy5faW50UmVmZXJlbmNlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRkLnllYXIoKSwgZC5tb250aCgpLCBNYXRoLm1pbihiYXNpY3MuZGF5c0luTW9udGgoZC55ZWFyKCksIGQubW9udGgoKSksIHRoaXMuX3JlZmVyZW5jZS5kYXkoKSksXG5cdFx0XHRcdGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElmIHRoaXMuX2ludGVybmFsVW5pdCBpbiBbTW9udGgsIFllYXJdLCBub3JtYWxpemVzIHRoZSBkYXktb2YtbW9udGhcblx0ICogdG8gPD0gMjguXG5cdCAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcblx0ICovXG5cdHByaXZhdGUgX25vcm1hbGl6ZURheShkOiBEYXRlVGltZSwgYW55bW9udGg6IGJvb2xlYW4gPSB0cnVlKTogRGF0ZVRpbWUge1xuXHRcdGlmICgodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBUaW1lVW5pdC5Nb250aCAmJiBkLmRheSgpID4gMjgpXG5cdFx0XHR8fCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBUaW1lVW5pdC5ZZWFyICYmIChkLm1vbnRoKCkgPT09IDIgfHwgYW55bW9udGgpICYmIGQuZGF5KCkgPiAyOClcblx0XHRcdCkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcblx0XHRcdFx0ZC55ZWFyKCksIGQubW9udGgoKSwgMjgsXG5cdFx0XHRcdGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLFxuXHRcdFx0XHRkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGQ7IC8vIHNhdmUgb24gdGltZSBieSBub3QgcmV0dXJuaW5nIGEgY2xvbmVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIERTVCBoYW5kbGluZyBpcyByZWxldmFudCBmb3IgdXMuXG5cdCAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXG5cdCAqL1xuXHRwcml2YXRlIF9kc3RSZWxldmFudCgpOiBib29sZWFuIHtcblx0XHRjb25zdCB6b25lID0gdGhpcy5fcmVmZXJlbmNlLnpvbmUoKTtcblx0XHRyZXR1cm4gISEoem9uZVxuXHRcdFx0JiYgem9uZS5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcblx0XHRcdCYmIHpvbmUuaGFzRHN0KClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcblx0ICogYXJlIGNvbnZlcnRpYmxlIGludG8gb25lIGFub3RoZXIuIFdlZWtzIGFyZSBjb252ZXJ0ZWQgdG8gZGF5cy5cblx0ICogRS5nLiBtb3JlIHRoYW4gNjAgbWludXRlcyBpcyB0cmFuc2ZlcnJlZCB0byBob3Vycyxcblx0ICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cblx0ICogV2Vla3MgYXJlIGNvbnZlcnRlZCBiYWNrIHRvIGRheXMuXG5cdCAqL1xuXHRwcml2YXRlIF9jYWxjSW50ZXJuYWxWYWx1ZXMoKTogdm9pZCB7XG5cdFx0Ly8gbm9ybWFsaXplIGFueSBhYm92ZS11bml0IHZhbHVlc1xuXHRcdGxldCBpbnRBbW91bnQgPSB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcblx0XHRsZXQgaW50VW5pdCA9IHRoaXMuX2ludGVydmFsLnVuaXQoKTtcblxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5NaWxsaXNlY29uZCAmJiBpbnRBbW91bnQgPj0gMTAwMCAmJiBpbnRBbW91bnQgJSAxMDAwID09PSAwKSB7XG5cdFx0XHQvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDEwMDA7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdH1cblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xuXHRcdFx0Ly8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuXHRcdH1cblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuSG91ciAmJiBpbnRBbW91bnQgPj0gMjQgJiYgaW50QW1vdW50ICUgMjQgPT09IDApIHtcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDI0O1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHR9XG5cdFx0Ly8gbm93IHJlbW92ZSB3ZWVrcyBzbyB3ZSBoYXZlIG9uZSBsZXNzIGNhc2UgdG8gd29ycnkgYWJvdXRcblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuV2Vlaykge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50ICogNztcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5EYXk7XG5cdFx0fVxuXHRcdGlmIChpbnRVbml0ID09PSBUaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAvIDEyO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LlllYXI7XG5cdFx0fVxuXG5cdFx0dGhpcy5faW50SW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oaW50QW1vdW50LCBpbnRVbml0KTtcblxuXHRcdC8vIG5vcm1hbGl6ZSBkc3QgaGFuZGxpbmdcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xuXHRcdFx0dGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9pbnREc3QgPSBQZXJpb2REc3QuUmVndWxhckludGVydmFscztcblx0XHR9XG5cblx0XHQvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxuXHRcdHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcblx0fVxuXG59XG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZExlZnQoczogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuXHRcdHBhZGRpbmcgKz0gY2hhcjtcclxuXHR9XHJcblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcblxyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZFJpZ2h0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgcGFkZGluZzogc3RyaW5nID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcblx0XHRwYWRkaW5nICs9IGNoYXI7XHJcblx0fVxyXG5cdHJldHVybiBzICsgcGFkZGluZztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMsIHdlIG9mdGVuIG5lZWQgdG8gbWFuaXB1bGF0ZSB3aGF0IHRoZSBjdXJyZW50XHJcbiAqIHRpbWUgaXMuIFRoaXMgaXMgYW4gaW50ZXJmYWNlIGZvciBhIGN1c3RvbSB0aW1lIHNvdXJjZSBvYmplY3RcclxuICogc28gaW4gdGVzdHMgeW91IGNhbiB1c2UgYSBjdXN0b20gdGltZSBzb3VyY2UuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVTb3VyY2Uge1xyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGUgY3VycmVudCBkYXRlK3RpbWUgYXMgYSBqYXZhc2NyaXB0IERhdGUgb2JqZWN0XHJcblx0ICovXHJcblx0bm93KCk6IERhdGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHRpbWUgc291cmNlLCByZXR1cm5zIGFjdHVhbCB0aW1lXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmVhbFRpbWVTb3VyY2UgaW1wbGVtZW50cyBUaW1lU291cmNlIHtcclxuXHRwdWJsaWMgbm93KCk6IERhdGUge1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgVGltZVN0cnVjdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uLCBUekRhdGFiYXNlIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcblxuLyoqXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhbCgpOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS5sb2NhbCgpO1xufVxuXG4vKipcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0YygpOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS51dGMoKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gb2Zmc2V0IG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMsIGUuZy4gOTAgZm9yICswMTozMC4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICogQHJldHVybnMgYSB0aW1lIHpvbmUgd2l0aCB0aGUgZ2l2ZW4gZml4ZWQgb2Zmc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XG5cbi8qKlxuICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcbiAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXG4gKiAgICAgICAgICBvciBhbiBvZmZzZXQgc3RyaW5nIChlaXRoZXIgKzAxOjMwLCArMDEzMCwgKzAxLCBaKS4gRm9yIGEgZnVsbCBsaXN0IG9mIG5hbWVzLCBzZWU6XG4gKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcbiAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxuICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcbiAqICAgICAgICAgICAgICBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKG5hbWU6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xuXG4vKipcbiAqIFNlZSB0aGUgZGVzY3JpcHRpb25zIGZvciB0aGUgb3RoZXIgem9uZSgpIG1ldGhvZCBzaWduYXR1cmVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gem9uZShhOiBhbnksIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XG59XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXG4gKi9cbmV4cG9ydCBlbnVtIFRpbWVab25lS2luZCB7XG5cdC8qKlxuXHQgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cblx0ICovXG5cdExvY2FsLFxuXHQvKipcblx0ICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cblx0ICovXG5cdE9mZnNldCxcblx0LyoqXG5cdCAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xuXHQgKiBEU1QgaWYgYXBwbGljYWJsZS5cblx0ICovXG5cdFByb3BlclxufVxuXG4vKipcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XG4gKiByZXF1ZXN0aW5nIGEgdGltZSB6b25lIHR3aWNlIHlpZWxkcyB0aGUgdmVyeSBzYW1lIG9iamVjdC5cbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxuICpcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcbiAqIGFwcGxpZWQgZGVwZW5kaW5nIG9uIHRoZSB0aW1lIHpvbmUgcnVsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaW1lWm9uZSB7XG5cblx0LyoqXG5cdCAqIFRpbWUgem9uZSBpZGVudGlmaWVyOlxuXHQgKiAgXCJsb2NhbHRpbWVcIiBzdHJpbmcgZm9yIGxvY2FsIHRpbWVcblx0ICogIEUuZy4gXCItMDE6MzBcIiBmb3IgYSBmaXhlZCBvZmZzZXQgZnJvbSBVVENcblx0ICogIEUuZy4gXCJVVENcIiBvciBcIkV1cm9wZS9BbXN0ZXJkYW1cIiBmb3IgYW4gT2xzZW4gVFogZGF0YWJhc2UgdGltZVxuXHQgKi9cblx0cHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZVxuXHQgKi9cblx0cHJpdmF0ZSBfZHN0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgc3BlY2lmaWVkIGJ5IF9uYW1lXG5cdCAqL1xuXHRwcml2YXRlIF9raW5kOiBUaW1lWm9uZUtpbmQ7XG5cblx0LyoqXG5cdCAqIE9ubHkgZm9yIGZpeGVkIG9mZnNldHM6IHRoZSBvZmZzZXQgaW4gbWludXRlc1xuXHQgKi9cblx0cHJpdmF0ZSBfb2Zmc2V0OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZS4gTm90ZSB0aGF0XG5cdCAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxuXHQgKiAyMDE0LTAxLTAxIGlzICswMTowMCBhbmQgYW1zdGVyZGFtIHRpbWUgZm9yIDIwMTQtMDctMDEgaXMgKzAyOjAwXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGxvY2FsKCk6IFRpbWVab25lIHtcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcImxvY2FsdGltZVwiLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgVVRDIHRpbWUgem9uZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdXRjKCk6IFRpbWVab25lIHtcblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcIlVUQ1wiLCB0cnVlKTsgLy8gdXNlICd0cnVlJyBmb3IgRFNUIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBkaXNwbGF5IGFzIFwiVVRDXCIsIG5vdCBcIlVUQyB3aXRob3V0IERTVFwiXG5cdH1cblxuXHQvKipcblx0ICogVGltZSB6b25lIHdpdGggYSBmaXhlZCBvZmZzZXRcblx0ICogQHBhcmFtIG9mZnNldFx0b2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcywgZS5nLiA5MCBmb3IgKzAxOjMwXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHpvbmUob2Zmc2V0OiBudW1iZXIpOiBUaW1lWm9uZTtcblxuXHQvKipcblx0ICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuXHQgKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG5cdCAqIEBwYXJhbSBzIFwibG9jYWx0aW1lXCIgZm9yIGxvY2FsIHRpbWUsXG5cdCAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXG5cdCAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcblx0ICogICAgICAgICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl90el9kYXRhYmFzZV90aW1lX3pvbmVzXG5cdCAqICAgICAgICAgIFRaIGRhdGFiYXNlIHpvbmUgbmFtZSBtYXkgYmUgc3VmZml4ZWQgd2l0aCBcIiB3aXRob3V0IERTVFwiIHRvIGluZGljYXRlIG5vIERTVCBzaG91bGQgYmUgYXBwbGllZC5cblx0ICogICAgICAgICAgSW4gdGhhdCBjYXNlLCB0aGUgZHN0IHBhcmFtZXRlciBpcyBpZ25vcmVkLlxuXHQgKiBAcGFyYW0gZHN0XHRPcHRpb25hbCwgZGVmYXVsdCB0cnVlOiBhZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZS4gTm90ZSBmb3Jcblx0ICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcblx0ICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgem9uZShzOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcblxuXHQvKipcblx0ICogWm9uZSBpbXBsZW1lbnRhdGlvbnNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgem9uZShhOiBhbnksIGRzdDogYm9vbGVhbiA9IHRydWUpOiBUaW1lWm9uZSB7XG5cdFx0bGV0IG5hbWUgPSBcIlwiO1xuXHRcdHN3aXRjaCAodHlwZW9mIChhKSkge1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XG5cdFx0XHRcdGxldCBzID0gYSBhcyBzdHJpbmc7XG5cdFx0XHRcdGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XG5cdFx0XHRcdFx0ZHN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cyA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgLSAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRuYW1lID0gVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyhzKTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcblx0XHRcdFx0Y29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBhIGFzIG51bWJlcjtcblx0XHRcdFx0YXNzZXJ0KG9mZnNldCA+IC0yNCAqIDYwICYmIG9mZnNldCA8IDI0ICogNjAsIFwiVGltZVpvbmUuem9uZSgpOiBvZmZzZXQgb3V0IG9mIHJhbmdlXCIpO1xuXHRcdFx0XHRuYW1lID0gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcob2Zmc2V0KTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVGltZVpvbmUuem9uZSgpOiBVbmV4cGVjdGVkIGFyZ3VtZW50IHR5cGUgXFxcIlwiICsgdHlwZW9mIChhKSArIFwiXFxcIlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShuYW1lLCBkc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERvIG5vdCB1c2UgdGhpcyBjb25zdHJ1Y3RvciwgdXNlIHRoZSBzdGF0aWNcblx0ICogVGltZVpvbmUuem9uZSgpIG1ldGhvZCBpbnN0ZWFkLlxuXHQgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxuXHQgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xuXHQgKi9cblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbiA9IHRydWUpIHtcblx0XHR0aGlzLl9uYW1lID0gbmFtZTtcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XG5cdFx0aWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcblx0XHRcdHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuTG9jYWw7XG5cdFx0fSBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5PZmZzZXQ7XG5cdFx0XHR0aGlzLl9vZmZzZXQgPSBUaW1lWm9uZS5zdHJpbmdUb09mZnNldChuYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Qcm9wZXI7XG5cdFx0XHRhc3NlcnQoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmV4aXN0cyhuYW1lKSwgYG5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnJHtuYW1lfSdgKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGNhY2hlZCB5b3Ugd2lsbCBOT1Rcblx0ICogYWN0dWFsbHkgZ2V0IGEgY2xvbmUgYnV0IHRoZSBzYW1lIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lWm9uZSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyLiBDYW4gYmUgYW4gb2Zmc2V0IFwiLTAxOjMwXCIgb3IgYW5cblx0ICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3Jcblx0ICogdGhlIGxvY2FsIHRpbWUgem9uZS5cblx0ICovXG5cdHB1YmxpYyBuYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX25hbWU7XG5cdH1cblxuXHRwdWJsaWMgZHN0KCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9kc3Q7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxuXHQgKi9cblx0cHVibGljIGtpbmQoKTogVGltZVpvbmVLaW5kIHtcblx0XHRyZXR1cm4gdGhpcy5fa2luZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBFcXVhbGl0eSBvcGVyYXRvci4gTWFwcyB6ZXJvIG9mZnNldHMgYW5kIGRpZmZlcmVudCBuYW1lcyBmb3IgVVRDIG9udG9cblx0ICogZWFjaCBvdGhlci4gT3RoZXIgdGltZSB6b25lcyBhcmUgbm90IG1hcHBlZCBvbnRvIGVhY2ggb3RoZXIuXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmlzVXRjKCkgJiYgb3RoZXIuaXNVdGMoKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlclxuXHRcdFx0XHQmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxuXHRcdFx0XHQmJiAodGhpcy5fZHN0ID09PSBvdGhlci5fZHN0IHx8ICF0aGlzLmhhc0RzdCgpKSk7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHpvbmUga2luZC5cIik7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxuXHQgKi9cblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogVGltZVpvbmUpOiBib29sZWFuIHtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWUgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJcyB0aGlzIHpvbmUgZXF1aXZhbGVudCB0byBVVEM/XG5cdCAqL1xuXHRwdWJsaWMgaXNVdGMoKTogYm9vbGVhbiB7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnpvbmVJc1V0Yyh0aGlzLl9uYW1lKSk7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogRG9lcyB0aGlzIHpvbmUgaGF2ZSBEYXlsaWdodCBTYXZpbmcgVGltZSBhdCBhbGw/XG5cdCAqL1xuXHRwdWJsaWMgaGFzRHN0KCk6IGJvb2xlYW4ge1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5oYXNEc3QodGhpcy5fbmFtZSkpO1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgaW5jbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxuXHQgKi9cblx0cHVibGljIG9mZnNldEZvclV0YyhvZmZzZXRGb3JVdGM6IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XG5cdHB1YmxpYyBvZmZzZXRGb3JVdGMoeWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyKTogbnVtYmVyO1xuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKFxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcblx0KTogbnVtYmVyIHtcblx0XHRjb25zdCB1dGNUaW1lOiBUaW1lU3RydWN0ID0gKFxuXHRcdFx0dHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSA6XG5cdFx0XHR0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBUaW1lU3RydWN0KHt9KSA6XG5cdFx0XHRhXG5cdFx0KTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhcblx0XHRcdFx0XHR1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSxcblx0XHRcdFx0XHR1dGNUaW1lLmNvbXBvbmVudHMuaG91ciwgdXRjVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgdXRjVGltZS5jb21wb25lbnRzLnNlY29uZCwgdXRjVGltZS5jb21wb25lbnRzLm1pbGxpXG5cdFx0XHRcdCkpO1xuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuXHRcdFx0XHRpZiAodGhpcy5fZHN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBzdGFuZGFyZCBvZmZzZXQgZXhjbHVkaW5nIERTVCBmcm9tIGEgVVRDIHRpbWUuXG5cdCAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBudW1iZXI7XG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldEZvclV0Yyhcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlciB7XG5cdFx0Y29uc3QgdXRjVGltZTogVGltZVN0cnVjdCA9IChcblx0XHRcdHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSkgOlxuXHRcdFx0dHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIgPyBuZXcgVGltZVN0cnVjdCh7fSkgOlxuXHRcdFx0YVxuXHRcdCk7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoRGF0ZS5VVEModXRjVGltZS5jb21wb25lbnRzLnllYXIsIDAsIDEsIDApKTtcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG5cdFx0XHR9XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgdGltZXpvbmUgb2Zmc2V0IGZyb20gYSB6b25lLWxvY2FsIHRpbWUgKE5PVCBhIFVUQyB0aW1lKS5cblx0ICogQHBhcmFtIHllYXIgbG9jYWwgZnVsbCB5ZWFyXG5cdCAqIEBwYXJhbSBtb250aCBsb2NhbCBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXG5cdCAqIEBwYXJhbSBkYXkgbG9jYWwgZGF5IG9mIG1vbnRoIDEtMzFcblx0ICogQHBhcmFtIGhvdXIgbG9jYWwgaG91ciAwLTIzXG5cdCAqIEBwYXJhbSBtaW51dGUgbG9jYWwgbWludXRlIDAtNTlcblx0ICogQHBhcmFtIHNlY29uZCBsb2NhbCBzZWNvbmQgMC01OVxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmQgbG9jYWwgbWlsbGlzZWNvbmQgMC05OTlcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclpvbmUoXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBudW1iZXIge1xuXHRcdGNvbnN0IGxvY2FsVGltZTogVGltZVN0cnVjdCA9IChcblx0XHRcdHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSkgOlxuXHRcdFx0dHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIgPyBuZXcgVGltZVN0cnVjdCh7fSkgOlxuXHRcdFx0YVxuXHRcdCk7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xuXHRcdFx0XHRjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoXG5cdFx0XHRcdFx0bG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy5kYXksXG5cdFx0XHRcdFx0bG9jYWxUaW1lLmNvbXBvbmVudHMuaG91ciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWludXRlLCBsb2NhbFRpbWUuY29tcG9uZW50cy5zZWNvbmQsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbGxpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG5cdFx0XHRcdC8vIG5vdGUgdGhhdCBUekRhdGFiYXNlIG5vcm1hbGl6ZXMgdGhlIGdpdmVuIGRhdGUgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyBpdFxuXHRcdFx0XHRpZiAodGhpcy5fZHN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXG5cdCAqXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjRGF0ZShkYXRlOiBEYXRlLCBmdW5jczogRGF0ZUZ1bmN0aW9ucyk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub2Zmc2V0Rm9yVXRjKFRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxuXHQgKlxuXHQgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcblx0ICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcblx0ICpcblx0ICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXG5cdCAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxuXHQgKi9cblx0cHVibGljIG9mZnNldEZvclpvbmVEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3Jab25lKFRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBab25lIGFiYnJldmlhdGlvbiBhdCBnaXZlbiBVVEMgdGltZXN0YW1wIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cblx0ICpcblx0ICogQHBhcmFtIHllYXIgRnVsbCB5ZWFyXG5cdCAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXG5cdCAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcblx0ICogQHBhcmFtIGhvdXIgSG91ciAwLTIzXG5cdCAqIEBwYXJhbSBtaW51dGUgTWludXRlIDAtNTlcblx0ICogQHBhcmFtIHNlY29uZCBTZWNvbmQgMC01OVxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmQgTWlsbGlzZWNvbmQgMC05OTlcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuXHQgKlxuXHQgKiBAcmV0dXJuIFwibG9jYWxcIiBmb3IgbG9jYWwgdGltZXpvbmUsIHRoZSBvZmZzZXQgZm9yIGFuIG9mZnNldCB6b25lLCBvciB0aGUgYWJicmV2aWF0aW9uIGZvciBhIHByb3BlciB6b25lLlxuXHQgKi9cblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyhcblx0XHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIsIGRzdERlcGVuZGVudD86IGJvb2xlYW5cblx0KTogc3RyaW5nO1xuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKHV0Y1RpbWU6IFRpbWVTdHJ1Y3QsIGRzdERlcGVuZGVudD86IGJvb2xlYW4pOiBzdHJpbmc7XG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGMoXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIGI/OiBudW1iZXIgfCBib29sZWFuLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgYz86IGJvb2xlYW5cblx0KTogc3RyaW5nIHtcblx0XHRsZXQgdXRjVGltZTogVGltZVN0cnVjdDtcblx0XHRsZXQgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZTtcblx0XHRpZiAodHlwZW9mIGEgIT09IFwibnVtYmVyXCIgJiYgISFhKSB7XG5cdFx0XHR1dGNUaW1lID0gYTtcblx0XHRcdGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHV0Y1RpbWUgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBiIGFzIG51bWJlciwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSk7XG5cdFx0XHRkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXHRcdH1cblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdHJldHVybiBcImxvY2FsXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHR6b25lIHRpbWUgdGltZXN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXBcblx0ICpcblx0ICogQHJldHVybnNcdHVuaXggbWlsbGlzZWNvbmRzIGluIHpvbmUgdGltZSwgbm9ybWFsaXplZC5cblx0ICovXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFVuaXhNaWxsaXM6IG51bWJlciwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogbnVtYmVyO1xuXHQvKipcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHR6b25lIHRpbWUgdGltZXN0YW1wXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXBcblx0ICpcblx0ICogQHJldHVybnNcdHRpbWUgc3RydWN0IGluIHpvbmUgdGltZSwgbm9ybWFsaXplZC5cblx0ICovXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IFRpbWVTdHJ1Y3Q7XG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG9wdDogTm9ybWFsaXplT3B0aW9uID0gTm9ybWFsaXplT3B0aW9uLlVwKTogVGltZVN0cnVjdCB8IG51bWJlciB7XG5cdFx0Y29uc3QgdHpvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5Eb3duID8gTm9ybWFsaXplT3B0aW9uLkRvd24gOiBOb3JtYWxpemVPcHRpb24uVXApO1xuXHRcdGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xuXHRcdFx0aWYgKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUpLCB0em9wdCkudW5peE1pbGxpcztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lLCB0em9wdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBsb2NhbFRpbWU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXG5cdCAqIEVpdGhlciBcImxvY2FsdGltZVwiLCBJQU5BIG5hbWUsIG9yIFwiK2hoOm1tXCIgb2Zmc2V0LlxuXHQgKi9cblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubmFtZSgpO1xuXHRcdGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xuXHRcdFx0aWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcblx0XHRcdFx0cmVzdWx0ICs9IFwiIHdpdGhvdXQgRFNUXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xuXHQgKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgaW4gbWludXRlcyBmcm9tIFVUQyBlLmcuIDkwIG1pbnV0ZXNcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBvZmZzZXRUb1N0cmluZyhvZmZzZXQ6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0Y29uc3Qgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XG5cdFx0Y29uc3QgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG5cdFx0Y29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAlIDYwKTtcblx0XHRyZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogU3RyaW5nIHRvIG9mZnNldCBjb252ZXJzaW9uLlxuXHQgKiBAcGFyYW0gc1x0Rm9ybWF0czogXCItMDE6MDBcIiwgXCItMDEwMFwiLCBcIi0wMVwiLCBcIlpcIlxuXHQgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgc3RyaW5nVG9PZmZzZXQoczogc3RyaW5nKTogbnVtYmVyIHtcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XG5cdFx0Ly8gZWFzeSBjYXNlXG5cdFx0aWYgKHQgPT09IFwiWlwiKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cdFx0Ly8gY2hlY2sgdGhhdCB0aGUgcmVtYWluZGVyIGNvbmZvcm1zIHRvIElTTyB0aW1lIHpvbmUgc3BlY1xuXHRcdGFzc2VydCh0Lm1hdGNoKC9eWystXVxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLyksIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcblx0XHRjb25zdCBzaWduOiBudW1iZXIgPSAodC5jaGFyQXQoMCkgPT09IFwiK1wiID8gMSA6IC0xKTtcblx0XHRsZXQgaG91cnM6IG51bWJlciA9IDA7XG5cdFx0bGV0IG1pbnV0ZXM6IG51bWJlciA9IDA7XG5cdFx0c3dpdGNoICh0Lmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMiksIDEwKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAzKSwgMTApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgNTpcblx0XHRcdFx0aG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XG5cdFx0XHRcdG1pbnV0ZXMgPSBwYXJzZUludCh0LnNsaWNlKDMsIDUpLCAxMCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA2OlxuXHRcdFx0XHRob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcblx0XHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc2xpY2UoNCwgNiksIDEwKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGFzc2VydChob3VycyA+PSAwICYmIGhvdXJzIDwgMjQsIGBJbnZhbGlkIHRpbWUgem9uZSAoaG91cnMgb3V0IG9mIHJhbmdlKTogJyR7dH0nYCk7XG5cdFx0YXNzZXJ0KG1pbnV0ZXMgPj0gMCAmJiBtaW51dGVzIDwgNjAsIGBJbnZhbGlkIHRpbWUgem9uZSAobWludXRlcyBvdXQgb2YgcmFuZ2UpOiAnJHt0fSdgKTtcblx0XHRyZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcyk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgY2FjaGUuXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfY2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBUaW1lWm9uZSB9ID0ge307XG5cblx0LyoqXG5cdCAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcblx0ICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9maW5kT3JDcmVhdGUobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4pOiBUaW1lWm9uZSB7XG5cdFx0Y29uc3Qga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcblx0XHRpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xuXHRcdFx0cmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XG5cdFx0XHRUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhXG5cdCAqIGNhY2hlIGxvb2t1cFxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgX25vcm1hbGl6ZVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHQ6IHN0cmluZyA9IHMudHJpbSgpO1xuXHRcdGFzc2VydCh0Lmxlbmd0aCA+IDAsIFwiRW1wdHkgdGltZSB6b25lIHN0cmluZyBnaXZlblwiKTtcblx0XHRpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0cmV0dXJuIHQ7XG5cdFx0fSBlbHNlIGlmICh0ID09PSBcIlpcIikge1xuXHRcdFx0cmV0dXJuIFwiKzAwOjAwXCI7XG5cdFx0fSBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcblx0XHRcdC8vIG9mZnNldCBzdHJpbmdcblx0XHRcdC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXG5cdFx0XHRyZXR1cm4gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcoVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQodCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0YXRpYyBfaXNPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdCA9IHMudHJpbSgpO1xuXHRcdHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XG5cdH1cbn1cblxuXG5cbiIsIi8qKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbmV4cG9ydCBlbnVtIFRva2VuVHlwZSB7XHJcblx0LyoqXHJcblx0ICogUmF3IHRleHRcclxuXHQgKi9cclxuXHRJREVOVElUWSxcclxuXHRFUkEsXHJcblx0WUVBUixcclxuXHRRVUFSVEVSLFxyXG5cdE1PTlRILFxyXG5cdFdFRUssXHJcblx0REFZLFxyXG5cdFdFRUtEQVksXHJcblx0REFZUEVSSU9ELFxyXG5cdEhPVVIsXHJcblx0TUlOVVRFLFxyXG5cdFNFQ09ORCxcclxuXHRaT05FXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyB0b2tlblxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUb2tlbiB7XHJcblx0LyoqXHJcblx0ICogVGhlIHR5cGUgb2YgdG9rZW5cclxuXHQgKi9cclxuXHR0eXBlOiBUb2tlblR5cGU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzeW1ib2wgZnJvbSB3aGljaCB0aGUgdG9rZW4gd2FzIHBhcnNlZFxyXG5cdCAqL1xyXG5cdHN5bWJvbDogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSB0b2tlblxyXG5cdCAqL1xyXG5cdGxlbmd0aDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgcHJvZHVjZWQgdGhpcyB0b2tlblxyXG5cdCAqL1xyXG5cdHJhdzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogVG9rZW5pemUgYW4gTERNTCBkYXRlL3RpbWUgZm9ybWF0IHN0cmluZ1xyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIHRoZSBzdHJpbmcgdG8gdG9rZW5pemVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZShmb3JtYXRTdHJpbmc6IHN0cmluZyk6IFRva2VuW10ge1xyXG5cdGlmICghZm9ybWF0U3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gW107XHJcblx0fVxyXG5cclxuXHRjb25zdCByZXN1bHQ6IFRva2VuW10gPSBbXTtcclxuXHJcblx0Y29uc3QgYXBwZW5kVG9rZW4gPSAodG9rZW5TdHJpbmc6IHN0cmluZywgcmF3PzogYm9vbGVhbik6IHZvaWQgPT4ge1xyXG5cdFx0Ly8gVGhlIHRva2VuU3RyaW5nIG1heSBiZSBsb25nZXIgdGhhbiBzdXBwb3J0ZWQgZm9yIGEgdG9rZW50eXBlLCBlLmcuIFwiaGhoaFwiIHdoaWNoIHdvdWxkIGJlIFRXTyBob3VyIHNwZWNzLlxyXG5cdFx0Ly8gV2UgZ3JlZWRpbHkgY29uc3VtZSBMRE1MIHNwZWNzIHdoaWxlIHBvc3NpYmxlXHJcblx0XHR3aGlsZSAodG9rZW5TdHJpbmcgIT09IFwiXCIpIHtcclxuXHRcdFx0aWYgKHJhdyB8fCAhU1lNQk9MX01BUFBJTkcuaGFzT3duUHJvcGVydHkodG9rZW5TdHJpbmdbMF0pKSB7XHJcblx0XHRcdFx0Y29uc3QgdG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXHJcblx0XHRcdFx0XHRyYXc6IHRva2VuU3RyaW5nLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuXHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmVzdWx0LnB1c2godG9rZW4pO1xyXG5cdFx0XHRcdHRva2VuU3RyaW5nID0gXCJcIjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdG9rZW4sIGRpZmZlcmVudCBsZW5ndGhzIG1heSBiZSBzdXBwb3J0ZWRcclxuXHRcdFx0XHRjb25zdCBpbmZvID0gU1lNQk9MX01BUFBJTkdbdG9rZW5TdHJpbmdbMF1dO1xyXG5cdFx0XHRcdGxldCBsZW5ndGg6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRcdFx0XHRpZiAoaW5mby5tYXhMZW5ndGggPT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkoaW5mby5sZW5ndGhzKSB8fCBpbmZvLmxlbmd0aHMubGVuZ3RoID09PSAwKSkge1xyXG5cdFx0XHRcdFx0Ly8gZXZlcnl0aGluZyBpcyBhbGxvd2VkXHJcblx0XHRcdFx0XHRsZW5ndGggPSB0b2tlblN0cmluZy5sZW5ndGg7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChpbmZvLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHQvLyBncmVlZGlseSBnb2JibGUgdXBcclxuXHRcdFx0XHRcdGxlbmd0aCA9IE1hdGgubWluKHRva2VuU3RyaW5nLmxlbmd0aCwgaW5mby5tYXhMZW5ndGgpO1xyXG5cdFx0XHRcdH0gZWxzZSAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqLyBpZiAoQXJyYXkuaXNBcnJheShpbmZvLmxlbmd0aHMpICYmIGluZm8ubGVuZ3Rocy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHQvLyBmaW5kIG1heGltdW0gYWxsb3dlZCBsZW5ndGhcclxuXHRcdFx0XHRcdGZvciAoY29uc3QgbCBvZiBpbmZvLmxlbmd0aHMpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGwgPD0gdG9rZW5TdHJpbmcubGVuZ3RoICYmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPCBsKSkge1xyXG5cdFx0XHRcdFx0XHRcdGxlbmd0aCA9IGw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHQvLyBubyBhbGxvd2VkIGxlbmd0aCBmb3VuZCAobm90IHBvc3NpYmxlIHdpdGggY3VycmVudCBzeW1ib2wgbWFwcGluZyBzaW5jZSBsZW5ndGggMSBpcyBhbHdheXMgYWxsb3dlZClcclxuXHRcdFx0XHRcdGNvbnN0IHRva2VuOiBUb2tlbiA9IHtcclxuXHRcdFx0XHRcdFx0bGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcsXHJcblx0XHRcdFx0XHRcdHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcblx0XHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHRva2VuKTtcclxuXHRcdFx0XHRcdHRva2VuU3RyaW5nID0gXCJcIjtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gcHJlZml4IGZvdW5kXHJcblx0XHRcdFx0XHRjb25zdCB0b2tlbjogVG9rZW4gPSB7XHJcblx0XHRcdFx0XHRcdGxlbmd0aCxcclxuXHRcdFx0XHRcdFx0cmF3OiB0b2tlblN0cmluZy5zbGljZSgwLCBsZW5ndGgpLFxyXG5cdFx0XHRcdFx0XHRzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiBpbmZvLnR5cGVcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaCh0b2tlbik7XHJcblx0XHRcdFx0XHR0b2tlblN0cmluZyA9IHRva2VuU3RyaW5nLnNsaWNlKGxlbmd0aCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0bGV0IGN1cnJlbnRUb2tlbjogc3RyaW5nID0gXCJcIjtcclxuXHRsZXQgcHJldmlvdXNDaGFyOiBzdHJpbmcgPSBcIlwiO1xyXG5cdGxldCBxdW90aW5nOiBib29sZWFuID0gZmFsc2U7XHJcblx0bGV0IHBvc3NpYmxlRXNjYXBpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBjdXJyZW50Q2hhciBvZiBmb3JtYXRTdHJpbmcpIHtcclxuXHRcdC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG5cdFx0aWYgKGN1cnJlbnRDaGFyID09PSBcIidcIikge1xyXG5cdFx0XHRpZiAoIXF1b3RpbmcpIHtcclxuXHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0Ly8gRXNjYXBlZCBhIHNpbmdsZSAnIGNoYXJhY3RlciB3aXRob3V0IHF1b3RpbmdcclxuXHRcdFx0XHRcdGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcblx0XHRcdFx0XHRcdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbik7XHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gXCInXCI7XHJcblx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxyXG5cdFx0XHRcdGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHQvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcblx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcblx0XHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xyXG5cdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0XHQvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXHJcblx0XHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9IGVsc2UgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuXHRcdFx0cXVvdGluZyA9ICFxdW90aW5nO1xyXG5cdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0XHQvLyBGbHVzaCBjdXJyZW50IHRva2VuXHJcblx0XHRcdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgIXF1b3RpbmcpO1xyXG5cdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChxdW90aW5nKSB7XHJcblx0XHRcdC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cclxuXHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG5cdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuXHRcdFx0Ly8gV2Ugc3R1bWJsZWQgdXBvbiBhIG5ldyB0b2tlbiFcclxuXHRcdFx0YXBwZW5kVG9rZW4oY3VycmVudFRva2VuKTtcclxuXHRcdFx0Y3VycmVudFRva2VuID0gY3VycmVudENoYXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG5cdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0fVxyXG5cdC8vIERvbid0IGZvcmdldCB0byBhZGQgdGhlIGxhc3QgdG9rZW4gdG8gdGhlIHJlc3VsdCFcclxuXHRhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHF1b3RpbmcpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3ltYm9sSW5mbyB7XHJcblx0LyoqXHJcblx0ICogVG9rZW4gdHlwZVxyXG5cdCAqL1xyXG5cdHR5cGU6IFRva2VuVHlwZTtcclxuXHQvKipcclxuXHQgKiBNYXhpbXVtIHRva2VuIGxlbmd0aCAodW5kZWZpbmVkIGZvciB1bmxpbWl0ZWQgdG9rZW5zKVxyXG5cdCAqL1xyXG5cdG1heExlbmd0aD86IG51bWJlcjtcclxuXHQvKipcclxuXHQgKiBBbGxvd2VkIHRva2VuIGxlbmd0aHMgKGluc3RlYWQgb2YgbWluTGVuZ3RoL21heExlbmd0aClcclxuXHQgKi9cclxuXHRsZW5ndGhzPzogbnVtYmVyW107XHJcbn1cclxuXHJcbmNvbnN0IFNZTUJPTF9NQVBQSU5HOiB7IFtjaGFyOiBzdHJpbmddOiBTeW1ib2xJbmZvIH0gPSB7XHJcblx0RzogeyB0eXBlOiBUb2tlblR5cGUuRVJBLCBtYXhMZW5ndGg6IDUgfSxcclxuXHR5OiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXHJcblx0WTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxyXG5cdHU6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcclxuXHRVOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSLCBtYXhMZW5ndGg6IDUgfSxcclxuXHRyOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXHJcblx0UTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXHJcblx0cTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXHJcblx0TTogeyB0eXBlOiBUb2tlblR5cGUuTU9OVEgsIG1heExlbmd0aDogNSB9LFxyXG5cdEw6IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcclxuXHRsOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiAxIH0sXHJcblx0dzogeyB0eXBlOiBUb2tlblR5cGUuV0VFSywgbWF4TGVuZ3RoOiAyIH0sXHJcblx0VzogeyB0eXBlOiBUb2tlblR5cGUuV0VFSywgbWF4TGVuZ3RoOiAxIH0sXHJcblx0ZDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDIgfSxcclxuXHREOiB7IHR5cGU6IFRva2VuVHlwZS5EQVksIG1heExlbmd0aDogMyB9LFxyXG5cdEY6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAxIH0sXHJcblx0ZzogeyB0eXBlOiBUb2tlblR5cGUuREFZIH0sXHJcblx0RTogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXHJcblx0ZTogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXHJcblx0YzogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXHJcblx0YTogeyB0eXBlOiBUb2tlblR5cGUuREFZUEVSSU9ELCBtYXhMZW5ndGg6IDUgfSxcclxuXHRiOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxyXG5cdEI6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXHJcblx0aDogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcblx0SDogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcblx0azogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcblx0SzogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcblx0ajogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiA2IH0sXHJcblx0SjogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcblx0bTogeyB0eXBlOiBUb2tlblR5cGUuTUlOVVRFLCBtYXhMZW5ndGg6IDIgfSxcclxuXHRzOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQsIG1heExlbmd0aDogMiB9LFxyXG5cdFM6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCB9LFxyXG5cdEE6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCB9LFxyXG5cdHo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxyXG5cdFo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxyXG5cdE86IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIGxlbmd0aHM6IFsxLCA0XSB9LFxyXG5cdHY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIGxlbmd0aHM6IFsxLCA0XSB9LFxyXG5cdFY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxyXG5cdFg6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxyXG5cdHg6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxyXG59O1xyXG4iLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xyXG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50T3B0cywgVGltZVN0cnVjdCwgVGltZVVuaXQsIFdlZWtEYXkgfSBmcm9tIFwiLi9iYXNpY3NcIjtcclxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIFRvVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRWl0aGVyIGEgeWVhciBudW1iZXIgb3IgXCJvbmx5XCJcclxuXHQgKi9cclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIFwibWF4XCJcclxuXHQgKi9cclxuXHRNYXhcclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIE9uVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG5cdCAqL1xyXG5cdERheU51bSxcclxuXHQvKipcclxuXHQgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuXHQgKi9cclxuXHRMYXN0WCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPj04XCJcclxuXHQgKi9cclxuXHRHcmVxWCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPD04XCJcclxuXHQgKi9cclxuXHRMZXFYXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEF0VHlwZSB7XHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZSAobm8gRFNUKVxyXG5cdCAqL1xyXG5cdFN0YW5kYXJkLFxyXG5cdC8qKlxyXG5cdCAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuXHQgKi9cclxuXHRXYWxsLFxyXG5cdC8qKlxyXG5cdCAqIFV0YyB0aW1lXHJcblx0ICovXHJcblx0VXRjLFxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdWxlSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmcm9tOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9ZZWFyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHR5cGU6IHN0cmluZyxcclxuXHRcdC8qKlxyXG5cdFx0ICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE9OIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvblR5cGU6IE9uVHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uRGF5OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gaG91clxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRIb3VyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0TWludXRlOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBzZWNvbmRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFR5cGU6IEF0VHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBzYXZlOiBEdXJhdGlvbixcclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG5cdFx0ICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xyXG5cdFx0KSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuc2F2ZSkge1xyXG5cdFx0XHR0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChUaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVMZXNzKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSA8IG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcblx0ICovXHJcblx0cHVibGljIGVmZmVjdGl2ZUVxdWFsKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuXHQgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcblx0ICogbm90IHRha2VuIGludG8gYWNjb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVEYXRlKHllYXI6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG5cclxuXHRcdC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG5cdFx0Y29uc3QgdG06IFRpbWVDb21wb25lbnRPcHRzID0ge3llYXIsIG1vbnRoOiB0aGlzLmluTW9udGggfTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgZGF5XHJcblx0XHRzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xyXG5cdFx0XHRcdHRtLmRheSA9IHRoaXMub25EYXk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGltZVxyXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xyXG5cdFx0dG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuXHRcdHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRtKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRyYW5zaXRpb24gbW9tZW50IGluIFVUQyBpbiB0aGUgZ2l2ZW4geWVhclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGZvciB3aGljaCB0byByZXR1cm4gdGhlIHRyYW5zaXRpb25cclxuXHQgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFRoZSBzdGFuZGFyZCBvZmZzZXQgZm9yIHRoZSB0aW1lem9uZSB3aXRob3V0IERTVFxyXG5cdCAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdHJhbnNpdGlvblRpbWVVdGMoeWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24sIHByZXZSdWxlPzogUnVsZUluZm8pOiBudW1iZXIge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gdGhpcy5lZmZlY3RpdmVEYXRlKHllYXIpLnVuaXhNaWxsaXM7XHJcblxyXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uO1xyXG5cdFx0c3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XHJcblx0XHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxyXG5cdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxyXG5cdFx0XHRcdGlmIChwcmV2UnVsZSkge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbmV4cG9ydCBlbnVtIFJ1bGVUeXBlIHtcclxuXHQvKipcclxuXHQgKiBObyBydWxlIGFwcGxpZXNcclxuXHQgKi9cclxuXHROb25lLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG5cdCAqL1xyXG5cdE9mZnNldCxcclxuXHQvKipcclxuXHQgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuXHQgKi9cclxuXHRSdWxlTmFtZVxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIEdNVCBvZmZzZXQgaW4gZnJhY3Rpb25hbCBtaW51dGVzLCBQT1NJVElWRSB0byBVVEMgKG5vdGUgSmF2YVNjcmlwdC5EYXRlIGdpdmVzIG9mZnNldHNcclxuXHRcdCAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBnbXRvZmY6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcblx0XHQgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG5cdFx0ICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlVHlwZTogUnVsZVR5cGUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVPZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGEgcnVsZSBuYW1lLCB0aGlzIGlzIHRoZSBydWxlIG5hbWVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG5cdFx0ICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcblx0XHQgKiBhIHNpbmdsZSBhbHBoYWJldGljIHN0cmluZyBvdGhlciB0aGFuIOKAnHp6eizigJ0gaW4gd2hpY2ggY2FzZSB0aGF04oCZcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuXHRcdCAqIGEgc3RyaW5nIGNvbnRhaW5pbmcg4oCcJXMs4oCdIGluIHdoaWNoIGNhc2UgdGhlIOKAnCVz4oCdIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIHRleHQgaW4gdGhlIGFwcHJvcHJpYXRlIFJ1bGXigJlzIExFVFRFUiBjb2x1bW5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGZvcm1hdDogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG5cdFx0ICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgdW5kZWZpbmVkIChmb3IgdGhlIGZpcnN0IHJ1bGUpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB1bnRpbD86IG51bWJlclxyXG5cdCkge1xyXG5cdFx0aWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG5cdFx0XHR0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuZW51bSBUek1vbnRoTmFtZXMge1xyXG5cdEphbiA9IDEsXHJcblx0RmViID0gMixcclxuXHRNYXIgPSAzLFxyXG5cdEFwciA9IDQsXHJcblx0TWF5ID0gNSxcclxuXHRKdW4gPSA2LFxyXG5cdEp1bCA9IDcsXHJcblx0QXVnID0gOCxcclxuXHRTZXAgPSA5LFxyXG5cdE9jdCA9IDEwLFxyXG5cdE5vdiA9IDExLFxyXG5cdERlYyA9IDEyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XHJcblx0XHRpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGlmICh0cnVlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuXHR9XHJcbn1cclxuXHJcbmVudW0gVHpEYXlOYW1lcyB7XHJcblx0U3VuID0gMCxcclxuXHRNb24gPSAxLFxyXG5cdFR1ZSA9IDIsXHJcblx0V2VkID0gMyxcclxuXHRUaHUgPSA0LFxyXG5cdEZyaSA9IDUsXHJcblx0U2F0ID0gNlxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXQ6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHJcblx0XHQpIHtcclxuXHRcdGlmICh0aGlzLm9mZnNldCkge1xyXG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG5leHBvcnQgZW51bSBOb3JtYWxpemVPcHRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0VXAsXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdERvd25cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUekRhdGFiYXNlIHtcclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZT86IFR6RGF0YWJhc2U7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0YSBUWiBkYXRhIGFzIEpTT04gb2JqZWN0IChmcm9tIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzKS5cclxuXHQgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5pdChkYXRhPzogYW55IHwgYW55W10pOiB2b2lkIHtcclxuXHRcdGlmIChkYXRhKSB7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkOyAvLyBuZWVkZWQgZm9yIGFzc2VydCBpbiBjb25zdHJ1Y3RvclxyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IGRhdGE6IGFueVtdID0gW107XHJcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xyXG5cdFx0XHRsZXQgZzogYW55O1xyXG5cdFx0XHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRcdGcgPSB3aW5kb3c7XHJcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRcdGcgPSBnbG9iYWw7XHJcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0XHRnID0gc2VsZjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRnID0ge307XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGcpIHtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhnKSkge1xyXG5cdFx0XHRcdFx0aWYgKGtleS5zdGFydHNXaXRoKFwidHpkYXRhXCIpKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZ1trZXldID09PSBcIm9iamVjdFwiICYmIGdba2V5XS5ydWxlcyAmJiBnW2tleV0uem9uZXMpIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZ1trZXldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG5cdFx0XHRjb25zdCBmaW5kTm9kZU1vZHVsZXMgPSAocmVxdWlyZTogYW55KTogdm9pZCA9PiB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGZpcnN0IHRyeSB0emRhdGEgd2hpY2ggY29udGFpbnMgYWxsIGRhdGFcclxuXHRcdFx0XHRcdGNvbnN0IHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xyXG5cdFx0XHRcdFx0Y29uc3QgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG5cdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdC8vIHRoZW4gdHJ5IHN1YnNldHNcclxuXHRcdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWVzOiBzdHJpbmdbXSA9IFtcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYWZyaWNhXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLWFudGFyY3RpY2FcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZFwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1iYWNrd2FyZC11dGNcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXRjZXRlcmFcIixcclxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXVyb3BlXCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLW5vcnRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1wYWNpZmljbmV3XCIsXHJcblx0XHRcdFx0XHRcdFwidHpkYXRhLXNvdXRoYW1lcmljYVwiLFxyXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zeXN0ZW12XCJcclxuXHRcdFx0XHRcdF07XHJcblx0XHRcdFx0XHRtb2R1bGVOYW1lcy5mb3JFYWNoKChtb2R1bGVOYW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdFx0XHRmaW5kTm9kZU1vZHVsZXMocmVxdWlyZSk7IC8vIG5lZWQgdG8gcHV0IHJlcXVpcmUgaW50byBhIGZ1bmN0aW9uIHRvIG1ha2Ugd2VicGFjayBoYXBweVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGluc3RhbmNlKCk6IFR6RGF0YWJhc2Uge1xyXG5cdFx0aWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xyXG5cdFx0XHRUekRhdGFiYXNlLmluaXQoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZSBhcyBUekRhdGFiYXNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGRhdGFiYXNlIGRhdGFcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kYXRhOiBhbnk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCBtaW4vbWF4IERTVCB2YWx1ZXNcclxuXHQgKi9cclxuXHRwcml2YXRlIF9taW5tYXg6IE1pbk1heEluZm87XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCB6b25lIG5hbWVzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZU5hbWVzOiBzdHJpbmdbXTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuXHQgKi9cclxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGRhdGE6IGFueVtdKSB7XHJcblx0XHRhc3NlcnQoIVR6RGF0YWJhc2UuX2luc3RhbmNlLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcclxuXHRcdGFzc2VydChcclxuXHRcdFx0ZGF0YS5sZW5ndGggPiAwLFxyXG5cdFx0XHRcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCJcclxuXHRcdCk7XHJcblx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDEpIHtcclxuXHRcdFx0dGhpcy5fZGF0YSA9IGRhdGFbMF07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9kYXRhID0geyB6b25lczoge30sIHJ1bGVzOiB7fSB9O1xyXG5cdFx0XHRkYXRhLmZvckVhY2goKGQ6IGFueSk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdGlmIChkICYmIGQucnVsZXMgJiYgZC56b25lcykge1xyXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC5ydWxlcykpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC56b25lcykpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZGF0YS56b25lc1trZXldID0gZC56b25lc1trZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc29ydGVkIGxpc3Qgb2YgYWxsIHpvbmUgbmFtZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZU5hbWVzKCk6IHN0cmluZ1tdIHtcclxuXHRcdGlmICghdGhpcy5fem9uZU5hbWVzKSB7XHJcblx0XHRcdHRoaXMuX3pvbmVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuem9uZXMpO1xyXG5cdFx0XHR0aGlzLl96b25lTmFtZXMuc29ydCgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBleGlzdHMoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluRHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2Ygem9uZUluZm9zKSB7XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdGZvciAoY29uc3QgcnVsZUluZm8gb2YgdGVtcCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2Ygem9uZUluZm9zKSB7XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRjb25zdCB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiB0ZW1wKSB7XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgem9uZSBoYXMgRFNUIGF0IGFsbFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3Qoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpcnN0IERTVCBjaGFuZ2UgbW9tZW50IEFGVEVSIHRoZSBnaXZlbiBVVEMgZGF0ZSBpbiBVVEMgbWlsbGlzZWNvbmRzLCB3aXRoaW4gb25lIHllYXIsXHJcblx0ICogcmV0dXJucyB1bmRlZmluZWQgaWYgbm8gc3VjaCBjaGFuZ2VcclxuXHQgKi9cclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCk6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgem9uZSBpbmZvcyBmb3IgW2RhdGUsIGRhdGUrMXllYXIpXHJcblx0XHRjb25zdCBhbGxab25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRjb25zdCByZWxldmFudFpvbmVJbmZvczogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0Y29uc3QgcmFuZ2VTdGFydDogbnVtYmVyID0gdXRjVGltZS51bml4TWlsbGlzO1xyXG5cdFx0Y29uc3QgcmFuZ2VFbmQ6IG51bWJlciA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xyXG5cdFx0bGV0IHByZXZFbmQ6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2YgYWxsWm9uZUluZm9zKSB7XHJcblx0XHRcdGlmICgocHJldkVuZCA9PT0gdW5kZWZpbmVkIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xyXG5cdFx0XHRcdHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXHJcblx0XHRsZXQgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiByZWxldmFudFpvbmVJbmZvcykge1xyXG5cdFx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRcdHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KFxyXG5cdFx0XHRcdHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNUaW1lLmNvbXBvbmVudHMueWVhciAtIDEsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyICsgMSwgem9uZUluZm8uZ210b2ZmKVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0dHJhbnNpdGlvbnMuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxyXG5cdFx0bGV0IHByZXZTYXZlOiBEdXJhdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiB0cmFuc2l0aW9ucykge1xyXG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPiB1dGNUaW1lLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xyXG5cdCAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxyXG5cdCAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZUlzVXRjKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGxldCBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nL3N1YnRyYWN0aW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRBIGxvY2FsIHRpbWUsIGVpdGhlciBhcyBhIFRpbWVTdHJ1Y3Qgb3IgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5cdFRoZSBub3JtYWxpemVkIHRpbWUsIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgbG9jYWxUaW1lIHBhcmFtZXRlciAoVGltZVN0cnVjdCBvciB1bml4IG1pbGxpcylcclxuXHQgKi9cclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xyXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBhOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IFRpbWVTdHJ1Y3QgfCBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xyXG5cdFx0XHQvLyBsb2NhbCB0aW1lcyBiZWhhdmUgbGlrZSB0aGlzIGR1cmluZyBEU1QgY2hhbmdlczpcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDNcclxuXHJcblx0XHRcdC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcblx0XHRcdC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG5cclxuXHRcdFx0Ly8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXHJcblx0XHRcdFx0em9uZU5hbWUsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0Ly8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcclxuXHRcdFx0bGV0IHByZXY6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiB0cmFuc2l0aW9ucykge1xyXG5cdFx0XHRcdC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cclxuXHRcdFx0XHRpZiAodHJhbnNpdGlvbi5vZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQmVmb3JlOiBudW1iZXIgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGlmIChsb2NhbFRpbWUudW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiBsb2NhbFRpbWUudW5peE1pbGxpcyA8IGxvY2FsQWZ0ZXIpIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjdG9yOiBudW1iZXIgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBubyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IGEgOiBhLmNsb25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0KHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3Qgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcblx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbjtcclxuXHJcblx0XHRzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuT2Zmc2V0OiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IHRoaXMuZHN0T2Zmc2V0Rm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0ZGVmYXVsdDogLy8gY2Fubm90IGhhcHBlbiwgYnV0IHRoZSBjb21waWxlciBkb2VzbnQgcmVhbGl6ZSBpdFxyXG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG5cdCAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMgdW5peCBtaWxsaXNlY29uZHNcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhYmJyZXZpYXRpb24oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcclxuXHRcdGNvbnN0IGZvcm1hdDogc3RyaW5nID0gem9uZUluZm8uZm9ybWF0O1xyXG5cclxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG5cdFx0aWYgKGZvcm1hdC5pbmRleE9mKFwiJXNcIikgIT09IC0xXHJcblx0XHRcdCYmIHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmc7XHJcblx0XHRcdC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuXHRcdFx0aWYgKGRzdERlcGVuZGVudCkge1xyXG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZvcm1hdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGV4Y2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuXHQgKlxyXG5cdCAqIElmIHRoZSBsb2NhbCB0aW1lc3RhbXAgZXhpc3RzIHR3aWNlIChhcyBjYW4gb2NjdXIgdmVyeSByYXJlbHkgZHVlIHRvIHpvbmUgY2hhbmdlcylcclxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG5cdCAqXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBsb2NhbFRpbWUgOiBsb2NhbFRpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xyXG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCArIHpvbmVJbmZvLmdtdG9mZi5taWxsaXNlY29uZHMoKSA+IHVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXHJcblx0ICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxyXG5cdCAqIG5hbWVseSBkdXJpbmcgYSBiYWNrd2FyZCBEU1QgY2hhbmdlLiBUaGlzIHJldHVybnMgdGhlIEZJUlNUIHN1Y2ggb2Zmc2V0LlxyXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHRvdGFsT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xyXG5cdFx0Y29uc3Qgbm9ybWFsaXplZFRtOiBUaW1lU3RydWN0ID0gdGhpcy5ub3JtYWxpemVMb2NhbCh6b25lTmFtZSwgdHMpO1xyXG5cclxuXHRcdC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxyXG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcclxuXHJcblx0XHQvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXHJcblx0XHQvLyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBvZmZzZXQgdGhhdCBtYXRjaGVzXHJcblxyXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXHJcblx0XHRcdHpvbmVOYW1lLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyIC0gMSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciArIDFcclxuXHRcdCk7XHJcblx0XHRsZXQgcHJldjogVHJhbnNpdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCBwcmV2UHJldjogVHJhbnNpdGlvbiB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiB0cmFuc2l0aW9ucykge1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHQvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2UHJldiA9IHByZXY7XHJcblx0XHRcdHByZXYgPSB0cmFuc2l0aW9uO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcblx0XHRpZiAocHJldikge1xyXG5cdFx0XHQvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcclxuXHRcdFx0aWYgKHByZXZQcmV2ICYmIHByZXZQcmV2Lm9mZnNldC5ncmVhdGVyVGhhbihwcmV2Lm9mZnNldCkpIHtcclxuXHRcdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2VcclxuXHRcdFx0XHRjb25zdCBkaWZmID0gcHJldlByZXYub2Zmc2V0LnN1YihwcmV2Lm9mZnNldCk7XHJcblx0XHRcdFx0aWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG5cdFx0XHRcdFx0JiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgKyBkaWZmLm1pbGxpc2Vjb25kcygpKSB7XHJcblx0XHRcdFx0XHQvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXHJcblx0XHRcdFx0XHRyZXR1cm4gcHJldlByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdGhpcyBjYW5ub3QgaGFwcGVuIGFzIHRoZSB0cmFuc2l0aW9ucyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYSB0cmFuc2l0aW9uIGF0IHRoZVxyXG5cdFx0XHQvLyBiZWdpbm5pbmcgb2YgdGhlIHJlcXVlc3RlZCBmcm9tWWVhclxyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBEU1Qgb2Zmc2V0IChXSVRIT1VUIHRoZSBzdGFuZGFyZCB6b25lIG9mZnNldCkgZm9yIHRoZSBnaXZlblxyXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdG5hbWUgb2YgcnVsZXNldFxyXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgZHN0T2Zmc2V0Rm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XHJcblx0XHRjb25zdCB0czogVGltZVN0cnVjdCA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XHJcblxyXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxyXG5cdFx0XHRydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldFxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xyXG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdGNvbnN0IHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG5cdFx0XHRcdG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xyXG5cdFx0XHRvZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvZmZzZXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0aW1lIHpvbmUgbGV0dGVyIGZvciB0aGUgZ2l2ZW5cclxuXHQgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgbGV0dGVyRm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBzdHJpbmcge1xyXG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxyXG5cdFx0XHRydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldFxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuXHRcdGxldCBsZXR0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCFsZXR0ZXIpIHtcclxuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXHJcblx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGxldHRlcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIGxpc3Qgb2YgYWxsIHRyYW5zaXRpb25zIGluIFtmcm9tWWVhci4udG9ZZWFyXSBzb3J0ZWQgYnkgZWZmZWN0aXZlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiB0aGUgcnVsZSBzZXRcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBUcmFuc2l0aW9uW10ge1xyXG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuXHJcblx0XHRjb25zdCBydWxlSW5mb3M6IFJ1bGVJbmZvW10gPSB0aGlzLmdldFJ1bGVJbmZvcyhydWxlTmFtZSk7XHJcblx0XHRjb25zdCByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cclxuXHRcdGZvciAobGV0IHkgPSBmcm9tWWVhcjsgeSA8PSB0b1llYXI7IHkrKykge1xyXG5cdFx0XHRsZXQgcHJldkluZm86IFJ1bGVJbmZvIHwgdW5kZWZpbmVkO1xyXG5cdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHJ1bGVJbmZvcykge1xyXG5cdFx0XHRcdGlmIChydWxlSW5mby5hcHBsaWNhYmxlKHkpKSB7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMoeSwgc3RhbmRhcmRPZmZzZXQsIHByZXZJbmZvKSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8uc2F2ZSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8ubGV0dGVyKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHByZXZJbmZvID0gcnVsZUluZm87XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxyXG5cdCAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vIHpvbmUgY2hhbmdlIHdpdGhpbiB0aGUgcmFuZ2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlcik6IFRyYW5zaXRpb25bXSB7XHJcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG5cclxuXHRcdGNvbnN0IHN0YXJ0TWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiBmcm9tWWVhciB9KTtcclxuXHRcdGNvbnN0IGVuZE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcclxuXHJcblxyXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0YXNzZXJ0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XHJcblxyXG5cdFx0bGV0IHByZXZab25lOiBab25lSW5mbyB8IHVuZGVmaW5lZDtcclxuXHRcdGxldCBwcmV2VW50aWxZZWFyOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcblx0XHRsZXQgcHJldlN0ZE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdGxldCBwcmV2RHN0T2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0bGV0IHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xyXG5cdFx0XHRjb25zdCB1bnRpbFllYXI6IG51bWJlciA9IHpvbmVJbmZvLnVudGlsICE9PSB1bmRlZmluZWQgPyBuZXcgVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkuY29tcG9uZW50cy55ZWFyIDogdG9ZZWFyICsgMTtcclxuXHRcdFx0bGV0IHN0ZE9mZnNldDogRHVyYXRpb24gPSBwcmV2U3RkT2Zmc2V0O1xyXG5cdFx0XHRsZXQgZHN0T2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZEc3RPZmZzZXQ7XHJcblx0XHRcdGxldCBsZXR0ZXI6IHN0cmluZyA9IHByZXZMZXR0ZXI7XHJcblxyXG5cdFx0XHQvLyB6b25lIGFwcGxpY2FibGU/XHJcblx0XHRcdGlmICgoIXByZXZab25lIHx8IHByZXZab25lLnVudGlsISA8IGVuZE1pbGxpcyAtIDEpICYmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID49IHN0YXJ0TWlsbGlzKSkge1xyXG5cclxuXHRcdFx0XHRzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcblxyXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdFx0XHQvLyAoZS5nLiBMeWJpYSlcclxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgcnVsZUluZm8gb2YgcnVsZUluZm9zKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHByZXZVbnRpbFllYXIgPT09IFwibnVtYmVyXCIgJiYgcnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxZZWFyKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMocHJldlVudGlsWWVhciwgc3RkT2Zmc2V0LCB1bmRlZmluZWQpID09PSBwcmV2Wm9uZS51bnRpbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdGNvbnN0IGF0OiBudW1iZXIgPSAocHJldlpvbmUgJiYgcHJldlpvbmUudW50aWwgIT09IHVuZGVmaW5lZCA/IHByZXZab25lLnVudGlsIDogc3RhcnRNaWxsaXMpO1xyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xyXG5cclxuXHRcdFx0XHQvLyBhZGQgdHJhbnNpdGlvbnMgZm9yIHRoZSB6b25lIHJ1bGVzIGluIHRoZSByYW5nZVxyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGRzdFRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0XHRcdFx0em9uZUluZm8ucnVsZU5hbWUsXHJcblx0XHRcdFx0XHRcdHByZXZVbnRpbFllYXIgIT09IHVuZGVmaW5lZCA/IE1hdGgubWF4KHByZXZVbnRpbFllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLFxyXG5cdFx0XHRcdFx0XHRNYXRoLm1pbih1bnRpbFllYXIsIHRvWWVhciksXHJcblx0XHRcdFx0XHRcdHN0ZE9mZnNldFxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiBkc3RUcmFuc2l0aW9ucykge1xyXG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKHRyYW5zaXRpb24uYXQsIHRyYW5zaXRpb24ub2Zmc2V0LmFkZChzdGRPZmZzZXQpLCB0cmFuc2l0aW9uLmxldHRlcikpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldlpvbmUgPSB6b25lSW5mbztcclxuXHRcdFx0cHJldlVudGlsWWVhciA9IHVudGlsWWVhcjtcclxuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuXHRcdFx0cHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuXHRcdFx0cHJldkxldHRlciA9IGxldHRlcjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWUgc3RhbXAgYXMgdW5peCBtaWxsaXNlY29uZHMgb3IgYXMgYSBUaW1lU3RydWN0XHJcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBab25lSW5mbyB7XHJcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xyXG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcclxuXHRcdFx0XHRyZXR1cm4gem9uZUluZm87XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lSW5mb0NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogWm9uZUluZm9bXSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGUgem9uZSByZWNvcmRzIGZvciBhIGdpdmVuIHpvbmUgbmFtZSwgYWZ0ZXJcclxuXHQgKiBmb2xsb3dpbmcgYW55IGxpbmtzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZSBsaWtlIFwiUGFjaWZpYy9FZmF0ZVwiXHJcblx0ICogQHJldHVybiBBcnJheSBvZiB6b25lIGluZm9zLiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRab25lSW5mb3Moem9uZU5hbWU6IHN0cmluZyk6IFpvbmVJbmZvW10ge1xyXG5cdFx0Ly8gRklSU1QgdmFsaWRhdGUgem9uZSBuYW1lIGJlZm9yZSBzZWFyY2hpbmcgY2FjaGVcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBUYWtlIGZyb20gY2FjaGVcclxuXHRcdGlmICh0aGlzLl96b25lSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV07XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0OiBab25lSW5mb1tdID0gW107XHJcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xyXG5cdFx0bGV0IHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuXHRcdC8vIGZvbGxvdyBsaW5rc1xyXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcblx0XHR9XHJcblx0XHQvLyBmaW5hbCB6b25lIGluZm8gZm91bmRcclxuXHRcdGZvciAoY29uc3Qgem9uZUVudHJ5IG9mIHpvbmVFbnRyaWVzKSB7XHJcblx0XHRcdGNvbnN0IHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xyXG5cdFx0XHRsZXQgdW50aWw6IG51bWJlciB8IHVuZGVmaW5lZCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuXHRcdFx0aWYgKGlzTmFOKHVudGlsKSkge1xyXG5cdFx0XHRcdHVudGlsID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgWm9uZUluZm8oXHJcblx0XHRcdFx0RHVyYXRpb24ubWludXRlcygtMSAqIG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzBdKSksXHJcblx0XHRcdFx0cnVsZVR5cGUsXHJcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBEdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IER1cmF0aW9uKCksXHJcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lID8gem9uZUVudHJ5WzFdIDogXCJcIixcclxuXHRcdFx0XHR6b25lRW50cnlbMl0sXHJcblx0XHRcdFx0dW50aWxcclxuXHRcdFx0KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzdWx0LnNvcnQoKGE6IFpvbmVJbmZvLCBiOiBab25lSW5mbyk6IG51bWJlciA9PiB7XHJcblx0XHRcdC8vIHNvcnQgdW5kZWZpbmVkIGxhc3RcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgIT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gKGEudW50aWwhIC0gYi51bnRpbCEpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3J1bGVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBSdWxlSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgcnVsZSBzZXQgd2l0aCB0aGUgZ2l2ZW4gcnVsZSBuYW1lLFxyXG5cdCAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHJ1bGUgc2V0XHJcblx0ICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0UnVsZUluZm9zKHJ1bGVOYW1lOiBzdHJpbmcpOiBSdWxlSW5mb1tdIHtcclxuXHRcdC8vIHZhbGlkYXRlIG5hbWUgQkVGT1JFIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0aWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJldHVybiBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHJlc3VsdDogUnVsZUluZm9bXSA9IFtdO1xyXG5cdFx0Y29uc3QgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG5cdFx0Zm9yIChjb25zdCBydWxlIG9mIHJ1bGVTZXQpIHtcclxuXHJcblx0XHRcdGNvbnN0IGZyb21ZZWFyOiBudW1iZXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XHJcblx0XHRcdGNvbnN0IHRvVHlwZTogVG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuXHRcdFx0Y29uc3QgdG9ZZWFyOiBudW1iZXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcblx0XHRcdGNvbnN0IG9uVHlwZTogT25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcclxuXHRcdFx0Y29uc3Qgb25EYXk6IG51bWJlciA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG5cdFx0XHRjb25zdCBvbldlZWtEYXk6IFdlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xyXG5cdFx0XHRjb25zdCBtb250aE5hbWU6IHN0cmluZyA9IHJ1bGVbM10gYXMgc3RyaW5nO1xyXG5cdFx0XHRjb25zdCBtb250aE51bWJlcjogbnVtYmVyID0gbW9udGhOYW1lVG9TdHJpbmcobW9udGhOYW1lKTtcclxuXHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhcclxuXHRcdFx0XHRmcm9tWWVhcixcclxuXHRcdFx0XHR0b1R5cGUsXHJcblx0XHRcdFx0dG9ZZWFyLFxyXG5cdFx0XHRcdHJ1bGVbMl0sXHJcblx0XHRcdFx0bW9udGhOdW1iZXIsXHJcblx0XHRcdFx0b25UeXBlLFxyXG5cdFx0XHRcdG9uRGF5LFxyXG5cdFx0XHRcdG9uV2Vla0RheSxcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLFxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksXHJcblx0XHRcdFx0dGhpcy5wYXJzZUF0VHlwZShydWxlWzVdWzNdKSxcclxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksXHJcblx0XHRcdFx0cnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XVxyXG5cdFx0XHRcdCkpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogUnVsZUluZm8sIGI6IFJ1bGVJbmZvKTogbnVtYmVyID0+IHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH0gZWxzZSBpZiAoYS5lZmZlY3RpdmVMZXNzKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlUnVsZVR5cGUocnVsZTogc3RyaW5nKTogUnVsZVR5cGUge1xyXG5cdFx0aWYgKHJ1bGUgPT09IFwiLVwiKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5Ob25lO1xyXG5cdFx0fSBlbHNlIGlmIChpc1ZhbGlkT2Zmc2V0U3RyaW5nKHJ1bGUpKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5PZmZzZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlVG9UeXBlKHRvOiBzdHJpbmcpOiBUb1R5cGUge1xyXG5cdFx0aWYgKHRvID09PSBcIm1heFwiKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuTWF4O1xyXG5cdFx0fSBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcclxuXHRcdH0gZWxzZSBpZiAoIWlzTmFOKHBhcnNlSW50KHRvLCAxMCkpKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6IFwiICsgdG8pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgT04gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25UeXBlKG9uOiBzdHJpbmcpOiBPblR5cGUge1xyXG5cdFx0aWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkxhc3RYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5MZXFYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI+PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5HcmVxWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25EYXkob246IHN0cmluZywgb25UeXBlOiBPblR5cGUpOiBudW1iZXIge1xyXG5cdFx0c3dpdGNoIChvblR5cGUpIHtcclxuXHRcdFx0Y2FzZSBPblR5cGUuRGF5TnVtOiByZXR1cm4gcGFyc2VJbnQob24sIDEwKTtcclxuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPj1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25XZWVrRGF5KG9uOiBzdHJpbmcpOiBXZWVrRGF5IHtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcblx0XHRcdGlmIChvbi5pbmRleE9mKFR6RGF5TmFtZXNbaV0pICE9PSAtMSkge1xyXG5cdFx0XHRcdHJldHVybiBpIGFzIFdlZWtEYXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHJldHVybiBXZWVrRGF5LlN1bmRheTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VBdFR5cGUoYXQ6IGFueSk6IEF0VHlwZSB7XHJcblx0XHRzd2l0Y2ggKGF0KSB7XHJcblx0XHRcdGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcblx0XHRcdGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0Y2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuaW50ZXJmYWNlIE1pbk1heEluZm8ge1xyXG5cdG1pbkRzdFNhdmU6IG51bWJlcjtcclxuXHRtYXhEc3RTYXZlOiBudW1iZXI7XHJcblx0bWluR210T2ZmOiBudW1iZXI7XHJcblx0bWF4R210T2ZmOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRGF0YShkYXRhOiBhbnkpOiBNaW5NYXhJbmZvIHtcclxuXHRjb25zdCByZXN1bHQ6IFBhcnRpYWw8TWluTWF4SW5mbz4gPSB7fTtcclxuXHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBpcyBub3QgYW4gb2JqZWN0XCIpO1xyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gcnVsZXMgcHJvcGVydHlcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyB6b25lcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblxyXG5cdC8vIHZhbGlkYXRlIHpvbmVzXHJcblx0Zm9yIChjb25zdCB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XHJcblx0XHRpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0Y29uc3Qgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHRcdGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0Ly8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lQXJyIGFzIHN0cmluZykpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGxpbmtzIHRvIFxcXCJcIiArIHpvbmVBcnIgYXMgc3RyaW5nICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBlbnRyeTogYW55ID0gem9uZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjb25zdCBnbXRvZmYgPSBtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzBdKTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGlzTmFOKGdtdG9mZikpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gdW5kZWZpbmVkIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluR210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgcnVsZXNcclxuXHRmb3IgKGNvbnN0IHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcclxuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHRjb25zdCBydWxlQXJyOiBhbnkgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBydWxlID0gcnVsZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IG9mIGxlbmd0aCA4XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbMF0gIT09IFwiTmFOXCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVswXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMV0gaXMgbm90IGEgbnVtYmVyLCBvbmx5IG9yIG1heFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFUek1vbnRoTmFtZXMuaGFzT3duUHJvcGVydHkocnVsZVszXSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bM10gaXMgbm90IGEgbW9udGggbmFtZVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNF0uc3Vic3RyKDAsIDQpICE9PSBcImxhc3RcIiAmJiBydWxlWzRdLmluZGV4T2YoXCI+PVwiKSA9PT0gLTFcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpXHJcblx0XHRcdFx0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzRdIGlzIG5vdCBhIGtub3duIHR5cGUgb2YgZXhwcmVzc2lvblwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVbNV0pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnN0IHNhdmU6IG51bWJlciA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4oc2F2ZSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNl0gZG9lcyBub3QgY29udGFpbiBhIHZhbGlkIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNhdmUgIT09IDApIHtcclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlIDwgcmVzdWx0Lm1pbkRzdFNhdmUpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdCBhcyBNaW5NYXhJbmZvO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vYmFzaWNzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2RhdGV0aW1lXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2R1cmF0aW9uXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2Zvcm1hdFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9nbG9iYWxzXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL2phdmFzY3JpcHRcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vbG9jYWxlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3BlcmlvZFwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90aW1lem9uZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi90ei1kYXRhYmFzZVwiO1xyXG4iXX0=
