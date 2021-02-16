(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright(c) 2016 ABB Switzerland Ltd.
 */
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./error");
/**
 * Throws an Assertion error if the given condition is falsy
 * @param condition
 * @param name error name
 * @param format error message with percent-style placeholders
 * @param args arguments for error message format string
 * @throws [name] if `condition` is falsy
 */
function assert(condition, name, format) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    if (!condition) {
        error_1.throwError.apply(void 0, __spreadArrays([name, format], args));
    }
}
exports.default = assert;

},{"./error":5}],2:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Olsen Timezone Database container
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binaryInsertionIndex = exports.TimeStruct = exports.secondOfDay = exports.weekDayNoLeapSecs = exports.timeToUnixNoLeapSecs = exports.unixToTimeNoLeapSecs = exports.weekNumber = exports.weekOfMonth = exports.weekDayOnOrBefore = exports.weekDayOnOrAfter = exports.firstWeekDayOfMonth = exports.lastWeekDayOfMonth = exports.dayOfYear = exports.daysInMonth = exports.daysInYear = exports.isLeapYear = exports.stringToTimeUnit = exports.timeUnitToString = exports.timeUnitToMilliseconds = exports.TimeUnit = exports.WeekDay = void 0;
var assert_1 = require("./assert");
var error_1 = require("./error");
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
 * @throws timezonecomplete.Argument.Unit for invalid unit
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
        default:
            return error_1.throwError("Argument.Unit", "unknown time unit %d", unit);
    }
}
exports.timeUnitToMilliseconds = timeUnitToMilliseconds;
/**
 * Time unit to lowercase string. If amount is specified, then the string is put in plural form
 * if necessary.
 * @param unit The unit
 * @param amount If this is unequal to -1 and 1, then the result is pluralized
 * @throws timezonecomplete.Argument.Unit for invalid time unit
 */
function timeUnitToString(unit, amount) {
    if (amount === void 0) { amount = 1; }
    if (!Number.isInteger(unit) || unit < 0 || unit >= TimeUnit.MAX) {
        return error_1.throwError("Argument.Unit", "invalid time unit %d", unit);
    }
    var result = TimeUnit[unit].toLowerCase();
    if (amount === 1 || amount === -1) {
        return result;
    }
    else {
        return result + "s";
    }
}
exports.timeUnitToString = timeUnitToString;
/**
 * Convert a string to a numeric TimeUnit. Case-insensitive; time units can be singular or plural.
 * @param s
 * @throws timezonecomplete.Argument.S for invalid string
 */
function stringToTimeUnit(s) {
    var trimmed = s.trim().toLowerCase();
    for (var i = 0; i < TimeUnit.MAX; ++i) {
        var other = timeUnitToString(i, 1);
        if (other === trimmed || (other + "s") === trimmed) {
            return i;
        }
    }
    return error_1.throwError("Argument.S", "Unknown time unit string '%s'", s);
}
exports.stringToTimeUnit = stringToTimeUnit;
/**
 * @return True iff the given year is a leap year.
 * @throws timezonecomplete.Argument.Year if year is not integer
 */
function isLeapYear(year) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Invalid year %d", year);
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
 * @throws timezonecomplete.Argument.Year if year is not integer
 */
function daysInYear(year) {
    // rely on validation by isLeapYear
    return (isLeapYear(year) ? 366 : 365);
}
exports.daysInYear = daysInYear;
/**
 * @param year	The full year
 * @param month	The month 1-12
 * @return The number of days in the given month
 * @throws timezonecomplete.Argument.Year if year is not integer
 * @throws timezonecomplete.Argument.Month for invalid month number
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
            return error_1.throwError("Argument.Month", "Invalid month: %d", month);
    }
}
exports.daysInMonth = daysInMonth;
/**
 * Returns the day of the year of the given date [0..365]. January first is 0.
 *
 * @param year	The year e.g. 1986
 * @param month Month 1-12
 * @param day Day of month 1-31
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
function dayOfYear(year, month, day) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    assert_1.default(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    assert_1.default(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
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
 * @param weekDay	the desired week day 0-6
 * @return the last occurrence of the week day in the month
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 */
function lastWeekDayOfMonth(year, month, weekDay) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    assert_1.default(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    assert_1.default(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
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
 * @return the first occurrence of the week day in the month
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 */
function firstWeekDayOfMonth(year, month, weekDay) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    assert_1.default(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    assert_1.default(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
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
 * Returns the day-of-month that is on the given weekday and which is >= the given day; throws if not found
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 * @throws timezonecomplete.NotFound if the month has no such day
 */
function weekDayOnOrAfter(year, month, day, weekDay) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    assert_1.default(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    assert_1.default(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
    assert_1.default(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    assert_1.default(start.components.day + diff <= daysInMonth(year, month), "NotFound", "The given month has no such weekday");
    return start.components.day + diff;
}
exports.weekDayOnOrAfter = weekDayOnOrAfter;
/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 * @throws timezonecomplete.NotFound if the month has no such day
 */
function weekDayOnOrBefore(year, month, day, weekDay) {
    assert_1.default(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    assert_1.default(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    assert_1.default(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
    assert_1.default(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    assert_1.default(start.components.day + diff >= 1, "NotFound", "The given month has no such weekday");
    return start.components.day + diff;
}
exports.weekDayOnOrBefore = weekDayOnOrBefore;
/**
 * The week of this month. There is no official standard for this, but we assume the same rules for the weekNumber:
 * week 1 is the week that has the 4th day of the month in it
 *
 * @param year The year
 * @param month The month [1-12]
 * @param day The day [1-31]
 * @return Week number [1-5]
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
function weekOfMonth(year, month, day) {
    // rely on year/month validation in firstWeekDayOfMonth
    assert_1.default(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
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
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 */
function getWeekOneDayOfYear(year) {
    // relay on weekDayOnOrAfter for year validation
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
 * @return Week number 1-53
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
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
/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 * @throws timezonecomplete.Argument.UnixMillis for non-integer `unixMillis` parameter
 */
function unixToTimeNoLeapSecs(unixMillis) {
    assert_1.default(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");
    var temp = unixMillis;
    var result = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, milli: 0 };
    var year;
    var month;
    if (unixMillis >= 0) {
        result.milli = math.positiveModulo(temp, 1000);
        temp = Math.floor(temp / 1000);
        result.second = math.positiveModulo(temp, 60);
        temp = Math.floor(temp / 60);
        result.minute = math.positiveModulo(temp, 60);
        temp = Math.floor(temp / 60);
        result.hour = math.positiveModulo(temp, 24);
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
 * @throws timezonecomplete.Argument.Year for invalid year
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.Hour for invalid hour
 * @throws timezonecomplete.Argument.Minute for invalid minute
 * @throws timezonecomplete.Argument.Second for invalid second
 * @throws timezonecomplete.Argument.Milli for invalid milliseconds
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
    assert_1.default(Number.isInteger(input.year), "Argument.Year", "invalid year %d", input.year);
    assert_1.default(Number.isInteger(input.month) && input.month >= 1 && input.month <= 12, "Argument.Month", "invalid month %d", input.month);
    assert_1.default(Number.isInteger(input.day) && input.day >= 1 && input.day <= daysInMonth(input.year, input.month), "Argument.Day", "invalid day %d", input.day);
    assert_1.default(Number.isInteger(input.hour) && input.hour >= 0 && input.hour <= 23, "Argument.Hour", "invalid hour %d", input.hour);
    assert_1.default(Number.isInteger(input.minute) && input.minute >= 0 && input.minute <= 59, "Argument.Minute", "invalid minute %d", input.minute);
    assert_1.default(Number.isInteger(input.second) && input.second >= 0 && input.second <= 59, "Argument.Second", "invalid second %d", input.second);
    assert_1.default(Number.isInteger(input.milli) && input.milli >= 0 && input.milli <= 999, "Argument.Milli", "invalid milli %d", input.milli);
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
 * @throws timezonecomplete.Argument.UnixMillis for invalid `unixMillis` argument
 */
function weekDayNoLeapSecs(unixMillis) {
    assert_1.default(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");
    var epochDay = WeekDay.Thursday;
    var days = Math.floor(unixMillis / 1000 / 86400);
    return math.positiveModulo(epochDay + days, 7);
}
exports.weekDayNoLeapSecs = weekDayNoLeapSecs;
/**
 * N-th second in the day, counting from 0
 * @throws timezonecomplete.Argument.Hour for invalid hour
 * @throws timezonecomplete.Argument.Minute for invalid minute
 * @throws timezonecomplete.Argument.Second for invalid second
 */
function secondOfDay(hour, minute, second) {
    assert_1.default(Number.isInteger(hour) && hour >= 0 && hour <= 23, "Argument.Hour", "invalid hour %d", hour);
    assert_1.default(Number.isInteger(minute) && minute >= 0 && minute <= 59, "Argument.Minute", "invalid minute %d", minute);
    assert_1.default(Number.isInteger(second) && second >= 0 && second <= 61, "Argument.Second", "invalid second %d", second);
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
            assert_1.default(Number.isInteger(a), "Argument.UnixMillis", "invalid unix millis %d", a);
            this._unixMillis = a;
        }
        else {
            assert_1.default(typeof a === "object" && a !== null, "Argument.Components", "invalid components object");
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
     * @throws timezonecomplete.Argument.Year for invalid year
     * @throws timezonecomplete.Argument.Month for invalid month
     * @throws timezonecomplete.Argument.Day for invalid day of month
     * @throws timezonecomplete.Argument.Hour for invalid hour
     * @throws timezonecomplete.Argument.Minute for invalid minute
     * @throws timezonecomplete.Argument.Second for invalid second
     * @throws timezonecomplete.Argument.Milli for invalid milliseconds
     */
    TimeStruct.fromComponents = function (year, month, day, hour, minute, second, milli) {
        return new TimeStruct({ year: year, month: month, day: day, hour: hour, minute: minute, second: second, milli: milli });
    };
    /**
     * Create a TimeStruct from a number of unix milliseconds
     * (backward compatibility)
     * @throws timezonecomplete.Argument.UnixMillis for non-integer milliseconds
     */
    TimeStruct.fromUnix = function (unixMillis) {
        return new TimeStruct(unixMillis);
    };
    /**
     * Create a TimeStruct from a JavaScript date
     *
     * @param d	The date
     * @param df Which functions to take (getX() or getUTCX())
     * @throws nothing
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
     * @throws timezonecomplete.Argument.S if `s` is not a proper iso string
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
            assert_1.default(split.length >= 1 && split.length <= 2, "Argument.S", "Empty string or multiple dots.");
            // parse main part
            var isBasicFormat = (s.indexOf("-") === -1);
            if (isBasicFormat) {
                assert_1.default(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "Argument.S", "ISO string in basic notation may only contain numbers before the fractional part");
                // remove any "T" separator
                split[0] = split[0].replace("T", "");
                assert_1.default([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Argument.S", "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
                assert_1.default(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Argument.S", "Invalid ISO string");
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
                assert_1.default([4, 10].indexOf(dateAndTime[0].length) !== -1, "Argument.S", "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
            if (error_1.errorIs(e, [
                "Argument.S", "Argument.Year", "Argument.Month", "Argument.Day", "Argument.Hour",
                "Argument.Minute", "Argument.Second", "Argument.Milli"
            ])) {
                return error_1.throwError("Argument.S", "Invalid ISO 8601 string: \"%s\": %s", s, e.message);
            }
            else {
                throw e; // programming error
            }
        }
    };
    Object.defineProperty(TimeStruct.prototype, "unixMillis", {
        get: function () {
            if (this._unixMillis === undefined) {
                this._unixMillis = timeToUnixNoLeapSecs(this._components);
            }
            return this._unixMillis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "components", {
        get: function () {
            if (!this._components) {
                this._components = unixToTimeNoLeapSecs(this._unixMillis);
            }
            return this._components;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "year", {
        get: function () {
            return this.components.year;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "month", {
        get: function () {
            return this.components.month;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "day", {
        get: function () {
            return this.components.day;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "hour", {
        get: function () {
            return this.components.hour;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "minute", {
        get: function () {
            return this.components.minute;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "second", {
        get: function () {
            return this.components.second;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeStruct.prototype, "milli", {
        get: function () {
            return this.components.milli;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The day-of-year 0-365
     * @throws nothing
     */
    TimeStruct.prototype.yearDay = function () {
        return dayOfYear(this.components.year, this.components.month, this.components.day);
    };
    /**
     * Equality function
     * @param other
     * @throws TypeError if other is not an Object
     */
    TimeStruct.prototype.equals = function (other) {
        return this.valueOf() === other.valueOf();
    };
    /**
     * @throws nothing
     */
    TimeStruct.prototype.valueOf = function () {
        return this.unixMillis;
    };
    /**
     * @throws nothing
     */
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
     * @throws nothing
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
     * @throws nothing
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
 * @returns The insertion index of the element to look for
 * @throws TypeError if arr is not an array
 * @throws whatever `compare()` throws
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

},{"./assert":1,"./error":5,"./javascript":8,"./math":10,"./strings":13}],3:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Date+time+timezone representation
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateTime = exports.DateTime = exports.now = exports.nowUtc = exports.nowLocal = void 0;
var assert_1 = require("./assert");
var basics = require("./basics");
var basics_1 = require("./basics");
var duration_1 = require("./duration");
var error_1 = require("./error");
var format = require("./format");
var javascript_1 = require("./javascript");
var math = require("./math");
var parseFuncs = require("./parse");
var timesource_1 = require("./timesource");
var timezone_1 = require("./timezone");
var tz_database_1 = require("./tz-database");
/**
 * Current date+time in local time
 * @throws nothing
 */
function nowLocal() {
    return DateTime.nowLocal();
}
exports.nowLocal = nowLocal;
/**
 * Current date+time in UTC time
 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
 */
function nowUtc() {
    return DateTime.nowUtc();
}
exports.nowUtc = nowUtc;
/**
 * Current date+time in the given time zone
 * @param timeZone	The desired time zone (optional, defaults to UTC).
 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
 */
function now(timeZone) {
    if (timeZone === void 0) { timeZone = timezone_1.TimeZone.utc(); }
    return DateTime.now(timeZone);
}
exports.now = now;
/**
 *
 * @param localTime
 * @param fromZone
 * @throws nothing
 */
function convertToUtc(localTime, fromZone) {
    if (fromZone) {
        var offset = fromZone.offsetForZone(localTime);
        return new basics_1.TimeStruct(localTime.unixMillis - offset * 60000);
    }
    else {
        return localTime.clone();
    }
}
/**
 *
 * @param utcTime
 * @param toZone
 * @throws nothing
 */
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
     * Constructor implementation, @see overrides
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
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "for unix timestamp datetime constructor, third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object.");
                        // unix timestamp constructor
                        this._zone = (typeof (a2) === "object" && isTimeZone(a2) ? a2 : undefined);
                        var unixMillis = error_1.convertError("Argument.UnixMillis", function () { return math.roundSym(a1); });
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(new basics_1.TimeStruct(unixMillis));
                        }
                        else {
                            this._zoneDate = new basics_1.TimeStruct(unixMillis);
                        }
                    }
                    else {
                        // year month day constructor
                        assert_1.default(typeof (a2) === "number", "Argument.Year", "DateTime.DateTime(): Expect month to be a number.");
                        assert_1.default(typeof (a3) === "number", "Argument.Month", "DateTime.DateTime(): Expect day to be a number.");
                        assert_1.default(timeZone === undefined || timeZone === null || isTimeZone(timeZone), "Argument.TimeZone", "DateTime.DateTime(): eighth arg should be a TimeZone object.");
                        var year_1 = a1;
                        var month_1 = a2;
                        var day_1 = a3;
                        var hour_1 = (typeof (h) === "number" ? h : 0);
                        var minute_1 = (typeof (m) === "number" ? m : 0);
                        var second_1 = (typeof (s) === "number" ? s : 0);
                        var milli_1 = (typeof (ms) === "number" ? ms : 0);
                        year_1 = error_1.convertError("Argument.Year", function () { return math.roundSym(year_1); });
                        month_1 = error_1.convertError("Argument.Month", function () { return math.roundSym(month_1); });
                        day_1 = error_1.convertError("Argument.Day", function () { return math.roundSym(day_1); });
                        hour_1 = error_1.convertError("Argument.Hour", function () { return math.roundSym(hour_1); });
                        minute_1 = error_1.convertError("Argument.Minute", function () { return math.roundSym(minute_1); });
                        second_1 = error_1.convertError("Argument.Second", function () { return math.roundSym(second_1); });
                        milli_1 = error_1.convertError("Argument.Milli", function () { return math.roundSym(milli_1); });
                        var tm = new basics_1.TimeStruct({ year: year_1, month: month_1, day: day_1, hour: hour_1, minute: minute_1, second: second_1, milli: milli_1 });
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
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A4", "first two arguments are a string, therefore the fourth through 8th argument must be undefined");
                        assert_1.default(a3 === undefined || a3 === null || isTimeZone(a3), "Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object.");
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
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "first arguments is a string and the second is not, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object.");
                        var givenString = a1.trim();
                        var ss = DateTime._splitDateFromTimeZone(givenString);
                        assert_1.default(ss.length === 2, "Argument.S", "Invalid date string given: \"" + a1 + "\"");
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
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A4", "first argument is a Date, therefore the fourth through 8th argument must be undefined");
                        assert_1.default(typeof (a2) === "number" && (a2 === javascript_1.DateFunctions.Get || a2 === javascript_1.DateFunctions.GetUTC), "Argument.GetFuncs", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        assert_1.default(a3 === undefined || a3 === null || isTimeZone(a3), "Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object.");
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
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "first argument is a TimeStruct, therefore the third through 8th argument must be undefined");
                        assert_1.default(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "expect a TimeZone as second argument");
                        this._zoneDate = a1.clone();
                        this._zone = (a2 ? a2 : undefined);
                    }
                }
                break;
            case "undefined":
                {
                    assert_1.default(a2 === undefined && a3 === undefined && h === undefined && m === undefined
                        && s === undefined && ms === undefined && timeZone === undefined, "Argument.A2", "first argument is undefined, therefore the rest must also be undefined");
                    // nothing given, make local datetime
                    this._zone = timezone_1.TimeZone.local();
                    this._utcDate = basics_1.TimeStruct.fromDate(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC);
                }
                break;
            /* istanbul ignore next */
            default:
                /* istanbul ignore next */
                throw error_1.error("Argument.A1", "DateTime.DateTime(): unexpected first argument type.");
        }
    }
    Object.defineProperty(DateTime.prototype, "utcDate", {
        /**
         * UTC timestamp (lazily calculated)
         * @throws nothing
         */
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateTime.prototype, "zoneDate", {
        /**
         * Local timestamp (lazily calculated)
         * @throws nothing
         */
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
        enumerable: false,
        configurable: true
    });
    /**
     * Current date+time in local time
     * @throws nothing
     */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, javascript_1.DateFunctions.Get, timezone_1.TimeZone.local());
    };
    /**
     * Current date+time in UTC time
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
     */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC, timezone_1.TimeZone.utc());
    };
    /**
     * Current date+time in the given time zone
     * @param timeZone	The desired time zone (optional, defaults to UTC).
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
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
     * @throws timezonecomplete.Argument.N if n is not a finite number
     * @throws timezonecomplete.Argument.TimeZone if the given time zone is invalid
     */
    DateTime.fromExcel = function (n, timeZone) {
        assert_1.default(Number.isFinite(n), "Argument.N", "invalid number");
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
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.clone = function () {
        return new DateTime(this.zoneDate, this._zone);
    };
    /**
     * @return The time zone that the date is in. May be undefined for unaware dates.
     * @throws nothing
     */
    DateTime.prototype.zone = function () {
        return this._zone;
    };
    /**
     * Zone name abbreviation at this time
     * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
     * @return The abbreviation
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.offset = function () {
        return Math.round((this.zoneDate.unixMillis - this.utcDate.unixMillis) / 60000);
    };
    /**
     * @return the offset including DST w.r.t. UTC as a Duration.
     * @throws nothing
     */
    DateTime.prototype.offsetDuration = function () {
        return duration_1.Duration.milliseconds(Math.round(this.zoneDate.unixMillis - this.utcDate.unixMillis));
    };
    /**
     * @return the standard offset WITHOUT DST w.r.t. UTC as a Duration.
     * @throws nothing
     */
    DateTime.prototype.standardOffsetDuration = function () {
        if (this._zone) {
            return duration_1.Duration.minutes(this._zone.standardOffsetForUtc(this.utcDate));
        }
        return duration_1.Duration.minutes(0);
    };
    /**
     * @return The full year e.g. 2014
     * @throws nothing
     */
    DateTime.prototype.year = function () {
        return this.zoneDate.components.year;
    };
    /**
     * @return The month 1-12 (note this deviates from JavaScript Date)
     * @throws nothing
     */
    DateTime.prototype.month = function () {
        return this.zoneDate.components.month;
    };
    /**
     * @return The day of the month 1-31
     * @throws nothing
     */
    DateTime.prototype.day = function () {
        return this.zoneDate.components.day;
    };
    /**
     * @return The hour 0-23
     * @throws nothing
     */
    DateTime.prototype.hour = function () {
        return this.zoneDate.components.hour;
    };
    /**
     * @return the minutes 0-59
     * @throws nothing
     */
    DateTime.prototype.minute = function () {
        return this.zoneDate.components.minute;
    };
    /**
     * @return the seconds 0-59
     * @throws nothing
     */
    DateTime.prototype.second = function () {
        return this.zoneDate.components.second;
    };
    /**
     * @return the milliseconds 0-999
     * @throws nothing
     */
    DateTime.prototype.millisecond = function () {
        return this.zoneDate.components.milli;
    };
    /**
     * @return the day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     * @throws nothing
     */
    DateTime.prototype.weekDay = function () {
        return basics.weekDayNoLeapSecs(this.zoneDate.unixMillis);
    };
    /**
     * Returns the day number within the year: Jan 1st has number 0,
     * Jan 2nd has number 1 etc.
     *
     * @return the day-of-year [0-366]
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.weekOfMonth = function () {
        return basics.weekOfMonth(this.year(), this.month(), this.day());
    };
    /**
     * Returns the number of seconds that have passed on the current day
     * Does not consider leap seconds
     *
     * @return seconds [0-86399]
     * @throws nothing
     */
    DateTime.prototype.secondOfDay = function () {
        return basics.secondOfDay(this.hour(), this.minute(), this.second());
    };
    /**
     * @return Milliseconds since 1970-01-01T00:00:00.000Z
     * @throws nothing
     */
    DateTime.prototype.unixUtcMillis = function () {
        return this.utcDate.unixMillis;
    };
    /**
     * @return The full year e.g. 2014
     * @throws nothing
     */
    DateTime.prototype.utcYear = function () {
        return this.utcDate.components.year;
    };
    /**
     * @return The UTC month 1-12 (note this deviates from JavaScript Date)
     * @throws nothing
     */
    DateTime.prototype.utcMonth = function () {
        return this.utcDate.components.month;
    };
    /**
     * @return The UTC day of the month 1-31
     * @throws nothing
     */
    DateTime.prototype.utcDay = function () {
        return this.utcDate.components.day;
    };
    /**
     * @return The UTC hour 0-23
     * @throws nothing
     */
    DateTime.prototype.utcHour = function () {
        return this.utcDate.components.hour;
    };
    /**
     * @return The UTC minutes 0-59
     * @throws nothing
     */
    DateTime.prototype.utcMinute = function () {
        return this.utcDate.components.minute;
    };
    /**
     * @return The UTC seconds 0-59
     * @throws nothing
     */
    DateTime.prototype.utcSecond = function () {
        return this.utcDate.components.second;
    };
    /**
     * Returns the UTC day number within the year: Jan 1st has number 0,
     * Jan 2nd has number 1 etc.
     *
     * @return the day-of-year [0-366]
     * @throws nothing
     */
    DateTime.prototype.utcDayOfYear = function () {
        return basics.dayOfYear(this.utcYear(), this.utcMonth(), this.utcDay());
    };
    /**
     * @return The UTC milliseconds 0-999
     * @throws nothing
     */
    DateTime.prototype.utcMillisecond = function () {
        return this.utcDate.components.milli;
    };
    /**
     * @return the UTC day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.utcWeekOfMonth = function () {
        return basics.weekOfMonth(this.utcYear(), this.utcMonth(), this.utcDay());
    };
    /**
     * Returns the number of seconds that have passed on the current day
     * Does not consider leap seconds
     *
     * @return seconds [0-86399]
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.withZone = function (zone) {
        return new DateTime(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond(), zone);
    };
    /**
     * Convert this date to the given time zone (in-place).
     * @return this (for chaining)
     * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a datetime without a zone to a datetime with a zone
     */
    DateTime.prototype.convert = function (zone) {
        if (zone) {
            if (!this._zone) { // if-statement satisfies the compiler
                return error_1.throwError("UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
     * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a naive datetime to an aware one.
     */
    DateTime.prototype.toZone = function (zone) {
        if (zone) {
            assert_1.default(this._zone, "UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
     * @throws nothing
     */
    DateTime.prototype.toDate = function () {
        return new Date(this.year(), this.month() - 1, this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
    };
    /**
     * Create an Excel timestamp for this datetime converted to the given zone.
     * Does not work for dates < 1900
     * @param timeZone Optional. Zone to convert to, default the zone the datetime is already in.
     * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
     * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a naive datetime to an aware one.
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
     * @throws nothing
     */
    DateTime.prototype.toUtcExcel = function () {
        var unixTimestamp = this.unixUtcMillis();
        return this._unixTimeStampToExcel(unixTimestamp);
    };
    /**
     *
     * @param n
     * @throws nothing
     */
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
     * @throws Argument.Amount if amount is not finite or if it's not an integer and you're adding months or years
     * @throws Argument.Unit for invalid time unit
     */
    DateTime.prototype._addToTimeStruct = function (tm, amount, unit) {
        assert_1.default(Number.isFinite(amount), "Argument.Amount", "amount must be a finite number");
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
                assert_1.default(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of months");
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
                assert_1.default(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of years");
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
                /* istanbul ignore next */
                return error_1.throwError("Argument.Unit", "invalid time unit");
        }
    };
    DateTime.prototype.sub = function (a1, unit) {
        if (typeof a1 === "number") {
            var amount = a1;
            return this.add(-1 * amount, unit);
        }
        else {
            var duration = a1;
            return this.add(duration.multiply(-1));
        }
    };
    DateTime.prototype.subLocal = function (a1, unit) {
        if (typeof a1 === "number") {
            return this.addLocal(-1 * a1, unit);
        }
        else {
            return this.addLocal(a1.multiply(-1));
        }
    };
    /**
     * Time difference between two DateTimes
     * @return this - other
     * @throws nothing
     */
    DateTime.prototype.diff = function (other) {
        return new duration_1.Duration(this.utcDate.unixMillis - other.utcDate.unixMillis);
    };
    /**
     * Chops off the time part, yields the same date at 00:00:00.000
     * @return a new DateTime
     * @throws nothing
     */
    DateTime.prototype.startOfDay = function () {
        return new DateTime(this.year(), this.month(), this.day(), 0, 0, 0, 0, this.zone());
    };
    /**
     * Returns the first day of the month at 00:00:00
     * @return a new DateTime
     * @throws nothing
     */
    DateTime.prototype.startOfMonth = function () {
        return new DateTime(this.year(), this.month(), 1, 0, 0, 0, 0, this.zone());
    };
    /**
     * Returns the first day of the year at 00:00:00
     * @return a new DateTime
     * @throws nothing
     */
    DateTime.prototype.startOfYear = function () {
        return new DateTime(this.year(), 1, 1, 0, 0, 0, 0, this.zone());
    };
    /**
     * @return True iff (this < other)
     * @throws nothing
     */
    DateTime.prototype.lessThan = function (other) {
        return this.utcDate.unixMillis < other.utcDate.unixMillis;
    };
    /**
     * @return True iff (this <= other)
     * @throws nothing
     */
    DateTime.prototype.lessEqual = function (other) {
        return this.utcDate.unixMillis <= other.utcDate.unixMillis;
    };
    /**
     * @return True iff this and other represent the same moment in time in UTC
     * @throws nothing
     */
    DateTime.prototype.equals = function (other) {
        return this.utcDate.equals(other.utcDate);
    };
    /**
     * @return True iff this and other represent the same time and the same zone
     * @throws nothing
     */
    DateTime.prototype.identical = function (other) {
        return !!(this.zoneDate.equals(other.zoneDate)
            && (!this._zone) === (!other._zone)
            && ((!this._zone && !other._zone) || (this._zone && other._zone && this._zone.identical(other._zone))));
    };
    /**
     * @return True iff this > other
     * @throws nothing
     */
    DateTime.prototype.greaterThan = function (other) {
        return this.utcDate.unixMillis > other.utcDate.unixMillis;
    };
    /**
     * @return True iff this >= other
     * @throws nothing
     */
    DateTime.prototype.greaterEqual = function (other) {
        return this.utcDate.unixMillis >= other.utcDate.unixMillis;
    };
    /**
     * @return The minimum of this and other
     * @throws nothing
     */
    DateTime.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };
    /**
     * @return The maximum of this and other
     * @throws nothing
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
     * Unaware dates have no zone information at the end.
     * @throws nothing
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
     * Convert to UTC and then return ISO string ending in 'Z'. This is equivalent to Date#toISOString()
     * e.g. "2014-01-01T23:15:33 Europe/Amsterdam" becomes "2014-01-01T22:15:33Z".
     * Unaware dates are assumed to be in UTC
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
     */
    DateTime.prototype.toUtcIsoString = function () {
        if (this._zone) {
            return this.toZone(timezone_1.TimeZone.utc()).format("yyyy-MM-ddTHH:mm:ss.SSSZZZZZ");
        }
        else {
            return this.withZone(timezone_1.TimeZone.utc()).format("yyyy-MM-ddTHH:mm:ss.SSSZZZZZ");
        }
    };
    /**
     * Return a string representation of the DateTime according to the
     * specified format. See LDML.md for supported formats.
     *
     * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
     * @param locale Optional, non-english format month names etc.
     * @return The string representation of this DateTime
     * @throws timezonecomplete.Argument.FormatString for invalid format pattern
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
     * @param allowTrailing Allow trailing characters in the source string
     * @throws timezonecomplete.ParseError if the given dateTimeString is wrong or not according to the pattern
     * @throws timezonecomplete.Argument.FormatString if the given format string is invalid
     */
    DateTime.parse = function (s, format, zone, locale, allowTrailing) {
        var parsed = parseFuncs.parse(s, format, zone, allowTrailing || false, locale);
        try {
            return new DateTime(parsed.time, parsed.zone);
        }
        catch (e) {
            if (!error_1.errorIs(e, "InvalidTimeZoneData")) {
                e = error_1.error("ParseError", e.message);
            }
            throw e;
        }
    };
    /**
     * Modified ISO 8601 format string with IANA name if applicable.
     * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
     * @throws nothing
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
     * @throws nothing
     */
    DateTime.prototype.valueOf = function () {
        return this.unixUtcMillis();
    };
    /**
     * Modified ISO 8601 format string in UTC without time zone info
     * @throws nothing
     */
    DateTime.prototype.toUtcString = function () {
        return this.utcDate.toString();
    };
    /**
     * Split a combined ISO datetime and timezone into datetime and timezone
     * @throws nothing
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
 * @throws nothing
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
/**
 * Checks if a given object is of type DateTime. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
function isDateTime(value) {
    return typeof value === "object" && value !== null && value.kind === "DateTime";
}
exports.isDateTime = isDateTime;

},{"./assert":1,"./basics":2,"./duration":4,"./error":5,"./format":6,"./javascript":8,"./math":10,"./parse":11,"./timesource":14,"./timezone":15,"./tz-database":17}],4:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Time duration
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDuration = exports.Duration = exports.milliseconds = exports.seconds = exports.minutes = exports.hours = exports.days = exports.months = exports.years = void 0;
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var strings = require("./strings");
/**
 * Construct a time duration
 * @param n	Number of years (may be fractional or negative)
 * @return A duration of n years
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function years(n) {
    return Duration.years(n);
}
exports.years = years;
/**
 * Construct a time duration
 * @param n	Number of months (may be fractional or negative)
 * @return A duration of n months
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function months(n) {
    return Duration.months(n);
}
exports.months = months;
/**
 * Construct a time duration
 * @param n	Number of days (may be fractional or negative)
 * @return A duration of n days
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function days(n) {
    return Duration.days(n);
}
exports.days = days;
/**
 * Construct a time duration
 * @param n	Number of hours (may be fractional or negative)
 * @return A duration of n hours
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function hours(n) {
    return Duration.hours(n);
}
exports.hours = hours;
/**
 * Construct a time duration
 * @param n	Number of minutes (may be fractional or negative)
 * @return A duration of n minutes
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function minutes(n) {
    return Duration.minutes(n);
}
exports.minutes = minutes;
/**
 * Construct a time duration
 * @param n	Number of seconds (may be fractional or negative)
 * @return A duration of n seconds
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
function seconds(n) {
    return Duration.seconds(n);
}
exports.seconds = seconds;
/**
 * Construct a time duration
 * @param n	Number of milliseconds (may be fractional or negative)
 * @return A duration of n milliseconds
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
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
        /**
         * Allow not using instanceof
         */
        this.kind = "Duration";
        if (typeof i1 === "number") {
            // amount+unit constructor
            var amount = i1;
            assert_1.default(Number.isFinite(amount), "Argument.Amount", "amount should be finite: %d", amount);
            this._amount = amount;
            this._unit = (typeof unit === "number" ? unit : basics_1.TimeUnit.Millisecond);
            assert_1.default(Number.isInteger(this._unit) && this._unit >= 0 && this._unit < basics_1.TimeUnit.MAX, "Argument.Unit", "Invalid time unit %d", this._unit);
        }
        else if (typeof i1 === "string") {
            // string constructor
            var s = i1;
            var trimmed = s.trim();
            if (trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/)) {
                var sign = 1;
                var hours_1 = 0;
                var minutes_1 = 0;
                var seconds_1 = 0;
                var milliseconds_1 = 0;
                var parts = trimmed.split(":");
                assert_1.default(parts.length > 0 && parts.length < 4, "Argument.S", "Not a proper time duration string: \"" + trimmed + "\"");
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
                assert_1.default(split.length === 2, "Argument.S", "Invalid time string '%s'", s);
                var amount = parseFloat(split[0]);
                assert_1.default(Number.isFinite(amount), "Argument.S", "Invalid time string '%s', cannot parse amount", s);
                this._amount = amount;
                this._unit = basics.stringToTimeUnit(split[1]);
            }
        }
        else if (i1 === undefined && unit === undefined) {
            // default constructor
            this._amount = 0;
            this._unit = basics_1.TimeUnit.Millisecond;
        }
        else {
            assert_1.default(false, "Argument.Amount", "invalid constructor arguments");
        }
    }
    /**
     * Construct a time duration
     * @param amount Number of years (may be fractional or negative)
     * @return A duration of n years
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.years = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Year);
    };
    /**
     * Construct a time duration
     * @param amount Number of months (may be fractional or negative)
     * @return A duration of n months
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.months = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Month);
    };
    /**
     * Construct a time duration
     * @param amount Number of days (may be fractional or negative)
     * @return A duration of n days
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.days = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Day);
    };
    /**
     * Construct a time duration
     * @param amount Number of hours (may be fractional or negative)
     * @return A duration of n hours
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.hours = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Hour);
    };
    /**
     * Construct a time duration
     * @param amount Number of minutes (may be fractional or negative)
     * @return A duration of n minutes
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.minutes = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Minute);
    };
    /**
     * Construct a time duration
     * @param amount Number of seconds (may be fractional or negative)
     * @return A duration of n seconds
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.seconds = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Second);
    };
    /**
     * Construct a time duration
     * @param amount Number of milliseconds (may be fractional or negative)
     * @return A duration of n milliseconds
     * @throws timezonecomplete.Argument.Amount if n is not a finite number
     */
    Duration.milliseconds = function (amount) {
        return new Duration(amount, basics_1.TimeUnit.Millisecond);
    };
    /**
     * @return another instance of Duration with the same value.
     * @throws nothing
     */
    Duration.prototype.clone = function () {
        return new Duration(this._amount, this._unit);
    };
    /**
     * Returns this duration expressed in different unit (positive or negative, fractional).
     * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
     * It is approximate for any other conversion
     * @throws nothing
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
     * @throws nothing
     */
    Duration.prototype.convert = function (unit) {
        return new Duration(this.as(unit), unit);
    };
    /**
     * The entire duration in milliseconds (negative or positive)
     * For Day/Month/Year durations, this is approximate!
     * @throws nothing
     */
    Duration.prototype.milliseconds = function () {
        return this.as(basics_1.TimeUnit.Millisecond);
    };
    /**
     * The millisecond part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 400 for a -01:02:03.400 duration
     * @throws nothing
     */
    Duration.prototype.millisecond = function () {
        return this._part(basics_1.TimeUnit.Millisecond);
    };
    /**
     * The entire duration in seconds (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 1500 milliseconds duration
     * @throws nothing
     */
    Duration.prototype.seconds = function () {
        return this.as(basics_1.TimeUnit.Second);
    };
    /**
     * The second part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 3 for a -01:02:03.400 duration
     * @throws nothing
     */
    Duration.prototype.second = function () {
        return this._part(basics_1.TimeUnit.Second);
    };
    /**
     * The entire duration in minutes (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 90000 milliseconds duration
     * @throws nothing
     */
    Duration.prototype.minutes = function () {
        return this.as(basics_1.TimeUnit.Minute);
    };
    /**
     * The minute part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 2 for a -01:02:03.400 duration
     * @throws nothing
     */
    Duration.prototype.minute = function () {
        return this._part(basics_1.TimeUnit.Minute);
    };
    /**
     * The entire duration in hours (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 5400000 milliseconds duration
     * @throws nothing
     */
    Duration.prototype.hours = function () {
        return this.as(basics_1.TimeUnit.Hour);
    };
    /**
     * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
     * during DST changes).
     * @throws nothing
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
     * @throws nothing
     */
    Duration.prototype.wholeHours = function () {
        return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / 3600000);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in days!
     * @throws nothing
     */
    Duration.prototype.days = function () {
        return this.as(basics_1.TimeUnit.Day);
    };
    /**
     * The day part of a duration. This assumes that a month has 30 days.
     * @throws nothing
     */
    Duration.prototype.day = function () {
        return this._part(basics_1.TimeUnit.Day);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     * @throws nothing
     */
    Duration.prototype.months = function () {
        return this.as(basics_1.TimeUnit.Month);
    };
    /**
     * The month part of a duration.
     * @throws nothing
     */
    Duration.prototype.month = function () {
        return this._part(basics_1.TimeUnit.Month);
    };
    /**
     * The entire duration in years (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     * @throws nothing
     */
    Duration.prototype.years = function () {
        return this.as(basics_1.TimeUnit.Year);
    };
    /**
     * Non-fractional positive years
     * @throws nothing
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
     * @throws nothing
     */
    Duration.prototype.amount = function () {
        return this._amount;
    };
    /**
     * The unit this duration was created with
     * @throws nothing
     */
    Duration.prototype.unit = function () {
        return this._unit;
    };
    /**
     * Sign
     * @return "-" if the duration is negative
     * @throws nothing
     */
    Duration.prototype.sign = function () {
        return (this._amount < 0 ? "-" : "");
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this < other)
     * @throws nothing
     */
    Duration.prototype.lessThan = function (other) {
        return this.milliseconds() < other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this <= other)
     * @throws nothing
     */
    Duration.prototype.lessEqual = function (other) {
        return this.milliseconds() <= other.milliseconds();
    };
    /**
     * Similar but not identical
     * Approximate if the durations have units that cannot be converted
     * @return True iff this and other represent the same time duration
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
     */
    Duration.prototype.identical = function (other) {
        return this._amount === other.amount() && this._unit === other.unit();
    };
    /**
     * Returns true if this is a non-zero length duration
     */
    Duration.prototype.nonZero = function () {
        return this._amount !== 0;
    };
    /**
     * Returns true if this is a zero-length duration
     */
    Duration.prototype.zero = function () {
        return this._amount === 0;
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this > other
     * @throws nothing
     */
    Duration.prototype.greaterThan = function (other) {
        return this.milliseconds() > other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this >= other
     * @throws nothing
     */
    Duration.prototype.greaterEqual = function (other) {
        return this.milliseconds() >= other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return The minimum (most negative) of this and other
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
     */
    Duration.prototype.multiply = function (value) {
        return new Duration(this._amount * value, this._unit);
    };
    Duration.prototype.divide = function (value) {
        if (typeof value === "number") {
            assert_1.default(Number.isFinite(value) && value !== 0, "Argument.Value", "cannot divide by %d", value);
            return new Duration(this._amount / value, this._unit);
        }
        else {
            assert_1.default(value.amount() !== 0, "Argument.Value", "cannot divide by 0");
            return this.milliseconds() / value.milliseconds();
        }
    };
    /**
     * Add a duration.
     * @return a new Duration of (this + value) with the unit of this duration
     * @throws nothing
     */
    Duration.prototype.add = function (value) {
        return new Duration(this._amount + value.as(this._unit), this._unit);
    };
    /**
     * Subtract a duration.
     * @return a new Duration of (this - value) with the unit of this duration
     * @throws nothing
     */
    Duration.prototype.sub = function (value) {
        return new Duration(this._amount - value.as(this._unit), this._unit);
    };
    /**
     * Return the absolute value of the duration i.e. remove the sign.
     * @throws nothing
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
     * String in [-]hhhh:mm:ss.nnn notation. All fields are always present except the sign.
     * @throws nothing
     */
    Duration.prototype.toFullString = function () {
        return this.toHmsString(true);
    };
    /**
     * String in [-]hhhh:mm[:ss[.nnn]] notation.
     * @param full If true, then all fields are always present except the sign. Otherwise, seconds and milliseconds
     * are chopped off if zero
     * @throws nothing
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
     * @throws nothing
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
                    throw new Error("Unknown time unit."); // programming error
                }
        }
    };
    /**
     * String representation with amount and unit e.g. '1.5 years' or '-1 day'
     * @throws nothing
     */
    Duration.prototype.toString = function () {
        return this._amount.toString(10) + " " + basics.timeUnitToString(this._unit, this._amount);
    };
    /**
     * The valueOf() method returns the primitive value of the specified object.
     * @throws nothing
     */
    Duration.prototype.valueOf = function () {
        return this.milliseconds();
    };
    /**
     * Return this % unit, always positive
     * @throws nothing
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
    return Duration;
}());
exports.Duration = Duration;
/**
 * Checks if a given object is of type Duration. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
function isDuration(value) {
    return typeof value === "object" && value !== null && value.kind === "Duration";
}
exports.isDuration = isDuration;

},{"./assert":1,"./basics":2,"./strings":13}],5:[function(require,module,exports){
"use strict";
/**
 * Copyright (c) 2019 ABB Switzerland Ltd.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertError = exports.errorIs = exports.error = exports.throwError = void 0;
var util = require("util");
/**
 * Throws an error with the given name and message
 * @param name error name, without timezonecomplete prefix
 * @param format message with percent-style placeholders
 * @param args arguments for the placeholders
 * @throws the given error
 */
function throwError(name, format) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var error = new Error(util.format(format, args));
    error.name = "timezonecomplete." + name;
    throw error;
}
exports.throwError = throwError;
/**
 * Returns an error with the given name and message
 * @param name
 * @param format
 * @param args
 * @throws nothing
 */
function error(name, format) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var error = new Error(util.format(format, args));
    error.name = "timezonecomplete." + name;
    return error;
}
exports.error = error;
/**
 * Returns true iff `error.name` is equal to or included by `name`
 * @param error
 * @param name string or array of strings
 * @throws nothing
 */
function errorIs(error, name) {
    if (typeof name === "string") {
        return error.name === "timezonecomplete." + name;
    }
    else {
        return error.name.startsWith("timezonecomplete.") && name.includes(error.name.substr("timezonecomplete.".length));
    }
}
exports.errorIs = errorIs;
/**
 * Converts all errors thrown by `cb` to the given error name
 * @param errorName
 * @param cb
 * @throws [errorName]
 */
function convertError(errorName, cb) {
    try {
        return cb();
    }
    catch (e) {
        return throwError(errorName, e.message);
    }
}
exports.convertError = convertError;

},{"util":21}],6:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
var basics = require("./basics");
var error_1 = require("./error");
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
 * @throws timezonecomplete.Argument.FormatString for invalid format pattern
 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
 */
function format(dateTime, utcTime, localZone, formatString, locale) {
    if (locale === void 0) { locale = {}; }
    var mergedLocale = __assign(__assign({}, locale_1.DEFAULT_LOCALE), locale);
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
 * @throws nothing
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
 * @throws nothing
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
 * @throws timezonecomplete.Argument.FormatString for invalid format pattern
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
            return error_1.throwError("Argument.FormatString", "invalid quarter pattern");
    }
}
/**
 * Format the month
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 * @throws timezonecomplete.Argument.FormatString for invalid format pattern
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
            return error_1.throwError("Argument.FormatString", "invalid month pattern");
    }
}
/**
 * Format the week number
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 * @throws nothing
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
 * @throws nothing
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
 * @throws nothing
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
 * @throws nothing
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
 * @throws nothing
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
 * @throws nothing
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
 * @throws timezonecomplete.Argument.** if any of the given dateTime elements are invalid
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
 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
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

},{"./basics":2,"./error":5,"./locale":9,"./strings":13,"./token":16}],7:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Global functions depending on DateTime/Duration etc
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abs = exports.max = exports.min = void 0;
var assert_1 = require("./assert");
/**
 * Returns the minimum of two DateTimes or Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
function min(d1, d2) {
    assert_1.default(d1, "Argument.D1", "first argument is falsy");
    assert_1.default(d2, "Argument.D2", "second argument is falsy");
    /* istanbul ignore next */
    assert_1.default(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
    return d1.min(d2);
}
exports.min = min;
/**
 * Returns the maximum of two DateTimes or Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
function max(d1, d2) {
    assert_1.default(d1, "Argument.D1", "first argument is falsy");
    assert_1.default(d2, "Argument.D2", "second argument is falsy");
    /* istanbul ignore next */
    assert_1.default(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
    return d1.max(d2);
}
exports.max = max;
/**
 * Returns the absolute value of a Duration
 * @throws timezonecomplete.Argument.D if d is undefined/null
 */
function abs(d) {
    assert_1.default(d, "Argument.D", "first argument is falsy");
    return d.abs();
}
exports.abs = abs;

},{"./assert":1}],8:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFunctions = void 0;
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

},{}],9:[function(require,module,exports){
"use strict";
/**
 * Copyright(c) 2017 ABB Switzerland Ltd.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOCALE = exports.DAY_PERIODS_NARROW = exports.DAY_PERIODS_WIDE = exports.DAY_PERIODS_ABBREVIATED = exports.WEEKDAY_LETTERS = exports.WEEKDAY_TWO_LETTERS = exports.SHORT_WEEKDAY_NAMES = exports.LONG_WEEKDAY_NAMES = exports.STAND_ALONE_MONTH_LETTERS = exports.STAND_ALONE_SHORT_MONTH_NAMES = exports.STAND_ALONE_LONG_MONTH_NAMES = exports.MONTH_LETTERS = exports.SHORT_MONTH_NAMES = exports.LONG_MONTH_NAMES = exports.STAND_ALONE_QUARTER_ABBREVIATIONS = exports.STAND_ALONE_QUARTER_WORD = exports.STAND_ALONE_QUARTER_LETTER = exports.QUARTER_ABBREVIATIONS = exports.QUARTER_WORD = exports.QUARTER_LETTER = exports.ERA_NAMES_ABBREVIATED = exports.ERA_NAMES_WIDE = exports.ERA_NAMES_NARROW = void 0;
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

},{}],10:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Math utility functions
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positiveModulo = exports.filterFloat = exports.roundSym = exports.isInt = void 0;
var assert_1 = require("./assert");
/**
 * @return true iff given argument is an integer number
 * @throws nothing
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
 * @throws timezonecomplete.Argument.N if n is not a finite number
 */
function roundSym(n) {
    assert_1.default(Number.isFinite(n), "Argument.N", "n must be a finite number but is: %d", n);
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
 * @throws nothing
 */
function filterFloat(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
        return Number(value);
    }
    return NaN;
}
exports.filterFloat = filterFloat;
/**
 * Modulo function that only returns a positive result, in contrast to the % operator
 * @param value
 * @param modulo
 * @throws timezonecomplete.Argument.Value if value is not finite
 * @throws timezonecomplete.Argument.Modulo if modulo is not a finite number >= 1
 */
function positiveModulo(value, modulo) {
    assert_1.default(Number.isFinite(value), "Argument.Value", "value should be finite");
    assert_1.default(Number.isFinite(modulo) && modulo >= 1, "Argument.Modulo", "modulo should be >= 1");
    if (value < 0) {
        return ((value % modulo) + modulo) % modulo;
    }
    else {
        return value % modulo;
    }
}
exports.positiveModulo = positiveModulo;

},{"./assert":1}],11:[function(require,module,exports){
"use strict";
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseable = void 0;
var basics_1 = require("./basics");
var error_1 = require("./error");
var locale_1 = require("./locale");
var math_1 = require("./math");
var timezone_1 = require("./timezone");
var token_1 = require("./token");
/**
 * Checks if a given datetime string is according to the given format
 * @param dateTimeString The string to test
 * @param formatString LDML format string (see LDML.md)
 * @param allowTrailing Allow trailing string after the date+time
 * @param locale Locale-specific constants such as month names
 * @returns true iff the string is valid
 * @throws nothing
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
 * @param overrideZone Use this zone in the result
 * @param allowTrailing Allow trailing characters in the source string
 * @param locale Locale-specific constants such as month names
 * @return string
 * @throws timezonecomplete.ParseError if the given dateTimeString is wrong or not according to the pattern
 * @throws timezonecomplete.Argument.FormatString if the given format string is invalid
 */
function parse(dateTimeString, formatString, overrideZone, allowTrailing, locale) {
    var _a;
    if (allowTrailing === void 0) { allowTrailing = true; }
    if (locale === void 0) { locale = {}; }
    if (!dateTimeString) {
        return error_1.throwError("ParseError", "no date given");
    }
    if (!formatString) {
        return error_1.throwError("Argument.FormatString", "no format given");
    }
    var mergedLocale = __assign(__assign({}, locale_1.DEFAULT_LOCALE), locale);
    var yearCutoff = math_1.positiveModulo((new Date().getFullYear() + 50), 100);
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
                case token_1.TokenType.WEEKDAY:
                    {
                        remaining = stripWeekDay(token, remaining, mergedLocale);
                    }
                    break;
                case token_1.TokenType.WEEK:
                    remaining = stripNumber(remaining, 2).remaining;
                    break; // nothing to learn from this
                case token_1.TokenType.DAYPERIOD:
                    dpr = stripDayPeriod(token, remaining, mergedLocale);
                    remaining = dpr.remaining;
                    break;
                case token_1.TokenType.YEAR:
                    pnr = stripNumber(remaining, Infinity);
                    remaining = pnr.remaining;
                    if (token.length === 2) {
                        if (pnr.n > yearCutoff) {
                            time.year = 1900 + pnr.n;
                        }
                        else {
                            time.year = 2000 + pnr.n;
                        }
                    }
                    else {
                        time.year = pnr.n;
                    }
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
                                time.minute = Math.floor(math_1.positiveModulo(pnr.n / 60E3, 60));
                                time.second = Math.floor(math_1.positiveModulo(pnr.n / 1000, 60));
                                time.milli = math_1.positiveModulo(pnr.n, 1000);
                                break;
                            /* istanbul ignore next */
                            default:
                                /* istanbul ignore next */
                                return error_1.throwError("ParseError", "unsupported second format '" + token.raw + "'");
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
                        return error_1.throwError("ParseError", "invalid time, contains 'noon' specifier but time differs from noon");
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
                        return error_1.throwError("ParseError", "invalid time, contains 'midnight' specifier but time differs from midnight");
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
                var error_2 = false;
                switch (quarter) {
                    case 1:
                        error_2 = !(time.month >= 1 && time.month <= 3);
                        break;
                    case 2:
                        error_2 = !(time.month >= 4 && time.month <= 6);
                        break;
                    case 3:
                        error_2 = !(time.month >= 7 && time.month <= 9);
                        break;
                    case 4:
                        error_2 = !(time.month >= 10 && time.month <= 12);
                        break;
                }
                if (error_2) {
                    return error_1.throwError("ParseError", "the quarter does not match the month");
                }
            }
        }
        if (time.year === undefined) {
            time.year = 1970;
        }
        var result = { time: new basics_1.TimeStruct(time), zone: zone };
        if (!result.time.validate()) {
            return error_1.throwError("ParseError", "invalid resulting date");
        }
        // always overwrite zone with given zone
        if (overrideZone) {
            result.zone = overrideZone;
        }
        if (remaining && !allowTrailing) {
            return error_1.throwError("ParseError", "invalid date '" + dateTimeString + "' not according to format '" + formatString + "': trailing characters: '" + remaining + "'");
        }
        return result;
    }
    catch (e) {
        return error_1.throwError("ParseError", "invalid date '" + dateTimeString + "' not according to format '" + formatString + "': " + e.message);
    }
}
exports.parse = parse;
var WHITESPACE = [" ", "\t", "\r", "\v", "\n"];
/**
 *
 * @param token
 * @param s
 * @throws timezonecomplete.NotImplemented if a pattern is used that isn't implemented yet (z, Z, v, V, x, X)
 * @throws timezonecomplete.ParseError if the given string is not parseable
 */
function stripZone(token, s) {
    var unsupported = (token.symbol === "z")
        || (token.symbol === "Z" && token.length === 5)
        || (token.symbol === "v")
        || (token.symbol === "V" && token.length !== 2)
        || (token.symbol === "x" && token.length >= 4)
        || (token.symbol === "X" && token.length >= 4);
    if (unsupported) {
        return error_1.throwError("NotImplemented", "time zone pattern '" + token.raw + "' is not implemented");
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
            return error_1.throwError("ParseError", "invalid time zone 'GMT" + zoneString + "'");
        }
        try {
            result.zone = timezone_1.TimeZone.zone(zoneString);
        }
        catch (e) {
            if (error_1.errorIs(e, ["Argument.S", "NotFound.Zone"])) {
                e = error_1.error("ParseError", e.message);
            }
            throw e;
        }
    }
    else {
        return error_1.throwError("ParseError", "no time zone given");
    }
    return result;
}
/**
 *
 * @param s
 * @param expected
 * @throws timezonecomplete.ParseError
 */
function stripRaw(s, expected) {
    var remaining = s;
    var eremaining = expected;
    while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
        remaining = remaining.substr(1);
        eremaining = eremaining.substr(1);
    }
    if (eremaining.length > 0) {
        return error_1.throwError("ParseError", "expected '" + expected + "'");
    }
    return remaining;
}
/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 */
function stripDayPeriod(token, remaining, locale) {
    var _a, _b, _c, _d, _e, _f;
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
    return error_1.throwError("ParseError", "missing day period i.e. " + Object.keys(offsets).join(", "));
}
/**
 * Returns factor -1 or 1 depending on BC or AD
 * @param token
 * @param remaining
 * @param locale
 * @returns [factor, remaining]
 * @throws timezonecomplete.ParseError
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
/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
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
            return error_1.throwError("Argument.FormatString", "invalid quarter pattern");
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
            return error_1.throwError("Argument.FormatString", "invalid quarter pattern");
    }
    var r = stripStrings(token, remaining, allowed);
    return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}
/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @returns remaining string
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
function stripWeekDay(token, remaining, locale) {
    var allowed;
    switch (token.length) {
        case 1:
            {
                if (token.symbol === "e") {
                    return stripNumber(remaining, 1).remaining;
                }
                else {
                    allowed = locale.shortWeekdayNames;
                }
            }
            break;
        case 2:
            {
                if (token.symbol === "e") {
                    return stripNumber(remaining, 2).remaining;
                }
                else {
                    allowed = locale.shortWeekdayNames;
                }
            }
            break;
        case 3:
            allowed = locale.shortWeekdayNames;
            break;
        case 4:
            allowed = locale.longWeekdayNames;
            break;
        case 5:
            allowed = locale.weekdayLetters;
            break;
        case 6:
            allowed = locale.weekdayTwoLetters;
            break;
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            return error_1.throwError("Argument.FormatString", "invalid quarter pattern");
    }
    var r = stripStrings(token, remaining, allowed);
    return r.remaining;
}
/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
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
            return error_1.throwError("Argument.FormatString", "invalid month pattern");
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
            return error_1.throwError("Argument.FormatString", "invalid month pattern");
    }
    var r = stripStrings(token, remaining, allowed);
    return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}
/**
 *
 * @param token
 * @param remaining
 * @throws timezonecomplete.ParseError
 */
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
/**
 *
 * @param token
 * @param remaining
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
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
            return error_1.throwError("Argument.FormatString", "invalid seconds pattern");
    }
}
/**
 *
 * @param s
 * @param maxLength
 * @throws timezonecomplete.ParseError
 */
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
        return error_1.throwError("ParseError", "expected a number but got '" + numberString + "'");
    }
    return result;
}
/**
 *
 * @param token
 * @param remaining
 * @param allowed
 * @throws timezonecomplete.ParseError
 */
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
    return error_1.throwError("ParseError", "invalid " + token_1.TokenType[token.type].toLowerCase() + ", expected one of " + allowed.join(", "));
}

},{"./basics":2,"./error":5,"./locale":9,"./math":10,"./timezone":15,"./token":16}],12:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Periodic interval functions
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampOnWeekTimeLessThan = exports.timestampOnWeekTimeGreaterThanOrEqualTo = exports.isPeriod = exports.isValidPeriodJson = exports.Period = exports.periodDstToString = exports.PeriodDst = void 0;
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var datetime_1 = require("./datetime");
var duration_1 = require("./duration");
var error_1 = require("./error");
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
 * @throws timezonecomplete.Argument.P for invalid PeriodDst value
 */
function periodDstToString(p) {
    switch (p) {
        case PeriodDst.RegularIntervals: return "regular intervals";
        case PeriodDst.RegularLocalTime: return "regular local time";
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            return error_1.throwError("Argument.P", "invalid PerioDst value %d", p);
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
    function Period(a, amountOrInterval, unitOrDst, givenDst) {
        /**
         * Allow not using instanceof
         */
        this.kind = "Period";
        var reference;
        var interval;
        var dst = PeriodDst.RegularLocalTime;
        if (datetime_1.isDateTime(a)) {
            reference = a;
            if (typeof (amountOrInterval) === "object") {
                interval = amountOrInterval;
                dst = unitOrDst;
            }
            else {
                assert_1.default(typeof unitOrDst === "number" && unitOrDst >= 0 && unitOrDst < basics_1.TimeUnit.MAX, "Argument.Unit", "Invalid unit");
                interval = new duration_1.Duration(amountOrInterval, unitOrDst);
                dst = givenDst;
            }
            if (typeof dst !== "number") {
                dst = PeriodDst.RegularLocalTime;
            }
        }
        else {
            try {
                reference = new datetime_1.DateTime(a.reference);
                interval = new duration_1.Duration(a.duration);
                dst = a.periodDst === "regular" ? PeriodDst.RegularIntervals : PeriodDst.RegularLocalTime;
            }
            catch (e) {
                return error_1.throwError("Argument.Json", e);
            }
        }
        assert_1.default(dst >= 0 && dst < PeriodDst.MAX, "Argument.Dst", "Invalid PeriodDst setting");
        assert_1.default(interval.amount() > 0, "Argument.Interval", "Amount must be positive non-zero.");
        assert_1.default(Number.isInteger(interval.amount()), "Argument.Interval", "Amount must be a whole number");
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
                    assert_1.default(this._intInterval.amount() < 86400000, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Second:
                    assert_1.default(this._intInterval.amount() < 86400, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Minute:
                    assert_1.default(this._intInterval.amount() < 1440, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Hour:
                    assert_1.default(this._intInterval.amount() < 24, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
            }
        }
    }
    /**
     * Return a fresh copy of the period
     * @throws nothing
     */
    Period.prototype.clone = function () {
        return new Period(this._reference, this._interval, this._dst);
    };
    /**
     * The reference date
     * @throws nothing
     */
    Period.prototype.reference = function () {
        return this._reference;
    };
    /**
     * DEPRECATED: old name for the reference date
     * @throws nothing
     */
    Period.prototype.start = function () {
        return this._reference;
    };
    /**
     * The interval
     * @throws nothing
     */
    Period.prototype.interval = function () {
        return this._interval.clone();
    };
    /**
     * The amount of units of the interval
     * @throws nothing
     */
    Period.prototype.amount = function () {
        return this._interval.amount();
    };
    /**
     * The unit of the interval
     * @throws nothing
     */
    Period.prototype.unit = function () {
        return this._interval.unit();
    };
    /**
     * The dst handling mode
     * @throws nothing
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
     * @throws timezonecomplete.UnawareToAwareConversion if not both fromdate and the reference date are both aware or unaware of time zone
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
     */
    Period.prototype.findFirst = function (fromDate) {
        assert_1.default(!!this._intReference.zone() === !!fromDate.zone(), "UnawareToAwareConversion", "The fromDate and reference date must both be aware or unaware");
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
                            return error_1.throwError("Assertion", "Unknown TimeUnit");
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
                            return error_1.throwError("Assertion", "Unknown TimeUnit");
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
                            return error_1.throwError("Assertion", "Unknown TimeUnit");
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
                            return error_1.throwError("Assertion", "Unknown TimeUnit");
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
     * @param count	Number of periods to add. Optional. Must be an integer number, may be positive or negative, default 1
     * @return (prev + count * period), in the same timezone as prev.
     * @throws timezonecomplete.Argument.Prev if prev is undefined
     * @throws timezonecomplete.Argument.Count if count is not an integer number
     */
    Period.prototype.findNext = function (prev, count) {
        if (count === void 0) { count = 1; }
        assert_1.default(!!prev, "Argument.Prev", "Prev must be given");
        assert_1.default(!!this._intReference.zone() === !!prev.zone(), "UnawareToAwareConversion", "The fromDate and referenceDate must both be aware or unaware");
        assert_1.default(Number.isInteger(count), "Argument.Count", "Count must be an integer number");
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
     * @throws timezonecomplete.UnawareToAwareConversion if not both `from` and the reference date are both aware or unaware of time zone
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
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
     * @throws timezonecomplete.Argument.Next if prev is undefined
     * @throws timezonecomplete.Argument.Count if count is not an integer number
     */
    Period.prototype.findPrev = function (next, count) {
        if (count === void 0) { count = 1; }
        try {
            return this.findNext(next, -1 * count);
        }
        catch (e) {
            if (error_1.errorIs(e, "Argument.Prev")) {
                e = error_1.error("Argument.Next", e.message);
            }
            throw e;
        }
    };
    /**
     * Checks whether the given date is on a period boundary
     * (expensive!)
     * @throws timezonecomplete.UnawareToAwareConversion if not both `occurrence` and the reference date are both aware or unaware of time zone
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
     */
    Period.prototype.isBoundary = function (occurrence) {
        if (!occurrence) {
            return false;
        }
        assert_1.default(!!this._intReference.zone() === !!occurrence.zone(), "UnawareToAwareConversion", "The occurrence and referenceDate must both be aware or unaware");
        return (this.findFirst(occurrence.sub(duration_1.Duration.milliseconds(1))).equals(occurrence));
    };
    /**
     * Returns true iff this period has the same effect as the given one.
     * i.e. a period of 24 hours is equal to one of 1 day if they have the same UTC reference moment
     * and same dst.
     * @throws timezonecomplete.UnawareToAwareConversion if not both `other#reference()` and the reference date are both aware or unaware
     * of time zone
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
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
     * @throws nothing
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
     * @throws nothing
     */
    Period.prototype.toIsoString = function () {
        return this._reference.toIsoString() + "/" + this._interval.toIsoString();
    };
    /**
     * A string representation e.g.
     * "10 years, referenceing at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
     * @throws nothing
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
     * Returns a JSON-compatible representation of this period
     * @throws nothing
     */
    Period.prototype.toJson = function () {
        return {
            reference: this.reference().toString(),
            duration: this.interval().toString(),
            periodDst: this.dst() === PeriodDst.RegularIntervals ? "regular" : "local"
        };
    };
    /**
     * Corrects the difference between _reference and _intReference.
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
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
/**
 * Returns true iff the given json value represents a valid period JSON
 * @param json
 * @throws nothing
 */
function isValidPeriodJson(json) {
    if (typeof json !== "object") {
        return false;
    }
    if (json === null) {
        return false;
    }
    if (typeof json.duration !== "string") {
        return false;
    }
    if (typeof json.periodDst !== "string") {
        return false;
    }
    if (typeof json.reference !== "string") {
        return false;
    }
    if (!["regular", "local"].includes(json.periodDst)) {
        return false;
    }
    try {
        // tslint:disable-next-line: no-unused-expression
        new Period(json);
    }
    catch (_a) {
        return false;
    }
    return true;
}
exports.isValidPeriodJson = isValidPeriodJson;
/**
 * Checks if a given object is of type Period. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
function isPeriod(value) {
    return typeof value === "object" && value !== null && value.kind === "Period";
}
exports.isPeriod = isPeriod;
/**
 * Returns the first timestamp >= `opts.reference` that matches the given weekday and time. Uses the time zone and DST settings
 * of the given reference time.
 * @param opts
 * @throws timezonecomplete.Argument.Hour if opts.hour out of range
 * @throws timezonecomplete.Argument.Minute if opts.minute out of range
 * @throws timezonecomplete.Argument.Second if opts.second out of range
 * @throws timezonecomplete.Argument.Millisecond if opts.millisecond out of range
 * @throws timezonecomplete.Argument.Weekday if opts.weekday out of range
 */
function timestampOnWeekTimeGreaterThanOrEqualTo(opts) {
    var _a, _b, _c;
    // tslint:disable: max-line-length
    assert_1.default(opts.hour >= 0 && opts.hour < 24, "Argument.Hour", "opts.hour should be within [0..23]");
    assert_1.default(opts.minute === undefined || (opts.minute >= 0 && opts.minute < 60 && Number.isInteger(opts.minute)), "Argument.Minute", "opts.minute should be within [0..59]");
    assert_1.default(opts.second === undefined || (opts.second >= 0 && opts.second < 60 && Number.isInteger(opts.second)), "Argument.Second", "opts.second should be within [0..59]");
    assert_1.default(opts.millisecond === undefined || (opts.millisecond >= 0 && opts.millisecond < 1000 && Number.isInteger(opts.millisecond)), "Argument.Millisecond", "opts.millisecond should be within [0.999]");
    assert_1.default(opts.weekday >= 0 && opts.weekday < 7, "Argument.Weekday", "opts.weekday should be within [0..6]");
    // tslint:enable: max-line-length
    var midnight = opts.reference.startOfDay();
    while (midnight.weekDay() !== opts.weekday) {
        midnight = midnight.addLocal(duration_1.days(1));
    }
    var dt = new datetime_1.DateTime(midnight.year(), midnight.month(), midnight.day(), opts.hour, (_a = opts.minute) !== null && _a !== void 0 ? _a : 0, (_b = opts.second) !== null && _b !== void 0 ? _b : 0, (_c = opts.millisecond) !== null && _c !== void 0 ? _c : 0, opts.reference.zone());
    if (dt < opts.reference) {
        // we've started out on the correct weekday and the reference timestamp was greater than the given time, need to skip a week
        return dt.addLocal(duration_1.days(7));
    }
    return dt;
}
exports.timestampOnWeekTimeGreaterThanOrEqualTo = timestampOnWeekTimeGreaterThanOrEqualTo;
/**
 * Returns the first timestamp < `opts.reference` that matches the given weekday and time. Uses the time zone and DST settings
 * of the given reference time.
 * @param opts
 * @throws timezonecomplete.Argument.Hour if opts.hour out of range
 * @throws timezonecomplete.Argument.Minute if opts.minute out of range
 * @throws timezonecomplete.Argument.Second if opts.second out of range
 * @throws timezonecomplete.Argument.Millisecond if opts.millisecond out of range
 * @throws timezonecomplete.Argument.Weekday if opts.weekday out of range
 */
function timestampOnWeekTimeLessThan(opts) {
    var _a, _b, _c;
    // tslint:disable: max-line-length
    assert_1.default(opts.hour >= 0 && opts.hour < 24, "Argument.Hour", "opts.hour should be within [0..23]");
    assert_1.default(opts.minute === undefined || (opts.minute >= 0 && opts.minute < 60 && Number.isInteger(opts.minute)), "Argument.Minute", "opts.minute should be within [0..59]");
    assert_1.default(opts.second === undefined || (opts.second >= 0 && opts.second < 60 && Number.isInteger(opts.second)), "Argument.Second", "opts.second should be within [0..59]");
    assert_1.default(opts.millisecond === undefined || (opts.millisecond >= 0 && opts.millisecond < 1000 && Number.isInteger(opts.millisecond)), "Argument.Millisecond", "opts.millisecond should be within [0.999]");
    assert_1.default(opts.weekday >= 0 && opts.weekday < 7, "Argument.Weekday", "opts.weekday should be within [0..6]");
    // tslint:enable: max-line-length
    var midnight = opts.reference.startOfDay().addLocal(duration_1.days(1));
    while (midnight.weekDay() !== opts.weekday) {
        midnight = midnight.subLocal(duration_1.days(1));
    }
    var dt = new datetime_1.DateTime(midnight.year(), midnight.month(), midnight.day(), opts.hour, (_a = opts.minute) !== null && _a !== void 0 ? _a : 0, (_b = opts.second) !== null && _b !== void 0 ? _b : 0, (_c = opts.millisecond) !== null && _c !== void 0 ? _c : 0, opts.reference.zone());
    if (dt >= opts.reference) {
        // we've started out on the correct weekday and the reference timestamp was less than the given time, need to skip a week
        return dt.subLocal(duration_1.days(7));
    }
    return dt;
}
exports.timestampOnWeekTimeLessThan = timestampOnWeekTimeLessThan;

},{"./assert":1,"./basics":2,"./datetime":3,"./duration":4,"./error":5,"./timezone":15}],13:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * String utility functions
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padRight = exports.padLeft = void 0;
var assert_1 = require("./assert");
/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 * @throws timezonecomplete.Argument.Width if width is not an integer number >= 0
 */
function padLeft(s, width, char) {
    assert_1.default(Number.isInteger(width) && width >= 0, "Argument.Width", "width should be an integer number >= 0 but is: %d", width);
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
 * @throws timezonecomplete.Argument.Width if width is not an integer number >= 0
 */
function padRight(s, width, char) {
    assert_1.default(Number.isInteger(width) && width >= 0, "Argument.Width", "width should be an integer number >= 0 but is: %d", width);
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return s + padding;
}
exports.padRight = padRight;

},{"./assert":1}],14:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeSource = void 0;
/**
 * Default time source, returns actual time
 */
var RealTimeSource = /** @class */ (function () {
    function RealTimeSource() {
    }
    /** @inheritdoc */
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

},{}],15:[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Time zone representation and offset calculation
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimeZone = exports.TimeZone = exports.TimeZoneKind = exports.zone = exports.utc = exports.local = void 0;
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var error_1 = require("./error");
var strings = require("./strings");
var tz_database_1 = require("./tz-database");
/**
 * The local time zone for a given date as per OS settings. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 * @throws nothing
 */
function local() {
    return TimeZone.local();
}
exports.local = local;
/**
 * Coordinated Universal Time zone. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 * @throws timezonecomplete.NotFound.Zone if the UTC zone is not present in the time zone database
 */
function utc() {
    return TimeZone.utc();
}
exports.utc = utc;
/**
 * zone() implementation
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
     * @param dst Adhere to Daylight Saving Time if applicable, ignored for local time and fixed offsets
     * @throws timezonecomplete.NotFound.Zone if the given zone name doesn't exist
     * @throws timezonecomplete.InvalidTimeZoneData if the time zone database is invalid
     */
    function TimeZone(name, dst) {
        if (dst === void 0) { dst = true; }
        /**
         * Allow not using instanceof
         */
        this.classKind = "TimeZone";
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
            assert_1.default(tz_database_1.TzDatabase.instance().exists(name), "NotFound.Zone", "non-existing time zone name '%s'", name);
        }
    }
    /**
     * The local time zone for a given date. Note that
     * the time zone varies with the date: amsterdam time for
     * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
     * @throws nothing
     */
    TimeZone.local = function () {
        return TimeZone._findOrCreate("localtime", true);
    };
    /**
     * The UTC time zone.
     * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
     */
    TimeZone.utc = function () {
        return TimeZone._findOrCreate("UTC", true); // use 'true' for DST because we want it to display as "UTC", not "UTC without DST"
    };
    /**
     * zone() implementations
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
                    assert_1.default(offset > -24 * 60 && offset < 24 * 60, "Argument.Offset", "TimeZone.zone(): offset out of range");
                    name = TimeZone.offsetToString(offset);
                }
                break;
            /* istanbul ignore next */
            default:
                error_1.throwError("Argument.A", "unexpected type for first argument: %s", typeof a);
        }
        return TimeZone._findOrCreate(name, dst);
    };
    /**
     * Makes this class appear clonable. NOTE as time zone objects are immutable you will NOT
     * actually get a clone but the same object.
     * @throws nothing
     */
    TimeZone.prototype.clone = function () {
        return this;
    };
    /**
     * The time zone identifier. Can be an offset "-01:30" or an
     * IANA time zone name "Europe/Amsterdam", or "localtime" for
     * the local time zone.
     * @throws nothing
     */
    TimeZone.prototype.name = function () {
        return this._name;
    };
    /**
     * Whether DST is enabled
     * @throws nothing
     */
    TimeZone.prototype.dst = function () {
        return this._dst;
    };
    /**
     * The kind of time zone (Local/Offset/Proper)
     * @throws nothing
     */
    TimeZone.prototype.kind = function () {
        return this._kind;
    };
    /**
     * Equality operator. Maps zero offsets and different names for UTC onto
     * each other. Other time zones are not mapped onto each other.
     * @throws timezonecomplete.InvalidTimeZoneData if the global time zone data is invalid
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
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
        }
    };
    /**
     * Returns true iff the constructor arguments were identical, so UTC !== GMT
     * @throws nothing
     */
    TimeZone.prototype.identical = function (other) {
        switch (this._kind) {
            case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
            case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
            case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper && this._name === other._name && this._dst === other._dst);
            /* istanbul ignore next */
            default:
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
        }
    };
    /**
     * Is this zone equivalent to UTC?
     * @throws timezonecomplete.InvalidTimeZoneData if the global time zone data is invalid
     */
    TimeZone.prototype.isUtc = function () {
        switch (this._kind) {
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return (this._offset === 0);
            case TimeZoneKind.Proper: return (tz_database_1.TzDatabase.instance().zoneIsUtc(this._name));
            /* istanbul ignore next */
            default:
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
        }
    };
    /**
     * Does this zone have Daylight Saving Time at all?
     * @throws timezonecomplete.InvalidTimeZoneData if the global time zone data is invalid
     */
    TimeZone.prototype.hasDst = function () {
        switch (this._kind) {
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return false;
            case TimeZoneKind.Proper: return (tz_database_1.TzDatabase.instance().hasDst(this._name));
            /* istanbul ignore next */
            default:
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
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
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
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
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
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
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
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
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
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
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
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
                // istanbul ignore next
                return error_1.throwError("Assertion", "unknown time zone kind");
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
     * @throws nothing
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
     * @throws Argument.Offset if offset is not a finite number or not within -24 * 60 ... +24 * 60 minutes
     */
    TimeZone.offsetToString = function (offset) {
        assert_1.default(Number.isFinite(offset) && offset >= -24 * 60 && offset <= 24 * 60, "Argument.Offset", "invalid offset %d", offset);
        var sign = (offset < 0 ? "-" : "+");
        var hours = Math.floor(Math.abs(offset) / 60);
        var minutes = Math.floor(Math.abs(offset) % 60);
        return sign + strings.padLeft(hours.toString(10), 2, "0") + ":" + strings.padLeft(minutes.toString(10), 2, "0");
    };
    /**
     * String to offset conversion.
     * @param s	Formats: "-01:00", "-0100", "-01", "Z"
     * @return offset w.r.t. UTC in minutes
     * @throws timezonecomplete.Argument.S if s cannot be parsed
     */
    TimeZone.stringToOffset = function (s) {
        var t = s.trim();
        // easy case
        if (t === "Z") {
            return 0;
        }
        // check that the remainder conforms to ISO time zone spec
        assert_1.default(t.match(/^[+-]\d$/) || t.match(/^[+-]\d\d$/) || t.match(/^[+-]\d\d(:?)\d\d$/), "Argument.S", "Wrong time zone format: \"" + t + "\"");
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
        assert_1.default(hours >= 0 && hours < 24, "Argument.S", "Invalid time zone (hours out of range): '" + t + "'");
        assert_1.default(minutes >= 0 && minutes < 60, "Argument.S", "Invalid time zone (minutes out of range): '" + t + "'");
        return sign * (hours * 60 + minutes);
    };
    /**
     * Find in cache or create zone
     * @param name	Time zone name
     * @param dst	Adhere to Daylight Saving Time?
     * @throws timezonecomplete.NotFound.Zone if the zone doesn't exist in the time zone database
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
     * Normalize a string so it can be used as a key for a cache lookup
     * @throws Argument.S if s is empty
     */
    TimeZone._normalizeString = function (s) {
        var t = s.trim();
        assert_1.default(t.length > 0, "Argument.S", "Empty time zone string given");
        if (t === "localtime") {
            return t;
        }
        else if (t === "Z") {
            return "+00:00";
        }
        else if (TimeZone._isOffsetString(t)) {
            // offset string
            // normalize by converting back and forth
            try {
                return TimeZone.offsetToString(TimeZone.stringToOffset(t));
            }
            catch (e) {
                if (error_1.errorIs(e, "Argument.Offset")) {
                    e = error_1.error("Argument.S", e.message);
                }
                throw e;
            }
        }
        else {
            // Olsen TZ database name
            return t;
        }
    };
    /**
     * Returns true iff the first non-whitespace character of s is +, -, or Z
     * @param s
     * @throws nothing
     */
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
/**
 * Checks if a given object is of type TimeZone. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
function isTimeZone(value) {
    return typeof value === "object" && value !== null && value.classKind === "TimeZone";
}
exports.isTimeZone = isTimeZone;

},{"./assert":1,"./basics":2,"./error":5,"./strings":13,"./tz-database":17}],16:[function(require,module,exports){
/**
 * Functionality to parse a DateTime object to a string
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.TokenType = void 0;
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
 * @throws nothing
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

},{}],17:[function(require,module,exports){
(function (global){(function (){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Olsen Timezone Database container
 *
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 */
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TzDatabase = exports.NormalizeOption = exports.Transition = exports.isValidOffsetString = exports.ZoneInfo = exports.RuleType = exports.RuleInfo = exports.AtType = exports.OnType = exports.ToType = void 0;
var assert_1 = require("./assert");
var basics_1 = require("./basics");
var basics = require("./basics");
var duration_1 = require("./duration");
var error_1 = require("./error");
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
    /**
     * Constructor
     * @param from
     * @param toType
     * @param toYear
     * @param type
     * @param inMonth
     * @param onType
     * @param onDay
     * @param onWeekDay
     * @param atHour
     * @param atMinute
     * @param atSecond
     * @param atType
     * @param save
     * @param letter
     * @throws nothing
     */
    function RuleInfo(
    /**
     * FROM column year number.
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
     * @throws nothing
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
     * @throws timezonecomplete.InvalidTimeZoneData if this rule depends on a weekday and the weekday in question doesn't exist
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
     * @throws timezonecomplete.InvalidTimeZoneData for invalid internal structure of the database
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
     * Returns the year-relative date that the rule takes effect. Depending on the rule this can be a UTC time, a wall clock time, or a
     * time in standard offset (i.e. you still need to compensate for this.atType)
     * @throws timezonecomplete.NotApplicable if this rule is not applicable in the given year
     */
    RuleInfo.prototype.effectiveDate = function (year) {
        assert_1.default(this.applicable(year), "timezonecomplete.NotApplicable", "Rule is not applicable in %d", year);
        // year and month are given
        var y = year;
        var m = this.inMonth;
        var d = 0;
        // calculate day
        switch (this.onType) {
            case OnType.DayNum:
                {
                    d = this.onDay;
                }
                break;
            case OnType.GreqX:
                {
                    try {
                        d = basics.weekDayOnOrAfter(y, m, this.onDay, this.onWeekDay);
                    }
                    catch (e) {
                        if (error_1.errorIs(e, "NotFound")) {
                            // Apr Sun>=27 actually means any sunday after April 27, i.e. it does not have to be in April. Try next month.
                            if (m + 1 <= 12) {
                                m = m + 1;
                            }
                            else {
                                m = 1;
                                y = y + 1;
                            }
                            d = basics.firstWeekDayOfMonth(y, m, this.onWeekDay);
                        }
                    }
                }
                break;
            case OnType.LeqX:
                {
                    try {
                        d = basics.weekDayOnOrBefore(y, m, this.onDay, this.onWeekDay);
                    }
                    catch (e) {
                        if (error_1.errorIs(e, "NotFound")) {
                            if (m > 1) {
                                m = m - 1;
                            }
                            else {
                                m = 12;
                                y = y - 1;
                            }
                            d = basics.lastWeekDayOfMonth(y, m, this.onWeekDay);
                        }
                    }
                }
                break;
            case OnType.LastX:
                {
                    d = basics.lastWeekDayOfMonth(y, m, this.onWeekDay);
                }
                break;
        }
        return basics_1.TimeStruct.fromComponents(y, m, d, this.atHour, this.atMinute, this.atSecond);
    };
    /**
     * Effective date in UTC in the given year, in a specific time zone
     * @param year
     * @param standardOffset the standard offset from UT of the time zone
     * @param dstOffset the DST offset before the rule
     */
    RuleInfo.prototype.effectiveDateUtc = function (year, standardOffset, dstOffset) {
        var d = this.effectiveDate(year);
        switch (this.atType) {
            case AtType.Utc: return d;
            case AtType.Standard: {
                // transition time is in zone local time without DST
                var millis = d.unixMillis;
                millis -= standardOffset.milliseconds();
                return new basics_1.TimeStruct(millis);
            }
            case AtType.Wall: {
                // transition time is in zone local time with DST
                var millis = d.unixMillis;
                millis -= standardOffset.milliseconds();
                if (dstOffset) {
                    millis -= dstOffset.milliseconds();
                }
                return new basics_1.TimeStruct(millis);
            }
        }
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
    /**
     * Constructor
     * @param gmtoff
     * @param ruleType
     * @param ruleOffset
     * @param ruleName
     * @param format
     * @param until
     * @throws nothing
     */
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
/**
 * Turns a month name from the TZ database into a number 1-12
 * @param name
 * @throws timezonecomplete.InvalidTimeZoneData for invalid month name
 */
function monthNameToNumber(name) {
    for (var i = 1; i <= 12; ++i) {
        if (TzMonthNames[i] === name) {
            return i;
        }
    }
    return error_1.throwError("InvalidTimeZoneData", "Invalid month name '%s'", name);
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
 * @throws nothing
 */
function isValidOffsetString(s) {
    return /^(\-|\+)?([0-9]+((\:[0-9]+)?(\:[0-9]+(\.[0-9]+)?)?))$/.test(s);
}
exports.isValidOffsetString = isValidOffsetString;
/**
 * Defines a moment at which the given rule becomes valid
 */
var Transition = /** @class */ (function () {
    /**
     * Constructor
     * @param at
     * @param offset
     * @param letter
     * @throws nothing
     */
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
     * @throws AlreadyCreated if an instance already exists
     * @throws timezonecomplete.InvalidTimeZoneData if `data` is empty or invalid
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
        /**
         * pre-calculated transitions per zone
         */
        this._zoneTransitionsCache = new Map();
        /**
         * pre-calculated transitions per ruleset
         */
        this._ruleTransitionsCache = new Map();
        assert_1.default(!TzDatabase._instance, "AlreadyCreated", "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        assert_1.default(data.length > 0, "InvalidTimeZoneData", "Timezonecomplete needs time zone data. You need to install one of the tzdata NPM modules before using timezonecomplete.");
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
     * @throws timezonecomplete.InvalidTimeZoneData if `data` or the global time zone data is invalid
     */
    TzDatabase.init = function (data) {
        TzDatabase._instance = undefined; // needed for assert in constructor
        if (data) {
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
     * @throws timezonecomplete.InvalidTimeZoneData if the global time zone data is invalid
     */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            TzDatabase.init();
        }
        return TzDatabase._instance;
    };
    /**
     * Returns a sorted list of all zone names
     * @throws nothing
     */
    TzDatabase.prototype.zoneNames = function () {
        if (!this._zoneNames) {
            this._zoneNames = Object.keys(this._data.zones);
            this._zoneNames.sort();
        }
        return this._zoneNames;
    };
    /**
     * Returns true iff the given zone name exists
     * @param zoneName
     * @throws nothing
     */
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
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.minDstSave = function (zoneName) {
        try {
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
                    if (zoneInfo.ruleType === RuleType.RuleName && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
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
        }
        catch (e) {
            if (error_1.errorIs(e, ["NotFound.Rule", "Argument.N"])) {
                e = error_1.error("InvalidTimeZoneData", e.message);
            }
            throw e;
        }
    };
    /**
     * Maximum DST offset (which excludes standard offset) of all rules in the database.
     * Note that DST offsets need not be whole hours.
     *
     * Returns 0 if zoneName given and no DST observed.
     *
     * @param zoneName	(optional) if given, the result for the given zone is returned
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.maxDstSave = function (zoneName) {
        try {
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
        }
        catch (e) {
            if (error_1.errorIs(e, ["NotFound.Rule", "Argument.N"])) {
                e = error_1.error("InvalidTimeZoneData", e.message);
            }
            throw e;
        }
    };
    /**
     * Checks whether the zone has DST at all
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.hasDst = function (zoneName) {
        return (this.maxDstSave(zoneName).milliseconds() !== 0);
    };
    TzDatabase.prototype.nextDstChange = function (zoneName, a) {
        var utcTime = (typeof a === "number" ? new basics_1.TimeStruct(a) : a);
        var zone = this._getZoneTransitions(zoneName);
        var iterator = zone.findFirst();
        if (iterator && iterator.transition.atUtc > utcTime) {
            return iterator.transition.atUtc.unixMillis;
        }
        while (iterator) {
            iterator = zone.findNext(iterator);
            if (iterator && iterator.transition.atUtc > utcTime) {
                return iterator.transition.atUtc.unixMillis;
            }
        }
        return undefined;
    };
    /**
     * Returns true iff the given zone name eventually links to
     * "Etc/UTC", "Etc/GMT" or "Etc/UCT" in the TZ database. This is true e.g. for
     * "UTC", "GMT", "Etc/GMT" etc.
     *
     * @param zoneName	IANA time zone name.
     * @throws nothing
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
            // todo replace getTransitionsTotalOffsets() by direct use of this._getZoneTransitions()
            var transitions = this.getTransitionsTotalOffsets(zoneName, localTime.components.year - 1, localTime.components.year + 1);
            // find the DST forward transitions
            var prev = duration_1.Duration.hours(0);
            for (var _i = 0, transitions_1 = transitions; _i < transitions_1.length; _i++) {
                var transition = transitions_1[_i];
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
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
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
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.totalOffset = function (zoneName, utcTime) {
        var u = typeof utcTime === "number" ? new basics_1.TimeStruct(utcTime) : utcTime;
        var zone = this._getZoneTransitions(zoneName);
        var state = zone.stateAt(u);
        return state.dstOffset.add(state.standardOffset);
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
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.abbreviation = function (zoneName, utcTime, dstDependent) {
        if (dstDependent === void 0) { dstDependent = true; }
        var u = typeof utcTime === "number" ? new basics_1.TimeStruct(utcTime) : utcTime;
        var zone = this._getZoneTransitions(zoneName);
        if (dstDependent) {
            var state = zone.stateAt(u);
            return state.abbreviation;
        }
        else {
            var lastNonDst = zone.initialState.dstOffset.milliseconds() === 0 ? zone.initialState.abbreviation : "";
            var iterator = zone.findFirst();
            if ((iterator === null || iterator === void 0 ? void 0 : iterator.transition.newState.dstOffset.milliseconds()) === 0) {
                lastNonDst = iterator.transition.newState.abbreviation;
            }
            while (iterator && iterator.transition.atUtc <= u) {
                iterator = zone.findNext(iterator);
                if ((iterator === null || iterator === void 0 ? void 0 : iterator.transition.newState.dstOffset.milliseconds()) === 0) {
                    lastNonDst = iterator.transition.newState.abbreviation;
                }
            }
            return lastNonDst;
        }
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
     * @throws timezonecomplete.NotFound.Zone if zoneName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
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
            return error_1.throwError("InvalidTimeZoneData", "No zone info found");
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
     * @throws timezonecomplete.NotFound.Zone if zoneName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
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
        for (var _i = 0, transitions_2 = transitions; _i < transitions_2.length; _i++) {
            var transition = transitions_2[_i];
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
     * DEPRECATED because DST offset depends on the zone too, not just on the ruleset
     * Returns the DST offset (WITHOUT the standard zone offset) for the given ruleset and the given UTC timestamp
     *
     * @deprecated
     * @param ruleName	name of ruleset
     * @param utcTime	UTC timestamp
     * @param standardOffset	Standard offset without DST for the time zone
     * @throws timezonecomplete.NotFound.Rule if ruleName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
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
     * @deprecated
     * @param ruleName	name of ruleset
     * @param utcTime	UTC timestamp as TimeStruct or unix millis
     * @param standardOffset	Standard offset without DST for the time zone
     * @throws timezonecomplete.NotFound.Rule if ruleName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
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
     * DEPRECATED because DST offset depends on the zone too, not just on the ruleset
     * Return a list of all transitions in [fromYear..toYear] sorted by effective date
     *
     * @deprecated
     * @param ruleName	Name of the rule set
     * @param fromYear	first year to return transitions for
     * @param toYear	Last year to return transitions for
     * @param standardOffset	Standard offset without DST for the time zone
     *
     * @return Transitions, with DST offsets (no standard offset included)
     * @throws timezonecomplete.Argument.FromYear if fromYear > toYear
     * @throws timezonecomplete.NotFound.Rule if ruleName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
     */
    TzDatabase.prototype.getTransitionsDstOffsets = function (ruleName, fromYear, toYear, standardOffset) {
        assert_1.default(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
        var rules = this._getRuleTransitions(ruleName);
        var result = [];
        var prevDst = duration_1.hours(0); // wrong, but that's why the function is deprecated
        var iterator = rules.findFirst();
        while (iterator && iterator.transition.at.year <= toYear) {
            if (iterator.transition.at.year >= fromYear && iterator.transition.at.year <= toYear) {
                result.push({
                    at: ruleTransitionUtc(iterator.transition, standardOffset, prevDst).unixMillis,
                    letter: iterator.transition.newState.letter || "",
                    offset: iterator.transition.newState.dstOffset
                });
            }
            prevDst = iterator.transition.newState.dstOffset;
            iterator = rules.findNext(iterator);
        }
        result.sort(function (a, b) {
            return a.at - b.at;
        });
        return result;
    };
    /**
     * Return both zone and rule changes as total (std + dst) offsets.
     * Adds an initial transition if there is none within the range.
     *
     * @param zoneName	IANA zone name
     * @param fromYear	First year to include
     * @param toYear	Last year to include
     * @throws timezonecomplete.Argument.FromYear if fromYear > toYear
     * @throws timezonecomplete.NotFound.Zone if zoneName not found
     * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
     */
    TzDatabase.prototype.getTransitionsTotalOffsets = function (zoneName, fromYear, toYear) {
        assert_1.default(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
        var zone = this._getZoneTransitions(zoneName);
        var result = [];
        var startState = zone.stateAt(new basics_1.TimeStruct({ year: fromYear, month: 1, day: 1 }));
        result.push({
            at: new basics_1.TimeStruct({ year: fromYear }).unixMillis,
            letter: startState.letter,
            offset: startState.dstOffset.add(startState.standardOffset)
        });
        var iterator = zone.findFirst();
        while (iterator && iterator.transition.atUtc.year <= toYear) {
            if (iterator.transition.atUtc.year >= fromYear) {
                result.push({
                    at: iterator.transition.atUtc.unixMillis,
                    letter: iterator.transition.newState.letter || "",
                    offset: iterator.transition.newState.dstOffset.add(iterator.transition.newState.standardOffset)
                });
            }
            iterator = zone.findNext(iterator);
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
     * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
     * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
     */
    TzDatabase.prototype.getZoneInfo = function (zoneName, utcTime) {
        var unixMillis = (typeof utcTime === "number" ? utcTime : utcTime.unixMillis);
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var _i = 0, zoneInfos_4 = zoneInfos; _i < zoneInfos_4.length; _i++) {
            var zoneInfo = zoneInfos_4[_i];
            if (zoneInfo.until === undefined || zoneInfo.until > unixMillis) {
                return zoneInfo;
            }
        }
        return error_1.throwError("NotFound.Zone", "no zone info found for zone '%s'", zoneName);
    };
    /**
     * Return the zone records for a given zone name sorted by UNTIL, after
     * following any links.
     *
     * @param zoneName	IANA zone name like "Pacific/Efate"
     * @return Array of zone infos. Do not change, this is a cached value.
     * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
     */
    TzDatabase.prototype.getZoneInfos = function (zoneName) {
        // FIRST validate zone name before searching cache
        /* istanbul ignore if */
        assert_1.default(this._data.zones.hasOwnProperty(zoneName), "NotFound.Zone", "zone not found: '%s'", zoneName);
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
                return error_1.throwError("NotFound.Zone", "Zone \"" + zoneEntries + "\" not found (referred to in link from \""
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
     * @throws timezonecomplete.NotFound.Rule if rule not found
     * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
     */
    TzDatabase.prototype.getRuleInfos = function (ruleName) {
        // validate name BEFORE searching cache
        assert_1.default(this._data.rules.hasOwnProperty(ruleName), "NotFound.Rule", "Rule set \"" + ruleName + "\" not found.");
        // return from cache
        if (this._ruleInfoCache.hasOwnProperty(ruleName)) {
            return this._ruleInfoCache[ruleName];
        }
        try {
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
                var monthNumber = monthNameToNumber(monthName);
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
        }
        catch (e) {
            if (error_1.errorIs(e, ["Argument.To", "Argument.N", "Argument.Value", "Argument.Amount"])) {
                e = error_1.error("InvalidTimeZoneData", e.message);
            }
            throw e;
        }
    };
    /**
     * Parse the RULES column of a zone info entry
     * and see what kind of entry it is.
     * @throws nothing
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
     * @throws timezonecomplete.Argument.To for invalid TO
     */
    TzDatabase.prototype.parseToType = function (to) {
        // istanbul ignore else
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
            return error_1.throwError("Argument.To", "TO column incorrect: %s", to);
        }
    };
    /**
     * Parse the ON column of a rule info entry
     * and see what kind of entry it is.
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
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
     * @throws nothing
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
     * Get pre-calculated zone transitions
     * @param zoneName
     * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
     * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
     */
    TzDatabase.prototype._getZoneTransitions = function (zoneName) {
        var result = this._zoneTransitionsCache.get(zoneName);
        if (!result) {
            result = new CachedZoneTransitions(zoneName, this.getZoneInfos(zoneName), this._getRuleTransitionsForZone(zoneName));
            this._zoneTransitionsCache.set(zoneName, result);
        }
        return result;
    };
    /**
     * Get pre-calculated rule transitions
     * @param ruleName
     * @throws timezonecomplete.NotFound.Rule if rule not found
     * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
     */
    TzDatabase.prototype._getRuleTransitions = function (ruleName) {
        var result = this._ruleTransitionsCache.get(ruleName);
        if (!result) {
            result = new CachedRuleTransitions(this.getRuleInfos(ruleName));
            this._ruleTransitionsCache.set(ruleName, result);
        }
        return result;
    };
    /**
     * Returns a map of ruleName->CachedRuleTransitions for all rule sets that are referenced by a zone
     * @param zoneName
     * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
     * @throws timezonecomplete.NotFound.Rule if rule not found
     * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
     */
    TzDatabase.prototype._getRuleTransitionsForZone = function (zoneName) {
        var result = new Map();
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var _i = 0, zoneInfos_5 = zoneInfos; _i < zoneInfos_5.length; _i++) {
            var zoneInfo = zoneInfos_5[_i];
            if (zoneInfo.ruleType === RuleType.RuleName) {
                if (!result.has(zoneInfo.ruleName)) {
                    result.set(zoneInfo.ruleName, this._getRuleTransitions(zoneInfo.ruleName));
                }
            }
        }
        return result;
    };
    return TzDatabase;
}());
exports.TzDatabase = TzDatabase;
/**
 * Sanity check on data. Returns min/max values.
 * @throws timezonecomplete.InvalidTimeZoneData for invalid data
 */
function validateData(data) {
    var result = {};
    assert_1.default(typeof data === "object", "InvalidTimeZoneData", "time zone data should be an object");
    assert_1.default(data.hasOwnProperty("rules"), "InvalidTimeZoneData", "time zone data should be an object with a 'rules' property");
    assert_1.default(data.hasOwnProperty("zones"), "InvalidTimeZoneData", "time zone data should be an object with a 'zones' property");
    // validate zones
    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                assert_1.default(data.zones.hasOwnProperty(zoneArr), "InvalidTimeZoneData", "Entry for zone \"%s\" links to \"%s\" but that doesn\'t exist", zoneName, zoneArr);
            }
            else {
                /* istanbul ignore if */
                if (!Array.isArray(zoneArr)) {
                    return error_1.throwError("InvalidTimeZoneData", "Entry for zone \"%s\" is neither a string nor an array", zoneName);
                }
                for (var i = 0; i < zoneArr.length; i++) {
                    var entry = zoneArr[i];
                    /* istanbul ignore if */
                    if (!Array.isArray(entry)) {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
                    }
                    /* istanbul ignore if */
                    if (entry.length !== 4) {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[0] !== "string") {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
                    }
                    var gmtoff = math.filterFloat(entry[0]);
                    /* istanbul ignore if */
                    if (isNaN(gmtoff)) {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[1] !== "string") {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[2] !== "string") {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] !== "string" && entry[3] !== null) {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
                        return error_1.throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
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
                return error_1.throwError("InvalidTimeZoneData", "Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (var i = 0; i < ruleArr.length; i++) {
                var rule = ruleArr[i];
                /* istanbul ignore if */
                if (!Array.isArray(rule)) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
                }
                /* istanbul ignore if */
                if (rule.length < 8) { // note some rules > 8 exists but that seems to be a bug in tz file parsing
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
                }
                for (var j = 0; j < rule.length; j++) {
                    /* istanbul ignore if */
                    if (j !== 5 && typeof rule[j] !== "string") {
                        return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
                    }
                }
                /* istanbul ignore if */
                if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
                }
                /* istanbul ignore if */
                if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
                }
                /* istanbul ignore if */
                if (!TzMonthNames.hasOwnProperty(rule[3])) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
                }
                /* istanbul ignore if */
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
                    && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
                }
                /* istanbul ignore if */
                if (!Array.isArray(rule[5])) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
                }
                /* istanbul ignore if */
                if (rule[5].length !== 4) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][0], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][1], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][2], 10))) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
                }
                /* istanbul ignore if */
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
                    && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
                }
                var save = parseInt(rule[6], 10);
                /* istanbul ignore if */
                if (isNaN(save)) {
                    return error_1.throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
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
/**
 * Ready-made sorted rule transitions (uncompensated for stdoffset, as rules are used by multiple zones with different offsets)
 */
var CachedRuleTransitions = /** @class */ (function () {
    /**
     * Constructor
     * @param ruleInfos
     */
    function CachedRuleTransitions(ruleInfos) {
        // determine maximum year to calculate transitions for
        var maxYear;
        for (var _i = 0, ruleInfos_1 = ruleInfos; _i < ruleInfos_1.length; _i++) {
            var ruleInfo = ruleInfos_1[_i];
            if (ruleInfo.toType === ToType.Year) {
                if (maxYear === undefined || ruleInfo.toYear > maxYear) {
                    maxYear = ruleInfo.toYear;
                }
                if (maxYear === undefined || ruleInfo.from > maxYear) {
                    maxYear = ruleInfo.from;
                }
            }
        }
        // calculate all transitions until 'max' rules take effect
        this._transitions = [];
        for (var _a = 0, ruleInfos_2 = ruleInfos; _a < ruleInfos_2.length; _a++) {
            var ruleInfo = ruleInfos_2[_a];
            var min = ruleInfo.from;
            var max = ruleInfo.toType === ToType.Year ? ruleInfo.toYear : maxYear;
            if (max !== undefined) {
                for (var year = min; year <= max; ++year) {
                    this._transitions.push({
                        at: ruleInfo.effectiveDate(year),
                        atType: ruleInfo.atType,
                        newState: {
                            dstOffset: ruleInfo.save,
                            letter: ruleInfo.letter
                        }
                    });
                }
            }
        }
        // sort transitions
        this._transitions = this._transitions.sort(function (a, b) {
            return (a.at < b.at ? -1 :
                a.at > b.at ? 1 :
                    0);
        });
        // save the 'max' rules for transitions after that
        this._finalRulesByFromEffective = ruleInfos.filter(function (info) { return info.toType === ToType.Max; });
        this._finalRulesByEffective = __spreadArrays(this._finalRulesByFromEffective);
        // sort final rules by FROM and then by year-relative date
        this._finalRulesByFromEffective = this._finalRulesByFromEffective.sort(function (a, b) {
            if (a.from < b.from) {
                return -1;
            }
            if (a.from > b.from) {
                return 1;
            }
            var ae = a.effectiveDate(a.from);
            var be = b.effectiveDate(b.from);
            return (ae < be ? -1 :
                ae > be ? 1 :
                    0);
        });
        // sort final rules by year-relative date
        this._finalRulesByEffective = this._finalRulesByFromEffective.sort(function (a, b) {
            var ae = a.effectiveDate(a.from);
            var be = b.effectiveDate(b.from);
            return (ae < be ? -1 :
                ae > be ? 1 :
                    0);
        });
    }
    Object.defineProperty(CachedRuleTransitions.prototype, "final", {
        /**
         * The 'max' type rules at the end, sorted by year-relative effective date
         */
        get: function () {
            return this._finalRulesByEffective;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the first ever transition as defined by the rule set
     */
    CachedRuleTransitions.prototype.findFirst = function () {
        if (this._transitions.length > 0) {
            var transition = this._transitions[0];
            var iterator = {
                transition: transition,
                index: 0
            };
            return iterator;
        }
        if (this._finalRulesByFromEffective.length > 0) {
            var rule = this._finalRulesByFromEffective[0];
            var transition = {
                at: rule.effectiveDate(rule.from),
                atType: rule.atType,
                newState: {
                    dstOffset: rule.save,
                    letter: rule.letter
                }
            };
            var iterator = {
                transition: transition,
                final: true
            };
            return iterator;
        }
        return undefined;
    };
    /**
     * Returns the next transition, given an iterator
     * @param prev the iterator
     */
    CachedRuleTransitions.prototype.findNext = function (prev) {
        if (!prev.final && prev.index !== undefined) {
            if (prev.index < this._transitions.length - 1) {
                var transition = this._transitions[prev.index + 1];
                var iterator = {
                    transition: transition,
                    index: prev.index + 1
                };
                return iterator;
            }
        }
        // find minimum applicable final rule after the prev transition
        var found;
        var foundEffective;
        for (var year = prev.transition.at.year; year < prev.transition.at.year + 2; ++year) {
            for (var _i = 0, _a = this._finalRulesByEffective; _i < _a.length; _i++) {
                var rule = _a[_i];
                if (rule.applicable(year)) {
                    var effective = rule.effectiveDate(year);
                    if (effective > prev.transition.at && (!foundEffective || effective < foundEffective)) {
                        found = rule;
                        foundEffective = effective;
                    }
                }
            }
        }
        if (found && foundEffective) {
            var transition = {
                at: foundEffective,
                atType: found.atType,
                newState: {
                    dstOffset: found.save,
                    letter: found.letter
                }
            };
            var iterator = {
                transition: transition,
                final: true
            };
            return iterator;
        }
        return undefined;
    };
    /**
     * Dirty find function that only takes a standard offset from UTC into account
     * @param beforeUtc timestamp to search for
     * @param standardOffset zone standard offset to apply
     */
    CachedRuleTransitions.prototype.findLastLessEqual = function (beforeUtc, standardOffset) {
        var prevTransition;
        var iterator = this.findFirst();
        var effectiveUtc = (iterator === null || iterator === void 0 ? void 0 : iterator.transition) ? ruleTransitionUtc(iterator.transition, standardOffset, undefined) : undefined;
        while (iterator && effectiveUtc && effectiveUtc <= beforeUtc) {
            prevTransition = iterator.transition;
            iterator = this.findNext(iterator);
            effectiveUtc = (iterator === null || iterator === void 0 ? void 0 : iterator.transition) ? ruleTransitionUtc(iterator.transition, standardOffset, undefined) : undefined;
        }
        return prevTransition;
    };
    /**
     *
     * @param afterUtc
     * @param standardOffset
     * @param dstOffset
     */
    CachedRuleTransitions.prototype.firstTransitionWithoutDstAfter = function (afterUtc, standardOffset, dstOffset) {
        var _a;
        // todo inefficient - optimize
        var iterator = this.findFirst();
        var effectiveUtc = (iterator === null || iterator === void 0 ? void 0 : iterator.transition) ? ruleTransitionUtc(iterator === null || iterator === void 0 ? void 0 : iterator.transition, standardOffset, dstOffset) : undefined;
        while (iterator && effectiveUtc && (!((_a = iterator === null || iterator === void 0 ? void 0 : iterator.transition) === null || _a === void 0 ? void 0 : _a.newState.dstOffset.zero()) || effectiveUtc <= afterUtc)) {
            iterator = this.findNext(iterator);
            effectiveUtc = (iterator === null || iterator === void 0 ? void 0 : iterator.transition) ? ruleTransitionUtc(iterator === null || iterator === void 0 ? void 0 : iterator.transition, standardOffset, dstOffset) : undefined;
        }
        return iterator === null || iterator === void 0 ? void 0 : iterator.transition;
    };
    return CachedRuleTransitions;
}());
/**
 * Rules depend on previous rules, hence you cannot calculate DST transitions witout starting at the start.
 * Next to that, zones sometimes transition into the middle of a rule set.
 * Due to this, we maintain a cache of transitions for zones
 */
var CachedZoneTransitions = /** @class */ (function () {
    /**
     * Constructor
     * @param zoneName
     * @param zoneInfos
     * @param rules
     * @throws timezonecomplete.InvalidTimeZoneData
     * @throws timezonecomplete.Argument.ZoneInfos if zoneInfos is empty
     */
    function CachedZoneTransitions(zoneName, zoneInfos, rules) {
        var _a;
        assert_1.default(zoneInfos.length > 0, "timezonecomplete.Argument.ZoneInfos", "zone '%s' without information", zoneName);
        this._finalZoneInfo = zoneInfos[zoneInfos.length - 1];
        this._initialState = this._calcInitialState(zoneName, zoneInfos, rules);
        _a = this._calcTransitions(zoneName, this._initialState, zoneInfos, rules), this._transitions = _a[0], this._finalRules = _a[1];
    }
    Object.defineProperty(CachedZoneTransitions.prototype, "initialState", {
        get: function () {
            return this._initialState;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Find the first transition, if it exists
     */
    CachedZoneTransitions.prototype.findFirst = function () {
        if (this._transitions.length > 0) {
            return {
                transition: this._transitions[0],
                index: 0
            };
        }
        return undefined;
    };
    /**
     * Find next transition, if it exists
     * @param iterator previous iterator
     * @returns the next iterator
     */
    CachedZoneTransitions.prototype.findNext = function (iterator) {
        if (!iterator.final) {
            if (iterator.index < this._transitions.length - 1) {
                return {
                    transition: this._transitions[iterator.index + 1],
                    index: iterator.index + 1
                };
            }
        }
        var found;
        for (var y = iterator.transition.atUtc.year; y < iterator.transition.atUtc.year + 2; ++y) {
            for (var _i = 0, _a = this._finalRules; _i < _a.length; _i++) {
                var ruleInfo = _a[_i];
                if (ruleInfo.applicable(y)) {
                    var transition = {
                        atUtc: ruleInfo.effectiveDateUtc(y, iterator.transition.newState.standardOffset, iterator.transition.newState.dstOffset),
                        newState: {
                            abbreviation: zoneAbbreviation(this._finalZoneInfo.format, ruleInfo.save.nonZero(), ruleInfo.letter),
                            letter: ruleInfo.letter,
                            dstOffset: ruleInfo.save,
                            standardOffset: iterator.transition.newState.standardOffset
                        }
                    };
                    if (transition.atUtc > iterator.transition.atUtc) {
                        if (!found || found.atUtc > transition.atUtc) {
                            found = transition;
                        }
                    }
                }
            }
        }
        if (found) {
            return {
                transition: found,
                index: 0,
                final: true
            };
        }
        return undefined;
    };
    /**
     * Returns the zone state at the given UTC time
     * @param utc
     */
    CachedZoneTransitions.prototype.stateAt = function (utc) {
        var prevState = this._initialState;
        var iterator = this.findFirst();
        while (iterator && iterator.transition.atUtc <= utc) {
            prevState = iterator.transition.newState;
            iterator = this.findNext(iterator);
        }
        return prevState;
    };
    /**
     * Calculate the initial state for the zone
     * @param zoneName
     * @param infos
     * @param rules
     * @throws timezonecomplete.InvalidTimeZoneData
     */
    CachedZoneTransitions.prototype._calcInitialState = function (zoneName, infos, rules) {
        var _a;
        // initial state
        if (infos.length === 0) {
            return {
                abbreviation: "",
                letter: "",
                dstOffset: duration_1.hours(0),
                standardOffset: duration_1.hours(0)
            };
        }
        var info = infos[0];
        switch (info.ruleType) {
            case RuleType.None:
                return {
                    abbreviation: zoneAbbreviation(info.format, false, undefined),
                    letter: "",
                    dstOffset: duration_1.hours(0),
                    standardOffset: info.gmtoff
                };
            case RuleType.Offset:
                return {
                    abbreviation: zoneAbbreviation(info.format, info.ruleOffset.nonZero(), undefined),
                    letter: "",
                    dstOffset: info.ruleOffset,
                    standardOffset: info.gmtoff
                };
            case RuleType.RuleName: {
                var rule = rules.get(info.ruleName);
                if (!rule) {
                    error_1.throwError("InvalidTimeZoneData", "zone '%s' refers to non-existing rule '%s'", zoneName, info.ruleName);
                }
                // find first rule transition without DST so that we have a letter
                var iterator = rule.findFirst();
                while (iterator && iterator.transition.newState.dstOffset.nonZero()) {
                    iterator = rule.findNext(iterator);
                }
                var letter = (_a = iterator === null || iterator === void 0 ? void 0 : iterator.transition.newState.letter) !== null && _a !== void 0 ? _a : "";
                return {
                    abbreviation: zoneAbbreviation(info.format, false, letter),
                    dstOffset: duration_1.hours(0),
                    letter: letter,
                    standardOffset: info.gmtoff
                };
            }
            default:
                assert_1.default(false, "timezonecomplete.Assertion", "Unknown RuleType");
        }
    };
    /**
     * Pre-calculate all transitions until there are only 'max' rules in effect
     * @param zoneName
     * @param initialState
     * @param zoneInfos
     * @param rules
     */
    CachedZoneTransitions.prototype._calcTransitions = function (zoneName, initialState, zoneInfos, rules) {
        var _a;
        if (zoneInfos.length === 0) {
            return [[], []];
        }
        // walk through the zone records and add a transition for each
        var transitions = [];
        var prevState = initialState;
        var prevUntil;
        var prevRules;
        for (var _i = 0, zoneInfos_6 = zoneInfos; _i < zoneInfos_6.length; _i++) {
            var zoneInfo = zoneInfos_6[_i];
            // zones can have a DST offset or they can refer to a rule set
            switch (zoneInfo.ruleType) {
                case RuleType.None:
                case RuleType.Offset:
                    {
                        if (prevUntil) {
                            transitions.push({
                                atUtc: prevUntil,
                                newState: {
                                    abbreviation: zoneAbbreviation(zoneInfo.format, false, undefined),
                                    letter: "",
                                    dstOffset: zoneInfo.ruleType === RuleType.None ? duration_1.hours(0) : zoneInfo.ruleOffset,
                                    standardOffset: zoneInfo.gmtoff
                                }
                            });
                            prevRules = undefined;
                        }
                    }
                    break;
                case RuleType.RuleName:
                    {
                        var rule = rules.get(zoneInfo.ruleName);
                        if (!rule) {
                            return error_1.throwError("InvalidTimeZoneData", "Zone '%s' refers to non-existing rule '%s'", zoneName, zoneInfo.ruleName);
                        }
                        var t = this._zoneTransitions(prevUntil, zoneInfo, rule);
                        transitions = transitions.concat(t);
                        prevRules = rule;
                    }
                    break;
                default:
                    assert_1.default(false, "timezonecomplete.Assertion", "Unknown RuleType");
            }
            prevUntil = zoneInfo.until !== undefined ? new basics_1.TimeStruct(zoneInfo.until) : undefined;
            prevState = transitions.length > 0 ? transitions[transitions.length - 1].newState : prevState;
        }
        return [transitions, (_a = prevRules === null || prevRules === void 0 ? void 0 : prevRules.final) !== null && _a !== void 0 ? _a : []];
    };
    /**
     * Creates all the transitions for a time zone from fromUtc (inclusive) to zoneInfo.until (exclusive).
     * The result always contains an initial transition at fromUtc that signals the switch to this rule set
     *
     * @param fromUtc previous zone sub-record UNTIL time; undefined for first zone record
     * @param zoneInfo the current zone sub-record
     * @param rule the corresponding rule transitions
     */
    CachedZoneTransitions.prototype._zoneTransitions = function (fromUtc, zoneInfo, rule) {
        // from tz-how-to.html:
        // One wrinkle, not fully explained in zic.8.txt, is what happens when switching to a named rule. To what values should the SAVE and
        // LETTER data be initialized?
        // - If at least one transition has happened, use the SAVE and LETTER data from the most recent.
        // - If switching to a named rule before any transition has happened, assume standard time (SAVE zero), and use the LETTER data from
        // the earliest transition with a SAVE of zero.
        var _a, _b, _c, _d;
        var result = [];
        // extra initial transition for switch to this rule set (but not for first zone info)
        var initial;
        if (fromUtc !== undefined) {
            var initialRuleTransition = rule.findLastLessEqual(fromUtc, zoneInfo.gmtoff);
            if (initialRuleTransition) {
                initial = {
                    atUtc: fromUtc,
                    newState: {
                        abbreviation: zoneAbbreviation(zoneInfo.format, false, initialRuleTransition.newState.letter),
                        letter: (_a = initialRuleTransition.newState.letter) !== null && _a !== void 0 ? _a : "",
                        dstOffset: duration_1.hours(0),
                        standardOffset: zoneInfo.gmtoff
                    }
                };
            }
            else {
                initialRuleTransition = rule.firstTransitionWithoutDstAfter(fromUtc, zoneInfo.gmtoff, undefined);
                initial = {
                    atUtc: fromUtc,
                    newState: {
                        abbreviation: zoneAbbreviation(zoneInfo.format, false, initialRuleTransition === null || initialRuleTransition === void 0 ? void 0 : initialRuleTransition.newState.letter),
                        letter: (_b = initialRuleTransition === null || initialRuleTransition === void 0 ? void 0 : initialRuleTransition.newState.letter) !== null && _b !== void 0 ? _b : "",
                        dstOffset: duration_1.hours(0),
                        standardOffset: zoneInfo.gmtoff
                    }
                };
            }
            result.push(initial);
        }
        // actual rule transitions; keep adding until the end of this zone info, or until only 'max' rules remain
        var prevDst = (_c = initial === null || initial === void 0 ? void 0 : initial.newState.dstOffset) !== null && _c !== void 0 ? _c : duration_1.hours(0);
        var iterator = rule.findFirst();
        var effective = (iterator === null || iterator === void 0 ? void 0 : iterator.transition) && ruleTransitionUtc(iterator.transition, zoneInfo.gmtoff, prevDst);
        while (iterator && effective &&
            ((zoneInfo.until && effective.unixMillis < zoneInfo.until) || (!zoneInfo.until && !iterator.final))) {
            prevDst = iterator.transition.newState.dstOffset;
            result.push({
                atUtc: effective,
                newState: {
                    abbreviation: zoneAbbreviation(zoneInfo.format, prevDst.nonZero(), iterator.transition.newState.letter),
                    letter: (_d = iterator.transition.newState.letter) !== null && _d !== void 0 ? _d : "",
                    dstOffset: prevDst,
                    standardOffset: zoneInfo.gmtoff
                }
            });
            iterator = rule.findNext(iterator);
            effective = iterator && ruleTransitionUtc(iterator.transition, zoneInfo.gmtoff, prevDst);
        }
        return result;
    };
    return CachedZoneTransitions;
}());
/**
 * Calculate the formatted abbreviation for a zone
 * @param format the abbreviation format string. Either 'zzz,' for NULL;  'A/B' for std/dst, or 'A%sB' for a format string where %s is
 * replaced by a letter
 * @param dst whether DST is observed
 * @param letter current rule letter, empty if no rule
 * @returns fully formatted abbreviation
 */
function zoneAbbreviation(format, dst, letter) {
    if (format === "zzz,") {
        return "";
    }
    if (format.includes("/")) {
        return (dst ? format.split("/")[1] : format.split("/")[0]);
    }
    if (letter) {
        return format.replace("%s", letter);
    }
    return format.replace("%s", "");
}
/**
 * Calculate the UTC time of a rule transition, given a particular time zone
 * @param transition
 * @param standardOffset zone offset from UT
 * @param dstOffset previous DST offset from UT+standardOffset
 * @returns UTC time
 */
function ruleTransitionUtc(transition, standardOffset, dstOffset) {
    switch (transition.atType) {
        case AtType.Utc: return transition.at;
        case AtType.Standard: {
            // transition time is in zone local time without DST
            var millis = transition.at.unixMillis;
            millis -= standardOffset.milliseconds();
            return new basics_1.TimeStruct(millis);
        }
        case AtType.Wall: {
            // transition time is in zone local time with DST
            var millis = transition.at.unixMillis;
            millis -= standardOffset.milliseconds();
            if (dstOffset) {
                millis -= dstOffset.milliseconds();
            }
            return new basics_1.TimeStruct(millis);
        }
    }
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./assert":1,"./basics":2,"./duration":4,"./error":5,"./math":10}],18:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],19:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],20:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],21:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":20,"_process":18,"inherits":19}],"timezonecomplete":[function(require,module,exports){
/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Date and Time utility functions - main index
 */
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./basics"), exports);
__exportStar(require("./datetime"), exports);
__exportStar(require("./duration"), exports);
__exportStar(require("./format"), exports);
__exportStar(require("./globals"), exports);
__exportStar(require("./javascript"), exports);
__exportStar(require("./locale"), exports);
__exportStar(require("./parse"), exports);
__exportStar(require("./period"), exports);
__exportStar(require("./basics"), exports);
__exportStar(require("./timesource"), exports);
__exportStar(require("./timezone"), exports);
var tz_database_1 = require("./tz-database");
Object.defineProperty(exports, "AtType", { enumerable: true, get: function () { return tz_database_1.AtType; } });
Object.defineProperty(exports, "isValidOffsetString", { enumerable: true, get: function () { return tz_database_1.isValidOffsetString; } });
Object.defineProperty(exports, "NormalizeOption", { enumerable: true, get: function () { return tz_database_1.NormalizeOption; } });
Object.defineProperty(exports, "RuleInfo", { enumerable: true, get: function () { return tz_database_1.RuleInfo; } });
Object.defineProperty(exports, "RuleType", { enumerable: true, get: function () { return tz_database_1.RuleType; } });
Object.defineProperty(exports, "OnType", { enumerable: true, get: function () { return tz_database_1.OnType; } });
Object.defineProperty(exports, "ToType", { enumerable: true, get: function () { return tz_database_1.ToType; } });
Object.defineProperty(exports, "Transition", { enumerable: true, get: function () { return tz_database_1.Transition; } });
Object.defineProperty(exports, "TzDatabase", { enumerable: true, get: function () { return tz_database_1.TzDatabase; } });
Object.defineProperty(exports, "ZoneInfo", { enumerable: true, get: function () { return tz_database_1.ZoneInfo; } });

},{"./basics":2,"./datetime":3,"./duration":4,"./format":6,"./globals":7,"./javascript":8,"./locale":9,"./parse":11,"./period":12,"./timesource":14,"./timezone":15,"./tz-database":17}]},{},[])("timezonecomplete")
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZXJyb3IuanMiLCJkaXN0L2xpYi9mb3JtYXQuanMiLCJkaXN0L2xpYi9nbG9iYWxzLmpzIiwiZGlzdC9saWIvamF2YXNjcmlwdC5qcyIsImRpc3QvbGliL2xvY2FsZS5qcyIsImRpc3QvbGliL21hdGguanMiLCJkaXN0L2xpYi9wYXJzZS5qcyIsImRpc3QvbGliL3BlcmlvZC5qcyIsImRpc3QvbGliL3N0cmluZ3MuanMiLCJkaXN0L2xpYi90aW1lc291cmNlLmpzIiwiZGlzdC9saWIvdGltZXpvbmUuanMiLCJkaXN0L2xpYi90b2tlbi5qcyIsImRpc3QvbGliL3R6LWRhdGFiYXNlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiZGlzdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNrQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3YxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZrRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTYgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgX19zcHJlYWRBcnJheXMgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXlzKSB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG4vKipcclxuICogVGhyb3dzIGFuIEFzc2VydGlvbiBlcnJvciBpZiB0aGUgZ2l2ZW4gY29uZGl0aW9uIGlzIGZhbHN5XHJcbiAqIEBwYXJhbSBjb25kaXRpb25cclxuICogQHBhcmFtIG5hbWUgZXJyb3IgbmFtZVxyXG4gKiBAcGFyYW0gZm9ybWF0IGVycm9yIG1lc3NhZ2Ugd2l0aCBwZXJjZW50LXN0eWxlIHBsYWNlaG9sZGVyc1xyXG4gKiBAcGFyYW0gYXJncyBhcmd1bWVudHMgZm9yIGVycm9yIG1lc3NhZ2UgZm9ybWF0IHN0cmluZ1xyXG4gKiBAdGhyb3dzIFtuYW1lXSBpZiBgY29uZGl0aW9uYCBpcyBmYWxzeVxyXG4gKi9cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbmFtZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAzOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBhcmdzW19pIC0gM10gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICBlcnJvcl8xLnRocm93RXJyb3IuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5cyhbbmFtZSwgZm9ybWF0XSwgYXJncykpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZGVmYXVsdCA9IGFzc2VydDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0LmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBleHBvcnRzLlRpbWVTdHJ1Y3QgPSBleHBvcnRzLnNlY29uZE9mRGF5ID0gZXhwb3J0cy53ZWVrRGF5Tm9MZWFwU2VjcyA9IGV4cG9ydHMudGltZVRvVW5peE5vTGVhcFNlY3MgPSBleHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gZXhwb3J0cy53ZWVrTnVtYmVyID0gZXhwb3J0cy53ZWVrT2ZNb250aCA9IGV4cG9ydHMud2Vla0RheU9uT3JCZWZvcmUgPSBleHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSBleHBvcnRzLmZpcnN0V2Vla0RheU9mTW9udGggPSBleHBvcnRzLmxhc3RXZWVrRGF5T2ZNb250aCA9IGV4cG9ydHMuZGF5T2ZZZWFyID0gZXhwb3J0cy5kYXlzSW5Nb250aCA9IGV4cG9ydHMuZGF5c0luWWVhciA9IGV4cG9ydHMuaXNMZWFwWWVhciA9IGV4cG9ydHMuc3RyaW5nVG9UaW1lVW5pdCA9IGV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IGV4cG9ydHMudGltZVVuaXRUb01pbGxpc2Vjb25kcyA9IGV4cG9ydHMuVGltZVVuaXQgPSBleHBvcnRzLldlZWtEYXkgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIGphdmFzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG4vKipcclxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcclxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcclxuICovXHJcbnZhciBXZWVrRGF5O1xyXG4oZnVuY3Rpb24gKFdlZWtEYXkpIHtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlR1ZXNkYXlcIl0gPSAyXSA9IFwiVHVlc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIkZyaWRheVwiXSA9IDVdID0gXCJGcmlkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XHJcbn0pKFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXkgfHwgKGV4cG9ydHMuV2Vla0RheSA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG52YXIgVGltZVVuaXQ7XHJcbihmdW5jdGlvbiAoVGltZVVuaXQpIHtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWlsbGlzZWNvbmRcIl0gPSAwXSA9IFwiTWlsbGlzZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiU2Vjb25kXCJdID0gMV0gPSBcIlNlY29uZFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNaW51dGVcIl0gPSAyXSA9IFwiTWludXRlXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIkhvdXJcIl0gPSAzXSA9IFwiSG91clwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJEYXlcIl0gPSA0XSA9IFwiRGF5XCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIldlZWtcIl0gPSA1XSA9IFwiV2Vla1wiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNb250aFwiXSA9IDZdID0gXCJNb250aFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJZZWFyXCJdID0gN10gPSBcIlllYXJcIjtcclxuICAgIC8qKlxyXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXHJcbiAgICAgKi9cclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTUFYXCJdID0gOF0gPSBcIk1BWFwiO1xyXG59KShUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQgfHwgKGV4cG9ydHMuVGltZVVuaXQgPSB7fSkpO1xyXG4vKipcclxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXHJcbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcclxuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcclxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5pdCBmb3IgaW52YWxpZCB1bml0XHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpIHtcclxuICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlVuaXRcIiwgXCJ1bmtub3duIHRpbWUgdW5pdCAlZFwiLCB1bml0KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMgPSB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzO1xyXG4vKipcclxuICogVGltZSB1bml0IHRvIGxvd2VyY2FzZSBzdHJpbmcuIElmIGFtb3VudCBpcyBzcGVjaWZpZWQsIHRoZW4gdGhlIHN0cmluZyBpcyBwdXQgaW4gcGx1cmFsIGZvcm1cclxuICogaWYgbmVjZXNzYXJ5LlxyXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxyXG4gKiBAcGFyYW0gYW1vdW50IElmIHRoaXMgaXMgdW5lcXVhbCB0byAtMSBhbmQgMSwgdGhlbiB0aGUgcmVzdWx0IGlzIHBsdXJhbGl6ZWRcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXQgZm9yIGludmFsaWQgdGltZSB1bml0XHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvU3RyaW5nKHVuaXQsIGFtb3VudCkge1xyXG4gICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDE7IH1cclxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcih1bml0KSB8fCB1bml0IDwgMCB8fCB1bml0ID49IFRpbWVVbml0Lk1BWCkge1xyXG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Vbml0XCIsIFwiaW52YWxpZCB0aW1lIHVuaXQgJWRcIiwgdW5pdCk7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVzdWx0ID0gVGltZVVuaXRbdW5pdF0udG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChhbW91bnQgPT09IDEgfHwgYW1vdW50ID09PSAtMSkge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0ICsgXCJzXCI7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy50aW1lVW5pdFRvU3RyaW5nID0gdGltZVVuaXRUb1N0cmluZztcclxuLyoqXHJcbiAqIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBudW1lcmljIFRpbWVVbml0LiBDYXNlLWluc2Vuc2l0aXZlOyB0aW1lIHVuaXRzIGNhbiBiZSBzaW5ndWxhciBvciBwbHVyYWwuXHJcbiAqIEBwYXJhbSBzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TIGZvciBpbnZhbGlkIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzKSB7XHJcbiAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRpbWVVbml0Lk1BWDsgKytpKSB7XHJcbiAgICAgICAgdmFyIG90aGVyID0gdGltZVVuaXRUb1N0cmluZyhpLCAxKTtcclxuICAgICAgICBpZiAob3RoZXIgPT09IHRyaW1tZWQgfHwgKG90aGVyICsgXCJzXCIpID09PSB0cmltbWVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5TXCIsIFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICclcydcIiwgcyk7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gc3RyaW5nVG9UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGlmIHllYXIgaXMgbm90IGludGVnZXJcclxuICovXHJcbmZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJJbnZhbGlkIHllYXIgJWRcIiwgeWVhcik7XHJcbiAgICAvLyBmcm9tIFdpa2lwZWRpYTpcclxuICAgIC8vIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0IHRoZW4gY29tbW9uIHllYXJcclxuICAgIC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxyXG4gICAgLy8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNDAwIHRoZW4gY29tbW9uIHllYXJcclxuICAgIC8vIGVsc2UgbGVhcCB5ZWFyXHJcbiAgICBpZiAoeWVhciAlIDQgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh5ZWFyICUgMTAwICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh5ZWFyICUgNDAwICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5pc0xlYXBZZWFyID0gaXNMZWFwWWVhcjtcclxuLyoqXHJcbiAqIFRoZSBkYXlzIGluIGEgZ2l2ZW4geWVhclxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBpZiB5ZWFyIGlzIG5vdCBpbnRlZ2VyXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcclxuICAgIC8vIHJlbHkgb24gdmFsaWRhdGlvbiBieSBpc0xlYXBZZWFyXHJcbiAgICByZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjUpO1xyXG59XHJcbmV4cG9ydHMuZGF5c0luWWVhciA9IGRheXNJblllYXI7XHJcbi8qKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCAxLTEyXHJcbiAqIEByZXR1cm4gVGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBnaXZlbiBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBpZiB5ZWFyIGlzIG5vdCBpbnRlZ2VyXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aCBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XHJcbiAgICBzd2l0Y2ggKG1vbnRoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgIGNhc2UgODpcclxuICAgICAgICBjYXNlIDEwOlxyXG4gICAgICAgIGNhc2UgMTI6XHJcbiAgICAgICAgICAgIHJldHVybiAzMTtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgIHJldHVybiAzMDtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuTW9udGhcIiwgXCJJbnZhbGlkIG1vbnRoOiAlZFwiLCBtb250aCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5Nb250aCA9IGRheXNJbk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIobW9udGgpICYmIG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJNb250aCBvdXQgb2YgcmFuZ2U6ICVkXCIsIG1vbnRoKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIHZhciB5ZWFyRGF5ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG4gICAgICAgIHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XHJcbiAgICB9XHJcbiAgICB5ZWFyRGF5ICs9IChkYXkgLSAxKTtcclxuICAgIHJldHVybiB5ZWFyRGF5O1xyXG59XHJcbmV4cG9ydHMuZGF5T2ZZZWFyID0gZGF5T2ZZZWFyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5IDAtNlxyXG4gKiBAcmV0dXJuIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XHJcbiAqL1xyXG5mdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKG1vbnRoKSAmJiBtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiTW9udGggb3V0IG9mIHJhbmdlOiAlZFwiLCBtb250aCk7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2Vla0RheSkgJiYgd2Vla0RheSA+PSAwICYmIHdlZWtEYXkgPD0gNiwgXCJBcmd1bWVudC5XZWVrRGF5XCIsIFwid2Vla0RheSBvdXQgb2YgcmFuZ2U6ICVkXCIsIHdlZWtEYXkpO1xyXG4gICAgdmFyIGVuZE9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkgfSk7XHJcbiAgICB2YXIgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gZW5kT2ZNb250aFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICBkaWZmIC09IDc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5sYXN0V2Vla0RheU9mTW9udGggPSBsYXN0V2Vla0RheU9mTW9udGg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gd2Vla2RheSBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0dGhlIG1vbnRoIDEtMTJcclxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XHJcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XHJcbiAqL1xyXG5mdW5jdGlvbiBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCB3ZWVrRGF5KSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHdlZWtEYXkpICYmIHdlZWtEYXkgPj0gMCAmJiB3ZWVrRGF5IDw9IDYsIFwiQXJndW1lbnQuV2Vla0RheVwiLCBcIndlZWtEYXkgb3V0IG9mIHJhbmdlOiAlZFwiLCB3ZWVrRGF5KTtcclxuICAgIHZhciBiZWdpbk9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiAxIH0pO1xyXG4gICAgdmFyIGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGgudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgZGlmZiArPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy5maXJzdFdlZWtEYXlPZk1vbnRoID0gZmlyc3RXZWVrRGF5T2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5OyB0aHJvd3MgaWYgbm90IGZvdW5kXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtEYXkgZm9yIGludmFsaWQgd2VlayBkYXlcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXlcclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIobW9udGgpICYmIG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJNb250aCBvdXQgb2YgcmFuZ2U6ICVkXCIsIG1vbnRoKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XHJcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XHJcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICBkaWZmICs9IDc7XHJcbiAgICB9XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckFmdGVyID0gd2Vla0RheU9uT3JBZnRlcjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZCBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5XHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyLCBtb250aCwgZGF5LCB3ZWVrRGF5KSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGRheSkgJiYgZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJBcmd1bWVudC5EYXlcIiwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHdlZWtEYXkpICYmIHdlZWtEYXkgPj0gMCAmJiB3ZWVrRGF5IDw9IDYsIFwiQXJndW1lbnQuV2Vla0RheVwiLCBcIndlZWtEYXkgb3V0IG9mIHJhbmdlOiAlZFwiLCB3ZWVrRGF5KTtcclxuICAgIHZhciBzdGFydCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSB9KTtcclxuICAgIHZhciBzdGFydFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuICAgIGlmIChkaWZmID4gMCkge1xyXG4gICAgICAgIGRpZmYgLT0gNztcclxuICAgIH1cclxuICAgIGFzc2VydF8xLmRlZmF1bHQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyOlxyXG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0XHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICAvLyByZWx5IG9uIHllYXIvbW9udGggdmFsaWRhdGlvbiBpbiBmaXJzdFdlZWtEYXlPZk1vbnRoXHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICB2YXIgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xyXG4gICAgdmFyIGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgLy8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiB3ZWVrIDEgb3IgbGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcbiAgICBpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuICAgICAgICBpZiAoZmlyc3RUaHVyc2RheSA8IGZpcnN0TW9uZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMVxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIExhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgICAgICAgICBpZiAobW9udGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IGNhc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIDMxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEphbnVhcnlcclxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBsYXN0TW9uZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XHJcbiAgICB2YXIgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxyXG4gICAgaWYgKGRheSA+PSBsYXN0TW9uZGF5KSB7XHJcbiAgICAgICAgaWYgKGxhc3RNb25kYXkgPiBsYXN0VGh1cnNkYXkpIHtcclxuICAgICAgICAgICAgLy8gV2VlayAxIG9mIG5leHQgbW9udGhcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gTm9ybWFsIGNhc2VcclxuICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XHJcbiAgICBpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcclxuICAgICAgICByZXN1bHQgKz0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy53ZWVrT2ZNb250aCA9IHdlZWtPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLXllYXIgb2YgdGhlIE1vbmRheSBvZiB3ZWVrIDEgaW4gdGhlIGdpdmVuIHllYXIuXHJcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcclxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpIHtcclxuICAgIC8vIHJlbGF5IG9uIHdlZWtEYXlPbk9yQWZ0ZXIgZm9yIHllYXIgdmFsaWRhdGlvblxyXG4gICAgLy8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcclxuICAgIHZhciByZXN1bHQgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XHJcbiAgICBpZiAocmVzdWx0ID4gMykgeyAvLyBncmVhdGVyIHRoYW4gamFuIDR0aFxyXG4gICAgICAgIHJlc3VsdCAtPSA3O1xyXG4gICAgICAgIGlmIChyZXN1bHQgPCAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmRheXNJblllYXIoeWVhciAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlciBmb3IgdGhlIGdpdmVuIGRhdGUuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IG9mIG1vbnRoIDEtMzFcclxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcclxuICovXHJcbmZ1bmN0aW9uIHdlZWtOdW1iZXIoeWVhciwgbW9udGgsIGRheSkge1xyXG4gICAgdmFyIGRveSA9IGRheU9mWWVhcih5ZWFyLCBtb250aCwgZGF5KTtcclxuICAgIC8vIGNoZWNrIGVuZC1vZi15ZWFyIGNvcm5lciBjYXNlOiBtYXkgYmUgd2VlayAxIG9mIG5leHQgeWVhclxyXG4gICAgaWYgKGRveSA+PSBkYXlPZlllYXIoeWVhciwgMTIsIDI5KSkge1xyXG4gICAgICAgIHZhciBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcclxuICAgICAgICBpZiAobmV4dFllYXJXZWVrT25lID4gNCAmJiBuZXh0WWVhcldlZWtPbmUgPD0gZG95KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIGJlZ2lubmluZy1vZi15ZWFyIGNvcm5lciBjYXNlXHJcbiAgICB2YXIgdGhpc1llYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKTtcclxuICAgIGlmICh0aGlzWWVhcldlZWtPbmUgPiA0KSB7XHJcbiAgICAgICAgLy8gd2VlayAxIGlzIGF0IGVuZCBvZiBsYXN0IHllYXJcclxuICAgICAgICB2YXIgd2Vla1R3byA9IHRoaXNZZWFyV2Vla09uZSArIDcgLSBkYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuICAgICAgICBpZiAoZG95IDwgd2Vla1R3bykge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB3ZWVrVHdvKSAvIDcpICsgMjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cclxuICAgIGlmIChkb3kgPCB0aGlzWWVhcldlZWtPbmUpIHtcclxuICAgICAgICAvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxyXG4gICAgICAgIHJldHVybiB3ZWVrTnVtYmVyKHllYXIgLSAxLCAxMiwgMzEpO1xyXG4gICAgfVxyXG4gICAgLy8gbm9ybWFsIGNhc2VzOyBub3RlIHRoYXQgd2VlayBudW1iZXJzIHN0YXJ0IGZyb20gMSBzbyArMVxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XHJcbn1cclxuZXhwb3J0cy53ZWVrTnVtYmVyID0gd2Vla051bWJlcjtcclxuLyoqXHJcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXhNaWxsaXMgZm9yIG5vbi1pbnRlZ2VyIGB1bml4TWlsbGlzYCBwYXJhbWV0ZXJcclxuICovXHJcbmZ1bmN0aW9uIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih1bml4TWlsbGlzKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwidW5peE1pbGxpcyBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXJcIik7XHJcbiAgICB2YXIgdGVtcCA9IHVuaXhNaWxsaXM7XHJcbiAgICB2YXIgcmVzdWx0ID0geyB5ZWFyOiAwLCBtb250aDogMCwgZGF5OiAwLCBob3VyOiAwLCBtaW51dGU6IDAsIHNlY29uZDogMCwgbWlsbGk6IDAgfTtcclxuICAgIHZhciB5ZWFyO1xyXG4gICAgdmFyIG1vbnRoO1xyXG4gICAgaWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG4gICAgICAgIHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xyXG4gICAgICAgIHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcclxuICAgICAgICB5ZWFyID0gMTk3MDtcclxuICAgICAgICB3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcclxuICAgICAgICAgICAgeWVhcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQueWVhciA9IHllYXI7XHJcbiAgICAgICAgbW9udGggPSAxO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG4gICAgICAgICAgICB0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuICAgICAgICAgICAgbW9udGgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcbiAgICAgICAgcmVzdWx0LmRheSA9IHRlbXAgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG4gICAgICAgIC8vIFdlIG1ha2UgaXQgcG9zaXRpdmUgYnkgYWRkaW5nIHRoZSBtb2R1bG8uXHJcbiAgICAgICAgcmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcbiAgICAgICAgcmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcbiAgICAgICAgcmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG4gICAgICAgIHllYXIgPSAxOTY5O1xyXG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJblllYXIoeWVhcikpIHtcclxuICAgICAgICAgICAgdGVtcCArPSBkYXlzSW5ZZWFyKHllYXIpO1xyXG4gICAgICAgICAgICB5ZWFyLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC55ZWFyID0geWVhcjtcclxuICAgICAgICBtb250aCA9IDEyO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuICAgICAgICAgICAgbW9udGgtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcbiAgICAgICAgcmVzdWx0LmRheSA9IHRlbXAgKyAxICsgZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gdW5peFRvVGltZU5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBmb3IgaW52YWxpZCBtaW51dGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBmb3IgaW52YWxpZCBzZWNvbmRcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cykge1xyXG4gICAgdmFyIGlucHV0ID0ge1xyXG4gICAgICAgIHllYXI6IHR5cGVvZiBjb21wb25lbnRzLnllYXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnllYXIgOiAxOTcwLFxyXG4gICAgICAgIG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG4gICAgICAgIGRheTogdHlwZW9mIGNvbXBvbmVudHMuZGF5ID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5kYXkgOiAxLFxyXG4gICAgICAgIGhvdXI6IHR5cGVvZiBjb21wb25lbnRzLmhvdXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmhvdXIgOiAwLFxyXG4gICAgICAgIG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG4gICAgICAgIHNlY29uZDogdHlwZW9mIGNvbXBvbmVudHMuc2Vjb25kID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5zZWNvbmQgOiAwLFxyXG4gICAgICAgIG1pbGxpOiB0eXBlb2YgY29tcG9uZW50cy5taWxsaSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWlsbGkgOiAwLFxyXG4gICAgfTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC55ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiaW52YWxpZCB5ZWFyICVkXCIsIGlucHV0LnllYXIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGlucHV0Lm1vbnRoKSAmJiBpbnB1dC5tb250aCA+PSAxICYmIGlucHV0Lm1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiaW52YWxpZCBtb250aCAlZFwiLCBpbnB1dC5tb250aCk7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQuZGF5KSAmJiBpbnB1dC5kYXkgPj0gMSAmJiBpbnB1dC5kYXkgPD0gZGF5c0luTW9udGgoaW5wdXQueWVhciwgaW5wdXQubW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImludmFsaWQgZGF5ICVkXCIsIGlucHV0LmRheSk7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQuaG91cikgJiYgaW5wdXQuaG91ciA+PSAwICYmIGlucHV0LmhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBpbnB1dC5ob3VyKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5taW51dGUpICYmIGlucHV0Lm1pbnV0ZSA+PSAwICYmIGlucHV0Lm1pbnV0ZSA8PSA1OSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJpbnZhbGlkIG1pbnV0ZSAlZFwiLCBpbnB1dC5taW51dGUpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGlucHV0LnNlY29uZCkgJiYgaW5wdXQuc2Vjb25kID49IDAgJiYgaW5wdXQuc2Vjb25kIDw9IDU5LCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcImludmFsaWQgc2Vjb25kICVkXCIsIGlucHV0LnNlY29uZCk7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQubWlsbGkpICYmIGlucHV0Lm1pbGxpID49IDAgJiYgaW5wdXQubWlsbGkgPD0gOTk5LCBcIkFyZ3VtZW50Lk1pbGxpXCIsIFwiaW52YWxpZCBtaWxsaSAlZFwiLCBpbnB1dC5taWxsaSk7XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbn1cclxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICB2YXIgY29tcG9uZW50cyA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSA6IGEpO1xyXG4gICAgdmFyIGlucHV0ID0gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XHJcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXHJcbiAgICAgICAgKGlucHV0LnllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcbiAgICAgICAgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDEpIC8gMTAwKSAqIDg2NDAwICsgTWF0aC5mbG9vcigoaW5wdXQueWVhciAtIDE5MDAgKyAyOTkpIC8gNDAwKSAqIDg2NDAwKTtcclxufVxyXG5leHBvcnRzLnRpbWVUb1VuaXhOb0xlYXBTZWNzID0gdGltZVRvVW5peE5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXhNaWxsaXMgZm9yIGludmFsaWQgYHVuaXhNaWxsaXNgIGFyZ3VtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrRGF5Tm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIodW5peE1pbGxpcyksIFwiQXJndW1lbnQuVW5peE1pbGxpc1wiLCBcInVuaXhNaWxsaXMgc2hvdWxkIGJlIGFuIGludGVnZXIgbnVtYmVyXCIpO1xyXG4gICAgdmFyIGVwb2NoRGF5ID0gV2Vla0RheS5UaHVyc2RheTtcclxuICAgIHZhciBkYXlzID0gTWF0aC5mbG9vcih1bml4TWlsbGlzIC8gMTAwMCAvIDg2NDAwKTtcclxuICAgIHJldHVybiBtYXRoLnBvc2l0aXZlTW9kdWxvKGVwb2NoRGF5ICsgZGF5cywgNyk7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5Tm9MZWFwU2VjcyA9IHdlZWtEYXlOb0xlYXBTZWNzO1xyXG4vKipcclxuICogTi10aCBzZWNvbmQgaW4gdGhlIGRheSwgY291bnRpbmcgZnJvbSAwXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBmb3IgaW52YWxpZCBtaW51dGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBmb3IgaW52YWxpZCBzZWNvbmRcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaG91cikgJiYgaG91ciA+PSAwICYmIGhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBob3VyKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtaW51dGUpICYmIG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8PSA1OSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJpbnZhbGlkIG1pbnV0ZSAlZFwiLCBtaW51dGUpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHNlY29uZCkgJiYgc2Vjb25kID49IDAgJiYgc2Vjb25kIDw9IDYxLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcImludmFsaWQgc2Vjb25kICVkXCIsIHNlY29uZCk7XHJcbiAgICByZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRPZkRheSA9IHNlY29uZE9mRGF5O1xyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG52YXIgVGltZVN0cnVjdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVGltZVN0cnVjdChhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihhKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwiaW52YWxpZCB1bml4IG1pbGxpcyAlZFwiLCBhKTtcclxuICAgICAgICAgICAgdGhpcy5fdW5peE1pbGxpcyA9IGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiBhID09PSBcIm9iamVjdFwiICYmIGEgIT09IG51bGwsIFwiQXJndW1lbnQuQ29tcG9uZW50c1wiLCBcImludmFsaWQgY29tcG9uZW50cyBvYmplY3RcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXHJcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICAgICAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcbiAgICAgKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXHJcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gICAgICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuICAgICAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgZm9yIGludmFsaWQgbWludXRlXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuU2Vjb25kIGZvciBpbnZhbGlkIHNlY29uZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21Db21wb25lbnRzID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXHJcbiAgICAgKiAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Vbml4TWlsbGlzIGZvciBub24taW50ZWdlciBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tVW5peCA9IGZ1bmN0aW9uICh1bml4TWlsbGlzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgSmF2YVNjcmlwdCBkYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRcdFRoZSBkYXRlXHJcbiAgICAgKiBAcGFyYW0gZGYgV2hpY2ggZnVuY3Rpb25zIHRvIHRha2UgKGdldFgoKSBvciBnZXRVVENYKCkpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tRGF0ZSA9IGZ1bmN0aW9uIChkLCBkZikge1xyXG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldEZ1bGxZZWFyKCksIG1vbnRoOiBkLmdldE1vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkLmdldFVUQ0Z1bGxZZWFyKCksIG1vbnRoOiBkLmdldFVUQ01vbnRoKCkgKyAxLCBkYXk6IGQuZ2V0VVRDRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlMgaWYgYHNgIGlzIG5vdCBhIHByb3BlciBpc28gc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHllYXIgPSAxOTcwO1xyXG4gICAgICAgICAgICB2YXIgbW9udGggPSAxO1xyXG4gICAgICAgICAgICB2YXIgZGF5ID0gMTtcclxuICAgICAgICAgICAgdmFyIGhvdXIgPSAwO1xyXG4gICAgICAgICAgICB2YXIgbWludXRlID0gMDtcclxuICAgICAgICAgICAgdmFyIHNlY29uZCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBmcmFjdGlvbk1pbGxpcyA9IDA7XHJcbiAgICAgICAgICAgIHZhciBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgIC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gcy50cmltKCkuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0Lmxlbmd0aCA+PSAxICYmIHNwbGl0Lmxlbmd0aCA8PSAyLCBcIkFyZ3VtZW50LlNcIiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIG1haW4gcGFydFxyXG4gICAgICAgICAgICB2YXIgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Jhc2ljRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJJU08gc3RyaW5nIGluIGJhc2ljIG5vdGF0aW9uIG1heSBvbmx5IGNvbnRhaW4gbnVtYmVycyBiZWZvcmUgdGhlIGZyYWN0aW9uYWwgcGFydFwiKTtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBhbnkgXCJUXCIgc2VwYXJhdG9yXHJcbiAgICAgICAgICAgICAgICBzcGxpdFswXSA9IHNwbGl0WzBdLnJlcGxhY2UoXCJUXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlQW5kVGltZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuaW5kZXhPZihcIlRcIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gcGFyc2UgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChsYXN0VW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSBkYXlzSW5ZZWFyKHllYXIpICogODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gNjAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XHJcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBbXHJcbiAgICAgICAgICAgICAgICBcIkFyZ3VtZW50LlNcIiwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJBcmd1bWVudC5EYXlcIiwgXCJBcmd1bWVudC5Ib3VyXCIsXHJcbiAgICAgICAgICAgICAgICBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIkFyZ3VtZW50Lk1pbGxpXCJcclxuICAgICAgICAgICAgXSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCIlc1xcXCI6ICVzXCIsIHMsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBwcm9ncmFtbWluZyBlcnJvclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJ1bml4TWlsbGlzXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3VuaXhNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW5peE1pbGxpcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHRoaXMuX2NvbXBvbmVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91bml4TWlsbGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJjb21wb25lbnRzXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gdW5peFRvVGltZU5vTGVhcFNlY3ModGhpcy5fdW5peE1pbGxpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInllYXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1vbnRoXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiZGF5XCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImhvdXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1pbnV0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJzZWNvbmRcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWlsbGlcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUueWVhckRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZGF5T2ZZZWFyKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgsIHRoaXMuY29tcG9uZW50cy5kYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRXF1YWxpdHkgZnVuY3Rpb25cclxuICAgICAqIEBwYXJhbSBvdGhlclxyXG4gICAgICogQHRocm93cyBUeXBlRXJyb3IgaWYgb3RoZXIgaXMgbm90IGFuIE9iamVjdFxyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mKCkgPT09IG90aGVyLnZhbHVlT2YoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX2NvbXBvbmVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX3VuaXhNaWxsaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgdGltZXN0YW1wIGlzIHZhbGlkXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5ob3VyID49IDAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPD0gMjNcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbGxpIDw9IDk5OTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubW9udGgudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWludXRlLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGltZVN0cnVjdDtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lU3RydWN0ID0gVGltZVN0cnVjdDtcclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm5zIFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcclxuICogQHRocm93cyBUeXBlRXJyb3IgaWYgYXJyIGlzIG5vdCBhbiBhcnJheVxyXG4gKiBAdGhyb3dzIHdoYXRldmVyIGBjb21wYXJlKClgIHRocm93c1xyXG4gKi9cclxuZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXgoYXJyLCBjb21wYXJlKSB7XHJcbiAgICB2YXIgbWluSW5kZXggPSAwO1xyXG4gICAgdmFyIG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgY3VycmVudEluZGV4O1xyXG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xyXG4gICAgLy8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxyXG4gICAgaWYgKCFhcnIpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICAvLyBvdXQgb2YgYm91bmRzXHJcbiAgICBpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG1heEluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIC8vIGVsZW1lbnQgaW4gcmFuZ2VcclxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IE1hdGguZmxvb3IoKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMik7XHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuICAgICAgICBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBiaW5hcnlJbnNlcnRpb25JbmRleDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmFzaWNzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBEYXRlK3RpbWUrdGltZXpvbmUgcmVwcmVzZW50YXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuaXNEYXRlVGltZSA9IGV4cG9ydHMuRGF0ZVRpbWUgPSBleHBvcnRzLm5vdyA9IGV4cG9ydHMubm93VXRjID0gZXhwb3J0cy5ub3dMb2NhbCA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XHJcbnZhciBmb3JtYXQgPSByZXF1aXJlKFwiLi9mb3JtYXRcIik7XHJcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbnZhciBwYXJzZUZ1bmNzID0gcmVxdWlyZShcIi4vcGFyc2VcIik7XHJcbnZhciB0aW1lc291cmNlXzEgPSByZXF1aXJlKFwiLi90aW1lc291cmNlXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIG5vd0xvY2FsKCkge1xyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuZXhwb3J0cy5ub3dMb2NhbCA9IG5vd0xvY2FsO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAqL1xyXG5mdW5jdGlvbiBub3dVdGMoKSB7XHJcbiAgICByZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuZXhwb3J0cy5ub3dVdGMgPSBub3dVdGM7XHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAqL1xyXG5mdW5jdGlvbiBub3codGltZVpvbmUpIHtcclxuICAgIGlmICh0aW1lWm9uZSA9PT0gdm9pZCAwKSB7IHRpbWVab25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKTsgfVxyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XHJcbn1cclxuZXhwb3J0cy5ub3cgPSBub3c7XHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gbG9jYWxUaW1lXHJcbiAqIEBwYXJhbSBmcm9tWm9uZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWUsIGZyb21ab25lKSB7XHJcbiAgICBpZiAoZnJvbVpvbmUpIHtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gZnJvbVpvbmUub2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHV0Y1RpbWVcclxuICogQHBhcmFtIHRvWm9uZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGNvbnZlcnRGcm9tVXRjKHV0Y1RpbWUsIHRvWm9uZSkge1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuICAgIGlmICh0b1pvbmUpIHtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcclxuICAgICAgICByZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdXRjVGltZS5jbG9uZSgpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG52YXIgRGF0ZVRpbWUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBAc2VlIG92ZXJyaWRlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEYXRlVGltZShhMSwgYTIsIGEzLCBoLCBtLCBzLCBtcywgdGltZVpvbmUpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMua2luZCA9IFwiRGF0ZVRpbWVcIjtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiAoYTEpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEyICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZm9yIHVuaXggdGltZXN0YW1wIGRhdGV0aW1lIGNvbnN0cnVjdG9yLCB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTIpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogc2Vjb25kIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGlzVGltZVpvbmUoYTIpID8gYTIgOiB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5peE1pbGxpcyA9IGVycm9yXzEuY29udmVydEVycm9yKFwiQXJndW1lbnQuVW5peE1pbGxpc1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKGExKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodW5peE1pbGxpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geWVhciBtb250aCBkYXkgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRpbWVab25lID09PSB1bmRlZmluZWQgfHwgdGltZVpvbmUgPT09IG51bGwgfHwgaXNUaW1lWm9uZSh0aW1lWm9uZSksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBlaWdodGggYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5ZWFyXzEgPSBhMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vbnRoXzEgPSBhMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRheV8xID0gYTM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyXzEgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbnV0ZV8xID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWNvbmRfMSA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWlsbGlfMSA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHllYXJfMSA9IGVycm9yXzEuY29udmVydEVycm9yKFwiQXJndW1lbnQuWWVhclwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKHllYXJfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aF8xID0gZXJyb3JfMS5jb252ZXJ0RXJyb3IoXCJBcmd1bWVudC5Nb250aFwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKG1vbnRoXzEpOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF5XzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LkRheVwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKGRheV8xKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJfMSA9IGVycm9yXzEuY29udmVydEVycm9yKFwiQXJndW1lbnQuSG91clwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKGhvdXJfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVfMSA9IGVycm9yXzEuY29udmVydEVycm9yKFwiQXJndW1lbnQuTWludXRlXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obWludXRlXzEpOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LlNlY29uZFwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKHNlY29uZF8xKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50Lk1pbGxpXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obWlsbGlfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG0gPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXJfMSwgbW9udGg6IG1vbnRoXzEsIGRheTogZGF5XzEsIGhvdXI6IGhvdXJfMSwgbWludXRlOiBtaW51dGVfMSwgc2Vjb25kOiBzZWNvbmRfMSwgbWlsbGk6IG1pbGxpXzEgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZSh0aW1lWm9uZSkgPyB0aW1lWm9uZSA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCB0d28gYXJndW1lbnRzIGFyZSBhIHN0cmluZywgdGhlcmVmb3JlIHRoZSBmb3VydGggdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEzKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtYXQgc3RyaW5nIGdpdmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyaW5nID0gYTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXRTdHJpbmcgPSBhMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHpvbmUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTMgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZShhMykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbmUgPSAoYTMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gcGFyc2VkLnRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSBwYXJzZWQuem9uZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZmlyc3QgYXJndW1lbnRzIGlzIGEgc3RyaW5nIGFuZCB0aGUgc2Vjb25kIGlzIG5vdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTIpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogc2Vjb25kIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2l2ZW5TdHJpbmcgPSBhMS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcyA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNzLmxlbmd0aCA9PT0gMiwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgYTEgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1RpbWVab25lKGEyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHNzWzFdLnRyaW0oKSA/IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZShzc1sxXSkgOiB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBhIERhdGUsIHRoZXJlZm9yZSB0aGUgZm91cnRoIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiICYmIChhMiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0IHx8IGEyID09PSBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpLCBcIkFyZ3VtZW50LkdldEZ1bmNzXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZm9yIGEgRGF0ZSBvYmplY3QgYSBEYXRlRnVuY3Rpb25zIG11c3QgYmUgcGFzc2VkIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMyA9PT0gdW5kZWZpbmVkIHx8IGEzID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTMpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGhpcmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gKGExKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRrID0gKGEyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMyA/IGEzIDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7IC8vIGExIGluc3RhbmNlb2YgVGltZVN0cnVjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BM1wiLCBcImZpcnN0IGFyZ3VtZW50IGlzIGEgVGltZVN0cnVjdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTIpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiZXhwZWN0IGEgVGltZVpvbmUgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGExLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTIgPyBhMiA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEyID09PSB1bmRlZmluZWQgJiYgYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTJcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWQsIHRoZXJlZm9yZSB0aGUgcmVzdCBtdXN0IGFsc28gYmUgdW5kZWZpbmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgZ2l2ZW4sIG1ha2UgbG9jYWwgZGF0ZXRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcl8xLmVycm9yKFwiQXJndW1lbnQuQTFcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwidXRjRGF0ZVwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3V0Y0RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwiem9uZURhdGVcIiwge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvY2FsIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVEYXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5ub3dMb2NhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShuLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQsIHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLm5vd1V0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQywgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93ID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XHJcbiAgICAgICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG4gICAgICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcbiAgICAgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTiBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5UaW1lWm9uZSBpZiB0aGUgZ2l2ZW4gdGltZSB6b25lIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZnJvbUV4Y2VsID0gZnVuY3Rpb24gKG4sIHRpbWVab25lKSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUobiksIFwiQXJndW1lbnQuTlwiLCBcImludmFsaWQgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gTWF0aC5yb3VuZCgobiAtIDI1NTY5KSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcbiAgICAgKiBFLmcuIDIwMTUtMDItMjkgcmV0dXJucyBmYWxzZSAobm90IGEgbGVhcCB5ZWFyKVxyXG4gICAgICogYW5kIDIwMTUtMDMtMjlUMDI6MzA6MDAgcmV0dXJucyBmYWxzZSAoZGF5bGlnaHQgc2F2aW5nIHRpbWUgbWlzc2luZyBob3VyKVxyXG4gICAgICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxyXG4gICAgICogQnkgZGVmYXVsdCwgcHJlLTE5NzAgZGF0ZXMgYWxzbyByZXR1cm4gZmFsc2Ugc2luY2UgdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBkb2VzIG5vdCBjb250YWluIGFjY3VyYXRlIGluZm9cclxuICAgICAqIGJlZm9yZSB0aGF0LiBZb3UgY2FuIGNoYW5nZSB0aGF0IHdpdGggdGhlIGFsbG93UHJlMTk3MCBmbGFnLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhbGxvd1ByZTE5NzAgKG9wdGlvbmFsLCBkZWZhdWx0IGZhbHNlKTogcmV0dXJuIHRydWUgZm9yIHByZS0xOTcwIGRhdGVzXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZXhpc3RzID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSwgYWxsb3dQcmUxOTcwKSB7XHJcbiAgICAgICAgaWYgKG1vbnRoID09PSB2b2lkIDApIHsgbW9udGggPSAxOyB9XHJcbiAgICAgICAgaWYgKGRheSA9PT0gdm9pZCAwKSB7IGRheSA9IDE7IH1cclxuICAgICAgICBpZiAoaG91ciA9PT0gdm9pZCAwKSB7IGhvdXIgPSAwOyB9XHJcbiAgICAgICAgaWYgKG1pbnV0ZSA9PT0gdm9pZCAwKSB7IG1pbnV0ZSA9IDA7IH1cclxuICAgICAgICBpZiAoc2Vjb25kID09PSB2b2lkIDApIHsgc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmIChtaWxsaXNlY29uZCA9PT0gdm9pZCAwKSB7IG1pbGxpc2Vjb25kID0gMDsgfVxyXG4gICAgICAgIGlmIChhbGxvd1ByZTE5NzAgPT09IHZvaWQgMCkgeyBhbGxvd1ByZTE5NzAgPSBmYWxzZTsgfVxyXG4gICAgICAgIGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KSB8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZClcclxuICAgICAgICAgICAgfHwgIWlzRmluaXRlKG1pbGxpc2Vjb25kKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGR0ID0gbmV3IERhdGVUaW1lKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCwgem9uZSk7XHJcbiAgICAgICAgICAgIHJldHVybiAoeWVhciA9PT0gZHQueWVhcigpICYmIG1vbnRoID09PSBkdC5tb250aCgpICYmIGRheSA9PT0gZHQuZGF5KClcclxuICAgICAgICAgICAgICAgICYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhIGNvcHkgb2YgdGhpcyBvYmplY3RcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCB0aGlzLl96b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl96b25lO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcclxuICAgICAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuICAgICAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lQWJicmV2aWF0aW9uID0gZnVuY3Rpb24gKGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQgPT09IHZvaWQgMCkgeyBkc3REZXBlbmRlbnQgPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyAtIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgYXMgYSBEdXJhdGlvbi5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUub2Zmc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBXSVRIT1VUIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl96b25lLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjKHRoaXMudXRjRGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKDApO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS55ZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5kYXk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBob3VyIDAtMjNcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG4gICAgICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGF5T2ZZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAgICAgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gTWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwWlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51bml4VXRjTWlsbGlzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5tb250aDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0hvdXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIHNlY29uZHMgMC01OVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNTZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXlPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taWxsaTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIFVUQyBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG4gICAgICogd2VlayBkYXkgbnVtYmVycylcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla0RheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gICAgICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuICAgICAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrT2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuICAgICAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjU2Vjb25kT2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lIHdoaWNoIGlzIHRoZSBkYXRlK3RpbWUgcmVpbnRlcnByZXRlZCBhc1xyXG4gICAgICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cclxuICAgICAqIE5vIGNvbnZlcnNpb24gaXMgZG9uZSwgdGhlIHZhbHVlIGlzIGp1c3QgYXNzdW1lZCB0byBiZSBpbiBhIGRpZmZlcmVudCB6b25lLlxyXG4gICAgICogV29ya3MgZm9yIG5haXZlIGFuZCBhd2FyZSBkYXRlcy4gVGhlIG5ldyB6b25lIG1heSBiZSBudWxsLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lIFRoZSBuZXcgdGltZSB6b25lXHJcbiAgICAgKiBAcmV0dXJuIEEgbmV3IERhdGVUaW1lIHdpdGggdGhlIG9yaWdpbmFsIHRpbWVzdGFtcCBhbmQgdGhlIG5ldyB6b25lLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS53aXRoWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLCB6b25lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cclxuICAgICAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiB5b3UgdHJ5IHRvIGNvbnZlcnQgYSBkYXRldGltZSB3aXRob3V0IGEgem9uZSB0byBhIGRhdGV0aW1lIHdpdGggYSB6b25lXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gKHpvbmUpIHtcclxuICAgICAgICBpZiAoem9uZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHsgLy8gaWYtc3RhdGVtZW50IHNhdGlzZmllcyB0aGUgY29tcGlsZXJcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJVbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb25cIiwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpOyAvLyBjYXVzZSB6b25lIC0+IHV0YyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fem9uZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG4gICAgICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcbiAgICAgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3JcclxuICAgICAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCBvciB1bmRlZmluZWQgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cclxuICAgICAqIEByZXR1cm4gVGhlIGNvbnZlcnRlZCBkYXRlXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIHlvdSB0cnkgdG8gY29udmVydCBhIG5haXZlIGRhdGV0aW1lIHRvIGFuIGF3YXJlIG9uZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XHJcbiAgICAgICAgaWYgKHpvbmUpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl96b25lLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG4gICAgICAgICAgICByZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuICAgICAgICAgICAgcmVzdWx0Ll96b25lID0gem9uZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHRvIEphdmFTY3JpcHQgZGF0ZSB3aXRoIHRoZSB6b25lIHRpbWUgaW4gdGhlIGdldFgoKSBtZXRob2RzLlxyXG4gICAgICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuICAgICAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9EYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSwgdGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG4gICAgICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgeW91IHRyeSB0byBjb252ZXJ0IGEgbmFpdmUgZGF0ZXRpbWUgdG8gYW4gYXdhcmUgb25lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9FeGNlbCA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xyXG4gICAgICAgIHZhciBkdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRpbWVab25lICYmICghdGhpcy5fem9uZSB8fCAhdGltZVpvbmUuZXF1YWxzKHRoaXMuX3pvbmUpKSkge1xyXG4gICAgICAgICAgICBkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNFeGNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xyXG4gICAgICAgIC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcclxuICAgICAgICB2YXIgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEltcGxlbWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZExvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gKGFtb3VudCA+PSAwID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXAgOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0sIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG4gICAgICogS2VlcHMgbG93ZXIgdW5pdCBmaWVsZHMgdGhlIHNhbWUgd2hlcmUgcG9zc2libGUsIGNsYW1wcyBkYXkgdG8gZW5kLW9mLW1vbnRoIGlmXHJcbiAgICAgKiBuZWNlc3NhcnkuXHJcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LkFtb3VudCBpZiBhbW91bnQgaXMgbm90IGZpbml0ZSBvciBpZiBpdCdzIG5vdCBhbiBpbnRlZ2VyIGFuZCB5b3UncmUgYWRkaW5nIG1vbnRocyBvciB5ZWFyc1xyXG4gICAgICogQHRocm93cyBBcmd1bWVudC5Vbml0IGZvciBpbnZhbGlkIHRpbWUgdW5pdFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX2FkZFRvVGltZVN0cnVjdCA9IGZ1bmN0aW9uICh0bSwgYW1vdW50LCB1bml0KSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUoYW1vdW50KSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJhbW91bnQgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIHllYXI7XHJcbiAgICAgICAgdmFyIG1vbnRoO1xyXG4gICAgICAgIHZhciBkYXk7XHJcbiAgICAgICAgdmFyIGhvdXI7XHJcbiAgICAgICAgdmFyIG1pbnV0ZTtcclxuICAgICAgICB2YXIgc2Vjb25kO1xyXG4gICAgICAgIHZhciBtaWxsaTtcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNjAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcbiAgICAgICAgICAgICAgICAvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcclxuICAgICAgICAgICAgICAgIGlmIChhbW91bnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmNlaWwoKGFtb3VudCAtICgxMiAtIHRtLmNvbXBvbmVudHMubW9udGgpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6IHtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWF0aC5pc0ludChhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG4gICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIGFtb3VudDtcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuVW5pdFwiLCBcImludmFsaWQgdGltZSB1bml0XCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhMSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gYTE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSBhMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKGR1cmF0aW9uLm11bHRpcGx5KC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdWJMb2NhbCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYTEgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTG9jYWwoLTEgKiBhMSwgdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMb2NhbChhMS5tdWx0aXBseSgtMSkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRpbWUgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBEYXRlVGltZXNcclxuICAgICAqIEByZXR1cm4gdGhpcyAtIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24odGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgLSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgMSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmxlc3NFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5lcXVhbHMob3RoZXIudXRjRGF0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGFuZCB0aGUgc2FtZSB6b25lXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiAhISh0aGlzLnpvbmVEYXRlLmVxdWFscyhvdGhlci56b25lRGF0ZSlcclxuICAgICAgICAgICAgJiYgKCF0aGlzLl96b25lKSA9PT0gKCFvdGhlci5fem9uZSlcclxuICAgICAgICAgICAgJiYgKCghdGhpcy5fem9uZSAmJiAhb3RoZXIuX3pvbmUpIHx8ICh0aGlzLl96b25lICYmIG90aGVyLl96b25lICYmIHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSkpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID4gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmdyZWF0ZXJFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XHJcbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXHJcbiAgICAgKiBVbmF3YXJlIGRhdGVzIGhhdmUgbm8gem9uZSBpbmZvcm1hdGlvbiBhdCB0aGUgZW5kLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcyArIHRpbWV6b25lXzEuVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdG8gVVRDIGFuZCB0aGVuIHJldHVybiBJU08gc3RyaW5nIGVuZGluZyBpbiAnWicuIFRoaXMgaXMgZXF1aXZhbGVudCB0byBEYXRlI3RvSVNPU3RyaW5nKClcclxuICAgICAqIGUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzIEV1cm9wZS9BbXN0ZXJkYW1cIiBiZWNvbWVzIFwiMjAxNC0wMS0wMVQyMjoxNTozM1pcIi5cclxuICAgICAqIFVuYXdhcmUgZGF0ZXMgYXJlIGFzc3VtZWQgdG8gYmUgaW4gVVRDXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvVXRjSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvWm9uZSh0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS5mb3JtYXQoXCJ5eXl5LU1NLWRkVEhIOm1tOnNzLlNTU1paWlpaXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2l0aFpvbmUodGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSkuZm9ybWF0KFwieXl5eS1NTS1kZFRISDptbTpzcy5TU1NaWlpaWlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuICAgICAqIHNwZWNpZmllZCBmb3JtYXQuIFNlZSBMRE1MLm1kIGZvciBzdXBwb3J0ZWQgZm9ybWF0cy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcclxuICAgICAqIEBwYXJhbSBsb2NhbGUgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdFN0cmluZywgbG9jYWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy56b25lRGF0ZSwgdGhpcy51dGNEYXRlLCB0aGlzLl96b25lLCBmb3JtYXRTdHJpbmcsIGxvY2FsZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBhIGRhdGUgaW4gYSBnaXZlbiBmb3JtYXRcclxuICAgICAqIEBwYXJhbSBzIHRoZSBzdHJpbmcgdG8gcGFyc2VcclxuICAgICAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluLiBTZWUgTERNTC5tZCBmb3Igc3VwcG9ydGVkIGZvcm1hdHMuXHJcbiAgICAgKiBAcGFyYW0gem9uZSBPcHRpb25hbCwgdGhlIHpvbmUgdG8gYWRkIChpZiBubyB6b25lIGlzIGdpdmVuIGluIHRoZSBzdHJpbmcpXHJcbiAgICAgKiBAcGFyYW0gbG9jYWxlIE9wdGlvbmFsLCBkaWZmZXJlbnQgc2V0dGluZ3MgZm9yIGNvbnN0YW50cyBsaWtlICdBTScgZXRjXHJcbiAgICAgKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBjaGFyYWN0ZXJzIGluIHRoZSBzb3VyY2Ugc3RyaW5nXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvciBpZiB0aGUgZ2l2ZW4gZGF0ZVRpbWVTdHJpbmcgaXMgd3Jvbmcgb3Igbm90IGFjY29yZGluZyB0byB0aGUgcGF0dGVyblxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBpZiB0aGUgZ2l2ZW4gZm9ybWF0IHN0cmluZyBpcyBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnBhcnNlID0gZnVuY3Rpb24gKHMsIGZvcm1hdCwgem9uZSwgbG9jYWxlLCBhbGxvd1RyYWlsaW5nKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lLCBhbGxvd1RyYWlsaW5nIHx8IGZhbHNlLCBsb2NhbGUpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKCFlcnJvcl8xLmVycm9ySXMoZSwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gZXJyb3JfMS5lcnJvcihcIlBhcnNlRXJyb3JcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZSA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJ3aXRob3V0IERTVFwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0XzEgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XHJcbiAgICAgICAgICAgIHJlc3VsdF8xWzFdICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgOCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IC0xOyAvLyBhbnkgXCItXCIgd2UgZm91bmQgd2FzIGEgZGF0ZSBzZXBhcmF0b3JcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuICAgICAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuICAgICAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUudGltZVNvdXJjZSA9IG5ldyB0aW1lc291cmNlXzEuUmVhbFRpbWVTb3VyY2UoKTtcclxuICAgIHJldHVybiBEYXRlVGltZTtcclxufSgpKTtcclxuZXhwb3J0cy5EYXRlVGltZSA9IERhdGVUaW1lO1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYGFgIGlzIHNpbWlsYXIgdG8gYSBUaW1lWm9uZSB3aXRob3V0IHVzaW5nIHRoZSBpbnN0YW5jZW9mIG9wZXJhdG9yLlxyXG4gKiBJdCBjaGVja3MgZm9yIHRoZSBhdmFpbGFiaWxpdHkgb2YgdGhlIGZ1bmN0aW9ucyB1c2VkIGluIHRoZSBEYXRlVGltZSBpbXBsZW1lbnRhdGlvblxyXG4gKiBAcGFyYW0gYSB0aGUgb2JqZWN0IHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIGEgaXMgVGltZVpvbmUtbGlrZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGlzVGltZVpvbmUoYSkge1xyXG4gICAgaWYgKGEgJiYgdHlwZW9mIGEgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGEubm9ybWFsaXplWm9uZVRpbWUgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5hYmJyZXZpYXRpb25Gb3JVdGMgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5zdGFuZGFyZE9mZnNldEZvclV0YyA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmlkZW50aWNhbCA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmVxdWFscyA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmtpbmQgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5jbG9uZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gb2JqZWN0IGlzIG9mIHR5cGUgRGF0ZVRpbWUuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XHJcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxyXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0RhdGVUaW1lKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmtpbmQgPT09IFwiRGF0ZVRpbWVcIjtcclxufVxyXG5leHBvcnRzLmlzRGF0ZVRpbWUgPSBpc0RhdGVUaW1lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRldGltZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogVGltZSBkdXJhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5pc0R1cmF0aW9uID0gZXhwb3J0cy5EdXJhdGlvbiA9IGV4cG9ydHMubWlsbGlzZWNvbmRzID0gZXhwb3J0cy5zZWNvbmRzID0gZXhwb3J0cy5taW51dGVzID0gZXhwb3J0cy5ob3VycyA9IGV4cG9ydHMuZGF5cyA9IGV4cG9ydHMubW9udGhzID0gZXhwb3J0cy55ZWFycyA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiB5ZWFycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuZXhwb3J0cy55ZWFycyA9IHllYXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gbW9udGhzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5tb250aHMobik7XHJcbn1cclxuZXhwb3J0cy5tb250aHMgPSBtb250aHM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGRheXMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuZXhwb3J0cy5kYXlzID0gZGF5cztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBob3VycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuZXhwb3J0cy5ob3VycyA9IGhvdXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBtaW51dGVzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5taW51dGVzKG4pO1xyXG59XHJcbmV4cG9ydHMubWludXRlcyA9IG1pbnV0ZXM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLnNlY29uZHMobik7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRzID0gc2Vjb25kcztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKG4pO1xyXG59XHJcbmV4cG9ydHMubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzO1xyXG4vKipcclxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXHJcbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXHJcbiAqXHJcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxyXG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXHJcbiAqICAgVGhlc2UgcmV0dXJuIGEgcGFydCBvZiB5b3VyIHN0cmluZyByZXByZXNlbnRhdGlvbi4gRS5nLiBmb3IgMjUwMCBtaWxsaXNlY29uZHMsIHRoZSBtaWxsaXNlY29uZCgpIHBhcnQgd291bGQgYmUgNTAwXHJcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cclxuICovXHJcbnZhciBEdXJhdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRHVyYXRpb24oaTEsIHVuaXQpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMua2luZCA9IFwiRHVyYXRpb25cIjtcclxuICAgICAgICBpZiAodHlwZW9mIGkxID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBpMTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUoYW1vdW50KSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJhbW91bnQgc2hvdWxkIGJlIGZpbml0ZTogJWRcIiwgYW1vdW50KTtcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHRoaXMuX3VuaXQpICYmIHRoaXMuX3VuaXQgPj0gMCAmJiB0aGlzLl91bml0IDwgYmFzaWNzXzEuVGltZVVuaXQuTUFYLCBcIkFyZ3VtZW50LlVuaXRcIiwgXCJJbnZhbGlkIHRpbWUgdW5pdCAlZFwiLCB0aGlzLl91bml0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGkxID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8vIHN0cmluZyBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB2YXIgcyA9IGkxO1xyXG4gICAgICAgICAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAodHJpbW1lZC5tYXRjaCgvXi0/XFxkXFxkPyg6XFxkXFxkPyg6XFxkXFxkPyguXFxkXFxkP1xcZD8pPyk/KT8kLykpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaWduID0gMTtcclxuICAgICAgICAgICAgICAgIHZhciBob3Vyc18xID0gMDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW51dGVzXzEgPSAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZHNfMSA9IDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJBcmd1bWVudC5TXCIsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNpZ24gPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91cnNfMSA9ICtwYXJ0c1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlc18xID0gK3BhcnRzWzFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kc18xID0gK3NlY29uZFBhcnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWNvbmRQYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kc18xID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kc18xICsgMTAwMCAqIHNlY29uZHNfMSArIDYwMDAwICogbWludXRlc18xICsgMzYwMDAwMCAqIGhvdXJzXzEpO1xyXG4gICAgICAgICAgICAgICAgLy8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG4gICAgICAgICAgICAgICAgaWYgKG1pbGxpc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1pbnV0ZXNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChob3Vyc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnRNc2VjIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3BsaXQgPSB0cmltbWVkLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdC5sZW5ndGggPT09IDIsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJyVzJ1wiLCBzKTtcclxuICAgICAgICAgICAgICAgIHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJyVzJywgY2Fubm90IHBhcnNlIGFtb3VudFwiLCBzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaTEgPT09IHVuZGVmaW5lZCAmJiB1bml0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZhbHNlLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcImludmFsaWQgY29uc3RydWN0b3IgYXJndW1lbnRzXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnllYXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1vbnRocyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5kYXlzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLmhvdXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ubWludXRlcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhbm90aGVyIGluc3RhbmNlIG9mIER1cmF0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50LCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cclxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cclxuICAgICAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hcyA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTW9udGhzID0gKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTW9udGhzID0gKHVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01zZWMgLyByZXFNc2VjO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcbiAgICAgKiB0aGUgc2FtZSB1bml0LlxyXG4gICAgICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmhvdXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG4gICAgICogZHVyaW5nIERTVCBjaGFuZ2VzKS5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBob3VyIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpLlxyXG4gICAgICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG4gICAgICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlSG91cnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXlzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRocyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS55ZWFycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xyXG4gICAgICAgICAgICAgICAgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHVuaXQgdGhpcyBkdXJhdGlvbiB3YXMgY3JlYXRlZCB3aXRoXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduXHJcbiAgICAgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuICAgICAqIFJldHVybnMgZmFsc2UgaWYgd2UgY2Fubm90IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsIGluIGFsbCB0aW1lIHpvbmVzXHJcbiAgICAgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZXF1YWxzRXhhY3QgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gb3RoZXIuX3VuaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9hbW91bnQgPT09IG90aGVyLl9hbW91bnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtb250aHMgYW5kIHllYXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkgJiYgb3RoZXIudW5pdCgpIDwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1pbGxpc2Vjb25kcyB0aHJvdWdoIGhvdXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGNhbm5vdCBjb21wYXJlIGRheXMgdG8gYW55dGhpbmcgZWxzZVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgaXMgYSBub24temVybyBsZW5ndGggZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm5vblplcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAhPT0gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGlzIGEgemVyby1sZW5ndGggZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnplcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gKG1vc3QgbmVnYXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGx5IHdpdGggYSBmaXhlZCBudW1iZXIuXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKiB2YWx1ZSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmIHZhbHVlICE9PSAwLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwiY2Fubm90IGRpdmlkZSBieSAlZFwiLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh2YWx1ZS5hbW91bnQoKSAhPT0gMCwgXCJBcmd1bWVudC5WYWx1ZVwiLCBcImNhbm5vdCBkaXZpZGUgYnkgMFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgLyB2YWx1ZS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBkdXJhdGlvbi5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICsgdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3QgYSBkdXJhdGlvbi5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgLSB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZHVyYXRpb24gaS5lLiByZW1vdmUgdGhlIHNpZ24uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fYW1vdW50ID49IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9GdWxsU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cclxuICAgICAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xyXG4gICAgICogYXJlIGNob3BwZWQgb2ZmIGlmIHplcm9cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9IbXNTdHJpbmcgPSBmdW5jdGlvbiAoZnVsbCkge1xyXG4gICAgICAgIGlmIChmdWxsID09PSB2b2lkIDApIHsgZnVsbCA9IGZhbHNlOyB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fdW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBUXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7IC8vIG5vdGUgdGhlIFwiVFwiIHRvIGRpc2FtYmlndWF0ZSB0aGUgXCJNXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2Vlazoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiV1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdC5cIik7IC8vIHByb2dyYW1taW5nIGVycm9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIHdpdGggYW1vdW50IGFuZCB1bml0IGUuZy4gJzEuNSB5ZWFycycgb3IgJy0xIGRheSdcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhpcyAlIHVuaXQsIGFsd2F5cyBwb3NpdGl2ZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5fcGFydCA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgdmFyIG5leHRVbml0O1xyXG4gICAgICAgIC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxyXG4gICAgICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGg7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbXNlY3MgPSAoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpKSAlIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKG5leHRVbml0KTtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRHVyYXRpb247XHJcbn0oKSk7XHJcbmV4cG9ydHMuRHVyYXRpb24gPSBEdXJhdGlvbjtcclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIER1cmF0aW9uLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxyXG4gKiBhZ2FpbnN0IGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgbGlicmFyeSBpbiBvbmUgcHJvY2VzcyBpbnN0ZWFkIG9mIGluc3RhbmNlb2ZcclxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNEdXJhdGlvbih2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIkR1cmF0aW9uXCI7XHJcbn1cclxuZXhwb3J0cy5pc0R1cmF0aW9uID0gaXNEdXJhdGlvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZHVyYXRpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTkgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5jb252ZXJ0RXJyb3IgPSBleHBvcnRzLmVycm9ySXMgPSBleHBvcnRzLmVycm9yID0gZXhwb3J0cy50aHJvd0Vycm9yID0gdm9pZCAwO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xyXG4vKipcclxuICogVGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1lc3NhZ2VcclxuICogQHBhcmFtIG5hbWUgZXJyb3IgbmFtZSwgd2l0aG91dCB0aW1lem9uZWNvbXBsZXRlIHByZWZpeFxyXG4gKiBAcGFyYW0gZm9ybWF0IG1lc3NhZ2Ugd2l0aCBwZXJjZW50LXN0eWxlIHBsYWNlaG9sZGVyc1xyXG4gKiBAcGFyYW0gYXJncyBhcmd1bWVudHMgZm9yIHRoZSBwbGFjZWhvbGRlcnNcclxuICogQHRocm93cyB0aGUgZ2l2ZW4gZXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHRocm93RXJyb3IobmFtZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBhcmdzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHV0aWwuZm9ybWF0KGZvcm1hdCwgYXJncykpO1xyXG4gICAgZXJyb3IubmFtZSA9IFwidGltZXpvbmVjb21wbGV0ZS5cIiArIG5hbWU7XHJcbiAgICB0aHJvdyBlcnJvcjtcclxufVxyXG5leHBvcnRzLnRocm93RXJyb3IgPSB0aHJvd0Vycm9yO1xyXG4vKipcclxuICogUmV0dXJucyBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBtZXNzYWdlXHJcbiAqIEBwYXJhbSBuYW1lXHJcbiAqIEBwYXJhbSBmb3JtYXRcclxuICogQHBhcmFtIGFyZ3NcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBlcnJvcihuYW1lLCBmb3JtYXQpIHtcclxuICAgIHZhciBhcmdzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGFyZ3NbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IodXRpbC5mb3JtYXQoZm9ybWF0LCBhcmdzKSk7XHJcbiAgICBlcnJvci5uYW1lID0gXCJ0aW1lem9uZWNvbXBsZXRlLlwiICsgbmFtZTtcclxuICAgIHJldHVybiBlcnJvcjtcclxufVxyXG5leHBvcnRzLmVycm9yID0gZXJyb3I7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWZmIGBlcnJvci5uYW1lYCBpcyBlcXVhbCB0byBvciBpbmNsdWRlZCBieSBgbmFtZWBcclxuICogQHBhcmFtIGVycm9yXHJcbiAqIEBwYXJhbSBuYW1lIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZXJyb3JJcyhlcnJvciwgbmFtZSkge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yLm5hbWUgPT09IFwidGltZXpvbmVjb21wbGV0ZS5cIiArIG5hbWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZXJyb3IubmFtZS5zdGFydHNXaXRoKFwidGltZXpvbmVjb21wbGV0ZS5cIikgJiYgbmFtZS5pbmNsdWRlcyhlcnJvci5uYW1lLnN1YnN0cihcInRpbWV6b25lY29tcGxldGUuXCIubGVuZ3RoKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5lcnJvcklzID0gZXJyb3JJcztcclxuLyoqXHJcbiAqIENvbnZlcnRzIGFsbCBlcnJvcnMgdGhyb3duIGJ5IGBjYmAgdG8gdGhlIGdpdmVuIGVycm9yIG5hbWVcclxuICogQHBhcmFtIGVycm9yTmFtZVxyXG4gKiBAcGFyYW0gY2JcclxuICogQHRocm93cyBbZXJyb3JOYW1lXVxyXG4gKi9cclxuZnVuY3Rpb24gY29udmVydEVycm9yKGVycm9yTmFtZSwgY2IpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGNiKCk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTmFtZSwgZS5tZXNzYWdlKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmNvbnZlcnRFcnJvciA9IGNvbnZlcnRFcnJvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXJyb3IuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXHJcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5mb3JtYXQgPSB2b2lkIDA7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XHJcbnZhciBsb2NhbGVfMSA9IHJlcXVpcmUoXCIuL2xvY2FsZVwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xyXG4vKipcclxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gbG9jYWxab25lIFRoZSB6b25lIHRoYXQgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgTERNTCBmb3JtYXQgcGF0dGVybiAoc2VlIExETUwubWQpXHJcbiAqIEBwYXJhbSBsb2NhbGUgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXQoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgZm9ybWF0U3RyaW5nLCBsb2NhbGUpIHtcclxuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxyXG4gICAgdmFyIG1lcmdlZExvY2FsZSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBsb2NhbGVfMS5ERUZBVUxUX0xPQ0FMRSksIGxvY2FsZSk7XHJcbiAgICB2YXIgdG9rZW5zID0gdG9rZW5fMS50b2tlbml6ZShmb3JtYXRTdHJpbmcpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIHRva2Vuc18xID0gdG9rZW5zOyBfaSA8IHRva2Vuc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc18xW19pXTtcclxuICAgICAgICB2YXIgdG9rZW5SZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLllFQVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFS0RBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuREFZUEVSSU9EOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSA/IGxvY2FsWm9uZSA6IHVuZGVmaW5lZCwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFSzpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IHRva2VuUmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdC50cmltKCk7XHJcbn1cclxuZXhwb3J0cy5mb3JtYXQgPSBmb3JtYXQ7XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGVyYSAoQkMgb3IgQUQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHZhciBBRCA9IGRhdGVUaW1lLnllYXIgPiAwO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFswXSA6IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFsxXSk7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYVdpZGVbMF0gOiBsb2NhbGUuZXJhV2lkZVsxXSk7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYU5hcnJvd1swXSA6IGxvY2FsZS5lcmFOYXJyb3dbMV0pO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwieVwiOlxyXG4gICAgICAgIGNhc2UgXCJZXCI6XHJcbiAgICAgICAgY2FzZSBcInJcIjpcclxuICAgICAgICAgICAgdmFyIHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcclxuICAgICAgICAgICAgICAgIHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHllYXJWYWx1ZTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHZhciBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJRXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBsb2NhbGUucXVhcnRlcldvcmQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInFcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgbG9jYWxlKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJNXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUubG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLm1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiTFwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5zdGFuZEFsb25lU2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5zdGFuZEFsb25lTG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrTnVtYmVyKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla09mTW9udGgoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5kYXkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIkRcIjpcclxuICAgICAgICAgICAgdmFyIGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgbG9jYWxlKSB7XHJcbiAgICB2YXIgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUubG9uZ1dlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLndlZWtkYXlUd29MZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBEYXkgUGVyaW9kIChBTSBvciBQTSlcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiYVwiOiB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPD0gMykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLmxlbmd0aCA9PT0gNCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJiXCI6XHJcbiAgICAgICAgY2FzZSBcIkJcIjoge1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoIDw9IDMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm1pZG5pZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubm9vbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLmxlbmd0aCA9PT0gNCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDAgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5taWRuaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDEyICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5taWRuaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDEyICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5ub29uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgSG91clxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHZhciBob3VyID0gZGF0ZVRpbWUuaG91cjtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImhcIjpcclxuICAgICAgICAgICAgaG91ciA9IGhvdXIgJSAxMjtcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSAxMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIkhcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJLXCI6XHJcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwia1wiOlxyXG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaG91ciA9IDI0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgbWludXRlXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC4qKiBpZiBhbnkgb2YgdGhlIGdpdmVuIGRhdGVUaW1lIGVsZW1lbnRzIGFyZSBpbnZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwic1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiU1wiOlxyXG4gICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBkYXRlVGltZS5taWxsaTtcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZyYWN0aW9uU3RyaW5nLnNsaWNlKDAsIHRva2VuLmxlbmd0aCk7XHJcbiAgICAgICAgY2FzZSBcIkFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Muc2Vjb25kT2ZEYXkoZGF0ZVRpbWUuaG91ciwgZGF0ZVRpbWUubWludXRlLCBkYXRlVGltZS5zZWNvbmQpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB0aW1lIHpvbmUuIEZvciB0aGlzLCB3ZSBuZWVkIHRoZSBjdXJyZW50IHRpbWUsIHRoZSB0aW1lIGluIFVUQyBhbmQgdGhlIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gY3VycmVudFRpbWUgVGhlIHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xyXG4gKiBAcGFyYW0gem9uZSBUaGUgdGltZXpvbmUgY3VycmVudFRpbWUgaXMgaW5cclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCB0b2tlbikge1xyXG4gICAgaWYgKCF6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZCgoY3VycmVudFRpbWUudW5peE1pbGxpcyAtIHV0Y1RpbWUudW5peE1pbGxpcykgLyA2MDAwMCk7XHJcbiAgICB2YXIgb2Zmc2V0SG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcbiAgICB2YXIgb2Zmc2V0SG91cnNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0SG91cnMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgb2Zmc2V0SG91cnNTdHJpbmcgPSAob2Zmc2V0ID49IDAgPyBcIitcIiArIG9mZnNldEhvdXJzU3RyaW5nIDogXCItXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyk7XHJcbiAgICB2YXIgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcclxuICAgIHZhciBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgdmFyIHJlc3VsdDtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcIk9cIjpcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCJHTVRcIjtcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIrXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCItXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPiA0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gdG9rZW4ucmF3LnNsaWNlKDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgY2FzZSBcIlpcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUb2tlbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXc6IFwiT09PT1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IFwiT1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0b2tlbl8xLlRva2VuVHlwZS5aT05FXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwielwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInZcIjpcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIlZcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWRcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ1bmtcIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5uYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiWFwiOlxyXG4gICAgICAgIGNhc2UgXCJ4XCI6XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIG9mZnNldCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiWlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IC8vIE5vIHNlY29uZHMgaW4gb3VyIGltcGxlbWVudGF0aW9uLCBzbyB0aGlzIGlzIHRoZSBzYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1mb3JtYXQuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIEdsb2JhbCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIERhdGVUaW1lL0R1cmF0aW9uIGV0Y1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5hYnMgPSBleHBvcnRzLm1heCA9IGV4cG9ydHMubWluID0gdm9pZCAwO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMSBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRDIgaWYgZDEgaXMgdW5kZWZpbmVkL251bGwsIG9yIGlmIGQxIGFuZCBkMiBhcmUgbm90IGJvdGggZGF0ZXRpbWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBtaW4oZDEsIGQyKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQxLCBcIkFyZ3VtZW50LkQxXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQyLCBcIkFyZ3VtZW50LkQyXCIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEua2luZCA9PT0gZDIua2luZCwgXCJBcmd1bWVudC5EMlwiLCBcImV4cGVjdGVkIGVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnNcIik7XHJcbiAgICByZXR1cm4gZDEubWluKGQyKTtcclxufVxyXG5leHBvcnRzLm1pbiA9IG1pbjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkQxIGlmIGQxIGlzIHVuZGVmaW5lZC9udWxsXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMiBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbCwgb3IgaWYgZDEgYW5kIGQyIGFyZSBub3QgYm90aCBkYXRldGltZXNcclxuICovXHJcbmZ1bmN0aW9uIG1heChkMSwgZDIpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiQXJndW1lbnQuRDFcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZDIsIFwiQXJndW1lbnQuRDJcIiwgXCJzZWNvbmQgYXJndW1lbnQgaXMgZmFsc3lcIik7XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMS5raW5kID09PSBkMi5raW5kLCBcIkFyZ3VtZW50LkQyXCIsIFwiZXhwZWN0ZWQgZWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9uc1wiKTtcclxuICAgIHJldHVybiBkMS5tYXgoZDIpO1xyXG59XHJcbmV4cG9ydHMubWF4ID0gbWF4O1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgYSBEdXJhdGlvblxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRCBpZiBkIGlzIHVuZGVmaW5lZC9udWxsXHJcbiAqL1xyXG5mdW5jdGlvbiBhYnMoZCkge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkLCBcIkFyZ3VtZW50LkRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuICAgIHJldHVybiBkLmFicygpO1xyXG59XHJcbmV4cG9ydHMuYWJzID0gYWJzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5EYXRlRnVuY3Rpb25zID0gdm9pZCAwO1xyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbnZhciBEYXRlRnVuY3Rpb25zO1xyXG4oZnVuY3Rpb24gKERhdGVGdW5jdGlvbnMpIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoZSBEYXRlLmdldEZ1bGxZZWFyKCksIERhdGUuZ2V0TW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0XCJdID0gMF0gPSBcIkdldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG4gICAgICovXHJcbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRVVENcIl0gPSAxXSA9IFwiR2V0VVRDXCI7XHJcbn0pKERhdGVGdW5jdGlvbnMgPSBleHBvcnRzLkRhdGVGdW5jdGlvbnMgfHwgKGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWphdmFzY3JpcHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNyBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRFRkFVTFRfTE9DQUxFID0gZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1cgPSBleHBvcnRzLkRBWV9QRVJJT0RTX1dJREUgPSBleHBvcnRzLkRBWV9QRVJJT0RTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMgPSBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBleHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNUQU5EX0FMT05FX0xPTkdfTU9OVEhfTkFNRVMgPSBleHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTID0gZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfV09SRCA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIgPSBleHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IGV4cG9ydHMuUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IGV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5FUkFfTkFNRVNfV0lERSA9IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyA9IHZvaWQgMDtcclxuZXhwb3J0cy5FUkFfTkFNRVNfTkFSUk9XID0gW1wiQVwiLCBcIkJcIl07XHJcbmV4cG9ydHMuRVJBX05BTUVTX1dJREUgPSBbXCJBbm5vIERvbWluaVwiLCBcIkJlZm9yZSBDaHJpc3RcIl07XHJcbmV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gW1wiQURcIiwgXCJCQ1wiXTtcclxuZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IFwiUVwiO1xyXG5leHBvcnRzLlFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xyXG5leHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuLyoqXHJcbiAqIEluIHNvbWUgbGFuZ3VhZ2VzLCBkaWZmZXJlbnQgd29yZHMgYXJlIG5lY2Vzc2FyeSBmb3Igc3RhbmQtYWxvbmUgcXVhcnRlciBuYW1lc1xyXG4gKi9cclxuZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX0xFVFRFUiA9IGV4cG9ydHMuUVVBUlRFUl9MRVRURVI7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX1dPUkQ7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMuc2xpY2UoKTtcclxuZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbmV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMgPSBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbmV4cG9ydHMuTU9OVEhfTEVUVEVSUyA9IFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5MT05HX01PTlRIX05BTUVTLnNsaWNlKCk7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTLnNsaWNlKCk7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuTU9OVEhfTEVUVEVSUy5zbGljZSgpO1xyXG5leHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG5leHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbmV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyA9IFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xyXG5leHBvcnRzLldFRUtEQVlfTEVUVEVSUyA9IFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XHJcbmV4cG9ydHMuREFZX1BFUklPRFNfQUJCUkVWSUFURUQgPSB7IGFtOiBcIkFNXCIsIHBtOiBcIlBNXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtaWQuXCIgfTtcclxuZXhwb3J0cy5EQVlfUEVSSU9EU19XSURFID0geyBhbTogXCJBTVwiLCBwbTogXCJQTVwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWlkbmlnaHRcIiB9O1xyXG5leHBvcnRzLkRBWV9QRVJJT0RTX05BUlJPVyA9IHsgYW06IFwiQVwiLCBwbTogXCJQXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtZFwiIH07XHJcbmV4cG9ydHMuREVGQVVMVF9MT0NBTEUgPSB7XHJcbiAgICBlcmFOYXJyb3c6IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyxcclxuICAgIGVyYVdpZGU6IGV4cG9ydHMuRVJBX05BTUVTX1dJREUsXHJcbiAgICBlcmFBYmJyZXZpYXRlZDogZXhwb3J0cy5FUkFfTkFNRVNfQUJCUkVWSUFURUQsXHJcbiAgICBxdWFydGVyTGV0dGVyOiBleHBvcnRzLlFVQVJURVJfTEVUVEVSLFxyXG4gICAgcXVhcnRlcldvcmQ6IGV4cG9ydHMuUVVBUlRFUl9XT1JELFxyXG4gICAgcXVhcnRlckFiYnJldmlhdGlvbnM6IGV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxyXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIsXHJcbiAgICBzdGFuZEFsb25lUXVhcnRlcldvcmQ6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JELFxyXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuICAgIGxvbmdNb250aE5hbWVzOiBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMsXHJcbiAgICBzaG9ydE1vbnRoTmFtZXM6IGV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMsXHJcbiAgICBtb250aExldHRlcnM6IGV4cG9ydHMuTU9OVEhfTEVUVEVSUyxcclxuICAgIHN0YW5kQWxvbmVMb25nTW9udGhOYW1lczogZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTLFxyXG4gICAgc3RhbmRBbG9uZVNob3J0TW9udGhOYW1lczogZXhwb3J0cy5TVEFORF9BTE9ORV9TSE9SVF9NT05USF9OQU1FUyxcclxuICAgIHN0YW5kQWxvbmVNb250aExldHRlcnM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyxcclxuICAgIGxvbmdXZWVrZGF5TmFtZXM6IGV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTLFxyXG4gICAgc2hvcnRXZWVrZGF5TmFtZXM6IGV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuICAgIHdlZWtkYXlUd29MZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMsXHJcbiAgICB3ZWVrZGF5TGV0dGVyczogZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMsXHJcbiAgICBkYXlQZXJpb2RBYmJyZXZpYXRlZDogZXhwb3J0cy5EQVlfUEVSSU9EU19BQkJSRVZJQVRFRCxcclxuICAgIGRheVBlcmlvZFdpZGU6IGV4cG9ydHMuREFZX1BFUklPRFNfV0lERSxcclxuICAgIGRheVBlcmlvZE5hcnJvdzogZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1dcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBNYXRoIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnBvc2l0aXZlTW9kdWxvID0gZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGV4cG9ydHMucm91bmRTeW0gPSBleHBvcnRzLmlzSW50ID0gdm9pZCAwO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNJbnQobikge1xyXG4gICAgaWYgKG4gPT09IG51bGwgfHwgIWlzRmluaXRlKG4pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcclxufVxyXG5leHBvcnRzLmlzSW50ID0gaXNJbnQ7XHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5OIGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gcm91bmRTeW0obikge1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUobiksIFwiQXJndW1lbnQuTlwiLCBcIm4gbXVzdCBiZSBhIGZpbml0ZSBudW1iZXIgYnV0IGlzOiAlZFwiLCBuKTtcclxuICAgIGlmIChuIDwgMCkge1xyXG4gICAgICAgIHJldHVybiAtMSAqIE1hdGgucm91bmQoLTEgKiBuKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG4pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucm91bmRTeW0gPSByb3VuZFN5bTtcclxuLyoqXHJcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxyXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xyXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZSkge1xyXG4gICAgaWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBOYU47XHJcbn1cclxuZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGZpbHRlckZsb2F0O1xyXG4vKipcclxuICogTW9kdWxvIGZ1bmN0aW9uIHRoYXQgb25seSByZXR1cm5zIGEgcG9zaXRpdmUgcmVzdWx0LCBpbiBjb250cmFzdCB0byB0aGUgJSBvcGVyYXRvclxyXG4gKiBAcGFyYW0gdmFsdWVcclxuICogQHBhcmFtIG1vZHVsb1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVmFsdWUgaWYgdmFsdWUgaXMgbm90IGZpbml0ZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9kdWxvIGlmIG1vZHVsbyBpcyBub3QgYSBmaW5pdGUgbnVtYmVyID49IDFcclxuICovXHJcbmZ1bmN0aW9uIHBvc2l0aXZlTW9kdWxvKHZhbHVlLCBtb2R1bG8pIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzRmluaXRlKHZhbHVlKSwgXCJBcmd1bWVudC5WYWx1ZVwiLCBcInZhbHVlIHNob3VsZCBiZSBmaW5pdGVcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZShtb2R1bG8pICYmIG1vZHVsbyA+PSAxLCBcIkFyZ3VtZW50Lk1vZHVsb1wiLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuICAgIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICByZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlICUgbW9kdWxvO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucG9zaXRpdmVNb2R1bG8gPSBwb3NpdGl2ZU1vZHVsbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcclxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnBhcnNlID0gZXhwb3J0cy5wYXJzZWFibGUgPSB2b2lkIDA7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIGxvY2FsZV8xID0gcmVxdWlyZShcIi4vbG9jYWxlXCIpO1xyXG52YXIgbWF0aF8xID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIGRhdGV0aW1lIHN0cmluZyBpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGZvcm1hdFxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nIChzZWUgTERNTC5tZClcclxuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcclxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCB1bmRlZmluZWQsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlYWJsZSA9IHBhcnNlYWJsZTtcclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEBwYXJhbSBvdmVycmlkZVpvbmUgVXNlIHRoaXMgem9uZSBpbiB0aGUgcmVzdWx0XHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIGNoYXJhY3RlcnMgaW4gdGhlIHNvdXJjZSBzdHJpbmdcclxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIGRhdGVUaW1lU3RyaW5nIGlzIHdyb25nIG9yIG5vdCBhY2NvcmRpbmcgdG8gdGhlIHBhdHRlcm5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBpZiB0aGUgZ2l2ZW4gZm9ybWF0IHN0cmluZyBpcyBpbnZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBvdmVycmlkZVpvbmUsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxyXG4gICAgaWYgKGxvY2FsZSA9PT0gdm9pZCAwKSB7IGxvY2FsZSA9IHt9OyB9XHJcbiAgICBpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJubyBkYXRlIGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFmb3JtYXRTdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwibm8gZm9ybWF0IGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIG1lcmdlZExvY2FsZSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBsb2NhbGVfMS5ERUZBVUxUX0xPQ0FMRSksIGxvY2FsZSk7XHJcbiAgICB2YXIgeWVhckN1dG9mZiA9IG1hdGhfMS5wb3NpdGl2ZU1vZHVsbygobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgNTApLCAxMDApO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgdG9rZW5zID0gdG9rZW5fMS50b2tlbml6ZShmb3JtYXRTdHJpbmcpO1xyXG4gICAgICAgIHZhciB0aW1lID0geyB5ZWFyOiB1bmRlZmluZWQgfTtcclxuICAgICAgICB2YXIgem9uZSA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcG5yID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBwenIgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIGRwciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgZXJhID0gMTtcclxuICAgICAgICB2YXIgcXVhcnRlciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgcmVtYWluaW5nID0gZGF0ZVRpbWVTdHJpbmc7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB0b2tlbnNfMSA9IHRva2VuczsgX2kgPCB0b2tlbnNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gdG9rZW5zXzFbX2ldO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgICAgIF9hID0gc3RyaXBFcmEodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKSwgZXJhID0gX2FbMF0sIHJlbWFpbmluZyA9IF9hWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBzdHJpcFF1YXJ0ZXIodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVhcnRlciA9IHIubjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5XRUVLREFZOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBXZWVrRGF5KHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5XRUVLOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMikucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBub3RoaW5nIHRvIGxlYXJuIGZyb20gdGhpc1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcbiAgICAgICAgICAgICAgICAgICAgZHByID0gc3RyaXBEYXlQZXJpb2QodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBkcHIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgSW5maW5pdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG5yLm4gPiB5ZWFyQ3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSAxOTAwICsgcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSAyMDAwICsgcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBNb250aCh0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5EQVk6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUuZGF5ID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBIb3VyKHRva2VuLCByZW1haW5pbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLk1JTlVURTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBTZWNvbmQodG9rZW4sIHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuc2Vjb25kID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAxMDAwICogcGFyc2VGbG9hdChcIjAuXCIgKyBNYXRoLmZsb29yKHBuci5uKS50b1N0cmluZygxMCkuc2xpY2UoMCwgMykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSBNYXRoLmZsb29yKChwbnIubiAvIDM2MDBFMykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gTWF0aC5mbG9vcihtYXRoXzEucG9zaXRpdmVNb2R1bG8ocG5yLm4gLyA2MEUzLCA2MCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuc2Vjb25kID0gTWF0aC5mbG9vcihtYXRoXzEucG9zaXRpdmVNb2R1bG8ocG5yLm4gLyAxMDAwLCA2MCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSBtYXRoXzEucG9zaXRpdmVNb2R1bG8ocG5yLm4sIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcInVuc3VwcG9ydGVkIHNlY29uZCBmb3JtYXQgJ1wiICsgdG9rZW4ucmF3ICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5aT05FOlxyXG4gICAgICAgICAgICAgICAgICAgIHB6ciA9IHN0cmlwWm9uZSh0b2tlbiwgcmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvbmUgPSBwenIuem9uZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5JREVOVElUWTpcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcFJhdyhyZW1haW5pbmcsIHRva2VuLnJhdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRwcikge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGRwci50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiYW1cIjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyICE9PSB1bmRlZmluZWQgJiYgdGltZS5ob3VyID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciAtPSAxMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicG1cIjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyICE9PSB1bmRlZmluZWQgJiYgdGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJub29uXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSAxMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWludXRlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IDEyIHx8IHRpbWUubWludXRlICE9PSAwIHx8IHRpbWUuc2Vjb25kICE9PSAwIHx8IHRpbWUubWlsbGkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIHRpbWUsIGNvbnRhaW5zICdub29uJyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG5vb25cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm1pZG5pZ2h0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWludXRlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IDAgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgdGltZSwgY29udGFpbnMgJ21pZG5pZ2h0JyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG1pZG5pZ2h0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGltZS55ZWFyICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGltZS55ZWFyICo9IGVyYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHF1YXJ0ZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAodGltZS5tb250aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHF1YXJ0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA3O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JfMiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChxdWFydGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8yID0gISh0aW1lLm1vbnRoID49IDEgJiYgdGltZS5tb250aCA8PSAzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8yID0gISh0aW1lLm1vbnRoID49IDQgJiYgdGltZS5tb250aCA8PSA2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8yID0gISh0aW1lLm1vbnRoID49IDcgJiYgdGltZS5tb250aCA8PSA5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8yID0gISh0aW1lLm1vbnRoID49IDEwICYmIHRpbWUubW9udGggPD0gMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcl8yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJ0aGUgcXVhcnRlciBkb2VzIG5vdCBtYXRjaCB0aGUgbW9udGhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbWUueWVhciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRpbWUueWVhciA9IDE5NzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSB7IHRpbWU6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRpbWUpLCB6b25lOiB6b25lIH07XHJcbiAgICAgICAgaWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCByZXN1bHRpbmcgZGF0ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxyXG4gICAgICAgIGlmIChvdmVycmlkZVpvbmUpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnpvbmUgPSBvdmVycmlkZVpvbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIGRhdGUgJ1wiICsgZGF0ZVRpbWVTdHJpbmcgKyBcIicgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJ1wiICsgZm9ybWF0U3RyaW5nICsgXCInOiB0cmFpbGluZyBjaGFyYWN0ZXJzOiAnXCIgKyByZW1haW5pbmcgKyBcIidcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCBkYXRlICdcIiArIGRhdGVUaW1lU3RyaW5nICsgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIiArIGZvcm1hdFN0cmluZyArIFwiJzogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcclxudmFyIFdISVRFU1BBQ0UgPSBbXCIgXCIsIFwiXFx0XCIsIFwiXFxyXCIsIFwiXFx2XCIsIFwiXFxuXCJdO1xyXG4vKipcclxuICpcclxuICogQHBhcmFtIHRva2VuXHJcbiAqIEBwYXJhbSBzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RJbXBsZW1lbnRlZCBpZiBhIHBhdHRlcm4gaXMgdXNlZCB0aGF0IGlzbid0IGltcGxlbWVudGVkIHlldCAoeiwgWiwgdiwgViwgeCwgWClcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBub3QgcGFyc2VhYmxlXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcFpvbmUodG9rZW4sIHMpIHtcclxuICAgIHZhciB1bnN1cHBvcnRlZCA9ICh0b2tlbi5zeW1ib2wgPT09IFwielwiKVxyXG4gICAgICAgIHx8ICh0b2tlbi5zeW1ib2wgPT09IFwiWlwiICYmIHRva2VuLmxlbmd0aCA9PT0gNSlcclxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcInZcIilcclxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcIlZcIiAmJiB0b2tlbi5sZW5ndGggIT09IDIpXHJcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJ4XCIgJiYgdG9rZW4ubGVuZ3RoID49IDQpXHJcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgdG9rZW4ubGVuZ3RoID49IDQpO1xyXG4gICAgaWYgKHVuc3VwcG9ydGVkKSB7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIk5vdEltcGxlbWVudGVkXCIsIFwidGltZSB6b25lIHBhdHRlcm4gJ1wiICsgdG9rZW4ucmF3ICsgXCInIGlzIG5vdCBpbXBsZW1lbnRlZFwiKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgcmVtYWluaW5nOiBzXHJcbiAgICB9O1xyXG4gICAgLy8gY2hvcCBvZmYgXCJHTVRcIiBwcmVmaXggaWYgbmVlZGVkXHJcbiAgICB2YXIgaGFkR01UID0gZmFsc2U7XHJcbiAgICBpZiAoKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA0KSB8fCB0b2tlbi5zeW1ib2wgPT09IFwiT1wiKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5yZW1haW5pbmcudG9VcHBlckNhc2UoKS5zdGFydHNXaXRoKFwiR01UXCIpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICBoYWRHTVQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHBhcnNlIGFueSB6b25lLCByZWdhcmRsZXNzIG9mIHNwZWNpZmllZCBmb3JtYXRcclxuICAgIHZhciB6b25lU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuICAgICAgICB6b25lU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIHpvbmVTdHJpbmcgPSB6b25lU3RyaW5nLnRyaW0oKTtcclxuICAgIGlmICh6b25lU3RyaW5nKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIGNob3BwaW5nIG9mZiBHTVQgZG9lcyBub3QgaGlkZSB0aW1lIHpvbmUgZXJyb3JzIChiaXQgb2YgYSBzbG9wcHkgcmVnZXggYnV0IE9LKVxyXG4gICAgICAgIGlmIChoYWRHTVQgJiYgIXpvbmVTdHJpbmcubWF0Y2goL1tcXCtcXC1dP1tcXGRcXDpdKy9pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgdGltZSB6b25lICdHTVRcIiArIHpvbmVTdHJpbmcgKyBcIidcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC56b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS56b25lKHpvbmVTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFtcIkFyZ3VtZW50LlNcIiwgXCJOb3RGb3VuZC5ab25lXCJdKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGVycm9yXzEuZXJyb3IoXCJQYXJzZUVycm9yXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcIm5vIHRpbWUgem9uZSBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSBzXHJcbiAqIEBwYXJhbSBleHBlY3RlZFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBSYXcocywgZXhwZWN0ZWQpIHtcclxuICAgIHZhciByZW1haW5pbmcgPSBzO1xyXG4gICAgdmFyIGVyZW1haW5pbmcgPSBleHBlY3RlZDtcclxuICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiBlcmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLmNoYXJBdCgwKSA9PT0gZXJlbWFpbmluZy5jaGFyQXQoMCkpIHtcclxuICAgICAgICByZW1haW5pbmcgPSByZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgICAgIGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIGlmIChlcmVtYWluaW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImV4cGVjdGVkICdcIiArIGV4cGVjdGVkICsgXCInXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbWFpbmluZztcclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHRva2VuXHJcbiAqIEBwYXJhbSByZW1haW5pbmdcclxuICogQHBhcmFtIGxvY2FsZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBEYXlQZXJpb2QodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XHJcbiAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZjtcclxuICAgIHZhciBvZmZzZXRzO1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiYVwiOlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2EgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FbbG9jYWxlLmRheVBlcmlvZFdpZGUuYW1dID0gXCJhbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYVtsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9iID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW1dID0gXCJhbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYltsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXSA9IFwicG1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9jID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbV0gPSBcImFtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2QgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUuYW1dID0gXCJhbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZFtsb2NhbGUuZGF5UGVyaW9kV2lkZS5taWRuaWdodF0gPSBcIm1pZG5pZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLnBtXSA9IFwicG1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbl0gPSBcIm5vb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2UgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbV0gPSBcImFtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cubWlkbmlnaHRdID0gXCJtaWRuaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZVtsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXSA9IFwicG1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5ub29uXSA9IFwibm9vblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2YgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtXSA9IFwiYW1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm1pZG5pZ2h0XSA9IFwibWlkbmlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtXSA9IFwicG1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm5vb25dID0gXCJub29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIC8vIG1hdGNoIGxvbmdlc3QgcG9zc2libGUgZGF5IHBlcmlvZCBzdHJpbmc7IHNvcnQga2V5cyBieSBsZW5ndGggZGVzY2VuZGluZ1xyXG4gICAgdmFyIHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyhvZmZzZXRzKVxyXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiAoYS5sZW5ndGggPCBiLmxlbmd0aCA/IDEgOiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gLTEgOiAwKTsgfSk7XHJcbiAgICB2YXIgdXBwZXIgPSByZW1haW5pbmcudG9VcHBlckNhc2UoKTtcclxuICAgIGZvciAodmFyIF9pID0gMCwgc29ydGVkS2V5c18xID0gc29ydGVkS2V5czsgX2kgPCBzb3J0ZWRLZXlzXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNfMVtfaV07XHJcbiAgICAgICAgaWYgKHVwcGVyLnN0YXJ0c1dpdGgoa2V5LnRvVXBwZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBvZmZzZXRzW2tleV0sXHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmc6IHJlbWFpbmluZy5zbGljZShrZXkubGVuZ3RoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwibWlzc2luZyBkYXkgcGVyaW9kIGkuZS4gXCIgKyBPYmplY3Qua2V5cyhvZmZzZXRzKS5qb2luKFwiLCBcIikpO1xyXG59XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGZhY3RvciAtMSBvciAxIGRlcGVuZGluZyBvbiBCQyBvciBBRFxyXG4gKiBAcGFyYW0gdG9rZW5cclxuICogQHBhcmFtIHJlbWFpbmluZ1xyXG4gKiBAcGFyYW0gbG9jYWxlXHJcbiAqIEByZXR1cm5zIFtmYWN0b3IsIHJlbWFpbmluZ11cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwRXJhKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIGFsbG93ZWQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5lcmFXaWRlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuZXJhTmFycm93O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmVyYUFiYnJldmlhdGVkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XHJcbiAgICByZXR1cm4gW2FsbG93ZWQuaW5kZXhPZihyZXN1bHQuY2hvc2VuKSA9PT0gMCA/IDEgOiAtMSwgcmVzdWx0LnJlbWFpbmluZ107XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBRdWFydGVyKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIHF1YXJ0ZXJMZXR0ZXI7XHJcbiAgICB2YXIgcXVhcnRlcldvcmQ7XHJcbiAgICB2YXIgcXVhcnRlckFiYnJldmlhdGlvbnM7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJRXCI6XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUucXVhcnRlckxldHRlcjtcclxuICAgICAgICAgICAgcXVhcnRlcldvcmQgPSBsb2NhbGUucXVhcnRlcldvcmQ7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJBYmJyZXZpYXRpb25zID0gbG9jYWxlLnF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwicVwiOiB7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJXb3JkID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcclxuICAgICAgICAgICAgcXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBxdWFydGVyIHBhdHRlcm5cIik7XHJcbiAgICB9XHJcbiAgICB2YXIgYWxsb3dlZDtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMSk7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBbMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uIChuKSB7IHJldHVybiBxdWFydGVyTGV0dGVyICsgbi50b1N0cmluZygxMCk7IH0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBxdWFydGVyQWJicmV2aWF0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgKyBcIiBcIiArIHF1YXJ0ZXJXb3JkOyB9KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBxdWFydGVyIHBhdHRlcm5cIik7XHJcbiAgICB9XHJcbiAgICB2YXIgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcclxuICAgIHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHJldHVybnMgcmVtYWluaW5nIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcFdlZWtEYXkodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XHJcbiAgICB2YXIgYWxsb3dlZDtcclxuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDEpLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUubG9uZ1dlZWtkYXlOYW1lcztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLndlZWtkYXlMZXR0ZXJzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUud2Vla2RheVR3b0xldHRlcnM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XHJcbiAgICByZXR1cm4gci5yZW1haW5pbmc7XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBNb250aCh0b2tlbiwgcmVtYWluaW5nLCBsb2NhbGUpIHtcclxuICAgIHZhciBzaG9ydE1vbnRoTmFtZXM7XHJcbiAgICB2YXIgbG9uZ01vbnRoTmFtZXM7XHJcbiAgICB2YXIgbW9udGhMZXR0ZXJzO1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiTVwiOlxyXG4gICAgICAgICAgICBzaG9ydE1vbnRoTmFtZXMgPSBsb2NhbGUuc2hvcnRNb250aE5hbWVzO1xyXG4gICAgICAgICAgICBsb25nTW9udGhOYW1lcyA9IGxvY2FsZS5sb25nTW9udGhOYW1lcztcclxuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLm1vbnRoTGV0dGVycztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkxcIjpcclxuICAgICAgICAgICAgc2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM7XHJcbiAgICAgICAgICAgIGxvbmdNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVMb25nTW9udGhOYW1lcztcclxuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcclxuICAgIH1cclxuICAgIHZhciBhbGxvd2VkO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBzaG9ydE1vbnRoTmFtZXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvbmdNb250aE5hbWVzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBtb250aExldHRlcnM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcclxuICAgIH1cclxuICAgIHZhciByID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xyXG4gICAgcmV0dXJuIHsgbjogYWxsb3dlZC5pbmRleE9mKHIuY2hvc2VuKSArIDEsIHJlbWFpbmluZzogci5yZW1haW5pbmcgfTtcclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHRva2VuXHJcbiAqIEBwYXJhbSByZW1haW5pbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwSG91cih0b2tlbiwgcmVtYWluaW5nKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImhcIjpcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5uID09PSAxMikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Lm4gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJIXCI6XHJcbiAgICAgICAgICAgIC8vIG5vdGhpbmcsIGluIHJhbmdlIDAtMjNcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIktcIjpcclxuICAgICAgICAgICAgLy8gbm90aGluZywgaW4gcmFuZ2UgMC0xMVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwia1wiOlxyXG4gICAgICAgICAgICByZXN1bHQubiAtPSAxO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwU2Vjb25kKHRva2VuLCByZW1haW5pbmcpIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcInNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcbiAgICAgICAgY2FzZSBcIlNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgdG9rZW4ubGVuZ3RoKTtcclxuICAgICAgICBjYXNlIFwiQVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCA4KTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHNlY29uZHMgcGF0dGVyblwiKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHNcclxuICogQHBhcmFtIG1heExlbmd0aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBOdW1iZXIocywgbWF4TGVuZ3RoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIG46IE5hTixcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChudW1iZXJTdHJpbmcubGVuZ3RoIDwgbWF4TGVuZ3RoICYmIHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcbiAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXHJcbiAgICB3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgcmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcclxuICAgIGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIU51bWJlci5pc0Zpbml0ZShyZXN1bHQubikpIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImV4cGVjdGVkIGEgbnVtYmVyIGJ1dCBnb3QgJ1wiICsgbnVtYmVyU3RyaW5nICsgXCInXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHRva2VuXHJcbiAqIEBwYXJhbSByZW1haW5pbmdcclxuICogQHBhcmFtIGFsbG93ZWRcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKSB7XHJcbiAgICAvLyBtYXRjaCBsb25nZXN0IHBvc3NpYmxlIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXHJcbiAgICB2YXIgc29ydGVkS2V5cyA9IGFsbG93ZWQuc2xpY2UoKVxyXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiAoYS5sZW5ndGggPCBiLmxlbmd0aCA/IDEgOiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gLTEgOiAwKTsgfSk7XHJcbiAgICB2YXIgdXBwZXIgPSByZW1haW5pbmcudG9VcHBlckNhc2UoKTtcclxuICAgIGZvciAodmFyIF9pID0gMCwgc29ydGVkS2V5c18yID0gc29ydGVkS2V5czsgX2kgPCBzb3J0ZWRLZXlzXzIubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNfMltfaV07XHJcbiAgICAgICAgaWYgKHVwcGVyLnN0YXJ0c1dpdGgoa2V5LnRvVXBwZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjaG9zZW46IGtleSxcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZzogcmVtYWluaW5nLnNsaWNlKGtleS5sZW5ndGgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIFwiICsgdG9rZW5fMS5Ub2tlblR5cGVbdG9rZW4udHlwZV0udG9Mb3dlckNhc2UoKSArIFwiLCBleHBlY3RlZCBvbmUgb2YgXCIgKyBhbGxvd2VkLmpvaW4oXCIsIFwiKSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2UuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIFBlcmlvZGljIGludGVydmFsIGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy50aW1lc3RhbXBPbldlZWtUaW1lTGVzc1RoYW4gPSBleHBvcnRzLnRpbWVzdGFtcE9uV2Vla1RpbWVHcmVhdGVyVGhhbk9yRXF1YWxUbyA9IGV4cG9ydHMuaXNQZXJpb2QgPSBleHBvcnRzLmlzVmFsaWRQZXJpb2RKc29uID0gZXhwb3J0cy5QZXJpb2QgPSBleHBvcnRzLnBlcmlvZERzdFRvU3RyaW5nID0gZXhwb3J0cy5QZXJpb2REc3QgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZGF0ZXRpbWVfMSA9IHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG4vKipcclxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcclxuICogZHVyaW5nIERTVCBjaGFuZ2VzLlxyXG4gKi9cclxudmFyIFBlcmlvZERzdDtcclxuKGZ1bmN0aW9uIChQZXJpb2REc3QpIHtcclxuICAgIC8qKlxyXG4gICAgICogS2VlcCByZXBlYXRpbmcgaW4gc2ltaWxhciBpbnRlcnZhbHMgbWVhc3VyZWQgaW4gVVRDLFxyXG4gICAgICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cclxuICAgICAqIEUuZy4gYSByZXBldGl0aW9uIG9mIG9uZSBob3VyIHdpbGwgdGFrZSBvbmUgcmVhbCBob3VyXHJcbiAgICAgKiBldmVyeSB0aW1lLCBldmVuIGluIGEgdGltZSB6b25lIHdpdGggRFNULlxyXG4gICAgICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxyXG4gICAgICogZGlmZmVyZW5jZXMgd2lsbCBzdGlsbCBtYWtlIHRoZSBpbnRlcnZhbHMgZGlmZmVyZW50LlxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckludGVydmFsc1wiXSA9IDBdID0gXCJSZWd1bGFySW50ZXJ2YWxzXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxyXG4gICAgICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxyXG4gICAgICogYSBwZXJpb2Qgb2Ygb25lIGRheSwgcmVmZXJlbmNlaW5nIGF0IDg6MDVBTSBFdXJvcGUvQW1zdGVyZGFtIHRpbWVcclxuICAgICAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxyXG4gICAgICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcclxuICAgICAqIDIzIGhvdXJzIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICAgICAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXHJcbiAgICAgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckxvY2FsVGltZVwiXSA9IDFdID0gXCJSZWd1bGFyTG9jYWxUaW1lXCI7XHJcbiAgICAvKipcclxuICAgICAqIEVuZC1vZi1lbnVtIG1hcmtlclxyXG4gICAgICovXHJcbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiTUFYXCJdID0gMl0gPSBcIk1BWFwiO1xyXG59KShQZXJpb2REc3QgPSBleHBvcnRzLlBlcmlvZERzdCB8fCAoZXhwb3J0cy5QZXJpb2REc3QgPSB7fSkpO1xyXG4vKipcclxuICogQ29udmVydCBhIFBlcmlvZERzdCB0byBhIHN0cmluZzogXCJyZWd1bGFyIGludGVydmFsc1wiIG9yIFwicmVndWxhciBsb2NhbCB0aW1lXCJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlAgZm9yIGludmFsaWQgUGVyaW9kRHN0IHZhbHVlXHJcbiAqL1xyXG5mdW5jdGlvbiBwZXJpb2REc3RUb1N0cmluZyhwKSB7XHJcbiAgICBzd2l0Y2ggKHApIHtcclxuICAgICAgICBjYXNlIFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzOiByZXR1cm4gXCJyZWd1bGFyIGludGVydmFsc1wiO1xyXG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU6IHJldHVybiBcInJlZ3VsYXIgbG9jYWwgdGltZVwiO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlBcIiwgXCJpbnZhbGlkIFBlcmlvRHN0IHZhbHVlICVkXCIsIHApO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGVyaW9kRHN0VG9TdHJpbmcgPSBwZXJpb2REc3RUb1N0cmluZztcclxuLyoqXHJcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcclxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXHJcbiAqL1xyXG52YXIgUGVyaW9kID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFBlcmlvZChhLCBhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QsIGdpdmVuRHN0KSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtpbmQgPSBcIlBlcmlvZFwiO1xyXG4gICAgICAgIHZhciByZWZlcmVuY2U7XHJcbiAgICAgICAgdmFyIGludGVydmFsO1xyXG4gICAgICAgIHZhciBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuICAgICAgICBpZiAoZGF0ZXRpbWVfMS5pc0RhdGVUaW1lKGEpKSB7XHJcbiAgICAgICAgICAgIHJlZmVyZW5jZSA9IGE7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWw7XHJcbiAgICAgICAgICAgICAgICBkc3QgPSB1bml0T3JEc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiB1bml0T3JEc3QgPT09IFwibnVtYmVyXCIgJiYgdW5pdE9yRHN0ID49IDAgJiYgdW5pdE9yRHN0IDwgYmFzaWNzXzEuVGltZVVuaXQuTUFYLCBcIkFyZ3VtZW50LlVuaXRcIiwgXCJJbnZhbGlkIHVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGFtb3VudE9ySW50ZXJ2YWwsIHVuaXRPckRzdCk7XHJcbiAgICAgICAgICAgICAgICBkc3QgPSBnaXZlbkRzdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRzdCAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UgPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShhLnJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGEuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgZHN0ID0gYS5wZXJpb2REc3QgPT09IFwicmVndWxhclwiID8gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgOiBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50Lkpzb25cIiwgZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChkc3QgPj0gMCAmJiBkc3QgPCBQZXJpb2REc3QuTUFYLCBcIkFyZ3VtZW50LkRzdFwiLCBcIkludmFsaWQgUGVyaW9kRHN0IHNldHRpbmdcIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQXJndW1lbnQuSW50ZXJ2YWxcIiwgXCJBbW91bnQgbXVzdCBiZSBwb3NpdGl2ZSBub24temVyby5cIik7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGludGVydmFsLmFtb3VudCgpKSwgXCJBcmd1bWVudC5JbnRlcnZhbFwiLCBcIkFtb3VudCBtdXN0IGJlIGEgd2hvbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IHJlZmVyZW5jZTtcclxuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICB0aGlzLl9jYWxjSW50ZXJuYWxWYWx1ZXMoKTtcclxuICAgICAgICAvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcclxuICAgICAgICAvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXHJcbiAgICAgICAgLy8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cclxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMDAwMCwgXCJBcmd1bWVudC5JbnRlcnZhbC5Ob3RJbXBsZW1lbnRlZFwiLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCwgXCJBcmd1bWVudC5JbnRlcnZhbC5Ob3RJbXBsZW1lbnRlZFwiLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxNDQwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAyNCwgXCJBcmd1bWVudC5JbnRlcnZhbC5Ob3RJbXBsZW1lbnRlZFwiLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBlcmlvZCh0aGlzLl9yZWZlcmVuY2UsIHRoaXMuX2ludGVydmFsLCB0aGlzLl9kc3QpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5yZWZlcmVuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQ6IG9sZCBuYW1lIGZvciB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaW50ZXJ2YWxcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmludGVydmFsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGFtb3VudCBvZiB1bml0cyBvZiB0aGUgaW50ZXJ2YWxcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kc3Q7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGdyZWF0ZXIgdGhhblxyXG4gICAgICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxyXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGFmdGVyIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBmcm9tZGF0ZSBhbmQgdGhlIHJlZmVyZW5jZSBkYXRlIGFyZSBib3RoIGF3YXJlIG9yIHVuYXdhcmUgb2YgdGltZSB6b25lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoZnJvbURhdGUpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFmcm9tRGF0ZS56b25lKCksIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICB2YXIgYXBwcm94O1xyXG4gICAgICAgIHZhciBhcHByb3gyO1xyXG4gICAgICAgIHZhciBhcHByb3hNaW47XHJcbiAgICAgICAgdmFyIHBlcmlvZHM7XHJcbiAgICAgICAgdmFyIGRpZmY7XHJcbiAgICAgICAgdmFyIG5ld1llYXI7XHJcbiAgICAgICAgdmFyIHJlbWFpbmRlcjtcclxuICAgICAgICB2YXIgaW1heDtcclxuICAgICAgICB2YXIgaW1pbjtcclxuICAgICAgICB2YXIgaW1pZDtcclxuICAgICAgICB2YXIgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA9PT0gMSkge1xyXG4gICAgICAgICAgICAvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCBub3JtYWxGcm9tLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBBbW91bnQgaXMgbm90IDEsXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IDI1IGxlYXAgc2Vjb25kcyBoYXZlIGV2ZXIgYmVlbiBhZGRlZCBzbyB0aGlzIHNob3VsZCBzdGlsbCBiZSBPSy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChub3JtYWxGcm9tLnV0Y01vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcIlVua25vd24gVGltZVVuaXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBtaWxsaXNlY29uZCBlYWNoIHNlY29uZCwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIHNlY29uZCB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2UgbWlsbGlzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDAwMDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3gyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IGltaWQgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IGltaWQgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW51cyBvbmUgbWludXRlIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0byB0YWtlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbWF4ID49IGltaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIGhvdXIgdGhpcy5faW50UmVmZXJlbmNlYXJ5IGVhY2ggdGltZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZSBtaW51cyBvbmUgaG91clxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoMjQgKiA2MCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoMjQgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IGhhdmUgbGVhcCBkYXlzLCBzbyB3ZSBjYW4gYXBwcm94aW1hdGUgYnkgY2FsY3VsYXRpbmcgd2l0aCBVVEMgdGltZXN0YW1wc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gKG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSkgKiAxMiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkTG9jYWwodGhpcy5faW50ZXJ2YWwubXVsdGlwbHkocGVyaW9kcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdZZWFyID0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSArIHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobmV3WWVhciwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXHJcbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmUsIGRlZmF1bHQgMVxyXG4gICAgICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5QcmV2IGlmIHByZXYgaXMgdW5kZWZpbmVkXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZE5leHQgPSBmdW5jdGlvbiAocHJldiwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhcHJldiwgXCJBcmd1bWVudC5QcmV2XCIsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoY291bnQpLCBcIkFyZ3VtZW50LkNvdW50XCIsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpKS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cclxuICAgICAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG4gICAgICogQHJldHVybiB0aGUgbGFzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYmVmb3JlIGZyb21EYXRlLCBnaXZlblxyXG4gICAgICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYGZyb21gIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKGZyb20pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG4gICAgICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5OZXh0IGlmIHByZXYgaXMgdW5kZWZpbmVkXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZFByZXYgPSBmdW5jdGlvbiAobmV4dCwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kTmV4dChuZXh0LCAtMSAqIGNvdW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBcIkFyZ3VtZW50LlByZXZcIikpIHtcclxuICAgICAgICAgICAgICAgIGUgPSBlcnJvcl8xLmVycm9yKFwiQXJndW1lbnQuTmV4dFwiLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgb24gYSBwZXJpb2QgYm91bmRhcnlcclxuICAgICAqIChleHBlbnNpdmUhKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBgb2NjdXJyZW5jZWAgYW5kIHRoZSByZWZlcmVuY2UgZGF0ZSBhcmUgYm90aCBhd2FyZSBvciB1bmF3YXJlIG9mIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaXNCb3VuZGFyeSA9IGZ1bmN0aW9uIChvY2N1cnJlbmNlKSB7XHJcbiAgICAgICAgaWYgKCFvY2N1cnJlbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiVGhlIG9jY3VycmVuY2UgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmZpbmRGaXJzdChvY2N1cnJlbmNlLnN1YihkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cclxuICAgICAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxyXG4gICAgICogYW5kIHNhbWUgZHN0LlxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBgb3RoZXIjcmVmZXJlbmNlKClgIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZVxyXG4gICAgICogb2YgdGltZSB6b25lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICAvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcclxuICAgICAgICBpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XHJcbiAgICAgICAgdmFyIG90aGVyWm9uZSA9IG90aGVyLl9yZWZlcmVuY2Uuem9uZSgpO1xyXG4gICAgICAgIHZhciB0aGlzSXNSZWd1bGFyID0gKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIXJlZlpvbmUgfHwgcmVmWm9uZS5pc1V0YygpKTtcclxuICAgICAgICB2YXIgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XHJcbiAgICAgICAgaWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IG90aGVyLl9pbnREc3QgJiYgcmVmWm9uZSAmJiBvdGhlclpvbmUgJiYgcmVmWm9uZS5lcXVhbHMob3RoZXJab25lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcclxuICAgICAgICAgICAgJiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLl9pbnRlcnZhbClcclxuICAgICAgICAgICAgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMUhcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXHJcbiAgICAgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBKU09OLWNvbXBhdGlibGUgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwZXJpb2RcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSnNvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZWZlcmVuY2U6IHRoaXMucmVmZXJlbmNlKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuaW50ZXJ2YWwoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBwZXJpb2REc3Q6IHRoaXMuZHN0KCkgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzID8gXCJyZWd1bGFyXCIgOiBcImxvY2FsXCJcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NvcnJlY3REYXkgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcbiAgICAgKiB0byA8PSAyOC5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9ub3JtYWxpemVEYXkgPSBmdW5jdGlvbiAoZCwgYW55bW9udGgpIHtcclxuICAgICAgICBpZiAoYW55bW9udGggPT09IHZvaWQgMCkgeyBhbnltb250aCA9IHRydWU7IH1cclxuICAgICAgICBpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxyXG4gICAgICAgICAgICB8fCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyICYmIChkLm1vbnRoKCkgPT09IDIgfHwgYW55bW9udGgpICYmIGQuZGF5KCkgPiAyOCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIDI4LCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxyXG4gICAgICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9kc3RSZWxldmFudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XHJcbiAgICAgICAgcmV0dXJuICEhKHpvbmVcclxuICAgICAgICAgICAgJiYgem9uZS5raW5kKCkgPT09IHRpbWV6b25lXzEuVGltZVpvbmVLaW5kLlByb3BlclxyXG4gICAgICAgICAgICAmJiB6b25lLmhhc0RzdCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcclxuICAgICAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXHJcbiAgICAgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxyXG4gICAgICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cclxuICAgICAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NhbGNJbnRlcm5hbFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXHJcbiAgICAgICAgdmFyIGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG4gICAgICAgIHZhciBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCAmJiBpbnRBbW91bnQgPj0gMTAwMCAmJiBpbnRBbW91bnQgJSAxMDAwID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDI0O1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IHRoaXMuX2RzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxyXG4gICAgICAgIHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGVyaW9kO1xyXG59KCkpO1xyXG5leHBvcnRzLlBlcmlvZCA9IFBlcmlvZDtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIGpzb24gdmFsdWUgcmVwcmVzZW50cyBhIHZhbGlkIHBlcmlvZCBKU09OXHJcbiAqIEBwYXJhbSBqc29uXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZFBlcmlvZEpzb24oanNvbikge1xyXG4gICAgaWYgKHR5cGVvZiBqc29uICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGpzb24gPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGpzb24uZHVyYXRpb24gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGpzb24ucGVyaW9kRHN0ICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBqc29uLnJlZmVyZW5jZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICghW1wicmVndWxhclwiLCBcImxvY2FsXCJdLmluY2x1ZGVzKGpzb24ucGVyaW9kRHN0KSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby11bnVzZWQtZXhwcmVzc2lvblxyXG4gICAgICAgIG5ldyBQZXJpb2QoanNvbik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoX2EpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5leHBvcnRzLmlzVmFsaWRQZXJpb2RKc29uID0gaXNWYWxpZFBlcmlvZEpzb247XHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBQZXJpb2QuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XHJcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxyXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1BlcmlvZCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIlBlcmlvZFwiO1xyXG59XHJcbmV4cG9ydHMuaXNQZXJpb2QgPSBpc1BlcmlvZDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IHRpbWVzdGFtcCA+PSBgb3B0cy5yZWZlcmVuY2VgIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgdGltZS4gVXNlcyB0aGUgdGltZSB6b25lIGFuZCBEU1Qgc2V0dGluZ3NcclxuICogb2YgdGhlIGdpdmVuIHJlZmVyZW5jZSB0aW1lLlxyXG4gKiBAcGFyYW0gb3B0c1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBpZiBvcHRzLmhvdXIgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgaWYgb3B0cy5taW51dGUgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgaWYgb3B0cy5zZWNvbmQgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaXNlY29uZCBpZiBvcHRzLm1pbGxpc2Vjb25kIG91dCBvZiByYW5nZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla2RheSBpZiBvcHRzLndlZWtkYXkgb3V0IG9mIHJhbmdlXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lc3RhbXBPbldlZWtUaW1lR3JlYXRlclRoYW5PckVxdWFsVG8ob3B0cykge1xyXG4gICAgdmFyIF9hLCBfYiwgX2M7XHJcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMuaG91ciA+PSAwICYmIG9wdHMuaG91ciA8IDI0LCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJvcHRzLmhvdXIgc2hvdWxkIGJlIHdpdGhpbiBbMC4uMjNdXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLm1pbnV0ZSA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLm1pbnV0ZSA+PSAwICYmIG9wdHMubWludXRlIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLm1pbnV0ZSkpLCBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcIm9wdHMubWludXRlIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy5zZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5zZWNvbmQgPj0gMCAmJiBvcHRzLnNlY29uZCA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5zZWNvbmQpKSwgXCJBcmd1bWVudC5TZWNvbmRcIiwgXCJvcHRzLnNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMubWlsbGlzZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taWxsaXNlY29uZCA+PSAwICYmIG9wdHMubWlsbGlzZWNvbmQgPCAxMDAwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taWxsaXNlY29uZCkpLCBcIkFyZ3VtZW50Lk1pbGxpc2Vjb25kXCIsIFwib3B0cy5taWxsaXNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLjk5OV1cIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMud2Vla2RheSA+PSAwICYmIG9wdHMud2Vla2RheSA8IDcsIFwiQXJndW1lbnQuV2Vla2RheVwiLCBcIm9wdHMud2Vla2RheSBzaG91bGQgYmUgd2l0aGluIFswLi42XVwiKTtcclxuICAgIC8vIHRzbGludDplbmFibGU6IG1heC1saW5lLWxlbmd0aFxyXG4gICAgdmFyIG1pZG5pZ2h0ID0gb3B0cy5yZWZlcmVuY2Uuc3RhcnRPZkRheSgpO1xyXG4gICAgd2hpbGUgKG1pZG5pZ2h0LndlZWtEYXkoKSAhPT0gb3B0cy53ZWVrZGF5KSB7XHJcbiAgICAgICAgbWlkbmlnaHQgPSBtaWRuaWdodC5hZGRMb2NhbChkdXJhdGlvbl8xLmRheXMoMSkpO1xyXG4gICAgfVxyXG4gICAgdmFyIGR0ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobWlkbmlnaHQueWVhcigpLCBtaWRuaWdodC5tb250aCgpLCBtaWRuaWdodC5kYXkoKSwgb3B0cy5ob3VyLCAoX2EgPSBvcHRzLm1pbnV0ZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogMCwgKF9iID0gb3B0cy5zZWNvbmQpICE9PSBudWxsICYmIF9iICE9PSB2b2lkIDAgPyBfYiA6IDAsIChfYyA9IG9wdHMubWlsbGlzZWNvbmQpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IDAsIG9wdHMucmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICBpZiAoZHQgPCBvcHRzLnJlZmVyZW5jZSkge1xyXG4gICAgICAgIC8vIHdlJ3ZlIHN0YXJ0ZWQgb3V0IG9uIHRoZSBjb3JyZWN0IHdlZWtkYXkgYW5kIHRoZSByZWZlcmVuY2UgdGltZXN0YW1wIHdhcyBncmVhdGVyIHRoYW4gdGhlIGdpdmVuIHRpbWUsIG5lZWQgdG8gc2tpcCBhIHdlZWtcclxuICAgICAgICByZXR1cm4gZHQuYWRkTG9jYWwoZHVyYXRpb25fMS5kYXlzKDcpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkdDtcclxufVxyXG5leHBvcnRzLnRpbWVzdGFtcE9uV2Vla1RpbWVHcmVhdGVyVGhhbk9yRXF1YWxUbyA9IHRpbWVzdGFtcE9uV2Vla1RpbWVHcmVhdGVyVGhhbk9yRXF1YWxUbztcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IHRpbWVzdGFtcCA8IGBvcHRzLnJlZmVyZW5jZWAgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB0aW1lLiBVc2VzIHRoZSB0aW1lIHpvbmUgYW5kIERTVCBzZXR0aW5nc1xyXG4gKiBvZiB0aGUgZ2l2ZW4gcmVmZXJlbmNlIHRpbWUuXHJcbiAqIEBwYXJhbSBvcHRzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGlmIG9wdHMuaG91ciBvdXQgb2YgcmFuZ2VcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBpZiBvcHRzLm1pbnV0ZSBvdXQgb2YgcmFuZ2VcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBpZiBvcHRzLnNlY29uZCBvdXQgb2YgcmFuZ2VcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpc2Vjb25kIGlmIG9wdHMubWlsbGlzZWNvbmQgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrZGF5IGlmIG9wdHMud2Vla2RheSBvdXQgb2YgcmFuZ2VcclxuICovXHJcbmZ1bmN0aW9uIHRpbWVzdGFtcE9uV2Vla1RpbWVMZXNzVGhhbihvcHRzKSB7XHJcbiAgICB2YXIgX2EsIF9iLCBfYztcclxuICAgIC8vIHRzbGludDpkaXNhYmxlOiBtYXgtbGluZS1sZW5ndGhcclxuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy5ob3VyID49IDAgJiYgb3B0cy5ob3VyIDwgMjQsIFwiQXJndW1lbnQuSG91clwiLCBcIm9wdHMuaG91ciBzaG91bGQgYmUgd2l0aGluIFswLi4yM11cIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMubWludXRlID09PSB1bmRlZmluZWQgfHwgKG9wdHMubWludXRlID49IDAgJiYgb3B0cy5taW51dGUgPCA2MCAmJiBOdW1iZXIuaXNJbnRlZ2VyKG9wdHMubWludXRlKSksIFwiQXJndW1lbnQuTWludXRlXCIsIFwib3B0cy5taW51dGUgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNTldXCIpO1xyXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLnNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLnNlY29uZCA+PSAwICYmIG9wdHMuc2Vjb25kIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLnNlY29uZCkpLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIm9wdHMuc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy5taWxsaXNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLm1pbGxpc2Vjb25kID49IDAgJiYgb3B0cy5taWxsaXNlY29uZCA8IDEwMDAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLm1pbGxpc2Vjb25kKSksIFwiQXJndW1lbnQuTWlsbGlzZWNvbmRcIiwgXCJvcHRzLm1pbGxpc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuOTk5XVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy53ZWVrZGF5ID49IDAgJiYgb3B0cy53ZWVrZGF5IDwgNywgXCJBcmd1bWVudC5XZWVrZGF5XCIsIFwib3B0cy53ZWVrZGF5IHNob3VsZCBiZSB3aXRoaW4gWzAuLjZdXCIpO1xyXG4gICAgLy8gdHNsaW50OmVuYWJsZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICB2YXIgbWlkbmlnaHQgPSBvcHRzLnJlZmVyZW5jZS5zdGFydE9mRGF5KCkuYWRkTG9jYWwoZHVyYXRpb25fMS5kYXlzKDEpKTtcclxuICAgIHdoaWxlIChtaWRuaWdodC53ZWVrRGF5KCkgIT09IG9wdHMud2Vla2RheSkge1xyXG4gICAgICAgIG1pZG5pZ2h0ID0gbWlkbmlnaHQuc3ViTG9jYWwoZHVyYXRpb25fMS5kYXlzKDEpKTtcclxuICAgIH1cclxuICAgIHZhciBkdCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG1pZG5pZ2h0LnllYXIoKSwgbWlkbmlnaHQubW9udGgoKSwgbWlkbmlnaHQuZGF5KCksIG9wdHMuaG91ciwgKF9hID0gb3B0cy5taW51dGUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IDAsIChfYiA9IG9wdHMuc2Vjb25kKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiAwLCAoX2MgPSBvcHRzLm1pbGxpc2Vjb25kKSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiAwLCBvcHRzLnJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgaWYgKGR0ID49IG9wdHMucmVmZXJlbmNlKSB7XHJcbiAgICAgICAgLy8gd2UndmUgc3RhcnRlZCBvdXQgb24gdGhlIGNvcnJlY3Qgd2Vla2RheSBhbmQgdGhlIHJlZmVyZW5jZSB0aW1lc3RhbXAgd2FzIGxlc3MgdGhhbiB0aGUgZ2l2ZW4gdGltZSwgbmVlZCB0byBza2lwIGEgd2Vla1xyXG4gICAgICAgIHJldHVybiBkdC5zdWJMb2NhbChkdXJhdGlvbl8xLmRheXMoNykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGR0O1xyXG59XHJcbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuID0gdGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJpb2QuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5wYWRSaWdodCA9IGV4cG9ydHMucGFkTGVmdCA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2lkdGggaWYgd2lkdGggaXMgbm90IGFuIGludGVnZXIgbnVtYmVyID49IDBcclxuICovXHJcbmZ1bmN0aW9uIHBhZExlZnQocywgd2lkdGgsIGNoYXIpIHtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih3aWR0aCkgJiYgd2lkdGggPj0gMCwgXCJBcmd1bWVudC5XaWR0aFwiLCBcIndpZHRoIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlciA+PSAwIGJ1dCBpczogJWRcIiwgd2lkdGgpO1xyXG4gICAgdmFyIHBhZGRpbmcgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xyXG4gICAgICAgIHBhZGRpbmcgKz0gY2hhcjtcclxuICAgIH1cclxuICAgIHJldHVybiBwYWRkaW5nICsgcztcclxufVxyXG5leHBvcnRzLnBhZExlZnQgPSBwYWRMZWZ0O1xyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBlbmQuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2lkdGggaWYgd2lkdGggaXMgbm90IGFuIGludGVnZXIgbnVtYmVyID49IDBcclxuICovXHJcbmZ1bmN0aW9uIHBhZFJpZ2h0KHMsIHdpZHRoLCBjaGFyKSB7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2lkdGgpICYmIHdpZHRoID49IDAsIFwiQXJndW1lbnQuV2lkdGhcIiwgXCJ3aWR0aCBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXIgPj0gMCBidXQgaXM6ICVkXCIsIHdpZHRoKTtcclxuICAgIHZhciBwYWRkaW5nID0gXCJcIjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcclxuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcyArIHBhZGRpbmc7XHJcbn1cclxuZXhwb3J0cy5wYWRSaWdodCA9IHBhZFJpZ2h0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdHJpbmdzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IHZvaWQgMDtcclxuLyoqXHJcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcclxuICovXHJcbnZhciBSZWFsVGltZVNvdXJjZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJlYWxUaW1lU291cmNlKCkge1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbmhlcml0ZG9jICovXHJcbiAgICBSZWFsVGltZVNvdXJjZS5wcm90b3R5cGUubm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWFsVGltZVNvdXJjZTtcclxufSgpKTtcclxuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IFJlYWxUaW1lU291cmNlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lc291cmNlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5pc1RpbWVab25lID0gZXhwb3J0cy5UaW1lWm9uZSA9IGV4cG9ydHMuVGltZVpvbmVLaW5kID0gZXhwb3J0cy56b25lID0gZXhwb3J0cy51dGMgPSBleHBvcnRzLmxvY2FsID0gdm9pZCAwO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xyXG4vKipcclxuICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlIGFzIHBlciBPUyBzZXR0aW5ncy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gbG9jYWwoKSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUubG9jYWwoKTtcclxufVxyXG5leHBvcnRzLmxvY2FsID0gbG9jYWw7XHJcbi8qKlxyXG4gKiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSB6b25lLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXHJcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB6b25lIGlzIG5vdCBwcmVzZW50IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICovXHJcbmZ1bmN0aW9uIHV0YygpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS51dGMoKTtcclxufVxyXG5leHBvcnRzLnV0YyA9IHV0YztcclxuLyoqXHJcbiAqIHpvbmUoKSBpbXBsZW1lbnRhdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gem9uZShhLCBkc3QpIHtcclxuICAgIHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XHJcbn1cclxuZXhwb3J0cy56b25lID0gem9uZTtcclxuLyoqXHJcbiAqIFRoZSB0eXBlIG9mIHRpbWUgem9uZVxyXG4gKi9cclxudmFyIFRpbWVab25lS2luZDtcclxuKGZ1bmN0aW9uIChUaW1lWm9uZUtpbmQpIHtcclxuICAgIC8qKlxyXG4gICAgICogTG9jYWwgdGltZSBvZmZzZXQgYXMgZGV0ZXJtaW5lZCBieSBKYXZhU2NyaXB0IERhdGUgY2xhc3MuXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJMb2NhbFwiXSA9IDBdID0gXCJMb2NhbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBJQU5BIHRpbWV6b25lIG1hbmFnZWQgdGhyb3VnaCBPbHNlbiBUWiBkYXRhYmFzZS4gSW5jbHVkZXNcclxuICAgICAqIERTVCBpZiBhcHBsaWNhYmxlLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiUHJvcGVyXCJdID0gMl0gPSBcIlByb3BlclwiO1xyXG59KShUaW1lWm9uZUtpbmQgPSBleHBvcnRzLlRpbWVab25lS2luZCB8fCAoZXhwb3J0cy5UaW1lWm9uZUtpbmQgPSB7fSkpO1xyXG4vKipcclxuICogVGltZSB6b25lLiBUaGUgb2JqZWN0IGlzIGltbXV0YWJsZSBiZWNhdXNlIGl0IGlzIGNhY2hlZDpcclxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXHJcbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxyXG4gKiBpLmUuIG9mZnNldCA5MCBtZWFucyArMDE6MzAuXHJcbiAqXHJcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcclxuICogYSBmaXhlZCBvZmZzZXQgKFwiKzAxOjMwXCIpIHdpdGhvdXQgRFNULCBvciBhIElBTkEgdGltZXpvbmUgKFwiRXVyb3BlL0Ftc3RlcmRhbVwiKSB3aXRoIERTVFxyXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxyXG4gKi9cclxudmFyIFRpbWVab25lID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEbyBub3QgdXNlIHRoaXMgY29uc3RydWN0b3IsIHVzZSB0aGUgc3RhdGljXHJcbiAgICAgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXHJcbiAgICAgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxyXG4gICAgICogQHBhcmFtIGRzdCBBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIGdpdmVuIHpvbmUgbmFtZSBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVGltZVpvbmUobmFtZSwgZHN0KSB7XHJcbiAgICAgICAgaWYgKGRzdCA9PT0gdm9pZCAwKSB7IGRzdCA9IHRydWU7IH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xhc3NLaW5kID0gXCJUaW1lWm9uZVwiO1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICBpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLkxvY2FsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcclxuICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcclxuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIFwiTm90Rm91bmQuWm9uZVwiLCBcIm5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnJXMnXCIsIG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcclxuICAgICAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxyXG4gICAgICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLmxvY2FsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUudXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIHpvbmUoKSBpbXBsZW1lbnRhdGlvbnNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuem9uZSA9IGZ1bmN0aW9uIChhLCBkc3QpIHtcclxuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHZhciBuYW1lID0gXCJcIjtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiAoYSkpIHtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gYTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJBcmd1bWVudC5PZmZzZXRcIiwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkFcIiwgXCJ1bmV4cGVjdGVkIHR5cGUgZm9yIGZpcnN0IGFyZ3VtZW50OiAlc1wiLCB0eXBlb2YgYSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgaW1tdXRhYmxlIHlvdSB3aWxsIE5PVFxyXG4gICAgICogYWN0dWFsbHkgZ2V0IGEgY2xvbmUgYnV0IHRoZSBzYW1lIG9iamVjdC5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxyXG4gICAgICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuICAgICAqIHRoZSBsb2NhbCB0aW1lIHpvbmUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIERTVCBpcyBlbmFibGVkXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmRzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9raW5kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRXF1YWxpdHkgb3BlcmF0b3IuIE1hcHMgemVybyBvZmZzZXRzIGFuZCBkaWZmZXJlbnQgbmFtZXMgZm9yIFVUQyBvbnRvXHJcbiAgICAgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXHJcbiAgICAgICAgICAgICAgICAmJiAodGhpcy5fZHN0ID09PSBvdGhlci5fZHN0IHx8ICF0aGlzLmhhc0RzdCgpKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWUgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGlzIHpvbmUgZXF1aXZhbGVudCB0byBVVEM/XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgZ2xvYmFsIHRpbWUgem9uZSBkYXRhIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmlzVXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnpvbmVJc1V0Yyh0aGlzLl9uYW1lKSk7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRG9lcyB0aGlzIHpvbmUgaGF2ZSBEYXlsaWdodCBTYXZpbmcgVGltZSBhdCBhbGw/XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgZ2xvYmFsIHRpbWUgem9uZSBkYXRhIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmhhc0RzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuICh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5oYXNEc3QodGhpcy5fbmFtZSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XHJcbiAgICAgICAgICAgIHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoe30pIDpcclxuICAgICAgICAgICAgICAgIGEpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSwgdXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXRGb3JVdGMgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICAgICAgdmFyIHV0Y1RpbWUgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pIDpcclxuICAgICAgICAgICAgdHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7fSkgOlxyXG4gICAgICAgICAgICAgICAgYSk7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCAwLCAxLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yWm9uZSA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XHJcbiAgICAgICAgICAgIHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoe30pIDpcclxuICAgICAgICAgICAgICAgIGEpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuaG91ciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWludXRlLCBsb2NhbFRpbWUuY29tcG9uZW50cy5zZWNvbmQsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbGxpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXRMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG4gICAgICpcclxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG4gICAgICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuICAgICAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmVEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Rm9yWm9uZShiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmFiYnJldmlhdGlvbkZvclV0YyA9IGZ1bmN0aW9uIChhLCBiLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSwgYykge1xyXG4gICAgICAgIHZhciB1dGNUaW1lO1xyXG4gICAgICAgIHZhciBkc3REZXBlbmRlbnQgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gXCJudW1iZXJcIiAmJiAhIWEpIHtcclxuICAgICAgICAgICAgdXRjVGltZSA9IGE7XHJcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB1dGNUaW1lID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImxvY2FsXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5ub3JtYWxpemVab25lVGltZSA9IGZ1bmN0aW9uIChsb2NhbFRpbWUsIG9wdCkge1xyXG4gICAgICAgIGlmIChvcHQgPT09IHZvaWQgMCkgeyBvcHQgPSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIHZhciB0em9wdCA9IChvcHQgPT09IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gPyB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXApO1xyXG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxUaW1lO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXHJcbiAgICAgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMubmFtZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEc3QoKSAmJiAhdGhpcy5kc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gb2Zmc2V0IG51bWJlciBpbnRvIGFuIG9mZnNldCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xyXG4gICAgICogQHRocm93cyBBcmd1bWVudC5PZmZzZXQgaWYgb2Zmc2V0IGlzIG5vdCBhIGZpbml0ZSBudW1iZXIgb3Igbm90IHdpdGhpbiAtMjQgKiA2MCAuLi4gKzI0ICogNjAgbWludXRlc1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZShvZmZzZXQpICYmIG9mZnNldCA+PSAtMjQgKiA2MCAmJiBvZmZzZXQgPD0gMjQgKiA2MCwgXCJBcmd1bWVudC5PZmZzZXRcIiwgXCJpbnZhbGlkIG9mZnNldCAlZFwiLCBvZmZzZXQpO1xyXG4gICAgICAgIHZhciBzaWduID0gKG9mZnNldCA8IDAgPyBcIi1cIiA6IFwiK1wiKTtcclxuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgJSA2MCk7XHJcbiAgICAgICAgcmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIHRvIG9mZnNldCBjb252ZXJzaW9uLlxyXG4gICAgICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcclxuICAgICAqIEByZXR1cm4gb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlMgaWYgcyBjYW5ub3QgYmUgcGFyc2VkXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0ID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xyXG4gICAgICAgIC8vIGVhc3kgY2FzZVxyXG4gICAgICAgIGlmICh0ID09PSBcIlpcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhhdCB0aGUgcmVtYWluZGVyIGNvbmZvcm1zIHRvIElTTyB0aW1lIHpvbmUgc3BlY1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodC5tYXRjaCgvXlsrLV1cXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xyXG4gICAgICAgIHZhciBzaWduID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gMDtcclxuICAgICAgICB2YXIgbWludXRlcyA9IDA7XHJcbiAgICAgICAgc3dpdGNoICh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0LnNsaWNlKDMsIDUpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zbGljZSg0LCA2KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaG91cnMgPj0gMCAmJiBob3VycyA8IDI0LCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIHRpbWUgem9uZSAoaG91cnMgb3V0IG9mIHJhbmdlKTogJ1wiICsgdCArIFwiJ1wiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1pbnV0ZXMgPj0gMCAmJiBtaW51dGVzIDwgNjAsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSB6b25lIChtaW51dGVzIG91dCBvZiByYW5nZSk6ICdcIiArIHQgKyBcIidcIik7XHJcbiAgICAgICAgcmV0dXJuIHNpZ24gKiAoaG91cnMgKiA2MCArIG1pbnV0ZXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRmluZCBpbiBjYWNoZSBvciBjcmVhdGUgem9uZVxyXG4gICAgICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWU/XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX2ZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBkc3QpIHtcclxuICAgICAgICB2YXIga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcclxuICAgICAgICBpZiAoa2V5IGluIFRpbWVab25lLl9jYWNoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdCA9IG5ldyBUaW1lWm9uZShuYW1lLCBkc3QpO1xyXG4gICAgICAgICAgICBUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSBhIHN0cmluZyBzbyBpdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBmb3IgYSBjYWNoZSBsb29rdXBcclxuICAgICAqIEB0aHJvd3MgQXJndW1lbnQuUyBpZiBzIGlzIGVtcHR5XHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0Lmxlbmd0aCA+IDAsIFwiQXJndW1lbnQuU1wiLCBcIkVtcHR5IHRpbWUgem9uZSBzdHJpbmcgZ2l2ZW5cIik7XHJcbiAgICAgICAgaWYgKHQgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHQgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIiswMDowMFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcclxuICAgICAgICAgICAgLy8gb2Zmc2V0IHN0cmluZ1xyXG4gICAgICAgICAgICAvLyBub3JtYWxpemUgYnkgY29udmVydGluZyBiYWNrIGFuZCBmb3J0aFxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBcIkFyZ3VtZW50Lk9mZnNldFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUgPSBlcnJvcl8xLmVycm9yKFwiQXJndW1lbnQuU1wiLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gT2xzZW4gVFogZGF0YWJhc2UgbmFtZVxyXG4gICAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBmaXJzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgb2YgcyBpcyArLCAtLCBvciBaXHJcbiAgICAgKiBAcGFyYW0gc1xyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9pc09mZnNldFN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICByZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGltZSB6b25lIGNhY2hlLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fY2FjaGUgPSB7fTtcclxuICAgIHJldHVybiBUaW1lWm9uZTtcclxufSgpKTtcclxuZXhwb3J0cy5UaW1lWm9uZSA9IFRpbWVab25lO1xyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gb2JqZWN0IGlzIG9mIHR5cGUgVGltZVpvbmUuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XHJcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxyXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1RpbWVab25lKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmNsYXNzS2luZCA9PT0gXCJUaW1lWm9uZVwiO1xyXG59XHJcbmV4cG9ydHMuaXNUaW1lWm9uZSA9IGlzVGltZVpvbmU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWV6b25lLmpzLm1hcCIsIi8qKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnRva2VuaXplID0gZXhwb3J0cy5Ub2tlblR5cGUgPSB2b2lkIDA7XHJcbi8qKlxyXG4gKiBEaWZmZXJlbnQgdHlwZXMgb2YgdG9rZW5zLCBlYWNoIGZvciBhIERhdGVUaW1lIFwicGVyaW9kIHR5cGVcIiAobGlrZSB5ZWFyLCBtb250aCwgaG91ciBldGMuKVxyXG4gKi9cclxudmFyIFRva2VuVHlwZTtcclxuKGZ1bmN0aW9uIChUb2tlblR5cGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogUmF3IHRleHRcclxuICAgICAqL1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIklERU5USVRZXCJdID0gMF0gPSBcIklERU5USVRZXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiRVJBXCJdID0gMV0gPSBcIkVSQVwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIllFQVJcIl0gPSAyXSA9IFwiWUVBUlwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlFVQVJURVJcIl0gPSAzXSA9IFwiUVVBUlRFUlwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIk1PTlRIXCJdID0gNF0gPSBcIk1PTlRIXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiV0VFS1wiXSA9IDVdID0gXCJXRUVLXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiREFZXCJdID0gNl0gPSBcIkRBWVwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIldFRUtEQVlcIl0gPSA3XSA9IFwiV0VFS0RBWVwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkRBWVBFUklPRFwiXSA9IDhdID0gXCJEQVlQRVJJT0RcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJIT1VSXCJdID0gOV0gPSBcIkhPVVJcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJNSU5VVEVcIl0gPSAxMF0gPSBcIk1JTlVURVwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlNFQ09ORFwiXSA9IDExXSA9IFwiU0VDT05EXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiWk9ORVwiXSA9IDEyXSA9IFwiWk9ORVwiO1xyXG59KShUb2tlblR5cGUgPSBleHBvcnRzLlRva2VuVHlwZSB8fCAoZXhwb3J0cy5Ub2tlblR5cGUgPSB7fSkpO1xyXG4vKipcclxuICogVG9rZW5pemUgYW4gTERNTCBkYXRlL3RpbWUgZm9ybWF0IHN0cmluZ1xyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIHRoZSBzdHJpbmcgdG8gdG9rZW5pemVcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiB0b2tlbml6ZShmb3JtYXRTdHJpbmcpIHtcclxuICAgIGlmICghZm9ybWF0U3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIGFwcGVuZFRva2VuID0gZnVuY3Rpb24gKHRva2VuU3RyaW5nLCByYXcpIHtcclxuICAgICAgICAvLyBUaGUgdG9rZW5TdHJpbmcgbWF5IGJlIGxvbmdlciB0aGFuIHN1cHBvcnRlZCBmb3IgYSB0b2tlbnR5cGUsIGUuZy4gXCJoaGhoXCIgd2hpY2ggd291bGQgYmUgVFdPIGhvdXIgc3BlY3MuXHJcbiAgICAgICAgLy8gV2UgZ3JlZWRpbHkgY29uc3VtZSBMRE1MIHNwZWNzIHdoaWxlIHBvc3NpYmxlXHJcbiAgICAgICAgd2hpbGUgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyYXcgfHwgIVNZTUJPTF9NQVBQSU5HLmhhc093blByb3BlcnR5KHRva2VuU3RyaW5nWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRva2VuID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUuSURFTlRJVFlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICB0b2tlblN0cmluZyA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdG9rZW4sIGRpZmZlcmVudCBsZW5ndGhzIG1heSBiZSBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgICAgIHZhciBpbmZvID0gU1lNQk9MX01BUFBJTkdbdG9rZW5TdHJpbmdbMF1dO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aF8xID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZm8ubWF4TGVuZ3RoID09PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KGluZm8ubGVuZ3RocykgfHwgaW5mby5sZW5ndGhzLmxlbmd0aCA9PT0gMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBldmVyeXRoaW5nIGlzIGFsbG93ZWRcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGhfMSA9IHRva2VuU3RyaW5nLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluZm8ubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBncmVlZGlseSBnb2JibGUgdXBcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGhfMSA9IE1hdGgubWluKHRva2VuU3RyaW5nLmxlbmd0aCwgaW5mby5tYXhMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqLyBpZiAoQXJyYXkuaXNBcnJheShpbmZvLmxlbmd0aHMpICYmIGluZm8ubGVuZ3Rocy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBtYXhpbXVtIGFsbG93ZWQgbGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGluZm8ubGVuZ3RoczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsIDw9IHRva2VuU3RyaW5nLmxlbmd0aCAmJiAobGVuZ3RoXzEgPT09IHVuZGVmaW5lZCB8fCBsZW5ndGhfMSA8IGwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGhfMSA9IGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChsZW5ndGhfMSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gYWxsb3dlZCBsZW5ndGggZm91bmQgKG5vdCBwb3NzaWJsZSB3aXRoIGN1cnJlbnQgc3ltYm9sIG1hcHBpbmcgc2luY2UgbGVuZ3RoIDEgaXMgYWx3YXlzIGFsbG93ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiB0b2tlblN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLklERU5USVRZXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5TdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlZml4IGZvdW5kXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IGxlbmd0aF8xLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXc6IHRva2VuU3RyaW5nLnNsaWNlKDAsIGxlbmd0aF8xKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5mby50eXBlXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5TdHJpbmcgPSB0b2tlblN0cmluZy5zbGljZShsZW5ndGhfMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICB2YXIgcHJldmlvdXNDaGFyID0gXCJcIjtcclxuICAgIHZhciBxdW90aW5nID0gZmFsc2U7XHJcbiAgICB2YXIgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBmb3JtYXRTdHJpbmdfMSA9IGZvcm1hdFN0cmluZzsgX2kgPCBmb3JtYXRTdHJpbmdfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICB2YXIgY3VycmVudENoYXIgPSBmb3JtYXRTdHJpbmdfMVtfaV07XHJcbiAgICAgICAgLy8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXHJcbiAgICAgICAgaWYgKGN1cnJlbnRDaGFyID09PSBcIidcIikge1xyXG4gICAgICAgICAgICBpZiAoIXF1b3RpbmcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBlZCBhIHNpbmdsZSAnIGNoYXJhY3RlciB3aXRob3V0IHF1b3RpbmdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gXCInXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxyXG4gICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghcG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBjaGFyYWN0ZXIgaXMgcmVsZXZhbnQsIHNvIHNhdmUgaXQgZm9yIGluc3BlY3RpbmcgbmV4dCByb3VuZFxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgcXVvdGluZyA9ICFxdW90aW5nO1xyXG4gICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuICAgICAgICAgICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCAhcXVvdGluZyk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChxdW90aW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cclxuICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XHJcbiAgICAgICAgICAgIC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXHJcbiAgICAgICAgICAgIGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbik7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gV2UgYXJlIHJlcGVhdGluZyB0aGUgdG9rZW4gd2l0aCBtb3JlIGNoYXJhY3RlcnNcclxuICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuICAgIH1cclxuICAgIC8vIERvbid0IGZvcmdldCB0byBhZGQgdGhlIGxhc3QgdG9rZW4gdG8gdGhlIHJlc3VsdCFcclxuICAgIGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcXVvdGluZyk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMudG9rZW5pemUgPSB0b2tlbml6ZTtcclxudmFyIFNZTUJPTF9NQVBQSU5HID0ge1xyXG4gICAgRzogeyB0eXBlOiBUb2tlblR5cGUuRVJBLCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIHk6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcclxuICAgIFk6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcclxuICAgIHU6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcclxuICAgIFU6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIsIG1heExlbmd0aDogNSB9LFxyXG4gICAgcjogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxyXG4gICAgUTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBxOiB7IHR5cGU6IFRva2VuVHlwZS5RVUFSVEVSLCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIE06IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIEw6IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIGw6IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDEgfSxcclxuICAgIHc6IHsgdHlwZTogVG9rZW5UeXBlLldFRUssIG1heExlbmd0aDogMiB9LFxyXG4gICAgVzogeyB0eXBlOiBUb2tlblR5cGUuV0VFSywgbWF4TGVuZ3RoOiAxIH0sXHJcbiAgICBkOiB7IHR5cGU6IFRva2VuVHlwZS5EQVksIG1heExlbmd0aDogMiB9LFxyXG4gICAgRDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDMgfSxcclxuICAgIEY6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAxIH0sXHJcbiAgICBnOiB7IHR5cGU6IFRva2VuVHlwZS5EQVkgfSxcclxuICAgIEU6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxyXG4gICAgZTogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXHJcbiAgICBjOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcclxuICAgIGE6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBiOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxyXG4gICAgQjogeyB0eXBlOiBUb2tlblR5cGUuREFZUEVSSU9ELCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIGg6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxyXG4gICAgSDogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcbiAgICBrOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIEs6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxyXG4gICAgajogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiA2IH0sXHJcbiAgICBKOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIG06IHsgdHlwZTogVG9rZW5UeXBlLk1JTlVURSwgbWF4TGVuZ3RoOiAyIH0sXHJcbiAgICBzOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQsIG1heExlbmd0aDogMiB9LFxyXG4gICAgUzogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05EIH0sXHJcbiAgICBBOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQgfSxcclxuICAgIHo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxyXG4gICAgWjogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBPOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBsZW5ndGhzOiBbMSwgNF0gfSxcclxuICAgIHY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIGxlbmd0aHM6IFsxLCA0XSB9LFxyXG4gICAgVjogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA0IH0sXHJcbiAgICBYOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIHg6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10b2tlbi5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXHJcbiAqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIF9fc3ByZWFkQXJyYXlzID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5cykgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5UekRhdGFiYXNlID0gZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gPSBleHBvcnRzLlRyYW5zaXRpb24gPSBleHBvcnRzLmlzVmFsaWRPZmZzZXRTdHJpbmcgPSBleHBvcnRzLlpvbmVJbmZvID0gZXhwb3J0cy5SdWxlVHlwZSA9IGV4cG9ydHMuUnVsZUluZm8gPSBleHBvcnRzLkF0VHlwZSA9IGV4cG9ydHMuT25UeXBlID0gZXhwb3J0cy5Ub1R5cGUgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG52YXIgVG9UeXBlO1xyXG4oZnVuY3Rpb24gKFRvVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiWWVhclwiXSA9IDBdID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibWF4XCJcclxuICAgICAqL1xyXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcclxufSkoVG9UeXBlID0gZXhwb3J0cy5Ub1R5cGUgfHwgKGV4cG9ydHMuVG9UeXBlID0ge30pKTtcclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbnZhciBPblR5cGU7XHJcbihmdW5jdGlvbiAoT25UeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIERheS1vZi1tb250aCBudW1iZXJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkRheU51bVwiXSA9IDBdID0gXCJEYXlOdW1cIjtcclxuICAgIC8qKlxyXG4gICAgICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJMYXN0WFwiXSA9IDFdID0gXCJMYXN0WFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBlLmcuIFwiU3VuPj04XCJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkdyZXFYXCJdID0gMl0gPSBcIkdyZXFYXCI7XHJcbiAgICAvKipcclxuICAgICAqIGUuZy4gXCJTdW48PThcIlxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiTGVxWFwiXSA9IDNdID0gXCJMZXFYXCI7XHJcbn0pKE9uVHlwZSA9IGV4cG9ydHMuT25UeXBlIHx8IChleHBvcnRzLk9uVHlwZSA9IHt9KSk7XHJcbnZhciBBdFR5cGU7XHJcbihmdW5jdGlvbiAoQXRUeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlN0YW5kYXJkXCJdID0gMF0gPSBcIlN0YW5kYXJkXCI7XHJcbiAgICAvKipcclxuICAgICAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIldhbGxcIl0gPSAxXSA9IFwiV2FsbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVdGMgdGltZVxyXG4gICAgICovXHJcbiAgICBBdFR5cGVbQXRUeXBlW1wiVXRjXCJdID0gMl0gPSBcIlV0Y1wiO1xyXG59KShBdFR5cGUgPSBleHBvcnRzLkF0VHlwZSB8fCAoZXhwb3J0cy5BdFR5cGUgPSB7fSkpO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbnZhciBSdWxlSW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBmcm9tXHJcbiAgICAgKiBAcGFyYW0gdG9UeXBlXHJcbiAgICAgKiBAcGFyYW0gdG9ZZWFyXHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIGluTW9udGhcclxuICAgICAqIEBwYXJhbSBvblR5cGVcclxuICAgICAqIEBwYXJhbSBvbkRheVxyXG4gICAgICogQHBhcmFtIG9uV2Vla0RheVxyXG4gICAgICogQHBhcmFtIGF0SG91clxyXG4gICAgICogQHBhcmFtIGF0TWludXRlXHJcbiAgICAgKiBAcGFyYW0gYXRTZWNvbmRcclxuICAgICAqIEBwYXJhbSBhdFR5cGVcclxuICAgICAqIEBwYXJhbSBzYXZlXHJcbiAgICAgKiBAcGFyYW0gbGV0dGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUnVsZUluZm8oXHJcbiAgICAvKipcclxuICAgICAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBmcm9tLCBcclxuICAgIC8qKlxyXG4gICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHRvVHlwZSwgXHJcbiAgICAvKipcclxuICAgICAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG4gICAgICovXHJcbiAgICB0b1llYXIsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcbiAgICAgKi9cclxuICAgIHR5cGUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcclxuICAgICAqL1xyXG4gICAgaW5Nb250aCwgXHJcbiAgICAvKipcclxuICAgICAqIE9OIGNvbHVtbiB0eXBlXHJcbiAgICAgKi9cclxuICAgIG9uVHlwZSwgXHJcbiAgICAvKipcclxuICAgICAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIG9uRGF5LCBcclxuICAgIC8qKlxyXG4gICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XHJcbiAgICAgKi9cclxuICAgIG9uV2Vla0RheSwgXHJcbiAgICAvKipcclxuICAgICAqIEFUIGNvbHVtbiBob3VyXHJcbiAgICAgKi9cclxuICAgIGF0SG91ciwgXHJcbiAgICAvKipcclxuICAgICAqIEFUIGNvbHVtbiBtaW51dGVcclxuICAgICAqL1xyXG4gICAgYXRNaW51dGUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXHJcbiAgICAgKi9cclxuICAgIGF0U2Vjb25kLCBcclxuICAgIC8qKlxyXG4gICAgICogQVQgY29sdW1uIHR5cGVcclxuICAgICAqL1xyXG4gICAgYXRUeXBlLCBcclxuICAgIC8qKlxyXG4gICAgICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcbiAgICAgKi9cclxuICAgIHNhdmUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBOb3RlIGlmIFRaIGRhdGFiYXNlIGluZGljYXRlcyBcIi1cIiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvVHlwZSA9IHRvVHlwZTtcclxuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuaW5Nb250aCA9IGluTW9udGg7XHJcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XHJcbiAgICAgICAgdGhpcy5vbkRheSA9IG9uRGF5O1xyXG4gICAgICAgIHRoaXMub25XZWVrRGF5ID0gb25XZWVrRGF5O1xyXG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xyXG4gICAgICAgIHRoaXMuYXRNaW51dGUgPSBhdE1pbnV0ZTtcclxuICAgICAgICB0aGlzLmF0U2Vjb25kID0gYXRTZWNvbmQ7XHJcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XHJcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHJ1bGUgaXMgYXBwbGljYWJsZSBpbiB0aGUgeWVhclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5hcHBsaWNhYmxlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICBpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdGhpcyBydWxlIGRlcGVuZHMgb24gYSB3ZWVrZGF5IGFuZCB0aGUgd2Vla2RheSBpbiBxdWVzdGlvbiBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVMZXNzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmZyb20gPiBvdGhlci5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pIDwgb3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgdGhlIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgeWVhci1yZWxhdGl2ZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBEZXBlbmRpbmcgb24gdGhlIHJ1bGUgdGhpcyBjYW4gYmUgYSBVVEMgdGltZSwgYSB3YWxsIGNsb2NrIHRpbWUsIG9yIGFcclxuICAgICAqIHRpbWUgaW4gc3RhbmRhcmQgb2Zmc2V0IChpLmUuIHlvdSBzdGlsbCBuZWVkIHRvIGNvbXBlbnNhdGUgZm9yIHRoaXMuYXRUeXBlKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGUgaWYgdGhpcyBydWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIHRoZSBnaXZlbiB5ZWFyXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJ0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGVcIiwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluICVkXCIsIHllYXIpO1xyXG4gICAgICAgIC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG4gICAgICAgIHZhciB5ID0geWVhcjtcclxuICAgICAgICB2YXIgbSA9IHRoaXMuaW5Nb250aDtcclxuICAgICAgICB2YXIgZCA9IDA7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGRheVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5vblR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGQgPSB0aGlzLm9uRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3Mud2Vla0RheU9uT3JBZnRlcih5LCBtLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgXCJOb3RGb3VuZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXByIFN1bj49MjcgYWN0dWFsbHkgbWVhbnMgYW55IHN1bmRheSBhZnRlciBBcHJpbCAyNywgaS5lLiBpdCBkb2VzIG5vdCBoYXZlIHRvIGJlIGluIEFwcmlsLiBUcnkgbmV4dCBtb250aC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtICsgMSA8PSAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSBtICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB5ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MuZmlyc3RXZWVrRGF5T2ZNb250aCh5LCBtLCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHksIG0sIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBcIk5vdEZvdW5kXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobSA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gbSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gMTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MubGFzdFdlZWtEYXlPZk1vbnRoKHksIG0sIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyh5LCBtLCBkLCB0aGlzLmF0SG91ciwgdGhpcy5hdE1pbnV0ZSwgdGhpcy5hdFNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBFZmZlY3RpdmUgZGF0ZSBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXIsIGluIGEgc3BlY2lmaWMgdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0geWVhclxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHRoZSBzdGFuZGFyZCBvZmZzZXQgZnJvbSBVVCBvZiB0aGUgdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gZHN0T2Zmc2V0IHRoZSBEU1Qgb2Zmc2V0IGJlZm9yZSB0aGUgcnVsZVxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUuZWZmZWN0aXZlRGF0ZVV0YyA9IGZ1bmN0aW9uICh5ZWFyLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIGQgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcik7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5VdGM6IHJldHVybiBkO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDoge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiB0aW1lIGlzIGluIHpvbmUgbG9jYWwgdGltZSB3aXRob3V0IERTVFxyXG4gICAgICAgICAgICAgICAgdmFyIG1pbGxpcyA9IGQudW5peE1pbGxpcztcclxuICAgICAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6IHtcclxuICAgICAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aCBEU1RcclxuICAgICAgICAgICAgICAgIHZhciBtaWxsaXMgPSBkLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlzIC09IGRzdE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBSdWxlSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5SdWxlSW5mbyA9IFJ1bGVJbmZvO1xyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbnZhciBSdWxlVHlwZTtcclxuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBObyBydWxlIGFwcGxpZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xyXG59KShSdWxlVHlwZSA9IGV4cG9ydHMuUnVsZVR5cGUgfHwgKGV4cG9ydHMuUnVsZVR5cGUgPSB7fSkpO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxudmFyIFpvbmVJbmZvID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIGdtdG9mZlxyXG4gICAgICogQHBhcmFtIHJ1bGVUeXBlXHJcbiAgICAgKiBAcGFyYW0gcnVsZU9mZnNldFxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0XHJcbiAgICAgKiBAcGFyYW0gdW50aWxcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBab25lSW5mbyhcclxuICAgIC8qKlxyXG4gICAgICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xyXG4gICAgICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXHJcbiAgICAgKiBpdCBpcyBvbmUgaG91ciBhaGVhZCBvZiBVVENcclxuICAgICAqL1xyXG4gICAgZ210b2ZmLCBcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG4gICAgICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcbiAgICAgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG4gICAgICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcbiAgICAgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcbiAgICAgKi9cclxuICAgIHJ1bGVUeXBlLCBcclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGFuIG9mZnNldCwgdGhpcyBpcyB0aGUgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIHJ1bGVPZmZzZXQsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxyXG4gICAgICovXHJcbiAgICBydWxlTmFtZSwgXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XHJcbiAgICAgKiB0aGUgc3RyaW5nLCDigJx6enos4oCdIHdoaWNoIGlzIGEga2luZCBvZiBudWxsIHZhbHVlIChkb27igJl0IGFzaylcclxuICAgICAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqIGZvciB0aGUgc3RhbmRhcmQgdGltZSBuYW1lIGFuZCB0aGUgc2Vjb25kIHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uIGZvciB0aGUgZGF5bGlnaHQgc2F2aW5nIHRpbWUgbmFtZVxyXG4gICAgICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxyXG4gICAgICovXHJcbiAgICBmb3JtYXQsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXHJcbiAgICAgKiBhbmQgZXhjbHVkaW5nIHRoaXMgdGltZXN0YW1wLlxyXG4gICAgICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSB1bmRlZmluZWQgKGZvciB0aGUgZmlyc3QgcnVsZSlcclxuICAgICAqL1xyXG4gICAgdW50aWwpIHtcclxuICAgICAgICB0aGlzLmdtdG9mZiA9IGdtdG9mZjtcclxuICAgICAgICB0aGlzLnJ1bGVUeXBlID0gcnVsZVR5cGU7XHJcbiAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gcnVsZU9mZnNldDtcclxuICAgICAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XHJcbiAgICAgICAgdGhpcy51bnRpbCA9IHVudGlsO1xyXG4gICAgICAgIGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBab25lSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5ab25lSW5mbyA9IFpvbmVJbmZvO1xyXG52YXIgVHpNb250aE5hbWVzO1xyXG4oZnVuY3Rpb24gKFR6TW9udGhOYW1lcykge1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkphblwiXSA9IDFdID0gXCJKYW5cIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJGZWJcIl0gPSAyXSA9IFwiRmViXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTWFyXCJdID0gM10gPSBcIk1hclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkFwclwiXSA9IDRdID0gXCJBcHJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXlcIl0gPSA1XSA9IFwiTWF5XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVuXCJdID0gNl0gPSBcIkp1blwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1bFwiXSA9IDddID0gXCJKdWxcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJBdWdcIl0gPSA4XSA9IFwiQXVnXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiU2VwXCJdID0gOV0gPSBcIlNlcFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk9jdFwiXSA9IDEwXSA9IFwiT2N0XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTm92XCJdID0gMTFdID0gXCJOb3ZcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJEZWNcIl0gPSAxMl0gPSBcIkRlY1wiO1xyXG59KShUek1vbnRoTmFtZXMgfHwgKFR6TW9udGhOYW1lcyA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUdXJucyBhIG1vbnRoIG5hbWUgZnJvbSB0aGUgVFogZGF0YWJhc2UgaW50byBhIG51bWJlciAxLTEyXHJcbiAqIEBwYXJhbSBuYW1lXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIG1vbnRoIG5hbWVcclxuICovXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvTnVtYmVyKG5hbWUpIHtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyArK2kpIHtcclxuICAgICAgICBpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiSW52YWxpZCBtb250aCBuYW1lICclcydcIiwgbmFtZSk7XHJcbn1cclxudmFyIFR6RGF5TmFtZXM7XHJcbihmdW5jdGlvbiAoVHpEYXlOYW1lcykge1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU3VuXCJdID0gMF0gPSBcIlN1blwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiTW9uXCJdID0gMV0gPSBcIk1vblwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVHVlXCJdID0gMl0gPSBcIlR1ZVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiV2VkXCJdID0gM10gPSBcIldlZFwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiVGh1XCJdID0gNF0gPSBcIlRodVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiRnJpXCJdID0gNV0gPSBcIkZyaVwiO1xyXG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU2F0XCJdID0gNl0gPSBcIlNhdFwiO1xyXG59KShUekRheU5hbWVzIHx8IChUekRheU5hbWVzID0ge30pKTtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXHJcbiAqIDEsIC0xLCArMSwgMDEsIDE6MDAsIDE6MjM6MjUuMTQzXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZE9mZnNldFN0cmluZyhzKSB7XHJcbiAgICByZXR1cm4gL14oXFwtfFxcKyk/KFswLTldKygoXFw6WzAtOV0rKT8oXFw6WzAtOV0rKFxcLlswLTldKyk/KT8pKSQvLnRlc3Qocyk7XHJcbn1cclxuZXhwb3J0cy5pc1ZhbGlkT2Zmc2V0U3RyaW5nID0gaXNWYWxpZE9mZnNldFN0cmluZztcclxuLyoqXHJcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxyXG4gKi9cclxudmFyIFRyYW5zaXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gYXRcclxuICAgICAqIEBwYXJhbSBvZmZzZXRcclxuICAgICAqIEBwYXJhbSBsZXR0ZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUcmFuc2l0aW9uKFxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xyXG4gICAgICovXHJcbiAgICBhdCwgXHJcbiAgICAvKipcclxuICAgICAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxyXG4gICAgICovXHJcbiAgICBvZmZzZXQsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBOZXcgdGltem9uZSBhYmJyZXZpYXRpb24gbGV0dGVyXHJcbiAgICAgKi9cclxuICAgIGxldHRlcikge1xyXG4gICAgICAgIHRoaXMuYXQgPSBhdDtcclxuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5vZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVHJhbnNpdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5UcmFuc2l0aW9uID0gVHJhbnNpdGlvbjtcclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG52YXIgTm9ybWFsaXplT3B0aW9uO1xyXG4oZnVuY3Rpb24gKE5vcm1hbGl6ZU9wdGlvbikge1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiVXBcIl0gPSAwXSA9IFwiVXBcIjtcclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG4gICAgICovXHJcbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XHJcbn0pKE5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uIHx8IChleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGlzIGEgd3JhcHBlciBhcm91bmQgdGltZSB6b25lIGRhdGEgSlNPTiBvYmplY3QgZnJvbSB0aGUgdHpkYXRhIE5QTSBtb2R1bGUuXHJcbiAqIFlvdSB1c3VhbGx5IGRvIG5vdCBuZWVkIHRvIHVzZSB0aGlzIGRpcmVjdGx5LCB1c2UgVGltZVpvbmUgYW5kIERhdGVUaW1lIGluc3RlYWQuXHJcbiAqL1xyXG52YXIgVHpEYXRhYmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcclxuICAgICAqIEB0aHJvd3MgQWxyZWFkeUNyZWF0ZWQgaWYgYW4gaW5zdGFuY2UgYWxyZWFkeSBleGlzdHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGBkYXRhYCBpcyBlbXB0eSBvciBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFR6RGF0YWJhc2UoZGF0YSkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3pvbmVJbmZvQ2FjaGUgPSB7fTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogcnVsZSBpbmZvIGNhY2hlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZSA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHByZS1jYWxjdWxhdGVkIHRyYW5zaXRpb25zIHBlciB6b25lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fem9uZVRyYW5zaXRpb25zQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcHJlLWNhbGN1bGF0ZWQgdHJhbnNpdGlvbnMgcGVyIHJ1bGVzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9ydWxlVHJhbnNpdGlvbnNDYWNoZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJBbHJlYWR5Q3JlYXRlZFwiLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGRhdGEubGVuZ3RoID4gMCwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIik7XHJcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZC5ydWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBPYmplY3Qua2V5cyhkLnpvbmVzKTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jW19iXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXHJcbiAgICAgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYGRhdGFgIG9yIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkOyAvLyBuZWVkZWQgZm9yIGFzc2VydCBpbiBjb25zdHJ1Y3RvclxyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGRhdGFfMSA9IFtdO1xyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGluIGdsb2JhbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgdmFyIGcgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnID0gd2luZG93O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcgPSBnbG9iYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcgPSBzZWxmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZyA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoXCJ0emRhdGFcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZ1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG4gICAgICAgICAgICB2YXIgZmluZE5vZGVNb2R1bGVzID0gZnVuY3Rpb24gKHJlcXVpcmUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHRyeSBzdWJzZXRzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZHVsZU5hbWVzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hZnJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYW50YXJjdGljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldGNldGVyYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldXJvcGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXBhY2lmaWNuZXdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXN5c3RlbXZcIlxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoZGF0YV8xLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGFfMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG4gICAgICAgICAgICB0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBleGlzdHNcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmV4aXN0cyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAgICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG4gICAgICpcclxuICAgICAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWluRHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZU5hbWVzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc18xID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18xW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCB0ZW1wXzEgPSB0ZW1wOyBfYSA8IHRlbXBfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBfMVtfYV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgW1wiTm90Rm91bmQuUnVsZVwiLCBcIkFyZ3VtZW50Lk5cIl0pKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gZXJyb3JfMS5lcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1heGltdW0gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAgICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG4gICAgICpcclxuICAgICAqIFJldHVybnMgMCBpZiB6b25lTmFtZSBnaXZlbiBhbmQgbm8gRFNUIG9ic2VydmVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm1heERzdFNhdmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoem9uZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfMiA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfMi5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfMltfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIHRlbXBfMiA9IHRlbXA7IF9hIDwgdGVtcF8yLmxlbmd0aDsgX2ErKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcF8yW19hXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5tYXhEc3RTYXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFtcIk5vdEZvdW5kLlJ1bGVcIiwgXCJBcmd1bWVudC5OXCJdKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGVycm9yXzEuZXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgem9uZSBoYXMgRFNUIGF0IGFsbFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuaGFzRHN0ID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5uZXh0RHN0Q2hhbmdlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhKSB7XHJcbiAgICAgICAgdmFyIHV0Y1RpbWUgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChhKSA6IGEpO1xyXG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcclxuICAgICAgICB2YXIgaXRlcmF0b3IgPSB6b25lLmZpbmRGaXJzdCgpO1xyXG4gICAgICAgIGlmIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjID4gdXRjVGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IpIHtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSB6b25lLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPiB1dGNUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xyXG4gICAgICogXCJFdGMvVVRDXCIsIFwiRXRjL0dNVFwiIG9yIFwiRXRjL1VDVFwiIGluIHRoZSBUWiBkYXRhYmFzZS4gVGhpcyBpcyB0cnVlIGUuZy4gZm9yXHJcbiAgICAgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVJc1V0YyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuICAgIH07XHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5ub3JtYWxpemVMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgYSwgb3B0KSB7XHJcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IE5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2FsVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgICAgIC8vIGxvY2FsIHRpbWVzIGJlaGF2ZSBsaWtlIHRoaXMgZHVyaW5nIERTVCBjaGFuZ2VzOlxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xyXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG4gICAgICAgICAgICAvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuICAgICAgICAgICAgLy8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcclxuICAgICAgICAgICAgLy8gdG9kbyByZXBsYWNlIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKCkgYnkgZGlyZWN0IHVzZSBvZiB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoKVxyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDEpO1xyXG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xyXG4gICAgICAgICAgICB2YXIgcHJldiA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgdHJhbnNpdGlvbnNfMSA9IHRyYW5zaXRpb25zOyBfaSA8IHRyYW5zaXRpb25zXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zXzFbX2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQmVmb3JlID0gdHJhbnNpdGlvbi5hdCArIHByZXYubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQWZ0ZXIgPSB0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9uLWV4aXN0aW5nIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2ID0gdHJhbnNpdGlvbi5vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbm8gbm9uLWV4aXN0aW5nIHRpbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IGEgOiBhLmNsb25lKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcbiAgICAgKiBUaHJvd3MgaWYgaW5mbyBub3QgZm91bmQuXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB6b25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xyXG4gICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XHJcbiAgICAgKiB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHUgPSB0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZTtcclxuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XHJcbiAgICAgICAgdmFyIHN0YXRlID0gem9uZS5zdGF0ZUF0KHUpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZS5kc3RPZmZzZXQuYWRkKHN0YXRlLnN0YW5kYXJkT2Zmc2V0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuICAgICAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XHJcbiAgICAgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5hYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQgPT09IHZvaWQgMCkgeyBkc3REZXBlbmRlbnQgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIHUgPSB0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZTtcclxuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB6b25lLnN0YXRlQXQodSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5hYmJyZXZpYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbGFzdE5vbkRzdCA9IHpvbmUuaW5pdGlhbFN0YXRlLmRzdE9mZnNldC5taWxsaXNlY29uZHMoKSA9PT0gMCA/IHpvbmUuaW5pdGlhbFN0YXRlLmFiYnJldmlhdGlvbiA6IFwiXCI7XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHpvbmUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgICAgIGlmICgoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGFzdE5vbkRzdCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuYWJicmV2aWF0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjIDw9IHUpIHtcclxuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gem9uZS5maW5kTmV4dChpdGVyYXRvcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5taWxsaXNlY29uZHMoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0Tm9uRHN0ID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5hYmJyZXZpYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGxhc3ROb25Ec3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAsIGFnYWluIGV4Y2x1ZGluZyBEU1QuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxyXG4gICAgICogdGhlbiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBpcyByZXR1cm5lZC5cclxuICAgICAqXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXRMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgbG9jYWxUaW1lKSB7XHJcbiAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IGxvY2FsVGltZSA6IGxvY2FsVGltZS51bml4TWlsbGlzKTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzMgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18zW19pXTtcclxuICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXHJcbiAgICAgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcbiAgICAgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lTmFtZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS50b3RhbE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkVG0gPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XHJcbiAgICAgICAgLy8vIE5vdGU6IGR1cmluZyBvZmZzZXQgY2hhbmdlcywgbG9jYWwgdGltZSBjYW4gYmVoYXZlIGxpa2U6XHJcbiAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG4gICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcclxuICAgICAgICAvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXHJcbiAgICAgICAgLy8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWUsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgLSAxLCBub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyICsgMSk7XHJcbiAgICAgICAgdmFyIHByZXY7XHJcbiAgICAgICAgdmFyIHByZXZQcmV2O1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgdHJhbnNpdGlvbnNfMiA9IHRyYW5zaXRpb25zOyBfaSA8IHRyYW5zaXRpb25zXzIubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNfMltfaV07XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgPiBub3JtYWxpemVkVG0udW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgLy8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2UHJldiA9IHByZXY7XHJcbiAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG4gICAgICAgIGlmIChwcmV2KSB7XHJcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FyZSBkdXJpbmcgYmFja3dhcmQgY2hhbmdlOiB0YWtlIGZpcnN0IG9jY3VycmVuY2Ugb2YgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICBpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICYmIG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldlByZXYub2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aGlzIGNhbm5vdCBoYXBwZW4gYXMgdGhlIHRyYW5zaXRpb25zIGFycmF5IGlzIGd1YXJhbnRlZWQgdG8gY29udGFpbiBhIHRyYW5zaXRpb24gYXQgdGhlXHJcbiAgICAgICAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXHJcbiAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxyXG4gICAgICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW4gcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAZGVwcmVjYXRlZFxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZHN0T2Zmc2V0Rm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIG9mZnNldDtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGlmICghb2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xyXG4gICAgICAgICAgICBvZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0aW1lIHpvbmUgbGV0dGVyIGZvciB0aGUgZ2l2ZW5cclxuICAgICAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcbiAgICAgKlxyXG4gICAgICogQGRlcHJlY2F0ZWRcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubGV0dGVyRm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIGxldHRlcjtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIWxldHRlcikge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxldHRlcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxyXG4gICAgICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXByZWNhdGVkXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZyb21ZZWFyIGlmIGZyb21ZZWFyID4gdG9ZZWFyXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlTmFtZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMgPSBmdW5jdGlvbiAocnVsZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmcm9tWWVhciA8PSB0b1llYXIsIFwiQXJndW1lbnQuRnJvbVllYXJcIiwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9nZXRSdWxlVHJhbnNpdGlvbnMocnVsZU5hbWUpO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcHJldkRzdCA9IGR1cmF0aW9uXzEuaG91cnMoMCk7IC8vIHdyb25nLCBidXQgdGhhdCdzIHdoeSB0aGUgZnVuY3Rpb24gaXMgZGVwcmVjYXRlZFxyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHJ1bGVzLmZpbmRGaXJzdCgpO1xyXG4gICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0LnllYXIgPD0gdG9ZZWFyKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0LnllYXIgPj0gZnJvbVllYXIgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdC55ZWFyIDw9IHRvWWVhcikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0OiBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgcHJldkRzdCkudW5peE1pbGxpcyxcclxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyIHx8IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldkRzdCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHJ1bGVzLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuYXQgLSBiLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cclxuICAgICAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vbmUgd2l0aGluIHRoZSByYW5nZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gcm9tWWVhciBpZiBmcm9tWWVhciA+IHRvWWVhclxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIpIHtcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJBcmd1bWVudC5Gcm9tWWVhclwiLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIHN0YXJ0U3RhdGUgPSB6b25lLnN0YXRlQXQobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBmcm9tWWVhciwgbW9udGg6IDEsIGRheTogMSB9KSk7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICBhdDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBmcm9tWWVhciB9KS51bml4TWlsbGlzLFxyXG4gICAgICAgICAgICBsZXR0ZXI6IHN0YXJ0U3RhdGUubGV0dGVyLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHN0YXJ0U3RhdGUuZHN0T2Zmc2V0LmFkZChzdGFydFN0YXRlLnN0YW5kYXJkT2Zmc2V0KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHpvbmUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8PSB0b1llYXIpIHtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA+PSBmcm9tWWVhcikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0OiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlciB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHpvbmUuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxyXG4gICAgICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mbyA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc180ID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc180Lmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNFtfaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJOb3RGb3VuZC5ab25lXCIsIFwibm8gem9uZSBpbmZvIGZvdW5kIGZvciB6b25lICclcydcIiwgem9uZU5hbWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lIHNvcnRlZCBieSBVTlRJTCwgYWZ0ZXJcclxuICAgICAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZSBsaWtlIFwiUGFjaWZpYy9FZmF0ZVwiXHJcbiAgICAgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIGRvZXMgbm90IGV4aXN0IG9yIGEgbGlua2VkIHpvbmUgZG9lcyBub3QgZXhpdFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mb3MgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICAvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSksIFwiTm90Rm91bmQuWm9uZVwiLCBcInpvbmUgbm90IGZvdW5kOiAnJXMnXCIsIHpvbmVOYW1lKTtcclxuICAgICAgICAvLyBUYWtlIGZyb20gY2FjaGVcclxuICAgICAgICBpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiTm90Rm91bmQuWm9uZVwiLCBcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgKyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuICAgICAgICAgICAgem9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluYWwgem9uZSBpbmZvIGZvdW5kXHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lRW50cmllc18xID0gem9uZUVudHJpZXM7IF9pIDwgem9uZUVudHJpZXNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzXzFbX2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuICAgICAgICAgICAgdmFyIHVudGlsID0gbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbM10pO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odW50aWwpKSB7XHJcbiAgICAgICAgICAgICAgICB1bnRpbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgWm9uZUluZm8oZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKC0xICogbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbMF0pKSwgcnVsZVR5cGUsIHJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQgPyBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oKSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lID8gem9uZUVudHJ5WzFdIDogXCJcIiwgem9uZUVudHJ5WzJdLCB1bnRpbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAvLyBzb3J0IHVuZGVmaW5lZCBsYXN0XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEudW50aWwgIT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChhLnVudGlsIC0gYi51bnRpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuICAgICAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG4gICAgICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcclxuICAgICAgICAvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2RhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpLCBcIk5vdEZvdW5kLlJ1bGVcIiwgXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG4gICAgICAgIC8vIHJldHVybiBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJ1bGVTZXRfMSA9IHJ1bGVTZXQ7IF9pIDwgcnVsZVNldF8xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlU2V0XzFbX2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZyb21ZZWFyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9ZZWFyID0gKHRvVHlwZSA9PT0gVG9UeXBlLk1heCA/IDAgOiAocnVsZVsxXSA9PT0gXCJvbmx5XCIgPyBmcm9tWWVhciA6IHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgb25EYXkgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcclxuICAgICAgICAgICAgICAgIHZhciBvbldlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vbnRoTmFtZSA9IHJ1bGVbM107XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9udGhOdW1iZXIgPSBtb250aE5hbWVUb051bWJlcihtb250aE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFJ1bGVJbmZvKGZyb21ZZWFyLCB0b1R5cGUsIHRvWWVhciwgcnVsZVsyXSwgbW9udGhOdW1iZXIsIG9uVHlwZSwgb25EYXksIG9uV2Vla0RheSwgbWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzBdLCAxMCksIDI0KSwgLy8gbm90ZSB0aGUgZGF0YWJhc2Ugc29tZXRpbWVzIGNvbnRhaW5zIFwiMjRcIiBhcyBob3VyIHZhbHVlXHJcbiAgICAgICAgICAgICAgICBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLCB0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLCBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSwgcnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdID0gcmVzdWx0O1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFtcIkFyZ3VtZW50LlRvXCIsIFwiQXJndW1lbnQuTlwiLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwiQXJndW1lbnQuQW1vdW50XCJdKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGVycm9yXzEuZXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVJ1bGVUeXBlID0gZnVuY3Rpb24gKHJ1bGUpIHtcclxuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5UbyBmb3IgaW52YWxpZCBUT1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xyXG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXHJcbiAgICAgICAgaWYgKHRvID09PSBcIm1heFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuTWF4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIWlzTmFOKHBhcnNlSW50KHRvLCAxMCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Ub1wiLCBcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6ICVzXCIsIHRvKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgT04gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uVHlwZSA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MYXN0WDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkdyZXFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gT25UeXBlLkRheU51bTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25EYXkgPSBmdW5jdGlvbiAob24sIG9uVHlwZSkge1xyXG4gICAgICAgIHN3aXRjaCAob25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTogcmV0dXJuIHBhcnNlSW50KG9uLCAxMCk7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uV2Vla0RheSA9IGZ1bmN0aW9uIChvbikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChvbi5pbmRleE9mKFR6RGF5TmFtZXNbaV0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzaWNzXzEuV2Vla0RheS5TdW5kYXk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxyXG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VBdFR5cGUgPSBmdW5jdGlvbiAoYXQpIHtcclxuICAgICAgICBzd2l0Y2ggKGF0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHByZS1jYWxjdWxhdGVkIHpvbmUgdHJhbnNpdGlvbnNcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBkb2VzIG5vdCBleGlzdCBvciBhIGxpbmtlZCB6b25lIGRvZXMgbm90IGV4aXRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRab25lVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fem9uZVRyYW5zaXRpb25zQ2FjaGUuZ2V0KHpvbmVOYW1lKTtcclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQ2FjaGVkWm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lLCB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSksIHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9uc0ZvclpvbmUoem9uZU5hbWUpKTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZVRyYW5zaXRpb25zQ2FjaGUuc2V0KHpvbmVOYW1lLCByZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHByZS1jYWxjdWxhdGVkIHJ1bGUgdHJhbnNpdGlvbnNcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRSdWxlVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fcnVsZVRyYW5zaXRpb25zQ2FjaGUuZ2V0KHJ1bGVOYW1lKTtcclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQ2FjaGVkUnVsZVRyYW5zaXRpb25zKHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bGVUcmFuc2l0aW9uc0NhY2hlLnNldChydWxlTmFtZSwgcmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXAgb2YgcnVsZU5hbWUtPkNhY2hlZFJ1bGVUcmFuc2l0aW9ucyBmb3IgYWxsIHJ1bGUgc2V0cyB0aGF0IGFyZSByZWZlcmVuY2VkIGJ5IGEgem9uZVxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIGRvZXMgbm90IGV4aXN0IG9yIGEgbGlua2VkIHpvbmUgZG9lcyBub3QgZXhpdFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRSdWxlVHJhbnNpdGlvbnNGb3Jab25lID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzUgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzUubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc181W19pXTtcclxuICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuaGFzKHpvbmVJbmZvLnJ1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXQoem9uZUluZm8ucnVsZU5hbWUsIHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9ucyh6b25lSW5mby5ydWxlTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFR6RGF0YWJhc2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVHpEYXRhYmFzZSA9IFR6RGF0YWJhc2U7XHJcbi8qKlxyXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGEpIHtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIsIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcInRpbWUgem9uZSBkYXRhIHNob3VsZCBiZSBhbiBvYmplY3RcIik7XHJcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwidGltZSB6b25lIGRhdGEgc2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoIGEgJ3J1bGVzJyBwcm9wZXJ0eVwiKTtcclxuICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggYSAnem9uZXMnIHByb3BlcnR5XCIpO1xyXG4gICAgLy8gdmFsaWRhdGUgem9uZXNcclxuICAgIGZvciAodmFyIHpvbmVOYW1lIGluIGRhdGEuem9uZXMpIHtcclxuICAgICAgICBpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVBcnIgPSBkYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoem9uZUFycikgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lQXJyKSwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgZm9yIHpvbmUgXFxcIiVzXFxcIiBsaW5rcyB0byBcXFwiJXNcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiLCB6b25lTmFtZSwgem9uZUFycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh6b25lQXJyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgZm9yIHpvbmUgXFxcIiVzXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiLCB6b25lTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgc2Vjb25kIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMl0gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gdW5kZWZpbmVkIHx8IGdtdG9mZiA+IHJlc3VsdC5tYXhHbXRPZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gdmFsaWRhdGUgcnVsZXNcclxuICAgIGZvciAodmFyIHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcclxuICAgICAgICBpZiAoZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIHJ1bGVBcnIgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlLmxlbmd0aCA8IDgpIHsgLy8gbm90ZSBzb21lIHJ1bGVzID4gOCBleGlzdHMgYnV0IHRoYXQgc2VlbXMgdG8gYmUgYSBidWcgaW4gdHogZmlsZSBwYXJzaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqICE9PSA1ICYmIHR5cGVvZiBydWxlW2pdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs0XS5pbmRleE9mKFwiPD1cIikgPT09IC0xICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbNF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IG9mIGxlbmd0aCA0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMl0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XVszXSAhPT0gXCJcIiAmJiBydWxlWzVdWzNdICE9PSBcInNcIiAmJiBydWxlWzVdWzNdICE9PSBcIndcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZSA9IHBhcnNlSW50KHJ1bGVbNl0sIDEwKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHNhdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluRHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICogUmVhZHktbWFkZSBzb3J0ZWQgcnVsZSB0cmFuc2l0aW9ucyAodW5jb21wZW5zYXRlZCBmb3Igc3Rkb2Zmc2V0LCBhcyBydWxlcyBhcmUgdXNlZCBieSBtdWx0aXBsZSB6b25lcyB3aXRoIGRpZmZlcmVudCBvZmZzZXRzKVxyXG4gKi9cclxudmFyIENhY2hlZFJ1bGVUcmFuc2l0aW9ucyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBydWxlSW5mb3NcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gQ2FjaGVkUnVsZVRyYW5zaXRpb25zKHJ1bGVJbmZvcykge1xyXG4gICAgICAgIC8vIGRldGVybWluZSBtYXhpbXVtIHllYXIgdG8gY2FsY3VsYXRlIHRyYW5zaXRpb25zIGZvclxyXG4gICAgICAgIHZhciBtYXhZZWFyO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgcnVsZUluZm9zXzEgPSBydWxlSW5mb3M7IF9pIDwgcnVsZUluZm9zXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc18xW19pXTtcclxuICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnRvVHlwZSA9PT0gVG9UeXBlLlllYXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXhZZWFyID09PSB1bmRlZmluZWQgfHwgcnVsZUluZm8udG9ZZWFyID4gbWF4WWVhcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heFllYXIgPSBydWxlSW5mby50b1llYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4WWVhciA9PT0gdW5kZWZpbmVkIHx8IHJ1bGVJbmZvLmZyb20gPiBtYXhZZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4WWVhciA9IHJ1bGVJbmZvLmZyb207XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGFsbCB0cmFuc2l0aW9ucyB1bnRpbCAnbWF4JyBydWxlcyB0YWtlIGVmZmVjdFxyXG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2EgPSAwLCBydWxlSW5mb3NfMiA9IHJ1bGVJbmZvczsgX2EgPCBydWxlSW5mb3NfMi5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gcnVsZUluZm9zXzJbX2FdO1xyXG4gICAgICAgICAgICB2YXIgbWluID0gcnVsZUluZm8uZnJvbTtcclxuICAgICAgICAgICAgdmFyIG1heCA9IHJ1bGVJbmZvLnRvVHlwZSA9PT0gVG9UeXBlLlllYXIgPyBydWxlSW5mby50b1llYXIgOiBtYXhZZWFyO1xyXG4gICAgICAgICAgICBpZiAobWF4ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHllYXIgPSBtaW47IHllYXIgPD0gbWF4OyArK3llYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXQ6IHJ1bGVJbmZvLmVmZmVjdGl2ZURhdGUoeWVhciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0VHlwZTogcnVsZUluZm8uYXRUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBydWxlSW5mby5zYXZlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBydWxlSW5mby5sZXR0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNvcnQgdHJhbnNpdGlvbnNcclxuICAgICAgICB0aGlzLl90cmFuc2l0aW9ucyA9IHRoaXMuX3RyYW5zaXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChhLmF0IDwgYi5hdCA/IC0xIDpcclxuICAgICAgICAgICAgICAgIGEuYXQgPiBiLmF0ID8gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gc2F2ZSB0aGUgJ21heCcgcnVsZXMgZm9yIHRyYW5zaXRpb25zIGFmdGVyIHRoYXRcclxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlID0gcnVsZUluZm9zLmZpbHRlcihmdW5jdGlvbiAoaW5mbykgeyByZXR1cm4gaW5mby50b1R5cGUgPT09IFRvVHlwZS5NYXg7IH0pO1xyXG4gICAgICAgIHRoaXMuX2ZpbmFsUnVsZXNCeUVmZmVjdGl2ZSA9IF9fc3ByZWFkQXJyYXlzKHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUpO1xyXG4gICAgICAgIC8vIHNvcnQgZmluYWwgcnVsZXMgYnkgRlJPTSBhbmQgdGhlbiBieSB5ZWFyLXJlbGF0aXZlIGRhdGVcclxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlID0gdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIGlmIChhLmZyb20gPCBiLmZyb20pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS5mcm9tID4gYi5mcm9tKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYWUgPSBhLmVmZmVjdGl2ZURhdGUoYS5mcm9tKTtcclxuICAgICAgICAgICAgdmFyIGJlID0gYi5lZmZlY3RpdmVEYXRlKGIuZnJvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYWUgPCBiZSA/IC0xIDpcclxuICAgICAgICAgICAgICAgIGFlID4gYmUgPyAxIDpcclxuICAgICAgICAgICAgICAgICAgICAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBzb3J0IGZpbmFsIHJ1bGVzIGJ5IHllYXItcmVsYXRpdmUgZGF0ZVxyXG4gICAgICAgIHRoaXMuX2ZpbmFsUnVsZXNCeUVmZmVjdGl2ZSA9IHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICB2YXIgYWUgPSBhLmVmZmVjdGl2ZURhdGUoYS5mcm9tKTtcclxuICAgICAgICAgICAgdmFyIGJlID0gYi5lZmZlY3RpdmVEYXRlKGIuZnJvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYWUgPCBiZSA/IC0xIDpcclxuICAgICAgICAgICAgICAgIGFlID4gYmUgPyAxIDpcclxuICAgICAgICAgICAgICAgICAgICAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLCBcImZpbmFsXCIsIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgJ21heCcgdHlwZSBydWxlcyBhdCB0aGUgZW5kLCBzb3J0ZWQgYnkgeWVhci1yZWxhdGl2ZSBlZmZlY3RpdmUgZGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluYWxSdWxlc0J5RWZmZWN0aXZlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZXZlciB0cmFuc2l0aW9uIGFzIGRlZmluZWQgYnkgdGhlIHJ1bGUgc2V0XHJcbiAgICAgKi9cclxuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmluZEZpcnN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcy5fdHJhbnNpdGlvbnNbMF07XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXHJcbiAgICAgICAgICAgICAgICBpbmRleDogMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHJ1bGUgPSB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlWzBdO1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGF0OiBydWxlLmVmZmVjdGl2ZURhdGUocnVsZS5mcm9tKSxcclxuICAgICAgICAgICAgICAgIGF0VHlwZTogcnVsZS5hdFR5cGUsXHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcnVsZS5zYXZlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZS5sZXR0ZXJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcclxuICAgICAgICAgICAgICAgIGZpbmFsOiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdHJhbnNpdGlvbiwgZ2l2ZW4gYW4gaXRlcmF0b3JcclxuICAgICAqIEBwYXJhbSBwcmV2IHRoZSBpdGVyYXRvclxyXG4gICAgICovXHJcbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKHByZXYpIHtcclxuICAgICAgICBpZiAoIXByZXYuZmluYWwgJiYgcHJldi5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmV2LmluZGV4IDwgdGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0aGlzLl90cmFuc2l0aW9uc1twcmV2LmluZGV4ICsgMV07XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogcHJldi5pbmRleCArIDFcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluZCBtaW5pbXVtIGFwcGxpY2FibGUgZmluYWwgcnVsZSBhZnRlciB0aGUgcHJldiB0cmFuc2l0aW9uXHJcbiAgICAgICAgdmFyIGZvdW5kO1xyXG4gICAgICAgIHZhciBmb3VuZEVmZmVjdGl2ZTtcclxuICAgICAgICBmb3IgKHZhciB5ZWFyID0gcHJldi50cmFuc2l0aW9uLmF0LnllYXI7IHllYXIgPCBwcmV2LnRyYW5zaXRpb24uYXQueWVhciArIDI7ICsreWVhcikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5fZmluYWxSdWxlc0J5RWZmZWN0aXZlOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5hcHBsaWNhYmxlKHllYXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVmZmVjdGl2ZSA9IHJ1bGUuZWZmZWN0aXZlRGF0ZSh5ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWZmZWN0aXZlID4gcHJldi50cmFuc2l0aW9uLmF0ICYmICghZm91bmRFZmZlY3RpdmUgfHwgZWZmZWN0aXZlIDwgZm91bmRFZmZlY3RpdmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcnVsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRFZmZlY3RpdmUgPSBlZmZlY3RpdmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmb3VuZCAmJiBmb3VuZEVmZmVjdGl2ZSkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGF0OiBmb3VuZEVmZmVjdGl2ZSxcclxuICAgICAgICAgICAgICAgIGF0VHlwZTogZm91bmQuYXRUeXBlLFxyXG4gICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGZvdW5kLnNhdmUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBmb3VuZC5sZXR0ZXJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcclxuICAgICAgICAgICAgICAgIGZpbmFsOiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERpcnR5IGZpbmQgZnVuY3Rpb24gdGhhdCBvbmx5IHRha2VzIGEgc3RhbmRhcmQgb2Zmc2V0IGZyb20gVVRDIGludG8gYWNjb3VudFxyXG4gICAgICogQHBhcmFtIGJlZm9yZVV0YyB0aW1lc3RhbXAgdG8gc2VhcmNoIGZvclxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHpvbmUgc3RhbmRhcmQgb2Zmc2V0IHRvIGFwcGx5XHJcbiAgICAgKi9cclxuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmluZExhc3RMZXNzRXF1YWwgPSBmdW5jdGlvbiAoYmVmb3JlVXRjLCBzdGFuZGFyZE9mZnNldCkge1xyXG4gICAgICAgIHZhciBwcmV2VHJhbnNpdGlvbjtcclxuICAgICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLmZpbmRGaXJzdCgpO1xyXG4gICAgICAgIHZhciBlZmZlY3RpdmVVdGMgPSAoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24pID8gcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIHVuZGVmaW5lZCkgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGVmZmVjdGl2ZVV0YyAmJiBlZmZlY3RpdmVVdGMgPD0gYmVmb3JlVXRjKSB7XHJcbiAgICAgICAgICAgIHByZXZUcmFuc2l0aW9uID0gaXRlcmF0b3IudHJhbnNpdGlvbjtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCB1bmRlZmluZWQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJldlRyYW5zaXRpb247XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFmdGVyVXRjXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcclxuICAgICAqIEBwYXJhbSBkc3RPZmZzZXRcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maXJzdFRyYW5zaXRpb25XaXRob3V0RHN0QWZ0ZXIgPSBmdW5jdGlvbiAoYWZ0ZXJVdGMsIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy8gdG9kbyBpbmVmZmljaWVudCAtIG9wdGltaXplXHJcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcclxuICAgICAgICB2YXIgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgZWZmZWN0aXZlVXRjICYmICghKChfYSA9IGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubmV3U3RhdGUuZHN0T2Zmc2V0Lnplcm8oKSkgfHwgZWZmZWN0aXZlVXRjIDw9IGFmdGVyVXRjKSkge1xyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHRoaXMuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICBlZmZlY3RpdmVVdGMgPSAoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24pID8gcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb247XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIENhY2hlZFJ1bGVUcmFuc2l0aW9ucztcclxufSgpKTtcclxuLyoqXHJcbiAqIFJ1bGVzIGRlcGVuZCBvbiBwcmV2aW91cyBydWxlcywgaGVuY2UgeW91IGNhbm5vdCBjYWxjdWxhdGUgRFNUIHRyYW5zaXRpb25zIHdpdG91dCBzdGFydGluZyBhdCB0aGUgc3RhcnQuXHJcbiAqIE5leHQgdG8gdGhhdCwgem9uZXMgc29tZXRpbWVzIHRyYW5zaXRpb24gaW50byB0aGUgbWlkZGxlIG9mIGEgcnVsZSBzZXQuXHJcbiAqIER1ZSB0byB0aGlzLCB3ZSBtYWludGFpbiBhIGNhY2hlIG9mIHRyYW5zaXRpb25zIGZvciB6b25lc1xyXG4gKi9cclxudmFyIENhY2hlZFpvbmVUcmFuc2l0aW9ucyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxyXG4gICAgICogQHBhcmFtIHpvbmVJbmZvc1xyXG4gICAgICogQHBhcmFtIHJ1bGVzXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlpvbmVJbmZvcyBpZiB6b25lSW5mb3MgaXMgZW1wdHlcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gQ2FjaGVkWm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lLCB6b25lSW5mb3MsIHJ1bGVzKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwidGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ab25lSW5mb3NcIiwgXCJ6b25lICclcycgd2l0aG91dCBpbmZvcm1hdGlvblwiLCB6b25lTmFtZSk7XHJcbiAgICAgICAgdGhpcy5fZmluYWxab25lSW5mbyA9IHpvbmVJbmZvc1t6b25lSW5mb3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgdGhpcy5faW5pdGlhbFN0YXRlID0gdGhpcy5fY2FsY0luaXRpYWxTdGF0ZSh6b25lTmFtZSwgem9uZUluZm9zLCBydWxlcyk7XHJcbiAgICAgICAgX2EgPSB0aGlzLl9jYWxjVHJhbnNpdGlvbnMoem9uZU5hbWUsIHRoaXMuX2luaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcyksIHRoaXMuX3RyYW5zaXRpb25zID0gX2FbMF0sIHRoaXMuX2ZpbmFsUnVsZXMgPSBfYVsxXTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsU3RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIHRoZSBmaXJzdCB0cmFuc2l0aW9uLCBpZiBpdCBleGlzdHNcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMuX3RyYW5zaXRpb25zWzBdLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgbmV4dCB0cmFuc2l0aW9uLCBpZiBpdCBleGlzdHNcclxuICAgICAqIEBwYXJhbSBpdGVyYXRvciBwcmV2aW91cyBpdGVyYXRvclxyXG4gICAgICogQHJldHVybnMgdGhlIG5leHQgaXRlcmF0b3JcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kTmV4dCA9IGZ1bmN0aW9uIChpdGVyYXRvcikge1xyXG4gICAgICAgIGlmICghaXRlcmF0b3IuZmluYWwpIHtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmluZGV4IDwgdGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLl90cmFuc2l0aW9uc1tpdGVyYXRvci5pbmRleCArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpdGVyYXRvci5pbmRleCArIDFcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZvdW5kO1xyXG4gICAgICAgIGZvciAodmFyIHkgPSBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXI7IHkgPCBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgKyAyOyArK3kpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuX2ZpbmFsUnVsZXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdFV0YzogcnVsZUluZm8uZWZmZWN0aXZlRGF0ZVV0Yyh5LCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLnN0YW5kYXJkT2Zmc2V0LCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24odGhpcy5fZmluYWxab25lSW5mby5mb3JtYXQsIHJ1bGVJbmZvLnNhdmUubm9uWmVybygpLCBydWxlSW5mby5sZXR0ZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBydWxlSW5mby5sZXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGVJbmZvLnNhdmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdFV0YyA+IGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZCB8fCBmb3VuZC5hdFV0YyA+IHRyYW5zaXRpb24uYXRVdGMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJhbnNpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IGZvdW5kLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgem9uZSBzdGF0ZSBhdCB0aGUgZ2l2ZW4gVVRDIHRpbWVcclxuICAgICAqIEBwYXJhbSB1dGNcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5zdGF0ZUF0ID0gZnVuY3Rpb24gKHV0Yykge1xyXG4gICAgICAgIHZhciBwcmV2U3RhdGUgPSB0aGlzLl9pbml0aWFsU3RhdGU7XHJcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0YyA8PSB1dGMpIHtcclxuICAgICAgICAgICAgcHJldlN0YXRlID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZTtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByZXZTdGF0ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZSBmb3IgdGhlIHpvbmVcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxyXG4gICAgICogQHBhcmFtIGluZm9zXHJcbiAgICAgKiBAcGFyYW0gcnVsZXNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhXHJcbiAgICAgKi9cclxuICAgIENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUuX2NhbGNJbml0aWFsU3RhdGUgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGluZm9zLCBydWxlcykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAvLyBpbml0aWFsIHN0YXRlXHJcbiAgICAgICAgaWYgKGluZm9zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgbGV0dGVyOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBkdXJhdGlvbl8xLmhvdXJzKDApLFxyXG4gICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGluZm8gPSBpbmZvc1swXTtcclxuICAgICAgICBzd2l0Y2ggKGluZm8ucnVsZVR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5Ob25lOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oaW5mby5mb3JtYXQsIGZhbHNlLCB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKGluZm8uZm9ybWF0LCBpbmZvLnJ1bGVPZmZzZXQubm9uWmVybygpLCB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGluZm8ucnVsZU9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaW5mby5nbXRvZmZcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuUnVsZU5hbWU6IHtcclxuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZXMuZ2V0KGluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFydWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcInpvbmUgJyVzJyByZWZlcnMgdG8gbm9uLWV4aXN0aW5nIHJ1bGUgJyVzJ1wiLCB6b25lTmFtZSwgaW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBmaW5kIGZpcnN0IHJ1bGUgdHJhbnNpdGlvbiB3aXRob3V0IERTVCBzbyB0aGF0IHdlIGhhdmUgYSBsZXR0ZXJcclxuICAgICAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHJ1bGUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQubm9uWmVybygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBsZXR0ZXIgPSAoX2EgPSBpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbihpbmZvLmZvcm1hdCwgZmFsc2UsIGxldHRlciksXHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBkdXJhdGlvbl8xLmhvdXJzKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogbGV0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiBpbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmYWxzZSwgXCJ0aW1lem9uZWNvbXBsZXRlLkFzc2VydGlvblwiLCBcIlVua25vd24gUnVsZVR5cGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUHJlLWNhbGN1bGF0ZSBhbGwgdHJhbnNpdGlvbnMgdW50aWwgdGhlcmUgYXJlIG9ubHkgJ21heCcgcnVsZXMgaW4gZWZmZWN0XHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcclxuICAgICAqIEBwYXJhbSBpbml0aWFsU3RhdGVcclxuICAgICAqIEBwYXJhbSB6b25lSW5mb3NcclxuICAgICAqIEBwYXJhbSBydWxlc1xyXG4gICAgICovXHJcbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl9jYWxjVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGluaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBpZiAoem9uZUluZm9zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1tdLCBbXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHdhbGsgdGhyb3VnaCB0aGUgem9uZSByZWNvcmRzIGFuZCBhZGQgYSB0cmFuc2l0aW9uIGZvciBlYWNoXHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gW107XHJcbiAgICAgICAgdmFyIHByZXZTdGF0ZSA9IGluaXRpYWxTdGF0ZTtcclxuICAgICAgICB2YXIgcHJldlVudGlsO1xyXG4gICAgICAgIHZhciBwcmV2UnVsZXM7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfNiA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfNi5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzZbX2ldO1xyXG4gICAgICAgICAgICAvLyB6b25lcyBjYW4gaGF2ZSBhIERTVCBvZmZzZXQgb3IgdGhleSBjYW4gcmVmZXIgdG8gYSBydWxlIHNldFxyXG4gICAgICAgICAgICBzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2VW50aWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0VXRjOiBwcmV2VW50aWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHpvbmVJbmZvLmZvcm1hdCwgZmFsc2UsIHVuZGVmaW5lZCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuTm9uZSA/IGR1cmF0aW9uXzEuaG91cnMoMCkgOiB6b25lSW5mby5ydWxlT2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogem9uZUluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlcy5nZXQoem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiWm9uZSAnJXMnIHJlZmVycyB0byBub24tZXhpc3RpbmcgcnVsZSAnJXMnXCIsIHpvbmVOYW1lLCB6b25lSW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSB0aGlzLl96b25lVHJhbnNpdGlvbnMocHJldlVudGlsLCB6b25lSW5mbywgcnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSBydWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChmYWxzZSwgXCJ0aW1lem9uZWNvbXBsZXRlLkFzc2VydGlvblwiLCBcIlVua25vd24gUnVsZVR5cGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldlVudGlsID0gem9uZUluZm8udW50aWwgIT09IHVuZGVmaW5lZCA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHpvbmVJbmZvLnVudGlsKSA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgcHJldlN0YXRlID0gdHJhbnNpdGlvbnMubGVuZ3RoID4gMCA/IHRyYW5zaXRpb25zW3RyYW5zaXRpb25zLmxlbmd0aCAtIDFdLm5ld1N0YXRlIDogcHJldlN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3RyYW5zaXRpb25zLCAoX2EgPSBwcmV2UnVsZXMgPT09IG51bGwgfHwgcHJldlJ1bGVzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcmV2UnVsZXMuZmluYWwpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFtdXTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYWxsIHRoZSB0cmFuc2l0aW9ucyBmb3IgYSB0aW1lIHpvbmUgZnJvbSBmcm9tVXRjIChpbmNsdXNpdmUpIHRvIHpvbmVJbmZvLnVudGlsIChleGNsdXNpdmUpLlxyXG4gICAgICogVGhlIHJlc3VsdCBhbHdheXMgY29udGFpbnMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGF0IGZyb21VdGMgdGhhdCBzaWduYWxzIHRoZSBzd2l0Y2ggdG8gdGhpcyBydWxlIHNldFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmcm9tVXRjIHByZXZpb3VzIHpvbmUgc3ViLXJlY29yZCBVTlRJTCB0aW1lOyB1bmRlZmluZWQgZm9yIGZpcnN0IHpvbmUgcmVjb3JkXHJcbiAgICAgKiBAcGFyYW0gem9uZUluZm8gdGhlIGN1cnJlbnQgem9uZSBzdWItcmVjb3JkXHJcbiAgICAgKiBAcGFyYW0gcnVsZSB0aGUgY29ycmVzcG9uZGluZyBydWxlIHRyYW5zaXRpb25zXHJcbiAgICAgKi9cclxuICAgIENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUuX3pvbmVUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uIChmcm9tVXRjLCB6b25lSW5mbywgcnVsZSkge1xyXG4gICAgICAgIC8vIGZyb20gdHotaG93LXRvLmh0bWw6XHJcbiAgICAgICAgLy8gT25lIHdyaW5rbGUsIG5vdCBmdWxseSBleHBsYWluZWQgaW4gemljLjgudHh0LCBpcyB3aGF0IGhhcHBlbnMgd2hlbiBzd2l0Y2hpbmcgdG8gYSBuYW1lZCBydWxlLiBUbyB3aGF0IHZhbHVlcyBzaG91bGQgdGhlIFNBVkUgYW5kXHJcbiAgICAgICAgLy8gTEVUVEVSIGRhdGEgYmUgaW5pdGlhbGl6ZWQ/XHJcbiAgICAgICAgLy8gLSBJZiBhdCBsZWFzdCBvbmUgdHJhbnNpdGlvbiBoYXMgaGFwcGVuZWQsIHVzZSB0aGUgU0FWRSBhbmQgTEVUVEVSIGRhdGEgZnJvbSB0aGUgbW9zdCByZWNlbnQuXHJcbiAgICAgICAgLy8gLSBJZiBzd2l0Y2hpbmcgdG8gYSBuYW1lZCBydWxlIGJlZm9yZSBhbnkgdHJhbnNpdGlvbiBoYXMgaGFwcGVuZWQsIGFzc3VtZSBzdGFuZGFyZCB0aW1lIChTQVZFIHplcm8pLCBhbmQgdXNlIHRoZSBMRVRURVIgZGF0YSBmcm9tXHJcbiAgICAgICAgLy8gdGhlIGVhcmxpZXN0IHRyYW5zaXRpb24gd2l0aCBhIFNBVkUgb2YgemVyby5cclxuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIC8vIGV4dHJhIGluaXRpYWwgdHJhbnNpdGlvbiBmb3Igc3dpdGNoIHRvIHRoaXMgcnVsZSBzZXQgKGJ1dCBub3QgZm9yIGZpcnN0IHpvbmUgaW5mbylcclxuICAgICAgICB2YXIgaW5pdGlhbDtcclxuICAgICAgICBpZiAoZnJvbVV0YyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBpbml0aWFsUnVsZVRyYW5zaXRpb24gPSBydWxlLmZpbmRMYXN0TGVzc0VxdWFsKGZyb21VdGMsIHpvbmVJbmZvLmdtdG9mZik7XHJcbiAgICAgICAgICAgIGlmIChpbml0aWFsUnVsZVRyYW5zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGluaXRpYWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXRVdGM6IGZyb21VdGMsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHpvbmVJbmZvLmZvcm1hdCwgZmFsc2UsIGluaXRpYWxSdWxlVHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IChfYSA9IGluaXRpYWxSdWxlVHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogZHVyYXRpb25fMS5ob3VycygwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbml0aWFsUnVsZVRyYW5zaXRpb24gPSBydWxlLmZpcnN0VHJhbnNpdGlvbldpdGhvdXREc3RBZnRlcihmcm9tVXRjLCB6b25lSW5mby5nbXRvZmYsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0VXRjOiBmcm9tVXRjLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiAoX2IgPSBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiB6b25lSW5mby5nbXRvZmZcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGluaXRpYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhY3R1YWwgcnVsZSB0cmFuc2l0aW9uczsga2VlcCBhZGRpbmcgdW50aWwgdGhlIGVuZCBvZiB0aGlzIHpvbmUgaW5mbywgb3IgdW50aWwgb25seSAnbWF4JyBydWxlcyByZW1haW5cclxuICAgICAgICB2YXIgcHJldkRzdCA9IChfYyA9IGluaXRpYWwgPT09IG51bGwgfHwgaW5pdGlhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5pdGlhbC5uZXdTdGF0ZS5kc3RPZmZzZXQpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IGR1cmF0aW9uXzEuaG91cnMoMCk7XHJcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gcnVsZS5maW5kRmlyc3QoKTtcclxuICAgICAgICB2YXIgZWZmZWN0aXZlID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSAmJiBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCB6b25lSW5mby5nbXRvZmYsIHByZXZEc3QpO1xyXG4gICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBlZmZlY3RpdmUgJiZcclxuICAgICAgICAgICAgKCh6b25lSW5mby51bnRpbCAmJiBlZmZlY3RpdmUudW5peE1pbGxpcyA8IHpvbmVJbmZvLnVudGlsKSB8fCAoIXpvbmVJbmZvLnVudGlsICYmICFpdGVyYXRvci5maW5hbCkpKSB7XHJcbiAgICAgICAgICAgIHByZXZEc3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldDtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgYXRVdGM6IGVmZmVjdGl2ZSxcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHpvbmVJbmZvLmZvcm1hdCwgcHJldkRzdC5ub25aZXJvKCksIGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcclxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IChfZCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfZCAhPT0gdm9pZCAwID8gX2QgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcHJldkRzdCxcclxuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogem9uZUluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHJ1bGUuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICBlZmZlY3RpdmUgPSBpdGVyYXRvciAmJiBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCB6b25lSW5mby5nbXRvZmYsIHByZXZEc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDYWNoZWRab25lVHJhbnNpdGlvbnM7XHJcbn0oKSk7XHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgdGhlIGZvcm1hdHRlZCBhYmJyZXZpYXRpb24gZm9yIGEgem9uZVxyXG4gKiBAcGFyYW0gZm9ybWF0IHRoZSBhYmJyZXZpYXRpb24gZm9ybWF0IHN0cmluZy4gRWl0aGVyICd6enosJyBmb3IgTlVMTDsgICdBL0InIGZvciBzdGQvZHN0LCBvciAnQSVzQicgZm9yIGEgZm9ybWF0IHN0cmluZyB3aGVyZSAlcyBpc1xyXG4gKiByZXBsYWNlZCBieSBhIGxldHRlclxyXG4gKiBAcGFyYW0gZHN0IHdoZXRoZXIgRFNUIGlzIG9ic2VydmVkXHJcbiAqIEBwYXJhbSBsZXR0ZXIgY3VycmVudCBydWxlIGxldHRlciwgZW1wdHkgaWYgbm8gcnVsZVxyXG4gKiBAcmV0dXJucyBmdWxseSBmb3JtYXR0ZWQgYWJicmV2aWF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiB6b25lQWJicmV2aWF0aW9uKGZvcm1hdCwgZHN0LCBsZXR0ZXIpIHtcclxuICAgIGlmIChmb3JtYXQgPT09IFwienp6LFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgICBpZiAoZm9ybWF0LmluY2x1ZGVzKFwiL1wiKSkge1xyXG4gICAgICAgIHJldHVybiAoZHN0ID8gZm9ybWF0LnNwbGl0KFwiL1wiKVsxXSA6IGZvcm1hdC5zcGxpdChcIi9cIilbMF0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGxldHRlcikge1xyXG4gICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBcIlwiKTtcclxufVxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSBVVEMgdGltZSBvZiBhIHJ1bGUgdHJhbnNpdGlvbiwgZ2l2ZW4gYSBwYXJ0aWN1bGFyIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdHJhbnNpdGlvblxyXG4gKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXQgem9uZSBvZmZzZXQgZnJvbSBVVFxyXG4gKiBAcGFyYW0gZHN0T2Zmc2V0IHByZXZpb3VzIERTVCBvZmZzZXQgZnJvbSBVVCtzdGFuZGFyZE9mZnNldFxyXG4gKiBAcmV0dXJucyBVVEMgdGltZVxyXG4gKi9cclxuZnVuY3Rpb24gcnVsZVRyYW5zaXRpb25VdGModHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIGRzdE9mZnNldCkge1xyXG4gICAgc3dpdGNoICh0cmFuc2l0aW9uLmF0VHlwZSkge1xyXG4gICAgICAgIGNhc2UgQXRUeXBlLlV0YzogcmV0dXJuIHRyYW5zaXRpb24uYXQ7XHJcbiAgICAgICAgY2FzZSBBdFR5cGUuU3RhbmRhcmQ6IHtcclxuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiB0aW1lIGlzIGluIHpvbmUgbG9jYWwgdGltZSB3aXRob3V0IERTVFxyXG4gICAgICAgICAgICB2YXIgbWlsbGlzID0gdHJhbnNpdGlvbi5hdC51bml4TWlsbGlzO1xyXG4gICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIEF0VHlwZS5XYWxsOiB7XHJcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aCBEU1RcclxuICAgICAgICAgICAgdmFyIG1pbGxpcyA9IHRyYW5zaXRpb24uYXQudW5peE1pbGxpcztcclxuICAgICAgICAgICAgbWlsbGlzIC09IHN0YW5kYXJkT2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgICAgICBpZiAoZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBtaWxsaXMgLT0gZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10ei1kYXRhYmFzZS5qcy5tYXAiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIERhdGUgYW5kIFRpbWUgdXRpbGl0eSBmdW5jdGlvbnMgLSBtYWluIGluZGV4XHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pKTtcclxudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9iYXNpY3NcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZGF0ZXRpbWVcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZHVyYXRpb25cIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZm9ybWF0XCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2dsb2JhbHNcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9sb2NhbGVcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vcGFyc2VcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vcGVyaW9kXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2Jhc2ljc1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90aW1lc291cmNlXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpLCBleHBvcnRzKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQXRUeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLkF0VHlwZTsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaXNWYWxpZE9mZnNldFN0cmluZ1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5pc1ZhbGlkT2Zmc2V0U3RyaW5nOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJOb3JtYWxpemVPcHRpb25cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJSdWxlSW5mb1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5SdWxlSW5mbzsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiUnVsZVR5cGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuUnVsZVR5cGU7IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIk9uVHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5PblR5cGU7IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlRvVHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5Ub1R5cGU7IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlRyYW5zaXRpb25cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHJhbnNpdGlvbjsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiVHpEYXRhYmFzZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJab25lSW5mb1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5ab25lSW5mbzsgfSB9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl19
